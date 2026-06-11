// Mature-state carry-forward source data.
// Phase 11B (2026-06-07): derives 2038–2047 records from the 2037 Finance-validated baseline.
//
// Business logic approved by Luciana:
// - 2028–2037 are ramp-up years.
// - 2037 is the mature-state baseline year with the full school structure active.
// - 2038–2047 continue that structure under the same scenario-specific enrollment values.
//
// Derivation approach:
// - Each 2037 enrollment record (per package × scenario × grade) is carried forward
//   to 2038–2047 with the same enrollment value.
// - Each 2037 active-grade record (per package × grade) is carried forward to 2038–2047
//   with the same activeStatus.
// - Occupancy scenarios remain DISTINCT: pessimista / intermediario / otimista each
//   carry forward their own 2037 values independently.
//
// These records are NOT Finance-entered annual source records.
// They are model-derived carry-forward records with explicit provenance.
//
// Key provenance fields:
// - isCarryForwardYear: false   → usable records; not placeholders
// - isMatureStateExtension: true → model-derived, not direct Finance entry
// - derivedFromBaselineYear: 2037
// - derivationMethod: "mature_state_carry_forward_from_2037"
//
// No EBITDA, CAPEX, OPEX, NPV, payback, Tier, or UI in this file.

import type {
  EnrollmentByYearAndGradeRecord,
  ActiveGradeByYearRecord,
} from "./openingPackageOccupancySourceDataContract";
import {
  OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS,
} from "./openingPackageOccupancySourceData";

export const MATURE_STATE_BASELINE_YEAR = 2037 as const;
export const MATURE_STATE_TARGET_YEARS = [
  2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047,
] as const;
export const MATURE_STATE_DERIVATION_METHOD = "mature_state_carry_forward_from_2037" as const;

const MATURE_STATE_PROVENANCE_NOTE =
  "Model-derived mature-state carry-forward from 2037 Finance-validated baseline. " +
  "Business logic: 2037 is the mature-state year with the full grade structure active. " +
  "2038–2047 continue the same occupancy-scenario-specific structure. " +
  "Approved by Luciana (Phase 11B, 2026-06-07). NOT a Finance-entered annual source record.";

// ── Enrollment carry-forward ─────────────────────────────────────────────────
// Filter the Finance-validated 2037 enrollment records — one per (package × scenario × grade).
// Carry each forward to 2038–2047 unchanged: the mature-state enrollment structure
// is stable. Each scenario's values remain independent (occupancy lever preserved).

const baseline2037Enrollment = OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.filter(
  (r) => r.year === MATURE_STATE_BASELINE_YEAR,
);

const derivedEnrollmentRecords: EnrollmentByYearAndGradeRecord[] = [];
for (const base of baseline2037Enrollment) {
  for (const targetYear of MATURE_STATE_TARGET_YEARS) {
    derivedEnrollmentRecords.push({
      ...base,
      year: targetYear,
      isCarryForwardYear: false,
      carryForwardSource: "mature_anchor_year",
      carryForwardApprovalStatus: "approved",
      blockingReason: "none",
      isMatureStateExtension: true,
      derivedFromBaselineYear: MATURE_STATE_BASELINE_YEAR,
      derivationMethod: MATURE_STATE_DERIVATION_METHOD,
      notes: MATURE_STATE_PROVENANCE_NOTE,
    });
  }
}

export const MATURE_STATE_ENROLLMENT_RECORDS: ReadonlyArray<EnrollmentByYearAndGradeRecord> =
  derivedEnrollmentRecords;

// ── Active-grade carry-forward ───────────────────────────────────────────────
// Active-grade records are not scenario-specific — the grade activation status
// per package is the same across all occupancy scenarios.
// Filter the Finance-validated 2037 active-grade records — one per (package × grade).
// In 2037, all 17 grades are active for all 4 packages (full school structure).
// Carry forward to 2038–2047: the full grade structure continues.

const baseline2037ActiveGrades = OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS.filter(
  (r) => r.year === MATURE_STATE_BASELINE_YEAR,
);

const derivedActiveGradeRecords: ActiveGradeByYearRecord[] = [];
for (const base of baseline2037ActiveGrades) {
  for (const targetYear of MATURE_STATE_TARGET_YEARS) {
    derivedActiveGradeRecords.push({
      ...base,
      year: targetYear,
      isCarryForwardYear: false,
      carryForwardSource: "mature_anchor_year",
      blockingReason: "none",
      isMatureStateExtension: true,
      derivedFromBaselineYear: MATURE_STATE_BASELINE_YEAR,
      derivationMethod: MATURE_STATE_DERIVATION_METHOD,
      notes: MATURE_STATE_PROVENANCE_NOTE,
    });
  }
}

export const MATURE_STATE_ACTIVE_GRADE_RECORDS: ReadonlyArray<ActiveGradeByYearRecord> =
  derivedActiveGradeRecords;

// ── Combined arrays ──────────────────────────────────────────────────────────
// These are the canonical 20-year source arrays for engines that need the full
// 2028–2047 horizon. Engines should import from here rather than from the
// direct-year source.

export const COMBINED_ENROLLMENT_RECORDS: ReadonlyArray<EnrollmentByYearAndGradeRecord> = [
  ...OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  ...MATURE_STATE_ENROLLMENT_RECORDS,
];

export const COMBINED_ACTIVE_GRADE_RECORDS: ReadonlyArray<ActiveGradeByYearRecord> = [
  ...OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS,
  ...MATURE_STATE_ACTIVE_GRADE_RECORDS,
];

// ── Provenance summary ───────────────────────────────────────────────────────
export const MATURE_STATE_CARRY_FORWARD_SUMMARY = {
  baselineYear: MATURE_STATE_BASELINE_YEAR,
  targetYears: MATURE_STATE_TARGET_YEARS,
  derivationMethod: MATURE_STATE_DERIVATION_METHOD,
  approvalStatus: "approved_by_luciana_phase_11b_2026_06_07",
  enrollmentRecordsDerived: derivedEnrollmentRecords.length,
  activeGradeRecordsDerived: derivedActiveGradeRecords.length,
  combinedEnrollmentRecordCount:
    OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.length +
    derivedEnrollmentRecords.length,
  combinedActiveGradeRecordCount:
    OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS.length +
    derivedActiveGradeRecords.length,
  occupancyScenariosRemainDistinct: true,
  note: MATURE_STATE_PROVENANCE_NOTE,
} as const;
