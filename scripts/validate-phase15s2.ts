// Phase 15S.2 — Scenario B T1_G4 Finance Workbook Source Correction (53 checks).
//
// Validates:
//   A. Per-grade enrollment (checks 1–13)
//   B. Capacity and occupancy (checks 14–22)
//   C. OfferScenariosTab UI (checks 23–25)
//   D. DRE workbook README (checks 26–27)
//   E. DRE engine and workbook output (checks 28–29)
//   F. G4 integrity (checks 30–37)
//   G. Registrar / Secretary labels (checks 38–39)
//   H. Unsupported-package boundary (check 40)
//   I. Protected-file scope (checks 41–47)
//   J. Section-count regression proof (checks 48–53)
//
// Run with: npx tsx scripts/validate-phase15s2.ts

import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { buildPayrollAdapterInput } from "../src/features/rio-scenario-resilience/model/payrollAdapter";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import { buildExecutiveOrgDesignTree } from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";
import {
  OPENING_PACKAGE_AVAILABLE_CAPACITY_BY_YEAR,
  OPENING_PACKAGE_TOTAL_ENROLLMENT_VALIDATION,
  OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  OPENING_PACKAGE_OCCUPANCY_RATE_RECORDS,
  OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS,
  OPENING_PACKAGE_STUDENTS_PER_CLASS,
  OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData";
import { GRADE_DIVISION_MAP } from "../src/features/rio-scenario-resilience/model/revenueInputs";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { EXECUTIVE_ORG_SCENARIOS } from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const FIXTURE: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};

const CANONICAL_T1G3: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};

const TOLERANCE = 1e-6;
const ORG_DESIGN_IDS: readonly DreWorkingScenarioOrgDesignOptionId[] = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function readSrc(path: string): string {
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
  const ok = Object.is(actual, expected);
  if (ok) {
    passCount++;
    console.log(`  ✓ ${label}${note ? ` — ${note}` : ""}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label} — expected ${String(expected)}, got ${String(actual)}${note ? ` (${note})` : ""}`);
  }
}

// ── Build test artifacts ──────────────────────────────────────────────────────
const dreOutput = calculateDre(FIXTURE);
const fopagOutput = calculateFopag({
  openingPackageId: FIXTURE.openingPackageId,
  occupancyScenarioId: FIXTURE.occupancyScenarioId,
  orgDesignOptionId: FIXTURE.orgDesignOptionId,
});
const threeVersionPayroll = computeOrgDesignPayrollVariants(FIXTURE, dreOutput, fopagOutput);
const LAST_YEAR = RECEITA_PROJECTION_YEARS[RECEITA_PROJECTION_YEARS.length - 1];
const orgDesignSensitivity = ORG_DESIGN_IDS.map((orgDesignOptionId) => {
  const out = orgDesignOptionId === FIXTURE.orgDesignOptionId
    ? dreOutput
    : calculateDre({ ...FIXTURE, orgDesignOptionId });
  const lyr = out.byYear[LAST_YEAR];
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((y) => out.byYear[y].ebitda > 0) ?? null;
  return {
    orgDesignOptionId,
    isSelected: orgDesignOptionId === FIXTURE.orgDesignOptionId,
    executiveScenario: EXECUTIVE_ORG_SCENARIOS.find(
      (s) => s.id === (orgDesignOptionId === "minimum_experience" ? "minimum" : orgDesignOptionId === "balanced_experience" ? "balanced" : "premium"),
    ) ?? null,
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
  selections: FIXTURE,
  defaultSelections: FIXTURE,
  dreOutput,
  fopagOutput,
  payrollReconciliation,
  orgDesignSensitivity,
  exportedAt: new Date("2026-07-02T00:00:00.000Z"),
  threeVersionPayroll,
});

const sectionOutput = calculateSectionCountsForScenario({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
});

const payrollOutput = buildPayrollAdapterInput({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  orgDesignOptionId: "balanced_experience",
});

const hcTable = buildOrgDesignHcTable({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  orgDesignOptionId: "balanced_experience",
  year: 2028,
});

// ── Workbook sheet reader ─────────────────────────────────────────────────────
function decodeCell(addr: string): { r: number; c: number } {
  const col = addr.replace(/[0-9]/g, "");
  const row = parseInt(addr.replace(/[A-Z]/gi, ""), 10) - 1;
  let c = 0;
  for (let i = 0; i < col.length; i++) {
    c = c * 26 + col.toUpperCase().charCodeAt(i) - 64;
  }
  return { r: row, c: c - 1 };
}
function encodeCell(r: number, c: number): string {
  let col = "";
  let n = c + 1;
  while (n > 0) {
    col = String.fromCharCode(((n - 1) % 26) + 65) + col;
    n = Math.floor((n - 1) / 26);
  }
  return `${col}${r + 1}`;
}
function sheetToRows(sheetName: string): (string | number | boolean | null)[][] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet["!ref"]) return [];
  const range = decodeCell(sheet["!ref"].split(":")[1] ?? sheet["!ref"]);
  const start = decodeCell(sheet["!ref"].split(":")[0]);
  const rows: (string | number | boolean | null)[][] = [];
  for (let r = start.r; r <= range.r; r++) {
    const row: (string | number | boolean | null)[] = [];
    for (let c = start.c; c <= range.c; c++) {
      const cell = sheet[encodeCell(r, c)];
      row.push(cell ? (cell.v ?? null) : null);
    }
    rows.push(row);
  }
  return rows;
}

