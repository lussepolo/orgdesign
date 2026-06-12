// Phase 15B-FCO-CAPEX-BRIDGE — capital decision engine validation.
//
// Two independent validation surfaces:
//
// 1. R$100M workbook-formula parity + R$90M structural validation
//    (checks prefixed r100m_* / r90m_* plus
//    sustain_capex_unchanged_between_options): exercises
//    computeCapitalDecisionBridgeCore() directly, fed with the workbook's
//    own cached PnL!236 (ROL) / PnL!273 (EBITDA) values for 2028-2047
//    (capitalDecisionR100mParitySourceData.ts: R100M_ROL_BRL,
//    R100M_EBITDA_BRL). This validates the bridge FORMULAS (CAPEX schedule,
//    PPE depreciation, NOL/tax recurrence, FCO, cash flow after CAPEX)
//    against the workbook's cached PnL!291-296 bridge outputs,
//    independently of calculateDre(). The R$90M run uses the SAME
//    workbook-cached operating inputs, varying only capexOptionId, isolating
//    the pure CAPEX-option effect.
//
// 2. Boundary / scope validation (capex_never_changes_ebitda,
//    result_has_exactly_21_periods, explicit_exclusions_present,
//    repeated_calls_deterministic): exercises the full orchestrator
//    calculateCapitalDecisionBridge() (which calls calculateDre()), using
//    the canonical validation scenario, to confirm production-engine
//    properties.
//
// Phase 15B.2 scenario-mismatch note (see capitalDecisionEngine.ts header):
// calculateDre()'s 2028-2047 ebitda/receita_operacional_liquida for the
// canonical validation scenario (t1_g3 / intermediario /
// bp1_division_differentiated / balanced_experience) do not numerically
// reproduce the workbook's PnL!236/273 cached values, because the scenario's
// 2028 numero_de_alunos (228) differs from the workbook baseline's PnL!221
// (246) -- a scenario/enrollment-input mismatch upstream of any revenue or
// EBITDA formula, not a bridge-formula defect. As a result, surface (1) above
// validates the bridge formulas in isolation (workbook inputs -> workbook
// outputs), while surface (2) validates production-engine invariants that do
// not depend on the absolute EBITDA/ROL values. The INTEGRATED output of
// calculateCapitalDecisionBridge() for 2028-2047 does not match the
// workbook's cached PnL!291-296 bridge for this scenario --
// integratedBaselineParityStatus/integratedBaselineParityNote on the result
// report this explicitly, scenario-specifically, and without implying a
// formula defect.

import { calculateCapitalDecisionBridge, computeCapitalDecisionBridgeCore } from "./capitalDecisionEngine";
import { SIMULATOR_PROJECTION_YEARS, PRE_OPS_PERIOD_KEY } from "./simulatorProjectionHorizonContract";
import {
  R100M_ROL_BRL,
  R100M_EBITDA_BRL,
  R100M_CAPEX_EXPANSION_SIGNED_BRL,
  R100M_CAPEX_SUSTAIN_SIGNED_BRL,
  R100M_DEPRECIATION_AMORTIZATION_SIGNED_BRL,
  R100M_TAX_DIRECT_BRL,
  R100M_NOL_RECOVERY_BRL,
  R100M_ACCUMULATED_NOL_BRL,
  R100M_FCO_BRL,
  R100M_FCO_AFTER_CAPEX_BRL,
  R100M_FCO_AFTER_CAPEX_CUMULATIVE_BRL,
} from "./capitalDecisionR100mParitySourceData";
import { PRE_OPS_OPERATING_RESULT_SOURCE } from "./preOpsOperatingResultSourceData";
import type {
  CapitalDecisionPeriodKey,
  CapitalDecisionPeriodResult,
  CapitalDecisionResult,
} from "./capitalDecisionEngineContract";
import type {
  CapitalDecisionValidationCheckId,
  CapitalDecisionValidationCheckResult,
  CapitalDecisionValidationReport,
} from "./capitalDecisionEngineValidationContract";

const VALIDATION_INPUT_BASE = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience",
};

const TOLERANCE_BRL = 0.01;

function pass(checkId: CapitalDecisionValidationCheckId, note: string): CapitalDecisionValidationCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: CapitalDecisionValidationCheckId, note: string): CapitalDecisionValidationCheckResult {
  return { checkId, pass: false, note };
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE_BRL;
}

