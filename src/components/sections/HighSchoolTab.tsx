import React, { useState } from "react";
import { ChevronRight, GraduationCap, Info, Scale, Users } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import {
  HIGH_SCHOOL_EDUCATOR_CAPABILITY_PROFILES,
  HIGH_SCHOOL_MOCK_SCHEDULE_SCENARIOS,
  HIGH_SCHOOL_SCHEDULE_UNIT_COUNTING_NOTE,
  HIGH_SCHOOL_SCHEDULE_UNITS,
  convertSaoPauloMinutesToRioEquivalent,
} from "./highSchoolScheduleModel";

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

interface HSYearData {
  year: string;
  scope: string;
  model: string;
  fte: string;
  curriculum: string[];
  org: string[];
  description: string;
}

const HS_YEAR_DATA: HSYearData[] = [
  {
    year: "Grade 9",
    scope: "High School Foundation",
    model: "Provisional HS Launch Faculty",
    fte: "4 FTE",
    curriculum: ["AP", "BNCC", "Common Core"],
    org: [
      "Língua Portuguesa II & Redação",
      "English Language Arts",
      "Integrated Mathematics II",
      "Biology, Chemistry & Physics foundations",
      "Brazilian Studies & Global Studies foundations",
      "AP Human Geography (humanities AP layer)",
      "Pathways & College and Career Guidance",
      "Advisory",
      "Project Mentorship / Passion Project (fixed mentorship block)",
      "Global Expression & Leadership / GCD foundation",
      "Innovation / Design Technologies foundation",
    ],
    description: "Grade 9 launches High School with a mixed educator model. New HS-capable educators are hired for validated HS-specific domains. Selected MS educators may extend into Grade 9 only where High School expertise, profile fit, and schedule capacity are validated. Shared MS/HS staffing is a bridge mechanism, not a substitute for High School hiring."
  },
  {
    year: "Grade 10",
    scope: "High School Specialization I",
    model: "Provisional HS Specialist Capacity",
    fte: "No separate Grade 10 FTE step beyond the launch package, pending validation",
    curriculum: ["AP", "BNCC", "Common Core"],
    org: [
      "Língua Portuguesa II & Redação",
      "English Language Arts",
      "Integrated Mathematics II",
      "Biology, Chemistry & Physics continuation",
      "AP Seminar",
      "AP Computer Science Principles",
      "Pathways & College and Career Guidance",
      "Academic Advising / mentorship",
      "Project Mentorship / Passion Project (fixed mentorship block)",
      "GCD within Pathways/Leadership",
      "Innovation / Design Technologies",
    ],
    description: "Grade 10 extends the Grade 9 launch package — not a separate FTE step without validation. It still requires explicit High School ownership across academics, advisory, mentorship, Pathways, College and Career Guidance, and GCD within Pathways/Leadership."
  },
  {
    year: "Grade 11",
    scope: "High School Specialization II",
    model: "Provisional HS Specialist Capacity",
    fte: "3 New FTE (7 Total HS)",
    curriculum: ["AP Seminar", "AP Calculus", "BNCC"],
    org: [
      "Língua Portuguesa III & AP Lang (ELA)",
      "Integrated Math III & AP Precalculus",
      "Integrated Sciences Advanced",
      "AP Biology & AP Chemistry",
      "AP Social Sciences & AP Macro",
      "Brazilian Studies I & II",
      "Global Expression & Leadership",
      "Innovation Diploma & Design Technologies"
    ],
    description: "Grade 11 is the next provisional expansion point for AP Capstone Research, advanced mathematics, and deeper STEM and humanities specialization."
  },
  {
    year: "Grade 12",
    scope: "High School Graduation",
    model: "Provisional HS Specialist Capacity",
    fte: "3 New FTE (10 Total HS)",
    curriculum: ["AP Research", "College Prep", "BNCC"],
    org: [
      "Língua Portuguesa IV & AP Lit (ELA)",
      "AP Calculus & Integrated Math Adv",
      "AP Precalculus & CS Principles",
      "Integrated Sciences / Advanced Topics",
      "AP Biology & AP Chemistry",
      "AP Research (Social Sciences — Grade 12 capstone)",
      "AP Macroeconomics / Advanced Social Sciences",
      "Brazilian Studies I & II",
      "Global Expression & Leadership",
      "Innovation Diploma & Design Technologies",
    ],
    description: "Grade 12 completes the current instructional-capacity ramp assumption. Staffing carries forward flat only if later validation confirms the workload model."
  }
];

interface HSCourseOfferArchitecture {
  grade: string;
  coreAcademicOffer: string[];
  advancedLayer: string[];
  programFunctions: string[];
  staffingImplication: string;
}

const HS_STAFFING_VALIDATION_NOTE =
  "The High School staffing framework shown here is instructional-capacity planning, not payroll authorization. The app currently contains both a 10-FTE High School teaching ramp and an 8-HC HS Educator Pool; Finance/HR validation is required before either becomes the payroll source of truth.";

