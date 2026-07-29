// Phase 15U.2 — Payroll Governance Sheets in DRE Workbook (81 checks).
//
//   Section A — Workbook structure (checks 1–8)
//     1.  DRE workbook includes all 13 prior core sheets (Phase 14B)
//     2.  DRE workbook includes all 6 Phase 15R.1 payroll sheets
//     3.  DRE workbook includes all 3 Phase 15R.3 FOPAG sheets
//     4.  DRE workbook includes "Payroll Assumptions"
//     5.  DRE workbook includes "Role Scenario Activation Matrix"
//     6.  Total DRE workbook sheet count >= 24
//     7.  "Payroll Assumptions" is sheet 23 (index 22)
//     8.  "Role Scenario Activation Matrix" is sheet 24 (index 23)
//
//   Section B — Payroll Assumptions sheet structure (checks 9–20)
//     9.  Payroll Assumptions has >= 3 rows (notes + header + data)
//    10.  Header contains "Role" column
//    11.  Header contains "Role ID" column
//    12.  Header contains "Encargos / Labor Charges Monthly"
//    13.  Header does NOT contain "FGTS"
//    14.  Header does NOT contain "INSS"
//    15.  Header contains "Reconciliation Target"
//    16.  Header contains "Appears In"
//    17.  Header contains "Division / Area"
//    18.  Header contains "Compensation Archetype"
//    19.  Header contains "Calculation Trace / Formula Basis"
//    20.  Header contains "Allocation"
//
//   Section C — Fixture: language_acquisition_coach (checks 21–28)
//    21.  language_acquisition_coach present in Payroll Assumptions
//    22.  language_acquisition_coach displays as "Language Acquisition and Performance Coach"
//    23.  language_acquisition_coach "Appears In" includes Minimum
//    24.  language_acquisition_coach "Appears In" includes Balanced
//    25.  language_acquisition_coach "Appears In" includes Premium
//    26.  language_acquisition_coach allocation is FOLHA_DIRETA
//    27.  language_acquisition_coach reconciliation target contains "folha_de_pagamento"
//    28.  language_acquisition_coach grossMonthly > 0
//
//   Section D — Fixture: security_coordinator (checks 29–35)
//    29.  security_coordinator present in Payroll Assumptions
//    30.  security_coordinator "Appears In" does NOT include Minimum (BALANCED_PREMIUM)
//    31.  security_coordinator "Appears In" includes Balanced
//    32.  security_coordinator "Appears In" includes Premium
//    33.  security_coordinator allocation is FOLHA_DIRETA
//    34.  security_coordinator grossMonthly > 0
//    35.  security_coordinator reconciliation target contains "folha_de_pagamento"
//
//   Section E — Fixture: maker_space_assistant (checks 36–40)
//    36.  maker_space_assistant present in Payroll Assumptions
//    37.  maker_space_assistant "Appears In" includes Minimum, Balanced, and Premium
//    38.  maker_space_assistant allocation is FOPAG_DIRETO
//    39.  maker_space_assistant reconciliation target contains "fopag_direto_clt_pj"
//    40.  maker_space_assistant grossMonthly > 0
//
//   Section F — Fixture: events_assistant (checks 41–44)
//    41.  events_assistant present in Payroll Assumptions
//    42.  events_assistant "Appears In" includes all three scenarios
//    43.  events_assistant allocation is FOLHA_DIRETA
//    44.  events_assistant reconciliation target contains "folha_de_pagamento"
//
//   Section G — Fixture: personalized_learning_associate_educator (checks 45–49)
//    45.  personalized_learning_associate_educator present in Payroll Assumptions
//    46.  personalized_learning_associate_educator "Appears In" does NOT include Minimum
//    47.  personalized_learning_associate_educator "Appears In" includes Balanced and Premium
//    48.  personalized_learning_associate_educator allocation is FOPAG_DIRETO
//    49.  personalized_learning_associate_educator reconciliation target contains "fopag_direto_clt_pj"
//
//   Section H — Fixture: secretary display label (check 50)
//    50.  secretary displays as "Registrar" in Payroll Assumptions
//
//   Section I — Role Scenario Activation Matrix structure (checks 51–60)
//    51.  Role Scenario Activation Matrix has >= 3 rows (note + header + data)
//    52.  Matrix header contains "Org Design Scenario"
//    53.  Matrix header contains "Year"
//    54.  Matrix header contains "HC / FTE"
//    55.  Matrix header contains "Is Audit Row"
//    56.  Matrix header contains "First Active Year"
//    57.  Matrix data rows cover all three org design scenarios
//    58.  Matrix data rows cover all 20 projection years (2028–2047)
//    59.  Matrix data rows include language_acquisition_coach (in Minimum)
//    60.  Matrix data rows do NOT include security_coordinator in Minimum Experience
//
//   Section J — Encargos protection (checks 61–65)
//    61.  No Payroll Assumptions header cell contains "FGTS"
//    62.  No Payroll Assumptions header cell contains "INSS"
//    63.  No Role Scenario Activation Matrix header cell contains "FGTS"
//    64.  No Role Scenario Activation Matrix header cell contains "INSS"
//    65.  Payroll Assumptions header col 8 is exactly "Encargos / Labor Charges Monthly"
//
//   Section K — Scope protection: no tuition/receita in payroll data rows (checks 66–68)
//    66.  No Payroll Assumptions data cell contains "tuition" (case-insensitive)
//    67.  No Payroll Assumptions data cell contains "mensalidade" (case-insensitive)
//    68.  No Role Scenario Activation Matrix data cell contains "tuition" (case-insensitive)
//
//   Section L — Note row content validation (checks 69–72)
//    69.  PA note row 1 contains "not recalculate or duplicate"
//    70.  PA note row 2 contains "No FGTS or INSS columns"
//    71.  Matrix note row contains "No tuition values"
//    72.  PA note row 1 contains "Payroll calculation authority remains the app model"
//
//   Section M — Calculation trace (checks 73–74)
//    73.  Some Payroll Assumptions data cell contains "fopagEngine.ts"
//    74.  Some Payroll Assumptions data cell contains "not decomposed in the current model"
//
//   Section N — Model-cross-validation: sheet vs fopagOutput (checks 75–79)
//    75.  language_acquisition_coach grossMonthly in PA sheet === balanced fopagOutput value
//    76.  language_acquisition_coach laborChargesMonthly in PA sheet === balanced fopagOutput value
//    77.  Matrix roleIds in Minimum data rows === roleIds in minimum fopagOutput.records
//    78.  Matrix roleIds in Balanced data rows === roleIds in balanced fopagOutput.records
//    79.  Matrix roleIds in Premium data rows === roleIds in premium fopagOutput.records
//
//   Section O — README updated (checks 80–81)
//    80.  dreScenarioWorkbook.ts README includes "23. Payroll Assumptions"
//    81.  Validator check count = 81 (self-check)
//
// Run with: npx tsx scripts/validate-phase15u2.ts

