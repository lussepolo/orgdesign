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
  /**
   * These flags indicate which load categories a unit may support. They are not
   * additive counting rules; actual workload counting comes from item-level
   * loadCategory, MentorshipLoadItem, and explicit assignment logic.
   */
  eligibleForTeachingLoad: boolean;
  eligibleForMentorshipContact: boolean;
  eligibleForProgramOwnership: boolean;
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
  sourceScheduleMode?: ScheduleMode;
  referenceUnitKind?: ScheduleUnitKind;
  referenceCycleMinutes?: number | null;
  referenceCycleLabel?: string;
  requiresRioConversion?: boolean;
  weeklySlots: number | null;
  minutesPerSlot: number | null;
  weeklyMinutes: number | null;
  weeklyHours: number | null;
  slotEvidenceLevel: EvidenceLevel;
  source: "rio_mock" | "sao_paulo_reference" | "manual_validation";
  requiredHiringProfileIds: string[];
  requiredPrimaryProfileIds?: string[];
  supportingProfileIds?: string[];
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

export interface RioEquivalentConversion {
  sourceMinutes: number;
  sourceUnitKind?: ScheduleUnitKind;
  exactSingleBlockEquivalent: number;
  displaySingleBlockEquivalent: number;
  exactDoubleBlockEquivalent: number;
  displayDoubleBlockEquivalent: number;
  remainderAgainst45: number;
  remainderAgainst90: number;
  fitStatus: FitStatus;
  warnings: string[];
  validationRequired: boolean;
}

export const HIGH_SCHOOL_SCHEDULE_UNITS: Record<ScheduleUnitKind, ScheduleUnit> = {
  rio_single_45: {
    id: "rio_single_45",
    label: "Rio single block",
    minutes: 45,
    scheduleMode: "rio_weekly",
    eligibleForTeachingLoad: true,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Rio weekly planning unit. Use for direct subject or mentorship contact when curriculum validates it.",
  },
  rio_double_90: {
    id: "rio_double_90",
    label: "Rio double block",
    minutes: 90,
    scheduleMode: "rio_weekly",
    eligibleForTeachingLoad: true,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Rio weekly double block. Likely unit for labs, seminars, projects, and long-form work if validated.",
  },
  sp_rotation_af_255: {
    id: "sp_rotation_af_255",
    label: "Sao Paulo A-F rotation record",
    minutes: 255,
    scheduleMode: "sao_paulo_reference",
    eligibleForTeachingLoad: true,
    eligibleForMentorshipContact: false,
    eligibleForProgramOwnership: false,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only mature-model unit inferred as Period 1 + Period 3 + Period 4 across a six-day rotation.",
  },
  sp_x_block_75: {
    id: "sp_x_block_75",
    label: "Sao Paulo X-block, 75 minutes",
    minutes: 75,
    scheduleMode: "sao_paulo_reference",
    eligibleForTeachingLoad: true,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only fixed weekday block. Can represent course, mentorship, or program contact depending on label.",
  },
  sp_x_block_60: {
    id: "sp_x_block_60",
    label: "Sao Paulo X-block, 60 minutes",
    minutes: 60,
    scheduleMode: "sao_paulo_reference",
    eligibleForTeachingLoad: true,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only shorter Wednesday-style block found in the Sao Paulo file.",
  },
  sp_advisory_25: {
    id: "sp_advisory_25",
    label: "Sao Paulo advisory",
    minutes: 25,
    scheduleMode: "sao_paulo_reference",
    eligibleForTeachingLoad: false,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Reference-only advisory unit. Recurrence and Wednesday duration require validation before Rio modeling.",
  },
  fixed_mentorship_block: {
    id: "fixed_mentorship_block",
    label: "Fixed Project Mentorship Block",
    minutes: null,
    scheduleMode: "rio_weekly",
    eligibleForTeachingLoad: false,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: true,
    isFixedSynchronizedBlock: true,
    validationRequired: true,
    notes: "Protected Rio mentorship block. It does not conflict with regular subject teaching, but it counts toward workload.",
  },
  shared_program_block: {
    id: "shared_program_block",
    label: "Shared program block",
    minutes: null,
    scheduleMode: "rio_weekly",
    eligibleForTeachingLoad: false,
    eligibleForMentorshipContact: true,
    eligibleForProgramOwnership: true,
    isFixedSynchronizedBlock: false,
    validationRequired: true,
    notes: "Count once per educator-contact block unless simultaneous groups or educators are shown.",
  },
  ambiguous_custom: {
    id: "ambiguous_custom",
    label: "Ambiguous/custom block",
    minutes: null,
    scheduleMode: "rio_weekly",
    eligibleForTeachingLoad: false,
    eligibleForMentorshipContact: false,
    eligibleForProgramOwnership: false,
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
  "ScheduleUnit flags indicate eligibility, not automatic additive counting. Actual workload counting must use item-level loadCategory, MentorshipLoadItem, and assignment logic.",
  "Innovation Diploma and Passion Project are counted inside Project Mentorship, not as separate additive workload buckets.",
  "Project Mentorship occurs in a fixed synchronized mentorship block.",
  "The fixed mentorship block does not conflict with regular subject teaching because it is protected in the timetable.",
  "Mentorship still counts toward educator workload.",
  "Mentorship capacity should be modeled by both minutes and number of mentorship groups.",
  "GCD is counted inside Pathways or Leadership, not as a separate additive workload bucket unless validated later.",
  "Shared or cross-grade blocks count once per educator-contact block, not once per section, unless simultaneous separate groups or educators are shown.",
  "Program ownership is real workload but not automatically a teaching block or new payroll role.",
];

export const HIGH_SCHOOL_SCHEDULE_UNIT_COUNTING_NOTE =
  "ScheduleUnit flags indicate eligibility, not automatic additive counting. Actual workload counting must use item-level loadCategory, MentorshipLoadItem, and explicit assignment logic.";

const toOneDecimal = (value: number): number => Math.round(value * 10) / 10;

export const minutesToRioSingleBlocks = (minutes: number): number => minutes / 45;

export const minutesToRioDoubleBlocks = (minutes: number): number => minutes / 90;

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
): RioEquivalentConversion => {
  const warnings: string[] = [];
  const isSaoPauloRotationReference = sourceUnitKind === "sp_rotation_af_255";
  const isLikelySaoPauloRotationReference = !sourceUnitKind && minutes === 255;

  if (isSaoPauloRotationReference) {
    warnings.push(
      "255 minutes is a Sao Paulo A-F six-day-cycle reference unit and must not be treated as Rio weekly load.",
    );
  } else if (isLikelySaoPauloRotationReference) {
    warnings.push(
      "255 minutes commonly corresponds to the Sao Paulo A-F six-day-cycle reference; confirm source before treating it as Rio weekly load.",
    );
  }

  if (sourceUnitKind && HIGH_SCHOOL_SCHEDULE_UNITS[sourceUnitKind]?.scheduleMode === "sao_paulo_reference") {
    warnings.push("Sao Paulo reference units require explicit Rio timetable validation before weekly conversion.");
  }

  const fitStatus = getRioFitStatus(minutes, sourceUnitKind);
  const validationRequired =
    fitStatus === "needs_curriculum_validation" ||
    isLikelySaoPauloRotationReference ||
    warnings.length > 0;

  return {
    sourceMinutes: minutes,
    sourceUnitKind,
    exactSingleBlockEquivalent: minutesToRioSingleBlocks(minutes),
    displaySingleBlockEquivalent: toOneDecimal(minutesToRioSingleBlocks(minutes)),
    exactDoubleBlockEquivalent: minutesToRioDoubleBlocks(minutes),
    displayDoubleBlockEquivalent: toOneDecimal(minutesToRioDoubleBlocks(minutes)),
    remainderAgainst45: minutes % 45,
    remainderAgainst90: minutes % 90,
    fitStatus,
    warnings,
    validationRequired,
  };
};

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
    label: "HS ELA / AP English / AP Capstone Capable",
    canCoverDomains: ["English Language Arts", "AP English Language Composition", "AP English Literature", "AP Language", "AP Literature", "AP Seminar", "AP Capstone writing support", "research communication"],
    shouldNotCoverDomains: ["Portuguese", "Biology", "Chemistry", "Physics"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 2,
    specialistTrigger: "AP Seminar, AP Research, AP Language, or AP Literature becomes active at scale.",
    notes: "May cover or support ELA, AP English Language Composition, AP English Literature, and AP Capstone-related writing/research where appropriate. AP Seminar and AP Research are not reducible to generic ELA — explicit capability validation is required before assigning this profile to AP Seminar or AP Research ownership.",
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
    label: "HS Humanities / Brazilian Studies & Global Studies",
    canCoverDomains: ["Brazilian Studies", "Global Studies", "Geography", "History", "Social Sciences", "AP World History", "AP Human Geography", "AP Macroeconomics"],
    shouldNotCoverDomains: ["Portuguese language mechanics", "AP English composition", "Natural Sciences"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "high",
    maxMentorshipGroups: 2,
    specialistTrigger: "AP humanities, macro, or advanced social-science pathway demand is active.",
    notes: "Covers Brazilian Studies and Global Studies, including Geography and History where relevant. AP social-science pathways activate against this profile. Strong fit for civic inquiry, SDG/context research, stakeholder mapping, and debate.",
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
    id: "leadership_with_gcd_scope",
    label: "Leadership owner with GCD scope",
    canCoverDomains: ["Leadership", "Global Citizen Diploma", "global citizenship", "public contribution"],
    shouldNotCoverDomains: ["Core AP subject instruction", "advanced mathematics"],
    canAbsorbMentorship: true,
    canAbsorbProgramOwnership: true,
    sharedMsHsCredibility: "medium",
    partTimeFeasibility: "medium",
    maxMentorshipGroups: 2,
    specialistTrigger: "Leadership with embedded GCD scope becomes scheduled, assessed, and externally visible.",
    notes: "This is a Pathways/Leadership profile carrying GCD scope, not a separate GCD staffing bucket.",
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
  eligibleForTeachingLoad: false,
  eligibleForMentorshipContact: true,
  eligibleForProgramOwnership: true,
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
      "leadership_with_gcd_scope",
    ],
    countsTowardMentorshipContact: true,
    requiresProfileFit: true,
    validationRequired: true,
    notes: "May require dedicated coordination if group volume exceeds profile-fit educator capacity.",
  },
];

