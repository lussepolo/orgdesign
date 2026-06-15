// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — investment
// interpretation engine.
//
// Pure core (interpretInvestmentResult) consumes Phase 15C's committed
// Phase15CResult (94f2ebb) and Phase 15D's committed DiscountedPaybackResult
// (0fbd188), both derived from the same scenarioInput, and produces an
// InvestmentInterpretationResult. No DCF/VPL/TIR/discounted-payback
// recalculation occurs here.
//
// Production entry point (calculateInvestmentInterpretation) calls
// calculatePhase15CInvestmentMetrics() exactly once, derives the
// DiscountedPaybackResult from that same Phase15CResult via
// calculateDiscountedPayback(), and feeds both into the pure core. This
// avoids a duplicate Phase 15C calculation pass and guarantees the Phase 15C
// and Phase 15D results originate from the same object.

import { calculatePhase15CInvestmentMetrics } from "./phase15cInvestmentMetricsEngine";
import { calculateDiscountedPayback } from "./discountedPaybackEngine";
import { CAPITAL_DECISION_DRIVER_SOURCE } from "./capitalDecisionDriverSourceData";
import type { CapitalDecisionEngineInput } from "./capitalDecisionEngineContract";
import type { Phase15CResult } from "./phase15cInvestmentMetricsEngineContract";
import type { DiscountedPaybackResult } from "./discountedPaybackEngineContract";
import type {
  InvestmentInterpretationEngineInput,
  InvestmentInterpretationResult,
  InvestmentReferenceStatus,
  NpvSign,
  Phase15EExplicitExclusions,
  Phase15EInterpretationSourceProvenance,
  ScenarioDecisionLeverTraceability,
} from "./investmentInterpretationEngineContract";

const RATIFIED_METHODOLOGY_DOC =
  "src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md";

const EXPLICIT_EXCLUSIONS: Phase15EExplicitExclusions = {
  receitaRecalculation: "excluded",
  fopagRecalculation: "excluded",
  ebitdaRecalculation: "excluded",
  fcoRecalculation: "excluded",
  capexRecalculation: "excluded",
  dcfRecalculation: "excluded",
  npvRecalculation: "excluded",
  irrRecalculation: "excluded",
  discountedPaybackRecalculation: "excluded",
  tierTaxonomy: "excluded",
  weightedScore: "excluded",
  totalRanking: "excluded",
  overallWinner: "excluded",
  boardRecommendation: "excluded",
  uiInterpretation: "excluded",
  notes:
    "Phase 15E interprets Phase 15C's DCF/VPL/TIR/terminal-value outputs " +
    "(94f2ebb) and Phase 15D's discounted-payback output (0fbd188) against " +
    "the ratified TIR>WACC investment reference. It performs no financial " +
    "recalculation, defines no Tier taxonomy, weighted score, total ranking, " +
    "overall winner, or board recommendation, and implements no UI " +
    "(see Phase 15F boundary in IMPLEMENTATION.md).",
};

function buildSourceProvenance(): Phase15EInterpretationSourceProvenance {
  return {
    phase15cCommit: "94f2ebb",
    phase15dCommit: "0fbd188",
    investmentReferenceWaccSource: "CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate",
    investmentReferenceWaccRateValue: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
    ratifiedMethodologyDoc: RATIFIED_METHODOLOGY_DOC,
    ratifiedSections: ["S16.5"],
    notes: [
      "investmentReferenceWaccRate is CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate " +
        "(PnL!C6:V6, constant 2028-2047; also PnL!Z278, the perpetuity/final-projection-year " +
        "WACC). It is NOT preOpsWaccRate (PnL!B6, pre-ops only), not an average across periods, " +
        "and not a scenario-specific or hidden-workbook value.",
      "The investment reference is irrRate > investmentReferenceWaccRate, evaluated strictly: " +
        "irrRate === investmentReferenceWaccRate does NOT meet the reference.",
    ],
  };
}

function buildDecisionLevers(scenarioInput: CapitalDecisionEngineInput): ScenarioDecisionLeverTraceability {
  return {
    openingPackageId: scenarioInput.openingPackageId,
    occupancyScenarioId: scenarioInput.occupancyScenarioId,
    tuitionScenarioId: scenarioInput.tuitionScenarioId,
    orgDesignOptionId: scenarioInput.orgDesignOptionId,
    capexOptionId: scenarioInput.capexOptionId,
    serviceContracts: "fixed_approved_dre_assumption",
    msHsProgressionModel: "future_upstream_integration_not_wired",
  };
}

function npvSignOf(npvBRL: number | null): NpvSign {
  if (npvBRL === null) return "unavailable";
  if (npvBRL > 0) return "positive";
  if (npvBRL < 0) return "negative";
  return "zero";
}

const PHASE15D_TECHNICAL_FAILURE_STATUSES = new Set([
  "blocked_missing_phase15c_inputs",
  "invalid_cash_flow_series",
]);

