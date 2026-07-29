// Phase V10-X2T.3A — Offer Scenarios tranche-scoped inventory extractor.
//
// This script does NOT modify or reinterpret the shared inventory
// methodology in scripts/validate-v10-x2t-visible-string-inventory.ts. It
// duplicates that script's exact detection logic (JSX text, the widened
// visible-attribute set minus technical attributes, direct JSX-child
// expressions unwrapped through conditional/logical/parenthesized wrappers,
// module-scope array/object/string constants including exported ones, and
// the importedRenderedContent proxy) against a single target file —
// src/components/sections/OfferScenariosTab.tsx — so that the reported
// candidate-string count for this file is provably reproducible from the
// same shared methodology, not a re-tuned or narrowed one.
//
// Its GATE is the inventory-first requirement of V10-X2T.3A: it must
// reproduce the 1,234-candidate baseline for OfferScenariosTab.tsx recorded
// in the V10-X2T.2B report. If it does not, this script exits non-zero —
// the extractor is wrong, not the expectation.
//
// Unlike the shared inventory script (which only prints up to 8 samples per
// file), this script emits EVERY finding with its syntactic kind, 1-indexed
// source line, and full (untruncated) text, plus a `disposition` field
// initialized to "UNCLASSIFIED" for manual/inspectable classification. The
// classified result is written to
// docs/v10-x2t-3a/offer-inventory-classified.json (tracked) — this script
// itself only emits the raw pre-classification findings to stdout/JSON so
// the classification step is auditable as a separate artifact.

import ts from "typescript";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname as pathDirname, join } from "node:path";

const ROOT = process.cwd();
const TARGET_FILE = "src/components/sections/OfferScenariosTab.tsx";
const EXPECTED_BASELINE = 1234;

const VISIBLE_ATTRS = new Set([
  "aria-label",
  "title",
  "alt",
  "placeholder",
  "aria-valuetext",
  "aria-description",
  "aria-roledescription",
  "tooltip",
  "hint",
  "helperText",
  "errorText",
  "emptyText",
  "loadingText",
  "statusText",
  "description",
  "summary",
  "caption",
  "label",
]);

const TECHNICAL_ATTRS = new Set([
  "className",
  "id",
  "key",
  "htmlFor",
  "type",
  "name",
  "href",
  "src",
  "rel",
  "target",
  "role",
  "data-testid",
  "testId",
  "style",
  "tabIndex",
  "value",
  "defaultValue",
]);

function isMeaningfulText(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return false;
  if (/^[\s\-–—•·|/\\.,:;()%+*#@_[\]{}0-9]*$/.test(t)) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t)) return false;
  return true;
}

function collectLeafStringLiterals(expr: ts.Expression, out: ts.Expression[]): void {
  if (ts.isConditionalExpression(expr)) {
    collectLeafStringLiterals(expr.whenTrue, out);
    collectLeafStringLiterals(expr.whenFalse, out);
    return;
  }
  if (
    ts.isBinaryExpression(expr) &&
    [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(
      expr.operatorToken.kind,
    )
  ) {
    collectLeafStringLiterals(expr.left, out);
    collectLeafStringLiterals(expr.right, out);
    return;
  }
  if (ts.isParenthesizedExpression(expr)) {
    collectLeafStringLiterals(expr.expression, out);
    return;
  }
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr) || ts.isTemplateExpression(expr)) {
    out.push(expr);
  }
}

function templateLiteralText(node: ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression): string {
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  let combined = node.head.text;
  for (const span of node.templateSpans) combined += " " + span.literal.text;
  return combined;
}

function isTopLevelDeclarationName(node: ts.VariableDeclaration): string {
  return ts.isIdentifier(node.name) ? node.name.getText() : "<destructured>";
}

function rootIdentifierOf(expr: ts.Expression): string | null {
  let cur: ts.Expression = expr;
  while (ts.isPropertyAccessExpression(cur) || ts.isElementAccessExpression(cur)) {
    cur = cur.expression;
  }
  return ts.isIdentifier(cur) ? cur.text : null;
}

function collectLocalImportBindings(sourceFile: ts.SourceFile): Map<string, string> {
  const bindings = new Map<string, string>();
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    const spec = stmt.moduleSpecifier.text;
    if (!spec.startsWith(".")) continue;
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.name) bindings.set(clause.name.text, spec);
    const named = clause.namedBindings;
    if (named && ts.isNamedImports(named)) {
      for (const el of named.elements) bindings.set(el.name.text, spec);
    }
  }
  return bindings;
}

type Finding = {
  index: number;
  kind: string;
  line: number;
  text: string;
  path: string;
  disposition: string;
};

const found: Finding[] = [];

function lineOf(sourceFile: ts.SourceFile, pos: number): number {
  return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
}

function push(sourceFile: ts.SourceFile, node: ts.Node, kind: string, text: string, path: string): void {
  found.push({
    index: found.length + 1,
    kind,
    line: lineOf(sourceFile, node.getStart(sourceFile)),
    text,
    path,
    disposition: "UNCLASSIFIED",
  });
}

// Best-effort identifying label for an object literal in a data array: the
// value of its first string-literal property that looks like a stable
// identifying field (title/scenario/area/system/decision/division/id/year/
// period/label), used only to make `path` readable — never used for logic.
function identifyingLabel(node: ts.ObjectLiteralExpression): string | null {
  const preferredKeys = ["id", "title", "scenario", "area", "system", "decision", "division", "year", "period", "label", "domain"];
  for (const key of preferredKeys) {
    for (const prop of node.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ((ts.isIdentifier(prop.name) && prop.name.text === key) || (ts.isStringLiteral(prop.name) && prop.name.text === key)) &&
        ts.isStringLiteral(prop.initializer)
      ) {
        return prop.initializer.text;
      }
    }
  }
  return null;
}

