// Phase 15D-DISCOUNTED-PAYBACK — discounted-payback engine validation contract.

export type Phase15DValidationCheckId =
  // R$100M workbook parity (phase15dR100mParitySourceData.ts)
  | "phase15d_r100m_status"
  | "phase15d_r100m_compact_value"
  | "phase15d_r100m_discounted_payback_years_null"
  | "phase15d_r100m_npv_non_negative"
  | "phase15d_r100m_cumulative_dcf_2047_negative"
  | "phase15d_r100m_row307_helper_values"
  // R$90M structural validation
  | "phase15d_r90m_independent_derivation"
  | "phase15d_r90m_no_r100m_leakage"
  | "phase15d_r90m_deterministic_repeated_calls"
  | "phase15d_r90m_scenario_parity_passthrough"
  // Synthetic calculated / edge-case validation
  | "phase15d_synthetic_recovery_2028"
  | "phase15d_synthetic_recovery_intermediate_year"
  | "phase15d_synthetic_recovery_2047_returns_20_not_20plus"
  | "phase15d_synthetic_no_recovery_returns_20plus"
  | "phase15d_synthetic_zero_cumulative_dcf_not_recovered"
  | "phase15d_synthetic_2047_zero_cumulative_dcf_remains_20plus"
  | "phase15d_synthetic_negative_npv_returns_na"
  | "phase15d_synthetic_zero_npv_with_recovery_returns_numeric"
  | "phase15d_synthetic_zero_npv_without_recovery_returns_20plus"
  | "phase15d_synthetic_positive_npv_without_recovery_returns_20plus"
  | "phase15d_synthetic_pre_ops_excluded_from_recovery_search"
  | "phase15d_synthetic_no_operating_year_zero"
  // Technical-failure validation
  | "phase15d_blocked_calculation_status_not_calculated"
  | "phase15d_blocked_npv_null"
  | "phase15d_invalid_period_count"
  | "phase15d_invalid_missing_pre_ops"
  | "phase15d_invalid_missing_2047"
  | "phase15d_invalid_duplicate_periods"
  | "phase15d_invalid_non_finite_npv"
  | "phase15d_invalid_non_finite_cumulative_dcf"
  | "phase15d_input_immutability"
  | "phase15d_deterministic_repeat_calls"
  // Boundary validation
  | "phase15d_no_dcf_or_vpl_recalculation"
  | "phase15d_no_tir_dependency"
  | "phase15d_no_terminal_value_in_recovery_timing"
  | "phase15d_explicit_exclusions_present";

export interface Phase15DValidationCheckResult {
  readonly checkId: Phase15DValidationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface Phase15DValidationReport {
  readonly checks: readonly Phase15DValidationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
  readonly toleranceBRL: number;
}
