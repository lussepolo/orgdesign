// Phase 15Q — Tuition Expansion, Annual Gross Visibility, Discount Correction,
// and Service Contract Line Items validation (26 checks).
//
//   Section A — Tuition type expansion (checks 1–9)
//     1.  TuitionSourceScenarioId includes "bp_scenario_4"
//     2.  TuitionSourceScenarioId includes "bp_scenario_5"
//     3.  TUITION_SOURCE_RECORDS count = 95 (5 × 19)
//     4.  TuitionScenarioId includes "rj4"
//     5.  TuitionScenarioId includes "rj5"
//     6.  CALC_TO_SOURCE_SCENARIO is exported from receitaEngine.ts
//     7.  receitaEngine.ts maps rj4 → bp_scenario_4
//     8.  receitaEngine.ts maps rj5 → bp_scenario_5
//     9.  tuitionArchitecture.ts includes rj4 option
//
//   Section B — Tuition UI visibility (checks 10–13)
//    10.  tuitionArchitecture.ts includes rj5 option
//    11.  tuitionArchitecture.ts includes bandDetails field
//    12.  tuitionArchitecture.ts includes annualGrossContractValueBRL
//    13.  ScenarioConfigurationPanel.tsx references annualGrossContractValueBRL
//
//   Section C — Discount schedule correction (checks 14–22)
//    14.  discountScheduleSourceData: 2028 rate = 0.25
//    15.  discountScheduleSourceData: 2029 rate = 0.20 (unchanged)
//    16.  discountScheduleSourceData: 2031 rate = 0.18 (was 0.17)
//    17.  discountScheduleSourceData: 2032 rate = 0.18 (was 0.15)
//    18.  discountScheduleSourceData: 2034 rate = 0.15 (new explicit)
//    19.  discountScheduleSourceData: 2035 rate = 0.15 (new explicit)
//    20.  discountScheduleSourceData: terminalRateStartYear = 2036
//    21.  discountScheduleSourceData: terminalRate = 0.125
//    22.  No stale terminalRateStartYear: 2034 in file (old value removed)
//
//   Section D — Service Contracts in MethodologyDisclosure (checks 23–25)
//    23.  MethodologyDisclosure.tsx imports DRE_LINE_ITEM_MAP
//    24.  MethodologyDisclosure.tsx imports DRE_ANNUAL_ASSUMPTION_SOURCE_DATA
//    25.  MethodologyDisclosure.tsx uses serviceContractsCategory filter + join pattern
//
//   Section F — rj4/rj5 DRE calculation coverage (checks 26–32)
//    26.  rj4: projection years complete (no missing byYear entry)
//    27.  rj4: receita_operacional_liquida numeric and non-zero for 2028
//    28.  rj4: no NaN or undefined across all projection-year core fields
//    29.  rj5: projection years complete (no missing byYear entry)
//    30.  rj5: receita_operacional_liquida numeric and non-zero for 2028
//    31.  rj5: no NaN or undefined across all projection-year core fields
//    32.  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS includes rj4 and rj5
//
//   Section G — Aggregate (check 33)
//    33.  Validator check count is exactly 33
//
// Run with: npx ts-node scripts/validate-phase15q.ts

import { readFileSync } from "fs";
import { TUITION_SOURCE_RECORDS } from "../src/features/rio-scenario-resilience/model/tuitionSourceData";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

let passCount = 0;
let failCount = 0;

function checkTrue(label: string, val: boolean, note?: string): void {
  if (val) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}${note ? ` — ${note}` : ""}`);
  }
}

function checkEqual<T>(label: string, actual: T, expected: T, note?: string): void {
  const ok = actual === expected;
  if (ok) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label} — expected ${String(expected)}, got ${String(actual)}${note ? ` (${note})` : ""}`);
  }
}

// ── Section A: Tuition type expansion ────────────────────────────────────────
console.log("\nSection A — Tuition Type Expansion");

const contractSrc = readFile(
  "src/features/rio-scenario-resilience/model/tuitionSourceDataContract.ts",
);

// Check 1
checkTrue(
  "tuition_source_scenario_id_bp_scenario_4",
  contractSrc.includes('"bp_scenario_4"'),
  "TuitionSourceScenarioId includes bp_scenario_4",
);

// Check 2
checkTrue(
  "tuition_source_scenario_id_bp_scenario_5",
  contractSrc.includes('"bp_scenario_5"'),
  "TuitionSourceScenarioId includes bp_scenario_5",
);

// Check 3 — TUITION_SOURCE_RECORDS count (runtime import)
checkEqual(
  "tuition_source_records_count_95",
  TUITION_SOURCE_RECORDS.length,
  95,
  "5 scenarios × 19 courses = 95 records",
);