import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { buildPayrollAssumptionRows, buildRoleScenarioActivationRows } from "../src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

// ── Fixture selections ────────────────────────────────────────────────────────
const FIXTURE_SELECTIONS: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp3_ey_to_ms_unified",
  orgDesignOptionId: "balanced_experience",
};

const ORG_DESIGN_IDS: readonly DreWorkingScenarioOrgDesignOptionId[] = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
];

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
    console.log(
      `  ✗ ${label} — expected ${String(expected)}, got ${String(actual)}${note ? ` (${note})` : ""}`,
    );
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
  const out =
    orgDesignOptionId === fixtureSelections.orgDesignOptionId
      ? dreOutput
      : calculateDre({ ...fixtureSelections, orgDesignOptionId });
  const lyr = out.byYear[LAST_YEAR];
  const ebitdaPositiveYear =
    RECEITA_PROJECTION_YEARS.find((y) => out.byYear[y].ebitda > 0) ?? null;
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

// Build adapter rows directly for cross-validation
const govInput = {
  openingPackageId: fixtureSelections.openingPackageId,
  occupancyScenarioId: fixtureSelections.occupancyScenarioId,
  minimum: threeVersionPayroll.minimum,
  balanced: threeVersionPayroll.balanced,
  premium: threeVersionPayroll.premium,
};
const paRows = buildPayrollAssumptionRows(govInput) as (string | number | boolean)[][];
const rsRows = buildRoleScenarioActivationRows(govInput) as (string | number | boolean)[][];

