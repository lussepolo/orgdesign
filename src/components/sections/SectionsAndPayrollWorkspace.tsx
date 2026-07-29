import { useState } from "react";
import { FlaskConical, PackageCheck } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import WorkspaceContextBanner from "../common/WorkspaceContextBanner";
import PayrollProjectionTab from "./PayrollProjectionTab";
import PayrollExportMatrixTab from "./PayrollExportMatrixTab";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "../../features/rio-scenario-resilience/model/revenueInputs";

type PayrollSubviewId = "sections-staffing-simulation" | "governed-payroll-exports";

const SUBVIEWS: Array<{ id: PayrollSubviewId; labelKey: "wsPayrollSubviewALabel" | "wsPayrollSubviewBLabel"; icon: typeof FlaskConical }> = [
  { id: "sections-staffing-simulation", labelKey: "wsPayrollSubviewALabel", icon: FlaskConical },
  { id: "governed-payroll-exports", labelKey: "wsPayrollSubviewBLabel", icon: PackageCheck },
];

interface SectionsAndPayrollWorkspaceProps {
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly tuitionScenarioId: TuitionScenarioId;
}

// V10-X2T: "Turmas, Equipe Pedagógica e Folha de Pagamento" primary
// workspace. Wraps PayrollProjectionTab and PayrollExportMatrixTab as two
// subviews rather than duplicating either. No calculation logic lives in
// this file — it only forwards the shared scenario contract (V10-RC2.2)
// down to PayrollProjectionTab, same as App.tsx does for ExecutiveOrgDesignTab.
export default function SectionsAndPayrollWorkspace({
  openingPackageId,
  occupancyScenarioId,
  tuitionScenarioId,
}: SectionsAndPayrollWorkspaceProps) {
  const { t } = useLocale();
  const [activeSubview, setActiveSubview] = useState<PayrollSubviewId>("sections-staffing-simulation");

  return (
    <div>
      <div
        role="tablist"
        aria-label={t("wsPayrollTitle")}
        className="mb-6 inline-flex rounded-2xl bg-slate-100 p-1"
      >
        {SUBVIEWS.map((subview) => {
          const Icon = subview.icon;
          const active = activeSubview === subview.id;
          return (
            <button
              key={subview.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSubview(subview.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all md:text-sm",
                active ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-200",
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", active ? "text-white" : "text-slate-400")} />
              {t(subview.labelKey)}
            </button>
          );
        })}
      </div>

      <WorkspaceContextBanner workspaceId="payroll" activeSubviewId={activeSubview} />

      {activeSubview === "sections-staffing-simulation" ? (
        <PayrollProjectionTab
          openingPackageId={openingPackageId}
          occupancyScenarioId={occupancyScenarioId}
          tuitionScenarioId={tuitionScenarioId}
        />
      ) : (
        <PayrollExportMatrixTab />
      )}
    </div>
  );
}
