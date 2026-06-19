// Phase 15N — Hide Staffing Model from Primary Navigation Browser QA (14 checks).
//
// Verifies that "Staffing Model" no longer appears in primary navigation while
// all other tabs and panels remain functional.
//
//   Checks 1-2:   App loads; primary navigation renders
//   Check  3:     "Staffing Model" is NOT visible in primary navigation
//   Checks 4-7:   DRE Simulator, executive interpretation, scope boundary,
//                 and Capital Decision handoff still render
//   Check  8:     No blank screen (body has substantial content)
//   Checks 9-11:  No horizontal overflow on desktop, tablet, mobile
//   Checks 12-13: No console errors, no failed local module/network requests
//   Check  14:    QA aggregate count is exact
//
// Run with: npm run qa:phase15n
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4204;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15n-screenshots");
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
  const hasStaffingModelInNav = navText.includes("staffing model");
  !hasStaffingModelInNav
    ? pass("qa03_staffing_model_not_in_primary_nav", "'Staffing Model' is absent from primary navigation")
    : fail("qa03_staffing_model_not_in_primary_nav", "'Staffing Model' is still visible in primary navigation");

  // ── Check 4: DRE Simulator still renders ─────────────────────────────────
  const dreNavigated = await navigateToDre(page);
  dreNavigated
    ? pass("qa04_dre_simulator_renders", "DRE Scenario Simulator tab still loads")
    : fail("qa04_dre_simulator_renders", "DRE Scenario Simulator tab failed to load");

  await ss(page, "02_dre_tab");
  const dreBody = await bodyLower(page);

  // ── Check 5: Executive interpretation panel still renders ─────────────────
  const hasExecPanel =
    dreBody.includes("executive simulator interpretation") ||
    dreBody.includes("simulation available") ||
    dreBody.includes("decision support");
  hasExecPanel
    ? pass("qa05_exec_interpretation_renders", "Executive interpretation panel visible in DRE tab")
    : fail("qa05_exec_interpretation_renders", "Executive interpretation panel not found");

  // ── Check 6: Scope & Source Boundary still renders ────────────────────────
  const hasScopeBoundary =
    dreBody.includes("scope & source boundary") || dreBody.includes("dre operating layer");
  hasScopeBoundary
    ? pass("qa06_scope_boundary_renders", "Scope & Source Boundary section visible")
    : fail("qa06_scope_boundary_renders", "Scope & Source Boundary section not found");

  // ── Check 7: Capital Decision handoff still renders ───────────────────────
  try {
    const capitalBtn = page.getByRole("button", { name: /Decisão de Capital/i });
    await capitalBtn.waitFor({ timeout: 5_000 });
    await capitalBtn.click();
    await page.waitForTimeout(800);
    const capBody = await bodyLower(page);
    const hasCapitalContent =
      capBody.includes("capital") || capBody.includes("ebitda") || capBody.includes("capex");
    hasCapitalContent
      ? pass("qa07_capital_decision_handoff_renders", "Capital Decision view loads with content")
      : fail("qa07_capital_decision_handoff_renders", "Capital Decision view did not show expected content");
    await ss(page, "03_capital_decision");
  } catch (err) {
    fail("qa07_capital_decision_handoff_renders", `Capital Decision navigation failed: ${err}`);
  }

  // Navigate back for remaining checks
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });

  // ── Check 8: No blank screen ──────────────────────────────────────────────
  const bodyText = await bodyLower(page);
  const hasSubstantialContent = bodyText.length > 200;
  hasSubstantialContent
    ? pass("qa08_no_blank_screen", `Page body has ${bodyText.length} characters — not blank`)
    : fail("qa08_no_blank_screen", "Page body appears blank or near-empty");

  await navigateToDre(page);

  // ── Check 9: No horizontal overflow on desktop ────────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa09_desktop_no_overflow", `Desktop (1280×900): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa09_desktop_no_overflow", `Desktop overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa09_desktop_no_overflow", `Error: ${err}`);
  }

  // ── Check 10: No horizontal overflow on tablet ────────────────────────────
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa10_tablet_no_overflow", `Tablet (1024×768): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa10_tablet_no_overflow", `Tablet overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa10_tablet_no_overflow", `Error: ${err}`);
  }

  // ── Check 11: No horizontal overflow on mobile ────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    await ss(page, "04_mobile");
    scrollW <= clientW + 2
      ? pass("qa11_mobile_no_overflow", `Mobile (390×844): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa11_mobile_no_overflow", `Mobile overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa11_mobile_no_overflow", `Error: ${err}`);
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  // ── Check 12: No console errors ───────────────────────────────────────────
  if (JS_ERRORS.length > 0) {
    console.log(`\n  [warn] JS errors (${JS_ERRORS.length}): ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }
  JS_ERRORS.length === 0
    ? pass("qa12_no_console_errors", "No JavaScript console errors")
    : fail("qa12_no_console_errors", `${JS_ERRORS.length} console error(s) detected`);

  // ── Check 13: No failed local module/network requests ─────────────────────
  NETWORK_FAILURES.length === 0
    ? pass("qa13_no_network_failures", "No failed local module or network requests")
    : fail("qa13_no_network_failures", `${NETWORK_FAILURES.length} network failure(s): ${NETWORK_FAILURES.slice(0, 2).join("; ")}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15N Hide Staffing Model — Browser QA");
  console.log("=".repeat(46));

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

  const EXPECTED = 14;
  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter((v) => v === true).length;
  const failed = totalChecks - passed;

  // Check 14: Aggregate count
  if (totalChecks === EXPECTED - 1 && failed === 0) {
    console.log(`  ✓ qa14_qa_aggregate_count_exact (${EXPECTED} checks)`);
    RESULTS["qa14_qa_aggregate_count_exact"] = true;
  } else {
    console.log(
      `  ✗ qa14_qa_aggregate_count_exact — expected ${EXPECTED - 1} checks before self-check, got ${totalChecks}`,
    );
    RESULTS["qa14_qa_aggregate_count_exact"] = false;
    ERRORS.push(
      `qa14_qa_aggregate_count_exact: expected ${EXPECTED - 1} checks before self-check, got ${totalChecks}`,
    );
  }

  const finalPassed = Object.values(RESULTS).filter((v) => v === true).length;
  const finalFailed = Object.values(RESULTS).length - finalPassed;
  const finalIcon = finalFailed === 0 && finalPassed >= EXPECTED ? "✓" : "✗";

  console.log(
    `\n${finalIcon} Phase 15N hide-staffing-model browser QA: ${finalPassed}/${EXPECTED} pass, ${finalFailed} fail`,
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
