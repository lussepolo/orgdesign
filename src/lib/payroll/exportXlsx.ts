import * as XLSX from "xlsx";
import type {
  ExportWorkbookPayload,
  PayrollProjectionMetricRow,
} from "./presenters";

type DownloadProjectionParams = {
  payload: ExportWorkbookPayload;
  scenario: string;
  tuitionScenario: string;
  marginMode: "FULLY_LOADED" | "WITHOUT_BENEFITS";
};

export const STAFFING_PAYROLL_SHEET_NAMES = [
  "Scenario Summary",
  "Inputs",
  "Non-Teaching Headcount Plan",
  "Role Audit",
  "Payroll Projection",
  "Calculation Logic",
] as const;

type SheetBuildResult = {
  sheet: XLSX.WorkSheet;
  rowByMetric?: Record<string, number>;
  grandTotalRow?: number;
};

const currencyFormat = '"R$"#,##0.00';
const integerFormat = "0";
const percentFormat = "0.0%";

function getProjectionRangeLabel(years: number[]): string {
  const startYear = years[0];
  const endYear = years[years.length - 1];
  return startYear && endYear ? `${startYear}-${endYear}` : "projection";
}

function cellAddress(row: number, column: number): string {
  return XLSX.utils.encode_cell({ r: row - 1, c: column - 1 });
}

function quotedSheetRef(sheetName: string, row: number, column: number): string {
  return `'${sheetName}'!${cellAddress(row, column)}`;
}

function setCellFormat(sheet: XLSX.WorkSheet, row: number, column: number, format: string) {
  const address = cellAddress(row, column);
  if (sheet[address]) sheet[address].z = format;
}

function setColumnWidths(sheet: XLSX.WorkSheet, widths: number[]) {
  sheet["!cols"] = widths.map((wch) => ({ wch }));
}

function setAutofilter(sheet: XLSX.WorkSheet, ref: string) {
  sheet["!autofilter"] = { ref };
}

