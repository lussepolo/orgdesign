import React, { useState } from "react";
import { ChevronRight, GraduationCap, Info, Scale, Users } from "lucide-react";
import { motion } from "motion/react";
import { HS_SUBJECT_DISTRIBUTION, SUBJECT_TO_CATEGORY } from "../../constants";
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

interface HSYearData {
  year: string;
  scope: string;
  model: string;
  fte: string;
  curriculum: string[];
  org: string[];
  description: string;
}

const HS_YEAR_DATA: HSYearData[] = [
  {
    year: "Grade 9",
    scope: "High School Foundation",
    model: "Dedicated High School Launch Faculty",
    fte: "4 FTE",
    curriculum: ["AP", "BNCC", "Common Core"],
    org: [
      "Língua Portuguesa II & Redação",
      "Integrated Mathematics II",
      "English Language Arts",
      "Extensions of Bio, Chem & Physics",
      "AP Seminar & AP Human Geography",
      "Social Sciences",
      "Studio Art II, Rock History, Pottery",
      "Pathways & College/Career"
    ],
    description: "Grade 9 opens High School with a dedicated 4 FTE educator core for AP-aligned content and University Level sciences while ensuring a seamless transition."
  },
  {
    year: "Grade 10",
    scope: "High School Specialization I",
    model: "Dedicated High School Specialists",
    fte: "0 New FTE (4 Total HS)",
    curriculum: ["AP", "BNCC", "Common Core"],
    org: [
      "Língua Portuguesa II & Redação",
      "Integrated Mathematics II",
      "English Language Arts",
      "Extensions of Bio, Chem & Physics",
      "AP Computer Science Principles",
      "AP Seminar",
      "Studio Art II, Rock History, Pottery",
      "Academic Advising & Mentorship"
    ],
    description: "Grade 10 opens inside the existing High School educator core. It expands the academic program without adding incremental teaching FTE in the live staffing ramp."
  },
  {
    year: "Grade 11",
    scope: "High School Specialization II",
    model: "Dedicated High School Specialists",
    fte: "3 New FTE (7 Total HS)",
    curriculum: ["AP Research", "AP Calculus", "BNCC"],
    org: [
      "Língua Portuguesa III & AP Lang (ELA)",
      "Integrated Math III & AP Precalculus",
      "Integrated Sciences Advanced",
      "AP Biology & AP Chemistry",
      "AP World History & AP Macro",
      "Brazilian Studies I & II",
      "Global Expression & Leadership",
      "Innovation Diploma & Maker"
    ],
    description: "Grade 11 triggers the next expansion point, adding 3 FTE for AP Capstone Research, advanced mathematics, and deeper STEM and humanities specialization."
  },
  {
    year: "Grade 12",
    scope: "High School Graduation",
    model: "Dedicated High School Specialists",
    fte: "3 New FTE (10 Total HS)",
    curriculum: ["AP Electives", "College Prep", "BNCC"],
    org: [
      "Língua Portuguesa IV & AP Lit (ELA)",
      "AP Calculus & Integrated Math Adv",
      "AP Precalculus & CS Principles",
      "Integrated Sciences Univ Topics",
      "AP Biology & AP Chemistry",
      "AP World History & AP Macro",
      "Brazilian Studies I & II",
      "Global Expression & Leadership",
      "Innovation Diploma & Maker"
    ],
    description: "Grade 12 completes the High School teaching ramp at 10 FTE. Staffing then carries forward flat unless a later explicit step is added."
  }
];

const HS_RAMP_INCREMENT_FTE_BY_GRADE = [4, 0, 3, 3];
const HS_RAMP_TOTALS_FOR_DISPLAY = [4, 4, 7, 10];
const HS_FULL_RAMP_FTE = 10;

const SPECIALIST_INTEGRITY_NOTE = "The fractional FTEs (e.g., 0.25 per section) reflect the instructional load within the 27-period cap. While a subject may require 0.5 FTE for two sections, this represents a dedicated specialist's focus, often shared across grade levels or divisions to maintain subject-matter integrity (e.g., Portuguese specialists do not teach English).";

const HS_LOAD_DATA = [
  { subject: "Portuguese", g9: 5, g10: 5, g11: 5, g12: 5 },
  { subject: "ELA / AP Seminar / Research", g9: 5, g10: 5, g11: 10, g12: 10 },
  { subject: "Mathematics / AP Calculus", g9: 5, g10: 5, g11: 5, g12: 5 },
  { subject: "Humanities / History", g9: 6, g10: 5, g11: 5, g12: 5 },
  { subject: "Sciences (AP / Univ Level)", g9: 6, g10: 8, g11: 8, g12: 8 },
];

