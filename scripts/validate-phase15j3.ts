// Phase 15J.3 — Executive Simulator Interpretation & Board Decision Framing (20 checks).
//
// Verifies the executive interpretation layer is present, correctly worded,
// and does not introduce forbidden language or formula/flag changes.
//
//   Section A — Component presence (checks 1-2)
//     1. DreExecutiveInterpretationPanel.tsx exists
//     2. DreScenarioSimulatorTab.tsx imports and renders DreExecutiveInterpretationPanel
//
//   Section B — Status header language (checks 3-5)
//     3. "Simulation available" text present in component
//     4. Finance-source closure pending text present
//     5. Board ratification pending text present
//
//   Section C — How-to-read section (checks 6-7)
//     6. All five lever axes are explained (opening package, occupancy, tuition, org design, CAPEX)
//     7. Each explanation references what changes, not which is correct
//
//   Section D — Trade-off lenses (checks 8-12)
//     8.  "growth ambition" lens present
//     9.  "revenue sensitivity" lens present
//    10.  "operating-model complexity" lens present
//    11.  "capital exposure" lens present
//    12.  "governance readiness" lens present
//
//   Section E — Board decision questions (checks 13-14)
//    13.  Decision questions panel present (5 questions for 5 axes)
//    14.  Questions are framed as planning lens questions, not recommendations
//
//   Section F — Boundary note (checks 15-16)
//    15.  Boundary note references "decision support"
//    16.  Boundary note explicitly states the simulator is "not a recommendation"
//
//   Section G — Forbidden language absent (checks 17-18)
//    17.  No winner/best-scenario/recommended-scenario language in component or DRE display sources
//    18.  No affirmative board-approved/finance-approved/ratification-complete claims
//
//   Section H — Governance flags unchanged (checks 19-20)
//    19.  FINANCE_SOURCE_CLOSURE_COMPLETE remains false
//    20.  BOARD_RATIFICATION_READY remains false, and F02 absent from openItems
//
// Run with: npm run validate:phase15j3

import { readFileSync } from "fs";
import {
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
  DRE_GOVERNANCE_READINESS,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function exists(path: string): boolean {
  return readFile(path) !== "";
}

let passCount = 0;
let failCount = 0;

function checkTrue(label: string, val: boolean, note?: string) {
  if (val) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    if (note) console.log(`      note: ${note}`);
  }
}

function checkFalse(label: string, val: boolean, note?: string) {
  checkTrue(label, !val, note);
}

// ── Source files ──────────────────────────────────────────────────────────────

const PANEL_PATH = "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx";
const TAB_PATH = "src/components/sections/DreScenarioSimulatorTab.tsx";

const PANEL = readFile(PANEL_PATH);
const PANEL_LOWER = PANEL.toLowerCase();
const TAB = readFile(TAB_PATH);

// Display source files for forbidden-language scan
const DISPLAY_SOURCE_FILES = [
  PANEL_PATH,
  "src/components/dreSimulator/DreScenarioContextBanner.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  TAB_PATH,
  "src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioComparisonPanel.tsx",
];

const allDisplayContent = DISPLAY_SOURCE_FILES.map(readFile)
  .join("\n")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

// ── Section A: Component presence ────────────────────────────────────────────
console.log("\nSection A — Component Presence");

// Check 1
checkTrue(
  "exec_panel_file_exists",
  exists(PANEL_PATH),
  `${PANEL_PATH} must exist`,
);

// Check 2
checkTrue(
  "exec_panel_imported_in_tab",
  TAB.includes("DreExecutiveInterpretationPanel") &&
    TAB.includes("<DreExecutiveInterpretationPanel"),
  "DreScenarioSimulatorTab.tsx must import and render DreExecutiveInterpretationPanel",
);

// ── Section B: Status header language ─────────────────────────────────────────
console.log("\nSection B — Status Header Language");

// Check 3
checkTrue(
  "simulation_available_in_panel",
  PANEL_LOWER.includes("simulation available"),
  "DreExecutiveInterpretationPanel must include 'Simulation available' status",
);

// Check 4
checkTrue(
  "finance_source_closure_pending_in_panel",
  PANEL_LOWER.includes("finance-source closure pending") ||
    (PANEL_LOWER.includes("finance-source") && PANEL_LOWER.includes("pending")),
  "DreExecutiveInterpretationPanel must reference Finance-source closure pending",
);

// Check 5
checkTrue(
  "board_ratification_pending_in_panel",
  PANEL_LOWER.includes("board ratification pending") ||
    (PANEL_LOWER.includes("board ratification") && PANEL_LOWER.includes("pending")),
  "DreExecutiveInterpretationPanel must reference Board ratification pending",
);

// ── Section C: How-to-read section ────────────────────────────────────────────
console.log("\nSection C — How-to-Read Section");

// Check 6: All five lever axes described
const hasOpeningPackageExplanation = PANEL_LOWER.includes("opening package");
const hasOccupancyExplanation = PANEL_LOWER.includes("occupancy");
const hasTuitionExplanation = PANEL_LOWER.includes("tuition");
const hasOrgDesignExplanation =
  PANEL_LOWER.includes("org design") || PANEL_LOWER.includes("operating-model");
const hasCapexExplanation = PANEL_LOWER.includes("capex");