// Check 4
const revenueInputsSrc = readFile(
  "src/features/rio-scenario-resilience/model/revenueInputs.ts",
);
checkTrue(
  "tuition_scenario_id_rj4",
  revenueInputsSrc.includes('"rj4"'),
  "TuitionScenarioId includes rj4",
);

// Check 5
checkTrue(
  "tuition_scenario_id_rj5",
  revenueInputsSrc.includes('"rj5"'),
  "TuitionScenarioId includes rj5",
);

// Check 6
const receitaSrc = readFile(
  "src/features/rio-scenario-resilience/model/receitaEngine.ts",
);
checkTrue(
  "calc_to_source_scenario_exported",
  receitaSrc.includes("export const CALC_TO_SOURCE_SCENARIO"),
  "CALC_TO_SOURCE_SCENARIO is exported from receitaEngine.ts",
);

// Check 7
checkTrue(
  "receita_engine_rj4_bp_scenario_4",
  receitaSrc.includes("rj4:") && receitaSrc.includes('"bp_scenario_4"'),
  "receitaEngine maps rj4 → bp_scenario_4",
);

// Check 8
checkTrue(
  "receita_engine_rj5_bp_scenario_5",
  receitaSrc.includes("rj5:") && receitaSrc.includes('"bp_scenario_5"'),
  "receitaEngine maps rj5 → bp_scenario_5",
);

// Check 9
const tuitionArchSrc = readFile(
  "src/features/rio-scenario-resilience/data/tuitionArchitecture.ts",
);
checkTrue(
  "tuition_architecture_rj4",
  tuitionArchSrc.includes('"rj4"'),
  "tuitionArchitecture.ts includes rj4 option",
);

// ── Section B: Tuition UI visibility ─────────────────────────────────────────
console.log("\nSection B — Tuition UI Visibility");

// Check 10
checkTrue(
  "tuition_architecture_rj5",
  tuitionArchSrc.includes('"rj5"'),
  "tuitionArchitecture.ts includes rj5 option",
);

// Check 11
checkTrue(
  "tuition_architecture_band_details",
  tuitionArchSrc.includes("bandDetails"),
  "tuitionArchitecture.ts includes bandDetails field",
);

// Check 12
checkTrue(
  "tuition_architecture_annual_gross",
  tuitionArchSrc.includes("annualGrossContractValueBRL"),
  "tuitionArchitecture.ts includes annualGrossContractValueBRL",
);

// Check 13
const scenarioPanelSrc = readFile(
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioConfigurationPanel.tsx",
);
checkTrue(
  "scenario_panel_annual_gross_reference",
  scenarioPanelSrc.includes("annualGrossContractValueBRL"),
  "ScenarioConfigurationPanel.tsx references annualGrossContractValueBRL",
);

// ── Section C: Discount schedule correction ───────────────────────────────────
console.log("\nSection C — Discount Schedule Correction");

const discountSrc = readFile(
  "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts",
);

// Check 14
checkTrue(
  "discount_2028_rate_0_25",
  discountSrc.includes("2028: 0.25"),
  "2028 rate = 0.25",
);

// Check 15
checkTrue(
  "discount_2029_rate_0_20",
  discountSrc.includes("2029: 0.20"),
  "2029 rate = 0.20",
);

// Check 16
checkTrue(
  "discount_2031_rate_0_18",
  discountSrc.includes("2031: 0.18"),
  "2031 rate = 0.18 (corrected from 0.17)",
);

// Check 17
checkTrue(
  "discount_2032_rate_0_18",
  discountSrc.includes("2032: 0.18"),
  "2032 rate = 0.18 (corrected from 0.15)",
);

// Check 18
checkTrue(
  "discount_2034_rate_0_15_explicit",
  discountSrc.includes("2034: 0.15"),
  "2034 rate = 0.15 (new explicit entry)",
);

// Check 19
checkTrue(
  "discount_2035_rate_0_15_explicit",
  discountSrc.includes("2035: 0.15"),
  "2035 rate = 0.15 (new explicit entry)",
);

// Check 20
checkTrue(
  "discount_terminal_rate_start_2036",
  discountSrc.includes("terminalRateStartYear: 2036"),
  "terminalRateStartYear = 2036",
);

// Check 21
checkTrue(
  "discount_terminal_rate_0_125",
  discountSrc.includes("terminalRate: 0.125"),
  "terminalRate = 0.125",
);

// Check 22 — stale 2034 terminal-rate-start is gone
checkTrue(
  "discount_no_stale_terminal_2034",
  !discountSrc.includes("terminalRateStartYear: 2034"),
  "Old terminalRateStartYear: 2034 removed",
);

