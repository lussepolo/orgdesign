import { Scale } from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { formatBRL } from "../../lib/utils";
import type { OrgDesignSensitivityRow } from "../../hooks/useDreScenarioSimulator";
import { ORG_DESIGN_OPTION_LABELS } from "./dreLeverLabels";
import { useLocale } from "../../i18n/useLocale";

interface OrgDesignSensitivityPanelProps {
  rows: readonly OrgDesignSensitivityRow[];
}

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

export default function OrgDesignSensitivityPanel({ rows }: OrgDesignSensitivityPanelProps) {
  const { t } = useLocale();
  return (
    <Card
      title={t("orgDesignSensitivityTitle")}
      icon={Scale}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-3 text-sm leading-relaxed text-cockpit-meta">
        {t("orgDesignSensitivityIntro")}
      </p>
      <div className="mb-4 rounded-2xl border border-cockpit-amber-border bg-cockpit-amber-fill p-4">
        <p className="text-sm leading-relaxed text-cockpit-slate">
          {t("orgDesignSensitivityCaution")}
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cockpit-border-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cockpit-border-soft bg-cockpit-panel text-[11px] uppercase tracking-[0.1em] text-cockpit-meta">
              <th className="px-3 py-3">{t("orgDesignSensitivityColOption")}</th>
              <th className="px-3 py-3 text-right">{t("orgDesignSensitivityColEbitda")}</th>
              <th className="px-3 py-3 text-right">{t("orgDesignSensitivityColPctEbitda")}</th>
              <th className="px-3 py-3 text-right">{t("orgDesignSensitivityColStatus")}</th>
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
                    <Badge variant="info">{t("orgDesignSensitivitySelectedBadge")}</Badge>
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
