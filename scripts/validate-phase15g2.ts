// Phase 15G.2 — Pure state validation (24 checks).
//
// Tests capitalDecisionWorkspace.ts pure transitions in isolation.
// No React, no browser, no engine calls (uses a stub buildResult).
// Run with: npx tsx scripts/validate-phase15g2.ts

import {
  INITIAL_WORKSPACE_STATE,
  DEFAULT_CAPEX_OPTION_ID,
  MAX_INTEGRATED_SCENARIOS,
  findExistingDreImportMatch,
  transitionImportFromDre,
  transitionDuplicateForCapexVariant,
  transitionRemoveScenario,
  transitionUpdateCapexOption,
  transitionSetActiveScenario,
  type CapitalDecisionWorkspaceState,
  type BuildResultFn,
} from "../src/features/rio-scenario-resilience/state/capitalDecisionWorkspace";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { InvestmentInterpretationResult } from "../src/features/rio-scenario-resilience/model/investmentInterpretationEngineContract";

// ── Stub ──────────────────────────────────────────────────────────────────────

const stub: BuildResultFn = (_input) => ({} as InvestmentInterpretationResult);

const SEL_A: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};

const SEL_B: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "otimista",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "minimum_experience",
};

// ── Test harness ──────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function expect(label: string, actual: unknown, expected: unknown) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

function expectTrue(label: string, val: boolean) {
  expect(label, val, true);
}

// ── Checks ────────────────────────────────────────────────────────────────────

console.log("\nPhase 15G.2 pure state validation\n");

// 1–3: INITIAL_WORKSPACE_STATE shape
expect("1. INITIAL scenarios is empty array", INITIAL_WORKSPACE_STATE.scenarios.length, 0);
expect("2. INITIAL activeScenarioId is null", INITIAL_WORKSPACE_STATE.activeScenarioId, null);
expect("3. INITIAL nextScenarioOrdinal is 1", INITIAL_WORKSPACE_STATE.nextScenarioOrdinal, 1);

// 4–10: transitionImportFromDre — first import
const r1 = transitionImportFromDre(INITIAL_WORKSPACE_STATE, SEL_A, stub);
expect("4. first import status is added", r1.result.status, "added");
const s1 = r1.nextState;
expect("5. scenarios count is 1 after first import", s1.scenarios.length, 1);
const sc1 = s1.scenarios[0];
expect("6. imported scenario has scenarioKind dre_import", sc1.scenarioKind, "dre_import");
expect("7. imported scenario has origin dre", sc1.origin, "dre");
expect("8. imported scenario has variantOfScenarioId null", sc1.variantOfScenarioId, null);
expect("9. imported scenario name is Scenario 1", sc1.name, "Scenario 1");
expect("10. nextScenarioOrdinal increments to 2", s1.nextScenarioOrdinal, 2);
expect("11. activeScenarioId set to new scenario id", s1.activeScenarioId, sc1.id);

// 11 (gap-fill): result.scenarioId matches the actual scenario id
expectTrue("12. result.scenarioId matches scenario id",
  r1.result.status === "added" && r1.result.scenarioId === sc1.id);

// 13: duplicate detection — same 4 fields returns already_present
const r2 = transitionImportFromDre(s1, SEL_A, stub);
expect("13. duplicate import returns already_present", r2.result.status, "already_present");
expect("14. already_present does NOT change nextScenarioOrdinal", r2.nextState.nextScenarioOrdinal, 2);
expectTrue("15. already_present returns existing scenario id",
  r2.result.status === "already_present" && r2.result.scenarioId === sc1.id);

