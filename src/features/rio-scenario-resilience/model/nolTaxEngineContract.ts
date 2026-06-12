// Phase 15B-FCO-CAPEX-BRIDGE — NOL / tax engine contract.
//
// Ports the visible "Recuperacao de Prejuizos" sheet's chronological,
// stateful tax/NOL recurrence exactly, for workbook parity
// (phase15CapitalDecisionArchitecture.md S16.3, Resolution "Tax/NOL
// caution", 2026-06-12). Labeled `workbook_parity_nol_method`: this is a
// port of the visible workbook's formulas, not an independent
// interpretation of Brazilian tax law.

import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";

export interface NolTaxEngineInput {
  // EBT by period, in chronological order (pre_ops first, then 2028..2047).
  readonly ebtByPeriod: ReadonlyArray<{
    readonly periodKey: CapitalDecisionPeriodKey;
    readonly ebtBRL: number;
  }>;
}

export interface NolTaxPeriodResult {
  readonly periodKey: CapitalDecisionPeriodKey;
  // <= 0. "Recuperacao de Prejuizos" "Imposto Original" (= PnL!279).
  readonly taxDirectBRL: number;
  // >= 0. "Recuperacao de Prejuizos" row 14 "Reducao" (= PnL!280).
  readonly nolRecoveryBRL: number;
  // taxDirectBRL + nolRecoveryBRL (= PnL!281).
  readonly taxTotalBRL: number;
  // <= 0. Accumulated NOL balance after this period
  // ("Recuperacao de Prejuizos" row 5).
  readonly accumulatedNolBRL: number;
}

export interface NolTaxEngineOutput {
  readonly periods: readonly NolTaxPeriodResult[];
}
