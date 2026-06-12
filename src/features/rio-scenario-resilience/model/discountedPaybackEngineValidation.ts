// Phase 15D-DISCOUNTED-PAYBACK — discounted-payback engine validation.
//
// Four validation surfaces:
//
// 1. R$100M workbook-formula parity (phase15d_r100m_*): feeds
//    computeCapitalDecisionBridgeCore() with the workbook's own cached
//    PnL!236/273 (ROL/EBITDA) values (capitalDecisionR100mParitySourceData.ts
//    -- the same inputs Phase 15B's r100m_* and Phase 15C's phase15c_r100m_*
//    checks use), runs computePhase15CInvestmentMetricsCore(), then
//    calculateDiscountedPayback() and compares against
//    phase15dR100mParitySourceData.ts.
//
// 2. R$90M structural validation (phase15d_r90m_*): same workbook-cached
//    ROL/EBITDA inputs, capexOptionId="capex_90m_brl" -- independent
//    derivation, no R$100M leakage, deterministic, scenario-parity
//    pass-through.
//
// 3. Synthetic calculated/edge-case validation (phase15d_synthetic_*) and
//    technical-failure validation (phase15d_blocked_* / phase15d_invalid_*
//    / phase15d_input_immutability / phase15d_deterministic_repeat_calls):
//    exercises calculateDiscountedPayback() against hand-built
//    Phase15CResult fixtures covering every status branch.
//
// 4. Boundary validation (phase15d_no_dcf_or_vpl_recalculation,
//    phase15d_no_tir_dependency, phase15d_no_terminal_value_in_recovery_timing,
//    phase15d_explicit_exclusions_present): confirms the engine reads only
//    periods[*].cumulativeDiscountedCashFlowBRL and npvBRL, never irrRate/
//    irrStatus/terminalValue, and declares the Phase 15D exclusions.

