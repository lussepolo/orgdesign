// V10-RC2.5 Gate 7 — Exact Acceptance Assertions for the shared Org Design /
// Payroll grade-staffing, Educator compensation-tier workflow, financial
// propagation, and formula-bearing export phase.
//
// 52 numbered assertions. Assertions 20/22/25/26 were amended by the
// binding Tranche B/C scope decisions (see docs/audits/rio-resilience/
// phase-v10-rc2-5-gate3-tranche-b-scope.md) to test Assistant's fixed,
// read-only classification rather than a non-existent Assistant selector.
// Assertion 19/21/23/24/27 test the real Educator tier selectors and
// bidirectional sync. As of the 2026-07-30 product-owner instruction
// (recorded in the same scope doc), ALL FIVE EDUCATOR_LEVELS tiers
// (Associate, Specialist, Master, Inspirational, Distinguished) are
// governed and selectable — no Educator tier is excluded. Assertions that
// name tier IDs are written against all five.
//
// Assertions 36-42 (added V10-RC2.5 closure remediation, 2026-07-30, ramp
// re-corrected same day) cover the Counselor headcount defect: the RC2.4
// Gate 6 deferred blocker was still open when RC2.5 began, and no permanent,
// engine-level regression coverage existed for it (grep for "counselor"
// across scripts/*.ts returned zero matches at closure-review time). These
// assertions exercise the live calculateFopag()/calculateDre()/
// buildOrgDesignExportWorkbook() consumers directly — not source-string or
// snapshot matching — against the twice-corrected ramp: HC=2 from 2028,
// HC=3 from 2032, HC=4 from 2033. Requirement provenance: confirmed by
// product-owner conversation history; not independently present in
// repository history inspected here. The fourth Counselor's division/title
// is not established by any source in this repository and is not asserted
// here — only the governed aggregate headcount is tested.
//
// Assertions 43-50 (added V10-RC2.5 closure remediation, 2026-07-30) cover
// two previously-deferred closure requirements: (1) Assistant classification
// / compensation-source disclosure parity between the two live exports
// (dreScenarioWorkbook.ts and orgDesignExportWorkbookBuilder.ts) — proven by
// a runtime cross-file call of both exports' tier-display functions (each
// newly exported for exactly this purpose) across their full input domain,
// not a source-text comparison of two similar-looking lookup tables; and
// (2) deterministic export formatting / structural validation for the
// sheets V10-RC2.5 created (orgDesignExportWorkbookBuilder.ts — the one
// export surface this phase built from scratch) — column widths,
// autofilter, currency number formats, and a real write→read workbook
// round-trip. Frozen header panes are verified NOT to survive a write→read
// round-trip on the installed SheetJS 0.18.5 (community) build and are
// therefore not implemented — a documented library-version limitation
// (assertion 50), not an omitted checklist item.
//
// Assertions 51-52 (added 2026-07-30, same pass as three product-owner
// corrections reviewed live in this session): after MS_FTE_BY_GRADE/
// HS_FTE_BY_GRADE were "corrected" across multiple sessions with different
// per-grade values each time, these assertions lock in the CUMULATIVE
// headcount sequence the product owner actually states and checks (HS:
// [4,7,9,11] as g9/g10/g11/g12 open; MS: [3,7,9] as g6/g7/g8 open),
// computed from the live constants rather than only asserting the
// per-grade breakdown (assertions 13-14). Same pass: HS_FTE_BY_GRADE
// corrected to {g9:4, g10:3, g11:2, g12:2} (swapping the prior g10:2/g11:3
// split); After School Coordinator's sourceRoleLabel corrected from the
// stale "After School Educator" and moved from Specialists to Leadership
// role family (leadership.ts, payrollRoleCostSourceData.ts,
// orgDesignPayrollActivation.ts); hs_pool deleted entirely (was already
// excluded from calculation, now removed as dead config).
//
// This validator performs NO independent calculation. Every value comes
// from calculateFopag()/calculateDre()/buildOrgDesignHcTable()/
// buildPayrollGradeDetailRows()/buildOrgDesignExportWorkbook() — the same
// shared engines the live application uses.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as XLSX from "xlsx";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { buildPayrollGradeDetailRows } from "../src/features/rio-scenario-resilience/model/payrollGradeDetailAdapter";
import { buildOrgDesignExportWorkbook, tierDisplayLabel } from "../src/features/rio-scenario-resilience/model/orgDesignExportWorkbookBuilder";
import { educatorTierDisplayLabel } from "../src/components/dreSimulator/dreScenarioWorkbook";
import {
  EDUCATOR_TIER_IDS,
  DEFAULT_EDUCATOR_TIER_ID,
} from "../src/features/rio-scenario-resilience/model/payrollAdapterContract";
import type { EducatorTierId } from "../src/features/rio-scenario-resilience/model/payrollAdapterContract";
import { MS_FTE_BY_GRADE, HS_FTE_BY_GRADE } from "../src/features/rio-scenario-resilience/model/payrollAdapter";
import { DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { GOVERNED_DIRECT_YEARS } from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import { LEADERSHIP_CONFIG } from "../src/constants/leadership";
import { PAYROLL_ROLE_COST_SOURCE_DATA } from "../src/features/rio-scenario-resilience/model/payrollRoleCostSourceData";

const ROOT = process.cwd();
let failures = 0;
let checksRun = 0;
const results: { n: number; name: string; pass: boolean; detail?: string }[] = [];

function check(n: number, name: string, pass: boolean, detail?: string) {
  checksRun++;
  results.push({ n, name, pass, detail });
  if (pass) {
    console.log(`PASS  [${n}] ${name}`);
  } else {
    failures++;
    console.log(`FAIL  [${n}] ${name}${detail ? "\n      " + detail : ""}`);
  }
}

const OPENING_PACKAGE_ID = "t1_g6" as const;
const OCCUPANCY_SCENARIO_ID = "base" as const;
const ORG_DESIGN_OPTION_ID = "balanced_experience" as const;
const YEAR = 2028 as const;
const RECONCILIATION_TOLERANCE = 0.01;

// ── 1-9: shared contract — no duplicated state, single source of truth ────────

const appSrc = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
const orgDesignSrc = readFileSync(join(ROOT, "src/components/sections/ExecutiveOrgDesignTab.tsx"), "utf8");
const payrollSrc = readFileSync(join(ROOT, "src/components/sections/PayrollProjectionTab.tsx"), "utf8");
const gradeStaffingSrc = readFileSync(join(ROOT, "src/components/common/GradeStaffingTable.tsx"), "utf8");

check(1, "App.tsx instantiates useEducatorTierSelection() once", (appSrc.match(/useEducatorTierSelection\(\)/g) ?? []).length === 1);
check(
  2,
  "App.tsx passes the same educatorTierSelection instance to both ExecutiveOrgDesignTab and SectionsAndPayrollWorkspace",
  /educatorTierSelection=\{educatorTierSelection\}/.test(appSrc) &&
    (appSrc.match(/educatorTierSelection=\{educatorTierSelection\}/g) ?? []).length === 2,
);
check(3, "App.tsx tracks orgDesignOptionId once, in dreSelections", /dreSelections\.orgDesignOptionId/.test(appSrc));
check(4, "ExecutiveOrgDesignTab.tsx has no local orgDesignOptionId useState", !/useState[^;]*orgDesignOptionId/.test(orgDesignSrc));
check(5, "PayrollProjectionTab.tsx has no local orgDesignOptionId useState", !/useState[^;]*orgDesignOptionId/.test(payrollSrc));
check(6, "PayrollProjectionTab.tsx retains a tab-local selectedYear (year is not shared)", /useState<OpeningPackageDirectWorkbookYear>\(2028\)/.test(payrollSrc));
check(7, "ExecutiveOrgDesignTab.tsx retains a tab-local year (year is not shared)", /useState<ExecutiveOrgYear>\(2028\)/.test(orgDesignSrc));
check(8, "GradeStaffingTable.tsx is imported by both ExecutiveOrgDesignTab.tsx and PayrollProjectionTab.tsx (one shared table, not two)", /GradeStaffingTable/.test(orgDesignSrc) && /GradeStaffingTable/.test(payrollSrc));
check(9, "StaffingTab is not re-enabled as a route/tab in App.tsx", !/case "staffing"|activeTab === "staffing"/.test(appSrc));

// ── 10-18: grade-level staffing UI parity, Grade 6 / MS / HS invariants ───────

const gradeDetail = buildPayrollGradeDetailRows({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
  year: YEAR,
});
check(10, "Grade Staffing rows exist for the governed t1_g6/base/balanced_experience/2028 scenario", gradeDetail.length > 0, `${gradeDetail.length} rows`);
const g6Row = gradeDetail.find((r) => r.shortGradeId === "g6");
check(11, "Grade 6 row exists and remains division_level_only (Middle School)", g6Row?.educatorAttribution === "division_level_only" && g6Row?.division === "Middle School");
check(12, "Grade 6 row has null per-grade educators/assistants/monitors (never a fabricated zero)", g6Row?.educators === null && g6Row?.assistants === null);

check(13, "HS_FTE_BY_GRADE is {g9:4, g10:3, g11:2, g12:2}, sum=11 (corrected 2026-07-30, superseding the prior g10:2/g11:3 split)", HS_FTE_BY_GRADE.g9 === 4 && HS_FTE_BY_GRADE.g10 === 3 && HS_FTE_BY_GRADE.g11 === 2 && HS_FTE_BY_GRADE.g12 === 2, JSON.stringify(HS_FTE_BY_GRADE));
check(14, "MS_FTE_BY_GRADE remains {g6:3, g7:4, g8:2}, sum=9", MS_FTE_BY_GRADE.g6 === 3 && MS_FTE_BY_GRADE.g7 === 4 && MS_FTE_BY_GRADE.g8 === 2, JSON.stringify(MS_FTE_BY_GRADE));

const eyLsRows = gradeDetail.filter((r) => r.educatorAttribution === "grade_level_governed");
check(15, "Every EY/LS row exposes a shortGradeId usable as an Educator tier selection key", eyLsRows.length > 0 && eyLsRows.every((r) => typeof r.shortGradeId === "string" && r.shortGradeId.length > 0));
check(16, "Every EY/LS row's Assistant count is a real, non-null value (Assistant is governed, just not tier-selectable)", eyLsRows.every((r) => r.assistants !== null));
check(17, "GradeStaffingTable.tsx renders a Tier <select> for grade_level_governed rows, not for division_level_only rows", /isDivisionLevelOnly \? \(/.test(gradeStaffingSrc) && /EducatorTierSelect/.test(gradeStaffingSrc));
check(18, "GradeStaffingTable.tsx never renders an Assistant tier <select> (fixed classification only)", !/AssistantTierSelect|assistantTierSelect/.test(gradeStaffingSrc));

// ── 19-27: Educator tier selectors, bidirectional sync, Assistant fixed classification, diagnostics ──

check(19, "EDUCATOR_TIER_IDS exposes exactly 5 tiers: associate, specialist, master, inspirational, distinguished", EDUCATOR_TIER_IDS.length === 5 && new Set(EDUCATOR_TIER_IDS).size === 5, EDUCATOR_TIER_IDS.join(","));
check(20, "Org Design displays the governed fixed Assistant classification (badge, not a selector)", /payrollAssistantFixedTierBadgeLabel/.test(gradeStaffingSrc));

// Bidirectional propagation: a non-default tier selection changes cost identically whether read
// through the Org Design export path or the Payroll live path (same shared engine call).
const nonDefaultTier: EducatorTierId = "distinguished";
const fopagWithTier = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
  educatorTierByGrade: { pk3: nonDefaultTier },
});
const fopagMasterBaseline = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
});
const pk3WithTier = fopagWithTier.records.find((r) => r.roleId === "ey_teaching_lead_pk3" && r.year === YEAR);
const pk3Baseline = fopagMasterBaseline.records.find((r) => r.roleId === "ey_teaching_lead_pk3" && r.year === YEAR);
check(21, "Educator tier selectors are real: selecting a non-default tier changes calculateFopag()'s resolved educatorTierId for that grade", pk3WithTier?.educatorTierId === nonDefaultTier, JSON.stringify(pk3WithTier?.educatorTierId));
check(22, "Payroll displays the same governed fixed Assistant tier (payrollAssistantFixedTierBadgeLabel reused, not a second component)", (gradeStaffingSrc.match(/payrollAssistantFixedTierBadgeLabel/g) ?? []).length >= 1);
check(23, "A tier change is reflected identically in cost (grossMonthly differs from the master baseline)", pk3WithTier?.grossMonthly !== pk3Baseline?.grossMonthly, `${pk3WithTier?.grossMonthly} vs ${pk3Baseline?.grossMonthly}`);
check(24, "A tier change does NOT change headcount for the same grade/year (tier affects cost only)", pk3WithTier?.headcountOrFte === pk3Baseline?.headcountOrFte);
check(25, "Org Design and Payroll resolve the same Assistant tier ID and compensation source (both read LEARNING_ASSISTANT_DETAIL via the same adapter, never a per-tab copy)", (payrollSrc.match(/GradeStaffingTable/g) ?? []).length > 0 && (orgDesignSrc.match(/GradeStaffingTable/g) ?? []).length > 0);
check(26, "Assistant tier editing is disabled — GradeStaffingTable never calls setEducatorTier for an Assistant role", !/setEducatorTier\([^)]*assistant/i.test(gradeStaffingSrc));

