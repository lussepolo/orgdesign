import { LayoutGrid } from "lucide-react";
import { Card } from "../common/Card";
import { formatBRL } from "../../lib/utils";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";

interface DreSummaryCardsProps {
  dreOutput: DreEngineOutput;
  year: OpeningPackageProjectionYear;
  onYearChange: (year: OpeningPackageProjectionYear) => void;
}

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

const formatStudents = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

// Phase 14B-UI-VISUAL-FIXES: reorganized into a primary headline row (EBITDA
// and EBITDA Margin emphasized) and a secondary supporting row. All values
// continue to come straight from dreOutput.byYear[year] — no new
// calculations.
export default function DreSummaryCards({ dreOutput, year, onYearChange }: DreSummaryCardsProps) {
  const result = dreOutput.byYear[year];
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((y) => dreOutput.byYear[y].ebitda > 0);

  const primaryCards = [
    { label: "Learners (Número de Alunos)", value: formatStudents(result.numero_de_alunos), emphasis: false },
    { label: "Receita Operacional Líquida", value: formatBRL(result.receita_operacional_liquida), emphasis: false },
    { label: "EBITDA", value: formatBRL(result.ebitda), emphasis: true },
    { label: "EBITDA Margin", value: formatPercent(result.percentual_ebitda), emphasis: true },
  ];

  const secondaryCards = [
    { label: "Margem de Contribuição", value: formatBRL(result.margem_de_contribuicao) },
    {
      label: "EBITDA-Positive Year (DRE EBITDA > 0)",
      value: ebitdaPositiveYear ? String(ebitdaPositiveYear) : "Not within horizon",
    },
    {
      label: "Selected analysis year",
      value: String(year),
    },
  ];

  return (
    <Card
      title="DRE Summary"
      icon={LayoutGrid}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
      actions={
        <label className="flex items-center gap-2 text-xs font-semibold text-cockpit-slate">
          Year
          <select
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value) as OpeningPackageProjectionYear)}
            className="rounded-xl border border-cockpit-border bg-cockpit-panel px-2 py-1 text-sm font-medium text-cockpit-ink outline-none transition focus:border-cockpit-teal-muted"
          >
            {RECEITA_PROJECTION_YEARS.map((projectionYear) => (
              <option key={projectionYear} value={projectionYear}>
                {projectionYear}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        Headline DRE outputs for the selected scenario and year.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primaryCards.map((card) => (
          <div
            key={card.label}
            className={
              card.emphasis
                ? "rounded-2xl border border-cockpit-positive-border bg-cockpit-teal-fill p-4"
                : "rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4"
            }
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
              {card.label}
            </div>
            <div
              className={
                card.emphasis
                  ? "mt-2 text-2xl font-bold leading-tight text-cockpit-teal break-words tabular-nums md:text-3xl"
                  : "mt-2 text-xl font-bold leading-tight text-cockpit-ink break-words tabular-nums md:text-2xl"
              }
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {secondaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
              {card.label}
            </div>
            <div className="mt-2 text-lg font-bold leading-tight text-cockpit-ink break-words tabular-nums md:text-xl">
              {card.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
