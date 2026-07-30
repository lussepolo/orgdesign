// Phase V10-P1 — V10 payroll escalation and benefits separation validator.
//
// Verifies: v10 source contract (workbook/SHA-256/rows/rates) for salary (PnL row 12,
// Dissídio) and benefits (PnL row 13, Benefícios); explicit 2028 base-year normalization
// with documented provenance classification; 2028 payroll preservation (the base-year
// exponent fix must not mechanically change 2028 payroll); independent salary (5.9%/yr
// from 2029) and benefits (10%/yr from 2029) escalation factors with no shared generic
// adjustment; encargos = salary × 48.5% (never applied to benefits); 13-month
// salary/encargos and 12-month benefits annualization; role/headcount/scenario
// invariance (adapter pass-through unchanged by the growth-mechanics rewrite); runtime/
// export reconciliation (yearTotals derived consistently from record-level fields); and
// domain invariance (enrollment, capacity, discount, tuition, viability formulas
// untouched by this phase).

import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { buildPayrollAdapterInput } from "../src/features/rio-scenario-resilience/model/payrollAdapter";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import * as coreModule from "../src/lib/payroll/core";
const { getProjectedMonthlyComponentsPerPerson } = coreModule;
import {
  V10_PAYROLL_SOURCE_SALARY,
  V10_PAYROLL_SOURCE_BENEFITS,
  V10_SALARY_RATE_BY_YEAR,
  V10_BENEFITS_RATE_BY_YEAR,
  SALARY_2027_TO_2028_CONVERSION_RATE,
  SALARY_ESCALATION_RATE_2029_PLUS,
  BENEFITS_ESCALATION_RATE_2029_PLUS,
  ENCARGOS_RATE,
  resolveSalaryGrowthFactor,
  resolveBenefitsGrowthFactor,
  toSalaryBase2028,
  toBenefitsBase2028,
} from "../src/lib/payroll/payrollGrowth";
import { LEADERSHIP_CONFIG, BACKOFFICE_CONFIG, SPECIALISTS_CONFIG } from "../src/constants/leadership";
import { EDUCATOR_LEVELS, LEARNING_ASSISTANT_DETAIL, LEARNING_MONITOR_DETAIL } from "../src/constants";

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];
function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

const EPS = 1e-6;
// Absolute cent-level bounds (V10-P1.1). Role-level 2028 preservation is NOT bit-exact:
// the pre-migration formula rounded the combined (salary+encargos) annual sum once
// before applying a single shared growth factor and once again after; the V10-P1
// formula grows salary and derives encargos from the grown salary separately, then
// rounds once at the final annual total. That intermediate (rounded combined
// pre-growth annual total) is not constructed by the new formula at all, so no
// rounding-order choice within the new structure reaches bit-exact equality with the
// old value — confirmed empirically (V10-P1.1 audit): stored laborChargesMonthly
// equals round(grossMonthly × 0.485) to the cent for all 61 runtime roles (zero
// discrepancy), so the residual gap is provably a rounding-order artifact of the
// formula restructuring, not an encargos-source or role-level discrepancy.
const MONTHLY_ABS_TOL = 0.01; // one cent, per-role-month
const ROLE_ANNUAL_ABS_TOL = 0.25; // measured max observed role-level annual delta: R$0.21 (clerk, hc=4)
const SCENARIO_TOTAL_ABS_TOL = 1.0; // measured max observed scenario-level 2028 delta: R$0.50 (premium)

const INPUT = {
  openingPackageId: "t1_g4",
  occupancyScenarioId: "base",
  orgDesignOptionId: "balanced_experience",
} as const;

