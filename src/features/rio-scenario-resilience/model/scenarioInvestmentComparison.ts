// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — scenario
// comparison engine.
//
// Pure functions only: compares already-computed InvestmentInterpretationResult
// values dimension by dimension (investment-reference status, TIR-WACC
// spread, discounted payback, VPL). No financial recalculation, no Tier, no
// weighted score, no total ranking, no "overall winner". Input scenario
// order is preserved.

import { calculateInvestmentInterpretation } from "./investmentInterpretationEngine";
import type { CapitalDecisionEngineInput } from "./capitalDecisionEngineContract";
import type { InvestmentInterpretationResult } from "./investmentInterpretationEngineContract";
import type {
  DimensionComparisonOutcome,
  ScenarioInvestmentComparisonResult,
  ScenarioInvestmentInterpretationRecord,
  ScenarioInvestmentPairComparison,
} from "./scenarioInvestmentComparisonContract";

// Absolute-rate tolerance for TIR-WACC spread equality (1e-9, i.e.
// effectively exact -- spreads are derived from the same irrRate/wacc
// inputs, so any non-zero difference is meaningful).
const SPREAD_TOLERANCE_RATE = 1e-9;

// Absolute BRL tolerance for VPL equality, matching the tolerance convention
// used by Phase 15D's validation suite.
const NPV_TOLERANCE_BRL = 1;

function compareInvestmentReferenceStatus(
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
): DimensionComparisonOutcome {
  if (a.investmentReferenceStatus === "blocked_upstream" || b.investmentReferenceStatus === "blocked_upstream") {
    return "not_comparable";
  }
  if (a.investmentReferenceStatus === "irr_unavailable" || b.investmentReferenceStatus === "irr_unavailable") {
    return a.investmentReferenceStatus === b.investmentReferenceStatus ? "equal" : "not_comparable";
  }
  // Both are "meets_reference" or "does_not_meet_reference".
  if (a.investmentReferenceStatus === b.investmentReferenceStatus) return "equal";
  return a.investmentReferenceStatus === "meets_reference" ? "scenario_a_stronger" : "scenario_b_stronger";
}

function compareTirWaccSpread(
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
): DimensionComparisonOutcome {
  if (a.tirWaccSpreadRate === null || b.tirWaccSpreadRate === null) return "not_comparable";
  const diff = a.tirWaccSpreadRate - b.tirWaccSpreadRate;
  if (Math.abs(diff) < SPREAD_TOLERANCE_RATE) return "equal";
  // Higher positive spread is stronger.
  return diff > 0 ? "scenario_a_stronger" : "scenario_b_stronger";
}

// Converts a discounted-payback compactValue to an ordinal for comparison.
// "20+" sorts after every numeric value 1..20 (21). "NA" and null are not
// converted -- callers must check for them before calling this.
function paybackOrdinal(compactValue: "20+" | string): number {
  return compactValue === "20+" ? 21 : Number(compactValue);
}

function compareDiscountedPayback(
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
): DimensionComparisonOutcome {
  const aVal = a.discountedPaybackCompactValue;
  const bVal = b.discountedPaybackCompactValue;
  // null: technical-failure status (blocked_*, invalid_cash_flow_series).
  if (aVal === null || bVal === null) return "not_comparable";
  // "NA": negative-VPL outcome, a different economic/status condition, not a
  // duration. Not comparable against numeric or "20+" values, including
  // another "NA".
  if (aVal === "NA" || bVal === "NA") return "not_comparable";
  const aOrdinal = paybackOrdinal(aVal);
  const bOrdinal = paybackOrdinal(bVal);
  if (aOrdinal === bOrdinal) return "equal";
  // Lower numeric payback (including "20+"=21 ranking after all numeric
  // years) is stronger.
  return aOrdinal < bOrdinal ? "scenario_a_stronger" : "scenario_b_stronger";
}

function compareNpv(
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
): DimensionComparisonOutcome {
  if (a.npvBRL === null || b.npvBRL === null) return "not_comparable";
  const diff = a.npvBRL - b.npvBRL;
  if (Math.abs(diff) < NPV_TOLERANCE_BRL) return "equal";
  return diff > 0 ? "scenario_a_stronger" : "scenario_b_stronger";
}

