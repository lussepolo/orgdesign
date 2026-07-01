import type {
  TuitionSourceDataContract,
  TuitionSourceRecord,
  TuitionSourceScenarioMeta,
  TuitionSourceCourseLabel,
  TuitionSourceScenarioId,
  TuitionSourceNormalizedGrade,
  TuitionSourceNormalizedBand,
  TuitionSourceDivision,
  TuitionSourceModality,
} from "./tuitionSourceDataContract";

const TUITION_SOURCE_PATH =
  "src/features/rio-scenario-resilience/source/tuitionScenarioStructuredTranscription.py" as const;

const TUITION_SOURCE_COMMON_FIELDS = {
  currency: "BRL" as const,
  billingMonthsAssumptionFlaggedForFinanceReview: 12 as const,
  sourceEvidenceOrigin: "screenshot_transcription_based" as const,
  sourcePath: TUITION_SOURCE_PATH,
  sourceEvidenceDate: "2026-06-02" as const,
  sourceColumns: ["Curso", "Valor de Contrato Bruto", "Mensalidade"] as const,
  calculationReadinessStatus: "blocked" as const,
  needsFinanceReview: true as const,
};

type CourseDefinition = {
  sourceCourseLabel: TuitionSourceCourseLabel;
  normalizedGrade: TuitionSourceNormalizedGrade;
  normalizedBand: TuitionSourceNormalizedBand;
  division: TuitionSourceDivision;
  modality: TuitionSourceModality;
};

const SOURCE_COURSES: CourseDefinition[] = [
  { sourceCourseLabel: "TODDLERS 1 - m", normalizedGrade: "Toddler 1",   normalizedBand: "ey_toddler_m_modality", division: "Early Years",  modality: "half_day_or_m_modality" },
  { sourceCourseLabel: "TODDLERS 2 - m", normalizedGrade: "Toddler 2",   normalizedBand: "ey_toddler_m_modality", division: "Early Years",  modality: "half_day_or_m_modality" },
  { sourceCourseLabel: "TODDLERS 1",     normalizedGrade: "Toddler 1",   normalizedBand: "ey_full_day",           division: "Early Years",  modality: "full_day" },
  { sourceCourseLabel: "TODDLERS 2",     normalizedGrade: "Toddler 2",   normalizedBand: "ey_full_day",           division: "Early Years",  modality: "full_day" },
  { sourceCourseLabel: "PRE-K3",         normalizedGrade: "Pre-K3",      normalizedBand: "ey_full_day",           division: "Early Years",  modality: "full_day" },
  { sourceCourseLabel: "PRE-K4",         normalizedGrade: "Pre-K4",      normalizedBand: "ey_full_day",           division: "Early Years",  modality: "full_day" },
  { sourceCourseLabel: "KINDERGARTEN",   normalizedGrade: "Kindergarten", normalizedBand: "ey_full_day",          division: "Early Years",  modality: "full_day" },
  { sourceCourseLabel: "GRADE 1",        normalizedGrade: "Grade 1",     normalizedBand: "lower_school",          division: "Lower School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 2",        normalizedGrade: "Grade 2",     normalizedBand: "lower_school",          division: "Lower School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 3",        normalizedGrade: "Grade 3",     normalizedBand: "lower_school",          division: "Lower School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 4",        normalizedGrade: "Grade 4",     normalizedBand: "lower_school",          division: "Lower School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 5",        normalizedGrade: "Grade 5",     normalizedBand: "lower_school",          division: "Lower School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 6",        normalizedGrade: "Grade 6",     normalizedBand: "middle_school",         division: "Middle School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 7",        normalizedGrade: "Grade 7",     normalizedBand: "middle_school",         division: "Middle School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 8",        normalizedGrade: "Grade 8",     normalizedBand: "middle_school",         division: "Middle School", modality: "full_day" },
  { sourceCourseLabel: "GRADE 9",        normalizedGrade: "Grade 9",     normalizedBand: "high_school",           division: "High School",  modality: "full_day" },
  { sourceCourseLabel: "GRADE 10",       normalizedGrade: "Grade 10",    normalizedBand: "high_school",           division: "High School",  modality: "full_day" },
  { sourceCourseLabel: "GRADE 11",       normalizedGrade: "Grade 11",    normalizedBand: "high_school",           division: "High School",  modality: "full_day" },
  { sourceCourseLabel: "GRADE 12",       normalizedGrade: "Grade 12",    normalizedBand: "high_school",           division: "High School",  modality: "full_day" },
];