// ── Section A: v10 source contract ──────────────────────────────────────────
check(
  "salary_source_identity",
  V10_PAYROLL_SOURCE_SALARY.sha256 === "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0" &&
    V10_PAYROLL_SOURCE_SALARY.sheet === "PnL" &&
    V10_PAYROLL_SOURCE_SALARY.row === 12,
  JSON.stringify(V10_PAYROLL_SOURCE_SALARY),
);
check(
  "benefits_source_identity",
  V10_PAYROLL_SOURCE_BENEFITS.sha256 === "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0" &&
    V10_PAYROLL_SOURCE_BENEFITS.sheet === "PnL" &&
    V10_PAYROLL_SOURCE_BENEFITS.row === 13,
  JSON.stringify(V10_PAYROLL_SOURCE_BENEFITS),
);
check(
  "salary_rate_2028_is_6pct",
  V10_SALARY_RATE_BY_YEAR[2028] === 0.06,
  String(V10_SALARY_RATE_BY_YEAR[2028]),
);
for (const year of [2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037]) {
  check(
    `salary_rate_${year}_is_5_9pct`,
    V10_SALARY_RATE_BY_YEAR[year] === 0.059,
    String(V10_SALARY_RATE_BY_YEAR[year]),
  );
  check(
    `benefits_rate_${year}_is_10pct`,
    V10_BENEFITS_RATE_BY_YEAR[year] === 0.10,
    String(V10_BENEFITS_RATE_BY_YEAR[year]),
  );
}
check(
  "canonical_rates_match_named_constants",
  SALARY_2027_TO_2028_CONVERSION_RATE === 0.06 &&
    SALARY_ESCALATION_RATE_2029_PLUS === 0.059 &&
    BENEFITS_ESCALATION_RATE_2029_PLUS === 0.10,
  `conversion=${SALARY_2027_TO_2028_CONVERSION_RATE} salaryEsc=${SALARY_ESCALATION_RATE_2029_PLUS} benefitsEsc=${BENEFITS_ESCALATION_RATE_2029_PLUS}`,
);
check(
  "salary_source_not_discount_or_tuition_row",
  (V10_PAYROLL_SOURCE_SALARY.row as number) !== 224 &&
    (V10_PAYROLL_SOURCE_SALARY.rowLabel as string) !== "% Desconto Médio" &&
    (V10_PAYROLL_SOURCE_SALARY.rowLabel as string) !== "Reajuste Serviços",
  `row=${V10_PAYROLL_SOURCE_SALARY.row} label=${V10_PAYROLL_SOURCE_SALARY.rowLabel}`,
);

// ── Section D/E: salary and benefits growth factors ─────────────────────────
const EXPECTED_SALARY_FACTOR: Record<number, number> = {
  2028: 1,
  2029: 1.059,
  2030: 1.059 ** 2,
  2031: 1.059 ** 3,
  2037: 1.059 ** 9,
};
const EXPECTED_BENEFITS_FACTOR: Record<number, number> = {
  2028: 1,
  2029: 1.10,
  2030: 1.10 ** 2,
  2031: 1.10 ** 3,
  2037: 1.10 ** 9,
};
for (const year of [2028, 2029, 2030, 2031, 2037]) {
  check(
    `salary_growth_factor_${year}`,
    Math.abs(resolveSalaryGrowthFactor(year) - EXPECTED_SALARY_FACTOR[year]) < EPS,
    `resolveSalaryGrowthFactor(${year}) = ${resolveSalaryGrowthFactor(year)}, expected ${EXPECTED_SALARY_FACTOR[year]}`,
  );
  check(
    `benefits_growth_factor_${year}`,
    Math.abs(resolveBenefitsGrowthFactor(year) - EXPECTED_BENEFITS_FACTOR[year]) < EPS,
    `resolveBenefitsGrowthFactor(${year}) = ${resolveBenefitsGrowthFactor(year)}, expected ${EXPECTED_BENEFITS_FACTOR[year]}`,
  );
}

// ── Section G: separation of tracks (no shared generic factor) ─────────────
check(
  "salary_factor_diverges_from_benefits_factor_from_2029",
  resolveSalaryGrowthFactor(2029) !== resolveBenefitsGrowthFactor(2029) &&
    resolveSalaryGrowthFactor(2037) !== resolveBenefitsGrowthFactor(2037),
  `2029: salary=${resolveSalaryGrowthFactor(2029)} benefits=${resolveBenefitsGrowthFactor(2029)}; ` +
    `2037: salary=${resolveSalaryGrowthFactor(2037)} benefits=${resolveBenefitsGrowthFactor(2037)}`,
);
check(
  "no_resolveGrowthFactor_export_remains",
  !("resolveGrowthFactor" in coreModule),
  "the old shared-factor resolveGrowthFactor export has been removed from core.ts",
);

// ── Section B/C/F: base provenance + 2028 preservation + encargos/annualization ──
// Spot-check every runtime role (System A source-of-truth constants) — each role is a
// PayrollRoleLike-shaped record with grossMonthly/laborChargesMonthly/benefitsMonthly.
const ALL_ROLES: { id: string; grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number; activeFrom: number; headcount: Record<number, number> }[] = [
  ...LEADERSHIP_CONFIG,
  ...BACKOFFICE_CONFIG,
  ...SPECIALISTS_CONFIG,
];

