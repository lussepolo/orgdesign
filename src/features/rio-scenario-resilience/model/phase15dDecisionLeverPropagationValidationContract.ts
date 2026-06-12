// Phase 15D.2-DECISION-LEVER-PROPAGATION-VALIDATION — validation contract.
//
// Proves that calculateDiscountedPaybackForCapitalDecision() (and the chain it
// depends on: calculateDre -> calculateCapitalDecisionBridge ->
// calculatePhase15CInvestmentMetrics) produces dynamically-derived,
// scenario-specific outputs for every supported decision lever, with no
// leakage between scenarios and no reuse of the R$100M workbook-parity
// fixture for production scenario outputs.

export type Phase15DLeverPropagationCheckId =
  // Dynamic derivation
  | "dynamic_canonical_100m_differs_from_r100m_fixture"
  | "dynamic_canonical_90m_differs_from_r100m_fixture"
  // Single-lever isolation (paired scenarios)
  | "lever_capex_90m_vs_100m_propagates"
  | "lever_occupancy_pessimista_propagates"
  | "lever_occupancy_otimista_propagates"
  | "lever_opening_grades_t1g6_propagates"
  | "lever_tuition_bp2_propagates"
  | "lever_org_design_premium_propagates_same_label_different_vpl"
  | "lever_org_design_minimum_propagates"
  | "lever_org_design_premium_vs_minimum_isolated_pair"
  // No leakage / determinism / parity passthrough
  | "no_leakage_90m_vs_100m_npv_differs"
  | "no_leakage_capex_option_id_passthrough"
  | "deterministic_repeated_calls"
  | "scenario_parity_status_reflects_own_scenario"
  // Technical-failure convention (delegated to discountedPaybackEngineValidation)
  | "technical_failure_compact_value_null_preserved";

export interface Phase15DLeverPropagationCheckResult {
  readonly checkId: Phase15DLeverPropagationCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface Phase15DLeverPropagationReport {
  readonly checks: readonly Phase15DLeverPropagationCheckResult[];
  readonly allPass: boolean;
  readonly passCount: number;
  readonly failCount: number;
}
