// V10-X1 (2026-07-27): detailed per-scenario payroll export workbook builder.
// Builds the 7 required sheets (Scenario Summary, FOPAG Headcount Plan, FOPAG
// Role Audit, FOPAG Payroll Projection, Payroll Detail, DRE Payroll Bridge,
// Source and Formula Governance) for one PayrollExportScenarioResult.
//
// Deterministic-calculation rule: this module performs NO independent
// calculation. All values originate from calculateFopag()/calculateDre()
// output (via payrollExportScenarioAdapter.ts). Salary/benefits/encargos
// per-FTE figures are recomputed using the exact governed functions in
// src/lib/payroll/payrollGrowth.ts (toSalaryBase2028, salaryMonthlyForYear,
// laborChargesMonthlyForSalary, benefitsMonthlyForYear) — the same functions
// fopagEngine.ts itself calls — never a reimplementation. Formula cells follow
// the {t,v,f} pattern already established in dreScenarioWorkbook.ts: v is the
// engine-computed cached value, f is the in-workbook Excel formula string
// (no leading "=").
import * as XLSX from "xlsx";
import { roundCurrency } from "../../../lib/payroll/core";
import {
  toSalaryBase2028,
  toBenefitsBase2028,
  resolveSalaryGrowthFactor,
  resolveBenefitsGrowthFactor,
  salaryMonthlyForYear,
  benefitsMonthlyForYear,
  laborChargesMonthlyForSalary,
  ENCARGOS_RATE,
  SALARY_ESCALATION_RATE_2029_PLUS,
  BENEFITS_ESCALATION_RATE_2029_PLUS,
  V10_PAYROLL_SOURCE_SALARY,
  V10_PAYROLL_SOURCE_BENEFITS,
} from "../../../lib/payroll/payrollGrowth";
import {
  getBoardDisplayLabel,
  getDivisionArea,
  getRoleGroupOrHub,
  getSourceTypeLabel,
} from "./orgDesignHcTableAdapter";
import { ORG_DESIGN_PAYROLL_ACTIVATION } from "./orgDesignPayrollActivation";
import { PAYROLL_EXPORT_HORIZON_YEARS } from "./payrollExportMatrixContract";
import type { PayrollExportScenarioResult } from "./payrollExportScenarioAdapter";
import type { FopagCalculatedRecord } from "./fopagEngineContract";

export interface PayrollExportWorkbookMeta {
  readonly applicationCommitHash: string;
  readonly generationTimestampIso: string;
  readonly exportGeneratorVersion: string;
  readonly validationStatus: string;
}

const YEARS = PAYROLL_EXPORT_HORIZON_YEARS;
const RECONCILIATION_TOLERANCE = 0.01;

function cellRef(row0: number, col0: number): string {
  return XLSX.utils.encode_cell({ r: row0, c: col0 });
}

function qsheet(name: string): string {
  return `'${name}'`;
}

function setFormulaCell(
  sheet: XLSX.WorkSheet,
  row0: number,
  col0: number,
  value: number | string,
  formula: string,
): void {
  const ref = cellRef(row0, col0);
  sheet[ref] =
    typeof value === "number"
      ? { t: "n", v: value, f: formula }
      : { t: "s", v: value, f: formula };
}

// ── Sheet 5: Payroll Detail row-level data (also feeds Sheets 2-4 via lookup) ─

export interface RoleYearDetail {
  readonly roleId: string;
  readonly displayLabel: string;
  readonly year: number;
  readonly rec: FopagCalculatedRecord;
  readonly activeHc: number;
  readonly salaryBase2028: number;
  readonly salaryGrowthFactor: number;
  readonly monthlySalary: number;
  readonly annualSalary: number;
  readonly monthlyEncargos: number;
  readonly annualEncargos: number;
  readonly benefitsBase2028: number;
  readonly benefitsGrowthFactor: number;
  readonly monthlyBenefits: number;
  readonly annualBenefits: number;
  readonly annualPayrollPerFte: number;
  readonly totalAnnualRolePayroll: number;
}

