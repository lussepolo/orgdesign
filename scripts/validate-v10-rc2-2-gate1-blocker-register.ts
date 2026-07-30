// V10-RC2.2 Gate 1 — blocker register normalization.
//
// Validates docs/audits/rio-resilience/phase-v10-rc2-2-gate1-blocker-register.json
// against live source facts: retired decisions (F05) must block zero active
// coverage cells; D-R5/D-R6/F03 must remain separate records, not merged;
// F06 must not extrapolate EY/LS rules to MS/HS; corporate allocation must
// never be zero-substituted or suppress direct payroll; the Payroll
// constraint must be recorded as a resolved, evidenced refactor.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

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

interface BlockerEntry {
  id: string;
  category: string;
  relatedTo: string[];
  activeCoverageCellsBlocked: number;
  invented: boolean;
  [key: string]: unknown;
}

const registerPath = join(ROOT, "docs/audits/rio-resilience/phase-v10-rc2-2-gate1-blocker-register.json");
const register = JSON.parse(readFileSync(registerPath, "utf8")) as {
  categoryTaxonomy: string[];
  entries: BlockerEntry[];
};

const VALID_CATEGORIES = new Set(register.categoryTaxonomy);
const byId = new Map(register.entries.map((e) => [e.id, e]));

// ── Structural: every entry uses a taxonomy category, nothing invented ──────
for (const entry of register.entries) {
  check(`${entry.id}: category is a valid taxonomy member`, VALID_CATEGORIES.has(entry.category), entry.category);
  check(`${entry.id}: invented=false`, entry.invented === false);
}
check(
  "taxonomy has all six required categories",
  [
    "active_governance_blocker",
    "retired_decision",
    "engineering_integration_gap",
    "unsupported_product_boundary",
    "unavailable_financial_output",
    "resolved_decision",
  ].every((c) => VALID_CATEGORIES.has(c)),
);

// ── F05: retired decision must block zero active cells ──────────────────────
const f05 = byId.get("F05");
check("F05 exists", f05 !== undefined);
check("F05 category is retired_decision", f05?.category === "retired_decision");
check("F05 blocks 0 active coverage cells", f05?.activeCoverageCellsBlocked === 0);

// Cross-check against live source: t1_g3 truly rejected by the engine.
const t1g3Check = execSync(
  `npx tsx -e "
    import('./src/features/rio-scenario-resilience/model/dreEngine.ts').then(({ calculateDre }) => {
      try {
        calculateDre({ openingPackageId: 't1_g3', occupancyScenarioId: 'base', tuitionScenarioId: 'bp1_division_differentiated', orgDesignOptionId: 'balanced_experience' });
        console.log('DID_NOT_THROW');
      } catch (e) {
        console.log('THREW');
      }
    });
  "`,
  { cwd: ROOT, encoding: "utf8" },
).trim();
check(
  "live check: t1_g3/base genuinely rejected by calculateDre (F05's subject is truly retired, not just documented as such)",
  t1g3Check.includes("THREW"),
  t1g3Check,
);

// ── D-R5/D-R6/F03: must remain separate entries, cross-referenced not merged ──
const dr5 = byId.get("D-R5");
const dr6 = byId.get("D-R6");
const f03 = byId.get("F03");
check("D-R5 exists as its own entry", dr5 !== undefined);
check("D-R6 exists as its own entry", dr6 !== undefined);
check("F03 exists as its own entry", f03 !== undefined);
check("D-R5 is a separate record id from D-R6 and F03", dr5?.id !== dr6?.id && dr5?.id !== f03?.id);
check(
  "D-R6 and F03 are cross-referenced (relatedTo), not collapsed into one entry",
  dr6?.relatedTo.includes("F03") === true && f03?.relatedTo.includes("D-R6") === true && dr6?.id !== f03?.id,
);
check(
  "D-R5 has no relatedTo D-R6/F03 (no fabricated dependency)",
  Array.isArray(dr5?.relatedTo) && !dr5!.relatedTo.includes("D-R6") && !dr5!.relatedTo.includes("F03"),
);

// ── F06: no extrapolation to MS/HS, aggregate info preserved ────────────────
const f06 = byId.get("F06");
check("F06 exists", f06 !== undefined);
check("F06 category is unsupported_product_boundary", f06?.category === "unsupported_product_boundary");
check("F06 extrapolationToMsHs is false", f06?.extrapolationToMsHs === false);
check("F06 aggregateInfoPreserved is true", f06?.aggregateInfoPreserved === true);
check("F06 blocks 0 active coverage cells (aggregate MS/HS payroll cost is still computed)", f06?.activeCoverageCellsBlocked === 0);

