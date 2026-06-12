// Phase 15C-DCF-VPL-TIR-PERPETUITY — canonical WACC / perpetuity driver source contract.
//
// Single source of truth for the WACC and perpetuity-growth driver values
// ratified in phase15CapitalDecisionArchitecture.md S16.5, sourced from the
// drivers section at the top of the visible `PnL` sheet (PnL!B6, PnL!C6:V6,
// PnL!Z278, PnL!Z279). Per S16.5 D10, these must not be hardcoded
// independently in multiple engines -- the DCF and terminal-value engines
// receive these values only via this contract (directly or as inputs sourced
// from it).

export interface CapitalDecisionDriverSourceProvenance {
  readonly workbookFile: string;
  readonly visibleWorkbookSheet: "PnL";
  // PnL!B6 (pre-ops/2027 WACC).
  readonly preOpsWaccCell: "B6";
  // PnL!C6:V6 (2028-2047 WACC, constant 12%).
  readonly operatingPeriodWaccCellRange: "C6:V6";
  // PnL!Z278 (perpetuity WACC = final projection-year WACC, "=V6").
  readonly perpetuityWaccCell: "Z278";
  // PnL!Z279 (perpetuity growth rate, literal 0.035).
  readonly perpetuityGrowthCell: "Z279";
  readonly ratifiedMethodologyDoc: string;
  readonly ratifiedSections: readonly string[];
}

export interface CapitalDecisionDriverSource {
  // PnL!B6 = 0.1325. Applies to the pre_ops period only (DCF period index 1).
  readonly preOpsWaccRate: number;
  // PnL!C6:V6 = 0.12 (constant 2028-2047). Applies to all 2028-2047 DCF
  // periods (period indices 2-21) and is also the perpetuity WACC
  // (PnL!Z278 = V6).
  readonly operatingPeriodWaccRate: number;
  // PnL!Z279 = 0.035.
  readonly perpetuityGrowthRate: number;
  readonly provenance: CapitalDecisionDriverSourceProvenance;
}
