import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Grid2x2,
  Target,
} from "lucide-react";
import ViabilityTopBar from "../viability/ViabilityTopBar";
import ViabilityKpiRow from "../viability/ViabilityKpiRow";
import ViabilityInputsRail from "../viability/ViabilityInputsRail";
import ViabilityProjectionChart from "../viability/ViabilityProjectionChart";
import ViabilityAnnualProjectionTable from "../viability/ViabilityAnnualProjectionTable";
import SensitivityControlBar from "../viability/SensitivityControlBar";
import SensitivityMatrixGrid from "../viability/SensitivityMatrixGrid";
import SensitivityInterpretationStrip from "../viability/SensitivityInterpretationStrip";
import ThresholdControlPanel from "../viability/ThresholdControlPanel";
import ThresholdResultCards from "../viability/ThresholdResultCards";
import ThresholdChart from "../viability/ThresholdChart";
import ThresholdNarrativePanel from "../viability/ThresholdNarrativePanel";
import { Card } from "../common/Card";
import { useViabilitySimulator } from "../../hooks/useViabilitySimulator";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

function formatSensitivityLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export default function ViabilitySimulatorTab() {
  const { t } = useLocale();
  const {
    state,
    setState,
    sensitivityMetric,
    setSensitivityMetric,
    rowVariable,
    setRowVariable,
    columnVariable,
    setColumnVariable,
    baseline,
    sensitivity,
    thresholds,
  } = useViabilitySimulator();

  const [isSetupExpanded, setIsSetupExpanded] = useState(false);
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);
  const [isProfilePinned, setIsProfilePinned] = useState(false);
  const [activeBaselineSection, setActiveBaselineSection] = useState("baseline-setup");

  const baselineSections: Array<{ id: string; labelKey: TranslationKey }> = useMemo(
    () => [
      { id: "baseline-setup", labelKey: "viabilityTabSectionSetup" },
      { id: "baseline-kpis", labelKey: "viabilityTabSectionKpis" },
      { id: "baseline-profile", labelKey: "viabilityTabSectionProfile" },
      { id: "baseline-table", labelKey: "viabilityTabSectionTable" },
    ],
    [],
  );

  useEffect(() => {
    if (state.activeScreen !== "baseline" || typeof window === "undefined") {
      return;
    }

    const elements = baselineSections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries[0]?.target?.id) {
          setActiveBaselineSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0.2, 0.4, 0.7],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [baselineSections, state.activeScreen]);

  const jumpToSection = (sectionId: string) => {
    if (typeof window === "undefined") {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activeSectionIndex = baselineSections.findIndex(
    (section) => section.id === activeBaselineSection,
  );
  const previousSection = activeSectionIndex > 0 ? baselineSections[activeSectionIndex - 1] : null;
  const nextSection =
    activeSectionIndex >= 0 && activeSectionIndex < baselineSections.length - 1
      ? baselineSections[activeSectionIndex + 1]
      : null;

  const activeCapexCount = state.capexCategories.filter((row) => row.included).length;
  const compactBaselineContext: Array<{ labelKey: TranslationKey; value: string }> = [
    {
      labelKey: "viabilityTabContextLabelEnrollment",
      value:
        state.enrollmentScenario === "full-seat"
          ? t("scenarioFullSeat")
          : state.enrollmentScenario === "base"
            ? t("scenarioBase")
            : state.enrollmentScenario === "pessimista"
              ? t("scenarioPessimista")
              : t("scenarioOtimista"),
    },
    {
      labelKey: "viabilityTabContextLabelTuition",
      value: state.tuitionScenario.toUpperCase().replace("CEN", "RJ Cen "),
    },
    {
      labelKey: "viabilityTabContextLabelCost",
      value: state.costScenario[0].toUpperCase() + state.costScenario.slice(1),
    },
    {
      labelKey: "viabilityTabContextLabelCapex",
      value:
        state.capexMode === "structured"
          ? t("viabilityTabCapexStructuredValue").replace("{count}", String(activeCapexCount))
          : t("viabilityTabCapexSingleTotalValue"),
    },
    {
      labelKey: "viabilityTabContextLabelDiscountRate",
      value: `${state.discountRate.toFixed(1)}%`,
    },
  ];

  const modeCards: Array<{ icon: typeof BarChart3; titleKey: TranslationKey; textKey: TranslationKey }> = [
    {
      icon: BarChart3,
      titleKey: "viabilityTabModeCardBaselineTitle",
      textKey: "viabilityTabModeCardBaselineText",
    },
    {
      icon: Grid2x2,
      titleKey: "viabilityTabModeCardSensitivityTitle",
      textKey: "viabilityTabModeCardSensitivityText",
    },
    {
      icon: Target,
      titleKey: "viabilityTabModeCardThresholdsTitle",
      textKey: "viabilityTabModeCardThresholdsText",
    },
    {
      icon: Target,
      titleKey: "viabilityTabModeCardBoundaryTitle",
      textKey: "viabilityTabModeCardBoundaryText",
    },
  ];

  const thresholdQuestionKeys: TranslationKey[] = [
    "viabilityTabThresholdQ1",
    "viabilityTabThresholdQ2",
    "viabilityTabThresholdQ3",
    "viabilityTabThresholdQ4",
  ];

  return (
    <div className="space-y-6">
      <ViabilityTopBar
        activeScreen={state.activeScreen}
        onScreenChange={(activeScreen) => setState((current) => ({ ...current, activeScreen }))}
      />

      <Card className="border-slate-200 bg-slate-900 text-white">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabBoardWorkflowEyebrow")}
            </div>
            <h3 className="text-xl font-bold text-white">
              {t("viabilityTabWorkflowHeadline")}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              {t("viabilityTabWorkflowIntro")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {t("viabilityTabPlanningHorizonLabel")} <strong className="text-white">2028–2047</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {modeCards.map((item) => (
            <div key={item.titleKey} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <item.icon className="h-5 w-5 text-white" />
              <div className="mt-3 text-sm font-bold text-white">{t(item.titleKey)}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{t(item.textKey)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={t("viabilityTabModelContextTitle")}
        subtitle={t("viabilityTabModelContextSubtitle")}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabTeachingModelLabel")}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabScenarioResponsiveValue")}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("viabilityTabTeachingModelBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabNonTeachingModelLabel")}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabSharedGlobalValue")}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("viabilityTabNonTeachingModelBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabHorizonLabel")}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">2028–2047</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("viabilityTabHorizonBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabFullSeatHandlingLabel")}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabUsesOptimisticPathValue")}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("viabilityTabFullSeatHandlingBody")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {t("viabilityTabActiveCapexModeLabel")}
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              {state.capexMode === "structured" ? t("viabilityTabStructuredByCategoryValue") : t("viabilityTabSingleTotalValue")}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {t("viabilityTabActiveCapexModeBody")}
            </p>
          </div>
        </div>
      </Card>

      {state.activeScreen === "baseline" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur md:sticky md:top-20 md:z-30">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {t("viabilityTabBaselineReviewPathLabel")}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {t("viabilityTabBaselineReviewPathBody")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {baselineSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => jumpToSection(section.id)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-xs font-semibold transition",
                      activeBaselineSection === section.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
                    )}
                  >
                    {t(section.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div
              id="baseline-setup"
              className="scroll-mt-32 space-y-4 xl:sticky xl:top-40 xl:self-start"
            >
              <Card
                title={t("viabilityTabCurrentScenarioTitle")}
                subtitle={t("viabilityTabCurrentScenarioSubtitle")}
                icon={BarChart3}
                actions={
                  <button
                    type="button"
                    onClick={() => setIsSetupExpanded((current) => !current)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    {isSetupExpanded ? t("viabilityTabHideFullSetup") : t("viabilityTabShowFullSetup")}
                  </button>
                }
              >
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                      {t("viabilityTabActiveScenarioNote")}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {compactBaselineContext.map((item) => (
                      <div
                        key={item.labelKey}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          {t(item.labelKey)}
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {t("viabilityTabWorkflowLabel")}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {t("viabilityTabWorkflowBody")}
                    </p>
                  </div>
                </div>
              </Card>

              {isSetupExpanded && (
                <ViabilityInputsRail
                  state={state}
                  onStateChange={(patch) => setState((current) => ({ ...current, ...patch }))}
                />
              )}
            </div>

            <div className="min-w-0 space-y-6">
              <Card
                title={t("viabilityTabBoardReviewTitle")}
                subtitle={t("viabilityTabBoardReviewSubtitle")}
                icon={BarChart3}
              >
                <p className="text-sm leading-relaxed text-slate-600">
                  {t("viabilityTabBoardReviewBody")}
                </p>
              </Card>
              <section id="baseline-kpis" className="scroll-mt-32">
                <ViabilityKpiRow kpis={baseline.kpis} />
              </section>
              <Card
                title={t("viabilityTabBaselineAssemblyTitle")}
                subtitle={t("viabilityTabBaselineAssemblySubtitle")}
                icon={BarChart3}
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {t("viabilityTabOperatingSourceLabel")}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabLivePayrollPathValue")}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {t("viabilityTabOperatingSourceBody")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {t("viabilityTabTeachingAssumptionsLabel")}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabScenarioResponsiveValue")}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {t("viabilityTabTeachingAssumptionsBody")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {t("viabilityTabNonTeachingAssumptionsLabel")}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabSharedGlobalValue")}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {t("viabilityTabNonTeachingAssumptionsBody")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      {t("viabilityTabFinanceLayerLabel")}
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabFinanceLayerValue")}</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {t("viabilityTabFinanceLayerBody")}
                    </p>
                  </div>
                </div>
              </Card>
              <section id="baseline-profile" className="scroll-mt-32 min-w-0">
                <ViabilityProjectionChart
                  series={baseline.chartSeries}
                  collapsed={isProfileCollapsed}
                  className={cn(
                    "relative",
                    isProfilePinned && "border-slate-300 shadow-md shadow-slate-200/70",
                  )}
                  actions={
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsProfileCollapsed((current) => !current)}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      >
                        {isProfileCollapsed ? (
                          <span className="inline-flex items-center gap-1">
                            <ChevronDown className="h-3.5 w-3.5" />
                            {t("viabilityTabExpand")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <ChevronUp className="h-3.5 w-3.5" />
                            {t("viabilityTabCollapse")}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsProfilePinned((current) => !current)}
                        aria-pressed={isProfilePinned}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          isProfilePinned
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900",
                        )}
                      >
                        {isProfilePinned ? t("viabilityTabUnpinEmphasis") : t("viabilityTabPinEmphasis")}
                      </button>
                    </div>
                  }
                />
              </section>

              <section id="baseline-table" className="scroll-mt-32 min-w-0">
                <ViabilityAnnualProjectionTable rows={baseline.annualRows} />
              </section>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col gap-2">
            {previousSection && (
              <button
                type="button"
                onClick={() => jumpToSection(previousSection.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                <ArrowUp className="h-4 w-4" />
                {t(previousSection.labelKey)}
              </button>
            )}
            {nextSection ? (
              <button
                type="button"
                onClick={() => jumpToSection(nextSection.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowDown className="h-4 w-4" />
                {t(nextSection.labelKey)}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => jumpToSection("baseline-setup")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowUp className="h-4 w-4" />
                {t("viabilityTabBackToTop")}
              </button>
            )}
          </div>
        </div>
      )}

      {state.activeScreen === "sensitivity" && (
        <div className="space-y-6">
          <Card
            title={t("viabilityTabSensitivityMatrixTitle")}
            subtitle={t("viabilityTabSensitivityMatrixSubtitle")}
            icon={Grid2x2}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("viabilityTabRowsVaryLabel")}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{formatSensitivityLabel(rowVariable)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("viabilityTabColumnsVaryLabel")}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{formatSensitivityLabel(columnVariable)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("viabilityTabMetricShownLabel")}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{sensitivityMetric}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t("viabilityTabHeldFixedLabel")}</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{t("viabilityTabCurrentModelContextValue")}</div>
              </div>
            </div>
          </Card>
          <SensitivityControlBar
            metric={sensitivityMetric}
            rowVariable={rowVariable}
            columnVariable={columnVariable}
            onMetricChange={setSensitivityMetric}
            onRowVariableChange={setRowVariable}
            onColumnVariableChange={setColumnVariable}
          />
          <SensitivityMatrixGrid viewModel={sensitivity} />
          <SensitivityInterpretationStrip viewModel={sensitivity} />
        </div>
      )}

      {state.activeScreen === "thresholds" && (
        <div className="space-y-6">
          <Card
            title={t("viabilityTabThresholdQuestionsTitle")}
            subtitle={t("viabilityTabThresholdQuestionsSubtitle")}
            icon={Target}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {thresholdQuestionKeys.map((key) => (
                <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {t(key)}
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <ThresholdControlPanel controls={thresholds.controls} />
            <ThresholdChart series={thresholds.chartSeries} />
          </div>
          <ThresholdResultCards cards={thresholds.resultCards} />
          <ThresholdNarrativePanel narrative={thresholds.narrative} />
        </div>
      )}
    </div>
  );
}
