import {
  BACKOFFICE_CONFIG,
  LEADERSHIP_CONFIG,
  SPECIALISTS_CONFIG,
  type BackofficeRole,
  type LeadershipRole,
  type SpecialistRole,
} from "../../constants/leadership";
import {
  PAYROLL_YEARS,
  buildRoleCompTable,
  type MarginMode,
  type RoleCompRow,
  type ScenarioProjection,
} from "./domain";
import { getProjectedMonthlyComponentsPerPerson, roundCurrency } from "./core";

type NonTeachingRole = LeadershipRole | BackofficeRole | SpecialistRole;

export interface ScenarioOverviewRow {
  year: number;
  scenario: string;
  tuitionTable: string;
  students: number;
  turmas: number;
  teachingGrossLabor: number;
  teachingBenefits: number;
  leadershipGrossLabor: number;
  leadershipBenefits: number;
  backofficeGrossLabor: number;
  backofficeBenefits: number;
  specialistsGrossLabor: number;
  specialistsBenefits: number;
  nonTeachingGrossLabor: number;
  nonTeachingBenefits: number;
  totalGrossLabor: number;
  totalBenefits: number;
  totalPayroll: number;
  revenue: number;
  margin: number;
  coverageRatio: number;
  coveragePercent: number;
}

export interface NonTeachingHeadcountPlanRow {
  nivel: string;
  segmento: string;
  cargoAreaTurma: string;
  cargo: string;
  modeloAlocacao: string;
  salarioBase: number;
  encargosMensais: number;
  beneficiosMensais: number;
  headcountByYear: Record<number, number>;
  roleId: string;
  activeFrom: number;
}

export interface RoleAuditSummaryRow extends NonTeachingHeadcountPlanRow {
  headcountStepChanges: string;
  firstActiveYear: number | "";
  firstActiveYearGrossMonthly: number;
  firstActiveYearLaborMonthly: number;
  firstActiveYearBenefitsMonthly: number;
  firstActiveYearLoadedMonthly: number;
  finalHeadcount: number;
  carryForwardRule: string;
}

export interface PayrollProjectionMetricRow {
  section: string;
  metric: string;
  scenario: string;
  tuitionTable: string;
  marginMode: MarginMode;
  valuesByYear: Record<number, number>;
  format: "integer" | "currency" | "percent";
  formula?: "nonTeachingGrossLabor" | "nonTeachingBenefits" | "totalGrossLabor" | "totalBenefits" | "totalPayroll" | "payrollMargin" | "coverageRatio";
}

export interface ExportWorkbookPayload {
  years: number[];
  scenario: string;
  tuitionScenario: string;
  marginMode: MarginMode;
  overviewRows: ScenarioOverviewRow[];
  nonTeachingHeadcountRows: NonTeachingHeadcountPlanRow[];
  roleAuditRows: RoleAuditSummaryRow[];
  payrollProjectionRows: PayrollProjectionMetricRow[];
}

const layerLabelByCode: Record<string, string> = {
  B: "Leadership",
  C: "Backoffice",
  D: "Specialists",
};

