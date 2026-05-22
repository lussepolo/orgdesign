import { ANNUAL_ADJUSTMENT } from "../../constants";

export type AllocationModel = "FOPAG_DIRETO" | "FOLHA_DIRETA";

export interface PayrollRoleLike {
  id: string;
  role: string;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  allocationModel: AllocationModel;
  activeFrom: number;
  headcount: Record<number, number>;
  layer?: string;
  regime?: string;
}

export interface PayrollEngineOptions {
  withBenefits: boolean;
  annualAdjustment?: number;
}

export interface RoleYearProjection {
  roleId: string;
  roleName: string;
  layer?: string;
  allocationModel: AllocationModel;
  regime?: string;
  year: number;
  activeFrom: number;
  headcount: number;
  growthFactor: number;

  grossMonthlyPerPerson: number;
  laborMonthlyPerPerson: number;
  benefitsMonthlyPerPerson: number;
  loadedMonthlyPerPerson: number;

  grossMonthlyTotal: number;
  laborMonthlyTotal: number;
  benefitsMonthlyTotal: number;
  loadedMonthlyTotal: number;

  grossAnnualTotal: number;
  laborAnnualTotal: number;
  benefitsAnnualTotal: number;
  loadedAnnualTotal: number;
}

export interface PayrollYearTotals {
  year: number;
  fopagDireto: {
    grossAnnual: number;
    laborAnnual: number;
    benefitsAnnual: number;
    loadedAnnual: number;
  };
  folhaDireta: {
    grossAnnual: number;
    laborAnnual: number;
    benefitsAnnual: number;
    loadedAnnual: number;
  };
  grandTotal: {
    grossAnnual: number;
    laborAnnual: number;
    benefitsAnnual: number;
    loadedAnnual: number;
  };
}

const DEFAULT_OPTIONS: PayrollEngineOptions = {
  withBenefits: true,
  annualAdjustment: ANNUAL_ADJUSTMENT,
};

const COMPENSATION_SCALE_BASE_YEAR = 2028;

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function resolveGrowthFactor(
  year: number,
  activeFrom: number,
  annualAdjustment: number,
): number {
  if (year < activeFrom) return 0;
  return Math.pow(annualAdjustment, year - COMPENSATION_SCALE_BASE_YEAR + 1);
}

export function annualSalaryBurden(
  role: {
    grossMonthly: number;
    laborChargesMonthly: number;
    benefitsMonthly: number;
  },
  withBenefits: boolean,
): number {
  const gross = safeNumber(role.grossMonthly);
  const labor = safeNumber(role.laborChargesMonthly);
  const benefits = safeNumber(role.benefitsMonthly);

  return roundCurrency((gross + labor) * 13 + (withBenefits ? benefits * 12 : 0));
}

export function annualBenefitsOnly(role: { benefitsMonthly: number }): number {
  return roundCurrency(safeNumber(role.benefitsMonthly) * 12);
}

export function annualGrossAndLaborOnly(role: {
  grossMonthly: number;
  laborChargesMonthly: number;
}): number {
  return roundCurrency(
    (safeNumber(role.grossMonthly) + safeNumber(role.laborChargesMonthly)) * 13,
  );
}

export function annualizeTeachingMonthlyLoaded(
  monthlyLoadedPerFte: number,
  fteCount: number,
): number {
  return roundCurrency(safeNumber(monthlyLoadedPerFte) * safeNumber(fteCount) * 13);
}

export function annualizeGrossAndLaborOnly(
  grossMonthlyPerFte: number,
  laborMonthlyPerFte: number,
  fteCount: number,
): number {
  return roundCurrency(
    (safeNumber(grossMonthlyPerFte) + safeNumber(laborMonthlyPerFte)) *
      safeNumber(fteCount) *
      13,
  );
}

export function annualizeBenefitsOnly(
  benefitsMonthlyPerFte: number,
  fteCount: number,
): number {
  return roundCurrency(safeNumber(benefitsMonthlyPerFte) * safeNumber(fteCount) * 12);
}

export function getProjectedMonthlyComponentsPerPerson(
  role: PayrollRoleLike,
  year: number,
  options?: Partial<PayrollEngineOptions>,
): {
  grossMonthly: number;
  laborMonthly: number;
  benefitsMonthly: number;
  loadedMonthly: number;
  growthFactor: number;
} {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const annualAdjustment = safeNumber(resolved.annualAdjustment) || 1;
  const growthFactor = resolveGrowthFactor(
    year,
    role.activeFrom,
    annualAdjustment,
  );

  if (growthFactor === 0) {
    return {
      grossMonthly: 0,
      laborMonthly: 0,
      benefitsMonthly: 0,
      loadedMonthly: 0,
      growthFactor: 0,
    };
  }

  const grossMonthly = roundCurrency(safeNumber(role.grossMonthly) * growthFactor);
  const laborMonthly = roundCurrency(
    safeNumber(role.laborChargesMonthly) * growthFactor,
  );
  const rawBenefitsMonthly = roundCurrency(
    safeNumber(role.benefitsMonthly) * growthFactor,
  );
  const benefitsMonthly = resolved.withBenefits ? rawBenefitsMonthly : 0;

  return {
    grossMonthly,
    laborMonthly,
    benefitsMonthly,
    loadedMonthly: roundCurrency(grossMonthly + laborMonthly + benefitsMonthly),
    growthFactor,
  };
}

