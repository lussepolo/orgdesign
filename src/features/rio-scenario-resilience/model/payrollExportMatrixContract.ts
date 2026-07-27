// V10-X1 (2026-07-27): G4/G6 Balanced and Lean payroll export matrix — canonical
// scenario contract. Single source of truth for the twelve governed payroll
// export combinations. Consumed by batch generation, individual generation, the
// UI export surface, the validator, the manifest, and ZIP packaging.
//
// Governed user-facing semantics (do not alter without a governance decision):
// - "Folha Balanced" = the existing governed Balanced Org Design scenario
//   (orgDesignOptionId = "balanced_experience"). No independent model.
// - "Folha Lean" = the existing governed Minimum Org Design scenario
//   (orgDesignOptionId = "minimum_experience"), display label only. No
//   independent "Lean" Org Design model exists anywhere in the app.
// - "Ocupação Conservadora/Base/Otimista" are occupancy scenarios only
//   (occupancyScenarioId = "conservador" | "base" | "otimista"). "pessimista"
//   is a retired scenario id and must never appear in this matrix — see
//   assertOccupancyScenarioId() in openingPackageOccupancySourceDataContract.ts,
//   which throws on "pessimista".
import type { ActiveOpeningPackageId } from "./openingPackageOccupancySourceDataContract";
import type { OccupancyScenarioId } from "./openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "./revenueInputs";

export type PayrollExportOrgDesignOptionId = "balanced_experience" | "minimum_experience";

export const PAYROLL_EXPORT_HORIZON_START_YEAR = 2028;
export const PAYROLL_EXPORT_HORIZON_END_YEAR = 2047;
export const PAYROLL_EXPORT_HORIZON_YEARS: readonly number[] = Array.from(
  { length: PAYROLL_EXPORT_HORIZON_END_YEAR - PAYROLL_EXPORT_HORIZON_START_YEAR + 1 },
  (_, i) => PAYROLL_EXPORT_HORIZON_START_YEAR + i,
);

// Fixed levers held identical across all twelve exports (spec section 7).
// Payroll calculation (calculateFopag) takes only openingPackageId,
// occupancyScenarioId, orgDesignOptionId — tuitionScenarioId is DRE/Receita
// metadata only and does not affect payroll figures. It is still recorded
// identically in every Scenario Summary / Source and Formula Governance sheet
// for traceability. Sourced from the ratified working-scenario default
// (dreWorkingScenario.ts WORKING_SCENARIO_SELECTIONS.tuition.selectedOptionId).
export const PAYROLL_EXPORT_FIXED_LEVERS: {
  readonly tuitionScenarioId: TuitionScenarioId;
} = {
  tuitionScenarioId: "bp1_division_differentiated",
};

export const PAYROLL_EXPORT_OPENING_PACKAGE_LABELS: Record<ActiveOpeningPackageId, string> = {
  t1_g4: "Início G4",
  t1_g6: "Início G6",
};

export const PAYROLL_EXPORT_ORG_DESIGN_LABELS: Record<PayrollExportOrgDesignOptionId, string> = {
  balanced_experience: "Folha Balanced",
  minimum_experience: "Folha Lean",
};

export const PAYROLL_EXPORT_OCCUPANCY_LABELS: Record<OccupancyScenarioId, string> = {
  conservador: "Ocupação Conservadora",
  base: "Ocupação Base",
  otimista: "Ocupação Otimista",
};

const OPENING_PACKAGE_FILENAME_TOKEN: Record<ActiveOpeningPackageId, string> = {
  t1_g4: "G4",
  t1_g6: "G6",
};

const ORG_DESIGN_FILENAME_TOKEN: Record<PayrollExportOrgDesignOptionId, string> = {
  balanced_experience: "Balanced",
  minimum_experience: "Lean",
};

const OCCUPANCY_FILENAME_TOKEN: Record<OccupancyScenarioId, string> = {
  conservador: "Conservadora",
  base: "Base",
  otimista: "Otimista",
};

