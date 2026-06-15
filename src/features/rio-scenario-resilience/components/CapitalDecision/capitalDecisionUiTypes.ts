// Phase 15F — UI-facing types for the Capital Decision view.
//
// These types describe the UI's scenario-state and lever shape only. They do
// not redefine, narrow, or duplicate any Phase 15B-15E contract type --
// `input` is a verbatim CapitalDecisionEngineInput and `result` is a verbatim
// InvestmentInterpretationResult produced by calculateInvestmentInterpretation.

import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import type { InvestmentInterpretationResult } from "../../model/investmentInterpretationEngineContract";

// The five currently variable, production-wired decision levers exposed by
// this UI. Service Contracts (fixed approved DRE assumption) and the MS/HS
// Progression Model (future upstream integration) are rendered as
// explanatory context only and are not part of this lever set.
export type CapitalDecisionLeverId =
  | "openingGrades"
  | "occupancy"
  | "orgDesignStructure"
  | "tuition"
  | "capex";

// Runtime mirror of CapitalDecisionLeverId, used by Phase 15F UI validation
// to confirm the lever set is exactly these five and does not include
// "serviceContracts".
export const CAPITAL_DECISION_LEVER_IDS: readonly CapitalDecisionLeverId[] = [
  "openingGrades",
  "occupancy",
  "orgDesignStructure",
  "tuition",
  "capex",
];

export interface CapitalDecisionLeverOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
}

// A single saved scenario configuration and its production-calculated
// result. One SavedScenario === one calculateInvestmentInterpretation(input)
// call.
export interface SavedScenario {
  readonly id: string;
  readonly name: string;
  readonly input: CapitalDecisionEngineInput;
  readonly result: InvestmentInterpretationResult;
}

export const MAX_SAVED_SCENARIOS = 4;
