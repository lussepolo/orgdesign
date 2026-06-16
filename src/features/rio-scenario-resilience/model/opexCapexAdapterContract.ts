import type {
  EnrollmentByYearAndGrade,
  ProjectionYear,
} from "./revenueInputs";

export type FinancialSourceOwnership =
  | "simulator_owned"
  | "existing_viability_reference"
  | "mapped_existing_viability_utility"
  | "unmapped";

export type CostBehaviorType =
  | "fixed"
  | "variable_per_student"
  | "variable_per_section"
  | "step_cost"
  | "one_time"
  | "recurring"
  | "unclassified";

export type OpexItemType =
  | "baseline_opex"
  | "service_contract"
  | "other_operating_cost"
  | "unclassified";

export type CapexItemType =
  | "initial_capex"
  | "recurring_capex"
  | "structured_capex_category"
  | "contingency"
  | "unclassified";

export type OperatingCostValidationStatus =
  | "validated"
  | "missing_category"
  | "missing_cost_or_driver"
  | "missing_cost_behavior"
  | "missing_activation_year"
  | "missing_escalation_rule"
  | "missing_opex_type"
  | "unmapped";

export type CapexValidationStatus =
  | "validated"
  | "missing_capex_option"
  | "missing_category"
  | "missing_amount"
  | "missing_year_or_schedule"
  | "missing_recurring_classification"
  | "missing_contingency_rule"
  | "missing_source_ownership"
  | "unmapped";

export type OpexCapexAdapterInputStatus =
  | "validated"
  | "missing"
  | "needs_mapping"
  | "blocked";

export type OpexCapexAdapterOutputStatus =
  | "available"
  | "blocked_missing_input"
  | "blocked_mapping_pending"
  | "blocked_cost_validation"
  | "blocked_not_implemented";

export type FinancialYearValue = Record<ProjectionYear, number | null>;

export type TotalEnrollmentByYear = Record<ProjectionYear, number | null>;

export interface ValidatedOpexItem {
  itemId: string;
  label: string;
  sourceOwnership: FinancialSourceOwnership;
  itemType: OpexItemType;
  costBehavior: CostBehaviorType;
  validationStatus: OperatingCostValidationStatus;
  activationYear: ProjectionYear | null;
  annualCostBRL: number | null;
  costDriverValueBRL: number | null;
  escalationRate: number | null;
  notes?: string;
}

export interface ValidatedServiceContractItem extends ValidatedOpexItem {
  itemType: "service_contract";
  serviceContractOptionId: string | null;
}

export type ValidatedOpexInputs = Record<string, ValidatedOpexItem>;

export type ValidatedServiceContractInputs = Record<
  string,
  ValidatedServiceContractItem
>;

export interface ValidatedCapexItem {
  itemId: string;
  label: string;
  sourceOwnership: FinancialSourceOwnership;
  capexOptionId: string | null;
  itemType: CapexItemType;
  costBehavior: CostBehaviorType;
  validationStatus: CapexValidationStatus;
  amountBRL: number | null;
  year: ProjectionYear | null;
  scheduleByYear: Partial<Record<ProjectionYear, number>> | null;
  contingencyRate: number | null;
  notes?: string;
}

export type ValidatedCapexScheduleInputs = Record<string, ValidatedCapexItem>;

export interface OpexCapexAdapterInputReadiness {
  selectedServiceContractsOptionId: OpexCapexAdapterInputStatus;
  selectedCapexOptionId: OpexCapexAdapterInputStatus;
  enrollmentByYearAndGrade: OpexCapexAdapterInputStatus;
  totalEnrollmentByYear: OpexCapexAdapterInputStatus;
  validatedServiceContractInputs: OpexCapexAdapterInputStatus;
  validatedOpexInputs: OpexCapexAdapterInputStatus;
  validatedCapexScheduleInputs: OpexCapexAdapterInputStatus;
  discountRateForVpl: OpexCapexAdapterInputStatus;
}

export interface OpexCapexAdapterInput {
  selectedServiceContractsOptionId: string | null;
  selectedCapexOptionId: string | null;
  enrollmentByYearAndGrade: EnrollmentByYearAndGrade | null;
  totalEnrollmentByYear: TotalEnrollmentByYear | null;
  validatedServiceContractInputs: ValidatedServiceContractInputs | null;
  validatedOpexInputs: ValidatedOpexInputs | null;
  validatedCapexScheduleInputs: ValidatedCapexScheduleInputs | null;
  discountRateForVpl: number | null;
  readiness: OpexCapexAdapterInputReadiness;
}

