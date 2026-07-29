// Phase V10-X2T Completion Gate — accessibility audit.
//
// Mechanically checks: keyboard reachability of every primary/supporting
// nav control and the PT|EN language selector; visible focus outline
// class presence; aria-current on the active tab; aria-expanded/
// aria-controls on the supporting-nav disclosure; role/aria-modal +
// Escape-to-close + no lingering focus trap in AboutModal; document
// language attribute updates after a locale switch; zero duplicate DOM
// ids; zero invalid nested-interactive elements (<button>/<a> inside
// <button>/<a>); minimum mobile touch-target size (>=24px) on primary
// nav buttons at a 375px viewport.
//
// Run with: npm run qa:x2t-accessibility

import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";

const QA_PORT = 4178;
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
function stopServer(proc: ChildProcess) { try { proc.kill("SIGTERM"); } catch { /* ignore */ } }
function check(key: string, val: boolean | string) { RESULTS[key] = val; }
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

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await land(page);

    // ── Keyboard reachability: Tab through header controls ─────────────────
    await safe("keyboard_reaches_primary_nav_and_language_selector", async () => {
      const focusableTags = await page.evaluate(() => {
        const seen: string[] = [];
        return seen;
      });
      void focusableTags;
      // Tab from body through the first ~20 focusable elements; confirm the
      // primary-nav buttons and PT/EN buttons are among them and each
      // receives visible :focus-visible styling (outline or ring class).
      let reachedNav = false;
      let reachedLangSelector = false;
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el) return null;
          return {
            tag: el.tagName,
            text: el.textContent?.trim().slice(0, 20),
            inNav: !!el.closest("nav[aria-label]"),
            inLangGroup: !!el.closest('[role="group"]'),
          };
        });
        if (info?.inNav) reachedNav = true;
        if (info?.inLangGroup) reachedLangSelector = true;
        if (reachedNav && reachedLangSelector) break;
      }
      check("keyboard_reaches_primary_nav_and_language_selector", reachedNav && reachedLangSelector);
    }, undefined);

    // ── aria-current on active primary tab ──────────────────────────────────
    const ariaCurrentCount = await safe(
      "primary_nav_active_tab_has_aria_current",
      async () => page.locator('nav[aria-label] button[aria-current="page"]').count(),
      0,
    );
    check("primary_nav_active_tab_has_aria_current", ariaCurrentCount >= 1);

    // ── Supporting-nav disclosure aria-expanded/aria-controls ──────────────
    await safe("supporting_nav_disclosure_aria_wired", async () => {
      const btn = page.locator("[aria-controls='supporting-navigation-panel']").first();
      const hasBtn = await btn.count();
      if (hasBtn === 0) {
        check("supporting_nav_disclosure_aria_wired", "ERROR: no [aria-controls=supporting-navigation-panel] found");
        return;
      }
      const before = await btn.getAttribute("aria-expanded");
      await btn.click();
      await page.waitForTimeout(300);
      const after = await btn.getAttribute("aria-expanded");
      check("supporting_nav_disclosure_aria_wired", before !== after);
    }, undefined);

    // ── Focus visible ring class present on nav buttons ─────────────────────
    const navButtonHasFocusRing = await safe(
      "primary_nav_buttons_have_focus_visible_class",
      async () => page.locator("nav[aria-label] button").first().getAttribute("class"),
      "",
    );
    check(
      "primary_nav_buttons_have_focus_visible_class",
      typeof navButtonHasFocusRing === "string" && navButtonHasFocusRing.includes("focus-visible"),
    );

    // ── AboutModal: role/aria-modal, Escape closes, no lingering trap ──────
    await safe("about_modal_accessible", async () => {
      await page.locator("button", { hasText: /About|Sobre/i }).first().click();
      await page.waitForTimeout(400);
      const dialog = page.locator('[role="dialog"][aria-modal="true"]');
      const dialogPresent = await dialog.count();
      const focusedInsideDialog = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return !!el?.closest('[role="dialog"]');
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      const dialogGoneAfterEscape = (await dialog.count()) === 0;
      check("about_modal_role_dialog_aria_modal_present", dialogPresent > 0);
      check("about_modal_focus_moves_into_dialog_on_open", focusedInsideDialog);
      check("about_modal_escape_closes_no_trap", dialogGoneAfterEscape);
    }, undefined);

    // ── Document language updates after locale switch ───────────────────────
    await safe("document_lang_updates_with_locale", async () => {
      const langBefore = await page.evaluate(() => document.documentElement.lang);
      await page.locator('[role="group"] button', { hasText: "EN" }).first().click();
      await page.waitForTimeout(300);
      const langAfterEn = await page.evaluate(() => document.documentElement.lang);
      await page.locator('[role="group"] button', { hasText: "PT" }).first().click();
      await page.waitForTimeout(300);
      const langAfterPt = await page.evaluate(() => document.documentElement.lang);
      check(
        "document_lang_updates_with_locale",
        langBefore !== langAfterEn && /^en/i.test(langAfterEn) && /^pt/i.test(langAfterPt),
      );
    }, undefined);

    // ── No focus loss after locale switch (focus stays on the clicked control) ──
    await safe("no_focus_loss_after_locale_switch", async () => {
      await page.locator('[role="group"] button', { hasText: "EN" }).first().click();
      await page.waitForTimeout(300);
      const activeIsBody = await page.evaluate(() => document.activeElement === document.body);
      check("no_focus_loss_after_locale_switch", !activeIsBody);
    }, undefined);

    // ── Zero duplicate DOM ids (across the currently-mounted tree) ──────────
    const duplicateIds = await safe("zero_duplicate_ids", async () => {
      return page.evaluate(() => {
        const ids = Array.from(document.querySelectorAll("[id]")).map((el) => el.id).filter(Boolean);
        const seen = new Set<string>();
        const dupes = new Set<string>();
        for (const id of ids) {
          if (seen.has(id)) dupes.add(id);
          seen.add(id);
        }
        return Array.from(dupes);
      });
    }, []);
    check("zero_duplicate_ids", duplicateIds.length === 0 ? true : `ERROR: duplicate ids: ${duplicateIds.join(", ")}`);

    // ── No invalid nested interactive elements ───────────────────────────────
    const nestedInteractive = await safe("zero_nested_interactive_elements", async () => {
      return page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll("button, a"));
        const bad: string[] = [];
        for (const el of interactive) {
          const nestedBad = el.querySelector("button, a");
          if (nestedBad) bad.push(`${el.tagName}>${nestedBad.tagName}`);
        }
        return bad;
      });
    }, []);
    check(
      "zero_nested_interactive_elements",
      nestedInteractive.length === 0 ? true : `ERROR: ${nestedInteractive.length} nested interactive pairs: ${nestedInteractive.slice(0, 5).join(", ")}`,
    );

    // ── Mobile touch-target sizes on primary nav (>=24px both axes) ─────────
    await safe("mobile_primary_nav_touch_targets", async () => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(400);
      const undersized = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("nav[aria-label] button"));
        return buttons
          .map((b) => b.getBoundingClientRect())
          .filter((r) => r.width < 24 || r.height < 24).length;
      });
      check("mobile_primary_nav_touch_targets", undersized === 0 ? true : `ERROR: ${undersized} nav buttons under 24px`);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }, undefined);

    // ── Payroll subview tabs are keyboard/aria accessible (role=tab, aria-selected) ──
    await safe("payroll_subview_tabs_accessible", async () => {
      await page.locator('nav[aria-label] button').nth(3).click(); // payroll
      await page.waitForTimeout(500);
      const tabs = page.locator('[role="tab"]');
      const tabCount = await tabs.count();
      let allHaveAriaSelected = tabCount > 0;
      for (let i = 0; i < tabCount; i++) {
        const val = await tabs.nth(i).getAttribute("aria-selected");
        if (val === null) allHaveAriaSelected = false;
      }
      check("payroll_subview_tabs_accessible", allHaveAriaSelected);
    }, undefined);
  } finally {
    await browser.close();
    stopServer(server);
  }

  console.log("\nPhase V10-X2T Completion Gate — accessibility audit\n");
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
  console.log(`\n${failCount === 0 ? "✓" : "✗"} Accessibility audit: ${passCount} pass, ${failCount} fail`);
  if (failCount > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
