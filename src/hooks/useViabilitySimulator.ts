import { useMemo, useState } from "react";
import { buildBaselineViewModel } from "../lib/viability/baseline";
import { buildSensitivityViewModel } from "../lib/viability/sensitivity";
import { buildThresholdViewModel } from "../lib/viability/thresholds";
import type {
  SensitivityVariable,
  ViabilityAssumptionSet,
  ViabilityMetric,
  ViabilityPlan,
  ViabilitySimulatorState,
} from "../lib/viability/types";

const DEFAULT_CAPEX_CATEGORIES = [
  "Building / fit-out",
  "Furniture & equipment",
  "Technology",
  "Learning spaces / labs",
  "Permits / consultants",
  "Pre-operational / launch",
  "Contingency",
  "Other",
].map((category) => ({
  id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  category,
  included: true,
  year: 2028,
  amount: 0,
  note: "",
}));

const DEFAULT_STATE: ViabilitySimulatorState = {
  activeScreen: "baseline",
  enrollmentScenario: "intermediario",
  tuitionScenario: "cen2",
  costScenario: "base",
  projectionHorizonYears: 20,
  discountRate: 10,
  payrollGrowthRate: 6,
  benefitsGrowthRate: 5,
  opexGrowthRate: 4,
  tuitionGrowthRate: 8,
  capexMode: "single-total",
  initialCapex: 28000000,
  recurringCapexAnnual: 1200000,
  capexIncluded:
    "Core building preparation, furniture, technology, launch setup, and other opening investments required to start operations.",
  capexExcluded:
    "Annual sustaining capital, financing costs, and operating expenses that remain in the yearly opex model.",
  capexCategories: DEFAULT_CAPEX_CATEGORIES,
};

function createActivePlan(assumptions: ViabilityAssumptionSet): ViabilityPlan {
  return {
    metadata: {
      planId: "baseline-plan",
      planName: "Current Planning Case",
      planVersion: "v1",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    assumptions,
  };
}

export function useViabilitySimulator() {
  const [state, setState] = useState<ViabilitySimulatorState>(DEFAULT_STATE);
  const [sensitivityMetric, setSensitivityMetric] = useState<ViabilityMetric>("VPL");
  const [rowVariable, setRowVariable] =
    useState<SensitivityVariable>("enrollmentScenario");
  const [columnVariable, setColumnVariable] =
    useState<SensitivityVariable>("tuitionScenario");
  const { activeScreen: _activeScreen, ...assumptions } = state;
  const activePlan = useMemo(
    () => createActivePlan(assumptions),
    [assumptions],
  );

  const baseline = useMemo(
    () => buildBaselineViewModel(activePlan.assumptions),
    [activePlan],
  );
  const sensitivity = useMemo(
    () =>
      buildSensitivityViewModel({
        assumptions: activePlan.assumptions,
        metric: sensitivityMetric,
        rowVariable,
        columnVariable,
      }),
    [activePlan, sensitivityMetric, rowVariable, columnVariable],
  );
  const thresholds = useMemo(
    () => buildThresholdViewModel(activePlan.assumptions),
    [activePlan],
  );

  return {
    state,
    setState,
    activePlan,
    sensitivityMetric,
    setSensitivityMetric,
    rowVariable,
    setRowVariable,
    columnVariable,
    setColumnVariable,
    baseline,
    sensitivity,
    thresholds,
  };
}
