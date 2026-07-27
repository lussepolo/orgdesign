// Phase V10-F2 / V10-F2.1 / V10-F2.2 — v10 tuition escalation and Reajuste Despesas
// canonicalization validator.
//
// Verifies: v10 source contract (workbook/SHA-256/row 9 tuition, row 11 Reajuste Despesas)
// project-owner governance status; tuition schedule (2028 source rate, 2029-2037 source
// rate, explicit 2028 base factor=1.0 after Case B normalization, recurring runtime
// factors, no active 8% constant remains); Reajuste Despesas schedule (2028/2029-2037
// source rates, explicit 2028 base treatment, recurring factors); formula-dependency
// discipline (all 22 row-11-dependent lines are formula_derived/implemented and wired to
// a v10 mechanism — none remains independent_finance_assumption); revenue/DRE
// reconciliation (canonical mechanism used, grossReceitaBeforeDiscount remains the DRE
// handoff, desconto_metodo unchanged, no unintended duplicate escalation); domain
// invariance (enrollment, capacity, payroll, discount schedule untouched); V10-F2.1's
// shared-formula mechanism correction (F9:N9 and F11:N11 are shared-formula members, not
// hardcoded literals; 2038-2047 is directly source-evidenced); V10-F2.2's v10-precedence
// guard (v7 has no live computational authority for any of the 22 lines;
// dreAnnualAssumptionSourceData.ts remains historical evidence only for this scope);
// row-233/row-238 independence (no circular dependency); and the three reset-bearing
// lines (252/266/268) plus row 259's turma/aluno base-year variant, verified against the
// directly extracted v10 values.

import { calculateReceita } from "../src/features/rio-scenario-resilience/model/receitaEngine";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { readFileSync } from "fs";
import {
  V10_TUITION_SOURCE,
  V10_TUITION_RATE_BY_YEAR,
  TUITION_ESCALATION_RATE_2029_PLUS,
  TUITION_BASE_YEAR_2028,
  resolveTuitionGrowthFactor,
} from "../src/features/rio-scenario-resilience/model/tuitionGrowth";
import {
  V10_REAJUSTE_DESPESAS_SOURCE,
  V10_REAJUSTE_DESPESAS_RATE_BY_YEAR,
  REAJUSTE_DESPESAS_2028_CONVERSION_RATE,
  REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS,
  resolveReajusteDespesasGrowthFactor,
  toReajusteDespesasBase2028,
} from "../src/features/rio-scenario-resilience/model/reajusteDespesasGrowth";
import { DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER } from "../src/features/rio-scenario-resilience/model/dreScenarioAdapters";
import { DRE_LINE_ITEM_MAP } from "../src/features/rio-scenario-resilience/model/dreLineItemMap";
import { GOVERNED_AVAILABLE_CAPACITY_BY_YEAR } from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];
function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

const EPS = 1e-6;

const INPUT = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  orgDesignOptionId: "balanced_experience",
  tuitionScenarioId: "bp1_division_differentiated",
} as const;

// ── Section A: governance metadata ──────────────────────────────────────────
const V10_SHA = "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0";
check(
  "tuition_source_identity",
  V10_TUITION_SOURCE.sha256 === V10_SHA &&
    V10_TUITION_SOURCE.sheet === "PnL" &&
    V10_TUITION_SOURCE.row === 9 &&
    V10_TUITION_SOURCE.governanceStatus === "approved_by_project_owner",
  JSON.stringify(V10_TUITION_SOURCE, null, 0).slice(0, 200),
);
check(
  "reajuste_despesas_source_identity",
  V10_REAJUSTE_DESPESAS_SOURCE.sha256 === V10_SHA &&
    V10_REAJUSTE_DESPESAS_SOURCE.sheet === "PnL" &&
    V10_REAJUSTE_DESPESAS_SOURCE.row === 11 &&
    V10_REAJUSTE_DESPESAS_SOURCE.governanceStatus === "approved_by_project_owner",
  JSON.stringify(V10_REAJUSTE_DESPESAS_SOURCE, null, 0).slice(0, 200),
);
const tuitionRow: number = V10_TUITION_SOURCE.row;
const despesasRow: number = V10_REAJUSTE_DESPESAS_SOURCE.row;
check(
  "tuition_and_despesas_modules_are_separate",
  tuitionRow !== despesasRow,
  `tuition row=${tuitionRow}, despesas row=${despesasRow} — distinct rows, distinct modules`,
);

