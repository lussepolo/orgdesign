// V10-P1 — canonical payroll escalation mechanics.
//
// Governing source: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx"
// SHA-256 2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0.
// Sheet "PnL", row 12 ("Dissídio", salary escalation) and row 13
// ("Benefícios", benefits escalation). Directly verified 2028–2037:
//   Dissídio:   E12=6.0% (2028), F12:N12=5.9% flat (2029–2037)
//   Benefícios: D13:N13=10% flat (2027–2037, hardcoded, not formula-derived)
// v10's own payroll build (Org. Design Cargos / Cenários Org Design / Org.
// Design sheets) applies the 6.0% exactly once to convert a 2027 "Salário
// Posição" into an explicit 2028 salary base, then escalates 5.9%/year from
// 2029. Benefits in v10 are NOT a clean 2027×1.10 conversion — the 2028
// benefits base there is a separately-assembled component total — but the
// 10% figure is confirmed to apply only from 2029 onward in the workbook.
//
// Application role-provenance audit (V10-P1, Section 5): every runtime
// role's stored grossMonthly cross-checks exactly against the v10 workbook's
// 2027-basis "Org. Design Cargos" sheet (e.g. Head of School 51167.45;
// ×1.06 = 54237.497 matches v10's 2028 "Parâmetros 2028" column exactly).
// Salary is therefore Case A (confirmed 2027 source) for every directly
// mapped role, and Case D (unclear-but-preserved) for the small number of
// roles without a direct v10 mapping — both cases resolve to the same
// formula: salaryBase2028 = stored × 1.06.
//
// Stored benefitsMonthly does NOT cross-check cleanly against any single
// v10 conversion factor for any role (component-level mismatch, not a flat
// 6% or 10% delta) — benefits base-year provenance is Case D (unclear) for
// every role. Per the V10-P1 base-year normalization rule for Case D, the
// existing effective 2028 benefits amount is preserved as the provisional
// benefitsBase2028 rather than re-derived from 1.10 or stripped to the raw
// stored figure. That effective amount is stored × 1.06 (the same
// conversion rate as salary), matching what the pre-migration runtime
// formula already produced at year 2028 — NOT a certified v10 benefits
// conversion. This is documented, not asserted as workbook-certified.

export const V10_PAYROLL_SOURCE_SALARY = {
  workbook: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  sheet: "PnL",
  row: 12,
  rowLabel: "Dissídio",
} as const;

export const V10_PAYROLL_SOURCE_BENEFITS = {
  workbook: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  sheet: "PnL",
  row: 13,
  rowLabel: "Benefícios",
} as const;

// Directly verified v10 PnL!E12:N12 (Dissídio), 2028-2037.
export const V10_SALARY_RATE_BY_YEAR: Readonly<Record<number, number>> = {
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

// Directly verified v10 PnL!D13:N13 (Benefícios), flat 10% every year 2027-2037.
export const V10_BENEFITS_RATE_BY_YEAR: Readonly<Record<number, number>> = {
  2028: 0.10,
  2029: 0.10,
  2030: 0.10,
  2031: 0.10,
  2032: 0.10,
  2033: 0.10,
  2034: 0.10,
  2035: 0.10,
  2036: 0.10,
  2037: 0.10,
};

export const PAYROLL_BASE_YEAR_2028 = 2028;

// One-time 2027→2028 conversion rate (v10 PnL!E12, Dissídio 2028 column).
export const SALARY_2027_TO_2028_CONVERSION_RATE = 0.06;

// Recurring salary escalation, applied for each year after 2028
// (v10 PnL!F12:N12, Dissídio 2029-2037, flat 5.9%).
export const SALARY_ESCALATION_RATE_2029_PLUS = 0.059;

// Recurring benefits escalation, applied for each year after 2028
// (v10 PnL!F13:N13, Benefícios 2029-2037, flat 10%).
export const BENEFITS_ESCALATION_RATE_2029_PLUS = 0.10;

// Brazilian payroll charges (encargos) as a fraction of gross salary.
export const ENCARGOS_RATE = 0.485;

/**
 * Converts a stored (2027-basis, or unresolved-provenance) monthly salary
 * figure into the explicit 2028 salary base. Applied exactly once, never
 * re-applied by the year-over-year escalation below.
 */
export function toSalaryBase2028(storedGrossMonthly: number): number {
  return storedGrossMonthly * (1 + SALARY_2027_TO_2028_CONVERSION_RATE);
}

/**
 * Converts a stored (provenance-unclear) monthly benefits figure into the
 * provisional explicit 2028 benefits base. See module header — this is a
 * preserved effective value, not a certified v10 benefits conversion.
 */
export function toBenefitsBase2028(storedBenefitsMonthly: number): number {
  return storedBenefitsMonthly * (1 + SALARY_2027_TO_2028_CONVERSION_RATE);
}

/** 1.0 at/before 2028; 1.059^(year-2028) afterward. Never applied to benefits. */
export function resolveSalaryGrowthFactor(year: number): number {
  if (year <= PAYROLL_BASE_YEAR_2028) return 1;
  return Math.pow(
    1 + SALARY_ESCALATION_RATE_2029_PLUS,
    year - PAYROLL_BASE_YEAR_2028,
  );
}

/** 1.0 at/before 2028; 1.10^(year-2028) afterward. Never applied to salary. */
export function resolveBenefitsGrowthFactor(year: number): number {
  if (year <= PAYROLL_BASE_YEAR_2028) return 1;
  return Math.pow(
    1 + BENEFITS_ESCALATION_RATE_2029_PLUS,
    year - PAYROLL_BASE_YEAR_2028,
  );
}

export function salaryMonthlyForYear(salaryBase2028: number, year: number): number {
  return salaryBase2028 * resolveSalaryGrowthFactor(year);
}

export function benefitsMonthlyForYear(benefitsBase2028: number, year: number): number {
  return benefitsBase2028 * resolveBenefitsGrowthFactor(year);
}

/** Encargos = salary × 48.5%. Never applied to benefits. */
export function laborChargesMonthlyForSalary(salaryMonthly: number): number {
  return salaryMonthly * ENCARGOS_RATE;
}