function collectLiteralStrings(sourceFile: ts.SourceFile, node: ts.Expression, kindPrefix: string, path: string): void {
  if (ts.isStringLiteral(node)) {
    if (isMeaningfulText(node.text)) push(sourceFile, node, kindPrefix, node.text, path);
    return;
  }
  if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
    const text = templateLiteralText(node);
    if (isMeaningfulText(text)) push(sourceFile, node, `${kindPrefix}:template`, text, path);
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    node.elements.forEach((el, i) => collectLiteralStrings(sourceFile, el, kindPrefix, `${path}[${i}]`));
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const label = identifyingLabel(node);
    const objPath = label ? `${path}<${label}>` : path;
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const propName = ts.isIdentifier(prop.name) ? prop.name.text : ts.isStringLiteral(prop.name) ? prop.name.text : "<computed>";
        collectLiteralStrings(sourceFile, prop.initializer, kindPrefix, `${objPath}.${propName}`);
      }
    }
    return;
  }
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    collectLiteralStrings(sourceFile, node.expression, kindPrefix, path);
    return;
  }
  if (ts.isArrowFunction(node) && node.body && !ts.isBlock(node.body)) {
    collectLiteralStrings(sourceFile, node.body, kindPrefix, path);
  }
}

function scan(relPath: string): void {
  const full = join(ROOT, relPath);
  const text = readFileSync(full, "utf8");
  const sourceFile = ts.createSourceFile(relPath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const localImports = collectLocalImportBindings(sourceFile);

  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.initializer) continue;
      const name = isTopLevelDeclarationName(decl);
      const kind = isExported ? `exportedConst:${name}` : `moduleScopeConst:${name}`;
      collectLiteralStrings(sourceFile, decl.initializer, kind, name);
    }
  }

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const t = node.getText(sourceFile);
      if (isMeaningfulText(t)) push(sourceFile, node, "JsxText", t.trim(), `JSX:L${lineOf(sourceFile, node.getStart(sourceFile))}`);
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      if (TECHNICAL_ATTRS.has(name)) {
        // structural, not display text
      } else if (VISIBLE_ATTRS.has(name) && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          const t = node.initializer.text;
          if (isMeaningfulText(t)) push(sourceFile, node, `attr:${name}`, t, `JSX:L${lineOf(sourceFile, node.getStart(sourceFile))}:attr:${name}`);
        } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const leaves: ts.Expression[] = [];
          collectLeafStringLiterals(node.initializer.expression, leaves);
          for (const leaf of leaves) {
            const t = ts.isStringLiteral(leaf) ? leaf.text : templateLiteralText(leaf as ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression);
            if (isMeaningfulText(t)) push(sourceFile, leaf, `attr:${name}`, t, `JSX:L${lineOf(sourceFile, leaf.getStart(sourceFile))}:attr:${name}`);
          }
          const rootId = rootIdentifierOf(node.initializer.expression);
          if (rootId && localImports.has(rootId)) {
            push(sourceFile, node, `importedRenderedContent:attr:${name}`, `${rootId} (from ${localImports.get(rootId)})`, `JSX:L${lineOf(sourceFile, node.getStart(sourceFile))}:attr:${name}`);
          }
        }
      }
    } else if (
      ts.isJsxExpression(node) &&
      node.expression &&
      node.parent &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      const leaves: ts.Expression[] = [];
      collectLeafStringLiterals(node.expression, leaves);
      for (const leaf of leaves) {
        const t = ts.isStringLiteral(leaf) ? leaf.text : templateLiteralText(leaf as ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression);
        if (isMeaningfulText(t)) push(sourceFile, leaf, "JsxExprChild", t, `JSX:L${lineOf(sourceFile, leaf.getStart(sourceFile))}`);
      }
      const rootId = rootIdentifierOf(node.expression);
      if (rootId && localImports.has(rootId)) {
        push(sourceFile, node, "importedRenderedContent:child", `${rootId} (from ${localImports.get(rootId)})`, `JSX:L${lineOf(sourceFile, node.getStart(sourceFile))}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

scan(TARGET_FILE);

const byKind = new Map<string, number>();
for (const f of found) {
  const bucket = f.kind.split(":")[0];
  byKind.set(bucket, (byKind.get(bucket) ?? 0) + 1);
}

console.log(`Offer inventory: ${found.length} candidate findings in ${TARGET_FILE}`);
console.log(`Expected baseline (V10-X2T.2B report): ${EXPECTED_BASELINE}`);
console.log("");
console.log("Per-kind histogram:");
for (const [kind, count] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(count).padStart(5)}  ${kind}`);
}

const outPath = join(ROOT, "docs/v10-x2t-3a/offer-inventory-raw.json");
mkdirSync(pathDirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(found, null, 2) + "\n", "utf8");
console.log("");
console.log(`Wrote ${found.length} raw findings to ${outPath}`);

if (found.length !== EXPECTED_BASELINE) {
  console.error("");
  console.error(
    `GATE FAILED: extractor produced ${found.length}, expected exactly ${EXPECTED_BASELINE}. ` +
      "This extractor must exactly reproduce the shared inventory methodology's count for this file. Do not proceed to edits.",
  );
  process.exit(1);
}

console.log("");
console.log(`GATE PASSED: reproduced the ${EXPECTED_BASELINE} baseline exactly.`);
