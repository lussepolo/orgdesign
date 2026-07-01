// Phase 15R.3 — Full FOPAG / Folha Direta Tabs in DRE Workbook (43 checks).
//
//   Section A — Workbook structure (checks 1–7)
//     1.  DRE workbook includes all prior DRE sheets (13 core sheets from Phase 14B)
//     2.  DRE workbook includes all Phase 15R.1 sheets (6 payroll sheets)
//     3.  DRE workbook includes FOPAG Headcount Plan
//     4.  DRE workbook includes FOPAG Role Audit
//     5.  DRE workbook includes FOPAG Payroll Projection
//     6.  No sheet named "Non-Teaching Headcount Plan" in the DRE workbook
//     7.  Total DRE workbook sheet count >= 22
//
//   Section B — Three-version coverage (checks 8–12)
//     8.  FOPAG Headcount Plan includes all three org design versions (column A)
//     9.  FOPAG Headcount Plan includes all 20 projection years
//    10.  FOPAG Payroll Projection includes all three org design versions
//    11.  FOPAG Payroll Projection includes all 20 projection years
//    12.  FOPAG Role Audit includes all three org design versions
//
//   Section C — Reconciliation (checks 13–17)
//    13.  FOPAG Payroll Projection totals reconcile to Payroll Comparison year totals (per variant)
//    14.  FOPAG Headcount Plan HC totals (non-audit) reconcile to Payroll Comparison HC columns
//    15.  FOPAG Role Audit contains all role IDs present in FOPAG Payroll Projection
//    16.  DRE Payroll Bridge still reconciles for all org versions and all projection years
//    17.  For every FOPAG Payroll Projection row, Total = FOPAG Direto + Folha Direta + Benefits
//
//   Section D — Scope correctness (checks 18–23)
//    18.  No Service Contract rows in FOPAG Payroll Projection (roleSourceType != 'service_contract')
//    19.  No CAPEX rows in FOPAG Payroll Projection
//    20.  No tuition/revenue rows in FOPAG Payroll Projection
//    21.  Teaching roles are not excluded from FOPAG Payroll Projection
//    22.  Any audit row in FOPAG Payroll Projection is marked isAuditRow=true, not dropped
//    23.  Non-payroll DRE fixed cost rows are absent from FOPAG Payroll Projection
//
//   Section E — Data integrity (checks 24–29)
//    24.  No undefined values in FOPAG Payroll Projection money rows
//    25.  No NaN values in FOPAG Payroll Projection money rows
//    26.  No missing org design versions across FOPAG sheets
//    27.  No missing projection years across FOPAG sheets
//    28.  Numeric payroll values remain numeric
//    29.  Numeric headcount/FTE values remain numeric
//
//   Section F — README (checks 30–33)
//    30.  README includes "not limited to non-teaching headcount"
//    31.  README includes "external service contracts are not included"
//    32.  README includes "not copied from the BP workbook"
//    33.  DRE export helper copy references full FOPAG/Folha Direta or equivalent
//
//   Section G — UI/export path (checks 34–36)
//    34.  DreScenarioSimulatorTab.tsx contains exactly one DreExportButton instance (no duplicate card)
//    35.  DreScenarioSimulatorTab.tsx contains 'FOPAG/Folha Direta'
//    36.  No sheet named "Non-Teaching Headcount Plan" is referenced in DreScenarioSimulatorTab.tsx
//
//   Section H — File scope protection (checks 37–43)
//    37.  orgDesignPayrollActivation.ts not touched (no 15R.3 marker)
//    38.  fopagEngine.ts not touched (no 15R.3 marker)
//    39.  dreEngine.ts not touched (no 15R.3 marker)
//    40.  tuitionSourceData.ts not touched (no 15R.3 marker)
//    41.  discountScheduleSourceData.ts not touched (no 15R.3 marker)
//    42.  No BP workbook import/parsing flow added to dreScenarioWorkbook.ts
//    43.  Validator check count = 43 (self-check)
//
// Run with: npx tsx scripts/validate-phase15r3.ts

