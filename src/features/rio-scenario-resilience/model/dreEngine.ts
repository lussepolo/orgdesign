// DRE + EBITDA engine — Phase 13A (2026-06-09).
//
// calculateDre() is a pure function implementing formulaVariant3 (Phase 12G):
//   EBITDA = Margem de Contribuição + Total Custos e Despesas Fixas + Total Despesas com Vendas
// as defined in dreLineItemMap.ts DRE_LINE_ITEM_MAP and ebitdaCalculationDesign.ts.
//
// Sign conventions:
//   Annual assumption values: stored negative in dreAnnualAssumptionSourceData.ts → used directly.
//   FOPAG values (fopagDireto, folhaDireta, benefits): always-positive engine outputs → negated once.
//   percentual_desconto_medio: stored negative (e.g. -0.12) → no extra minus at usage site.
//   desconto_metodo, percentual_deducoes: stored positive → explicit minus applied at usage site.
//   custo_material_digital_fator: stored positive → explicit minus applied at usage site.
//
// V10-F2.2 (2026-07-27) — v10 precedence, all 22 row-11-dependent lines live:
// per the project owner's v10-governs-scoped-revenue decision, every line
// whose v10 formula references PnL row 11 ("Reajuste Despesas") is now
// computed live from the v10-derived formula, replacing the prior
// `assumption(lineId, year)` v7-static lookup. See reajusteDespesasGrowth.ts
// module header for the complete 22-line dependency table, the three
// formula families (A/A-variant/B), the fixed-base compounding line
// (despesas_juridicas), and the three reset-bearing lines
// (consultoria_e_honorarios, demais_custos_e_despesas,
// despesas_com_marketing). dreAnnualAssumptionSourceData.ts (v7-sourced)
// remains the live source ONLY for lines outside this 22-line set
// (aluguel_iptu, corporativo_bu, rateio_corporativo, pcld,
// descontos_comerciais, despesas_com_isencao) — out of this phase's scope.
// total_folha_de_pagamento (memo_kpi) excluded from total_custos_e_despesas_fixas and EBITDA.
// below_ebitda rows excluded (never looked up).
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).

import type { OpeningPackageProjectionYear } from "./openingPackageOccupancySourceDataContract";
import type { FopagYearTotals } from "./fopagEngineContract";
import type { DreEngineInput, DreEngineOutput, DreYearResult } from "./dreEngineContract";
import { calculateReceita } from "./receitaEngine";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";
import { calculateFopag } from "./fopagEngine";
import {
  adaptReceitasComEnsinoRegular,
  adaptNumeroDeAlunos,
  DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER,
} from "./dreScenarioAdapters";
import { DRE_REVENUE_DRIVER_SOURCE_DATA } from "./dreRevenueDriverSourceData";
import { DRE_COST_DRIVER_SOURCE_DATA } from "./dreCostDriverSourceData";
import { DRE_ANNUAL_ASSUMPTION_SOURCE_DATA } from "./dreAnnualAssumptionSourceData";
import {
  resolveReajusteDespesasGrowthFactor,
  toReajusteDespesasBase2028,
  perLearnerReajusteDespesasValue,
  revenueShareReajusteDespesasValue,
  demaisImpostosETaxasValueForYear,
  consultoriaEHonorariosValueForYear,
  demaisCustosEDespesasValueForYear,
  despesasComMarketingValueForYear,
  reajusteDespesasValueForYear,
  RECEITA_COM_EVENTOS_BASE_PER_LEARNER_RATIO,
  EVENTOS_SEB_BASE_PER_LEARNER_RATIO,
  CERTIFICACOES_BASE_PER_LEARNER_RATIO,
  CUSTOS_COM_ALIMENTACAO_BASE_PER_LEARNER_RATIO,
  MATERIAIS_PEDAGOGICOS_BASE_PER_LEARNER_RATIO,
  ENERGIA_ELETRICA_AGUA_E_ESGOTO_BASE_PER_LEARNER_RATIO,
  DESPESAS_BANCARIAS_BASE_PER_LEARNER_RATIO,
  CURSOS_E_TREINAMENTOS_REVENUE_SHARE_RATIO,
  SERVICOS_DE_LIMPEZA_E_SEGURANCA_REVENUE_SHARE_RATIO,
  RPA_REVENUE_SHARE_RATIO,
  CONSERVACAO_PREDIAL_E_MANUTENCAO_MAQUINAS_E_MOVEIS_REVENUE_SHARE_RATIO,
  LOCACAO_DE_MAQUINAS_E_EQUIPAMENTOS_REVENUE_SHARE_RATIO,
  TECNOLOGIA_TELEFONE_INTERNET_LICENCAS_E_SERVICOS_DE_INFORMACAO_REVENUE_SHARE_RATIO,
  MATERIAIS_DE_LIMPEZA_REVENUE_SHARE_RATIO,
  MATERIAIS_DE_ESCRITORIO_REVENUE_SHARE_RATIO,
  DESPESAS_COM_VIAGENS_REVENUE_SHARE_RATIO,
} from "./reajusteDespesasGrowth";