const HS_ROADMAP_DATA = [
  {
    year: "2034", phase: "High School Launch (G9)", sections: "1-2 Sections", students: 40, fte: 4,
    description: "Grade 9 opens High School with a 4 FTE educator core.",
    clusters: [
      { name: "HS Launch Educator Core", type: "HS" },
      { name: "AP Seminar Foundation", type: "HS" },
      { name: "University Level Sciences", type: "HS" },
      { name: "HS Transition Bridge", type: "HS" }
    ]
  },
  {
    year: "2036", phase: "High School Expansion (G11)", sections: "6 Sections", students: 120, fte: 7,
    description: "Grade 11 is the next defined expansion point, adding 3 FTE and bringing total HS teaching staffing to 7 FTE.",
    clusters: [
      { name: "Dedicated HS Specialists", type: "HS" },
      { name: "AP Research Core", type: "HS" },
      { name: "Advanced Sciences Core", type: "HS" },
      { name: "College Advising", type: "HS" }
    ]
  },
  {
    year: "2037+", phase: "High School Full Ramp (G12)", sections: "8 Sections", students: 160, fte: 10,
    description: "Grade 12 completes the cumulative ramp at 10 FTE. Teaching staffing carries forward flat after this point.",
    clusters: [
      { name: "AP Capstone Research", type: "HS" },
      { name: "Advanced STEM & Humanities", type: "HS" },
      { name: "Innovation Diploma", type: "HS" },
      { name: "Graduation Specialists", type: "HS" }
    ]
  }
];

type HighSchoolTabProps = {
  sections: number;
  setSections: (s: number) => void;
};