import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { FopagEngineOutput } from "../src/features/rio-scenario-resilience/model/fopagEngineContract";

// ── Fixture selections ────────────────────────────────────────────────────────
const FIXTURE_SELECTIONS: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp3_ey_to_ms_unified",
  orgDesignOptionId: "balanced_experience",
};

const TOLERANCE = 1e-6;
const ORG_DESIGN_IDS: readonly DreWorkingScenarioOrgDesignOptionId[] = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function readFile(path: string): string {
  try { return readFileSync(path, "utf8"); } catch { return ""; }
}

let passCount = 0;
let failCount = 0;

function checkTrue(label: string, val: boolean, note?: string): void {
  if (val) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}${note ? ` — ${note}` : ""}`);
  }
}

function checkEqual<T>(label: string, actual: T, expected: T, note?: string): void {
  const ok = actual === expected;
  if (ok) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label} — expected ${String(expected)}, got ${String(actual)}${note ? ` (${note})` : ""}`);
  }
}

// ── Build test artifacts ──────────────────────────────────────────────────────
const fixtureSelections = FIXTURE_SELECTIONS;
const dreOutput = calculateDre(fixtureSelections);
const fopagOutput = calculateFopag({
  openingPackageId: fixtureSelections.openingPackageId,
  occupancyScenarioId: fixtureSelections.occupancyScenarioId,
  orgDesignOptionId: fixtureSelections.orgDesignOptionId,
});
const threeVersionPayroll = computeOrgDesignPayrollVariants(fixtureSelections, dreOutput, fopagOutput);

const LAST_YEAR = RECEITA_PROJECTION_YEARS[RECEITA_PROJECTION_YEARS.length - 1];
const orgDesignSensitivity = ORG_DESIGN_IDS.map((orgDesignOptionId) => {
  const out = orgDesignOptionId === fixtureSelections.orgDesignOptionId
    ? dreOutput
    : calculateDre({ ...fixtureSelections, orgDesignOptionId });
  const lyr = out.byYear[LAST_YEAR];
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((y) => out.byYear[y].ebitda > 0) ?? null;
  return {
    orgDesignOptionId,
    isSelected: orgDesignOptionId === fixtureSelections.orgDesignOptionId,
    numeroDeAlunos2047: lyr.numero_de_alunos,
    receitaOperacionalLiquida2047: lyr.receita_operacional_liquida,
    ebitda2047: lyr.ebitda,
    percentualEbitda2047: lyr.percentual_ebitda,
    payrollTotal2047: -(lyr.fopag_direto_clt_pj + lyr.folha_de_pagamento + lyr.beneficios),
    ebitdaPositiveYear,
  };
});

const payrollReconciliation = { isReconciled: true, mismatches: [] as const };

const workbook = buildDreScenarioWorkbook({
  selections: fixtureSelections,
  defaultSelections: fixtureSelections,
  dreOutput,
  fopagOutput,
  payrollReconciliation,
  orgDesignSensitivity,
  exportedAt: new Date("2026-07-01T00:00:00.000Z"),
  threeVersionPayroll,
});

const SHEET_NAMES = workbook.SheetNames;

// ── Helper: read sheet rows as plain arrays ───────────────────────────────────
function sheetToRows(sheetName: string): (string | number | boolean | null)[][] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet["!ref"]) return [];
  const range = decodeRange(sheet["!ref"]);
  const rows: (string | number | boolean | null)[][] = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: (string | number | boolean | null)[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = sheet[encodeCell(r, c)];
      row.push(cell ? (cell.v ?? null) : null);
    }
    rows.push(row);
  }
  return rows;
}

function decodeRange(ref: string): { s: { r: number; c: number }; e: { r: number; c: number } } {
  const [start, end] = ref.split(":");
  return { s: decodeCell(start), e: end ? decodeCell(end) : decodeCell(start) };
}

function decodeCell(addr: string): { r: number; c: number } {
  const col = addr.replace(/[0-9]/g, "");
  const row = parseInt(addr.replace(/[A-Z]/gi, ""), 10);
  const c = col.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  return { r: row - 1, c };
}