function appendSheet(workbook: XLSX.WorkBook, sheet: XLSX.WorkSheet, name: string) {
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

function makeFormulaCell(formula: string, value: number, format?: string): XLSX.CellObject {
  return {
    t: "n",
    f: formula,
    v: value,
    ...(format ? { z: format } : {}),
  };
}

function buildInputsSheet(payload: ExportWorkbookPayload): XLSX.WorkSheet {
  const rows = [
    ["Field", "Value"],
    ["Enrollment Scenario", payload.scenario],
    ["Tuition Scenario", payload.tuitionScenario],
    ["Margin Mode", payload.marginMode],
    ["Operating Horizon", getProjectionRangeLabel(payload.years)],
    ["Operating Years", payload.years.length],
    ["Tuition Base Year", payload.years[0]],
    ["Workbook Scope", "Staffing and payroll planning only"],
    ["Non-Teaching Rule", "Shared/global across scenarios"],
    ["Teaching Rule", "Scenario-responsive by students and turmas"],
    ["Export Generated At", new Date().toISOString()],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  setColumnWidths(sheet, [28, 42]);
  setAutofilter(sheet, "A1:B1");
  return sheet;
}

function buildHeadcountPlanSheet(payload: ExportWorkbookPayload): SheetBuildResult {
  const header = [
    "Nível",
    "Segmento",
    "Cargo/Área/Turma",
    "Cargo",
    "Modelo de Alocação",
    "Salário Mensal Base",
    "Encargos Mensais Base",
    "Benefícios Mensais Base",
    "Custo Mensal Base da Posição",
    ...payload.years.map(String),
  ];
  const rows: unknown[][] = [header];
  const subtotalRows: number[] = [];
  const annualStartColumn = 10;
  const finalColumn = annualStartColumn + payload.years.length - 1;

  const groups = ["Leadership", "Backoffice", "Specialists"];
  for (const group of groups) {
    const groupRows = payload.nonTeachingHeadcountRows.filter((row) => row.nivel === group);
    const firstDataRow = rows.length + 1;
    for (const row of groupRows) {
      rows.push([
        row.nivel,
        row.segmento,
        row.cargoAreaTurma,
        row.cargo,
        row.modeloAlocacao,
        row.salarioBase,
        row.encargosMensais,
        row.beneficiosMensais,
        null,
        ...payload.years.map((year) => row.headcountByYear[year] ?? 0),
      ]);
    }
    const lastDataRow = rows.length;
    const subtotalRow = rows.length + 1;
    subtotalRows.push(subtotalRow);
    rows.push([
      `${group} Total`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      ...payload.years.map(() => null),
    ]);

    for (let column = annualStartColumn; column <= finalColumn; column += 1) {
      const year = payload.years[column - annualStartColumn];
      const value = groupRows.reduce((sum, row) => sum + (row.headcountByYear[year] ?? 0), 0);
      const formula = `SUM(${cellAddress(firstDataRow, column)}:${cellAddress(lastDataRow, column)})`;
      rows[subtotalRow - 1][column - 1] = makeFormulaCell(formula, value, integerFormat);
    }
  }

  const grandTotalRow = rows.length + 1;
  rows.push([
    "Grand Total",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ...payload.years.map(() => null),
  ]);
  for (let column = annualStartColumn; column <= finalColumn; column += 1) {
    const year = payload.years[column - annualStartColumn];
    const value = payload.nonTeachingHeadcountRows.reduce(
      (sum, row) => sum + (row.headcountByYear[year] ?? 0),
      0,
    );
    const formula = subtotalRows.map((row) => cellAddress(row, column)).join("+");
    rows[grandTotalRow - 1][column - 1] = makeFormulaCell(formula, value, integerFormat);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");

  for (let row = 2; row <= range.e.r + 1; row += 1) {
    const salary = sheet[cellAddress(row, 6)];
    const labor = sheet[cellAddress(row, 7)];
    const benefits = sheet[cellAddress(row, 8)];
    if (salary?.t === "n" && labor?.t === "n" && benefits?.t === "n") {
      sheet[cellAddress(row, 9)] = makeFormulaCell(
        `${cellAddress(row, 6)}+${cellAddress(row, 7)}+${cellAddress(row, 8)}`,
        Number(salary.v ?? 0) + Number(labor.v ?? 0) + Number(benefits.v ?? 0),
        currencyFormat,
      );
    }
    [6, 7, 8, 9].forEach((column) => setCellFormat(sheet, row, column, currencyFormat));
    for (let column = annualStartColumn; column <= finalColumn; column += 1) {
      setCellFormat(sheet, row, column, integerFormat);
    }
  }

  setColumnWidths(sheet, [18, 22, 24, 30, 20, 16, 18, 18, 24, ...payload.years.map(() => 10)]);
  setAutofilter(sheet, `A1:${cellAddress(1, finalColumn)}`);
  return { sheet, grandTotalRow };
}

function buildRoleAuditSheet(payload: ExportWorkbookPayload): XLSX.WorkSheet {
  const header = [
    "Nível",
    "Segmento",
    "Role ID",
    "Cargo",
    "Modelo de Alocação",
    "Active From",
    "Salário Mensal Base",
    "Encargos Mensais Base",
    "Benefícios Mensais Base",
    "Custo Mensal Base da Posição",
    "Salário Mensal no 1º Ano Ativo",
    "Encargos Mensais no 1º Ano Ativo",
    "Benefícios Mensais no 1º Ano Ativo",
    "Custo Mensal no 1º Ano Ativo",
    "Headcount Step Changes",
    "First Active Year",
    "Final Headcount",
    "Carry Forward Rule",
  ];
  const rows: unknown[][] = [
    header,
    ...payload.roleAuditRows.map((row) => [
      row.nivel,
      row.segmento,
      row.roleId,
      row.cargo,
      row.modeloAlocacao,
      row.activeFrom,
      row.salarioBase,
      row.encargosMensais,
      row.beneficiosMensais,
      null,
      row.firstActiveYearGrossMonthly,
      row.firstActiveYearLaborMonthly,
      row.firstActiveYearBenefitsMonthly,
      row.firstActiveYearLoadedMonthly,
      row.headcountStepChanges,
      row.firstActiveYear,
      row.finalHeadcount,
      row.carryForwardRule,
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  for (let row = 2; row <= rows.length; row += 1) {
    sheet[cellAddress(row, 10)] = makeFormulaCell(
      `${cellAddress(row, 7)}+${cellAddress(row, 8)}+${cellAddress(row, 9)}`,
      Number(rows[row - 1][6] ?? 0) + Number(rows[row - 1][7] ?? 0) + Number(rows[row - 1][8] ?? 0),
      currencyFormat,
    );
    [7, 8, 9, 10, 11, 12, 13, 14].forEach((column) => setCellFormat(sheet, row, column, currencyFormat));
    [6, 16, 17].forEach((column) => setCellFormat(sheet, row, column, integerFormat));
  }
  setColumnWidths(sheet, [16, 22, 18, 30, 20, 12, 18, 20, 20, 26, 26, 28, 30, 26, 36, 16, 14, 58]);
  setAutofilter(sheet, "A1:R1");
  return sheet;
}

function getPayrollFormula(
  formulaType: PayrollProjectionMetricRow["formula"],
  rowByMetric: Record<string, number>,
  column: number,
) {
  const cell = (metric: string) => cellAddress(rowByMetric[metric], column);
  if (formulaType === "nonTeachingGrossLabor") {
    return `${cell("Leadership Gross + Labor")}+${cell("Backoffice Gross + Labor")}+${cell("Specialists Gross + Labor")}`;
  }
  if (formulaType === "nonTeachingBenefits") {
    return `${cell("Leadership Benefits")}+${cell("Backoffice Benefits")}+${cell("Specialists Benefits")}`;
  }
  if (formulaType === "totalGrossLabor") {
    return `${cell("Teaching Gross + Labor")}+${cell("Non-Teaching Gross + Labor")}`;
  }
  if (formulaType === "totalBenefits") {
    return `${cell("Teaching Benefits")}+${cell("Non-Teaching Benefits")}`;
  }
  if (formulaType === "totalPayroll") {
    return `${cell("Total Gross + Labor")}+${cell("Total Benefits")}`;
  }
  if (formulaType === "payrollMargin") {
    return `${cell("Revenue")}-${cell("Total Payroll")}`;
  }
  if (formulaType === "coverageRatio") {
    return `IF(${cell("Total Payroll")}=0,0,${cell("Revenue")}/${cell("Total Payroll")})`;
  }
  return "";
}

function getPayrollFormulaValue(
  formulaType: PayrollProjectionMetricRow["formula"],
  year: number,
  byMetric: Record<string, PayrollProjectionMetricRow>,
) {
  const value = (metric: string) => byMetric[metric]?.valuesByYear[year] ?? 0;
  if (formulaType === "nonTeachingGrossLabor") {
    return value("Leadership Gross + Labor") + value("Backoffice Gross + Labor") + value("Specialists Gross + Labor");
  }
  if (formulaType === "nonTeachingBenefits") {
    return value("Leadership Benefits") + value("Backoffice Benefits") + value("Specialists Benefits");
  }
  if (formulaType === "totalGrossLabor") {
    return value("Teaching Gross + Labor") + value("Non-Teaching Gross + Labor");
  }
  if (formulaType === "totalBenefits") {
    return value("Teaching Benefits") + value("Non-Teaching Benefits");
  }
  if (formulaType === "totalPayroll") {
    return value("Total Gross + Labor") + value("Total Benefits");
  }
  if (formulaType === "payrollMargin") {
    return value("Revenue") - value("Total Payroll");
  }
  if (formulaType === "coverageRatio") {
    return value("Total Payroll") === 0 ? 0 : value("Revenue") / value("Total Payroll");
  }
  return 0;
}

function buildPayrollProjectionSheet(payload: ExportWorkbookPayload): SheetBuildResult {
  const header = [
    "Section",
    "Metric",
    "Scenario",
    "Tuition Table",
    "Margin Mode",
    ...payload.years.map(String),
  ];
  const rows: unknown[][] = [
    header,
    ...payload.payrollProjectionRows.map((row) => [
      row.section,
      row.metric,
      row.scenario,
      row.tuitionTable,
      row.marginMode,
      ...payload.years.map((year) => row.valuesByYear[year] ?? 0),
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const rowByMetric = Object.fromEntries(
    payload.payrollProjectionRows.map((row, index) => [row.metric, index + 2]),
  );
  const rowObjectByMetric = Object.fromEntries(
    payload.payrollProjectionRows.map((row) => [row.metric, row]),
  );

  for (const row of payload.payrollProjectionRows) {
    const rowNumber = rowByMetric[row.metric];
    const format = row.format === "currency" ? currencyFormat : row.format === "percent" ? percentFormat : integerFormat;
    payload.years.forEach((year, index) => {
      const column = 6 + index;
      if (row.formula) {
        sheet[cellAddress(rowNumber, column)] = makeFormulaCell(
          getPayrollFormula(row.formula, rowByMetric, column),
          getPayrollFormulaValue(row.formula, year, rowObjectByMetric),
          format,
        );
      } else {
        setCellFormat(sheet, rowNumber, column, format);
      }
    });
  }

  setColumnWidths(sheet, [24, 30, 16, 16, 18, ...payload.years.map(() => 14)]);
  setAutofilter(sheet, `A1:${cellAddress(1, 5 + payload.years.length)}`);
  return { sheet, rowByMetric };
}

function buildScenarioSummarySheet(
  payload: ExportWorkbookPayload,
  payrollRowByMetric: Record<string, number>,
  headcountGrandTotalRow: number,
): XLSX.WorkSheet {
  const metrics = [
    "Students",
    "Turmas",
    "Revenue",
    "Total Payroll",
    "Payroll Margin",
    "Coverage Ratio",
    "Non-Teaching Headcount",
  ];
  const rows: unknown[][] = [
    ["Metric", "Scenario", "Tuition Table", "Margin Mode", ...payload.years.map(String)],
    ...metrics.map((metric) => [
      metric,
      payload.scenario,
      payload.tuitionScenario,
      payload.marginMode,
      ...payload.years.map(() => null),
    ]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const annualStartColumn = 5;
  const overviewByYear = Object.fromEntries(payload.overviewRows.map((row) => [row.year, row]));
  const summaryValue = (metric: string, year: number): number => {
    const row = overviewByYear[year];
    if (metric === "Students") return row?.students ?? 0;
    if (metric === "Turmas") return row?.turmas ?? 0;
    if (metric === "Revenue") return row?.revenue ?? 0;
    if (metric === "Total Payroll") return row?.totalPayroll ?? 0;
    if (metric === "Payroll Margin") return row?.margin ?? 0;
    if (metric === "Coverage Ratio") return row?.coverageRatio ?? 0;
    if (metric === "Non-Teaching Headcount") {
      return payload.nonTeachingHeadcountRows.reduce(
        (sum, headcountRow) => sum + (headcountRow.headcountByYear[year] ?? 0),
        0,
      );
    }
    return 0;
  };

  metrics.forEach((metric, index) => {
    const row = index + 2;
    payload.years.forEach((year, yearIndex) => {
      const column = annualStartColumn + yearIndex;
      const sourceColumn = 6 + yearIndex;
      const value = summaryValue(metric, year);
      if (metric === "Non-Teaching Headcount") {
        sheet[cellAddress(row, column)] = makeFormulaCell(
          quotedSheetRef("Non-Teaching Headcount Plan", headcountGrandTotalRow, 10 + yearIndex),
          value,
          integerFormat,
        );
      } else {
        const sourceRow = payrollRowByMetric[metric];
        const format = metric === "Coverage Ratio" ? percentFormat : metric === "Students" || metric === "Turmas" ? integerFormat : currencyFormat;
        sheet[cellAddress(row, column)] = makeFormulaCell(
          quotedSheetRef("Payroll Projection", sourceRow, sourceColumn),
          value,
          format,
        );
      }
    });
  });

  setColumnWidths(sheet, [28, 16, 16, 18, ...payload.years.map(() => 14)]);
  setAutofilter(sheet, `A1:${cellAddress(1, 4 + payload.years.length)}`);
  return sheet;
}

function buildCalculationLogicSheet(): XLSX.WorkSheet {
  const rows = [
    ["Topic", "Logic"],
    ["Workbook Scope", "Staffing and payroll planning only. Viability, CAPEX, cash flow, NPV, IRR, and payback are intentionally excluded."],
    ["Headcount Carry-Forward", "Each role has explicit headcount step years. For each annual column, the latest explicit headcount at or before that year is used."],
    ["No Headcount Source", "If a role has no headcount progression, the exported headcount remains zero across the horizon."],
    ["Role Activation Timing", "activeFrom controls when compensation projection begins. Headcount progression controls how many people are counted."],
    ["Allocation Model", "Modelo de Alocação is exported directly from the live model as FOPAG_DIRETO or FOLHA_DIRETA."],
    ["Base Monthly Compensation", "Role-level base monthly compensation fields are stored source-of-truth reference values: Salário Mensal Base, Encargos Mensais Base, and Benefícios Mensais Base. They are not year-adjusted live payroll values."],
    ["Base Monthly Position Cost", "Custo Mensal Base da Posição is a workbook formula using only stored reference values: Salário Mensal Base + Encargos Mensais Base + Benefícios Mensais Base."],
    ["Projected Compensation Scale", "Projected annual payroll uses the live 6% compensation scale. Gross salary, labor charges, and benefits all use the same annual growth factor."],
    ["Later-Starting Roles", "Roles are inactive before activeFrom. Once active, they enter at the global year-adjusted compensation scale for that year rather than restarting at stored base values."],
    ["Projected First Active Year Fields", "Role Audit includes first-active-year monthly gross, labor, benefits, and loaded cost as numeric values exported from the live model, not workbook growth formulas."],
    ["Gross + Labor Payroll", "Annual gross + labor uses projected monthly salary and charges annualized by 13."],
    ["Benefits Payroll", "Annual benefits use projected monthly benefits annualized by 12."],
    ["Teaching Rule", "Teaching payroll is scenario-responsive through students and turmas."],
    ["Non-Teaching Rule", "Leadership, backoffice, and specialists remain shared/global across scenarios."],
    ["Operating Horizon", "The operating horizon is 2028-2047, with 2028 as the tuition and operating base year."],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  setColumnWidths(sheet, [28, 120]);
  setAutofilter(sheet, "A1:B1");
  return sheet;
}

export function buildStaffingPayrollWorkbook(payload: ExportWorkbookPayload): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const inputsSheet = buildInputsSheet(payload);
  const headcountPlan = buildHeadcountPlanSheet(payload);
  const roleAuditSheet = buildRoleAuditSheet(payload);
  const payrollProjection = buildPayrollProjectionSheet(payload);
  const scenarioSummary = buildScenarioSummarySheet(
    payload,
    payrollProjection.rowByMetric ?? {},
    headcountPlan.grandTotalRow ?? 1,
  );
  const calculationLogic = buildCalculationLogicSheet();

  appendSheet(workbook, scenarioSummary, STAFFING_PAYROLL_SHEET_NAMES[0]);
  appendSheet(workbook, inputsSheet, STAFFING_PAYROLL_SHEET_NAMES[1]);
  appendSheet(workbook, headcountPlan.sheet, STAFFING_PAYROLL_SHEET_NAMES[2]);
  appendSheet(workbook, roleAuditSheet, STAFFING_PAYROLL_SHEET_NAMES[3]);
  appendSheet(workbook, payrollProjection.sheet, STAFFING_PAYROLL_SHEET_NAMES[4]);
  appendSheet(workbook, calculationLogic, STAFFING_PAYROLL_SHEET_NAMES[5]);

  return workbook;
}

export const downloadTenYearProjectionXlsx = ({
  payload,
  scenario,
  tuitionScenario,
  marginMode,
}: DownloadProjectionParams) => {
  const workbook = buildStaffingPayrollWorkbook(payload);
  const projectionRangeLabel = getProjectionRangeLabel(payload.years);
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(
    workbook,
    `staffing-payroll-planning-${projectionRangeLabel}-${scenario}-${tuitionScenario}-${marginMode}-${stamp}.xlsx`,
  );
};
