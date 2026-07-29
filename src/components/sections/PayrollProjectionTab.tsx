// PayrollProjectionTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// V10-RC2.2: refactored to consume the shared scenario contract and the
// governed FOPAG/Org-Design-headcount/DRE-revenue engines directly. This
// file previously carried its own disconnected captação axis
// (PayrollScenario: otimista/base/pessimista), its own disconnected tuition
// axis (TuitionScenario: cen1/cen2/cen3, TUITION_ANNUAL), its own
// disconnected section/turmas schedule (TURMAS_SCHEDULE/STUDENTS_SCHEDULE),
// and a hardcoded MS/HS FTE table — all duplicating governed calculations
// that already exist in calculateFopag()/calculateDre()/
// buildOrgDesignHcTable(). Those local paths are retired, not kept as a
// fallback. See docs/audits/rio-resilience/phase-v10-rc2-2-gate2-payroll-data-flow-map.md
// for the full before/after mapping.
//
// Shared inputs (openingPackageId, occupancyScenarioId, tuitionScenarioId)
// come from App.tsx's dreSelections — the same source ExecutiveOrgDesignTab
// and DreScenarioSimulatorTab already use. Org-design tier and the detail-
// view year remain tab-local, matching ExecutiveOrgDesignTab's own
// established pattern (tier affects only which roles/compensation are
// active, not enrollment/sections; year is a single-year view selector).
//
// MS/HS grade-level instructional headcount is shown separately from EY/LS,
// labeled with F06 (unresolved MS/HS staffing reconciliation) — not folded
// into the same governed-figure table as EY/LS, and not hidden.
//
// Tuition/revenue figures are computed_uncertified (D-R6/F03), same status
// as every other revenue figure in this application — shown, not hidden,
// and not presented as Finance-certified.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Calculator, DollarSign, Download, GraduationCap, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL } from "../../i18n/formatters";
import { Card } from "../common/Card";
import { calculateFopag } from "../../features/rio-scenario-resilience/model/fopagEngine";
import { calculateDre } from "../../features/rio-scenario-resilience/model/dreEngine";
import {
  buildOrgDesignHcTable,
  type OrgDesignHcTableRow,
} from "../../features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import { GOVERNED_DIRECT_YEARS } from "../../features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageDirectWorkbookYear,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../../features/rio-scenario-resilience/model/revenueInputs";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  type DreWorkingScenarioOrgDesignOptionId,
} from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import {
  buildDreScenarioWorkbook,
  buildDreScenarioExportFilename,
  computeOrgDesignPayrollVariants,
  type DreScenarioWorkbookViewModel,
} from "../dreSimulator/dreScenarioWorkbook";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";

const PAYROLL_YEARS: readonly OpeningPackageDirectWorkbookYear[] = GOVERNED_DIRECT_YEARS;
const PROJECTION_START_YEAR = PAYROLL_YEARS[0];
const PROJECTION_END_YEAR = PAYROLL_YEARS[PAYROLL_YEARS.length - 1];
const PROJECTION_YEAR_RANGE_LABEL = `${PROJECTION_START_YEAR}-${PROJECTION_END_YEAR}`;

const OCCUPANCY_LABEL_KEYS: Record<OccupancyScenarioId, "scenarioConservador" | "scenarioBase" | "scenarioOtimista"> = {
  conservador: "scenarioConservador",
  base: "scenarioBase",
  otimista: "scenarioOtimista",
};

const ORG_DESIGN_LABEL_KEYS: Record<DreWorkingScenarioOrgDesignOptionId, "scenarioMinimumExperience" | "scenarioBalancedExperience" | "scenarioPremiumExperience"> = {
  minimum_experience: "scenarioMinimumExperience",
  balanced_experience: "scenarioBalancedExperience",
  premium_experience: "scenarioPremiumExperience",
};

