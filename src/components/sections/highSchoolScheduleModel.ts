export type ScheduleMode = "rio_weekly" | "sao_paulo_reference";

export type ScheduleUnitKind =
  | "rio_single_45"
  | "rio_double_90"
  | "sp_rotation_af_255"
  | "sp_x_block_75"
  | "sp_x_block_60"
  | "sp_advisory_25"
  | "fixed_mentorship_block"
  | "shared_program_block"
  | "ambiguous_custom";

export type LoadCategory =
  | "teaching_load"
  | "mentorship_contact_load"
  | "program_ownership_load";

export type FitStatus =
  | "clean_fit"
  | "single_double_combination"
  | "alternating_week_pattern"
  | "needs_curriculum_validation";

export type GradeLevel = "g9" | "g10" | "g11" | "g12";

export type ScenarioId =
  | "scenario_a_shared_ms_hs_bridge"
  | "scenario_b_transitional_part_time_hs"
  | "scenario_c_mature_hs_specialist";

export type DeliveryModel =
  | "internal_full_time_educator"
  | "internal_part_time_educator"
  | "shared_ms_hs_educator"
  | "external_online_provider"
  | "independent_study_supervision"
  | "mentorship_based_supervision";

export type EvidenceLevel =
  | "explicit_duration"
  | "counted_from_timetable_grid"
  | "inferred_from_timetable"
  | "assumed_standard_block"
  | "compressed_total_only"
  | "reference_only"
  | "ambiguous"
  | "needs_curriculum_validation";

export type MaturityLevel = "launch_ready" | "transitional" | "mature_model_only" | "reference_only";

export type SharedCredibility = "high" | "medium" | "low" | "risky";

export type FeasibilityLevel = "high" | "medium" | "low";

export interface ScheduleUnit {
  id: ScheduleUnitKind;
  label: string;
  minutes: number | null;
  scheduleMode: ScheduleMode;
  countsTowardTeachingLoad: boolean;
  countsTowardMentorshipContact: boolean;
  countsTowardProgramOwnership: boolean;
  isFixedSynchronizedBlock: boolean;
  validationRequired: boolean;
  notes: string;
}

export interface CourseLoadItem {
  id: string;
  grade: GradeLevel;
  courseProgramName: string;
  category:
    | "core_academic_subject"
    | "advanced_ap_course"
    | "program_pathway_function"
    | "advisory_counseling_mentorship_function";
  domain: string;
  subdomain?: string;
  loadCategory: LoadCategory;
  scheduleUnitId: ScheduleUnitKind;
  weeklySlots: number | null;
  minutesPerSlot: number | null;
  weeklyMinutes: number | null;
  weeklyHours: number | null;
  slotEvidenceLevel: EvidenceLevel;
  source: "rio_mock" | "sao_paulo_reference" | "manual_validation";
  requiredHiringProfileIds: string[];
  credentialOrSpecializationRequirement?: string;
  deliveryModelOptions: DeliveryModel[];
  scenarioFit: ScenarioId[];
  maturity: MaturityLevel;
  hrPayrollValidationRequired: boolean;
  validationRequired: boolean;
  notes: string;
}

export interface MentorshipLoadItem {
  id: string;
  label: string;
  grade: GradeLevel;
  fixedBlockId: ScheduleUnitKind;
  isFixedSynchronizedBlock: boolean;
  weeklyMinutes: number | null;
  mentorshipGroupsRequired: number | null;
  maxGroupsPerEducator: number;
  requiredEducatorProfileIds: string[];
  countsTowardMentorshipContact: boolean;
  requiresProfileFit: boolean;
  validationRequired: boolean;
  notes: string;
}

export interface EducatorCapabilityProfile {
  id: string;
  label: string;
  canCoverDomains: string[];
  shouldNotCoverDomains: string[];
  canAbsorbMentorship: boolean;
  canAbsorbProgramOwnership: boolean;
  sharedMsHsCredibility: SharedCredibility;
  partTimeFeasibility: FeasibilityLevel;
  maxMentorshipGroups: number;
  specialistTrigger: string;
  notes: string;
}

