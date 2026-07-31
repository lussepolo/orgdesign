/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  GraduationCap,
  Scale,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Activity,
  Database,
  Info,
  Layers,
  Baby,
  School,
  FileText,
  Home,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  GitBranch,
  PieChart,
  Percent,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import HiringProfileCardsTab from "./components/sections/HiringProfileCardsTab";
import ViabilitySimulatorTab from "./components/sections/ViabilitySimulatorTab";
import OfferScenariosTab from "./components/sections/OfferScenariosTab";
import ExecutiveOrgDesignTab from "./components/sections/ExecutiveOrgDesignTab";
import EarlyYearsTab from "./components/sections/EarlyYearsTab";
import LowerSchoolTab from "./components/sections/LowerSchoolTab";
import MiddleSchoolTab from "./components/sections/MiddleSchoolTab";
import HighSchoolTab from "./components/sections/HighSchoolTab";
import LoadTab from "./components/sections/LoadTab";
import AboutModal from "./components/sections/AboutModal";
import DreScenarioSimulatorTab from "./components/sections/DreScenarioSimulatorTab";
import ContributionMarginTab from "./components/sections/ContributionMarginTab";
import SectionsAndPayrollWorkspace from "./components/sections/SectionsAndPayrollWorkspace";
import WorkspaceContextBanner from "./components/common/WorkspaceContextBanner";
import { TUITION_LABELS } from "./components/dreSimulator/dreLeverLabels";
import { RioScenarioResiliencePreview } from "./features/rio-scenario-resilience/RioScenarioResiliencePreview";
import { useCapitalDecisionWorkspace } from "./features/rio-scenario-resilience/hooks/useCapitalDecisionWorkspace";
import { DRE_DEFAULT_SELECTIONS } from "./hooks/useDreScenarioSimulator";
import type { DreScenarioSimulatorSelections } from "./hooks/useDreScenarioSimulator";
import {
  isActiveOpeningPackageId,
  type ActiveOpeningPackageId,
  type OccupancyScenarioId,
} from "./features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "./features/rio-scenario-resilience/model/revenueInputs";
import type { DreWorkingScenarioOrgDesignOptionId } from "./features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { useEducatorTierSelection } from "./hooks/useEducatorTierSelection";
import { useLocale } from "./i18n/useLocale";
import type { Locale } from "./i18n/localeContract";
import {
  PRIMARY_WORKSPACE_ORDER,
  SUPPORTING_GROUPS,
  getWorkspace,
  getSupportingWorkspacesByGroup,
  type WorkspaceGroup,
} from "./config/workspaceRegistry";
import { APP_VERSION_LABEL, APP_ABOUT_SEEN_STORAGE_KEY } from "./config/appMetadata";
import { DRE_WORKSHEET_SYNC_METADATA } from "./config/worksheetSyncMetadata";

// --- Types ---
// "staffing" is retained only so the legacy, unmounted StaffingTab.tsx
// (never imported or routed from this file since V10-X2T) continues to
// type-check. It is not a member of WORKSPACE_REGISTRY and has no live
// route. Do not re-add a render branch or nav entry for it without a
// separate phase explicitly re-approving it.
export type TabId = "cover" | "staffing" | "offer-scenarios" | "executive-org-design" | "hr" | "early-years" | "lower-school" | "ms" | "hs" | "load" | "payroll" | "viability" | "dre-scenario-simulator" | "contribution-margin" | "capital-decision";

const WORKSPACE_ICONS: Record<TabId, React.ElementType> = {
  cover: LayoutDashboard,
  staffing: LayoutDashboard,
  "offer-scenarios": Layers,
  "executive-org-design": GitBranch,
  hr: FileText,
  "early-years": Baby,
  "lower-school": School,
  ms: Database,
  hs: GraduationCap,
  load: Activity,
  payroll: DollarSign,
  viability: Target,
  "dre-scenario-simulator": PieChart,
  "contribution-margin": Percent,
  "capital-decision": Scale,
};

const SUPPORTING_GROUP_LABEL_KEYS: Record<WorkspaceGroup, "navGroupAcademic" | "navGroupPeople" | "navGroupAnalysis" | null> = {
  home: null,
  primary: null,
  academic: "navGroupAcademic",
  people: "navGroupPeople",
  analysis: "navGroupAnalysis",
};

