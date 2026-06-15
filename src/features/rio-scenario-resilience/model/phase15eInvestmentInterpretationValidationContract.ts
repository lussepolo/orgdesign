// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — validation
// contract.

export type Phase15EValidationCheckId =
  // Interpretation status (investmentInterpretationEngine.ts)
  | "interp_tir_gt_wacc_meets_reference"
  | "interp_tir_eq_wacc_does_not_meet_reference"
  | "interp_tir_lt_wacc_does_not_meet_reference"
  | "interp_irr_no_sign_change_unavailable"
  | "interp_irr_did_not_converge_unavailable"
  | "interp_blocked_phase15c_calculation_status"
  | "interp_blocked_phase15d_npv_null"
  | "interp_multiple_roots_warning_note_present"
  | "interp_npv_sign_positive"
  | "interp_npv_sign_zero"
  | "interp_npv_sign_negative"
  | "interp_npv_sign_unavailable_when_blocked"
  // Dimension comparison (scenarioInvestmentComparison.ts)
  | "compare_reference_meets_vs_does_not_meet"
  | "compare_reference_irr_unavailable_vs_calculated_not_comparable"
  | "compare_reference_blocked_vs_valid_not_comparable"
  | "compare_spread_positive_difference"
  | "compare_spread_zero_equal"
  | "compare_spread_negative_difference"
  | "compare_payback_numeric_vs_numeric"
  | "compare_payback_numeric_vs_20plus"
  | "compare_payback_20plus_vs_20plus_equal"
  | "compare_payback_na_vs_numeric_not_comparable"
  | "compare_payback_technical_null_not_comparable"
  | "compare_npv_higher_lower_equal_unavailable"
  // Trade-off detection
  | "tradeoff_shorter_payback_lower_vpl"
  | "tradeoff_higher_spread_longer_payback"
  | "tradeoff_identical_payback_different_vpl_and_spread"
  | "tradeoff_all_dimensions_favor_one_scenario_no_tradeoff"
  | "tradeoff_no_comparable_dimensions"
  // Production scenario matrix (reuses Phase 15D.2's S1-S8)
  | "matrix_five_levers_preserved_per_scenario"
  | "matrix_service_contracts_and_mshs_notes_preserved"
  | "matrix_independent_interpretation_per_scenario"
  | "matrix_no_r100m_fixture_leakage"
  | "matrix_deterministic_repeated_calls"
  | "matrix_scenario_input_not_mutated"
  | "matrix_org_design_equal_payback_distinct_vpl_and_spread"
  // Boundary validation
  | "boundary_values_match_phase15c_and_phase15d_results"
  | "boundary_single_phase15c_call_per_interpretation"
  | "boundary_phase15d_derived_from_same_phase15c_result"
  | "boundary_no_tier_score_winner_ranking_recommendation_fields";

export interface Phase15EValidationCheckResult {
  readonly checkId: Phase15EValidationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface Phase15EValidationReport {
  readonly checks: readonly Phase15EValidationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
}