export interface EducatorAssignment {
  profileId: string;
  assignedTeachingMinutes: number;
  assignedMentorshipMinutes: number;
  assignedProgramOwnershipUnits: number;
  targetTeachingMinutes: number;
  maxTeachingMinutes: number;
  targetTotalMinutes: number;
  mentorshipGroupsAssigned: number;
  status: "under_target" | "viable" | "overloaded" | "profile_mismatch" | "needs_validation";
  notes: string[];
}

export interface MockScheduleScenario {
  id: ScenarioId;
  label: string;
  activeGrades: GradeLevel[];
  scheduleMode: ScheduleMode;
  assumptions: string[];
  canCover: string[];
  cannotCover: string[];
  requiredProfileIds: string[];
  fixedMentorshipBlockHandling: string;
  sharedRoleLogic: string;
  partTimeRoleLogic: string;
  risks: string[];
  unresolvedInputs: string[];
}

export interface ScenarioOutput {
  scenarioId: ScenarioId;
  totalSlotsByDomain: Record<string, number>;
  totalMinutesByDomain: Record<string, number>;
  requiredProfileIds: string[];
  assignments: EducatorAssignment[];
  sharedRoleOpportunities: string[];
  partTimeRoleOpportunities: string[];
  overloadRisks: string[];
  underloadRisks: string[];
  validationWarnings: string[];
}

export const HIGH_SCHOOL_SCHEDULE_UNITS: Record<ScheduleUnitKind, ScheduleUnit> = {
  rio_single_45: {
    id: "rio_single_45",
    label: "Rio single block",
    minutes: 45,
    scheduleMode: "rio_weekly",
    countsTowardTeachingLoad: true,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Rio weekly planning unit. Use for direct subject or mentorship contact when curriculum validates it.",
  },
  rio_double_90: {
    id: "rio_double_90",
    label: "Rio double block",
    minutes: 90,
    scheduleMode: "rio_weekly",
    countsTowardTeachingLoad: true,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Rio weekly double block. Likely unit for labs, seminars, projects, and long-form work if validated.",
  },
  sp_rotation_af_255: {
    id: "sp_rotation_af_255",
    label: "Sao Paulo A-F rotation record",
    minutes: 255,
    scheduleMode: "sao_paulo_reference",
    countsTowardTeachingLoad: true,
    countsTowardMentorshipContact: false,
    countsTowardProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only mature-model unit inferred as Period 1 + Period 3 + Period 4 across a six-day rotation.",
  },
  sp_x_block_75: {
    id: "sp_x_block_75",
    label: "Sao Paulo X-block, 75 minutes",
    minutes: 75,
    scheduleMode: "sao_paulo_reference",
    countsTowardTeachingLoad: true,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only fixed weekday block. Can represent course, mentorship, or program contact depending on label.",
  },
  sp_x_block_60: {
    id: "sp_x_block_60",
    label: "Sao Paulo X-block, 60 minutes",
    minutes: 60,
    scheduleMode: "sao_paulo_reference",
    countsTowardTeachingLoad: true,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only shorter Wednesday-style block found in the Sao Paulo file.",
  },
  sp_advisory_25: {
    id: "sp_advisory_25",
    label: "Sao Paulo advisory",
    minutes: 25,
    scheduleMode: "sao_paulo_reference",
    countsTowardTeachingLoad: false,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only advisory unit. Recurrence and Wednesday duration require validation before Rio modeling.",
  },
  fixed_mentorship_block: {
    id: "fixed_mentorship_block",
    label: "Fixed Project Mentorship Block",
    minutes: null,
    scheduleMode: "rio_weekly",
    countsTowardTeachingLoad: false,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: true,
    isFixedSynchronizedBlock: true,
    validationRequired: true,
    notes: "Protected Rio mentorship block. It does not conflict with regular subject teaching, but it counts toward workload.",
  },
  shared_program_block: {
    id: "shared_program_block",
    label: "Shared program block",
    minutes: null,
    scheduleMode: "rio_weekly",
    countsTowardTeachingLoad: false,
    countsTowardMentorshipContact: true,
    countsTowardProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Count once per educator-contact block unless simultaneous groups or educators are shown.",
  },
  ambiguous_custom: {
    id: "ambiguous_custom",
    label: "Ambiguous/custom block",
    minutes: null,
    scheduleMode: "rio_weekly",
    countsTowardTeachingLoad: false,
    countsTowardMentorshipContact: false,
    countsTowardProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Use only as a placeholder until curriculum or timetable validation resolves duration and workload treatment.",
  },
};

