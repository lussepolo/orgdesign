export type SecondaryDivisionId = "middleSchool" | "highSchool";
export type SecondaryLoadPoint = 26 | 27 | 28;
export type ProgrammeDeliveryUnit =
  | "section"
  | "combined_sections"
  | "grade_cohort"
  | "workshop"
  | "individual_mentoring"
  | "embedded"
  | "pending";
export type ProgrammeOwnershipStatus = "assigned" | "shared" | "pending";
export type ProgrammeSourceStatus =
  | "confirmed"
  | "derived"
  | "planning_assumption"
  | "pending_timetable";
export type ProgrammeDoubleCountingStatus =
  | "inside_secondary_pool"
  | "shared_role_counted_once"
  | "double_counting_risk"
  | "not_counted"
  | "pending";
export type BoardReadinessStatus = "conditional";

export interface SecondaryTimetableEnvelope {
  schoolDaysPerWeek: 5;
  learnerBlocksPerDay: 8;
  learnerBlocksPerSectionPerWeek: 40;
  minutesPerBlock: 45;
  sectionsPerActiveGrade: 2;
}

export interface SecondaryEducatorLoadPolicy {
  preferredMinimum: 26;
  planningMidpoint: 27;
  preferredMaximum: 28;
  loadPoints: readonly SecondaryLoadPoint[];
  scheduledLoadIncludes: readonly string[];
  scheduledLoadExcludes: readonly string[];
}

export interface SecondaryDomainCapacity {
  id: string;
  label: string;
  educators: number;
  blocksPerSection: number;
  coreDemand: number;
  coreLoadEach: number;
  programmeCapacityByLoadPoint: Record<SecondaryLoadPoint, number>;
}

export interface SecondaryFlexibleEducatorCapacity {
  label: string;
  educators: 1;
  coreDemand: 0;
  coreLoadEach: 0;
  programmeCapacityByLoadPoint: Record<SecondaryLoadPoint, number>;
  insideSecondaryPool: true;
  payrollWired: false;
}

export interface SecondaryLoadScenario {
  loadPoint: SecondaryLoadPoint;
  totalEducatorCapacity: number;
  programmeCapacityAfterCore: number;
  programmeMargin?: number;
  requiredTimetableEfficiency?: number;
  validatedTimetableEfficiency: number;
  remainingUnvalidatedEfficiencyGap: number;
}

export interface ProgrammeOwnershipEntry {
  id: string;
  division: SecondaryDivisionId;
  gradeRange: string;
  programmeName: string;
  plannedWeeklyBlocks: number | null;
  deliveryUnit: ProgrammeDeliveryUnit;
  eligibleEducatorDomainOrOwnerRole: string;
  ownershipStatus: ProgrammeOwnershipStatus;
  rawSectionBlockDemand: number | null;
  educatorDeliveryDemand: number | null;
  sourceStatus: ProgrammeSourceStatus;
  doubleCountingStatus: ProgrammeDoubleCountingStatus;
  validationNotes: string;
}

export interface ApCourseClassification {
  id: string;
  label: string;
  allocation:
    | "core_english"
    | "core_mathematics"
    | "core_natural_sciences"
    | "core_social_sciences"
    | "core_elective";
  createsAdditionalDemand: boolean;
  duplicateDemandAllowed: false;
  notes: string;
}

export interface ProjectProgressionEntry {
  grade: "g9" | "g10" | "g11" | "g12";
  label: string;
  programmeFamily: "passion_project" | "innovation_diploma";
}

export interface SharedSpecialistGovernanceEntry {
  id: string;
  label: string;
  treatment:
    | "schoolwide_role_counted_once"
    | "inside_secondary_twenty_flexible"
    | "secondary_core_domain"
    | "excluded_legacy_pool"
    | "pending_boundary";
  countedInSecondaryTwenty: boolean;
  countedAsSharedSpecialist: boolean;
  payrollWiredByThisModel: false;
  doubleCountingPrevented: boolean;
  notes: string;
}

