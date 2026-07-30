// V10-RC2.5 Gate 3/Tranche C — Executive Org Design export workbook.
//
// No export existed for the Org Design tab before this phase. This module
// creates one, modeled on the same conventions payrollExportWorkbookBuilder.ts
// already established for the live Payroll export: engine-computed cached
// value + in-workbook Excel formula string ({t,v,f} cells via
// setFormulaCell()), no leading "=". Every number originates from
// calculateFopag()/calculateDre()/buildOrgDesignHcTable()/
// buildPayrollGradeDetailRows() — the same shared engines both tabs consume
// — never recomputed or reimplemented here.
//
// Because these live/formatting conventions did not exist for Org Design
// before this phase, this module ESTABLISHES formatting explicitly rather
// than claiming to "preserve" a prior house style — there was none for this
// surface. The dead src/lib/payroll/exportXlsx.ts is not imported or reused
// as a competing export engine; it is not referenced at all here.
import * as XLSX from "xlsx";
import { calculateFopag } from "./fopagEngine";
import { calculateDre } from "./dreEngine";
import { buildOrgDesignHcTable } from "./orgDesignHcTableAdapter";
import { buildPayrollGradeDetailRows, type PayrollGradeDetailRow } from "./payrollGradeDetailAdapter";
import { MS_FTE_BY_GRADE, HS_FTE_BY_GRADE } from "./payrollAdapter";
import {
  buildRoleYearDetails,
  fppMetricYearTotal,
  FPP_METRIC_ROWS,
  PD_COL,
  type RoleYearDetail,
} from "./payrollExportWorkbookBuilder";
import { GOVERNED_DIRECT_YEARS } from "./governedCaptacaoCapacitySourceData";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "./openingPackageOccupancySourceDataContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "./dreWorkingScenarioContract";
import type { TuitionScenarioId } from "./revenueInputs";
import type { EducatorTierId, EducatorTierSelectionByGrade } from "./payrollAdapterContract";
import { roundCurrency } from "../../../lib/payroll/core";

const YEARS = GOVERNED_DIRECT_YEARS;
const RECONCILIATION_TOLERANCE = 0.01;

export interface OrgDesignExportInput {
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  readonly tuitionScenarioId: TuitionScenarioId;
  readonly educatorTierByGrade: EducatorTierSelectionByGrade;
}

export interface OrgDesignExportMeta {
  readonly applicationCommitHash: string;
  readonly generationTimestampIso: string;
  readonly exportGeneratorVersion: string;
}

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
  sheet[ref] = typeof value === "number" ? { t: "n", v: value, f: formula } : { t: "s", v: value, f: formula };
}

const EDUCATOR_TIER_DISPLAY_LABELS: Record<EducatorTierId, string> = {
  associate: "Associate",
  specialist: "Specialist",
  master: "Master",
  inspirational: "Inspirational",
  distinguished: "Distinguished",
};

// Exported (V10-RC2.5 closure) so validate-v10-rc2-5-gate7-shared-tier-workflow.ts
// can prove Assistant/tier-display parity against dreScenarioWorkbook.ts's
// educatorTierDisplayLabel() by calling both functions at runtime.
export function tierDisplayLabel(educatorTierId: EducatorTierId | null): string {
  if (educatorTierId === null) return "—";
  return EDUCATOR_TIER_DISPLAY_LABELS[educatorTierId];
}

// V10-RC2.5 deterministic export formatting (previously deferred). Scoped to
// this file only — it is the one export surface this phase created outright
// (see the file header), so establishing formatting here isn't retrofitting
// an existing house style onto unrelated pre-existing sheets. A repo-wide
// grep (`!cols`/`!freeze`/`!autofilter`/cell `.z`) found no such convention
// anywhere in the live/governed export system before this change.
//
// Frozen header panes are NOT implemented: verified empirically that this
// SheetJS build's write path (write_ws_xml_sheetviews in node_modules/xlsx)
// only ever emits workbookViewId/rightToLeft — setting `sheet["!freeze"]`
// produces no pane XML and does not survive a write→read round-trip. This is
// a concrete library-version limitation (upgrading past the community build
// would be required), not an omitted checklist item.
const BRL_NUMFMT = "#,##0.00";

