// DRE annual assumption source-DATA types.
// Phase 12D (2026-06-08): types for the typed source-data artifact populated
// directly from Luciana's canonical structured JSON extraction
// (source/dre_annual_assumption_source_extraction.json) — the 31 DRE rows
// (27 independent_finance_assumption + 4 below_ebitda_assumption) identified
// in Phase 12B.1/12C as requiring Finance-provided annual values for 2028-2047.
//
// Types only. This file does not compute, derive, or transform any value —
// dreAnnualAssumptionSourceData.ts is the populated artifact; this file only
// shapes it.
//
// No DRE engine. No EBITDA engine. No cash-flow bridge. No DCF. No NPV. No
// payback. No Tier. No UI.

import type { SimulatorProjectionYear } from "./simulatorProjectionHorizonContract";
import type { DreSection } from "./dreLineItemMapContract";

// The two classifications carried forward from dreLineItemMap.ts that this
// source-data artifact populates — every record in scope is one or the other.
export type DreAnnualAssumptionSourceDataClassification =
  | "independent_finance_assumption"
  | "below_ebitda_assumption";

// Literal union mirroring the `serviceContractsOverlapStatus` values present in
// the canonical JSON extraction (and dre_service_contracts_overlap_map.csv).
// This is a RECORDED finding from the extraction/reconciliation audits — it
// does not itself decide a treatment (see dreServiceContractsReconciliation.ts
// for the recommended-treatment layer).
export type DreAnnualAssumptionServiceContractsOverlapStatus =
  | "no_overlap"
  | "exact_service_contract_overlap"
  | "exact_or_label_variant_service_contract_overlap"
  | "near_service_contract_overlap"
  | "label_mismatch_from_prompt_sinistro"
  | "label_mismatch_from_prompt_ir_csll";

export type DreAnnualAssumptionSourceWorkbookName =
  "Concept Rio - 20 anos - Org BU - Apresentação vCR v7 (2).xlsx";

export type DreAnnualAssumptionSourceSheetName = "PnL";

// Exactly one numeric value per simulator projection year, 2028-2047 (20 keys).
// Values are preserved exactly as extracted — no rounding, scaling, or sign
// conversion. A future engine, not this file, decides how to apply
// valueSignConvention-style boundary conversions.
export type DreAnnualAssumptionAnnualValuesByYear = Readonly<
  Record<SimulatorProjectionYear, number>
>;