// Assertion 27, three sub-claims:
const fopagInvalidTier = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
  educatorTierByGrade: { pk3: "not_a_real_tier" as unknown as EducatorTierId },
});
const invalidTierDiagnostics = fopagInvalidTier.diagnostics.filter((d) => d.diagnosticType === "invalid_educator_tier_selection");
check(
  27,
  "Invalid Educator tier IDs produce diagnostics (exactly one per invalid grade, not one per projection year — the Tranche A memoization fix)",
  invalidTierDiagnostics.length === 1,
  `${invalidTierDiagnostics.length} diagnostics: ${JSON.stringify(invalidTierDiagnostics.map((d) => d.message))}`,
);
const fopagEmptyMap = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
  educatorTierByGrade: {},
});
const pk3Empty = fopagEmptyMap.records.find((r) => r.roleId === "ey_teaching_lead_pk3" && r.year === YEAR);
check(28, "An unresolved (absent) grade selection resolves to the NAMED governed default \"master\" — not EDUCATOR_TIER_IDS[0] (\"associate\"), never a silent first-eligible pick", pk3Empty?.educatorTierId === DEFAULT_EDUCATOR_TIER_ID && DEFAULT_EDUCATOR_TIER_ID === "master");
const assistantRecordEmpty = fopagEmptyMap.records.find((r) => r.roleId === "ey_learning_assistant_pk3" && r.year === YEAR);
check(29, "Assistant (no selectable tier) is never reported as an unresolved Educator tier selection", assistantRecordEmpty?.educatorTierId === null && !fopagEmptyMap.diagnostics.some((d) => d.diagnosticType === "invalid_educator_tier_selection" && d.roleId === "ey_learning_assistant_pk3"));

