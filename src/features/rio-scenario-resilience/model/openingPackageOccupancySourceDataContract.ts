import type { GradeId } from "./revenueInputs";

export type OpeningPackageId = "t1_g3" | "t1_g4" | "t1_g5" | "t1_g6";

export type OpeningPackageSourceAuthority = "Head of Finance";

export type OpeningPackageApprovalStatus =
  | "finance_validated"
  | "pending_finance_validation"
  | "rejected"
  | "blocked";

export type OpeningPackageSourceUse =
  | "approved_for_opening_package_occupancy_mapping_design"
  | "approved_for_source_data"
  | "reference_only"
  | "blocked";

export type OccupancyScenarioId =
  | "intermediario"
  | "pessimista"
  | "otimista";

export type OccupancyScenarioSourceLabel =
  | "Intermediário"
  | "Pessimista"
  | "Otimista";

export type OpeningPackageWorkbookSourcePath =
  | "src/features/rio-scenario-resilience/source/Modelo_Ocupacao_Concept_2028_v5_T1_G3.xlsx"
  | "src/features/rio-scenario-resilience/source/Modelo_Ocupacao_Concept_2028_v5_T1_G4.xlsx"
  | "src/features/rio-scenario-resilience/source/Modelo_Ocupacao_Concept_2028_v5_T1_G5.xlsx"
  | "src/features/rio-scenario-resilience/source/Modelo_Ocupacao_Concept_2028_v5_T1_G6.xlsx";

export interface OpeningPackageSourceWorkbookMetadata {
  packageId: OpeningPackageId;
  sourceWorkbook: OpeningPackageWorkbookSourcePath;
  sourceAuthority: OpeningPackageSourceAuthority;
  approvalStatus: OpeningPackageApprovalStatus;
  sourceUse: OpeningPackageSourceUse;
  mainModelSheet: "1. Memória de Cálculo";
  scenarioSheets: readonly [
    "2. Intermediário",
    "3. Pessimista",
    "4. Otimista",
  ];
  comparisonSheet: "5. Comparativo";
  hasHiddenSheetsDetected: boolean;
  hasExcelFormulasDetected: boolean;
  valuesAreHardcodedCells: boolean;
  explanatoryLogicIsText: boolean;
  notes?: string;
}

export type SourceGradeLabel =
  | "Toddlers 1"
  | "Toddlers 2"
  | "Pre-K3"
  | "Pre-K4"
  | "Kindergarten"
  | "Grade 1"
  | "Grade 2"
  | "Grade 3"
  | "Grade 4"
  | "Grade 5"
  | "Grade 6"
  | "Grade 7"
  | "Grade 8"
  | "Grade 9"
  | "Grade 10"
  | "Grade 11"
  | "Grade 12";

export type OpeningPackageNormalizedGradeId =
  | "T1"
  | "T2"
  | "PK3"
  | "PK4"
  | "Kindergarten"
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10"
  | "G11"
  | "G12";

export type OpeningPackageGradeId = GradeId | OpeningPackageNormalizedGradeId;

export interface GradeLabelMappingRecord {
  sourceLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  mappingStatus: OpeningPackageMappingStatus;
  notes?: string;
}

export type OpeningPackageMappingStatus =
  | "ready_for_normalization"
  | "needs_mapping"
  | "derivation_rule_required"
  | "approved"
  | "blocked";

export type OpeningPackageBlockingReason =
  | "none"
  | "requires_mature_state_business_rule_approval"
  | "requires_section_derivation_approval"
  | "requires_occupancy_rate_unit_approval"
  | "requires_inactive_grade_semantics"
  | "requires_grade_level_extraction"
  | "requires_anchor_vs_final_year_decision"
  | "blocked_by_missing_source"
  | "blocked_by_unvalidated_source";

export type OpeningPackageDirectWorkbookYear =
  | 2028
  | 2029
  | 2030
  | 2031
  | 2032
  | 2033
  | 2034
  | 2035
  | 2036
  | 2037;

export type OpeningPackageCarryForwardYear =
  | 2038
  | 2039
  | 2040
  | 2041
  | 2042
  | 2043
  | 2044
  | 2045
  | 2046
  | 2047;

export type OpeningPackageProjectionYear =
  | OpeningPackageDirectWorkbookYear
  | OpeningPackageCarryForwardYear;