export const HIGH_SCHOOL_LOAD_CATEGORY_RULES: Record<LoadCategory, string[]> = {
  teaching_load: [
    "Core subjects and AP courses map to teaching load.",
    "Teaching load fills educator capacity before mentorship/contact load is assigned.",
  ],
  mentorship_contact_load: [
    "Project Mentorship, Passion Project, Innovation Diploma, and Independent Study map to mentorship/contact load.",
    "Project Mentorship, Passion Project, and Innovation Diploma are grouped under the Project Mentorship umbrella.",
  ],
  program_ownership_load: [
    "Pathways, Leadership, GCD, and College/Career guidance map to program ownership unless scheduled as direct student-contact blocks.",
    "GCD sits inside Pathways or Leadership, not as a separate additive workload bucket unless validated later.",
  ],
};

export const HIGH_SCHOOL_PROGRAM_BLOCK_COUNTING_RULES = [
  "Innovation Diploma and Passion Project are counted inside Project Mentorship, not as separate additive workload buckets.",
  "Project Mentorship occurs in a fixed synchronized mentorship block.",
  "The fixed mentorship block does not conflict with regular subject teaching because it is protected in the timetable.",
  "Mentorship still counts toward educator workload.",
  "Mentorship capacity should be modeled by both minutes and number of mentorship groups.",
  "GCD is counted inside Pathways or Leadership, not as a separate additive workload bucket unless validated later.",
  "Shared or cross-grade blocks count once per educator-contact block, not once per section, unless simultaneous separate groups or educators are shown.",
  "Program ownership is real workload but not automatically a teaching block or new payroll role.",
  "Portfolio evidence, evidence workflow, documentation workflow, and evidence curation are excluded from this High School load model.",
];

const toOneDecimal = (value: number): number => Math.round(value * 10) / 10;

export const minutesToRioSingleBlocks = (minutes: number): number => toOneDecimal(minutes / 45);

export const minutesToRioDoubleBlocks = (minutes: number): number => toOneDecimal(minutes / 90);

export const getRioFitStatus = (
  minutes: number,
  sourceUnitKind?: ScheduleUnitKind,
): FitStatus => {
  if (sourceUnitKind && ["sp_rotation_af_255", "shared_program_block", "ambiguous_custom"].includes(sourceUnitKind)) {
    return "needs_curriculum_validation";
  }

  if (minutes % 45 === 0 || minutes % 90 === 0) return "clean_fit";

  const hasPracticalSingleDoubleMix = [135, 180, 225, 270, 315].includes(minutes);
  if (hasPracticalSingleDoubleMix) return "single_double_combination";

  return "alternating_week_pattern";
};

export const convertSaoPauloMinutesToRioEquivalent = (
  minutes: number,
  sourceUnitKind?: ScheduleUnitKind,
) => ({
  weeklyMinutes: minutes,
  rioSingleBlockEquivalent: minutesToRioSingleBlocks(minutes),
  rioDoubleBlockEquivalent: minutesToRioDoubleBlocks(minutes),
  fitStatus: getRioFitStatus(minutes, sourceUnitKind),
});

