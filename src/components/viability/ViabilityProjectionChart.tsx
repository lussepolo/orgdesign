import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card } from "../common/Card";
import type { ViabilityProjectionPoint } from "../../lib/viability/types";
import { cn, formatBRL } from "../../lib/utils";

interface ViabilityProjectionChartProps {
  series: ViabilityProjectionPoint[];
  actions?: React.ReactNode;
  className?: string;
  collapsed?: boolean;
}

export default function ViabilityProjectionChart({
  series,
  actions,
  className,
  collapsed = false,
}: ViabilityProjectionChartProps) {
  const firstPoint = series[0];
  const lastPoint = series.at(-1);

  return (
    <Card
      title="Lifetime Operating Profile"
      subtitle="Revenue and cash generation profile for the active planning case"
      icon={TrendingUp}
      actions={actions}
      className={cn(className)}
    >
      {collapsed ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-relaxed text-slate-600">
              Profile collapsed. Expand when you want the full chart back in view, or pin it to keep
              the operating profile nearby while reviewing the annual table.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Opening Year Revenue
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {firstPoint ? formatBRL(firstPoint.revenueAnnual) : "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Ending Year Revenue
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {lastPoint ? formatBRL(lastPoint.revenueAnnual) : "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Ending Year Free Cash Flow
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                {lastPoint ? formatBRL(lastPoint.freeCashFlowAnnual) : "—"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm leading-relaxed text-slate-600">
              Revenue and free cash flow are shown together so the operating ramp and the resulting
              cash generation stay readable as one bounded review surface.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 md:p-5 xl:p-6"
            style={{ contain: "layout paint" }}
          >
            <div className="h-[280px] md:h-[340px] xl:h-[380px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                    </linearGradient>
                    <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                  <Tooltip
                    formatter={(value: number) => formatBRL(value)}
                    contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
                  />
                  <Area type="monotone" dataKey="revenueAnnual" name="Revenue" stroke="#0f766e" fill="url(#revenueFill)" strokeWidth={2.2} />
                  <Area type="monotone" dataKey="freeCashFlowAnnual" name="Free Cash Flow" stroke="#1d4ed8" fill="url(#cashFlowFill)" strokeWidth={2.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            This view combines the live operating path with the active opex, CAPEX, and discounting
            assumptions to show the financial profile across the planning horizon.
          </p>
        </div>
      )}
    </Card>
  );
}
