import type { OrgDesignStructureOptionId as OrgDesignOptionId } from "./orgDesignStructure";

export type OrgDesignRoleSourceType =
  | "existing_payroll_role"
  | "existing_compensation_archetype"
  | "scenario_extension_role"
  | "functional_umbrella"
  | "label_alias"
  | "classification_override"
  | "uses_existing_tab_logic";

export type OrgDesignActivationStatus =
  | "ready_for_source_contract"
  | "uses_existing_payroll_logic"
  | "uses_existing_tab_logic"
  | "not_a_payroll_role"
  | "blocked_pending_validation";

export type OrgDesignCompensationArchetypeId =
  | "associate_educator"
  | "master_educator"
  | "learning_monitor";

export type OrgDesignHeadcountSource =
  | "fixed"
  | "existing_payroll_logic"
  | "tab_derived"
  | "not_applicable";

export type OrgDesignActivationYearSource =
  | "fixed"
  | "existing_payroll_logic"
  | "tab_derived"
  | "not_applicable";

export interface OrgDesignScenarioExtensionRole {
  id: string;
  displayLabel: string;
  sourceType: OrgDesignRoleSourceType;
  normalizedExistingRoleId?: string;
  compensationArchetypeId?: OrgDesignCompensationArchetypeId;
  headcount?: number;
  headcountSource?: OrgDesignHeadcountSource;
  activationYear?: number;
  activationYearSource?: OrgDesignActivationYearSource;
  activeIn: readonly OrgDesignOptionId[];
  activationStatus: OrgDesignActivationStatus;
  reportsTo?: string;
  functionalReportsTo?: string[];
  sourceFiles?: string[];
  notes: string[];
}

export const ALL_ORG_DESIGN_OPTIONS: readonly OrgDesignOptionId[] = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
] as const;

export const BALANCED_AND_PREMIUM_ORG_DESIGN_OPTIONS: readonly OrgDesignOptionId[] =
  ["balanced_experience", "premium_experience"] as const;

export const PREMIUM_ORG_DESIGN_OPTIONS: readonly OrgDesignOptionId[] = [
  "premium_experience",
] as const;

