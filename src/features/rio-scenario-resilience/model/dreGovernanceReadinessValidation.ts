// Phase 15I.1 — DRE Governance-State and Finance-Source validator.
// Phase 15I.1 Closure Correction — Readiness Semantics and Payroll State.
//
// Run via: npm run validate:phase15i1
//
// 24 checks — three-state governance invariants, payroll/FOPAG model state,
// Finance-source open items, derived Boolean gates, and canonical fixture output.

import {
  DRE_GOVERNANCE_READINESS,
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
  | "all_open_items_block_calculation_false"
  | "all_open_items_block_ratification_true"
  | "all_open_items_calculation_continues_true"
  | "finance_sources_confirmed_flag_false"
  | "board_ratified_flag_false"
  | "finance_source_closure_incomplete"
  | "board_ratification_ready_false"
  | "calculation_engine_is_ready_flag_true"
  | "open_items_count_is_five"
  | "payroll_registry_status_blocked"
  | "canonical_fixture_2028_enrollment_228"
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

  // Canonical fixture — use WORKING_SCENARIO_DRE_OUTPUT directly (t1_g3/intermediario/bp1/balanced)
  const dreOut = WORKING_SCENARIO_DRE_OUTPUT;
  const enrollment2028 = dreOut !== null ? dreOut.byYear[2028].numero_de_alunos : -1;
  const ebitdaPositiveYear = dreOut !== null
    ? (RECEITA_PROJECTION_YEARS.find((y) => dreOut.byYear[y].ebitda > 0) ?? null)
    : null;

  const allItemsBlockCalcFalse = gov.openItems.every((i) => i.blocksEngineCalculation === false);
  const allItemsBlockRatificationTrue = gov.openItems.every((i) => i.blocksBoardRatification === true);
  const allItemsCalcContinuesTrue = gov.openItems.every((i) => i.calculationContinues === true);

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
      "all_open_items_block_calculation_false",
      allItemsBlockCalcFalse,
      true,
      "All open items must have blocksEngineCalculation:false — engine always calculates.",
    ),
    check(
      "all_open_items_block_ratification_true",
      allItemsBlockRatificationTrue,
      true,
      "All open items must have blocksBoardRatification:true — ratification requires full Finance closure.",
    ),
    check(
      "all_open_items_calculation_continues_true",
      allItemsCalcContinuesTrue,
      true,
      "All open items must have calculationContinues:true — governance state does not halt the engine.",
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
    // ── Phase F: Open items count and registry state ───────────────────────────
    // Phase 15I.2C: F02 resolved as engineering item — 5 open items remain.
    check(
      "open_items_count_is_five",
      gov.openItems.length,
      5,
      "Exactly five Finance-source open items must be registered (F02 resolved in Phase 15I.2C).",
    ),
    check(
      "payroll_registry_status_blocked",
      payrollEntry.status,
      "blocked",
      "payroll_adapter_output registry status must remain blocked — payroll/FOPAG sync is pending.",
    ),
    // ── Phase G: Canonical fixture invariants ──────────────────────────────────
    check(
      "canonical_fixture_2028_enrollment_228",
      enrollment2028,
      228,
      "Canonical fixture (t1_g3 / intermediario / bp1_division_differentiated / balanced_experience) must produce 228 learners in 2028.",
    ),
    check(
      "canonical_fixture_ebitda_positive_by_2032",
      ebitdaPositiveYear !== null && ebitdaPositiveYear <= 2032,
      true,
      "Canonical fixture first EBITDA-positive year must be 2032 or earlier.",
    ),
  ];

  const EXPECTED_CHECK_COUNT = 24;
  if (checks.length !== EXPECTED_CHECK_COUNT) {
    throw new Error(
      `dreGovernanceReadinessValidation: expected ${EXPECTED_CHECK_COUNT} checks, got ${checks.length}`,
    );
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.filter((c) => !c.pass).length;

  return { checks, passCount, failCount, allPass: failCount === 0 };
}
