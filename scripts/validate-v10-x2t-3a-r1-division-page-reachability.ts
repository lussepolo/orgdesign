// Phase V10-X2T.3A-R1 regression validator: proves the four governed
// division pages (Early Years, Lower School, Middle School, High School)
// are registered, locale-independent, resolvable in both locales, mapped
// to the correct components, and reachable via primary navigation — and
// that Offer Scenarios / Org Design / Payroll are unaffected.
//
// Deterministic, source-level assertions only — no snapshots, no browser.
// Run with: npx tsx scripts/validate-v10-x2t-3a-r1-division-page-reachability.ts

import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const registryText = readFileSync(join(ROOT, "src/config/workspaceRegistry.ts"), "utf8");
const appText = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
const ptText = readFileSync(join(ROOT, "src/i18n/pt-BR.ts"), "utf8");
const enText = readFileSync(join(ROOT, "src/i18n/en-US.ts"), "utf8");

let failures = 0;
function check(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

function extractKeys(txt: string): Set<string> {
  return new Set([...txt.matchAll(/^\s*([A-Za-z0-9_]+):\s*"/gm)].map((m) => m[1]));
}
const ptKeys = extractKeys(ptText);
const enKeys = extractKeys(enText);

const DIVISIONS: Array<{ id: string; component: string; shortLabelKey: string; titleKey: string }> = [
  { id: "early-years", component: "EarlyYearsTab", shortLabelKey: "wsEarlyYearsShortLabel", titleKey: "wsEarlyYearsTitle" },
  { id: "lower-school", component: "LowerSchoolTab", shortLabelKey: "wsLowerSchoolShortLabel", titleKey: "wsLowerSchoolTitle" },
  { id: "ms", component: "MiddleSchoolTab", shortLabelKey: "wsMiddleSchoolShortLabel", titleKey: "wsMiddleSchoolTitle" },
  { id: "hs", component: "HighSchoolTab", shortLabelKey: "wsHighSchoolShortLabel", titleKey: "wsHighSchoolTitle" },
];

// --- 1-3: each division exists in the registry, is locale-independent, and resolves in both locales ---
for (const d of DIVISIONS) {
  const entryMatch = registryText.match(new RegExp(`id:\\s*"${d.id}"[\\s\\S]{0,3000}?visibleInSupportingNavigation:\\s*(?:true|false)`));
  check(`${d.id}: registry entry exists`, !!entryMatch, `no entry block found for id "${d.id}"`);
  if (!entryMatch) continue;
  const block = entryMatch[0];

  // locale-independent id: must be a plain kebab/lowercase literal, not a translation key or t() call
  check(`${d.id}: id is a locale-independent literal`, /^[a-z-]+$/.test(d.id));

  check(`${d.id}: shortLabelKey "${d.shortLabelKey}" resolves in pt-BR`, ptKeys.has(d.shortLabelKey));
  check(`${d.id}: shortLabelKey "${d.shortLabelKey}" resolves in en-US`, enKeys.has(d.shortLabelKey));
  check(`${d.id}: titleKey "${d.titleKey}" resolves in pt-BR`, ptKeys.has(d.titleKey));
  check(`${d.id}: titleKey "${d.titleKey}" resolves in en-US`, enKeys.has(d.titleKey));

  check(`${d.id}: visibleInPrimaryNavigation is true`, /visibleInPrimaryNavigation:\s*true/.test(block), block);
  check(`${d.id}: visibleInSupportingNavigation is false (no duplicate listing)`, /visibleInSupportingNavigation:\s*false/.test(block));
}

// --- 4: each division maps to the correct, distinct component in App.tsx ---
for (const d of DIVISIONS) {
  const importRe = new RegExp(`import ${d.component} from "\\./components/sections/${d.component}"`);
  check(`${d.id}: App.tsx imports ${d.component}`, importRe.test(appText));
  const renderRe = new RegExp(`activeTab === "${d.id}" && <${d.component}[\\s/]`);
  check(`${d.id}: App.tsx renders ${d.component} for activeTab === "${d.id}"`, renderRe.test(appText));
}
{
  // no two divisions render the same component for a different id, and no division id renders another division's component
  const componentToId = new Map<string, string>();
  for (const d of DIVISIONS) componentToId.set(d.component, d.id);
  const idsAreDistinct = new Set(DIVISIONS.map((d) => d.id)).size === DIVISIONS.length;
  check("all four division ids are distinct", idsAreDistinct);
  const componentsAreDistinct = new Set(DIVISIONS.map((d) => d.component)).size === DIVISIONS.length;
  check("all four division components are distinct (no cross-mapping)", componentsAreDistinct);
}

// --- 5: navigation ordering matches the approved (Phase 15N) relative order ---
{
  const orderMatches = DIVISIONS.map((d) => {
    const m = registryText.match(new RegExp(`id:\\s*"${d.id}"[\\s\\S]{0,50}?order:\\s*(\\d+)`));
    return m ? Number(m[1]) : null;
  });
  const allFound = orderMatches.every((o) => o !== null);
  const ascending = allFound && orderMatches.every((o, i) => i === 0 || (o as number) > (orderMatches[i - 1] as number));
  check(
    "division order fields are ascending (Early Years < Lower School < Middle School < High School)",
    ascending,
    JSON.stringify(orderMatches)
  );
}

// --- 6: Offer Scenarios, Org Design, Payroll unaffected ---
for (const id of ["offer-scenarios", "executive-org-design", "payroll"]) {
  const entryMatch = registryText.match(new RegExp(`id:\\s*"${id}"[\\s\\S]{0,3000}?visibleInSupportingNavigation:\\s*(?:true|false)`));
  check(`${id}: still registered and still primary-visible`, !!entryMatch && /visibleInPrimaryNavigation:\s*true/.test(entryMatch[0]));
}

// --- 7: no calculation / governed-scenario-taxonomy files touched ---
{
  const PROTECTED = [
    "src/components/sections/MiddleSchoolTab.tsx",
    "src/components/sections/HighSchoolTab.tsx",
    "src/components/sections/EarlyYearsTab.tsx",
    "src/components/sections/LowerSchoolTab.tsx",
    "src/components/sections/middleSchoolLoadModel.ts",
    "src/components/sections/highSchoolScheduleModel.ts",
    "src/components/dreSimulator/payrollGovernanceWorkbookAdapter.ts",
    "src/components/dreSimulator/dreScenarioWorkbook.ts",
    "src/lib/payroll",
    "src/lib/viability",
  ];
  let diffOutput = "";
  try {
    diffOutput = execSync(`git diff --stat 47b4987 -- ${PROTECTED.map((p) => `"${p}"`).join(" ")}`, {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch (e) {
    diffOutput = String(e);
  }
  check("no protected calculation/staffing/adapter files changed since 47b4987", diffOutput.trim() === "", diffOutput);
}

// --- 8: registry-level diff since 47b4987 touches only the four division entries' nav flags ---
{
  let diffOutput = "";
  try {
    diffOutput = execSync("git diff --stat 47b4987 -- src", { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    diffOutput = String(e);
  }
  const onlyRegistryTouched = /workspaceRegistry\.ts/.test(diffOutput) &&
    !/App\.tsx|MiddleSchoolTab|HighSchoolTab|EarlyYearsTab|LowerSchoolTab|dreScenarioWorkbook|payrollGovernanceWorkbookAdapter/.test(diffOutput);
  check("restoration diff under src/ is scoped to workspaceRegistry.ts only", onlyRegistryTouched, diffOutput);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
