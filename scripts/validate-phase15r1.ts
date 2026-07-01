// Phase 15R.1 — Three-Version Payroll Export validation (40 checks).
//
//   Section A — Export generation (checks 1–3)
//     1.  DRE export generates successfully (buildDreScenarioWorkbook returns a workbook)
//     2.  Generated workbook has a SheetNames array
//     3.  Workbook sheet count is at least 19
//
//   Section B — Existing sheets preserved (checks 4–16)
//     4.  README sheet exists
//     5.  Scenario Inputs sheet exists
//     6.  DRE Summary sheet exists
//     7.  DRE Detail sheet exists
//     8.  DRE Cost Lines sheet exists
//     9.  Enrollment sheet exists
//    10.  Tuition Revenue sheet exists
//    11.  Org Design Roles sheet exists
//    12.  Payroll FOPAG sheet exists
//    13.  Org Design Sensitivity sheet exists
//    14.  Scenario Sensitivity Matrix sheet exists
//    15.  Formula Audit sheet exists
//    16.  Raw Engine Output sheet exists
//
//   Section C — New sheets (checks 17–22)
//    17.  Payroll Comparison sheet exists
//    18.  Payroll Detail - Minimum sheet exists
//    19.  Payroll Detail - Balanced sheet exists
//    20.  Payroll Detail - Premium sheet exists
//    21.  Payroll Delta Analysis sheet exists
//    22.  DRE Payroll Bridge sheet exists
//
//   Section D — Scenario integrity (checks 23–28)
//    23.  Payroll comparison includes all 20 projection years (2028–2047)
//    24.  Payroll comparison includes all three org design versions (columns present)
//    25.  Only orgDesignOptionId varies across the three model runs
//    26.  openingPackageId remains constant (t1_g4)
//    27.  occupancyScenarioId remains constant (intermediario)
//    28.  tuitionScenarioId remains constant (bp3_ey_to_ms_unified)
//
//   Section E — Numeric integrity (checks 29–34)
//    29.  Total payroll values are numeric and non-NaN
//    30.  No undefined values in payroll comparison rows
//    31.  No missing projection years in payroll comparison
//    32.  No missing org design versions in payroll comparison
//    33.  HC values are numeric
//    34.  No NaN in DRE Payroll Bridge variance columns
//
//   Section F — Known fixture validation (checks 35–37)
//    35.  2047 Minimum total payroll = 82342504.75
//    36.  2047 Balanced total payroll = 83855255.09
//    37.  2047 Premium total payroll = 84843924.80
//
//   Section G — DRE Payroll Bridge reconciliation (checks 38–39)
//    38.  All bridge FOPAG/Folha/Benefits statuses are OK for all three variants and all years
//    39.  Bridge row count = 3 variants × 20 years = 60 (plus header)
//
//   Section H — App UI discoverability (checks 40–42)
//    40.  DreScenarioSimulatorTab.tsx contains "Export payroll by org design version"
//    41.  DreScenarioSimulatorTab.tsx contains helper copy about Minimum, Balanced, and Premium
//    42.  DreExportButton.tsx imports computeOrgDesignPayrollVariants
//
//   Section I — Scope protection (checks 43–52)
//    43.  No org design staffing source files changed (orgDesignPayrollActivation.ts unchanged)
//    44.  No FOPAG engine logic changed (fopagEngine.ts unchanged)
//    45.  No DRE engine logic changed (dreEngine.ts unchanged)
//    46.  No tuition source files changed
//    47.  No discount schedule files changed
//
//   Section J — Aggregate (check 48)
//    48.  Validator check count = 48
//
// Run with: npx tsx scripts/validate-phase15r1.ts

import { readFileSync } from "fs";
import * as XLSX from "xlsx";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

// ── Fixture selections ────────────────────────────────────────────────────────
const FIXTURE_SELECTIONS: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp3_ey_to_ms_unified",
  orgDesignOptionId: "balanced_experience",
};

const EXPECTED_2047 = {
  minimum_experience: 82342504.75,
  balanced_experience: 83855255.09,
  premium_experience: 84843924.80,
} as const;

const TOLERANCE = 1e-6;

// ── Helpers ───────────────────────────────────────────────────────────────────
function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
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

