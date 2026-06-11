// Receita engine output types.
// Phase 11B (2026-06-07): extended to full simulator horizon 2028–2047.
// No source data imported here. Types and constants only.

import type { GradeId, DivisionId, TuitionScenarioId } from "./revenueInputs";
import type {
  OpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageProjectionYear,
} from "./openingPackageOccupancySourceDataContract";

export const RECEITA_PROJECTION_YEARS = [
  2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037,
  2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047,
] as const satisfies readonly OpeningPackageProjectionYear[];

// Back-compat alias — prefer RECEITA_PROJECTION_YEARS in new code.
export const RECEITA_DIRECT_WORKBOOK_YEARS = RECEITA_PROJECTION_YEARS;

export interface ReceitaYearAggregate {
  grossReceitaBeforeDiscount: number;
  discountImpact: number;
  netReceitaAfterDiscount: number;
}

// Full grain record: one per (openingPackage × occupancyScenario × tuitionScenario × year × grade).
// Stores all intermediate values so aggregations and audits don't require re-computation.
export interface ReceitaGrainRecord {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  tuitionScenarioId: TuitionScenarioId;
  year: OpeningPackageProjectionYear;
  gradeId: GradeId;
  divisionId: DivisionId;
  contractedLearners: number;
  baseAnnualGrossContractValueBRL: number;
  annualAdjustmentFactor: number;
  adjustedAnnualGrossContractValueBRL: number;
  averageEffectiveDiscountRate: number;
  grossReceitaBeforeDiscount: number;
  discountImpact: number;
  netReceitaAfterDiscount: number;
}

export interface ReceitaEngineScenarioKey {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  tuitionScenarioId: TuitionScenarioId;
}

export type ReceitaEngineByYear = Partial<
  Record<OpeningPackageProjectionYear, ReceitaYearAggregate>
>;

export type ReceitaEngineByGradeByYear = Partial<
  Record<GradeId, Partial<Record<OpeningPackageProjectionYear, ReceitaYearAggregate>>>
>;

export type ReceitaEngineByDivisionByYear = Partial<
  Record<DivisionId, Partial<Record<OpeningPackageProjectionYear, ReceitaYearAggregate>>>
>;

export interface ReceitaEngineOutput {
  scenarioKey: ReceitaEngineScenarioKey;
  supportedYears: typeof RECEITA_PROJECTION_YEARS;
  grainRecords: ReceitaGrainRecord[];
  byYear: ReceitaEngineByYear;
  byGradeByYear: ReceitaEngineByGradeByYear;
  byDivisionByYear: ReceitaEngineByDivisionByYear;
}