const SCENARIO_OCCUPANCY_LABEL_KEYS: Record<OccupancyScenarioId, "scenarioConservador" | "scenarioBase" | "scenarioOtimista"> = {
  conservador: "scenarioConservador",
  base: "scenarioBase",
  otimista: "scenarioOtimista",
};

const SCENARIO_ORG_DESIGN_LABEL_KEYS: Record<DreWorkingScenarioOrgDesignOptionId, "scenarioMinimumExperience" | "scenarioBalancedExperience" | "scenarioPremiumExperience"> = {
  minimum_experience: "scenarioMinimumExperience",
  balanced_experience: "scenarioBalancedExperience",
  premium_experience: "scenarioPremiumExperience",
};

const SCENARIO_OPENING_PACKAGE_LABELS: Record<ActiveOpeningPackageId, string> = {
  t1_g4: "T1-G4",
  t1_g6: "T1-G6",
};

// --- Components ---

const Badge = ({ children, variant = "info" }: { children: React.ReactNode, variant?: "default" | "warning" | "success" | "info" | "purple" | "danger" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border", variants[variant])}>
      {children}
    </span>
  );
};

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[10px] font-bold transition-all duration-200 lg:text-[11px] xl:px-3",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      active
        ? "bg-slate-900 text-white shadow-md"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("h-3.5 w-3.5", active ? "text-white" : "text-slate-400")} />
    {label}
  </button>
);

const SupportingTabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={cn(
      "flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all whitespace-nowrap md:text-xs",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
    )}
  >
    <Icon className={cn("h-3 w-3", active ? "text-white" : "text-slate-400")} />
    {label}
  </button>
);

