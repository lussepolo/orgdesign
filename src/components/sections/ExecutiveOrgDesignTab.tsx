import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, GitBranch, Layers3 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import {
  buildExecutiveOrgDesignTree,
  EXECUTIVE_ORG_SCENARIOS,
  EXECUTIVE_ORG_YEARS,
  type ExecutiveOrgScenario,
  type ExecutiveOrgYear,
  type OrgTreeNode,
  type OrgTreeNodeVariant,
} from "../../features/rio-scenario-resilience/model/executiveOrgDesignModel";
import { openingGrades } from "../../features/rio-scenario-resilience/data/openingGrades";
import { buildOrgDesignHcTable, type OrgDesignHcTableRow } from "../../features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
  type ActiveOpeningPackageId,
  type OccupancyScenarioId,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TranslationKey } from "../../i18n/localeContract";

const OCCUPANCY_SCENARIO_LABEL_KEYS: Record<OccupancyScenarioId, TranslationKey> = {
  conservador: "scenarioConservador",
  base: "scenarioBase",
  otimista: "scenarioOtimista",
};

// V10-RC2 Gate 3: shared scenario contract. Opening package is restricted to the two
// active packages (ACTIVE_OPENING_PACKAGE_IDS) — t1_g3/t1_g5 are retired and must not
// be offered here even though the wider OpeningPackageId union still includes them for
// legacy/historical source records elsewhere in the codebase.
const OPENING_SCENARIO_OPTION_LABELS: Record<ActiveOpeningPackageId, string> = {
  t1_g4: "Scenario B / T1→G4",
  t1_g6: "Scenario D / T1→G6",
};
const OPENING_SCENARIO_OPTIONS: readonly { id: ActiveOpeningPackageId; label: string }[] =
  ACTIVE_OPENING_PACKAGE_IDS.map((id) => ({ id, label: OPENING_SCENARIO_OPTION_LABELS[id] }));

type OpeningPackageId = ActiveOpeningPackageId;

const ORG_DESIGN_OPTION_MAP: Record<ExecutiveOrgScenario, string> = {
  minimum: "minimum_experience",
  balanced: "balanced_experience",
  premium: "premium_experience",
};

const nodeVariantClasses: Record<OrgTreeNodeVariant, string> = {
  base: "border-slate-200 bg-white",
  scenarioAddition: "border-emerald-300 bg-emerald-50",
  yearBased: "border-blue-300 bg-blue-50",
  guardrail: "border-slate-300 bg-slate-100 text-slate-600",
  dottedLine: "border-dashed border-slate-300 bg-white",
};

const badgeVariantClasses: Record<OrgTreeNodeVariant, string> = {
  base: "border-slate-200 bg-slate-50 text-slate-600",
  scenarioAddition: "border-emerald-200 bg-emerald-100 text-emerald-700",
  yearBased: "border-blue-200 bg-blue-100 text-blue-700",
  guardrail: "border-slate-300 bg-white text-slate-500",
  dottedLine: "border-slate-300 bg-white text-slate-500",
};

const headcountBadgeClasses = {
  "source-backed": "border-slate-300 bg-slate-900 text-white",
  "source-pending": "border-amber-200 bg-amber-50 text-amber-700",
  "model-backed": "border-emerald-300 bg-emerald-50 text-emerald-700",
} as const;

const primaryBranchIds = new Set([
  "operations",
  "academic-divisions",
  "learning-ecosystem",
  "community-library",
  "future-divisions",
]);

const firstProgressionYear = EXECUTIVE_ORG_YEARS[0].year;
const finalProgressionYear = EXECUTIVE_ORG_YEARS[EXECUTIVE_ORG_YEARS.length - 1].year;
const progressionIntervalMs = 1000;

function HeadcountBadge({ node }: { node: OrgTreeNode }) {
  if (!node.headcountStatus || node.headcountStatus === "not-applicable") return null;

  let label: string;
  if (node.headcountStatus === "source-backed" && typeof node.headcountValue === "number") {
    label = `HC ${node.headcountValue}`;
  } else if (node.headcountStatus === "model-backed") {
    label = "Model-backed HC";
  } else {
    label = "HC source pending";
  }

  return (
    <span
      title={node.headcountSourceLabel}
      className={cn(
        "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold leading-4",
        headcountBadgeClasses[node.headcountStatus],
      )}
    >
      {label}
    </span>
  );
}

