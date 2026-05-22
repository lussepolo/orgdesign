import {
  Microscope,
  BookOpen,
  Cpu,
  Globe,
  Music,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface GradeConfig {
  id: string;
  name: string;
  division: "Early Years" | "Lower School" | "Middle School" | "High School";
  cap: number;
  openYear: number;
  sharedStaffing?: boolean; // true = grade opens for students but has no incremental educator cost (covered by a shared pool)
}

export interface EducatorLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  totalCost: number;
}

export interface HSSubjectDistributionItem {
  subject: string;
  ftePerSection: number;
  description: string;
}

export interface CompensationDetail {
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  allocationModel: "FOPAG_DIRETO" | "FOLHA_DIRETA";
}

export interface RoleScorecard {
  role: string;
  division: string;
  owns: string[];
  load: string;
  profile: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface YearData {
  year: string;
  scope: string;
  sections: string;
  learners: string;
  fte: string;
  description: string;
  phase?: string;
  org: Array<{
    name: string;
    type: "ey" | "ls" | "ms" | "hs" | "shared";
  }>;
}

export const ANNUAL_ADJUSTMENT = 1.06;

export const GRADE_CONFIG: GradeConfig[] = [
  { id: "t1", name: "Toddlers 1", division: "Early Years", cap: 14, openYear: 2028 },
  { id: "t2", name: "Toddlers 2", division: "Early Years", cap: 14, openYear: 2028 },
  { id: "pk3", name: "Pre-K 3", division: "Early Years", cap: 18, openYear: 2028 },
  { id: "pk4", name: "Pre-K 4", division: "Early Years", cap: 18, openYear: 2028 },
  { id: "k", name: "Kinder", division: "Early Years", cap: 20, openYear: 2028 },

  { id: "g1", name: "Grade 1", division: "Lower School", cap: 22, openYear: 2028 },
  { id: "g2", name: "Grade 2", division: "Lower School", cap: 22, openYear: 2028 },
  { id: "g3", name: "Grade 3", division: "Lower School", cap: 22, openYear: 2028 },
  { id: "g4", name: "Grade 4", division: "Lower School", cap: 24, openYear: 2029 },
  { id: "g5", name: "Grade 5", division: "Lower School", cap: 24, openYear: 2030 },

  { id: "g6", name: "Grade 6", division: "Middle School", cap: 25, openYear: 2031 },
  { id: "g7", name: "Grade 7", division: "Middle School", cap: 25, openYear: 2032 },
  { id: "g8", name: "Grade 8", division: "Middle School", cap: 25, openYear: 2033 },

  { id: "g9",  name: "Grade 9",  division: "High School", cap: 25, openYear: 2034 },
  { id: "g10", name: "Grade 10", division: "High School", cap: 25, openYear: 2035, sharedStaffing: true },
  { id: "g11", name: "Grade 11", division: "High School", cap: 25, openYear: 2036 },
  { id: "g12", name: "Grade 12", division: "High School", cap: 25, openYear: 2037 },
];

export const EDUCATOR_LEVELS: EducatorLevel[] = [
  {
    id: "associate",
    name: "Associate Educator",
    description: "Early-years foundation educator focused on routine, care, and classroom consistency.",
    color: "bg-rose-500",
    grossMonthly: 7763.46,
    laborChargesMonthly: 3765.28,
    benefitsMonthly: 1128.10,
    totalCost: 12656.84,
  },
  {
    id: "specialist",
    name: "Specialist Educator",
    description: "Strong single-discipline teacher suited to stable grade-level delivery and core instruction.",
    color: "bg-indigo-500",
    grossMonthly: 10229.37,
    laborChargesMonthly: 4961.24,
    benefitsMonthly: 1138.56,
    totalCost: 16329.17,
  },
  {
    id: "master",
    name: "Master Educator",
    description: "Experienced lead educator with high instructional autonomy and mentoring capacity.",
    color: "bg-emerald-500",
    grossMonthly: 15247.55,
    laborChargesMonthly: 7395.06,
    benefitsMonthly: 1159.83,
    totalCost: 23802.44,
  },
  {
    id: "inspirational",
    name: "Inspirational Educator",
    description: "Advanced practice leader for high-visibility classrooms, innovation, and coaching.",
    color: "bg-amber-500",
    grossMonthly: 17768.85,
    laborChargesMonthly: 8617.89,
    benefitsMonthly: 1216.37,
    totalCost: 27603.11,
  },
  {
    id: "distinguished",
    name: "Distinguished Educator",
    description: "Top-caliber flagship educator reserved for exceptional program-building and brand-defining roles.",
    color: "bg-purple-600",
    grossMonthly: 19577.98,
    laborChargesMonthly: 9495.32,
    benefitsMonthly: 1224.05,
    totalCost: 30297.35,
  },
];

export const LEARNING_ASSISTANT_COST = 7822.07;
export const LEARNING_MONITOR_COST = 7024.96;

export const LEARNING_ASSISTANT_DETAIL: CompensationDetail = {
  grossMonthly: 4595.88,
  laborChargesMonthly: 2229.0,
  benefitsMonthly: 997.19,
  allocationModel: "FOPAG_DIRETO",
};

export const LEARNING_MONITOR_DETAIL: CompensationDetail = {
  grossMonthly: 4060.63,
  laborChargesMonthly: 1969.41,
  benefitsMonthly: 994.92,
  allocationModel: "FOPAG_DIRETO",
};

export const HS_FTE_RATIO = 1.35;

export const ENROLLMENT_PROJECTIONS: Record<string, number> = {
  "Early Years": 168,
  "Lower School": 220,
  "Middle School": 150,
  "High School": 100,
};

export const HS_SUBJECT_DISTRIBUTION: HSSubjectDistributionItem[] = [
  {
    subject: "Humanities",
    ftePerSection: 0.39,
    description: "Portuguese, History, Geography, and Social Sciences coverage.",
  },
  {
    subject: "STEM",
    ftePerSection: 0.39,
    description: "Math and lab sciences across the high-school schedule.",
  },
  {
    subject: "Signature",
    ftePerSection: 0.38,
    description: "AI, Engineering, Maker, and arts-integrated signature programming.",
  },
  {
    subject: "Bilingual",
    ftePerSection: 0.19,
    description: "English and Global Perspectives language-intensive instruction.",
  },
];

export const SUBJECT_TO_CATEGORY: Record<string, string> = {
  Portuguese: "Humanities",
  History: "Humanities",
  Geography: "Humanities",
  "Social Sciences": "Humanities",
  Math: "STEM",
  Physics: "STEM",
  Biology: "STEM",
  Chemistry: "STEM",
  AI: "Signature",
  Engineering: "Signature",
  Maker: "Signature",
  Arts: "Signature",
  English: "Bilingual",
  "Global Perspectives": "Bilingual",
};

export const ROLE_SCORECARDS: RoleScorecard[] = [
  {
    role: "STEM Specialist",
    division: "Middle School",
    owns: ["Math", "Physics foundations", "Scientific reasoning"],
    load: "27 periods",
    profile: "Strong disciplinary specialist with interdisciplinary comfort",
    icon: Microscope,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    role: "Humanities Specialist",
    division: "Middle School",
    owns: ["Portuguese", "History", "Geography", "Social Sciences"],
    load: "27 periods",
    profile: "Humanities generalist with strong literacy practice",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    role: "Signature Programs Specialist",
    division: "High School",
    owns: ["AI", "Maker", "Innovation pathways"],
    load: "24 to 27 periods",
    profile: "Project-led specialist with portfolio and studio experience",
    icon: Cpu,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    role: "Bilingual Specialist",
    division: "High School",
    owns: ["English", "Global Perspectives", "AP language support"],
    load: "24 to 27 periods",
    profile: "High verbal range, strong writing instruction, AP readiness",
    icon: Globe,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    role: "Arts Educator",
    division: "Shared",
    owns: ["Studio Arts", "Creative production"],
    load: "Shared across divisions",
    profile: "Practice-based specialist with exhibition mindset",
    icon: Palette,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    role: "Music Educator",
    division: "Shared",
    owns: ["Music", "Performance", "Composition"],
    load: "Shared across divisions",
    profile: "Performance + pedagogy blend",
    icon: Music,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export const SCENARIO_DATA = [
  { label: "Lean Launch", msSections: 1, hsSections: 1 },
  { label: "Standard Growth", msSections: 2, hsSections: 1 },
  { label: "Full Scale", msSections: 2, hsSections: 2 },
];

export const YEAR_DATA: YearData[] = [
  {
    year: "2028",
    scope: "Foundational Years",
    sections: "10 sections",
    learners: "168",
    fte: "18.0",
    phase: "Early Years",
    description: "Early Years opens the campus and establishes the pedagogical culture.",
    org: [
      { name: "Associate Educators", type: "ey" },
      { name: "Learning Assistants", type: "ey" },
      { name: "Learning Monitors", type: "ey" },
    ],
  },
  {
    year: "2029",
    scope: "Lower School Expansion",
    sections: "14 sections",
    learners: "256",
    fte: "27.0",
    phase: "Lower School",
    description: "Lower School grows instructional breadth with stronger specialist support.",
    org: [
      { name: "Master Educators", type: "ls" },
      { name: "Learning Assistants", type: "ls" },
      { name: "Shared Specialists", type: "shared" },
    ],
  },
  {
    year: "2031",
    scope: "Middle School Launch",
    sections: "20 sections",
    learners: "406",
    fte: "43.0",
    phase: "Middle School",
    description: "Middle School launches with cluster-based staffing and bridge logic.",
    org: [
      { name: "Humanities Cluster", type: "ms" },
      { name: "STEM Cluster", type: "ms" },
      { name: "Learning Specialist", type: "shared" },
    ],
  },
  {
    year: "2034",
    scope: "High School Opening",
    sections: "26 sections",
    learners: "556",
    fte: "60.0",
    phase: "High School",
    description: "High School opens with a blend of bridge staffing and dedicated specialists.",
    org: [
      { name: "High School Specialists", type: "hs" },
      { name: "AP / Signature Cluster", type: "hs" },
      { name: "Shared Arts & Music", type: "shared" },
    ],
  },
  {
    year: "2037",
    scope: "Full Campus Operation",
    sections: "32 sections",
    learners: "638",
    fte: "78.0",
    phase: "High School",
    description: "The campus reaches full K-12 maturity with full specialist and operational layering.",
    org: [
      { name: "Division Leadership", type: "shared" },
      { name: "Back Office Platform", type: "shared" },
      { name: "Campus Specialists", type: "shared" },
    ],
  },
];