const HighSchoolTab = ({ sections, setSections }: HighSchoolTabProps) => {
  const [showStaffing, setShowStaffing] = useState(false);
  const learnersPerSection = 25;
  const totalG9 = 27 * sections;
  const totalG10 = 28 * sections;
  const totalG11 = 33 * sections;
  const totalG12 = 33 * sections;
  const totalHS = totalG9 + totalG10 + totalG11 + totalG12;
  const specialists = HS_FULL_RAMP_FTE;
  const efficiency = (totalHS / (specialists * 27)) * 100;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-slate-900 text-white border-none p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><GraduationCap className="h-64 w-64" /></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-xl md:text-3xl font-bold tracking-tight">High School Expansion Strategy</h3>
              <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 shrink-0">
                <button onClick={() => setSections(1)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 1 ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white")}>1 section · 25 learners/grade</button>
                <button onClick={() => setSections(2)} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", sections === 2 ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-white")}>2 sections · 50 learners/grade</button>
              </div>
            </div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">Roadmap values are planning premises; section view does not recalculate FTE.</p>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-2xl">
              The High School model is built on <strong>AP</strong>, <strong>BNCC</strong>, and <strong>Common Core</strong> frameworks. At <strong>{sections * learnersPerSection} learners per grade</strong>, the live teaching ramp carries the 4-year cycle (G9-G12) to <strong>{specialists} Master Educators</strong>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Phase 1: G9</div>
                <div className="text-lg font-bold">4 FTE</div>
                <p className="text-[10px] text-slate-500 mt-2">Initial High School educator core.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Phase 2: G11</div>
                <div className="text-lg font-bold">+3 FTE</div>
                <p className="text-[10px] text-slate-500 mt-2">Advanced AP research expansion.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Phase 3: G12</div>
                <div className="text-lg font-bold">10 FTE Total</div>
                <p className="text-[10px] text-slate-500 mt-2">Full ramp, then carried flat.</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100 p-6">
          <div className="flex items-center gap-2 mb-4"><Info className="h-5 w-5 text-indigo-500" /><h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategic Logic</h4></div>
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed"><strong>G9-G10</strong> establishes the foundation with AP Seminar and University Level sciences.</p>
            <p className="text-xs text-slate-600 leading-relaxed"><strong>G11-G12</strong> introduces <strong>AP Research</strong> and specialized electives.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title={`Full HS Load Analysis (${sections * learnersPerSection} learners/grade)`} icon={Scale}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase">Subject Area</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G9</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G10</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G11</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">G12</th>
                  <th className="py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {HS_LOAD_DATA.map((row) => (
                  <tr key={row.subject} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-xs font-bold text-slate-900">{row.subject}</td>
                    <td className="py-4 text-xs text-slate-500 text-center">{row.g9 * sections}p</td>
                    <td className="py-4 text-xs text-slate-500 text-center">{row.g10 * sections}p</td>
                    <td className="py-4 text-xs text-slate-500 text-center">{row.g11 * sections}p</td>
                    <td className="py-4 text-xs text-slate-500 text-center">{row.g12 * sections}p</td>
                    <td className="py-4 text-xs font-bold text-indigo-600 text-center">{(row.g9 + row.g10 + row.g11 + row.g12) * sections}p</td>
                  </tr>
                ))}
                <tr className="bg-slate-900 text-white">
                  <td className="py-4 px-4 text-xs font-bold">Total Periods</td>
                  <td className="py-4 text-xs font-bold text-center">{totalG9}p</td>
                  <td className="py-4 text-xs font-bold text-center">{totalG10}p</td>
                  <td className="py-4 text-xs font-bold text-center">{totalG11}p</td>
                  <td className="py-4 text-xs font-bold text-center">{totalG12}p</td>
                  <td className="py-4 text-xs font-bold text-center text-indigo-400">{totalHS}p</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Staffing Verdict" icon={Users}>
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Requirement</div>
              <div className="text-2xl font-bold text-slate-900">{specialists} Specialists</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                <span>Load Efficiency</span>
                <span className={cn("font-bold", efficiency > 80 ? "text-emerald-600" : "text-amber-600")}>{efficiency.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-500", efficiency > 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${Math.min(100, efficiency)}%` }} />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Specialist Integrity</div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic">{SPECIALIST_INTEGRITY_NOTE}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-indigo-500 rounded-full" />
          <h3 className="text-2xl font-bold text-slate-900">High School Evolution</h3>
        </div>
        <button
          onClick={() => setShowStaffing(!showStaffing)}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border", showStaffing ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300")}
        >
          <Users className="h-4 w-4" />
          {showStaffing ? "Hide Staffing Impact" : "Show Staffing Impact"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {HS_YEAR_DATA.map((year, idx) => {
          let dynamicDescription = year.description;
          const incrementalFte = HS_RAMP_INCREMENT_FTE_BY_GRADE[idx];
          const totalFteSoFar = HS_RAMP_TOTALS_FOR_DISPLAY[idx];
          const dynamicFte = idx === 0
            ? `${totalFteSoFar} FTE`
            : `${incrementalFte} New (${totalFteSoFar} Total)`;

          return (
            <motion.div key={year.year} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{year.year}</span>
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter", idx < 2 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{idx < 2 ? "Launch Phase" : "Expansion Phase"}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{year.scope}</h3>
                  </div>
                  <Badge variant={idx < 1 ? "info" : idx < 2 ? "purple" : "success"}>{year.model}</Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{dynamicDescription}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">FTE Impact</div>
                    <div className="text-sm font-bold text-slate-900">{dynamicFte}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Focus</div>
                    <div className="text-sm font-bold text-slate-900">{idx < 2 ? "Foundation" : "Graduation"}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Curriculum Offering</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {year.org.map((item) => {
                      const category = SUBJECT_TO_CATEGORY[item];
                      const dist = HS_SUBJECT_DISTRIBUTION.find(d => d.subject === (category || "None"));
                      const ftePerGradeItem = dist ? dist.ftePerSection * sections : 0;
                      const itemsInCategoryInGrade = year.org.filter(i => SUBJECT_TO_CATEGORY[i] === category).length;
                      const ftePerItem = itemsInCategoryInGrade > 0 ? ftePerGradeItem / itemsInCategoryInGrade : 0;
                      return (
                        <div key={item} className={cn("flex items-center justify-between text-[11px] bg-white border rounded-lg px-3 py-2 transition-all group", showStaffing ? "border-indigo-100 hover:border-indigo-300 shadow-sm" : "border-slate-100 hover:border-indigo-200")}>
                          <div className="flex items-center gap-2 text-slate-700">
                            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", category === "STEM" ? "bg-blue-400" : category === "Languages" ? "bg-emerald-400" : category === "Humanities" ? "bg-amber-400" : "bg-indigo-400")} />
                            <span className="whitespace-normal font-medium">{item}</span>
                          </div>
                          {showStaffing && ftePerItem > 0 && (
                            <div className="flex flex-col items-end shrink-0 ml-2">
                              <span className="text-[9px] font-bold text-indigo-600">{ftePerItem.toFixed(2)} FTE</span>
                              <span className="text-[7px] text-slate-400 uppercase tracking-tighter">{category}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-1 bg-purple-500 rounded-full" />
          <h3 className="text-2xl font-bold text-slate-900">Strategic Roadmap</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {HS_ROADMAP_DATA.map((stage, idx) => (
            <motion.div key={stage.phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full flex flex-col p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stage.year}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded uppercase tracking-tighter">High School</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">{stage.phase}</h4>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 uppercase tracking-tight">{stage.sections}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 whitespace-normal">{stage.description}</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Students</div><div className="text-lg font-bold text-slate-900">{stage.students}</div></div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="text-[8px] font-bold text-slate-400 uppercase mb-1">FTE</div><div className="text-lg font-bold text-slate-900">{stage.fte}</div></div>
                </div>
                <div className="space-y-2 mt-auto">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Core Clusters</div>
                  {stage.clusters.map((cluster) => (
                    <div key={cluster.name} className="flex items-center justify-between p-2 bg-white border border-slate-50 rounded-lg shadow-sm group hover:border-purple-200 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-purple-400 transition-colors" />
                        <span className="text-[10px] font-medium text-slate-600 whitespace-normal">{cluster.name}</span>
                      </div>
                      <span className={cn("text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0", cluster.type === "SHARED" ? "bg-slate-100 text-slate-500" : "bg-purple-50 text-purple-500")}>{cluster.type}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HighSchoolTab;
