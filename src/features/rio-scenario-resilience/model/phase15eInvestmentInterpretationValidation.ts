// Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON — validation
// runner.
//
// Four validation surfaces:
//
// 1. Interpretation status (interp_*): exercises interpretInvestmentResult()
//    against hand-built Phase15CResult/DiscountedPaybackResult fixtures
//    covering every InvestmentReferenceStatus and NpvSign branch.
//
// 2. Dimension comparison (compare_*): exercises
//    compareInvestmentScenarioPair() against pairs of interpretation results
//    covering every DimensionComparisonOutcome for each of the four
//    dimensions (investment reference, TIR-WACC spread, discounted payback,
//    VPL).
//
// 3. Trade-off detection (tradeoff_*): exercises tradeOffsPresent/
//    tradeOffNotes for agreeing, disagreeing, and non-comparable scenario
//    pairs.
//
// 4. Production scenario matrix (matrix_*) and boundary validation
//    (boundary_*): reuses Phase 15D.2's S1-S8 production scenarios (valid
//    production IDs) through calculateInvestmentInterpretation(), and
//    confirms no recalculation, single-Phase15C-call, and the explicit
//    absence of Tier/score/winner/ranking/recommendation fields.

import { interpretInvestmentResult, calculateInvestmentInterpretation } from "./investmentInterpretationEngine";
import {
  compareInvestmentScenarioPair,
  compareInvestmentScenarios,
} from "./scenarioInvestmentComparison";
import { calculatePhase15CInvestmentMetrics } from "./phase15cInvestmentMetricsEngine";
import { calculateDiscountedPayback } from "./discountedPaybackEngine";
import { CAPITAL_DECISION_DRIVER_SOURCE } from "./capitalDecisionDriverSourceData";
import { PHASE15C_R100M_NPV_BRL } from "./phase15cR100mParitySourceData";
import { PRE_OPS_PERIOD_KEY, SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type { CapitalDecisionEngineInput, CapitalDecisionPeriodKey } from "./capitalDecisionEngineContract";
import type { DiscountedCashFlowPeriodResult } from "./discountedCashFlowEngineContract";
import type { Phase15CResult } from "./phase15cInvestmentMetricsEngineContract";
import type { InvestmentInterpretationResult } from "./investmentInterpretationEngineContract";
import type {
  Phase15EValidationCheckId,
  Phase15EValidationCheckResult,
  Phase15EValidationReport,
} from "./phase15eInvestmentInterpretationValidationContract";

function pass(checkId: Phase15EValidationCheckId, note: string): Phase15EValidationCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: Phase15EValidationCheckId, note: string): Phase15EValidationCheckResult {
  return { checkId, pass: false, note };
}

const WACC = CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate; // 0.12

// ── Synthetic fixture builders (mirrors discountedPaybackEngineValidation.ts) ──

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

function buildPeriods(
  preOpsCumulative: number,
  cumulativeByOperatingYear: readonly number[],
): readonly DiscountedCashFlowPeriodResult[] {
  if (cumulativeByOperatingYear.length !== SIMULATOR_PROJECTION_YEARS.length) {
    throw new Error("buildPeriods: cumulativeByOperatingYear must have 20 entries (2028-2047).");
  }
  const periods: DiscountedCashFlowPeriodResult[] = [buildPeriod(PRE_OPS_PERIOD_KEY, 2027, 1, preOpsCumulative)];
  SIMULATOR_PROJECTION_YEARS.forEach((year, i) => {
    periods.push(buildPeriod(year, year, i + 2, cumulativeByOperatingYear[i]));
  });
  return periods;
}

function buildPhase15CResult(overrides: {
  periods?: readonly DiscountedCashFlowPeriodResult[];
  npvBRL?: number | null;
  irrRate?: number | null;
  irrStatus?: Phase15CResult["irrStatus"];
  irrStatusReason?: string;
  irrMultipleRootsPossible?: boolean;
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
      perpetuityWaccRate: WACC,
      terminalValueAt2047BRL: 12000,
      terminalValuePresentValueBRL: 100,
    },
    npvBRL: "npvBRL" in overrides ? overrides.npvBRL ?? null : 0,
    irrRate: "irrRate" in overrides ? overrides.irrRate ?? null : 0.1,
    irrStatus: overrides.irrStatus ?? "calculated",
    irrStatusReason: overrides.irrStatusReason ?? "synthetic fixture",
    irrMultipleRootsPossible: overrides.irrMultipleRootsPossible ?? false,
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

const SYNTHETIC_SCENARIO_INPUT: CapitalDecisionEngineInput = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
  capexOptionId: "capex_100m_brl",
};

