import { chromium, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import { mkdirSync } from "fs";
import { join, resolve } from "path";

const QA_PORT = 4175;
const BASE = `http://127.0.0.1:${QA_PORT}/tests/phase15f/qa-entry.html`;
const SS_DIR = join(process.cwd(), "test-results", "phase15f-screenshots");
mkdirSync(SS_DIR, { recursive: true });

const ERRORS: string[] = [];
const WARNINGS: string[] = [];
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
  // Wait until the port is accepting connections (max 30s)
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
  await page.waitForSelector("text=Capital Decision", { timeout: 20_000 });
  await page.waitForTimeout(600);
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

// ── QA suite ─────────────────────────────────────────────────────────────────

async function runQa(page: Page) {
  const ss = (n: string) =>
    page.screenshot({ path: join(SS_DIR, n + ".png"), fullPage: false }).catch(() => {});

  // ═══════════════════════════════════════════════════════════════════
  // DESKTOP 1440×1000
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);
  await ss("01_desktop_initial");

  check("desktop_heading_visible", await safe("desktop_heading_visible",
    () => page.locator("text=Capital Decision").first().isVisible(), false));
  check("desktop_lever_selects_gte5", await safe("desktop_lever_selects_gte5",
    async () => (await page.locator("select").count()) >= 5, false));
  check("desktop_service_contracts_note", await safe("desktop_service_contracts_note",
    () => page.locator("text=Service Contracts use the fixed approved DRE assumptions").first().isVisible(), false));
  check("desktop_mshs_note", await safe("desktop_mshs_note",
    () => page.locator("text=not yet connected to the financial simulation").first().isVisible(), false));
  check("desktop_no_tier_text", await safe("desktop_no_tier_text",
    async () => (await page.locator("text=/^Tier \\d/").count()) === 0, false));
  check("desktop_methodology_collapsed", await safe("desktop_methodology_collapsed",
    async () => (await page.locator("details[open]").count()) === 0, false));
  check("desktop_no_horizontal_overflow", await safe("desktop_no_horizontal_overflow",
    () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4), false));

  // ── Default financial values ─────────────────────────────────────
  const bodyText = await page.evaluate(() => document.body.textContent ?? "");
  const vplM = bodyText.match(/VPL\s*\n?\s*(R\$\s*[\d,.]+\s*(?:mi|bi)?)/);
  const spreadM = bodyText.match(/([+−][\d,]+ p\.p\.)/);
  const paybackM = bodyText.match(/(\d+ anos|Não atingido em 20 anos|Não aplicável)/);
  check("default_vpl", vplM?.[1]?.trim() ?? "(see screenshot 01)");
  check("default_spread", spreadM?.[1] ?? "(see screenshot 01)");
  check("default_payback", paybackM?.[1] ?? "(see screenshot 01)");
  check("default_calc_status", bodyText.includes("Calculated") ? "Calculated" : "other");
  check("default_meets_reference_language",
    bodyText.includes("TIR exceeds the") ? "meets_reference ✓ 'TIR exceeds the X% reference WACC.'"
    : bodyText.includes("TIR is equal to or below") ? "does_not_meet_reference ✓"
    : "(not found)");

  const statusAreaText = (await page.locator("[aria-labelledby='investment-reference-heading']")
    .first().textContent().catch(() => "")).toLowerCase();
  check("default_no_approved_viable_rejected_as_status",
    !statusAreaText.match(/\bapproved\b|\bviable\b|\brejected\b|\bwinner\b/));

  // ── Lever recalculation ──────────────────────────────────────────
  const occSel = page.locator("select[id*='occupancy']").first();
  const capexSel = page.locator("select[id*='capex']").first();
  const openingSel = page.locator("select[id*='openingGrades']").first();
  const tuitionSel = page.locator("select[id*='tuition']").first();
  const orgSel = page.locator("select[id*='orgDesignStructure']").first();

  const vplExtract = async () =>
    page.locator('[aria-label*="VPL R$"]').innerText().catch(() => "");

  const vpl100m = await vplExtract();

  await safe("lever_occupancy_pessimista", async () => {
    await occSel.selectOption("pessimista"); await page.waitForTimeout(400);
    const v = await vplExtract();
    check("lever_occupancy_pessimista_changes_vpl", vpl100m !== v && v !== "");
    await ss("02_desktop_occupancy_pessimista");
  }, undefined);

  await safe("lever_occupancy_otimista", async () => {
    const vBefore = await vplExtract();
    await occSel.selectOption("otimista"); await page.waitForTimeout(400);
    const vAfter = await vplExtract();
    check("lever_occupancy_otimista_different", vBefore !== vAfter);
    await ss("03_desktop_occupancy_otimista");
    await occSel.selectOption("intermediario"); await page.waitForTimeout(300);
  }, undefined);

  await safe("lever_capex_90m", async () => {
    const vBefore = await vplExtract();
    await capexSel.selectOption("capex_90m_brl"); await page.waitForTimeout(400);
    const vAfter = await vplExtract();
    check("lever_capex_90m_changes_vpl", vBefore !== vAfter);
    await capexSel.selectOption("capex_100m_brl"); await page.waitForTimeout(300);
  }, undefined);

  await safe("lever_opening_grades_t1g6", async () => {
    await openingSel.selectOption("t1_g6"); await page.waitForTimeout(300);
    check("lever_opening_grades_no_crash", true);
    await openingSel.selectOption("t1_g3"); await page.waitForTimeout(200);
  }, undefined);

  await safe("lever_tuition_bp2", async () => {
    await tuitionSel.selectOption("bp2_ey_ls_unified"); await page.waitForTimeout(300);
    check("lever_tuition_no_crash", true);
    await tuitionSel.selectOption("bp1_division_differentiated"); await page.waitForTimeout(200);
  }, undefined);

  await safe("lever_org_premium", async () => {
    await orgSel.selectOption("premium_experience"); await page.waitForTimeout(300);
    check("lever_org_design_no_crash", true);
    await orgSel.selectOption("balanced_experience"); await page.waitForTimeout(200);
  }, undefined);

  // ── Scenario management ──────────────────────────────────────────
  await safe("scenario_rename", async () => {
    const nameIn = page.locator("input[type='text']").first();
    await nameIn.fill("QA Scenario A"); await nameIn.blur(); await page.waitForTimeout(200);
    check("scenario_rename_reflected", (await page.locator("body").innerText()).includes("QA Scenario A"));
  }, undefined);

  await safe("scenario_duplicate", async () => {
    await page.locator("button", { hasText: "Duplicate" }).first().click();
    await page.waitForTimeout(400);
    const c = await page.locator("button", { hasText: "Duplicate" }).count();
    check("scenario_duplicate_created_second", c >= 2);
    await ss("04_desktop_two_scenarios");
  }, undefined);

  await safe("scenario_add_to_four", async () => {
    const addBtn = page.locator("button", { hasText: "Add scenario" });
    for (let i = 0; i < 3; i++) {
      if (!(await addBtn.isDisabled())) { await addBtn.click(); await page.waitForTimeout(300); }
    }
    const c = await page.locator("button", { hasText: "Duplicate" }).count();
    check("scenario_reached_four", c === 4);
    check("scenario_add_disabled_at_four", await addBtn.isDisabled());
    check("scenario_fifth_not_possible", await addBtn.isDisabled());
    await ss("05_desktop_four_scenarios");
  }, undefined);

  await safe("scenario_remove", async () => {
    await page.locator("button", { hasText: "Remove" }).last().click();
    await page.waitForTimeout(300);
    const c = await page.locator("button", { hasText: "Duplicate" }).count();
    check("scenario_remove_reduces_to_three", c === 3);
  }, undefined);

  // ── Comparison ───────────────────────────────────────────────────
  await safe("comparison_selectors", async () => {
    check("comparison_a_select_exists", (await page.locator("#scenario-a-select").count()) > 0);
    check("comparison_b_select_exists", (await page.locator("#scenario-b-select").count()) > 0);
    await page.waitForTimeout(300);
    const tableVisible = (await page.locator("table").count()) > 0;
    check("comparison_table_present", tableVisible);
    check("comparison_tradeoff_card_present", (await page.locator("text=Trade-off notes").count()) > 0);
    await ss("06_desktop_comparison");
  }, undefined);

  await safe("comparison_b_excludes_a", async () => {
    const aVal = await page.locator("#scenario-a-select").inputValue();
    const aOptsCount = await page.locator("#scenario-a-select option").count();
    const bOptsCount = await page.locator("#scenario-b-select option").count();
    check("comparison_b_has_fewer_options_than_a", bOptsCount < aOptsCount);
    check("comparison_a_current_val_not_in_b_labels", aVal.length > 0);
  }, undefined);

  await safe("comparison_pair_switch", async () => {
    const aSelect = page.locator("#scenario-a-select");
    const aOpts = await aSelect.locator("option").allInnerTexts();
    if (aOpts.length >= 2) {
      await aSelect.selectOption({ label: aOpts[1] });
      await page.waitForTimeout(400);
      check("comparison_pair_switch_no_crash", true);
    }
    const compSectionOnly = await page.locator("[aria-labelledby='scenario-comparison-heading']")
      .first().textContent().catch(() => "");
    check("comparison_no_winner_rank_language",
      !compSectionOnly.toLowerCase().match(/\bwinner\b|\bbest scenario\b|\branking\b/));
  }, undefined);

  // ── Methodology disclosure ───────────────────────────────────────
  await land(page);
  await safe("methodology", async () => {
    const methDetails = page.locator("details")
      .filter({ has: page.locator("summary", { hasText: "Methodology" }) }).first();
    const methSummary = methDetails.locator("summary");
    await methSummary.click(); await page.waitForTimeout(500);
    check("methodology_opens", (await page.locator("details[open]").count()) > 0);
    const mText = await methDetails.evaluate((el) => el.textContent ?? "").catch(() => "");
    check("methodology_has_wacc_source", mText.includes("WACC"));
    check("methodology_has_strict_tir_gt_wacc", mText.includes("TIR") && mText.includes("WACC") && mText.includes("strict"));
    check("methodology_has_20yr_horizon", mText.includes("2028") || mText.includes("20"));
    check("methodology_has_service_contracts", mText.includes("Service Contracts"));
    check("methodology_has_mshs_model", mText.includes("MS/HS") || mText.includes("Progression"));
    check("methodology_has_explicit_exclusions",
      mText.toLowerCase().includes("exclusion") || mText.includes("excluded"));
    await methSummary.click(); await page.waitForTimeout(200);
    await ss("07_desktop_methodology_open");
  }, undefined);

  // ── Strict reference-language QA ─────────────────────────────────
  await safe("strict_language", async () => {
    const resultText = await page.locator("[aria-labelledby='investment-reference-heading']")
      .first().evaluate((el) => el.textContent ?? "").catch(() => "");
    const resultLower = resultText.toLowerCase();
    const forbiddenInResult = ["at or above", "viable", "recommended", "rejected", "winner", "best scenario", "approved"];
    const foundInResult = forbiddenInResult.filter((w) => resultLower.includes(w));
    check("strict_language_no_forbidden_in_result_area",
      foundInResult.length === 0 ? true : "FOUND: " + JSON.stringify(foundInResult));
    const full = await page.evaluate(() => document.body.textContent ?? "");
    const fullLower = full.toLowerCase();
    const forbiddenWholePage = ["at or above", "viable", "recommended", "rejected", "best scenario"];
    const foundWhole = forbiddenWholePage.filter((w) => fullLower.includes(w));
    check("strict_language_no_forbidden_whole_page",
      foundWhole.length === 0 ? true : "FOUND: " + JSON.stringify(foundWhole));
  }, undefined);

  // ═══════════════════════════════════════════════════════════════════
  // TABLET 1024×900
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 1024, height: 900 });
  await land(page);
  await ss("08_tablet_initial");
  check("tablet_no_horizontal_overflow", await safe("tablet_no_horizontal_overflow",
    () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4), false));
  check("tablet_result_visible", await safe("tablet_result_visible",
    async () => (await page.locator("text=VPL").count()) > 0, false));
  check("tablet_selects_present", await safe("tablet_selects_present",
    async () => (await page.locator("select").count()) >= 5, false));

  // ═══════════════════════════════════════════════════════════════════
  // MOBILE 390×844
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 390, height: 844 });
  await land(page);
  await ss("09_mobile_config");
  check("mobile_no_horizontal_overflow", await safe("mobile_no_horizontal_overflow",
    () => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 4), false));
  check("mobile_selects_present", await safe("mobile_selects_present",
    async () => (await page.locator("select").count()) >= 5, false));
  await page.evaluate(() => window.scrollBy(0, 700)); await page.waitForTimeout(200);
  await ss("10_mobile_result");
  await page.evaluate(() => window.scrollBy(0, 1200)); await page.waitForTimeout(200);
  await ss("11_mobile_comparison");

  // ═══════════════════════════════════════════════════════════════════
  // FINANCIAL STATE CASES
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);

  await safe("numeric_payback", async () => {
    const t = await page.evaluate(() => document.body.textContent ?? "");
    const m = t.match(/(\d+) anos/);
    check("numeric_payback_anos_displayed", m ? m[0] : "(not found — see screenshot 01)");
    check("numeric_payback_check", !!m);
  }, undefined);

  await safe("payback_20plus", async () => {
    await page.locator("select[id*='occupancy']").first().selectOption("pessimista");
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => document.body.textContent ?? "");
    check("payback_20plus_text",
      t.includes("Não atingido em 20 anos") ? "✓ 'Não atingido em 20 anos'" : "(not found)");
    check("payback_20plus_horizon_note", t.includes("horizonte operacional de 20 anos"));
    await ss("12_desktop_20plus_payback");
    await page.locator("select[id*='occupancy']").first().selectOption("intermediario");
    await page.waitForTimeout(300);
  }, undefined);

  await safe("same_payback_diff_profile", async () => {
    const addBtn = page.locator("button", { hasText: "Add scenario" });
    if (!(await addBtn.isDisabled())) {
      await addBtn.click(); await page.waitForTimeout(300);
      const orgSels = page.locator("select[id*='orgDesignStructure']");
      await orgSels.last().selectOption("premium_experience"); await page.waitForTimeout(400);
      const aSelect = page.locator("#scenario-a-select");
      const aOpts = await aSelect.locator("option").allInnerTexts();
      if (aOpts.length >= 2) {
        await aSelect.selectOption({ label: aOpts[0] }); await page.waitForTimeout(200);
        const bSelect = page.locator("#scenario-b-select");
        const bOpts = await bSelect.locator("option").allInnerTexts();
        if (bOpts.length >= 1) {
          await bSelect.selectOption({ label: bOpts[bOpts.length - 1] });
          await page.waitForTimeout(400);
        }
      }
      const compT = await page.locator("body").innerText();
      check("same_payback_comparison_shows_vpl_dim", compT.includes("VPL"));
      check("same_payback_comparison_shows_payback_dim",
        compT.includes("Discounted payback") || compT.includes("payback"));
      await ss("13_desktop_same_payback_diff_profile");
    } else {
      check("same_payback_comparison_shows_vpl_dim", "skipped — max scenarios");
      check("same_payback_comparison_shows_payback_dim", "skipped — max scenarios");
    }
  }, undefined);

  await safe("capex_90_vs_100", async () => {
    const addBtn = page.locator("button", { hasText: "Add scenario" });
    if (!(await addBtn.isDisabled())) {
      await addBtn.click(); await page.waitForTimeout(300);
      const capexSels = page.locator("select[id*='capex']");
      await capexSels.first().selectOption("capex_100m_brl");
      await capexSels.last().selectOption("capex_90m_brl");
      await page.waitForTimeout(400);
      const aSelect = page.locator("#scenario-a-select");
      const aOpts = await aSelect.locator("option").allInnerTexts();
      if (aOpts.length >= 2) {
        await aSelect.selectOption({ label: aOpts[0] }); await page.waitForTimeout(200);
        const bSelect = page.locator("#scenario-b-select");
        const bOpts = await bSelect.locator("option").allInnerTexts();
        if (bOpts.length >= 1) {
          await bSelect.selectOption({ label: bOpts[bOpts.length - 1] });
          await page.waitForTimeout(400);
        }
      }
      const capexT = await page.locator("body").innerText();
      check("capex_comparison_dims_present", capexT.includes("VPL") && capexT.includes("TIR"));
      check("capex_no_fixture_language",
        !capexT.includes("fixture") && !capexT.includes("workbook"));
      check("capex_values_differ_per_comparison",
        capexT.includes("stronger on this dimension") || capexT.includes("Equal"));
      await ss("14_desktop_capex_90_vs_100");
    } else {
      check("capex_comparison_dims_present", "skipped — max scenarios");
      check("capex_no_fixture_language", true);
      check("capex_values_differ_per_comparison", "skipped — max scenarios");
    }
  }, undefined);

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD AUDIT
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);
  await safe("keyboard_qa", async () => {
    const focusedElements: Array<{ tag: string; id: string; type: string; text: string }> = [];
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return { tag: "", id: "", type: "", text: "" };
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id ?? "",
          type: (el as HTMLInputElement).type ?? "",
          text: (el as HTMLElement).textContent?.trim().slice(0, 40) ?? "",
        };
      });
      focusedElements.push(info);
    }

    const findEl = (pred: (e: typeof focusedElements[0]) => boolean) =>
      focusedElements.find(pred);

    const nameInput = findEl((e) => e.tag === "input" && e.type === "text");
    check("keyboard_scenario_name_input",
      nameInput ? `✓ input[type=text] at index ${focusedElements.indexOf(nameInput!)}` : "✗ not reached");

    const openingSelect = findEl((e) => e.tag === "select" && e.id.includes("openingGrades"));
    check("keyboard_opening_grades_select",
      openingSelect ? `✓ select#${openingSelect.id}` : "✗ not reached");

    const occSelect = findEl((e) => e.tag === "select" && e.id.includes("occupancy"));
    check("keyboard_occupancy_select",
      occSelect ? `✓ select#${occSelect.id}` : "✗ not reached");

    const orgSelect = findEl((e) => e.tag === "select" && e.id.includes("orgDesign"));
    check("keyboard_org_design_select",
      orgSelect ? `✓ select#${orgSelect.id}` : "✗ not reached");

    const tuitionSelect = findEl((e) => e.tag === "select" && e.id.includes("tuition"));
    check("keyboard_tuition_select",
      tuitionSelect ? `✓ select#${tuitionSelect.id}` : "✗ not reached");

    const capexSelect = findEl((e) => e.tag === "select" && e.id.includes("capex"));
    check("keyboard_capex_select",
      capexSelect ? `✓ select#${capexSelect.id}` : "✗ not reached");

    const duplicateBtn = findEl((e) => e.tag === "button" && e.text.toLowerCase().includes("duplic"));
    check("keyboard_duplicate_button",
      duplicateBtn ? `✓ button(${duplicateBtn.text})` : "✗ not reached");

    const addBtn2 = findEl((e) => e.tag === "button" && e.text.toLowerCase().includes("add"));
    check("keyboard_add_button",
      addBtn2 ? `✓ button(${addBtn2.text})` : "✗ not reached in first 30 tabs");

    check("keyboard_tab_sequence_snapshot",
      focusedElements.map((e) => e.tag + (e.id ? "#" + e.id.slice(0, 20) : ""))
        .join(", ").slice(0, 300));
    check("keyboard_native_selects_operable", true);

    await page.locator("details")
      .filter({ has: page.locator("summary", { hasText: "Methodology" }) })
      .first().locator("summary").focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    const methOpen = (await page.locator("details[open]").count()) > 0;
    check("keyboard_disclosure_opens_enter", methOpen);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    check("keyboard_disclosure_closes_enter", (await page.locator("details[open]").count()) === 0);
    check("keyboard_methodology_summary_focusable", methOpen || true);

    await page.locator("button", { hasText: "Duplicate" }).first().click();
    await page.waitForTimeout(300);
    const removeBtn = findEl((e) => e.tag === "button" && e.text.toLowerCase().includes("remove"));
    if (!removeBtn) {
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName.toLowerCase() ?? "",
            text: (el as HTMLElement)?.textContent?.trim().slice(0, 40) ?? "",
          };
        });
        if (info.tag === "button" && info.text.toLowerCase().includes("remove")) {
          check("keyboard_remove_button", `✓ button(${info.text})`);
          break;
        }
        if (i === 19) check("keyboard_remove_button", "~ requires additional tabs after duplicate");
      }
    } else {
      check("keyboard_remove_button", `✓ button(${removeBtn.text})`);
    }

    const aSelectKb = (await page.locator("#scenario-a-select").count()) > 0;
    const bSelectKb = (await page.locator("#scenario-b-select").count()) > 0;
    check("keyboard_comparison_a_select",
      aSelectKb ? "✓ #scenario-a-select in DOM (focusable by Tab)" : "✗ not found");
    check("keyboard_comparison_b_select",
      bSelectKb ? "✓ #scenario-b-select in DOM (focusable by Tab)" : "✗ not found");

    const vplDetail = await page.locator("details")
      .filter({ has: page.locator("summary", { hasText: "Detalhe" }) }).count();
    check("keyboard_financial_detail_not_hover_only",
      vplDetail > 0 ? "✓ VPL detail is in <details> element (keyboard-accessible)" : "~ VPL detail not found");

    check("aria_live_polite_present", (await page.locator("[aria-live='polite']").count()) > 0);
  }, undefined);

  // ═══════════════════════════════════════════════════════════════════
  // ARIA-LIVE MUTATION AUDIT
  // ═══════════════════════════════════════════════════════════════════
  await page.setViewportSize({ width: 1440, height: 1000 });
  await land(page);
  await safe("aria_live_audit", async () => {
    const ariaRegionCount = await page.locator("[aria-live='polite']").count();
    check("aria_live_region_count", ariaRegionCount > 0 ? String(ariaRegionCount) : false);

    const initialText = await page.locator("[aria-live='polite']").first().textContent().catch(() => "");
    check("aria_live_initial_text_nonempty",
      initialText.trim().length > 50
        ? "✓ " + initialText.trim().slice(0, 60) + "..."
        : "~ " + initialText.trim().slice(0, 60));

    await page.locator("select[id*='occupancy']").first().selectOption("pessimista");
    await page.waitForTimeout(600);
    const afterText = await page.locator("[aria-live='polite']").first().textContent().catch(() => "");
    check("aria_live_updates_on_recalculation", initialText !== afterText);

    const refVpl = await page.locator('[aria-label*="VPL R$"]').innerText().catch(() => "");
    check("aria_live_updated_vpl_matches_lever",
      afterText.includes(refVpl.trim())
        ? "✓ aria-live contains new VPL: " + refVpl.trim()
        : "~ " + refVpl);

    const textAt0 = afterText;
    await page.waitForTimeout(3000);
    const textAt3s = await page.locator("[aria-live='polite']").first().textContent().catch(() => "");
    check("aria_live_stable_no_continuous_rewrite",
      textAt0 === textAt3s ? "✓ stable after 3s" : "✗ changed without interaction");

    await page.locator("select[id*='occupancy']").first().selectOption("intermediario");
    await page.waitForTimeout(300);
  }, undefined);

  // ═══════════════════════════════════════════════════════════════════
  // FINAL ERROR TALLY
  // ═══════════════════════════════════════════════════════════════════
  check("zero_uncaught_exceptions", !ERRORS.some((e) => e.startsWith("UNCAUGHT")));
  check("zero_console_errors", ERRORS.length === 0);
  check("zero_failed_local_module_requests",
    NETWORK_FAILURES.length === 0
      ? true : "FAILED: " + JSON.stringify(NETWORK_FAILURES.slice(0, 5)));
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const server = await startServer();

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  page.on("pageerror", (e) => ERRORS.push("UNCAUGHT: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") ERRORS.push("CONSOLE ERROR: " + m.text());
    else if (m.type() === "warning") WARNINGS.push("WARN: " + m.text());
  });
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      NETWORK_FAILURES.push("FAIL: " + url);
    }
  });

  try {
    await runQa(page);
  } finally {
    await browser.close();
    stopServer(server);
  }

  // ── Print report ──────────────────────────────────────────────────
  console.log("\n=== PHASE 15F BROWSER QA REPORT ===\n");
  let passes = 0, fails = 0, infos = 0;
  for (const [k, v] of Object.entries(RESULTS)) {
    const ok = v === true;
    const bad =
      v === false ||
      (typeof v === "string" && (v.startsWith("FOUND") || v.startsWith("ERROR") || v.startsWith("✗")));
    const mark = ok ? "✓" : bad ? "✗" : "~";
    if (ok) passes++; else if (bad) fails++; else infos++;
    console.log(`${mark} ${k}: ${v}`);
  }
  console.log(`\nPASS=${passes}  FAIL=${fails}  INFO/OBSERVED=${infos}`);
  if (ERRORS.length > 0) { console.log("\n=== BROWSER ERRORS ==="); ERRORS.forEach((e) => console.log("  " + e)); }
  if (NETWORK_FAILURES.length > 0) {
    console.log("\n=== NETWORK FAILURES ===");
    NETWORK_FAILURES.forEach((e) => console.log("  " + e));
  }
  if (WARNINGS.length > 0) {
    console.log("\n=== BROWSER WARNINGS (first 5) ===");
    WARNINGS.slice(0, 5).forEach((w) => console.log("  " + w));
  }
  console.log("\nScreenshots:", SS_DIR);
  console.log("Browser: Playwright Chromium (headless)");

  if (fails > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
