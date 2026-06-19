// Phase 15M — Scope Boundary Cleanup Browser QA (21 checks).
//
// Verifies that the updated Scope & Source Boundary section renders correctly
// in a live browser, stale phase labels are gone, and regressions are absent.
//
//   Checks 1-2:   App loads; DRE tab loads
//   Checks 3-6:   Scope & Source Boundary renders with all three architecture cards
//   Checks 7-9:   Stale phrases and Tier absent from rendered page
//   Checks 10-12: DRE Operating Layer content visible
//   Checks 13-14: Capital / Investment Layer content visible
//   Checks 15-15: Source Governance content visible
//   Check  16:    Forbidden winner/approval language absent
//   Check  17:    Scenario selectors still render
//   Check  18:    Capital Decision handoff still renders
//   Checks 19-21: No overflow on desktop/tablet/mobile, no errors
//
// Run with: npm run qa:phase15m
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4203;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15m-screenshots");
mkdirSync(SS_DIR, { recursive: true });

const ERRORS: string[] = [];
const RESULTS: Record<string, boolean | string> = {};
const JS_ERRORS: string[] = [];
const NETWORK_FAILURES: string[] = [];

// ── Server lifecycle ──────────────────────────────────────────────────────────

async function startServer(): Promise<ChildProcess> {
  const root = resolve(process.cwd());
  const proc = spawn(
    "npx",
    ["vite", "--port", String(QA_PORT), "--host", "127.0.0.1"],
    { cwd: root, stdio: "ignore", detached: false },
  );
  const start = Date.now();
  while (Date.now() - start < 40_000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.status < 500) break;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return proc;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pass(id: string, note: string) {
  RESULTS[id] = true;
  console.log(`  ✓ ${id}: ${note}`);
}

function fail(id: string, note: string) {
  RESULTS[id] = false;
  ERRORS.push(`${id}: ${note}`);
  console.log(`  ✗ ${id}: ${note}`);
}

async function bodyLower(page: Page): Promise<string> {
  return (await page.locator("body").innerText().catch(() => "")).toLowerCase();
}

async function navigateToDre(page: Page): Promise<boolean> {
  try {
    const btn = page.getByRole("button", { name: /DRE Scenario Simulator/i });
    await btn.waitFor({ timeout: 10_000 });
    await btn.click();
    await page.waitForTimeout(1000);
    return true;
  } catch {
    return false;
  }
}

async function ss(page: Page, name: string) {
  return page
    .screenshot({ path: join(SS_DIR, name + ".png"), fullPage: false })
    .catch(() => {});
}

// ── QA checks ─────────────────────────────────────────────────────────────────

async function runChecks(page: Page) {
  page.on("pageerror", (err) => JS_ERRORS.push(err.message));
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (!url.includes("favicon") && (url.includes("localhost") || url.includes("127.0.0.1"))) {
      NETWORK_FAILURES.push(url);
    }
  });

  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });

  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30_000 });
  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Check 1: App loads ────────────────────────────────────────────────────
  const appVisible = await page
    .locator("text=Strategic")
    .first()
    .isVisible()
    .catch(() => false);
  appVisible
    ? pass("qa01_app_loads", "App renders with heading visible")
    : fail("qa01_app_loads", "App did not render expected heading");

  // ── Check 2: DRE tab loads ────────────────────────────────────────────────
  const dreNavigated = await navigateToDre(page);
  dreNavigated
    ? pass("qa02_dre_tab_loads", "DRE Scenario Simulator tab navigated")
    : fail("qa02_dre_tab_loads", "Could not navigate to DRE Scenario Simulator tab");

  await ss(page, "01_dre_tab_initial");
  const dreBody = await bodyLower(page);

  // ── Check 3: Scope & Source Boundary section renders ─────────────────────
  const hasScopeBoundary =
    dreBody.includes("scope & source boundary") || dreBody.includes("scope and source boundary");
  hasScopeBoundary
    ? pass("qa03_scope_boundary_renders", "Scope & Source Boundary section visible on page")
    : fail("qa03_scope_boundary_renders", "Scope & Source Boundary section not found");

  // ── Check 4: DRE Operating Layer card renders ─────────────────────────────
  const hasDreOperatingLayer = dreBody.includes("dre operating layer");
  hasDreOperatingLayer
    ? pass("qa04_dre_operating_layer_renders", "'DRE Operating Layer' card visible")
    : fail("qa04_dre_operating_layer_renders", "'DRE Operating Layer' not found on page");

  // ── Check 5: Capital / Investment Layer card renders ──────────────────────
  const hasCapitalInvestmentLayer =
    dreBody.includes("capital / investment layer") ||
    dreBody.includes("capital/investment layer") ||
    (dreBody.includes("capital") && dreBody.includes("investment layer"));
  hasCapitalInvestmentLayer
    ? pass("qa05_capital_investment_layer_renders", "'Capital / Investment Layer' card visible")
    : fail("qa05_capital_investment_layer_renders", "'Capital / Investment Layer' not found");

  // ── Check 6: Source Governance card renders ───────────────────────────────
  const hasSourceGovernance = dreBody.includes("source governance");
  hasSourceGovernance
    ? pass("qa06_source_governance_renders", "'Source Governance' card visible")
    : fail("qa06_source_governance_renders", "'Source Governance' not found on page");

  await ss(page, "02_scope_boundary");

  // ── Check 7: "Included in Phase 14" absent ───────────────────────────────
  const hasIncludedPhase14 = dreBody.includes("included in phase 14");
  !hasIncludedPhase14
    ? pass("qa07_no_included_in_phase_14", "Stale phrase 'Included in Phase 14' absent from page")
    : fail("qa07_no_included_in_phase_14", "Found stale phrase 'Included in Phase 14' on page");

  // ── Check 8: "Excluded until Phase 15" absent ────────────────────────────
  const hasExcludedPhase15 = dreBody.includes("excluded until phase 15");
  !hasExcludedPhase15
    ? pass("qa08_no_excluded_until_phase_15", "Stale phrase 'Excluded until Phase 15' absent")
    : fail("qa08_no_excluded_until_phase_15", "Found stale phrase 'Excluded until Phase 15'");

  // ── Check 9: "Tier" absent as a standalone boundary item ─────────────────
  // Allow "Tier" in other contexts (e.g., investment analysis), but it should
  // not appear as a list item in the scope boundary section. We check that the
  // body in context of the boundary section doesn't list it.
  // Proxy: "tier" as a lone word in a boundary-item context
  const hasTierListItem =
    /\btier\b/.test(dreBody) &&
    dreBody.indexOf("tier") > dreBody.indexOf("scope & source boundary") &&
    dreBody.indexOf("tier") < dreBody.indexOf("dre operating layer") + 600;
  !hasTierListItem
    ? pass("qa09_tier_absent_from_scope_boundary_items", "'Tier' not found as scope boundary list item")
    : fail("qa09_tier_absent_from_scope_boundary_items", "'Tier' found as scope boundary list item");

  // ── Check 10: DRE Operating Layer — enrollment and tuition visible ────────
  const hasDreItems =
    dreBody.includes("enrollment") && dreBody.includes("tuition") && dreBody.includes("ebitda");
  hasDreItems
    ? pass("qa10_dre_operating_items_visible", "DRE Operating Layer items (enrollment, tuition, EBITDA) visible")
    : fail("qa10_dre_operating_items_visible", "DRE Operating Layer items not fully visible");

  // ── Check 11: DRE Operating Layer — FOPAG and Service Contracts visible ───
  const hasDreItems2 =
    dreBody.includes("fopag") || (dreBody.includes("payroll") && dreBody.includes("service contracts"));
  hasDreItems2
    ? pass("qa11_dre_operating_fopag_service_contracts_visible", "FOPAG/payroll and Service Contracts visible in DRE Operating Layer")
    : fail("qa11_dre_operating_fopag_service_contracts_visible", "FOPAG or Service Contracts not found");

  // ── Check 12: "outside DRE EBITDA" language visible ──────────────────────
  const hasOutsideDreEbitda =
    dreBody.includes("outside dre ebitda") || dreBody.includes("outside dre");
  hasOutsideDreEbitda
    ? pass("qa12_outside_dre_ebitda_visible", "'Outside DRE EBITDA' language visible on page")
    : fail("qa12_outside_dre_ebitda_visible", "'Outside DRE EBITDA' language not found");

  // ── Check 13: Capital / Investment Layer — CAPEX visible ─────────────────
  const hasCapexInLayer = dreBody.includes("capex bridge") || dreBody.includes("cash flow after capex");
  hasCapexInLayer
    ? pass("qa13_capital_layer_capex_visible", "CAPEX bridge / cash flow after CAPEX visible in Capital / Investment Layer")
    : fail("qa13_capital_layer_capex_visible", "Capital / Investment Layer CAPEX items not found");

  // ── Check 14: Source Governance content visible ───────────────────────────
  const hasSourceGovContent =
    (dreBody.includes("v8") || dreBody.includes("source of truth")) &&
    (dreBody.includes("audit-only") || dreBody.includes("superseded"));
  hasSourceGovContent
    ? pass("qa14_source_governance_content_visible", "Source Governance content (v8 workbook, audit-only) visible")
    : fail("qa14_source_governance_content_visible", "Source Governance content not fully visible");

  // ── Check 15: Forbidden winner/approval language absent ───────────────────
  const hasForbiddenLanguage =
    /\b(winner|best scenario|recommended scenario|final recommendation|board approval complete|board ratification complete|is finance.approved|decision complete)\b/.test(
      dreBody,
    );
  !hasForbiddenLanguage
    ? pass("qa15_no_forbidden_winner_approval_language", "No forbidden winner/approval/ratification-complete language on page")
    : fail("qa15_no_forbidden_winner_approval_language", "Found forbidden language on page");

  // ── Check 16: Scenario selectors still render ─────────────────────────────
  const selectorCount = await page.locator("select").count();
  selectorCount >= 3
    ? pass("qa16_scenario_selectors_present", `${selectorCount} scenario selector(s) still render`)
    : fail("qa16_scenario_selectors_present", `Only ${selectorCount} selector(s) found — expected ≥3`);

  // ── Check 17: Capital Decision handoff still renders ─────────────────────
  try {
    const capitalBtn = page.getByRole("button", { name: /Decisão de Capital/i });
    await capitalBtn.waitFor({ timeout: 5_000 });
    await capitalBtn.click();
    await page.waitForTimeout(800);
    const capBody = await bodyLower(page);
    const hasCapitalContent =
      capBody.includes("capital") || capBody.includes("ebitda") || capBody.includes("capex");
    hasCapitalContent
      ? pass("qa17_capital_decision_handoff_renders", "Capital Decision view loads with content")
      : fail("qa17_capital_decision_handoff_renders", "Capital Decision view did not show expected content");
    await ss(page, "03_capital_decision");
  } catch (err) {
    fail("qa17_capital_decision_handoff_renders", `Capital Decision navigation failed: ${err}`);
  }

  // Navigate back to DRE for viewport tests
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });
  await navigateToDre(page);

  // ── Check 18: No horizontal overflow on desktop ───────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa18_desktop_no_overflow", `Desktop (1280×900): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa18_desktop_no_overflow", `Desktop overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa18_desktop_no_overflow", `Error checking desktop overflow: ${err}`);
  }

  // ── Check 19: No horizontal overflow on tablet ────────────────────────────
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa19_tablet_no_overflow", `Tablet (1024×768): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa19_tablet_no_overflow", `Tablet overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa19_tablet_no_overflow", `Error checking tablet overflow: ${err}`);
  }

  // ── Check 20: No horizontal overflow on mobile ────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    await ss(page, "04_mobile");
    scrollW <= clientW + 2
      ? pass("qa20_mobile_no_overflow", `Mobile (390×844): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa20_mobile_no_overflow", `Mobile overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa20_mobile_no_overflow", `Error checking mobile overflow: ${err}`);
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Check 21: Zero console errors and zero network failures ───────────────
  if (JS_ERRORS.length > 0) {
    console.log(`\n  [warn] JS errors (${JS_ERRORS.length}): ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }
  const zeroErrors = JS_ERRORS.length === 0 && NETWORK_FAILURES.length === 0;
  zeroErrors
    ? pass("qa21_zero_errors_and_failures", "No console errors, no network failures")
    : fail(
        "qa21_zero_errors_and_failures",
        `JS errors: ${JS_ERRORS.length}, network failures: ${NETWORK_FAILURES.length}`,
      );
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15M Scope Boundary Cleanup — Browser QA");
  console.log("=".repeat(50));

  let server: ChildProcess | null = null;
  let browser = null;

  try {
    console.log(`\nStarting dev server on port ${QA_PORT}...`);
    server = await startServer();
    console.log("Dev server ready.");

    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();

    await runChecks(page);
    await ctx.close();
  } catch (err) {
    ERRORS.push(`Harness error: ${String(err)}`);
    console.log(`  ✗ Harness error: ${err}`);
  } finally {
    if (browser) await (browser as import("playwright").Browser).close().catch(() => {});
    if (server) {
      server.kill();
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const EXPECTED = 21;
  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter((v) => v === true).length;
  const failed = totalChecks - passed;
  const finalIcon = failed === 0 && passed >= EXPECTED ? "✓" : "✗";

  console.log(
    `\n${finalIcon} Phase 15M scope boundary cleanup browser QA: ${passed}/${EXPECTED} pass, ${failed} fail`,
  );

  if (ERRORS.length > 0) {
    console.log("\nFailed checks:");
    ERRORS.forEach((e) => console.log(`  - ${e}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exitCode = 1;
});
