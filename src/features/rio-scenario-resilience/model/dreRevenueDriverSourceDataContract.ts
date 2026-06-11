// DRE revenue-block driver source-data contract types — Phase 12K (2026-06-09).
//
// Typed source-data artifacts for the 6 DRE revenue-block drivers:
// percentual_desconto_medio, percentual_deducoes, desconto_metodo,
// adesao_upselling, ticket_medio_upselling, ticket_material.
//
// Phase 12J: typed records created; percentual_desconto_medio values extracted;
// 5 records value-pending.
// Phase 12K: all 5 previously pending annualValuesByYear records populated from
// dre_revenue_driver_values_2028_2047_extracted_from_pnl.json. All 6 records
// now carry exactly 20 annual values (2028–2047), 120 total.
//
// DISCOUNT AUTHORITY: PnL % Desconto Médio (row 222) is the canonical DRE
// revenue-block source for the Bolsa de Estudos discount.
// DISCOUNT_SCHEDULE_SOURCE (receitaEngine.ts averageEffectiveDiscountRate,
// 20%→12.5% ramp) is NOT the DRE revenue-block discount source — it serves
// the scenario-resilience Receita engine and is preserved as audit/legacy.
// receitaEngine.ts netReceitaAfterDiscount remains audit_only (Phase 12I,
// unchanged). No DRE engine. No EBITDA engine. No calculation. No UI.

export type DreRevenueDriverId =
  | "percentual_desconto_medio"
  | "percentual_deducoes"
  | "desconto_metodo"
  | "adesao_upselling"
  | "ticket_medio_upselling"
  | "ticket_material";

export type DreRevenueDriverClassification =
  // Direct spreadsheet value read from PnL row (no formula derivation required)
  | "pnl_spreadsheet_direct_value"
  // Rate back-derived from historical PnL data (e.g., Z12 = -Y235 / Y234)
  | "pnl_back_derived_rate"
  // Finance-supplied benchmark figure (specific value from Finance decision)
  | "pnl_benchmark_derived"
  // Base value from Finance cell, escalated by indexed formula (e.g., × Reajuste)
  | "pnl_formula_indexed_from_base";

export type DreRevenueDriverValueSourceStatus =
  // Annual values extracted from PnL spreadsheet; annualValuesByYear is populated
  | "extracted_from_pnl_spreadsheet"
  // Formula structure confirmed; annual values still require Finance confirmation
  | "not_available_pending_finance_source"
  // Formula structure confirmed; specific Finance base-cell value not yet extracted
  | "formula_structure_confirmed_base_value_pending";

export interface DreRevenueDriverSourceRecord {
  driverId: DreRevenueDriverId;
  displayLabelPt: string;
  sourceSheet: "PnL";
  sourceRow: number;
  // Specific workbook cell range that supplies the base value, where applicable
  sourceRange?: string;
  classification: DreRevenueDriverClassification;
  // dreLineIds from DRE_LINE_ITEM_MAP that this driver feeds
  usedByDreLineIds: readonly string[];
  projectionYears: "2028-2047";
  // Annual values extracted from PnL for 2028–2047.
  // Populated where Finance values are available. Empty record ({}) where pending.
  // Rates expressed as fractions (e.g., -0.12 for -12%); monetary values in BRL.
  annualValuesByYear: Record<number, number>;
  // Pré-Ops / 2027 reference value from PnL, where available
  preOpsValue?: number | null;
  // Verbatim formula pattern from Finance PnL spreadsheet inspection
  formulaPattern: string;
  valueSourceStatus: DreRevenueDriverValueSourceStatus;
  // Always true: every record in this artifact is the canonical DRE source for its
  // driver — not the simulator DISCOUNT_SCHEDULE_SOURCE or any engine aggregate
  canonicalForDreRevenueBlock: true;
  // Discount-authority note for drivers that overlap with DISCOUNT_SCHEDULE_SOURCE
  discountAuthorityNote?: string;
  notes: string;
}

export interface DreRevenueDriverSourceDataContract {
  phase: string;
  extractedAt: string;
  // Formal statement of discount authority for the DRE revenue block
  discountAuthorityResolution: string;
  // Formal statement of netReceitaAfterDiscount's role after Phase 12J
  receitaEngineRoleAfterExtraction: string;
  // Exactly the 6 DRE revenue-block driver IDs covered by this artifact
  driverIds: readonly DreRevenueDriverId[];
  records: readonly DreRevenueDriverSourceRecord[];
  // Finance values that remain outstanding before any DRE engine can be built
  openFinanceValueItems: readonly string[];
}
