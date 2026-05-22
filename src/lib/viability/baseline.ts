import { ANNUAL_ADJUSTMENT } from "../../constants";
import {
  PAYROLL_YEARS,
  TUITION_GROWTH_RATE,
  buildPayrollProjection,
} from "../payroll/index";
import type {
  BaselineViewModel,
  ViabilityAssumptionSet,
  ViabilityAnnualProjectionRow,
  ViabilityEnrollmentScenario,
  ViabilityKpi,
  ViabilityProjectionPoint,
} from "./types";

const DEFAULT_PAYROLL_GROWTH_RATE = (ANNUAL_ADJUSTMENT - 1) * 100;
const DEFAULT_BENEFITS_GROWTH_RATE = (ANNUAL_ADJUSTMENT - 1) * 100;
const DEFAULT_TUITION_GROWTH_RATE = TUITION_GROWTH_RATE * 100;

const COST_SCENARIO_FACTORS = {
  lean: {
    fixedOpex: 0.92,
    variableOpex: 0.95,
    capex: 0.9,
  },
  base: {
    fixedOpex: 1,
    variableOpex: 1,
    capex: 1,
  },
  stress: {
    fixedOpex: 1.1,
    variableOpex: 1.08,
    capex: 1.12,
  },
} as const;

const BASE_FIXED_OPEX_2028 = 5_400_000;
const BASE_PER_STUDENT_OPEX_2028 = 7_800;
const BASE_PER_SECTION_OPEX_2028 = 130_000;

function clampProjectionHorizon(years: number): number {
  return Math.max(1, Math.min(Math.round(years), PAYROLL_YEARS.length));
}

function resolvePayrollScenario(
  enrollmentScenario: ViabilityEnrollmentScenario,
): "otimista" | "intermediario" | "pessimista" {
  if (enrollmentScenario === "full-seat") return "otimista";
  return enrollmentScenario;
}

function growthFactor(ratePercent: number, offset: number): number {
  return Math.pow(1 + ratePercent / 100, offset);
}

