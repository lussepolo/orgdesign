import { getMsHsStaffingReadinessSummary } from "./msHsStaffingReadiness";

export type ExecutiveOrgScenario = "minimum" | "balanced" | "premium";

export type ExecutiveOrgYear =
  | 2028
  | 2029
  | 2030
  | 2031
  | 2032
  | 2033
  | 2034
  | 2035
  | 2036
  | 2037;

export type OrgTreeNodeVariant =
  | "base"
  | "scenarioAddition"
  | "yearBased"
  | "guardrail"
  | "dottedLine";

export interface OrgTreeNode {
  id: string;
  label: string;
  badge?: string;
  note?: string;
  children?: OrgTreeNode[];
  variant?: OrgTreeNodeVariant;
}

export interface ExecutiveOrgScenarioOption {
  id: ExecutiveOrgScenario;
  label: string;
  posture: string;
}

export interface ExecutiveOrgYearOption {
  year: ExecutiveOrgYear;
  label: string;
}

export interface ExecutiveOrgRailItem {
  label: string;
  value: string;
  note?: string;
}

export interface ExecutiveOrgTreeViewModel {
  scenario: ExecutiveOrgScenario;
  year: ExecutiveOrgYear;
  scenarioPosture: string;
  yearSignal: string;
  root: OrgTreeNode;
  railItems: ExecutiveOrgRailItem[];
}

export const EXECUTIVE_ORG_SCENARIOS: readonly ExecutiveOrgScenarioOption[] = [
  { id: "minimum", label: "Minimum Experience", posture: "Lean Opening Model" },
  { id: "balanced", label: "Balanced Experience", posture: "Resilient Experience Model" },
  { id: "premium", label: "Premium Experience", posture: "Academic Coherence Model" },
] as const;

export const EXECUTIVE_ORG_YEARS: readonly ExecutiveOrgYearOption[] = [
  2028,
  2029,
  2030,
  2031,
  2032,
  2033,
  2034,
  2035,
  2036,
  2037,
].map((year) => ({ year: year as ExecutiveOrgYear, label: String(year) }));

const scenarioPostureById: Record<ExecutiveOrgScenario, string> = {
  minimum: "Lean Opening Model",
  balanced: "Resilient Experience Model",
  premium: "Academic Coherence Model",
};

function formatGrades(grades: readonly string[]) {
  if (grades.length === 0) return "Inactive";
  if (grades.length === 1) return `${grades[0].toUpperCase()} active`;

  return `${grades[0].toUpperCase()}-${grades[grades.length - 1].toUpperCase()} active`;
}

function formatMsNote(year: ExecutiveOrgYear) {
  const summary = getMsHsStaffingReadinessSummary({ year }).middleSchool;
  if (summary.activeGrades.length === 0) return "Inactive";
  if (summary.coreEducators === null) return "HC pending";
  return `HC ${summary.coreEducators}`;
}

function formatHsNote(year: ExecutiveOrgYear) {
  const summary = getMsHsStaffingReadinessSummary({ year }).highSchool;
  if (summary.activeGrades.length === 0) return "Inactive";
  return `HC ${summary.coreEducators ?? 0}`;
}

function getYearSignal(year: ExecutiveOrgYear) {
  if (year < 2031) return `${year}: Base opening structure`;
  if (year < 2033) return `${year}: MS begins, HC pending`;
  if (year === 2033) return "2033: MS full model, HC 8";
  if (year < 2037) return `${year}: HS ramp active`;
  return "2037: HS full model, HC 10";
}

function futureDivisionNodes(year: ExecutiveOrgYear): OrgTreeNode[] {
  const summary = getMsHsStaffingReadinessSummary({ year });
  const msGrades = formatGrades(summary.middleSchool.activeGrades);
  const hsGrades = formatGrades(summary.highSchool.activeGrades);

  return [
    {
      id: "middle-school-core-educators",
      label: "Middle School Core Educators",
      badge: formatMsNote(year),
      note: msGrades,
      variant: "yearBased",
    },
    {
      id: "high-school-core-educators",
      label: "High School Core Educators",
      badge: formatHsNote(year),
      note: hsGrades,
      variant: "yearBased",
    },
    {
      id: "hs-pool-excluded",
      label: "HS pool",
      badge: "Guardrail",
      note: "Excluded from HS totals",
      variant: "guardrail",
    },
  ];
}

function buildOperationsBranch(scenario: ExecutiveOrgScenario): OrgTreeNode {
  const children: OrgTreeNode[] = [
    { id: "operations-coordinator", label: "Operations Coordinator", variant: "base" },
    {
      id: "secretary",
      label: "Secretary",
      variant: "base",
      children: [
        {
          id: "secretary-family-dotted",
          label: "Enrollment support",
          badge: "Dotted line",
          note: "To Family Services",
          variant: "dottedLine",
        },
      ],
    },
    { id: "nurse-intern", label: "Nurse Intern", variant: "base" },
    { id: "security-clerks", label: "Security / Clerks", variant: "base" },
  ];

  if (scenario !== "minimum") {
    children.push({
      id: "security-coordinator",
      label: "Security Coordinator",
      badge: "Scenario addition",
      note: "Functional line to Clerks",
      variant: "scenarioAddition",
      children: [
        {
          id: "security-functional-line",
          label: "Security / Clerks",
          badge: "Functional line",
          variant: "dottedLine",
        },
      ],
    });
  }

  children.push(
    { id: "maintenance", label: "Maintenance", variant: "base" },
    { id: "marketing-analyst", label: "Marketing Analyst", variant: "base" },
    { id: "events-assistant", label: "Events Assistant", variant: "base" },
    { id: "financial-analyst", label: "Financial Analyst", variant: "base" },
    { id: "financial-assistant", label: "Financial Assistant", variant: "base" },
    { id: "hr-analyst", label: "HR Analyst", variant: "base" },
  );

  return {
    id: "operations",
    label: "Operations",
    children,
    variant: "base",
  };
}