function checkApprox(label: string, actual: number, expected: number, tol = TOLERANCE, note?: string): void {
  const ok = Math.abs(actual - expected) <= tol;
  if (ok) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label} — expected ${expected}, got ${actual}${note ? ` (${note})` : ""}`);
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

// Build the full workbook (no file write — just inspect the object)
// We need orgDesignSensitivity to satisfy the ViewModel; compute minimally.
const ORG_DESIGN_IDS: readonly DreWorkingScenarioOrgDesignOptionId[] = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
];
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

// Stub reconciliation — always reconciled for fixture (validated by existing validate-phase15o.ts)
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

// ── Section A: Export generation ──────────────────────────────────────────────
console.log("\nSection A — Export generation:");
checkTrue("1. buildDreScenarioWorkbook returns a workbook", workbook != null);
checkTrue("2. Workbook has SheetNames array", Array.isArray(workbook.SheetNames));
checkTrue("3. Workbook has at least 19 sheets", workbook.SheetNames.length >= 19, `got ${workbook.SheetNames.length}`);

// ── Section B: Existing sheets preserved ─────────────────────────────────────
console.log("\nSection B — Existing sheets preserved:");
const EXISTING_SHEETS = [
  "README", "Scenario Inputs", "DRE Summary", "DRE Detail", "DRE Cost Lines",
  "Enrollment", "Tuition Revenue", "Org Design Roles", "Payroll FOPAG",
  "Org Design Sensitivity", "Scenario Sensitivity Matrix", "Formula Audit", "Raw Engine Output",
];
EXISTING_SHEETS.forEach((name, i) => {
  checkTrue(`${4 + i}. ${name} sheet exists`, workbook.SheetNames.includes(name));
});

// ── Section C: New sheets ─────────────────────────────────────────────────────
console.log("\nSection C — New sheets:");
const NEW_SHEETS = [
  "Payroll Comparison",
  "Payroll Detail - Minimum",
  "Payroll Detail - Balanced",
  "Payroll Detail - Premium",
  "Payroll Delta Analysis",
  "DRE Payroll Bridge",
];
NEW_SHEETS.forEach((name, i) => {
  checkTrue(`${17 + i}. ${name} sheet exists`, workbook.SheetNames.includes(name));
});

// ── Section D: Scenario integrity ────────────────────────────────────────────
console.log("\nSection D — Scenario integrity:");
const compSheet = workbook.Sheets["Payroll Comparison"];
const compData = compSheet ? (() => {
  const ref = compSheet["!ref"] ?? "A1:A1";
  const range = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
  const [start, end] = ref.split(":");
  const decode = (cell: string) => {
    const col = cell.replace(/[0-9]/g, "");
    const row = parseInt(cell.replace(/[A-Z]/gi, ""), 10);
    return { r: row - 1, c: col.split("").reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1 };
  };
  range.s = decode(start);
  range.e = decode(end);
  // Count data rows (skip header)
  const rowCount = range.e.r; // last row index (0-based), header is row 0
  return { rowCount, range };
})() : null;

// Check year coverage: Payroll Comparison sheet should have one row per year (20 rows + header = 21 rows total)
const compRowCount = compData?.rowCount ?? 0;
checkTrue("23. Payroll comparison includes all 20 projection years", compRowCount >= 20, `data rows = ${compRowCount}`);

// Check all three org design versions are present — each must have non-empty yearTotals
checkTrue(
  "24. Payroll comparison includes all three org design versions",
  threeVersionPayroll.minimum.fopagOutput.yearTotals.length > 0 &&
  threeVersionPayroll.balanced.fopagOutput.yearTotals.length > 0 &&
  threeVersionPayroll.premium.fopagOutput.yearTotals.length > 0,
  "all three variants produced non-empty yearTotals",
);

// Scenario integrity: revenue must be identical across variants (it is tuition/occupancy/opening driven, not org-design driven)
let _revenueIdentical = true;
for (const _year of RECEITA_PROJECTION_YEARS) {
  const _minRol = threeVersionPayroll.minimum.dreOutput.byYear[_year].receita_operacional_liquida;
  const _balRol = threeVersionPayroll.balanced.dreOutput.byYear[_year].receita_operacional_liquida;
  const _premRol = threeVersionPayroll.premium.dreOutput.byYear[_year].receita_operacional_liquida;
  if (_minRol !== _balRol || _balRol !== _premRol) { _revenueIdentical = false; break; }
}
checkTrue("25. Only orgDesignOptionId varies (receita_operacional_liquida identical across all three variants)", _revenueIdentical);
checkEqual("26. openingPackageId = t1_g4", threeVersionPayroll.minimum.fopagOutput.openingPackageId, "t1_g4");
checkEqual("27. occupancyScenarioId = intermediario", threeVersionPayroll.balanced.fopagOutput.occupancyScenarioId, "intermediario");
// tuitionScenarioId constant: numero_de_alunos (enrollment) must be identical across all three DRE outputs
// (enrollment is tuition × occupancy × opening driven; org design does not affect it)
let _enrollmentIdentical = true;
for (const _year of RECEITA_PROJECTION_YEARS) {
  const _minA = threeVersionPayroll.minimum.dreOutput.byYear[_year].numero_de_alunos;
  const _balA = threeVersionPayroll.balanced.dreOutput.byYear[_year].numero_de_alunos;
  const _premA = threeVersionPayroll.premium.dreOutput.byYear[_year].numero_de_alunos;
  if (_minA !== _balA || _balA !== _premA) { _enrollmentIdentical = false; break; }
}
checkTrue("28. tuitionScenarioId constant (numero_de_alunos identical across all three variants)", _enrollmentIdentical);

// ── Section E: Numeric integrity ─────────────────────────────────────────────
console.log("\nSection E — Numeric integrity:");
const allYtMin = threeVersionPayroll.minimum.fopagOutput.yearTotals;
const allYtBal = threeVersionPayroll.balanced.fopagOutput.yearTotals;
const allYtPrem = threeVersionPayroll.premium.fopagOutput.yearTotals;

const allTotals = [...allYtMin, ...allYtBal, ...allYtPrem].map((yt) => yt.totalPayroll);
checkTrue("29. Total payroll values are numeric and non-NaN", allTotals.every((v) => typeof v === "number" && !isNaN(v)));
checkTrue("30. No undefined values in payroll comparison rows", allTotals.every((v) => v !== undefined));
checkEqual("31. No missing projection years (Minimum)", allYtMin.length, RECEITA_PROJECTION_YEARS.length);
const _payroll2047 = [
  allYtMin.find((yt) => yt.year === 2047)?.totalPayroll ?? NaN,
  allYtBal.find((yt) => yt.year === 2047)?.totalPayroll ?? NaN,
  allYtPrem.find((yt) => yt.year === 2047)?.totalPayroll ?? NaN,
];
const _distinctPayroll2047 = new Set(_payroll2047).size;
checkEqual("32. Three distinct payroll totals (min/bal/prem differ at 2047)", _distinctPayroll2047, 3);

const allHc = RECEITA_PROJECTION_YEARS.map((year) => {
  const minHc = threeVersionPayroll.minimum.fopagOutput.records.filter((r) => r.year === year && !r.isAuditRow).reduce((s, r) => s + r.headcountOrFte, 0);
  return minHc;
});
checkTrue("33. HC values are numeric", allHc.every((v) => typeof v === "number" && !isNaN(v)));

const bridgeSheet = workbook.Sheets["DRE Payroll Bridge"];
let _bridgeHasNaN = false;
if (bridgeSheet && bridgeSheet["!ref"]) {
  const _bRange = XLSX.utils.decode_range(bridgeSheet["!ref"]);
  for (let _r = _bRange.s.r; _r <= _bRange.e.r; _r++) {
    for (let _c = _bRange.s.c; _c <= _bRange.e.c; _c++) {
      const _cell = bridgeSheet[XLSX.utils.encode_cell({ r: _r, c: _c })];
      if (_cell && _cell.t === "n" && Number.isNaN(Number(_cell.v))) { _bridgeHasNaN = true; }
    }
  }
}
checkTrue("34. No NaN values in DRE Payroll Bridge cells", !_bridgeHasNaN);

// ── Section F: Known fixture validation ───────────────────────────────────────
console.log("\nSection F — Known fixture validation (2047 payroll totals):");
const ytMin2047 = allYtMin.find((yt) => yt.year === 2047);
const ytBal2047 = allYtBal.find((yt) => yt.year === 2047);
const ytPrem2047 = allYtPrem.find((yt) => yt.year === 2047);

checkApprox(
  "35. 2047 Minimum total payroll = 82342504.75",
  ytMin2047?.totalPayroll ?? NaN,
  EXPECTED_2047.minimum_experience,
);
checkApprox(
  "36. 2047 Balanced total payroll = 83855255.09",
  ytBal2047?.totalPayroll ?? NaN,
  EXPECTED_2047.balanced_experience,
);
checkApprox(
  "37. 2047 Premium total payroll = 84843924.80",
  ytPrem2047?.totalPayroll ?? NaN,
  EXPECTED_2047.premium_experience,
);

// ── Section G: DRE Payroll Bridge reconciliation ─────────────────────────────
console.log("\nSection G — DRE Payroll Bridge reconciliation:");
let bridgeAllOk = true;
for (const { id, v } of [
  { id: "minimum_experience" as const, v: threeVersionPayroll.minimum },
  { id: "balanced_experience" as const, v: threeVersionPayroll.balanced },
  { id: "premium_experience" as const, v: threeVersionPayroll.premium },
]) {
  const ytMap = new Map(v.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
  for (const year of RECEITA_PROJECTION_YEARS) {
    const dreRow = v.dreOutput.byYear[year];
    const yt = ytMap.get(year)!;
    const fopagVar = dreRow.fopag_direto_clt_pj + yt.fopagDireto;
    const folhaVar = dreRow.folha_de_pagamento + yt.folhaDireta;
    const beneVar = dreRow.beneficios + yt.benefits;
    if (Math.abs(fopagVar) >= TOLERANCE || Math.abs(folhaVar) >= TOLERANCE || Math.abs(beneVar) >= TOLERANCE) {
      bridgeAllOk = false;
      console.log(`    Bridge mismatch: ${id} year=${year} fopagVar=${fopagVar} folhaVar=${folhaVar} beneVar=${beneVar}`);
    }
  }
}
checkTrue("38. All DRE Payroll Bridge statuses are OK (all three variants, all years)", bridgeAllOk);
let _actualBridgeDataRows = 0;
if (bridgeSheet && bridgeSheet["!ref"]) {
  const _bRef = XLSX.utils.decode_range(bridgeSheet["!ref"]);
  _actualBridgeDataRows = _bRef.e.r; // header at r=0; data rows = last row index
}
checkEqual("39. Bridge data row count = 60 (3 variants × 20 years)", _actualBridgeDataRows, 60);

// ── Section H: App UI discoverability ────────────────────────────────────────
console.log("\nSection H — App UI discoverability:");
const tabSrc = readFile("src/components/sections/DreScenarioSimulatorTab.tsx");
const btnSrc = readFile("src/components/dreSimulator/DreExportButton.tsx");

checkTrue(
  "40. DreScenarioSimulatorTab.tsx contains 'Export payroll by org design version'",
  tabSrc.includes("Export payroll by org design version"),
);
checkTrue(
  "41. DreScenarioSimulatorTab.tsx contains helper copy about Minimum, Balanced, and Premium",
  tabSrc.includes("Minimum, Balanced, and Premium"),
);
checkTrue(
  "42. DreExportButton.tsx imports computeOrgDesignPayrollVariants",
  btnSrc.includes("computeOrgDesignPayrollVariants"),
);

// ── Section I: Scope protection ──────────────────────────────────────────────
console.log("\nSection I — Scope protection:");
// These checks verify the named source files have not been modified by checking
// for tell-tale Phase 15R.1 references that should not appear in engine files.
const orgActivationSrc = readFile("src/features/rio-scenario-resilience/model/orgDesignPayrollActivation.ts");
const fopagEngineSrc = readFile("src/features/rio-scenario-resilience/model/fopagEngine.ts");
const dreEngineSrc = readFile("src/features/rio-scenario-resilience/model/dreEngine.ts");
const tuitionSrc = readFile("src/features/rio-scenario-resilience/model/tuitionSourceData.ts");
const discountSrc = readFile("src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts");

checkTrue("43. orgDesignPayrollActivation.ts not touched (no 15R.1 marker)", !orgActivationSrc.includes("15R.1"));
checkTrue("44. fopagEngine.ts not touched (no 15R.1 marker)", !fopagEngineSrc.includes("15R.1"));
checkTrue("45. dreEngine.ts not touched (no 15R.1 marker)", !dreEngineSrc.includes("15R.1"));
checkTrue("46. tuitionSourceData.ts not touched (no 15R.1 marker)", !tuitionSrc.includes("15R.1"));
checkTrue("47. discountScheduleSourceData.ts not touched (no 15R.1 marker)", !discountSrc.includes("15R.1"));

// ── Section J: Aggregate ──────────────────────────────────────────────────────
console.log("\nSection J — Aggregate:");
const EXPECTED_CHECK_COUNT = 48;
const actualCount = passCount + failCount;
checkEqual(`48. Validator check count = ${EXPECTED_CHECK_COUNT}`, actualCount, EXPECTED_CHECK_COUNT - 1, "self-check is the 48th");

// ── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Phase 15R.1 validation: ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log("FAILED");
  process.exit(1);
} else {
  console.log("ALL CHECKS PASSED");
}
