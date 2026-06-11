import { useState } from "react";
import { ChevronDown, ChevronUp, Table } from "lucide-react";
import { Card } from "../common/Card";
import { formatBRL } from "../../lib/utils";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";

interface DreAnnualTableProps {
  dreOutput: DreEngineOutput;
}

const formatStudents = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

export default function DreAnnualTable({ dreOutput }: DreAnnualTableProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      title="Detailed annual outputs"
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
              Hide annual DRE detail <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Show annual DRE detail <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      }
    >
      <p className="mb-3 text-sm leading-relaxed text-cockpit-meta">
        Year-by-year DRE outputs (2028–2047) for the selected scenario.
      </p>
      {!expanded ? (
        <p className="text-sm text-cockpit-meta">
          Annual DRE detail is collapsed by default. Use "Show annual DRE detail" to review all 20 years.
        </p>
      ) : (
        <>
      <div className="mb-3 rounded-xl border border-cockpit-border bg-cockpit-panel px-3 py-2 text-[11px] font-semibold text-cockpit-slate sm:hidden">
        Swipe horizontally to review all columns.
      </div>
      <div className="overflow-x-auto rounded-2xl border border-cockpit-border-soft">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-cockpit-border-soft bg-cockpit-panel text-[11px] uppercase tracking-[0.1em] text-cockpit-meta">
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3 text-right">Número de Alunos</th>
              <th className="px-3 py-3 text-right">Receitas com Ensino Regular</th>
              <th className="px-3 py-3 text-right">Receita Operacional Líquida</th>
              <th className="px-3 py-3 text-right">Margem de Contribuição</th>
              <th className="px-3 py-3 text-right">EBITDA</th>
              <th className="px-3 py-3 text-right">% EBITDA</th>
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
