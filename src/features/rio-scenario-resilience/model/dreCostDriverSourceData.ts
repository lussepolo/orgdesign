// DRE cost-driver source data — Phase 12L (2026-06-09).
//
// custo_material_digital_fator: PnL row 15 (C15:V15), constant 0.28107722418571557
// for all 20 projection years 2028–2047. Back-derived from PnL benchmark column
// Z15 = −Y237/Y232.
//
// Consuming formula: Custo do Material Digital = −Fator × Receita com Material Didático.
// Sign: stored as POSITIVE factor; the consuming formula applies the negative.
// dreLineId: "custo_de_material_digital" (canonical from dreLineItemMap.ts — note "de",
// not "do" which appears in the source JSON audit file as a non-canonical variant).
//
// Canonical JSON source: dre_cost_driver_and_revenue_adapter_audit_after_12k.json
// No DRE engine. No EBITDA engine. No calculation. No UI.

import type { DreCostDriverSourceDataContract } from "./dreCostDriverSourceDataContract";

export const DRE_COST_DRIVER_SOURCE_DATA: DreCostDriverSourceDataContract = {
  phase: "12L",
  extractedAt: "2026-06-09",
  records: [
    {
      driverId: "custo_material_digital_fator",
      displayLabelPt: "Custo Material Digital (Fator)",
      sourceSheet: "PnL",
      sourceRow: 15,
      sourceRange: "C15:V15",
      classification: "pnl_back_derived_rate",
      usedByDreLineIds: ["custo_de_material_digital"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 0.28107722418571557,
        2029: 0.28107722418571557,
        2030: 0.28107722418571557,
        2031: 0.28107722418571557,
        2032: 0.28107722418571557,
        2033: 0.28107722418571557,
        2034: 0.28107722418571557,
        2035: 0.28107722418571557,
        2036: 0.28107722418571557,
        2037: 0.28107722418571557,
        2038: 0.28107722418571557,
        2039: 0.28107722418571557,
        2040: 0.28107722418571557,
        2041: 0.28107722418571557,
        2042: 0.28107722418571557,
        2043: 0.28107722418571557,
        2044: 0.28107722418571557,
        2045: 0.28107722418571557,
        2046: 0.28107722418571557,
        2047: 0.28107722418571557,
      },
      preOpsValue: 0.28107722418571557,
      formulaPattern:
        "C15:V15 carry forward the row-15 Custo Material Digital (Fator); " +
        "row Z15 is back-derived as −Y237/Y232 in the PnL benchmark column. " +
        "Consuming formula: Custo do Material Digital = −Fator × Receita com Material Didático.",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      notes: [
        "Extracted from the uploaded Finance workbook PnL sheet — canonical source: " +
          "dre_cost_driver_and_revenue_adapter_audit_after_12k.json.",
        "Needed before EBITDA: row 237 Custo do Material Digital feeds " +
          "Custo da Mercadoria Vendida and therefore Margem de Contribuição.",
        "Do not treat as a Service Contracts row or as an independent static OPEX assumption.",
        "dreLineId is 'custo_de_material_digital' (dreLineItemMap.ts canonical id — " +
          "note 'de', not 'do', which appears only in the JSON audit file as a variant).",
      ],
    },
  ],
} satisfies DreCostDriverSourceDataContract;
