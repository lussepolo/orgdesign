// Phase 15O — Compact governance summary with collapsible methodology layer.
//
// Always-visible: simulation availability and pending closure indicators.
// Collapsible: full F-code provenance list (details layer, collapsed by default).

import { useState } from "react";
import { Info, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../common/Card";
import { DRE_GOVERNANCE_READINESS } from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

const F_CODE_MAP: Record<string, string> = {
  outras_receitas_reajuste: "F01",
  tuition_source_provenance: "F03",
  discount_schedule_provenance: "F04",
  enrollment_baseline_parity: "F05",
  instructional_capacity_payroll_sync: "F06",
};

const F_DESCRIPTION_KEYS: Record<string, TranslationKey> = {
  outras_receitas_reajuste: "dreGovSummaryDescOutrasReceitas",
  tuition_source_provenance: "dreGovSummaryDescTuitionProvenance",
  discount_schedule_provenance: "dreGovSummaryDescDiscountProvenance",
  enrollment_baseline_parity: "dreGovSummaryDescEnrollmentParity",
  instructional_capacity_payroll_sync: "dreGovSummaryDescCapacitySync",
};

const STATUS_LABEL_KEYS: Record<string, TranslationKey> = {
  provisional_source: "dreGovSummaryStatusProvisional",
  reconciliation_required: "dreGovSummaryStatusReconciliation",
  pending_finance_confirmation: "dreGovSummaryStatusPendingConfirmation",
};

export default function DreGovernanceSummaryPanel() {
  const { t } = useLocale();
  const [showDetails, setShowDetails] = useState(false);
  const openItems = DRE_GOVERNANCE_READINESS.openItems;

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
          {t("dreGovSummaryOpenItemsNote").replace("{n}", String(openItems.length))}
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

            {openItems.map((item) => {
              const fCode = F_CODE_MAP[item.key] ?? item.key;
              const descriptionKey = F_DESCRIPTION_KEYS[item.key];
              const description = descriptionKey ? t(descriptionKey) : item.label;
              const statusLabelKey = STATUS_LABEL_KEYS[item.status];
              const statusLabel = statusLabelKey ? t(statusLabelKey) : item.status;
              return (
                <div
                  key={item.key}
                  className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
                >
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                        {fCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{description}</span>
                      <span className="text-[10px] text-amber-600 font-medium">{statusLabel}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {t("dreGovSummaryOwnerNote").replace("{owner}", item.requiredOwner)}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                    F02
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {t("dreGovSummaryF02Label")}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    {t("dreGovSummaryResolvedEngineering")}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {t("dreGovSummaryF02Note")}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
