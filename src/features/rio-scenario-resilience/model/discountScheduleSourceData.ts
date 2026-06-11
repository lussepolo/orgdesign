import type {
  DiscountScheduleSourceDataContract,
  DiscountScheduleSourceRecord,
} from "./discountScheduleSourceDataContract";

// Explicit rates for 2028–2033 as provided by Head of Finance.
// 2034 onward represented as a terminal rate — not expanded per year.
export const DISCOUNT_SCHEDULE_SOURCE: DiscountScheduleSourceRecord = {
  explicitRatesByYear: {
    2028: 0.20,
    2029: 0.20,
    2030: 0.20,
    2031: 0.17,
    2032: 0.15,
    2033: 0.15,
  },
  terminalRate: 0.125,
  terminalRateStartYear: 2034,
  applicationOrder: "after_annual_tuition_adjustment",
  scope: "uniform_all_scenarios_all_grades_all_opening_packages",
  interpretationFlags: {
    isAverageEffectiveDiscountRate: true,
    isNotMaxDiscountPerFamilyPolicy: true,
    isNotTotalDiscountPool: true,
    appliesAfterAnnualTuitionAdjustment: true,
    uniformUnlessFinanceProvidesMoreGranularRule: true,
  },
  sourceDescription: "Head of Finance message",
  calculationReady: false,
  calculationBlockReason:
    "Discount schedule is confirmed. Receita calculation remains blocked until enrollment-to-tuition grade mapping and Receita formula implementation are approved.",
};

export const DISCOUNT_SCHEDULE_SOURCE_DATA: DiscountScheduleSourceDataContract =
  {
    sourceEvidenceStatus: "source_populated",
    calculationReady: false,
    discountSchedule: DISCOUNT_SCHEDULE_SOURCE,
    notes:
      "Average effective discount rate schedule confirmed from Head of Finance. Applies uniformly across all scenarios, grades, and opening packages unless Finance later provides a more granular rule. Terminal rate of 12.5% applies from 2034 onward and is not expanded per year. Calculation remains blocked.",
  };
