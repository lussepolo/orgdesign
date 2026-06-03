import type { ScenarioOutputId } from "./scenarioCalculationBoundaryContract";

export const AUTHORITATIVE_TOP_LEVEL_DECISION_LEVER_IDS = [
  "opening_grades",
  "occupancy_enrollment",
  "org_design_structure",
  "ms_hs_progression_model",
  "tuition",
  "service_contracts",
  "capex",
] as const;

export type AuthoritativeTopLevelDecisionLeverId =
  (typeof AUTHORITATIVE_TOP_LEVEL_DECISION_LEVER_IDS)[number];

export type InputReadinessStatus =
  | "confirmed"
  | "structural_only"
  | "missing_value"
  | "needs_mapping"
  | "blocked"
  | "not_required_yet";

export type InputFamily =
  | "revenue"
  | "payroll"
  | "opex_capex"
  | "scenario_lever"
  | "governance"
  | "scenario_boundary";

export type InputSourceOwnership =
  | "simulator_owned"
  | "mapped_existing_source"
  | "reference_only"
  | "unmapped"
  | "not_applicable";

export type InputReadinessId =
  | "selected_opening_grades_option"
  | "construction_year"
  | "opening_year"
  | "grade_to_division_mapping"
  | "active_grades_by_year"
  | "enrollment_by_year_and_grade"
  | "total_enrollment_by_year"
  | "selected_tuition_scenario"
  | "tuition_by_scenario_and_grade"
  | "discount_assumptions"
  | "annual_tuition_adjustment_assumptions"
  | "occupancy_input"
  | "selected_ms_hs_progression_model"
  | "selected_org_design_option"
  | "baseline_role_set"
  | "org_design_extension_roles"
  | "validated_role_cost_map"
  | "teaching_compensation_data"
  | "staffing_rules"
  | "sections_by_year_and_grade"
  | "fte_headcount_rules"
  | "payroll_allocation_category"
  | "payroll_adapter_output"
  | "selected_service_contract_option"
  | "validated_service_contract_inputs"
  | "validated_baseline_opex_inputs"
  | "selected_capex_option"
  | "validated_capex_schedule_inputs"
  | "recurring_capex_classification"
  | "capex_source_ownership"
  | "discount_rate_for_npv"
  | "governance_thresholds"
  | "opex_capex_adapter_output"
  | "receita_output"
  | "payroll_fopag_output"
  | "fopag_receita_ratio_output"
  | "opex_output"
  | "capex_output"
  | "capex_exposure_output"
  | "ebitda_output"
  | "ebitda_margin_output"
  | "cumulative_result_output"
  | "break_even_output"
  | "npv_output"
  | "simple_payback_output"
  | "discounted_payback_output"
  | "scenario_tier_output"
  | "sensitivity_resilience_outputs";

export type InputBlockingReason =
  | "none"
  | "missing_normalized_schedule"
  | "missing_validated_value"
  | "missing_mapping"
  | "missing_role_cost_validation"
  | "missing_staffing_validation"
  | "missing_service_contract_validation"
  | "missing_opex_validation"
  | "missing_capex_validation"
  | "missing_formula_definition"
  | "missing_adapter_implementation"
  | "missing_upstream_output"
  | "missing_interpretation_rules"
  | "not_required_until_upstream_ready";

export interface InputReadinessRecord {
  inputId: InputReadinessId;
  inputFamily: InputFamily;
  label: string;
  status: InputReadinessStatus;
  currentSource: string;
  sourceOwnership: InputSourceOwnership;
  canUseForCalculation: boolean;
  blockingReason: InputBlockingReason;
  requiredNextAction: string;
  dependsOn: InputReadinessId[];
  futureArtifactOrFile: string;
  relatedScenarioOutputId?: ScenarioOutputId;
  notes?: string;
}

export type InputReadinessRegistry = Record<
  InputReadinessId,
  InputReadinessRecord
>;

