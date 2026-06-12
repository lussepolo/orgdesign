// CAPEX engine validation matrix types.
// Phase 10C.1 (2026-06-07): validates both CAPEX options and the invalid-ID guard.

import type { CapexOptionId } from "./capexOptionSourceContract";

// One row per tested input (capex_90m_brl, capex_100m_brl, invalid_id_guard).
export interface CapexEngineValidationRow {
  capexOptionId: string;
  calculationReady: boolean;
  blockingDiagnosticCount: number;
  nonBlockingDiagnosticCount: number;
  totalCapexPositiveBRL: number;
  totalCapexCashFlowSignedBRL: number;
  capexExposureBRL: number;
  // capexExposureBRL === totalCapexPositiveBRL.
  exposureMatchesTotal: boolean;
  // totalCapexPositiveBRL matches the option's known amount (90M or 100M).
  matchesKnownAmount: boolean;
  // totalCapexCashFlowSignedBRL === -totalCapexPositiveBRL.
  signedIsNegativeOfPositive: boolean;
  periodRecordCount: number;
  // Expect 21 (1 pre_ops + 20 projection years).
  periodRecordCountCorrect: boolean;
  includesPreOps: boolean;
  projectionYearCount: number;
  // Expect 20 (2028–2047).
  projectionYearCountCorrect: boolean;
  firstProjectionYear: number;
  lastProjectionYear: number;
  perpetuityExcluded: boolean;
  allSignedValuesNonPositive: boolean;
  allPositiveValuesNonNegative: boolean;
  // positiveScheduleSum !== 173,217,008 — reference pattern not consumed.
  referencePatternNotConsumed: boolean;
  // pre_ops investment !== 70,000,000 — reference value not used directly.
  preOpsIsScaledNotReference: boolean;
  // Expected pre_ops positive value (capex_90m_brl: 36,370,563; capex_100m_brl: 40,411,737).
  expectedPreOpsPositiveBRL: number | null;
  actualPreOpsPositiveBRL: number;
  preOpsMatchesExpected: boolean;
  pass: boolean;
  threwError?: string;
}

export interface CapexEngineValidationMatrixOutput {
  validatedAt: string;
  totalRows: number;
  passCount: number;
  failCount: number;
  allPass: boolean;
  // Invalid-ID guard test: engine returns blocked output for unknown capexOptionId.
  invalidIdGuardPasses: boolean;
  rows: readonly CapexEngineValidationRow[];
  matrixNote: string;
}

// Known amounts for each valid option — used as external reference constants
// that the validation checks the engine output against.
// These are NOT derived from the engine — they are the authoritative source totals.
export const CAPEX_KNOWN_OPTION_AMOUNTS: Record<CapexOptionId, number> = {
  capex_90m_brl: 90_000_000,
  capex_100m_brl: 100_000_000,
};

// Known pre_ops scaled values — for cross-checking engine pre_ops output.
// Derived from: option_total × (70M / 173,217,008), rounded ROUND_HALF_UP.
export const CAPEX_KNOWN_PRE_OPS_POSITIVE: Record<CapexOptionId, number> = {
  capex_90m_brl: 36_370_563,
  capex_100m_brl: 40_411_737,
};

// Reference pattern total — must NOT equal any valid option's total.
export const REFERENCE_PATTERN_TOTAL_BRL = 173_217_008;

// Reference pre_ops value — must NOT equal any option's scaled pre_ops.
export const REFERENCE_PRE_OPS_BRL = 70_000_000;
