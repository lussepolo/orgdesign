// Phase 15L — Staffing Consistency and Board-Language Repair Validation (18 checks).
//
// Verifies that all S1 and S2 findings from the Phase 15K audit are resolved:
//
//   Section A — S1: MS/HS FTE correctness in LoadTab.tsx
//     1. msFte constant equals 9 (not 10)
//     2. hsFte constant equals 11 (not 10)
//     3. "3 + 4 + 3" arithmetic removed from LoadTab.tsx
//     4. HS_FULL_RAMP_FTE constant removed from LoadTab.tsx
//
//   Section B — S2: Load Calculator stress test verdict (F-5.9-02)
//     5. "PASS: Current" certifying language removed from LoadTab.tsx
//     6. Non-certifying "Internal planning target" replacement present
//
//   Section C — S2: App.tsx global labels (F-5.4-01, F-5.9-02 header)
//     7. "São Paulo Parity Scaling" removed from App.tsx header
//     8. "Internal planning reference" replacement present in App.tsx
//     9. "Board Review" eyebrow removed from App.tsx
//    10. "Strategic Planning" eyebrow replacement present in App.tsx
//
//   Section D — S2: Executive Org Design rail item (F-5.3-01)
//    11. "Board condition" label removed from executiveOrgDesignModel.ts
//    12. "Conditional approval language" value removed from executiveOrgDesignModel.ts
//    13. "Planning status" replacement label present
//
//   Section E — S2: High School Tab (F-5.8-01, F-5.8-02)
//    14. "Conditional approval" badge removed from HighSchoolTab.tsx
//    15. "Timetable validation pending" replacement badge present
//    16. "8-HC HS Educator Pool" removed from HS_STAFFING_VALIDATION_NOTE value
//
//   Section F — S2: Viability Simulator (F-5.9-03)
//    17. "current approved model" replaced in ViabilitySimulatorTab.tsx
//
//   Section G — Governance invariants
//    18. FINANCE_SOURCE_CLOSURE_COMPLETE and BOARD_RATIFICATION_READY remain false
//
// Run with: npm run validate:phase15l

