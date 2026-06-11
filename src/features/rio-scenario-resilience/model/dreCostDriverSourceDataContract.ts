// DRE cost-driver source-data contract types — Phase 12L (2026-06-09).
//
// Typed source-data artifact for DRE cost-side drivers that are NOT
// independent_finance_assumption rows (dreAnnualAssumptionSourceData.ts) and
// NOT revenue-block drivers (dreRevenueDriverSourceData.ts).
//
// Phase 12L: custo_material_digital_fator — PnL row 15, carry-forward constant
// 0.28107722418571557 for 2028–2047, back-derived from Z15 = −Y237/Y232.
// Formula: Custo do Material Digital = −Fator × Receita com Material Didático.
// Sign: stored as positive factor; negative applied in consuming formula.
//
// No DRE engine. No EBITDA engine. No calculation. No UI.

export type DreCostDriverId = "custo_material_digital_fator";

export type DreCostDriverClassification =
  // Rate back-derived from historical PnL data (e.g., Z15 = −Y237/Y232)
  | "pnl_back_derived_rate"
  // Direct spreadsheet value read from PnL row
  | "pnl_spreadsheet_direct_value";

export type DreCostDriverValueSourceStatus =
  // Annual values extracted from PnL spreadsheet; annualValuesByYear is populated
  | "extracted_from_pnl_spreadsheet"
  // Formula structure confirmed; annual values still require Finance confirmation
  | "not_available_pending_finance_source";

export interface DreCostDriverSourceRecord {
  driverId: DreCostDriverId;
  displayLabelPt: string;
  sourceSheet: "PnL";
  sourceRow: number;
  // Specific workbook cell range that supplies the values
  sourceRange?: string;
  classification: DreCostDriverClassification;
  // dreLineIds from DRE_LINE_ITEM_MAP that this driver feeds
  usedByDreLineIds: readonly string[];
  projectionYears: "2028-2047";
  // Annual values extracted from PnL for 2028–2047.
  // Positive factor; the consuming formula applies the negative sign.
  annualValuesByYear: Record<number, number>;
  // Pré-Ops / 2027 reference value from PnL, where available
  preOpsValue?: number | null;
  // Verbatim formula pattern from Finance PnL spreadsheet inspection
  formulaPattern: string;
  valueSourceStatus: DreCostDriverValueSourceStatus;
  notes: readonly string[];
}

export interface DreCostDriverSourceDataContract {
  phase: string;
  extractedAt: string;
  records: readonly DreCostDriverSourceRecord[];
}
