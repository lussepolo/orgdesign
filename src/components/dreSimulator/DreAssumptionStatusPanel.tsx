// Phase 15J — Assumption-status panel.
//
// Legacy standalone panel retained for source review. Reads the current active
// governance model so retired/historical records cannot leak into active warnings.

import { Info, CheckCircle2, Clock } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  DRE_HISTORICAL_GOVERNANCE_ITEMS,
} from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";

const STATUS_LABELS: Record<string, string> = {
  active_governance_item: "Active governance",
  finance_approval_pending: "Finance approval pending",
  reconciliation_required: "Reconciliation required",
  capability_unavailable: "Capability unavailable",
  resolved_historical: "Resolved historical",
  retired_historical: "Retired historical",
};

export default function DreAssumptionStatusPanel() {
  const openItems = DRE_ACTIVE_GOVERNANCE_ITEMS;

  return (
    <Card
      title="Assumption Status"
      subtitle="Provenance metadata — does not block simulation"
      icon={Info}
    >
      <p className="mb-4 text-sm leading-relaxed text-slate-600">
        The items below are assumption provenance and reconciliation gaps. They do not block scenario
        calculation. Simulation is available regardless of this status. These items must be resolved
        before board ratification is valid.
      </p>

      <div className="space-y-2">
        {openItems.map((item) => {
          const statusLabel = STATUS_LABELS[item.displayStatus] ?? item.displayStatus;
          return (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5"
            >
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                    {item.internalIds.join(" / ")}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  <span className="text-[10px] text-amber-600 font-medium">{statusLabel}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Owner: {item.requiredOwner} · Simulation continues regardless
                </p>
              </div>
            </div>
          );
        })}

        {DRE_HISTORICAL_GOVERNANCE_ITEMS.map((item) => (
          <div key={item.key} className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                  {item.internalIds.join(" / ")}
                </span>
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {STATUS_LABELS[item.displayStatus] ?? item.displayStatus}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{item.currentEngineBehavior}</p>
            </div>
          </div>
        ))}
      </div>

    </Card>
  );
}
