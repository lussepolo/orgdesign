// V10-F2 — canonical v10 tuition escalation mechanism.
//
// Governing source: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx"
// SHA-256 2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0.
// Sheet "PnL", row 9, "Reajuste Serviços". Project-owner confirmed: Reajuste
// Serviços = Mensalidade (tuition adjustment). Directly verified cell-by-cell
// via raw OOXML inspection (V10-F2.1), including Excel shared-formula
// resolution (anchor + si-index + relative-reference shifting), E9:X9
// (2028-2047):
//   E9 = E6+2% = 6.0% (2028)
//   F9:X9 = <col>6+2% = 5.9% flat (2029-2047)
// Every cell F9 through X9 is a shared-formula member (t="shared", si="9",
// anchor formula "E6+2%") — CORRECTING the prior V10-F2 session's claim that
// F9:N9 were "hardcoded literals, not formula-derived." They are formula-
// derived, chained off IPCA row 6, through column X (2047). The resolved
// VALUES (6.0% / 5.9% flat) were already correct; only the mechanism
// description was wrong. The 2038-2047 continuation is now directly
// source-evidenced (O9:X9 all resolve to 5.9%), not an extrapolation
// assumption. (This mechanism correction does not reopen the settled
// Reajuste Serviços = Mensalidade decision or change any rate constant.)
//
// Base-year treatment (Case B — explicit 2028 value, no conversion applied):
// TUITION_SOURCE_RECORDS (tuitionSourceData.ts) values are cross-checked
// directly against v10 sheet "Resumos PPT", columns Q/R, explicitly labeled
// "Valor Contrato (2028)" / "Valor Mensalidade (2028)" — e.g. TODDLERS 1
// R2=7615.8369368457134 matches the stored 7615.84 exactly. The stored
// tuition figures are therefore already an explicit 2028 base, not a 2027
// value requiring a one-time 6.0% conversion (contrast with V10-P1 payroll,
// where stored salary was on a 2027 basis and DID require ×1.06). Applying
// the E9 6.0% rate here would double-count an adjustment already baked into
// the stored 2028 figures — it is NOT applied.
//
// Separate, independently named module from src/lib/payroll/payrollGrowth.ts —
// tuition and salary escalation are numerically identical at 5.9%/2029+ today
// but are independently governed (PnL row 9 vs row 12) and must not share a
// constant.

export const V10_TUITION_SOURCE = {
  workbook: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  sheet: "PnL",
  row: 9,
  rowLabel: "Reajuste Serviços",
  governanceStatus: "approved_by_project_owner" as const,
  approvalReference:
    "Project-owner confirmation that Reajuste Serviços means Mensalidade (V10-F2, 2026-07-27)",
  baseYearInterpretation:
    "Case B — TUITION_SOURCE_RECORDS values are explicit 2028 figures, verified against v10 " +
    "'Resumos PPT' columns Q/R ('Valor Contrato (2028)' / 'Valor Mensalidade (2028)'). No " +
    "2027-to-2028 conversion is applied.",
  supportedHorizon:
    "2028-2037 direct workbook years, plus 2038-2047 directly source-evidenced via shared-" +
    "formula resolution (E9:X9 all verified, not extrapolated).",
} as const;

// Directly verified v10 PnL!E9:N9 (Reajuste Serviços), 2028-2037.
export const V10_TUITION_RATE_BY_YEAR: Readonly<Record<number, number>> = {
  2028: 0.06,
  2029: 0.059,
  2030: 0.059,
  2031: 0.059,
  2032: 0.059,
  2033: 0.059,
  2034: 0.059,
  2035: 0.059,
  2036: 0.059,
  2037: 0.059,
};

export const TUITION_BASE_YEAR_2028 = 2028;

// Recurring tuition escalation, applied for each year after 2028
// (v10 PnL!F9:N9, Reajuste Serviços 2029-2037, flat 5.9%). The 2028 6.0%
// rate (E9) is NOT applied — see baseYearInterpretation above (Case B).
export const TUITION_ESCALATION_RATE_2029_PLUS = 0.059;

/** 1.0 at/before 2028; 1.059^(year-2028) afterward. */
export function resolveTuitionGrowthFactor(year: number): number {
  if (year <= TUITION_BASE_YEAR_2028) return 1;
  return Math.pow(1 + TUITION_ESCALATION_RATE_2029_PLUS, year - TUITION_BASE_YEAR_2028);
}

export function tuitionValueForYear(tuitionBase2028: number, year: number): number {
  return tuitionBase2028 * resolveTuitionGrowthFactor(year);
}
