// Phase 15O — Board-Ready Visible App Flow Browser QA (27 checks).
//
// Verifies that the three visible-flow defects are corrected in the running app
// and that core board-facing panels remain functional.
//
//   Checks 1-2:   App loads; primary navigation renders
//   Check  3:     "Staffing Model" is NOT visible in primary navigation
//   Check  4:     AboutModal can open via the visible "ABOUT THIS MODEL" button
//   Check  5:     "Staffing Model" is absent from the AboutModal text
//   Check  6:     All 13 current visible navigation items are listed in the modal
//   Check  7:     DRE Simulator still renders
//   Check  8:     Compact governance summary renders (data-testid scoped)
//   Check  9:     "Simulation available" in governance summary
//   Check 10:     "Finance-source closure pending" in governance summary
//   Check 11:     "Board ratification pending" in governance summary
//   Check 12:     Non-blocking pending count sentence in governance summary
//   Check 13:     "Source-status warning count" absent from governance summary
//   Check 14:     "blocksenginecalculation" absent from governance summary
//   Check 15:     "Methodology & Source Status" details layer openable
//   Check 16:     F-code descriptions visible in details after opening
//   Check 17:     No forbidden approval/ratification-complete language in DRE tab
//   Check 18:     Executive interpretation panel still renders
//   Check 19:     Scope & Source Boundary still renders
//   Check 20:     Capital Decision handoff still works
//   Check 21:     Corrected visible-flow issues are not present
//   Checks 22-24: No horizontal overflow on desktop, tablet, mobile
//   Checks 25-26: No console errors, no failed local module/network requests
//   Check  27:    QA aggregate count is exact
//
// Run with: npm run qa:phase15o
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4215;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15o-screenshots");
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

