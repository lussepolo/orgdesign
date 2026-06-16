// DRE engine validation contract — Phase 13A (2026-06-09).
// 20 checks: structural wiring and behavioral correctness of calculateDre().

export type DreEngineCheckId =
  // Structural: engine function and input shape
  | "dre_engine_function_exists"
  | "dre_engine_input_has_four_levers"
  // Behavioral: output coverage
  | "dre_output_covers_20_projection_years"
  // Behavioral: internal subtotal identities (DRE-native signed addition)
  | "ebitda_subtotal_identity_holds"
  | "margem_de_contribuicao_identity_holds"
  | "total_custo_direto_identity_holds"
  | "total_custos_e_despesas_fixas_identity_holds"
  | "total_despesas_com_vendas_identity_holds"
  // Behavioral: revenue-source non-equivalence guard
  | "receita_operacional_liquida_not_equal_net_receita"
  // Behavioral: sign-translation correctness
  | "fopag_values_negated_to_dre_sign"
  // Behavioral: annual assumption passthrough
  | "annual_assumption_passthrough_correct"
  // Behavioral: Outras Receitas formula
  | "outras_receitas_uses_base_per_learner_ratio"
  // Behavioral: driver and memo guards
  | "numero_de_turmas_is_unsupported_null"
  | "ticket_servico_is_formula_derived_not_constant"
  | "zero_learners_does_not_produce_nan"
  | "total_folha_de_pagamento_is_memo_not_summed_in_ebitda"
  // Structural: below-EBITDA exclusion
  | "below_ebitda_rows_not_in_year_result"
  // Behavioral: cost sign convention
  | "custo_material_digital_sign_correct"
  // Behavioral: discount driver source
  | "bolsa_de_estudos_uses_dre_driver_not_discount_schedule"
  // Structural: Finance-source closure gate
  | "finance_source_closure_incomplete";

export interface DreEngineCheckResult {
  readonly checkId: DreEngineCheckId;
  readonly pass: boolean;
  readonly note: string;
}

export interface DreEngineValidationReport {
  readonly phase: string;
  readonly validatedAt: string;
  readonly totalChecks: number;
  readonly passCount: number;
  readonly failCount: number;
  readonly allPass: boolean;
  readonly checks: readonly DreEngineCheckResult[];
  readonly scopeNote: string;
}
