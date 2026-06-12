// Phase 15C-DCF-VPL-TIR-PERPETUITY — discounted-cash-flow engine contract.
//
// Computes, for each of the 21 Phase 15B capital-decision periods (pre_ops
// followed by 2028-2047), the workbook's PnL!B305:V306 / PnL!B308:V308
// discounted-cash-flow series:
//   - periodIndex (PnL row 286: pre_ops = 1, 2028 = 2, ..., 2047 = 21)
//   - periodWaccRate (PnL row 6: pre_ops = B6 = 13.25%, 2028-2047 = C6:V6 = 12%)
//   - discountFactor (PnL row 308: recursive cumulative product of (1+WACC))
//   - discountedCashFlowBRL (PnL row 305: fcoAfterCapexBRL / discountFactor)
//   - cumulativeDiscountedCashFlowBRL (PnL row 306: running sum of row 305)
//
// Phase 15C boundary: consumes CapitalDecisionPeriodResult.fcoAfterCapexBRL
// (Phase 15B, read-only) -- does not recalculate Receita, FOPAG, EBITDA,
// D&A, tax/NOL, FCO, or CAPEX.

import type {
  CapitalDecisionPeriodKey,
  CapitalDecisionPeriodResult,
} from "./capitalDecisionEngineContract";

export interface DiscountedCashFlowPeriodResult {
  readonly periodKey: CapitalDecisionPeriodKey;
  // 2027 for pre_ops; otherwise equal to periodKey. Pass-through from
  // CapitalDecisionPeriodResult.sourceYear.
  readonly sourceYear: number;
  // Pass-through from CapitalDecisionPeriodResult.fcoAfterCapexBRL (PnL!{col}295).
  readonly fcoAfterCapexBRL: number;
  // 1 (pre_ops) .. 21 (2047). PnL row 286.
  readonly periodIndex: number;
  // 0.1325 for pre_ops (periodIndex 1), 0.12 for 2028-2047 (periodIndex 2-21).
  // PnL row 6.
  readonly periodWaccRate: number;
  // PnL row 308: discountFactor[1] = 1 + periodWaccRate[1];
  // discountFactor[i] = discountFactor[i-1] * (1 + periodWaccRate[i]) for i > 1.
  readonly discountFactor: number;
  // PnL row 305: fcoAfterCapexBRL / discountFactor.
  readonly discountedCashFlowBRL: number;
  // PnL row 306: running sum of discountedCashFlowBRL from pre_ops through
  // this period.
  readonly cumulativeDiscountedCashFlowBRL: number;
}

export interface DiscountedCashFlowEngineInput {
  // Exactly 21 entries, deterministically ordered: pre_ops followed by
  // 2028..2047 (CapitalDecisionResult.periods, read-only -- not mutated).
  readonly periods: readonly CapitalDecisionPeriodResult[];
  // PnL!B6 (pre_ops WACC).
  readonly preOpsWaccRate: number;
  // PnL!C6:V6 (2028-2047 WACC, constant).
  readonly operatingPeriodWaccRate: number;
}

export interface DiscountedCashFlowEngineOutput {
  // Exactly 21 entries, same order as the input periods.
  readonly periods: readonly DiscountedCashFlowPeriodResult[];
}
