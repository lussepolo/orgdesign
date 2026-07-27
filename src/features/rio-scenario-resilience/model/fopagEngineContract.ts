import type {
  PayrollAdapterDiagnosticType,
  PayrollAdapterRecordSourceType,
} from "./payrollAdapterContract";

// ── Engine-specific diagnostic types ────────────────────────────────────────
// These are emitted by the FOPAG engine itself, not re-propagated from the adapter.

export type FopagEngineSpecificDiagnosticType =
  | "adapter_failed_unsupported_option"
  | "adapter_partial_missing_cost"
  | "null_cost_in_record"
  | "null_headcount_in_record"
  | "null_allocationModel_in_record";

// Full union of all diagnostic types the engine can emit:
// adapter types (re-propagated) + engine-specific types.
export type FopagEngineDiagnosticType =
  | PayrollAdapterDiagnosticType
  | FopagEngineSpecificDiagnosticType;

export const FOPAG_BLOCKING_DIAGNOSTIC_TYPES: ReadonlySet<FopagEngineDiagnosticType> =
  new Set([
    "missing_cost_source",
    "missing_headcount_source",
    "missing_allocation_model",
    "unsupported_org_design_option",
    "adapter_failed_unsupported_option",
    "adapter_partial_missing_cost",
    "null_cost_in_record",
    "null_headcount_in_record",
    "null_allocationModel_in_record",
  ] satisfies FopagEngineDiagnosticType[]);

export interface FopagEngineDiagnostic {
  diagnosticType: FopagEngineDiagnosticType;
  isBlocking: boolean;
  roleId: string;
  roleName: string;
  year?: number;
  message: string;
}

// ── Engine status ────────────────────────────────────────────────────────────

export type FopagEngineStatus =
  | "calculation_ready"          // no blocking diagnostics; all costs populated
  | "partial_blocking_diagnostic" // blocking diagnostic present; totals partial
  | "failed_adapter_error";      // adapter returned unsupported_option or similar

// ── Calculated record ────────────────────────────────────────────────────────
// One row per (roleId × year) after annualization and growth-factor application.
// allocationModel is non-null here: records with null allocationModel are captured
// as blocking diagnostics in the engine and excluded from calculated output.

export interface FopagCalculatedRecord {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
  year: number;
  roleId: string;
  payrollRoleId: string | null;
  roleName: string;
  roleSourceType: PayrollAdapterRecordSourceType;
  allocationModel: "FOPAG_DIRETO" | "FOLHA_DIRETA";
  headcountOrFte: number;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  // V10-P1 (2026-07-26): independent salary/benefits growth tracks — see
  // src/lib/payroll/payrollGrowth.ts. 1.0 at 2028; salary ×1.059^(year-2028),
  // benefits ×1.10^(year-2028) thereafter. Supersedes the single Phase 8E
  // ANNUAL_ADJUSTMENT=1.06 factor previously shared by both.
  salaryGrowthFactor: number;
  benefitsGrowthFactor: number;
  grossLaborAnnualBeforeGrowth: number; // (gross + labor) × 13 × hc, pre-2028-normalization stored figures
  benefitsAnnualBeforeGrowth: number;   // benefits × 12 × hc, pre-2028-normalization stored figures
  grossLaborAnnualAfterGrowth: number;  // (salaryMonthly + laborChargesMonthly) × 13 × hc, after growth
  benefitsAnnualAfterGrowth: number;    // benefitsMonthly × 12 × hc, after growth
  totalAnnualPayrollAfterGrowth: number; // grossLabor + benefits after growth
  // isAuditRow: true when headcountOrFte=0 or active=false. Included for audit
  // completeness but excluded from FOPAG_DIRETO / FOLHA_DIRETA / BENEFITS totals.
  isAuditRow: boolean;
  diagnostics: string[];
  sourceNotes: string;
}

// ── Year totals ──────────────────────────────────────────────────────────────

export interface FopagByRoleSourceTypeEntry {
  roleSourceType: PayrollAdapterRecordSourceType;
  fopagDireto: number;   // grossLaborAnnualAfterGrowth for FOPAG_DIRETO in this source type
  folhaDireta: number;   // grossLaborAnnualAfterGrowth for FOLHA_DIRETA in this source type
  benefits: number;      // benefitsAnnualAfterGrowth for this source type
  totalPayroll: number;  // fopagDireto + folhaDireta + benefits
}

export interface FopagYearTotals {
  year: number;
  // FOPAG_DIRETO: sum of grossLaborAnnualAfterGrowth for FOPAG_DIRETO-allocated active records.
  fopagDireto: number;
  // FOLHA_DIRETA: sum of grossLaborAnnualAfterGrowth for FOLHA_DIRETA-allocated active records.
  folhaDireta: number;
  // BENEFITS: sum of benefitsAnnualAfterGrowth for all active records (both allocation models).
  benefits: number;
  // TOTAL_PAYROLL = fopagDireto + folhaDireta + benefits.
  totalPayroll: number;
  recordCount: number;   // count of active (non-audit) records contributing to totals
  auditRowCount: number; // count of audit rows (headcountOrFte=0 or inactive) for this year
  byRoleSourceType: FopagByRoleSourceTypeEntry[];
}

// ── Engine input / output ────────────────────────────────────────────────────

export interface FopagEngineInput {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
}

export interface FopagEngineOutput {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
  engineStatus: FopagEngineStatus;
  // calculationReady: true only when no blocking diagnostics exist.
  // Scenario-specific: depends on adapter records for the selected combo.
  // Does NOT imply CALCULATION_CAN_BEGIN (full board model is not complete).
  calculationReady: boolean;
  adapterStatus: string;
  records: readonly FopagCalculatedRecord[];
  yearTotals: readonly FopagYearTotals[];
  diagnostics: readonly FopagEngineDiagnostic[];
  blockingDiagnosticCount: number;
  nonBlockingDiagnosticCount: number;
  implementationNote: string;
  sourceNotes: string;
}
