import { SECONDARY_EDUCATOR_CAPACITY_MODEL } from "./secondaryEducatorCapacityModel";

export type SecondaryEducatorCapacityValidationCheckId =
  | "ms_raw_learner_blocks"
  | "ms_core_demand"
  | "ms_programme_demand"
  | "ms_core_educators"
  | "ms_flexible_educators"
  | "ms_total_educators"
  | "ms_programme_capacity_27"
  | "ms_margin_27"
  | "ms_average_load"
  | "ms_domain_core_loads_sum"
  | "hs_raw_learner_blocks"
  | "hs_core_demand"
  | "hs_programme_demand"
  | "hs_core_educators"
  | "hs_flexible_educators"
  | "hs_total_educators"
  | "hs_programme_capacity_27"
  | "hs_required_efficiency_27"
  | "hs_required_efficiency_26"
  | "hs_required_efficiency_28"
  | "hs_domain_core_loads_sum"
  | "combined_core_educators"
  | "combined_flexible_educators"
  | "combined_pool"
  | "combined_raw_learner_demand"
  | "board_readiness_conditional"
  | "shared_specialists_not_counted_twice"
  | "passion_projects_absent_from_g11_g12"
  | "innovation_diploma_only_g11_g12"
  | "ap_replacement_no_duplicate_demand";

export interface SecondaryEducatorCapacityValidationCheck {
  checkId: SecondaryEducatorCapacityValidationCheckId;
  pass: boolean;
  expected: string;
  actual: string;
  note: string;
}

export interface SecondaryEducatorCapacityValidationReport {
  checks: readonly SecondaryEducatorCapacityValidationCheck[];
  passCount: number;
  failCount: number;
  allPass: boolean;
}

function stringifyValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function check(
  checkId: SecondaryEducatorCapacityValidationCheckId,
  actual: unknown,
  expected: unknown,
  note: string,
): SecondaryEducatorCapacityValidationCheck {
  return {
    checkId,
    pass: Object.is(actual, expected),
    expected: stringifyValue(expected),
    actual: stringifyValue(actual),
    note,
  };
}

export function runSecondaryEducatorCapacityValidation(): SecondaryEducatorCapacityValidationReport {
  const model = SECONDARY_EDUCATOR_CAPACITY_MODEL;
  const ms = model.middleSchool;
  const hs = model.highSchool;
  const msDomainCoreLoadSum = ms.domains.reduce((total, domain) => total + domain.coreDemand, 0);
  const hsDomainCoreLoadSum = hs.domains.reduce((total, domain) => total + domain.coreDemand, 0);
  const sharedSpecialistsNotCountedTwice = model.sharedSpecialistGovernance.every(
    (entry) => entry.doubleCountingPrevented,
  );
  const passionGrades = model.projectProgression
    .filter((entry) => entry.programmeFamily === "passion_project")
    .map((entry) => entry.grade)
    .join(",");
  const innovationGrades = model.projectProgression
    .filter((entry) => entry.programmeFamily === "innovation_diploma")
    .map((entry) => entry.grade)
    .join(",");
  const apReplacementCreatesDuplicateDemand = model.apCourseClassifications.some(
    (entry) => entry.createsAdditionalDemand || entry.duplicateDemandAllowed,
  );

  const checks: SecondaryEducatorCapacityValidationCheck[] = [
    check("ms_raw_learner_blocks", ms.sections * model.envelope.learnerBlocksPerSectionPerWeek, 240, "6 x 40 = 240"),
    check("ms_core_demand", ms.coreDemand, 156, "MS core demand equals canonical subject-domain demand"),
    check("ms_programme_demand", ms.programmeDemand, 84, "MS programme demand = 240 - 156"),
    check("ms_core_educators", ms.coreEducators, 8, "MS preserves 8 mature core educators"),
    check("ms_flexible_educators", ms.flexibleEducators, 1, "MS adds one flexible programme educator"),
    check("ms_total_educators", ms.totalEducators, 9, "MS total educators = 8 + 1"),
    check("ms_programme_capacity_27", ms.loadScenarios[27].programmeCapacityAfterCore, 87, "MS programme capacity at 27 = 9 x 27 - 156"),
    check("ms_margin_27", ms.loadScenarios[27].programmeMargin, 3, "MS margin at 27 = 87 - 84"),
    check("ms_average_load", ms.averageRequiredLoad, 26.67, "MS average required load rounds to 26.67"),
    check("ms_domain_core_loads_sum", msDomainCoreLoadSum, 156, "MS domain core loads sum to 156"),
    check("hs_raw_learner_blocks", hs.sections * model.envelope.learnerBlocksPerSectionPerWeek, 320, "8 x 40 = 320"),
    check("hs_core_demand", hs.coreDemand, 216, "HS core demand equals canonical subject-domain demand"),
    check("hs_programme_demand", hs.programmeDemand, 104, "HS programme demand = 320 - 216"),
    check("hs_core_educators", hs.coreEducators, 10, "HS preserves 10 mature core educators"),
    check("hs_flexible_educators", hs.flexibleEducators, 1, "HS adds one flexible programme educator"),
    check("hs_total_educators", hs.totalEducators, 11, "HS total educators = 10 + 1"),
    check("hs_programme_capacity_27", hs.loadScenarios[27].programmeCapacityAfterCore, 81, "HS programme capacity at 27 = 11 x 27 - 216"),
    check("hs_required_efficiency_27", hs.loadScenarios[27].requiredTimetableEfficiency, 23, "HS required efficiency at 27 = 104 - 81"),
    check("hs_required_efficiency_26", hs.loadScenarios[26].requiredTimetableEfficiency, 34, "HS required efficiency at 26 = 104 - 70"),
    check("hs_required_efficiency_28", hs.loadScenarios[28].requiredTimetableEfficiency, 12, "HS required efficiency at 28 = 104 - 92"),
    check("hs_domain_core_loads_sum", hsDomainCoreLoadSum, 216, "HS domain core loads sum to 216"),
    check("combined_core_educators", model.combined.coreEducators, 18, "Combined core educators = 8 + 10"),
    check("combined_flexible_educators", model.combined.flexibleEducators, 2, "Combined flexible educators = 1 + 1"),
    check("combined_pool", model.combined.combinedPool, 20, "Combined pool = 18 + 2"),
    check("combined_raw_learner_demand", model.middleSchool.rawLearnerBlocks + model.highSchool.rawLearnerBlocks, 560, "Combined raw learner demand = 240 + 320"),
    check("board_readiness_conditional", model.combined.boardReadinessStatus, "conditional", "Board readiness remains conditional without timetable validation"),
    check("shared_specialists_not_counted_twice", sharedSpecialistsNotCountedTwice, true, "Shared specialist governance prevents double counting"),
    check("passion_projects_absent_from_g11_g12", passionGrades, "g9,g10", "Passion Project is limited to Grades 9-10"),
    check("innovation_diploma_only_g11_g12", innovationGrades, "g11,g12", "Innovation Diploma is active only in Grades 11-12"),
    check("ap_replacement_no_duplicate_demand", apReplacementCreatesDuplicateDemand, false, "AP replacement classifications do not create duplicate demand"),
  ];

  const passCount = checks.filter((result) => result.pass).length;
  const failCount = checks.length - passCount;

  return {
    checks,
    passCount,
    failCount,
    allPass: failCount === 0,
  };
}

export const SECONDARY_EDUCATOR_CAPACITY_VALIDATION_REPORT =
  runSecondaryEducatorCapacityValidation();
