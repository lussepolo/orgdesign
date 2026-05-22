import {
  EDUCATOR_LEVELS,
  LEARNING_ASSISTANT_DETAIL,
  LEARNING_MONITOR_DETAIL,
} from "../../constants";
import {
  LEADERSHIP_CONFIG,
  BACKOFFICE_CONFIG,
  SPECIALISTS_CONFIG,
} from "../../constants/leadership";
import {
  getProjectedMonthlyComponentsPerPerson,
  getRoleCollectionYearProjections,
  roundCurrency,
  type PayrollRoleLike,
  type RoleYearProjection,
} from "./core";

export type PayrollScenario = "otimista" | "intermediario" | "pessimista";
export type TuitionScenario = "cen1" | "cen2" | "cen3";
export type MarginMode = "FULLY_LOADED" | "WITHOUT_BENEFITS";

const PAYROLL_START_YEAR = 2028;
const PAYROLL_END_YEAR = 2047;

export const PAYROLL_YEARS = Array.from(
  { length: PAYROLL_END_YEAR - PAYROLL_START_YEAR + 1 },
  (_, index) => PAYROLL_START_YEAR + index,
);

// Modeling rule for the live payroll path:
// teaching-side students/turmas remain scenario-responsive; non-teaching roles remain shared/global.
// Beyond 2037, each scenario carries forward its own teaching-side state, while non-teaching staffing
// continues from shared role progression and compensation/benefits keep compounding annually.
function extendSchedule(values: number[]): number[] {
  if (values.length >= PAYROLL_YEARS.length) return values;
  const fallbackValue = values[values.length - 1] ?? 0;
  return [
    ...values,
    ...Array.from(
      { length: PAYROLL_YEARS.length - values.length },
      () => fallbackValue,
    ),
  ];
}

export const TUITION_GROWTH_RATE = 0.08;

export const TUITION_ANNUAL: Record<string, Record<TuitionScenario, number>> = {
  t1i:  { cen1: 88789.56,  cen2: 98641.20,  cen3: 105406.12 },
  t1m:  { cen1: 51941.99,  cen2: 57705.21,  cen3: 61662.70  },
  t2i:  { cen1: 88789.56,  cen2: 98641.20,  cen3: 105406.12 },
  t2m:  { cen1: 51941.99,  cen2: 57705.21,  cen3: 61662.70  },
  pk3:  { cen1: 88789.56,  cen2: 98641.20,  cen3: 105406.12 },
  pk4:  { cen1: 88789.56,  cen2: 98641.20,  cen3: 105406.12 },
  k:    { cen1: 88789.56,  cen2: 98641.20,  cen3: 105406.12 },
  g1:   { cen1: 108492.84, cen2: 98641.20,  cen3: 105406.12 },
  g2:   { cen1: 108492.84, cen2: 98641.20,  cen3: 105406.12 },
  g3:   { cen1: 108492.84, cen2: 98641.20,  cen3: 105406.12 },
  g4:   { cen1: 108492.84, cen2: 98641.20,  cen3: 105406.12 },
  g5:   { cen1: 108492.84, cen2: 98641.20,  cen3: 105406.12 },
  g6:   { cen1: 118935.96, cen2: 108136.04, cen3: 105406.12 },
  g7:   { cen1: 118935.96, cen2: 108136.04, cen3: 105406.12 },
  g8:   { cen1: 118935.96, cen2: 108136.04, cen3: 105406.12 },
  g9:   { cen1: 137443.56, cen2: 124963.06, cen3: 121808.34 },
  g10:  { cen1: 137443.56, cen2: 124963.06, cen3: 121808.34 },
  g11:  { cen1: 137443.56, cen2: 124963.06, cen3: 121808.34 },
  g12:  { cen1: 137443.56, cen2: 124963.06, cen3: 121808.34 },
};

