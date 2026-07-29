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
check("workbook has exactly 25 sheets", wbA.SheetNames.length === 25, `got ${wbA.SheetNames.length}: ${wbA.SheetNames.join(", ")}`);

function sheetRows(wb: XLSX.WorkBook): (string | number)[][] {
  return XLSX.utils.sheet_to_json(wb.Sheets["Fagundes Export Index"], { header: 1 }) as (string | number)[][];
}

const rowsA = sheetRows(wbA);
const rowsB = sheetRows(wbB);

const headerRowIndexA = rowsA.findIndex((r) => r[0] === "Fagundes sheet");
check("header row present", headerRowIndexA !== -1);
const dataRowsA = rowsA.slice(headerRowIndexA + 1).filter((r) => r.length > 0 && r[0]);
check("11 Fagundes-requested sheets listed", dataRowsA.length === 11, `got ${dataRowsA.length}`);

const unavailableRow = dataRowsA.find((r) => r[0] === "Direct Payroll and Corporate Allocation");
check("unavailable row present", unavailableRow !== undefined);
check(
  "unavailable row is explicitly marked unavailable (not blank, not zero)",
  unavailableRow !== undefined && unavailableRow[1] === "unavailable" && String(unavailableRow[3]).length > 20,
  unavailableRow ? JSON.stringify(unavailableRow) : "row not found",
);
check(
  "unavailable row cites the governance reason (no corporate-allocation adapter)",
  unavailableRow !== undefined && String(unavailableRow[3]).includes("No corporate-allocation adapter exists"),
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