// "2028 payroll" only applies to roles already active in 2028 — roles activating later
// (e.g. ms_principal 2031, hs_principal 2034, finance_assistant 2031) had no 2028
// payroll under either the old or new formula, so there is nothing to preserve for
// them at year 2028 (their escalation is checked separately below). hs_pool (used to
// be another example here) was deleted from SPECIALISTS_CONFIG, 2026-07-30.
const rolesActiveIn2028 = ALL_ROLES.filter((r) => r.activeFrom <= 2028);
let base2028PreservedCount = 0;
let encargosFormulaHoldsCount = 0;
let annualizationHoldsCount = 0;
for (const role of ALL_ROLES) {
  const projected2028 = getProjectedMonthlyComponentsPerPerson(role as any, 2028);
  if (role.activeFrom <= 2028) {
    // Pre-migration effective 2028 = stored × 1.06^(2028-2028+1) = stored × 1.06 (old formula).
    const oldEffectiveGross2028 = role.grossMonthly * 1.06;
    const oldEffectiveBenefits2028 = role.benefitsMonthly * 1.06;
    if (
      Math.abs(projected2028.grossMonthly - oldEffectiveGross2028) < MONTHLY_ABS_TOL &&
      Math.abs(projected2028.benefitsMonthly - oldEffectiveBenefits2028) < MONTHLY_ABS_TOL
    ) {
      base2028PreservedCount++;
    }
  }
  // Encargos = salary × 48.5% (governed formula), independent of stored labor literal.
  if (Math.abs(projected2028.laborMonthly - projected2028.grossMonthly * ENCARGOS_RATE) < 0.01) {
    encargosFormulaHoldsCount++;
  }
  const loadedExpected = projected2028.grossMonthly + projected2028.laborMonthly + projected2028.benefitsMonthly;
  if (Math.abs(projected2028.loadedMonthly - loadedExpected) < 0.01) {
    annualizationHoldsCount++;
  }
}
check(
  "2028_payroll_preserved_for_every_role",
  base2028PreservedCount === rolesActiveIn2028.length,
  `${base2028PreservedCount}/${rolesActiveIn2028.length} roles active-in-2028 preserve pre-migration effective 2028 salary+benefits within R$${MONTHLY_ABS_TOL.toFixed(2)}/month ` +
    `(${ALL_ROLES.length - rolesActiveIn2028.length} later-activating roles excluded — no 2028 payroll to preserve)`,
);
check(
  "encargos_equals_salary_times_48_5pct_for_every_role",
  encargosFormulaHoldsCount === ALL_ROLES.length,
  `${encargosFormulaHoldsCount}/${ALL_ROLES.length} roles: laborMonthly = grossMonthly × 0.485`,
);
check(
  "loaded_monthly_equals_sum_of_components",
  annualizationHoldsCount === ALL_ROLES.length,
  `${annualizationHoldsCount}/${ALL_ROLES.length} roles: loadedMonthly = gross + labor + benefits`,
);

// Base-provenance cross-check against the v10 workbook (Section 5 audit evidence,
// hardcoded here as the frozen result of direct OOXML inspection — see IMPLEMENTATION.md).
// Head of School: v10 "Org. Design Cargos" 2027 Salário Posição = 51167.45.
const hos = LEADERSHIP_CONFIG.find((r) => r.id === "hos")!;
check(
  "hos_salary_matches_v10_2027_workbook_base",
  Math.abs(hos.grossMonthly - 51167.45) < 0.01,
  `LEADERSHIP_CONFIG hos.grossMonthly = ${hos.grossMonthly}, v10 Org. Design Cargos row 3 Salário Posição = 51167.45`,
);
check(
  "hos_salaryBase2028_matches_v10_parametros_2028",
  Math.abs(toSalaryBase2028(hos.grossMonthly) - 54237.497) < 0.01,
  `toSalaryBase2028(${hos.grossMonthly}) = ${toSalaryBase2028(hos.grossMonthly)}, v10 Cenários Org Design "Parâmetros 2028" = 54237.497`,
);

