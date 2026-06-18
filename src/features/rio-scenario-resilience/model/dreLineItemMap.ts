// DRE (Demonstrativo de Resultado) populated line-item map.
// Phase 12B.1 (2026-06-08): populates DreLineItemMapContract types with the
// explicit DRE line list and row classifications provided by Luciana from the
// Finance DRE template and Finance's highlight classification.
//
// Source authority for this file:
// - Row existence, section placement, classification, formulas, and the
//   independent-Finance-assumption list come from Luciana's Phase 12B prompt.
//   That prompt — not a screenshot, not an inferred "yellow rows" reading — is
//   the source of truth for every classification recorded below.
// - The Finance DRE template itself remains the structural and formula source
//   of truth for the DRE; this file records Luciana's classification of it.
// - FOPAG engine (fopagEngine.ts) is the numeric source of truth for payroll
//   rows. CAPEX engine (capexEngine.ts) is the numeric source of truth for the
//   CAPEX row only.
//
// Types only consumed here. No engine. No EBITDA calculation. No DRE
// calculation. No cash-flow bridge. No DCF. No NPV. No payback. No Tier.
// No UI. No placeholder financial values. Formula-derived rows are NOT stored
// as static annual values — `formula` records the documented formula text
// only.

import type {
  DreDriverMapRecord,
  DreLineItemRecord,
} from "./dreLineItemMapContract";

// ── Driver table (§ Phase 12B prompt item 9) ────────────────────────────────
// Macro / pricing / cost-escalation assumptions referenced by formula-derived
// DRE rows but not themselves DRE line items in the P&L body (per
// DreDriverMapRecord's documented purpose). None of these annual values have
// been extracted yet — `mapped_not_extracted` records that the row is
// identified from the Finance DRE template but its values are not yet sourced.

