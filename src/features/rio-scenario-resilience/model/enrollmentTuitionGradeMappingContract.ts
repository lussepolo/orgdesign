import type { GradeId } from "./revenueInputs";
import type { SourceGradeLabel } from "./openingPackageOccupancySourceDataContract";
import type {
  TuitionSourceCourseLabel,
  TuitionSourceNormalizedGrade,
  TuitionSourceNormalizedBand,
  TuitionSourceDivision,
  TuitionSourceModality,
} from "./tuitionSourceDataContract";

// Crosswalk between enrollment GradeId keys and tuition source course labels.
// Auditable, reusable, and testable before any Receita formula is implemented.
// No BRL values. No calculation logic. Mapping only.
export type EnrollmentTuitionMappingStatus = "mapped" | "needs_review" | "blocked";

// Toddler grades (T1, T2) have two active modalities with distinct source prices.
// The blend is based on a Finance-confirmed learner modality split, not a price discount.
// v1: shared mix applies uniformly across all scenarios, years, and opening packages.
export type ToddlerModalityBlendBasis =
  "weighted_blend_of_source_annualGrossContractValueBRL";

export interface ToddlerModalityMixAssumption {
  fullTimeCourseLabel: TuitionSourceCourseLabel;
  halfPeriodMorningCourseLabel: TuitionSourceCourseLabel;
  fullTimeLearnerShare: number;
  halfPeriodMorningLearnerShare: number;
  blendedCalculationBasis: ToddlerModalityBlendBasis;
  // Observed from source records across all 3 scenarios. Validation note only.
  // Not used as the primary calculation basis — source records are used directly.
  observedHalfPeriodMorningPriceRatioToFullTime: number;
  observedRatioIsValidationNoteOnly: true;
  halfPeriodMorningPricingSource: "independent_source_record_not_derived_from_full_time";
  assumptionStatus: "confirmed";
  assumptionSource: string;
}

export type EnrollmentTuitionMappingLayerReadiness =
  | "fully_represented"
  | "partially_represented"
  | "blocked";

export interface EnrollmentTuitionGradeMappingRecord {
  enrollmentGradeId: GradeId;
  enrollmentGradeLabel: SourceGradeLabel;
  tuitionSourceCourseLabel: TuitionSourceCourseLabel | null;
  tuitionNormalizedGrade: TuitionSourceNormalizedGrade | null;
  tuitionNormalizedBand: TuitionSourceNormalizedBand | null;
  tuitionDivision: TuitionSourceDivision | null;
  tuitionModality: TuitionSourceModality | null;
  mappingStatus: EnrollmentTuitionMappingStatus;
  needsFinanceReview: boolean;
  sourceNotes: string;
  calculationReady: boolean;
  // Present only for T1 and T2. Null for all other grades.
  toddlerModalityMix?: ToddlerModalityMixAssumption;
}

export interface EnrollmentTuitionGradeMappingLayerContract {
  layerReadiness: EnrollmentTuitionMappingLayerReadiness;
  receitaCalculationReady: false;
  receitaBlockerReason: string;
  mappedCount: number;
  needsReviewCount: number;
  blockedCount: number;
  // Record<GradeId, ...> forces all 17 GradeIds to be present at compile time.
  records: Record<GradeId, EnrollmentTuitionGradeMappingRecord>;
  notes?: string;
}
