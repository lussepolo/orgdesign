// Phase 15S.1 — Legacy Supersession Validator (39 checks).
//
// Phase 15S.1 set a conservative interim per-grade allocation for t1_g4 / intermediario / 2028
// (enrollment split 20/20/30/30/35/34/29/30/30, capacity 358, occupancy 72.1%).
// Phase 15S.2 superseded those interim values with Finance workbook source values
// (16/16/28/32/36/40/36/32/22, capacity 348, occupancy 74.1%).
//
// This validator now confirms that Phase 15S.2 supersession is in place.
// It does NOT assert the old Phase 15S.1 interim values.
//
// Validates:
//   A. Phase 15S.2 enrollment totals and per-grade distribution (checks 1–11)
//   B. Phase 15S.2 capacity, occupancy, and supersession confirmation (checks 12–15)
//   C. G4 staffing integrity (checks 16–21)
//   D. Sibling-grade section integrity (checks 22–25)
//   E. DRE engine and workbook output (checks 26–28)
//   F. OfferScenariosTab UI alignment with Phase 15S.2 values (checks 29–31)
//   G. Canonical t1_g3 fixture unchanged (check 32)
//   H. Protected-file scope (checks 33–39)
//
// Run with: npx tsx scripts/validate-phase15s1.ts

import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { buildPayrollAdapterInput } from "../src/features/rio-scenario-resilience/model/payrollAdapter";
import {
  OPENING_PACKAGE_AVAILABLE_CAPACITY_BY_YEAR,
  OPENING_PACKAGE_TOTAL_ENROLLMENT_VALIDATION,
  OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  OPENING_PACKAGE_STUDENTS_PER_CLASS,
  OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData";
import { GRADE_DIVISION_MAP } from "../src/features/rio-scenario-resilience/model/revenueInputs";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { EXECUTIVE_ORG_SCENARIOS } from "../src/features/rio-scenario-resilience/model/executiveOrgDesignModel";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { FopagEngineOutput } from "../src/features/rio-scenario-resilience/model/fopagEngineContract";

// ── Fixture ───────────────────────────────────────────────────────────────────
const FIXTURE: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};

const CANONICAL_T1G3: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
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
  occupancyScenarioId: "intermediario",
});
const payrollOutput = buildPayrollAdapterInput({
  openingPackageId: "t1_g4",
  occupancyScenarioId: "intermediario",
  orgDesignOptionId: "balanced_experience",
});

// ── Workbook helpers ──────────────────────────────────────────────────────────
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

