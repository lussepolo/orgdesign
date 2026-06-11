export type SourceOfTruthCategory =
  | "decision_lever"
  | "supporting_data"
  | "computed_output"
  | "interpretation_layer";

export type SourceOfTruthCurrentStatus =
  | "blocked_source_contract_created"
  | "source_contract_created_pending_payroll_wiring"
  | "confirmed_in_scaffold"
  | "existing_app_source_found"
  | "existing_app_logic_to_map"
  | "simulator_calculation_to_define"
  | "missing_input_data"
  | "missing_calculation_layer"
  | "future_interpretation_layer"
  | "needs_confirmation";

export interface SourceOfTruthMapItem {
  itemId: string;
  label: string;
  category: SourceOfTruthCategory;
  currentStatus: SourceOfTruthCurrentStatus;
  existingSourceFiles: string[];
  existingSourceFieldsOrFunctions: string[];
  shouldReuseExistingLogic: boolean;
  shouldDuplicateLogic: false;
  integrationRisk: string;
  missingData: string;
  nextAction: string;
}

export const sourceOfTruthMap: SourceOfTruthMapItem[] = [
  {
    itemId: "opening_grades",
    label: "Opening Grades",
    category: "decision_lever",
    currentStatus: "confirmed_in_scaffold",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/data/openingGrades.ts",
      "src/lib/payroll/domain.ts",
      "src/components/sections/HighSchoolTab.tsx",
    ],
    existingSourceFieldsOrFunctions: [
      "openingGrades",
      "PAYROLL_GRADE_CONFIG",
      "TURMAS_SCHEDULE",
      "STUDENTS_SCHEDULE",
      "computeTurmasPerYear",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Lever options are confirmed in the scaffold, but they still need to be mapped to the live grade opening and enrollment schedules.",
    missingData:
      "No dedicated lever-to-schedule mapping layer exists yet.",
    nextAction:
      "Bind the selected opening package to the existing grade schedule and enrollment tables.",
  },
  {
    itemId: "occupancy",
    label: "Occupancy",
    category: "decision_lever",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/lib/payroll/domain.ts",
      "src/hooks/useStaffingLogic.ts",
      "src/constants/teaching.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "PAYROLL_GRADE_CONFIG.occ",
      "useStaffingLogic",
      "getTeachingLeadFteForGrade",
      "grade occupancy calculations",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Occupancy is already embedded in the model, but not exposed as a standalone lever input.",
    missingData:
      "No dedicated occupancy input structure exists for the preview layer.",
    nextAction:
      "Expose occupancy as a mapped lever without duplicating the underlying grade economics.",
  },
  {
    itemId: "org_design_structure",
    label: "Org Design Structure",
    category: "decision_lever",
    currentStatus: "source_contract_created_pending_payroll_wiring",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/data/orgDesignStructure.ts",
      "src/features/rio-scenario-resilience/data/orgDesignScenarioExtensions.ts",
      "src/features/rio-scenario-resilience/docs/orgDesignLogic.md",
      "src/components/sections/OfferScenariosTab.tsx",
      "src/components/sections/MiddleSchoolTab.tsx",
      "src/components/sections/middleSchoolLoadModel.ts",
      "src/components/sections/HighSchoolTab.tsx",
      "src/components/sections/highSchoolScheduleModel.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "orgDesignStructure",
      "scenarioOfferRoleActivationSourceContract",
      "orgDesignCompensationAliases",
      "baselineRoleSet",
      "additionalRoleIds",
      "financialStatus",
      "orgDesignScenarioExtensionRoles",
      "uses_existing_tab_logic",
      "source_contract_created_pending_payroll_wiring",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Requested structural options, Product Owner role decisions, and the MS/HS educator tab-source rule are captured in a typed source contract, but no payroll adapter wiring exists yet.",
    missingData:
      "Payroll activation is not wired. Scenario-extension roles still need a separate payroll integration task before costs can flow into totals.",
    nextAction:
      "Review the source contract, then map approved scenario-extension roles into the payroll engine in a separate task without duplicating MS/HS tab logic.",
  },
  {
    itemId: "tuition",
    label: "Tuition",
    category: "decision_lever",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/data/tuitionArchitecture.ts",
      "src/lib/payroll/domain.ts",
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "tuitionArchitecture",
      "TUITION_ANNUAL",
      "TUITION_GROWTH_RATE",
      "getAnnualRevenue",
      "tuitionScenario",
      "tuitionGrowthRate",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "The app already has tuition scenarios and growth logic, so a future lever must map to that model rather than introduce new pricing math.",
    missingData:
      "No new tuition values or discount assumptions should be created in this layer.",
    nextAction:
      "Map the selected pricing architecture to the existing tuition tables and growth assumptions.",
  },
  {
    itemId: "service_contracts",
    label: "Service Contracts",
    category: "decision_lever",
    currentStatus: "confirmed_in_scaffold",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/model/serviceContractsSourceData.ts",
      "src/features/rio-scenario-resilience/docs/serviceContractsDecisionLeverSourceValues.md",
    ],
    existingSourceFieldsOrFunctions: [
      "SERVICE_CONTRACTS_SOURCE_DATA",
      "SERVICE_CONTRACTS_SOURCE_LINES",
      "serviceContractsDecisionLeverSourceValues",
    ],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Typed service-contract source records now exist, but driver mapping, OPEX placement, and calculation logic remain blocked.",
    missingData:
      "No approved driver type, timing, escalation, package mapping, or OPEX placement exists yet.",
    nextAction:
      "Preserve the typed source records and map them only after the Service Contracts design is approved.",
  },
  {
    itemId: "capex",
    label: "CAPEX",
    category: "decision_lever",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
      "src/lib/viability/types.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "DEFAULT_CAPEX_CATEGORIES",
      "initialCapex",
      "recurringCapexAnnual",
      "capexMode",
      "buildStructuredCapexByYear",
      "resolveCapexAnnual",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "CAPEX is already modeled as aggregate viability input, not as a lever-level package with dedicated economics.",
    missingData:
      "No lever-specific CAPEX structure is defined in the scaffold.",
    nextAction:
      "Reuse the existing viability CAPEX layer later if the lever must influence investment assumptions.",
  },
  {
    itemId: "role_cost_library",
    label: "Role Cost Library",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/constants/leadership.ts",
      "src/constants/teaching.ts",
      "src/lib/payroll/core.ts",
      "src/lib/payroll/presenters.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "LEADERSHIP_CONFIG",
      "BACKOFFICE_CONFIG",
      "SPECIALISTS_CONFIG",
      "EDUCATOR_LEVELS",
      "LEARNING_ASSISTANT_DETAIL",
      "LEARNING_MONITOR_DETAIL",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "The library already exists, but the scaffold must not turn it into a new decision lever.",
    missingData:
      "No new role library should be introduced before the existing sources are mapped.",
    nextAction:
      "Keep this as supporting data and map it to the org-design layer later.",
  },
  {
    itemId: "existing_payroll_role_data",
    label: "Existing payroll role data",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/constants/leadership.ts",
      "src/lib/payroll/core.ts",
      "src/lib/payroll/presenters.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "grossMonthly",
      "laborChargesMonthly",
      "benefitsMonthly",
      "allocationModel",
      "activeFrom",
      "headcount",
      "buildExportOverviewRows",
      "buildExportPayload",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Current role economics are the source of truth and must not be copied into a new role library.",
    missingData:
      "No additional payroll-role fields should be invented here.",
    nextAction:
      "Reuse the current payroll role data as the authoritative staffing source.",
  },
  {
    itemId: "teaching_staffing_economics",
    label: "Teaching/staffing economics",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/constants/teaching.ts",
      "src/components/sections/MiddleSchoolTab.tsx",
      "src/components/sections/middleSchoolLoadModel.ts",
      "src/components/sections/HighSchoolTab.tsx",
      "src/components/sections/highSchoolScheduleModel.ts",
      "src/hooks/useStaffingLogic.ts",
      "src/lib/payroll/domain.ts",
      "src/lib/payroll/core.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "EDUCATOR_LEVELS",
      "LEARNING_ASSISTANT_DETAIL",
      "LEARNING_MONITOR_DETAIL",
      "deriveEducatorLoadRows",
      "deriveProgramFunctionRows",
      "buildHighSchoolScenarioCapabilityReport",
      "buildGrade9CapacityLedger",
      "buildRioWeeklyLoadByOffer",
      "getAnnualTeachingCost",
      "getMonthlyTeachingCost",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Teaching economics already drive staffing and revenue logic, but MS/HS educator staffing must reference the existing tabs/models rather than prior hardcoded FTE assumptions.",
    missingData:
      "No separate teaching-economics source should be created. MS/HS payroll integration still needs a mapping layer that reuses tab-derived staffing logic.",
    nextAction:
      "Map this existing teaching/staffing layer into the future lever model without changing formulas or duplicating MS/HS tab logic.",
  },
  {
    itemId: "grade_level_enrollment_distribution",
    label: "Grade-level enrollment distribution",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/lib/payroll/domain.ts",
      "src/hooks/useStaffingLogic.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "PAYROLL_GRADE_CONFIG",
      "TURMAS_SCHEDULE",
      "STUDENTS_SCHEDULE",
      "computeTurmasPerYear",
      "getAnnualRevenue",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Enrollment distribution is already embedded in the model and must remain the source of truth.",
    missingData:
      "No new grade distribution source is needed for the scaffold.",
    nextAction:
      "Reuse the existing grade distribution tables when the lever layer is wired later.",
  },
  {
    itemId: "discount_assumptions",
    label: "Discount assumptions",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "discountRate",
      "DEFAULT_STATE.discountRate",
      "buildBaselineViewModel",
      "discountedCashFlowAnnual",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Discounting is already part of the viability layer and should not be re-authored in the scenario scaffold.",
    missingData:
      "No additional discount assumption source is required here.",
    nextAction:
      "Reference the existing viability discount input when the map is connected later.",
  },
  {
    itemId: "annual_tuition_adjustment_assumptions",
    label: "Annual tuition adjustment assumptions",
    category: "supporting_data",
    currentStatus: "existing_app_source_found",
    existingSourceFiles: [
      "src/lib/payroll/domain.ts",
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "TUITION_GROWTH_RATE",
      "tuitionGrowthRate",
      "DEFAULT_TUITION_GROWTH_RATE",
      "rebaseAnnualValue",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Annual tuition growth is already modeled and should remain centralized.",
    missingData:
      "No new tuition adjustment assumptions should be added in this layer.",
    nextAction:
      "Keep tuition growth aligned with the existing payroll and viability assumptions.",
  },
  {
    itemId: "receita",
    label: "Receita",
    category: "computed_output",
    currentStatus: "simulator_calculation_to_define",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/data/openingGrades.ts",
      "src/features/rio-scenario-resilience/data/tuitionArchitecture.ts",
      "src/lib/payroll/domain.ts",
      "src/hooks/useStaffingLogic.ts",
      "src/lib/viability/baseline.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "openingGrades",
      "occupancyScenarioId",
      "tuitionScenarioId",
      "discountAssumptions",
      "annualTuitionAdjustmentAssumptions",
    ],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Revenue must be generated by the simulator from selected levers, not read as a fixed existing app output.",
    missingData:
      "No revenue formula exists yet, and no existing payroll output should override the simulator result.",
    nextAction:
      "Define the revenue layer later from opening grades, occupancy, tuition, discount assumptions, and annual adjustment assumptions.",
  },
  {
    itemId: "fopag_folha_direta",
    label: "FOPAG / Folha Direta",
    category: "computed_output",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/payroll/core.ts",
      "src/lib/payroll/domain.ts",
      "src/lib/payroll/presenters.ts",
      "src/lib/payroll/exportXlsx.ts",
      "src/hooks/useStaffingLogic.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "grossMonthly",
      "laborChargesMonthly",
      "benefitsMonthly",
      "allocationModel",
      "activeFrom",
      "headcount",
      "annualSalaryBurden",
      "getRoleCollectionYearTotals",
      "buildPayrollProjection",
      "getRoleYearProjection",
      "fopagDiretoAnnual",
      "folhaDiretaAnnual",
      "allocationMonthly",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "The payroll split is already authored in the app and should not be reimplemented in the scaffold.",
    missingData:
      "No new payroll translation logic should be added.",
    nextAction:
      "Map the scenario output layer to the existing payroll split calculations.",
  },
  {
    itemId: "fopag_receita",
    label: "FOPAG / Receita",
    category: "computed_output",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/payroll/domain.ts",
      "src/lib/payroll/presenters.ts",
      "src/components/sections/PayrollProjectionTab.tsx",
    ],
    existingSourceFieldsOrFunctions: [
      "coverageRatio",
      "coveragePercent",
      "PayrollProjectionMetricRow",
      "coverage view in PayrollProjectionTab",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Coverage is already derived from existing payroll and revenue outputs.",
    missingData:
      "No separate coverage formula should be introduced.",
    nextAction:
      "Reuse the current coverage metric when the preview is connected later.",
  },
  {
    itemId: "opex",
    label: "OPEX (additional baseline OPEX)",
    category: "computed_output",
    currentStatus: "missing_input_data",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "buildOtherOpexAnnual",
      "BASE_FIXED_OPEX_2028",
      "BASE_PER_STUDENT_OPEX_2028",
      "BASE_PER_SECTION_OPEX_2028",
      "costScenario",
      "opexGrowthRate",
    ],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "IMPORTANT: the viability baseline OPEX values (BASE_FIXED_OPEX_2028 etc.) are a structural reference " +
      "only and must not become the Rio simulator OPEX source without independent Finance validation. " +
      "inputReadinessRegistry.ts (committed) lists validated_baseline_opex_inputs as " +
      "status=missing_value, sourceOwnership=unmapped. Do not reuse these values directly.",
    missingData:
      "No Finance-validated additional baseline OPEX source exists for the v1 board simulator. " +
      "validated_baseline_opex_inputs is missing. Per projectCharter.md, missing data must be " +
      "represented explicitly as missing, not inferred. An OPEX-inclusive EBITDA is not implementable " +
      "until a validated source is provided. Do not default additional baseline OPEX to zero without " +
      "explicit Finance authorization.",
    nextAction:
      "Obtain Finance-validated baseline OPEX inputs before attempting to include them in the EBITDA calculation. " +
      "When available, update validated_baseline_opex_inputs in inputReadinessRegistry.ts and classify " +
      "source ownership. Do not map the viability baseline OPEX values directly — they require " +
      "independent Finance validation for the simulator.",
  },
  {
    itemId: "capex_output",
    label: "CAPEX",
    category: "computed_output",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "buildStructuredCapexByYear",
      "resolveCapexAnnual",
      "initialCapex",
      "recurringCapexAnnual",
      "capexCategories",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "CAPEX exists as a viability input and should not be re-authored as a new calculator.",
    missingData:
      "No scenario-specific CAPEX output layer has been defined yet.",
    nextAction:
      "Reuse the viability CAPEX model when the output map is connected later.",
  },
  {
    itemId: "ebitda",
    label: "EBITDA",
    category: "computed_output",
    currentStatus: "missing_calculation_layer",
    existingSourceFiles: [],
    existingSourceFieldsOrFunctions: [],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "No EBITDA calculation exists in the current app, so this remains a missing layer.",
    missingData:
      "No EBITDA formula, definition, or source file exists.",
    nextAction:
      "Define EBITDA only after the source-of-truth map is approved.",
  },
  {
    itemId: "ebitda_margin",
    label: "EBITDA margin",
    category: "computed_output",
    currentStatus: "missing_calculation_layer",
    existingSourceFiles: [],
    existingSourceFieldsOrFunctions: [],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "EBITDA margin depends on a missing EBITDA layer, so it cannot be mapped yet.",
    missingData:
      "No EBITDA baseline exists to support a margin output.",
    nextAction:
      "Define EBITDA first, then derive margin later if required.",
  },
  {
    itemId: "vpl_npv",
    label: "VPL / NPV",
    category: "computed_output",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "calculateNpv",
      "buildKpis",
      "vpl / NPV KPI",
      "discountedCashFlowAnnual",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "NPV is already part of the viability baseline and should stay centralized.",
    missingData:
      "No new NPV math should be introduced.",
    nextAction:
      "Map the scenario output to the existing baseline KPI later.",
  },
  {
    itemId: "payback",
    label: "Payback",
    category: "computed_output",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "calculatePayback",
      "buildKpis",
      "payback KPI",
      "freeCashFlowAnnual",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Payback already exists in the baseline model and should not be duplicated.",
    missingData:
      "No additional payback formula should be authored.",
    nextAction:
      "Reuse the current payback logic when the map is connected later.",
  },
  {
    itemId: "discounted_payback",
    label: "Discounted Payback",
    category: "computed_output",
    currentStatus: "needs_confirmation",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "buildKpis",
      "calculateNpv",
      "calculatePayback",
    ],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "No explicit discounted-payback function was found in the current app.",
    missingData:
      "Discounted payback is not clearly implemented in the existing code.",
    nextAction:
      "Confirm whether discounted payback is required before adding any later layer.",
  },
  {
    itemId: "scenario_tier",
    label: "Scenario Tier",
    category: "interpretation_layer",
    currentStatus: "future_interpretation_layer",
    existingSourceFiles: [
      "src/features/rio-scenario-resilience/components/ScenarioOutputs/ScenarioTierCard.tsx",
      "src/features/rio-scenario-resilience/data/outputStatus.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "ScenarioTierCard",
      "outputStatus.tier",
    ],
    shouldReuseExistingLogic: false,
    shouldDuplicateLogic: false,
    integrationRisk:
      "Tiering is intentionally deferred and should remain separate from decision levers and financial outputs.",
    missingData:
      "No tiering rules or scoring framework exist yet.",
    nextAction:
      "Define tier interpretation only after output calculations are in place.",
  },
  {
    itemId: "sensitivity_resilience_interpretation",
    label: "Sensitivity / resilience interpretation",
    category: "interpretation_layer",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/viability/sensitivity.ts",
      "src/hooks/useViabilitySimulator.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "buildSensitivityViewModel",
      "SensitivityVariable",
      "rowVariable",
      "columnVariable",
      "sensitivityMetric",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "The app already has a directional sensitivity model, so the preview should only map to it later.",
    missingData:
      "No additional resilience interpretation layer should be invented yet.",
    nextAction:
      "Reference the existing sensitivity model when the interpretation layer is finalized.",
  },
  {
    itemId: "twenty_year_sustainability_progression",
    label: "20-year sustainability progression",
    category: "interpretation_layer",
    currentStatus: "existing_app_logic_to_map",
    existingSourceFiles: [
      "src/lib/viability/baseline.ts",
      "src/hooks/useViabilitySimulator.ts",
      "src/lib/payroll/domain.ts",
    ],
    existingSourceFieldsOrFunctions: [
      "PAYROLL_YEARS",
      "projectionHorizonYears",
      "clampProjectionHorizon",
      "buildBaselineViewModel",
    ],
    shouldReuseExistingLogic: true,
    shouldDuplicateLogic: false,
    integrationRisk:
      "The app already runs a 2028-2047 baseline, so the progression layer should not introduce a second timeline.",
    missingData:
      "No separate 20-year progression engine is needed in the scaffold.",
    nextAction:
      "Reuse the current 20-year baseline when building the later interpretation layer.",
  },
];

export const sourceOfTruthMapByCategory = {
  decision_lever: sourceOfTruthMap.filter((item) => item.category === "decision_lever"),
  supporting_data: sourceOfTruthMap.filter((item) => item.category === "supporting_data"),
  computed_output: sourceOfTruthMap.filter((item) => item.category === "computed_output"),
  interpretation_layer: sourceOfTruthMap.filter((item) => item.category === "interpretation_layer"),
} as const;