// Export-layer-only completeness fix (spec section 10): some roles have no
// adapter record at all for a given year (e.g. a grade that does not exist
// yet for a given opening package in its first governed year) — not even an
// audit row, because the canonical adapter never emits one when the
// underlying grade/section is not applicable. This does NOT alter the
// calculation engine; it only ensures the export's own role×year grid is
// complete, synthesizing a zero row for display. calculateFopag() itself is
// never modified or bypassed for any year that DOES have a record.
function fillMissingYearRecords(
  records: readonly FopagCalculatedRecord[],
): FopagCalculatedRecord[] {
  const byRole = new Map<string, FopagCalculatedRecord[]>();
  for (const r of records) {
    if (!byRole.has(r.roleId)) byRole.set(r.roleId, []);
    byRole.get(r.roleId)!.push(r);
  }

  const filled: FopagCalculatedRecord[] = [];
  for (const recs of byRole.values()) {
    const byYear = new Map(recs.map((r) => [r.year, r]));
    const template = recs[0]!;
    for (const year of YEARS) {
      const existing = byYear.get(year);
      if (existing) {
        filled.push(existing);
        continue;
      }
      filled.push({
        ...template,
        year,
        headcountOrFte: 0,
        grossLaborAnnualBeforeGrowth: 0,
        benefitsAnnualBeforeGrowth: 0,
        grossLaborAnnualAfterGrowth: 0,
        benefitsAnnualAfterGrowth: 0,
        totalAnnualPayrollAfterGrowth: 0,
        salaryGrowthFactor: resolveSalaryGrowthFactor(year),
        benefitsGrowthFactor: resolveBenefitsGrowthFactor(year),
        isAuditRow: true,
        diagnostics: [],
        sourceNotes:
          "Synthesized zero row (export layer only, not a runtime engine record) — " +
          "no adapter record exists for this role/year; role or grade is not applicable " +
          "for this opening package in this year. See FOPAG Role Audit sheet.",
      });
    }
  }
  return filled;
}

// V10-RC2.5 Gate 3/Tranche C: takes FOPAG records directly (not the fixed-
// matrix PayrollExportScenarioResult wrapper) — the only field this function
// ever used from that wrapper was fopagOutput.records, so this also lets the
// live Org Design export (orgDesignExportWorkbookBuilder.ts, no
// PayrollExportMatrixRecord involved) reuse the identical role/year
// escalation logic rather than re-deriving it.
export function buildRoleYearDetails(
  fopagRecords: readonly FopagCalculatedRecord[],
): readonly RoleYearDetail[] {
  const sorted = [...fillMissingYearRecords(fopagRecords)].sort(
    (a, b) => a.year - b.year || a.roleId.localeCompare(b.roleId),
  );

  return sorted.map((rec) => {
    const activeHc = rec.isAuditRow ? 0 : rec.headcountOrFte;
    const salaryBase2028 = toSalaryBase2028(rec.grossMonthly);
    const benefitsBase2028 = toBenefitsBase2028(rec.benefitsMonthly);
    const salaryGrowthFactor = resolveSalaryGrowthFactor(rec.year);
    const benefitsGrowthFactor = resolveBenefitsGrowthFactor(rec.year);
    const monthlySalary = salaryMonthlyForYear(salaryBase2028, rec.year);
    const monthlyEncargos = laborChargesMonthlyForSalary(monthlySalary);
    const monthlyBenefits = benefitsMonthlyForYear(benefitsBase2028, rec.year);
    const annualPayrollPerFte = roundCurrency(
      monthlySalary * (1 + ENCARGOS_RATE) * 13 + monthlyBenefits * 12,
    );

    // Annual role totals are derived algebraically from the engine's own
    // authoritative annualized figures (rec.grossLaborAnnualAfterGrowth /
    // rec.benefitsAnnualAfterGrowth, both already ×headcount and already
    // roundCurrency'd by fopagEngine.ts) rather than recomputed bottom-up, so
    // that Annual Salary + Annual Encargos + Annual Benefits reconciles
    // exactly to rec.totalAnnualPayrollAfterGrowth with zero rounding drift.
    // grossLaborAnnualAfterGrowth = salaryMonthly × (1+ENCARGOS_RATE) × 13 × hc,
    // so salary's share = grossLaborAnnualAfterGrowth / (1+ENCARGOS_RATE).
    const grossLaborAnnual = rec.isAuditRow ? 0 : rec.grossLaborAnnualAfterGrowth;
    const annualSalary = roundCurrency(grossLaborAnnual / (1 + ENCARGOS_RATE));
    const annualEncargos = roundCurrency(grossLaborAnnual - annualSalary);
    const annualBenefits = rec.isAuditRow ? 0 : rec.benefitsAnnualAfterGrowth;
    const totalAnnualRolePayroll = rec.isAuditRow ? 0 : rec.totalAnnualPayrollAfterGrowth;

    return {
      roleId: rec.roleId,
      displayLabel: getBoardDisplayLabel(rec),
      year: rec.year,
      rec,
      activeHc,
      salaryBase2028,
      salaryGrowthFactor,
      monthlySalary,
      annualSalary,
      monthlyEncargos,
      annualEncargos,
      benefitsBase2028,
      benefitsGrowthFactor,
      monthlyBenefits,
      annualBenefits,
      annualPayrollPerFte,
      totalAnnualRolePayroll,
    };
  });
}

