// DRE (Demonstrativo de Resultado) line-item map types.
// Phase 12B (2026-06-07): full DRE source-of-truth line map and formula contract.
// Types only. No source data. No calculation logic. No UI.
// No DRE engine. No EBITDA engine. No operating cash-flow bridge. No cashFlowAfterCapex.
// No cumulative cash flow. No DCF. No NPV. No payback. No discounted payback.
// No break-even. No Tier.
//
// Purpose: classify every line of the Finance DRE template (source of truth for
// the full DRE structure, per Luciana's Phase 12B instruction) so that a future
// DRE/EBITDA engine can be implemented without inventing structure, formulas, or
// values.
//
// Important interpretation (Luciana, Phase 12B): accounting for every DRE row
// does NOT mean every row becomes a static annual value. It means every row is
// classified as exactly one of the DreLineClassification values below. Rows
// Luciana/Finance explicitly highlighted as having independent annual values are
// classified `independent_finance_assumption` — that explicit list (not a
// screenshot, not "yellow rows") is the source of truth for that classification.
//
// PHASE 14B.4 (2026-06-10) — v8 governance summary (Luciana):
// - The Finance workbook "Concept Rio - 20 anos - Org BU - Apresentação vBU v8
//   (1).xlsx" (sheet "PnL", year columns 2028-2047) is the source of truth for
//   PnL/DRE row-level values.
// - "Service Contracts" (serviceContractsCategory / costLineCategory ===
//   "service_contract") is a CATEGORY/GOVERNANCE TAG applied to 8 specific DRE
//   fixed-cost rows (Custos e Despesas Fixas). It is NOT a separate
//   calculation layer or engine line, does NOT calculate Receita or
//   payroll/FOPAG, and affects EBITDA only through those rows' normal DRE
//   fixed-cost values — exactly like any other fixed_costs_and_expenses row.
// - The older Service Contracts screenshot/extract data
//   (serviceContractsSourceData.ts) is audit-only / superseded for DRE/EBITDA
//   purposes unless Finance explicitly reactivates it. A divergence between
//   that data and v8 for the same row is a source-version/extraction-layer
//   difference, not a DRE calculation error.
// - observedCostBehavior values below are read directly from v8 PnL formulas
//   ("formula_observed") — they are NOT an automatically Finance-confirmed
//   business-driver taxonomy unless behaviorConfidence says otherwise.
// - CAPEX (the "capex" pnl_to_cash row) is AFTER EBITDA, a negative cash-flow
//   outflow, and is NOT part of EBITDA. Implementing CAPEX/cash-flow-bridge
//   calculations belongs to a future Phase 15 capital-decision /
//   investment-feasibility scope — not this phase.

// ── DRE section structure ───────────────────────────────────────────────────
// Canonical section order, top to bottom, matching the Finance DRE template layout.

export type DreSection =
  | "drivers"
  | "revenue"
  | "direct_costs"
  | "contribution_margin"
  | "fixed_costs_and_expenses"
  | "sales_expenses"
  | "ebitda"
  | "below_ebitda"
  | "net_income"
  | "pnl_to_cash"
  | "valuation";

export const DRE_SECTION_ORDER: readonly DreSection[] = [
  "drivers",
  "revenue",
  "direct_costs",
  "contribution_margin",
  "fixed_costs_and_expenses",
  "sales_expenses",
  "ebitda",
  "below_ebitda",
  "net_income",
  "pnl_to_cash",
  "valuation",
] as const;

// ── Classification (treatment, not a static-vs-dynamic binary) ──────────────
// Every DRE row must be classified as exactly one of these. This is the
// central modeling decision of Phase 12B: most rows are NOT independently
// entered scenario inputs — they are formula-derived, engine outputs, Finance
// independent-assumption rows, memo aggregates, or rows that belong to a later
// (downstream / valuation) layer.