const LanguageSelector = () => {
  const { locale, setLocale, t } = useLocale();
  const setLocaleTo = (next: Locale) => () => setLocale(next);
  return (
    <div role="group" aria-label={t("languageSelectorAriaLabel")} className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-[10px] font-bold md:text-xs">
      <button
        type="button"
        onClick={setLocaleTo("pt-BR")}
        aria-pressed={locale === "pt-BR"}
        className={cn("rounded-lg px-2.5 py-1.5 transition-all", locale === "pt-BR" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900")}
      >
        {t("languageOptionPt")}
      </button>
      <button
        type="button"
        onClick={setLocaleTo("en-US")}
        aria-pressed={locale === "en-US"}
        className={cn("rounded-lg px-2.5 py-1.5 transition-all", locale === "en-US" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900")}
      >
        {t("languageOptionEn")}
      </button>
    </div>
  );
};

// --- Tabs ---

const CoverTab = ({ onStart }: { onStart: () => void }) => {
  const { t } = useLocale();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl space-y-8"
      >
        <div className="flex justify-center mb-12">
          <div className="h-24 w-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-slate-300" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">{t("coverEyebrow")}</span>
            <div className="h-[1px] w-12 bg-slate-300" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.9]">
            {t("coverHeadlineLine1")} <br />
            <span className="text-indigo-600 italic">{t("coverHeadlineHighlight")}</span> <br />
            {t("coverHeadlineLine2")}
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed pt-6">
            {t("coverSubtitle")}
          </p>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={onStart}
            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group"
          >
            {t("coverCtaButton")}
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase">{t("coverVersionCardLabel")}</div>
              <div className="text-xs font-bold text-slate-900">{APP_VERSION_LABEL}</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

function AppShell() {
  const { t, locale } = useLocale();
  const [activeTab, setActiveTab] = useState<TabId>("cover");
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [msSections, setMsSections] = useState(2);
  const [hsSections, setHsSections] = useState(2);
  const [supportingNavOpen, setSupportingNavOpen] = useState(false);

  // Phase 15G.2: DRE selections lifted above AnimatePresence so they survive
  // tab switches. Capital Decision workspace lives here for the same reason.
  const [dreSelections, setDreSelections] = useState<DreScenarioSimulatorSelections>(DRE_DEFAULT_SELECTIONS);
  const capitalDecisionWorkspace = useCapitalDecisionWorkspace();

  // V10-RC2 Gate 3: Executive Org Design consumes the same openingPackageId/
  // occupancyScenarioId shared-contract dimensions as DRE, rather than a hardcoded
  // captação constant and tab-local opening-package state — persists across
  // navigation between the two tabs. DreLeverPanel already restricts its own
  // opening-package selector to ACTIVE_OPENING_PACKAGE_IDS, so dreSelections is
  // expected to already hold an active package; isActiveOpeningPackageId narrows
  // defensively rather than assuming it, falling back to the shared default (also
  // active) if it somehow does not.
  const orgDesignOpeningPackageId: ActiveOpeningPackageId = isActiveOpeningPackageId(
    dreSelections.openingPackageId,
  )
    ? dreSelections.openingPackageId
    : (DRE_DEFAULT_SELECTIONS.openingPackageId as ActiveOpeningPackageId);
  const handleOrgDesignOpeningPackageIdChange = (id: ActiveOpeningPackageId) =>
    setDreSelections({ ...dreSelections, openingPackageId: id });
  const handleOrgDesignOccupancyScenarioIdChange = (id: OccupancyScenarioId) =>
    setDreSelections({ ...dreSelections, occupancyScenarioId: id });
  // V10-RC2.3 Gate 3: Turmas e Folha (SectionsAndPayrollWorkspace) reads/writes the
  // same dreSelections shared state — openingPackageId/occupancyScenarioId reuse the
  // exact handlers ExecutiveOrgDesignTab already uses; tuition gets its own handler
  // since ExecutiveOrgDesignTab never needed to change it.
  const handleTuitionScenarioIdChange = (id: TuitionScenarioId) =>
    setDreSelections({ ...dreSelections, tuitionScenarioId: id });
  // V10-RC2.5 Gate 2/Tranche A: orgDesignOptionId was already part of
  // DreScenarioSimulatorSelections but never threaded to ExecutiveOrgDesignTab/
  // SectionsAndPayrollWorkspace — each held its own local, duplicated
  // (and tab-switch-resetting) org-design-scenario state instead. This
  // supersedes that duplication: orgDesignOptionId is now genuinely shared,
  // same lift-to-AppShell pattern as openingPackageId/occupancyScenarioId/
  // tuitionScenarioId above. Reverses the tab-local rationale documented at
  // ExecutiveOrgDesignTab.tsx's prior comment — that rationale covered
  // `year` (still intentionally tab-local; DRE iterates all years) but did
  // not independently justify keeping orgDesignOptionId duplicated.
  const handleOrgDesignOptionIdChange = (id: DreWorkingScenarioOrgDesignOptionId) =>
    setDreSelections({ ...dreSelections, orgDesignOptionId: id });

  // V10-RC2.5 Gate 2/Tranche A: shared Educator tier-selection state,
  // instantiated once here (same pattern as dreSelections/
  // capitalDecisionWorkspace), consumed by both ExecutiveOrgDesignTab and
  // SectionsAndPayrollWorkspace so a tier change in either immediately
  // reflects in the other. Assistant has no selectable tier (see Gate 5) and
  // is intentionally not part of this hook.
  const educatorTierSelection = useEducatorTierSelection();

  React.useEffect(() => {
    const hasSeenAbout = localStorage.getItem(APP_ABOUT_SEEN_STORAGE_KEY);
    if (!hasSeenAbout) {
      setShowAboutModal(true);
      localStorage.setItem(APP_ABOUT_SEEN_STORAGE_KEY, 'true');
    }
  }, []);

  const isPrimaryWorkspace = PRIMARY_WORKSPACE_ORDER.includes(activeTab);
  const activeWorkspace = activeTab !== "cover" && activeTab !== "staffing" ? getWorkspace(activeTab) : null;
  const returnPathTo = activeWorkspace?.returnPathTo;
  const scenarioSnapshotDate = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${DRE_WORKSHEET_SYNC_METADATA.lastSyncedDate}T00:00:00.000Z`));
  const activeScenarioPills = [
    SCENARIO_OPENING_PACKAGE_LABELS[orgDesignOpeningPackageId],
    t(SCENARIO_OCCUPANCY_LABEL_KEYS[dreSelections.occupancyScenarioId]),
    TUITION_LABELS[dreSelections.tuitionScenarioId] ?? dreSelections.tuitionScenarioId,
    t(SCENARIO_ORG_DESIGN_LABEL_KEYS[dreSelections.orgDesignOptionId]),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-2 md:px-6">
          <div className="flex min-h-[48px] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0"><GraduationCap className="h-6 w-6 text-white" /></div>
              <div className="hidden min-w-0 xl:block">
                <h1 className="font-bold text-slate-900 tracking-tight leading-none text-sm md:text-base">{t("appName")}</h1>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t("appTagline")}</p>
              </div>
            </div>

            <nav
              aria-label={t("navPrimaryAriaLabel")}
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1"
            >
              {PRIMARY_WORKSPACE_ORDER.map((id) => {
                const workspace = getWorkspace(id);
                const Icon = WORKSPACE_ICONS[id];
                return (
                  <TabButton
                    key={id}
                    active={activeTab === id}
                    onClick={() => setActiveTab(id)}
                    label={t(workspace.shortLabelKey)}
                    icon={Icon}
                  />
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <LanguageSelector />
              <button onClick={() => setShowAboutModal(true)} className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 hover:text-indigo-900 md:text-xs">
                <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden lg:inline">{t("aboutButtonLabel")}</span>
                <span className="sm:hidden">{t("aboutButtonLabelShort")}</span>
              </button>
              <div className="hidden md:block"><Badge variant="success">{APP_VERSION_LABEL}</Badge></div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600">
                <Database className="h-3.5 w-3.5 text-slate-400" />
                <span className="uppercase tracking-widest text-slate-400">{t("navScenarioBarLabel")}</span>
                {activeScenarioPills.map((label) => (
                  <span key={label} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black text-slate-700">
                    {label}
                  </span>
                ))}
                <span className="ml-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 md:ml-1">
                  {t("navScenarioBarSnapshotLabel")}: {scenarioSnapshotDate}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  {t("navScenarioBarNoLiveConnection")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSupportingNavOpen((v) => !v)}
                aria-expanded={supportingNavOpen}
                aria-controls="supporting-navigation-panel"
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", supportingNavOpen && "rotate-180")} />
                {t("navSupportingToggleLabel")}
              </button>
            </div>
            {supportingNavOpen && (
              <nav id="supporting-navigation-panel" aria-label={t("navSupportingAriaLabel")} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-3 md:p-4">
                {SUPPORTING_GROUPS.map((group) => {
                  const labelKey = SUPPORTING_GROUP_LABEL_KEYS[group];
                  const workspaces = getSupportingWorkspacesByGroup(group);
                  if (!labelKey || workspaces.length === 0) return null;
                  return (
                    <div key={group}>
                      <h3 className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{t(labelKey)}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {workspaces.map((workspace) => {
                          const Icon = WORKSPACE_ICONS[workspace.id];
                          return (
                            <SupportingTabButton
                              key={workspace.id}
                              active={activeTab === workspace.id}
                              onClick={() => setActiveTab(workspace.id)}
                              label={t(workspace.shortLabelKey)}
                              icon={Icon}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </header>

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12">
        {activeTab !== "cover" && activeWorkspace && (
          <div className="mb-8 md:mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="h-1 w-8 bg-slate-900 rounded-full" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t("appTagline")}</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {t(activeWorkspace.titleKey)}
            </h2>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab !== "cover" && activeTab !== "payroll" && activeWorkspace && (
              <WorkspaceContextBanner workspaceId={activeTab} onNavigate={setActiveTab} />
            )}

            {activeTab === "cover" && <CoverTab onStart={() => setActiveTab("offer-scenarios")} />}
            {activeTab === "hr" && <HiringProfileCardsTab />}
            {activeTab === "load" && <LoadTab msSections={msSections} hsSections={hsSections} />}
            {activeTab === "early-years" && <EarlyYearsTab />}
            {activeTab === "lower-school" && <LowerSchoolTab />}
            {activeTab === "ms" && <MiddleSchoolTab sections={msSections} setSections={setMsSections} />}
            {activeTab === "offer-scenarios" && <OfferScenariosTab />}
            {activeTab === "executive-org-design" && (
              <ExecutiveOrgDesignTab
                openingPackageId={orgDesignOpeningPackageId}
                onOpeningPackageIdChange={handleOrgDesignOpeningPackageIdChange}
                occupancyScenarioId={dreSelections.occupancyScenarioId}
                onOccupancyScenarioIdChange={handleOrgDesignOccupancyScenarioIdChange}
                orgDesignOptionId={dreSelections.orgDesignOptionId}
                onOrgDesignOptionIdChange={handleOrgDesignOptionIdChange}
                educatorTierSelection={educatorTierSelection}
                tuitionScenarioId={dreSelections.tuitionScenarioId}
              />
            )}
            {activeTab === "hs" && <HighSchoolTab sections={hsSections} setSections={setHsSections} />}
            {activeTab === "payroll" && (
              <SectionsAndPayrollWorkspace
                openingPackageId={orgDesignOpeningPackageId}
                onOpeningPackageIdChange={handleOrgDesignOpeningPackageIdChange}
                occupancyScenarioId={dreSelections.occupancyScenarioId}
                onOccupancyScenarioIdChange={handleOrgDesignOccupancyScenarioIdChange}
                tuitionScenarioId={dreSelections.tuitionScenarioId}
                onTuitionScenarioIdChange={handleTuitionScenarioIdChange}
                orgDesignOptionId={dreSelections.orgDesignOptionId}
                onOrgDesignOptionIdChange={handleOrgDesignOptionIdChange}
                educatorTierSelection={educatorTierSelection}
              />
            )}
            {activeTab === "viability" && <ViabilitySimulatorTab />}
            {activeTab === "dre-scenario-simulator" && (
              <DreScenarioSimulatorTab
                selections={dreSelections}
                onSelectionsChange={setDreSelections}
                onSendToCapitalDecision={capitalDecisionWorkspace.importFromDre}
                onNavigateToCapitalDecision={() => setActiveTab("capital-decision")}
              />
            )}
            {activeTab === "contribution-margin" && (
              <ContributionMarginTab
                selections={dreSelections}
                onSelectionsChange={setDreSelections}
              />
            )}
            {activeTab === "capital-decision" && (
              <RioScenarioResiliencePreview
                mode="integrated"
                workspace={capitalDecisionWorkspace}
                onNavigateToDre={() => setActiveTab("dre-scenario-simulator")}
              />
            )}

            {activeTab !== "cover" && isPrimaryWorkspace && (
              <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => { const currentIndex = PRIMARY_WORKSPACE_ORDER.indexOf(activeTab); if (currentIndex > 0) setActiveTab(PRIMARY_WORKSPACE_ORDER[currentIndex - 1]); }} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeft className="h-4 w-4" />{t("previousSectionLabel")}
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {activeTab !== PRIMARY_WORKSPACE_ORDER[PRIMARY_WORKSPACE_ORDER.length - 1] ? (
                    <button onClick={() => { const currentIndex = PRIMARY_WORKSPACE_ORDER.indexOf(activeTab); if (currentIndex < PRIMARY_WORKSPACE_ORDER.length - 1) setActiveTab(PRIMARY_WORKSPACE_ORDER[currentIndex + 1]); }} className="flex items-center gap-2 px-8 py-3 bg-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                      {t("nextSectionLabel")}<ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => setActiveTab("cover")} className="flex items-center gap-2 px-8 py-3 bg-rose-600 rounded-2xl text-sm font-bold text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                      {t("finishReturnToCoverLabel")}<Home className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab !== "cover" && !isPrimaryWorkspace && returnPathTo && (
              <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-center">
                <button onClick={() => setActiveTab(returnPathTo)} className="flex items-center gap-2 px-8 py-3 bg-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  {t("bannerReturnPathLabel")}: {t(getWorkspace(returnPathTo).shortLabelKey)}<ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("footerConfidential")}</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("footerStrategicPlan")}</div>
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t("footerCopyright")}</div>
        </div>
      </footer>
    </div>
  );
}

// --- App Root ---
// V10-X2T (completion gate): LocaleProvider now lives in main.tsx, wrapping
// PasswordGate + App together, so the pre-auth gate can also read locale.
// App no longer self-wraps — see tests/phase15g2/qa-main.tsx for the
// standalone-harness wrapper this requires.
export default function App() {
  return <AppShell />;
}
