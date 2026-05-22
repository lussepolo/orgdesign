import { Badge } from "../common/Badge";
import { Card } from "../common/Card";
import type { ViabilityKpi } from "../../lib/viability/types";
import { formatKpiValue } from "../../lib/viability/formatters";
import { cn } from "../../lib/utils";

const TONE_MAP = {
  default: "border-slate-200",
  success: "border-emerald-200",
  warning: "border-amber-200",
  danger: "border-rose-200",
  info: "border-blue-200",
} as const;

const BADGE_MAP = {
  default: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
} as const;

const STATUS_LABELS = {
  default: "Review",
  success: "On Track",
  warning: "Watch",
  danger: "At Risk",
  info: "Context",
} as const;

interface ViabilityKpiRowProps {
  kpis: ViabilityKpi[];
}

export default function ViabilityKpiRow({ kpis }: ViabilityKpiRowProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Decision Summary
          </div>
          <h4 className="text-lg font-bold text-slate-900">
            Headline metrics for the active board case
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            These metrics summarize the current case before moving into sensitivity review or threshold questions.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className={cn("h-full", TONE_MAP[kpi.tone])}>
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {kpi.label}
                </div>
                <Badge variant={BADGE_MAP[kpi.tone]}>{STATUS_LABELS[kpi.tone]}</Badge>
              </div>
              <div className="text-2xl font-bold leading-tight text-slate-900 break-words md:text-3xl">
                {formatKpiValue(kpi)}
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{kpi.detail}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
