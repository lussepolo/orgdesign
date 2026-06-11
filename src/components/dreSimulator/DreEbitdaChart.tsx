import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card } from "../common/Card";
import { formatBRL } from "../../lib/utils";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";

interface DreEbitdaChartProps {
  dreOutput: DreEngineOutput;
}

// Phase 14B-UI-VISUAL-FIXES: added a callout describing the EBITDA-positive
// year and a low-risk Recharts ReferenceLine marker at that year. Both are
// derived from dreOutput.byYear (already-computed engine output) — no new
// calculations, no chart-library upgrade.
export default function DreEbitdaChart({ dreOutput }: DreEbitdaChartProps) {
  const series = RECEITA_PROJECTION_YEARS.map((year) => ({
    year,
    ebitda: dreOutput.byYear[year].ebitda,
  }));

  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((year) => dreOutput.byYear[year].ebitda > 0);

  return (
    <Card
      title="EBITDA Operating Trajectory"
      icon={TrendingUp}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        Shows DRE EBITDA across the projection period. This is not cash flow and does not include CAPEX.
      </p>

      <div className="mb-4 rounded-2xl border border-cockpit-amber-border bg-cockpit-amber-fill p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
          EBITDA-Positive Year
        </div>
        <div className="mt-1 text-sm font-bold text-cockpit-ink">
          {ebitdaPositiveYear
            ? `EBITDA turns positive in ${ebitdaPositiveYear}`
            : "Not reached within the projection horizon (2028–2047)"}
        </div>
        <div className="mt-1 text-xs text-cockpit-meta">DRE EBITDA &gt; 0; not investment payback.</div>
      </div>

      <div
        className="overflow-hidden rounded-[20px] border border-cockpit-border bg-cockpit-panel p-4 md:p-5 xl:p-6"
        style={{ contain: "layout paint" }}
      >
        <div className="h-[260px] md:h-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="dreEbitdaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#7a8699", fontSize: 11 }} />
              <YAxis
                tick={{ fill: "#7a8699", fontSize: 11 }}
                tickFormatter={(value) => `${Math.round(value / 1000000)}M`}
              />
              <Tooltip
                formatter={(value: number) => formatBRL(value)}
                contentStyle={{ borderRadius: 16, borderColor: "#e3e0d8" }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              {ebitdaPositiveYear !== undefined && (
                <ReferenceLine
                  x={ebitdaPositiveYear}
                  stroke="#b7791f"
                  strokeDasharray="4 4"
                  label={{ value: "EBITDA > 0", position: "insideTopLeft", fill: "#b7791f", fontSize: 11 }}
                />
              )}
              <Area type="monotone" dataKey="ebitda" name="EBITDA" stroke="#0f766e" fill="url(#dreEbitdaFill)" strokeWidth={2.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
