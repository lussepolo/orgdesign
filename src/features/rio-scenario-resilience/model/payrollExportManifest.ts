// V10-X1 (2026-07-27): scenario-manifest.json builder — machine-readable
// record of the twelve governed payroll export scenarios (spec section 18).
import {
  PAYROLL_EXPORT_HORIZON_YEARS,
  PAYROLL_EXPORT_HORIZON_START_YEAR,
  PAYROLL_EXPORT_HORIZON_END_YEAR,
  PAYROLL_EXPORT_FIXED_LEVERS,
} from "./payrollExportMatrixContract";
import { PD_COL, buildRoleYearDetails, fppMetricYearTotal } from "./payrollExportWorkbookBuilder";
import { V10_PAYROLL_SOURCE_SALARY } from "../../../lib/payroll/payrollGrowth";
import type { PayrollExportScenarioResult } from "./payrollExportScenarioAdapter";

const YEARS = PAYROLL_EXPORT_HORIZON_YEARS;
const RECONCILIATION_TOLERANCE = 0.01;

export interface PayrollExportManifestScenarioRecord {
  readonly displayLabel: string;
  readonly matrixScenarioId: string;
  readonly openingPackageId: string;
  readonly orgDesignOptionId: string;
  readonly occupancyScenarioId: string;
  readonly workbookFilename: string;
  readonly annualEnrollment: Record<number, number>;
  readonly annualHeadcountFte: Record<number, number>;
  readonly annualSalary: Record<number, number>;
  readonly annualEncargos: Record<number, number>;
  readonly annualBenefits: Record<number, number>;
  readonly annualPayroll: Record<number, number>;
  readonly dreBridgeReconciliationStatus: "OK" | "MISMATCH";
  readonly validationStatus: "calculation_ready" | "not_ready";
}

export interface PayrollExportManifest {
  readonly schemaVersion: string;
  readonly applicationCommitHash: string;
  readonly generationTimestampIso: string;
  readonly sourceWorkbookFilename: string;
  readonly sourceWorkbookSha256: string;
  readonly modelHorizon: { readonly startYear: number; readonly endYear: number };
  readonly fixedLevers: typeof PAYROLL_EXPORT_FIXED_LEVERS;
  readonly scenarios: readonly PayrollExportManifestScenarioRecord[];
}

function recordByYear(values: readonly number[]): Record<number, number> {
  const out: Record<number, number> = {};
  YEARS.forEach((year, i) => {
    out[year] = values[i]!;
  });
  return out;
}

export function buildPayrollExportManifest(
  scenarioResults: readonly PayrollExportScenarioResult[],
  applicationCommitHash: string,
  generationTimestampIso: string,
): PayrollExportManifest {
  const scenarios: PayrollExportManifestScenarioRecord[] = scenarioResults.map((sr) => {
    const details = buildRoleYearDetails(sr);
    const annualEnrollment = YEARS.map((y) => sr.dreOutput.byYear[y].numero_de_alunos);
    const annualHeadcountFte = YEARS.map((y) => fppMetricYearTotal(details, PD_COL.hc, y));
    const annualSalary = YEARS.map((y) => fppMetricYearTotal(details, PD_COL.annualSalary, y));
    const annualEncargos = YEARS.map((y) => fppMetricYearTotal(details, PD_COL.annualEncargos, y));
    const annualBenefits = YEARS.map((y) => fppMetricYearTotal(details, PD_COL.annualBenefits, y));
    const annualPayroll = YEARS.map((y) => fppMetricYearTotal(details, PD_COL.totalRolePayroll, y));

    const worstMismatch = YEARS.some((y) => {
      const fopagTotal = sr.fopagOutput.yearTotals.find((yt) => yt.year === y)?.totalPayroll ?? 0;
      const dreRow = sr.dreOutput.byYear[y];
      const dreValue = dreRow.fopag_direto_clt_pj + dreRow.folha_de_pagamento + dreRow.beneficios;
      return Math.abs(fopagTotal + dreValue) >= RECONCILIATION_TOLERANCE;
    });

    return {
      displayLabel: sr.record.displayLabel,
      matrixScenarioId: sr.record.matrixScenarioId,
      openingPackageId: sr.record.openingPackageId,
      orgDesignOptionId: sr.record.orgDesignOptionId,
      occupancyScenarioId: sr.record.occupancyScenarioId,
      workbookFilename: sr.record.filename,
      annualEnrollment: recordByYear(annualEnrollment),
      annualHeadcountFte: recordByYear(annualHeadcountFte),
      annualSalary: recordByYear(annualSalary),
      annualEncargos: recordByYear(annualEncargos),
      annualBenefits: recordByYear(annualBenefits),
      annualPayroll: recordByYear(annualPayroll),
      dreBridgeReconciliationStatus: worstMismatch ? "MISMATCH" : "OK",
      validationStatus: sr.fopagOutput.calculationReady ? "calculation_ready" : "not_ready",
    };
  });

  return {
    schemaVersion: "1.0.0",
    applicationCommitHash,
    generationTimestampIso,
    sourceWorkbookFilename: V10_PAYROLL_SOURCE_SALARY.workbook,
    sourceWorkbookSha256: V10_PAYROLL_SOURCE_SALARY.sha256,
    modelHorizon: {
      startYear: PAYROLL_EXPORT_HORIZON_START_YEAR,
      endYear: PAYROLL_EXPORT_HORIZON_END_YEAR,
    },
    fixedLevers: PAYROLL_EXPORT_FIXED_LEVERS,
    scenarios,
  };
}
