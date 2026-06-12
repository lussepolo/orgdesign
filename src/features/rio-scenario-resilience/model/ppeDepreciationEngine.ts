// Phase 15B-FCO-CAPEX-BRIDGE — PP&E depreciation engine.
//
// Implements the visible `PPE` sheet methodology exactly
// (phase15CapitalDecisionArchitecture.md S16.3, Resolution 1, 2026-06-12):
//
//   - Existing / pre-ops asset base = preOpsExpansionCapexPositiveBRL,
//     straight-line over 15 years, zero residual, starting in 2028
//     (years 2028-2042 inclusive).
//   - Each projection year Y's total CAPEX (expansion + sustain) becomes a
//     new 10-year vintage with the workbook's half-year convention:
//       - year Y:        vintage / 20
//       - years Y+1..Y+9: vintage / 10 each
//       - year Y+10:     vintage / 20
//
// Verified against R$100M workbook cached values (PnL!C275/D275):
//   2028: 70,000,000/15 + 457,034.28/20 = 4,689,518.38  (cached: -4,689,518.38)
//   2029: 70,000,000/15 + 602,913.71/20 + 457,034.28/10 = 4,742,515.79
//                                                          (cached: -4,742,515.78)

import {
  PRE_OPS_PERIOD_KEY,
  SIMULATOR_PROJECTION_START_YEAR,
  SIMULATOR_PROJECTION_YEARS,
} from "./simulatorProjectionHorizonContract";
import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";
import type {
  PpeDepreciationEngineInput,
  PpeDepreciationEngineOutput,
} from "./ppeDepreciationEngineContract";

const EXISTING_PPE_USEFUL_LIFE_YEARS = 15;
const CAPEX_VINTAGE_USEFUL_LIFE_YEARS = 10;

export function calculatePpeDepreciation(
  input: PpeDepreciationEngineInput,
): PpeDepreciationEngineOutput {
  const existingBaseAnnualDep =
    input.preOpsExpansionCapexPositiveBRL / EXISTING_PPE_USEFUL_LIFE_YEARS;
  const existingBaseLastYear =
    SIMULATOR_PROJECTION_START_YEAR + EXISTING_PPE_USEFUL_LIFE_YEARS - 1; // 2042

  const depreciationByPeriod: Record<CapitalDecisionPeriodKey, number> = {
    [PRE_OPS_PERIOD_KEY]: 0,
  } as Record<CapitalDecisionPeriodKey, number>;

  for (const year of SIMULATOR_PROJECTION_YEARS) {
    let totalDep = 0;

    if (year <= existingBaseLastYear) {
      totalDep += existingBaseAnnualDep;
    }

    for (const vintageYear of SIMULATOR_PROJECTION_YEARS) {
      if (vintageYear > year) continue;
      const vintageTotal = input.totalCapexPositiveByYear[vintageYear] ?? 0;
      if (vintageTotal === 0) continue;

      const fullYearAmount = vintageTotal / CAPEX_VINTAGE_USEFUL_LIFE_YEARS;
      const halfYearAmount = fullYearAmount / 2;
      const lastVintageYear = vintageYear + CAPEX_VINTAGE_USEFUL_LIFE_YEARS;

      if (year === vintageYear || year === lastVintageYear) {
        totalDep += halfYearAmount;
      } else if (year > vintageYear && year < lastVintageYear) {
        totalDep += fullYearAmount;
      }
    }

    depreciationByPeriod[year] = -totalDep;
  }

  return { depreciationAmortizationSignedByPeriod: depreciationByPeriod };
}