const HS_COURSE_OFFER_ARCHITECTURE: HSCourseOfferArchitecture[] = [
  {
    grade: "Grade 9",
    coreAcademicOffer: [
      "Portuguese / Redação",
      "English Language Arts",
      "Integrated Mathematics",
      "Social Sciences",
      "Natural Sciences foundations with Biology, Chemistry, and Physics coverage expectations",
    ],
    advancedLayer: [
      "AP-style humanities / AP Human Geography",
      "AP English / composition readiness",
    ],
    programFunctions: [
      "Pathways / College and Career Guidance",
      "Advisory",
      "Project Mentorship / Passion Project (fixed synchronized mentorship block — educator role, not a separate hire by default)",
      "Global Expression & Leadership",
      "GCD within Pathways/Leadership foundation",
      "Innovation / Design Technologies foundation",
    ],
    staffingImplication:
      "Grade 9 launches with a mixed educator model. New HS-capable educators are required for validated HS-specific domains — Biology, Chemistry, Physics, advanced English, and humanities in particular. Selected MS educators may extend only where High School expertise, profile fit, and schedule capacity are validated. Shared MS/HS staffing is a bridge mechanism, not a substitute for High School hiring.",
  },
  {
    grade: "Grade 10",
    coreAcademicOffer: [
      "Portuguese / Redação",
      "English Language Arts",
      "Integrated Mathematics",
      "Social Sciences",
      "Natural Sciences continuation with Biology, Chemistry, and Physics coverage",
    ],
    advancedLayer: [
      "AP Seminar / AP Research pathway depending sequence",
      "AP Computer Science Principles or applied computation where included",
      "Advanced English / humanities",
    ],
    programFunctions: [
      "Pathways",
      "College and Career Guidance",
      "Academic Advising / mentorship",
      "Project Mentorship / Passion Project (fixed synchronized mentorship block)",
      "GCD within Pathways/Leadership",
      "Innovation / Design Technologies",
    ],
    staffingImplication:
      "Grade 10 extends the Grade 9 launch package. It requires explicit High School ownership across academics, advisory, mentorship, Pathways, College and Career Guidance, and GCD within Pathways/Leadership. It does not create a separate FTE step beyond the launch package unless validated.",
  },
  {
    grade: "Grade 11",
    coreAcademicOffer: [
      "Portuguese / Redação",
      "English Language Arts / advanced communication",
      "Advanced Mathematics / AP Precalculus / AP Calculus pathway",
      "Brazilian Studies / Global Studies (including Geography and History)",
      "Natural Sciences with explicit Biology, Chemistry, and Physics validation",
    ],
    advancedLayer: [
      "AP Seminar / AP Capstone sequence",
      "AP Biology / AP Chemistry",
      "Brazilian Studies / Global Studies / AP Social Sciences",
    ],
    programFunctions: [
      "College/Career counseling",
      "External mentors",
      "Capstone-like research or independent work",
      "GCD within Pathways/Leadership",
      "Innovation / Design Technologies",
    ],
    staffingImplication:
      "By Grade 11, the model should move toward mature specialist domains or strong part-time specialists. Generic shared staffing becomes risky.",
  },
  {
    grade: "Grade 12",
    coreAcademicOffer: [
      "Portuguese / Redação",
      "English Language Arts",
      "Mathematics / advanced mathematics as needed",
      "Brazilian Studies / Global Studies / Social Sciences",
      "Natural Sciences as pathway-dependent",
    ],
    advancedLayer: [
      "AP Research (Social Sciences — Grade 12 capstone)",
      "AP / advanced courses as selected",
      "Independent Study",
      "Capstone-like pathway work",
    ],
    programFunctions: [
      "College/Career counseling",
      "Internships or external mentorship",
      "Leadership",
      "Graduation pathway support",
      "GCD within Pathways/Leadership and Innovation Diploma completion where applicable",
    ],
    staffingImplication:
      "Grade 12 should not be assumed to have zero workload impact without Finance/HR validation. Even when subject load is stable, independent study, counseling, leadership, external mentorship, and graduation pathway work generate adult workload.",
  },
];

const HS_RAMP_INCREMENT_FTE_BY_GRADE = [4, 0, 3, 3];
const HS_RAMP_TOTALS_FOR_DISPLAY = [4, 4, 7, 10];
const HS_FULL_RAMP_FTE = 10;

const SPECIALIST_INTEGRITY_NOTE = "The fractional FTEs (e.g., 0.25 per section) reflect the instructional load within the 27-period cap. While a subject may require 0.5 FTE for two sections, this represents a dedicated specialist's focus, often shared across grade levels or divisions to maintain subject-matter integrity (e.g., Portuguese specialists do not teach English).";

const HS_LOAD_DATA = [
  { subject: "Portuguese", g9: 5, g10: 5, g11: 5, g12: 5 },
  { subject: "ELA / AP Seminar / Research", g9: 5, g10: 5, g11: 10, g12: 10 },
  { subject: "Mathematics / AP Calculus", g9: 5, g10: 5, g11: 5, g12: 5 },
  { subject: "Brazilian Studies / Global Studies", g9: 6, g10: 5, g11: 5, g12: 5 },
  { subject: "Sciences / AP lab sciences", g9: 6, g10: 8, g11: 8, g12: 8 },
];