export function interpretInvestmentResult(
  input: InvestmentInterpretationEngineInput,
): InvestmentInterpretationResult {
  const { scenarioInput, phase15CResult, discountedPaybackResult } = input;

  const investmentReferenceWaccRate = CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate;
  const sourceProvenance = buildSourceProvenance();
  const decisionLevers = buildDecisionLevers(scenarioInput);
  const npvSign = npvSignOf(phase15CResult.npvBRL);
  const notes: string[] = [];

  // §A -- blocked upstream (Phase 15C and/or Phase 15D technical failure).
  const phase15CBlocked = phase15CResult.calculationStatus !== "calculated";
  const phase15DBlocked = PHASE15D_TECHNICAL_FAILURE_STATUSES.has(discountedPaybackResult.status);
  if (phase15CBlocked || phase15DBlocked) {
    let investmentReferenceStatus: InvestmentReferenceStatus = "blocked_upstream";
    notes.push(
      `Blocked upstream: Phase 15C calculationStatus="${phase15CResult.calculationStatus}" ` +
        `(${phase15CResult.calculationStatusReason}); Phase 15D status="${discountedPaybackResult.status}" ` +
        `(${discountedPaybackResult.statusReason}). No investment-reference evaluation is inferred.`,
    );
    return {
      scenarioInput,
      decisionLevers,
      capexOptionId: phase15CResult.capexOptionId,
      investmentReferenceWaccRate,
      irrRate: phase15CResult.irrRate,
      irrStatus: phase15CResult.irrStatus,
      irrStatusReason: phase15CResult.irrStatusReason,
      irrMultipleRootsPossible: phase15CResult.irrMultipleRootsPossible,
      tirWaccSpreadRate: null,
      investmentReferenceStatus,
      meetsInvestmentReference: null,
      npvBRL: phase15CResult.npvBRL,
      npvSign,
      discountedPaybackStatus: discountedPaybackResult.status,
      discountedPaybackYears: discountedPaybackResult.discountedPaybackYears,
      discountedPaybackCompactValue: discountedPaybackResult.compactValue,
      calculationStatus: phase15CResult.calculationStatus,
      calculationStatusReason: phase15CResult.calculationStatusReason,
      interpretationNotes: notes,
      sourceProvenance,
      explicitExclusions: EXPLICIT_EXCLUSIONS,
    };
  }

  // §B / §C -- Phase 15C calculated. Evaluate IRR availability.
  let tirWaccSpreadRate: number | null = null;
  let meetsInvestmentReference: boolean | null = null;
  let investmentReferenceStatus: InvestmentReferenceStatus;

  const irrAvailable = phase15CResult.irrStatus === "calculated" && phase15CResult.irrRate !== null;

  if (!irrAvailable) {
    investmentReferenceStatus = "irr_unavailable";
    notes.push(
      `IRR unavailable: irrStatus="${phase15CResult.irrStatus}" (${phase15CResult.irrStatusReason}). ` +
        "tirWaccSpreadRate and meetsInvestmentReference are null; VPL and discounted payback remain reported.",
    );
  } else {
    const irrRate = phase15CResult.irrRate as number;
    tirWaccSpreadRate = irrRate - investmentReferenceWaccRate;
    meetsInvestmentReference = irrRate > investmentReferenceWaccRate;
    investmentReferenceStatus = meetsInvestmentReference ? "meets_reference" : "does_not_meet_reference";
    if (irrRate === investmentReferenceWaccRate) {
      notes.push(
        `irrRate equals investmentReferenceWaccRate (${investmentReferenceWaccRate}); ` +
          'strict ">" means this does not meet the investment reference.',
      );
    }
  }

  // §D -- multiple-root warning.
  if (phase15CResult.irrMultipleRootsPossible) {
    notes.push(
      "irrMultipleRootsPossible=true: the reported irrRate may not be the unique root of the " +
        "cash-flow series. The investmentReferenceStatus above is retained as calculated; no " +
        "reconciliation with npvBRL is performed and no recommendation is inferred.",
    );
  }

  return {
    scenarioInput,
    decisionLevers,
    capexOptionId: phase15CResult.capexOptionId,
    investmentReferenceWaccRate,
    irrRate: phase15CResult.irrRate,
    irrStatus: phase15CResult.irrStatus,
    irrStatusReason: phase15CResult.irrStatusReason,
    irrMultipleRootsPossible: phase15CResult.irrMultipleRootsPossible,
    tirWaccSpreadRate,
    investmentReferenceStatus,
    meetsInvestmentReference,
    npvBRL: phase15CResult.npvBRL,
    npvSign,
    discountedPaybackStatus: discountedPaybackResult.status,
    discountedPaybackYears: discountedPaybackResult.discountedPaybackYears,
    discountedPaybackCompactValue: discountedPaybackResult.compactValue,
    calculationStatus: phase15CResult.calculationStatus,
    calculationStatusReason: phase15CResult.calculationStatusReason,
    interpretationNotes: notes,
    sourceProvenance,
    explicitExclusions: EXPLICIT_EXCLUSIONS,
  };
}

export function calculateInvestmentInterpretation(
  input: CapitalDecisionEngineInput,
): InvestmentInterpretationResult {
  const phase15CResult: Phase15CResult = calculatePhase15CInvestmentMetrics(input);
  const discountedPaybackResult: DiscountedPaybackResult = calculateDiscountedPayback({ phase15CResult });
  return interpretInvestmentResult({
    scenarioInput: input,
    phase15CResult,
    discountedPaybackResult,
  });
}
