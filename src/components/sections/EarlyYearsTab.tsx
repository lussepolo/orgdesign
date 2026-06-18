import React from "react";
import { Baby, Heart, Languages, Users } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const Card = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  actions,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
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

const Badge = ({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info" | "purple" | "danger";
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border", variants[variant])}>
      {children}
    </span>
  );
};

const EARLY_YEARS_DATA = [
  { grade: "Toddlers 1", age: "1-2 years", ratio: "1:4.7", focus: "Sensory & Motor Skills", model: "Lead + Assistant + Monitor", max: 28 },
  { grade: "Toddlers 2", age: "2-3 years", ratio: "1:5", focus: "Social-Emotional Growth", model: "Lead + Assistant + Monitor", max: 28 },
  { grade: "Pre-K3", age: "3-4 years", ratio: "1:6", focus: "Bilingual Foundation", model: "Lead + Assistant + Monitor", max: 36 },
  { grade: "Pre-K4", age: "4-5 years", ratio: "1:6", focus: "Inquiry-based Play", model: "Lead + Assistant + Monitor", max: 36 },
  { grade: "Kinder", age: "5-6 years", ratio: "1:6.7", focus: "Pre-Literacy & Numeracy", model: "Lead + Assistant + Monitor", max: 40 },
];

const EarlyYearsTab = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="Early Years Pedagogical Framework" icon={Baby}>
        <div className="space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            Our Early Years program is built on the Reggio Emilia philosophy, emphasizing the "hundred languages of children." We prioritize bilingual immersion from Toddlers 1, ensuring a natural acquisition of English and Portuguese through play and exploration.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <h4 className="text-xs font-bold text-slate-900">Social-Emotional</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Focus on self-regulation, empathy, and community building through collaborative play.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-4 w-4 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-900">Bilingual Immersion</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Natural language acquisition through daily routines and inquiry-based projects.</p>
            </div>
          </div>
        </div>
      </Card>
      <Card title="Classroom Package" icon={Users}>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reference Educator</span>
            <Badge variant="purple">1 Lead</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Learning Assistant</span>
            <Badge variant="info">1 Assistant</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Learning Monitor</span>
            <Badge variant="success">1 Monitor</Badge>
          </div>
          <p className="text-[10px] text-slate-400 italic">High-touch 3-educator model (Lead + Assistant + Monitor) for all Early Years grade levels.</p>
          <p className="text-[10px] text-amber-700 leading-relaxed border-t border-slate-100 pt-3 mt-3">These are planning premises only. Adult-to-learner ratios and classroom package structures are instructional-capacity planning assumptions, not payroll authorization, final FTE, final headcount, or hiring approval.</p>
        </div>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {EARLY_YEARS_DATA.map((item, idx) => (
        <motion.div key={item.grade} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
          <Card className="h-full border-t-4 border-rose-400">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{item.age}</div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{item.grade}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Learners, 2 Sections</div>
                <div className="text-xs font-bold text-rose-600">{item.max} Learners</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Learners Per Section</div>
                <div className="text-xs font-bold text-slate-600">{item.max / 2} Learners</div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Ratio</div>
                <div className="text-xs font-bold text-slate-600">{item.ratio}</div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  </div>
);

export default EarlyYearsTab;
