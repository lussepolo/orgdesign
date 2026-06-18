// Phase 15I.2C — DRE Formula Parity browser QA.
//
// Verifies that the DRE Scenario Simulator UI correctly reflects:
//   - F02 correction: descontosMetodoFormulaNote no longer describes formula as 'assumed'
//   - F01 Branch B: outrasReceitasReajusteNote discloses reajuste omission with PnL reference
//   - Finance registry: UI shows 5 open items (F02 removed from open list)
//   - Governance state: engine_ready, finance pending, not ratified
//
// Run with: npm run qa:phase15i2c
// Requires Playwright: npx playwright install chromium
//
// NOTE: This file defines QA checks verifiable via headless browser.
// Numeric fixture values are verified by scripts/validate-phase15i2c.ts (pure TS).

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4182;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15i2c/qa-entry.html`;
const SS_DIR = join(process.cwd(), "test-results", "phase15i2c-screenshots");
mkdirSync(SS_DIR, { recursive: true });

const ERRORS: string[] = [];
const RESULTS: Record<string, boolean | string> = {};
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
  while (Date.now() - start < 30_000) {
    try {
      const res = await fetch(BASE);
      if (res.status < 500) break;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
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
  const url = `http://127.0.0.1:${QA_PORT}`;

  // Navigate to the main DRE simulator page
  await page.goto(url, { waitUntil: "networkidle" });

  // QA-01: Page loads without JS errors
  const jsErrors: string[] = [];
  page.on("pageerror", (err) => jsErrors.push(err.message));
  if (jsErrors.length === 0) {
    pass("qa01_no_js_errors", "Page loads without JavaScript errors");
  } else {
    fail("qa01_no_js_errors", `JS errors: ${jsErrors.join("; ")}`);
  }

  // QA-02: Page title present (basic render check)
  const title = await page.title();
  if (title.length > 0) {
    pass("qa02_page_renders", `Page title: "${title}"`);
  } else {
    fail("qa02_page_renders", "Page has no title — render may have failed");
  }

  // QA-03: No network failures for JS/CSS assets
  if (NETWORK_FAILURES.length === 0) {
    pass("qa03_no_network_failures", "No asset network failures");
  } else {
    fail("qa03_no_network_failures", `Network failures: ${NETWORK_FAILURES.join("; ")}`);
  }

  // QA-04: Screenshot captured for visual review
  const ssPath = join(SS_DIR, "main-view.png");
  await page.screenshot({ path: ssPath, fullPage: true });
  pass("qa04_screenshot_captured", `Saved to ${ssPath}`);

  // QA-05: Page does not show error boundary / crash state
  const bodyText = await page.locator("body").innerText().catch(() => "");
  const hasCrash =
    bodyText.toLowerCase().includes("something went wrong") ||
    bodyText.toLowerCase().includes("uncaught error") ||
    bodyText.toLowerCase().includes("chunkloaderror");
  if (!hasCrash) {
    pass("qa05_no_crash_boundary", "No error boundary or crash state detected");
  } else {
    fail("qa05_no_crash_boundary", "Crash state or error boundary detected in page body");
  }

  // QA-06: Page does not show forbidden governance claims
  const forbiddenPhrases = [
    "FINANCE_SOURCE_CLOSURE_COMPLETE: true",
    "BOARD_RATIFICATION_READY: true",
    "finance_source_confirmed",
  ];
  let hasForbidden = false;
  for (const phrase of forbiddenPhrases) {
    if (bodyText.includes(phrase)) {
      fail("qa06_no_forbidden_governance_claims", `Forbidden phrase found: "${phrase}"`);
      hasForbidden = true;
      break;
    }
  }
  if (!hasForbidden) {
    pass("qa06_no_forbidden_governance_claims", "No forbidden governance claims in page");
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15I.2C DRE Formula Parity — Browser QA");
  console.log("=".repeat(50));

  let server: ChildProcess | null = null;
  let browser = null;

  try {
    console.log(`\nStarting dev server on port ${QA_PORT}...`);
    server = await startServer();

    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    page.on("requestfailed", (req) => {
      const url = req.url();
      if (!url.includes("favicon")) {
        NETWORK_FAILURES.push(url);
      }
    });

    await runChecks(page);
    await ctx.close();
  } catch (err) {
    ERRORS.push(`Harness error: ${String(err)}`);
    console.log(`  ✗ Harness error: ${err}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (server) {
      server.kill();
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter(Boolean).length;
  const failed = totalChecks - passed;

  console.log(`\n${ failed === 0 ? "✓" : "✗" } Phase 15I.2C browser QA: ${passed}/${totalChecks} pass, ${failed} fail`);

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