// ── Source data lookups ───────────────────────────────────────────────────────
const GRADE_RECS = OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.filter(
  (r) => r.packageId === "t1_g4" && r.scenarioId === "base" && r.year === 2028 && r.enrollment !== null,
);
const totalEnrollmentRec = OPENING_PACKAGE_TOTAL_ENROLLMENT_VALIDATION.find(
  (r) => r.packageId === "t1_g4" && r.scenarioId === "base" && r.year === 2028,
);
const capacityRec = OPENING_PACKAGE_AVAILABLE_CAPACITY_BY_YEAR.find(
  (r) => r.packageId === "t1_g4" && r.year === 2028,
);

const gradeEnrollment = (gradeId: string): number | null => {
  const rec = GRADE_RECS.find(
    (r) => String(r.normalizedGradeId).toLowerCase() === gradeId,
  );
  return rec ? rec.enrollment : null;
};

const gradeOccupancy = (gradeId: string): number | null => {
  const rec = OPENING_PACKAGE_OCCUPANCY_RATE_RECORDS.find(
    (r) =>
      r.packageId === "t1_g4" &&
      r.scenarioId === "base" &&
      r.year === 2028 &&
      String(r.normalizedGradeId).toLowerCase() === gradeId,
  );
  return rec?.occupancyRate ?? null;
};

const sectionFor = (gradeId: string): number => {
  const rec = sectionOutput.records.find(
    (r) => r.year === 2028 && r.gradeId === gradeId,
  );
  return rec?.sectionCount ?? -1;
};

const payrollHcFor = (year: number, rolePrefix: string): number => {
  const rec = payrollOutput.records.find(
    (r) => r.year === year && r.roleId === rolePrefix,
  );
  return rec?.headcountOrFte ?? 0;
};

// ── Section A: Per-grade enrollment ──────────────────────────────────────────
console.log("\n=== Phase 15S.2 Validation (47 checks) ===\n");
console.log("Section A — Per-grade enrollment (workbook source):");

const perGradeSum = GRADE_RECS.reduce((sum, r) => sum + (r.enrollment ?? 0), 0);

checkEqual(" 1. t1_g4 / base / 2028 total enrollment = 258",
  totalEnrollmentRec?.totalEnrollment ?? null, 258);

checkEqual(" 2. t1_g4 / 2028 available capacity = 348",
  capacityRec?.availableCapacity ?? null, 348);

const packageOccupancy = (totalEnrollmentRec?.totalEnrollment ?? 0) / (capacityRec?.availableCapacity ?? 1);
checkTrue(
  " 3. Package-level occupancy = 258 / 348 within tolerance",
  Math.abs(packageOccupancy - 258 / 348) < TOLERANCE,
  `actual: ${packageOccupancy.toFixed(10)}, expected: ${(258 / 348).toFixed(10)}`,
);

