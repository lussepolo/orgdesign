import type {
  MsHsGradeId,
  MsHsStaffingEvidence,
  MsHsStaffingReadinessYearSummary,
  MsHsStaffingReadinessYearSummaryParams,
  MsHsStaffingReadinessRecord,
  MsHsStaffingReadinessSummary,
  MsHsYearModelStatus,
} from "./msHsStaffingReadinessContract";
import { SECONDARY_EDUCATOR_CAPACITY_MODEL } from "./secondaryEducatorCapacityModel";

const ORG_DESIGN_MS_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/features/rio-scenario-resilience/data/orgDesignScenarioExtensions.ts",
  lines: "278-298",
  claim:
    "Middle School educators use existing Middle School tab/model logic, Master Educator compensation, tab-derived headcount/load, and tab-derived activation.",
};

const ORG_DESIGN_HS_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/features/rio-scenario-resilience/data/orgDesignScenarioExtensions.ts",
  lines: "300-322",
  claim:
    "High School educators use existing High School tab/model logic, Master Educator compensation, tab-derived headcount/load, and tab-derived activation.",
};

const ORG_DESIGN_LOGIC_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/features/rio-scenario-resilience/docs/orgDesignLogic.md",
  lines: "53-73",
  claim:
    "MS/HS educator staffing must come from the existing MS and HS tabs/models; prior hardcoded MS/HS educator FTE assumptions must not be used as staffing source.",
};

const MS_TAB_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/components/sections/MiddleSchoolTab.tsx",
  lines: "99-154",
  claim:
    "Middle School tab/model indicates the full G6-G8 core model reaches 8 core educators at 2 sections per grade.",
};

const MS_LOAD_MODEL_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/components/sections/middleSchoolLoadModel.ts",
  lines: "216-256",
  claim:
    "Middle School educator load rows are derived from weekly core slots and maximum teaching load.",
};

const HS_TAB_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/components/sections/HighSchoolTab.tsx",
  lines: "82-173, 272-317",
  claim:
    "High School tab/model defines a 4/0/3/3 increment ramp and 4/4/7/10 cumulative ramp through G12.",
};

const HS_POOL_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/constants/leadership.ts",
  lines: "152-157",
  claim:
    "Legacy hs_pool defines a separate HS Educator Pool; it must be excluded when using tab-derived HS educator totals.",
};

const LEGACY_PAYROLL_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/lib/payroll/domain.ts",
  lines: "263-275",
  claim:
    "Legacy payroll getLeadFteForGrade contains comparison values MS g6=3/g7=4/g8=3 and HS g9=4/g10=0/g11=3/g12=3.",
};

const LEGACY_STAFFING_HOOK_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/hooks/useStaffingLogic.ts",
  lines: "95-113",
  claim:
    "Legacy staffing hook contains the same comparison values as the payroll domain function.",
};

const MASTER_EDUCATOR_EVIDENCE: MsHsStaffingEvidence = {
  file: "src/constants/teaching.ts",
  lines: "116-124",
  claim: "Master Educator compensation archetype exists for MS/HS educator modeling.",
};

export const MIDDLE_SCHOOL_CANONICAL_FULL_MODEL = {
  fullModelGrades: ["g6", "g7", "g8"],
  fullModelCoreEducators: 8,
  fullModelFlexibleProgrammeEducators: 1,
  fullModelTotalEducators: 9,
  sectionsPerGrade: 2,
  compensationArchetype: "master_educator",
  sourceAuthority: "middle_school_tab_model",
  status: "canonical_for_simulator_modeling",
  governanceStatus: "user_validated_simulator_modeling_rule",
  notes: [
    "User-validated simulator modeling rule based on the Middle School tab/model.",
    "Middle School tab/model indicates the full G6-G8 model reaches 8 core educators at 2 sections per grade.",
    "The secondary educator-capacity model adds 1 flexible programme educator inside the mature 9-person MS instructional planning envelope.",
    "Legacy payroll assumptions g6=3, g7=4, g8=3 are comparison values only and must not be summed to 10.",
    "The 8 core + 1 flexible model refers to Middle School instructional planning capacity only, not counselors, specialists, assistants, or monitors.",
    "This utility does not wire payroll totals.",
  ],
} as const;