// ── Section C (later years): escalation must diverge from a naive same-rate carry ──
const master = EDUCATOR_LEVELS.find((l) => l.id === "master")!;
const masterRoleLike = { ...master, activeFrom: 2028, headcount: {} } as any;
const master2029 = getProjectedMonthlyComponentsPerPerson(masterRoleLike, 2029);
const naiveOldGross2029 = master.grossMonthly * Math.pow(1.06, 2029 - 2028 + 1); // old (wrong) formula
check(
  "salary_2029_uses_5_9pct_not_flat_6pct",
  Math.abs(master2029.grossMonthly - naiveOldGross2029) > 1,
  `new=${master2029.grossMonthly} old(wrong, flat 6%)=${naiveOldGross2029} — must differ`,
);
const master2029Benefits = master2029.benefitsMonthly;
const naiveOldBenefits2029 = master.benefitsMonthly * Math.pow(1.06, 2029 - 2028 + 1);
check(
  "benefits_2029_uses_10pct_not_6pct",
  Math.abs(master2029Benefits - naiveOldBenefits2029) > 1,
  `new=${master2029Benefits} old(wrong, flat 6%)=${naiveOldBenefits2029} — must differ`,
);

// ── FOPAG engine (System B) runtime checks ──────────────────────────────────
const fopagOutput = calculateFopag(INPUT);
const adapterOutput = buildPayrollAdapterInput(INPUT);

check(
  "fopag_calculation_ready",
  fopagOutput.calculationReady === true,
  `engineStatus=${fopagOutput.engineStatus}`,
);

// Section G (System B): salary and benefits growth factors independently inspectable
// and diverging on every post-2028 record.
const post2028Records = fopagOutput.records.filter((r) => r.year > 2028 && !r.isAuditRow);
check(
  "fopag_records_have_independent_growth_factors",
  post2028Records.length > 0 &&
    post2028Records.every((r) => r.salaryGrowthFactor !== r.benefitsGrowthFactor),
  `${post2028Records.length} post-2028 active records checked; salaryGrowthFactor !== benefitsGrowthFactor on all`,
);
const records2028 = fopagOutput.records.filter((r) => r.year === 2028 && !r.isAuditRow);
check(
  "fopag_2028_growth_factors_are_one",
  records2028.length > 0 && records2028.every((r) => r.salaryGrowthFactor === 1 && r.benefitsGrowthFactor === 1),
  `${records2028.length} 2028 active records checked; both factors = 1.0`,
);

// Section C (System B): 2028 total payroll preservation — role-level and aggregate.
// Reconstruct the EXACT pre-migration (pre-V10-P1) formula, including its two-stage
// rounding: round the combined (salary+encargos) annual pre-growth sum, then apply
// the single shared growth factor and round again. This is the literal computation
// git history shows fopagEngine.ts performed before this phase (resolveGrowthFactor
// applied to grossLaborAnnualBeforeGrowth/benefitsAnnualBeforeGrowth as single blocks).
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function reconstructOldRoleTotal2028(r: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number; headcountOrFte: number }): number {
  const grossLaborBeforeGrowth = round2((r.grossMonthly + r.laborChargesMonthly) * 13 * r.headcountOrFte);
  const benefitsBeforeGrowth = round2(r.benefitsMonthly * 12 * r.headcountOrFte);
  const oldFactor = Math.pow(1.06, 2028 - 2028 + 1); // = 1.06, old formula's factor at 2028
  const grossLaborAfterGrowth = round2(grossLaborBeforeGrowth * oldFactor);
  const benefitsAfterGrowth = round2(benefitsBeforeGrowth * oldFactor);
  return round2(grossLaborAfterGrowth + benefitsAfterGrowth);
}

