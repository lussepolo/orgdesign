// Phase 13E (2026-06-09): Enrollment & Capacity Decision-Lever Contract for DRE scenario
// generation.
// V10-E1 (2026-07-24): active captação scenarios are Conservador, Base, and
// Otimista. T1-G4 and T1-G6 have governed enrollment and capacity.
// Enrollment-dependent calculations reject unsupported packages before Receita,
// FOPAG, DRE, or exports.
//
// CORE PRINCIPLE:
//   The PnL workbook's learner-count trajectory (PNL_FORMULA_PARITY_SOURCE_DATA row 221
//   numero_de_alunos, ~257 learners in 2028 — Phase 13B finding) is NOT the source of truth
//   for scenario-generated learner counts and is NOT a calibration target for scenario
//   generation. Learner counts consumed by the DRE engine (numero_de_alunos,
//   receitas_com_ensino_regular) are produced exclusively by two simulator decision levers:
//     openingPackageId       (opening package / grade span)
//     × occupancyScenarioId  (captação scenario)
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
//   Capacity is package/year-specific evidence, not a captação scenario. V10-E1
//   keeps governed capacity in governedCaptacaoCapacitySourceData.ts and blocks
//   occupancy where governed enrollment is absent.
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
  ActiveOpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
  OPENING_PACKAGE_IDS,
  parseOccupancyScenarioId,
  parseOpeningPackageId,
  RETIRED_OPENING_PACKAGE_IDS,
} from "./openingPackageOccupancySourceDataContract";

// The two decision levers that determine the learner counts fed to the DRE engine
// for scenario generation. Deliberately minimal: exactly these two fields.
export interface DreEnrollmentCapacityLeverInput {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
}

export const DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS: readonly OpeningPackageId[] = [
  ...OPENING_PACKAGE_IDS,
] as const;

export const DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS: readonly ActiveOpeningPackageId[] = [
  ...ACTIVE_OPENING_PACKAGE_IDS,
] as const;

export const DRE_ENROLLMENT_LEVER_RETIRED_OPENING_PACKAGE_IDS = [
  ...RETIRED_OPENING_PACKAGE_IDS,
] as const;

export const DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS: readonly OccupancyScenarioId[] = [
  ...OCCUPANCY_SCENARIO_IDS,
];

export const DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE: Readonly<
  Record<OpeningPackageId, readonly OccupancyScenarioId[]>
> = {
  t1_g3: [],
  t1_g4: ["conservador", "base", "otimista"],
  t1_g5: [],
  t1_g6: ["conservador", "base", "otimista"],
} as const;

// Valid current enrollment-backed combinations supported by governed G4 and G6
// captação data. T1-G3 and T1-G5 remain type-compatible package identifiers but
// are not valid for enrollment-dependent calculations until governed evidence is
// supplied.
export const DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS: readonly DreEnrollmentCapacityLeverInput[] =
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS.flatMap((openingPackageId) =>
    DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE[openingPackageId].map((occupancyScenarioId) => ({
      openingPackageId,
      occupancyScenarioId,
    })),
  );

export function isOpeningPackageId(value: string): value is OpeningPackageId {
  return (DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS as readonly string[]).includes(value);
}

export function isActiveDreEnrollmentOpeningPackageId(value: string): value is ActiveOpeningPackageId {
  return (DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS as readonly string[]).includes(value);
}

export function isSupportedDreEnrollmentCapacityLeverInput(
  input: DreEnrollmentCapacityLeverInput,
): boolean {
  return DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE[input.openingPackageId].includes(
    input.occupancyScenarioId,
  );
}

export function normalizeDreEnrollmentCapacityLeverInput(input: {
  readonly openingPackageId: string;
  readonly occupancyScenarioId: string;
}): DreEnrollmentCapacityLeverInput {
  const parsedPackage = parseOpeningPackageId(input.openingPackageId);
  if (parsedPackage.status === "retired_package") {
    throw new Error(`Retired openingPackageId: ${input.openingPackageId}`);
  }
  if (parsedPackage.status === "invalid_package") {
    throw new Error(`Unsupported openingPackageId: ${input.openingPackageId}`);
  }

  const parsedScenario = parseOccupancyScenarioId(input.occupancyScenarioId);
  if (parsedScenario.status === "retired_scenario") {
    throw new Error(`Retired occupancyScenarioId: ${input.occupancyScenarioId}`);
  }
  if (parsedScenario.status === "invalid_scenario") {
    throw new Error(`Unsupported occupancyScenarioId: ${input.occupancyScenarioId}`);
  }

  const normalized = {
    openingPackageId: parsedPackage.packageId,
    occupancyScenarioId: parsedScenario.scenarioId,
  };

  if (!isSupportedDreEnrollmentCapacityLeverInput(normalized)) {
    throw new Error(
      `Unsupported openingPackageId/occupancyScenarioId combination: ${input.openingPackageId}/${parsedScenario.scenarioId}`,
    );
  }

  return normalized;
}

export function assertSupportedDreEnrollmentCapacityLeverInput(
  input: DreEnrollmentCapacityLeverInput,
): void {
  if (!isSupportedDreEnrollmentCapacityLeverInput(input)) {
    throw new Error(
      `Unsupported openingPackageId/occupancyScenarioId combination: ${input.openingPackageId}/${input.occupancyScenarioId}`,
    );
  }
}

// V10-E1 governed captação workbook maximum physical capacity. Reference value
// only; available capacity is resolved by package/year records in
// governedCaptacaoCapacitySourceData.ts.
export const DRE_ENROLLMENT_LEVER_PHYSICAL_CAPACITY_CAP = 740 as const;
