// PayrollProjectionTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// LOCKED FILE — do not edit without explicit approval.
// All constants are spreadsheet-verified (Auxiliar_-_Org_Design_-_BP_Concept_26032026.xlsx).
// CLT annualization: (salary + encargos) × 13 + benefits × 12.
// Hybrid yearlyData: teaching costs scale with turmas per scenario;
//                   non-teaching costs are fixed progression from leadership.ts.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Download, GraduationCap, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL } from "../../i18n/formatters";
import {
  annualSalaryBurden,
  buildExportPayload,
  buildPayrollProjection,
  buildScenarioComparison,
  buildScenarioMatrix,
  computeTurmasPerYear,
  getAnnualRevenue,
  getGradeLevel as resolvePayrollGradeLevel,
  PAYROLL_GRADE_CONFIG,
  PAYROLL_YEARS,
  STUDENTS_SCHEDULE,
  TUITION_ANNUAL,
  TURMAS_SCHEDULE,
  type MarginMode,
  type PayrollGrade,
  type PayrollScenario,
  type TuitionScenario,
} from "../../lib/payroll/index";
import { downloadTenYearProjectionXlsx } from "../../lib/payroll/exportXlsx";
import { Card } from "../common/Card";
import {
  EDUCATOR_LEVELS,
  LEARNING_ASSISTANT_DETAIL,
  LEARNING_MONITOR_DETAIL,
} from "../../constants";

const PROJECTION_START_YEAR = PAYROLL_YEARS[0];
const PROJECTION_END_YEAR = PAYROLL_YEARS[PAYROLL_YEARS.length - 1];
const PROJECTION_YEAR_RANGE_LABEL = `${PROJECTION_START_YEAR}-${PROJECTION_END_YEAR}`;

type GradeDetailRow = PayrollGrade & {
  turmas: number;
  leadsCount: number;
  supportCount: number;
  leadLevel: string;
  monthlyTotal: number;
  annualTotal: number;
  revenueAnnual: number;
  marginAnnual: number;
  tuitionAnnual: number;
  fopag: boolean;
};

const getLeadFteForGrade = (grade: PayrollGrade, turmas: number): number => {
  if (grade.div === "MS") {
    if (grade.id === "g6") return 3;
    if (grade.id === "g7") return 4;
    if (grade.id === "g8") return 3;
  }

  if (grade.div === "HS") {
    if (grade.id === "g9") return 4;
    if (grade.id === "g10") return 0;
    if (grade.id === "g11") return 3;
    if (grade.id === "g12") return 3;
  }

  return turmas;
};

