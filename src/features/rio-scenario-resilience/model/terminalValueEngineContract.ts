// Phase 15C-DCF-VPL-TIR-PERPETUITY — terminal-value (perpetuity) engine contract.
//
// Computes the workbook's Gordon Growth terminal value (PnL!Z280:Z283) from
// the 2047 net income, the perpetuity growth rate, the perpetuity WACC
// (= final-projection-year WACC), and the 2047 discount factor.
//
// IMPORTANT (cancellation identity, phase15CapitalDecisionArchitecture.md
// S16.5 / Phase 15C.1 audit S8): the workbook's terminal cash-flow numerator
// (PnL!Z280 = PnL!V290 - PnL!V288) equals 2047 net income (PnL!V282), NOT
// 2047 fcoAfterCapexBRL (PnL!V295). The perpetual depreciation add-back
// (PnL!W288) and the assumed perpetual Sustain CAPEX (PnL!W291 = -W288)
// cancel exactly, so PnL!W295 (perpetuity "cash flow after CAPEX") reduces
// algebraically to PnL!Z281 (= net income perpetuity), with no separate
// terminal Sustain-CAPEX or terminal-depreciation term. This engine must not
// add either.

export type TerminalValueStatus = "calculated" | "blocked_invalid_wacc_growth";

export interface TerminalValueResult {
  readonly status: TerminalValueStatus;
  readonly statusReason: string;
  readonly finalProjectionYear: 2047;
  // PnL!V282 (= PnL!Z280 = PnL!V290 - PnL!V288). null if status !== "calculated".
  readonly terminalNetIncomeBRL: number | null;
  // PnL!Z279 = 0.035. null if status !== "calculated".
  readonly perpetuityGrowthRate: number | null;
  // PnL!Z278 (= V6) = 0.12 (final-projection-year WACC). null if
  // status !== "calculated".
  readonly perpetuityWaccRate: number | null;
  // PnL!Z281 = terminalNetIncomeBRL * (1 + g) / (WACC - g).
  // null if status !== "calculated".
  readonly terminalValueAt2047BRL: number | null;
  // PnL!Z283 (= PnL!W305) = terminalValueAt2047BRL / finalYearDiscountFactor.
  // Uses the SAME discount factor as the 2047 annual DCF period
  // (PnL!W308 === PnL!V308) -- no additional terminal-period discounting.
  // null if status !== "calculated".
  readonly terminalValuePresentValueBRL: number | null;
}

export interface TerminalValueEngineInput {
  // PnL!V282 / PnL!Z280 (2047 netIncomeBRL from the Phase 15B period result).
  readonly terminalNetIncomeBRL: number;
  // PnL!Z279 = 0.035.
  readonly perpetuityGrowthRate: number;
  // PnL!Z278 (= V6) = 0.12.
  readonly perpetuityWaccRate: number;
  // PnL!V308 (= W308), the 2047 discounted-cash-flow period's discount factor.
  readonly finalYearDiscountFactor: number;
}
