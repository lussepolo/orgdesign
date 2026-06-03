export type OrgDesignStructureOptionId =
  | "minimum_experience"
  | "balanced_experience"
  | "premium_experience";

export type ExistingTeachingCompensationRoleId =
  | "associate"
  | "specialist"
  | "master";

export type ExistingTeachingCompensationRoleName =
  | "Associate Educator"
  | "Specialist Educator"
  | "Master Educator";

export type OrgDesignDisplayRoleId =
  | "academic_performance_coach"
  | "maker_assistant"
  | "curriculum_and_assessment_designer"
  | "personalized_learning_associate_educator"
  | "security_coordinator";

export interface ExistingTeachingCompensationRoleRef {
  sourceFile: "src/constants/teaching.ts";
  sourceExport: "EDUCATOR_LEVELS";
  roleId: ExistingTeachingCompensationRoleId;
  roleName: ExistingTeachingCompensationRoleName;
}

export interface OrgDesignCompensationAlias {
  roleId: OrgDesignDisplayRoleId;
  displayRole: string;
  compensationRole: ExistingTeachingCompensationRoleRef;
  aliasStatus: "compensation_alias_only";
  payrollModelingRule: "inherit_existing_compensation_role_without_new_salary_values";
}

export interface ScenarioOfferRoleActivationSourceContract {
  sourceFile: "src/components/sections/OfferScenariosTab.tsx";
  sourceExport: "pedagogicalOfferScenarios";
  status: "blocked_narrative_ui_only";
  blockingReason:
    "Scenario Offer role activation data is encoded as narrative UI strings, not normalized role activation records.";
  observedNarrativeFields: readonly [
    "roles",
    "classroomPackage",
    "specialistEcosystem",
    "signaturePrograms",
    "notActiveYet",
  ];
  requiredMachineReadableFields: readonly [
    "sourceScenarioId",
    "orgDesignOptionId",
    "displayRoleId",
    "displayRole",
    "activationState",
    "activationYear",
    "fteOrHeadcountRule",
    "compensationRoleId",
    "allocationModel",
    "sourceValidationStatus",
  ];
}

export interface OrgDesignStructureOption {
  id: OrgDesignStructureOptionId;
  label: string;
  description: string;
  baselineRoleSet: "current_positions_in_system";
  additionalRoleIds: readonly OrgDesignDisplayRoleId[];
  availableCompensationAliasIds: readonly OrgDesignDisplayRoleId[];
  sourceOfferScenarioContractStatus: ScenarioOfferRoleActivationSourceContract["status"];
  roleActivationStatus: "blocked_until_machine_readable_scenario_offer_mapping";
  financialStatus: "blocked_until_role_costs_validated";
}

const specialistEducatorCompensation: ExistingTeachingCompensationRoleRef = {
  sourceFile: "src/constants/teaching.ts",
  sourceExport: "EDUCATOR_LEVELS",
  roleId: "specialist",
  roleName: "Specialist Educator",
};

const associateEducatorCompensation: ExistingTeachingCompensationRoleRef = {
  sourceFile: "src/constants/teaching.ts",
  sourceExport: "EDUCATOR_LEVELS",
  roleId: "associate",
  roleName: "Associate Educator",
};

const masterEducatorCompensation: ExistingTeachingCompensationRoleRef = {
  sourceFile: "src/constants/teaching.ts",
  sourceExport: "EDUCATOR_LEVELS",
  roleId: "master",
  roleName: "Master Educator",
};