export interface OpexCapexOutputCompositionRule {
  opexByYearIncludesServiceContracts: boolean;
  totalCapexByYearIncludesRecurringCapex: boolean;
  discountRateForVplIsPassThroughOnly: boolean;
  notes?: string;
}

export interface CashFlowInputReadiness {
  receita: OpexCapexAdapterInputStatus;
  payroll: OpexCapexAdapterInputStatus;
  opex: OpexCapexAdapterInputStatus;
  capex: OpexCapexAdapterInputStatus;
  discountRateForVpl: OpexCapexAdapterInputStatus;
}

export interface MissingOpexAssumption {
  itemId: string;
  label: string;
  missingFields: OperatingCostValidationStatus[];
  notes?: string;
}

export interface MissingCapexAssumption {
  itemId: string;
  label: string;
  missingFields: CapexValidationStatus[];
  notes?: string;
}

export interface BlockedOpexItem {
  itemId: string;
  label: string;
  reason:
    | "missing_opex_assumption"
    | "missing_service_contract_mapping"
    | "missing_cost_behavior"
    | "missing_activation_year"
    | "unmapped_item";
  notes?: string;
}

export interface BlockedCapexItem {
  itemId: string;
  label: string;
  reason:
    | "missing_capex_assumption"
    | "missing_capex_option_mapping"
    | "missing_schedule"
    | "missing_recurring_classification"
    | "unmapped_item";
  notes?: string;
}

export interface OpexCapexAdapterOutput {
  status: OpexCapexAdapterOutputStatus;
  opexByYear: FinancialYearValue | null;
  serviceContractsByYear: FinancialYearValue | null;
  capexByYear: FinancialYearValue | null;
  recurringCapexByYear: FinancialYearValue | null;
  totalCapexByYear: FinancialYearValue | null;
  cashFlowInputReadiness: CashFlowInputReadiness;
  compositionRule: OpexCapexOutputCompositionRule;
  blockedOpexItems: BlockedOpexItem[];
  blockedCapexItems: BlockedCapexItem[];
  missingOpexAssumptions: MissingOpexAssumption[];
  missingCapexAssumptions: MissingCapexAssumption[];
  notes?: string;
}

export const EMPTY_OPEX_CAPEX_ADAPTER_INPUT: OpexCapexAdapterInput = {
  selectedServiceContractsOptionId: null,
  selectedCapexOptionId: null,
  enrollmentByYearAndGrade: null,
  totalEnrollmentByYear: null,
  validatedServiceContractInputs: null,
  validatedOpexInputs: null,
  validatedCapexScheduleInputs: null,
  discountRateForVpl: null,
  readiness: {
    selectedServiceContractsOptionId: "missing",
    selectedCapexOptionId: "missing",
    enrollmentByYearAndGrade: "missing",
    totalEnrollmentByYear: "missing",
    validatedServiceContractInputs: "missing",
    validatedOpexInputs: "missing",
    validatedCapexScheduleInputs: "missing",
    discountRateForVpl: "missing",
  },
};

export const EMPTY_OPEX_CAPEX_ADAPTER_OUTPUT: OpexCapexAdapterOutput = {
  status: "blocked_not_implemented",
  opexByYear: null,
  serviceContractsByYear: null,
  capexByYear: null,
  recurringCapexByYear: null,
  totalCapexByYear: null,
  cashFlowInputReadiness: {
    receita: "missing",
    payroll: "missing",
    opex: "missing",
    capex: "missing",
    discountRateForVpl: "missing",
  },
  compositionRule: {
    opexByYearIncludesServiceContracts: false,
    totalCapexByYearIncludesRecurringCapex: true,
    discountRateForVplIsPassThroughOnly: true,
    notes:
      "Composition rules are explicit contract defaults only; they do not represent calculated values.",
  },
  blockedOpexItems: [],
  blockedCapexItems: [],
  missingOpexAssumptions: [],
  missingCapexAssumptions: [],
  notes:
    "OPEX/CAPEX adapter contract exists, but adapter implementation has not been created.",
};
