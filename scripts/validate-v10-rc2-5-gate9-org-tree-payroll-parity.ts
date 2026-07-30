// V10-RC2.5 Gate 9 — Executive Org Design tree / live payroll engine parity.
//
// Context (2026-07-30, same session as the Counselor, HS ramp, After School,
// and hs_pool corrections): the Executive Org Design tab renders two things
// from two different data pathways on the same page. The org-chart tree
// (buildExecutiveOrgDesignTree() in executiveOrgDesignModel.ts) reads
// LEADERSHIP_CONFIG/BACKOFFICE_CONFIG/SPECIALISTS_CONFIG directly, via
// getExistingRoleHeadcount() — it never calls calculateFopag() or touches
// payrollAdapter.ts/payrollRoleCostSourceData.ts. The Role-Level Headcount
// table on the same page (buildOrgDesignHcTable()) calls calculateFopag(),
// the full adapter pipeline, reading payrollRoleCostSourceData.ts. This is
// the same Layer-1-vs-Layer-2 duplication class this session's other
// corrections addressed (leadership.ts vs payrollRoleCostSourceData.ts),
// now confirmed live in the UI rather than only in documentation strings —
// and it was previously completely unguarded: nothing asserted the tree and
// the engine agree.
//
// Design: rather than hardcoding a second, hand-maintained list of which
// tree nodes map to which payroll roleId (exactly the parallel-list pattern
// that caused the Counselor/After School bugs), executiveOrgDesignModel.ts
// was extended so getExistingRoleHeadcount() tags every node it produces
// with payrollRoleId. This script walks the real tree output, collects
// every payrollRoleId-tagged node, and compares its headcountValue against
// calculateFopag()'s live record for that exact roleId/year — a purely
// mechanical, self-updating check. If a future change adds, removes, or
// renames an existing-role node in the tree, this validator picks it up
// automatically; nothing here needs to be told about individual roles.
//
// Deliberately NOT covered: the EY/LS/HS Counselor nodes (getCounselorHeadcount/
// getHsCounselorHeadcount, hardcoded to 1, intentionally not payroll-wired —
// see orgDesignLogic.md) and the MS Counselor / unresolved-allocation nodes
// (getEstablishedCounselorIncrementHeadcount/getUnresolvedCounselorIncrementHeadcount,
// a derived increment, not a direct role.headcount[year] read) — none of
// these set payrollRoleId, by design, so they are correctly excluded by
// construction rather than by an exclusion list in this script.

import {
  buildExecutiveOrgDesignTree,
  EXECUTIVE_ORG_SCENARIOS,
  EXECUTIVE_ORG_YEARS,
  ORG_DESIGN_SCENARIO_OPTION_BY_ID,
  type OrgTreeNode,
  type ExecutiveOrgYear,
} from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";

const OCCUPANCY_SCENARIO_ID = "base" as const;
// Baseline non-teaching roles (Leadership/Backoffice/Specialists) do not
// vary by openingPackageId — verified by reading payrollAdapter.ts section 1
// (resolveHeadcount only takes headcountProgression/year/yearApplicability,
// no package argument) before writing this check. Both packages are
// exercised anyway, as a belt-and-suspenders proof of that independence,
// not merely an assumption.
const OPENING_PACKAGE_IDS = ["t1_g4", "t1_g6"] as const;

let checksRun = 0;
let failures = 0;

function check(id: number, description: string, pass: boolean, detail?: string): void {
  checksRun++;
  if (!pass) failures++;
  const status = pass ? "PASS" : "FAIL";
  console.log(`${status}  [${id}] ${description}${detail ? ` — ${detail}` : ""}`);
}

function collectPayrollTaggedNodes(node: OrgTreeNode, out: OrgTreeNode[]): void {
  if (typeof node.payrollRoleId === "string") out.push(node);
  if (node.children) {
    for (const child of node.children) collectPayrollTaggedNodes(child, out);
  }
}

let comparisonsMade = 0;
let mismatchDetails: string[] = [];
let missingEngineRecordDetails: string[] = [];

for (const scenarioOption of EXECUTIVE_ORG_SCENARIOS) {
  const scenario = scenarioOption.id;
  const orgDesignOptionId = ORG_DESIGN_SCENARIO_OPTION_BY_ID[scenario];

  for (const yearOption of EXECUTIVE_ORG_YEARS) {
    const year: ExecutiveOrgYear = yearOption.year;
    const tree = buildExecutiveOrgDesignTree(scenario, year);
    const taggedNodes: OrgTreeNode[] = [];
    collectPayrollTaggedNodes(tree.root, taggedNodes);

    for (const openingPackageId of OPENING_PACKAGE_IDS) {
      const fopagOutput = calculateFopag({
        openingPackageId,
        occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
        orgDesignOptionId,
      });

      for (const node of taggedNodes) {
        const record = fopagOutput.records.find(
          (r) => r.roleId === node.payrollRoleId && r.year === year,
        );
        comparisonsMade++;

        if (!record) {
          missingEngineRecordDetails.push(
            `${node.payrollRoleId} (node ${node.id}) year=${year} scenario=${scenario} package=${openingPackageId}: no calculateFopag() record found`,
          );
          continue;
        }

        if (node.headcountValue !== record.headcountOrFte) {
          mismatchDetails.push(
            `${node.payrollRoleId} (node ${node.id}) year=${year} scenario=${scenario} package=${openingPackageId}: ` +
              `tree=${node.headcountValue}, engine=${record.headcountOrFte}`,
          );
        }
      }
    }
  }
}

check(
  1,
  "Every payrollRoleId-tagged Executive Org Design tree node has a matching calculateFopag() record for its year (no orphaned role reference)",
  missingEngineRecordDetails.length === 0,
  missingEngineRecordDetails.length === 0
    ? `${comparisonsMade} comparisons, all resolved`
    : `${missingEngineRecordDetails.length} unresolved: ${missingEngineRecordDetails.slice(0, 5).join("; ")}`,
);

check(
  2,
  "Every payrollRoleId-tagged Executive Org Design tree node's headcountValue equals calculateFopag()'s live headcountOrFte for the same role/year, across all 3 scenarios, all 10 years, both opening packages",
  mismatchDetails.length === 0,
  mismatchDetails.length === 0
    ? `${comparisonsMade} comparisons, 0 mismatches`
    : `${mismatchDetails.length}/${comparisonsMade} mismatches: ${mismatchDetails.slice(0, 5).join("; ")}`,
);

// Sanity floor: if a future refactor stops tagging nodes with payrollRoleId
// entirely (e.g. someone removes the field or the tagging call), the two
// checks above would trivially "pass" with zero comparisons. Guard against
// that silent-pass failure mode directly.
const EXPECTED_MIN_COMPARISONS = 3 /* scenarios */ * 10 /* years */ * 2 /* packages */ * 15 /* conservative floor on tagged roles per tree */;
check(
  3,
  `At least ${EXPECTED_MIN_COMPARISONS} tree-vs-engine comparisons were actually made (guards against a silent zero-comparison pass if payrollRoleId tagging is ever removed)`,
  comparisonsMade >= EXPECTED_MIN_COMPARISONS,
  `${comparisonsMade} comparisons made`,
);

console.log(
  failures === 0
    ? `\n✓ Org Design tree / payroll engine parity: ${checksRun}/${checksRun} pass (${comparisonsMade} node-level comparisons)`
    : `\n✗ Org Design tree / payroll engine parity: ${checksRun - failures}/${checksRun} pass, ${failures} fail`,
);
process.exit(failures === 0 ? 0 : 1);
