// Phase 15C-DCF-VPL-TIR-PERPETUITY — investment metrics engine (orchestrator).
//
// Pure core (computePhase15CInvestmentMetricsCore) consumes Phase 15B's
// committed CapitalDecisionResult + the canonical Phase 15C driver source
// and produces DCF periods, terminal value, VPL (NPV), and TIR (IRR).
//
// Production entry point (calculatePhase15CInvestmentMetrics) calls
// calculateCapitalDecisionBridge() (Phase 15B's orchestrator) and feeds its
// result, together with CAPITAL_DECISION_DRIVER_SOURCE, into the core.
//
// Does NOT call dreEngine / receitaEngine / fopagEngine / capexScheduleEngine
// / ppeDepreciationEngine / nolTaxEngine, and does NOT recalculate any
// Phase 15B figure (ROL, FOPAG, EBITDA, D&A, tax/NOL, FCO, CAPEX,
// fcoAfterCapexBRL, netIncomeBRL).

import { calculateCapitalDecisionBridge } from "./capitalDecisionEngine";
import { CAPITAL_DECISION_DRIVER_SOURCE } from "./capitalDecisionDriverSourceData";
import { calculateDiscountedCashFlow } from "./discountedCashFlowEngine";
import { calculateTerminalValue } from "./terminalValueEngine";
import { calculateIrr } from "./irrEngine";
import type { CapitalDecisionEngineInput, CapitalDecisionResult } from "./capitalDecisionEngineContract";
import type { DiscountedCashFlowPeriodResult } from "./discountedCashFlowEngineContract";
import type { TerminalValueResult } from "./terminalValueEngineContract";
import type {
  Phase15CCalculationStatus,
  Phase15CCoreInput,
  Phase15CExplicitExclusions,
  Phase15CResult,
  Phase15CSourceProvenance,
} from "./phase15cInvestmentMetricsEngineContract";

const EXPLICIT_EXCLUSIONS: Phase15CExplicitExclusions = {
  workingCapital: "excluded",
  financingCashFlows: "excluded",
  simplePayback: "excluded",
  discountedPayback: "excluded",
  tierInvestmentInterpretation: "excluded",
  uiInterpretation: "excluded",
  notes:
    "Phase 15C adds DCF, VPL (NPV), TIR (IRR), and Gordon Growth terminal " +
    "value/perpetuity on top of Phase 15B's FCO-after-CAPEX bridge. Working " +
    "capital, financing cash flows, simple/discounted payback, and " +
    "Tier/investment/UI interpretation remain out of scope for Phase 15C " +
    "(see Phase 15D/15E boundaries in IMPLEMENTATION.md).",
};

const NOT_BLOCKED_TERMINAL_VALUE: TerminalValueResult = {
  status: "blocked_invalid_wacc_growth",
  statusReason: "Not computed: Phase 15B inputs were not structurally calculated.",
  finalProjectionYear: 2047,
  terminalNetIncomeBRL: null,
  perpetuityGrowthRate: null,
  perpetuityWaccRate: null,
  terminalValueAt2047BRL: null,
  terminalValuePresentValueBRL: null,
};

function buildSourceProvenance(capitalDecisionResult: CapitalDecisionResult): Phase15CSourceProvenance {
  const driverProvenance = CAPITAL_DECISION_DRIVER_SOURCE.provenance;
  return {
    workbookFile: driverProvenance.workbookFile,
    visibleWorkbookSheet: driverProvenance.visibleWorkbookSheet,
    ratifiedMethodologyDoc: driverProvenance.ratifiedMethodologyDoc,
    ratifiedSections: driverProvenance.ratifiedSections,
    notes: [
      `WACC drivers: PnL!${driverProvenance.preOpsWaccCell} (pre_ops, ${CAPITAL_DECISION_DRIVER_SOURCE.preOpsWaccRate}), ` +
        `PnL!${driverProvenance.operatingPeriodWaccCellRange} (2028-2047, ${CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate}).`,
      `Perpetuity growth: PnL!${driverProvenance.perpetuityGrowthCell} (${CAPITAL_DECISION_DRIVER_SOURCE.perpetuityGrowthRate}). ` +
        `Perpetuity WACC: PnL!${driverProvenance.perpetuityWaccCell} (= final-projection-year WACC).`,
      "VPL source cell: PnL!Z289. TIR source cell: PnL!Z288. " +
        "Terminal value source cells: PnL!Z280-Z283 (numerator = 2047 net income, " +
        "PnL!V282 -- the perpetual depreciation add-back and assumed perpetual " +
        "Sustain CAPEX cancel exactly, so PnL!W295 reduces to PnL!Z281; this " +
        "engine does not separately model either term).",
      `Phase 15B source: ${capitalDecisionResult.sourceProvenance.workbookFile}, ` +
        `sheets ${capitalDecisionResult.sourceProvenance.visibleWorkbookSheets.join(", ")}.`,
    ],
  };
}