export const HIGH_SCHOOL_EDUCATOR_CAPABILITY_PROFILES: EducatorCapabilityProfile[] = [
  {
    id: "hs_portuguese_redacao",
    label: "HS Portuguese / Redacao",
    canCoverDomains: ["Portuguese", "Redacao", "Brazilian Studies writing"],
    shouldNotCoverDomains: ["English Language Arts", "AP English", "Natural Sciences"],
    canAbsorbMentorship: false,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "low",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 0,
    specialistTrigger: "Grade 11-12 writing, graduation, or advanced Portuguese demands exceed part-time capacity.",
    notes: "Can support pathway communication in Portuguese, but should not become a generic project mentor by default.",
  },
  {
    id: "hs_english_research_communication",
    label: "HS English / Research Communication",
    canCoverDomains: ["English Language Arts", "AP Language", "AP Literature", "research communication"],
    shouldNotCoverDomains: ["Portuguese", "Biology", "Chemistry", "Physics"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 2,
    specialistTrigger: "AP Seminar, AP Research, AP Language, or AP Literature becomes active at scale.",
    notes: "Good fit for research communication mentorship when teaching load leaves capacity.",
  },
  {
    id: "hs_mathematics_advanced_math",
    label: "HS Mathematics / Advanced Mathematics",
    canCoverDomains: ["Integrated Mathematics", "Advanced Mathematics", "AP Precalculus", "AP Calculus", "data analysis"],
    shouldNotCoverDomains: ["Biology", "Chemistry", "English Language Arts"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: false,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 1,
    specialistTrigger: "AP Precalculus, AP Calculus, or advanced quantitative pathway demand becomes active.",
    notes: "Can mentor quantitative, finance, market-sizing, data, and impact-measurement projects.",
  },
  {
    id: "biology_specialist",
    label: "Biology Specialist",
    canCoverDomains: ["Biology", "AP Biology", "health science", "environmental science"],
    shouldNotCoverDomains: ["Chemistry", "Physics", "AP Calculus"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: false,
    sharedMsHsCredibility: "risky",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 1,
    specialistTrigger: "AP Biology, lab science, or pathway-specific biology coverage is required.",
    notes: "Do not collapse into a generic science profile without validating credentials.",
  },
  {
    id: "chemistry_specialist",
    label: "Chemistry Specialist",
    canCoverDomains: ["Chemistry", "AP Chemistry", "lab chemistry"],
    shouldNotCoverDomains: ["Biology", "Physics", "AP Literature"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: false,
    sharedMsHsCredibility: "risky",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 1,
    specialistTrigger: "AP Chemistry, lab chemistry, or chemistry-specific pathway demand is required.",
    notes: "Chemistry coverage should not be hidden inside a generic Natural Sciences label.",
  },
  {
    id: "physics_specialist",
    label: "Physics Specialist",
    canCoverDomains: ["Physics", "mechanics", "engineering physics", "measurement"],
    shouldNotCoverDomains: ["Biology", "Chemistry", "Portuguese"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: false,
    sharedMsHsCredibility: "risky",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 1,
    specialistTrigger: "Physics-specific lab, engineering, or advanced science pathway demand is required.",
    notes: "Can mentor prototyping, mechanics, or measurement-heavy projects if capacity exists.",
  },
  {
    id: "hs_humanities_ap_world_history",
    label: "HS Humanities / AP World History",
    canCoverDomains: ["Social Sciences", "History", "AP World History", "AP Human Geography", "AP Macroeconomics"],
    shouldNotCoverDomains: ["Portuguese language mechanics", "AP English composition", "Natural Sciences"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 2,
    specialistTrigger: "AP humanities, macro, or advanced social-science pathway demand is active.",
    notes: "Strong fit for civic inquiry, SDG/context research, stakeholder mapping, and debate.",
  },
  {
    id: "ap_seminar_research",
    label: "AP Seminar / AP Research Capable Educator",
    canCoverDomains: ["AP Seminar", "AP Research", "research methods", "argumentation"],
    shouldNotCoverDomains: ["AP Calculus", "lab sciences"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "low",
    partTimeFeasibility: "medium",
    maxMentorshipGroups: 3,
    specialistTrigger: "AP Capstone sequence or external-facing research pathway becomes active.",
    notes: "Can coordinate research mentorship but should not become a generic all-domain project mentor.",
  },
  {
    id: "pathways_college_career",
    label: "Pathways / College-Career Guidance",
    canCoverDomains: ["Pathways", "College/Career", "advisory", "course selection"],
    shouldNotCoverDomains: ["Core AP subject instruction", "lab sciences"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "medium",
    maxMentorshipGroups: 2,
    specialistTrigger: "College-facing pathways, internships, or graduation planning require explicit ownership.",
    notes: "Program ownership can be substantial even when direct contact minutes are low.",
  },
  {
    id: "innovation_design_technologies_project_mentorship",
    label: "Innovation / Design Technologies / Project Mentorship",
    canCoverDomains: ["Innovation", "Design Technologies", "Project Mentorship", "prototyping", "applied design"],
    shouldNotCoverDomains: ["AP Biology", "AP Chemistry", "AP Literature"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "medium",
    maxMentorshipGroups: 4,
    specialistTrigger: "Project group volume exceeds available profile-fit educator capacity.",
    notes: "Mentorship is scheduled in a protected block and should not be treated as leftover filler.",
  },
  {
    id: "gcd_leadership",
    label: "GCD / Leadership",
    canCoverDomains: ["Leadership", "Global Citizen Diploma", "global citizenship", "public contribution"],
    shouldNotCoverDomains: ["Core AP subject instruction", "advanced mathematics"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "medium",
    maxMentorshipGroups: 2,
    specialistTrigger: "GCD or Leadership becomes scheduled, assessed, and externally visible.",
    notes: "GCD should sit inside Pathways or Leadership until validated as an independent workload bucket.",
  },
  {
    id: "body_movement",
    label: "Body & Movement",
    canCoverDomains: ["Body & Movement", "wellness", "physical education"],
    shouldNotCoverDomains: ["Core academic/AP subject instruction"],
    canAbsorbMentorship: false,
    canAbsorbProgramOwnership: false,
    sharedMsHsCredibility: "high",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 0,
    specialistTrigger: "Section and grade load exceeds shared specialist capacity.",
    notes: "Relevant to HS schedule load but usually not a High School-only academic hiring profile.",
  },
];

export const DEFAULT_FIXED_PROJECT_MENTORSHIP_BLOCK: ScheduleUnit = {
  id: "fixed_mentorship_block",
  label: "Fixed Project Mentorship Block",
  minutes: null,
  scheduleMode: "rio_weekly",
  countsTowardTeachingLoad: false,
  countsTowardMentorshipContact: true,
  countsTowardProgramOwnership: true,
  isFixedSynchronizedBlock: true,
  validationRequired: true,
  notes:
    "Rio duration is not validated. This protected synchronized block contains Project Mentorship, Passion Project, and Innovation Diploma contact logic.",
};

export const HIGH_SCHOOL_MENTORSHIP_LOAD_ITEMS: MentorshipLoadItem[] = [
  {
    id: "g9_project_mentorship_foundation",
    label: "Grade 9 Project Mentorship foundation",
    grade: "g9",
    fixedBlockId: "fixed_mentorship_block",
    isFixedSynchronizedBlock: true,
    weeklyMinutes: null,
    mentorshipGroupsRequired: null,
    maxGroupsPerEducator: 3,
    requiredEducatorProfileIds: [
      "hs_english_research_communication",
      "hs_humanities_ap_world_history",
      "innovation_design_technologies_project_mentorship",
      "pathways_college_career",
    ],
    countsTowardMentorshipContact: true,
    requiresProfileFit: true,
    validationRequired: true,
    notes: "Use only if Rio validates Grade 9 mentorship contact. Do not assign as leftover capacity without profile fit.",
  },
  {
    id: "g11_g12_mature_project_mentorship",
    label: "Grade 11-12 mature project mentorship",
    grade: "g12",
    fixedBlockId: "fixed_mentorship_block",
    isFixedSynchronizedBlock: true,
    weeklyMinutes: null,
    mentorshipGroupsRequired: null,
    maxGroupsPerEducator: 4,
    requiredEducatorProfileIds: [
      "ap_seminar_research",
      "innovation_design_technologies_project_mentorship",
      "pathways_college_career",
      "gcd_leadership",
    ],
    countsTowardMentorshipContact: true,
    requiresProfileFit: true,
    validationRequired: true,
    notes: "May require dedicated coordination if group volume exceeds profile-fit educator capacity.",
  },
];

const hours = (minutes: number): number => toOneDecimal(minutes / 60);

export const SAO_PAULO_REFERENCE_COURSE_LOAD_ITEMS: CourseLoadItem[] = [
  {
    id: "sp_g9_portuguese_redacao",
    grade: "g9",
    courseProgramName: "Portuguese / Redacao",
    category: "core_academic_subject",
    domain: "Portuguese",
    subdomain: "Redacao",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_portuguese_redacao"],
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Source label: Lingua Portuguesa I. Reference-only; Rio frequency requires curriculum validation.",
  },
  {
    id: "sp_g9_ela",
    grade: "g9",
    courseProgramName: "English Language Arts",
    category: "core_academic_subject",
    domain: "English",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_english_research_communication"],
    deliveryModelOptions: ["shared_ms_hs_educator", "internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: [
      "scenario_a_shared_ms_hs_bridge",
      "scenario_b_transitional_part_time_hs",
      "scenario_c_mature_hs_specialist",
    ],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Shared MS/HS only credible with validated HS writing and advanced-English expertise.",
  },
  {
    id: "sp_g9_integrated_math",
    grade: "g9",
    courseProgramName: "Integrated Mathematics",
    category: "core_academic_subject",
    domain: "Mathematics",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_mathematics_advanced_math"],
    deliveryModelOptions: ["shared_ms_hs_educator", "internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: [
      "scenario_a_shared_ms_hs_bridge",
      "scenario_b_transitional_part_time_hs",
      "scenario_c_mature_hs_specialist",
    ],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Source label: Algebra I. Rio should validate whether Grade 9 uses Algebra I, integrated math, or another sequence.",
  },
  {
    id: "sp_g9_integrated_natural_sciences",
    grade: "g9",
    courseProgramName: "Integrated Natural Sciences",
    category: "core_academic_subject",
    domain: "Natural Sciences",
    subdomain: "Biology / Chemistry / Physics foundation",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["biology_specialist", "chemistry_specialist", "physics_specialist"],
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Reference item is integrated; do not assume one generic science educator can cover all three disciplines.",
  },
  {
    id: "sp_g9_ap_human_geography",
    grade: "g9",
    courseProgramName: "AP Human Geography",
    category: "advanced_ap_course",
    domain: "Humanities",
    subdomain: "AP Human Geography",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 2,
    minutesPerSlot: 255,
    weeklyMinutes: 510,
    weeklyHours: hours(510),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_humanities_ap_world_history"],
    credentialOrSpecializationRequirement: "AP humanities capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Audited source contains AP Human Geography, not AP World History, for Grade 9.",
  },
  {
    id: "sp_g10_ap_seminar",
    grade: "g10",
    courseProgramName: "AP Seminar",
    category: "advanced_ap_course",
    domain: "AP Capstone",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["ap_seminar_research", "hs_english_research_communication"],
    credentialOrSpecializationRequirement: "AP Seminar capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "High load in Sao Paulo reference. Rio should validate if AP Seminar begins in Grade 10.",
  },
  {
    id: "sp_g10_ap_computer_science_principles",
    grade: "g10",
    courseProgramName: "AP Computer Science Principles",
    category: "advanced_ap_course",
    domain: "Computer Science",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 1,
    minutesPerSlot: 255,
    weeklyMinutes: 255,
    weeklyHours: hours(255),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["innovation_design_technologies_project_mentorship"],
    credentialOrSpecializationRequirement: "AP Computer Science Principles capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Source spelling is AP Computer Sciences Principles. Rio naming should be normalized.",
  },
  {
    id: "sp_g11_ap_language_and_composition",
    grade: "g11",
    courseProgramName: "AP Language and Composition",
    category: "advanced_ap_course",
    domain: "English",
    subdomain: "AP Language",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 3,
    minutesPerSlot: 255,
    weeklyMinutes: 765,
    weeklyHours: hours(765),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_english_research_communication"],
    credentialOrSpecializationRequirement: "AP English capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Mature-reference AP English load; not a Rio launch commitment.",
  },
  {
    id: "sp_g11_ap_biology",
    grade: "g11",
    courseProgramName: "AP Biology",
    category: "advanced_ap_course",
    domain: "Natural Sciences",
    subdomain: "Biology",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_x_block_75",
    weeklySlots: 1,
    minutesPerSlot: 75,
    weeklyMinutes: 75,
    weeklyHours: hours(75),
    slotEvidenceLevel: "explicit_duration",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["biology_specialist"],
    credentialOrSpecializationRequirement: "AP Biology capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Reference X-block. AP Biology should not be hidden under generic science.",
  },
  {
    id: "sp_g11_ap_chemistry",
    grade: "g11",
    courseProgramName: "AP Chemistry",
    category: "advanced_ap_course",
    domain: "Natural Sciences",
    subdomain: "Chemistry",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_x_block_75",
    weeklySlots: 1,
    minutesPerSlot: 75,
    weeklyMinutes: 75,
    weeklyHours: hours(75),
    slotEvidenceLevel: "explicit_duration",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["chemistry_specialist"],
    credentialOrSpecializationRequirement: "AP Chemistry capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Reference X-block. AP Chemistry should not be hidden under generic science.",
  },
  {
    id: "sp_g12_independent_study",
    grade: "g12",
    courseProgramName: "Independent Study",
    category: "program_pathway_function",
    domain: "Independent Study",
    loadCategory: "mentorship_contact_load",
    scheduleUnitId: "shared_program_block",
    weeklySlots: 5,
    minutesPerSlot: null,
    weeklyMinutes: 885,
    weeklyHours: hours(885),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["ap_seminar_research", "pathways_college_career"],
    deliveryModelOptions: ["independent_study_supervision", "mentorship_based_supervision"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Mixed rotation and X-block evidence. Treat as mentorship/contact load requiring profile-fit supervision.",
  },
  {
    id: "sp_g12_ap_calculus",
    grade: "g12",
    courseProgramName: "AP Calculus",
    category: "advanced_ap_course",
    domain: "Mathematics",
    subdomain: "AP Calculus",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 1,
    minutesPerSlot: 255,
    weeklyMinutes: 255,
    weeklyHours: hours(255),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_mathematics_advanced_math"],
    credentialOrSpecializationRequirement: "AP Calculus capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Mature-reference advanced mathematics load.",
  },
  {
    id: "sp_g12_ap_precalculus",
    grade: "g12",
    courseProgramName: "AP Precalculus",
    category: "advanced_ap_course",
    domain: "Mathematics",
    subdomain: "AP Precalculus",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    weeklySlots: 1,
    minutesPerSlot: 255,
    weeklyMinutes: 255,
    weeklyHours: hours(255),
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_mathematics_advanced_math"],
    credentialOrSpecializationRequirement: "AP Precalculus capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Mature-reference advanced mathematics load.",
  },
  {
    id: "sp_g12_innovation_design_technologies",
    grade: "g12",
    courseProgramName: "Innovation / Design Technologies",
    category: "program_pathway_function",
    domain: "Innovation",
    subdomain: "Design Technologies",
    loadCategory: "mentorship_contact_load",
    scheduleUnitId: "sp_x_block_75",
    weeklySlots: 1,
    minutesPerSlot: 75,
    weeklyMinutes: 75,
    weeklyHours: hours(75),
    slotEvidenceLevel: "explicit_duration",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["innovation_design_technologies_project_mentorship"],
    deliveryModelOptions: ["mentorship_based_supervision", "internal_part_time_educator"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes: "Source label includes Maker in Sao Paulo; normalized to Innovation / Design Technologies for Rio planning.",
  },
];

export const HIGH_SCHOOL_MOCK_SCHEDULE_SCENARIOS: MockScheduleScenario[] = [
  {
    id: "scenario_a_shared_ms_hs_bridge",
    label: "Scenario A: Shared MS/HS bridge",
    activeGrades: ["g9", "g10"],
    scheduleMode: "rio_weekly",
    assumptions: [
      "Shared educators are advanced bridge profiles, not generic Middle School educators.",
      "Rio block durations and subject frequencies remain curriculum-validation items.",
    ],
    canCover: [
      "Early integrated mathematics if HS capability is validated.",
      "Selected English and humanities continuity if AP/advanced expectations are limited.",
      "Some Pathways, Advisory, and mentorship routines if capacity and profile fit exist.",
    ],
    cannotCover: [
      "Full Biology, Chemistry, and Physics expectations without validated science expertise.",
      "AP-level humanities and advanced English composition without validated HS expertise.",
    ],
    requiredProfileIds: [
      "hs_mathematics_advanced_math",
      "hs_english_research_communication",
      "hs_humanities_ap_world_history",
      "biology_specialist",
      "chemistry_specialist",
      "physics_specialist",
    ],
    fixedMentorshipBlockHandling:
      "Fixed mentorship block can use available educators only when profile fit and total workload capacity are validated.",
    sharedRoleLogic: "Shared roles are credible only for selected domains with validated HS expertise.",
    partTimeRoleLogic: "Part-time science or AP exceptions may be needed even in the lean bridge.",
    risks: [
      "Weak High School identity.",
      "Pressure on Middle School staffing.",
      "Understated Biology, Chemistry, Physics, and AP expectations.",
    ],
    unresolvedInputs: [
      "Rio weekly subject slots.",
      "Science strand split.",
      "AP sequence timing.",
      "Mentorship group count and fixed block duration.",
    ],
  },
  {
    id: "scenario_b_transitional_part_time_hs",
    label: "Scenario B: Transitional part-time High School",
    activeGrades: ["g9", "g10"],
    scheduleMode: "rio_weekly",
    assumptions: [
      "Distinct HS ownership starts in Grade 9.",
      "Underloaded specialist domains can be completed through profile-fit mentorship/contact or program ownership.",
    ],
    canCover: [
      "HS-specific science, Portuguese/Redacao, ELA/AP foundations, mathematics, humanities, Pathways, and mentorship routines with clearer ownership.",
      "Part-time or hybrid specialist domains when full-time loads are not yet justified.",
    ],
    cannotCover: [
      "Mature Grade 11-12 AP, Independent Study, and full specialist density without additional staffing.",
    ],
    requiredProfileIds: [
      "hs_portuguese_redacao",
      "hs_english_research_communication",
      "hs_mathematics_advanced_math",
      "hs_humanities_ap_world_history",
      "biology_specialist",
      "chemistry_specialist",
      "physics_specialist",
      "pathways_college_career",
      "innovation_design_technologies_project_mentorship",
    ],
    fixedMentorshipBlockHandling:
      "Fixed mentorship block must have explicit owner profiles, group-capacity assumptions, and profile-fit assignment.",
    sharedRoleLogic: "Shared roles are limited to bridge support; distinct HS ownership remains the planning premise.",
    partTimeRoleLogic: "Part-time roles are expected where Grade 9-10 loads are below full-time viability.",
    risks: [
      "Fragmented learner experience if part-time roles are not coordinated.",
      "Program ownership may be undercounted if only direct teaching minutes are modeled.",
    ],
    unresolvedInputs: [
      "Which domains are part-time versus hybrid.",
      "Mentorship group caps by educator.",
      "College/Career and Pathways ownership expectations.",
    ],
  },
  {
    id: "scenario_c_mature_hs_specialist",
    label: "Scenario C: Mature High School specialist model",
    activeGrades: ["g9", "g10", "g11", "g12"],
    scheduleMode: "rio_weekly",
    assumptions: [
      "Appropriate for Grade 11-12 or full HS density.",
      "Mature-model features should not become Rio launch payroll commitments without validation.",
    ],
    canCover: [
      "AP, advanced sciences, Independent Study, Leadership, GCD, Innovation/Design Technologies, and college-facing functions.",
      "Separated Biology, Chemistry, Physics, AP English, AP research, and advanced mathematics profiles.",
    ],
    cannotCover: [
      "Cost discipline if activated before enrollment density supports specialist utilization.",
    ],
    requiredProfileIds: [
      "hs_portuguese_redacao",
      "hs_english_research_communication",
      "hs_mathematics_advanced_math",
      "biology_specialist",
      "chemistry_specialist",
      "physics_specialist",
      "hs_humanities_ap_world_history",
      "ap_seminar_research",
      "pathways_college_career",
      "innovation_design_technologies_project_mentorship",
      "gcd_leadership",
      "body_movement",
    ],
    fixedMentorshipBlockHandling:
      "May require dedicated coordination if group volume exceeds available profile-fit educator capacity.",
    sharedRoleLogic: "Shared roles become exceptions; specialist-domain ownership is the mature planning premise.",
    partTimeRoleLogic: "Part-time roles may remain useful for niche AP or external-provider-supported pathways.",
    risks: [
      "Payroll overbuild before validated demand.",
      "False precision if Sao Paulo reference density is copied directly.",
    ],
    unresolvedInputs: [
      "Rio Grade 11-12 course offer.",
      "AP pathway commitments.",
      "Independent Study supervision model.",
      "Leadership and GCD ownership model.",
    ],
  },
];
