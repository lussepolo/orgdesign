// Phase V10-X2T.2B — mechanical visible-string inventory, split by reachability.
//
// AST-walks every .tsx/.ts file under the interactive-UI directories and
// reports candidate visible/rendered string content across a broadened set
// of syntactic shapes, not just direct JSX text and a fixed attribute list.
//
// V10-X2T.2B repair: the prior version only detected (1) JSX text nodes,
// (2) a fixed list of "visible" JSX attributes, and (3) a string literal
// that is the *direct, unwrapped* child of a JSX expression container. That
// missed: strings nested inside a conditional/logical JSX-child expression
// (loading/empty/error/status text — e.g. `{loading ? "Carregando..." : x}`
// or `{error && "Falha ao carregar"}`); string values living in a
// module-scope array/object rendered later (data-driven content); plain
// string arrays; template literals with substitutions (only the
// no-substitution case was handled, and only as a direct JSX child);
// exported string constants (export-facing labels, e.g. governed
// filenames/sheet-name-adjacent labels, CSV/report headers); a widened
// accessibility/tooltip attribute set; and fixtures/snapshots under tests/.
//
// This script produces an INVENTORY — a complete, inspectable count of
// candidate content by category and reachability. It intentionally does
// NOT define or gate "whole-application localization closure" (that is a
// separate, harder question — whether every governed string has actually
// been translated — and it must remain open/failing while governed strings
// remain unresolved; see scripts/validate-v10-x2t-workspace-architecture-i18n.ts
// section Q5, which consumes this script's REACHABLE total as one input to
// that closure question, not as this script's own pass/fail criterion).
// Running to completion and reporting every category below is this
// script's own success condition; it does not exit non-zero based on the
// counts it finds.
//
// Reachability is computed by crawling the relative-import graph starting
// at src/main.tsx (the same graph the bundler and the browser actually
// walk):
//   - REACHABLE: files transitively imported from main.tsx.
//   - UNREACHABLE: files under the target directories that are not in the
//     reachable set (e.g. StaffingTab.tsx, DreAssumptionStatusPanel.tsx).
//   - FIXTURES: files under tests/ or matching a snapshot/fixture naming
//     convention. Never part of REACHABLE or UNREACHABLE (they are not
//     imported by main.tsx and are not dead application code — they are a
//     distinct third category), reported separately.

import ts from "typescript";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, dirname, normalize, relative } from "node:path";

const ROOT = process.cwd();

const TARGET_DIRS = [
  "src/App.tsx",
  "src/components/common",
  "src/components/sections",
  "src/components/dreSimulator",
  "src/components/viability",
  "src/features/rio-scenario-resilience/components",
  "src/features/rio-scenario-resilience/RioScenarioResiliencePreview.tsx",
  "src/PasswordGate.tsx",
];

const FIXTURE_DIRS = ["tests"];

// ── Reachability: crawl the relative-import graph from src/main.tsx ────────
const RESOLVE_EXTS = [".tsx", ".ts", ".jsx", ".js"];
const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*from\s+)?['"]([^'"]+)['"]/g;

function resolveModule(baseDir: string, spec: string): string | null {
  if (!spec.startsWith(".")) return null; // external package
  const cand = normalize(join(baseDir, spec));
  if (existsSync(cand) && statSync(cand).isFile()) return cand;
  for (const ext of RESOLVE_EXTS) {
    if (existsSync(cand + ext)) return cand + ext;
  }
  if (existsSync(cand) && statSync(cand).isDirectory()) {
    for (const ext of RESOLVE_EXTS) {
      const idx = join(cand, "index" + ext);
      if (existsSync(idx)) return idx;
    }
  }
  return null;
}

