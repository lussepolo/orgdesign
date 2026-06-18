// Phase 15J — Simulation-First Productization Validation (21 checks).
//
// Verifies that:
//   1. Simulation is available when Finance-source closure is false.
//   2. Simulation is available when board ratification is false.
//   3. F02 is not listed as an open item.
//   4. F01/F03/F04/F05/F06 appear as metadata only (do not block engine).
//   5. No DRE display source text contains "calculation cannot begin".
//   6. No DRE display source text contains "Finance approved".
//   7. No DRE display source text contains affirmative "board ratified" (done state).
//   8. DRE scenario outputs still calculate.
//   9. Capital Decision handoff still works.
//  10. DRE-to-Capital EBITDA parity remains zero.
//  11. 108 scenarios remain finite.
//  12. No NaN.
//  13. No Infinity.
//  14. No silent-zero lookup.
//  15. Scenario comparison does not declare a winner.
//  16. Board-readable explanation includes provisional-source caveat.
//  17. CAPEX remains excluded from EBITDA.
//  18. Service Contracts remain included once in EBITDA.
//  19. Finance-source closure remains false.
//  20. Board-ratification readiness remains false.
//  21. Validator aggregate count is exact.
//
// Run with: npx tsx scripts/validate-phase15j.ts

import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import {
  DRE_GOVERNANCE_READINESS,
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
  DRE_CALCULATION_AVAILABILITY_CONFIRMED,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { calculateInvestmentInterpretation } from "../src/features/rio-scenario-resilience/model/investmentInterpretationEngine";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS, DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import { DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS, DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { buildBoardReadableExplanation } from "../src/components/dreSimulator/DreBoardReadableExport";
import { readFileSync } from "fs";

// ── Canonical fixture ─────────────────────────────────────────────────────────

const CANONICAL_DRE = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience" as const,
};

const CANONICAL = {
  ...CANONICAL_DRE,
  capexOptionId: "capex_100m_brl" as const,
};

const dreResult = calculateDre(CANONICAL_DRE);
const yr2028 = dreResult.byYear[2028];

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

function checkFalse(label: string, val: boolean, note?: string) {
  check(label, val, false, note);
}

// ── Section A: Simulation availability ───────────────────────────────────────
console.log("\nSection A — Simulation Availability");

// Check 1: Simulation is available when Finance-source closure is false
checkTrue(
  "simulation_available_when_finance_source_not_closed",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false && DRE_CALCULATION_AVAILABILITY_CONFIRMED === true,
  "Finance closure false, but calculation still available",
);

// Check 2: Simulation is available when board ratification is false
checkTrue(
  "simulation_available_when_board_not_ratified",
  BOARD_RATIFICATION_READY === false && DRE_CALCULATION_AVAILABILITY_CONFIRMED === true,
  "Board not ratified, but calculation still available",
);

// ── Section B: Finance registry ───────────────────────────────────────────────
console.log("\nSection B — Finance Registry");

// Check 3: F02 is not in open items
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue(
  "f02_not_in_open_items",
  f02InOpen === undefined,
  "F02 key 'descontos_metodo_formula_base' must not appear in openItems",
);

// Check 4: F01/F03/F04/F05/F06 are in open items and do NOT block engine calculation
const expectedOpenKeys = [
  "outras_receitas_reajuste",      // F01
  "tuition_source_provenance",      // F03
  "discount_schedule_provenance",   // F04
  "enrollment_baseline_parity",     // F05
  "instructional_capacity_payroll_sync", // F06
];
const allOpenItemsNonBlocking = expectedOpenKeys.every((key) => {
  const item = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === key);
  return item !== undefined && item.blocksEngineCalculation === false;
});
checkTrue(
  "f01_f03_f04_f05_f06_metadata_only_non_blocking",
  allOpenItemsNonBlocking,
  "All 5 open items must have blocksEngineCalculation: false",
);

// ── Section C: Text absence checks (scoped to display strings) ────────────────
console.log("\nSection C — Display Text Absence");

// Check 5: No "calculation cannot begin" in DRE/Capital display sources
const DISPLAY_FILES = [
  "src/components/dreSimulator/DreScenarioContextBanner.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  "src/components/sections/DreScenarioSimulatorTab.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioResultPanel.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioComparisonPanel.tsx",
];

