// Phase V10-F1B — V10 average-discount canonicalization validator.
//
// Verifies: canonical v10 average-discount schedule (25/20/20/18/15/15/15/12.5/12.5/12.5,
// terminal 12.5% from 2036), DRE consumption via percentual_desconto_medio, audit-only
// Receita consumption via DISCOUNT_SCHEDULE_SOURCE (both single-sourced, no duplicated
// constants), unchanged desconto_metodo, unchanged Receita-to-DRE gross handoff, unchanged
// enrollment/capacity/payroll formulas, absence of a computational double discount, and
// that netReceitaAfterDiscount remains excluded from the live DRE.
//
// No workbook file access required — this validator checks in-repo source-data and engine
// output, not the external XLSX evidence files (already hash-verified in the audit docs).

import { readFileSync } from "node:fs";
import { calculateReceita } from "../src/features/rio-scenario-resilience/model/receitaEngine";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { DRE_REVENUE_DRIVER_SOURCE_DATA } from "../src/features/rio-scenario-resilience/model/dreRevenueDriverSourceData";
import { DISCOUNT_SCHEDULE_SOURCE } from "../src/features/rio-scenario-resilience/model/discountScheduleSourceData";
import {
  V10_AVERAGE_DISCOUNT_SCHEDULE,
  V10_AVERAGE_DISCOUNT_SOURCE,
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE,
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR,
  v10AverageDiscountRate,
} from "../src/features/rio-scenario-resilience/model/v10AverageDiscountSourceData";
import {
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR,
  getGovernedAvailableCapacity,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];
function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

const YEARS_2028_2037 = [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037] as const;
const APPROVED_SCHEDULE: Record<number, number> = {
  2028: 0.25,
  2029: 0.2,
  2030: 0.2,
  2031: 0.18,
  2032: 0.15,
  2033: 0.15,
  2034: 0.15,
  2035: 0.125,
  2036: 0.125,
  2037: 0.125,
};
const DESCONTO_METODO_RATE = 0.028242752948432766;
const EPS = 1e-9;

// ── Section A: canonical schedule values ──────────────────────────────────
check(
  "canonical_source_identity",
  V10_AVERAGE_DISCOUNT_SOURCE.sha256 === "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0" &&
    V10_AVERAGE_DISCOUNT_SOURCE.row === 224 &&
    V10_AVERAGE_DISCOUNT_SOURCE.sheet === "PnL",
  JSON.stringify(V10_AVERAGE_DISCOUNT_SOURCE),
);
check(
  "canonical_source_not_finance_signed",
  V10_AVERAGE_DISCOUNT_SOURCE.approvalStatus === "approved_by_project_owner" &&
    V10_AVERAGE_DISCOUNT_SOURCE.notFinanceSigned === true,
  "explicitly project-owner approved, not Finance-signed",
);
for (const year of YEARS_2028_2037) {
  check(
    `canonical_rate_${year}`,
    Math.abs(v10AverageDiscountRate(year as any) - APPROVED_SCHEDULE[year]) < EPS,
    `v10AverageDiscountRate(${year}) = ${v10AverageDiscountRate(year as any)}, expected ${APPROVED_SCHEDULE[year]}`,
  );
  check(
    `canonical_schedule_map_${year}`,
    Math.abs(V10_AVERAGE_DISCOUNT_SCHEDULE[year as keyof typeof V10_AVERAGE_DISCOUNT_SCHEDULE] - APPROVED_SCHEDULE[year]) < EPS,
    `V10_AVERAGE_DISCOUNT_SCHEDULE[${year}] = ${V10_AVERAGE_DISCOUNT_SCHEDULE[year as keyof typeof V10_AVERAGE_DISCOUNT_SCHEDULE]}`,
  );
}
check(
  "terminal_rate_0_125",
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE === 0.125,
  String(V10_AVERAGE_DISCOUNT_TERMINAL_RATE),
);
check(
  "terminal_rate_start_2036",
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR === 2036,
  String(V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR),
);
// Full supported model horizon: 2038-2047 must also hold the terminal rate.
for (const year of [2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047]) {
  check(
    `canonical_terminal_holds_${year}`,
    Math.abs(v10AverageDiscountRate(year as any) - 0.125) < EPS,
    `v10AverageDiscountRate(${year}) = ${v10AverageDiscountRate(year as any)}`,
  );
}

// ── Section B: explicit regressions must not resolve ──────────────────────
check(
  "2032_not_stale_018",
  Math.abs(v10AverageDiscountRate(2032 as any) - 0.18) > EPS,
  `2032 rate = ${v10AverageDiscountRate(2032 as any)} (must not be 0.18)`,
);
check(
  "2035_not_stale_015",
  Math.abs(v10AverageDiscountRate(2035 as any) - 0.15) > EPS,
  `2035 rate = ${v10AverageDiscountRate(2035 as any)} (must not be 0.15)`,
);

