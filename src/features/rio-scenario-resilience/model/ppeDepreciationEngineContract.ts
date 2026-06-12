// Phase 15B-FCO-CAPEX-BRIDGE — PP&E depreciation engine contract.
//
// Ports the visible `PPE` sheet methodology (phase15CapitalDecisionArchitecture.md
// S16.3, Resolution 1, 2026-06-12):
//   - Existing / pre-ops asset base: pre-ops Expansion CAPEX, 15-year useful
//     life, zero residual, depreciation begins in 2028 (PPE!F22, 15-year block).
//   - Each projection year's total CAPEX (expansion + sustain) becomes a new
//     10-year vintage with the workbook's half-year convention (PPE rows 23-42).

import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";

export interface PpeDepreciationEngineInput {
  // Positive pre-ops Expansion CAPEX (becomes the existing PP&E base).
  readonly preOpsExpansionCapexPositiveBRL: number;
  // Total CAPEX (expansion + sustain), positive, by projection year
  // 2028-2047. Each year's total becomes a new 10-year vintage.
  readonly totalCapexPositiveByYear: Readonly<Record<number, number>>;
}

export interface PpeDepreciationEngineOutput {
  // <= 0 (PnL!275 sign convention). pre_ops = 0.
  readonly depreciationAmortizationSignedByPeriod: Readonly<
    Record<CapitalDecisionPeriodKey, number>
  >;
}
