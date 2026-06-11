import type {
  EnrollmentByYearAndGrade,
  GradeId,
  ProjectionYear,
} from "./revenueInputs";

export type PayrollAllocationCategory =
  | "FOPAG_DIRETO"
  | "FOLHA_DIRETA"
  | "UNMAPPED";

export type PayrollRoleSource =
  | "existing_leadership_config"
  | "existing_teaching_config"
  | "simulator_org_design_extension"
  | "unmapped";

export type PayrollRoleValidationStatus =
  | "validated"
  | "missing_salary"
  | "missing_charges"
  | "missing_benefits"
  | "missing_fte_or_headcount_rule"
  | "missing_activation_year"
  | "missing_allocation_category"
  | "unmapped";

export interface ValidatedRoleCost {
  roleId: string;
  label: string;
  source: PayrollRoleSource;
  allocationCategory: PayrollAllocationCategory;
  validationStatus: PayrollRoleValidationStatus;
  grossMonthlyBRL: number | null;
  laborChargesMonthlyBRL: number | null;
  benefitsMonthlyBRL: number | null;
  activationYear: ProjectionYear | null;
  notes?: string;
}

export type ValidatedRoleCostMap = Record<string, ValidatedRoleCost>;

export type StaffingModelInputStatus =
  | "validated"
  | "missing"
  | "needs_mapping"
  | "blocked";

export type SectionsByYearAndGrade = Record<
  ProjectionYear,
  Partial<Record<GradeId, number>>
>;

export type ActiveGradesByYear = Record<ProjectionYear, GradeId[]>;

export interface StaffingModelInputs {
  status: StaffingModelInputStatus;
  activeGradesByYear: ActiveGradesByYear | null;
  sectionsByYearAndGrade: SectionsByYearAndGrade | null;
  enrollmentByYearAndGrade: EnrollmentByYearAndGrade | null;
  notes?: string;
}

export interface PayrollAdapterInputReadiness {
  selectedOpeningGradesOptionId: StaffingModelInputStatus;
  selectedOrgDesignOptionId: StaffingModelInputStatus;
  activeGradesByYear: StaffingModelInputStatus;
  sectionsByYearAndGrade: StaffingModelInputStatus;
  enrollmentByYearAndGrade: StaffingModelInputStatus;
  validatedRoleCostMap: StaffingModelInputStatus;
  staffingModelInputs: StaffingModelInputStatus;
}

export interface PayrollAdapterInput {
  selectedOpeningGradesOptionId: string | null;
  selectedOrgDesignOptionId: string | null;
  activeGradesByYear: ActiveGradesByYear | null;
  sectionsByYearAndGrade: SectionsByYearAndGrade | null;
  enrollmentByYearAndGrade: EnrollmentByYearAndGrade | null;
  validatedRoleCostMap: ValidatedRoleCostMap | null;
  staffingModelInputs: StaffingModelInputs | null;
  readiness: PayrollAdapterInputReadiness;
}

export type PayrollYearValue = Record<ProjectionYear, number | null>;

export type PayrollByRoleByYear = Record<string, PayrollYearValue>;

export type PayrollByCategoryByYear = Record<
  PayrollAllocationCategory,
  PayrollYearValue
>;

export interface MissingRoleCostAssumption {
  roleId: string;
  label: string;
  missingFields: PayrollRoleValidationStatus[];
  notes?: string;
}

export interface BlockedRole {
  roleId: string;
  label: string;
  reason:
    | "missing_role_cost"
    | "missing_fte_or_headcount_rule"
    | "missing_activation_year"
    | "missing_allocation_category"
    | "unmapped_role";
  notes?: string;
}

export type PayrollAdapterOutputStatus =
  | "available"
  | "blocked_missing_input"
  | "blocked_mapping_pending"
  | "blocked_role_cost_validation"
  | "blocked_not_implemented";

export interface PayrollAdapterOutput {
  status: PayrollAdapterOutputStatus;
  payrollByYear: PayrollYearValue | null;
  fopagDiretoByYear: PayrollYearValue | null;
  folhaDiretaByYear: PayrollYearValue | null;
  payrollByRoleByYear: PayrollByRoleByYear | null;
  payrollByCategoryByYear: PayrollByCategoryByYear | null;
  blockedRoles: BlockedRole[];
  missingRoleCostAssumptions: MissingRoleCostAssumption[];
  notes?: string;
}