function buildTradeOffNotes(
  scenarioAId: string,
  scenarioBId: string,
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
  investmentReferenceComparison: DimensionComparisonOutcome,
  tirWaccSpreadComparison: DimensionComparisonOutcome,
  discountedPaybackComparison: DimensionComparisonOutcome,
  npvComparison: DimensionComparisonOutcome,
): { tradeOffsPresent: boolean; tradeOffNotes: readonly string[] } {
  const notes: string[] = [];
  let favorsA = false;
  let favorsB = false;

  if (investmentReferenceComparison === "scenario_a_stronger" || investmentReferenceComparison === "scenario_b_stronger") {
    const stronger = investmentReferenceComparison === "scenario_a_stronger" ? scenarioAId : scenarioBId;
    notes.push(
      `${stronger} meets the investment reference (TIR>WACC) while the other does not ` +
        `(${scenarioAId} status="${a.investmentReferenceStatus}", ${scenarioBId} status="${b.investmentReferenceStatus}").`,
    );
    if (investmentReferenceComparison === "scenario_a_stronger") favorsA = true;
    else favorsB = true;
  }

  if (tirWaccSpreadComparison === "scenario_a_stronger" || tirWaccSpreadComparison === "scenario_b_stronger") {
    const stronger = tirWaccSpreadComparison === "scenario_a_stronger" ? scenarioAId : scenarioBId;
    notes.push(
      `${stronger} has the higher TIR-WACC spread (${scenarioAId}=${a.tirWaccSpreadRate}, ` +
        `${scenarioBId}=${b.tirWaccSpreadRate}).`,
    );
    if (tirWaccSpreadComparison === "scenario_a_stronger") favorsA = true;
    else favorsB = true;
  }

  if (discountedPaybackComparison === "scenario_a_stronger" || discountedPaybackComparison === "scenario_b_stronger") {
    const stronger = discountedPaybackComparison === "scenario_a_stronger" ? scenarioAId : scenarioBId;
    notes.push(
      `${stronger} has the shorter discounted payback (${scenarioAId}="${a.discountedPaybackCompactValue}", ` +
        `${scenarioBId}="${b.discountedPaybackCompactValue}").`,
    );
    if (discountedPaybackComparison === "scenario_a_stronger") favorsA = true;
    else favorsB = true;
  } else if (discountedPaybackComparison === "equal") {
    notes.push(
      `${scenarioAId} and ${scenarioBId} have the same discounted-payback compact outcome ` +
        `("${a.discountedPaybackCompactValue}").`,
    );
  }

  if (npvComparison === "scenario_a_stronger" || npvComparison === "scenario_b_stronger") {
    const stronger = npvComparison === "scenario_a_stronger" ? scenarioAId : scenarioBId;
    notes.push(
      `${stronger} has the higher VPL (${scenarioAId}=${a.npvBRL}, ${scenarioBId}=${b.npvBRL}).`,
    );
    if (npvComparison === "scenario_a_stronger") favorsA = true;
    else favorsB = true;
  }

  const tradeOffsPresent = favorsA && favorsB;
  if (notes.length === 0) {
    notes.push("No comparable dimensions yielded a difference between these scenarios.");
  }

  return { tradeOffsPresent, tradeOffNotes: notes };
}

export function compareInvestmentScenarioPair(
  scenarioAId: string,
  scenarioBId: string,
  a: InvestmentInterpretationResult,
  b: InvestmentInterpretationResult,
): ScenarioInvestmentPairComparison {
  const investmentReferenceComparison = compareInvestmentReferenceStatus(a, b);
  const tirWaccSpreadComparison = compareTirWaccSpread(a, b);
  const discountedPaybackComparison = compareDiscountedPayback(a, b);
  const npvComparison = compareNpv(a, b);

  const { tradeOffsPresent, tradeOffNotes } = buildTradeOffNotes(
    scenarioAId,
    scenarioBId,
    a,
    b,
    investmentReferenceComparison,
    tirWaccSpreadComparison,
    discountedPaybackComparison,
    npvComparison,
  );

  return {
    scenarioAId,
    scenarioBId,
    investmentReferenceComparison,
    tirWaccSpreadComparison,
    discountedPaybackComparison,
    npvComparison,
    tradeOffsPresent,
    tradeOffNotes,
    scenarioA: a,
    scenarioB: b,
    explicitExclusions: {
      overallWinner: "excluded",
      totalRanking: "excluded",
      weightedScore: "excluded",
      tierTaxonomy: "excluded",
      boardRecommendation: "excluded",
    },
  };
}

// Pure: compares an already-computed list of interpretation records.
// Preserves input order. Produces all C(n,2) pairwise comparisons in input
// order (scenario i vs scenario j for i < j).
export function compareInvestmentScenarios(
  scenarios: readonly ScenarioInvestmentInterpretationRecord[],
): ScenarioInvestmentComparisonResult {
  const pairwiseComparisons: ScenarioInvestmentPairComparison[] = [];
  for (let i = 0; i < scenarios.length; i++) {
    for (let j = i + 1; j < scenarios.length; j++) {
      pairwiseComparisons.push(
        compareInvestmentScenarioPair(
          scenarios[i].scenarioId,
          scenarios[j].scenarioId,
          scenarios[i].result,
          scenarios[j].result,
        ),
      );
    }
  }

  const notComparableScenarioIds = scenarios
    .filter((s) => s.result.investmentReferenceStatus === "blocked_upstream")
    .map((s) => s.scenarioId);

  return {
    scenarios,
    pairwiseComparisons,
    notComparableScenarioIds,
    explicitExclusions: {
      totalRanking: "excluded",
      overallWinner: "excluded",
      weightedScore: "excluded",
      tierTaxonomy: "excluded",
    },
  };
}

// Production wrapper: runs the committed chain once per scenario (via
// calculateInvestmentInterpretation) and compares the results. Preserves
// input order.
export function calculateScenarioInvestmentComparison(
  scenarios: readonly { scenarioId: string; scenarioInput: CapitalDecisionEngineInput }[],
): ScenarioInvestmentComparisonResult {
  const records: ScenarioInvestmentInterpretationRecord[] = scenarios.map((s) => ({
    scenarioId: s.scenarioId,
    scenarioInput: s.scenarioInput,
    result: calculateInvestmentInterpretation(s.scenarioInput),
  }));
  return compareInvestmentScenarios(records);
}