export const PAYROLL_GRADE_CONFIG = [
  { id:"t1i", name:"Toddlers 1 – Integral", cap:14, sections:1, openYear:2028, div:"EY", shift:"I", occ:{otimista:0.714, intermediario:0.643, pessimista:0.500} },
  { id:"t1m", name:"Toddlers 1 – Manhã",    cap:14, sections:1, openYear:2028, div:"EY", shift:"M", occ:{otimista:0.714, intermediario:0.643, pessimista:0.500} },
  { id:"t2i", name:"Toddlers 2 – Integral", cap:14, sections:1, openYear:2028, div:"EY", shift:"I", occ:{otimista:0.714, intermediario:0.571, pessimista:0.500} },
  { id:"t2m", name:"Toddlers 2 – Manhã",    cap:14, sections:1, openYear:2028, div:"EY", shift:"M", occ:{otimista:0.714, intermediario:0.571, pessimista:0.500} },
  { id:"pk3", name:"Pre-K3",       cap:18, sections:2, openYear:2028, div:"EY", shift:"I", occ:{otimista:1.000, intermediario:0.611, pessimista:0.333} },
  { id:"pk4", name:"Pre-K4",       cap:18, sections:2, openYear:2028, div:"EY", shift:"I", occ:{otimista:0.722, intermediario:0.667, pessimista:0.500} },
  { id:"k",   name:"Kindergarten", cap:20, sections:2, openYear:2028, div:"EY", shift:"I", occ:{otimista:0.700, intermediario:0.650, pessimista:0.500} },
  { id:"g1",  name:"Grade 1",  cap:22, sections:2, openYear:2028, div:"LS", shift:"I", occ:{otimista:0.705, intermediario:0.659, pessimista:0.455} },
  { id:"g2",  name:"Grade 2",  cap:22, sections:2, openYear:2028, div:"LS", shift:"I", occ:{otimista:0.341, intermediario:0.341, pessimista:0.250} },
  { id:"g3",  name:"Grade 3",  cap:22, sections:2, openYear:2028, div:"LS", shift:"I", occ:{otimista:0.614, intermediario:0.341, pessimista:0.250} },
  { id:"g4",  name:"Grade 4",  cap:24, sections:2, openYear:2029, div:"LS", shift:"I", occ:{otimista:0.646, intermediario:0.625, pessimista:0.583} },
  { id:"g5",  name:"Grade 5",  cap:24, sections:2, openYear:2030, div:"LS", shift:"I", occ:{otimista:0.646, intermediario:0.625, pessimista:0.583} },
  { id:"g6",  name:"Grade 6",  cap:25, sections:2, openYear:2031, div:"MS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g7",  name:"Grade 7",  cap:25, sections:2, openYear:2032, div:"MS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g8",  name:"Grade 8",  cap:25, sections:2, openYear:2033, div:"MS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g9",  name:"Grade 9",  cap:25, sections:2, openYear:2034, div:"HS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g10", name:"Grade 10", cap:25, sections:2, openYear:2035, div:"HS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g11", name:"Grade 11", cap:25, sections:2, openYear:2036, div:"HS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
  { id:"g12", name:"Grade 12", cap:25, sections:2, openYear:2037, div:"HS", shift:"I", occ:{otimista:0.680, intermediario:0.680, pessimista:0.680} },
] as const;

export type PayrollGrade = typeof PAYROLL_GRADE_CONFIG[number];

export const TURMAS_SCHEDULE: Record<PayrollScenario, Record<string, number[]>> = {
  otimista: {
    t1i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t1m: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2m: extendSchedule([1,1,1,1,1,1,1,1,1,1]),
    pk3: extendSchedule([2,2,2,2,2,2,2,2,2,2]), pk4: extendSchedule([2,2,2,2,2,2,2,2,2,2]), k: extendSchedule([2,2,2,2,2,2,2,2,2,2]), g1: extendSchedule([2,2,2,2,2,2,2,2,2,2]),
    g2: extendSchedule([1,1,2,2,2,2,2,2,2,2]), g3: extendSchedule([2,2,2,2,2,2,2,2,2,2]), g4: extendSchedule([0,2,2,2,2,2,2,2,2,2]), g5: extendSchedule([0,0,2,2,2,2,2,2,2,2]),
    g6: extendSchedule([0,0,0,2,2,2,2,2,2,2]), g7: extendSchedule([0,0,0,0,2,2,2,2,2,2]), g8: extendSchedule([0,0,0,0,0,2,2,2,2,2]), g9: extendSchedule([0,0,0,0,0,0,2,2,2,2]),
    g10: extendSchedule([0,0,0,0,0,0,0,2,2,2]), g11: extendSchedule([0,0,0,0,0,0,0,0,2,2]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,2]),
  },
  intermediario: {
    t1i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t1m: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2m: extendSchedule([1,1,1,1,1,1,1,1,1,1]),
    pk3: extendSchedule([2,2,2,2,2,2,2,2,2,2]), pk4: extendSchedule([2,2,2,2,2,2,2,2,2,2]), k: extendSchedule([2,2,2,2,2,2,2,2,2,2]), g1: extendSchedule([2,2,2,2,2,2,2,2,2,2]),
    g2: extendSchedule([1,1,2,2,2,2,2,2,2,2]), g3: extendSchedule([1,1,1,2,2,2,2,2,2,2]), g4: extendSchedule([0,1,1,1,2,2,2,2,2,2]), g5: extendSchedule([0,0,1,1,1,2,2,2,2,2]),
    g6: extendSchedule([0,0,0,2,2,2,2,2,2,2]), g7: extendSchedule([0,0,0,0,2,2,2,2,2,2]), g8: extendSchedule([0,0,0,0,0,2,2,2,2,2]), g9: extendSchedule([0,0,0,0,0,0,2,2,2,2]),
    g10: extendSchedule([0,0,0,0,0,0,0,2,2,2]), g11: extendSchedule([0,0,0,0,0,0,0,0,2,2]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,2]),
  },
  pessimista: {
    t1i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t1m: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2i: extendSchedule([1,1,1,1,1,1,1,1,1,1]), t2m: extendSchedule([1,1,1,1,1,1,1,1,1,1]),
    pk3: extendSchedule([1,1,2,2,2,2,2,2,2,2]), pk4: extendSchedule([1,2,2,2,2,2,2,2,2,2]), k: extendSchedule([1,2,2,2,2,2,2,2,2,2]), g1: extendSchedule([1,2,2,2,2,2,2,2,2,2]),
    g2: extendSchedule([1,1,2,2,2,2,2,2,2,2]), g3: extendSchedule([1,1,1,2,2,2,2,2,2,2]), g4: extendSchedule([0,1,1,1,2,2,2,2,2,2]), g5: extendSchedule([0,0,1,1,1,2,2,2,2,2]),
    g6: extendSchedule([0,0,0,1,1,2,2,2,2,2]), g7: extendSchedule([0,0,0,0,1,1,1,2,2,2]), g8: extendSchedule([0,0,0,0,0,1,1,2,2,2]), g9: extendSchedule([0,0,0,0,0,0,1,2,2,2]),
    g10: extendSchedule([0,0,0,0,0,0,0,2,2,2]), g11: extendSchedule([0,0,0,0,0,0,0,0,2,2]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,2]),
  },
};

