// Receita calculation engine.
// Implements the formula design from receitaFormulaDesign.ts exactly.
// Phase 11B (2026-06-07): extended to full simulator horizon 2028–2047.
// 2028–2037: Finance-validated direct workbook records.
// 2038–2047: mature-state carry-forward from 2037 baseline (approved by Luciana, Phase 11B).
// Source inputs: COMBINED_ENROLLMENT_RECORDS, TUITION_SOURCE_RECORDS,
//   DISCOUNT_SCHEDULE_SOURCE, ENROLLMENT_TUITION_GRADE_MAPPING, TUITION_SCENARIO_ID_MAPPING.
// No payroll, OPEX, CAPEX, EBITDA, NPV, or UI binding in this file.

import type { GradeId, TuitionScenarioId } from "./revenueInputs";
import type {
  OpeningPackageProjectionYear,
  OpeningPackageGradeId,
} from "./openingPackageOccupancySourceDataContract";
import type { TuitionSourceScenarioId } from "./tuitionSourceDataContract";
import type {
  ReceitaEngineByDivisionByYear,
  ReceitaEngineByGradeByYear,
  ReceitaEngineByYear,
  ReceitaEngineOutput,
  ReceitaEngineScenarioKey,
  ReceitaGrainRecord,
  ReceitaYearAggregate,
} from "./receitaEngineContract";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";
import { COMBINED_ENROLLMENT_RECORDS } from "./matureStateCarryForwardSourceData";
import { TUITION_SOURCE_RECORDS } from "./tuitionSourceData";
// TUITION_SCENARIO_ID_MAPPING not imported at runtime — inverse is hardcoded as CALC_TO_SOURCE_SCENARIO above.
// Source of truth remains tuitionRevenueReadiness.ts; update CALC_TO_SOURCE_SCENARIO if the mapping changes.
import { ENROLLMENT_TUITION_GRADE_MAPPING } from "./enrollmentTuitionGradeMapping";
import { DISCOUNT_SCHEDULE_SOURCE } from "./discountScheduleSourceData";
import { GRADE_DIVISION_MAP } from "./revenueInputs";

// Inverse of TUITION_SCENARIO_ID_MAPPING.
// Calculation-layer TuitionScenarioId → source TuitionSourceScenarioId.
// Explicit literals required; TypeScript cannot narrow computed keys from TUITION_SCENARIO_ID_MAPPING.
// Source of truth: tuitionRevenueReadiness.ts TUITION_SCENARIO_ID_MAPPING.
// Phase 15Q: rj4 and rj5 added (BP v8(2) ≡ v8(3) per Luciana).
export const CALC_TO_SOURCE_SCENARIO: Record<TuitionScenarioId, TuitionSourceScenarioId> = {
  bp1_division_differentiated: "bp_scenario_1",
  bp2_ey_ls_unified: "bp_scenario_2",
  bp3_ey_to_ms_unified: "bp_scenario_3",
  rj4: "bp_scenario_4",
  rj5: "bp_scenario_5",
};

// Pre-computed tuition value lookup: `${scenarioId}::${courseCourseLabel}` → annualGrossContractValueBRL.
// Built at module load time for O(1) per-record access.
const TUITION_VALUE_MAP = new Map<string, number>();
for (const record of TUITION_SOURCE_RECORDS) {
  TUITION_VALUE_MAP.set(
    `${record.scenarioId}::${record.sourceCourseLabel}`,
    record.annualGrossContractValueBRL,
  );
}

// Set of projection years for O(1) boundary check.
// Covers 2028–2047: direct workbook years (2028–2037) + mature-state extension (2038–2047).
const RECEITA_PROJECTION_YEARS_SET = new Set<number>(RECEITA_PROJECTION_YEARS);

// Normalize OpeningPackageNormalizedGradeId ("T1", "G1", "Kindergarten", etc.) to lowercase GradeId.
function toGradeId(raw: OpeningPackageGradeId): GradeId {
  return raw.toLowerCase() as GradeId;
}

// Annual adjustment factor.
// Base year 2028: factor = 1. Subsequent years: factor = 1.08^(year - 2028).
// Source: financeConventionSourceDecisions.md §2.5, §2.6; TUITION_ADJUSTMENT_CONVENTION.
// Formula continues through 2047 — mature-state years are NOT frozen at 2037 BRL values.
function annualAdjustmentFactor(year: OpeningPackageProjectionYear): number {
  if (year === 2028) return 1;
  return Math.pow(1.08, year - 2028);
}

// Average effective discount rate for a given year.
// Source: DISCOUNT_SCHEDULE_SOURCE. Applied after annual tuition adjustment (§2.4).
// Explicit rates 2028–2033; terminal rate 0.125 for 2034+.
// Terminal rate applies to all mature-state years 2038–2047 (no explicit rate override).
function discountRate(year: OpeningPackageProjectionYear): number {
  return (
    DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear[year] ??
    DISCOUNT_SCHEDULE_SOURCE.terminalRate
  );
}

// Base annual gross contract value (BRL) for a grade under a source tuition scenario.
// T1/T2: confirmed 50/50 learner modality blend of full-time + manhã half-period morning records.
//   Blend is a Finance-confirmed learner mix, not a price ratio.
//   Source: ENROLLMENT_TUITION_GRADE_MAPPING toddlerModalityMix; §2.2.
// Other grades: direct 1-to-1 source record lookup.
// Returns null if any required source record is missing.
function baseAnnualGrossContractValue(
  gradeId: GradeId,
  sourceScenarioId: TuitionSourceScenarioId,
): number | null {
  const mapping = ENROLLMENT_TUITION_GRADE_MAPPING.records[gradeId];

  if (mapping.toddlerModalityMix) {
    const mix = mapping.toddlerModalityMix;
    const ftValue = TUITION_VALUE_MAP.get(
      `${sourceScenarioId}::${mix.fullTimeCourseLabel}`,
    );
    const mValue = TUITION_VALUE_MAP.get(
      `${sourceScenarioId}::${mix.halfPeriodMorningCourseLabel}`,
    );
    if (ftValue === undefined || mValue === undefined) return null;
    return mix.fullTimeLearnerShare * ftValue + mix.halfPeriodMorningLearnerShare * mValue;
  }

  const label = mapping.tuitionSourceCourseLabel;
  if (!label) return null;
  return TUITION_VALUE_MAP.get(`${sourceScenarioId}::${label}`) ?? null;
}