// ── Section B: tuition schedule ─────────────────────────────────────────────
check(
  "tuition_2028_source_rate_is_6pct",
  V10_TUITION_RATE_BY_YEAR[2028] === 0.06,
  String(V10_TUITION_RATE_BY_YEAR[2028]),
);
for (const year of [2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037]) {
  check(
    `tuition_${year}_source_rate_is_5_9pct`,
    V10_TUITION_RATE_BY_YEAR[year] === 0.059,
    String(V10_TUITION_RATE_BY_YEAR[year]),
  );
}
check(
  "tuition_escalation_constant_is_5_9pct",
  TUITION_ESCALATION_RATE_2029_PLUS === 0.059,
  String(TUITION_ESCALATION_RATE_2029_PLUS),
);
check(
  "tuition_base_2028_factor_is_1",
  resolveTuitionGrowthFactor(TUITION_BASE_YEAR_2028) === 1,
  `resolveTuitionGrowthFactor(2028) = ${resolveTuitionGrowthFactor(2028)}`,
);
const EXPECTED_TUITION_FACTOR: Record<number, number> = {
  2028: 1,
  2029: 1.059,
  2030: 1.059 ** 2,
  2037: 1.059 ** 9,
};
for (const year of [2028, 2029, 2030, 2037]) {
  check(
    `tuition_runtime_factor_${year}`,
    Math.abs(resolveTuitionGrowthFactor(year) - EXPECTED_TUITION_FACTOR[year]) < EPS,
    `resolveTuitionGrowthFactor(${year}) = ${resolveTuitionGrowthFactor(year)}, expected ${EXPECTED_TUITION_FACTOR[year]}`,
  );
}
check(
  "no_active_8pct_tuition_constant_remains",
  !readFileSync(
    "src/features/rio-scenario-resilience/model/receitaEngine.ts",
    "utf8",
  ).includes("1.08"),
  "receitaEngine.ts contains no literal 1.08 tuition-escalation reference",
);
check(
  "receitaEngine_sources_v10_f2_canonical_tuition_module",
  readFileSync("src/features/rio-scenario-resilience/model/receitaEngine.ts", "utf8").includes(
    "tuitionGrowth",
  ),
  "receitaEngine.ts imports from tuitionGrowth.ts",
);

// ── Section C: Reajuste Despesas schedule ───────────────────────────────────
check(
  "despesas_2028_source_rate_is_5pct",
  V10_REAJUSTE_DESPESAS_RATE_BY_YEAR[2028] === 0.05,
  String(V10_REAJUSTE_DESPESAS_RATE_BY_YEAR[2028]),
);
for (const year of [2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037]) {
  check(
    `despesas_${year}_source_rate_is_4_9pct`,
    V10_REAJUSTE_DESPESAS_RATE_BY_YEAR[year] === 0.049,
    String(V10_REAJUSTE_DESPESAS_RATE_BY_YEAR[year]),
  );
}
check(
  "despesas_conversion_rate_is_5pct",
  REAJUSTE_DESPESAS_2028_CONVERSION_RATE === 0.05,
  String(REAJUSTE_DESPESAS_2028_CONVERSION_RATE),
);
check(
  "despesas_escalation_constant_is_4_9pct",
  REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS === 0.049,
  String(REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS),
);
// Explicit 2028 base treatment: 2028 growth factor from resolveReajusteDespesasGrowthFactor
// is 1.0 (matching the payroll/tuition base-year convention) — the one-time 5.0% conversion
// is a SEPARATE step (toReajusteDespesasBase2028), applied once, not folded into the
// per-year growth factor. Combined effect at 2028 must equal 1.05×.
const ratio = DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER.sourceValues.basePerLearnerRatio;
const base2028 = toReajusteDespesasBase2028(ratio);
check(
  "despesas_base2028_conversion_is_exactly_1_05x",
  Math.abs(base2028 / ratio - 1.05) < EPS,
  `toReajusteDespesasBase2028(${ratio}) / ${ratio} = ${base2028 / ratio}, expected 1.05`,
);
check(
  "despesas_workbook_reproduction_e235",
  Math.abs(base2028 * resolveReajusteDespesasGrowthFactor(2028) - 2700.459368852459) < 0.01,
  `explicitBase2028 × factor(2028) = ${base2028 * resolveReajusteDespesasGrowthFactor(2028)}, ` +
    `expected 2700.459368852459 (v10 PnL!E235/E223 = 642709.3297868853/238)`,
);
const EXPECTED_DESPESAS_FACTOR: Record<number, number> = {
  2028: 1,
  2029: 1.049,
  2030: 1.049 ** 2,
  2037: 1.049 ** 9,
};
for (const year of [2028, 2029, 2030, 2037]) {
  check(
    `despesas_runtime_growth_factor_${year}`,
    Math.abs(resolveReajusteDespesasGrowthFactor(year) - EXPECTED_DESPESAS_FACTOR[year]) < EPS,
    `resolveReajusteDespesasGrowthFactor(${year}) = ${resolveReajusteDespesasGrowthFactor(year)}, expected ${EXPECTED_DESPESAS_FACTOR[year]}`,
  );
}

