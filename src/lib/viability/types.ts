export type ViabilityScreen = "baseline" | "sensitivity" | "thresholds";

export type ViabilityEnrollmentScenario =
  | "otimista"
  | "intermediario"
  | "pessimista"
  | "full-seat";

export type ViabilityTuitionScenario = "cen1" | "cen2" | "cen3";

export type ViabilityCostScenario = "base" | "lean" | "stress";

export type ViabilityMetric = "VPL" | "TIR" | "Payback";

export type ViabilityCapexMode = "single-total" | "structured";

export interface ViabilityCapexCategoryRow {
  id: string;
  category: string;
  included: boolean;
  year: number;
  amount: number;
  note: string;
}

export type SensitivityVariable =
  | "enrollmentScenario"
  | "tuitionScenario"
  | "costScenario"
  | "discountRate"
  | "payrollGrowthRate"
  | "benefitsGrowthRate"
  | "opexGrowthRate"
  | "tuitionGrowthRate";

export interface ViabilityAssumptionSet {
  enrollmentScenario: ViabilityEnrollmentScenario;
  tuitionScenario: ViabilityTuitionScenario;
  costScenario: ViabilityCostScenario;
  projectionHorizonYears: number;
  discountRate: number;
  payrollGrowthRate: number;
  benefitsGrowthRate: number;
  opexGrowthRate: number;
  tuitionGrowthRate: number;
  capexMode: ViabilityCapexMode;
  initialCapex: number;
  recurringCapexAnnual: number;
  capexIncluded: string;
  capexExcluded: string;
  capexCategories: ViabilityCapexCategoryRow[];
}

export interface ViabilitySimulatorState extends ViabilityAssumptionSet {
  activeScreen: ViabilityScreen;
}

export interface ViabilityPlanMetadata {
  planId: string;
  planName: string;
  planVersion: string;
  basedOnPlanId?: string;
  createdAt: string;
  notes?: string;
  changeRationale?: string;
}

export interface ViabilityKpi {
  id: string;
  label: string;
  value: number;
  tone: "default" | "success" | "warning" | "danger" | "info";
  format: "currency" | "percent" | "years" | "multiple" | "year";
  detail: string;
}

export interface ViabilityProjectionPoint {
  year: number;
  revenueAnnual: number;
  operatingResultAnnual: number;
  freeCashFlowAnnual: number;
  cumulativeCashFlowAnnual: number;
}

export interface ViabilityAnnualProjectionRow {
  year: number;
  studentsTotal: number;
  sectionsTotal: number;
  revenueAnnual: number;
  payrollAnnual: number;
  benefitsAnnual: number;
  otherOpexAnnual: number;
  totalOpexAnnual: number;
  operatingResultAnnual: number;
  capexAnnual: number;
  freeCashFlowAnnual: number;
  discountedCashFlowAnnual: number;
  cumulativeCashFlowAnnual: number;
  marginPercent: number;
}

export interface BaselineViewModel {
  kpis: ViabilityKpi[];
  chartSeries: ViabilityProjectionPoint[];
  annualRows: ViabilityAnnualProjectionRow[];
}

export interface ViabilityOutputSnapshot {
  baseline: BaselineViewModel;
}

export interface ViabilityPlan {
  metadata: ViabilityPlanMetadata;
  assumptions: ViabilityAssumptionSet;
  outputs?: ViabilityOutputSnapshot;
}

export interface SensitivityVariableOption {
  value: string;
  label: string;
  description: string;
}

export interface SensitivityFixedAssumption {
  label: string;
  value: string;
}

export interface SensitivityMatrixCell {
  rowValue: string;
  columnValue: string;
  metric: ViabilityMetric;
  value: number;
  runLabel: string;
}

export interface SensitivityViewModel {
  metric: ViabilityMetric;
  rowVariable: SensitivityVariable;
  columnVariable: SensitivityVariable;
  rowOptions: SensitivityVariableOption[];
  columnOptions: SensitivityVariableOption[];
  fixedAssumptions: SensitivityFixedAssumption[];
  semantics: string[];
  matrix: SensitivityMatrixCell[][];
}

export interface ThresholdControl {
  label: string;
  value: string;
  note: string;
}

export interface ThresholdResultCard {
  id: string;
  label: string;
  value: number;
  format: "currency" | "percent" | "years";
  detail: string;
  tone: "default" | "success" | "warning" | "danger" | "info";
}

export interface ThresholdChartPoint {
  year: number;
  baseCase: number;
  thresholdCase: number;
}

export interface ThresholdViewModel {
  controls: ThresholdControl[];
  resultCards: ThresholdResultCard[];
  chartSeries: ThresholdChartPoint[];
  narrative: string[];
}
