import { formatPercent } from "./formatters";
import type {
  ThresholdResultCard,
  ThresholdViewModel,
  ViabilityAssumptionSet,
} from "./types";

export function buildThresholdViewModel(
  assumptions: ViabilityAssumptionSet,
): ThresholdViewModel {
  const targetCoverage = 1.18;
  const currentCoverage = 1.07;
  const tuitionLift = Math.max(0, targetCoverage - currentCoverage) * 100;
  const enrollmentLift = Math.max(0, (assumptions.enrollmentScenario === "pessimista" ? 9 : 5));

  const resultCards: ThresholdResultCard[] = [
    {
      id: "tuition",
      label: "Minimum Viable Tuition Lift",
      value: tuitionLift,
      format: "percent",
      detail: "Directional pricing adjustment required to clear the current viability threshold.",
      tone: "warning",
    },
    {
      id: "enrollment",
      label: "Minimum Enrollment Lift",
      value: enrollmentLift,
      format: "percent",
      detail: "Directional demand-side gap while keeping non-teaching staffing shared/global.",
      tone: "info",
    },
    {
      id: "payback",
      label: "Payback at Viability Point",
      value: 6.4,
      format: "years",
      detail: "Indicative timing output for the threshold view.",
      tone: "success",
    },
  ];

  return {
    controls: [
      {
        label: "Threshold question",
        value: "What minimum conditions clear viability?",
        note: "This can later be evaluated against CAPEX ceiling, tuition floor, or enrollment floor questions.",
      },
      {
        label: "Evaluation metric",
        value: "VPL > 0",
        note: "The current view frames threshold analysis around clearing a positive value threshold.",
      },
      {
        label: "Discount rate held fixed",
        value: formatPercent(assumptions.discountRate),
        note: "Held fixed unless explicitly selected as a threshold driver.",
      },
      {
        label: "Planning horizon",
        value: `${assumptions.projectionHorizonYears} years`,
        note: "Aligned to the extended 2028-2047 payroll horizon.",
      },
    ],
    resultCards,
    chartSeries: Array.from({ length: 6 }, (_, index) => ({
      year: 2028 + index,
      baseCase: 1.02 + index * 0.04,
      thresholdCase: 1.08 + index * 0.06,
    })),
    narrative: [
      "Threshold outputs shown here are directional planning markers, not solved threshold answers yet.",
      "This view is intended to support questions such as maximum viable CAPEX, minimum viable tuition, and minimum enrollment required.",
      "When threshold logic is added, it should preserve the same operating-model propagation rules used in baseline and sensitivity runs.",
      "Non-teaching staffing remains shared/global unless a later simulator phase explicitly changes that behavior.",
    ],
  };
}
