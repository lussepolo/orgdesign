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
// Outras Receitas: basePerLearnerRatio × numero_de_alunos.
// reajuste_despesas NOT applied (source status: not_available_pending_finance_source).
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

  const outrasReceitasRatio =
    DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER.sourceValues.basePerLearnerRatio;

  function assumption(lineId: string, year: number): number {
    return assumptionByLineId.get(lineId)?.[year] ?? 0;
  }

  function driverValue(driverId: string, year: number): number {
    return revenueDriverByYear.get(driverId)?.[year] ?? 0;
  }

  const byYear = {} as Record<OpeningPackageProjectionYear, DreYearResult>;

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

    // independent Finance assumption, positive revenue
    const receita_com_eventos = assumption("receita_com_eventos", year);

    const receita_com_material_didatico = numero_de_alunos * ticket_material * 12;

    // reajuste_despesas not applied — see outrasReceitasReajusteNote
    const outras_receitas = outrasReceitasRatio * numero_de_alunos;

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

    // annual Finance assumption values already negative — use directly
    const eventos_seb = assumption("eventos_seb", year);
    const certificacoes = assumption("certificacoes", year);
    const custos_com_alimentacao = assumption("custos_com_alimentacao", year);
    const materiais_pedagogicos = assumption("materiais_pedagogicos", year);

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

    // 17 independent Finance assumption rows — already negative, use directly
    const cursos_e_treinamentos = assumption("cursos_e_treinamentos", year);
    const servicos_de_limpeza_e_seguranca = assumption("servicos_de_limpeza_e_seguranca", year);
    const consultoria_e_honorarios = assumption("consultoria_e_honorarios", year);
    const despesas_juridicas = assumption("despesas_juridicas", year);
    const rpa = assumption("rpa", year);
    const aluguel_iptu = assumption("aluguel_iptu", year);
    const conservacao_predial_e_manutencao_maquinas_e_moveis = assumption(
      "conservacao_predial_e_manutencao_maquinas_e_moveis",
      year,
    );
    const locacao_de_maquinas_e_equipamentos = assumption(
      "locacao_de_maquinas_e_equipamentos",
      year,
    );
    const tecnologia_telefone_internet_licencas_e_servicos_de_informacao = assumption(
      "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
      year,
    );
    const energia_eletrica_agua_e_esgoto = assumption("energia_eletrica_agua_e_esgoto", year);
    const materiais_de_limpeza = assumption("materiais_de_limpeza", year);
    const materiais_de_escritorio = assumption("materiais_de_escritorio", year);
    const despesas_com_viagens = assumption("despesas_com_viagens", year);
    const corporativo_bu = assumption("corporativo_bu", year);
    const rateio_corporativo = assumption("rateio_corporativo", year);
    const demais_impostos_e_taxas = assumption("demais_impostos_e_taxas", year);
    const demais_custos_e_despesas = assumption("demais_custos_e_despesas", year);

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
    const despesas_com_marketing = assumption("despesas_com_marketing", year);
    const pcld = assumption("pcld", year);
    const despesas_bancarias = assumption("despesas_bancarias", year);
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
      "Outras Receitas computed as basePerLearnerRatio × numero_de_alunos only. " +
      "reajuste_despesas (DRIVER_LINE_MAP driverId 'reajuste_despesas') is not applied: " +
      "its annualValuesStatus is 'not_available_pending_finance_source' in dreLineItemMap.ts. " +
      "Full PnL benchmark formula: C233 = ($Y233/$Y$221)*(1+C$9)*C$221; " +
      "the (1+C$9) reajuste term is omitted pending Finance source confirmation.",
    descontosMetodoFormulaNote:
      "descontos_metodo_de_assinatura computed as −desconto_metodo × receitas_com_ensino_regular. " +
      "Formula base confirmed from PnL workbook: C230 = −C$13 × C225, where C225 = receitas_com_ensino_regular " +
      "(Phase 12I/12K, dreRevenueDriverSourceData.ts). Rate back-derived as Z13 = −Y230/Y225. " +
      "Formula closure complete — provenance remains open (Finance signed xlsx not yet received, F02 resolved as engineering item).",
  };
}
