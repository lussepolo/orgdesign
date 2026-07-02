import { BACKOFFICE_CONFIG, LEADERSHIP_CONFIG, SPECIALISTS_CONFIG } from "../../../constants/leadership";
import { orgDesignScenarioExtensionRoles } from "../data/orgDesignScenarioExtensions";
import { getMsHsStaffingReadinessSummary } from "./msHsStaffingReadiness";
import { SECONDARY_EDUCATOR_CAPACITY_MODEL } from "./secondaryEducatorCapacityModel";

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

export type OrgTreeNodeHeadcountStatus =
  | "source-backed"
  | "source-pending"
  | "model-backed"
  | "not-applicable";

export interface OrgTreeNode {
  id: string;
  label: string;
  badge?: string;
  note?: string;
  children?: OrgTreeNode[];
  variant?: OrgTreeNodeVariant;
  headcountValue?: number | null;
  headcountStatus?: OrgTreeNodeHeadcountStatus;
  headcountSourceLabel?: string;
  headcountBasisNote?: string;
  packageBasisNote?: string;
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

const orgDesignScenarioOptionById = {
  minimum: "minimum_experience",
  balanced: "balanced_experience",
  premium: "premium_experience",
} as const;

const existingPayrollRoleSourceLabel = "Existing role headcount progression";
const fixedSourceContractLabel = "Org-design source contract";
const readinessLayerSourceLabel = "MS/HS readiness layer";
const hsCounselorSourceLabel =
  "User-authorized canonical Executive Org Design rule; same pay-scheme assumption as MS Counselor.";

function getExistingRole(roleId: string) {
  return [
    ...LEADERSHIP_CONFIG,
    ...BACKOFFICE_CONFIG,
    ...SPECIALISTS_CONFIG,
  ].find((candidate) => candidate.id === roleId);
}

const pendingHeadcount = (
  sourceLabel = "Source-backed composition incomplete",
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> => ({
  headcountValue: null,
  headcountStatus: "source-pending",
  headcountSourceLabel: sourceLabel,
});

const notApplicableHeadcount = (): Pick<
  OrgTreeNode,
  "headcountValue" | "headcountStatus"
> => ({
  headcountValue: null,
  headcountStatus: "not-applicable",
});

const modelBackedHeadcount = (): Pick<
  OrgTreeNode,
  "headcountValue" | "headcountStatus" | "headcountSourceLabel"
> => ({
  headcountValue: null,
  headcountStatus: "model-backed",
  headcountSourceLabel:
    "Section-driven HC via sectionCountEngine / calculateFopag(). Grade-level breakdown in role-level HC table.",
});

const sourceBackedHeadcount = (
  headcountValue: number,
  sourceLabel: string,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> => ({
  headcountValue,
  headcountStatus: "source-backed",
  headcountSourceLabel: sourceLabel,
});

function formatGrades(grades: readonly string[]) {
  if (grades.length === 0) return "Inactive";
  if (grades.length === 1) return `${grades[0].toUpperCase()} active`;

  return `${grades[0].toUpperCase()}-${grades[grades.length - 1].toUpperCase()} active`;
}

function getExistingRoleHeadcount(
  roleId: string,
  year: ExecutiveOrgYear,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> {
  const role = getExistingRole(roleId);

  if (!role) return pendingHeadcount("Existing role mapping unresolved");

  return sourceBackedHeadcount(
    role.headcount[year] ?? 0,
    existingPayrollRoleSourceLabel,
  );
}

function shouldRenderExistingRoleForYear(roleId: string, year: ExecutiveOrgYear) {
  const role = getExistingRole(roleId);
  if (!role) return true;

  const currentHeadcount = role.headcount[year] ?? 0;
  const hasLaterPositiveHeadcount = EXECUTIVE_ORG_YEARS.some(
    (option) => option.year > year && (role.headcount[option.year] ?? 0) > 0,
  );

  return currentHeadcount > 0 || !hasLaterPositiveHeadcount;
}

function getFixedExtensionHeadcount(
  roleId: string,
  scenario: ExecutiveOrgScenario,
  year: ExecutiveOrgYear,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> {
  const role = orgDesignScenarioExtensionRoles.find((candidate) => candidate.id === roleId);
  const scenarioOption = orgDesignScenarioOptionById[scenario];

  if (!role || !role.activeIn.includes(scenarioOption)) {
    return notApplicableHeadcount();
  }

  if (
    role.headcountSource === "fixed" &&
    typeof role.headcount === "number" &&
    typeof role.activationYear === "number" &&
    year >= role.activationYear
  ) {
    return sourceBackedHeadcount(role.headcount, fixedSourceContractLabel);
  }

  return pendingHeadcount(fixedSourceContractLabel);
}

function getCounselorHeadcount() {
  return sourceBackedHeadcount(1, "Org-design logic");
}

function getHsCounselorHeadcount() {
  return sourceBackedHeadcount(1, hsCounselorSourceLabel);
}

function getMiddleSchoolHeadcount(
  year: ExecutiveOrgYear,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> {
  const summary = getMsHsStaffingReadinessSummary({ year }).middleSchool;
  if (summary.activeGrades.length === 0) return notApplicableHeadcount();
  if (summary.totalServingEducators === null) return pendingHeadcount(readinessLayerSourceLabel);
  return sourceBackedHeadcount(summary.totalServingEducators, readinessLayerSourceLabel);
}

function getHighSchoolHeadcount(
  year: ExecutiveOrgYear,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> {
  const summary = getMsHsStaffingReadinessSummary({ year }).highSchool;
  if (summary.activeGrades.length === 0) return notApplicableHeadcount();
  if (summary.totalServingEducators === null) return pendingHeadcount(readinessLayerSourceLabel);
  return sourceBackedHeadcount(summary.totalServingEducators, readinessLayerSourceLabel);
}

function getIncrementalExistingRoleHeadcount(
  roleId: string,
  baselineYear: ExecutiveOrgYear,
  year: ExecutiveOrgYear,
  sourceLabel: string,
): Pick<OrgTreeNode, "headcountValue" | "headcountStatus" | "headcountSourceLabel"> {
  const role = getExistingRole(roleId);

  if (!role) return pendingHeadcount("Existing role mapping unresolved");

  return sourceBackedHeadcount(
    Math.max(0, (role.headcount[year] ?? 0) - (role.headcount[baselineYear] ?? 0)),
    sourceLabel,
  );
}

function isMiddleSchoolActive(year: ExecutiveOrgYear) {
  return getMsHsStaffingReadinessSummary({ year }).middleSchool.activeGrades.length > 0;
}

function isHighSchoolActive(year: ExecutiveOrgYear) {
  return getMsHsStaffingReadinessSummary({ year }).highSchool.activeGrades.length > 0;
}

function getYearSignal(year: ExecutiveOrgYear) {
  if (year < 2031) return `${year}: Base opening structure`;
  if (year < 2033) return `${year}: MS begins, HC pending`;
  if (year === 2033) return "2033: MS full model, 8 core + 1 flexible = 9";
  if (year < 2037) return `${year}: HS ramp active`;
  return "2037: Mature secondary envelope, 18 core + 2 flexible = 20";
}

function futureDivisionNodes(year: ExecutiveOrgYear): OrgTreeNode[] {
  const summary = getMsHsStaffingReadinessSummary({ year });
  const msGrades = formatGrades(summary.middleSchool.activeGrades);
  const hsGrades = formatGrades(summary.highSchool.activeGrades);
  const middleSchoolActive = summary.middleSchool.activeGrades.length > 0;
  const highSchoolActive = summary.highSchool.activeGrades.length > 0;
  const capacity = SECONDARY_EDUCATOR_CAPACITY_MODEL;

  return [
    {
      id: "middle-school-secondary-educators",
      label: "Middle School Educators",
      badge: middleSchoolActive ? "Readiness layer" : "Inactive",
      note: middleSchoolActive
        ? `${msGrades} · ${summary.middleSchool.fullModelCoreEducators} core + ${summary.middleSchool.fullModelFlexibleEducators} flexible = ${summary.middleSchool.fullModelTotalEducators} mature planning envelope`
        : msGrades,
      variant: "yearBased",
      headcountBasisNote: "Instructional-capacity planning only; not payroll authorization.",
      ...getMiddleSchoolHeadcount(year),
    },
    {
      id: "high-school-secondary-educators",
      label: "High School Educators",
      badge: highSchoolActive ? "Readiness layer" : "Inactive",
      note: highSchoolActive
        ? `${hsGrades} · ${summary.highSchool.fullModelCoreEducators} core + ${summary.highSchool.fullModelFlexibleEducators} flexible = ${summary.highSchool.fullModelTotalEducators} mature planning envelope`
        : hsGrades,
      variant: "yearBased",
      headcountBasisNote: "Instructional-capacity planning only; final sufficiency remains timetable-conditional.",
      ...getHighSchoolHeadcount(year),
    },
    {
      id: "combined-secondary-planning-envelope",
      label: "Combined Secondary Planning Envelope",
      badge: "Conditional",
      note: `${capacity.combined.coreEducators} core + ${capacity.combined.flexibleEducators} flexible = ${capacity.combined.combinedPool}`,
      variant: "guardrail",
      headcountBasisNote:
        "Mature instructional-capacity envelope; not final hiring approval or payroll authorization.",
      packageBasisNote: capacity.boardExplanation.governanceNote,
      children: capacity.sharedSpecialistGovernance.map((entry) => ({
        id: `shared-role-${entry.id}`,
        label: entry.label,
        badge: entry.countedInSecondaryTwenty ? "Inside 20" : entry.treatment === "excluded_legacy_pool" ? "Excluded" : "Count once",
        note: entry.notes,
        variant: "guardrail" as const,
        ...notApplicableHeadcount(),
      })),
      ...sourceBackedHeadcount(capacity.combined.combinedPool, readinessLayerSourceLabel),
    },
    {
      id: "hs-pool-excluded",
      label: "HS pool",
      badge: "Guardrail",
      note: "Excluded from HS totals",
      variant: "guardrail",
      ...notApplicableHeadcount(),
    },
  ];
}

function buildOperationsBranch(
  scenario: ExecutiveOrgScenario,
  year: ExecutiveOrgYear,
): OrgTreeNode {
  const children: OrgTreeNode[] = [
    {
      id: "operations-coordinator",
      label: "Operations Coordinator",
      variant: "base",
      ...getExistingRoleHeadcount("ops", year),
    },
    {
      id: "secretary",
      label: "Registrar",
      variant: "base",
      ...getExistingRoleHeadcount("secretary", year),
      children: [
        {
          id: "secretary-family-dotted",
          label: "Enrollment support",
          badge: "Dotted line",
          note: "To Family Services",
          variant: "dottedLine",
          ...notApplicableHeadcount(),
        },
      ],
    },
    {
      id: "nurse-intern",
      label: "Nurse Intern",
      variant: "base",
      ...getExistingRoleHeadcount("nursing_intern", year),
    },
    {
      id: "nurse-technician",
      label: "Nurse Technician",
      variant: "base",
      ...getExistingRoleHeadcount("nurse", year),
    },
    {
      id: "security-clerks",
      label: "Security / Clerks",
      variant: "base",
      ...getExistingRoleHeadcount("clerk", year),
    },
  ];

  if (scenario !== "minimum") {
    children.push({
      id: "security-coordinator",
      label: "Security Coordinator",
      badge: "Scenario addition",
      note: "Functional line to Clerks",
      variant: "scenarioAddition",
      ...getFixedExtensionHeadcount("security_coordinator", scenario, year),
      children: [
        {
          id: "security-functional-line",
          label: "Security / Clerks",
          badge: "Functional line",
          variant: "dottedLine",
          ...notApplicableHeadcount(),
        },
      ],
    });
  }

  children.push(
    {
      id: "maintenance",
      label: "Maintenance",
      variant: "base",
      ...getExistingRoleHeadcount("maintenance", year),
    },
    {
      id: "marketing-analyst",
      label: "Marketing Analyst",
      variant: "base",
      ...getExistingRoleHeadcount("marketing", year),
    },
    {
      id: "events-assistant",
      label: "Events Assistant",
      badge: "New addition",
      variant: "base",
      ...getFixedExtensionHeadcount("events_assistant", scenario, year),
    },
    {
      id: "financial-analyst",
      label: "Financial Analyst",
      variant: "base",
      ...getExistingRoleHeadcount("finance", year),
    },
  );

  if (shouldRenderExistingRoleForYear("finance_assistant", year)) {
    children.push({
      id: "financial-assistant",
      label: "Financial Assistant",
      variant: "base",
      ...getExistingRoleHeadcount("finance_assistant", year),
    });
  }

  children.push(
    {
      id: "hr-analyst",
      label: "HR Analyst",
      variant: "base",
      ...getExistingRoleHeadcount("hr", year),
    },
  );

  return {
    id: "operations",
    label: "Operations",
    children,
    variant: "base",
  };
}

function buildLearningEcosystemBranch(
  scenario: ExecutiveOrgScenario,
  year: ExecutiveOrgYear,
): OrgTreeNode {
  const children: OrgTreeNode[] = [];

  if (scenario !== "minimum") {
    // Balanced and Premium: Learning Experience Design Hub as umbrella parent
    children.push({
      id: "learning-experience-design-hub",
      label: "Learning Experience Design Hub",
      badge: "Functional hub",
      note: "Balanced and Premium",
      variant: "scenarioAddition",
      ...notApplicableHeadcount(),
      children: [
        {
          id: "learning-experience-designer",
          label: "Learning Experience Designer",
          variant: "base",
          ...getExistingRoleHeadcount("led", year),
        },
        {
          id: "language-acquisition-coach",
          label: "Language Acquisition and Performance Coach",
          badge: "New addition",
          variant: "base",
          ...getFixedExtensionHeadcount("language_acquisition_coach", scenario, year),
        },
        {
          id: "personalized-learning-associate",
          label: "Personalized Learning Associate Educator",
          badge: "Scenario addition",
          note: "Balanced and Premium",
          variant: "scenarioAddition",
          ...getFixedExtensionHeadcount("personalized_learning_associate_educator", scenario, year),
        },
      ],
    });
  } else {
    // Minimum: flat entries without the hub container
    children.push(
      {
        id: "learning-experience-designer",
        label: "Learning Experience Designer",
        variant: "base",
        ...getExistingRoleHeadcount("led", year),
      },
      {
        id: "language-acquisition-coach",
        label: "Language Acquisition and Performance Coach",
        badge: "New addition",
        variant: "base",
        ...getFixedExtensionHeadcount("language_acquisition_coach", scenario, year),
      },
    );
  }

  children.push(
    {
      id: "edtech-coordinator",
      label: "EdTech Coordinator",
      variant: "base",
      ...getExistingRoleHeadcount("edtech", year),
    },
    {
      id: "it-technician",
      label: "IT Technician",
      variant: "base",
      ...getExistingRoleHeadcount("it", year),
    },
    {
      id: "maker-space-assistant",
      label: "Maker Space Assistant",
      badge: "New addition",
      variant: "base",
      ...getFixedExtensionHeadcount("maker_space_assistant", scenario, year),
    },
    {
      id: "after-school-coordinator",
      label: "After School Coordinator",
      variant: "base",
      ...getExistingRoleHeadcount("after_school", year),
    },
  );

  return {
    id: "learning-ecosystem",
    label: "Learning Ecosystem",
    children,
    variant: "base",
  };
}

function buildAcademicDivisionsBranch(year: ExecutiveOrgYear): OrgTreeNode {
  const children: OrgTreeNode[] = [
    {
      id: "ey-principal",
      label: "Early Years Principal",
      variant: "base",
      ...getExistingRoleHeadcount("ey_principal", year),
    },
    {
      id: "ey-counselor",
      label: "EY Counselor",
      variant: "base",
      ...getCounselorHeadcount(),
    },
    {
      id: "ey-educator-package",
      label: "Early Years Educator Package",
      note: "Educator + Assistant + Monitor",
      variant: "base",
      headcountBasisNote: "Section-driven HC: see role-level HC table for grade-level breakdown.",
      packageBasisNote: "Package basis: Reference Educator + Assistant + Monitor.",
      ...modelBackedHeadcount(),
    },
    {
      id: "ls-principal",
      label: "Lower School Principal",
      variant: "base",
      ...getExistingRoleHeadcount("ls_principal", year),
    },
    {
      id: "ls-counselor",
      label: "LS Counselor",
      variant: "base",
      ...getCounselorHeadcount(),
    },
    {
      id: "ls-educator-package",
      label: "Lower School Educator Package",
      note: "Educator + Assistant",
      variant: "base",
      headcountBasisNote: "Section-driven HC: see role-level HC table for grade-level breakdown.",
      packageBasisNote: "Package basis: Reference Educator + Assistant.",
      ...modelBackedHeadcount(),
    },
  ];

  if (isMiddleSchoolActive(year)) {
    children.push(
      {
        id: "ms-principal",
        label: "Middle School Principal",
        variant: "yearBased",
        ...getExistingRoleHeadcount("ms_principal", year),
      },
      {
        id: "ms-counselor",
        label: "MS Counselor",
        variant: "yearBased",
        ...getIncrementalExistingRoleHeadcount(
          "counselor",
          2028,
          year,
          "Existing counselor progression",
        ),
      },
    );
  }

  if (isHighSchoolActive(year)) {
    children.push(
      {
        id: "hs-principal",
        label: "High School Principal",
        variant: "yearBased",
        ...getExistingRoleHeadcount("hs_principal", year),
      },
      {
        id: "hs-counselor",
        label: "HS Counselor",
        variant: "yearBased",
        ...getHsCounselorHeadcount(),
      },
    );
  }

  children.push({
    id: "specialist-educators",
    label: "Specialist Educators",
    badge: "Dotted line",
    note: "To EY and LS Principals",
    variant: "dottedLine",
    headcountBasisNote: "Aggregate node: individual specialist roles source separately.",
    ...pendingHeadcount("Aggregate specialist composition unresolved"),
    children: [
      {
        id: "arts-educator",
        label: "Arts Educator",
        variant: "base",
        ...getExistingRoleHeadcount("arts", year),
      },
      {
        id: "body-movement-educator",
        label: "Body & Movement Educator",
        variant: "base",
        ...getExistingRoleHeadcount("body", year),
      },
      {
        id: "music-educator",
        label: "Music Educator",
        variant: "base",
        ...getExistingRoleHeadcount("music", year),
      },
    ],
  });

  return {
    id: "academic-divisions",
    label: "Academic Divisions",
    variant: "base",
    children,
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
            ...getFixedExtensionHeadcount("curriculum_and_assessment_designer", scenario, year),
          },
        ]
      : [];

  const root: OrgTreeNode = {
    id: "head-of-school",
    label: "Head of School",
    badge: "Root",
    ...getExistingRoleHeadcount("hos", year),
    children: [
      ...premiumChildren,
      buildOperationsBranch(scenario, year),
      buildAcademicDivisionsBranch(year),
      buildLearningEcosystemBranch(scenario, year),
      {
        id: "community-library",
        label: "Community & Library",
        variant: "base",
        children: [
          {
            id: "enrollment-family-services",
            label: "Enrollment & Family Services Coordinator",
            variant: "base",
            ...pendingHeadcount("Existing payroll role mapping unresolved"),
          },
          {
            id: "family-engagement-analyst",
            label: "Family Engagement Analyst",
            variant: "base",
            ...getExistingRoleHeadcount("family", year),
          },
          {
            id: "secretary-dotted-support",
            label: "Registrar dotted-line support",
            badge: "Dotted line",
            variant: "dottedLine",
            ...notApplicableHeadcount(),
          },
          {
            id: "librarian",
            label: "Inspirationeer / Librarian",
            variant: "base",
            ...getExistingRoleHeadcount("library", year),
          },
          {
            id: "librarian-principal-support",
            label: "Principal support line",
            badge: "Dotted line",
            note: "Supports EY and LS",
            variant: "dottedLine",
            ...notApplicableHeadcount(),
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
        note: "Active selected-year structure. Use progression to see roles activate over time.",
      },
      {
        label: "HC status",
        value: "Secondary envelope represented",
        note: "MS/HS future-division nodes now show the mature 18 core + 2 flexible = 20 instructional planning pool.",
      },
      {
        label: "Planning status",
        value: "Planning model — not board-ratified headcount authorization.",
        note: SECONDARY_EDUCATOR_CAPACITY_MODEL.boardExplanation.governanceNote,
      },
      {
        label: "Source guardrails",
        value: "HC appears only where source-backed or canonically authorized.",
        note: "Section-driven packages remain pending until inputs fully resolve. Hubs, support lines, aggregates, and guardrails are explanatory, not additional HC roles.",
      },
    ],
  };
}