export const EMPTY_PAYROLL_ADAPTER_INPUT: PayrollAdapterInput = {
  selectedOpeningGradesOptionId: null,
  selectedOrgDesignOptionId: null,
  activeGradesByYear: null,
  sectionsByYearAndGrade: null,
  enrollmentByYearAndGrade: null,
  validatedRoleCostMap: null,
  staffingModelInputs: null,
  readiness: {
    selectedOpeningGradesOptionId: "validated",
    selectedOrgDesignOptionId: "needs_mapping",
    activeGradesByYear: "missing",
    sectionsByYearAndGrade: "missing",
    enrollmentByYearAndGrade: "missing",
    validatedRoleCostMap: "needs_mapping",
    staffingModelInputs: "needs_mapping",
  },
};

export const EMPTY_PAYROLL_ADAPTER_OUTPUT: PayrollAdapterOutput = {
  status: "blocked_not_implemented",
  payrollByYear: null,
  fopagDiretoByYear: null,
  folhaDiretaByYear: null,
  payrollByRoleByYear: null,
  payrollByCategoryByYear: null,
  blockedRoles: [],
  missingRoleCostAssumptions: [],
  notes: "Payroll adapter contract exists, but adapter implementation has not been created.",
};

// ── Phase 8H: Payroll Adapter Build Types ──────────────────────────────────────
// These types describe the normalized payroll input records produced by the adapter.
// They are distinct from the FOPAG-calculation output types above.
// The adapter assembles inputs; it does not compute annual payroll totals.

export type PayrollAdapterRecordSourceType =
  | "baseline_leadership"
  | "baseline_backoffice"
  | "baseline_specialist"
  | "extension_alias"
  | "extension_new_role"
  | "ey_teaching_lead"
  | "ey_learning_assistant"
  | "ey_learning_monitor"
  | "ls_teaching_lead"
  | "ls_learning_assistant"
  | "ms_teaching_lead"
  | "hs_teaching_lead";

export type PayrollAdapterCostSourceId =
  | "leadership_config"
  | "backoffice_config"
  | "specialist_config"
  | "educator_level_master"
  | "educator_level_associate"
  | "learning_monitor_detail"
  | "learning_assistant_detail"
  | "baseline_alias_no_cost"
  | "missing_not_confirmed";

export type PayrollAdapterHeadcountSourceType =
  | "headcount_progression"
  | "fixed_fte_per_grade"
  | "per_section"
  | "extension_schedule_fixed"
  | "alias_inherits_baseline";

export type PayrollAdapterDiagnosticType =
  | "missing_cost_source"
  | "missing_headcount_source"
  | "missing_allocation_model"
  | "excluded_role"
  | "section_overflow"
  | "inactive_grade"
  | "unsupported_org_design_option"
  | "alias_no_additional_cost"
  | "zero_fte_grade"
  | "extension_not_active_in_option";

export interface PayrollAdapterDiagnostic {
  diagnosticType: PayrollAdapterDiagnosticType;
  roleId: string;
  roleName: string;
  year?: number;
  message: string;
}

export interface PayrollAdapterRecord {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
  year: number;
  roleId: string;
  payrollRoleId: string | null;
  roleName: string;
  roleSourceType: PayrollAdapterRecordSourceType;
  allocationModel: "FOPAG_DIRETO" | "FOLHA_DIRETA" | null;
  headcountOrFte: number | null;
  headcountSourceType: PayrollAdapterHeadcountSourceType;
  headcountSourceNote: string;
  costSourceId: PayrollAdapterCostSourceId;
  costSourceNote: string;
  grossMonthly: number | null;
  laborChargesMonthly: number | null;
  benefitsMonthly: number | null;
  active: boolean;
  // Phase 13H (2026-06-09): legacy adapter metadata, fixed to `false`, not consumed by
  // fopagEngine.ts or any other caller. Not the FOPAG readiness source — see
  // FopagEngineOutput.calculationReady (fopagEngineContract.ts), computed dynamically by
  // calculateFopag().
  calculationReady: false;
  diagnostics: string[];
  sourceNotes: string;
}

export interface PayrollAdapterBuildInput {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
}

export type PayrollAdapterBuildStatus =
  | "assembled"
  | "partial_missing_cost"
  | "failed_unsupported_option";

export interface PayrollAdapterBuildOutput {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
  adapterStatus: PayrollAdapterBuildStatus;
  records: readonly PayrollAdapterRecord[];
  diagnostics: readonly PayrollAdapterDiagnostic[];
  // Phase 13H (2026-06-09): calculationReady, adapterImplemented, and fopagCalculationReady
  // below are legacy adapter metadata, fixed to literal values, not consumed by fopagEngine.ts
  // or any other caller. Not the FOPAG readiness source — see FopagEngineOutput.calculationReady
  // (fopagEngineContract.ts), computed dynamically by calculateFopag() from adapterStatus and
  // diagnostics.
  calculationReady: false;
  adapterImplemented: true;
  fopagCalculationReady: false;
  sourceNotes: string;
}
