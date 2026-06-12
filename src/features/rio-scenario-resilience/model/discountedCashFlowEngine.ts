// Phase 15C-DCF-VPL-TIR-PERPETUITY — discounted-cash-flow engine.
//
// Pure function: Phase 15B periods (read-only) + canonical WACC drivers ->
// PnL!B305:V306 / PnL!B308:V308-equivalent discounted-cash-flow series.
//
// Discount-factor convention (workbook PnL row 308, recursive cumulative
// product, NOT a closed-form exponent -- phase15CapitalDecisionArchitecture.md
// S16.5 D13):
//   discountFactor[1] = 1 + wacc[1]                          (pre_ops, 13.25%)
//   discountFactor[i] = discountFactor[i-1] * (1 + wacc[i])  (2028-2047, 12%)

import {
  PRE_OPS_PERIOD_KEY,
  SIMULATOR_PROJECTION_YEARS,
} from "./simulatorProjectionHorizonContract";
import type {
  DiscountedCashFlowEngineInput,
  DiscountedCashFlowEngineOutput,
  DiscountedCashFlowPeriodResult,
} from "./discountedCashFlowEngineContract";

const EXPECTED_PERIOD_KEYS: readonly (typeof PRE_OPS_PERIOD_KEY | (typeof SIMULATOR_PROJECTION_YEARS)[number])[] =
  [PRE_OPS_PERIOD_KEY, ...SIMULATOR_PROJECTION_YEARS];

export function calculateDiscountedCashFlow(
  input: DiscountedCashFlowEngineInput,
): DiscountedCashFlowEngineOutput {
  const { periods, preOpsWaccRate, operatingPeriodWaccRate } = input;

  if (periods.length !== EXPECTED_PERIOD_KEYS.length) {
    throw new Error(
      `calculateDiscountedCashFlow: expected exactly ${EXPECTED_PERIOD_KEYS.length} periods ` +
        `(pre_ops + 2028..2047), received ${periods.length}.`,
    );
  }

  for (let i = 0; i < EXPECTED_PERIOD_KEYS.length; i += 1) {
    const expectedKey = EXPECTED_PERIOD_KEYS[i];
    const actualKey = periods[i].periodKey;
    if (actualKey !== expectedKey) {
      throw new Error(
        `calculateDiscountedCashFlow: period ${i} has periodKey=${String(actualKey)}, ` +
          `expected ${String(expectedKey)} (deterministic order: pre_ops, 2028..2047).`,
      );
    }
  }

  if (!Number.isFinite(preOpsWaccRate) || !Number.isFinite(operatingPeriodWaccRate)) {
    throw new Error(
      `calculateDiscountedCashFlow: WACC drivers must be finite (preOpsWaccRate=${preOpsWaccRate}, ` +
        `operatingPeriodWaccRate=${operatingPeriodWaccRate}).`,
    );
  }

  let previousDiscountFactor = 0;
  let previousCumulativeDiscountedCashFlowBRL = 0;

  const outputPeriods: DiscountedCashFlowPeriodResult[] = periods.map((period, index) => {
    const periodIndex = index + 1; // 1 (pre_ops) .. 21 (2047), PnL row 286.
    const periodWaccRate = periodIndex === 1 ? preOpsWaccRate : operatingPeriodWaccRate;

    if (!Number.isFinite(period.fcoAfterCapexBRL)) {
      throw new Error(
        `calculateDiscountedCashFlow: fcoAfterCapexBRL for period ${String(period.periodKey)} ` +
          `is non-finite (${period.fcoAfterCapexBRL}).`,
      );
    }

    const discountFactor =
      periodIndex === 1
        ? 1 + periodWaccRate
        : previousDiscountFactor * (1 + periodWaccRate);

    const discountedCashFlowBRL = period.fcoAfterCapexBRL / discountFactor;
    const cumulativeDiscountedCashFlowBRL =
      previousCumulativeDiscountedCashFlowBRL + discountedCashFlowBRL;

    previousDiscountFactor = discountFactor;
    previousCumulativeDiscountedCashFlowBRL = cumulativeDiscountedCashFlowBRL;

    return {
      periodKey: period.periodKey,
      sourceYear: period.sourceYear,
      fcoAfterCapexBRL: period.fcoAfterCapexBRL,
      periodIndex,
      periodWaccRate,
      discountFactor,
      discountedCashFlowBRL,
      cumulativeDiscountedCashFlowBRL,
    };
  });

  return { periods: outputPeriods };
}
