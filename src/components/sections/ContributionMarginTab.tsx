import React, { useMemo, useState } from "react";
import { BarChart3, Database, SlidersHorizontal, Table } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL, formatNumber, formatPercent } from "../../i18n/formatters";
import { calculateDre } from "../../features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../../features/rio-scenario-resilience/model/fopagEngine";
import { GOVERNED_DIRECT_YEARS } from "../../features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../../features/rio-scenario-resilience/model/revenueInputs";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  type DreWorkingScenarioOrgDesignOptionId,
} from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import {
  formatOpeningPackageLabel,
  OCCUPANCY_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  TUITION_LABELS,
} from "../dreSimulator/dreLeverLabels";
import WorksheetSyncStamp from "../common/WorksheetSyncStamp";

const YEARS = GOVERNED_DIRECT_YEARS;
const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const CHART_LEFT = 44;
const CHART_RIGHT = 18;
const CHART_TOP = 26;
const CHART_BOTTOM = 34;

type ContributionMarginTabProps = {
  readonly selections: DreScenarioSimulatorSelections;
  readonly onSelectionsChange: (selections: DreScenarioSimulatorSelections) => void;
};

type TrendPoint = {
  readonly year: number;
  readonly alunos: number;
  readonly turmas: number;
  readonly receita: number;
  readonly despesasDiretas: number;
  readonly margemContribuicao: number;
  readonly margemContribuicaoPct: number | null;
  readonly headcount: number;
  readonly fopagDireto: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function linePath(points: readonly { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function chartX(index: number, total: number) {
  const span = CHART_WIDTH - CHART_LEFT - CHART_RIGHT;
  return CHART_LEFT + (total <= 1 ? 0 : (index / (total - 1)) * span);
}

function chartY(value: number, max: number) {
  const span = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
  return CHART_TOP + span - (value / Math.max(max, 1)) * span;
}

function kpiTone(value: number) {
  if (value > 0) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value < 0) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-white text-slate-700";
}

export default function ContributionMarginTab({ selections, onSelectionsChange }: ContributionMarginTabProps) {
  const { locale } = useLocale();
  const isPt = locale === "pt-BR";
  const [selectedYear, setSelectedYear] = useState<number>(YEARS[0]);

  const dreOutput = useMemo(
    () =>
      calculateDre({
        openingPackageId: selections.openingPackageId,
        occupancyScenarioId: selections.occupancyScenarioId,
        tuitionScenarioId: selections.tuitionScenarioId,
        orgDesignOptionId: selections.orgDesignOptionId,
      }),
    [selections.openingPackageId, selections.occupancyScenarioId, selections.tuitionScenarioId, selections.orgDesignOptionId],
  );
  const fopagOutput = useMemo(
    () =>
      calculateFopag({
        openingPackageId: selections.openingPackageId,
        occupancyScenarioId: selections.occupancyScenarioId,
        orgDesignOptionId: selections.orgDesignOptionId,
      }),
    [selections.openingPackageId, selections.occupancyScenarioId, selections.orgDesignOptionId],
  );

  const rows: TrendPoint[] = YEARS.map((year) => {
    const dre = dreOutput.byYear[year];
    const fopagYear = fopagOutput.yearTotals.find((row) => row.year === year);
    const headcount = fopagOutput.records
      .filter((record) => record.year === year && !record.isAuditRow)
      .reduce((sum, record) => sum + record.headcountOrFte, 0);
    return {
      year,
      alunos: dre.numero_de_alunos,
      turmas: dre.numero_de_turmas,
      receita: dre.receita_operacional_liquida,
      despesasDiretas: Math.abs(dre.total_custo_direto),
      margemContribuicao: dre.margem_de_contribuicao,
      margemContribuicaoPct:
        dre.receita_operacional_liquida === 0 ? null : dre.margem_de_contribuicao / dre.receita_operacional_liquida,
      headcount,
      fopagDireto: fopagYear?.fopagDireto ?? Math.abs(dre.fopag_direto_clt_pj),
    };
  });

  const selected = rows.find((row) => row.year === selectedYear) ?? rows[0];
  const maxAlunos = Math.max(...rows.map((row) => row.alunos), 1);
  const maxTurmas = Math.max(...rows.map((row) => row.turmas), 1);
  const maxMoney = Math.max(...rows.flatMap((row) => [row.receita, row.despesasDiretas, Math.abs(row.margemContribuicao)]), 1);
  const marginPctValues = rows.map((row) => row.margemContribuicaoPct ?? 0);
  const minMarginPct = Math.min(...marginPctValues, 0);
  const maxMarginPct = Math.max(...marginPctValues, 0.01);
  const maxHeadcount = Math.max(...rows.map((row) => row.headcount), 1);

  const alunosBarWidth = 32;
  const alunoTurmaLine = rows.map((row, index) => ({
    x: chartX(index, rows.length),
    y: chartY(row.turmas, maxTurmas),
  }));
  const marginLine = rows.map((row, index) => {
    const pct = row.margemContribuicaoPct ?? 0;
    const span = CHART_HEIGHT - CHART_TOP - CHART_BOTTOM;
    const normalized = (pct - minMarginPct) / Math.max(maxMarginPct - minMarginPct, 0.01);
    return {
      x: chartX(index, rows.length),
      y: CHART_TOP + span - normalized * span,
    };
  });
  const headcountLine = rows.map((row, index) => ({
    x: chartX(index, rows.length),
    y: chartY(row.headcount, maxHeadcount),
  }));

  const labels = {
    title: isPt ? "Margem de Contribuição %" : "Contribution Margin %",
    subtitle: isPt
      ? "Leitura do PDF: alunos, turmas, receitas, despesas, headcount e espaço de FOPAG para o cenário DRE selecionado."
      : "PDF view: learners, sections, revenue, expenses, headcount, and FOPAG space for the selected DRE scenario.",
    scenario: isPt ? "Seleção de cenário DRE" : "DRE scenario selection",
    fopagSpace: isPt ? "Espaço para FOPAG e seleção de cenários" : "FOPAG and scenario selection space",
    availableData: isPt ? "Dados disponíveis para este tab" : "Available data for this tab",
    alunos: isPt ? "Alunos" : "Learners",
    turmas: isPt ? "Turmas" : "Sections",
    receitas: isPt ? "Receitas" : "Revenue",
    despesas: isPt ? "Despesas" : "Expenses",
    marginPct: isPt ? "Margem de Contribuição %" : "Contribution Margin %",
    headcount: "Headcount",
    dreTable: isPt ? "Demonstrativo de Resultado" : "Income statement",
    sourceNote: isPt
      ? "Todos os valores vêm de calculateDre() e calculateFopag(); não há cálculo local independente."
      : "All values come from calculateDre() and calculateFopag(); there is no independent local calculation.",
    scenarioAffordability: isPt ? "O cenário sustenta a FOPAG?" : "Can this scenario afford FOPAG?",
    contributionMargin: isPt ? "Margem de contribuição" : "Contribution margin",
    directFopag: isPt ? "FOPAG direto" : "Direct FOPAG",
    remainingAfterFopag: isPt ? "Margem após FOPAG direto" : "Margin after direct FOPAG",
    opening: isPt ? "Pacote" : "Opening",
    occupancy: isPt ? "Captação" : "Enrollment",
    tuition: isPt ? "Mensalidade" : "Tuition",
    orgDesign: isPt ? "Desenho org." : "Org design",
    dataItems: [
      isPt ? "Alunos e turmas: DRE numero_de_alunos / numero_de_turmas" : "Learners and sections: DRE numero_de_alunos / numero_de_turmas",
      isPt ? "Receitas e despesas: DRE receita_operacional_liquida / total_custo_direto" : "Revenue and expenses: DRE receita_operacional_liquida / total_custo_direto",
      isPt ? "Margem %: margem_de_contribuicao / receita_operacional_liquida" : "Margin %: margem_de_contribuicao / receita_operacional_liquida",
      isPt ? "Headcount/FTE: soma dos registros ativos FOPAG" : "Headcount/FTE: sum of active FOPAG records",
    ],
  };

  const updateSelection = <K extends keyof DreScenarioSimulatorSelections>(key: K, value: DreScenarioSimulatorSelections[K]) => {
    onSelectionsChange({ ...selections, [key]: value });
  };

  const dreTableRows = [
    [isPt ? "Receitas com Ensino Regular" : "Regular tuition revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receitas_com_ensino_regular],
    [isPt ? "Receitas com Upselling" : "Upselling revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receitas_com_upselling],
    [isPt ? "(=) Receita de Ensino Bruta" : "(=) Gross teaching revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receita_de_ensino_bruta],
    [isPt ? "Bolsa de Estudos" : "Scholarships", (r: TrendPoint) => dreOutput.byYear[r.year].bolsa_de_estudos],
    [isPt ? "(=) Receita de Ensino" : "(=) Teaching revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receita_de_ensino_liquida],
    [isPt ? "Descontos Método de Assinatura" : "Subscription-method discounts", (r: TrendPoint) => dreOutput.byYear[r.year].descontos_metodo_de_assinatura],
    [isPt ? "Receita com Eventos" : "Events revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receita_com_eventos],
    [isPt ? "Receita com Material Didático" : "Teaching-material revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receita_com_material_didatico],
    [isPt ? "Outras Receitas" : "Other revenue", (r: TrendPoint) => dreOutput.byYear[r.year].outras_receitas],
    [isPt ? "(=) Receita Operacional Líquida" : "(=) Net operating revenue", (r: TrendPoint) => dreOutput.byYear[r.year].receita_operacional_liquida],
    [isPt ? "Custo da Mercadoria Vendida" : "COGS", (r: TrendPoint) => dreOutput.byYear[r.year].custo_da_mercadoria_vendida],
    [isPt ? "FOPAG Direto (CLT-PJ)" : "Direct FOPAG", (r: TrendPoint) => dreOutput.byYear[r.year].fopag_direto_clt_pj],
    [isPt ? "Eventos SEB" : "SEB events", (r: TrendPoint) => dreOutput.byYear[r.year].eventos_seb],
    [isPt ? "Certificações" : "Certifications", (r: TrendPoint) => dreOutput.byYear[r.year].certificacoes],
    [isPt ? "Custos com Alimentação" : "Food costs", (r: TrendPoint) => dreOutput.byYear[r.year].custos_com_alimentacao],
    [isPt ? "Materiais Pedagógicos" : "Pedagogical materials", (r: TrendPoint) => dreOutput.byYear[r.year].materiais_pedagogicos],
    [isPt ? "(=) Total Custo Direto" : "(=) Total direct cost", (r: TrendPoint) => dreOutput.byYear[r.year].total_custo_direto],
    [isPt ? "(=) Margem de Contribuição" : "(=) Contribution margin", (r: TrendPoint) => dreOutput.byYear[r.year].margem_de_contribuicao],
    [isPt ? "Margem de Contribuição %" : "Contribution margin %", (r: TrendPoint) => dreOutput.byYear[r.year].receita_operacional_liquida === 0 ? null : dreOutput.byYear[r.year].margem_de_contribuicao / dreOutput.byYear[r.year].receita_operacional_liquida],
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
              <BarChart3 className="h-3.5 w-3.5" />
              {labels.title}
            </div>
            <h3 className="mt-3 max-w-4xl text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
              {labels.scenarioAffordability}
            </h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{labels.subtitle}</p>
          </div>
          <div className="lg:max-w-[420px]">
            <WorksheetSyncStamp />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[520px]">
            {[
              [labels.alunos, formatNumber(selected.alunos, locale)],
              [labels.turmas, formatNumber(selected.turmas, locale, 1)],
              [labels.marginPct, selected.margemContribuicaoPct === null ? "-" : formatPercent(selected.margemContribuicaoPct, locale, 1)],
              [labels.headcount, formatNumber(selected.headcount, locale, 1)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                <div className="mt-1 text-lg font-black text-slate-900 tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4 text-sm font-black text-slate-800">
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" />{labels.alunos}</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-orange-500" />{labels.turmas}</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{YEARS[0]}-{YEARS[YEARS.length - 1]}</div>
            </div>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[250px] w-full" role="img" aria-label={`${labels.alunos} ${labels.turmas}`}>
              <line x1={CHART_LEFT} y1={CHART_HEIGHT - CHART_BOTTOM} x2={CHART_WIDTH - CHART_RIGHT} y2={CHART_HEIGHT - CHART_BOTTOM} stroke="#e2e8f0" />
              {rows.map((row, index) => {
                const x = chartX(index, rows.length);
                const barHeight = (row.alunos / maxAlunos) * 170;
                return (
                  <g key={row.year} className="cursor-pointer" onClick={() => setSelectedYear(row.year)}>
                    <rect
                      x={x - alunosBarWidth / 2}
                      y={CHART_HEIGHT - CHART_BOTTOM - barHeight}
                      width={alunosBarWidth}
                      height={barHeight}
                      rx="8"
                      fill={row.year === selectedYear ? "#2563eb" : "#3b82f6"}
                      opacity={row.year === selectedYear ? 1 : 0.72}
                    />
                    <text x={x} y={CHART_HEIGHT - 10} textAnchor="middle" className={cn("fill-slate-500 text-[10px] font-bold", row.year === selectedYear && "fill-blue-700")}>
                      {String(row.year).slice(2)}
                    </text>
                  </g>
                );
              })}
              <path d={linePath(alunoTurmaLine)} fill="none" stroke="#f97316" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {alunoTurmaLine.map((point, index) => (
                <circle key={rows[index].year} cx={point.x} cy={point.y} r={rows[index].year === selectedYear ? 6 : 4.5} fill="#f97316" className="cursor-pointer" onClick={() => setSelectedYear(rows[index].year)} />
              ))}
            </svg>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900">{labels.receitas} e {labels.despesas}</h3>
              <div className="flex flex-wrap gap-3 text-[11px] font-bold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />{labels.receitas}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" />{labels.despesas}</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded-full bg-slate-700" />{labels.marginPct}</span>
              </div>
            </div>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[260px] w-full" role="img" aria-label={`${labels.receitas} ${labels.despesas} ${labels.marginPct}`}>
              <line x1={CHART_LEFT} y1="130" x2={CHART_WIDTH - CHART_RIGHT} y2="130" stroke="#cbd5e1" />
              {rows.map((row, index) => {
                const x = chartX(index, rows.length);
                const revenueHeight = (row.receita / maxMoney) * 100;
                const expenseHeight = (row.despesasDiretas / maxMoney) * 100;
                return (
                  <g key={row.year} className="cursor-pointer" onClick={() => setSelectedYear(row.year)}>
                    <rect x={x - 14} y={130 - revenueHeight} width="28" height={revenueHeight} rx="4" fill="#14b8a6" opacity={row.year === selectedYear ? 1 : 0.72} />
                    <rect x={x - 14} y="130" width="28" height={expenseHeight} rx="4" fill="#f87171" opacity={row.year === selectedYear ? 1 : 0.72} />
                    <text x={x} y={CHART_HEIGHT - 10} textAnchor="middle" className={cn("fill-slate-500 text-[10px] font-bold", row.year === selectedYear && "fill-blue-700")}>
                      {String(row.year).slice(2)}
                    </text>
                  </g>
                );
              })}
              <path d={linePath(marginLine)} fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              {marginLine.map((point, index) => (
                <circle key={rows[index].year} cx={point.x} cy={point.y} r={rows[index].year === selectedYear ? 5.5 : 4} fill="#334155" className="cursor-pointer" onClick={() => setSelectedYear(rows[index].year)} />
              ))}
            </svg>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900">{labels.headcount}</h3>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                FOPAG records
              </span>
            </div>
            <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[240px] w-full" role="img" aria-label={labels.headcount}>
              <line x1={CHART_LEFT} y1={CHART_HEIGHT - CHART_BOTTOM} x2={CHART_WIDTH - CHART_RIGHT} y2={CHART_HEIGHT - CHART_BOTTOM} stroke="#e2e8f0" />
              <path d={linePath(headcountLine)} fill="none" stroke="#eab308" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {headcountLine.map((point, index) => (
                <g key={rows[index].year} className="cursor-pointer" onClick={() => setSelectedYear(rows[index].year)}>
                  <circle cx={point.x} cy={point.y} r={rows[index].year === selectedYear ? 6 : 4.5} fill="#fff" stroke="#eab308" strokeWidth="4" />
                  <text x={point.x} y={CHART_HEIGHT - 10} textAnchor="middle" className={cn("fill-slate-500 text-[10px] font-bold", rows[index].year === selectedYear && "fill-amber-700")}>
                    {String(rows[index].year).slice(2)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-blue-600 p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-100">
              <SlidersHorizontal className="h-4 w-4" />
              {labels.fopagSpace}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/15 px-3 py-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.contributionMargin}</div>
                <div className="mt-1 text-lg font-black tabular-nums">{formatCurrencyBRL(selected.margemContribuicao, locale)}</div>
              </div>
              <div className="rounded-2xl bg-white/15 px-3 py-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.directFopag}</div>
                <div className="mt-1 text-lg font-black tabular-nums">{formatCurrencyBRL(selected.fopagDireto, locale)}</div>
              </div>
              <div className={cn("col-span-2 rounded-2xl border px-3 py-3", kpiTone(selected.margemContribuicao - selected.fopagDireto))}>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{labels.remainingAfterFopag}</div>
                <div className="mt-1 text-xl font-black tabular-nums">{formatCurrencyBRL(selected.margemContribuicao - selected.fopagDireto, locale)}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <label>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.opening}</span>
                <select
                  value={selections.openingPackageId}
                  onChange={(event) => updateSelection("openingPackageId", event.target.value as ActiveOpeningPackageId)}
                  className="h-9 w-full rounded-xl border border-white/30 bg-white px-3 text-xs font-black text-slate-900"
                >
                  {ACTIVE_OPENING_PACKAGE_IDS.map((id) => (
                    <option key={id} value={id}>{formatOpeningPackageLabel(id)}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.occupancy}</span>
                <select
                  value={selections.occupancyScenarioId}
                  onChange={(event) => updateSelection("occupancyScenarioId", event.target.value as OccupancyScenarioId)}
                  className="h-9 w-full rounded-xl border border-white/30 bg-white px-3 text-xs font-black text-slate-900"
                >
                  {OCCUPANCY_SCENARIO_IDS.map((id) => (
                    <option key={id} value={id}>{OCCUPANCY_LABELS[id] ?? id}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.tuition}</span>
                <select
                  value={selections.tuitionScenarioId}
                  onChange={(event) => updateSelection("tuitionScenarioId", event.target.value as TuitionScenarioId)}
                  className="h-9 w-full rounded-xl border border-white/30 bg-white px-3 text-xs font-black text-slate-900"
                >
                  {DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.map((id) => (
                    <option key={id} value={id}>{TUITION_LABELS[id] ?? id}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-widest text-blue-100">{labels.orgDesign}</span>
                <select
                  value={selections.orgDesignOptionId}
                  onChange={(event) => updateSelection("orgDesignOptionId", event.target.value as DreWorkingScenarioOrgDesignOptionId)}
                  className="h-9 w-full rounded-xl border border-white/30 bg-white px-3 text-xs font-black text-slate-900"
                >
                  {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
                    <option key={id} value={id}>{ORG_DESIGN_OPTION_LABELS[id] ?? id}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Database className="h-4 w-4" />
              {labels.availableData}
            </div>
            <div className="mt-3 space-y-2">
              {labels.dataItems.map((item) => (
                <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-slate-600">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{labels.sourceNote}</p>
          </div>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Table className="h-4 w-4 text-slate-500" />
            {labels.dreTable}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {labels.scenario}: {formatOpeningPackageLabel(selections.openingPackageId)} · {OCCUPANCY_LABELS[selections.occupancyScenarioId]} · {TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId}
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="w-[260px] px-3 py-2 text-[10px] font-black uppercase tracking-widest">{labels.dreTable}</th>
                {YEARS.map((year) => (
                  <th key={year} className="px-3 py-2 text-right text-[10px] font-black uppercase tracking-widest">{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dreTableRows.map(([label, getValue], index) => {
                const subtotal = String(label).startsWith("(=)");
                return (
                  <tr key={label} className={cn("border-b border-slate-100", subtotal ? "bg-slate-100 font-black text-slate-900" : index % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    <td className="px-3 py-2 text-xs font-semibold text-slate-700">{label}</td>
                    {YEARS.map((year) => {
                      const row = rows.find((item) => item.year === year)!;
                      const value = getValue(row);
                      const formatted =
                        value === null
                          ? "-"
                          : Math.abs(value) <= 1 && String(label).includes("%")
                            ? formatPercent(value, locale, 1)
                            : formatCurrencyBRL(value, locale);
                      return (
                        <td key={year} className="px-3 py-2 text-right text-xs tabular-nums text-slate-700">
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
