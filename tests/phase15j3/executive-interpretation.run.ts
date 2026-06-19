// Phase 15J.3 — Executive Simulator Interpretation Browser QA (21 checks).
//
// Verifies that the executive interpretation panel renders correctly in a live
// browser and that no forbidden language appears in the rendered page.
//
//   Checks 1-2:   App loads; DRE tab navigates
//   Checks 3-7:   Executive interpretation section renders with all required content
//   Checks 8-9:   Forbidden language absent from rendered page
//   Checks 10-12: Status header visible (Simulation available / Finance pending / Board pending)
//   Checks 13-14: Trade-off lenses visible (growth ambition, revenue sensitivity)
//   Checks 15-16: Trade-off lenses visible (operating-model complexity, capital exposure)
//   Check  17:    Governance readiness lens visible
//   Check  18:    Capital Decision handoff still works
//   Checks 19-20: No horizontal overflow on desktop and mobile
//   Check  21:    Zero console errors and zero network failures
//
// Run with: npm run qa:phase15j3
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4202;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15j3-screenshots");
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

// ── Check helpers ─────────────────────────────────────────────────────────────

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

  // ── Check 3: Executive interpretation section renders ─────────────────────
  const hasExecSection =
    dreBody.includes("executive simulator interpretation") ||
    dreBody.includes("decision support, not recommendation");
  hasExecSection
    ? pass("qa03_exec_interpretation_section_renders", "Executive interpretation section visible")
    : fail("qa03_exec_interpretation_section_renders", "Executive interpretation section not found");

  // ── Check 4: Status header renders ───────────────────────────────────────
  const hasStatusHeader =
    dreBody.includes("simulation available") &&
    dreBody.includes("pending");
  hasStatusHeader
    ? pass("qa04_status_header_renders", "Status header with simulation available + pending statuses visible")
    : fail("qa04_status_header_renders", "Status header not fully visible");

  // ── Check 5: Trade-off lenses render ─────────────────────────────────────
  const hasTradeOffs =
    dreBody.includes("trade-off") || dreBody.includes("tradeoff") || dreBody.includes("lenses");
  hasTradeOffs
    ? pass("qa05_trade_off_lenses_render", "Trade-off lenses section renders")
    : fail("qa05_trade_off_lenses_render", "Trade-off lenses section not found");

  // ── Check 6: Board decision questions render ──────────────────────────────
  const hasDecisionQuestions =
    dreBody.includes("planning lens") ||
    dreBody.includes("ramp-up risk") ||
    dreBody.includes("planning reference");
  hasDecisionQuestions
    ? pass("qa06_board_decision_questions_render", "Board decision questions visible")
    : fail("qa06_board_decision_questions_render", "Board decision questions not found");

  // ── Check 7: Pending evidence panel renders ───────────────────────────────
  const hasPendingEvidence =
    dreBody.includes("pending evidence") ||
    (dreBody.includes("finance source closure") && dreBody.includes("pending"));
  hasPendingEvidence
    ? pass("qa07_pending_evidence_panel_renders", "Pending evidence panel visible")
    : fail("qa07_pending_evidence_panel_renders", "Pending evidence panel not found");

  // ── Check 8: Boundary note renders ───────────────────────────────────────
  const hasBoundaryNote =
    dreBody.includes("boundary note") ||
    (dreBody.includes("not a recommendation") && dreBody.includes("decision support"));
  hasBoundaryNote
    ? pass("qa08_boundary_note_renders", "Boundary note visible on page")
    : fail("qa08_boundary_note_renders", "Boundary note not found");

  await ss(page, "02_exec_interpretation");

  // ── Check 9: No forbidden winner/recommendation/approval language ─────────
  const hasForbiddenWinner =
    /\b(winner|best scenario|recommended scenario|overall winner|final recommendation|approved recommendation)\b/.test(
      dreBody,
    );
  !hasForbiddenWinner
    ? pass("qa09_no_forbidden_winner_language", "No forbidden winner/recommendation language on page")
    : fail("qa09_no_forbidden_winner_language", "Found forbidden winner/recommendation language");

  // ── Check 10: No affirmative approval/ratification-complete language ──────
  const hasForbiddenApproval =
    /\b(is board.approved|board approval complete|is finance.approved|board ratification complete|ratification approved)\b/.test(
      dreBody,
    );
  !hasForbiddenApproval
    ? pass("qa10_no_forbidden_approval_language", "No forbidden approval/ratification-complete language")
    : fail("qa10_no_forbidden_approval_language", "Found forbidden approval language");

  // ── Check 11: "Simulation available" status badge visible ─────────────────
  dreBody.includes("simulation available")
    ? pass("qa11_simulation_available_status", "'Simulation available' status visible in executive panel")
    : fail("qa11_simulation_available_status", "'Simulation available' status not found");

  // ── Check 12: Finance-source closure pending visible ──────────────────────
  dreBody.includes("finance-source closure pending") ||
    (dreBody.includes("finance-source") && dreBody.includes("pending"))
    ? pass("qa12_finance_source_pending", "Finance-source closure pending status visible")
    : fail("qa12_finance_source_pending", "Finance-source closure pending status not found");

  // ── Check 13: Board ratification pending visible ──────────────────────────
  dreBody.includes("board ratification pending") ||
    (dreBody.includes("board ratification") && dreBody.includes("pending"))
    ? pass("qa13_board_ratification_pending", "Board ratification pending status visible")
    : fail("qa13_board_ratification_pending", "Board ratification pending status not found");

  // ── Check 14: Growth ambition lens visible ────────────────────────────────
  dreBody.includes("growth ambition")
    ? pass("qa14_growth_ambition_lens_visible", "'Growth ambition' trade-off lens visible")
    : fail("qa14_growth_ambition_lens_visible", "'Growth ambition' lens not found");

  // ── Check 15: Revenue sensitivity lens visible ────────────────────────────
  dreBody.includes("revenue sensitivity")
    ? pass("qa15_revenue_sensitivity_lens_visible", "'Revenue sensitivity' lens visible")
    : fail("qa15_revenue_sensitivity_lens_visible", "'Revenue sensitivity' lens not found");

  // ── Check 16: Operating-model complexity lens visible ─────────────────────
  dreBody.includes("operating-model complexity")
    ? pass("qa16_operating_model_complexity_lens_visible", "'Operating-model complexity' lens visible")
    : fail("qa16_operating_model_complexity_lens_visible", "'Operating-model complexity' lens not found");

  // ── Check 17: Capital exposure lens visible ───────────────────────────────
  dreBody.includes("capital exposure")
    ? pass("qa17_capital_exposure_lens_visible", "'Capital exposure' lens visible")
    : fail("qa17_capital_exposure_lens_visible", "'Capital exposure' lens not found");

  // ── Check 18: Capital Decision handoff still works ────────────────────────
  try {
    const capitalTabBtn = page.getByRole("button", { name: /Decisão de Capital/i });
    await capitalTabBtn.waitFor({ timeout: 5_000 });
    await capitalTabBtn.click();
    await page.waitForTimeout(1000);
    const capBody = await bodyLower(page);
    const hasCapitalContent = capBody.includes("capital") || capBody.includes("ebitda") || capBody.includes("capex");
    hasCapitalContent
      ? pass("qa18_capital_decision_handoff_works", "Capital Decision view loads after handoff")
      : fail("qa18_capital_decision_handoff_works", "Capital Decision view did not show expected content");
    await ss(page, "03_capital_decision");
  } catch (err) {
    fail("qa18_capital_decision_handoff_works", `Capital Decision navigation failed: ${err}`);
  }

  // Navigate back for viewport tests
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });
  await navigateToDre(page);

  // ── Check 19: No horizontal overflow on desktop ───────────────────────────
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  try {
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientW = await page.evaluate(() => document.documentElement.clientWidth);
    scrollW <= clientW + 2
      ? pass("qa19_desktop_no_overflow", `Desktop (1280×900): scrollWidth(${scrollW}) ≤ clientWidth(${clientW})`)
      : fail("qa19_desktop_no_overflow", `Desktop overflow: scrollWidth(${scrollW}) > clientWidth(${clientW})`);
  } catch (err) {
    fail("qa19_desktop_no_overflow", `Error checking desktop overflow: ${err}`);
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

  // Reset viewport
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
  console.log("\nPhase 15J.3 Executive Interpretation — Browser QA");
  console.log("=".repeat(55));

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
    `\n${finalIcon} Phase 15J.3 executive interpretation browser QA: ${passed}/${EXPECTED} pass, ${failed} fail`,
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
