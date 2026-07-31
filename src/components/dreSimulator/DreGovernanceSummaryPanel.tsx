// Phase 15O — Compact governance summary with collapsible methodology layer.
//
// Always-visible: simulation availability and pending closure indicators.
// Collapsible: full F-code provenance list (details layer, collapsed by default).

import { useState } from "react";
import { Info, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  DRE_HISTORICAL_GOVERNANCE_ITEMS,
} from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

const ITEM_TITLE_KEYS: Record<string, TranslationKey> = {
  desconto_metodo_reverification: "dreGovItemTitleDescontoMetodo",
  tuition_source_provenance_by_option: "dreGovItemTitleTuitionProvenance",
  tuition_finance_signoff: "dreGovItemTitleTuitionApproval",
  discount_schedule_finance_signoff: "dreGovItemTitleDiscountApproval",
  ms_hs_grade_level_staffing_boundary: "dreGovItemTitleMsHsBoundary",
  ms_hs_staffing_source_reconciliation: "dreGovItemTitleMsHsReconciliation",
  corporate_allocation_unavailable: "dreGovItemTitleCorporateAllocation",
  outras_receitas_reajuste_formula_gap: "dreGovItemTitleF01Historical",
  enrollment_baseline_parity_retired: "dreGovItemTitleF05Historical",
  descontos_metodo_formula_base_resolved: "dreGovItemTitleF02Resolved",
};

const ITEM_BODY_KEYS: Record<string, TranslationKey> = {
  desconto_metodo_reverification: "dreGovItemBodyDescontoMetodo",
  tuition_source_provenance_by_option: "dreGovItemBodyTuitionProvenance",
  tuition_finance_signoff: "dreGovItemBodyTuitionApproval",
  discount_schedule_finance_signoff: "dreGovItemBodyDiscountApproval",
  ms_hs_grade_level_staffing_boundary: "dreGovItemBodyMsHsBoundary",
  ms_hs_staffing_source_reconciliation: "dreGovItemBodyMsHsReconciliation",
  corporate_allocation_unavailable: "dreGovItemBodyCorporateAllocation",
  outras_receitas_reajuste_formula_gap: "dreGovItemBodyF01Historical",
  enrollment_baseline_parity_retired: "dreGovItemBodyF05Historical",
  descontos_metodo_formula_base_resolved: "dreGovItemBodyF02Resolved",
};

const STATUS_LABEL_KEYS: Record<string, TranslationKey> = {
  active_governance_item: "dreGovSummaryStatusActiveGovernance",
  finance_approval_pending: "dreGovSummaryStatusFinanceApproval",
  reconciliation_required: "dreGovSummaryStatusReconciliation",
  scope_exclusion: "dreGovSummaryStatusScopeExclusion",
  capability_unavailable: "dreGovSummaryStatusCapabilityUnavailable",
  resolved_historical: "dreGovSummaryStatusResolvedHistorical",
  retired_historical: "dreGovSummaryStatusRetiredHistorical",
};

export default function DreGovernanceSummaryPanel() {
  const { t } = useLocale();
  const [showDetails, setShowDetails] = useState(false);
  const activeItems = DRE_ACTIVE_GOVERNANCE_ITEMS;
  const historicalItems = DRE_HISTORICAL_GOVERNANCE_ITEMS;

  return (
    <div data-testid="dre-governance-summary">
      <Card
        title={t("dreGovSummaryTitle")}
        subtitle={t("dreGovSummarySubtitle")}
        icon={Info}
      >
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span className="text-sm text-slate-700">{t("dreGovSummarySimAvailable")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="text-sm text-slate-600">{t("dreGovSummaryFinancePending")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-sm text-slate-600">{t("dreGovSummaryBoardPending")}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {t("dreGovSummaryOpenItemsNote").replace("{n}", String(activeItems.length))}
        </p>

        <button
          type="button"
          onClick={() => setShowDetails((p) => !p)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          {t("dreGovSummaryMethodologyToggle")}
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              {t("dreGovSummaryDetailsIntro")}
            </p>

            {activeItems.map((item) => {
              const statusLabelKey = STATUS_LABEL_KEYS[item.displayStatus];
              const titleKey = ITEM_TITLE_KEYS[item.key] ?? "dreGovItemTitleFallback";
              const bodyKey = ITEM_BODY_KEYS[item.key] ?? "dreGovItemBodyFallback";
              return (
                <div
                  key={item.key}
                  className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
                >
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                        {item.internalIds.join(" / ")}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{t(titleKey)}</span>
                      <span className="text-[10px] text-amber-600 font-medium">{t(statusLabelKey)}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {t(bodyKey)}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      {t("dreGovSummaryMethodologyMeta")
                        .replace("{classes}", item.classifications.join(", "))
                        .replace("{finance}", item.financeApprovalStatus)
                        .replace("{board}", item.boardRatificationStatus)
                        .replace("{owner}", item.requiredOwner)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {t("dreGovSummaryHistoricalTitle")}
              </p>
              <div className="space-y-2">
                {historicalItems.map((item) => {
                  const statusLabelKey = STATUS_LABEL_KEYS[item.displayStatus];
                  const titleKey = ITEM_TITLE_KEYS[item.key] ?? "dreGovItemTitleFallback";
                  const bodyKey = ITEM_BODY_KEYS[item.key] ?? "dreGovItemBodyFallback";
                  return (
                    <div
                      key={item.key}
                      className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                            {item.internalIds.join(" / ")}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{t(titleKey)}</span>
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {t(statusLabelKey)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">{t(bodyKey)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