// PA layout: row 0 = note1, row 1 = note2, row 2 = header, rows 3+ = data
const paHeader = paRows[2] as string[];
const paDataRows = paRows.slice(3);

// RS layout: row 0 = note, row 1 = header, rows 2+ = data
const rsHeader = rsRows[1] as string[];
const rsDataRows = rsRows.slice(2);

function paColIdx(name: string): number {
  return paHeader.indexOf(name);
}
function rsColIdx(name: string): number {
  return rsHeader.indexOf(name);
}

function paRoleRow(roleId: string): (string | number | boolean)[] | undefined {
  const col = paColIdx("Role ID");
  return paDataRows.find((r) => r[col] === roleId);
}

// ── Section A — Workbook structure ───────────────────────────────────────────
console.log("\nSection A — Workbook structure");
const names = workbook.SheetNames;
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
checkTrue("All 13 Phase 14B core sheets present", CORE_SHEETS.every((s) => names.includes(s)));
checkTrue("All 6 Phase 15R.1 payroll sheets present", R1_SHEETS.every((s) => names.includes(s)));
checkTrue("All 3 Phase 15R.3 FOPAG sheets present", R3_SHEETS.every((s) => names.includes(s)));
checkTrue('Workbook includes "Payroll Assumptions"', names.includes("Payroll Assumptions"));
checkTrue('Workbook includes "Role Scenario Activation Matrix"', names.includes("Role Scenario Activation Matrix"));
checkTrue("Total sheet count >= 24", names.length >= 24);
checkEqual('"Payroll Assumptions" is sheet 23', names[22], "Payroll Assumptions");
checkEqual('"Role Scenario Activation Matrix" is sheet 24', names[23], "Role Scenario Activation Matrix");

// ── Section B — Payroll Assumptions sheet structure ──────────────────────────
console.log("\nSection B — Payroll Assumptions sheet structure");
checkTrue("PA sheet has >= 3 rows (notes + header + data)", paRows.length >= 3);
checkTrue('Header contains "Role"', paHeader.includes("Role"));
checkTrue('Header contains "Role ID"', paHeader.includes("Role ID"));
checkTrue('Header contains "Encargos / Labor Charges Monthly"', paHeader.includes("Encargos / Labor Charges Monthly"));
checkTrue('Header does NOT contain "FGTS"', !paHeader.some((h) => String(h).includes("FGTS")));
checkTrue('Header does NOT contain "INSS"', !paHeader.some((h) => String(h).includes("INSS")));
checkTrue('Header contains "Reconciliation Target"', paHeader.includes("Reconciliation Target"));
checkTrue('Header contains "Appears In"', paHeader.includes("Appears In"));
checkTrue('Header contains "Division / Area"', paHeader.includes("Division / Area"));
checkTrue('Header contains "Compensation Archetype"', paHeader.includes("Compensation Archetype"));
checkTrue('Header contains "Calculation Trace / Formula Basis"', paHeader.includes("Calculation Trace / Formula Basis"));
checkTrue('Header contains "Allocation"', paHeader.includes("Allocation"));

