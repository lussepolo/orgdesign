// Phase 15G.2 — DRE → Capital Decision browser QA.
//
// Tests the full-app DRE handoff: DRE lever persistence, Send button,
// integrated Capital Decision view (read-only DRE fields, editable CAPEX,
// duplicate detection, CAPEX variant, scenario comparison).
//
// Run with: npm run qa:phase15g2
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4176;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15g2/qa-entry.html`;
const SS_DIR = join(process.cwd(), "test-results", "phase15g2-screenshots");
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
  // Dismiss the About modal that appears on first load. Click the X button
  // (the close button inside the modal) or the backdrop if present.
  const modal = page.locator(".fixed.inset-0.z-\\[100\\]");
  if (await modal.isVisible().catch(() => false)) {
    // Click the X close button inside the modal
    const closeBtn = page.locator("button").filter({ has: page.locator("svg") }).last();
    // Try clicking the backdrop edge first (top-left corner, outside modal content)
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
  await page.waitForTimeout(500);
}

// ── QA suite ─────────────────────────────────────────────────────────────────

async function runQa(page: Page) {
  const ss = (n: string) =>
    page.screenshot({ path: join(SS_DIR, n + ".png"), fullPage: false }).catch(() => {});

  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);
  await ss("01_cover");

  // ── 1. App loads and shows cover ──────────────────────────────────────────
  check("app_loads_cover", await safe("app_loads_cover",
    () => page.locator("text=Strategic").first().isVisible(), false));

  // ── 2. DRE Scenario Simulator tab is visible in nav ───────────────────────
  check("dre_tab_in_nav", await safe("dre_tab_in_nav",
    () => page.locator("button:has-text('DRE Scenario Simulator')").first().isVisible(), false));

  // ── 3. Capital Decision tab is visible in nav ─────────────────────────────
  check("capital_decision_tab_in_nav", await safe("capital_decision_tab_in_nav",
    () => page.locator("button:has-text('Decisão de Capital')").first().isVisible(), false));

  // ── 4. Navigate to DRE tab ────────────────────────────────────────────────
  await safe("nav_to_dre", async () => {
    await clickTab(page, "DRE Scenario Simulator");
    await page.waitForSelector("text=Send to Capital Decision", { timeout: 10_000 });
  }, undefined);
  await ss("02_dre_tab");

  check("dre_tab_heading", await safe("dre_tab_heading",
    () => page.locator("text=DRE Scenario Simulator").first().isVisible(), false));

  // ── 5. Send button is visible in DRE tab ─────────────────────────────────
  check("send_button_visible", await safe("send_button_visible",
    () => page.locator("button:has-text('Send to Capital Decision')").first().isVisible(), false));

  // ── 6. DRE lever selects are present (4 levers in DRE) ───────────────────
  check("dre_lever_selects_present", await safe("dre_lever_selects_present",
    async () => (await page.locator("select").count()) >= 4, false));

  // ── 7. Click Send → navigates to Capital Decision ─────────────────────────
  await safe("send_navigates_to_capital_decision", async () => {
    await page.locator("button:has-text('Send to Capital Decision')").first().click();
    await page.waitForSelector("text=DRE-imported scenarios", { timeout: 8_000 });
    check("capital_decision_integrated_view", true);
    await ss("03_capital_decision_after_send");
  }, undefined);
  if (!RESULTS["capital_decision_integrated_view"]) {
    check("capital_decision_integrated_view", false);
  }

  // ── 8. Capital Decision shows "Decisão de Capital" heading ───────────────
  check("capital_decision_heading", await safe("capital_decision_heading",
    () => page.locator("text=Decisão de Capital").first().isVisible(), false));

  // ── 9. First imported scenario appears with correct label ─────────────────
  check("scenario_1_in_capital_decision", await safe("scenario_1_in_capital_decision",
    () => page.locator("text=Scenario 1").first().isVisible(), false));

  // ── 10. DRE fields are read-only (no editable select for DRE levers) ──────
  check("dre_fields_read_only", await safe("dre_fields_read_only",
    async () => {
      // In integrated mode the 4 DRE fields are rendered as spans, not selects.
      // Only the CAPEX select should be present at this point.
      // We look for "Opening Grades (read-only)" text, or absence of
      // openingGrades select (id contains openingGrades).
      const dreSelects = await page.locator("select[id*='openingGrades']").count();
      return dreSelects === 0;
    }, false));

  // ── 11. CAPEX select is editable ─────────────────────────────────────────
  check("capex_select_editable", await safe("capex_select_editable",
    async () => {
      const capexSel = page.locator("select[id*='capex']").first();
      return (await capexSel.count()) > 0 && await capexSel.isVisible();
    }, false));

  // ── 12. CAPEX select change recalculates ─────────────────────────────────
  await safe("capex_lever_works_in_integrated", async () => {
    const capexSel = page.locator("select[id*='capex']").first();
    const textBefore = await page.locator("body").innerText();
    await capexSel.selectOption("capex_90m_brl");
    await page.waitForTimeout(400);
    const textAfter = await page.locator("body").innerText();
    check("capex_change_updates_view", textBefore !== textAfter);
    await ss("04_capex_90m");
    await capexSel.selectOption("capex_100m_brl");
    await page.waitForTimeout(300);
  }, undefined);

  // ── 13. CAPEX variant button is present ──────────────────────────────────
  check("capex_variant_button_visible", await safe("capex_variant_button_visible",
    () => page.locator("button:has-text('CAPEX variant')").first().isVisible(), false));

  // ── 14. Go back to DRE, send same config → already_present navigates immediately
  await safe("second_send_already_present", async () => {
    await clickTab(page, "DRE Scenario Simulator");
    await page.waitForSelector("button:has-text('Send to Capital Decision')", { timeout: 8_000 });
    await page.locator("button:has-text('Send to Capital Decision')").first().click();
    // Should navigate back to Capital Decision immediately (already_present)
    await page.waitForSelector("text=DRE-imported scenarios", { timeout: 8_000 });
    check("already_present_navigates", true);
    await ss("05_already_present");
  }, undefined);
  if (!RESULTS["already_present_navigates"]) {
    check("already_present_navigates", false);
  }

  // ── 15. Go back to DRE, change occupancy, send → second scenario ──────────
  // DreLeverPanel selects have no id; locate by the enclosing label text.
  await safe("new_scenario_after_occupancy_change", async () => {
    await clickTab(page, "DRE Scenario Simulator");
    await page.waitForSelector("button:has-text('Send to Capital Decision')", { timeout: 12_000 });
    await page.waitForTimeout(800);
    // Occupancy select is inside a label with text "Occupancy Scenario"
    const occSel = page.locator("label:has-text('Occupancy Scenario') select").first();
    await occSel.waitFor({ timeout: 10_000 });
    await occSel.selectOption("pessimista");
    await page.waitForTimeout(500);
    await page.locator("button:has-text('Send to Capital Decision')").first().click();
    await page.waitForSelector("text=DRE-imported scenarios", { timeout: 10_000 });
    check("second_scenario_created", await page.locator("text=Scenario 2").first().isVisible());
    await ss("06_two_scenarios");
  }, undefined);

  // ── 16. Scenario comparison panel is present when 2+ scenarios ────────────
  check("comparison_panel_visible", await safe("comparison_panel_visible",
    () => page.locator("text=Scenario output comparison").first().isVisible(), false));

  // ── 17. DRE selections persist when returning to DRE tab ─────────────────
  await safe("dre_selections_persist", async () => {
    // We already changed occupancy to "pessimista" above.
    await clickTab(page, "DRE Scenario Simulator");
    await page.waitForTimeout(800);
    const occSel = page.locator("label:has-text('Occupancy Scenario') select").first();
    await occSel.waitFor({ timeout: 10_000 });
    const currentVal = await occSel.inputValue();
    check("dre_occupancy_persists_as_pessimista", currentVal === "pessimista");
    await ss("07_dre_persists_occupancy");
  }, undefined);

  // ── 18. "Go to DRE Simulator" button in Capital Decision navigates back ───
  await safe("go_to_dre_button_works", async () => {
    await clickTab(page, "Decisão de Capital");
    await page.waitForTimeout(400);
    const dreBtn = page.locator("button:has-text('Go to DRE Simulator')").first();
    if (await dreBtn.isVisible()) {
      await dreBtn.click();
      await page.waitForSelector("button:has-text('Send to Capital Decision')", { timeout: 8_000 });
      check("go_to_dre_navigates", true);
    } else {
      check("go_to_dre_navigates", "button not visible — skipped");
    }
  }, undefined);

  // ── 19. No horizontal overflow ────────────────────────────────────────────
  await clickTab(page, "Decisão de Capital");
  await page.waitForTimeout(400);
  check("no_horizontal_overflow", await safe("no_horizontal_overflow",
    () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4), false));
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
    NETWORK_FAILURES.push(req.url());
  });

  try {
    await runQa(page);
  } finally {
    await browser.close();
    stopServer(server);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  console.log("\nPhase 15G.2 DRE → Capital Decision QA\n");

  let passCount = 0;
  let failCount = 0;
  const NON_BOOL_INFO_KEYS = new Set(["default_vpl", "default_spread", "default_payback",
    "default_calc_status", "default_meets_reference_language", "default_no_approved_viable_rejected_as_status"]);

  for (const [key, val] of Object.entries(RESULTS)) {
    const isInfo = NON_BOOL_INFO_KEYS.has(key) || typeof val === "string" && !val.startsWith("ERROR:");
    const pass = typeof val === "boolean" ? val : !String(val).startsWith("ERROR:");
    if (typeof val === "boolean") {
      if (val) passCount++; else failCount++;
      console.log(`  ${val ? "✓" : "✗"} ${key}: ${val}`);
    } else {
      if (String(val).startsWith("ERROR:")) { failCount++; }
      console.log(`  ${String(val).startsWith("ERROR:") ? "✗" : "·"} ${key}: ${val}`);
    }
    void pass; void isInfo;
  }

  const networkNote = NETWORK_FAILURES.length > 0
    ? `  Network failures: ${NETWORK_FAILURES.length}`
    : "  Network failures: 0";
  console.log(`\n${networkNote}`);
  if (ERRORS.length > 0) {
    console.log(`  Console errors: ${ERRORS.length}`);
    for (const e of ERRORS) console.log(`    - ${e.slice(0, 120)}`);
  }

  const EXPECTED = 19;
  const allGreen = failCount === 0 && passCount >= EXPECTED;
  console.log(`\n${allGreen ? "✓" : "✗"} Phase 15G.2 QA: ${passCount}/${EXPECTED} pass, ${failCount} fail`);

  if (!allGreen) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