export interface SecondaryDivisionCapacity {
  id: SecondaryDivisionId;
  label: string;
  grades: readonly string[];
  sections: number;
  rawLearnerBlocks: number;
  coreBlocksPerSection: number;
  programmeBlocksPerSection: number;
  coreDemand: number;
  programmeDemand: number;
  coreEducators: number;
  flexibleEducators: 1;
  totalEducators: number;
  averageRequiredLoad: number;
  domains: readonly SecondaryDomainCapacity[];
  flexibleProgrammeEducator: SecondaryFlexibleEducatorCapacity;
  loadScenarios: Record<SecondaryLoadPoint, SecondaryLoadScenario>;
  midpointRoleDistribution: readonly (SecondaryDomainCapacity | SecondaryFlexibleEducatorCapacity)[];
  programmeOwnershipReadiness: "pending";
  timetableValidationReadiness: "not_validated";
}

export interface SecondaryEducatorCapacityModel {
  envelope: SecondaryTimetableEnvelope;
  loadPolicy: SecondaryEducatorLoadPolicy;
  middleSchool: SecondaryDivisionCapacity;
  highSchool: SecondaryDivisionCapacity;
  combined: {
    middleSchoolEducators: 9;
    highSchoolEducators: 11;
    coreEducators: 18;
    flexibleEducators: 2;
    combinedPool: 20;
    planningMidpoint: 27;
    approvedRange: "26-28";
    totalRawLearnerSectionBlocks: 560;
    boardReadinessStatus: BoardReadinessStatus;
    timetableValidated: false;
  };
  programmeOwnership: readonly ProgrammeOwnershipEntry[];
  projectProgression: readonly ProjectProgressionEntry[];
  apCourseClassifications: readonly ApCourseClassification[];
  sharedSpecialistGovernance: readonly SharedSpecialistGovernanceEntry[];
  boardExplanation: {
    decisionRequested: string;
    recommendation: "conditional approval";
    governanceNote: string;
  };
}

export const SECONDARY_TIMETABLE_ENVELOPE: SecondaryTimetableEnvelope = {
  schoolDaysPerWeek: 5,
  learnerBlocksPerDay: 8,
  learnerBlocksPerSectionPerWeek: 40,
  minutesPerBlock: 45,
  sectionsPerActiveGrade: 2,
};

export const SECONDARY_LOAD_POLICY: SecondaryEducatorLoadPolicy = {
  preferredMinimum: 26,
  planningMidpoint: 27,
  preferredMaximum: 28,
  loadPoints: [26, 27, 28],
  scheduledLoadIncludes: [
    "core teaching",
    "Advisory",
    "mentoring",
    "project supervision",
    "electives",
    "programme delivery",
    "workshops",
    "guided study supervision",
    "other scheduled learner-facing responsibilities",
  ],
  scheduledLoadExcludes: [
    "planning",
    "assessment",
    "documentation",
    "meetings",
    "family communication",
    "administrative work",
  ],
};