checkTrue(
  "all_five_lever_axes_explained",
  hasOpeningPackageExplanation &&
    hasOccupancyExplanation &&
    hasTuitionExplanation &&
    hasOrgDesignExplanation &&
    hasCapexExplanation,
  "All five axes (opening package, occupancy, tuition, org design, CAPEX) must be explained",
);

// Check 7: No axis is described as "correct" or "best"
const howToReadSection = PANEL.slice(
  0,
  PANEL.indexOf("TRADE_OFF_LENSES") > 0 ? PANEL.indexOf("TRADE_OFF_LENSES") : undefined,
).toLowerCase();
const hasCorrectBestInExplanation =
  /\b(is correct|is best|is recommended|is preferred|is the right)\b/.test(howToReadSection);
checkFalse(
  "lever_explanations_no_correct_or_best",
  hasCorrectBestInExplanation,
  "Lever explanations must not describe any axis as correct, best, or recommended",
);

// ── Section D: Trade-off lenses ───────────────────────────────────────────────
console.log("\nSection D — Trade-Off Lenses");

// Check 8
checkTrue(
  "trade_off_lens_growth_ambition",
  PANEL_LOWER.includes("growth ambition"),
  "Panel must include 'growth ambition' trade-off lens",
);

// Check 9
checkTrue(
  "trade_off_lens_revenue_sensitivity",
  PANEL_LOWER.includes("revenue sensitivity"),
  "Panel must include 'revenue sensitivity' trade-off lens",
);

// Check 10
checkTrue(
  "trade_off_lens_operating_model_complexity",
  PANEL_LOWER.includes("operating-model complexity"),
  "Panel must include 'operating-model complexity' trade-off lens",
);

// Check 11
checkTrue(
  "trade_off_lens_capital_exposure",
  PANEL_LOWER.includes("capital exposure"),
  "Panel must include 'capital exposure' trade-off lens",
);

// Check 12
checkTrue(
  "trade_off_lens_governance_readiness",
  PANEL_LOWER.includes("governance readiness"),
  "Panel must include 'governance readiness' trade-off lens",
);

// ── Section E: Board decision questions ──────────────────────────────────────
console.log("\nSection E — Board Decision Questions");

// Check 13: Questions exist for all five axes
const hasOpeningQuestion =
  PANEL_LOWER.includes("opening package") && PANEL_LOWER.includes("ramp");
const hasOccupancyQuestion = PANEL_LOWER.includes("planning reference");
const hasTuitionQuestion = PANEL_LOWER.includes("finance validate");
const hasOrgDesignQuestion = PANEL_LOWER.includes("service depth");
const hasCapexQuestion = PANEL_LOWER.includes("stress test");

checkTrue(
  "decision_questions_all_five_axes",
  hasOpeningQuestion &&
    hasOccupancyQuestion &&
    hasTuitionQuestion &&
    hasOrgDesignQuestion &&
    hasCapexQuestion,
  "Panel must include planning lens questions for all five decision axes",
);

// Check 14: Questions are framed as planning lenses, not recommendations
checkTrue(
  "decision_questions_framed_as_planning_lens",
  PANEL_LOWER.includes("planning lens") || PANEL_LOWER.includes("planning lens question"),
  "Questions must be framed as planning lens questions, not recommendations",
);

// ── Section F: Boundary note ──────────────────────────────────────────────────
console.log("\nSection F — Boundary Note");

// Check 15
checkTrue(
  "boundary_note_decision_support",
  PANEL_LOWER.includes("decision support"),
  "Panel must include a boundary note referencing 'decision support'",
);

// Check 16
checkTrue(
  "boundary_note_not_recommendation",
  PANEL_LOWER.includes("not a recommendation"),
  "Boundary note must state the simulator is 'not a recommendation'",
);

// ── Section G: Forbidden language absent ─────────────────────────────────────
console.log("\nSection G — Forbidden Language Absent");

// Check 17: No winner/best/recommended language in display sources (after comment strip)
const hasWinnerLanguage =
  /["'`>]\s*(winner|best scenario|recommended scenario|overall winner|preferred scenario)\s*["'`<]/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_winner_best_recommended_in_display_sources",
  hasWinnerLanguage,
  "Display sources must not contain winner/best-scenario/recommended-scenario declarations in JSX strings",
);

// Check 18: No affirmative approval/ratification-complete claims
const hasApprovalLanguage =
  /\b(is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|has\s+been\s+finance[\s-]approved|board[\s-]ratification\s+complete|board[\s-]ratification\s*[=:]\s*true|approved\s+recommendation|final\s+recommendation)\b/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_approval_ratification_complete_in_display_sources",
  hasApprovalLanguage,
  "Display sources must not contain affirmative board-approved / Finance-approved / ratification-complete claims",
);

// ── Section H: Governance flags unchanged ─────────────────────────────────────
console.log("\nSection H — Governance Flags Unchanged");

// Check 19
checkTrue(
  "finance_source_closure_complete_remains_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE must remain false — got ${FINANCE_SOURCE_CLOSURE_COMPLETE}`,
);

// Check 20: BOARD_RATIFICATION_READY false + F02 not in openItems
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue(
  "board_ratification_false_and_f02_resolved",
  BOARD_RATIFICATION_READY === false && f02InOpen === undefined,
  `BOARD_RATIFICATION_READY=${BOARD_RATIFICATION_READY}, F02 in openItems=${f02InOpen !== undefined}`,
);

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED_TOTAL = 20;
const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";

console.log(
  `\n${finalIcon} Phase 15J.3 executive interpretation validation: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
