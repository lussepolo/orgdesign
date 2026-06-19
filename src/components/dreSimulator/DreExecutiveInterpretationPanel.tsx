// Phase 15J.3 — Executive Simulator Interpretation & Board Decision Framing.
//
// Provides a board-facing interpretation layer for the DRE Scenario Simulator.
// Explains what the simulator is ready to support, what remains pending, and
// how to read trade-offs across the five scenario axes.
//
// Governance constraints preserved:
//   - FINANCE_SOURCE_CLOSURE_COMPLETE remains false
//   - BOARD_RATIFICATION_READY remains false
//   - No formula, source value, or calculation change
//   - No winner, recommendation, approved, or ratified language

import { Telescope, Scale, HelpCircle, ClipboardList, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_GOVERNANCE_READINESS,
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
} from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";

// ── How to read this simulator ───────────────────────────────────────────────

const LEVER_EXPLANATIONS = [
  {
    axis: "Opening Package",
    effect: "Changes grade-span scope and operational scale. A wider opening package expands enrollment capacity but activates fixed cost commitments earlier in the ramp.",
  },
  {
    axis: "Occupancy Scenario",
    effect: "Changes enrollment realization risk. Pessimista and Otimista bound the revenue sensitivity range; Intermediário serves as the planning reference.",
  },
  {
    axis: "Tuition Scenario",
    effect: "Changes revenue architecture and the cross-subsidization structure across year levels. Each scenario reflects a distinct pricing and division logic.",
  },
  {
    axis: "Org Design Option",
    effect: "Changes operating-model depth and cost structure. Lower-depth options reduce payroll exposure; higher-depth options increase service quality commitments.",
  },
  {
    axis: "CAPEX",
    effect: "Changes total capital burden but remains outside DRE EBITDA. Capital impact is modeled in the Capital Decision layer through the FCO bridge.",
  },
];

// ── Trade-off framing ─────────────────────────────────────────────────────────

const TRADE_OFF_LENSES = [
  {
    lens: "Growth ambition",
    description:
      "Opening package selection determines how many grade levels activate and at what pace enrollment scales. Higher opening packages carry greater institutional commitment and operational footprint.",
  },
  {
    lens: "Revenue sensitivity",
    description:
      "Occupancy scenario governs how much of licensed capacity converts to enrolled learners. The spread between Pessimista and Otimista bounds the revenue planning range.",
  },
  {
    lens: "Operating-model complexity",
    description:
      "Tuition scenario and org design option together shape per-learner revenue, staffing depth, and cost structure. Each combination implies a different operating model and margin profile.",
  },
  {
    lens: "Capital exposure",
    description:
      "CAPEX investment is a capital-layer variable excluded from DRE EBITDA. It appears in the Capital Decision FCO bridge and determines cash-flow recovery timeline independently of operating results.",
  },
  {
    lens: "Governance readiness",
    description:
      "Finance-source confirmation and Board ratification are pending. Both are required before any scenario can serve as a ratified planning basis. Neither blocks simulation or scenario comparison.",
  },
];

// ── Board decision questions ──────────────────────────────────────────────────

const DECISION_QUESTIONS = [
  {
    lens: "Opening package",
    question:
      "Which opening package best matches the acceptable ramp-up risk and capital activation timeline?",
  },
  {
    lens: "Occupancy",
    question:
      "Which occupancy scenario should be treated as the planning reference for enrollment commitments?",
  },
  {
    lens: "Tuition architecture",
    question:
      "Which tuition architecture should Finance validate and confirm as the revenue basis for planning?",
  },
  {
    lens: "Org design",
    question:
      "Which org design model best balances service depth, staffing sustainability, and operating cost tolerance?",
  },
  {
    lens: "CAPEX",
    question:
      "Which CAPEX assumption should be used for capital-planning stress tests and return-period analysis?",
  },
];

// ── F-code labels for pending evidence panel ──────────────────────────────────

