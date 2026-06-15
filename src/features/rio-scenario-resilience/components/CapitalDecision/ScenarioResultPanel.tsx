// Phase 15F — Selected scenario result panel (page section B).
//
// Renders, in order: (1) calculation readiness, (2-5) TIR vs reference WACC
// / TIR / WACC / spread via InvestmentReferencePanel, (6) VPL, (7) discounted
// payback, (8) interpretation notes, (9) methodology disclosure. No simple
// payback is shown. Blocked-upstream scenarios suppress the financial
// conclusion (6-7) entirely.

import { Badge, Card } from "../../../../components/common";
import type { SavedScenario } from "./capitalDecisionUiTypes";
import { FinancialMetricCard } from "./FinancialMetricCard";
import { InvestmentReferencePanel } from "./InvestmentReferencePanel";
import { InterpretationNotes } from "./InterpretationNotes";
import { MethodologyDisclosure } from "./MethodologyDisclosure";
import {
  formatDiscountedPayback,
  formatVpl,
  getCalculationReadinessText,
  getNpvSignText,
  isBlockedUpstream,
} from "./capitalDecisionViewModel";

export interface ScenarioResultPanelProps {
  readonly scenario: SavedScenario;
}

export function ScenarioResultPanel({ scenario }: ScenarioResultPanelProps) {
  const { result } = scenario;
  const blocked = isBlockedUpstream(result);
  const readinessText = getCalculationReadinessText(result);
  const vpl = formatVpl(result.npvBRL, result.npvSign);
  const payback = formatDiscountedPayback(result);

  return (
    <section
      className="space-y-6"
      aria-live="polite"
      aria-label={`Result for ${scenario.name}`}
    >
      {/* 1. Calculation readiness */}
      <Card
        title="Calculation readiness"
        subtitle={scenario.name}
        actions={
          <Badge variant={result.calculationStatus === "calculated" ? "success" : "danger"}>
            {result.calculationStatus === "calculated" ? "Calculated" : "Blocked"}
          </Badge>
        }
      >
        <p className="text-sm leading-6 text-slate-700">{readinessText}</p>
      </Card>

      {blocked ? (
        <Card>
          <p className="text-sm leading-6 text-slate-700">{result.calculationStatusReason}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Investment-reference and financial-output values are unavailable while this
            scenario's calculation is blocked upstream.
          </p>
        </Card>
      ) : (
        <>
          {/* 2-5. TIR vs WACC, TIR, WACC, spread */}
          <InvestmentReferencePanel result={result} />

          {/* 6-7. VPL, discounted payback */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FinancialMetricCard
              label="VPL"
              value={vpl.compact}
              detail={vpl.detailed !== vpl.compact ? vpl.detailed : undefined}
              statusText={getNpvSignText(result.npvSign)}
              unavailable={result.npvSign === "unavailable"}
              ariaLabel={vpl.ariaLabel}
            />
            <FinancialMetricCard
              label="Discounted payback"
              value={payback.value}
              detail={payback.detail ?? undefined}
              unavailable={
                result.discountedPaybackStatus === "blocked_missing_phase15c_inputs" ||
                result.discountedPaybackStatus === "invalid_cash_flow_series"
              }
            />
          </div>
        </>
      )}

      {/* 8. Interpretation notes */}
      <InterpretationNotes notes={result.interpretationNotes} />

      {/* 9. Methodology and assumptions disclosure */}
      <MethodologyDisclosure result={result} />
    </section>
  );
}

export default ScenarioResultPanel;
