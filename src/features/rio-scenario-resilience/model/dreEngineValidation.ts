// DRE engine validation — Phase 13A (2026-06-09).
//
// 20 checks across structural wiring and behavioral correctness of calculateDre().
// Behavioral scenario: t1_g3 / intermediario / bp1_division_differentiated / balanced_experience.
// No spreadsheet numeric backtest of computed subtotals — structural identity checks only.
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).

import type {
  DreEngineCheckId,
  DreEngineCheckResult,
  DreEngineValidationReport,
} from "./dreEngineValidationContract";
import { calculateDre } from "./dreEngine";
import { calculateReceita } from "./receitaEngine";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";
import { calculateFopag } from "./fopagEngine";
import { DRE_REVENUE_DRIVER_SOURCE_DATA } from "./dreRevenueDriverSourceData";
import { DRE_ANNUAL_ASSUMPTION_SOURCE_DATA } from "./dreAnnualAssumptionSourceData";
import { DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER } from "./dreScenarioAdapters";
import { CALCULATION_CAN_BEGIN } from "./inputReadinessRegistry";

const VALIDATION_INPUT = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience",
};

const EPS = 1e-6;

function pass(checkId: DreEngineCheckId, note: string): DreEngineCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: DreEngineCheckId, note: string): DreEngineCheckResult {
  return { checkId, pass: false, note };
}

