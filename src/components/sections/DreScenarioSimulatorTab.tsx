import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useDreScenarioSimulator, LAST_PROJECTION_YEAR } from "../../hooks/useDreScenarioSimulator";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ImportFromDreResult } from "../../features/rio-scenario-resilience/state/capitalDecisionWorkspace";
import DreScenarioContextBanner from "../dreSimulator/DreScenarioContextBanner";
import DreLeverPanel from "../dreSimulator/DreLeverPanel";
import DreAnnualTable from "../dreSimulator/DreAnnualTable";
import DreExportButton from "../dreSimulator/DreExportButton";
import DreIncomeStatementDashboard from "../dreSimulator/DreIncomeStatementDashboard";
import WorksheetSyncStamp from "../common/WorksheetSyncStamp";
import { useLocale } from "../../i18n/useLocale";

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
  const { t } = useLocale();
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
          <DreScenarioContextBanner selections={selections} year={year} />
        </div>
        <div className="flex flex-col items-end gap-1 lg:pt-1">
          <WorksheetSyncStamp />
          <DreExportButton
            selections={selections}
            defaultSelections={defaultSelections}
            dreOutput={dreOutput}
            fopagOutput={fopagOutput}
            payrollReconciliation={payrollReconciliation}
            orgDesignSensitivity={orgDesignSensitivity}
            compact
          />
          <p className="text-right text-[10px] leading-tight text-slate-400">
            {t("dreScenarioTabExportNote")}
          </p>
        </div>
      </div>

      <DreIncomeStatementDashboard dreOutput={dreOutput} year={year} onYearChange={setYear} />

      <DreLeverPanel
        selections={selections}
        onChange={(patch) => setSelections({ ...selections, ...patch })}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-sm text-blue-700">
          {t("dreScenarioTabSendIntro")}
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {sendStatus === "limit_reached" && (
            <p className="text-xs font-semibold text-rose-600" role="alert">
              {t("dreScenarioTabLimitReached")}
            </p>
          )}
          <button
            type="button"
            onClick={handleSend}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            {t("dreScenarioTabSendButton")}
          </button>
        </div>
      </div>

      <DreAnnualTable dreOutput={dreOutput} />
    </div>
  );
}