function periodsByKey(
  periods: readonly CapitalDecisionPeriodResult[],
): Map<CapitalDecisionPeriodKey, CapitalDecisionPeriodResult> {
  return new Map(periods.map((p) => [p.periodKey, p]));
}

function checkAllPeriodsField(
  checkId: CapitalDecisionValidationCheckId,
  fieldLabel: string,
  byPeriod: Map<CapitalDecisionPeriodKey, CapitalDecisionPeriodResult>,
  reference: Readonly<Record<CapitalDecisionPeriodKey, number>>,
  periodKeys: readonly CapitalDecisionPeriodKey[],
  getField: (p: CapitalDecisionPeriodResult) => number,
): CapitalDecisionValidationCheckResult {
  const mismatches: string[] = [];
  for (const periodKey of periodKeys) {
    const actual = getField(byPeriod.get(periodKey)!);
    const expected = reference[periodKey];
    if (!close(actual, expected)) {
      mismatches.push(`${String(periodKey)}: actual=${actual}, expected=${expected}`);
    }
  }
  return mismatches.length === 0
    ? pass(checkId, `${fieldLabel} matches workbook cache for all ${periodKeys.length} periods (tol=${TOLERANCE_BRL})`)
    : fail(checkId, `${fieldLabel} mismatches: ${mismatches.join("; ")}`);
}