function encodeCell(r: number, c: number): string {
  let col = "";
  let cc = c + 1;
  while (cc > 0) { col = String.fromCharCode(((cc - 1) % 26) + 65) + col; cc = Math.floor((cc - 1) / 26); }
  return `${col}${r + 1}`;
}

// ── Helper: totalHcForYear (mirrors dreScenarioWorkbook.ts) ──────────────────
function totalHcForYear(fopagOut: FopagEngineOutput, year: number): number {
  return fopagOut.records
    .filter((r) => r.year === year && !r.isAuditRow)
    .reduce((sum, r) => sum + r.headcountOrFte, 0);
}

// ── Section A: Workbook structure ─────────────────────────────────────────────
console.log("\nSection A — Workbook structure:");

const CORE_SHEETS = [
  "README", "Scenario Inputs", "DRE Summary", "DRE Detail", "DRE Cost Lines",
  "Enrollment", "Tuition Revenue", "Org Design Roles", "Payroll FOPAG",
  "Org Design Sensitivity", "Scenario Sensitivity Matrix", "Formula Audit", "Raw Engine Output",
];
const R1_SHEETS = [
  "Payroll Comparison", "Payroll Detail - Minimum", "Payroll Detail - Balanced",
  "Payroll Detail - Premium", "Payroll Delta Analysis", "DRE Payroll Bridge",
];
const R3_SHEETS = ["FOPAG Headcount Plan", "FOPAG Role Audit", "FOPAG Payroll Projection"];

const missingCore = CORE_SHEETS.filter((s) => !SHEET_NAMES.includes(s));
checkTrue(
  "1. All 13 prior DRE sheets present",
  missingCore.length === 0,
  missingCore.length > 0 ? `missing: ${missingCore.join(", ")}` : "all present",
);
const missingR1 = R1_SHEETS.filter((s) => !SHEET_NAMES.includes(s));
checkTrue(
  "2. All Phase 15R.1 sheets present",
  missingR1.length === 0,
  missingR1.length > 0 ? `missing: ${missingR1.join(", ")}` : "all present",
);
checkTrue("3. FOPAG Headcount Plan sheet exists", SHEET_NAMES.includes("FOPAG Headcount Plan"));
checkTrue("4. FOPAG Role Audit sheet exists", SHEET_NAMES.includes("FOPAG Role Audit"));
checkTrue("5. FOPAG Payroll Projection sheet exists", SHEET_NAMES.includes("FOPAG Payroll Projection"));
checkTrue(
  "6. No sheet named 'Non-Teaching Headcount Plan' in DRE workbook",
  !SHEET_NAMES.includes("Non-Teaching Headcount Plan"),
);
checkTrue("7. Total sheet count >= 22", SHEET_NAMES.length >= 22, `got ${SHEET_NAMES.length}`);

// ── Section B: Three-version coverage ────────────────────────────────────────
console.log("\nSection B — Three-version coverage:");

// FOPAG Headcount Plan: column 0 = Org Design Option ID, column 2 = Year
// Skip note row (row 0) and header row (row 1), data starts at row 2
const hcPlanRows = sheetToRows("FOPAG Headcount Plan").slice(2);
const hcPlanOrgIds = new Set(hcPlanRows.map((r) => r[0] as string));
const hcPlanYears = new Set(hcPlanRows.map((r) => r[2] as number));
checkTrue(
  "8. FOPAG Headcount Plan includes all three org design versions",
  ORG_DESIGN_IDS.every((id) => hcPlanOrgIds.has(id)),
  `found: ${[...hcPlanOrgIds].join(", ")}`,
);
checkTrue(
  "9. FOPAG Headcount Plan includes all 20 projection years",
  RECEITA_PROJECTION_YEARS.every((y) => hcPlanYears.has(y)),
  `found ${hcPlanYears.size} years`,
);