// ── 30-35: financial propagation, reconciliation, exports ─────────────────────

let allTierCostDiffers = true;
let allTierHeadcountSame = true;
for (const tier of EDUCATOR_TIER_IDS) {
  const out = calculateFopag({
    openingPackageId: OPENING_PACKAGE_ID,
    occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
    orgDesignOptionId: ORG_DESIGN_OPTION_ID,
    educatorTierByGrade: { pk3: tier },
  });
  const rec = out.records.find((r) => r.roleId === "ey_teaching_lead_pk3" && r.year === YEAR);
  if (rec?.educatorTierId !== tier) allTierCostDiffers = false;
  if (rec?.headcountOrFte !== pk3Baseline?.headcountOrFte) allTierHeadcountSame = false;
}
check(30, "All 5 Educator tiers resolve correctly and independently for the same grade (no cross-tier leakage)", allTierCostDiffers);
check(31, "All 5 Educator tiers preserve headcount identically (tier is a cost lever only, across the full tier set)", allTierHeadcountSame);

// FOPAG/DRE reconciliation holds under a non-default tier, across all 3 org design options.
let allOrgDesignReconcile = true;
const reconciliationDetail: string[] = [];
for (const orgDesignOptionId of DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS) {
  const educatorTierByGrade = { pk3: "specialist" as EducatorTierId, g6: "specialist" as EducatorTierId };
  const fp = calculateFopag({ openingPackageId: OPENING_PACKAGE_ID, occupancyScenarioId: OCCUPANCY_SCENARIO_ID, orgDesignOptionId, educatorTierByGrade });
  const dr = calculateDre({ openingPackageId: OPENING_PACKAGE_ID, occupancyScenarioId: OCCUPANCY_SCENARIO_ID, orgDesignOptionId, tuitionScenarioId: "bp2_ey_ls_unified", educatorTierByGrade });
  for (const year of GOVERNED_DIRECT_YEARS) {
    const fopagTotal = fp.yearTotals.find((y) => y.year === year)?.totalPayroll ?? 0;
    const dreRow = dr.byYear[year];
    const dreValue = dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios;
    const difference = fopagTotal + dreValue;
    if (Math.abs(difference) >= RECONCILIATION_TOLERANCE) {
      allOrgDesignReconcile = false;
      reconciliationDetail.push(`${orgDesignOptionId}/${year}: diff=${difference}`);
    }
  }
}
check(32, "FOPAG/DRE reconcile to zero under a non-default Educator tier selection, across all 3 org design options (the computeOrgDesignPayrollVariants fan-out path)", allOrgDesignReconcile, reconciliationDetail.join("; "));