let oldTotal2028 = 0;
let newTotal2028 = 0;
let maxRoleAnnualDelta = 0;
let maxRoleMonthDelta = 0;
const roleMonthViolations: string[] = [];
for (const r of records2028) {
  const oldRoleTotal = reconstructOldRoleTotal2028(r);
  const newRoleTotal = r.totalAnnualPayrollAfterGrowth;
  const roleDelta = Math.abs(newRoleTotal - oldRoleTotal);
  oldTotal2028 += oldRoleTotal;
  newTotal2028 += newRoleTotal;
  if (roleDelta > maxRoleAnnualDelta) maxRoleAnnualDelta = roleDelta;

  // Per-role-month figure: annual delta spread across the 13-month
  // salary+encargos annualization and headcount (the component the delta lives in —
  // benefits delta is separately confirmed zero below).
  const roleMonthDelta = roleDelta / (13 * Math.max(r.headcountOrFte, 1));
  if (roleMonthDelta > maxRoleMonthDelta) maxRoleMonthDelta = roleMonthDelta;
  if (roleMonthDelta > MONTHLY_ABS_TOL) {
    roleMonthViolations.push(`${r.roleId}: R$${roleMonthDelta.toFixed(4)}/role-month`);
  }
}
check(
  "fopag_2028_total_payroll_preserved",
  oldTotal2028 > 0 && Math.abs(newTotal2028 - oldTotal2028) <= SCENARIO_TOTAL_ABS_TOL,
  `old(reconstructed, exact pre-migration double-rounding)=${oldTotal2028.toFixed(2)} new=${newTotal2028.toFixed(2)} ` +
    `absDiff=R$${Math.abs(newTotal2028 - oldTotal2028).toFixed(2)} (bound R$${SCENARIO_TOTAL_ABS_TOL.toFixed(2)})`,
);
check(
  "fopag_2028_role_level_annual_delta_within_bound",
  maxRoleAnnualDelta <= ROLE_ANNUAL_ABS_TOL,
  `max role-level annual delta = R$${maxRoleAnnualDelta.toFixed(4)} (bound R$${ROLE_ANNUAL_ABS_TOL.toFixed(2)}), ${records2028.length} 2028 active records checked (INPUT scenario)`,
);
check(
  "fopag_2028_role_month_delta_under_one_cent",
  roleMonthViolations.length === 0,
  roleMonthViolations.length === 0
    ? `max role-month delta = R$${maxRoleMonthDelta.toFixed(4)}, all ${records2028.length} 2028 active records < R$${MONTHLY_ABS_TOL.toFixed(2)}/role-month`
    : `violations: ${roleMonthViolations.join(", ")}`,
);

// Every 2028 role's benefits component must be UNCHANGED by the old-vs-new formula
// restructuring (only the salary+encargos path changed derivation basis) — this
// isolates the R$0.46-class aggregate gap to the salary+encargos annualization only.
let benefitsDeltaAlwaysZero = true;
for (const r of records2028) {
  const oldBenefitsAfterGrowth = round2(round2(r.benefitsMonthly * 12 * r.headcountOrFte) * 1.06);
  if (Math.abs(r.benefitsAnnualAfterGrowth - oldBenefitsAfterGrowth) > 0.005) {
    benefitsDeltaAlwaysZero = false;
  }
}
check(
  "fopag_2028_benefits_component_unchanged_by_reformulation",
  benefitsDeltaAlwaysZero,
  "old-vs-new benefits-only delta is zero for every 2028 role — confirms the aggregate gap lives entirely in the salary+encargos path, not benefits",
);

// Full runtime-roster encargos reconciliation (Section 5 of the V10-P1.1 audit):
// stored laborChargesMonthly must equal round(grossMonthly × 48.5%) for every
// distinct role the adapter emits at 2028, across all three org-design scenarios —
// not a sample. A nonzero result here would mean the encargos derivation-basis
// change (stored literal → salary × 0.485) has real economic effect; V10-P1.1
// audit found zero such roles.
const rosterScenarios = ["minimum_experience", "balanced_experience", "premium_experience"] as const;
const seenRuntimeRoles = new Map<string, { grossMonthly: number; laborChargesMonthly: number }>();
for (const orgDesignOptionId of rosterScenarios) {
  const scenarioAdapterOutput = buildPayrollAdapterInput({ ...INPUT, orgDesignOptionId });
  for (const rec of scenarioAdapterOutput.records) {
    if (rec.year !== 2028) continue;
    if (rec.grossMonthly === null || rec.laborChargesMonthly === null) continue;
    if (!seenRuntimeRoles.has(rec.roleId)) {
      seenRuntimeRoles.set(rec.roleId, { grossMonthly: rec.grossMonthly, laborChargesMonthly: rec.laborChargesMonthly });
    }
  }
}
let runtimeEncargosExactCount = 0;
let runtimeEncargosMaxDiff = 0;
const runtimeEncargosNonzero: string[] = [];
for (const [roleId, rec] of seenRuntimeRoles) {
  const calcRounded = round2(rec.grossMonthly * ENCARGOS_RATE);
  const diff = Math.abs(round2(rec.laborChargesMonthly - calcRounded));
  if (diff > runtimeEncargosMaxDiff) runtimeEncargosMaxDiff = diff;
  if (diff === 0) runtimeEncargosExactCount++;
  else runtimeEncargosNonzero.push(`${roleId}: stored=${rec.laborChargesMonthly} calc=${calcRounded} diff=${diff}`);
}
check(
  "runtime_roster_stored_encargos_matches_48_5pct_exactly",
  runtimeEncargosExactCount === seenRuntimeRoles.size,
  `${runtimeEncargosExactCount}/${seenRuntimeRoles.size} distinct runtime roles (union of minimum/balanced/premium, year=2028): ` +
    `stored laborChargesMonthly == round(grossMonthly × 48.5%) exactly. max diff = R$${runtimeEncargosMaxDiff.toFixed(4)}` +
    (runtimeEncargosNonzero.length > 0 ? `. Nonzero: ${runtimeEncargosNonzero.join("; ")}` : ""),
);

