import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Radar } from "lucide-react";
import { Card } from "../common/Card";
import type { ThresholdChartPoint } from "../../lib/viability/types";

interface ThresholdChartProps {
  series: ThresholdChartPoint[];
}

export default function ThresholdChart({ series }: ThresholdChartProps) {
  return (
    <Card
      title="Threshold Curve"
      subtitle="Base case versus threshold path"
      icon={Radar}
      className="h-full"
    >
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }} />
            <Line type="monotone" dataKey="baseCase" stroke="#475569" strokeWidth={2.2} dot={false} />
            <Line type="monotone" dataKey="thresholdCase" stroke="#dc2626" strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Threshold solving is not active yet. This chart reserves analytical space for views such as
        minimum viable tuition, minimum viable enrollment, or maximum viable CAPEX against the base case.
      </p>
    </Card>
  );
}
