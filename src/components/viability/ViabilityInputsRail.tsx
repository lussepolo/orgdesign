import { Settings2 } from "lucide-react";
import { Card } from "../common/Card";
import type {
  ViabilityCapexCategoryRow,
  ViabilityCostScenario,
  ViabilityEnrollmentScenario,
  ViabilitySimulatorState,
  ViabilityTuitionScenario,
} from "../../lib/viability/types";

interface ViabilityInputsRailProps {
  state: ViabilitySimulatorState;
  onStateChange: (patch: Partial<ViabilitySimulatorState>) => void;
}

function sumIncludedCapex(categories: ViabilityCapexCategoryRow[]): number {
  return categories.reduce(
    (sum, row) => sum + (row.included ? Number(row.amount) || 0 : 0),
    0,
  );
}

function NumberField(props: {
  label: string;
  value: number;
  note?: string;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {props.label}
      </div>
      <input
        type="number"
        value={props.value}
        step={props.step ?? 1}
        disabled={props.disabled}
        onChange={(event) => props.onChange(Number(event.target.value))}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
      {props.note && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{props.note}</p>}
    </label>
  );
}

function TextAreaField(props: {
  label: string;
  value: string;
  note?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        {props.label}
        {props.required && <span className="ml-1 text-rose-500">*</span>}
      </div>
      <textarea
        value={props.value}
        rows={4}
        onChange={(event) => props.onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
      />
      {props.note && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{props.note}</p>}
    </label>
  );
}

export default function ViabilityInputsRail({
  state,
  onStateChange,
}: ViabilityInputsRailProps) {
  const structuredCapexTotal = sumIncludedCapex(state.capexCategories);

  const patchCapexCategory = (
    categoryId: string,
    patch: Partial<ViabilityCapexCategoryRow>,
  ) => {
    const capexCategories = state.capexCategories.map((row) =>
      row.id === categoryId ? { ...row, ...patch } : row,
    );

    onStateChange({
      capexCategories,
      ...(state.capexMode === "structured"
        ? { initialCapex: sumIncludedCapex(capexCategories) }
        : {}),
    });
  };

  return (
    <Card
      title="Case Setup"
      subtitle="Operating, pricing, cost, and capital assumptions for the active case"
      icon={Settings2}
      className="h-full"
    >
      <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">
          Current planning inputs
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          These inputs define the active case. Baseline uses them directly. Sensitivity and threshold
          analysis inherit the same context except where a screen deliberately varies a selected
          assumption.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Enrollment Scenario
          </div>
          <select
            value={state.enrollmentScenario}
            onChange={(event) =>
              onStateChange({
                enrollmentScenario: event.target.value as ViabilityEnrollmentScenario,
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="pessimista">Pessimista</option>
            <option value="intermediario">Intermediário</option>
            <option value="otimista">Otimista</option>
            <option value="full-seat">Full Seat</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Sets the teaching-side operating path. This baseline run already propagates the selected
            scenario through students, turmas, teaching payroll, revenue, and downstream cost outputs.
            Full Seat currently reuses the optimistic operating path until a dedicated capacity schedule
            is introduced.
          </p>
        </label>

        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Tuition Scenario
          </div>
          <select
            value={state.tuitionScenario}
            onChange={(event) =>
              onStateChange({
                tuitionScenario: event.target.value as ViabilityTuitionScenario,
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="cen1">RJ Cen 1</option>
            <option value="cen2">RJ Cen 2</option>
            <option value="cen3">RJ Cen 3</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Selects the pricing context for the active case. Held fixed unless a later analysis varies it.
          </p>
        </label>

        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Cost Scenario
          </div>
          <select
            value={state.costScenario}
            onChange={(event) =>
              onStateChange({
                costScenario: event.target.value as ViabilityCostScenario,
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="lean">Lean</option>
            <option value="base">Base</option>
            <option value="stress">Stress</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            Applies the non-payroll opex envelope around the live payroll model. Non-teaching staffing
            remains shared/global and does not become scenario-responsive in the current model.
          </p>
        </label>

        <NumberField
          label="Projection Horizon (Years)"
          value={state.projectionHorizonYears}
          disabled
          note="Locked to the current planning horizon: 2028-2047."
          onChange={(value) => onStateChange({ projectionHorizonYears: value })}
        />
        <NumberField
          label="Discount Rate"
          value={state.discountRate}
          step={0.5}
          note="Used to discount free cash flow across the full baseline projection."
          onChange={(value) => onStateChange({ discountRate: value })}
        />
        <NumberField
          label="Payroll Growth Rate"
          value={state.payrollGrowthRate}
          step={0.5}
          note="Applies annual growth to payroll excluding benefits while preserving the live staffing path."
          onChange={(value) => onStateChange({ payrollGrowthRate: value })}
        />
        <NumberField
          label="Benefits Growth Rate"
          value={state.benefitsGrowthRate}
          step={0.5}
          note="Applies annual growth to benefits separately from payroll so the annual projection keeps the split explicit."
          onChange={(value) => onStateChange({ benefitsGrowthRate: value })}
        />
        <NumberField
          label="Opex Growth Rate"
          value={state.opexGrowthRate}
          step={0.5}
          note="Applies to non-payroll operating expenses layered on top of live payroll output."
          onChange={(value) => onStateChange({ opexGrowthRate: value })}
        />
        <NumberField
          label="Tuition Growth Rate"
          value={state.tuitionGrowthRate}
          step={0.5}
          note="Overrides annual tuition escalation while keeping the selected student ramp and sections path."
          onChange={(value) => onStateChange({ tuitionGrowthRate: value })}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                CAPEX Structure
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                Define how opening capital is represented in the active case
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Single total mode keeps one upfront CAPEX total in the first projection year.
                Structured mode now uses included category rows and their declared years to phase
                CAPEX across the annual baseline projection.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-white p-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() =>
                  onStateChange({
                    capexMode: "single-total",
                  })
                }
                className={`rounded-full px-3 py-1.5 transition ${
                  state.capexMode === "single-total"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500"
                }`}
              >
                Single total
              </button>
              <button
                type="button"
                onClick={() =>
                  onStateChange({
                    capexMode: "structured",
                    initialCapex: structuredCapexTotal,
                  })
                }
                className={`rounded-full px-3 py-1.5 transition ${
                  state.capexMode === "structured"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500"
                }`}
              >
                Structured by category
              </button>
            </div>
          </div>

          {state.capexMode === "single-total" ? (
            <div className="mt-4 space-y-4">
              <NumberField
                label="Total CAPEX Amount"
                value={state.initialCapex}
                step={500000}
                note="One upfront capital outlay applied in the first projection year."
                onChange={(value) => onStateChange({ initialCapex: value })}
              />
              <TextAreaField
                label="What is included in this CAPEX"
                value={state.capexIncluded}
                required
                note="Required scope note so the capital program is explicit about what the total covers."
                onChange={(value) => onStateChange({ capexIncluded: value })}
              />
              <TextAreaField
                label="What is excluded from this CAPEX"
                value={state.capexExcluded}
                required
                note="Required boundary note so operating costs and later investments are not silently mixed into opening CAPEX."
                onChange={(value) => onStateChange({ capexExcluded: value })}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Included Structured Total
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  R$ {structuredCapexTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Included category rows are summed here and then scheduled into the baseline by their
                  declared year.
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Included</th>
                      <th className="px-3 py-3">Year</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.capexCategories.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 align-top text-sm text-slate-600 last:border-b-0">
                        <td className="px-3 py-3 font-medium text-slate-900">{row.category}</td>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={row.included}
                            onChange={(event) =>
                              patchCapexCategory(row.id, { included: event.target.checked })
                            }
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={row.year}
                            step={1}
                            onChange={(event) =>
                              patchCapexCategory(row.id, { year: Number(event.target.value) })
                            }
                            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={row.amount}
                            step={50000}
                            onChange={(event) =>
                              patchCapexCategory(row.id, { amount: Number(event.target.value) })
                            }
                            className="w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={row.note}
                            onChange={(event) =>
                              patchCapexCategory(row.id, { note: event.target.value })
                            }
                            placeholder="Scope note"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Category year now drives annual CAPEX timing in the baseline model. Recurring CAPEX
                still applies every year on top of these scheduled outflows.
              </p>
            </div>
          )}
        </div>
        <NumberField
          label="Recurring CAPEX / Year"
          value={state.recurringCapexAnnual}
          step={100000}
          note="Annual sustaining capital layered into free cash flow after the opening year."
          onChange={(value) => onStateChange({ recurringCapexAnnual: value })}
        />
      </div>
    </Card>
  );
}
