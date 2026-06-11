// Phase 14A (2026-06-09): DRE Scenario Simulator state and model-integration hook.
// Phase 14A.1 (2026-06-10): Deterministic scenario calculation orchestration.
//
// Holds the four decision-lever selections (openingPackageId, occupancyScenarioId,
// tuitionScenarioId, orgDesignOptionId) and runs calculateDre() through the existing
// typed model pathway (dreEngine.ts) on every change. No formulas, costs, or
// org-design data are redefined here — this hook only selects existing valid option
// IDs and passes them through.
//
// Default selections mirror the Phase 13F working scenario (technical validation
// fixture, NOT board-ratified — see dreWorkingScenarioContract.ts
// WORKING_SCENARIO_RATIFICATION_STATUS).
//
// CALCULATION_CAN_BEGIN remains false (inputReadinessRegistry.ts).
// No cash-flow bridge. No CAPEX bridge. No DCF. No NPV. No payback. No Tier.
//
// ── Orchestration invariant (Phase 14A.1) ───────────────────────────────────────
// FOPAG is a legitimate upstream dependency of DRE: calculateDre() calls
// calculateFopag() internally with the same {openingPackageId, occupancyScenarioId,
// orgDesignOptionId} and folds the result into fopag_direto_clt_pj,
// folha_de_pagamento, and beneficios on every DreYearResult. UI components must
// consume dreOutput (the unified scenario result) for all DRE/payroll display —
// they must not call calculateDre() or calculateFopag() directly.
//
// calculateFopag() is called a second time, here only, to obtain the engine's raw
// (pre-DRE-sign-convention) FOPAG record/diagnostic trace for the Org Design panel
// (e.g. incremental-role payroll detail not present on DreYearResult). This second
// call is a reconciled trace, not a parallel source of truth: payrollReconciliation
// below verifies, for every projection year, that this fopagOutput's yearTotals
// agree with the DRE payroll rows produced by calculateDre()'s internal FOPAG call.
// If reconciliation ever fails, the UI must surface an error and withhold the
// FOPAG/payroll display rather than show conflicting values.

import { useMemo, useState } from "react";
import { calculateDre } from "../features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../features/rio-scenario-resilience/model/fopagEngine";
import {
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
} from "../features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import {
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
} from "../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { WORKING_SCENARIO_SELECTIONS } from "../features/rio-scenario-resilience/model/dreWorkingScenario";
import { RECEITA_PROJECTION_YEARS } from "../features/rio-scenario-resilience/model/receitaEngineContract";
import type {
  OpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageProjectionYear,
} from "../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../features/rio-scenario-resilience/model/revenueInputs";
import type { DreWorkingScenarioOrgDesignOptionId } from "../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { DreEngineOutput } from "../features/rio-scenario-resilience/model/dreEngineContract";
import type { FopagEngineOutput } from "../features/rio-scenario-resilience/model/fopagEngineContract";

export interface DreScenarioSimulatorSelections {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  tuitionScenarioId: TuitionScenarioId;
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
}

export interface OrgDesignSensitivityRow {
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  isSelected: boolean;
  numeroDeAlunos2047: number;
  receitaOperacionalLiquida2047: number;
  ebitda2047: number;
  percentualEbitda2047: number | null;
  payrollTotal2047: number;
  ebitdaPositiveYear: OpeningPackageProjectionYear | null;
}

// Phase 14A.1: reconciliation between the standalone calculateFopag() trace
// (fopagOutput) and the FOPAG-derived payroll rows already folded into
// dreOutput.byYear by calculateDre()'s internal calculateFopag() call.
export type PayrollReconciliationField = "fopag_direto_clt_pj" | "folha_de_pagamento" | "beneficios";

export interface PayrollReconciliationMismatch {
  year: OpeningPackageProjectionYear;
  field: PayrollReconciliationField;
  dreValue: number;
  fopagValue: number;
}

export interface PayrollReconciliationResult {
  isReconciled: boolean;
  mismatches: readonly PayrollReconciliationMismatch[];
}

const RECONCILIATION_TOLERANCE = 1e-6;

