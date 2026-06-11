// Phase 13E (2026-06-09): Enrollment & Capacity Decision-Lever Contract for DRE scenario
// generation.
//
// CORE PRINCIPLE:
//   The PnL workbook's learner-count trajectory (PNL_FORMULA_PARITY_SOURCE_DATA row 221
//   numero_de_alunos, ~257 learners in 2028 — Phase 13B finding) is NOT the source of truth
//   for scenario-generated learner counts and is NOT a calibration target for scenario
//   generation. Learner counts consumed by the DRE engine (numero_de_alunos,
//   receitas_com_ensino_regular) are produced exclusively by two simulator decision levers:
//     openingPackageId       (opening package / grade span)
//     × occupancyScenarioId  (occupancy scenario, capacity-bounded)
//   via COMBINED_ENROLLMENT_RECORDS (matureStateCarryForwardSourceData.ts).
//
// CONFIRMED DATA FLOW (Phase 13E audit):
//   ScenarioDecisionLeverSelections.openingGrades.selectedOptionId      → OpeningPackageId
//   ScenarioDecisionLeverSelections.occupancyEnrollment.selectedOptionId → OccupancyScenarioId
//     ↓
//   DreEngineInput.openingPackageId, DreEngineInput.occupancyScenarioId
//     ↓
//   calculateReceita({ openingPackageId, occupancyScenarioId, tuitionScenarioId })
//     filters COMBINED_ENROLLMENT_RECORDS by (packageId, scenarioId)
//     → grainRecords[].contractedLearners (per grade × year)
//     ↓
//   adaptNumeroDeAlunos(receitaOutput, year)        → DreYearResult.numero_de_alunos
//   adaptReceitasComEnsinoRegular(receitaOutput, year) → DreYearResult.receitas_com_ensino_regular
//
// CAPACITY:
//   Capacity is not a separate explicit lever in v1. It is embedded in the occupancy-scenario
//   enrollment records (COMBINED_ENROLLMENT_RECORDS): each (packageId × occupancyScenarioId ×
//   grade × year) enrollment value is bounded by the package's physical capacity cap (740,
//   PhysicalCapacityCapRecord in openingPackageOccupancySourceDataContract.ts). Independent
//   capacityByYearAndGrade / availableCapacityByYear records remain unpopulated (empty arrays
//   in EMPTY_OPENING_PACKAGE_OCCUPANCY_SOURCE_DATA_CONTRACT) — capacity is implicit in the
//   selected occupancy scenario, not independently selectable in v1.
//
// PNL WORKBOOK LEARNER COUNTS — NON-USE GUARD (Phase 13E confirmed):
//   PNL_FORMULA_PARITY_SOURCE_DATA (32 rows, including numero_de_turmas / numero_de_alunos)
//   is imported ONLY by dreFormulaParity.ts (Test A: formula parity, confirmed Phase 13D) and
//   dreEbitdaBacktest.ts (Phase 13B diagnostic, status=structural_only).
//   It is NOT imported by receitaEngine.ts, dreEngine.ts, or dreScenarioAdapters.ts —
//   the scenario-generation chain above never reads PnL-workbook learner values.
//
// SCENARIO PARITY (Test B) — explicitly out of scope here:
//   Scenario parity against the PnL workbook baseline remains UNDEFINED unless Finance
//   provides an explicit workbook-scenario benchmark definition (Phase 13B,
//   missing_baseline_scenario_mapping, unresolved). This contract does not attempt to derive
//   such a benchmark and does not treat ~257 learners (2028) as a target.
//
// THREE DISTINCT TESTS (preserved):
//   Formula parity   — Can DRE formulas reproduce spreadsheet PnL subtotals when fed
//                       PnL source row values? (Phase 13D: YES, 320/320.)
//   Scenario generation — Can selected decision levers (this contract) generate a coherent
//                       DRE scenario? (Phase 13E: structurally YES — see validation report.)
//   Scenario parity  — Only valid if Finance explicitly defines a workbook scenario as a
//                       benchmark. Not attempted by default. Remains blocked.
//
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No Tier. No UI.

import type {
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";

// The two decision levers that determine the learner counts fed to the DRE engine
// for scenario generation. Deliberately minimal: exactly these two fields.
export interface DreEnrollmentCapacityLeverInput {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
}

export const DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS: readonly OpeningPackageId[] = [
  "t1_g3",
  "t1_g4",
  "t1_g5",
  "t1_g6",
];

export const DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS: readonly OccupancyScenarioId[] = [
  "intermediario",
  "pessimista",
  "otimista",
];

// All 12 valid (openingPackageId × occupancyScenarioId) combinations supported by
// COMBINED_ENROLLMENT_RECORDS (4 packages × 3 occupancy scenarios, 2028-2047).
export const DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS: readonly DreEnrollmentCapacityLeverInput[] =
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS.flatMap((openingPackageId) =>
    DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.map((occupancyScenarioId) => ({
      openingPackageId,
      occupancyScenarioId,
    })),
  );

// Physical capacity cap shared across packages (source: PhysicalCapacityCapRecord).
// Reference value only — not independently consumed by the enrollment-resolution chain.
export const DRE_ENROLLMENT_LEVER_PHYSICAL_CAPACITY_CAP = 740 as const;
