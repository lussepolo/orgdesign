// Phase 15F — neutral financial metric card.
//
// Replacement for ScenarioTierCard.tsx (not used: name conflicts with the
// no-Tier policy) and the duplicate VplOutputCard / PaybackOutputCard /
// DiscountedPaybackOutputCard shells. Purely prop-driven; no Tier, score,
// ranking, or recommendation semantics.

import { Badge, Card } from "../../../../components/common";

export interface FinancialMetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly statusText?: string;
  readonly detail?: string;
  readonly unavailable?: boolean;
  readonly ariaLabel?: string;
}

export function FinancialMetricCard({
  label,
  value,
  statusText,
  detail,
  unavailable = false,
  ariaLabel,
}: FinancialMetricCardProps) {
  return (
    <Card
      className="h-full"
      title={label}
      actions={unavailable ? <Badge variant="default">Não disponível</Badge> : undefined}
    >
      <div className="space-y-2">
        <p
          className="text-2xl font-semibold text-slate-900"
          aria-label={ariaLabel ?? `${label}: ${value}`}
        >
          {value}
        </p>
        {statusText && (
          <p className="text-sm leading-6 text-slate-600">{statusText}</p>
        )}
        {detail && (
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer select-none font-medium text-slate-500 hover:text-slate-700">
              Detalhe
            </summary>
            <p className="mt-1 leading-5">{detail}</p>
          </details>
        )}
      </div>
    </Card>
  );
}

export default FinancialMetricCard;
