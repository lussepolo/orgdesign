import { BarChart3 } from "lucide-react";
import { Card } from "../common/Card";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL, formatNumber, formatPercent } from "../../i18n/formatters";
import type { DreEngineOutput, DreYearResult } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";

interface DreIncomeStatementDashboardProps {
  readonly dreOutput: DreEngineOutput;
  readonly year: OpeningPackageProjectionYear;
  readonly onYearChange: (year: OpeningPackageProjectionYear) => void;
}

type LocaleCopy = {
  title: string;
  subtitle: string;
  year: string;
  scopeNote: string;
  kpis: {
    tuitionRevenue: string;
    averageDiscount: string;
    netRevenue: string;
    contributionMargin: string;
    ebitda: string;
    ebitdaMargin: string;
    learners: string;
    sections: string;
  };
  statementTitle: string;
  line: string;
  amount: string;
  pctBasis: string;
  chartsTitle: string;
  funnelTitle: string;
  discountNote: string;
  mixTitle: string;
  trendTitle: string;
  marginLabel: string;
  deductionLabel: string;
};

const COPY: Record<"pt-BR" | "en-US", LocaleCopy> = {
  "pt-BR": {
    title: "Dashboard DRE Operacional",
    subtitle: "Demonstração de resultado por cenário, até EBITDA",
    year: "Ano",
    scopeNote:
      "A visão abaixo usa as linhas calculadas do motor DRE. Receita de mensalidades varia conforme o cenário de mensalidade selecionado. Lucro líquido e linhas abaixo do EBITDA não estão no resultado runtime atual.",
    kpis: {
      tuitionRevenue: "Receita de mensalidades",
      averageDiscount: "% desconto médio",
      netRevenue: "Receita operacional líquida",
      contributionMargin: "Margem de contribuição",
      ebitda: "EBITDA",
      ebitdaMargin: "Margem EBITDA",
      learners: "Alunos",
      sections: "Turmas",
    },
    statementTitle: "DRE do ano selecionado",
    line: "Linha da DRE",
    amount: "Valor",
    pctBasis: "% base",
    chartsTitle: "Análise visual",
    funnelTitle: "Funil da DRE",
    discountNote: "Desconto médio calculado sobre receita de mensalidades, não sobre ROL.",
    mixTitle: "Composição de custos e despesas",
    trendTitle: "Margens no horizonte",
    marginLabel: "Margem",
    deductionLabel: "Impactos até EBITDA",
  },
  "en-US": {
    title: "Operating P&L Dashboard",
    subtitle: "Scenario income statement through EBITDA",
    year: "Year",
    scopeNote:
      "The view below uses calculated DRE engine rows. Tuition revenue varies with the selected tuition scenario. Net profit and below-EBITDA lines are not present in the current runtime result.",
    kpis: {
      tuitionRevenue: "Tuition revenue",
      averageDiscount: "Average discount",
      netRevenue: "Net operating revenue",
      contributionMargin: "Contribution margin",
      ebitda: "EBITDA",
      ebitdaMargin: "EBITDA margin",
      learners: "Learners",
      sections: "Sections",
    },
    statementTitle: "Selected-year income statement",
    line: "P&L line",
    amount: "Amount",
    pctBasis: "% basis",
    chartsTitle: "Visual analysis",
    funnelTitle: "P&L funnel",
    discountNote: "Average discount is calculated over tuition revenue, not over net operating revenue.",
    mixTitle: "Cost and expense composition",
    trendTitle: "Margin horizon",
    marginLabel: "Margin",
    deductionLabel: "Impacts through EBITDA",
  },
};

type StatementRow = {
  label: string;
  value: number | null;
  kind: "section" | "subtotal" | "line" | "final";
  basis: "tuition" | "rol";
};

const asCost = (value: number) => Math.abs(value);

