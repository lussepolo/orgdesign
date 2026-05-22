import { Table } from "lucide-react";
import { Card } from "../common/Card";
import type { ViabilityAnnualProjectionRow } from "../../lib/viability/types";
import { formatBRL } from "../../lib/utils";

interface ViabilityAnnualProjectionTableProps {
  rows: ViabilityAnnualProjectionRow[];
}

export default function ViabilityAnnualProjectionTable({
  rows,
}: ViabilityAnnualProjectionTableProps) {
  return (
    <Card
      title="Annual Cash Flow Table"
      subtitle="Year-by-year operating and cash flow view for review and audit"
      icon={Table}
      className="overflow-hidden"
    >
      <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm leading-relaxed text-slate-600">
          This table is the annual audit layer for the active case. It shows the operating path
          produced from scenario-responsive teaching demand, shared/global non-teaching staffing,
          selected opex and CAPEX assumptions, and discounted cash flow across the planning horizon.
        </p>
      </div>
      <div className="mb-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-500 sm:hidden">
        Swipe horizontally to review revenue, opex, cash flow, and margin columns.
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-[1180px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3 text-right">Students</th>
              <th className="px-3 py-3 text-right">Sections</th>
              <th className="px-3 py-3 text-right text-emerald-700">Revenue</th>
              <th className="px-3 py-3 text-right text-indigo-700">Payroll</th>
              <th className="px-3 py-3 text-right text-blue-700">Benefits</th>
              <th className="px-3 py-3 text-right">Other Opex</th>
              <th className="px-3 py-3 text-right text-slate-700">Total Opex</th>
              <th className="px-3 py-3 text-right text-teal-700">Operating Result</th>
              <th className="px-3 py-3 text-right text-amber-700">CAPEX</th>
              <th className="px-3 py-3 text-right text-teal-700">Free Cash Flow</th>
              <th className="px-3 py-3 text-right">Discounted FCF</th>
              <th className="px-3 py-3 text-right">Cumulative Cash</th>
              <th className="px-3 py-3 text-right">Margin</th>
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
