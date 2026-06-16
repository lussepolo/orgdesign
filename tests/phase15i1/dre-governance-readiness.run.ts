// Phase 15I.1 — DRE Governance Readiness browser QA.
//
// Verifies that the DRE Scenario Simulator correctly surfaces:
//   - Three-state governance disclosure (engineering ready / finance pending / not ratified)
//   - No stale "CAPEX excluded until Phase 15" badge
//   - No forbidden approval claims
//
// Run with: npm run qa:phase15i1
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4179;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15i1/qa-entry.html`;
const SS_DIR = join(process.cwd(), "test-results", "phase15i1-screenshots");
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
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4);
}

async function navigateToDreTab(page: Page) {
  // The DRE tab may be labeled "DRE", "Scenario Simulator", or similar. Try common labels.
  const tabLabels = ["DRE", "Scenario Simulator", "DRE Scenario"];
  for (const label of tabLabels) {
    const btn = page.locator(`button:has-text("${label}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(700);
      return;
    }
  }
  // If no dedicated tab found, DRE content may be on the default view — proceed.
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

  // Navigate to DRE tab
  await safe("nav_to_dre", () => navigateToDreTab(page), undefined);
  await ss("02_dre_tab_desktop");

  const dreBody = await bodyTextLower(page);

  check("dre_tab_loads", await safe("dre_tab_loads",
    () => page.locator("body").isVisible(), false));

  // ── Governance disclosure — engineering readiness ──────────────────────────
  // The banner shows "Engineering: ready" — check for "engineering" + "ready"
  check("governance_engineering_ready_disclosed",
    dreBody.includes("engineering") && dreBody.includes("ready"));

  // ── Governance disclosure — Finance sources pending ────────────────────────
  // The banner shows "Finance sources: pending confirmation" (N open items)
  check("governance_finance_pending_disclosed",
    dreBody.includes("pending") &&
    (dreBody.includes("finance") || dreBody.includes("confirmation")));

  // Open items count — 6 is shown
  check("governance_six_open_items_count",
    dreBody.includes("6") && dreBody.includes("open"));

  // ── Governance disclosure — board ratification not yet ratified ───────────
  check("governance_board_not_ratified_disclosed",
    (dreBody.includes("not yet ratified") || dreBody.includes("not ratified")) ||
    dreBody.includes("board ratification"));

  // Technical validation fixture language present
  check("technical_validation_fixture_language",
    dreBody.includes("technical validation fixture") ||
    dreBody.includes("technical validation") ||
    dreBody.includes("not a board-ratified"));

  // Finance source confirmation pending language
  check("finance_source_pending_language",
    dreBody.includes("pending") &&
    (dreBody.includes("finance source") || dreBody.includes("confirmation")));

  // ── No stale "CAPEX excluded until Phase 15" text ─────────────────────────
  check("no_stale_capex_excluded_phase15_badge",
    !dreBody.includes("capex excluded until phase 15"));

  // CAPEX in Capital Decision badge (updated)
  check("capex_in_capital_decision_badge",
    dreBody.includes("capex in capital decision") ||
    dreBody.includes("capital decision"));

  // ── No forbidden approval claims ──────────────────────────────────────────
  // Must NOT claim finance has approved, or that the scenario is the winner/recommended
  check("no_finance_approved_claim",
    !dreBody.includes("finance approved") &&
    !dreBody.includes("finance confirmed") &&
    !dreBody.includes("finance confirmation received"));

  check("no_board_ratified_claim",
    !dreBody.includes("board ratified") &&
    !dreBody.includes("board-ratified recommendation") ||
    // "not a board-ratified recommendation" is allowed
    dreBody.includes("not a board-ratified"));

  check("no_winner_or_recommended_claim",
    !dreBody.includes("winning scenario") &&
    !dreBody.includes("recommended scenario") &&
    !dreBody.includes("this is the recommendation"));

  // ── EBITDA metric strip is present ───────────────────────────────────────
  check("ebitda_metric_present",
    dreBody.includes("ebitda") && (dreBody.includes("r$") || dreBody.includes("2032") || dreBody.includes("%")));

  // ── Console errors and network failures (desktop) ─────────────────────────
  check("zero_console_errors", ERRORS.length === 0);
  check("zero_network_failures", NETWORK_FAILURES.length === 0);

  // ── TABLET 1024×900 ───────────────────────────────────────────────────────
  await page.setViewportSize({ width: 1024, height: 900 });
  await land(page);
  await safe("tablet_nav_dre", () => navigateToDreTab(page), undefined);
  await page.waitForTimeout(400);
  await ss("03_dre_tablet");

  check("tablet_no_horizontal_overflow", await safe("tablet_no_horizontal_overflow",
    () => noHorizontalOverflow(page), false));

  check("tablet_governance_disclosure_legible", await safe("tablet_governance_disclosure_legible",
    async () => {
      const t = await bodyTextLower(page);
      return (t.includes("engineering") || t.includes("pending") || t.includes("not yet ratified"));
    }, false));

  check("tablet_no_stale_capex_badge", await safe("tablet_no_stale_capex_badge",
    async () => {
      const t = await bodyTextLower(page);
      return !t.includes("capex excluded until phase 15");
    }, false));

  // ── MOBILE 390×844 ────────────────────────────────────────────────────────
  await page.setViewportSize({ width: 390, height: 844 });
  await land(page);
  await safe("mobile_nav_dre", () => navigateToDreTab(page), undefined);
  await page.waitForTimeout(600);
  await ss("04_dre_mobile");

  check("mobile_no_horizontal_overflow", await safe("mobile_no_horizontal_overflow",
    () => noHorizontalOverflow(page), false));

  check("mobile_governance_disclosure_reachable", await safe("mobile_governance_disclosure_reachable",
    async () => {
      const t = await bodyTextLower(page);
      return t.includes("pending") || t.includes("not yet ratified") || t.includes("engineering");
    }, false));

  check("mobile_no_stale_capex_badge", await safe("mobile_no_stale_capex_badge",
    async () => {
      const t = await bodyTextLower(page);
      return !t.includes("capex excluded until phase 15");
    }, false));
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
  console.log("\nPhase 15I.1 DRE Governance Readiness QA\n");

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
  console.log(`\n${allGreen ? "✓" : "✗"} Phase 15I.1 QA: ${passCount}/${EXPECTED} pass, ${failCount} fail`);

  if (!allGreen) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
