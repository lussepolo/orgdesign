import React, { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Cpu, Database, Users } from "lucide-react";
import { motion } from "motion/react";
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

const Badge = ({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info" | "purple" | "danger";
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border", variants[variant])}>
      {children}
    </span>
  );
};

const MS_ROADMAP_DATA = [
  {
    year: "2031", phase: "Grade 6 Launch", sections: "1-2 Sections", students: 50, fte: 3,
    description: "Grade 6 is the category shift into the Designers engine: cluster educators launch Passion Projects, advisory, documentation, critique cycles, and Project Mentorship as a coordinated function.",
    clusters: [
      { name: "Mathematics + Natural Sciences foundations", type: "MS" },
      { name: "Humanities / Portuguese & Social Sciences", type: "MS" },
      { name: "English Language Arts / Global Studies / Project Design coordination", type: "MS" },
    ]
  },
  {
    year: "2032", phase: "Grade 6-7 Growth", sections: "2-4 Sections", students: 100, fte: 7,
    description: "Grade 7 strengthens subject specialization while project-based learning coordination remains a function, not an automatic dedicated payroll role.",
    clusters: [
      { name: "Mathematics specialization", type: "MS" },
      { name: "Portuguese + Social Sciences inquiry", type: "MS" },
      { name: "Dedicated Natural Sciences domain", type: "MS" },
      { name: "English Language Arts / Global Studies / Project Design coordination", type: "MS" },
    ]
  },
  {
    year: "2033", phase: "Grade 6-8 Full MS", sections: "6 Sections", students: 150, fte: 10,
    description: "Grade 8 completes the Middle School readiness model with clearer subject domains, portfolio evidence, rubrics, and High School transition routines.",
    clusters: [
      { name: "Mathematics", type: "MS" },
      { name: "ELA / Global Studies", type: "MS" },
      { name: "Portuguese + Social Sciences", type: "MS" },
      { name: "Dedicated Natural Sciences", type: "MS" },
      { name: "Learning Experience / Teaching & Learning support", type: "SHARED" }
    ]
  }
];

const MIDDLE_SCHOOL_DATA = [
  { grade: "Grade 6", focus: "Designers Launch", model: "3 cluster educators + coordinated project functions", ratio: "1:12.5", max: 50 },
  { grade: "Grade 7", focus: "Hybrid Specialization", model: "Mathematics, Portuguese, ELA, Natural Sciences, Social Sciences + aligned program functions", ratio: "1:10", max: 50 },
  { grade: "Grade 8", focus: "High School Readiness", model: "Core-subject specialist model + Babson EPIC and program functions", ratio: "1:10", max: 50 },
];

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

type MiddleSchoolTabProps = {
  sections: number;
  setSections: (s: number) => void;
};

const MiddleSchoolTab = ({ sections, setSections }: MiddleSchoolTabProps) => {
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

  return (
    <div className="space-y-8">
      <div className="pt-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-blue-500 rounded-full" />
            <h3 className="text-2xl font-bold text-slate-900">Strategic Roadmap</h3>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button onClick={() => setSections(1)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 1 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>1 section · 25 learners/grade</button>
              <button onClick={() => setSections(2)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 2 ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}>2 sections · 50 learners/grade</button>
            </div>
            <p className="max-w-sm text-left text-[10px] font-medium leading-relaxed text-slate-400 sm:text-right">
              Roadmap values are planning premises; section view does not recalculate FTE.
            </p>
            <Badge variant="info">Middle School will be launched in 2031</Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {MS_ROADMAP_DATA.map((stage, idx) => (
            <motion.div key={stage.phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full flex flex-col p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.year}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded uppercase tracking-tighter">Middle School</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">{stage.phase}</h4>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 uppercase tracking-tight">{stage.sections}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 whitespace-normal">{stage.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Students</div>
                    <div className="text-lg font-bold text-slate-900">{stage.students}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">FTE</div>
                    <div className="text-lg font-bold text-slate-900">{stage.fte}</div>
                  </div>
                </div>
                <div className="space-y-2 mt-auto">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Core Clusters</div>
                  {stage.clusters.map((cluster) => (
                    <div key={cluster.name} className="flex items-center justify-between p-2 bg-white border border-slate-50 rounded-lg shadow-sm group hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[10px] font-medium text-slate-600 whitespace-normal">{cluster.name}</span>
                      </div>
                      <span className={cn("text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0", cluster.type === "SHARED" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-500")}>{cluster.type}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Middle School: The Bridge" icon={Database}>
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
        <Card title="Staffing Evolution" icon={Users}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Grade 6</span>
              <Badge variant="info">Designers Cluster Launch</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Grade 7-8</span>
              <Badge variant="purple">Subject Domains</Badge>
            </div>
            <p className="text-[10px] text-slate-400 italic">Cumulative ramp remains 3 FTE with Grade 6, 7 FTE when Grade 7 opens, and 10 FTE when Grade 8 opens. Project Mentorship starts as a coordinated function, not automatic payroll.</p>
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

          {grade6ClusterInsight.active && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs font-medium leading-relaxed text-slate-600">
              Grade 6 cluster insight: Mathematics + Natural Sciences produces {grade6ClusterInsight.combinedSlots}
              {" "}weekly slots ({grade6ClusterInsight.mathematicsSlots} Mathematics + {grade6ClusterInsight.naturalSciencesSlots}
              {" "}Natural Sciences), leaving a {grade6ClusterInsight.gapToMinimumLoad}-slot gap to the {minViableLoad}-slot
              minimum viable load. This gap may be completed through Pathways, Advisory, STEAM elective,
              Project Mentorship, scientific inquiry, documentation, or critique cycles. Project Mentorship
              remains a coordinated function, not automatic payroll.
            </div>
          )}

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
                    "Remaining capacity before max",
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MIDDLE_SCHOOL_DATA.map((item, idx) => (
          <motion.div key={item.grade} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
            <Card className="h-full border-t-4 border-blue-400">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Middle School</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{item.grade}</h3>
              <div className="space-y-3">
                <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Learners, 2 Sections</div><div className="text-xs font-bold text-blue-600">{item.max} Learners</div></div>
                <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Learners Per Section</div><div className="text-xs font-bold text-slate-600">{item.max / 2} Learners</div></div>
                <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Ratio</div><div className="text-xs font-bold text-slate-600">{item.ratio}</div></div>
                <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Instructional Model</div><div className="text-[10px] font-medium text-slate-500">{item.model}</div></div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MiddleSchoolTab;
