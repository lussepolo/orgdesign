import { formatPercent } from "./formatters";
import type {
  SensitivityFixedAssumption,
  SensitivityMatrixCell,
  SensitivityVariable,
  SensitivityVariableOption,
  SensitivityViewModel,
  ViabilityAssumptionSet,
  ViabilityMetric,
} from "./types";

const VARIABLE_OPTIONS: Record<SensitivityVariable, SensitivityVariableOption[]> = {
  enrollmentScenario: [
    { value: "pessimista", label: "Pessimista", description: "Lower students/turmas carry through the operating model." },
    { value: "intermediario", label: "Intermediário", description: "Current central planning path." },
    { value: "otimista", label: "Otimista", description: "Higher enrollment operating path." },
    { value: "full-seat", label: "Full Seat", description: "Capacity-reaching enrollment envelope." },
  ],
  tuitionScenario: [
    { value: "cen1", label: "RJ Cen 1", description: "More conservative pricing baseline." },
    { value: "cen2", label: "RJ Cen 2", description: "Current reference pricing context." },
    { value: "cen3", label: "RJ Cen 3", description: "Higher pricing envelope." },
  ],
  costScenario: [
    { value: "lean", label: "Lean", description: "Lower cost pressure case." },
    { value: "base", label: "Base", description: "Current cost context." },
    { value: "stress", label: "Stress", description: "Higher cost pressure case." },
  ],
  discountRate: [
    { value: "8", label: "8.0%", description: "Lower hurdle rate." },
    { value: "10", label: "10.0%", description: "Current baseline hurdle rate." },
    { value: "12", label: "12.0%", description: "Higher hurdle rate." },
  ],
  payrollGrowthRate: [
    { value: "5", label: "5.0%", description: "Lower payroll inflation." },
    { value: "6", label: "6.0%", description: "Current payroll growth assumption." },
    { value: "7", label: "7.0%", description: "Higher payroll inflation." },
  ],
  benefitsGrowthRate: [
    { value: "4", label: "4.0%", description: "Lower benefits escalation." },
    { value: "5", label: "5.0%", description: "Current benefits growth assumption." },
    { value: "6", label: "6.0%", description: "Higher benefits escalation." },
  ],
  opexGrowthRate: [
    { value: "3", label: "3.0%", description: "Lower opex growth." },
    { value: "4", label: "4.0%", description: "Current opex growth assumption." },
    { value: "5", label: "5.0%", description: "Higher opex growth." },
  ],
  tuitionGrowthRate: [
    { value: "6", label: "6.0%", description: "Lower tuition growth." },
    { value: "8", label: "8.0%", description: "Current tuition growth assumption." },
    { value: "10", label: "10.0%", description: "Higher tuition growth." },
  ],
};

function getMetricBase(metric: ViabilityMetric): number {
  if (metric === "VPL") return 148000000;
  if (metric === "TIR") return 17.5;
  return 7.2;
}