const DESPESAS_JURIDICAS_BASE_2028 = -20000; // v10 PnL row 253, E253 literal (no 2028 rate applied)

export function calculateDre(input: DreEngineInput): DreEngineOutput {
  const receitaOutput = calculateReceita({
    openingPackageId: input.openingPackageId,
    occupancyScenarioId: input.occupancyScenarioId,
    tuitionScenarioId: input.tuitionScenarioId,
  });

  const fopagOutput = calculateFopag({
    openingPackageId: input.openingPackageId,
    occupancyScenarioId: input.occupancyScenarioId,
    orgDesignOptionId: input.orgDesignOptionId,
    educatorTierByGrade: input.educatorTierByGrade,
  });

  // FOPAG year-totals lookup (FopagYearTotals.year is number)
  const fopagByYear = new Map<number, FopagYearTotals>();
  for (const yt of fopagOutput.yearTotals) {
    fopagByYear.set(yt.year, yt);
  }

  // Annual assumption records: canonical dreLineId → annualValuesByYear.
  // Join key: record.dreLineItemMapDreLineId ?? record.dreLineId
  // (5 records have a dreLineItemMapDreLineId that differs from dreLineId).
  const assumptionByLineId = new Map<string, Record<number, number>>();
  for (const record of DRE_ANNUAL_ASSUMPTION_SOURCE_DATA.records) {
    const canonicalId =
      "dreLineItemMapDreLineId" in record &&
      typeof record.dreLineItemMapDreLineId === "string"
        ? record.dreLineItemMapDreLineId
        : record.dreLineId;
    assumptionByLineId.set(canonicalId, record.annualValuesByYear as Record<number, number>);
  }

  // Revenue driver lookup: driverId → annualValuesByYear
  const revenueDriverByYear = new Map<string, Record<number, number>>();
  for (const d of DRE_REVENUE_DRIVER_SOURCE_DATA.records) {
    revenueDriverByYear.set(d.driverId, d.annualValuesByYear as Record<number, number>);
  }

  // custo_material_digital_fator is constant across all years
  const custoMaterialDigitalFator =
    DRE_COST_DRIVER_SOURCE_DATA.records[0].annualValuesByYear[2028];

  // V10-F2: the stored ratio is a pre-2028 benchmark (v10 PnL!AA235/AA223) —
  // apply the explicit 2028 Reajuste Despesas conversion (×1.05) once, then
  // the recurring 4.9%/yr factor per year. See reajusteDespesasGrowth.ts.
  const outrasReceitasBase2028 = toReajusteDespesasBase2028(
    DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER.sourceValues.basePerLearnerRatio,
  );

  function assumption(lineId: string, year: number): number {
    return assumptionByLineId.get(lineId)?.[year] ?? 0;
  }

  function driverValue(driverId: string, year: number): number {
    return revenueDriverByYear.get(driverId)?.[year] ?? 0;
  }

  const byYear = {} as Record<OpeningPackageProjectionYear, DreYearResult>;

  // V10-F2.2: reset-bearing row-11-dependent lines (PnL rows 252/266/268)
  // carry their own prior-year result forward through the reset chain — see
  // reajusteDespesasGrowth.ts. RECEITA_PROJECTION_YEARS is ascending, so a
  // simple sequential accumulator per line is sufficient.
  let priorConsultoriaEHonorarios: number | undefined;
  let priorDemaisCustosEDespesas: number | undefined;
  let priorDespesasComMarketing: number | undefined;

  for (const year of RECEITA_PROJECTION_YEARS) {
    const fopagYt = fopagByYear.get(year);

    // ── Adapters ──────────────────────────────────────────────────────────────
    const receitas_com_ensino_regular = adaptReceitasComEnsinoRegular(receitaOutput, year);
    const numero_de_alunos = adaptNumeroDeAlunos(receitaOutput, year);

    // ── Revenue drivers ───────────────────────────────────────────────────────
    // stored negative (e.g. -0.12 for 2028) — no extra minus at usage site
    const percentual_desconto_medio = driverValue("percentual_desconto_medio", year);
    // stored positive — explicit minus applied below
    const desconto_metodo_rate = driverValue("desconto_metodo", year);
    // stored positive — explicit minus applied below
    const percentual_deducoes = driverValue("percentual_deducoes", year);
    const adesao_upselling = driverValue("adesao_upselling", year);
    const ticket_medio_upselling = driverValue("ticket_medio_upselling", year);
    const ticket_material = driverValue("ticket_material", year);

    // ── Revenue block ─────────────────────────────────────────────────────────
    const receitas_com_upselling =
      adesao_upselling * numero_de_alunos * ticket_medio_upselling;

    const receita_de_ensino_bruta =
      receitas_com_ensino_regular + receitas_com_upselling;

    // percentual_desconto_medio is negative → product is negative (deduction)
    const bolsa_de_estudos = receitas_com_ensino_regular * percentual_desconto_medio;

    const receita_de_ensino_liquida = receita_de_ensino_bruta + bolsa_de_estudos;

    // PnL workbook: C230 = −C$13 × C225, where C225 = receitas_com_ensino_regular.
    // desconto_metodo_rate is positive → explicit minus makes result negative.
    const descontos_metodo_de_assinatura = -desconto_metodo_rate * receitas_com_ensino_regular;

    // V10-F2.2: v10 PnL row 233, Family A (per-learner ratio carry-forward) —
    // see reajusteDespesasGrowth.ts. Confirmed independent of row 238 (no
    // circular dependency).
    const receita_com_eventos = perLearnerReajusteDespesasValue(
      RECEITA_COM_EVENTOS_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );

    const receita_com_material_didatico = numero_de_alunos * ticket_material * 12;

    // V10-F2: reajuste_despesas now applied — see module header and
    // reajusteDespesasGrowth.ts for the governed formula and source evidence.
    const outras_receitas =
      outrasReceitasBase2028 * resolveReajusteDespesasGrowthFactor(year) * numero_de_alunos;

    const receita_operacional_antes_das_deducoes =
      receita_de_ensino_liquida +
      descontos_metodo_de_assinatura +
      receita_com_eventos +
      receita_com_material_didatico +
      outras_receitas;

    // percentual_deducoes is positive → explicit minus makes result negative
    const deducoes = -percentual_deducoes * receita_operacional_antes_das_deducoes;

    const receita_operacional_liquida = receita_operacional_antes_das_deducoes + deducoes;

    // null guard: avoid division by zero when no learners
    const ticket_servico =
      numero_de_alunos > 0
        ? receitas_com_ensino_regular / numero_de_alunos / 12
        : null;

    // ── Direct costs ──────────────────────────────────────────────────────────
    // fator stored positive → explicit minus makes result negative
    const custo_de_material_digital =
      -custoMaterialDigitalFator * receita_com_material_didatico;

    // pass-through (Finance DRE formula: CMV = Custo de Material Digital)
    const custo_da_mercadoria_vendida = custo_de_material_digital;

    // FOPAG values always positive → negate once
    const fopag_direto_clt_pj = -(fopagYt?.fopagDireto ?? 0);

    // V10-F2.2: v10 PnL rows 242/243/244/245, Family A (per-learner ratio
    // carry-forward) — see reajusteDespesasGrowth.ts.
    const eventos_seb = perLearnerReajusteDespesasValue(
      EVENTOS_SEB_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );
    const certificacoes = perLearnerReajusteDespesasValue(
      CERTIFICACOES_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );
    const custos_com_alimentacao = perLearnerReajusteDespesasValue(
      CUSTOS_COM_ALIMENTACAO_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );
    const materiais_pedagogicos = perLearnerReajusteDespesasValue(
      MATERIAIS_PEDAGOGICOS_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );

    const total_custo_direto =
      fopag_direto_clt_pj +
      eventos_seb +
      certificacoes +
      custos_com_alimentacao +
      materiais_pedagogicos;

    // ── Contribution margin ───────────────────────────────────────────────────
    const margem_de_contribuicao =
      receita_operacional_liquida + custo_da_mercadoria_vendida + total_custo_direto;

    // ── Fixed costs and expenses ──────────────────────────────────────────────
    // FOPAG values always positive → negate once
    const folha_de_pagamento = -(fopagYt?.folhaDireta ?? 0);
    const beneficios = -(fopagYt?.benefits ?? 0);

    // memo_kpi — present for board readability; excluded from the total below
    const total_folha_de_pagamento = fopag_direto_clt_pj + folha_de_pagamento;

    // V10-F2.2: rows 250/251/254/256/257/258/260/261/262 — v10 PnL Family B
    // (fixed % of same-year receita_operacional_liquida). Row 252 is a
    // reset-bearing line (its own function). aluguel_iptu, corporativo_bu,
    // rateio_corporativo are NOT row-11-dependent (out of this phase's
    // scope) — remain sourced from the v7-static Finance assumption table.
    const cursos_e_treinamentos = revenueShareReajusteDespesasValue(
      CURSOS_E_TREINAMENTOS_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const servicos_de_limpeza_e_seguranca = revenueShareReajusteDespesasValue(
      SERVICOS_DE_LIMPEZA_E_SEGURANCA_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const consultoria_e_honorarios = consultoriaEHonorariosValueForYear(
      year,
      priorConsultoriaEHonorarios,
    );
    priorConsultoriaEHonorarios = consultoria_e_honorarios;
    // V10-F2.2: v10 PnL row 253 — fixed-base compounding (E253=-20000
    // literal, no 2028 rate; F253 onward compounds by the recurring row-11
    // rate). Reuses the existing base2028→factor mechanism directly.
    const despesas_juridicas = reajusteDespesasValueForYear(DESPESAS_JURIDICAS_BASE_2028, year);
    const rpa = revenueShareReajusteDespesasValue(RPA_REVENUE_SHARE_RATIO, receita_operacional_liquida, year);
    const aluguel_iptu = assumption("aluguel_iptu", year);
    const conservacao_predial_e_manutencao_maquinas_e_moveis = revenueShareReajusteDespesasValue(
      CONSERVACAO_PREDIAL_E_MANUTENCAO_MAQUINAS_E_MOVEIS_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const locacao_de_maquinas_e_equipamentos = revenueShareReajusteDespesasValue(
      LOCACAO_DE_MAQUINAS_E_EQUIPAMENTOS_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const tecnologia_telefone_internet_licencas_e_servicos_de_informacao =
      revenueShareReajusteDespesasValue(
        TECNOLOGIA_TELEFONE_INTERNET_LICENCAS_E_SERVICOS_DE_INFORMACAO_REVENUE_SHARE_RATIO,
        receita_operacional_liquida,
        year,
      );
    // V10-F2.2: v10 PnL row 259 — Family A variant (turma/aluno base-year
    // switch, collapses to the same per-learner mechanism — see
    // reajusteDespesasGrowth.ts module header).
    const energia_eletrica_agua_e_esgoto = perLearnerReajusteDespesasValue(
      ENERGIA_ELETRICA_AGUA_E_ESGOTO_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );
    const materiais_de_limpeza = revenueShareReajusteDespesasValue(
      MATERIAIS_DE_LIMPEZA_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const materiais_de_escritorio = revenueShareReajusteDespesasValue(
      MATERIAIS_DE_ESCRITORIO_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const despesas_com_viagens = revenueShareReajusteDespesasValue(
      DESPESAS_COM_VIAGENS_REVENUE_SHARE_RATIO,
      receita_operacional_liquida,
      year,
    );
    const corporativo_bu = assumption("corporativo_bu", year);
    const rateio_corporativo = assumption("rateio_corporativo", year);
    // V10-F2.2: v10 PnL row 265 — Family B plus a 2028-only -20000 literal.
    const demais_impostos_e_taxas = demaisImpostosETaxasValueForYear(
      receita_operacional_liquida,
      year,
    );
    // V10-F2.2: v10 PnL row 266 — reset-bearing line (own function).
    const demais_custos_e_despesas = demaisCustosEDespesasValueForYear(
      year,
      priorDemaisCustosEDespesas,
      receita_operacional_liquida,
    );
    priorDemaisCustosEDespesas = demais_custos_e_despesas;

    // total_folha_de_pagamento (memo_kpi) intentionally excluded
    const total_custos_e_despesas_fixas =
      folha_de_pagamento +
      beneficios +
      cursos_e_treinamentos +
      servicos_de_limpeza_e_seguranca +
      consultoria_e_honorarios +
      despesas_juridicas +
      rpa +
      aluguel_iptu +
      conservacao_predial_e_manutencao_maquinas_e_moveis +
      locacao_de_maquinas_e_equipamentos +
      tecnologia_telefone_internet_licencas_e_servicos_de_informacao +
      energia_eletrica_agua_e_esgoto +
      materiais_de_limpeza +
      materiais_de_escritorio +
      despesas_com_viagens +
      corporativo_bu +
      rateio_corporativo +
      demais_impostos_e_taxas +
      demais_custos_e_despesas;

    // ── Sales expenses ────────────────────────────────────────────────────────
    // V10-F2.2: v10 PnL row 268 — reset-bearing line (own function).
    const despesas_com_marketing = despesasComMarketingValueForYear(
      year,
      priorDespesasComMarketing,
    );
    priorDespesasComMarketing = despesas_com_marketing;
    const pcld = assumption("pcld", year);
    // V10-F2.2: v10 PnL row 270 — Family A (per-learner ratio carry-forward).
    const despesas_bancarias = perLearnerReajusteDespesasValue(
      DESPESAS_BANCARIAS_BASE_PER_LEARNER_RATIO,
      numero_de_alunos,
      year,
    );
    const descontos_comerciais = assumption("descontos_comerciais", year);
    // canonical join key "despesas_com_sinistro" (corrected PnL label: Despesas com Isenção)
    const despesas_com_sinistro = assumption("despesas_com_sinistro", year);

    const total_despesas_com_vendas =
      despesas_com_marketing +
      pcld +
      despesas_bancarias +
      descontos_comerciais +
      despesas_com_sinistro;

    // ── EBITDA ────────────────────────────────────────────────────────────────
    // formulaVariant3: EBITDA = Margem de Contribuição + Total Custos e Despesas Fixas
    //   + Total Despesas com Vendas (DRE-native signed addition)
    const ebitda =
      margem_de_contribuicao + total_custos_e_despesas_fixas + total_despesas_com_vendas;

    // null guard: avoid division by zero
    const percentual_ebitda =
      receita_operacional_liquida !== 0 ? ebitda / receita_operacional_liquida : null;

    byYear[year] = {
      year,
      numero_de_alunos,
      numero_de_turmas: null,
      ticket_servico,
      receitas_com_ensino_regular,
      receitas_com_upselling,
      receita_de_ensino_bruta,
      bolsa_de_estudos,
      receita_de_ensino_liquida,
      descontos_metodo_de_assinatura,
      receita_com_eventos,
      receita_com_material_didatico,
      outras_receitas,
      receita_operacional_antes_das_deducoes,
      deducoes,
      receita_operacional_liquida,
      custo_de_material_digital,
      custo_da_mercadoria_vendida,
      fopag_direto_clt_pj,
      eventos_seb,
      certificacoes,
      custos_com_alimentacao,
      materiais_pedagogicos,
      total_custo_direto,
      margem_de_contribuicao,
      folha_de_pagamento,
      beneficios,
      total_folha_de_pagamento,
      cursos_e_treinamentos,
      servicos_de_limpeza_e_seguranca,
      consultoria_e_honorarios,
      despesas_juridicas,
      rpa,
      aluguel_iptu,
      conservacao_predial_e_manutencao_maquinas_e_moveis,
      locacao_de_maquinas_e_equipamentos,
      tecnologia_telefone_internet_licencas_e_servicos_de_informacao,
      energia_eletrica_agua_e_esgoto,
      materiais_de_limpeza,
      materiais_de_escritorio,
      despesas_com_viagens,
      corporativo_bu,
      rateio_corporativo,
      demais_impostos_e_taxas,
      demais_custos_e_despesas,
      total_custos_e_despesas_fixas,
      despesas_com_marketing,
      pcld,
      despesas_bancarias,
      descontos_comerciais,
      despesas_com_sinistro,
      total_despesas_com_vendas,
      ebitda,
      percentual_ebitda,
    } satisfies DreYearResult;
  }

  return {
    input,
    byYear,
    outrasReceitasReajusteNote:
      "V10-F2.2 (2026-07-27): all 22 v10 PnL row-11-dependent lines are now live-formula, " +
      "not just outras_receitas — see reajusteDespesasGrowth.ts module header for the complete " +
      "dependency table and the three formula families. outras_receitas itself: " +
      "basePerLearnerRatio × Reajuste Despesas growth factor × numero_de_alunos; v10 formula " +
      "E235 = ($AA235/$AA$223)*(1+E$11)*E$223 (dreScenarioAdapters.ts DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER).",
    descontosMetodoFormulaNote:
      "descontos_metodo_de_assinatura computed as −desconto_metodo × receitas_com_ensino_regular. " +
      "Formula base confirmed from PnL workbook: C230 = −C$13 × C225, where C225 = receitas_com_ensino_regular " +
      "(Phase 12I/12K, dreRevenueDriverSourceData.ts). Rate back-derived as Z13 = −Y230/Y225. " +
      "Formula closure complete — provenance remains open (Finance signed xlsx not yet received, F02 resolved as engineering item).",
  };
}