export const STUDENTS_SCHEDULE: Record<PayrollScenario, Record<string, number[]>> = {
  otimista: {
    t1i: extendSchedule([10,11,12,13,14,14,14,14,14,14]), t1m: extendSchedule([10,11,12,13,14,14,14,14,14,14]), t2i: extendSchedule([10,10,11,11,12,12,13,14,14,14]), t2m: extendSchedule([10,10,11,11,12,12,13,14,14,14]),
    pk3: extendSchedule([36,36,36,36,36,36,36,36,36,36]), pk4: extendSchedule([26,28,31,33,36,36,36,36,36,36]), k: extendSchedule([28,31,34,37,40,40,40,40,40,40]), g1: extendSchedule([31,34,37,41,44,44,44,44,44,44]),
    g2: extendSchedule([15,17,30,32,34,36,37,39,40,40]), g3: extendSchedule([27,29,30,30,32,34,36,37,38,38]), g4: extendSchedule([0,31,33,35,33,35,37,39,39,39]), g5: extendSchedule([0,0,33,35,37,33,35,37,37,37]),
    g6: extendSchedule([0,0,0,34,38,41,34,38,38,39]), g7: extendSchedule([0,0,0,0,36,38,40,42,43,43]), g8: extendSchedule([0,0,0,0,0,38,40,42,43,43]), g9: extendSchedule([0,0,0,0,0,0,40,44,44,45]),
    g10: extendSchedule([0,0,0,0,0,0,0,44,44,44]), g11: extendSchedule([0,0,0,0,0,0,0,0,44,44]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,44]),
  },
  intermediario: {
    t1i: extendSchedule([9,10,11,12,13,14,14,14,14,14]), t1m: extendSchedule([9,10,11,12,13,14,14,14,14,14]), t2i: extendSchedule([8,9,9,10,10,11,12,12,12,12]), t2m: extendSchedule([8,9,9,10,10,11,12,12,12,12]),
    pk3: extendSchedule([22,25,25,27,30,33,35,36,36,36]), pk4: extendSchedule([24,26,29,31,34,36,36,36,36,36]), k: extendSchedule([26,29,32,35,38,40,40,40,40,40]), g1: extendSchedule([29,32,35,38,41,44,44,44,44,44]),
    g2: extendSchedule([15,17,30,32,34,36,37,39,39,39]), g3: extendSchedule([15,17,18,30,32,34,36,37,37,37]), g4: extendSchedule([0,18,20,22,33,35,37,38,38,38]), g5: extendSchedule([0,0,20,22,24,33,35,36,36,36]),
    g6: extendSchedule([0,0,0,34,38,41,34,37,38,39]), g7: extendSchedule([0,0,0,0,36,38,40,42,42,42]), g8: extendSchedule([0,0,0,0,0,38,40,42,42,42]), g9: extendSchedule([0,0,0,0,0,0,40,43,44,45]),
    g10: extendSchedule([0,0,0,0,0,0,0,43,43,43]), g11: extendSchedule([0,0,0,0,0,0,0,0,43,43]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,43]),
  },
  pessimista: {
    t1i: extendSchedule([7,8,9,10,11,12,13,14,14,14]), t1m: extendSchedule([7,8,9,10,11,12,13,14,14,14]), t2i: extendSchedule([7,7,8,8,9,10,10,11,11,12]), t2m: extendSchedule([7,7,8,8,9,10,10,11,11,12]),
    pk3: extendSchedule([12,15,25,27,30,33,35,36,36,36]), pk4: extendSchedule([18,21,24,26,29,31,33,35,36,36]), k: extendSchedule([20,23,26,29,32,34,37,39,40,40]), g1: extendSchedule([20,23,26,30,33,36,38,41,43,44]),
    g2: extendSchedule([11,13,30,32,34,36,37,39,41,42]), g3: extendSchedule([11,13,15,30,32,34,36,37,39,40]), g4: extendSchedule([0,14,16,18,33,35,37,39,40,42]), g5: extendSchedule([0,0,16,18,20,33,35,37,38,40]),
    g6: extendSchedule([0,0,0,19,22,26,34,37,40,42]), g7: extendSchedule([0,0,0,0,21,23,25,27,28,30]), g8: extendSchedule([0,0,0,0,0,23,25,27,28,30]), g9: extendSchedule([0,0,0,0,0,0,25,28,30,33]),
    g10: extendSchedule([0,0,0,0,0,0,0,28,29,31]), g11: extendSchedule([0,0,0,0,0,0,0,0,29,31]), g12: extendSchedule([0,0,0,0,0,0,0,0,0,31]),
  },
};

