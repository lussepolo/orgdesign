export type GradeId =
  | "t1"
  | "t2"
  | "pk3"
  | "pk4"
  | "kindergarten"
  | "g1"
  | "g2"
  | "g3"
  | "g4"
  | "g5"
  | "g6"
  | "g7"
  | "g8"
  | "g9"
  | "g10"
  | "g11"
  | "g12";

export type DivisionId = "ey" | "ls" | "ms" | "hs";

export const GRADE_DIVISION_MAP: Record<GradeId, DivisionId> = {
  t1: "ey",
  t2: "ey",
  pk3: "ey",
  pk4: "ey",
  kindergarten: "ey",
  g1: "ls",
  g2: "ls",
  g3: "ls",
  g4: "ls",
  g5: "ls",
  g6: "ms",
  g7: "ms",
  g8: "ms",
  g9: "hs",
  g10: "hs",
  g11: "hs",
  g12: "hs",
};

export type ProjectionYear =
  | 2028
  | 2029
  | 2030
  | 2031
  | 2032
  | 2033
  | 2034
  | 2035
  | 2036
  | 2037
  | 2038
  | 2039
  | 2040
  | 2041
  | 2042
  | 2043
  | 2044
  | 2045
  | 2046
  | 2047;

export const PROJECTION_YEARS = [
  2028,
  2029,
  2030,
  2031,
  2032,
  2033,
  2034,
  2035,
  2036,
  2037,
  2038,
  2039,
  2040,
  2041,
  2042,
  2043,
  2044,
  2045,
  2046,
  2047,
] as const satisfies readonly ProjectionYear[];

export type EnrollmentByYearAndGrade = Record<
  ProjectionYear,
  Partial<Record<GradeId, number>>
>;

export type TuitionScenarioId =
  | "bp1_division_differentiated"
  | "bp2_ey_ls_unified"
  | "bp3_ey_to_ms_unified";

export type TuitionByScenarioAndGrade = Record<
  TuitionScenarioId,
  Partial<Record<GradeId, number>>
>;

export type RevenueAssumptionStatus =
  | "confirmed"
  | "missing"
  | "pending_structured_input"
  | "needs_mapping";

export interface DiscountAssumptions {
  status: RevenueAssumptionStatus;
  globalAverageDiscountRate: number | null;
  discountRateByDivision?: Partial<Record<DivisionId, number>>;
  discountRateByGrade?: Partial<Record<GradeId, number>>;
  notes?: string;
}

export interface AnnualTuitionAdjustmentAssumptions {
  status: RevenueAssumptionStatus;
  globalAnnualAdjustmentRate: number | null;
  adjustmentRateByYear?: Partial<Record<ProjectionYear, number>>;
  notes?: string;
}

export interface RevenueInputReadiness {
  openingGrades: RevenueAssumptionStatus;
  occupancy: RevenueAssumptionStatus;
  enrollmentByYearAndGrade: RevenueAssumptionStatus;
  tuitionValues: RevenueAssumptionStatus;
  discountAssumptions: RevenueAssumptionStatus;
  annualTuitionAdjustmentAssumptions: RevenueAssumptionStatus;
}

export interface RevenueInputBundle {
  selectedOpeningGradesOptionId: string | null;
  selectedTuitionScenarioId: TuitionScenarioId | null;
  enrollmentByYearAndGrade: EnrollmentByYearAndGrade | null;
  tuitionByScenarioAndGrade: TuitionByScenarioAndGrade | null;
  discountAssumptions: DiscountAssumptions;
  annualTuitionAdjustmentAssumptions: AnnualTuitionAdjustmentAssumptions;
  readiness: RevenueInputReadiness;
}

export const EMPTY_REVENUE_INPUT_BUNDLE: RevenueInputBundle = {
  selectedOpeningGradesOptionId: null,
  selectedTuitionScenarioId: null,
  enrollmentByYearAndGrade: null,
  tuitionByScenarioAndGrade: null,
  discountAssumptions: {
    status: "missing",
    globalAverageDiscountRate: null,
  },
  annualTuitionAdjustmentAssumptions: {
    status: "missing",
    globalAnnualAdjustmentRate: null,
  },
  readiness: {
    openingGrades: "confirmed",
    occupancy: "pending_structured_input",
    enrollmentByYearAndGrade: "missing",
    tuitionValues: "pending_structured_input",
    discountAssumptions: "missing",
    annualTuitionAdjustmentAssumptions: "missing",
  },
};