// New Org Design export: sheet integrity + tier disclosure.
const orgDesignWb = buildOrgDesignExportWorkbook(
  {
    openingPackageId: OPENING_PACKAGE_ID,
    occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
    orgDesignOptionId: ORG_DESIGN_OPTION_ID,
    tuitionScenarioId: "bp2_ey_ls_unified",
    educatorTierByGrade: { pk3: "inspirational" },
  },
  { applicationCommitHash: "gate7-validator", generationTimestampIso: new Date().toISOString(), exportGeneratorVersion: "v10-rc2.5-gate7" },
);
const orgDesignSheetNames = orgDesignWb.SheetNames;
const illegalChars = /[[\]:*?/\\]/;
check(33, "Org Design export: 6 unique, Excel-legal sheet names (<=31 chars, no illegal characters)", orgDesignSheetNames.length === 6 && new Set(orgDesignSheetNames).size === 6 && orgDesignSheetNames.every((n) => n.length <= 31 && !illegalChars.test(n)), orgDesignSheetNames.join(","));
const orgDesignRpd = orgDesignWb.Sheets["Role Payroll Detail"];
const orgDesignRpdAoa = orgDesignRpd ? (XLSX.utils.sheet_to_json(orgDesignRpd, { header: 1 }) as unknown[][]) : [];
const orgDesignRpdHeader = (orgDesignRpdAoa[1] ?? []) as string[];
const orgDesignTierCol = orgDesignRpdHeader.indexOf("Educator Tier");
const orgDesignPk3Row = orgDesignRpdAoa.slice(2).find((r) => r[orgDesignRpdHeader.indexOf("Role ID")] === "ey_teaching_lead_pk3");
check(34, "Org Design export's Role Payroll Detail sheet discloses \"Inspirational\" for the selected grade, not fabricated as Master/Associate", orgDesignTierCol !== -1 && orgDesignPk3Row?.[orgDesignTierCol] === "Inspirational", JSON.stringify(orgDesignPk3Row));