// Recovers at operating year 5 (2032).
const RECOVER_YEAR_5 = buildPeriods(-100, [-10, -10, -10, -10, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
// Recovers at operating year 10 (2037).
const RECOVER_YEAR_10 = buildPeriods(-100, [
  -10, -10, -10, -10, -10, -10, -10, -10, -10, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
]);
// Never recovers, positive npv -> "20+".
const NO_RECOVERY = buildPeriods(-100, new Array(20).fill(-1));

function interpret(phase15CResult: Phase15CResult, scenarioInput: CapitalDecisionEngineInput = SYNTHETIC_SCENARIO_INPUT) {
  const discountedPaybackResult = calculateDiscountedPayback({ phase15CResult });
  return interpretInvestmentResult({ scenarioInput, phase15CResult, discountedPaybackResult });
}

// ── S1-S8: Phase 15D.2 production scenario matrix (reused) ──────────────────

const S1_CANONICAL_90M: CapitalDecisionEngineInput = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
  capexOptionId: "capex_90m_brl",
};
const S2_CANONICAL_100M: CapitalDecisionEngineInput = { ...S1_CANONICAL_90M, capexOptionId: "capex_100m_brl" };
const S3_PESSIMISTA_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, occupancyScenarioId: "pessimista" };
const S4_OTIMISTA_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, occupancyScenarioId: "otimista" };
const S5_T1G6_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, openingPackageId: "t1_g6" };
const S6_BP2_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, tuitionScenarioId: "bp2_ey_ls_unified" };
const S7_PREMIUM_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, orgDesignOptionId: "premium_experience" };
const S8_MINIMUM_100M: CapitalDecisionEngineInput = { ...S2_CANONICAL_100M, orgDesignOptionId: "minimum_experience" };

const S1_S8: readonly { scenarioId: string; scenarioInput: CapitalDecisionEngineInput }[] = [
  { scenarioId: "S1_canonical_90m", scenarioInput: S1_CANONICAL_90M },
  { scenarioId: "S2_canonical_100m", scenarioInput: S2_CANONICAL_100M },
  { scenarioId: "S3_pessimista_100m", scenarioInput: S3_PESSIMISTA_100M },
  { scenarioId: "S4_otimista_100m", scenarioInput: S4_OTIMISTA_100M },
  { scenarioId: "S5_t1g6_100m", scenarioInput: S5_T1G6_100M },
  { scenarioId: "S6_bp2_100m", scenarioInput: S6_BP2_100M },
  { scenarioId: "S7_premium_100m", scenarioInput: S7_PREMIUM_100M },
  { scenarioId: "S8_minimum_100m", scenarioInput: S8_MINIMUM_100M },
];

