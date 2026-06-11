import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { buildDreScenarioWorkbook, buildDreScenarioExportFilename } from "./dreScenarioWorkbook";
import type {
  DreScenarioSimulatorSelections,
  OrgDesignSensitivityRow,
  PayrollReconciliationResult,
} from "../../hooks/useDreScenarioSimulator";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { FopagEngineOutput } from "../../features/rio-scenario-resilience/model/fopagEngineContract";

interface DreExportButtonProps {
  selections: DreScenarioSimulatorSelections;
  defaultSelections: DreScenarioSimulatorSelections;
  dreOutput: DreEngineOutput;
  fopagOutput: FopagEngineOutput;
  payrollReconciliation: PayrollReconciliationResult;
  orgDesignSensitivity: readonly OrgDesignSensitivityRow[];
  // Phase 14B-UI: smaller secondary placement (e.g. near the page header).
  // Styling only — export logic and the reconciliation guard are unchanged.
  compact?: boolean;
}

// Phase 14B: exports the currently selected DRE scenario as an audit-grade
// XLSX workbook. Uses the same unified scenario result already computed by
// useDreScenarioSimulator() — no independent recalculation. If the FOPAG/DRE
// payroll reconciliation (Phase 14A.1) has failed, export is blocked.
export default function DreExportButton({
  selections,
  defaultSelections,
  dreOutput,
  fopagOutput,
  payrollReconciliation,
  orgDesignSensitivity,
  compact = false,
}: DreExportButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    if (!payrollReconciliation.isReconciled) {
      setError(
        `Export blocked: FOPAG/DRE payroll reconciliation failed with ` +
          `${payrollReconciliation.mismatches.length} mismatch(es). Resolve the ` +
          `reconciliation before exporting.`,
      );
      return;
    }
    setError(null);

    const exportedAt = new Date();
    const workbook = buildDreScenarioWorkbook({
      selections,
      defaultSelections,
      dreOutput,
      fopagOutput,
      payrollReconciliation,
      orgDesignSensitivity,
      exportedAt,
    });
    const filename = buildDreScenarioExportFilename(selections, exportedAt);
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleExport}
        title="Export audit workbook (XLSX)"
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-xl border border-cockpit-teal-muted bg-cockpit-teal-fill px-3 py-1.5 text-xs font-bold text-cockpit-teal transition hover:bg-cockpit-positive-fill"
            : "inline-flex items-center gap-2 rounded-xl border border-cockpit-navy bg-cockpit-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-cockpit-ink"
        }
      >
        <Download className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Export XLSX
      </button>
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-cockpit-risk-border bg-cockpit-risk-fill px-3 py-2 text-xs font-semibold text-cockpit-risk">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
