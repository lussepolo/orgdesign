import { FileText } from "lucide-react";
import { Card } from "../common/Card";
import { useLocale } from "../../i18n/useLocale";

interface ThresholdNarrativePanelProps {
  narrative: string[];
}

export default function ThresholdNarrativePanel({
  narrative,
}: ThresholdNarrativePanelProps) {
  const { t } = useLocale();
  return (
    <Card
      title={t("thresholdNarrativeTitle")}
      subtitle={t("thresholdNarrativeSubtitle")}
      icon={FileText}
      className="h-full"
    >
      <div className="space-y-3">
        {narrative.map((line) => (
          <p key={line} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
            {line}
          </p>
        ))}
      </div>
    </Card>
  );
}
