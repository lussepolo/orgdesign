// Phase 15O — Board-Ready Visible App Flow Review (14 checks).
//
// Verifies that the three visible-flow defects found in Phase 15O are corrected
// and that all regression gates from prior phases remain intact.
//
//   Section A — Navigation exposure (check 1)
//     1. Primary navigation does not show "Staffing Model"
//
//   Section B — Visible-flow defects corrected (checks 2-4)
//     2. AboutModal no longer lists "Staffing Model" in "What each tab does"
//     3. PayrollProjectionTab no longer references "Staffing Model tab" in visible text
//     4. App.tsx payroll subtitle no longer uses "approved scenarios"
//
//   Section B2 — AboutModal navigation coverage (check 5)
//     5. AboutModal tabs array includes all 13 visible primary navigation items
//
//   Section C — Core panels still exist (checks 6-7)
//     6. Executive interpretation panel source still exists and has expected content
//     7. Scope & Source Boundary source still exists with DRE Operating Layer / Capital / Source Governance
//
//   Section D — Forbidden language absent (check 8)
//     8. No affirmative winner/approval/ratification-complete language in primary display sources
//
//   Section E — Governance flags unchanged (check 9)
//     9. FINANCE_SOURCE_CLOSURE_COMPLETE = false, BOARD_RATIFICATION_READY = false
//
//   Section F — F-code status (checks 10-11)
//    10. F02 remains resolved (absent from openItems)
//    11. F01/F03/F04/F05/F06 remain open and non-blocking
//
//   Section G — Formula and source files unchanged (checks 12-13)
//    12. DRE formula and Capital Decision engine files not in git diff
//    13. Staffing calculation and source-data files not in git diff
//
//   Section H — Aggregate count (check 14)
//    14. Validator ran exactly 14 checks
//
// Run with: npm run validate:phase15o

import { readFileSync } from "fs";
import { execSync } from "child_process";
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

