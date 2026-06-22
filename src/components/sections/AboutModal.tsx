import {
  FileText,
  Baby,
  School,
  Database,
  GraduationCap,
  Activity,
  DollarSign,
  X,
  LayoutDashboard,
  Layers,
  GitBranch,
  Scale,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  const tabs = [
    { icon: LayoutDashboard, label: "Cover", color: "bg-slate-100 text-slate-700", desc: "Model overview and entry point." },
    { icon: Layers, label: "Cenários da Oferta", color: "bg-teal-100 text-teal-700", desc: "Grade ceiling, capacity, target enrollment, academic ecosystem, and signature-program maturity by scenario." },
    { icon: GitBranch, label: "Executive Org Design", color: "bg-indigo-100 text-indigo-700", desc: "Full Rio organization tree by scenario and year." },
    { icon: FileText, label: "Hiring Profile Cards", color: "bg-blue-100 text-blue-700", desc: "Role-level hiring specs for MS and HS clusters. Each card defines ownership, qualifications, and cluster configuration." },
    { icon: Baby, label: "Early Years", color: "bg-rose-100 text-rose-700", desc: "EY staffing architecture — Toddlers through Kindergarten. Integral and Manhã shift structure, Associate-tier lead educators, Monitor and Assistant support ratios." },
    { icon: School, label: "Lower School", color: "bg-emerald-100 text-emerald-700", desc: "G1–G5 educator configuration with Master-tier leads and Learning Assistant support. Foundational literacy and numeracy focus." },
    { icon: Database, label: "Middle School", color: "bg-violet-100 text-violet-700", desc: "G6–G8 transition to specialist-led instruction. Educator pool scales to 3 FTE at G6, 7 at G7, and 10 at G8." },
    { icon: GraduationCap, label: "High School", color: "bg-purple-100 text-purple-700", desc: "G9–G12 expansion strategy. Cumulative teaching ramp reaches 4 FTE at G9, 7 at G11, and 10 at G12." },
    { icon: Activity, label: "Load Calculator", color: "bg-amber-100 text-amber-700", desc: "Instructional load stress test for MS and HS. Validates FTE assumptions against real teaching hour requirements." },
    { icon: DollarSign, label: "Payroll Projection", color: "bg-orange-100 text-orange-700", desc: "Three enrollment scenarios × three tuition tables = 9 projections. Tuition grows 8%/year from the 2028 base. Per-grade educator tier selectors. Long-range payroll projection, 2028–2047, with revenue less modeled FOPAG / people-cost coverage views." },
    { icon: Scale, label: "Viability Simulator", color: "bg-lime-100 text-lime-700", desc: "Baseline viability view plus directional sensitivity and threshold planning signals." },
    { icon: PieChart, label: "DRE Scenario Simulator", color: "bg-sky-100 text-sky-700", desc: "Operating scenario layer for Rio's 2028 opening model. DRE inputs, revenue, FOPAG, and margin projections." },
    { icon: Scale, label: "Decisão de Capital", color: "bg-red-100 text-red-700", desc: "CAPEX analysis and scenario comparison via DRE-owned configurations." },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Rio Strategic Org Design</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    Escola Concept · BU Vanguarda · Jan 2028 Launch
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6">
              <p className="text-xs text-slate-600 leading-relaxed">
                This tool stress-tests the financial and organizational feasibility of the Rio campus from
                pre-launch through full maturity (2028–2037). It maps educator headcount, caliber decisions,
                and tuition revenue against three enrollment scenarios and three pricing strategies — producing
                a 9-scenario projection matrix that surfaces the real cost of each strategic choice.
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                What each tab does
              </p>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <div key={tab.label} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className={cn("h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5", tab.color)}>
                      <tab.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-slate-800">{tab.label}</div>
                      <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{tab.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { label: "Cost logic", value: "Salary × 13 + Benefits × 12" },
                { label: "Tuition growth", value: "8% per year from 2028 base" },
                { label: "Turmas source", value: "Confirmed from spreadsheet" },
                { label: "Coverage scope", value: "Revenue less modeled FOPAG" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{item.label}</div>
                  <div className="text-[11px] font-bold text-slate-800 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 italic">Decision support tool for BU Vanguarda strategic planning.</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">v3.0</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AboutModal;
