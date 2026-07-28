// Phase 15F — Investment reference panel.
//
// Renders, in order: TIR vs reference WACC (factual status), TIR, reference
// WACC, TIR-WACC spread. This is a factual comparison only -- it does not
// render "approved"/"recommended"/"rejected" language, and it does not
// collapse into a Tier, score, or recommendation.

import { Badge, Card } from "../../../../components/common";
import type { InvestmentInterpretationResult } from "../../model/investmentInterpretationEngineContract";
import {
  FinancialMetricCard,
} from "./FinancialMetricCard";
import {
  formatPercentOneDecimal,
  formatSpreadPp,
  getInvestmentReferenceStatusDisplay,
  getInvestmentReferenceStatusLabel,
} from "./capitalDecisionViewModel";
import { useLocale } from "../../../../i18n/useLocale";

export interface InvestmentReferencePanelProps {
  readonly result: InvestmentInterpretationResult;
}

export function InvestmentReferencePanel({ result }: InvestmentReferencePanelProps) {
  const { t } = useLocale();
  const statusDisplay = getInvestmentReferenceStatusDisplay(result);
  const statusLabel = getInvestmentReferenceStatusLabel(result.investmentReferenceStatus);
  const irrUnavailable = result.investmentReferenceStatus === "irr_unavailable";
  const blockedUpstream = result.investmentReferenceStatus === "blocked_upstream";

  const tirValue = blockedUpstream
    ? "—"
    : irrUnavailable
      ? "—"
      : formatPercentOneDecimal(result.irrRate);

  const spreadValue = blockedUpstream || irrUnavailable
    ? "—"
    : formatSpreadPp(result.tirWaccSpreadRate);

  return (
    <section className="space-y-3" aria-labelledby="investment-reference-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="investment-reference-heading" className="text-sm font-semibold text-slate-900">
          {t("capitalInvestmentRefHeader")}
        </h3>
        <Badge variant={blockedUpstream ? "default" : irrUnavailable ? "warning" : "info"}>
          {statusLabel}
        </Badge>
      </div>

      <Card>
        <p className="text-sm leading-6 text-slate-700">{statusDisplay.statusText}</p>
        {statusDisplay.detailNote && (
          <p className="mt-1 text-sm leading-6 text-slate-500">{statusDisplay.detailNote}</p>
        )}
        {result.irrMultipleRootsPossible === true && (
          <p className="mt-2 text-sm leading-6 text-amber-700" role="note">
            {t("capitalInvestmentRefMultipleRootsNote")}
          </p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <FinancialMetricCard
          label={t("capitalInvestmentRefTirLabel")}
          value={tirValue}
          unavailable={tirValue === "—"}
          statusText={
            irrUnavailable
              ? result.irrStatusReason || t("capitalInvestmentRefTirUnavailable")
              : undefined
          }
        />
        <FinancialMetricCard
          label={t("capitalInvestmentRefWaccLabel")}
          value={blockedUpstream ? "—" : formatPercentOneDecimal(result.investmentReferenceWaccRate)}
          unavailable={blockedUpstream}
        />
        <FinancialMetricCard
          label={t("capitalComparisonPanelRowTirWaccSpread")}
          value={spreadValue}
          unavailable={spreadValue === "—"}
        />
      </div>
    </section>
  );
}

export default InvestmentReferencePanel;
