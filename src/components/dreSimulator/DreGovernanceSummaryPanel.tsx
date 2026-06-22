// Phase 15O — Compact governance summary with collapsible methodology layer.
//
// Always-visible: simulation availability and pending closure indicators.
// Collapsible: full F-code provenance list (details layer, collapsed by default).

import { useState } from "react";
import { Info, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../common/Card";
import { DRE_GOVERNANCE_READINESS } from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";

const F_CODE_MAP: Record<string, string> = {
  outras_receitas_reajuste: "F01",
  tuition_source_provenance: "F03",
  discount_schedule_provenance: "F04",
  enrollment_baseline_parity: "F05",
  instructional_capacity_payroll_sync: "F06",
};

const F_DESCRIPTIONS: Record<string, string> = {
  outras_receitas_reajuste: "Outras Receitas C9 source/index pending",
  tuition_source_provenance: "Tuition signed XLSX pending",
  discount_schedule_provenance: "Discount schedule signed reference pending",
  enrollment_baseline_parity: "228 vs 246 scenario mapping pending",
  instructional_capacity_payroll_sync: "Payroll/capacity reconciliation ownership pending",
};

const STATUS_LABELS: Record<string, string> = {
  provisional_source: "Provisional source",
  reconciliation_required: "Reconciliation required",
  pending_finance_confirmation: "Pending confirmation",
};

export default function DreGovernanceSummaryPanel() {
  const [showDetails, setShowDetails] = useState(false);
  const openItems = DRE_GOVERNANCE_READINESS.openItems;

  return (
    <div data-testid="dre-governance-summary">
      <Card
        title="Governance Status"
        subtitle="Source-closure and ratification summary"
        icon={Info}
      >
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            <span className="text-sm text-slate-700">Simulation available.</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="text-sm text-slate-600">Finance-source closure pending.</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="text-sm text-slate-600">Board ratification pending.</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {openItems.length} non-blocking source-governance items remain pending before board
          ratification. These items do not block scenario calculation.
        </p>

        <button
          type="button"
          onClick={() => setShowDetails((p) => !p)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          {showDetails ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Methodology &amp; Source Status
        </button>

        {showDetails && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 mb-3">
              The items below are assumption provenance and reconciliation gaps. They do not block
              scenario calculation. These items must be resolved before board ratification is valid.
            </p>

            {openItems.map((item) => {
              const fCode = F_CODE_MAP[item.key] ?? item.key;
              const description = F_DESCRIPTIONS[item.key] ?? item.label;
              const statusLabel = STATUS_LABELS[item.status] ?? item.status;
              return (
                <div
                  key={item.key}
                  className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
                >
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                        {fCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{description}</span>
                      <span className="text-[10px] text-amber-600 font-medium">{statusLabel}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Owner: {item.requiredOwner} · Simulation continues regardless
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                    F02
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Descontos Método de Assinatura — formula base relationship
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    resolved_engineering
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Resolved Phase 15I.2C · Engine corrected to use receitas_com_ensino_regular as base
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