export const scenarioOfferRoleActivationSourceContract: ScenarioOfferRoleActivationSourceContract =
  {
    sourceFile: "src/components/sections/OfferScenariosTab.tsx",
    sourceExport: "pedagogicalOfferScenarios",
    status: "blocked_narrative_ui_only",
    blockingReason:
      "Scenario Offer role activation data is encoded as narrative UI strings, not normalized role activation records.",
    observedNarrativeFields: [
      "roles",
      "classroomPackage",
      "specialistEcosystem",
      "signaturePrograms",
      "notActiveYet",
    ],
    requiredMachineReadableFields: [
      "sourceScenarioId",
      "orgDesignOptionId",
      "displayRoleId",
      "displayRole",
      "activationState",
      "activationYear",
      "fteOrHeadcountRule",
      "compensationRoleId",
      "allocationModel",
      "sourceValidationStatus",
    ],
  };

export const orgDesignCompensationAliases: readonly OrgDesignCompensationAlias[] =
  [
    {
      roleId: "academic_performance_coach",
      displayRole: "Academic Performance Coach",
      compensationRole: specialistEducatorCompensation,
      aliasStatus: "compensation_alias_only",
      payrollModelingRule:
        "inherit_existing_compensation_role_without_new_salary_values",
    },
    {
      roleId: "maker_assistant",
      displayRole: "Maker Assistant",
      compensationRole: associateEducatorCompensation,
      aliasStatus: "compensation_alias_only",
      payrollModelingRule:
        "inherit_existing_compensation_role_without_new_salary_values",
    },
    {
      roleId: "curriculum_and_assessment_designer",
      displayRole: "Curriculum and Assessment Designer",
      compensationRole: masterEducatorCompensation,
      aliasStatus: "compensation_alias_only",
      payrollModelingRule:
        "inherit_existing_compensation_role_without_new_salary_values",
    },
    {
      roleId: "personalized_learning_associate_educator",
      displayRole: "Personalized Learning Associate Educator",
      compensationRole: associateEducatorCompensation,
      aliasStatus: "compensation_alias_only",
      payrollModelingRule:
        "inherit_existing_compensation_role_without_new_salary_values",
    },
    {
      roleId: "security_coordinator",
      displayRole: "Security Coordinator",
      compensationRole: masterEducatorCompensation,
      aliasStatus: "compensation_alias_only",
      payrollModelingRule:
        "inherit_existing_compensation_role_without_new_salary_values",
    },
  ] as const;

const availableCompensationAliasIds = orgDesignCompensationAliases.map(
  (role) => role.roleId,
);

export const orgDesignStructure: readonly OrgDesignStructureOption[] = [
  {
    id: "minimum_experience",
    label: "Minimum Experience",
    description:
      "Requested org-design option shell. Role activation is blocked until Scenario Offer data is normalized.",
    baselineRoleSet: "current_positions_in_system",
    additionalRoleIds: [],
    availableCompensationAliasIds,
    sourceOfferScenarioContractStatus:
      scenarioOfferRoleActivationSourceContract.status,
    roleActivationStatus:
      "blocked_until_machine_readable_scenario_offer_mapping",
    financialStatus: "blocked_until_role_costs_validated",
  },
  {
    id: "balanced_experience",
    label: "Balanced Experience",
    description:
      "Requested org-design option shell. Role activation is blocked until Scenario Offer data is normalized.",
    baselineRoleSet: "current_positions_in_system",
    additionalRoleIds: [],
    availableCompensationAliasIds,
    sourceOfferScenarioContractStatus:
      scenarioOfferRoleActivationSourceContract.status,
    roleActivationStatus:
      "blocked_until_machine_readable_scenario_offer_mapping",
    financialStatus: "blocked_until_role_costs_validated",
  },
  {
    id: "premium_experience",
    label: "Premium Experience",
    description:
      "Requested org-design option shell. Role activation is blocked until Scenario Offer data is normalized.",
    baselineRoleSet: "current_positions_in_system",
    additionalRoleIds: [],
    availableCompensationAliasIds,
    sourceOfferScenarioContractStatus:
      scenarioOfferRoleActivationSourceContract.status,
    roleActivationStatus:
      "blocked_until_machine_readable_scenario_offer_mapping",
    financialStatus: "blocked_until_role_costs_validated",
  },
] as const;