function TreeNode({ node, depth = 0 }: { node: OrgTreeNode; depth?: number }) {
  const variant = node.variant ?? "base";
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className={cn("motion-safe:animate-[executiveOrgCardFade_220ms_ease-out]", depth > 0 && "pl-3")}>
      <div
        className={cn(
          "relative rounded-md border px-3 py-2 shadow-sm transition-[opacity,box-shadow] duration-200 ease-out",
          depth > 0 && "before:absolute before:-left-3 before:top-1/2 before:h-px before:w-3 before:bg-slate-300",
          nodeVariantClasses[variant],
        )}
      >
        <div className="flex min-w-0 items-start justify-between gap-2">
          <p className="text-[12px] font-bold leading-4 text-slate-900">{node.label}</p>
          <div className="flex shrink-0 flex-wrap justify-end gap-1">
            {node.badge && (
              <span
                className={cn(
                  "shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  badgeVariantClasses[variant],
                )}
              >
                {node.badge}
              </span>
            )}
            <HeadcountBadge node={node} />
          </div>
        </div>
        {node.note && <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{node.note}</p>}
        {node.headcountBasisNote && (
          <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{node.headcountBasisNote}</p>
        )}
        {node.packageBasisNote && (
          <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{node.packageBasisNote}</p>
        )}
      </div>

      {hasChildren && (
        <div className="relative mt-2 space-y-2 border-l border-slate-300 pl-3">
          {node.children?.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}

function BranchColumn({ node }: { node: OrgTreeNode }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 rounded-md border border-slate-300 bg-slate-900 px-3 py-2 text-white shadow-sm">
        <p className="text-[12px] font-bold">{node.label}</p>
      </div>
      <div className="space-y-2">
        {node.children?.map((child) => <TreeNode key={child.id} node={child} />)}
      </div>
    </div>
  );
}

function HcTableRow({ row }: { row: OrgDesignHcTableRow }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50">
      <td className="px-3 py-2 text-[11px] font-semibold text-slate-700">{row.divisionArea}</td>
      <td className="px-3 py-2 text-[11px] text-slate-600">{row.roleGroupOrHub !== row.divisionArea ? row.roleGroupOrHub : "—"}</td>
      <td className="px-3 py-2 text-[11px] font-semibold text-slate-900">{row.role}</td>
      <td className="px-3 py-2 text-center text-[11px] font-bold text-slate-900">
        <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded border border-slate-300 bg-slate-900 px-1.5 text-white">
          {row.headcountOrFte}
        </span>
      </td>
      <td className="px-3 py-2 text-[11px] text-slate-500">{row.sourceTypeLogic}</td>
    </tr>
  );
}

function BalancedExplanationPanel() {
  const { t } = useLocale();
  return (
    <section
      aria-label={t("orgDesignBalancedAriaLabel")}
      className="rounded-md border border-emerald-200 bg-emerald-50 p-4 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-2">
        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            {t("orgDesignBalancedEyebrow")}
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-emerald-950">
            {t("orgDesignBalancedIntro")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t("orgDesignWhyBalancedTitle")}</p>
          <p className="text-[11px] font-semibold leading-5 text-slate-700">
            {t("orgDesignWhyBalancedBody")}
          </p>
        </div>

        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t("orgDesignDynamicHcTitle")}</p>
          <p className="text-[11px] font-semibold leading-5 text-slate-700">
            {t("orgDesignDynamicHcBody")}
          </p>
        </div>

        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {t("orgDesignLedHubTitle")}
          </p>
          <ul className="space-y-0.5 text-[11px] font-semibold text-slate-700">
            <li className="font-bold text-emerald-900">{t("orgDesignLedHubItem0")}</li>
            <li className="pl-3 before:mr-1 before:content-['–']">{t("orgDesignLedHubItem1")}</li>
            <li className="pl-3 before:mr-1 before:content-['–']">{t("orgDesignLedHubItem2")}</li>
            <li className="pl-3 before:mr-1 before:content-['–']">{t("orgDesignLedHubItem3")}</li>
          </ul>
        </div>

        <div className="rounded-md border border-emerald-200 bg-white p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            {t("orgDesignDivisionStaffingLogicTitle")}
          </p>
          <p className="text-[11px] font-semibold leading-5 text-slate-700">
            {t("orgDesignDivisionStaffingLogicBody")}
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3 sm:col-span-2 lg:col-span-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {t("orgDesignGovernanceCaveatTitle")}
          </p>
          <p className="text-[11px] font-semibold leading-5 text-slate-600">
            {t("orgDesignGovernanceCaveatBody")}
          </p>
        </div>
      </div>
    </section>
  );
}

