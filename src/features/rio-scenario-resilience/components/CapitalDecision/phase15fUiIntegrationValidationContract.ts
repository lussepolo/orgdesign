// Phase 15F-SCENARIO-OUTPUT-UI-IMPLEMENTATION — validation contract.
//
// Covers the Capital Decision UI's data integrity, lever controls, status
// rendering, comparison behavior, and boundary (no Tier/score/winner/
// ranking/recommendation, no Service Contracts/MS-HS selectors, no
// browser-workbook dependency).

export type Phase15FUiValidationCheckId =
  // Data integrity
  | "data_occupancy_options_canonical_ids_and_labels"
  | "data_capex_options_canonical_ids_and_labels"
  | "data_default_scenario_produces_calculated_result"
  // Lever controls
  | "lever_ids_exactly_five_no_service_contracts"
  | "lever_opening_grades_options_all_calculate"
  | "lever_occupancy_options_all_calculate"
  | "lever_org_design_options_all_calculate"
  | "lever_tuition_options_all_calculate"
  | "lever_capex_options_all_calculate"
  // Status rendering (strict TIR-vs-WACC)
  | "status_meets_reference_text_uses_exceeds_wacc_language"
  | "status_does_not_meet_reference_text_uses_equal_or_below_language"
  | "status_label_matches_machine_status"
  | "status_spread_sign_matches_tir_wacc_relationship"
  // Formatting
  | "formatting_vpl_compact_and_detailed_present"
  | "formatting_payback_text_matches_status"
  // Comparison behavior
  | "comparison_pair_does_not_recalculate_inputs"
  | "comparison_pair_has_no_winner_score_rank_fields"
  | "comparison_trade_off_notes_is_factual_array"
  // Boundary
  | "boundary_max_saved_scenarios_is_four"
  | "boundary_interpretation_result_has_no_tier_score_winner_fields"
  | "boundary_explicit_exclusions_all_excluded";

export interface Phase15FUiValidationCheckResult {
  readonly checkId: Phase15FUiValidationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface Phase15FUiValidationReport {
  readonly checks: readonly Phase15FUiValidationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
}