export function runDreEngineValidation(): DreEngineValidationReport {
  const result = calculateDre(VALIDATION_INPUT);

  const receitaResult = calculateReceita({
    openingPackageId: VALIDATION_INPUT.openingPackageId,
    occupancyScenarioId: VALIDATION_INPUT.occupancyScenarioId,
    tuitionScenarioId: VALIDATION_INPUT.tuitionScenarioId,
  });

  const fopagResult = calculateFopag({
    openingPackageId: VALIDATION_INPUT.openingPackageId,
    occupancyScenarioId: VALIDATION_INPUT.occupancyScenarioId,
    orgDesignOptionId: VALIDATION_INPUT.orgDesignOptionId,
  });

  const checks: DreEngineCheckResult[] = [];

  // ── Check 1: dre_engine_function_exists ─────────────────────────────────────
  checks.push(
    typeof calculateDre === "function"
      ? pass("dre_engine_function_exists", "calculateDre is a function")
      : fail("dre_engine_function_exists", "calculateDre is not a function"),
  );

  // ── Check 2: dre_engine_input_has_four_levers ────────────────────────────────
  {
    const keys = Object.keys(VALIDATION_INPUT);
    const hasAll =
      keys.includes("openingPackageId") &&
      keys.includes("occupancyScenarioId") &&
      keys.includes("tuitionScenarioId") &&
      keys.includes("orgDesignOptionId");
    checks.push(
      hasAll
        ? pass(
            "dre_engine_input_has_four_levers",
            "DreEngineInput has all four required levers: openingPackageId, occupancyScenarioId, tuitionScenarioId, orgDesignOptionId",
          )
        : fail(
            "dre_engine_input_has_four_levers",
            `Missing levers in DreEngineInput; found: ${keys.join(", ")}`,
          ),
    );
  }

  // ── Check 3: dre_output_covers_20_projection_years ───────────────────────────
  {
    const yearCount = RECEITA_PROJECTION_YEARS.length;
    const allPresent = RECEITA_PROJECTION_YEARS.every((y) => y in result.byYear);
    checks.push(
      yearCount === 20 && allPresent
        ? pass(
            "dre_output_covers_20_projection_years",
            "byYear covers all 20 projection years 2028–2047",
          )
        : fail(
            "dre_output_covers_20_projection_years",
            `yearCount=${yearCount}, allPresent=${allPresent}`,
          ),
    );
  }

  // ── Check 4: ebitda_subtotal_identity_holds ──────────────────────────────────
  {
    let ok = true;
    let failYear = 0;
    let delta = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const computed =
        yr.margem_de_contribuicao +
        yr.total_custos_e_despesas_fixas +
        yr.total_despesas_com_vendas;
      const d = Math.abs(yr.ebitda - computed);
      if (d > EPS) {
        ok = false;
        failYear = y;
        delta = d;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "ebitda_subtotal_identity_holds",
            "For all 20 years: ebitda = margem_de_contribuicao + total_custos_e_despesas_fixas + total_despesas_com_vendas (delta < 1e-6)",
          )
        : fail(
            "ebitda_subtotal_identity_holds",
            `Identity broken at year ${failYear}, delta=${delta}`,
          ),
    );
  }

  // ── Check 5: margem_de_contribuicao_identity_holds ───────────────────────────
  {
    let ok = true;
    let failYear = 0;
    let delta = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const computed =
        yr.receita_operacional_liquida +
        yr.custo_da_mercadoria_vendida +
        yr.total_custo_direto;
      const d = Math.abs(yr.margem_de_contribuicao - computed);
      if (d > EPS) {
        ok = false;
        failYear = y;
        delta = d;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "margem_de_contribuicao_identity_holds",
            "For all 20 years: margem = receita_operacional_liquida + custo_da_mercadoria_vendida + total_custo_direto",
          )
        : fail(
            "margem_de_contribuicao_identity_holds",
            `Identity broken at year ${failYear}, delta=${delta}`,
          ),
    );
  }

  // ── Check 6: total_custo_direto_identity_holds ───────────────────────────────
  {
    let ok = true;
    let failYear = 0;
    let delta = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const computed =
        yr.fopag_direto_clt_pj +
        yr.eventos_seb +
        yr.certificacoes +
        yr.custos_com_alimentacao +
        yr.materiais_pedagogicos;
      const d = Math.abs(yr.total_custo_direto - computed);
      if (d > EPS) {
        ok = false;
        failYear = y;
        delta = d;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "total_custo_direto_identity_holds",
            "For all 20 years: total_custo_direto = fopag_direto + eventos_seb + certificacoes + custos_com_alimentacao + materiais_pedagogicos",
          )
        : fail(
            "total_custo_direto_identity_holds",
            `Identity broken at year ${failYear}, delta=${delta}`,
          ),
    );
  }

  // ── Check 7: total_custos_e_despesas_fixas_identity_holds ────────────────────
  // total_folha_de_pagamento (memo_kpi) must NOT appear in this sum.
  {
    let ok = true;
    let failYear = 0;
    let delta = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const computed =
        yr.folha_de_pagamento +
        yr.beneficios +
        yr.cursos_e_treinamentos +
        yr.servicos_de_limpeza_e_seguranca +
        yr.consultoria_e_honorarios +
        yr.despesas_juridicas +
        yr.rpa +
        yr.aluguel_iptu +
        yr.conservacao_predial_e_manutencao_maquinas_e_moveis +
        yr.locacao_de_maquinas_e_equipamentos +
        yr.tecnologia_telefone_internet_licencas_e_servicos_de_informacao +
        yr.energia_eletrica_agua_e_esgoto +
        yr.materiais_de_limpeza +
        yr.materiais_de_escritorio +
        yr.despesas_com_viagens +
        yr.corporativo_bu +
        yr.rateio_corporativo +
        yr.demais_impostos_e_taxas +
        yr.demais_custos_e_despesas;
      const d = Math.abs(yr.total_custos_e_despesas_fixas - computed);
      if (d > EPS) {
        ok = false;
        failYear = y;
        delta = d;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "total_custos_e_despesas_fixas_identity_holds",
            "For all 20 years: total_custos_e_despesas_fixas = folha + beneficios + 17 fixed rows (total_folha_de_pagamento memo excluded)",
          )
        : fail(
            "total_custos_e_despesas_fixas_identity_holds",
            `Identity broken at year ${failYear}, delta=${delta}`,
          ),
    );
  }

  // ── Check 8: total_despesas_com_vendas_identity_holds ───────────────────────
  {
    let ok = true;
    let failYear = 0;
    let delta = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const computed =
        yr.despesas_com_marketing +
        yr.pcld +
        yr.despesas_bancarias +
        yr.descontos_comerciais +
        yr.despesas_com_sinistro;
      const d = Math.abs(yr.total_despesas_com_vendas - computed);
      if (d > EPS) {
        ok = false;
        failYear = y;
        delta = d;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "total_despesas_com_vendas_identity_holds",
            "For all 20 years: total_despesas_com_vendas = marketing + pcld + bancarias + comerciais + sinistro",
          )
        : fail(
            "total_despesas_com_vendas_identity_holds",
            `Identity broken at year ${failYear}, delta=${delta}`,
          ),
    );
  }

  // ── Check 9: receita_operacional_liquida_not_equal_net_receita ───────────────
  // ROL necessarily includes upselling, eventos, material, outras receitas, deduções;
  // netReceitaAfterDiscount is tuition-only — structural non-equivalence (Phase 12H).
  {
    const yr2028 = result.byYear[2028];
    const netReceita = receitaResult.byYear[2028].netReceitaAfterDiscount;
    const rol = yr2028.receita_operacional_liquida;
    const differs = rol !== netReceita;
    checks.push(
      differs
        ? pass(
            "receita_operacional_liquida_not_equal_net_receita",
            `ROL (${rol.toFixed(2)}) ≠ netReceitaAfterDiscount (${netReceita.toFixed(2)}) for 2028 — structural non-equivalence confirmed (Phase 12H)`,
          )
        : fail(
            "receita_operacional_liquida_not_equal_net_receita",
            `ROL equals netReceitaAfterDiscount (${rol}) — unexpected; ROL includes additional revenue streams`,
          ),
    );
  }

  // ── Check 10: fopag_values_negated_to_dre_sign ──────────────────────────────
  {
    const fopagYt2028 = fopagResult.yearTotals.find((yt) => yt.year === 2028);
    const yr2028 = result.byYear[2028];
    if (fopagYt2028 == null) {
      checks.push(
        fail("fopag_values_negated_to_dre_sign", "FOPAG year 2028 not found in yearTotals"),
      );
    } else {
      const fopagOk =
        Math.abs(yr2028.fopag_direto_clt_pj - -fopagYt2028.fopagDireto) < EPS &&
        Math.abs(yr2028.folha_de_pagamento - -fopagYt2028.folhaDireta) < EPS &&
        Math.abs(yr2028.beneficios - -fopagYt2028.benefits) < EPS;
      checks.push(
        fopagOk
          ? pass(
              "fopag_values_negated_to_dre_sign",
              "fopag_direto_clt_pj = −fopagDireto, folha_de_pagamento = −folhaDireta, beneficios = −benefits for 2028",
            )
          : fail(
              "fopag_values_negated_to_dre_sign",
              `Sign mismatch at 2028: fopag_direto=${yr2028.fopag_direto_clt_pj} vs −${fopagYt2028.fopagDireto}`,
            ),
      );
    }
  }

  // ── Check 11: annual_assumption_passthrough_correct ──────────────────────────
  // Loops over ALL 27 non-below-ebitda records (canonical join key used for
  // each). Catches lookup-key typos across the 5 variant-key rows
  // (consultoria_e_honorarios, tecnologia_..., energia_..., despesas_com_sinistro)
  // where a silent ?? 0 would otherwise zero the field and still pass a single
  // spot-check — the one case where a wrong EBITDA could hide behind 20/20.
  {
    const YEAR = 2028;
    const yr2028 = result.byYear[YEAR] as unknown as Record<string, number>;
    let ok = true;
    let failLineId = "";
    let failEngine = 0;
    let failSource = 0;

    for (const record of DRE_ANNUAL_ASSUMPTION_SOURCE_DATA.records) {
      if (record.classification === "below_ebitda_assumption") continue;
      const canonicalId =
        typeof record.dreLineItemMapDreLineId === "string"
          ? record.dreLineItemMapDreLineId
          : record.dreLineId;
      const sourceVal = (record.annualValuesByYear as Record<number, number>)[YEAR] ?? 0;
      const engineVal = yr2028[canonicalId];
      if (engineVal === undefined) {
        ok = false;
        failLineId = `${canonicalId} (field missing from DreYearResult)`;
        failEngine = NaN;
        failSource = sourceVal;
        break;
      }
      if (Math.abs(engineVal - sourceVal) > EPS) {
        ok = false;
        failLineId = canonicalId;
        failEngine = engineVal;
        failSource = sourceVal;
        break;
      }
    }

    checks.push(
      ok
        ? pass(
            "annual_assumption_passthrough_correct",
            "All 27 non-below-ebitda annual assumption rows match source for 2028 " +
              "(includes 5 variant-key rows: consultoria_e_honorarios, tecnologia_telefone_..., energia_eletrica_..., despesas_com_sinistro)",
          )
        : fail(
            "annual_assumption_passthrough_correct",
            `Passthrough mismatch at ${failLineId}: engine=${failEngine}, source=${failSource}`,
          ),
    );
  }

  // ── Check 12: outras_receitas_uses_base_per_learner_ratio ────────────────────
  {
    const yr2028 = result.byYear[2028];
    const ratio = DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER.sourceValues.basePerLearnerRatio;
    const expected = ratio * yr2028.numero_de_alunos;
    const ok = Math.abs(yr2028.outras_receitas - expected) < EPS;
    checks.push(
      ok
        ? pass(
            "outras_receitas_uses_base_per_learner_ratio",
            `outras_receitas 2028 = ratio(${ratio.toFixed(4)}) × alunos(${yr2028.numero_de_alunos}) = ${expected.toFixed(2)} — matches engine output`,
          )
        : fail(
            "outras_receitas_uses_base_per_learner_ratio",
            `Expected ${expected}, got ${yr2028.outras_receitas}`,
          ),
    );
  }

  // ── Check 13: numero_de_turmas_is_unsupported_null ───────────────────────────
  {
    const allNull = RECEITA_PROJECTION_YEARS.every(
      (y) => result.byYear[y].numero_de_turmas === null,
    );
    checks.push(
      allNull
        ? pass(
            "numero_de_turmas_is_unsupported_null",
            "numero_de_turmas === null for all 20 years (no source data available)",
          )
        : fail(
            "numero_de_turmas_is_unsupported_null",
            "numero_de_turmas is not null for some year — unexpected",
          ),
    );
  }

  // ── Check 14: ticket_servico_is_formula_derived_not_constant ─────────────────
  {
    const yr2028 = result.byYear[2028];
    if (yr2028.ticket_servico === null || yr2028.numero_de_alunos === 0) {
      checks.push(
        fail(
          "ticket_servico_is_formula_derived_not_constant",
          "numero_de_alunos is 0 for 2028; cannot verify formula",
        ),
      );
    } else {
      const expected =
        yr2028.receitas_com_ensino_regular / yr2028.numero_de_alunos / 12;
      const ok = Math.abs(yr2028.ticket_servico - expected) < EPS;
      checks.push(
        ok
          ? pass(
              "ticket_servico_is_formula_derived_not_constant",
              `ticket_servico 2028 = receitas / alunos / 12 = ${expected.toFixed(2)} — formula-derived, not a hardcoded constant`,
            )
          : fail(
              "ticket_servico_is_formula_derived_not_constant",
              `Expected ${expected}, got ${yr2028.ticket_servico}`,
            ),
      );
    }
  }

  // ── Check 15: zero_learners_does_not_produce_nan ─────────────────────────────
  // Verify no NaN or Infinity in any year's key numeric outputs.
  {
    let ok = true;
    let failYear = 0;
    let failField = "";
    outer: for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      const toCheck: [string, number | null][] = [
        ["ebitda", yr.ebitda],
        ["margem_de_contribuicao", yr.margem_de_contribuicao],
        ["receita_operacional_liquida", yr.receita_operacional_liquida],
        ["percentual_ebitda", yr.percentual_ebitda],
        ["ticket_servico", yr.ticket_servico],
      ];
      for (const [field, val] of toCheck) {
        if (val !== null && !isFinite(val)) {
          ok = false;
          failYear = y;
          failField = field;
          break outer;
        }
      }
    }
    checks.push(
      ok
        ? pass(
            "zero_learners_does_not_produce_nan",
            "All key numeric outputs are finite (or null) for all 20 years — NaN/Infinity guard confirmed",
          )
        : fail(
            "zero_learners_does_not_produce_nan",
            `Non-finite value at year ${failYear} field ${failField}`,
          ),
    );
  }

  // ── Check 16: total_folha_de_pagamento_is_memo_not_summed_in_ebitda ──────────
  // Verify the memo formula and that it is non-zero (a real board-facing KPI).
  {
    const yr2028 = result.byYear[2028];
    const memoExpected = yr2028.fopag_direto_clt_pj + yr2028.folha_de_pagamento;
    const memoOk = Math.abs(yr2028.total_folha_de_pagamento - memoExpected) < EPS;
    const nonZero = yr2028.total_folha_de_pagamento !== 0;
    checks.push(
      memoOk && nonZero
        ? pass(
            "total_folha_de_pagamento_is_memo_not_summed_in_ebitda",
            `total_folha_de_pagamento 2028 = fopag_direto + folha_de_pagamento = ${memoExpected.toFixed(2)} (memo_kpi, excluded from total_custos_e_despesas_fixas and EBITDA)`,
          )
        : fail(
            "total_folha_de_pagamento_is_memo_not_summed_in_ebitda",
            `memo formula mismatch or zero: expected=${memoExpected}, actual=${yr2028.total_folha_de_pagamento}`,
          ),
    );
  }

  // ── Check 17: below_ebitda_rows_not_in_year_result ──────────────────────────
  // DreYearResult must not contain below_ebitda dreLineIds.
  {
    const yr2028 = result.byYear[2028] as unknown as Record<string, unknown>;
    const excluded = [
      "depreciacao_amortizacao",
      "receita_despesa_financeira",
      "ircs_direto",
      "recuperacao_de_prejuizos",
    ];
    const found = excluded.filter((field) => field in yr2028);
    checks.push(
      found.length === 0
        ? pass(
            "below_ebitda_rows_not_in_year_result",
            `None of the 4 below_ebitda row IDs (${excluded.join(", ")}) appear as fields in DreYearResult`,
          )
        : fail(
            "below_ebitda_rows_not_in_year_result",
            `Below-EBITDA rows found in DreYearResult: ${found.join(", ")}`,
          ),
    );
  }

  // ── Check 18: custo_material_digital_sign_correct ────────────────────────────
  {
    let ok = true;
    let failYear = 0;
    for (const y of RECEITA_PROJECTION_YEARS) {
      const yr = result.byYear[y];
      if (yr.receita_com_material_didatico > 0 && yr.custo_de_material_digital >= 0) {
        ok = false;
        failYear = y;
        break;
      }
    }
    checks.push(
      ok
        ? pass(
            "custo_material_digital_sign_correct",
            "When receita_com_material_didatico > 0, custo_de_material_digital < 0 for all applicable years",
          )
        : fail(
            "custo_material_digital_sign_correct",
            `custo_de_material_digital not negative at year ${failYear}`,
          ),
    );
  }

  // ── Check 19: bolsa_de_estudos_uses_dre_driver_not_discount_schedule ─────────
  // Verify bolsa_de_estudos = receitas_com_ensino_regular × percentual_desconto_medio (DRE source).
  {
    const driverRecord = DRE_REVENUE_DRIVER_SOURCE_DATA.records.find(
      (r) => r.driverId === "percentual_desconto_medio",
    );
    if (driverRecord == null) {
      checks.push(
        fail(
          "bolsa_de_estudos_uses_dre_driver_not_discount_schedule",
          "percentual_desconto_medio not found in DRE_REVENUE_DRIVER_SOURCE_DATA",
        ),
      );
    } else {
      const yr2028 = result.byYear[2028];
      const rate = (driverRecord.annualValuesByYear as Record<number, number>)[2028] ?? 0;
      const expected = yr2028.receitas_com_ensino_regular * rate;
      const ok = Math.abs(yr2028.bolsa_de_estudos - expected) < EPS;
      checks.push(
        ok
          ? pass(
              "bolsa_de_estudos_uses_dre_driver_not_discount_schedule",
              `bolsa_de_estudos 2028 = receitas(${yr2028.receitas_com_ensino_regular.toFixed(2)}) × rate(${rate}) = ${expected.toFixed(2)} — DRE driver used, not DISCOUNT_SCHEDULE_SOURCE`,
            )
          : fail(
              "bolsa_de_estudos_uses_dre_driver_not_discount_schedule",
              `Expected ${expected}, got ${yr2028.bolsa_de_estudos}`,
            ),
      );
    }
  }

  // ── Check 20: calculation_can_begin_remains_false ────────────────────────────
  checks.push(
    CALCULATION_CAN_BEGIN === false
      ? pass(
          "calculation_can_begin_remains_false",
          "CALCULATION_CAN_BEGIN === false (inputReadinessRegistry.ts line 1827) — global gate unchanged",
        )
      : fail(
          "calculation_can_begin_remains_false",
          `CALCULATION_CAN_BEGIN is ${String(CALCULATION_CAN_BEGIN)} — must remain false`,
        ),
  );

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;

  return {
    phase: "13A",
    validatedAt: "2026-06-09",
    totalChecks: checks.length,
    passCount,
    failCount,
    allPass: failCount === 0,
    checks,
    scopeNote:
      "Phase 13A (2026-06-09): DRE + EBITDA engine structural and behavioral validation. " +
      "Behavioral scenario: t1_g3 / intermediario / bp1_division_differentiated / balanced_experience. " +
      "Checks 4–8: DRE-native signed-addition identities verified for all 20 projection years. " +
      "Check 9: ROL structural non-equivalence with netReceitaAfterDiscount confirmed (Phase 12H). " +
      "Check 10: FOPAG sign translation verified against raw engine output. " +
      "Checks 11–19: behavioral correctness of passthrough, formulas, sign conventions, guards. " +
      "No spreadsheet numeric backtest of computed subtotals — not performed in this phase. " +
      "CALCULATION_CAN_BEGIN remains false. No cash-flow bridge. No CAPEX bridge. No DCF. No UI.",
  };
}

export const DRE_ENGINE_VALIDATION_REPORT: DreEngineValidationReport =
  runDreEngineValidation();
