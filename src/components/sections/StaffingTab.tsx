import React, { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  DollarSign,
  Download,
  GraduationCap,
  Info,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  EDUCATOR_LEVELS,
  ENROLLMENT_PROJECTIONS,
  GRADE_CONFIG,
  HS_SUBJECT_DISTRIBUTION,
  LEARNING_ASSISTANT_COST,
  LEARNING_ASSISTANT_DETAIL,
  LEARNING_MONITOR_COST,
  LEARNING_MONITOR_DETAIL,
} from "../../constants";
import { BACKOFFICE_CONFIG, LEADERSHIP_CONFIG, SPECIALISTS_CONFIG } from "../../constants/leadership";
import { useStaffingLogic } from "../../hooks/useStaffingLogic";
import type { TabId } from "../../App";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatBRL = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

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

const HS_RAMP_TOTAL_FTE_BY_GRADE = [4, 4, 7, 10];

const getHsRampFteForActiveGradeCount = (activeHsGrades: number): number => {
  if (activeHsGrades <= 0) return 0;
  return HS_RAMP_TOTAL_FTE_BY_GRADE[Math.min(activeHsGrades, HS_RAMP_TOTAL_FTE_BY_GRADE.length) - 1];
};

interface StaffingTabProps {
  setActiveTab: (tab: TabId) => void;
  onShowAbout: () => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFFING TAB — fully synchronized with useStaffingLogic (× 13 annualization)
// ─────────────────────────────────────────────────────────────────────────────

export default function StaffingTab({
  setActiveTab,
  onShowAbout,
  selectedYear,
  setSelectedYear
}: StaffingTabProps) {
  const [divisionEnrollment, setDivisionEnrollment] = useState<Record<string, string>>({
    "Early Years": ENROLLMENT_PROJECTIONS["Early Years"].toString(),
    "Lower School": ENROLLMENT_PROJECTIONS["Lower School"].toString(),
    "Middle School": ENROLLMENT_PROJECTIONS["Middle School"].toString(),
    "High School": ENROLLMENT_PROJECTIONS["High School"].toString()
  });
  const [sectionsPerGrade, setSectionsPerGrade] = useState(2);
  // Grade-level tier selection — keyed by grade.id (e.g. "g1", "pk3", "t1")
  // Fallback chain in hook: grade.id → division name → "specialist"
  const [gradeLevels, setGradeLevels] = useState<Record<string, string>>(
    () => Object.fromEntries(GRADE_CONFIG.map((g) => [g.id, "specialist"]))
  );
  const [divisionTuition, setDivisionTuition] = useState<Record<string, string>>({
    "Early Years": "10200",
    "Lower School": "10200",
    "Middle School": "11200",
    "High School": "12200"
  });
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [showHiringBreakdown, setShowHiringBreakdown] = useState(false);
	  const [showIdealPath, setShowIdealPath] = useState(false);
	  // ── NEW: margin mode toggle (WITH vs WITHOUT benefits)
	  const [marginMode, setMarginMode] = useState<"FULLY_LOADED" | "WITHOUT_BENEFITS">("FULLY_LOADED");
	  const [visibleLayers, setVisibleLayers] = useState<string[]>(['A', 'B', 'C', 'D']);

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
  };

  // ── Hook receives gradeLevels (grade-level tier map) and marginMode
  const {
    activeGrades,
    defaultEnrollmentByDivision,
    stats,
    projectionData
  } = useStaffingLogic(
    selectedYear,
    gradeLevels,
    divisionEnrollment,
    sectionsPerGrade,
    divisionTuition,
    showIdealPath,
    visibleLayers,
    marginMode
  );

  useEffect(() => {
    setDivisionEnrollment({
      "Early Years": defaultEnrollmentByDivision["Early Years"].toString(),
      "Lower School": defaultEnrollmentByDivision["Lower School"].toString(),
      "Middle School": defaultEnrollmentByDivision["Middle School"].toString(),
      "High School": defaultEnrollmentByDivision["High School"].toString()
    });
  }, [selectedYear, sectionsPerGrade]);