const maxAbs = (values: readonly number[]) => Math.max(1, ...values.map((value) => Math.abs(value)));

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function linePath(points: readonly { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function statementRows(row: DreYearResult, locale: "pt-BR" | "en-US"): StatementRow[] {
  const isPt = locale === "pt-BR";
  return [
    { label: isPt ? "Receitas com ensino regular" : "Regular tuition revenue", value: row.receitas_com_ensino_regular, kind: "line", basis: "rol" },
    { label: isPt ? "Receitas com upselling" : "Upselling revenue", value: row.receitas_com_upselling, kind: "line", basis: "rol" },
    { label: isPt ? "Receita de ensino bruta" : "Gross education revenue", value: row.receita_de_ensino_bruta, kind: "subtotal", basis: "rol" },
    { label: isPt ? "Bolsas de estudo (% mensalidades)" : "Scholarships (% tuition revenue)", value: row.bolsa_de_estudos, kind: "line", basis: "tuition" },
    { label: isPt ? "Receita de ensino líquida" : "Net education revenue", value: row.receita_de_ensino_liquida, kind: "subtotal", basis: "rol" },
    { label: isPt ? "Descontos Método de Assinatura (% mensalidades)" : "Metodo subscription discounts (% tuition revenue)", value: row.descontos_metodo_de_assinatura, kind: "line", basis: "tuition" },
    { label: isPt ? "Eventos, material didático e outras receitas" : "Events, learning materials, and other revenue", value: row.receita_com_eventos + row.receita_com_material_didatico + row.outras_receitas, kind: "line", basis: "rol" },
    { label: isPt ? "Receita operacional antes das deduções" : "Operating revenue before deductions", value: row.receita_operacional_antes_das_deducoes, kind: "subtotal", basis: "rol" },
    { label: isPt ? "Deduções" : "Deductions", value: row.deducoes, kind: "line", basis: "rol" },
    { label: isPt ? "Receita operacional líquida" : "Net operating revenue", value: row.receita_operacional_liquida, kind: "subtotal", basis: "rol" },
    { label: isPt ? "Custos diretos" : "Direct costs", value: row.total_custo_direto, kind: "line", basis: "rol" },
    { label: isPt ? "Margem de contribuição" : "Contribution margin", value: row.margem_de_contribuicao, kind: "subtotal", basis: "rol" },
    { label: isPt ? "Folha, benefícios e despesas fixas" : "Payroll, benefits, and fixed expenses", value: row.total_custos_e_despesas_fixas, kind: "line", basis: "rol" },
    { label: isPt ? "Despesas com vendas" : "Selling expenses", value: row.total_despesas_com_vendas, kind: "line", basis: "rol" },
    { label: "EBITDA", value: row.ebitda, kind: "final", basis: "rol" },
  ];
}

export default function DreIncomeStatementDashboard({
  dreOutput,
  year,
  onYearChange,
}: DreIncomeStatementDashboardProps) {
  const { locale } = useLocale();
  const labels = COPY[locale];
  const row = dreOutput.byYear[year];
  const rol = row.receita_operacional_liquida;
  const tuitionRevenue = row.receitas_com_ensino_regular;
  const marginValue = row.percentual_ebitda === null ? "—" : formatPercent(row.percentual_ebitda, locale);
  const averageDiscount =
    tuitionRevenue === 0 ? "—" : formatPercent(row.bolsa_de_estudos / tuitionRevenue, locale);

  const kpis = [
    { label: labels.kpis.tuitionRevenue, value: formatCurrencyBRL(row.receitas_com_ensino_regular, locale), strong: false },
    { label: labels.kpis.averageDiscount, value: averageDiscount, strong: false },
    { label: labels.kpis.netRevenue, value: formatCurrencyBRL(row.receita_operacional_liquida, locale), strong: true },
    { label: labels.kpis.contributionMargin, value: formatCurrencyBRL(row.margem_de_contribuicao, locale), strong: false },
    { label: labels.kpis.ebitda, value: formatCurrencyBRL(row.ebitda, locale), strong: true },
    { label: labels.kpis.ebitdaMargin, value: marginValue, strong: true },
    { label: labels.kpis.learners, value: formatNumber(row.numero_de_alunos, locale), strong: false },
    { label: labels.kpis.sections, value: formatNumber(row.numero_de_turmas, locale), strong: false },
  ];

  const funnelStages = [
    {
      name: labels.kpis.tuitionRevenue,
      value: row.receitas_com_ensino_regular,
      accent: "bg-cockpit-navy",
      tone: "text-cockpit-ink",
    },
    {
      name: labels.kpis.netRevenue,
      value: row.receita_operacional_liquida,
      accent: "bg-cockpit-indigo",
      tone: "text-cockpit-ink",
    },
    {
      name: labels.kpis.contributionMargin,
      value: row.margem_de_contribuicao,
      accent: "bg-cockpit-teal",
      tone: "text-cockpit-teal",
    },
    {
      name: "EBITDA",
      value: row.ebitda,
      accent: row.ebitda >= 0 ? "bg-cockpit-teal" : "bg-cockpit-risk",
      tone: row.ebitda >= 0 ? "text-cockpit-teal" : "text-cockpit-risk",
    },
  ];
  const maxFunnelValue = maxAbs(funnelStages.map((stage) => stage.value));

  const impactRows = [
    {
      name: locale === "pt-BR" ? "Bolsas de estudo" : "Scholarships",
      value: row.bolsa_de_estudos,
      pct: tuitionRevenue === 0 ? null : row.bolsa_de_estudos / tuitionRevenue,
    },
    {
      name: locale === "pt-BR" ? "Desconto Método + deduções" : "Metodo discount + deductions",
      value: row.descontos_metodo_de_assinatura + row.deducoes,
      pct: rol === 0 ? null : (row.descontos_metodo_de_assinatura + row.deducoes) / rol,
    },
    {
      name: locale === "pt-BR" ? "Custos diretos" : "Direct costs",
      value: row.total_custo_direto,
      pct: rol === 0 ? null : row.total_custo_direto / rol,
    },
    {
      name: locale === "pt-BR" ? "Folha, fixas e vendas" : "Payroll, fixed, and selling",
      value: row.total_custos_e_despesas_fixas + row.total_despesas_com_vendas,
      pct: rol === 0 ? null : (row.total_custos_e_despesas_fixas + row.total_despesas_com_vendas) / rol,
    },
  ];

  const expenseMix = [
    { name: locale === "pt-BR" ? "Custos diretos" : "Direct costs", value: asCost(row.total_custo_direto) },
    { name: locale === "pt-BR" ? "Folha e fixas" : "Payroll and fixed", value: asCost(row.total_custos_e_despesas_fixas) },
    { name: locale === "pt-BR" ? "Vendas" : "Selling", value: asCost(row.total_despesas_com_vendas) },
  ];
  const expenseTotal = expenseMix.reduce((sum, item) => sum + item.value, 0);
  const expenseColors = ["#0f766e", "#4f46e5", "#f59e0b"];
  let expenseAngleCursor = 0;
  const expenseArcs = expenseMix.map((item, index) => {
    const share = expenseTotal === 0 ? 0 : item.value / expenseTotal;
    const start = expenseAngleCursor;
    const end = expenseAngleCursor + share * 360;
    expenseAngleCursor = end;
    return { ...item, share, color: expenseColors[index], path: describeArc(70, 70, 52, start, end) };
  });

  const trendData = RECEITA_PROJECTION_YEARS.map((projectionYear) => ({
    year: projectionYear,
    rol: dreOutput.byYear[projectionYear].receita_operacional_liquida,
    ebitda: dreOutput.byYear[projectionYear].ebitda,
    contributionMargin:
      dreOutput.byYear[projectionYear].receita_operacional_liquida === 0
        ? 0
        : dreOutput.byYear[projectionYear].margem_de_contribuicao /
          dreOutput.byYear[projectionYear].receita_operacional_liquida,
    ebitdaMargin: dreOutput.byYear[projectionYear].percentual_ebitda ?? 0,
  }));
  const allMargins = trendData.flatMap((entry) => [entry.contributionMargin, entry.ebitdaMargin]);
  const minMargin = Math.min(-0.15, ...allMargins);
  const maxMargin = Math.max(0.35, ...allMargins);
  const marginRange = Math.max(0.01, maxMargin - minMargin);
  const contributionPoints = trendData.map((entry, index) => ({
    x: 12 + (index * 256) / Math.max(1, trendData.length - 1),
    y: 118 - ((entry.contributionMargin - minMargin) / marginRange) * 100,
  }));
  const ebitdaPoints = trendData.map((entry, index) => ({
    x: 12 + (index * 256) / Math.max(1, trendData.length - 1),
    y: 118 - ((entry.ebitdaMargin - minMargin) / marginRange) * 100,
  }));

  return (
    <Card
      title={labels.title}
      subtitle={labels.subtitle}
      icon={BarChart3}
      actions={
        <label className="flex items-center gap-2 text-xs font-semibold text-cockpit-slate">
          {labels.year}
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
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={
              kpi.strong
                ? "rounded-xl border border-cockpit-positive-border bg-cockpit-teal-fill p-4"
                : "rounded-xl border border-cockpit-border-soft bg-cockpit-panel p-4"
            }
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">{kpi.label}</div>
            <div className={`mt-2 text-lg font-bold leading-tight tabular-nums ${kpi.strong ? "text-cockpit-teal" : "text-cockpit-ink"}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-sm font-bold text-cockpit-ink">{labels.funnelTitle}</h4>
              <p className="text-xs text-cockpit-meta">{labels.discountNote}</p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">{year}</span>
          </div>

          <div className="space-y-4">
            {funnelStages.map((stage, index) => {
              const width = clamp((Math.abs(stage.value) / maxFunnelValue) * 100, 10, 100);
              const denominator = index === 0 ? tuitionRevenue : rol;
              const margin = denominator === 0 ? null : stage.value / denominator;
              return (
                <div key={stage.name} className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)_170px] sm:items-center">
                  <div className="text-xs font-semibold text-cockpit-slate">{stage.name}</div>
                  <div className="h-9 rounded-r-full bg-white shadow-inner">
                    <div
                      className={`flex h-full items-center justify-end rounded-r-full px-3 text-[10px] font-bold text-white ${stage.accent}`}
                      style={{ width: `${width}%` }}
                    >
                      {margin === null ? "—" : formatPercent(margin, locale)}
                    </div>
                  </div>
                  <div className={`text-right text-sm font-bold tabular-nums ${stage.tone}`}>
                    {formatCurrencyBRL(stage.value, locale)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-cockpit-border-soft bg-white p-3">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">{labels.deductionLabel}</div>
            <div className="grid gap-3 md:grid-cols-2">
              {impactRows.map((item) => {
                const width = item.pct === null ? 0 : clamp(Math.abs(item.pct) * 100, 4, 100);
                return (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs text-cockpit-slate">
                      <span>{item.name}</span>
                      <span className="font-semibold tabular-nums text-cockpit-ink">
                        {formatCurrencyBRL(item.value, locale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cockpit-subtle">
                        <div className="h-full rounded-full bg-cockpit-risk" style={{ width: `${width}%` }} />
                      </div>
                      <span className="w-14 text-right text-[11px] font-semibold tabular-nums text-cockpit-meta">
                        {item.pct === null ? "—" : formatPercent(item.pct, locale)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">{labels.mixTitle}</div>
            <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4">
              <svg viewBox="0 0 140 140" className="h-32 w-32" role="img" aria-label={labels.mixTitle}>
                <circle cx="70" cy="70" r="52" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                {expenseArcs.map((arc) => (
                  arc.share > 0.001 ? (
                    <path
                      key={arc.name}
                      d={arc.path}
                      fill="none"
                      stroke={arc.color}
                      strokeLinecap="round"
                      strokeWidth="18"
                    />
                  ) : null
                ))}
                <text x="70" y="66" textAnchor="middle" className="fill-slate-500 text-[10px] font-semibold">
                  Total
                </text>
                <text x="70" y="82" textAnchor="middle" className="fill-slate-900 text-[13px] font-bold">
                  {formatCurrencyBRL(expenseTotal, locale).replace(/\s/g, "")}
                </text>
              </svg>
              <div className="space-y-2">
                {expenseArcs.map((item) => (
                  <div key={item.name} className="grid grid-cols-[10px_minmax(0,1fr)_52px] items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate text-cockpit-slate">{item.name}</span>
                    <span className="text-right font-semibold tabular-nums text-cockpit-ink">
                      {formatPercent(item.share, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">{labels.trendTitle}</div>
              <div className="flex gap-3 text-[10px] text-cockpit-meta">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cockpit-teal" />MC</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cockpit-indigo" />EBITDA</span>
              </div>
            </div>
            <svg viewBox="0 0 280 132" className="h-44 w-full overflow-visible" role="img" aria-label={labels.trendTitle}>
              <line x1="12" y1="118" x2="268" y2="118" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="12" y1="18" x2="268" y2="18" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
              <path d={linePath(contributionPoints)} fill="none" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d={linePath(ebitdaPoints)} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {trendData.map((entry, index) => (
                <g key={entry.year}>
                  <circle cx={contributionPoints[index].x} cy={contributionPoints[index].y} r="3" fill="#0f766e" />
                  <circle cx={ebitdaPoints[index].x} cy={ebitdaPoints[index].y} r="3" fill="#4f46e5" />
                  {index % 2 === 0 && (
                    <text x={contributionPoints[index].x} y="130" textAnchor="middle" className="fill-slate-500 text-[9px]">
                      {String(entry.year).slice(2)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">MC {labels.marginLabel}</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-cockpit-teal">
                  {rol === 0 ? "—" : formatPercent(row.margem_de_contribuicao / rol, locale)}
                </div>
              </div>
              <div className="rounded-xl bg-white p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">EBITDA {labels.marginLabel}</div>
                <div className="mt-1 text-lg font-bold tabular-nums text-cockpit-indigo">
                  {row.percentual_ebitda === null ? "—" : formatPercent(row.percentual_ebitda, locale)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-cockpit-ink">{labels.statementTitle}</h4>
            <span className="rounded-full bg-cockpit-subtle px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
              {year}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-cockpit-border-soft">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cockpit-border-soft bg-cockpit-panel text-[10px] uppercase tracking-[0.12em] text-cockpit-meta">
                  <th className="px-3 py-3">{labels.line}</th>
                  <th className="px-3 py-3 text-right">{labels.amount}</th>
                  <th className="px-3 py-3 text-right">{labels.pctBasis}</th>
                </tr>
              </thead>
              <tbody>
                {statementRows(row, locale).map((item) => {
                  const basisValue = item.basis === "tuition" ? tuitionRevenue : rol;
                  const pct = item.value === null || basisValue === 0 ? null : item.value / basisValue;
                  return (
                    <tr
                      key={item.label}
                      className={
                        item.kind === "final"
                          ? "border-t border-cockpit-positive-border bg-cockpit-teal-fill text-cockpit-teal"
                          : item.kind === "subtotal"
                            ? "border-t border-cockpit-border-soft bg-cockpit-subtle text-cockpit-ink"
                            : "border-t border-cockpit-row-border bg-cockpit-card text-cockpit-slate"
                      }
                    >
                      <td className={`px-3 py-2.5 text-sm ${item.kind === "line" ? "pl-6" : "font-semibold"}`}>{item.label}</td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums">
                        {item.value === null ? "—" : formatCurrencyBRL(item.value, locale)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-sm tabular-nums">
                        {pct === null ? "—" : formatPercent(pct, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <p className="mt-4 rounded-xl border border-cockpit-border-soft bg-cockpit-subtle px-4 py-3 text-xs leading-relaxed text-cockpit-meta">
        {labels.scopeNote}
      </p>
    </Card>
  );
}
