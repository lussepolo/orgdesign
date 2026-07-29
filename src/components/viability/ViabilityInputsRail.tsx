import { Settings2 } from "lucide-react";
import { Card } from "../common/Card";
import type {
  ViabilityCapexCategoryRow,
  ViabilityCostScenario,
  ViabilityEnrollmentScenario,
  ViabilitySimulatorState,
  ViabilityTuitionScenario,
} from "../../lib/viability/types";
import { useLocale } from "../../i18n/useLocale";
import { formatCurrencyBRL } from "../../i18n/formatters";

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
  const { t, locale } = useLocale();
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
      title={t("viabilityRailTitle")}
      subtitle={t("viabilityRailSubtitle")}
      icon={Settings2}
      className="h-full"
    >
      <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-700">
          {t("viabilityRailCurrentInputsLabel")}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {t("viabilityRailCurrentInputsBody")}
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("viabilityRailEnrollmentScenarioLabel")}
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
            <option value="pessimista">{t("scenarioPessimista")}</option>
            <option value="base">{t("scenarioBase")}</option>
            <option value="otimista">{t("scenarioOtimista")}</option>
            <option value="full-seat">{t("scenarioFullSeat")}</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {t("viabilityRailEnrollmentScenarioNote")}
          </p>
        </label>

        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("viabilityRailTuitionScenarioLabel")}
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
            {t("viabilityRailTuitionScenarioNote")}
          </p>
        </label>

        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("viabilityRailCostScenarioLabel")}
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
            <option value="lean">{t("viabilityRailCostLean")}</option>
            <option value="base">{t("viabilityRailCostBase")}</option>
            <option value="stress">{t("viabilityRailCostStress")}</option>
          </select>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {t("viabilityRailCostScenarioNote")}
          </p>
        </label>

        <NumberField
          label={t("viabilityRailProjectionHorizonLabel")}
          value={state.projectionHorizonYears}
          disabled
          note={t("viabilityRailProjectionHorizonNote")}
          onChange={(value) => onStateChange({ projectionHorizonYears: value })}
        />
        <NumberField
          label={t("viabilityRailDiscountRateLabel")}
          value={state.discountRate}
          step={0.5}
          note={t("viabilityRailDiscountRateNote")}
          onChange={(value) => onStateChange({ discountRate: value })}
        />
        <NumberField
          label={t("viabilityRailPayrollGrowthRateLabel")}
          value={state.payrollGrowthRate}
          step={0.5}
          note={t("viabilityRailPayrollGrowthRateNote")}
          onChange={(value) => onStateChange({ payrollGrowthRate: value })}
        />
        <NumberField
          label={t("viabilityRailBenefitsGrowthRateLabel")}
          value={state.benefitsGrowthRate}
          step={0.5}
          note={t("viabilityRailBenefitsGrowthRateNote")}
          onChange={(value) => onStateChange({ benefitsGrowthRate: value })}
        />
        <NumberField
          label={t("viabilityRailOpexGrowthRateLabel")}
          value={state.opexGrowthRate}
          step={0.5}
          note={t("viabilityRailOpexGrowthRateNote")}
          onChange={(value) => onStateChange({ opexGrowthRate: value })}
        />
        <NumberField
          label={t("viabilityRailTuitionGrowthRateLabel")}
          value={state.tuitionGrowthRate}
          step={0.5}
          note={t("viabilityRailTuitionGrowthRateNote")}
          onChange={(value) => onStateChange({ tuitionGrowthRate: value })}
        />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                {t("viabilityRailCapexStructureLabel")}
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {t("viabilityRailCapexStructureValue")}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {t("viabilityRailCapexStructureBody")}
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
                {t("viabilityTabSingleTotalValue")}
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
                {t("viabilityTabStructuredByCategoryValue")}
              </button>
            </div>
          </div>

          {state.capexMode === "single-total" ? (
            <div className="mt-4 space-y-4">
              <NumberField
                label={t("viabilityRailTotalCapexAmountLabel")}
                value={state.initialCapex}
                step={500000}
                note={t("viabilityRailTotalCapexAmountNote")}
                onChange={(value) => onStateChange({ initialCapex: value })}
              />
              <TextAreaField
                label={t("viabilityRailCapexIncludedLabel")}
                value={state.capexIncluded}
                required
                note={t("viabilityRailCapexIncludedNote")}
                onChange={(value) => onStateChange({ capexIncluded: value })}
              />
              <TextAreaField
                label={t("viabilityRailCapexExcludedLabel")}
                value={state.capexExcluded}
                required
                note={t("viabilityRailCapexExcludedNote")}
                onChange={(value) => onStateChange({ capexExcluded: value })}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  {t("viabilityRailIncludedStructuredTotalLabel")}
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {formatCurrencyBRL(structuredCapexTotal, locale)}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  {t("viabilityRailIncludedStructuredTotalNote")}
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-[860px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-3 py-3">{t("viabilityRailColCategory")}</th>
                      <th className="px-3 py-3">{t("viabilityRailColIncluded")}</th>
                      <th className="px-3 py-3">{t("viabilityRailColYear")}</th>
                      <th className="px-3 py-3">{t("viabilityRailColAmount")}</th>
                      <th className="px-3 py-3">{t("viabilityRailColNote")}</th>
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
                            placeholder={t("viabilityRailScopeNotePlaceholder")}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {t("viabilityRailStructuredFooterNote")}
              </p>
            </div>
          )}
        </div>
        <NumberField
          label={t("viabilityRailRecurringCapexLabel")}
          value={state.recurringCapexAnnual}
          step={100000}
          note={t("viabilityRailRecurringCapexNote")}
          onChange={(value) => onStateChange({ recurringCapexAnnual: value })}
        />
      </div>
    </Card>
  );
}