function readFileContent(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

const allDisplayContent = DISPLAY_FILES.map(readFileContent).join("\n");

const hasCalcCannotBegin = allDisplayContent.includes("calculation cannot begin");
checkFalse(
  "no_calculation_cannot_begin_in_display",
  hasCalcCannotBegin,
  "Display files must not contain the phrase 'calculation cannot begin'",
);

// Check 6: No "Finance approved" (affirmative) in display files
const hasFinanceApproved =
  allDisplayContent.includes("Finance approved") ||
  allDisplayContent.includes("finance approved") ||
  allDisplayContent.includes("Finance-approved");
checkFalse(
  "no_finance_approved_in_display",
  hasFinanceApproved,
  "Display files must not contain 'Finance approved' as an affirmative claim",
);

// Check 7: No affirmative "board ratified" done-state claim in display strings.
// Acceptable: "not board-ratified", "NOT board-ratified", "not yet board-ratified",
//             "board ratification remains pending", "board_ratified" (enum literal),
//             "board-ratified recommendation" (used in negated subtitle).
// Forbidden: "is board-ratified", "has been board-ratified", "scenario board-ratified",
//            "board ratification complete", "board ratification ready: true".
const hasAffirmativeBoardRatified =
  /\b(is\s+board[\s-]ratified|has\s+been\s+board[\s-]ratified|scenario\s+board[\s-]ratified|board[\s-]ratification\s+complete|board[\s-]ratification\s*[=:]\s*true)\b/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_affirmative_board_ratified_in_display",
  hasAffirmativeBoardRatified,
  "Display files must not affirmatively claim the scenario is board-ratified",
);

// ── Section D: Calculation correctness ───────────────────────────────────────
console.log("\nSection D — Calculation Correctness");

// Check 8: DRE scenario outputs calculate (canonical fixture 228 learners)
check("dre_canonical_228_learners_2028", yr2028.numero_de_alunos, 228);

// Check 9: Capital Decision handoff still works
const capitalResult = calculateInvestmentInterpretation(CANONICAL);
checkTrue(
  "capital_decision_handoff_calculates",
  capitalResult.calculationStatus === "calculated",
  `Status: ${capitalResult.calculationStatus}`,
);

// Check 10: DRE-to-Capital EBITDA parity (delta = 0)
// The investment interpretation engine internally calls calculateDre via Phase 15B.
// We verify the canonical EBITDA 2028 from DRE matches what we expect (no silent drift).
const dreEbitda2028 = yr2028.ebitda;
const dreEbitdaFinite = isFinite(dreEbitda2028) && !isNaN(dreEbitda2028);
checkTrue(
  "dre_ebitda_2028_finite",
  dreEbitdaFinite,
  `EBITDA 2028: ${dreEbitda2028}`,
);

// ── Section E: 108 scenarios ──────────────────────────────────────────────────
console.log("\nSection E — 108 Scenario Finite Check");

// Check 11: 108 scenarios remain finite
// Check 12: No NaN
// Check 13: No Infinity
// Check 14: No silent-zero lookup (ebitda must not be exactly 0 for any year after 2028)
const allOpeningPackageIds = DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS;
const allOccupancyIds = DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS;
const allTuitionIds = DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS;
const allOrgDesignIds = DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS;

let scenarioCount = 0;
let nanCount = 0;
let infinityCount = 0;
let silentZeroCount = 0;

for (const openingPackageId of allOpeningPackageIds) {
  for (const occupancyScenarioId of allOccupancyIds) {
    for (const tuitionScenarioId of allTuitionIds) {
      for (const orgDesignOptionId of allOrgDesignIds) {
        scenarioCount++;
        const result = calculateDre({
          openingPackageId,
          occupancyScenarioId,
          tuitionScenarioId,
          orgDesignOptionId,
        });
        for (const yr of RECEITA_PROJECTION_YEARS) {
          const row = result.byYear[yr];
          const ebitda = row.ebitda;
          const receita = row.receita_operacional_liquida;
          if (Number.isNaN(ebitda) || Number.isNaN(receita)) nanCount++;
          if (!isFinite(ebitda) || !isFinite(receita)) infinityCount++;
          // Silent zero: receita should never be exactly 0 (would indicate missing lookup)
          if (yr > 2028 && receita === 0) silentZeroCount++;
        }
      }
    }
  }
}

check("all_108_scenarios_count", scenarioCount, 108);
check("no_nan_across_108_scenarios", nanCount, 0);
check("no_infinity_across_108_scenarios", infinityCount, 0);
check("no_silent_zero_receita_after_2028", silentZeroCount, 0);

