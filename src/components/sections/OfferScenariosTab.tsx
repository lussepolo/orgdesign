import React, { useState } from "react";
import {
  Activity,
  Briefcase,
  Building2,
  CalendarDays,
  Database,
  Download,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";

const Card = ({ children, className, title, subtitle, icon: Icon, actions, style }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, icon?: React.ElementType, actions?: React.ReactNode, style?: React.CSSProperties }) => (
  <div className={cn("bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)} style={style}>
    {title && (
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 mt-0.5" />}
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

type OfferScenarioView = "brief" | "ladder" | "scenario" | "budget" | "architecture" | "appendix";

type BudgetRowStatus =
  | "Baseline control"
  | "Mapping validation"
  | "Scenario driver"
  | "Potential increment"
  | "Conditional increment"
  | "Governance placeholder"
  | "Not active";

type BudgetComparisonRow = {
  area: string;
  status: BudgetRowStatus;
  originallyBudgeted: string;
  currentRecommendation: string;
  incrementalBudgetImpact: string;
  whyNecessary: string;
};

type ScenarioBudgetComparison = {
  scenario: string;
  gradeCeiling: string;
  strategicFrame: string;
  rows: BudgetComparisonRow[];
};

const offerScenarioViews: Array<{ id: OfferScenarioView; label: string }> = [
  { id: "brief", label: "01 Síntese executiva" },
  { id: "ladder", label: "02 Escada de cenários" },
  { id: "scenario", label: "03 Cenário selecionado" },
  { id: "budget", label: "04 Implicações de recursos" },
  { id: "architecture", label: "05 Arquitetura acadêmica" },
  { id: "appendix", label: "06 Premissas operacionais" },
];

const OFFER_SCENARIO_GOVERNANCE_BOUNDARY =
  "A-D are offer/narrative scenarios. They describe pedagogical thresholds and implementation implications; they do not authorize headcount, payroll, budget, final staffing, or final implementation.";

// ─────────────────────────────────────────────────────────────────────────────
// OFFER SCENARIOS TAB — board-facing scenario architecture only
// ─────────────────────────────────────────────────────────────────────────────

const pedagogicalOfferScenarios = [
{
title: "Scenario A",
gradeCeiling: "Up to Grade 3",
targetEnrollment: "228 learners",
modeledCapacity: "302 learners",
impliedOccupancy: "75.5%",
strategicIdentity: "Foundation + early academic evidence",
offerStage: "Early Years + first Lower School cycle",
classroomPackage: [
"Fixed classroom package: EY = reference educator + assistant + monitor; LS = reference educator + assistant",
"PDJ operates through full-class experiential projects embedded in classroom routines",
"Learning Experience Design function supports project quality, documentation, and learning-engine fidelity",
],
specialistEcosystem: [
"Specialist planning premise: see Operating Assumptions.",
],
signaturePrograms: [
"MAP Testing begins in Grade 1",
"PDJ embedded in classroom routines",
"Language acquisition and academic evidence routines begin",
],
notActiveYet: [
"Pathways",
"Creative Hub",
"MUN",
"Middle School advisory and project mentorship",
"Academic electives",
],
middleSchoolLogic: "Not active",
recommendedPathway: "Coached Foundation",
roles: [
"Teaching & Learning Coach: recommended",
"Language & Academic Performance Coach: recommended for validation",
"Learning Experience Design function: indicated — supports project quality, documentation, and educator planning",
"Curriculum & Assessment Designer: optional/shared",
],
risk:
"If too lean, the school may open with operational viability but uneven classroom quality. The main risk is variation across founding educators.",
boardSentence:
"Scenario A establishes the basic offer and early academic evidence without adding Middle School or signature-program infrastructure.",
tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
},
{
title: "Scenario B",
gradeCeiling: "Up to Grade 4",
targetEnrollment: "258 learners",
modeledCapacity: "358 learners",
impliedOccupancy: "72.1%",
strategicIdentity: "Researchers progression + Concept identity",
offerStage: "Lower School progression",
classroomPackage: [
"Fixed classroom package continues: EY = reference educator + assistant + monitor; LS = reference educator + assistant",
"Grade 4 makes the Lower School Researchers engine more visible through inquiry, evidence-making, Math reasoning, Scientific Literacy, documentation, and academic language",
"PDJ remains full-class; Learning Experience Design becomes more important as documentation and academic evidence deepen",
],
specialistEcosystem: [
"Specialist planning premise: see Operating Assumptions.",
],
signaturePrograms: [
"MAP cycles and performance visibility increase",
"Inquiry, evidence-making, academic language, and research routines consolidate",
"Preparation for Grade 5 Pathways",
"Early portfolio evidence begins",
],
notActiveYet: [
"Formal Grade 5 Pathways",
"Creative Hub",
"MUN",
"Middle School advisory and project mentorship",
"Academic electives",
],
middleSchoolLogic: "Not active",
recommendedPathway: "Academic Progression",
roles: [
"Teaching & Learning Coach: recommended",
"Language & Academic Performance Coach: recommended for validation",
"Curriculum & Assessment Designer: recommended/shared",
"Learning Experience Design function: more important as documentation, academic evidence, and research routines deepen; Project Mentorship is not active yet",
],
risk:
"If Scenario B is treated only as one additional grade, the campus misses the opportunity to make the Lower School Researchers engine academically visible before Middle School. Grade 4 should consolidate inquiry, evidence-making, Math reasoning, Scientific Literacy, academic language, and research routines that make Grade 5 Pathways and Grade 6 Middle School more coherent.",
boardSentence:
"Scenario B turns Grade 4 into the main Researchers progression step, preparing learners for Grade 5 Pathways.",
tone: "border-blue-200 bg-blue-50 text-blue-700",
},
{
title: "Scenario C",
gradeCeiling: "Up to Grade 5",
targetEnrollment: "288 learners",
modeledCapacity: "390 learners",
impliedOccupancy: "73.8%",
strategicIdentity: "Lower School completion + Pathways activation",
offerStage: "Complete Lower School pathway",
classroomPackage: [
"Fixed classroom package continues: EY = reference educator + assistant + monitor; LS = reference educator + assistant",
"Grade 5 activates Pathways and transition protocols; projects remain full-class experiential projects",
"Passion Projects are not active yet; Project Mentorship begins with the Grade 6 Passion Project model",
],
specialistEcosystem: [
"Specialist planning premise: see Operating Assumptions.",
],
signaturePrograms: [
"Pathway classes active in Grade 5",
"PDJ remains full-class: educator-guided whole-class inquiry projects, evidence gathering, and presentation routines",
"Learning Experience Design and pathway coordination become stronger",
"Portfolio evidence, Festival of Learning quality, and family-facing narratives mature",
],
notActiveYet: [
"Creative Hub",
"Middle School clusters",
"PSAT mock",
"College readiness testing",
"AP and College Counseling",
],
middleSchoolLogic: "Preparation only",
recommendedPathway: "Transition Readiness",
roles: [
"Teaching & Learning Coach: recommended",
"Language & Academic Performance Coach: recommended for validation",
"Curriculum & Assessment Designer: recommended",
"Learning Experience Design function: recommended for validation — strongest pre-Middle School PDJ coordination",
"Project Mentorship: not active yet",
],
risk:
"The risk is opening Grade 5 as a normal Lower School grade without preparing the academic and project architecture for Grade 6.",
boardSentence:
"Scenario C completes Lower School, activates Grade 5 Pathways, and prepares the system for Middle School without launching Grade 6 structures.",
tone: "border-indigo-200 bg-indigo-50 text-indigo-700",
},
{
title: "Scenario D",
gradeCeiling: "Up to Grade 6",
targetEnrollment: "318 learners",
modeledCapacity: "440 learners",
impliedOccupancy: "72.3%",
strategicIdentity: "Middle School launch + global/program activation",
offerStage: "First Middle School year",
mainClaim: "Grade 6 is not one more Lower School grade. It activates a different operating rhythm.",
offerActivated: [
"Core academics",
"Cluster themes",
"Creative Hub",
"MUN",
"Pathways continue from Grade 5",
"Academic elective, 1 weekly option",
"Passion Project",
"Advisory",
"Project mentorship",
"Multiple educators",
"Multiple learning spaces",
],
classroomPackage: [
"Fixed classroom package continues: EY = reference educator + assistant + monitor; LS = reference educator + assistant",
"Grade 6 shifts toward cluster architecture; Middle School operating rhythm begins",
"Passion Projects begin in Grade 6: small-group learner-led projects, typically 3–5 learners per group",
],
grade6ClusterModel: [
"STEM Cluster: Integrated Mathematics + Natural Sciences",
"Humanities Cluster: Língua Portuguesa + Social Sciences",
"Global Studies & Project Design: ELA + Passion Project + Global Expression / early pathways",
"Shared specialist ecosystem: Body & Movement, Creative Hub, Arts, Design, electives",
],
specialistEcosystem: [
"Specialist planning premise: see Operating Assumptions.",
],
signaturePrograms: [
"Grade 6 cluster model launches",
"PDJ shifts from classroom design system to mentorship architecture through Passion Projects",
"Projects shift from full-class to small-group learner-led; groups are typically 3–5 learners",
"Advisory, Passion Project, MUN, Creative Hub, and academic elective active",
"Project mentorship becomes a coordinated operating function",
],
notActiveYet: [
"Grade 7 PSAT mock",
"Grade 8 college readiness testing",
"AP and College Counseling",
],
middleSchoolLogic: "Active",
recommendedPathway: "Middle School Signature Launch",
roles: [
"Teaching & Learning Coach: recommended for validation",
"Curriculum & Assessment Designer: recommended for validation",
"Language & Academic Performance Coach: indicated for validation",
"Signature Programs / Project Design Lead: recommended",
"Project mentorship support: coordinated function, not an automatically authorized dedicated role in year one",
],
risk:
"If Grade 6 opens with only classroom coverage, the Middle School offer may be underpowered. The school may claim electives, Passion Project, advisory, and project mentorship without the adult ecosystem to sustain them.",
boardSentence:
"Scenario D changes the category of the business plan by launching the first Middle School operating model.",
tone: "border-purple-200 bg-purple-50 text-purple-700",
},
		  ];
const bodyMovementLoads = [
["Scenario A", "32 blocos/semana", "Premissa de planejamento: 2 educadores + 1 monitor"],
["Scenario B", "36 blocos/semana", "Premissa de planejamento: 2 educadores + 1 monitor"],
["Scenario C", "40 blocos/semana", "Premissa de planejamento: 2 educadores + 1 monitor"],
["Scenario D", "44 blocos/semana", "Premissa de planejamento: 2 educadores + 1 monitor; possible 3rd educator if shared MS/HS load expands"],
		  ];
const specialistLoadPremises = [
["Body & Movement", "Highly recurring across every grade", "2 educators + 1 monitor", "2 educators + 1 monitor", "2 to 3 educators + 1 monitor"],
["Sound Exploration / Music", "Broad EY/LS coverage, approximately 2-educator load in the current schedule", "1 to 2 educators", "2 educators", "2 educators, possible elective support"],
["Artistic Design", "More than one educator load once LS expands", "1 educator", "2 educators", "2 educators + Creative Hub integration"],
["Performing Arts", "Lower slot count but specific program/exhibition function", "1 educator", "1 educator + shared support", "2 educators if productions/electives expand"],
["Design Technologies", "Depends on age band, space, setup, project format, and Creative Hub connection", "2 educators", "3 educators", "4 to 5 educators"],
["Creative Hub", "Not active before Grade 6", "Not active", "Preparation only", "Active from Grade 6"],
		  ];
const specialistBudgetImplications: Record<string, string> = {
"Body & Movement": "Slot threshold can trigger added educator capacity above the lean premise.",
"Sound Exploration / Music": "Coverage may require a second educator as Lower School usage broadens.",
"Artistic Design": "Expansion pressure grows with Pathways, exhibitions, and Creative Hub integration.",
"Performing Arts": "Productions, electives, and Festival of Learning can create incremental support needs.",
"Design Technologies": "Space, setup, project format, and Creative Hub connection can raise capacity needs.",
"Creative Hub": "Inactive before Grade 6; active launch creates specialist and space pressure.",
};
const specialistCapacityDomains = specialistLoadPremises.map(
([domain, loadSignal, lean, balanced, premium]) => ({
domain,
loadSignal,
lean,
balanced,
premium,
risk: specialistBudgetImplications[domain] ?? "Validate load, space, and scope before converting premise into hiring.",
})
);
type SpecialistFinalGrade = "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6";
type SpecialistSectionsPerGrade = 1 | 2;
type SpecialistBlocksPerGrade = 1 | 2;
type SpecialistBlockDuration = 45 | 50;
type SpecialistCapacityThreshold = 24 | 26 | 30;
const specialistPillarGradeSequence = [
"Toddlers 1",
"Toddlers 2",
"Pre-K3",
"Pre-K4",
"Kindergarten",
"Grade 1",
"Grade 2",
"Grade 3",
"Grade 4",
"Grade 5",
"Grade 6",
] as const;
const specialistFinalGradeOptions: SpecialistFinalGrade[] = ["Grade 3", "Grade 4", "Grade 5", "Grade 6"];
const specialistSectionsPerGradeOptions: SpecialistSectionsPerGrade[] = [1, 2];
const specialistBlocksPerGradeOptions: SpecialistBlocksPerGrade[] = [1, 2];
const specialistBlockDurationOptions: SpecialistBlockDuration[] = [45, 50];
const specialistCapacityThresholdOptions: SpecialistCapacityThreshold[] = [24, 26, 30];
const specialistPillarSimulatorRows = [
["Opening baseline", "1 section", "Grade 3", "16 blocks", "12 h", "Sustainable"],
["Extended LS", "1 section", "Grade 5", "20 blocks", "15 h", "Sustainable"],
["Two-section trigger", "2 sections", "Grade 3", "32 blocks", "24 h", "Requires second specialist"],
["Full LS, two sections", "2 sections", "Grade 5", "40 blocks", "30 h", "Requires second specialist"],
];
const currentSpecialistEcosystem = [
["Body & Movement", "Marcello Humeniuk, Maíra Jardim, Felipe Pierrobon, Kirk Barros", "Reference planning premise: 4 educators"],
["Sound Exploration / Music", "Igor, Bianca", "Reference planning premise: 2 educators"],
["Artistic Design / Atelier", "Alexandre, Ariádine, Marcio, Lívia", "Reference planning premise includes atelier and exhibition infrastructure"],
["Performing Arts", "Embedded through Sound Exploration / Music at launch", "Program layer, not one of the four simulator pillars"],
["Design Technologies / Learning Experience Designer capacity", "Babi, Duda, Larissa, Juliana, Iris", "Reference planning premise: classroom-facing Learning Experience Designer capacity"],
["Total specialist ecosystem reference", "Shared reference team", "Reference planning premise: 15 educators"],
		  ];
const bodyMovementReferenceLoads = [
["Marcello Humeniuk", "25", "2", "-", "-", "-", "27"],
["Maíra Jardim", "2", "18", "-", "6", "-", "26"],
["Felipe Pierrobon", "-", "18", "-", "8", "-", "26"],
["Kirk Barros", "-", "-", "20", "6", "2", "28"],
		  ];
const bodyMovementReferenceTotals = ["Total Body & Movement load", "27", "38", "20", "20", "2", "107"];
const middleSchoolClusters = [
["Grade 6 STEM launch profile", "Mathematics + Natural Sciences foundations", "Grade 6 launch profile only; viable when complemented by Pathways, Advisory, STEAM elective, Project Mentorship, scientific inquiry, documentation, or critique cycles"],
["Grade 7 hybrid specialization", "Mathematics, Portuguese, and English Language Arts become stronger full-load domains; Natural Sciences and Social Sciences become dedicated domains with aligned complementary functions", "Hybrid specialization stage; not a cluster-only model"],
["Humanities coordination", "Portuguese and Social Sciences remain academically connected through argumentation, civic inquiry, academic language, and evidence routines", "Portuguese does not need Social Sciences for load viability once Grades 6-7 have two sections"],
["English Language Arts / Global Studies coordination", "ELA, communication, documentation, early pathways, and project-based learning routines", "Coordinated function, not a default project-design role authorization"],
["Shared specialist ecosystem", "Body & Movement, Sound Exploration / Music, Artistic Design / Atelier, and Design Technologies / Learning Experience Designer", "Distinct capacity domains; not one generic specialist pool"],
["Grade 8 program transition", "Grades 6-7 use Passion Projects as the project-based learning structure", "Grade 8 transitions to Babson EPIC Certificate as the entrepreneurship and external-facing evidence experience"],
		  ];
const middleSchoolProgression = [
["Grade 6", "Cluster-based launch"],
["Grade 7", "Transitional specialist model"],
["Grade 8", "More mature specialist model and Babson EPIC culmination"],
["Grades 9-12", "High School specialization, pathways, credentials, internships, university-facing evidence"],
		  ];
const mentorshipProgression = [
["Up to Grade 5", "PDJ is a classroom design and documentation system; educators guide full-class experiential projects through each division's learning engine — Explorers in EY, Researchers in LS"],
["Grade 6", "Educators act as mentors within coordinated project architecture"],
["Grade 7", "Hybrid specialization and pathway logic strengthen mentorship routines"],
["Grade 8", "Babson EPIC program-led mentorship and evidence routines"],
["High School", "Specialist mentorship, capstones, internships, university-facing evidence"],
		  ];
const projectMentorTriggers = [
"Project volume exceeds educator capacity",
"External partnerships become operationally heavy",
"Babson EPIC requires consistent facilitation",
"High School pathways require specialist mentorship",
"Festival of Learning requires stronger curation",
"Internships or external mentors require coordination",
		  ];
const pathwayOptions = [
{
title: "Lean Business Plan",
purpose: "Basic offer posture for Scenario A or an A-B launch path.",
structure: [
"Protect basic offer architecture without premature hierarchy",
"Lean shared specialists and coaching support",
"LAP Coach recommended from launch",
"No Middle School rhythm or signature-program launch layer",
],
bestFor: ["Lower enrollment certainty", "Margin protection", "Cost control", "Basic launch viability"],
risk:
"Risk: academic differentiation and specialist load depend heavily on shared adult capacity.",
},
{
title: "Balanced Operating Model",
purpose: "Lower School completion posture aligned to Scenario C.",
structure: [
"Protect baseline and strengthen Grade 5 readiness",
"Shared specialists across EY/LS and later MS",
"Pathways, portfolio evidence, and transition routines become active",
"Projects remain full-class; Passion Projects are not active yet",
],
bestFor: ["Pedagogical credibility", "Cost discipline", "Progressive maturity", "Board-facing defensibility"],
risk: "Risk: requires disciplined coordination before enrollment density fully matures.",
recommendation: "Default recommendation",
},
{
title: "Premium Signature-Program Launch",
purpose: "Middle School rhythm posture aligned to Scenario D.",
structure: [
"Use the offer as a visible market differentiator",
"Fuller shared specialist ecosystem",
"T&L, C&A, LAP, and signature-program leadership included",
"Grade 6 activates Creative Hub, MUN, advisory, academic electives, Passion Projects, and project mentorship as a function",
],
bestFor: ["Premium market positioning", "Differentiation in Rio", "Visible Concept identity", "Strong family-facing narrative"],
risk: "Higher cost before enrollment density fully matures.",
},
		  ];
const scenarioMatrix = [
["Scenario A", "Grade 3", "228", "302", "75.5%", "Foundation + early academic evidence", "EY: reference educator + assistant + monitor; LS: reference educator + assistant", "Shared, lighter version", "MAP from Grade 1, classroom PDJ, language monitoring", "Not active", "Coached Foundation"],
["Scenario B", "Grade 4", "258", "358", "72.1%", "Researchers progression + Concept identity", "EY: reference educator + assistant + monitor; LS: reference educator + assistant", "Shared, broader LS load", "MAP cycles, inquiry, evidence-making, academic language, early portfolio, Grade 5 Pathways preparation; PDJ full-class", "Not active", "Academic Progression"],
["Scenario C", "Grade 5", "288", "390", "73.8%", "Lower School completion + Pathways activation", "EY: reference educator + assistant + monitor; LS: reference educator + assistant", "Full LS continuity", "Pathway classes active; PDJ full-class; no Passion Projects; Creative Hub preparation only", "Preparation only", "Transition Readiness"],
["Scenario D", "Grade 6", "318", "440", "72.3%", "Middle School launch + global/program activation", "EY/LS remains; Grade 6 cluster model", "Shared EY/LS/MS ecosystem", "Creative Hub, MUN, Passion Project, advisory, electives, mentorship", "Active", "Middle School Signature Launch"],
		  ];
const experienceGrowthRoadmap = [
{
year: "2028",
stage: "Foundational launch",
ceiling: "EY + Grades 1-3",
experience: "PDJ is already schoolwide: EY uses Reggio-inspired Explorers inquiry, while Grade 1 begins MAP and makes the Lower School Researchers engine more explicit through phenomenon-based learning.",
ecosystem: "EY classroom package, LS classroom package, Language & Academic Performance Coach, coaching, and shared specialist coverage.",
},
{
year: "2029",
stage: "Lower School progression",
ceiling: "Up to Grade 4",
experience: "Grade 4 makes the Researchers engine more academically visible through inquiry, evidence-making, Math reasoning, Scientific Literacy, documentation, academic language, and MAP cycles.",
ecosystem: "Reference educator model remains primary; curriculum, assessment, language acquisition, and academic performance support become more important.",
},
{
year: "2030",
stage: "Pathways activation",
ceiling: "Up to Grade 5",
experience: "Grade 5 completes Lower School, activates Pathways and transition routines, and keeps projects as full-class Researchers investigations. Creative Hub remains readiness only.",
ecosystem: "Full LS specialist continuity, academic monitoring, portfolio evidence, project-design preparation, and Pathways facilitation.",
},
{
year: "2031",
stage: "Middle School launch",
ceiling: "Up to Grade 6",
experience: "Grade 6 begins Middle School rhythm: Passion Projects in small groups, Creative Hub, MUN, advisory, academic electives, and project mentorship as a coordinated function.",
ecosystem: "Cluster educators plus shared specialist ecosystem; project mentorship starts as a coordinated function and Pathways continue from Grade 5.",
},
{
year: "2032",
stage: "Middle School expansion",
ceiling: "Up to Grade 7",
experience: "Grade 7 PSAT mock begins. The offer adds more specialist exposure, stronger rubrics, pathway language, and external evidence routines.",
ecosystem: "Shared specialists continue across divisions with an incremental secondary academic layer.",
},
{
year: "2033",
stage: "Middle School maturity",
ceiling: "Up to Grade 8",
experience: "Grade 8 college readiness testing begins. The MS journey consolidates through program-led mentorship, exhibitions, and Babson EPIC culmination.",
ecosystem: "More mature specialist model, coordinated mentorship, Creative Hub continuity, and pathway preparation.",
},
{
year: "2034",
stage: "High School launch",
ceiling: "Up to Grade 9",
experience: "Grade 9 College Counseling and AP classes begin. High School launches with academic pathways, credential-facing evidence, and stronger university-facing documentation.",
ecosystem: "Shared specialist ecosystem remains active; secondary academic layer expands for HS launch needs.",
},
{
year: "2035",
stage: "High School continuity",
ceiling: "Up to Grade 10",
experience: "Grade 10 deepens pathway coherence, advanced elective choices, portfolio evidence, and interdisciplinary production.",
ecosystem: "HS educator core carries continuity while specialist mentorship becomes more visible.",
},
{
year: "2036",
stage: "Advanced specialization",
ceiling: "Up to Grade 11",
experience: "Grade 11 strengthens advanced academics, capstone preparation, internships, external mentors, and pathway evidence.",
ecosystem: "Additional specialist mentorship and coordination become more justified as external-facing work grows.",
},
{
year: "2037",
stage: "Full K-12 experience",
ceiling: "Up to Grade 12",
experience: "Grade 12 completes the learner journey through capstones, university-facing evidence, internships, and graduation pathways.",
ecosystem: "Full shared specialist ecosystem plus mature secondary academic layer.",
},
		  ];
const synthesisStatements = [
"The Rio launch model should not reproduce São Paulo's mature organizational design. It should protect the same learning promise through a compressed adult ecosystem: fixed classroom ownership, shared specialist capacity, early academic performance and language monitoring, curriculum coherence, wellbeing support, Learning Experience Design, and visible documentation of learning.",
"Grade 6 is the threshold where the model changes category. It activates Middle School clusters, electives, Passion Projects, advisory, project mentorship, and shared specialist infrastructure. It is not one more Lower School grade.",
"Project Design Journey is the schoolwide umbrella for experiential learning. In Early Years, it is expressed through Reggio-inspired Explorers inquiry. In Lower School, it is expressed through Researchers and phenomenon-based learning. Through Grade 5, projects remain full-class investigations guided by educators. In Grade 6, Passion Projects begin in small groups of 3–5, and project mentorship becomes a coordinated operating function.",
"Specialist capacity should not be treated as one generic FTE pool. Body & Movement, Sound Exploration / Music, Artistic Design / Atelier, and Design Technologies / Learning Experience Designer each carry different load patterns, space needs, age-band constraints, and links to the learning architecture. Performing Arts remains an embedded program layer initially absorbed by Sound Exploration / Music, not a separate pillar in the simulator.",
];
const baselineDivisionArchitecture = [
{
division: "Early Years",
tone: "border-emerald-100 bg-emerald-50",
composition: [
"Reference educator",
"Assistant",
"Monitor",
"Shared specialist access: Body & Movement, Sound Exploration, Artistic Design, Design Technologies",
],
minimum: [
"Care routines",
"Transitions",
"Family relationship",
"Learning documentation",
"Language acquisition observation",
"Age-appropriate specialist experiences",
"Pedagogical coordination",
],
inactive: [
"MAP does not begin in Early Years",
"Formal Pathways are not active",
"Creative Hub is not active",
"Middle School structures are not active",
],
activation: "Active in all scenarios because every scenario includes Early Years",
},
{
division: "Lower School",
tone: "border-blue-100 bg-blue-50",
composition: [
"Reference educator per section",
"Assistant",
"Supervision and transition routines",
"Shared specialist ecosystem",
],
minimum: [
"Literacy and numeracy progression",
"Project Design Journey routines",
"MAP Testing from Grade 1",
"Language acquisition monitoring",
"Academic performance cycles",
"Intervention and enrichment",
"Portfolio / evidence routines",
"Family-facing learning evidence",
"Specialist access",
],
inactive: [
"Pathways classes begin in Grade 5",
"Creative Hub begins only in Grade 6",
"MUN begins only in Grade 6",
"PSAT mock begins in Grade 7",
"College readiness testing begins in Grade 8",
"AP and College Counseling begin in Grade 9",
],
activation:
"Scenario A reaches Grade 3 with MAP and academic evidence; Scenario B adds Grade 4 Researchers progression; Scenario C activates Grade 5 Pathways",
},
{
division: "Middle School",
tone: "border-purple-100 bg-purple-50",
composition: [
"Cluster educators rather than reference educator model",
"Shared specialists",
"Advisory structure",
"Passion Project",
"Project mentorship function",
"Creative Hub from Grade 6",
"MUN from Grade 6",
"Academic elective from Grade 6",
"Pathways continue from Grade 5",
],
minimum: [
"Cluster model",
"Academic progression",
"Advisory",
"Project mentorship",
"Portfolio evidence",
"Specialist coordination",
"Language & Academic Performance monitoring",
"Curriculum and assessment coherence",
"Multiple learning spaces",
],
inactive: [
"Grade 7 PSAT mock is not active in Scenario D",
"Grade 8 college readiness testing is not active in Scenario D",
"AP and College Counseling are not active until Grade 9",
],
activation:
"Scenario D activates Grade 6 Middle School launch; Grade 7 adds PSAT mock; Grade 8 adds college readiness testing",
},
{
division: "High School, future stage",
tone: "border-slate-200 bg-slate-50",
composition: [
"Subject specialists",
"Pathways",
"AP classes from Grade 9",
"College Counseling from Grade 9",
"Capstone / portfolio / internship architecture",
"Specialist mentorship",
],
minimum: [
"College readiness",
"AP / advanced academic pathways",
"Credential-facing documentation",
"Portfolio evidence",
"Internship or external mentorship coordination",
"University-facing counseling",
"Graduation profile evidence",
],
inactive: [
"Not active in Scenarios A-D",
"Begins when Grade 9 opens",
"Full High School maturity arrives later in the 2028-2037 roadmap",
],
activation:
"Grade 9 launches High School; Grade 10 deepens pathways; Grade 11 strengthens specialization; Grade 12 completes the K-12 journey",
},
];
const baselineEnxovalPackages = [
{
title: "Early Years classroom enxoval",
items: [
"Reference educator",
"Assistant",
"Monitor",
"Learning documentation system",
"Family communication routines",
"Age-appropriate materials and atelier access",
"Body & Movement / Sound / Artistic Design access",
"Language acquisition observation routines",
],
},
{
title: "Lower School classroom enxoval",
items: [
"Reference educator per section",
"Assistant",
"Learning documentation and portfolio routines",
"MAP from Grade 1",
"Intervention/enrichment cycles",
"PDJ through Researchers inquiry",
"Specialist access",
"Family-facing evidence of learning",
"Language & Academic Performance monitoring",
],
},
{
title: "Grade 6 cluster enxoval",
note: "Grade 6 is no longer classroom-centered.",
items: [
"Cluster educators",
"Advisory routine",
"Passion Projects",
"Creative Hub access",
"MUN activation",
"Academic elective",
"Project Mentorship as a coordinated function",
"Shared specialists",
"Performance/language monitoring",
"Portfolio evidence",
"Multiple learning spaces",
],
},
];
const minimumAcademicOperations = [
{
system: "Classroom ownership",
why: "Every section needs an adult responsible for relationships, learning, routines, documentation, and family communication.",
type: "Non-negotiable baseline",
},
{
system: "Classroom package",
why: "Defines the adult structure inside the classroom: EY = reference educator + assistant + monitor; LS = reference educator + assistant.",
type: "Baseline adjusted by age band",
},
{
system: "Specialist access",
why: "Concept's experience depends on Body & Movement, Sound Exploration / Music, Artistic Design / Atelier, and Design Technologies / Learning Experience Designer. Design Technologies represents the Learning Experience Designer's classroom-facing capacity, not a separate specialist role authorization.",
type: "Shared specialist ecosystem",
},
{
system: "Academic performance and language acquisition",
why: "MAP from Grade 1, the bilingual model, Science of Reading alignment, language monitoring, intervention, enrichment, and family-facing evidence work together to make academic progress visible.",
type: "Recommended from launch; increasingly important as complexity grows",
guardrail: "Do not present Language & Academic Performance Coach as a late-stage add-on.",
},
{
system: "Curriculum and assessment coherence",
why: "Connects teacher-as-researcher practice, shared curriculum, assessment, documentation, and evidence routines so educators do not invent the academic experience independently.",
type: "Shared/recommended in early scenarios; stronger by Grade 4/5",
},
{
system: "Documentation and portfolio",
why: "Makes thinking visible, supports teacher interpretation and learner metacognition, creates family-facing evidence, and shows progression across divisions.",
type: "Baseline from launch, matures over time",
},
{
system: "Signature program routines",
why: "Project Design Journey is the schoolwide umbrella for experiential learning. In Early Years, it is expressed through Reggio-inspired Explorers inquiry. In Lower School, it becomes more explicit through Researchers and phenomenon-based learning. Through Grade 5, projects remain full-class investigations guided by educators. Passion Projects begin in Grade 6.",
type: "Scenario-dependent activation",
},
{
system: "Divisional leadership and coaching",
why: "Ensures onboarding, consistency, fidelity, and quality control.",
type: "Baseline/recommended infrastructure",
},
];
const decisionPanelItems = [
{
scenario: "Scenario A",
decision: "Establish basic offer",
signal: "MAP + early evidence",
budget: "Baseline includes Learning Experience Design; LAP Coach recommended",
tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
},
{
scenario: "Scenario B",
decision: "Deepen Researchers engine",
signal: "Grade 4 academic progression",
budget: "C&A support likely",
tone: "border-blue-200 bg-blue-50 text-blue-800",
},
{
scenario: "Scenario C",
decision: "Activate Pathways",
signal: "Grade 5 Pathways active",
budget: "Shared pathway coordination",
tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
},
{
scenario: "Scenario D",
decision: "Launch Middle School model",
signal: "Creative Hub, MUN, clusters, advisory",
budget: "Signature/MS add-ons",
tone: "border-purple-200 bg-purple-50 text-purple-800",
},
];
const minimumAcademicOperationGroups = [
{
label: "Student-facing baseline",
title: "Linha de base vivida pelo estudante",
description: "O que estudantes e famílias experimentam diretamente desde o primeiro dia.",
systems: ["Classroom ownership", "Classroom package", "Specialist access"],
tone: "border-emerald-100 bg-emerald-50",
},
{
label: "Academic intelligence layer",
title: "Camada de inteligência acadêmica",
description: "Evidência, avaliação e língua como sistemas que tornam a aprendizagem visível.",
systems: [
"Academic performance and language acquisition",
"Curriculum and assessment coherence",
"Documentation and portfolio",
],
tone: "border-indigo-100 bg-indigo-50",
},
{
label: "Quality control layer",
title: "Camada de controle de qualidade",
description: "Rotinas e liderança que mantêm o modelo coerente durante o crescimento.",
systems: ["Signature program routines", "Divisional leadership and coaching"],
tone: "border-slate-200 bg-slate-50",
},
];
const budgetImpactDecisions = [
{
decision: "Language & Academic Performance Coach",
trigger: "Scenario A",
status: "Recommended from launch",
requiredDecision: "Validar escopo e alocação do coach.",
budgetSlot: "R$ ________",
},
{
decision: "Curriculum & Assessment Designer",
trigger: "Scenario B/C",
status: "Shared/recommended",
requiredDecision: "Definir suporte compartilhado ou dedicado.",
budgetSlot: "R$ ________",
},
{
decision: "Pathways / Signature Programs coordination",
trigger: "Scenario C",
status: "Possible add-on",
requiredDecision: "Definir coordenação parcial/compartilhada.",
budgetSlot: "R$ ________",
},
{
decision: "Signature Programs / Project Design Lead",
trigger: "Scenario D",
status: "Governance placeholder",
requiredDecision: "Validar escopo de liderança de programas autorais/MS.",
budgetSlot: "R$ ________",
},
{
decision: "Additional specialist capacity",
trigger: "Scenario D",
status: "Add-on",
requiredDecision: "Validar carga, espaços e Creative Hub.",
budgetSlot: "R$ ________",
},
{
decision: "Additional cluster educator capacity",
trigger: "Scenario D",
status: "Conditional add-on",
requiredDecision: "Validar somente se carga exceder premissa.",
budgetSlot: "R$ ________",
},
];
const budgetComparisonColumns = [
"Area",
"Original basis",
"Current recommendation",
"Increment rule",
"Validation needed",
];
const scenarioBudgetComparisonColumns = [
"Status",
"Area",
"Original basis",
"Current recommendation",
"Increment rule",
"Why it matters / validation",
];
const sharedBudgetRows: BudgetComparisonRow[] = [
{
area: "Classroom package",
status: "Baseline control",
originallyBudgeted: "EY and LS classroom package.",
currentRecommendation: "EY = reference educator + assistant + monitor. LS = reference educator + assistant.",
incrementalBudgetImpact: "No increment unless quantity, FTE, salary band, or coverage changes.",
whyNecessary: "Validate only if quantity, FTE, salary band, or coverage changes.",
},
{
area: "Leadership",
status: "Baseline control",
originallyBudgeted: "Division Principal / division leadership basis.",
currentRecommendation: "Keep as baseline.",
incrementalBudgetImpact: "No increment unless scope or FTE changes.",
whyNecessary: "Confirm title and scope mapping against the salary basis.",
},
{
area: "Learning Experience Design",
status: "Baseline control",
originallyBudgeted: "Learning Experience Designer.",
currentRecommendation: "Keep as baseline.",
incrementalBudgetImpact: "No increment unless scope or FTE changes.",
whyNecessary: "Validate only if scope, FTE, salary band, or coverage changes.",
},
{
area: "After School role mapping",
status: "Mapping validation",
originallyBudgeted: "After School Educator, HC 1 from 2028. Coordinator scope not confirmed.",
currentRecommendation: "Add or validate After School Coordinator scope.",
incrementalBudgetImpact: "No increment only if existing After School Educator covers coordinator scope. Otherwise, keep coordinator scope as a source-validation item.",
whyNecessary: "Confirm whether coordinator scope is baseline, a scope upgrade, or a reclassification.",
},
{
area: "Specialist baseline",
status: "Baseline control",
originallyBudgeted: "1 Body & Movement, 1 Arts, 1 Music.",
currentRecommendation: "Keep as the original specialist baseline.",
incrementalBudgetImpact: "Only capacity beyond 1 + 1 + 1 is a potential increment.",
whyNecessary: "Validate scenario-specific specialist deltas separately by load, schedule, space, and program ambition.",
},
];
const scenarioBudgetComparisons: ScenarioBudgetComparison[] = [
{
scenario: "Scenario A",
gradeCeiling: "Up to Grade 3",
strategicFrame: "Minimum credible launch path",
rows: [
{
area: "Specialist expansion beyond baseline",
status: "Not active",
originallyBudgeted: "1 Body & Movement, 1 Arts, 1 Music already covered in Baseline / Governance Controls.",
currentRecommendation: "No specialist expansion beyond the original 1 + 1 + 1 baseline for Scenario A.",
incrementalBudgetImpact: "No increment unless timetable validation shows coverage, age-band, setup, or program complexity exceeds baseline capacity.",
whyNecessary: "Keeps Scenario A as the basic offer path while preserving the need to validate specialist load as usage deepens.",
},
{
area: "Language Acquisition Coach / academic-language support",
status: "Potential increment",
originallyBudgeted: "Not found in role-basis mapping; keep as source-validation item.",
currentRecommendation: "LAP Coach / academic-language support recommended for validation.",
incrementalBudgetImpact: "Scenario implication only unless a separate implementation process validates scope and cost.",
whyNecessary: "Supports MAP, bilingual monitoring, intervention, enrichment, and family-facing evidence.",
},
{
area: "Scenario-specific programs",
status: "Not active",
originallyBudgeted: "Not active.",
currentRecommendation: "No Pathways, Creative Hub, MUN, Passion Projects, MS advisory, or academic electives.",
incrementalBudgetImpact: "No increment.",
whyNecessary: "Keeps Scenario A focused on the basic offer without funding later program layers.",
},
],
},
{
scenario: "Scenario B",
gradeCeiling: "Up to Grade 4",
strategicFrame: "Researchers progression + Concept identity",
rows: [
{
area: "Specialist load pressure",
status: "Potential increment",
originallyBudgeted: "Shared specialist baseline covers 1 Body & Movement, 1 Arts, 1 Music.",
currentRecommendation: "Validate load as Lower School usage deepens.",
incrementalBudgetImpact: "Only the delta beyond the original 1 + 1 + 1 specialist baseline.",
whyNecessary: "Keeps specialist coverage viable as Grade 4 adds inquiry, documentation, evidence-making, and program load.",
},
{
area: "Language Acquisition Coach / academic-language support",
status: "Potential increment",
originallyBudgeted: "Not found in role-basis mapping; keep as source-validation item.",
currentRecommendation: "LAP Coach / academic-language support recommended for validation.",
incrementalBudgetImpact: "Scenario implication only unless a separate implementation process validates scope and cost.",
whyNecessary: "Supports stronger MAP cycles, intervention routines, and academic evidence.",
},
{
area: "Researchers progression",
status: "Scenario driver",
originallyBudgeted: "No Passion Projects or Middle School program layer.",
currentRecommendation: "Strengthen phenomenon-based learning, documentation, evidence-making, Math reasoning, Scientific Literacy, academic language, and research routines.",
incrementalBudgetImpact: "Only if added role allocation, specialist capacity, or external cost is required.",
whyNecessary: "Uses Grade 4 to make academic inquiry and evidence routines visible before Grade 5 Pathways and Grade 6 Middle School.",
},
],
},
{
scenario: "Scenario C",
gradeCeiling: "Up to Grade 5",
strategicFrame: "Lower School completion + Pathways activation",
rows: [
{
area: "Specialist / Design Technologies load",
status: "Potential increment",
originallyBudgeted: "Shared specialist baseline covers 1 Body & Movement, 1 Arts, 1 Music.",
currentRecommendation: "Validate specialist and Design Technologies load for Pathways readiness.",
incrementalBudgetImpact: "Only the delta beyond the original 1 + 1 + 1 specialist baseline.",
whyNecessary: "Prevents Pathways and transition readiness from overloading the shared specialist model.",
},
{
area: "Language Acquisition Coach / academic-language support",
status: "Potential increment",
originallyBudgeted: "Not found in role-basis mapping; keep as source-validation item.",
currentRecommendation: "LAP Coach / academic-language support recommended for validation.",
incrementalBudgetImpact: "Scenario implication only unless a separate implementation process validates scope and cost.",
whyNecessary: "Supports Grade 5 monitoring, intervention, enrichment, and transition evidence.",
},
{
area: "Grade 5 Pathways and transition protocols",
status: "Scenario driver",
originallyBudgeted: "Grade 5 Pathways coordination not confirmed in role-basis mapping.",
currentRecommendation: "Activate Grade 5 Pathways, transition protocols, portfolio evidence, and readiness routines.",
incrementalBudgetImpact: "Only if Pathways requires added FTE, role allocation, specialist capacity, or external cost.",
whyNecessary: "Completes Lower School and builds the Middle School bridge.",
},
{
area: "Full-class PDJ",
status: "Scenario driver",
originallyBudgeted: "PDJ is part of the schoolwide learning model.",
currentRecommendation: "Keep Grade 5 projects as full-class experiential projects through the Researchers engine.",
incrementalBudgetImpact: "No automatic increment unless delivery requires added role allocation, specialist capacity, or external cost.",
whyNecessary: "Preserves the Scenario C boundary without implying Passion Projects are active.",
},
{
area: "Passion Projects",
status: "Not active",
originallyBudgeted: "Not active before Grade 6.",
currentRecommendation: "Do not activate Passion Projects or Project Mentorship in Scenario C.",
incrementalBudgetImpact: "No increment.",
whyNecessary: "Builds the Middle School bridge without implying Passion Projects or Project Mentorship are active.",
},
],
},
{
scenario: "Scenario D",
gradeCeiling: "Up to Grade 6",
strategicFrame: "Middle School launch + program activation",
rows: [
{
area: "Creative Hub / Design Technologies / shared Middle School capacity",
status: "Potential increment",
originallyBudgeted: "Shared specialist baseline covers 1 Body & Movement, 1 Arts, 1 Music; Creative Hub and MS capacity not confirmed as covered.",
currentRecommendation: "Validate expanded specialist, Creative Hub, Design Technologies, and shared MS capacity.",
incrementalBudgetImpact: "Only the delta beyond the original 1 + 1 + 1 specialist baseline.",
whyNecessary: "Grade 6 adds a Middle School rhythm, spaces, schedules, and program layers.",
},
{
area: "Language Acquisition Coach / academic-language support",
status: "Potential increment",
originallyBudgeted: "Not found in role-basis mapping; keep as source-validation item.",
currentRecommendation: "LAP Coach / academic-language support indicated for validation.",
incrementalBudgetImpact: "Scenario implication only unless a separate implementation process validates scope and cost.",
whyNecessary: "Supports bilingual monitoring, intervention, enrichment, and MS-facing academic evidence.",
},
{
area: "Project Mentorship / Passion Projects",
status: "Scenario driver",
originallyBudgeted: "Not active before Grade 6. No dedicated Project Mentor role authorization currently modeled.",
currentRecommendation: "Activate Project Mentorship as a coordinated function for Grade 6 Passion Projects. First allocate to cluster educators if timetable capacity allows.",
incrementalBudgetImpact: "No automatic increment for the function itself.",
whyNecessary: "Passion Projects require adult mentorship for learner agency, feedback cycles, documentation, critique, and public presentation quality.",
},
{
area: "Cluster educator capacity validation",
status: "Mapping validation",
originallyBudgeted: "Grade 6 / Grade 7 cluster educator capacity exists in the model, but unused mentorship capacity is not calculated.",
currentRecommendation: "Validate timetable capacity after teaching, advisory, Passion Projects, Creative Hub, MUN, electives, documentation, critique, and planning.",
incrementalBudgetImpact: "No increment if mentorship can be absorbed by cluster educators.",
whyNecessary: "Prevents Project Mentorship from being treated as a dedicated role authorization before load is validated.",
},
{
area: "Dedicated Project Mentor",
status: "Conditional increment",
originallyBudgeted: "No dedicated Project Mentor role authorization currently modeled.",
currentRecommendation: "Flag dedicated or partial project-mentorship support only if validated mentorship load exceeds available cluster educator capacity.",
incrementalBudgetImpact: "Conditional resource implication only; no staffing or payroll authorization in this view.",
whyNecessary: "Keeps Scenario D neutral while preserving the staffing trigger for Passion Project fidelity.",
},
],
},
];
const budgetComparisonValidationNotes = [
"Use repo salary basis where roles already exist; do not create new salary values inside this view.",
"If a role mapping is ambiguous, keep it as a source-validation item before any staffing or cost interpretation.",
"Confirm whether After School Educator and After School Coordinator are the same role; if not, classify the coordinator as a new role, scope upgrade, or reclassification.",
"Keep missing increments as governance placeholders until a separate implementation process validates scope and cost.",
];
const budgetStatusClassName: Record<BudgetRowStatus, string> = {
"Baseline control": "bg-emerald-50 text-emerald-700 border-emerald-100",
"Mapping validation": "bg-amber-50 text-amber-700 border-amber-100",
"Scenario driver": "bg-blue-50 text-[#214B74] border-blue-100",
"Potential increment": "bg-purple-50 text-[#4b254b] border-purple-100",
"Conditional increment": "bg-rose-50 text-rose-700 border-rose-100",
"Governance placeholder": "bg-indigo-50 text-indigo-700 border-indigo-100",
"Not active": "bg-slate-50 text-slate-500 border-slate-200",
};
const governanceQuestions = [
"Which scenario becomes the business-plan baseline?",
"Which adult ecosystem roles are confirmed as baseline?",
"Which roles remain add-on budget slots?",
"Is Scenario D being read as a Middle School operating launch scenario, or only as a future pathway?",
];
const roadmapPrintPhases = [
{
period: "2028-2030",
title: "Foundation and readiness",
summary: "MAP begins in Grade 1, Lower School progression becomes visible, and Grade 5 Pathways classes begin.",
},
{
period: "2031-2033",
title: "Middle School identity",
summary: "Grade 6 launches Creative Hub and MUN, Grade 7 begins PSAT mock, and Grade 8 begins college readiness testing.",
},
{
period: "2034-2037",
title: "High School pathway maturity",
summary: "Grade 9 begins College Counseling and AP classes, then expands credentials, internships, capstones, and university-facing evidence.",
},
];
const printExperienceGrowthRoadmap = [
{
year: "2028",
stage: "Foundational launch",
ceiling: "EY + Grades 1-3",
experience: "MAP begins in Grade 1; learning evidence and PDJ routines become visible.",
ecosystem: "EY classroom package, LS classroom package, LAP Coach, coaching, shared specialists.",
},
{
year: "2029",
stage: "Lower School progression",
ceiling: "Up to Grade 4",
experience: "MAP cycles, intervention, enrichment, and early portfolio habits mature.",
ecosystem: "C&A, language acquisition, and academic performance support gain weight.",
},
{
year: "2030",
stage: "Pathways activation",
ceiling: "Up to Grade 5",
experience: "Grade 5 Pathways begin; agency, portfolio, and project protocols sharpen.",
ecosystem: "Full LS continuity, Pathways facilitation, project-design preparation.",
},
{
year: "2031",
stage: "Middle School launch",
ceiling: "Up to Grade 6",
experience: "Creative Hub, MUN, clusters, advisory, elective, and Passion Project activate.",
ecosystem: "Cluster educators, project mentorship, shared specialist ecosystem.",
},
{
year: "2032",
stage: "Middle School expansion",
ceiling: "Up to Grade 7",
experience: "PSAT mock begins; specialist exposure and external evidence routines expand.",
ecosystem: "Shared specialists plus incremental secondary academic layer.",
},
{
year: "2033",
stage: "Middle School maturity",
ceiling: "Up to Grade 8",
experience: "College readiness testing, exhibitions, mentorship, and Babson EPIC consolidate.",
ecosystem: "Mature specialist model, coordinated mentorship, Creative Hub continuity.",
},
{
year: "2034",
stage: "High School launch",
ceiling: "Up to Grade 9",
experience: "College Counseling and AP classes begin with credential-facing evidence.",
ecosystem: "Secondary academic layer expands while shared specialists remain active.",
},
{
year: "2035",
stage: "High School continuity",
ceiling: "Up to Grade 10",
experience: "Pathways, advanced electives, portfolio evidence, and production deepen.",
ecosystem: "HS educator core gains continuity; specialist mentorship becomes visible.",
},
{
year: "2036",
stage: "Advanced specialization",
ceiling: "Up to Grade 11",
experience: "Advanced academics, capstone preparation, internships, and mentors grow.",
ecosystem: "External-facing work justifies added mentorship and coordination.",
},
{
year: "2037",
stage: "Full K-12 experience",
ceiling: "Up to Grade 12",
experience: "Capstones, university-facing evidence, internships, and graduation pathways complete.",
ecosystem: "Full shared specialist ecosystem plus mature secondary academic layer.",
},
];
const ecosystemScenarioLadder = [
{
id: "A",
title: "Scenario A",
identity: "Foundation + early academic evidence",
delta: "Launch baseline + MAP from Grade 1",
tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
},
{
id: "B",
title: "Scenario B",
identity: "Researchers progression + Concept identity",
delta: "Researchers engine becomes academically visible before Middle School",
tone: "border-blue-200 bg-blue-50 text-blue-800",
},
{
id: "C",
title: "Scenario C",
identity: "Lower School completion + Pathways activation",
delta: "Grade 5 Pathways become active",
tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
},
{
id: "D",
title: "Scenario D",
identity: "Middle School launch + global/program activation",
delta: "Creative Hub, MUN, clusters, advisory, Passion Project activate",
tone: "border-purple-200 bg-purple-50 text-purple-800",
},
		  ];
const ecosystemLayerControls = [
{ id: "all", label: "Todos" },
{ id: "classroom", label: "Sala de aula" },
{ id: "academic-language", label: "Performance acadêmica & aquisição de língua" },
{ id: "specialists", label: "Especialistas" },
{ id: "signature", label: "Programas autorais" },
{ id: "ms-hs", label: "MS/HS readiness" },
{ id: "budget", label: "Add-ons orçamentários" },
		  ];
const ecosystemLayerPrintSummaries: Record<string, string> = {
classroom: "A estrutura de sala permanece como baseline; o avanço dos cenários muda a intensidade de documentação, transição e cluster.",
"academic-language": "MAP, aquisição de língua e performance acadêmica começam cedo e deixam de ser opcionais conforme a complexidade cresce.",
specialists: "Especialistas funcionam como ecossistema compartilhado; o risco é subcontar carga, espaço e conexão com programas autorais.",
signature: "Programas autorais amadurecem por limiares: PDJ como framework de sala EY–Grade 5, Pathways em Grade 5, Passion Projects e Creative Hub apenas em Grade 6.",
"ms-hs": "A prontidão secundária evolui de cultura e ponte formal para lançamento real de Middle School em Grade 6.",
budget: "Add-ons permanecem placeholders de governança; nenhum valor é integrado a cálculo de custo nesta leitura.",
};
const ecosystemDecisionLayers = {
classroom: {
title: "Sala de aula",
rows: [
{
scenario: "Scenario A",
status: "Estrutura básica",
commitment: "Baseline classroom promise from the architecture above.",
adult: "Founding package must hold consistently.",
budget: "Baseline.",
},
{
scenario: "Scenario B",
status: "Estrutura básica fortalecida",
commitment: "Grade 4 deepens Concept learning identity.",
adult: "More intentional documentation and reflection routines.",
budget: "Possible additional support for documentation load.",
},
{
scenario: "Scenario C",
status: "Preparação ativa",
commitment: "Grade 5 transition routines and Pathways readiness.",
adult: "More formal protocols and portfolio routines.",
budget: "Possible shared pathways/project coordination.",
},
{
scenario: "Scenario D",
status: "Mudança de modelo",
commitment: "EY/LS classroom model remains; Grade 6 shifts to clusters.",
adult: "Cluster educator structure begins.",
budget: "Possible additional cluster educator if load exceeds launch premise.",
},
],
},
"academic-language": {
title: "Performance acadêmica & aquisição de língua",
guardrail:
"See baseline minimum operations: this layer starts early and matures as complexity grows.",
rows: [
{
scenario: "Scenario A",
status: "Investimento recomendado",
commitment: "Early evidence starts because Grade 1 is active.",
adult: "Language & Academic Performance Coach recommended for validation.",
budget: "Recommended from launch, not late add-on.",
},
{
scenario: "Scenario B",
status: "Investimento recomendado",
commitment: "Performance visibility becomes more important.",
adult: "Strengthen C&A and intervention routines.",
budget: "Shared Curriculum & Assessment support may be needed.",
},
{
scenario: "Scenario C",
status: "Necessário para transição",
commitment: "Academic monitoring supports Grade 5 Pathways.",
adult: "Language & Academic Performance Coach recommended for validation.",
budget: "Stronger intervention and enrichment cycles.",
},
{
scenario: "Scenario D",
status: "Necessário",
commitment: "Evidence supports the first MS operating rhythm.",
adult: "LAP Coach indicated for validation to sustain MS complexity.",
budget: "Academic infrastructure signal, not implementation approval.",
},
],
},
specialists: {
title: "Especialistas",
rows: [
{
scenario: "Scenario A",
status: "Capacidade compartilhada",
commitment: "Shared specialists support the baseline.",
adult: "Lean shared ecosystem.",
budget: "Baseline specialist planning.",
},
{
scenario: "Scenario B",
status: "Capacidade compartilhada fortalecida",
commitment: "Broader Lower School specialist usage.",
adult: "Specialist planning becomes more intentional.",
budget: "Possible second music educator / expanded arts coverage.",
},
{
scenario: "Scenario C",
status: "Continuidade LS completa",
commitment: "Specialists support Pathways and transition readiness.",
adult: "Specialist coordination increases.",
budget: "Possible expanded Design Technologies capacity.",
},
{
scenario: "Scenario D",
status: "Capacidade compartilhada EY/LS/MS",
commitment: "Specialists now support EY/LS/MS.",
adult: "Shared ecosystem + incremental secondary academic layer. Avoid double-counting.",
budget: "Possible 3rd Body & Movement educator, Creative Hub support, expanded Design Tech.",
},
],
},
signature: {
title: "Programas autorais",
guardrail:
"Signature programs do not begin only in Scenario D. Grade 5 Pathways are active in Scenario C; Creative Hub and MUN begin only in Grade 6.",
rows: [
{
scenario: "Scenario A",
status: "Estrutura básica",
commitment: "PDJ operates through full-class experiential projects embedded in classroom routines; Learning Experience Design supports project quality and documentation.",
adult: "Learning Experience Design function indicated; no dedicated Project Mentor.",
budget: "Baseline includes Learning Experience Design; no dedicated Project Mentor authorization.",
},
{
scenario: "Scenario B",
status: "Progressão acadêmica",
commitment: "Full-class PDJ continues; inquiry, evidence-making, Math reasoning, Scientific Literacy, documentation, and academic language deepen through Grade 4; Learning Experience Design becomes more intentional.",
adult: "Use Grade 4 to strengthen the Researchers engine before MS; Learning Experience Design gains importance; Project Mentorship is not active yet.",
budget: "No dedicated Signature Programs Lead yet.",
},
{
scenario: "Scenario C",
status: "Ativo",
commitment: "Grade 5 Pathways classes are active; PDJ remains full-class; Learning Experience Design and pathway coordination strengthen.",
adult: "Learning Experience Design coordination is important; Project Mentorship begins with the Grade 6 Passion Project model.",
budget: "Possible shared Signature/Pathways coordination.",
},
{
scenario: "Scenario D",
status: "Ativo + add-on potencial",
commitment: "Grade 6 signature-program layer activates.",
adult: "Signature Programs / Project Design Lead recommended.",
budget: "Placeholder de recurso para validação: R$ ________",
budgetPlaceholder: true,
},
],
},
"ms-hs": {
title: "MS/HS readiness",
rows: [
{
scenario: "Scenario A",
status: "Não ativo",
commitment: "Build foundations only.",
adult: "No MS structure.",
budget: "None.",
},
{
scenario: "Scenario B",
status: "Preparação cultural",
commitment: "Researchers progression before Middle School.",
adult: "Stronger reflection, documentation, agency routines.",
budget: "Low/moderate support and coaching.",
},
{
scenario: "Scenario C",
status: "Ponte formal",
commitment: "Grade 5 Pathways and transition readiness.",
adult: "Prepare for Grade 6 clusters, Creative Hub, MUN.",
budget: "Possible shared pathways coordination.",
},
{
scenario: "Scenario D",
status: "Ativo",
commitment: "Grade 6 MS launch, Creative Hub, MUN, clusters, advisory.",
adult: "Cluster model, project mentorship, shared specialists.",
budget: "Possible incremental MS infrastructure.",
},
],
},
budget: {
title: "Add-ons orçamentários",
guardrail:
"Resource add-ons remain governance placeholders only. This view does not connect any assumption to cost calculation.",
rows: [
{
scenario: "Scenario A",
status: "Add-on potencial",
commitment: "Learning Experience Design is baseline; LAP Coach recommended from launch.",
adult: "Validate incremental coaching, documentation support beyond baseline, and academic performance scope.",
budget: "Placeholder de recurso para validação: R$ ________",
budgetPlaceholder: true,
},
{
scenario: "Scenario B",
status: "Add-on potencial",
commitment: "Shared C&A Designer; expanded performance routines; documentation / portfolio culture support.",
adult: "Validate shared curriculum, assessment, intervention, and evidence routines.",
budget: "Placeholder de recurso para validação: R$ ________",
budgetPlaceholder: true,
},
{
scenario: "Scenario C",
status: "Add-on potencial",
commitment: "Shared Pathways / Signature Programs coordination; expanded Design Technologies; transition readiness support.",
adult: "Validate Pathways coordination, project support, and Design Technologies load.",
budget: "Placeholder de recurso para validação: R$ ________",
budgetPlaceholder: true,
},
{
scenario: "Scenario D",
status: "Add-on potencial",
commitment: "Signature Programs / Project Design Lead; mentorship coordination; Creative Hub support; additional specialist or cluster capacity.",
adult: "Validate MS launch structure, project mentorship, Creative Hub, specialists, and cluster load.",
budget: "Placeholder de recurso para validação: R$ ________",
budgetPlaceholder: true,
},
],
},
		  };

export default function OfferScenariosTab() {
  const [selectedEcosystemLayer, setSelectedEcosystemLayer] = useState("all");
  const [activeView, setActiveView] = useState<OfferScenarioView>("brief");
  const [selectedScenarioTitle, setSelectedScenarioTitle] = useState<string>(
    pedagogicalOfferScenarios[0]?.title ?? "",
  );
  const [specialistFinalGrade, setSpecialistFinalGrade] = useState<SpecialistFinalGrade>("Grade 3");
  const [specialistSectionsPerGrade, setSpecialistSectionsPerGrade] = useState<SpecialistSectionsPerGrade>(1);
  const [specialistBlocksPerGrade, setSpecialistBlocksPerGrade] = useState<SpecialistBlocksPerGrade>(2);
  const [specialistBlockDuration, setSpecialistBlockDuration] = useState<SpecialistBlockDuration>(45);
  const [specialistCapacityThreshold, setSpecialistCapacityThreshold] = useState<SpecialistCapacityThreshold>(26);

  const selectedScenario = selectedScenarioTitle
    ? (pedagogicalOfferScenarios.find((scenario) => scenario.title === selectedScenarioTitle) ?? pedagogicalOfferScenarios[0])
    : pedagogicalOfferScenarios[0];

  if (!selectedScenario) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
        Cenários da Oferta data is unavailable. Confirm the offer scenario source before using this tab.
      </div>
    );
  }

  const specialistGradeLevelCount = specialistPillarGradeSequence.indexOf(specialistFinalGrade) + 1;
  const specialistBlocksPerPillar =
    specialistGradeLevelCount * specialistSectionsPerGrade * specialistBlocksPerGrade;
  const specialistHoursPerPillar = (specialistBlocksPerPillar * specialistBlockDuration) / 60;
  const specialistRecommendedFTEPerPillar = Math.ceil(specialistBlocksPerPillar / specialistCapacityThreshold);
  const specialistCapacityEquivalentAcrossFourPillars = specialistRecommendedFTEPerPillar * 4;
  const specialistCapacityStatus =
    specialistBlocksPerPillar <= 20
      ? "Sustainable"
      : specialistBlocksPerPillar <= specialistCapacityThreshold
        ? "High but manageable"
        : specialistBlocksPerPillar <= 30
          ? "Pressure point"
          : "Requires second specialist";
  const specialistHoursDisplay = Number.isInteger(specialistHoursPerPillar)
    ? `${specialistHoursPerPillar} h`
    : `${specialistHoursPerPillar.toFixed(1)} h`;

  const viewClassName = (view: OfferScenarioView) =>
    cn("offer-scenarios-view-section", activeView !== view && "offer-scenarios-screen-inactive");

  const handlePrintOfferScenarios = () => {
    const printClass = "printing-offer-scenarios";
    const cleanup = () => {
      document.body.classList.remove(printClass);
      window.removeEventListener("afterprint", cleanup);
    };

    document.body.classList.add(printClass);
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 500);
  };

			  const selectedDecisionLayer =
		    ecosystemDecisionLayers[selectedEcosystemLayer as keyof typeof ecosystemDecisionLayers];

		  const ecosystemStatusClasses: Record<string, string> = {
		    "Estrutura básica": "border-emerald-200 bg-emerald-50 text-emerald-800",
		    "Estrutura básica fortalecida": "border-emerald-200 bg-emerald-50 text-emerald-800",
		    "Capacidade compartilhada": "border-blue-200 bg-blue-50 text-blue-800",
		    "Capacidade compartilhada fortalecida": "border-blue-200 bg-blue-50 text-blue-800",
		    "Capacidade compartilhada EY/LS/MS": "border-blue-200 bg-blue-50 text-blue-800",
		    "Investimento recomendado": "border-indigo-200 bg-indigo-50 text-indigo-800",
		    "Necessário para transição": "border-indigo-200 bg-indigo-50 text-indigo-800",
		    "Necessário": "border-indigo-200 bg-indigo-50 text-indigo-800",
		    "Preparação": "border-amber-200 bg-amber-50 text-amber-800",
		    "Preparação ativa": "border-amber-200 bg-amber-50 text-amber-800",
		    "Preparação cultural": "border-amber-200 bg-amber-50 text-amber-800",
		    "Ponte formal": "border-amber-200 bg-amber-50 text-amber-800",
		    "Continuidade LS completa": "border-indigo-200 bg-indigo-50 text-indigo-800",
		    "Formação de identidade": "border-blue-200 bg-blue-50 text-blue-800",
		    "Ativo": "border-purple-200 bg-purple-50 text-purple-800",
		    "Ativo + add-on potencial": "border-purple-300 bg-purple-50 text-purple-800",
		    "Add-on potencial": "border-purple-300 bg-purple-50 text-purple-800",
		    "Mudança de modelo": "border-purple-300 bg-purple-50 text-purple-800",
		    "Não ativo": "border-slate-200 bg-slate-50 text-slate-500",
		  };


  return (
    <>
      <style>
        {`
          .offer-scenarios-print-only {
            display: none;
          }

          .offer-scenarios-screen-inactive {
            position: absolute !important;
            left: -99999px !important;
            top: auto !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
          }

          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body.printing-offer-scenarios {
              background: #ffffff !important;
            }

            body.printing-offer-scenarios * {
              visibility: hidden !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root,
            body.printing-offer-scenarios .offer-scenarios-print-root * {
              visibility: visible !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root {
              position: absolute !important;
              inset: 0 auto auto 0 !important;
              width: 100% !important;
              max-width: none !important;
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 0 !important;
              box-shadow: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-hidden,
            body.printing-offer-scenarios .offer-scenarios-print-root button {
              display: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-only {
              display: block !important;
            }

            body.printing-offer-scenarios .offer-scenarios-screen-inactive {
              position: static !important;
              left: auto !important;
              top: auto !important;
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-cover {
              display: flex !important;
              min-height: 250mm !important;
              break-after: page !important;
              page-break-after: always !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-grid {
              display: grid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root .rounded-2xl,
            body.printing-offer-scenarios .offer-scenarios-print-root .rounded-3xl,
            body.printing-offer-scenarios .offer-scenarios-print-root .rounded-\\[2rem\\] {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              box-shadow: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root .overflow-x-auto {
              overflow: visible !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root table {
              width: 100% !important;
              min-width: 0 !important;
              table-layout: auto !important;
              font-size: 8px !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root th,
            body.printing-offer-scenarios .offer-scenarios-print-root td {
              padding: 4px 5px !important;
              white-space: normal !important;
              word-break: normal !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-root h2,
            body.printing-offer-scenarios .offer-scenarios-print-root h3,
            body.printing-offer-scenarios .offer-scenarios-print-root h4 {
              break-after: avoid !important;
              page-break-after: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-page-break {
              break-before: page !important;
              page-break-before: always !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-avoid-break {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline {
              break-inside: auto !important;
              page-break-inside: auto !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline .grid {
              gap: 6px !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline .rounded-2xl,
            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline .rounded-xl {
              border-radius: 10px !important;
              padding: 8px !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline h4 {
              font-size: 11px !important;
              line-height: 1.25 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline ul {
              margin-top: 4px !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline li,
            body.printing-offer-scenarios .offer-scenarios-print-compact-baseline p {
              font-size: 8.5px !important;
              line-height: 1.25 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-scenario-card {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-roadmap-table tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-scenario-screen-detail {
              display: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-scenario-print-summary {
              display: block !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-legacy-hidden {
              display: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier {
              display: block !important;
              color: #172033 !important;
              font-weight: 340 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-page {
              background: #f5f0e7 !important;
              border-radius: 22px !important;
              padding: 17px !important;
              margin-bottom: 9mm !important;
              break-inside: auto !important;
              page-break-inside: auto !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-soft-panel {
              background: #fbfaf7 !important;
              border-radius: 18px !important;
              border: 0 !important;
              box-shadow: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-layer-strip {
              border-top: 1px solid rgba(33, 75, 116, 0.12) !important;
              padding-top: 12px !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-blue-panel {
              background: #16334f !important;
              color: #ffffff !important;
              border-radius: 20px !important;
              border: 0 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier h1,
            body.printing-offer-scenarios .offer-scenarios-print-dossier h2,
            body.printing-offer-scenarios .offer-scenarios-print-dossier h3,
            body.printing-offer-scenarios .offer-scenarios-print-dossier h4 {
              font-weight: 540 !important;
              letter-spacing: -0.018em !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier p,
            body.printing-offer-scenarios .offer-scenarios-print-dossier li,
            body.printing-offer-scenarios .offer-scenarios-print-dossier td {
              font-weight: 380 !important;
              line-height: 1.4 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-label {
              letter-spacing: 0.02em !important;
              text-transform: none !important;
              font-weight: 480 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier table {
              font-size: 9px !important;
              border-collapse: separate !important;
              border-spacing: 0 !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier th {
              font-weight: 500 !important;
              color: #214b74 !important;
              background: #e8eef3 !important;
              letter-spacing: 0.02em !important;
              text-transform: none !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-dossier tr {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            body.printing-offer-scenarios .offer-scenarios-print-scenario-plate,
            body.printing-offer-scenarios .offer-scenarios-print-specialist-card,
            body.printing-offer-scenarios .offer-scenarios-print-synthesis-point,
            body.printing-offer-scenarios .offer-scenarios-print-roadmap-card,
            body.printing-offer-scenarios .offer-scenarios-print-architecture-row {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}
      </style>
      <div className="offer-scenarios-print-root space-y-12">
        <section className="offer-scenarios-print-only offer-scenarios-print-cover offer-scenarios-print-page flex-col justify-between">
          <div>
            <div className="offer-scenarios-print-label inline-flex rounded-full bg-white/70 px-3 py-1 text-[10px] text-[#214B74]">
              Board Review
            </div>
            <h1 className="mt-10 max-w-4xl text-6xl leading-none tracking-tight text-slate-950">
              Cenários da Oferta
            </h1>
            <p className="mt-5 text-2xl text-slate-700">
              Rio Strategic Organizational Architecture
            </p>
            <p className="mt-10 max-w-3xl text-base leading-relaxed text-slate-600">
              Baseline architecture, scenario adjustments, operating assumptions, and 2028–2037
              experience growth roadmap.
            </p>
          </div>
          <div className="offer-scenarios-print-blue-panel p-6">
            <p className="text-base leading-relaxed text-white">
              Full strategic dossier. Offer and narrative scenarios only.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-blue-50/80">
              {OFFER_SCENARIO_GOVERNANCE_BOUNDARY}
            </p>
          </div>
        </section>
        <div className="offer-scenarios-print-only offer-scenarios-print-dossier space-y-8">
          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.2fr_0.8fr]">
              <div className="offer-scenarios-print-soft-panel p-6">
                <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                  Executive decision frame
                </div>
                <h2 className="mt-4 text-4xl leading-tight text-slate-950">
                  Cada cenário é uma promessa operacional.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  O modelo organiza limite de série, capacidade, matrícula-alvo, ecossistema adulto e
                  maturidade dos programas autorais para apoiar a decisão do business plan.
                </p>
              </div>
              <div className="offer-scenarios-print-blue-panel p-6">
                <h3 className="text-2xl leading-tight">
                  O Cenário D não é apenas uma série a mais.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-blue-50/85">
                  Ele muda a categoria operacional da escola. Se Grade 6 for lançado, o business plan
                  precisa contemplar cluster, advisory, Creative Hub, MUN, mentoria de projeto e
                  capacidade especialista compartilhada.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                ["Promessa", "O que a escola pode sustentar para famílias e estudantes."],
                ["Limiar", "O que muda quando o cenário avança."],
                ["Exposição", "Quais papéis, sistemas ou rotinas criam implicações de recursos para validação posterior."],
                ["Prova", "Quais premissas acadêmicas e operacionais sustentam a decisão."],
              ].map(([label, detail]) => (
                <div key={`print-definition-${label}`} className="offer-scenarios-print-soft-panel p-5">
                  <h4 className="text-xl text-slate-950">{label}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Scenario decision snapshot
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">A-D decision row</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {decisionPanelItems.map((item) => {
                const scenario = pedagogicalOfferScenarios.find((entry) => entry.title === item.scenario);
                return (
                  <div key={`print-snapshot-${item.scenario}`} className="offer-scenarios-print-soft-panel p-5">
                    <div className="text-4xl leading-none text-[#214B74]">{item.scenario.replace("Scenario ", "")}</div>
                    <h3 className="mt-4 text-xl leading-tight text-slate-950">{item.decision}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{scenario?.strategicIdentity}</p>
                    <div className="mt-5 space-y-2 text-xs leading-relaxed text-slate-600">
                      <p><span className="text-slate-900">Grade ceiling:</span> {scenario?.gradeCeiling}</p>
                      <p><span className="text-slate-900">Signal:</span> {item.signal}</p>
                      <p><span className="text-slate-900">Resource signal:</span> {item.budget}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Scenario Commercial Snapshot
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Commercial values by scenario</h2>
            </div>
            <div className="overflow-x-auto rounded-[18px] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Scenario", "Grade ceiling", "Target enrollment", "Modeled capacity", "Implied occupancy"].map((header) => (
                      <th key={`print-commercial-matrix-${header}`} className="px-4 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scenarioMatrix.map((row) => (
                    <tr key={`print-commercial-matrix-${row[0]}`} className="border-t border-slate-100 align-top">
                      {[row[0], row[1], row[2], row[3], row[4]].map((cell, index) => (
                        <td key={`print-commercial-matrix-${row[0]}-${index}`} className={cn("px-4 py-4 text-slate-600", index === 0 && "text-slate-950")}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="offer-scenarios-print-page space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Scenario Operating Meaning
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Academic and organizational meaning</h2>
            </div>
            <div className="overflow-x-auto rounded-[18px] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Scenario", "Strategic identity", "Classroom package", "Specialist ecosystem", "Signature / program layer", "MS / HS readiness", "Recommended pathway"].map((header) => (
                      <th key={`print-operating-matrix-${header}`} className="px-3 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scenarioMatrix.map((row) => (
                    <tr key={`print-operating-matrix-${row[0]}`} className="border-t border-slate-100 align-top">
                      {[row[0], row[5], row[6], row[7], row[8], row[9], row[10]].map((cell, index) => (
                        <td key={`print-operating-matrix-${row[0]}-${index}`} className={cn("px-3 py-4 text-slate-600", index === 0 && "text-slate-950")}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Classroom package refers only to the adult structure inside the classroom. Broader support roles, including leadership, Learning Experience Design, counseling, academic support, and specialists, are treated separately in the support ecosystem layer.
            </p>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Scenario adjustment layers
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Mapa de Ajustes da Oferta e do Ecossistema</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                O baseline permanece; o que muda é a maturidade da oferta, a intensidade da infraestrutura
                adulta e a implicação potencial de recursos.
              </p>
            </div>
            <div className="space-y-4">
              {ecosystemLayerControls
                .filter((layer) => layer.id !== "all")
                .map((layer) => {
                  const layerData = ecosystemDecisionLayers[layer.id as keyof typeof ecosystemDecisionLayers];
                  if (!layerData) return null;

                  return (
                    <div key={`print-new-layer-${layer.id}`} className="offer-scenarios-print-layer-strip">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.72fr_1.28fr]">
                        <div>
                          <h3 className="text-2xl leading-tight text-slate-950">{layerData.title}</h3>
                          <p className="mt-3 text-xs leading-relaxed text-slate-600">
                            {ecosystemLayerPrintSummaries[layer.id]}
                          </p>
                          {"guardrail" in layerData && layerData.guardrail && (
                            <p className="mt-2 text-xs leading-relaxed text-[#4b254b]">{layerData.guardrail}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                          {layerData.rows.map((row) => (
                            <div key={`print-new-layer-${layer.id}-${row.scenario}`} className="rounded-[14px] bg-white/75 px-3 py-3">
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="text-sm text-slate-950">{row.scenario.replace("Scenario ", "")}</div>
                                <div className="text-[10px] leading-snug text-[#214B74]">{row.status}</div>
                              </div>
                              <p className="mt-3 text-xs leading-relaxed text-slate-600">{row.commitment}</p>
                              <p className="mt-2 text-xs leading-relaxed text-[#4b254b]">{row.budget}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>

          <section className="offer-scenarios-print-page space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <div className="offer-scenarios-print-blue-panel p-6">
                <h2 className="text-3xl leading-tight">Decisão necessária para avançar</h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-50/85">
                  Estas perguntas organizam governança antes de qualquer conversão para orçamento,
                  staffing, custo ou implementação final.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {governanceQuestions.map((question, index) => (
                  <div key={`print-governance-${question}`} className="offer-scenarios-print-soft-panel p-4">
                    <div className="text-sm leading-relaxed text-slate-700">
                      <span className="text-[#214B74]">{index + 1}.</span> {question}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Arquitetura por Divisão
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">What must exist before scenario adjustments</h2>
            </div>
            <div className="space-y-3">
              {baselineDivisionArchitecture.map((division) => (
                <div key={`print-division-${division.division}`} className="offer-scenarios-print-architecture-row offer-scenarios-print-soft-panel p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.62fr_1fr_1fr_0.9fr_1.25fr]">
                    <div>
                      <div className="offer-scenarios-print-label text-xs text-[#214B74]">Division</div>
                      <h3 className="mt-1 text-xl text-slate-950">{division.division}</h3>
                    </div>
                    {[
                      ["Operating model", division.composition.slice(0, 3).join(" · ")],
                      ["Non-negotiable baseline", division.minimum.slice(0, 3).join(" · ")],
                      ["Not active yet", division.inactive.slice(0, 2).join(" · ")],
                      ["Activation logic", division.activation],
                    ].map(([label, items]) => (
                      <div key={`print-division-${division.division}-${label}`}>
                        <div className="offer-scenarios-print-label text-xs text-[#214B74]">{label as string}</div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{items as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Base por Sala e Cluster
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Operational packages</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {baselineEnxovalPackages.map((packageItem) => (
                <div key={`print-enxoval-${packageItem.title}`} className="offer-scenarios-print-soft-panel p-4">
                  <h3 className="text-xl text-slate-950">{packageItem.title}</h3>
                  {packageItem.note && <p className="mt-2 text-xs text-[#4b254b]">{packageItem.note}</p>}
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{packageItem.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Mínimo Operacional da Experiência Acadêmica
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Systems indicated for consistency</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {minimumAcademicOperationGroups.map((group) => (
                <div key={`print-minimum-${group.title}`} className="offer-scenarios-print-soft-panel p-4">
                  <h3 className="text-xl text-slate-950">{group.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{group.description}</p>
                  <div className="mt-4 space-y-2.5">
                    {group.systems.map((system) => {
                      const operation = minimumAcademicOperations.find((item) => item.system === system);
                      if (!operation) return null;
                      return (
                        <div key={`print-minimum-${group.title}-${operation.system}`}>
                          <div className="text-sm text-slate-950">{operation.system}</div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">{operation.why}</p>
                          <p className="mt-1 text-[10px] leading-relaxed text-[#214B74]">{operation.type}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Budget comparison
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Comparativo Orçamentário por Cenário</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                Incremento significa apenas o delta além da base original: novo papel, FTE, faixa,
                cobertura, escopo ou reclassificação.
              </p>
            </div>
            <div className="offer-scenarios-print-avoid-break overflow-hidden rounded-[18px] bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="offer-scenarios-print-label text-xs text-[#214B74]">
                  Shared controls
                </div>
                <h3 className="mt-1 text-xl text-slate-950">Baseline / Governance Controls</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Linhas de base renderizadas uma vez para preservar rastreabilidade sem diluir os drivers materiais de cada cenário.
                </p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {budgetComparisonColumns.map((header) => (
                      <th key={`print-budget-governance-${header}`} className="px-3 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sharedBudgetRows.map((row) => (
                    <tr key={`print-budget-governance-${row.area}`} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-3 text-slate-950">
                        {row.area}
                        <div className={cn("mt-2 inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                          {row.status}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{row.originallyBudgeted}</td>
                      <td className="px-3 py-3 text-slate-600">{row.currentRecommendation}</td>
                      <td className="px-3 py-3 text-[#4b254b]">{row.incrementalBudgetImpact}</td>
                      <td className="px-3 py-3 text-slate-600">{row.whyNecessary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scenarioBudgetComparisons.map((scenario) => (
              <div key={`print-budget-comparison-${scenario.scenario}`} className="offer-scenarios-print-avoid-break overflow-hidden rounded-[18px] bg-white">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="offer-scenarios-print-label text-xs text-[#214B74]">
                    {scenario.gradeCeiling}
                  </div>
                  <h3 className="mt-1 text-xl text-slate-950">{scenario.scenario}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{scenario.strategicFrame}</p>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      {scenarioBudgetComparisonColumns.map((header) => (
                        <th key={`print-budget-comparison-${scenario.scenario}-${header}`} className="px-3 py-3">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenario.rows.map((row) => (
                      <tr key={`print-budget-comparison-${scenario.scenario}-${row.area}`} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-3">
                          <div className={cn("inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                            {row.status}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-950">{row.area}</td>
                        <td className="px-3 py-3 text-slate-600">{row.originallyBudgeted}</td>
                        <td className="px-3 py-3 text-slate-600">{row.currentRecommendation}</td>
                        <td className="px-3 py-3 text-[#4b254b]">{row.incrementalBudgetImpact}</td>
                        <td className="px-3 py-3 text-slate-600">{row.whyNecessary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-2">
              {budgetComparisonValidationNotes.map((note) => (
                <div key={`print-budget-validation-${note}`} className="offer-scenarios-print-soft-panel p-4 text-[#4b254b]">
                  {note}
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-[18px] bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="offer-scenarios-print-label text-xs text-[#214B74]">
                  Secondary validation slots
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Decisões que permanecem como placeholders até que um processo separado valide escopo, custo e implementação.
                </p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {["Decisão", "Gatilho", "Status", "Validação necessária", "Placeholder de recurso"].map((header) => (
                      <th key={`print-budget-${header}`} className="px-4 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgetImpactDecisions.map((row) => (
                    <tr key={`print-budget-${row.decision}`} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 text-slate-950">{row.decision}</td>
                      <td className="px-4 py-3 text-slate-600">{row.trigger}</td>
                      <td className="px-4 py-3 text-[#214B74]">{row.status}</td>
                      <td className="px-4 py-3 text-slate-600">{row.requiredDecision}</td>
                      <td className="px-4 py-3 text-[#4b254b]">{row.budgetSlot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {pedagogicalOfferScenarios.map((scenario) => (
            <section key={`print-plate-${scenario.title}`} className="offer-scenarios-print-page offer-scenarios-print-page-break offer-scenarios-print-scenario-plate space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[0.75fr_1.25fr]">
                <div className={cn("p-6", scenario.title === "Scenario D" ? "offer-scenarios-print-blue-panel" : "offer-scenarios-print-soft-panel")}>
                  <div className={cn("text-5xl leading-none", scenario.title === "Scenario D" ? "text-white" : "text-[#214B74]")}>
                    {scenario.title}
                  </div>
                  <h2 className={cn("mt-5 text-3xl leading-tight", scenario.title === "Scenario D" ? "text-white" : "text-slate-950")}>
                    {scenario.strategicIdentity}
                  </h2>
                  <p className={cn("mt-4 text-sm leading-relaxed", scenario.title === "Scenario D" ? "text-blue-50/85" : "text-slate-600")}>
                    {scenario.boardSentence}
                  </p>
                </div>
                <div className="offer-scenarios-print-soft-panel p-6">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      ["Grade ceiling", scenario.gradeCeiling],
                      ["Target enrollment", scenario.targetEnrollment],
                      ["Modeled capacity", scenario.modeledCapacity],
                      ["Occupancy", scenario.impliedOccupancy],
                    ].map(([label, value]) => (
                      <div key={`print-plate-${scenario.title}-${label}`}>
                        <div className="offer-scenarios-print-label text-xs text-[#214B74]">{label}</div>
                        <div className="mt-1 text-sm text-slate-950">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      ["Core shift", scenario.classroomPackage],
                      ["Active offer elements", scenario.signaturePrograms],
                      ["Strategic caution", [scenario.risk]],
                    ].map(([label, values]) => (
                      <div key={`print-plate-${scenario.title}-${label}`}>
                        <div className="offer-scenarios-print-label text-xs text-[#214B74]">{label as string}</div>
                        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-600">
                          {(values as string[]).map((value) => (
                            <li key={`print-plate-${scenario.title}-${label}-${value}`}>{value}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Specialist Capacity System
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Specialist domains are planned as a system</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                Body & Movement uses the clearest slot threshold, but it is one specialist domain among
                several. Sound, arts, Design Technologies, and Creative Hub also depend on age band,
                space, setup, project format, and program maturity.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {specialistCapacityDomains.map((domain) => (
                <div key={`print-specialist-${domain.domain}`} className="offer-scenarios-print-specialist-card offer-scenarios-print-soft-panel p-5">
                  <h3 className="text-xl text-slate-950">{domain.domain}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{domain.loadSignal}</p>
                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-600">
                    <p><span className="text-[#214B74]">Lean:</span> {domain.lean}</p>
                    <p><span className="text-[#214B74]">Balanced:</span> {domain.balanced}</p>
                    <p><span className="text-[#214B74]">Premium / Grade 6:</span> {domain.premium}</p>
                    <p><span className="text-[#4b254b]">Budget implication / risk:</span> {domain.risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Operating assumptions appendix
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Premissas de suporte</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                Estas premissas sustentam o modelo decisório; elas não são o primeiro caminho de leitura.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">Body & Movement load proof</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Cada série possui 2 blocos semanais por seção; o modelo assume 2 seções por série e
                  limite de 30 blocos semanais por educador.
                </p>
                <div className="mt-4 space-y-2">
                  {bodyMovementLoads.map(([scenario, load, premise]) => (
                    <div key={`print-bm-${scenario}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{scenario}</span> · {load} · {premise}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">São Paulo specialist reference</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  São Paulo represents the mature flagship ecosystem — a contrast model, not a staffing template for Rio. A composição abaixo é referência de arquitetura especialista. Para Rio, os números permanecem premissas de planejamento.
                </p>
                <div className="mt-4 space-y-2">
                  {currentSpecialistEcosystem.map(([area, names, count]) => (
                    <div key={`print-current-specialist-${area}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{area}</span> · {names} · {count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">Middle School instructional model by stage</h3>
                <div className="mt-4 space-y-2">
                  {middleSchoolClusters.map(([cluster, coverage, premise]) => (
                    <div key={`print-cluster-${cluster}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{cluster}</span> · {coverage} · {premise}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">Mentorship model</h3>
                <div className="mt-4 space-y-2">
                  {mentorshipProgression.map(([stage, model]) => (
                    <div key={`print-mentor-${stage}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{stage}</span> · {model}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {pathwayOptions.map((pathway) => (
                <div key={`print-pathway-${pathway.title}`} className={cn("offer-scenarios-print-soft-panel p-5", pathway.recommendation && "offer-scenarios-print-blue-panel")}>
                  <h3 className="text-xl">{pathway.title}</h3>
                  <p className={cn("mt-3 text-xs leading-relaxed", pathway.recommendation ? "text-blue-50/85" : "text-slate-600")}>
                    {pathway.purpose}
                  </p>
                  <p className={cn("mt-3 text-xs leading-relaxed", pathway.recommendation ? "text-blue-50/75" : "text-slate-600")}>
                    {pathway.risk}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                Roadmap 2028–2037
              </div>
              <h2 className="mt-3 text-3xl text-slate-950">Roadmap de Crescimento da Experiência</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {roadmapPrintPhases.map((phase) => (
                <div key={`print-roadmap-phase-${phase.period}`} className="offer-scenarios-print-soft-panel p-4">
                  <div className="text-lg text-[#214B74]">{phase.period}</div>
                  <h3 className="mt-2 text-xl text-slate-950">{phase.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{phase.summary}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {printExperienceGrowthRoadmap.map((row) => (
                <div key={`print-roadmap-card-${row.year}`} className="offer-scenarios-print-roadmap-card offer-scenarios-print-soft-panel p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-xl text-slate-950">{row.year} · {row.stage}</h3>
                    <p className="text-xs text-[#214B74]">{row.ceiling}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <p className="text-xs leading-relaxed text-slate-600">{row.experience}</p>
                    <p className="text-xs leading-relaxed text-slate-600">{row.ecosystem}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break offer-scenarios-print-blue-panel min-h-[230mm] space-y-14 p-10">
            <div>
              <div className="offer-scenarios-print-label text-sm text-blue-50/75">
                Board-ready synthesis
              </div>
              <h2 className="mt-5 max-w-3xl text-5xl leading-tight text-white">Synthesis for decision</h2>
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              {synthesisStatements.map((statement, index) => (
                <div key={`print-synthesis-${statement}`} className="offer-scenarios-print-synthesis-point border-t border-white/20 pt-6">
                  <div className="text-4xl leading-none text-blue-100/70">{String(index + 1).padStart(2, "0")}</div>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90">{statement}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="offer-scenarios-print-hidden rounded-[2.25rem] bg-[#f5f0e7] p-3 text-slate-950 shadow-sm md:p-4">
          <div className="grid min-h-[760px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[2rem] bg-[#214B74] p-5 text-white lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-[720px]">
              <div className="flex h-full flex-col">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100/70">
                    Rio Strategic Architecture
                  </div>
                  <h2 className="mt-5 text-3xl font-black leading-none tracking-tight">
                    Cenários da Oferta
                  </h2>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/80">
                    Cada cenário é uma promessa operacional.
                  </p>
                </div>

                <nav className="mt-8 hidden space-y-2 lg:block">
                  {offerScenarioViews.map((view) => (
                    <button
                      key={`rail-${view.id}`}
                      type="button"
                      onClick={() => setActiveView(view.id)}
                      className={cn(
                        "w-full rounded-2xl px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all",
                        activeView === view.id
                          ? "bg-white text-[#214B74] shadow-sm"
                          : "text-blue-50/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {view.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-6 rounded-[1.75rem] bg-white/10 p-4 lg:mt-auto">
                  <div className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-100/70">
                    Board artifact
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintOfferScenarios}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-[#214B74] transition-colors hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Exportar dossiê estratégico completo
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-blue-50/70">
                    Abre a janela de impressão para salvar a versão completa como PDF.
                  </p>
                </div>
              </div>
            </aside>

            <main className="rounded-[2rem] bg-[#fbfaf7] p-4 md:p-6 xl:p-8">
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Business plan decision console
                  </div>
                  <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-slate-950 md:text-6xl">
                    Cenários da Oferta
                  </h1>
                  <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
                    O modelo organiza limite de série, capacidade, matrícula-alvo, ecossistema adulto e maturidade dos programas autorais para apoiar a decisão do business plan.
                  </p>
                </div>
                <div className="rounded-[2rem] bg-[#16334f] p-5 text-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-100/70">
                    Leitura estratégica
                  </div>
                  <p className="mt-4 text-xl font-black leading-tight">
                    Compare antes de decidir.
                  </p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/80">
                    Cada cenário deve ser lido pela mesma lógica: o que já estava orçado, o que passa a ser recomendado, qual é o incremento e que risco o incremento mitiga.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-white p-2 lg:hidden">
                <div className="grid grid-cols-2 gap-2">
                  {offerScenarioViews.map((view) => (
                    <button
                      key={`mobile-${view.id}`}
                      type="button"
                      onClick={() => setActiveView(view.id)}
                      className={cn(
                        "rounded-2xl px-3 py-3 text-left text-[10px] font-black uppercase tracking-wider transition-all",
                        activeView === view.id
                          ? "bg-[#214B74] text-white"
                          : "bg-[#f5f0e7] text-slate-500 hover:text-slate-900"
                      )}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className={cn(viewClassName("brief"), "space-y-6")}>
                  <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[2rem] bg-white p-6">
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                        Síntese executiva
                      </div>
                      <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                        Comece pela decisão, não pelo inventário.
                      </h3>
                      <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
                        O tab separa promessa acadêmica, limiar operacional, implicações de recursos e prova de viabilidade para que a conversa de liderança não vire uma lista de cargos.
                      </p>
                      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold leading-relaxed text-amber-900">
                        {OFFER_SCENARIO_GOVERNANCE_BOUNDARY}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        ["Promessa", "O que a escola pode sustentar para famílias e estudantes."],
                        ["Limiar", "O que muda quando o cenário avança."],
                        ["Exposição", "Quais papéis, sistemas ou rotinas criam implicações de recursos para validação posterior."],
                        ["Prova", "Quais premissas acadêmicas e operacionais sustentam a decisão."],
                      ].map(([label, detail]) => (
                        <div key={label} className="rounded-[1.75rem] bg-white p-5">
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#214B74]">
                            {label}
                          </div>
                          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    {[
                      ["Caminho básico da oferta", "Cenário A", "Estabelece a base da experiência escolar, com pacote de sala, MAP, PDJ em rotina e Learning Experience Design, mas ainda sem uma camada robusta de diferenciação acadêmica."],
                      ["Caminho de progressão acadêmica", "Cenário B", "Grade 4 torna o motor Researchers mais visível por investigação, evidências, raciocínio matemático, Scientific Literacy, documentação e linguagem acadêmica."],
                      ["Caminho pré-Middle School", "Cenário C", "Grade 5 ativa Pathways e protocolos de transição; projetos seguem em lógica full-class."],
                      ["Caminho com mudança operacional", "Cenário D", "Grade 6 ativa ritmo de Middle School, Passion Projects, clusters e mentoria de projeto."],
                    ].map(([label, scenario, detail]) => (
                      <div key={label} className="rounded-[2rem] bg-[#e8eef3] p-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#214B74]">{label}</div>
                        <div className="mt-3 text-2xl font-black tracking-tight text-slate-950">{scenario}</div>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 lg:grid-cols-4">
                    {pedagogicalOfferScenarios.map((scenario) => (
                      <button
                        key={`brief-${scenario.title}`}
                        type="button"
                        onClick={() => {
                          setSelectedScenarioTitle(scenario.title);
                          setActiveView("scenario");
                        }}
                        className="rounded-[1.75rem] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                          {scenario.title}
                        </div>
                        <div className="mt-3 text-lg font-black leading-tight text-slate-950">
                          {scenario.strategicIdentity}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{scenario.targetEnrollment.replace(" learners", "")} alvo</span>
                          <span>{scenario.modeledCapacity.replace(" learners", "")} cap.</span>
                          <span>{scenario.impliedOccupancy}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={cn(viewClassName("ladder"), "space-y-6")}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                        Escada de cenários
                      </div>
                      <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                        A → B → C → D
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm font-semibold leading-relaxed text-slate-600">
                      Cada avanço muda o limite da oferta, a maturidade do programa e a pressão de infraestrutura adulta.
                    </p>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-4">
                    {ecosystemScenarioLadder.map((scenario, index) => {
                      const scenarioData = pedagogicalOfferScenarios.find((item) => item.title === scenario.title);
                      const decision = decisionPanelItems.find((item) => item.scenario === scenario.title);
                      if (!scenarioData) return null;

                      return (
                        <button
                          key={`ladder-${scenario.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedScenarioTitle(scenario.title);
                            setActiveView("scenario");
                          }}
                          className={cn(
                            "group flex min-h-[360px] flex-col rounded-[2rem] p-5 text-left transition-all hover:-translate-y-1 hover:shadow-xl bg-white text-slate-950",
                            scenario.id === "D" ? "border-2 border-purple-200" : ""
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-6xl font-black leading-none tracking-tight">{scenario.id}</div>
                            <div className={cn("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider", scenario.id === "D" ? "bg-purple-50 text-purple-600" : "bg-[#f5f0e7] text-slate-500")}>
                              {String(index + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <div className="mt-8 text-xl font-black leading-tight">{scenario.identity}</div>
                          <div className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                            {scenarioData.gradeCeiling}
                          </div>
                          <div className={cn("mt-5 rounded-2xl p-4 text-sm font-bold leading-relaxed", scenario.id === "D" ? "bg-purple-50 text-[#4b254b]" : "bg-[#eef3f7] text-[#214B74]")}>
                            {scenario.delta}
                          </div>
                          <div className="mt-auto pt-6">
                            <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                              <div
                                className={cn("h-full rounded-full", scenario.id === "D" ? "bg-purple-400" : "bg-[#214B74]")}
                                style={{ width: `${(index + 1) * 25}%` }}
                              />
                            </div>
                            <div className="mt-4 text-xs font-black uppercase tracking-wider text-slate-500">
                              {scenarioData.targetEnrollment} · {scenarioData.modeledCapacity} · {scenarioData.impliedOccupancy}
                            </div>
                            <div className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
                              {decision?.budget}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cn(viewClassName("scenario"), "space-y-6")}>
                  <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-[2rem] bg-[#16334f] p-6 text-white">
                      <div className="flex flex-wrap gap-2">
                        {pedagogicalOfferScenarios.map((scenario) => (
                          <button
                            key={`scenario-pill-${scenario.title}`}
                            type="button"
                            onClick={() => setSelectedScenarioTitle(scenario.title)}
                            className={cn(
                              "rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
                              selectedScenarioTitle === scenario.title
                                ? "bg-white text-[#16334f]"
                                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                            )}
                          >
                            {scenario.title}
                          </button>
                        ))}
                      </div>
                      <div className="mt-10 text-[10px] font-black uppercase tracking-[0.28em] text-blue-100/70">
                        Cenário selecionado
                      </div>
                      {selectedScenario ? (
                        <>
                          <h3 className="mt-4 text-4xl font-black leading-none tracking-tight">
                            {selectedScenario.title}
                          </h3>
                          <p className="mt-4 text-2xl font-black leading-tight text-blue-50">
                            {selectedScenario.strategicIdentity}
                          </p>
                          <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/75">
                            {selectedScenario.boardSentence}
                          </p>
                          {selectedScenario.mainClaim && (
                            <div className="mt-6 rounded-[1.5rem] bg-white/10 p-4 text-sm font-bold leading-relaxed text-white">
                              {selectedScenario.mainClaim}
                            </div>
                          )}
                          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-xs font-semibold leading-relaxed text-blue-50/85">
                            {OFFER_SCENARIO_GOVERNANCE_BOUNDARY}
                          </div>
                        </>
                      ) : (
                        <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/75">
                          Select a scenario to inspect its operating implications.
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedScenario && (
                        <>
                          <div className="grid gap-3 sm:grid-cols-4">
                            {[
                              ["Limite", selectedScenario.gradeCeiling],
                              ["Matrícula-alvo", selectedScenario.targetEnrollment],
                              ["Capacidade", selectedScenario.modeledCapacity],
                              ["Ocupação", selectedScenario.impliedOccupancy],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-[1.5rem] bg-white p-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
                                <div className="mt-2 text-sm font-black text-slate-950">{value}</div>
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-4 lg:grid-cols-2">
                            {[
                              ["Promessa operacional", selectedScenario.classroomPackage],
                              ["Sistemas ativos", selectedScenario.signaturePrograms],
                              ["Ainda não ativo", selectedScenario.notActiveYet],
                              ["Suporte recomendado", selectedScenario.roles],
                            ].map(([label, values]) => (
                              <div key={label as string} className="rounded-[2rem] bg-white p-5">
                                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#214B74]">
                                  {label as string}
                                </div>
                                <ul className="mt-4 space-y-2 text-sm font-semibold leading-relaxed text-slate-600">
                                  {(values as string[]).map((value) => (
                                    <li key={value} className="flex gap-2">
                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#214B74]" />
                                      <span>{value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-[2rem] bg-[#fff1f1] p-5">
                            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-rose-700">
                              Risco crítico
                            </div>
                            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">
                              {selectedScenario.risk}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cn(viewClassName("budget"), "space-y-6")}>
                  <div className="rounded-[2rem] bg-white p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Implicações de recursos
                    </div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      O que já estava orçado, o que muda e por quê
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                      Incremento significa apenas o que excede a base original: novo papel, FTE adicional,
                      mudança de faixa, cobertura, escopo ou reclassificação.
                    </p>
                  </div>
                  <div className="grid gap-3 rounded-[2rem] bg-white p-5 lg:grid-cols-3">
                    {[
                      ["Baseline confirmado", "Pacote de sala EY/LS, liderança divisional, Learning Experience Design e 1 Body & Movement + 1 Arts + 1 Music."],
                      ["Validar mapeamento", "After School Educator existe no mapeamento de papéis; escopo de Coordinator ainda precisa confirmação."],
                      ["Incremento real", "Somente o delta além da base original vira implicação de recurso para validação posterior."],
                    ].map(([label, detail]) => (
                      <div key={`budget-rule-${label}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#214B74]">{label}</div>
                        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="overflow-hidden rounded-[2rem] bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#214B74]">
                        Shared controls
                      </div>
                      <h4 className="mt-1 text-xl font-black text-slate-950">Baseline / Governance Controls</h4>
                      <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                        Linhas de base renderizadas uma vez para preservar rastreabilidade sem repetir controles genéricos dentro de cada cenário.
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-[1180px] w-full text-left">
                        <thead>
                          <tr className="bg-[#edf3f7] text-[10px] font-black uppercase tracking-[0.18em] text-[#214B74]">
                            {budgetComparisonColumns.map((header) => (
                              <th key={`budget-governance-${header}`} className="px-4 py-3">{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sharedBudgetRows.map((row) => (
                            <tr key={`budget-governance-${row.area}`} className="border-t border-slate-100 align-top text-xs text-slate-600">
                              <td className="px-4 py-3 font-black text-slate-950">
                                {row.area}
                                <div className={cn("mt-2 inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                                  {row.status}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold leading-relaxed">{row.originallyBudgeted}</td>
                              <td className="px-4 py-3 font-semibold leading-relaxed">{row.currentRecommendation}</td>
                              <td className="px-4 py-3 font-semibold leading-relaxed text-[#4b254b]">{row.incrementalBudgetImpact}</td>
                              <td className="px-4 py-3 font-semibold leading-relaxed">{row.whyNecessary}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {scenarioBudgetComparisons.map((scenario) => (
                    <div key={`budget-comparison-${scenario.scenario}`} className="overflow-hidden rounded-[2rem] bg-white">
                      <div className="border-b border-slate-100 px-5 py-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                          {scenario.gradeCeiling}
                        </div>
                        <h4 className="mt-1 text-xl font-black text-slate-950">{scenario.scenario}</h4>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                          {scenario.strategicFrame}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-[1180px] w-full text-left">
                          <thead>
                            <tr className="bg-[#edf3f7] text-[10px] font-black uppercase tracking-[0.18em] text-[#214B74]">
                              {scenarioBudgetComparisonColumns.map((header) => (
                                <th key={`${scenario.scenario}-${header}`} className="px-4 py-3">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {scenario.rows.map((row) => (
                              <tr key={`${scenario.scenario}-${row.area}`} className="border-t border-slate-100 align-top text-xs text-slate-600">
                                <td className="px-4 py-3">
                                  <div className={cn("inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                                    {row.status}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-black text-slate-950">{row.area}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.originallyBudgeted}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.currentRecommendation}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed text-[#4b254b]">{row.incrementalBudgetImpact}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.whyNecessary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-[2rem] bg-white p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Governance validation note
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {budgetComparisonValidationNotes.map((note) => (
                        <div key={`budget-validation-${note}`} className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-xs font-bold leading-relaxed text-purple-800">
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[2rem] bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Secondary validation slots
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                        Decisões que permanecem como placeholders até que um processo separado valide escopo, custo e implementação.
                      </p>
                    </div>
                    <div className="hidden grid-cols-[1.25fr_0.7fr_0.8fr_1.2fr_0.8fr] gap-4 bg-[#edf3f7] px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#214B74] lg:grid">
                      <div>Decisão</div>
                      <div>Gatilho</div>
                      <div>Status</div>
                      <div>Decisão necessária</div>
                      <div>Placeholder de recurso</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {budgetImpactDecisions.map((row) => (
                        <div key={`console-${row.decision}`} className="grid gap-3 px-5 py-5 lg:grid-cols-[1.25fr_0.7fr_0.8fr_1.2fr_0.8fr] lg:items-center">
                          <div className="text-sm font-black text-slate-950">{row.decision}</div>
                          <div className="text-xs font-bold text-slate-500">{row.trigger}</div>
                          <div>
                            <span className="inline-flex rounded-full bg-[#e8eef3] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#214B74]">
                              {row.status}
                            </span>
                          </div>
                          <div className="text-xs font-semibold leading-relaxed text-slate-600">{row.requiredDecision}</div>
                          <div className="w-fit rounded-2xl bg-[#f3e8f5] px-3 py-2 text-xs font-black text-[#4b254b]">
                            {row.budgetSlot}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={cn(viewClassName("architecture"), "space-y-6")}>
                  <div className="rounded-[2rem] bg-white p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Arquitetura acadêmica
                    </div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      Três camadas para sustentar a promessa.
                    </h3>
                  </div>
                  <div className="grid gap-4 xl:grid-cols-3">
                    {minimumAcademicOperationGroups.map((group) => (
                      <div key={`console-${group.title}`} className="rounded-[2rem] bg-white p-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                          {group.label}
                        </div>
                        <h4 className="mt-3 text-2xl font-black leading-tight text-slate-950">
                          {group.title}
                        </h4>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                          {group.description}
                        </p>
                        <div className="mt-6 space-y-3">
                          {group.systems.map((system) => {
                            const operation = minimumAcademicOperations.find((item) => item.system === system);
                            if (!operation) return null;

                            return (
                              <div key={`console-${operation.system}`} className="rounded-[1.5rem] bg-[#f5f0e7] p-4">
                                <div className="text-sm font-black text-slate-950">{operation.system}</div>
                                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                                  {operation.why}
                                </p>
                                <div className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#214B74]">
                                  {operation.type}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {baselineEnxovalPackages.map((packageItem) => (
                      <div key={`console-${packageItem.title}`} className="rounded-[2rem] bg-[#e8eef3] p-5">
                        <h4 className="text-lg font-black text-slate-950">{packageItem.title}</h4>
                        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                          {packageItem.items.slice(0, 4).join(" · ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn(viewClassName("appendix"), "space-y-6")}>
                  <div className="rounded-[2rem] bg-white p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Premissas operacionais
                    </div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      Evidência por trás da decisão.
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                      Estas premissas sustentam o modelo decisório; elas não são o primeiro caminho de leitura.
                    </p>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Specialist Pillar Load & Growth Triggers
                    </div>
                    <h4 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                      Quando a capacidade especialista deixa de ser viável?
                    </h4>
                    <div className="mt-4 space-y-4">
                      <p className="text-sm font-semibold leading-relaxed text-slate-600">
                        Especialistas não são um bloco único de FTE. Cada área possui uma lógica própria
                        de carga, espaço e progressão: Body & Movement é altamente recorrente; Sound
                        Exploration exige cobertura ampla em EY/LS; Design Technologies / Learning Experience Designer se conecta à
                        arquitetura de projetos e Creative Hub; Artistic Design / Atelier e Performing Arts
                        sustentam expressão, exposição e programas autorais.
                      </p>
                      <p className="text-sm font-semibold leading-relaxed text-slate-600">
                        Design Technologies / Learning Experience Designer é o tempo de sala do Learning Experience Designer, não um
                        papel especialista separado. Os quatro pilares abaixo simulam capacidade de
                        agenda; eles não convertem automaticamente quatro pilares em quatro cargos
                        distintos de payroll.
                      </p>
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-700">
                        Body & Movement, Sound Exploration / Music, and Artistic Design / Atelier represent
                        specialist educator capacity. Design Technologies / Learning Experience Designer
                        represents classroom-facing Learning Experience Designer capacity. Performing Arts
                        is initially embedded through Sound Exploration / Music; Creative Hub is not active
                        as a scheduled learner program before Grade 6.
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        {[
                          {
                            label: "Final grade offered",
                            value: specialistFinalGrade,
                            options: specialistFinalGradeOptions,
                            onChange: (value: string) => setSpecialistFinalGrade(value as SpecialistFinalGrade),
                          },
                          {
                            label: "Sections per grade",
                            value: specialistSectionsPerGrade,
                            options: specialistSectionsPerGradeOptions,
                            onChange: (value: string) => setSpecialistSectionsPerGrade(Number(value) as SpecialistSectionsPerGrade),
                          },
                          {
                            label: "Blocks per pillar / grade",
                            value: specialistBlocksPerGrade,
                            options: specialistBlocksPerGradeOptions,
                            onChange: (value: string) => setSpecialistBlocksPerGrade(Number(value) as SpecialistBlocksPerGrade),
                          },
                          {
                            label: "Block duration",
                            value: specialistBlockDuration,
                            options: specialistBlockDurationOptions,
                            onChange: (value: string) => setSpecialistBlockDuration(Number(value) as SpecialistBlockDuration),
                          },
                          {
                            label: "Capacity threshold",
                            value: specialistCapacityThreshold,
                            options: specialistCapacityThresholdOptions,
                            onChange: (value: string) => setSpecialistCapacityThreshold(Number(value) as SpecialistCapacityThreshold),
                          },
                        ].map((control) => (
                          <label key={`visible-${control.label}`} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{control.label}</span>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#214B74]"
                              value={control.value}
                              onChange={(event) => control.onChange(event.target.value)}
                            >
                              {control.options.map((option) => (
                                <option key={`visible-${control.label}-${option}`} value={option}>
                                  {typeof option === "number" && control.label === "Block duration" ? `${option} min` : option}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                        {[
                          ["Grade levels included", `${specialistGradeLevelCount} levels`],
                          ["Blocks per pillar/week", `${specialistBlocksPerPillar} blocks`],
                          ["Hours per pillar/week", specialistHoursDisplay],
                          ["Capacity status", specialistCapacityStatus],
                          ["Recommended FTE per pillar", `${specialistRecommendedFTEPerPillar}`],
                          ["Capacity-equivalent across four pillars", `${specialistCapacityEquivalentAcrossFourPillars}`],
                        ].map(([label, value]) => (
                          <div key={`visible-specialist-simulator-output-${label}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                            <div className="mt-2 text-lg font-black text-slate-950">{value}</div>
                          </div>
                        ))}
                      </div>
                      <div className="overflow-x-auto rounded-2xl border border-slate-100">
                        <table className="min-w-[720px] w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                              <th className="px-3 py-3">Reference case</th>
                              <th className="px-3 py-3">Sections</th>
                              <th className="px-3 py-3">Final grade</th>
                              <th className="px-3 py-3">Blocks</th>
                              <th className="px-3 py-3">Hours</th>
                              <th className="px-3 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {specialistPillarSimulatorRows.map(([label, sections, grade, blocks, hours, status]) => (
                              <tr key={`visible-specialist-pillar-simulator-${label}`} className="border-t border-slate-100 text-xs font-semibold text-slate-600">
                                <td className="px-3 py-3 font-black text-slate-900">{label}</td>
                                <td className="px-3 py-3">{sections}</td>
                                <td className="px-3 py-3">{grade}</td>
                                <td className="px-3 py-3">{blocks}</td>
                                <td className="px-3 py-3">{hours}</td>
                                <td className="px-3 py-3 font-black text-[#4b254b]">{status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="rounded-2xl border border-[#214B74]/15 bg-[#edf3f7] px-4 py-3 text-xs font-semibold leading-relaxed text-slate-700">
                        With one section per grade, one full-time educator per specialist pillar remains
                        viable through Grade 5. With two sections per grade, each pillar reaches at least
                        32 weekly blocks, which triggers the need to double specialist capacity or redesign
                        the role. For Design Technologies / Learning Experience Designer, this refers to
                        the Learning Experience Designer's classroom-facing capacity, not a separate
                        specialist role.
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[2rem] bg-white p-6">
                      <h4 className="text-xl font-black text-slate-950">Specialist capacity trigger examples</h4>
                      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                        Estes exemplos seguem a mesma lógica do simulador acima. A linha de duas seções é
                        um stress test de capacidade, não a premissa default dos cenários.
                      </p>
                      <div className="mt-5 space-y-2">
                        {specialistPillarSimulatorRows.map(([label, sections, grade, blocks, hours, status]) => (
                          <div key={`console-specialist-trigger-${label}`} className="grid gap-2 rounded-2xl bg-[#f5f0e7] p-3 text-xs font-semibold text-slate-600 md:grid-cols-[1fr_0.7fr_0.7fr_0.7fr_0.5fr_1fr]">
                            <div className="font-black text-slate-950">{label}</div>
                            <div>{sections}</div>
                            <div>{grade}</div>
                            <div>{blocks}</div>
                            <div>{hours}</div>
                            <div className="font-black text-[#4b254b]">{status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[2rem] bg-white p-6">
                      <h4 className="text-xl font-black text-slate-950">Referência São Paulo</h4>
                      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                        São Paulo is a mature ecosystem reference, not a Rio staffing template. It shows
                        how specialist infrastructure expands when the school reaches mature enrollment,
                        space use, program density, and signature-program complexity.
                      </p>
                      <div className="mt-5 grid gap-2">
                        {currentSpecialistEcosystem.map(([area, names, count]) => (
                          <div key={`console-${area}`} className="rounded-2xl bg-[#f5f0e7] p-3">
                            <div className="text-sm font-black text-slate-950">{area}</div>
                            <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{names}</div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-[#214B74]">{count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[2rem] bg-white p-6">
                      <h4 className="text-xl font-black text-slate-950">Middle School instructional model by stage</h4>
                      <div className="mt-5 space-y-2">
                        {middleSchoolClusters.map(([cluster, coverage, premise]) => (
                          <div key={`console-${cluster}`} className="rounded-2xl bg-[#e8eef3] p-4">
                            <div className="text-sm font-black text-slate-950">{cluster}</div>
                            <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{coverage}</div>
                            <div className="mt-2 text-[10px] font-black uppercase tracking-wider text-[#214B74]">{premise}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[2rem] bg-white p-6">
                      <h4 className="text-xl font-black text-slate-950">Mentoria e caminhos estruturais</h4>
                      <div className="mt-5 space-y-3">
                        {mentorshipProgression.slice(0, 5).map(([stage, model]) => (
                          <div key={`console-${stage}`} className="rounded-2xl bg-[#f5f0e7] p-3 text-xs font-semibold leading-relaxed text-slate-600">
                            <span className="font-black text-slate-950">{stage}:</span> {model}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6">
                    <h4 className="text-xl font-black text-slate-950">How to read the scenarios</h4>
                    <p className="mt-3 max-w-4xl text-sm font-semibold leading-relaxed text-slate-600">
                      Scenario A protects the basic launch offer. Scenario B strengthens Lower School
                      academic visibility through the Researchers engine. Scenario C completes the Lower
                      School pathway and transition architecture. Scenario D changes category by activating
                      Middle School rhythm, Passion Projects, cluster logic, and conditional project
                      mentorship capacity.
                    </p>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6">
                    <h4 className="text-xl font-black text-slate-950">Roadmap 2028-2037</h4>
                    <div className="mt-5 grid gap-2">
                      {experienceGrowthRoadmap.map((row) => (
                        <div key={`console-${row.year}`} className="grid gap-2 rounded-2xl bg-[#f5f0e7] p-3 text-xs font-semibold leading-relaxed text-slate-600 lg:grid-cols-[0.35fr_0.8fr_0.7fr_2fr]">
                          <div className="font-black text-slate-950">{row.year}</div>
                          <div className="font-bold text-slate-900">{row.stage}</div>
                          <div>{row.ceiling}</div>
                          <div>{row.experience}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      Board synthesis
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {synthesisStatements.map((statement, index) => (
                        <div key={`console-${statement}`} className="rounded-[1.5rem] bg-white/10 p-4">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Ponto {index + 1}
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-200">{statement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </section>
			      <section className="offer-scenarios-print-only offer-scenarios-print-legacy-hidden space-y-6 rounded-[2rem] border border-slate-200 bg-[#f7f3ea] p-4 shadow-sm md:p-6">
			        <div className="offer-scenarios-print-hidden overflow-hidden rounded-[2rem] bg-slate-950 text-white">
			          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]">
			            <div className="p-6 md:p-8">
			              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
			                Rio Strategic Organizational Architecture
			              </div>
			              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
			                Cenários da Oferta
			              </h2>
			              <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-200 md:text-xl">
			                Cada cenário redefine a promessa acadêmica, o ecossistema adulto e as implicações de recursos.
			              </p>
			              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
			                Leitura board-facing para comparar capacidade modelada, matrícula-alvo, arquitetura acadêmica e implicações de recursos sem acionar staffing, cálculo de custo ou implementação final.
			              </p>
			            </div>
			            <div className="border-t border-white/10 bg-white/5 p-6 lg:border-l lg:border-t-0 md:p-8">
			              <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
			                Board artifact
			              </div>
			              <button
			                type="button"
			                onClick={handlePrintOfferScenarios}
			                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition-colors hover:bg-indigo-50"
			              >
			                <Download className="h-4 w-4" />
			                Exportar dossiê estratégico completo
			              </button>
			              <p className="mt-3 text-xs leading-relaxed text-slate-300">
			                Abre a janela de impressão para salvar a versão completa como PDF.
			              </p>
			              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-300">
			                Scenario = grade ceiling + target enrollment + modeled capacity + academic ecosystem.
			              </div>
			            </div>
			          </div>
			        </div>

			        <div className="offer-scenarios-print-hidden rounded-[1.5rem] border border-slate-200 bg-white/80 p-2 backdrop-blur">
			          <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
			            {offerScenarioViews.map((view) => (
			              <button
			                key={view.id}
			                type="button"
			                onClick={() => setActiveView(view.id)}
			                className={cn(
			                  "rounded-2xl px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all",
			                  activeView === view.id
			                    ? "bg-slate-950 text-white shadow-sm"
			                    : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900"
			                )}
			              >
			                {view.label}
			              </button>
			            ))}
			          </div>
			        </div>

			        <div className={cn(viewClassName("brief"), "space-y-6")}>
			        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			          <div className="max-w-4xl">
			            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
			              Síntese executiva
		            </div>
		            <h3 className="mt-1 text-2xl font-bold text-slate-900">
		              The decision in one view
		            </h3>
		            <p className="mt-2 text-sm leading-relaxed text-slate-500">
		              Cada cenário combina limite de série atendida, capacidade modelada, matrícula-alvo
		              e o ecossistema necessário para sustentar a experiência acadêmica prevista no
			              business plan.
			            </p>
			          </div>
			          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-slate-600 lg:max-w-sm">
			            Recommended reading: use this view for the board decision, then open the scenario ladder, selected scenario, resource implications, architecture, and appendix only as needed.
			          </div>
			        </div>

		        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
		          {[
		            ["Promessa", "O que a família e o estudante passam a reconhecer como experiência da escola."],
		            ["Limiar", "O ponto em que uma nova série muda a exigência de arquitetura adulta."],
		            ["Exposição", "Onde há implicação de recurso potencial ainda não convertida em custo ou implementação."],
		            ["Prova", "Evidências, rotinas e dados que sustentam confiança e progressão."],
		          ].map(([label, detail]) => (
		            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
		              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
		              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{detail}</p>
		            </div>
		          ))}
		        </div>

		        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
		          {[
		            ["Basic offer path", "Scenario A", "Estabelece a oferta básica com Learning Experience Design no baseline, MAP, evidências iniciais e LAP recomendado."],
		            ["Academic progression path", "Scenario B", "Usa Grade 4 para tornar o motor Researchers mais visível por investigação, evidências e linguagem acadêmica."],
		            ["Middle School operating shift", "Scenario D", "Ativa clusters, Creative Hub, MUN, advisory e nova pressão de infraestrutura adulta."],
		          ].map(([label, scenario, detail]) => (
		            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
		              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
		              <div className="mt-2 text-sm font-black text-slate-950">{scenario}</div>
		              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{detail}</p>
		            </div>
		          ))}
		        </div>

		        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
		          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
		            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
		              Capacity
		            </div>
		            <p className="mt-2 text-xs leading-relaxed text-slate-600">
		              Capacity is not the same as enrollment. Capacity shows the structure the school is
		              able to hold.
		            </p>
		          </div>
		          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
		            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
		              Commercial Premise
		            </div>
		            <p className="mt-2 text-xs leading-relaxed text-slate-600">
		              Target enrollment shows the commercial premise. Occupancy shows how much of the
		              structure is being financially used.
		            </p>
		          </div>
		          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
		            <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
		              Premissa em Português
		            </div>
		            <p className="mt-2 text-xs leading-relaxed text-slate-600">
		              Capacidade modelada não é o mesmo que matrícula-alvo. Capacidade indica o que a
		              estrutura comporta; matrícula-alvo indica a premissa comercial do business plan;
		              ocupação implícita = matrícula-alvo / capacidade modelada.
		            </p>
			          </div>
			        </div>
			        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
			          <strong>Nota de capacidade:</strong> Os números de estudantes por série representam o
			          total de estudantes em duas seções, não a capacidade por seção.
			          <br />
			          Grade-level learner numbers represent total learners across two sections, not
			          learners per section.
			        </div>
				        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
					          Para uma escola internacional e bilíngue no Rio de Janeiro, academic performance
					          e language acquisition não são camadas tardias. Elas começam cedo porque MAP,
					          aquisição de língua, intervenção, enriquecimento e evidências de aprendizagem
					          precisam sustentar a confiança das famílias desde Lower School. Esta aba é
					          UI-only, board-facing e não aciona staffing, cálculo de custo ou implementação final.
				        </div>
				        <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white">
				          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				            <div>
				              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
				                The decision in one view
				              </div>
				              <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-slate-200">
				                Scenario D is not just one more grade. It changes the operating category of the school.
				              </p>
				            </div>
				            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold leading-relaxed text-slate-300 lg:max-w-sm">
				              Read from left to right: basic offer, Researchers progression, Pathways activation, then Middle School operating-model launch.
				            </div>
				          </div>
				          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				            {decisionPanelItems.map((item) => (
				              <div key={item.scenario} className="rounded-2xl border border-white/10 bg-white p-4 text-slate-900">
				                <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest", item.tone)}>
				                  {item.scenario}
				                </div>
				                <h4 className="mt-3 text-base font-black leading-tight text-slate-950">
				                  {item.decision}
				                </h4>
				                <div className="mt-3 space-y-2">
				                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
				                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Signal</div>
				                    <div className="mt-1 text-xs font-bold leading-relaxed text-slate-700">{item.signal}</div>
				                  </div>
				                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
				                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resource signal</div>
				                    <div className="mt-1 text-xs font-bold leading-relaxed text-slate-700">{item.budget}</div>
				                  </div>
				                </div>
				              </div>
				            ))}
				          </div>
				        </div>

				        <Card
				          className="offer-scenarios-print-only offer-scenarios-print-avoid-break"
				          title="Complete Scenario Matrix"
				          subtitle="Resumo executivo dos quatro cenários antes da arquitetura detalhada."
				          icon={Database}
				        >
				          <div className="overflow-x-auto rounded-2xl border border-slate-100">
				            <table className="min-w-[1380px] w-full text-left">
				              <thead>
				                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
				                  {["Scenario", "Grade ceiling", "Target enrollment", "Modeled capacity", "Implied occupancy", "Strategic identity", "Classroom package", "Specialist ecosystem", "Signature programs", "Middle School logic", "Recommended pathway"].map((header) => (
				                    <th key={header} className="px-3 py-3">{header}</th>
				                  ))}
				                </tr>
				              </thead>
				              <tbody>
				                {scenarioMatrix.map((row) => (
				                  <tr key={`${row[0]}-print-matrix`} className="border-t border-slate-100 align-top text-xs text-slate-600">
				                    {row.map((cell, index) => (
				                      <td key={`${row[0]}-${index}-print-matrix`} className={cn("px-3 py-3", index === 0 && "font-bold text-slate-900")}>
				                        {cell}
				                      </td>
				                    ))}
				                  </tr>
				                ))}
				              </tbody>
				            </table>
				          </div>
				          <p className="mt-3 text-xs leading-relaxed text-slate-500">
				            Classroom package refers only to the adult structure inside the classroom. Broader support roles, including leadership, Learning Experience Design, counseling, academic support, and specialists, are treated separately in the support ecosystem layer.
				          </p>
				        </Card>

				        </div>

				        <div className={cn(viewClassName("architecture"), "space-y-6")}>
				        <Card
				          className="offer-scenarios-print-compact-baseline"
				          title="Arquitetura Básica por Divisão"
				          subtitle="Antes dos cenários de crescimento, o modelo define o mínimo estrutural necessário para que a experiência acadêmica aconteça com consistência."
				          icon={Building2}
				        >
				          <div className="space-y-5">
				            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
					              O enxoval básico não é apenas uma lista de adultos por sala. Ele combina
					              composição de sala, sistemas acadêmicos mínimos, rotinas de documentação,
					              especialistas compartilhados e suporte de performance/língua para que a
					              experiência prometida seja viável.
					            </div>
				            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				              {baselineDivisionArchitecture.map((division) => (
				                <div key={division.division} className={cn("rounded-2xl border p-4", division.tone)}>
				                  <div className="flex items-start justify-between gap-3">
				                    <h4 className="text-base font-black text-slate-900">{division.division}</h4>
				                    <span className="rounded-full border border-white/70 bg-white/70 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
				                      Baseline
				                    </span>
				                  </div>
				                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
				                    {[
				                      ["Composição da sala / modelo acadêmico", division.composition],
				                      ["Mínimo operacional da experiência", division.minimum],
				                      ["Não ativo ainda / depende de cenário", division.inactive],
				                    ].map(([label, items]) => (
				                      <div key={label as string} className="rounded-xl border border-white/70 bg-white/80 p-3">
				                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
				                          {label as string}
				                        </div>
				                        <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-slate-600">
				                          {(items as string[]).map((item) => (
				                            <li key={item} className="flex gap-2">
				                              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
				                              <span>{item}</span>
				                            </li>
				                          ))}
				                        </ul>
				                      </div>
				                    ))}
				                    <div className="rounded-xl border border-white/70 bg-white/80 p-3 md:col-span-2">
				                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
				                        Cenário de ativação
				                      </div>
				                      <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-700">
				                        {division.activation}
				                      </p>
				                    </div>
				                  </div>
				                </div>
				              ))}
				            </div>
				          </div>
				        </Card>

				        <Card
				          title="Base Operacional por Sala e Cluster"
				          subtitle="O enxoval traduz a arquitetura da oferta em unidades operacionais: o que cada sala, ciclo ou cluster precisa para funcionar com fidelidade."
				          icon={Layers}
				        >
				          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				            {baselineEnxovalPackages.map((packageItem) => (
				              <div key={packageItem.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
				                <div className="flex items-start justify-between gap-3">
				                  <h4 className="text-sm font-black text-slate-900">{packageItem.title}</h4>
				                  <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
				                    Enxoval
				                  </span>
				                </div>
				                {packageItem.note && (
				                  <div className="mt-3 rounded-xl border border-purple-100 bg-white px-3 py-2 text-[11px] font-bold leading-relaxed text-purple-800">
				                    {packageItem.note}
				                  </div>
				                )}
				                <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-slate-600">
				                  {packageItem.items.map((item) => (
				                    <li key={item} className="flex gap-2">
				                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
				                      <span>{item}</span>
				                    </li>
				                  ))}
				                </ul>
				              </div>
				            ))}
				          </div>
				        </Card>

				        <Card
				          title="Mínimo Operacional da Experiência Acadêmica"
				          subtitle="O mínimo operacional define os sistemas sem os quais a experiência acadêmica prometida não acontece com consistência."
				          icon={ShieldCheck}
				        >
				          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				            {minimumAcademicOperationGroups.map((group) => (
				              <div key={group.title} className={cn("rounded-2xl border p-4", group.tone)}>
				                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
				                  {group.label}
				                </div>
				                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
				                  {group.title}
				                </div>
				                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
				                  {group.description}
				                </p>
				                <div className="mt-4 space-y-3">
				                  {group.systems.map((system) => {
				                    const operation = minimumAcademicOperations.find((item) => item.system === system);
				                    if (!operation) return null;

				                    return (
				                      <div key={operation.system} className="rounded-2xl border border-white/80 bg-white/85 p-4">
				                        <div className="text-sm font-black leading-snug text-slate-900">
				                          {operation.system}
				                        </div>
				                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
				                          {operation.why}
				                        </p>
				                        <div className="mt-3 inline-flex w-fit rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
				                          {operation.type}
				                        </div>
				                        {operation.guardrail && (
				                          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-[11px] font-bold leading-relaxed text-indigo-800">
				                            {operation.guardrail}
				                          </div>
				                        )}
				                      </div>
				                    );
				                  })}
				                </div>
				              </div>
				            ))}
				          </div>
				        </Card>

				        </div>

				        <div className={cn(viewClassName("ladder"), "space-y-6")}>
						        <Card
						          className="offer-scenarios-print-page-break"
						          title="Mapa de Ajustes da Oferta e do Ecossistema"
					          subtitle="Compare o que muda em cada cenário: compromisso de oferta, infraestrutura adulta indicada e possíveis implicações de recursos."
				          icon={Layers}
				        >
				          <div className="space-y-5">
				            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				              <div className="max-w-3xl">
				                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
				                  Decision tool
				                </div>
				                <h4 className="mt-1 text-xl font-bold text-slate-900">
				                  What changes when leadership chooses A, B, C, or D?
				                </h4>
					                <p className="mt-2 text-sm leading-relaxed text-slate-600">
					                  A arquitetura básica acima define o ponto de partida. Este mapa mostra os
						                  ajustes além do baseline, separando compromisso de oferta, infraestrutura
						                  adulta e sinal de recursos.
					                </p>
					              </div>
					              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600 xl:max-w-md">
					                <strong>Leitura executiva:</strong> o baseline permanece; o que muda é a
					                maturidade da oferta, a intensidade da infraestrutura adulta e a pressão
					                de recursos potencial.
					              </div>
					            </div>

					            <div className="offer-scenarios-print-hidden grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2 xl:grid-cols-7">
					              {ecosystemLayerControls.map((layer) => (
					                <button
				                  key={layer.id}
				                  type="button"
				                  onClick={() => setSelectedEcosystemLayer(layer.id)}
				                  className={cn(
				                    "rounded-xl border px-3 py-2 text-[11px] font-bold transition-all",
				                    selectedEcosystemLayer === layer.id
				                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
				                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
				                  )}
				                >
				                  {layer.label}
				                </button>
				              ))}
				            </div>

				            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
				              {ecosystemScenarioLadder.map((scenario, index) => (
				                <button
				                  key={scenario.id}
				                  type="button"
				                  onClick={() => {
				                    setSelectedScenarioTitle(scenario.title);
				                    setActiveView("scenario");
				                  }}
				                  className={cn("relative rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", scenario.tone)}
				                >
				                  <div className="flex items-start justify-between gap-3">
				                    <div>
				                      <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
				                        Step {index + 1}
				                      </div>
				                      <div className="mt-1 text-sm font-black">{scenario.title}</div>
				                    </div>
				                    <div className="rounded-full border border-current/20 bg-white/70 px-2 py-1 text-[10px] font-black">
				                      {scenario.id}
				                    </div>
				                  </div>
				                  <div className="mt-3 text-sm font-bold leading-snug">{scenario.identity}</div>
				                  <div className="mt-2 text-[11px] font-black uppercase tracking-wider opacity-75">
				                    {pedagogicalOfferScenarios.find((item) => item.title === scenario.title)?.gradeCeiling}
				                  </div>
				                  <div className="mt-2 rounded-xl border border-current/10 bg-white/60 px-3 py-2 text-xs font-semibold leading-relaxed">
				                    {scenario.delta}
				                  </div>
				                  <div className="mt-3 rounded-xl border border-current/10 bg-white/60 px-3 py-2 text-[11px] font-bold leading-relaxed">
				                    {decisionPanelItems.find((item) => item.scenario === scenario.title)?.budget}
				                  </div>
					                </button>
					              ))}
					            </div>

					            {selectedEcosystemLayer === "all" ? (
					              <div className="offer-scenarios-print-hidden grid grid-cols-1 gap-3 md:grid-cols-3">
						                {[
						                  ["Baseline", "Scenario A protects the launch foundation already defined above."],
						                  ["Formation", "Scenario B strengthens Concept identity before Middle School."],
					                  ["Activation", "Scenario C activates Grade 5 Pathways; Scenario D activates the first MS layer."],
					                ].map(([label, detail]) => (
				                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
				                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
				                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{detail}</p>
				                  </div>
					                ))}
					              </div>
					            ) : selectedDecisionLayer ? (
					              <div className="offer-scenarios-print-hidden space-y-4">
					                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
				                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
				                    Layer comparison
				                  </div>
				                  <h4 className="mt-1 text-lg font-bold text-slate-900">{selectedDecisionLayer.title}</h4>
				                  {"guardrail" in selectedDecisionLayer && selectedDecisionLayer.guardrail && (
				                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
				                      {selectedDecisionLayer.guardrail}
				                    </p>
				                  )}
				                </div>
				                <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
				                  {selectedDecisionLayer.rows.map((row) => (
				                    <div key={`${selectedEcosystemLayer}-${row.scenario}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
				                      <div className="flex items-start justify-between gap-3">
				                        <div className="text-sm font-black text-slate-900">{row.scenario}</div>
				                        <span className={cn("rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wider", ecosystemStatusClasses[row.status] ?? "border-slate-200 bg-white text-slate-600")}>
				                          {row.status}
				                        </span>
				                      </div>
				                      <div className="mt-4 space-y-3">
				                        {[
				                          ["Compromisso de oferta", row.commitment],
				                          ["Infraestrutura adulta", row.adult],
				                          ["Sinal de recursos", row.budget],
				                        ].map(([label, value]) => (
				                          <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
				                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
				                            {label === "Sinal de recursos" ? (
				                              <div className={cn(
				                                "mt-2 inline-flex rounded-lg border px-2 py-1 text-xs font-bold leading-relaxed",
				                                "budgetPlaceholder" in row && row.budgetPlaceholder
				                                  ? "border-purple-200 bg-purple-50 text-purple-800"
				                                  : "border-slate-200 bg-slate-50 text-slate-700"
				                              )}>
				                                {value}
				                              </div>
				                            ) : (
				                              <div className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">
				                                {value}
				                              </div>
				                            )}
				                          </div>
				                        ))}
				                      </div>
				                    </div>
				                  ))}
					                </div>
					              </div>
					            ) : null}
					            <div className="offer-scenarios-print-only offer-scenarios-print-grid grid-cols-1 gap-4">
					              {ecosystemLayerControls
					                .filter((layer) => layer.id !== "all")
					                .map((layer) => {
					                  const layerData =
					                    ecosystemDecisionLayers[layer.id as keyof typeof ecosystemDecisionLayers];
					                  if (!layerData) return null;

					                  return (
					                    <div key={`print-${layer.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					                      <div className="flex items-start justify-between gap-3">
					                        <div>
					                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
					                            Adjustment layer
					                          </div>
					                          <h4 className="mt-1 text-base font-black text-slate-900">{layerData.title}</h4>
					                        </div>
					                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
					                          Print summary
					                        </span>
					                      </div>
					                      {"guardrail" in layerData && layerData.guardrail && (
					                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{layerData.guardrail}</p>
					                      )}
					                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
					                        {layerData.rows.map((row) => (
					                          <div key={`${layer.id}-${row.scenario}-print`} className="rounded-xl border border-slate-200 bg-white p-3">
					                            <div className="flex items-start justify-between gap-2">
					                              <div className="text-xs font-black text-slate-900">{row.scenario}</div>
					                              <span className={cn("rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider", ecosystemStatusClasses[row.status] ?? "border-slate-200 bg-white text-slate-600")}>
					                                {row.status}
					                              </span>
					                            </div>
					                            <div className="mt-2 space-y-1 text-[10px] leading-relaxed text-slate-600">
					                              <p><strong>Oferta:</strong> {row.commitment}</p>
					                              <p><strong>Adultos:</strong> {row.adult}</p>
					                              <p><strong>Recurso:</strong> {row.budget}</p>
					                            </div>
					                          </div>
					                        ))}
					                      </div>
					                    </div>
					                  );
					                })}
					            </div>
					          </div>
					        </Card>

					        </div>

				        <div className={cn(viewClassName("budget"), "space-y-6")}>
				        <Card
				          className="offer-scenarios-print-avoid-break"
				          title="Comparativo Orçamentário por Cenário"
				          subtitle="O incremento considera apenas o delta além da base original: novo papel, FTE, faixa, cobertura, escopo ou reclassificação."
				          icon={Briefcase}
				        >
                  <div className="mb-5 grid gap-3 md:grid-cols-3">
                    {[
                      ["Baseline confirmado", "Pacote de sala EY/LS, liderança divisional, Learning Experience Design e 1 Body & Movement + 1 Arts + 1 Music."],
                      ["Validar mapeamento", "After School Educator existe no mapeamento de papéis; escopo de Coordinator ainda precisa confirmação."],
                      ["Incremento real", "Somente o delta além da base original vira implicação de recurso para validação posterior."],
                    ].map(([label, detail]) => (
                      <div key={`legacy-budget-rule-${label}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                        <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <div className="border-b border-slate-100 bg-white px-4 py-3">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Shared controls
                        </div>
                        <h4 className="mt-1 text-base font-black text-slate-900">Baseline / Governance Controls</h4>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                          Linhas de base renderizadas uma vez para preservar rastreabilidade sem repetir controles genéricos em cada cenário.
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-[1180px] w-full text-left">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                              {budgetComparisonColumns.map((header) => (
                                <th key={`legacy-budget-governance-${header}`} className="px-4 py-3">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sharedBudgetRows.map((row) => (
                              <tr key={`legacy-budget-governance-${row.area}`} className="border-t border-slate-100 align-top text-xs text-slate-600">
                                <td className="px-4 py-3 font-bold text-slate-900">
                                  {row.area}
                                  <div className={cn("mt-2 inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                                    {row.status}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.originallyBudgeted}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.currentRecommendation}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed text-purple-800">{row.incrementalBudgetImpact}</td>
                                <td className="px-4 py-3 font-semibold leading-relaxed">{row.whyNecessary}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {scenarioBudgetComparisons.map((scenario) => (
                      <div key={`legacy-budget-comparison-${scenario.scenario}`} className="overflow-hidden rounded-2xl border border-slate-100">
                        <div className="border-b border-slate-100 bg-white px-4 py-3">
                          <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {scenario.gradeCeiling}
                          </div>
                          <h4 className="mt-1 text-base font-black text-slate-900">{scenario.scenario}</h4>
                          <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{scenario.strategicFrame}</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-[1180px] w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
                                {scenarioBudgetComparisonColumns.map((header) => (
                                  <th key={`${scenario.scenario}-${header}-legacy`} className="px-4 py-3">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {scenario.rows.map((row) => (
                                <tr key={`${scenario.scenario}-${row.area}-legacy`} className="border-t border-slate-100 align-top text-xs text-slate-600">
                                  <td className="px-4 py-3">
                                    <div className={cn("inline-flex rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-widest", budgetStatusClassName[row.status])}>
                                      {row.status}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 font-bold text-slate-900">{row.area}</td>
                                  <td className="px-4 py-3 font-semibold leading-relaxed">{row.originallyBudgeted}</td>
                                  <td className="px-4 py-3 font-semibold leading-relaxed">{row.currentRecommendation}</td>
                                  <td className="px-4 py-3 font-semibold leading-relaxed text-purple-800">{row.incrementalBudgetImpact}</td>
                                  <td className="px-4 py-3 font-semibold leading-relaxed">{row.whyNecessary}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-2 md:grid-cols-2">
                    {budgetComparisonValidationNotes.map((note) => (
                      <div key={`legacy-budget-validation-${note}`} className="rounded-2xl border border-purple-100 bg-purple-50 px-4 py-3 text-xs font-bold leading-relaxed text-purple-800">
                        {note}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="mb-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Secondary validation slots
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                        Decisões que permanecem como placeholders até que um processo separado valide escopo, custo e implementação.
                      </p>
                    </div>
				          <div className="overflow-x-auto rounded-2xl border border-slate-100">
				            <table className="min-w-[860px] w-full text-left">
				              <thead>
				                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
				                  {["Decisão", "Gatilho", "Status", "Validação necessária", "Placeholder de recurso"].map((header) => (
				                    <th key={header} className="px-4 py-3">{header}</th>
				                  ))}
				                </tr>
				              </thead>
				              <tbody>
				                {budgetImpactDecisions.map((row) => (
				                  <tr key={row.decision} className="border-t border-slate-100 align-top text-xs text-slate-600">
				                    <td className="px-4 py-3 font-bold text-slate-900">{row.decision}</td>
				                    <td className="px-4 py-3 font-semibold text-slate-700">{row.trigger}</td>
				                    <td className="px-4 py-3">
				                      <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-700">
				                        {row.status}
				                      </span>
				                    </td>
				                    <td className="px-4 py-3 font-semibold leading-relaxed text-slate-700">{row.requiredDecision}</td>
				                    <td className="px-4 py-3">
				                      <span className="inline-flex rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-xs font-black text-purple-800">
				                        {row.budgetSlot}
				                      </span>
				                    </td>
				                  </tr>
				                ))}
				              </tbody>
				            </table>
				          </div>
                  </div>
				        </Card>

				        </div>

		        <div className={cn(viewClassName("scenario"), "offer-scenarios-print-page-break space-y-4")}>
		          <div className="offer-scenarios-print-hidden flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
		            <div>
		              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
		                Cenário selecionado
		              </div>
		              <h3 className="mt-1 text-xl font-black text-slate-900">
		                {selectedScenario.title}: {selectedScenario.strategicIdentity}
		              </h3>
		            </div>
		            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
		              {pedagogicalOfferScenarios.map((scenario) => (
		                <button
		                  key={`${scenario.title}-selector`}
		                  type="button"
		                  onClick={() => setSelectedScenarioTitle(scenario.title)}
		                  className={cn(
		                    "rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
		                    selectedScenario.title === scenario.title
		                      ? "border-slate-950 bg-slate-950 text-white"
		                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-400 hover:text-slate-900"
		                  )}
		                >
		                  {scenario.title}
		                </button>
		              ))}
		            </div>
		          </div>
		          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
		          {pedagogicalOfferScenarios.map((scenario) => (
	            <div
	              key={scenario.title}
	              className={cn(
	                "offer-scenarios-scenario-card flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5",
	                selectedScenario.title !== scenario.title && "offer-scenarios-screen-inactive"
	              )}
	            >
		              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		                <div>
		                  <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", scenario.tone)}>
		                    {scenario.title}
		                  </div>
		                  <h4 className="mt-3 text-lg font-bold leading-snug text-slate-900">
		                    {scenario.strategicIdentity}
		                  </h4>
		                  <p className="mt-1 text-xs font-semibold text-slate-500">{scenario.offerStage}</p>
		                </div>
		                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
		                  {scenario.gradeCeiling}
		                </div>
		              </div>
		              <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
		                {[
		                  ["Target enrollment", scenario.targetEnrollment],
		                  ["Modeled capacity", scenario.modeledCapacity],
		                  ["Occupancy", scenario.impliedOccupancy],
		                ].map(([label, value]) => (
		                  <div key={label} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
		                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
		                      {label}
		                    </div>
		                    <div className="mt-0.5 font-bold text-slate-900">{value}</div>
		                  </div>
			                ))}
			              </div>
			              <div className="offer-scenarios-scenario-print-summary offer-scenarios-print-only mt-4 rounded-2xl border border-slate-200 bg-white p-4">
			                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
			                  {[
			                    ["Core shift", scenario.classroomPackage],
			                    ["Active offer elements", scenario.signaturePrograms],
			                    ["Strategic caution", [scenario.risk]],
			                  ].map(([label, values]) => (
			                    <div key={label as string} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
			                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
			                        {label as string}
			                      </div>
			                      <ul className="mt-2 space-y-1 text-[10px] leading-relaxed text-slate-600">
			                        {(values as string[]).map((value) => (
			                          <li key={value} className="flex gap-2">
			                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
			                            <span>{value}</span>
			                          </li>
			                        ))}
			                      </ul>
			                    </div>
			                  ))}
			                </div>
			              </div>
			              {scenario.mainClaim && (
			                <div className="mt-4 rounded-2xl border border-purple-100 bg-white px-4 py-3 text-xs font-bold leading-relaxed text-purple-800">
			                  {scenario.mainClaim}
			                </div>
			              )}
			              <div className="offer-scenarios-scenario-screen-detail mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
			                {[
			                  ["Core shift", scenario.classroomPackage],
			                  ["Active offer elements", scenario.signaturePrograms],
			                  ["What is not active yet", scenario.notActiveYet],
			                  ["Recommended support", scenario.roles],
			                  ["Specialist planning", scenario.specialistEcosystem],
			                ].map(([label, values]) => (
			                  <div key={label as string} className="rounded-2xl border border-slate-200 bg-white p-4">
			                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
		                      {label as string}
		                    </div>
		                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
		                      {(values as string[]).map((value) => (
		                        <li key={value} className="flex gap-2">
		                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
		                          <span>{value}</span>
		                        </li>
		                      ))}
		                    </ul>
			                  </div>
			                ))}
			              </div>
			              <div className="offer-scenarios-scenario-screen-detail mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
		                <div className="rounded-2xl border border-slate-200 bg-white p-3">
		                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
		                    Middle School logic
		                  </div>
		                  <div className="mt-1 text-xs font-bold text-slate-800">{scenario.middleSchoolLogic}</div>
		                </div>
		                <div className="rounded-2xl border border-slate-200 bg-white p-3">
		                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
		                    Recommended pathway
		                  </div>
		                  <div className="mt-1 text-xs font-bold text-slate-800">{scenario.recommendedPathway}</div>
		                </div>
		                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
		                  <div className="text-[9px] font-bold uppercase tracking-widest text-rose-700">
		                    Strategic caution
		                  </div>
		                  <div className="mt-1 text-xs leading-relaxed text-slate-700">{scenario.risk}</div>
		                </div>
		              </div>
			              <div className="offer-scenarios-scenario-screen-detail mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-slate-700">
			                {scenario.boardSentence}
			              </div>
		            </div>
		          ))}
		        </div>
		        </div>

		        <div className={cn(viewClassName("appendix"), "space-y-6")}>
			        <section className="offer-scenarios-print-page-break space-y-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
			          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
			            <div>
			              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
			                Operating Assumptions Appendix
			              </div>
			              <h3 className="mt-1 text-xl font-black text-slate-900">
			                Technical proof behind the scenario choices
			              </h3>
			              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
			                Estas premissas sustentam o modelo decisório; elas não são o primeiro caminho de leitura.
			                Abaixo estão as evidências de carga especialista, clusters, mentoria, caminhos
			                estruturais e roadmap.
			              </p>
			            </div>
			            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-relaxed text-slate-600 lg:max-w-sm">
			              Supporting assumptions only. Counts remain planning premises until timetable, space, and scope are validated.
			            </div>
			          </div>

			        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
		          <Card title="Carga de Body & Movement" icon={Activity}>
		            <div className="space-y-4">
		              <p className="text-sm leading-relaxed text-slate-600">
		                Body & Movement: cada série possui 2 blocos semanais por seção. Como o modelo
		                considera 2 seções por série, a carga semanal é calculada por série × 2 seções
		                × 2 blocos. Cada educador pode assumir até 30 blocos semanais. Acima de 30
		                blocos, a premissa passa a ser 2 educadores especialistas + 1 monitor.
		              </p>
		              <div className="overflow-x-auto rounded-2xl border border-slate-100">
		                <table className="min-w-[620px] w-full text-left">
		                  <thead>
		                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                      <th className="px-3 py-3">Scenario</th>
		                      <th className="px-3 py-3">Weekly load</th>
		                      <th className="px-3 py-3">Premise</th>
		                    </tr>
		                  </thead>
		                  <tbody>
		                    {bodyMovementLoads.map(([scenario, load, premise]) => (
		                      <tr key={scenario} className="border-t border-slate-100 text-xs text-slate-600">
		                        <td className="px-3 py-3 font-bold text-slate-900">{scenario}</td>
		                        <td className="px-3 py-3 font-semibold">{load}</td>
		                        <td className="px-3 py-3">{premise}</td>
		                      </tr>
		                    ))}
		                  </tbody>
		                </table>
		              </div>
		            </div>
		          </Card>

		          <Card title="Specialist Pillar Load & Growth Triggers" icon={Palette}>
		            <div className="space-y-4">
		              <p className="text-sm leading-relaxed text-slate-600">
		                Especialistas não são um bloco único de FTE. Cada área possui uma lógica própria
		                de carga, espaço e progressão: Body & Movement é altamente recorrente; Sound
		                Exploration exige cobertura ampla em EY/LS; Design Technologies / Learning Experience Designer se conecta à
		                arquitetura de projetos e Creative Hub; Artistic Design / Atelier e Performing Arts
		                sustentam expressão, exposição e programas autorais.
		              </p>
		              <p className="text-sm leading-relaxed text-slate-600">
		                Design Technologies / Learning Experience Designer é o tempo de sala do Learning Experience Designer, não um
		                papel especialista separado. Os quatro pilares abaixo simulam capacidade de
		                agenda; eles não convertem automaticamente quatro pilares em quatro cargos
		                distintos de payroll.
		              </p>
		              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
		                Body & Movement, Sound Exploration / Music, and Artistic Design / Atelier represent
		                specialist educator capacity. Design Technologies / Learning Experience Designer
		                represents classroom-facing Learning Experience Designer capacity. Performing Arts
		                is initially embedded through Sound Exploration / Music; Creative Hub is not active
		                as a scheduled learner program before Grade 6.
		              </div>
		              <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
		                {[
		                  {
		                    label: "Final grade offered",
		                    value: specialistFinalGrade,
		                    options: specialistFinalGradeOptions,
		                    onChange: (value: string) => setSpecialistFinalGrade(value as SpecialistFinalGrade),
		                  },
		                  {
		                    label: "Sections per grade",
		                    value: specialistSectionsPerGrade,
		                    options: specialistSectionsPerGradeOptions,
		                    onChange: (value: string) => setSpecialistSectionsPerGrade(Number(value) as SpecialistSectionsPerGrade),
		                  },
		                  {
		                    label: "Blocks per pillar / grade",
		                    value: specialistBlocksPerGrade,
		                    options: specialistBlocksPerGradeOptions,
		                    onChange: (value: string) => setSpecialistBlocksPerGrade(Number(value) as SpecialistBlocksPerGrade),
		                  },
		                  {
		                    label: "Block duration",
		                    value: specialistBlockDuration,
		                    options: specialistBlockDurationOptions,
		                    onChange: (value: string) => setSpecialistBlockDuration(Number(value) as SpecialistBlockDuration),
		                  },
		                  {
		                    label: "Capacity threshold",
		                    value: specialistCapacityThreshold,
		                    options: specialistCapacityThresholdOptions,
		                    onChange: (value: string) => setSpecialistCapacityThreshold(Number(value) as SpecialistCapacityThreshold),
		                  },
		                ].map((control) => (
		                  <label key={control.label} className="space-y-2 rounded-2xl border border-slate-100 bg-white p-3">
		                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{control.label}</span>
		                    <select
		                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#214B74]"
		                      value={control.value}
		                      onChange={(event) => control.onChange(event.target.value)}
		                    >
		                      {control.options.map((option) => (
		                        <option key={`${control.label}-${option}`} value={option}>
		                          {typeof option === "number" && control.label === "Block duration" ? `${option} min` : option}
		                        </option>
		                      ))}
		                    </select>
		                  </label>
		                ))}
		              </div>
		              <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
		                {[
		                  ["Grade levels included", `${specialistGradeLevelCount} levels`],
		                  ["Blocks per pillar/week", `${specialistBlocksPerPillar} blocks`],
		                  ["Hours per pillar/week", specialistHoursDisplay],
		                  ["Capacity status", specialistCapacityStatus],
		                  ["Recommended FTE per pillar", `${specialistRecommendedFTEPerPillar}`],
		                  ["Capacity-equivalent across four pillars", `${specialistCapacityEquivalentAcrossFourPillars}`],
		                ].map(([label, value]) => (
		                  <div key={`specialist-simulator-output-${label}`} className="rounded-2xl border border-slate-100 bg-white p-3">
		                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
		                    <div className="mt-2 text-lg font-black text-slate-950">{value}</div>
		                  </div>
		                ))}
		              </div>
		              <div className="overflow-x-auto rounded-2xl border border-slate-100">
		                <table className="min-w-[720px] w-full text-left">
		                  <thead>
		                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                      <th className="px-3 py-3">Reference case</th>
		                      <th className="px-3 py-3">Sections</th>
		                      <th className="px-3 py-3">Final grade</th>
		                      <th className="px-3 py-3">Blocks</th>
		                      <th className="px-3 py-3">Hours</th>
		                      <th className="px-3 py-3">Status</th>
		                    </tr>
		                  </thead>
		                  <tbody>
		                    {specialistPillarSimulatorRows.map(([label, sections, grade, blocks, hours, status]) => (
		                      <tr key={`specialist-pillar-simulator-${label}`} className="border-t border-slate-100 text-xs text-slate-600">
		                        <td className="px-3 py-3 font-bold text-slate-900">{label}</td>
		                        <td className="px-3 py-3 font-semibold">{sections}</td>
		                        <td className="px-3 py-3 font-semibold">{grade}</td>
		                        <td className="px-3 py-3">{blocks}</td>
		                        <td className="px-3 py-3">{hours}</td>
		                        <td className="px-3 py-3 font-bold text-[#4b254b]">{status}</td>
		                      </tr>
		                    ))}
		                  </tbody>
		                </table>
		              </div>
		              <div className="rounded-2xl border border-[#214B74]/15 bg-[#edf3f7] px-4 py-3 text-xs leading-relaxed text-slate-700">
		                With one section per grade, one full-time educator per specialist pillar remains
		                viable through Grade 5. With two sections per grade, each pillar reaches at least
		                32 weekly blocks, which triggers the need to double specialist capacity or redesign
		                the role. For Design Technologies / Learning Experience Designer, this refers to
		                the Learning Experience Designer's classroom-facing capacity, not a separate
		                specialist role.
		              </div>
		            </div>
		          </Card>
		        </div>

		        <Card title="Specialist Planning Table" icon={Layers}>
		          <div className="overflow-x-auto rounded-2xl border border-slate-100">
		            <table className="min-w-[980px] w-full text-left">
		              <thead>
		                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                  <th className="px-3 py-3">Area</th>
		                  <th className="px-3 py-3">Load signal</th>
		                  <th className="px-3 py-3">Lean planning premise</th>
		                  <th className="px-3 py-3">Balanced planning premise</th>
		                  <th className="px-3 py-3">Premium / Grade 6 planning premise</th>
		                </tr>
		              </thead>
		              <tbody>
		                {specialistLoadPremises.map(([area, signal, lean, balanced, premium]) => (
		                  <tr key={area} className="border-t border-slate-100 align-top text-xs text-slate-600">
		                    <td className="px-3 py-3 font-bold text-slate-900">{area}</td>
		                    <td className="px-3 py-3">{signal}</td>
		                    <td className="px-3 py-3">{lean}</td>
		                    <td className="px-3 py-3">{balanced}</td>
		                    <td className="px-3 py-3">{premium}</td>
		                  </tr>
		                ))}
		              </tbody>
		            </table>
		          </div>
		        </Card>

		        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.2fr]">
		          <Card title="Referência de Ecossistema Especialista" icon={Users}>
		            <div className="space-y-4">
		              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-slate-700">
		                A composição abaixo funciona como referência de arquitetura especialista observada
		                no ecossistema atual. Para Rio, os números devem ser tratados como premissas de
		                planejamento até validação de carga horária, espaços, escopo da oferta e
		                compartilhamento entre divisões.
		              </div>
		              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
		                A referência de São Paulo distribui Body & Movement entre 4 educadores, com
		                cargas entre 26 e 28 blocos semanais por educador. Isso reforça a premissa de
		                que a área deve ser planejada como ecossistema especialista compartilhado entre
		                divisões, não como FTE isolado.
		              </div>
		              <div className="overflow-x-auto rounded-2xl border border-slate-100">
		                <table className="min-w-[760px] w-full text-left">
		                  <thead>
		                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                      {["Educator", "EY", "LS", "MS", "HS", "Treino", "Total"].map((header) => (
		                        <th key={header} className="px-3 py-3">{header}</th>
		                      ))}
		                    </tr>
		                  </thead>
		                  <tbody>
		                    {bodyMovementReferenceLoads.map((row) => (
		                      <tr key={row[0]} className="border-t border-slate-100 text-xs text-slate-600">
		                        {row.map((cell, index) => (
		                          <td key={`${row[0]}-${index}`} className={cn("px-3 py-3", index === 0 && "font-bold text-slate-900", index === 6 && "font-bold text-slate-900")}>
		                            {cell}
		                          </td>
		                        ))}
		                      </tr>
		                    ))}
		                    <tr className="border-t border-slate-200 bg-slate-50 text-xs font-bold text-slate-900">
		                      {bodyMovementReferenceTotals.map((cell, index) => (
		                        <td key={`${cell}-${index}`} className="px-3 py-3">{cell}</td>
		                      ))}
		                    </tr>
		                  </tbody>
		                </table>
		              </div>
		              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-900">
		                107 total slots / 30 max slots per educator = 3.57, which operationally requires
		                4 educators. Lean Rio: 2 Body & Movement educators + 1 monitor. Expanded Rio:
		                3 Body & Movement educators. Full K-12 reference: 4 Body & Movement educators.
		              </div>
		              <div className="grid grid-cols-1 gap-3">
		                {currentSpecialistEcosystem.map(([area, names, count]) => (
		                  <div key={area} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
		                    <div className="text-xs font-bold text-slate-900">{area}</div>
		                    <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{names}</div>
		                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{count}</div>
		                  </div>
		                ))}
		              </div>
		              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-relaxed text-indigo-800">
		                These educators also support Middle School and High School. They should not be
		                double-counted as an EY/LS-only team plus a fully separate MS/HS team.
		              </div>
		              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600">
		                Esses especialistas também podem apoiar Middle School e High School. O modelo
		                não deve duplicar a equipe como se houvesse um time exclusivo de EY/LS e outro
		                time totalmente separado para MS/HS.
		              </div>
		              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold leading-relaxed text-emerald-800">
		                Shared specialist ecosystem + incremental secondary academic layer.
		                <br />
		                Ecossistema especialista compartilhado + camada acadêmica secundária incremental.
		              </div>
		            </div>
		          </Card>

			          <Card title="Lançamento Middle School: modelo instrucional por estágio" icon={Database}>
			            <div className="space-y-4">
			              <p className="text-sm leading-relaxed text-slate-600">
			                Operating detail for Scenario D: Grade 6 cluster launch, Grade 7 hybrid
			                specialization, and Grade 8 core-subject specialist model with program functions.
		              </p>
		              <div className="overflow-x-auto rounded-2xl border border-slate-100">
		                <table className="min-w-[720px] w-full text-left">
		                  <thead>
		                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                      <th className="px-3 py-3">Stage / function</th>
		                      <th className="px-3 py-3">Coverage</th>
		                      <th className="px-3 py-3">Operating premise</th>
		                    </tr>
		                  </thead>
		                  <tbody>
		                    {middleSchoolClusters.map(([cluster, coverage, premise]) => (
		                      <tr key={cluster} className="border-t border-slate-100 align-top text-xs text-slate-600">
		                        <td className="px-3 py-3 font-bold text-slate-900">{cluster}</td>
		                        <td className="px-3 py-3">{coverage}</td>
		                        <td className="px-3 py-3">{premise}</td>
		                      </tr>
		                    ))}
		                  </tbody>
		                </table>
		              </div>
		              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
		                {middleSchoolProgression.map(([grade, model]) => (
		                  <div key={grade} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
		                    <div className="text-xs font-bold text-slate-900">{grade}</div>
		                    <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{model}</div>
		                  </div>
		                ))}
		              </div>
		            </div>
		          </Card>
		        </div>

		        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
		          <Card title="Modelo de Mentoria" icon={Sparkles}>
		            <div className="space-y-4">
		              <div className="overflow-x-auto rounded-2xl border border-slate-100">
		                <table className="min-w-[640px] w-full text-left">
		                  <thead>
		                    <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                      <th className="px-3 py-3">Stage</th>
		                      <th className="px-3 py-3">Mentorship model</th>
		                    </tr>
		                  </thead>
		                  <tbody>
		                    {mentorshipProgression.map(([stage, model]) => (
		                      <tr key={stage} className="border-t border-slate-100 text-xs text-slate-600">
		                        <td className="px-3 py-3 font-bold text-slate-900">{stage}</td>
		                        <td className="px-3 py-3">{model}</td>
		                      </tr>
		                    ))}
		                  </tbody>
		                </table>
		              </div>
			              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-relaxed text-indigo-800">
			                Grade 6 starts with a coordinated project mentorship function, not an automatic
			                dedicated Project Mentor staffing commitment.
			              </div>
		            </div>
		          </Card>

		          <Card title="When Project Mentorship Support Needs Validation" icon={Target}>
		            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
		              {projectMentorTriggers.map((trigger) => (
		                <div key={trigger} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
		                  {trigger}
		                </div>
		              ))}
		            </div>
		          </Card>
		        </div>

		        <Card title="Três Caminhos de Estrutura" icon={Briefcase}>
		          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
		            {pathwayOptions.map((pathway) => (
		              <div
		                key={pathway.title}
		                className={cn(
		                  "flex h-full flex-col rounded-2xl border p-4",
		                  pathway.recommendation
		                    ? "border-slate-900 bg-slate-900 text-white"
		                    : "border-slate-200 bg-slate-50 text-slate-900"
		                )}
		              >
		                <div className="flex items-start justify-between gap-3">
		                  <div>
		                    <h4 className="text-base font-bold">{pathway.title}</h4>
		                    <p className={cn("mt-1 text-xs leading-relaxed", pathway.recommendation ? "text-slate-300" : "text-slate-500")}>
		                      {pathway.purpose}
		                    </p>
		                  </div>
		                  {pathway.recommendation && (
		                    <span className="rounded-full bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-900">
		                      Default
		                    </span>
		                  )}
		                </div>
		                <div className="mt-4">
			                  <div className={cn("text-[10px] font-bold uppercase tracking-widest", pathway.recommendation ? "text-slate-400" : "text-slate-400")}>
			                    Adult infrastructure stance
			                  </div>
		                  <ul className={cn("mt-2 space-y-1.5 text-xs leading-relaxed", pathway.recommendation ? "text-slate-300" : "text-slate-600")}>
		                    {pathway.structure.map((item) => (
		                      <li key={item} className="flex gap-2">
		                        <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", pathway.recommendation ? "bg-white" : "bg-slate-400")} />
		                        <span>{item}</span>
		                      </li>
		                    ))}
		                  </ul>
		                </div>
		                <div className="mt-4">
		                  <div className={cn("text-[10px] font-bold uppercase tracking-widest", pathway.recommendation ? "text-slate-400" : "text-slate-400")}>
		                    Best for
		                  </div>
		                  <div className="mt-2 flex flex-wrap gap-1.5">
		                    {pathway.bestFor.map((item) => (
		                      <span key={item} className={cn("rounded-full border px-2 py-1 text-[10px] font-bold", pathway.recommendation ? "border-white/20 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-600")}>
		                        {item}
		                      </span>
		                    ))}
		                  </div>
		                </div>
		                {pathway.risk && (
		                  <div className={cn("mt-4 rounded-2xl px-3 py-2 text-xs leading-relaxed", pathway.recommendation ? "bg-white/10 text-slate-300" : "bg-rose-50 text-slate-600")}>
		                    {pathway.risk}
		                  </div>
		                )}
		                {pathway.recommendation && (
		                  <div className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-xs font-bold text-white">
		                    {pathway.recommendation}
		                  </div>
		                )}
		              </div>
		            ))}
		          </div>
		        </Card>
		        </section>

		        <Card className="offer-scenarios-print-hidden offer-scenarios-print-page-break" title="Complete Scenario Matrix" icon={Database}>
		          <div className="overflow-x-auto rounded-2xl border border-slate-100">
		            <table className="min-w-[1380px] w-full text-left">
		              <thead>
		                <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                  {["Scenario", "Grade ceiling", "Target enrollment", "Modeled capacity", "Implied occupancy", "Strategic identity", "Classroom package", "Specialist ecosystem", "Signature programs", "Middle School logic", "Recommended pathway"].map((header) => (
		                    <th key={header} className="px-3 py-3">{header}</th>
		                  ))}
		                </tr>
		              </thead>
		              <tbody>
		                {scenarioMatrix.map((row) => (
		                  <tr key={row[0]} className="border-t border-slate-100 align-top text-xs text-slate-600">
		                    {row.map((cell, index) => (
		                      <td key={`${row[0]}-${index}`} className={cn("px-3 py-3", index === 0 && "font-bold text-slate-900")}>
		                        {cell}
		                      </td>
		                    ))}
		                  </tr>
		                ))}
		              </tbody>
		            </table>
		          </div>
		          <p className="mt-3 text-xs leading-relaxed text-slate-500">
		            Classroom package refers only to the adult structure inside the classroom. Broader support roles, including leadership, Learning Experience Design, counseling, academic support, and specialists, are treated separately in the support ecosystem layer.
		          </p>
		        </Card>

			        <Card
			          className="offer-scenarios-print-page-break"
			          title="Roadmap de Crescimento da Experiência, 2028–2037"
			          subtitle="Leitura pedagógica e estratégica da maturidade da experiência."
			          icon={CalendarDays}
			        >
			          <div className="space-y-4">
			            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs leading-relaxed text-indigo-800">
			              O roadmap mostra como a experiência do estudante amadurece ao longo da abertura
			              das séries. Ele organiza oferta, ecossistema adulto e infraestrutura pedagógica
			              esperada por ano.
			            </div>
		            <div className="offer-scenarios-roadmap-table overflow-x-auto rounded-2xl border border-slate-100">
		              <table className="min-w-[1180px] w-full text-left">
		                <thead>
		                  <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
		                    {["Year", "Experience stage", "Grade ceiling", "Student experience growth", "Adult ecosystem implication"].map((header) => (
		                      <th key={header} className="px-3 py-3">{header}</th>
		                    ))}
		                  </tr>
		                </thead>
		                <tbody>
		                  {experienceGrowthRoadmap.map((row) => (
		                    <tr key={row.year} className="border-t border-slate-100 align-top text-xs text-slate-600">
		                      <td className="px-3 py-3 font-black text-slate-900">{row.year}</td>
		                      <td className="px-3 py-3 font-bold text-slate-900">{row.stage}</td>
		                      <td className="px-3 py-3 font-semibold">{row.ceiling}</td>
		                      <td className="px-3 py-3 leading-relaxed">{row.experience}</td>
		                      <td className="px-3 py-3 leading-relaxed">{row.ecosystem}</td>
		                    </tr>
		                  ))}
		                </tbody>
		              </table>
		            </div>
		            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
		              {[
			                ["2028-2030", "Foundation and readiness", "MAP begins in Grade 1, LS progression becomes visible, and Grade 5 Pathways classes begin."],
			                ["2031-2033", "Middle School identity", "Grade 6 launches Creative Hub and MUN, Grade 7 begins PSAT mock, and Grade 8 begins college readiness testing."],
			                ["2034-2037", "High School pathway maturity", "Grade 9 begins College Counseling and AP classes, then expands credentials, internships, capstones, and university-facing evidence."],
		              ].map(([period, label, detail]) => (
		                <div key={period} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
		                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{period}</div>
		                  <div className="mt-1 text-sm font-bold text-slate-900">{label}</div>
		                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{detail}</p>
		                </div>
		              ))}
		            </div>
		          </div>
		        </Card>

		        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white">
		          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
		            Board-ready synthesis
		          </div>
		          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
		            {synthesisStatements.map((statement, index) => (
		              <div key={statement} className="rounded-2xl border border-white/10 bg-white/5 p-4">
		                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
		                  Point {index + 1}
		                </div>
		                <p className="mt-2 text-sm leading-relaxed text-slate-200">{statement}</p>
		              </div>
		            ))}
		          </div>
		        </div>
		        </div>
		      </section>
      </div>
    </>
  );
}