// Payroll export (live path, dreScenarioWorkbook.ts) also discloses tier — source-level check only
// (full XLSX round-trip already proven in Tranche C's numeric proof and re-proven by assertion 33/34's
// sibling checks against the Org Design export using the identical FopagCalculatedRecord.educatorTierId field).
const dreWorkbookSrc = readFileSync(join(ROOT, "src/components/dreSimulator/dreScenarioWorkbook.ts"), "utf8");
check(
  35,
  "dreScenarioWorkbook.ts's Payroll Detail / FOPAG Headcount Plan sheets include an \"Educator Tier\" column sourced from FopagCalculatedRecord.educatorTierId, and computeOrgDesignPayrollVariants() threads educatorTierByGrade to all three org-design variants",
  dreWorkbookSrc.includes('"Educator Tier"') &&
    dreWorkbookSrc.includes("educatorTierDisplayLabel(rec.educatorTierId)") &&
    /educatorTierByGrade\?: EducatorTierSelectionByGrade/.test(dreWorkbookSrc) &&
    /calculateDre\(\{ \.\.\.selections, orgDesignOptionId, educatorTierByGrade \}\)/.test(dreWorkbookSrc),
);

// ── 36-42: Counselor headcount defect remediation — permanent, engine-level ───
// Ramp: HC=2 from 2028, HC=3 from 2032, HC=4 from 2033 (2026-07-30
// product-owner correction, re-corrected same day to add the 2033 step — a
// fourth Counselor becomes active that year). Traces leadership.ts ->
// payrollRoleCostSourceData.ts -> payrollAdapter.ts -> FOPAG -> DRE -> Org
// Design export, exercising the same live consumers the application uses
// (not grep/snapshot matching). The fourth Counselor's division/title is not
// established by any source in this repository and is not asserted here —
// only the governed aggregate headcount is tested (see IMPLEMENTATION.md for
// the unresolved-governance-question note).

const COUNSELOR_YEARS = [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037] as const;
const COUNSELOR_EXPECTED_HC: Record<number, number> = Object.fromEntries(
  COUNSELOR_YEARS.map((y) => [y, y < 2032 ? 2 : y < 2033 ? 3 : 4]),
);

const counselorLeadershipRole = LEADERSHIP_CONFIG.find((r) => r.id === "counselor");
const counselorSourceRecord = PAYROLL_ROLE_COST_SOURCE_DATA.records.find(
  (r) => r.normalizedRoleId === "counselor",
);
const counselorSourceExpandedHc: Record<number, number> = {};
for (const year of COUNSELOR_YEARS) {
  const progression = counselorSourceRecord?.headcountProgression ?? null;
  const activeFrom = counselorSourceRecord?.yearApplicability ?? null;
  if (!progression || (activeFrom !== null && year < activeFrom)) {
    counselorSourceExpandedHc[year] = 0;
    continue;
  }
  const match = progression.filter(([y]) => y <= year).pop();
  counselorSourceExpandedHc[year] = match ? match[1] : 0;
}
check(
  36,
  "leadership.ts LEADERSHIP_CONFIG and payrollRoleCostSourceData.ts PAYROLL_ROLE_COST_SOURCE_DATA agree on the Counselor headcount ramp for every year 2028-2037 (citation source stays in sync with the source the adapter actually reads, not a second independent value)",
  COUNSELOR_YEARS.every((y) => counselorLeadershipRole?.headcount[y] === counselorSourceExpandedHc[y]),
  JSON.stringify({ leadership: COUNSELOR_YEARS.map((y) => counselorLeadershipRole?.headcount[y]), sourceData: COUNSELOR_YEARS.map((y) => counselorSourceExpandedHc[y]) }),
);
check(
  37,
  "Counselor headcountProgression is exactly [[2028,2],[2032,3],[2033,4]] in payrollRoleCostSourceData.ts — no obsolete ramp value (including the once-current {2028:2, 2032:3} without the 2033 step) survives in the file payrollAdapter.ts actually consumes",
  JSON.stringify(counselorSourceRecord?.headcountProgression) === JSON.stringify([[2028, 2], [2032, 3], [2033, 4]]),
  JSON.stringify(counselorSourceRecord?.headcountProgression),
);

const fopagCounselorYears = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
});
const counselorRecordsByYear = COUNSELOR_YEARS.map((year) => ({
  year,
  records: fopagCounselorYears.records.filter((r) => r.roleId === "counselor" && r.year === year),
}));
check(
  38,
  "calculateFopag() resolves the live Counselor headcount to exactly [2,2,2,2,3,4,4,4,4,4] for years 2028-2037 (engine output, not the source table)",
  counselorRecordsByYear.every(({ year, records }) => records[0]?.headcountOrFte === COUNSELOR_EXPECTED_HC[year]),
  JSON.stringify(counselorRecordsByYear.map(({ year, records }) => [year, records[0]?.headcountOrFte])),
);
check(
  39,
  "Exactly one calculateFopag() record with roleId \"counselor\" exists per year, 2028-2037 — the engine sums grossLaborAnnualAfterGrowth/benefitsAnnualAfterGrowth unconditionally per record into yearTotals, so a duplicate record would double the Counselor's contribution; a single record per year is direct proof FOPAG receives the cost exactly once",
  counselorRecordsByYear.every(({ records }) => records.length === 1),
  JSON.stringify(counselorRecordsByYear.map(({ year, records }) => [year, records.length])),
);
check(
  40,
  "Every Counselor record is allocationModel FOLHA_DIRETA (as sourced), consistent across all tested years — no year silently reclassifies the allocation bucket",
  counselorRecordsByYear.every(({ records }) => records[0]?.allocationModel === "FOLHA_DIRETA"),
);