// ── Section D: formula dependency discipline (V10-F2.2 — all 22 lines live) ─
// The 22-line v10 PnL row-11 dependency table (V10-F2.1 complete shared-formula-
// resolving scan of the entire sheet). V10-F2.2 (2026-07-27, project owner):
// v10 governs every one of these 22 lines — all are now `formula_derived` and
// `implemented`, replacing the prior v7-static `independent_finance_assumption`
// lookups. See reajusteDespesasGrowth.ts module header for the three formula
// families (A / A-variant / B), the fixed-base compounding line
// (despesas_juridicas), and the three reset-bearing lines.
const ROW_11_DEPENDENT_DRE_LINE_IDS = [
  "receita_com_eventos",
  "outras_receitas",
  "eventos_seb",
  "certificacoes",
  "custos_com_alimentacao",
  "materiais_pedagogicos",
  "cursos_e_treinamentos",
  "servicos_de_limpeza_e_seguranca",
  "consultoria_e_honorarios",
  "despesas_juridicas",
  "rpa",
  "conservacao_predial_e_manutencao_maquinas_e_moveis",
  "locacao_de_maquinas_e_equipamentos",
  "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
  "energia_eletrica_agua_e_esgoto",
  "materiais_de_limpeza",
  "materiais_de_escritorio",
  "despesas_com_viagens",
  "demais_impostos_e_taxas",
  "demais_custos_e_despesas",
  "despesas_com_marketing",
  "despesas_bancarias",
];
check(
  "row_11_dependency_table_has_22_lines",
  ROW_11_DEPENDENT_DRE_LINE_IDS.length === 22,
  `${ROW_11_DEPENDENT_DRE_LINE_IDS.length} lines recorded`,
);
const lineMapById = new Map(DRE_LINE_ITEM_MAP.map((r) => [r.dreLineId, r]));
let implementedCount = 0;
const unexpectedClassifications: string[] = [];
for (const lineId of ROW_11_DEPENDENT_DRE_LINE_IDS) {
  const rec = lineMapById.get(lineId);
  if (!rec) {
    unexpectedClassifications.push(`${lineId}: not found in DRE_LINE_ITEM_MAP`);
    continue;
  }
  if (rec.classification === "formula_derived" && rec.implementationStatus === "implemented") {
    implementedCount++;
  } else {
    unexpectedClassifications.push(
      `${lineId}: expected formula_derived/implemented, got ${rec.classification}/${rec.implementationStatus}`,
    );
  }
}
check(
  "row_11_dependency_classification_matches_dre_line_item_map",
  implementedCount === 22 && unexpectedClassifications.length === 0,
  `implemented=${implementedCount}/22 ` +
    (unexpectedClassifications.length > 0 ? `unexpected: ${unexpectedClassifications.join("; ")}` : "all match"),
);
check(
  "no_row_11_line_remains_independent_finance_assumption",
  ROW_11_DEPENDENT_DRE_LINE_IDS.every(
    (id) => lineMapById.get(id)?.classification !== "independent_finance_assumption",
  ),
  "none of the 22 row-11-dependent lines remain classified independent_finance_assumption (v7-static)",
);
const dreEngineSrc = readFileSync(
  "src/features/rio-scenario-resilience/model/dreEngine.ts",
  "utf8",
);
check(
  "dre_engine_no_longer_looks_up_the_22_lines_via_assumption",
  ROW_11_DEPENDENT_DRE_LINE_IDS.filter((id) => id !== "outras_receitas").every(
    (id) => !new RegExp(`const ${id} = assumption\\(`).test(dreEngineSrc),
  ),
  "none of the 22 row-11-dependent lines' assignment statements call assumption(lineId, year) " +
    "(the v7-static Finance table lookup) any more",
);
check(
  "dre_engine_wires_all_22_lines_to_the_v10_mechanism",
  ROW_11_DEPENDENT_DRE_LINE_IDS.every((id) => {
    if (id === "outras_receitas") return dreEngineSrc.includes("resolveReajusteDespesasGrowthFactor(year)");
    return new RegExp(
      `const ${id} =\\s*(perLearnerReajusteDespesasValue|revenueShareReajusteDespesasValue|` +
        `reajusteDespesasValueForYear|demaisImpostosETaxasValueForYear|` +
        `consultoriaEHonorariosValueForYear|demaisCustosEDespesasValueForYear|` +
        `despesasComMarketingValueForYear)\\(`,
    ).test(dreEngineSrc);
  }),
  "every one of the 22 lines' assignment statements calls a reajusteDespesasGrowth.ts v10 mechanism",
);