export function getRoleYearProjection(
  role: PayrollRoleLike,
  year: number,
  options?: Partial<PayrollEngineOptions>,
): RoleYearProjection {
  const resolved = { ...DEFAULT_OPTIONS, ...options };
  const headcount = year < role.activeFrom ? 0 : safeNumber(role.headcount?.[year]);
  const perPerson = getProjectedMonthlyComponentsPerPerson(role, year, resolved);

  const grossMonthlyTotal = roundCurrency(perPerson.grossMonthly * headcount);
  const laborMonthlyTotal = roundCurrency(perPerson.laborMonthly * headcount);
  const benefitsMonthlyTotal = roundCurrency(perPerson.benefitsMonthly * headcount);
  const loadedMonthlyTotal = roundCurrency(perPerson.loadedMonthly * headcount);

  const grossAnnualTotal = roundCurrency(grossMonthlyTotal * 13);
  const laborAnnualTotal = roundCurrency(laborMonthlyTotal * 13);
  const benefitsAnnualTotal = roundCurrency(benefitsMonthlyTotal * 12);
  const loadedAnnualTotal = roundCurrency(
    grossAnnualTotal + laborAnnualTotal + benefitsAnnualTotal,
  );

  return {
    roleId: role.id,
    roleName: role.role,
    layer: role.layer,
    allocationModel: role.allocationModel,
    regime: role.regime,
    year,
    activeFrom: role.activeFrom,
    headcount,
    growthFactor: perPerson.growthFactor,

    grossMonthlyPerPerson: perPerson.grossMonthly,
    laborMonthlyPerPerson: perPerson.laborMonthly,
    benefitsMonthlyPerPerson: perPerson.benefitsMonthly,
    loadedMonthlyPerPerson: perPerson.loadedMonthly,

    grossMonthlyTotal,
    laborMonthlyTotal,
    benefitsMonthlyTotal,
    loadedMonthlyTotal,

    grossAnnualTotal,
    laborAnnualTotal,
    benefitsAnnualTotal,
    loadedAnnualTotal,
  };
}

export function getRoleCollectionYearProjections(
  roles: PayrollRoleLike[],
  year: number,
  options?: Partial<PayrollEngineOptions>,
): RoleYearProjection[] {
  return roles.map((role) => getRoleYearProjection(role, year, options));
}

export function getRoleCollectionYearTotals(
  roles: PayrollRoleLike[],
  year: number,
  options?: Partial<PayrollEngineOptions>,
): PayrollYearTotals {
  const projections = getRoleCollectionYearProjections(roles, year, options);

  const totals: PayrollYearTotals = {
    year,
    fopagDireto: {
      grossAnnual: 0,
      laborAnnual: 0,
      benefitsAnnual: 0,
      loadedAnnual: 0,
    },
    folhaDireta: {
      grossAnnual: 0,
      laborAnnual: 0,
      benefitsAnnual: 0,
      loadedAnnual: 0,
    },
    grandTotal: {
      grossAnnual: 0,
      laborAnnual: 0,
      benefitsAnnual: 0,
      loadedAnnual: 0,
    },
  };

  for (const row of projections) {
    const bucket =
      row.allocationModel === "FOPAG_DIRETO" ? totals.fopagDireto : totals.folhaDireta;

    bucket.grossAnnual = roundCurrency(bucket.grossAnnual + row.grossAnnualTotal);
    bucket.laborAnnual = roundCurrency(bucket.laborAnnual + row.laborAnnualTotal);
    bucket.benefitsAnnual = roundCurrency(
      bucket.benefitsAnnual + row.benefitsAnnualTotal,
    );
    bucket.loadedAnnual = roundCurrency(bucket.loadedAnnual + row.loadedAnnualTotal);

    totals.grandTotal.grossAnnual = roundCurrency(
      totals.grandTotal.grossAnnual + row.grossAnnualTotal,
    );
    totals.grandTotal.laborAnnual = roundCurrency(
      totals.grandTotal.laborAnnual + row.laborAnnualTotal,
    );
    totals.grandTotal.benefitsAnnual = roundCurrency(
      totals.grandTotal.benefitsAnnual + row.benefitsAnnualTotal,
    );
    totals.grandTotal.loadedAnnual = roundCurrency(
      totals.grandTotal.loadedAnnual + row.loadedAnnualTotal,
    );
  }

  return totals;
}

export function getRoleCollectionTimelineTotals(
  roles: PayrollRoleLike[],
  years: number[],
  options?: Partial<PayrollEngineOptions>,
): PayrollYearTotals[] {
  return years.map((year) => getRoleCollectionYearTotals(roles, year, options));
}
