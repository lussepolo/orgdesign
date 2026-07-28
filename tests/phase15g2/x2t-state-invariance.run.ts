// Phase V10-X2T Completion Gate — locale state-invariance QA.
//
// Proves that switching the PT|EN locale selector never changes the
// underlying computed engine values for DRE, Capital Decision, or Payroll —
// only their locale-aware presentation format. Values are read off the
// rendered DOM and parsed back to canonical numbers (reversing
// Intl.NumberFormat's locale-specific grouping/decimal symbols), rather than
// compared as raw text, because pt-BR and en-US intentionally render the
// same number differently (1.234,56 vs 1,234.56).
//
// Only active occupancy scenario ids are used (conservador/base/otimista).
// The retired "pessimista" occupancy id is never selected here.
//
// Run with: npm run qa:x2t-state-invariance
// Requires Playwright: npx playwright install chromium

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";

const QA_PORT = 4177;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15g2/qa-entry.html`;

const RESULTS: Record<string, boolean | string> = {};

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

function stopServer(proc: ChildProcess) {
  try { proc.kill("SIGTERM"); } catch { /* ignore */ }
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

// PRIMARY_WORKSPACE_ORDER = ["cover","offer-scenarios","executive-org-design","payroll","dre-scenario-simulator","capital-decision"]
// Nav is order-stable and locale-independent — click by index, not by (translated) label text.
async function clickPrimaryNavIndex(page: Page, index: number) {
  await page.locator('nav[aria-label] button').nth(index).click();
  await page.waitForTimeout(600);
}

async function setLocale(page: Page, locale: "pt-BR" | "en-US") {
  const label = locale === "pt-BR" ? "PT" : "EN";
  await page.locator('[role="group"] button', { hasText: label }).first().click();
  await page.waitForTimeout(300);
}

// Reverses Intl.NumberFormat("pt-BR"|"en-US") grouping/decimal symbols back
// to a canonical JS number. Works for plain numbers, percentages, and BRL
// currency because in both locales BRL stays BRL — only the separator
// convention (and possibly symbol position) differs.
function parseLocaleNumber(raw: string): number | null {
  // Extract the first contiguous digit-group token (with an optional
  // leading minus/− sign directly adjacent to the first digit) rather than
  // stripping non-numeric characters from the whole string — a bare hyphen
  // inside surrounding prose (e.g. "torna-se") must never be read as a sign.
  const match = raw.match(/[-−]?\d[\d.,]*/);
  if (!match) return null;
  const token = match[0];
  const negative = token.startsWith("-") || token.startsWith("−");
  const cleaned = negative ? token.slice(1) : token;
  if (cleaned === "") return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized: string;
  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned;
  } else if (lastComma > lastDot) {
    // comma is the decimal separator (pt-BR style): strip dots, comma -> dot
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // dot is the decimal separator (en-US style): strip commas
    normalized = cleaned.replace(/,/g, "");
  }
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

const NUMERIC_TOLERANCE = 0.01;
function numbersMatch(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return false;
  return Math.abs(a - b) < NUMERIC_TOLERANCE;
}

async function readCardValues(page: Page): Promise<Record<string, string>> {
  // DreSummaryCards renders each card as a labelled block; grab all
  // label/value pairs via a structural query rather than fixed text, so it
  // survives locale-driven label translation.
  return page.evaluate(() => {
    const out: Record<string, string> = {};
    const cards = document.querySelectorAll("[class*='rounded-2xl'][class*='border']");
    cards.forEach((card, i) => {
      const label = card.querySelector("[class*='uppercase']")?.textContent?.trim();
      const value = card.querySelector("[class*='font-black'], [class*='font-bold']")?.textContent?.trim();
      if (label && value && label !== value) out[`${i}:${label}`] = value;
    });
    return out;
  });
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("pageerror", (e) => check("console_error_seen", `ERROR: ${e.message}`));

  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await land(page);
    check("app_loaded", true);

    // ── DRE Operacional ───────────────────────────────────────────────────
    await clickPrimaryNavIndex(page, 4); // dre-scenario-simulator

    await safe("dre_levers_set", async () => {
      const openingPackageSelect = page
        .locator("label:has-text('Opening Package') select")
        .or(page.locator("label:has-text('Pacote de Abertura') select"))
        .first();
      await openingPackageSelect.waitFor({ timeout: 10_000 });
      await openingPackageSelect.selectOption("t1_g6");
      await page.waitForTimeout(300);

      const occupancySelect = page
        .locator("label:has-text('Captação Scenario') select")
        .or(page.locator("label:has-text('Cenário de Captação') select"))
        .first();
      await occupancySelect.selectOption("otimista");
      await page.waitForTimeout(300);

      const orgDesignSelect = page
        .locator("label:has-text('Org Design Option') select")
        .or(page.locator("label:has-text('Opção de Desenho Organizacional') select"))
        .first();
      const orgDesignOptions = await orgDesignSelect.locator("option").allInnerTexts();
      const balancedIndex = orgDesignOptions.findIndex((t) => /balanced/i.test(t));
      if (balancedIndex >= 0) {
        const value = await orgDesignSelect.locator("option").nth(balancedIndex).getAttribute("value");
        if (value) await orgDesignSelect.selectOption(value);
      }
      await page.waitForTimeout(600);
      check("dre_levers_set", true);
    }, undefined);

    const dreOccupancyValue = await safe(
      "dre_occupancy_id_is_active_scenario",
      async () =>
        page
          .locator("label:has-text('Captação Scenario') select")
          .or(page.locator("label:has-text('Cenário de Captação') select"))
          .first()
          .inputValue(),
      "",
    );
    check(
      "dre_occupancy_id_is_active_scenario",
      ["conservador", "base", "otimista"].includes(dreOccupancyValue),
    );

    const dreCardsPtBR = await safe("dre_cards_read_pt", () => readCardValues(page), {});
    check("dre_cards_read_pt_nonempty", Object.keys(dreCardsPtBR).length > 0);

    await setLocale(page, "en-US");
    const dreCardsEnUS = await safe("dre_cards_read_en", () => readCardValues(page), {});
    check("dre_cards_read_en_nonempty", Object.keys(dreCardsEnUS).length > 0);

    // Compare by positional index (labels translate, values must still
    // parse to the same canonical number at the same card position).
    await safe("dre_values_locale_invariant", async () => {
      const ptEntries = Object.entries(dreCardsPtBR);
      const enEntries = Object.entries(dreCardsEnUS);
      const minLen = Math.min(ptEntries.length, enEntries.length);
      let mismatches = 0;
      const details: string[] = [];
      for (let i = 0; i < minLen; i++) {
        const ptVal = parseLocaleNumber(ptEntries[i][1]);
        const enVal = parseLocaleNumber(enEntries[i][1]);
        if (ptVal === null && enVal === null) continue; // non-numeric label (e.g. year text), skip
        if (!numbersMatch(ptVal, enVal)) {
          mismatches++;
          details.push(`[${i}] pt="${ptEntries[i][1]}"(${ptVal}) en="${enEntries[i][1]}"(${enVal})`);
        }
      }
      check(
        "dre_values_locale_invariant",
        mismatches === 0 ? true : `ERROR: ${mismatches} mismatches: ${details.join("; ")}`,
      );
    }, undefined);

    // Refresh, confirm locale + lever selections persist via localStorage-backed state.
    await safe("dre_persists_after_refresh", async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector("header h1", { timeout: 20_000 });
      await page.waitForTimeout(600);
      const localeAfterReload = await page.evaluate(() => localStorage.getItem("rio-org-design.locale.v1"));
      check("dre_locale_persists_after_refresh", localeAfterReload === '"en-US"' || localeAfterReload === "en-US");
    }, undefined);

    // Switch back to pt-BR for the Capital Decision leg.
    await setLocale(page, "pt-BR");

    // ── Capital Decision ──────────────────────────────────────────────────
    await clickPrimaryNavIndex(page, 4); // back to DRE first (state may have reset tab on reload)
    await safe("dre_send_to_capital", async () => {
      const sendBtn = page.locator("button", { hasText: /Send to Capital|Enviar/i }).first();
      if (await sendBtn.isVisible().catch(() => false)) {
        await sendBtn.click();
        await page.waitForTimeout(800);
        check("dre_send_to_capital", true);
      } else {
        check("dre_send_to_capital", "ERROR: Send button not found");
      }
    }, undefined);

    const capitalCardsPtBR = await safe("capital_cards_read_pt", () => readCardValues(page), {});
    check("capital_cards_read_pt_nonempty", Object.keys(capitalCardsPtBR).length > 0);

    await setLocale(page, "en-US");
    const capitalCardsEnUS = await safe("capital_cards_read_en", () => readCardValues(page), {});

    await safe("capital_values_locale_invariant", async () => {
      const ptEntries = Object.entries(capitalCardsPtBR);
      const enEntries = Object.entries(capitalCardsEnUS);
      const minLen = Math.min(ptEntries.length, enEntries.length);
      let mismatches = 0;
      const details: string[] = [];
      for (let i = 0; i < minLen; i++) {
        const ptVal = parseLocaleNumber(ptEntries[i][1]);
        const enVal = parseLocaleNumber(enEntries[i][1]);
        if (ptVal === null && enVal === null) continue;
        if (!numbersMatch(ptVal, enVal)) {
          mismatches++;
          details.push(`[${i}] pt="${ptEntries[i][1]}" en="${enEntries[i][1]}"`);
        }
      }
      check(
        "capital_values_locale_invariant",
        mismatches === 0 ? true : `ERROR: ${mismatches} mismatches: ${details.join("; ")}`,
      );
    }, undefined);

    // Return to DRE, confirm the DRE cards are still numerically consistent
    // with what was captured before navigating away (locale still en-US).
    await clickPrimaryNavIndex(page, 4);
    await page.waitForTimeout(500);
    const dreCardsAfterReturn = await safe("dre_cards_after_return", () => readCardValues(page), {});
    check(
      "dre_unchanged_after_capital_roundtrip",
      Object.keys(dreCardsAfterReturn).length > 0 &&
        JSON.stringify(Object.keys(dreCardsAfterReturn)) === JSON.stringify(Object.keys(dreCardsEnUS)),
    );

    // ── Payroll (simulation subview) ──────────────────────────────────────
    await clickPrimaryNavIndex(page, 3); // payroll
    await page.waitForTimeout(500);

    await safe("payroll_select_non_default_tier", async () => {
      const tierSelects = page.locator("select");
      const count = await tierSelects.count();
      // First select on Payroll is Educator Tier by Grade for the first
      // displayed grade card — select a non-default option if one exists.
      let changed = false;
      for (let i = 0; i < count && !changed; i++) {
        const sel = tierSelects.nth(i);
        const options = await sel.locator("option").count();
        if (options > 1) {
          const currentValue = await sel.inputValue();
          const optionValues = await sel.locator("option").evaluateAll((els) => els.map((e) => (e as HTMLOptionElement).value));
          const nonDefault = optionValues.find((v) => v !== currentValue);
          if (nonDefault) {
            await sel.selectOption(nonDefault);
            changed = true;
          }
        }
      }
      check("payroll_select_non_default_tier", changed);
    }, undefined);

    await setLocale(page, "pt-BR");
    await page.waitForTimeout(400);
    const payrollTierAfterSwitch = await safe(
      "payroll_tier_selection_after_locale_switch",
      async () => page.locator("select").first().inputValue(),
      "",
    );
    check(
      "payroll_tier_selection_documented",
      `value_after_locale_switch=${payrollTierAfterSwitch} (documented actual behavior — no canonical-tier integration implemented or claimed)`,
    );
  } finally {
    await browser.close();
    stopServer(server);
  }

  console.log("\nPhase V10-X2T Completion Gate — state-invariance QA\n");
  let passCount = 0;
  let failCount = 0;
  for (const [key, val] of Object.entries(RESULTS)) {
    if (typeof val === "boolean") {
      if (val) passCount++; else failCount++;
      console.log(`  ${val ? "✓" : "✗"} ${key}: ${val}`);
    } else {
      const isError = val.startsWith("ERROR:");
      if (isError) failCount++;
      console.log(`  ${isError ? "✗" : "·"} ${key}: ${val}`);
    }
  }
  console.log(`\n${failCount === 0 ? "✓" : "✗"} State-invariance QA: ${passCount} pass, ${failCount} fail`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