// ── Section C: DRE driver consumption (signed negative, single-sourced) ───
const driverRecord = DRE_REVENUE_DRIVER_SOURCE_DATA.records.find(
  (r) => r.driverId === "percentual_desconto_medio",
);
check("dre_driver_exists", driverRecord != null, "percentual_desconto_medio record found");
if (driverRecord) {
  for (const year of YEARS_2028_2037) {
    const val = (driverRecord.annualValuesByYear as Record<number, number>)[year];
    check(
      `dre_driver_signed_negative_${year}`,
      Math.abs(val - -APPROVED_SCHEDULE[year]) < EPS,
      `dre driver ${year} = ${val}, expected ${-APPROVED_SCHEDULE[year]}`,
    );
  }
  check(
    "dre_driver_no_stale_12pct_regression",
    !Object.values(driverRecord.annualValuesByYear as Record<number, number>).some(
      (v) => Math.abs(v - -0.12) < EPS,
    ),
    "no -0.12 value remains anywhere in the DRE driver series",
  );
}

// ── Section D: audit-only Receita consumption (positive, same canonical source) ──
for (const year of [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035] as const) {
  const val = DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear[year as keyof typeof DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear];
  check(
    `receita_audit_layer_${year}`,
    val !== undefined && Math.abs(val - APPROVED_SCHEDULE[year]) < EPS,
    `DISCOUNT_SCHEDULE_SOURCE ${year} = ${val}`,
  );
}
check(
  "receita_audit_layer_terminal",
  DISCOUNT_SCHEDULE_SOURCE.terminalRate === 0.125 && DISCOUNT_SCHEDULE_SOURCE.terminalRateStartYear === 2036,
  `terminalRate=${DISCOUNT_SCHEDULE_SOURCE.terminalRate}, start=${DISCOUNT_SCHEDULE_SOURCE.terminalRateStartYear}`,
);
check(
  "receita_audit_layer_matches_dre_layer_2028_2035",
  YEARS_2028_2037.slice(0, 8).every((year) => {
    const receitaVal = DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear[year as keyof typeof DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear] ?? DISCOUNT_SCHEDULE_SOURCE.terminalRate;
    const dreVal = -((driverRecord!.annualValuesByYear as Record<number, number>)[year]);
    return Math.abs(receitaVal - dreVal) < EPS;
  }),
  "both mechanisms read identical rates for 2028-2035 — single canonical source confirmed",
);

// ── Section E: netReceitaAfterDiscount remains audit-only, excluded from live DRE ──
const adapterSource = readFileSync(
  "src/features/rio-scenario-resilience/model/dreScenarioAdapters.ts",
  "utf8",
);
check(
  "netReceitaAfterDiscount_guarded_out_of_dre_adapter",
  adapterSource.includes("grossReceitaBeforeDiscount") &&
    /must NOT use netReceitaAfterDiscount/i.test(adapterSource),
  "adaptReceitasComEnsinoRegular still reads grossReceitaBeforeDiscount only",
);

// ── Section F: live DRE bolsa_de_estudos / desconto_metodo / double-discount check ──
const dre = calculateDre({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
} as Parameters<typeof calculateDre>[0]);

for (const year of YEARS_2028_2037) {
  const yr = (dre.byYear as Record<number, ReturnType<typeof calculateDre>["byYear"][2028]>)[year];
  const expectedBolsa = -(yr.receitas_com_ensino_regular * APPROVED_SCHEDULE[year]);
  const expectedMetodo = -(yr.receitas_com_ensino_regular * DESCONTO_METODO_RATE);
  check(
    `dre_bolsa_de_estudos_${year}`,
    Math.abs(yr.bolsa_de_estudos - expectedBolsa) < 1,
    `bolsa=${yr.bolsa_de_estudos.toFixed(2)}, expected=${expectedBolsa.toFixed(2)}`,
  );
  check(
    `dre_desconto_metodo_unchanged_${year}`,
    Math.abs(yr.descontos_metodo_de_assinatura - expectedMetodo) < 1,
    `metodo=${yr.descontos_metodo_de_assinatura.toFixed(2)}, expected=${expectedMetodo.toFixed(2)} (rate unchanged at 2.8243%)`,
  );
  // No double discount: bolsa + metodo must both be computed off the SAME gross base
  // (receitas_com_ensino_regular), i.e. additive, not sequential/compounded.
  const additiveNet =
    yr.receitas_com_ensino_regular + yr.bolsa_de_estudos + yr.descontos_metodo_de_assinatura;
  const sequentialNet =
    yr.receitas_com_ensino_regular *
    (1 - APPROVED_SCHEDULE[year]) *
    (1 - DESCONTO_METODO_RATE);
  check(
    `no_double_discount_${year}`,
    Math.abs(additiveNet - sequentialNet) > 1,
    `additive=${additiveNet.toFixed(2)} vs sequential-if-compounded=${sequentialNet.toFixed(2)} — confirms additive-off-same-base formula (matches PnL C228=C222×C225, C230=-C13×C225), not sequential compounding`,
  );
}

