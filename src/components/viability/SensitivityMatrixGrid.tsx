import { Card } from "../common/Card";
import type { SensitivityViewModel } from "../../lib/viability/types";
import { formatMetricValue } from "../../lib/viability/formatters";
import { cn } from "../../lib/utils";

function formatVariableLabel(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}

interface SensitivityMatrixGridProps {
  viewModel: SensitivityViewModel;
}

export default function SensitivityMatrixGrid({
  viewModel,
}: SensitivityMatrixGridProps) {
  return (
    <Card
      title="Sensitivity Matrix"
      subtitle={`Metric shown: ${viewModel.metric} · row axis: ${formatVariableLabel(viewModel.rowVariable)} · column axis: ${formatVariableLabel(viewModel.columnVariable)}`}
    >
      <div className="mb-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:grid-cols-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
            Rows Vary
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">{formatVariableLabel(viewModel.rowVariable)}</div>
          <p className="mt-1 text-xs text-slate-500">
            Every row changes only this variable across the displayed runs.
          </p>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
            Columns Vary
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">{formatVariableLabel(viewModel.columnVariable)}</div>
          <p className="mt-1 text-xs text-slate-500">
            Every column changes only this variable across the displayed runs.
          </p>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
            Metric Displayed
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">{viewModel.metric}</div>
          <p className="mt-1 text-xs text-slate-500">
            Each cell shows this single output metric from one model run.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Row axis
                <div className="mt-1 text-sm font-bold normal-case tracking-normal text-slate-900">
                  {formatVariableLabel(viewModel.rowVariable)}
                </div>
              </th>
              {viewModel.columnOptions.map((option) => (
                <th
                  key={option.value}
                  className="min-w-[160px] px-3 py-2 text-left text-[10px] uppercase tracking-[0.2em] text-slate-400"
                >
                  Column value
                  <div className="mt-1 text-sm font-bold normal-case tracking-normal text-slate-900">
                    {option.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viewModel.matrix.map((row, rowIndex) => (
              <tr key={viewModel.rowOptions[rowIndex].value}>
                <th className="px-3 py-2 text-left">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    Row value
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">
                    {viewModel.rowOptions[rowIndex].label}
                  </div>
                </th>
                {row.map((cell) => (
                  <td key={cell.runLabel}>
                    <div
                      className={cn(
                        "rounded-2xl border border-slate-200 bg-slate-50 p-3 transition",
                        "hover:border-slate-400 hover:bg-white",
                      )}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Model Run
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-900">
                        {formatMetricValue(viewModel.metric, cell.value)}
                      </div>
                      <div className="mt-2 grid gap-2 text-[11px] text-slate-500">
                        <div>
                          <span className="font-bold text-slate-700">Row:</span> {cell.rowValue}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Column:</span> {cell.columnValue}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          {viewModel.metric}
                        </div>
                        <div className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Directional
                        </div>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