const PD_HEADER = [
  "Year",
  "Role ID",
  "Role",
  "Active Headcount/FTE",
  "Salary Base 2028 (Monthly, per FTE)",
  "Salary Growth Factor",
  "Monthly Salary (per FTE, after growth)",
  "Annual Salary (role total)",
  "Monthly Encargos (per FTE, after growth)",
  "Annual Encargos (role total)",
  "Benefits Base 2028 (Monthly, per FTE)",
  "Benefits Growth Factor",
  "Monthly Benefits (per FTE, after growth)",
  "Annual Benefits (role total)",
  "Annual Payroll per FTE",
  "Total Annual Role Payroll",
];
const PD_DATA_START_ROW0 = 2; // note row (0), header row (1), data from row index 2
const PD_COL = {
  year: 0,
  roleId: 1,
  role: 2,
  hc: 3,
  salaryBase: 4,
  salaryGrowth: 5,
  monthlySalary: 6,
  annualSalary: 7,
  monthlyEncargos: 8,
  annualEncargos: 9,
  benefitsBase: 10,
  benefitsGrowth: 11,
  monthlyBenefits: 12,
  annualBenefits: 13,
  payrollPerFte: 14,
  totalRolePayroll: 15,
};
const PAYROLL_DETAIL_SHEET_NAME = "Payroll Detail";
const PD_SUMIF_ROW_END = PD_DATA_START_ROW0 + 5000; // generous headroom (roles × 20 years)