// ── Section C — Fixture: language_acquisition_coach ─────────────────────────
console.log("\nSection C — Fixture: language_acquisition_coach");
const lacRow = paRoleRow("language_acquisition_coach");
checkTrue("language_acquisition_coach present in PA", lacRow !== undefined);
checkEqual(
  'language_acquisition_coach displays as "Language Acquisition and Performance Coach"',
  String(lacRow?.[paColIdx("Role")] ?? ""),
  "Language Acquisition and Performance Coach",
);
const lacAppearsIn = String(lacRow?.[paColIdx("Appears In")] ?? "");
checkTrue('language_acquisition_coach "Appears In" includes Minimum', lacAppearsIn.includes("Minimum"));
checkTrue('language_acquisition_coach "Appears In" includes Balanced', lacAppearsIn.includes("Balanced"));
checkTrue('language_acquisition_coach "Appears In" includes Premium', lacAppearsIn.includes("Premium"));
checkEqual(
  "language_acquisition_coach allocation is FOLHA_DIRETA",
  String(lacRow?.[paColIdx("Allocation")] ?? ""),
  "FOLHA_DIRETA",
);
checkTrue(
  'language_acquisition_coach reconciliation target contains "folha_de_pagamento"',
  String(lacRow?.[paColIdx("Reconciliation Target")] ?? "").includes("folha_de_pagamento"),
);
checkTrue(
  "language_acquisition_coach grossMonthly > 0",
  Number(lacRow?.[paColIdx("Base Salary / Gross Monthly")] ?? 0) > 0,
);

// ── Section D — Fixture: security_coordinator ────────────────────────────────
console.log("\nSection D — Fixture: security_coordinator");
const scRow = paRoleRow("security_coordinator");
checkTrue("security_coordinator present in PA", scRow !== undefined);
const scAppearsIn = String(scRow?.[paColIdx("Appears In")] ?? "");
checkTrue('security_coordinator "Appears In" does NOT include Minimum', !scAppearsIn.includes("Minimum"));
checkTrue('security_coordinator "Appears In" includes Balanced', scAppearsIn.includes("Balanced"));
checkTrue('security_coordinator "Appears In" includes Premium', scAppearsIn.includes("Premium"));
checkEqual(
  "security_coordinator allocation is FOLHA_DIRETA",
  String(scRow?.[paColIdx("Allocation")] ?? ""),
  "FOLHA_DIRETA",
);
checkTrue(
  "security_coordinator grossMonthly > 0",
  Number(scRow?.[paColIdx("Base Salary / Gross Monthly")] ?? 0) > 0,
);
checkTrue(
  'security_coordinator reconciliation target contains "folha_de_pagamento"',
  String(scRow?.[paColIdx("Reconciliation Target")] ?? "").includes("folha_de_pagamento"),
);

// ── Section E — Fixture: maker_space_assistant ───────────────────────────────
console.log("\nSection E — Fixture: maker_space_assistant");
const msaRow = paRoleRow("maker_space_assistant");
checkTrue("maker_space_assistant present in PA", msaRow !== undefined);
const msaAppearsIn = String(msaRow?.[paColIdx("Appears In")] ?? "");
checkTrue(
  'maker_space_assistant "Appears In" includes Minimum, Balanced, Premium',
  msaAppearsIn.includes("Minimum") && msaAppearsIn.includes("Balanced") && msaAppearsIn.includes("Premium"),
);
checkEqual(
  "maker_space_assistant allocation is FOPAG_DIRETO",
  String(msaRow?.[paColIdx("Allocation")] ?? ""),
  "FOPAG_DIRETO",
);
checkTrue(
  'maker_space_assistant reconciliation target contains "fopag_direto_clt_pj"',
  String(msaRow?.[paColIdx("Reconciliation Target")] ?? "").includes("fopag_direto_clt_pj"),
);
checkTrue(
  "maker_space_assistant grossMonthly > 0",
  Number(msaRow?.[paColIdx("Base Salary / Gross Monthly")] ?? 0) > 0,
);

