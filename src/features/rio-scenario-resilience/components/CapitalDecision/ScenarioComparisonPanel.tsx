// Phase 15F — Scenario comparison panel (page section C).
//
// Requires at least two saved scenarios. The user selects Scenario A and
// Scenario B (cannot be the same scenario) and sees a factual,
// dimension-by-dimension comparison computed via compareInvestmentScenarioPair
// on the two already-computed InvestmentInterpretationResult objects -- no
// additional production calculation is performed here, and no scenario other
// than A and B is recalculated or compared.
//
// Does not show an overall result, preferred scenario, winner, score, or
// rank. For more than two saved scenarios, creation order is preserved and
// no permanent baseline is designated.
//
// Phase 15J: extended with DRE-level fields (opening package, occupancy,
// tuition, org design, learners 2028, first EBITDA-positive year, EBITDA
// 2028/2032/2037, source-status warning count). DRE fields computed via
// calculateDre(input) per scenario. No winner row, no ranking.

import { useMemo } from "react";
import { Card } from "../../../../components/common";
import { compareInvestmentScenarioPair } from "../../model/scenarioInvestmentComparison";
import type { DimensionComparisonOutcome } from "../../model/scenarioInvestmentComparisonContract";
import type { SavedScenario } from "./capitalDecisionUiTypes";
import { calculateDre } from "../../model/dreEngine";
import { RECEITA_PROJECTION_YEARS } from "../../model/receitaEngineContract";
import { DRE_GOVERNANCE_READINESS } from "../../model/dreGovernanceReadiness";
import { formatBRL } from "../../../../lib/utils";
import {
  OCCUPANCY_LABELS,
  TUITION_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  formatOpeningPackageLabel,
} from "../../../../components/dreSimulator/dreLeverLabels";
import {
  formatDiscountedPayback,
  formatSpreadPp,
  formatVpl,
  getInvestmentReferenceStatusLabel,
} from "./capitalDecisionViewModel";

const SOURCE_STATUS_WARNING_COUNT = DRE_GOVERNANCE_READINESS.openItems.length;

export interface ScenarioComparisonPanelProps {
  readonly scenarios: readonly SavedScenario[];
  readonly scenarioAId: string | null;
  readonly scenarioBId: string | null;
  readonly onSelectA: (id: string) => void;
  readonly onSelectB: (id: string) => void;
}

function describeOutcome(
  outcome: DimensionComparisonOutcome,
  nameA: string,
  nameB: string,
): string {
  switch (outcome) {
    case "scenario_a_stronger":
      return `${nameA} stronger on this dimension`;
    case "scenario_b_stronger":
      return `${nameB} stronger on this dimension`;
    case "equal":
      return "Equal on this dimension";
    case "not_comparable":
      return "Not comparable";
  }
}

interface ComparisonRow {
  readonly label: string;
  readonly valueA: string;
  readonly valueB: string;
  readonly outcome: DimensionComparisonOutcome;
}

interface SimpleRow {
  readonly label: string;
  readonly valueA: string;
  readonly valueB: string;
}

