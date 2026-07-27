import type {
  DiscountScheduleSourceDataContract,
  DiscountScheduleSourceRecord,
} from "./discountScheduleSourceDataContract";
import {
  V10_AVERAGE_DISCOUNT_SCHEDULE,
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE,
  V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR,
} from "./v10AverageDiscountSourceData";

// Phase V10-F1B (2026-07-27): re-pointed to the canonical v10AverageDiscountSourceData.ts
// schedule (workbook v10, PnL Row 224 — project-owner decision, NOT Finance-signed).
// This mechanism (the Receita-engine-only "average effective discount rate") remains
// audit_only and excluded from the live DRE handoff — see dreScenarioAdapters.ts guard
// and dreEngineValidation.ts Check 19. It no longer maintains an independently-typed
// rate table; both this record and the DRE's percentual_desconto_medio driver
// (dreRevenueDriverSourceData.ts) now read the same canonical source.
// Explicit rates cover 2028–2035; 2036 onward is the confirmed terminal rate.
export const DISCOUNT_SCHEDULE_SOURCE: DiscountScheduleSourceRecord = {
  explicitRatesByYear: {
    2028: V10_AVERAGE_DISCOUNT_SCHEDULE[2028],
    2029: V10_AVERAGE_DISCOUNT_SCHEDULE[2029],
    2030: V10_AVERAGE_DISCOUNT_SCHEDULE[2030],
    2031: V10_AVERAGE_DISCOUNT_SCHEDULE[2031],
    2032: V10_AVERAGE_DISCOUNT_SCHEDULE[2032],
    2033: V10_AVERAGE_DISCOUNT_SCHEDULE[2033],
    2034: V10_AVERAGE_DISCOUNT_SCHEDULE[2034],
    2035: V10_AVERAGE_DISCOUNT_SCHEDULE[2035],
  },
  terminalRate: V10_AVERAGE_DISCOUNT_TERMINAL_RATE,
  terminalRateStartYear: V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR,
  applicationOrder: "after_annual_tuition_adjustment",
  scope: "uniform_all_scenarios_all_grades_all_opening_packages",
  interpretationFlags: {
    isAverageEffectiveDiscountRate: true,
    isNotMaxDiscountPerFamilyPolicy: true,
    isNotTotalDiscountPool: true,
    appliesAfterAnnualTuitionAdjustment: true,
    uniformUnlessFinanceProvidesMoreGranularRule: true,
  },
  sourceDescription:
    "v10 workbook PnL Row 224 (project-owner decision, Phase V10-F1B, not Finance-signed)",
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
      "Average effective discount rate schedule re-pointed to the canonical v10 Row 224 " +
      "schedule in Phase V10-F1B (2026-07-27), a project-owner decision (not Finance-signed). " +
      "Applies uniformly across all scenarios, grades, and opening packages unless Finance " +
      "later provides a more granular rule. Terminal rate of 12.5% applies from 2036 onward " +
      "and is not expanded per year. This mechanism remains audit-only and excluded from the " +
      "live DRE handoff. Calculation remains blocked.",
  };