function buildFixedAssumptions(
  assumptions: ViabilityAssumptionSet,
  rowVariable: SensitivityVariable,
  columnVariable: SensitivityVariable,
): SensitivityFixedAssumption[] {
  const activeCapexMode =
    assumptions.capexMode === "structured" ? "Structured by category" : "Single total";
  const candidates: SensitivityFixedAssumption[] = [
    { label: "Enrollment scenario", value: assumptions.enrollmentScenario },
    { label: "Tuition scenario", value: assumptions.tuitionScenario },
    { label: "Cost scenario", value: assumptions.costScenario },
    { label: "Projection horizon", value: `${assumptions.projectionHorizonYears} years` },
    { label: "Discount rate", value: formatPercent(assumptions.discountRate) },
    { label: "Payroll growth", value: formatPercent(assumptions.payrollGrowthRate) },
    { label: "Benefits growth", value: formatPercent(assumptions.benefitsGrowthRate) },
    { label: "Opex growth", value: formatPercent(assumptions.opexGrowthRate) },
    { label: "Tuition growth", value: formatPercent(assumptions.tuitionGrowthRate) },
    { label: "CAPEX mode", value: activeCapexMode },
    { label: "Non-teaching staffing", value: "Shared/global role progression" },
    { label: "Cell engine", value: "Directional placeholder outputs" },
  ];

  return candidates.filter((item) => {
    if (rowVariable === "enrollmentScenario" || columnVariable === "enrollmentScenario") {
      if (item.label === "Enrollment scenario") return false;
    }
    if (rowVariable === "tuitionScenario" || columnVariable === "tuitionScenario") {
      if (item.label === "Tuition scenario") return false;
    }
    if (rowVariable === "costScenario" || columnVariable === "costScenario") {
      if (item.label === "Cost scenario") return false;
    }
    if (rowVariable === "discountRate" || columnVariable === "discountRate") {
      if (item.label === "Discount rate") return false;
    }
    if (rowVariable === "payrollGrowthRate" || columnVariable === "payrollGrowthRate") {
      if (item.label === "Payroll growth") return false;
    }
    if (rowVariable === "benefitsGrowthRate" || columnVariable === "benefitsGrowthRate") {
      if (item.label === "Benefits growth") return false;
    }
    if (rowVariable === "opexGrowthRate" || columnVariable === "opexGrowthRate") {
      if (item.label === "Opex growth") return false;
    }
    if (rowVariable === "tuitionGrowthRate" || columnVariable === "tuitionGrowthRate") {
      if (item.label === "Tuition growth") return false;
    }
    return true;
  });
}

export function buildSensitivityViewModel(params: {
  assumptions: ViabilityAssumptionSet;
  metric?: ViabilityMetric;
  rowVariable?: SensitivityVariable;
  columnVariable?: SensitivityVariable;
}): SensitivityViewModel {
  const metric = params.metric ?? "VPL";
  const rowVariable = params.rowVariable ?? "enrollmentScenario";
  const columnVariable = params.columnVariable ?? "tuitionScenario";
  const rowOptions = VARIABLE_OPTIONS[rowVariable];
  const columnOptions = VARIABLE_OPTIONS[columnVariable];
  const base = getMetricBase(metric);

  const matrix: SensitivityMatrixCell[][] = rowOptions.map((rowOption, rowIndex) =>
    columnOptions.map((columnOption, columnIndex) => {
      const rowDelta = (rowIndex - (rowOptions.length - 1) / 2) * 0.11;
      const columnDelta = (columnIndex - (columnOptions.length - 1) / 2) * 0.08;
      const directionalValue =
        metric === "VPL"
          ? base * (1 + rowDelta + columnDelta)
          : metric === "TIR"
            ? base + rowDelta * 12 + columnDelta * 10
            : Math.max(2.5, base - rowDelta * 3 - columnDelta * 2.4);

      return {
        rowValue: rowOption.label,
        columnValue: columnOption.label,
        metric,
        value: directionalValue,
        runLabel: `${rowVariable}:${rowOption.value} | ${columnVariable}:${columnOption.value}`,
      };
    }),
  );

  return {
    metric,
    rowVariable,
    columnVariable,
    rowOptions,
    columnOptions,
    fixedAssumptions: buildFixedAssumptions(params.assumptions, rowVariable, columnVariable),
    semantics: [
      "Each cell represents one full lifetime model recomputation.",
      "Only the selected row variable and selected column variable change across the matrix.",
      "All other assumptions remain fixed to the current simulator context.",
      "If enrollment scenario is varied, it propagates through students, turmas, teaching-side staffing, revenue, and cost outputs.",
      "Non-teaching staffing remains shared/global for now and does not silently become scenario-responsive.",
      "Displayed cell values remain directional placeholders until the full sensitivity engine is wired to the baseline model.",
    ],
    matrix,
  };
}
