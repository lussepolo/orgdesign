// Phase 13F (2026-06-09): Working Scenario Selection and DRE Scenario-Input Readiness.
//
// CORE PRINCIPLE:
//   Phase 13E confirmed the lever → engine bridge for enrollment/capacity
//   (openingPackageId × occupancyScenarioId). Phase 13F selects ONE complete,
//   typed decision-lever combination — using only existing valid option IDs —
//   and confirms calculateDre() executes end-to-end for it.
//
// This is NOT a claim that this combination is the Finance/board-ratified scenario.
// It is a structural demonstration that the full lever set
// (openingPackageId, occupancyScenarioId, tuitionScenarioId, orgDesignOptionId)
// can flow from a typed ScenarioDecisionLeverSelections object into DreEngineInput
// and produce a coherent 20-year DRE output, without any reference to the PnL
// workbook learner trajectory (PNL_FORMULA_PARITY_SOURCE_DATA, ~257 learners in 2028,
// Phase 13B).
//
// VALID OPTION ID SOURCES (no new IDs invented):
//   openingPackageId    — DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS (dreEnrollmentCapacityLeverContract.ts)
//   occupancyScenarioId — DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS (dreEnrollmentCapacityLeverContract.ts)
//   tuitionScenarioId   — TuitionScenarioId (revenueInputs.ts): bp1_division_differentiated |
//                         bp2_ey_ls_unified | bp3_ey_to_ms_unified | rj4 | rj5
//   orgDesignOptionId   — orgDesignPayrollActivation.ts ALL: minimum_experience |
//                         balanced_experience | premium_experience
//
// SELECTED WORKING SCENARIO (Phase 13F):
//   t1_g3 / intermediario / bp1_division_differentiated / balanced_experience
//   — the same combination already used as VALIDATION_INPUT in dreEngineValidation.ts
//   (Phase 13A, DRE_ENGINE_VALIDATION_REPORT allPass=true, 20/20). Phase 13F formalizes
//   this combination as a typed ScenarioDecisionLeverSelections object and validates
//   the full selections → DreEngineInput → calculateDre() chain.
//
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts) — board confirmation
// of selected_opening_grades_option, occupancy_input, selected_tuition_scenario, and
// selected_org_design_option remains outstanding (separate registry entries).
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No Tier. No UI.
//
// Phase 13G (2026-06-09): RATIFICATION STATUS.
//   Phase 13F established that this combination is TECHNICALLY VALID (calculateDre()
//   executes end-to-end, DRE_WORKING_SCENARIO_VALIDATION_REPORT allPass=true, 7/7).
//   Technical validity is NOT the same as formal ratification by Finance/the board.
//   WORKING_SCENARIO_RATIFICATION_STATUS records this distinction explicitly and is
//   checked by dreWorkingScenarioValidation.ts so future phases cannot silently treat
//   WORKING_SCENARIO_SELECTIONS as a board-approved scenario. To move to "board_ratified",
//   Finance/the board must explicitly select one option for each of: opening grades
//   package, occupancy scenario, tuition scenario, and org-design option (see
//   inputReadinessRegistry.ts entry "dre_working_scenario_selection" for the exact
//   ratification input required).

import type { TuitionScenarioId } from "./revenueInputs";

// Distinguishes a technically-valid scenario combination (engine executes end-to-end,
// no invented IDs) from one explicitly ratified by Finance/the board as the working
// scenario for board-facing outputs. WORKING_SCENARIO_SELECTIONS is, and remains,
// "technical_validation_fixture" until a ratified selection is explicitly provided.
export type DreScenarioSelectionRatificationStatus =
  | "technical_validation_fixture"
  | "board_ratified";

// Org design options (source: orgDesignPayrollActivation.ts ALL constant).
export type DreWorkingScenarioOrgDesignOptionId =
  | "minimum_experience"
  | "balanced_experience"
  | "premium_experience";

export const DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS: readonly DreWorkingScenarioOrgDesignOptionId[] =
  ["minimum_experience", "balanced_experience", "premium_experience"];

// Phase 15Q.1: rj4 and rj5 added — DreLeverPanel.tsx iterates this array to
// populate the tuition dropdown; omitting them excluded them from active DRE selection.
export const DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS: readonly TuitionScenarioId[] = [
  "bp1_division_differentiated",
  "bp2_ey_ls_unified",
  "bp3_ey_to_ms_unified",
  "rj4",
  "rj5",
];

// Annual DRE output summary — the 6 fields requested for Phase 13F reporting.
export interface DreWorkingScenarioAnnualSummary {
  readonly year: number;
  readonly numero_de_alunos: number;
  readonly receitas_com_ensino_regular: number;
  readonly receita_operacional_liquida: number;
  readonly margem_de_contribuicao: number;
  readonly ebitda: number;
  readonly percentual_ebitda: number | null;
}