export function runCapitalDecisionEngineValidation(): CapitalDecisionValidationReport {
  const allPeriods: readonly CapitalDecisionPeriodKey[] = [PRE_OPS_PERIOD_KEY, ...SIMULATOR_PROJECTION_YEARS];

  // ── Surface 1: bridge-formula parity, fed with workbook-cached PnL!236/273 ──

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
  const r100mByPeriod = periodsByKey(core100m.periods);
  const r90mByPeriod = periodsByKey(core90m.periods);

  // ── Surface 2: orchestrator (production engine, calculateDre-fed) ──────────

  const r100m = calculateCapitalDecisionBridge({ ...VALIDATION_INPUT_BASE, capexOptionId: "capex_100m_brl" });
  const r90m = calculateCapitalDecisionBridge({ ...VALIDATION_INPUT_BASE, capexOptionId: "capex_90m_brl" });
  const r100mRepeat = calculateCapitalDecisionBridge({ ...VALIDATION_INPUT_BASE, capexOptionId: "capex_100m_brl" });
  const orchR90mByPeriod = periodsByKey(r90m.periods);
  const orchR100mByPeriod = periodsByKey(r100m.periods);

  const checks: CapitalDecisionValidationCheckResult[] = [];

  // ── R$100M workbook formula parity (bridge core, workbook-cached inputs) ──

  {
    const actual = r100mByPeriod.get(PRE_OPS_PERIOD_KEY)!.capexExpansionBRL;
    checks.push(
      close(actual, -70_000_000)
        ? pass("r100m_pre_ops_expansion_capex", `pre_ops expansion CAPEX = ${actual}`)
        : fail("r100m_pre_ops_expansion_capex", `pre_ops expansion CAPEX = ${actual}, expected -70,000,000`),
    );
  }

  {
    const actual = r100mByPeriod.get(PRE_OPS_PERIOD_KEY)!.ebitdaBRL;
    checks.push(
      close(actual, PRE_OPS_OPERATING_RESULT_SOURCE.ebitdaBRL)
        ? pass("r100m_pre_ops_ebitda", `pre_ops EBITDA = ${actual}`)
        : fail("r100m_pre_ops_ebitda", `pre_ops EBITDA = ${actual}, expected ${PRE_OPS_OPERATING_RESULT_SOURCE.ebitdaBRL}`),
    );
  }

  {
    const actual = r100mByPeriod.get(PRE_OPS_PERIOD_KEY)!.fcoAfterCapexBRL;
    checks.push(
      close(actual, -87_667_521.16172509)
        ? pass("r100m_pre_ops_fco_after_capex", `pre_ops FCO after CAPEX = ${actual}`)
        : fail("r100m_pre_ops_fco_after_capex", `pre_ops FCO after CAPEX = ${actual}, expected -87,667,521.16`),
    );
  }

  {
    const actual = r100mByPeriod.get(2032)!.taxDirectBRL;
    const expected = R100M_TAX_DIRECT_BRL[2032];
    checks.push(
      close(actual, expected)
        ? pass("r100m_2032_direct_tax", `2032 taxDirect = ${actual}`)
        : fail("r100m_2032_direct_tax", `2032 taxDirect = ${actual}, expected ${expected}`),
    );
  }

  {
    const actual = r100mByPeriod.get(2038)!.nolRecoveryBRL;
    const expected = R100M_NOL_RECOVERY_BRL[2038];
    checks.push(
      close(actual, expected)
        ? pass("r100m_2038_nol_recovery", `2038 nolRecovery = ${actual}`)
        : fail("r100m_2038_nol_recovery", `2038 nolRecovery = ${actual}, expected ${expected}`),
    );
  }

  {
    const r2039 = r100mByPeriod.get(2039)!;
    const expectedRecovery = R100M_NOL_RECOVERY_BRL[2039]; // 0 — all-or-nothing exhaustion, no pro-ration
    const expectedAccum = R100M_ACCUMULATED_NOL_BRL[2039]; // 0
    const okRecovery = close(r2039.nolRecoveryBRL, expectedRecovery);
    const okAccum = close(r2039.accumulatedNolBRL, expectedAccum);
    checks.push(
      okRecovery && okAccum
        ? pass(
            "r100m_2039_nol_exhaustion_discontinuity",
            `2039 nolRecovery=${r2039.nolRecoveryBRL} (2038 was ${R100M_NOL_RECOVERY_BRL[2038]}), ` +
              `accumulatedNol=${r2039.accumulatedNolBRL} — all-or-nothing exhaustion reproduced`,
          )
        : fail(
            "r100m_2039_nol_exhaustion_discontinuity",
            `2039 nolRecovery=${r2039.nolRecoveryBRL} (expected ${expectedRecovery}), ` +
              `accumulatedNol=${r2039.accumulatedNolBRL} (expected ${expectedAccum})`,
          ),
    );
  }

  {
    const actual = r100mByPeriod.get(2039)!.accumulatedNolBRL;
    checks.push(
      close(actual, 0)
        ? pass("r100m_accumulated_nol_zero_at_2039", `accumulatedNol(2039) = ${actual}`)
        : fail("r100m_accumulated_nol_zero_at_2039", `accumulatedNol(2039) = ${actual}, expected 0`),
    );
  }

  {
    const actual = r100mByPeriod.get(2047)!.fcoAfterCapexCumulativeBRL;
    const expected = R100M_FCO_AFTER_CAPEX_CUMULATIVE_BRL[2047];
    checks.push(
      close(actual, expected)
        ? pass("r100m_2047_cumulative_fco_after_capex", `2047 cumulative FCO after CAPEX = ${actual}`)
        : fail(
            "r100m_2047_cumulative_fco_after_capex",
            `2047 cumulative FCO after CAPEX = ${actual}, expected ${expected}`,
          ),
    );
  }

  checks.push(
    checkAllPeriodsField(
      "r100m_da_parity_2028_2047",
      "D&A",
      r100mByPeriod,
      R100M_DEPRECIATION_AMORTIZATION_SIGNED_BRL,
      SIMULATOR_PROJECTION_YEARS,
      (p) => p.depreciationAmortizationBRL,
    ),
  );

  checks.push(
    checkAllPeriodsField(
      "r100m_capex_expansion_parity_all_periods",
      "CAPEX expansion",
      r100mByPeriod,
      R100M_CAPEX_EXPANSION_SIGNED_BRL,
      allPeriods,
      (p) => p.capexExpansionBRL,
    ),
  );

  checks.push(
    checkAllPeriodsField(
      "r100m_sustain_capex_parity_2028_2047",
      "Sustain CAPEX",
      r100mByPeriod,
      R100M_CAPEX_SUSTAIN_SIGNED_BRL,
      SIMULATOR_PROJECTION_YEARS,
      (p) => p.capexSustainBRL,
    ),
  );

  checks.push(
    checkAllPeriodsField(
      "r100m_fco_parity_all_periods",
      "FCO",
      r100mByPeriod,
      R100M_FCO_BRL,
      allPeriods,
      (p) => p.fcoBRL,
    ),
  );

  checks.push(
    checkAllPeriodsField(
      "r100m_cashflow_after_capex_parity_all_periods",
      "Cash flow after CAPEX",
      r100mByPeriod,
      R100M_FCO_AFTER_CAPEX_BRL,
      allPeriods,
      (p) => p.fcoAfterCapexBRL,
    ),
  );

  // ── R$90M structural validation (bridge core, same workbook-cached inputs) ─

  {
    const actual = r90mByPeriod.get(PRE_OPS_PERIOD_KEY)!.capexExpansionBRL;
    checks.push(
      close(actual, -63_000_000)
        ? pass("r90m_pre_ops_expansion_capex", `pre_ops expansion CAPEX = ${actual}`)
        : fail("r90m_pre_ops_expansion_capex", `pre_ops expansion CAPEX = ${actual}, expected -63,000,000`),
    );
  }

  {
    const actual = r90mByPeriod.get(2030)!.capexExpansionBRL;
    checks.push(
      close(actual, -18_000_000)
        ? pass("r90m_2030_expansion_capex", `2030 expansion CAPEX = ${actual}`)
        : fail("r90m_2030_expansion_capex", `2030 expansion CAPEX = ${actual}, expected -18,000,000`),
    );
  }

  {
    const actual = r90mByPeriod.get(2031)!.capexExpansionBRL;
    checks.push(
      close(actual, -9_000_000)
        ? pass("r90m_2031_expansion_capex", `2031 expansion CAPEX = ${actual}`)
        : fail("r90m_2031_expansion_capex", `2031 expansion CAPEX = ${actual}, expected -9,000,000`),
    );
  }

  {
    let totalExpansion = 0;
    for (const periodKey of allPeriods) {
      totalExpansion += r90mByPeriod.get(periodKey)!.capexExpansionBRL;
    }
    checks.push(
      close(totalExpansion, -90_000_000)
        ? pass("r90m_total_expansion_capex", `total expansion CAPEX = ${totalExpansion}`)
        : fail("r90m_total_expansion_capex", `total expansion CAPEX = ${totalExpansion}, expected -90,000,000`),
    );
  }

  {
    const mismatches: string[] = [];
    for (const periodKey of SIMULATOR_PROJECTION_YEARS) {
      const r90 = r90mByPeriod.get(periodKey)!.capexSustainBRL;
      const r100 = r100mByPeriod.get(periodKey)!.capexSustainBRL;
      if (!close(r90, r100)) {
        mismatches.push(`${periodKey}: r90m=${r90}, r100m=${r100}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass("sustain_capex_unchanged_between_options", "Sustain CAPEX identical for R$90M and R$100M, 2028-2047")
        : fail("sustain_capex_unchanged_between_options", `Sustain CAPEX differs: ${mismatches.join("; ")}`),
    );
  }

  {
    const r90 = r90mByPeriod.get(2028)!.depreciationAmortizationBRL;
    const r100 = r100mByPeriod.get(2028)!.depreciationAmortizationBRL;
    checks.push(
      !close(r90, r100)
        ? pass("r90m_da_differs_from_r100m", `2028 D&A: r90m=${r90}, r100m=${r100} (recomputed from smaller vintages)`)
        : fail("r90m_da_differs_from_r100m", `2028 D&A identical for R$90M and R$100M (${r90}) — expected difference`),
    );
  }

  {
    // 2032 is the first period with positive EBT in the workbook-cached
    // baseline (R100M_EBT_BRL[2032] = 3,160,937.57), so it discriminates a
    // tax/NOL recurrence that depends on the (option-dependent) D&A series.
    const r90 = r90mByPeriod.get(2032)!.taxDirectBRL;
    const r100 = r100mByPeriod.get(2032)!.taxDirectBRL;
    checks.push(
      !close(r90, r100)
        ? pass("r90m_tax_nol_recomputed", `2032 taxDirect: r90m=${r90}, r100m=${r100} (recomputed from R$90M EBT)`)
        : fail("r90m_tax_nol_recomputed", `2032 taxDirect identical for R$90M and R$100M (${r90}) — expected difference`),
    );
  }

  {
    const actual = r90mByPeriod.get(PRE_OPS_PERIOD_KEY)!.capexExpansionBRL;
    checks.push(
      !close(actual, R100M_CAPEX_EXPANSION_SIGNED_BRL[PRE_OPS_PERIOD_KEY])
        ? pass("r90m_no_r100m_cached_leakage", `R$90M pre_ops expansion CAPEX (${actual}) differs from R$100M cached (-70,000,000)`)
        : fail("r90m_no_r100m_cached_leakage", `R$90M pre_ops expansion CAPEX equals R$100M cached value (${actual})`),
    );
  }

  // ── Boundary / scope validation (production orchestrator) ───────────────────

  {
    const mismatches: string[] = [];
    for (const periodKey of allPeriods) {
      const r90 = orchR90mByPeriod.get(periodKey)!.ebitdaBRL;
      const r100 = orchR100mByPeriod.get(periodKey)!.ebitdaBRL;
      if (!close(r90, r100)) {
        mismatches.push(`${String(periodKey)}: r90m=${r90}, r100m=${r100}`);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass("capex_never_changes_ebitda", "EBITDA identical for R$90M and R$100M, all 21 periods")
        : fail("capex_never_changes_ebitda", `EBITDA differs by CAPEX option: ${mismatches.join("; ")}`),
    );
  }

  checks.push(
    r100m.periods.length === 21 && r90m.periods.length === 21
      ? pass("result_has_exactly_21_periods", "Both results contain exactly 21 periods (pre_ops + 2028..2047)")
      : fail(
          "result_has_exactly_21_periods",
          `r100m.periods.length=${r100m.periods.length}, r90m.periods.length=${r90m.periods.length}, expected 21`,
        ),
  );

  {
    const ex = r100m.explicitExclusions;
    const allExcluded =
      ex.workingCapital === "excluded" &&
      ex.financingCashFlows === "excluded" &&
      ex.dcf === "excluded" &&
      ex.npv === "excluded" &&
      ex.tir === "excluded" &&
      ex.perpetuity === "excluded" &&
      ex.discountedPayback === "excluded" &&
      ex.tierInvestmentInterpretation === "excluded";
    checks.push(
      allExcluded
        ? pass("explicit_exclusions_present", "explicitExclusions declares workingCapital/financing/DCF/NPV/TIR/perpetuity/discountedPayback/Tier as excluded")
        : fail("explicit_exclusions_present", `explicitExclusions incomplete: ${JSON.stringify(ex)}`),
    );
  }

  {
    const same = JSON.stringify(r100m) === JSON.stringify(r100mRepeat);
    checks.push(
      same
        ? pass("repeated_calls_deterministic", "Two calls with identical input produced identical output")
        : fail("repeated_calls_deterministic", "Repeated calls with identical input produced different output"),
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
  };
}

// Production-engine result, for downstream consumers / manual inspection.
// Reports the calculateDre()-fed integrated bridge for both CAPEX options.
// See the Phase 15B.2 scenario-mismatch note in capitalDecisionEngine.ts:
// for the canonical validation scenario, this does NOT match the workbook's
// cached PnL!291-296 bridge for 2028-2047 (integratedBaselineParityStatus:
// "workbook_baseline_parity_not_established"), which is expected and is not
// a bridge-formula defect.
export function getValidationOrchestratorResults(): {
  readonly r100m: CapitalDecisionResult;
  readonly r90m: CapitalDecisionResult;
} {
  return {
    r100m: calculateCapitalDecisionBridge({ ...VALIDATION_INPUT_BASE, capexOptionId: "capex_100m_brl" }),
    r90m: calculateCapitalDecisionBridge({ ...VALIDATION_INPUT_BASE, capexOptionId: "capex_90m_brl" }),
  };
}

// Eagerly-evaluated reports, following this model directory's convention
// (e.g. DRE_EBITDA_BACKTEST_VALIDATION_REPORT in dreEbitdaBacktestValidation.ts):
// importing this module computes and exposes the validation report and the
// production-orchestrator results for inspection, without needing an ad-hoc
// runner script. CAPITAL_DECISION_ORCHESTRATOR_RESULTS.r100m/r90m each carry
// calculationReadiness: "structurally_calculated" and
// integratedBaselineParityStatus: "workbook_baseline_parity_not_established"
// (see capitalDecisionEngine.ts), reflecting the Phase 15B.2 scenario-mismatch
// note documented above.
export const CAPITAL_DECISION_ENGINE_VALIDATION_REPORT = runCapitalDecisionEngineValidation();
export const CAPITAL_DECISION_ORCHESTRATOR_RESULTS = getValidationOrchestratorResults();
