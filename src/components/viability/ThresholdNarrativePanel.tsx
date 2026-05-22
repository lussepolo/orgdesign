import { FileText } from "lucide-react";
import { Card } from "../common/Card";

interface ThresholdNarrativePanelProps {
  narrative: string[];
}

export default function ThresholdNarrativePanel({
  narrative,
}: ThresholdNarrativePanelProps) {
  return (
    <Card
      title="Threshold Narrative"
      subtitle="Interpretive notes for the threshold view"
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
