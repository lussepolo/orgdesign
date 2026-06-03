import {
  orgDesignCompensationAliases,
  orgDesignStructure,
  scenarioOfferRoleActivationSourceContract,
  type OrgDesignCompensationAlias,
  type OrgDesignStructureOption,
} from "../../features/rio-scenario-resilience/data/orgDesignStructure";

export type OrgDesignOptionId = OrgDesignStructureOption["id"];
export type OrgDesignRoleRef = OrgDesignCompensationAlias;
export type OrgDesignOption = OrgDesignStructureOption;

export const CURRENT_SYSTEM_ROLE_IDS = ["current_positions_in_system"] as const;

export const ORG_DESIGN_ROLE_LIBRARY = orgDesignCompensationAliases;

export const SCENARIO_OFFER_ROLE_ACTIVATION_SOURCE_CONTRACT =
  scenarioOfferRoleActivationSourceContract;

export const ORG_DESIGN_OPTIONS = orgDesignStructure;
