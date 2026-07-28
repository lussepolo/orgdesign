// Phase 15F — methodology and assumptions disclosure.
//
// Collapsed by default (native <details>, keyboard-accessible). Surfaces
// WACC source, the strict TIR > WACC rule, the discounted-payback horizon,
// Service Contracts / MS-HS Progression treatment, explicit exclusions, and
// source provenance -- all read verbatim from the committed Phase 15E
// result. No new methodology is introduced here.
//
// Phase 15Q: Service Contracts section now includes expandable line-item
// breakdown (8 rows flagged serviceContractsCategory: true in DRE_LINE_ITEM_MAP)
// with 2028 and 2047 values from DRE_ANNUAL_ASSUMPTION_SOURCE_DATA.

import type { InvestmentInterpretationResult } from "../../model/investmentInterpretationEngineContract";
import { formatPercentZeroDecimal } from "./capitalDecisionViewModel";
import { DRE_LINE_ITEM_MAP } from "../../model/dreLineItemMap";
import { DRE_ANNUAL_ASSUMPTION_SOURCE_DATA } from "../../model/dreAnnualAssumptionSourceData";
import { useLocale } from "../../../../i18n/useLocale";
import { formatCurrencyBRL } from "../../../../i18n/formatters";
import type { TranslationKey } from "../../../../i18n/localeContract";

export interface MethodologyDisclosureProps {
  readonly result: InvestmentInterpretationResult;
}

const EXCLUSION_LABEL_KEYS: Record<string, TranslationKey> = {
  receitaRecalculation: "capitalMethodologyExclusionReceitaRecalc",
  fopagRecalculation: "capitalMethodologyExclusionFopagRecalc",
  ebitdaRecalculation: "capitalMethodologyExclusionEbitdaRecalc",
  fcoRecalculation: "capitalMethodologyExclusionFcoRecalc",
  capexRecalculation: "capitalMethodologyExclusionCapexRecalc",
  dcfRecalculation: "capitalMethodologyExclusionDcfRecalc",
  npvRecalculation: "capitalMethodologyExclusionNpvRecalc",
  irrRecalculation: "capitalMethodologyExclusionIrrRecalc",
  discountedPaybackRecalculation: "capitalMethodologyExclusionPaybackRecalc",
  tierTaxonomy: "capitalMethodologyExclusionTierTaxonomy",
  weightedScore: "capitalMethodologyExclusionWeightedScore",
  totalRanking: "capitalMethodologyExclusionTotalRanking",
  overallWinner: "capitalMethodologyExclusionOverallWinner",
  boardRecommendation: "capitalMethodologyExclusionBoardRecommendation",
  uiInterpretation: "capitalMethodologyExclusionUiInterpretation",
};

// Service contract line items: 8 rows with serviceContractsCategory: true.
// Join key: dreLineItemMapDreLineId (when present) bridges the source-data
// record's dreLineId to the map's dreLineId for 3 variant rows.
const SERVICE_CONTRACT_LINE_IDS = DRE_LINE_ITEM_MAP
  .filter((item) => item.serviceContractsCategory === true)
  .map((item) => ({ dreLineId: item.dreLineId, displayLabelPt: item.displayLabelPt }));

const SERVICE_CONTRACT_ITEMS = SERVICE_CONTRACT_LINE_IDS.map(({ dreLineId, displayLabelPt }) => {
  const record = DRE_ANNUAL_ASSUMPTION_SOURCE_DATA.records.find(
    (r) => r.dreLineId === dreLineId || r.dreLineItemMapDreLineId === dreLineId,
  );
  return {
    dreLineId,
    displayLabelPt,
    value2028: record?.annualValuesByYear[2028] ?? null,
    value2047: record?.annualValuesByYear[2047] ?? null,
  };
});

