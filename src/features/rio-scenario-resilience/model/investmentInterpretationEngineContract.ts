// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — investment
// interpretation engine contract.
//
// Consumes Phase 15C's committed Phase15CResult (94f2ebb) and Phase 15D's
// committed DiscountedPaybackResult (0fbd188) as read-only inputs. Does NOT
// recalculate Receita, FOPAG, EBITDA, FCO, CAPEX, DCF, VPL, TIR, or discounted
// payback -- every numeric figure here is read directly from those two
// results.
//
// Governing investment reference (ratified):
//   irrRate > investmentReferenceWaccRate
// where investmentReferenceWaccRate is
// CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate (currently 0.12),
// the canonical final-projection-year / perpetuity WACC. TIR === WACC does
// NOT meet the reference (strict `>` only).
//
// This contract intentionally does NOT define: a Tier taxonomy, a weighted
// or composite score, a total/lexicographic scenario ranking, an
// "overall winner" field, or approve/reject/invest recommendations. See
// Phase15EExplicitExclusions and scenarioInvestmentComparisonContract.ts.

import type { CapexOptionId } from "./capexOptionSourceContract";
import type { CapitalDecisionEngineInput } from "./capitalDecisionEngineContract";
import type {
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "./revenueInputs";
import type { IrrStatus } from "./irrEngineContract";
import type {
  Phase15CCalculationStatus,
  Phase15CResult,
} from "./phase15cInvestmentMetricsEngineContract";
import type {
  DiscountedPaybackResult,
  DiscountedPaybackStatus,
} from "./discountedPaybackEngineContract";

// "meets_reference": calculationStatus="calculated", irrStatus="calculated",
// irrRate !== null, and irrRate > investmentReferenceWaccRate (strict).
//
// "does_not_meet_reference": calculationStatus="calculated",
// irrStatus="calculated", irrRate !== null, and
// irrRate <= investmentReferenceWaccRate (TIR === WACC is included here;
// equality does not meet the reference).
//
// "irr_unavailable": calculationStatus="calculated" but
// irrStatus is "no_sign_change" or "did_not_converge", or irrRate === null.
// VPL and discounted payback may still be reported.
//
// "blocked_upstream": Phase 15C calculationStatus !== "calculated", or the
// Phase 15D status is a technical-failure status
// ("blocked_missing_phase15c_inputs" | "invalid_cash_flow_series"). No
// investment-reference evaluation is inferred.
export type InvestmentReferenceStatus =
  | "meets_reference"
  | "does_not_meet_reference"
  | "irr_unavailable"
  | "blocked_upstream";

// Factual VPL sign, independent of InvestmentReferenceStatus.
// "unavailable": npvBRL === null (technical failure upstream).
export type NpvSign = "positive" | "zero" | "negative" | "unavailable";

export interface Phase15EInterpretationSourceProvenance {
  readonly phase15cCommit: "94f2ebb";
  readonly phase15dCommit: "0fbd188";
  readonly investmentReferenceWaccSource: "CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate";
  // Mirrors CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate (0.12) at
  // the time of calculation. Not independently hardcoded elsewhere.
  readonly investmentReferenceWaccRateValue: number;
  readonly ratifiedMethodologyDoc: string;
  readonly ratifiedSections: readonly string[];
  readonly notes: readonly string[];
}

export interface Phase15EExplicitExclusions {
  readonly receitaRecalculation: "excluded";
  readonly fopagRecalculation: "excluded";
  readonly ebitdaRecalculation: "excluded";
  readonly fcoRecalculation: "excluded";
  readonly capexRecalculation: "excluded";
  readonly dcfRecalculation: "excluded";
  readonly npvRecalculation: "excluded";
  readonly irrRecalculation: "excluded";
  readonly discountedPaybackRecalculation: "excluded";
  readonly tierTaxonomy: "excluded";
  readonly weightedScore: "excluded";
  readonly totalRanking: "excluded";
  readonly overallWinner: "excluded";
  readonly boardRecommendation: "excluded";
  readonly uiInterpretation: "excluded";
  readonly notes: string;
}

// Decision-lever traceability for a single interpreted scenario.
//
// openingPackageId / occupancyScenarioId / tuitionScenarioId /
// orgDesignOptionId / capexOptionId are the five currently variable,
// production-wired levers, preserved verbatim from the CapitalDecisionEngineInput
// used to produce phase15CResult/discountedPaybackResult. No user-facing
// labels are invented for orgDesignOptionId, tuitionScenarioId,
// openingPackageId, or capexOptionId -- their canonical IDs are reported
// as-is, as no approved label registry exists for them.
//
// serviceContracts and msHsProgressionModel are static traceability notes,
// not selectable Phase 15E inputs: Service Contracts remain a fixed approved
// DRE-cost-line assumption (invariant across scenarios), and the MS/HS
// Progression Model remains a future upstream integration item that is not
// currently wired into any production input.
export interface ScenarioDecisionLeverTraceability {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly tuitionScenarioId: TuitionScenarioId;
  readonly orgDesignOptionId: string;
  readonly capexOptionId: CapexOptionId;
  readonly serviceContracts: "fixed_approved_dre_assumption";
  readonly msHsProgressionModel: "future_upstream_integration_not_wired";
}

export interface InvestmentInterpretationResult {
  readonly scenarioInput: CapitalDecisionEngineInput;
  readonly decisionLevers: ScenarioDecisionLeverTraceability;
  readonly capexOptionId: CapexOptionId;

  readonly investmentReferenceWaccRate: number;

  readonly irrRate: number | null;
  readonly irrStatus: IrrStatus;
  readonly irrStatusReason: string;
  readonly irrMultipleRootsPossible: boolean | null;

  readonly tirWaccSpreadRate: number | null;
  readonly investmentReferenceStatus: InvestmentReferenceStatus;
  readonly meetsInvestmentReference: boolean | null;

  readonly npvBRL: number | null;
  readonly npvSign: NpvSign;

  readonly discountedPaybackStatus: DiscountedPaybackStatus;
  readonly discountedPaybackYears: number | null;
  readonly discountedPaybackCompactValue: string | null;

  readonly calculationStatus: Phase15CCalculationStatus;
  readonly calculationStatusReason: string;

  readonly interpretationNotes: readonly string[];
  readonly sourceProvenance: Phase15EInterpretationSourceProvenance;
  readonly explicitExclusions: Phase15EExplicitExclusions;
}

// Pure core: takes the original production input alongside Phase 15C's and
// Phase 15D's already-completed results. No upstream engine calls, no
// mutation of any input.
export interface InvestmentInterpretationEngineInput {
  readonly scenarioInput: CapitalDecisionEngineInput;
  readonly phase15CResult: Phase15CResult;
  readonly discountedPaybackResult: DiscountedPaybackResult;
}