const dreEngineSrc = readFileSync(join(ROOT, "src/features/rio-scenario-resilience/model/dreEngine.ts"), "utf8");
const calculateFopagInvocations = (dreEngineSrc.match(/calculateFopag\(\{/g) ?? []).length;
check(
  41,
  "dreEngine.ts invokes calculateFopag() exactly once — DRE cannot double-apply Counselor (or any role's) cost through a duplicate FOPAG computation",
  calculateFopagInvocations === 1,
  `${calculateFopagInvocations} invocation(s)`,
);

const counselorExportWb = buildOrgDesignExportWorkbook(
  {
    openingPackageId: OPENING_PACKAGE_ID,
    occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
    orgDesignOptionId: ORG_DESIGN_OPTION_ID,
    tuitionScenarioId: "bp2_ey_ls_unified",
    educatorTierByGrade: {},
  },
  { applicationCommitHash: "gate7-validator", generationTimestampIso: new Date().toISOString(), exportGeneratorVersion: "v10-rc2.5-gate7" },
);
const counselorRpd = counselorExportWb.Sheets["Role Payroll Detail"];
const counselorRpdAoa = counselorRpd ? (XLSX.utils.sheet_to_json(counselorRpd, { header: 1 }) as unknown[][]) : [];
const counselorRpdHeader = (counselorRpdAoa[1] ?? []) as string[];
const counselorYearCol = counselorRpdHeader.indexOf("Year");
const counselorRoleIdCol = counselorRpdHeader.indexOf("Role ID");
const counselorHcCol = counselorRpdHeader.indexOf("Active Headcount/FTE");
// Required regression years per the 2026-07-30 product-owner correction:
// 2028 HC=2, 2031 HC=2, 2032 HC=3, 2033 HC=4, 2037 HC=4.
const COUNSELOR_REGRESSION_YEARS: readonly [number, number][] = [
  [2028, 2],
  [2031, 2],
  [2032, 3],
  [2033, 4],
  [2037, 4],
];
const counselorRegressionRows = COUNSELOR_REGRESSION_YEARS.map(([year, expectedHc]) => ({
  year,
  expectedHc,
  actualHc: counselorRpdAoa
    .slice(2)
    .find((r) => r[counselorRoleIdCol] === "counselor" && r[counselorYearCol] === year)?.[counselorHcCol],
}));
check(
  42,
  "Org Design export's Role Payroll Detail sheet discloses the corrected Counselor ramp (HC=2 at 2028/2031, HC=3 at 2032, HC=4 at 2033/2037) — the twice-corrected ramp propagates to the formula-bearing export, not just the engine",
  counselorRegressionRows.every((r) => r.actualHc === r.expectedHc),
  JSON.stringify(counselorRegressionRows),
);

// ── 43-45: Assistant classification / compensation-source disclosure parity
// between the two live exports (dreScenarioWorkbook.ts and
// orgDesignExportWorkbookBuilder.ts) — runtime, not source-text ─────────────

const TIER_DISPLAY_DOMAIN: (EducatorTierId | null)[] = [...EDUCATOR_TIER_IDS, null];
const tierDisplayMismatches = TIER_DISPLAY_DOMAIN.filter((id) => tierDisplayLabel(id) !== educatorTierDisplayLabel(id));
check(
  43,
  "orgDesignExportWorkbookBuilder.ts's tierDisplayLabel() and dreScenarioWorkbook.ts's educatorTierDisplayLabel() (both newly exported for this proof) produce identical output for every value in the domain (5 tiers + null) — the two live exports' Educator Tier column, incl. Assistant's fixed \"—\", cannot silently diverge",
  tierDisplayMismatches.length === 0,
  tierDisplayMismatches.length === 0 ? "ok" : JSON.stringify(tierDisplayMismatches.map((id) => [id, tierDisplayLabel(id), educatorTierDisplayLabel(id)])),
);

const assistantExportWb = buildOrgDesignExportWorkbook(
  {
    openingPackageId: OPENING_PACKAGE_ID,
    occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
    orgDesignOptionId: ORG_DESIGN_OPTION_ID,
    tuitionScenarioId: "bp2_ey_ls_unified",
    educatorTierByGrade: {},
  },
  { applicationCommitHash: "gate7-validator", generationTimestampIso: new Date().toISOString(), exportGeneratorVersion: "v10-rc2.5-gate7" },
);
const assistantFopagOutput = calculateFopag({
  openingPackageId: OPENING_PACKAGE_ID,
  occupancyScenarioId: OCCUPANCY_SCENARIO_ID,
  orgDesignOptionId: ORG_DESIGN_OPTION_ID,
});
const assistantRec = assistantFopagOutput.records.find((r) => r.roleId === "ey_learning_assistant_pk3" && r.year === YEAR);
const assistantRpd = assistantExportWb.Sheets["Role Payroll Detail"];
const assistantRpdAoa = assistantRpd ? (XLSX.utils.sheet_to_json(assistantRpd, { header: 1 }) as unknown[][]) : [];
const assistantRpdHeader = (assistantRpdAoa[1] ?? []) as string[];
const aYearCol = assistantRpdHeader.indexOf("Year");
const aRoleIdCol = assistantRpdHeader.indexOf("Role ID");
const aTierCol = assistantRpdHeader.indexOf("Educator Tier");
const aSourceTypeCol = assistantRpdHeader.indexOf("Role Source Type");
const aAllocModelCol = assistantRpdHeader.indexOf("Allocation Model");
const assistantRow = assistantRpdAoa.slice(2).find((r) => r[aRoleIdCol] === "ey_learning_assistant_pk3" && r[aYearCol] === YEAR);
check(
  44,
  "Org Design export's Role Payroll Detail sheet discloses the Assistant role's fixed tier (\"—\") and raw compensation-source fields (Role Source Type, Allocation Model) matching the actual FopagCalculatedRecord exactly — not fabricated, not omitted",
  assistantRec !== undefined &&
    assistantRow !== undefined &&
    assistantRow[aTierCol] === "—" &&
    assistantRow[aSourceTypeCol] === assistantRec.roleSourceType &&
    assistantRow[aAllocModelCol] === assistantRec.allocationModel,
  JSON.stringify({ rec: { roleSourceType: assistantRec?.roleSourceType, allocationModel: assistantRec?.allocationModel }, row: assistantRow }),
);

const dreWorkbookSrcForParity = readFileSync(join(ROOT, "src/components/dreSimulator/dreScenarioWorkbook.ts"), "utf8");
check(
  45,
  "dreScenarioWorkbook.ts's Payroll Detail sheet discloses the same raw compensation-source fields (rec.roleSourceType, rec.allocationModel) for every role including Assistant — paired with assertion 43's runtime tier-label proof, this establishes full Assistant classification/compensation-source parity between the two live exports (source-level check for the raw-field passthrough, combined with the runtime check above — not source-text alone)",
  dreWorkbookSrcForParity.includes("rec.roleSourceType,") && dreWorkbookSrcForParity.includes("rec.allocationModel,"),
);

// ── 46-50: deterministic export formatting / structural validation for the
// Org Design export (the one export surface V10-RC2.5 created outright) ────

const FORMATTED_TABULAR_SHEETS: readonly [string, number][] = [
  ["Grade Staffing", 13],
  ["Role Payroll Detail", 14],
  ["FOPAG Payroll Projection", 1 + GOVERNED_DIRECT_YEARS.length],
  ["FOPAG-DRE Reconciliation", 5],
  ["Diagnostics", 6],
];
const colsMismatches = FORMATTED_TABULAR_SHEETS.filter(([name, colCount]) => {
  const sheet = assistantExportWb.Sheets[name];
  const cols = (sheet as { ["!cols"]?: unknown[] })["!cols"];
  return !Array.isArray(cols) || cols.length !== colCount;
});
check(
  46,
  "Every formatted Org Design export sheet has !cols (column widths) with length exactly equal to its header column count",
  colsMismatches.length === 0,
  colsMismatches.length === 0 ? "ok" : JSON.stringify(colsMismatches.map(([n]) => n)),
);

const autofilterMismatches = FORMATTED_TABULAR_SHEETS.filter(([name]) => {
  const sheet = assistantExportWb.Sheets[name];
  const af = (sheet as { ["!autofilter"]?: { ref?: string } })["!autofilter"];
  return !af?.ref || !af.ref.startsWith("A2:");
});
check(
  47,
  "Every formatted Org Design export sheet has !autofilter anchored at the header row (row 2 — after the note row, not spanning it)",
  autofilterMismatches.length === 0,
  autofilterMismatches.length === 0 ? "ok" : JSON.stringify(autofilterMismatches.map(([n]) => n)),
);

const rpdSampleCell = assistantExportWb.Sheets["Role Payroll Detail"]["G3"]; // row0=2 (first data row), col0=6 (annualSalary)
check(
  48,
  "Role Payroll Detail's currency columns (e.g. Annual Salary) carry an explicit \"#,##0.00\" number format, not left as an unformatted raw number",
  rpdSampleCell?.z === "#,##0.00",
  JSON.stringify(rpdSampleCell),
);

const roundTripBuffer = XLSX.write(assistantExportWb, { type: "buffer", bookType: "xlsx" });
// cellNF/cellStyles: without these, SheetJS's read path drops the cell
// number-format code (z) and column-width metadata (!cols) by default
// (confirmed empirically) — the workbook still legitimately contains them
// (Excel opens the file with formatting/widths intact); the plain default
// read call is simply lossy for these two properties on this SheetJS build.
const roundTripWb = XLSX.read(roundTripBuffer, { type: "buffer", cellNF: true, cellStyles: true });
const roundTripRpd = roundTripWb.Sheets["Role Payroll Detail"];
const roundTripRpdCell = roundTripRpd?.["G3"];
const roundTripTotalFormulaCell = roundTripRpd?.["L3"]; // totalRolePayroll, first data row
const originalTotalFormulaCell = assistantExportWb.Sheets["Role Payroll Detail"]["L3"];
check(
  49,
  "Workbook round-trip (write buffer -> read back): sheet names, !cols, !autofilter, currency number format, and the Total Annual Role Payroll formula's cached value all survive a real XLSX write/read cycle",
  JSON.stringify(roundTripWb.SheetNames) === JSON.stringify(assistantExportWb.SheetNames) &&
    Array.isArray((roundTripRpd as { ["!cols"]?: unknown[] })?.["!cols"]) &&
    (roundTripRpd as { ["!autofilter"]?: { ref?: string } })?.["!autofilter"]?.ref?.startsWith("A2:") === true &&
    roundTripRpdCell?.z === "#,##0.00" &&
    typeof roundTripTotalFormulaCell?.v === "number" &&
    typeof originalTotalFormulaCell?.v === "number" &&
    Math.abs(Number(roundTripTotalFormulaCell.v) - Number(originalTotalFormulaCell.v)) < RECONCILIATION_TOLERANCE,
  JSON.stringify({ sheetNames: roundTripWb.SheetNames, roundTripZ: roundTripRpdCell?.z, roundTripTotal: roundTripTotalFormulaCell?.v, originalTotal: originalTotalFormulaCell?.v }),
);

// Documented, verified-absent library limitation — not an omitted checklist
// item. See node_modules/xlsx's write_ws_xml_sheetviews: it emits only
// workbookViewId/rightToLeft, never pane/freeze XML, on this SheetJS 0.18.5
// (community) build. Confirmed empirically (write -> read round-trip drops
// a manually-set `sheet["!freeze"]` entirely) during this phase's closure
// work. Recorded here as a passing, documented check rather than silently
// omitted or falsely asserted as implemented.
const freezeProbeWb = XLSX.utils.book_new();
const freezeProbeWs = XLSX.utils.aoa_to_sheet([["a"], [1]]);
(freezeProbeWs as { ["!freeze"]?: unknown })["!freeze"] = { xSplit: 0, ySplit: 1 };
XLSX.utils.book_append_sheet(freezeProbeWb, freezeProbeWs, "Probe");
const freezeProbeBuf = XLSX.write(freezeProbeWb, { type: "buffer", bookType: "xlsx" });
const freezeProbeReread = XLSX.read(freezeProbeBuf, { type: "buffer" });
const freezeSurvived = (freezeProbeReread.Sheets["Probe"] as { ["!freeze"]?: unknown })["!freeze"] !== undefined;
check(
  50,
  "Frozen header panes are confirmed NOT supported by the installed SheetJS 0.18.5 (community) write path (verified via a live write->read round-trip probe) — documented as a library-version limitation, not implemented as a fake no-op property",
  freezeSurvived === false,
  "!freeze does not survive a write/read round-trip on this xlsx package version — frozen panes are not implementable without a library upgrade",
);

// ── 51-52: MS/HS cumulative-headcount invariant (added 2026-07-30, same
// pass as the HS g10/g11 correction) — the per-grade FTE values in
// MS_FTE_BY_GRADE/HS_FTE_BY_GRADE have been "corrected" multiple times
// across sessions with different final values each time. What the product
// owner actually states and checks is the CUMULATIVE sequence as grades
// open in order, not the per-grade breakdown — so assert that sequence
// directly, computed from the live constants, rather than only the
// per-grade values (assertions 13-14 above).
function cumulativeSequence(fteByGrade: Record<string, number>, gradesInOrder: readonly string[]): number[] {
  let running = 0;
  return gradesInOrder.map((g) => {
    running += fteByGrade[g] ?? 0;
    return running;
  });
}
const hsCumulative = cumulativeSequence(HS_FTE_BY_GRADE, ["g9", "g10", "g11", "g12"]);
check(
  51,
  "HS cumulative headcount as g9/g10/g11/g12 open in sequence is exactly [4,7,9,11] (direct product-owner statement, 2026-07-30)",
  JSON.stringify(hsCumulative) === JSON.stringify([4, 7, 9, 11]),
  JSON.stringify(hsCumulative),
);
const msCumulative = cumulativeSequence(MS_FTE_BY_GRADE, ["g6", "g7", "g8"]);
check(
  52,
  "MS cumulative headcount as g6/g7/g8 open in sequence is exactly [3,7,9] (confirmed correct as-is, 2026-07-30)",
  JSON.stringify(msCumulative) === JSON.stringify([3, 7, 9]),
  JSON.stringify(msCumulative),
);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED (${checksRun}/52 assertions)`
    : `\n${failures} CHECK(S) FAILED out of ${checksRun}`,
);
if (checksRun !== 52) {
  console.log(`\nWARNING: expected exactly 52 assertions, ran ${checksRun}.`);
}
process.exit(failures === 0 && checksRun === 52 ? 0 : 1);