// V10-RC2 Gate 3: openingPackageId and occupancyScenarioId are shared-contract
// dimensions, lifted from App.tsx and controlled the same way DreScenarioSimulatorTab
// receives its selections — not tab-local state that resets on navigation, and no
// longer a hardcoded captação. org-design tier (scenario) and year remain Org
// Design-local: year is a single-year view selector (DRE iterates all years — forcing
// year into the shared contract would create a false dependency), and tier affects
// only which organizational roles are active, not enrollment/sections.
interface ExecutiveOrgDesignTabProps {
  readonly openingPackageId: OpeningPackageId;
  readonly onOpeningPackageIdChange: (id: OpeningPackageId) => void;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly onOccupancyScenarioIdChange: (id: OccupancyScenarioId) => void;
}

const ExecutiveOrgDesignTab = ({
  openingPackageId,
  onOpeningPackageIdChange,
  occupancyScenarioId,
  onOccupancyScenarioIdChange,
}: ExecutiveOrgDesignTabProps) => {
  const { t } = useLocale();
  const [scenario, setScenario] = useState<ExecutiveOrgScenario>("balanced");
  const [year, setYear] = useState<ExecutiveOrgYear>(2028);
  const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);

  const viewModel = useMemo(() => buildExecutiveOrgDesignTree(scenario, year), [scenario, year]);
  const rootChildren = viewModel.root.children ?? [];
  const directRootNodes = rootChildren.filter((node) => !primaryBranchIds.has(node.id));
  const branchNodes = rootChildren.filter((node) => primaryBranchIds.has(node.id));

  const hcTableResult = useMemo(
    () =>
      buildOrgDesignHcTable({
        openingPackageId,
        occupancyScenarioId,
        orgDesignOptionId: ORG_DESIGN_OPTION_MAP[scenario],
        year,
      }),
    [openingPackageId, occupancyScenarioId, scenario, year],
  );

  useEffect(() => {
    if (!isProgressionPlaying) return undefined;

    const intervalId = window.setInterval(() => {
      setYear((currentYear) => {
        if (currentYear >= finalProgressionYear) {
          setIsProgressionPlaying(false);
          return currentYear;
        }

        return (currentYear + 1) as ExecutiveOrgYear;
      });
    }, progressionIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isProgressionPlaying]);

  const handleProgressionToggle = () => {
    if (isProgressionPlaying) {
      setIsProgressionPlaying(false);
      return;
    }

    setYear(firstProgressionYear);
    setIsProgressionPlaying(true);
  };

  const openingGradeLabel = openingGrades.find((g) => g.id === openingPackageId)?.label ?? openingPackageId;

  return (
    <div className="space-y-4">
      <style>
        {`
          @keyframes executiveOrgCardFade {
            from { opacity: 0.72; }
            to { opacity: 1; }
          }
        `}
      </style>
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-500" />
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">{t("orgDesignHeaderTitle")}</h3>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">{t("orgDesignHeaderSubtitle")}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("orgDesignOpeningScenarioLabel")}</span>
            <select
              value={openingPackageId}
              onChange={(event) => onOpeningPackageIdChange(event.target.value as OpeningPackageId)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
            >
              {OPENING_SCENARIO_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("dreLeverPanelCaptacaoLabel")}</span>
            <select
              value={occupancyScenarioId}
              onChange={(event) => onOccupancyScenarioIdChange(event.target.value as OccupancyScenarioId)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
            >
              {OCCUPANCY_SCENARIO_IDS.map((id) => (
                <option key={id} value={id}>
                  {t(OCCUPANCY_SCENARIO_LABEL_KEYS[id])}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("orgDesignVersionLabel")}</span>
            <select
              value={scenario}
              onChange={(event) => setScenario(event.target.value as ExecutiveOrgScenario)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
            >
              {EXECUTIVE_ORG_SCENARIOS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("orgDesignYearLabel")}</span>
            <div className="flex gap-2">
              <select
                value={year}
                onChange={(event) => {
                  setIsProgressionPlaying(false);
                  setYear(Number(event.target.value) as ExecutiveOrgYear);
                }}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
              >
                {EXECUTIVE_ORG_YEARS.map((option) => (
                  <option key={option.year} value={option.year}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleProgressionToggle}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
              >
                {isProgressionPlaying ? t("orgDesignPauseButton") : t("orgDesignPlayButton")}
              </button>
              {isProgressionPlaying && (
                <button
                  type="button"
                  onClick={() => setIsProgressionPlaying(false)}
                  className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100"
                >
                  {t("orgDesignStopButton")}
                </button>
              )}
            </div>
            <p className="max-w-xs text-[11px] font-semibold leading-4 text-slate-500">
              {t("orgDesignShowingActiveOrg").replace("{year}", String(year))}
              {isProgressionPlaying && t("orgDesignProgressionNote")}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-h-[70vh] rounded-md border border-slate-200 bg-slate-50 p-3 shadow-sm md:p-4">
          <div className="mx-auto mb-4 max-w-sm rounded-md border border-slate-800 bg-slate-950 px-4 py-3 text-center text-white shadow-md">
            <div className="mb-1 flex items-center justify-center gap-2">
              {viewModel.root.badge && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  {viewModel.root.badge}
                </p>
              )}
              <HeadcountBadge node={viewModel.root} />
            </div>
            <h4 className="text-lg font-bold leading-6">{viewModel.root.label}</h4>
          </div>

          {directRootNodes.length > 0 && (
            <div className="mx-auto mb-4 max-w-xs border-t border-slate-300 pt-3">
              {directRootNodes.map((node) => (
                <TreeNode key={node.id} node={node} />
              ))}
            </div>
          )}

          <div className="grid gap-3 lg:grid-cols-5">
            {branchNodes.map((branch) => <BranchColumn key={branch.id} node={branch} />)}
          </div>
        </div>

        <aside className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:content-start">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{t("orgDesignRecommendedPostureLabel")}</p>
            </div>
            <p className="mt-1 text-sm font-bold text-emerald-950">{t("orgDesignRecommendedPostureValue")}</p>
          </div>

          {viewModel.railItems.map((item) => (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-slate-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
              </div>
              <p className="mt-1 text-sm font-bold leading-5 text-slate-900">{item.value}</p>
              {item.note && <p className="mt-1 text-xs font-semibold leading-4 text-slate-500">{item.note}</p>}
            </div>
          ))}
        </aside>
      </section>

      {scenario === "balanced" && <BalancedExplanationPanel />}

      {/* Role-Level Headcount Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">{t("orgDesignRoleLevelHeadcountTitle")}</h4>
            <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
              {OPENING_SCENARIO_OPTIONS.find((o) => o.id === openingPackageId)?.label} ·{" "}
              {EXECUTIVE_ORG_SCENARIOS.find((o) => o.id === scenario)?.label} · {year} ·{" "}
              {hcTableResult.calculationReady ? t("orgDesignCalculationReadyLabel") : t("orgDesignBlockingDiagnosticsLabel")}
            </p>
          </div>
          {!hcTableResult.calculationReady && (
            <span className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
              {t("orgDesignEngineStatusLabel")} {hcTableResult.engineStatus}
            </span>
          )}
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-[11px] font-semibold leading-5 text-slate-600">
          <span className="font-bold text-slate-800">{t("orgDesignMethodologyLabel")} </span>
          {t("orgDesignMethodologyBody1")}{" "}
          <code className="rounded bg-slate-200 px-1 text-[10px]">sectionCountEngine</code>{" "}
          <span className="font-bold">base</span>. {t("orgDesignMethodologyBody2")}{" "}
          <span className="font-bold">{openingGradeLabel}</span>{t("orgDesignMethodologyBody3")}
        </div>

        <div className="overflow-x-auto rounded-md border border-slate-200 shadow-sm">
          <table className="w-full border-collapse bg-white text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100">
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("orgDesignColDivisionArea")}</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("orgDesignColRoleGroupOrHub")}</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("orgDesignColRole")}</th>
                <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("orgDesignColHcFte")}</th>
                <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("orgDesignColSourceTypeLogic")}</th>
              </tr>
            </thead>
            <tbody>
              {hcTableResult.rows.map((row, i) => (
                <HcTableRow key={`${row.divisionArea}-${row.role}-${i}`} row={row} />
              ))}
              {hcTableResult.rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-[11px] font-semibold text-slate-400">
                    {t("orgDesignNoActiveRoles")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[10px] font-semibold text-slate-400">
          {t("orgDesignFooterYear")} {year} · {t("orgDesignFooterOpeningScenario")} {openingPackageId} · {t("orgDesignFooterVersion")}{" "}
          {ORG_DESIGN_OPTION_MAP[scenario]} · {t("orgDesignFooterOccupancy")} {occupancyScenarioId} ·{" "}
          {hcTableResult.rows.length} {t("orgDesignFooterActiveRoleRows")}
        </p>
      </section>
    </div>
  );
};

export default ExecutiveOrgDesignTab;