const F_CODE_MAP: Record<string, string> = {
  outras_receitas_reajuste: "F01",
  tuition_source_provenance: "F03",
  discount_schedule_provenance: "F04",
  enrollment_baseline_parity: "F05",
  instructional_capacity_payroll_sync: "F06",
};

const F_LABELS: Record<string, string> = {
  outras_receitas_reajuste: "Outras Receitas index source",
  tuition_source_provenance: "Tuition signed xlsx",
  discount_schedule_provenance: "Discount schedule signed reference",
  enrollment_baseline_parity: "Enrollment baseline reconciliation",
  instructional_capacity_payroll_sync: "Payroll/capacity reconciliation",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DreExecutiveInterpretationPanel() {
  const openItems = DRE_GOVERNANCE_READINESS.openItems;

  return (
    <Card
      title="Executive Simulator Interpretation"
      subtitle="Decision support, not recommendation"
      icon={Telescope}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      {/* ── Status header ──────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              Simulation available
            </div>
            <div className="text-[11px] text-emerald-800">All 108 combinations calculate</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              Finance-source closure pending
            </div>
            <div className="text-[11px] text-amber-800">
              {openItems.length} open assumption items — does not block simulation
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Board ratification pending
            </div>
            <div className="text-[11px] text-slate-600">
              Not yet board-ratified — simulation runs regardless
            </div>
          </div>
        </div>
      </div>

      {/* ── How to read this simulator ─────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            How to read this simulator
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEVER_EXPLANATIONS.map((item) => (
            <div
              key={item.axis}
              className="rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cockpit-teal">
                {item.axis}
              </div>
              <p className="text-xs leading-relaxed text-cockpit-slate">{item.effect}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trade-off framing panel ────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            Trade-off lenses
          </h4>
        </div>
        <div className="space-y-2">
          {TRADE_OFF_LENSES.map((item) => (
            <div
              key={item.lens}
              className="flex gap-3 rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="w-40 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cockpit-indigo">
                  {item.lens}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-cockpit-slate">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Board decision questions ───────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            Planning lens questions for leadership review
          </h4>
        </div>
        <div className="space-y-2">
          {DECISION_QUESTIONS.map((item) => (
            <div
              key={item.lens}
              className="flex gap-3 rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="w-32 shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                  {item.lens}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-cockpit-ink">{item.question}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-cockpit-meta">
          These are planning lens questions, not recommendations. The simulator does not select, rank,
          or endorse any scenario.
        </p>
      </section>

      {/* ── Pending evidence panel ────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            Pending evidence — does not block simulation
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              Finance source closure
            </div>
            <p className="text-xs text-amber-800">
              {FINANCE_SOURCE_CLOSURE_COMPLETE
                ? "Complete"
                : "Pending — Finance source confirmation not yet recorded. Simulation is available regardless."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Board ratification
            </div>
            <p className="text-xs text-slate-600">
              {BOARD_RATIFICATION_READY
                ? "Ready"
                : "Pending — Board ratification not yet recorded. Simulation is available regardless."}
            </p>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {openItems.map((item) => {
            const fCode = F_CODE_MAP[item.key] ?? item.key;
            const label = F_LABELS[item.key] ?? item.label;
            return (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
              >
                <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5 shrink-0">
                  {fCode}
                </span>
                <span className="text-xs text-slate-600">{label}</span>
                <span className="ml-auto text-[10px] text-amber-600 font-medium shrink-0">
                  non-blocking
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Boundary note ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-cockpit-border-soft bg-cockpit-subtle px-4 py-3">
        <p className="text-xs leading-relaxed text-cockpit-slate">
          <span className="font-semibold text-cockpit-ink">Boundary note: </span>
          This simulator supports scenario comparison, sensitivity analysis, and trade-off exploration.
          It is decision support, not a recommendation. No scenario has been selected, approved,
          ratified, or endorsed. Finance-source confirmation and Board ratification remain pending and
          are required before any scenario can serve as a ratified planning basis.
        </p>
      </div>
    </Card>
  );
}