export interface DreAnnualAssumptionSourceDataRecord {
  // Matches the dreLineId recorded in the canonical extraction
  // (dre_annual_assumption_source_extraction.json) exactly — this is the join
  // key for this source-data artifact's own 31 records.
  //
  // For 5 of the 31 rows, this differs from the dreLineId recorded in
  // dreLineItemMap.ts DRE_LINE_ITEM_MAP (Phase 12B.1) — see
  // dreLineItemMapDreLineId immediately below, and
  // DRE_ANNUAL_ASSUMPTION_LABEL_CORRECTIONS for the 2 of those 5 that are
  // explicit workbook-label corrections (not mere id-formatting variants).
  dreLineId: string;
  // Present ONLY when it differs from dreLineId above — the corresponding
  // row's dreLineId in dreLineItemMap.ts DRE_LINE_ITEM_MAP, preserved so a
  // future engine can join this source-data record to its existing line-map
  // classification record despite the naming difference. Omitted for the 26
  // of 31 rows whose dreLineId is character-for-character identical in both
  // artifacts.
  dreLineItemMapDreLineId?: string;
  // The label as recorded in the canonical extraction (sourced from the
  // Finance workbook PnL sheet cell at rowIndex). For the 2 label-correction
  // rows, this IS the corrected workbook label (e.g. "Despesas com Isenção",
  // "IRCS Direto") — see DRE_ANNUAL_ASSUMPTION_LABEL_CORRECTIONS for what the
  // prior dreLineItemMap.ts displayLabelPt said instead.
  displayLabelPt: string;
  // The label as recorded by the extraction's own `requestedLabelPt` field —
  // present for all 31 records in the canonical extraction (identical to
  // displayLabelPt for every record there; carried through verbatim rather
  // than re-derived).
  requestedLabelPt?: string;
  // Present ONLY when the literal Finance workbook cell text differs from
  // displayLabelPt above. The canonical extraction does not separately record
  // a distinct raw-cell-text value for any of the 31 rows (displayLabelPt IS
  // the workbook-derived label in that extraction) — so this field is omitted
  // for every record in this artifact. It exists in the type only so a future
  // extraction that DOES distinguish a raw cell string from a normalized
  // display label has somewhere typed to record it, without inventing a value
  // here.
  workbookLabelPt?: string;
  sourceWorkbook: DreAnnualAssumptionSourceWorkbookName;
  sourceSheet: DreAnnualAssumptionSourceSheetName;
  rowIndex: number;
  classification: DreAnnualAssumptionSourceDataClassification;
  section: DreSection;
  // Pre-Ops value, extracted from workbook column B — REFERENCE ONLY.
  // Not one of the 20 projection-year annual values; must never be summed
  // into the 620-value count, fed into EBITDA, or otherwise treated as a
  // 2028-2047 projection year. Preserved here purely so a future cash-flow /
  // setup-period reference does not need to re-extract it.
  //
  // null for exactly one record (depreciacao_amortizacao) — the canonical
  // extraction recorded no Pre-Ops column value (and no Pre-Ops formula) for
  // that row. This is preserved as `null` rather than invented as `0` or
  // omitted, so the absence itself stays visible and traceable to the source.
  preOpsValue: number | null;
  preOpsFormula?: string;
  // Exactly 20 entries, one per SIMULATOR_PROJECTION_YEARS member (2028-2047).
  annualValuesByYear: DreAnnualAssumptionAnnualValuesByYear;
  // Present only when the canonical extraction recorded a formula string for
  // that year (sparse — most records have at most one of these three).
  formula2028?: string;
  formula2038?: string;
  formula2047?: string;
  serviceContractsOverlapStatus: DreAnnualAssumptionServiceContractsOverlapStatus;
  notes?: string;
}

export type DreAnnualAssumptionLabelCorrectionId =
  | "despesas_com_sinistro_to_despesas_com_isencao"
  | "ir_csll_to_ircs_direto";

// Explicit record of a workbook-label correction: the label/dreLineId
// dreLineItemMap.ts (Phase 12B.1) recorded based on the Phase 12B prompt's
// language, versus the label/dreLineId the Finance workbook PnL sheet
// actually uses at that row, per Luciana's Phase 12D structured extraction.
// These are NOT id-formatting variants (accent, punctuation, plural/singular)
// — the underlying words differ, so dreLineItemMap.ts's prior classification
// notes and any reconciliation prose written against the old label must be
// read as referring to this corrected row.
export interface DreAnnualAssumptionLabelCorrectionRecord {
  correctionId: DreAnnualAssumptionLabelCorrectionId;
  priorDreLineItemMapDreLineId: string;
  priorDisplayLabelPt: string;
  correctedExtractionDreLineId: string;
  correctedWorkbookLabelPt: string;
  notes: string;
}

export interface DreAnnualAssumptionSourceDataContract {
  sourceStatus: "structured_source_populated_from_canonical_json_extraction";
  sourceFile: string;
  sourceWorkbook: DreAnnualAssumptionSourceWorkbookName;
  sourceSheet: DreAnnualAssumptionSourceSheetName;
  projectionYears: readonly SimulatorProjectionYear[];
  recordCount: 31;
  independentFinanceAssumptionRecordCount: 27;
  belowEbitdaAssumptionRecordCount: 4;
  // recordCount × 20 years.
  totalAnnualValueCount: 620;
  records: readonly DreAnnualAssumptionSourceDataRecord[];
  labelCorrections: readonly DreAnnualAssumptionLabelCorrectionRecord[];
  // Distinct from labelCorrections — documents that "IR / CSLL - (Rec.)/Desp."
  // (dreLineItemMap.ts dreLineId 'ir_csll_rec_desp', classification
  // formula_derived) is a formula-derived subtotal combining the
  // 'ircs_direto' assumption row with 'recuperacao_de_prejuizos', and is
  // therefore NOT itself a source assumption row this artifact populates.
  formulaSubtotalDistinctionNotes: readonly string[];
  notes: string;
}
