import { Compass, CheckCircle2 } from "lucide-react";
import { Badge } from "../common/Badge";
import { formatBRL } from "../../lib/utils";
import {
  OCCUPANCY_LABELS,
  TUITION_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  formatOpeningPackageLabel,
} from "./dreLeverLabels";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";
import { DRE_GOVERNANCE_READINESS } from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";

interface DreScenarioContextBannerProps {
  selections: DreScenarioSimulatorSelections;
  dreOutput: DreEngineOutput;
  year: OpeningPackageProjectionYear;
}

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

// Phase 14B-UI: scenario-identity banner. Answers "what scenario am I looking
// at?" before any levers or outputs. Labels and status text only — no new
// calculations, no new data sources.
//
// Phase 14B-UI-VISUAL-FIXES: added an "Operating read" strip that summarizes
// the selected analysis year, EBITDA-positive year, and selected-year
// EBITDA/EBITDA margin. All values are read directly from dreOutput.byYear
// (the same unified scenario result used everywhere else) — no new
// calculations.
export default function DreScenarioContextBanner({ selections, dreOutput, year }: DreScenarioContextBannerProps) {
  const yearResult = dreOutput.byYear[year];
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((y) => dreOutput.byYear[y].ebitda > 0);

  return (
    <div className="rounded-[20px] border border-cockpit-border bg-cockpit-card p-5 md:rounded-[24px] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-cockpit-meta" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cockpit-meta">
              Selected Scenario
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-cockpit-slate md:text-base">
              <span className="font-semibold text-cockpit-ink">
                {formatOpeningPackageLabel(selections.openingPackageId)}
              </span>{" "}
              <span className="rounded-md bg-cockpit-subtle px-1.5 py-0.5 font-mono text-[10px] font-semibold text-cockpit-meta">
                {selections.openingPackageId}
              </span>{" "}
              · <span className="font-semibold text-cockpit-ink">
                {OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId}
              </span>{" "}
              occupancy ·{" "}
              <span className="font-semibold text-cockpit-ink">
                {TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId}
              </span>{" "}
              tuition ·{" "}
              <span className="font-semibold text-cockpit-ink">
                {ORG_DESIGN_OPTION_LABELS[selections.orgDesignOptionId] ?? selections.orgDesignOptionId}
              </span>{" "}
              org design
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-1.5 md:justify-end">
          <Badge variant="default">DRE operating layer</Badge>
          <Badge variant="default">v8 PnL/DRE source</Badge>
          <Badge variant="default">Service Contracts as DRE cost lines</Badge>
          <Badge variant="default">CAPEX in Capital Decision</Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4 sm:grid-cols-3 lg:grid-cols-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            Analysis year
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-cockpit-ink">{year}</div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            EBITDA ({year})
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-cockpit-teal">
            {formatBRL(yearResult.ebitda)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            EBITDA Margin ({year})
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-cockpit-teal">
            {formatPercent(yearResult.percentual_ebitda)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            EBITDA-Positive Year
          </div>
          <div className="mt-1 text-base font-bold tabular-nums text-cockpit-ink">
            {ebitdaPositiveYear ?? "Not within horizon"}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            Operating read
          </div>
          <div className="mt-1 text-xs leading-relaxed text-cockpit-slate">
            DRE EBITDA only; not cash-flow/payback.
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Simulation available</div>
            <div className="text-[11px] text-emerald-800">Engine ready · calculation runs</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">Source confirmation pending</div>
            <div className="text-[11px] text-amber-800">
              Finance sources: {DRE_GOVERNANCE_READINESS.openItems.length} open assumption items
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Board ratification pending</div>
            <div className="text-[11px] text-slate-600">Not yet board-ratified</div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-cockpit-meta">
        Simulation runs regardless of Finance-source confirmation or board ratification status.
        Open assumption items are provenance gaps, not calculation blockers.
      </p>
    </div>
  );
}
