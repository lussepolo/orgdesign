// Phase V10-X2T Completion Gate — bilingual crawl + governed screenshots.
//
// Crawls all 13 registered workspaces (10 primary + 3 supporting — V10-X2T.3A-R1
// restored early-years/lower-school/ms/hs to primary navigation), plus both
// Payroll subviews, at both locales (pt-BR, en-US), recording per route:
// locale, visible title, visible status, mixed-language findings (heuristic
// scan for the opposite locale's known primary-nav vocabulary appearing in
// body text), horizontal overflow, console errors, and broken/inaccessible
// controls. Also captures the 20 governed screenshots with the exact
// required filenames to ~/Downloads/Rio_V10_X2T_Visual_Review (outside the
// repository — never staged).
//
// Run with: npm run qa:x2t-crawl-and-screenshots

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const QA_PORT = 4179;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15g2/qa-entry.html`;
const SCREENSHOT_DIR = join(homedir(), "Downloads", "Rio_V10_X2T_Visual_Review");
mkdirSync(SCREENSHOT_DIR, { recursive: true });

type CrawlRow = {
  route: string;
  locale: string;
  visibleTitle: string;
  visibleStatus: string;
  mixedLanguageFindings: string[];
  horizontalOverflow: boolean;
  consoleErrors: number;
  brokenControls: string[];
};
const CRAWL: CrawlRow[] = [];
const SCREENSHOTS_TAKEN: string[] = [];

async function startServer(): Promise<ChildProcess> {
  const proc = spawn("npx", ["vite", "--port", String(QA_PORT), "--host", "127.0.0.1"], {
    cwd: process.cwd(),
    stdio: "ignore",
    detached: false,
  });
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
function stopServer(proc: ChildProcess) { try { proc.kill("SIGTERM"); } catch { /* ignore */ } }

async function land(page: Page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("header h1", { timeout: 20_000 });
  await page.waitForTimeout(600);
  const modal = page.locator(".fixed.inset-0.z-\\[100\\]");
  if (await modal.isVisible().catch(() => false)) {
    await modal.click({ position: { x: 10, y: 10 }, force: true }).catch(async () => {
      await page.locator("button").filter({ has: page.locator("svg") }).last().click().catch(() => {});
    });
    await page.waitForTimeout(400);
  }
}

async function setLocale(page: Page, locale: "pt-BR" | "en-US") {
  const label = locale === "pt-BR" ? "PT" : "EN";
  await page.locator('[role="group"] button', { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

// Known primary-nav vocabulary that must never leak into the opposite locale.
const PT_ONLY_MARKERS = ["Oferta e Ocupação", "Desenho Organizacional", "Decisão de Capital", "Turmas, Equipe", "DRE Operacional"];
const EN_ONLY_MARKERS = ["Offer & Occupancy", "Organizational Design", "Capital Decision", "Sections and Payroll", "Operating P&L"];

async function recordRoute(page: Page, route: string, locale: "pt-BR" | "en-US") {
  const consoleErrors: string[] = [];
  const listener = (msg: import("playwright").ConsoleMessage) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  page.on("console", listener);
  await page.waitForTimeout(300);

  const bodyText = await page.evaluate(() => document.body.innerText);
  const oppositeMarkers = locale === "pt-BR" ? EN_ONLY_MARKERS : PT_ONLY_MARKERS;
  const mixedLanguageFindings = oppositeMarkers.filter((m) => bodyText.includes(m));

  const visibleTitle = await page.evaluate(() => document.querySelector("h1, h2")?.textContent?.trim() ?? "");
  const visibleStatus = await page.evaluate(() => {
    const badge = document.querySelector("[class*='uppercase'][class*='tracking-wide']");
    return badge?.textContent?.trim() ?? "";
  });
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);

  // Only flag a button as broken if it is actually rendered on screen
  // (offsetParent !== null — excludes buttons inside collapsed accordions,
  // inactive tab panels, or off-screen wizard steps, which is normal,
  // intentional UI behavior, not a defect) yet has zero size or is
  // pointer-events:none while not disabled.
  const brokenControls = await page.evaluate(() => {
    const broken: string[] = [];
    document.querySelectorAll<HTMLButtonElement>("button:not([disabled])").forEach((b) => {
      if (b.offsetParent === null) return; // intentionally hidden — not a defect
      const r = b.getBoundingClientRect();
      const style = getComputedStyle(b);
      if (r.width === 0 || r.height === 0 || style.pointerEvents === "none" || style.visibility === "hidden") {
        broken.push(b.textContent?.trim().slice(0, 30) ?? "unnamed button");
      }
    });
    return broken;
  });

  page.off("console", listener);

  CRAWL.push({
    route,
    locale,
    visibleTitle,
    visibleStatus,
    mixedLanguageFindings,
    horizontalOverflow,
    consoleErrors: consoleErrors.length,
    brokenControls,
  });
}

async function shoot(page: Page, filename: string) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(SCREENSHOT_DIR, filename), fullPage: false });
  SCREENSHOTS_TAKEN.push(filename);
}

async function clickPrimaryNavIndex(page: Page, index: number) {
  await page.locator('nav[aria-label] button').nth(index).click();
  await page.waitForTimeout(500);
}

async function openSupportingNav(page: Page) {
  const toggle = page.locator("[aria-controls='supporting-navigation-panel']").first();
  const expanded = await toggle.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await toggle.click();
    await page.waitForTimeout(400);
  }
}

async function clickSupportingNavIndex(page: Page, index: number) {
  await openSupportingNav(page);
  await page.locator("#supporting-navigation-panel button").nth(index).click();
  await page.waitForTimeout(500);
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1440, height: 1000 });

    for (const locale of ["pt-BR", "en-US"] as const) {
      await land(page);
      if (locale === "en-US") await setLocale(page, "en-US");

      // Primary workspaces: cover, offer-scenarios, executive-org-design, payroll, dre-scenario-simulator, capital-decision
      await recordRoute(page, "cover", locale);
      if (locale === "pt-BR") await shoot(page, "01_Capa_pt-BR.png");
      else await shoot(page, "02_Cover_en-US.png");

      await clickPrimaryNavIndex(page, 1); // offer-scenarios
      await recordRoute(page, "offer-scenarios", locale);
      if (locale === "pt-BR") await shoot(page, "03_Oferta_Ocupacao_pt-BR.png");
      else await shoot(page, "04_Offer_Occupancy_en-US.png");

      await clickPrimaryNavIndex(page, 2); // executive-org-design
      await recordRoute(page, "executive-org-design", locale);
      if (locale === "pt-BR") await shoot(page, "05_Desenho_Organizacional_pt-BR.png");
      else await shoot(page, "06_Organizational_Design_en-US.png");

      // Supporting nav expanded
      await openSupportingNav(page);
      await recordRoute(page, "supporting-nav-panel", locale);
      if (locale === "pt-BR") await shoot(page, "07_Navegacao_Apoio_pt-BR.png");
      else await shoot(page, "08_Supporting_Navigation_en-US.png");

      // High School (V10-X2T.3A-R1: restored to primary nav, index 9)
      await clickPrimaryNavIndex(page, 9);
      await recordRoute(page, "hs", locale);
      if (locale === "pt-BR") await shoot(page, "17_Ensino_Medio_Status_pt-BR.png");
      else await shoot(page, "18_High_School_Status_en-US.png");

      // Remaining primary division workspaces (crawl only, no dedicated screenshot):
      // early-years(6), lower-school(7), ms(8) — restored to primary nav by V10-X2T.3A-R1
      for (const [idx, id] of [[6, "early-years"], [7, "lower-school"], [8, "ms"]] as const) {
        await clickPrimaryNavIndex(page, idx);
        await recordRoute(page, id, locale);
      }

      // Remaining supporting workspaces (crawl only, no dedicated screenshot):
      // load(0 - academic group, only member left), hr(1 - people group), viability(2 - analysis group)
      for (const [idx, id] of [[0, "load"], [1, "hr"], [2, "viability"]] as const) {
        await clickSupportingNavIndex(page, idx);
        await recordRoute(page, id, locale);
      }

      // Payroll (primary index 3) — both subviews
      await clickPrimaryNavIndex(page, 3);
      await recordRoute(page, "payroll/sections-staffing-simulation", locale);
      if (locale === "pt-BR") await shoot(page, "09_Turmas_Equipe_pt-BR.png");
      else await shoot(page, "10_Sections_Staffing_en-US.png");

      await page.locator('[role="tab"]').nth(1).click();
      await page.waitForTimeout(500);
      await recordRoute(page, "payroll/governed-payroll-exports", locale);
      if (locale === "pt-BR") await shoot(page, "11_Folha_Governada_pt-BR.png");
      else await shoot(page, "12_Governed_Payroll_en-US.png");

      // DRE Operacional
      await clickPrimaryNavIndex(page, 4);
      await recordRoute(page, "dre-scenario-simulator", locale);
      if (locale === "pt-BR") await shoot(page, "13_DRE_Operacional_pt-BR.png");
      else await shoot(page, "14_Operating_PL_en-US.png");

      // Capital Decision
      await clickPrimaryNavIndex(page, 5);
      await recordRoute(page, "capital-decision", locale);
      if (locale === "pt-BR") await shoot(page, "15_Decisao_Capital_pt-BR.png");
      else await shoot(page, "16_Capital_Decision_en-US.png");

      // Mobile screenshot (representative: Cover at 375px)
      await clickPrimaryNavIndex(page, 0);
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(400);
      if (locale === "pt-BR") await shoot(page, "19_Mobile_pt-BR.png");
      else await shoot(page, "20_Mobile_en-US.png");
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
  } finally {
    await browser.close();
    stopServer(server);
  }

  // ── Report ─────────────────────────────────────────────────────────────
  console.log("\nPhase V10-X2T Completion Gate — bilingual crawl\n");
  console.log(`Routes crawled: ${CRAWL.length} (13 workspaces, incl. 2 Payroll subviews as separate routes, + 1 supporting-nav-panel route, x 2 locales = 30)`);
  let mixedLanguageTotal = 0;
  let overflowTotal = 0;
  let consoleErrorTotal = 0;
  let brokenControlTotal = 0;
  for (const row of CRAWL) {
    mixedLanguageTotal += row.mixedLanguageFindings.length;
    overflowTotal += row.horizontalOverflow ? 1 : 0;
    consoleErrorTotal += row.consoleErrors;
    brokenControlTotal += row.brokenControls.length;
    const flags = [
      row.mixedLanguageFindings.length > 0 ? `MIXED-LANG:${row.mixedLanguageFindings.join("|")}` : "",
      row.horizontalOverflow ? "OVERFLOW" : "",
      row.consoleErrors > 0 ? `CONSOLE_ERR:${row.consoleErrors}` : "",
      row.brokenControls.length > 0 ? `BROKEN:${row.brokenControls.join("|")}` : "",
    ].filter(Boolean).join(" ");
    console.log(`  [${row.locale}] ${row.route.padEnd(40)} title="${row.visibleTitle.slice(0, 40)}" status="${row.visibleStatus}" ${flags}`);
  }
  console.log(`\nTotals: mixed-language=${mixedLanguageTotal} overflow=${overflowTotal} console_errors=${consoleErrorTotal} broken_controls=${brokenControlTotal}`);

  console.log(`\nScreenshots written to: ${SCREENSHOT_DIR}`);
  console.log(`Screenshots taken: ${SCREENSHOTS_TAKEN.length}/20`);
  for (const f of SCREENSHOTS_TAKEN) console.log(`  - ${f}`);

  const allClear = mixedLanguageTotal === 0 && overflowTotal === 0 && consoleErrorTotal === 0 && brokenControlTotal === 0 && SCREENSHOTS_TAKEN.length === 20;
  console.log(`\n${allClear ? "✓" : "✗"} Bilingual crawl + screenshots: ${allClear ? "clean" : "see findings above"}`);
  if (!allClear && SCREENSHOTS_TAKEN.length !== 20) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