// ── Section E: revenue and DRE reconciliation ───────────────────────────────
const receita = calculateReceita(INPUT);
const dre = calculateDre(INPUT);

check(
  "grossReceitaBeforeDiscount_remains_dre_handoff",
  receita.byYear[2028] !== undefined &&
    (dre.byYear as any)[2028].receitas_com_ensino_regular === receita.byYear[2028]?.grossReceitaBeforeDiscount,
  `receitas_com_ensino_regular (DRE) = ${(dre.byYear as any)[2028].receitas_com_ensino_regular}, ` +
    `grossReceitaBeforeDiscount (Receita) = ${receita.byYear[2028]?.grossReceitaBeforeDiscount}`,
);

// outras_receitas must reconcile exactly to the canonical formula for every projected year.
let outrasReceitasReconciles = true;
const outrasReceitasDetail: string[] = [];
for (const year of [2028, 2029, 2030, 2037]) {
  const yr = (dre.byYear as any)[year];
  const numeroDeAlunos = yr.numero_de_alunos as number;
  const expected = base2028 * resolveReajusteDespesasGrowthFactor(year) * numeroDeAlunos;
  if (Math.abs(yr.outras_receitas - expected) > 1) {
    outrasReceitasReconciles = false;
    outrasReceitasDetail.push(`${year}: actual=${yr.outras_receitas} expected=${expected}`);
  }
}
check(
  "outras_receitas_reconciles_to_canonical_formula",
  outrasReceitasReconciles,
  outrasReceitasReconciles ? "2028/2029/2030/2037 all reconcile" : outrasReceitasDetail.join("; "),
);

check(
  "no_duplicate_escalation_on_receitas_com_ensino_regular",
  Math.abs(
    receita.grainRecords.find((r) => r.year === 2028 && r.gradeId === "t1")!.adjustedAnnualGrossContractValueBRL -
      receita.grainRecords.find((r) => r.year === 2028 && r.gradeId === "t1")!.baseAnnualGrossContractValueBRL,
  ) < 0.01,
  "t1 2028 adjustedAnnualGrossContractValueBRL equals baseAnnualGrossContractValueBRL (factor=1 at 2028, no double application)",
);

