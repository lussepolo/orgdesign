// DRE + EBITDA engine contract — Phase 13A (2026-06-09).
//
// DreEngineInput combines the fields required by calculateReceita() and
// calculateFopag(): openingPackageId, occupancyScenarioId, tuitionScenarioId
// (from ReceitaEngineScenarioKey) plus orgDesignOptionId (from FopagEngineInput).
//
// DreYearResult holds all DRE line values for a single projection year:
//   • drivers: numero_de_alunos (adapter-derived), numero_de_turmas (null — no source),
//     ticket_servico (formula-derived, null-guarded against zero enrollment)
//   • revenue block through receita_operacional_liquida
//   • direct_costs through total_custo_direto
//   • contribution_margin (margem_de_contribuicao)
//   • fixed_costs_and_expenses through total_custos_e_despesas_fixas
//     (total_folha_de_pagamento present as memo_kpi — excluded from EBITDA sum)
//   • sales_expenses through total_despesas_com_vendas
//   • ebitda and percentual_ebitda
//
// EBITDA is a DreYearResult subtotal — not a separate engine output or file.
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No UI.
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).

import type {
  OpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageProjectionYear,
} from "./openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "./revenueInputs";

export interface DreEngineInput {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly tuitionScenarioId: TuitionScenarioId;
  readonly orgDesignOptionId: string;
}

export interface DreYearResult {
  readonly year: OpeningPackageProjectionYear;

  // ── drivers ────────────────────────────────────────────────────────────────
  // numero_de_alunos: sum of contractedLearners from receitaEngine grainRecords (adapter).
  readonly numero_de_alunos: number;
  // numero_de_turmas: no source data available — unsupported.
  readonly numero_de_turmas: null;
  // ticket_servico: formula-derived (receitas_com_ensino_regular / alunos / 12).
  // null when numero_de_alunos === 0 (zero-division guard).
  readonly ticket_servico: number | null;

  // ── revenue ────────────────────────────────────────────────────────────────
  // Sourced from grossReceitaBeforeDiscount via adaptReceitasComEnsinoRegular().
  // NOT netReceitaAfterDiscount (structurally non-equivalent — Phase 12H).
  readonly receitas_com_ensino_regular: number;
  readonly receitas_com_upselling: number;
  readonly receita_de_ensino_bruta: number;
  // Negative (percentual_desconto_medio stored negative in source, e.g. -0.12).
  readonly bolsa_de_estudos: number;
  readonly receita_de_ensino_liquida: number;
  // Negative (desconto_metodo stored positive; explicit minus applied in engine).
  readonly descontos_metodo_de_assinatura: number;
  readonly receita_com_eventos: number;
  readonly receita_com_material_didatico: number;
  // basePerLearnerRatio × numero_de_alunos; reajuste_despesas not applied (source unavailable).
  readonly outras_receitas: number;
  readonly receita_operacional_antes_das_deducoes: number;
  // Negative (percentual_deducoes stored positive; explicit minus applied in engine).
  readonly deducoes: number;
  readonly receita_operacional_liquida: number;

  // ── direct_costs ───────────────────────────────────────────────────────────
  // Negative (fator stored positive; explicit minus applied in engine).
  readonly custo_de_material_digital: number;
  // Pass-through equal to custo_de_material_digital (Finance DRE formula).
  readonly custo_da_mercadoria_vendida: number;
  // Negative (fopagDireto is always-positive engine output; negated once here).
  readonly fopag_direto_clt_pj: number;
  // Annual Finance assumption values — already negative in source, used directly.
  readonly eventos_seb: number;
  readonly certificacoes: number;
  readonly custos_com_alimentacao: number;
  readonly materiais_pedagogicos: number;
  readonly total_custo_direto: number;

  // ── contribution_margin ────────────────────────────────────────────────────
  readonly margem_de_contribuicao: number;

  // ── fixed_costs_and_expenses ───────────────────────────────────────────────
  // Negative (folhaDireta and benefits are always-positive engine outputs; negated once).
  readonly folha_de_pagamento: number;
  readonly beneficios: number;
  // MEMO KPI — do not include in total_custos_e_despesas_fixas or EBITDA sum.
  readonly total_folha_de_pagamento: number;
  // 17 independent Finance assumption rows — already negative, used directly.
  readonly cursos_e_treinamentos: number;
  readonly servicos_de_limpeza_e_seguranca: number;
  readonly consultoria_e_honorarios: number;
  readonly despesas_juridicas: number;
  readonly rpa: number;
  readonly aluguel_iptu: number;
  readonly conservacao_predial_e_manutencao_maquinas_e_moveis: number;
  readonly locacao_de_maquinas_e_equipamentos: number;
  readonly tecnologia_telefone_internet_licencas_e_servicos_de_informacao: number;
  readonly energia_eletrica_agua_e_esgoto: number;
  readonly materiais_de_limpeza: number;
  readonly materiais_de_escritorio: number;
  readonly despesas_com_viagens: number;
  readonly corporativo_bu: number;
  readonly rateio_corporativo: number;
  readonly demais_impostos_e_taxas: number;
  readonly demais_custos_e_despesas: number;
  // Excludes total_folha_de_pagamento (memo_kpi, includedInEbitda=false).
  readonly total_custos_e_despesas_fixas: number;

  // ── sales_expenses ─────────────────────────────────────────────────────────
  readonly despesas_com_marketing: number;
  readonly pcld: number;
  readonly despesas_bancarias: number;
  readonly descontos_comerciais: number;
  // dreLineId canonical join key "despesas_com_sinistro" (corrected PnL label: Despesas com Isenção).
  readonly despesas_com_sinistro: number;
  readonly total_despesas_com_vendas: number;

  // ── ebitda ─────────────────────────────────────────────────────────────────
  // EBITDA = margem_de_contribuicao + total_custos_e_despesas_fixas + total_despesas_com_vendas.
  readonly ebitda: number;
  // null when receita_operacional_liquida === 0 (zero-division guard).
  readonly percentual_ebitda: number | null;
}

export interface DreEngineOutput {
  readonly input: DreEngineInput;
  readonly byYear: Record<OpeningPackageProjectionYear, DreYearResult>;
  /** Records why reajuste_despesas is not applied to Outras Receitas. */
  readonly outrasReceitasReajusteNote: string;
  /**
   * Records that descontos_metodo_de_assinatura uses an assumed formula base.
   * dreLineItemMap.ts marks this row sourceType "pending_finance_source_confirmation"
   * with "formula text not provided — formula relationship not confirmed."
   */
  readonly descontosMetodoFormulaNote: string;
}