// ── Source data lookups ───────────────────────────────────────────────────────
const GRADE_RECS_T1G4_INTERMEDIARIO_2028 = OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.filter(
  (r) => r.packageId === "t1_g4" && r.scenarioId === "intermediario" && r.year === 2028 && r.enrollment !== null,
);
const totalEnrollmentRec = OPENING_PACKAGE_TOTAL_ENROLLMENT_VALIDATION.find(
  (r) => r.packageId === "t1_g4" && r.scenarioId === "intermediario" && r.year === 2028,
);
const capacityRec = OPENING_PACKAGE_AVAILABLE_CAPACITY_BY_YEAR.find(
  (r) => r.packageId === "t1_g4" && r.year === 2028,
);
const gradeEnrollment = (gradeId: string): number | null => {
  const rec = GRADE_RECS_T1G4_INTERMEDIARIO_2028.find(
    (r) => String(r.normalizedGradeId).toLowerCase() === gradeId,
  );
  return rec ? rec.enrollment : null;
};
const spcFor = (gradeId: string): number | null => {
  const rec = OPENING_PACKAGE_STUDENTS_PER_CLASS.find(
    (r) => String(r.normalizedGradeId).toLowerCase() === gradeId,
  );
  return rec?.studentsPerClass ?? null;
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

// ── Section A: Enrollment totals and per-grade distribution ───────────────────
console.log("\n=== Phase 15S.1 Legacy Supersession Validation (39 checks) ===\n");
console.log("Section A — Per-grade enrollment (Phase 15S.2 workbook values supersede Phase 15S.1 interim):");

checkEqual(
  " 1. t1_g4 / intermediario / 2028 total enrollment record = 258",
  totalEnrollmentRec?.totalEnrollment ?? null,
  258,
);

const perGradeSum = GRADE_RECS_T1G4_INTERMEDIARIO_2028.reduce(
  (sum, r) => sum + (r.enrollment ?? 0),
  0,
);
checkEqual(
  " 2. Per-grade enrollment records sum to 258",
  perGradeSum,
  258,
  `actual sum: ${perGradeSum}`,
);

// Phase 15S.1 interim was 20/20/30/30/35/34/29/30/30.
// Phase 15S.2 replaced with Finance workbook source: 16/16/28/32/36/40/36/32/22.
checkEqual(" 3. T1 enrollment = 16 (Phase 15S.2 workbook)", gradeEnrollment("t1"), 16);
checkEqual(" 4. T2 enrollment = 16 (Phase 15S.2 workbook)", gradeEnrollment("t2"), 16);
checkEqual(" 5. PK3 enrollment = 28 (Phase 15S.2 workbook)", gradeEnrollment("pk3"), 28);
checkEqual(" 6. PK4 enrollment = 32 (Phase 15S.2 workbook)", gradeEnrollment("pk4"), 32);
checkEqual(" 7. Kindergarten enrollment = 36 (Phase 15S.2 workbook)", gradeEnrollment("kindergarten"), 36);
checkEqual(" 8. G1 enrollment = 40 (Phase 15S.2 workbook)", gradeEnrollment("g1"), 40);
checkEqual(" 9. G2 enrollment = 36 (Phase 15S.2 workbook)", gradeEnrollment("g2"), 36);
checkEqual("10. G3 enrollment = 32 (Phase 15S.2 workbook)", gradeEnrollment("g3"), 32);
checkEqual("11. G4 enrollment = 22 (Phase 15S.2 workbook)", gradeEnrollment("g4"), 22);

// ── Section B: Capacity, occupancy, pending-decomposition note ────────────────
console.log("\nSection B — Capacity, occupancy, and interim-allocation notes:");

checkEqual(
  "12. t1_g4 / 2028 package-level available capacity = 348 (Phase 15S.2 workbook)",
  capacityRec?.availableCapacity ?? null,
  348,
);

const packageOccupancy = (totalEnrollmentRec?.totalEnrollment ?? 0) / (capacityRec?.availableCapacity ?? 1);
checkTrue(
  "13. Package-level occupancy = 258 / 348 within tolerance",
  Math.abs(packageOccupancy - 258 / 348) < TOLERANCE,
  `actual: ${packageOccupancy.toFixed(10)}, expected: ${(258 / 348).toFixed(10)}`,
);

// Check 14: confirm Phase 15S.2 supersession is active (capacity 348, not 358).
checkTrue(
  "14. Phase 15S.2 supersession confirmed: availableCapacity is 348, not the Phase 15S.1 interim 358",
  (capacityRec?.availableCapacity ?? 0) === 348,
  `capacityRec.availableCapacity = ${capacityRec?.availableCapacity ?? "not found"}`,
);

const g4Spc = spcFor("g4");
checkEqual(
  "15. Global G4 students-per-class = 24 (unchanged)",
  g4Spc,
  24,
  "OPENING_PACKAGE_STUDENTS_PER_CLASS G4 must not be modified",
);

// ── Section C: G4 staffing integrity ─────────────────────────────────────────
console.log("\nSection C — G4 staffing integrity:");

const g4ActiveRec = OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS.find(
  (r) => r.packageId === "t1_g4" && r.year === 2028 && String(r.normalizedGradeId).toLowerCase() === "g4",
);
checkTrue(
  "16. G4 is active in t1_g4 / 2028",
  g4ActiveRec?.activeStatus === "active",
  `activeStatus: ${g4ActiveRec?.activeStatus ?? "not found"}`,
);

checkTrue(
  "17. G4 is mapped to Lower School (division = 'ls')",
  GRADE_DIVISION_MAP["g4"] === "ls",
  `GRADE_DIVISION_MAP.g4 = ${GRADE_DIVISION_MAP["g4"]}`,
);

checkEqual(
  "18. G4 sections = 2 (sectionCountEngine 2028)",
  sectionFor("g4"),
  2,
  `enrollment=22, studentsPerClass=24, ceil(22/24)=1 raw, lifted to 2 via committedSectionsLookup`,
);

const g4LeadHc = payrollHcFor(2028, "ls_teaching_lead_g4");
checkEqual(
  "19. G4 Reference Educators = 2 (ls_teaching_lead_g4 headcount 2028)",
  g4LeadHc,
  2,
);

const g4AssistHc = payrollHcFor(2028, "ls_learning_assistant_g4");
checkEqual(
  "20. G4 Assistants = 2 (ls_learning_assistant_g4 headcount 2028)",
  g4AssistHc,
  2,
);

const g4MonitorRec = payrollOutput.records.find(
  (r) => r.year === 2028 && r.roleId === "ey_learning_monitor_g4",
);
checkEqual(
  "21. G4 monitor = 0 (no ey_learning_monitor_g4 record for 2028; LS has no monitor)",
  g4MonitorRec?.headcountOrFte ?? 0,
  0,
  g4MonitorRec ? "record found but should be 0" : "no record (correct — LS has no monitor)",
);

// ── Section D: Sibling-grade section integrity ────────────────────────────────
console.log("\nSection D — Sibling-grade section integrity:");

checkEqual(
  "22. PK3 sections = 2 (sectionCountEngine 2028, enrollment=28, spc=18)",
  sectionFor("pk3"),
  2,
);

checkEqual(
  "23. PK4 sections = 2 (sectionCountEngine 2028, enrollment=32, spc=18)",
  sectionFor("pk4"),
  2,
);

checkEqual(
  "24. Kindergarten sections = 2 (sectionCountEngine 2028, enrollment=36, spc=20)",
  sectionFor("kindergarten"),
  2,
);

checkEqual(
  "25. G3 sections = 2 (sectionCountEngine 2028, enrollment=32, spc=22)",
  sectionFor("g3"),
  2,
);

// ── Section E: DRE engine and workbook output ─────────────────────────────────
console.log("\nSection E — DRE engine and workbook output:");

const dreNumeroDeAlunos2028 = dreOutput.byYear[2028].numero_de_alunos;
checkEqual(
  "26. calculateDre t1_g4 / intermediario / bp1 / balanced: numero_de_alunos 2028 = 258",
  dreNumeroDeAlunos2028,
  258,
);

const enrollmentRows = sheetToRows("Enrollment");
const row2028 = enrollmentRows.find((row) => row[0] === 2028);
const wbEnrollment2028 = row2028 ? row2028[1] : null;
checkEqual(
  "27. DRE workbook Enrollment sheet: Número de Alunos 2028 = 258",
  wbEnrollment2028,
  258,
);

const readmeRows = sheetToRows("README");
const readmeFlat = readmeRows.map((row) => row.filter(Boolean).join(" ")).join("\n");
checkTrue(
  "28. DRE workbook README contains Phase 15S.2 source-backed values (348 capacity, 74.1% occupancy)",
  readmeFlat.includes("348") && readmeFlat.includes("74.1%"),
  readmeFlat.includes("348") ? "Phase 15S.2 capacity found in README" : "Phase 15S.2 content NOT found — README not updated",
);

// ── Section F: OfferScenariosTab UI alignment ─────────────────────────────────
console.log("\nSection F — OfferScenariosTab UI alignment:");

const offerTab = readSrc(
  "src/components/sections/OfferScenariosTab.tsx",
);

checkTrue(
  "29. OfferScenariosTab Scenario B targetEnrollment = '258 learners'",
  offerTab.includes('targetEnrollment: "258 learners"'),
);

checkTrue(
  "30. OfferScenariosTab Scenario B modeledCapacity = '348 learners' (Phase 15S.2)",
  offerTab.includes('modeledCapacity: "348 learners"'),
);

checkTrue(
  "31. OfferScenariosTab Scenario B impliedOccupancy = '74.1%' (Phase 15S.2)",
  offerTab.includes('impliedOccupancy: "74.1%"'),
);

// ── Section G: Canonical t1_g3 fixture unchanged ──────────────────────────────
console.log("\nSection G — Canonical t1_g3 fixture unchanged:");

const canonicalDre = calculateDre(CANONICAL_T1G3);
checkEqual(
  "32. t1_g3 / intermediario canonical fixture: numero_de_alunos 2028 = 228 (unchanged)",
  canonicalDre.byYear[2028].numero_de_alunos,
  228,
);

// ── Section H: Protected-file scope ──────────────────────────────────────────
console.log("\nSection H — Protected-file scope (no Phase 15S.1 marker):");

const PROTECTED: Array<[string, string]> = [
  ["33. MS/HS educator-capacity (msHsStaffingReadiness.ts)", "src/features/rio-scenario-resilience/model/msHsStaffingReadiness.ts"],
  ["34. Tuition (tuitionSourceData.ts)", "src/features/rio-scenario-resilience/model/tuitionSourceData.ts"],
  ["35. Discount (discountScheduleSourceData.ts)", "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts"],
  ["36. CAPEX (capexScheduleEngine.ts)", "src/features/rio-scenario-resilience/model/capexScheduleEngine.ts"],
  ["37. Service Contracts (dreAnnualAssumptionSourceData.ts)", "src/features/rio-scenario-resilience/model/dreAnnualAssumptionSourceData.ts"],
  ["38. Payroll/FOPAG formulas (fopagEngine.ts)", "src/features/rio-scenario-resilience/model/fopagEngine.ts"],
  ["39. DRE formula engine (dreEngine.ts)", "src/features/rio-scenario-resilience/model/dreEngine.ts"],
];
for (const [label, path] of PROTECTED) {
  const src = readSrc(path);
  checkTrue(
    label,
    !src.includes("Phase 15S.1"),
    src.includes("Phase 15S.1") ? "FAIL: file contains Phase 15S.1 marker" : "clean",
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(60)}`);
console.log(`Phase 15S.1 Legacy Supersession: ${passCount} passed, ${failCount} failed (39 checks total)`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log("All checks passed.\n");
}