export const INPUT_READINESS_REGISTRY: InputReadinessRegistry = {
  selected_opening_grades_option: {
    inputId: "selected_opening_grades_option",
    inputFamily: "revenue",
    label: "Selected opening grades option",
    status: "structural_only",
    currentSource: "openingPackageOccupancySourceData.ts; RevenueInputBundle.selectedOpeningGradesOptionId",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Bind a selected opening package to finance-validated direct-year schedules.",
    dependsOn: [],
    futureArtifactOrFile: "future revenue input mapping",
    notes: "Opening package options are final. A selected package and downstream mappings are not calculation-ready.",
  },
  construction_year: {
    inputId: "construction_year",
    inputFamily: "revenue",
    label: "Construction year",
    status: "confirmed",
    currentSource: "data/openingGrades.ts",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: true,
    blockingReason: "none",
    requiredNextAction: "Preserve as confirmed opening-package metadata.",
    dependsOn: ["selected_opening_grades_option"],
    futureArtifactOrFile: "Typed Input Readiness Registry",
    notes: "Confirmed for structural metadata use only.",
  },
  opening_year: {
    inputId: "opening_year",
    inputFamily: "revenue",
    label: "Opening year",
    status: "confirmed",
    currentSource: "data/openingGrades.ts; revenueInputs.ts ProjectionYear",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: true,
    blockingReason: "none",
    requiredNextAction: "Preserve as the confirmed operating opening year.",
    dependsOn: ["selected_opening_grades_option"],
    futureArtifactOrFile: "Typed Input Readiness Registry",
    notes: "Confirmed for model-horizon metadata use only.",
  },
  grade_to_division_mapping: {
    inputId: "grade_to_division_mapping",
    inputFamily: "revenue",
    label: "Grade-to-division mapping",
    status: "confirmed",
    currentSource: "revenueInputs.ts GRADE_DIVISION_MAP",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: true,
    blockingReason: "none",
    requiredNextAction: "Use normalized grade IDs in future simulator-owned inputs.",
    dependsOn: [],
    futureArtifactOrFile: "Typed Input Readiness Registry",
    notes: "Confirmed for normalized structural use; legacy grade keys still require mapping.",
  },
  active_grades_by_year: {
    inputId: "active_grades_by_year",
    inputFamily: "revenue",
    label: "Active grades by year",
    status: "needs_mapping",
    currentSource: "openingPackageOccupancySourceData.ts activeGradeByYearRecords for direct workbook years 2028-2037",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Bind finance-validated direct-year records into the calculation boundary without generating post-2037 values.",
    dependsOn: ["selected_opening_grades_option", "opening_year"],
    futureArtifactOrFile: "future Opening Grades / Occupancy calculation input mapping",
    notes: "Source evidence is ready. Calculation mapping remains blocked.",
  },
  enrollment_by_year_and_grade: {
    inputId: "enrollment_by_year_and_grade",
    inputFamily: "revenue",
    label: "Enrollment by year and grade",
    status: "needs_mapping",
    currentSource: "openingPackageOccupancySourceData.ts enrollmentByYearAndGradeRecords for direct workbook years 2028-2037",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Map the verified direct-year baseline records and keep post-2037 continuation blocked until approved.",
    dependsOn: ["active_grades_by_year", "occupancy_input"],
    futureArtifactOrFile: "future Opening Grades / Occupancy calculation input mapping",
    notes: "Baseline source evidence is ready. Simulated occupancy overrides remain future sensitivity work.",
  },
  total_enrollment_by_year: {
    inputId: "total_enrollment_by_year",
    inputFamily: "revenue",
    label: "Total enrollment by year",
    status: "needs_mapping",
    currentSource: "openingPackageOccupancySourceData.ts totalEnrollmentValidationRecords for direct workbook years 2028-2037",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Preserve workbook totals as validation records and decide the calculation-input boundary separately.",
    dependsOn: ["enrollment_by_year_and_grade"],
    futureArtifactOrFile: "future Opening Grades / Occupancy calculation input mapping",
    notes: "Workbook totals are source evidence, not generated totals.",
  },
  selected_tuition_scenario: {
    inputId: "selected_tuition_scenario",
    inputFamily: "revenue",
    label: "Selected tuition scenario",
    status: "structural_only",
    currentSource: "data/tuitionArchitecture.ts; revenueInputs.ts TuitionScenarioId",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_validated_value",
    requiredNextAction: "Bind a selected architecture only after tuition records exist.",
    dependsOn: [],
    futureArtifactOrFile: "future tuition input artifact",
    notes: "Confirmed for pricing architecture selection only; monetary tuition values are missing.",
  },
  tuition_by_scenario_and_grade: {
    inputId: "tuition_by_scenario_and_grade",
    inputFamily: "revenue",
    label: "Tuition by scenario and grade",
    status: "needs_mapping",
    currentSource: "tuitionSourceData.ts TUITION_SOURCE_RECORDS (57 records, 3 scenarios × 19 courses); tuitionRevenueReadiness.ts TUITION_SCENARIO_ID_MAPPING; enrollmentTuitionGradeMapping.ts ENROLLMENT_TUITION_GRADE_MAPPING (all 17 grades mapped — T1/T2 via confirmed 50/50 learner modality blend)",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_formula_definition",
    requiredNextAction: "Enrollment-to-tuition grade mapping is fully represented. Next step: obtain explicit approval for Receita formula design and implementation.",
    dependsOn: ["selected_tuition_scenario", "grade_to_division_mapping"],
    futureArtifactOrFile: "enrollmentTuitionGradeMapping.ts (fully implemented); future Receita calculation design",
    notes: "Source values are populated in tuitionSourceData.ts. Scenario ID mapping is in tuitionRevenueReadiness.ts. Enrollment-to-tuition grade mapping is fully represented: all 17 grades mapped. T1/T2 use a Finance-confirmed 50/50 learner modality mix — not a price discount. Remaining blocker is Receita formula approval.",
  },
  discount_assumptions: {
    inputId: "discount_assumptions",
    inputFamily: "revenue",
    label: "Discount assumptions",
    status: "confirmed",
    currentSource: "discountScheduleSourceData.ts DISCOUNT_SCHEDULE_SOURCE_DATA; Head of Finance message",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_formula_definition",
    requiredNextAction: "Confirmed. Receita calculation remains blocked by enrollment-to-tuition grade mapping and formula approval.",
    dependsOn: [],
    futureArtifactOrFile: "future Receita calculation design",
    notes: "Average effective discount schedule: 2028–2030: 20%, 2031: 17%, 2032–2033: 15%, 2034+: 12.5% terminal rate. Applies after annual adjustment. Uniform across all scenarios, grades, and opening packages.",
  },
  annual_tuition_adjustment_assumptions: {
    inputId: "annual_tuition_adjustment_assumptions",
    inputFamily: "revenue",
    label: "Annual tuition adjustment assumptions",
    status: "confirmed",
    currentSource: "tuitionRevenueReadiness.ts TUITION_ADJUSTMENT_CONVENTION; financeConventionSourceDecisions.md §2.5, §2.6, §2.8",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_formula_definition",
    requiredNextAction: "Confirmed. Receita calculation remains blocked by enrollment-to-tuition grade mapping and formula approval.",
    dependsOn: [],
    futureArtifactOrFile: "future Receita calculation design",
    notes: "8% per year, compounded annually, starting 2029. Base year 2028 treated as full year. Basis: annual gross contract value.",
  },
  occupancy_input: {
    inputId: "occupancy_input",
    inputFamily: "revenue",
    label: "Occupancy input",
    status: "needs_mapping",
    currentSource: "openingPackageOccupancySourceData.ts occupancyRateRecords for direct workbook years 2028-2037",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Define the baseline occupancy boundary and preserve future simulated overrides for the sensitivity phase.",
    dependsOn: ["selected_opening_grades_option", "active_grades_by_year"],
    futureArtifactOrFile: "future Opening Grades / Occupancy calculation input mapping",
    notes: "Source evidence is ready. Occupancy sensitivity overrides and post-2037 continuation remain blocked.",
  },
  selected_ms_hs_progression_model: {
    inputId: "selected_ms_hs_progression_model",
    inputFamily: "scenario_lever",
    label: "Selected MS/HS progression model",
    status: "needs_mapping",
    currentSource: "Existing app tabs; semantics not yet extracted",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_interpretation_rules",
    requiredNextAction: "Extract MS/HS progression model semantics from app tabs in Phase 4.",
    dependsOn: [],
    futureArtifactOrFile: "future MS/HS progression model semantics artifact",
    notes: "Authoritative top-level lever. Extraction is intentionally deferred until Phase 4.",
  },
  selected_org_design_option: {
    inputId: "selected_org_design_option",
    inputFamily: "payroll",
    label: "Selected org-design option",
    status: "structural_only",
    currentSource: "data/orgDesignStructure.ts orgDesignStructure; data/orgDesignScenarioExtensions.ts orgDesignScenarioExtensionRoles; docs/orgDesignLogic.md",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Review the typed source contract and create a separate payroll integration mapping before binding options to payroll outputs.",
    dependsOn: [],
    futureArtifactOrFile: "future payroll integration mapping for org-design scenario extensions",
  },
  baseline_role_set: {
    inputId: "baseline_role_set",
    inputFamily: "payroll",
    label: "Baseline role set",
    status: "needs_mapping",
    currentSource: "payrollRoleCostSourceData.ts PAYROLL_ROLE_COST_SOURCE_RECORDS — 26 cost-ready role records (8 Leadership + 12 Backoffice + 6 Specialists) extracted from src/constants/leadership.ts. Role cost values (grossMonthly, laborChargesMonthly, benefitsMonthly) are Finance-validated per Luciana confirmation (2026-06-03). Source stores raw monthly cost components and headcount progressions.",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Role cost values are Finance-validated. Next step: map approved roles into ValidatedRoleCostMap and complete Org Design Structure to role activation mapping before binding to FOPAG calculation. Confirm headcount progressions with Finance (ramps for counselor, IT, maintenance, nurse may have changed).",
    dependsOn: ["selected_org_design_option"],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
    notes: "26 role-level records from LEADERSHIP_CONFIG, BACKOFFICE_CONFIG, SPECIALISTS_CONFIG. Finance validation confirmed by Luciana as prior Finance review of existing role/payroll numbers (2026-06-03). Source headcount progressions preserved (not flattened to FTE). Annualization formula: (grossMonthly + laborChargesMonthly) × 13 + benefitsMonthly × 12 per src/lib/payroll/core.ts — confirmed consistent across core.ts, domain.ts, and useStaffingLogic.ts. Org design extension roles from orgDesignOptions.ts not included — no validated cost data exists for those roles.",
  },
  org_design_extension_roles: {
    inputId: "org_design_extension_roles",
    inputFamily: "payroll",
    label: "Org-design extension roles",
    status: "needs_mapping",
    currentSource: "data/orgDesignScenarioExtensions.ts orgDesignScenarioExtensionRoles; docs/orgDesignLogic.md Product Owner Decisions Added After Audit",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Payroll activation remains unwired. Map source-contract roles into the payroll adapter only after reviewing scenario-extension HC, activation year, compensation archetype, and MS/HS tab-source handling.",
    dependsOn: ["selected_org_design_option"],
    futureArtifactOrFile: "future payroll integration mapping for org-design scenario extensions",
  },
  validated_role_cost_map: {
    inputId: "validated_role_cost_map",
    inputFamily: "payroll",
    label: "Validated role-cost map",
    status: "needs_mapping",
    currentSource: "payrollAdapterContract.ts ValidatedRoleCostMap; reference-only payroll role sources",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_role_cost_validation",
    requiredNextAction: "Create and validate the role-level mapping table.",
    dependsOn: ["baseline_role_set", "org_design_extension_roles", "teaching_compensation_data"],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
  },
  teaching_compensation_data: {
    inputId: "teaching_compensation_data",
    inputFamily: "payroll",
    label: "Teaching compensation data",
    status: "needs_mapping",
    currentSource: "payrollRoleCostSourceData.ts PAYROLL_ROLE_COST_SOURCE_RECORDS — 7 teaching tier/support inputs (5 educator tiers + 2 support inputs) extracted from src/constants/teaching.ts EDUCATOR_LEVELS, LEARNING_ASSISTANT_DETAIL, LEARNING_MONITOR_DETAIL. Role cost values (grossMonthly, laborChargesMonthly, benefitsMonthly) are Finance-validated per Luciana confirmation (2026-06-03).",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Cost values are Finance-validated. For MS/HS educators, future payroll integration must use the existing MS/HS tabs and models for staffing/load/headcount/opening logic and Master Educator only as the compensation archetype.",
    dependsOn: [],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
    notes: "Teaching tier inputs (Associate, Specialist, Master, Inspirational, Distinguished) and support inputs (Learning Assistant, Learning Monitor) are Finance-validated per Luciana. FTE and activationYear are not stored on tier/support records. Product Owner correction: MS/HS educator staffing must come from MiddleSchoolTab.tsx + middleSchoolLoadModel.ts and HighSchoolTab.tsx + highSchoolScheduleModel.ts; do not use prior hardcoded MS/HS educator FTE assumptions as the staffing source.",
  },
  staffing_rules: {
    inputId: "staffing_rules",
    inputFamily: "payroll",
    label: "Staffing rules",
    status: "needs_mapping",
    currentSource: "payrollAdapterContract.ts StaffingModelInputs; reference-only existing staffing sources",
    sourceOwnership: "reference_only",
    canUseForCalculation: false,
    blockingReason: "missing_staffing_validation",
    requiredNextAction: "Define validated staffing rule mappings and preserve source ownership.",
    dependsOn: ["active_grades_by_year", "sections_by_year_and_grade", "fte_headcount_rules"],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
  },
  sections_by_year_and_grade: {
    inputId: "sections_by_year_and_grade",
    inputFamily: "payroll",
    label: "Sections by year and grade",
    status: "missing_value",
    currentSource: "payrollAdapterContract.ts SectionsByYearAndGrade; reference-only legacy section schedules",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_normalized_schedule",
    requiredNextAction: "Validate annual section records after opening-grade and occupancy mapping.",
    dependsOn: ["active_grades_by_year", "occupancy_input", "enrollment_by_year_and_grade"],
    futureArtifactOrFile: "future staffing input artifact",
  },
  fte_headcount_rules: {
    inputId: "fte_headcount_rules",
    inputFamily: "payroll",
    label: "FTE/headcount rules",
    status: "needs_mapping",
    currentSource: "payrollAdapterContract.ts PayrollRoleValidationStatus; reference-only staffing sources",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_staffing_validation",
    requiredNextAction: "Record an approved FTE or headcount rule for every mapped role.",
    dependsOn: ["baseline_role_set", "org_design_extension_roles", "teaching_compensation_data"],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
  },
  payroll_allocation_category: {
    inputId: "payroll_allocation_category",
    inputFamily: "payroll",
    label: "Payroll allocation category",
    status: "needs_mapping",
    currentSource: "payrollAdapterContract.ts PayrollAllocationCategory; reference-only existing allocation fields",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Map and validate allocation category per role.",
    dependsOn: ["baseline_role_set", "org_design_extension_roles", "teaching_compensation_data"],
    futureArtifactOrFile: "future payroll role-cost and staffing mapping table",
  },
  payroll_adapter_output: {
    inputId: "payroll_adapter_output",
    inputFamily: "payroll",
    label: "Payroll adapter output",
    status: "blocked",
    currentSource: "payrollAdapterContract.ts PayrollAdapterOutput",
    sourceOwnership: "not_applicable",
    canUseForCalculation: false,
    blockingReason: "missing_adapter_implementation",
    requiredNextAction: "Implement mapping only after role-cost and staffing inputs pass validation.",
    dependsOn: [
      "validated_role_cost_map",
      "staffing_rules",
      "sections_by_year_and_grade",
      "payroll_allocation_category",
    ],
    futureArtifactOrFile: "future payroll adapter implementation",
  },
  selected_service_contract_option: {
    inputId: "selected_service_contract_option",
    inputFamily: "opex_capex",
    label: "Selected service-contract option",
    status: "needs_mapping",
    currentSource: "src/features/rio-scenario-resilience/docs/serviceContractsDecisionLeverSourceValues.md; opexCapexAdapterContract.ts selectedServiceContractsOptionId",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Create typed Service Contracts source records in Phase 5 without implementing calculations.",
    dependsOn: [],
    futureArtifactOrFile: "future service-contract input artifact",
  },
  validated_service_contract_inputs: {
    inputId: "validated_service_contract_inputs",
    inputFamily: "opex_capex",
    label: "Validated service-contract inputs",
    status: "needs_mapping",
    currentSource: "src/features/rio-scenario-resilience/model/serviceContractsSourceData.ts; src/features/rio-scenario-resilience/docs/serviceContractsDecisionLeverSourceValues.md; opexCapexAdapterContract.ts ValidatedServiceContractInputs",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Keep the populated Service Contracts source records blocked until driver type, timing, escalation, package mapping, OPEX placement, and sign convention are approved.",
    dependsOn: ["selected_service_contract_option"],
    futureArtifactOrFile: "future Service Contracts typed source records",
    notes: "Source values are populated in serviceContractsSourceData.ts. Typed mapping and calculation remain unimplemented.",
  },
  validated_baseline_opex_inputs: {
    inputId: "validated_baseline_opex_inputs",
    inputFamily: "opex_capex",
    label: "Validated baseline OPEX inputs",
    status: "missing_value",
    currentSource: "opexCapexAdapterContract.ts ValidatedOpexInputs; reference-only src/lib/viability/baseline.ts",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_opex_validation",
    requiredNextAction: "Obtain validated OPEX records and classify source ownership.",
    dependsOn: [],
    futureArtifactOrFile: "future OPEX input artifact",
  },
  selected_capex_option: {
    inputId: "selected_capex_option",
    inputFamily: "opex_capex",
    label: "Selected CAPEX option",
    status: "missing_value",
    currentSource: "opexCapexAdapterContract.ts selectedCapexOptionId; data/dataStatus.ts",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_validated_value",
    requiredNextAction: "Define CAPEX options only after approved investment inputs are available.",
    dependsOn: [],
    futureArtifactOrFile: "future CAPEX input artifact",
  },
  validated_capex_schedule_inputs: {
    inputId: "validated_capex_schedule_inputs",
    inputFamily: "opex_capex",
    label: "Validated CAPEX schedule inputs",
    status: "missing_value",
    currentSource: "opexCapexAdapterContract.ts ValidatedCapexScheduleInputs; reference-only viability CAPEX structures",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_capex_validation",
    requiredNextAction: "Obtain and validate CAPEX schedule items.",
    dependsOn: [
      "selected_capex_option",
      "recurring_capex_classification",
      "capex_source_ownership",
    ],
    futureArtifactOrFile: "future CAPEX input artifact",
  },
  recurring_capex_classification: {
    inputId: "recurring_capex_classification",
    inputFamily: "opex_capex",
    label: "Recurring CAPEX classification",
    status: "needs_mapping",
    currentSource: "opexCapexAdapterContract.ts CapexItemType and CapexValidationStatus; reference-only viability structures",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Validate one-time versus recurring classification per CAPEX item.",
    dependsOn: ["selected_capex_option"],
    futureArtifactOrFile: "future CAPEX input artifact",
  },
  capex_source_ownership: {
    inputId: "capex_source_ownership",
    inputFamily: "opex_capex",
    label: "CAPEX source ownership",
    status: "needs_mapping",
    currentSource: "opexCapexAdapterContract.ts FinancialSourceOwnership; reference-only viability structures",
    sourceOwnership: "unmapped",
    canUseForCalculation: false,
    blockingReason: "missing_mapping",
    requiredNextAction: "Record ownership for every validated CAPEX item.",
    dependsOn: ["selected_capex_option"],
    futureArtifactOrFile: "future CAPEX input artifact",
  },
  discount_rate_for_npv: {
    inputId: "discount_rate_for_npv",
    inputFamily: "opex_capex",
    label: "Discount rate for NPV",
    status: "missing_value",
    currentSource: "opexCapexAdapterContract.ts OpexCapexAdapterInput.discountRateForVpl",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_validated_value",
    requiredNextAction: "Obtain and validate the pass-through input.",
    dependsOn: [],
    futureArtifactOrFile: "future cash-flow assumptions artifact",
  },
  governance_thresholds: {
    inputId: "governance_thresholds",
    inputFamily: "governance",
    label: "Governance thresholds and Tier rules",
    status: "missing_value",
    currentSource: "governanceThresholdContract.ts EMPTY_GOVERNANCE_THRESHOLD_CONTRACT",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_validated_value",
    requiredNextAction: "Obtain explicit approved governance thresholds and Tier rules in Phase 13.",
    dependsOn: [],
    futureArtifactOrFile: "future governance-threshold intake artifact",
    notes: "Do not invent thresholds or show a fake Tier.",
  },
  opex_capex_adapter_output: {
    inputId: "opex_capex_adapter_output",
    inputFamily: "opex_capex",
    label: "OPEX/CAPEX adapter output",
    status: "blocked",
    currentSource: "opexCapexAdapterContract.ts OpexCapexAdapterOutput",
    sourceOwnership: "not_applicable",
    canUseForCalculation: false,
    blockingReason: "missing_adapter_implementation",
    requiredNextAction: "Implement mapping only after OPEX, service-contract, and CAPEX records are validated.",
    dependsOn: [
      "validated_service_contract_inputs",
      "validated_baseline_opex_inputs",
      "validated_capex_schedule_inputs",
      "discount_rate_for_npv",
    ],
    futureArtifactOrFile: "future OPEX/CAPEX adapter implementation",
  },
  receita_output: {
    inputId: "receita_output",
    inputFamily: "scenario_boundary",
    label: "Receita output",
    status: "confirmed",
    currentSource: "receitaEngine.ts calculateReceita() — approved 2026-06-03. Formula design: receitaFormulaDesign.ts RECEITA_FORMULA_DESIGN (implemented). Boundary: receitaCalculationContract.ts (RECEITA_CALCULATION_CAN_RUN = true).",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: true,
    blockingReason: "none",
    requiredNextAction: "Receita calculation is implemented. Wire calculateReceita() output to downstream board-facing outputs when payroll and OPEX/CAPEX layers are ready. Board-calculation gate CALCULATION_CAN_BEGIN remains false.",
    dependsOn: [
      "enrollment_by_year_and_grade",
      "tuition_by_scenario_and_grade",
      "discount_assumptions",
      "annual_tuition_adjustment_assumptions",
      "occupancy_input",
    ],
    futureArtifactOrFile: "receitaEngine.ts (implemented); receitaEngineContract.ts (output types)",
    relatedScenarioOutputId: "receita",
    notes: "Receita engine implemented 2026-06-03. Engine: receitaEngine.ts calculateReceita(). Grain output per (openingPackage × occupancyScenario × tuitionScenario × year × grade). Aggregations: byYear, byGradeByYear, byDivisionByYear. Direct workbook years 2028–2037 only. §2.1–§2.9 conventions confirmed/reconciled. CALCULATION_CAN_BEGIN remains false pending payroll, OPEX/CAPEX, and downstream layers.",
  },
  payroll_fopag_output: {
    inputId: "payroll_fopag_output",
    inputFamily: "scenario_boundary",
    label: "FOPAG / Folha Direta output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult payroll_fopag",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "missing_upstream_output",
    requiredNextAction: "Complete payroll role-cost and staffing mapping before adapter implementation.",
    dependsOn: [
      "validated_role_cost_map",
      "staffing_rules",
      "sections_by_year_and_grade",
      "payroll_adapter_output",
    ],
    futureArtifactOrFile: "future payroll adapter implementation",
    relatedScenarioOutputId: "payroll_fopag",
  },
  fopag_receita_ratio_output: {
    inputId: "fopag_receita_ratio_output",
    inputFamily: "scenario_boundary",
    label: "FOPAG / Receita output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult fopag_receita_ratio",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_upstream_output",
    requiredNextAction: "Complete both upstream layers first.",
    dependsOn: ["receita_output", "payroll_fopag_output"],
    futureArtifactOrFile: "future operating output design",
    relatedScenarioOutputId: "fopag_receita_ratio",
  },
  opex_output: {
    inputId: "opex_output",
    inputFamily: "scenario_boundary",
    label: "OPEX output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult opex",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_upstream_output",
    requiredNextAction: "Complete validated OPEX inputs before adapter implementation.",
    dependsOn: [
      "validated_baseline_opex_inputs",
      "validated_service_contract_inputs",
      "opex_capex_adapter_output",
    ],
    futureArtifactOrFile: "future OPEX/CAPEX adapter implementation",
    relatedScenarioOutputId: "opex",
  },
  capex_output: {
    inputId: "capex_output",
    inputFamily: "scenario_boundary",
    label: "CAPEX output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult capex",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_upstream_output",
    requiredNextAction: "Complete validated CAPEX records before adapter implementation.",
    dependsOn: [
      "selected_capex_option",
      "validated_capex_schedule_inputs",
      "opex_capex_adapter_output",
    ],
    futureArtifactOrFile: "future OPEX/CAPEX adapter implementation",
    relatedScenarioOutputId: "capex",
  },
  capex_exposure_output: {
    inputId: "capex_exposure_output",
    inputFamily: "scenario_boundary",
    label: "CAPEX exposure output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult capex_exposure",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_upstream_output",
    requiredNextAction: "Define CAPEX exposure only after validated CAPEX records and mappings exist.",
    dependsOn: ["capex_output"],
    futureArtifactOrFile: "future CAPEX output design",
    relatedScenarioOutputId: "capex_exposure",
  },
  ebitda_output: {
    inputId: "ebitda_output",
    inputFamily: "scenario_boundary",
    label: "EBITDA output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult ebitda",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Define EBITDA only after upstream operating outputs are available.",
    dependsOn: ["receita_output", "payroll_fopag_output", "opex_output"],
    futureArtifactOrFile: "future EBITDA design",
    relatedScenarioOutputId: "ebitda",
  },
  ebitda_margin_output: {
    inputId: "ebitda_margin_output",
    inputFamily: "scenario_boundary",
    label: "EBITDA margin output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult ebitda_margin",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Define the margin boundary after EBITDA is confirmed.",
    dependsOn: ["ebitda_output", "receita_output"],
    futureArtifactOrFile: "future EBITDA design",
    relatedScenarioOutputId: "ebitda_margin",
  },
  cumulative_result_output: {
    inputId: "cumulative_result_output",
    inputFamily: "scenario_boundary",
    label: "Cumulative result output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult cumulative_result",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Define cumulative-result composition only after approved upstream outputs exist.",
    dependsOn: [
      "receita_output",
      "payroll_fopag_output",
      "opex_output",
      "capex_output",
    ],
    futureArtifactOrFile: "future cumulative-result design",
    relatedScenarioOutputId: "cumulative_result",
  },
  break_even_output: {
    inputId: "break_even_output",
    inputFamily: "scenario_boundary",
    label: "Break-even output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult break_even",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Define break-even ownership only after cumulative-result design.",
    dependsOn: ["cumulative_result_output"],
    futureArtifactOrFile: "future break-even design",
    relatedScenarioOutputId: "break_even",
  },
  npv_output: {
    inputId: "npv_output",
    inputFamily: "scenario_boundary",
    label: "NPV output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult npv; reference-only viability utility",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Extract or map a generic utility only after cumulative-result design.",
    dependsOn: ["cumulative_result_output", "discount_rate_for_npv"],
    futureArtifactOrFile: "future NPV utility mapping",
    relatedScenarioOutputId: "npv",
  },
  simple_payback_output: {
    inputId: "simple_payback_output",
    inputFamily: "scenario_boundary",
    label: "Simple payback output",
    status: "not_required_yet",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult simple_payback; reference-only viability utility",
    sourceOwnership: "mapped_existing_source",
    canUseForCalculation: false,
    blockingReason: "not_required_until_upstream_ready",
    requiredNextAction: "Extract or map a generic utility only after cumulative-result design.",
    dependsOn: ["cumulative_result_output"],
    futureArtifactOrFile: "future simple-payback utility mapping",
    relatedScenarioOutputId: "simple_payback",
  },
  discounted_payback_output: {
    inputId: "discounted_payback_output",
    inputFamily: "scenario_boundary",
    label: "Discounted payback output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult discounted_payback",
    sourceOwnership: "not_applicable",
    canUseForCalculation: false,
    blockingReason: "missing_formula_definition",
    requiredNextAction: "Define discounted-payback ownership only after cumulative-result design.",
    dependsOn: ["cumulative_result_output", "discount_rate_for_npv"],
    futureArtifactOrFile: "future discounted-payback design",
    relatedScenarioOutputId: "discounted_payback",
  },
  scenario_tier_output: {
    inputId: "scenario_tier_output",
    inputFamily: "scenario_boundary",
    label: "Scenario tier output",
    status: "blocked",
    currentSource: "scenarioCalculationBoundaryContract.ts ScenarioOutputResult scenario_tier",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_interpretation_rules",
    requiredNextAction: "Define interpretation rules only after financial outputs exist.",
    dependsOn: [
      "receita_output",
      "payroll_fopag_output",
      "opex_output",
      "capex_output",
      "capex_exposure_output",
      "ebitda_output",
      "cumulative_result_output",
      "break_even_output",
      "npv_output",
      "simple_payback_output",
      "discounted_payback_output",
      "governance_thresholds",
    ],
    futureArtifactOrFile: "future scenario-tier interpretation design",
    relatedScenarioOutputId: "scenario_tier",
  },
  sensitivity_resilience_outputs: {
    inputId: "sensitivity_resilience_outputs",
    inputFamily: "scenario_boundary",
    label: "Sensitivity / resilience outputs",
    status: "blocked",
    currentSource: "Future sensitivity-analysis layer",
    sourceOwnership: "simulator_owned",
    canUseForCalculation: false,
    blockingReason: "missing_interpretation_rules",
    requiredNextAction: "Define a resilience-analysis layer only after the calculation boundary works.",
    dependsOn: ["scenario_tier_output", "cumulative_result_output"],
    futureArtifactOrFile: "future resilience interpretation design",
  },
};

export const INPUT_READINESS_REGISTRY_SUMMARY = {
  totalInputs: 48,
  confirmed: 6,
  structuralOnly: 3,
  missingValue: 6,
  needsMapping: 16,
  blocked: 11,
  notRequiredYet: 6,
  calculationReady: 4,
};

// Calculations remain blocked until required revenue, payroll, OPEX/CAPEX, and scenario-boundary inputs are validated or mapped.
export const CALCULATION_CAN_BEGIN = false;
