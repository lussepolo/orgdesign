// V10-RC2.3 Gate 2 — FROZEN PRE-FIX EVIDENCE. Proves the Grade 6 omission
// defect existed BEFORE the fix, and proves it was a UI-layer/view-model
// omission, not a missing-data problem.
//
// This script was run and captured "ALL CHECKS PASSED" against the pre-fix
// PayrollProjectionTab.tsx (see docs/audits/rio-resilience/
// phase-v10-rc2-3-gate2-grade-range-defect.md for the captured transcript).
// After the Gate 4 fix — which moved and renamed extractEyLsGradeRows() out
// of PayrollProjectionTab.tsx into payrollGradeDetailAdapter.ts — its first
// two checks now correctly FAIL, because the exact pre-fix function
// signature they assert against no longer exists. THAT FLIP IS THE PROOF:
// re-running this script post-fix and seeing checks 1 and 3 fail (while the
// governed-source-exists checks keep passing) is the before/after evidence
// pair for this gate. Do not "fix" this script to pass again — its job is
// to document the pre-fix state, not to be a regression gate. The current,
// post-fix behavior is asserted by validate:v10-rc2-3-gate6 and
// validate:v10-rc2-3-gate6a instead.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";

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

const payrollSrc = readFileSync(join(ROOT, "src/components/sections/PayrollProjectionTab.tsx"), "utf8");

// ── Claim A: the current grade extraction function structurally excludes MS/HS ──
const extractFnMatch = /function extractEyLsGradeRows\(hcRows: OrgDesignHcTableRow\[\]\): GradeDetailRow\[\] \{[\s\S]*?\n\}/.exec(payrollSrc);
check(
  "extractEyLsGradeRows() exists and hard-filters to Early Years / Lower School only (pre-fix defect signature)",
  Boolean(extractFnMatch) && /divisionArea !== "Early Years" && row.divisionArea !== "Lower School"/.test(extractFnMatch?.[0] ?? ""),
);

// ── Claim B: this means Grade 6 never renders in the grade table, for EITHER package ──
// (proves the defect is package-independent — a hard exclusion, not a filter bug specific to t1_g6)
const hcT1G6 = buildOrgDesignHcTable({ openingPackageId: "t1_g6", occupancyScenarioId: "base", orgDesignOptionId: "balanced_experience", year: 2028 });
const msRowsExistInHcTable = hcT1G6.rows.some((r) => r.divisionArea === "Middle School");
check(
  "buildOrgDesignHcTable DOES return Middle School rows for t1_g6/2028 (data is present at the adapter level)",
  msRowsExistInHcTable,
);
check(
  "...but extractEyLsGradeRows()'s own filter would discard them (division !== Early Years/Lower School) — this is the exact defect",
  /if \(row\.divisionArea !== "Early Years" && row\.divisionArea !== "Lower School"\) continue;/.test(payrollSrc),
);

// ── Claim C: the MS row group is a single division-wide aggregate, never grade-specific ──
// (proves buildOrgDesignHcTable has no per-grade MS breakdown — Gate 5's "does not provide a
// source-backed Grade-6-specific educator value" disposition is a real model boundary, not neglect)
const msRoleGroups = new Set(hcT1G6.rows.filter((r) => r.divisionArea === "Middle School").map((r) => r.roleGroupOrHub));
check(
  "Middle School rows collapse into ONE roleGroupOrHub (\"Middle School Teaching Team\"), never a per-grade group",
  msRoleGroups.size === 1 && msRoleGroups.has("Middle School Teaching Team"),
  `roleGroupOrHub values found: ${[...msRoleGroups].join(", ")}`,
);

// ── Claim D: governed per-grade G6 enrollment/section source data EXISTS and is non-null
// for 2028 under every active captação scenario — proving Grade 6 coverage is a real,
// available, governed value, not an unavailable/blocked one. ──────────────────────────
for (const scenarioId of ["conservador", "base", "otimista"] as const) {
  const enrollmentRecord = GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.find(
    (r) => r.normalizedGradeId === "G6" && r.scenarioId === scenarioId && r.year === 2028,
  );
  check(
    `governed T1-G6 Grade 6 enrollment exists and is non-null for 2028/${scenarioId}`,
    enrollmentRecord !== undefined && enrollmentRecord.enrollment !== null,
    `record=${JSON.stringify(enrollmentRecord)}`,
  );
}
const capacityRecord = GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.find(
  (r) => r.packageId === "t1_g6" && r.normalizedGradeId === "G6" && r.year === 2028,
);
check(
  "governed T1-G6 Grade 6 capacity/section record exists, is active (sections=2) for 2028",
  capacityRecord !== undefined && capacityRecord.sections === 2,
  `record=${JSON.stringify(capacityRecord)}`,
);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED — defect confirmed structural (extraction-layer exclusion) and governed source data confirmed present.`
    : `\n${failures} CHECK(S) FAILED — see above.`,
);
process.exit(failures === 0 ? 0 : 1);