type CourseValues = Record<TuitionSourceCourseLabel, readonly [number, number]>;

// Values: [annualGrossContractValueBRL, monthlyTuitionBRL]
// Source: tuitionScenarioStructuredTranscription.py — screenshot_transcription_based, 2026-06-02
// No calculations added. Billing-months assumption (12) is flagged for finance review.
const BP_SCENARIO_1_VALUES: CourseValues = {
  "TODDLERS 1 - m": [53463.28,  4455.27],
  "TODDLERS 2 - m": [53463.28,  4455.27],
  "TODDLERS 1":     [91390.04,  7615.84],
  "TODDLERS 2":     [91390.04,  7615.84],
  "PRE-K3":         [91390.04,  7615.84],
  "PRE-K4":         [91390.04,  7615.84],
  "KINDERGARTEN":   [91390.04,  7615.84],
  "GRADE 1":        [111670.40, 9305.87],
  "GRADE 2":        [111670.40, 9305.87],
  "GRADE 3":        [111670.40, 9305.87],
  "GRADE 4":        [111670.40, 9305.87],
  "GRADE 5":        [111670.40, 9305.87],
  "GRADE 6":        [122419.38, 10201.61],
  "GRADE 7":        [122419.38, 10201.61],
  "GRADE 8":        [122419.38, 10201.61],
  "GRADE 9":        [141469.03, 11789.09],
  "GRADE 10":       [141469.03, 11789.09],
  "GRADE 11":       [141469.03, 11789.09],
  "GRADE 12":       [141469.03, 11789.09],
};

const BP_SCENARIO_2_VALUES: CourseValues = {
  "TODDLERS 1 - m": [59395.29,  4949.61],
  "TODDLERS 2 - m": [59395.29,  4949.61],
  "TODDLERS 1":     [101530.22, 8460.85],
  "TODDLERS 2":     [101530.22, 8460.85],
  "PRE-K3":         [101530.22, 8460.85],
  "PRE-K4":         [101530.22, 8460.85],
  "KINDERGARTEN":   [101530.22, 8460.85],
  "GRADE 1":        [101530.22, 8460.85],
  "GRADE 2":        [101530.22, 8460.85],
  "GRADE 3":        [101530.22, 8460.85],
  "GRADE 4":        [101530.22, 8460.85],
  "GRADE 5":        [101530.22, 8460.85],
  "GRADE 6":        [107859.73, 8988.31],
  "GRADE 7":        [107859.73, 8988.31],
  "GRADE 8":        [107859.73, 8988.31],
  "GRADE 9":        [113252.74, 9437.73],
  "GRADE 10":       [113252.74, 9437.73],
  "GRADE 11":       [113252.74, 9437.73],
  "GRADE 12":       [113252.74, 9437.73],
};

