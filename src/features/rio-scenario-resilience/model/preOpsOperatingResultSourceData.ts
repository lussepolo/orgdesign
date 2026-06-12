// Phase 15B-FCO-CAPEX-BRIDGE — pre-ops operating result source data.
//
// Source: visible workbook "Concept Rio - 20 anos - Org BU - Apresentacao
// vBU v8 (2).xlsx", sheets `PnL` (column B = pre-ops / 2027) and `Pre-Ops`.
//
// PnL!B273 (EBITDA) = B245 (Margem de Contribuicao) + B265 (Total Custos e
// Despesas Fixas) + B271 (Total Despesas com Vendas), each computed via
// SUMIFS('Pre-Ops'!$G:$G, 'Pre-Ops'!$H:$H, "<" & 2028) over the visible
// `Pre-Ops` sheet's 2027 cost/revenue records.
//
// This value is a fixed literal transcribed from the audited workbook
// instance (read-only). It is NOT scenario-derived: the workbook provides
// no scenario-dependent pre-ops model, so it does not vary by occupancy,
// tuition, opening package, or org-design scenario selection.

import { PRE_OPS_PERIOD_KEY } from "./simulatorProjectionHorizonContract";
import type { PreOpsOperatingResultSourceRecord } from "./preOpsOperatingResultSourceDataContract";

export const PRE_OPS_OPERATING_RESULT_SOURCE: PreOpsOperatingResultSourceRecord = {
  periodKey: PRE_OPS_PERIOD_KEY,
  sourceYear: 2027,
  ebitdaBRL: -17_667_521.16172509,
  depreciationAmortizationBRL: 0,
  financialResultBRL: 0,
  sourceWorkbookFile: "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx",
  sourceSheets: ["PnL", "Pre-Ops"],
  sourceFormulaDescription:
    "PnL!B273 = B245 + B265 + B271, each computed via " +
    "SUMIFS('Pre-Ops'!$G:$G, 'Pre-Ops'!$H:$H, \"<2028\") over the visible " +
    "'Pre-Ops' sheet's literal 2027 cost/revenue records. PnL!B275 (D&A) " +
    "and PnL!B277 (financial result) are blank/zero for the pre-ops column.",
  provenanceNote:
    "Ratified per Phase 15B.1 gate resolution (Resolution 2, 2026-06-12): " +
    "included in the capital-decision bridge as the pre_ops period " +
    "(source year 2027), surrounding the committed 2028-2047 operating " +
    "horizon. Not scenario-derived -- this value is fixed regardless of " +
    "the selected occupancy/tuition/opening-package/org-design/CAPEX scenario.",
};
