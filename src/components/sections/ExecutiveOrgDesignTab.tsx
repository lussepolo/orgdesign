import React, { useMemo, useState } from "react";
import { CheckCircle2, GitBranch, Layers3 } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  buildExecutiveOrgDesignTree,
  EXECUTIVE_ORG_SCENARIOS,
  EXECUTIVE_ORG_YEARS,
  type ExecutiveOrgScenario,
  type ExecutiveOrgYear,
  type OrgTreeNode,
  type OrgTreeNodeVariant,
} from "../../features/rio-scenario-resilience/model/executiveOrgDesignModel";

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

const primaryBranchIds = new Set([
  "operations",
  "academic-divisions",
  "learning-ecosystem",
  "community-library",
  "future-divisions",
]);

function TreeNode({ node, depth = 0 }: { node: OrgTreeNode; depth?: number }) {
  const variant = node.variant ?? "base";
  const hasChildren = Boolean(node.children?.length);

  return (
    <div className={cn(depth > 0 && "pl-3")}>
      <div
        className={cn(
          "relative rounded-md border px-3 py-2 shadow-sm",
          depth > 0 && "before:absolute before:-left-3 before:top-1/2 before:h-px before:w-3 before:bg-slate-300",
          nodeVariantClasses[variant],
        )}
      >
        <div className="flex min-w-0 items-start justify-between gap-2">
          <p className="text-[12px] font-bold leading-4 text-slate-900">{node.label}</p>
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
        </div>
        {node.note && <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-500">{node.note}</p>}
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

const ExecutiveOrgDesignTab = () => {
  const [scenario, setScenario] = useState<ExecutiveOrgScenario>("balanced");
  const [year, setYear] = useState<ExecutiveOrgYear>(2028);

  const viewModel = useMemo(() => buildExecutiveOrgDesignTree(scenario, year), [scenario, year]);
  const rootChildren = viewModel.root.children ?? [];
  const directRootNodes = rootChildren.filter((node) => !primaryBranchIds.has(node.id));
  const branchNodes = rootChildren.filter((node) => primaryBranchIds.has(node.id));

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-slate-500" />
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">Executive Org Design</h3>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">Full Rio organization tree by scenario and year.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scenario</span>
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

          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Year</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value) as ExecutiveOrgYear)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 shadow-sm"
            >
              {EXECUTIVE_ORG_YEARS.map((option) => (
                <option key={option.year} value={option.year}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-h-[70vh] rounded-md border border-slate-200 bg-slate-50 p-3 shadow-sm md:p-4">
          <div className="mx-auto mb-4 max-w-sm rounded-md border border-slate-800 bg-slate-950 px-4 py-3 text-center text-white shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{viewModel.root.badge}</p>
            <h4 className="text-lg font-bold">{viewModel.root.label}</h4>
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Recommended posture</p>
            </div>
            <p className="mt-1 text-sm font-bold text-emerald-950">Balanced</p>
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
    </div>
  );
};

export default ExecutiveOrgDesignTab;
