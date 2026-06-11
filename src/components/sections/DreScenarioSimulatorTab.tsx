import { useState } from "react";
import { Download } from "lucide-react";
import { Card } from "../common/Card";
import { useDreScenarioSimulator, LAST_PROJECTION_YEAR } from "../../hooks/useDreScenarioSimulator";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import DreScenarioContextBanner from "../dreSimulator/DreScenarioContextBanner";
import DreLeverPanel from "../dreSimulator/DreLeverPanel";
import DreSummaryCards from "../dreSimulator/DreSummaryCards";
import DreAnnualTable from "../dreSimulator/DreAnnualTable";
import DreEbitdaChart from "../dreSimulator/DreEbitdaChart";
import DreScopeBoundaryPanel from "../dreSimulator/DreScopeBoundaryPanel";
import OrgDesignPanel from "../dreSimulator/OrgDesignPanel";
import OrgDesignSensitivityPanel from "../dreSimulator/OrgDesignSensitivityPanel";
import DreExportButton from "../dreSimulator/DreExportButton";

export default function DreScenarioSimulatorTab() {
  const {
    selections,
    setSelections,
    dreOutput,
    fopagOutput,
    payrollReconciliation,
    orgDesignSensitivity,
    defaultSelections,
  } = useDreScenarioSimulator();
  const [year, setYear] = useState<OpeningPackageProjectionYear>(LAST_PROJECTION_YEAR);

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
        onChange={(patch) => setSelections((current) => ({ ...current, ...patch }))}
      />

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