export type DreLineClassification =
  | "scenario_input_driver"
  | "formula_derived"
  | "existing_engine_output"
  | "independent_finance_assumption"
  | "memo_kpi"
  // Below-EBITDA Finance assumption rows (Depreciação/Amortização, Receita/
  // Despesa Financeira, IR/CSLL, Recuperação de Prejuízos). Phase 12B (Luciana)
  // deliberately separates these from `independent_finance_assumption`: they
  // are not on Finance's explicit above-EBITDA highlighted-row list and their
  // scenario sensitivity / sign convention are not yet confirmed.
  | "below_ebitda_assumption"
  | "downstream_cash_flow"
  | "valuation_output"
  // Only if explicitly approved later — not used in this phase.
  | "structural_zero_or_not_applicable";

// ── Source type ──────────────────────────────────────────────────────────────
// Which layer of the documented source hierarchy (§13) actually produces the
// row's value. This is distinct from `classification` (the treatment category):
// e.g. two `existing_engine_output` rows can have different sourceType values
// (fopag_engine vs capex_engine), and two `independent_finance_assumption` rows
// always share sourceType `finance_dre_table_annual_values` but differ in section.

export type DreLineSourceType =
  | "scenario_lever_selection"
  | "formula_layer"
  | "receita_engine"
  | "fopag_engine"
  | "service_contracts_engine"
  | "capex_engine"
  // Source type for every row on Luciana/Finance's explicit independent
  // Finance assumption list (Phase 12B prompt) — annual values come from the
  // Finance DRE table itself, not from a simulator engine or formula.
  | "finance_dre_table_annual_values"
  | "pending_finance_source_confirmation"
  // Phase 15I.2C: formula base back-derived from PnL workbook cell evidence
  // (C230 = -C$13 × C225). Provenance open: signed xlsx not yet received.
  | "extracted_from_pnl_spreadsheet"
  | "not_applicable";

export type DreLineScenarioSensitivity =
  | "direct_driver"
  | "indirect_via_formula_dependency"
  | "indirect_via_engine_dependency"
  // Required for every `independent_finance_assumption` row per Luciana's
  // explicit instruction: these rows do not move with capacity, tuition,
  // org design, or CAPEX decisions unless a later source changes the rule.
  | "independent_of_board_decision_levers"
  | "fixed_or_invariant_by_default"
  // Phase 15I.2C: line moves with scenario levers directly through formula
  // chain (e.g. descontos_metodo rate × receitas_com_ensino_regular).
  | "scenario_sensitive"
  | "not_yet_determined"
  | "not_applicable";

export type DreLineSignConvention =
  | "positive_revenue"
  | "negative_cost_or_deduction"
  | "signed_formula_subtotal"
  | "not_applicable";

export type DreLineSubtotalRole =
  | "component_line"
  | "subtotal_or_total"
  | "memo_only";

export type DrePreOpsTreatment =
  | "excluded_no_pre_ops_value"
  | "included_pre_ops_value_exists"
  | "not_applicable";

export type DrePerpetuityTreatment =
  | "excluded_horizon_ends_2047"
  | "requires_future_definition"
  | "not_applicable";

export type DreLineImplementationStatus =
  | "mapped_pending_engine_implementation"
  | "design_only_not_implemented"
  | "requires_reconciliation"
  | "requires_finance_source_confirmation"
  | "formula_candidate_pending_confirmation"
  | "memo_only_not_implemented"
  // Driver-table row identified/named from the Finance DRE template, but its
  // annual values have not yet been extracted into an approved typed source.
  | "mapped_not_extracted"
  // Row exists structurally in the Finance DRE template (downstream cash-flow
  // bridge or valuation section) but no design or engine work for it exists at
  // all yet — stronger than design_only_not_implemented, which implies a design
  // artifact exists.
  | "not_implemented"
  // Phase 15I.2C: formula base confirmed against PnL workbook cell evidence;
  // engine produces correct values. Provenance open: Finance signed xlsx pending.
  | "implemented"
  | "not_applicable";

// Required only for fixed-cost rows audited against the Service Contracts
// engine boundary (§6 of the phase instruction). Prevents double-counting a
// row as both a Service Contracts engine line and an independent Finance
// assumption / aggregate OPEX layer line.
export type DreServiceContractsMappingStatus =
  | "mapped_to_service_contracts_engine_line"
  | "pending_row_level_reconciliation"
  | "not_mapped_independent_finance_assumption";