export type OpeningPackageMatureStateAnchorYear = 2034 | 2035 | 2036 | 2037;

export type OpeningPackageFinalWorkbookYear = 2037;

export type MatureStateCarryForwardSource =
  | "mature_anchor_year"
  | "final_workbook_year"
  | "finance_override"
  | "not_selected";

export type MatureStateCarryForwardApprovalStatus =
  | "structural_carry_forward_allowed"
  | "requires_business_rule_approval"
  | "approved"
  | "blocked";

// Structural carry-forward may use the mature anchor year. Enrollment and
// occupancy-rate carry-forward require approval. This contract does not encode
// carry-forward values or implement carry-forward logic.
export interface OpeningPackageMatureStateExtensionRule {
  packageId: OpeningPackageId;
  matureStateAnchorYear: OpeningPackageMatureStateAnchorYear;
  finalWorkbookYear: OpeningPackageFinalWorkbookYear;
  carryForwardYears: OpeningPackageCarryForwardYear[];
  structuralCarryForwardSource: MatureStateCarryForwardSource;
  enrollmentCarryForwardSource: MatureStateCarryForwardSource;
  occupancyRateCarryForwardSource: MatureStateCarryForwardSource;
  structuralCarryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  enrollmentCarryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  occupancyRateCarryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

export interface PhysicalCapacityCapRecord {
  value: 740;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  notes?: string;
}

export interface StudentsPerClassRecord {
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  studentsPerClass: number;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  notes?: string;
}

export interface ScenarioLabelMappingRecord {
  sourceLabel: OccupancyScenarioSourceLabel;
  scenarioId: OccupancyScenarioId;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  notes?: string;
}

export type ActiveGradeStatus = "active" | "inactive" | "not_applicable";

export type InactiveGradeRepresentation =
  | "null"
  | "omitted"
  | "zero"
  | "not_decided";

export interface ActiveGradeByYearRecord {
  packageId: OpeningPackageId;
  year: OpeningPackageProjectionYear;
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  activeStatus: ActiveGradeStatus;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
  // Provenance fields for model-derived mature-state extension records (Phase 11B).
  isMatureStateExtension?: true;
  derivedFromBaselineYear?: 2037;
  derivationMethod?: "mature_state_carry_forward_from_2037";
}

export type SectionDerivationRuleStatus =
  | "requires_approval"
  | "approved"
  | "blocked";

// Sections may remain null for inactive or undecided values. This contract does
// not derive records or create populated arrays.
export interface SectionsByYearAndGradeRecord {
  packageId: OpeningPackageId;
  year: OpeningPackageProjectionYear;
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  sections: number | null;
  sourceRule: "Salas por turma = 2";
  derivationRuleStatus: SectionDerivationRuleStatus;
  inactiveGradeRepresentation: InactiveGradeRepresentation;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  mappingStatus: OpeningPackageMappingStatus;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

export interface AvailableCapacityByYearRecord {
  packageId: OpeningPackageId;
  year: OpeningPackageProjectionYear;
  availableCapacity: number;
  physicalCapacityCap: 740;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

export interface CapacityByYearAndGradeRecord {
  packageId: OpeningPackageId;
  year: OpeningPackageProjectionYear;
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  gradeCapacity: number | null;
  studentsPerClass: number | null;
  sections: number | null;
  physicalCapacityCap: 740;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

export type OccupancyRateUnitConvention =
  | "decimal_fraction"
  | "percentage_value"
  | "not_approved";

// Occupancy rates may remain null until source data is normalized. This
// contract does not convert decimal or percentage values or populate records.
export interface OccupancyRateRecord {
  packageId: OpeningPackageId;
  scenarioId: OccupancyScenarioId;
  year: OpeningPackageProjectionYear;
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  occupancyRate: number | null;
  occupancyRateUnitConvention: OccupancyRateUnitConvention;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  carryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

// Enrollment may remain null until grade-level source data is normalized.
// Phase 11B: mature-state extension records for 2038–2047 use isCarryForwardYear=false
// and provenance fields to distinguish them from placeholder records.
export interface EnrollmentByYearAndGradeRecord {
  packageId: OpeningPackageId;
  scenarioId: OccupancyScenarioId;
  year: OpeningPackageProjectionYear;
  sourceGradeLabel: SourceGradeLabel;
  normalizedGradeId: OpeningPackageGradeId;
  enrollment: number | null;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  carryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
  // Provenance fields for model-derived mature-state extension records (Phase 11B).
  isMatureStateExtension?: true;
  derivedFromBaselineYear?: 2037;
  derivationMethod?: "mature_state_carry_forward_from_2037";
}

// Total enrollment supports validation and UI summaries. Grade-level
// enrollment records remain the detailed source. This contract does not
// populate records.
export interface TotalEnrollmentValidationRecord {
  packageId: OpeningPackageId;
  scenarioId: OccupancyScenarioId;
  year: OpeningPackageProjectionYear;
  totalEnrollment: number | null;
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  isCarryForwardYear: boolean;
  carryForwardSource: MatureStateCarryForwardSource;
  carryForwardApprovalStatus: MatureStateCarryForwardApprovalStatus;
  blockingReason: OpeningPackageBlockingReason;
  notes?: string;
}

export interface MiddleSchoolActivationRecord {
  packageId: OpeningPackageId;
  activationYear: 2028 | 2029 | 2030 | 2031;
  derivationBasis: "first_year_grade_6_active";
  sourceStatus: OpeningPackageApprovalStatus;
  mappingStatus: OpeningPackageMappingStatus;
  notes?: string;
}

export type OpeningPackageSourceDataReadiness =
  | "ready_for_source_data_records"
  | "needs_mapping"
  | "blocked";

export interface OpeningPackageSourceDataContract {
  contractStatus: OpeningPackageSourceDataReadiness;
  sourceWorkbooks: OpeningPackageSourceWorkbookMetadata[];
  gradeLabelMappings: GradeLabelMappingRecord[];
  scenarioLabelMappings: ScenarioLabelMappingRecord[];
  physicalCapacityCap: PhysicalCapacityCapRecord;
  studentsPerClassRecords: StudentsPerClassRecord[];
  matureStateExtensionRules: OpeningPackageMatureStateExtensionRule[];
  activeGradeByYearRecords: ActiveGradeByYearRecord[];
  sectionsByYearAndGradeRecords: SectionsByYearAndGradeRecord[];
  availableCapacityByYearRecords: AvailableCapacityByYearRecord[];
  capacityByYearAndGradeRecords: CapacityByYearAndGradeRecord[];
  occupancyRateRecords: OccupancyRateRecord[];
  enrollmentByYearAndGradeRecords: EnrollmentByYearAndGradeRecord[];
  totalEnrollmentValidationRecords: TotalEnrollmentValidationRecord[];
  middleSchoolActivationRecords: MiddleSchoolActivationRecord[];
  blockingReasons: OpeningPackageBlockingReason[];
  notes?: string;
}

export const EMPTY_OPENING_PACKAGE_OCCUPANCY_SOURCE_DATA_CONTRACT: OpeningPackageSourceDataContract =
  {
    contractStatus: "needs_mapping",
    sourceWorkbooks: [],
    gradeLabelMappings: [],
    scenarioLabelMappings: [],
    physicalCapacityCap: {
      value: 740,
      sourceStatus: "finance_validated",
      mappingStatus: "ready_for_normalization",
      notes:
        "Campus-level physical capacity cap from Head-of-Finance-validated opening-package workbooks.",
    },
    studentsPerClassRecords: [],
    matureStateExtensionRules: [],
    activeGradeByYearRecords: [],
    sectionsByYearAndGradeRecords: [],
    availableCapacityByYearRecords: [],
    capacityByYearAndGradeRecords: [],
    occupancyRateRecords: [],
    enrollmentByYearAndGradeRecords: [],
    totalEnrollmentValidationRecords: [],
    middleSchoolActivationRecords: [],
    blockingReasons: [
      "requires_mature_state_business_rule_approval",
      "requires_section_derivation_approval",
      "requires_occupancy_rate_unit_approval",
      "requires_inactive_grade_semantics",
      "requires_anchor_vs_final_year_decision",
      "requires_grade_level_extraction",
    ],
    notes:
      "Empty contract shell only. No workbook values, runtime records, formulas, or calculations are implemented.",
  };

// This remains false until finance-validated source records are populated,
// mature-state carry-forward decisions are approved, occupancy-rate unit
// convention is approved, section derivation is approved, and grade-level
// enrollment and occupancy records are normalized.
export const OPENING_PACKAGE_OCCUPANCY_SOURCE_DATA_CAN_SUPPORT_CALCULATION =
  false;