import { readFileSync } from "fs";
import {
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";

// ── File reader ───────────────────────────────────────────────────────────────

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

// ── Test harness ──────────────────────────────────────────────────────────────

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

// ── File contents ─────────────────────────────────────────────────────────────

const LOAD_TAB = readFile("src/components/sections/LoadTab.tsx");
const APP_TSX = readFile("src/App.tsx");
const EXEC_ORG_MODEL = readFile(
  "src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts",
);
const HS_TAB = readFile("src/components/sections/HighSchoolTab.tsx");
const VIABILITY_TAB = readFile("src/components/sections/ViabilitySimulatorTab.tsx");

// ── Section A — S1: MS/HS FTE correctness ────────────────────────────────────
console.log("\nSection A — S1: MS/HS FTE Correctness (LoadTab.tsx)");

checkTrue(
  "ms_fte_equals_9",
  LOAD_TAB.includes("const msFte = 9"),
  "LoadTab.tsx must contain 'const msFte = 9'",
);

checkTrue(
  "hs_fte_equals_11",
  LOAD_TAB.includes("const hsFte = 11"),
  "LoadTab.tsx must contain 'const hsFte = 11'",
);

checkFalse(
  "no_3_plus_4_plus_3_arithmetic",
  LOAD_TAB.includes("3 + 4 + 3"),
  "LoadTab.tsx must not contain '3 + 4 + 3' (S1 defect removed)",
);

checkFalse(
  "no_hs_full_ramp_fte_constant",
  LOAD_TAB.includes("HS_FULL_RAMP_FTE"),
  "LoadTab.tsx must not contain 'HS_FULL_RAMP_FTE' constant (removed)",
);

// ── Section B — S2: Stress test verdict ──────────────────────────────────────
console.log("\nSection B — S2: Load Calculator Verdict (F-5.9-02)");

checkFalse(
  "no_pass_certifying_language_in_load_verdict",
  LOAD_TAB.includes("PASS: Current"),
  "LoadTab.tsx stress test verdict must not begin with 'PASS: Current'",
);

checkTrue(
  "internal_planning_target_replacement_present",
  LOAD_TAB.includes("Internal planning target"),
  "LoadTab.tsx must contain 'Internal planning target' replacement verdict",
);

// ── Section C — S2: App.tsx global labels ────────────────────────────────────
console.log("\nSection C — S2: App.tsx Global Labels (F-5.4-01, header)");

checkFalse(
  "no_sao_paulo_parity_scaling_in_header",
  APP_TSX.includes("São Paulo Parity Scaling"),
  "App.tsx header must not contain 'São Paulo Parity Scaling'",
);

checkTrue(
  "internal_planning_reference_in_header",
  APP_TSX.includes("Internal planning reference"),
  "App.tsx header must contain 'Internal planning reference'",
);

checkFalse(
  "no_board_review_eyebrow",
  APP_TSX.includes(">Board Review<"),
  "App.tsx eyebrow must not contain '>Board Review<'",
);

checkTrue(
  "strategic_planning_eyebrow_present",
  APP_TSX.includes(">Strategic Planning<"),
  "App.tsx eyebrow must contain '>Strategic Planning<'",
);

// ── Section D — S2: Executive Org Design rail item ───────────────────────────
console.log("\nSection D — S2: Executive Org Design Rail Item (F-5.3-01)");

checkFalse(
  "no_board_condition_label",
  EXEC_ORG_MODEL.includes('"Board condition"'),
  "executiveOrgDesignModel.ts must not contain '\"Board condition\"' as a label",
);

checkFalse(
  "no_conditional_approval_language_value",
  EXEC_ORG_MODEL.includes('"Conditional approval language"'),
  "executiveOrgDesignModel.ts must not contain '\"Conditional approval language\"' as a value",
);

checkTrue(
  "planning_status_label_present",
  EXEC_ORG_MODEL.includes('"Planning status"'),
  "executiveOrgDesignModel.ts must contain '\"Planning status\"' replacement label",
);

// ── Section E — S2: High School Tab ──────────────────────────────────────────
console.log("\nSection E — S2: High School Tab (F-5.8-01, F-5.8-02)");

checkFalse(
  "no_conditional_approval_badge_in_hs_tab",
  HS_TAB.includes(">Conditional approval<"),
  "HighSchoolTab.tsx must not contain '>Conditional approval<' badge text",
);

checkTrue(
  "timetable_validation_pending_badge_present",
  HS_TAB.includes(">Timetable validation pending<"),
  "HighSchoolTab.tsx must contain '>Timetable validation pending<' badge text",
);

// Check that "8-HC HS Educator Pool" does not appear in the const string value.
// It may appear as a paraphrase in a code comment but the exact phrase is removed.
checkFalse(
  "no_8hc_hs_educator_pool_phrase",
  HS_TAB.includes("8-HC HS Educator Pool"),
  "HighSchoolTab.tsx must not contain '8-HC HS Educator Pool' (internal diagnostic removed from const value)",
);

// ── Section F — S2: Viability Simulator ──────────────────────────────────────
console.log("\nSection F — S2: Viability Simulator (F-5.9-03)");

checkFalse(
  "no_current_approved_model_in_viability",
  VIABILITY_TAB.includes("current approved model"),
  "ViabilitySimulatorTab.tsx must not contain 'current approved model'",
);

// ── Section G — Governance invariants ────────────────────────────────────────
console.log("\nSection G — Governance Invariants");

checkTrue(
  "finance_source_closure_remains_false_and_board_ratification_remains_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false && BOARD_RATIFICATION_READY === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE=${FINANCE_SOURCE_CLOSURE_COMPLETE}, BOARD_RATIFICATION_READY=${BOARD_RATIFICATION_READY}`,
);

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED_TOTAL = 18;
const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";

console.log(`\n${finalIcon} Phase 15L staffing-consistency validation: ${passCount}/${totalRun} pass, ${failCount} fail`);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