checkEqual(" 4. T1 enrollment = 16", gradeEnrollment("t1"), 16);
checkEqual(" 5. T2 enrollment = 16", gradeEnrollment("t2"), 16);
checkEqual(" 6. PK3 enrollment = 28", gradeEnrollment("pk3"), 28);
checkEqual(" 7. PK4 enrollment = 32", gradeEnrollment("pk4"), 32);
checkEqual(" 8. Kindergarten enrollment = 36", gradeEnrollment("kindergarten"), 36);
checkEqual(" 9. G1 enrollment = 40", gradeEnrollment("g1"), 40);
checkEqual("10. G2 enrollment = 36", gradeEnrollment("g2"), 36);
checkEqual("11. G3 enrollment = 32", gradeEnrollment("g3"), 32);
checkEqual("12. G4 enrollment = 22", gradeEnrollment("g4"), 22);

checkEqual(
  "13. Per-grade enrollment sum = 258",
  perGradeSum, 258,
  `actual sum: ${perGradeSum}`,
);

// ── Section B: Per-grade occupancy ────────────────────────────────────────────
console.log("\nSection B — Per-grade occupancy rates (workbook source):");

function checkOccupancy(id: number, gradeLabel: string, gradeId: string, num: number, den: number): void {
  const expected = num / den;
  const actual = gradeOccupancy(gradeId);
  checkTrue(
    `${String(id).padStart(2, " ")}. ${gradeLabel} occupancy = ${num}/${den}`,
    actual !== null && Math.abs(actual - expected) < TOLERANCE,
    `actual: ${actual?.toFixed(10) ?? "null"}, expected: ${expected.toFixed(10)}`,
  );
}

checkOccupancy(14, "T1", "t1", 16, 28);
checkOccupancy(15, "T2", "t2", 16, 28);
checkOccupancy(16, "PK3", "pk3", 28, 36);
checkOccupancy(17, "PK4", "pk4", 32, 36);
checkOccupancy(18, "Kindergarten", "kindergarten", 36, 40);
checkOccupancy(19, "G1", "g1", 40, 44);
checkOccupancy(20, "G2", "g2", 36, 44);
checkOccupancy(21, "G3", "g3", 32, 44);
checkOccupancy(22, "G4", "g4", 22, 48);

// ── Section C: OfferScenariosTab UI ──────────────────────────────────────────
console.log("\nSection C — OfferScenariosTab UI:");

const offerTab = readSrc("src/components/sections/OfferScenariosTab.tsx");

checkTrue(
  "23. OfferScenariosTab Scenario B modeledCapacity = '348 learners'",
  offerTab.includes('modeledCapacity: "348 learners"'),
);
checkTrue(
  "24. OfferScenariosTab Scenario B impliedOccupancy = '74.1%'",
  offerTab.includes('impliedOccupancy: "74.1%"'),
);
checkTrue(
  "25. No board-facing Scenario B copy still says 358",
  !offerTab.includes('"358"') && !offerTab.includes('"358 learners"') && !offerTab.includes("72.1%"),
  offerTab.includes("358") ? "FAIL: '358' still present in OfferScenariosTab" : "clean",
);

// ── Section D: DRE workbook README ────────────────────────────────────────────
console.log("\nSection D — DRE workbook README:");

const readmeRows = sheetToRows("README");
const readmeFlat = readmeRows.map((row) => row.filter(Boolean).join(" ")).join("\n");

checkTrue(
  "26. DRE workbook README no longer says capacity is 358",
  !readmeFlat.includes("358"),
  readmeFlat.includes("358") ? "FAIL: README still contains 358" : "clean",
);
checkTrue(
  "27. DRE workbook README includes 258, 348, and 74.1%",
  readmeFlat.includes("258") && readmeFlat.includes("348") && readmeFlat.includes("74.1%"),
  `258:${readmeFlat.includes("258")} 348:${readmeFlat.includes("348")} 74.1%:${readmeFlat.includes("74.1%")}`,
);

// ── Section E: DRE engine and workbook output ─────────────────────────────────
console.log("\nSection E — DRE engine and workbook output:");

checkEqual(
  "28. calculateDre t1_g4 / base / 2028 numero_de_alunos = 258",
  dreOutput.byYear[2028].numero_de_alunos,
  258,
);

