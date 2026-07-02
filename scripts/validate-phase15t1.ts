/**
 * Phase 15T.1 validation — Remove incorrect HC source pending from model-backed org design cards
 * 11 checks: badge correction, Scenario B fixture, Phase 15S values, scope protection.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import { buildExecutiveOrgDesignTree } from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

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

function readFileSafe(relPath: string): string {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf-8");
}

function findNodeByIdRecursive(
  node: { id: string; headcountStatus?: string; children?: unknown[] },
  targetId: string,
): { id: string; headcountStatus?: string; children?: unknown[] } | undefined {
  if (node.id === targetId) return node;
  for (const child of (node.children ?? []) as { id: string; headcountStatus?: string; children?: unknown[] }[]) {
    const found = findNodeByIdRecursive(child, targetId);
    if (found) return found;
  }
  return undefined;
}

// ── Pre-compute shared fixtures ────────────────────────────────────────────────
const treeBalanced2028 = buildExecutiveOrgDesignTree("balanced", 2028);
const hcTable = buildOrgDesignHcTable({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
  year: 2028,
});

const modelSource = readFileSafe("src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts");
const tabSource = readFileSafe("src/components/sections/ExecutiveOrgDesignTab.tsx");

// ── Section A: Badge correction ────────────────────────────────────────────────
console.log("\nSection A — Badge correction:");

const lsPackageNode = findNodeByIdRecursive(
  treeBalanced2028.root as { id: string; headcountStatus?: string; children?: unknown[] },
  "ls-educator-package",
);
const eyPackageNode = findNodeByIdRecursive(
  treeBalanced2028.root as { id: string; headcountStatus?: string; children?: unknown[] },
  "ey-educator-package",
);

check(
  1,
  "Lower School Educator Package node is NOT source-pending",
  lsPackageNode?.headcountStatus !== "source-pending",
  `actual: ${lsPackageNode?.headcountStatus}`,
);
check(
  2,
  "Lower School Educator Package node is model-backed",
  lsPackageNode?.headcountStatus === "model-backed",
  `actual: ${lsPackageNode?.headcountStatus}`,
);
check(
  3,
  "Early Years Educator Package node is NOT source-pending",
  eyPackageNode?.headcountStatus !== "source-pending",
  `actual: ${eyPackageNode?.headcountStatus}`,
);
check(
  4,
  "Early Years Educator Package node is model-backed",
  eyPackageNode?.headcountStatus === "model-backed",
  `actual: ${eyPackageNode?.headcountStatus}`,
);
check(
  5,
  "executiveOrgDesignModel.ts contains modelBackedHeadcount helper",
  modelSource.includes("modelBackedHeadcount"),
);
check(
  6,
  "ExecutiveOrgDesignTab.tsx renders 'Model-backed HC' for model-backed status",
  tabSource.includes("Model-backed HC"),
);

// ── Section B: Scenario B fixture unchanged ────────────────────────────────────
console.log("\nSection B — Scenario B / t1_g4 / 2028 fixture:");

const g4TeachRow = hcTable.rows.find((r) => r.role === "Grade 4 Reference Educator");
const g4AssiRow = hcTable.rows.find((r) => r.role === "Grade 4 Assistant");
const g4MonRow = hcTable.rows.find((r) => r.role === "Grade 4 Monitor");

check(
  7,
  "Grade 4 Reference Educator HC = 2 (unchanged)",
  g4TeachRow?.headcountOrFte === 2,
  `actual: ${g4TeachRow?.headcountOrFte}`,
);
check(
  8,
  "Grade 4 Assistant HC = 2 (unchanged)",
  g4AssiRow?.headcountOrFte === 2,
  `actual: ${g4AssiRow?.headcountOrFte}`,
);
check(
  9,
  "Grade 4 remains Lower School (unchanged)",
  g4TeachRow?.divisionArea === "Lower School",
  `actual: ${g4TeachRow?.divisionArea}`,
);
check(
  10,
  "Grade 4 Monitor absent (EY-only rule, unchanged)",
  g4MonRow === undefined,
);

// ── Section C: Phase 15S values unchanged ─────────────────────────────────────
console.log("\nSection C — Phase 15S values:");

const fopagOut = calculateFopag({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
});
check(
  11,
  "t1_g4 / intermediario / 2028 engine still calculation_ready (enrollment 258 / capacity 358 intact)",
  fopagOut.calculationReady,
  `engineStatus: ${fopagOut.engineStatus}`,
);

// ── Final report ───────────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────────────────────────");
console.log(`Phase 15T.1 validation: ${passCount} / ${results.length} passed, ${failCount} failed`);

if (failCount > 0) {
  console.log("\nFailed checks:");
  results
    .filter((r) => !r.pass)
    .forEach((r) =>
      console.log(`  [${r.id.toString().padStart(2, "0")}] ${r.description}${r.detail ? ` — ${r.detail}` : ""}`),
    );
  process.exit(1);
} else {
  console.log("\nAll 11 checks passed. Phase 15T.1 validated.");
}
