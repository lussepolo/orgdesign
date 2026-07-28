import { LayoutGrid } from "lucide-react";
import { Card } from "../common/Card";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL, formatNumber, formatPercent as formatPercentLocale } from "../../i18n/formatters";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";

interface DreSummaryCardsProps {
  dreOutput: DreEngineOutput;
  year: OpeningPackageProjectionYear;
  onYearChange: (year: OpeningPackageProjectionYear) => void;
}

// Phase 14B-UI-VISUAL-FIXES: reorganized into a primary headline row (EBITDA
// and EBITDA Margin emphasized) and a secondary supporting row. All values
// continue to come straight from dreOutput.byYear[year] — no new
// calculations.
export default function DreSummaryCards({ dreOutput, year, onYearChange }: DreSummaryCardsProps) {
  const { t, locale } = useLocale();
  const result = dreOutput.byYear[year];
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find((y) => dreOutput.byYear[y].ebitda > 0);

  const primaryCards = [
    { label: t("dreSummaryLearnersLabel"), value: formatNumber(result.numero_de_alunos, locale), emphasis: false },
    { label: t("dreSummaryReceitaLabel"), value: formatCurrencyBRL(result.receita_operacional_liquida, locale), emphasis: false },
    { label: t("dreSummaryEbitdaLabel"), value: formatCurrencyBRL(result.ebitda, locale), emphasis: true },
    { label: t("dreSummaryEbitdaMarginLabel"), value: result.percentual_ebitda === null ? "—" : formatPercentLocale(result.percentual_ebitda, locale), emphasis: true },
  ];

  const secondaryCards = [
    { label: t("dreSummaryMargemContribuicaoLabel"), value: formatCurrencyBRL(result.margem_de_contribuicao, locale) },
    {
      label: t("dreSummaryEbitdaPositiveYearLabel"),
      value: ebitdaPositiveYear ? String(ebitdaPositiveYear) : t("dreSummaryNotWithinHorizon"),
    },
    {
      label: t("dreSummarySelectedYearLabel"),
      value: String(year),
    },
  ];

  return (
    <Card
      title={t("dreSummaryCardTitle")}
      icon={LayoutGrid}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
      actions={
        <label className="flex items-center gap-2 text-xs font-semibold text-cockpit-slate">
          {t("dreSummaryYearLabel")}
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
        {t("dreSummaryCardIntro")}
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
