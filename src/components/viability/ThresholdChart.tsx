import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Radar } from "lucide-react";
import { Card } from "../common/Card";
import type { ThresholdChartPoint } from "../../lib/viability/types";
import { useLocale } from "../../i18n/useLocale";

interface ThresholdChartProps {
  series: ThresholdChartPoint[];
}

export default function ThresholdChart({ series }: ThresholdChartProps) {
  const { t } = useLocale();
  return (
    <Card
      title={t("thresholdChartTitle")}
      subtitle={t("thresholdChartSubtitle")}
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
        {t("thresholdChartFooterNote")}
      </p>
    </Card>
  );
}