export const orgDesignScenarioExtensionRoles: readonly OrgDesignScenarioExtensionRole[] =
  [
    {
      id: "security_clerks",
      displayLabel: "Security / Clerks",
      sourceType: "label_alias",
      normalizedExistingRoleId: "clerk",
      headcountSource: "existing_payroll_logic",
      activationYearSource: "existing_payroll_logic",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_payroll_logic",
      sourceFiles: ["src/constants/leadership.ts"],
      notes: [
        "Normalizes to the existing Clerk / Portaria payroll role.",
        "Uses the headcount already in the system.",
        "Do not add extra Clerk / Portaria headcount in Balanced or Premium.",
        "Security Coordinator changes governance only and does not create extra Clerk / Portaria HC.",
      ],
    },
    {
      id: "events_assistant",
      displayLabel: "Events Assistant",
      sourceType: "scenario_extension_role",
      compensationArchetypeId: "learning_monitor",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "operations_coordinator",
      sourceFiles: ["src/constants/teaching.ts"],
      notes: [
        "New scenario-extension role; not in previous headcount.",
        "Uses existing Learning Monitor compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "maker_space_assistant",
      displayLabel: "Maker Space Assistant",
      sourceType: "label_alias",
      normalizedExistingRoleId: "maker_assistant",
      compensationArchetypeId: "associate_educator",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "edtech_coordinator",
      sourceFiles: [
        "src/features/rio-scenario-resilience/data/orgDesignStructure.ts",
        "src/constants/teaching.ts",
      ],
      notes: [
        "Maker Space Assistant is the same role as Maker Assistant.",
        "Use normalized display label Maker Space Assistant.",
        "Uses existing Associate Educator compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "language_acquisition_coach",
      displayLabel: "Language Acquisition Coach",
      sourceType: "scenario_extension_role",
      compensationArchetypeId: "master_educator",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/teaching.ts"],
      notes: [
        "Language Acquisition and Performance Coach is not a separate role.",
        "Uses existing Master Educator compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "personalized_learning_associate_educator",
      displayLabel: "Personalized Learning Associate Educator",
      sourceType: "scenario_extension_role",
      compensationArchetypeId: "associate_educator",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: BALANCED_AND_PREMIUM_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "language_acquisition_coach",
      sourceFiles: ["src/constants/teaching.ts"],
      notes: [
        "Active in Balanced and Premium only.",
        "Uses existing Associate Educator compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "security_coordinator",
      displayLabel: "Security Coordinator",
      sourceType: "scenario_extension_role",
      compensationArchetypeId: "master_educator",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: BALANCED_AND_PREMIUM_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "head_of_school",
      functionalReportsTo: ["security_clerks"],
      sourceFiles: ["src/constants/teaching.ts"],
      notes: [
        "Active in Balanced and Premium only.",
        "Security / Clerks functionally respond to this role in Balanced and Premium.",
        "Does not add extra Clerk / Portaria headcount.",
        "Uses existing Master Educator compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "curriculum_and_assessment_designer",
      displayLabel: "Curriculum and Assessment Designer",
      sourceType: "scenario_extension_role",
      compensationArchetypeId: "master_educator",
      headcount: 1,
      headcountSource: "fixed",
      activationYear: 2028,
      activationYearSource: "fixed",
      activeIn: PREMIUM_ORG_DESIGN_OPTIONS,
      activationStatus: "ready_for_source_contract",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/teaching.ts"],
      notes: [
        "Active in Premium only.",
        "Uses existing Master Educator compensation archetype.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "librarian",
      displayLabel: "Librarian",
      sourceType: "label_alias",
      normalizedExistingRoleId: "library",
      headcountSource: "existing_payroll_logic",
      activationYearSource: "existing_payroll_logic",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_payroll_logic",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/leadership.ts"],
      notes: [
        "Maps to existing Inspirationeer / library role.",
        "Uses existing payroll role and headcount logic.",
        "Do not create a new Librarian payroll role.",
      ],
    },
    {
      id: "early_years_principal",
      displayLabel: "Early Years Principal",
      sourceType: "label_alias",
      normalizedExistingRoleId: "ey_principal",
      headcountSource: "existing_payroll_logic",
      activationYearSource: "existing_payroll_logic",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_payroll_logic",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/leadership.ts"],
      notes: [
        "Maps to existing EY Coordinator payroll role.",
        "Uses existing payroll role and headcount logic.",
        "Do not create a new Principal payroll role.",
      ],
    },
    {
      id: "lower_school_principal",
      displayLabel: "Lower School Principal",
      sourceType: "label_alias",
      normalizedExistingRoleId: "ls_principal",
      headcountSource: "existing_payroll_logic",
      activationYearSource: "existing_payroll_logic",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_payroll_logic",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/leadership.ts"],
      notes: [
        "Maps to existing LS Coordinator payroll role.",
        "Uses existing payroll role and headcount logic.",
        "Do not create a new Principal payroll role.",
      ],
    },
    {
      id: "after_school_coordinator",
      displayLabel: "After School Coordinator",
      sourceType: "classification_override",
      normalizedExistingRoleId: "after_school",
      headcountSource: "existing_payroll_logic",
      activationYearSource: "existing_payroll_logic",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_payroll_logic",
      reportsTo: "head_of_school",
      sourceFiles: ["src/constants/leadership.ts"],
      notes: [
        "Display label becomes After School Coordinator.",
        "Uses existing After School Educator compensation and headcount logic.",
        "Represent as a leadership / coordination function in the org-design layer.",
        "Do not change salary, headcount, payroll formula, or payroll totals.",
      ],
    },
    {
      id: "middle_school_educators",
      displayLabel: "Middle School Educators",
      sourceType: "uses_existing_tab_logic",
      compensationArchetypeId: "master_educator",
      headcountSource: "tab_derived",
      activationYearSource: "tab_derived",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_tab_logic",
      sourceFiles: [
        "src/components/sections/MiddleSchoolTab.tsx",
        "src/components/sections/middleSchoolLoadModel.ts",
      ],
      notes: [
        "Use existing Middle School tab/model staffing logic.",
        "Use Master Educator salary, cost, and benefits archetype.",
        "Headcount/load logic is tab-derived.",
        "Activation year/opening trigger logic is tab-derived.",
        "Do not duplicate MS educator headcount.",
        "Do not use prior hardcoded MS educator assumptions.",
        "Payroll activation is not wired yet.",
      ],
    },
    {
      id: "high_school_educators",
      displayLabel: "High School Educators",
      sourceType: "uses_existing_tab_logic",
      compensationArchetypeId: "master_educator",
      headcountSource: "tab_derived",
      activationYearSource: "tab_derived",
      activeIn: ALL_ORG_DESIGN_OPTIONS,
      activationStatus: "uses_existing_tab_logic",
      sourceFiles: [
        "src/components/sections/HighSchoolTab.tsx",
        "src/components/sections/highSchoolScheduleModel.ts",
      ],
      notes: [
        "Use existing High School tab/model staffing logic.",
        "Use Master Educator salary, cost, and benefits archetype.",
        "Headcount/load logic is tab-derived.",
        "Activation year/opening trigger logic is tab-derived.",
        "Do not duplicate HS educator headcount.",
        "Do not use prior hardcoded HS educator assumptions.",
        "HS tab validation notes must be reconciled before payroll activation.",
        "Payroll activation is not wired yet.",
      ],
    },
  ] as const;