const HS_ROADMAP_DATA = [
  {
    year: "2034", phase: "High School Launch (G9)", sections: "1-2 Sections", students: 40, fte: 4,
    description: "Grade 9 opens High School with a provisional teaching-capacity assumption.",
    clusters: [
      { name: "HS Launch Educator Core", type: "HS" },
      { name: "AP Seminar Foundation", type: "HS" },
      { name: "Advanced science foundations", type: "HS" },
      { name: "HS Transition Bridge", type: "HS" }
    ]
  },
  {
    year: "2036", phase: "High School Expansion (G11)", sections: "6 Sections", students: 120, fte: 7,
    description: "Grade 11 is the next provisional expansion point, bringing the current HS teaching-capacity assumption to 7 FTE.",
    clusters: [
      { name: "Dedicated HS Specialists", type: "HS" },
      { name: "AP Research Core", type: "HS" },
      { name: "Advanced Sciences Core", type: "HS" },
      { name: "College Advising", type: "HS" }
    ]
  },
  {
    year: "2037+", phase: "High School Full Ramp (G12)", sections: "8 Sections", students: 160, fte: 10,
    description: "Grade 12 completes the current cumulative planning ramp at 10 FTE, pending Finance/HR validation.",
    clusters: [
      { name: "AP Capstone Research", type: "HS" },
      { name: "Advanced STEM & Humanities", type: "HS" },
      { name: "Innovation Diploma", type: "HS" },
      { name: "Graduation Specialists", type: "HS" }
    ]
  }
];

const HS_PROFILE_DISPLAY_LABELS: Record<string, string> = {
  hs_portuguese_redacao: "HS Portuguese / Redação",
};

const getHsProfileLabel = (profileId: string) =>
  HS_PROFILE_DISPLAY_LABELS[profileId] ??
  HIGH_SCHOOL_EDUCATOR_CAPABILITY_PROFILES.find((profile) => profile.id === profileId)?.label ??
  profileId;

const formatHighSchoolPreviewText = (text: string) =>
  text
    .replaceAll("Portuguese/Redacao", "Portuguese/Redação")
    .replaceAll("Redacao", "Redação")
    .replaceAll("Global Citizen Diploma", "Leadership with embedded GCD scope");

const SP_AF_CONVERSION_PREVIEW = convertSaoPauloMinutesToRioEquivalent(
  HIGH_SCHOOL_SCHEDULE_UNITS.sp_rotation_af_255.minutes ?? 255,
  "sp_rotation_af_255",
);

const HS_SCHEDULE_MODE_PREVIEW = [
  {
    title: "Rio weekly model",
    badge: "Primary",
    variant: "success" as const,
    items: [
      `${HIGH_SCHOOL_SCHEDULE_UNITS.rio_single_45.minutes}-minute single block`,
      `${HIGH_SCHOOL_SCHEDULE_UNITS.rio_double_90.minutes}-minute double block`,
      "Weekly calendar cycle",
      "Primary planning mode for Rio",
    ],
  },
  {
    title: "São Paulo reference model",
    badge: "Reference",
    variant: "warning" as const,
    items: [
      `A-F rotation record, about ${HIGH_SCHOOL_SCHEDULE_UNITS.sp_rotation_af_255.minutes} minutes per six-day cycle`,
      `${HIGH_SCHOOL_SCHEDULE_UNITS.sp_x_block_75.minutes}- or ${HIGH_SCHOOL_SCHEDULE_UNITS.sp_x_block_60.minutes}-minute X-blocks`,
      `Advisory around ${HIGH_SCHOOL_SCHEDULE_UNITS.sp_advisory_25.minutes} minutes`,
      "Mature-reference density only, not Rio payroll truth",
    ],
  },
];

const HS_LOAD_CATEGORY_PREVIEW = [
  {
    title: "Teaching load",
    variant: "info" as const,
    items: ["Portuguese / Redação", "ELA", "Mathematics", "Biology", "Chemistry", "Physics", "AP / advanced courses"],
  },
  {
    title: "Mentorship/contact load",
    variant: "purple" as const,
    items: ["Project Mentorship", "Passion Project", "Innovation Diploma", "Independent Study"],
  },
  {
    title: "Program ownership load",
    variant: "success" as const,
    items: ["Pathways", "Leadership", "GCD within Pathways/Leadership", "College/Career guidance"],
  },
];

