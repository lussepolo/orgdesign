// Phase 15B-FCO-CAPEX-BRIDGE — CAPEX schedule engine contract.
//
// Defines the Expansion + Sustain CAPEX schedule for the selected R$90M /
// R$100M option, per the ratified visible-workbook methodology
// (phase15CapitalDecisionArchitecture.md S16.2):
//   - Expansion phasing: 70% pre_ops, 20% in 2030, 10% in 2031, 0% elsewhere,
//     scaled to the selected option total.
//   - Sustain CAPEX: SustainPct(year) x ROL(year), option-independent.

import type { CapexOptionId } from "./capexOptionSourceContract";
import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";

export interface CapexScheduleEngineInput {
  readonly capexOptionId: CapexOptionId;
  // ROL (receita_operacional_liquida) by projection year, 2028-2047,
  // sourced from dreEngine. No ROL exists for pre_ops.
  readonly rolByYear: Readonly<Record<number, number>>;
}

export interface CapexSchedulePeriodAmounts {
  readonly periodKey: CapitalDecisionPeriodKey;
  // >= 0
  readonly capexExpansionPositiveBRL: number;
  // >= 0
  readonly capexSustainPositiveBRL: number;
  // capexExpansionPositiveBRL + capexSustainPositiveBRL
  readonly capexTotalPositiveBRL: number;
  // <= 0, signed cash-flow convention
  readonly capexExpansionSignedBRL: number;
  // <= 0
  readonly capexSustainSignedBRL: number;
  // <= 0
  readonly capexTotalSignedBRL: number;
}

export interface CapexScheduleEngineOutput {
  readonly capexOptionId: CapexOptionId;
  // 90,000,000 or 100,000,000
  readonly totalCapexOptionPositiveBRL: number;
  // Exactly 21 entries: pre_ops followed by 2028..2047.
  readonly periods: readonly CapexSchedulePeriodAmounts[];
  // Sum of capexExpansionPositiveBRL across all periods. === totalCapexOptionPositiveBRL.
  readonly totalExpansionPositiveBRL: number;
  // Sum of capexSustainPositiveBRL across all periods (2028-2047).
  readonly totalSustainPositiveBRL: number;
}
