// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — scenario
// comparison contract.
//
// Compares already-computed InvestmentInterpretationResult values dimension
// by dimension. Does NOT produce a total/lexicographic ranking, a weighted
// or composite score, an "overall winner" / "preferred scenario" field, a
// Tier classification, or a sorted best-to-worst list. Input scenario order
// is preserved throughout.

import type { CapitalDecisionEngineInput } from "./capitalDecisionEngineContract";
import type { InvestmentInterpretationResult } from "./investmentInterpretationEngineContract";

// "scenario_a_stronger" / "scenario_b_stronger": one scenario is factually
// stronger than the other on this dimension (per scenarioInvestmentComparison.ts
// rules).
// "equal": both scenarios have the same value on this dimension (within
// documented tolerance where applicable).
// "not_comparable": at least one scenario's value on this dimension is
// unavailable, blocked, or of a kind that cannot be ordered against the
// other (e.g. "irr_unavailable" vs a calculated reference status, "NA"
// payback vs a numeric payback, blocked_upstream vs anything).
export type DimensionComparisonOutcome =
  | "scenario_a_stronger"
  | "scenario_b_stronger"
  | "equal"
  | "not_comparable";

export interface ScenarioInvestmentInterpretationRecord {
  readonly scenarioId: string;
  readonly scenarioInput: CapitalDecisionEngineInput;
  readonly result: InvestmentInterpretationResult;
}

export interface ScenarioInvestmentPairComparisonExplicitExclusions {
  readonly overallWinner: "excluded";
  readonly totalRanking: "excluded";
  readonly weightedScore: "excluded";
  readonly tierTaxonomy: "excluded";
  readonly boardRecommendation: "excluded";
}

export interface ScenarioInvestmentPairComparison {
  readonly scenarioAId: string;
  readonly scenarioBId: string;

  // Comparison of investmentReferenceStatus (meets_reference /
  // does_not_meet_reference / irr_unavailable / blocked_upstream).
  readonly investmentReferenceComparison: DimensionComparisonOutcome;

  // Comparison of tirWaccSpreadRate (higher positive spread is stronger).
  readonly tirWaccSpreadComparison: DimensionComparisonOutcome;

  // Comparison of discountedPaybackCompactValue (lower numeric years is
  // stronger; numeric beats "20+"; "NA" and null are not comparable).
  readonly discountedPaybackComparison: DimensionComparisonOutcome;

  // Comparison of npvBRL (higher VPL is stronger; reported factually, no
  // independent pass/fail threshold).
  readonly npvComparison: DimensionComparisonOutcome;

  // true when comparable dimensions do not all favor the same scenario.
  readonly tradeOffsPresent: boolean;
  readonly tradeOffNotes: readonly string[];

  readonly scenarioA: InvestmentInterpretationResult;
  readonly scenarioB: InvestmentInterpretationResult;

  readonly explicitExclusions: ScenarioInvestmentPairComparisonExplicitExclusions;
}

export interface ScenarioInvestmentComparisonExplicitExclusions {
  readonly totalRanking: "excluded";
  readonly overallWinner: "excluded";
  readonly weightedScore: "excluded";
  readonly tierTaxonomy: "excluded";
}

export interface ScenarioInvestmentComparisonResult {
  readonly scenarios: readonly ScenarioInvestmentInterpretationRecord[];
  readonly pairwiseComparisons: readonly ScenarioInvestmentPairComparison[];
  // scenarioIds with investmentReferenceStatus === "blocked_upstream"
  // (Phase 15C/15D technical failure). Listed for visibility; still included
  // in `scenarios` and `pairwiseComparisons` (where all dimension outcomes
  // against them are "not_comparable").
  readonly notComparableScenarioIds: readonly string[];
  readonly explicitExclusions: ScenarioInvestmentComparisonExplicitExclusions;
}