	  const exportToExcel = () => {
	    const wb = XLSX.utils.book_new();

    const summaryData = [
      ["Rio Strategic Organizational Architecture - Export Summary"],
      ["Date", new Date().toLocaleDateString()],
      [""],
      ["Current Scenario Parameters"],
      ["Selected Year", selectedYear],
      ["Sections Per Grade", sectionsPerGrade],
      ["Margin Mode", marginMode === "FULLY_LOADED" ? "Fully Loaded (includes benefits)" : "Without Benefits"],
      ["Total Enrollment", stats.totalEnrollment],
      ["Total FTE", stats.totalFTE],
      ["Overall Occupancy", `${stats.occupancy.toFixed(1)}%`],
      [""],
      ["Financial Performance (Monthly)"],
      ["Total Revenue", stats.totalRevenueMonthly],
      ["Total Staffing Cost (Teaching)", stats.totalStaffingMonthly],
      ["Staffing Margin", stats.staffingMargin],
      ["FOPAG Direto", stats.allocationMonthly.fopag],
      ["Folha Direta", stats.allocationMonthly.folhaDireta],
      ["Staffing Efficiency", `${stats.staffingEfficiency.toFixed(1)}%`],
      [""],
      ["Annualization Note: Salary burden × 13, Benefits × 12, Revenue × 12"],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const divisionHeaders = [["Division", "Enrollment", "Sections", "Educator Level", "Monthly Cost", "Monthly Revenue", "Margin", "Efficiency", "Associate Scenario", "Specialist Scenario", "Master Scenario"]];
    const divisionRows = stats.divisions.map(div => {
      const fte = div.fte;
      const divSections = div.sections;

      let supportCost = 0;
      if (div.name === "Early Years") {
        supportCost = divSections * (
          marginMode === "WITHOUT_BENEFITS"
            ? (LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly) + (LEARNING_MONITOR_DETAIL.grossMonthly + LEARNING_MONITOR_DETAIL.laborChargesMonthly)
            : LEARNING_ASSISTANT_COST + LEARNING_MONITOR_COST
        );
      }
      if (div.name === "Lower School") {
        supportCost = divSections * (
          marginMode === "WITHOUT_BENEFITS"
            ? LEARNING_ASSISTANT_DETAIL.grossMonthly + LEARNING_ASSISTANT_DETAIL.laborChargesMonthly
            : LEARNING_ASSISTANT_COST
        );
      }

      const associateLevel = EDUCATOR_LEVELS.find(l => l.id === 'associate')!;
      const specialistLevel = EDUCATOR_LEVELS.find(l => l.id === 'specialist')!;
      const masterLevel = EDUCATOR_LEVELS.find(l => l.id === 'master')!;

      const associateBase = marginMode === "WITHOUT_BENEFITS" ? associateLevel.grossMonthly + associateLevel.laborChargesMonthly : associateLevel.totalCost;
      const specialistBase = marginMode === "WITHOUT_BENEFITS" ? specialistLevel.grossMonthly + specialistLevel.laborChargesMonthly : specialistLevel.totalCost;
      const masterBase = marginMode === "WITHOUT_BENEFITS" ? masterLevel.grossMonthly + masterLevel.laborChargesMonthly : masterLevel.totalCost;

      return [
        div.name, div.learners, div.sections, div.selectedLevel.name, div.cost, div.revenue,
        div.revenue - div.cost,
        div.revenue > 0 ? `${((div.cost / div.revenue) * 100).toFixed(1)}%` : "0%",
        (fte * associateBase) + supportCost,
        (fte * specialistBase) + supportCost,
        (fte * masterBase) + supportCost
      ];
    });
    const wsDivisions = XLSX.utils.aoa_to_sheet([...divisionHeaders, ...divisionRows]);
    XLSX.utils.book_append_sheet(wb, wsDivisions, "Division Details");

    const roadmapHeaders = [["Year", "Grades", "Enrollment", "Sections", "FTE Count", "Annual Staffing (×13)", "Annual Revenue (×12)", "Annual Margin", "Efficiency"]];
    const roadmapRows = projectionData.map(row => [
      row.year, row.grades, row.enrollment, row.sections, row.fteCount,
      row.totalStaffing, row.totalRevenue, row.margin, `${row.efficiency.toFixed(1)}%`
    ]);
    const wsRoadmap = XLSX.utils.aoa_to_sheet([...roadmapHeaders, ...roadmapRows]);
    XLSX.utils.book_append_sheet(wb, wsRoadmap, "10-Year Roadmap");

    if (activeGrades.some(g => g.division === "High School")) {
      const hsHeaders = [["Subject Area", "FTE Count", "Description", "Pct of HS Staffing"]];
      const activeHsGrades = activeGrades.filter(g => g.division === "High School").length;
      const hsRows = HS_SUBJECT_DISTRIBUTION.map(item => {
        const totalFte = Math.round(item.ftePerSection * sectionsPerGrade * activeHsGrades * 100) / 100;
        const totalHsFte = getHsRampFteForActiveGradeCount(activeHsGrades);
        return [item.subject, totalFte, item.description, `${Math.round((totalFte / totalHsFte) * 100)}%`];
      });
      const wsHS = XLSX.utils.aoa_to_sheet([...hsHeaders, ...hsRows]);
      XLSX.utils.book_append_sheet(wb, wsHS, "HS Subject Breakdown");
    }

	    XLSX.writeFile(wb, `Rio_Staffing_Model_${selectedYear}_${sectionsPerGrade}S.xlsx`);
	  };

	  return (
	    <div className="space-y-12">
      {/* Architectural Density */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Architectural Density</h3>
            </div>
            <p className="text-sm text-slate-500 max-w-md">Select the foundational section count per grade. This defines the school's physical capacity and baseline staffing requirements.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            {[1, 2].map(s => (
              <button key={s} onClick={() => setSectionsPerGrade(s)} className={cn("px-8 py-3 text-xs font-bold rounded-xl transition-all flex items-center gap-2", sectionsPerGrade === s ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200")}>
                <Layers className={cn("h-4 w-4", sectionsPerGrade === s ? "text-indigo-400" : "text-slate-400")} />
                {s} SECTION{s > 1 ? 'S' : ''} PER GRADE
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative Headline */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10"><TrendingUp className="h-48 w-48" /></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1.5 w-12 bg-indigo-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Staffing Thesis</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Enrollment does not change the campus staffing configuration. It influences the caliber of Lead Educator the school can responsibly hire.</h2>
          <p className="text-slate-400 text-sm leading-relaxed">The Rio launch model follows a fixed architectural structure. As enrollment density improves across active grades, the organization shifts from consolidated generalist staffing to specialized pedagogical leadership.</p>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            <DollarSign className="h-3 w-3" />
            Financial Note: Toddler tuition is calculated as a part-time average.
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex gap-4">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200"><Info className="h-5 w-5 text-white" /></div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Decision Support Guide</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-indigo-700 leading-relaxed">
            <div className="space-y-1"><span className="font-bold block text-indigo-900 underline decoration-indigo-200 underline-offset-4">1. Define Scale</span>Toggle sections per grade to set the school's physical capacity and baseline staffing requirements.</div>
            <div className="space-y-1"><span className="font-bold block text-indigo-900 underline decoration-indigo-200 underline-offset-4">2. Select Timeline</span>Choose a year in the Phased Opening sequence to activate specific grade levels for that period.</div>
            <div className="space-y-1"><span className="font-bold block text-indigo-900 underline decoration-indigo-200 underline-offset-4">3. Analyze Impact</span>Input enrollment figures to see how occupancy triggers recommended hiring caliber and impacts financial efficiency.</div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4">
            <button onClick={onShowAbout} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"><Info className="h-3 w-3" />LEARN MORE ABOUT THIS MODEL</button>
            <div className="hidden sm:block h-3 w-px bg-indigo-200" />
            <button onClick={exportToExcel} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors"><Download className="h-3 w-3" />EXPORT CURRENT SCENARIO TO EXCEL</button>
	          </div>
	        </div>
	      </div>


	      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">

          {/* Layer 1: Opening Sequence */}
          <Card title="Layer 1: Phased Opening Sequence" icon={Clock}>
            <div className="flex flex-wrap gap-3">
              {[2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037].map((year) => (
                <button key={year} onClick={() => setSelectedYear(year)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", selectedYear === year ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:border-slate-400")}>{year}</button>
              ))}
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 mb-3"><Info className="h-4 w-4 text-slate-400" /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Grades in {selectedYear}</span></div>
              <div className="flex flex-wrap gap-2">
                {activeGrades.map(g => (<span key={g.id} className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold text-slate-600">{g.name}</span>))}
              </div>
            </div>
          </Card>

          {/* Layer 2 & 3: Enrollment-Driven Hiring Logic */}
          <Card title="Layer 2 & 3: Enrollment-Driven Hiring Logic" icon={Users}>
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Educator Caliber Models</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">Global Scenarios & Strategic Staffing</p>
                  </div>
                  <div className="flex items-center gap-2 h-9">
                    <div className="h-full flex items-center gap-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Calculator className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">Methodology: Gross + Labor Charges + Variable Benefits</span>
                    </div>
                    <button onClick={() => setShowCostBreakdown(!showCostBreakdown)} aria-expanded={showCostBreakdown} className={cn("h-full flex items-center gap-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none whitespace-nowrap", showCostBreakdown ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}>
                      {showCostBreakdown ? "Hide Details" : "Show Details"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 items-stretch">
                  {EDUCATOR_LEVELS.map(level => {
                  const isSelected = activeGrades.length > 0 && activeGrades.every(g => (gradeLevels[g.id] ?? "specialist") === level.id);
                    return (
                      <button
                        key={level.id}
                        onClick={() => {
                          const newLevels = { ...gradeLevels };
                          activeGrades.forEach((g) => { newLevels[g.id] = level.id; });
                          setGradeLevels(newLevels);
                        }}
                        aria-pressed={isSelected}
                        className={cn("p-5 rounded-3xl border text-left transition-all group relative grid h-full focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none", isSelected ? "bg-slate-900 border-[2px] border-[#6366f1] text-white shadow-[0_4px_24px_rgba(0,0,0,0.15)]" : "bg-white border-slate-100 hover:border-indigo-200 text-slate-700 hover:shadow-md")}
                        style={{ gridTemplateRows: '[title] auto [description] 1fr [label] auto [price] auto' }}
                      >
                        <div style={{ gridRow: 'title' }} className="mb-2">
                          <div className={cn("text-xs font-bold tracking-tight transition-colors", isSelected ? "text-white" : "text-slate-900 group-hover:text-indigo-600")}>{level.name}</div>
                        </div>
                        <div style={{ gridRow: 'description' }} className="mb-6">
                          <div className={cn("text-[11px] leading-relaxed font-medium", isSelected ? "text-slate-300" : "text-slate-600")}>{level.description}</div>
                          {showCostBreakdown && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2 p-3 rounded-2xl bg-slate-50/5 border border-white/5">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase font-bold opacity-70 tracking-widest">Gross</span>
                                <span className="text-[11px] font-mono font-bold">{formatBRL(level.grossMonthly)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase font-bold opacity-70 tracking-widest">Labor</span>
                                <span className="text-[11px] font-mono font-bold">{formatBRL(level.laborChargesMonthly)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase font-bold opacity-70 tracking-widest">Benefits</span>
                                <span className="text-[11px] font-mono font-bold">{formatBRL(level.benefitsMonthly)}</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                        <div style={{ gridRow: 'label' }} className={cn("pt-4 border-t", isSelected ? "border-white/10" : "border-slate-100")}>
                          <div className="text-[9px] uppercase font-bold opacity-70 tracking-widest mb-1">Monthly FTE Provision</div>
                        </div>
                        <div style={{ gridRow: 'price' }} className="flex items-baseline gap-1">
                          <span className={cn("text-lg font-bold tracking-tighter", isSelected ? "text-white" : "text-slate-900")}>{formatBRL(level.totalCost)}</span>
                          <span className="text-[10px] font-bold opacity-60">/MO</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" aria-label="currently selected" role="status" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between pb-8 border-b border-slate-100">
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Target Enrollment Scenario</div>
                  <p className="text-xs text-slate-600 max-w-[480px] leading-relaxed">Adjust enrollment per division to see the impact on staffing caliber and budget.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.divisions.map(div => {
                  const isActive = activeGrades.some(g => g.division === div.name);
                  if (!isActive) return null;
                  return (
                    <div key={div.name} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm group hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", div.bg)}><div.icon className={cn("h-4 w-4", div.color)} /></div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{div.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <input type="text" id={`enrollment-${div.name}`} value={divisionEnrollment[div.name]} onChange={(e) => setDivisionEnrollment({ ...divisionEnrollment, [div.name]: e.target.value })} className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              <label htmlFor={`enrollment-${div.name}`} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Learners</label>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <input type="text" id={`tuition-${div.name}`} value={divisionTuition[div.name]} onChange={(e) => setDivisionTuition({ ...divisionTuition, [div.name]: e.target.value })} className="w-16 px-2 py-1 bg-indigo-50/30 border border-indigo-100/50 rounded-lg text-[10px] font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              <label htmlFor={`tuition-${div.name}`} className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest cursor-pointer">Tuition (R$)</label>
                            </div>
                            {div.name === "Early Years" && (
                              <div className="mt-3 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/30">
                                <p className="text-[9px] text-indigo-600 leading-tight">* Toddlers 1 & 2 use a fixed <strong>part-time average (R$ 5,000)</strong>. PreK3+ uses the full tuition rate.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900">{div.occupancy}%</div>
                          <div className="text-[8px] font-bold text-slate-400 uppercase">Occupancy</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{div.isInstructionalLoad ? "Instructional Load" : "Reference Educators"}</span>
                          <span className="text-xs font-bold text-slate-900">{div.isInstructionalLoad ? `${div.fte} FTE` : `${div.sections} Lead${div.sections > 1 ? 's' : ''}`}</span>
                        </div>
                        {!div.isInstructionalLoad && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-[9px] font-bold text-slate-500 uppercase">Assistants</span><span className="text-xs font-bold text-slate-900">{div.sections}</span></div>
                            {div.isEarlyYears && (<div className="flex justify-between items-center p-2 bg-slate-50 rounded-lg"><span className="text-[9px] font-bold text-slate-500 uppercase">Monitors</span><span className="text-xs font-bold text-slate-900">{div.sections}</span></div>)}
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Educator Caliber</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {EDUCATOR_LEVELS.filter(level => { if (level.id === 'associate') return div.name === "Early Years"; return true; }).map(level => (
                              <button key={level.id} onClick={() => {
                                const divGrades = activeGrades.filter(g => g.division === div.name);
                                const newLevels = { ...gradeLevels };
                                divGrades.forEach(g => { newLevels[g.id] = level.id; });
                                setGradeLevels(newLevels);
                              }} className={cn("px-1 py-1.5 rounded-lg text-[7px] font-bold transition-all border text-center leading-tight", (activeGrades.filter(g => g.division === div.name).every(g => (gradeLevels[g.id] ?? "specialist") === level.id)) ? "bg-slate-900 border-slate-900 text-white shadow-md" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300")}>
                                {level.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-indigo-600 uppercase">Recommended Profile</span>
                            <span className="text-[7px] text-indigo-400 font-bold uppercase">{div.recLevel.id === 'master' ? 'Evaluation required for higher' : 'Based on Enrollment'}</span>
                          </div>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", div.recLevel.color)}>{div.recLevel.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* HS Subject Breakdown */}
              {activeGrades.some(g => g.division === "High School") && (
                <div className="mt-12 p-8 bg-purple-50 rounded-[2rem] border border-purple-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><GraduationCap className="h-48 w-48 text-purple-600" /></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200"><Database className="h-5 w-5 text-white" /></div>
                      <div>
                        <h4 className="text-lg font-bold text-purple-900">High School Subject Specialization</h4>
                        <p className="text-xs text-purple-600 font-medium">{activeGrades.filter(g => g.division === "High School").length} Active HS Grades ({sectionsPerGrade} Section{sectionsPerGrade > 1 ? 's' : ''} per Grade)</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {HS_SUBJECT_DISTRIBUTION.map((item, idx) => {
                        const activeHsGrades = activeGrades.filter(g => g.division === "High School").length;
                        const totalFte = Math.round(item.ftePerSection * sectionsPerGrade * activeHsGrades * 100) / 100;
                        const fullScaleFte = getHsRampFteForActiveGradeCount(activeHsGrades);
                        const masterEducators = Math.ceil(totalFte);
                        return (
                          <div key={idx} className="p-4 bg-white rounded-2xl border border-purple-100 shadow-sm hover:border-purple-300 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider max-w-[180px]">{item.subject}</span>
                              <div className="px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-full shadow-sm">{totalFte} FTE</div>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[9px] text-purple-500 leading-tight italic">{item.description}</p>
                                <div className="mt-3 flex items-center gap-1 w-32">
                                  <div className="h-1 flex-1 bg-purple-100 rounded-full overflow-hidden"><div className="h-full bg-purple-600 rounded-full" style={{ width: `${(totalFte / fullScaleFte) * 100}%` }} /></div>
                                  <span className="text-[8px] font-bold text-purple-400">{Math.round((totalFte / fullScaleFte) * 100)}%</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[8px] font-bold text-slate-400 uppercase">Master Educators</div>
                                <div className="text-lg font-bold text-purple-600">{masterEducators}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Grade-Level Educator Assignment — per-grade tier override */}
          <Card title="Grade-Level Educator Assignment" icon={GraduationCap} subtitle="Override educator tier per grade independently of the global preset above">
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                The global preset above applies one tier to all active grades simultaneously. Use the controls below to override individual grades — for example, Kinder at Master while Toddlers remain at Associate.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeGrades.map((grade) => {
                  const currentLevelId = gradeLevels[grade.id] ?? "specialist";
                  const currentLevel = EDUCATOR_LEVELS.find(l => l.id === currentLevelId) ?? EDUCATOR_LEVELS[1];
                  return (
                    <div key={grade.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{grade.name}</div>
                          <div className={cn("text-[9px] uppercase font-bold tracking-widest mt-0.5",
                            grade.division === "Early Years" ? "text-rose-500" :
                            grade.division === "Lower School" ? "text-emerald-500" :
                            grade.division === "Middle School" ? "text-blue-500" : "text-purple-500"
                          )}>{grade.division}</div>
                        </div>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full text-white", currentLevel.color)}>
                          {currentLevel.name.split(' ')[0]}
                        </span>
                      </div>
                      <select
                        value={currentLevelId}
                        onChange={(e) => setGradeLevels((prev) => ({ ...prev, [grade.id]: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {EDUCATOR_LEVELS
                          .filter(l => l.id !== 'associate' || grade.division === 'Early Years')
                          .map((level) => (
                            <option key={level.id} value={level.id}>{level.name} — {formatBRL(level.totalCost)}/mo</option>
                          ))}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 italic">Changes here propagate instantly to the financial model and 10-year staffing roadmap, separate from the 20-year payroll projection.</p>
                <button
                  onClick={() => {
                    const reset = Object.fromEntries(GRADE_CONFIG.map((g) => [g.id, "specialist"]));
                    setGradeLevels(reset);
                  }}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  Reset all to Specialist
                </button>
              </div>
            </div>
          </Card>

          {/* Layer 2: Capacity Rules Table */}
          <Card title="Layer 2: Grade-Specific Capacity Rules" icon={Scale}>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Grade Level</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Division</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Section Cap</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center">Launch Year</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADE_CONFIG.map((grade) => (
                    <tr key={grade.id} className={cn("border-b border-slate-50 hover:bg-slate-50 transition-colors", grade.openYear <= selectedYear ? "bg-white" : "bg-slate-50/50 opacity-50")}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900">{grade.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{grade.division}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900 text-center">
                        <div className="flex flex-col items-center"><span className="text-indigo-600">{grade.cap} Learners</span><span className="text-[9px] text-slate-400 uppercase font-bold">Per Section</span></div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 text-center">{grade.openYear}</td>
                      <td className="px-4 py-3">
                        {grade.openYear <= selectedYear
                          ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold rounded-full uppercase">Active</span>
                          : <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[8px] font-bold rounded-full uppercase">Future</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Strategic Roadmap */}
          <Card
            title="Strategic Roadmap & Annual Projections"
            icon={TrendingUp}
            subtitle="Full Capacity Potential (100% Occupancy) · Annual personnel cost uses salary burden × 13 + benefits × 12"
            actions={
              <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                {/* Layer Toggles */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Roadmap Layers</span>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['A', 'B', 'C', 'D'].map(layer => (
                      <button key={layer} onClick={() => toggleLayer(layer)} title={layer === 'A' ? "Teaching & Learning" : layer === 'B' ? "Leadership" : layer === 'C' ? "Operations & Backoffice" : "Campus Specialists"} className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all", visibleLayers.includes(layer) ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:text-slate-700")}>{layer}</button>
                    ))}
                  </div>
                </div>

                {/* Manual / Ideal Path toggle */}
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", !showIdealPath ? "text-indigo-600" : "text-slate-400")}>Manual</span>
                  <button onClick={() => setShowIdealPath(!showIdealPath)} className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", showIdealPath ? "bg-indigo-600" : "bg-slate-200")}>
                    <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", showIdealPath ? "translate-x-4" : "translate-x-0")} />
                  </button>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", showIdealPath ? "text-indigo-600" : "text-slate-400")}>Ideal Path</span>
                </div>

                {/* ── NEW: With Benefits / Without Benefits toggle */}
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", marginMode === "FULLY_LOADED" ? "text-indigo-600" : "text-slate-400")}>With Benefits</span>
                  <button onClick={() => setMarginMode(prev => prev === "FULLY_LOADED" ? "WITHOUT_BENEFITS" : "FULLY_LOADED")} className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none", marginMode === "WITHOUT_BENEFITS" ? "bg-indigo-600" : "bg-slate-200")}>
                    <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", marginMode === "WITHOUT_BENEFITS" ? "translate-x-4" : "translate-x-0")} />
                  </button>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", marginMode === "WITHOUT_BENEFITS" ? "text-indigo-600" : "text-slate-400")}>Without Benefits</span>
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Year</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Grades</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center whitespace-nowrap">Enrollment</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Annual Revenue</th>
                    {visibleLayers.includes('A') && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Annual Teaching (A)</th>}
                    {visibleLayers.includes('B') && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Annual Leadership (B)</th>}
                    {visibleLayers.includes('C') && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Annual Backoffice (C)</th>}
                    {visibleLayers.includes('D') && <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Annual Specialists (D)</th>}
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">
                      {visibleLayers.length === 4 ? "Operating Margin" : visibleLayers.length === 1 && visibleLayers.includes('A') ? "Division Margin" : visibleLayers.length === 2 && visibleLayers.includes('A') && visibleLayers.includes('B') ? "Campus Contribution" : visibleLayers.length === 3 && visibleLayers.includes('A') && visibleLayers.includes('B') && visibleLayers.includes('D') ? "Specialists Margin" : "Margin"}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-right whitespace-nowrap">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {projectionData.map((row) => (
                    <tr key={row.year} className={cn("border-b border-slate-50 hover:bg-slate-50 transition-colors", selectedYear === row.year && "bg-indigo-50/50")}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900">{row.year}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.grades}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700 text-center">{row.enrollment}</td>
                      <td className="px-4 py-3 text-xs font-bold text-emerald-600 text-right">{formatBRL(row.totalRevenue)}</td>
                      {visibleLayers.includes('A') && <td className="px-4 py-3 text-xs font-bold text-rose-600 text-right">{formatBRL(row.totalStaffing)}</td>}
                      {visibleLayers.includes('B') && <td className="px-4 py-3 text-xs font-bold text-slate-400 text-right">{formatBRL(row.totalLeadership)}</td>}
                      {visibleLayers.includes('C') && <td className="px-4 py-3 text-xs font-bold text-slate-400 text-right">{formatBRL(row.totalBackoffice)}</td>}
                      {visibleLayers.includes('D') && <td className="px-4 py-3 text-xs font-bold text-slate-400 text-right">{formatBRL(row.totalSpecialists)}</td>}
                      <td className="px-4 py-3 text-xs font-bold text-slate-900 text-right">{formatBRL(row.margin)}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-900 text-right">
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px]", row.efficiency > 70 ? "bg-rose-100 text-rose-700" : row.efficiency > 55 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{row.efficiency.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right sidebar: Financial Performance */}
        <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-6 self-start max-h-[calc(100vh-48px)] overflow-y-auto">
          <Card title="Layer 4: Financial Performance" icon={Activity}
            actions={
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Layers</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {['A', 'B', 'C', 'D'].map(layer => (
                    <button key={layer} onClick={() => toggleLayer(layer)} title={layer === 'A' ? "Teaching & Learning" : layer === 'B' ? "Leadership" : layer === 'C' ? "Operations & Backoffice" : "Campus Specialists"} className={cn("px-2 py-1 rounded-lg text-[10px] font-bold transition-all", visibleLayers.includes(layer) ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:text-slate-700")}>{layer}</button>
                  ))}
                </div>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[20px] p-6 space-y-5 text-white border border-slate-800 shadow-xl">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Monthly Revenue</div>
                  <div className="text-3xl font-bold tracking-tighter text-[#34d399]">{formatBRL(stats.totalRevenueMonthly)}</div>
                </div>
                <div className="space-y-4 pt-4 border-t border-white/10">
                  {visibleLayers.includes('A') && (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Teaching & Learning</div>
                        <div className="text-sm font-bold text-rose-400">-{formatBRL(stats.totalStaffingMonthly)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Division Margin</div>
                        <div className="text-sm font-bold text-white">{formatBRL(stats.staffingMargin)}</div>
                      </div>
                      <div className="h-px bg-white/10" />
                    </>
                  )}
                  {visibleLayers.includes('B') && (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leadership ({LEADERSHIP_CONFIG.reduce((sum, r) => sum + (r.headcount[selectedYear] || 0), 0)} roles)</div>
                        <div className="text-sm font-bold text-slate-400">-{formatBRL(stats.totalLeadershipMonthly)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Campus Contribution</div>
                        <div className="text-sm font-bold text-white">{formatBRL(stats.campusContributionMargin)}</div>
                      </div>
                      <div className="h-px bg-white/10" />
                    </>
                  )}
                  {visibleLayers.includes('D') && (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialists ({SPECIALISTS_CONFIG.reduce((sum, r) => sum + (r.headcount[selectedYear] || 0), 0)} people)</div>
                        <div className="text-sm font-bold text-slate-400">-{formatBRL(stats.totalSpecialistsMonthly)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-white uppercase tracking-widest">Specialists Margin</div>
                        <div className="text-sm font-bold text-white">{formatBRL(stats.specialistsMargin)}</div>
                      </div>
                      <div className="h-px bg-white/10" />
                    </>
                  )}
                  {visibleLayers.includes('C') && (
                    <div className="flex justify-between items-center">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations & Backoffice ({BACKOFFICE_CONFIG.reduce((sum, r) => sum + (r.headcount[selectedYear] || 0), 0)} people)</div>
                      <div className="text-sm font-bold text-slate-400">-{formatBRL(stats.totalBackofficeMonthly)}</div>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs font-bold text-white uppercase tracking-widest">
                      {visibleLayers.length === 4 ? "Operating Margin" : visibleLayers.length === 1 && visibleLayers.includes('A') ? "Division Margin" : visibleLayers.length === 2 && visibleLayers.includes('A') && visibleLayers.includes('B') ? "Campus Contribution" : visibleLayers.length === 3 && visibleLayers.includes('A') && visibleLayers.includes('B') && visibleLayers.includes('D') ? "Specialists Margin" : "Margin"}
                    </div>
                    <div className="text-lg font-bold text-white">{formatBRL(stats.operatingMargin)}</div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Staffing Efficiency</div>
                    <div className={cn("text-sm font-bold", stats.staffingEfficiency > 70 ? "text-[#f87171]" : stats.staffingEfficiency > 55 ? "text-[#fbbf24]" : "text-[#34d399]")}>{stats.staffingEfficiency.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total FTE</div><div className="text-lg font-bold text-slate-900">{stats.totalFTE}</div></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Learners</div><div className="text-lg font-bold text-slate-900">{stats.totalEnrollment}</div></div>
              </div>

              {/* ── NEW: Allocation split cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">FOPAG Direto</div>
                  <div className="text-sm font-bold text-slate-900">{formatBRL(stats.allocationMonthly.fopag)}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Folha Direta</div>
                  <div className="text-sm font-bold text-slate-900">{formatBRL(stats.allocationMonthly.folhaDireta)}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button onClick={() => setShowHiringBreakdown(!showHiringBreakdown)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /><span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hiring Breakdown by Scenario</span></div>
                  <motion.div animate={{ rotate: showHiringBreakdown ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </motion.div>
                </button>
                <motion.div initial={false} animate={{ height: showHiringBreakdown ? "auto" : 0, opacity: showHiringBreakdown ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                  <div className="space-y-3 pt-4">
                    {stats.divisions.map(div => (
                      <div key={div.name} className="flex flex-col p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-2 w-2 rounded-full", div.selectedLevel.color)} />
                            <div>
                              <div className="text-[10px] font-bold text-slate-900">{div.name}</div>
                              <div className="text-[8px] text-slate-500 uppercase font-bold">{div.selectedLevel.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-900">{formatBRL(div.cost)}</div>
                            <div className="text-[8px] text-slate-400 uppercase font-bold">Monthly</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-slate-400 uppercase">{div.isInstructionalLoad ? "FTE:" : "Leads:"}</span><span className="text-[9px] font-bold text-slate-700">{div.isInstructionalLoad ? div.fte : div.sections}</span></div>
                          {!div.isInstructionalLoad && (
                            <>
                              <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-slate-400 uppercase">Assistants:</span><span className="text-[9px] font-bold text-slate-700">{div.sections}</span></div>
                              {div.isEarlyYears && (<div className="flex items-center gap-2"><span className="text-[8px] font-bold text-slate-400 uppercase">Monitors:</span><span className="text-[9px] font-bold text-slate-700">{div.sections}</span></div>)}
                            </>
                          )}
                          <div className="flex items-center gap-2"><span className="text-[8px] font-bold text-slate-400 uppercase">Learners:</span><span className="text-[9px] font-bold text-slate-700">{div.learners}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>

          <Card title="Financial Assumptions" icon={ShieldCheck}>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <Info className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Tuition Model</p>
                  <p className="text-[10px] text-amber-700 leading-relaxed">Toddler tuition (T1/T2) is calculated as a part-time average (R$ 5,000). All other grades use the selected division rate.</p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Calculator className="h-4 w-4 text-indigo-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">Annualization Logic</p>
                  <p className="text-[10px] text-indigo-700 leading-relaxed">
                    Annual personnel cost = <strong>(gross + labor charges) × 13</strong> + benefits × 12. Revenue annualizes at × 12. This matches the spreadsheet's "Custo Ano" formula.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
            <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-3">Cross-Tab Relationship</div>
            <p className="text-[11px] text-indigo-600 leading-relaxed mb-4">This staffing model is directly linked to the <strong>Organizational Evolution</strong> roadmap. The recommended profiles here feed into the hiring requirements seen in the <strong>Hiring Profile Cards</strong>.</p>
            <button onClick={() => { const tabs: TabId[] = ["cover", "staffing", "hr", "early-years", "lower-school", "ms", "hs", "load", "payroll"]; const currentIndex = tabs.indexOf("staffing"); setActiveTab(tabs[currentIndex + 1]); }} className="w-full py-2 bg-white border border-indigo-200 rounded-xl text-[10px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">VIEW SCORE CARDS<ArrowRight className="h-3 w-3" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