// ── Phase 14B.4: Service Contracts category / cost-behavior governance ──────
// "Service Contracts" is a category/governance tag applied to a fixed set of
// DRE fixed-cost rows (Custos e Despesas Fixas) — NOT a separate calculation
// layer, NOT a row that calculates Receita or payroll/FOPAG. A row tagged
// serviceContractsCategory: true still affects EBITDA only via its normal
// DRE fixed-cost row value (see ebitdaFormulaNote /
// serviceContractsDoubleCountGuard). v8 (the Finance workbook) is the source
// of truth for which DRE rows carry independent annual values.

// Governance cost-line category for fixed-cost (and related) DRE rows.
export type DreCostLineCategory =
  | "service_contract"
  | "payroll_fopag"
  | "corporate_allocation"
  | "tax_fee"
  | "general_operating_cost"
  | "unresolved";

// Cost-driver behavior as OBSERVED in the v8 PnL formulas (not a confirmed
// Finance/business-driver taxonomy unless behaviorConfidence says so).
export type DreObservedCostBehavior =
  | "fixed_escalation_driven"
  | "revenue_formula_driven"
  | "learner_or_class_formula_driven"
  | "payroll_headcount_driven"
  | "corporate_allocation"
  | "formula_derived"
  | "unresolved";

// Confidence level behind observedCostBehavior. "formula_observed" is the
// default for Phase 14B.4 — it means the behavior was read directly from the
// v8 PnL formula, not confirmed by Finance as an intentional business-driver
// taxonomy. Must not be upgraded to "finance_confirmed" or
// "luciana_confirmed" without an explicit confirmation.
export type DreCostBehaviorConfidence =
  | "formula_observed"
  | "finance_confirmed"
  | "luciana_confirmed"
  | "unresolved";

// Which source is authoritative for this row's numeric annual values.
// "audit_only_superseded_screenshot_extract" applies to the older Service
// Contracts screenshot/extract values (serviceContractsSourceData.ts) — those
// values must not override v8 and must not feed EBITDA.
// "fopag_engine_output" (Phase 14B.4A): the row's annual values are produced
// by the FOPAG/payroll engine (dreEngine.ts -> fopagEngine.ts, sourced from
// payrollAdapter.ts org-design role-cost data), not read from a v8 PnL row as
// a Finance row-level assumption - even when the corresponding v8 PnL row
// also contains a formula referencing the 'Org. Design ' sheet.
export type DreCostLineSourceAuthority =
  | "v8_pnl_dre_row"
  | "audit_only_superseded_screenshot_extract"
  | "reconciliation_only"
  | "fopag_engine_output"
  | "unresolved";

export interface DreLineItemRecord {
  // Stable, ascii-normalized identifier (snake_case), matching the convention
  // used by ServiceContractsSourceLineId (e.g. "servicos_de_limpeza_e_seguranca").
  dreLineId: string;
  // Exact Portuguese display label as it appears in the Finance DRE template.
  displayLabelPt: string;
  section: DreSection;
  classification: DreLineClassification;
  sourceType: DreLineSourceType;
  // Required when classification === "existing_engine_output".
  sourceEngine?: string;
  // Required when classification === "existing_engine_output".
  sourceField?: string;
  // Required when classification === "formula_derived" (or formula candidate).
  formula?: string;
  directScenarioDriver: boolean;
  scenarioSensitivity: DreLineScenarioSensitivity;
  signConvention: DreLineSignConvention;
  subtotalRole: DreLineSubtotalRole;
  // Calendar-year coverage, e.g. "2028–2047", "pre_ops + 2028–2047", "not_applicable".
  horizon: string;
  preOpsTreatment: DrePreOpsTreatment;
  perpetuityTreatment: DrePerpetuityTreatment;
  implementationStatus: DreLineImplementationStatus;
  // Whether this row's value participates in the documented EBITDA formula
  // (Margem de Contribuição + Total Custos e Despesas Fixas + Total Despesas
  // com Vendas). Present (true/false) for every revenue/direct-cost/fixed-cost/
  // sales-expense/contribution-margin/ebitda row; omitted (not applicable) for
  // driver, below-EBITDA, net-income, pnl-to-cash and valuation rows.
  includedInEbitda?: boolean;
  // Only present on fixed-cost rows audited for Service Contracts mapping risk.
  serviceContractsMappingStatus?: DreServiceContractsMappingStatus;
  // Phase 14B.4: true only for the 8 DRE fixed-cost rows Luciana ratified as
  // the "Service Contracts" governance category (a category tag onto DRE
  // cost lines, not a separate calculation layer or engine line). false for
  // all other fixed_costs_and_expenses rows audited in Phase 14B.4.
  serviceContractsCategory?: boolean;
  // Phase 14B.4: governance cost-line category.
  costLineCategory?: DreCostLineCategory;
  // Phase 14B.4: cost-driver behavior as observed in the v8 PnL formula.
  observedCostBehavior?: DreObservedCostBehavior;
  // Phase 14B.4: confidence level behind observedCostBehavior.
  behaviorConfidence?: DreCostBehaviorConfidence;
  // Phase 14B.4: which source is authoritative for this row's numeric values.
  sourceAuthority?: DreCostLineSourceAuthority;
  notes: string;
}

