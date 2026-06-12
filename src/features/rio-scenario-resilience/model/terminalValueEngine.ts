// Phase 15C-DCF-VPL-TIR-PERPETUITY — terminal-value (perpetuity) engine.
//
// Pure function implementing PnL!Z281 (Valor da perpetuidade) and PnL!Z283
// (Valor terminal, present value). See terminalValueEngineContract.ts for
// the cancellation identity that fixes the terminal cash-flow numerator to
// 2047 net income (not fcoAfterCapexBRL).

import type {
  TerminalValueEngineInput,
  TerminalValueResult,
} from "./terminalValueEngineContract";

export function calculateTerminalValue(input: TerminalValueEngineInput): TerminalValueResult {
  const { terminalNetIncomeBRL, perpetuityGrowthRate, perpetuityWaccRate, finalYearDiscountFactor } = input;

  if (!Number.isFinite(terminalNetIncomeBRL)) {
    return blocked(`2047 terminal net income is non-finite (${terminalNetIncomeBRL}).`);
  }
  if (!Number.isFinite(perpetuityGrowthRate)) {
    return blocked(`perpetuity growth rate is non-finite (${perpetuityGrowthRate}).`);
  }
  if (!Number.isFinite(perpetuityWaccRate)) {
    return blocked(`perpetuity WACC rate is non-finite (${perpetuityWaccRate}).`);
  }
  if (!Number.isFinite(finalYearDiscountFactor)) {
    return blocked(`2047 discount factor is non-finite (${finalYearDiscountFactor}).`);
  }
  if (perpetuityWaccRate <= perpetuityGrowthRate) {
    return blocked(
      `perpetuity WACC (${perpetuityWaccRate}) must exceed perpetuity growth ` +
        `(${perpetuityGrowthRate}); Gordon Growth denominator (WACC - g) would be <= 0.`,
    );
  }

  // PnL!Z281 = Z280 * (1 + Z279) / (Z278 - Z279), where Z280 == 2047 net income.
  const terminalValueAt2047BRL =
    (terminalNetIncomeBRL * (1 + perpetuityGrowthRate)) / (perpetuityWaccRate - perpetuityGrowthRate);

  // PnL!Z283 = Z281 / Z282, where Z282 === PnL!V308 (== PnL!W308, the 2047
  // annual discount factor reused unchanged for the perpetuity column).
  const terminalValuePresentValueBRL = terminalValueAt2047BRL / finalYearDiscountFactor;

  return {
    status: "calculated",
    statusReason: "Terminal value calculated from 2047 net income, perpetuity growth/WACC, and the 2047 discount factor.",
    finalProjectionYear: 2047,
    terminalNetIncomeBRL,
    perpetuityGrowthRate,
    perpetuityWaccRate,
    terminalValueAt2047BRL,
    terminalValuePresentValueBRL,
  };
}

function blocked(reason: string): TerminalValueResult {
  return {
    status: "blocked_invalid_wacc_growth",
    statusReason: reason,
    finalProjectionYear: 2047,
    terminalNetIncomeBRL: null,
    perpetuityGrowthRate: null,
    perpetuityWaccRate: null,
    terminalValueAt2047BRL: null,
    terminalValuePresentValueBRL: null,
  };
}