function setColumnWidths(sheet: XLSX.WorkSheet, headers: readonly string[]): void {
  sheet["!cols"] = headers.map((h) => ({ wch: Math.max(10, Math.min(48, h.length + 2)) }));
}

function setAutofilter(sheet: XLSX.WorkSheet, headerRow0: number, lastCol0: number, lastRow0: number): void {
  sheet["!autofilter"] = { ref: `${cellRef(headerRow0, 0)}:${cellRef(lastRow0, lastCol0)}` };
}

function applyCurrencyFormat(sheet: XLSX.WorkSheet, row0: number, col0: number): void {
  const cell = sheet[cellRef(row0, col0)];
  if (cell && cell.t === "n") cell.z = BRL_NUMFMT;
}

// ── Sheet 1: Scenario Configuration ───────────────────────────────────────────

function buildScenarioConfigurationSheet(
  input: OrgDesignExportInput,
  meta: OrgDesignExportMeta,
): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    ["Opening Package ID", input.openingPackageId],
    ["Occupancy Scenario ID (Captação)", input.occupancyScenarioId],
    ["Org Design Option ID", input.orgDesignOptionId],
    ["Tuition Scenario ID", input.tuitionScenarioId],
    ["Model Horizon", `${YEARS[0]}-${YEARS[YEARS.length - 1]}`],
    ["Generation Timestamp", meta.generationTimestampIso],
    ["Application Commit Hash", meta.applicationCommitHash],
    ["Export Generator Version", meta.exportGeneratorVersion],
    [],
    ["Educator Tier Selections (explicit overrides only; unlisted grades use the governed default \"master\")"],
    ["Grade ID", "Selected Educator Tier"],
  ];
  const explicitEntries = Object.entries(input.educatorTierByGrade).filter(([, v]) => v !== undefined);
  if (explicitEntries.length === 0) {
    rows.push(["(none — every grade uses the governed default)", ""]);
  } else {
    for (const [gradeId, tierId] of explicitEntries) {
      rows.push([gradeId, tierDisplayLabel(tierId ?? null)]);
    }
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [{ wch: 65 }, { wch: 45 }];
  return sheet;
}

// ── Sheet 2: Grade Staffing ────────────────────────────────────────────────────
// One row per (grade, year). EY/LS/Grade 6 rows are per-grade, governed
// section-count-derived headcount (payrollGradeDetailAdapter.ts — the same
// adapter GradeStaffingTable.tsx renders). Middle School / High School are
// division-level aggregate rows, not individual grade rows — see
// docs/audits/rio-resilience/phase-v10-rc2-5-gate3-tranche-b-scope.md for why
// (F06: unreconciled MS/HS grade-level sources; the EY/LS educators=sections
// rule is never extrapolated to these grades). The division-level Educator
// tier shown is the tier resolved for that division's governed fixed-FTE
// grades (fanned out uniformly by the shared Grade Staffing Table UI).
const GRADE_STAFFING_SHEET_NAME = "Grade Staffing";

function resolveDivisionTier(gradeIds: readonly string[], educatorTierByGrade: EducatorTierSelectionByGrade): EducatorTierId {
  const first = gradeIds[0];
  return educatorTierByGrade[first] ?? "master";
}