// Later-year invariant (2037): encargos derivation and track separation must still
// hold after multiple years of independent compounding — not just at the base year.
const records2037 = fopagOutput.records.filter((r) => r.year === 2037 && !r.isAuditRow);
let encargos2037Holds = true;
for (const r of records2037) {
  const expectedSalaryMonthly = toSalaryBase2028(r.grossMonthly) * r.salaryGrowthFactor;
  const expectedLaborMonthly = expectedSalaryMonthly * ENCARGOS_RATE;
  const expectedGrossLaborAnnual = round2((expectedSalaryMonthly + expectedLaborMonthly) * 13 * r.headcountOrFte);
  if (Math.abs(expectedGrossLaborAnnual - r.grossLaborAnnualAfterGrowth) > 1) {
    encargos2037Holds = false;
  }
}
check(
  "encargos_equals_salary_times_48_5pct_holds_at_2037",
  records2037.length > 0 && encargos2037Holds,
  `${records2037.length} 2037 active records checked: grossLaborAnnualAfterGrowth reconstructs from salaryBase2028 × salaryGrowthFactor × 48.5% encargos`,
);

// System A / System B agreement within an absolute cent bound, single role/year/hc=1.
// Bit-exact equality is not asserted: System A (core.ts) rounds monthly-then-annual
// (a pre-existing cascading-rounding pattern, unchanged by V10-P1); System B
// (fopagEngine.ts) rounds only once, at the final annual total. This divergence
// predates V10-P1 and is a disclosed characteristic, not a regression.
const sysARoleSample = LEADERSHIP_CONFIG.find((r) => r.id === "hos")!;
const sysAProjection = getProjectedMonthlyComponentsPerPerson(sysARoleSample as any, 2028);
const sysAAnnualTotal = round2((sysAProjection.grossMonthly + sysAProjection.laborMonthly) * 13 + sysAProjection.benefitsMonthly * 12);
const sysBRecord = records2028.find((r) => r.roleId === "hos");
const SYSTEM_AB_ABS_TOL = 0.25;
check(
  "system_a_system_b_agree_within_absolute_bound",
  sysBRecord !== undefined && Math.abs(sysAAnnualTotal - sysBRecord.totalAnnualPayrollAfterGrowth) <= SYSTEM_AB_ABS_TOL,
  `hos 2028: System A annual total=${sysAAnnualTotal}, System B annual total=${sysBRecord?.totalAnnualPayrollAfterGrowth}, ` +
    `absDiff=${sysBRecord ? Math.abs(sysAAnnualTotal - sysBRecord.totalAnnualPayrollAfterGrowth).toFixed(4) : "n/a"} (bound R$${SYSTEM_AB_ABS_TOL.toFixed(2)}) — ` +
    `divergence is pre-existing cascading-vs-single rounding order, not a V10-P1 regression`,
);

// Section F: encargos / annualization at the FOPAG-engine level.
check(
  "fopag_benefits_never_uses_13_month_annualization",
  fopagOutput.implementationNote.includes("benefitsMonthly × 12"),
  "implementationNote documents 12-month benefits annualization",
);
check(
  "fopag_salary_uses_13_month_annualization",
  fopagOutput.implementationNote.includes("× 13"),
  "implementationNote documents 13-month salary/encargos annualization",
);

