export type MsHsStaffingDivision = "MS" | "HS" | "MS_HS";

export type MsHsStaffingSubject =
  | "canonical_full_model"
  | "grade_ramp"
  | "legacy_comparison"
  | "division_pool"
  | "compensation_archetype";

export type MsHsGradeId =
  | "g6"
  | "g7"
  | "g8"
  | "g9"
  | "g10"
  | "g11"
  | "g12";

export type MsHsStaffingSourceAuthority =
  | "middle_school_tab_model"
  | "high_school_tab_model"
  | "legacy_payroll_comparison"
  | "legacy_hs_pool_comparison"
  | "committed_org_design_contract";

export type MsHsStaffingReadinessStatus =
  | "canonical_for_simulator_modeling"
  | "comparison_only"
  | "excluded_to_prevent_double_counting"
  | "reference_only";

export type MsHsPayrollWiringDecision =
  | "not_wired"
  | "excluded_do_not_count"
  | "reference_only";

export type MsHsYearModelStatus =
  | "not_active"
  | "partial_model_active_no_canonical_count"
  | "canonical_full_model_active"
  | "canonical_ramp_active";

export interface MsHsStaffingEvidence {
  file: string;
  lines: string;
  claim: string;
}

export interface MsHsStaffingReadinessRecord {
  recordId: string;
  subject: MsHsStaffingSubject;
  division: MsHsStaffingDivision;
  gradeId: MsHsGradeId | null;
  label: string;
  sourceAuthority: MsHsStaffingSourceAuthority;
  readinessStatus: MsHsStaffingReadinessStatus;
  payrollWiringDecision: MsHsPayrollWiringDecision;
  canonicalCoreEducators: number | null;
  canonicalCumulativeEducators: number | null;
  legacyComparisonFte: number | null;
  compensationArchetypeId: "master_educator" | null;
  governanceStatus: "user_validated_simulator_modeling_rule" | "comparison_only" | "reference_only";
  sourceOfTruthDecision: string;
  notes: readonly string[];
  evidence: readonly MsHsStaffingEvidence[];
}

export interface MsHsStaffingReadinessSummary {
  simulatorModelingReady: true;
  payrollWiringApproved: false;
  payrollTotalsModified: false;
  selectedMiddleSchoolStaffingSource: "middle_school_tab_model";
  selectedHighSchoolStaffingSource: "high_school_tab_model";
  compensationArchetypeForFutureUse: "master_educator";
  middleSchoolFullModelCoreEducators: 8;
  middleSchoolFullModelFlexibleEducators: 1;
  middleSchoolFullModelTotalEducators: 9;
  highSchoolFullModelCoreEducators: 10;
  highSchoolFullModelFlexibleEducators: 1;
  highSchoolFullModelTotalEducators: 11;
  combinedSecondaryCoreEducators: 18;
  combinedSecondaryFlexibleEducators: 2;
  combinedSecondaryEducatorPool: 20;
  boardReadinessStatus: "conditional";
  records: readonly MsHsStaffingReadinessRecord[];
  notes: readonly string[];
}

export interface MsHsDivisionYearStaffingSummary {
  division: MsHsStaffingDivision;
  sourceAuthority: "middle_school_tab_model" | "high_school_tab_model";
  modelStatus: MsHsYearModelStatus;
  activeGrades: readonly MsHsGradeId[];
  coreEducators: number | null;
  flexibleProgrammeEducators: number | null;
  totalServingEducators: number | null;
  fullModelCoreEducators: 8 | 10;
  fullModelFlexibleEducators: 1;
  fullModelTotalEducators: 9 | 11;
  compensationArchetypeId: "master_educator";
  governanceStatus: "user_validated_simulator_modeling_rule";
  notes: readonly string[];
}

export interface MsHsStaffingReadinessYearSummary {
  year: number;
  simulatorModelingReady: true;
  payrollWiringApproved: false;
  payrollTotalsModified: false;
  middleSchool: MsHsDivisionYearStaffingSummary;
  highSchool: MsHsDivisionYearStaffingSummary;
  totalCoreEducators: number | null;
  totalFlexibleProgrammeEducators: number | null;
  totalServingEducators: number | null;
  excludedSources: readonly string[];
  notes: readonly string[];
}

export interface MsHsStaffingReadinessYearSummaryParams {
  year: number;
}