function buildGradeStaffingSheet(input: OrgDesignExportInput): XLSX.WorkSheet {
  const noteRow = [
    "Grade Staffing — one row per grade per year. Early Years / Lower School / Grade 6 rows are governed, " +
      "grade-level values (payrollGradeDetailAdapter.ts). Middle School / High School are division-level " +
      "aggregate rows (see F06 in the blocker register) — Assistant is a fixed, read-only classification " +
      "(exactly one governed compensation tier exists; never a fabricated second tier).",
  ];
  const header = [
    "Year",
    "Grade",
    "Division",
    "Row Basis",
    "Students",
    "Turmas",
    "Students/Turma",
    "Lead Educator FTE",
    "Educator Tier",
    "Assistant FTE",
    "Assistant Tier Classification",
    "Monitor FTE",
    "Total FTE",
  ];
  const rows: (string | number)[][] = [noteRow, header];

  const msGradeIds = Object.keys(MS_FTE_BY_GRADE);
  const hsGradeIds = Object.keys(HS_FTE_BY_GRADE);

  for (const year of YEARS) {
    const gradeDetail: readonly PayrollGradeDetailRow[] = buildPayrollGradeDetailRows({
      openingPackageId: input.openingPackageId,
      occupancyScenarioId: input.occupancyScenarioId,
      orgDesignOptionId: input.orgDesignOptionId,
      year,
    });
    for (const row of gradeDetail) {
      const isDivisionLevelOnly = row.educatorAttribution === "division_level_only";
      const tier = isDivisionLevelOnly ? null : input.educatorTierByGrade[row.shortGradeId] ?? "master";
      rows.push([
        year,
        row.gradeLabel,
        row.division,
        isDivisionLevelOnly ? "division_level_only (Grade 6 — see F06)" : "grade_level_governed",
        row.enrollment ?? "—",
        row.sections ?? "—",
        row.alunosPorTurma ?? "—",
        row.educators ?? "—",
        tierDisplayLabel(tier),
        row.assistants ?? "—",
        isDivisionLevelOnly ? "—" : "Fixed — single governed tier",
        row.monitorApplicable ? (row.monitors ?? "—") : "—",
        row.totalHeadcount ?? "—",
      ]);
    }

    const hcResult = buildOrgDesignHcTable({
      openingPackageId: input.openingPackageId,
      occupancyScenarioId: input.occupancyScenarioId,
      orgDesignOptionId: input.orgDesignOptionId,
      year,
    });
    const msTotal = hcResult.rows.filter((r) => r.divisionArea === "Middle School").reduce((s, r) => s + r.headcountOrFte, 0);
    const hsTotal = hcResult.rows.filter((r) => r.divisionArea === "High School").reduce((s, r) => s + r.headcountOrFte, 0);
    rows.push([
      year,
      "Middle School (division aggregate)",
      "Middle School",
      "division_level_only (F06 — unreconciled MS/HS aggregate estimate)",
      "—",
      "—",
      "—",
      msTotal,
      tierDisplayLabel(resolveDivisionTier(msGradeIds, input.educatorTierByGrade)),
      "—",
      "—",
      "—",
      msTotal,
    ]);
    rows.push([
      year,
      "High School (division aggregate)",
      "High School",
      "division_level_only (F06 — unreconciled MS/HS aggregate estimate)",
      "—",
      "—",
      "—",
      hsTotal,
      tierDisplayLabel(resolveDivisionTier(hsGradeIds, input.educatorTierByGrade)),
      "—",
      "—",
      "—",
      hsTotal,
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  setColumnWidths(sheet, header);
  setAutofilter(sheet, 1, header.length - 1, rows.length - 1);
  return sheet;
}

// ── Sheet 3: Role Payroll Detail (role × year, with Educator Tier) ────────────

const ROLE_PAYROLL_DETAIL_SHEET_NAME = "Role Payroll Detail";
const RPD_HEADER = [
  "Year",
  "Role ID",
  "Role",
  "Active Headcount/FTE",
  "Educator Tier",
  "Monthly Salary (per FTE, after growth)",
  "Annual Salary (role total)",
  "Monthly Encargos (per FTE, after growth)",
  "Annual Encargos (role total)",
  "Monthly Benefits (per FTE, after growth)",
  "Annual Benefits (role total)",
  "Total Annual Role Payroll",
  // Appended (not inserted) so RPD_COL indices 0-11 above — and every
  // formula/SUMIF range keyed to them below — are unaffected. Same raw
  // FopagCalculatedRecord fields the live Payroll export discloses in its
  // own Payroll Detail sheet (dreScenarioWorkbook.ts), so compensation-source
  // disclosure (incl. for Assistant/non-tier roles) reads identically in
  // both live exports.
  "Role Source Type",
  "Allocation Model",
];
const RPD_DATA_START_ROW0 = 2;
const RPD_COL = {
  year: 0,
  roleId: 1,
  role: 2,
  hc: 3,
  tier: 4,
  monthlySalary: 5,
  annualSalary: 6,
  monthlyEncargos: 7,
  annualEncargos: 8,
  monthlyBenefits: 9,
  annualBenefits: 10,
  totalRolePayroll: 11,
  roleSourceType: 12,
  allocationModel: 13,
};
const RPD_SUMIF_ROW_END = RPD_DATA_START_ROW0 + 5000;

function buildRolePayrollDetailSheet(details: readonly RoleYearDetail[]): XLSX.WorkSheet {
  const noteRow = [
    "Role Payroll Detail — role-by-year, sourced from calculateFopag() via the same buildRoleYearDetails() " +
      "logic the live Payroll export uses (payrollExportWorkbookBuilder.ts) — not reimplemented here. " +
      "Total Annual Role Payroll = Annual Salary + Annual Encargos + Annual Benefits (in-sheet formula). " +
      'Educator Tier is "—" for roles with no selectable tier (non-teaching roles, Assistant, Monitor). ' +
      "Role Source Type / Allocation Model are the same raw FopagCalculatedRecord fields the live Payroll " +
      "export discloses in its own Payroll Detail sheet.",
  ];
  const rows: (string | number | boolean)[][] = [noteRow, RPD_HEADER];

  for (const d of details) {
    rows.push([
      d.year,
      d.roleId,
      d.displayLabel,
      d.activeHc,
      tierDisplayLabel(d.rec.educatorTierId),
      d.monthlySalary,
      d.annualSalary,
      d.monthlyEncargos,
      d.annualEncargos,
      d.monthlyBenefits,
      d.annualBenefits,
      d.totalAnnualRolePayroll,
      d.rec.roleSourceType,
      d.rec.allocationModel,
    ]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  details.forEach((d, i) => {
    const row0 = RPD_DATA_START_ROW0 + i;
    const salaryRef = cellRef(row0, RPD_COL.annualSalary);
    const encargosRef = cellRef(row0, RPD_COL.annualEncargos);
    const benefitsRef = cellRef(row0, RPD_COL.annualBenefits);
    setFormulaCell(sheet, row0, RPD_COL.totalRolePayroll, d.totalAnnualRolePayroll, `${salaryRef}+${encargosRef}+${benefitsRef}`);
  });

  setColumnWidths(sheet, RPD_HEADER);
  setAutofilter(sheet, 1, RPD_HEADER.length - 1, rows.length - 1);
  const RPD_CURRENCY_COLS = [
    RPD_COL.monthlySalary,
    RPD_COL.annualSalary,
    RPD_COL.monthlyEncargos,
    RPD_COL.annualEncargos,
    RPD_COL.monthlyBenefits,
    RPD_COL.annualBenefits,
    RPD_COL.totalRolePayroll,
  ];
  details.forEach((_, i) => {
    const row0 = RPD_DATA_START_ROW0 + i;
    for (const col0 of RPD_CURRENCY_COLS) applyCurrencyFormat(sheet, row0, col0);
  });

  return sheet;
}

// ── Sheet 4: FOPAG Payroll Projection (annual totals by metric, SUMIF over Sheet 3) ──

const FOPAG_PAYROLL_PROJECTION_SHEET_NAME = "FOPAG Payroll Projection";
const FPP_METRIC_ROW0_START = 2;

function rpdColLetterRange(col0: number): string {
  const colRef = XLSX.utils.encode_col(col0);
  return `${qsheet(ROLE_PAYROLL_DETAIL_SHEET_NAME)}!$${colRef}$${RPD_DATA_START_ROW0 + 1}:$${colRef}$${RPD_SUMIF_ROW_END + 1}`;
}

// PD_COL (payrollExportWorkbookBuilder.ts) and RPD_COL (this file) both order
// [year, roleId, role, hc, ..., annualSalary, ..., annualEncargos, ...,
// annualBenefits, ..., totalRolePayroll] — FPP_METRIC_ROWS' pdCol indices map
// 1:1 onto this sheet's own RPD_COL fields with the same names, so the same
// metric list is reused to build this sheet without inventing a second one.
const RPD_METRIC_COL_FOR_PD_COL: Record<number, number> = {
  [PD_COL.hc]: RPD_COL.hc,
  [PD_COL.annualSalary]: RPD_COL.annualSalary,
  [PD_COL.annualEncargos]: RPD_COL.annualEncargos,
  [PD_COL.annualBenefits]: RPD_COL.annualBenefits,
  [PD_COL.totalRolePayroll]: RPD_COL.totalRolePayroll,
};

function buildFopagPayrollProjectionSheet(details: readonly RoleYearDetail[]): XLSX.WorkSheet {
  const noteRow = [
    "FOPAG Payroll Projection — annual totals by metric, one column per year. Each year cell is a SUMIF " +
      "formula over the Role Payroll Detail sheet, so totals reference the detailed role calculations " +
      "rather than being independently computed.",
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
    const rpdCol = RPD_METRIC_COL_FOR_PD_COL[metric.pdCol];
    YEARS.forEach((year, yearIdx) => {
      const col0 = 1 + yearIdx;
      const rpdRange = rpdColLetterRange(rpdCol);
      const yearMatchRange = `${qsheet(ROLE_PAYROLL_DETAIL_SHEET_NAME)}!$A$${RPD_DATA_START_ROW0 + 1}:$A$${RPD_SUMIF_ROW_END + 1}`;
      const formula = `SUMIF(${yearMatchRange},${year},${rpdRange})`;
      const cached = sheet[cellRef(row0, col0)];
      const cachedValue = cached && typeof cached.v === "number" ? cached.v : 0;
      setFormulaCell(sheet, row0, col0, cachedValue, formula);
    });
  });

  setColumnWidths(sheet, header);
  setAutofilter(sheet, 1, header.length - 1, rows.length - 1);
  // Skip the first metric row (Headcount / FTE) — not a currency figure.
  FPP_METRIC_ROWS.forEach((metric, metricIdx) => {
    if (metric.pdCol === PD_COL.hc) return;
    const row0 = FPP_METRIC_ROW0_START + metricIdx;
    YEARS.forEach((_, yearIdx) => applyCurrencyFormat(sheet, row0, 1 + yearIdx));
  });

  return sheet;
}

// ── Sheet 5: FOPAG-DRE Reconciliation ─────────────────────────────────────────

const RECONCILIATION_SHEET_NAME = "FOPAG-DRE Reconciliation";

function buildReconciliationSheet(
  fopagOutput: ReturnType<typeof calculateFopag>,
  dreOutput: ReturnType<typeof calculateDre>,
): XLSX.WorkSheet {
  const noteRow = [
    "FOPAG-DRE Reconciliation — FOPAG Total Payroll references the FOPAG Payroll Projection sheet. " +
      "DRE Payroll Value is the sum of DRE fopag_direto_clt_pj + folha_de_pagamento + beneficios for the " +
      "year (DRE convention: costs stored negative). Difference = FOPAG Total + DRE Payroll Value; " +
      "reconciled years yield 0 subject to the documented currency rounding convention.",
  ];
  const header = ["Year", "FOPAG Total Payroll", "DRE Payroll Value", "Difference (BRL)", "Reconciliation Status"];
  const rows: (string | number)[][] = [noteRow, header];

  const totalRow0 = FPP_METRIC_ROW0_START + FPP_METRIC_ROWS.length - 1;

  for (const year of YEARS) {
    const dreRow = dreOutput.byYear[year];
    const dreValue = roundCurrency(dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios);
    const fopagTotal = fopagOutput.yearTotals.find((y) => y.year === year)?.totalPayroll ?? 0;
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

    const fopagTotal = fopagOutput.yearTotals.find((y) => y.year === year)?.totalPayroll ?? 0;
    setFormulaCell(sheet, row0, 1, fopagTotal, fopagTotalRef);

    const dreRow = dreOutput.byYear[year];
    const dreValue = roundCurrency(dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios);
    const difference = roundCurrency(fopagTotal + dreValue);
    const differenceRef = cellRef(row0, 3);
    sheet[cellRef(row0, 2)] = { t: "n", v: dreValue };
    setFormulaCell(sheet, row0, 3, difference, `${cellRef(row0, 1)}+${cellRef(row0, 2)}`);
    setFormulaCell(
      sheet,
      row0,
      4,
      Math.abs(difference) < RECONCILIATION_TOLERANCE ? "OK" : "MISMATCH",
      `IF(ABS(${differenceRef})<${RECONCILIATION_TOLERANCE},"OK","MISMATCH")`,
    );
  });

  setColumnWidths(sheet, header);
  setAutofilter(sheet, 1, header.length - 1, rows.length - 1);
  YEARS.forEach((_, i) => {
    const row0 = 2 + i;
    applyCurrencyFormat(sheet, row0, 1);
    applyCurrencyFormat(sheet, row0, 2);
    applyCurrencyFormat(sheet, row0, 3);
  });

  return sheet;
}

// ── Sheet 6: Diagnostics ───────────────────────────────────────────────────────

function buildDiagnosticsSheet(fopagOutput: ReturnType<typeof calculateFopag>): XLSX.WorkSheet {
  const noteRow = [
    "Diagnostics — every diagnostic calculateFopag() emitted for this scenario, shown unconditionally " +
      "(never suppressed). isBlocking=true diagnostics mean calculationReady=false for this scenario.",
  ];
  const header = ["Diagnostic Type", "Is Blocking", "Role ID", "Role Name", "Year", "Message"];
  const rows: (string | number | boolean)[][] = [noteRow, header];
  for (const d of fopagOutput.diagnostics) {
    rows.push([d.diagnosticType, d.isBlocking, d.roleId, d.roleName, d.year ?? "—", d.message]);
  }
  if (fopagOutput.diagnostics.length === 0) {
    rows.push(["(none)", "", "", "", "", ""]);
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  setColumnWidths(sheet, header);
  setAutofilter(sheet, 1, header.length - 1, rows.length - 1);
  return sheet;
}

// ── Main entry point ──────────────────────────────────────────────────────────

export function buildOrgDesignExportWorkbook(
  input: OrgDesignExportInput,
  meta: OrgDesignExportMeta,
): XLSX.WorkBook {
  const fopagOutput = calculateFopag({
    openingPackageId: input.openingPackageId,
    occupancyScenarioId: input.occupancyScenarioId,
    orgDesignOptionId: input.orgDesignOptionId,
    educatorTierByGrade: input.educatorTierByGrade,
  });
  const dreOutput = calculateDre({
    openingPackageId: input.openingPackageId,
    occupancyScenarioId: input.occupancyScenarioId,
    orgDesignOptionId: input.orgDesignOptionId,
    tuitionScenarioId: input.tuitionScenarioId,
    educatorTierByGrade: input.educatorTierByGrade,
  });
  const details = buildRoleYearDetails(fopagOutput.records);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildScenarioConfigurationSheet(input, meta), "Scenario Configuration");
  XLSX.utils.book_append_sheet(wb, buildGradeStaffingSheet(input), GRADE_STAFFING_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildRolePayrollDetailSheet(details), ROLE_PAYROLL_DETAIL_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildFopagPayrollProjectionSheet(details), FOPAG_PAYROLL_PROJECTION_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildReconciliationSheet(fopagOutput, dreOutput), RECONCILIATION_SHEET_NAME);
  XLSX.utils.book_append_sheet(wb, buildDiagnosticsSheet(fopagOutput), "Diagnostics");

  return wb;
}

export function buildOrgDesignExportFilename(input: OrgDesignExportInput, exportedAt: Date): string {
  const ts = exportedAt.toISOString().slice(0, 10);
  return `org-design-export_${input.openingPackageId}_${input.occupancyScenarioId}_${input.orgDesignOptionId}_${ts}.xlsx`;
}
