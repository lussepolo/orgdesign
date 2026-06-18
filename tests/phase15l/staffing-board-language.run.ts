// Phase 15L — Staffing Consistency and Board-Language Repair Browser QA (16 checks).
//
// Verifies that Phase 15L source changes render correctly in the live UI:
//
//   Checks 1-3:   Load Calculator — MS/HS/Total FTE values
//   Checks 4-6:   Load Calculator — stress test verdict language
//   Checks 7-8:   App header — subtitle label
//   Checks 9-10:  App eyebrow — global section label
//   Checks 11-13: Executive Org Design — right panel rail item
//   Checks 14-15: High School tab — badge text
//   Check  16:    High School tab — validation note (no 8-HC phrase)
//
// Run with: npm run qa:phase15l
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4188;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15l-screenshots");
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

async function clickTab(page: Page, label: string) {
  await page.getByRole("button", { name: label }).first().click();
  await page.waitForTimeout(600);
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

  const ss = (n: string) =>
    page.screenshot({ path: join(SS_DIR, n + ".png"), fullPage: false }).catch(() => {});

  // ── Checks 1-6: Load Calculator tab ──────────────────────────────────────

  try {
    await clickTab(page, "Load Calculator");
    await page.waitForSelector("text=Staffing Stability", { timeout: 10_000 });
    await page.waitForTimeout(300);
    await ss("01_load_calculator");
  } catch (err) {
    fail("nav_to_load_calculator", `Failed to navigate to Load Calculator: ${err}`);
  }

  const loadBody = await page.locator("body").innerText().catch(() => "");
  // Normalize to lowercase: innerText applies CSS text-transform, so uppercase
  // classes (used on eyebrows and headers) produce all-caps in the DOM text.
  const loadBodyLower = loadBody.toLowerCase();

  // Check 1: MS FTE shows 9.00
  if (loadBody.includes("9.00")) {
    pass("load_ms_fte_shows_9", "Middle School FTE renders as 9.00");
  } else {
    fail("load_ms_fte_shows_9", "Expected '9.00' for Middle School FTE — not found");
  }

  // Check 2: HS FTE shows 11.00
  if (loadBody.includes("11.00")) {
    pass("load_hs_fte_shows_11", "High School FTE renders as 11.00");
  } else {
    fail("load_hs_fte_shows_11", "Expected '11.00' for High School FTE — not found");
  }

  // Check 3: Total FTE shows 20.00
  if (loadBody.includes("20.00")) {
    pass("load_total_fte_shows_20", "Total System Load renders as 20.00 FTE");
  } else {
    fail("load_total_fte_shows_20", "Expected '20.00' for Total System Load — not found");
  }

  // Check 4: Stress test verdict does NOT contain "PASS:"
  if (!loadBody.includes("PASS:")) {
    pass("load_verdict_no_pass_certifying_language", "Stress test verdict does not contain 'PASS:'");
  } else {
    fail("load_verdict_no_pass_certifying_language", "Stress test verdict still contains 'PASS:' certifying language");
  }

  // Check 5: Stress test verdict does NOT contain "são paulo standards" (case-insensitive)
  if (!loadBodyLower.includes("são paulo standards")) {
    pass("load_verdict_no_sao_paulo_standards", "Stress test verdict does not reference 'São Paulo standards'");
  } else {
    fail("load_verdict_no_sao_paulo_standards", "Stress test verdict still contains 'São Paulo standards'");
  }

  // Check 6: Stress test verdict contains "internal planning target" (case-insensitive)
  if (loadBodyLower.includes("internal planning target")) {
    pass("load_verdict_internal_planning_target_present", "'Internal planning target' replacement verdict is rendered");
  } else {
    fail("load_verdict_internal_planning_target_present", "Expected 'Internal planning target' in stress test verdict — not found");
  }

  // ── Checks 7-10: App header and eyebrow (visible on any non-cover tab) ───

  // Check 7: App header subtitle does NOT contain "são paulo parity scaling" (case-insensitive)
  if (!loadBodyLower.includes("são paulo parity scaling")) {
    pass("app_header_no_sao_paulo_parity_scaling", "App header does not contain 'São Paulo Parity Scaling'");
  } else {
    fail("app_header_no_sao_paulo_parity_scaling", "App header still contains 'São Paulo Parity Scaling'");
  }

  // Check 8: App header subtitle contains "internal planning reference" (case-insensitive)
  if (loadBodyLower.includes("internal planning reference")) {
    pass("app_header_internal_planning_reference_present", "'Internal planning reference' appears in app header");
  } else {
    fail("app_header_internal_planning_reference_present", "Expected 'Internal planning reference' in app header — not found");
  }

  // Check 9: Eyebrow does NOT contain "board review" (case-insensitive)
  if (!loadBodyLower.includes("board review")) {
    pass("app_eyebrow_no_board_review", "Eyebrow label does not contain 'Board Review'");
  } else {
    fail("app_eyebrow_no_board_review", "Eyebrow label still contains 'Board Review'");
  }

  // Check 10: Eyebrow contains "strategic planning" (case-insensitive)
  if (loadBodyLower.includes("strategic planning")) {
    pass("app_eyebrow_strategic_planning_present", "'Strategic Planning' eyebrow label is rendered");
  } else {
    fail("app_eyebrow_strategic_planning_present", "Expected 'Strategic Planning' eyebrow — not found");
  }

  // ── Checks 11-13: Executive Org Design right panel ───────────────────────

  try {
    await clickTab(page, "Executive Org Design");
    await page.waitForSelector("text=Planning status", { timeout: 10_000 });
    await ss("02_executive_org_design");
  } catch {
    try {
      await clickTab(page, "Executive Org Design");
      await page.waitForTimeout(1000);
      await ss("02_executive_org_design");
    } catch (err) {
      fail("nav_to_executive_org_design", `Failed to navigate to Executive Org Design: ${err}`);
    }
  }

  const execBody = await page.locator("body").innerText().catch(() => "");
  const execBodyLower = execBody.toLowerCase();

  // Check 11: Right panel does NOT contain "board condition" (case-insensitive — label has uppercase CSS)
  if (!execBodyLower.includes("board condition")) {
    pass("exec_org_no_board_condition_label", "Executive Org Design panel does not contain 'Board condition' label");
  } else {
    fail("exec_org_no_board_condition_label", "Executive Org Design panel still contains 'Board condition' label");
  }

  // Check 12: Right panel does NOT contain "conditional approval language" (case-insensitive)
  if (!execBodyLower.includes("conditional approval language")) {
    pass("exec_org_no_conditional_approval_language", "Executive Org Design panel does not contain 'Conditional approval language'");
  } else {
    fail("exec_org_no_conditional_approval_language", "Executive Org Design panel still contains 'Conditional approval language'");
  }

  // Check 13: Right panel contains "planning status" (case-insensitive — label has uppercase CSS)
  if (execBodyLower.includes("planning status")) {
    pass("exec_org_planning_status_label_present", "'Planning status' label is rendered in Executive Org Design panel");
  } else {
    fail("exec_org_planning_status_label_present", "Expected 'Planning status' label in Executive Org Design panel — not found");
  }

  // ── Checks 14-16: High School tab ────────────────────────────────────────

  try {
    await clickTab(page, "High School");
    await page.waitForTimeout(800);
    await ss("03_high_school");
  } catch (err) {
    fail("nav_to_high_school", `Failed to navigate to High School tab: ${err}`);
  }

  const hsBody = await page.locator("body").innerText().catch(() => "");
  const hsBodyLower = hsBody.toLowerCase();

  // Check 14: Badge does NOT contain "conditional approval" (case-insensitive — badge has uppercase CSS)
  if (!hsBodyLower.includes("conditional approval")) {
    pass("hs_badge_no_conditional_approval", "High School tab does not contain 'Conditional approval' badge text");
  } else {
    fail("hs_badge_no_conditional_approval", "High School tab still contains 'Conditional approval' badge text");
  }

  // Check 15: Badge contains "timetable validation pending" (case-insensitive — badge has uppercase CSS)
  if (hsBodyLower.includes("timetable validation pending")) {
    pass("hs_badge_timetable_validation_pending", "'Timetable validation pending' badge is rendered in High School tab");
  } else {
    fail("hs_badge_timetable_validation_pending", "Expected 'Timetable validation pending' badge in High School tab — not found");
  }

  // Check 16: Validation note does NOT contain "8-hc hs educator pool" (case-insensitive)
  if (!hsBodyLower.includes("8-hc hs educator pool")) {
    pass("hs_note_no_8hc_educator_pool", "High School tab does not render '8-HC HS Educator Pool' phrase");
  } else {
    fail("hs_note_no_8hc_educator_pool", "High School tab still renders '8-HC HS Educator Pool' phrase — internal diagnostic exposed");
  }

  // ── Console errors ────────────────────────────────────────────────────────

  if (JS_ERRORS.length > 0) {
    console.log(`\n  [warn] JS errors (${JS_ERRORS.length}): ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }
  if (NETWORK_FAILURES.length > 0) {
    console.log(`  [warn] Network failures: ${NETWORK_FAILURES.slice(0, 3).join("; ")}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15L Staffing Consistency & Board-Language — Browser QA");
  console.log("=".repeat(60));

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

  const EXPECTED = 16;
  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter((v) => v === true).length;
  const failed = totalChecks - passed;

  console.log(
    `\n${failed === 0 && passed >= EXPECTED ? "✓" : "✗"} Phase 15L browser QA: ${passed}/${EXPECTED} pass, ${failed} fail`,
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
