// Phase 15I.1 — DRE Governance-State and Finance-Source validator.
// Phase 15I.1 Closure Correction — Readiness Semantics and Payroll State.
//
// Run via: npm run validate:phase15i1
//
// 24 checks — three-state governance invariants, payroll/FOPAG model state,
// Finance-source open items, derived Boolean gates, and canonical fixture output.

import {
  DRE_GOVERNANCE_READINESS,
  DRE_ACTIVE_COMBINATION_COUNT,
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  DRE_HISTORICAL_GOVERNANCE_ITEMS,
  DRE_CALCULATION_ENGINE_IS_READY,
  DRE_FINANCE_SOURCES_CONFIRMED,
  DRE_BOARD_RATIFIED,
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
} from "./dreGovernanceReadiness";
import { CALCULATION_CAN_BEGIN, INPUT_READINESS_REGISTRY } from "./inputReadinessRegistry";
import {
  WORKING_SCENARIO_RATIFICATION_STATUS,
  WORKING_SCENARIO_DRE_OUTPUT,
} from "./dreWorkingScenario";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";

export type DreGovernanceReadinessCheckId =
  | "engineering_readiness_is_engineering_ready"
  | "calculation_availability_is_available"
  | "calculation_can_begin_is_true"
  | "finance_source_readiness_is_pending"
  | "board_ratification_is_not_ratified"
  | "working_scenario_is_technical_validation_fixture"
  | "payroll_fopag_model_is_implemented"
  | "instructional_capacity_is_established"
  | "payroll_capacity_alignment_is_reconciliation_required"
  | "payroll_registry_no_stale_fopag_sync"
  | "payroll_registry_no_stale_missing_implementation"
  | "payroll_registry_blocking_reason_is_reconciliation"
  | "all_active_items_block_calculation_false"
  | "active_ratification_items_are_explicit"
  | "all_active_items_calculation_continues_true"
  | "finance_sources_confirmed_flag_false"
  | "board_ratified_flag_false"
  | "finance_source_closure_incomplete"
  | "board_ratification_ready_false"
  | "calculation_engine_is_ready_flag_true"
  | "active_items_count_is_current"
  | "active_items_exclude_f01_formula_gap"
  | "active_items_exclude_f05_retired"
  | "historical_items_include_f01_and_f05"
  | "corporate_allocation_not_finance_source_item"
  | "active_combination_count_is_90"
  | "payroll_registry_status_blocked"
  | "canonical_fixture_2028_enrollment_258"
  | "canonical_fixture_ebitda_positive_by_2032";

export interface DreGovernanceReadinessCheck {
  checkId: DreGovernanceReadinessCheckId;
  pass: boolean;
  expected: string;
  actual: string;
  note: string;
}