const rolePlanningMap: Record<string, { segmento: string; cargoAreaTurma: string }> = {
  hos: { segmento: "Campus Leadership", cargoAreaTurma: "Campus" },
  ey_principal: { segmento: "Division Leadership", cargoAreaTurma: "Early Years" },
  ls_principal: { segmento: "Division Leadership", cargoAreaTurma: "Lower School" },
  ms_principal: { segmento: "Division Leadership", cargoAreaTurma: "Middle School" },
  hs_principal: { segmento: "Division Leadership", cargoAreaTurma: "High School" },
  counselor: { segmento: "Student Support", cargoAreaTurma: "Counseling" },
  edtech: { segmento: "Campus Leadership", cargoAreaTurma: "Educational Technology" },
  ops: { segmento: "Campus Leadership", cargoAreaTurma: "Operations" },
  clerk: { segmento: "Operations", cargoAreaTurma: "Portaria" },
  family: { segmento: "Family / Community", cargoAreaTurma: "Family Engagement" },
  library: { segmento: "Learning Resources", cargoAreaTurma: "Library / Inspiration" },
  it: { segmento: "Technology", cargoAreaTurma: "IT" },
  maintenance: { segmento: "Operations", cargoAreaTurma: "Maintenance" },
  marketing: { segmento: "Family / Community", cargoAreaTurma: "Marketing / Events" },
  nurse: { segmento: "Health", cargoAreaTurma: "Nurse Office" },
  nursing_intern: { segmento: "Health", cargoAreaTurma: "Nurse Office" },
  finance: { segmento: "Finance / People", cargoAreaTurma: "Finance" },
  finance_assistant: { segmento: "Financeiro", cargoAreaTurma: "Financeiro" },
  hr: { segmento: "Finance / People", cargoAreaTurma: "People / HR" },
  secretary: { segmento: "Administrative", cargoAreaTurma: "School Office" },
  after_school: { segmento: "Shared Specialist", cargoAreaTurma: "After School" },
  arts: { segmento: "Shared Specialist", cargoAreaTurma: "Arts" },
  body: { segmento: "Shared Specialist", cargoAreaTurma: "Body & Movement" },
  music: { segmento: "Shared Specialist", cargoAreaTurma: "Music" },
  led: { segmento: "Shared Specialist", cargoAreaTurma: "Learning Experience" },
  hs_pool: { segmento: "High School Pool", cargoAreaTurma: "High School" },
};

function getAllNonTeachingRoles(): NonTeachingRole[] {
  return [
    ...LEADERSHIP_CONFIG,
    ...BACKOFFICE_CONFIG,
    ...SPECIALISTS_CONFIG,
  ];
}

function getLayerLabel(role: NonTeachingRole): string {
  return layerLabelByCode[role.layer] ?? role.layer;
}

function normalizeRegime(regime: string | undefined): string {
  if (regime === "shared specialist") return "Shared Specialist";
  if (regime === "hs pool") return "High School Pool";
  return regime ?? "";
}

function getPlanningDescriptor(role: NonTeachingRole) {
  const mapped = rolePlanningMap[role.id];
  if (mapped) return mapped;
  const regime = "regime" in role ? normalizeRegime(role.regime) : "";
  const fallback = regime || getLayerLabel(role);
  return { segmento: fallback, cargoAreaTurma: fallback };
}

function buildNonTeachingHeadcountRows(years: number[]): NonTeachingHeadcountPlanRow[] {
  return getAllNonTeachingRoles().map((role) => {
    const descriptor = getPlanningDescriptor(role);
    return {
      nivel: getLayerLabel(role),
      segmento: descriptor.segmento,
      cargoAreaTurma: descriptor.cargoAreaTurma,
      cargo: role.role,
      modeloAlocacao: role.allocationModel,
      salarioBase: role.grossMonthly,
      encargosMensais: role.laborChargesMonthly,
      beneficiosMensais: role.benefitsMonthly,
      headcountByYear: Object.fromEntries(
        years.map((year) => [year, role.headcount[year] ?? 0]),
      ),
      roleId: role.id,
      activeFrom: role.activeFrom,
    };
  });
}

function buildHeadcountStepChanges(
  row: NonTeachingHeadcountPlanRow,
  years: number[],
): string {
  const changes: string[] = [];
  years.forEach((year, index) => {
    const previous = index === 0 ? 0 : row.headcountByYear[years[index - 1]] ?? 0;
    const current = row.headcountByYear[year] ?? 0;
    if (current !== previous) changes.push(`${year}:${current}`);
  });
  return changes.length ? changes.join("; ") : "No active headcount";
}

function buildRoleAuditRows(
  headcountRows: NonTeachingHeadcountPlanRow[],
  years: number[],
): RoleAuditSummaryRow[] {
  const finalYear = years[years.length - 1];
  const roleById = Object.fromEntries(
    getAllNonTeachingRoles().map((role) => [role.id, role]),
  );

  return headcountRows.map((row) => {
    const firstActiveYear =
      years.find((year) => (row.headcountByYear[year] ?? 0) > 0) ?? "";
    const role = roleById[row.roleId];
    const firstActiveProjection =
      role && firstActiveYear
        ? getProjectedMonthlyComponentsPerPerson(role, firstActiveYear, { withBenefits: true })
        : null;

    return {
      ...row,
      headcountStepChanges: buildHeadcountStepChanges(row, years),
      firstActiveYear,
      firstActiveYearGrossMonthly: firstActiveProjection?.grossMonthly ?? 0,
      firstActiveYearLaborMonthly: firstActiveProjection?.laborMonthly ?? 0,
      firstActiveYearBenefitsMonthly: firstActiveProjection?.benefitsMonthly ?? 0,
      firstActiveYearLoadedMonthly: firstActiveProjection?.loadedMonthly ?? 0,
      finalHeadcount: finalYear ? row.headcountByYear[finalYear] ?? 0 : 0,
      carryForwardRule: "Latest explicit headcount carries forward until the next step change.",
    };
  });
}