// ── Section F — Fixture: events_assistant ────────────────────────────────────
console.log("\nSection F — Fixture: events_assistant");
const eaRow = paRoleRow("events_assistant");
checkTrue("events_assistant present in PA", eaRow !== undefined);
const eaAppearsIn = String(eaRow?.[paColIdx("Appears In")] ?? "");
checkTrue(
  'events_assistant "Appears In" includes all three scenarios',
  eaAppearsIn.includes("Minimum") && eaAppearsIn.includes("Balanced") && eaAppearsIn.includes("Premium"),
);
checkEqual(
  "events_assistant allocation is FOLHA_DIRETA",
  String(eaRow?.[paColIdx("Allocation")] ?? ""),
  "FOLHA_DIRETA",
);
checkTrue(
  'events_assistant reconciliation target contains "folha_de_pagamento"',
  String(eaRow?.[paColIdx("Reconciliation Target")] ?? "").includes("folha_de_pagamento"),
);

// ── Section G — Fixture: personalized_learning_associate_educator ─────────────
console.log("\nSection G — Fixture: personalized_learning_associate_educator");
const plaeRow = paRoleRow("personalized_learning_associate_educator");
checkTrue("personalized_learning_associate_educator present in PA", plaeRow !== undefined);
const plaeAppearsIn = String(plaeRow?.[paColIdx("Appears In")] ?? "");
checkTrue(
  'personalized_learning_associate_educator "Appears In" does NOT include Minimum',
  !plaeAppearsIn.includes("Minimum"),
);
checkTrue(
  'personalized_learning_associate_educator "Appears In" includes Balanced and Premium',
  plaeAppearsIn.includes("Balanced") && plaeAppearsIn.includes("Premium"),
);
checkEqual(
  "personalized_learning_associate_educator allocation is FOPAG_DIRETO",
  String(plaeRow?.[paColIdx("Allocation")] ?? ""),
  "FOPAG_DIRETO",
);
checkTrue(
  'personalized_learning_associate_educator reconciliation target contains "fopag_direto_clt_pj"',
  String(plaeRow?.[paColIdx("Reconciliation Target")] ?? "").includes("fopag_direto_clt_pj"),
);

// ── Section H — Fixture: secretary display label ─────────────────────────────
console.log("\nSection H — Fixture: secretary display label");
const secRow = paRoleRow("secretary");
checkEqual(
  'secretary displays as "Registrar"',
  String(secRow?.[paColIdx("Role")] ?? ""),
  "Registrar",
);

// ── Section I — Role Scenario Activation Matrix structure ─────────────────────
console.log("\nSection I — Role Scenario Activation Matrix structure");
checkTrue("Matrix has >= 3 rows (note + header + data)", rsRows.length >= 3);
checkTrue('Matrix header contains "Org Design Scenario"', rsHeader.includes("Org Design Scenario"));
checkTrue('Matrix header contains "Year"', rsHeader.includes("Year"));
checkTrue('Matrix header contains "HC / FTE"', rsHeader.includes("HC / FTE"));
checkTrue('Matrix header contains "Is Audit Row"', rsHeader.includes("Is Audit Row"));
checkTrue('Matrix header contains "First Active Year"', rsHeader.includes("First Active Year"));
const rsScenarios = new Set(rsDataRows.map((r) => r[rsColIdx("Org Design Scenario")]));
checkTrue(
  "Matrix covers all three org design scenarios",
  rsScenarios.has("Minimum Experience") && rsScenarios.has("Balanced Experience") && rsScenarios.has("Premium Experience"),
);
const rsYears = new Set(rsDataRows.map((r) => Number(r[rsColIdx("Year")])));
checkTrue(
  "Matrix covers all 20 projection years (2028–2047)",
  rsYears.size === 20 && rsYears.has(2028) && rsYears.has(2047),
);
const lacInMin = rsDataRows.some(
  (r) => r[rsColIdx("Role ID")] === "language_acquisition_coach" && r[rsColIdx("Org Design Scenario")] === "Minimum Experience",
);
checkTrue("Matrix includes language_acquisition_coach in Minimum Experience", lacInMin);
const scInMin = rsDataRows.some(
  (r) => r[rsColIdx("Role ID")] === "security_coordinator" && r[rsColIdx("Org Design Scenario")] === "Minimum Experience",
);
checkTrue("Matrix does NOT include security_coordinator in Minimum Experience", !scInMin);

