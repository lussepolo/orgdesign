export type PayrollRoleFamily =
  | "Leadership"
  | "Backoffice"
  | "Specialists"
  | "TeachingTier"
  | "TeachingSupport";

export type PayrollAllocationCategorySource = "FOPAG_DIRETO" | "FOLHA_DIRETA";

export type PayrollSourceCostBasis =
  | "gross_monthly_salary_only"
  | "gross_monthly_salary_only_for_monthlySalaryBRL"
  | "total_monthly_including_all_components"
  | "unclear";

export interface PayrollRoleCostSourceRecord {
  sourceRoleLabel: string;
  normalizedRoleId: string;
  roleFamily: PayrollRoleFamily;
  layer: "B" | "C" | "D" | null;
  regime: string | null;
  division: string | null;
  areaOrFunction: string | null;
  gradeBandApplicability: string[] | null;
  yearApplicability: number | null;
  scenarioApplicability: null;
  fteOrHeadcountSourceValue: string | null;
  headcountProgression: [number, number][] | null;
  rawGrossMonthlyBRL: number;
  rawLaborChargesMonthlyBRL: number;
  rawBenefitsMonthlyBRL: number;
  monthlySalaryBRL: number;
  monthlyTotalCostBRL: number | null;
  annualSalaryBRL: null;
  annualTotalCostBRL: null;
  costBasis: PayrollSourceCostBasis;
  includesBenefitsOrCharges: false;
  allocationCategory: PayrollAllocationCategorySource;
  benefitsOrChargesNotes: string;
  sourceFile: string;
  sourceSheetOrTab: string;
  sourceRowOrCellRef: string | null;
  sourceNotes: string;
  financeValidationProvenance?: string;
  needsFinanceReview: boolean;
  calculationReady: false;
}

export interface PayrollRoleCostSourceExtractionBoundaries {
  included: string[];
  excluded: string[];
}

export interface PayrollRoleCostSourceCategoryTotals {
  leadershipRolesLayerB: number;
  backofficeRolesLayerC: number;
  specialistRolesLayerD: number;
  teachingTierInputs: number;
  teachingSupportInputs: number;
  displayOnlyExcluded: number;
  totalRecords: number;
}

export interface PayrollRoleCostSourceDataContract {
  extractedAt: string;
  extractedBy: string;
  sourceDiscoveryNotes: string;
  primarySourceFile: string;
  secondarySourceFile: string;
  auditReferenceFile: string;
  noFinancePayrollSpreadsheetFound: boolean;
  financeValidationProvenance: string;
  allRecordsNeedFinanceReview: boolean;
  annualizationFormulaFromCore: string;
  annualizationFormulaSource: string;
  annualAdjustmentFactor: string;
  extractionBoundaries: PayrollRoleCostSourceExtractionBoundaries;
  sourceCategoryTotals: PayrollRoleCostSourceCategoryTotals;
  records: PayrollRoleCostSourceRecord[];
}
