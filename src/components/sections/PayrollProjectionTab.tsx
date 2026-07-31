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
import { Download, SlidersHorizontal, TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL, formatNumber } from "../../i18n/formatters";
import { Card } from "../common/Card";
import GradeStaffingTable from "../common/GradeStaffingTable";
import { EDUCATOR_LEVELS, GRADE_CONFIG } from "../../constants/teaching";
import { calculateFopag } from "../../features/rio-scenario-resilience/model/fopagEngine";
import type { FopagCalculatedRecord } from "../../features/rio-scenario-resilience/model/fopagEngineContract";
import { calculateDre } from "../../features/rio-scenario-resilience/model/dreEngine";
import { buildOrgDesignHcTable } from "../../features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import {
  benefitsMonthlyForYear,
  laborChargesMonthlyForSalary,
  salaryMonthlyForYear,
  toBenefitsBase2028,
  toSalaryBase2028,
} from "../../lib/payroll/payrollGrowth";
import { GOVERNED_DIRECT_YEARS } from "../../features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageDirectWorkbookYear,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../../features/rio-scenario-resilience/model/revenueInputs";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  type DreWorkingScenarioOrgDesignOptionId,
} from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { TUITION_LABELS } from "../dreSimulator/dreLeverLabels";
import WorksheetSyncStamp from "../common/WorksheetSyncStamp";
import {
  buildDreScenarioWorkbook,
  buildDreScenarioExportFilename,
  computeOrgDesignPayrollVariants,
  type DreScenarioWorkbookViewModel,
} from "../dreSimulator/dreScenarioWorkbook";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { UseEducatorTierSelectionResult } from "../../hooks/useEducatorTierSelection";

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

