// V10-E1 — Governed captação and package-specific capacity browser QA.
//
// Runs the current app in Vite and verifies the bounded V10-E1 UI contract:
// three active captação scenarios, Base as default, no active Pessimista or
// Intermediário option, active T1-G4/T1-G6 packages, and captação-workbook
// capacity/enrollment language.

import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const QA_PORT = 4210;
const BASE_URL = `http://127.0.0.1:${QA_PORT}`;
const NAVIGATION_TIMEOUT_MS = 120_000;

type Check = {
  id: string;
  pass: boolean;
  detail: string;
};

const checks: Check[] = [];
const jsErrors: string[] = [];
const networkFailures: string[] = [];

function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

async function startServer(): Promise<ChildProcess> {
  const proc = spawn("npx", ["vite", "--port", String(QA_PORT), "--host", "127.0.0.1"], {
    cwd: resolve(process.cwd()),
    stdio: "ignore",
    detached: false,
  });

  const start = Date.now();
  while (Date.now() - start < 45_000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.status < 500) return proc;
    } catch {
      await new Promise((resolvePoll) => setTimeout(resolvePoll, 500));
    }
  }
  throw new Error("Vite server did not become ready within 45s");
}

async function openDreTab(page: Page): Promise<void> {
  await page.addInitScript(() => {
    sessionStorage.setItem("concept_rio_auth", "true");
    localStorage.setItem("hasSeenAbout_v3.0", "true");
  });
  await page.goto(BASE_URL, { waitUntil: "commit", timeout: NAVIGATION_TIMEOUT_MS });
  // "DRE Scenario Simulator" (locale infra commit a247d0e) was replaced by the
  // wsDreShortLabel translation key before this test was ever run against it —
  // pt-BR "DRE Operacional" / en-US "Operating P&L" (src/i18n/{pt-BR,en-US}.ts).
  // No locale-independent test hook exists on nav buttons, so match both current labels.
  await page.getByRole("button", { name: /DRE Operacional|Operating P&L/i }).click();
  await page.waitForTimeout(750);
}