async function navigateTo(page: Page, name: RegExp): Promise<boolean> {
  try {
    const btn = page.getByRole("button", { name });
    await btn.waitFor({ timeout: 10_000 });
    await btn.click();
    await page.waitForTimeout(800);
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
    if (
      !url.includes("favicon") &&
      (url.includes("localhost") || url.includes("127.0.0.1"))
    ) {
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

  // ── Check 2: Primary navigation renders ───────────────────────────────────
  const navVisible = await page
    .locator('nav[aria-label="Model sections"]')
    .isVisible()
    .catch(() => false);
  navVisible
    ? pass("qa02_primary_nav_renders", "Primary navigation element is visible")
    : fail("qa02_primary_nav_renders", "Primary navigation element not found");

  await ss(page, "01_cover");

  // ── Check 3: "Staffing Model" NOT in primary navigation ───────────────────
  const navElement = page.locator('nav[aria-label="Model sections"]');
  let navText = "";
  try {
    navText = (await navElement.innerText()).toLowerCase();
  } catch {
    navText = "";
  }
  !navText.includes("staffing model")
    ? pass("qa03_staffing_model_absent_from_nav", "'Staffing Model' is absent from primary navigation")
    : fail("qa03_staffing_model_absent_from_nav", "'Staffing Model' is still visible in primary navigation");

  // ── Check 4: AboutModal can open via the visible button ───────────────────
  let modalText = "";
  try {
    const aboutBtn = page.getByRole("button", { name: /about this model/i });
    await aboutBtn.waitFor({ timeout: 8_000 });
    await aboutBtn.click();
    await page.waitForTimeout(600);
    const modal = page.locator('[class*="fixed"][class*="inset-0"]').first();
    await modal.waitFor({ timeout: 5_000 });
    modalText = (await modal.innerText().catch(() => "")).toLowerCase();
    const modalHasContent = modalText.includes("what each tab does");
    modalHasContent
      ? pass("qa04_about_modal_opens", "AboutModal opens and shows 'What each tab does'")
      : fail("qa04_about_modal_opens", "AboutModal opened but did not show expected content");
    await ss(page, "02_about_modal");
    // Close the modal
    const closeBtn = modal.locator("button").first();
    await closeBtn.click().catch(() => {});
    await page.waitForTimeout(400);
  } catch (err) {
    fail("qa04_about_modal_opens", `AboutModal could not be opened: ${err}`);
    await ss(page, "02_about_modal_fail");
  }

  // ── Check 5: "Staffing Model" absent from AboutModal ─────────────────────
  !modalText.includes("staffing model")
    ? pass("qa05_about_modal_no_staffing_model", "'Staffing Model' is absent from AboutModal text")
    : fail("qa05_about_modal_no_staffing_model", "'Staffing Model' is still present in AboutModal text");

  // ── Check 6: Current visible nav items represented in AboutModal ──────────
  const EXPECTED_NAV_ITEMS = [
    "cover",
    "cenários da oferta",
    "executive org design",
    "hiring profile cards",
    "early years",
    "lower school",
    "middle school",
    "high school",
    "load calculator",
    "payroll projection",
    "viability simulator",
    "dre scenario simulator",
    "decisão de capital",
  ];
  const missingInModal = EXPECTED_NAV_ITEMS.filter((item) => !modalText.includes(item));
  missingInModal.length === 0
    ? pass("qa06_about_modal_nav_items_present", "All 13 current navigation items are listed in AboutModal")
    : fail("qa06_about_modal_nav_items_present", `AboutModal missing items: ${missingInModal.join(", ")}`);

  // ── Check 7: DRE Simulator still renders ─────────────────────────────────
  const dreLoaded = await navigateTo(page, /DRE Scenario Simulator/i);
  dreLoaded
    ? pass("qa07_dre_simulator_renders", "DRE Scenario Simulator tab loads")
    : fail("qa07_dre_simulator_renders", "DRE Scenario Simulator tab failed to load");

  await ss(page, "03_dre_tab");
  const dreBody = await bodyLower(page);

  // ── Checks 8-17: Governance summary refactor ──────────────────────────────
  const govSummary = page.locator('[data-testid="dre-governance-summary"]');
  let govText = "";
  try {
    govText = (await govSummary.innerText().catch(() => "")).toLowerCase();
  } catch {
    govText = "";
  }

  // ── Check 8: Compact governance summary renders ───────────────────────────
  govText.includes("governance status")
    ? pass("qa_gov01_compact_summary_renders", "Compact governance summary renders with 'Governance Status' heading")
    : fail("qa_gov01_compact_summary_renders", "'Governance Status' heading not found in governance summary element");

  // ── Check 9: "Simulation available" in governance summary ─────────────────
  govText.includes("simulation available")
    ? pass("qa_gov02_sim_available_in_summary", "'Simulation available' found in governance summary")
    : fail("qa_gov02_sim_available_in_summary", "'Simulation available' not found in governance summary");

  // ── Check 10: "Finance-source closure pending" in governance summary ───────
  govText.includes("finance-source closure pending")
    ? pass("qa_gov03_finance_pending_in_summary", "'Finance-source closure pending' found in governance summary")
    : fail("qa_gov03_finance_pending_in_summary", "'Finance-source closure pending' not found in governance summary");

  // ── Check 11: "Board ratification pending" in governance summary ──────────
  govText.includes("board ratification pending")
    ? pass("qa_gov04_board_pending_in_summary", "'Board ratification pending' found in governance summary")
    : fail("qa_gov04_board_pending_in_summary", "'Board ratification pending' not found in governance summary");

  // ── Check 12: Non-blocking pending count in governance summary ────────────
  govText.includes("non-blocking source-governance items remain pending")
    ? pass("qa_gov05_nonblocking_count_in_flow", "Non-blocking pending count sentence found in governance summary")
    : fail("qa_gov05_nonblocking_count_in_flow", "Non-blocking pending count sentence not found in governance summary");

  // ── Check 13: "Source-status warning count" absent from governance summary ─
  !govText.includes("source-status warning count")
    ? pass("qa_gov06_no_source_status_warning", "'Source-status warning count' is absent from governance summary")
    : fail("qa_gov06_no_source_status_warning", "'Source-status warning count' still present in governance summary");

  // ── Check 14: "blocksenginecalculation" absent from governance summary ────
  !govText.includes("blocksenginecalculation")
    ? pass("qa_gov07_no_blocks_engine_in_flow", "'blocksenginecalculation' is absent from governance summary")
    : fail("qa_gov07_no_blocks_engine_in_flow", "'blocksenginecalculation' visible in governance summary");

  // ── Check 15: Details layer openable ─────────────────────────────────────
  try {
    const detailsBtn = govSummary.getByRole("button", { name: /methodology/i });
    await detailsBtn.waitFor({ timeout: 5_000 });
    await detailsBtn.click();
    await page.waitForTimeout(500);
    pass("qa_gov08_details_openable", "'Methodology & Source Status' details layer opened successfully");
  } catch (err) {
    fail("qa_gov08_details_openable", `Details layer button not found or not clickable: ${err}`);
  }

  // ── Check 16: F-code descriptions visible in details after opening ─────────
  try {
    const govTextExpanded = (await govSummary.innerText().catch(() => "")).toLowerCase();
    govTextExpanded.includes("c9 source/index pending")
      ? pass("qa_gov09_fcodes_in_details", "F-code detail 'c9 source/index pending' visible after expanding details layer")
      : fail("qa_gov09_fcodes_in_details", "'c9 source/index pending' not visible after expanding details layer");
    await ss(page, "03b_governance_details");
  } catch (err) {
    fail("qa_gov09_fcodes_in_details", `Error reading governance details: ${err}`);
  }

  // ── Check 17: No forbidden language in DRE tab body ───────────────────────
  const FORBIDDEN_DRE_PATTERN =
    /\b(winner|best scenario|recommended scenario|final recommendation|is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|board[\s-]ratification\s+complete|ratification\s+approved|decision\s+complete)\b/i;
  !FORBIDDEN_DRE_PATTERN.test(dreBody)
    ? pass("qa_gov10_no_forbidden_in_dre", "No forbidden approval/ratification-complete language in DRE tab body")
    : fail("qa_gov10_no_forbidden_in_dre", "Forbidden language found in DRE tab body — check FORBIDDEN_DRE_PATTERN matches");

  // ── Check 18 (was 8): Executive interpretation panel still renders ──────────
  const hasExecPanel =
    dreBody.includes("executive simulator interpretation") ||
    dreBody.includes("simulation available") ||
    dreBody.includes("decision support, not recommendation");
  hasExecPanel
    ? pass("qa08_exec_interpretation_renders", "Executive interpretation panel visible")
    : fail("qa08_exec_interpretation_renders", "Executive interpretation panel not found");

  // ── Check 9: Scope & Source Boundary still renders ────────────────────────
  const hasScopeBoundary =
    dreBody.includes("scope & source boundary") || dreBody.includes("dre operating layer");
  hasScopeBoundary
    ? pass("qa09_scope_boundary_renders", "Scope & Source Boundary section visible")
    : fail("qa09_scope_boundary_renders", "Scope & Source Boundary section not found");

  // ── Check 10: Capital Decision handoff still works ────────────────────────
  try {
    const capitalBtn = page.getByRole("button", { name: /Decisão de Capital/i });
    await capitalBtn.waitFor({ timeout: 5_000 });
    await capitalBtn.click();
    await page.waitForTimeout(800);
    const capBody = await bodyLower(page);
    const hasCapitalContent =
      capBody.includes("capital") || capBody.includes("ebitda") || capBody.includes("capex");
    hasCapitalContent
      ? pass("qa10_capital_decision_handoff_works", "Capital Decision view loads with content")
      : fail("qa10_capital_decision_handoff_works", "Capital Decision view did not show expected content");
    await ss(page, "04_capital_decision");
  } catch (err) {
    fail("qa10_capital_decision_handoff_works", `Capital Decision navigation failed: ${err}`);
  }

  // Navigate to Payroll for check 11
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });
  await navigateTo(page, /Payroll Projection/i);
  const payrollBody = await bodyLower(page);

  // ── Check 11: Corrected visible-flow issues not present ───────────────────
  const hasStaleStaffingRef = payrollBody.includes("independent from the staffing model tab");
  !hasStaleStaffingRef
    ? pass("qa11_corrected_visible_flow_clean", "Stale 'Staffing Model tab' reference absent from Payroll view")
    : fail("qa11_corrected_visible_flow_clean", "Stale 'Staffing Model tab' reference still visible in Payroll view");

  await ss(page, "05_payroll_tab");

  // Navigate to DRE for overflow checks
  await navigateTo(page, /DRE Scenario Simulator/i);
  await page.waitForTimeout(500);

  // ── Check 12: No horizontal overflow on desktop ───────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa12_desktop_no_overflow", `Desktop (1280×900): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa12_desktop_no_overflow", `Desktop overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa12_desktop_no_overflow", `Error: ${err}`);
  }

  // ── Check 13: No horizontal overflow on tablet ────────────────────────────
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa13_tablet_no_overflow", `Tablet (1024×768): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa13_tablet_no_overflow", `Tablet overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa13_tablet_no_overflow", `Error: ${err}`);
  }

  // ── Check 14: No horizontal overflow on mobile ────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    await ss(page, "06_mobile");
    scrollW <= clientW + 2
      ? pass("qa14_mobile_no_overflow", `Mobile (390×844): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa14_mobile_no_overflow", `Mobile overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa14_mobile_no_overflow", `Error: ${err}`);
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Check 15: No console errors ───────────────────────────────────────────
  if (JS_ERRORS.length > 0) {
    console.log(`\n  [warn] JS errors (${JS_ERRORS.length}): ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }
  JS_ERRORS.length === 0
    ? pass("qa15_no_console_errors", "No JavaScript console errors")
    : fail("qa15_no_console_errors", `${JS_ERRORS.length} console error(s) detected`);

  // ── Check 16: No failed local module/network requests ─────────────────────
  NETWORK_FAILURES.length === 0
    ? pass("qa16_no_network_failures", "No failed local module or network requests")
    : fail("qa16_no_network_failures", `${NETWORK_FAILURES.length} network failure(s): ${NETWORK_FAILURES.slice(0, 2).join("; ")}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15O Board-Ready Visible App Flow — Browser QA");
  console.log("=".repeat(52));

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

  const EXPECTED = 27;
  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter((v) => v === true).length;
  const failed = totalChecks - passed;

  // Check 17: Aggregate count
  if (totalChecks === EXPECTED - 1 && failed === 0) {
    console.log(`  ✓ qa17_qa_aggregate_count_exact (${EXPECTED} checks)`);
    RESULTS["qa17_qa_aggregate_count_exact"] = true;
  } else {
    console.log(
      `  ✗ qa17_qa_aggregate_count_exact — expected ${EXPECTED - 1} checks before self-check, got ${totalChecks}`,
    );
    RESULTS["qa17_qa_aggregate_count_exact"] = false;
    ERRORS.push(
      `qa17_qa_aggregate_count_exact: expected ${EXPECTED - 1} checks before self-check, got ${totalChecks}`,
    );
  }

  const finalPassed = Object.values(RESULTS).filter((v) => v === true).length;
  const finalFailed = Object.values(RESULTS).length - finalPassed;
  const finalIcon = finalFailed === 0 && finalPassed >= EXPECTED ? "✓" : "✗";

  console.log(
    `\n${finalIcon} Phase 15O board-visible-flow browser QA: ${finalPassed}/${EXPECTED} pass, ${finalFailed} fail`,
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