// 16: duplicate check happens BEFORE capacity — fill to 4, then re-import A
let state: CapitalDecisionWorkspaceState = s1;
// Import B, C, D (3 more different selections) to fill to 4
const fillers: DreScenarioSimulatorSelections[] = [
  SEL_B,
  { ...SEL_B, openingPackageId: "t1_g5" },
  { ...SEL_B, openingPackageId: "t1_g6" },
];
for (const sel of fillers) {
  const r = transitionImportFromDre(state, sel, stub);
  state = r.nextState;
}
expect("16. scenarios at capacity (4)", state.scenarios.length, MAX_INTEGRATED_SCENARIOS);
// Now re-import A (duplicate) — should get already_present, NOT limit_reached
const rDupAtFull = transitionImportFromDre(state, SEL_A, stub);
expect("17. duplicate at capacity returns already_present not limit_reached",
  rDupAtFull.result.status, "already_present");
// Import a truly new selection when full — should get limit_reached
const rNewAtFull = transitionImportFromDre(state, {
  ...SEL_B, openingPackageId: "t1_g3", occupancyScenarioId: "pessimista",
  tuitionScenarioId: "bp2_ey_ls_unified", orgDesignOptionId: "premium_experience",
}, stub);
expect("18. new import at capacity returns limit_reached", rNewAtFull.result.status, "limit_reached");

// 19–22: transitionDuplicateForCapexVariant
const freshState = transitionImportFromDre(INITIAL_WORKSPACE_STATE, SEL_A, stub).nextState;
const srcId = freshState.scenarios[0].id;
const rv1 = transitionDuplicateForCapexVariant(freshState, srcId, "capex_90m_brl", stub);
expect("19. capex variant returns added", rv1.result.status, "added");
const vs1 = rv1.nextState.scenarios[1];
expect("20. capex variant scenarioKind is capex_variant", vs1.scenarioKind, "capex_variant");
expect("21. capex variant name contains — CAPEX variant", vs1.name, "Scenario 1 — CAPEX variant");
expect("22. capex variant variantOfScenarioId = source id", vs1.variantOfScenarioId, srcId);

// 23: second variant naming
const rv2 = transitionDuplicateForCapexVariant(rv1.nextState, srcId, "capex_90m_brl", stub);
expect("23. second capex variant name contains variant 2",
  rv2.nextState.scenarios[2]?.name, "Scenario 1 — CAPEX variant 2");

// 24: transitionRemoveScenario — active scenario removal shifts activeScenarioId
const twoState = ((): CapitalDecisionWorkspaceState => {
  const a = transitionImportFromDre(INITIAL_WORKSPACE_STATE, SEL_A, stub).nextState;
  return transitionImportFromDre(a, SEL_B, stub).nextState;
})();
const firstId = twoState.scenarios[0].id;
const afterRemove = transitionRemoveScenario(
  { ...twoState, activeScenarioId: firstId },
  firstId,
);
expectTrue("24. removing active scenario shifts activeScenarioId to next",
  afterRemove.activeScenarioId !== firstId && afterRemove.scenarios.length === 1);

// Additional: monotonic ordinal
const mon1 = transitionImportFromDre(INITIAL_WORKSPACE_STATE, SEL_A, stub).nextState;
const mon2 = transitionImportFromDre(mon1, SEL_B, stub).nextState;
// Remove first, then import a new one — ordinal must not reset
const mon3 = transitionRemoveScenario(mon2, mon2.scenarios[0].id);
const mon4 = transitionImportFromDre(mon3, { ...SEL_A, occupancyScenarioId: "pessimista" }, stub).nextState;
// At this point nextScenarioOrdinal was 3 before the import (started at 1, two imports)
// After remove it stays at 3. After new import it becomes 4, and the scenario name is "Scenario 3".
expectTrue("bonus: monotonic ordinal — name reflects pre-remove count",
  mon4.scenarios[mon4.scenarios.length - 1].name === "Scenario 3");

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED = 24;
const totalChecks = passCount + failCount;
const allGreen = failCount === 0 && passCount >= EXPECTED;
const icon = allGreen ? "✓" : "✗";
console.log(`\n${icon} Phase 15G.2: ${passCount}/${EXPECTED} pass, ${failCount} fail, ${totalChecks} total`);

if (!allGreen) process.exit(1);
