// Phase 15M — Simulator Presentation Flow & Scope Boundary Cleanup (20 checks).
//
// Verifies that the Scope & Source Boundary panel has been updated from stale
// phase-based framing to architecture-based framing, that forbidden language is
// absent, and that no formula, source-data, or governance flag was changed.
//
//   Section A — Scope boundary file presence (checks 1-3)
//     1. DreScopeBoundaryPanel.tsx exists
//     2. "Included in Phase 14" absent from relevant display sources
//     3. "Excluded until Phase 15" absent from relevant display sources
//
//   Section B — New architecture headings present (checks 4-7)
//     4. "DRE Operating Layer" appears in the panel
//     5. "Capital / Investment Layer" appears in the panel
//     6. "Source Governance" appears in the panel
//     7. "outside DRE EBITDA" or equivalent appears in the panel
//
//   Section C — DRE Operating Layer content (check 8)
//     8. All six required DRE operating items present
//        (Enrollment, Tuition, Receita/ROL, FOPAG/payroll, Service Contracts, EBITDA)
//
//   Section D — Capital / Investment Layer content (check 9)
//     9. CAPEX, cash flow after CAPEX, and investment-analysis metrics present
//
//   Section E — Source governance content (check 10)
//    10. v8 PnL/DRE workbook, Service Contracts as DRE cost lines,
//        FOPAG/payroll engine, and audit-only/superseded language present
//
//   Section F — Absent stale/forbidden items (checks 11-12)
//    11. "Tier" is absent as a standalone item from the scope boundary panel
//    12. Forbidden winner/recommendation/approval/ratification language absent
//
//   Section G — Governance flags unchanged (checks 13-14)
//    13. FINANCE_SOURCE_CLOSURE_COMPLETE remains false
//    14. BOARD_RATIFICATION_READY remains false
//
//   Section H — F02/F01 item status (checks 15-16)
//    15. F02 (descontos_metodo_formula_base) absent from openItems
//    16. F01/F03/F04/F05/F06 remain open and non-blocking
//
//   Section I — Engine proxy checks (checks 17-19)
//    17. DRE engine file exports calculateDre (proxy: formula file intact)
//    18. Capital Decision engine exports calculateCapitalDecisionBridge (proxy)
//    19. Scope boundary panel does not import from engine or source-data files
//        (no formula changes required for a display-only cleanup)
//
//   Section J — Aggregate count (check 20)
//    20. Validator ran exactly 20 checks
//
// Note: Checks 17-18 are proxy content checks — the authoritative proof that
// engine files were not modified is git diff HEAD~1 in the final report.
//
// Run with: npm run validate:phase15m

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

const PANEL_PATH = "src/components/dreSimulator/DreScopeBoundaryPanel.tsx";
const PANEL = readFile(PANEL_PATH);
const PANEL_LOWER = PANEL.toLowerCase();

// Display sources for stale/forbidden language scans
const DISPLAY_SOURCE_PATHS = [
  PANEL_PATH,
  "src/components/sections/DreScenarioSimulatorTab.tsx",
  "src/components/dreSimulator/DreScenarioContextBanner.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx",
];

const allDisplayContent = DISPLAY_SOURCE_PATHS.map(readFile)
  .join("\n")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

const DRE_ENGINE_PATH = "src/features/rio-scenario-resilience/model/dreEngine.ts";
const CAPITAL_ENGINE_PATH =
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts";

// ── Section A: Scope boundary file presence ───────────────────────────────────
console.log("\nSection A — Scope Boundary File Presence");

// Check 1
checkTrue(
  "scope_boundary_panel_exists",
  exists(PANEL_PATH),
  `${PANEL_PATH} must exist`,
);

// Check 2
checkFalse(
  "no_included_in_phase_14_in_display_sources",
  /included in phase 14/i.test(allDisplayContent),
  '"Included in Phase 14" must be removed from all display sources',
);

// Check 3
checkFalse(
  "no_excluded_until_phase_15_in_display_sources",
  /excluded until phase 15/i.test(allDisplayContent),
  '"Excluded until Phase 15" must be removed from all display sources',
);

// ── Section B: New architecture headings present ──────────────────────────────
console.log("\nSection B — New Architecture Headings");

// Check 4
checkTrue(
  "dre_operating_layer_heading_present",
  PANEL_LOWER.includes("dre operating layer"),
  'Panel must include "DRE Operating Layer" heading',
);