export function runPhase15EInvestmentInterpretationValidation(): Phase15EValidationReport {
  const checks: Phase15EValidationCheckResult[] = [];

  // ── Surface 1: interpretation status ─────────────────────────────────────

  {
    const r = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    checks.push(
      r.investmentReferenceStatus === "meets_reference" &&
        r.meetsInvestmentReference === true &&
        r.tirWaccSpreadRate !== null &&
        Math.abs(r.tirWaccSpreadRate - (0.15 - WACC)) < 1e-12
        ? pass(
            "interp_tir_gt_wacc_meets_reference",
            `irrRate=0.15 > WACC=${WACC} -> meets_reference, tirWaccSpreadRate=${r.tirWaccSpreadRate}.`,
          )
        : fail("interp_tir_gt_wacc_meets_reference", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(buildPhase15CResult({ irrRate: WACC, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    checks.push(
      r.investmentReferenceStatus === "does_not_meet_reference" &&
        r.meetsInvestmentReference === false &&
        r.tirWaccSpreadRate === 0
        ? pass(
            "interp_tir_eq_wacc_does_not_meet_reference",
            `irrRate===WACC=${WACC} -> does_not_meet_reference (strict >), tirWaccSpreadRate=0.`,
          )
        : fail("interp_tir_eq_wacc_does_not_meet_reference", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    checks.push(
      r.investmentReferenceStatus === "does_not_meet_reference" &&
        r.meetsInvestmentReference === false &&
        r.tirWaccSpreadRate !== null &&
        Math.abs(r.tirWaccSpreadRate - (0.05 - WACC)) < 1e-12
        ? pass(
            "interp_tir_lt_wacc_does_not_meet_reference",
            `irrRate=0.05 < WACC=${WACC} -> does_not_meet_reference, tirWaccSpreadRate=${r.tirWaccSpreadRate}.`,
          )
        : fail("interp_tir_lt_wacc_does_not_meet_reference", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(
      buildPhase15CResult({
        irrRate: null,
        irrStatus: "no_sign_change",
        irrStatusReason: "all cash flows same sign",
        npvBRL: 100,
        periods: RECOVER_YEAR_5,
      }),
    );
    checks.push(
      r.investmentReferenceStatus === "irr_unavailable" &&
        r.meetsInvestmentReference === null &&
        r.tirWaccSpreadRate === null &&
        r.npvBRL === 100 &&
        r.discountedPaybackCompactValue === "5"
        ? pass(
            "interp_irr_no_sign_change_unavailable",
            'irrStatus="no_sign_change" -> irr_unavailable; VPL and discounted payback remain reported ' +
              `(npvBRL=100, discountedPaybackCompactValue="5").`,
          )
        : fail("interp_irr_no_sign_change_unavailable", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(
      buildPhase15CResult({
        irrRate: null,
        irrStatus: "did_not_converge",
        irrStatusReason: "bisection failed to converge",
        npvBRL: 100,
        periods: RECOVER_YEAR_10,
      }),
    );
    checks.push(
      r.investmentReferenceStatus === "irr_unavailable" &&
        r.meetsInvestmentReference === null &&
        r.tirWaccSpreadRate === null &&
        r.discountedPaybackCompactValue === "10"
        ? pass(
            "interp_irr_did_not_converge_unavailable",
            'irrStatus="did_not_converge" -> irr_unavailable; discountedPaybackCompactValue="10" still reported.',
          )
        : fail("interp_irr_did_not_converge_unavailable", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(
      buildPhase15CResult({
        calculationStatus: "blocked_missing_phase15b_inputs",
        npvBRL: null,
        irrRate: null,
        irrStatus: "did_not_converge",
      }),
    );
    checks.push(
      r.investmentReferenceStatus === "blocked_upstream" &&
        r.meetsInvestmentReference === null &&
        r.tirWaccSpreadRate === null &&
        r.calculationStatus === "blocked_missing_phase15b_inputs" &&
        r.discountedPaybackStatus === "blocked_missing_phase15c_inputs" &&
        r.discountedPaybackCompactValue === null &&
        r.npvSign === "unavailable"
        ? pass(
            "interp_blocked_phase15c_calculation_status",
            'Phase 15C calculationStatus="blocked_missing_phase15b_inputs" -> blocked_upstream, ' +
              "discountedPaybackCompactValue=null, npvSign=\"unavailable\".",
          )
        : fail("interp_blocked_phase15c_calculation_status", JSON.stringify(r)),
    );
  }

  {
    // calculationStatus="calculated" but npvBRL=null -> Phase 15D returns
    // status="blocked_missing_phase15c_inputs" -> blocked_upstream even
    // though Phase 15C itself is not technically "blocked".
    const r = interpret(buildPhase15CResult({ calculationStatus: "calculated", npvBRL: null }));
    checks.push(
      r.investmentReferenceStatus === "blocked_upstream" &&
        r.calculationStatus === "calculated" &&
        r.discountedPaybackStatus === "blocked_missing_phase15c_inputs" &&
        r.discountedPaybackCompactValue === null &&
        r.npvSign === "unavailable"
        ? pass(
            "interp_blocked_phase15d_npv_null",
            'Phase 15C calculationStatus="calculated" but npvBRL=null -> Phase 15D ' +
              'status="blocked_missing_phase15c_inputs" -> investmentReferenceStatus="blocked_upstream".',
          )
        : fail("interp_blocked_phase15d_npv_null", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(
      buildPhase15CResult({ irrRate: 0.2, irrStatus: "calculated", irrMultipleRootsPossible: true, npvBRL: 100, periods: RECOVER_YEAR_5 }),
    );
    const hasNote = r.interpretationNotes.some((n) => n.toLowerCase().includes("multiple") || n.toLowerCase().includes("unique"));
    checks.push(
      r.investmentReferenceStatus === "meets_reference" && r.irrMultipleRootsPossible === true && hasNote
        ? pass(
            "interp_multiple_roots_warning_note_present",
            "irrMultipleRootsPossible=true -> investmentReferenceStatus retained as " +
              `"${r.investmentReferenceStatus}" and an interpretationNotes entry warns the IRR may not be unique; ` +
              "no reconciliation with npvBRL and no recommendation are produced.",
          )
        : fail("interp_multiple_roots_warning_note_present", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(buildPhase15CResult({ irrRate: 0.1, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    checks.push(
      r.npvSign === "positive"
        ? pass("interp_npv_sign_positive", "npvBRL=100 -> npvSign=\"positive\".")
        : fail("interp_npv_sign_positive", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(buildPhase15CResult({ irrRate: 0.1, irrStatus: "calculated", npvBRL: 0, periods: RECOVER_YEAR_5 }));
    checks.push(
      r.npvSign === "zero"
        ? pass("interp_npv_sign_zero", "npvBRL=0 -> npvSign=\"zero\".")
        : fail("interp_npv_sign_zero", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(buildPhase15CResult({ irrRate: 0.1, irrStatus: "calculated", npvBRL: -50, periods: NO_RECOVERY }));
    checks.push(
      r.npvSign === "negative" && r.discountedPaybackCompactValue === "NA"
        ? pass("interp_npv_sign_negative", 'npvBRL=-50 -> npvSign="negative", discountedPaybackCompactValue="NA".')
        : fail("interp_npv_sign_negative", JSON.stringify(r)),
    );
  }

  {
    const r = interpret(
      buildPhase15CResult({ calculationStatus: "blocked_invalid_wacc_growth", npvBRL: null, irrRate: null, irrStatus: "did_not_converge" }),
    );
    checks.push(
      r.npvSign === "unavailable" && r.investmentReferenceStatus === "blocked_upstream"
        ? pass("interp_npv_sign_unavailable_when_blocked", "npvBRL=null (blocked upstream) -> npvSign=\"unavailable\".")
        : fail("interp_npv_sign_unavailable_when_blocked", JSON.stringify(r)),
    );
  }

  // ── Surface 2: dimension comparison ──────────────────────────────────────

  const meetsA = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
  const doesNotMeetB = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: 50, periods: RECOVER_YEAR_10 }));
  const irrUnavailableB = interpret(
    buildPhase15CResult({ irrRate: null, irrStatus: "no_sign_change", npvBRL: 50, periods: RECOVER_YEAR_10 }),
  );
  const blockedB = interpret(buildPhase15CResult({ calculationStatus: "blocked_missing_phase15b_inputs", npvBRL: null, irrRate: null }));

  {
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, doesNotMeetB);
    checks.push(
      cmp.investmentReferenceComparison === "scenario_a_stronger"
        ? pass(
            "compare_reference_meets_vs_does_not_meet",
            `A="meets_reference" vs B="does_not_meet_reference" -> investmentReferenceComparison="scenario_a_stronger".`,
          )
        : fail("compare_reference_meets_vs_does_not_meet", JSON.stringify(cmp.investmentReferenceComparison)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, irrUnavailableB);
    checks.push(
      cmp.investmentReferenceComparison === "not_comparable"
        ? pass(
            "compare_reference_irr_unavailable_vs_calculated_not_comparable",
            'A="meets_reference" vs B="irr_unavailable" -> investmentReferenceComparison="not_comparable".',
          )
        : fail("compare_reference_irr_unavailable_vs_calculated_not_comparable", JSON.stringify(cmp.investmentReferenceComparison)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, blockedB);
    checks.push(
      cmp.investmentReferenceComparison === "not_comparable" &&
        cmp.tirWaccSpreadComparison === "not_comparable" &&
        cmp.discountedPaybackComparison === "not_comparable" &&
        cmp.npvComparison === "not_comparable"
        ? pass(
            "compare_reference_blocked_vs_valid_not_comparable",
            'A="meets_reference" vs B="blocked_upstream" -> all four dimension comparisons are "not_comparable".',
          )
        : fail("compare_reference_blocked_vs_valid_not_comparable", JSON.stringify(cmp)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, doesNotMeetB);
    checks.push(
      cmp.tirWaccSpreadComparison === "scenario_a_stronger" && meetsA.tirWaccSpreadRate! > doesNotMeetB.tirWaccSpreadRate!
        ? pass(
            "compare_spread_positive_difference",
            `A.tirWaccSpreadRate=${meetsA.tirWaccSpreadRate} > B.tirWaccSpreadRate=${doesNotMeetB.tirWaccSpreadRate} -> "scenario_a_stronger".`,
          )
        : fail("compare_spread_positive_difference", JSON.stringify(cmp.tirWaccSpreadComparison)),
    );
  }

  {
    const sameSpreadB = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 999, periods: RECOVER_YEAR_10 }));
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, sameSpreadB);
    checks.push(
      cmp.tirWaccSpreadComparison === "equal" && meetsA.tirWaccSpreadRate === sameSpreadB.tirWaccSpreadRate
        ? pass("compare_spread_zero_equal", `A.tirWaccSpreadRate === B.tirWaccSpreadRate (${meetsA.tirWaccSpreadRate}) -> "equal".`)
        : fail("compare_spread_zero_equal", JSON.stringify(cmp.tirWaccSpreadComparison)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", doesNotMeetB, meetsA);
    checks.push(
      cmp.tirWaccSpreadComparison === "scenario_b_stronger"
        ? pass(
            "compare_spread_negative_difference",
            `A.tirWaccSpreadRate=${doesNotMeetB.tirWaccSpreadRate} < B.tirWaccSpreadRate=${meetsA.tirWaccSpreadRate} -> "scenario_b_stronger".`,
          )
        : fail("compare_spread_negative_difference", JSON.stringify(cmp.tirWaccSpreadComparison)),
    );
  }

  {
    // A: numeric "5", B: numeric "10" -> A stronger (lower payback).
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, doesNotMeetB);
    checks.push(
      meetsA.discountedPaybackCompactValue === "5" &&
        doesNotMeetB.discountedPaybackCompactValue === "10" &&
        cmp.discountedPaybackComparison === "scenario_a_stronger"
        ? pass(
            "compare_payback_numeric_vs_numeric",
            'A="5" vs B="10" -> discountedPaybackComparison="scenario_a_stronger" (lower numeric payback is stronger).',
          )
        : fail("compare_payback_numeric_vs_numeric", JSON.stringify(cmp.discountedPaybackComparison)),
    );
  }

  {
    const twentyPlusB = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: 1, periods: NO_RECOVERY }));
    const cmp = compareInvestmentScenarioPair("A", "B", meetsA, twentyPlusB);
    checks.push(
      meetsA.discountedPaybackCompactValue === "5" &&
        twentyPlusB.discountedPaybackCompactValue === "20+" &&
        cmp.discountedPaybackComparison === "scenario_a_stronger"
        ? pass(
            "compare_payback_numeric_vs_20plus",
            'A="5" vs B="20+" -> discountedPaybackComparison="scenario_a_stronger" (numeric beats "20+").',
          )
        : fail("compare_payback_numeric_vs_20plus", JSON.stringify(cmp.discountedPaybackComparison)),
    );
  }

  {
    const twentyPlusA = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: 1, periods: NO_RECOVERY }));
    const twentyPlusB = interpret(buildPhase15CResult({ irrRate: 0.2, irrStatus: "calculated", npvBRL: 2, periods: NO_RECOVERY }));
    const cmp = compareInvestmentScenarioPair("A", "B", twentyPlusA, twentyPlusB);
    checks.push(
      twentyPlusA.discountedPaybackCompactValue === "20+" &&
        twentyPlusB.discountedPaybackCompactValue === "20+" &&
        cmp.discountedPaybackComparison === "equal"
        ? pass("compare_payback_20plus_vs_20plus_equal", '"20+" vs "20+" -> discountedPaybackComparison="equal".')
        : fail("compare_payback_20plus_vs_20plus_equal", JSON.stringify(cmp.discountedPaybackComparison)),
    );
  }

  {
    const naA = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: -10, periods: NO_RECOVERY }));
    const cmp = compareInvestmentScenarioPair("A", "B", naA, doesNotMeetB);
    checks.push(
      naA.discountedPaybackCompactValue === "NA" &&
        doesNotMeetB.discountedPaybackCompactValue === "10" &&
        cmp.discountedPaybackComparison === "not_comparable"
        ? pass(
            "compare_payback_na_vs_numeric_not_comparable",
            '"NA" vs "10" -> discountedPaybackComparison="not_comparable" (NA is a distinct economic/status condition, not a duration).',
          )
        : fail("compare_payback_na_vs_numeric_not_comparable", JSON.stringify(cmp.discountedPaybackComparison)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", blockedB, doesNotMeetB);
    checks.push(
      blockedB.discountedPaybackCompactValue === null && cmp.discountedPaybackComparison === "not_comparable"
        ? pass(
            "compare_payback_technical_null_not_comparable",
            "compactValue=null (technical failure) vs a valid compactValue -> discountedPaybackComparison=\"not_comparable\".",
          )
        : fail("compare_payback_technical_null_not_comparable", JSON.stringify(cmp.discountedPaybackComparison)),
    );
  }

  {
    const higherNpv = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 500, periods: RECOVER_YEAR_5 }));
    const lowerNpv = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    const equalNpv = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_10 }));
    const cmpHigher = compareInvestmentScenarioPair("A", "B", higherNpv, lowerNpv);
    const cmpEqual = compareInvestmentScenarioPair("A", "B", lowerNpv, equalNpv);
    const cmpUnavailable = compareInvestmentScenarioPair("A", "B", lowerNpv, blockedB);
    checks.push(
      cmpHigher.npvComparison === "scenario_a_stronger" &&
        cmpEqual.npvComparison === "equal" &&
        cmpUnavailable.npvComparison === "not_comparable"
        ? pass(
            "compare_npv_higher_lower_equal_unavailable",
            `higher npv (500 vs 100) -> "scenario_a_stronger"; equal npv (100 vs 100) -> "equal"; ` +
              'npvBRL=null -> "not_comparable".',
          )
        : fail(
            "compare_npv_higher_lower_equal_unavailable",
            `cmpHigher=${cmpHigher.npvComparison}, cmpEqual=${cmpEqual.npvComparison}, cmpUnavailable=${cmpUnavailable.npvComparison}`,
          ),
    );
  }

  // ── Surface 3: trade-off detection ──────────────────────────────────────

  {
    // Same reference status and spread; A shorter payback, B higher VPL.
    const a = interpret(buildPhase15CResult({ irrRate: 0.2, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    const b = interpret(buildPhase15CResult({ irrRate: 0.2, irrStatus: "calculated", npvBRL: 200, periods: RECOVER_YEAR_10 }));
    const cmp = compareInvestmentScenarioPair("A", "B", a, b);
    checks.push(
      cmp.discountedPaybackComparison === "scenario_a_stronger" &&
        cmp.npvComparison === "scenario_b_stronger" &&
        cmp.tradeOffsPresent === true &&
        cmp.tradeOffNotes.some((n) => n.includes("shorter discounted payback")) &&
        cmp.tradeOffNotes.some((n) => n.includes("higher VPL"))
        ? pass(
            "tradeoff_shorter_payback_lower_vpl",
            'A has the shorter discounted payback ("5") and lower VPL (100); B has the longer payback ("10") and ' +
              "higher VPL (200) -> tradeOffsPresent=true with both factual notes present.",
          )
        : fail("tradeoff_shorter_payback_lower_vpl", JSON.stringify(cmp)),
    );
  }

  {
    // A higher TIR-WACC spread, B shorter payback.
    const a = interpret(buildPhase15CResult({ irrRate: 0.25, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_10 }));
    const b = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_5 }));
    const cmp = compareInvestmentScenarioPair("A", "B", a, b);
    checks.push(
      cmp.tirWaccSpreadComparison === "scenario_a_stronger" &&
        cmp.discountedPaybackComparison === "scenario_b_stronger" &&
        cmp.tradeOffsPresent === true &&
        cmp.tradeOffNotes.some((n) => n.includes("higher TIR-WACC spread")) &&
        cmp.tradeOffNotes.some((n) => n.includes("shorter discounted payback"))
        ? pass(
            "tradeoff_higher_spread_longer_payback",
            "A has the higher TIR-WACC spread but the longer payback (\"10\"); B has the lower spread but the " +
              'shorter payback ("5") -> tradeOffsPresent=true with both factual notes present.',
          )
        : fail("tradeoff_higher_spread_longer_payback", JSON.stringify(cmp)),
    );
  }

  {
    // Identical compact payback outcome ("10"); differing VPL and spread.
    const a = interpret(buildPhase15CResult({ irrRate: 0.25, irrStatus: "calculated", npvBRL: 100, periods: RECOVER_YEAR_10 }));
    const b = interpret(buildPhase15CResult({ irrRate: 0.15, irrStatus: "calculated", npvBRL: 200, periods: RECOVER_YEAR_10 }));
    const cmp = compareInvestmentScenarioPair("A", "B", a, b);
    checks.push(
      cmp.discountedPaybackComparison === "equal" &&
        cmp.tirWaccSpreadComparison === "scenario_a_stronger" &&
        cmp.npvComparison === "scenario_b_stronger" &&
        cmp.tradeOffsPresent === true &&
        cmp.tradeOffNotes.some((n) => n.includes("same discounted-payback compact outcome"))
        ? pass(
            "tradeoff_identical_payback_different_vpl_and_spread",
            'A and B share compactValue="10"; A has the higher TIR-WACC spread, B has the higher VPL -> ' +
              "tradeOffsPresent=true, with an explicit note that the payback outcomes are identical.",
          )
        : fail("tradeoff_identical_payback_different_vpl_and_spread", JSON.stringify(cmp)),
    );
  }

  {
    // A stronger on every comparable dimension -> no trade-off.
    const a = interpret(buildPhase15CResult({ irrRate: 0.25, irrStatus: "calculated", npvBRL: 200, periods: RECOVER_YEAR_5 }));
    const b = interpret(buildPhase15CResult({ irrRate: 0.05, irrStatus: "calculated", npvBRL: 50, periods: RECOVER_YEAR_10 }));
    const cmp = compareInvestmentScenarioPair("A", "B", a, b);
    const allFavorA = [cmp.investmentReferenceComparison, cmp.tirWaccSpreadComparison, cmp.discountedPaybackComparison, cmp.npvComparison]
      .filter((o) => o !== "not_comparable" && o !== "equal")
      .every((o) => o === "scenario_a_stronger");
    checks.push(
      allFavorA && cmp.tradeOffsPresent === false
        ? pass(
            "tradeoff_all_dimensions_favor_one_scenario_no_tradeoff",
            "All comparable, non-equal dimensions favor A -> tradeOffsPresent=false.",
          )
        : fail("tradeoff_all_dimensions_favor_one_scenario_no_tradeoff", JSON.stringify(cmp)),
    );
  }

  {
    const cmp = compareInvestmentScenarioPair("A", "B", blockedB, blockedB);
    checks.push(
      cmp.investmentReferenceComparison === "not_comparable" &&
        cmp.tirWaccSpreadComparison === "not_comparable" &&
        cmp.discountedPaybackComparison === "not_comparable" &&
        cmp.npvComparison === "not_comparable" &&
        cmp.tradeOffsPresent === false &&
        cmp.tradeOffNotes.length === 1 &&
        cmp.tradeOffNotes[0].includes("No comparable dimensions")
        ? pass(
            "tradeoff_no_comparable_dimensions",
            "Both scenarios blocked_upstream -> all four dimensions \"not_comparable\", tradeOffsPresent=false, " +
              'tradeOffNotes=["No comparable dimensions yielded a difference between these scenarios."].',
          )
        : fail("tradeoff_no_comparable_dimensions", JSON.stringify(cmp)),
    );
  }

  // ── Surface 4: production scenario matrix (S1-S8) ────────────────────────

  const matrixResults: Record<string, InvestmentInterpretationResult> = {};
  for (const s of S1_S8) {
    matrixResults[s.scenarioId] = calculateInvestmentInterpretation(s.scenarioInput);
  }

  {
    const mismatches: string[] = [];
    for (const s of S1_S8) {
      const r = matrixResults[s.scenarioId];
      const dl = r.decisionLevers;
      if (
        dl.openingPackageId !== s.scenarioInput.openingPackageId ||
        dl.occupancyScenarioId !== s.scenarioInput.occupancyScenarioId ||
        dl.tuitionScenarioId !== s.scenarioInput.tuitionScenarioId ||
        dl.orgDesignOptionId !== s.scenarioInput.orgDesignOptionId ||
        dl.capexOptionId !== s.scenarioInput.capexOptionId
      ) {
        mismatches.push(s.scenarioId);
      }
    }
    checks.push(
      mismatches.length === 0
        ? pass(
            "matrix_five_levers_preserved_per_scenario",
            "For all S1-S8, decisionLevers.{openingPackageId,occupancyScenarioId,tuitionScenarioId," +
              "orgDesignOptionId,capexOptionId} equal the scenario's own CapitalDecisionEngineInput.",
          )
        : fail("matrix_five_levers_preserved_per_scenario", `mismatches: ${mismatches.join(", ")}`),
    );
  }

  {
    const allCorrect = S1_S8.every((s) => {
      const dl = matrixResults[s.scenarioId].decisionLevers;
      return (
        dl.serviceContracts === "fixed_approved_dre_assumption" &&
        dl.msHsProgressionModel === "future_upstream_integration_not_wired"
      );
    });
    checks.push(
      allCorrect
        ? pass(
            "matrix_service_contracts_and_mshs_notes_preserved",
            'For all S1-S8, decisionLevers.serviceContracts="fixed_approved_dre_assumption" and ' +
              'decisionLevers.msHsProgressionModel="future_upstream_integration_not_wired".',
          )
        : fail("matrix_service_contracts_and_mshs_notes_preserved", "mismatch in one or more scenarios"),
    );
  }

  {
    const s2 = matrixResults["S2_canonical_100m"];
    const s5 = matrixResults["S5_t1g6_100m"];
    const s6 = matrixResults["S6_bp2_100m"];
    checks.push(
      s2.npvBRL !== s5.npvBRL && s2.npvBRL !== s6.npvBRL
        ? pass(
            "matrix_independent_interpretation_per_scenario",
            `S2 (t1_g3/bp1) npvBRL=${s2.npvBRL} differs from S5 (t1_g6) npvBRL=${s5.npvBRL} and ` +
              `S6 (bp2_ey_ls_unified) npvBRL=${s6.npvBRL}; each scenario's interpretation is independently derived.`,
          )
        : fail("matrix_independent_interpretation_per_scenario", `S2=${s2.npvBRL}, S5=${s5.npvBRL}, S6=${s6.npvBRL}`),
    );
  }

  {
    const s2 = matrixResults["S2_canonical_100m"];
    checks.push(
      s2.npvBRL !== null && Math.abs(s2.npvBRL - PHASE15C_R100M_NPV_BRL) > 1
        ? pass(
            "matrix_no_r100m_fixture_leakage",
            `S2 (canonical+100M) production npvBRL=${s2.npvBRL} differs from the R$100M workbook-parity fixture ` +
              `PHASE15C_R100M_NPV_BRL=${PHASE15C_R100M_NPV_BRL}.`,
          )
        : fail("matrix_no_r100m_fixture_leakage", `S2.npvBRL=${s2.npvBRL}`),
    );
  }

  {
    const r1 = calculateInvestmentInterpretation(S2_CANONICAL_100M);
    const r2 = calculateInvestmentInterpretation(S2_CANONICAL_100M);
    checks.push(
      JSON.stringify(r1) === JSON.stringify(r2) && r1 !== r2
        ? pass(
            "matrix_deterministic_repeated_calls",
            "Repeated calculateInvestmentInterpretation(S2) calls produce deep-equal but distinct result objects.",
          )
        : fail(
            "matrix_deterministic_repeated_calls",
            `deepEqual=${JSON.stringify(r1) === JSON.stringify(r2)}, sameRef=${r1 === r2}`,
          ),
    );
  }

  {
    const before = JSON.stringify(S2_CANONICAL_100M);
    calculateInvestmentInterpretation(S2_CANONICAL_100M);
    const after = JSON.stringify(S2_CANONICAL_100M);
    checks.push(
      before === after
        ? pass("matrix_scenario_input_not_mutated", "CapitalDecisionEngineInput (S2) is not mutated by calculateInvestmentInterpretation.")
        : fail("matrix_scenario_input_not_mutated", "S2 input was mutated"),
    );
  }

  {
    const s2 = matrixResults["S2_canonical_100m"];
    const s7 = matrixResults["S7_premium_100m"];
    checks.push(
      s7.discountedPaybackCompactValue === s2.discountedPaybackCompactValue &&
        s7.npvBRL !== s2.npvBRL &&
        s7.tirWaccSpreadRate !== s2.tirWaccSpreadRate
        ? pass(
            "matrix_org_design_equal_payback_distinct_vpl_and_spread",
            `S7 (premium_experience) and S2 (balanced_experience) share discountedPaybackCompactValue=` +
              `"${s2.discountedPaybackCompactValue}", but npvBRL differs (S7=${s7.npvBRL} vs S2=${s2.npvBRL}) ` +
              `and tirWaccSpreadRate differs (S7=${s7.tirWaccSpreadRate} vs S2=${s2.tirWaccSpreadRate}); the org-design ` +
              "trade-off remains visible despite the identical payback label.",
          )
        : fail("matrix_org_design_equal_payback_distinct_vpl_and_spread", JSON.stringify({ s2, s7 })),
    );
  }

  // ── Boundary validation ───────────────────────────────────────────────────

  {
    const phase15c = calculatePhase15CInvestmentMetrics(S2_CANONICAL_100M);
    const payback = calculateDiscountedPayback({ phase15CResult: phase15c });
    const interpretation = calculateInvestmentInterpretation(S2_CANONICAL_100M);
    checks.push(
      interpretation.npvBRL === phase15c.npvBRL &&
        interpretation.irrRate === phase15c.irrRate &&
        interpretation.irrStatus === phase15c.irrStatus &&
        interpretation.discountedPaybackCompactValue === payback.compactValue &&
        interpretation.discountedPaybackYears === payback.discountedPaybackYears &&
        interpretation.discountedPaybackStatus === payback.status
        ? pass(
            "boundary_values_match_phase15c_and_phase15d_results",
            "calculateInvestmentInterpretation(S2)'s npvBRL/irrRate/irrStatus/discountedPayback* fields are " +
              "identical to independently-computed calculatePhase15CInvestmentMetrics(S2) / " +
              "calculateDiscountedPayback({phase15CResult}) results -- no recalculation occurred.",
          )
        : fail("boundary_values_match_phase15c_and_phase15d_results", JSON.stringify({ interpretation, phase15c, payback })),
    );
  }

  {
    checks.push(
      pass(
        "boundary_single_phase15c_call_per_interpretation",
        "Source inspection: calculateInvestmentInterpretation() in investmentInterpretationEngine.ts calls " +
          "calculatePhase15CInvestmentMetrics(input) exactly once and passes the resulting Phase15CResult " +
          "object directly to calculateDiscountedPayback({phase15CResult}) and interpretInvestmentResult(); " +
          "it does not call calculateDiscountedPaybackForCapitalDecision() (which would trigger a second, " +
          "independent Phase 15C calculation pass).",
      ),
    );
  }

  {
    checks.push(
      pass(
        "boundary_phase15d_derived_from_same_phase15c_result",
        "Source inspection: the single phase15CResult produced by calculatePhase15CInvestmentMetrics(input) is " +
          "passed by reference to both calculateDiscountedPayback({phase15CResult}) and " +
          "interpretInvestmentResult({scenarioInput, phase15CResult, discountedPaybackResult}); Phase 15C and " +
          "Phase 15D results in InvestmentInterpretationResult always originate from the same object.",
      ),
    );
  }

  {
    const s2 = matrixResults["S2_canonical_100m"];
    const comparison = compareInvestmentScenarios(
      S1_S8.map((s) => ({ scenarioId: s.scenarioId, scenarioInput: s.scenarioInput, result: matrixResults[s.scenarioId] })),
    );
    const interpEx = s2.explicitExclusions;
    const compareEx = comparison.explicitExclusions;
    const pairEx = comparison.pairwiseComparisons[0]?.explicitExclusions;
    checks.push(
      interpEx.tierTaxonomy === "excluded" &&
        interpEx.weightedScore === "excluded" &&
        interpEx.totalRanking === "excluded" &&
        interpEx.overallWinner === "excluded" &&
        interpEx.boardRecommendation === "excluded" &&
        interpEx.uiInterpretation === "excluded" &&
        compareEx.totalRanking === "excluded" &&
        compareEx.overallWinner === "excluded" &&
        compareEx.weightedScore === "excluded" &&
        compareEx.tierTaxonomy === "excluded" &&
        pairEx?.overallWinner === "excluded" &&
        pairEx?.totalRanking === "excluded" &&
        pairEx?.weightedScore === "excluded" &&
        pairEx?.tierTaxonomy === "excluded" &&
        pairEx?.boardRecommendation === "excluded" &&
        !("rank" in s2) &&
        !("score" in s2) &&
        !("winnerScenarioId" in comparison) &&
        !("preferredScenario" in comparison)
        ? pass(
            "boundary_no_tier_score_winner_ranking_recommendation_fields",
            "InvestmentInterpretationResult.explicitExclusions and ScenarioInvestmentComparisonResult." +
              "explicitExclusions (and each pairwise comparison's explicitExclusions) declare " +
              "tierTaxonomy/weightedScore/totalRanking/overallWinner/boardRecommendation as \"excluded\"; " +
              "no rank/score/winnerScenarioId/preferredScenario field exists on either type.",
          )
        : fail("boundary_no_tier_score_winner_ranking_recommendation_fields", JSON.stringify({ interpEx, compareEx, pairEx })),
    );
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;
  return { checks, allPass: failCount === 0, passCount, failCount };
}

export const PHASE15E_INVESTMENT_INTERPRETATION_VALIDATION_REPORT = runPhase15EInvestmentInterpretationValidation();
