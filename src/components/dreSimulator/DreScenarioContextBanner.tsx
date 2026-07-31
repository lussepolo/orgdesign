import { Compass, CheckCircle2 } from "lucide-react";
import { Badge } from "../common/Badge";
import { useLocale } from "../../i18n/useLocale";
import {
  OCCUPANCY_LABELS,
  TUITION_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  formatOpeningPackageLabel,
} from "./dreLeverLabels";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";

interface DreScenarioContextBannerProps {
  selections: DreScenarioSimulatorSelections;
  year: OpeningPackageProjectionYear;
}

// Phase 14B-UI: scenario-identity banner. Answers "what scenario am I looking
// at?" before any levers or outputs. Labels and status text only — no new
// calculations, no new data sources.
//
// Phase 14B-UI-VISUAL-FIXES: added an "Operating read" strip that summarizes
// the selected analysis year, EBITDA-positive year, and selected-year
// EBITDA/EBITDA margin. All values are read directly from dreOutput.byYear
// (the same unified scenario result used everywhere else) — no new
// calculations.
export default function DreScenarioContextBanner({ selections, year }: DreScenarioContextBannerProps) {
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-cockpit-border bg-cockpit-card p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-cockpit-meta" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cockpit-meta">
              {t("dreScenarioContextBannerSelectedScenarioLabel")}
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-cockpit-slate md:text-base">
              <span className="font-semibold text-cockpit-ink">
                {formatOpeningPackageLabel(selections.openingPackageId)}
              </span>{" "}
              · <span className="font-semibold text-cockpit-ink">
                {OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId}
              </span>{" "}
              {t("dreScenarioContextBannerOccupancySuffix")} ·{" "}
              <span className="font-semibold text-cockpit-ink">
                {TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId}
              </span>{" "}
              {t("dreScenarioContextBannerTuitionSuffix")} ·{" "}
              <span className="font-semibold text-cockpit-ink">
                {ORG_DESIGN_OPTION_LABELS[selections.orgDesignOptionId] ?? selections.orgDesignOptionId}
              </span>{" "}
              {t("dreScenarioContextBannerOrgDesignSuffix")}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-1.5 md:justify-end">
          <Badge variant="default">{t("dreScenarioContextBannerBadgeOperatingLayer")}</Badge>
          <Badge variant="default">{t("dreScenarioContextBannerBadgeCapex")}</Badge>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            {t("dreScenarioContextBannerAnalysisYearLabel")}
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums text-cockpit-ink">{year}</div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">{t("dreScenarioContextBannerSimAvailableLabel")}</div>
            <div className="text-[11px] text-emerald-800">{t("dreScenarioContextBannerSimAvailableBody")}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">{t("dreScenarioContextBannerSourcePendingLabel")}</div>
            <div className="text-[11px] text-amber-800">
              {t("dreScenarioContextBannerSourcePendingBody")}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{t("dreScenarioContextBannerBoardPendingLabel")}</div>
            <div className="text-[11px] text-slate-600">{t("dreScenarioContextBannerBoardPendingBody")}</div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-cockpit-meta">
        {t("dreScenarioContextBannerFooterNote")}
      </p>
    </div>
  );
}
