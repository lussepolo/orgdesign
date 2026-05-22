import React from "react";
import { Microscope, School, Search, Users } from "lucide-react";
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

const LOWER_SCHOOL_DATA = [
  { grade: "Grade 1", focus: "Literacy & Numeracy", model: "Lead + Assistant", ratio: "1:11", max: 44 },
  { grade: "Grade 2", focus: "Fluency & Inquiry", model: "Lead + Assistant", ratio: "1:11", max: 44 },
  { grade: "Grade 3", focus: "Critical Thinking", model: "Lead + Assistant", ratio: "1:11", max: 44 },
  { grade: "Grade 4", focus: "Project-based Learning", model: "Lead + Assistant", ratio: "1:11", max: 44 },
  { grade: "Grade 5", focus: "Transition & Leadership", model: "Lead + Assistant", ratio: "1:11", max: 44 },
];

const LowerSchoolTab = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2" title="Lower School Academic Core" icon={School}>
        <div className="space-y-6">
          <p className="text-sm text-slate-500 leading-relaxed">
            Lower School is where the investigative posture of Early Years becomes a disciplined academic practice. Learners are presented with real phenomena, form questions and construct understanding through structured enquiry before conclusions are offered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="h-4 w-4 text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900">Scientific Literacy</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Developing the ability to identify scientific issues, explain phenomena, and use evidence-based conclusions.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-blue-500" />
                <h4 className="text-xs font-bold text-slate-900">Phenomenon-Based</h4>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">Learning through the observation of real-world phenomena, fostering curiosity and deep analytical skills.</p>
            </div>
          </div>
        </div>
      </Card>
      <Card title="Staffing Model" icon={Users}>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reference Educator</span>
            <Badge variant="purple">1 Lead</Badge>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Learning Assistant</span>
            <Badge variant="success">1 Assistant</Badge>
          </div>
          <p className="text-[10px] text-slate-400 italic">Dedicated 2-educator model (1 Lead + 1 Assistant) per grade level. No shared assistants.</p>
        </div>
      </Card>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {LOWER_SCHOOL_DATA.map((item, idx) => (
        <motion.div key={item.grade} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
          <Card className="h-full border-t-4 border-emerald-400">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lower School</div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">{item.grade}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Learners, 2 Sections</div>
                <div className="text-xs font-bold text-emerald-600">{item.max} Learners</div>
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

export default LowerSchoolTab;