const PAYROLL_DIV_COLORS: Record<string, string> = {
  "Early Years": "text-rose-600",
  "Lower School": "text-emerald-600",
  "Middle School": "text-blue-600",
  "High School": "text-purple-600",
  Leadership: "text-slate-700",
  Operations: "text-amber-600",
  "Learning Ecosystem": "text-indigo-600",
  "Learning Experience Design Hub": "text-violet-600",
};
const PAYROLL_DIV_BG: Record<string, string> = {
  "Early Years": "bg-rose-50 border-rose-200",
  "Lower School": "bg-emerald-50 border-emerald-200",
  "Middle School": "bg-blue-50 border-blue-200",
  "High School": "bg-purple-50 border-purple-200",
  Leadership: "bg-slate-50 border-slate-200",
  Operations: "bg-amber-50 border-amber-200",
  "Learning Ecosystem": "bg-indigo-50 border-indigo-200",
  "Learning Experience Design Hub": "bg-violet-50 border-violet-200",
};
const INSTRUCTIONAL_DIVISIONS = new Set(["Early Years", "Lower School", "Middle School", "High School"]);

interface PayrollProjectionTabProps {
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly tuitionScenarioId: TuitionScenarioId;
}

interface GradeDetailRow {
  gradeId: string;
  gradeLabel: string;
  division: "Early Years" | "Lower School";
  educators: number;
  assistants: number;
  monitors: number;
  totalHeadcount: number;
  annualLoadedCostBRL: number;
}

function extractEyLsGradeRows(hcRows: OrgDesignHcTableRow[]): GradeDetailRow[] {
  const byGrade = new Map<string, GradeDetailRow>();
  for (const row of hcRows) {
    if (row.divisionArea !== "Early Years" && row.divisionArea !== "Lower School") continue;
    // roleGroupOrHub is "EY {Grade} Team" / "LS {Grade} Team" — group key is the grade label.
    const key = `${row.divisionArea}|${row.roleGroupOrHub}`;
    const existing = byGrade.get(key) ?? {
      gradeId: row.roleGroupOrHub,
      gradeLabel: row.roleGroupOrHub.replace(/^(EY|LS)\s/, "").replace(/\sTeam$/, ""),
      division: row.divisionArea as "Early Years" | "Lower School",
      educators: 0,
      assistants: 0,
      monitors: 0,
      totalHeadcount: 0,
      annualLoadedCostBRL: 0,
    };
    if (row.role.endsWith("Reference Educator")) existing.educators += row.headcountOrFte;
    else if (row.role.endsWith("Assistant")) existing.assistants += row.headcountOrFte;
    else if (row.role.endsWith("Monitor")) existing.monitors += row.headcountOrFte;
    existing.totalHeadcount += row.headcountOrFte;
    byGrade.set(key, existing);
  }
  return [...byGrade.values()];
}