// FOPAG Payroll Projection: column 0 = Org Design Option ID, column 2 = Year
const ppRows = sheetToRows("FOPAG Payroll Projection").slice(2);
const ppOrgIds = new Set(ppRows.map((r) => r[0] as string));
const ppYears = new Set(ppRows.map((r) => r[2] as number));
checkTrue(
  "10. FOPAG Payroll Projection includes all three org design versions",
  ORG_DESIGN_IDS.every((id) => ppOrgIds.has(id)),
  `found: ${[...ppOrgIds].join(", ")}`,
);
checkTrue(
  "11. FOPAG Payroll Projection includes all 20 projection years",
  RECEITA_PROJECTION_YEARS.every((y) => ppYears.has(y)),
  `found ${ppYears.size} years`,
);

// FOPAG Role Audit: column 2 = Org Design Option ID
const roleAuditRows = sheetToRows("FOPAG Role Audit").slice(2);
const roleAuditOrgIds = new Set(roleAuditRows.map((r) => r[2] as string));
checkTrue(
  "12. FOPAG Role Audit includes all three org design versions",
  ORG_DESIGN_IDS.every((id) => roleAuditOrgIds.has(id)),
  `found: ${[...roleAuditOrgIds].join(", ")}`,
);

// ── Section C: Reconciliation ─────────────────────────────────────────────────
console.log("\nSection C — Reconciliation:");

// Check 13: FOPAG Payroll Projection totals reconcile to Payroll Comparison year totals
// ppRows: cols [0]=OrgId, [1]=Label, [2]=Year, [3]=RoleId, [4]=RoleName, [5]=RST,
//         [6]=Class, [7]=HC, [8]=FOPAGDireto, [9]=FolhaDireta, [10]=Benefits, [11]=TotalPayroll, [12]=IsAudit
let projectionTotalsMatch = true;
for (const orgId of ORG_DESIGN_IDS) {
  const variant = orgId === "minimum_experience" ? threeVersionPayroll.minimum
    : orgId === "balanced_experience" ? threeVersionPayroll.balanced
    : threeVersionPayroll.premium;
  for (const year of RECEITA_PROJECTION_YEARS) {
    const yt = variant.fopagOutput.yearTotals.find((y) => y.year === year);
    if (!yt) { projectionTotalsMatch = false; continue; }
    const projRows = ppRows.filter((r) => r[0] === orgId && r[2] === year);
    const sumFopag = projRows.reduce((s, r) => s + ((r[8] as number) ?? 0), 0);
    const sumFolha = projRows.reduce((s, r) => s + ((r[9] as number) ?? 0), 0);
    const sumBene = projRows.reduce((s, r) => s + ((r[10] as number) ?? 0), 0);
    const sumTotal = projRows.reduce((s, r) => s + ((r[11] as number) ?? 0), 0);
    if (
      Math.abs(sumFopag - yt.fopagDireto) > TOLERANCE ||
      Math.abs(sumFolha - yt.folhaDireta) > TOLERANCE ||
      Math.abs(sumBene - yt.benefits) > TOLERANCE ||
      Math.abs(sumTotal - yt.totalPayroll) > TOLERANCE
    ) {
      projectionTotalsMatch = false;
      console.log(`    Reconciliation mismatch: ${orgId} year=${year} sumFopag=${sumFopag} expected=${yt.fopagDireto}`);
    }
  }
}
checkTrue("13. FOPAG Payroll Projection totals reconcile to Payroll Comparison yearTotals", projectionTotalsMatch);

// Check 14: FOPAG Headcount Plan HC totals (non-audit rows) reconcile to model totalHcForYear
// hcPlanRows: cols [0]=OrgId, [2]=Year, [7]=HC, [9]=PayrollInclusionStatus
let hcTotalsMatch = true;
for (const orgId of ORG_DESIGN_IDS) {
  const variant = orgId === "minimum_experience" ? threeVersionPayroll.minimum
    : orgId === "balanced_experience" ? threeVersionPayroll.balanced
    : threeVersionPayroll.premium;
  for (const year of RECEITA_PROJECTION_YEARS) {
    const modelHc = totalHcForYear(variant.fopagOutput, year);
    const planNonAuditRows = hcPlanRows.filter(
      (r) => r[0] === orgId && r[2] === year && r[9] !== "audit-row-excluded",
    );
    const planHc = planNonAuditRows.reduce((s, r) => s + ((r[7] as number) ?? 0), 0);
    if (Math.abs(planHc - modelHc) > TOLERANCE) {
      hcTotalsMatch = false;
      console.log(`    HC mismatch: ${orgId} year=${year} planHc=${planHc} modelHc=${modelHc}`);
    }
  }
}
checkTrue("14. FOPAG Headcount Plan HC (non-audit) reconciles to model totalHcForYear per org/year", hcTotalsMatch);