export interface ScenarioProjectionYear {
  year: number;
  totalTurmas: number;
  totalStudents: number;
  turmasByDiv: Record<string, number>;
  studentsByDiv: Record<string, number>;

  fopagDiretoAnnual: number;
  folhaDiretaAnnual: number;
  beneficiosAnnual: number;
  grandTotal: number;

  leadershipAnnual: number;
  backofficeAnnual: number;
  specialistsAnnual: number;

  teachingFopagAnnual: number;
  teachingFolhaAnnual: number;
  teachingBenefitsAnnual: number;
  nonTeachingFopagAnnual: number;
  nonTeachingFolhaAnnual: number;
  nonTeachingBenefitsAnnual: number;

  totalRevenueAnnual: number;
  marginAnnual: number;
  coverageRatio: number;

  totalLeads: number;
  totalSupport: number;
}

export interface ScenarioProjection {
  scenario: PayrollScenario;
  tuitionScenario: TuitionScenario;
  marginMode: MarginMode;
  withBenefits: boolean;
  years: ScenarioProjectionYear[];
}

export interface ScenarioComparisonYear {
  year: number;
  totalTurmas: number;
  totalStudents: number;
  totalRevenueAnnual: number;
  fopagAnnual: number;
  marginAnnual: number;
  coverageRatio: number;
  totalLeads: number;
  totalSupport: number;
  turmasByDiv: Record<string, number>;
  studentsByDiv: Record<string, number>;
}

