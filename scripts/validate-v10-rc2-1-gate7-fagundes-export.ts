// V10-RC2.1 Gate 7/8 — export-level test for the Fagundes Export Index sheet.
// Builds the real XLSX workbook (not source-text inspection) for two distinct
// scenarios and asserts: the sheet exists, contains the 11 requested rows,
// the one unsupported field is explicit (never blank, never zero), and the
// embedded scenario line tracks vm.selections exactly — proving the sheet
// receives the visible scenario rather than a hardcoded default.
import * as XLSX from "xlsx";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import {
  buildDreScenarioWorkbook,
  computeOrgDesignPayrollVariants,
} from "../src/components/dreSimulator/dreScenarioWorkbook";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../src/hooks/useDreScenarioSimulator";

let passCount = 0;
let failCount = 0;
function check(label: string, pass: boolean, detail?: string): void {
  if (pass) {
    passCount++;
    console.log(`✓ ${label}`);
  } else {
    failCount++;
    console.log(`✗ ${label}${detail ? `\n  ${detail}` : ""}`);
  }
}

function buildWorkbookFor(selections: DreScenarioSimulatorSelections): XLSX.WorkBook {
  const dreOutput = calculateDre(selections);
  const fopagOutput = calculateFopag({
    openingPackageId: selections.openingPackageId,
    occupancyScenarioId: selections.occupancyScenarioId,
    orgDesignOptionId: selections.orgDesignOptionId,
  });
  const threeVersionPayroll = computeOrgDesignPayrollVariants(selections, dreOutput, fopagOutput);
  const LAST_YEAR = RECEITA_PROJECTION_YEARS[RECEITA_PROJECTION_YEARS.length - 1];
  return buildDreScenarioWorkbook({
    selections,
    defaultSelections: selections,
    dreOutput,
    fopagOutput,
    payrollReconciliation: { isReconciled: true, mismatches: [] },
    orgDesignSensitivity: [
      {
        orgDesignOptionId: selections.orgDesignOptionId,
        isSelected: true,
        numeroDeAlunos2047: dreOutput.byYear[LAST_YEAR].numero_de_alunos,
        receitaOperacionalLiquida2047: dreOutput.byYear[LAST_YEAR].receita_operacional_liquida,
        ebitda2047: dreOutput.byYear[LAST_YEAR].ebitda,
        percentualEbitda2047: dreOutput.byYear[LAST_YEAR].percentual_ebitda,
        payrollTotal2047: 0,
        ebitdaPositiveYear: null,
      },
    ],
    exportedAt: new Date("2026-07-29T00:00:00.000Z"),
    threeVersionPayroll,
  });
}

const SCENARIO_A: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g6",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};
const SCENARIO_B: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "otimista",
  tuitionScenarioId: "bp3_ey_to_ms_unified",
  orgDesignOptionId: "premium_experience",
};

const wbA = buildWorkbookFor(SCENARIO_A);
const wbB = buildWorkbookFor(SCENARIO_B);

check("Fagundes Export Index sheet exists (scenario A)", wbA.SheetNames.includes("Fagundes Export Index"));
check("workbook has exactly 28 sheets", wbA.SheetNames.length === 28, `got ${wbA.SheetNames.length}: ${wbA.SheetNames.join(", ")}`);

// ── V10-RC2.2 Gate 5: the three previously-repurposed/unavailable Fagundes
// outputs now have dedicated sheets, materially implemented (not just
// indexed), sourced from the same shared engines as the rest of the
// workbook. ───────────────────────────────────────────────────────────────
check("Grade-Level Staffing Summary sheet exists", wbA.SheetNames.includes("Grade-Level Staffing Summary"));
check("Grade-Level Staffing Detail sheet exists", wbA.SheetNames.includes("Grade-Level Staffing Detail"));
check("Direct Payroll & Corp Alloc sheet exists", wbA.SheetNames.includes("Direct Payroll & Corp Alloc"));

{
  const summaryRows = XLSX.utils.sheet_to_json(wbA.Sheets["Grade-Level Staffing Summary"], { header: 1 }) as (
    | string
    | number
  )[][];
  const header = summaryRows.find((r) => r[0] === "Division Area");
  check("Grade-Level Staffing Summary has a Division Area header row", header !== undefined);
  const eyRow = summaryRows.find((r) => r[0] === "Early Years");
  check(
    "Grade-Level Staffing Summary has an Early Years row with a non-zero headcount total",
    eyRow !== undefined && typeof eyRow[1] === "number" && (eyRow[1] as number) > 0,
    eyRow ? JSON.stringify(eyRow) : "row not found",
  );
  const totalRow = summaryRows.find((r) => r[0] === "Total (all divisions)");
  check("Grade-Level Staffing Summary has a grand-total row", totalRow !== undefined);
}