// ── Section D: Service Contracts in MethodologyDisclosure ─────────────────────
console.log("\nSection D — Service Contracts in MethodologyDisclosure");

const methodologySrc = readFile(
  "src/features/rio-scenario-resilience/components/CapitalDecision/MethodologyDisclosure.tsx",
);

// Check 23
checkTrue(
  "methodology_imports_dre_line_item_map",
  methodologySrc.includes("DRE_LINE_ITEM_MAP"),
  "MethodologyDisclosure.tsx imports DRE_LINE_ITEM_MAP",
);

// Check 24
checkTrue(
  "methodology_imports_dre_annual_assumption",
  methodologySrc.includes("DRE_ANNUAL_ASSUMPTION_SOURCE_DATA"),
  "MethodologyDisclosure.tsx imports DRE_ANNUAL_ASSUMPTION_SOURCE_DATA",
);

// Check 25 — component uses serviceContractsCategory filter + join key pattern
checkTrue(
  "methodology_service_contracts_dynamic_filter",
  methodologySrc.includes("serviceContractsCategory") &&
    methodologySrc.includes("dreLineItemMapDreLineId") &&
    methodologySrc.includes("SERVICE_CONTRACT_LINE_IDS"),
  "MethodologyDisclosure.tsx uses serviceContractsCategory filter + dreLineItemMapDreLineId join + SERVICE_CONTRACT_LINE_IDS",
);

// ── Section F: rj4/rj5 DRE calculation coverage ───────────────────────────────
console.log("\nSection F — rj4/rj5 DRE Calculation Coverage");

const DRE_FIXTURE_BASE = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  orgDesignOptionId: "balanced_experience" as const,
};

function checkDreScenario(scenarioId: "rj4" | "rj5", checkOffset: number): void {
  const result = calculateDre({ ...DRE_FIXTURE_BASE, tuitionScenarioId: scenarioId });

  // Check offset+0: projection years complete
  const missingYears = RECEITA_PROJECTION_YEARS.filter((yr) => !result.byYear[yr]);
  checkTrue(
    `${scenarioId}_projection_years_complete`,
    missingYears.length === 0,
    `Missing byYear entries: ${missingYears.join(", ") || "none"}`,
  );

  // Check offset+1: ROL numeric and non-zero for 2028
  const rol2028 = result.byYear[2028]?.receita_operacional_liquida;
  checkTrue(
    `${scenarioId}_receita_operacional_liquida_2028_numeric_nonzero`,
    typeof rol2028 === "number" && !Number.isNaN(rol2028) && rol2028 !== 0,
    `receita_operacional_liquida 2028 = ${rol2028}`,
  );

  // Check offset+2: no NaN or undefined across core fields for all years
  let nanOrUndefinedCount = 0;
  for (const yr of RECEITA_PROJECTION_YEARS) {
    const row = result.byYear[yr];
    if (!row) { nanOrUndefinedCount++; continue; }
    const fields = [
      row.receita_operacional_liquida,
      row.ebitda,
      row.numero_de_alunos,
      row.receitas_com_ensino_regular,
    ];
    for (const f of fields) {
      if (f === undefined || f === null || (typeof f === "number" && (Number.isNaN(f) || !isFinite(f)))) {
        nanOrUndefinedCount++;
      }
    }
  }
  checkEqual(
    `${scenarioId}_no_nan_undefined_across_all_years`,
    nanOrUndefinedCount,
    0,
    `NaN/undefined/infinite count across all projection-year core fields: ${nanOrUndefinedCount}`,
  );
}

// Checks 26–28: rj4
checkDreScenario("rj4", 26);

// Checks 29–31: rj5
checkDreScenario("rj5", 29);

// Check 32: DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS includes rj4 and rj5
checkTrue(
  "dre_working_scenario_tuition_ids_includes_rj4_rj5",
  (DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS as readonly string[]).includes("rj4") &&
    (DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS as readonly string[]).includes("rj5"),
  `IDs: ${[...DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS].join(", ")}`,
);

// ── Section G: Aggregate ──────────────────────────────────────────────────────
console.log("\nSection G — Aggregate");

// Check 33 — total check count (this is the 33rd check)
const totalBefore = passCount + failCount; // should be 32
const expectedTotal = 33;
if (totalBefore === expectedTotal - 1) {
  passCount++;
  console.log(`  ✓ validator_check_count_33 — ${totalBefore} checks before self-check + 1 = ${expectedTotal}`);
} else {
  failCount++;
  console.log(`  ✗ validator_check_count_33 — expected ${expectedTotal - 1} checks before self-check, got ${totalBefore}`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  ${passCount} passed, ${failCount} failed (of ${passCount + failCount} checks)\n`);
if (failCount > 0) process.exit(1);