export interface ScenarioComparisonResult {
  scenario: PayrollScenario;
  tuitionScenario: TuitionScenario;
  marginMode: MarginMode;
  years: ScenarioComparisonYear[];
}

export interface ScenarioMatrixCellYear {
  year: number;
  totalTurmas: number;
  totalStudents: number;
  fopagAnnual: number;
  totalRevenueAnnual: number;
  marginAnnual: number;
  coverageRatio: number;
}

export interface RoleCompRow {
  layer: string;
  roleId: string;
  roleName: string;
  allocationModel: string;
  regime: string;
  year: number;
  headcount: number;
  grossMonthlyPerPerson: number;
  laborMonthlyPerPerson: number;
  benefitsMonthlyPerPerson: number;
  loadedMonthlyPerPerson: number;
  grossAnnualTotal: number;
  laborAnnualTotal: number;
  benefitsAnnualTotal: number;
  loadedAnnualTotal: number;
}

export function getAnnualRevenue(
  gradeId: string,
  tuitionScenario: TuitionScenario,
  students: number,
  year: number,
): number {
  const base2028 = TUITION_ANNUAL[gradeId]?.[tuitionScenario] ?? 0;
  const growth = Math.pow(1 + TUITION_GROWTH_RATE, year - 2028);
  return roundCurrency(students * base2028 * growth);
}

export function computeTurmasPerYear(
  grade: PayrollGrade,
  scenario: PayrollScenario,
): (number | null)[] {
  const schedule = TURMAS_SCHEDULE[scenario][grade.id];
  if (!schedule) return PAYROLL_YEARS.map(() => null);
  return schedule.map((t) => (t === 0 ? null : t));
}

export function getGradeLevel(
  gradeId: string,
  gradeTiers?: Record<string, string>,
) {
  const levelId = gradeTiers?.[gradeId] ?? "specialist";
  return (
    EDUCATOR_LEVELS.find((l) => l.id === levelId) ??
    EDUCATOR_LEVELS.find((l) => l.id === "specialist") ??
    EDUCATOR_LEVELS[0]
  );
}

function getLeadFteForGrade(grade: PayrollGrade, turmas: number): number {
  if (grade.div === "MS") {
    if (grade.id === "g6") return 3;
    if (grade.id === "g7") return 4;
    if (grade.id === "g8") return 3;
  }

  if (grade.div === "HS") {
    if (grade.id === "g9") return 4;
    if (grade.id === "g10") return 0;
    if (grade.id === "g11") return 3;
    if (grade.id === "g12") return 3;
  }

  return turmas;
}

type InternalTeachingYearCost = {
  students: number;
  revenueAnnual: number;
  leadsCount: number;
  supportCount: number;
  fopagAnnual: number;
  folhaAnnual: number;
  benefitsAnnual: number;
};

type ProjectedTeachingAnnualComponents = {
  grossLaborAnnual: number;
  benefitsAnnual: number;
};

function getProjectedTeachingAnnualComponents(
  compensation: Pick<
    PayrollRoleLike,
    "grossMonthly" | "laborChargesMonthly" | "benefitsMonthly"
  >,
  year: number,
  withBenefits: boolean,
): ProjectedTeachingAnnualComponents {
  const projected = getProjectedMonthlyComponentsPerPerson(
    {
      id: "teaching-projection",
      role: "Teaching Projection",
      allocationModel: "FOPAG_DIRETO",
      activeFrom: 2028,
      headcount: {},
      grossMonthly: compensation.grossMonthly,
      laborChargesMonthly: compensation.laborChargesMonthly,
      benefitsMonthly: compensation.benefitsMonthly,
    },
    year,
    { withBenefits },
  );

  return {
    grossLaborAnnual: roundCurrency(
      (projected.grossMonthly + projected.laborMonthly) * 13,
    ),
    benefitsAnnual: roundCurrency(projected.benefitsMonthly * 12),
  };
}

