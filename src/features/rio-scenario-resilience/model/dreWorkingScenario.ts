// Phase 13F (2026-06-09): Working Scenario Selection and DRE Scenario-Input Readiness.
//
// Defines WORKING_SCENARIO_SELECTIONS — one complete, typed
// ScenarioDecisionLeverSelections combination using only existing valid option IDs —
// and resolves it through the Phase 13E enrollment/capacity lever bridge plus the
// tuition and org-design levers into a DreEngineInput, then runs calculateDre().
//
// resolveDreEngineInputFromSelections() returns null if any of the four required
// levers (openingGrades, occupancyEnrollment, tuition, orgDesignStructure) is
// unselected — no synthesized defaults, no PnL-workbook fallback.
//
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No Tier. No UI.
//
// Phase 13G (2026-06-09): WORKING_SCENARIO_RATIFICATION_STATUS = "technical_validation_fixture".
// WORKING_SCENARIO_SELECTIONS is a technical validation fixture only — see
// dreWorkingScenarioContract.ts for the ratification-status distinction and
// inputReadinessRegistry.ts entry "dre_working_scenario_selection" for the exact
// ratification input required from Finance/the board before this status can change.

import {
  EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS,
  type ScenarioDecisionLeverSelections,
} from "./scenarioDecisionLeverContract";
import { resolveEnrollmentCapacityLeverInput } from "./dreEnrollmentCapacityLever";
import type { DreEngineInput } from "./dreEngineContract";
import { calculateDre } from "./dreEngine";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";
import type {
  DreScenarioSelectionRatificationStatus,
  DreWorkingScenarioAnnualSummary,
} from "./dreWorkingScenarioContract";

// Technical validity (Phase 13F, DRE_WORKING_SCENARIO_VALIDATION_REPORT allPass=true)
// is NOT formal ratification. This remains "technical_validation_fixture" until
// Finance/the board explicitly ratifies a scenario selection (Phase 13G).
export const WORKING_SCENARIO_RATIFICATION_STATUS: DreScenarioSelectionRatificationStatus =
  "technical_validation_fixture";

// One complete, typed decision-lever combination using only existing valid option IDs.
// Same combination as VALIDATION_INPUT in dreEngineValidation.ts (Phase 13A).
// RATIFICATION STATUS: technical_validation_fixture (Phase 13G) — NOT board-ratified.
export const WORKING_SCENARIO_SELECTIONS: ScenarioDecisionLeverSelections = {
  ...EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS,
  openingGrades: {
    ...EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS.openingGrades,
    selectedOptionId: "t1_g3",
    selectionStatus: "needs_mapping",
  },
  occupancyEnrollment: {
    ...EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS.occupancyEnrollment,
    selectedOptionId: "intermediario",
    selectionStatus: "needs_mapping",
  },
  tuition: {
    ...EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS.tuition,
    selectedOptionId: "bp1_division_differentiated",
    selectionStatus: "needs_mapping",
  },
  orgDesignStructure: {
    ...EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS.orgDesignStructure,
    selectedOptionId: "balanced_experience",
    selectionStatus: "needs_mapping",
  },
};

export function resolveDreEngineInputFromSelections(
  selections: ScenarioDecisionLeverSelections,
): DreEngineInput | null {
  const enrollmentCapacity = resolveEnrollmentCapacityLeverInput(selections);
  const tuitionScenarioId = selections.tuition.selectedOptionId;
  const orgDesignOptionId = selections.orgDesignStructure.selectedOptionId;

  if (enrollmentCapacity === null || tuitionScenarioId === null || orgDesignOptionId === null) {
    return null;
  }

  return {
    openingPackageId: enrollmentCapacity.openingPackageId,
    occupancyScenarioId: enrollmentCapacity.occupancyScenarioId,
    tuitionScenarioId,
    orgDesignOptionId,
  };
}

export const WORKING_SCENARIO_DRE_ENGINE_INPUT: DreEngineInput | null =
  resolveDreEngineInputFromSelections(WORKING_SCENARIO_SELECTIONS);

export const WORKING_SCENARIO_DRE_OUTPUT =
  WORKING_SCENARIO_DRE_ENGINE_INPUT !== null
    ? calculateDre(WORKING_SCENARIO_DRE_ENGINE_INPUT)
    : null;

export function summarizeWorkingScenarioAnnualOutputs(): readonly DreWorkingScenarioAnnualSummary[] {
  if (WORKING_SCENARIO_DRE_OUTPUT === null) {
    return [];
  }
  const output = WORKING_SCENARIO_DRE_OUTPUT;
  return RECEITA_PROJECTION_YEARS.map((year) => {
    const yr = output.byYear[year];
    return {
      year,
      numero_de_alunos: yr.numero_de_alunos,
      receitas_com_ensino_regular: yr.receitas_com_ensino_regular,
      receita_operacional_liquida: yr.receita_operacional_liquida,
      margem_de_contribuicao: yr.margem_de_contribuicao,
      ebitda: yr.ebitda,
      percentual_ebitda: yr.percentual_ebitda,
    } satisfies DreWorkingScenarioAnnualSummary;
  });
}