{
  const detailRows = XLSX.utils.sheet_to_json(wbA.Sheets["Grade-Level Staffing Detail"], { header: 1 }) as (
    | string
    | number
  )[][];
  const header = detailRows.find((r) => r[0] === "Division Area" && r[3] === "Grade-Level Basis");
  check("Grade-Level Staffing Detail has a Grade-Level Basis column", header !== undefined);
  const msRow = detailRows.find((r) => r[0] === "Middle School");
  check(
    "Grade-Level Staffing Detail discloses the F06 MS/HS unreconciled-estimate basis, not silently as governed",
    msRow !== undefined && String(msRow[3]).includes("F06") && String(msRow[3]).includes("unreconciled"),
    msRow ? JSON.stringify(msRow) : "no Middle School row found for scenario A (t1_g6)",
  );
  const eyDetailRow = detailRows.find((r) => r[0] === "Early Years");
  check(
    "Grade-Level Staffing Detail marks Early Years rows as governed, not the F06 MS/HS caveat",
    eyDetailRow !== undefined && String(eyDetailRow[3]).includes("Governed"),
    eyDetailRow ? JSON.stringify(eyDetailRow) : "row not found",
  );
}

{
  const dpRows = XLSX.utils.sheet_to_json(wbA.Sheets["Direct Payroll & Corp Alloc"], { header: 1 }) as (
    | string
    | number
  )[][];
  const header = dpRows.find((r) => r[0] === "Year");
  check("Direct Payroll & Corp Alloc has a Year header row", header !== undefined);
  const year2028Row = dpRows.find((r) => r[0] === 2028);
  check(
    "Direct Payroll & Corp Alloc 2028 row has a non-zero Total Direct Campus Payroll",
    year2028Row !== undefined && typeof year2028Row[4] === "number" && (year2028Row[4] as number) > 0,
    year2028Row ? JSON.stringify(year2028Row) : "row not found",
  );
  check(
    "Direct Payroll & Corp Alloc 2028 row labels Corporate Allocation as UNAVAILABLE with the blocker cited, not blank or zero",
    year2028Row !== undefined &&
      typeof year2028Row[5] === "string" &&
      (year2028Row[5] as string).startsWith("UNAVAILABLE") &&
      (year2028Row[5] as string).includes("CORPORATE-ALLOCATION"),
    year2028Row ? String(year2028Row[5]) : "row not found",
  );
  check(
    "Direct Payroll & Corp Alloc 2028 row labels Consolidated People Cost as UNAVAILABLE, not blank or zero",
    year2028Row !== undefined &&
      typeof year2028Row[6] === "string" &&
      (year2028Row[6] as string).startsWith("UNAVAILABLE"),
    year2028Row ? String(year2028Row[6]) : "row not found",
  );
}

function sheetRows(wb: XLSX.WorkBook): (string | number)[][] {
  return XLSX.utils.sheet_to_json(wb.Sheets["Fagundes Export Index"], { header: 1 }) as (string | number)[][];
}

const rowsA = sheetRows(wbA);
const rowsB = sheetRows(wbB);

const headerRowIndexA = rowsA.findIndex((r) => r[0] === "Fagundes sheet");
check("header row present", headerRowIndexA !== -1);
const dataRowsA = rowsA.slice(headerRowIndexA + 1).filter((r) => r.length > 0 && r[0]);
check("11 Fagundes-requested sheets listed", dataRowsA.length === 11, `got ${dataRowsA.length}`);

const partialRow = dataRowsA.find((r) => r[0] === "Direct Payroll and Corporate Allocation");
check("partially-available row present", partialRow !== undefined);
check(
  "row is explicitly marked partially_available (not blank, not zero) and maps to a real dedicated sheet",
  partialRow !== undefined &&
    partialRow[1] === "partially_available" &&
    partialRow[2] === "Direct Payroll & Corp Alloc" &&
    String(partialRow[3]).length > 20,
  partialRow ? JSON.stringify(partialRow) : "row not found",
);
check(
  "row cites the governance reason (no corporate-allocation adapter)",
  partialRow !== undefined && String(partialRow[3]).includes("no corporate-allocation adapter exists"),
);

const availableRows = dataRowsA.filter((r) => r[0] !== "Direct Payroll and Corporate Allocation");
check(
  "every other row is available with a non-empty Maps-to and lineage",
  availableRows.every((r) => r[1] === "available" && String(r[2]).length > 0 && String(r[3]).length > 0),
);

const scenarioLineA = rowsA.find((r) => r[0] === "Selected scenario");
const scenarioLineB = rowsB.find((r) => r[0] === "Selected scenario");
check(
  "scenario A line matches SCENARIO_A selections",
  scenarioLineA?.[1] === "t1_g6 / base / bp1_division_differentiated / balanced_experience",
  String(scenarioLineA?.[1]),
);
check(
  "scenario B line matches SCENARIO_B selections (proves no hardcoded default)",
  scenarioLineB?.[1] === "t1_g4 / otimista / bp3_ey_to_ms_unified / premium_experience",
  String(scenarioLineB?.[1]),
);
check("scenario A and B lines differ", scenarioLineA?.[1] !== scenarioLineB?.[1]);

console.log(
  failCount === 0
    ? `\n✓ V10-RC2.1 Gate 7 Fagundes export test: ${passCount}/${passCount} pass`
    : `\n✗ V10-RC2.1 Gate 7 Fagundes export test: ${passCount}/${passCount + failCount} pass, ${failCount} fail`,
);
process.exit(failCount === 0 ? 0 : 1);