const enrollmentRows = sheetToRows("Enrollment");
const row2028 = enrollmentRows.find((row) => row[0] === 2028);
const wbEnrollment2028 = row2028 ? row2028[1] : null;
checkEqual(
  "29. DRE workbook Enrollment sheet: Número de Alunos 2028 = 258",
  wbEnrollment2028,
  258,
);

// ── Section F: G4 integrity ───────────────────────────────────────────────────
console.log("\nSection F — G4 integrity:");

const g4ActiveRec = OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS.find(
  (r) => r.packageId === "t1_g4" && r.year === 2028 && String(r.normalizedGradeId).toLowerCase() === "g4",
);
checkTrue(
  "30. G4 is active in t1_g4 / 2028",
  g4ActiveRec?.activeStatus === "active",
  `activeStatus: ${g4ActiveRec?.activeStatus ?? "not found"}`,
);

const g4Division = GRADE_DIVISION_MAP["g4" as keyof typeof GRADE_DIVISION_MAP];
checkTrue(
  "31. G4 is mapped to Lower School (division = 'ls')",
  g4Division === "ls",
  `actual: ${g4Division}`,
);

checkEqual(
  "32. G4 sections = 2 (sectionCountEngine 2028)",
  sectionFor("g4"),
  2,
  `formulaBasis: ${sectionOutput.records.find((r) => r.year === 2028 && r.gradeId === "g4")?.formulaBasis}`,
);

checkEqual(
  "33. G4 Reference Educators = 2 (payrollAdapter 2028)",
  payrollHcFor(2028, "ls_teaching_lead_g4"),
  2,
);

checkEqual(
  "34. G4 Assistants = 2 (payrollAdapter 2028)",
  payrollHcFor(2028, "ls_learning_assistant_g4"),
  2,
);

const g4MonitorHc = payrollHcFor(2028, "ey_learning_monitor_g4");
checkTrue(
  "35. G4 monitor = 0 (LS has no monitor)",
  g4MonitorHc === 0,
  `actual: ${g4MonitorHc}`,
);

const g4TeachRow = hcTable.rows.find((r) => r.role === "Grade 4 Reference Educator");
const g4AssiRow = hcTable.rows.find((r) => r.role === "Grade 4 Assistant");