function buildPayrollDetailSheet(details: readonly RoleYearDetail[]): XLSX.WorkSheet {
  const noteRow = [
    "Payroll Detail — role-by-year. Total Annual Role Payroll = Annual Salary + Annual " +
      "Encargos + Annual Benefits (in-sheet formula). Values for years before a role's " +
      "activation are retained with Active Headcount/FTE = 0 and Total Annual Role Payroll = 0.",
  ];
  const rows: (string | number | boolean)[][] = [noteRow, PD_HEADER];

  for (const d of details) {
    rows.push([
      d.year,
      d.roleId,
      d.displayLabel,
      d.activeHc,
      d.salaryBase2028,
      d.salaryGrowthFactor,
      d.monthlySalary,
      d.annualSalary,
      d.monthlyEncargos,
      d.annualEncargos,
      d.benefitsBase2028,
      d.benefitsGrowthFactor,
      d.monthlyBenefits,
      d.annualBenefits,
      d.annualPayrollPerFte,
      d.totalAnnualRolePayroll,
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  // Overwrite Total Annual Role Payroll with an in-sheet formula (spec section 12).
  details.forEach((d, i) => {
    const row0 = PD_DATA_START_ROW0 + i;
    const salaryRef = cellRef(row0, PD_COL.annualSalary);
    const encargosRef = cellRef(row0, PD_COL.annualEncargos);
    const benefitsRef = cellRef(row0, PD_COL.annualBenefits);
    setFormulaCell(
      sheet,
      row0,
      PD_COL.totalRolePayroll,
      d.totalAnnualRolePayroll,
      `${salaryRef}+${encargosRef}+${benefitsRef}`,
    );
  });

  return sheet;
}

// ── Sheet 4: FOPAG Payroll Projection (annual totals by metric, one col/year) ─

export const FPP_METRIC_ROWS = [
  { label: "Headcount / FTE (active)", pdCol: PD_COL.hc },
  { label: "Salary", pdCol: PD_COL.annualSalary },
  { label: "Encargos", pdCol: PD_COL.annualEncargos },
  { label: "Benefits", pdCol: PD_COL.annualBenefits },
  { label: "Total Payroll", pdCol: PD_COL.totalRolePayroll },
] as const;
export { PD_COL };
const FOPAG_PAYROLL_PROJECTION_SHEET_NAME = "FOPAG Payroll Projection";
// Row0 layout: 0 = note, 1 = header, 2..6 = the five metric rows above (in order).
const FPP_METRIC_ROW0_START = 2;

function pdColLetterRange(col0: number): string {
  const colRef = XLSX.utils.encode_col(col0);
  return `${qsheet(PAYROLL_DETAIL_SHEET_NAME)}!$${colRef}$${PD_DATA_START_ROW0 + 1}:$${colRef}$${PD_SUMIF_ROW_END + 1}`;
}

export function fppMetricYearTotal(
  details: readonly RoleYearDetail[],
  pdCol: number,
  year: number,
): number {
  const yearDetails = details.filter((d) => d.year === year);
  switch (pdCol) {
    case PD_COL.hc:
      return yearDetails.reduce((sum, d) => sum + d.activeHc, 0);
    case PD_COL.annualSalary:
      return roundCurrency(yearDetails.reduce((sum, d) => sum + d.annualSalary, 0));
    case PD_COL.annualEncargos:
      return roundCurrency(yearDetails.reduce((sum, d) => sum + d.annualEncargos, 0));
    case PD_COL.annualBenefits:
      return roundCurrency(yearDetails.reduce((sum, d) => sum + d.annualBenefits, 0));
    default:
      return roundCurrency(yearDetails.reduce((sum, d) => sum + d.totalAnnualRolePayroll, 0));
  }
}

function buildFopagPayrollProjectionSheet(
  details: readonly RoleYearDetail[],
): XLSX.WorkSheet {
  const noteRow = [
    "FOPAG Payroll Projection — annual totals by metric, one column per year (2028-2047). " +
      "Each year cell is a SUMIF formula over the Payroll Detail sheet (role-level rows), " +
      "so totals reference the detailed role calculations rather than being independently computed.",
  ];
  const header = ["Metric", ...YEARS.map(String)];
  const rows: (string | number)[][] = [noteRow, header];

  for (const metric of FPP_METRIC_ROWS) {
    const rowValues = YEARS.map((year) => fppMetricYearTotal(details, metric.pdCol, year));
    rows.push([metric.label, ...rowValues]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  FPP_METRIC_ROWS.forEach((metric, metricIdx) => {
    const row0 = FPP_METRIC_ROW0_START + metricIdx;
    YEARS.forEach((year, yearIdx) => {
      const col0 = 1 + yearIdx;
      const pdRange = pdColLetterRange(metric.pdCol);
      const yearMatchRange = `${qsheet(PAYROLL_DETAIL_SHEET_NAME)}!$A$${PD_DATA_START_ROW0 + 1}:$A$${PD_SUMIF_ROW_END + 1}`;
      const formula = `SUMIF(${yearMatchRange},${year},${pdRange})`;
      const cached = sheet[cellRef(row0, col0)];
      const cachedValue = cached && typeof cached.v === "number" ? cached.v : 0;
      setFormulaCell(sheet, row0, col0, cachedValue, formula);
    });
  });

  return sheet;
}

// ── Sheet 2: FOPAG Headcount Plan (one row per role, one column per year) ────

function buildFopagHeadcountPlanSheet(
  scenarioResult: PayrollExportScenarioResult,
): XLSX.WorkSheet {
  const { fopagOutput, record } = scenarioResult;
  const roleIds = [...new Set(fopagOutput.records.map((r) => r.roleId))].sort();

  const noteRow = [
    `FOPAG Headcount Plan — every governed role for ${record.payrollLabel} ` +
      `(${record.orgDesignOptionId}). Years before activation are retained with Headcount/FTE = 0.`,
  ];
  const header = [
    "Role ID",
    "Role",
    "Category",
    "Division / Area",
    "Role Group / Hub",
    "Org Design Scenario Membership",
    "Allocation Model",
    "First Active Year",
    ...YEARS.map(String),
    "Source Rule",
  ];
  const rows: (string | number)[][] = [noteRow, header];

  for (const roleId of roleIds) {
    const recsByYear = new Map(
      fopagOutput.records.filter((r) => r.roleId === roleId).map((r) => [r.year, r]),
    );
    const rep = recsByYear.get(YEARS[0]) ?? [...recsByYear.values()][0]!;
    const activeYears = [...recsByYear.values()].filter((r) => !r.isAuditRow);
    const firstActiveYear =
      activeYears.length > 0 ? Math.min(...activeYears.map((r) => r.year)) : "never";
    const isHubActive = record.orgDesignOptionId !== "minimum_experience";
    const divisionArea = getDivisionArea(rep, isHubActive);
    const roleGroupOrHub = getRoleGroupOrHub(rep, divisionArea);
    const displayLabel = getBoardDisplayLabel(rep);

    const hcByYear = YEARS.map((year) => {
      const rec = recsByYear.get(year);
      if (!rec || rec.isAuditRow) return 0;
      return rec.headcountOrFte;
    });

    rows.push([
      roleId,
      displayLabel,
      getSourceTypeLabel(rep.roleSourceType),
      divisionArea,
      roleGroupOrHub,
      record.payrollLabel,
      rep.allocationModel,
      firstActiveYear,
      ...hcByYear,
      rep.sourceNotes ?? "",
    ]);
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 3: FOPAG Role Audit ─────────────────────────────────────────────────

function buildFopagRoleAuditSheet(
  scenarioResult: PayrollExportScenarioResult,
): XLSX.WorkSheet {
  const { fopagOutput, record } = scenarioResult;
  const roleIds = [...new Set(fopagOutput.records.map((r) => r.roleId))].sort();

  const noteRow = [
    `FOPAG Role Audit — role inclusion and source completeness for ${record.payrollLabel}. ` +
      "Encargos is exported from the existing app/FOPAG model and already includes applicable " +
      "Brazilian payroll charges; the workbook does not recalculate these charges.",
  ];
  const header = [
    "Role ID",
    "Application Role Name",
    "Source Role Name",
    "Org Design Scenario Inclusion",
    "Activation Source",
    "Headcount Source",
    "Salary Source",
    "Benefits Source",
    "Salary Provenance",
    "Benefits Provenance",
    "Mapped / Unmapped Status",
    "Governance Notes",
  ];
  const rows: (string | number | boolean)[][] = [noteRow, header];

  for (const roleId of roleIds) {
    const recs = fopagOutput.records.filter((r) => r.roleId === roleId);
    const rep = recs[0]!;
    const activation = ORG_DESIGN_PAYROLL_ACTIVATION.records.find(
      (a) => a.sourceRoleId === roleId,
    );
    const mapped = activation !== undefined;

    rows.push([
      roleId,
      getBoardDisplayLabel(rep),
      rep.roleName,
      `Included in ${record.payrollLabel} (${record.orgDesignOptionId})`,
      activation?.activationYearSource ?? "—",
      "fopagEngine.ts calculateFopag() via payrollAdapter.ts buildPayrollAdapterInput()",
      activation?.costSource ?? "—",
      activation?.costSource ?? "—",
      `${V10_PAYROLL_SOURCE_SALARY.workbook}, sheet ${V10_PAYROLL_SOURCE_SALARY.sheet} row ${V10_PAYROLL_SOURCE_SALARY.row} (${V10_PAYROLL_SOURCE_SALARY.rowLabel})`,
      `${V10_PAYROLL_SOURCE_BENEFITS.workbook}, sheet ${V10_PAYROLL_SOURCE_BENEFITS.sheet} row ${V10_PAYROLL_SOURCE_BENEFITS.row} (${V10_PAYROLL_SOURCE_BENEFITS.rowLabel})`,
      mapped ? "mapped" : "unmapped (fallback classification)",
      rep.sourceNotes ?? "",
    ]);
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 6: DRE Payroll Bridge ───────────────────────────────────────────────

const DRE_BRIDGE_SHEET_NAME = "DRE Payroll Bridge";

function buildDrePayrollBridgeSheet(
  scenarioResult: PayrollExportScenarioResult,
): XLSX.WorkSheet {
  const noteRow = [
    "DRE Payroll Bridge — FOPAG Total Payroll references the FOPAG Payroll Projection sheet. " +
      "DRE Payroll Value is the sum of DRE fopag_direto_clt_pj + folha_de_pagamento + beneficios " +
      "for the year (DRE convention: costs stored negative). BRL Difference = FOPAG Total + DRE " +
      "Payroll Value; reconciled years yield 0 subject to the documented currency rounding convention.",
  ];
  const header = ["Year", "FOPAG Total Payroll", "DRE Payroll Value", "BRL Difference", "Reconciliation Status"];
  const rows: (string | number)[][] = [noteRow, header];

  const totalRow0 = FPP_METRIC_ROW0_START + FPP_METRIC_ROWS.length - 1; // "Total Payroll" row

  for (const year of YEARS) {
    const dreRow = scenarioResult.dreOutput.byYear[year];
    const dreValue = roundCurrency(
      dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios,
    );
    const fopagTotal =
      scenarioResult.fopagOutput.yearTotals.find((y) => y.year === year)?.totalPayroll ?? 0;
    const difference = roundCurrency(fopagTotal + dreValue);
    rows.push([
      year,
      fopagTotal,
      dreValue,
      difference,
      Math.abs(difference) < RECONCILIATION_TOLERANCE ? "OK" : "MISMATCH",
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  YEARS.forEach((year, i) => {
    const row0 = 2 + i;
    const yearIdx = YEARS.indexOf(year);
    const fppYearCol0 = 1 + yearIdx;
    const fopagTotalRef = `${qsheet(FOPAG_PAYROLL_PROJECTION_SHEET_NAME)}!${cellRef(totalRow0, fppYearCol0)}`;

    const fopagTotal =
      scenarioResult.fopagOutput.yearTotals.find((y) => y.year === year)?.totalPayroll ?? 0;
    setFormulaCell(sheet, row0, 1, fopagTotal, fopagTotalRef);

    const dreRow = scenarioResult.dreOutput.byYear[year];
    const dreValue = roundCurrency(
      dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios,
    );
    const difference = roundCurrency(fopagTotal + dreValue);
    const differenceRef = cellRef(row0, 3);
    sheet[cellRef(row0, 2)] = { t: "n", v: dreValue }; // plain DRE value (see note row); sourced directly from dreEngine, not another sheet in this workbook
    setFormulaCell(sheet, row0, 3, difference, `${cellRef(row0, 1)}+${cellRef(row0, 2)}`);
    setFormulaCell(
      sheet,
      row0,
      4,
      Math.abs(difference) < RECONCILIATION_TOLERANCE ? "OK" : "MISMATCH",
      `IF(ABS(${differenceRef})<${RECONCILIATION_TOLERANCE},"OK","MISMATCH")`,
    );
  });

  return sheet;
}

// ── Sheet 1: Scenario Summary ─────────────────────────────────────────────────

function buildScenarioSummarySheet(
  scenarioResult: PayrollExportScenarioResult,
  meta: PayrollExportWorkbookMeta,
  details: readonly RoleYearDetail[],
): XLSX.WorkSheet {
  const { record } = scenarioResult;
  const rows: (string | number)[][] = [
    ["Scenario", record.displayLabel],
    ["Matrix Scenario ID", record.matrixScenarioId],
    ["Internal Opening Package ID", record.openingPackageId],
    ["Internal Org Design Option ID", record.orgDesignOptionId],
    ["Internal Occupancy Scenario ID", record.occupancyScenarioId],
    ["Opening Package", record.openingPackageLabel],
    ["Payroll Label", record.payrollLabel],
    ["Occupancy Scenario", record.occupancyLabel],
    ["Model Horizon", `${record.horizonStartYear}-${record.horizonEndYear}`],
    ["Generation Timestamp", meta.generationTimestampIso],
    ["Application Commit Hash", meta.applicationCommitHash],
    ["Fixed Lever — Tuition Scenario ID", record.fixedLevers.tuitionScenarioId],
    [],
    ["Annual Series", ...YEARS.map(String)],
  ];

  const enrollmentRow: (string | number)[] = [
    "Annual Enrollment",
    ...YEARS.map((y) => scenarioResult.dreOutput.byYear[y].numero_de_alunos),
  ];
  rows.push(enrollmentRow);

  for (const metric of FPP_METRIC_ROWS) {
    rows.push([metric.label]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const seriesHeaderRow0 = rows.findIndex((r) => r[0] === "Annual Series");
  const metricRowStart0 = seriesHeaderRow0 + 2; // enrollment row is +1, metrics start +2

  FPP_METRIC_ROWS.forEach((metric, metricIdx) => {
    const row0 = metricRowStart0 + metricIdx;
    const fppRow0 = FPP_METRIC_ROW0_START + metricIdx;
    YEARS.forEach((year, yearIdx) => {
      const col0 = 1 + yearIdx;
      const ref = `${qsheet(FOPAG_PAYROLL_PROJECTION_SHEET_NAME)}!${cellRef(fppRow0, col0)}`;
      const cached = fppMetricYearTotal(details, metric.pdCol, year);
      setFormulaCell(sheet, row0, col0, cached, ref);
    });
  });

  return sheet;
}

// ── Sheet 7: Source and Formula Governance ────────────────────────────────────

function buildSourceAndFormulaGovernanceSheet(
  scenarioResult: PayrollExportScenarioResult,
  meta: PayrollExportWorkbookMeta,
): XLSX.WorkSheet {
  const { record } = scenarioResult;
  const rows: (string | number)[][] = [
    ["Source Workbook Filename", V10_PAYROLL_SOURCE_SALARY.workbook],
    ["Source Workbook SHA-256", V10_PAYROLL_SOURCE_SALARY.sha256],
    ["Application Commit Hash", meta.applicationCommitHash],
    ["Enrollment Source", "receitaEngine.ts / dreEngine.ts calculateDre() → dreOutput.byYear[year].numero_de_alunos"],
    ["Occupancy Source", `openingPackageOccupancySourceDataContract.ts — occupancyScenarioId = "${record.occupancyScenarioId}"`],
    ["Org Design Source", `payrollAdapter.ts / orgDesignPayrollActivation.ts — orgDesignOptionId = "${record.orgDesignOptionId}"`],
    ["Salary Source Row", `${V10_PAYROLL_SOURCE_SALARY.sheet}!row ${V10_PAYROLL_SOURCE_SALARY.row} (${V10_PAYROLL_SOURCE_SALARY.rowLabel})`],
    ["Benefits Source Row", `${V10_PAYROLL_SOURCE_BENEFITS.sheet}!row ${V10_PAYROLL_SOURCE_BENEFITS.row} (${V10_PAYROLL_SOURCE_BENEFITS.rowLabel})`],
    ["Salary Escalation", `salaryBase2028 at 2028; ×${1 + SALARY_ESCALATION_RATE_2029_PLUS}^(year-2028) from 2029 onward`],
    ["Benefits Escalation", `benefitsBase2028 at 2028; ×${1 + BENEFITS_ESCALATION_RATE_2029_PLUS}^(year-2028) from 2029 onward`],
    ["Encargos", `salaryMonthly × ${ENCARGOS_RATE} (${ENCARGOS_RATE * 100}%); never applied to benefits`],
    ["Salary Annualization", "monthlySalary × (1 + encargos rate) × 13"],
    ["Benefits Annualization", "monthlyBenefits × 12"],
    ["2028-Base Treatment", "salaryBase2028 = toSalaryBase2028(storedGrossMonthly); benefitsBase2028 = toBenefitsBase2028(storedBenefitsMonthly) — src/lib/payroll/payrollGrowth.ts"],
    ["Export Generator Version", meta.exportGeneratorVersion],
    ["Validation Status", meta.validationStatus],
  ];
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function buildPayrollExportDetailedWorkbook(
  scenarioResult: PayrollExportScenarioResult,
  meta: PayrollExportWorkbookMeta,
): XLSX.WorkBook {
  const details = buildRoleYearDetails(scenarioResult.fopagOutput.records);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildScenarioSummarySheet(scenarioResult, meta, details), "Scenario Summary");
  XLSX.utils.book_append_sheet(wb, buildFopagHeadcountPlanSheet(scenarioResult), "FOPAG Headcount Plan");
  XLSX.utils.book_append_sheet(wb, buildFopagRoleAuditSheet(scenarioResult), "FOPAG Role Audit");
  XLSX.utils.book_append_sheet(wb, buildFopagPayrollProjectionSheet(details), FOPAG_PAYROLL_PROJECTION_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildPayrollDetailSheet(details), PAYROLL_DETAIL_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildDrePayrollBridgeSheet(scenarioResult), DRE_BRIDGE_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildSourceAndFormulaGovernanceSheet(scenarioResult, meta), "Source and Formula Governance");

  return wb;
}