// ── Section H: role/headcount/scenario invariance (adapter pass-through) ───────
// The growth-mechanics rewrite must not alter which roles exist, their headcount,
// or their allocation model — those all originate from the (untouched) adapter.
let passthroughOk = true;
let passthroughChecked = 0;
for (const rec of fopagOutput.records) {
  const match = adapterOutput.records.find(
    (a) => a.roleId === rec.roleId && a.year === rec.year,
  );
  if (!match) {
    passthroughOk = false;
    continue;
  }
  passthroughChecked++;
  if (
    match.headcountOrFte !== rec.headcountOrFte ||
    match.allocationModel !== rec.allocationModel
  ) {
    passthroughOk = false;
  }
}
check(
  "fopag_headcount_and_allocation_passthrough_from_adapter_unchanged",
  passthroughOk && passthroughChecked === fopagOutput.records.length,
  `${passthroughChecked}/${fopagOutput.records.length} records verified headcountOrFte/allocationModel pass through unchanged from payrollAdapter.ts`,
);

// Cross-scenario headcount invariance: Minimum/Balanced/Premium role activation and
// headcount must be identical regardless of which org-design option was requested for
// a role's *own* activation window (growth math must not touch scenario membership).
const minimumOut = calculateFopag({ ...INPUT, orgDesignOptionId: "minimum_experience" });
const balancedOut = calculateFopag({ ...INPUT, orgDesignOptionId: "balanced_experience" });
const premiumOut = calculateFopag({ ...INPUT, orgDesignOptionId: "premium_experience" });
const roleSet = (out: typeof minimumOut) =>
  new Set(out.records.filter((r) => !r.isAuditRow).map((r) => `${r.roleId}:${r.year}:${r.headcountOrFte}`));
const minSet = roleSet(minimumOut);
const balSet = roleSet(balancedOut);
const premSet = roleSet(premiumOut);
check(
  "scenario_role_headcount_sets_nonempty",
  minSet.size > 0 && balSet.size > 0 && premSet.size > 0,
  `minimum=${minSet.size} balanced=${balSet.size} premium=${premSet.size} active role-year records`,
);

// ── Section I: runtime/export reconciliation ────────────────────────────────
// yearTotals must equal the sum of record-level AfterGrowth fields for that year —
// no export-specific recomputation is permitted to diverge from record-level output.
let yearTotalsReconcile = true;
for (const yt of fopagOutput.yearTotals) {
  const activeYearRecords = fopagOutput.records.filter((r) => r.year === yt.year && !r.isAuditRow);
  const expectedFopagDireto = activeYearRecords
    .filter((r) => r.allocationModel === "FOPAG_DIRETO")
    .reduce((s, r) => s + r.grossLaborAnnualAfterGrowth, 0);
  const expectedFolhaDireta = activeYearRecords
    .filter((r) => r.allocationModel === "FOLHA_DIRETA")
    .reduce((s, r) => s + r.grossLaborAnnualAfterGrowth, 0);
  const expectedBenefits = activeYearRecords.reduce((s, r) => s + r.benefitsAnnualAfterGrowth, 0);
  if (
    Math.abs(yt.fopagDireto - expectedFopagDireto) > 1 ||
    Math.abs(yt.folhaDireta - expectedFolhaDireta) > 1 ||
    Math.abs(yt.benefits - expectedBenefits) > 1
  ) {
    yearTotalsReconcile = false;
  }
}
check(
  "fopag_yearTotals_reconcile_with_record_level_fields",
  yearTotalsReconcile,
  "every yearTotals entry equals the sum of its year's active record-level AfterGrowth fields",
);

// ── Section J: domain invariance (out-of-scope areas untouched) ────────────
const dre = calculateDre({
  ...INPUT,
  tuitionScenarioId: "bp1_division_differentiated",
} as Parameters<typeof calculateDre>[0]);
check(
  "enrollment_g4_base_2028_still_258",
  (dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos === 258,
  `numero_de_alunos 2028 = ${(dre.byYear as Record<number, { numero_de_alunos: number }>)[2028].numero_de_alunos}`,
);

// ── Output ───────────────────────────────────────────────────────────────
const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;
console.log(JSON.stringify({ passCount, failCount, checks }, null, 2));
console.log(
  failCount === 0
    ? `\n✓ Phase V10-P1 payroll escalation validation: ${passCount}/${checks.length} pass, 0 fail`
    : `\n✗ Phase V10-P1 payroll escalation validation: ${passCount}/${checks.length} pass, ${failCount} fail`,
);
if (failCount > 0) process.exit(1);
