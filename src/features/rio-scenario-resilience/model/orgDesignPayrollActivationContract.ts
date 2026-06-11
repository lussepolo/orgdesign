import type { OrgDesignStructureOptionId } from "../data/orgDesignStructure";

// Phase 13H (2026-06-09): this literal ("designed_not_implemented") and the
// fopagCalculationReady/calculationReady literals below reflect the Phase 8G (2026-06-03)
// design-snapshot status of ORG_DESIGN_PAYROLL_ACTIVATION. They are SUPERSEDED by the
// Phase 8H/8I/11B implementation (payrollAdapter.ts, fopagEngine.ts), which consumes these
// records as data. Current FOPAG readiness is FopagEngineOutput.calculationReady
// (fopagEngineContract.ts), computed dynamically per scenario by calculateFopag().
export type OrgDesignPayrollActivationStatus = "designed_not_implemented";

export type OrgDesignPayrollActivationRoleSourceType =
  | "baseline_role"
  | "extension_uses_existing_payroll_logic"
  | "extension_uses_educator_archetype"
  | "extension_uses_tab_logic";

export type OrgDesignPayrollActivationMappingStatus =
  | "source_resolved_maps_existing_role"
  | "source_resolved_needs_new_record"
  | "missing_allocation_model"
  | "tab_logic_v1_ftes_resolved"
  | "excluded_from_v1";

export type OrgDesignPayrollActivationInclusionStatus =
  | "active_all_options"
  | "active_balanced_and_premium"
  | "active_premium_only"
  | "excluded_from_v1";

export type OrgDesignPayrollActivationOptionScope =
  | "all_options"
  | "balanced_and_premium"
  | "premium_only"
  | "excluded_from_v1";

export interface OrgDesignPayrollActivationRecord {
  orgDesignOptionScope: OrgDesignPayrollActivationOptionScope;
  roleSourceType: OrgDesignPayrollActivationRoleSourceType;
  sourceRoleId: string;
  payrollRoleId: string | null;
  roleName: string;
  activeIn: readonly OrgDesignStructureOptionId[];
  roleInclusionStatus: OrgDesignPayrollActivationInclusionStatus;
  headcountSource: string;
  costSource: string;
  allocationModelSource: string;
  activationYearSource: string;
  mappingStatus: OrgDesignPayrollActivationMappingStatus;
  needsReview: boolean;
  calculationReady: false;
  sourceNotes: string;
}

export interface OrgDesignPayrollActivationDesign {
  activationStatus: OrgDesignPayrollActivationStatus;
  fopagCalculationReady: false;
  approvedAt: string;
  baselineRoleCount: number;
  extensionRoleCount: number;
  baselineActivationRule: string;
  records: readonly OrgDesignPayrollActivationRecord[];
  remainingBlockers: string[];
  sourceNotes: string;
}