function aggregateRoleCompRows(roleCompRows: RoleCompRow[]) {
  const result: Record<
    number,
    Record<string, { grossLabor: number; benefits: number }>
  > = {};

  for (const row of roleCompRows) {
    const layer = layerLabelByCode[row.layer] ?? row.layer;
    result[row.year] ??= {};
    result[row.year][layer] ??= { grossLabor: 0, benefits: 0 };
    result[row.year][layer].grossLabor = roundCurrency(
      result[row.year][layer].grossLabor + row.grossAnnualTotal + row.laborAnnualTotal,
    );
    result[row.year][layer].benefits = roundCurrency(
      result[row.year][layer].benefits + row.benefitsAnnualTotal,
    );
  }

  return result;
}

export function buildExportOverviewRows(
  projection: ScenarioProjection,
  roleCompRows: RoleCompRow[],
): ScenarioOverviewRow[] {
  const roleCompByYear = aggregateRoleCompRows(roleCompRows);

  return projection.years.map((row) => {
    const leadership = roleCompByYear[row.year]?.Leadership ?? { grossLabor: 0, benefits: 0 };
    const backoffice = roleCompByYear[row.year]?.Backoffice ?? { grossLabor: 0, benefits: 0 };
    const specialists = roleCompByYear[row.year]?.Specialists ?? { grossLabor: 0, benefits: 0 };
    const nonTeachingGrossLabor = roundCurrency(
      leadership.grossLabor + backoffice.grossLabor + specialists.grossLabor,
    );
    const nonTeachingBenefits = roundCurrency(
      leadership.benefits + backoffice.benefits + specialists.benefits,
    );
    const teachingGrossLabor = roundCurrency(row.teachingFopagAnnual + row.teachingFolhaAnnual);
    const teachingBenefits = roundCurrency(row.teachingBenefitsAnnual);
    const totalGrossLabor = roundCurrency(teachingGrossLabor + nonTeachingGrossLabor);
    const totalBenefits = roundCurrency(teachingBenefits + nonTeachingBenefits);
    const totalPayroll = roundCurrency(totalGrossLabor + totalBenefits);

    return {
      year: row.year,
      scenario: projection.scenario,
      tuitionTable: projection.tuitionScenario,
      students: row.totalStudents,
      turmas: row.totalTurmas,
      teachingGrossLabor,
      teachingBenefits,
      leadershipGrossLabor: leadership.grossLabor,
      leadershipBenefits: leadership.benefits,
      backofficeGrossLabor: backoffice.grossLabor,
      backofficeBenefits: backoffice.benefits,
      specialistsGrossLabor: specialists.grossLabor,
      specialistsBenefits: specialists.benefits,
      nonTeachingGrossLabor,
      nonTeachingBenefits,
      totalGrossLabor,
      totalBenefits,
      totalPayroll,
      revenue: roundCurrency(row.totalRevenueAnnual),
      margin: roundCurrency(row.totalRevenueAnnual - totalPayroll),
      coverageRatio: totalPayroll > 0 ? roundCurrency(row.totalRevenueAnnual / totalPayroll) : 0,
      coveragePercent: totalPayroll > 0 ? Math.round((row.totalRevenueAnnual / totalPayroll) * 100) : 0,
    };
  });
}

function valuesByYear(
  years: number[],
  getValue: (year: number) => number,
): Record<number, number> {
  return Object.fromEntries(years.map((year) => [year, getValue(year)]));
}

