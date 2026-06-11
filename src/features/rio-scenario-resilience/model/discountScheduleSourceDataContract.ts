import type { ProjectionYear } from "./revenueInputs";

export type DiscountScheduleApplicationOrder = "after_annual_tuition_adjustment";

export type DiscountScheduleScope =
  "uniform_all_scenarios_all_grades_all_opening_packages";

export type DiscountScheduleSourceDescription = "Head of Finance message";

// Finance-stated interpretation constraints, preserved as typed boolean literals.
export interface DiscountScheduleInterpretationFlags {
  isAverageEffectiveDiscountRate: true;
  isNotMaxDiscountPerFamilyPolicy: true;
  isNotTotalDiscountPool: true;
  appliesAfterAnnualTuitionAdjustment: true;
  uniformUnlessFinanceProvidesMoreGranularRule: true;
}

// Explicit per-year rates cover 2028–2033.
// "2034 onward" is a terminal rate, not per-year expansion — expanding it would be applying the rule.
export interface DiscountScheduleSourceRecord {
  explicitRatesByYear: Partial<Record<ProjectionYear, number>>;
  terminalRate: number;
  terminalRateStartYear: ProjectionYear;
  applicationOrder: DiscountScheduleApplicationOrder;
  scope: DiscountScheduleScope;
  interpretationFlags: DiscountScheduleInterpretationFlags;
  sourceDescription: DiscountScheduleSourceDescription;
  calculationReady: false;
  calculationBlockReason: string;
}

export interface DiscountScheduleSourceDataContract {
  sourceEvidenceStatus: "source_populated";
  calculationReady: false;
  discountSchedule: DiscountScheduleSourceRecord;
  notes?: string;
}
