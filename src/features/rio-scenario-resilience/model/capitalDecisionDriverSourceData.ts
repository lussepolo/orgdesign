// Phase 15C-DCF-VPL-TIR-PERPETUITY — canonical WACC / perpetuity driver source data.
//
// Ratified values (phase15CapitalDecisionArchitecture.md S16.5), read-only
// from the visible `PnL` sheet's drivers section (row 6) and perpetuity
// block (Y277:Z283). See capitalDecisionDriverSourceContract.ts for the
// single-source-of-truth rule: discountedCashFlowEngine.ts and
// terminalValueEngine.ts must receive these values as inputs (directly or
// transitively from this module), not as independently hardcoded literals.

import type { CapitalDecisionDriverSource } from "./capitalDecisionDriverSourceContract";

const SOURCE_WORKBOOK_FILE = "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx";
const RATIFIED_METHODOLOGY_DOC =
  "src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md";

export const CAPITAL_DECISION_DRIVER_SOURCE: CapitalDecisionDriverSource = {
  // PnL!B6.
  preOpsWaccRate: 0.1325,
  // PnL!C6:V6 (constant across 2028-2047); also PnL!Z278 (= V6, perpetuity WACC).
  operatingPeriodWaccRate: 0.12,
  // PnL!Z279.
  perpetuityGrowthRate: 0.035,
  provenance: {
    workbookFile: SOURCE_WORKBOOK_FILE,
    visibleWorkbookSheet: "PnL",
    preOpsWaccCell: "B6",
    operatingPeriodWaccCellRange: "C6:V6",
    perpetuityWaccCell: "Z278",
    perpetuityGrowthCell: "Z279",
    ratifiedMethodologyDoc: RATIFIED_METHODOLOGY_DOC,
    ratifiedSections: ["S16.5"],
  },
};