function buildPayrollProjectionRows(params: {
  years: number[];
  overviewRows: ScenarioOverviewRow[];
  scenario: string;
  tuitionScenario: string;
  marginMode: MarginMode;
}): PayrollProjectionMetricRow[] {
  const { years, overviewRows, scenario, tuitionScenario, marginMode } = params;
  const byYear = Object.fromEntries(overviewRows.map((row) => [row.year, row]));
  const base = (
    section: string,
    metric: string,
    key: keyof ScenarioOverviewRow,
    format: PayrollProjectionMetricRow["format"],
  ): PayrollProjectionMetricRow => ({
    section,
    metric,
    scenario,
    tuitionTable: tuitionScenario,
    marginMode,
    valuesByYear: valuesByYear(years, (year) => Number(byYear[year]?.[key] ?? 0)),
    format,
  });

  const formula = (
    section: string,
    metric: string,
    formulaType: PayrollProjectionMetricRow["formula"],
    key: keyof ScenarioOverviewRow,
    format: PayrollProjectionMetricRow["format"],
  ): PayrollProjectionMetricRow => ({
    section,
    metric,
    scenario,
    tuitionTable: tuitionScenario,
    marginMode,
    valuesByYear: valuesByYear(years, (year) => Number(byYear[year]?.[key] ?? 0)),
    format,
    formula: formulaType,
  });

  return [
    base("Operating Volume", "Students", "students", "integer"),
    base("Operating Volume", "Turmas", "turmas", "integer"),
    base("Teaching Payroll", "Teaching Gross + Labor", "teachingGrossLabor", "currency"),
    base("Teaching Payroll", "Teaching Benefits", "teachingBenefits", "currency"),
    base("Non-Teaching Payroll", "Leadership Gross + Labor", "leadershipGrossLabor", "currency"),
    base("Non-Teaching Payroll", "Leadership Benefits", "leadershipBenefits", "currency"),
    base("Non-Teaching Payroll", "Backoffice Gross + Labor", "backofficeGrossLabor", "currency"),
    base("Non-Teaching Payroll", "Backoffice Benefits", "backofficeBenefits", "currency"),
    base("Non-Teaching Payroll", "Specialists Gross + Labor", "specialistsGrossLabor", "currency"),
    base("Non-Teaching Payroll", "Specialists Benefits", "specialistsBenefits", "currency"),
    formula("Non-Teaching Payroll", "Non-Teaching Gross + Labor", "nonTeachingGrossLabor", "nonTeachingGrossLabor", "currency"),
    formula("Non-Teaching Payroll", "Non-Teaching Benefits", "nonTeachingBenefits", "nonTeachingBenefits", "currency"),
    formula("Total Payroll", "Total Gross + Labor", "totalGrossLabor", "totalGrossLabor", "currency"),
    formula("Total Payroll", "Total Benefits", "totalBenefits", "totalBenefits", "currency"),
    formula("Total Payroll", "Total Payroll", "totalPayroll", "totalPayroll", "currency"),
    base("Revenue", "Revenue", "revenue", "currency"),
    formula("Margin", "Payroll Margin", "payrollMargin", "margin", "currency"),
    formula("Margin", "Coverage Ratio", "coverageRatio", "coverageRatio", "percent"),
  ];
}

export function buildExportPayload(params: {
  projection: ScenarioProjection;
  marginMode: MarginMode;
  years?: number[];
}): ExportWorkbookPayload {
  const years = params.years ?? PAYROLL_YEARS;
  const roleCompRows = buildRoleCompTable({
    years,
    marginMode: params.marginMode,
  });
  const overviewRows = buildExportOverviewRows(params.projection, roleCompRows);
  const nonTeachingHeadcountRows = buildNonTeachingHeadcountRows(years);

  return {
    years,
    scenario: params.projection.scenario,
    tuitionScenario: params.projection.tuitionScenario,
    marginMode: params.marginMode,
    overviewRows,
    nonTeachingHeadcountRows,
    roleAuditRows: buildRoleAuditRows(nonTeachingHeadcountRows, years),
    payrollProjectionRows: buildPayrollProjectionRows({
      years,
      overviewRows,
      scenario: params.projection.scenario,
      tuitionScenario: params.projection.tuitionScenario,
      marginMode: params.marginMode,
    }),
  };
}