export interface PayrollExportMatrixRecord {
  readonly matrixScenarioId: string;
  readonly displayLabel: string;
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly openingPackageLabel: string;
  readonly orgDesignOptionId: PayrollExportOrgDesignOptionId;
  readonly payrollLabel: string;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly occupancyLabel: string;
  readonly filename: string;
  readonly workbookTitle: string;
  readonly horizonStartYear: number;
  readonly horizonEndYear: number;
  readonly fixedLevers: typeof PAYROLL_EXPORT_FIXED_LEVERS;
}

const OPENING_PACKAGES: readonly ActiveOpeningPackageId[] = ["t1_g4", "t1_g6"];
const ORG_DESIGN_OPTIONS: readonly PayrollExportOrgDesignOptionId[] = [
  "balanced_experience",
  "minimum_experience",
];
const OCCUPANCY_SCENARIOS: readonly OccupancyScenarioId[] = ["conservador", "base", "otimista"];

function buildMatrixRecord(
  openingPackageId: ActiveOpeningPackageId,
  orgDesignOptionId: PayrollExportOrgDesignOptionId,
  occupancyScenarioId: OccupancyScenarioId,
): PayrollExportMatrixRecord {
  const openingPackageLabel = PAYROLL_EXPORT_OPENING_PACKAGE_LABELS[openingPackageId];
  const payrollLabel = PAYROLL_EXPORT_ORG_DESIGN_LABELS[orgDesignOptionId];
  const occupancyLabel = PAYROLL_EXPORT_OCCUPANCY_LABELS[occupancyScenarioId];
  const matrixScenarioId = `${openingPackageId}__${orgDesignOptionId}__${occupancyScenarioId}`;
  const filename =
    `Rio_${OPENING_PACKAGE_FILENAME_TOKEN[openingPackageId]}_Folha_` +
    `${ORG_DESIGN_FILENAME_TOKEN[orgDesignOptionId]}_Ocupacao_` +
    `${OCCUPANCY_FILENAME_TOKEN[occupancyScenarioId]}.xlsx`;
  const displayLabel = `${openingPackageLabel} – ${payrollLabel} – ${occupancyLabel}`;

  return {
    matrixScenarioId,
    displayLabel,
    openingPackageId,
    openingPackageLabel,
    orgDesignOptionId,
    payrollLabel,
    occupancyScenarioId,
    occupancyLabel,
    filename,
    workbookTitle: `Rio Strategic Org Design — ${displayLabel}`,
    horizonStartYear: PAYROLL_EXPORT_HORIZON_START_YEAR,
    horizonEndYear: PAYROLL_EXPORT_HORIZON_END_YEAR,
    fixedLevers: PAYROLL_EXPORT_FIXED_LEVERS,
  };
}

// Twelve governed combinations (spec section 1): 2 opening packages ×
// 2 Org Design scenarios × 3 occupancy scenarios. Order matches spec section 1
// and section 9 (filenames enumerated 1-12).
export const PAYROLL_EXPORT_MATRIX: readonly PayrollExportMatrixRecord[] = OPENING_PACKAGES.flatMap(
  (openingPackageId) =>
    ORG_DESIGN_OPTIONS.flatMap((orgDesignOptionId) =>
      OCCUPANCY_SCENARIOS.map((occupancyScenarioId) =>
        buildMatrixRecord(openingPackageId, orgDesignOptionId, occupancyScenarioId),
      ),
    ),
);

export const PAYROLL_EXPORT_ZIP_FILENAME = "Rio_Matriz_Folha_G4_G6_Balanced_Lean.zip";
export const PAYROLL_EXPORT_MANIFEST_FILENAME = "scenario-manifest.json";
export const PAYROLL_EXPORT_SUMMARY_WORKBOOK_FILENAME = "Rio_Matriz_Folha_Resumo.xlsx";

export function getPayrollExportMatrixRecordById(
  matrixScenarioId: string,
): PayrollExportMatrixRecord | undefined {
  return PAYROLL_EXPORT_MATRIX.find((r) => r.matrixScenarioId === matrixScenarioId);
}