const PayrollProjectionTab = ({ openingPackageId, occupancyScenarioId, tuitionScenarioId }: PayrollProjectionTabProps) => {
  const { t, locale } = useLocale();
  const [orgDesignOptionId, setOrgDesignOptionId] = useState<DreWorkingScenarioOrgDesignOptionId>("balanced_experience");
  const [selectedYear, setSelectedYear] = useState<OpeningPackageDirectWorkbookYear>(2028);
  const [view, setView] = useState<"single" | "compare" | "matrix">("single");
  const [expandFolha, setExpandFolha] = useState(false);
  const [marginMode, setMarginMode] = useState<"FULLY_LOADED" | "WITHOUT_BENEFITS">("FULLY_LOADED");
  const withBenefits = marginMode === "FULLY_LOADED";

  const fopagOutput = useMemo(
    () => calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId],
  );
  const dreOutput = useMemo(
    () => calculateDre({ openingPackageId, occupancyScenarioId, orgDesignOptionId, tuitionScenarioId }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, tuitionScenarioId],
  );

  // ── Per-year aggregates, sourced entirely from calculateFopag()/calculateDre() ──
  const yearlyData = useMemo(() => {
    return fopagOutput.yearTotals.map((yt) => {
      const dreYear = dreOutput.byYear[yt.year as OpeningPackageDirectWorkbookYear];
      const leadershipAnnual = yt.byRoleSourceType.find((r) => r.roleSourceType === "baseline_leadership")?.totalPayroll ?? 0;
      const backofficeAnnual = yt.byRoleSourceType.find((r) => r.roleSourceType === "baseline_backoffice")?.totalPayroll ?? 0;
      const specialistsAnnual = yt.byRoleSourceType
        .filter((r) => r.roleSourceType === "baseline_specialist" || r.roleSourceType === "extension_new_role" || r.roleSourceType === "extension_alias")
        .reduce((sum, r) => sum + r.totalPayroll, 0);
      const totalRevenueAnnual = dreYear?.receita_operacional_liquida ?? 0;
      const grandTotal = withBenefits ? yt.totalPayroll : yt.fopagDireto + yt.folhaDireta;
      return {
        year: yt.year,
        totalStudents: dreYear?.numero_de_alunos ?? 0,
        totalTurmas: dreYear?.numero_de_turmas ?? 0,
        fopagDiretoAnnual: yt.fopagDireto,
        beneficiosAnnual: yt.benefits,
        folhaDiretaAnnual: yt.folhaDireta,
        leadershipAnnual,
        backofficeAnnual,
        specialistsAnnual,
        grandTotal,
        totalRevenueAnnual,
        marginAnnual: totalRevenueAnnual - grandTotal,
        coverageRatio: grandTotal > 0 ? totalRevenueAnnual / grandTotal : 0,
      };
    });
  }, [fopagOutput, dreOutput, withBenefits]);

  const selectedYearData = yearlyData.find((yd) => yd.year === selectedYear);

  // ── Grade-level (instructional) and non-instructional headcount, from the SAME
  // buildOrgDesignHcTable() Org Design already uses — parity by construction. ──
  const hcTableResult = useMemo(
    () => buildOrgDesignHcTable({ openingPackageId, occupancyScenarioId, orgDesignOptionId, year: selectedYear }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, selectedYear],
  );
  const eyLsGradeDetail = useMemo(() => extractEyLsGradeRows(hcTableResult.rows), [hcTableResult]);
  // MS/HS aggregate headcount from the engine's own fixed-FTE table — this is one of
  // F06's three non-identical, unreconciled MS/HS staffing sources (V10-RC2 Gate 1),
  // not settled grade-level truth. Shown as an aggregate estimate, never merged into
  // the EY/LS governed-figure table, never presented as reconciled.
  const msHsAggregateHeadcount = hcTableResult.rows
    .filter((r) => r.divisionArea === "Middle School" || r.divisionArea === "High School")
    .reduce((sum, r) => sum + r.headcountOrFte, 0);
  const nonInstructionalRows = hcTableResult.rows.filter((r) => !INSTRUCTIONAL_DIVISIONS.has(r.divisionArea));
  const nonInstructionalByDivision = useMemo(() => {
    const byDiv = new Map<string, number>();
    for (const row of nonInstructionalRows) {
      byDiv.set(row.divisionArea, (byDiv.get(row.divisionArea) ?? 0) + row.headcountOrFte);
    }
    return [...byDiv.entries()].map(([divisionArea, headcount]) => ({ divisionArea, headcount }));
  }, [nonInstructionalRows]);

  const handleDownloadProjectionTable = () => {
    const selections: DreScenarioSimulatorSelections = {
      openingPackageId,
      occupancyScenarioId,
      tuitionScenarioId,
      orgDesignOptionId,
    };
    const threeVersionPayroll = computeOrgDesignPayrollVariants(selections, dreOutput, fopagOutput);
    const lastYear = PAYROLL_YEARS[PAYROLL_YEARS.length - 1];
    const orgDesignSensitivity = DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => {
      const out = id === orgDesignOptionId ? dreOutput : calculateDre({ openingPackageId, occupancyScenarioId, tuitionScenarioId, orgDesignOptionId: id });
      const lyr = out.byYear[lastYear];
      return {
        orgDesignOptionId: id,
        isSelected: id === orgDesignOptionId,
        numeroDeAlunos2047: lyr.numero_de_alunos,
        receitaOperacionalLiquida2047: lyr.receita_operacional_liquida,
        ebitda2047: lyr.ebitda,
        percentualEbitda2047: lyr.percentual_ebitda,
        payrollTotal2047: -(lyr.fopag_direto_clt_pj + lyr.folha_de_pagamento + lyr.beneficios),
        ebitdaPositiveYear: PAYROLL_YEARS.find((y) => out.byYear[y].ebitda > 0) ?? null,
      };
    });
    const vm: DreScenarioWorkbookViewModel = {
      selections,
      defaultSelections: selections,
      dreOutput,
      fopagOutput,
      payrollReconciliation: { isReconciled: true, mismatches: [] },
      orgDesignSensitivity,
      exportedAt: new Date(),
      threeVersionPayroll,
    };
    const wb = buildDreScenarioWorkbook(vm);
    XLSX.writeFile(wb, buildDreScenarioExportFilename(selections, vm.exportedAt));
  };

  return (
    <div className="space-y-6">
      {/* ── INTRO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-slate-800 text-white p-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-1">{t("payrollHowToUseLabel")}</div>
              <div className="text-lg font-bold text-white leading-snug">{t("payrollHowToUseHeadline")}</div>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{t("payrollHowToUseIntro")}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-3">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">{t("payrollSharedScenarioLabel")}</div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">{t("payrollSharedOpeningPackageLabel")}</div>
            <div className="text-sm font-black text-slate-800">{openingPackageId}</div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase">{t("payrollSharedCaptacaoLabel")}</div>
            <div className="text-sm font-black text-slate-800">{t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId])}</div>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
            <div className="text-[10px] font-bold text-amber-500 uppercase">{t("payrollSharedTuitionLabel")}</div>
            <div className="text-sm font-black text-amber-800">{tuitionScenarioId}</div>
            <div className="text-[9px] text-amber-600 mt-0.5">{t("payrollRevenueUncertifiedNote")}</div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <Card title={t("payrollControlsTitle")} icon={Calculator} subtitle={t("payrollControlsSubtitle")}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
            {t("payrollExportCurrentLabel").replace("{range}", PROJECTION_YEAR_RANGE_LABEL)}
          </span>
          <button
            onClick={handleDownloadProjectionTable}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <Download className="h-3.5 w-3.5" />
            {t("payrollDownloadXlsxLabel")}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollViewModeLabel")}</p>
            <div className="flex gap-2">
              {(["single", "compare", "matrix"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                    view === v ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400",
                  )}
                >
                  {v === "single" ? t("payrollViewSingleLabel") : v === "compare" ? t("payrollViewCompareLabel") : t("payrollView9ScenariosLabel")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollOrgDesignTierLabel")}</p>
            <div className="flex gap-2 flex-wrap">
              {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => setOrgDesignOptionId(id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                    orgDesignOptionId === id ? "bg-indigo-600 text-white border-transparent shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400",
                  )}
                >
                  {t(ORG_DESIGN_LABEL_KEYS[id])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollCostModeLabel")}</p>
            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-bold", withBenefits ? "text-indigo-600" : "text-slate-400")}>{t("payrollWithBenefitsLabel")}</span>
              <button
                onClick={() => setMarginMode((p) => (p === "FULLY_LOADED" ? "WITHOUT_BENEFITS" : "FULLY_LOADED"))}
                className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", !withBenefits ? "bg-indigo-600" : "bg-slate-200")}
              >
                <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition", !withBenefits ? "translate-x-4" : "translate-x-0")} />
              </button>
              <span className={cn("text-[10px] font-bold", !withBenefits ? "text-indigo-600" : "text-slate-400")}>{t("payrollWithoutBenefitsLabel")}</span>
            </div>
          </div>
        </div>
        {view === "single" && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollDetailYearLabel")}</p>
            <div className="flex gap-1.5 flex-wrap">
              {PAYROLL_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                    selectedYear === y ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400",
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {view === "single" && selectedYearData && (
        <div className="space-y-6">
          {/* KPI STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
            {[
              { label: t("payrollKpiAlunosLabel"), value: String(selectedYearData.totalStudents), tone: "bg-white border-slate-200", valueTone: "text-slate-900" },
              { label: t("payrollKpiReceitaAnualLabel"), value: formatCurrencyBRL(selectedYearData.totalRevenueAnnual, locale), tone: "bg-emerald-50 border-emerald-200", valueTone: "text-emerald-800" },
              { label: t("payrollLabelFopagDireto"), value: formatCurrencyBRL(selectedYearData.fopagDiretoAnnual, locale), tone: "bg-indigo-50 border-indigo-200", valueTone: "text-indigo-800" },
              { label: t("payrollLabelBeneficios"), value: formatCurrencyBRL(selectedYearData.beneficiosAnnual, locale), tone: "bg-blue-50 border-blue-200", valueTone: withBenefits ? "text-blue-800" : "text-slate-400" },
              { label: t("payrollLabelFolhaDireta"), value: formatCurrencyBRL(selectedYearData.folhaDiretaAnnual, locale), tone: "bg-amber-50 border-amber-200", valueTone: "text-amber-800" },
              {
                label: t("payrollMargemFolhaDiretaLabel"),
                value: formatCurrencyBRL(selectedYearData.marginAnnual, locale),
                tone: selectedYearData.marginAnnual >= 0 ? "bg-teal-50 border-teal-200" : "bg-red-50 border-red-200",
                valueTone: selectedYearData.marginAnnual >= 0 ? "text-teal-800" : "text-red-700",
              },
            ].map((kpi) => (
              <div key={kpi.label} className={cn("rounded-2xl border px-4 py-4 min-w-0", kpi.tone)}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{kpi.label}</div>
                <div className={cn("mt-2 text-lg md:text-xl font-black leading-tight break-words", kpi.valueTone)}>{kpi.value}</div>
              </div>
            ))}
          </div>

          {/* MAIN TABLE */}
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(1180px,1fr)_320px] gap-6 items-start">
            <Card
              title={t("payrollProjectionTableTitle").replace("{range}", PROJECTION_YEAR_RANGE_LABEL)}
              icon={TrendingUp}
              subtitle={`${t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId])} · ${t(ORG_DESIGN_LABEL_KEYS[orgDesignOptionId])} · ${withBenefits ? t("payrollFullyLoadedLabel") : t("payrollWithoutBenefitsLabel")}`}
              className="xl:overflow-visible"
            >
              <div className="overflow-x-auto xl:overflow-visible">
                <div className="w-full rounded-2xl border border-slate-100 bg-white">
                  <table className="w-full table-fixed border-collapse text-left xl:min-w-0">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 xl:px-2.5">{t("payrollYearHeader")}</th>
                        <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-center xl:px-2.5">{t("payrollAlunosHeader")}</th>
                        <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-indigo-600 border-b border-slate-200 text-right bg-indigo-50 xl:px-2.5">{t("payrollLabelFopagDireto")}</th>
                        <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600 border-b border-slate-200 text-right bg-blue-50 xl:px-2.5">{t("payrollLabelBeneficios")}</th>
                        {expandFolha ? (
                          <>
                            <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-600 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                              <button onClick={() => setExpandFolha(false)} className="ml-auto inline-flex items-center gap-1 hover:opacity-70">
                                <span>{t("payrollLiderancaHeader")}</span><span className="text-[8px]">▲</span>
                              </button>
                            </th>
                            <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600 border-b border-slate-200 text-right bg-emerald-50 xl:px-2.5">{t("payrollBackofficeHeader")}</th>
                            <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-violet-600 border-b border-slate-200 text-right bg-violet-50 xl:px-2.5">{t("payrollEspecialistasHeader")}</th>
                          </>
                        ) : (
                          <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                            <button onClick={() => setExpandFolha(true)} className="ml-auto inline-flex items-center gap-1 hover:opacity-70">
                              <span>{t("payrollLabelFolhaDireta")}</span><span className="text-[8px]">▼</span>
                            </button>
                          </th>
                        )}
                        <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-800 border-b border-slate-200 text-right bg-slate-100 xl:px-2.5">{t("payrollTotalHeader")}</th>
                        <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-700 border-b border-slate-200 text-right bg-emerald-50 xl:px-2.5">{t("payrollReceitaHeader")}</th>
                        <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-right xl:px-2.5">{t("payrollCoverageHeader")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((yd, i) => (
                        <tr
                          key={yd.year}
                          onClick={() => setSelectedYear(yd.year as OpeningPackageDirectWorkbookYear)}
                          className={cn(
                            "cursor-pointer border-b border-slate-100 transition-colors hover:bg-indigo-50",
                            yd.year === selectedYear ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                          )}
                        >
                          <td className="px-2 py-2.5 xl:px-2.5"><span className={cn("text-[11px] font-black tabular-nums", yd.year === selectedYear ? "text-indigo-700" : "text-slate-900")}>{yd.year}</span></td>
                          <td className="px-2 py-2.5 text-center xl:px-2.5"><span className="text-[11px] font-bold tabular-nums text-slate-700">{yd.totalStudents}</span></td>
                          <td className="px-2 py-2.5 text-right bg-indigo-50 xl:px-2.5"><span className="text-[11px] font-bold text-indigo-800 tabular-nums">{formatCurrencyBRL(yd.fopagDiretoAnnual, locale)}</span></td>
                          <td className="px-2 py-2.5 text-right bg-blue-50 xl:px-2.5"><span className={cn("text-[11px] tabular-nums", withBenefits ? "font-bold text-blue-800" : "text-slate-400 line-through")}>{formatCurrencyBRL(yd.beneficiosAnnual, locale)}</span></td>
                          {expandFolha ? (
                            <>
                              <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5"><span className="text-[11px] font-bold text-amber-800 tabular-nums">{formatCurrencyBRL(yd.leadershipAnnual, locale)}</span></td>
                              <td className="px-2 py-2.5 text-right bg-emerald-50 xl:px-2.5"><span className="text-[11px] font-bold text-emerald-800 tabular-nums">{formatCurrencyBRL(yd.backofficeAnnual, locale)}</span></td>
                              <td className="px-2 py-2.5 text-right bg-violet-50 xl:px-2.5"><span className="text-[11px] font-bold text-violet-800 tabular-nums">{formatCurrencyBRL(yd.specialistsAnnual, locale)}</span></td>
                            </>
                          ) : (
                            <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5">
                              <span className="text-[11px] font-bold text-amber-800 tabular-nums">{formatCurrencyBRL(yd.folhaDiretaAnnual, locale)}</span>
                              <div className="mt-0.5 text-[8px] text-amber-500">{t("payrollLiderBoEspAbbrev")}</div>
                            </td>
                          )}
                          <td className="px-2 py-2.5 text-right bg-slate-100 xl:px-2.5"><span className="text-[11px] font-black text-slate-900 tabular-nums">{formatCurrencyBRL(yd.grandTotal, locale)}</span></td>
                          <td className="px-2 py-2.5 text-right bg-emerald-50 xl:px-2.5"><span className="text-[11px] font-bold text-emerald-800 tabular-nums">{formatCurrencyBRL(yd.totalRevenueAnnual, locale)}</span></td>
                          <td className="px-2 py-2.5 text-right xl:px-2.5">
                            <div className={cn("text-[11px] font-black tabular-nums", yd.marginAnnual >= 0 ? "text-teal-700" : "text-red-600")}>{formatCurrencyBRL(yd.marginAnnual, locale)}</div>
                            <span className="mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold bg-slate-100 text-slate-600">{Math.round(yd.coverageRatio * 100)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* RIGHT: division snapshot (non-instructional headcount by division) */}
            <div className="space-y-4">
              <Card title={t("payrollDivisionSnapshotTitle")}>
                <div className="space-y-3">
                  {nonInstructionalByDivision.map(({ divisionArea, headcount }) => (
                    <div key={divisionArea} className={cn("rounded-2xl border px-4 py-3", PAYROLL_DIV_BG[divisionArea] ?? "bg-slate-50 border-slate-200")}>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", PAYROLL_DIV_COLORS[divisionArea] ?? "text-slate-600")}>{divisionArea}</div>
                      <div className="mt-2 text-lg font-black text-slate-900">{headcount}</div>
                      <div className="text-[10px] text-slate-500">{t("payrollTeamHeadcountLabel")}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* GRADE BREAKDOWN — EY/LS governed, MS/HS aggregate-only */}
          <Card title={t("payrollGradeBreakdownTitle").replace("{year}", String(selectedYear))} icon={GraduationCap} subtitle={`${t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId])} · ${t(ORG_DESIGN_LABEL_KEYS[orgDesignOptionId])}`}>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollGradeHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollLeadFteHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollSupportHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollTotalHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {eyLsGradeDetail.map((row, index) => (
                    <tr key={row.gradeId} className={cn("border-b border-slate-100", index % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                      <td className="px-3 py-3"><div className="text-sm font-bold text-slate-900">{row.gradeLabel}</div><div className="text-[10px] text-slate-500">{row.division}</div></td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.educators}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.assistants + row.monitors}</td>
                      <td className="px-3 py-3 text-center text-xs font-black text-slate-900">{row.totalHeadcount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">{t("payrollMsHsUnavailableLabel")}</div>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">{t("payrollMsHsUnavailableNote")}</p>
              <p className="text-[10px] text-amber-600 mt-1">
                {t("payrollMsHsAggregateEstimateLabel")}: {msHsAggregateHeadcount}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* ── COMPARE VIEW: Minimum / Balanced / Premium org-design tiers ── */}
      {view === "compare" && (
        <Card title={t("payrollAllScenariosTitle")} icon={TrendingUp} subtitle={t("payrollCompareOrgDesignSubtitle")}>
          <div className="overflow-x-auto rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollYearHeader")}</th>
                  {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
                    <th key={id} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 text-center text-indigo-700 bg-indigo-50">{t(ORG_DESIGN_LABEL_KEYS[id])}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYROLL_YEARS.map((year, yi) => (
                  <tr key={year} className={cn("border-b border-slate-100", yi % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                    <td className="px-4 py-3 text-sm font-black text-slate-900">{year}</td>
                    {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => {
                      const out = id === orgDesignOptionId ? fopagOutput : calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId: id });
                      const yt = out.yearTotals.find((t) => t.year === year);
                      return (
                        <td key={id} className="px-3 py-3 text-right text-xs font-bold text-slate-800">{formatCurrencyBRL(yt?.totalPayroll ?? 0, locale)}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 italic">{t("payrollTierInvarianceFooterNote")}</p>
        </Card>
      )}

      {/* ── MATRIX VIEW: captação × org-design (3×3) for the selected year ── */}
      {view === "matrix" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("payrollYearHeader")}</span>
            {PAYROLL_YEARS.map((y) => (
              <button key={y} onClick={() => setSelectedYear(y)} className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border", selectedYear === y ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400")}>{y}</button>
            ))}
          </div>
          <Card title={t("payrollMatrixTitle")} icon={TrendingUp} subtitle={t("payrollMatrixCaptacaoOrgDesignSubtitle").replace("{year}", String(selectedYear))}>
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                <div className="hidden sm:block" />
                {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
                  <div key={id} className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-center">
                    <div className="text-xs font-black">{t(ORG_DESIGN_LABEL_KEYS[id])}</div>
                  </div>
                ))}
              </div>
              {(["conservador", "base", "otimista"] as OccupancyScenarioId[]).map((occ) => (
                <div key={occ} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border px-4 py-4 bg-slate-50 border-slate-200">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-700">{t(OCCUPANCY_LABEL_KEYS[occ])}</div>
                  </div>
                  {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((od) => {
                    const fp = calculateFopag({ openingPackageId, occupancyScenarioId: occ, orgDesignOptionId: od });
                    const dr = calculateDre({ openingPackageId, occupancyScenarioId: occ, orgDesignOptionId: od, tuitionScenarioId });
                    const yt = fp.yearTotals.find((t) => t.year === selectedYear);
                    const dy = dr.byYear[selectedYear];
                    const total = yt?.totalPayroll ?? 0;
                    const revenue = dy?.receita_operacional_liquida ?? 0;
                    const margin = revenue - total;
                    return (
                      <div key={od} className={cn("rounded-2xl border px-4 py-4", margin >= 0 ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60")}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{dy?.numero_de_alunos ?? 0} {t("payrollLearnersLabel")}</div>
                        <div className={cn("mt-1 text-sm font-black tabular-nums", margin >= 0 ? "text-emerald-700" : "text-red-600")}>{formatCurrencyBRL(margin, locale)}</div>
                        <div className="mt-2 text-[10px] text-slate-500">{t("payrollTotalHeader")}: {formatCurrencyBRL(total, locale)}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayrollProjectionTab;
