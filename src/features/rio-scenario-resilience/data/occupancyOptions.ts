// Phase 15F — UI-facing Occupancy lever option source.
//
// IDs are the canonical OccupancyScenarioId values from
// openingPackageOccupancySourceDataContract.ts. Labels are the approved
// source labels (OccupancyScenarioSourceLabel) from the same contract.
//
// This file contains only IDs, display labels, and short descriptive text.
// It does not duplicate occupancy rates, enrollment values, or any other
// calculation input — those remain calculation-engine responsibilities and
// are read directly from CapitalDecisionEngineInput.occupancyScenarioId by
// calculateInvestmentInterpretation.

import type { OccupancyScenarioId } from "../model/openingPackageOccupancySourceDataContract";

export interface OccupancyOption {
  readonly id: OccupancyScenarioId;
  readonly label: string;
}

export const occupancyOptions: readonly OccupancyOption[] = [
  { id: "pessimista", label: "Pessimista" },
  { id: "intermediario", label: "Intermediário" },
  { id: "otimista", label: "Otimista" },
] as const;
