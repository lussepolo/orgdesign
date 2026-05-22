import { motion } from "motion/react";
import {
  BookOpen,
  Cpu,
  Globe,
  Layers,
  Microscope,
  RefreshCw,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { ROLE_SCORECARDS } from "../../constants";
import { cn } from "../../lib/utils";
import { Card } from "../common/Card";

const HiringProfileCardsTab = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-slate-900 border-none text-white overflow-hidden h-full">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Layers className="h-48 w-48" />
          </div>
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Staffing Choices & Specialization</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest">
                  Middle & High School Architecture
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  label: "STEM Cluster",
                  roles: "Math, Physics, Bio, Chem",
                  focus: "Scientific Literacy",
                  icon: Microscope,
                  color: "bg-emerald-500",
                },
                {
                  label: "Humanities Cluster",
                  roles: "Port, Hist, Geo, Soc",
                  focus: "Critical Reasoning",
                  icon: BookOpen,
                  color: "bg-blue-500",
                },
                {
                  label: "Signature Cluster",
                  roles: "AI, Eng, Arts, Maker",
                  focus: "Creative Complexity",
                  icon: Cpu,
                  color: "bg-indigo-500",
                },
                {
                  label: "Bilingual Cluster",
                  roles: "English, Global Persp",
                  focus: "Cultural Fluency",
                  icon: Globe,
                  color: "bg-amber-500",
                },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-lg font-bold mb-1">{item.roles}</div>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", item.color)} />
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      {item.focus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="p-6 bg-indigo-900 text-white h-full">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">
            The Cluster Advantage
          </h4>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Deep Specialization</div>
                <p className="text-[10px] text-slate-400 leading-relaxed whitespace-normal">
                  Educators focus on their core discipline, ensuring São Paulo-level academic rigor.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <RefreshCw className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Cross-Pollination</div>
                <p className="text-[10px] text-slate-400 leading-relaxed whitespace-normal">
                  Clusters meet weekly to integrate projects across disciplines (e.g., Math + Physics).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">Systemic Redundancy</div>
                <p className="text-[10px] text-slate-400 leading-relaxed whitespace-normal">
                  Cluster members can cover for each other, maintaining pedagogical continuity.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ROLE_SCORECARDS.map((role, idx) => (
        <motion.div
          key={role.role}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card
            className="h-full border-l-4"
            style={{ borderLeftColor: `var(--${role.color.split("-")[1]}-500)` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", role.bg)}>
                  <role.icon className={cn("h-5 w-5", role.color)} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{role.role}</h3>
              </div>
              <span
                className={cn(
                  "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border",
                  role.division === "Middle School"
                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                    : role.division === "High School"
                      ? "bg-purple-50 text-purple-600 border-purple-100"
                      : "bg-slate-50 text-slate-600 border-slate-100",
                )}
              >
                {role.division}
              </span>
            </div>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Core Ownership
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {role.owns.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-slate-600 min-w-0">
                      <div
                        className={cn(
                          "h-1 w-1 rounded-full shrink-0",
                          role.bg.replace("bg-", "bg-").replace("50", "500"),
                        )}
                      />
                      <span className="whitespace-normal" title={item}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Teaching Load
                  </div>
                  <div className="text-sm font-bold text-slate-900">{role.load}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Hiring Profile
                  </div>
                  <div className="text-xs text-slate-500 leading-relaxed whitespace-normal">
                    {role.profile}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default HiringProfileCardsTab;
