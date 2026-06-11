import { Layers, ShieldCheck, BookOpen, XCircle } from "lucide-react";
import { Card } from "../common/Card";

const INCLUDED_ITEMS = [
  "Enrollment (opening package × occupancy)",
  "Tuition and discounts",
  "Receita / ROL",
  "FOPAG-derived payroll rows",
  "Service Contracts as DRE cost lines",
  "Fixed operating DRE rows",
  "EBITDA",
  "XLSX audit export",
];

const EXCLUDED_ITEMS = [
  "CAPEX bridge",
  "Cash-flow after CAPEX",
  "DCF",
  "NPV / VPL",
  "Payback",
  "Discounted payback",
  "Investment recovery",
  "Tier",
];

// Phase 14B-UI-VISUAL-FIXES: refined into a compact "Scope & Source Boundary"
// card with three small blocks (Included / Excluded / Source governance)
// using left-border accents and chips instead of large filled
// emerald/rose panels. Wording and scope content are unchanged from the
// Phase 14B version — the "Excluded until Phase 15" list still mirrors
// dreScenarioWorkbook.ts's README sheet.
export default function DreScopeBoundaryPanel() {
  return (
    <Card
      title="Scope & Source Boundary"
      icon={Layers}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        Operating drivers, Phase 14 scope, and the Phase 15 boundary. Service Contracts are
        category-tagged DRE cost lines, not a separate simulator layer; Folha de Pagamento and
        Benefícios are generated through the FOPAG/payroll engine.
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border-l-4 border-cockpit-positive-border bg-cockpit-teal-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-teal">
            <ShieldCheck className="h-3.5 w-3.5" />
            Included in Phase 14
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {INCLUDED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-risk-border bg-cockpit-risk-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-risk">
            <XCircle className="h-3.5 w-3.5" />
            Excluded until Phase 15
          </div>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {EXCLUDED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-indigo-border bg-cockpit-indigo-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-indigo">
            <BookOpen className="h-3.5 w-3.5" />
            Source governance
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-cockpit-slate">
            <li>v8 PnL/DRE workbook is the source of truth for DRE row-level values.</li>
            <li>Service Contracts are category-tagged DRE cost lines, not a separate simulator layer.</li>
            <li>Folha de Pagamento and Benefícios are generated through the FOPAG/payroll engine.</li>
            <li>Older Service Contracts screenshot/extract values are audit-only / superseded.</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
