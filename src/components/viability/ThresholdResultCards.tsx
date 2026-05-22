import { Card } from "../common/Card";
import type { ThresholdResultCard } from "../../lib/viability/types";
import { formatBRL } from "../../lib/utils";
import { formatPercent, formatYears } from "../../lib/viability/formatters";

interface ThresholdResultCardsProps {
  cards: ThresholdResultCard[];
}

function formatValue(card: ThresholdResultCard): string {
  if (card.format === "currency") return formatBRL(card.value);
  if (card.format === "percent") return formatPercent(card.value);
  return formatYears(card.value);
}

export default function ThresholdResultCards({
  cards,
}: ThresholdResultCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Threshold Outputs
        </div>
        <h4 className="text-lg font-bold text-slate-900">
          Decision markers for the selected threshold question
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id}>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {card.label}
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{formatValue(card)}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{card.detail}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
