/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  GraduationCap, 
  Scale, 
  LayoutDashboard, 
  ChevronRight,
  Activity, 
  Database, 
  Info,
  Layers,
  Baby,
  School,
  Calculator,
  FileText,
  Home,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  GitBranch,
  PieChart,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import HiringProfileCardsTab from "./components/sections/HiringProfileCardsTab";
import PayrollProjectionTab from "./components/sections/PayrollProjectionTab";
import ViabilitySimulatorTab from "./components/sections/ViabilitySimulatorTab";
import OfferScenariosTab from "./components/sections/OfferScenariosTab";
import ExecutiveOrgDesignTab from "./components/sections/ExecutiveOrgDesignTab";
import EarlyYearsTab from "./components/sections/EarlyYearsTab";
import LowerSchoolTab from "./components/sections/LowerSchoolTab";
import MiddleSchoolTab from "./components/sections/MiddleSchoolTab";
import HighSchoolTab from "./components/sections/HighSchoolTab";
import StaffingTab from "./components/sections/StaffingTab";
import LoadTab from "./components/sections/LoadTab";
import AboutModal from "./components/sections/AboutModal";
import DreScenarioSimulatorTab from "./components/sections/DreScenarioSimulatorTab";

// --- Types ---
export type TabId = "cover" | "staffing" | "offer-scenarios" | "executive-org-design" | "hr" | "early-years" | "lower-school" | "ms" | "hs" | "load" | "payroll" | "viability" | "dre-scenario-simulator";

const APP_TAB_ORDER: TabId[] = [
  "cover",
  "staffing",
  "offer-scenarios",
  "executive-org-design",
  "hr",
  "early-years",
  "lower-school",
  "ms",
  "hs",
  "load",
  "payroll",
  "viability",
  "dre-scenario-simulator",
];

// --- Components ---

const Badge = ({ children, variant = "info" }: { children: React.ReactNode, variant?: "default" | "warning" | "success" | "info" | "purple" | "danger" }) => {
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

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition-all duration-200 whitespace-nowrap sm:text-xs md:px-4 md:text-sm",
      active 
        ? "bg-slate-900 text-white shadow-md" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", active ? "text-white" : "text-slate-400")} />
    {label}
  </button>
);

// --- Tabs ---

const CoverTab = ({ onStart }: { onStart: () => void }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl space-y-8"
    >
      <div className="flex justify-center mb-12">
        <div className="h-24 w-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
          <GraduationCap className="h-12 w-12 text-white" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-slate-300" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Rio de Janeiro Campus</span>
          <div className="h-[1px] w-12 bg-slate-300" />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.9]">
          Strategic <br />
          <span className="text-indigo-600 italic">Organizational</span> <br />
          Architecture
        </h1>
        
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed pt-6">
          A comprehensive roadmap for staffing, talent strategy, and operational scaling from launch to maturity.
        </p>
      </div>

      <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-6">
        <button 
          onClick={onStart}
          className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group"
        >
          Explore the Roadmap
          <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Version</div>
            <div className="text-xs font-bold text-slate-900">2.5 Stable Release</div>
          </div>
        </div>
      </div>
    </motion.div>
  </div>
);