function gitDiffFiles(): string[] {
  try {
    const out = execSync("git diff --name-only HEAD", { encoding: "utf8" });
    return out.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
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

const APP = readFile("src/App.tsx");
const navStart = APP.indexOf('<nav aria-label="Model sections"');
const navEnd = APP.indexOf("</nav>", navStart);
const NAV_BLOCK = navStart >= 0 && navEnd >= 0 ? APP.slice(navStart, navEnd) : "";

const ABOUT_MODAL = readFile("src/components/sections/AboutModal.tsx");
const PAYROLL_TAB = readFile("src/components/sections/PayrollProjectionTab.tsx");

const PRIMARY_DISPLAY_PATHS = [
  "src/components/dreSimulator/DreScopeBoundaryPanel.tsx",
  "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx",
  "src/components/sections/DreScenarioSimulatorTab.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  "src/components/sections/AboutModal.tsx",
  "src/components/sections/PayrollProjectionTab.tsx",
  "src/App.tsx",
];
const allDisplayContent = PRIMARY_DISPLAY_PATHS.map(readFile)
  .join("\n")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

// ── Section A: Navigation exposure ───────────────────────────────────────────
console.log("\nSection A — Navigation Exposure");

// Check 1
const hasStaffingModelInNav =
  /label="Staffing Model"/.test(NAV_BLOCK) ||
  /label='Staffing Model'/.test(NAV_BLOCK);
checkFalse(
  "staffing_model_absent_from_primary_nav",
  hasStaffingModelInNav,
  'App.tsx <nav> must not contain a TabButton with label="Staffing Model"',
);

// ── Section B: Visible-flow defects corrected ────────────────────────────────
console.log("\nSection B — Visible-Flow Defects Corrected");

// Check 2: AboutModal no longer lists "Staffing Model" in its tabs array
const aboutModalTabsStart = ABOUT_MODAL.indexOf("const tabs = [");
const aboutModalTabsEnd = ABOUT_MODAL.indexOf("];", aboutModalTabsStart);
const ABOUT_TABS_BLOCK =
  aboutModalTabsStart >= 0 && aboutModalTabsEnd >= 0
    ? ABOUT_MODAL.slice(aboutModalTabsStart, aboutModalTabsEnd)
    : "";
const aboutModalHasStaffingModel =
  /label:\s*["']Staffing Model["']/.test(ABOUT_TABS_BLOCK);
checkFalse(
  "about_modal_staffing_model_entry_removed",
  aboutModalHasStaffingModel,
  'AboutModal tabs array must not contain label: "Staffing Model"',
);

// Check 3: PayrollProjectionTab no longer references "Staffing Model tab" in visible text
const payrollHasStaleRef = /Independent from the Staffing Model tab/i.test(PAYROLL_TAB);
checkFalse(
  "payroll_tab_stale_staffing_model_ref_removed",
  payrollHasStaleRef,
  'PayrollProjectionTab must not reference "Independent from the Staffing Model tab"',
);

// Check 4: App.tsx payroll subtitle no longer uses "approved scenarios"
const payrollSubtitle = APP.match(
  /activeTab === ["']payroll["'].*?(?=\{activeTab|$)/s,
)?.[0] ?? "";
const hasApprovedScenarios = /approved scenarios/i.test(payrollSubtitle);
checkFalse(
  "payroll_subtitle_approved_scenarios_removed",
  hasApprovedScenarios,
  'App.tsx payroll tab subtitle must not use "approved scenarios"',
);

// ── Section B2: AboutModal navigation coverage ───────────────────────────────
console.log("\nSection B2 — AboutModal Navigation Coverage");

// Check 5: AboutModal tabs array includes all 13 visible primary navigation items
const VISIBLE_NAV_ITEMS = [
  "Cover",
  "Cenários da Oferta",
  "Executive Org Design",
  "Hiring Profile Cards",
  "Early Years",
  "Lower School",
  "Middle School",
  "High School",
  "Load Calculator",
  "Payroll Projection",
  "Viability Simulator",
  "DRE Scenario Simulator",
  "Decisão de Capital",
];
const missingNavItems = VISIBLE_NAV_ITEMS.filter(
  (item) => !ABOUT_TABS_BLOCK.includes(`"${item}"`) && !ABOUT_TABS_BLOCK.includes(`'${item}'`),
);
checkTrue(
  "about_modal_includes_all_visible_nav_items",
  missingNavItems.length === 0,
  `AboutModal tabs must list all 13 visible nav items. Missing: ${missingNavItems.join(", ") || "none"}`,
);

// ── Section C: Core panels still exist ───────────────────────────────────────
console.log("\nSection C — Core Panels Still Exist");

// Check 5: Executive interpretation panel
const execPanel = readFile(
  "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx",
);
checkTrue(
  "executive_interpretation_panel_exists",
  execPanel.length > 100 &&
    execPanel.includes("Executive Simulator Interpretation") &&
    execPanel.includes("Decision support, not recommendation"),
  "DreExecutiveInterpretationPanel must still exist with expected content",
);

// Check 6: Scope & Source Boundary
const scopePanel = readFile("src/components/dreSimulator/DreScopeBoundaryPanel.tsx");
checkTrue(
  "scope_source_boundary_panel_exists",
  scopePanel.length > 100 &&
    scopePanel.includes("DRE Operating Layer") &&
    scopePanel.includes("Capital / Investment Layer") &&
    scopePanel.includes("Source Governance"),
  "DreScopeBoundaryPanel must still exist with all three boundary sections",
);

// ── Section D: Forbidden language absent ─────────────────────────────────────
console.log("\nSection D — Forbidden Language Absent");

// Check 7
const hasForbiddenLanguage =
  /\b(winner|best scenario|recommended scenario|final recommendation|is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|board[\s-]ratification\s+complete|ratification\s+approved|decision\s+complete)\b/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_forbidden_winner_approval_ratification_language",
  hasForbiddenLanguage,
  "Display sources must not contain affirmative winner/approval/ratification-complete language",
);

// ── Section E: Governance flags unchanged ─────────────────────────────────────
console.log("\nSection E — Governance Flags Unchanged");

// Check 8
checkTrue(
  "governance_flags_remain_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false && BOARD_RATIFICATION_READY === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE=${FINANCE_SOURCE_CLOSURE_COMPLETE}, BOARD_RATIFICATION_READY=${BOARD_RATIFICATION_READY} — both must remain false`,
);

// ── Section F: F-code status ──────────────────────────────────────────────────
console.log("\nSection F — F-code Status");

// Check 9: F02 remains resolved
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue(
  "f02_remains_resolved",
  f02InOpen === undefined,
  `F02 must remain resolved — found in openItems: ${f02InOpen !== undefined}`,
);

// Check 10: F01/F03/F04/F05/F06 remain open and non-blocking
const EXPECTED_OPEN_KEYS = [
  "outras_receitas_reajuste",
  "tuition_source_provenance",
  "discount_schedule_provenance",
  "enrollment_baseline_parity",
  "instructional_capacity_payroll_sync",
];
const openKeys = DRE_GOVERNANCE_READINESS.openItems.map((i) => i.key);
const allFcodesPresent = EXPECTED_OPEN_KEYS.every((k) => openKeys.includes(k));
const allNonBlocking = EXPECTED_OPEN_KEYS.every((k) => {
  const item = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === k);
  return item?.blocksEngineCalculation === false;
});
checkTrue(
  "f01_f03_f04_f05_f06_open_and_non_blocking",
  allFcodesPresent && allNonBlocking,
  `F01/F03/F04/F05/F06 must all be present in openItems and non-blocking — present: ${allFcodesPresent}, non-blocking: ${allNonBlocking}`,
);

// ── Section G: Formula and source files unchanged ─────────────────────────────
console.log("\nSection G — Formula and Source Files Unchanged");

const changedFiles = gitDiffFiles();

// Check 11: DRE formula and Capital Decision engine files not changed
const DRE_FORMULA_FILES = [
  "src/features/rio-scenario-resilience/model/dreEngine.ts",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts",
  "src/features/rio-scenario-resilience/model/receitaEngine.ts",
  "src/features/rio-scenario-resilience/model/capexScheduleEngine.ts",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts",
];
const dreFormulaFilesChanged = DRE_FORMULA_FILES.filter((f) =>
  changedFiles.some((c) => c.includes(f.split("/").pop()!)),
);
checkTrue(
  "dre_formula_capital_engine_files_unchanged",
  dreFormulaFilesChanged.length === 0,
  `DRE formula/Capital Decision engine files must not be changed: ${dreFormulaFilesChanged.join(", ") || "none changed"}`,
);

// Check 12: Staffing calculation and source-data files not changed
const STAFFING_SOURCE_PROTECTED = [
  "src/components/sections/StaffingTab.tsx",
  "src/hooks/useStaffingLogic.ts",
  "src/features/rio-scenario-resilience/model/payrollAdapter.ts",
  "src/features/rio-scenario-resilience/model/msHsStaffingReadiness.ts",
];
const staffingFilesChanged = STAFFING_SOURCE_PROTECTED.filter((f) =>
  changedFiles.some((c) => c.includes(f.split("/").pop()!)),
);
checkTrue(
  "staffing_source_data_files_unchanged",
  staffingFilesChanged.length === 0,
  `Staffing/source-data files must not be changed: ${staffingFilesChanged.join(", ") || "none changed"}`,
);

// ── Section H: Aggregate count ────────────────────────────────────────────────
console.log("\nSection H — Aggregate Count");

const EXPECTED_TOTAL = 14;
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
  `\n${finalIcon} Phase 15O board-visible-flow validation: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
