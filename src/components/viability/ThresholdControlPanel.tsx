import { SlidersHorizontal } from "lucide-react";
import { Card } from "../common/Card";
import type { ThresholdControl } from "../../lib/viability/types";
import { useLocale } from "../../i18n/useLocale";

interface ThresholdControlPanelProps {
  controls: ThresholdControl[];
}

export default function ThresholdControlPanel({
  controls,
}: ThresholdControlPanelProps) {
  const { t } = useLocale();
  return (
    <Card
      title={t("thresholdControlTitle")}
      subtitle={t("thresholdControlSubtitle")}
      icon={SlidersHorizontal}
    >
      <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {t("thresholdControlIntro")}
        </p>
      </div>
      <div className="space-y-3">
        {controls.map((control) => (
          <div key={control.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {control.label}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">{control.value}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{control.note}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
