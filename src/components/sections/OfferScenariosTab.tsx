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
import { useLocale } from "../../i18n/useLocale";

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
type SpecialistFinalGrade = "Grade 3" | "Grade 4" | "Grade 5" | "Grade 6";
type SpecialistSectionsPerGrade = 1 | 2;
type SpecialistBlocksPerGrade = 1 | 2;
type SpecialistBlockDuration = 45 | 50;
type SpecialistCapacityThreshold = 24 | 26 | 30;

export default function OfferScenariosTab() {
  const { t } = useLocale();

  // Semantic ID / display-label separation (Phase V10-X2T.3A): these keys are
  // the raw stable identifiers still used for React state, .find()/.indexOf()
  // comparisons, map keys, and CSS-class lookups elsewhere in this file. Only
  // the rendered label is localized here — the underlying data value is
  // never mutated.
  const offerLabel: Record<string, string> = {
    "Scenario A": t("offerScenarioATitle"),
    "Scenario B": t("offerScenarioBTitle"),
    "Scenario C": t("offerScenarioCTitle"),
    "Scenario D": t("offerScenarioDTitle"),
    "Grade 3": t("offerSpecialistFinalGradeOption1"),
    "Grade 4": t("offerSpecialistFinalGradeOption2"),
    "Grade 5": t("offerSpecialistFinalGradeOption3"),
    "Grade 6": t("offerSpecialistFinalGradeOption4"),
    "Early Years": t("offerDivisionEarlyYearsLabel"),
    "Lower School": t("offerDivisionLowerSchoolLabel"),
    "Middle School": t("offerDivisionMiddleSchoolLabel"),
    "High School, future stage": t("offerDivisionHighSchoolLabel"),
    "Classroom ownership": t("offerMinAcademicOpsSystemClassroomOwnership"),
    "Classroom package": t("offerMinAcademicOpsSystemClassroomPackage"),
    "Specialist access": t("offerMinAcademicOpsSystemSpecialistAccess"),
    "Academic performance and language acquisition": t("offerMinAcademicOpsSystemAcademicPerformanceLanguageAcquisition"),
    "Curriculum and assessment coherence": t("offerMinAcademicOpsSystemCurriculumAssessmentCoherence"),
    "Documentation and portfolio": t("offerMinAcademicOpsSystemDocumentationPortfolio"),
    "Signature program routines": t("offerMinAcademicOpsSystemSignatureProgramRoutines"),
    "Divisional leadership and coaching": t("offerMinAcademicOpsSystemDivisionalLeadershipCoaching"),
    "Baseline control": t("offerBudgetSharedRowLeadershipStatus"),
    "Mapping validation": t("offerBudgetSharedRowAfterSchoolRoleMappingStatus"),
    "Not active": t("offerBudgetScenarioCRowPassionProjectsStatus"),
    "Potential increment": t("offerBudgetScenarioARowLapCoachStatus"),
    "Scenario driver": t("offerBudgetScenarioCRowFullClassPdjStatus"),
    "Conditional increment": t("offerBudgetScenarioDRowDedicatedProjectMentorStatus"),
    "Estrutura básica": t("offerEcosystemClassroomRowScenarioAStatus"),
    "Estrutura básica fortalecida": t("offerEcosystemClassroomRowScenarioBStatus"),
    "Preparação ativa": t("offerEcosystemClassroomRowScenarioCStatus"),
    "Mudança de modelo": t("offerEcosystemClassroomRowScenarioDStatus"),
    "Investimento recomendado": t("offerEcosystemAcademicLanguageRowScenarioAStatus"),
    "Necessário para transição": t("offerEcosystemAcademicLanguageRowScenarioCStatus"),
    "Necessário": t("offerEcosystemAcademicLanguageRowScenarioDStatus"),
    "Capacidade compartilhada": t("offerEcosystemSpecialistsRowScenarioAStatus"),
    "Capacidade compartilhada fortalecida": t("offerEcosystemSpecialistsRowScenarioBStatus"),
    "Continuidade LS completa": t("offerEcosystemSpecialistsRowScenarioCStatus"),
    "Capacidade compartilhada EY/LS/MS": t("offerEcosystemSpecialistsRowScenarioDStatus"),
    "Progressão acadêmica": t("offerEcosystemSignatureRowScenarioBStatus"),
    "Ativo": t("offerEcosystemSignatureRowScenarioCStatus"),
    "Ativo + add-on potencial": t("offerEcosystemSignatureRowScenarioDStatus"),
    "Não ativo": t("offerEcosystemMsHsRowScenarioAStatus"),
    "Preparação cultural": t("offerEcosystemMsHsRowScenarioBStatus"),
    "Ponte formal": t("offerEcosystemMsHsRowScenarioCStatus"),
    "Add-on potencial": t("offerEcosystemBudgetRowScenarioAStatus"),
  };

  // Numeric source-of-truth for target enrollment / modeled capacity, keyed
  // by the stable "Scenario A"-"D" id. The `targetEnrollment`/`modeledCapacity`
  // data fields stay locale-invariant English literals (e.g. "228 learners");
  // these maps let the UI render a localized "228 alunos" without parsing or
  // mutating that data string.
  const offerEnrollmentCount: Record<string, number> = {
    "Scenario A": 228,
    "Scenario B": 258,
    "Scenario C": 288,
    "Scenario D": 318,
  };
  const offerCapacityCount: Record<string, number> = {
    "Scenario A": 302,
    "Scenario B": 348,
    "Scenario C": 390,
    "Scenario D": 440,
  };

const offerScenarioViews: Array<{ id: OfferScenarioView; label: string }> = [
  { id: "brief", label: t("offerViewBriefLabel") },
  { id: "ladder", label: t("offerViewLadderLabel") },
  { id: "scenario", label: t("offerViewScenarioLabel") },
  { id: "budget", label: t("offerViewBudgetLabel") },
  { id: "architecture", label: t("offerViewArchitectureLabel") },
  { id: "appendix", label: t("offerViewAppendixLabel") },
];

const OFFER_SCENARIO_GOVERNANCE_BOUNDARY =
  t("offerGovernanceBoundary");

// ─────────────────────────────────────────────────────────────────────────────
// OFFER SCENARIOS TAB — board-facing scenario architecture only
// ─────────────────────────────────────────────────────────────────────────────

const pedagogicalOfferScenarios = [
{
title: "Scenario A",
gradeCeiling: t("offerScenarioAGradeCeiling"),
targetEnrollment: "228 learners",
modeledCapacity: "302 learners",
impliedOccupancy: "75.5%",
strategicIdentity: t("offerScenarioAStrategicIdentity"),
offerStage: t("offerScenarioAOfferStage"),
classroomPackage: [
t("offerScenarioAClassroomPackage1"),
t("offerScenarioAClassroomPackage2"),
t("offerScenarioAClassroomPackage3"),
],
specialistEcosystem: [
t("offerScenarioASpecialistEcosystem1"),
],
signaturePrograms: [
t("offerScenarioASignaturePrograms1"),
t("offerScenarioASignaturePrograms2"),
t("offerScenarioASignaturePrograms3"),
],
notActiveYet: [
t("offerScenarioANotActiveYet1"),
t("offerScenarioANotActiveYet2"),
t("offerScenarioANotActiveYet3"),
t("offerScenarioANotActiveYet4"),
t("offerScenarioANotActiveYet5"),
],
middleSchoolLogic: t("offerScenarioAMiddleSchoolLogic"),
recommendedPathway: t("offerScenarioARecommendedPathway"),
roles: [
t("offerScenarioARoles1"),
t("offerScenarioARoles2"),
t("offerScenarioARoles3"),
t("offerScenarioARoles4"),
],
risk:
t("offerScenarioARisk"),
boardSentence:
t("offerScenarioABoardSentence"),
tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
},
{
title: "Scenario B",
gradeCeiling: t("offerScenarioBGradeCeiling"),
targetEnrollment: "258 learners",
modeledCapacity: "348 learners",
impliedOccupancy: "74.1%",
strategicIdentity: t("offerScenarioBStrategicIdentity"),
offerStage: t("offerScenarioBOfferStage"),
classroomPackage: [
t("offerScenarioBClassroomPackage1"),
t("offerScenarioBClassroomPackage2"),
t("offerScenarioBClassroomPackage3"),
],
specialistEcosystem: [
t("offerScenarioBSpecialistEcosystem1"),
],
signaturePrograms: [
t("offerScenarioBSignaturePrograms1"),
t("offerScenarioBSignaturePrograms2"),
t("offerScenarioBSignaturePrograms3"),
t("offerScenarioBSignaturePrograms4"),
],
notActiveYet: [
t("offerScenarioBNotActiveYet1"),
t("offerScenarioBNotActiveYet2"),
t("offerScenarioBNotActiveYet3"),
t("offerScenarioBNotActiveYet4"),
t("offerScenarioBNotActiveYet5"),
],
middleSchoolLogic: t("offerScenarioBMiddleSchoolLogic"),
recommendedPathway: t("offerScenarioBRecommendedPathway"),
roles: [
t("offerScenarioBRoles1"),
t("offerScenarioBRoles2"),
t("offerScenarioBRoles3"),
t("offerScenarioBRoles4"),
],
risk:
t("offerScenarioBRisk"),
boardSentence:
t("offerScenarioBBoardSentence"),
tone: "border-blue-200 bg-blue-50 text-blue-700",
},
{
title: "Scenario C",
gradeCeiling: t("offerScenarioCGradeCeiling"),
targetEnrollment: "288 learners",
modeledCapacity: "390 learners",
impliedOccupancy: "73.8%",
strategicIdentity: t("offerScenarioCStrategicIdentity"),
offerStage: t("offerScenarioCOfferStage"),
classroomPackage: [
t("offerScenarioCClassroomPackage1"),
t("offerScenarioCClassroomPackage2"),
t("offerScenarioCClassroomPackage3"),
],
specialistEcosystem: [
t("offerScenarioCSpecialistEcosystem1"),
],
signaturePrograms: [
t("offerScenarioCSignaturePrograms1"),
t("offerScenarioCSignaturePrograms2"),
t("offerScenarioCSignaturePrograms3"),
t("offerScenarioCSignaturePrograms4"),
],
notActiveYet: [
t("offerScenarioCNotActiveYet1"),
t("offerScenarioCNotActiveYet2"),
t("offerScenarioCNotActiveYet3"),
t("offerScenarioCNotActiveYet4"),
t("offerScenarioCNotActiveYet5"),
],
middleSchoolLogic: t("offerScenarioCMiddleSchoolLogic"),
recommendedPathway: t("offerScenarioCRecommendedPathway"),
roles: [
t("offerScenarioCRoles1"),
t("offerScenarioCRoles2"),
t("offerScenarioCRoles3"),
t("offerScenarioCRoles4"),
t("offerScenarioCRoles5"),
],
risk:
t("offerScenarioCRisk"),
boardSentence:
t("offerScenarioCBoardSentence"),
tone: "border-indigo-200 bg-indigo-50 text-indigo-700",
},
{
title: "Scenario D",
gradeCeiling: t("offerScenarioDGradeCeiling"),
targetEnrollment: "318 learners",
modeledCapacity: "440 learners",
impliedOccupancy: "72.3%",
strategicIdentity: t("offerScenarioDStrategicIdentity"),
offerStage: t("offerScenarioDOfferStage"),
mainClaim: t("offerScenarioDMainClaim"),
offerActivated: [
t("offerScenarioDOfferActivated1"),
t("offerScenarioDOfferActivated2"),
t("offerScenarioDOfferActivated3"),
t("offerScenarioDOfferActivated4"),
t("offerScenarioDOfferActivated5"),
t("offerScenarioDOfferActivated6"),
t("offerScenarioDOfferActivated7"),
t("offerScenarioDOfferActivated8"),
t("offerScenarioDOfferActivated9"),
t("offerScenarioDOfferActivated10"),
t("offerScenarioDOfferActivated11"),
],
classroomPackage: [
t("offerScenarioDClassroomPackage1"),
t("offerScenarioDClassroomPackage2"),
t("offerScenarioDClassroomPackage3"),
],
grade6ClusterModel: [
t("offerScenarioDGrade6ClusterModel1"),
t("offerScenarioDGrade6ClusterModel2"),
t("offerScenarioDGrade6ClusterModel3"),
t("offerScenarioDGrade6ClusterModel4"),
],
specialistEcosystem: [
t("offerScenarioDSpecialistEcosystem1"),
],
signaturePrograms: [
t("offerScenarioDSignaturePrograms1"),
t("offerScenarioDSignaturePrograms2"),
t("offerScenarioDSignaturePrograms3"),
t("offerScenarioDSignaturePrograms4"),
t("offerScenarioDSignaturePrograms5"),
],
notActiveYet: [
t("offerScenarioDNotActiveYet1"),
t("offerScenarioDNotActiveYet2"),
t("offerScenarioDNotActiveYet3"),
],
middleSchoolLogic: t("offerScenarioDMiddleSchoolLogic"),
recommendedPathway: t("offerScenarioDRecommendedPathway"),
roles: [
t("offerScenarioDRoles1"),
t("offerScenarioDRoles2"),
t("offerScenarioDRoles3"),
t("offerScenarioDRoles4"),
t("offerScenarioDRoles5"),
],
risk:
t("offerScenarioDRisk"),
boardSentence:
t("offerScenarioDBoardSentence"),
tone: "border-purple-200 bg-purple-50 text-purple-700",
},
		  ];

const bodyMovementLoads = [
[t("offerBodyMovementLoadScenarioALabel"), t("offerBodyMovementLoadScenarioABlocks"), t("offerBodyMovementLoadScenarioAPremise")],
[t("offerBodyMovementLoadScenarioBLabel"), t("offerBodyMovementLoadScenarioBBlocks"), t("offerBodyMovementLoadScenarioBPremise")],
[t("offerBodyMovementLoadScenarioCLabel"), t("offerBodyMovementLoadScenarioCBlocks"), t("offerBodyMovementLoadScenarioCPremise")],
[t("offerBodyMovementLoadScenarioDLabel"), t("offerBodyMovementLoadScenarioDBlocks"), t("offerBodyMovementLoadScenarioDPremise")],
		  ];

const specialistLoadPremises = [
["Body & Movement", t("offerSpecialistLoadBodyMovementSignal"), t("offerSpecialistLoadBodyMovementLean"), t("offerSpecialistLoadBodyMovementBalanced"), t("offerSpecialistLoadBodyMovementPremium")],
["Sound Exploration / Music", t("offerSpecialistLoadSoundExplorationSignal"), t("offerSpecialistLoadSoundExplorationLean"), t("offerSpecialistLoadSoundExplorationBalanced"), t("offerSpecialistLoadSoundExplorationPremium")],
["Artistic Design", t("offerSpecialistLoadArtisticDesignSignal"), t("offerSpecialistLoadArtisticDesignLean"), t("offerSpecialistLoadArtisticDesignBalanced"), t("offerSpecialistLoadArtisticDesignPremium")],
["Performing Arts", t("offerSpecialistLoadPerformingArtsSignal"), t("offerSpecialistLoadPerformingArtsLean"), t("offerSpecialistLoadPerformingArtsBalanced"), t("offerSpecialistLoadPerformingArtsPremium")],
["Design Technologies", t("offerSpecialistLoadDesignTechnologiesSignal"), t("offerSpecialistLoadDesignTechnologiesLean"), t("offerSpecialistLoadDesignTechnologiesBalanced"), t("offerSpecialistLoadDesignTechnologiesPremium")],
[t("offerScenarioANotActiveYet2"), t("offerSpecialistLoadCreativeHubSignal"), t("offerSpecialistLoadCreativeHubLean"), t("offerSpecialistLoadCreativeHubBalanced"), t("offerSpecialistLoadCreativeHubPremium")],
		  ];

const specialistBudgetImplications: Record<string, string> = {
"Body & Movement": t("offerSpecialistBudgetRiskBodyMovement"),
"Sound Exploration / Music": t("offerSpecialistBudgetRiskSoundExploration"),
"Artistic Design": t("offerSpecialistBudgetRiskArtisticDesign"),
"Performing Arts": t("offerSpecialistBudgetRiskPerformingArts"),
"Design Technologies": t("offerSpecialistBudgetRiskDesignTechnologies"),
"Creative Hub": t("offerSpecialistBudgetRiskCreativeHub"),
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
[t("offerSpecialistPillarSimulatorRow1Stage"), t("offerSpecialistPillarSimulatorRow1Sections"), t("offerSpecialistPillarSimulatorRow1FinalGrade"), t("offerSpecialistPillarSimulatorRow1Blocks"), t("offerSpecialistPillarSimulatorRow1Hours"), t("offerSpecialistPillarSimulatorRow1Status")],
[t("offerSpecialistPillarSimulatorRow2Stage"), t("offerSpecialistPillarSimulatorRow2Sections"), t("offerSpecialistPillarSimulatorRow2FinalGrade"), t("offerSpecialistPillarSimulatorRow2Blocks"), t("offerSpecialistPillarSimulatorRow2Hours"), t("offerSpecialistPillarSimulatorRow2Status")],
[t("offerSpecialistPillarSimulatorRow3Stage"), t("offerSpecialistPillarSimulatorRow3Sections"), t("offerSpecialistPillarSimulatorRow3FinalGrade"), t("offerSpecialistPillarSimulatorRow3Blocks"), t("offerSpecialistPillarSimulatorRow3Hours"), t("offerSpecialistPillarSimulatorRow3Status")],
[t("offerSpecialistPillarSimulatorRow4Stage"), t("offerSpecialistPillarSimulatorRow4Sections"), t("offerSpecialistPillarSimulatorRow4FinalGrade"), t("offerSpecialistPillarSimulatorRow4Blocks"), t("offerSpecialistPillarSimulatorRow4Hours"), t("offerSpecialistPillarSimulatorRow4Status")],
];

const currentSpecialistEcosystem = [
["Body & Movement", "Marcello Humeniuk, Maíra Jardim, Felipe Pierrobon, Kirk Barros", t("offerCurrentSpecialistBodyMovementPremise")],
["Sound Exploration / Music", "Igor, Bianca", t("offerCurrentSpecialistSoundExplorationPremise")],
["Artistic Design / Atelier", "Alexandre, Ariádine, Marcio, Lívia", t("offerCurrentSpecialistArtisticDesignPremise")],
["Performing Arts", t("offerCurrentSpecialistPerformingArtsNames"), t("offerCurrentSpecialistPerformingArtsPremise")],
["Design Technologies / Learning Experience Designer capacity", "Babi, Duda, Larissa, Juliana, Iris", t("offerCurrentSpecialistDesignTechnologiesPremise")],
[t("offerCurrentSpecialistTotalRowLabel"), t("offerCurrentSpecialistTotalRowNames"), t("offerCurrentSpecialistTotalRowPremise")],
		  ];

const bodyMovementReferenceLoads = [
["Marcello Humeniuk", "25", "2", "-", "-", "-", "27"],
["Maíra Jardim", "2", "18", "-", "6", "-", "26"],
["Felipe Pierrobon", "-", "18", "-", "8", "-", "26"],
["Kirk Barros", "-", "-", "20", "6", "2", "28"],
		  ];

const bodyMovementReferenceTotals = [t("offerBodyMovementReferenceTotalsLabel"), "27", "38", "20", "20", "2", "107"];

const middleSchoolClusters = [
[t("offerMiddleSchoolClusterSTEMName"), t("offerMiddleSchoolClusterSTEMDescription"), t("offerMiddleSchoolClusterSTEMNote")],
[t("offerMiddleSchoolClusterHybridName"), t("offerMiddleSchoolClusterHybridDescription"), t("offerMiddleSchoolClusterHybridNote")],
[t("offerMiddleSchoolClusterHumanitiesName"), t("offerMiddleSchoolClusterHumanitiesDescription"), t("offerMiddleSchoolClusterHumanitiesNote")],
[t("offerMiddleSchoolClusterELAGlobalName"), t("offerMiddleSchoolClusterELAGlobalDescription"), t("offerMiddleSchoolClusterELAGlobalNote")],
[t("offerMiddleSchoolClusterSharedEcosystemName"), t("offerMiddleSchoolClusterSharedEcosystemDescription"), t("offerMiddleSchoolClusterSharedEcosystemNote")],
[t("offerMiddleSchoolClusterGrade8TransitionName"), t("offerMiddleSchoolClusterGrade8TransitionDescription"), t("offerMiddleSchoolClusterGrade8TransitionNote")],
		  ];

const middleSchoolProgression = [
[t("offerMiddleSchoolProgressionGrade6Label"), t("offerMiddleSchoolProgressionGrade6Description")],
[t("offerMiddleSchoolProgressionGrade7Label"), t("offerMiddleSchoolProgressionGrade7Description")],
[t("offerMiddleSchoolProgressionGrade8Label"), t("offerMiddleSchoolProgressionGrade8Description")],
[t("offerMiddleSchoolProgressionGrades9to12Label"), t("offerMiddleSchoolProgressionGrades9to12Description")],
		  ];

const mentorshipProgression = [
[t("offerMentorshipProgressionUpToGrade5Label"), t("offerMentorshipProgressionUpToGrade5Description")],
[t("offerMentorshipProgressionGrade6Label"), t("offerMentorshipProgressionGrade6Description")],
[t("offerMentorshipProgressionGrade7Label"), t("offerMentorshipProgressionGrade7Description")],
[t("offerMentorshipProgressionGrade8Label"), t("offerMentorshipProgressionGrade8Description")],
[t("offerMentorshipProgressionHighSchoolLabel"), t("offerMentorshipProgressionHighSchoolDescription")],
		  ];

const projectMentorTriggers = [
t("offerProjectMentorTrigger1"),
t("offerProjectMentorTrigger2"),
t("offerProjectMentorTrigger3"),
t("offerProjectMentorTrigger4"),
t("offerProjectMentorTrigger5"),
t("offerProjectMentorTrigger6"),
		  ];

const pathwayOptions = [
{
title: t("offerPathwayLeanTitle"),
purpose: t("offerPathwayLeanPurpose"),
structure: [
t("offerPathwayLeanStructure1"),
t("offerPathwayLeanStructure2"),
t("offerPathwayLeanStructure3"),
t("offerPathwayLeanStructure4"),
],
bestFor: [t("offerPathwayLeanBestFor1"), t("offerPathwayLeanBestFor2"), t("offerPathwayLeanBestFor3"), t("offerPathwayLeanBestFor4")],
risk:
t("offerPathwayLeanRisk"),
},
{
title: t("offerPathwayBalancedTitle"),
purpose: t("offerPathwayBalancedPurpose"),
structure: [
t("offerPathwayBalancedStructure1"),
t("offerPathwayBalancedStructure2"),
t("offerPathwayBalancedStructure3"),
t("offerPathwayBalancedStructure4"),
],
bestFor: [t("offerPathwayBalancedBestFor1"), t("offerPathwayBalancedBestFor2"), t("offerPathwayBalancedBestFor3"), t("offerPathwayBalancedBestFor4")],
risk: t("offerPathwayBalancedRisk"),
recommendation: t("offerPathwayBalancedRecommendation"),
},
{
title: t("offerPathwayPremiumTitle"),
purpose: t("offerPathwayPremiumPurpose"),
structure: [
t("offerPathwayPremiumStructure1"),
t("offerPathwayPremiumStructure2"),
t("offerPathwayPremiumStructure3"),
t("offerPathwayPremiumStructure4"),
],
bestFor: [t("offerPathwayPremiumBestFor1"), t("offerPathwayPremiumBestFor2"), t("offerPathwayPremiumBestFor3"), t("offerPathwayPremiumBestFor4")],
risk: t("offerPathwayPremiumRisk"),
},
		  ];

const scenarioMatrix = [
[t("capitalComparisonPanelScenarioALabel"), t("offerScenarioMatrixRowAGradeCeiling"), "228", "302", "75.5%", t("offerScenarioMatrixRowAStrategicIdentity"), t("offerScenarioMatrixRowAClassroomPackageSummary"), t("offerScenarioMatrixRowASpecialistSummary"), t("offerScenarioMatrixRowASignatureProgramsSummary"), t("offerScenarioMatrixRowAMiddleSchoolLogic"), t("offerScenarioMatrixRowARecommendedPathway")],
[t("capitalComparisonPanelScenarioBLabel"), t("offerScenarioMatrixRowBGradeCeiling"), "258", "348", "74.1%", t("offerScenarioMatrixRowBStrategicIdentity"), t("offerScenarioMatrixRowBClassroomPackageSummary"), t("offerScenarioMatrixRowBSpecialistSummary"), t("offerScenarioMatrixRowBSignatureProgramsSummary"), t("offerScenarioMatrixRowBMiddleSchoolLogic"), t("offerScenarioMatrixRowBRecommendedPathway")],
[t("offerScenarioCTitle"), t("offerScenarioMatrixRowCGradeCeiling"), "288", "390", "73.8%", t("offerScenarioMatrixRowCStrategicIdentity"), t("offerScenarioMatrixRowCClassroomPackageSummary"), t("offerScenarioMatrixRowCSpecialistSummary"), t("offerScenarioMatrixRowCSignatureProgramsSummary"), t("offerScenarioMatrixRowCMiddleSchoolLogic"), t("offerScenarioMatrixRowCRecommendedPathway")],
[t("offerScenarioDTitle"), t("offerScenarioMatrixRowDGradeCeiling"), "318", "440", "72.3%", t("offerScenarioMatrixRowDStrategicIdentity"), t("offerScenarioMatrixRowDClassroomPackageSummary"), t("offerScenarioMatrixRowDSpecialistSummary"), t("offerScenarioMatrixRowDSignatureProgramsSummary"), t("offerScenarioMatrixRowDMiddleSchoolLogic"), t("offerScenarioMatrixRowDRecommendedPathway")],
		  ];

const experienceGrowthRoadmap = [
{
year: "2028",
stage: t("offerRoadmap2028Stage"),
ceiling: t("offerRoadmap2028Ceiling"),
experience: t("offerRoadmap2028Experience"),
ecosystem: t("offerRoadmap2028Ecosystem"),
},
{
year: "2029",
stage: t("offerRoadmap2029Stage"),
ceiling: t("offerRoadmap2029Ceiling"),
experience: t("offerRoadmap2029Experience"),
ecosystem: t("offerRoadmap2029Ecosystem"),
},
{
year: "2030",
stage: t("offerRoadmap2030Stage"),
ceiling: t("offerRoadmap2030Ceiling"),
experience: t("offerRoadmap2030Experience"),
ecosystem: t("offerRoadmap2030Ecosystem"),
},
{
year: "2031",
stage: t("offerRoadmap2031Stage"),
ceiling: t("offerRoadmap2031Ceiling"),
experience: t("offerRoadmap2031Experience"),
ecosystem: t("offerRoadmap2031Ecosystem"),
},
{
year: "2032",
stage: t("offerRoadmap2032Stage"),
ceiling: t("offerRoadmap2032Ceiling"),
experience: t("offerRoadmap2032Experience"),
ecosystem: t("offerRoadmap2032Ecosystem"),
},
{
year: "2033",
stage: t("offerRoadmap2033Stage"),
ceiling: t("offerRoadmap2033Ceiling"),
experience: t("offerRoadmap2033Experience"),
ecosystem: t("offerRoadmap2033Ecosystem"),
},
{
year: "2034",
stage: t("offerRoadmap2034Stage"),
ceiling: t("offerRoadmap2034Ceiling"),
experience: t("offerRoadmap2034Experience"),
ecosystem: t("offerRoadmap2034Ecosystem"),
},
{
year: "2035",
stage: t("offerRoadmap2035Stage"),
ceiling: t("offerRoadmap2035Ceiling"),
experience: t("offerRoadmap2035Experience"),
ecosystem: t("offerRoadmap2035Ecosystem"),
},
{
year: "2036",
stage: t("offerRoadmap2036Stage"),
ceiling: t("offerRoadmap2036Ceiling"),
experience: t("offerRoadmap2036Experience"),
ecosystem: t("offerRoadmap2036Ecosystem"),
},
{
year: "2037",
stage: t("offerRoadmap2037Stage"),
ceiling: t("offerRoadmap2037Ceiling"),
experience: t("offerRoadmap2037Experience"),
ecosystem: t("offerRoadmap2037Ecosystem"),
},
		  ];

const synthesisStatements = [
t("offerSynthesisStatement1"),
t("offerSynthesisStatement2"),
t("offerSynthesisStatement3"),
t("offerSynthesisStatement4"),
];

const baselineDivisionArchitecture = [
{
division: "Early Years",
tone: "border-emerald-100 bg-emerald-50",
composition: [
t("offerDivisionEarlyYearsComposition1"),
t("offerDivisionEarlyYearsComposition2"),
t("offerDivisionEarlyYearsComposition3"),
t("offerDivisionEarlyYearsComposition4"),
],
minimum: [
t("offerDivisionEarlyYearsMinimum1"),
t("offerDivisionEarlyYearsMinimum2"),
t("offerDivisionEarlyYearsMinimum3"),
t("offerDivisionEarlyYearsMinimum4"),
t("offerDivisionEarlyYearsMinimum5"),
t("offerDivisionEarlyYearsMinimum6"),
t("offerDivisionEarlyYearsMinimum7"),
],
inactive: [
t("offerDivisionEarlyYearsInactive1"),
t("offerDivisionEarlyYearsInactive2"),
t("offerDivisionEarlyYearsInactive3"),
t("offerDivisionEarlyYearsInactive4"),
],
activation: t("offerDivisionEarlyYearsActivation"),
},
{
division: "Lower School",
tone: "border-blue-100 bg-blue-50",
composition: [
t("offerDivisionLowerSchoolComposition1"),
t("offerDivisionLowerSchoolComposition2"),
t("offerDivisionLowerSchoolComposition3"),
t("offerDivisionLowerSchoolComposition4"),
],
minimum: [
t("offerDivisionLowerSchoolMinimum1"),
t("offerDivisionLowerSchoolMinimum2"),
t("offerDivisionLowerSchoolMinimum3"),
t("offerDivisionLowerSchoolMinimum4"),
t("offerDivisionLowerSchoolMinimum5"),
t("offerDivisionLowerSchoolMinimum6"),
t("offerDivisionLowerSchoolMinimum7"),
t("offerDivisionLowerSchoolMinimum8"),
t("offerDivisionLowerSchoolMinimum9"),
],
inactive: [
t("offerDivisionLowerSchoolInactive1"),
t("offerDivisionLowerSchoolInactive2"),
t("offerDivisionLowerSchoolInactive3"),
t("offerDivisionLowerSchoolInactive4"),
t("offerDivisionLowerSchoolInactive5"),
t("offerDivisionLowerSchoolInactive6"),
],
activation:
t("offerDivisionLowerSchoolActivation"),
},
{
division: "Middle School",
tone: "border-purple-100 bg-purple-50",
composition: [
t("offerDivisionMiddleSchoolComposition1"),
t("offerDivisionMiddleSchoolComposition2"),
t("offerDivisionMiddleSchoolComposition3"),
t("offerDivisionMiddleSchoolComposition4"),
t("offerDivisionMiddleSchoolComposition5"),
t("offerDivisionMiddleSchoolComposition6"),
t("offerDivisionMiddleSchoolComposition7"),
t("offerDivisionMiddleSchoolComposition8"),
t("offerDivisionMiddleSchoolComposition9"),
],
minimum: [
t("offerDivisionMiddleSchoolMinimum1"),
t("offerDivisionMiddleSchoolMinimum2"),
t("offerDivisionMiddleSchoolMinimum3"),
t("offerDivisionMiddleSchoolMinimum4"),
t("offerDivisionMiddleSchoolMinimum5"),
t("offerDivisionMiddleSchoolMinimum6"),
t("offerDivisionMiddleSchoolMinimum7"),
t("offerDivisionMiddleSchoolMinimum8"),
t("offerDivisionMiddleSchoolMinimum9"),
],
inactive: [
t("offerDivisionMiddleSchoolInactive1"),
t("offerDivisionMiddleSchoolInactive2"),
t("offerDivisionMiddleSchoolInactive3"),
],
activation:
t("offerDivisionMiddleSchoolActivation"),
},
{
division: "High School, future stage",
tone: "border-slate-200 bg-slate-50",
composition: [
t("offerDivisionHighSchoolComposition1"),
t("offerDivisionHighSchoolComposition2"),
t("offerDivisionHighSchoolComposition3"),
t("offerDivisionHighSchoolComposition4"),
t("offerDivisionHighSchoolComposition5"),
t("offerDivisionHighSchoolComposition6"),
],
minimum: [
t("offerDivisionHighSchoolMinimum1"),
t("offerDivisionHighSchoolMinimum2"),
t("offerDivisionHighSchoolMinimum3"),
t("offerDivisionHighSchoolMinimum4"),
t("offerDivisionHighSchoolMinimum5"),
t("offerDivisionHighSchoolMinimum6"),
t("offerDivisionHighSchoolMinimum7"),
],
inactive: [
t("offerDivisionHighSchoolInactive1"),
t("offerDivisionHighSchoolInactive2"),
t("offerDivisionHighSchoolInactive3"),
],
activation:
t("offerDivisionHighSchoolActivation"),
},
];

const baselineEnxovalPackages = [
{
title: t("offerEnxovalEarlyYearsTitle"),
items: [
t("offerEnxovalEarlyYearsItem1"),
t("offerEnxovalEarlyYearsItem2"),
t("offerEnxovalEarlyYearsItem3"),
t("offerEnxovalEarlyYearsItem4"),
t("offerEnxovalEarlyYearsItem5"),
t("offerEnxovalEarlyYearsItem6"),
t("offerEnxovalEarlyYearsItem7"),
t("offerEnxovalEarlyYearsItem8"),
],
},
{
title: t("offerEnxovalLowerSchoolTitle"),
items: [
t("offerEnxovalLowerSchoolItem1"),
t("offerEnxovalLowerSchoolItem2"),
t("offerEnxovalLowerSchoolItem3"),
t("offerEnxovalLowerSchoolItem4"),
t("offerEnxovalLowerSchoolItem5"),
t("offerEnxovalLowerSchoolItem6"),
t("offerEnxovalLowerSchoolItem7"),
t("offerEnxovalLowerSchoolItem8"),
t("offerEnxovalLowerSchoolItem9"),
],
},
{
title: t("offerEnxovalGrade6ClusterTitle"),
note: t("offerEnxovalGrade6ClusterNote"),
items: [
t("offerEnxovalGrade6ClusterItem1"),
t("offerEnxovalGrade6ClusterItem2"),
t("offerEnxovalGrade6ClusterItem3"),
t("offerEnxovalGrade6ClusterItem4"),
t("offerEnxovalGrade6ClusterItem5"),
t("offerEnxovalGrade6ClusterItem6"),
t("offerEnxovalGrade6ClusterItem7"),
t("offerEnxovalGrade6ClusterItem8"),
t("offerEnxovalGrade6ClusterItem9"),
t("offerEnxovalGrade6ClusterItem10"),
t("offerEnxovalGrade6ClusterItem11"),
],
},
];

const minimumAcademicOperations = [
{
system: "Classroom ownership",
why: t("offerMinimumOpClassroomOwnershipWhy"),
type: t("offerMinimumOpClassroomOwnershipType"),
},
{
system: "Classroom package",
why: t("offerMinimumOpClassroomPackageWhy"),
type: t("offerMinimumOpClassroomPackageType"),
},
{
system: "Specialist access",
why: t("offerMinimumOpSpecialistAccessWhy"),
type: t("offerMinimumOpSpecialistAccessType"),
},
{
system: "Academic performance and language acquisition",
why: t("offerMinimumOpAcademicLanguageWhy"),
type: t("offerMinimumOpAcademicLanguageType"),
guardrail: t("offerMinimumOpAcademicLanguageGuardrail"),
},
{
system: "Curriculum and assessment coherence",
why: t("offerMinimumOpCurriculumAssessmentWhy"),
type: t("offerMinimumOpCurriculumAssessmentType"),
},
{
system: "Documentation and portfolio",
why: t("offerMinimumOpDocumentationPortfolioWhy"),
type: t("offerMinimumOpDocumentationPortfolioType"),
},
{
system: "Signature program routines",
why: t("offerMinimumOpSignatureProgramWhy"),
type: t("offerMinimumOpSignatureProgramType"),
},
{
system: "Divisional leadership and coaching",
why: t("offerMinimumOpDivisionalLeadershipWhy"),
type: t("offerMinimumOpDivisionalLeadershipType"),
},
];

const decisionPanelItems = [
{
scenario: "Scenario A",
decision: t("offerDecisionPanelScenarioADecision"),
signal: t("offerDecisionPanelScenarioASignal"),
budget: t("offerDecisionPanelScenarioABudget"),
tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
},
{
scenario: "Scenario B",
decision: t("offerDecisionPanelScenarioBDecision"),
signal: t("offerDecisionPanelScenarioBSignal"),
budget: t("offerDecisionPanelScenarioBBudget"),
tone: "border-blue-200 bg-blue-50 text-blue-800",
},
{
scenario: "Scenario C",
decision: t("offerDecisionPanelScenarioCDecision"),
signal: t("offerDecisionPanelScenarioCSignal"),
budget: t("offerDecisionPanelScenarioCBudget"),
tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
},
{
scenario: "Scenario D",
decision: t("offerDecisionPanelScenarioDDecision"),
signal: t("offerDecisionPanelScenarioDSignal"),
budget: t("offerDecisionPanelScenarioDBudget"),
tone: "border-purple-200 bg-purple-50 text-purple-800",
},
];

const minimumAcademicOperationGroups = [
{
label: t("offerMinimumOpGroupStudentFacingLabel"),
title: t("offerMinimumOpGroupStudentFacingTitle"),
description: t("offerMinimumOpGroupStudentFacingDescription"),
systems: [t("offerMinimumOpClassroomOwnershipSystem"), t("offerMinimumOpClassroomPackageSystem"), t("offerDivisionLowerSchoolMinimum9")],
tone: "border-emerald-100 bg-emerald-50",
},
{
label: t("offerMinimumOpGroupAcademicIntelLabel"),
title: t("offerMinimumOpGroupAcademicIntelTitle"),
description: t("offerMinimumOpGroupAcademicIntelDescription"),
systems: [
t("offerMinimumOpAcademicLanguageSystem"),
t("offerDivisionMiddleSchoolMinimum8"),
t("offerMinimumOpDocumentationPortfolioSystem"),
],
tone: "border-indigo-100 bg-indigo-50",
},
{
label: t("offerMinimumOpGroupQualityControlLabel"),
title: t("offerMinimumOpGroupQualityControlTitle"),
description: t("offerMinimumOpGroupQualityControlDescription"),
systems: [t("offerMinimumOpSignatureProgramSystem"), t("offerMinimumOpDivisionalLeadershipSystem")],
tone: "border-slate-200 bg-slate-50",
},
];

const budgetImpactDecisions = [
{
decision: t("offerBudgetImpactDecisionLapCoachDecision"),
trigger: t("offerBudgetImpactDecisionLapCoachTrigger"),
status: t("offerBudgetImpactDecisionLapCoachStatus"),
requiredDecision: t("offerBudgetImpactDecisionLapCoachRequiredDecision"),
budgetSlot: "R$ ________",
},
{
decision: t("offerBudgetImpactDecisionCurriculumAssessmentDecision"),
trigger: t("offerBudgetImpactDecisionCurriculumAssessmentTrigger"),
status: t("offerBudgetImpactDecisionCurriculumAssessmentStatus"),
requiredDecision: t("offerBudgetImpactDecisionCurriculumAssessmentRequiredDecision"),
budgetSlot: "R$ ________",
},
{
decision: t("offerBudgetImpactDecisionPathwaysCoordinationDecision"),
trigger: t("offerBudgetImpactDecisionPathwaysCoordinationTrigger"),
status: t("offerBudgetImpactDecisionPathwaysCoordinationStatus"),
requiredDecision: t("offerBudgetImpactDecisionPathwaysCoordinationRequiredDecision"),
budgetSlot: "R$ ________",
},
{
decision: t("offerBudgetImpactDecisionProjectDesignLeadDecision"),
trigger: t("offerBudgetImpactDecisionProjectDesignLeadTrigger"),
status: t("offerBudgetImpactDecisionProjectDesignLeadStatus"),
requiredDecision: t("offerBudgetImpactDecisionProjectDesignLeadRequiredDecision"),
budgetSlot: "R$ ________",
},
{
decision: t("offerBudgetImpactDecisionAdditionalSpecialistDecision"),
trigger: t("offerBudgetImpactDecisionAdditionalSpecialistTrigger"),
status: t("offerBudgetImpactDecisionAdditionalSpecialistStatus"),
requiredDecision: t("offerBudgetImpactDecisionAdditionalSpecialistRequiredDecision"),
budgetSlot: "R$ ________",
},
{
decision: t("offerBudgetImpactDecisionAdditionalClusterEducatorDecision"),
trigger: t("offerBudgetImpactDecisionAdditionalClusterEducatorTrigger"),
status: t("offerBudgetImpactDecisionAdditionalClusterEducatorStatus"),
requiredDecision: t("offerBudgetImpactDecisionAdditionalClusterEducatorRequiredDecision"),
budgetSlot: "R$ ________",
},
];

const budgetComparisonColumns = [
t("offerBudgetColumnArea"),
t("offerBudgetColumnOriginalBasis"),
t("offerBudgetColumnCurrentRecommendation"),
t("offerBudgetColumnIncrementRule"),
t("offerBudgetColumnValidationNeeded"),
];

const scenarioBudgetComparisonColumns = [
t("offerScenarioBudgetColumnStatus"),
t("offerScenarioBudgetColumnArea"),
t("offerScenarioBudgetColumnOriginalBasis"),
t("offerScenarioBudgetColumnCurrentRecommendation"),
t("offerScenarioBudgetColumnIncrementRule"),
t("offerScenarioBudgetColumnWhyItMatters"),
];

const sharedBudgetRows: BudgetComparisonRow[] = [
{
area: t("offerBudgetSharedRowClassroomPackageArea"),
status: "Baseline control",
originallyBudgeted: t("offerBudgetSharedRowClassroomPackageOriginallyBudgeted"),
currentRecommendation: t("offerBudgetSharedRowClassroomPackageCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetSharedRowClassroomPackageIncrementalImpact"),
whyNecessary: t("offerBudgetSharedRowClassroomPackageWhyNecessary"),
},
{
area: t("offerBudgetSharedRowLeadershipArea"),
status: "Baseline control",
originallyBudgeted: t("offerBudgetSharedRowLeadershipOriginallyBudgeted"),
currentRecommendation: t("offerBudgetSharedRowLeadershipCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetSharedRowLeadershipIncrementalImpact"),
whyNecessary: t("offerBudgetSharedRowLeadershipWhyNecessary"),
},
{
area: t("offerBudgetSharedRowLearningExperienceDesignArea"),
status: "Baseline control",
originallyBudgeted: t("offerBudgetSharedRowLearningExperienceDesignOriginallyBudgeted"),
currentRecommendation: t("offerBudgetSharedRowLearningExperienceDesignCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetSharedRowLearningExperienceDesignIncrementalImpact"),
whyNecessary: t("offerBudgetSharedRowLearningExperienceDesignWhyNecessary"),
},
{
area: t("offerBudgetSharedRowAfterSchoolRoleMappingArea"),
status: "Mapping validation",
originallyBudgeted: t("offerBudgetSharedRowAfterSchoolRoleMappingOriginallyBudgeted"),
currentRecommendation: t("offerBudgetSharedRowAfterSchoolRoleMappingCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetSharedRowAfterSchoolRoleMappingIncrementalImpact"),
whyNecessary: t("offerBudgetSharedRowAfterSchoolRoleMappingWhyNecessary"),
},
{
area: t("offerBudgetSharedRowSpecialistBaselineArea"),
status: "Baseline control",
originallyBudgeted: t("offerBudgetSharedRowSpecialistBaselineOriginallyBudgeted"),
currentRecommendation: t("offerBudgetSharedRowSpecialistBaselineCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetSharedRowSpecialistBaselineIncrementalImpact"),
whyNecessary: t("offerBudgetSharedRowSpecialistBaselineWhyNecessary"),
},
];

const scenarioBudgetComparisons: ScenarioBudgetComparison[] = [
{
scenario: "Scenario A",
gradeCeiling: t("offerBudgetScenarioAGradeCeiling"),
strategicFrame: t("offerBudgetScenarioAStrategicFrame"),
rows: [
{
area: t("offerBudgetScenarioARowSpecialistExpansionArea"),
status: "Not active",
originallyBudgeted: t("offerBudgetScenarioARowSpecialistExpansionOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioARowSpecialistExpansionCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioARowSpecialistExpansionIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioARowSpecialistExpansionWhyNecessary"),
},
{
area: t("offerBudgetScenarioARowLapCoachArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioARowLapCoachOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioARowLapCoachCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioARowLapCoachIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioARowLapCoachWhyNecessary"),
},
{
area: t("offerBudgetScenarioARowScenarioSpecificProgramsArea"),
status: "Not active",
originallyBudgeted: t("offerBudgetScenarioARowScenarioSpecificProgramsOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioARowScenarioSpecificProgramsCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioARowScenarioSpecificProgramsIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioARowScenarioSpecificProgramsWhyNecessary"),
},
],
},
{
scenario: "Scenario B",
gradeCeiling: t("offerBudgetScenarioBGradeCeiling"),
strategicFrame: t("offerBudgetScenarioBStrategicFrame"),
rows: [
{
area: t("offerBudgetScenarioBRowSpecialistLoadPressureArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioBRowSpecialistLoadPressureOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioBRowSpecialistLoadPressureCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioBRowSpecialistLoadPressureIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioBRowSpecialistLoadPressureWhyNecessary"),
},
{
area: t("offerBudgetScenarioBRowLapCoachArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioBRowLapCoachOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioBRowLapCoachCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioBRowLapCoachIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioBRowLapCoachWhyNecessary"),
},
{
area: t("offerBudgetScenarioBRowResearchersProgressionArea"),
status: "Scenario driver",
originallyBudgeted: t("offerBudgetScenarioBRowResearchersProgressionOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioBRowResearchersProgressionCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioBRowResearchersProgressionIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioBRowResearchersProgressionWhyNecessary"),
},
],
},
{
scenario: "Scenario C",
gradeCeiling: t("offerBudgetScenarioCGradeCeiling"),
strategicFrame: t("offerBudgetScenarioCStrategicFrame"),
rows: [
{
area: t("offerBudgetScenarioCRowSpecialistDesignTechLoadArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioCRowSpecialistDesignTechLoadOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioCRowSpecialistDesignTechLoadCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioCRowSpecialistDesignTechLoadIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioCRowSpecialistDesignTechLoadWhyNecessary"),
},
{
area: t("offerBudgetScenarioCRowLapCoachArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioCRowLapCoachOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioCRowLapCoachCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioCRowLapCoachIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioCRowLapCoachWhyNecessary"),
},
{
area: t("offerBudgetScenarioCRowGrade5PathwaysTransitionArea"),
status: "Scenario driver",
originallyBudgeted: t("offerBudgetScenarioCRowGrade5PathwaysTransitionOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioCRowGrade5PathwaysTransitionCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioCRowGrade5PathwaysTransitionIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioCRowGrade5PathwaysTransitionWhyNecessary"),
},
{
area: t("offerBudgetScenarioCRowFullClassPdjArea"),
status: "Scenario driver",
originallyBudgeted: t("offerBudgetScenarioCRowFullClassPdjOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioCRowFullClassPdjCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioCRowFullClassPdjIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioCRowFullClassPdjWhyNecessary"),
},
{
area: t("offerBudgetScenarioCRowPassionProjectsArea"),
status: "Not active",
originallyBudgeted: t("offerBudgetScenarioCRowPassionProjectsOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioCRowPassionProjectsCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioCRowPassionProjectsIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioCRowPassionProjectsWhyNecessary"),
},
],
},
{
scenario: "Scenario D",
gradeCeiling: t("offerBudgetScenarioDGradeCeiling"),
strategicFrame: t("offerBudgetScenarioDStrategicFrame"),
rows: [
{
area: t("offerBudgetScenarioDRowCreativeHubDesignTechCapacityArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioDRowCreativeHubDesignTechCapacityOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioDRowCreativeHubDesignTechCapacityCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioDRowCreativeHubDesignTechCapacityIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioDRowCreativeHubDesignTechCapacityWhyNecessary"),
},
{
area: t("offerBudgetScenarioDRowLapCoachArea"),
status: "Potential increment",
originallyBudgeted: t("offerBudgetScenarioDRowLapCoachOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioDRowLapCoachCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioDRowLapCoachIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioDRowLapCoachWhyNecessary"),
},
{
area: t("offerBudgetScenarioDRowProjectMentorshipPassionProjectsArea"),
status: "Scenario driver",
originallyBudgeted: t("offerBudgetScenarioDRowProjectMentorshipPassionProjectsOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioDRowProjectMentorshipPassionProjectsCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioDRowProjectMentorshipPassionProjectsIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioDRowProjectMentorshipPassionProjectsWhyNecessary"),
},
{
area: t("offerBudgetScenarioDRowClusterEducatorCapacityValidationArea"),
status: "Mapping validation",
originallyBudgeted: t("offerBudgetScenarioDRowClusterEducatorCapacityValidationOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioDRowClusterEducatorCapacityValidationCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioDRowClusterEducatorCapacityValidationIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioDRowClusterEducatorCapacityValidationWhyNecessary"),
},
{
area: t("offerBudgetScenarioDRowDedicatedProjectMentorArea"),
status: "Conditional increment",
originallyBudgeted: t("offerBudgetScenarioDRowDedicatedProjectMentorOriginallyBudgeted"),
currentRecommendation: t("offerBudgetScenarioDRowDedicatedProjectMentorCurrentRecommendation"),
incrementalBudgetImpact: t("offerBudgetScenarioDRowDedicatedProjectMentorIncrementalImpact"),
whyNecessary: t("offerBudgetScenarioDRowDedicatedProjectMentorWhyNecessary"),
},
],
},
];

const budgetComparisonValidationNotes = [
t("offerBudgetValidationNoteSalaryBasis"),
t("offerBudgetValidationNoteAmbiguousMapping"),
t("offerBudgetValidationNoteAfterSchoolRoleConfirm"),
t("offerBudgetValidationNoteGovernancePlaceholder"),
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
t("offerGovernanceQuestion1"),
t("offerGovernanceQuestion2"),
t("offerGovernanceQuestion3"),
t("offerGovernanceQuestion4"),
];

const roadmapPrintPhases = [
{
period: "2028-2030",
title: t("offerRoadmapPrintPhase1Title"),
summary: t("offerRoadmapPrintPhase1Summary"),
},
{
period: "2031-2033",
title: t("offerRoadmapPrintPhase2Title"),
summary: t("offerRoadmapPrintPhase2Summary"),
},
{
period: "2034-2037",
title: t("offerRoadmapPrintPhase3Title"),
summary: t("offerRoadmapPrintPhase3Summary"),
},
];

const printExperienceGrowthRoadmap = [
{
year: "2028",
stage: t("offerPrintRoadmap2028Stage"),
ceiling: t("offerPrintRoadmap2028Ceiling"),
experience: t("offerPrintRoadmap2028Experience"),
ecosystem: t("offerPrintRoadmap2028Ecosystem"),
},
{
year: "2029",
stage: t("offerPrintRoadmap2029Stage"),
ceiling: t("offerPrintRoadmap2029Ceiling"),
experience: t("offerPrintRoadmap2029Experience"),
ecosystem: t("offerPrintRoadmap2029Ecosystem"),
},
{
year: "2030",
stage: t("offerPrintRoadmap2030Stage"),
ceiling: t("offerPrintRoadmap2030Ceiling"),
experience: t("offerPrintRoadmap2030Experience"),
ecosystem: t("offerPrintRoadmap2030Ecosystem"),
},
{
year: "2031",
stage: t("offerPrintRoadmap2031Stage"),
ceiling: t("offerPrintRoadmap2031Ceiling"),
experience: t("offerPrintRoadmap2031Experience"),
ecosystem: t("offerPrintRoadmap2031Ecosystem"),
},
{
year: "2032",
stage: t("offerPrintRoadmap2032Stage"),
ceiling: t("offerPrintRoadmap2032Ceiling"),
experience: t("offerPrintRoadmap2032Experience"),
ecosystem: t("offerPrintRoadmap2032Ecosystem"),
},
{
year: "2033",
stage: t("offerPrintRoadmap2033Stage"),
ceiling: t("offerPrintRoadmap2033Ceiling"),
experience: t("offerPrintRoadmap2033Experience"),
ecosystem: t("offerPrintRoadmap2033Ecosystem"),
},
{
year: "2034",
stage: t("offerPrintRoadmap2034Stage"),
ceiling: t("offerPrintRoadmap2034Ceiling"),
experience: t("offerPrintRoadmap2034Experience"),
ecosystem: t("offerPrintRoadmap2034Ecosystem"),
},
{
year: "2035",
stage: t("offerPrintRoadmap2035Stage"),
ceiling: t("offerPrintRoadmap2035Ceiling"),
experience: t("offerPrintRoadmap2035Experience"),
ecosystem: t("offerPrintRoadmap2035Ecosystem"),
},
{
year: "2036",
stage: t("offerPrintRoadmap2036Stage"),
ceiling: t("offerPrintRoadmap2036Ceiling"),
experience: t("offerPrintRoadmap2036Experience"),
ecosystem: t("offerPrintRoadmap2036Ecosystem"),
},
{
year: "2037",
stage: t("offerPrintRoadmap2037Stage"),
ceiling: t("offerPrintRoadmap2037Ceiling"),
experience: t("offerPrintRoadmap2037Experience"),
ecosystem: t("offerPrintRoadmap2037Ecosystem"),
},
];

const ecosystemScenarioLadder = [
{
id: "A",
title: "Scenario A",
identity: t("offerEcosystemLadderScenarioAIdentity"),
delta: t("offerEcosystemLadderScenarioADelta"),
tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
},
{
id: "B",
title: "Scenario B",
identity: t("offerEcosystemLadderScenarioBIdentity"),
delta: t("offerEcosystemLadderScenarioBDelta"),
tone: "border-blue-200 bg-blue-50 text-blue-800",
},
{
id: "C",
title: "Scenario C",
identity: t("offerEcosystemLadderScenarioCIdentity"),
delta: t("offerEcosystemLadderScenarioCDelta"),
tone: "border-indigo-200 bg-indigo-50 text-indigo-800",
},
{
id: "D",
title: "Scenario D",
identity: t("offerEcosystemLadderScenarioDIdentity"),
delta: t("offerEcosystemLadderScenarioDDelta"),
tone: "border-purple-200 bg-purple-50 text-purple-800",
},
		  ];

const ecosystemLayerControls = [
{ id: "all", label: t("offerEcosystemLayerControlAllLabel") },
{ id: "classroom", label: t("offerEcosystemLayerControlClassroomLabel") },
{ id: "academic-language", label: t("offerEcosystemLayerControlAcademicLanguageLabel") },
{ id: "specialists", label: t("offerEcosystemLayerControlSpecialistsLabel") },
{ id: "signature", label: t("offerEcosystemLayerControlSignatureLabel") },
{ id: "ms-hs", label: t("offerEcosystemLayerControlMsHsLabel") },
{ id: "budget", label: t("offerEcosystemLayerControlBudgetLabel") },
		  ];

const ecosystemLayerPrintSummaries: Record<string, string> = {
classroom: t("offerEcosystemLayerPrintSummaryClassroom"),
"academic-language": t("offerEcosystemLayerPrintSummaryAcademicLanguage"),
specialists: t("offerEcosystemLayerPrintSummarySpecialists"),
signature: t("offerEcosystemLayerPrintSummarySignature"),
"ms-hs": t("offerEcosystemLayerPrintSummaryMsHs"),
budget: t("offerEcosystemLayerPrintSummaryBudget"),
};

const ecosystemDecisionLayers = {
classroom: {
title: t("offerEcosystemClassroomTitle"),
rows: [
{
scenario: "Scenario A",
status: "Estrutura básica",
commitment: t("offerEcosystemClassroomRowScenarioACommitment"),
adult: t("offerEcosystemClassroomRowScenarioAAdult"),
budget: t("offerEcosystemClassroomRowScenarioABudget"),
},
{
scenario: "Scenario B",
status: "Estrutura básica fortalecida",
commitment: t("offerEcosystemClassroomRowScenarioBCommitment"),
adult: t("offerEcosystemClassroomRowScenarioBAdult"),
budget: t("offerEcosystemClassroomRowScenarioBBudget"),
},
{
scenario: "Scenario C",
status: "Preparação ativa",
commitment: t("offerEcosystemClassroomRowScenarioCCommitment"),
adult: t("offerEcosystemClassroomRowScenarioCAdult"),
budget: t("offerEcosystemClassroomRowScenarioCBudget"),
},
{
scenario: "Scenario D",
status: "Mudança de modelo",
commitment: t("offerEcosystemClassroomRowScenarioDCommitment"),
adult: t("offerEcosystemClassroomRowScenarioDAdult"),
budget: t("offerEcosystemClassroomRowScenarioDBudget"),
},
],
},
"academic-language": {
title: t("offerEcosystemAcademicLanguageTitle"),
guardrail:
t("offerEcosystemAcademicLanguageGuardrail"),
rows: [
{
scenario: "Scenario A",
status: "Investimento recomendado",
commitment: t("offerEcosystemAcademicLanguageRowScenarioACommitment"),
adult: t("offerEcosystemAcademicLanguageRowScenarioAAdult"),
budget: t("offerEcosystemAcademicLanguageRowScenarioABudget"),
},
{
scenario: "Scenario B",
status: "Investimento recomendado",
commitment: t("offerEcosystemAcademicLanguageRowScenarioBCommitment"),
adult: t("offerEcosystemAcademicLanguageRowScenarioBAdult"),
budget: t("offerEcosystemAcademicLanguageRowScenarioBBudget"),
},
{
scenario: "Scenario C",
status: "Necessário para transição",
commitment: t("offerEcosystemAcademicLanguageRowScenarioCCommitment"),
adult: t("offerEcosystemAcademicLanguageRowScenarioCAdult"),
budget: t("offerEcosystemAcademicLanguageRowScenarioCBudget"),
},
{
scenario: "Scenario D",
status: "Necessário",
commitment: t("offerEcosystemAcademicLanguageRowScenarioDCommitment"),
adult: t("offerEcosystemAcademicLanguageRowScenarioDAdult"),
budget: t("offerEcosystemAcademicLanguageRowScenarioDBudget"),
},
],
},
specialists: {
title: t("offerEcosystemSpecialistsTitle"),
rows: [
{
scenario: "Scenario A",
status: "Capacidade compartilhada",
commitment: t("offerEcosystemSpecialistsRowScenarioACommitment"),
adult: t("offerEcosystemSpecialistsRowScenarioAAdult"),
budget: t("offerEcosystemSpecialistsRowScenarioABudget"),
},
{
scenario: "Scenario B",
status: "Capacidade compartilhada fortalecida",
commitment: t("offerEcosystemSpecialistsRowScenarioBCommitment"),
adult: t("offerEcosystemSpecialistsRowScenarioBAdult"),
budget: t("offerEcosystemSpecialistsRowScenarioBBudget"),
},
{
scenario: "Scenario C",
status: "Continuidade LS completa",
commitment: t("offerEcosystemSpecialistsRowScenarioCCommitment"),
adult: t("offerEcosystemSpecialistsRowScenarioCAdult"),
budget: t("offerEcosystemSpecialistsRowScenarioCBudget"),
},
{
scenario: "Scenario D",
status: "Capacidade compartilhada EY/LS/MS",
commitment: t("offerEcosystemSpecialistsRowScenarioDCommitment"),
adult: t("offerEcosystemSpecialistsRowScenarioDAdult"),
budget: t("offerEcosystemSpecialistsRowScenarioDBudget"),
},
],
},
signature: {
title: t("offerEcosystemSignatureTitle"),
guardrail:
t("offerEcosystemSignatureGuardrail"),
rows: [
{
scenario: "Scenario A",
status: "Estrutura básica",
commitment: t("offerEcosystemSignatureRowScenarioACommitment"),
adult: t("offerEcosystemSignatureRowScenarioAAdult"),
budget: t("offerEcosystemSignatureRowScenarioABudget"),
},
{
scenario: "Scenario B",
status: "Progressão acadêmica",
commitment: t("offerEcosystemSignatureRowScenarioBCommitment"),
adult: t("offerEcosystemSignatureRowScenarioBAdult"),
budget: t("offerEcosystemSignatureRowScenarioBBudget"),
},
{
scenario: "Scenario C",
status: "Ativo",
commitment: t("offerEcosystemSignatureRowScenarioCCommitment"),
adult: t("offerEcosystemSignatureRowScenarioCAdult"),
budget: t("offerEcosystemSignatureRowScenarioCBudget"),
},
{
scenario: "Scenario D",
status: "Ativo + add-on potencial",
commitment: t("offerEcosystemSignatureRowScenarioDCommitment"),
adult: t("offerEcosystemSignatureRowScenarioDAdult"),
budget: t("offerEcosystemSignatureRowScenarioDBudget"),
budgetPlaceholder: true,
},
],
},
"ms-hs": {
title: t("offerEcosystemMsHsTitle"),
rows: [
{
scenario: "Scenario A",
status: "Não ativo",
commitment: t("offerEcosystemMsHsRowScenarioACommitment"),
adult: t("offerEcosystemMsHsRowScenarioAAdult"),
budget: t("offerEcosystemMsHsRowScenarioABudget"),
},
{
scenario: "Scenario B",
status: "Preparação cultural",
commitment: t("offerEcosystemMsHsRowScenarioBCommitment"),
adult: t("offerEcosystemMsHsRowScenarioBAdult"),
budget: t("offerEcosystemMsHsRowScenarioBBudget"),
},
{
scenario: "Scenario C",
status: "Ponte formal",
commitment: t("offerEcosystemMsHsRowScenarioCCommitment"),
adult: t("offerEcosystemMsHsRowScenarioCAdult"),
budget: t("offerEcosystemMsHsRowScenarioCBudget"),
},
{
scenario: "Scenario D",
status: "Ativo",
commitment: t("offerEcosystemMsHsRowScenarioDCommitment"),
adult: t("offerEcosystemMsHsRowScenarioDAdult"),
budget: t("offerEcosystemMsHsRowScenarioDBudget"),
},
],
},
budget: {
title: t("offerEcosystemBudgetTitle"),
guardrail:
t("offerEcosystemBudgetGuardrail"),
rows: [
{
scenario: "Scenario A",
status: "Add-on potencial",
commitment: t("offerEcosystemBudgetRowScenarioACommitment"),
adult: t("offerEcosystemBudgetRowScenarioAAdult"),
budget: t("offerEcosystemBudgetRowScenarioABudget"),
budgetPlaceholder: true,
},
{
scenario: "Scenario B",
status: "Add-on potencial",
commitment: t("offerEcosystemBudgetRowScenarioBCommitment"),
adult: t("offerEcosystemBudgetRowScenarioBAdult"),
budget: t("offerEcosystemBudgetRowScenarioBBudget"),
budgetPlaceholder: true,
},
{
scenario: "Scenario C",
status: "Add-on potencial",
commitment: t("offerEcosystemBudgetRowScenarioCCommitment"),
adult: t("offerEcosystemBudgetRowScenarioCAdult"),
budget: t("offerEcosystemBudgetRowScenarioCBudget"),
budgetPlaceholder: true,
},
{
scenario: "Scenario D",
status: "Add-on potencial",
commitment: t("offerEcosystemBudgetRowScenarioDCommitment"),
adult: t("offerEcosystemBudgetRowScenarioDAdult"),
budget: t("offerEcosystemBudgetRowScenarioDBudget"),
budgetPlaceholder: true,
},
],
},
		  };


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
        {t("offerNullStateMessage")}</div>
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
      ? t("offerSpecialistCapacityStatusSustainable")
      : specialistBlocksPerPillar <= specialistCapacityThreshold
        ? t("offerSpecialistCapacityStatusHighButManageable")
        : specialistBlocksPerPillar <= 30
          ? t("offerSpecialistCapacityStatusPressurePoint")
          : t("offerSpecialistCapacityStatusRequiresSecondSpecialist");
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
              {t("offerPrintCoverBadge")}</div>
            <h1 className="mt-10 max-w-4xl text-6xl leading-none tracking-tight text-slate-950">
              {t("offerBrandTitle")}</h1>
            <p className="mt-5 text-2xl text-slate-700">
              {t("offerPrintCoverSubtitle")}</p>
            <p className="mt-10 max-w-3xl text-base leading-relaxed text-slate-600">
              {t("offerPrintCoverDescription")}</p>
          </div>
          <div className="offer-scenarios-print-blue-panel p-6">
            <p className="text-base leading-relaxed text-white">
              {t("offerPrintCoverDossierNote")}</p>
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
                  {t("offerPrintExecutiveFrameLabel")}</div>
                <h2 className="mt-4 text-4xl leading-tight text-slate-950">
                  {t("offerTaglineOperatingPromise")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {t("offerModelSummaryBody")}</p>
              </div>
              <div className="offer-scenarios-print-blue-panel p-6">
                <h3 className="text-2xl leading-tight">
                  {t("offerPrintScenarioDCalloutHeading")}</h3>
                <p className="mt-4 text-sm leading-relaxed text-blue-50/85">
                  {t("offerPrintScenarioDCalloutBody")}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                [t("offerDefinitionCard1Field1"), t("offerDefinitionCard1Field2")],
                [t("offerDefinitionCard2Field1"), t("offerDefinitionCard2Field2")],
                [t("offerDefinitionCard3Field1"), t("offerDefinitionCard3Field2")],
                [t("offerDefinitionCard4Field1"), t("offerDefinitionCard4Field2")],
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
                {t("offerPrintDecisionSnapshotLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintDecisionRowHeading")}</h2>
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
                      <p><span className="text-slate-900">{t("offerPrintGradeCeilingLabel")}</span> {scenario?.gradeCeiling}</p>
                      <p><span className="text-slate-900">{t("offerPrintSignalLabel")}</span> {item.signal}</p>
                      <p><span className="text-slate-900">{t("offerPrintResourceSignalLabel")}</span> {item.budget}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-5">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                {t("offerPrintCommercialSnapshotLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintCommercialSnapshotHeading")}</h2>
            </div>
            <div className="overflow-x-auto rounded-[18px] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {[t("offerPrintCommercialHeader1"), t("offerPrintCommercialHeader2"), t("offerPrintCommercialHeader3"), t("offerPrintCommercialHeader4"), t("offerPrintCommercialHeader5")].map((header) => (
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
                {t("offerPrintOperatingMeaningLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintOperatingMeaningHeading")}</h2>
            </div>
            <div className="overflow-x-auto rounded-[18px] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {[t("offerPrintCommercialHeader1"), t("offerPrintOperatingHeader2"), t("offerMinimumOpClassroomPackageSystem"), t("offerPrintOperatingHeader4"), t("offerPrintOperatingHeader5"), t("offerPrintOperatingHeader6"), t("offerPrintOperatingHeader7")].map((header) => (
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
              {t("offerPrintClassroomPackageNote")}</p>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                {t("offerPrintAdjustmentLayersLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintAdjustmentLayersHeading")}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                {t("offerPrintAdjustmentLayersBody")}</p>
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
                                <div className="text-[10px] leading-snug text-[#214B74]">{offerLabel[row.status] ?? row.status}</div>
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
                <h2 className="text-3xl leading-tight">{t("offerPrintGovernanceQuestionsHeading")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-50/85">
                  {t("offerPrintGovernanceQuestionsBody")}</p>
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
                {t("offerPrintDivisionArchitectureLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintDivisionArchitectureHeading")}</h2>
            </div>
            <div className="space-y-3">
              {baselineDivisionArchitecture.map((division) => (
                <div key={`print-division-${division.division}`} className="offer-scenarios-print-architecture-row offer-scenarios-print-soft-panel p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[0.62fr_1fr_1fr_0.9fr_1.25fr]">
                    <div>
                      <div className="offer-scenarios-print-label text-xs text-[#214B74]">{t("offerPrintDivisionColumnLabel")}</div>
                      <h3 className="mt-1 text-xl text-slate-950">{offerLabel[division.division] ?? division.division}</h3>
                    </div>
                    {[
                      [t("offerPrintDivisionOperatingModelLabel"), division.composition.slice(0, 3).join(" · ")],
                      [t("offerMinimumOpClassroomOwnershipType"), division.minimum.slice(0, 3).join(" · ")],
                      [t("offerPrintDivisionNotActiveYetLabel"), division.inactive.slice(0, 2).join(" · ")],
                      [t("offerPrintDivisionActivationLogicLabel"), division.activation],
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
                {t("offerPrintEnxovalLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintEnxovalHeading")}</h2>
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
                {t("offerPrintMinimumOpsLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintMinimumOpsHeading")}</h2>
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
                          <div className="text-sm text-slate-950">{offerLabel[operation.system] ?? operation.system}</div>
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
                {t("offerPrintBudgetComparisonLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintBudgetComparisonHeading")}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                {t("offerPrintBudgetComparisonNote")}</p>
            </div>
            <div className="offer-scenarios-print-avoid-break overflow-hidden rounded-[18px] bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="offer-scenarios-print-label text-xs text-[#214B74]">
                  {t("offerSharedControlsLabel")}</div>
                <h3 className="mt-1 text-xl text-slate-950">{t("offerBaselineGovernanceControlsHeading")}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {t("offerPrintBaselineGovernanceNote")}</p>
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
                          {offerLabel[row.status] ?? row.status}
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
                  <h3 className="mt-1 text-xl text-slate-950">{offerLabel[scenario.scenario] ?? scenario.scenario}</h3>
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
                            {offerLabel[row.status] ?? row.status}
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
                  {t("offerSecondaryValidationSlotsLabel")}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {t("offerSecondaryValidationSlotsBody")}</p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    {[t("offerBudgetColumnDecisionLabel"), t("offerBudgetColumnTriggerLabel"), t("bannerStatusLabel"), t("offerBudgetColumnValidationNeeded"), t("offerBudgetColumnResourcePlaceholderLabel")].map((header) => (
                      <th key={`print-budget-${header}`} className="px-4 py-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budgetImpactDecisions.map((row) => (
                    <tr key={`print-budget-${row.decision}`} className="border-t border-slate-100 align-top">
                      <td className="px-4 py-3 text-slate-950">{row.decision}</td>
                      <td className="px-4 py-3 text-slate-600">{row.trigger}</td>
                      <td className="px-4 py-3 text-[#214B74]">{offerLabel[row.status] ?? row.status}</td>
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
                    {offerLabel[scenario.title] ?? scenario.title}
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
                      [t("offerPrintCommercialHeader2"), scenario.gradeCeiling],
                      [t("offerPrintCommercialHeader3"), `${offerEnrollmentCount[scenario.title]} ${t("offerLearnersUnitLabel")}`],
                      [t("offerPrintCommercialHeader4"), `${offerCapacityCount[scenario.title]} ${t("offerLearnersUnitLabel")}`],
                      [t("exportMatrixColOccupancy"), scenario.impliedOccupancy],
                    ].map(([label, value]) => (
                      <div key={`print-plate-${scenario.title}-${label}`}>
                        <div className="offer-scenarios-print-label text-xs text-[#214B74]">{label}</div>
                        <div className="mt-1 text-sm text-slate-950">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      [t("offerPrintPlateCoreShiftLabel"), scenario.classroomPackage],
                      [t("offerPrintPlateActiveOfferElementsLabel"), scenario.signaturePrograms],
                      [t("offerPrintPlateStrategicCautionLabel"), [scenario.risk]],
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
                {t("offerPrintSpecialistSystemLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintSpecialistSystemHeading")}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                {t("offerPrintSpecialistSystemBody")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {specialistCapacityDomains.map((domain) => (
                <div key={`print-specialist-${domain.domain}`} className="offer-scenarios-print-specialist-card offer-scenarios-print-soft-panel p-5">
                  <h3 className="text-xl text-slate-950">{domain.domain}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{domain.loadSignal}</p>
                  <div className="mt-4 grid grid-cols-1 gap-2 text-xs leading-relaxed text-slate-600">
                    <p><span className="text-[#214B74]">{t("offerSpecialistLeanLabel")}</span> {domain.lean}</p>
                    <p><span className="text-[#214B74]">{t("offerSpecialistBalancedLabel")}</span> {domain.balanced}</p>
                    <p><span className="text-[#214B74]">{t("offerSpecialistPremiumLabel")}</span> {domain.premium}</p>
                    <p><span className="text-[#4b254b]">{t("offerSpecialistBudgetRiskLabel")}</span> {domain.risk}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="offer-scenarios-print-page offer-scenarios-print-page-break space-y-6">
            <div>
              <div className="offer-scenarios-print-label text-sm text-[#214B74]">
                {t("offerPrintAppendixLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintAppendixHeading")}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-600">
                {t("offerAppendixIntroNote")}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">{t("offerPrintBodyMovementProofHeading")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {t("offerPrintBodyMovementProofBody")}</p>
                <div className="mt-4 space-y-2">
                  {bodyMovementLoads.map(([scenario, load, premise]) => (
                    <div key={`print-bm-${scenario}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{scenario}</span> · {load} · {premise}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">{t("offerPrintSaoPauloReferenceHeading")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {t("offerPrintSaoPauloReferenceBody")}</p>
                <div className="mt-4 space-y-2">
                  {currentSpecialistEcosystem.map(([area, names, count]) => (
                    <div key={`print-current-specialist-${area}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{area}</span> · {names} · {count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">{t("offerPrintMiddleSchoolModelHeading")}</h3>
                <div className="mt-4 space-y-2">
                  {middleSchoolClusters.map(([cluster, coverage, premise]) => (
                    <div key={`print-cluster-${cluster}`} className="rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600">
                      <span className="text-slate-950">{cluster}</span> · {coverage} · {premise}
                    </div>
                  ))}
                </div>
              </div>
              <div className="offer-scenarios-print-soft-panel p-5">
                <h3 className="text-xl text-slate-950">{t("offerPrintMentorshipModelHeading")}</h3>
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
                {t("offerPrintRoadmapLabel")}</div>
              <h2 className="mt-3 text-3xl text-slate-950">{t("offerPrintRoadmapHeading")}</h2>
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
                {t("offerPrintSynthesisLabel")}</div>
              <h2 className="mt-5 max-w-3xl text-5xl leading-tight text-white">{t("offerPrintSynthesisHeading")}</h2>
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
                    {t("offerRailBrandLabel")}</div>
                  <h2 className="mt-5 text-3xl font-black leading-none tracking-tight">
                    {t("offerBrandTitle")}</h2>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/80">
                    {t("offerTaglineOperatingPromise")}</p>
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
                    {t("offerRailBoardArtifactLabel")}</div>
                  <button
                    type="button"
                    onClick={handlePrintOfferScenarios}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-wider text-[#214B74] transition-colors hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    {t("offerExportDossierButtonLabel")}</button>
                  <p className="mt-3 text-xs leading-relaxed text-blue-50/70">
                    {t("offerExportDossierHint")}</p>
                </div>
              </div>
            </aside>

            <main className="rounded-[2rem] bg-[#fbfaf7] p-4 md:p-6 xl:p-8">
              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    {t("offerConsoleEyebrowLabel")}</div>
                  <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-slate-950 md:text-6xl">
                    {t("offerBrandTitle")}</h1>
                  <p className="mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
                    {t("offerModelSummaryBody")}</p>
                </div>
                <div className="rounded-[2rem] bg-[#16334f] p-5 text-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.26em] text-blue-100/70">
                    {t("offerStrategicReadingLabel")}</div>
                  <p className="mt-4 text-xl font-black leading-tight">
                    {t("offerStrategicReadingHeading")}</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-blue-50/80">
                    {t("offerStrategicReadingBody")}</p>
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
                        {t("offerBriefEyebrowLabel")}</div>
                      <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                        {t("offerBriefHeading")}</h3>
                      <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-600">
                        {t("offerBriefBody")}</p>
                      <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold leading-relaxed text-amber-900">
                        {OFFER_SCENARIO_GOVERNANCE_BOUNDARY}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        [t("offerDefinitionCard1Field1"), t("offerDefinitionCard1Field2")],
                        [t("offerDefinitionCard2Field1"), t("offerDefinitionCard2Field2")],
                        [t("offerDefinitionCard3Field1"), t("offerDefinitionCard3Field2")],
                        [t("offerDefinitionCard4Field1"), t("offerDefinitionCard4Field2")],
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
                      [t("offerBriefPathCard1Field1"), t("capitalComparisonPanelScenarioALabel"), t("offerBriefPathCard1Field3")],
                      [t("offerBriefPathCard2Field1"), t("capitalComparisonPanelScenarioBLabel"), t("offerBriefPathCard2Field3")],
                      [t("offerBriefPathCard3Field1"), t("offerScenarioCTitle"), t("offerBriefPathCard3Field3")],
                      [t("offerBriefPathCard4Field1"), t("offerScenarioDTitle"), t("offerBriefPathCard4Field3")],
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
                          {offerLabel[scenario.title] ?? scenario.title}
                        </div>
                        <div className="mt-3 text-lg font-black leading-tight text-slate-950">
                          {scenario.strategicIdentity}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                          <span>{offerEnrollmentCount[scenario.title]} {t("offerBriefTargetSuffix")}</span>
                          <span>{offerCapacityCount[scenario.title]} {t("offerBriefCapacitySuffix")}</span>
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
                        {t("offerLadderEyebrowLabel")}</div>
                      <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                        A → B → C → D
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm font-semibold leading-relaxed text-slate-600">
                      {t("offerLadderBody")}</p>
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
                              {offerEnrollmentCount[scenarioData.title]} {t("offerLearnersUnitLabel")} · {offerCapacityCount[scenarioData.title]} {t("offerLearnersUnitLabel")} · {scenarioData.impliedOccupancy}
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
                            {offerLabel[scenario.title] ?? scenario.title}
                          </button>
                        ))}
                      </div>
                      <div className="mt-10 text-[10px] font-black uppercase tracking-[0.28em] text-blue-100/70">
                        {t("offerScenarioSelectedLabel")}</div>
                      {selectedScenario ? (
                        <>
                          <h3 className="mt-4 text-4xl font-black leading-none tracking-tight">
                            {offerLabel[selectedScenario.title] ?? selectedScenario.title}
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
                          {t("offerScenarioEmptyStateMessage")}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedScenario && (
                        <>
                          <div className="grid gap-3 sm:grid-cols-4">
                            {[
                              [t("offerScenarioMetricLabel1"), selectedScenario.gradeCeiling],
                              [t("offerPrintCommercialHeader3"), `${offerEnrollmentCount[selectedScenario.title]} ${t("offerLearnersUnitLabel")}`],
                              [t("offerScenarioMetricLabel3"), `${offerCapacityCount[selectedScenario.title]} ${t("offerLearnersUnitLabel")}`],
                              [t("exportMatrixColOccupancy"), selectedScenario.impliedOccupancy],
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-[1.5rem] bg-white p-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
                                <div className="mt-2 text-sm font-black text-slate-950">{value}</div>
                              </div>
                            ))}
                          </div>
                          <div className="grid gap-4 lg:grid-cols-2">
                            {[
                              [t("offerScenarioGroupLabel1"), selectedScenario.classroomPackage],
                              [t("offerScenarioGroupLabel2"), selectedScenario.signaturePrograms],
                              [t("offerScenarioGroupLabel3"), selectedScenario.notActiveYet],
                              [t("offerScenarioGroupLabel4"), selectedScenario.roles],
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
                              {t("offerScenarioRiskLabel")}</div>
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
                      {t("offerBudgetEyebrowLabel")}</div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      {t("offerBudgetHeading")}</h3>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                      {t("offerBudgetIntroNote")}</p>
                  </div>
                  <div className="grid gap-3 rounded-[2rem] bg-white p-5 lg:grid-cols-3">
                    {[
                      [t("offerBudgetRuleCard1Field1"), t("offerBudgetRuleCard1Field2")],
                      [t("offerBudgetRuleCard2Field1"), t("offerBudgetRuleCard2Field2")],
                      [t("offerBudgetRuleCard3Field1"), t("offerBudgetRuleCard3Field2")],
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
                        {t("offerSharedControlsLabel")}</div>
                      <h4 className="mt-1 text-xl font-black text-slate-950">{t("offerBaselineGovernanceControlsHeading")}</h4>
                      <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                        {t("offerScreenBaselineGovernanceNote")}</p>
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
                                  {offerLabel[row.status] ?? row.status}
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
                        <h4 className="mt-1 text-xl font-black text-slate-950">{offerLabel[scenario.scenario] ?? scenario.scenario}</h4>
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
                                    {offerLabel[row.status] ?? row.status}
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
                      {t("offerGovernanceValidationNoteLabel")}</div>
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
                        {t("offerSecondaryValidationSlotsLabel")}</div>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">
                        {t("offerSecondaryValidationSlotsBody")}</p>
                    </div>
                    <div className="hidden grid-cols-[1.25fr_0.7fr_0.8fr_1.2fr_0.8fr] gap-4 bg-[#edf3f7] px-5 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#214B74] lg:grid">
                      <div>{t("offerBudgetColumnDecisionLabel")}</div>
                      <div>{t("offerBudgetColumnTriggerLabel")}</div>
                      <div>{t("offerBudgetColumnStatusLabel")}</div>
                      <div>{t("offerBudgetColumnRequiredDecisionLabel")}</div>
                      <div>{t("offerBudgetColumnResourcePlaceholderLabel")}</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {budgetImpactDecisions.map((row) => (
                        <div key={`console-${row.decision}`} className="grid gap-3 px-5 py-5 lg:grid-cols-[1.25fr_0.7fr_0.8fr_1.2fr_0.8fr] lg:items-center">
                          <div className="text-sm font-black text-slate-950">{row.decision}</div>
                          <div className="text-xs font-bold text-slate-500">{row.trigger}</div>
                          <div>
                            <span className="inline-flex rounded-full bg-[#e8eef3] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#214B74]">
                              {offerLabel[row.status] ?? row.status}
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
                      {t("offerArchitectureEyebrowLabel")}</div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      {t("offerArchitectureHeading")}</h3>
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
                                <div className="text-sm font-black text-slate-950">{offerLabel[operation.system] ?? operation.system}</div>
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
                      {t("offerAppendixEyebrowLabel")}</div>
                    <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                      {t("offerAppendixHeading")}</h3>
                    <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
                      {t("offerAppendixIntroNote")}</p>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                      {t("offerSpecialistPillarLabel")}</div>
                    <h4 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                      {t("offerSpecialistPillarHeading")}</h4>
                    <div className="mt-4 space-y-4">
                      <p className="text-sm font-semibold leading-relaxed text-slate-600">
                        {t("offerSpecialistPillarBody1")}</p>
                      <p className="text-sm font-semibold leading-relaxed text-slate-600">
                        {t("offerSpecialistPillarBody2")}</p>
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-slate-700">
                        {t("offerSpecialistPillarGuardrail")}</div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                        {[
                          {
                            id: "finalGrade",
                            label: t("offerSimulatorControlLabel1"),
                            value: specialistFinalGrade,
                            options: specialistFinalGradeOptions,
                            onChange: (value: string) => setSpecialistFinalGrade(value as SpecialistFinalGrade),
                          },
                          {
                            id: "sectionsPerGrade",
                            label: t("offerSimulatorControlLabel2"),
                            value: specialistSectionsPerGrade,
                            options: specialistSectionsPerGradeOptions,
                            onChange: (value: string) => setSpecialistSectionsPerGrade(Number(value) as SpecialistSectionsPerGrade),
                          },
                          {
                            id: "blocksPerGrade",
                            label: t("offerSimulatorControlLabel3"),
                            value: specialistBlocksPerGrade,
                            options: specialistBlocksPerGradeOptions,
                            onChange: (value: string) => setSpecialistBlocksPerGrade(Number(value) as SpecialistBlocksPerGrade),
                          },
                          {
                            id: "blockDuration",
                            label: t("offerSimulatorControlLabel4"),
                            value: specialistBlockDuration,
                            options: specialistBlockDurationOptions,
                            onChange: (value: string) => setSpecialistBlockDuration(Number(value) as SpecialistBlockDuration),
                          },
                          {
                            id: "capacityThreshold",
                            label: t("offerSimulatorControlLabel5"),
                            value: specialistCapacityThreshold,
                            options: specialistCapacityThresholdOptions,
                            onChange: (value: string) => setSpecialistCapacityThreshold(Number(value) as SpecialistCapacityThreshold),
                          },
                        ].map((control) => (
                          <label key={`visible-${control.id}`} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">{control.label}</span>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#214B74]"
                              value={control.value}
                              onChange={(event) => control.onChange(event.target.value)}
                            >
                              {control.options.map((option) => (
                                <option key={`visible-${control.id}-${option}`} value={option}>
                                  {typeof option === "number" ? (control.id === "blockDuration" ? `${option} ${t("offerBlockDurationMinutesSuffix")}` : (offerLabel[option] ?? option)) : (offerLabel[option] ?? option)}
                                </option>
                              ))}
                            </select>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                        {[
                          [t("offerSimulatorOutputLabel1"), `${specialistGradeLevelCount} levels`],
                          [t("offerSimulatorOutputLabel2"), `${specialistBlocksPerPillar} blocks`],
                          [t("offerSimulatorOutputLabel3"), specialistHoursDisplay],
                          [t("offerSimulatorOutputLabel4"), specialistCapacityStatus],
                          [t("offerSimulatorOutputLabel5"), `${specialistRecommendedFTEPerPillar}`],
                          [t("offerSimulatorOutputLabel6"), `${specialistCapacityEquivalentAcrossFourPillars}`],
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
                              <th className="px-3 py-3">{t("offerSimulatorColumnReferenceCaseLabel")}</th>
                              <th className="px-3 py-3">{t("offerSimulatorColumnSectionsLabel")}</th>
                              <th className="px-3 py-3">{t("offerSimulatorColumnFinalGradeLabel")}</th>
                              <th className="px-3 py-3">{t("offerSimulatorColumnBlocksLabel")}</th>
                              <th className="px-3 py-3">{t("offerSimulatorColumnHoursLabel")}</th>
                              <th className="px-3 py-3">{t("offerSimulatorColumnStatusLabel")}</th>
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
                        {t("offerSimulatorGuardrailNote")}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[2rem] bg-white p-6">
                      <h4 className="text-xl font-black text-slate-950">{t("offerSpecialistTriggerExamplesHeading")}</h4>
                      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                        {t("offerSpecialistTriggerExamplesBody")}</p>
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
                      <h4 className="text-xl font-black text-slate-950">{t("offerSaoPauloReferenceScreenHeading")}</h4>
                      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                        {t("offerSaoPauloReferenceScreenBody")}</p>
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
                      <h4 className="text-xl font-black text-slate-950">{t("offerMsInstructionalModelByStageHeading")}</h4>
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
                      <h4 className="text-xl font-black text-slate-950">{t("offerMentorshipStructuralPathwaysHeading")}</h4>
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
                    <h4 className="text-xl font-black text-slate-950">{t("offerHowToReadScenariosHeading")}</h4>
                    <p className="mt-3 max-w-4xl text-sm font-semibold leading-relaxed text-slate-600">
                      {t("offerHowToReadScenariosBody")}</p>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6">
                    <h4 className="text-xl font-black text-slate-950">{t("offerRoadmapHeading")}</h4>
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
                      {t("offerBoardSynthesisHeading")}</div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {synthesisStatements.map((statement, index) => (
                        <div key={`console-${statement}`} className="rounded-[1.5rem] bg-white/10 p-4">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {t("offerSynthesisPointLabel")}{index + 1}
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