checkTrue(
  "36. Phase 15T HC table: Grade 4 Reference Educator HC = 2",
  g4TeachRow?.headcountOrFte === 2,
  `actual: ${g4TeachRow?.headcountOrFte ?? "not found"}`,
);
checkTrue(
  "37. Phase 15T HC table: Grade 4 Assistant HC = 2",
  g4AssiRow?.headcountOrFte === 2,
  `actual: ${g4AssiRow?.headcountOrFte ?? "not found"}`,
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

checkTrue(
  "38. Registrar remains present in Balanced/2028 org tree",
  findLabelInTree(tree.root as { label: string; children?: unknown[] }, "Registrar"),
);
checkTrue(
  "39. Secretary does not reappear as board-facing label in Balanced/2028 org tree",
  !findLabelInTree(tree.root as { label: string; children?: unknown[] }, "Secretary"),
);

// ── Section H: Unsupported-package boundary ─────────────────────────────────
console.log("\nSection H — Unsupported-package boundary:");

let t1g3Rejected = false;
try {
  calculateDre(CANONICAL_T1G3);
} catch {
  t1g3Rejected = true;
}
checkTrue(
  "40. t1_g3 / base is rejected before DRE calculation under governed V10-E1 package support",
  t1g3Rejected,
);

// ── Section I: Protected-file scope ──────────────────────────────────────────
console.log("\nSection I — Protected-file scope (no Phase 15S.2 marker):");

const PROTECTED: Array<[string, string]> = [
  ["41. Tuition (tuitionSourceData.ts)", "src/features/rio-scenario-resilience/model/tuitionSourceData.ts"],
  ["42. Discount (discountScheduleSourceData.ts)", "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts"],
  ["43. CAPEX (capexScheduleEngine.ts)", "src/features/rio-scenario-resilience/model/capexScheduleEngine.ts"],
  ["44. Service Contracts (dreAnnualAssumptionSourceData.ts)", "src/features/rio-scenario-resilience/model/dreAnnualAssumptionSourceData.ts"],
  ["45. DRE formula engine (dreEngine.ts)", "src/features/rio-scenario-resilience/model/dreEngine.ts"],
  ["46. FOPAG engine (fopagEngine.ts)", "src/features/rio-scenario-resilience/model/fopagEngine.ts"],
  ["47. Payroll adapter formula logic (payrollAdapter.ts)", "src/features/rio-scenario-resilience/model/payrollAdapter.ts"],
];

for (const [label, path] of PROTECTED) {
  const src = readSrc(path);
  checkTrue(
    label,
    !src.includes("Phase 15S.2") && !src.includes("phase15s2"),
    src.includes("Phase 15S.2") ? `FAIL: ${path} contains Phase 15S.2 marker` : "clean",
  );
}

// ── Section J: Section-count regression proof ────────────────────────────────
console.log("\nSection J — Section-count regression proof (committedSectionsLookup does not alter unrelated scenarios):");

// Verify the committed-sections table has exactly 1 record, scoped to t1_g4/2028/G4.
const capRecordCount = OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.length;
checkEqual(
  "48. OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS has exactly 1 record",
  capRecordCount,
  1,
  `actual length: ${capRecordCount}`,
);

const capRec0 = OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS[0];
checkTrue(
  "49. Committed-sections record targets packageId=t1_g4, year=2028, normalizedGradeId=G4, sections=2",
  capRec0?.packageId === "t1_g4" &&
    capRec0?.year === 2028 &&
    String(capRec0?.normalizedGradeId).toUpperCase() === "G4" &&
    capRec0?.sections === 2,
  `packageId=${capRec0?.packageId} year=${capRec0?.year} grade=${capRec0?.normalizedGradeId} sections=${capRec0?.sections}`,
);

// Check formulaBasis for t1_g4/base/2028/G4 indicates committed-sections path.
const g4IntermRec = sectionOutput.records.find((r) => r.year === 2028 && r.gradeId === "g4");
checkTrue(
  "50. t1_g4/base/2028/G4 formulaBasis indicates committed-sections override",
  (g4IntermRec?.formulaBasis ?? "").includes("committed"),
  `formulaBasis: ${g4IntermRec?.formulaBasis ?? "not found"}`,
);

// Pessimista: enrollment=20, ceil(20/24)=1, but committed record lifts to 2.
const sectionOutputPessimista = calculateSectionCountsForScenario({
  openingPackageId: "t1_g6",
  occupancyScenarioId: "conservador",
});
const g4PessRec = sectionOutputPessimista.records.find((r) => r.year === 2028 && r.gradeId === "g4");
checkEqual(
  "51. t1_g6/conservador/2028/G4 sections = 2",
  g4PessRec?.sectionCount ?? -1,
  2,
  `formulaBasis: ${g4PessRec?.formulaBasis ?? "not found"}`,
);

// Otimista: enrollment=28, ceil(28/24)=2, same as committed — no regression.
const sectionOutputOtimista = calculateSectionCountsForScenario({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "otimista",
});
const g4OtimRec = sectionOutputOtimista.records.find((r) => r.year === 2028 && r.gradeId === "g4");
checkEqual(
  "52. t1_g4/otimista/2028/G4 sections = 2 (enrollment=28, ceil=2, committed=2, no change)",
  g4OtimRec?.sectionCount ?? -1,
  2,
  `formulaBasis: ${g4OtimRec?.formulaBasis ?? "not found"}`,
);

// t1_g6: committed-sections lookup is scoped by package/year/grade.
// G3 in t1_g6/base/2028 should derive sections from enrollment only.
const sectionOutputT1G6 = calculateSectionCountsForScenario({
  openingPackageId: "t1_g6",
  occupancyScenarioId: "base",
});
const g3T1G6Rec = sectionOutputT1G6.records.find((r) => r.year === 2028 && r.gradeId === "g3");
checkTrue(
  "53. t1_g6/base/2028/G3 formulaBasis does not reference committed record",
  !(g3T1G6Rec?.formulaBasis ?? "").includes("committed"),
  `formulaBasis: ${g3T1G6Rec?.formulaBasis ?? "not found"}`,
);

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Phase 15S.2: ${passCount} passed, ${failCount} failed (53 checks total)`);
if (failCount > 0) {
  console.log("\nFailed checks:");
  process.exit(1);
} else {
  console.log("\nAll 53 checks passed. Phase 15S.2 validated.");
}