// Check 5
checkTrue(
  "capital_investment_layer_heading_present",
  PANEL_LOWER.includes("capital / investment layer") ||
    PANEL_LOWER.includes("capital/investment layer"),
  'Panel must include "Capital / Investment Layer" heading',
);

// Check 6
checkTrue(
  "source_governance_heading_present",
  PANEL_LOWER.includes("source governance"),
  'Panel must include "Source Governance" heading',
);

// Check 7
checkTrue(
  "outside_dre_ebitda_language_present",
  PANEL_LOWER.includes("outside dre ebitda") || PANEL_LOWER.includes("outside dre"),
  'Panel must reference "outside DRE EBITDA" or equivalent',
);

// ── Section C: DRE Operating Layer content ────────────────────────────────────
console.log("\nSection C — DRE Operating Layer Content");

// Check 8: All six required items present
const hasEnrollment = PANEL_LOWER.includes("enrollment");
const hasTuition = PANEL_LOWER.includes("tuition");
const hasReceita = PANEL_LOWER.includes("receita") || PANEL_LOWER.includes("rol");
const hasFopag = PANEL_LOWER.includes("fopag") || PANEL_LOWER.includes("payroll");
const hasServiceContracts = PANEL_LOWER.includes("service contracts");
const hasEbitda = PANEL_LOWER.includes("ebitda");

checkTrue(
  "dre_operating_layer_required_items_present",
  hasEnrollment &&
    hasTuition &&
    hasReceita &&
    hasFopag &&
    hasServiceContracts &&
    hasEbitda,
  "DRE Operating Layer must list Enrollment, Tuition, Receita/ROL, FOPAG/payroll, Service Contracts, and EBITDA",
);

// ── Section D: Capital / Investment Layer content ─────────────────────────────
console.log("\nSection D — Capital / Investment Layer Content");

// Check 9
const hasCapex = PANEL_LOWER.includes("capex");
const hasCashFlowAfterCapex =
  PANEL_LOWER.includes("cash flow after capex") ||
  PANEL_LOWER.includes("cash-flow after capex");
const hasInvestmentMetrics =
  PANEL_LOWER.includes("investment-analysis metrics") ||
  PANEL_LOWER.includes("investment analysis metrics");

checkTrue(
  "capital_investment_layer_required_items_present",
  hasCapex && hasCashFlowAfterCapex && hasInvestmentMetrics,
  "Capital / Investment Layer must include CAPEX, cash flow after CAPEX, and investment-analysis metrics",
);

// ── Section E: Source governance content ──────────────────────────────────────
console.log("\nSection E — Source Governance Content");

// Check 10
const hasV8Workbook =
  PANEL_LOWER.includes("v8 pnl") ||
  PANEL_LOWER.includes("v8 pnl/dre") ||
  PANEL_LOWER.includes("source of truth for dre");
const hasServiceContractsDreLine = PANEL_LOWER.includes(
  "service contracts are category-tagged dre cost lines",
);
const hasFopagEngine =
  PANEL_LOWER.includes("fopag/payroll engine") || PANEL_LOWER.includes("fopag") && PANEL_LOWER.includes("payroll engine");
const hasAuditOnly =
  PANEL_LOWER.includes("audit-only") || PANEL_LOWER.includes("superseded");

checkTrue(
  "source_governance_required_content_present",
  hasV8Workbook && hasServiceContractsDreLine && hasFopagEngine && hasAuditOnly,
  "Source Governance must reference v8 PnL/DRE workbook, Service Contracts as DRE cost lines, FOPAG/payroll engine, and audit-only/superseded older extracts",
);

// ── Section F: Absent stale/forbidden items ───────────────────────────────────
console.log("\nSection F — Absent Stale / Forbidden Items");

