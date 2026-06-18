import { useEffect, useState } from "react";
import { Download, Send } from "lucide-react";
import { Card } from "../common/Card";
import { useDreScenarioSimulator, LAST_PROJECTION_YEAR } from "../../hooks/useDreScenarioSimulator";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ImportFromDreResult } from "../../features/rio-scenario-resilience/state/capitalDecisionWorkspace";
import DreScenarioContextBanner from "../dreSimulator/DreScenarioContextBanner";
import DreLeverPanel from "../dreSimulator/DreLeverPanel";
import DreSummaryCards from "../dreSimulator/DreSummaryCards";
import DreAnnualTable from "../dreSimulator/DreAnnualTable";
import DreEbitdaChart from "../dreSimulator/DreEbitdaChart";
import DreScopeBoundaryPanel from "../dreSimulator/DreScopeBoundaryPanel";
import OrgDesignPanel from "../dreSimulator/OrgDesignPanel";
import OrgDesignSensitivityPanel from "../dreSimulator/OrgDesignSensitivityPanel";
import DreExportButton from "../dreSimulator/DreExportButton";
import DreAssumptionStatusPanel from "../dreSimulator/DreAssumptionStatusPanel";
import DreBoardReadableExport from "../dreSimulator/DreBoardReadableExport";

interface DreScenarioSimulatorTabProps {
  readonly selections: DreScenarioSimulatorSelections;
  readonly onSelectionsChange: (next: DreScenarioSimulatorSelections) => void;
  readonly onSendToCapitalDecision: (selections: DreScenarioSimulatorSelections) => ImportFromDreResult;
  readonly onNavigateToCapitalDecision: () => void;
}

export default function DreScenarioSimulatorTab({
  selections,
  onSelectionsChange,
  onSendToCapitalDecision,
  onNavigateToCapitalDecision,
}: DreScenarioSimulatorTabProps) {
  const {
    setSelections,
    dreOutput,
    fopagOutput,
    payrollReconciliation,
    orgDesignSensitivity,
    defaultSelections,
  } = useDreScenarioSimulator({ selections, onSelectionsChange });
  const [year, setYear] = useState<OpeningPackageProjectionYear>(LAST_PROJECTION_YEAR);
  const [sendStatus, setSendStatus] = useState<"limit_reached" | null>(null);

  // Clear capacity warning whenever the lever selection changes.
  useEffect(() => {
    setSendStatus(null);
  }, [selections]);

  function handleSend() {
    const result = onSendToCapitalDecision(selections);
    if (result.status === "added" || result.status === "already_present") {
      onNavigateToCapitalDecision();
    } else {
      setSendStatus("limit_reached");
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="flex-1">
          <DreScenarioContextBanner selections={selections} dreOutput={dreOutput} year={year} />
        </div>
        <div className="flex justify-end lg:pt-1">
          <DreExportButton
            selections={selections}
            defaultSelections={defaultSelections}
            dreOutput={dreOutput}
            fopagOutput={fopagOutput}
            payrollReconciliation={payrollReconciliation}
            orgDesignSensitivity={orgDesignSensitivity}
            compact
          />
        </div>
      </div>

      <DreLeverPanel
        selections={selections}
        onChange={(patch) => setSelections({ ...selections, ...patch })}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-700">
          Send the current DRE scenario configuration to Capital Decision for CAPEX analysis.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {sendStatus === "limit_reached" && (
            <p className="text-xs font-semibold text-rose-600" role="alert">
              Capital Decision is at capacity (4 scenarios). Remove a scenario first.
            </p>
          )}
          <button
            type="button"
            onClick={handleSend}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            Send to Capital Decision
          </button>
        </div>
      </div>

      <DreSummaryCards dreOutput={dreOutput} year={year} onYearChange={setYear} />

      <DreEbitdaChart dreOutput={dreOutput} />

      <DreScopeBoundaryPanel />

      <OrgDesignPanel
        orgDesignOptionId={selections.orgDesignOptionId}
        fopagOutput={fopagOutput}
        payrollReconciliation={payrollReconciliation}
        orgDesignSensitivity={orgDesignSensitivity}
        year={year}
      />
      <OrgDesignSensitivityPanel rows={orgDesignSensitivity} />

      <DreAnnualTable dreOutput={dreOutput} />

      <DreAssumptionStatusPanel />

      <DreBoardReadableExport selections={selections} dreOutput={dreOutput} />

      <Card
        title="Export audit workbook"
        subtitle="Audit-grade XLSX export of the scenario above"
        icon={Download}
      >
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          The XLSX export includes formulas, scenario inputs, DRE detail, FOPAG reconciliation, source
          notes, raw engine output, and excludes Phase 15 capital-decision metrics.
        </p>
        <DreExportButton
          selections={selections}
          defaultSelections={defaultSelections}
          dreOutput={dreOutput}
          fopagOutput={fopagOutput}
          payrollReconciliation={payrollReconciliation}
          orgDesignSensitivity={orgDesignSensitivity}
        />
      </Card>
    </div>
  );
}