function getTeachingGradeYearBreakdown(params: {
  grade: PayrollGrade;
  turmas: number;
  yi: number;
  year: number;
  scenario: PayrollScenario;
  tuitionScenario: TuitionScenario;
  withBenefits: boolean;
  gradeTiers?: Record<string, string>;
}): InternalTeachingYearCost {
  const { grade, turmas, yi, year, scenario, tuitionScenario, withBenefits, gradeTiers } = params;

  const students = STUDENTS_SCHEDULE[scenario][grade.id]?.[yi] ?? 0;
  const revenueAnnual = getAnnualRevenue(grade.id, tuitionScenario, students, year);

  const leadLevel = getGradeLevel(grade.id, gradeTiers);
  const leadsCount = getLeadFteForGrade(grade, turmas);

  let fopagAnnual = 0;
  let folhaAnnual = 0;
  let benefitsAnnual = 0;
  let supportCount = 0;

  const leadProjected = getProjectedTeachingAnnualComponents(
    leadLevel,
    year,
    withBenefits,
  );

  if (grade.div === "EY" || grade.div === "LS" || grade.div === "MS" || grade.div === "HS") {
    fopagAnnual += leadsCount * leadProjected.grossLaborAnnual;
    if (withBenefits) benefitsAnnual += leadsCount * leadProjected.benefitsAnnual;
  }

  if (grade.div === "EY") {
    supportCount += turmas * 2;

    const monitorProjected = getProjectedTeachingAnnualComponents(
      LEARNING_MONITOR_DETAIL,
      year,
      withBenefits,
    );
    const assistantProjected = getProjectedTeachingAnnualComponents(
      LEARNING_ASSISTANT_DETAIL,
      year,
      withBenefits,
    );

    fopagAnnual +=
      turmas *
      (monitorProjected.grossLaborAnnual + assistantProjected.grossLaborAnnual);
    if (withBenefits) {
      benefitsAnnual +=
        turmas *
        (monitorProjected.benefitsAnnual + assistantProjected.benefitsAnnual);
    }
  } else if (grade.div === "LS") {
    supportCount += turmas;

    const assistantProjected = getProjectedTeachingAnnualComponents(
      LEARNING_ASSISTANT_DETAIL,
      year,
      withBenefits,
    );

    fopagAnnual += turmas * assistantProjected.grossLaborAnnual;
    if (withBenefits) {
      benefitsAnnual += turmas * assistantProjected.benefitsAnnual;
    }
  }

  return {
    students,
    revenueAnnual,
    leadsCount,
    supportCount,
    fopagAnnual: roundCurrency(fopagAnnual),
    folhaAnnual: roundCurrency(folhaAnnual),
    benefitsAnnual: roundCurrency(benefitsAnnual),
  };
}

export function getNonTeachingRoleProjectionsForYear(
  year: number,
  withBenefits: boolean,
): RoleYearProjection[] {
  const roles = [
    ...LEADERSHIP_CONFIG,
    ...BACKOFFICE_CONFIG,
    ...SPECIALISTS_CONFIG,
  ] as PayrollRoleLike[];

  return getRoleCollectionYearProjections(roles, year, { withBenefits });
}

export function getNonTeachingLayerTotalsForYear(
  year: number,
  withBenefits: boolean,
) {
  const projections = getNonTeachingRoleProjectionsForYear(year, withBenefits);

  let leadershipAnnual = 0;
  let backofficeAnnual = 0;
  let specialistsAnnual = 0;

  let nonTeachingFopagAnnual = 0;
  let nonTeachingFolhaAnnual = 0;
  let nonTeachingBenefitsAnnual = 0;

  for (const row of projections) {
    if (row.layer === "B") leadershipAnnual += row.loadedAnnualTotal;
    if (row.layer === "C") backofficeAnnual += row.loadedAnnualTotal;
    if (row.layer === "D") specialistsAnnual += row.loadedAnnualTotal;

    if (row.allocationModel === "FOPAG_DIRETO") {
      nonTeachingFopagAnnual += row.grossAnnualTotal + row.laborAnnualTotal;
    } else {
      nonTeachingFolhaAnnual += row.grossAnnualTotal + row.laborAnnualTotal;
    }

    nonTeachingBenefitsAnnual += row.benefitsAnnualTotal;
  }

  return {
    projections,
    leadershipAnnual: roundCurrency(leadershipAnnual),
    backofficeAnnual: roundCurrency(backofficeAnnual),
    specialistsAnnual: roundCurrency(specialistsAnnual),
    nonTeachingFopagAnnual: roundCurrency(nonTeachingFopagAnnual),
    nonTeachingFolhaAnnual: roundCurrency(nonTeachingFolhaAnnual),
    nonTeachingBenefitsAnnual: roundCurrency(nonTeachingBenefitsAnnual),
  };
}

