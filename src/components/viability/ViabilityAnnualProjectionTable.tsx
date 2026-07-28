import { Table } from "lucide-react";
import { Card } from "../common/Card";
import type { ViabilityAnnualProjectionRow } from "../../lib/viability/types";
import { formatBRL } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";

interface ViabilityAnnualProjectionTableProps {
  rows: ViabilityAnnualProjectionRow[];
}

export default function ViabilityAnnualProjectionTable({
  rows,
}: ViabilityAnnualProjectionTableProps) {
  const { t } = useLocale();
  return (
    <Card
      title={t("viabilityAnnualTableTitle")}
      subtitle={t("viabilityAnnualTableSubtitle")}
      icon={Table}
      className="overflow-hidden"
    >
      <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          {t("viabilityAnnualTableIntro")}
        </p>
      </div>
      <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 sm:hidden">
        {t("viabilityAnnualTableSwipeHint")}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-[1180px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <th className="px-3 py-3">{t("viabilityAnnualTableColYear")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColStudents")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColSections")}</th>
              <th className="px-3 py-3 text-right text-emerald-700">{t("viabilityAnnualTableColRevenue")}</th>
              <th className="px-3 py-3 text-right text-indigo-700">{t("viabilityAnnualTableColPayroll")}</th>
              <th className="px-3 py-3 text-right text-blue-700">{t("viabilityAnnualTableColBenefits")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColOtherOpex")}</th>
              <th className="px-3 py-3 text-right text-slate-700">{t("viabilityAnnualTableColTotalOpex")}</th>
              <th className="px-3 py-3 text-right text-teal-700">{t("viabilityAnnualTableColOperatingResult")}</th>
              <th className="px-3 py-3 text-right text-amber-700">{t("viabilityAnnualTableColCapex")}</th>
              <th className="px-3 py-3 text-right text-teal-700">{t("viabilityAnnualTableColFreeCashFlow")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColDiscountedFcf")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColCumulativeCash")}</th>
              <th className="px-3 py-3 text-right">{t("viabilityAnnualTableColMargin")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.year}
                className={`border-b border-slate-100 text-sm text-slate-600 last:border-b-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                }`}
              >
                <td className="px-3 py-3 font-bold text-slate-900">{row.year}</td>
                <td className="px-3 py-3 text-right tabular-nums">{row.studentsTotal}</td>
                <td className="px-3 py-3 text-right tabular-nums">{row.sectionsTotal}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-700">{formatBRL(row.revenueAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-indigo-700">{formatBRL(row.payrollAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-blue-700">{formatBRL(row.benefitsAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatBRL(row.otherOpexAnnual)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">{formatBRL(row.totalOpexAnnual)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-teal-700">{formatBRL(row.operatingResultAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums text-amber-700">{formatBRL(row.capexAnnual)}</td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums text-teal-700">{formatBRL(row.freeCashFlowAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatBRL(row.discountedCashFlowAnnual)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatBRL(row.cumulativeCashFlowAnnual)}</td>
                <td className="px-3 py-3 text-right font-bold tabular-nums">{row.marginPercent.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
