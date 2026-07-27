// V10-X1 (2026-07-27): "Matriz de Exportação de Folha" — application export
// surface for the twelve governed G4/G6 × Balanced/Lean × occupancy payroll
// scenarios. Individual XLSX downloads and one batch ZIP download. No
// independent calculation — every workbook is built from
// buildPayrollExportScenarioResult() (calculateFopag()/calculateDre()).
import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, AlertTriangle, CheckCircle2, PackageCheck } from "lucide-react";
import {
  PAYROLL_EXPORT_MATRIX,
  PAYROLL_EXPORT_ZIP_FILENAME,
  PAYROLL_EXPORT_MANIFEST_FILENAME,
  PAYROLL_EXPORT_SUMMARY_WORKBOOK_FILENAME,
  type PayrollExportMatrixRecord,
} from "../../features/rio-scenario-resilience/model/payrollExportMatrixContract";
import {
  buildPayrollExportScenarioResult,
  buildAllPayrollExportScenarioResults,
} from "../../features/rio-scenario-resilience/model/payrollExportScenarioAdapter";
import {
  buildPayrollExportDetailedWorkbook,
  type PayrollExportWorkbookMeta,
} from "../../features/rio-scenario-resilience/model/payrollExportWorkbookBuilder";
import { buildPayrollExportSummaryWorkbook } from "../../features/rio-scenario-resilience/model/payrollExportSummaryWorkbookBuilder";
import { buildPayrollExportManifest } from "../../features/rio-scenario-resilience/model/payrollExportManifest";
import { buildPayrollExportZip, type PayrollExportZipEntry } from "../../features/rio-scenario-resilience/model/payrollExportZip";

// Set by the build; falls back to "dev" outside a tagged build.
const APPLICATION_COMMIT_HASH = "856efc5b82a9d9abf713bf5f341bcb2e6dae8391";
const EXPORT_GENERATOR_VERSION = "v10-x1.1.0.0";

function buildMeta(validationStatus: string): PayrollExportWorkbookMeta {
  return {
    applicationCommitHash: APPLICATION_COMMIT_HASH,
    generationTimestampIso: new Date().toISOString(),
    exportGeneratorVersion: EXPORT_GENERATOR_VERSION,
    validationStatus,
  };
}

function validationStatusFor(record: PayrollExportMatrixRecord): {
  ok: boolean;
  label: string;
} {
  const scenarioResult = buildPayrollExportScenarioResult(record);
  return scenarioResult.fopagOutput.calculationReady
    ? { ok: true, label: "Pronto" }
    : { ok: false, label: "Bloqueado" };
}

export default function PayrollExportMatrixTab() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = generatingId !== null || isBatchGenerating;

  const handleIndividualExport = (record: PayrollExportMatrixRecord) => {
    if (isBusy) return;
    setError(null);
    setGeneratingId(record.matrixScenarioId);
    try {
      const scenarioResult = buildPayrollExportScenarioResult(record);
      const meta = buildMeta(
        scenarioResult.fopagOutput.calculationReady ? "calculation_ready" : "not_ready",
      );
      const workbook = buildPayrollExportDetailedWorkbook(scenarioResult, meta);
      XLSX.writeFile(workbook, record.filename);
    } catch (e) {
      setError(
        `Falha ao gerar ${record.filename}: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const handleBatchExport = async () => {
    if (isBusy) return;
    setError(null);
    setIsBatchGenerating(true);
    try {
      const scenarioResults = buildAllPayrollExportScenarioResults(PAYROLL_EXPORT_MATRIX);
      const generationTimestampIso = new Date().toISOString();
      const allReady = scenarioResults.every((sr) => sr.fopagOutput.calculationReady);
      const meta = buildMeta(allReady ? "calculation_ready" : "not_ready");

      const zipEntries: PayrollExportZipEntry[] = [];
      for (const scenarioResult of scenarioResults) {
        const workbook = buildPayrollExportDetailedWorkbook(scenarioResult, meta);
        const bytes = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Uint8Array;
        zipEntries.push({ filename: scenarioResult.record.filename, bytes });
      }

      const summaryWorkbook = buildPayrollExportSummaryWorkbook(scenarioResults);
      const summaryBytes = XLSX.write(summaryWorkbook, { type: "buffer", bookType: "xlsx" }) as Uint8Array;
      zipEntries.push({ filename: PAYROLL_EXPORT_SUMMARY_WORKBOOK_FILENAME, bytes: summaryBytes });

      const manifest = buildPayrollExportManifest(
        scenarioResults,
        APPLICATION_COMMIT_HASH,
        generationTimestampIso,
      );
      const manifestBytes = new TextEncoder().encode(JSON.stringify(manifest, null, 2));
      zipEntries.push({ filename: PAYROLL_EXPORT_MANIFEST_FILENAME, bytes: manifestBytes });

      const zipBytes = await buildPayrollExportZip(zipEntries);
      const blob = new Blob([zipBytes], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = PAYROLL_EXPORT_ZIP_FILENAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`Falha ao gerar o ZIP: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsBatchGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Matriz de Exportação de Folha</h2>
          <p className="text-sm text-slate-500">
            Doze cenários governados de folha de pagamento — Início G4/G6 × Folha
            Balanced/Lean × Ocupação Conservadora/Base/Otimista.
          </p>
        </div>
        <button
          type="button"
          onClick={handleBatchExport}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-xl border border-cockpit-navy bg-cockpit-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-cockpit-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PackageCheck className="h-4 w-4" />
          {isBatchGenerating ? "Gerando ZIP…" : "Baixar os 12 cenários"}
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-cockpit-risk-border bg-cockpit-risk-fill px-3 py-2 text-xs font-semibold text-cockpit-risk">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Início</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Folha</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Ocupação</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-600">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PAYROLL_EXPORT_MATRIX.map((record) => {
              const status = validationStatusFor(record);
              const rowBusy = generatingId === record.matrixScenarioId;
              return (
                <tr key={record.matrixScenarioId}>
                  <td className="px-4 py-2 text-slate-800">{record.openingPackageLabel}</td>
                  <td className="px-4 py-2 text-slate-800">{record.payrollLabel}</td>
                  <td className="px-4 py-2 text-slate-800">{record.occupancyLabel}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        status.ok
                          ? "inline-flex items-center gap-1 rounded-full bg-cockpit-positive-fill px-2 py-0.5 text-xs font-semibold text-cockpit-positive"
                          : "inline-flex items-center gap-1 rounded-full bg-cockpit-risk-fill px-2 py-0.5 text-xs font-semibold text-cockpit-risk"
                      }
                    >
                      {status.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => handleIndividualExport(record)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cockpit-teal-muted bg-cockpit-teal-fill px-3 py-1.5 text-xs font-bold text-cockpit-teal transition hover:bg-cockpit-positive-fill disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {rowBusy ? "Gerando…" : "Baixar XLSX"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