const hours = (minutes: number): number => toOneDecimal(minutes / 60);

const SAO_PAULO_AF_ROTATION_REFERENCE = {
  sourceScheduleMode: "sao_paulo_reference" as const,
  referenceUnitKind: "sp_rotation_af_255" as const,
  referenceCycleMinutes: 255,
  referenceCycleLabel: "Sao Paulo A-F six-day-cycle reference unit, not Rio weekly load",
  requiresRioConversion: true,
};

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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_portuguese_redacao"],
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Source label: Lingua Portuguesa I. Reference-only; 255 minutes is a Sao Paulo six-day-cycle reference, not Rio weekly load. Rio weekly conversion requires explicit curriculum validation.",
  },
  {
    id: "sp_g9_ela",
    grade: "g9",
    courseProgramName: "English Language Arts",
    category: "core_academic_subject",
    domain: "English",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
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
    notes:
      "Shared MS/HS only credible with validated HS writing and advanced-English expertise. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
  },
  {
    id: "sp_g9_integrated_math",
    grade: "g9",
    courseProgramName: "Integrated Mathematics",
    category: "core_academic_subject",
    domain: "Mathematics",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
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
    notes:
      "Source label: Algebra I. Rio should validate whether Grade 9 uses Algebra I, integrated math, or another sequence. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["biology_specialist", "chemistry_specialist", "physics_specialist"],
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Reference item is integrated; do not assume one generic science educator can cover all three disciplines. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_humanities_ap_world_history"],
    credentialOrSpecializationRequirement: "AP humanities capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Audited source contains AP Human Geography, not AP World History, for Grade 9. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
  },
  {
    id: "sp_g10_ap_seminar",
    grade: "g10",
    courseProgramName: "AP Seminar",
    category: "advanced_ap_course",
    domain: "AP Capstone",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["ap_seminar_research"],
    requiredPrimaryProfileIds: ["ap_seminar_research"],
    supportingProfileIds: ["hs_english_research_communication"],
    credentialOrSpecializationRequirement: "AP Seminar capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "High load in Sao Paulo reference. AP Seminar requires the AP Seminar / AP Research profile as primary; HS ELA / AP English / AP Capstone Capable is supporting only if explicit AP Seminar credential is validated. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
  },
  {
    id: "sp_g10_ap_computer_science_principles",
    grade: "g10",
    courseProgramName: "AP Computer Science Principles",
    category: "advanced_ap_course",
    domain: "Computer Science",
    loadCategory: "teaching_load",
    scheduleUnitId: "sp_rotation_af_255",
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["innovation_design_technologies_project_mentorship"],
    credentialOrSpecializationRequirement: "AP Computer Science Principles capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_b_transitional_part_time_hs", "scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Source spelling is AP Computer Sciences Principles. Rio naming should be normalized. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_english_research_communication"],
    credentialOrSpecializationRequirement: "AP English capability",
    deliveryModelOptions: ["internal_part_time_educator", "internal_full_time_educator"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Mature-reference AP English load; not a Rio launch commitment. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
    notes: "Mixed rotation and X-block source inputs. Treat as mentorship/contact load requiring profile-fit supervision.",
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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_mathematics_advanced_math"],
    credentialOrSpecializationRequirement: "AP Calculus capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Mature-reference advanced mathematics load. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
    ...SAO_PAULO_AF_ROTATION_REFERENCE,
    weeklySlots: null,
    minutesPerSlot: null,
    weeklyMinutes: null,
    weeklyHours: null,
    slotEvidenceLevel: "inferred_from_timetable",
    source: "sao_paulo_reference",
    requiredHiringProfileIds: ["hs_mathematics_advanced_math"],
    credentialOrSpecializationRequirement: "AP Precalculus capability",
    deliveryModelOptions: ["internal_part_time_educator", "external_online_provider"],
    scenarioFit: ["scenario_c_mature_hs_specialist"],
    maturity: "reference_only",
    hrPayrollValidationRequired: true,
    validationRequired: true,
    notes:
      "Mature-reference advanced mathematics load. The 255-minute Sao Paulo A-F reference is not a Rio weekly value.",
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
      "AP, advanced sciences, Independent Study, Leadership with embedded GCD scope, Innovation/Design Technologies, and college-facing functions.",
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
      "leadership_with_gcd_scope",
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
      "Leadership/Pathways ownership model carrying embedded GCD scope.",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// High School Scenario Capability Report
// ─────────────────────────────────────────────────────────────────────────────
// Capability planning only. Not payroll authorization. Not final headcount.
// ─────────────────────────────────────────────────────────────────────────────

export interface HighSchoolCapabilityRow {
  profileId: string;
  profileLabel: string;
  domains: string[];
  /** IDs of course items in the scenario that list this profile as required. */
  requiredByCourseItems: string[];
  /** IDs of mentorship items active in this scenario that list this profile as required. */
  requiredByMentorshipItems: string[];
  /** True when at least one relevant course item has category "core_academic_subject". */
  coreAcademicDemand: boolean;
  /** True when at least one relevant course item has category "advanced_ap_course". */
  advancedApDemand: boolean;
  /**
   * True when at least one relevant mentorship item uses a fixed synchronized block
   * and lists this profile as required. The block duration and group capacity remain
   * unresolved until Rio timetable validation is complete.
   */
  fixedMentorshipSupport: boolean;
  /**
   * True when the profile's canCoverDomains includes Pathways, Leadership, GCD, or
   * College/Career scope. GCD is embedded within this profile, not a separate
   * additive staffing bucket.
   */
  pathwaysLeadershipGcdScope: boolean;
  sharedMsHsCredibility: SharedCredibility;
  partTimeFeasibility: FeasibilityLevel;
  /** Condition that activates this capability need. Not a hiring decision. */
  capabilityTrigger: string;
  /** Per-profile unresolved items blocking workload or schedule confirmation. */
  validationBlockers: string[];
}

export interface HighSchoolScenarioCapabilityReport {
  selectedScenario: MockScheduleScenario;
  activeGrades: GradeLevel[];
  /** Course items whose scenarioFit includes the selected scenario. */
  relevantCourseItems: CourseLoadItem[];
  /** Mentorship items whose grade is active in the selected scenario. */
  relevantMentorshipItems: MentorshipLoadItem[];
  capabilityRows: HighSchoolCapabilityRow[];
  /** Aggregated unresolved blockers across all profiles and scenario inputs. */
  validationBlockers: string[];
  caveats: string[];
  methodologyNotes: string[];
}

const PATHWAYS_LEADERSHIP_GCD_DOMAIN_MARKERS = new Set([
  "Pathways",
  "Leadership",
  "Global Citizen Diploma",
  "global citizenship",
  "public contribution",
  "College/Career",
  "advisory",
  "course selection",
]);

/**
 * Derives a scenario-specific capability report from the High School model data.
 *
 * Profile IDs are sourced from the union of:
 *   1. selectedScenario.requiredProfileIds
 *   2. requiredHiringProfileIds on course items matching this scenario
 *   3. requiredEducatorProfileIds on mentorship items for active grades
 *
 * This prevents losing profiles that are scenario-relevant even when a course
 * item is reference-only or validation-heavy.
 *
 * No FTE, payroll, or headcount values are calculated. Capability triggers
 * describe activation conditions, not hiring decisions.
 */
export function buildHighSchoolScenarioCapabilityReport(
  scenarioId: ScenarioId,
): HighSchoolScenarioCapabilityReport {
  const selectedScenario =
    HIGH_SCHOOL_MOCK_SCHEDULE_SCENARIOS.find((s) => s.id === scenarioId) ??
    HIGH_SCHOOL_MOCK_SCHEDULE_SCENARIOS[0];

  const activeGrades = selectedScenario.activeGrades;

  const relevantCourseItems = SAO_PAULO_REFERENCE_COURSE_LOAD_ITEMS.filter((item) =>
    item.scenarioFit.includes(scenarioId),
  );

  const relevantMentorshipItems = HIGH_SCHOOL_MENTORSHIP_LOAD_ITEMS.filter((item) =>
    activeGrades.includes(item.grade),
  );

  // Build profile ID union from three sources to avoid dropping scenario-relevant
  // profiles that appear only in course items or mentorship items.
  const profileIdSet = new Set<string>([
    ...selectedScenario.requiredProfileIds,
    ...relevantCourseItems.flatMap((item) => item.requiredHiringProfileIds),
    ...relevantMentorshipItems.flatMap((item) => item.requiredEducatorProfileIds),
  ]);

  const capabilityRows: HighSchoolCapabilityRow[] = [];

  for (const profileId of profileIdSet) {
    const profile = HIGH_SCHOOL_EDUCATOR_CAPABILITY_PROFILES.find((p) => p.id === profileId);
    if (!profile) continue;

    const courseItemsForProfile = relevantCourseItems.filter((item) =>
      item.requiredHiringProfileIds.includes(profileId),
    );

    const mentorshipItemsForProfile = relevantMentorshipItems.filter((item) =>
      item.requiredEducatorProfileIds.includes(profileId),
    );

    const coreAcademicDemand = courseItemsForProfile.some(
      (item) => item.category === "core_academic_subject",
    );

    const advancedApDemand = courseItemsForProfile.some(
      (item) => item.category === "advanced_ap_course",
    );

    // Fixed synchronized mentorship blocks require profile-fit assignment and
    // group-capacity validation; duration is unresolved until Rio timetable confirms.
    const fixedMentorshipSupport = mentorshipItemsForProfile.some(
      (item) => item.isFixedSynchronizedBlock,
    );

    const pathwaysLeadershipGcdScope = profile.canCoverDomains.some((domain) =>
      PATHWAYS_LEADERSHIP_GCD_DOMAIN_MARKERS.has(domain),
    );

    const rowBlockers: string[] = [];

    for (const item of courseItemsForProfile) {
      const unit = HIGH_SCHOOL_SCHEDULE_UNITS[item.scheduleUnitId];

      if (item.validationRequired) {
        rowBlockers.push(
          `${item.courseProgramName} (${item.id}): curriculum and Rio timetable validation required before planning.`,
        );
      }
      if (item.weeklyMinutes === null) {
        rowBlockers.push(
          `${item.courseProgramName} (${item.id}): weekly minutes unresolved — Sao Paulo reference only, not a Rio weekly value.`,
        );
      }
      if (unit?.scheduleMode === "sao_paulo_reference") {
        rowBlockers.push(
          `${item.courseProgramName} (${item.id}): schedule unit "${item.scheduleUnitId}" is Sao Paulo reference-only; Rio weekly equivalent requires explicit curriculum conversion.`,
        );
      }
      if (item.hrPayrollValidationRequired) {
        rowBlockers.push(
          `${item.courseProgramName} (${item.id}): HR/Finance validation required before any role or engagement can be activated.`,
        );
      }
    }

    for (const item of mentorshipItemsForProfile) {
      if (item.validationRequired) {
        rowBlockers.push(
          `${item.label} (${item.id}): mentorship block requires validation — duration, profile fit, and group capacity are unresolved.`,
        );
      }
      if (item.mentorshipGroupsRequired === null) {
        rowBlockers.push(
          `${item.label} (${item.id}): mentorship group count is unresolved; capacity planning cannot proceed without this input.`,
        );
    }
    }

    capabilityRows.push({
      profileId,
      profileLabel: profile.label,
      domains: profile.canCoverDomains,
      requiredByCourseItems: courseItemsForProfile.map((item) => item.id),
      requiredByMentorshipItems: mentorshipItemsForProfile.map((item) => item.id),
      coreAcademicDemand,
      advancedApDemand,
      fixedMentorshipSupport,
      pathwaysLeadershipGcdScope,
      sharedMsHsCredibility: profile.sharedMsHsCredibility,
      partTimeFeasibility: profile.partTimeFeasibility,
      capabilityTrigger: profile.specialistTrigger,
      validationBlockers: [...new Set(rowBlockers)],
    });
  }

  // Top-level blockers: unresolved scenario inputs plus all per-profile blockers.
  const scenarioInputBlockers = selectedScenario.unresolvedInputs.map(
    (input) => `Unresolved scenario input: ${input}`,
  );
  const allRowBlockers = capabilityRows.flatMap((row) => row.validationBlockers);
  const validationBlockers = [...new Set([...scenarioInputBlockers, ...allRowBlockers])];

  const caveats = [
    "This report is a capability planning document only. It is not payroll authorization, approved staffing, or final headcount.",
    "São Paulo reference schedules are a planning signal, not a Rio weekly load template. 255-minute A-F rotation units and X-block durations require explicit Rio curriculum validation before any conversion is used for planning.",
    "GCD (Global Citizen Diploma) scope is embedded within the Pathways/Leadership profile and is not a separate additive staffing bucket unless validated and explicitly separated by curriculum and Finance/HR.",
    "The fixed synchronized mentorship block is a protected timetable slot. It requires profile-fit assignment and mentorship group capacity validation before workload contact minutes can be counted.",
    "Biology, Chemistry, and Physics are treated as distinct capability profiles and must not be collapsed into a generic Natural Sciences role without explicit credential validation.",
    "AP Seminar and AP Research are preserved as a specific capability (ap_seminar_research) distinct from generic English Language Arts or research-communication load.",
    "Capability triggers describe conditions that activate a profile's planning need. They are not hiring decisions or headcount authorizations.",
  ];

  const methodologyNotes = [
    "Profile IDs are derived from the union of: (1) scenario.requiredProfileIds, (2) requiredHiringProfileIds on course items whose scenarioFit includes this scenario, and (3) requiredEducatorProfileIds on mentorship items for active grades. This union prevents losing scenario-relevant profiles when a course item is reference-only or validation-heavy.",
    ...HIGH_SCHOOL_PROGRAM_BLOCK_COUNTING_RULES,
    HIGH_SCHOOL_SCHEDULE_UNIT_COUNTING_NOTE,
    ...HIGH_SCHOOL_LOAD_CATEGORY_RULES.teaching_load,
    ...HIGH_SCHOOL_LOAD_CATEGORY_RULES.mentorship_contact_load,
    ...HIGH_SCHOOL_LOAD_CATEGORY_RULES.program_ownership_load,
  ];

  return {
    selectedScenario,
    activeGrades,
    relevantCourseItems,
    relevantMentorshipItems,
    capabilityRows,
    validationBlockers,
    caveats,
    methodologyNotes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rio Weekly Course Load Scaffold
// Weekly instructional/contact load only. Not payroll. Not FTE. Not headcount.
// ─────────────────────────────────────────────────────────────────────────────

export type RioWeeklyValidationStatus =
  | "pending_rio_curriculum_validation"
  | "partial_validation"
  | "validated";

export interface RioWeeklyCourseLoadRow {
  id: string;
  grade: GradeLevel;
  courseArea: string;
  capabilityProfileIds: string[];
  weeklySlotsPerSection: number | null;
  minutesPerSlot: number | null;
  sections: number;
  totalWeeklySlots: number | null;
  totalWeeklyMinutes: number | null;
  totalWeeklyContactHours: number | null;
  loadCategory: LoadCategory;
  validationStatus: RioWeeklyValidationStatus;
  notes: string;
}

type RioWeeklyCourseLoadStubRow = Omit<
  RioWeeklyCourseLoadRow,
  "sections" | "totalWeeklySlots" | "totalWeeklyMinutes" | "totalWeeklyContactHours"
>;

// ─────────────────────────────────────────────────────────────────────────────
// Grade 9 Capacity Ledger Types
// Instructional-capacity coverage planning only.
// Not a staffing authorization. Not a hiring commitment.
// ─────────────────────────────────────────────────────────────────────────────

export type G9AllocationType =
  | "hs_oriented_launch_coverage"
  | "hs_oriented_launch_coverage_pending_capability_validation"
  | "hs_oriented_shared_with_ms_if_validated"
  | "ms_primary_bridge_if_validated"
  | "distributed_fixed_block"
  | "distributed_student_support_responsibility"
  | "hs_program_ownership"
  | "specialist_or_part_time_if_required"
  | "pending_validation";

export type HsOrientedLaunchCoverage =
  | "likely"
  | "likely_pending_capability_validation"
  | "distributed_across_eligible_educators"
  | "not_in_launch_core"
  | "not_applicable";

export type HsOrientedSharedWithMsFeasibility =
  | "plausible_pending_schedule_and_load_validation"
  | "not_plausible"
  | "not_applicable";

export type MsPrimaryBridgeEligibility =
  | "eligible_if_validated"
  | "foundation_layer_only_if_validated"
  | "not_eligible"
  | "not_applicable";

export type G9ProjectBlockRole =
  | "anchor_domain_mentor"
  | "mentor_eligible_pending_profile_fit"
  | "simultaneous_availability_required"
  | "not_applicable";

export type G9ProgramOwnershipRole =
  | "primary_program_ownership"
  | "embedded_program_ownership"
  | "connected_program_support"
  | "not_applicable";

export type G9LedgerValidationStatus =
  | "covered_hs_core_assumption"
  | "covered_pending_explicit_capability_validation"
  | "ms_bridge_foundation_layer_pending_validation"
  | "distributed_pending_timetable_assignment"
  | "hs_program_ownership_pending_assignment"
  | "pending_counselor_role_activation"
  | "pending_rio_curriculum_validation";

export interface Grade9CapacityLedgerRow {
  id: string;
  courseArea: string;
  loadCategory: LoadCategory;
  weeklySlotsPerSection: number | null;
  allocationType: G9AllocationType;
  requiredCapabilityProfileIds: string[];
  hsOrientedLaunchCoverage: HsOrientedLaunchCoverage;
  hsOrientedSharedWithMsFeasibility: HsOrientedSharedWithMsFeasibility;
  hsOrientedSharedWithMsFeasibilityNote: string;
  msPrimaryBridgeEligibility: MsPrimaryBridgeEligibility;
  msPrimaryBridgeEligibilityNote: string;
  projectBlockRole: G9ProjectBlockRole;
  programOwnershipRole: G9ProgramOwnershipRole;
  validationStatus: G9LedgerValidationStatus;
  blockerOrCaveat: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade 9 Capacity Ledger Rows
// Instructional-capacity coverage planning only.
// Not a staffing authorization. Not a hiring commitment. Not payroll.
// ─────────────────────────────────────────────────────────────────────────────

export const GRADE_9_CAPACITY_LEDGER_ROWS: readonly Grade9CapacityLedgerRow[] = [
  {
    id: "rio_g9_capacity_integrated_mathematics",
    courseArea: "Integrated Mathematics",
    loadCategory: "teaching_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_oriented_launch_coverage",
    requiredCapabilityProfileIds: ["hs_mathematics_advanced_math"],
    hsOrientedLaunchCoverage: "likely",
    hsOrientedSharedWithMsFeasibility: "plausible_pending_schedule_and_load_validation",
    hsOrientedSharedWithMsFeasibilityNote:
      "The HS-oriented mathematics educator may support Middle School if load, schedule, and HS mathematics expertise allow. Direction is HS-to-MS sharing, not automatic MS-to-HS bridge.",
    msPrimaryBridgeEligibility: "eligible_if_validated",
    msPrimaryBridgeEligibilityNote:
      "An MS-primary mathematics educator may support Grade 9 only if HS-level mathematics expertise, remaining capacity, and schedule fit are validated.",
    projectBlockRole: "mentor_eligible_pending_profile_fit",
    programOwnershipRole: "not_applicable",
    validationStatus: "covered_hs_core_assumption",
    blockerOrCaveat:
      "This row must not be labeled Mathematics / Quantitative Reasoning. Share direction must be explicit.",
  },
  {
    id: "rio_g9_capacity_portuguese_redacao",
    courseArea: "Portuguese / Redação",
    loadCategory: "teaching_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_oriented_launch_coverage",
    requiredCapabilityProfileIds: ["hs_portuguese_redacao"],
    hsOrientedLaunchCoverage: "likely",
    hsOrientedSharedWithMsFeasibility: "plausible_pending_schedule_and_load_validation",
    hsOrientedSharedWithMsFeasibilityNote:
      "The HS-oriented Portuguese / Redação educator may support Middle School if load, schedule, and HS Redação expertise allow.",
    msPrimaryBridgeEligibility: "not_eligible",
    msPrimaryBridgeEligibilityNote:
      "MS Portuguese does not automatically qualify for HS Portuguese / Redação. HS Redação capability must be explicitly validated.",
    projectBlockRole: "mentor_eligible_pending_profile_fit",
    programOwnershipRole: "connected_program_support",
    validationStatus: "covered_hs_core_assumption",
    blockerOrCaveat:
      "Portuguese / Redação must not be treated as automatic MS Portuguese bridge coverage.",
  },
  {
    id: "rio_g9_capacity_natural_sciences_bio_chem",
    courseArea: "Natural Sciences: Biology/Chemistry foundations",
    loadCategory: "teaching_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_oriented_launch_coverage_pending_capability_validation",
    requiredCapabilityProfileIds: ["biology_specialist", "chemistry_specialist"],
    hsOrientedLaunchCoverage: "likely_pending_capability_validation",
    hsOrientedSharedWithMsFeasibility: "plausible_pending_schedule_and_load_validation",
    hsOrientedSharedWithMsFeasibilityNote:
      "The HS-oriented Natural Sciences educator may support Middle School only if schedule and load allow, but Grade 9 Bio/Chem capability remains the primary validation.",
    msPrimaryBridgeEligibility: "not_eligible",
    msPrimaryBridgeEligibilityNote:
      "MS Natural Sciences does not automatically qualify for Grade 9 Biology/Chemistry. Biology and Chemistry capability must be explicitly validated.",
    projectBlockRole: "mentor_eligible_pending_profile_fit",
    programOwnershipRole: "not_applicable",
    validationStatus: "covered_pending_explicit_capability_validation",
    blockerOrCaveat:
      "This row covers Biology/Chemistry foundations only. Physics is not a Grade 9 requirement and must not appear as a blocker in this row.",
  },
  {
    id: "rio_g9_capacity_brazilian_global_studies",
    courseArea: "Brazilian Studies / Global Studies",
    loadCategory: "teaching_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_oriented_launch_coverage",
    requiredCapabilityProfileIds: ["hs_humanities_ap_world_history"],
    hsOrientedLaunchCoverage: "likely",
    hsOrientedSharedWithMsFeasibility: "plausible_pending_schedule_and_load_validation",
    hsOrientedSharedWithMsFeasibilityNote:
      "The HS-oriented Brazilian Studies / Global Studies educator may support Middle School Social Sciences only if HS-level expertise, schedule, and load allow.",
    msPrimaryBridgeEligibility: "eligible_if_validated",
    msPrimaryBridgeEligibilityNote:
      "An MS-primary Social Sciences educator may support Grade 9 only if HS-level Brazilian Studies / Global Studies expertise is validated.",
    projectBlockRole: "anchor_domain_mentor",
    programOwnershipRole: "connected_program_support",
    validationStatus: "covered_hs_core_assumption",
    blockerOrCaveat:
      "The visible label must remain Brazilian Studies / Global Studies. AP Research may connect later, pending curriculum validation, but AP Research is not Grade 9 load.",
  },
  {
    id: "rio_g9_capacity_english_language_arts",
    courseArea: "English Language Arts",
    loadCategory: "teaching_load",
    weeklySlotsPerSection: null,
    allocationType: "ms_primary_bridge_if_validated",
    requiredCapabilityProfileIds: ["hs_english_research_communication"],
    hsOrientedLaunchCoverage: "not_in_launch_core",
    hsOrientedSharedWithMsFeasibility: "not_applicable",
    hsOrientedSharedWithMsFeasibilityNote:
      "Dedicated HS ELA is expected in Grade 10; Grade 9 may use validated MS ELA for the foundation layer.",
    msPrimaryBridgeEligibility: "foundation_layer_only_if_validated",
    msPrimaryBridgeEligibilityNote:
      "MS ELA may teach Grade 9 English Language Arts only if HS-level ELA capability is validated. AP English, AP Seminar, and AP Research are not Grade 9 load.",
    projectBlockRole: "mentor_eligible_pending_profile_fit",
    programOwnershipRole: "connected_program_support",
    validationStatus: "ms_bridge_foundation_layer_pending_validation",
    blockerOrCaveat:
      "The visible Grade 9 label is English Language Arts only. Do not label it AP English foundations.",
  },
  {
    id: "rio_g9_capacity_college_counseling_pathways_gcd",
    courseArea: "College Counseling / Pathways / Global Citizen Diploma",
    loadCategory: "program_ownership_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_program_ownership",
    requiredCapabilityProfileIds: ["pathways_college_career"],
    hsOrientedLaunchCoverage: "not_applicable",
    hsOrientedSharedWithMsFeasibility: "not_applicable",
    hsOrientedSharedWithMsFeasibilityNote:
      "This is a Grade 9 HS program ownership function, not HS-to-MS sharing.",
    msPrimaryBridgeEligibility: "not_applicable",
    msPrimaryBridgeEligibilityNote:
      "College Counseling / Pathways / Global Citizen Diploma is not an MS-primary bridge function.",
    projectBlockRole: "not_applicable",
    programOwnershipRole: "primary_program_ownership",
    validationStatus: "pending_counselor_role_activation",
    blockerOrCaveat:
      "A guidance counselor / college counselor activates with Grade 9. GCD is embedded here and must not appear as a separate Grade 9 row.",
  },
  {
    id: "rio_g9_capacity_global_expression_leadership",
    courseArea: "Global Expression & Leadership",
    loadCategory: "program_ownership_load",
    weeklySlotsPerSection: null,
    allocationType: "hs_program_ownership",
    requiredCapabilityProfileIds: ["leadership_with_gcd_scope"],
    hsOrientedLaunchCoverage: "not_applicable",
    hsOrientedSharedWithMsFeasibility: "plausible_pending_schedule_and_load_validation",
    hsOrientedSharedWithMsFeasibilityNote:
      "This function may connect to the Brazilian Studies / Global Studies educator or the College Counseling / guidance function if load and profile fit allow.",
    msPrimaryBridgeEligibility: "not_applicable",
    msPrimaryBridgeEligibilityNote:
      "This is not a default MS bridge function.",
    projectBlockRole: "mentor_eligible_pending_profile_fit",
    programOwnershipRole: "connected_program_support",
    validationStatus: "hs_program_ownership_pending_assignment",
    blockerOrCaveat:
      "Global Expression & Leadership must not duplicate GCD, Pathways, or Advisory.",
  },
  {
    id: "rio_g9_capacity_advisory",
    courseArea: "Advisory",
    loadCategory: "mentorship_contact_load",
    weeklySlotsPerSection: null,
    allocationType: "distributed_student_support_responsibility",
    requiredCapabilityProfileIds: [],
    hsOrientedLaunchCoverage: "distributed_across_eligible_educators",
    hsOrientedSharedWithMsFeasibility: "not_applicable",
    hsOrientedSharedWithMsFeasibilityNote:
      "Advisory is distributed among Grade 9 educators and/or counseling/support roles depending on the final timetable.",
    msPrimaryBridgeEligibility: "not_applicable",
    msPrimaryBridgeEligibilityNote:
      "Advisory for Grade 9 students is not an MS-primary bridge function and is not the same as MS Advisory.",
    projectBlockRole: "not_applicable",
    programOwnershipRole: "connected_program_support",
    validationStatus: "distributed_pending_timetable_assignment",
    blockerOrCaveat:
      "Advisory is distinct from College Counseling, GCD, and Project Mentorship. It is not a separate hire and not leftover capacity.",
  },
  {
    id: "rio_g9_capacity_project_mentorship_passion_project",
    courseArea: "Project Mentorship / Passion Project",
    loadCategory: "mentorship_contact_load",
    weeklySlotsPerSection: null,
    allocationType: "distributed_fixed_block",
    requiredCapabilityProfileIds: [
      "innovation_design_technologies_project_mentorship",
      "hs_english_research_communication",
      "hs_humanities_ap_world_history",
      "pathways_college_career",
    ],
    hsOrientedLaunchCoverage: "distributed_across_eligible_educators",
    hsOrientedSharedWithMsFeasibility: "not_applicable",
    hsOrientedSharedWithMsFeasibilityNote:
      "This is a fixed synchronized Grade 9 block and is not HS-to-MS sharing.",
    msPrimaryBridgeEligibility: "not_applicable",
    msPrimaryBridgeEligibilityNote:
      "MS-primary educators may participate only if schedule fit, profile fit, and project-block availability are validated. It is not a default bridge function.",
    projectBlockRole: "simultaneous_availability_required",
    programOwnershipRole: "not_applicable",
    validationStatus: "distributed_pending_timetable_assignment",
    blockerOrCaveat:
      "Project Mentorship / Passion Project is distributed across eligible educators, not a separate Project Mentor hire, not leftover capacity, and not Innovation Diploma. Innovation Diploma starts in Grade 11.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Grade 9 Capacity Ledger Constants and Helper Functions
// Instructional-capacity planning only. Not payroll. Not FTE. Not headcount.
// ─────────────────────────────────────────────────────────────────────────────

export const G9_DEFAULT_GROUPS_PER_SECTION = 6;
export const G9_MAX_GROUPS_PER_EDUCATOR = 4;
export const G9_EDUCATOR_SLOT_ELIGIBILITY_THRESHOLD = 20;

export function calculateProjectBlockDemand(
  sections: number,
  groupsPerSection = G9_DEFAULT_GROUPS_PER_SECTION,
  maxGroupsPerEducator = G9_MAX_GROUPS_PER_EDUCATOR,
) {
  const s = Math.max(1, Math.floor(sections));
  const gps = Math.max(1, Math.floor(groupsPerSection));
  const mgpe = Math.max(1, Math.floor(maxGroupsPerEducator));
  const totalProjectGroups = s * gps;
  const projectEducatorsRequired = Math.ceil(totalProjectGroups / mgpe);
  return {
    sections: s,
    groupsPerSection: gps,
    totalProjectGroups,
    projectEducatorsRequired,
    maxGroupsPerEducator: mgpe,
    note: "Simultaneous educator availability required in the fixed block, not a hiring count.",
  };
}

export function buildGrade9CapacityLedger(
  sections: number,
  groupsPerSection = G9_DEFAULT_GROUPS_PER_SECTION,
) {
  return {
    rows: [...GRADE_9_CAPACITY_LEDGER_ROWS] as readonly Grade9CapacityLedgerRow[],
    projectBlockDemand: calculateProjectBlockDemand(sections, groupsPerSection, G9_MAX_GROUPS_PER_EDUCATOR),
    caveats: [
      "Instructional-capacity planning only; not payroll, final FTE, final headcount, or hiring authorization.",
      "Weekly slot counts remain pending Rio curriculum validation.",
      "Middle School bridge/share signals are validation inputs, not confirmed High School capacity.",
      "Project Mentorship / Passion Project requires simultaneous educator availability in the fixed block; this is not a Project Mentor hire count.",
      "Advisory is distinct from College Counseling, Global Citizen Diploma, and Project Mentorship.",
    ],
  };
}

export function classifyMsPrimaryBridgeEligibility(
  row: Grade9CapacityLedgerRow,
): MsPrimaryBridgeEligibility {
  return row.msPrimaryBridgeEligibility;
}

export function classifyHsOrientedSharedWithMsFeasibility(
  row: Grade9CapacityLedgerRow,
): HsOrientedSharedWithMsFeasibility {
  return row.hsOrientedSharedWithMsFeasibility;
}

export function deriveMsSurplusSignalForGrade9(
  msRows: ReadonlyArray<{
    domainId: string;
    domainLabel: string;
    remainingBeforeMax: number | null;
    distribution?: readonly number[];
    weeklyCoreSlots?: number;
    activeGrades?: readonly string[];
  }>,
) {
  return msRows.map((row) => {
    let msPrimaryBridgeEligibility: MsPrimaryBridgeEligibility;
    let sharedMsCredibility: SharedCredibility;
    let g9BridgeLabel: string;

    switch (row.domainId) {
      case "mathematics":
        msPrimaryBridgeEligibility = "eligible_if_validated";
        sharedMsCredibility = "medium";
        g9BridgeLabel =
          "MS Mathematics surplus: planning signal only — HS-level mathematics expertise, remaining capacity, and schedule fit must be validated before Grade 9 assignment.";
        break;
      case "englishLanguageArts":
        msPrimaryBridgeEligibility = "foundation_layer_only_if_validated";
        sharedMsCredibility = "medium";
        g9BridgeLabel =
          "MS English Language Arts surplus: planning signal only — HS-level ELA capability must be validated; foundation layer only. AP English, AP Seminar, and AP Research are not Grade 9 load.";
        break;
      case "socialSciences":
        msPrimaryBridgeEligibility = "eligible_if_validated";
        sharedMsCredibility = "medium";
        g9BridgeLabel =
          "MS Social Sciences surplus: planning signal only — HS-level Brazilian Studies / Global Studies expertise must be validated before Grade 9 assignment.";
        break;
      case "portuguese":
        msPrimaryBridgeEligibility = "not_eligible";
        sharedMsCredibility = "low";
        g9BridgeLabel =
          "MS Portuguese surplus: not eligible — HS Portuguese / Redação capability requires explicit HS-level validation; not automatic bridge coverage.";
        break;
      case "naturalSciences":
        msPrimaryBridgeEligibility = "not_eligible";
        sharedMsCredibility = "risky";
        g9BridgeLabel =
          "MS Natural Sciences surplus: not eligible — MS Natural Sciences does not automatically qualify for Grade 9 Biology/Chemistry; explicit Biology and Chemistry capability validation required.";
        break;
      default:
        msPrimaryBridgeEligibility = "not_applicable";
        sharedMsCredibility = "low";
        g9BridgeLabel = "Not an MS-primary bridge function for Grade 9.";
        break;
    }

    return {
      domainId: row.domainId,
      domainLabel: row.domainLabel,
      coreRemainingBeforeMax: row.remainingBeforeMax,
      g9BridgeLabel,
      msPrimaryBridgeEligibility,
      sharedMsCredibility,
      validationBlocker:
        "MS surplus is a planning signal only and must not be treated as confirmed Grade 9 High School capacity. Validation of HS-level expertise, load, and schedule fit is required before any assignment.",
    };
  });
}

export const RIO_WEEKLY_COURSE_LOAD_STUB: readonly RioWeeklyCourseLoadStubRow[] = [
  // ── Grade 9 ──────────────────────────────────────────────────────────────
  {
    id: "rio_g9_integrated_math",
    grade: "g9",
    courseArea: "Integrated Mathematics",
    capabilityProfileIds: ["hs_mathematics_advanced_math"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "HS-oriented mathematics coverage by default. Shared MS/HS only where HS mathematics expertise, load, and schedule fit are validated. Rio weekly slot count requires curriculum validation.",
  },
  {
    id: "rio_g9_portuguese_redacao",
    grade: "g9",
    courseArea: "Portuguese / Redação",
    capabilityProfileIds: ["hs_portuguese_redacao"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "HS-oriented Portuguese / Redação coverage by default. Shared MS/HS only where HS Portuguese / Redação expertise, load, and schedule fit are validated. Rio weekly slot count requires curriculum validation.",
  },
  {
    id: "rio_g9_natural_sciences_bio_chem",
    grade: "g9",
    courseArea: "Natural Sciences: Biology/Chemistry foundations",
    capabilityProfileIds: ["biology_specialist", "chemistry_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Grade 9 Natural Sciences covers Biology and Chemistry foundations only. Physics is not a Grade 9 requirement. This row represents one HS-oriented Natural Sciences educator with strong Biology and Chemistry background. Biology and Chemistry are distinct capability expectations; explicit capability validation is required before assigning to a single educator. Not a separate Biology and Chemistry hire by default at launch.",
  },
  {
    id: "rio_g9_brazilian_global_studies",
    grade: "g9",
    courseArea: "Brazilian Studies / Global Studies",
    capabilityProfileIds: ["hs_humanities_ap_world_history"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Includes Geography and History where relevant. Likely HS-oriented ownership. May connect to GCD-related work and project or research mentoring. May connect to AP Research later, pending curriculum validation. AP Research is not Grade 9 load.",
  },
  {
    id: "rio_g9_ela",
    grade: "g9",
    courseArea: "English Language Arts",
    capabilityProfileIds: ["hs_english_research_communication"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Grade 9 English Language Arts may be covered by a validated MS ELA educator. Dedicated HS ELA is expected in Grade 10. AP English, AP Seminar, and AP Research are not Grade 9 load requirements unless explicitly validated later. Rio weekly slot count requires curriculum validation.",
  },
  {
    id: "rio_g9_college_counseling_pathways_gcd",
    grade: "g9",
    courseArea: "College Counseling / Pathways / Global Citizen Diploma",
    capabilityProfileIds: ["pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "College Counseling / Pathways begins in Grade 9 as the High School pathway layer. Global Citizen Diploma is coordinated through this role and does not appear as a separate Grade 9 row or separate staffing bucket. Program ownership load — not a direct teaching block by default. Not payroll authorization.",
  },
  {
    id: "rio_g9_global_expression_leadership",
    grade: "g9",
    courseArea: "Global Expression & Leadership",
    capabilityProfileIds: ["leadership_with_gcd_scope"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Leadership responsibility with embedded GCD scope. GCD is embedded within this role and is not a separate additive GCD staffing bucket. May connect to Brazilian Studies / Global Studies and the College Counseling / guidance function. Not merged with College Counseling / Pathways / Global Citizen Diploma.",
  },
  {
    id: "rio_g9_advisory",
    grade: "g9",
    courseArea: "Advisory",
    capabilityProfileIds: ["pathways_college_career", "leadership_with_gcd_scope"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Advisory begins in Grade 9 as part of the High School student-support and belonging structure. Distributed student-support/contact responsibility. Distinct from College Counseling, GCD, and Project Mentorship / Passion Project. Not a separate hire by default. Not optional. Not leftover capacity. Not payroll authorization.",
  },
  {
    id: "rio_g9_project_mentorship",
    grade: "g9",
    courseArea: "Project Mentorship / Passion Project",
    capabilityProfileIds: [
      "innovation_design_technologies_project_mentorship",
      "hs_english_research_communication",
      "hs_humanities_ap_world_history",
      "pathways_college_career",
    ],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Project Mentorship / Passion Project is distributed across eligible educators. It occurs inside a fixed synchronized mentorship block and does not conflict with regular subject teaching. Not a separate Project Mentor hire. Not leftover capacity. Requires educator teaching load, profile fit, group capacity, and schedule fit validation.",
  },

  // ── Grade 10 ─────────────────────────────────────────────────────────────
  {
    id: "rio_g10_portuguese_redacao",
    grade: "g10",
    courseArea: "Portuguese / Redação",
    capabilityProfileIds: ["hs_portuguese_redacao"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Extends Grade 9 launch package. Rio slot count requires curriculum validation.",
  },
  {
    id: "rio_g10_ela_ap_seminar",
    grade: "g10",
    courseArea: "English Language Arts / AP English / AP Seminar pathway",
    capabilityProfileIds: ["hs_english_research_communication", "ap_seminar_research"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Seminar is not reducible to generic ELA. Requires ap_seminar_research profile as primary if AP Seminar is active.",
  },
  {
    id: "rio_g10_integrated_math",
    grade: "g10",
    courseArea: "Integrated Mathematics",
    capabilityProfileIds: ["hs_mathematics_advanced_math"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Extends Grade 9 launch package. Rio slot count requires curriculum validation.",
  },
  {
    id: "rio_g10_biology",
    grade: "g10",
    courseArea: "Biology continuation",
    capabilityProfileIds: ["biology_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distinct from Chemistry and Physics. Continues Grade 9 Biology foundations.",
  },
  {
    id: "rio_g10_chemistry",
    grade: "g10",
    courseArea: "Chemistry continuation",
    capabilityProfileIds: ["chemistry_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distinct from Biology and Physics. Continues Grade 9 Chemistry foundations.",
  },
  {
    id: "rio_g10_physics",
    grade: "g10",
    courseArea: "Physics continuation",
    capabilityProfileIds: ["physics_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distinct from Biology and Chemistry. Continues Grade 9 Physics foundations.",
  },
  {
    id: "rio_g10_brazilian_global_studies",
    grade: "g10",
    courseArea: "Brazilian Studies / Global Studies",
    capabilityProfileIds: ["hs_humanities_ap_world_history"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Includes Geography and History where relevant.",
  },
  {
    id: "rio_g10_pathways_college_career",
    grade: "g10",
    courseArea: "Pathways / College and Career Guidance",
    capabilityProfileIds: ["pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Requires explicit High School ownership. Program ownership load — not a direct teaching block by default.",
  },
  {
    id: "rio_g10_project_mentorship",
    grade: "g10",
    courseArea: "Project Mentorship / Passion Project",
    capabilityProfileIds: [
      "innovation_design_technologies_project_mentorship",
      "pathways_college_career",
    ],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distributed educator responsibility inside the fixed synchronized mentorship block. Not a separate Project Mentor hire by default.",
  },
  {
    id: "rio_g10_gcd_pathways",
    grade: "g10",
    courseArea: "GCD within Pathways/Leadership",
    capabilityProfileIds: ["leadership_with_gcd_scope", "pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "GCD embedded within Pathways/Leadership. Not counted as a separate additive workload bucket.",
  },
  {
    id: "rio_g10_innovation_design",
    grade: "g10",
    courseArea: "Innovation / Design Technologies",
    capabilityProfileIds: ["innovation_design_technologies_project_mentorship"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distributed educator responsibility within the fixed mentorship block.",
  },

  // ── Grade 11 ─────────────────────────────────────────────────────────────
  {
    id: "rio_g11_portuguese_redacao",
    grade: "g11",
    courseArea: "Portuguese / Redação",
    capabilityProfileIds: ["hs_portuguese_redacao"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Specialist domain expected by Grade 11. Rio slot count requires curriculum validation.",
  },
  {
    id: "rio_g11_ela_ap_english",
    grade: "g11",
    courseArea: "English Language Arts / AP English / advanced communication",
    capabilityProfileIds: ["hs_english_research_communication"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP English Language Composition and AP English Literature require explicit capability validation. Not reducible to generic ELA.",
  },
  {
    id: "rio_g11_advanced_math",
    grade: "g11",
    courseArea: "Advanced Mathematics / AP Precalculus pathway",
    capabilityProfileIds: ["hs_mathematics_advanced_math"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Precalculus or AP Calculus pathway requires validated capability. Rio slot count requires curriculum validation.",
  },
  {
    id: "rio_g11_biology",
    grade: "g11",
    courseArea: "Biology / AP Biology where applicable",
    capabilityProfileIds: ["biology_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Biology requires a distinct biology specialist. Do not collapse into generic science.",
  },
  {
    id: "rio_g11_chemistry",
    grade: "g11",
    courseArea: "Chemistry / AP Chemistry where applicable",
    capabilityProfileIds: ["chemistry_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Chemistry requires a distinct chemistry specialist. Do not collapse into generic science.",
  },
  {
    id: "rio_g11_physics",
    grade: "g11",
    courseArea: "Physics / advanced science where applicable",
    capabilityProfileIds: ["physics_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distinct from Biology and Chemistry. Advanced science load requires validated physics specialty.",
  },
  {
    id: "rio_g11_brazilian_global_studies",
    grade: "g11",
    courseArea: "Brazilian Studies / Global Studies / AP Social Sciences",
    capabilityProfileIds: ["hs_humanities_ap_world_history"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Social Sciences activate against the Brazilian Studies / Global Studies capability profile.",
  },
  {
    id: "rio_g11_college_career",
    grade: "g11",
    courseArea: "College and Career Guidance",
    capabilityProfileIds: ["pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Explicit ownership required. Program ownership load — not a direct teaching block by default.",
  },
  {
    id: "rio_g11_capstone_research",
    grade: "g11",
    courseArea: "Capstone-like work / independent research preparation",
    capabilityProfileIds: ["ap_seminar_research", "pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Prepares for Grade 12 AP Research. Mentorship/contact load, not generic teaching.",
  },
  {
    id: "rio_g11_project_mentorship",
    grade: "g11",
    courseArea: "Project Mentorship / Passion Project",
    capabilityProfileIds: [
      "innovation_design_technologies_project_mentorship",
      "ap_seminar_research",
    ],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distributed educator responsibility inside the fixed synchronized mentorship block. Not a separate Project Mentor hire by default.",
  },
  {
    id: "rio_g11_innovation_design",
    grade: "g11",
    courseArea: "Innovation / Design Technologies",
    capabilityProfileIds: ["innovation_design_technologies_project_mentorship"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distributed educator responsibility within the fixed mentorship block.",
  },

  // ── Grade 12 ─────────────────────────────────────────────────────────────
  {
    id: "rio_g12_portuguese_redacao",
    grade: "g12",
    courseArea: "Portuguese / Redação",
    capabilityProfileIds: ["hs_portuguese_redacao"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Rio slot count requires curriculum validation.",
  },
  {
    id: "rio_g12_ela_ap_lit",
    grade: "g12",
    courseArea: "English Language Arts / AP English Literature or advanced communication",
    capabilityProfileIds: ["hs_english_research_communication"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP English Literature requires explicit capability validation. Not reducible to generic ELA.",
  },
  {
    id: "rio_g12_advanced_math",
    grade: "g12",
    courseArea: "Advanced Mathematics as pathway-dependent",
    capabilityProfileIds: ["hs_mathematics_advanced_math"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Calculus or AP Precalculus pathway. Load depends on validated pathway selection.",
  },
  {
    id: "rio_g12_sciences_pathway",
    grade: "g12",
    courseArea: "Biology / Chemistry / Physics as pathway-dependent",
    capabilityProfileIds: ["biology_specialist", "chemistry_specialist", "physics_specialist"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Biology, Chemistry, and Physics remain distinct profiles. Pathway-dependent inclusion requires curriculum validation.",
  },
  {
    id: "rio_g12_brazilian_global_studies",
    grade: "g12",
    courseArea: "Brazilian Studies / Global Studies",
    capabilityProfileIds: ["hs_humanities_ap_world_history"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Includes Geography and History where relevant.",
  },
  {
    id: "rio_g12_ap_research",
    grade: "g12",
    courseArea: "AP Research — Grade 12 Social Sciences",
    capabilityProfileIds: ["ap_seminar_research"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "teaching_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "AP Research is Grade 12 Social Sciences — not generic ELA or generic research. AP Seminar / AP Research profile required.",
  },
  {
    id: "rio_g12_independent_study",
    grade: "g12",
    courseArea: "Independent Study",
    capabilityProfileIds: ["ap_seminar_research", "pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Supervision generates adult workload. Mentorship/contact load, not a zero-load slot.",
  },
  {
    id: "rio_g12_college_career",
    grade: "g12",
    courseArea: "College and Career Guidance",
    capabilityProfileIds: ["pathways_college_career"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Graduation pathway support generates adult workload. Program ownership load — not a direct teaching block by default.",
  },
  {
    id: "rio_g12_leadership_gcd",
    grade: "g12",
    courseArea: "Leadership / GCD completion",
    capabilityProfileIds: ["leadership_with_gcd_scope"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "program_ownership_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "GCD completion embedded within Leadership scope. Not a separate additive GCD staffing bucket.",
  },
  {
    id: "rio_g12_innovation_diploma",
    grade: "g12",
    courseArea: "Innovation Diploma completion where applicable",
    capabilityProfileIds: ["innovation_design_technologies_project_mentorship"],
    weeklySlotsPerSection: null,
    minutesPerSlot: null,
    loadCategory: "mentorship_contact_load",
    validationStatus: "pending_rio_curriculum_validation",
    notes: "Distributed educator responsibility inside the fixed synchronized mentorship block. Not a separate Project Mentor hire.",
  },
];

export function buildRioWeeklyLoadByOffer(sections: number): RioWeeklyCourseLoadRow[] {
  return RIO_WEEKLY_COURSE_LOAD_STUB.map((stub) => {
    const totalWeeklySlots =
      stub.weeklySlotsPerSection !== null ? stub.weeklySlotsPerSection * sections : null;
    const totalWeeklyMinutes =
      totalWeeklySlots !== null && stub.minutesPerSlot !== null
        ? totalWeeklySlots * stub.minutesPerSlot
        : null;
    const totalWeeklyContactHours =
      totalWeeklyMinutes !== null
        ? Math.round((totalWeeklyMinutes / 60) * 10) / 10
        : null;
    return {
      ...stub,
      sections,
      totalWeeklySlots,
      totalWeeklyMinutes,
      totalWeeklyContactHours,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade 9 Mock Schedule Simulation
// Planning mockup only. Not the final timetable. Not payroll. Not FTE.
// Not final headcount. Not hiring authorization.
// ─────────────────────────────────────────────────────────────────────────────

export type Grade9MockScheduleBlockType =
  | "teaching_block"
  | "fixed_project_block"
  | "advisory_block"
  | "program_ownership_signal"
  | "pending_validation";

export type Grade9MockScheduleCoverageType =
  | "hs_oriented_launch"
  | "ms_primary_bridge_if_validated"
  | "distributed_eligible_educators"
  | "college_counseling_guidance"
  | "program_ownership"
  | "pending_validation";

export interface Grade9MockScheduleBlock {
  id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  blockLabel: string;
  courseArea: string;
  ledgerRowId: string;
  blockType: Grade9MockScheduleBlockType;
  coverageType: Grade9MockScheduleCoverageType;
  educatorAssignmentLabel: string;
  validationStatus: G9LedgerValidationStatus;
  caveat: string;
}

export const GRADE_9_MOCK_SCHEDULE_BLOCKS: readonly Grade9MockScheduleBlock[] = [
  // ── Monday ───────────────────────────────────────────────────────────────
  {
    id: "g9_mock_mon_b1_math",
    day: "Monday",
    blockLabel: "Block 1",
    courseArea: "Integrated Mathematics",
    ledgerRowId: "rio_g9_capacity_integrated_mathematics",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Mathematics educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "May support Middle School only if load, schedule, and HS mathematics expertise allow.",
  },
  {
    id: "g9_mock_mon_b2_portuguese",
    day: "Monday",
    blockLabel: "Block 2",
    courseArea: "Portuguese / Redação",
    ledgerRowId: "rio_g9_capacity_portuguese_redacao",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Portuguese / Redação educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "MS Portuguese does not automatically qualify for HS Portuguese / Redação.",
  },
  {
    id: "g9_mock_mon_b3_nat_sci",
    day: "Monday",
    blockLabel: "Block 3",
    courseArea: "Natural Sciences: Biology/Chemistry foundations",
    ledgerRowId: "rio_g9_capacity_natural_sciences_bio_chem",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Natural Sciences educator, Bio/Chem focus",
    validationStatus: "covered_pending_explicit_capability_validation",
    caveat: "Covers Biology/Chemistry foundations only, pending explicit capability validation. Physics is not modeled as a Grade 9 requirement.",
  },
  {
    id: "g9_mock_mon_advisory",
    day: "Monday",
    blockLabel: "Advisory",
    courseArea: "Advisory",
    ledgerRowId: "rio_g9_capacity_advisory",
    blockType: "advisory_block",
    coverageType: "distributed_eligible_educators",
    educatorAssignmentLabel: "Distributed Grade 9 advisory responsibility",
    validationStatus: "distributed_pending_timetable_assignment",
    caveat: "Advisory is distinct from College Counseling, GCD, and Project Mentorship. Not a separate hire and not leftover capacity.",
  },
  // ── Tuesday ──────────────────────────────────────────────────────────────
  {
    id: "g9_mock_tue_b1_braz_global",
    day: "Tuesday",
    blockLabel: "Block 1",
    courseArea: "Brazilian Studies / Global Studies",
    ledgerRowId: "rio_g9_capacity_brazilian_global_studies",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Brazilian Studies / Global Studies educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "May connect to GCD-related work, project/research mentoring, and possibly AP Research later. AP Research is not Grade 9 load.",
  },
  {
    id: "g9_mock_tue_b2_ela",
    day: "Tuesday",
    blockLabel: "Block 2",
    courseArea: "English Language Arts",
    ledgerRowId: "rio_g9_capacity_english_language_arts",
    blockType: "teaching_block",
    coverageType: "ms_primary_bridge_if_validated",
    educatorAssignmentLabel: "Validated MS ELA bridge or HS ELA if activated early",
    validationStatus: "ms_bridge_foundation_layer_pending_validation",
    caveat: "Grade 9 ELA may be covered by validated MS ELA. Dedicated HS ELA is expected in Grade 10. AP English, AP Seminar, and AP Research are not Grade 9 load.",
  },
  {
    id: "g9_mock_tue_b3_cc_pathways",
    day: "Tuesday",
    blockLabel: "Block 3",
    courseArea: "College Counseling / Pathways / Global Citizen Diploma",
    ledgerRowId: "rio_g9_capacity_college_counseling_pathways_gcd",
    blockType: "program_ownership_signal",
    coverageType: "college_counseling_guidance",
    educatorAssignmentLabel: "Guidance / College Counseling function",
    validationStatus: "pending_counselor_role_activation",
    caveat: "College Counseling / Pathways / Global Citizen Diploma activates with Grade 9. GCD is embedded here, not a separate Grade 9 row.",
  },
  {
    id: "g9_mock_tue_project_block",
    day: "Tuesday",
    blockLabel: "Fixed Project Block",
    courseArea: "Project Mentorship / Passion Project",
    ledgerRowId: "rio_g9_capacity_project_mentorship_passion_project",
    blockType: "fixed_project_block",
    coverageType: "distributed_eligible_educators",
    educatorAssignmentLabel: "Eligible educators available simultaneously in fixed project block",
    validationStatus: "distributed_pending_timetable_assignment",
    caveat: "This is simultaneous educator availability, not a hiring count. Requires profile fit, group capacity, teaching-load capacity, and schedule fit.",
  },
  // ── Wednesday ────────────────────────────────────────────────────────────
  {
    id: "g9_mock_wed_b1_math",
    day: "Wednesday",
    blockLabel: "Block 1",
    courseArea: "Integrated Mathematics",
    ledgerRowId: "rio_g9_capacity_integrated_mathematics",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Mathematics educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "May support Middle School only if load, schedule, and HS mathematics expertise allow.",
  },
  {
    id: "g9_mock_wed_b2_portuguese",
    day: "Wednesday",
    blockLabel: "Block 2",
    courseArea: "Portuguese / Redação",
    ledgerRowId: "rio_g9_capacity_portuguese_redacao",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Portuguese / Redação educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "MS Portuguese does not automatically qualify for HS Portuguese / Redação.",
  },
  {
    id: "g9_mock_wed_b3_global_expression",
    day: "Wednesday",
    blockLabel: "Block 3",
    courseArea: "Global Expression & Leadership",
    ledgerRowId: "rio_g9_capacity_global_expression_leadership",
    blockType: "program_ownership_signal",
    coverageType: "program_ownership",
    educatorAssignmentLabel: "Brazilian Studies / Global Studies educator or College Counseling / guidance function, pending assignment",
    validationStatus: "hs_program_ownership_pending_assignment",
    caveat: "Do not duplicate GCD, Pathways, or Advisory.",
  },
  {
    id: "g9_mock_wed_advisory",
    day: "Wednesday",
    blockLabel: "Advisory",
    courseArea: "Advisory",
    ledgerRowId: "rio_g9_capacity_advisory",
    blockType: "advisory_block",
    coverageType: "distributed_eligible_educators",
    educatorAssignmentLabel: "Distributed Grade 9 advisory responsibility",
    validationStatus: "distributed_pending_timetable_assignment",
    caveat: "Advisory is distinct from College Counseling, GCD, and Project Mentorship. Not a separate hire and not leftover capacity.",
  },
  // ── Thursday ─────────────────────────────────────────────────────────────
  {
    id: "g9_mock_thu_b1_nat_sci",
    day: "Thursday",
    blockLabel: "Block 1",
    courseArea: "Natural Sciences: Biology/Chemistry foundations",
    ledgerRowId: "rio_g9_capacity_natural_sciences_bio_chem",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Natural Sciences educator, Bio/Chem focus",
    validationStatus: "covered_pending_explicit_capability_validation",
    caveat: "Covers Biology/Chemistry foundations only, pending explicit capability validation. Physics is not modeled as a Grade 9 requirement.",
  },
  {
    id: "g9_mock_thu_b2_braz_global",
    day: "Thursday",
    blockLabel: "Block 2",
    courseArea: "Brazilian Studies / Global Studies",
    ledgerRowId: "rio_g9_capacity_brazilian_global_studies",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Brazilian Studies / Global Studies educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "May connect to GCD-related work, project/research mentoring, and possibly AP Research later. AP Research is not Grade 9 load.",
  },
  {
    id: "g9_mock_thu_b3_ela",
    day: "Thursday",
    blockLabel: "Block 3",
    courseArea: "English Language Arts",
    ledgerRowId: "rio_g9_capacity_english_language_arts",
    blockType: "teaching_block",
    coverageType: "ms_primary_bridge_if_validated",
    educatorAssignmentLabel: "Validated MS ELA bridge or HS ELA if activated early",
    validationStatus: "ms_bridge_foundation_layer_pending_validation",
    caveat: "Grade 9 ELA may be covered by validated MS ELA. Dedicated HS ELA is expected in Grade 10. AP English, AP Seminar, and AP Research are not Grade 9 load.",
  },
  {
    id: "g9_mock_thu_project_block",
    day: "Thursday",
    blockLabel: "Fixed Project Block",
    courseArea: "Project Mentorship / Passion Project",
    ledgerRowId: "rio_g9_capacity_project_mentorship_passion_project",
    blockType: "fixed_project_block",
    coverageType: "distributed_eligible_educators",
    educatorAssignmentLabel: "Eligible educators available simultaneously in fixed project block",
    validationStatus: "distributed_pending_timetable_assignment",
    caveat: "This is simultaneous educator availability, not a hiring count. Requires profile fit, group capacity, teaching-load capacity, and schedule fit.",
  },
  // ── Friday ───────────────────────────────────────────────────────────────
  {
    id: "g9_mock_fri_b1_math",
    day: "Friday",
    blockLabel: "Block 1",
    courseArea: "Integrated Mathematics",
    ledgerRowId: "rio_g9_capacity_integrated_mathematics",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Mathematics educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "May support Middle School only if load, schedule, and HS mathematics expertise allow.",
  },
  {
    id: "g9_mock_fri_b2_portuguese",
    day: "Friday",
    blockLabel: "Block 2",
    courseArea: "Portuguese / Redação",
    ledgerRowId: "rio_g9_capacity_portuguese_redacao",
    blockType: "teaching_block",
    coverageType: "hs_oriented_launch",
    educatorAssignmentLabel: "HS-oriented Portuguese / Redação educator",
    validationStatus: "covered_hs_core_assumption",
    caveat: "MS Portuguese does not automatically qualify for HS Portuguese / Redação.",
  },
  {
    id: "g9_mock_fri_b3_cc_pathways",
    day: "Friday",
    blockLabel: "Block 3",
    courseArea: "College Counseling / Pathways / Global Citizen Diploma",
    ledgerRowId: "rio_g9_capacity_college_counseling_pathways_gcd",
    blockType: "program_ownership_signal",
    coverageType: "college_counseling_guidance",
    educatorAssignmentLabel: "Guidance / College Counseling function",
    validationStatus: "pending_counselor_role_activation",
    caveat: "College Counseling / Pathways / Global Citizen Diploma activates with Grade 9. GCD is embedded here, not a separate Grade 9 row.",
  },
  {
    id: "g9_mock_fri_advisory",
    day: "Friday",
    blockLabel: "Advisory",
    courseArea: "Advisory",
    ledgerRowId: "rio_g9_capacity_advisory",
    blockType: "advisory_block",
    coverageType: "distributed_eligible_educators",
    educatorAssignmentLabel: "Distributed Grade 9 advisory responsibility",
    validationStatus: "distributed_pending_timetable_assignment",
    caveat: "Advisory is distinct from College Counseling, GCD, and Project Mentorship. Not a separate hire and not leftover capacity.",
  },
];

export function buildGrade9MockSchedule(): {
  blocks: readonly Grade9MockScheduleBlock[];
  caveats: string[];
} {
  return {
    blocks: [...GRADE_9_MOCK_SCHEDULE_BLOCKS] as readonly Grade9MockScheduleBlock[],
    caveats: [
      "Mock schedule for planning only; not the final timetable.",
      "Blocks show instructional and coordination logic, not payroll, FTE, final headcount, or hiring authorization.",
      "Project Mentorship / Passion Project is a fixed synchronized block requiring simultaneous educator availability.",
      "MS-primary bridge assignments require HS-level capability validation and schedule fit.",
      "Program ownership signals may not appear as ordinary teaching blocks until Rio curriculum validation confirms scheduled student-contact time.",
    ],
  };
}
