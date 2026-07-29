// Phase V10-X2T.3A tranche validator for OfferScenariosTab.tsx.
// Deterministic assertions only — no snapshots. Run with: npx tsx scripts/validate-v10-x2t-3a-offer-locale.ts

import ts from "typescript";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const TSX_PATH = join(ROOT, "src/components/sections/OfferScenariosTab.tsx");
const PT_PATH = join(ROOT, "src/i18n/pt-BR.ts");
const EN_PATH = join(ROOT, "src/i18n/en-US.ts");

const tsxText = readFileSync(TSX_PATH, "utf8");
const ptText = readFileSync(PT_PATH, "utf8");
const enText = readFileSync(EN_PATH, "utf8");
const sourceFile = ts.createSourceFile("OfferScenariosTab.tsx", tsxText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

let failures = 0;
function check(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

// The dead/unreachable "legacy" print block, verified by direct CSS-rule read
// (see V10-X2T.3A final report): `.offer-scenarios-print-only` is
// `display:none` on screen; the printing override at line ~1646 sets it to
// `display:block !important`, but the later, equal-specificity rule at
// ~1761 (`.offer-scenarios-print-legacy-hidden`) sets `display:none
// !important` and wins the cascade tie by source order — so this section is
// hidden in both screen and print. Tag-balance confirmed: the <section>
// opened where this class first appears closes at the JSX tree's final
// </section>, immediately followed by the closing wrapper tags.
const deadZoneStartMarker = "offer-scenarios-print-only offer-scenarios-print-legacy-hidden";
const deadZoneStartLine = tsxText.split("\n").findIndex((l) => l.includes(deadZoneStartMarker)) + 1;
const lastSectionCloseLine = (() => {
  const lines = tsxText.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("</section>")) return i + 1;
  }
  return -1;
})();
const DEAD_ZONE = { start: deadZoneStartLine, end: lastSectionCloseLine };
check(
  "dead-zone boundaries located",
  DEAD_ZONE.start > 0 && DEAD_ZONE.end > DEAD_ZONE.start,
  `start=${DEAD_ZONE.start} end=${DEAD_ZONE.end}`
);

function extractKV(txt: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /^\s*([A-Za-z0-9_]+):\s*"((?:[^"\\]|\\.)*)",?\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(txt))) {
    map.set(m[1], m[2].replace(/\\"/g, '"').replace(/\\n/g, "\n"));
  }
  return map;
}
const ptKV = extractKV(ptText);
const enKV = extractKV(enText);

// --- Check 1: key-set parity between locales ---
{
  const ptKeys = new Set(ptKV.keys());
  const enKeys = new Set(enKV.keys());
  const onlyPt = [...ptKeys].filter((k) => !enKeys.has(k));
  const onlyEn = [...enKeys].filter((k) => !ptKeys.has(k));
  check("pt-BR / en-US key-set parity", onlyPt.length === 0 && onlyEn.length === 0, `onlyPt=${onlyPt.length} onlyEn=${onlyEn.length}`);
}

