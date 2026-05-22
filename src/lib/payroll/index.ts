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
  resolveGrowthFactor,
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