function buildLearningEcosystemBranch(scenario: ExecutiveOrgScenario): OrgTreeNode {
  const children: OrgTreeNode[] = [
    { id: "learning-experience-designer", label: "Learning Experience Designer", variant: "base" },
    { id: "language-acquisition-coach", label: "Language Acquisition Coach", variant: "base" },
  ];

  if (scenario !== "minimum") {
    children.push(
      {
        id: "learning-design-experience",
        label: "Learning Design Experience",
        badge: "Functional grouping",
        note: "Balanced and Premium",
        variant: "scenarioAddition",
      },
      {
        id: "personalized-learning-associate",
        label: "Personalized Learning Associate Educator",
        badge: "Scenario addition",
        note: "Balanced and Premium",
        variant: "scenarioAddition",
      },
    );
  }

  children.push(
    { id: "edtech-coordinator", label: "EdTech Coordinator", variant: "base" },
    { id: "it-technician", label: "IT Technician", variant: "base" },
    { id: "maker-space-assistant", label: "Maker Space Assistant", variant: "base" },
    { id: "after-school-coordinator", label: "After School Coordinator", variant: "base" },
  );

  return {
    id: "learning-ecosystem",
    label: "Learning Ecosystem",
    children,
    variant: "base",
  };
}

export function buildExecutiveOrgDesignTree(
  scenario: ExecutiveOrgScenario,
  year: ExecutiveOrgYear,
): ExecutiveOrgTreeViewModel {
  const premiumChildren: OrgTreeNode[] =
    scenario === "premium"
      ? [
          {
            id: "curriculum-assessment-designer",
            label: "Curriculum and Assessment Designer",
            badge: "Scenario addition",
            note: "Premium only",
            variant: "scenarioAddition",
          },
        ]
      : [];

  const root: OrgTreeNode = {
    id: "head-of-school",
    label: "Head of School",
    badge: "Root",
    children: [
      ...premiumChildren,
      buildOperationsBranch(scenario),
      {
        id: "academic-divisions",
        label: "Academic Divisions",
        variant: "base",
        children: [
          { id: "ey-principal", label: "Early Years Principal", variant: "base" },
          { id: "ey-counselor", label: "EY Counselor", variant: "base" },
          {
            id: "ey-educator-package",
            label: "Early Years Educator Package",
            badge: "HC source pending",
            note: "Educator + Assistant + Monitor",
            variant: "base",
          },
          { id: "ls-principal", label: "Lower School Principal", variant: "base" },
          { id: "ls-counselor", label: "LS Counselor", variant: "base" },
          {
            id: "ls-educator-package",
            label: "Lower School Educator Package",
            badge: "HC source pending",
            note: "Educator + Assistant",
            variant: "base",
          },
          {
            id: "specialist-educators",
            label: "Specialist Educators",
            badge: "Dotted line",
            note: "To EY and LS Principals",
            variant: "dottedLine",
          },
        ],
      },
      buildLearningEcosystemBranch(scenario),
      {
        id: "community-library",
        label: "Community & Library",
        variant: "base",
        children: [
          { id: "enrollment-family-services", label: "Enrollment & Family Services Coordinator", variant: "base" },
          { id: "family-engagement-analyst", label: "Family Engagement Analyst", variant: "base" },
          {
            id: "secretary-dotted-support",
            label: "Secretary dotted-line support",
            badge: "Dotted line",
            variant: "dottedLine",
          },
          { id: "librarian", label: "Librarian", variant: "base" },
          {
            id: "librarian-principal-support",
            label: "Librarian principal support",
            badge: "Dotted line",
            note: "To EY and LS",
            variant: "dottedLine",
          },
        ],
      },
      {
        id: "future-divisions",
        label: "Future Divisions",
        children: futureDivisionNodes(year),
        variant: "yearBased",
      },
    ],
  };

  return {
    scenario,
    year,
    scenarioPosture: scenarioPostureById[scenario],
    yearSignal: getYearSignal(year),
    root,
    railItems: [
      {
        label: "Scenario posture",
        value: `${EXECUTIVE_ORG_SCENARIOS.find((option) => option.id === scenario)?.label}: ${scenarioPostureById[scenario]}`,
      },
      {
        label: "Year signal",
        value: getYearSignal(year),
      },
      {
        label: "HC status",
        value: "Partial source-backed HC",
        note: "No complete total yet",
      },
      {
        label: "Source guardrails",
        value: "MS/HS from readiness layer",
        note: "HS pool excluded; packages pending totalizer",
      },
    ],
  };
}
