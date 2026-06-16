import type { RevenueInputBundle } from "./revenueInputs";
import type {
  PayrollAdapterInput,
  PayrollAdapterOutput,
} from "./payrollAdapterContract";
import type {
  OpexCapexAdapterInput,
  OpexCapexAdapterOutput,
  FinancialYearValue,
} from "./opexCapexAdapterContract";

export type ScenarioCalculationBoundaryStatus =
  | "ready"
  | "blocked_missing_input"
  | "blocked_mapping_pending"
  | "blocked_not_defined"
  | "blocked_not_implemented";

export type ScenarioOutputUnit =
  | "BRL"
  | "percent"
  | "years"
  | "label"
  | "not_defined";

// These are the approved board-facing outputs. Do not expand this union without approval.
export type ScenarioOutputId =
  | "receita"
  | "payroll_fopag"
  | "fopag_receita_ratio"
  | "opex"
  | "capex"
  | "capex_exposure"
  | "ebitda"
  | "ebitda_margin"
  | "cumulative_result"
  | "break_even"
  | "simple_payback"
  | "discounted_payback"
  | "npv"
  | "scenario_tier";

export const AUTHORITATIVE_BOARD_FACING_OUTPUT_IDS = [
  "receita",
  "payroll_fopag",
  "fopag_receita_ratio",
  "opex",
  "capex",
  "capex_exposure",
  "ebitda",
  "ebitda_margin",
  "cumulative_result",
  "break_even",
  "simple_payback",
  "discounted_payback",
  "npv",
  "scenario_tier",
] as const satisfies readonly ScenarioOutputId[];

// These remain inactive scope-expansion candidates unless separately approved.
export type InactiveScopeExpansionOutputId =
  | "total_costs_and_fixed_expenses"
  | "contribution_margin"
  | "ebit"
  | "ebt"
  | "net_income"
  | "net_income_margin"
  | "free_cash_flow"
  | "cumulative_cash_flow"
  | "discounted_cash_flow";

export interface ScenarioCalculationInputFamilies {
  revenue: RevenueInputBundle;
  payroll: PayrollAdapterInput;
  opexCapex: OpexCapexAdapterInput;
}

export interface ScenarioAdapterOutputFamilies {
  payroll: PayrollAdapterOutput;
  opexCapex: OpexCapexAdapterOutput;
}

export interface ScenarioCalculationDependencyStatus {
  revenueInputs: ScenarioCalculationBoundaryStatus;
  payrollAdapterInputs: ScenarioCalculationBoundaryStatus;
  opexCapexAdapterInputs: ScenarioCalculationBoundaryStatus;
  receita: ScenarioCalculationBoundaryStatus;
  payrollFopag: ScenarioCalculationBoundaryStatus;
  opexCapexSchedules: ScenarioCalculationBoundaryStatus;
  capexExposure: ScenarioCalculationBoundaryStatus;
  ebitda: ScenarioCalculationBoundaryStatus;
  cumulativeResultAndBreakEven: ScenarioCalculationBoundaryStatus;
  npvAndPayback: ScenarioCalculationBoundaryStatus;
  scenarioTier: ScenarioCalculationBoundaryStatus;
  uiOutputRendering: ScenarioCalculationBoundaryStatus;
}

export type BlockedScenarioOutputReason =
  | "missing_revenue_inputs"
  | "missing_payroll_adapter_inputs"
  | "missing_opex_capex_adapter_inputs"
  | "missing_receita"
  | "missing_payroll"
  | "missing_opex"
  | "missing_capex"
  | "missing_cumulative_result"
  | "missing_discount_rate"
  | "missing_governance_thresholds"
  | "formula_not_defined"
  | "adapter_not_implemented"
  | "evaluation_rules_not_defined"
  | "mapping_pending";

export interface BlockedScenarioOutput {
  outputId: ScenarioOutputId;
  reason: BlockedScenarioOutputReason;
  upstreamDependencies: ScenarioOutputId[];
  notes?: string;
}

export interface ScenarioOutputResult {
  outputId: ScenarioOutputId;
  status: ScenarioCalculationBoundaryStatus;
  unit: ScenarioOutputUnit;
  value: number | string | FinancialYearValue | null;
  blockedReason?: BlockedScenarioOutputReason;
  notes?: string;
}

