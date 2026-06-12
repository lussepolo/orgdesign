// Phase 15C-DCF-VPL-TIR-PERPETUITY — IRR engine contract.
//
// Pure, deterministic Excel-IRR-compatible internal-rate-of-return solver.
// Computes the rate at which
//   sum(cashFlows[i] / (1 + rate)^i) === 0
// for i = 0..n-1 (cashFlows[0] has exponent 0 -- PnL!IRR(B295:W295) treats
// the pre_ops entry as exponent 0, i.e. "today").

export type IrrStatus = "calculated" | "no_sign_change" | "did_not_converge";

export interface IrrResult {
  readonly irrRate: number | null;
  readonly status: IrrStatus;
  readonly statusReason: string;
  // true if the cash-flow series has more than one sign change (more than
  // one mathematically possible real root). The returned irrRate (if any)
  // is the root found from the deterministic standard seed (0.10), not a
  // guaranteed-unique root.
  readonly multipleRootsPossible: boolean;
  readonly iterations: number;
  // npvAtRate(irrRate) at the returned rate (or at the last attempted rate
  // if status !== "calculated"). null only if no rate was ever evaluated.
  readonly finalResidualBRL: number | null;
}

export interface IrrEngineInput {
  // cashFlows[0] has exponent 0 (PnL!IRR(B295:W295): B295 = pre_ops,
  // entry 0). For Phase 15C this is a 22-entry series: 21 fcoAfterCapexBRL
  // values (pre_ops..2047) followed by terminalValueAt2047BRL.
  readonly cashFlows: readonly number[];
}
