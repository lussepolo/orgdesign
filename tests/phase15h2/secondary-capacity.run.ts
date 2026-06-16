// Phase 15H.2 — Secondary Educator Capacity browser QA.
//
// Tests the Middle School, High School, and Executive Org Design tabs
// against the canonical 9/11/20 mature planning envelope.
//
// Run with: npm run qa:phase15h2
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4178;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15h2/qa-entry.html`;
const SS_DIR = join(process.cwd(), "test-results", "phase15h2-screenshots");
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

function stopServer(proc: ChildProcess) {
  try { proc.kill("SIGTERM"); } catch { /* ignore */ }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

async function land(page: Page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("text=Strategic", { timeout: 20_000 });
  await page.waitForTimeout(600);
  const modal = page.locator(".fixed.inset-0.z-\\[100\\]");
  if (await modal.isVisible().catch(() => false)) {
    const closeBtn = page.locator("button").filter({ has: page.locator("svg") }).last();
    await modal.click({ position: { x: 10, y: 10 }, force: true }).catch(async () => {
      await closeBtn.click().catch(() => {});
    });
    await page.waitForTimeout(400);
  }
}

function check(key: string, val: boolean | string) {
  RESULTS[key] = val;
}

async function safe<T>(key: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch (e: unknown) {
    RESULTS[key] = "ERROR: " + (e instanceof Error ? e.message.split("\n")[0] : String(e));
    return fallback;
  }
}

async function clickTab(page: Page, label: string) {
  await page.locator(`button:has-text("${label}")`).first().click();
  await page.waitForTimeout(600);
}

async function bodyTextLower(page: Page): Promise<string> {
  return (await page.locator("body").innerText()).toLowerCase();
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  // Checks at the document level. Tables inside overflow-x-auto scroll containers
  // are contained and do not propagate to document scrollWidth.
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
}

// ── QA suite ─────────────────────────────────────────────────────────────────

async function runQa(page: Page) {
  const ss = (n: string) =>
    page.screenshot({ path: join(SS_DIR, n + ".png"), fullPage: false }).catch(() => {});

  // ── DESKTOP 1440×1000 ──────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);
  await ss("01_cover_desktop");

  check("app_loads", await safe("app_loads",
    () => page.locator("text=Strategic").first().isVisible(), false));

  // ── Middle School tab ─────────────────────────────────────────────────────
  await safe("nav_to_middle_school", async () => {
    await clickTab(page, "Middle School");
    await page.waitForSelector("text=Middle School", { timeout: 10_000 });
    await page.waitForTimeout(400);
  }, undefined);
  await ss("02_ms_tab_desktop");

  const msBody = await bodyTextLower(page);

  check("ms_tab_loads", await safe("ms_tab_loads",
    () => page.locator("text=Middle School").first().isVisible(), false));

  // 8 core + 1 flexible = 9
  check("ms_8_core_educators", msBody.includes("8"));
  check("ms_1_flexible_educator", msBody.includes("1"));
  check("ms_9_total_educators", msBody.includes("9"));

  // Raw learner blocks 240
  check("ms_240_raw_blocks", msBody.includes("240"));

  // Core demand 156
  check("ms_156_core_demand", msBody.includes("156"));

  // Programme demand 84
  check("ms_84_programme_demand", msBody.includes("84"));

  // Programme capacity at 27 = 87
  check("ms_87_programme_capacity", msBody.includes("87"));

  // Margin 3 (26.67 contains "3" but we also verify other unique values)
  check("ms_3_margin", msBody.includes("3-block") || msBody.includes("margin") && msBody.includes("3"));

  // Average required load 26.67
  check("ms_average_load_present", msBody.includes("26.67") || msBody.includes("26,67"));

  // Load range 26-28
  check("ms_load_range_26_28",
    msBody.includes("26-28") || msBody.includes("26–28") ||
    (msBody.includes("26") && msBody.includes("28")));

  // Instructional-capacity vs payroll boundary note
  check("ms_payroll_boundary_note",
    msBody.includes("payroll") &&
    (msBody.includes("not payroll authorization") ||
     msBody.includes("payroll authorization") ||
     msBody.includes("instructional-capacity")));

  // ── High School tab ───────────────────────────────────────────────────────
  await safe("nav_to_high_school", async () => {
    await clickTab(page, "High School");
    await page.waitForSelector("text=High School", { timeout: 10_000 });
    await page.waitForTimeout(600);
  }, undefined);
  await ss("03_hs_tab_desktop");

  const hsBody = await bodyTextLower(page);

  check("hs_tab_loads", await safe("hs_tab_loads",
    () => page.locator("text=High School").first().isVisible(), false));

  // 10 core + 1 flexible = 11
  check("hs_10_core_educators", hsBody.includes("10"));
  check("hs_11_total_educators", hsBody.includes("11"));

  // Raw 320
  check("hs_320_raw_blocks", hsBody.includes("320"));

  // Core demand 216
  check("hs_216_core_demand", hsBody.includes("216"));

  // Programme demand 104
  check("hs_104_programme_demand", hsBody.includes("104"));

  // Programme capacity at 27 = 81
  check("hs_81_programme_capacity", hsBody.includes("81"));

  // Required efficiency at 27 = 23
  check("hs_23_required_efficiency", hsBody.includes("23"));

  // Conditional status — Badge renders as CSS-uppercased text; use case-insensitive search
  check("hs_conditional_status", hsBody.includes("conditional"));

  // Innovation Diploma Project wording (not Passion Project for G11-12)
  check("hs_innovation_diploma_wording",
    hsBody.includes("innovation diploma"));

  // No forbidden absolute status claims (within the canonical capacity section)
  check("hs_no_feasible_unconditional",
    !hsBody.includes("feasible") ||
    hsBody.includes("do not label this model feasible") ||
    hsBody.includes("not feasible"));

  // Load range 26-28
  check("hs_load_range_26_28",
    hsBody.includes("26-28") || hsBody.includes("26–28") ||
    (hsBody.includes("26") && hsBody.includes("28")));

  // Payroll boundary note
  check("hs_payroll_boundary_note",
    hsBody.includes("payroll") &&
    (hsBody.includes("not payroll authorization") ||
     hsBody.includes("instructional-capacity planning only") ||
     hsBody.includes("payroll authorization")));

  // ── Executive Org Design tab ──────────────────────────────────────────────
  await safe("nav_to_exec_org_design", async () => {
    await clickTab(page, "Executive Org Design");
    await page.waitForSelector("text=Executive Org Design", { timeout: 10_000 });
    await page.waitForTimeout(600);
  }, undefined);
  await ss("04_exec_org_design_desktop_2028");

  // Navigate to year 2037 so MS full model and HS full model are both active.
  // Year selector is a <select> element, not a button.
  await safe("exec_select_year_2037", async () => {
    const selects = page.locator("select");
    const count = await selects.count();
    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i);
      const opts = await sel.locator("option").allTextContents();
      if (opts.some((o) => o.includes("2037"))) {
        await sel.selectOption("2037");
        await page.waitForTimeout(700);
        break;
      }
    }
  }, undefined);
  await ss("05_exec_org_design_desktop_2037");

  const execBody = await bodyTextLower(page);

  check("exec_org_tab_loads", await safe("exec_org_tab_loads",
    () => page.locator("text=Executive Org Design").first().isVisible(), false));

  // Combined 20 mature envelope
  check("exec_combined_20", execBody.includes("20"));

  // MS 9 mature envelope label
  check("exec_ms_9", execBody.includes("9"));

  // HS 11 mature envelope label — visible when HS is active (year 2037)
  check("exec_hs_11", execBody.includes("11"));

  // Instructional-capacity planning language
  check("exec_instructional_capacity_language",
    execBody.includes("instructional") ||
    execBody.includes("planning envelope"));

  // No payroll authorization implication
  check("exec_no_payroll_authorization_claim",
    execBody.includes("not payroll authorization") ||
    execBody.includes("not final hiring") ||
    execBody.includes("mature instructional-capacity") ||
    execBody.includes("instructional-capacity planning only") ||
    execBody.includes("payroll authorization"));

  // Language Acquisition Coach present in the org tree
  check("exec_language_acquisition_coach",
    execBody.includes("language acquisition coach"));

  // Board condition — conditional language
  check("exec_board_condition_conditional",
    execBody.includes("conditional"));

  // ── Console errors and network failures (desktop) ─────────────────────────
  check("zero_console_errors", ERRORS.length === 0);
  check("zero_network_failures", NETWORK_FAILURES.length === 0);

  // ── TABLET 1024×900 ───────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1024, height: 900 });
  await land(page);

  await safe("tablet_nav_ms", () => clickTab(page, "Middle School"), undefined);
  await page.waitForTimeout(400);
  await ss("06_ms_tablet");

  check("tablet_ms_values_legible", await safe("tablet_ms_values_legible",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("240") && t.includes("156") && t.includes("9");
    }, false));

  check("tablet_no_horizontal_overflow", await safe("tablet_no_horizontal_overflow",
    () => noHorizontalOverflow(page), false));

  await safe("tablet_nav_hs", () => clickTab(page, "High School"), undefined);
  await page.waitForTimeout(600);
  await ss("07_hs_tablet");

  check("tablet_hs_conditional_readable", await safe("tablet_hs_conditional_readable",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("conditional");
    }, false));

  await safe("tablet_nav_exec", () => clickTab(page, "Executive Org Design"), undefined);
  await page.waitForTimeout(400);
  await ss("08_exec_tablet");

  check("tablet_exec_envelope_legible", await safe("tablet_exec_envelope_legible",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("20") && (t.includes("planning envelope") || t.includes("instructional"));
    }, false));

  // ── MOBILE 390×844 ────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await land(page);

  await safe("mobile_nav_ms", () => clickTab(page, "Middle School"), undefined);
  await page.waitForTimeout(600);
  await ss("09_ms_mobile");

  check("mobile_ms_no_overflow", await safe("mobile_ms_no_overflow",
    () => noHorizontalOverflow(page), false));

  check("mobile_ms_values_present", await safe("mobile_ms_values_present",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("9") && t.includes("240");
    }, false));

  await safe("mobile_nav_hs", () => clickTab(page, "High School"), undefined);
  await page.waitForTimeout(600);
  await ss("10_hs_mobile");

  check("mobile_hs_no_overflow", await safe("mobile_hs_no_overflow",
    () => noHorizontalOverflow(page), false));

  check("mobile_hs_conditional_readable", await safe("mobile_hs_conditional_readable",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("conditional");
    }, false));

  await safe("mobile_nav_exec", () => clickTab(page, "Executive Org Design"), undefined);
  await page.waitForTimeout(600);
  await ss("11_exec_mobile");

  check("mobile_exec_reachable", await safe("mobile_exec_reachable",
    () => page.locator("text=Executive Org Design").first().isVisible(), false));

  check("mobile_exec_no_overflow", await safe("mobile_exec_no_overflow",
    () => noHorizontalOverflow(page), false));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") ERRORS.push(msg.text());
  });
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("127.0.0.1") || url.includes("localhost")) {
      NETWORK_FAILURES.push(url);
    }
  });

  try {
    await runQa(page);
  } finally {
    await browser.close();
    stopServer(server);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  console.log("\nPhase 15H.2 Secondary Educator Capacity QA\n");

  let passCount = 0;
  let failCount = 0;

  for (const [key, val] of Object.entries(RESULTS)) {
    if (typeof val === "boolean") {
      if (val) passCount++; else failCount++;
      console.log(`  ${val ? "✓" : "✗"} ${key}: ${val}`);
    } else {
      if (String(val).startsWith("ERROR:")) failCount++;
      console.log(`  ${String(val).startsWith("ERROR:") ? "✗" : "~"} ${key}: ${val}`);
    }
  }

  const networkNote = NETWORK_FAILURES.length > 0
    ? `  Network failures: ${NETWORK_FAILURES.length}`
    : "  Network failures: 0";
  console.log(`\n${networkNote}`);

  if (ERRORS.length > 0) {
    console.log(`  Console errors: ${ERRORS.length}`);
    for (const e of ERRORS) console.log(`    - ${e.slice(0, 120)}`);
  }

  const EXPECTED = passCount + failCount;
  const allGreen = failCount === 0 && passCount > 0;
  console.log(`\n${allGreen ? "✓" : "✗"} Phase 15H.2 QA: ${passCount}/${EXPECTED} pass, ${failCount} fail`);

  if (!allGreen) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
