// Shared simulator projection horizon constants.
// Phase 11A (2026-06-07): canonical policy horizon for the board-readiness simulator.
// All operating engines should align to SIMULATOR_PROJECTION_YEARS (2028–2047) when
// their source data supports it.
//
// Current alignment status:
//   Service Contracts  — ALIGNED: source has explicit 2028–2047 values (Phase 11A).
//   CAPEX              — ALIGNED: pre_ops + 2028–2047 (Phase 10C.1).
//   Receita            — BLOCKED: enrollment records stop at 2037 (no carry-forward source data).
//   FOPAG              — BLOCKED: EY/LS section counts depend on enrollment (stops at 2037);
//                        MS/HS active-grade records use isCarryForwardYear guard (stops at 2037).
//   FOPAG/Receita      — BLOCKED: blocked by both Receita and FOPAG.
//
// Do not resolve the Receita/FOPAG/ratio blockers without explicit Finance-approved
// carry-forward enrollment and active-grade records for 2038–2047.
// Do not invent or placeholder enrollment values.

export const SIMULATOR_PROJECTION_START_YEAR = 2028 as const;
export const SIMULATOR_PROJECTION_END_YEAR = 2047 as const;

export const SIMULATOR_PROJECTION_YEARS = [
  2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037,
  2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047,
] as const;

export const SIMULATOR_PROJECTION_YEAR_COUNT = 20 as const;

export type SimulatorProjectionYear = (typeof SIMULATOR_PROJECTION_YEARS)[number];

// CAPEX additionally includes a pre-opening period before the 20 projection years.
export const PRE_OPS_PERIOD_KEY = "pre_ops" as const;
export const CAPEX_PERIOD_COUNT = 21 as const;