// ── Driver map (§11) ─────────────────────────────────────────────────────────
// Macro / pricing / cost-escalation assumptions referenced by formula-derived
// DRE rows but not themselves DRE line items in the P&L body.

export type DreDriverAnnualValuesStatus =
  | "confirmed_in_existing_source"
  | "partially_available"
  | "not_available_pending_finance_source";

export type DreDriverSourceStatus =
  | "mapped_existing_source"
  | "simulator_owned"
  | "unmapped"
  | "pending_finance_source"
  | "reference_only";

export interface DreDriverMapRecord {
  driverId: string;
  displayLabelPt: string;
  annualValuesStatus: DreDriverAnnualValuesStatus;
  // dreLineId references of DRE rows whose formulas consume this driver.
  usedByDreLines: readonly string[];
  formulaRole: string;
  sourceStatus: DreDriverSourceStatus;
  horizon: string;
  preOpeningTreatment: string;
  implementationStatus: DreLineImplementationStatus;
  notes?: string;
}

// ── Source hierarchy (§13) ───────────────────────────────────────────────────

export interface DreSourceHierarchyEntry {
  layer: string;
  role: string;
}

// ── Top-level contract ───────────────────────────────────────────────────────

export interface DreReceitaReconciliationNote {
  currentReceitaEngineField: string;
  dreTargetField: string;
  status: "requires_reconciliation_or_formula_extension";
  note: string;
}

export interface DrePayrollMappingConfirmation {
  sourceEngine: string;
  mappings: readonly {
    dreLineId: string;
    displayLabelPt: string;
    conceptualLabel: string;
    sourceField: string;
  }[];
  note: string;
}

export interface DreLineItemMapContract {
  // This phase produces a line map only — no engine, no calculations, no UI.
  calculationStatus: "line_map_designed_no_engine_implemented";
  calculationEngineImplemented: false;
  uiImplemented: false;

  sectionOrder: readonly DreSection[];
  lines: readonly DreLineItemRecord[];
  drivers: readonly DreDriverMapRecord[];

  // dreLineId values where directScenarioDriver === true (cross-check aid).
  directScenarioDriverDreLineIds: readonly string[];

  // dreLineId values classified independent_finance_assumption (cross-check
  // aid against Luciana/Finance's explicit highlighted-row list).
  independentFinanceAssumptionDreLineIds: readonly string[];

  signConventionDisplayPolicy: string;
  signConventionEngineBoundaryPolicy: string;

  sourceHierarchy: readonly DreSourceHierarchyEntry[];

  receitaReconciliation: DreReceitaReconciliationNote;
  payrollMapping: DrePayrollMappingConfirmation;
  serviceContractsDoubleCountGuard: string;
  capexTreatmentNote: string;
  ebitdaFormulaNote: string;
  belowEbitdaAndValuationNote: string;

  blockedUntil: readonly string[];
  sourceNotes: string;
}
