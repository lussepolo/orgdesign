// Phase 15N — Hide Staffing Model from Primary Navigation (11 checks).
//
// Verifies that the Staffing Model has been removed from the primary nav
// while all underlying staffing files and logic remain intact.
//
//   Section A — Navigation exposure (check 1)
//     1. Primary navigation in App.tsx no longer contains a Staffing Model TabButton
//
//   Section B — Staffing source integrity (checks 2-3)
//     2. Staffing source files still exist (StaffingTab, useStaffingLogic, LoadTab, etc.)
//     3. Staffing model logic was not deleted (key staffing hooks still export)
//
//   Section C — Existing validators intact (check 4)
//     4. Phase 15L and 15L.2 validator scripts still exist
//
//   Section D — Engine proxy checks (checks 5-6)
//     5. DRE engine still exports calculateDre
//     6. Capital Decision engine still exports calculateCapitalDecisionBridge
//
//   Section E — Source values unchanged (check 7)
//     7. Governance readiness file still present with expected exports
//
//   Section F — Governance flags unchanged (check 8)
//     8. FINANCE_SOURCE_CLOSURE_COMPLETE = false, BOARD_RATIFICATION_READY = false
//
//   Section G — F02 status (check 9)
//     9. F02 (descontos_metodo_formula_base) absent from openItems
//
//   Section H — Forbidden language absent (check 10)
//    10. No forbidden winner/recommendation/approval/ratification-complete language
//        in primary display sources
//
//   Section I — Aggregate count (check 11)
//    11. Validator ran exactly 11 checks
//
// Run with: npm run validate:phase15n

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

const APP_PATH = "src/App.tsx";
const APP = readFile(APP_PATH);

// Extract the <nav> block to scope the navigation check
const navStart = APP.indexOf('<nav aria-label="Model sections"');
const navEnd = APP.indexOf("</nav>", navStart);
const NAV_BLOCK = navStart >= 0 && navEnd >= 0 ? APP.slice(navStart, navEnd) : "";

const DISPLAY_SOURCE_PATHS = [
  "src/components/dreSimulator/DreScopeBoundaryPanel.tsx",
  "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx",
  "src/components/sections/DreScenarioSimulatorTab.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
];
const allDisplayContent = DISPLAY_SOURCE_PATHS.map(readFile)
  .join("\n")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

// ── Section A: Navigation exposure ───────────────────────────────────────────
console.log("\nSection A — Navigation Exposure");

// Check 1: "Staffing Model" TabButton absent from primary nav
const hasStaffingModelInNav =
  /label="Staffing Model"/.test(NAV_BLOCK) ||
  /label='Staffing Model'/.test(NAV_BLOCK);
checkFalse(
  "staffing_model_absent_from_primary_nav",
  hasStaffingModelInNav,
  'App.tsx <nav> must not contain a TabButton with label="Staffing Model"',
);

// ── Section B: Staffing source integrity ──────────────────────────────────────
console.log("\nSection B — Staffing Source Integrity");

// Check 2: Key staffing source files still exist
const STAFFING_SOURCE_FILES = [
  "src/components/sections/StaffingTab.tsx",
  "src/hooks/useStaffingLogic.ts",
  "src/components/sections/LoadTab.tsx",
  "src/components/sections/PayrollProjectionTab.tsx",
  "src/features/rio-scenario-resilience/model/msHsStaffingReadiness.ts",
  "src/features/rio-scenario-resilience/model/payrollAdapter.ts",
];
const allStaffingFilesPresent = STAFFING_SOURCE_FILES.every(exists);
checkTrue(
  "staffing_source_files_intact",
  allStaffingFilesPresent,
  `All staffing source files must still exist: ${STAFFING_SOURCE_FILES.filter((f) => !exists(f)).join(", ") || "all present"}`,
);