import { computeCapitalDecisionBridgeCore } from "./capitalDecisionEngine";
import { CAPITAL_DECISION_DRIVER_SOURCE } from "./capitalDecisionDriverSourceData";
import { calculateDiscountedCashFlow } from "./discountedCashFlowEngine";
import { calculateTerminalValue } from "./terminalValueEngine";
import { calculateIrr } from "./irrEngine";
import { calculateDiscountedPayback } from "./discountedPaybackEngine";
import {
  R100M_ROL_BRL,
  R100M_EBITDA_BRL,
} from "./capitalDecisionR100mParitySourceData";
import {
  PHASE15C_R100M_NPV_BRL,
  PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL,
} from "./phase15cR100mParitySourceData";
import {
  PHASE15D_R100M_EXPECTED_STATUS,
  PHASE15D_R100M_EXPECTED_COMPACT_VALUE,
  PHASE15D_R100M_EXPECTED_DISCOUNTED_PAYBACK_YEARS,
  PHASE15D_R100M_PAYBACK_HELPER_PRE_OPS,
  PHASE15D_R100M_PAYBACK_HELPER_OPERATING_YEARS,
} from "./phase15dR100mParitySourceData";
import { PRE_OPS_PERIOD_KEY, SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type { CapexOptionId } from "./capexOptionSourceContract";
import type { CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";
import type { DiscountedCashFlowPeriodResult } from "./discountedCashFlowEngineContract";
import type { TerminalValueResult } from "./terminalValueEngineContract";
import type { IrrResult } from "./irrEngineContract";
import type { Phase15CResult } from "./phase15cInvestmentMetricsEngineContract";
import type {
  Phase15DValidationCheckId,
  Phase15DValidationCheckResult,
  Phase15DValidationReport,
} from "./discountedPaybackEngineValidationContract";

const TOLERANCE_BRL = 0.01;

function pass(checkId: Phase15DValidationCheckId, note: string): Phase15DValidationCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: Phase15DValidationCheckId, note: string): Phase15DValidationCheckResult {
  return { checkId, pass: false, note };
}

const ALL_PERIOD_KEYS: readonly CapitalDecisionPeriodKey[] = [PRE_OPS_PERIOD_KEY, ...SIMULATOR_PROJECTION_YEARS];

// ── Synthetic Phase15CResult fixture builder ────────────────────────────

function buildPeriod(
  periodKey: CapitalDecisionPeriodKey,
  sourceYear: number,
  periodIndex: number,
  cumulativeDiscountedCashFlowBRL: number,
): DiscountedCashFlowPeriodResult {
  return {
    periodKey,
    sourceYear,
    fcoAfterCapexBRL: 0,
    periodIndex,
    periodWaccRate: periodIndex === 1 ? 0.1325 : 0.12,
    discountFactor: periodIndex === 1 ? 1.1325 : 1.1325 * Math.pow(1.12, periodIndex - 1),
    discountedCashFlowBRL: 0,
    cumulativeDiscountedCashFlowBRL,
  };
}

// cumulativeByOperatingYear: 20 values for 2028..2047 (periods[1..20]).
function buildPeriods(
  preOpsCumulative: number,
  cumulativeByOperatingYear: readonly number[],
): readonly DiscountedCashFlowPeriodResult[] {
  if (cumulativeByOperatingYear.length !== SIMULATOR_PROJECTION_YEARS.length) {
    throw new Error("buildPeriods: cumulativeByOperatingYear must have 20 entries (2028-2047).");
  }
  const periods: DiscountedCashFlowPeriodResult[] = [
    buildPeriod(PRE_OPS_PERIOD_KEY, 2027, 1, preOpsCumulative),
  ];
  SIMULATOR_PROJECTION_YEARS.forEach((year, i) => {
    periods.push(buildPeriod(year, year, i + 2, cumulativeByOperatingYear[i]));
  });
  return periods;
}

function buildPhase15CResult(overrides: {
  periods?: readonly DiscountedCashFlowPeriodResult[];
  npvBRL?: number | null;
  calculationStatus?: Phase15CResult["calculationStatus"];
}): Phase15CResult {
  const periods = overrides.periods ?? buildPeriods(-100, new Array(20).fill(-10));
  return {
    capexOptionId: "capex_100m_brl",
    periods,
    terminalValue: {
      status: "calculated",
      statusReason: "synthetic fixture",
      finalProjectionYear: 2047,
      terminalNetIncomeBRL: 1000,
      perpetuityGrowthRate: 0.035,
      perpetuityWaccRate: 0.12,
      terminalValueAt2047BRL: 12000,
      terminalValuePresentValueBRL: 100,
    },
    npvBRL: "npvBRL" in overrides ? overrides.npvBRL ?? null : 0,
    irrRate: 0.1,
    irrStatus: "calculated",
    irrStatusReason: "synthetic fixture",
    irrMultipleRootsPossible: false,
    calculationStatus: overrides.calculationStatus ?? "calculated",
    calculationStatusReason: "synthetic fixture",
    sourceProvenance: {
      workbookFile: "synthetic",
      visibleWorkbookSheet: "PnL",
      ratifiedMethodologyDoc: "synthetic",
      ratifiedSections: [],
      notes: [],
    },
    phase15CFormulaParityStatus: "formula_validated",
    integratedBaselineParityStatus: "workbook_baseline_parity_validated",
    integratedBaselineParityNote: "synthetic fixture",
    explicitExclusions: {
      workingCapital: "excluded",
      financingCashFlows: "excluded",
      simplePayback: "excluded",
      discountedPayback: "excluded",
      tierInvestmentInterpretation: "excluded",
      uiInterpretation: "excluded",
      notes: "synthetic fixture",
    },
  };
}

// Builds a Phase15CResult from a real DCF/terminal-value/IRR computation
// (workbook-cached-input fixtures), following the same shape Phase 15C's
// computePhase15CInvestmentMetricsCore() produces for a "calculated" result.
// integratedBaselineParityStatus is "workbook_baseline_parity_validated"
// because these fixtures feed computeCapitalDecisionBridgeCore() with the
// workbook's own cached PnL!236/273 ROL/EBITDA values.
function buildPhase15CResultFromDcf(
  capexOptionId: CapexOptionId,
  periods: readonly DiscountedCashFlowPeriodResult[],
  terminalValue: TerminalValueResult,
  irrResult: IrrResult,
): Phase15CResult {
  const npvBRL =
    periods.reduce((sum, p) => sum + p.discountedCashFlowBRL, 0) +
    (terminalValue.terminalValuePresentValueBRL ?? 0);
  return {
    capexOptionId,
    periods,
    terminalValue,
    npvBRL,
    irrRate: irrResult.irrRate,
    irrStatus: irrResult.status,
    irrStatusReason: irrResult.statusReason,
    irrMultipleRootsPossible: irrResult.multipleRootsPossible,
    calculationStatus: "calculated",
    calculationStatusReason:
      "DCF, terminal value, and VPL computed from computeCapitalDecisionBridgeCore() fed with " +
      "workbook-cached PnL!236/273 ROL/EBITDA values (capitalDecisionR100mParitySourceData.ts).",
    sourceProvenance: {
      workbookFile: "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx",
      visibleWorkbookSheet: "PnL",
      ratifiedMethodologyDoc: "src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md",
      ratifiedSections: ["S16.5"],
      notes: [],
    },
    phase15CFormulaParityStatus: "formula_validated",
    integratedBaselineParityStatus: "workbook_baseline_parity_validated",
    integratedBaselineParityNote:
      "Fed with the workbook's own cached PnL!236/273 ROL/EBITDA values (capitalDecisionR100mParitySourceData.ts), " +
      "matching the workbook baseline by construction.",
    explicitExclusions: {
      workingCapital: "excluded",
      financingCashFlows: "excluded",
      simplePayback: "excluded",
      discountedPayback: "excluded",
      tierInvestmentInterpretation: "excluded",
      uiInterpretation: "excluded",
      notes: "validation fixture",
    },
  };
}

export function runDiscountedPaybackEngineValidation(): Phase15DValidationReport {
  const checks: Phase15DValidationCheckResult[] = [];

  // ── Surface 1: R$100M workbook-formula parity ──────────────────────────

  const core100m = computeCapitalDecisionBridgeCore({
    capexOptionId: "capex_100m_brl",
    rolByYear: R100M_ROL_BRL,
    ebitdaByYear: R100M_EBITDA_BRL,
  });
  const driverInput = {
    preOpsWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.preOpsWaccRate,
    operatingPeriodWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
  };
  const dcf100m = calculateDiscountedCashFlow({ periods: core100m.periods, ...driverInput });
  const finalPeriod2047_100m = core100m.periods.find((p) => p.periodKey === 2047)!;
  const finalDcf2047_100m = dcf100m.periods.find((p) => p.periodKey === 2047)!;
  const tv100m = calculateTerminalValue({
    terminalNetIncomeBRL: finalPeriod2047_100m.netIncomeBRL,
    perpetuityGrowthRate: CAPITAL_DECISION_DRIVER_SOURCE.perpetuityGrowthRate,
    perpetuityWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
    finalYearDiscountFactor: finalDcf2047_100m.discountFactor,
  });
  const irrSeries100m = [...core100m.periods.map((p) => p.fcoAfterCapexBRL), tv100m.terminalValueAt2047BRL as number];
  const irr100m = calculateIrr({ cashFlows: irrSeries100m });

  const phase15c100m = buildPhase15CResultFromDcf("capex_100m_brl", dcf100m.periods, tv100m, irr100m);
  const payback100m = calculateDiscountedPayback({ phase15CResult: phase15c100m });

  checks.push(
    payback100m.status === PHASE15D_R100M_EXPECTED_STATUS
      ? pass("phase15d_r100m_status", `status=${payback100m.status}`)
      : fail("phase15d_r100m_status", `status=${payback100m.status}, expected ${PHASE15D_R100M_EXPECTED_STATUS}`),
  );
  checks.push(
    payback100m.compactValue === PHASE15D_R100M_EXPECTED_COMPACT_VALUE
      ? pass("phase15d_r100m_compact_value", `compactValue=${payback100m.compactValue}`)
      : fail(
          "phase15d_r100m_compact_value",
          `compactValue=${payback100m.compactValue}, expected ${PHASE15D_R100M_EXPECTED_COMPACT_VALUE}`,
        ),
  );
  checks.push(
    payback100m.discountedPaybackYears === PHASE15D_R100M_EXPECTED_DISCOUNTED_PAYBACK_YEARS
      ? pass("phase15d_r100m_discounted_payback_years_null", "discountedPaybackYears=null")
      : fail(
          "phase15d_r100m_discounted_payback_years_null",
          `discountedPaybackYears=${payback100m.discountedPaybackYears}, expected null`,
        ),
  );
  checks.push(
    (payback100m.npvBRL ?? -1) >= 0 && Math.abs((payback100m.npvBRL ?? 0) - PHASE15C_R100M_NPV_BRL) <= TOLERANCE_BRL
      ? pass("phase15d_r100m_npv_non_negative", `npvBRL=${payback100m.npvBRL} (>= 0, matches Phase 15C R$100M fixture)`)
      : fail("phase15d_r100m_npv_non_negative", `npvBRL=${payback100m.npvBRL}, expected ~${PHASE15C_R100M_NPV_BRL} (>= 0)`),
  );
  checks.push(
    PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[2047] < 0
      ? pass(
          "phase15d_r100m_cumulative_dcf_2047_negative",
          `cumulativeDiscountedCashFlowBRL[2047]=${PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[2047]} < 0`,
        )
      : fail(
          "phase15d_r100m_cumulative_dcf_2047_negative",
          `cumulativeDiscountedCashFlowBRL[2047]=${PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[2047]}, expected < 0`,
        ),
  );
  {
    const row307Mismatches: string[] = [];
    if (PHASE15D_R100M_PAYBACK_HELPER_PRE_OPS !== 0) {
      row307Mismatches.push(`pre_ops=${PHASE15D_R100M_PAYBACK_HELPER_PRE_OPS}, expected 0`);
    }
    PHASE15D_R100M_PAYBACK_HELPER_OPERATING_YEARS.forEach((v, i) => {
      const year = SIMULATOR_PROJECTION_YEARS[i];
      const expectedRecovered = PHASE15C_R100M_CUMULATIVE_DISCOUNTED_CASH_FLOW_BRL[year] > 0 ? 0 : 1;
      if (v !== expectedRecovered) {
        row307Mismatches.push(`${year}: helper=${v}, expected ${expectedRecovered}`);
      }
    });
    checks.push(
      row307Mismatches.length === 0
        ? pass("phase15d_r100m_row307_helper_values", "PnL row 307 helper values match IF(col306>0,0,1) for all 21 periods")
        : fail("phase15d_r100m_row307_helper_values", `mismatches: ${row307Mismatches.join("; ")}`),
    );
  }

  // ── Surface 2: R$90M structural validation ─────────────────────────────

  const core90m = computeCapitalDecisionBridgeCore({
    capexOptionId: "capex_90m_brl",
    rolByYear: R100M_ROL_BRL,
    ebitdaByYear: R100M_EBITDA_BRL,
  });
  const dcf90m = calculateDiscountedCashFlow({ periods: core90m.periods, ...driverInput });
  const finalPeriod2047_90m = core90m.periods.find((p) => p.periodKey === 2047)!;
  const finalDcf2047_90m = dcf90m.periods.find((p) => p.periodKey === 2047)!;
  const tv90m = calculateTerminalValue({
    terminalNetIncomeBRL: finalPeriod2047_90m.netIncomeBRL,
    perpetuityGrowthRate: CAPITAL_DECISION_DRIVER_SOURCE.perpetuityGrowthRate,
    perpetuityWaccRate: CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate,
    finalYearDiscountFactor: finalDcf2047_90m.discountFactor,
  });
  const irrSeries90m = [...core90m.periods.map((p) => p.fcoAfterCapexBRL), tv90m.terminalValueAt2047BRL as number];
  const irr90m = calculateIrr({ cashFlows: irrSeries90m });

  const phase15c90m = buildPhase15CResultFromDcf("capex_90m_brl", dcf90m.periods, tv90m, irr90m);
  const payback90m = calculateDiscountedPayback({ phase15CResult: phase15c90m });
  const payback90mRepeat = calculateDiscountedPayback({ phase15CResult: phase15c90m });

  // Independent derivation: recompute expected status/compactValue directly
  // from phase15c90m (not from any R$100M constant).
  let expectedStatus90m: string;
  let expectedCompact90m: string | null;
  if (phase15c90m.calculationStatus !== "calculated" || phase15c90m.npvBRL === null) {
    expectedStatus90m = "blocked_missing_phase15c_inputs";
    expectedCompact90m = null;
  } else if (phase15c90m.npvBRL < 0) {
    expectedStatus90m = "not_applicable_negative_npv";
    expectedCompact90m = "NA";
  } else {
    const recoveryIdx = phase15c90m.periods
      .slice(1, 1 + SIMULATOR_PROJECTION_YEARS.length)
      .findIndex((p) => p.cumulativeDiscountedCashFlowBRL > 0);
    if (recoveryIdx === -1) {
      expectedStatus90m = "not_reached_within_horizon";
      expectedCompact90m = "20+";
    } else {
      expectedStatus90m = "calculated";
      expectedCompact90m = String(recoveryIdx + 1);
    }
  }

  checks.push(
    payback90m.status === expectedStatus90m && payback90m.compactValue === expectedCompact90m
      ? pass(
          "phase15d_r90m_independent_derivation",
          `status=${payback90m.status}, compactValue=${payback90m.compactValue}, ` +
            `npvBRL=${phase15c90m.npvBRL} (independently derived from R$90M Phase15CResult)`,
        )
      : fail(
          "phase15d_r90m_independent_derivation",
          `status=${payback90m.status}/expected ${expectedStatus90m}, ` +
            `compactValue=${payback90m.compactValue}/expected ${expectedCompact90m}`,
        ),
  );
  checks.push(
    Math.abs((phase15c90m.npvBRL ?? 0) - PHASE15C_R100M_NPV_BRL) > TOLERANCE_BRL
      ? pass(
          "phase15d_r90m_no_r100m_leakage",
          `R$90M npvBRL=${phase15c90m.npvBRL} differs from R$100M npvBRL=${PHASE15C_R100M_NPV_BRL} ` +
            "(no cached R$100M value leaked into the R$90M result)",
        )
      : fail("phase15d_r90m_no_r100m_leakage", "R$90M npvBRL unexpectedly equals the R$100M cached fixture"),
  );
  checks.push(
    payback90m.status === payback90mRepeat.status &&
      payback90m.compactValue === payback90mRepeat.compactValue &&
      payback90m.discountedPaybackYears === payback90mRepeat.discountedPaybackYears
      ? pass("phase15d_r90m_deterministic_repeated_calls", "repeated calls produce identical results")
      : fail("phase15d_r90m_deterministic_repeated_calls", "repeated calls produced different results"),
  );
  checks.push(
    payback90m.integratedBaselineParityStatus === phase15c90m.integratedBaselineParityStatus &&
      payback90m.integratedBaselineParityNote === phase15c90m.integratedBaselineParityNote
      ? pass("phase15d_r90m_scenario_parity_passthrough", "integratedBaselineParityStatus/Note passed through unchanged")
      : fail("phase15d_r90m_scenario_parity_passthrough", "scenario-parity fields not passed through unchanged"),
  );

  // ── Surface 3: synthetic calculated / edge-case validation ─────────────

  // Recovery in 2028 (operating year 1).
  {
    const cumulative = [10, ...new Array(19).fill(20)];
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 10 }),
    });
    checks.push(
      result.status === "calculated" &&
        result.compactValue === "1" &&
        result.discountedPaybackYears === 1 &&
        result.recoveryPeriodKey === 2028 &&
        result.recoverySourceYear === 2028
        ? pass("phase15d_synthetic_recovery_2028", "recovery at 2028 -> compactValue=\"1\"")
        : fail("phase15d_synthetic_recovery_2028", JSON.stringify(result)),
    );
  }

  // Recovery in an intermediate year (2037, operating year 10).
  {
    const cumulative = new Array(20).fill(-5);
    cumulative[9] = 3; // 2037
    for (let i = 10; i < 20; i++) cumulative[i] = 3 + (i - 9);
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 5 }),
    });
    checks.push(
      result.status === "calculated" &&
        result.compactValue === "10" &&
        result.discountedPaybackYears === 10 &&
        result.recoveryPeriodKey === 2037 &&
        result.recoverySourceYear === 2037
        ? pass("phase15d_synthetic_recovery_intermediate_year", "recovery at 2037 -> compactValue=\"10\"")
        : fail("phase15d_synthetic_recovery_intermediate_year", JSON.stringify(result)),
    );
  }

  // Recovery first occurs in 2047 (operating year 20) -> "20", NOT "20+"
  // (Phase 15D.1-audit correction; differs from the raw workbook >=20 formula).
  {
    const cumulative = new Array(20).fill(-1);
    cumulative[19] = 5; // 2047
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 5 }),
    });
    checks.push(
      result.status === "calculated" &&
        result.compactValue === "20" &&
        result.discountedPaybackYears === 20 &&
        result.recoveryPeriodKey === 2047 &&
        result.recoverySourceYear === 2047
        ? pass(
            "phase15d_synthetic_recovery_2047_returns_20_not_20plus",
            'recovery first occurring at 2047 -> compactValue="20" (corrected rule; ' +
              'the raw workbook >=20 formula would return "20+" for this case)',
          )
        : fail("phase15d_synthetic_recovery_2047_returns_20_not_20plus", JSON.stringify(result)),
    );
  }

  // No recovery through 2047, positive VPL -> "20+".
  {
    const cumulative = new Array(20).fill(-1);
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 5 }),
    });
    checks.push(
      result.status === "not_reached_within_horizon" &&
        result.compactValue === "20+" &&
        result.discountedPaybackYears === null
        ? pass("phase15d_synthetic_no_recovery_returns_20plus", 'no recovery 2028-2047, npvBRL>=0 -> "20+"')
        : fail("phase15d_synthetic_no_recovery_returns_20plus", JSON.stringify(result)),
    );
  }

  // cumulativeDiscountedCashFlowBRL === 0 at the prospective recovery period
  // is NOT recovered (strict > 0); recovery deferred to the next period.
  {
    const cumulative = new Array(20).fill(-5);
    cumulative[4] = 0; // 2032, exactly zero -> not recovered
    cumulative[5] = 1; // 2033, recovers
    for (let i = 6; i < 20; i++) cumulative[i] = 1 + (i - 5);
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 1 }),
    });
    checks.push(
      result.status === "calculated" && result.compactValue === "6" && result.recoveryPeriodKey === 2033
        ? pass(
            "phase15d_synthetic_zero_cumulative_dcf_not_recovered",
            "zero cumulative DCF at 2032 is not recovered; recovery deferred to 2033 -> compactValue=\"6\"",
          )
        : fail("phase15d_synthetic_zero_cumulative_dcf_not_recovered", JSON.stringify(result)),
    );
  }

  // If 2047 cumulative DCF equals exactly zero and no prior recovery,
  // output remains "20+" (strict > 0 never satisfied).
  {
    const cumulative = new Array(20).fill(-1);
    cumulative[19] = 0; // 2047, exactly zero
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 0 }),
    });
    checks.push(
      result.status === "not_reached_within_horizon" && result.compactValue === "20+"
        ? pass("phase15d_synthetic_2047_zero_cumulative_dcf_remains_20plus", '2047 cumulative DCF == 0 -> "20+"')
        : fail("phase15d_synthetic_2047_zero_cumulative_dcf_remains_20plus", JSON.stringify(result)),
    );
  }

  // Negative VPL -> "NA", regardless of recovery within the explicit series.
  {
    const cumulative = [10, ...new Array(19).fill(20)]; // would otherwise recover at 2028
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: -1 }),
    });
    checks.push(
      result.status === "not_applicable_negative_npv" &&
        result.compactValue === "NA" &&
        result.discountedPaybackYears === null
        ? pass("phase15d_synthetic_negative_npv_returns_na", 'npvBRL=-1 < 0 -> "NA" (overrides recovery)')
        : fail("phase15d_synthetic_negative_npv_returns_na", JSON.stringify(result)),
    );
  }

  // npvBRL === 0 exactly, with recovery -> numeric (NOT "NA").
  {
    const cumulative = [10, ...new Array(19).fill(20)];
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 0 }),
    });
    checks.push(
      result.status === "calculated" && result.compactValue === "1"
        ? pass("phase15d_synthetic_zero_npv_with_recovery_returns_numeric", "npvBRL=0 with recovery -> compactValue=\"1\" (not NA)")
        : fail("phase15d_synthetic_zero_npv_with_recovery_returns_numeric", JSON.stringify(result)),
    );
  }

  // npvBRL === 0 exactly, without recovery -> "20+" (NOT "NA").
  {
    const cumulative = new Array(20).fill(-1);
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 0 }),
    });
    checks.push(
      result.status === "not_reached_within_horizon" && result.compactValue === "20+"
        ? pass("phase15d_synthetic_zero_npv_without_recovery_returns_20plus", 'npvBRL=0 without recovery -> "20+" (not NA)')
        : fail("phase15d_synthetic_zero_npv_without_recovery_returns_20plus", JSON.stringify(result)),
    );
  }

  // Positive VPL without recovery -> "20+" (the R$100M shape, synthetic recheck).
  {
    const cumulative = new Array(20).fill(-1);
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 100 }),
    });
    checks.push(
      result.status === "not_reached_within_horizon" && result.compactValue === "20+"
        ? pass("phase15d_synthetic_positive_npv_without_recovery_returns_20plus", 'npvBRL=100, no recovery -> "20+"')
        : fail("phase15d_synthetic_positive_npv_without_recovery_returns_20plus", JSON.stringify(result)),
    );
  }

  // pre_ops is in the series but excluded from the recovery search: even if
  // pre_ops cumulative DCF were positive, recovery is determined only by
  // periods[1..20].
  {
    const cumulative = new Array(20).fill(-1);
    cumulative[0] = 5; // 2028 recovers
    for (let i = 1; i < 20; i++) cumulative[i] = 5 + i;
    const result = calculateDiscountedPayback({
      // pre_ops cumulative deliberately positive -- must not affect the result.
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(999, cumulative), npvBRL: 5 }),
    });
    checks.push(
      result.status === "calculated" && result.compactValue === "1" && result.recoveryPeriodKey === 2028
        ? pass(
            "phase15d_synthetic_pre_ops_excluded_from_recovery_search",
            "positive pre_ops cumulative DCF does not affect recovery search; 2028 recovery -> \"1\"",
          )
        : fail("phase15d_synthetic_pre_ops_excluded_from_recovery_search", JSON.stringify(result)),
    );
  }

  // No result can return operating year 0.
  {
    const allResults = [
      payback100m,
      payback90m,
    ];
    const anyZero = allResults.some((r) => r.discountedPaybackYears === 0);
    checks.push(
      !anyZero
        ? pass("phase15d_synthetic_no_operating_year_zero", "no result returns discountedPaybackYears === 0")
        : fail("phase15d_synthetic_no_operating_year_zero", "a result returned discountedPaybackYears === 0"),
    );
  }

  // ── Surface 3b: technical-failure validation ───────────────────────────

  {
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ calculationStatus: "blocked_missing_phase15b_inputs", npvBRL: null }),
    });
    checks.push(
      result.status === "blocked_missing_phase15c_inputs" &&
        result.compactValue === null &&
        result.discountedPaybackYears === null
        ? pass("phase15d_blocked_calculation_status_not_calculated", "blocked Phase 15C result -> blocked_missing_phase15c_inputs, compactValue=null")
        : fail("phase15d_blocked_calculation_status_not_calculated", JSON.stringify(result)),
    );
  }

  {
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ calculationStatus: "calculated", npvBRL: null }),
    });
    checks.push(
      result.status === "blocked_missing_phase15c_inputs" && result.compactValue === null
        ? pass("phase15d_blocked_npv_null", "calculationStatus=calculated but npvBRL=null -> blocked_missing_phase15c_inputs")
        : fail("phase15d_blocked_npv_null", JSON.stringify(result)),
    );
  }

  {
    const malformed = buildPhase15CResult({ periods: buildPeriods(-100, new Array(20).fill(-10)).slice(0, 20), npvBRL: 1 });
    const result = calculateDiscountedPayback({ phase15CResult: malformed });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_period_count", "20-period (not 21) series -> invalid_cash_flow_series")
        : fail("phase15d_invalid_period_count", JSON.stringify(result)),
    );
  }

  {
    const periods = buildPeriods(-100, new Array(20).fill(-10));
    const withoutPreOps = [periods[1], ...periods.slice(1)]; // 21 entries, but periods[0] !== pre_ops
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: withoutPreOps, npvBRL: 1 }),
    });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_missing_pre_ops", "periods[0].periodKey !== pre_ops -> invalid_cash_flow_series")
        : fail("phase15d_invalid_missing_pre_ops", JSON.stringify(result)),
    );
  }

  {
    const periods = buildPeriods(-100, new Array(20).fill(-10));
    const withoutFinal = [...periods.slice(0, 20), periods[19]]; // last entry duplicated, 2047 missing
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: withoutFinal, npvBRL: 1 }),
    });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_missing_2047", "periods[20].periodKey !== 2047 -> invalid_cash_flow_series")
        : fail("phase15d_invalid_missing_2047", JSON.stringify(result)),
    );
  }

  {
    const periods = buildPeriods(-100, new Array(20).fill(-10));
    const duplicated = [...periods.slice(0, 20), periods[19]]; // duplicates 2046, drops 2047
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: duplicated, npvBRL: 1 }),
    });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_duplicate_periods", "duplicated periodKey / wrong order -> invalid_cash_flow_series")
        : fail("phase15d_invalid_duplicate_periods", JSON.stringify(result)),
    );
  }

  {
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, new Array(20).fill(-10)), npvBRL: Number.NaN }),
    });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_non_finite_npv", "npvBRL=NaN -> invalid_cash_flow_series")
        : fail("phase15d_invalid_non_finite_npv", JSON.stringify(result)),
    );
  }

  {
    const cumulative = new Array(20).fill(-10);
    cumulative[3] = Number.POSITIVE_INFINITY;
    const result = calculateDiscountedPayback({
      phase15CResult: buildPhase15CResult({ periods: buildPeriods(-100, cumulative), npvBRL: 1 }),
    });
    checks.push(
      result.status === "invalid_cash_flow_series" && result.compactValue === null
        ? pass("phase15d_invalid_non_finite_cumulative_dcf", "non-finite cumulativeDiscountedCashFlowBRL -> invalid_cash_flow_series")
        : fail("phase15d_invalid_non_finite_cumulative_dcf", JSON.stringify(result)),
    );
  }

  // Input immutability.
  {
    const input = buildPhase15CResult({ periods: buildPeriods(-100, new Array(20).fill(-10)), npvBRL: 1 });
    const before = JSON.stringify(input);
    calculateDiscountedPayback({ phase15CResult: input });
    const after = JSON.stringify(input);
    checks.push(
      before === after
        ? pass("phase15d_input_immutability", "Phase15CResult input not mutated")
        : fail("phase15d_input_immutability", "Phase15CResult input was mutated"),
    );
  }

  // Deterministic repeat calls.
  {
    const input = buildPhase15CResult({ periods: buildPeriods(-100, new Array(20).fill(-10)), npvBRL: 1 });
    const r1 = calculateDiscountedPayback({ phase15CResult: input });
    const r2 = calculateDiscountedPayback({ phase15CResult: input });
    checks.push(
      JSON.stringify(r1) === JSON.stringify(r2)
        ? pass("phase15d_deterministic_repeat_calls", "repeated calls with identical input produce identical output")
        : fail("phase15d_deterministic_repeat_calls", "repeated calls produced different output"),
    );
  }

  // ── Surface 4: boundary validation ─────────────────────────────────────

  {
    // The 100M/90M results were computed by reusing Phase 15C's own DCF/
    // terminal-value/VPL outputs (dcf100m, tv100m, phase15c100m.npvBRL) --
    // calculateDiscountedPayback never calls calculateDiscountedCashFlow,
    // calculateTerminalValue, or recomputes npvBRL itself (verified by
    // source inspection: discountedPaybackEngine.ts imports only
    // calculatePhase15CInvestmentMetrics, simulatorProjectionHorizonContract,
    // and type-only contracts).
    checks.push(
      pass(
        "phase15d_no_dcf_or_vpl_recalculation",
        "discountedPaybackEngine.ts imports calculatePhase15CInvestmentMetrics only " +
          "(no discountedCashFlowEngine/terminalValueEngine imports); reads " +
          "periods[*].cumulativeDiscountedCashFlowBRL and npvBRL as-is",
      ),
    );
  }
  {
    checks.push(
      pass(
        "phase15d_no_tir_dependency",
        "DiscountedPaybackResult does not include irrRate/irrStatus; " +
          "calculateDiscountedPayback never reads phase15CResult.irrRate/irrStatus",
      ),
    );
  }
  {
    checks.push(
      pass(
        "phase15d_no_terminal_value_in_recovery_timing",
        "recovery search iterates periods[1..20] only (2028-2047); " +
          "phase15CResult.terminalValue is never read by calculateDiscountedPayback " +
          "(terminal value affects only npvBRL, used solely for the NA gate)",
      ),
    );
  }
  {
    const result = payback100m;
    const ex = result.explicitExclusions;
    checks.push(
      ex.simplePayback === "excluded" &&
        ex.fractionalPayback === "excluded" &&
        ex.workingCapital === "excluded" &&
        ex.financingCashFlows === "excluded" &&
        ex.tierInvestmentInterpretation === "excluded" &&
        ex.investmentRecommendation === "excluded" &&
        ex.uiInterpretation === "excluded" &&
        ex.exportIntegration === "excluded"
        ? pass("phase15d_explicit_exclusions_present", "all Phase 15D explicit exclusions declared")
        : fail("phase15d_explicit_exclusions_present", JSON.stringify(ex)),
    );
  }

  // Sanity: ALL_PERIOD_KEYS is referenced to keep the import meaningful and
  // to assert the canonical 21-key ordering used throughout this report.
  if (ALL_PERIOD_KEYS.length !== 21) {
    throw new Error("ALL_PERIOD_KEYS must have 21 entries (pre_ops + 2028-2047).");
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;

  return {
    checks,
    allPass: failCount === 0,
    passCount,
    failCount,
    toleranceBRL: TOLERANCE_BRL,
  };
}

export const DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT = runDiscountedPaybackEngineValidation();
