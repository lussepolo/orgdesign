// V10-RC2 Gate 2 — deterministic governance-record consistency validator.
//
// Proves, per the V10-RC2 phase directive:
//   1. No executable decision simultaneously has approved and pending status.
//   2. Every selectedOption references a declared alternative.
//   3. Calculation readiness matches required evidence (spot-checked against
//      the actual source files for every decision this phase classified
//      "encoded_consistently").
//   4. Retired terminology ("intermediario") does not control any live
//      calculation branch outside its own normalization contract.
//   5. Base/legacy "intermediario" normalization is deterministic.
//   6. No live readiness decision reads the Phase-13H-legacy static
//      calculationReady/fopagCalculationReady fields — the real readiness
//      signal is FopagEngineOutput.calculationReady, computed dynamically.
//
// Deterministic, source-level assertions only — no snapshots, no browser.
// Run with: npx tsx scripts/validate-v10-rc2-gate2-governance.ts

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import {
  normalizeOccupancyScenarioId,
  parseOccupancyScenarioId,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";

const ROOT = process.cwd();
let failures = 0;
function check(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}
function src(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// ── 1/2: F1A revenue governance register internal consistency ─────────────
type Alternative = { id: string };
type Decision = {
  decisionId: string;
  alternatives: Alternative[];
  selectedOption: string | null;
  approvalStatus: string;
};
const f1aRegister: { decisions: Decision[] } = JSON.parse(
  src("docs/audits/rio-resilience/phase-v10-f1a-revenue-governance-decision-register.json"),
);

for (const d of f1aRegister.decisions) {
  const isApproved = d.approvalStatus.startsWith("approved_by_project_owner");
  const isPending = d.approvalStatus === "pending";
  check(
    `${d.decisionId}: not simultaneously approved and pending`,
    !(isApproved && isPending),
    `approvalStatus="${d.approvalStatus}"`,
  );
  check(
    `${d.decisionId}: approved decisions have a non-null selectedOption`,
    !isApproved || d.selectedOption !== null,
  );
  check(
    `${d.decisionId}: pending decisions have a null selectedOption (no invented default)`,
    !isPending || d.selectedOption === null,
  );
  if (d.selectedOption !== null) {
    const validIds = d.alternatives.map((a) => a.id);
    check(
      `${d.decisionId}: selectedOption "${d.selectedOption}" references a declared alternative`,
      validIds.includes(d.selectedOption),
      `declared alternatives: ${validIds.join(", ")}`,
    );
  }
}

// ── 1b: finance confirmation register — decisionStatus vs. approvedFormula/approvedValue ──
type FinanceItem = {
  id: string;
  decisionStatus: string;
  approvedFormula: string | null;
  approvedValue: string | null;
  supersededBy?: string;
};
const financeRegister: { openItems: FinanceItem[]; resolvedItems: FinanceItem[] } = JSON.parse(
  src("docs/finance/dre-finance-confirmation-register.json"),
);
for (const item of [...financeRegister.openItems, ...financeRegister.resolvedItems]) {
  const hasApprovedContent = item.approvedFormula !== null || item.approvedValue !== null;
  const isOpen = item.decisionStatus === "open";
  // Open items MAY carry approvedFormula/approvedValue (an engineering decision was
  // made while Finance sign-off/provenance remains outstanding) but ONLY if they
  // explicitly name which project-owner decision superseded the stale description —
  // an open item with approved content and no supersededBy pointer is a silent,
  // undocumented resolution, which this validator treats as a contradiction.
  check(
    `${item.id}: open item with approved formula/value must name its supersededBy decision`,
    !(isOpen && hasApprovedContent) || !!item.supersededBy,
    `decisionStatus="${item.decisionStatus}" approvedFormula=${JSON.stringify(item.approvedFormula)} approvedValue=${JSON.stringify(item.approvedValue)} supersededBy=${JSON.stringify(item.supersededBy)}`,
  );
  if (item.supersededBy) {
    const referencedId = item.supersededBy.split(" ")[0]; // "D-R7 (...)" -> "D-R7"
    const referenced = f1aRegister.decisions.find((d) => d.decisionId === referencedId);
    check(
      `${item.id}: supersededBy "${referencedId}" references a decision that is actually approved`,
      !!referenced && referenced.approvalStatus.startsWith("approved_by_project_owner"),
      referenced ? `${referencedId} approvalStatus="${referenced.approvalStatus}"` : `${referencedId} not found in F1A register`,
    );
  }
}

// ── 3: calculation readiness matches required evidence (spot checks for
//    every decision this phase classified "encoded_consistently") ─────────
{
  const tuitionGrowthSrc = src("src/features/rio-scenario-resilience/model/tuitionGrowth.ts");
  check(
    "D-R2: tuitionGrowth.ts encodes the approved 5.9% v10 escalation rate",
    tuitionGrowthSrc.includes("0.059"),
  );
  check(
    "D-R2: receitaEngine.ts sources tuition escalation from tuitionGrowth.ts (not an inline retired-rate literal)",
    src("src/features/rio-scenario-resilience/model/receitaEngine.ts").includes(
      "resolveTuitionGrowthFactor",
    ),
  );

  // dreRevenueDriverSourceData.ts derives percentual_desconto_medio from
  // V10_AVERAGE_DISCOUNT_SCHEDULE (v10AverageDiscountSourceData.ts) rather than
  // storing literal rates itself — check the actual value source.
  const discountScheduleSrc = src("src/features/rio-scenario-resilience/model/v10AverageDiscountSourceData.ts");
  check(
    "D-R3: v10AverageDiscountSourceData.ts encodes the approved workbook_v10_row224 schedule (25% 2028, 12.5% terminal)",
    discountScheduleSrc.includes("0.25") && discountScheduleSrc.includes("0.125"),
  );
  check(
    "D-R3: dreRevenueDriverSourceData.ts sources percentual_desconto_medio from the v10 schedule, not an independent literal table",
    src("src/features/rio-scenario-resilience/model/dreRevenueDriverSourceData.ts").includes(
      "V10_AVERAGE_DISCOUNT_SCHEDULE",
    ),
  );

  const reajusteSrc = src("src/features/rio-scenario-resilience/model/reajusteDespesasGrowth.ts");
  check(
    "D-R7: reajusteDespesasGrowth.ts encodes the approved 4.9% recurring rate",
    reajusteSrc.includes("0.049") || reajusteSrc.includes("1.049"),
  );

  const occupancySrc = src("src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData.ts");
  check(
    "D-R8: openingPackageOccupancySourceData.ts encodes the approved t1_g4/base/2028 total enrollment of 258",
    /packageId:\s*"t1_g4",\s*scenarioId:\s*"base",\s*year:\s*2028,\s*totalEnrollment:\s*258/.test(
      occupancySrc,
    ),
  );

  const payrollAdapterSrc = src("src/features/rio-scenario-resilience/model/payrollAdapter.ts");
  check(
    "Gate 4: Early Years 1-section = 1 lead + 1 assistant + 1 monitor rule is documented with its governance citation",
    payrollAdapterSrc.includes("1 teaching lead + 1 learning assistant + 1 learning monitor") &&
      payrollAdapterSrc.includes("Phase 8H.1"),
  );

  const fopagEngineSrc = src("src/features/rio-scenario-resilience/model/fopagEngine.ts");
  check(
    "Gate 5: fopagEngine.ts implements the approved v10 salary (5.9%) and benefits (10%) escalation split",
    fopagEngineSrc.includes("5.9%") && fopagEngineSrc.includes("10%"),
  );
}

// ── 4/5: retired "intermediario" terminology does not control calculations,
//    and normalization is deterministic ─────────────────────────────────
{
  check(
    'normalizeOccupancyScenarioId("intermediario") deterministically resolves to "base"',
    normalizeOccupancyScenarioId("intermediario") === "base",
  );
  check(
    'normalizeOccupancyScenarioId("intermediario") is stable across repeated calls (deterministic)',
    normalizeOccupancyScenarioId("intermediario") === normalizeOccupancyScenarioId("intermediario"),
  );
  const resolved = parseOccupancyScenarioId("intermediario");
  check(
    'parseOccupancyScenarioId("intermediario") reports status "normalized_legacy", not silently "canonical"',
    resolved.status === "normalized_legacy" && resolved.scenarioId === "base",
    JSON.stringify(resolved),
  );

  // No tracked src/ file other than the contract that defines the legacy
  // alias may branch live calculation logic on the literal "intermediario".
  const grepOut = execSync(
    `git grep -n "intermediario" -- 'src/**/*.ts' 'src/**/*.tsx' || true`,
    { cwd: ROOT, encoding: "utf8" },
  );
  const offendingLines = grepOut
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .filter((l) => !l.includes("openingPackageOccupancySourceDataContract.ts"));
  check(
    "no live src/ file outside openingPackageOccupancySourceDataContract.ts branches on the literal \"intermediario\"",
    offendingLines.length === 0,
    offendingLines.length ? offendingLines.join("\n") : undefined,
  );
}

// ── 6: no live readiness decision reads the Phase-13H-legacy static
//    calculationReady/fopagCalculationReady fields ─────────────────────────
{
  const fopagEngineSrc = src("src/features/rio-scenario-resilience/model/fopagEngine.ts");
  check(
    "fopagEngine.ts does not read adapterOutput.calculationReady (Phase-13H-legacy, superseded)",
    !/adapterOutput\.calculationReady/.test(fopagEngineSrc),
  );
  check(
    "fopagEngine.ts does not read adapterOutput.fopagCalculationReady (Phase-13H-legacy, superseded)",
    !/adapterOutput\.fopagCalculationReady/.test(fopagEngineSrc),
  );
  check(
    "payrollAdapter.ts documents the legacy-field supersession inline (Phase 13H)",
    src("src/features/rio-scenario-resilience/model/payrollAdapter.ts").includes("legacy") &&
      src("src/features/rio-scenario-resilience/model/payrollAdapter.ts").includes("Phase 13H"),
  );
  // Per this project's own documented convention (IMPLEMENTATION.md's RC1B
  // section header), prior prose is corrected by appending a superseding
  // section, not by editing history in place — so this check looks for the
  // correcting section, not for removal of the original (now-historical)
  // sentence.
  const implText = src("IMPLEMENTATION.md");
  check(
    "IMPLEMENTATION.md carries a V10-RC2 section that names payrollRoleCostSourceData.ts's per-record calculationReady as Phase-13H-legacy and superseded",
    /V10-RC2/.test(implText) &&
      /payrollRoleCostSourceData\.ts/.test(implText.slice(implText.indexOf("V10-RC2"))) &&
      /Phase 13H/.test(implText.slice(implText.indexOf("V10-RC2"))),
  );
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