const BP_SCENARIO_3_VALUES: CourseValues = {
  "TODDLERS 1 - m": [63468.69,  5289.06],
  "TODDLERS 2 - m": [63468.69,  5289.06],
  "TODDLERS 1":     [108493.27, 9041.11],
  "TODDLERS 2":     [108493.27, 9041.11],
  "PRE-K3":         [108493.27, 9041.11],
  "PRE-K4":         [108493.27, 9041.11],
  "KINDERGARTEN":   [108493.27, 9041.11],
  "GRADE 1":        [108493.27, 9041.11],
  "GRADE 2":        [108493.27, 9041.11],
  "GRADE 3":        [108493.27, 9041.11],
  "GRADE 4":        [108493.27, 9041.11],
  "GRADE 5":        [108493.27, 9041.11],
  "GRADE 6":        [108493.27, 9041.11],
  "GRADE 7":        [108493.27, 9041.11],
  "GRADE 8":        [108493.27, 9041.11],
  "GRADE 9":        [119351.36, 9945.95],
  "GRADE 10":       [119351.36, 9945.95],
  "GRADE 11":       [119351.36, 9945.95],
  "GRADE 12":       [119351.36, 9945.95],
};

// Phase 15Q: Cenário 4 and Cenário 5. Source: BP v8(2) ≡ v8(3) per Luciana.
// Values are source-of-truth — do not infer, round, interpolate, or recalculate.
const BP_SCENARIO_4_VALUES: CourseValues = {
  "TODDLERS 1 - m": [61788,  5149],
  "TODDLERS 2 - m": [61788,  5149],
  "TODDLERS 1":     [105636, 8803],
  "TODDLERS 2":     [105636, 8803],
  "PRE-K3":         [105636, 8803],
  "PRE-K4":         [105636, 8803],
  "KINDERGARTEN":   [105636, 8803],
  "GRADE 1":        [127320, 10610],
  "GRADE 2":        [127320, 10610],
  "GRADE 3":        [127320, 10610],
  "GRADE 4":        [127320, 10610],
  "GRADE 5":        [127320, 10610],
  "GRADE 6":        [138816, 11568],
  "GRADE 7":        [138816, 11568],
  "GRADE 8":        [138816, 11568],
  "GRADE 9":        [159180, 13265],
  "GRADE 10":       [159180, 13265],
  "GRADE 11":       [159180, 13265],
  "GRADE 12":       [159180, 13265],
};

const BP_SCENARIO_5_VALUES: CourseValues = {
  "TODDLERS 1 - m": [64884,  5407],
  "TODDLERS 2 - m": [64884,  5407],
  "TODDLERS 1":     [110916, 9243],
  "TODDLERS 2":     [110916, 9243],
  "PRE-K3":         [110916, 9243],
  "PRE-K4":         [110916, 9243],
  "KINDERGARTEN":   [110916, 9243],
  "GRADE 1":        [133680, 11140],
  "GRADE 2":        [133680, 11140],
  "GRADE 3":        [133680, 11140],
  "GRADE 4":        [133680, 11140],
  "GRADE 5":        [133680, 11140],
  "GRADE 6":        [145752, 12146],
  "GRADE 7":        [145752, 12146],
  "GRADE 8":        [145752, 12146],
  "GRADE 9":        [167136, 13928],
  "GRADE 10":       [167136, 13928],
  "GRADE 11":       [167136, 13928],
  "GRADE 12":       [167136, 13928],
};

const TUITION_SOURCE_SCENARIO_META: Record<
  TuitionSourceScenarioId,
  TuitionSourceScenarioMeta
