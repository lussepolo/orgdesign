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
import { useLocale } from "../../../../i18n/useLocale";
import type { TranslationKey } from "../../../../i18n/localeContract";

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
  t: (key: TranslationKey) => string,
): string {
  switch (outcome) {
    case "scenario_a_stronger":
      return t("capitalComparisonPanelStrongerOnDimension").replace("{name}", nameA);
    case "scenario_b_stronger":
      return t("capitalComparisonPanelStrongerOnDimension").replace("{name}", nameB);
    case "equal":
      return t("capitalComparisonPanelEqualOnDimension");
    case "not_comparable":
      return t("capitalComparisonPanelNotComparable");
  }
}

interface ComparisonRow {
  readonly labelKey: TranslationKey;
  readonly valueA: string;
  readonly valueB: string;
  readonly outcome: DimensionComparisonOutcome;
}

interface SimpleRow {
  readonly labelKey: TranslationKey;
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
  const { t } = useLocale();
  if (scenarios.length < 2) {
    return (
      <section className="space-y-3" aria-labelledby="scenario-comparison-heading">
        <h2 id="scenario-comparison-heading" className="text-lg font-semibold text-slate-900">
          {t("capitalComparisonPanelTitle")}
        </h2>
        <Card>
          <p className="text-sm leading-6 text-slate-600">
            {t("capitalComparisonPanelAddSecond")}
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
      labelKey: "capitalComparisonPanelRowScenarioName",
      valueA: scenarioA.name,
      valueB: scenarioB.name,
    },
    {
      labelKey: "capitalComparisonPanelRowOpeningPackage",
      valueA: formatOpeningPackageLabel(scenarioA.input.openingPackageId),
      valueB: formatOpeningPackageLabel(scenarioB.input.openingPackageId),
    },
    {
      labelKey: "capitalComparisonPanelRowOccupancy",
      valueA: OCCUPANCY_LABELS[scenarioA.input.occupancyScenarioId] ?? scenarioA.input.occupancyScenarioId,
      valueB: OCCUPANCY_LABELS[scenarioB.input.occupancyScenarioId] ?? scenarioB.input.occupancyScenarioId,
    },
    {
      labelKey: "capitalComparisonPanelRowTuitionScenario",
      valueA: TUITION_LABELS[scenarioA.input.tuitionScenarioId] ?? scenarioA.input.tuitionScenarioId,
      valueB: TUITION_LABELS[scenarioB.input.tuitionScenarioId] ?? scenarioB.input.tuitionScenarioId,
    },
    {
      labelKey: "capitalComparisonPanelRowOrgDesignOption",
      valueA: ORG_DESIGN_OPTION_LABELS[scenarioA.input.orgDesignOptionId] ?? scenarioA.input.orgDesignOptionId,
      valueB: ORG_DESIGN_OPTION_LABELS[scenarioB.input.orgDesignOptionId] ?? scenarioB.input.orgDesignOptionId,
    },
    {
      labelKey: "capitalComparisonPanelRowLearners2028",
      valueA: String(dreA.byYear[2028].numero_de_alunos),
      valueB: String(dreB.byYear[2028].numero_de_alunos),
    },
    {
      labelKey: "capitalComparisonPanelRowFirstEbitdaPositiveYear",
      valueA: ebitdaPosYearA !== undefined ? String(ebitdaPosYearA) : t("dreScenarioContextBannerNotWithinHorizon"),
      valueB: ebitdaPosYearB !== undefined ? String(ebitdaPosYearB) : t("dreScenarioContextBannerNotWithinHorizon"),
    },
    {
      labelKey: "capitalComparisonPanelRowEbitda2028",
      valueA: formatBRLCompact(dreA.byYear[2028].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2028].ebitda),
    },
    {
      labelKey: "capitalComparisonPanelRowEbitda2032",
      valueA: formatBRLCompact(dreA.byYear[2032].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2032].ebitda),
    },
    {
      labelKey: "capitalComparisonPanelRowEbitda2037",
      valueA: formatBRLCompact(dreA.byYear[2037].ebitda),
      valueB: formatBRLCompact(dreB.byYear[2037].ebitda),
    },
    {
      labelKey: "capitalComparisonPanelRowCumulativeEbitda",
      valueA: formatBRLCompact(cumulativeEbitdaA),
      valueB: formatBRLCompact(cumulativeEbitdaB),
    },
    {
      labelKey: "capitalComparisonPanelRowVplNpv",
      valueA: vplA.compact,
      valueB: vplB.compact,
    },
    {
      labelKey: "capitalComparisonPanelRowTir",
      valueA: tirA,
      valueB: tirB,
    },
    {
      labelKey: "capitalComparisonPanelRowDiscountedPayback",
      valueA: paybackA.value,
      valueB: paybackB.value,
    },
    {
      labelKey: "capitalComparisonPanelRowSourceStatusWarningCount",
      valueA: String(SOURCE_STATUS_WARNING_COUNT),
      valueB: String(SOURCE_STATUS_WARNING_COUNT),
    },
  ];

  const financialRows: ComparisonRow[] = comparison
    ? [
        {
          labelKey: "capitalComparisonPanelRowInvestmentReferenceStatus",
          valueA: getInvestmentReferenceStatusLabel(scenarioA.result.investmentReferenceStatus),
          valueB: getInvestmentReferenceStatusLabel(scenarioB.result.investmentReferenceStatus),
          outcome: comparison.investmentReferenceComparison,
        },
        {
          labelKey: "capitalComparisonPanelRowTirWaccSpread",
          valueA: formatSpreadPp(scenarioA.result.tirWaccSpreadRate),
          valueB: formatSpreadPp(scenarioB.result.tirWaccSpreadRate),
          outcome: comparison.tirWaccSpreadComparison,
        },
        {
          labelKey: "capitalComparisonPanelRowVpl",
          valueA: vplA.compact,
          valueB: vplB.compact,
          outcome: comparison.npvComparison,
        },
        {
          labelKey: "capitalComparisonPanelRowDiscountedPayback",
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
          {t("capitalComparisonPanelTitle")}
        </p>
        <h2 id="scenario-comparison-heading" className="text-lg font-semibold text-slate-900">
          {t("capitalComparisonPanelOutputComparisonTitle")}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="scenario-a-select" className="block text-sm font-medium text-slate-700">
            {t("capitalComparisonPanelScenarioALabel")}
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
            {t("capitalComparisonPanelScenarioBLabel")}
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
            {t("capitalComparisonPanelSelectTwo")}
          </p>
        </Card>
      ) : (
        <>
          <Card title={t("capitalComparisonPanelOverviewTitle")}>
            <p className="mb-3 text-xs text-slate-500">
              {t("capitalComparisonPanelOverviewIntro").replace("{n}", String(SOURCE_STATUS_WARNING_COUNT))}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400 w-1/3">
                      {t("capitalComparisonPanelFieldCol")}
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
                    <tr key={row.labelKey} className="border-t border-slate-100">
                      <th
                        scope="row"
                        className="px-2 py-2 text-left text-xs font-semibold text-slate-600"
                      >
                        {t(row.labelKey)}
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

          <Card title={t("capitalComparisonPanelDimensionTitle")}>
            <p className="mb-3 text-xs text-slate-500">
              {t("capitalComparisonPanelDimensionIntro")}
            </p>
            <table className="block w-full md:table">
              <caption className="sr-only">
                {t("capitalComparisonPanelCaption").replace("{a}", scenarioA.name).replace("{b}", scenarioB.name)}
              </caption>
              <thead className="hidden md:table-header-group">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t("capitalComparisonPanelDimensionCol")}
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {scenarioA.name}
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {scenarioB.name}
                  </th>
                  <th scope="col" className="px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t("capitalComparisonPanelSensitivityCol")}
                  </th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group">
                {financialRows.map((row) => (
                  <tr
                    key={row.labelKey}
                    className="block border-b border-slate-100 py-3 last:border-0 md:table-row md:border-b md:py-0"
                  >
                    <th
                      scope="row"
                      className="block px-2 pt-2 text-left text-sm font-semibold text-slate-700 md:table-cell md:py-3"
                    >
                      {t(row.labelKey)}
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
                        {t("capitalComparisonPanelSensitivityCol")}:{" "}
                      </span>
                      {describeOutcome(row.outcome, scenarioA.name, scenarioB.name, t)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {comparison && (
        <Card title={t("capitalComparisonPanelTradeOffNotesTitle")}>
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
