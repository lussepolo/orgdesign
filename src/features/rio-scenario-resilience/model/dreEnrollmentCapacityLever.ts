// Phase 13E (2026-06-09): Enrollment & Capacity decision-lever resolution.
//
// resolveEnrollmentCapacityLeverInput() reads the two enrollment-relevant entries from
// ScenarioDecisionLeverSelections (openingGrades, occupancyEnrollment) and returns the
// typed DreEnrollmentCapacityLeverInput consumed by calculateReceita() / calculateDre().
//
// Returns null when either lever has not yet been selected — callers must not synthesize
// a default opening package or occupancy scenario. No PnL-workbook value is used as a
// fallback or default.
//
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No Tier. No UI.

import type { ScenarioDecisionLeverSelections } from "./scenarioDecisionLeverContract";
import type {
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import {
  normalizeDreEnrollmentCapacityLeverInput,
  type DreEnrollmentCapacityLeverInput,
} from "./dreEnrollmentCapacityLeverContract";

export function resolveEnrollmentCapacityLeverInput(
  selections: ScenarioDecisionLeverSelections,
): DreEnrollmentCapacityLeverInput | null {
  const openingPackageId = selections.openingGrades.selectedOptionId as OpeningPackageId | null;
  const occupancyScenarioId = selections.occupancyEnrollment.selectedOptionId;

  if (openingPackageId === null || occupancyScenarioId === null) {
    return null;
  }

  return normalizeDreEnrollmentCapacityLeverInput({ openingPackageId, occupancyScenarioId });
}
