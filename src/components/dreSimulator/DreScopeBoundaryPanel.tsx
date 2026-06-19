import { Layers, ShieldCheck, TrendingUp, BookOpen } from "lucide-react";
import { Card } from "../common/Card";

const DRE_OPERATING_ITEMS = [
  "Enrollment (opening package × occupancy)",
  "Tuition and discounts",
  "Receita / ROL",
  "FOPAG-derived payroll rows",
  "Service Contracts as DRE cost lines",
  "Fixed operating DRE rows",
  "EBITDA",
  "XLSX audit export",
];

const CAPITAL_INVESTMENT_ITEMS = [
  "CAPEX bridge",
  "Cash flow after CAPEX",
  "Investment-analysis metrics outside DRE EBITDA",
  "VPL / NPV where supported by the investment-analysis engine",
  "Payback metrics where supported by the investment-analysis engine",
];

const SOURCE_GOVERNANCE_ITEMS = [
  "v8 PnL/DRE workbook is the source of truth for DRE row-level values.",
  "Service Contracts are category-tagged DRE cost lines, not a separate simulator layer.",
  "Folha de Pagamento and Benefícios are generated through the FOPAG/payroll engine.",
  "Older Service Contracts screenshot/extract values are audit-only / superseded.",
];

export default function DreScopeBoundaryPanel() {
  return (
    <Card
      title="Scope & Source Boundary"
      icon={Layers}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        This section defines what is calculated inside the DRE simulator, what remains outside DRE
        EBITDA, and which source governs each value.
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border-l-4 border-cockpit-positive-border bg-cockpit-teal-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-teal">
            <ShieldCheck className="h-3.5 w-3.5" />
            DRE Operating Layer
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            These items form the operating scenario and EBITDA view. They belong inside the DRE
            simulator and are included in operating performance comparison.
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {DRE_OPERATING_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-amber-border bg-cockpit-amber-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-amber">
            <TrendingUp className="h-3.5 w-3.5" />
            Capital / Investment Layer
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            These items sit outside DRE EBITDA. They should not be treated as operating DRE rows,
            but they may appear in the Capital Decision or investment-analysis layer where the
            current engine supports them.
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {CAPITAL_INVESTMENT_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-indigo-border bg-cockpit-indigo-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-indigo">
            <BookOpen className="h-3.5 w-3.5" />
            Source Governance
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            The simulator separates calculation scope from source authority. DRE rows, payroll rows,
            and Service Contracts must remain tied to their governing sources.
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-cockpit-slate">
            {SOURCE_GOVERNANCE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
