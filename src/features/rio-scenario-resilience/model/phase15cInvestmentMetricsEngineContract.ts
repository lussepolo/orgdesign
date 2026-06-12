// Phase 15C-DCF-VPL-TIR-PERPETUITY — investment metrics engine contract.
//
// Orchestrates discountedCashFlowEngine + terminalValueEngine + irrEngine on
// top of Phase 15B's committed CapitalDecisionResult (FCO after CAPEX,
// 2047 net income). Does NOT call dreEngine / receitaEngine / fopagEngine /
// capexScheduleEngine / ppeDepreciationEngine / nolTaxEngine, and does NOT
// recalculate any Phase 15B figure.
//
// Phase 15C boundary (per phase15CapitalDecisionArchitecture.md S16.5 and
// the Phase 15C.1 audit): DCF, VPL (NPV), TIR (IRR), and Gordon Growth
// terminal value/perpetuity are IN SCOPE. Working capital, financing cash
// flows, simple/discounted payback, and Tier/investment/UI interpretation
// remain OUT OF SCOPE (see Phase15CExplicitExclusions).

import type { CapexOptionId } from "./capexOptionSourceContract";
import type {
  CapitalDecisionIntegratedBaselineParityStatus,
  CapitalDecisionResult,
} from "./capitalDecisionEngineContract";
import type { CapitalDecisionDriverSource } from "./capitalDecisionDriverSourceContract";
import type { DiscountedCashFlowPeriodResult } from "./discountedCashFlowEngineContract";
import type { TerminalValueResult } from "./terminalValueEngineContract";
import type { IrrStatus } from "./irrEngineContract";

// "calculated": DCF, terminal value, and VPL were all computed successfully.
// IRR may independently be "calculated" | "no_sign_change" | "did_not_converge"
// without affecting this status (see IrrStatus -- a separate axis).
//
// "blocked_missing_phase15b_inputs": the supplied CapitalDecisionResult did
// not have calculationReadiness === "structurally_calculated" (i.e. Phase
// 15B itself could not produce finite fcoAfterCapexBRL/netIncomeBRL for one
// or more periods). Terminal value, NPV, and IRR are all unavailable.
//
// "blocked_invalid_wacc_growth": the canonical drivers failed the Gordon
// Growth precondition (perpetuityWaccRate <= perpetuityGrowthRate) or were
// non-finite. Terminal value, NPV, and IRR are all unavailable. The 21
// explicit-period discounted-cash-flow series may still be present (DCF does
// not depend on the perpetuity growth rate), but npvBRL is null because VPL
// requires the terminal value.
export type Phase15CCalculationStatus =
  | "calculated"
  | "blocked_missing_phase15b_inputs"
  | "blocked_invalid_wacc_growth";

export type Phase15CFormulaParityStatus = "formula_validated";

export interface Phase15CSourceProvenance {
  readonly workbookFile: string;
  readonly visibleWorkbookSheet: string;
  readonly ratifiedMethodologyDoc: string;
  readonly ratifiedSections: readonly string[];
  readonly notes: readonly string[];
}

export interface Phase15CExplicitExclusions {
  readonly workingCapital: "excluded";
  readonly financingCashFlows: "excluded";
  readonly simplePayback: "excluded";
  readonly discountedPayback: "excluded";
  readonly tierInvestmentInterpretation: "excluded";
  readonly uiInterpretation: "excluded";
  readonly notes: string;
}

export interface Phase15CResult {
  readonly capexOptionId: CapexOptionId;
  // Exactly 21 entries: pre_ops followed by 2028..2047.
  readonly periods: readonly DiscountedCashFlowPeriodResult[];
  readonly terminalValue: TerminalValueResult;
  // PnL!Z289 = sum(periods[i].discountedCashFlowBRL) + terminalValue.terminalValuePresentValueBRL.
  // null unless calculationStatus === "calculated".
  readonly npvBRL: number | null;
  // null unless irrStatus === "calculated".
  readonly irrRate: number | null;
  readonly irrStatus: IrrStatus;
  readonly irrStatusReason: string;
  readonly irrMultipleRootsPossible: boolean;
  readonly calculationStatus: Phase15CCalculationStatus;
  readonly calculationStatusReason: string;
  readonly sourceProvenance: Phase15CSourceProvenance;
  readonly phase15CFormulaParityStatus: Phase15CFormulaParityStatus;
  // Passed through unchanged from the input CapitalDecisionResult.
  readonly integratedBaselineParityStatus: CapitalDecisionIntegratedBaselineParityStatus;
  readonly integratedBaselineParityNote: string;
  readonly explicitExclusions: Phase15CExplicitExclusions;
}

// Pure core: takes Phase 15B's committed result + canonical Phase 15C
// drivers, returns Phase15CResult. No upstream engine calls, no mutation of
// capitalDecisionResult.
export interface Phase15CCoreInput {
  readonly capitalDecisionResult: CapitalDecisionResult;
  readonly driverSource: CapitalDecisionDriverSource;
}