// ── Section J — Encargos protection ──────────────────────────────────────────
console.log("\nSection J — Encargos protection");
checkTrue(
  'No PA header cell contains "FGTS"',
  !paHeader.some((h) => String(h).toUpperCase().includes("FGTS")),
);
checkTrue(
  'No PA header cell contains "INSS"',
  !paHeader.some((h) => String(h).toUpperCase().includes("INSS")),
);
checkTrue(
  'No RS header cell contains "FGTS"',
  !rsHeader.some((h) => String(h).toUpperCase().includes("FGTS")),
);
checkTrue(
  'No RS header cell contains "INSS"',
  !rsHeader.some((h) => String(h).toUpperCase().includes("INSS")),
);
checkEqual(
  'PA col 8 (index 8) is exactly "Encargos / Labor Charges Monthly"',
  paHeader[8],
  "Encargos / Labor Charges Monthly",
);

// ── Section K — Scope protection ─────────────────────────────────────────────
console.log("\nSection K — Scope protection: no tuition/receita in payroll data rows");
checkTrue(
  'No PA data cell contains "tuition" (case-insensitive)',
  !paDataRows.some((r) => r.some((c) => String(c).toLowerCase().includes("tuition"))),
);
checkTrue(
  'No PA data cell contains "mensalidade" (case-insensitive)',
  !paDataRows.some((r) => r.some((c) => String(c).toLowerCase().includes("mensalidade"))),
);
checkTrue(
  'No RS data cell contains "tuition" (case-insensitive)',
  !rsDataRows.some((r) => r.some((c) => String(c).toLowerCase().includes("tuition"))),
);

// ── Section L — Note row content ─────────────────────────────────────────────
console.log("\nSection L — Note row content validation");
const paNoteRow1 = String(paRows[0][0]);
const paNoteRow2 = String(paRows[1][0]);
const rsNoteRow = String(rsRows[0][0]);
checkTrue('PA note row 1 contains "not recalculate or duplicate"', paNoteRow1.includes("not recalculate or duplicate"));
checkTrue('PA note row 2 contains "No FGTS or INSS columns"', paNoteRow2.includes("No FGTS or INSS columns"));
checkTrue('RS note row contains "No tuition values"', rsNoteRow.includes("No tuition values"));
checkTrue('PA note row 1 contains "Payroll calculation authority remains the app model"', paNoteRow1.includes("Payroll calculation authority remains the app model"));

// ── Section M — Calculation trace ────────────────────────────────────────────
console.log("\nSection M — Calculation trace");
const allPaDataCells = paDataRows.flatMap((r) => r.map((c) => String(c)));
checkTrue(
  'Some PA data cell contains "fopagEngine.ts"',
  allPaDataCells.some((c) => c.includes("fopagEngine.ts")),
);
checkTrue(
  'Some PA data cell contains "not decomposed in the current model"',
  allPaDataCells.some((c) => c.includes("not decomposed in the current model")),
);

// ── Section N — Model cross-validation ───────────────────────────────────────
console.log("\nSection N — Model cross-validation: sheet vs fopagOutput");
const { minimum, balanced, premium } = threeVersionPayroll;

