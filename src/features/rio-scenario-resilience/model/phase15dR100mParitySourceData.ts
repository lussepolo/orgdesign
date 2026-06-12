// Phase 15D-DISCOUNTED-PAYBACK — R$100M workbook-parity fixture data.
//
// Cached values extracted read-only (data_only=True/False, no .save()) from
// the visible workbook "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8
// (2).xlsx", sheet `PnL`, for the R$100M CAPEX option instance
// (AC21 = -100,000,000). Source rows/cells:
//   PnL!B307 (literal 0), PnL!C307:V307 (=IF(col306>0,0,1)), PnL!Z289 (VPL,
//   see PHASE15C_R100M_NPV_BRL), PnL!V306 (cumulative discounted cash flow at
//   2047, see PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[2047]),
//   PnL!Z290 ("Payback").
//
// For this scenario, PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL never
// becomes strictly positive for any period 2028-2047 (it remains negative
// through 2047, V306 = -18,153,646.635...), while
// PHASE15C_R100M_NPV_BRL = 20,349,793.483... >= 0 (VPL includes the terminal
// value PV, PnL!W305/Z283, which is excluded from row 307/recovery timing).
//
// Workbook Z290 = "20+" for this case under BOTH the workbook's >=20 formula
// AND the Phase-15D-corrected ratified rule (no recovery 2028-2047 -> "20+"
// regardless of which year would have triggered the workbook's >=20 edge
// case). This fixture therefore remains exact workbook-baseline parity.

// PnL!B307 (literal 0, pre_ops -- excluded from the operating-year recovery
// search by construction in discountedPaybackEngine.ts).
export const PHASE15D_R100M_PAYBACK_HELPER_PRE_OPS = 0;

// PnL!C307:V307 (2028-2047): IF(col306>0,0,1). All 20 values are 1 because
// PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[year] <= 0 for every
// year 2028-2047.
export const PHASE15D_R100M_PAYBACK_HELPER_OPERATING_YEARS: readonly number[] = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 2028-2037
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 2038-2047
];

// PnL!Z290 raw cached value for this scenario.
export const PHASE15D_R100M_WORKBOOK_Z290 = "20+";

// Expected Phase 15D engine outputs for this scenario (both under the
// workbook's >=20 formula and the Phase-15D-corrected ratified rule -- they
// coincide here because recovery never occurs 2028-2047).
export const PHASE15D_R100M_EXPECTED_STATUS = "not_reached_within_horizon" as const;
export const PHASE15D_R100M_EXPECTED_COMPACT_VALUE = "20+" as const;
export const PHASE15D_R100M_EXPECTED_DISCOUNTED_PAYBACK_YEARS = null;
