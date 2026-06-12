// Phase 15C-DCF-VPL-TIR-PERPETUITY — investment metrics engine validation.
//
// Four independent validation surfaces:
//
// 1. R$100M workbook-formula parity (phase15c_r100m_*): feeds
//    computeCapitalDecisionBridgeCore() with the workbook's own cached
//    PnL!236/273 (ROL/EBITDA) values (capitalDecisionR100mParitySourceData.ts
//    -- the same inputs Phase 15B's r100m_* checks use), then runs
//    calculateDiscountedCashFlow / calculateTerminalValue / calculateIrr on
//    the resulting periods and compares against
//    phase15cR100mParitySourceData.ts (extracted from PnL!286/305/306/308 and
//    Z278/Z279/Z280-Z283/Z288/Z289).
//
// 2. R$90M structural validation (phase15c_r90m_*): same workbook-cached
//    ROL/EBITDA inputs, capexOptionId="capex_90m_brl" (no cached R$90M
//    workbook baseline exists -- structural invariants only, mirroring
//    Phase 15B's r90m_* surface).
//
// 3. Solver validation (phase15c_irr_*): calculateIrr() against synthetic
//    cash-flow series covering single-root, no-sign-change, multiple-root,
//    Newton-convergence, bisection-fallback, non-convergence, near-(-1)
//    domain, and determinism cases.
//
// 4. Boundary validation (phase15c_no_phase15b_input_mutation,
//    phase15c_result_has_21_periods_and_terminal_value,
//    phase15c_explicit_exclusions_present,
//    phase15c_irr_unavailable_does_not_remove_npv,
//    phase15c_invalid_wacc_growth_blocks_terminal_and_npv): exercises
//    computePhase15CInvestmentMetricsCore() / calculatePhase15CInvestmentMetrics()
//    for the production-engine invariants required by Phase 15C §11.

import { computeCapitalDecisionBridgeCore, calculateCapitalDecisionBridge } from "./capitalDecisionEngine";
import { CAPITAL_DECISION_DRIVER_SOURCE } from "./capitalDecisionDriverSourceData";
import { calculateDiscountedCashFlow } from "./discountedCashFlowEngine";
import { calculateTerminalValue } from "./terminalValueEngine";
import { calculateIrr } from "./irrEngine";
import { computePhase15CInvestmentMetricsCore } from "./phase15cInvestmentMetricsEngine";
import {
  R100M_ROL_BRL,
  R100M_EBITDA_BRL,
} from "./capitalDecisionR100mParitySourceData";
import {
  PHASE15C_R100M_WACC_RATE,
  PHASE15C_R100M_DISCOUNT_FACTOR,
  PHASE15C_R100M_DISCOUNTED_CASH_FLOW_BRL,
  PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL,
  PHASE15C_R100M_TERMINAL_NET_INCOME_BRL,
  PHASE15C_R100M_TERMINAL_VALUE_AT_2047_BRL,
  PHASE15C_R100M_TERMINAL_VALUE_PRESENT_VALUE_BRL,
  PHASE15C_R100M_NPV_BRL,
  PHASE15C_R100M_TIR_RATE,
} from "./phase15cR100mParitySourceData";
import { PRE_OPS_PERIOD_KEY, SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type { CapitalDecisionPeriodKey, CapitalDecisionResult } from "./capitalDecisionEngineContract";
import type { DiscountedCashFlowPeriodResult } from "./discountedCashFlowEngineContract";
import type {
  Phase15CValidationCheckId,
  Phase15CValidationCheckResult,
  Phase15CValidationReport,
} from "./phase15cInvestmentMetricsEngineValidationContract";

const VALIDATION_INPUT_BASE = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience",
};

const TOLERANCE_BRL = 0.01;
const TOLERANCE_DISCOUNT_FACTOR = 1e-6;
const TOLERANCE_RATE = 1e-6;

function pass(checkId: Phase15CValidationCheckId, note: string): Phase15CValidationCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: Phase15CValidationCheckId, note: string): Phase15CValidationCheckResult {
  return { checkId, pass: false, note };
}
function closeWithin(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) <= tolerance;
}

