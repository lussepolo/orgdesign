import { useState } from "react";
import { ChevronDown, ChevronUp, Table } from "lucide-react";
import { Card } from "../common/Card";
import { formatBRL } from "../../lib/utils";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";
import { useLocale } from "../../i18n/useLocale";
import { formatNumber, formatPercent as formatPercentLocale } from "../../i18n/formatters";

interface DreAnnualTableProps {
  dreOutput: DreEngineOutput;
}

export default function DreAnnualTable({ dreOutput }: DreAnnualTableProps) {
  const { t, locale } = useLocale();
  const [expanded, setExpanded] = useState(false);

  const formatStudents = (value: number) => formatNumber(value, locale, 0);
  const formatPercent = (value: number | null) =>
    value === null ? "—" : formatPercentLocale(value, locale, 1);

  return (
    <Card
      title={t("dreAnnualTableTitle")}
      icon={Table}
      className="overflow-hidden border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
      actions={
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-cockpit-border bg-cockpit-panel px-3 py-1.5 text-xs font-bold text-cockpit-slate transition hover:bg-cockpit-subtle"
        >
          {expanded ? (
            <>
              {t("dreAnnualTableHideDetail")} <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              {t("dreAnnualTableShowDetail")} <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      }
    >
      <p className="mb-3 text-sm leading-relaxed text-cockpit-meta">
        {t("dreAnnualTableIntro")}
      </p>
      {!expanded ? (
        <p className="text-sm text-cockpit-meta">
          {t("dreAnnualTableCollapsedNote").replace("{showLabel}", t("dreAnnualTableShowDetail"))}
        </p>
      ) : (
        <>
      <div className="mb-3 rounded-xl border border-cockpit-border bg-cockpit-panel px-3 py-2 text-[11px] font-semibold text-cockpit-slate sm:hidden">
        {t("dreAnnualTableSwipeHint")}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cockpit-border-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cockpit-border-soft bg-cockpit-panel text-[11px] uppercase tracking-[0.1em] text-cockpit-meta">
              <th className="px-3 py-3">{t("dreAnnualTableColYear")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColStudents")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColRevenue")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColNetRevenue")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColContributionMargin")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColEbitda")}</th>
              <th className="px-3 py-3 text-right">{t("dreAnnualTableColPctEbitda")}</th>
            </tr>
          </thead>
          <tbody>
            {RECEITA_PROJECTION_YEARS.map((year, index) => {
              const row = dreOutput.byYear[year];
              return (
                <tr
                  key={year}
                  className={`border-b border-cockpit-row-border text-sm text-cockpit-slate last:border-b-0 ${
                    index % 2 === 0 ? "bg-cockpit-card" : "bg-cockpit-panel"
                  }`}
                >
                  <td className="px-3 py-3 font-bold text-cockpit-ink">{year}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatStudents(row.numero_de_alunos)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatBRL(row.receitas_com_ensino_regular)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatBRL(row.receita_operacional_liquida)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatBRL(row.margem_de_contribuicao)}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-cockpit-teal">
                    {formatBRL(row.ebitda)}
                  </td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-cockpit-ink">
                    {formatPercent(row.percentual_ebitda)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
        </>
      )}
    </Card>
  );
}
