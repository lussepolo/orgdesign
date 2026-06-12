// Phase 15D-DISCOUNTED-PAYBACK — discounted-payback engine contract.
//
// Consumes Phase 15C's committed Phase15CResult (94f2ebb) as a read-only
// input. Does NOT recalculate discount factors, annual/cumulative discounted
// cash flow, terminal value, VPL, or TIR -- all of these are read directly
// from Phase15CResult.periods[*].cumulativeDiscountedCashFlowBRL and
// Phase15CResult.npvBRL.
//
// Visible-workbook provenance (PnL sheet): row 305 (DCF - Anual), row 306
// (DCF - Acumulado), row 307 (Payback helper, B307=0 literal,
// C307:V307=IF(col306>0,0,1)), Z290
// (=IF(Z289<0,"NA",IF((SUM(B307:V307)+1)>=20,"20+",SUM(B307:V307)+1))).
//
// Phase 15D.1 audit + correction: the workbook's Z290 formula uses >=20,
// which conflates "recovery in the final operating year (2047)" with "no
// recovery within the explicit horizon" -- both produce "20+". The ratified
// business methodology requires "20+" to mean ONLY "not recovered within the
// 2028-2047 horizon"; recovery in 2047 must report "20", not "20+". This
// engine implements the corrected (ratified) rule, not the workbook's
// >=20 edge case. See phase15dR100mParitySourceData.ts and IMPLEMENTATION.md
// for the documented discrepancy. The R$100M workbook baseline is unaffected
// (it does not recover by 2047 under either rule, so both return "20+").

import type { CapexOptionId } from "./capexOptionSourceContract";
import type {
  CapitalDecisionIntegratedBaselineParityStatus,
  CapitalDecisionPeriodKey,
} from "./capitalDecisionEngineContract";
import type { Phase15CResult } from "./phase15cInvestmentMetricsEngineContract";

// "calculated": a strictly-positive cumulativeDiscountedCashFlowBRL was found
// in one of the 20 operating periods (2028-2047, Phase15CResult.periods[1..20]).
// discountedPaybackYears is an integer 1..20; compactValue is that integer as
// a string.
//
// "not_reached_within_horizon": npvBRL >= 0, but no operating period
// (2028-2047) has cumulativeDiscountedCashFlowBRL > 0. compactValue = "20+".
// discountedPaybackYears = null. This is the ratified meaning of "20+":
// payback is not achieved within the explicit projection horizon. It is NOT
// an error, and does NOT mean payback occurs in year 20.
//
// "not_applicable_negative_npv": npvBRL < 0 (strict). compactValue = "NA".
// discountedPaybackYears = null. Distinct from "20+": "NA" means the
// investment's discounted cash flows (including terminal value) do not
// recover under the canonical drivers, independent of explicit-horizon
// timing.
//
// "blocked_missing_phase15c_inputs": Phase15CResult.calculationStatus !==
// "calculated", or npvBRL === null. compactValue = null,
// discountedPaybackYears = null. Never reported as "NA" or "20+".
//
// "invalid_cash_flow_series": Phase15CResult.calculationStatus ===
// "calculated" but periods is malformed (wrong length/order, duplicate or
// missing period keys, or any non-finite cumulativeDiscountedCashFlowBRL /
// npvBRL). Defensive only -- should be unreachable from a Phase15CResult
// produced by computePhase15CInvestmentMetricsCore. compactValue = null,
// discountedPaybackYears = null. Never reported as "NA" or "20+".
export type DiscountedPaybackStatus =
  | "calculated"
  | "not_reached_within_horizon"
  | "not_applicable_negative_npv"
  | "blocked_missing_phase15c_inputs"
  | "invalid_cash_flow_series";

export interface Phase15DSourceProvenance {
  readonly workbookFile: string;
  readonly visibleWorkbookSheet: string;
  readonly annualDiscountedCashFlowRow: string;
  readonly cumulativeDiscountedCashFlowRow: string;
  readonly paybackHelperRow: string;
  readonly workbookPaybackOutputCell: string;
  readonly phase15cCommit: string;
  readonly ratifiedMethodologyDoc: string;
  readonly ratifiedSections: readonly string[];
  readonly notes: readonly string[];
}

export interface Phase15DExplicitExclusions {
  readonly simplePayback: "excluded";
  readonly fractionalPayback: "excluded";
  readonly workingCapital: "excluded";
  readonly financingCashFlows: "excluded";
  readonly tierInvestmentInterpretation: "excluded";
  readonly investmentRecommendation: "excluded";
  readonly uiInterpretation: "excluded";
  readonly exportIntegration: "excluded";
  readonly notes: string;
}

export interface DiscountedPaybackResult {
  readonly capexOptionId: CapexOptionId;
  readonly status: DiscountedPaybackStatus;
  readonly statusReason: string;

  // Integer 1..20 (operating-year index, 2028=1..2047=20) if
  // status === "calculated"; null otherwise.
  readonly discountedPaybackYears: number | null;

  // "1".."20", "20+", "NA" if status is a business outcome; null for
  // technical-failure statuses (blocked_missing_phase15c_inputs,
  // invalid_cash_flow_series).
  readonly compactValue: string | null;

  // Plain-text explanatory sentence. No HTML/JSX.
  readonly explanatoryValue: string;

  // periods[k] (k=1..20, 2028..2047) where recovery occurs; null unless
  // status === "calculated".
  readonly recoveryPeriodKey: CapitalDecisionPeriodKey | null;
  readonly recoverySourceYear: number | null;

  // Pass-through from Phase15CResult.npvBRL.
  readonly npvBRL: number | null;

  readonly sourceProvenance: Phase15DSourceProvenance;
  // Pass-through from Phase15CResult (always present, including blocked states).
  readonly integratedBaselineParityStatus: CapitalDecisionIntegratedBaselineParityStatus;
  readonly integratedBaselineParityNote: string;

  readonly explicitExclusions: Phase15DExplicitExclusions;
}

// Pure core: takes Phase 15C's committed result, returns
// DiscountedPaybackResult. No upstream engine calls, no mutation of
// phase15CResult.
export interface DiscountedPaybackEngineInput {
  readonly phase15CResult: Phase15CResult;
}