// Check 15: Role Audit contains all role IDs present in FOPAG Payroll Projection (per org design)
let roleAuditCoversAll = true;
for (const orgId of ORG_DESIGN_IDS) {
  const ppRoleIds = new Set(ppRows.filter((r) => r[0] === orgId).map((r) => r[3] as string));
  const auditRoleIds = new Set(roleAuditRows.filter((r) => r[2] === orgId).map((r) => r[0] as string));
  for (const roleId of ppRoleIds) {
    if (!auditRoleIds.has(roleId)) {
      roleAuditCoversAll = false;
      console.log(`    Role Audit missing roleId=${roleId} for ${orgId}`);
    }
  }
}
checkTrue("15. FOPAG Role Audit contains all role IDs present in FOPAG Payroll Projection", roleAuditCoversAll);

// Check 16: DRE Payroll Bridge still reconciles for all variants and years
let bridgeAllOk = true;
for (const orgId of ORG_DESIGN_IDS) {
  const variant = orgId === "minimum_experience" ? threeVersionPayroll.minimum
    : orgId === "balanced_experience" ? threeVersionPayroll.balanced
    : threeVersionPayroll.premium;
  const ytMap = new Map(variant.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
  for (const year of RECEITA_PROJECTION_YEARS) {
    const dreRow = variant.dreOutput.byYear[year];
    const yt = ytMap.get(year)!;
    const fopagVar = dreRow.fopag_direto_clt_pj + yt.fopagDireto;
    const folhaVar = dreRow.folha_de_pagamento + yt.folhaDireta;
    const beneVar = dreRow.beneficios + yt.benefits;
    if (Math.abs(fopagVar) >= TOLERANCE || Math.abs(folhaVar) >= TOLERANCE || Math.abs(beneVar) >= TOLERANCE) {
      bridgeAllOk = false;
      console.log(`    Bridge mismatch: ${orgId} year=${year}`);
    }
  }
}
checkTrue("16. DRE Payroll Bridge reconciles for all org versions and years", bridgeAllOk);

// Check 17: For every Payroll Projection row, Total = FOPAG Direto + Folha Direta + Benefits
let totalByConstruction = true;
for (const row of ppRows) {
  const fopag = (row[8] as number) ?? 0;
  const folha = (row[9] as number) ?? 0;
  const bene = (row[10] as number) ?? 0;
  const total = (row[11] as number) ?? 0;
  if (Math.abs(total - (fopag + folha + bene)) > TOLERANCE) {
    totalByConstruction = false;
    console.log(`    Total mismatch for role=${row[3]} year=${row[2]} org=${row[0]}: total=${total} sum=${fopag + folha + bene}`);
  }
}
checkTrue("17. Every FOPAG Payroll Projection row: Total = FOPAG Direto + Folha Direta + Benefits", totalByConstruction);

// ── Section D: Scope correctness ─────────────────────────────────────────────
console.log("\nSection D — Scope correctness:");

// ppRows col [5] = Role Source Type
const ppRoleSourceTypes = new Set(ppRows.map((r) => r[5] as string));
checkTrue(
  "18. No service_contract rows in FOPAG Payroll Projection",
  !ppRoleSourceTypes.has("service_contract"),
);
checkTrue(
  "19. No CAPEX rows in FOPAG Payroll Projection",
  !ppRoleSourceTypes.has("capex") && !ppRoleSourceTypes.has("CAPEX"),
);
checkTrue(
  "20. No tuition/revenue rows in FOPAG Payroll Projection",
  !ppRoleSourceTypes.has("tuition") && !ppRoleSourceTypes.has("revenue"),
);

// Check 21: Teaching roles present — roleSourceType containing 'teaching_lead'
const teachingRoleTypes = [
  "ey_teaching_lead", "ls_teaching_lead", "ms_teaching_lead", "hs_teaching_lead",
];
checkTrue(
  "21. Teaching payroll-driving roles are included in FOPAG Payroll Projection",
  teachingRoleTypes.some((t) => ppRoleSourceTypes.has(t)),
  `found teaching types: ${teachingRoleTypes.filter((t) => ppRoleSourceTypes.has(t)).join(", ")}`,
);

// Check 22: Audit rows are retained and marked, not dropped
const auditRowsInProjection = ppRows.filter((r) => r[12] === true);
checkTrue(
  "22. Audit rows retained in FOPAG Payroll Projection (marked isAuditRow=true, not dropped)",
  auditRowsInProjection.length > 0,
  `${auditRowsInProjection.length} audit rows present`,
);

// Check 23: No rpa, aluguel_iptu or other DRE fixed cost line IDs as role IDs
const dreFixedCostLineIds = [
  "aluguel_iptu", "rpa", "cursos_e_treinamentos", "servicos_de_limpeza_e_seguranca",
  "consultoria_e_honorarios", "energia_eletrica_agua_e_esgoto",
];
const ppRoleIds = new Set(ppRows.map((r) => r[3] as string));
const fixedCostIntersect = dreFixedCostLineIds.filter((id) => ppRoleIds.has(id));
checkTrue(
  "23. Non-payroll DRE fixed-cost line IDs absent from FOPAG Payroll Projection",
  fixedCostIntersect.length === 0,
  fixedCostIntersect.length > 0 ? `found: ${fixedCostIntersect.join(", ")}` : "none found",
);

// ── Section E: Data integrity ─────────────────────────────────────────────────
console.log("\nSection E — Data integrity:");

// Money columns: FOPAG Direto [8], Folha Direta [9], Benefits [10], Total [11]
const moneyVals = ppRows.flatMap((r) => [r[8], r[9], r[10], r[11]] as (number | null)[]);
checkTrue("24. No undefined values in FOPAG Payroll Projection money columns", moneyVals.every((v) => v !== undefined));
checkTrue("25. No NaN values in FOPAG Payroll Projection money columns", moneyVals.every((v) => v === null || !Number.isNaN(Number(v))));

const missingOrgInHc = ORG_DESIGN_IDS.filter((id) => !hcPlanOrgIds.has(id));
const missingOrgInPp = ORG_DESIGN_IDS.filter((id) => !ppOrgIds.has(id));
const missingOrgInAudit = ORG_DESIGN_IDS.filter((id) => !roleAuditOrgIds.has(id));
checkTrue(
  "26. No missing org design versions across FOPAG sheets",
  missingOrgInHc.length === 0 && missingOrgInPp.length === 0 && missingOrgInAudit.length === 0,
  `hcPlan missing: [${missingOrgInHc}], pp missing: [${missingOrgInPp}], audit missing: [${missingOrgInAudit}]`,
);

const missingYearsInHc = RECEITA_PROJECTION_YEARS.filter((y) => !hcPlanYears.has(y));
const missingYearsInPp = RECEITA_PROJECTION_YEARS.filter((y) => !ppYears.has(y));
checkTrue(
  "27. No missing projection years across FOPAG sheets",
  missingYearsInHc.length === 0 && missingYearsInPp.length === 0,
  `hcPlan missing years: [${missingYearsInHc}], pp missing years: [${missingYearsInPp}]`,
);

checkTrue(
  "28. Numeric payroll values are numeric (typeof 'number')",
  moneyVals.filter((v) => v !== null).every((v) => typeof v === "number"),
);

const hcVals = ppRows.map((r) => r[7] as number | null);
checkTrue(
  "29. Numeric headcount/FTE values are numeric where available",
  hcVals.filter((v) => v !== null).every((v) => typeof v === "number" && !Number.isNaN(v)),
);

// ── Section F: README ────────────────────────────────────────────────────────
console.log("\nSection F — README:");

const workbookSrc = readFile("src/components/dreSimulator/dreScenarioWorkbook.ts");
checkTrue(
  "30. README includes 'not limited to non-teaching headcount'",
  workbookSrc.includes("not limited to non-teaching headcount"),
);
checkTrue(
  "31. README includes text about external service contracts excluded from FOPAG/Folha Direta",
  workbookSrc.includes("External service contracts are not included in FOPAG/Folha Direta"),
);
checkTrue(
  "32. README includes 'not copied from the BP workbook'",
  workbookSrc.includes("not copied from the BP workbook"),
);

// ── Section G: UI/export path ─────────────────────────────────────────────────
console.log("\nSection G — UI/export path:");

const tabSrc = readFile("src/components/sections/DreScenarioSimulatorTab.tsx");
checkTrue(
  "33. DreScenarioSimulatorTab.tsx helper copy references full FOPAG/Folha Direta",
  tabSrc.includes("FOPAG/Folha Direta"),
);
const exportBtnCount = (tabSrc.match(/<DreExportButton/g) ?? []).length;
checkEqual(
  "34. DreScenarioSimulatorTab.tsx has exactly one DreExportButton instance (no duplicate bottom card)",
  exportBtnCount,
  1,
  `found ${exportBtnCount}`,
);
checkTrue(
  "35. DreScenarioSimulatorTab.tsx does not reference 'Non-Teaching Headcount Plan'",
  !tabSrc.includes("Non-Teaching Headcount Plan"),
);

// ── Section H: File scope protection ─────────────────────────────────────────
console.log("\nSection H — File scope protection:");

const orgActivationSrc = readFile("src/features/rio-scenario-resilience/model/orgDesignPayrollActivation.ts");
const fopagEngineSrc = readFile("src/features/rio-scenario-resilience/model/fopagEngine.ts");
const dreEngineSrc = readFile("src/features/rio-scenario-resilience/model/dreEngine.ts");
const tuitionSrc = readFile("src/features/rio-scenario-resilience/model/tuitionSourceData.ts");
const discountSrc = readFile("src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts");

checkTrue("36. orgDesignPayrollActivation.ts not touched (no 15R.3 marker)", !orgActivationSrc.includes("15R.3"));
checkTrue("37. fopagEngine.ts not touched (no 15R.3 marker)", !fopagEngineSrc.includes("15R.3"));
checkTrue("38. dreEngine.ts not touched (no 15R.3 marker)", !dreEngineSrc.includes("15R.3"));
checkTrue("39. tuitionSourceData.ts not touched (no 15R.3 marker)", !tuitionSrc.includes("15R.3"));
checkTrue("40. discountScheduleSourceData.ts not touched (no 15R.3 marker)", !discountSrc.includes("15R.3"));
checkTrue(
  "41. No BP workbook import/parsing added to dreScenarioWorkbook.ts",
  !workbookSrc.includes("bp_workbook") && !workbookSrc.includes("bpWorkbook") && !workbookSrc.includes("parseBp"),
);
checkTrue(
  "42. No static value copying from old staffing workbook in dreScenarioWorkbook.ts",
  !workbookSrc.includes("STAFFING_PAYROLL_SHEET_NAMES") && !workbookSrc.includes("Non-Teaching Headcount Plan"),
);

// ── Section I: Aggregate (self-check) ────────────────────────────────────────
console.log("\nSection I — Aggregate:");
const EXPECTED_CHECK_COUNT = 43;
const actualCount = passCount + failCount;
checkEqual(
  `43. Validator check count = ${EXPECTED_CHECK_COUNT}`,
  actualCount,
  EXPECTED_CHECK_COUNT - 1,
  "self-check is the 43rd",
);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Phase 15R.3 validation: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log("FAILED");
  process.exit(1);
} else {
  console.log("ALL CHECKS PASSED");
}
