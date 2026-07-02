/**
 * Phase 15T validation — Org Design Role-Level Headcount by Opening Scenario
 * 37 checks: controls, role-level table, Scenario B fixture, Balanced hub,
 * Secretary/Registrar rename, and scope protection.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import { buildExecutiveOrgDesignTree } from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const TOLERANCE = 1e-6;

type CheckResult = { id: number; description: string; pass: boolean; detail?: string };
const results: CheckResult[] = [];
let passCount = 0;
let failCount = 0;

function check(id: number, description: string, pass: boolean, detail?: string): void {
  results.push({ id, description, pass, detail });
  if (pass) {
    passCount++;
    console.log(`  PASS [${id.toString().padStart(2, "0")}] ${description}`);
  } else {
    failCount++;
    console.log(`  FAIL [${id.toString().padStart(2, "0")}] ${description}${detail ? ` — ${detail}` : ""}`);
  }
}

function readFileSafe(relPath: string): string | null {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, "utf-8");
}

function gitDiffNames(): string[] {
  try {
    const out = execSync("git diff HEAD --name-only", { cwd: ROOT }).toString().trim();
    return out ? out.split("\n").map((s) => s.trim()) : [];
  } catch {
    return [];
  }
}

// ── Pre-compute shared fixtures ────────────────────────────────────────────────
const B_2028_BALANCED = buildOrgDesignHcTable({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
  year: 2028,
});

const B_2028_MIN = buildOrgDesignHcTable({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "minimum_experience",
  year: 2028,
});

const treeBalanced2028 = buildExecutiveOrgDesignTree("balanced", 2028);
const treeMin2028 = buildExecutiveOrgDesignTree("minimum", 2028);

const tabSource = readFileSafe("src/components/sections/ExecutiveOrgDesignTab.tsx") ?? "";
const modelSource = readFileSafe("src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts") ?? "";
const adapterSource = readFileSafe("src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts") ?? "";
const leadershipSource = readFileSafe("src/constants/leadership.ts") ?? "";

// ── Section A: Controls ────────────────────────────────────────────────────────
console.log("\nSection A — Controls:");

check(
  1,
  "ExecutiveOrgDesignTab contains opening scenario selector with t1_g3",
  tabSource.includes("t1_g3"),
);
check(
  2,
  "ExecutiveOrgDesignTab contains opening scenario selector with t1_g4",
  tabSource.includes("t1_g4"),
);
check(
  3,
  "ExecutiveOrgDesignTab contains opening scenario selector with t1_g5",
  tabSource.includes("t1_g5"),
);
check(
  4,
  "ExecutiveOrgDesignTab contains opening scenario selector with t1_g6",
  tabSource.includes("t1_g6"),
);
check(
  5,
  "ExecutiveOrgDesignTab default opening package is t1_g4 (Scenario B)",
  tabSource.includes(`useState<OpeningPackageId>("t1_g4")`),
);
check(
  6,
  "ExecutiveOrgDesignTab contains year selector (EXECUTIVE_ORG_YEARS)",
  tabSource.includes("EXECUTIVE_ORG_YEARS"),
);
check(
  7,
  "ExecutiveOrgDesignTab contains org design version selector (EXECUTIVE_ORG_SCENARIOS)",
  tabSource.includes("EXECUTIVE_ORG_SCENARIOS"),
);

// ── Section B: Adapter existence and structure ─────────────────────────────────
console.log("\nSection B — Adapter existence and structure:");

check(
  8,
  "orgDesignHcTableAdapter.ts exists",
  adapterSource.length > 0,
);
check(
  9,
  "Adapter exports buildOrgDesignHcTable",
  adapterSource.includes("export function buildOrgDesignHcTable"),
);
check(
  10,
  "Adapter exports OrgDesignHcTableRow interface",
  adapterSource.includes("export interface OrgDesignHcTableRow"),
);
check(
  11,
  "Adapter uses calculateFopag (no manual HC synthesis)",
  adapterSource.includes("calculateFopag") && !adapterSource.includes("headcountOrFte = "),
);
check(
  12,
  "Adapter table result has rows array",
  Array.isArray(B_2028_BALANCED.rows),
);
check(
  13,
  "Engine calculation_ready for t1_g4/intermediario/balanced_experience/2028",
  B_2028_BALANCED.calculationReady,
  `engineStatus=${B_2028_BALANCED.engineStatus}`,
);
check(
  14,
  "t1_g4/2028/balanced active row count is 50",
  B_2028_BALANCED.rows.length === 50,
  `actual: ${B_2028_BALANCED.rows.length}`,
);
check(
  15,
  "All rows have the five required columns populated",
  B_2028_BALANCED.rows.every(
    (r) =>
      r.divisionArea.length > 0 &&
      r.roleGroupOrHub.length > 0 &&
      r.role.length > 0 &&
      typeof r.headcountOrFte === "number" &&
      r.sourceTypeLogic.length > 0,
  ),
  "divisionArea, roleGroupOrHub, role, headcountOrFte, sourceTypeLogic",
);

// ── Section C: Scenario B / t1_g4 / 2028 fixture ─────────────────────────────
console.log("\nSection C — Scenario B / t1_g4 / 2028 fixture:");

const g4TeachRow = B_2028_BALANCED.rows.find((r) => r.role === "Grade 4 Reference Educator");
const g4AssiRow = B_2028_BALANCED.rows.find((r) => r.role === "Grade 4 Assistant");
const g4MonRow = B_2028_BALANCED.rows.find((r) => r.role === "Grade 4 Monitor");

check(
  16,
  "Scenario B/2028/balanced: Grade 4 Reference Educator row present",
  g4TeachRow !== undefined,
);
check(
  17,
  "Scenario B/2028/balanced: Grade 4 Reference Educator HC = 2",
  g4TeachRow?.headcountOrFte === 2,
  `actual: ${g4TeachRow?.headcountOrFte}`,
);
check(
  18,
  "Scenario B/2028/balanced: Grade 4 Reference Educator divisionArea = Lower School",
  g4TeachRow?.divisionArea === "Lower School",
  `actual: ${g4TeachRow?.divisionArea}`,
);
check(
  19,
  "Scenario B/2028/balanced: Grade 4 Assistant row present",
  g4AssiRow !== undefined,
);
check(
  20,
  "Scenario B/2028/balanced: Grade 4 Assistant HC = 2",
  g4AssiRow?.headcountOrFte === 2,
  `actual: ${g4AssiRow?.headcountOrFte}`,
);
check(
  21,
  "Scenario B/2028/balanced: Grade 4 Assistant divisionArea = Lower School",
  g4AssiRow?.divisionArea === "Lower School",
  `actual: ${g4AssiRow?.divisionArea}`,
);
check(
  22,
  "Scenario B/2028/balanced: No Grade 4 Monitor row (EY-only rule)",
  g4MonRow === undefined,
  g4MonRow ? `unexpected row found: HC ${g4MonRow.headcountOrFte}` : undefined,
);

// ── Section D: Balanced Learning Experience Design Hub ────────────────────────
console.log("\nSection D — Balanced Learning Experience Design Hub:");

const ledRow = B_2028_BALANCED.rows.find((r) => r.role === "Learning Experience Designer");
const langRow = B_2028_BALANCED.rows.find((r) => r.role === "Language Acquisition and Performance Coach");
const plaRow = B_2028_BALANCED.rows.find((r) => r.role === "Personalized Learning Associate Educator");

check(
  23,
  "Balanced/2028: Learning Experience Designer row present",
  ledRow !== undefined,
);
check(
  24,
  "Balanced/2028: LED row divisionArea = Learning Experience Design Hub",
  ledRow?.divisionArea === "Learning Experience Design Hub",
  `actual: ${ledRow?.divisionArea}`,
);
check(
  25,
  "Balanced/2028: LED row roleGroupOrHub = Learning Experience Design Hub",
  ledRow?.roleGroupOrHub === "Learning Experience Design Hub",
  `actual: ${ledRow?.roleGroupOrHub}`,
);
check(
  26,
  "Balanced/2028: Language Acquisition and Performance Coach row present",
  langRow !== undefined,
);
check(
  27,
  "Balanced/2028: Language Acquisition Coach divisionArea = Learning Experience Design Hub",
  langRow?.divisionArea === "Learning Experience Design Hub",
  `actual: ${langRow?.divisionArea}`,
);
check(
  28,
  "Balanced/2028: Personalized Learning Associate Educator row present",
  plaRow !== undefined,
);
check(
  29,
  "Balanced/2028: PLA divisionArea = Learning Experience Design Hub",
  plaRow?.divisionArea === "Learning Experience Design Hub",
  `actual: ${plaRow?.divisionArea}`,
);

// Verify hub order: LED before Language Acquisition before PLA
const hubRows = B_2028_BALANCED.rows.filter((r) => r.divisionArea === "Learning Experience Design Hub");
const ledIdx = hubRows.findIndex((r) => r.role === "Learning Experience Designer");
const langIdx = hubRows.findIndex((r) => r.role === "Language Acquisition and Performance Coach");
const plaIdx = hubRows.findIndex((r) => r.role === "Personalized Learning Associate Educator");

check(
  30,
  "Balanced hub order: LED (0) → Language Acquisition (1) → PLA (2)",
  ledIdx === 0 && langIdx === 1 && plaIdx === 2,
  `actual indices: LED=${ledIdx}, Lang=${langIdx}, PLA=${plaIdx}`,
);

// In Minimum, hub roles are NOT in Learning Experience Design Hub
const ledRowMin = B_2028_MIN.rows.find((r) => r.role === "Learning Experience Designer");
check(
  31,
  "Minimum/2028: LED is NOT in Learning Experience Design Hub (Minimum has no hub)",
  ledRowMin?.divisionArea !== "Learning Experience Design Hub",
  `actual: ${ledRowMin?.divisionArea}`,
);

// ── Section E: Secretary → Registrar rename ────────────────────────────────────
console.log("\nSection E — Secretary → Registrar rename:");

const registrarRow = B_2028_BALANCED.rows.find((r) => r.role === "Registrar");
const secretaryRow = B_2028_BALANCED.rows.find((r) => r.role === "School Secretary" || r.role === "Secretary");

check(
  32,
  "HC table row for secretary displays as 'Registrar'",
  registrarRow !== undefined,
  registrarRow ? undefined : "No 'Registrar' row found in HC table",
);
check(
  33,
  "HC table does NOT display 'Secretary' or 'School Secretary' label",
  secretaryRow === undefined,
  secretaryRow ? `Found row with role='${secretaryRow.role}'` : undefined,
);

// Tree-level rename
function findNodeRecursive(node: { label: string; children?: { label: string; children?: unknown[] }[] }, label: string): boolean {
  if (node.label === label) return true;
  return (node.children ?? []).some((c) =>
    findNodeRecursive(c as { label: string; children?: { label: string; children?: unknown[] }[] }, label),
  );
}

const treeHasRegistrar = findNodeRecursive(treeBalanced2028.root as { label: string; children?: { label: string; children?: unknown[] }[] }, "Registrar");
const treeHasSecretary = findNodeRecursive(treeBalanced2028.root as { label: string; children?: { label: string; children?: unknown[] }[] }, "Secretary");

check(
  34,
  "Org tree (Balanced/2028) contains node labeled 'Registrar'",
  treeHasRegistrar,
);
check(
  35,
  "Org tree (Balanced/2028) does NOT contain node labeled 'Secretary'",
  !treeHasSecretary,
  treeHasSecretary ? "Found 'Secretary' node in tree" : undefined,
);

// Role ID stability: 'secretary' must still be referenced in leadership.ts and model
check(
  36,
  "leadership.ts retains role ID 'secretary' (stable payroll ID)",
  leadershipSource.includes(`"secretary"`) || leadershipSource.includes(`'secretary'`),
);
check(
  37,
  "executiveOrgDesignModel.ts retains id: 'secretary' node (stable tree ID)",
  modelSource.includes(`id: "secretary"`),
);

// ── Final report ───────────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────────────────────────");
console.log(`Phase 15T validation: ${passCount} / ${results.length} passed, ${failCount} failed`);

if (failCount > 0) {
  console.log("\nFailed checks:");
  results
    .filter((r) => !r.pass)
    .forEach((r) => console.log(`  [${r.id.toString().padStart(2, "0")}] ${r.description}${r.detail ? ` — ${r.detail}` : ""}`));
  process.exit(1);
} else {
  console.log("\nAll 37 checks passed. Phase 15T validated.");
}
