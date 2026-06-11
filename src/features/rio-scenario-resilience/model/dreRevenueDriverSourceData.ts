import type { DreRevenueDriverSourceDataContract } from "./dreRevenueDriverSourceDataContract";

// DRE revenue-block driver source-data — Phase 12K (2026-06-09).
//
// Source-of-truth: Finance PnL spreadsheet, sheet "PnL", workbook
// "Concept Rio - 20 anos". All 6 driver records are now fully populated.
//
// Phase 12J (2026-06-08): typed records created; percentual_desconto_medio
// values extracted; 5 records left value-pending.
// Phase 12K (2026-06-09): all 5 previously pending annualValuesByYear records
// populated from dre_revenue_driver_values_2028_2047_extracted_from_pnl.json.
// All 6 records now carry exactly 20 annual values (2028–2047), 120 total.
//
// Scope: 2028–2047 only. No Perpetuidade. No DRE engine. No EBITDA engine.
// No calculation. No UI. CALCULATION_CAN_BEGIN remains false.

export const DRE_REVENUE_DRIVER_SOURCE_DATA = {
  phase: "12K",
  extractedAt: "2026-06-09",

  discountAuthorityResolution:
    "DISCOUNT AUTHORITY SETTLED FOR DRE (Phase 12J): PnL % Desconto Médio " +
    "(row 222, -12% for 2028-2032, -12.5% for 2033-2047) is the canonical DRE " +
    "revenue-block source for the Bolsa de Estudos discount. " +
    "DISCOUNT_SCHEDULE_SOURCE (receitaEngine.ts averageEffectiveDiscountRate, " +
    "20%→12.5% ramp) is NOT used by the DRE revenue block — it serves the " +
    "scenario-resilience Receita engine only and is preserved as audit/legacy. " +
    "The two mechanisms must NOT be collapsed. Finance reconciliation of the two " +
    "schedules is deferred — cross-mechanism unification remains a future-phase " +
    "decision. This is a DRE authority settlement only, not a global resolution.",

  receitaEngineRoleAfterExtraction:
    "receitaEngine.ts netReceitaAfterDiscount remains audit_only (Phase 12I " +
    "classification, unchanged in Phase 12J). The DRE revenue formula chain does " +
    "not depend on netReceitaAfterDiscount as a feed or component. It may serve " +
    "as an audit cross-check for the regular-tuition-and-discount sub-piece " +
    "pending Finance confirmation of unit bases and discount rates. No DRE " +
    "subtotal is derived from netReceitaAfterDiscount.",

  driverIds: [
    "percentual_desconto_medio",
    "percentual_deducoes",
    "desconto_metodo",
    "adesao_upselling",
    "ticket_medio_upselling",
    "ticket_material",
  ],

  records: [
    {
      driverId: "percentual_desconto_medio",
      displayLabelPt: "% Desconto Médio",
      sourceSheet: "PnL",
      sourceRow: 222,
      classification: "pnl_spreadsheet_direct_value",
      usedByDreLineIds: ["bolsa_de_estudos"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: -0.12,
        2029: -0.12,
        2030: -0.12,
        2031: -0.12,
        2032: -0.12,
        2033: -0.125,
        2034: -0.125,
        2035: -0.125,
        2036: -0.125,
        2037: -0.125,
        2038: -0.125,
        2039: -0.125,
        2040: -0.125,
        2041: -0.125,
        2042: -0.125,
        2043: -0.125,
        2044: -0.125,
        2045: -0.125,
        2046: -0.125,
        2047: -0.125,
      },
      formulaPattern:
        "C228 = C222 × C225 (Bolsa de Estudos = % Desconto Médio × Receitas com " +
        "Ensino Regular, signed negative); C222 is a direct spreadsheet input value",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      discountAuthorityNote:
        "DRE canonical source for Bolsa de Estudos. DISCOUNT_SCHEDULE_SOURCE " +
        "(receitaEngine.ts averageEffectiveDiscountRate, 20%→12.5% ramp) is the " +
        "Receita engine's mechanism — a structurally analogous but DIFFERENT " +
        "schedule; must not be collapsed into this PnL driver. The divergence " +
        "(-12%/-12.5% vs. 20%→12.5%) is preserved as audit evidence. " +
        "Cross-mechanism unification is a future Finance decision, deferred.",
      notes:
        "Phase 12I (2026-06-08): UPDATED from missing_source_or_formula to " +
        "spreadsheet_source_formula_confirmed in dreRevenueBlockReconciliation.ts. " +
        "Phase 12J (2026-06-08): typed source-data record created; annual values " +
        "extracted from PnL row 222 (-12% for 2028-2032, -12.5% for 2033-2047). " +
        "DRE discount authority settled: PnL row 222 is canonical for the DRE " +
        "revenue block. DISCOUNT_SCHEDULE_SOURCE is NOT the DRE discount source " +
        "(see discountAuthorityNote). No DRE engine. No EBITDA engine.",
    },
    {
      driverId: "percentual_deducoes",
      displayLabelPt: "% Deduções",
      sourceSheet: "PnL",
      sourceRow: 12,
      classification: "pnl_back_derived_rate",
      usedByDreLineIds: ["deducoes"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 0.058173523721561475,
        2029: 0.058173523721561475,
        2030: 0.058173523721561475,
        2031: 0.058173523721561475,
        2032: 0.058173523721561475,
        2033: 0.058173523721561475,
        2034: 0.058173523721561475,
        2035: 0.058173523721561475,
        2036: 0.058173523721561475,
        2037: 0.058173523721561475,
        2038: 0.058173523721561475,
        2039: 0.058173523721561475,
        2040: 0.058173523721561475,
        2041: 0.058173523721561475,
        2042: 0.058173523721561475,
        2043: 0.058173523721561475,
        2044: 0.058173523721561475,
        2045: 0.058173523721561475,
        2046: 0.058173523721561475,
        2047: 0.058173523721561475,
      },
      preOpsValue: 0.058173523721561475,
      formulaPattern:
        "Back-derived from historical: Z12 = -Y235 / Y234 (= -Deduções / Receita " +
        "Operacional Antes das Deduções); applied as C$12 in C235 = -C$12 × C234",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      notes:
        "Phase 12I (2026-06-08): formula structure confirmed from spreadsheet " +
        "inspection (C235 = -C$12 × C234; Z12 = -Y235 / Y234). Phase 12J " +
        "(2026-06-08): typed source-data record created. Phase 12K (2026-06-09): " +
        "annual rate values (PnL!C12:V12, 2028–2047) extracted from " +
        "dre_revenue_driver_values_2028_2047_extracted_from_pnl.json; constant " +
        "rate 0.058173523721561475 across all 20 projection years; preOpsValue " +
        "from Z12 = 0.058173523721561475. No DRE engine. No EBITDA engine.",
    },
    {
      driverId: "desconto_metodo",
      displayLabelPt: "Desconto Método",
      sourceSheet: "PnL",
      sourceRow: 13,
      classification: "pnl_back_derived_rate",
      usedByDreLineIds: ["descontos_metodo_de_assinatura"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 0.028242752948432766,
        2029: 0.028242752948432766,
        2030: 0.028242752948432766,
        2031: 0.028242752948432766,
        2032: 0.028242752948432766,
        2033: 0.028242752948432766,
        2034: 0.028242752948432766,
        2035: 0.028242752948432766,
        2036: 0.028242752948432766,
        2037: 0.028242752948432766,
        2038: 0.028242752948432766,
        2039: 0.028242752948432766,
        2040: 0.028242752948432766,
        2041: 0.028242752948432766,
        2042: 0.028242752948432766,
        2043: 0.028242752948432766,
        2044: 0.028242752948432766,
        2045: 0.028242752948432766,
        2046: 0.028242752948432766,
        2047: 0.028242752948432766,
      },
      preOpsValue: 0.028242752948432766,
      formulaPattern:
        "Back-derived from historical: Z13 = -Y230 / Y225 (= -Descontos Método / " +
        "Receitas com Ensino Regular); applied as C$13 in C230 = -C$13 × C225",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      notes:
        "Phase 12I (2026-06-08): formula structure confirmed from spreadsheet " +
        "inspection (C230 = -C$13 × C225; Z13 = -Y230 / Y225). Phase 12J " +
        "(2026-06-08): typed source-data record created. Phase 12K (2026-06-09): " +
        "annual rate values (PnL!C13:V13, 2028–2047) extracted from " +
        "dre_revenue_driver_values_2028_2047_extracted_from_pnl.json; constant " +
        "rate 0.028242752948432766 across all 20 projection years; preOpsValue " +
        "from Z13 = 0.028242752948432766. No DRE engine. No EBITDA engine.",
    },
    {
      driverId: "adesao_upselling",
      displayLabelPt: "Adesão Upselling",
      sourceSheet: "PnL",
      sourceRow: 16,
      classification: "pnl_benchmark_derived",
      usedByDreLineIds: ["receitas_com_upselling"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 0.24821246169560776,
        2029: 0.24821246169560776,
        2030: 0.24821246169560776,
        2031: 0.24821246169560776,
        2032: 0.24821246169560776,
        2033: 0.24821246169560776,
        2034: 0.24821246169560776,
        2035: 0.24821246169560776,
        2036: 0.24821246169560776,
        2037: 0.24821246169560776,
        2038: 0.24821246169560776,
        2039: 0.24821246169560776,
        2040: 0.24821246169560776,
        2041: 0.24821246169560776,
        2042: 0.24821246169560776,
        2043: 0.24821246169560776,
        2044: 0.24821246169560776,
        2045: 0.24821246169560776,
        2046: 0.24821246169560776,
        2047: 0.24821246169560776,
      },
      preOpsValue: 0.24821246169560776,
      formulaPattern:
        "Benchmark-derived driver value (PnL row 16 = C16); role in Receitas com " +
        "Upselling formula: C226 = (C16 × C221) × C17",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      notes:
        "Phase 12I (2026-06-08): formula structure confirmed — driver position and " +
        "formula role confirmed from spreadsheet inspection (C226 = (C16 × C221) × C17). " +
        "Phase 12J (2026-06-08): typed source-data record created. Phase 12K " +
        "(2026-06-09): annual benchmark values (PnL!C16:V16, 2028–2047) extracted " +
        "from dre_revenue_driver_values_2028_2047_extracted_from_pnl.json; constant " +
        "rate 0.24821246169560776 across all 20 projection years; preOpsValue from " +
        "Z16 = 0.24821246169560776. No Receita-engine analogue exists " +
        "(receitaEngine.ts has no upselling concept). No DRE engine. No EBITDA engine.",
    },
    {
      driverId: "ticket_medio_upselling",
      displayLabelPt: "Ticket Médio Upselling",
      sourceSheet: "PnL",
      sourceRow: 17,
      classification: "pnl_formula_indexed_from_base",
      usedByDreLineIds: ["receitas_com_upselling"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 7217.576934334133,
        2029: 7624.648273430577,
        2030: 8054.678436052062,
        2031: 8508.962299845398,
        2032: 8988.867773556678,
        2033: 9495.839915985274,
        2034: 10031.405287246844,
        2035: 10597.176545447566,
        2036: 11194.85730261081,
        2037: 11826.24725447806,
        2038: 12493.247599630622,
        2039: 13197.86676424979,
        2040: 13942.226449753478,
        2041: 14728.568021519573,
        2042: 15559.259257933278,
        2043: 16436.801480080714,
        2044: 17363.837083557268,
        2045: 18343.157495069896,
        2046: 19377.711577791837,
        2047: 20470.614510779298,
      },
      preOpsValue: 6832.238673167486,
      formulaPattern:
        "B17 = Z17 × (1 + B7)^2 (base year: historical Z17 × two-year escalation); " +
        "2029+: D17 = prior year × (1 + Reajuste Serviços, row 7)",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      notes:
        "Phase 12I (2026-06-08): formula structure confirmed from spreadsheet " +
        "inspection (B17 = Z17 × (1 + B7)^2; 2029+: D17 = C17 × (1 + D7)). " +
        "Phase 12J (2026-06-08): typed source-data record created. Phase 12K " +
        "(2026-06-09): annual ticket values (PnL!C17:V17, 2028–2047) extracted from " +
        "dre_revenue_driver_values_2028_2047_extracted_from_pnl.json; escalating " +
        "series (BRL/unit) indexed by Reajuste Serviços (row 7); preOpsValue = " +
        "6832.238673167486 (PnL pre-ops B17 = Z17 × (1 + B7)^2). No Receita-engine " +
        "analogue exists (receitaEngine.ts has no upselling-ticket concept). " +
        "No DRE engine. No EBITDA engine.",
    },
    {
      driverId: "ticket_material",
      displayLabelPt: "Ticket Material",
      sourceSheet: "PnL",
      sourceRow: 223,
      sourceRange: "$C$20",
      classification: "pnl_formula_indexed_from_base",
      usedByDreLineIds: ["receita_com_material_didatico"],
      projectionYears: "2028-2047",
      annualValuesByYear: {
        2028: 555.33,
        2029: 586.650612,
        2030: 619.7377065168,
        2031: 654.6909131643475,
        2032: 691.6154806668168,
        2033: 730.6225937764252,
        2034: 771.8297080654156,
        2035: 815.360903600305,
        2036: 861.3472585633623,
        2037: 909.9272439463359,
        2038: 961.2471405049092,
        2039: 1015.4614792293861,
        2040: 1072.7335066579235,
        2041: 1133.2356764334304,
        2042: 1197.150168584276,
        2043: 1264.6694380924291,
        2044: 1335.9967944008422,
        2045: 1411.3470136050496,
        2046: 1490.9469851723743,
        2047: 1575.0363951360962,
      },
      formulaPattern:
        "C223 = $C$20 (2028 base value from Finance cell); D223 = C223 × (1 + D8) " +
        "(2029+: indexed by Reajuste Material from row 8)",
      valueSourceStatus: "extracted_from_pnl_spreadsheet",
      canonicalForDreRevenueBlock: true,
      notes:
        "Phase 12I (2026-06-08): formula structure confirmed from spreadsheet " +
        "inspection (C223 = $C$20 for 2028; D223 = C223 × (1 + D8) for 2029+). " +
        "Source basis: PnL row 223 with 2028 base value from Finance cell $C$20. " +
        "Phase 12J (2026-06-08): typed source-data record created. Phase 12K " +
        "(2026-06-09): annual ticket values (PnL!C223:V223, 2028–2047) extracted " +
        "from dre_revenue_driver_values_2028_2047_extracted_from_pnl.json; " +
        "escalating series (BRL/unit) indexed by Reajuste Material (row 8); 2028 " +
        "base = 555.33 (Finance cell $C$20). No Receita-engine analogue exists " +
        "(no 'Material' label in TUITION_SOURCE_RECORDS — labels are grade-bands). " +
        "No DRE engine. No EBITDA engine.",
    },
  ],

  openFinanceValueItems: [
    "[RESOLVED — Phase 12K (2026-06-09)] percentual_deducoes: annual rate values (C$12) " +
      "for 2028-2047 — back-derivation formula confirmed (Z12 = -Y235 / Y234); values " +
      "extracted from PnL!C12:V12; constant rate 0.058173523721561475 all 20 years.",
    "[RESOLVED — Phase 12K (2026-06-09)] desconto_metodo: annual rate values (C$13) for " +
      "2028-2047 — back-derivation formula confirmed (Z13 = -Y230 / Y225); values " +
      "extracted from PnL!C13:V13; constant rate 0.028242752948432766 all 20 years.",
    "[RESOLVED — Phase 12K (2026-06-09)] adesao_upselling: annual benchmark-derived " +
      "adoption rate (PnL row 16) for 2028-2047 — formula role confirmed " +
      "(C226 = (C16 × C221) × C17); values extracted from PnL!C16:V16; constant " +
      "rate 0.24821246169560776 all 20 years.",
    "[RESOLVED — Phase 12K (2026-06-09)] ticket_medio_upselling: annual ticket values " +
      "(PnL row 17) for 2028-2047 — formula confirmed (B17 = Z17 × (1 + B7)^2; 2029+: " +
      "× (1 + Reajuste Serviços)); values extracted from PnL!C17:V17; escalating series " +
      "from 7217.58 (2028) to 20470.61 (2047).",
    "[RESOLVED — Phase 12K (2026-06-09)] ticket_material: annual ticket values (PnL row " +
      "223 / cell $C$20) for 2028-2047 — formula confirmed (C223 = $C$20; 2029+: " +
      "× (1 + Reajuste Material)); values extracted from PnL!C223:V223; escalating " +
      "series from 555.33 (2028) to 1575.04 (2047).",
  ],
} satisfies DreRevenueDriverSourceDataContract;
