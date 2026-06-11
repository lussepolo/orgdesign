export type TuitionSourceScenarioId =
  | "bp_scenario_1"
  | "bp_scenario_2"
  | "bp_scenario_3";

export type TuitionSourceCourseLabel =
  | "TODDLERS 1 - m"
  | "TODDLERS 2 - m"
  | "TODDLERS 1"
  | "TODDLERS 2"
  | "PRE-K3"
  | "PRE-K4"
  | "KINDERGARTEN"
  | "GRADE 1"
  | "GRADE 2"
  | "GRADE 3"
  | "GRADE 4"
  | "GRADE 5"
  | "GRADE 6"
  | "GRADE 7"
  | "GRADE 8"
  | "GRADE 9"
  | "GRADE 10"
  | "GRADE 11"
  | "GRADE 12";

export type TuitionSourceNormalizedGrade =
  | "Toddler 1"
  | "Toddler 2"
  | "Pre-K3"
  | "Pre-K4"
  | "Kindergarten"
  | "Grade 1"
  | "Grade 2"
  | "Grade 3"
  | "Grade 4"
  | "Grade 5"
  | "Grade 6"
  | "Grade 7"
  | "Grade 8"
  | "Grade 9"
  | "Grade 10"
  | "Grade 11"
  | "Grade 12";

export type TuitionSourceNormalizedBand =
  | "ey_toddler_m_modality"
  | "ey_full_day"
  | "lower_school"
  | "middle_school"
  | "high_school";

export type TuitionSourceDivision =
  | "Early Years"
  | "Lower School"
  | "Middle School"
  | "High School";

export type TuitionSourceModality = "full_day" | "half_day_or_m_modality";

export type TuitionSourcePath =
  "src/features/rio-scenario-resilience/source/tuitionScenarioStructuredTranscription.py";

export type TuitionSourceEvidenceOrigin = "screenshot_transcription_based";

export type TuitionSourceLineReadiness = "blocked";

export interface TuitionSourceScenarioMeta {
  scenarioId: TuitionSourceScenarioId;
  sourceScenarioLabel: string;
  scenarioName: string;
  intakeFileInterpretation: string;
  interpretationNeedsFinanceConfirmation: true;
}

export interface TuitionSourceRecord {
  scenarioId: TuitionSourceScenarioId;
  sourceScenarioLabel: string;
  sourceRowOrder: number;
  sourceCourseLabel: TuitionSourceCourseLabel;
  normalizedGrade: TuitionSourceNormalizedGrade;
  normalizedBand: TuitionSourceNormalizedBand;
  division: TuitionSourceDivision;
  modality: TuitionSourceModality;
  currency: "BRL";
  annualGrossContractValueBRL: number;
  monthlyTuitionBRL: number;
  billingMonthsAssumptionFlaggedForFinanceReview: 12;
  sourceEvidenceOrigin: TuitionSourceEvidenceOrigin;
  sourcePath: TuitionSourcePath;
  sourceEvidenceDate: "2026-06-02";
  sourceColumns: readonly string[];
  calculationReadinessStatus: TuitionSourceLineReadiness;
  needsFinanceReview: true;
}

export interface TuitionSourceDataContract {
  sourceEvidenceStatus: "source_populated";
  calculationReady: false;
  revenueCalculationBlocked: true;
  revenueBlockReason: string;
  useAnnualGrossContractValueAsPrimaryInput: true;
  useMonthlyTuitionAsDisplayOrValidationOnly: true;
  scenarioIdMappingNote: string;
  scenarioMeta: Record<TuitionSourceScenarioId, TuitionSourceScenarioMeta>;
  records: TuitionSourceRecord[];
  notes?: string;
}