const ALL_PERIOD_KEYS: readonly CapitalDecisionPeriodKey[] = [PRE_OPS_PERIOD_KEY, ...SIMULATOR_PROJECTION_YEARS];

function dcfByPeriod(
  periods: readonly DiscountedCashFlowPeriodResult[],
): Map<CapitalDecisionPeriodKey, DiscountedCashFlowPeriodResult> {
  return new Map(periods.map((p) => [p.periodKey, p]));
}

export function runPhase15CInvestmentMetricsValidation(): Phase15CValidationReport {
  const checks: Phase15CValidationCheckResult[] = [];

  // ── Surface 1 & 2 setup: bridge core fed with workbook-cached ROL/EBITDA ──

  const core100m = computeCapitalDecisionBridgeCore({
    capexOptionId: "capex_100m_brl",
    rolByYear: R100M_ROL_BRL,
    ebitdaByYear: R100M_EBITDA_BRL,
  });
  const core90m = computeCapitalDecisionBridgeCore({
    capexOptionId: "capex_90m_brl",
    rolByYear: R100M_ROL_BRL,
    ebitdaByYear: R100M_EBITDA_BRL,
  });

  const driverInput = {
    preOpsWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.preOpsWaccRate,
    operatingPeriodWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
  };

  const dcf100m = calculateDiscountedCashFlow({ periods: core100m.periods, ...driverInput });
  const dcf90m = calculateDiscountedCashFlow({ periods: core90m.periods, ...driverInput });

  const dcf100mByPeriod = dcfByPeriod(dcf100m.periods);
  const dcf90mByPeriod = dcfByPeriod(dcf90m.periods);

  const finalPeriod2047_100m = core100m.periods.find((p) => p.periodKey === 2047)!;
  const finalDcf2047_100m = dcf100mByPeriod.get(2047)!;
  const tv100m = calculateTerminalValue({
    terminalNetIncomeBRL: finalPeriod2047_100m.netIncomeBRL,
    perpetuityGrowthRate: CAPITAL_DECISION_DRIVER_SOURCE.perpetuityGrowthRate,
    perpetuityWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
    finalYearDiscountFactor: finalDcf2047_100m.discountFactor,
  });

  const finalPeriod2047_90m = core90m.periods.find((p) => p.periodKey === 2047)!;
  const finalDcf2047_90m = dcf90mByPeriod.get(2047)!;
  const tv90m = calculateTerminalValue({
    terminalNetIncomeBRL: finalPeriod2047_90m.netIncomeBRL,
    perpetuityGrowthRate: CAPITAL_DECISION_DRIVER_SOURCE.perpetuityGrowthRate,
    perpetuityWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
    finalYearDiscountFactor: finalDcf2047_90m.discountFactor,
  });

  // ── Surface 1: R$100M workbook-formula parity ────────────────────────────

  {
    const mismatches: string[] = [];
    dcf100m.periods.forEach((p, i) => {
      if (p.periodIndex !== i + 1) {
        mismatches.push(`${String(p.periodKey)}: periodIndex=${p.periodIndex}, expected ${i + 1}`);
      }
    });
    checks.push(
      mismatches.length === 0
        ? pass("phase15c_r100m_period_indices", "periodIndex = 1..21 in order pre_ops, 2028..2047")
        : fail("phase15c_r100m_period_indices", `periodIndex mismatches: ${mismatches.join("; ")}`),
    );
  }

  {
    const mismatches: string[] = [];
    for (const key of ALL_PERIOD_KEYS) {
      const actual = dcf100mByPeriod.get(key)!.periodWaccRate;
      const expected = PHASE15C_R100M_WACC_RATE[key];
      if (!closeWithin(actual, expected, TOLERANCE_RATE)) {
        mismatches.push(`${String(key)}: actual=${actual}, expected=${expected}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass("phase15c_r100m_wacc_rates_all_periods", `WACC rates match PnL!B6/C6:V6 for all 21 periods (tol=${TOLERANCE_RATE})`)
        : fail("phase15c_r100m_wacc_rates_all_periods", `WACC mismatches: ${mismatches.join("; ")}`),
    );
  }

  {
    const mismatches: string[] = [];
    for (const key of ALL_PERIOD_KEYS) {
      const actual = dcf100mByPeriod.get(key)!.discountFactor;
      const expected = PHASE15C_R100M_DISCOUNT_FACTOR[key];
      if (!closeWithin(actual, expected, TOLERANCE_DISCOUNT_FACTOR)) {
        mismatches.push(`${String(key)}: actual=${actual}, expected=${expected}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass(
            "phase15c_r100m_discount_factors_all_periods",
            `Discount factors match PnL!B308:V308 for all 21 periods (tol=${TOLERANCE_DISCOUNT_FACTOR})`,
          )
        : fail("phase15c_r100m_discount_factors_all_periods", `Discount factor mismatches: ${mismatches.join("; ")}`),
    );
  }

  {
    const mismatches: string[] = [];
    for (const key of ALL_PERIOD_KEYS) {
      const actual = dcf100mByPeriod.get(key)!.discountedCashFlowBRL;
      const expected = PHASE15C_R100M_DISCOUNTED_CASH_FLOW_BRL[key];
      if (!closeWithin(actual, expected, TOLERANCE_BRL)) {
        mismatches.push(`${String(key)}: actual=${actual}, expected=${expected}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass(
            "phase15c_r100m_discounted_cash_flows_all_periods",
            `Discounted cash flows match PnL!B305:V305 for all 21 periods (tol=${TOLERANCE_BRL})`,
          )
        : fail("phase15c_r100m_discounted_cash_flows_all_periods", `Discounted cash flow mismatches: ${mismatches.join("; ")}`),
    );
  }

  {
    const mismatches: string[] = [];
    for (const key of ALL_PERIOD_KEYS) {
      const actual = dcf100mByPeriod.get(key)!.cumulativeDiscountedCashFlowBRL;
      const expected = PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[key];
      if (!closeWithin(actual, expected, TOLERANCE_BRL)) {
        mismatches.push(`${String(key)}: actual=${actual}, expected=${expected}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass(
            "phase15c_r100m_cumulative_discounted_cash_flows_all_periods",
            `Cumulative discounted cash flows match PnL!B306:V306 for all 21 periods (tol=${TOLERANCE_BRL}, V306 anchor=${PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[2047]})`,
          )
        : fail(
            "phase15c_r100m_cumulative_discounted_cash_flows_all_periods",
            `Cumulative discounted cash flow mismatches: ${mismatches.join("; ")}`,
          ),
    );
  }

  checks.push(
    closeWithin(finalPeriod2047_100m.netIncomeBRL, PHASE15C_R100M_TERMINAL_NET_INCOME_BRL, TOLERANCE_BRL)
      ? pass("phase15c_r100m_2047_terminal_net_income", `2047 net income = ${finalPeriod2047_100m.netIncomeBRL} (PnL!V282/Z280)`)
      : fail(
          "phase15c_r100m_2047_terminal_net_income",
          `2047 net income = ${finalPeriod2047_100m.netIncomeBRL}, expected ${PHASE15C_R100M_TERMINAL_NET_INCOME_BRL}`,
        ),
  );

  checks.push(
    tv100m.status === "calculated" &&
      closeWithin(tv100m.terminalValueAt2047BRL as number, PHASE15C_R100M_TERMINAL_VALUE_AT_2047_BRL, TOLERANCE_BRL)
      ? pass("phase15c_r100m_terminal_value", `terminalValueAt2047BRL = ${tv100m.terminalValueAt2047BRL} (PnL!Z281)`)
      : fail(
          "phase15c_r100m_terminal_value",
          `terminalValueAt2047BRL = ${tv100m.terminalValueAt2047BRL}, expected ${PHASE15C_R100M_TERMINAL_VALUE_AT_2047_BRL} (status=${tv100m.status})`,
        ),
  );

  checks.push(
    tv100m.status === "calculated" &&
      closeWithin(
        tv100m.terminalValuePresentValueBRL as number,
        PHASE15C_R100M_TERMINAL_VALUE_PRESENT_VALUE_BRL,
        TOLERANCE_BRL,
      )
      ? pass("phase15c_r100m_terminal_value_present_value", `terminalValuePresentValueBRL = ${tv100m.terminalValuePresentValueBRL} (PnL!Z283)`)
      : fail(
          "phase15c_r100m_terminal_value_present_value",
          `terminalValuePresentValueBRL = ${tv100m.terminalValuePresentValueBRL}, expected ${PHASE15C_R100M_TERMINAL_VALUE_PRESENT_VALUE_BRL}`,
        ),
  );

  const npv100m =
    dcf100m.periods.reduce((sum, p) => sum + p.discountedCashFlowBRL, 0) + (tv100m.terminalValuePresentValueBRL as number);

  checks.push(
    closeWithin(npv100m, PHASE15C_R100M_NPV_BRL, TOLERANCE_BRL)
      ? pass("phase15c_r100m_npv", `VPL (NPV) = ${npv100m} (PnL!Z289)`)
      : fail("phase15c_r100m_npv", `VPL (NPV) = ${npv100m}, expected ${PHASE15C_R100M_NPV_BRL}`),
  );

  {
    const irrSeries100m = [...core100m.periods.map((p) => p.fcoAfterCapexBRL), tv100m.terminalValueAt2047BRL as number];
    const irr100m = calculateIrr({ cashFlows: irrSeries100m });
    checks.push(
      irr100m.status === "calculated" && closeWithin(irr100m.irrRate as number, PHASE15C_R100M_TIR_RATE, TOLERANCE_RATE)
        ? pass("phase15c_r100m_tir", `TIR (IRR) = ${irr100m.irrRate} (PnL!Z288)`)
        : fail("phase15c_r100m_tir", `TIR (IRR) = ${irr100m.irrRate}, expected ${PHASE15C_R100M_TIR_RATE} (status=${irr100m.status})`),
    );
  }

  // ── Surface 2: R$90M structural validation ───────────────────────────────

  {
    const mismatches: string[] = [];
    for (const key of ALL_PERIOD_KEYS) {
      const r90 = dcf90mByPeriod.get(key)!.periodWaccRate;
      const r100 = dcf100mByPeriod.get(key)!.periodWaccRate;
      if (!closeWithin(r90, r100, TOLERANCE_RATE) || !closeWithin(r90, PHASE15C_R100M_WACC_RATE[key], TOLERANCE_RATE)) {
        mismatches.push(`${String(key)}: r90m=${r90}, r100m=${r100}, canonical=${PHASE15C_R100M_WACC_RATE[key]}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass("phase15c_r90m_same_wacc_growth_source", "R$90M and R$100M DCF use the identical canonical WACC source for all 21 periods")
        : fail("phase15c_r90m_same_wacc_growth_source", `WACC source mismatches: ${mismatches.join("; ")}`),
    );
  }

  const npv90m =
    dcf90m.periods.reduce((sum, p) => sum + p.discountedCashFlowBRL, 0) + (tv90m.terminalValuePresentValueBRL as number);

  {
    const differingPeriods = ALL_PERIOD_KEYS.filter((key) => {
      const r90 = dcf90mByPeriod.get(key)!.discountedCashFlowBRL;
      const r100 = dcf100mByPeriod.get(key)!.discountedCashFlowBRL;
      return !closeWithin(r90, r100, TOLERANCE_BRL);
    });
    checks.push(
      differingPeriods.length > 0 && tv90m.status === "calculated"
        ? pass(
            "phase15c_r90m_dcf_recomputed_from_r90m_cashflows",
            `R$90M discounted cash flows recomputed from R$90M fcoAfterCapexBRL (differ from R$100M in ${differingPeriods.length}/21 periods); ` +
              `R$90M terminal value calculated from R$90M 2047 net income (${finalPeriod2047_90m.netIncomeBRL})`,
          )
        : fail(
            "phase15c_r90m_dcf_recomputed_from_r90m_cashflows",
            `Expected R$90M discounted cash flows to differ from R$100M's; differingPeriods=${differingPeriods.length}, tv90m.status=${tv90m.status}`,
          ),
    );
  }

  checks.push(
    !closeWithin(npv90m, PHASE15C_R100M_NPV_BRL, TOLERANCE_BRL)
      ? pass("phase15c_r90m_no_r100m_cached_leakage", `R$90M VPL (${npv90m}) differs from R$100M cached VPL (${PHASE15C_R100M_NPV_BRL}) -- no cached-output leakage`)
      : fail("phase15c_r90m_no_r100m_cached_leakage", `R$90M VPL equals R$100M cached VPL (${npv90m})`),
  );

  {
    const core90mRepeat = computeCapitalDecisionBridgeCore({
      capexOptionId: "capex_90m_brl",
      rolByYear: R100M_ROL_BRL,
      ebitdaByYear: R100M_EBITDA_BRL,
    });
    const dcf90mRepeat = calculateDiscountedCashFlow({ periods: core90mRepeat.periods, ...driverInput });
    const same = JSON.stringify(dcf90m) === JSON.stringify(dcf90mRepeat);
    checks.push(
      same
        ? pass("phase15c_r90m_deterministic_repeated_calls", "Two R$90M DCF computations with identical inputs produced identical output")
        : fail("phase15c_r90m_deterministic_repeated_calls", "Repeated R$90M DCF computations with identical inputs produced different output"),
    );
  }

  // ── Surface 3: IRR solver validation ─────────────────────────────────────

  {
    const result = calculateIrr({ cashFlows: [-1000, 300, 300, 300, 300, 300] });
    checks.push(
      result.status === "calculated" && closeWithin(result.irrRate as number, 0.15238236619611117, TOLERANCE_RATE)
        ? pass("phase15c_irr_standard_single_root", `[-1000,300,300,300,300,300] -> irrRate=${result.irrRate} (status=${result.status})`)
        : fail("phase15c_irr_standard_single_root", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    const result = calculateIrr({ cashFlows: [100, 200, 300] });
    checks.push(
      result.status === "no_sign_change" && result.irrRate === null
        ? pass("phase15c_irr_all_positive_no_sign_change", `[100,200,300] -> status=${result.status}, irrRate=null`)
        : fail("phase15c_irr_all_positive_no_sign_change", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    const result = calculateIrr({ cashFlows: [-100, -200, -300] });
    checks.push(
      result.status === "no_sign_change" && result.irrRate === null
        ? pass("phase15c_irr_all_negative_no_sign_change", `[-100,-200,-300] -> status=${result.status}, irrRate=null`)
        : fail("phase15c_irr_all_negative_no_sign_change", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    // Classic dual-root series (roots at 10% and 20%): -100 + 230/(1+r) - 132/(1+r)^2.
    const result = calculateIrr({ cashFlows: [-100, 230, -132] });
    checks.push(
      result.status === "calculated" && result.multipleRootsPossible === true && closeWithin(result.irrRate as number, 0.1, TOLERANCE_RATE)
        ? pass("phase15c_irr_multiple_sign_changes", `[-100,230,-132] -> irrRate=${result.irrRate}, multipleRootsPossible=true (deterministic seed-0.10 root)`)
        : fail("phase15c_irr_multiple_sign_changes", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    const result = calculateIrr({ cashFlows: [-1000, 300, 300, 300, 300, 300] });
    checks.push(
      result.status === "calculated" && result.statusReason.includes("Newton-Raphson converged")
        ? pass("phase15c_irr_newton_convergence", `Newton-Raphson converged in ${result.iterations} iterations from seed 0.10`)
        : fail("phase15c_irr_newton_convergence", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    // Newton's first step from seed 0.10 jumps past rate <= -1 (derivative
    // near-singular); resolved via deterministic bracket search + bisection.
    // True root is r = -0.999 (1000 - 1/(1+r) = 0 => 1+r = 0.001).
    const result = calculateIrr({ cashFlows: [1000, -1] });
    checks.push(
      result.status === "calculated" && result.statusReason.includes("bracket search + bisection") && closeWithin(result.irrRate as number, -0.999, 1e-4)
        ? pass("phase15c_irr_bisection_fallback", `[1000,-1] -> irrRate=${result.irrRate} via bracket search + bisection`)
        : fail("phase15c_irr_bisection_fallback", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    // Root (~1e30 - 1) lies far outside the (MIN_RATE, 10] bracket scan range.
    const result = calculateIrr({ cashFlows: [-1, 1e30] });
    checks.push(
      result.status === "did_not_converge" && result.irrRate === null
        ? pass("phase15c_irr_did_not_converge", `[-1, 1e30] -> status=did_not_converge after ${result.iterations} iterations`)
        : fail("phase15c_irr_did_not_converge", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    // Root is r = -0.999 (10000 - 1/(1+r) = 0 => 1+r = 0.0001), close to the
    // rate-domain boundary (-1) but still > MIN_RATE.
    const result = calculateIrr({ cashFlows: [10000, -1] });
    checks.push(
      result.status === "calculated" && (result.irrRate as number) > -1 && (result.irrRate as number) < -0.99
        ? pass("phase15c_irr_rate_domain_near_negative_one", `[10000,-1] -> irrRate=${result.irrRate} (> -1, near domain boundary)`)
        : fail("phase15c_irr_rate_domain_near_negative_one", `unexpected result: ${JSON.stringify(result)}`),
    );
  }

  {
    const a = calculateIrr({ cashFlows: [-1000, 300, 300, 300, 300, 300] });
    const b = calculateIrr({ cashFlows: [-1000, 300, 300, 300, 300, 300] });
    checks.push(
      JSON.stringify(a) === JSON.stringify(b)
        ? pass("phase15c_irr_deterministic_output", "Two calculateIrr() calls with identical input produced identical output")
        : fail("phase15c_irr_deterministic_output", "Repeated calculateIrr() calls with identical input produced different output"),
    );
  }

  // ── Surface 4: boundary / scope validation (production orchestrator) ────

  const productionResult: CapitalDecisionResult = calculateCapitalDecisionBridge({
    ...VALIDATION_INPUT_BASE,
    capexOptionId: "capex_100m_brl",
  });

  {
    const before = JSON.stringify(productionResult);
    computePhase15CInvestmentMetricsCore({
      capitalDecisionResult: productionResult,
      driverSource: CAPITAL_DECISION_DRIVER_SOURCE,
    });
    const after = JSON.stringify(productionResult);
    checks.push(
      before === after
        ? pass("phase15c_no_phase15b_input_mutation", "computePhase15CInvestmentMetricsCore did not mutate the input CapitalDecisionResult")
        : fail("phase15c_no_phase15b_input_mutation", "CapitalDecisionResult was mutated by computePhase15CInvestmentMetricsCore"),
    );
  }

  const phase15cResult = computePhase15CInvestmentMetricsCore({
    capitalDecisionResult: productionResult,
    driverSource: CAPITAL_DECISION_DRIVER_SOURCE,
  });

  checks.push(
    phase15cResult.periods.length === 21 && typeof phase15cResult.terminalValue === "object" && phase15cResult.terminalValue !== null
      ? pass(
          "phase15c_result_has_21_periods_and_terminal_value",
          `Result contains exactly ${phase15cResult.periods.length} explicit periods plus 1 separate terminalValue object (status=${phase15cResult.terminalValue.status})`,
        )
      : fail(
          "phase15c_result_has_21_periods_and_terminal_value",
          `periods.length=${phase15cResult.periods.length}, terminalValue=${JSON.stringify(phase15cResult.terminalValue)}`,
        ),
  );

  {
    const ex = phase15cResult.explicitExclusions;
    const allExcluded =
      ex.workingCapital === "excluded" &&
      ex.financingCashFlows === "excluded" &&
      ex.simplePayback === "excluded" &&
      ex.discountedPayback === "excluded" &&
      ex.tierInvestmentInterpretation === "excluded" &&
      ex.uiInterpretation === "excluded";
    checks.push(
      allExcluded
        ? pass(
            "phase15c_explicit_exclusions_present",
            "explicitExclusions declares workingCapital/financingCashFlows/simplePayback/discountedPayback/Tier/UI as excluded",
          )
        : fail("phase15c_explicit_exclusions_present", `explicitExclusions incomplete: ${JSON.stringify(ex)}`),
    );
  }

  {
    // Synthetic CapitalDecisionResult: same shape as the production result,
    // but every period's fcoAfterCapexBRL forced positive (no sign change ->
    // IRR unavailable), while netIncomeBRL (terminal-value input) is
    // untouched and finite -> DCF/terminal value/NPV must remain calculated.
    const allPositivePeriods = productionResult.periods.map((p) => ({
      ...p,
      fcoAfterCapexBRL: Math.abs(p.fcoAfterCapexBRL) + 1,
    }));
    const syntheticResult: CapitalDecisionResult = { ...productionResult, periods: allPositivePeriods };

    const result = computePhase15CInvestmentMetricsCore({
      capitalDecisionResult: syntheticResult,
      driverSource: CAPITAL_DECISION_DRIVER_SOURCE,
    });

    checks.push(
      result.calculationStatus === "calculated" &&
        typeof result.npvBRL === "number" &&
        result.irrStatus === "no_sign_change" &&
        result.irrRate === null
        ? pass(
            "phase15c_irr_unavailable_does_not_remove_npv",
            `All-positive fcoAfterCapexBRL -> irrStatus=no_sign_change, irrRate=null, but calculationStatus=calculated and npvBRL=${result.npvBRL}`,
          )
        : fail("phase15c_irr_unavailable_does_not_remove_npv", `unexpected result: calculationStatus=${result.calculationStatus}, npvBRL=${result.npvBRL}, irrStatus=${result.irrStatus}`),
    );
  }

  {
    // Invalid driver: perpetuityGrowthRate (0.5) > operatingPeriodWaccRate
    // (0.12 = perpetuity WACC) -- Gordon Growth denominator would be <= 0.
    const invalidDriverSource = {
      ...CAPITAL_DECISION_DRIVER_SOURCE,
      perpetuityGrowthRate: 0.5,
    };
    const result = computePhase15CInvestmentMetricsCore({
      capitalDecisionResult: productionResult,
      driverSource: invalidDriverSource,
    });

    checks.push(
      result.calculationStatus === "blocked_invalid_wacc_growth" &&
        result.terminalValue.status === "blocked_invalid_wacc_growth" &&
        result.npvBRL === null
        ? pass(
            "phase15c_invalid_wacc_growth_blocks_terminal_and_npv",
            `perpetuityGrowthRate=0.5 > perpetuityWaccRate=0.12 -> calculationStatus=blocked_invalid_wacc_growth, terminalValue blocked, npvBRL=null`,
          )
        : fail(
            "phase15c_invalid_wacc_growth_blocks_terminal_and_npv",
            `unexpected result: calculationStatus=${result.calculationStatus}, terminalValue.status=${result.terminalValue.status}, npvBRL=${result.npvBRL}`,
          ),
    );
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;

  return {
    checks,
    allPass: failCount === 0,
    passCount,
    failCount,
    toleranceBRL: TOLERANCE_BRL,
    toleranceDiscountFactor: TOLERANCE_DISCOUNT_FACTOR,
    toleranceRate: TOLERANCE_RATE,
  };
}

// Eagerly-evaluated report, following this model directory's convention
// (e.g. CAPITAL_DECISION_ENGINE_VALIDATION_REPORT).
export const PHASE15C_INVESTMENT_METRICS_VALIDATION_REPORT = runPhase15CInvestmentMetricsValidation();
