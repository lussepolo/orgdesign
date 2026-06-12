// Phase 15D-DISCOUNTED-PAYBACK — discounted-payback engine.
//
// Pure core (calculateDiscountedPayback) consumes Phase 15C's committed
// Phase15CResult (94f2ebb) and derives the workbook's PnL!Z290 ("Payback")
// outcome, applying the Phase 15D.1-audit-corrected "20+" rule (see
// discountedPaybackEngineContract.ts header).
//
// Production entry point (calculateDiscountedPaybackForCapitalDecision) calls
// calculatePhase15CInvestmentMetrics() (Phase 15C's production wrapper) and
// feeds its result into the core. Does NOT call dreEngine / receitaEngine /
// fopagEngine / capexScheduleEngine / ppeDepreciationEngine / nolTaxEngine /
// capitalDecisionEngine directly, and does NOT recalculate any Phase 15B or
// Phase 15C figure.

import { calculatePhase15CInvestmentMetrics } from "./phase15cInvestmentMetricsEngine";
import { PRE_OPS_PERIOD_KEY, SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type { CapitalDecisionEngineInput, CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";
import type { Phase15CResult } from "./phase15cInvestmentMetricsEngineContract";
import type {
  DiscountedPaybackEngineInput,
  DiscountedPaybackResult,
  DiscountedPaybackStatus,
  Phase15DExplicitExclusions,
  Phase15DSourceProvenance,
} from "./discountedPaybackEngineContract";

const EXPECTED_PERIOD_KEYS: readonly CapitalDecisionPeriodKey[] = [
  PRE_OPS_PERIOD_KEY,
  ...SIMULATOR_PROJECTION_YEARS,
];

const EXPLICIT_EXCLUSIONS: Phase15DExplicitExclusions = {
  simplePayback: "excluded",
  fractionalPayback: "excluded",
  workingCapital: "excluded",
  financingCashFlows: "excluded",
  tierInvestmentInterpretation: "excluded",
  investmentRecommendation: "excluded",
  uiInterpretation: "excluded",
  exportIntegration: "excluded",
  notes:
    "Phase 15D adds discounted payback (workbook-compatible compact value, " +
    "machine-readable status, and explanatory text) on top of Phase 15C's " +
    "DCF/VPL/TIR/terminal-value outputs. Simple payback, fractional payback, " +
    "working capital, financing cash flows, Tier/investment recommendation, " +
    "UI interpretation, and export integration remain out of scope for " +
    "Phase 15D (see Phase 15E/15F boundaries in IMPLEMENTATION.md).",
};

function buildSourceProvenance(): Phase15DSourceProvenance {
  return {
    workbookFile: "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx",
    visibleWorkbookSheet: "PnL",
    annualDiscountedCashFlowRow: "305 (DCF - Anual)",
    cumulativeDiscountedCashFlowRow: "306 (DCF - Acumulado)",
    paybackHelperRow: "307 (Payback: B307=0 literal, C307:V307=IF(col306>0,0,1))",
    workbookPaybackOutputCell:
      'Z290 (=IF(Z289<0,"NA",IF((SUM(B307:V307)+1)>=20,"20+",SUM(B307:V307)+1)))',
    phase15cCommit: "94f2ebb",
    ratifiedMethodologyDoc: "src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md",
    ratifiedSections: ["S16.5"],
    notes: [
      "Discounted payback uses Phase15CResult.periods[*].cumulativeDiscountedCashFlowBRL " +
        "(PnL row 306) for the 20 operating periods 2028-2047 " +
        "(Phase15CResult.periods[1..20]); pre_ops (periods[0]) anchors the " +
        "series but is excluded from the operating-year recovery search and " +
        "from the displayed operating-year count. The terminal value (PnL " +
        "column W) is excluded from recovery timing entirely; it affects " +
        "only Phase15CResult.npvBRL, which gates the NA check.",
      'The simulator preserves the ratified meaning that "20+" denotes no ' +
        "recovery within the projection horizon. The workbook formula uses " +
        '>=20 and would also classify recovery in the final operating year ' +
        '(2047) as "20+"; the simulator corrects that edge case so recovery ' +
        'in 2047 returns "20". This is a documented business-methodology ' +
        "correction, not workbook numerical parity for a synthetic year-20 " +
        "recovery case.",
      "The visible workbook performs no fractional/interpolated payback " +
        "calculation (row 307 is a binary 0/1 indicator per period); " +
        "discountedPaybackYears is therefore always an integer 1..20 or null.",
    ],
  };
}

function blocked(
  phase15CResult: Phase15CResult,
  status: DiscountedPaybackStatus,
  statusReason: string,
): DiscountedPaybackResult {
  return {
    capexOptionId: phase15CResult.capexOptionId,
    status,
    statusReason,
    discountedPaybackYears: null,
    compactValue: null,
    explanatoryValue: statusReason,
    recoveryPeriodKey: null,
    recoverySourceYear: null,
    npvBRL: phase15CResult.npvBRL,
    sourceProvenance: buildSourceProvenance(),
    integratedBaselineParityStatus: phase15CResult.integratedBaselineParityStatus,
    integratedBaselineParityNote: phase15CResult.integratedBaselineParityNote,
    explicitExclusions: EXPLICIT_EXCLUSIONS,
  };
}

export function calculateDiscountedPayback(input: DiscountedPaybackEngineInput): DiscountedPaybackResult {
  const { phase15CResult } = input;

  // §A -- technical readiness.
  if (phase15CResult.calculationStatus !== "calculated") {
    return blocked(
      phase15CResult,
      "blocked_missing_phase15c_inputs",
      `Phase 15C calculationStatus=${phase15CResult.calculationStatus} ` +
        `(${phase15CResult.calculationStatusReason}); discounted payback requires ` +
        "a calculated Phase 15C result (periods + npvBRL).",
    );
  }

  if (phase15CResult.npvBRL === null) {
    return blocked(
      phase15CResult,
      "blocked_missing_phase15c_inputs",
      "Phase 15C calculationStatus=\"calculated\" but npvBRL is null; discounted " +
        "payback cannot evaluate the NA gate.",
    );
  }

  const periods = phase15CResult.periods;
  if (periods.length !== EXPECTED_PERIOD_KEYS.length) {
    return blocked(
      phase15CResult,
      "invalid_cash_flow_series",
      `Expected ${EXPECTED_PERIOD_KEYS.length} periods (pre_ops + 2028-2047), got ${periods.length}.`,
    );
  }
  for (let i = 0; i < EXPECTED_PERIOD_KEYS.length; i++) {
    if (periods[i].periodKey !== EXPECTED_PERIOD_KEYS[i]) {
      return blocked(
        phase15CResult,
        "invalid_cash_flow_series",
        `Period ${i} has periodKey=${String(periods[i].periodKey)}, expected ${String(
          EXPECTED_PERIOD_KEYS[i],
        )} (pre_ops + 2028-2047, in order, no duplicates).`,
      );
    }
  }

  if (!Number.isFinite(phase15CResult.npvBRL)) {
    return blocked(phase15CResult, "invalid_cash_flow_series", "npvBRL is non-finite.");
  }
  for (const period of periods) {
    if (!Number.isFinite(period.cumulativeDiscountedCashFlowBRL)) {
      return blocked(
        phase15CResult,
        "invalid_cash_flow_series",
        `periods[periodKey=${String(period.periodKey)}].cumulativeDiscountedCashFlowBRL is non-finite.`,
      );
    }
  }

  const npvBRL = phase15CResult.npvBRL;

  // §B -- negative VPL (strict). npvBRL === 0 is NOT "NA".
  if (npvBRL < 0) {
    return {
      capexOptionId: phase15CResult.capexOptionId,
      status: "not_applicable_negative_npv",
      statusReason: `npvBRL=${npvBRL} < 0; discounted payback is not applicable for a negative-VPL scenario.`,
      discountedPaybackYears: null,
      compactValue: "NA",
      explanatoryValue: "Discounted payback is not applicable because the scenario has a negative VPL.",
      recoveryPeriodKey: null,
      recoverySourceYear: null,
      npvBRL,
      sourceProvenance: buildSourceProvenance(),
      integratedBaselineParityStatus: phase15CResult.integratedBaselineParityStatus,
      integratedBaselineParityNote: phase15CResult.integratedBaselineParityNote,
      explicitExclusions: EXPLICIT_EXCLUSIONS,
    };
  }

  // §C -- recovery search over the 20 operating periods (2028-2047,
  // periods[1..20]). pre_ops (periods[0]) is excluded. Strict > 0.
  for (let operatingYearIndex = 1; operatingYearIndex <= SIMULATOR_PROJECTION_YEARS.length; operatingYearIndex++) {
    const period = periods[operatingYearIndex];
    if (period.cumulativeDiscountedCashFlowBRL > 0) {
      return {
        capexOptionId: phase15CResult.capexOptionId,
        status: "calculated",
        statusReason:
          `cumulativeDiscountedCashFlowBRL > 0 first reached at periodKey=${String(period.periodKey)} ` +
          `(operating year ${operatingYearIndex}).`,
        discountedPaybackYears: operatingYearIndex,
        compactValue: String(operatingYearIndex),
        explanatoryValue:
          `Discounted payback is achieved in operating year ${operatingYearIndex}, ` +
          `corresponding to ${period.sourceYear}.`,
        recoveryPeriodKey: period.periodKey,
        recoverySourceYear: period.sourceYear,
        npvBRL,
        sourceProvenance: buildSourceProvenance(),
        integratedBaselineParityStatus: phase15CResult.integratedBaselineParityStatus,
        integratedBaselineParityNote: phase15CResult.integratedBaselineParityNote,
        explicitExclusions: EXPLICIT_EXCLUSIONS,
      };
    }
  }

  // §D -- not reached within the explicit 2028-2047 horizon.
  return {
    capexOptionId: phase15CResult.capexOptionId,
    status: "not_reached_within_horizon",
    statusReason:
      `npvBRL=${npvBRL} >= 0, but no period in 2028-2047 has cumulativeDiscountedCashFlowBRL > 0.`,
    discountedPaybackYears: null,
    compactValue: "20+",
    explanatoryValue:
      "Discounted payback is not achieved within the 20-year operating projection horizon from 2028 through 2047.",
    recoveryPeriodKey: null,
    recoverySourceYear: null,
    npvBRL,
    sourceProvenance: buildSourceProvenance(),
    integratedBaselineParityStatus: phase15CResult.integratedBaselineParityStatus,
    integratedBaselineParityNote: phase15CResult.integratedBaselineParityNote,
    explicitExclusions: EXPLICIT_EXCLUSIONS,
  };
}

export function calculateDiscountedPaybackForCapitalDecision(
  input: CapitalDecisionEngineInput,
): DiscountedPaybackResult {
  const phase15CResult = calculatePhase15CInvestmentMetrics(input);
  return calculateDiscountedPayback({ phase15CResult });
}