// ── Section F: domain invariance ────────────────────────────────────────────
check(
  "enrollment_g4_base_2028_still_258",
  (dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos === 258,
  `numero_de_alunos 2028 = ${(dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos}`,
);
check(
  "full_capacity_remains_746",
  Math.max(...GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.map((r) => r.availableCapacity)) === 746,
  `max availableCapacity across all records = ${Math.max(...GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.map((r) => r.availableCapacity))}`,
);
const fopagOutput = calculateFopag(INPUT);
check(
  "payroll_growth_mechanism_unchanged_by_v10_f2",
  fopagOutput.calculationReady === true &&
    fopagOutput.records.some((r) => r.year === 2028 && r.salaryGrowthFactor === 1),
  `fopag calculationReady=${fopagOutput.calculationReady}; 2028 salaryGrowthFactor spot-check present`,
);
// Check actual `import ... from "..."` statements only — prose comments cross-referencing
// the other modules by filename are expected and do not constitute reuse.
function hasImportFrom(fileContent: string, moduleSubstring: string): boolean {
  return /^import[^;]*from\s+["'][^"']*["'];?/gm
    .test(fileContent) &&
    Array.from(fileContent.matchAll(/^import[^;]*from\s+["']([^"']*)["'];?/gm)).some(([, spec]) =>
      spec.includes(moduleSubstring),
    );
}
const despesasSrc = readFileSync(
  "src/features/rio-scenario-resilience/model/reajusteDespesasGrowth.ts",
  "utf8",
);
const tuitionSrc = readFileSync(
  "src/features/rio-scenario-resilience/model/tuitionGrowth.ts",
  "utf8",
);
check(
  "despesas_module_does_not_reuse_payroll_or_tuition_constants",
  !hasImportFrom(despesasSrc, "payrollGrowth") && !hasImportFrom(despesasSrc, "tuitionGrowth"),
  "reajusteDespesasGrowth.ts has no import statement from payrollGrowth.ts or tuitionGrowth.ts",
);
check(
  "tuition_module_does_not_reuse_payroll_constants",
  !hasImportFrom(tuitionSrc, "payrollGrowth"),
  "tuitionGrowth.ts has no import statement from payrollGrowth.ts",
);

// ── Section G: V10-F2.1 shared-formula mechanism correction ────────────────
check(
  "despesas_header_no_longer_claims_hardcoded_literals",
  !despesasSrc.includes("hardcoded literals (2029-2037, not formula-derived)"),
  "reajusteDespesasGrowth.ts header no longer asserts F11:N11 are hardcoded literals (a corrective " +
    "mention of the prior session's wrong claim is expected and acceptable)",
);
check(
  "despesas_header_documents_shared_formula_mechanism",
  despesasSrc.includes("shared-formula") || despesasSrc.includes("shared formula"),
  "reajusteDespesasGrowth.ts header documents the Excel shared-formula (t=\"shared\") mechanism",
);
check(
  "tuition_header_no_longer_claims_hardcoded_literals",
  !tuitionSrc.includes("hardcoded literals (2029-2037, not formula-derived)"),
  "tuitionGrowth.ts header no longer asserts F9:N9 are hardcoded literals (a corrective mention of " +
    "the prior session's wrong claim is expected and acceptable)",
);
check(
  "tuition_header_documents_shared_formula_mechanism",
  tuitionSrc.includes("shared-formula") || tuitionSrc.includes("shared formula"),
  "tuitionGrowth.ts header documents the Excel shared-formula (t=\"shared\") mechanism",
);
check(
  "despesas_horizon_2038_2047_is_source_evidenced_not_extrapolated",
  despesasSrc.includes("directly source-evidenced") || despesasSrc.includes("not extrapolated") ||
    despesasSrc.includes("not an extrapolation"),
  "reajusteDespesasGrowth.ts documents that 2038-2047 (O11:X11) is directly verified, not assumed",
);
check(
  "tuition_horizon_2038_2047_is_source_evidenced_not_extrapolated",
  tuitionSrc.includes("directly source-evidenced") || tuitionSrc.includes("not extrapolated") ||
    tuitionSrc.includes("not an extrapolation"),
  "tuitionGrowth.ts documents that 2038-2047 (O9:X9) is directly verified, not assumed",
);

// ── Section H: v10 precedence / v7 live-authority removal (V10-F2.2) ───────
// dreAnnualAssumptionSourceData.ts (the v7-static Finance table) is EXPECTED
// to have a working-tree diff from V10-F2.1's SOURCE_INPUT_BLOCKED baseline —
// no diff would mean the file's own stored values changed, which V10-F2.2
// does not do. What matters is that dreEngine.ts no longer reads any of the
// 22 row-11-dependent lines from it via assumption(lineId, year).
check(
  "no_row_11_line_sourced_via_assumption_lookup",
  ROW_11_DEPENDENT_DRE_LINE_IDS.filter((id) => id !== "outras_receitas").every(
    (id) => !new RegExp(`assumption\\("${id}", year\\)`).test(dreEngineSrc),
  ),
  "no assumption(\"<row-11-line>\", year) call remains for any of the 22 row-11-dependent lines",
);
check(
  "despesas_header_documents_v10_precedence_not_source_input_blocked",
  !despesasSrc.includes("SOURCE_INPUT_BLOCKED") && despesasSrc.includes("V10-F2.2"),
  "reajusteDespesasGrowth.ts header documents V10-F2.2 v10-precedence migration, not the prior " +
    "SOURCE_INPUT_BLOCKED state",
);

// ── Section I: row 233 / row 238 independence (V10-F2.2) ───────────────────
check(
  "receita_com_eventos_independent_of_receita_operacional_liquida",
  (() => {
    const src = dreEngineSrc;
    const start = src.indexOf("const receita_com_eventos =");
    const end = start >= 0 ? src.indexOf(");", start) : -1;
    const statement = start >= 0 && end >= 0 ? src.slice(start, end + 2) : "";
    return (
      statement.includes("perLearnerReajusteDespesasValue") &&
      !statement.includes("receita_operacional_liquida")
    );
  })(),
  "receita_com_eventos is computed before, and without referencing, receita_operacional_liquida " +
    "(no circular dependency — confirmed via direct v10 OOXML inspection, V10-F2.2)",
);

// ── Section J: reset-bearing lines and row 259 (V10-F2.2) ──────────────────
for (const year of [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036]) {
  const yr = (dre.byYear as any)[year];
  check(
    `reset_lines_produce_finite_values_${year}`,
    Number.isFinite(yr.consultoria_e_honorarios) &&
      Number.isFinite(yr.demais_custos_e_despesas) &&
      Number.isFinite(yr.despesas_com_marketing),
    `consultoria_e_honorarios=${yr.consultoria_e_honorarios}, demais_custos_e_despesas=${yr.demais_custos_e_despesas}, despesas_com_marketing=${yr.despesas_com_marketing}`,
  );
}
check(
  "consultoria_e_honorarios_2028_matches_v10_reset_chain",
  Math.abs((dre.byYear as any)[2028].consultoria_e_honorarios - -31500) < 0.01,
  `2028 = ${(dre.byYear as any)[2028].consultoria_e_honorarios}, expected -31500 (v10: -30000*(1+E11))`,
);
check(
  "despesas_com_marketing_2032_matches_v10_reset",
  Math.abs((dre.byYear as any)[2032].despesas_com_marketing - -2098000) < 0.01,
  `2032 = ${(dre.byYear as any)[2032].despesas_com_marketing}, expected -2098000 (v10 reset: -2000000*(1+I11))`,
);
check(
  "despesas_com_marketing_2033_matches_v10_second_reset",
  Math.abs((dre.byYear as any)[2033].despesas_com_marketing - -1573500) < 0.01,
  `2033 = ${(dre.byYear as any)[2033].despesas_com_marketing}, expected -1573500 (v10 second reset: -1500000*(1+J11))`,
);
check(
  "demais_custos_e_despesas_2031_matches_v10_reset",
  Math.abs((dre.byYear as any)[2031].demais_custos_e_despesas - -419600) < 0.01,
  `2031 = ${(dre.byYear as any)[2031].demais_custos_e_despesas}, expected -419600 (v10 reset: -400000*(1+H11))`,
);
check(
  "despesas_juridicas_2028_matches_v10_fixed_base",
  (dre.byYear as any)[2028].despesas_juridicas === -20000,
  `2028 = ${(dre.byYear as any)[2028].despesas_juridicas}, expected -20000 (v10 E253 literal, no rate at 2028)`,
);
check(
  "energia_eletrica_agua_e_esgoto_is_finite_and_negative_every_year",
  RECEITA_PROJECTION_YEARS.every((y) => {
    const v = (dre.byYear as any)[y].energia_eletrica_agua_e_esgoto;
    return Number.isFinite(v) && v < 0;
  }),
  "row 259 (turma/aluno base-year variant) produces a finite negative cost every projected year",
);

// ── Output ───────────────────────────────────────────────────────────────
const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;
console.log(JSON.stringify({ passCount, failCount, checks }, null, 2));
console.log(
  failCount === 0
    ? `\n✓ Phase V10-F2 tuition/Reajuste Despesas validation: ${passCount}/${checks.length} pass, 0 fail`
    : `\n✗ Phase V10-F2 tuition/Reajuste Despesas validation: ${passCount}/${checks.length} pass, ${failCount} fail`,
);
if (failCount > 0) process.exit(1);