function reconcilePayroll(
  dreOutput: DreEngineOutput,
  fopagOutput: FopagEngineOutput,
): PayrollReconciliationResult {
  const fopagByYear = new Map(fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
  const mismatches: PayrollReconciliationMismatch[] = [];

  for (const year of RECEITA_PROJECTION_YEARS) {
    const dreRow = dreOutput.byYear[year];
    const fopagYt = fopagByYear.get(year);

    // FOPAG yearTotals values are always-positive; DRE rows negate them once
    // (see dreEngine.ts sign-convention header comment).
    const expected: Record<PayrollReconciliationField, number> = {
      fopag_direto_clt_pj: -(fopagYt?.fopagDireto ?? 0),
      folha_de_pagamento: -(fopagYt?.folhaDireta ?? 0),
      beneficios: -(fopagYt?.benefits ?? 0),
    };

    for (const field of Object.keys(expected) as PayrollReconciliationField[]) {
      const dreValue = dreRow[field];
      const fopagValue = expected[field];
      if (Math.abs(dreValue - fopagValue) > RECONCILIATION_TOLERANCE) {
        mismatches.push({ year, field, dreValue, fopagValue });
      }
    }
  }

  return { isReconciled: mismatches.length === 0, mismatches };
}

const LAST_PROJECTION_YEAR = RECEITA_PROJECTION_YEARS[RECEITA_PROJECTION_YEARS.length - 1];

// Phase 13F working scenario — technical validation fixture only, not board-ratified.
const DEFAULT_SELECTIONS: DreScenarioSimulatorSelections = {
  openingPackageId: WORKING_SCENARIO_SELECTIONS.openingGrades.selectedOptionId as OpeningPackageId,
  occupancyScenarioId:
    WORKING_SCENARIO_SELECTIONS.occupancyEnrollment.selectedOptionId as OccupancyScenarioId,
  tuitionScenarioId: WORKING_SCENARIO_SELECTIONS.tuition.selectedOptionId as TuitionScenarioId,
  orgDesignOptionId:
    WORKING_SCENARIO_SELECTIONS.orgDesignStructure.selectedOptionId as DreWorkingScenarioOrgDesignOptionId,
};

export {
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  LAST_PROJECTION_YEAR,
};

export function useDreScenarioSimulator() {
  const [selections, setSelections] = useState<DreScenarioSimulatorSelections>(DEFAULT_SELECTIONS);

  const dreOutput: DreEngineOutput = useMemo(
    () => calculateDre(selections),
    [selections],
  );

  // Reconciled trace only (see header comment) — not an independent source of truth.
  const fopagOutput: FopagEngineOutput = useMemo(
    () =>
      calculateFopag({
        openingPackageId: selections.openingPackageId,
        occupancyScenarioId: selections.occupancyScenarioId,
        orgDesignOptionId: selections.orgDesignOptionId,
      }),
    [selections],
  );

  const payrollReconciliation: PayrollReconciliationResult = useMemo(
    () => reconcilePayroll(dreOutput, fopagOutput),
    [dreOutput, fopagOutput],
  );

  // Org Design Sensitivity: 2047 EBITDA for each org-design option, holding the
  // opening, occupancy, and tuition levers fixed at their currently selected values.
  const orgDesignSensitivity: readonly OrgDesignSensitivityRow[] = useMemo(
    () =>
      DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((orgDesignOptionId) => {
        const output =
          orgDesignOptionId === selections.orgDesignOptionId
            ? dreOutput
            : calculateDre({
                openingPackageId: selections.openingPackageId,
                occupancyScenarioId: selections.occupancyScenarioId,
                tuitionScenarioId: selections.tuitionScenarioId,
                orgDesignOptionId,
              });
        const lastYearResult = output.byYear[LAST_PROJECTION_YEAR];
        const ebitdaPositiveYear =
          RECEITA_PROJECTION_YEARS.find((y) => output.byYear[y].ebitda > 0) ?? null;
        return {
          orgDesignOptionId,
          isSelected: orgDesignOptionId === selections.orgDesignOptionId,
          numeroDeAlunos2047: lastYearResult.numero_de_alunos,
          receitaOperacionalLiquida2047: lastYearResult.receita_operacional_liquida,
          ebitda2047: lastYearResult.ebitda,
          percentualEbitda2047: lastYearResult.percentual_ebitda,
          payrollTotal2047:
            -(
              lastYearResult.fopag_direto_clt_pj +
              lastYearResult.folha_de_pagamento +
              lastYearResult.beneficios
            ),
          ebitdaPositiveYear,
        };
      }),
    [selections, dreOutput],
  );

  return {
    selections,
    setSelections,
    dreOutput,
    fopagOutput,
    payrollReconciliation,
    orgDesignSensitivity,
    defaultSelections: DEFAULT_SELECTIONS,
  };
}