// Check 11: "Tier" must not appear as a scope boundary item
// Strip JSX string literals from the panel and check for a standalone "Tier" list item
const panelJsxStrings = PANEL
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const hasTierAsListItem =
  /["'`>]\s*Tier\s*["'`<,]/.test(panelJsxStrings) ||
  /"Tier"/.test(panelJsxStrings);

checkFalse(
  "tier_absent_from_scope_boundary_panel",
  hasTierAsListItem,
  '"Tier" must not appear as a standalone item in the Scope & Source Boundary panel',
);

// Check 12: Forbidden winner/recommendation/approval/ratification language absent
const hasForbiddenLanguage =
  /\b(winner|best scenario|recommended scenario|final recommendation|is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|board[\s-]ratification\s+complete|ratification\s+approved|decision\s+complete)\b/i.test(
    allDisplayContent,
  );

checkFalse(
  "no_forbidden_winner_approval_ratification_language",
  hasForbiddenLanguage,
  "Display sources must not contain forbidden winner/recommendation/approval/ratification-complete language",
);

// ── Section G: Governance flags unchanged ─────────────────────────────────────
console.log("\nSection G — Governance Flags Unchanged");

// Check 13
checkTrue(
  "finance_source_closure_complete_remains_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE must remain false — got ${FINANCE_SOURCE_CLOSURE_COMPLETE}`,
);

// Check 14
checkTrue(
  "board_ratification_ready_remains_false",
  BOARD_RATIFICATION_READY === false,
  `BOARD_RATIFICATION_READY must remain false — got ${BOARD_RATIFICATION_READY}`,
);

// ── Section H: F02/F01 item status ────────────────────────────────────────────
console.log("\nSection H — F02 / F01–F06 Item Status");

// Check 15
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue(
  "f02_remains_resolved_and_absent_from_open_items",
  f02InOpen === undefined,
  `F02 (descontos_metodo_formula_base) must remain resolved — found: ${f02InOpen !== undefined}`,
);

// Check 16
const EXPECTED_OPEN_KEYS = [
  "outras_receitas_reajuste",
  "tuition_source_provenance",
  "discount_schedule_provenance",
  "enrollment_baseline_parity",
  "instructional_capacity_payroll_sync",
];
const allFivePresent = EXPECTED_OPEN_KEYS.every((key) =>
  DRE_GOVERNANCE_READINESS.openItems.some((item) => item.key === key),
);
const allNonBlocking = DRE_GOVERNANCE_READINESS.openItems.every(
  (item) => item.blocksEngineCalculation === false,
);
checkTrue(
  "f01_f03_f04_f05_f06_remain_open_and_non_blocking",
  allFivePresent && allNonBlocking,
  "F01/F03/F04/F05/F06 must remain in openItems with blocksEngineCalculation: false",
);

// ── Section I: Engine proxy checks ────────────────────────────────────────────
console.log("\nSection I — Engine Proxy Checks (content-based)");

// Check 17: DRE engine still exports calculateDre
const dreEngine = readFile(DRE_ENGINE_PATH);
checkTrue(
  "dre_engine_calculateDre_export_intact",
  dreEngine.includes("export function calculateDre"),
  "dreEngine.ts must still export calculateDre (proxy for formula integrity)",
);

// Check 18: Capital Decision engine still exports calculateCapitalDecisionBridge
const capitalEngine = readFile(CAPITAL_ENGINE_PATH);
checkTrue(
  "capital_engine_calculateCapitalDecisionBridge_export_intact",
  capitalEngine.includes("export function calculateCapitalDecisionBridge"),
  "capitalDecisionEngine.ts must still export calculateCapitalDecisionBridge (proxy for formula integrity)",
);

// Check 19: Scope boundary panel imports only display-layer dependencies
// (no engine or source-data imports means no formula change was needed)
const panelImports = PANEL.split("\n")
  .filter((line) => line.startsWith("import"))
  .join("\n");
const hasEngineImport =
  panelImports.includes("dreEngine") ||
  panelImports.includes("capitalDecisionEngine") ||
  panelImports.includes("SourceData") ||
  panelImports.includes("sourceData");

checkFalse(
  "scope_boundary_panel_no_engine_or_source_data_imports",
  hasEngineImport,
  "DreScopeBoundaryPanel.tsx must not import engine or source-data files — it is a display-only component",
);

// ── Section J: Aggregate count ────────────────────────────────────────────────
console.log("\nSection J — Aggregate Count");

const EXPECTED_TOTAL = 20;
const totalBefore = passCount + failCount;

// Check 20: Self-check
if (totalBefore === EXPECTED_TOTAL - 1) {
  passCount++;
  console.log(`  ✓ validator_aggregate_count_exact (${EXPECTED_TOTAL} checks)`);
} else {
  failCount++;
  console.log(
    `  ✗ validator_aggregate_count_exact — expected ${EXPECTED_TOTAL - 1} checks before self-check, got ${totalBefore}`,
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────

const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";

console.log(
  `\n${finalIcon} Phase 15M scope boundary cleanup validation: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
