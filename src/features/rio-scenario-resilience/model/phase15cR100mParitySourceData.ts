// Phase 15C-DCF-VPL-TIR-PERPETUITY — R$100M workbook-parity fixture data.
//
// Cached values extracted read-only (data_only=True, no .save()) from the
// visible workbook "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8
// (2).xlsx", sheet `PnL`, for the R$100M CAPEX option instance
// (AC21 = -100,000,000). Source rows:
//   PnL!286 (period index, 1..21), B6/C6:V6 (WACC by period), 308 (discount
//   factor, recursive cumulative product), 305 (discounted cash flow), 306
//   (cumulative discounted cash flow), 278 (perpetuity WACC), 279
//   (perpetuity growth), 280/282 (terminal net income), 281 (terminal value
//   at 2047), 283 (terminal value present value), 289 (VPL), 288 (TIR).
//
// All 21 fcoAfterCapexBRL inputs are R100M_FCO_AFTER_CAPEX_BRL from
// capitalDecisionR100mParitySourceData.ts (PnL!295) -- not duplicated here.
// The terminal net income (PnL!Z280/Z282) equals R100M_NET_INCOME_BRL[2047]
// from the same file.
//
// Values below were derived by replaying the Phase 15C formulas (recursive
// discount-factor product, Gordon Growth terminal value, IRR on the 22-entry
// series) against R100M_FCO_AFTER_CAPEX_BRL / R100M_NET_INCOME_BRL and the
// canonical drivers (preOpsWaccRate=0.1325, operatingPeriodWaccRate=0.12,
// perpetuityGrowthRate=0.035), and independently cross-checked against the
// workbook anchors documented at the bottom of this file
// (PHASE15C_R100M_WORKBOOK_ANCHORS).

import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";

// PnL!B6 (pre_ops, 13.25%) and PnL!C6:V6 (2028-2047, 12% each).
export const PHASE15C_R100M_WACC_RATE: Readonly<Record<CapitalDecisionPeriodKey, number>> = {
  pre_ops: 0.1325,
  2028: 0.12,
  2029: 0.12,
  2030: 0.12,
  2031: 0.12,
  2032: 0.12,
  2033: 0.12,
  2034: 0.12,
  2035: 0.12,
  2036: 0.12,
  2037: 0.12,
  2038: 0.12,
  2039: 0.12,
  2040: 0.12,
  2041: 0.12,
  2042: 0.12,
  2043: 0.12,
  2044: 0.12,
  2045: 0.12,
  2046: 0.12,
  2047: 0.12,
};

// PnL!B308:V308 -- discountFactor[1] = 1 + wacc[1]; discountFactor[i] =
// discountFactor[i-1] * (1 + wacc[i]) for i = 2..21.
export const PHASE15C_R100M_DISCOUNT_FACTOR: Readonly<Record<CapitalDecisionPeriodKey, number>> = {
  pre_ops: 1.1325,
  2028: 1.2684000000000002,
  2029: 1.4206080000000003,
  2030: 1.5910809600000004,
  2031: 1.7820106752000007,
  2032: 1.995851956224001,
  2033: 2.2353541909708814,
  2034: 2.5035966938873875,
  2035: 2.804028297153874,
  2036: 3.1405116928123396,
  2037: 3.5173730959498206,
  2038: 3.9394578674637994,
  2039: 4.412192811559456,
  2040: 4.941655948946591,
  2041: 5.534654662820183,
  2042: 6.198813222358606,
  2043: 6.942670809041639,
  2044: 7.775791306126636,
  2045: 8.708886262861833,
  2046: 9.753952614405254,
  2047: 10.924426928133885,
};

// PnL!B305:V305 = R100M_FCO_AFTER_CAPEX_BRL[period] / discountFactor[period].
export const PHASE15C_R100M_DISCOUNTED_CASH_FLOW_BRL: Readonly<Record<CapitalDecisionPeriodKey, number>> = {
  pre_ops: -77410614.71234003,
  2028: -3698246.2923623184,
  2029: -2451614.0325126634,
  2030: -12685249.92813545,
  2031: -3985012.9500129786,
  2032: 4440428.474319172,
  2033: 6146861.984443397,
  2034: 7613178.970486771,
  2035: 7739615.22417672,
  2036: 7159295.964964828,
  2037: 6794457.379466176,
  2038: 6411707.3940318525,
  2039: 5426027.8684582645,
  2040: 4912109.173712405,
  2041: 4541431.953448014,
  2042: 4258698.246138867,
  2043: 3789632.0317805056,
  2044: 3482213.6094767065,
  2045: 3296245.029173802,
  2046: 3117904.7157935975,
  2047: 2947283.260259517,
};

// PnL!B306:V306 -- running sum of PHASE15C_R100M_DISCOUNTED_CASH_FLOW_BRL.
// PnL!V306 (2047, final cumulative) = -18,153,646.635... (workbook anchor).
export const PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL: Readonly<Record<CapitalDecisionPeriodKey, number>> = {
  pre_ops: -77410614.71234003,
  2028: -81108861.00470234,
  2029: -83560475.03721501,
  2030: -96245724.96535046,
  2031: -100230737.91536345,
  2032: -95790309.44104427,
  2033: -89643447.45660087,
  2034: -82030268.4861141,
  2035: -74290653.26193738,
  2036: -67131357.29697256,
  2037: -60336899.91750638,
  2038: -53925192.52347453,
  2039: -48499164.655016266,
  2040: -43587055.48130386,
  2041: -39045623.52785585,
  2042: -34786925.28171699,
  2043: -30997293.249936484,
  2044: -27515079.640459776,
  2045: -24218834.611285973,
  2046: -21100929.895492375,
  2047: -18153646.63523286,
};

// PnL!Z280 / Z282 -- 2047 net income (R100M_NET_INCOME_BRL[2047]).
export const PHASE15C_R100M_TERMINAL_NET_INCOME_BRL = 34544329.98522629;

// PnL!Z278 (= V6) and PnL!Z279.
export const PHASE15C_R100M_PERPETUITY_WACC_RATE = 0.12;
export const PHASE15C_R100M_PERPETUITY_GROWTH_RATE = 0.035;

// PnL!Z281 = terminalNetIncomeBRL * (1 + g) / (WACC - g).
export const PHASE15C_R100M_TERMINAL_VALUE_AT_2047_BRL = 420628018.05540246;

// PnL!Z283 = Z281 / discountFactor[2047].
export const PHASE15C_R100M_TERMINAL_VALUE_PRESENT_VALUE_BRL = 38503440.118414916;

// PnL!Z289 = V306 (cumulative discounted cash flow) + Z283 (terminal value PV).
export const PHASE15C_R100M_NPV_BRL = 20349793.483182058;

// PnL!Z288 = IRR(B295:W295), where W295 is the terminal value (entry 21,
// exponent 21 in the 22-entry series).
export const PHASE15C_R100M_TIR_RATE = 0.13261290577612572;

// Workbook anchors (raw cell values, for documentation / spot-check; the
// PHASE15C_R100M_* constants above already reflect these to full available
// precision).
export const PHASE15C_R100M_WORKBOOK_ANCHORS = {
  cumulativeDiscountedCashFlowAt2047_V306: -18153646.635, // PnL!V306
  terminalValueAt2047_Z281: 420628018.055, // PnL!Z281
  terminalValuePresentValue_Z283: 38503440.118, // PnL!Z283
  npv_Z289: 20349793.483, // PnL!Z289
  tir_Z288: 0.132612905776, // PnL!Z288
} as const;