// Check 3: Staffing model logic not deleted — StaffingTab still has content
const staffingTab = readFile("src/components/sections/StaffingTab.tsx");
const useStaffingLogic = readFile("src/hooks/useStaffingLogic.ts");
checkTrue(
  "staffing_model_logic_not_deleted",
  staffingTab.length > 200 && useStaffingLogic.length > 200,
  "StaffingTab.tsx and useStaffingLogic.ts must have substantial content (not deleted/emptied)",
);

// ── Section C: Existing validators intact ─────────────────────────────────────
console.log("\nSection C — Existing Validators Intact");

// Check 4
checkTrue(
  "phase15l_and_15l2_validators_exist",
  exists("scripts/validate-phase15l.ts") && exists("scripts/validate-phase15l2.ts"),
  "Phase 15L and 15L.2 validator scripts must still exist",
);

// ── Section D: Engine proxy checks ────────────────────────────────────────────
console.log("\nSection D — Engine Proxy Checks");

// Check 5
checkTrue(
  "dre_engine_calculateDre_export_intact",
  readFile("src/features/rio-scenario-resilience/model/dreEngine.ts").includes(
    "export function calculateDre",
  ),
  "dreEngine.ts must still export calculateDre",
);

// Check 6
checkTrue(
  "capital_engine_calculateCapitalDecisionBridge_export_intact",
  readFile(
    "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts",
  ).includes("export function calculateCapitalDecisionBridge"),
  "capitalDecisionEngine.ts must still export calculateCapitalDecisionBridge",
);

// ── Section E: Source values unchanged ───────────────────────────────────────
console.log("\nSection E — Source Values Unchanged");

// Check 7
checkTrue(
  "governance_readiness_file_present_with_expected_exports",
  exists("src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts") &&
    readFile(
      "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts",
    ).includes("FINANCE_SOURCE_CLOSURE_COMPLETE") &&
    readFile(
      "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts",
    ).includes("BOARD_RATIFICATION_READY"),
  "dreGovernanceReadiness.ts must exist and export governance flag constants",
);

// ── Section F: Governance flags unchanged ─────────────────────────────────────
console.log("\nSection F — Governance Flags Unchanged");

// Check 8
checkTrue(
  "governance_flags_remain_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false && BOARD_RATIFICATION_READY === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE=${FINANCE_SOURCE_CLOSURE_COMPLETE}, BOARD_RATIFICATION_READY=${BOARD_RATIFICATION_READY} — both must remain false`,
);

// ── Section G: F02 status ─────────────────────────────────────────────────────
console.log("\nSection G — F02 Status");

// Check 9
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue(
  "f02_remains_resolved_and_absent_from_open_items",
  f02InOpen === undefined,
  `F02 must remain resolved — found in openItems: ${f02InOpen !== undefined}`,
);

// ── Section H: Forbidden language absent ──────────────────────────────────────
console.log("\nSection H — Forbidden Language Absent");

// Check 10
const hasForbiddenLanguage =
  /\b(winner|best scenario|recommended scenario|final recommendation|is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|board[\s-]ratification\s+complete|ratification\s+approved|decision\s+complete)\b/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_forbidden_winner_approval_ratification_language",
  hasForbiddenLanguage,
  "Display sources must not contain forbidden winner/recommendation/approval/ratification-complete language",
);

// ── Section I: Aggregate count ────────────────────────────────────────────────
console.log("\nSection I — Aggregate Count");

const EXPECTED_TOTAL = 11;
const totalBefore = passCount + failCount;

if (totalBefore === EXPECTED_TOTAL - 1) {
  passCount++;
  console.log(`  ✓ validator_aggregate_count_exact (${EXPECTED_TOTAL} checks)`);
} else {
  failCount++;
  console.log(
    `  ✗ validator_aggregate_count_exact — expected ${EXPECTED_TOTAL - 1} before self-check, got ${totalBefore}`,
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────

const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";

console.log(
  `\n${finalIcon} Phase 15N hide-staffing-nav validation: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