// --- App Root ---
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("cover");
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [msSections, setMsSections] = useState(2);
  const [hsSections, setHsSections] = useState(2);
  const [selectedYear, setSelectedYear] = useState<number>(2028);

  React.useEffect(() => {
    const hasSeenAbout = localStorage.getItem('hasSeenAbout_v3.0');
    if (!hasSeenAbout) {
      setShowAboutModal(true);
      localStorage.setItem('hasSeenAbout_v3.0', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-auto md:h-20 flex flex-col md:flex-row items-center justify-between py-4 md:py-0 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0"><GraduationCap className="h-6 w-6 text-white" /></div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-none text-sm md:text-base">Rio | Strategic Organizational Architecture</h1>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">São Paulo Parity Scaling v2.5</p>
            </div>
            <div className="ml-auto md:hidden flex items-center gap-2">
              {activeTab !== "cover" && (<button onClick={() => setActiveTab("cover")} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors" title="Return to Cover"><Home className="h-4 w-4" /></button>)}
              <Badge variant="success">v3.0</Badge>
            </div>
          </div>

          <nav aria-label="Model sections" className="flex w-full items-center gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1 no-scrollbar md:w-auto md:max-w-[820px] lg:max-w-none">
            <TabButton active={activeTab === "cover"} onClick={() => setActiveTab("cover")} label="Cover" icon={LayoutDashboard} />
            <TabButton active={activeTab === "staffing"} onClick={() => setActiveTab("staffing")} label="Staffing Model" icon={Calculator} />
            <TabButton active={activeTab === "offer-scenarios"} onClick={() => setActiveTab("offer-scenarios")} label="Cenários da Oferta" icon={Layers} />
            <TabButton active={activeTab === "executive-org-design"} onClick={() => setActiveTab("executive-org-design")} label="Executive Org Design" icon={GitBranch} />
            <TabButton active={activeTab === "hr"} onClick={() => setActiveTab("hr")} label="Hiring Profile Cards" icon={FileText} />
            <TabButton active={activeTab === "early-years"} onClick={() => setActiveTab("early-years")} label="Early Years" icon={Baby} />
            <TabButton active={activeTab === "lower-school"} onClick={() => setActiveTab("lower-school")} label="Lower School" icon={School} />
            <TabButton active={activeTab === "ms"} onClick={() => setActiveTab("ms")} label="Middle School" icon={Database} />
            <TabButton active={activeTab === "hs"} onClick={() => setActiveTab("hs")} label="High School" icon={GraduationCap} />
            <TabButton active={activeTab === "load"} onClick={() => setActiveTab("load")} label="Load Calculator" icon={Activity} />
            <TabButton active={activeTab === "payroll"} onClick={() => setActiveTab("payroll")} label="Payroll Projection" icon={DollarSign} />
            <TabButton active={activeTab === "viability"} onClick={() => setActiveTab("viability")} label="Viability Simulator" icon={Scale} />
            <TabButton active={activeTab === "dre-scenario-simulator"} onClick={() => setActiveTab("dre-scenario-simulator")} label="DRE Scenario Simulator" icon={PieChart} />
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowAboutModal(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 shadow-sm">
              <Info className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">ABOUT THIS MODEL</span>
              <span className="sm:hidden">ABOUT</span>
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              {activeTab !== "cover" && (
                <button onClick={() => setActiveTab("cover")} className="flex items-center gap-2 px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 shadow-sm">
                  <Home className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">RETURN TO COVER</span>
                  <span className="sm:hidden">HOME</span>
                </button>
              )}
              <div className="hidden sm:block"><Badge variant="success">v3.0</Badge></div>
            </div>
          </div>
        </div>
      </header>

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-8 md:py-12">
        {activeTab !== "cover" && (
          <div className="mb-8 md:mb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="h-1 w-8 bg-slate-900 rounded-full" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Board Review</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {activeTab === "hr" && "Hiring Profile Cards & Clusters"}
              {activeTab === "load" && "Operational Load Calculator"}
              {activeTab === "early-years" && "Early Years Foundation"}
              {activeTab === "lower-school" && "Lower School Excellence"}
              {activeTab === "ms" && "Middle School Transition"}
              {activeTab === "staffing" && "Staffing Capacity & Growth"}
              {activeTab === "offer-scenarios" && "Cenários da Oferta"}
              {activeTab === "executive-org-design" && "Executive Org Design"}
              {activeTab === "hs" && "High School Expansion Strategy"}
              {activeTab === "payroll" && "Payroll Projection & Cost Stack"}
              {activeTab === "viability" && "Viability Decision Simulator"}
              {activeTab === "dre-scenario-simulator" && "DRE Scenario Simulator"}
            </h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto md:mx-0">
              {activeTab === "hr" && "Detailed ownership, hiring profiles, and strategic cluster models for Middle and High School."}
              {activeTab === "load" && "A resilient test for Middle and High School staffing, simulating instructional load and system stress."}
              {activeTab === "early-years" && "Nurturing curiosity through play-based bilingual immersion."}
              {activeTab === "lower-school" && "Building strong foundations in literacy, numeracy, and social-emotional intelligence."}
              {activeTab === "ms" && "Strategic transition from cluster-based to specialist-led instruction."}
              {activeTab === "staffing" && "A dynamic model mapping enrollment density to pedagogical caliber and budget impact."}
              {activeTab === "offer-scenarios" && "Board-facing scenario architecture: grade ceiling, capacity, target enrollment, academic ecosystem, and signature-program maturity."}
              {activeTab === "executive-org-design" && "Full Rio organization tree by scenario and year."}
              {activeTab === "hs" && "Strategic roadmap for Grades 9-12, transitioning to dedicated specialists."}
              {activeTab === "payroll" && "Board view of class-driven staffing cost, revenue less modeled FOPAG, and payroll coverage across the approved scenarios."}
              {activeTab === "viability" && "Board-facing baseline plus directional sensitivity and threshold planning signals; not a final financial model."}
              {activeTab === "dre-scenario-simulator" && "Operating scenario layer for Rio's 2028 opening model."}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === "cover" && <CoverTab onStart={() => setActiveTab("payroll")} />}
            {activeTab === "hr" && <HiringProfileCardsTab />}
            {activeTab === "load" && <LoadTab msSections={msSections} hsSections={hsSections} />}
            {activeTab === "early-years" && <EarlyYearsTab />}
            {activeTab === "lower-school" && <LowerSchoolTab />}
            {activeTab === "ms" && <MiddleSchoolTab sections={msSections} setSections={setMsSections} />}
            {activeTab === "staffing" && (<StaffingTab setActiveTab={setActiveTab} onShowAbout={() => setShowAboutModal(true)} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />)}
            {activeTab === "offer-scenarios" && <OfferScenariosTab />}
            {activeTab === "executive-org-design" && <ExecutiveOrgDesignTab />}
            {activeTab === "hs" && <HighSchoolTab sections={hsSections} setSections={setHsSections} />}
            {activeTab === "payroll" && <PayrollProjectionTab />}
            {activeTab === "viability" && <ViabilitySimulatorTab />}
            {activeTab === "dre-scenario-simulator" && <DreScenarioSimulatorTab />}

            {activeTab !== "cover" && (
              <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => { const currentIndex = APP_TAB_ORDER.indexOf(activeTab); if (currentIndex > 0) setActiveTab(APP_TAB_ORDER[currentIndex - 1]); }} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeft className="h-4 w-4" />PREVIOUS SECTION
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  {activeTab !== "dre-scenario-simulator" ? (
                    <button onClick={() => { const currentIndex = APP_TAB_ORDER.indexOf(activeTab); if (currentIndex < APP_TAB_ORDER.length - 1) setActiveTab(APP_TAB_ORDER[currentIndex + 1]); }} className="flex items-center gap-2 px-8 py-3 bg-slate-900 rounded-2xl text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                      NEXT SECTION<ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => setActiveTab("cover")} className="flex items-center gap-2 px-8 py-3 bg-rose-600 rounded-2xl text-sm font-bold text-white hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                      FINISH & RETURN TO COVER<Home className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Confidential</div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Strategic Plan 2031</div>
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2026 Escola Concept</div>
        </div>
      </footer>
    </div>
  );
}