async function runQa(page: Page): Promise<void> {
  page.on("pageerror", (err) => jsErrors.push(err.message));
  page.on("requestfailed", (req) => {
    const url = req.url();
    if (!url.includes("favicon") && (url.includes("localhost") || url.includes("127.0.0.1"))) {
      networkFailures.push(url);
    }
  });

  await openDreTab(page);
  const body = await page.locator("body").innerText();
  check("app_loaded_dre_tab", /DRE|Receita|EBITDA/i.test(body), body.slice(0, 160));

  // pt-BR is the app's default locale (src/i18n/useLocale.tsx DEFAULT_LOCALE) — the field
  // renders as "Cenário de Captação" (pt-BR) / "Captação Scenario" (en-US), per
  // dreLeverPanelCaptacaoLabel in src/i18n/{pt-BR,en-US}.ts.
  const scenarioSelect = page.getByLabel(/Cenário de Captação|Captação Scenario/i);
  const scenarioValues = await scenarioSelect.locator("option").evaluateAll((options) =>
    options.map((option) => ({
      value: (option as HTMLOptionElement).value,
      label: (option as HTMLOptionElement).textContent?.trim() ?? "",
    })),
  );
  check(
    "three_active_scenario_options",
    JSON.stringify(scenarioValues.map((option) => option.value)) ===
      JSON.stringify(["conservador", "base", "otimista"]),
    JSON.stringify(scenarioValues),
  );
  check("base_default_selected", await scenarioSelect.inputValue() === "base", await scenarioSelect.inputValue());
  check(
    "legacy_labels_absent_from_selector",
    !JSON.stringify(scenarioValues).toLowerCase().includes("pessimista") &&
      !JSON.stringify(scenarioValues).toLowerCase().includes("intermedi"),
    JSON.stringify(scenarioValues),
  );

  await scenarioSelect.selectOption("conservador");
  await page.waitForTimeout(400);
  check("conservador_switch_succeeds", await scenarioSelect.inputValue() === "conservador", await scenarioSelect.inputValue());
  await scenarioSelect.selectOption("otimista");
  await page.waitForTimeout(400);
  check("otimista_switch_succeeds", await scenarioSelect.inputValue() === "otimista", await scenarioSelect.inputValue());
  await scenarioSelect.selectOption("base");
  await page.waitForTimeout(400);
  check("base_switch_succeeds", await scenarioSelect.inputValue() === "base", await scenarioSelect.inputValue());

  // pt-BR: "Pacote de Abertura" / en-US: "Opening Package" (dreLeverPanelOpeningPackageLabel).
  const openingPackageSelect = page.getByLabel(/Pacote de Abertura|Opening Package/i);
  const packageOptions = await openingPackageSelect.locator("option").evaluateAll((options) =>
    options.map((option) => ({
      value: (option as HTMLOptionElement).value,
      label: (option as HTMLOptionElement).textContent?.trim() ?? "",
      disabled: (option as HTMLOptionElement).disabled,
    })),
  );
  check(
    "t1_g6_active_package_enabled",
    packageOptions.some((option) => option.value === "t1_g6" && !option.disabled),
    JSON.stringify(packageOptions),
  );
  check(
    "t1_g4_active_package_enabled",
    packageOptions.some((option) => option.value === "t1_g4" && !option.disabled && !/capacity only/i.test(option.label)),
    JSON.stringify(packageOptions),
  );
  check(
    "active_package_options_only",
    JSON.stringify(packageOptions.map((option) => option.value)) === JSON.stringify(["t1_g4", "t1_g6"]),
    JSON.stringify(packageOptions),
  );

  await openingPackageSelect.selectOption("t1_g4");
  await scenarioSelect.selectOption("conservador");
  await page.waitForTimeout(400);
  let updatedBody = await page.locator("body").innerText();
  check("t1_g4_conservador_2028_visible", updatedBody.includes("238"), "T1-G4 Conservador body checked");
  await scenarioSelect.selectOption("base");
  await page.waitForTimeout(400);
  updatedBody = await page.locator("body").innerText();
  check("t1_g4_base_2028_visible", updatedBody.includes("258"), "T1-G4 Base body checked");
  await scenarioSelect.selectOption("otimista");
  await page.waitForTimeout(400);
  updatedBody = await page.locator("body").innerText();
  check("t1_g4_otimista_2028_visible", updatedBody.includes("300"), "T1-G4 Otimista body checked");
  check("t1_g4_capacity_348_visible", updatedBody.includes("348"), "T1-G4 capacity checked");

  await openingPackageSelect.selectOption("t1_g6");
  await scenarioSelect.selectOption("base");
  await page.waitForTimeout(400);
  updatedBody = await page.locator("body").innerText();
  check("t1_g6_capacity_746_visible", updatedBody.includes("746"), updatedBody.match(/T1-G6[^\n]+/)?.[0] ?? "body checked");
  // pt-BR: "T1-G4 é governado por sua própria planilha de captação" / en-US: "T1-G4 is governed
  // by its own captação workbook" (dreLeverPanelT1G4GovernedMessage-equivalent key).
  check(
    "t1_g4_governed_message_visible",
    /T1-G4 é governado por sua própria planilha de captação|T1-G4 is governed by its own captação workbook/i.test(
      updatedBody,
    ),
    "T1-G4 message checked",
  );
  check("no_active_pessimista_text", !updatedBody.includes("Pessimista"), "current DRE tab body checked");
  check("no_js_errors", jsErrors.length === 0, JSON.stringify(jsErrors));
  check("no_network_failures", networkFailures.length === 0, JSON.stringify(networkFailures));
}

let server: ChildProcess | null = null;
let browser: Browser | null = null;

try {
  server = await startServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await runQa(page);
} finally {
  if (browser) await browser.close().catch(() => {});
  if (server) server.kill("SIGTERM");
}

const passCount = checks.filter((item) => item.pass).length;
const failCount = checks.length - passCount;
console.log(JSON.stringify({ phase: "V10-E1 browser QA", passCount, failCount, checks }, null, 2));

if (failCount > 0) process.exit(1);