const PAYROLL_DIV_COLORS: Record<string, string> = {
  EY: "text-rose-600", LS: "text-emerald-600", MS: "text-blue-600", HS: "text-purple-600",
};
const PAYROLL_DIV_BG: Record<string, string> = {
  EY: "bg-rose-50 border-rose-200", LS: "bg-emerald-50 border-emerald-200",
  MS: "bg-blue-50 border-blue-200", HS: "bg-purple-50 border-purple-200",
};
const PayrollProjectionTab = () => {
  const { t, locale } = useLocale();
  const [scenario, setScenario] = useState<PayrollScenario>("otimista");
  const [tuitionScenario, setTuitionScenario] = useState<TuitionScenario>("cen1");
  const [marginMode, setMarginMode] = useState<MarginMode>("FULLY_LOADED");
  const [selectedYear, setSelectedYear] = useState(2028);
  const [view, setView] = useState<"single" | "compare" | "matrix">("single");
  const [expandFolha, setExpandFolha] = useState(false);
  const withBenefits = marginMode === "FULLY_LOADED";

  // Independent educator tier selectors per grade — separate from Staffing Model tab
  // Defaults per spreadsheet (Org. Design Cargos 27-36):
  //   Toddlers 1 & 2: Master Educator (FOPAG)
  //   Pre-K 3: Specialist Educator (lead; Associate also present but Specialist is the lead tier)
  //   Pre-K 4: Specialist Educator
  //   Kinder:  Master Educator
  //   LS G1-G5: Master Educator
  //   MS G6-G8: Master Educator (spreadsheet Master Educator*4/3)
  //   HS G9/G11: Master Educator (pool hired at g9 and g11)
  const defaultPayrollTiers: Record<string, string> = {
    t1i: "master", t1m: "master",
    t2i: "master", t2m: "master",
    pk3: "specialist",
    pk4: "specialist",
    k:   "master",
    g1: "master", g2: "master", g3: "master", g4: "master", g5: "master",
    g6: "master", g7: "master", g8: "master",
    g9: "master", g10: "master", g11: "master", g12: "master",
  };
  const [gradeTiers, setGradeTiers] = useState<Record<string, string>>(defaultPayrollTiers);

  const getGradeLevel = (gradeId: string) =>
    resolvePayrollGradeLevel(gradeId, gradeTiers);

  // ── Compute turmas matrix [grade_idx][year_idx]
  const turmasMatrix = useMemo(() =>
    PAYROLL_GRADE_CONFIG.map(g => computeTurmasPerYear(g, scenario)),
    [scenario]
  );

  const projection = useMemo(
    () =>
      buildPayrollProjection({
        scenario,
        tuitionScenario,
        marginMode,
        gradeTiers,
      }),
    [scenario, tuitionScenario, marginMode, gradeTiers]
  );

  // ── Per-year aggregates
  const yearlyData = projection.years;



  // ── All-scenarios data (for comparison view)
  const allScenariosData = useMemo(
    () =>
      buildScenarioComparison({
        tuitionScenario,
        marginMode,
        gradeTiers,
      }).map((scenarioData) => ({
        ...scenarioData,
        yearly: scenarioData.years.map((yearRow) => ({
          ...yearRow,
          marginAnnual: yearRow.totalRevenueAnnual - yearRow.fopagAnnual,
          coverageRatio:
            yearRow.fopagAnnual > 0 ? yearRow.totalRevenueAnnual / yearRow.fopagAnnual : 0,
        })),
      })),
    [tuitionScenario, marginMode, gradeTiers]
  );

  // ── 9-scenario matrix: 3 enrollment × 3 tuition
  // Each cell = one full horizon projection
  const matrixData = useMemo(
    () =>
      buildScenarioMatrix({
        marginMode,
        gradeTiers,
      }).map((enrollmentScenario) =>
        enrollmentScenario.map((projection) =>
          projection.map((yearRow) => ({
            ...yearRow,
            marginAnnual: yearRow.totalRevenueAnnual - yearRow.fopagAnnual,
            coverageRatio:
              yearRow.fopagAnnual > 0 ? yearRow.totalRevenueAnnual / yearRow.fopagAnnual : 0,
          }))
        )
      ),
    [marginMode, gradeTiers]
  );

  // ── Per-grade detail for selected year
  const gradeDetail = useMemo(() => {
    const yi = PAYROLL_YEARS.indexOf(selectedYear);
    return PAYROLL_GRADE_CONFIG.map((grade, gi) => {
      const turmas = turmasMatrix[gi][yi];
      if (turmas === null) return null;

      const gradeStudents = STUDENTS_SCHEDULE[scenario][grade.id]?.[yi] ?? 0;
      const gradeRevenue  = getAnnualRevenue(grade.id, tuitionScenario, gradeStudents, selectedYear);

      // Shared-staffing grades count students/sections, with no incremental educator cost.
      if ((grade as any).sharedStaffing) {
        return {
          ...grade, turmas, leadsCount: 0, supportCount: 0,
          leadLevel: "HS Pool (shared)",
          monthlyTotal: 0, annualTotal: 0,
          revenueAnnual: gradeRevenue,
          marginAnnual: gradeRevenue,
          tuitionAnnual: TUITION_ANNUAL[grade.id]?.[tuitionScenario] ?? 0,
          fopag: false,
        };
      }

      const leadLevel = getGradeLevel(grade.id);

      const leadsCount = Math.round(getLeadFteForGrade(grade, turmas) * 10) / 10;
      const supportCount = grade.div === "EY" ? turmas * 2 : grade.div === "LS" ? turmas : 0;

      const leadCostMonthly  = leadsCount * (withBenefits ? leadLevel.totalCost : leadLevel.grossMonthly + leadLevel.laborChargesMonthly);
      const leadCostAnnual   = leadsCount * annualSalaryBurden(leadLevel, withBenefits);

      let supportM = 0, supportA = 0;
      if (grade.div === "EY") {
        const monM = withBenefits ? LEARNING_MONITOR_DETAIL.grossMonthly + LEARNING_MONITOR_DETAIL.laborChargesMonthly + LEARNING_MONITOR_DETAIL.benefitsMonthly : LEARNING_MONITOR_DETAIL.grossMonthly + LEARNING_MONITOR_DETAIL.laborChargesMonthly;
        const assM = withBenefits ? LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly + LEARNING_ASSISTANT_DETAIL.benefitsMonthly : LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly;
        supportM = turmas * (monM + assM);
        supportA = turmas * (annualSalaryBurden(LEARNING_MONITOR_DETAIL, withBenefits) + annualSalaryBurden(LEARNING_ASSISTANT_DETAIL, withBenefits));
      } else if (grade.div === "LS") {
        const assM = withBenefits ? LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly + LEARNING_ASSISTANT_DETAIL.benefitsMonthly : LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly;
        supportM = turmas * assM;
        supportA = turmas * annualSalaryBurden(LEARNING_ASSISTANT_DETAIL, withBenefits);
      }

      const gradeAnnualCost = leadCostAnnual + supportA;
      return {
        ...grade, turmas, leadsCount, supportCount,
        leadLevel: leadLevel.name,
        monthlyTotal: leadCostMonthly + supportM,
        annualTotal:  gradeAnnualCost,
        revenueAnnual: gradeRevenue,
        marginAnnual: gradeRevenue - gradeAnnualCost,
        tuitionAnnual: TUITION_ANNUAL[grade.id]?.[tuitionScenario] ?? 0,
        fopag: true,
      };
   }).filter(Boolean) as GradeDetailRow[];
  }, [turmasMatrix, selectedYear, scenario, tuitionScenario, withBenefits, gradeTiers]);

  const scenarioLabels: Record<PayrollScenario, "scenarioOtimista" | "scenarioBase" | "scenarioPessimista"> = {
    otimista: "scenarioOtimista", base: "scenarioBase", pessimista: "scenarioPessimista",
  };
  const scenarioColors: Record<PayrollScenario, string> = {
    otimista: "bg-emerald-600 text-white", base: "bg-blue-600 text-white", pessimista: "bg-amber-600 text-white",
  };

  const selectedYearData = yearlyData[PAYROLL_YEARS.indexOf(selectedYear)];

  const handleDownloadProjectionTable = () => {
    const exportPayload = buildExportPayload({
      projection,
      marginMode,
      years: yearlyData.map((row) => row.year),
    });

    downloadTenYearProjectionXlsx({
      payload: exportPayload,
      scenario,
      tuitionScenario,
      marginMode,
    });
  };

  return (
    <div className="space-y-6">

      {/* ── INTRO: what this page does + calculation logic ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* What this page does */}
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
          <p className="text-sm text-slate-200 leading-relaxed">
            {t("payrollHowToUseIntro")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-indigo-600/30 border border-indigo-400/40 px-4 py-3">
              <div className="text-xs font-black text-indigo-200 uppercase tracking-wider mb-1.5">{t("payrollFopagIncludesLabel")}</div>
              <div className="text-sm text-white leading-relaxed">{t("payrollFopagIncludesList")}</div>
            </div>
            <div className="rounded-xl bg-amber-600/20 border border-amber-400/40 px-4 py-3">
              <div className="text-xs font-black text-amber-200 uppercase tracking-wider mb-1.5">{t("payrollFolhaIncludesLabel")}</div>
              <div className="text-sm text-white leading-relaxed">{t("payrollFolhaIncludesList")}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-1 border-t border-white/10">
            <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-black text-white">↓</span>
            </div>
            <span className="text-sm text-slate-300">
              {t("payrollGradeBreakdownNote")}
            </span>
          </div>
        </div>

        {/* Calculation logic */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4">
          <div className="text-xs font-black uppercase tracking-widest text-slate-500">{t("payrollCalcLogicLabel")}</div>
          {[
            {
              label: t("payrollLabelFopagDireto"),
              dotColor: "bg-indigo-500",
              textColor: "text-indigo-700",
              formula: t("payrollFormulaFopag"),
              note: t("payrollNoteFopag"),
            },
            {
              label: t("payrollLabelBeneficios"),
              dotColor: "bg-blue-500",
              textColor: "text-blue-700",
              formula: t("payrollFormulaBeneficios"),
              note: t("payrollNoteBeneficios"),
            },
            {
              label: t("payrollLabelFolhaDireta"),
              dotColor: "bg-amber-500",
              textColor: "text-amber-700",
              formula: t("payrollFormulaFolha"),
              note: t("payrollNoteFolha"),
            },
            {
              label: t("payrollLabelReceita"),
              dotColor: "bg-emerald-500",
              textColor: "text-emerald-700",
              formula: t("payrollFormulaReceita"),
              note: t("payrollNoteReceita"),
            },
          ].map(item => (
            <div key={item.label} className="flex gap-3 items-start">
              <div className={cn("h-3 w-3 rounded-full mt-1 shrink-0", item.dotColor)} />
              <div>
                <div className={cn("text-sm font-black", item.textColor)}>{item.label}</div>
                <div className="text-xs font-mono text-slate-700 mt-0.5 bg-slate-50 px-2 py-0.5 rounded-lg inline-block border border-slate-100">{item.formula}</div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
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
          {/* View toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollViewModeLabel")}</p>
            <div className="flex gap-2">
              <button onClick={() => setView("single")}
                className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                  view === "single" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                {t("payrollViewSingleLabel")}
              </button>
              <button onClick={() => setView("compare")}
                className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                  view === "compare" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                {t("payrollViewCompareLabel")}
              </button>
              <button onClick={() => setView("matrix")}
                className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                  view === "matrix" ? "bg-indigo-700 text-white border-indigo-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                {t("payrollView9ScenariosLabel")}
              </button>
            </div>
          </div>
          {/* Scenario selector */}
          {view === "single" && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollEnrollmentScenarioLabel")}</p>
              <div className="flex gap-2 flex-wrap">
                {(["otimista","base","pessimista"] as PayrollScenario[]).map(s => (
                  <button key={s} onClick={() => setScenario(s)}
                    className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                      scenario === s ? scenarioColors[s] + " border-transparent shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                    {t(scenarioLabels[s])}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Tuition scenario selector — hidden in matrix view (all 3 shown simultaneously) */}
          {view !== "matrix" && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollTuitionTableLabel")}</p>
            <div className="flex gap-2 flex-wrap">
              {(["cen1","cen2","cen3"] as TuitionScenario[]).map(tc => (
                <button key={tc} onClick={() => setTuitionScenario(tc)}
                  className={cn("px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border",
                    tuitionScenario === tc ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white border-slate-200 text-slate-600 hover:border-slate-400")}>
                  RJ {tc.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-1">
              {tuitionScenario === "cen1" ? t("payrollTuitionCen1Desc") :
               tuitionScenario === "cen2" ? t("payrollTuitionCen2Desc") :
               t("payrollTuitionCen3Desc")}
            </p>
          </div>
          )}
          {/* Benefits toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollCostModeLabel")}</p>
            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-bold", marginMode === "FULLY_LOADED" ? "text-indigo-600" : "text-slate-400")}>{t("payrollWithBenefitsLabel")}</span>
              <button onClick={() => setMarginMode(p => p === "FULLY_LOADED" ? "WITHOUT_BENEFITS" : "FULLY_LOADED")}
                className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", marginMode === "WITHOUT_BENEFITS" ? "bg-indigo-600" : "bg-slate-200")}>
                <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition", marginMode === "WITHOUT_BENEFITS" ? "translate-x-4" : "translate-x-0")} />
              </button>
              <span className={cn("text-[10px] font-bold", marginMode === "WITHOUT_BENEFITS" ? "text-indigo-600" : "text-slate-400")}>{t("payrollWithoutBenefitsLabel")}</span>
            </div>
          </div>
          {/* Year selector */}
          {view === "single" && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{t("payrollDetailYearLabel")}</p>
              <div className="flex gap-1.5 flex-wrap">
                {PAYROLL_YEARS.map(y => (
                  <button key={y} onClick={() => setSelectedYear(y)}
                    className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                      selectedYear === y ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400")}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Educator tier selectors — per grade, independent from Staffing Model tab */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("payrollEducatorTierByGradeLabel")}</p>
            <div className="flex gap-2">
              {/* Global presets — apply only to grades active in the selected year */}
              {EDUCATOR_LEVELS.filter(l => l.id !== "associate").map(level => (
                <button key={level.id} onClick={() => {
                  const yi = PAYROLL_YEARS.indexOf(selectedYear);
                  const next: Record<string, string> = { ...gradeTiers };
                  PAYROLL_GRADE_CONFIG.forEach(g => {
                    if ((TURMAS_SCHEDULE[scenario][g.id]?.[yi] ?? 0) === 0) return;
                    next[g.id] = (level.id === "associate" && g.div !== "EY") ? "specialist" : level.id;
                  });
                  setGradeTiers(next);
                }} className="px-2.5 py-1 rounded-lg text-[9px] font-bold border border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-all">
                  {t("payrollAllToLabel").replace("{tier}", level.name.split(" ")[0])}
                </button>
              ))}
              <button onClick={() => setGradeTiers(defaultPayrollTiers)}
                className="px-2.5 py-1 rounded-lg text-[9px] font-bold border border-slate-200 bg-white text-slate-500 hover:border-slate-400 transition-all">
                {t("payrollResetDefaultsLabel")}
              </button>
            </div>
          </div>
          {/* Per-grade selectors grouped by division */}
          {(["EY","LS","MS","HS"] as const).map(div => {
            const divColors: Record<string, string> = { EY:"text-rose-600", LS:"text-emerald-600", MS:"text-blue-600", HS:"text-purple-600" };
            const divBg: Record<string, string> = { EY:"border-rose-100", LS:"border-emerald-100", MS:"border-blue-100", HS:"border-purple-100" };
            const divLabels: Record<string, string> = { EY: t("payrollDivEarlyYears"), LS: t("payrollDivLowerSchool"), MS: t("payrollDivMiddleSchool"), HS: t("payrollDivHighSchool") };
            const yi = PAYROLL_YEARS.indexOf(selectedYear);
            // Only show grades that are open (have ≥1 turma) in the selected year+scenario
            const divGrades = PAYROLL_GRADE_CONFIG.filter(g =>
              g.div === div && (TURMAS_SCHEDULE[scenario][g.id]?.[yi] ?? 0) > 0
            );
            if (divGrades.length === 0) return null;
            return (
              <div key={div} className={cn("mb-3 last:mb-0 rounded-2xl border bg-slate-50 p-3", divBg[div])}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", divColors[div])}>{divLabels[div]}</span>
                  {/* Division-level quick preset */}
                  <div className="flex gap-1">
                    {EDUCATOR_LEVELS.filter(l => l.id !== "associate" || div === "EY").map(level => (
                      <button key={level.id} onClick={() => {
                        const next = { ...gradeTiers };
                        divGrades.forEach(g => { next[g.id] = level.id; });
                        setGradeTiers(next);
                      }} className={cn("px-2 py-0.5 rounded-md text-[8px] font-bold border transition-all",
                        divGrades.every(g => (gradeTiers[g.id] ?? "specialist") === level.id)
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white border-slate-200 text-slate-400 hover:border-slate-400")}>
                        {level.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                  {divGrades.map(grade => {
                    const currentTier = gradeTiers[grade.id] ?? "specialist";
                    const validTiers = EDUCATOR_LEVELS.filter(l => l.id !== "associate" || div === "EY");
                    return (
                      <div key={grade.id} className="bg-white rounded-xl border border-slate-200 p-2">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-800 break-words">{grade.name}</span>
                          {grade.shift === "M" && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-1 shrink-0">{t("payrollShiftManha")}</span>
                          )}
                        </div>
                        <select
                          value={currentTier}
                          onChange={e => setGradeTiers(prev => ({ ...prev, [grade.id]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1 text-[10px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                          {validTiers.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-slate-400 mt-2 italic">{t("payrollTierSelectorsNote")}</p>
        </div>
      </Card>

      {view === "single" && (
        <div className="space-y-6">
          {/* KPI STRIP */}
          {selectedYearData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
              {[
                {
                  label: t("payrollKpiAlunosLabel"),
                  value: String(selectedYearData.totalStudents),
                  sub: t("payrollKpiTurmasAtivasSub").replace("{n}", String(selectedYearData.totalTurmas)),
                  tone: "bg-white border-slate-200",
                  valueTone: "text-slate-900",
                  subTone: "text-slate-500",
                },
                {
                  label: t("payrollKpiReceitaAnualLabel"),
                  value: formatCurrencyBRL(selectedYearData.totalRevenueAnnual, locale),
                  sub: t("payrollKpiReceitaSub").replace("{tuition}", tuitionScenario.toUpperCase()),
                  tone: "bg-emerald-50 border-emerald-200",
                  valueTone: "text-emerald-800",
                  subTone: "text-emerald-600",
                },
                {
                  label: t("payrollLabelFopagDireto"),
                  value: formatCurrencyBRL(selectedYearData.fopagDiretoAnnual, locale),
                  sub: t("payrollKpiFopagSub"),
                  tone: "bg-indigo-50 border-indigo-200",
                  valueTone: "text-indigo-800",
                  subTone: "text-indigo-600",
                },
                {
                  label: t("payrollLabelBeneficios"),
                  value: formatCurrencyBRL(selectedYearData.beneficiosAnnual, locale),
                  sub: withBenefits ? t("payrollKpiBeneficiosSubOn") : t("payrollExcluidoLabel"),
                  tone: "bg-blue-50 border-blue-200",
                  valueTone: withBenefits ? "text-blue-800" : "text-slate-400",
                  subTone: "text-blue-600",
                },
                {
                  label: t("payrollLabelFolhaDireta"),
                  value: formatCurrencyBRL(selectedYearData.folhaDiretaAnnual, locale),
                  sub: t("payrollKpiFolhaSub"),
                  tone: "bg-amber-50 border-amber-200",
                  valueTone: "text-amber-800",
                  subTone: "text-amber-600",
                },
                {
                  label: t("payrollCoberturaConsolidadaLabel"),
                  value: formatCurrencyBRL(selectedYearData.marginAnnual, locale),
                  sub: t("payrollCoberturaSub").replace("{n}", String(Math.round(selectedYearData.coverageRatio * 100))),
                  tone:
                    selectedYearData.marginAnnual >= 0
                      ? "bg-teal-50 border-teal-200"
                      : "bg-red-50 border-red-200",
                  valueTone:
                    selectedYearData.marginAnnual >= 0
                      ? "text-teal-800"
                      : "text-red-700",
                  subTone:
                    selectedYearData.marginAnnual >= 0
                      ? "text-teal-600"
                      : "text-red-500",
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={cn("rounded-2xl border px-4 py-4 min-w-0", kpi.tone)}
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {kpi.label}
                  </div>
                  <div
                    className={cn(
                      "mt-2 text-lg md:text-xl font-black leading-tight break-words",
                      kpi.valueTone
                    )}
                  >
                    {kpi.value}
                  </div>
                  <div className={cn("mt-1 text-[10px] leading-snug", kpi.subTone)}>
                    {kpi.sub}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MAIN FINANCE LAYOUT */}
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(1180px,1fr)_320px] gap-6 items-start">
            {/* LEFT: projection overview table */}
            <Card
              title={t("payrollProjectionTableTitle").replace("{range}", PROJECTION_YEAR_RANGE_LABEL)}
              icon={TrendingUp}
              subtitle={`${t(scenarioLabels[scenario])} · RJ ${tuitionScenario.toUpperCase()} · ${
                marginMode === "FULLY_LOADED" ? t("payrollFullyLoadedLabel") : t("payrollWithoutBenefitsLabel")
              }`}
              className="xl:overflow-visible"
            >
              <div className="overflow-x-auto xl:overflow-visible">
                <div className="w-full rounded-2xl border border-slate-100 bg-white">
                <table className="w-full table-fixed border-collapse text-left xl:min-w-0">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 whitespace-nowrap xl:px-2.5">
                        {t("payrollYearHeader")}
                      </th>
                      <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-center xl:px-2.5">
                        {t("payrollAlunosHeader")}
                      </th>
                      <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-indigo-600 border-b border-slate-200 text-right bg-indigo-50 xl:px-2.5">
                        {t("payrollLabelFopagDireto")}
                      </th>
                      <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600 border-b border-slate-200 text-right bg-blue-50 xl:px-2.5">
                        {t("payrollLabelBeneficios")}
                      </th>

                      {expandFolha ? (
                        <>
                          <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-600 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                            <button
                              onClick={() => setExpandFolha(false)}
                              className="ml-auto inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                              title={t("payrollCollapseLabel")}
                            >
                              <span>{t("payrollLiderancaHeader")}</span>
                              <span className="text-[8px]">▲</span>
                            </button>
                          </th>
                          <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600 border-b border-slate-200 text-right bg-emerald-50 xl:px-2.5">
                            {t("payrollBackofficeHeader")}
                          </th>
                          <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-violet-600 border-b border-slate-200 text-right bg-violet-50 xl:px-2.5">
                            {t("payrollEspecialistasHeader")}
                          </th>
                        </>
                      ) : (
                        <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                          <button
                            onClick={() => setExpandFolha(true)}
                            className="ml-auto inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                            title={t("payrollExpandirFolhaLabel")}
                          >
                            <span>{t("payrollLabelFolhaDireta")}</span>
                            <span className="text-[8px]">▼</span>
                          </button>
                        </th>
                      )}

                      <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-800 border-b border-slate-200 text-right bg-slate-100 xl:px-2.5">
                        {t("payrollTotalHeader")}
                      </th>
                      <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-700 border-b border-slate-200 text-right bg-emerald-50 xl:px-2.5">
                        {t("payrollReceitaHeader")}
                      </th>
                      <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-right xl:px-2.5">
                        {t("payrollCoverageHeader")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {yearlyData.map((yd, i) => (
                      <tr
                        key={yd.year}
                        onClick={() => setSelectedYear(yd.year)}
                        className={cn(
                          "cursor-pointer border-b border-slate-100 transition-colors hover:bg-indigo-50",
                          yd.year === selectedYear
                            ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200"
                            : i % 2 === 0
                              ? "bg-white"
                              : "bg-slate-50/50"
                        )}
                      >
                        <td className="px-2 py-2.5 xl:px-2.5">
                          <span
                            className={cn(
                              "text-[11px] font-black tabular-nums",
                              yd.year === selectedYear ? "text-indigo-700" : "text-slate-900"
                            )}
                          >
                            {yd.year}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-center xl:px-2.5">
                          <span className="text-[11px] font-bold tabular-nums text-slate-700">
                            {yd.totalStudents}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-right bg-indigo-50 xl:px-2.5">
                          <span className="text-[11px] font-bold text-indigo-800 tabular-nums">
                            {formatCurrencyBRL(yd.fopagDiretoAnnual, locale)}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-right bg-blue-50 xl:px-2.5">
                          <span
                            className={cn(
                              "text-[11px] tabular-nums",
                              withBenefits
                                ? "font-bold text-blue-800"
                                : "text-slate-400 line-through"
                            )}
                          >
                            {formatCurrencyBRL(yd.beneficiosAnnual, locale)}
                          </span>
                        </td>

                        {expandFolha ? (
                          <>
                            <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5">
                              <span className="text-[11px] font-bold text-amber-800 tabular-nums">
                                {formatCurrencyBRL(yd.leadershipAnnual, locale)}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right bg-emerald-50 xl:px-2.5">
                              <span className="text-[11px] font-bold text-emerald-800 tabular-nums">
                                {formatCurrencyBRL(yd.backofficeAnnual, locale)}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right bg-violet-50 xl:px-2.5">
                              <span className="text-[11px] font-bold text-violet-800 tabular-nums">
                                {formatCurrencyBRL(yd.specialistsAnnual, locale)}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5">
                            <span className="text-[11px] font-bold text-amber-800 tabular-nums">
                              {formatCurrencyBRL(yd.folhaDiretaAnnual, locale)}
                            </span>
                            <div className="mt-0.5 text-[8px] text-amber-500">
                              {t("payrollLiderBoEspAbbrev")}
                            </div>
                          </td>
                        )}

                        <td className="px-2 py-2.5 text-right bg-slate-100 xl:px-2.5">
                          <span className="text-[11px] font-black text-slate-900 tabular-nums">
                            {formatCurrencyBRL(yd.grandTotal, locale)}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-right bg-emerald-50 xl:px-2.5">
                          <span className="text-[11px] font-bold text-emerald-800 tabular-nums">
                            {formatCurrencyBRL(yd.totalRevenueAnnual, locale)}
                          </span>
                        </td>

                        <td className="px-2 py-2.5 text-right xl:px-2.5">
                          <div
                            className={cn(
                              "text-[11px] font-black tabular-nums",
                              yd.marginAnnual >= 0 ? "text-teal-700" : "text-red-600"
                            )}
                          >
                            {formatCurrencyBRL(yd.marginAnnual, locale)}
                          </div>
                          <span
                            className={cn(
                              "mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-bold",
                              yd.coverageRatio >= 2
                                ? "bg-emerald-100 text-emerald-700"
                                : yd.coverageRatio >= 1.5
                                  ? "bg-teal-100 text-teal-700"
                                  : yd.coverageRatio >= 1
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                            )}
                          >
                            {Math.round(yd.coverageRatio * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </Card>

            {/* RIGHT: selected-year inspector */}
            {selectedYearData && (
              <div className="space-y-4">
                <Card title={t("payrollSelectedYearTitle").replace("{year}", String(selectedYear))}>
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {t("payrollTotalAnnualStackLabel")}
                      </div>
                      <div className="mt-2 text-2xl font-black break-words">
                        {formatCurrencyBRL(selectedYearData.grandTotal, locale)}
                      </div>
                      <div className="mt-2 text-[11px] text-slate-300">
                        {t("payrollStackBreakdownLabel")}
                      </div>
                    </div>

                    {[
                      {
                        label: t("payrollLabelFopagDireto"),
                        value: selectedYearData.fopagDiretoAnnual,
                        tone: "bg-indigo-50 border-indigo-200 text-indigo-800",
                      },
                      {
                        label: t("payrollLabelBeneficios"),
                        value: selectedYearData.beneficiosAnnual,
                        tone: "bg-blue-50 border-blue-200 text-blue-800",
                      },
                      {
                        label: t("payrollLabelFolhaDireta"),
                        value: selectedYearData.folhaDiretaAnnual,
                        tone: "bg-amber-50 border-amber-200 text-amber-800",
                      },
                      {
                        label: t("payrollKpiReceitaAnualLabel"),
                        value: selectedYearData.totalRevenueAnnual,
                        tone: "bg-emerald-50 border-emerald-200 text-emerald-800",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn("rounded-2xl border px-4 py-3", item.tone)}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                          {item.label}
                        </div>
                        <div className="mt-1 text-base font-black break-words">
                          {formatCurrencyBRL(item.value, locale)}
                        </div>
                      </div>
                    ))}

                    <div
                      className={cn(
                        "rounded-2xl border px-4 py-4",
                        selectedYearData.marginAnnual >= 0
                          ? "bg-teal-50 border-teal-200"
                          : "bg-red-50 border-red-200"
                      )}
                    >
                      <div
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          selectedYearData.marginAnnual >= 0
                            ? "text-teal-600"
                            : "text-red-500"
                        )}
                      >
                        {t("payrollCoberturaConsolidadaLabel")}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-xl font-black break-words",
                          selectedYearData.marginAnnual >= 0
                            ? "text-teal-800"
                            : "text-red-700"
                        )}
                      >
                        {formatCurrencyBRL(selectedYearData.marginAnnual, locale)}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {t("payrollCoberturaSub").replace("{n}", String(Math.round(selectedYearData.coverageRatio * 100)))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title={t("payrollDivisionSnapshotTitle")}>
                  <div className="space-y-3">
                    {(["EY", "LS", "MS", "HS"] as const).map((div) => {
                      const students = selectedYearData.studentsByDiv[div] ?? 0;
                      const turmas = selectedYearData.turmasByDiv[div] ?? 0;
                      if (students === 0 && turmas === 0) return null;

                      const divLabel =
                        div === "EY"
                          ? t("payrollDivEarlyYears")
                          : div === "LS"
                            ? t("payrollDivLowerSchool")
                            : div === "MS"
                              ? t("payrollDivMiddleSchool")
                              : t("payrollDivHighSchool");

                      return (
                        <div
                          key={div}
                          className={cn("rounded-2xl border px-4 py-3", PAYROLL_DIV_BG[div])}
                        >
                          <div
                            className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              PAYROLL_DIV_COLORS[div]
                            )}
                          >
                            {divLabel}
                          </div>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            <div>
                              <div className="text-lg font-black text-slate-900">
                                {students}
                              </div>
                              <div className="text-[10px] text-slate-500">{t("payrollLearnersLabel")}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-slate-900">
                                {turmas}
                              </div>
                              <div className="text-[10px] text-slate-500">{t("payrollTurmasLabel")}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* GRADE BREAKDOWN */}
          <Card
            title={t("payrollGradeBreakdownTitle").replace("{year}", String(selectedYear))}
            icon={GraduationCap}
            subtitle={`${t(scenarioLabels[scenario])} · RJ ${tuitionScenario.toUpperCase()} · ${t("payrollDetailedTeachingLayerLabel")}`}
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[1120px] border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      {t("payrollGradeHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      {t("payrollTurmasHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      {t("payrollLeadFteHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">
                      {t("payrollSupportHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                      {t("payrollTierHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-indigo-600 border-b border-slate-200 text-right">
                      {t("payrollPayrollHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-600 border-b border-slate-200 text-right">
                      {t("payrollReceitaHeader")}
                    </th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 text-right">
                      {t("payrollCoverageHeader")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gradeDetail.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-slate-100",
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      )}
                    >
                      <td className="px-3 py-3">
                        <div className="text-sm font-bold text-slate-900 break-words">
                          {row.name}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
                        {row.turmas}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
                        {row.leadsCount}
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
                        {row.supportCount}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {row.leadLevel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-slate-800 tabular-nums">
                        {formatCurrencyBRL(row.annualTotal, locale)}
                      </td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-emerald-700 tabular-nums">
                        {formatCurrencyBRL(row.revenueAnnual, locale)}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-3 text-right text-xs font-black tabular-nums",
                          row.marginAnnual >= 0 ? "text-teal-700" : "text-red-600"
                        )}
                      >
                        {formatCurrencyBRL(row.marginAnnual, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* METHODOLOGY */}
          <Card
            title={t("payrollMethodologyTitle")}
            icon={Calculator}
            subtitle={t("payrollMethodologySubtitle")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong className="text-slate-800">{t("payrollTeachingLayerLabel")}</strong> {t("payrollTeachingLayerText")}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong className="text-slate-800">{t("payrollNonTeachingLayerLabel")}</strong> {t("payrollNonTeachingLayerTextPre")}
                <span className="font-mono"> leadership.ts</span>{t("payrollNonTeachingLayerTextPost")}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong className="text-slate-800">{t("payrollAnnualizationLabel")}</strong> {t("payrollAnnualizationText")}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <strong className="text-slate-800">{t("payrollRevenueLabel")}</strong> {t("payrollRevenueTextPre")}
                <span className="font-mono"> STUDENTS_SCHEDULE</span> {t("payrollRevenueTextPost")}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <strong className="text-slate-800">{t("payrollCoverageInterpretationLabel")}</strong> {t("payrollCoverageInterpretationText")}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── COMPARE VIEW ── */}
      {view === "compare" && (
        <>
          {/* Key insight callout */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs font-black text-indigo-800 mb-1">{t("payrollCompareCalloutTitle")}</p>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              {t("payrollCompareCalloutText")}
            </p>
          </div>

          <Card title={t("payrollAllScenariosTitle")} icon={TrendingUp}
            subtitle={`RJ ${tuitionScenario.toUpperCase()} · ${marginMode === "FULLY_LOADED" ? t("payrollFullyLoadedLabel") : t("payrollWithoutBenefitsLabel")} · ${t("payrollRevenueFormulaLabel")}`}>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollYearHeader")}</th>
                    {(["otimista","base","pessimista"] as PayrollScenario[]).map(sc => (
                      <th key={sc} colSpan={4}
                        className={cn("px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b border-slate-200 text-center",
                          sc === "otimista" ? "text-emerald-700 bg-emerald-50" : sc === "base" ? "text-blue-700 bg-blue-50" : "text-amber-700 bg-amber-50")}>
                        {t(scenarioLabels[sc])}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-50">
                    <th className="border-b border-slate-200"></th>
                    {(["otimista","base","pessimista"] as PayrollScenario[]).map(sc => (
                      <React.Fragment key={sc}>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 text-center">{t("payrollTurmasHeader")}</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 text-right">{t("payrollFopagShortHeader")}</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600 border-b border-slate-200 text-right">{t("payrollReceitaHeader")}</th>
                        <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 text-right">{t("payrollCoverageHeader")}</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                    {PAYROLL_YEARS.map((year, yi) => {
                    const rows = allScenariosData.map(sd => sd.years[yi]);
                    return (
                      <tr key={year} className={cn("border-b border-slate-100 hover:bg-indigo-50 transition-colors", yi % 2 === 0 ? "bg-white" : "bg-slate-50/40")}>
                        <td className="px-4 py-3 text-sm font-black text-slate-900">{year}</td>
                        {rows.map((row, si) => {
                          const sc = (["otimista","base","pessimista"] as PayrollScenario[])[si];
                          const margin = (row as any).marginAnnual ?? 0;
                          return (
                            <React.Fragment key={sc}>
                              <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.totalTurmas}</td>
                              <td className="px-3 py-3 text-right text-xs font-bold text-slate-800">{formatCurrencyBRL(row.fopagAnnual, locale)}</td>
                              <td className="px-3 py-3 text-right text-xs font-bold text-emerald-700">{formatCurrencyBRL((row as any).totalRevenueAnnual ?? 0, locale)}</td>
                              <td className={cn("px-3 py-3 text-right text-xs font-black", margin >= 0 ? "text-teal-700" : "text-red-600")}>
                                {formatCurrencyBRL(margin, locale)}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">{t("payrollCompareFooterNote").replace("{tuition}", tuitionScenario.toUpperCase())}</p>
          </Card>
        </>
      )}

      {/* ── MATRIX VIEW — 9 scenarios: 3 enrollment × 3 tuition ── */}
      {view === "matrix" && (
        <div className="space-y-4">
          {/* Year selector for matrix */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t("payrollYearHeader")}</span>
            {PAYROLL_YEARS.map(y => (
              <button key={y} onClick={() => setSelectedYear(y)}
                className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                  selectedYear === y ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400")}>
                {y}
              </button>
            ))}
          </div>

          <Card
            title={t("payrollMatrixTitle")}
            icon={TrendingUp}
            subtitle={t("payrollMatrixSubtitle").replace("{year}", String(selectedYear))}
          >
            {/* Explanation */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3">
              <p className="text-[11px] text-indigo-800 leading-relaxed">
                {t("payrollMatrixExplanation").replace(/\{year\}/g, String(selectedYear))}
              </p>
            </div>

            {/* 3×3 matrix */}
            {(() => {
              const enrollLabels = [t("scenarioOtimista"), t("scenarioBase"), t("scenarioPessimista")];
              const enrollColors = ["text-emerald-700", "text-blue-700", "text-amber-700"];
              const enrollBg = ["bg-emerald-50 border-emerald-200", "bg-blue-50 border-blue-200", "bg-amber-50 border-amber-200"];
              const tuitLabels = ["RJ Cen 1", "RJ Cen 2", "RJ Cen 3"];
              const tuitSub = [t("payrollTuitSub1"), t("payrollTuitSub2"), t("payrollTuitSub3")];
              const yi = PAYROLL_YEARS.indexOf(selectedYear);

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-2">
                    <div className="hidden sm:block" />
                    {tuitLabels.map((tuitLabel, ti) => (
                      <div key={ti} className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-center">
                        <div className="text-xs font-black">{tuitLabel}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{tuitSub[ti]}</div>
                      </div>
                    ))}
                  </div>

                  {enrollLabels.map((label, ei) => (
                    <div key={label} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className={cn("rounded-2xl border px-4 py-4", enrollBg[ei])}>
                        <div className={cn("text-xs font-black uppercase tracking-widest", enrollColors[ei])}>{label}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                          {t("payrollEnrollmentPathNote")}
                        </div>
                      </div>

                      {matrixData[ei].map((projection, ti) => {
                        const cell = projection[yi];
                        const positive = cell.marginAnnual >= 0;
                        return (
                          <div
                            key={`${label}-${tuitLabels[ti]}`}
                            className={cn(
                              "rounded-2xl border px-4 py-4",
                              positive ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tuitLabels[ti]}</div>
                                <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                                  {t("payrollCellStudentsTurmas").replace("{students}", String(cell.totalStudents)).replace("{turmas}", String(cell.totalTurmas))}
                                </div>
                              </div>
                              <div className={cn("text-sm font-black tabular-nums shrink-0", positive ? "text-emerald-700" : "text-red-600")}>
                                {formatCurrencyBRL(cell.marginAnnual, locale)}
                              </div>
                            </div>

                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500">{t("payrollFopagShortHeader")}</span>
                                <span className="font-bold tabular-nums text-slate-800">{formatCurrencyBRL(cell.fopagAnnual, locale)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500">{t("payrollReceitaHeader")}</span>
                                <span className="font-bold tabular-nums text-emerald-700">{formatCurrencyBRL(cell.totalRevenueAnnual, locale)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-500">{t("payrollCoverageHeader")}</span>
                                <span className={cn("font-bold tabular-nums", positive ? "text-emerald-700" : "text-red-600")}>
                                  {Math.round(cell.coverageRatio * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div className="rounded-2xl bg-slate-900 px-4 py-4 flex items-center justify-between mt-2">
                    <div>
                      <div className="text-xs font-black text-white">{t("payrollTotalAnualConsolidadoLabel")}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{t("payrollStackBreakdownLabel")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white">{formatCurrencyBRL(selectedYearData.grandTotal, locale)}</div>
                      <div className={cn("text-xs font-bold mt-0.5", selectedYearData.marginAnnual >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {t("payrollRevenueLessModeledFopag")
                          .replace("{value}", formatCurrencyBRL(selectedYearData.marginAnnual, locale))
                          .replace("{pct}", String(Math.round(selectedYearData.coverageRatio * 100)))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>

          <Card
            title={t("payrollLongRangeTitle")}
            icon={TrendingUp}
            subtitle={`${t(scenarioLabels[scenario])} · RJ ${tuitionScenario.toUpperCase()} · ${marginMode === "FULLY_LOADED" ? t("payrollFullyLoadedLabel") : t("payrollWithoutBenefitsLabel")} · ${t("payrollTeachingScaleNote")}`}
            className="xl:overflow-visible"
          >
            <div className="overflow-x-auto xl:overflow-visible">
              <div className="w-full rounded-2xl border border-slate-100 bg-white">
                <table className="w-full table-fixed border-collapse text-left xl:min-w-0">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 whitespace-nowrap xl:px-2.5">{t("payrollYearHeader")}</th>
                    <th className="w-[7%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-center xl:px-2.5">{t("payrollAlunosHeader")}</th>
                    <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-indigo-600 border-b border-slate-200 text-right bg-indigo-50 xl:px-2.5">{t("payrollLabelFopagDireto")}</th>
                    <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-blue-600 border-b border-slate-200 text-right bg-blue-50 xl:px-2.5">{t("payrollLabelBeneficios")}</th>
                    {expandFolha ? (
                      <>
                        <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-600 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                          <button onClick={() => setExpandFolha(false)} className="flex items-center gap-1 ml-auto hover:opacity-70 transition-opacity" title={t("payrollCollapseLabel")}>
                            <span>{t("payrollLiderancaHeader")}</span><span className="text-[8px]">▲</span>
                          </button>
                        </th>
                        <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600 border-b border-slate-200 text-right bg-emerald-50 xl:px-2.5">{t("payrollBackofficeHeader")}</th>
                        <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-violet-600 border-b border-slate-200 text-right bg-violet-50 xl:px-2.5">{t("payrollEspecialistasHeader")}</th>
                      </>
                    ) : (
                      <th className="w-[16%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-amber-700 border-b border-slate-200 text-right bg-amber-50 xl:px-2.5">
                        <button onClick={() => setExpandFolha(true)} className="flex items-center gap-1 ml-auto hover:opacity-70 transition-opacity" title={t("payrollExpandFolhaTitleLong")}>
                          <span>{t("payrollFolhaDePagamentoLabel")}</span><span className="text-[8px]">▼</span>
                        </button>
                      </th>
                    )}
                    <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-800 border-b border-slate-200 text-right bg-slate-100 xl:px-2.5">{t("payrollTotalAnualHeader")}</th>
                    <th className="w-[14%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-teal-600 border-b border-slate-200 text-right bg-teal-50 xl:px-2.5">{t("payrollReceitaHeader")}</th>
                    <th className="w-[12%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-right xl:px-2.5">{t("payrollCoverageHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((yd, i) => {
                    return (
                      <tr
                        key={yd.year}
                        onClick={() => setSelectedYear(yd.year)}
                        className={cn(
                          "border-b border-slate-100 cursor-pointer transition-colors hover:bg-indigo-50",
                          yd.year === selectedYear
                            ? "bg-indigo-50 ring-1 ring-inset ring-indigo-200"
                            : i % 2 === 0
                              ? "bg-white"
                              : "bg-slate-50/50"
                        )}
                      >
                        <td className="px-2 py-2.5 xl:px-2.5">
                          <span className={cn("text-[11px] font-black tabular-nums", yd.year === selectedYear ? "text-indigo-700" : "text-slate-900")}>
                            {yd.year}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center xl:px-2.5">
                          <span className="text-[11px] font-bold tabular-nums text-indigo-700">{yd.totalStudents}</span>
                        </td>
                        <td className="px-2 py-2.5 text-right bg-indigo-50 xl:px-2.5">
                          <span className="text-[11px] font-bold tabular-nums text-indigo-800">
                            {formatCurrencyBRL(yd.fopagDiretoAnnual, locale)}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-right bg-blue-50 xl:px-2.5">
                          <span className={cn("text-[11px] tabular-nums", withBenefits ? "font-bold text-blue-800" : "text-slate-400 line-through")}>
                            {formatCurrencyBRL(yd.beneficiosAnnual, locale)}
                          </span>
                        </td>
                        {expandFolha ? (
                          <>
                            <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5">
                              <span className="text-[11px] font-bold tabular-nums text-amber-800">
                                {formatCurrencyBRL(yd.leadershipAnnual, locale)}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right bg-emerald-50 xl:px-2.5">
                              <span className="text-[11px] font-bold tabular-nums text-emerald-800">
                                {formatCurrencyBRL(yd.backofficeAnnual, locale)}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 text-right bg-violet-50 xl:px-2.5">
                              <span className="text-[11px] font-bold tabular-nums text-violet-800">
                                {formatCurrencyBRL(yd.specialistsAnnual, locale)}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td className="px-2 py-2.5 text-right bg-amber-50 xl:px-2.5">
                            <span className="text-[11px] font-bold tabular-nums text-amber-800">
                              {formatCurrencyBRL(yd.folhaDiretaAnnual, locale)}
                            </span>
                            <div className="text-[8px] text-amber-500 mt-0.5">{t("payrollLiderBoEspAbbrev")}</div>
                          </td>
                        )}
                        <td className="px-2 py-2.5 text-right bg-slate-100 xl:px-2.5">
                          <span className="text-[11px] font-black tabular-nums text-slate-900">
                            {formatCurrencyBRL(yd.grandTotal, locale)}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-right bg-teal-50 xl:px-2.5">
                          <span className="text-[11px] font-bold tabular-nums text-teal-800">
                            {formatCurrencyBRL(yd.totalRevenueAnnual, locale)}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-right xl:px-2.5">
                          <div className={cn("text-[11px] font-black tabular-nums", yd.marginAnnual >= 0 ? "text-teal-700" : "text-red-600")}>
                            {formatCurrencyBRL(yd.marginAnnual, locale)}
                          </div>
                          <span
                            className={cn(
                              "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                              yd.coverageRatio >= 2
                                ? "bg-emerald-100 text-emerald-700"
                                : yd.coverageRatio >= 1.5
                                  ? "bg-teal-100 text-teal-700"
                                  : yd.coverageRatio >= 1
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-700"
                            )}
                          >
                            {Math.round(yd.coverageRatio * 100)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={handleDownloadProjectionTable}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <Download className="h-3.5 w-3.5" />
                {t("payrollDownloadXlsxLabel")}
              </button>
            </div>
          </Card>

          <Card
            title={t("payrollGradeBreakdownTitle").replace("{year}", String(selectedYear))}
            icon={GraduationCap}
            subtitle={`${t(scenarioLabels[scenario])} · RJ ${tuitionScenario.toUpperCase()} · ${t("payrollDetailedTeachingCostRevenueLabel")}`}
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollGradeHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollTurmasHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollLeadFteHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollSupportHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-indigo-600 border-b border-slate-200 text-right">{t("payrollPayrollHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-600 border-b border-slate-200 text-right">{t("payrollReceitaHeader")}</th>
                    <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-teal-600 border-b border-slate-200 text-right">{t("payrollCoverageHeader")}</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeDetail.map((row, index) => (
                    <tr key={row.id} className={cn("border-b border-slate-100", index % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                      <td className="px-3 py-3">
                        <div className="text-sm font-bold text-slate-900">{row.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{row.leadLevel}</div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.turmas}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.leadsCount}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.supportCount}</td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-slate-800">{formatCurrencyBRL(row.annualTotal, locale)}</td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-emerald-700">{formatCurrencyBRL(row.revenueAnnual, locale)}</td>
                      <td className={cn("px-3 py-3 text-right text-xs font-black", row.marginAnnual >= 0 ? "text-teal-700" : "text-red-600")}>
                        {formatCurrencyBRL(row.marginAnnual, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PayrollProjectionTab;