export const HIGH_SCHOOL_CANONICAL_FULL_MODEL = {
  fullModelGrades: ["g9", "g10", "g11", "g12"],
  rampIncrementFteByGrade: {
    g9: 4,
    g10: 0,
    g11: 3,
    g12: 3,
  },
  cumulativeFteByGrade: {
    g9: 4,
    g10: 4,
    g11: 7,
    g12: 10,
  },
  fullModelCoreEducators: 10,
  fullModelFlexibleProgrammeEducators: 1,
  fullModelTotalEducators: 11,
  compensationArchetype: "master_educator",
  sourceAuthority: "high_school_tab_model",
  status: "canonical_for_simulator_modeling",
  governanceStatus: "user_validated_simulator_modeling_rule",
  hsPoolTreatment: "excluded_to_prevent_double_counting",
  notes: [
    "User-validated simulator modeling rule based on the High School tab/model.",
    "High School tab/model indicates a 10-FTE full ramp across G9-G12.",
    "The tab ramp is used as the canonical simulator modeling rule by user validation.",
    "The secondary educator-capacity model adds 1 flexible programme educator inside the mature 11-person HS instructional planning envelope.",
    "HS pool must not be added on top of the tab-derived HS ramp.",
    "The 10 core + 1 flexible model refers to High School instructional planning capacity only, not counselors, specialists, assistants, or monitors.",
    "This utility does not wire payroll totals.",
  ],
} as const;

export const HIGH_SCHOOL_CANONICAL_CUMULATIVE_FTE_BY_YEAR = {
  2034: 4,
  2035: 4,
  2036: 7,
  2037: 10,
} as const;

export const MIDDLE_SCHOOL_CANONICAL_ACTIVE_GRADES_BY_YEAR = {
  2031: ["g6"],
  2032: ["g6", "g7"],
  2033: ["g6", "g7", "g8"],
} as const;

export const HIGH_SCHOOL_CANONICAL_ACTIVE_GRADES_BY_YEAR = {
  2034: ["g9"],
  2035: ["g9", "g10"],
  2036: ["g9", "g10", "g11"],
  2037: ["g9", "g10", "g11", "g12"],
} as const;

const MS_FULL_MODEL_ACTIVE_YEAR = 2033;
const HS_FULL_MODEL_ACTIVE_YEAR = 2037;

const MIDDLE_SCHOOL_GRADE_START_YEARS = [
  { gradeId: "g6", startYear: 2031 },
  { gradeId: "g7", startYear: 2032 },
  { gradeId: "g8", startYear: 2033 },
] as const satisfies readonly { gradeId: MsHsGradeId; startYear: number }[];

const HIGH_SCHOOL_GRADE_START_YEARS = [
  { gradeId: "g9", startYear: 2034 },
  { gradeId: "g10", startYear: 2035 },
  { gradeId: "g11", startYear: 2036 },
  { gradeId: "g12", startYear: 2037 },
] as const satisfies readonly { gradeId: MsHsGradeId; startYear: number }[];

function getActiveGradesForYear(
  year: number,
  gradeStartYears: readonly { gradeId: MsHsGradeId; startYear: number }[],
): readonly MsHsGradeId[] {
  return gradeStartYears
    .filter((grade) => year >= grade.startYear)
    .map((grade) => grade.gradeId);
}

function getMiddleSchoolCoreEducatorsForYear(year: number): number | null {
  if (year < 2031) return 0;
  if (year >= MS_FULL_MODEL_ACTIVE_YEAR) {
    return MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators;
  }

  return null;
}

function getMiddleSchoolFlexibleEducatorsForYear(year: number): number | null {
  if (year < 2031) return 0;
  if (year >= MS_FULL_MODEL_ACTIVE_YEAR) {
    return MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelFlexibleProgrammeEducators;
  }

  return null;
}

function getHighSchoolCoreEducatorsForYear(year: number): number {
  if (year < 2034) return 0;
  if (year < 2036) return HIGH_SCHOOL_CANONICAL_FULL_MODEL.cumulativeFteByGrade.g10;
  if (year < HS_FULL_MODEL_ACTIVE_YEAR) return HIGH_SCHOOL_CANONICAL_FULL_MODEL.cumulativeFteByGrade.g11;
  return HIGH_SCHOOL_CANONICAL_FULL_MODEL.cumulativeFteByGrade.g12;
}

