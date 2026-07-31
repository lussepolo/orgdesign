import type { DreWorkingScenarioOrgDesignOptionId } from "../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type {
  OpeningPackageId,
  OccupancyScenarioId,
} from "../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../features/rio-scenario-resilience/model/revenueInputs";

export interface DreScenarioSimulatorSelections {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  tuitionScenarioId: TuitionScenarioId;
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
}

// Phase 13F working scenario — technical validation fixture only, not board-ratified.
// Kept as literal IDs so the app shell can initialize shared scenario state
// without importing DRE/FOPAG calculation engines before the DRE workspace opens.
export const DRE_DEFAULT_SELECTIONS: DreScenarioSimulatorSelections = {
  openingPackageId: "t1_g6",
  occupancyScenarioId: "base",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
};
