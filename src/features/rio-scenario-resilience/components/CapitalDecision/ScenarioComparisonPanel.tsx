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

import { Card } from "../../../../components/common";
import { compareInvestmentScenarioPair } from "../../model/scenarioInvestmentComparison";
import type { DimensionComparisonOutcome } from "../../model/scenarioInvestmentComparisonContract";
import type { SavedScenario } from "./capitalDecisionUiTypes";
import {
  formatDiscountedPayback,
  formatSpreadPp,
  formatVpl,
  getInvestmentReferenceStatusLabel,
} from "./capitalDecisionViewModel";

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
          Compare scenarios
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

  const paybackA = formatDiscountedPayback(scenarioA.result);
  const paybackB = formatDiscountedPayback(scenarioB.result);
  const vplA = formatVpl(scenarioA.result.npvBRL, scenarioA.result.npvSign);
  const vplB = formatVpl(scenarioB.result.npvBRL, scenarioB.result.npvSign);

  const rows: ComparisonRow[] = comparison
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
          Compare Scenarios
        </p>
        <h2 id="scenario-comparison-heading" className="text-lg font-semibold text-slate-900">
          Pairwise comparison
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
        <Card>
          <table className="block w-full md:table">
            <caption className="sr-only">
              Pairwise financial comparison of {scenarioA.name} and {scenarioB.name}
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
                  Comparison
                </th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {rows.map((row) => (
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
                      Comparison:{" "}
                    </span>
                    {describeOutcome(row.outcome, scenarioA.name, scenarioB.name)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