export function buildPayrollProjection(params: {
  scenario: PayrollScenario;
  tuitionScenario: TuitionScenario;
  marginMode: MarginMode;
  gradeTiers?: Record<string, string>;
}): ScenarioProjection {
  const { scenario, tuitionScenario, marginMode, gradeTiers } = params;
  const withBenefits = marginMode === "FULLY_LOADED";

  const years = PAYROLL_YEARS.map((year, yi) => {
    let totalTurmas = 0;
    let totalStudents = 0;
    let totalRevenueAnnual = 0;
    let totalLeads = 0;
    let totalSupport = 0;

    let teachingFopagAnnual = 0;
    let teachingFolhaAnnual = 0;
    let teachingBenefitsAnnual = 0;

    const turmasByDiv: Record<string, number> = { EY: 0, LS: 0, MS: 0, HS: 0 };
    const studentsByDiv: Record<string, number> = { EY: 0, LS: 0, MS: 0, HS: 0 };

    for (const grade of PAYROLL_GRADE_CONFIG) {
      const turmas = TURMAS_SCHEDULE[scenario][grade.id]?.[yi] ?? 0;
      if (!turmas) continue;

      totalTurmas += turmas;
      turmasByDiv[grade.div] = (turmasByDiv[grade.div] ?? 0) + turmas;

      const teaching = getTeachingGradeYearBreakdown({
        grade,
        turmas,
        yi,
        year,
        scenario,
        tuitionScenario,
        withBenefits,
        gradeTiers,
      });

      totalStudents += teaching.students;
      studentsByDiv[grade.div] = (studentsByDiv[grade.div] ?? 0) + teaching.students;
      totalRevenueAnnual += teaching.revenueAnnual;

      totalLeads += teaching.leadsCount;
      totalSupport += teaching.supportCount;

      teachingFopagAnnual += teaching.fopagAnnual;
      teachingFolhaAnnual += teaching.folhaAnnual;
      teachingBenefitsAnnual += teaching.benefitsAnnual;
    }

    const nonTeaching = getNonTeachingLayerTotalsForYear(year, withBenefits);

    const fopagDiretoAnnual = roundCurrency(
      teachingFopagAnnual + nonTeaching.nonTeachingFopagAnnual,
    );
    const folhaDiretaAnnual = roundCurrency(
      teachingFolhaAnnual + nonTeaching.nonTeachingFolhaAnnual,
    );
    const beneficiosAnnual = roundCurrency(
      teachingBenefitsAnnual + nonTeaching.nonTeachingBenefitsAnnual,
    );

    const grandTotal = roundCurrency(
      fopagDiretoAnnual + folhaDiretaAnnual + beneficiosAnnual,
    );
    const marginAnnual = roundCurrency(totalRevenueAnnual - grandTotal);
    const coverageRatio = grandTotal > 0 ? totalRevenueAnnual / grandTotal : 0;

    return {
      year,
      totalTurmas,
      totalStudents,
      turmasByDiv,
      studentsByDiv,

      fopagDiretoAnnual,
      folhaDiretaAnnual,
      beneficiosAnnual,
      grandTotal,

      leadershipAnnual: nonTeaching.leadershipAnnual,
      backofficeAnnual: nonTeaching.backofficeAnnual,
      specialistsAnnual: nonTeaching.specialistsAnnual,

      teachingFopagAnnual: roundCurrency(teachingFopagAnnual),
      teachingFolhaAnnual: roundCurrency(teachingFolhaAnnual),
      teachingBenefitsAnnual: roundCurrency(teachingBenefitsAnnual),
      nonTeachingFopagAnnual: nonTeaching.nonTeachingFopagAnnual,
      nonTeachingFolhaAnnual: nonTeaching.nonTeachingFolhaAnnual,
      nonTeachingBenefitsAnnual: nonTeaching.nonTeachingBenefitsAnnual,

      totalRevenueAnnual: roundCurrency(totalRevenueAnnual),
      marginAnnual,
      coverageRatio,
      totalLeads: Math.round(totalLeads * 10) / 10,
      totalSupport,
    };
  });

  return {
    scenario,
    tuitionScenario,
    marginMode,
    withBenefits,
    years,
  };
}

