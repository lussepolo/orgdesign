// Phase 15B-FCO-CAPEX-BRIDGE — CAPEX schedule engine.
//
// Implements the ratified visible-workbook CAPEX schedule
// (phase15CapitalDecisionArchitecture.md S16.2, Resolution 2/3,
// 2026-06-12):
//   - Expansion: 70% pre_ops, 20% in 2030, 10% in 2031, 0% elsewhere,
//     scaled to the selected option total (PnL!292, 70/20/10 phasing
//     confirmed against B/E/F columns of the R$100M workbook instance).
//   - Sustain: SustainPct(year) x ROL(year) (PnL!293, confirmed against
//     C293 = -C236 x 2%).
//
// CAPEX never changes EBITDA: rolByYear is consumed read-only from
// dreEngine output and is not recalculated here.

import {
  PRE_OPS_PERIOD_KEY,
  SIMULATOR_PROJECTION_YEARS,
} from "./simulatorProjectionHorizonContract";
import { CAPEX_KNOWN_OPTION_AMOUNTS } from "./capexEngineValidationContract";
import type {
  CapexSchedulePeriodAmounts,
  CapexScheduleEngineInput,
  CapexScheduleEngineOutput,
} from "./capexScheduleEngineContract";
import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";

// Expansion phasing as a fraction of the selected option total.
// PnL!292 (R$100M): B=-70,000,000 (70%), E(2030)=-20,000,000 (20%), F(2031)=-10,000,000 (10%).
const EXPANSION_PHASING_BY_PERIOD: ReadonlyMap<CapitalDecisionPeriodKey, number> = new Map<
  CapitalDecisionPeriodKey,
  number
>([
  [PRE_OPS_PERIOD_KEY, 0.7],
  [2030, 0.2],
  [2031, 0.1],
]);

// Sustain CAPEX as a percentage of ROL, by projection year.
function sustainPercentForYear(year: number): number {
  if (year >= 2028 && year <= 2031) return 0.02;
  if (year >= 2032 && year <= 2035) return 0.025;
  if (year >= 2036 && year <= 2039) return 0.03;
  if (year >= 2040 && year <= 2043) return 0.035;
  if (year >= 2044 && year <= 2047) return 0.04;
  return 0;
}

function buildPeriod(
  periodKey: CapitalDecisionPeriodKey,
  capexExpansionPositiveBRL: number,
  capexSustainPositiveBRL: number,
): CapexSchedulePeriodAmounts {
  const capexTotalPositiveBRL = capexExpansionPositiveBRL + capexSustainPositiveBRL;
  return {
    periodKey,
    capexExpansionPositiveBRL,
    capexSustainPositiveBRL,
    capexTotalPositiveBRL,
    capexExpansionSignedBRL: -capexExpansionPositiveBRL,
    capexSustainSignedBRL: -capexSustainPositiveBRL,
    capexTotalSignedBRL: -capexTotalPositiveBRL,
  };
}

export function calculateCapexSchedule(
  input: CapexScheduleEngineInput,
): CapexScheduleEngineOutput {
  const totalCapexOptionPositiveBRL = CAPEX_KNOWN_OPTION_AMOUNTS[input.capexOptionId];

  const periods: CapexSchedulePeriodAmounts[] = [];
  let totalExpansionPositiveBRL = 0;
  let totalSustainPositiveBRL = 0;

  const preOpsExpansion =
    (EXPANSION_PHASING_BY_PERIOD.get(PRE_OPS_PERIOD_KEY) ?? 0) * totalCapexOptionPositiveBRL;
  periods.push(buildPeriod(PRE_OPS_PERIOD_KEY, preOpsExpansion, 0));
  totalExpansionPositiveBRL += preOpsExpansion;

  for (const year of SIMULATOR_PROJECTION_YEARS) {
    const expansion = (EXPANSION_PHASING_BY_PERIOD.get(year) ?? 0) * totalCapexOptionPositiveBRL;
    const rol = input.rolByYear[year] ?? 0;
    const sustain = sustainPercentForYear(year) * rol;
    periods.push(buildPeriod(year, expansion, sustain));
    totalExpansionPositiveBRL += expansion;
    totalSustainPositiveBRL += sustain;
  }

  return {
    capexOptionId: input.capexOptionId,
    totalCapexOptionPositiveBRL,
    periods,
    totalExpansionPositiveBRL,
    totalSustainPositiveBRL,
  };
}
