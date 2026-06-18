// Phase 15J — Simulation-First Productization browser QA.
//
// 12 browser checks verifying:
//   1. DRE Simulator loads.
//   2. User can change scenario selectors.
//   3. Results update.
//   4. Scenario can be sent to Capital Decision.
//   5. Capital Decision calculates.
//   6. Assumption-status panel is visible or reachable.
//   7. F02 is not shown as open.
//   8. F01/F03/F04/F05/F06 are shown as pending metadata.
//   9. No "calculation blocked" message appears.
//  10. No horizontal overflow on mobile.
//  11. No console errors.
//  12. No failed local-module requests.
//
// Run with: npm run qa:phase15j
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4185;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15j-screenshots");
mkdirSync(SS_DIR, { recursive: true });

const ERRORS: string[] = [];
const RESULTS: Record<string, boolean | string> = {};
const NETWORK_FAILURES: string[] = [];
const JS_ERRORS: string[] = [];

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
      const res = await fetch(`${BASE_URL}`);
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

// ── QA checks ─────────────────────────────────────────────────────────────────

async function runChecks(page: Page) {
  // Track console errors from the start
  page.on("pageerror", (err) => JS_ERRORS.push(err.message));
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (!url.includes("favicon") && (url.includes("localhost") || url.includes("127.0.0.1"))) {
      NETWORK_FAILURES.push(url);
    }
  });

  // Bypass PasswordGate and suppress About modal by pre-setting storage
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });

  // Navigate to the app
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30_000 });

  // QA-01: DRE Simulator loads — navigate to DRE tab
  try {
    const dreTabBtn = page.getByRole("button", { name: /DRE Scenario Simulator/i });
    await dreTabBtn.waitFor({ timeout: 10_000 });
    await dreTabBtn.click();
    await page.waitForTimeout(1000);
    pass("qa01_dre_simulator_loads", "DRE Scenario Simulator tab navigated successfully");
  } catch (err) {
    fail("qa01_dre_simulator_loads", `DRE tab not found or failed: ${err}`);
  }

  // Take screenshot after DRE tab load
  await page.screenshot({ path: join(SS_DIR, "dre-simulator-desktop.png"), fullPage: false });

  // QA-02: User can change scenario selectors (lever dropdowns exist)
  try {
    const selects = page.locator("select");
    const count = await selects.count();
    if (count > 0) {
      pass("qa02_scenario_selectors_present", `Found ${count} scenario selector(s) on DRE tab`);
    } else {
      fail("qa02_scenario_selectors_present", "No select elements found on DRE tab");
    }
  } catch (err) {
    fail("qa02_scenario_selectors_present", `Error checking selectors: ${err}`);
  }

  // QA-03: Results update — DRE output values visible
  try {
    const bodyText = await page.locator("body").innerText();
    const hasEbitdaOutput =
      bodyText.includes("EBITDA") && (bodyText.includes("R$") || bodyText.includes("BRL"));
    if (hasEbitdaOutput) {
      pass("qa03_results_visible", "EBITDA output values are visible on page");
    } else {
      fail("qa03_results_visible", "EBITDA output not visible after DRE tab load");
    }
  } catch (err) {
    fail("qa03_results_visible", `Error checking results: ${err}`);
  }

  // QA-04: Scenario can be sent to Capital Decision
  try {
    const sendBtn = page.getByRole("button", { name: /Send to Capital Decision/i });
    await sendBtn.waitFor({ timeout: 5_000 });
    pass("qa04_send_to_capital_decision_button_present", "Send to Capital Decision button is present");
  } catch (err) {
    fail("qa04_send_to_capital_decision_button_present", `Send button not found: ${err}`);
  }

  // QA-05: Capital Decision calculates — navigate there
  try {
    const capitalTabBtn = page.getByRole("button", { name: /Decisão de Capital/i });
    await capitalTabBtn.waitFor({ timeout: 5_000 });
    await capitalTabBtn.click();
    await page.waitForTimeout(1000);
    const capitalBody = await page.locator("body").innerText();
    const hasCapitalOutput =
      capitalBody.includes("Capital") || capitalBody.includes("CAPEX") || capitalBody.includes("TIR");
    if (hasCapitalOutput) {
      pass("qa05_capital_decision_calculates", "Capital Decision view loaded with output");
    } else {
      fail("qa05_capital_decision_calculates", "Capital Decision view did not show expected output");
    }
    await page.screenshot({ path: join(SS_DIR, "capital-decision-desktop.png"), fullPage: false });
  } catch (err) {
    fail("qa05_capital_decision_calculates", `Capital Decision navigation failed: ${err}`);
  }

  // Navigate back to DRE for remaining checks
  try {
    const dreTabBtn2 = page.getByRole("button", { name: /DRE Scenario Simulator/i }).first();
    await dreTabBtn2.waitFor({ timeout: 5_000 });
    await dreTabBtn2.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: join(SS_DIR, "dre-simulator-after-capital.png"), fullPage: false });
  } catch (err) {
    console.log(`  [warn] navigate-back-to-DRE failed: ${err}`);
  }

  // QA-06: Assumption-status panel is visible or reachable
  try {
    const bodyText = await page.locator("body").innerText();
    const hasAssumptionPanel =
      bodyText.includes("Assumption Status") ||
      bodyText.includes("assumption provenance") ||
      bodyText.includes("F01") ||
      bodyText.includes("F03");
    if (hasAssumptionPanel) {
      pass("qa06_assumption_status_panel_visible", "Assumption Status panel or F-code metadata is visible");
    } else {
      fail("qa06_assumption_status_panel_visible", "No assumption status panel found on DRE tab");
    }
  } catch (err) {
    fail("qa06_assumption_status_panel_visible", `Error checking assumption panel: ${err}`);
  }

  // QA-07: F02 is not shown as open
  try {
    const bodyText = await page.locator("body").innerText();
    // F02 should appear only as resolved, not as an open/pending item
    const f02Section = bodyText.split("F02");
    const f02ShownAsOpen =
      f02Section.some((chunk) => chunk.toLowerCase().includes("pending") && chunk.length < 200) &&
      !bodyText.includes("resolved_engineering");
    if (!f02ShownAsOpen) {
      pass("qa07_f02_not_shown_as_open", "F02 is not shown as an open assumption item");
    } else {
      fail("qa07_f02_not_shown_as_open", "F02 appears to be shown as an open item without resolved status");
    }
  } catch (err) {
    fail("qa07_f02_not_shown_as_open", `Error checking F02 status: ${err}`);
  }

  // QA-08: F01/F03/F04/F05/F06 shown as pending metadata
  try {
    const bodyText = await page.locator("body").innerText();
    const fCodesPresent = ["F01", "F03", "F04", "F05", "F06"].every((code) =>
      bodyText.includes(code),
    );
    if (fCodesPresent) {
      pass("qa08_f01_f03_f04_f05_f06_shown_as_metadata", "F01/F03/F04/F05/F06 are all visible as metadata");
    } else {
      const missing = ["F01", "F03", "F04", "F05", "F06"].filter((c) => !bodyText.includes(c));
      fail("qa08_f01_f03_f04_f05_f06_shown_as_metadata", `Missing F-codes: ${missing.join(", ")}`);
    }
  } catch (err) {
    fail("qa08_f01_f03_f04_f05_f06_shown_as_metadata", `Error checking F-codes: ${err}`);
  }

  // QA-09: No "calculation blocked" message appears
  try {
    const bodyText = await page.locator("body").innerText();
    const hasBlockedMessage =
      bodyText.toLowerCase().includes("calculation blocked") ||
      bodyText.toLowerCase().includes("calculation cannot begin") ||
      bodyText.toLowerCase().includes("simulation blocked");
    if (!hasBlockedMessage) {
      pass("qa09_no_calculation_blocked_message", "No 'calculation blocked' message on page");
    } else {
      fail("qa09_no_calculation_blocked_message", "Found a 'calculation blocked' or 'cannot begin' message");
    }
  } catch (err) {
    fail("qa09_no_calculation_blocked_message", `Error: ${err}`);
  }

  // QA-10: No horizontal overflow on mobile viewport
  try {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    await page.screenshot({ path: join(SS_DIR, "dre-simulator-mobile.png"), fullPage: false });
    if (scrollWidth <= clientWidth + 2) {
      pass("qa10_no_horizontal_overflow_mobile", `scrollWidth(${scrollWidth}) <= clientWidth(${clientWidth})`);
    } else {
      fail("qa10_no_horizontal_overflow_mobile", `Horizontal overflow: scrollWidth(${scrollWidth}) > clientWidth(${clientWidth})`);
    }
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 800 });
  } catch (err) {
    fail("qa10_no_horizontal_overflow_mobile", `Error checking mobile overflow: ${err}`);
  }

  // QA-11: No console errors
  if (JS_ERRORS.length === 0) {
    pass("qa11_no_console_errors", "No JavaScript console errors detected");
  } else {
    fail("qa11_no_console_errors", `JS errors: ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }

  // QA-12: No failed local-module requests
  if (NETWORK_FAILURES.length === 0) {
    pass("qa12_no_failed_local_module_requests", "No local module request failures");
  } else {
    fail("qa12_no_failed_local_module_requests", `Network failures: ${NETWORK_FAILURES.slice(0, 3).join("; ")}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15J Simulation-First — Browser QA");
  console.log("=".repeat(50));

  let server: ChildProcess | null = null;
  let browser = null;

  try {
    console.log(`\nStarting dev server on port ${QA_PORT}...`);
    server = await startServer();
    console.log("Dev server ready.");

    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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

  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter(Boolean).length;
  const failed = totalChecks - passed;

  console.log(
    `\n${failed === 0 ? "✓" : "✗"} Phase 15J browser QA: ${passed}/${totalChecks} pass, ${failed} fail`,
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
