import React from "react";
import { BookOpen, Clock, Coffee, GraduationCap, Scale, Users } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Card = ({ children, className, title, subtitle, icon: Icon, actions, style }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: any, actions?: React.ReactNode, style?: React.CSSProperties }) => (
  <div className={cn("bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)} style={style}>
    {title && (
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />}
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

interface LoadTabProps {
  msSections: number;
  hsSections: number;
}

export default function LoadTab({ msSections, hsSections }: LoadTabProps) {
  const msFte = 9;
  const hsFte = 11;
  const totalFte = msFte + hsFte;
  const totalSpecialists = Math.ceil(totalFte);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-none text-white overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Clock className="h-48 w-48" /></div>
            <div className="relative z-10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center"><Scale className="h-6 w-6 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold">The Sustainability "Golden Ratio"</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">40h Weekly Contract Architecture</p>
                </div>
              </div>
              <div className="mb-8 p-4 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                <p className="text-xs text-indigo-100 leading-relaxed"><strong>Pedagogical Note:</strong> Instructional load calculations only apply to Middle and High School (Grade 6-12). Early Years and Lower School operate on a "Reference Educator" model.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Direct Instruction", time: "20.25h", pct: "51%", desc: "27 periods (45m each)", icon: GraduationCap, color: "bg-emerald-500" },
                  { label: "Planning & Prep", time: "10h", pct: "25%", desc: "São Paulo Quality Parity", icon: BookOpen, color: "bg-blue-500" },
                  { label: "Meetings & PLC", time: "5h", pct: "12.5%", desc: "Alignment & Training", icon: Users, color: "bg-indigo-500" },
                  { label: "Wellness & Breaks", time: "4.75h", pct: "11.5%", desc: "Lunch & Transition", icon: Coffee, color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-3"><item.icon className="h-4 w-4 text-slate-400" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{item.label}</span></div>
                    <div className="flex items-baseline gap-2 mb-1"><span className="text-2xl font-bold">{item.time}</span><span className="text-xs font-medium text-slate-500">{item.pct}</span></div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><div className={cn("h-full rounded-full", item.color)} style={{ width: item.pct }} /></div>
                    <p className="text-[10px] text-slate-500 mt-3 leading-tight whitespace-normal">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="p-6 bg-indigo-900 text-white h-full">
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">Resilient Test: Staffing Stability</h4>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs"><span className="text-indigo-300">Middle School ({msSections} sections)</span><span className="font-bold">{msFte.toFixed(2)} FTE</span></div>
              <div className="flex justify-between items-center text-xs"><span className="text-indigo-300">High School ({hsSections} sections)</span><span className="font-bold">{hsFte.toFixed(2)} FTE</span></div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm font-bold"><span>Total System Load</span><span className="text-indigo-400">{totalFte.toFixed(2)} FTE</span></div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/10"><div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-indigo-300">System Resilience</div><div className="text-xs font-medium whitespace-normal">The {totalSpecialists}-specialist model allows for internal substitution without disrupting learner experience.</div></div>
              <div className="p-4 bg-rose-500/20 rounded-xl border border-rose-500/30"><div className="text-[10px] font-bold uppercase tracking-wider mb-2 text-rose-300">Stress Test Verdict</div><div className="text-xs font-bold whitespace-normal">Internal planning target: the secondary staffing envelope remains aligned to the {totalSpecialists}-educator instructional-capacity model.</div></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
