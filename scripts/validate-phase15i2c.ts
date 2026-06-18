// Phase 15I.2C — DRE Formula Parity Validation (26 checks).
//
// Verifies that:
//   1. F02 engine correction is in effect (C225 base, not liquida)
//   2. F01 Branch B is in effect (no reajuste factor in engine, note present)
//   3. Registry correctly reflects 5 open items, 1 resolved
//   4. Governance readiness is consistent with changes
//   5. Existing regression checks still pass (no validator weakened)
//
// Run with: npx tsx scripts/validate-phase15i2c.ts

import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { DRE_GOVERNANCE_READINESS } from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { DRE_REVENUE_DRIVER_SOURCE_DATA } from "../src/features/rio-scenario-resilience/model/dreRevenueDriverSourceData";
import { DRE_LINE_ITEM_MAP } from "../src/features/rio-scenario-resilience/model/dreLineItemMap";
import { readFileSync } from "fs";

// ── Canonical fixture ─────────────────────────────────────────────────────────

const CANONICAL = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience",
};

const result = calculateDre(CANONICAL);
const yr2028 = result.byYear[2028];

// ── Test harness ──────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function check(label: string, actual: unknown, expected: unknown, note?: string) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
    if (note) console.log(`      note: ${note}`);
  }
}

function checkTrue(label: string, val: boolean, note?: string) {
  check(label, val, true, note);
}