// V10-RC2.3 Gate 3: matches ExecutiveOrgDesignTab.tsx's own opening-package label
// map exactly — same shared-contract values (ACTIVE_OPENING_PACKAGE_IDS), same
// display convention, editable in both places against the same shared state.
const OPENING_PACKAGE_LABELS: Record<ActiveOpeningPackageId, string> = {
  t1_g4: "Scenario B / T1→G4",
  t1_g6: "Scenario D / T1→G6",
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
type PayrollDashboardMetricId =
  | "all"
  | "fopagDireto"
  | "folhaPagamento"
  | "netRevenue"
  | "contributionMargin"
  | "turmas"
  | "alunos";
type PayrollEducatorDivision = "Early Years" | "Lower School" | "Middle School" | "High School";
type PayrollEducatorTierId = (typeof EDUCATOR_LEVELS)[number]["id"];

const PAYROLL_DASHBOARD_METRIC_COLORS: Record<PayrollDashboardMetricId, string> = {
  all: "#0f172a",
  fopagDireto: "#6366f1",
  folhaPagamento: "#f59e0b",
  netRevenue: "#10b981",
  contributionMargin: "#0f766e",
  turmas: "#475569",
  alunos: "#059669",
};
const PAYROLL_EDUCATOR_DIVISIONS: readonly PayrollEducatorDivision[] = [
  "Early Years",
  "Lower School",
  "Middle School",
  "High School",
];
const PAYROLL_EDUCATOR_TIER_COLORS: Record<PayrollEducatorTierId, string> = {
  associate: "#f43f5e",
  specialist: "#6366f1",
  master: "#10b981",
  inspirational: "#f59e0b",
  distinguished: "#9333ea",
};
function resolveEducatorDivision(record: FopagCalculatedRecord): PayrollEducatorDivision | null {
  if (record.roleSourceType.startsWith("ey_")) return "Early Years";
  if (record.roleSourceType.startsWith("ls_")) return "Lower School";
  if (record.roleSourceType.startsWith("ms_")) return "Middle School";
  if (record.roleSourceType.startsWith("hs_")) return "High School";
  return null;
}

function isTeachingLeadRecord(record: FopagCalculatedRecord): boolean {
  return record.roleSourceType === "ey_teaching_lead" ||
    record.roleSourceType === "ls_teaching_lead" ||
    record.roleSourceType === "ms_teaching_lead" ||
    record.roleSourceType === "hs_teaching_lead";
}

function extractEducatorGradeId(record: FopagCalculatedRecord): string | null {
  const match = record.roleId.match(/^(?:ey_teaching_lead|ls_teaching_lead|ms_educator|hs_educator)_(.+)$/);
  return match?.[1] ?? null;
}

function getGradeConfigForPayrollGrade(gradeId: string) {
  const canonicalGradeId = gradeId === "kindergarten" ? "k" : gradeId;
  return GRADE_CONFIG.find((grade) => grade.id === canonicalGradeId);
}

function getPayrollGradeLabel(gradeId: string): string {
  return getGradeConfigForPayrollGrade(gradeId)?.name ?? gradeId.toUpperCase();
}

function getPayrollGradeSortIndex(gradeId: string): number {
  const canonicalGradeId = gradeId === "kindergarten" ? "k" : gradeId;
  const index = GRADE_CONFIG.findIndex((grade) => grade.id === canonicalGradeId);
  return index === -1 ? 999 : index;
}

function educatorTierAnnualCost(tierId: PayrollEducatorTierId, year: number, withBenefits: boolean): number {
  const tier = EDUCATOR_LEVELS.find((level) => level.id === tierId) ?? EDUCATOR_LEVELS.find((level) => level.id === "master")!;
  const salary = salaryMonthlyForYear(toSalaryBase2028(tier.grossMonthly), year);
  const labor = laborChargesMonthlyForSalary(salary);
  const benefits = benefitsMonthlyForYear(toBenefitsBase2028(tier.benefitsMonthly), year);
  return (salary + labor) * 13 + (withBenefits ? benefits * 12 : 0);
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function linePath(points: readonly { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function formatSignedCurrency(delta: number, locale: "pt-BR" | "en-US") {
  if (Math.abs(delta) < 0.005) return locale === "pt-BR" ? "igual à referência" : "same as reference";
  const sign = delta > 0 ? "+" : "-";
  return `${sign}${formatCurrencyBRL(Math.abs(delta), locale)}`;
}

function formatSignedNumber(delta: number, locale: "pt-BR" | "en-US") {
  if (delta === 0) return locale === "pt-BR" ? "igual à referência" : "same as reference";
  return `${delta > 0 ? "+" : ""}${formatNumber(delta, locale)}`;
}

interface PayrollProjectionTabProps {
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly onOpeningPackageIdChange: (id: ActiveOpeningPackageId) => void;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly onOccupancyScenarioIdChange: (id: OccupancyScenarioId) => void;
  readonly tuitionScenarioId: TuitionScenarioId;
  readonly onTuitionScenarioIdChange: (id: TuitionScenarioId) => void;
  readonly orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  readonly onOrgDesignOptionIdChange: (id: DreWorkingScenarioOrgDesignOptionId) => void;
  readonly educatorTierSelection: UseEducatorTierSelectionResult;
}

const PayrollProjectionTab = ({
  openingPackageId,
  onOpeningPackageIdChange,
  occupancyScenarioId,
  onOccupancyScenarioIdChange,
  tuitionScenarioId,
  onTuitionScenarioIdChange,
  orgDesignOptionId,
  onOrgDesignOptionIdChange,
  educatorTierSelection,
}: PayrollProjectionTabProps) => {
  const { t, locale } = useLocale();
  const [selectedYear, setSelectedYear] = useState<OpeningPackageDirectWorkbookYear>(2028);
  const [view, setView] = useState<"single" | "compare" | "matrix">("single");
  const [chartMetric, setChartMetric] = useState<PayrollDashboardMetricId>("all");
  const [expandFolha, setExpandFolha] = useState(false);
  const [showOperationalDetail, setShowOperationalDetail] = useState(false);
  const [marginMode, setMarginMode] = useState<"FULLY_LOADED" | "WITHOUT_BENEFITS">("FULLY_LOADED");
  const withBenefits = marginMode === "FULLY_LOADED";

  const educatorTierByGrade = useMemo(
    () =>
      educatorTierSelection.getEducatorTierByGradeForScenario(
        openingPackageId,
        occupancyScenarioId,
        orgDesignOptionId,
      ),
    [educatorTierSelection, openingPackageId, occupancyScenarioId, orgDesignOptionId],
  );

  const setTierForGrade = (gradeId: string, tierId: PayrollEducatorTierId) => {
    educatorTierSelection.setEducatorTier(
      {
        openingPackageId,
        occupancyScenarioId,
        orgDesignOptionId,
        gradeId,
      },
      tierId,
    );
  };

  const setTierForSalaryRows = (tierForGrade: (grade: { readonly gradeId: string; readonly division: PayrollEducatorDivision }) => PayrollEducatorTierId) => {
    for (const grade of salaryTierGradeRows) {
      setTierForGrade(grade.gradeId, tierForGrade({ gradeId: grade.gradeId, division: grade.division }));
    }
  };

  const clearTierScenario = () => {
    educatorTierSelection.clearEducatorTierSelectionsForScenario(
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
    );
  };

  const fopagOutput = useMemo(
    () => calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId, educatorTierByGrade }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, educatorTierByGrade],
  );
  const dreOutput = useMemo(
    () => calculateDre({ openingPackageId, occupancyScenarioId, orgDesignOptionId, tuitionScenarioId, educatorTierByGrade }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, tuitionScenarioId, educatorTierByGrade],
  );
  const baselineFopagOutput = useMemo(
    () => calculateFopag({
      openingPackageId,
      occupancyScenarioId: "base",
      orgDesignOptionId: "balanced_experience",
    }),
    [openingPackageId],
  );
  const baselineDreOutput = useMemo(
    () => calculateDre({
      openingPackageId,
      occupancyScenarioId: "base",
      tuitionScenarioId: "bp1_division_differentiated",
      orgDesignOptionId: "balanced_experience",
    }),
    [openingPackageId],
  );

  // ── Per-year aggregates, sourced entirely from calculateFopag()/calculateDre() ──
  const yearlyData = useMemo(() => {
    return PAYROLL_YEARS.map((year) => {
      const yt = fopagOutput.yearTotals.find((total) => total.year === year);
      const dreYear = dreOutput.byYear[year];
      const leadershipAnnual = yt?.byRoleSourceType.find((r) => r.roleSourceType === "baseline_leadership")?.totalPayroll ?? 0;
      const backofficeAnnual = yt?.byRoleSourceType.find((r) => r.roleSourceType === "baseline_backoffice")?.totalPayroll ?? 0;
      const specialistsAnnual = yt?.byRoleSourceType
        .filter((r) => r.roleSourceType === "baseline_specialist" || r.roleSourceType === "extension_new_role" || r.roleSourceType === "extension_alias")
        .reduce((sum, r) => sum + r.totalPayroll, 0);
      const totalTurmas = dreYear.numero_de_turmas;
      const totalRevenueAnnual = dreYear.receita_operacional_liquida;
      const grandTotal = withBenefits ? yt?.totalPayroll ?? 0 : (yt?.fopagDireto ?? 0) + (yt?.folhaDireta ?? 0);
      return {
        year,
        totalStudents: dreYear.numero_de_alunos,
        totalTurmas,
        fopagDiretoAnnual: yt?.fopagDireto ?? 0,
        beneficiosAnnual: yt?.benefits ?? 0,
        folhaDiretaAnnual: yt?.folhaDireta ?? 0,
        leadershipAnnual,
        backofficeAnnual,
        specialistsAnnual,
        grandTotal,
        totalRevenueAnnual,
        marginAnnual: totalRevenueAnnual - grandTotal,
        contributionMarginAnnual: dreYear.margem_de_contribuicao,
        contributionMarginPct:
          totalRevenueAnnual === 0 ? null : dreYear.margem_de_contribuicao / totalRevenueAnnual,
        directCostsAnnual: dreYear.total_custo_direto,
        payrollAndBenefitsAnnual: dreYear.folha_de_pagamento + dreYear.beneficios,
        fixedAndSalesExPayrollAnnual:
          dreYear.total_custos_e_despesas_fixas +
          dreYear.total_despesas_com_vendas -
          dreYear.folha_de_pagamento -
          dreYear.beneficios,
        coverageRatio: grandTotal > 0 ? totalRevenueAnnual / grandTotal : 0,
      };
    });
  }, [fopagOutput, dreOutput, withBenefits]);

  const selectedYearData = yearlyData.find((yd) => yd.year === selectedYear);
  const selectedDreYear = dreOutput.byYear[selectedYear];
  const decisionCopy =
    locale === "pt-BR"
      ? {
          title: "Visão de decisão: turmas, alunos, folha e margem",
          subtitle: "Receita líquida e custos diretos seguem o bloco PnL 222-247; a linha cruza a Margem de Contribuição.",
          purposeLabel: "Objetivo do tab",
          purposeTitle: "Testar se o cenário DRE sustenta a FOPAG",
          purposeSubtitle:
            "Escolha o cenário governado da DRE, leia se ele paga a FOPAG, simule tiers EY/LS por série e compare estratégias de folha contra essa mesma margem.",
          governedDreLabel: "Motor governado",
          governedDreText: "DRE/FOPAG oficial: alunos, turmas, receita, folha e margem pelo modelo aprovado.",
          simulatedEyLsLabel: "Simulação EY/LS",
          simulatedEyLsText: "Tiers por série mudam apenas a lente de decisão; não reescrevem a DRE governada.",
          workflowLabel: "Fluxo de uso",
          workflowStepScenario: "Escolha o cenário DRE governado",
          workflowStepAfford: "Veja se a margem suporta a FOPAG",
          workflowStepSimulate: "Simule tiers EY/LS por série",
          workflowStepCompare: "Compare estratégias de FOPAG",
          workflowStepValidate: "Abra o detalhe só para validar",
          boundaryWarning: "Limite do modelo",
          msHsLockedText: "MS/HS ficam bloqueados para tier por série até reconciliação de alocação docente por grade.",
          fopagDireto: "FOPAG Direto",
          folhaPagamento: "Folha de Pagamento",
          turmas: "Turmas",
          alunos: "Alunos",
          netRevenue: "Receita líquida",
          contributionMargin: "Margem de contribuição",
          cmv: "CMV",
          directFopag: "FOPAG direto",
          otherDirectCosts: "Outros custos diretos",
          vsBaseline: "contra referência",
          liveScenario: "Cenário ativo",
          modelBehavior:
            "No motor atual, captação move alunos/turmas/receita; mensalidade move receita/margem; desenho organizacional move folha direta e benefícios. O FOPAG direto usa tiers docentes fixos por fonte e só muda quando turmas ou ativações docentes mudam.",
          sourceNote:
            "Margem de Contribuição = PnL row 247 = Receita Operacional Líquida + CMV + Total Custo Direto. Despesas fixas e vendas explicam EBITDA, não esta margem.",
          baselineLabel: "referência Base / BP1 / Balanceado",
          controllerLabel: "Painel de controle",
          scenarioLevers: "Alavancas do cenário",
          decisionMode: "Modo de decisão",
          projectionYears: "Anos da projeção",
          chartFocus: "Foco do gráfico",
          allMetrics: "Todos",
          chartBarsLabel: "Barras verdes = Receita líquida",
          chartCostStackLabel: "Barras abaixo do eixo = CMV + FOPAG direto + outros custos",
          chartLineLabel: "Linha preta = Margem de contribuição",
          zeroAxisLabel: "Eixo zero",
          salaryMixTitle: "Simulador EY/LS de tiers docentes por série",
          salaryMixSubtitle: "Escolha tiers por série em Early Years e Lower School para comparar pressão de FOPAG. MS/HS ficam no motor governado até a reconciliação por série.",
          governedTier: "Custo governado",
          simulatedTier: "Custo simulado",
          leadFte: "FTE docente",
          supportFte: "Apoio",
          simulatedDelta: "Delta simulado",
          currentEngine: "Motor atual",
          analysisLens: "Lente de análise",
          tierDistribution: "Distribuição do mix",
          scenarioComparison: "Comparação de cenários FOPAG",
          selectedMix: "Mix selecionado",
          governedMix: "Motor governado",
          leanMix: "Disciplina de custo",
          tieredMix: "Escalonado por etapa",
          premiumMix: "Experiência premium",
          approvedQuality: "Referência governada da DRE",
          qualityRisk: "Estratégia alternativa: custo mínimo",
          stagedRisk: "Estratégia alternativa: EY menor, LS médio",
          premiumRisk: "Estratégia alternativa: experiência premium",
          selectedRisk: "Estratégia simulada manualmente",
          lowestFopag: "Menor FOPAG",
          bestMargin: "Maior margem",
          leadCost: "Custo docente EY/LS",
          contributionAfterMix: "Margem após mix",
          affectedGrades: "Séries alteradas",
          activeGrades: "Séries ativas",
          operationalDetail: "Detalhe operacional governado",
          showOperationalDetail: "Mostrar detalhe operacional",
          hideOperationalDetail: "Ocultar detalhe operacional",
          detailHint: "Drill-down do ano e cenário governado selecionados: projeção anual, panorama por divisão e detalhe por série. A simulação EY/LS fica no painel acima.",
        }
      : {
          title: "Decision view: sections, learners, payroll, and margin",
          subtitle: "Net revenue and direct costs follow the PnL 222-247 block; the line plots contribution margin.",
          purposeLabel: "Tab objective",
          purposeTitle: "Test whether the DRE scenario can afford FOPAG",
          purposeSubtitle:
            "Choose the governed DRE scenario, read whether it funds FOPAG, simulate EY/LS tiers by grade, and compare payroll strategies against that same margin.",
          governedDreLabel: "Governed engine",
          governedDreText: "Official DRE/FOPAG: learners, sections, revenue, payroll, and margin from the approved model.",
          simulatedEyLsLabel: "EY/LS simulation",
          simulatedEyLsText: "Grade tiers change only the decision lens; they do not rewrite governed DRE.",
          workflowLabel: "How to use",
          workflowStepScenario: "Choose the governed DRE scenario",
          workflowStepAfford: "See whether margin supports FOPAG",
          workflowStepSimulate: "Simulate EY/LS tiers by grade",
          workflowStepCompare: "Compare FOPAG strategies",
          workflowStepValidate: "Open detail only to validate",
          boundaryWarning: "Model limit",
          msHsLockedText: "MS/HS stay locked for grade-level tiers until educator allocation is reconciled by grade.",
          fopagDireto: "Direct FOPAG",
          folhaPagamento: "Payroll",
          turmas: "Sections",
          alunos: "Learners",
          netRevenue: "Net revenue",
          contributionMargin: "Contribution margin",
          cmv: "COGS",
          directFopag: "Direct FOPAG",
          otherDirectCosts: "Other direct costs",
          vsBaseline: "against reference",
          liveScenario: "Active scenario",
          modelBehavior:
            "In the current engine, enrollment moves learners/sections/revenue; tuition moves revenue/margin; org design moves direct payroll and benefits. Direct FOPAG uses fixed educator tiers from source data and changes only when sections or teaching activations change.",
          sourceNote:
            "Contribution margin = PnL row 247 = Net Operating Revenue + COGS + Total Direct Cost. Fixed and selling expenses explain EBITDA, not this margin.",
          baselineLabel: "Base / BP1 / Balanced reference",
          controllerLabel: "Control panel",
          scenarioLevers: "Scenario levers",
          decisionMode: "Decision mode",
          projectionYears: "Projection years",
          chartFocus: "Chart focus",
          allMetrics: "All",
          chartBarsLabel: "Green bars = net revenue",
          chartCostStackLabel: "Bars below axis = COGS + direct FOPAG + other costs",
          chartLineLabel: "Black line = contribution margin",
          zeroAxisLabel: "Zero axis",
          salaryMixTitle: "EY/LS educator tier simulator by grade",
          salaryMixSubtitle: "Choose tiers by Early Years and Lower School grade to compare FOPAG pressure. MS/HS stay on the governed engine until grade-level reconciliation.",
          governedTier: "Governed cost",
          simulatedTier: "Simulated cost",
          leadFte: "Educator FTE",
          supportFte: "Support",
          simulatedDelta: "Simulated delta",
          currentEngine: "Current engine",
          analysisLens: "Analysis lens",
          tierDistribution: "Mix distribution",
          scenarioComparison: "FOPAG scenario comparison",
          selectedMix: "Selected mix",
          governedMix: "Governed engine",
          leanMix: "Cost discipline",
          tieredMix: "Stage-based mix",
          premiumMix: "Premium experience",
          approvedQuality: "Governed DRE reference",
          qualityRisk: "Alternative strategy: minimum cost",
          stagedRisk: "Alternative strategy: lower EY, mid LS",
          premiumRisk: "Alternative strategy: premium experience",
          selectedRisk: "Manually simulated strategy",
          lowestFopag: "Lowest FOPAG",
          bestMargin: "Best margin",
          leadCost: "EY/LS educator cost",
          contributionAfterMix: "Margin after mix",
          affectedGrades: "Changed grades",
          activeGrades: "Active grades",
          operationalDetail: "Governed operational detail",
          showOperationalDetail: "Show operational detail",
          hideOperationalDetail: "Hide operational detail",
          detailHint: "Drill-down for the selected governed year and scenario: annual projection, division snapshot, and grade detail. The EY/LS simulation stays in the panel above.",
        };
  const decisionChartData = PAYROLL_YEARS.map((chartYear) => {
    const dreYear = dreOutput.byYear[chartYear];
    return {
      year: chartYear,
      netRevenue: dreYear.receita_operacional_liquida,
      contributionMargin: dreYear.margem_de_contribuicao,
      cmv: dreYear.custo_da_mercadoria_vendida,
      directFopag: dreYear.fopag_direto_clt_pj,
      otherDirectCosts:
        dreYear.eventos_seb +
        dreYear.certificacoes +
        dreYear.custos_com_alimentacao +
        dreYear.materiais_pedagogicos,
    };
  });
  const chartMax = Math.max(
    1,
    ...decisionChartData.flatMap((row) => [
      Math.abs(row.netRevenue),
      Math.abs(row.contributionMargin),
      Math.abs(row.cmv) + Math.abs(row.directFopag) + Math.abs(row.otherDirectCosts),
    ]),
  );
  const chartZeroY = 152;
  const chartScale = 112 / chartMax;
  const chartBarWidth = 34;
  const contributionPoints = decisionChartData.map((row, index) => ({
    x: 38 + index * 66 + chartBarWidth / 2,
    y: chartZeroY - row.contributionMargin * chartScale,
  }));
  const focusedChartRows = yearlyData.map((row) => {
    const dreYear = dreOutput.byYear[row.year];
    const values: Record<Exclude<PayrollDashboardMetricId, "all">, number> = {
      fopagDireto: row.fopagDiretoAnnual,
      folhaPagamento: Math.abs(dreYear.folha_de_pagamento),
      netRevenue: row.totalRevenueAnnual,
      contributionMargin: row.contributionMarginAnnual,
      turmas: row.totalTurmas,
      alunos: row.totalStudents,
    };
    return {
      year: row.year,
      value: chartMetric === "all" ? row.contributionMarginAnnual : values[chartMetric],
    };
  });
  const focusedChartMax = Math.max(1, ...focusedChartRows.map((row) => Math.abs(row.value)));
  const focusedChartScale = 186 / focusedChartMax;
  const focusedChartColor = PAYROLL_DASHBOARD_METRIC_COLORS[chartMetric];
  const focusedChartPoints = focusedChartRows.map((row, index) => ({
    x: 38 + index * 66 + chartBarWidth / 2,
    y: clamp(chartZeroY - row.value * focusedChartScale, 34, 258),
  }));
  const selectedDecisionKpis = selectedYearData
    ? (() => {
        const baselineDreYear = baselineDreOutput.byYear[selectedYear];
        const baselineFopagYear = baselineFopagOutput.yearTotals.find((total) => total.year === selectedYear);
        return [
        {
          id: "fopagDireto" as const,
          label: decisionCopy.fopagDireto,
          value: formatCurrencyBRL(selectedYearData.fopagDiretoAnnual, locale),
          delta: formatSignedCurrency(selectedYearData.fopagDiretoAnnual - (baselineFopagYear?.fopagDireto ?? 0), locale),
          tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
        },
        {
          id: "folhaPagamento" as const,
          label: decisionCopy.folhaPagamento,
          value: formatCurrencyBRL(Math.abs(selectedDreYear.folha_de_pagamento), locale),
          delta: formatSignedCurrency(Math.abs(selectedDreYear.folha_de_pagamento) - Math.abs(baselineDreYear.folha_de_pagamento), locale),
          tone: "border-amber-200 bg-amber-50 text-amber-800",
        },
        {
          id: "netRevenue" as const,
          label: decisionCopy.netRevenue,
          value: formatCurrencyBRL(selectedDreYear.receita_operacional_liquida, locale),
          delta: formatSignedCurrency(selectedDreYear.receita_operacional_liquida - baselineDreYear.receita_operacional_liquida, locale),
          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
        },
        {
          id: "contributionMargin" as const,
          label: decisionCopy.contributionMargin,
          value: formatCurrencyBRL(selectedDreYear.margem_de_contribuicao, locale),
          delta: formatSignedCurrency(selectedDreYear.margem_de_contribuicao - baselineDreYear.margem_de_contribuicao, locale),
          tone: "border-teal-200 bg-teal-50 text-teal-800",
        },
        {
          id: "turmas" as const,
          label: decisionCopy.turmas,
          value: formatNumber(selectedYearData.totalTurmas, locale),
          delta: formatSignedNumber(selectedYearData.totalTurmas - baselineDreYear.numero_de_turmas, locale),
          tone: "border-slate-200 bg-white text-slate-900",
        },
        {
          id: "alunos" as const,
          label: decisionCopy.alunos,
          value: formatNumber(selectedYearData.totalStudents, locale),
          delta: formatSignedNumber(selectedYearData.totalStudents - baselineDreYear.numero_de_alunos, locale),
          tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
        },
      ];
      })()
    : [];
  const salaryTierGradeRows = fopagOutput.records
    .filter((record) => {
      const division = resolveEducatorDivision(record);
      return (
        record.year === selectedYear &&
        !record.isAuditRow &&
        record.headcountOrFte > 0 &&
        isTeachingLeadRecord(record) &&
        (division === "Early Years" || division === "Lower School")
      );
    })
    .map((record) => {
      const gradeId = extractEducatorGradeId(record) ?? record.roleId;
      const division = resolveEducatorDivision(record) ?? "Early Years";
      const simulatedTierId = educatorTierByGrade[gradeId] ?? "master";
      const governedLeadCost = record.grossLaborAnnualAfterGrowth + (withBenefits ? record.benefitsAnnualAfterGrowth : 0);
      const simulatedLeadCost =
        simulatedTierId === "master"
          ? governedLeadCost
          : record.headcountOrFte * educatorTierAnnualCost(simulatedTierId, selectedYear, withBenefits);
      return {
        gradeId,
        gradeLabel: getPayrollGradeLabel(gradeId),
        division,
        leadFte: record.headcountOrFte,
        governedLeadCost,
        simulatedTierId,
        simulatedLeadCost,
        delta: simulatedLeadCost - governedLeadCost,
      };
    })
    .sort((a, b) => getPayrollGradeSortIndex(a.gradeId) - getPayrollGradeSortIndex(b.gradeId));
  const governedEyLsLeadCost = salaryTierGradeRows.reduce((sum, row) => sum + row.governedLeadCost, 0);
  const simulatedEyLsLeadCost = salaryTierGradeRows.reduce((sum, row) => sum + row.simulatedLeadCost, 0);
  const simulatedEyLsDelta = simulatedEyLsLeadCost - governedEyLsLeadCost;
  const changedGradeCount = salaryTierGradeRows.filter((row) => row.simulatedTierId !== "master").length;
  const salaryTierDistributionRows = EDUCATOR_LEVELS.map((tier) => {
    const leadFte = salaryTierGradeRows
      .filter((row) => row.simulatedTierId === tier.id)
      .reduce((sum, row) => sum + row.leadFte, 0);
    const cost = salaryTierGradeRows
      .filter((row) => row.simulatedTierId === tier.id)
      .reduce((sum, row) => sum + row.simulatedLeadCost, 0);
    const totalFte = salaryTierGradeRows.reduce((sum, row) => sum + row.leadFte, 0);
    return {
      tier,
      leadFte,
      cost,
      pct: totalFte > 0 ? leadFte / totalFte : 0,
    };
  });
  const distributionGradient = (() => {
    const totalFte = salaryTierDistributionRows.reduce((sum, row) => sum + row.leadFte, 0);
    if (totalFte <= 0) return "conic-gradient(#e2e8f0 0deg 360deg)";
    let cursor = 0;
    const segments = salaryTierDistributionRows
      .filter((row) => row.leadFte > 0)
      .map((row) => {
        const start = cursor;
        const end = cursor + row.pct * 360;
        cursor = end;
        return `${PAYROLL_EDUCATOR_TIER_COLORS[row.tier.id as PayrollEducatorTierId]} ${start}deg ${end}deg`;
      });
    return `conic-gradient(${segments.join(", ")})`;
  })();
  const computeGradeMixCost = (resolveTier: (row: (typeof salaryTierGradeRows)[number]) => PayrollEducatorTierId) =>
    salaryTierGradeRows.reduce((sum, row) => {
      const tierId = resolveTier(row);
      return sum + (tierId === "master" ? row.governedLeadCost : row.leadFte * educatorTierAnnualCost(tierId, selectedYear, withBenefits));
    }, 0);
  const scenarioComparisonRows = selectedDreYear
    ? (() => {
        const buildRow = (id: string, label: string, mix: string, risk: string, leadCost: number) => {
          const delta = leadCost - governedEyLsLeadCost;
          return {
            id,
            label,
            mix,
            risk,
            leadCost,
            delta,
            contributionMargin: selectedDreYear.margem_de_contribuicao - delta,
          };
        };
        const rows = [
          buildRow(decisionCopy.governedMix, decisionCopy.governedMix, "Master EY/LS", decisionCopy.approvedQuality, governedEyLsLeadCost),
          buildRow(
            decisionCopy.selectedMix,
            decisionCopy.selectedMix,
            changedGradeCount === 0
              ? (locale === "pt-BR" ? "Sem alterações" : "No overrides")
              : `${changedGradeCount} ${decisionCopy.affectedGrades.toLowerCase()}`,
            decisionCopy.selectedRisk,
            simulatedEyLsLeadCost,
          ),
          buildRow(decisionCopy.leanMix, decisionCopy.leanMix, "Associate EY/LS", decisionCopy.qualityRisk, computeGradeMixCost(() => "associate")),
          buildRow(
            decisionCopy.tieredMix,
            decisionCopy.tieredMix,
            locale === "pt-BR" ? "EY Associate · LS Specialist" : "EY Associate · LS Specialist",
            decisionCopy.stagedRisk,
            computeGradeMixCost((row) => (row.division === "Early Years" ? "associate" : "specialist")),
          ),
          buildRow(decisionCopy.premiumMix, decisionCopy.premiumMix, "Inspirational EY/LS", decisionCopy.premiumRisk, computeGradeMixCost(() => "inspirational")),
        ];
        const lowestLeadCost = Math.min(...rows.map((row) => row.leadCost));
        const bestContributionMargin = Math.max(...rows.map((row) => row.contributionMargin));
        return rows.map((row) => ({
          ...row,
          hasLowestFopag: Math.abs(row.leadCost - lowestLeadCost) < 0.01,
          hasBestMargin: Math.abs(row.contributionMargin - bestContributionMargin) < 0.01,
        }));
      })()
    : [];
  const selectedScenarioComparison = scenarioComparisonRows.find((row) => row.id === decisionCopy.selectedMix);
  const chartMetricLabel =
    chartMetric === "all"
      ? decisionCopy.allMetrics
      : chartMetric === "fopagDireto"
        ? decisionCopy.directFopag
        : chartMetric === "folhaPagamento"
          ? decisionCopy.folhaPagamento
          : chartMetric === "netRevenue"
            ? decisionCopy.netRevenue
            : chartMetric === "contributionMargin"
              ? decisionCopy.contributionMargin
              : chartMetric === "turmas"
                ? decisionCopy.turmas
                : decisionCopy.alunos;

  // ── Grade-level (instructional) and non-instructional headcount, from the SAME
  // buildOrgDesignHcTable() Org Design already uses — parity by construction. ──
  const hcTableResult = useMemo(
    () => buildOrgDesignHcTable({ openingPackageId, occupancyScenarioId, orgDesignOptionId, year: selectedYear }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, selectedYear],
  );
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
      const out = id === orgDesignOptionId
        ? dreOutput
        : calculateDre({
            openingPackageId,
            occupancyScenarioId,
            tuitionScenarioId,
            orgDesignOptionId: id,
            educatorTierByGrade: educatorTierSelection.getEducatorTierByGradeForScenario(
              openingPackageId,
              occupancyScenarioId,
              id,
            ),
          });
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
      <Card
        title={decisionCopy.title}
        icon={TrendingUp}
        subtitle={`${decisionCopy.subtitle} ${PROJECTION_YEAR_RANGE_LABEL}.`}
      >
        <div className="mb-4 flex justify-end">
          <WorksheetSyncStamp />
        </div>
        <div className="mb-4 rounded-2xl border border-white/80 bg-slate-50/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.purposeLabel}</div>
              <div className="mt-2 text-xl font-black leading-tight text-slate-950">{decisionCopy.purposeTitle}</div>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-600">{decisionCopy.purposeSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{decisionCopy.governedDreLabel}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{decisionCopy.governedDreText}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white/80 p-3 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">{decisionCopy.simulatedEyLsLabel}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{decisionCopy.simulatedEyLsText}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-3 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-indigo-700">{decisionCopy.workflowLabel}</div>
              <div className="mt-2 grid grid-cols-1 gap-1.5 text-[11px] font-bold text-slate-600">
                {[
                  decisionCopy.workflowStepScenario,
                  decisionCopy.workflowStepAfford,
                  decisionCopy.workflowStepSimulate,
                  decisionCopy.workflowStepCompare,
                  decisionCopy.workflowStepValidate,
                ].map((step, index) => (
                  <div key={step} className="flex items-center gap-2 rounded-lg bg-slate-50/80 px-2 py-1.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[9px] font-black text-indigo-700">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.boundaryWarning}</div>
                <div className="mt-1 text-[11px] leading-relaxed text-slate-600">{decisionCopy.msHsLockedText}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {decisionCopy.scenarioLevers}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-slate-400">{t("payrollSharedOpeningPackageLabel")}</span>
                <select
                  value={openingPackageId}
                  onChange={(event) => onOpeningPackageIdChange(event.target.value as ActiveOpeningPackageId)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-800"
                >
                  {ACTIVE_OPENING_PACKAGE_IDS.map((id) => (
                    <option key={id} value={id}>
                      {OPENING_PACKAGE_LABELS[id]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-slate-400">{t("payrollSharedCaptacaoLabel")}</span>
                <select
                  value={occupancyScenarioId}
                  onChange={(event) => onOccupancyScenarioIdChange(event.target.value as OccupancyScenarioId)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-black text-slate-800"
                >
                  {OCCUPANCY_SCENARIO_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(OCCUPANCY_LABEL_KEYS[id])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-amber-500">{t("payrollSharedTuitionLabel")}</span>
                <select
                  value={tuitionScenarioId}
                  onChange={(event) => onTuitionScenarioIdChange(event.target.value as TuitionScenarioId)}
                  className="h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-xs font-black text-amber-800"
                >
                  {DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.map((id) => (
                    <option key={id} value={id}>
                      {TUITION_LABELS[id] ?? id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{t("payrollOrgDesignTierLabel")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
                    <button
                      type="button"
                      key={id}
                      aria-pressed={orgDesignOptionId === id}
                      onClick={() => onOrgDesignOptionIdChange(id)}
                      className={cn(
                        "h-8 rounded-lg border px-2.5 text-[10px] font-bold transition-all",
                        orgDesignOptionId === id ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
                      )}
                    >
                      {t(ORG_DESIGN_LABEL_KEYS[id])}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{t("payrollCostModeLabel")}</div>
                <button
                  type="button"
                  aria-pressed={!withBenefits}
                  onClick={() => setMarginMode((p) => (p === "FULLY_LOADED" ? "WITHOUT_BENEFITS" : "FULLY_LOADED"))}
                  className="flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5"
                >
                  <span className={cn("text-[10px] font-bold", withBenefits ? "text-indigo-700" : "text-slate-400")}>{t("payrollWithBenefitsLabel")}</span>
                  <span className={cn("relative inline-flex h-4 w-8 rounded-full", !withBenefits ? "bg-indigo-600" : "bg-slate-200")}>
                    <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition", !withBenefits ? "left-4" : "left-0.5")} />
                  </span>
                  <span className={cn("text-[10px] font-bold", !withBenefits ? "text-indigo-700" : "text-slate-400")}>{t("payrollWithoutBenefitsLabel")}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.decisionMode}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["single", "compare", "matrix"] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "h-8 rounded-lg border px-2 text-[10px] font-bold transition-all",
                    view === v ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
                  )}
                >
                  {v === "single" ? t("payrollViewSingleLabel") : v === "compare" ? t("payrollViewCompareLabel") : t("payrollView9ScenariosLabel")}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">{decisionCopy.projectionYears}</div>
              <div className="grid grid-cols-5 gap-1">
                {PAYROLL_YEARS.map((y) => (
                  <button
                    type="button"
                    key={y}
                    aria-pressed={selectedYear === y}
                    onClick={() => setSelectedYear(y)}
                    className={cn(
                      "h-7 rounded-md border text-[9px] font-bold transition-all",
                      selectedYear === y ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-slate-400",
                    )}
                  >
                    {String(y).slice(2)}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadProjectionTable}
              className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-[10px] font-bold text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              <Download className="h-3.5 w-3.5" />
              {t("payrollDownloadXlsxLabel")}
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.liveScenario}</span>
          {[
            OPENING_PACKAGE_LABELS[openingPackageId],
            t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId]),
            TUITION_LABELS[tuitionScenarioId] ?? tuitionScenarioId,
            t(ORG_DESIGN_LABEL_KEYS[orgDesignOptionId]),
            String(selectedYear),
          ].map((label) => (
            <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700">
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {selectedDecisionKpis.map((kpi) => (
            <button
              type="button"
              key={kpi.label}
              aria-pressed={chartMetric === kpi.id}
              onClick={() => setChartMetric(kpi.id)}
              className={cn(
                "group rounded-2xl border px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                chartMetric === kpi.id && "ring-2 ring-indigo-500 ring-offset-2",
                kpi.tone,
              )}
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{kpi.label}</div>
              <div className="mt-2 text-lg font-black leading-tight tabular-nums break-words transition-transform duration-200 group-hover:translate-x-0.5">{kpi.value}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">{selectedYear}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 tracking-normal",
                  kpi.delta === "igual à referência" || kpi.delta === "same as reference"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-white/70 text-slate-800",
                )}>
                  {kpi.delta === "igual à referência" || kpi.delta === "same as reference"
                    ? kpi.delta
                    : `${kpi.delta} ${decisionCopy.vsBaseline}`}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.chartFocus}</span>
            {([
              ["all", decisionCopy.allMetrics],
              ["netRevenue", decisionCopy.netRevenue],
              ["contributionMargin", decisionCopy.contributionMargin],
              ["fopagDireto", decisionCopy.directFopag],
              ["folhaPagamento", decisionCopy.folhaPagamento],
              ["turmas", decisionCopy.turmas],
              ["alunos", decisionCopy.alunos],
            ] as const).map(([id, label]) => (
              <button
                type="button"
                key={id}
                aria-pressed={chartMetric === id}
                onClick={() => setChartMetric(id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                  chartMetric === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-400",
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PAYROLL_DASHBOARD_METRIC_COLORS[id] }}
                />
                {label}
              </button>
            ))}
          </div>
          <div className="mb-3 grid grid-cols-1 gap-2 text-[10px] font-bold text-slate-600 md:grid-cols-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              {decisionCopy.chartBarsLabel}
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              {decisionCopy.chartCostStackLabel}
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="h-0.5 w-5 rounded-full bg-slate-900" />
              {decisionCopy.chartLineLabel}
            </div>
          </div>
          <svg viewBox="0 0 700 300" className="min-w-[680px] w-full" role="img" aria-label={decisionCopy.title}>
            <line x1="24" y1={chartZeroY} x2="680" y2={chartZeroY} stroke="#94a3b8" strokeWidth="1.25" />
            <line x1="24" y1="40" x2="680" y2="40" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="24" y1="264" x2="680" y2="264" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 5" />
            <text x="626" y={chartZeroY - 6} textAnchor="end" className="fill-slate-400 text-[9px] font-bold uppercase tracking-widest">
              {decisionCopy.zeroAxisLabel}
            </text>

            {chartMetric === "all" ? (
              <>
                {decisionChartData.map((row, index) => {
                  if (row.year !== selectedYear) return null;
                  const x = 38 + index * 66;
                  return (
                    <rect
                      key={`selected-${row.year}`}
                      x={x - 7}
                      y="30"
                      width={chartBarWidth + 14}
                      height="244"
                      rx="8"
                      fill="#eef2ff"
                      stroke="#6366f1"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {decisionChartData.map((row, index) => {
                  const x = 38 + index * 66;
                  const revenueHeight = Math.abs(row.netRevenue) * chartScale;
                  const cmvHeight = Math.abs(row.cmv) * chartScale;
                  const fopagHeight = Math.abs(row.directFopag) * chartScale;
                  const otherDirectHeight = Math.abs(row.otherDirectCosts) * chartScale;
                  const cmvY = chartZeroY;
                  const fopagY = cmvY + cmvHeight;
                  const otherDirectY = fopagY + fopagHeight;
                  const selected = row.year === selectedYear;
                  return (
                    <g
                      key={row.year}
                      tabIndex={0}
                      role="button"
                      aria-label={`${row.year}`}
                      onClick={() => setSelectedYear(row.year)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelectedYear(row.year);
                      }}
                      className={cn(
                        "cursor-pointer outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:opacity-90",
                        selected ? "opacity-100" : "opacity-75",
                      )}
                    >
                      <rect
                        x={x}
                        y={chartZeroY - revenueHeight}
                        width={chartBarWidth}
                        height={revenueHeight}
                        rx="4"
                        fill="#10b981"
                        className="transition-all duration-300 hover:brightness-110"
                      >
                        <title>{`${decisionCopy.netRevenue} ${row.year}: ${formatCurrencyBRL(row.netRevenue, locale)}`}</title>
                      </rect>
                      <rect x={x} y={cmvY} width={chartBarWidth} height={cmvHeight} rx="3" fill="#f97316" className="transition-all duration-300 hover:brightness-110">
                        <title>{`${decisionCopy.cmv} ${row.year}: ${formatCurrencyBRL(row.cmv, locale)}`}</title>
                      </rect>
                      <rect x={x} y={fopagY} width={chartBarWidth} height={fopagHeight} rx="3" fill="#6366f1" className="transition-all duration-300 hover:brightness-110">
                        <title>{`${decisionCopy.directFopag} ${row.year}: ${formatCurrencyBRL(row.directFopag, locale)}`}</title>
                      </rect>
                      <rect x={x} y={otherDirectY} width={chartBarWidth} height={otherDirectHeight} rx="3" fill="#94a3b8" className="transition-all duration-300 hover:brightness-110">
                        <title>{`${decisionCopy.otherDirectCosts} ${row.year}: ${formatCurrencyBRL(row.otherDirectCosts, locale)}`}</title>
                      </rect>
                      <text x={x + chartBarWidth / 2} y="286" textAnchor="middle" className={cn("fill-slate-500 text-[10px] font-semibold", selected && "fill-indigo-700 font-black")}>
                        {String(row.year).slice(2)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={linePath(contributionPoints)}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                <text
                  x={Math.min(650, contributionPoints[contributionPoints.length - 1].x + 16)}
                  y={Math.max(48, contributionPoints[contributionPoints.length - 1].y - 10)}
                  textAnchor="end"
                  className="fill-slate-900 text-[10px] font-black"
                >
                  {decisionCopy.contributionMargin}
                </text>
                <text x="640" y="58" textAnchor="end" className="fill-emerald-700 text-[10px] font-black">
                  {decisionCopy.netRevenue}
                </text>
                <text x="640" y="244" textAnchor="end" className="fill-indigo-700 text-[10px] font-black">
                  {decisionCopy.directFopag} + {decisionCopy.cmv}
                </text>
                {decisionChartData.map((row, index) => (
                  <circle
                    key={`margin-${row.year}`}
                    cx={contributionPoints[index].x}
                    cy={contributionPoints[index].y}
                    r={row.year === selectedYear ? "5.5" : "4"}
                    fill="#0f172a"
                    className="cursor-pointer transition-all duration-200 hover:r-[6px]"
                    onClick={() => setSelectedYear(row.year)}
                  >
                    <title>{`${decisionCopy.contributionMargin} ${row.year}: ${formatCurrencyBRL(row.contributionMargin, locale)}`}</title>
                  </circle>
                ))}
              </>
            ) : (
              <>
                {focusedChartRows.map((row, index) => {
                  const x = 38 + index * 66;
                  const selected = row.year === selectedYear;
                  const barHeight = Math.max(8, Math.abs(row.value) * focusedChartScale);
                  const y = row.value >= 0 ? chartZeroY - barHeight : chartZeroY;
                  return (
                    <g
                      key={row.year}
                      tabIndex={0}
                      role="button"
                      aria-label={`${row.year}`}
                      onClick={() => setSelectedYear(row.year)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelectedYear(row.year);
                      }}
                      className="cursor-pointer outline-none"
                    >
                      {selected && (
                        <rect
                          x={x - 8}
                          y="30"
                          width={chartBarWidth + 16}
                          height="244"
                          rx="8"
                          fill="#f8fafc"
                          stroke={focusedChartColor}
                          strokeWidth="1.5"
                        />
                      )}
                      <rect
                        x={x}
                        y={clamp(y, 34, 258)}
                        width={chartBarWidth}
                        height={clamp(barHeight, 8, 224)}
                        rx="7"
                        fill={focusedChartColor}
                        opacity={selected ? 0.95 : 0.45}
                        className="transition-all duration-300 hover:opacity-100"
                      >
                        <title>{`${row.year}: ${chartMetric === "turmas" || chartMetric === "alunos" ? formatNumber(row.value, locale) : formatCurrencyBRL(row.value, locale)}`}</title>
                      </rect>
                      <text x={x + chartBarWidth / 2} y="286" textAnchor="middle" className={cn("fill-slate-500 text-[10px] font-semibold", selected && "fill-indigo-700 font-black")}>
                        {String(row.year).slice(2)}
                      </text>
                    </g>
                  );
                })}

                <path
                  d={linePath(focusedChartPoints)}
                  fill="none"
                  stroke={focusedChartColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
                <text
                  x={Math.min(650, focusedChartPoints[focusedChartPoints.length - 1].x + 18)}
                  y={Math.max(48, focusedChartPoints[focusedChartPoints.length - 1].y - 12)}
                  textAnchor="end"
                  className="text-[10px] font-black"
                  fill={focusedChartColor}
                >
                  {chartMetricLabel}
                </text>
                {focusedChartRows.map((row, index) => (
                  <circle
                    key={`focused-${row.year}`}
                    cx={focusedChartPoints[index].x}
                    cy={focusedChartPoints[index].y}
                    r={row.year === selectedYear ? "6" : "4"}
                    fill="#fff"
                    stroke={focusedChartColor}
                    strokeWidth="3"
                    className="cursor-pointer transition-all duration-200 hover:r-[6px]"
                    onClick={() => setSelectedYear(row.year)}
                  >
                    <title>{`${row.year}: ${chartMetric === "turmas" || chartMetric === "alunos" ? formatNumber(row.value, locale) : formatCurrencyBRL(row.value, locale)}`}</title>
                  </circle>
                ))}
              </>
            )}
          </svg>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />{decisionCopy.netRevenue}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-orange-500" />{decisionCopy.cmv}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />{decisionCopy.directFopag}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-slate-400" />{decisionCopy.otherDirectCosts}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded-full bg-slate-900" />{decisionCopy.contributionMargin}</span>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
          <span className="font-bold text-slate-800">{decisionCopy.modelBehavior}</span>
          <br />
          {decisionCopy.sourceNote}
        </p>

        <div className="mt-4 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-black text-slate-900">{decisionCopy.salaryMixTitle}</div>
              <div className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">{decisionCopy.salaryMixSubtitle}</div>
            </div>
            <div className="inline-flex w-fit rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 shadow-sm">
              {decisionCopy.analysisLens}
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {EDUCATOR_LEVELS.map((tier) => (
              <span key={tier.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
                <span className="grid h-4 w-4 place-items-center rounded-full text-[8px] font-black text-white" style={{ backgroundColor: PAYROLL_EDUCATOR_TIER_COLORS[tier.id as PayrollEducatorTierId] }}>
                  {tier.name.charAt(0)}
                </span>
                {tier.name.replace(" Educator", "")}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {salaryTierGradeRows.map((row) => {
                const simulatedTier = EDUCATOR_LEVELS.find((tier) => tier.id === row.simulatedTierId);
                const maxCost = Math.max(row.governedLeadCost, row.simulatedLeadCost, 1);
                const simulatedWidth = `${clamp((row.simulatedLeadCost / maxCost) * 100, 6, 100)}%`;
                return (
                  <div
                    key={row.gradeId}
                    className={cn(
                      "rounded-2xl border p-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
                      PAYROLL_DIV_BG[row.division] ?? "border-slate-200 bg-slate-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={cn("text-[9px] font-black uppercase tracking-widest", PAYROLL_DIV_COLORS[row.division] ?? "text-slate-600")}>
                          {row.division}
                        </div>
                        <div className="mt-1 text-sm font-black text-slate-900">{row.gradeLabel}</div>
                      </div>
                      <div className="rounded-xl border border-white/80 bg-white/75 px-2.5 py-1.5 text-right shadow-sm">
                        <div className="text-sm font-black text-slate-900 tabular-nums">{formatNumber(row.leadFte, locale)}</div>
                        <div className="text-[8px] font-bold uppercase tracking-widest text-slate-400">{decisionCopy.leadFte}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{simulatedTier?.name.replace(" Educator", "") ?? row.simulatedTierId}</span>
                        <span className={cn(row.delta <= 0 ? "text-emerald-600" : "text-amber-600")}>{formatSignedCurrency(row.delta, locale)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/80 shadow-inner">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ width: simulatedWidth, backgroundColor: PAYROLL_EDUCATOR_TIER_COLORS[row.simulatedTierId] }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] font-bold text-slate-700">
                        {formatCurrencyBRL(row.simulatedLeadCost, locale)}
                        <span className="ml-1 font-semibold text-slate-400">/ {formatCurrencyBRL(row.governedLeadCost, locale)}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-5 gap-1">
                      {EDUCATOR_LEVELS.map((tier) => (
                        <button
                          type="button"
                          key={tier.id}
                          title={tier.name}
                          aria-label={`${row.gradeLabel}: ${tier.name}`}
                          aria-pressed={row.simulatedTierId === tier.id}
                          onClick={() => setTierForGrade(row.gradeId, tier.id as PayrollEducatorTierId)}
                          className={cn(
                            "h-7 rounded-lg border text-[9px] font-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                            row.simulatedTierId === tier.id
                              ? "border-slate-900 bg-slate-900 text-white shadow-md"
                              : "border-white/80 bg-white/70 text-slate-500 hover:border-slate-300 hover:bg-white",
                          )}
                        >
                          {tier.name.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/80 bg-slate-50/70 p-4 shadow-sm backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.tierDistribution}</div>
                  <div className="mt-1 text-xs font-bold text-slate-700">{formatNumber(salaryTierGradeRows.length, locale)} {decisionCopy.activeGrades.toLowerCase()}</div>
                </div>
                <div className={cn("rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest", simulatedEyLsDelta <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {formatSignedCurrency(simulatedEyLsDelta, locale)}
                </div>
              </div>
              {selectedScenarioComparison && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/80 bg-white/75 px-3 py-2 shadow-sm">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.selectedMix}</div>
                    <div className="mt-1 text-xs font-black text-slate-900 tabular-nums">{formatCurrencyBRL(selectedScenarioComparison.leadCost, locale)}</div>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white/75 px-3 py-2 shadow-sm">
                    <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.contributionAfterMix}</div>
                    <div className="mt-1 text-xs font-black text-teal-700 tabular-nums">{formatCurrencyBRL(selectedScenarioComparison.contributionMargin, locale)}</div>
                  </div>
                </div>
              )}
              <div className="mx-auto mt-4 grid h-44 w-44 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] transition-transform duration-300 hover:scale-[1.02]" style={{ background: distributionGradient }}>
                <div className="grid h-28 w-28 place-items-center rounded-full border border-white/80 bg-white/85 text-center shadow-lg backdrop-blur-sm">
                  <div>
                    <div className="text-lg font-black text-slate-900 tabular-nums">{formatNumber(salaryTierGradeRows.reduce((sum, row) => sum + row.leadFte, 0), locale)}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{decisionCopy.leadFte}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {salaryTierDistributionRows.map((row) => (
                  <div key={row.tier.id} className="flex items-center justify-between gap-3 text-[10px] font-bold text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PAYROLL_EDUCATOR_TIER_COLORS[row.tier.id as PayrollEducatorTierId] }} />
                      {row.tier.name.replace(" Educator", "")}
                    </span>
                    <span className="tabular-nums">{formatNumber(row.leadFte, locale)} FTE · {Math.round(row.pct * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.scenarioComparison}</span>
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {decisionCopy.governedDreLabel}: {OPENING_PACKAGE_LABELS[openingPackageId]} · {t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId])} · {TUITION_LABELS[tuitionScenarioId] ?? tuitionScenarioId} · {t(ORG_DESIGN_LABEL_KEYS[orgDesignOptionId])} · {selectedYear}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              {scenarioComparisonRows.map((row) => (
                <button
                  type="button"
                  key={row.id}
                  onClick={() => {
                    if (row.id === decisionCopy.leanMix) {
                      setTierForSalaryRows(() => "associate");
                    } else if (row.id === decisionCopy.tieredMix) {
                      setTierForSalaryRows((grade) => (grade.division === "Early Years" ? "associate" : "specialist"));
                    } else if (row.id === decisionCopy.premiumMix) {
                      setTierForSalaryRows(() => "inspirational");
                    } else if (row.id === decisionCopy.governedMix) {
                      clearTierScenario();
                    }
                  }}
                  className="rounded-2xl border border-white/80 bg-white/70 p-3 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <div className="flex min-h-[42px] items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-slate-900">{row.label}</div>
                      <div className="mt-0.5 text-[10px] font-bold text-slate-400">{row.mix}</div>
                      <div className="mt-1 text-[10px] font-bold text-slate-600">{row.risk}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {row.hasLowestFopag && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-700">{decisionCopy.lowestFopag}</span>}
                      {row.hasBestMargin && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-teal-700">{decisionCopy.bestMargin}</span>}
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.leadCost}</div>
                  <div className="mt-1 text-sm font-black text-slate-900 tabular-nums">{formatCurrencyBRL(row.leadCost, locale)}</div>
                  <div className={cn("mt-1 text-[10px] font-bold", row.delta <= 0 ? "text-emerald-600" : "text-amber-600")}>{formatSignedCurrency(row.delta, locale)}</div>
                  <div className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">{decisionCopy.contributionAfterMix}</div>
                  <div className="mt-1 text-xs font-black text-teal-700 tabular-nums">{formatCurrencyBRL(row.contributionMargin, locale)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {view === "single" && selectedYearData && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{decisionCopy.operationalDetail}</div>
              <div className="mt-1 text-xs text-slate-500">{decisionCopy.detailHint}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[String(selectedYear), t(OCCUPANCY_LABEL_KEYS[occupancyScenarioId]), t(ORG_DESIGN_LABEL_KEYS[orgDesignOptionId]), `${changedGradeCount} ${decisionCopy.affectedGrades.toLowerCase()}`].map((label) => (
                  <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    {label}
                  </span>
                ))}
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                  {decisionCopy.governedDreLabel}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {showOperationalDetail && (
                <div className="flex flex-wrap gap-1.5">
                  <a href="#payroll-projection-table" className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:border-slate-400">
                    {t("payrollProjectionTableTitle").replace("{range}", "")}
                  </a>
                  <a href="#payroll-division-snapshot" className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:border-slate-400">
                    {t("payrollDivisionSnapshotTitle")}
                  </a>
                  <a href="#payroll-grade-breakdown" className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:border-slate-400">
                    {t("payrollGradeBreakdownTitle").replace("{year}", String(selectedYear))}
                  </a>
                </div>
              )}
              <button
                type="button"
                aria-pressed={showOperationalDetail}
                onClick={() => setShowOperationalDetail((value) => !value)}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-bold transition-colors",
                  showOperationalDetail
                    ? "border-slate-300 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400",
                )}
              >
                {showOperationalDetail ? decisionCopy.hideOperationalDetail : decisionCopy.showOperationalDetail}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "single" && selectedYearData && showOperationalDetail && (
        <div className="space-y-6">
          {/* MAIN TABLE */}
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(1180px,1fr)_320px] gap-6 items-start">
            <div id="payroll-projection-table" className="scroll-mt-24">
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
                        <th className="w-[6%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 xl:px-2.5">{t("payrollYearHeader")}</th>
                        <th className="w-[6%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-center xl:px-2.5">{t("payrollAlunosHeader")}</th>
                        <th className="w-[6%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-slate-500 border-b border-slate-200 text-center xl:px-2.5">{t("payrollTurmasHeader")}</th>
                        <th className="w-[15%] px-2 py-2.5 text-[8px] font-bold uppercase tracking-[0.16em] text-indigo-600 border-b border-slate-200 text-right bg-indigo-50 xl:px-2.5">{t("payrollLabelFopagDireto")}</th>
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
                          <td className="px-2 py-2.5 text-center xl:px-2.5"><span className="text-[11px] font-bold tabular-nums text-slate-700">{yd.totalTurmas}</span></td>
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
            </div>

            {/* RIGHT: division snapshot (non-instructional headcount by division) */}
            <div id="payroll-division-snapshot" className="space-y-4 scroll-mt-24">
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

          <div id="payroll-grade-breakdown" className="scroll-mt-24">
            <GradeStaffingTable
              openingPackageId={openingPackageId}
              occupancyScenarioId={occupancyScenarioId}
              orgDesignOptionId={orgDesignOptionId}
              year={selectedYear}
              educatorTierSelection={educatorTierSelection}
              syncNoteKey="payrollGradeStaffingSyncNoteFromPayroll"
            />
          </div>
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
                      const out =
                        id === orgDesignOptionId
                          ? fopagOutput
                          : calculateFopag({
                              openingPackageId,
                              occupancyScenarioId,
                              orgDesignOptionId: id,
                              educatorTierByGrade: educatorTierSelection.getEducatorTierByGradeForScenario(
                                openingPackageId,
                                occupancyScenarioId,
                                id,
                              ),
                            });
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
                    const matrixTierByGrade = educatorTierSelection.getEducatorTierByGradeForScenario(
                      openingPackageId,
                      occ,
                      od,
                    );
                    const fp = calculateFopag({ openingPackageId, occupancyScenarioId: occ, orgDesignOptionId: od, educatorTierByGrade: matrixTierByGrade });
                    const dr = calculateDre({ openingPackageId, occupancyScenarioId: occ, orgDesignOptionId: od, tuitionScenarioId, educatorTierByGrade: matrixTierByGrade });
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