export interface OperatingOutputResults {
  receita: ScenarioOutputResult;
  payrollFopag: ScenarioOutputResult;
  fopagReceitaRatio: ScenarioOutputResult;
  opex: ScenarioOutputResult;
  ebitda: ScenarioOutputResult;
  ebitdaMargin: ScenarioOutputResult;
  cumulativeResult: ScenarioOutputResult;
  breakEven: ScenarioOutputResult;
}

export interface InvestmentOutputResults {
  capex: ScenarioOutputResult;
  capexExposure: ScenarioOutputResult;
  simplePayback: ScenarioOutputResult;
  discountedPayback: ScenarioOutputResult;
  npv: ScenarioOutputResult;
}

export interface InterpretationOutputResults {
  scenarioTier: ScenarioOutputResult;
  blockedOutputExplanations: BlockedScenarioOutput[];
}

export interface ScenarioCalculationBoundaryOutput {
  status: ScenarioCalculationBoundaryStatus;
  dependencyStatus: ScenarioCalculationDependencyStatus;
  operatingOutputs: OperatingOutputResults;
  investmentOutputs: InvestmentOutputResults;
  interpretationOutputs: InterpretationOutputResults;
  inactiveScopeExpansionOutputIds: readonly InactiveScopeExpansionOutputId[];
  notes?: string;
}

export interface ScenarioCalculationBoundaryInput {
  inputFamilies: ScenarioCalculationInputFamilies;
  adapterOutputs: ScenarioAdapterOutputFamilies | null;
  dependencyStatus: ScenarioCalculationDependencyStatus;
}

export interface ScenarioCalculationBoundaryCompositionRules {
  receitaIsSimulatorOwned: true;
  payrollUsesExistingPayrollUtilities: true;
  opexCapexUsesMappedViabilityUtilitiesOnly: true;
  capexExcludedFromEbitda: true;
  nullMeansBlockedNotZero: true;
  outputCardsAreDisplayOnly: true;
  inactiveScopeExpansionOutputsRemainBlocked: true;
}

export const INACTIVE_SCOPE_EXPANSION_OUTPUT_IDS = [
  "total_costs_and_fixed_expenses",
  "contribution_margin",
  "ebit",
  "ebt",
  "net_income",
  "net_income_margin",
  "free_cash_flow",
  "cumulative_cash_flow",
  "discounted_cash_flow",
] as const satisfies readonly InactiveScopeExpansionOutputId[];

export const EMPTY_SCENARIO_CALCULATION_DEPENDENCY_STATUS: ScenarioCalculationDependencyStatus = {
  revenueInputs: "blocked_missing_input",
  payrollAdapterInputs: "blocked_mapping_pending",
  opexCapexAdapterInputs: "blocked_mapping_pending",
  receita: "blocked_not_defined",
  payrollFopag: "blocked_not_implemented",
  opexCapexSchedules: "blocked_not_implemented",
  capexExposure: "blocked_not_defined",
  ebitda: "blocked_not_defined",
  cumulativeResultAndBreakEven: "blocked_not_defined",
  npvAndPayback: "blocked_not_defined",
  scenarioTier: "blocked_not_defined",
  uiOutputRendering: "blocked_not_defined",
};

export const SCENARIO_CALCULATION_BOUNDARY_COMPOSITION_RULES: ScenarioCalculationBoundaryCompositionRules = {
  receitaIsSimulatorOwned: true,
  payrollUsesExistingPayrollUtilities: true,
  opexCapexUsesMappedViabilityUtilitiesOnly: true,
  capexExcludedFromEbitda: true,
  nullMeansBlockedNotZero: true,
  outputCardsAreDisplayOnly: true,
  inactiveScopeExpansionOutputsRemainBlocked: true,
};