function computeReachableSet(entry: string): Set<string> {
  const visited = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const f = queue.pop()!;
    if (visited.has(f)) continue;
    visited.add(f);
    let content: string;
    try {
      content = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    for (const m of content.matchAll(IMPORT_RE)) {
      const resolved = resolveModule(dirname(f), m[1]);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }
  return visited;
}

const REACHABLE_SET = computeReachableSet(join(ROOT, "src/main.tsx"));

// Local (relative) import bindings per file, used to flag "imported
// rendered content" — a JSX child or attribute value that is a bare
// identifier or property-access rooted at a name imported from a local
// module. Full cross-module rendered-content resolution would need a type
// checker; this is a documented, deliberately shallow proxy: it flags the
// site for manual audit rather than claiming to resolve what the imported
// value actually renders as.
function collectLocalImportBindings(sourceFile: ts.SourceFile, fileDir: string): Map<string, string> {
  const bindings = new Map<string, string>();
  for (const stmt of sourceFile.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier)) continue;
    const spec = stmt.moduleSpecifier.text;
    if (!spec.startsWith(".")) continue;
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.name) bindings.set(clause.name.text, spec);
    const bindings_ = clause.namedBindings;
    if (bindings_ && ts.isNamedImports(bindings_)) {
      for (const el of bindings_.elements) bindings.set(el.name.text, spec);
    }
  }
  return bindings;
}