export function buildScenarioComparison(params: {
  tuitionScenario: TuitionScenario;
  marginMode: MarginMode;
  gradeTiers?: Record<string, string>;
}): ScenarioComparisonResult[] {
  const scenarios: PayrollScenario[] = ["otimista", "intermediario", "pessimista"];

  return scenarios.map((scenario) => {
    const projection = buildPayrollProjection({
      scenario,
      tuitionScenario: params.tuitionScenario,
      marginMode: params.marginMode,
      gradeTiers: params.gradeTiers,
    });

    return {
      scenario,
      tuitionScenario: params.tuitionScenario,
      marginMode: params.marginMode,
      years: projection.years.map((row) => ({
        year: row.year,
        totalTurmas: row.totalTurmas,
        totalStudents: row.totalStudents,
        totalRevenueAnnual: row.totalRevenueAnnual,
        fopagAnnual: row.fopagDiretoAnnual,
        marginAnnual: row.marginAnnual,
        coverageRatio: row.coverageRatio,
        totalLeads: row.totalLeads,
        totalSupport: row.totalSupport,
        turmasByDiv: row.turmasByDiv,
        studentsByDiv: row.studentsByDiv,
      })),
    };
  });
}

export function buildScenarioMatrix(params: {
  marginMode: MarginMode;
  gradeTiers?: Record<string, string>;
}): ScenarioMatrixCellYear[][][] {
  const enrollmentScenarios: PayrollScenario[] = ["otimista", "intermediario", "pessimista"];
  const tuitionScenarios: TuitionScenario[] = ["cen1", "cen2", "cen3"];

  return enrollmentScenarios.map((scenario) =>
    tuitionScenarios.map((tuitionScenario) => {
      const projection = buildPayrollProjection({
        scenario,
        tuitionScenario,
        marginMode: params.marginMode,
        gradeTiers: params.gradeTiers,
      });

      return projection.years.map((row) => ({
        year: row.year,
        totalTurmas: row.totalTurmas,
        totalStudents: row.totalStudents,
        fopagAnnual: row.fopagDiretoAnnual,
        totalRevenueAnnual: row.totalRevenueAnnual,
        marginAnnual: row.marginAnnual,
        coverageRatio: row.coverageRatio,
      }));
    }),
  );
}

export function buildRoleCompTable(params: {
  years?: number[];
  marginMode: MarginMode;
}): RoleCompRow[] {
  const withBenefits = params.marginMode === "FULLY_LOADED";
  const years = params.years ?? PAYROLL_YEARS;
  const roles = [
    ...LEADERSHIP_CONFIG,
    ...BACKOFFICE_CONFIG,
    ...SPECIALISTS_CONFIG,
  ] as PayrollRoleLike[];

  const rows: RoleCompRow[] = [];

  for (const year of years) {
    const projections = getRoleCollectionYearProjections(roles, year, { withBenefits });

    for (const row of projections) {
      rows.push({
        layer: row.layer ?? "",
        roleId: row.roleId,
        roleName: row.roleName,
        allocationModel: row.allocationModel,
        regime: row.regime ?? "",
        year: row.year,
        headcount: row.headcount,
        grossMonthlyPerPerson: row.grossMonthlyPerPerson,
        laborMonthlyPerPerson: row.laborMonthlyPerPerson,
        benefitsMonthlyPerPerson: row.benefitsMonthlyPerPerson,
        loadedMonthlyPerPerson: row.loadedMonthlyPerPerson,
        grossAnnualTotal: row.grossAnnualTotal,
        laborAnnualTotal: row.laborAnnualTotal,
        benefitsAnnualTotal: row.benefitsAnnualTotal,
        loadedAnnualTotal: row.loadedAnnualTotal,
      });
    }
  }

  return rows;
}