export const DRIVER_LINE_MAP: readonly DreDriverMapRecord[] = [
  {
    driverId: "igp_m",
    displayLabelPt: "IGP-M",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "General price index (formula_driver) referenced for annual cost/price " +
      "escalation across formula-derived DRE rows. Exact per-line application " +
      "not yet confirmed by Finance — do not assume which rows it escalates.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "ipca",
    displayLabelPt: "IPCA",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Consumer price index (formula_driver) referenced for annual cost/price " +
      "escalation across formula-derived DRE rows. Exact per-line application " +
      "not yet confirmed by Finance — do not assume which rows it escalates.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "selic",
    displayLabelPt: "SELIC",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Reference interest rate (formula_driver). Plausibly informs " +
      "Receita / Despesa Financeira and/or discount-rate assumptions below " +
      "EBITDA, but the exact consuming formula is not yet confirmed by Finance.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "wacc",
    displayLabelPt: "WACC",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["fator_desconto", "dcf_anual", "dcf_acumulado"],
    formulaRole:
      "Weighted average cost of capital (formula_driver). Plausibly the " +
      "discount-rate input to the valuation section (Fator Desconto / DCF " +
      "rows), but the exact consuming formula is not yet confirmed by Finance — " +
      "this mapping is a structural inference from row adjacency, not a " +
      "confirmed formula reference.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "reajuste_servicos",
    displayLabelPt: "Reajuste Serviços",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Annual escalation factor (formula_driver) plausibly applied to " +
      "service-related independent-Finance-assumption fixed-cost rows " +
      "(e.g. Serviços de Limpeza e Segurança, Consultoria e Honorários). " +
      "Exact per-line application not yet confirmed by Finance.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "reajuste_material",
    displayLabelPt: "Reajuste Material",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Annual escalation factor (formula_driver) plausibly applied to " +
      "material-cost rows (e.g. Materiais Pedagógicos, Materiais de Limpeza, " +
      "Materiais de Escritório). Exact per-line application not yet confirmed " +
      "by Finance.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "reajuste_despesas",
    displayLabelPt: "Reajuste Despesas",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Annual escalation factor (formula_driver) plausibly applied to " +
      "expense rows generally (fixed costs and/or sales expenses). Exact " +
      "per-line application not yet confirmed by Finance.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "dissidio",
    displayLabelPt: "Dissídio",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: [],
    formulaRole:
      "Collective-bargaining wage-adjustment driver (formula_driver). " +
      "Plausibly related to payroll growth, but FOPAG growth conventions are " +
      "owned by fopagEngine.ts — this driver's relationship to the existing " +
      "payrollGrowthFactor is not yet confirmed by Finance and must not be " +
      "assumed equivalent.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "beneficios_driver",
    displayLabelPt: "Benefícios",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["beneficios", "total_folha_de_pagamento"],
    formulaRole:
      "Benefits assumption/escalation driver (formula_driver) referenced by " +
      "the Benefícios DRE line and the Total Folha de Pagamento memo " +
      "aggregate. Distinct from the `beneficios` DRE line item itself — this " +
      "is the driver-table row of the same display label. Suffixed " +
      "`beneficios_driver` to avoid identifier collision with the DRE line.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "deducoes_driver",
    displayLabelPt: "Deduções",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["deducoes"],
    formulaRole:
      "Plausibly the '% Deduções' rate consumed by the Deduções formula " +
      "(Receita Operacional Antes das Deduções × % Deduções). Naming " +
      "proximity only — exact correspondence between this driver-table row " +
      "and the '% Deduções' formula term is not explicitly confirmed and " +
      "must be verified with Finance before use. Suffixed `deducoes_driver` " +
      "to avoid identifier collision with the DRE line.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "desconto_metodo",
    displayLabelPt: "Desconto Método",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["descontos_metodo_de_assinatura"],
    formulaRole:
      "Subscription-method discount driver (formula_driver) plausibly " +
      "consumed by the Descontos Método de Assinatura formula-candidate DRE " +
      "line, whose own formula is still pending confirmation. Naming " +
      "proximity only.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "rateio_corporativo_driver",
    displayLabelPt: "Rateio Corporativo",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["rateio_corporativo"],
    formulaRole:
      "Corporate cost-allocation driver (formula_driver) referenced by the " +
      "Rateio Corporativo independent-Finance-assumption fixed-cost DRE line. " +
      "Distinct from that DRE line item — this is the driver-table row of the " +
      "same display label. Suffixed `rateio_corporativo_driver` to avoid " +
      "identifier collision with the DRE line.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "custo_material_digital_fator",
    displayLabelPt: "Custo Material Digital (Fator)",
    annualValuesStatus: "confirmed_in_existing_source",
    usedByDreLines: ["custo_de_material_digital"],
    formulaRole:
      "Digital-material cost factor (formula_driver) directly named in the " +
      "Custo de Material Digital formula (Receita com Material Didático × " +
      "Custo Material Digital (Fator)). Direct formula reference — high " +
      "confidence mapping.",
    sourceStatus: "mapped_existing_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_applicable_constant_value — extracted constant 0.28107722418571557 applies " +
      "uniformly 2028–2047; no pre-opening treatment required.",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12L (2026-06-09): annual values extracted into dreCostDriverSourceData.ts " +
      "(constant 0.28107722418571557 for all 20 projection years, sourced from PnL row 15). " +
      "Phase 12M (2026-06-09): metadata updated — annualValuesStatus, sourceStatus, " +
      "preOpeningTreatment, and implementationStatus corrected to reflect extraction status.",
  },
  {
    driverId: "adesao_upselling",
    displayLabelPt: "Adesão Upselling",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["receitas_com_upselling"],
    formulaRole:
      "Upselling adoption-rate driver (formula_driver) directly named in the " +
      "Receitas com Upselling formula (Adesão Upselling × Número de Alunos × " +
      "Ticket Médio Upselling). Direct formula reference — high confidence " +
      "mapping.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
  {
    driverId: "ticket_medio_upselling",
    displayLabelPt: "Ticket Médio Upselling",
    annualValuesStatus: "not_available_pending_finance_source",
    usedByDreLines: ["receitas_com_upselling"],
    formulaRole:
      "Average upselling ticket driver (formula_driver) directly named in " +
      "the Receitas com Upselling formula (Adesão Upselling × Número de " +
      "Alunos × Ticket Médio Upselling). Direct formula reference — high " +
      "confidence mapping.",
    sourceStatus: "pending_finance_source",
    horizon: "2028-2047",
    preOpeningTreatment:
      "not_yet_determined — requires Finance confirmation; do not infer a pre-opening driver value.",
    implementationStatus: "mapped_not_extracted",
  },
];

// ── DRE line-item map ────────────────────────────────────────────────────────
// Every row of the Finance DRE template, classified per Luciana's Phase 12B
// instruction. Section order matches DRE_SECTION_ORDER. `formula` records
// documented formula text only — formula-derived rows are NOT static annual
// values.

const DRE_LINE_ITEM_MAP_DATA: readonly DreLineItemRecord[] = [
  // ── drivers ────────────────────────────────────────────────────────────────
  // Visible DRE-template rows in the Drivers section (distinct from the macro
  // driver table in DRIVER_LINE_MAP, which is referenced by formulas but is
  // not itself part of the P&L body).
  {
    dreLineId: "numero_de_turmas",
    displayLabelPt: "Número de Turmas",
    section: "drivers",
    classification: "scenario_input_driver",
    sourceType: "scenario_lever_selection",
    directScenarioDriver: true,
    scenarioSensitivity: "direct_driver",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "not_applicable",
    perpetuityTreatment: "not_applicable",
    implementationStatus: "design_only_not_implemented",
    notes:
      "Phase 12B (Luciana): direct scenario input driver. Structural relationship " +
      "to org-design / section-count engine outputs (sectionCountEngine.ts) not " +
      "yet reconciled — this row records Finance's DRE-template classification " +
      "only, not a calculation binding.",
  },
  {
    dreLineId: "numero_de_alunos",
    displayLabelPt: "Número de Alunos",
    section: "drivers",
    classification: "scenario_input_driver",
    sourceType: "scenario_lever_selection",
    directScenarioDriver: true,
    scenarioSensitivity: "direct_driver",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "not_applicable",
    perpetuityTreatment: "not_applicable",
    implementationStatus: "design_only_not_implemented",
    notes:
      "Phase 12B (Luciana): direct scenario input driver. Directly named in the " +
      "Receitas com Ensino Regular and Receitas com Upselling formulas. " +
      "Reconciliation against openingPackageOccupancySourceData.ts enrollment " +
      "records is a future step, not performed in this pass.",
  },
  {
    dreLineId: "ticket_servico",
    displayLabelPt: "Ticket Serviço",
    section: "drivers",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receitas com Ensino Regular / Número de Alunos / 12",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "not_applicable",
    perpetuityTreatment: "not_applicable",
    implementationStatus: "design_only_not_implemented",
    notes:
      "Phase 12I (Luciana, 2026-06-08): reclassified from scenario_input_driver " +
      "to formula_derived. Spreadsheet evidence (PnL row 224): C224 = C225 / C221 / 12. " +
      "Causality runs Receitas com Ensino Regular (row 225, sourced from row 215) → " +
      "Ticket Serviço (a derived average monthly service ticket) — NOT the other way " +
      "around. The algebraic equivalence 'Alunos × Ticket × 12 = Receitas' was " +
      "mistaken for directionality in Phase 12B; this phase corrects it with direct " +
      "spreadsheet evidence. Ticket Serviço is not a scenario driver and cannot be " +
      "set independently.",
  },

  // ── revenue ────────────────────────────────────────────────────────────────
  {
    dreLineId: "receitas_com_ensino_regular",
    displayLabelPt: "Receitas com Ensino Regular",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "current-year value from row 215 total service revenue (C225 = C215)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "positive_revenue",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12I (Luciana, 2026-06-08): formula updated from Phase 12B's inferred " +
      "'Número de Alunos × Ticket Serviço × 12' to the direct spreadsheet formula " +
      "C225 = C215. Row 225 references row 215 (total service revenue for the year). " +
      "Ticket Serviço (row 224) is DERIVED from this row, not the other way around. " +
      "Reconciliation with receitaEngine.ts netReceitaAfterDiscount performed in " +
      "Phase 12H/12I — see DRE_REVENUE_BLOCK_RECONCILIATION.",
  },
  {
    dreLineId: "receitas_com_upselling",
    displayLabelPt: "Receitas com Upselling",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Adesão Upselling × Número de Alunos × Ticket Médio Upselling",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "positive_revenue",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): formula-derived. Consumes two driver-table rows " +
      "(Adesão Upselling, Ticket Médio Upselling) plus the Número de Alunos " +
      "scenario driver. See DRIVER_LINE_MAP for those rows' status.",
  },
  {
    dreLineId: "receita_de_ensino_bruta",
    displayLabelPt: "Receita de Ensino Bruta",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receitas com Ensino Regular + Receitas com Upselling",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes: "Phase 12B (Luciana): subtotal of the two regular-revenue formula rows above.",
  },
  {
    dreLineId: "bolsa_de_estudos",
    displayLabelPt: "Bolsa de Estudos",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receitas com Ensino Regular × % Desconto Médio",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "formula_candidate_pending_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): explicitly signed negative (a deduction added into the " +
      "Receita de Ensino Líquida subtotal). The '% Desconto Médio' rate consumed by " +
      "this formula does not appear in the Phase 12B driver-table list — its source " +
      "is unmapped; do not invent a value or a driver-table entry for it.",
  },
  {
    dreLineId: "receita_de_ensino_liquida",
    displayLabelPt: "Receita de Ensino Líquida",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receita de Ensino Bruta + Bolsa de Estudos",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): subtotal. Bolsa de Estudos is added as a signed " +
      "(negative) value, not subtracted — preserves the Finance DRE template's " +
      "additive formula structure.",
  },
  {
    dreLineId: "descontos_metodo_de_assinatura",
    displayLabelPt: "Descontos Método de Assinatura",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "extracted_from_pnl_spreadsheet",
    directScenarioDriver: false,
    scenarioSensitivity: "scenario_sensitive",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "implemented",
    includedInEbitda: true,
    notes:
      "Phase 15I.2C: formula base corrected to receitas_com_ensino_regular (C225). " +
      "PnL workbook: C230 = −C$13 × C225; rate back-derived as Z13 = −Y230/Y225 " +
      "(Phase 12I/12K, dreRevenueDriverSourceData.ts). Formula closure complete. " +
      "Provenance open: Finance signed xlsx not yet received (F04/F03 track).",
  },
  {
    dreLineId: "receita_com_eventos",
    displayLabelPt: "Receita com Eventos",
    section: "revenue",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "positive_revenue",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions. " +
      "Annual values must be sourced from the Finance DRE table directly, not " +
      "calculated.",
  },
  {
    dreLineId: "receita_com_material_didatico",
    displayLabelPt: "Receita com Material Didático",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Número de Alunos × Ticket Material × 12",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "positive_revenue",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "formula_candidate_pending_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): formula candidate pending confirmation. 'Ticket " +
      "Material' is named in this formula but does not appear anywhere in the " +
      "Phase 12B scenario-driver list or driver-table list — it is an unmapped " +
      "dependency. Do not invent a source or value for it. This row also feeds " +
      "Custo de Material Digital downstream.",
  },
  {
    dreLineId: "outras_receitas",
    displayLabelPt: "Outras Receitas",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula:
      "C233 = ($Y233/$Y$221)*(1+C$9)*C$221 — (base-year per-learner ratio) × " +
      "(1 + Reajuste Despesas index) × Número de Alunos",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "positive_revenue",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): formula text not provided — flagged formula-candidate " +
      "pending confirmation only. Sign inferred as positive_revenue from its " +
      "additive role and 'Receitas' naming. " +
      "Phase 12M (2026-06-09): formula confirmed from PnL spreadsheet source " +
      "(C233 = ($Y233/$Y$221)*(1+C$9)*C$221). Resolution: resolved_by_spreadsheet_source_authority " +
      "(see dreScenarioAdapterDesign.ts outrasReceitasResolution). " +
      "Limitation: base-year per-learner ratio (Y233/Y221) not separately extracted — " +
      "adapter cannot be wired until the ratio is available from Finance.",
  },
  {
    dreLineId: "receita_operacional_antes_das_deducoes",
    displayLabelPt: "Receita Operacional Antes das Deduções",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula:
      "Receita de Ensino Líquida + Descontos Método de Assinatura + Receita com Eventos " +
      "+ Receita com Material Didático + Outras Receitas",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): subtotal aggregating the full revenue stack, including " +
      "two formula-candidate-pending rows (Descontos Método de Assinatura, Outras " +
      "Receitas) and one independent Finance assumption row (Receita com Eventos). " +
      "Calculation readiness is bounded by the least-ready input row.",
  },
  {
    dreLineId: "deducoes",
    displayLabelPt: "Deduções",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receita Operacional Antes das Deduções × % Deduções",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "formula_candidate_pending_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): explicitly signed negative. The '% Deduções' rate is " +
      "plausibly the Deduções driver-table row (DRIVER_LINE_MAP, driverId " +
      "deducoes_driver) by naming proximity, but exact correspondence is not " +
      "explicitly confirmed.",
  },
  {
    dreLineId: "receita_operacional_liquida",
    displayLabelPt: "Receita Operacional Líquida",
    section: "revenue",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receita Operacional Antes das Deduções + Deduções",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): top-line revenue subtotal used as the denominator in " +
      "% EBITDA and % Lucro Líquido and as the revenue base in Margem de " +
      "Contribuição. Possible overlap with receitaEngine.ts " +
      "netReceitaAfterDiscount requires reconciliation in a later phase.",
  },

  // ── direct_costs ───────────────────────────────────────────────────────────
  {
    dreLineId: "custo_de_material_digital",
    displayLabelPt: "Custo de Material Digital",
    section: "direct_costs",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receita com Material Didático × Custo Material Digital (Fator)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "formula_candidate_pending_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): explicitly signed negative. Directly references the " +
      "Custo Material Digital (Fator) driver-table row (DRIVER_LINE_MAP) and the " +
      "formula-candidate-pending Receita com Material Didático row.",
  },
  {
    dreLineId: "custo_da_mercadoria_vendida",
    displayLabelPt: "Custo da Mercadoria Vendida",
    section: "direct_costs",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Custo de Material Digital",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "formula_candidate_pending_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): pass-through equal to Custo de Material Digital per " +
      "Finance's documented formula (the Finance DRE template states this row " +
      "equals that row exactly — recorded as given, not collapsed into one row).",
  },
  {
    dreLineId: "fopag_direto_clt_pj",
    displayLabelPt: "FOPAG Direto (CLT-PJ)",
    section: "direct_costs",
    classification: "existing_engine_output",
    sourceType: "fopag_engine",
    sourceEngine: "fopagEngine.ts calculateFopag()",
    sourceField:
      "FopagYearTotals.fopagDireto (from FopagEngineOutput.yearTotals[year]; " +
      "sum of grossLaborAnnualAfterGrowth for FOPAG_DIRETO-allocated active records)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_engine_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): dynamic by org design — sourced from the FOPAG engine, " +
      "not Finance's independent-assumption list. FOPAG_DIRETO is the engine's " +
      "allocationModel discriminator; FopagYearTotals.fopagDireto is the numeric " +
      "year-total field that actually carries the value.",
  },
  {
    dreLineId: "eventos_seb",
    displayLabelPt: "Eventos SEB",
    section: "direct_costs",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "certificacoes",
    displayLabelPt: "Certificações",
    section: "direct_costs",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "custos_com_alimentacao",
    displayLabelPt: "Custos com Alimentação",
    section: "direct_costs",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "materiais_pedagogicos",
    displayLabelPt: "Materiais Pedagógicos",
    section: "direct_costs",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "total_custo_direto",
    displayLabelPt: "Total Custo Direto",
    section: "direct_costs",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula:
      "FOPAG Direto + Eventos SEB + Certificações + Custos com Alimentação + Materiais Pedagógicos",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): subtotal mixing one existing_engine_output row (FOPAG " +
      "Direto, sourced fopagEngine.ts) with four independent_finance_assumption " +
      "rows (sourced finance_dre_table_annual_values). Calculation readiness is " +
      "bounded by the least-ready input row.",
  },

  // ── contribution_margin ────────────────────────────────────────────────────
  {
    dreLineId: "margem_de_contribuicao",
    displayLabelPt: "Margem de Contribuição",
    section: "contribution_margin",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Receita Operacional Líquida + Custo da Mercadoria Vendida + Total Custo Direto",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): first of the three additive terms in the documented " +
      "EBITDA formula (Margem de Contribuição + Total Custos e Despesas Fixas + " +
      "Total Despesas com Vendas). Cost terms are added as signed (negative) " +
      "values, preserving the Finance DRE template's additive structure.",
  },

  // ── fixed_costs_and_expenses ───────────────────────────────────────────────
  {
    dreLineId: "folha_de_pagamento",
    displayLabelPt: "Folha de Pagamento",
    section: "fixed_costs_and_expenses",
    classification: "existing_engine_output",
    sourceType: "fopag_engine",
    sourceEngine: "fopagEngine.ts calculateFopag()",
    sourceField:
      "FopagYearTotals.folhaDireta (from FopagEngineOutput.yearTotals[year]; " +
      "sum of grossLaborAnnualAfterGrowth for FOLHA_DIRETA-allocated active records)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_engine_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "payroll_fopag",
    observedCostBehavior: "payroll_headcount_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "fopag_engine_output",
    notes:
      "Phase 12B (Luciana): dynamic by org design — sourced from the FOPAG engine, " +
      "not Finance's independent-assumption list. FOLHA_DIRETA is the engine's " +
      "allocationModel discriminator; FopagYearTotals.folhaDireta is the numeric " +
      "year-total field that actually carries the value. " +
      "PHASE 14B.4A (2026-06-10): this row is computed by calculateFopag() " +
      "(dreEngine.ts -> fopagEngine.ts) from payrollAdapter.ts org-design " +
      "role-cost data. It is NOT a v8 PnL row-level Finance assumption, even " +
      "though the corresponding v8 PnL row (Folha de Pagamento) also contains a " +
      "formula referencing the 'Org. Design ' sheet — that v8 formula is not the " +
      "value used by the live calculation path.",
  },
  {
    dreLineId: "beneficios",
    displayLabelPt: "Benefícios",
    section: "fixed_costs_and_expenses",
    classification: "existing_engine_output",
    sourceType: "fopag_engine",
    sourceEngine: "fopagEngine.ts calculateFopag()",
    sourceField:
      "FopagYearTotals.benefits (from FopagEngineOutput.yearTotals[year]; sum of " +
      "benefitsAnnualAfterGrowth for all active records, both allocation models)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_engine_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "payroll_fopag",
    observedCostBehavior: "payroll_headcount_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "fopag_engine_output",
    notes:
      "Phase 12B (Luciana): dynamic by org design — sourced from the FOPAG engine. " +
      "BENEFITS is the engine's source-type label; FopagYearTotals.benefits is the " +
      "numeric year-total field. Distinct from the 'Benefícios' driver-table row " +
      "(DRIVER_LINE_MAP, driverId beneficios_driver) — the driver row is a " +
      "macro escalation assumption, this row is the actual cost line. " +
      "PHASE 14B.4A (2026-06-10): this row is computed by calculateFopag() " +
      "(dreEngine.ts -> fopagEngine.ts) from payrollAdapter.ts org-design " +
      "role-cost data. It is NOT a v8 PnL row-level Finance assumption, even " +
      "though the corresponding v8 PnL row (Benefícios) also contains a formula " +
      "referencing the 'Org. Design ' sheet — that v8 formula is not the value " +
      "used by the live calculation path.",
  },
  {
    dreLineId: "total_folha_de_pagamento",
    displayLabelPt: "Total Folha de Pagamento",
    section: "fixed_costs_and_expenses",
    classification: "memo_kpi",
    sourceType: "formula_layer",
    formula: "FOPAG Direto + Folha de Pagamento",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_engine_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "memo_only",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "memo_only_not_implemented",
    includedInEbitda: false,
    notes:
      "Phase 12B (Luciana): MEMO AGGREGATE — do not subtract this again in EBITDA. " +
      "Benefícios is already included separately as its own fixed-cost line. This " +
      "row exists for board-facing readability only; including it in any EBITDA or " +
      "Total Custos e Despesas Fixas summation would double-count payroll.",
  },
  {
    dreLineId: "cursos_e_treinamentos",
    displayLabelPt: "Cursos e Treinamentos",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "servicos_de_limpeza_e_seguranca",
    displayLabelPt: "Serviços de Limpeza e Segurança",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'servicos_de_limpeza_e_" +
      "seguranca' exactly (serviceContractsSourceDataContract.ts). Despite the name " +
      "match, Phase 12B classifies this row as sourced from the Finance DRE table " +
      "directly, not from the Service Contracts engine — recorded here precisely to " +
      "prevent the row being double-counted as both later.",
  },
  {
    dreLineId: "consultoria_e_honorarios",
    displayLabelPt: "Consultoria e Honorários",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "fixed_escalation_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'consultoria_e_" +
      "honorarios' exactly. Despite the name match, Phase 12B classifies this row " +
      "as sourced from the Finance DRE table directly, not from the Service " +
      "Contracts engine — recorded here precisely to prevent double-counting.",
  },
  {
    dreLineId: "despesas_juridicas",
    displayLabelPt: "Despesas Jurídicas",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "fixed_escalation_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "rpa",
    displayLabelPt: "RPA",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "aluguel_iptu",
    displayLabelPt: "Aluguel / IPTU",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "fixed_escalation_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "conservacao_predial_e_manutencao_maquinas_e_moveis",
    displayLabelPt: "Conservação Predial e Manutenção Máquinas e Móveis",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'conservacao_predial_e_" +
      "manutencao_maquinas_e_moveis' exactly. Despite the name match, Phase 12B " +
      "classifies this row as sourced from the Finance DRE table directly, not " +
      "from the Service Contracts engine — recorded here precisely to prevent " +
      "double-counting.",
  },
  {
    dreLineId: "locacao_de_maquinas_e_equipamentos",
    displayLabelPt: "Locação de Máquinas e Equipamentos",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'locacao_de_maquinas_e_" +
      "equipamentos' exactly. Despite the name match, Phase 12B classifies this row " +
      "as sourced from the Finance DRE table directly, not from the Service " +
      "Contracts engine — recorded here precisely to prevent double-counting.",
  },
  {
    dreLineId: "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
    displayLabelPt: "Tecnologia, Telefone, Internet, Licenças e Serviços de Informação",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "pending_row_level_reconciliation",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: the Finance DRE template label is broader than ServiceContractsSourceLineId " +
      "'tecnologia' (serviceContractsSourceDataContract.ts) — partial name overlap, not " +
      "an exact match. Marked pending_row_level_reconciliation rather than " +
      "not_mapped_independent_finance_assumption because the scope difference between " +
      "the two labels is not yet resolved; do not assume they cover the same value.",
  },
  {
    dreLineId: "energia_eletrica_agua_e_esgoto",
    displayLabelPt: "Energia Elétrica, Água e Esgoto",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "learner_or_class_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: near-exact match with ServiceContractsSourceLineId 'energia_eletrica_" +
      "agua_esgoto' (serviceContractsSourceDataContract.ts) — Finance DRE template " +
      "label includes an extra conjunction 'e' ('Água e Esgoto') not present in the " +
      "engine's source-line id. Despite the close match, Phase 12B classifies this " +
      "row as sourced from the Finance DRE table directly — recorded here precisely " +
      "to prevent double-counting.",
  },
  {
    dreLineId: "materiais_de_limpeza",
    displayLabelPt: "Materiais de Limpeza",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'materiais_de_limpeza' " +
      "exactly. Despite the name match, Phase 12B classifies this row as sourced " +
      "from the Finance DRE table directly, not from the Service Contracts engine " +
      "— recorded here precisely to prevent double-counting.",
  },
  {
    dreLineId: "materiais_de_escritorio",
    displayLabelPt: "Materiais de Escritório",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsMappingStatus: "not_mapped_independent_finance_assumption",
    serviceContractsCategory: true,
    costLineCategory: "service_contract",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list — " +
      "this explicit classification is the source of truth and takes precedence. " +
      "FLAG: dreLineId matches ServiceContractsSourceLineId 'materiais_de_escritorio' " +
      "exactly. Despite the name match, Phase 12B classifies this row as sourced " +
      "from the Finance DRE table directly, not from the Service Contracts engine " +
      "— recorded here precisely to prevent double-counting.",
  },
  {
    dreLineId: "despesas_com_viagens",
    displayLabelPt: "Despesas com Viagens",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "corporativo_bu",
    displayLabelPt: "Corporativo BU",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "corporate_allocation",
    observedCostBehavior: "corporate_allocation",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "rateio_corporativo",
    displayLabelPt: "Rateio Corporativo",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "corporate_allocation",
    observedCostBehavior: "corporate_allocation",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Distinct from the 'Rateio Corporativo' driver-table row (DRIVER_LINE_MAP, " +
      "driverId rateio_corporativo_driver) — that row is a macro allocation " +
      "assumption referenced by formulas, this row is the actual DRE cost line " +
      "with its own independent annual value.",
  },
  {
    dreLineId: "demais_impostos_e_taxas",
    displayLabelPt: "Demais Impostos e Taxas",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "revenue_formula_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "demais_custos_e_despesas",
    displayLabelPt: "Demais Custos e Despesas",
    section: "fixed_costs_and_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    serviceContractsCategory: false,
    costLineCategory: "general_operating_cost",
    observedCostBehavior: "fixed_escalation_driven",
    behaviorConfidence: "formula_observed",
    sourceAuthority: "v8_pnl_dre_row",
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Last component line of Total Custos e Despesas Fixas's documented " +
      "'Folha de Pagamento through Demais Custos e Despesas' summation range.",
  },
  {
    dreLineId: "total_custos_e_despesas_fixas",
    displayLabelPt: "Total Custos e Despesas Fixas",
    section: "fixed_costs_and_expenses",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "sum from Folha de Pagamento through Demais Custos e Despesas",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): second of the three additive terms in the documented " +
      "EBITDA formula. The summation range runs Folha de Pagamento → Demais Custos " +
      "e Despesas as listed in this section, and explicitly EXCLUDES the Total " +
      "Folha de Pagamento memo row (memo_kpi, includedInEbitda=false) to avoid " +
      "double-counting payroll that is already present via Folha de Pagamento and " +
      "Benefícios as individual component lines.",
  },

  // ── sales_expenses ─────────────────────────────────────────────────────────
  {
    dreLineId: "despesas_com_marketing",
    displayLabelPt: "Despesas com Marketing",
    section: "sales_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "pcld",
    displayLabelPt: "PCLD",
    section: "sales_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "despesas_bancarias",
    displayLabelPt: "Despesas Bancárias",
    section: "sales_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "descontos_comerciais",
    displayLabelPt: "Descontos Comerciais",
    section: "sales_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Does not move with capacity, tuition, org design, or CAPEX decisions.",
  },
  {
    dreLineId: "despesas_com_sinistro",
    displayLabelPt: "Despesas com Sinistro",
    section: "sales_expenses",
    classification: "independent_finance_assumption",
    sourceType: "finance_dre_table_annual_values",
    directScenarioDriver: false,
    scenarioSensitivity: "independent_of_board_decision_levers",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): on Finance's explicit independent-annual-value list. " +
      "Last component line of Total Despesas com Vendas's documented formula.",
  },
  {
    dreLineId: "total_despesas_com_vendas",
    displayLabelPt: "Total Despesas com Vendas",
    section: "sales_expenses",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula:
      "Despesas com Marketing + PCLD + Despesas Bancárias + Descontos Comerciais + Despesas com Sinistro",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): third and final additive term in the documented EBITDA " +
      "formula. All five inputs are independent_finance_assumption rows.",
  },

  // ── ebitda ─────────────────────────────────────────────────────────────────
  {
    dreLineId: "ebitda",
    displayLabelPt: "EBITDA",
    section: "ebitda",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Margem de Contribuição + Total Custos e Despesas Fixas + Total Despesas com Vendas",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: true,
    notes:
      "Phase 12B (Luciana): the documented EBITDA formula itself — recorded as the " +
      "Finance DRE template's formula text, not implemented as a calculation in " +
      "this phase (no DRE engine, no EBITDA engine per the contract header). " +
      "Reconciliation against ebitdaCalculationDesign.ts (Phase 12A scope-limited " +
      "design, which proposed 'operating_result_after_payroll_and_service_contracts' " +
      "as a narrower interim output) is a future step, not performed here.",
  },
  {
    dreLineId: "pct_ebitda",
    displayLabelPt: "% EBITDA",
    section: "ebitda",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "EBITDA / Receita Operacional Líquida",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "not_applicable",
    subtotalRole: "memo_only",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    includedInEbitda: false,
    notes:
      "Phase 12B (Luciana): margin ratio derived FROM EBITDA — not a component of " +
      "it (includedInEbitda=false to prevent circular inclusion). Memo/display row.",
  },

  // ── below_ebitda ───────────────────────────────────────────────────────────
  {
    dreLineId: "ebit",
    displayLabelPt: "EBIT",
    section: "below_ebitda",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "EBITDA + Depreciação / Amortização",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): below-EBITDA subtotal. includedInEbitda omitted per " +
      "contract — not applicable to below-EBITDA rows.",
  },
  {
    dreLineId: "depreciacao_amortizacao",
    displayLabelPt: "Depreciação / Amortização",
    section: "below_ebitda",
    classification: "below_ebitda_assumption",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    notes:
      "Phase 12B (Luciana): below-EBITDA Finance assumption row — directly named " +
      "in the EBIT formula. Deliberately classified separately from " +
      "independent_finance_assumption: it is not on Finance's explicit above-" +
      "EBITDA highlighted-row list, and its sign convention (depreciation is " +
      "typically a cost, but the displayed sign in the Finance DRE template was " +
      "not specified in this prompt) requires Finance confirmation — recorded as " +
      "not_applicable rather than guessed. Also distinct from the pnl_to_cash " +
      "section's 'Depreciação' row, which is the same underlying concept placed " +
      "in the cash-flow bridge layer per the Finance DRE template's own structure.",
  },
  {
    dreLineId: "ebt",
    displayLabelPt: "EBT",
    section: "below_ebitda",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "EBIT + Receita / Despesa Financeira",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): below-EBITDA subtotal. includedInEbitda omitted per " +
      "contract — not applicable to below-EBITDA rows.",
  },
  {
    dreLineId: "receita_despesa_financeira",
    displayLabelPt: "Receita / Despesa Financeira",
    section: "below_ebitda",
    classification: "below_ebitda_assumption",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    notes:
      "Phase 12B (Luciana): below-EBITDA Finance assumption row — directly named " +
      "in the EBT formula. The label itself ('Receita / Despesa') signals the row " +
      "can be either an income or an expense depending on the year's actual " +
      "figure; its true sign convention requires Finance confirmation and is " +
      "recorded as not_applicable rather than guessed. Possibly related to the " +
      "SELIC driver-table row, but that relationship is not confirmed.",
  },
  {
    dreLineId: "ir_csll_rec_desp",
    displayLabelPt: "IR / CSLL - (Rec/Desp)",
    section: "below_ebitda",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "IR / CSLL + Recuperação de Prejuízos",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): formula-derived combination row that is itself an " +
      "input to the Lucro Líquido formula. Combines two below_ebitda_assumption " +
      "rows (IR / CSLL and Recuperação de Prejuízos) — distinguish carefully from " +
      "the plain 'IR / CSLL' row, which is a separate Finance assumption line, not " +
      "this combination row.",
  },
  {
    dreLineId: "ir_csll",
    displayLabelPt: "IR / CSLL",
    section: "below_ebitda",
    classification: "below_ebitda_assumption",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    notes:
      "Phase 12B (Luciana): below-EBITDA Finance assumption row — directly named " +
      "in the IR / CSLL - (Rec/Desp) formula as a distinct input from Recuperação " +
      "de Prejuízos. Typically a tax expense, but the displayed sign convention in " +
      "the Finance DRE template was not specified in this prompt — recorded as " +
      "not_applicable rather than guessed.",
  },
  {
    dreLineId: "recuperacao_de_prejuizos",
    displayLabelPt: "Recuperação de Prejuízos",
    section: "below_ebitda",
    classification: "below_ebitda_assumption",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "requires_finance_source_confirmation",
    notes:
      "Phase 12B (Luciana): below-EBITDA Finance assumption row — directly named " +
      "in the IR / CSLL - (Rec/Desp) formula as a distinct input from IR / CSLL. " +
      "'Recuperação' (recovery) suggests a credit, but the displayed sign " +
      "convention in the Finance DRE template was not specified in this prompt — " +
      "recorded as not_applicable rather than guessed.",
  },

  // ── net_income ─────────────────────────────────────────────────────────────
  {
    dreLineId: "lucro_liquido",
    displayLabelPt: "Lucro Líquido",
    section: "net_income",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "EBT + IR / CSLL - (Rec/Desp)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "signed_formula_subtotal",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): bottom-line net income subtotal. includedInEbitda " +
      "omitted per contract — not applicable to net-income rows.",
  },
  {
    dreLineId: "pct_lucro_liquido",
    displayLabelPt: "% Lucro Líquido",
    section: "net_income",
    classification: "formula_derived",
    sourceType: "formula_layer",
    formula: "Lucro Líquido / Receita Operacional Líquida",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_formula_dependency",
    signConvention: "not_applicable",
    subtotalRole: "memo_only",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): net-margin ratio, memo/display row. includedInEbitda " +
      "omitted per contract — not applicable to net-income rows.",
  },

  // ── pnl_to_cash ────────────────────────────────────────────────────────────
  {
    dreLineId: "capex",
    displayLabelPt: "CAPEX",
    section: "pnl_to_cash",
    classification: "existing_engine_output",
    sourceType: "capex_engine",
    sourceEngine: "capexEngine.ts calculateCapex()",
    sourceField:
      "CapexEngineOutput schedule for the selected capexOptionId (e.g. " +
      "annualSchedulePositiveBRL / annualScheduleSignedBRL by period key, or " +
      "projectionYearCapexCashFlowSignedBRL by calendar year)",
    directScenarioDriver: false,
    scenarioSensitivity: "indirect_via_engine_dependency",
    signConvention: "negative_cost_or_deduction",
    subtotalRole: "component_line",
    horizon: "pre_ops + 2028-2047",
    preOpsTreatment: "included_pre_ops_value_exists",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "mapped_pending_engine_implementation",
    notes:
      "Phase 12B (Luciana): CAPEX is OUTSIDE EBITDA — includedInEbitda omitted per " +
      "contract (not applicable to pnl_to_cash rows) and explicitly excluded from " +
      "the EBITDA formula per Luciana's instruction. Sourced from the CAPEX engine " +
      "for the board-selected capexOptionId; unlike the engine's pre_ops + " +
      "2028–2047 horizon, the rest of this map's operating rows use the " +
      "2028–2047-only operating horizon — this mismatch is structural (CAPEX has " +
      "a pre-opening investment phase) and is already documented in " +
      "capexCalculationReadinessAudit.md, not a new finding.",
  },
  {
    dreLineId: "depreciacao",
    displayLabelPt: "Depreciação",
    section: "pnl_to_cash",
    classification: "downstream_cash_flow",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): cash-flow-bridge row — the Finance DRE template " +
      "places a 'Depreciação' line in the P&L-to-cash layer distinct from the " +
      "'Depreciação / Amortização' below-EBITDA assumption row above. This " +
      "duplication is recorded as the Finance DRE template presents it; the " +
      "relationship between the two rows (e.g. add-back in the operating " +
      "cash-flow bridge) is not yet defined and must not be assumed.",
  },
  {
    dreLineId: "despesa_financeira",
    displayLabelPt: "Despesa Financeira",
    section: "pnl_to_cash",
    classification: "downstream_cash_flow",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): cash-flow-bridge row — distinct from the 'Receita / " +
      "Despesa Financeira' below-EBITDA assumption row above (that row is signed/ " +
      "bidirectional; this row's exact relationship to it is not yet defined and " +
      "must not be assumed).",
  },
  {
    dreLineId: "fluxo_de_caixa_operacional",
    displayLabelPt: "Fluxo de Caixa Operacional",
    section: "pnl_to_cash",
    classification: "downstream_cash_flow",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): operating cash-flow bridge subtotal. Per the contract " +
      "header, no operating cash-flow bridge is implemented or designed in this " +
      "phase — row recorded for structural completeness only.",
  },
  {
    dreLineId: "fluxo_de_caixa_operacional_mais_capex",
    displayLabelPt: "Fluxo de Caixa Operacional + CAPEX",
    section: "pnl_to_cash",
    classification: "downstream_cash_flow",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "subtotal_or_total",
    horizon: "pre_ops + 2028-2047",
    preOpsTreatment: "included_pre_ops_value_exists",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): cash-flow-after-CAPEX row — the documented label " +
      "implies CAPEX is combined here, after EBITDA, exactly per Luciana's note " +
      "that 'CAPEX is outside EBITDA and enters after operating cash flow'. " +
      "horizon includes pre_ops because the CAPEX engine's schedule has a " +
      "pre-opening investment period; this is structural, not invented.",
  },
  {
    dreLineId: "fluxo_de_caixa_operacional_mais_capex_acumulado",
    displayLabelPt: "Fluxo de Caixa Operacional + CAPEX Acumulado",
    section: "pnl_to_cash",
    classification: "downstream_cash_flow",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "subtotal_or_total",
    horizon: "pre_ops + 2028-2047",
    preOpsTreatment: "included_pre_ops_value_exists",
    perpetuityTreatment: "excluded_horizon_ends_2047",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): cumulative cash-flow-after-CAPEX row — per the " +
      "contract header, 'No cumulative cash flow' is implemented or designed in " +
      "this phase; row recorded for structural completeness only.",
  },

  // ── valuation ──────────────────────────────────────────────────────────────
  {
    dreLineId: "dcf_anual",
    displayLabelPt: "DCF - Anual",
    section: "valuation",
    classification: "valuation_output",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "requires_future_definition",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): valuation-section row. Per the contract header, " +
      "'No DCF. No NPV.' is implemented or designed in this phase; recorded for " +
      "structural completeness only. Plausibly consumes the WACC driver-table row " +
      "as a discount rate, but that mapping is unconfirmed.",
  },
  {
    dreLineId: "dcf_acumulado",
    displayLabelPt: "DCF - Acumulado",
    section: "valuation",
    classification: "valuation_output",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "subtotal_or_total",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "requires_future_definition",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): cumulative DCF row. Per the contract header, 'No DCF. " +
      "No NPV.' is implemented or designed in this phase; recorded for structural " +
      "completeness only.",
  },
  {
    dreLineId: "payback",
    displayLabelPt: "Payback",
    section: "valuation",
    classification: "valuation_output",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "requires_future_definition",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): valuation-section row. Per the contract header, " +
      "'No payback. No discounted payback.' is implemented or designed in this " +
      "phase; recorded for structural completeness only.",
  },
  {
    dreLineId: "fator_desconto",
    displayLabelPt: "Fator Desconto",
    section: "valuation",
    classification: "valuation_output",
    sourceType: "pending_finance_source_confirmation",
    directScenarioDriver: false,
    scenarioSensitivity: "not_yet_determined",
    signConvention: "not_applicable",
    subtotalRole: "component_line",
    horizon: "2028-2047",
    preOpsTreatment: "excluded_no_pre_ops_value",
    perpetuityTreatment: "requires_future_definition",
    implementationStatus: "not_implemented",
    notes:
      "Phase 12B (Luciana): discount-factor row underlying the DCF rows above. " +
      "Plausibly derived from the WACC driver-table row, but that mapping is " +
      "unconfirmed — recorded for structural completeness only.",
  },
];

export const DRE_LINE_ITEM_MAP: readonly DreLineItemRecord[] = DRE_LINE_ITEM_MAP_DATA;

