import { Lightbulb } from "lucide-react";
import { Card } from "../common/Card";
import type { SensitivityViewModel } from "../../lib/viability/types";

interface SensitivityInterpretationStripProps {
  viewModel: SensitivityViewModel;
}

export default function SensitivityInterpretationStrip({
  viewModel,
}: SensitivityInterpretationStripProps) {
  return (
    <Card
      title="Interpretation & Fixed Assumptions"
      subtitle="Matrix reading guidance and assumptions held constant"
      icon={Lightbulb}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Semantic Contract
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {viewModel.semantics.map((line) => (
              <li key={line} className="rounded-xl bg-slate-50 px-3 py-2 leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
              Analytical status
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Use this view to compare directions and relative pressure points. Treat the current cell
              values as indicative until the matrix is wired to the full baseline engine.
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Assumptions Held Fixed
          </div>
          <div className="mt-3 space-y-2">
            {viewModel.fixedAssumptions.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className="text-right text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