const VISIBLE_ATTRS = new Set([
  // Original tracked set
  "aria-label",
  "title",
  "alt",
  "placeholder",
  "aria-valuetext",
  // Repair: widened accessibility set
  "aria-description",
  "aria-roledescription",
  // Repair: tooltip / hint conventions used in this codebase and common UI libs
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

// Attribute names that are structurally string-valued but never display
// text — excluded even though a naive attr-string scan would catch them.
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

function walkFiles(p: string): string[] {
  const full = join(ROOT, p);
  const stat = statSync(full);
  if (stat.isFile()) return [p];
  const out: string[] = [];
  for (const entry of readdirSync(full)) {
    const rel = join(p, entry);
    const s = statSync(join(ROOT, rel));
    if (s.isDirectory()) out.push(...walkFiles(rel));
    else if ([".tsx", ".ts"].includes(extname(entry))) out.push(rel);
  }
  return out;
}

function walkFixtureFiles(p: string): string[] {
  const full = join(ROOT, p);
  if (!existsSync(full)) return [];
  const stat = statSync(full);
  if (stat.isFile()) return [".tsx", ".ts"].includes(extname(p)) ? [p] : [];
  const out: string[] = [];
  for (const entry of readdirSync(full)) {
    const rel = join(p, entry);
    const s = statSync(join(ROOT, rel));
    if (s.isDirectory()) out.push(...walkFixtureFiles(rel));
    else if ([".tsx", ".ts"].includes(extname(entry))) out.push(rel);
  }
  return out;
}

type Finding = { kind: string; text: string };
type FileResult = {
  file: string;
  usesLocale: boolean;
  count: number;
  samples: Finding[];
  reachable: boolean;
  bucket: "REACHABLE" | "UNREACHABLE" | "FIXTURE";
};

function isMeaningfulText(s: string): boolean {
  const t = s.trim();
  if (t.length === 0) return false;
  if (/^[\s\-–—•·|/\\.,:;()%+*#@_[\]{}0-9]*$/.test(t)) return false; // punctuation/numeric only
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(t)) return false;
  return true;
}

// Unwrap conditional (?:) and logical (&&, ??) expressions down to their
// leaf string/template literals — catches loading/empty/error/status text
// that is conditionally rendered rather than a bare JSX-child string.
function collectLeafStringLiterals(expr: ts.Expression, out: ts.Expression[]): void {
  if (ts.isConditionalExpression(expr)) {
    collectLeafStringLiterals(expr.whenTrue, out);
    collectLeafStringLiterals(expr.whenFalse, out);
    return;
  }
  if (ts.isBinaryExpression(expr) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(expr.operatorToken.kind)) {
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

// Recursively collect string-literal leaves from a module-scope array or
// object literal (covers plain string arrays, arrays/objects of records
// with display-text properties, and nested rendered content one or more
// levels deep). Property KEYS are not collected (they are identifiers),
// only VALUES — except when a value is itself used as both an id and a
// display string, which surfaces here as an ordinary string value finding
// (the dual-purpose case is a classification note for the auditor, not a
// distinct AST shape).
function collectLiteralStrings(node: ts.Expression, out: Finding[], kindPrefix: string): void {
  if (ts.isStringLiteral(node)) {
    if (isMeaningfulText(node.text)) out.push({ kind: kindPrefix, text: node.text.slice(0, 140) });
    return;
  }
  if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
    const t = templateLiteralText(node);
    if (isMeaningfulText(t)) out.push({ kind: `${kindPrefix}:template`, text: t.slice(0, 140) });
    return;
  }
  if (ts.isArrayLiteralExpression(node)) {
    for (const el of node.elements) collectLiteralStrings(el, out, kindPrefix);
    return;
  }
  if (ts.isObjectLiteralExpression(node)) {
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        collectLiteralStrings(prop.initializer, out, kindPrefix);
      }
    }
    return;
  }
  if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
    collectLiteralStrings(node.expression, out, kindPrefix);
    return;
  }
  // Arrow function returning an array/object literal (e.g. builders/factories).
  if (ts.isArrowFunction(node) && node.body && !ts.isBlock(node.body)) {
    collectLiteralStrings(node.body, out, kindPrefix);
  }
}

const results: FileResult[] = [];

function scanFile(relPath: string, bucket: "REACHABLE" | "UNREACHABLE" | "FIXTURE"): void {
  const full = join(ROOT, relPath);
  let text: string;
  try {
    text = readFileSync(full, "utf8");
  } catch {
    return;
  }
  const sourceFile = ts.createSourceFile(relPath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const usesLocale = /useLocale/.test(text);
  const found: Finding[] = [];
  const localImports = collectLocalImportBindings(sourceFile, dirname(full));

  // Module-scope (top-level) array/object/string constants, including
  // exported ones (export-facing labels).
  for (const stmt of sourceFile.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    const isExported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.initializer) continue;
      const name = isTopLevelDeclarationName(decl);
      const kind = isExported ? `exportedConst:${name}` : `moduleScopeConst:${name}`;
      collectLiteralStrings(decl.initializer, found, kind);
    }
  }

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const t = node.getText(sourceFile);
      if (isMeaningfulText(t)) {
        found.push({ kind: "JsxText", text: t.trim().slice(0, 140) });
      }
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sourceFile);
      if (TECHNICAL_ATTRS.has(name)) {
        // structural, not display text — skip even if string-valued
      } else if (VISIBLE_ATTRS.has(name) && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          const t = node.initializer.text;
          if (isMeaningfulText(t)) found.push({ kind: `attr:${name}`, text: t.slice(0, 140) });
        } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
          const leaves: ts.Expression[] = [];
          collectLeafStringLiterals(node.initializer.expression, leaves);
          for (const leaf of leaves) {
            const t = ts.isStringLiteral(leaf) ? leaf.text : templateLiteralText(leaf as ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression);
            if (isMeaningfulText(t)) found.push({ kind: `attr:${name}`, text: t.slice(0, 140) });
          }
          // Imported rendered content proxy: `attr={SomeImportedBinding}` or
          // `attr={SomeImportedBinding.prop}`.
          const rootId = rootIdentifierOf(node.initializer.expression);
          if (rootId && localImports.has(rootId)) {
            found.push({ kind: `importedRenderedContent:attr:${name}`, text: `${rootId} (from ${localImports.get(rootId)})` });
          }
        }
      }
    } else if (ts.isJsxExpression(node) && node.expression && node.parent && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      // Direct JSX child expression container: unwrap conditional/logical
      // wrappers to reach leaf string/template literals (covers
      // loading/empty/error/status text, not just a bare string child).
      const leaves: ts.Expression[] = [];
      collectLeafStringLiterals(node.expression, leaves);
      for (const leaf of leaves) {
        const t = ts.isStringLiteral(leaf) ? leaf.text : templateLiteralText(leaf as ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression);
        if (isMeaningfulText(t)) found.push({ kind: "JsxExprChild", text: t.slice(0, 140) });
      }
      const rootId = rootIdentifierOf(node.expression);
      if (rootId && localImports.has(rootId)) {
        found.push({ kind: "importedRenderedContent:child", text: `${rootId} (from ${localImports.get(rootId)})` });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  results.push({
    file: relPath,
    usesLocale,
    count: found.length,
    samples: found.slice(0, 8),
    reachable: bucket === "REACHABLE",
    bucket,
  });
}

function rootIdentifierOf(expr: ts.Expression): string | null {
  let cur: ts.Expression = expr;
  while (ts.isPropertyAccessExpression(cur) || ts.isElementAccessExpression(cur)) {
    cur = cur.expression;
  }
  return ts.isIdentifier(cur) ? cur.text : null;
}

const appFiles = TARGET_DIRS.flatMap(walkFiles);
for (const relPath of appFiles) {
  const full = join(ROOT, relPath);
  scanFile(relPath, REACHABLE_SET.has(full) ? "REACHABLE" : "UNREACHABLE");
}

const fixtureFiles = FIXTURE_DIRS.flatMap(walkFixtureFiles);
for (const relPath of fixtureFiles) {
  scanFile(relPath, "FIXTURE");
}

results.sort((a, b) => b.count - a.count);

const reachableResults = results.filter((r) => r.bucket === "REACHABLE");
const unreachableResults = results.filter((r) => r.bucket === "UNREACHABLE");
const fixtureResults = results.filter((r) => r.bucket === "FIXTURE");

const reachableTotal = reachableResults.reduce((sum, r) => sum + r.count, 0);
const unreachableTotal = unreachableResults.reduce((sum, r) => sum + r.count, 0);
const fixtureTotal = fixtureResults.reduce((sum, r) => sum + r.count, 0);

console.log(
  `TOTAL files scanned: ${results.length} (reachable=${reachableResults.length} unreachable=${unreachableResults.length} fixtures=${fixtureResults.length})`,
);
console.log(`REACHABLE candidate visible-string literals found: ${reachableTotal}`);
console.log(`UNREACHABLE (legacy/unmounted) candidate visible-string literals found: ${unreachableTotal}`);
console.log(`FIXTURE candidate visible-string literals found: ${fixtureTotal}`);
console.log("");
console.log("=== REACHABLE — this is the input the separate closure check (Q5) reads ===");
console.log("Per-file breakdown (count, usesLocale already):");
for (const r of reachableResults) {
  console.log(`${String(r.count).padStart(5)}  ${r.usesLocale ? "[i18n]" : "      "}  ${r.file}`);
}
console.log("");
console.log("=== UNREACHABLE (legacy/unmounted) — reported for visibility only ===");
for (const r of unreachableResults) {
  console.log(`${String(r.count).padStart(5)}  ${r.usesLocale ? "[i18n]" : "      "}  ${r.file}`);
}
console.log("");
console.log("=== FIXTURES (tests/) — reported for visibility only, distinct from app reachability ===");
for (const r of fixtureResults) {
  if (r.count > 0) console.log(`${String(r.count).padStart(5)}  ${r.usesLocale ? "[i18n]" : "      "}  ${r.file}`);
}
console.log("");
console.log(
  "INVENTORY COMPLETENESS: this script's own success condition is that it walked every target file and\n" +
    "every fixture file to completion and classified every candidate finding into a reported bucket/kind\n" +
    "above (JsxText, attr:*, JsxExprChild, moduleScopeConst:*, exportedConst:*, *:template,\n" +
    "importedRenderedContent:*). It always exits 0 when the walk completes; it does not itself decide\n" +
    "whether the application is fully localized (see the separate, and much harder, closure question).",
);