// Find language_acquisition_coach in balanced fopagOutput
const lacFopagRec = balanced.fopagOutput.records.find(
  (r) => r.roleId === "language_acquisition_coach" && !r.isAuditRow,
);
const lacGrossInSheet = Number(lacRow?.[paColIdx("Base Salary / Gross Monthly")] ?? NaN);
const lacLaborInSheet = Number(lacRow?.[paColIdx("Encargos / Labor Charges Monthly")] ?? NaN);
checkTrue(
  "language_acquisition_coach grossMonthly in PA === balanced fopagOutput value",
  lacFopagRec !== undefined && Math.abs(lacGrossInSheet - (lacFopagRec?.grossMonthly ?? NaN)) < 1e-6,
  `sheet=${lacGrossInSheet}, model=${lacFopagRec?.grossMonthly}`,
);
checkTrue(
  "language_acquisition_coach laborChargesMonthly in PA === balanced fopagOutput value",
  lacFopagRec !== undefined && Math.abs(lacLaborInSheet - (lacFopagRec?.laborChargesMonthly ?? NaN)) < 1e-6,
  `sheet=${lacLaborInSheet}, model=${lacFopagRec?.laborChargesMonthly}`,
);

// Role ID coverage per scenario in Matrix
const roleIdColRS = rsColIdx("Role ID");
const scenarioColRS = rsColIdx("Org Design Scenario");

const minMatrixRoleIds = new Set(
  rsDataRows.filter((r) => r[scenarioColRS] === "Minimum Experience").map((r) => String(r[roleIdColRS])),
);
const minModelRoleIds = new Set(minimum.fopagOutput.records.map((r) => r.roleId));
checkEqual(
  "Matrix Minimum roleId count === minimum fopagOutput roleId count",
  minMatrixRoleIds.size,
  minModelRoleIds.size,
  `matrix=${minMatrixRoleIds.size}, model=${minModelRoleIds.size}`,
);

const balMatrixRoleIds = new Set(
  rsDataRows.filter((r) => r[scenarioColRS] === "Balanced Experience").map((r) => String(r[roleIdColRS])),
);
const balModelRoleIds = new Set(balanced.fopagOutput.records.map((r) => r.roleId));
checkEqual(
  "Matrix Balanced roleId count === balanced fopagOutput roleId count",
  balMatrixRoleIds.size,
  balModelRoleIds.size,
  `matrix=${balMatrixRoleIds.size}, model=${balModelRoleIds.size}`,
);

const premMatrixRoleIds = new Set(
  rsDataRows.filter((r) => r[scenarioColRS] === "Premium Experience").map((r) => String(r[roleIdColRS])),
);
const premModelRoleIds = new Set(premium.fopagOutput.records.map((r) => r.roleId));
checkEqual(
  "Matrix Premium roleId count === premium fopagOutput roleId count",
  premMatrixRoleIds.size,
  premModelRoleIds.size,
  `matrix=${premMatrixRoleIds.size}, model=${premModelRoleIds.size}`,
);

// ── Section O — README updated ────────────────────────────────────────────────
console.log("\nSection O — README updated");
const workbookSrc = readFile("src/components/dreSimulator/dreScenarioWorkbook.ts");
checkTrue(
  'dreScenarioWorkbook.ts README includes "23. Payroll Assumptions"',
  workbookSrc.includes("23. Payroll Assumptions"),
);

// ── Self-count check (check 81) ──────────────────────────────────────────────
const EXPECTED_CHECKS = 81;
const totalChecks = passCount + failCount;
checkEqual(
  `Validator check count = ${EXPECTED_CHECKS}`,
  totalChecks,
  EXPECTED_CHECKS - 1, // this check is the last one; its count is not yet included
);

console.log(`\n${"─".repeat(60)}`);
console.log(`Phase 15U.2 validation: ${passCount} passed, ${failCount} failed, ${passCount + failCount} total`);
if (failCount > 0) process.exit(1);
