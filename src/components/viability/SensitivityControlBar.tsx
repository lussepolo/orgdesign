import { Grid2x2 } from "lucide-react";
import { Card } from "../common/Card";
import type {
  SensitivityVariable,
  ViabilityMetric,
} from "../../lib/viability/types";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

const VARIABLE_LABEL_KEYS: Record<SensitivityVariable, TranslationKey> = {
  enrollmentScenario: "sensitivityControlVarEnrollment",
  tuitionScenario: "sensitivityControlVarTuition",
  costScenario: "sensitivityControlVarCost",
  discountRate: "sensitivityControlVarDiscountRate",
  payrollGrowthRate: "sensitivityControlVarPayrollGrowth",
  benefitsGrowthRate: "sensitivityControlVarBenefitsGrowth",
  opexGrowthRate: "sensitivityControlVarOpexGrowth",
  tuitionGrowthRate: "sensitivityControlVarTuitionGrowth",
};

interface SensitivityControlBarProps {
  metric: ViabilityMetric;
  rowVariable: SensitivityVariable;
  columnVariable: SensitivityVariable;
  onMetricChange: (metric: ViabilityMetric) => void;
  onRowVariableChange: (value: SensitivityVariable) => void;
  onColumnVariableChange: (value: SensitivityVariable) => void;
}

export default function SensitivityControlBar({
  metric,
  rowVariable,
  columnVariable,
  onMetricChange,
  onRowVariableChange,
  onColumnVariableChange,
}: SensitivityControlBarProps) {
  const { t } = useLocale();
  const variableKeys = Object.keys(VARIABLE_LABEL_KEYS) as SensitivityVariable[];

  return (
    <Card
      title={t("sensitivityControlTitle")}
      subtitle={t("sensitivityControlSubtitle")}
      icon={Grid2x2}
    >
      <div className="mb-4 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
            {t("sensitivityControlReadingRuleLabel")}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {t("sensitivityControlReadingRuleBody")}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-white/70 p-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
            {t("sensitivityControlCurrentStatusLabel")}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {t("sensitivityControlCurrentStatusBody")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("sensitivityControlCellMetricLabel")}
          </div>
          <select
            value={metric}
            onChange={(event) => onMetricChange(event.target.value as ViabilityMetric)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            <option value="VPL">VPL</option>
            <option value="TIR">TIR</option>
            <option value="Payback">Payback</option>
          </select>
        </label>
        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("sensitivityControlRowsVaryLabel")}
          </div>
          <select
            value={rowVariable}
            onChange={(event) => onRowVariableChange(event.target.value as SensitivityVariable)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            {variableKeys.map((key) => (
              <option key={key} value={key}>
                {t(VARIABLE_LABEL_KEYS[key])}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t("sensitivityControlColumnsVaryLabel")}
          </div>
          <select
            value={columnVariable}
            onChange={(event) => onColumnVariableChange(event.target.value as SensitivityVariable)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400"
          >
            {variableKeys.map((key) => (
              <option key={key} value={key}>
                {t(VARIABLE_LABEL_KEYS[key])}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        {t("sensitivityControlFooterNote")}
      </p>
    </Card>
  );
}
