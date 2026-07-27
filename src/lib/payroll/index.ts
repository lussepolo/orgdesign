export type {
  AllocationModel,
  PayrollRoleLike,
  PayrollEngineOptions,
  RoleYearProjection,
  PayrollYearTotals,
} from "./core";

export {
  roundCurrency,
  safeNumber,
  annualSalaryBurden,
  annualBenefitsOnly,
  annualGrossAndLaborOnly,
  annualizeTeachingMonthlyLoaded,
  annualizeGrossAndLaborOnly,
  annualizeBenefitsOnly,
  getProjectedMonthlyComponentsPerPerson,
  getRoleYearProjection,
  getRoleCollectionYearProjections,
  getRoleCollectionYearTotals,
  getRoleCollectionTimelineTotals,
} from "./core";

export {
  PAYROLL_BASE_YEAR_2028,
  SALARY_2027_TO_2028_CONVERSION_RATE,
  SALARY_ESCALATION_RATE_2029_PLUS,
  BENEFITS_ESCALATION_RATE_2029_PLUS,
  ENCARGOS_RATE,
  V10_PAYROLL_SOURCE_SALARY,
  V10_PAYROLL_SOURCE_BENEFITS,
  V10_SALARY_RATE_BY_YEAR,
  V10_BENEFITS_RATE_BY_YEAR,
  toSalaryBase2028,
  toBenefitsBase2028,
  resolveSalaryGrowthFactor,
  resolveBenefitsGrowthFactor,
  salaryMonthlyForYear,
  benefitsMonthlyForYear,
  laborChargesMonthlyForSalary,
} from "./payrollGrowth";

export type {
  PayrollScenario,
  TuitionScenario,
  MarginMode,
  PayrollGrade,
  ScenarioProjectionYear,
  ScenarioProjection,
  ScenarioComparisonYear,
  ScenarioComparisonResult,
  ScenarioMatrixCellYear,
  RoleCompRow,
} from "./domain";

export {
  PAYROLL_YEARS,
  TUITION_GROWTH_RATE,
  TUITION_ANNUAL,
  PAYROLL_GRADE_CONFIG,
  TURMAS_SCHEDULE,
  STUDENTS_SCHEDULE,
  getAnnualRevenue,
  computeTurmasPerYear,
  getGradeLevel,
  getNonTeachingRoleProjectionsForYear,
  getNonTeachingLayerTotalsForYear,
  buildPayrollProjection,
  buildScenarioComparison,
  buildScenarioMatrix,
  buildRoleCompTable,
} from "./domain";

export type {
  ScenarioOverviewRow,
  NonTeachingHeadcountPlanRow,
  RoleAuditSummaryRow,
  PayrollProjectionMetricRow,
  ExportWorkbookPayload,
} from "./presenters";

export {
  buildExportOverviewRows,
  buildExportPayload,
} from "./presenters";