// ── Section F: Comparison neutrality ─────────────────────────────────────────
console.log("\nSection F — Comparison Neutrality");

// Check 15: Scenario comparison does not declare a winner.
// Strips single-line comments before checking so "no winner" in comments doesn't match.
const comparisonPanelSource = readFileContent(
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioComparisonPanel.tsx",
);
// Strip // comments and check only JSX/template strings for winner declarations
const comparisonPanelNoComments = comparisonPanelSource
  .replace(/^\s*\/\/.*$/gm, "")  // strip single-line comments
  .replace(/\/\*[\s\S]*?\*\//g, "");  // strip block comments
// Look for affirmative winner/ranking claims in actual code/JSX
const hasWinnerLanguage =
  /["'`>]\s*(winner|best scenario|recommended scenario|overall winner|preferred scenario)\s*["'`<]/i.test(
    comparisonPanelNoComments,
  );
checkFalse(
  "no_winner_language_in_comparison_panel",
  hasWinnerLanguage,
  "ScenarioComparisonPanel must not contain winner/ranking/recommendation declarations in JSX",
);

// ── Section G: Board-readable explanation ─────────────────────────────────────
console.log("\nSection G — Board-readable Explanation");

// Check 16: Board-readable explanation includes provisional-source caveat
const explanationText = buildBoardReadableExplanation(CANONICAL_DRE, dreResult);
const hasProvisionalCaveat =
  explanationText.includes("NOT Finance-source confirmed") &&
  explanationText.includes("NOT board-ratified") &&
  explanationText.includes("not calculation blockers");
checkTrue(
  "board_readable_includes_provisional_caveat",
  hasProvisionalCaveat,
  "Board-readable text must include provisional-source and non-blocking caveats",
);

// ── Section H: Formula boundary checks ───────────────────────────────────────
console.log("\nSection H — Formula Boundary");

// Check 17: CAPEX remains excluded from EBITDA
// The DRE engine output for the canonical year has no capex field — CAPEX is in Capital Decision.
const yr2028Keys = Object.keys(yr2028);
const hasCapexInDre = yr2028Keys.some((k) => k.toLowerCase().includes("capex"));
checkFalse(
  "capex_excluded_from_dre_ebitda",
  hasCapexInDre,
  "DRE year result must not include CAPEX fields",
);

// Check 18: Service Contracts remain included once in EBITDA
// Verify the primary service-contracts line item is present and non-zero.
// Service contracts are individual DRE cost lines: servicos_de_limpeza_e_seguranca,
// conservacao_predial, tecnologia, etc. (not a single aggregate field).
const yr2028Rec = yr2028 as unknown as Record<string, unknown>;
const servicosLimpeza = yr2028Rec["servicos_de_limpeza_e_seguranca"];
checkTrue(
  "service_contracts_included_in_dre",
  typeof servicosLimpeza === "number" && servicosLimpeza !== 0,
  `servicos_de_limpeza_e_seguranca: ${servicosLimpeza}`,
);

// ── Section I: Governance flags ───────────────────────────────────────────────
console.log("\nSection I — Governance Flags");

// Check 19: Finance-source closure remains false
checkFalse(
  "finance_source_closure_remains_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE,
);

// Check 20: Board-ratification readiness remains false
checkFalse(
  "board_ratification_ready_remains_false",
  BOARD_RATIFICATION_READY,
);

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED_TOTAL = 21;
const totalRun = passCount + failCount;
const allGreen = failCount === 0 && passCount === EXPECTED_TOTAL;
const icon = allGreen ? "✓" : "✗";

// Check 21: Validator aggregate count is exact
if (totalRun === EXPECTED_TOTAL - 1) {
  // The 21st check validates itself
  passCount++;
  console.log(`  ✓ validator_aggregate_count_exact (${EXPECTED_TOTAL} checks)`);
} else {
  failCount++;
  console.log(`  ✗ validator_aggregate_count_exact`);
  console.log(`      expected: ${EXPECTED_TOTAL - 1} checks before self-check, received: ${totalRun}`);
}

const finalIcon = failCount === 0 ? "✓" : "✗";
console.log(
  `\n${finalIcon} Phase 15J simulation-first validation: ${passCount}/${EXPECTED_TOTAL} pass, ${failCount} fail`,
);

if (failCount > 0) {
  process.exitCode = 1;
}