function toLoadPointRecord(
  buildValue: (loadPoint: SecondaryLoadPoint) => number,
): Record<SecondaryLoadPoint, number> {
  return SECONDARY_LOAD_POLICY.loadPoints.reduce((record, loadPoint) => {
    record[loadPoint] = buildValue(loadPoint);
    return record;
  }, {} as Record<SecondaryLoadPoint, number>);
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function buildDomainCapacity({
  id,
  label,
  educators,
  blocksPerSection,
  sections,
}: {
  id: string;
  label: string;
  educators: number;
  blocksPerSection: number;
  sections: number;
}): SecondaryDomainCapacity {
  const coreDemand = blocksPerSection * sections;
  const coreLoadEach = coreDemand / educators;

  return {
    id,
    label,
    educators,
    blocksPerSection,
    coreDemand,
    coreLoadEach,
    programmeCapacityByLoadPoint: toLoadPointRecord((loadPoint) =>
      (loadPoint - coreLoadEach) * educators
    ),
  };
}

function buildFlexibleProgrammeEducator(): SecondaryFlexibleEducatorCapacity {
  return {
    label: "Flexible Programme Educator",
    educators: 1,
    coreDemand: 0,
    coreLoadEach: 0,
    programmeCapacityByLoadPoint: toLoadPointRecord((loadPoint) => loadPoint),
    insideSecondaryPool: true,
    payrollWired: false,
  };
}

function buildDivisionCapacity({
  id,
  label,
  grades,
  domainInputs,
}: {
  id: SecondaryDivisionId;
  label: string;
  grades: readonly string[];
  domainInputs: readonly {
    id: string;
    label: string;
    educators: number;
    blocksPerSection: number;
  }[];
}): SecondaryDivisionCapacity {
  const sections = grades.length * SECONDARY_TIMETABLE_ENVELOPE.sectionsPerActiveGrade;
  const rawLearnerBlocks =
    sections * SECONDARY_TIMETABLE_ENVELOPE.learnerBlocksPerSectionPerWeek;
  const domains = domainInputs.map((domain) =>
    buildDomainCapacity({ ...domain, sections })
  );
  const coreDemand = domains.reduce((total, domain) => total + domain.coreDemand, 0);
  const coreBlocksPerSection = domainInputs.reduce(
    (total, domain) => total + domain.blocksPerSection,
    0,
  );
  const programmeDemand = rawLearnerBlocks - coreDemand;
  const programmeBlocksPerSection =
    SECONDARY_TIMETABLE_ENVELOPE.learnerBlocksPerSectionPerWeek - coreBlocksPerSection;
  const coreEducators = domains.reduce((total, domain) => total + domain.educators, 0);
  const flexibleProgrammeEducator = buildFlexibleProgrammeEducator();
  const totalEducators = coreEducators + flexibleProgrammeEducator.educators;

  const loadScenarios = toLoadPointRecord((loadPoint) =>
    totalEducators * loadPoint
  );
  const scenarioRecord = SECONDARY_LOAD_POLICY.loadPoints.reduce((record, loadPoint) => {
    const totalEducatorCapacity = loadScenarios[loadPoint];
    const programmeCapacityAfterCore = totalEducatorCapacity - coreDemand;
    const requiredEfficiency =
      id === "highSchool"
        ? Math.max(0, programmeDemand - programmeCapacityAfterCore)
        : undefined;

    record[loadPoint] = {
      loadPoint,
      totalEducatorCapacity,
      programmeCapacityAfterCore,
      programmeMargin:
        id === "middleSchool"
          ? programmeCapacityAfterCore - programmeDemand
          : undefined,
      requiredTimetableEfficiency: requiredEfficiency,
      validatedTimetableEfficiency: 0,
      remainingUnvalidatedEfficiencyGap: requiredEfficiency ?? 0,
    };
    return record;
  }, {} as Record<SecondaryLoadPoint, SecondaryLoadScenario>);

  return {
    id,
    label,
    grades,
    sections,
    rawLearnerBlocks,
    coreBlocksPerSection,
    programmeBlocksPerSection,
    coreDemand,
    programmeDemand,
    coreEducators,
    flexibleEducators: 1,
    totalEducators,
    averageRequiredLoad: roundToTwo(rawLearnerBlocks / totalEducators),
    domains,
    flexibleProgrammeEducator,
    loadScenarios: scenarioRecord,
    midpointRoleDistribution: [...domains, flexibleProgrammeEducator],
    programmeOwnershipReadiness: "pending",
    timetableValidationReadiness: "not_validated",
  };
}

const middleSchool = buildDivisionCapacity({
  id: "middleSchool",
  label: "Middle School",
  grades: ["Grade 6", "Grade 7", "Grade 8"],
  domainInputs: [
    { id: "mathematics", label: "Mathematics", educators: 2, blocksPerSection: 6 },
    { id: "englishLanguageArts", label: "English Language Arts", educators: 2, blocksPerSection: 6 },
    { id: "portuguese", label: "Língua Portuguesa", educators: 2, blocksPerSection: 6 },
    { id: "naturalSciences", label: "Natural Sciences", educators: 1, blocksPerSection: 4 },
    { id: "socialSciences", label: "Social Sciences", educators: 1, blocksPerSection: 4 },
  ],
});

const highSchool = buildDivisionCapacity({
  id: "highSchool",
  label: "High School",
  grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  domainInputs: [
    { id: "portuguese", label: "Língua Portuguesa", educators: 2, blocksPerSection: 5 },
    { id: "mathematics", label: "Mathematics / AP Mathematics", educators: 2, blocksPerSection: 5 },
    { id: "english", label: "English / AP English", educators: 2, blocksPerSection: 5 },
    { id: "naturalSciences", label: "Natural Sciences / AP Sciences", educators: 2, blocksPerSection: 6 },
    { id: "socialSciences", label: "Social Sciences / AP Social Sciences", educators: 2, blocksPerSection: 6 },
  ],
});

export const SECONDARY_PROGRAMME_OWNERSHIP: readonly ProgrammeOwnershipEntry[] = [
  {
    id: "ms-advisory",
    division: "middleSchool",
    gradeRange: "Grades 6-8",
    programmeName: "Advisory",
    plannedWeeklyBlocks: 6,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Cluster educators, Social Sciences, division team",
    ownershipStatus: "shared",
    rawSectionBlockDemand: 6,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Frequency derives from the existing MS programme assumptions; delivery assignment remains timetable-pending.",
  },
  {
    id: "ms-passion-projects",
    division: "middleSchool",
    gradeRange: "Grades 6-7",
    programmeName: "Passion Projects / Project Mentorship",
    plannedWeeklyBlocks: 8,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "English Language Arts, Global Studies, domain mentors",
    ownershipStatus: "shared",
    rawSectionBlockDemand: 8,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Active in Grades 6-7 and not counted as a separate hire.",
  },
  {
    id: "ms-babson-epic",
    division: "middleSchool",
    gradeRange: "Grade 8",
    programmeName: "Babson EPIC",
    plannedWeeklyBlocks: 4,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Mathematics, Portuguese, English Language Arts, Social Sciences",
    ownershipStatus: "shared",
    rawSectionBlockDemand: 4,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Replaces Passion Projects in Grade 8; delivery assignment remains timetable-pending.",
  },
  {
    id: "ms-pathways",
    division: "middleSchool",
    gradeRange: "Grades 6-8",
    programmeName: "Pathways",
    plannedWeeklyBlocks: 6,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Portuguese, Social Sciences, advisory",
    ownershipStatus: "shared",
    rawSectionBlockDemand: 6,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Owner pool is supported by existing narrative; exact section/cohort delivery remains pending.",
  },
  {
    id: "ms-electives-creative-hub",
    division: "middleSchool",
    gradeRange: "Grades 6-8",
    programmeName: "Academic Electives / Creative Hub",
    plannedWeeklyBlocks: 24,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Domain-aligned specialists or MS educators",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 24,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "double_counting_risk",
    validationNotes: "Creative Hub may overlap Arts, Music, LED, or maker roles; count once after shared-role reconciliation.",
  },
  {
    id: "ms-global-expression",
    division: "middleSchool",
    gradeRange: "Grades 6-8",
    programmeName: "Global Expression & Leadership",
    plannedWeeklyBlocks: 12,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "English Language Arts, Portuguese, Social Sciences",
    ownershipStatus: "shared",
    rawSectionBlockDemand: 12,
    educatorDeliveryDemand: null,
    sourceStatus: "derived",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Eligible domains are identified; exact delivery schedule remains pending.",
  },
  {
    id: "ms-remaining-envelope",
    division: "middleSchool",
    gradeRange: "Grades 6-8",
    programmeName: "Remaining programme and specialist envelope",
    plannedWeeklyBlocks: 24,
    deliveryUnit: "pending",
    eligibleEducatorDomainOrOwnerRole: "Pending timetable and specialist boundary",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 24,
    educatorDeliveryDemand: null,
    sourceStatus: "pending_timetable",
    doubleCountingStatus: "pending",
    validationNotes: "Completes the canonical 84-block MS programme envelope without inventing owners.",
  },
  {
    id: "hs-project-progression",
    division: "highSchool",
    gradeRange: "Grades 9-12",
    programmeName: "Passion Project or Innovation Diploma",
    plannedWeeklyBlocks: 16,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Eligible educators by profile fit; flexible programme educator",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 16,
    educatorDeliveryDemand: null,
    sourceStatus: "planning_assumption",
    doubleCountingStatus: "inside_secondary_pool",
    validationNotes: "Grade 9-10 Passion Projects; Grade 11-12 Innovation Diploma. Do not count both in the same grade.",
  },
  {
    id: "hs-core-electives",
    division: "highSchool",
    gradeRange: "Grades 9-12",
    programmeName: "Core Electives",
    plannedWeeklyBlocks: 16,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Subject specialists, shared specialists, or flexible programme educator",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 16,
    educatorDeliveryDemand: null,
    sourceStatus: "planning_assumption",
    doubleCountingStatus: "pending",
    validationNotes: "Course-choice and concurrency validation required.",
  },
  {
    id: "hs-body-movement",
    division: "highSchool",
    gradeRange: "Grades 9-12",
    programmeName: "Body & Movement",
    plannedWeeklyBlocks: 8,
    deliveryUnit: "section",
    eligibleEducatorDomainOrOwnerRole: "Existing schoolwide Body & Movement specialist",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 8,
    educatorDeliveryDemand: null,
    sourceStatus: "planning_assumption",
    doubleCountingStatus: "shared_role_counted_once",
    validationNotes: "Existing schoolwide role must be counted once and not added separately to the 20-educator pool.",
  },
  {
    id: "hs-remaining-programmes",
    division: "highSchool",
    gradeRange: "Grades 9-12",
    programmeName: "Remaining grade-specific programmes",
    plannedWeeklyBlocks: 64,
    deliveryUnit: "pending",
    eligibleEducatorDomainOrOwnerRole: "Pending programme ownership ledger",
    ownershipStatus: "pending",
    rawSectionBlockDemand: 64,
    educatorDeliveryDemand: null,
    sourceStatus: "pending_timetable",
    doubleCountingStatus: "pending",
    validationNotes: "Includes Advisory, Pathways, Global Expression, GCD support, guided study, Flex and Focus, and other grade-specific functions pending timetable validation.",
  },
];

export const SECONDARY_PROJECT_PROGRESSION: readonly ProjectProgressionEntry[] = [
  { grade: "g9", label: "Passion Project I", programmeFamily: "passion_project" },
  { grade: "g10", label: "Passion Project II", programmeFamily: "passion_project" },
  { grade: "g11", label: "Innovation Diploma Project", programmeFamily: "innovation_diploma" },
  { grade: "g12", label: "Innovation Diploma Project", programmeFamily: "innovation_diploma" },
];

export const SECONDARY_AP_COURSE_CLASSIFICATIONS: readonly ApCourseClassification[] = [
  {
    id: "ap-language",
    label: "AP Language",
    allocation: "core_english",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "Fulfils the English allocation.",
  },
  {
    id: "ap-literature",
    label: "AP Literature",
    allocation: "core_english",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "Fulfils the English allocation.",
  },
  {
    id: "ap-mathematics",
    label: "AP Mathematics",
    allocation: "core_mathematics",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "Fulfils the Mathematics allocation.",
  },
  {
    id: "ap-biology-chemistry-physics",
    label: "AP Biology / Chemistry / Physics",
    allocation: "core_natural_sciences",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "May fulfil the Natural Sciences allocation.",
  },
  {
    id: "ap-humanities",
    label: "AP Human Geography / World History / Macroeconomics",
    allocation: "core_social_sciences",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "May fulfil the Social Sciences allocation.",
  },
  {
    id: "ap-seminar",
    label: "AP Seminar",
    allocation: "core_social_sciences",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "May function as the Grade 10 Social Sciences course.",
  },
  {
    id: "ap-core-elective",
    label: "AP course offered through Core Electives",
    allocation: "core_elective",
    createsAdditionalDemand: false,
    duplicateDemandAllowed: false,
    notes: "Occupies the Core Elective allocation and is not added again as a core course.",
  },
];

export const SECONDARY_SHARED_SPECIALIST_GOVERNANCE: readonly SharedSpecialistGovernanceEntry[] = [
  {
    id: "body",
    label: "Body & Movement",
    treatment: "schoolwide_role_counted_once",
    countedInSecondaryTwenty: false,
    countedAsSharedSpecialist: true,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "May serve MS/HS programme demand but remains a schoolwide specialist, not an extra MS or HS educator in the 20.",
  },
  {
    id: "arts",
    label: "Arts",
    treatment: "schoolwide_role_counted_once",
    countedInSecondaryTwenty: false,
    countedAsSharedSpecialist: true,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "Creative Hub overlap must be allocated once.",
  },
  {
    id: "music",
    label: "Music",
    treatment: "schoolwide_role_counted_once",
    countedInSecondaryTwenty: false,
    countedAsSharedSpecialist: true,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "Shared specialist capacity is outside the 20 unless explicitly reclassified later.",
  },
  {
    id: "counselors",
    label: "Counselors / college and career support",
    treatment: "schoolwide_role_counted_once",
    countedInSecondaryTwenty: false,
    countedAsSharedSpecialist: true,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "Pathways and college support must not duplicate counselor roles.",
  },
  {
    id: "flexible-programme-educators",
    label: "MS and HS Flexible Programme Educators",
    treatment: "inside_secondary_twenty_flexible",
    countedInSecondaryTwenty: true,
    countedAsSharedSpecialist: false,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "Two flexible educators are inside the 20-person instructional planning pool and are not payroll-wired here.",
  },
  {
    id: "hs-pool",
    label: "Legacy HS Educator Pool",
    treatment: "excluded_legacy_pool",
    countedInSecondaryTwenty: false,
    countedAsSharedSpecialist: false,
    payrollWiredByThisModel: false,
    doubleCountingPrevented: true,
    notes: "Excluded to prevent double counting with the HS core educator model.",
  },
];

export const SECONDARY_EDUCATOR_CAPACITY_MODEL: SecondaryEducatorCapacityModel = {
  envelope: SECONDARY_TIMETABLE_ENVELOPE,
  loadPolicy: SECONDARY_LOAD_POLICY,
  middleSchool,
  highSchool,
  combined: {
    middleSchoolEducators: 9,
    highSchoolEducators: 11,
    coreEducators: 18,
    flexibleEducators: 2,
    combinedPool: 20,
    planningMidpoint: 27,
    approvedRange: "26-28",
    totalRawLearnerSectionBlocks: 560,
    boardReadinessStatus: "conditional",
    timetableValidated: false,
  },
  programmeOwnership: SECONDARY_PROGRAMME_OWNERSHIP,
  projectProgression: SECONDARY_PROJECT_PROGRESSION,
  apCourseClassifications: SECONDARY_AP_COURSE_CLASSIFICATIONS,
  sharedSpecialistGovernance: SECONDARY_SHARED_SPECIALIST_GOVERNANCE,
  boardExplanation: {
    decisionRequested:
      "Approve a mature secondary planning envelope of 20 educators: 9 serving Middle School and 11 serving High School.",
    recommendation: "conditional approval",
    governanceNote:
      "The 20-educator model is a mature instructional-capacity planning envelope. Final sufficiency remains conditional on programme ownership, shared-role reconciliation, educator qualifications, and master-timetable validation.",
  },
};

export function getSecondaryEducatorCapacityModel(): SecondaryEducatorCapacityModel {
  return SECONDARY_EDUCATOR_CAPACITY_MODEL;
}

export function getSecondaryProgrammeOwnershipByDivision(
  division: SecondaryDivisionId,
): readonly ProgrammeOwnershipEntry[] {
  return SECONDARY_PROGRAMME_OWNERSHIP.filter((entry) => entry.division === division);
}
