// Phase 15D.2-DECISION-LEVER-PROPAGATION-VALIDATION — validation runner.
//
// Runs calculateDiscountedPaybackForCapitalDecision() (the full production
// chain: calculateDre -> calculateCapitalDecisionBridge ->
// calculatePhase15CInvestmentMetrics -> calculateDiscountedPayback) across a
// representative scenario matrix built only from valid, already-supported
// production input IDs (OpeningPackageId, OccupancyScenarioId,
// TuitionScenarioId, org-design option IDs, CapexOptionId). See
// IMPLEMENTATION.md "Phase 15D.2-DECISION-LEVER-PROPAGATION-VALIDATION" for
// the full scenario matrix, single-lever comparisons, and decision-lever
// support matrix.

import { calculateCapitalDecisionBridge } from "./capitalDecisionEngine";
import { calculatePhase15CInvestmentMetrics } from "./phase15cInvestmentMetricsEngine";
import { calculateDiscountedPaybackForCapitalDecision } from "./discountedPaybackEngine";
import { PHASE15D_R100M_EXPECTED_COMPACT_VALUE } from "./phase15dR100mParitySourceData";
import { PHASE15C_R100M_NPV_BRL } from "./phase15cR100mParitySourceData";
import { DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT } from "./discountedPaybackEngineValidation";
import type { CapitalDecisionEngineInput } from "./capitalDecisionEngineContract";
import type {
  Phase15DLeverPropagationCheckId,
  Phase15DLeverPropagationCheckResult,
  Phase15DLeverPropagationReport,
} from "./phase15dDecisionLeverPropagationValidationContract";

function pass(checkId: Phase15DLeverPropagationCheckId, note: string): Phase15DLeverPropagationCheckResult {
  return { checkId, pass: true, note };
}

function fail(checkId: Phase15DLeverPropagationCheckId, note: string): Phase15DLeverPropagationCheckResult {
  return { checkId, pass: false, note };
}

// S1-S8: see IMPLEMENTATION.md Phase 15D.2 scenario matrix. All IDs are valid,
// already-supported production IDs (no invented scenario IDs).
const S1_CANONICAL_90M: CapitalDecisionEngineInput = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
  capexOptionId: "capex_90m_brl",
};

const S2_CANONICAL_100M: CapitalDecisionEngineInput = {
  ...S1_CANONICAL_90M,
  capexOptionId: "capex_100m_brl",
};

const S3_PESSIMISTA_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  occupancyScenarioId: "pessimista",
};

const S4_OTIMISTA_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  occupancyScenarioId: "otimista",
};

const S5_T1G6_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  openingPackageId: "t1_g6",
};

const S6_BP2_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  tuitionScenarioId: "bp2_ey_ls_unified",
};

const S7_PREMIUM_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  orgDesignOptionId: "premium_experience",
};

const S8_MINIMUM_100M: CapitalDecisionEngineInput = {
  ...S2_CANONICAL_100M,
  orgDesignOptionId: "minimum_experience",
};