function rebaseAnnualValue(
  value: number,
  offset: number,
  sourceGrowthRate: number,
  targetGrowthRate: number,
): number {
  if (offset <= 0) return value;
  const sourceFactor = growthFactor(sourceGrowthRate, offset);
  const targetFactor = growthFactor(targetGrowthRate, offset);
  if (sourceFactor === 0) return value;
  return (value / sourceFactor) * targetFactor;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function calculateNpv(rows: ViabilityAnnualProjectionRow[]): number {
  return roundCurrency(
    rows.reduce((sum, row) => sum + row.discountedCashFlowAnnual, 0),
  );
}

function calculateIrr(cashFlows: number[]): number {
  const hasPositive = cashFlows.some((value) => value > 0);
  const hasNegative = cashFlows.some((value) => value < 0);

  if (!hasPositive || !hasNegative) return Number.NaN;

  const npvAtRate = (rate: number) =>
    cashFlows.reduce((sum, value, index) => sum + value / Math.pow(1 + rate, index), 0);

  let low = -0.95;
  let high = 3;
  let lowNpv = npvAtRate(low);
  let highNpv = npvAtRate(high);

  while (lowNpv * highNpv > 0 && high < 20) {
    high *= 2;
    highNpv = npvAtRate(high);
  }

  if (lowNpv * highNpv > 0) return Number.NaN;

  for (let iteration = 0; iteration < 120; iteration += 1) {
    const mid = (low + high) / 2;
    const midNpv = npvAtRate(mid);

    if (Math.abs(midNpv) < 0.0001) {
      return mid * 100;
    }

    if (lowNpv * midNpv <= 0) {
      high = mid;
      highNpv = midNpv;
    } else {
      low = mid;
      lowNpv = midNpv;
    }
  }

  return ((low + high) / 2) * 100;
}

function calculatePayback(rows: ViabilityAnnualProjectionRow[]): number {
  for (let index = 0; index < rows.length; index += 1) {
    const current = rows[index];
    if (current.cumulativeCashFlowAnnual >= 0) {
      if (index === 0) return 0;
      const previous = rows[index - 1];
      const span = current.cumulativeCashFlowAnnual - previous.cumulativeCashFlowAnnual;
      const share = span === 0 ? 0 : (0 - previous.cumulativeCashFlowAnnual) / span;
      return roundPercent(index - 1 + Math.max(0, Math.min(1, share)));
    }
  }

  return Number.NaN;
}

function calculateBreakEvenYear(rows: ViabilityAnnualProjectionRow[]): number {
  const match = rows.find((row) => row.operatingResultAnnual >= 0);
  return match ? match.year : Number.NaN;
}

function buildKpis(rows: ViabilityAnnualProjectionRow[]): ViabilityKpi[] {
  const npv = calculateNpv(rows);
  const irr = calculateIrr(rows.map((row) => row.freeCashFlowAnnual));
  const payback = calculatePayback(rows);
  const peakCashNeed = roundCurrency(
    Math.max(0, Math.abs(Math.min(...rows.map((row) => row.cumulativeCashFlowAnnual)))),
  );
  const breakEvenYear = calculateBreakEvenYear(rows);
  const steadyStateRows = rows.slice(-3);
  const steadyStateMargin =
    steadyStateRows.reduce((sum, row) => sum + row.marginPercent, 0) /
    steadyStateRows.length;

  return [
    {
      id: "vpl",
      label: "VPL / NPV",
      value: npv,
      tone: npv >= 0 ? "success" : "danger",
      format: "currency",
      detail: "Discounted free cash flow across the full 2028-2047 annual baseline run.",
    },
    {
      id: "tir",
      label: "TIR / IRR",
      value: irr,
      tone: Number.isFinite(irr) ? (irr >= 12 ? "success" : "warning") : "warning",
      format: "percent",
      detail: "Internal rate of return implied by annual free cash flow, including CAPEX.",
    },
    {
      id: "payback",
      label: "Payback",
      value: payback,
      tone: Number.isFinite(payback) && payback <= 8 ? "success" : "warning",
      format: "years",
      detail: "Time required for cumulative free cash flow to recover the modeled capital outlay.",
    },
    {
      id: "peak-cash-need",
      label: "Peak Cash Need",
      value: peakCashNeed,
      tone: peakCashNeed <= 0 ? "success" : "info",
      format: "currency",
      detail: "Maximum cumulative funding deficit reached before the case self-funds.",
    },
    {
      id: "break-even-year",
      label: "Break-even Year",
      value: breakEvenYear,
      tone: Number.isFinite(breakEvenYear) ? "info" : "warning",
      format: "year",
      detail: "First year in which annual operating result turns non-negative before CAPEX.",
    },
    {
      id: "steady-state-margin",
      label: "Steady-State Margin",
      value: steadyStateMargin,
      tone: steadyStateMargin >= 15 ? "success" : steadyStateMargin >= 8 ? "info" : "warning",
      format: "percent",
      detail: "Average operating margin across the last three modeled years.",
    },
  ];
}

function buildOtherOpexAnnual(
  assumptions: ViabilityAssumptionSet,
  studentsTotal: number,
  sectionsTotal: number,
  offset: number,
): number {
  const factors = COST_SCENARIO_FACTORS[assumptions.costScenario];
  const fixedOpex =
    BASE_FIXED_OPEX_2028 * factors.fixedOpex * growthFactor(assumptions.opexGrowthRate, offset);
  const variableOpex =
    (studentsTotal * BASE_PER_STUDENT_OPEX_2028 +
      sectionsTotal * BASE_PER_SECTION_OPEX_2028) *
    factors.variableOpex *
    growthFactor(assumptions.opexGrowthRate, offset);

  return roundCurrency(fixedOpex + variableOpex);
}

function buildStructuredCapexByYear(assumptions: ViabilityAssumptionSet): Record<number, number> {
  return assumptions.capexCategories.reduce<Record<number, number>>((totals, row) => {
    if (!row.included) return totals;
    if (!PAYROLL_YEARS.includes(row.year)) return totals;

    const amount = Number(row.amount) || 0;
    totals[row.year] = roundCurrency((totals[row.year] ?? 0) + amount);
    return totals;
  }, {});
}

function resolveCapexAnnual(
  assumptions: ViabilityAssumptionSet,
  structuredCapexByYear: Record<number, number>,
  year: number,
  index: number,
): number {
  if (assumptions.capexMode === "structured") {
    return roundCurrency(
      (structuredCapexByYear[year] ?? 0) + (index > 0 ? assumptions.recurringCapexAnnual : 0),
    );
  }

  return roundCurrency(
    (index === 0 ? assumptions.initialCapex : 0) +
      (index > 0 ? assumptions.recurringCapexAnnual : 0),
  );
}

export function buildBaselineViewModel(
  assumptions: ViabilityAssumptionSet,
): BaselineViewModel {
  const horizon = clampProjectionHorizon(assumptions.projectionHorizonYears);
  const payrollScenario = resolvePayrollScenario(assumptions.enrollmentScenario);
  const payrollProjection = buildPayrollProjection({
    scenario: payrollScenario,
    tuitionScenario: assumptions.tuitionScenario,
    marginMode: "FULLY_LOADED",
  });
  const factors = COST_SCENARIO_FACTORS[assumptions.costScenario];
  const structuredCapexByYear = buildStructuredCapexByYear(assumptions);
  const annualRows: ViabilityAnnualProjectionRow[] = [];

  payrollProjection.years.slice(0, horizon).forEach((row, index) => {
      const payrollAnnualBase = row.teachingFopagAnnual + row.teachingFolhaAnnual +
        row.nonTeachingFopagAnnual + row.nonTeachingFolhaAnnual;
      const payrollAnnual = roundCurrency(
        rebaseAnnualValue(
          payrollAnnualBase,
          index,
          DEFAULT_PAYROLL_GROWTH_RATE,
          assumptions.payrollGrowthRate,
        ),
      );
      const benefitsAnnual = roundCurrency(
        rebaseAnnualValue(
          row.beneficiosAnnual,
          index,
          DEFAULT_BENEFITS_GROWTH_RATE,
          assumptions.benefitsGrowthRate,
        ),
      );
      const revenueAnnual = roundCurrency(
        rebaseAnnualValue(
          row.totalRevenueAnnual,
          index,
          DEFAULT_TUITION_GROWTH_RATE,
          assumptions.tuitionGrowthRate,
        ),
      );
      const otherOpexAnnual = buildOtherOpexAnnual(
        assumptions,
        row.totalStudents,
        row.totalTurmas,
        index,
      );
      const totalOpexAnnual = roundCurrency(
        payrollAnnual + benefitsAnnual + otherOpexAnnual,
      );
      const operatingResultAnnual = roundCurrency(revenueAnnual - totalOpexAnnual);
      const capexAnnual = roundCurrency(
        resolveCapexAnnual(assumptions, structuredCapexByYear, row.year, index) * factors.capex,
      );
      const freeCashFlowAnnual = roundCurrency(operatingResultAnnual - capexAnnual);
      const discountedCashFlowAnnual = roundCurrency(
        freeCashFlowAnnual / Math.pow(1 + assumptions.discountRate / 100, index),
      );
      const previousCumulative =
        index === 0 ? 0 : annualRows[index - 1].cumulativeCashFlowAnnual;
      const cumulativeCashFlowAnnual = roundCurrency(
        previousCumulative + freeCashFlowAnnual,
      );
      const marginPercent =
        revenueAnnual > 0 ? roundPercent((operatingResultAnnual / revenueAnnual) * 100) : 0;

      annualRows.push({
        year: row.year,
        studentsTotal: row.totalStudents,
        sectionsTotal: row.totalTurmas,
        revenueAnnual,
        payrollAnnual,
        benefitsAnnual,
        otherOpexAnnual,
        totalOpexAnnual,
        operatingResultAnnual,
        capexAnnual,
        freeCashFlowAnnual,
        discountedCashFlowAnnual,
        cumulativeCashFlowAnnual,
        marginPercent,
      });
    });

  const chartSeries: ViabilityProjectionPoint[] = annualRows.map((row) => ({
    year: row.year,
    revenueAnnual: row.revenueAnnual,
    operatingResultAnnual: row.operatingResultAnnual,
    freeCashFlowAnnual: row.freeCashFlowAnnual,
    cumulativeCashFlowAnnual: row.cumulativeCashFlowAnnual,
  }));

  return {
    kpis: buildKpis(annualRows),
    chartSeries,
    annualRows,
  };
}