export function MethodologyDisclosure({ result }: MethodologyDisclosureProps) {
  const { t, locale } = useLocale();
  const { sourceProvenance, explicitExclusions, decisionLevers } = result;
  const waccPercent = formatPercentZeroDecimal(result.investmentReferenceWaccRate);

  function formatBRL(value: number | null): string {
    if (value === null) return "—";
    return formatCurrencyBRL(Math.abs(value), locale);
  }

  const exclusionEntries = Object.entries(explicitExclusions).filter(
    ([key, value]) => value === "excluded" && key in EXCLUSION_LABEL_KEYS,
  );

  const scTotal2028 = SERVICE_CONTRACT_ITEMS.reduce(
    (sum, item) => sum + (item.value2028 ?? 0),
    0,
  );
  const scTotal2047 = SERVICE_CONTRACT_ITEMS.reduce(
    (sum, item) => sum + (item.value2047 ?? 0),
    0,
  );

  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">
        {t("capitalMethodologyTitle")}
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologyWaccHeader")}
          </h4>
          <p className="mt-1">
            {t("capitalMethodologyWaccBody")
              .replace("{pct}", waccPercent)
              .replace("{source}", sourceProvenance.investmentReferenceWaccSource)}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologyInvestmentRuleHeader")}
          </h4>
          <p className="mt-1">
            {t("capitalMethodologyInvestmentRuleBody")}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologyPaybackHorizonHeader")}
          </h4>
          <p className="mt-1">
            {t("capitalMethodologyPaybackHorizonBody")}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologyServiceContractsHeader")}
          </h4>
          <p className="mt-1">
            {decisionLevers.serviceContracts === "fixed_approved_dre_assumption"
              ? t("capitalConfigPanelServiceContractsBody")
              : decisionLevers.serviceContracts}
          </p>
          <details className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-500">
              {t("capitalMethodologyServiceContractLineItemsSummary")}
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-1 pr-3 font-medium">{t("capitalMethodologyColLineItem")}</th>
                    <th className="pb-1 pr-3 font-medium text-right">2028</th>
                    <th className="pb-1 font-medium text-right">2047</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SERVICE_CONTRACT_ITEMS.map((item) => (
                    <tr key={item.dreLineId}>
                      <td className="py-1 pr-3 text-slate-700">{item.displayLabelPt}</td>
                      <td className="py-1 pr-3 text-right text-slate-600">{formatBRL(item.value2028)}</td>
                      <td className="py-1 text-right text-slate-600">{formatBRL(item.value2047)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-200 font-semibold text-slate-700">
                    <td className="pt-1 pr-3">{t("capitalMethodologyColTotal")}</td>
                    <td className="pt-1 pr-3 text-right">{formatBRL(scTotal2028)}</td>
                    <td className="pt-1 text-right">{formatBRL(scTotal2047)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-slate-400">
              {t("capitalMethodologyServiceContractsNote")}
            </p>
          </details>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologyMsHsHeader")}
          </h4>
          <p className="mt-1">
            {decisionLevers.msHsProgressionModel === "future_upstream_integration_not_wired"
              ? t("capitalConfigPanelMsHsBody")
              : decisionLevers.msHsProgressionModel}
          </p>
        </div>

        {exclusionEntries.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {t("capitalMethodologyExclusionsHeader")}
            </h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {exclusionEntries.map(([key]) => (
                <li key={key}>{t(EXCLUSION_LABEL_KEYS[key])}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {t("capitalMethodologySourceProvenanceHeader")}
          </h4>
          <ul className="mt-1 space-y-1">
            <li>{t("capitalMethodologyPhase15cCommit").replace("{value}", sourceProvenance.phase15cCommit)}</li>
            <li>{t("capitalMethodologyPhase15dCommit").replace("{value}", sourceProvenance.phase15dCommit)}</li>
            <li>{t("capitalMethodologyMethodologyDoc").replace("{value}", sourceProvenance.ratifiedMethodologyDoc)}</li>
            {sourceProvenance.ratifiedSections.length > 0 && (
              <li>{t("capitalMethodologyRatifiedSections").replace("{value}", sourceProvenance.ratifiedSections.join(", "))}</li>
            )}
          </ul>
          {sourceProvenance.notes.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-500">
              {sourceProvenance.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </details>
  );
}

export default MethodologyDisclosure;