function formatBRLCompact(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}R$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}R$${(abs / 1_000).toFixed(0)}K`;
  return formatBRL(v);
}

export function ScenarioComparisonPanel({
  scenarios,
  scenarioAId,
  scenarioBId,
  onSelectA,
  onSelectB,
}: ScenarioComparisonPanelProps) {
  if (scenarios.length < 2) {
    return (
      <section className="space-y-3" aria-labelledby="scenario-comparison-heading">
        <h2 id="scenario-comparison-heading" className="text-lg font-semibold text-slate-900">
          Scenario comparison
        </h2>
        <Card>
          <p className="text-sm leading-6 text-slate-600">
            Add a second saved scenario to enable comparison.
          </p>
        </Card>
      </section>
    );
  }

  const scenarioA = scenarios.find((s) => s.id === scenarioAId) ?? scenarios[0];
  const scenarioB =
    scenarios.find((s) => s.id === scenarioBId) ??
    scenarios.find((s) => s.id !== scenarioA.id) ??
    scenarios[1];

  const comparison =
    scenarioA.id !== scenarioB.id
      ? compareInvestmentScenarioPair(
          scenarioA.id,
          scenarioB.id,
          scenarioA.result,
          scenarioB.result,
        )
      : null;

  // Phase 15J: DRE-level fields per scenario
  const dreA = useMemo(() => calculateDre(scenarioA.input), [scenarioA.input]);
  const dreB = useMemo(() => calculateDre(scenarioB.input), [scenarioB.input]);

  const ebitdaPosYearA = RECEITA_PROJECTION_YEARS.find((y) => dreA.byYear[y].ebitda > 0);
  const ebitdaPosYearB = RECEITA_PROJECTION_YEARS.find((y) => dreB.byYear[y].ebitda > 0);

  const cumulativeEbitdaA = RECEITA_PROJECTION_YEARS.reduce(
    (sum, y) => sum + dreA.byYear[y].ebitda, 0,
  );
  const cumulativeEbitdaB = RECEITA_PROJECTION_YEARS.reduce(
    (sum, y) => sum + dreB.byYear[y].ebitda, 0,
  );

  const paybackA = formatDiscountedPayback(scenarioA.result);
  const paybackB = formatDiscountedPayback(scenarioB.result);
  const vplA = formatVpl(scenarioA.result.npvBRL, scenarioA.result.npvSign);
  const vplB = formatVpl(scenarioB.result.npvBRL, scenarioB.result.npvSign);

  const tirA = scenarioA.result.irrRate !== null
    ? `${(scenarioA.result.irrRate * 100).toFixed(1)}%`
    : "—";
  const tirB = scenarioB.result.irrRate !== null
    ? `${(scenarioB.result.irrRate * 100).toFixed(1)}%`
    : "—";

  const scenarioOverviewRows: SimpleRow[] = [
    {
      label: "Scenario name",
      valueA: scenarioA.name,
      valueB: scenarioB.name,
    },
    {
      label: "Opening package",
      valueA: formatOpeningPackageLabel(scenarioA.input.openingPackageId),
      valueB: formatOpeningPackageLabel(scenarioB.input.openingPackageId),
    },
    {
      label: "Occupancy",
      valueA: OCCUPANCY_LABELS[scenarioA.input.occupancyScenarioId] ?? scenarioA.input.occupancyScenarioId,
      valueB: OCCUPANCY_LABELS[scenarioB.input.occupancyScenarioId] ?? scenarioB.input.occupancyScenarioId,
    },
    {
      label: "Tuition scenario",
      valueA: TUITION_LABELS[scenarioA.input.tuitionScenarioId] ?? scenarioA.input.tuitionScenarioId,
      valueB: TUITION_LABELS[scenarioB.input.tuitionScenarioId] ?? scenarioB.input.tuitionScenarioId,
    },
    {
      label: "Org design option",
      valueA: ORG_DESIGN_OPTION_LABELS[scenarioA.input.orgDesignOptionId] ?? scenarioA.input.orgDesignOptionId,
      valueB: ORG_DESIGN_OPTION_LABELS[scenarioB.input.orgDesignOptionId] ?? scenarioB.input.orgDesignOptionId,
    },
    {
      label: "Learners 2028",
      valueA: String(dreA.byYear[2028].numero_de_alunos),
      valueB: String(dreB.byYear[2028].numero_de_alunos),
    },
    {
      label: "First EBITDA-positive year",
      valueA: String(ebitdaPosYearA ?? "Not within horizon"),
      valueB: String(ebitdaPosYearB ?? "Not within horizon"),
    },
    {
      label: "EBITDA 2028",
      valueA: formatBRLCompact(dreA.byYear[2028].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2028].ebitda),
    },
    {
      label: "EBITDA 2032",
      valueA: formatBRLCompact(dreA.byYear[2032].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2032].ebitda),
    },
    {
      label: "EBITDA 2037",
      valueA: formatBRLCompact(dreA.byYear[2037].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2037].ebitda),
    },
    {
      label: "Cumulative EBITDA (2028–2047)",
      valueA: formatBRLCompact(cumulativeEbitdaA),
      valueB: formatBRLCompact(cumulativeEbitdaB),
    },
    {
      label: "VPL / NPV",
      valueA: vplA.compact,
      valueB: vplB.compact,
    },
    {
      label: "TIR",
      valueA: tirA,
      valueB: tirB,
    },
    {
      label: "Discounted payback",
      valueA: paybackA.value,
      valueB: paybackB.value,
    },
    {
      label: "Source-status warning count",
      valueA: String(SOURCE_STATUS_WARNING_COUNT),
      valueB: String(SOURCE_STATUS_WARNING_COUNT),
    },
  ];

  const financialRows: ComparisonRow[] = comparison
    ? [
        {
          label: "Investment-reference status",
          valueA: getInvestmentReferenceStatusLabel(scenarioA.result.investmentReferenceStatus),
          valueB: getInvestmentReferenceStatusLabel(scenarioB.result.investmentReferenceStatus),
          outcome: comparison.investmentReferenceComparison,
        },
        {
          label: "TIR–WACC spread",
          valueA: formatSpreadPp(scenarioA.result.tirWaccSpreadRate),
          valueB: formatSpreadPp(scenarioB.result.tirWaccSpreadRate),
          outcome: comparison.tirWaccSpreadComparison,
        },
        {
          label: "VPL",
          valueA: vplA.compact,
          valueB: vplB.compact,
          outcome: comparison.npvComparison,
        },
        {
          label: "Discounted payback",
          valueA: paybackA.value,
          valueB: paybackB.value,
          outcome: comparison.discountedPaybackComparison,
        },
      ]
    : [];

  return (
    <section className="space-y-4" aria-labelledby="scenario-comparison-heading">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Scenario comparison
        </p>
        <h2 id="scenario-comparison-heading" className="text-lg font-semibold text-slate-900">
          Scenario output comparison
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scenario-a-select" className="block text-sm font-medium text-slate-700">
            Scenario A
          </label>
          <select
            id="scenario-a-select"
            value={scenarioA.id}
            onChange={(event) => onSelectA(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline focus:outline-2 focus:outline-blue-200"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="scenario-b-select" className="block text-sm font-medium text-slate-700">
            Scenario B
          </label>
          <select
            id="scenario-b-select"
            value={scenarioB.id}
            onChange={(event) => onSelectB(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline focus:outline-2 focus:outline-blue-200"
          >
            {scenarios
              .filter((scenario) => scenario.id !== scenarioA.id)
              .map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {!comparison ? (
        <Card>
          <p className="text-sm leading-6 text-slate-600">
            Select two different saved scenarios to compare.
          </p>
        </Card>
      ) : (
        <>
          <Card title="Scenario output overview">
            <p className="mb-3 text-xs text-slate-500">
              Factual scenario outputs. No scenario is ranked, scored, or recommended.
              Source-status warning count applies equally to all scenarios ({SOURCE_STATUS_WARNING_COUNT} open assumption items).
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400 w-1/3">
                      Field
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      {scenarioA.name}
                    </th>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                      {scenarioB.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioOverviewRows.map((row) => (
                    <tr key={row.label} className="border-t border-slate-100">
                      <th
                        scope="row"
                        className="px-2 py-2 text-left text-xs font-semibold text-slate-600"
                      >
                        {row.label}
                      </th>
                      <td className="px-2 py-2 text-xs text-slate-700 tabular-nums">
                        {row.valueA}
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-700 tabular-nums">
                        {row.valueB}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Dimension-by-dimension comparison">
            <p className="mb-3 text-xs text-slate-500">
              Trade-off analysis by investment dimension. No overall conclusion or recommendation.
            </p>
            <table className="block w-full md:table">
              <caption className="sr-only">
                Dimension comparison of {scenarioA.name} and {scenarioB.name}
              </caption>
              <thead className="hidden md:table-header-group">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Dimension
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {scenarioA.name}
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {scenarioB.name}
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Sensitivity
                  </th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {financialRows.map((row) => (
                  <tr
                    key={row.label}
                    className="block border-b border-slate-100 py-3 last:border-0 md:table-row md:border-b md:py-0"
                  >
                    <th
                      scope="row"
                      className="block px-2 pt-2 text-left text-sm font-semibold text-slate-700 md:table-cell md:py-3"
                    >
                      {row.label}
                    </th>
                    <td className="block px-2 text-sm text-slate-700 md:table-cell md:py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                        {scenarioA.name}:{" "}
                      </span>
                      {row.valueA}
                    </td>
                    <td className="block px-2 text-sm text-slate-700 md:table-cell md:py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                        {scenarioB.name}:{" "}
                      </span>
                      {row.valueB}
                    </td>
                    <td className="block px-2 pb-2 text-sm text-slate-600 md:table-cell md:py-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 md:hidden">
                        Sensitivity:{" "}
                      </span>
                      {describeOutcome(row.outcome, scenarioA.name, scenarioB.name)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {comparison && (
        <Card title="Trade-off notes">
          <ul className="space-y-2 text-sm leading-6 text-slate-600">
            {comparison.tradeOffNotes.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

export default ScenarioComparisonPanel;
