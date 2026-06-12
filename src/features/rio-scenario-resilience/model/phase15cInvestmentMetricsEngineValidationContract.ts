// Phase 15C-DCF-VPL-TIR-PERPETUITY — investment metrics engine validation contract.

export type Phase15CValidationCheckId =
  // R$100M workbook parity (phase15cR100mParitySourceData.ts)
  | "phase15c_r100m_period_indices"
  | "phase15c_r100m_wacc_rates_all_periods"
  | "phase15c_r100m_discount_factors_all_periods"
  | "phase15c_r100m_discounted_cash_flows_all_periods"
  | "phase15c_r100m_cumulative_discounted_cash_flows_all_periods"
  | "phase15c_r100m_2047_terminal_net_income"
  | "phase15c_r100m_terminal_value"
  | "phase15c_r100m_terminal_value_present_value"
  | "phase15c_r100m_npv"
  | "phase15c_r100m_tir"
  // R$90M structural validation
  | "phase15c_r90m_same_wacc_growth_source"
  | "phase15c_r90m_dcf_recomputed_from_r90m_cashflows"
  | "phase15c_r90m_no_r100m_cached_leakage"
  | "phase15c_r90m_deterministic_repeated_calls"
  // Solver validation
  | "phase15c_irr_standard_single_root"
  | "phase15c_irr_all_positive_no_sign_change"
  | "phase15c_irr_all_negative_no_sign_change"
  | "phase15c_irr_multiple_sign_changes"
  | "phase15c_irr_newton_convergence"
  | "phase15c_irr_bisection_fallback"
  | "phase15c_irr_did_not_converge"
  | "phase15c_irr_rate_domain_near_negative_one"
  | "phase15c_irr_deterministic_output"
  // Boundary validation
  | "phase15c_no_phase15b_input_mutation"
  | "phase15c_result_has_21_periods_and_terminal_value"
  | "phase15c_explicit_exclusions_present"
  | "phase15c_irr_unavailable_does_not_remove_npv"
  | "phase15c_invalid_wacc_growth_blocks_terminal_and_npv";

export interface Phase15CValidationCheckResult {
  readonly checkId: Phase15CValidationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface Phase15CValidationReport {
  readonly checks: readonly Phase15CValidationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
  readonly toleranceBRL: number;
  readonly toleranceDiscountFactor: number;
  readonly toleranceRate: number;
}
