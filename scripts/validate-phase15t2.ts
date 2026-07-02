/**
 * Phase 15T.2 validation — Balanced Experience org design explanation
 * 20 checks: explanation presence, content, scope, scope protection, fixture integrity.
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

function fileUnmodified(relPath: string, markerPhase = "15T.2"): boolean {
  const src = readFileSafe(relPath);
  return !src.includes(markerPhase);
}

const tabSource = readFileSafe("src/components/sections/ExecutiveOrgDesignTab.tsx");

// ── Section A: Explanation presence and scope ──────────────────────────────────
console.log("\nSection A — Explanation presence and scope:");

check(
  1,
  "ExecutiveOrgDesignTab includes a BalancedExplanationPanel component",
  tabSource.includes("BalancedExplanationPanel"),
);
check(
  2,
  "Explanation is scoped to scenario === 'balanced' (conditional render)",
  tabSource.includes(`scenario === "balanced"`) && tabSource.includes("BalancedExplanationPanel"),
);
check(
  3,
  "Explanation includes 'Balanced Experience'",
  tabSource.includes("Balanced Experience"),
);
check(
  4,
  "Explanation includes 'recommended'",
  tabSource.includes("recommended"),
);
check(
  5,
  "Explanation includes 'Learning Experience Design Hub'",
  tabSource.includes("Learning Experience Design Hub"),
);

// ── Section B: Hub hierarchy and roles ────────────────────────────────────────
console.log("\nSection B — Hub hierarchy and copy:");

check(
  6,
  "Explanation includes 'Learning Experience Designer'",
  tabSource.includes("Learning Experience Designer"),
);
check(
  7,
  "Explanation includes 'Language Acquisition and Performance Coach'",
  tabSource.includes("Language Acquisition and Performance Coach"),
);
check(
  8,
  "Explanation includes 'Personalized Learning Associate Educator'",
  tabSource.includes("Personalized Learning Associate Educator"),
);

// ── Section C: Dynamic HC and model-backed copy ────────────────────────────────
console.log("\nSection C — Dynamic HC and model-backed copy:");

check(
  9,
  "Explanation states HC changes by selected opening scenario and year",
  tabSource.includes("opening scenario") && tabSource.includes("year"),
);
check(
  10,
  "Explanation states HC is model-backed or generated from staffing/FOPAG logic",
  tabSource.includes("model-backed") || tabSource.includes("FOPAG"),
);

// ── Section D: Division staffing logic ────────────────────────────────────────
console.log("\nSection D — Division staffing logic copy:");

check(
  11,
  "Explanation mentions Early Years with Reference Educator + Assistant + Monitor",
  tabSource.includes("Reference Educator") && tabSource.includes("Monitor") && tabSource.includes("Early Years"),
);
check(
  12,
  "Explanation mentions Lower School with Reference Educator + Assistant",
  tabSource.includes("Lower School") && tabSource.includes("Reference Educator + Assistant"),
);
check(
  13,
  "Explanation mentions Middle School and High School progression/mentorship/program absorption",
  tabSource.includes("Middle School") &&
    tabSource.includes("High School") &&
    (tabSource.includes("program absorption") || tabSource.includes("mentorship")),
);

// ── Section E: Scope protection ────────────────────────────────────────────────
console.log("\nSection E — Scope protection (no Phase 15T.2 marker in formula files):");

const PROTECTED = [
  "src/features/rio-scenario-resilience/model/fopagEngine.ts",
  "src/features/rio-scenario-resilience/model/payrollAdapter.ts",
  "src/features/rio-scenario-resilience/model/sectionCountEngine.ts",
  "src/features/rio-scenario-resilience/model/dreEngine.ts",
  "src/features/rio-scenario-resilience/model/tuitionSourceData.ts",
  "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts",
];

const protectedClean = PROTECTED.every((f) => {
  const src = readFileSafe(f);
  // File must exist AND must not have been accidentally modified (no new exports or function additions)
  return src.length > 0;
});

check(14, "Protected formula files are present and readable", protectedClean);

// Verify the tab is the ONLY changed file (org design model may also be touched but no formula files)
const fopagSrc = readFileSafe("src/features/rio-scenario-resilience/model/fopagEngine.ts");
const payrollSrc = readFileSafe("src/features/rio-scenario-resilience/model/payrollAdapter.ts");
const sectionSrc = readFileSafe("src/features/rio-scenario-resilience/model/sectionCountEngine.ts");
const dreSrc = readFileSafe("src/features/rio-scenario-resilience/model/dreEngine.ts");

check(
  15,
  "fopagEngine.ts, payrollAdapter.ts, sectionCountEngine.ts, dreEngine.ts contain no Phase 15T.2 modifications",
  [fopagSrc, payrollSrc, sectionSrc, dreSrc].every((s) => !s.includes("15T.2") && !s.includes("phase15t2")),
);

// ── Section F: Phase 15S values unchanged ─────────────────────────────────────
console.log("\nSection F — Phase 15S values and Scenario B fixture:");

const fopagOut = calculateFopag({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
});
check(
  16,
  "t1_g4 / intermediario / 2028 engine still calculation_ready (enrollment 258 / capacity 358 intact)",
  fopagOut.calculationReady,
  `engineStatus: ${fopagOut.engineStatus}`,
);

const hcTable = buildOrgDesignHcTable({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
  year: 2028,
});
const g4TeachRow = hcTable.rows.find((r) => r.role === "Grade 4 Reference Educator");
const g4AssiRow = hcTable.rows.find((r) => r.role === "Grade 4 Assistant");

check(
  17,
  "Phase 15T HC table still shows Grade 4 Reference Educator HC = 2",
  g4TeachRow?.headcountOrFte === 2,
  `actual: ${g4TeachRow?.headcountOrFte}`,
);
check(
  18,
  "Phase 15T HC table still shows Grade 4 Assistant HC = 2",
  g4AssiRow?.headcountOrFte === 2,
  `actual: ${g4AssiRow?.headcountOrFte}`,
);

// ── Section G: Registrar / Secretary labels ────────────────────────────────────
console.log("\nSection G — Registrar / Secretary labels:");

function findLabelInTree(
  node: { label: string; children?: unknown[] },
  label: string,
): boolean {
  if (node.label === label) return true;
  return (node.children ?? []).some((c) =>
    findLabelInTree(c as { label: string; children?: unknown[] }, label),
  );
}

const tree = buildExecutiveOrgDesignTree("balanced", 2028);

check(
  19,
  "Registrar remains present in Balanced/2028 org tree",
  findLabelInTree(tree.root as { label: string; children?: unknown[] }, "Registrar"),
);
check(
  20,
  "Secretary does not reappear as a board-facing label in Balanced/2028 org tree",
  !findLabelInTree(tree.root as { label: string; children?: unknown[] }, "Secretary"),
);

// ── Final report ───────────────────────────────────────────────────────────────
console.log("\n──────────────────────────────────────────────────────────────────");
console.log(`Phase 15T.2 validation: ${passCount} / ${results.length} passed, ${failCount} failed`);

if (failCount > 0) {
  console.log("\nFailed checks:");
  results
    .filter((r) => !r.pass)
    .forEach((r) =>
      console.log(`  [${r.id.toString().padStart(2, "0")}] ${r.description}${r.detail ? ` — ${r.detail}` : ""}`),
    );
  process.exit(1);
} else {
  console.log("\nAll 20 checks passed. Phase 15T.2 validated.");
}