function addAggregate(
  existing: ReceitaYearAggregate | undefined,
  gross: number,
  discount: number,
  net: number,
): ReceitaYearAggregate {
  if (!existing) {
    return {
      grossReceitaBeforeDiscount: gross,
      discountImpact: discount,
      netReceitaAfterDiscount: net,
    };
  }
  return {
    grossReceitaBeforeDiscount: existing.grossReceitaBeforeDiscount + gross,
    discountImpact: existing.discountImpact + discount,
    netReceitaAfterDiscount: existing.netReceitaAfterDiscount + net,
  };
}

// Calculate Receita for one (openingPackage × occupancyScenario × tuitionScenario) combination.
//
// Formula per grain (grade × year):
//   1. contractedLearners from COMBINED_ENROLLMENT_RECORDS.
//   2. baseAnnualGrossContractValueBRL from TUITION_SOURCE_RECORDS (via grade mapping).
//   3. annualAdjustmentFactor: 1 for 2028; 1.08^(year-2028) for year > 2028. Continues to 2047.
//   4. adjustedAnnualGrossContractValueBRL = base × factor.
//   5. grossReceitaBeforeDiscount = contractedLearners × adjustedAnnualGrossContractValueBRL.
//   6. averageEffectiveDiscountRate from DISCOUNT_SCHEDULE_SOURCE for the year.
//   7. discountImpact = grossReceita × discountRate.
//   8. netReceitaAfterDiscount = grossReceita - discountImpact.
//
// 2028–2037: Finance-validated enrollment records.
// 2038–2047: mature-state carry-forward from 2037 (each scenario independently).
// Grades with null enrollment (inactive) are skipped — no zero-enrollment records produced.
//
// Verification reference: {t1_g3, intermediario, bp1_division_differentiated}, t1, 2028
//   blend = 0.5×91390.04 + 0.5×53463.28 = 72426.66 BRL
//   gross = 16 × 72426.66 × 1 = 1,158,826.56 BRL
//   net   = 1,158,826.56 × (1 - 0.20) = 927,061.248 BRL
export function calculateReceita(key: ReceitaEngineScenarioKey): ReceitaEngineOutput {
  const { openingPackageId, occupancyScenarioId, tuitionScenarioId } = key;
  const sourceScenarioId = CALC_TO_SOURCE_SCENARIO[tuitionScenarioId];

  const grainRecords: ReceitaGrainRecord[] = [];
  const byYear: ReceitaEngineByYear = {};
  const byGradeByYear: ReceitaEngineByGradeByYear = {};
  const byDivisionByYear: ReceitaEngineByDivisionByYear = {};

  for (const rec of COMBINED_ENROLLMENT_RECORDS) {
    if (rec.packageId !== openingPackageId) continue;
    if (rec.scenarioId !== occupancyScenarioId) continue;
    // Structural boundary check: exclude any year not in the approved 20-year set.
    if (!RECEITA_PROJECTION_YEARS_SET.has(rec.year)) continue;
    if (rec.enrollment === null) continue;

    const year = rec.year as OpeningPackageProjectionYear;
    const contractedLearners = rec.enrollment;
    const gradeId = toGradeId(rec.normalizedGradeId);
    const divisionId = GRADE_DIVISION_MAP[gradeId];

    const baseValue = baseAnnualGrossContractValue(gradeId, sourceScenarioId);
    if (baseValue === null) continue;

    const factor = annualAdjustmentFactor(year);
    const adjustedValue = baseValue * factor;
    const rate = discountRate(year);
    const gross = contractedLearners * adjustedValue;
    const discountAmt = gross * rate;
    const net = gross - discountAmt;

    grainRecords.push({
      openingPackageId,
      occupancyScenarioId,
      tuitionScenarioId,
      year,
      gradeId,
      divisionId,
      contractedLearners,
      baseAnnualGrossContractValueBRL: baseValue,
      annualAdjustmentFactor: factor,
      adjustedAnnualGrossContractValueBRL: adjustedValue,
      averageEffectiveDiscountRate: rate,
      grossReceitaBeforeDiscount: gross,
      discountImpact: discountAmt,
      netReceitaAfterDiscount: net,
    });

    byYear[year] = addAggregate(byYear[year], gross, discountAmt, net);

    let gradeYearMap = byGradeByYear[gradeId];
    if (!gradeYearMap) {
      gradeYearMap = {};
      byGradeByYear[gradeId] = gradeYearMap;
    }
    gradeYearMap[year] = addAggregate(gradeYearMap[year], gross, discountAmt, net);

    let divYearMap = byDivisionByYear[divisionId];
    if (!divYearMap) {
      divYearMap = {};
      byDivisionByYear[divisionId] = divYearMap;
    }
    divYearMap[year] = addAggregate(divYearMap[year], gross, discountAmt, net);
  }

  return {
    scenarioKey: key,
    supportedYears: RECEITA_PROJECTION_YEARS,
    grainRecords,
    byYear,
    byGradeByYear,
    byDivisionByYear,
  };
}
