// Phase 15B-FCO-CAPEX-BRIDGE — capital decision engine validation contract.

export type CapitalDecisionValidationCheckId =
  // R$100M workbook parity
  | "r100m_pre_ops_expansion_capex"
  | "r100m_pre_ops_ebitda"
  | "r100m_pre_ops_fco_after_capex"
  | "r100m_2032_direct_tax"
  | "r100m_2038_nol_recovery"
  | "r100m_2039_nol_exhaustion_discontinuity"
  | "r100m_accumulated_nol_zero_at_2039"
  | "r100m_2047_cumulative_fco_after_capex"
  | "r100m_da_parity_2028_2047"
  | "r100m_capex_expansion_parity_all_periods"
  | "r100m_sustain_capex_parity_2028_2047"
  | "r100m_fco_parity_all_periods"
  | "r100m_cashflow_after_capex_parity_all_periods"
  // R$90M structural validation
  | "r90m_pre_ops_expansion_capex"
  | "r90m_2030_expansion_capex"
  | "r90m_2031_expansion_capex"
  | "r90m_total_expansion_capex"
  | "sustain_capex_unchanged_between_options"
  | "r90m_da_differs_from_r100m"
  | "r90m_tax_nol_recomputed"
  | "r90m_no_r100m_cached_leakage"
  // Boundary / scope
  | "capex_never_changes_ebitda"
  | "result_has_exactly_21_periods"
  | "explicit_exclusions_present"
  | "repeated_calls_deterministic";

export interface CapitalDecisionValidationCheckResult {
  readonly checkId: CapitalDecisionValidationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface CapitalDecisionValidationReport {
  readonly checks: readonly CapitalDecisionValidationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
  readonly toleranceBRL: number;
}
