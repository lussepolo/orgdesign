// Phase 15L.2 — Academic Staffing Content Cleanup Browser QA (25 checks).
//
// Verifies that Phase 15L.2 source changes render correctly in the live UI:
//
//   Checks 1:      App loads
//   Checks 2-6:   Early Years tab — T2 capacity fix
//   Checks 7-10:  Lower School tab — G4/G5 capacity fix
//   Checks 11-17: Hiring Profile Cards tab — cluster names + disclosure
//   Checks 18-21: Executive Org Design tab — Inspirationeer/Librarian + After School
//   Checks 22-23: Multi-viewport regression (tablet/mobile)
//   Checks 24-25: Zero console errors + zero network failures
//
// Run with: npm run qa:phase15l2
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4198;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const SS_DIR = join(process.cwd(), "test-results", "phase15l2-screenshots");
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

async function bodyLower(page: Page): Promise<string> {
  return (await page.locator("body").innerText().catch(() => "")).toLowerCase();
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

  const ss = (n: string) =>
    page.screenshot({ path: join(SS_DIR, n + ".png"), fullPage: false }).catch(() => {});

  // ── Check 1: App loads ────────────────────────────────────────────────────
  const appVisible = await page.locator("text=Strategic").first().isVisible().catch(() => false);
  appVisible
    ? pass("app_loads", "App renders with 'Strategic' heading visible")
    : fail("app_loads", "App did not render expected heading");

  // ── Checks 2-6: Early Years tab ───────────────────────────────────────────
  try {
    await clickTab(page, "Early Years");
    await page.waitForSelector("text=Early Years", { timeout: 10_000 });
    await page.waitForTimeout(400);
    await ss("01_early_years");
  } catch (err) {
    fail("ey_tab_loads", `Failed to navigate to Early Years: ${err}`);
  }

  const eyBody = await bodyLower(page);

  eyBody.includes("early years")
    ? pass("ey_tab_loads", "Early Years tab loads")
    : fail("ey_tab_loads", "Early Years tab did not load");

  !eyBody.includes("30 learners")
    ? pass("ey_t2_no_30_total", "T2 does not render '30 Learners' (total corrected)")
    : fail("ey_t2_no_30_total", "T2 still renders '30 Learners' — max:30 not fixed");

  !eyBody.includes("15 learners")
    ? pass("ey_t2_no_15_per_section", "T2 does not render '15 Learners' per section (30/2 removed)")
    : fail("ey_t2_no_15_per_section", "T2 still renders '15 Learners' per section — max:30 not fixed");

  eyBody.includes("28 learners")
    ? pass("ey_28_learners_present", "'28 Learners' renders (T1 and T2 both correct at 28)")
    : fail("ey_28_learners_present", "Expected '28 Learners' in Early Years — not found");

  eyBody.includes("14 learners")
    ? pass("ey_14_per_section_present", "'14 Learners' per-section renders (28/2 = 14 correct)")
    : fail("ey_14_per_section_present", "Expected '14 Learners' per-section — not found");

  // ── Checks 7-10: Lower School tab ────────────────────────────────────────
  try {
    await clickTab(page, "Lower School");
    await page.waitForSelector("text=Lower School", { timeout: 10_000 });
    await page.waitForTimeout(400);
    await ss("02_lower_school");
  } catch (err) {
    fail("ls_tab_loads", `Failed to navigate to Lower School: ${err}`);
  }

  const lsBody = await bodyLower(page);

  lsBody.includes("lower school")
    ? pass("ls_tab_loads", "Lower School tab loads")
    : fail("ls_tab_loads", "Lower School tab did not load");

  lsBody.includes("48 learners")
    ? pass("ls_48_learners_present", "'48 Learners' renders (G4 and G5 now correct at 48)")
    : fail("ls_48_learners_present", "Expected '48 Learners' for G4/G5 — not found");

  lsBody.includes("24 learners")
    ? pass("ls_24_per_section_present", "'24 Learners' per-section renders (48/2 = 24 correct)")
    : fail("ls_24_per_section_present", "Expected '24 Learners' per-section for G4/G5 — not found");

  lsBody.includes("44 learners")
    ? pass("ls_44_learners_regression", "'44 Learners' still renders (G1-G3 unchanged at 44)")
    : fail("ls_44_learners_regression", "G1-G3 '44 Learners' missing — regression detected");

  // ── Checks 11-17: Hiring Profile Cards tab ───────────────────────────────
  try {
    await clickTab(page, "Hiring Profile Cards");
    await page.waitForSelector("text=Staffing Choices", { timeout: 10_000 });
    await page.waitForTimeout(400);
    await ss("03_hiring_profile_cards");
  } catch (err) {
    fail("hiring_tab_loads", `Failed to navigate to Hiring Profile Cards: ${err}`);
  }

  const hiringBody = await bodyLower(page);

  hiringBody.includes("staffing choices")
    ? pass("hiring_tab_loads", "Hiring Profile Cards tab loads")
    : fail("hiring_tab_loads", "Hiring Profile Cards tab did not load");

  hiringBody.includes("global studies & project design")
    ? pass("hiring_global_studies_cluster_present", "'Global Studies & Project Design' cluster tile renders")
    : fail("hiring_global_studies_cluster_present", "Expected 'Global Studies & Project Design' cluster tile — not found");

  hiringBody.includes("language acquisition & global perspectives")
    ? pass("hiring_language_acquisition_cluster_present", "'Language Acquisition & Global Perspectives' cluster tile renders")
    : fail("hiring_language_acquisition_cluster_present", "Expected 'Language Acquisition & Global Perspectives' cluster tile — not found");

  !hiringBody.includes("signature cluster")
    ? pass("hiring_no_signature_cluster", "Old 'Signature Cluster' tile label not rendered")
    : fail("hiring_no_signature_cluster", "Old 'Signature Cluster' tile label still renders — not removed");

  !hiringBody.includes("bilingual cluster")
    ? pass("hiring_no_bilingual_cluster", "Old 'Bilingual Cluster' tile label not rendered")
    : fail("hiring_no_bilingual_cluster", "Old 'Bilingual Cluster' tile label still renders — not removed");

  hiringBody.includes("not a complete hiring authorization list")
    ? pass("hiring_disclosure_present", "Partial-coverage disclosure text renders")
    : fail("hiring_disclosure_present", "Expected disclosure 'not a complete hiring authorization list' — not found");

  hiringBody.includes("stem cluster")
    ? pass("hiring_stem_cluster_regression", "'STEM Cluster' still renders (regression guard)")
    : fail("hiring_stem_cluster_regression", "'STEM Cluster' missing — unexpected regression");

  // ── Checks 18-21: Executive Org Design tab ───────────────────────────────
  try {
    await clickTab(page, "Executive Org Design");
    await page.waitForSelector("text=Executive Org Design", { timeout: 10_000 });
    await page.waitForTimeout(700);
    // Select year 2028 to ensure the library / after-school roles are active
    const selects = page.locator("select");
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i);
      const opts = await sel.locator("option").allTextContents();
      if (opts.some((o) => o.includes("2028"))) {
        await sel.selectOption("2028");
        await page.waitForTimeout(700);
        break;
      }
    }
    await ss("04_exec_org_design");
  } catch (err) {
    fail("exec_tab_loads", `Failed to navigate to Executive Org Design: ${err}`);
  }

  const execBody = await bodyLower(page);

  execBody.includes("executive org design")
    ? pass("exec_tab_loads", "Executive Org Design tab loads")
    : fail("exec_tab_loads", "Executive Org Design tab did not load");

  execBody.includes("inspirationeer / librarian")
    ? pass("exec_inspirationeer_librarian_present", "'Inspirationeer / Librarian' label renders in org tree")
    : fail("exec_inspirationeer_librarian_present", "Expected 'Inspirationeer / Librarian' — not found");

  execBody.includes("after school coordinator")
    ? pass("exec_after_school_coordinator_present", "'After School Coordinator' label renders in org tree")
    : fail("exec_after_school_coordinator_present", "Expected 'After School Coordinator' — not found");

  !execBody.includes("after school educator")
    ? pass("exec_no_after_school_educator", "Old 'After School Educator' label not rendered")
    : fail("exec_no_after_school_educator", "Old 'After School Educator' label still renders — not renamed");

  // ── Checks 22-23: Multi-viewport regression ───────────────────────────────
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });

  try {
    await clickTab(page, "Hiring Profile Cards");
    await page.waitForTimeout(600);
    await ss("05_hiring_tablet");
  } catch {}

  const tabletHiringBody = await bodyLower(page);
  tabletHiringBody.includes("global studies & project design")
    ? pass("tablet_hiring_cluster_names_legible", "Tablet (1024×900): 'Global Studies & Project Design' cluster renders")
    : fail("tablet_hiring_cluster_names_legible", "Tablet: cluster name 'Global Studies & Project Design' not found");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20_000 });

  try {
    await clickTab(page, "Early Years");
    await page.waitForTimeout(600);
    await ss("06_ey_mobile");
  } catch {}

  const mobileEyBody = await bodyLower(page);
  mobileEyBody.includes("28 learners")
    ? pass("mobile_ey_28_learners_legible", "Mobile (390×844): '28 Learners' renders in Early Years tab")
    : fail("mobile_ey_28_learners_legible", "Mobile: '28 Learners' not found in Early Years tab");

  // ── Checks 24-25: Zero errors ─────────────────────────────────────────────
  if (JS_ERRORS.length > 0) {
    console.log(`\n  [warn] JS errors (${JS_ERRORS.length}): ${JS_ERRORS.slice(0, 3).join("; ")}`);
  }

  JS_ERRORS.length === 0
    ? pass("zero_console_errors", "No JavaScript console errors")
    : fail("zero_console_errors", `${JS_ERRORS.length} JS error(s): ${JS_ERRORS[0]?.slice(0, 80)}`);

  NETWORK_FAILURES.length === 0
    ? pass("zero_network_failures", "No network failures")
    : fail("zero_network_failures", `${NETWORK_FAILURES.length} network failure(s): ${NETWORK_FAILURES[0]?.slice(0, 80)}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\nPhase 15L.2 Academic Staffing Content — Browser QA");
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

  const EXPECTED = 25;
  const totalChecks = Object.keys(RESULTS).length;
  const passed = Object.values(RESULTS).filter((v) => v === true).length;
  const failed = totalChecks - passed;

  console.log(
    `\n${failed === 0 && passed >= EXPECTED ? "✓" : "✗"} Phase 15L.2 browser QA: ${passed}/${EXPECTED} pass, ${failed} fail`,
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