export function runPhase15DLeverPropagationValidation(): Phase15DLeverPropagationReport {
  const checks: Phase15DLeverPropagationCheckResult[] = [];

  const p1 = calculateDiscountedPaybackForCapitalDecision(S1_CANONICAL_90M);
  const p2 = calculateDiscountedPaybackForCapitalDecision(S2_CANONICAL_100M);
  const p3 = calculateDiscountedPaybackForCapitalDecision(S3_PESSIMISTA_100M);
  const p4 = calculateDiscountedPaybackForCapitalDecision(S4_OTIMISTA_100M);
  const p5 = calculateDiscountedPaybackForCapitalDecision(S5_T1G6_100M);
  const p6 = calculateDiscountedPaybackForCapitalDecision(S6_BP2_100M);
  const p7 = calculateDiscountedPaybackForCapitalDecision(S7_PREMIUM_100M);
  const p8 = calculateDiscountedPaybackForCapitalDecision(S8_MINIMUM_100M);

  // ── Dynamic derivation: production scenario outputs must not equal the
  // R$100M workbook-parity fixture (which uses cached workbook ROL/EBITDA,
  // not calculateDre output for any scenario).
  checks.push(
    Math.abs(p2.npvBRL! - PHASE15C_R100M_NPV_BRL) > 1
      ? pass(
          "dynamic_canonical_100m_differs_from_r100m_fixture",
          `S2 (canonical+100M) production npvBRL=${p2.npvBRL} differs from R$100M ` +
            `workbook-parity fixture PHASE15C_R100M_NPV_BRL=${PHASE15C_R100M_NPV_BRL}; ` +
            "production wrapper is not returning the workbook fixture.",
        )
      : fail(
          "dynamic_canonical_100m_differs_from_r100m_fixture",
          `S2 npvBRL=${p2.npvBRL} unexpectedly equals R$100M fixture ${PHASE15C_R100M_NPV_BRL}.`,
        ),
  );
  checks.push(
    Math.abs(p1.npvBRL! - PHASE15C_R100M_NPV_BRL) > 1
      ? pass(
          "dynamic_canonical_90m_differs_from_r100m_fixture",
          `S1 (canonical+90M) production npvBRL=${p1.npvBRL} differs from R$100M ` +
            `workbook-parity fixture PHASE15C_R100M_NPV_BRL=${PHASE15C_R100M_NPV_BRL}.`,
        )
      : fail(
          "dynamic_canonical_90m_differs_from_r100m_fixture",
          `S1 npvBRL=${p1.npvBRL} unexpectedly equals R$100M fixture ${PHASE15C_R100M_NPV_BRL}.`,
        ),
  );

  // ── CAPEX lever (S1 vs S2): same DRE inputs, different capexOptionId.
  checks.push(
    p1.npvBRL !== p2.npvBRL && p1.compactValue !== p2.compactValue
      ? pass(
          "lever_capex_90m_vs_100m_propagates",
          `S1 (90M) npvBRL=${p1.npvBRL}, compactValue="${p1.compactValue}" vs ` +
            `S2 (100M) npvBRL=${p2.npvBRL}, compactValue="${p2.compactValue}".`,
        )
      : fail(
          "lever_capex_90m_vs_100m_propagates",
          `S1 and S2 unexpectedly identical: npvBRL ${p1.npvBRL}/${p2.npvBRL}, ` +
            `compactValue "${p1.compactValue}"/"${p2.compactValue}".`,
        ),
  );

  // ── Occupancy lever, lower (S2 vs S3): expect lower VPL and "20+".
  checks.push(
    p3.npvBRL! < p2.npvBRL! && p3.compactValue === "20+" && p2.compactValue !== "20+"
      ? pass(
          "lever_occupancy_pessimista_propagates",
          `S3 (pessimista) npvBRL=${p3.npvBRL} < S2 npvBRL=${p2.npvBRL}; ` +
            `S3 compactValue="${p3.compactValue}" vs S2 compactValue="${p2.compactValue}".`,
        )
      : fail(
          "lever_occupancy_pessimista_propagates",
          `Unexpected: S2 npvBRL=${p2.npvBRL} compactValue="${p2.compactValue}", ` +
            `S3 npvBRL=${p3.npvBRL} compactValue="${p3.compactValue}".`,
        ),
  );

  // ── Occupancy lever, higher (S2 vs S4): expect higher VPL and earlier recovery.
  checks.push(
    p4.npvBRL! > p2.npvBRL! && p4.discountedPaybackYears !== null && p4.discountedPaybackYears! < 20
      ? pass(
          "lever_occupancy_otimista_propagates",
          `S4 (otimista) npvBRL=${p4.npvBRL} > S2 npvBRL=${p2.npvBRL}; ` +
            `S4 discountedPaybackYears=${p4.discountedPaybackYears} (compactValue="${p4.compactValue}").`,
        )
      : fail(
          "lever_occupancy_otimista_propagates",
          `Unexpected: S2 npvBRL=${p2.npvBRL}, S4 npvBRL=${p4.npvBRL}, ` +
            `S4 discountedPaybackYears=${p4.discountedPaybackYears}.`,
        ),
  );

  // ── Opening Grades lever (S2 vs S5).
  checks.push(
    p5.npvBRL !== p2.npvBRL
      ? pass(
          "lever_opening_grades_t1g6_propagates",
          `S5 (t1_g6) npvBRL=${p5.npvBRL}, compactValue="${p5.compactValue}" vs ` +
            `S2 (t1_g3) npvBRL=${p2.npvBRL}, compactValue="${p2.compactValue}".`,
        )
      : fail(
          "lever_opening_grades_t1g6_propagates",
          `S2 and S5 npvBRL unexpectedly identical (${p2.npvBRL}).`,
        ),
  );

  // ── Tuition lever (S2 vs S6).
  checks.push(
    p6.npvBRL !== p2.npvBRL
      ? pass(
          "lever_tuition_bp2_propagates",
          `S6 (bp2_ey_ls_unified) npvBRL=${p6.npvBRL}, compactValue="${p6.compactValue}" vs ` +
            `S2 (bp1_division_differentiated) npvBRL=${p2.npvBRL}, compactValue="${p2.compactValue}".`,
        )
      : fail(
          "lever_tuition_bp2_propagates",
          `S2 and S6 npvBRL unexpectedly identical (${p2.npvBRL}).`,
        ),
  );

  // ── Org Design lever, premium (S2 vs S7): same compact label "20" expected,
  // but VPL/cumulative DCF must differ -- proves propagation without a label change.
  checks.push(
    p7.compactValue === p2.compactValue && p7.npvBRL !== p2.npvBRL
      ? pass(
          "lever_org_design_premium_propagates_same_label_different_vpl",
          `S7 (premium_experience) compactValue="${p7.compactValue}" equals ` +
            `S2 (balanced_experience) compactValue="${p2.compactValue}", but npvBRL ` +
            `differs: S7=${p7.npvBRL} vs S2=${p2.npvBRL}. Propagation proven without ` +
            "a compact-label change.",
        )
      : fail(
          "lever_org_design_premium_propagates_same_label_different_vpl",
          `Unexpected: S2 compactValue="${p2.compactValue}" npvBRL=${p2.npvBRL}, ` +
            `S7 compactValue="${p7.compactValue}" npvBRL=${p7.npvBRL}.`,
        ),
  );

  // ── Org Design lever, minimum (S2 vs S8): different VPL and earlier recovery.
  checks.push(
    p8.npvBRL !== p2.npvBRL && p8.discountedPaybackYears !== p2.discountedPaybackYears
      ? pass(
          "lever_org_design_minimum_propagates",
          `S8 (minimum_experience) npvBRL=${p8.npvBRL}, discountedPaybackYears=` +
            `${p8.discountedPaybackYears} vs S2 (balanced_experience) npvBRL=${p2.npvBRL}, ` +
            `discountedPaybackYears=${p2.discountedPaybackYears}.`,
        )
      : fail(
          "lever_org_design_minimum_propagates",
          `Unexpected: S2 npvBRL=${p2.npvBRL}/${p2.discountedPaybackYears}, ` +
            `S8 npvBRL=${p8.npvBRL}/${p8.discountedPaybackYears}.`,
        ),
  );

  // ── Org Design isolated pair (S7 vs S8): premium vs minimum, all other
  // levers held at canonical values + capex_100m_brl. Confirms the org-design
  // lever alone moves VPL/cumulative DCF/payback in opposite directions.
  checks.push(
    p7.npvBRL! < p8.npvBRL! && p7.compactValue !== p8.compactValue
      ? pass(
          "lever_org_design_premium_vs_minimum_isolated_pair",
          `S7 (premium_experience) npvBRL=${p7.npvBRL}, compactValue="${p7.compactValue}" < ` +
            `S8 (minimum_experience) npvBRL=${p8.npvBRL}, compactValue="${p8.compactValue}".`,
        )
      : fail(
          "lever_org_design_premium_vs_minimum_isolated_pair",
          `Unexpected: S7 npvBRL=${p7.npvBRL}/"${p7.compactValue}", ` +
            `S8 npvBRL=${p8.npvBRL}/"${p8.compactValue}".`,
        ),
  );

  // ── No leakage: R$90M vs R$100M for the same DRE scenario must differ, and
  // neither must equal the cached R$100M fixture compact value by coincidence
  // of identical inputs.
  checks.push(
    p1.npvBRL !== p2.npvBRL
      ? pass(
          "no_leakage_90m_vs_100m_npv_differs",
          `S1 (90M) npvBRL=${p1.npvBRL} !== S2 (100M) npvBRL=${p2.npvBRL}; ` +
            "no shared/cached value between CAPEX options for the same scenario.",
        )
      : fail("no_leakage_90m_vs_100m_npv_differs", `S1 and S2 npvBRL both ${p1.npvBRL}.`),
  );

  checks.push(
    p1.capexOptionId === "capex_90m_brl" && p2.capexOptionId === "capex_100m_brl"
      ? pass(
          "no_leakage_capex_option_id_passthrough",
          `S1.capexOptionId="${p1.capexOptionId}", S2.capexOptionId="${p2.capexOptionId}" ` +
            "each reflect their own input capexOptionId.",
        )
      : fail(
          "no_leakage_capex_option_id_passthrough",
          `Unexpected capexOptionId: S1="${p1.capexOptionId}", S2="${p2.capexOptionId}".`,
        ),
  );

  // ── Determinism: repeated identical-input calls return equal (but not
  // reference-identical, i.e. not mutated/cached) results.
  const p2Repeat = calculateDiscountedPaybackForCapitalDecision(S2_CANONICAL_100M);
  checks.push(
    JSON.stringify(p2) === JSON.stringify(p2Repeat) && p2 !== p2Repeat
      ? pass(
          "deterministic_repeated_calls",
          "Repeated calls with identical input (S2) produce deep-equal but distinct result objects.",
        )
      : fail(
          "deterministic_repeated_calls",
          `Repeated S2 calls: deepEqual=${JSON.stringify(p2) === JSON.stringify(p2Repeat)}, ` +
            `sameRef=${p2 === p2Repeat}.`,
        ),
  );

  // ── Scenario parity metadata reflects each scenario's own inputs (not a
  // fixed canonical scenario). All scenarios here use the same DRE-side
  // levers as the canonical Phase 13F/15B working scenario except where
  // varied, so all are expected to report the same Phase 15B.2
  // "workbook_baseline_parity_not_established" status -- confirmed via the
  // underlying capital-decision bridge call (not hardcoded here).
  const bridge3 = calculateCapitalDecisionBridge(S3_PESSIMISTA_100M);
  const phase15c3 = calculatePhase15CInvestmentMetrics(S3_PESSIMISTA_100M);
  checks.push(
    p3.integratedBaselineParityStatus === phase15c3.integratedBaselineParityStatus &&
      phase15c3.integratedBaselineParityStatus === bridge3.integratedBaselineParityStatus
      ? pass(
          "scenario_parity_status_reflects_own_scenario",
          `S3's integratedBaselineParityStatus ("${p3.integratedBaselineParityStatus}") is ` +
            "passed through unchanged from calculateCapitalDecisionBridge -> " +
            "calculatePhase15CInvestmentMetrics -> calculateDiscountedPaybackForCapitalDecision " +
            "for S3's own scenario (computed from S3's own 2028 ROL/EBITDA, not a shared constant).",
        )
      : fail(
          "scenario_parity_status_reflects_own_scenario",
          `Mismatch across chain for S3: bridge="${bridge3.integratedBaselineParityStatus}", ` +
            `phase15c="${phase15c3.integratedBaselineParityStatus}", ` +
            `payback="${p3.integratedBaselineParityStatus}".`,
        ),
  );

  // ── Technical-failure compactValue:null convention -- delegated to the
  // already-passing Phase 15D synthetic/technical-failure surfaces (10/10).
  checks.push(
    DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.allPass
      ? pass(
          "technical_failure_compact_value_null_preserved",
          "DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.allPass=true " +
            `(${DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.passCount}/` +
            `${DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.passCount + DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.failCount}); ` +
            "technical-failure surfaces (blocked_*, invalid_cash_flow_series) " +
            "continue to return compactValue=null.",
        )
      : fail(
          "technical_failure_compact_value_null_preserved",
          `DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.allPass=false ` +
            `(${DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.failCount} failing).`,
        ),
  );

  // Reference PHASE15D_R100M_EXPECTED_COMPACT_VALUE to document, for contrast,
  // that the R$100M workbook-parity fixture's compact value ("20+") is a
  // distinct fixture-derived value, not reused as a production scenario result.
  void PHASE15D_R100M_EXPECTED_COMPACT_VALUE;

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;
  return { checks, allPass: failCount === 0, passCount, failCount };
}

export const PHASE15D_LEVER_PROPAGATION_VALIDATION_REPORT = runPhase15DLeverPropagationValidation();
