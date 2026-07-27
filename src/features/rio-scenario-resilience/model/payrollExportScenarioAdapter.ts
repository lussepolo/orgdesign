// V10-X1 (2026-07-27): single runtime harness for the payroll export matrix.
// Every consumer (detailed workbook builder, summary workbook builder,
// manifest builder, validator) calls buildPayrollExportScenarioResult() and
// nothing else. This module performs NO independent calculation — it calls
// the canonical calculateFopag() / calculateDre() engines exactly as the rest
// of the application does, with the matrix record's three varying levers
// (opening package, org design option, occupancy scenario) plus the fixed
// tuitionScenarioId lever. Do not create a parallel payroll model here.
import { calculateFopag } from "./fopagEngine";
import { calculateDre } from "./dreEngine";
import type { FopagEngineOutput } from "./fopagEngineContract";
import type { DreEngineOutput } from "./dreEngineContract";
import type { PayrollExportMatrixRecord } from "./payrollExportMatrixContract";

export interface PayrollExportScenarioResult {
  readonly record: PayrollExportMatrixRecord;
  readonly fopagOutput: FopagEngineOutput;
  readonly dreOutput: DreEngineOutput;
}

export function buildPayrollExportScenarioResult(
  record: PayrollExportMatrixRecord,
): PayrollExportScenarioResult {
  const fopagOutput = calculateFopag({
    openingPackageId: record.openingPackageId,
    occupancyScenarioId: record.occupancyScenarioId,
    orgDesignOptionId: record.orgDesignOptionId,
  });

  const dreOutput = calculateDre({
    openingPackageId: record.openingPackageId,
    occupancyScenarioId: record.occupancyScenarioId,
    tuitionScenarioId: record.fixedLevers.tuitionScenarioId,
    orgDesignOptionId: record.orgDesignOptionId,
  });

  return { record, fopagOutput, dreOutput };
}

export function buildAllPayrollExportScenarioResults(
  records: readonly PayrollExportMatrixRecord[],
): readonly PayrollExportScenarioResult[] {
  return records.map(buildPayrollExportScenarioResult);
}
