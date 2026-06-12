// Phase 15B-FCO-CAPEX-BRIDGE — pre-ops operating result source data contract.
//
// The visible workbook computes a pre-opening (2027) operating result on the
// `PnL` sheet's `B` column, sourced via SUMIFS from the visible `Pre-Ops`
// sheet. This is a fixed literal value: the workbook provides no
// scenario-dependent pre-ops model, so this value does not vary by
// occupancy, tuition, opening package, or org-design scenario selection.

import { PRE_OPS_PERIOD_KEY } from "./simulatorProjectionHorizonContract";

export interface PreOpsOperatingResultSourceRecord {
  readonly periodKey: typeof PRE_OPS_PERIOD_KEY;
  readonly sourceYear: 2027;
  // PnL!B273. Fixed literal, not scenario-derived.
  readonly ebitdaBRL: number;
  // PnL!B275 is blank for the pre-ops column (no PP&E roll-forward yet).
  readonly depreciationAmortizationBRL: 0;
  // PnL!B277 = 0 (Cap1-Cap8 SUMIFS over periods < 2028).
  readonly financialResultBRL: 0;
  readonly sourceWorkbookFile: string;
  readonly sourceSheets: readonly string[];
  readonly sourceFormulaDescription: string;
  readonly provenanceNote: string;
}