export const EMPTY_SCENARIO_OUTPUT_RESULTS: Record<ScenarioOutputId, ScenarioOutputResult> = {
  receita: {
    outputId: "receita",
    status: "blocked_not_defined",
    unit: "BRL",
    value: null,
    blockedReason: "missing_revenue_inputs",
  },
  payroll_fopag: {
    outputId: "payroll_fopag",
    status: "blocked_not_implemented",
    unit: "BRL",
    value: null,
    blockedReason: "adapter_not_implemented",
  },
  fopag_receita_ratio: {
    outputId: "fopag_receita_ratio",
    status: "blocked_missing_input",
    unit: "percent",
    value: null,
    blockedReason: "missing_receita",
  },
  opex: {
    outputId: "opex",
    status: "blocked_not_implemented",
    unit: "BRL",
    value: null,
    blockedReason: "adapter_not_implemented",
  },
  capex: {
    outputId: "capex",
    status: "blocked_not_implemented",
    unit: "BRL",
    value: null,
    blockedReason: "adapter_not_implemented",
  },
  capex_exposure: {
    outputId: "capex_exposure",
    status: "blocked_not_defined",
    unit: "not_defined",
    value: null,
    blockedReason: "missing_capex",
  },
  ebitda: {
    outputId: "ebitda",
    status: "blocked_not_defined",
    unit: "BRL",
    value: null,
    blockedReason: "formula_not_defined",
  },
  ebitda_margin: {
    outputId: "ebitda_margin",
    status: "blocked_not_defined",
    unit: "percent",
    value: null,
    blockedReason: "formula_not_defined",
  },
  cumulative_result: {
    outputId: "cumulative_result",
    status: "blocked_not_defined",
    unit: "BRL",
    value: null,
    blockedReason: "formula_not_defined",
  },
  break_even: {
    outputId: "break_even",
    status: "blocked_not_defined",
    unit: "not_defined",
    value: null,
    blockedReason: "missing_cumulative_result",
  },
  simple_payback: {
    outputId: "simple_payback",
    status: "blocked_not_defined",
    unit: "years",
    value: null,
    blockedReason: "missing_cumulative_result",
  },
  discounted_payback: {
    outputId: "discounted_payback",
    status: "blocked_not_defined",
    unit: "years",
    value: null,
    blockedReason: "formula_not_defined",
  },
  npv: {
    outputId: "npv",
    status: "blocked_not_defined",
    unit: "BRL",
    value: null,
    blockedReason: "formula_not_defined",
  },
  scenario_tier: {
    outputId: "scenario_tier",
    status: "blocked_not_defined",
    unit: "label",
    value: null,
    blockedReason: "missing_governance_thresholds",
  },
};

export const EMPTY_SCENARIO_CALCULATION_BOUNDARY_OUTPUT: ScenarioCalculationBoundaryOutput = {
  status: "blocked_not_implemented",
  dependencyStatus: EMPTY_SCENARIO_CALCULATION_DEPENDENCY_STATUS,
  operatingOutputs: {
    receita: EMPTY_SCENARIO_OUTPUT_RESULTS.receita,
    payrollFopag: EMPTY_SCENARIO_OUTPUT_RESULTS.payroll_fopag,
    fopagReceitaRatio: EMPTY_SCENARIO_OUTPUT_RESULTS.fopag_receita_ratio,
    opex: EMPTY_SCENARIO_OUTPUT_RESULTS.opex,
    ebitda: EMPTY_SCENARIO_OUTPUT_RESULTS.ebitda,
    ebitdaMargin: EMPTY_SCENARIO_OUTPUT_RESULTS.ebitda_margin,
    cumulativeResult: EMPTY_SCENARIO_OUTPUT_RESULTS.cumulative_result,
    breakEven: EMPTY_SCENARIO_OUTPUT_RESULTS.break_even,
  },
  investmentOutputs: {
    capex: EMPTY_SCENARIO_OUTPUT_RESULTS.capex,
    capexExposure: EMPTY_SCENARIO_OUTPUT_RESULTS.capex_exposure,
    simplePayback: EMPTY_SCENARIO_OUTPUT_RESULTS.simple_payback,
    discountedPayback: EMPTY_SCENARIO_OUTPUT_RESULTS.discounted_payback,
    npv: EMPTY_SCENARIO_OUTPUT_RESULTS.npv,
  },
  interpretationOutputs: {
    scenarioTier: EMPTY_SCENARIO_OUTPUT_RESULTS.scenario_tier,
    blockedOutputExplanations: [],
  },
  inactiveScopeExpansionOutputIds: INACTIVE_SCOPE_EXPANSION_OUTPUT_IDS,
  notes:
    "Scenario Calculation Boundary contract exists, but calculation implementation has not been created. Only the fourteen approved board-facing outputs are active boundary outputs.",
};