export interface DreGovernanceReadinessReport {
  checks: readonly DreGovernanceReadinessCheck[];
  passCount: number;
  failCount: number;
  allPass: boolean;
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function check(
  checkId: DreGovernanceReadinessCheckId,
  actual: unknown,
  expected: unknown,
  note: string,
): DreGovernanceReadinessCheck {
  return {
    checkId,
    pass: Object.is(actual, expected),
    expected: stringifyValue(expected),
    actual: stringifyValue(actual),
    note,
  };
}

export function runDreGovernanceReadinessValidation(): DreGovernanceReadinessReport {
  const gov = DRE_GOVERNANCE_READINESS;
  const payrollEntry = INPUT_READINESS_REGISTRY.payroll_adapter_output;

  // Canonical fixture — use WORKING_SCENARIO_DRE_OUTPUT directly (t1_g6/base/bp1/balanced).
  // V10-E1 governed package migration (commit 3f4da5c, 2026-07-24) moved the fixture's
  // openingGrades selection from the retired t1_g3 package to the active t1_g6 package
  // (see WORKING_SCENARIO_SELECTIONS in dreWorkingScenario.ts); t1_g3/base is now rejected
  // by assertSupportedDreEnrollmentCapacityLeverInput. 258 is t1_g6/base's governed 2028
  // enrollment per the SHA256-verified G6 captação workbook in
  // governedCaptacaoCapacitySourceData.ts (G6_ENROLLMENT_BY_SCENARIO.base, 2028 column,
  // summed across the 11 active grades = 258) — independently cross-validated by
  // validate:phase15s1/validate:phase15s2 (t1_g4/base/2028 = 258 under the same governed
  // captação-workbook methodology). 228 was t1_g3's pre-migration figure.
  const dreOut = WORKING_SCENARIO_DRE_OUTPUT;
  const enrollment2028 = dreOut !== null ? dreOut.byYear[2028].numero_de_alunos : -1;
  const ebitdaPositiveYear = dreOut !== null
    ? (RECEITA_PROJECTION_YEARS.find((y) => dreOut.byYear[y].ebitda > 0) ?? null)
    : null;

  const allItemsBlockCalcFalse = gov.openItems.every((i) => i.blocksEngineCalculation === false);
  const ratificationBlockingItems = gov.openItems.filter((i) => i.boardRatificationStatus === "blocks_ratification");
  const allItemsCalcContinuesTrue = gov.openItems.every((i) => i.calculationContinues === true);
  const activeKeys = new Set(DRE_ACTIVE_GOVERNANCE_ITEMS.map((item) => item.key));
  const historicalKeys = new Set(DRE_HISTORICAL_GOVERNANCE_ITEMS.map((item) => item.key));
  const corporateAllocation = DRE_ACTIVE_GOVERNANCE_ITEMS.find((item) => item.key === "corporate_allocation_unavailable");

  const checks: DreGovernanceReadinessCheck[] = [
    // ── Phase A: Three-state governance invariants ──────────────────────────────
    check(
      "engineering_readiness_is_engineering_ready",
      gov.engineeringReadiness,
      "engineering_ready",
      "DRE engine is implemented and running; engineering gate is clear.",
    ),
    check(
      "calculation_availability_is_available",
      gov.calculationAvailability,
      "available",
      "Calculation availability is 'available' — the engine can produce deterministic output.",
    ),
    check(
      "calculation_can_begin_is_true",
      CALCULATION_CAN_BEGIN,
      true,
      "CALCULATION_CAN_BEGIN derives from engineering readiness and calculation availability; must be true.",
    ),
    check(
      "finance_source_readiness_is_pending",
      gov.financeSourceReadiness,
      "pending_finance_confirmation",
      "Finance-source confirmation has not been received; status must remain pending.",
    ),
    check(
      "board_ratification_is_not_ratified",
      gov.boardRatificationReadiness,
      "not_ratified",
      "Board has not ratified any scenario; status must remain not_ratified.",
    ),
    check(
      "working_scenario_is_technical_validation_fixture",
      WORKING_SCENARIO_RATIFICATION_STATUS,
      "technical_validation_fixture",
      "Working scenario ratification status must remain technical_validation_fixture until board ratification.",
    ),
    // ── Phase B: Payroll/FOPAG model state invariants ──────────────────────────
    check(
      "payroll_fopag_model_is_implemented",
      gov.payrollFopagModelStatus,
      "implemented",
      "FOPAG payroll model is implemented (orgDesignPayrollActivation.ts / fopagEngine.ts).",
    ),
    check(
      "instructional_capacity_is_established",
      gov.instructionalCapacityStatus,
      "established",
      "Instructional-capacity planning model is established (Phase 15H.2: MS 9 / HS 11 / combined 20).",
    ),
    check(
      "payroll_capacity_alignment_is_reconciliation_required",
      gov.payrollCapacityAlignmentStatus,
      "reconciliation_required",
      "Payroll/FOPAG and instructional-capacity alignment is pending dedicated reconciliation (Phase 15H.3, deferred).",
    ),
    // ── Phase C: Payroll registry blocking reason ──────────────────────────────
    check(
      "payroll_registry_no_stale_fopag_sync",
      (payrollEntry.blockingReason as string) === "missing_payroll_fopag_synchronization",
      false,
      "payroll_adapter_output must not use the removed 'missing_payroll_fopag_synchronization' blocking reason — it no longer exists in InputBlockingReason.",
    ),
    check(
      "payroll_registry_no_stale_missing_implementation",
      payrollEntry.blockingReason !== "missing_adapter_implementation",
      true,
      "payroll_adapter_output must not be classified as missing implementation — the model is implemented.",
    ),
    check(
      "payroll_registry_blocking_reason_is_reconciliation",
      payrollEntry.blockingReason,
      "reconciliation_required",
      "payroll_adapter_output blocking reason must be 'reconciliation_required' — synchronization is pending.",
    ),
    // ── Phase D: Open items invariants ─────────────────────────────────────────
    check(
      "all_active_items_block_calculation_false",
      allItemsBlockCalcFalse,
      true,
      "All active governance items must have blocksEngineCalculation:false — engine always calculates.",
    ),
    check(
      "active_ratification_items_are_explicit",
      ratificationBlockingItems.length,
      6,
      "Six active source/method/reconciliation items block ratification; corporate allocation is a capability/scope limitation, not a Finance-source approval item.",
    ),
    check(
      "all_active_items_calculation_continues_true",
      allItemsCalcContinuesTrue,
      true,
      "All active governance items must have calculationContinues:true — governance state does not halt the engine.",
    ),
    // ── Phase E: Derived Boolean gate invariants ───────────────────────────────
    check(
      "finance_sources_confirmed_flag_false",
      DRE_FINANCE_SOURCES_CONFIRMED,
      false,
      "DRE_FINANCE_SOURCES_CONFIRMED must be false — Finance sources have not been confirmed.",
    ),
    check(
      "board_ratified_flag_false",
      DRE_BOARD_RATIFIED,
      false,
      "DRE_BOARD_RATIFIED must be false — board has not ratified any scenario.",
    ),
    check(
      "finance_source_closure_incomplete",
      FINANCE_SOURCE_CLOSURE_COMPLETE,
      false,
      "FINANCE_SOURCE_CLOSURE_COMPLETE must be false — Finance-source confirmation gate is not cleared.",
    ),
    check(
      "board_ratification_ready_false",
      BOARD_RATIFICATION_READY,
      false,
      "BOARD_RATIFICATION_READY must be false — board ratification gate is not cleared.",
    ),
    check(
      "calculation_engine_is_ready_flag_true",
      DRE_CALCULATION_ENGINE_IS_READY,
      true,
      "DRE_CALCULATION_ENGINE_IS_READY must be true — the engine is implemented.",
    ),
    // ── Phase F: Active model and registry state ───────────────────────────────
    check(
      "active_items_count_is_current",
      gov.openItems.length,
      7,
      "Seven active non-calculation-blocking governance/scope items are displayed; retired F05 and resolved F01 formula gap are historical only.",
    ),
    check(
      "active_items_exclude_f01_formula_gap",
      activeKeys.has("outras_receitas_reajuste") || activeKeys.has("outras_receitas_reajuste_formula_gap"),
      false,
      "F01 must not appear as an active formula-gap warning after v10 row-11 adjustment was implemented.",
    ),
    check(
      "active_items_exclude_f05_retired",
      activeKeys.has("enrollment_baseline_parity") || activeKeys.has("enrollment_baseline_parity_retired"),
      false,
      "F05 must not appear in active warnings; t1_g3 is retired and blocks zero active cells.",
    ),
    check(
      "historical_items_include_f01_and_f05",
      historicalKeys.has("outras_receitas_reajuste_formula_gap") &&
        historicalKeys.has("enrollment_baseline_parity_retired"),
      true,
      "F01 formula gap and F05 retired enrollment parity must remain historical/retired, not active.",
    ),
    check(
      "corporate_allocation_not_finance_source_item",
      corporateAllocation?.classifications.includes("capability_unavailable") === true &&
        corporateAllocation?.boardRatificationStatus === "not_required",
      true,
      "Corporate allocation is an unavailable capability/scope limitation, not a Finance-source approval item or engine blocker.",
    ),
    check(
      "active_combination_count_is_90",
      DRE_ACTIVE_COMBINATION_COUNT,
      90,
      "Active DRE combinations are 2 opening packages × 3 captação scenarios × 5 tuition scenarios × 3 org-design options.",
    ),
    check(
      "payroll_registry_status_blocked",
      payrollEntry.status,
      "blocked",
      "payroll_adapter_output registry status must remain blocked — payroll/FOPAG sync is pending.",
    ),
    // ── Phase G: Canonical fixture invariants ──────────────────────────────────
    check(
      "canonical_fixture_2028_enrollment_258",
      enrollment2028,
      258,
      "Canonical fixture (t1_g6 / base / bp1_division_differentiated / balanced_experience) must produce 258 learners in 2028 (V10-E1 governed captação workbook).",
    ),
    check(
      "canonical_fixture_ebitda_positive_by_2032",
      ebitdaPositiveYear !== null && ebitdaPositiveYear <= 2032,
      true,
      "Canonical fixture first EBITDA-positive year must be 2032 or earlier.",
    ),
  ];

  const EXPECTED_CHECK_COUNT = 29;
  if (checks.length !== EXPECTED_CHECK_COUNT) {
    throw new Error(
      `dreGovernanceReadinessValidation: expected ${EXPECTED_CHECK_COUNT} checks, got ${checks.length}`,
    );
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.filter((c) => !c.pass).length;

  return { checks, passCount, failCount, allPass: failCount === 0 };
}
