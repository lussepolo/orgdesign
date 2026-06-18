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

function formatSensitivityLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

export default function ViabilitySimulatorTab() {
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

  const baselineSections = useMemo(
    () => [
      { id: "baseline-setup", label: "Setup" },
      { id: "baseline-kpis", label: "Decision Summary" },
      { id: "baseline-profile", label: "Operating Profile" },
      { id: "baseline-table", label: "Annual Audit" },
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
  const compactBaselineContext = [
    {
      label: "Enrollment",
      value:
        state.enrollmentScenario === "full-seat"
          ? "Full Seat"
          : state.enrollmentScenario === "intermediario"
            ? "Intermediário"
            : state.enrollmentScenario === "pessimista"
              ? "Pessimista"
              : "Otimista",
    },
    {
      label: "Tuition",
      value: state.tuitionScenario.toUpperCase().replace("CEN", "RJ Cen "),
    },
    {
      label: "Cost",
      value: state.costScenario[0].toUpperCase() + state.costScenario.slice(1),
    },
    {
      label: "CAPEX",
      value:
        state.capexMode === "structured"
          ? `Structured (${activeCapexCount} active)`
          : "Single total",
    },
    {
      label: "Discount Rate",
      value: `${state.discountRate.toFixed(1)}%`,
    },
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
              Board workflow
            </div>
            <h3 className="text-xl font-bold text-white">
              One simulator, three board review modes
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Baseline summarizes the current business case. Sensitivity compares selected assumption
              changes. Thresholds frames the conditions required to support viability.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Planning horizon: <strong className="text-white">2028–2047</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {[
            {
              icon: BarChart3,
              title: "Baseline",
              text: "Review the current case, inspect the annual profile, and assess the economic profile under the active assumptions.",
            },
            {
              icon: Grid2x2,
              title: "Sensitivity",
              text: "Compare a grid of model runs where only the selected row and column variables change.",
            },
            {
              icon: Target,
              title: "Thresholds",
              text: "Assess the conditions the project would need to meet to support viability.",
            },
            {
              icon: Target,
              title: "Model Boundary",
              text: "Teaching remains scenario-responsive; non-teaching remains shared/global in the current planning model.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <item.icon className="h-5 w-5 text-white" />
              <div className="mt-3 text-sm font-bold text-white">{item.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Model Context"
        subtitle="Current assumptions and caveats for the active case"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Teaching model
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Scenario-responsive</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Students, sections, teaching payroll, revenue, and downstream cost outputs follow the selected enrollment path.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Non-teaching model
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Shared / global</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Leadership, backoffice, and specialist institutional roles remain shared across scenarios.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Horizon
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">2028–2047</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Baseline and annual tables run on the current 20-year planning window.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Full Seat handling
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">Uses optimistic path</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Full Seat currently reuses the optimistic operating path until a dedicated capacity schedule is added.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Active CAPEX mode
            </div>
            <div className="mt-2 text-sm font-bold text-slate-900">
              {state.capexMode === "structured" ? "Structured by category" : "Single total"}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Baseline cash flow follows the currently selected capital input mode.
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
                  Baseline review path
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Move from setup context to decision summary, operating profile, and annual audit.
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
                    {section.label}
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
                title="Current Scenario Context"
                subtitle="Summary for the active baseline case"
                icon={BarChart3}
                actions={
                  <button
                    type="button"
                    onClick={() => setIsSetupExpanded((current) => !current)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    {isSetupExpanded ? "Hide full setup" : "Show full setup"}
                  </button>
                }
              >
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-slate-600">
                      The active scenario stays visible here while the full setup form remains optional,
                      keeping the baseline screen focused on review.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {compactBaselineContext.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Workflow
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Expand setup to change assumptions, then return to the decision summary,
                      operating profile, or annual audit.
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
                title="Baseline Board Review"
                subtitle="Setup context, decision summary, operating profile, and annual audit"
                icon={BarChart3}
              >
                <p className="text-sm leading-relaxed text-slate-600">
                  Baseline is organized as a board review path: confirm context, read the headline
                  metrics, inspect the operating profile, then audit the annual cash flow table.
                </p>
              </Card>
              <section id="baseline-kpis" className="scroll-mt-32">
                <ViabilityKpiRow kpis={baseline.kpis} />
              </section>
              <Card
                title="Baseline Assembly"
                subtitle="How the current baseline is assembled"
                icon={BarChart3}
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Operating source
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">Live payroll path</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Revenue, students, sections, and staffing start from the live payroll projection for the selected case.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Teaching assumptions
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">Scenario-responsive</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Teaching demand and teaching-side cost outputs follow the selected enrollment and tuition path.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Non-teaching assumptions
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">Shared / global</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Leadership, backoffice, and specialist institutional roles remain shared across scenarios.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      Finance layer
                    </div>
                    <div className="mt-2 text-sm font-bold text-slate-900">Viability-specific overlays</div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Opex, CAPEX, discounting, and KPI calculations are layered on top of the operating projection.
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
                            Expand
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <ChevronUp className="h-3.5 w-3.5" />
                            Collapse
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
                        {isProfilePinned ? "Unpin emphasis" : "Pin emphasis"}
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
                {previousSection.label}
              </button>
            )}
            {nextSection ? (
              <button
                type="button"
                onClick={() => jumpToSection(nextSection.id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowDown className="h-4 w-4" />
                {nextSection.label}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => jumpToSection("baseline-setup")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <ArrowUp className="h-4 w-4" />
                Back to top
              </button>
            )}
          </div>
        </div>
      )}

      {state.activeScreen === "sensitivity" && (
        <div className="space-y-6">
          <Card
            title="Sensitivity Matrix"
            subtitle="Current dimensions, metric, and fixed context"
            icon={Grid2x2}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Rows vary</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{formatSensitivityLabel(rowVariable)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Columns vary</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{formatSensitivityLabel(columnVariable)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Metric shown</div>
                <div className="mt-2 text-sm font-bold text-slate-900">{sensitivityMetric}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Held fixed</div>
                <div className="mt-2 text-sm font-bold text-slate-900">Current model context</div>
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
            title="Threshold Questions"
            subtitle="Decision questions this view is intended to support"
            icon={Target}
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {[
                "Minimum conditions for viability",
                "Maximum viable CAPEX",
                "Minimum viable tuition",
                "Minimum enrollment required",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
                  {item}
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
