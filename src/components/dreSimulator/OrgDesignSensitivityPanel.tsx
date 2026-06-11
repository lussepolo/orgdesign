import { Scale } from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { formatBRL } from "../../lib/utils";
import type { OrgDesignSensitivityRow } from "../../hooks/useDreScenarioSimulator";
import { ORG_DESIGN_OPTION_LABELS } from "./dreLeverLabels";

interface OrgDesignSensitivityPanelProps {
  rows: readonly OrgDesignSensitivityRow[];
}

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

export default function OrgDesignSensitivityPanel({ rows }: OrgDesignSensitivityPanelProps) {
  return (
    <Card
      title="Org Design Sensitivity"
      icon={Scale}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-3 text-sm leading-relaxed text-cockpit-meta">
        2047 EBITDA by org-design option, holding the opening, occupancy, and tuition levers fixed at the
        current selection.
      </p>
      <div className="mb-4 rounded-2xl border border-cockpit-amber-border bg-cockpit-amber-fill p-4">
        <p className="text-sm leading-relaxed text-cockpit-slate">
          EBITDA impact only. This is not an educational-quality ranking. A higher EBITDA reflects a
          lower operating cost impact for this scenario — not automatically a better operating model.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cockpit-border-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cockpit-border-soft bg-cockpit-panel text-[11px] uppercase tracking-[0.1em] text-cockpit-meta">
              <th className="px-3 py-3">Org Design Option</th>
              <th className="px-3 py-3 text-right">EBITDA (2047)</th>
              <th className="px-3 py-3 text-right">% EBITDA (2047)</th>
              <th className="px-3 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.orgDesignOptionId}
                className={`border-b border-cockpit-row-border text-sm text-cockpit-slate last:border-b-0 ${
                  row.isSelected ? "bg-cockpit-teal-fill" : index % 2 === 0 ? "bg-cockpit-card" : "bg-cockpit-panel"
                }`}
              >
                <td className="px-3 py-3 font-bold text-cockpit-ink">
                  {ORG_DESIGN_OPTION_LABELS[row.orgDesignOptionId] ?? row.orgDesignOptionId}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-cockpit-ink">
                  {formatBRL(row.ebitda2047)}
                </td>
                <td className="px-3 py-3 text-right font-bold tabular-nums text-cockpit-ink">
                  {formatPercent(row.percentualEbitda2047)}
                </td>
                <td className="px-3 py-3 text-right">
                  {row.isSelected ? (
                    <Badge variant="info">Selected</Badge>
                  ) : (
                    <span className="text-xs text-cockpit-meta">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