function blockedResult(
  capitalDecisionResult: CapitalDecisionResult,
  status: Phase15CCalculationStatus,
  reason: string,
  periods: readonly DiscountedCashFlowPeriodResult[],
  terminalValue: TerminalValueResult,
): Phase15CResult {
  return {
    capexOptionId: capitalDecisionResult.capexOptionId,
    periods,
    terminalValue,
    npvBRL: null,
    irrRate: null,
    irrStatus: "did_not_converge",
    irrStatusReason: reason,
    irrMultipleRootsPossible: false,
    calculationStatus: status,
    calculationStatusReason: reason,
    sourceProvenance: buildSourceProvenance(capitalDecisionResult),
    phase15CFormulaParityStatus: "formula_validated",
    integratedBaselineParityStatus: capitalDecisionResult.integratedBaselineParityStatus,
    integratedBaselineParityNote: capitalDecisionResult.integratedBaselineParityNote,
    explicitExclusions: EXPLICIT_EXCLUSIONS,
  };
}

export function computePhase15CInvestmentMetricsCore(input: Phase15CCoreInput): Phase15CResult {
  const { capitalDecisionResult, driverSource } = input;

  if (capitalDecisionResult.calculationReadiness !== "structurally_calculated") {
    return blockedResult(
      capitalDecisionResult,
      "blocked_missing_phase15b_inputs",
      `Phase 15B calculationReadiness=${capitalDecisionResult.calculationReadiness} ` +
        `(${capitalDecisionResult.calculationReadinessReason}); Phase 15C cannot compute DCF/terminal ` +
        "value/VPL/IRR without finite fcoAfterCapexBRL/netIncomeBRL for all 21 periods.",
      [],
      NOT_BLOCKED_TERMINAL_VALUE,
    );
  }

  // §2 -- 21-period discounted cash flow (PnL!B305:V306 / B308:V308 equivalent).
  const dcf = calculateDiscountedCashFlow({
    periods: capitalDecisionResult.periods,
    preOpsWaccRate: driverSource.preOpsWaccRate,
    operatingPeriodWaccRate: driverSource.operatingPeriodWaccRate,
  });

  const finalPeriod2047 = capitalDecisionResult.periods.find((p) => p.periodKey === 2047);
  const finalDcf2047 = dcf.periods.find((p) => p.periodKey === 2047);
  if (!finalPeriod2047 || !finalDcf2047) {
    throw new Error("computePhase15CInvestmentMetricsCore: 2047 period missing from Phase 15B/DCF results.");
  }

  // §3 -- Gordon Growth terminal value (PnL!Z280:Z283). Perpetuity WACC =
  // final-projection-year WACC (operatingPeriodWaccRate, PnL!Z278 = V6).
  const terminalValue = calculateTerminalValue({
    terminalNetIncomeBRL: finalPeriod2047.netIncomeBRL,
    perpetuityGrowthRate: driverSource.perpetuityGrowthRate,
    perpetuityWaccRate: driverSource.operatingPeriodWaccRate,
    finalYearDiscountFactor: finalDcf2047.discountFactor,
  });

  if (terminalValue.status === "blocked_invalid_wacc_growth") {
    return blockedResult(
      capitalDecisionResult,
      "blocked_invalid_wacc_growth",
      `Terminal value blocked: ${terminalValue.statusReason}`,
      dcf.periods,
      terminalValue,
    );
  }

  // §7 -- VPL (PnL!Z289): sum of explicit discounted cash flows (PnL!V306)
  // plus the terminal value present value (PnL!Z283). One canonical field.
  const cumulativeExplicit = dcf.periods.reduce((sum, p) => sum + p.discountedCashFlowBRL, 0);
  const npvBRL = cumulativeExplicit + (terminalValue.terminalValuePresentValueBRL as number);

  // §8 -- TIR (PnL!Z288 = IRR(B295:W295)): 22-entry series, UNDISCOUNTED
  // fcoAfterCapexBRL for pre_ops..2047 (exponents 0..20) followed by the
  // terminal value at 2047 (exponent 21). Distinct from the DCF's 1-based
  // period indexing above.
  const irrCashFlows = [
    ...capitalDecisionResult.periods.map((p) => p.fcoAfterCapexBRL),
    terminalValue.terminalValueAt2047BRL as number,
  ];
  const irr = calculateIrr({ cashFlows: irrCashFlows });

  return {
    capexOptionId: capitalDecisionResult.capexOptionId,
    periods: dcf.periods,
    terminalValue,
    npvBRL,
    irrRate: irr.irrRate,
    irrStatus: irr.status,
    irrStatusReason: irr.statusReason,
    irrMultipleRootsPossible: irr.multipleRootsPossible,
    calculationStatus: "calculated",
    calculationStatusReason:
      "DCF, terminal value, and VPL calculated from Phase 15B's committed " +
      "fcoAfterCapexBRL/netIncomeBRL and the canonical Phase 15C WACC/perpetuity drivers. " +
      (irr.status === "calculated"
        ? "IRR calculated."
        : `IRR unavailable (irrStatus=${irr.status}) -- does not invalidate DCF/VPL.`),
    sourceProvenance: buildSourceProvenance(capitalDecisionResult),
    phase15CFormulaParityStatus: "formula_validated",
    integratedBaselineParityStatus: capitalDecisionResult.integratedBaselineParityStatus,
    integratedBaselineParityNote: capitalDecisionResult.integratedBaselineParityNote,
    explicitExclusions: EXPLICIT_EXCLUSIONS,
  };
}

export function calculatePhase15CInvestmentMetrics(input: CapitalDecisionEngineInput): Phase15CResult {
  const capitalDecisionResult = calculateCapitalDecisionBridge(input);
  return computePhase15CInvestmentMetricsCore({
    capitalDecisionResult,
    driverSource: CAPITAL_DECISION_DRIVER_SOURCE,
  });
}