const HS_CAPABILITY_PREVIEW_GROUPS = [
  {
    title: "Language and communication",
    profileIds: ["hs_portuguese_redacao", "hs_english_research_communication"],
  },
  {
    title: "Math and sciences",
    profileIds: ["hs_mathematics_advanced_math", "biology_specialist", "chemistry_specialist", "physics_specialist"],
  },
  {
    title: "Humanities, Brazilian Studies & Global Studies",
    profileIds: ["hs_humanities_ap_world_history", "ap_seminar_research"],
  },
  {
    title: "Pathways and mentorship",
    profileIds: ["pathways_college_career", "innovation_design_technologies_project_mentorship"],
  },
  {
    title: "Design technologies and leadership",
    profileIds: ["innovation_design_technologies_project_mentorship", "leadership_with_gcd_scope"],
  },
  {
    title: "Body & Movement",
    profileIds: ["body_movement"],
  },
];

const HS_SCENARIO_PREVIEW_COPY: Record<
  string,
  {
    title: string;
    bestUse: string;
    badge: string;
    variant: "warning" | "success" | "purple";
  }
> = {
  scenario_a_shared_ms_hs_bridge: {
    title: "Scenario A: Shared MS/HS bridge model",
    bestUse: "Limited MS/HS bridge for early G9–G10 continuity in selected validated domains. Not a substitute for High School hiring. Cannot assume full Bio/Chem/Physics, AP humanities, or college-facing expectations without validated HS expertise.",
    badge: "Limited bridge",
    variant: "warning",
  },
  scenario_b_transitional_part_time_hs: {
    title: "Scenario B: Transitional part-time HS model",
    bestUse: "Strongest transitional model for distinct HS ownership without mature overbuild.",
    badge: "Strong transition",
    variant: "success",
  },
  scenario_c_mature_hs_specialist: {
    title: "Scenario C: Mature HS specialist model",
    bestUse: "Mature, high-density model for Grade 11-12 or full High School scale. Should not be activated as full payroll logic before enrollment density supports specialist utilization.",
    badge: "Mature density",
    variant: "purple",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Subnavigation
// ─────────────────────────────────────────────────────────────────────────────

type HighSchoolView =
  | "decision-summary"
  | "course-offer"
  | "weekly-load"
  | "capability-architecture"
  | "schedule-mentorship"
  | "scenario-fit"
  | "provisional-load"
  | "roadmap-appendix";

const highSchoolViews: Array<{ id: HighSchoolView; label: string }> = [
  { id: "decision-summary",        label: "01 Decision Summary" },
  { id: "course-offer",            label: "02 Course Offer" },
  { id: "weekly-load",             label: "03 Weekly Load by Offer" },
  { id: "capability-architecture", label: "04 Capability Architecture" },
  { id: "schedule-mentorship",     label: "05 Schedule / Mentorship Model" },
  { id: "scenario-fit",            label: "06 Scenario Fit" },
  { id: "provisional-load",        label: "07 Provisional Load" },
  { id: "roadmap-appendix",        label: "08 Roadmap / Appendix" },
];

type HighSchoolTabProps = {
  sections: number;
  setSections: (s: number) => void;
};

const HighSchoolTab = ({ sections, setSections }: HighSchoolTabProps) => {
  const [activeView, setActiveView] = useState<HighSchoolView>("decision-summary");

  const learnersPerSection = 25;
  const totalG9 = 27 * sections;
  const totalG10 = 28 * sections;
  const totalG11 = 33 * sections;
  const totalG12 = 33 * sections;
  const totalHS = totalG9 + totalG10 + totalG11 + totalG12;
  const specialists = HS_FULL_RAMP_FTE;
  const efficiency = (totalHS / (specialists * 27)) * 100;

  const viewClassName = (view: HighSchoolView) =>
    cn("hs-view-section", activeView !== view && "hs-screen-inactive");

  return (
    <>
      <style>{`
        .hs-screen-inactive {
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
                  High School
                </h2>
                <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-100/60">
                  Course-offer-led planning — not FTE-led.
                </p>
              </div>

              <nav className="mt-8 hidden space-y-1 lg:block">
                {highSchoolViews.map((view) => (
                  <button
                    key={`hs-rail-${view.id}`}
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
                  Instructional-capacity planning only. Finance/HR validation required before any staffing ramp becomes payroll authorization.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Right main content ── */}
          <main className="rounded-[2rem] bg-[#fbfaf7] p-4 md:p-6 xl:p-8">

            {/* Mobile nav */}
            <div className="mb-6 rounded-[1.75rem] bg-white p-2 lg:hidden">
              <div className="grid grid-cols-2 gap-2">
                {highSchoolViews.map((view) => (
                  <button
                    key={`hs-mobile-${view.id}`}
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

            {/* ════════════════════════════════════════════════════════════
                01  DECISION SUMMARY
                Course-offer-led entry point. FTE figures are provisional
                planning assumptions, not the primary frame.
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("decision-summary"), "space-y-8")}>

              {/* Sections toggle lives here so it is visible from the entry subview */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    High School · Decision Summary
                  </div>
                  <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-slate-900">
                    Course-offer architecture
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-slate-500">
                    High School staffing derives from the course and program offer first — not from FTE numbers alone.
                  </p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 shrink-0">
                  <button onClick={() => setSections(1)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 1 ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white")}>1 section · 25 learners/grade</button>
                  <button onClick={() => setSections(2)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 2 ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white")}>2 sections · 50 learners/grade</button>
                </div>
              </div>

              {/* Finance/HR validation caveat — must remain visible in Decision Summary */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                {HS_STAFFING_VALIDATION_NOTE}
              </div>

              {/* Grade-progression overview — course-offer-led tiles */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    grade: "Grade 9",
                    label: "HS Launch",
                    year: "2034",
                    offerSummary: "Portuguese / Redação, ELA, Integrated Mathematics, Biology / Chemistry / Physics foundations, Brazilian Studies & Global Studies foundations, AP Human Geography, Pathways, College and Career Guidance, Advisory, Project Mentorship / Passion Project (fixed mentorship block), GCD / Leadership foundation, Innovation / Design Technologies foundation",
                    planningNote: "Mixed educator model: new HS-capable educators for validated HS-specific domains; selected MS educators extend only where HS expertise, profile fit, and capacity are validated. Bridge staffing is not a substitute for HS hiring.",
                    color: "border-indigo-200 bg-indigo-50",
                    badge: "info" as const,
                  },
                  {
                    grade: "Grade 10",
                    label: "HS Ownership",
                    year: "2035",
                    offerSummary: "Portuguese / Redação, ELA, Integrated Mathematics, Natural Sciences continuation, AP Seminar, AP Computer Science Principles, Pathways, GCD within Pathways/Leadership, Innovation / Design Technologies",
                    planningNote: "No separate Grade 10 FTE step beyond launch package, pending validation",
                    color: "border-purple-200 bg-purple-50",
                    badge: "purple" as const,
                  },
                  {
                    grade: "Grade 11",
                    label: "Specialist Density",
                    year: "2036",
                    offerSummary: "Portuguese / Redação, ELA / advanced, AP Precalculus / AP Calculus pathway, AP Biology, AP Chemistry, AP Seminar / AP Research, Brazilian Studies, Global Studies, College/Career counseling, External mentors, GCD/Leadership, Innovation / Design Technologies",
                    planningNote: "Provisional expansion — specialist domains or strong part-time specialists",
                    color: "border-cyan-200 bg-cyan-50",
                    badge: "success" as const,
                  },
                  {
                    grade: "Grade 12",
                    label: "Graduation Pathway",
                    year: "2037+",
                    offerSummary: "Portuguese / Redação, ELA, Advanced Mathematics, Brazilian Studies / Global Studies, Natural Sciences (pathway-dependent), AP Research (Social Sciences), AP / advanced courses, Independent Study, College/Career counseling, Internships, Leadership, GCD completion, Innovation Diploma completion",
                    planningNote: "Flat only if Finance/HR validation confirms workload model. AP Research is the Grade 12 Social Sciences capstone — not generic ELA or generic research.",
                    color: "border-emerald-200 bg-emerald-50",
                    badge: "success" as const,
                  },
                ].map((tile) => (
                  <div key={tile.grade} className={cn("rounded-2xl border p-4", tile.color)}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tile.year}</span>
                      <Badge variant={tile.badge}>{tile.label}</Badge>
                    </div>
                    <div className="text-base font-black text-slate-900 mb-2">{tile.grade}</div>
                    <p className="text-[10px] font-medium leading-relaxed text-slate-600 mb-3">{tile.offerSummary}</p>
                    <div className="rounded-xl border border-white/60 bg-white/60 px-3 py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Planning note</p>
                      <p className="text-[10px] font-semibold leading-relaxed text-slate-600">{tile.planningNote}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategic logic */}
              <Card className="bg-indigo-50 border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategic Logic</h4>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed"><strong>G9</strong> launches with a mixed educator model: new HS-capable educators hired for validated HS-specific domains; selected MS educators may extend only where High School expertise, profile fit, and schedule capacity are validated. Shared MS/HS staffing is a bridge mechanism — not a substitute for HS hiring.</p>
                  <p className="text-xs text-slate-600 leading-relaxed"><strong>G10</strong> extends the G9 launch package and requires explicit HS ownership across academics, advisory, mentorship, Pathways, College and Career Guidance, and GCD within Pathways/Leadership. No separate G10 FTE step beyond the launch package without validation.</p>
                  <p className="text-xs text-slate-600 leading-relaxed"><strong>G11–G12</strong> introduces specialist domains, <strong>AP Research</strong> (Grade 12 Social Sciences capstone — not generic ELA or research), College/Career counseling, external mentorship, and capstone-like work. Generic shared staffing becomes risky by Grade 11.</p>
                  <p className="text-xs text-slate-600 leading-relaxed"><strong>Core principle:</strong> Course offer → weekly slots per section → total instructional/contact load → educator capability → scenario fit → provisional staffing implications.</p>
                </div>
              </Card>

            </div>

            {/* ════════════════════════════════════════════════════════════
                02  COURSE OFFER
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("course-offer"), "space-y-6")}>

              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full bg-indigo-500" />
                    <h3 className="text-2xl font-bold text-slate-900">High School course-offer architecture</h3>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
                    High School staffing should be derived from the course and program offer first, not from FTE numbers alone.
                  </p>
                </div>
                <Badge variant="warning">Instructional planning only</Badge>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                Reminder: this section translates the course offer into instructional-capacity logic. Finance/HR must validate the payroll source of truth before any staffing ramp is treated as authorization.
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-xs font-semibold leading-relaxed text-indigo-900">
                Advanced/AP and pathway references indicate possible course-offer layers subject to curriculum, enrollment, and staffing validation.
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {HS_COURSE_OFFER_ARCHITECTURE.map((grade) => (
                  <Card key={grade.grade} className="h-full">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Course offer</div>
                        <h4 className="text-xl font-bold text-slate-900">{grade.grade}</h4>
                      </div>
                      <Badge variant={grade.grade === "Grade 9" ? "info" : grade.grade === "Grade 10" ? "purple" : "success"}>
                        {grade.grade === "Grade 9" ? "HS launch" : grade.grade === "Grade 10" ? "HS ownership" : "Specialist density"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {[
                        ["Core academic offer", grade.coreAcademicOffer],
                        ["Advanced / AP layer", grade.advancedLayer],
                        ["Program and pathway functions", grade.programFunctions],
                      ].map(([title, items]) => (
                        <div key={`${grade.grade}-${title}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-3 text-[9px] font-bold uppercase tracking-widest text-slate-400">{title as string}</div>
                          <ul className="space-y-2">
                            {(items as string[]).map((item) => (
                              <li key={`${grade.grade}-${item}`} className="text-[11px] font-medium leading-relaxed text-slate-600">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                      <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-indigo-500">Staffing implication</div>
                      <p className="text-xs font-medium leading-relaxed text-slate-700">{grade.staffingImplication}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Grade progression narrative (formerly "High School Evolution") */}
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 rounded-full bg-indigo-400" />
                  <h3 className="text-xl font-bold text-slate-900">Grade progression detail</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                  Provisional planning premise per grade. FTE figures are instructional-capacity assumptions, not payroll authorization.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {HS_YEAR_DATA.map((year, idx) => {
                    const incrementalFte = HS_RAMP_INCREMENT_FTE_BY_GRADE[idx];
                    const totalFteSoFar = HS_RAMP_TOTALS_FOR_DISPLAY[idx];
                    const dynamicFte = idx === 0
                      ? `${totalFteSoFar}-educator planning assumption`
                      : incrementalFte === 0
                        ? `No separate Grade 10 FTE step beyond the launch package, pending validation (${totalFteSoFar} total)`
                        : `Provisional +${incrementalFte} FTE (${totalFteSoFar} total)`;

                    return (
                      <motion.div key={year.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                        <Card className="h-full border-l-4 border-l-indigo-500">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{year.year}</span>
                                <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter", idx < 2 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{idx < 2 ? "Launch Phase" : "Expansion Phase"}</span>
                              </div>
                              <h3 className="text-xl font-bold text-slate-900">{year.scope}</h3>
                            </div>
                            <Badge variant={idx < 1 ? "info" : idx < 2 ? "purple" : "success"}>{year.model}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-6">{year.description}</p>
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Planning assumption</div>
                              <div className="text-sm font-bold text-slate-900">{dynamicFte}</div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Focus</div>
                              <div className="text-sm font-bold text-slate-900">{idx < 2 ? "Foundation" : "Graduation"}</div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Curriculum Offering</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {year.org.map((item) => (
                                <div key={item} className="flex items-center text-[11px] bg-white border border-slate-100 rounded-lg px-3 py-2 hover:border-indigo-200 transition-all">
                                  <div className="h-1.5 w-1.5 rounded-full shrink-0 mr-2 bg-indigo-400" />
                                  <span className="whitespace-normal font-medium text-slate-700">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                03  WEEKLY LOAD BY OFFER
                Placeholder — Rio curriculum validation pending.
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("weekly-load"), "space-y-6")}>

              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-cyan-500" />
                <h3 className="text-2xl font-bold text-slate-900">Weekly Load by Offer</h3>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100">
                    <Scale className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 mb-2">Pending Rio curriculum validation</div>
                    <p className="text-sm font-semibold leading-relaxed text-slate-700">
                      This view will show weekly instructional/contact load by course offer — not payroll, FTE, or contracted hours.
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      When Rio curriculum validation is complete, this table will display: course name, load category, slots per week per section, minutes per slot, number of sections, total weekly slots, total weekly minutes, total weekly contact hours, capability profile required, and validation status.
                    </p>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-cyan-700">
                      São Paulo reference data (A-F rotation, 255-minute cycle) is a planning signal only and must not be treated as Rio weekly load without explicit curriculum conversion and validation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Planned table columns</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Course / program name",
                    "Grade",
                    "Load category",
                    "Slots per week per section",
                    "Minutes per slot",
                    "Number of sections",
                    "Total weekly slots",
                    "Total weekly minutes",
                    "Total weekly contact hours",
                    "Capability profile",
                    "Validation status",
                  ].map((col) => (
                    <span key={col} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                04  CAPABILITY ARCHITECTURE
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("capability-architecture"), "space-y-6")}>

              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-indigo-500" />
                <h3 className="text-2xl font-bold text-slate-900">Capability Architecture</h3>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold leading-relaxed text-slate-500">
                  Capability examples — not final headcount. Profile requirements derive from the course offer and the mentorship architecture, not from FTE targets.
                </p>
              </div>

              {/* Load category preview */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Load categories</div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  {HS_LOAD_CATEGORY_PREVIEW.map((category) => (
                    <Card key={category.title} className="h-full">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h4 className="text-base font-bold text-slate-900">{category.title}</h4>
                        <Badge variant={category.variant}>Category</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Educator capability preview */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Capability mapping</div>
                    <h4 className="text-lg font-bold text-slate-900">Educator capability preview</h4>
                  </div>
                  <Badge variant="default">Capability examples, not final headcount</Badge>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {HS_CAPABILITY_PREVIEW_GROUPS.map((group) => (
                      <div key={group.title}>
                        <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">{group.title}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.profileIds.map((profileId) => (
                            <span key={`${group.title}-${profileId}`} className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold leading-snug text-slate-700">
                              {getHsProfileLabel(profileId)}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                05  SCHEDULE / MENTORSHIP MODEL
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("schedule-mentorship"), "space-y-6")}>

              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 rounded-full bg-cyan-500" />
                    <h3 className="text-2xl font-bold text-slate-900">Schedule / Mentorship Model</h3>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-slate-500">
                    Read-only instructional-capacity model for translating course design into future schedule and capability questions.
                  </p>
                </div>
                <Badge variant="info">Read-only preview</Badge>
              </div>

              {/* Process flow */}
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {[
                    "Course offer",
                    "Schedule unit",
                    "Minutes",
                    "Load category",
                    "Educator capability",
                    "Mock schedule",
                    "Capability implication",
                  ].map((step, idx) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-cyan-700 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-cyan-900">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rio / SP mode cards */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {HS_SCHEDULE_MODE_PREVIEW.map((mode) => (
                  <Card key={mode.title} className="h-full">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-base font-bold text-slate-900">{mode.title}</h4>
                      <Badge variant={mode.variant}>{mode.badge}</Badge>
                    </div>
                    <ul className="space-y-2">
                      {mode.items.map((item) => (
                        <li key={item} className="flex gap-2 text-xs font-medium leading-relaxed text-slate-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>

              {/* SP reference warning */}
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                São Paulo is a reference pattern, not a Rio staffing template. A-F rotation records are six-day-cycle references
                and should not be treated as weekly Rio loads unless explicitly converted and validated.
              </div>

              {/* Fixed mentorship block rule */}
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-600">Fixed mentorship block rule</div>
                <p className="text-xs font-semibold leading-relaxed text-purple-950">
                  Project Mentorship, Passion Project, and Innovation Diploma happen within a fixed synchronized mentorship block.
                  This block is protected in the timetable, so it should not conflict with regular subject teaching. It still counts
                  toward educator workload and must be assigned based on educator profile fit, available total workload capacity,
                  and group capacity.
                </p>
              </div>

              {/* Conversion caution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Conversion caution</div>
                <p className="text-xs font-semibold leading-relaxed text-slate-600">
                  The model supports Rio equivalents for a 255-minute A-F reference as {SP_AF_CONVERSION_PREVIEW.displaySingleBlockEquivalent}
                  {" "}single blocks or {SP_AF_CONVERSION_PREVIEW.displayDoubleBlockEquivalent} double blocks, with validation warnings.
                  Conversion should not be used as payroll truth without curriculum and HR validation.
                </p>
                <p className="mt-2 text-[10px] font-semibold leading-relaxed text-slate-400">{HIGH_SCHOOL_SCHEDULE_UNIT_COUNTING_NOTE}</p>
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                06  SCENARIO FIT
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("scenario-fit"), "space-y-6")}>

              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-purple-500" />
                <h3 className="text-2xl font-bold text-slate-900">Scenario Fit</h3>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                Scenario fit is instructional-capacity planning only and does not authorize payroll. High School scenarios are A, B, and C only.
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                {HIGH_SCHOOL_MOCK_SCHEDULE_SCENARIOS.map((scenario) => {
                  const scenarioCopy = HS_SCENARIO_PREVIEW_COPY[scenario.id];
                  return (
                    <Card key={scenario.id} className="h-full border-l-4 border-l-purple-500">
                      <div className="mb-5 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                            {scenarioCopy.title.split(":")[0]}
                          </span>
                          <Badge variant={scenarioCopy.variant}>{scenarioCopy.badge}</Badge>
                        </div>
                        <h4 className="text-lg font-bold leading-tight text-slate-900">{scenarioCopy.title}</h4>
                      </div>
                      <div className="space-y-3">
                        {[
                          ["Best use", scenarioCopy.bestUse],
                          ["Can cover", scenario.canCover[0]],
                          ["Cannot assume", scenario.cannotCover[0]],
                          ["Risk", scenario.risks[0]],
                          ["Fixed mentorship handling", scenario.fixedMentorshipBlockHandling],
                        ].map(([label, value]) => (
                          <div key={`${scenario.id}-${label}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                            <p className="text-[11px] font-medium leading-relaxed text-slate-600">{formatHighSchoolPreviewText(value)}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>

            </div>

            {/* ════════════════════════════════════════════════════════════
                07  PROVISIONAL LOAD
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("provisional-load"), "space-y-8")}>

              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-indigo-500" />
                <h3 className="text-2xl font-bold text-slate-900">Provisional Load</h3>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                {HS_STAFFING_VALIDATION_NOTE}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Load table */}
                <Card className="lg:col-span-2" title={`Provisional HS Load View (${sections * 25} learners/grade)`} icon={Scale}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase">Subject Area</th>
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G9</th>
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G10</th>
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G11</th>
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G12</th>
                          <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {HS_LOAD_DATA.map((row) => (
                          <tr key={row.subject} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4 text-xs font-bold text-slate-900">{row.subject}</td>
                            <td className="py-4 text-xs text-slate-500 text-center">{row.g9 * sections}p</td>
                            <td className="py-4 text-xs text-slate-500 text-center">{row.g10 * sections}p</td>
                            <td className="py-4 text-xs text-slate-500 text-center">{row.g11 * sections}p</td>
                            <td className="py-4 text-xs text-slate-500 text-center">{row.g12 * sections}p</td>
                            <td className="py-4 text-xs font-bold text-indigo-600 text-center">{(row.g9 + row.g10 + row.g11 + row.g12) * sections}p</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900 text-white">
                          <td className="py-4 px-4 text-xs font-bold">Total Periods</td>
                          <td className="py-4 text-xs font-bold text-center">{totalG9}p</td>
                          <td className="py-4 text-xs font-bold text-center">{totalG10}p</td>
                          <td className="py-4 text-xs font-bold text-center">{totalG11}p</td>
                          <td className="py-4 text-xs font-bold text-center">{totalG12}p</td>
                          <td className="py-4 text-xs font-bold text-center text-indigo-400">{totalHS}p</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Load capacity context (formerly "Instructional Planning View") */}
                <Card title="Load Capacity Context" icon={Users}>
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Planning assumption</div>
                      <div className="text-2xl font-bold text-slate-900">{specialists}-specialist capacity view</div>
                      <p className="mt-2 text-[10px] text-slate-400 leading-relaxed">Provisional planning premise. Not payroll authorization.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>Load utilization</span>
                        <span className={cn("font-bold", efficiency > 80 ? "text-emerald-600" : "text-amber-600")}>{efficiency.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", efficiency > 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${Math.min(100, efficiency)}%` }} />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Specialist integrity note</div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic">{SPECIALIST_INTEGRITY_NOTE}</p>
                    </div>
                  </div>
                </Card>

              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                08  ROADMAP / APPENDIX
            ════════════════════════════════════════════════════════════ */}
            <div className={cn(viewClassName("roadmap-appendix"), "space-y-8")}>

              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-purple-500 rounded-full" />
                <h3 className="text-2xl font-bold text-slate-900">Roadmap / Appendix</h3>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900">
                Roadmap values are planning premises. FTE figures are provisional instructional-capacity assumptions, not payroll authorization. Finance/HR validation is required before any ramp is treated as headcount authorization.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {HS_ROADMAP_DATA.map((stage, idx) => (
                  <motion.div key={stage.phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="h-full flex flex-col p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.year}</span>
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded uppercase tracking-tighter">High School</span>
                          </div>
                          <h4 className="text-xl font-bold text-slate-900 leading-tight">{stage.phase}</h4>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 uppercase tracking-tight">{stage.sections}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-6 whitespace-normal">{stage.description}</p>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Students</div><div className="text-lg font-bold text-slate-900">{stage.students}</div></div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Planning assumption</div><div className="text-lg font-bold text-slate-900">{stage.fte} FTE (provisional)</div></div>
                      </div>
                      <div className="space-y-2 mt-auto">
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Core Clusters</div>
                        {stage.clusters.map((cluster) => (
                          <div key={cluster.name} className="flex items-center justify-between p-2 bg-white border border-slate-50 rounded-lg shadow-sm group hover:border-purple-200 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-purple-400 transition-colors" />
                              <span className="text-[10px] font-medium text-slate-600 whitespace-normal">{cluster.name}</span>
                            </div>
                            <span className={cn("text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0", cluster.type === "SHARED" ? "bg-slate-100 text-slate-500" : "bg-purple-50 text-purple-500")}>{cluster.type}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

            </div>

          </main>
        </div>
      </section>
    </>
  );
};

export default HighSchoolTab;