// --- Check 2: no duplicate keys within a locale file ---
for (const [label, txt] of [["pt-BR", ptText] as const, ["en-US", enText] as const]) {
  const keys = [...txt.matchAll(/^\s*([A-Za-z0-9_]+):\s*"/gm)].map((m) => m[1]);
  const seen = new Map<string, number>();
  for (const k of keys) seen.set(k, (seen.get(k) ?? 0) + 1);
  const dups = [...seen.entries()].filter(([, c]) => c > 1);
  check(`${label} has no duplicate keys`, dups.length === 0, JSON.stringify(dups.slice(0, 10)));
}

// --- Check 3: every t("offer...") call resolves in both locales ---
{
  const calls = [...tsxText.matchAll(/t\("(offer[A-Za-z0-9]+)"\)/g)].map((m) => m[1]);
  const distinctCalls = [...new Set(calls)];
  const missingPt = distinctCalls.filter((k) => !ptKV.has(k));
  const missingEn = distinctCalls.filter((k) => !enKV.has(k));
  check(
    `all ${distinctCalls.length} distinct offer* t() calls resolve in both locales`,
    missingPt.length === 0 && missingEn.length === 0,
    `missingPt=${JSON.stringify(missingPt)} missingEn=${JSON.stringify(missingEn)}`
  );
}

// --- Check 4: offerLabel map completeness (reverse reachability) ---
{
  const lines = tsxText.split("\n");
  const startIdx = lines.findIndex((l) => l.includes("const offerLabel: Record<string, string>"));
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === "};");
  const offerLabelKeys = new Set<string>();
  for (let i = startIdx + 1; i < endIdx; i++) {
    const m = lines[i].match(/^\s*"([^"]+)":/);
    if (m) offerLabelKeys.add(m[1]);
  }

  const TARGET_CONSTS = new Set([
    "sharedBudgetRows",
    "scenarioBudgetComparisons",
    "ecosystemDecisionLayers",
    "decisionPanelItems",
    "baselineDivisionArchitecture",
    "minimumAcademicOperationGroups",
    "pedagogicalOfferScenarios",
  ]);
  const TARGET_PROPS = new Set(["status", "scenario", "system", "division", "title"]);

  function lineOf(node: ts.Node): number {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  }
  function findEnclosingConstName(node: ts.Node): string | null {
    let p: ts.Node | undefined = node;
    while (p) {
      if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && TARGET_CONSTS.has(p.name.text)) return p.name.text;
      p = p.parent;
    }
    return null;
  }
  const missing: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && TARGET_PROPS.has(node.name.text)) {
      const line = lineOf(node);
      if (!(line >= DEAD_ZONE.start && line <= DEAD_ZONE.end)) {
        const constName = findEnclosingConstName(node);
        if (constName && ts.isStringLiteral(node.initializer)) {
          const value = node.initializer.text;
          if (!offerLabelKeys.has(value)) missing.push(`${constName}.${node.name.text}=${JSON.stringify(value)} (line ${line})`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  check("every governed status/scenario/system/division/title value has an offerLabel entry", missing.length === 0, JSON.stringify(missing));
}

// --- Check 5: numeric invariance (enrollment/capacity maps match data literals) ---
{
  const expectedEnrollment: Record<string, number> = { "Scenario A": 228, "Scenario B": 258, "Scenario C": 288, "Scenario D": 318 };
  const expectedCapacity: Record<string, number> = { "Scenario A": 302, "Scenario B": 348, "Scenario C": 390, "Scenario D": 440 };
  const enrollMatch = tsxText.match(/const offerEnrollmentCount: Record<string, number> = \{([^}]*)\}/);
  const capMatch = tsxText.match(/const offerCapacityCount: Record<string, number> = \{([^}]*)\}/);
  function parseMap(block: string): Record<string, number> {
    const out: Record<string, number> = {};
    for (const m of block.matchAll(/"([^"]+)":\s*(\d+)/g)) out[m[1]] = Number(m[2]);
    return out;
  }
  const enrollActual = enrollMatch ? parseMap(enrollMatch[1]) : {};
  const capActual = capMatch ? parseMap(capMatch[1]) : {};
  check("offerEnrollmentCount matches governed data (228/258/288/318)", JSON.stringify(enrollActual) === JSON.stringify(expectedEnrollment), JSON.stringify(enrollActual));
  check("offerCapacityCount matches governed data (302/348/390/440)", JSON.stringify(capActual) === JSON.stringify(expectedCapacity), JSON.stringify(capActual));

  // targetEnrollment/modeledCapacity fields must be locale-invariant English literals
  const dataFields = [...tsxText.matchAll(/(targetEnrollment|modeledCapacity):\s*"([^"]+)"/g)].map((m) => m[2]);
  const allEnglish = dataFields.every((v) => /^(228|258|288|318|302|348|390|440) learners$/.test(v));
  check("targetEnrollment/modeledCapacity data fields are locale-invariant literals", dataFields.length === 8 && allEnglish, JSON.stringify(dataFields));
}

// --- Check 6: sibling keyName translation consistency ---
{
  let classified: Array<{ disposition: string; keyName: string; pt: string; en: string }> = [];
  try {
    classified = JSON.parse(readFileSync(join(ROOT, "docs/v10-x2t-3a/offer-inventory-classified.json"), "utf8"));
  } catch {
    // classified.json not present — skip (not expected in a clean checkout without docs/)
  }
  const byTextEn = new Map<string, string[]>();
  for (const c of classified) {
    if (c.disposition !== "semantic-id-display-separation") continue;
    if (!byTextEn.has(c.en)) byTextEn.set(c.en, []);
    byTextEn.get(c.en)!.push(c.keyName);
  }
  const inconsistencies: string[] = [];
  for (const [text, keyNames] of byTextEn) {
    const present = [...new Set(keyNames)].filter((k) => ptKV.has(k) && enKV.has(k));
    if (present.length < 2) continue;
    const ptVals = new Set(present.map((k) => ptKV.get(k)));
    const enVals = new Set(present.map((k) => enKV.get(k)));
    if (ptVals.size > 1 || enVals.size > 1) inconsistencies.push(text);
  }
  check("sibling keyNames for the same source text share identical pt/en translations", inconsistencies.length === 0, JSON.stringify(inconsistencies));
}

// --- Check 7: no remaining unresolved visible-content in the live region ---
{
  const ALLOW_EXACT = new Set([
    "MAP", "PDJ", "MUN", "Creative Hub", "Passion Project", "Passion Projects", "Pathways",
    "Babson EPIC", "Festival of Learning", "Explorers", "Researchers", "Reggio", "Reggio-inspired",
    "Learning Experience Design", "Learning Experience Designer", "Teaching & Learning Coach",
    "Language & Academic Performance Coach", "LAP Coach", "Curriculum & Assessment Designer", "C&A",
    "Body & Movement", "Sound Exploration", "Sound Exploration / Music", "Artistic Design", "Artistic Design / Atelier",
    "Design Technologies", "Design Technologies / Learning Experience Designer capacity", "Performing Arts",
    "Concept", "PSAT", "AP", "College Counseling", "Science of Reading",
    "Scenario A", "Scenario B", "Scenario C", "Scenario D",
    "Toddlers 1", "Toddlers 2", "min", "A → B → C → D",
    // proper-noun person-name lists (current specialist ecosystem roster)
    "Marcello Humeniuk, Maíra Jardim, Felipe Pierrobon, Kirk Barros", "Igor, Bianca",
    "Alexandre, Ariádine, Marcio, Lívia", "Babi, Duda, Larissa, Juliana, Iris",
    "Marcello Humeniuk", "Maíra Jardim", "Felipe Pierrobon", "Kirk Barros",
  ]);
  const NEVER_TOUCH_CONSTS = new Set(["specialistPillarGradeSequence", "specialistFinalGradeOptions"]);

  function isMeaningfulText(s: string): boolean {
    const t = s.trim();
    if (t.length === 0) return false;
    if (/^[\s\-–—•·|/\\.,:;()%+*#@_[\]{}0-9]*$/.test(t)) return false;
    if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t)) return false;
    return true;
  }
  function isInsideCallNamed(node: ts.Node, name: string): boolean {
    let p: ts.Node | undefined = node.parent;
    while (p) {
      if (ts.isCallExpression(p) && ts.isIdentifier(p.expression) && p.expression.text === name) return true;
      p = p.parent;
    }
    return false;
  }
  function isInsideNeverTouchConst(node: ts.Node): boolean {
    let p: ts.Node | undefined = node.parent;
    while (p) {
      if (ts.isVariableDeclaration(p) && ts.isIdentifier(p.name) && NEVER_TOUCH_CONSTS.has(p.name.text)) return true;
      p = p.parent;
    }
    return false;
  }
  function isInsideStyleTag(node: ts.Node): boolean {
    let p: ts.Node | undefined = node.parent;
    while (p) {
      if (ts.isJsxElement(p) && p.openingElement.tagName.getText(sourceFile) === "style") return true;
      p = p.parent;
    }
    return false;
  }
  function lineOf(node: ts.Node): number {
    return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  }

  const unresolved: Array<{ line: number; text: string }> = [];
  function record(node: ts.Node, raw: string) {
    const trimmed = raw.trim();
    if (!isMeaningfulText(trimmed)) return;
    const line = lineOf(node);
    if (line >= DEAD_ZONE.start && line <= DEAD_ZONE.end) return;
    if (isInsideCallNamed(node, "t")) return;
    if (isInsideNeverTouchConst(node)) return;
    if (isInsideStyleTag(node)) return;
    if (ALLOW_EXACT.has(trimmed)) return;
    unresolved.push({ line, text: trimmed.slice(0, 60) });
  }
  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      record(node, node.getText(sourceFile).replace(/\{|\}/g, ""));
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      const VISIBLE = new Set(["title", "alt", "placeholder", "aria-label", "label"]);
      if (VISIBLE.has(name) && node.initializer && ts.isStringLiteral(node.initializer)) {
        record(node.initializer, node.initializer.text);
      }
    } else if (ts.isStringLiteral(node)) {
      const p = node.parent;
      if (p && (ts.isArrayLiteralExpression(p) || ts.isJsxExpression(p))) record(node, node.text);
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      const p = node.parent;
      if (p && (ts.isJsxExpression(p) || ts.isArrayLiteralExpression(p))) record(node, node.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  check("zero unresolved visible-content findings in the live region (after justified exclusions)", unresolved.length === 0, JSON.stringify(unresolved));
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