// ── Section G: Receita-to-DRE gross handoff unchanged ──────────────────────
const receitaOutput = calculateReceita({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
});
for (const year of YEARS_2028_2037) {
  const grossFromReceita = receitaOutput.byYear[year as keyof typeof receitaOutput.byYear]?.grossReceitaBeforeDiscount ?? 0;
  const grossInDre = (dre.byYear as Record<number, { receitas_com_ensino_regular: number }>)[year].receitas_com_ensino_regular;
  check(
    `gross_handoff_unchanged_${year}`,
    Math.abs(grossFromReceita - grossInDre) < 1,
    `receita gross=${grossFromReceita.toFixed(2)}, dre receitas_com_ensino_regular=${grossInDre.toFixed(2)}`,
  );
}

// ── Section H: enrollment and capacity invariance ───────────────────────────
check(
  "enrollment_2028_t1_g4_base_unchanged_258",
  receitaOutput.grainRecords
    .filter((r) => r.year === 2028)
    .reduce((s, r) => s + r.contractedLearners, 0) === 258,
  "G4 Base 2028 total enrollment still 258 — unchanged by this phase",
);
check(
  "capacity_series_unchanged",
  JSON.stringify([348, 396, 446, 496, 546, 596, 646, 696, 746, 746]) ===
    JSON.stringify(YEARS_2028_2037.map((y) => getGovernedAvailableCapacity("t1_g4", y))),
  JSON.stringify(YEARS_2028_2037.map((y) => getGovernedAvailableCapacity("t1_g4", y))),
);
check(
  "no_active_capacity_740_regression",
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.every((r) => r.availableCapacity !== 740),
  "capacity ceiling from Phase V10-E2.1 remains intact (746, not 740)",
);
// D-R8 (Phase V10-F1B.1, 2026-07-27, project-owner decision): the DRE adapter's
// numero_de_alunos handoff must remain governed at 258, never substituting the
// superseded workbook v9 value of 259.
check(
  "dre_numero_de_alunos_2028_governed_258",
  (dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos === 258,
  `dre numero_de_alunos 2028 = ${(dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos} (governed value per D-R8)`,
);
check(
  "dre_numero_de_alunos_2028_not_259",
  (dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos !== 259,
  "DRE adapter does not substitute the superseded workbook v9 value of 259",
);

// ── Section I: payroll formula marker unchanged ─────────────────────────────
check(
  "payroll_formula_marker_unchanged",
  readFileSync("src/features/rio-scenario-resilience/model/fopagEngine.ts", "utf8").includes(
    "ANNUAL_ADJUSTMENT",
  ),
  "fopagEngine.ts payroll formula marker retained — not touched by this phase",
);
check(
  "tuition_formula_marker_unchanged",
  readFileSync("src/features/rio-scenario-resilience/model/receitaEngine.ts", "utf8").includes(
    "Math.pow(1.08, year - 2028)",
  ),
  "receitaEngine.ts tuition escalation (8%) unchanged — out of scope for V10-F1B",
);

// ── Section J: no duplicated schedule constants remain ─────────────────────
const dreDriverSource = readFileSync(
  "src/features/rio-scenario-resilience/model/dreRevenueDriverSourceData.ts",
  "utf8",
);
const discountScheduleSource = readFileSync(
  "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts",
  "utf8",
);
check(
  "dre_driver_imports_canonical_source",
  dreDriverSource.includes("v10AverageDiscountSourceData"),
  "dreRevenueDriverSourceData.ts imports from the canonical module, not a hand-duplicated literal",
);
check(
  "discount_schedule_imports_canonical_source",
  discountScheduleSource.includes("v10AverageDiscountSourceData"),
  "discountScheduleSourceData.ts imports from the canonical module, not a hand-duplicated literal",
);
check(
  "no_literal_negative_012_in_dre_driver_file",
  !/-0\.12,/.test(dreDriverSource),
  "stale -0.12 literal removed from dreRevenueDriverSourceData.ts",
);

// ── Output ───────────────────────────────────────────────────────────────
const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;
console.log(JSON.stringify({ passCount, failCount, checks }, null, 2));
if (failCount > 0) process.exit(1);