> = {
  bp_scenario_1: {
    scenarioId: "bp_scenario_1",
    sourceScenarioLabel: "BP Cenário 1",
    scenarioName: "Division-specific ladder",
    intakeFileInterpretation:
      "Most segmented architecture: EY m modality, EY full-day, Lower School, Middle School, High School.",
    interpretationNeedsFinanceConfirmation: true,
  },
  bp_scenario_2: {
    scenarioId: "bp_scenario_2",
    sourceScenarioLabel: "BP Cenário 2",
    scenarioName: "EY and Lower School compressed; MS and HS modest premiums",
    intakeFileInterpretation:
      "EY full-day through Grade 5 share the same price; Middle School and High School have separate modest steps.",
    interpretationNeedsFinanceConfirmation: true,
  },
  bp_scenario_3: {
    scenarioId: "bp_scenario_3",
    sourceScenarioLabel: "BP Cenário 3",
    scenarioName: "Flat EY through Middle School; HS premium only",
    intakeFileInterpretation:
      "EY full-day through Grade 8 share the same price; High School receives a separate premium. The m modality remains separate.",
    interpretationNeedsFinanceConfirmation: true,
  },
  bp_scenario_4: {
    scenarioId: "bp_scenario_4",
    sourceScenarioLabel: "BP Cenário 4",
    scenarioName: "Division-differentiated with LS/MS/HS premium steps",
    intakeFileInterpretation:
      "EY m modality, EY full-day, Lower School, Middle School, High School — explicit price steps at each division.",
    interpretationNeedsFinanceConfirmation: true,
  },
  bp_scenario_5: {
    scenarioId: "bp_scenario_5",
    sourceScenarioLabel: "BP Cenário 5",
    scenarioName: "Division-differentiated highest premium ladder",
    intakeFileInterpretation:
      "EY m modality, EY full-day, Lower School, Middle School, High School — highest price points across all divisions.",
    interpretationNeedsFinanceConfirmation: true,
  },
};

type ScenarioEntry = {
  id: TuitionSourceScenarioId;
  sourceLabel: string;
  values: CourseValues;
};

const TUITION_SOURCE_SCENARIO_ENTRIES: ScenarioEntry[] = [
  { id: "bp_scenario_1", sourceLabel: "BP Cenário 1", values: BP_SCENARIO_1_VALUES },
  { id: "bp_scenario_2", sourceLabel: "BP Cenário 2", values: BP_SCENARIO_2_VALUES },
  { id: "bp_scenario_3", sourceLabel: "BP Cenário 3", values: BP_SCENARIO_3_VALUES },
  { id: "bp_scenario_4", sourceLabel: "BP Cenário 4", values: BP_SCENARIO_4_VALUES },
  { id: "bp_scenario_5", sourceLabel: "BP Cenário 5", values: BP_SCENARIO_5_VALUES },
];

// 5 scenarios × 19 courses = 95 records
export const TUITION_SOURCE_RECORDS: TuitionSourceRecord[] =
  TUITION_SOURCE_SCENARIO_ENTRIES.flatMap(({ id, sourceLabel, values }) =>
    SOURCE_COURSES.map((course, idx): TuitionSourceRecord => {
      const [annualGrossContractValueBRL, monthlyTuitionBRL] =
        values[course.sourceCourseLabel];
      return {
        scenarioId: id,
        sourceScenarioLabel: sourceLabel,
        sourceRowOrder: idx + 1,
        ...course,
        annualGrossContractValueBRL,
        monthlyTuitionBRL,
        ...TUITION_SOURCE_COMMON_FIELDS,
      };
    })
  );

export const TUITION_SOURCE_DATA = {
  sourceEvidenceStatus: "source_populated",
  calculationReady: false,
  revenueCalculationBlocked: true,
  revenueBlockReason:
    "Gross tuition source values are captured but Receita remains blocked until enrollment mapping, discount assumptions, annual adjustment rules, and finance approval of all mappings are explicit.",
  useAnnualGrossContractValueAsPrimaryInput: true,
  useMonthlyTuitionAsDisplayOrValidationOnly: true,
  scenarioIdMappingNote:
    "Source scenario IDs (bp_scenario_1/2/3) do not yet map to the calculation-layer TuitionScenarioId values in revenueInputs.ts. Mapping must be approved before Receita calculation work begins.",
  scenarioMeta: TUITION_SOURCE_SCENARIO_META,
  records: TUITION_SOURCE_RECORDS,
  notes:
    "Screenshot-transcription-based intake from tuitionScenarioStructuredTranscription.py (2026-06-02). Values preserved as clean floats. Billing-months assumption of 12 is from the intake file and is flagged for finance review. Scenario interpretations are from the intake file and are not finance-approved. Derived comparisons and monthly-check fields from the intake file were excluded from this source layer.",
} satisfies TuitionSourceDataContract;
