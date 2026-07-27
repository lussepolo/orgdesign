// V10-X1 (2026-07-27): Rio_Matriz_Folha_Resumo.xlsx — one row per scenario,
// summarizing all twelve payroll export scenarios. Values are computed by the
// same buildRoleYearDetails()/fppMetricYearTotal() functions the detailed
// workbooks use, so the summary reconciles to the twelve detailed workbooks
// by construction (spec section 19).
import * as XLSX from "xlsx";
import { PAYROLL_EXPORT_HORIZON_YEARS } from "./payrollExportMatrixContract";
import { PD_COL, buildRoleYearDetails, fppMetricYearTotal } from "./payrollExportWorkbookBuilder";
import type { PayrollExportScenarioResult } from "./payrollExportScenarioAdapter";

const YEARS = PAYROLL_EXPORT_HORIZON_YEARS;

const METRIC_BLOCKS = [
  { label: "Enrollment", pdCol: null as number | null }, // sourced from dreOutput, not Payroll Detail
  { label: "Headcount/FTE", pdCol: PD_COL.hc },
  { label: "Salary", pdCol: PD_COL.annualSalary },
  { label: "Encargos", pdCol: PD_COL.annualEncargos },
  { label: "Benefits", pdCol: PD_COL.annualBenefits },
  { label: "Total Payroll", pdCol: PD_COL.totalRolePayroll },
] as const;

export function buildPayrollExportSummaryWorkbook(
  scenarioResults: readonly PayrollExportScenarioResult[],
): XLSX.WorkBook {
  const header = [
    "Scenario ID",
    "Início",
    "Folha",
    "Ocupação",
    "Detailed Workbook Filename",
    ...METRIC_BLOCKS.flatMap((m) => YEARS.map((y) => `${m.label} ${y}`)),
  ];

  const rows: (string | number)[][] = [header];

  for (const scenarioResult of scenarioResults) {
    const { record } = scenarioResult;
    const details = buildRoleYearDetails(scenarioResult);

    const row: (string | number)[] = [
      record.matrixScenarioId,
      record.openingPackageLabel,
      record.payrollLabel,
      record.occupancyLabel,
      record.filename,
    ];

    for (const metric of METRIC_BLOCKS) {
      for (const year of YEARS) {
        if (metric.pdCol === null) {
          row.push(scenarioResult.dreOutput.byYear[year].numero_de_alunos);
        } else {
          row.push(fppMetricYearTotal(details, metric.pdCol, year));
        }
      }
    }

    rows.push(row);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Resumo");
  return wb;
}