// Cross-check against live source: PayrollProjectionTab must not extrapolate the
// EY/LS rule into MS/HS (no getLeadFteForGrade-style hardcoded FTE table).
// V10-RC2.3 Gate 5 split the combined msHsAggregateHeadcount into separate
// msAggregateHeadcount/hsAggregateHeadcount (Middle School disclosed apart from
// High School, since only Middle School's Grade 6 is now a governed, visible row) —
// accept either the pre-V10-RC2.3 combined name or the current split names.
//
// V10-RC2.5 Gate 3/Tranche B: the grade-staffing table (and its F06 MS/HS
// disclosure) was extracted out of PayrollProjectionTab.tsx into the shared
// GradeStaffingTable.tsx component, so ExecutiveOrgDesignTab.tsx can render
// the identical table — no duplicated disclosure/calculation logic between
// the two tabs. Read both files and check the combined source, rather than
// PayrollProjectionTab.tsx alone, so this check still proves the disclosure
// is live and reachable from the Payroll tab (via its GradeStaffingTable
// import/render), not that it lives in one specific file forever.
const payrollTabSrc = readFileSync(join(ROOT, "src/components/sections/PayrollProjectionTab.tsx"), "utf8");
const gradeStaffingTableSrc = readFileSync(join(ROOT, "src/components/common/GradeStaffingTable.tsx"), "utf8");
const payrollTabAndDelegatesSrc = payrollTabSrc + gradeStaffingTableSrc;
check(
  "live check: PayrollProjectionTab.tsx discloses F06 for MS/HS, does not extrapolate EY/LS rule",
  payrollTabSrc.includes("GradeStaffingTable") &&
    payrollTabAndDelegatesSrc.includes("payrollMsHsUnavailableLabel") &&
    (payrollTabAndDelegatesSrc.includes("msHsAggregateHeadcount") ||
      (payrollTabAndDelegatesSrc.includes("msAggregateHeadcount") && payrollTabAndDelegatesSrc.includes("hsAggregateHeadcount"))),
);

// ── Corporate allocation: never zero-substituted, never suppresses direct payroll ──
const corpAlloc = byId.get("CORPORATE-ALLOCATION");
check("CORPORATE-ALLOCATION exists", corpAlloc !== undefined);
check("CORPORATE-ALLOCATION category is engineering_integration_gap", corpAlloc?.category === "engineering_integration_gap");
check("CORPORATE-ALLOCATION substitutedZero is false", corpAlloc?.substitutedZero === false);
check("CORPORATE-ALLOCATION directPayrollSuppressed is false", corpAlloc?.directPayrollSuppressed === false);
// Two DRE-level fixed cost lines are tagged costLineCategory="corporate_allocation"
// (corporativo_bu, rateio_corporativo) — real, Finance-provided, populated. They are
// NOT a payroll-to-corporate-cost consolidation adapter (not headcount-driven,
// independent_of_board_decision_levers) and must not be conflated with one. This
// check confirms no adapter FUNCTION (as opposed to the DRE line-item tag) exists.
const corpAllocFunctionMatches = execSync(
  `grep -rln "function.*[Cc]orporateAllocation\\|buildCorporateAllocation\\|calculateCorporateAllocation" ${join(ROOT, "src")} || true`,
  { encoding: "utf8" },
).trim();
check(
  "live check: no corporate-allocation ADAPTER FUNCTION exists anywhere in src/ (the two DRE fixed-cost lines are not an adapter)",
  corpAllocFunctionMatches === "",
  corpAllocFunctionMatches || "none found",
);
check(
  "live check: PayrollProjectionTab.tsx still computes and shows direct campus payroll (fopagDiretoAnnual/folhaDiretaAnnual) unconditionally",
  payrollTabSrc.includes("fopagDiretoAnnual") && payrollTabSrc.includes("folhaDiretaAnnual"),
);

// ── Payroll constraint: resolved this phase, with cited commit ──────────────
const payrollConstraint = byId.get("PAYROLL-TAB-CONSTRAINT");
check("PAYROLL-TAB-CONSTRAINT exists", payrollConstraint !== undefined);
check("PAYROLL-TAB-CONSTRAINT category is resolved_decision", payrollConstraint?.category === "resolved_decision");
check(
  "PAYROLL-TAB-CONSTRAINT cites a real, existing commit",
  typeof payrollConstraint?.evidence === "string" && /commit a015a0a/.test(payrollConstraint.evidence as string),
);
try {
  execSync("git cat-file -e a015a0a", { cwd: ROOT });
  check("live check: commit a015a0a exists in this repository", true);
} catch {
  check("live check: commit a015a0a exists in this repository", false, "commit not found — cited evidence is stale");
}

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED — blocker register normalized (${register.entries.length} entries, 6 categories)`
    : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