function getHighSchoolFlexibleEducatorsForYear(year: number): number | null {
  if (year < 2034) return 0;
  if (year >= HS_FULL_MODEL_ACTIVE_YEAR) {
    return HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelFlexibleProgrammeEducators;
  }

  return null;
}

function getMiddleSchoolModelStatus(year: number): MsHsYearModelStatus {
  if (year < 2031) return "not_active";
  if (year >= MS_FULL_MODEL_ACTIVE_YEAR) return "canonical_full_model_active";
  return "partial_model_active_no_canonical_count";
}

function getHighSchoolModelStatus(year: number): MsHsYearModelStatus {
  if (year < 2034) return "not_active";
  if (year >= HS_FULL_MODEL_ACTIVE_YEAR) return "canonical_full_model_active";
  return "canonical_ramp_active";
}

export const MS_HS_STAFFING_READINESS_RECORDS = [
  {
    recordId: "ms-full-model-canonical-staffing",
    subject: "canonical_full_model",
    division: "MS",
    gradeId: "g8",
    label: "Middle School full G6-G8 core educator model",
    sourceAuthority: "middle_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
    canonicalCumulativeEducators: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
    legacyComparisonFte: null,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use the Middle School tab/model as the canonical simulator modeling source. The full model is 8 core educators by the end of G8 at 2 sections per grade.",
    notes: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.notes,
    evidence: [
      ORG_DESIGN_MS_EVIDENCE,
      ORG_DESIGN_LOGIC_EVIDENCE,
      MS_TAB_EVIDENCE,
      MS_LOAD_MODEL_EVIDENCE,
      MASTER_EDUCATOR_EVIDENCE,
    ],
  },
  {
    recordId: "ms-legacy-payroll-comparison",
    subject: "legacy_comparison",
    division: "MS",
    gradeId: null,
    label: "Middle School legacy payroll comparison values",
    sourceAuthority: "legacy_payroll_comparison",
    readinessStatus: "comparison_only",
    payrollWiringDecision: "reference_only",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: null,
    legacyComparisonFte: 10,
    compensationArchetypeId: "master_educator",
    governanceStatus: "comparison_only",
    sourceOfTruthDecision:
      "Legacy payroll values g6=3, g7=4, g8=3 are retained only for comparison and must not be summed as canonical MS staffing.",
    notes: [
      "Legacy payroll assumptions g6=3, g7=4, g8=3 are comparison values only and must not be summed to 10.",
      "Canonical Middle School simulator modeling uses 8 core educators by the end of G8.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [
      LEGACY_PAYROLL_EVIDENCE,
      LEGACY_STAFFING_HOOK_EVIDENCE,
      MS_TAB_EVIDENCE,
      ORG_DESIGN_LOGIC_EVIDENCE,
    ],
  },
  {
    recordId: "hs-full-model-canonical-staffing",
    subject: "canonical_full_model",
    division: "HS",
    gradeId: "g12",
    label: "High School full G9-G12 core educator model",
    sourceAuthority: "high_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
    canonicalCumulativeEducators: HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
    legacyComparisonFte: null,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use the High School tab/model as the canonical simulator modeling source. The cumulative ramp is 4 in 2034/G9, 4 in 2035/G10, 7 in 2036/G11, and 10 in 2037+/G12.",
    notes: HIGH_SCHOOL_CANONICAL_FULL_MODEL.notes,
    evidence: [
      ORG_DESIGN_HS_EVIDENCE,
      ORG_DESIGN_LOGIC_EVIDENCE,
      HS_TAB_EVIDENCE,
      MASTER_EDUCATOR_EVIDENCE,
    ],
  },
  {
    recordId: "hs-g9-canonical-ramp",
    subject: "grade_ramp",
    division: "HS",
    gradeId: "g9",
    label: "High School G9 canonical cumulative ramp",
    sourceAuthority: "high_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: 4,
    legacyComparisonFte: 4,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use 4 cumulative core High School educators for 2034/G9 in simulator modeling.",
    notes: [
      "User-validated simulator modeling rule based on the High School tab/model.",
      "Legacy payroll g9=4 is comparison-only.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [HS_TAB_EVIDENCE, LEGACY_PAYROLL_EVIDENCE, ORG_DESIGN_HS_EVIDENCE],
  },
  {
    recordId: "hs-g10-canonical-ramp",
    subject: "grade_ramp",
    division: "HS",
    gradeId: "g10",
    label: "High School G10 canonical cumulative ramp",
    sourceAuthority: "high_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: 4,
    legacyComparisonFte: 0,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use 4 cumulative core High School educators for 2035/G10 in simulator modeling.",
    notes: [
      "User-validated simulator modeling rule based on the High School tab/model.",
      "Legacy payroll g10=0 is comparison-only.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [HS_TAB_EVIDENCE, LEGACY_PAYROLL_EVIDENCE, ORG_DESIGN_HS_EVIDENCE],
  },
  {
    recordId: "hs-g11-canonical-ramp",
    subject: "grade_ramp",
    division: "HS",
    gradeId: "g11",
    label: "High School G11 canonical cumulative ramp",
    sourceAuthority: "high_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: 7,
    legacyComparisonFte: 3,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use 7 cumulative core High School educators for 2036/G11 in simulator modeling.",
    notes: [
      "User-validated simulator modeling rule based on the High School tab/model.",
      "Legacy payroll g11=3 is comparison-only.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [HS_TAB_EVIDENCE, LEGACY_PAYROLL_EVIDENCE, ORG_DESIGN_HS_EVIDENCE],
  },
  {
    recordId: "hs-g12-canonical-ramp",
    subject: "grade_ramp",
    division: "HS",
    gradeId: "g12",
    label: "High School G12 canonical cumulative ramp",
    sourceAuthority: "high_school_tab_model",
    readinessStatus: "canonical_for_simulator_modeling",
    payrollWiringDecision: "not_wired",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: 10,
    legacyComparisonFte: 3,
    compensationArchetypeId: "master_educator",
    governanceStatus: "user_validated_simulator_modeling_rule",
    sourceOfTruthDecision:
      "Use 10 cumulative core High School educators for 2037+/G12 in simulator modeling.",
    notes: [
      "User-validated simulator modeling rule based on the High School tab/model.",
      "Legacy payroll g12=3 is comparison-only.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [HS_TAB_EVIDENCE, LEGACY_PAYROLL_EVIDENCE, ORG_DESIGN_HS_EVIDENCE],
  },
  {
    recordId: "hs-pool-exclusion",
    subject: "division_pool",
    division: "HS",
    gradeId: null,
    label: "HS Educator Pool exclusion",
    sourceAuthority: "legacy_hs_pool_comparison",
    readinessStatus: "excluded_to_prevent_double_counting",
    payrollWiringDecision: "excluded_do_not_count",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: null,
    legacyComparisonFte: 8,
    compensationArchetypeId: "master_educator",
    governanceStatus: "comparison_only",
    sourceOfTruthDecision:
      "Exclude hs_pool from tab-derived High School educator totals to prevent double counting.",
    notes: [
      "HS pool must not be added on top of the tab-derived HS ramp.",
      "The High School canonical simulator model reaches 10 core educators through the tab/model ramp.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [HS_POOL_EVIDENCE, HS_TAB_EVIDENCE, ORG_DESIGN_HS_EVIDENCE],
  },
  {
    recordId: "ms-hs-master-educator-reference",
    subject: "compensation_archetype",
    division: "MS_HS",
    gradeId: null,
    label: "MS/HS Master Educator compensation archetype",
    sourceAuthority: "committed_org_design_contract",
    readinessStatus: "reference_only",
    payrollWiringDecision: "reference_only",
    canonicalCoreEducators: null,
    canonicalCumulativeEducators: null,
    legacyComparisonFte: null,
    compensationArchetypeId: "master_educator",
    governanceStatus: "reference_only",
    sourceOfTruthDecision:
      "Use Master Educator as the compensation archetype for future MS/HS simulator payroll integration; this utility does not calculate or modify payroll totals.",
    notes: [
      "Compensation archetype is master_educator for both MS and HS canonical simulator modeling.",
      "This utility does not wire payroll totals.",
    ],
    evidence: [
      ORG_DESIGN_MS_EVIDENCE,
      ORG_DESIGN_HS_EVIDENCE,
      ORG_DESIGN_LOGIC_EVIDENCE,
      MASTER_EDUCATOR_EVIDENCE,
    ],
  },
] as const satisfies readonly MsHsStaffingReadinessRecord[];

export const MS_HS_STAFFING_READINESS_SUMMARY = {
  simulatorModelingReady: true,
  payrollWiringApproved: false,
  payrollTotalsModified: false,
  selectedMiddleSchoolStaffingSource: "middle_school_tab_model",
  selectedHighSchoolStaffingSource: "high_school_tab_model",
  compensationArchetypeForFutureUse: "master_educator",
  middleSchoolFullModelCoreEducators: 8,
  middleSchoolFullModelFlexibleEducators: 1,
  middleSchoolFullModelTotalEducators: 9,
  highSchoolFullModelCoreEducators: 10,
  highSchoolFullModelFlexibleEducators: 1,
  highSchoolFullModelTotalEducators: 11,
  combinedSecondaryCoreEducators: SECONDARY_EDUCATOR_CAPACITY_MODEL.combined.coreEducators,
  combinedSecondaryFlexibleEducators: SECONDARY_EDUCATOR_CAPACITY_MODEL.combined.flexibleEducators,
  combinedSecondaryEducatorPool: SECONDARY_EDUCATOR_CAPACITY_MODEL.combined.combinedPool,
  boardReadinessStatus: SECONDARY_EDUCATOR_CAPACITY_MODEL.combined.boardReadinessStatus,
  records: MS_HS_STAFFING_READINESS_RECORDS,
  notes: [
    "User-validated simulator modeling rule based on the Middle School tab/model.",
    "User-validated simulator modeling rule based on the High School tab/model.",
    "Secondary educator-capacity model represents the mature 8+1 MS, 10+1 HS, 20-person combined instructional planning envelope.",
    "Legacy MS payroll values are comparison-only and must not be summed to 10.",
    "Legacy HS payroll values are comparison-only; the canonical HS simulator model uses cumulative 4/4/7/10.",
    "HS pool must be excluded from tab-derived HS educator totals.",
    "Flexible programme educators are not payroll-wired by this utility.",
    "This utility does not wire payroll totals.",
  ],
} as const satisfies MsHsStaffingReadinessSummary;

export function getMsHsStaffingReadinessRecords(): readonly MsHsStaffingReadinessRecord[] {
  return MS_HS_STAFFING_READINESS_RECORDS;
}

export function getMsHsStaffingReadinessSummary(): MsHsStaffingReadinessSummary;
export function getMsHsStaffingReadinessSummary(
  year: number,
): MsHsStaffingReadinessYearSummary;
export function getMsHsStaffingReadinessSummary(
  params: MsHsStaffingReadinessYearSummaryParams,
): MsHsStaffingReadinessYearSummary;
export function getMsHsStaffingReadinessSummary(
  input?: number | MsHsStaffingReadinessYearSummaryParams,
): MsHsStaffingReadinessSummary | MsHsStaffingReadinessYearSummary {
  if (typeof input === "number") {
    return getMsHsStaffingReadinessSummaryForYear(input);
  }

  if (input && typeof input.year === "number") {
    return getMsHsStaffingReadinessSummaryForYear(input.year);
  }

  return MS_HS_STAFFING_READINESS_SUMMARY;
}

export function getMsHsStaffingReadinessSummaryForYear(
  year: number,
): MsHsStaffingReadinessYearSummary {
  const middleSchoolCoreEducators = getMiddleSchoolCoreEducatorsForYear(year);
  const middleSchoolFlexibleEducators = getMiddleSchoolFlexibleEducatorsForYear(year);
  const highSchoolCoreEducators = getHighSchoolCoreEducatorsForYear(year);
  const highSchoolFlexibleEducators = getHighSchoolFlexibleEducatorsForYear(year);
  const totalCoreEducators =
    middleSchoolCoreEducators === null
      ? null
      : middleSchoolCoreEducators + highSchoolCoreEducators;
  const totalFlexibleProgrammeEducators =
    middleSchoolFlexibleEducators === null || highSchoolFlexibleEducators === null
      ? null
      : middleSchoolFlexibleEducators + highSchoolFlexibleEducators;
  const middleSchoolTotalServingEducators =
    middleSchoolCoreEducators === null || middleSchoolFlexibleEducators === null
      ? null
      : middleSchoolCoreEducators + middleSchoolFlexibleEducators;
  const highSchoolTotalServingEducators =
    highSchoolFlexibleEducators === null
      ? highSchoolCoreEducators
      : highSchoolCoreEducators + highSchoolFlexibleEducators;
  const totalServingEducators =
    middleSchoolTotalServingEducators === null || totalFlexibleProgrammeEducators === null
      ? null
      : middleSchoolTotalServingEducators + highSchoolTotalServingEducators;

  return {
    year,
    simulatorModelingReady: true,
    payrollWiringApproved: false,
    payrollTotalsModified: false,
    middleSchool: {
      division: "MS",
      sourceAuthority: "middle_school_tab_model",
      modelStatus: getMiddleSchoolModelStatus(year),
      activeGrades: getActiveGradesForYear(year, MIDDLE_SCHOOL_GRADE_START_YEARS),
      coreEducators: middleSchoolCoreEducators,
      flexibleProgrammeEducators: middleSchoolFlexibleEducators,
      totalServingEducators: middleSchoolTotalServingEducators,
      fullModelCoreEducators: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
      fullModelFlexibleEducators: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelFlexibleProgrammeEducators,
      fullModelTotalEducators: MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelTotalEducators,
      compensationArchetypeId: "master_educator",
      governanceStatus: "user_validated_simulator_modeling_rule",
      notes: [
        "User-validated simulator modeling rule based on the Middle School tab/model.",
        "Middle School full model reaches 8 core educators once G8 is active.",
        "Middle School mature planning envelope is 8 core + 1 flexible = 9 once the full model is active.",
        "MS partial years before G8 do not expose a canonical interim educator count in this utility.",
        "Legacy payroll assumptions g6=3, g7=4, g8=3 are comparison values only and must not be summed to 10.",
        "Flexible programme educator activation is represented only for the mature planning envelope, not payroll.",
        "This utility does not wire payroll totals.",
      ],
    },
    highSchool: {
      division: "HS",
      sourceAuthority: "high_school_tab_model",
      modelStatus: getHighSchoolModelStatus(year),
      activeGrades: getActiveGradesForYear(year, HIGH_SCHOOL_GRADE_START_YEARS),
      coreEducators: highSchoolCoreEducators,
      flexibleProgrammeEducators: highSchoolFlexibleEducators,
      totalServingEducators: highSchoolTotalServingEducators,
      fullModelCoreEducators: HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelCoreEducators,
      fullModelFlexibleEducators: HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelFlexibleProgrammeEducators,
      fullModelTotalEducators: HIGH_SCHOOL_CANONICAL_FULL_MODEL.fullModelTotalEducators,
      compensationArchetypeId: "master_educator",
      governanceStatus: "user_validated_simulator_modeling_rule",
      notes: [
        "User-validated simulator modeling rule based on the High School tab/model.",
        "High School canonical cumulative model is 2034/G9=4, 2035/G10=4, 2036/G11=7, 2037+/G12=10.",
        "High School mature planning envelope is 10 core + 1 flexible = 11 once the full model is active.",
        "HS pool must not be added on top of the tab-derived HS ramp.",
        "Legacy payroll assumptions g9=4, g10=0, g11=3, g12=3 are comparison values only.",
        "Flexible programme educator activation is represented only for the mature planning envelope, not payroll.",
        "This utility does not wire payroll totals.",
      ],
    },
    totalCoreEducators,
    totalFlexibleProgrammeEducators,
    totalServingEducators,
    excludedSources: ["hs_pool"],
    notes: [
      "Year-based summary uses canonical simulator modeling rules only.",
      "MS full-model count is available from 2033 onward; MS partial years return null for MS and total core educators.",
      "HS year counts use the canonical cumulative High School tab/model ramp.",
      "Mature secondary planning envelope is 18 core + 2 flexible = 20; sufficiency remains conditional on timetable validation.",
      "This utility does not wire payroll totals.",
    ],
  };
}

export function getMsHsStaffingReadinessRecord(
  recordId: string,
): MsHsStaffingReadinessRecord | null {
  return (
    MS_HS_STAFFING_READINESS_RECORDS.find((record) => record.recordId === recordId) ??
    null
  );
}