function checkClose(label: string, actual: number, expected: number, eps = 1, note?: string) {
  const pass = Math.abs(actual - expected) < eps;
  if (pass) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected ≈ ${expected} (eps=${eps})`);
    console.log(`      received: ${actual}`);
    if (note) console.log(`      note: ${note}`);
  }
}

// ── Section A: F02 Engine Correction ─────────────────────────────────────────
console.log("\nSection A — F02 Engine Correction (formula base)");

// Check 1: descontos_metodo uses receitas_com_ensino_regular as base
// After correction: descontos_metodo = -rate × rce
// Expected: rce=22298697.68, rate=0.028242752948432766 → ~-629776
const desconto_metodo_driver = DRE_REVENUE_DRIVER_SOURCE_DATA.records.find(
  (d) => d.driverId === "desconto_metodo"
);
const rate2028 = desconto_metodo_driver?.annualValuesByYear?.[2028] ?? NaN;
const rce2028 = yr2028.receitas_com_ensino_regular ?? 0;
const expected_dmd_2028 = -rate2028 * rce2028;

checkClose(
  "f02_descontos_metodo_uses_rce_base_2028",
  yr2028.descontos_metodo_de_assinatura ?? NaN,
  expected_dmd_2028,
  1,
  "descontos_metodo should equal -rate × receitas_com_ensino_regular in 2028",
);

// Check 2: descontos_metodo is NOT equal to -rate × receita_de_ensino_liquida (old wrong base)
const liquida2028 = yr2028.receita_de_ensino_liquida ?? 0;
const wrong_dmd_2028 = -rate2028 * liquida2028;
checkTrue(
  "f02_descontos_metodo_no_longer_uses_liquida_base",
  Math.abs((yr2028.descontos_metodo_de_assinatura ?? 0) - wrong_dmd_2028) > 1000,
  "descontos_metodo must no longer use receita_de_ensino_liquida (difference must be > R$1000)",
);

// Check 3: Engine note reflects workbook provenance
checkTrue(
  "f02_descontos_metodo_note_mentions_c225",
  result.descontosMetodoFormulaNote.includes("C225"),
  "descontosMetodoFormulaNote must mention C225",
);

// Check 4: Engine note does not describe formula as 'assumed'
checkTrue(
  "f02_descontos_metodo_note_not_assumed",
  !result.descontosMetodoFormulaNote.includes("assumed from DRE structure"),
  "descontosMetodoFormulaNote must not describe formula as assumed",
);

// Check 5: dreLineItemMap entry for descontos_metodo_de_assinatura has updated sourceType
const dreLineEntry = DRE_LINE_ITEM_MAP.find(
  (e) => e.dreLineId === "descontos_metodo_de_assinatura"
);
check(
  "f02_linemap_sourcetype_updated",
  dreLineEntry?.sourceType,
  "extracted_from_pnl_spreadsheet",
  "descontos_metodo_de_assinatura sourceType must be extracted_from_pnl_spreadsheet",
);

// Check 6: dreLineItemMap implementationStatus is 'implemented'
check(
  "f02_linemap_implementation_status_implemented",
  dreLineEntry?.implementationStatus,
  "implemented",
);

// Check 7: descontos_metodo rate is the correct workbook-derived value
checkClose(
  "f02_desconto_metodo_rate_is_workbook_value",
  rate2028,
  0.028242752948432766,
  1e-10,
  "Rate must be the PnL-extracted value",
);

// Check 8: All 20 years produce descontos_metodo consistent with rce base
let allYearsRceBase = true;
const years = Object.keys(result.byYear).map(Number).sort((a, b) => a - b);
for (const yr of years) {
  const yData = result.byYear[yr];
  const rateYr = desconto_metodo_driver?.annualValuesByYear?.[yr] ?? NaN;
  const rceYr = yData.receitas_com_ensino_regular ?? 0;
  const expected = -rateYr * rceYr;
  if (Math.abs((yData.descontos_metodo_de_assinatura ?? 0) - expected) > 1) {
    allYearsRceBase = false;
  }
}
checkTrue("f02_all_20_years_use_rce_base", allYearsRceBase);

// ── Section B: F01 Branch B ───────────────────────────────────────────────────
console.log("\nSection B — F01 Branch B (reajuste_despesas not applied)");

// Check 9: outras_receitas = baseRatio × numero_de_alunos (no reajuste factor)
// DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER = 2571.866...
const alunos2028 = yr2028.numero_de_alunos ?? 0;
const OR_BASE_RATIO = 2571.8660655737704; // from dreScenarioAdapters.ts
const expected_outras_2028 = OR_BASE_RATIO * alunos2028;
checkClose(
  "f01_outras_receitas_no_reajuste_factor_2028",
  yr2028.outras_receitas ?? NaN,
  expected_outras_2028,
  1,
  "outras_receitas must equal basePerLearnerRatio × numero_de_alunos without reajuste",
);

// Check 10: outrasReceitasReajusteNote is non-empty (disclosure present)
checkTrue(
  "f01_outras_receitas_reajuste_note_present",
  typeof result.outrasReceitasReajusteNote === "string" &&
    result.outrasReceitasReajusteNote.length > 50,
  "outrasReceitasReajusteNote must be a non-empty disclosure string",
);

// Check 11: Note mentions PnL formula
checkTrue(
  "f01_note_mentions_pnl_formula",
  result.outrasReceitasReajusteNote.includes("C233"),
  "outrasReceitasReajusteNote must reference PnL formula (C233)",
);

// Check 12: No double adjustment — outras_receitas is stable vs F01 Branch B calculation
let allYearsStable = true;
for (const yr of years) {
  const yData = result.byYear[yr];
  const alunos = yData.numero_de_alunos ?? 0;
  const expected = OR_BASE_RATIO * alunos;
  if (Math.abs((yData.outras_receitas ?? 0) - expected) > 1) {
    allYearsStable = false;
  }
}
checkTrue("f01_all_20_years_no_reajuste_applied", allYearsStable);

// ── Section C: Finance Registry ───────────────────────────────────────────────
console.log("\nSection C — Finance Registry Correctness");

const REGISTER_PATH =
  "/Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design/docs/finance/dre-finance-confirmation-register.json";

let register: {
  openItems: Array<{ id: string; status: string; decisionStatus: string }>;
  resolvedItems?: Array<{ id: string; status: string }>;
  governanceState?: {
    openItemCount: number;
    resolvedItemCount: number;
    FINANCE_SOURCE_CLOSURE_COMPLETE: boolean;
    BOARD_RATIFICATION_READY?: boolean;
    CALCULATION_CAN_BEGIN?: boolean;
  };
} | null = null;

try {
  register = JSON.parse(readFileSync(REGISTER_PATH, "utf8"));
} catch {
  register = null;
}

// Check 13: Register is valid JSON
checkTrue("registry_is_valid_json", register !== null);

// Check 14: 5 open items
check("registry_has_five_open_items", register?.openItems?.length ?? -1, 5);

// Check 15: F01 status is provisional_source
const f01 = register?.openItems?.find((i) => i.id === "F01");
check("registry_f01_status_provisional_source", f01?.status, "provisional_source");

// Check 16: F02 is NOT in openItems
const f02InOpen = register?.openItems?.find((i) => i.id === "F02");
checkTrue("registry_f02_not_in_open_items", f02InOpen === undefined);

// Check 17: F02 is in resolvedItems
const f02Resolved = register?.resolvedItems?.find((i) => i.id === "F02");
checkTrue("registry_f02_in_resolved_items", f02Resolved !== undefined);

// Check 18: F06 requiredOwner includes Academic (check in governance file)
const f06Gov = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === "instructional_capacity_payroll_sync");
checkTrue(
  "registry_f06_owner_includes_academic",
  f06Gov?.requiredOwner === "Finance + Academic",
  "F06 requiredOwner must be 'Finance + Academic'",
);

// Check 19: Finance closure still false
check("registry_finance_closure_false", register?.governanceState?.FINANCE_SOURCE_CLOSURE_COMPLETE, false);

// ── Section D: Governance Readiness Consistency ───────────────────────────────
console.log("\nSection D — Governance Readiness Consistency");

// Check 20: DRE_GOVERNANCE_READINESS.openItems has 5 items
check("governance_open_items_count_five", DRE_GOVERNANCE_READINESS.openItems.length, 5);

// Check 21: F01 governance status is provisional_source
const f01Gov = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === "outras_receitas_reajuste");
check("governance_f01_status_provisional_source", f01Gov?.status, "provisional_source");

// Check 22: No open item has key 'descontos_metodo_formula_base' (F02 removed)
const f02Gov = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === "descontos_metodo_formula_base");
checkTrue("governance_f02_removed_from_open_items", f02Gov === undefined);

// ── Section E: Financial Identity Checks ─────────────────────────────────────
console.log("\nSection E — Financial Identity Checks");

// Check 23: EBITDA identity holds for all 20 years (MC + fixed + selling = EBITDA)
let ebitdaIdentityHolds = true;
for (const yr of years) {
  const d = result.byYear[yr];
  const computed =
    (d.margem_de_contribuicao ?? 0) +
    (d.total_custos_e_despesas_fixas ?? 0) +
    (d.total_despesas_com_vendas ?? 0);
  if (Math.abs((d.ebitda ?? 0) - computed) > 1e-6) {
    ebitdaIdentityHolds = false;
  }
}
checkTrue("ebitda_subtotal_identity_holds_all_20_years", ebitdaIdentityHolds);

// Check 24: No NaN or Infinity in engine output
let allFinite = true;
for (const yr of years) {
  const d = result.byYear[yr];
  for (const [k, v] of Object.entries(d)) {
    if (typeof v === "number" && (!isFinite(v) || isNaN(v))) {
      allFinite = false;
      console.log(`    NaN/Infinity at year ${yr} key ${k}`);
    }
  }
}
checkTrue("no_nan_or_infinity_in_output", allFinite);

// Check 25: EBITDA becomes positive by 2032 or before (regression from DRE validation)
const firstPositiveEbitdaYear = years.find((yr) => (result.byYear[yr].ebitda ?? -Infinity) > 0);
checkTrue(
  "ebitda_positive_by_2032",
  firstPositiveEbitdaYear !== undefined && firstPositiveEbitdaYear <= 2032,
  `First positive EBITDA year: ${firstPositiveEbitdaYear}`,
);

// Check 26: 228 learners in canonical fixture 2028
check("canonical_fixture_228_learners_2028", yr2028.numero_de_alunos, 228);

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED_TOTAL = 26;
const allGreen = failCount === 0 && passCount === EXPECTED_TOTAL;
const icon = allGreen ? "✓" : "✗";

console.log(
  `\n${icon} Phase 15I.2C DRE formula parity: ${passCount}/${EXPECTED_TOTAL} pass, ${failCount} fail`
);

if (!allGreen) {
  process.exitCode = 1;
}
