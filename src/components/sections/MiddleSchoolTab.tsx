import React, { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Cpu, Database, Users } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  BLOCK_OPTIONS,
  CORE_DOMAIN_ASSUMPTIONS,
  DEFAULT_MAX_TEACHING_LOAD,
  DEFAULT_MIN_VIABLE_LOAD,
  DEFAULT_MS_SECTIONS_BY_GRADE,
  LOAD_THRESHOLD_OPTIONS,
  MS_GRADE_LABELS,
  PROGRAM_FUNCTION_ASSUMPTIONS,
  SECTION_COUNT_OPTIONS,
  createDefaultDomainSlotsPerSection,
  createDefaultProgramSlotsPerSection,
  deriveEducatorLoadRows,
  deriveGrade6ClusterInsight,
  deriveProgramFunctionRows,
  formatSlotList,
  getActiveGrades,
  getActiveStage,
  getTotalMiddleSchoolSections,
  getValidationStatus,
  getValidationWarnings,
} from "./middleSchoolLoadModel";
import type {
  CoreDomainId,
  MiddleSchoolGrade,
  MiddleSchoolSectionsByGrade,
  ProgramFunctionId,
  SectionCount,
} from "./middleSchoolLoadModel";

const Card = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  actions,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div className={cn("bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)} style={style}>
    {title && (
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />}
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

const MS_OWNERSHIP_PROGRESSION = [
  {
    stage: "Grade 6",
    model: "Cluster launch with explicit subject ownership.",
    details: [
      "Some domains may be combined for load viability.",
      "Mathematics + Natural Sciences can be combined if complemented by Pathways, Advisory, STEAM elective, Project Mentorship, scientific inquiry, documentation, or critique cycles.",
      "Passion Projects begin in Grade 6; Project Mentorship is a coordinated function, not automatic payroll.",
    ],
  },
  {
    stage: "Grade 7",
    model: "Hybrid specialization.",
    details: [
      "Mathematics, Portuguese, and English Language Arts become viable full-load domains in a two-section Grades 6-7 model.",
      "Natural Sciences becomes dedicated but still needs complementary load.",
      "Social Sciences becomes dedicated but still needs complementary load.",
    ],
  },
  {
    stage: "Grade 8",
    model: "Core-subject specialist model, not cluster-based.",
    details: [
      "Babson EPIC Certificate replaces Passion Projects as the main Grade 8 project-based entrepreneurship experience.",
      "Mathematics, Portuguese, and English Language Arts each require two balanced educators in the two-section Grades 6-8 model.",
      "Natural Sciences and Social Sciences each become viable one-educator subject-specialist loads.",
      "Program functions continue: Babson EPIC, Pathways, Advisory, Electives, documentation, portfolio evidence, critique cycles, and external-facing presentation routines.",
    ],
  },
];

const CORE_EDUCATOR_BUILD_UP_STAGES: Array<{
  stage: string;
  config: MiddleSchoolSectionsByGrade;
  interpretation: string[];
  programFunctions: string[];
}> = [
  {
    stage: "Grade 6 launch",
    config: { g6: 2, g7: 0, g8: 0 },
    interpretation: [
      "Grade 6 has two valid planning lenses: 5 core subject-domain rows in the simulator and 3 educator clusters in the launch architecture.",
      "The 3 clusters are not automatically 3 fully loaded educators. See the Grade 6 Cluster Architecture slot-gap explanation below.",
    ],
    programFunctions: [
      "Passion Project / Project Mentorship",
      "Pathways",
      "Advisory",
      "Global Expression & Leadership",
      "Body & Movement",
      "Electives / Creative Hub",
    ],
  },
  {
    stage: "Grades 6–7 active",
    config: { g6: 2, g7: 2, g8: 0 },
    interpretation: [
      "Mathematics, Portuguese, and ELA reach the 24-slot minimum threshold at 2 sections per grade.",
      "Natural Sciences and Social Sciences still require complementary load or explicit allocation. This remains threshold-sensitive.",
    ],
    programFunctions: [
      "Passion Project / Project Mentorship",
      "Pathways",
      "Advisory",
      "Global Expression & Leadership",
      "Body & Movement",
      "Electives / Creative Hub",
    ],
  },
  {
    stage: "Grades 6–8 active",
    config: { g6: 2, g7: 2, g8: 2 },
    interpretation: [
      "Full Middle School core subject-domain model implies 8 core educators at 2 sections per grade. This is the primary model-derived number for core subject educators.",
      "It is not payroll authorization, final FTE, final headcount, or hiring approval. It does not automatically include program-function load or distributed responsibilities.",
    ],
    programFunctions: [
      "Babson EPIC replacing Passion Project in Grade 8",
      "Pathways",
      "Advisory",
      "Global Expression & Leadership",
      "Body & Movement",
      "Electives / Creative Hub",
      "Project/advisory/pathways commitments",
    ],
  },
];

const CORE_DOMAIN_LEADERSHIP_LABELS: Record<string, string> = {
  Mathematics: "Integrated Mathematics",
  "Natural Sciences": "Natural Sciences",
  Portuguese: "Língua Portuguesa",
  "Social Sciences": "Social Sciences",
  "English Language Arts": "English Language Arts",
};

const GRADE_6_CLUSTER_INSIGHTS = [
  {
    name: "STEM Cluster",
    includes: ["Integrated Mathematics", "Natural Sciences"],
    slotFormula: "Math 6 + Natural Sciences 4 = 10 slots / section",
    sectionFormula: "10 × 2 sections = 20 slots",
    slotsPerSection: 10,
    slotsAcrossTwoSections: 20,
    contactHoursAcrossTwoSections: 15,
    gapToMinimum: 4,
    implication: "Near viable load; requires 4 complementary slots to reach the 24-slot minimum.",
  },
  {
    name: "Humanities Cluster",
    includes: ["Língua Portuguesa", "Social Sciences"],
    slotFormula: "Portuguese 6 + Social Sciences 4 = 10 slots / section",
    sectionFormula: "10 × 2 sections = 20 slots",
    slotsPerSection: 10,
    slotsAcrossTwoSections: 20,
    contactHoursAcrossTwoSections: 15,
    gapToMinimum: 4,
    implication: "Near viable load; requires 4 complementary slots to reach the 24-slot minimum.",
  },
  {
    name: "Global Studies / ELA & Projects Cluster",
    includes: ["English Language Arts", "Passion Project", "Pathways", "Global Expression & Leadership"],
    slotFormula: "ELA 6 + Passion Project 2 + Pathways 1 + Global Expression 2 = 11 slots / section",
    sectionFormula: "11 × 2 sections = 22 slots",
    slotsPerSection: 11,
    slotsAcrossTwoSections: 22,
    contactHoursAcrossTwoSections: 16.5,
    gapToMinimum: 2,
    implication: "Closest to minimum viable load; requires 2 complementary slots to reach the 24-slot minimum.",
  },
];

const PROJECT_GROUPS_PER_SECTION_DEFAULT = 6;
const PROJECT_GROUPS_PER_SECTION_MIN = 4;
const PROJECT_GROUPS_PER_SECTION_MAX = 8;
const PROJECT_MAX_GROUPS_PER_EDUCATOR = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Subnavigation
// ─────────────────────────────────────────────────────────────────────────────

type MiddleSchoolView =
  | "executive-view"
  | "decision-frame"
  | "core-build-up"
  | "grade-6-cluster"
  | "program-load"
  | "scenario-comparison"
  | "ms-hs-boundary"
  | "load-logic"
  | "program-table"
  | "supporting-context";

const middleSchoolViews: Array<{ id: MiddleSchoolView; label: string }> = [
  { id: "executive-view",      label: "01 Executive View" },
  { id: "decision-frame",      label: "02 Decision Frame" },
  { id: "core-build-up",       label: "03 Core Build-Up" },
  { id: "grade-6-cluster",     label: "04 Grade 6 Cluster" },
  { id: "program-load",        label: "05 Program Load" },
  { id: "scenario-comparison", label: "06 Scenario Comparison" },
  { id: "ms-hs-boundary",      label: "07 MS-to-HS Boundary" },
  { id: "load-logic",          label: "08 Load Logic" },
  { id: "program-table",       label: "09 Program Table" },
  { id: "supporting-context",  label: "10 Supporting Context" },
];

type MiddleSchoolTabProps = {
  sections: number;
  setSections: (s: number) => void;
};

const MiddleSchoolTab = (_props: MiddleSchoolTabProps) => {
  const [msSectionsByGrade, setMsSectionsByGrade] = useState<MiddleSchoolSectionsByGrade>(DEFAULT_MS_SECTIONS_BY_GRADE);
  const [minViableLoad, setMinViableLoad] = useState(DEFAULT_MIN_VIABLE_LOAD);
  const [maxTeachingLoad, setMaxTeachingLoad] = useState(DEFAULT_MAX_TEACHING_LOAD);
  const [domainSlotsPerSection, setDomainSlotsPerSection] = useState<Record<CoreDomainId, number>>(
    createDefaultDomainSlotsPerSection,
  );
  const [programSlotsPerSection, setProgramSlotsPerSection] = useState<Record<ProgramFunctionId, number>>(
    createDefaultProgramSlotsPerSection,
  );
  const [advancedAssumptionsOpen, setAdvancedAssumptionsOpen] = useState(false);
  const [activeView, setActiveView] = useState<MiddleSchoolView>("executive-view");

  const viewClassName = (view: MiddleSchoolView) =>
    cn("ms-view-section", activeView !== view && "ms-screen-inactive");

  const activeGrades = useMemo(
    () => getActiveGrades(msSectionsByGrade),
    [msSectionsByGrade],
  );
  const totalMiddleSchoolSections = getTotalMiddleSchoolSections(activeGrades, msSectionsByGrade);
  const validationWarnings = useMemo(
    () => getValidationWarnings({
      sectionsByGrade: msSectionsByGrade,
      totalMiddleSchoolSections,
      minViableLoad,
      maxTeachingLoad,
    }),
    [maxTeachingLoad, minViableLoad, msSectionsByGrade, totalMiddleSchoolSections],
  );
  const activeStage = useMemo(
    () => getActiveStage(msSectionsByGrade, totalMiddleSchoolSections),
    [msSectionsByGrade, totalMiddleSchoolSections],
  );
  const validationStatus = getValidationStatus(validationWarnings);
  const educatorLoadRows = useMemo(
    () => deriveEducatorLoadRows({
      activeGrades,
      sectionsByGrade: msSectionsByGrade,
      domainSlotsPerSection,
      minViableLoad,
      maxTeachingLoad,
    }),
    [activeGrades, domainSlotsPerSection, maxTeachingLoad, minViableLoad, msSectionsByGrade],
  );
  const programFunctionRows = useMemo(
    () => deriveProgramFunctionRows(msSectionsByGrade, programSlotsPerSection),
    [msSectionsByGrade, programSlotsPerSection],
  );
  const grade6ClusterInsight = useMemo(
    () => deriveGrade6ClusterInsight({
      sectionsByGrade: msSectionsByGrade,
      domainSlotsPerSection,
      minViableLoad,
    }),
    [domainSlotsPerSection, minViableLoad, msSectionsByGrade],
  );

  const coreEducatorBuildUp = useMemo(() => (
    CORE_EDUCATOR_BUILD_UP_STAGES.map((stage) => {
      const stageActiveGrades = getActiveGrades(stage.config);
      const coreDomainRows = deriveEducatorLoadRows({
        activeGrades: stageActiveGrades,
        sectionsByGrade: stage.config,
        domainSlotsPerSection,
        minViableLoad,
        maxTeachingLoad,
      }).map((row) => ({
        ...row,
        domain: CORE_DOMAIN_LEADERSHIP_LABELS[row.domain] ?? row.domain,
      }));
      return {
        ...stage,
        activeGrades: stageActiveGrades,
        coreDomainRows,
        coreEducatorsImplied: coreDomainRows.reduce((sum, row) => sum + row.educatorsNeeded, 0),
      };
    })
  ), [domainSlotsPerSection, maxTeachingLoad, minViableLoad]);

  const educatorCountSummary = useMemo(() => {
    const scenarios: Array<{
      stage: string;
      sectionsLabel: string;
      config: MiddleSchoolSectionsByGrade;
      specialistSignal: string;
      interpretation: string;
    }> = [
      {
        stage: "Grade 6 launch",
        sectionsLabel: "1 section",
        config: { g6: 1, g7: 0, g8: 0 },
        specialistSignal: "Separate specialist/program allocation required",
        interpretation: "Cluster model required; domain-row count should not be read as separate subject hires.",
      },
      {
        stage: "Grade 6 launch",
        sectionsLabel: "2 sections",
        config: { g6: 2, g7: 0, g8: 0 },
        specialistSignal: "Separate specialist/program allocation required",
        interpretation: "Three-cluster launch premise becomes visible; complementary program load remains necessary.",
      },
      {
        stage: "Grades 6–7 active",
        sectionsLabel: "1 section per grade",
        config: { g6: 1, g7: 1, g8: 0 },
        specialistSignal: "Program-function allocation required",
        interpretation: "Still threshold-sensitive; several domains remain below minimum viable load.",
      },
      {
        stage: "Grades 6–7 active",
        sectionsLabel: "2 sections per grade",
        config: { g6: 2, g7: 2, g8: 0 },
        specialistSignal: "Program-function allocation required",
        interpretation: "Mathematics, Portuguese, and ELA approach viable full-load domains at 24 slots each.",
      },
      {
        stage: "Grades 6–8 active",
        sectionsLabel: "1 section per grade",
        config: { g6: 1, g7: 1, g8: 1 },
        specialistSignal: "Specialist + distributed responsibilities required",
        interpretation: "Broader grade span improves domain stability but remains section-count sensitive.",
      },
      {
        stage: "Grades 6–8 active",
        sectionsLabel: "2 sections per grade",
        config: { g6: 2, g7: 2, g8: 2 },
        specialistSignal: "Specialist + distributed responsibilities required",
        interpretation: "Subject-domain model becomes stronger; specialist/program-function load still needs explicit allocation.",
      },
    ];
    return scenarios.map((scenario) => {
      const stageActiveGrades = getActiveGrades(scenario.config);
      const rows = deriveEducatorLoadRows({
        activeGrades: stageActiveGrades,
        sectionsByGrade: scenario.config,
        domainSlotsPerSection,
        minViableLoad,
        maxTeachingLoad,
      });
      const coreEducatorsImplied = rows.reduce((sum, row) => sum + row.educatorsNeeded, 0);
      return { ...scenario, coreEducatorsImplied };
    });
  }, [domainSlotsPerSection, maxTeachingLoad, minViableLoad]);

  const currentCoreEducators = educatorLoadRows.reduce((sum, row) => sum + row.educatorsNeeded, 0);

  const projectBlockDemand = useMemo(() => {
    const totalActiveSections = msSectionsByGrade.g6 + msSectionsByGrade.g7 + msSectionsByGrade.g8;
    const totalProjectGroups = totalActiveSections * PROJECT_GROUPS_PER_SECTION_DEFAULT;
    const minimumProjectGroups = totalActiveSections * PROJECT_GROUPS_PER_SECTION_MIN;
    const maximumProjectGroups = totalActiveSections * PROJECT_GROUPS_PER_SECTION_MAX;
    return {
      totalActiveSections,
      groupsPerSectionDefault: PROJECT_GROUPS_PER_SECTION_DEFAULT,
      groupsPerSectionMin: PROJECT_GROUPS_PER_SECTION_MIN,
      groupsPerSectionMax: PROJECT_GROUPS_PER_SECTION_MAX,
      maxGroupsPerEducator: PROJECT_MAX_GROUPS_PER_EDUCATOR,
      totalProjectGroups,
      simultaneousEducatorsRequired: Math.ceil(totalProjectGroups / PROJECT_MAX_GROUPS_PER_EDUCATOR),
      minimumProjectGroups,
      maximumProjectGroups,
      minimumSimultaneousEducatorsRequired: Math.ceil(minimumProjectGroups / PROJECT_MAX_GROUPS_PER_EDUCATOR),
      maximumSimultaneousEducatorsRequired: Math.ceil(maximumProjectGroups / PROJECT_MAX_GROUPS_PER_EDUCATOR),
    };
  }, [msSectionsByGrade]);

  return (
    <>
      <style>{`
        .ms-screen-inactive {
          position: absolute !important;
          left: -99999px !important;
          top: auto !important;
          width: 1px !important;
          height: 1px !important;
          overflow: hidden !important;
        }
      `}</style>

      <section className="rounded-[2.25rem] bg-[#f5f0e7] p-3 text-slate-950 shadow-sm md:p-4">
        <div className="grid min-h-[760px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* ── Left aside nav ── */}
          <aside className="rounded-[2rem] bg-[#1a2035] p-5 text-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-[720px]">
            <div className="flex h-full flex-col">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-100/60">
                  Rio Strategic Architecture
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight">
                  Middle School
                </h2>
                <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-100/60">
                  Grade activation · cluster architecture · educator-count signals.
                </p>
              </div>

              <nav className="mt-8 hidden space-y-1 lg:block">
                {middleSchoolViews.map((view) => (
                  <button
                    key={`ms-rail-${view.id}`}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all",
                      activeView === view.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-100/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {view.label}
                  </button>
                ))}
              </nav>

              <div className="mt-6 rounded-[1.75rem] bg-white/10 p-4 lg:mt-auto">
                <div className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-100/60">
                  Planning status
                </div>
                <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-100/70">
                  Instructional-capacity signals only. Not payroll authorization, final FTE, final headcount, or hiring approval.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Right main content ── */}
          <main className="rounded-[2rem] bg-[#fbfaf7] p-4 md:p-6 xl:p-8">

            {/* Mobile nav */}
            <div className="mb-6 rounded-[1.75rem] bg-white p-2 lg:hidden">
              <div className="grid grid-cols-2 gap-2">
                {middleSchoolViews.map((view) => (
                  <button
                    key={`ms-mobile-${view.id}`}
                    type="button"
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      "rounded-2xl px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider transition-all",
                      activeView === view.id
                        ? "bg-slate-900 text-white"
                        : "bg-[#f5f0e7] text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {view.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                01  EXECUTIVE VIEW
                Sustainable Middle School Growth Model
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("executive-view"), "space-y-6")}>

              {/* Section 1: Executive claim */}
              <div className="space-y-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-blue-500">
                    Middle School · Executive View
                  </div>
                  <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900">
                    Executive View: Sustainable Middle School Growth Model
                  </h2>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 space-y-3">
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    Middle School sustainability comes from designing educator functions before formalizing staffing roles.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The model does not begin with job titles. It begins with instructional functions: core subject load, cluster viability, signature Middle School experiences, advisory/pathways ownership, and bridge constraints.
                  </p>
                </div>
              </div>

              {/* Section 2: Grade 6 operating logic */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-blue-500 rounded-full shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900">Grade 6 operating logic</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Five core subject-domain loads</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Grade 6 has five core subject-domain loads:
                    </p>
                    <ul className="space-y-1.5">
                      {["Integrated Mathematics", "Natural Sciences", "Língua Portuguesa", "Social Sciences", "English Language Arts"].map((domain) => (
                        <li key={domain} className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                          {domain}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Three educator clusters for launch</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      For launch, these five core subject-domain loads are organized through three educator clusters:
                    </p>
                    <ul className="space-y-2">
                      {[
                        { name: "STEM", detail: "Integrated Mathematics + Natural Sciences" },
                        { name: "Humanities", detail: "Língua Portuguesa + Social Sciences" },
                        { name: "Global Studies / ELA & Projects", detail: "English Language Arts + Passion Project + Pathways + Global Expression & Leadership" },
                      ].map((cluster) => (
                        <li key={cluster.name} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-800">{cluster.name}</div>
                          <div className="text-[10px] text-slate-500 leading-relaxed">{cluster.detail}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                  This does not mean three fully loaded educators. The cluster model organizes instructional responsibility, while the slot math still shows gaps to the 24-slot minimum.
                </div>
              </div>

              {/* Section 3: Stage implications */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-blue-500 rounded-full shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900">Stage implications</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-1">Stage</div>
                      <div className="text-sm font-black text-slate-900">Grade 6 launch</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Core educator signal</div>
                      <div className="text-lg font-black text-slate-900">5 core subject-domain rows</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">in the simulator (2 sections, Grade 6 only)</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Operating design</div>
                        <p className="text-[10px] text-slate-700 leading-relaxed">Five domain loads organized through three clusters.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Sustainability logic</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Signature functions begin as part of educator role design, not as leftover work.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 space-y-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Stage</div>
                      <div className="text-sm font-black text-slate-900">Grades 6–7 active</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Core educator signal</div>
                      <div className="text-lg font-black text-slate-900">5 core educators</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">core subject-domain signal at 2 sections per grade</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Operating design</div>
                        <p className="text-[10px] text-slate-700 leading-relaxed">Math, Portuguese, and ELA approach viable load; Natural Sciences and Social Sciences remain threshold-sensitive.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Sustainability logic</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Program-function allocation remains explicit as the division expands.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 space-y-4">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-purple-600 mb-1">Stage</div>
                      <div className="text-sm font-black text-slate-900">Grades 6–8 active</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Core educator signal</div>
                      <div className="text-lg font-black text-slate-900">8 core educators</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">core subject-domain signal at 2 sections per grade</div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Operating design</div>
                        <p className="text-[10px] text-slate-700 leading-relaxed">Full Middle School core subject-domain model across two sections per grade.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Sustainability logic</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Stronger division structure, but still not automatic High School capacity.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Why this is sustainable */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-blue-500 rounded-full shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900">Why this can be sustainable</h3>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                    The sustainability logic is not lean staffing by subtraction. It is function-first educator design.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    In Grade 6, educators are not only subject deliverers. Their roles are intentionally distributed to include ownership of the experiences that define the Middle School culture: Passion Projects, Pathways, Advisory, Global Expression, documentation, and student-facing routines.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This creates a balance between premium service and financial discipline: the model protects the signature learner experience without multiplying narrow roles before section count and grade progression justify them.
                  </p>
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-blue-800">
                    Inspired by São Paulo's operating logic, the Rio model prioritizes educator function before role multiplication: domain teaching, signature-program ownership, advisory/pathways routines, documentation, and bridge constraints are designed together before assumptions become staffing.
                  </div>
                </div>
              </div>

              {/* Section 5: What still requires explicit allocation */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-purple-400 rounded-full shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900">What still requires explicit allocation</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  These are not leftover tasks. They are program-function responsibilities that require explicit allocation and schedule validation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    "Passion Projects / Project Mentorship",
                    "Pathways",
                    "Advisory",
                    "Global Expression & Leadership",
                    "Body & Movement",
                    "Electives / Creative Hub",
                    "Learning documentation and student-facing routines",
                    "Babson EPIC when Grade 8 is active",
                    "Any MS-to-HS bridge/share arrangement",
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 flex items-start gap-2">
                      <ChevronRight className="h-3 w-3 text-purple-300 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-medium text-slate-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Boundary conditions */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1 bg-amber-400 rounded-full shrink-0" />
                  <h3 className="text-lg font-bold text-slate-900">Boundary conditions</h3>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                  <ul className="space-y-2">
                    {[
                      "These are instructional-capacity signals only.",
                      "Not payroll authorization.",
                      "Not final FTE.",
                      "Not final headcount.",
                      "Not hiring approval.",
                      "Three Grade 6 clusters are not automatically three fully loaded educators.",
                      "Program-function load is not automatically absorbed into core educator count.",
                      "Middle School load space is not automatic High School capacity.",
                      "Any Grade 9 bridge/share requires validation through the Grade 9 Capacity Ledger and Grade 9 Mock Schedule.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[10px] font-medium text-amber-900 leading-relaxed">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════
                02  DECISION FRAME
                Scenario Offers Connection
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("decision-frame"))}>
              <div className="space-y-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-blue-500 rounded-full shrink-0" />
                  <h4 className="text-sm font-bold text-slate-900">Scenario Offers Connection</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This tab translates the Scenario Offers architecture into Middle School instructional capacity: grade activation, section progression, educator clusters, program-function load, and educator-count signals.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  This pass keeps the tabs decoupled: no Scenario Offers data is imported, and no shared state is created.
                </p>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    The educator-count summary below tests the instructional implications of the opening stages rather than approving staffing.
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Grade 6 launch is the first Middle School translation layer: clusters convert the scenario stage into teachable instructional capacity.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-blue-200 bg-white p-4 space-y-2">
                    <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Decision layer</div>
                    <h5 className="text-xs font-bold text-slate-900">Scenario Offers decision layer</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Defines when Middle School activates and which grades/sections are included.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-white p-4 space-y-2">
                    <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Translation layer</div>
                    <h5 className="text-xs font-bold text-slate-900">Middle School translation layer</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Converts the scenario into Grade 6 cluster architecture, load by grade, educator-count signals, and program-function planning.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-white p-4 space-y-2">
                    <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Downstream layer</div>
                    <h5 className="text-xs font-bold text-slate-900">Downstream planning layer</h5>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Feeds later validation work: section scaling, specialist allocation, project/advisory/pathways load, and eventual MS-to-HS bridge feasibility.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-blue-400 rounded-full shrink-0" />
                    <h5 className="text-xs font-bold text-slate-900">Middle School Opening Stages</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Grade 6 launch</div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Scenario relationship</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Middle School launch stage in Scenario Offers architecture. Scenario D activates Grade 6 and the Designers learning engine.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Middle School translation</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Grade 6 cluster architecture, 1–2 sections, educator-count signal, program-function load.</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Grades 6–7 active</div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Scenario relationship</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Middle School expansion stage within the Scenario Offers architecture.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Middle School translation</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Domain viability becomes clearer; Mathematics, Portuguese, and ELA approach viable full-load domains at 2 sections per grade.</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Grades 6–8 active</div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Scenario relationship</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Full Middle School span within the Scenario Offers architecture.</p>
                      </div>
                      <div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Middle School translation</div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Subject-domain model strengthens; specialist/program-function allocation still requires explicit planning.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                  Scenario Offers defines the architectural stage. The Middle School tab translates that stage into instructional-capacity signals. The values here remain planning premises, not payroll authorization, final FTE, final headcount, or hiring approval.
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                02  CORE BUILD-UP
                Core Educator Build-Up by Grade Stage
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("core-build-up"), "space-y-5")}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Core Educator Build-Up by Grade Stage</h3>
                  <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-500">
                    This section replaces the hardcoded roadmap premise with model-derived core educator logic. Counts are based on core subject-domain teaching slots and the current teaching-load thresholds.
                  </p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                <p>Core educators implied are instructional-capacity signals only. They are not payroll authorization, final FTE, final headcount, or hiring approval.</p>
                <p>Program-function load and distributed responsibilities require explicit allocation and are not automatically absorbed into core educator count.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {coreEducatorBuildUp.map((stage) => (
                  <Card key={stage.stage} className="h-full border border-slate-100 shadow-sm">
                    <div className="space-y-4">
                      {/* Stage identifier */}
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600">{stage.stage}</div>
                        <div className="mt-2 text-[10px] font-medium text-slate-500">
                          Active grades: {stage.activeGrades.map((grade) => MS_GRADE_LABELS[grade]).join(", ")}
                        </div>
                        <div className="mt-1 text-[10px] font-medium text-slate-500">
                          Section scenario: 2 sections per active grade
                        </div>
                        <div className="mt-1 text-[9px] font-mono text-slate-400">
                          G6:{stage.config.g6} · G7:{stage.config.g7} · G8:{stage.config.g8}
                        </div>
                      </div>
                      {/* Core educators implied — visually dominant, positioned before slot math */}
                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                        <div className="text-[8px] font-bold uppercase tracking-widest text-blue-500">Core educators implied</div>
                        <div className="mt-1 text-3xl font-bold text-blue-800">{stage.coreEducatorsImplied} core educators</div>
                        <div className="text-[10px] font-medium text-blue-600 mt-0.5">instructional-capacity signal only</div>
                      </div>
                      {/* Domain slot rows — supporting evidence */}
                      <div>
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Core teaching slots by domain</div>
                        <div className="space-y-1.5">
                          {stage.coreDomainRows.map((row) => (
                            <div key={`${stage.stage}-${row.domain}`} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed">
                              <span className="font-medium text-slate-600">{row.domain}: {row.weeklyCoreSlots} slots</span>
                              <span className="shrink-0 font-bold text-blue-700">→ {row.educatorsNeeded} educator{row.educatorsNeeded === 1 ? "" : "s"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Program-function load and distributed responsibilities */}
                      <div>
                        <div className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Possible program-function load and distributed responsibilities</div>
                        <ul className="space-y-1">
                          {stage.programFunctions.map((programFunction) => (
                            <li key={`${stage.stage}-${programFunction}`} className="flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                              <ChevronRight className="mt-0.5 h-2.5 w-2.5 shrink-0 text-blue-300" />
                              {programFunction}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Interpretation — visually separated */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400">Interpretation</div>
                        <div className="space-y-1.5">
                          {stage.interpretation.map((item) => (
                            <p key={`${stage.stage}-${item}`} className="text-[10px] leading-relaxed text-slate-500">{item}</p>
                          ))}
                        </div>
                      </div>
                      <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-medium leading-relaxed text-amber-800">
                        These responsibilities require explicit allocation and are not leftover capacity.
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                03  GRADE 6 CLUSTER
                Grade 6 Cluster Architecture
                Visible when Grade 6 only is active in the simulator.
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("grade-6-cluster"))}>
              {grade6ClusterInsight.active ? (
                <div className="space-y-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-blue-500 rounded-full shrink-0" />
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600 mb-0.5">Grade 6 Launch Architecture · visible when Grade 6 only is active</div>
                      <h3 className="text-xl font-bold text-slate-900">Grade 6 Cluster Architecture</h3>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Grade 6 can be organized through 3 educator clusters, but these are not automatically 3 fully loaded educators. Each cluster still has a gap to the 24-slot minimum, so complementary program-function load or explicit allocation is required.
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Grade 6 has two valid planning lenses: 5 core subject-domain rows in the simulator and 3 educator clusters in the launch architecture. The domain rows capture per-subject load; the clusters capture how Grade 6 instruction can be organized before subject specialization deepens.
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    World Language is excluded from this Grade 6 model. Each slot equals 45 minutes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {GRADE_6_CLUSTER_INSIGHTS.map((cluster) => (
                      <div key={cluster.name} className="rounded-2xl border border-blue-200 bg-white p-4 space-y-3">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grade 6 Cluster</div>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">{cluster.name}</h5>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Includes</div>
                          <ul className="space-y-1">
                            {cluster.includes.map((area) => (
                              <li key={area} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                                <ChevronRight className="h-2.5 w-2.5 text-blue-300 shrink-0 mt-0.5" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono font-medium text-slate-700 bg-slate-50 rounded-lg px-2 py-1.5 leading-relaxed">{cluster.slotFormula}</p>
                          <p className="text-[10px] font-mono font-medium text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5 leading-relaxed">{cluster.sectionFormula}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Slots / section</div>
                            <div className="text-sm font-bold text-slate-900">{cluster.slotsPerSection}</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Slots, 2 sections</div>
                            <div className="text-sm font-bold text-slate-900">{cluster.slotsAcrossTwoSections}</div>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-2 border border-blue-100">
                            <div className="text-[8px] font-bold text-blue-500 uppercase mb-0.5">Min viable load</div>
                            <div className="text-sm font-bold text-blue-700">24 slots</div>
                          </div>
                          <div className="bg-amber-50 rounded-xl p-2 border border-amber-100">
                            <div className="text-[8px] font-bold text-amber-500 uppercase mb-0.5">Gap to min</div>
                            <div className="text-sm font-bold text-amber-700">{cluster.gapToMinimum} slots</div>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">{cluster.implication}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-medium text-slate-600">
                    Grade 6 total: 38 slots per section, 76 slots across 2 sections, 57 weekly contact hours.
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                    These are instructional-capacity planning signals, not payroll authorization, final FTE, final headcount, or hiring approval.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Grade 6 Launch Architecture</div>
                  <h3 className="text-xl font-bold text-slate-900">Grade 6 Cluster Architecture</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Grade 6 Cluster Architecture is visible when the simulator is set to Grade 6 only
                    (Grade 7 and Grade 8 sections = 0). Adjust the grade section controls in Load Logic to activate this view.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("load-logic")}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Go to Load Logic →
                  </button>
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════
                04  PROGRAM LOAD
                Project / Advisory / Pathways Demand
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("program-load"))}>
              <div className="space-y-5 rounded-2xl border border-purple-100 bg-purple-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-purple-400 rounded-full shrink-0" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-purple-600 mb-0.5">Program-Function Load</div>
                    <h3 className="text-xl font-bold text-slate-900">Project / Advisory / Pathways Demand</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Project, advisory, and pathways load must be explicitly allocated. These functions are not leftover capacity.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  The educator-count summary counts core subject educators separately; this panel makes the distributed project/advisory/pathways demand visible.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Project/advisory/pathways commitments must be checked before interpreting load space as Grade 9 bridge/share feasibility.
                </p>

                {projectBlockDemand.totalActiveSections === 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium text-amber-800">
                    No active Middle School sections selected.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Active Middle School sections</div>
                        <div className="text-xl font-bold text-slate-900">{projectBlockDemand.totalActiveSections}</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Default groups per section</div>
                        <div className="text-xl font-bold text-slate-900">{projectBlockDemand.groupsPerSectionDefault}</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Range of groups per section</div>
                        <div className="text-xl font-bold text-slate-900">{projectBlockDemand.groupsPerSectionMin}–{projectBlockDemand.groupsPerSectionMax}</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-3">
                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Max groups per educator</div>
                        <div className="text-xl font-bold text-slate-900">{projectBlockDemand.maxGroupsPerEducator}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl border border-purple-200 p-4">
                        <div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-3">Default demand</div>
                        <div className="flex gap-6 flex-wrap">
                          <div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Total project groups</div>
                            <div className="text-2xl font-bold text-slate-900">{projectBlockDemand.totalProjectGroups}</div>
                          </div>
                          <div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Simultaneous educators required</div>
                            <div className="text-2xl font-bold text-purple-700">{projectBlockDemand.simultaneousEducatorsRequired}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3">Demand range</div>
                        <div className="flex gap-6 flex-wrap">
                          <div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Min groups / simultaneous</div>
                            <div className="text-lg font-bold text-slate-700">{projectBlockDemand.minimumProjectGroups} / {projectBlockDemand.minimumSimultaneousEducatorsRequired}</div>
                          </div>
                          <div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Max groups / simultaneous</div>
                            <div className="text-lg font-bold text-slate-700">{projectBlockDemand.maximumProjectGroups} / {projectBlockDemand.maximumSimultaneousEducatorsRequired}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      This is simultaneous educator availability in a fixed or coordinated project block, not a hiring count.
                    </p>
                  </>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1.5">
                    <div className="text-[9px] font-bold text-slate-700">Passion Project / Project Mentorship</div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Requires group capacity, profile fit, and schedule fit. It is not a separate mentor hire by default.</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1.5">
                    <div className="text-[9px] font-bold text-slate-700">Pathways</div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Requires explicit student-contact or coordination allocation. It should not be treated as leftover capacity.</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-1.5">
                    <div className="text-[9px] font-bold text-slate-700">Advisory</div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Distributed student-support/contact responsibility. It is distinct from Passion Project and Pathways.</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {msSectionsByGrade.g8 > 0
                    ? "In Grade 8, Babson EPIC replaces Passion Project. The project-demand logic remains a planning signal for coordinated project/advisory load."
                    : "When Grade 8 becomes active, Babson EPIC replaces Passion Project; project-demand logic remains a planning signal for coordinated project/advisory load."}
                </p>

                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                  Instructional-capacity planning only. Distributed responsibilities are not leftover capacity. These values are not payroll authorization, final FTE, final headcount, or hiring approval.
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                05  SCENARIO COMPARISON
                Scenario Comparison: Core Educators by Section Count
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("scenario-comparison"))}>
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-slate-400 rounded-full shrink-0" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Sensitivity Layer</div>
                    <h3 className="text-xl font-bold text-slate-900">Scenario Comparison: Core Educators by Section Count</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  These counts are model-derived instructional-capacity signals. They are not payroll authorization, final FTE, final headcount, or hiring approval.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Grade 6 launch should be read through the cluster architecture: 3 educator clusters, not automatically 3 fully loaded educators. Complementary program functions are required to approach viable load.
                </p>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Domain-row count is not the same as the cluster-compressed launch premise. Specialist/program functions require explicit allocation. Distributed responsibilities — Advisory, Passion Project, Pathways — are not leftover capacity.
                </p>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[10px] font-medium text-blue-800">
                  Current simulator configuration: G6 = {msSectionsByGrade.g6} · G7 = {msSectionsByGrade.g7} · G8 = {msSectionsByGrade.g8}. Core educators implied by current configuration: {currentCoreEducators}.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {educatorCountSummary.map((row) => (
                    <div key={`${row.stage}-${row.sectionsLabel}`} className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{row.sectionsLabel}</div>
                        <h5 className="text-xs font-bold text-slate-900 leading-snug">{row.stage}</h5>
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">
                          G6:{row.config.g6} · G7:{row.config.g7} · G8:{row.config.g8}
                        </div>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="text-2xl font-bold text-blue-700">{row.coreEducatorsImplied}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1 leading-tight">Core educators<br />implied</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialist/program load signal</div>
                        <div className="text-[9px] font-medium text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 leading-relaxed">
                          {row.specialistSignal}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">{row.interpretation}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-medium text-slate-600">
                  This broader comparison shows model-derived instructional-capacity signals for 1-section and 2-section scenarios under the current load assumptions.
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                06  MS-TO-HS BOUNDARY
                MS Educator Pool → Grade 9 Bridge Feasibility
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("ms-hs-boundary"))}>
              <div className="space-y-5 rounded-2xl border border-rose-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-rose-400 rounded-full shrink-0" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">Boundary Condition</div>
                    <h3 className="text-xl font-bold text-slate-900">MS Educator Pool → Grade 9 Bridge Feasibility</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Middle School load space can inform Grade 9 bridge/share feasibility, but it is not automatic High School capacity.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-2">
                    <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Read-only feasibility signal</div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">Load space shows whether a Middle School educator may have room below the maximum teaching threshold. It does not confirm availability for Grade 9.</p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-2">
                    <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">MS-primary bridge, if validated</div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">An MS-primary educator may support Grade 9 only if the domain match, HS-level expertise, schedule fit, and remaining-capacity validation all hold.</p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-2">
                    <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">HS-oriented shared with MS, if validated</div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">An HS-oriented launch educator may also support Middle School only if load, schedule, and expertise allow. This is the reverse direction from MS-primary bridge.</p>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-2">
                    <div className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Not automatic capacity</div>
                    <p className="text-[10px] text-slate-600 leading-relaxed">Remaining load space must not be treated as confirmed Grade 9 coverage, approved staffing, payroll FTE, final headcount, or hiring authorization.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bridge validation requirements</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      "Subject-domain match",
                      "HS-level expertise validation",
                      "Schedule fit",
                      "Remaining-capacity validation",
                      "Advisory, project, and program-function conflicts checked",
                      "Grade 9 Capacity Ledger alignment",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-1.5 text-[10px] text-slate-600">
                        <ChevronRight className="h-2.5 w-2.5 text-rose-300 shrink-0 mt-0.5" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Domain examples</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <div className="text-[9px] font-bold text-slate-700">ELA</div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">MS ELA may support Grade 9 English Language Arts only if HS-level ELA expectations and schedule fit are validated. Dedicated HS ELA is still expected as High School expands.</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <div className="text-[9px] font-bold text-slate-700">Natural Sciences</div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">MS Natural Sciences does not automatically qualify for Grade 9 Biology/Chemistry foundations; capability validation is required.</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                      <div className="text-[9px] font-bold text-slate-700">Portuguese / Redação</div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">MS Portuguese does not automatically qualify for HS Portuguese / Redação; HS writing expectations must be validated.</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Use the High School tab's Grade 9 Capacity Ledger and Grade 9 Mock Schedule to validate any bridge/share hypothesis.
                </p>
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-amber-800">
                  Bridge/share signals are instructional-capacity planning inputs only, not payroll authorization, final FTE, final headcount, or hiring approval.
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════
                07  LOAD LOGIC
                Educator Load Logic by Opening Stage
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("load-logic"))}>
              <Card title="Educator Load Logic by Opening Stage" icon={Users}>
                <div className="space-y-4">
                  <p className="text-xs font-medium leading-relaxed text-slate-500">
                    This simulator models Rio's Middle School load with a maximum of two sections per grade.
                    A 24-slot load is the minimum viable full-time educator load; 28 slots is the maximum
                    teaching load. Complementary functions complete the educator profile only when they align
                    with the domain.
                  </p>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    {(Object.keys(msSectionsByGrade) as MiddleSchoolGrade[]).map((grade) => (
                      <label key={`ms-section-control-${grade}`} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">{MS_GRADE_LABELS[grade]} sections</span>
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                          value={msSectionsByGrade[grade]}
                          onChange={(event) => setMsSectionsByGrade((current) => ({
                            ...current,
                            [grade]: Number(event.target.value) as SectionCount,
                          }))}
                        >
                          {SECTION_COUNT_OPTIONS.map((option) => (
                            <option key={`${grade}-${option}`} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                    <label className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Minimum load</span>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                        value={minViableLoad}
                        onChange={(event) => setMinViableLoad(Number(event.target.value))}
                      >
                        {LOAD_THRESHOLD_OPTIONS.map((option) => (
                          <option key={`min-${option}`} value={option}>{option} slots</option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">Maximum load</span>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                        value={maxTeachingLoad}
                        onChange={(event) => setMaxTeachingLoad(Number(event.target.value))}
                      >
                        {LOAD_THRESHOLD_OPTIONS.map((option) => (
                          <option key={`max-${option}`} value={option}>{option} slots</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {[
                      ["Active stage", activeStage],
                      ["Grade sections", `G6 ${msSectionsByGrade.g6} · G7 ${msSectionsByGrade.g7} · G8 ${msSectionsByGrade.g8}`],
                      ["Total MS sections", `${totalMiddleSchoolSections}`],
                      ["Minimum viable load", `${minViableLoad} slots`],
                      ["Maximum teaching load", `${maxTeachingLoad} slots`],
                      ["Validation status", validationStatus],
                    ].map(([label, value]) => (
                      <div key={`ms-load-summary-${label}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                        <div className="mt-2 text-sm font-bold text-slate-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  {validationWarnings.length > 0 && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                      {validationWarnings.map((warning) => (
                        <div key={warning}>{warning}</div>
                      ))}
                    </div>
                  )}

                  <details
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    open={advancedAssumptionsOpen}
                    onToggle={(event) => setAdvancedAssumptionsOpen(event.currentTarget.open)}
                  >
                    <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Advanced assumptions
                    </summary>
                    {advancedAssumptionsOpen && (
                      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {CORE_DOMAIN_ASSUMPTIONS.map((domain) => (
                          <label key={`domain-block-control-${domain.id}`} className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3">
                            <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">{domain.label}</span>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                              value={domainSlotsPerSection[domain.id]}
                              onChange={(event) => setDomainSlotsPerSection((current) => ({
                                ...current,
                                [domain.id]: Number(event.target.value),
                              }))}
                            >
                              {BLOCK_OPTIONS.map((option) => (
                                <option key={`domain-${domain.id}-${option}`} value={option}>{option} slots / section</option>
                              ))}
                            </select>
                          </label>
                        ))}
                        {PROGRAM_FUNCTION_ASSUMPTIONS.map((program) => (
                          <label key={`program-block-control-${program.id}`} className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3">
                            <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400">{program.label}</span>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-400"
                              value={programSlotsPerSection[program.id]}
                              onChange={(event) => setProgramSlotsPerSection((current) => ({
                                ...current,
                                [program.id]: Number(event.target.value),
                              }))}
                            >
                              {BLOCK_OPTIONS.map((option) => (
                                <option key={`program-${program.id}-${option}`} value={option}>{option} slots / section</option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                    )}
                  </details>

                  {msSectionsByGrade.g8 > 0 && (
                    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 text-xs font-medium leading-relaxed text-slate-600">
                      Grade 8 is not cluster-based. Babson EPIC Certificate replaces Passion Projects as the
                      Grade 8 project-based entrepreneurship anchor, while subject-slot load drives educator need.
                    </div>
                  )}

                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="min-w-[980px] w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] uppercase tracking-widest text-slate-400">
                          {[
                            "Domain",
                            "Weekly core slots",
                            "Educators needed at max",
                            "Suggested distribution",
                            "Complementary load need",
                            "Load space",
                            "Best complementary functions",
                            "Staffing implication",
                          ].map((header) => (
                            <th key={header} className="px-3 py-3 font-bold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {educatorLoadRows.map((row) => (
                          <tr key={row.domain} className="border-t border-slate-100 text-[10px] leading-relaxed text-slate-500">
                            <td className="px-3 py-3 align-top font-bold text-slate-900">{row.domain}</td>
                            <td className="px-3 py-3 align-top">{row.weeklyCoreSlots}</td>
                            <td className="px-3 py-3 align-top">{row.educatorsNeeded}</td>
                            <td className="px-3 py-3 align-top">{formatSlotList(row.distribution)}</td>
                            <td className="px-3 py-3 align-top">{row.complementaryLoadNeed}</td>
                            <td className="px-3 py-3 align-top">{row.remainingCapacity}</td>
                            <td className="px-3 py-3 align-top">{row.complementaryFunctions}</td>
                            <td className="px-3 py-3 align-top font-semibold text-blue-700">{row.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    The Load space column above is a planning indicator only; it does not assign educators to Grade 9. See the MS Educator Pool → Grade 9 Bridge Feasibility section above.
                  </p>
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[10px] font-medium leading-relaxed text-rose-800">
                    Middle School remaining load space is not automatic High School capacity. Any Grade 9 bridge requires subject-domain match, HS-level expertise validation, schedule fit, and remaining-capacity validation.
                  </div>
                </div>
              </Card>
            </div>

            {/* ════════════════════════════════════════════════════════
                08  PROGRAM TABLE
                Program Function Load
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("program-table"))}>
              <Card title="Program Function Load" icon={BookOpen}>
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="min-w-[820px] w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] uppercase tracking-widest text-slate-400">
                          {["Function", "Active grades", "Weekly slots generated", "Suggested owner domains", "Notes"].map((header) => (
                            <th key={header} className="px-3 py-3 font-bold">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {programFunctionRows.map((row) => (
                          <tr key={row.functionName} className="border-t border-slate-100 text-[10px] leading-relaxed text-slate-500">
                            <td className="px-3 py-3 align-top font-bold text-slate-900">{row.functionName}</td>
                            <td className="px-3 py-3 align-top">{row.activeGrades}</td>
                            <td className="px-3 py-3 align-top">{row.weeklySlots}</td>
                            <td className="px-3 py-3 align-top">{row.ownerDomains}</td>
                            <td className="px-3 py-3 align-top">{row.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs font-medium leading-relaxed text-slate-600">
                    By Grade 8, educator need is no longer driven by cluster coverage. It is driven by
                    subject-slot load and aligned program ownership. Domains with 36 weekly slots require
                    two educators at a 28-slot maximum, but the preferred distribution is balanced: 18 core
                    slots per educator, completed through domain-aligned program functions such as Babson
                    EPIC, electives, portfolio evidence, and critique cycles.
                  </div>
                </div>
              </Card>
            </div>

            {/* ════════════════════════════════════════════════════════
                09  SUPPORTING CONTEXT
                Middle School: The Bridge + Instructional Ownership
            ════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("supporting-context"), "space-y-5")}>
              <div>
                <Card title="Middle School: The Bridge" icon={Database}>
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Middle School at Concept is the transition from Lower School Researchers into the Designers learning engine. Grade 6 is not one more Lower School grade: it activates Passion Projects, advisory, Creative Hub access, MUN, academic electives, documentation, portfolio evidence, critique cycles, and Project Mentorship as a coordinated function. A dedicated Project Mentor is conditional on validated cluster educator capacity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2"><Cpu className="h-4 w-4 text-blue-500" /><h4 className="text-xs font-bold text-slate-900">Mathematics / Natural Sciences</h4></div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Grade 6 integrates Mathematics and Natural Sciences foundations; from Grade 7 onward, Natural Sciences becomes a dedicated domain.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4 text-amber-500" /><h4 className="text-xs font-bold text-slate-900">Humanities / Project Design</h4></div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">Portuguese remains connected to Social Sciences through literacy, argumentation, civic and historical inquiry, while ELA / Global Studies carries the project-design language function.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Instructional Ownership Progression" icon={BookOpen}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {MS_OWNERSHIP_PROGRESSION.map((stage) => (
                    <div key={stage.stage} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{stage.stage}</div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900">{stage.model}</h4>
                      <ul className="mt-3 space-y-2 text-[10px] leading-relaxed text-slate-500">
                        {stage.details.map((detail) => (
                          <li key={`${stage.stage}-${detail}`} className="flex gap-2">
                            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-300" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </main>
        </div>
      </section>
    </>
  );
};

export default MiddleSchoolTab;
