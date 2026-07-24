import type {
  AvailableCapacityByYearRecord,
  CapacityByYearAndGradeRecord,
  EnrollmentByYearAndGradeRecord,
  OpeningPackageDirectWorkbookYear,
  OpeningPackageGradeId,
  OpeningPackageId,
  OccupancyScenarioId,
  SourceGradeLabel,
  StudentsPerClassRecord,
  TotalEnrollmentValidationRecord,
} from "./openingPackageOccupancySourceDataContract";

export const V10_E1_GOVERNANCE_DATE = "2026-07-24" as const;

export const GOVERNED_G6_CAPTACAO_WORKBOOK = {
  path: "/Users/lucianapolonen/Downloads/Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx",
  sha256: "17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729",
  enrollmentAuthority:
    "T1-G6 Conservador/Base/Otimista grade-level captação projections and capacity, 2028-2037.",
} as const;

export const GOVERNED_G4_CAPTACAO_WORKBOOK = {
  path: "/Users/lucianapolonen/Downloads/Modelo_Ocupacao_Concept_2028_4sc_T1_G4.xlsx",
  sha256: "73b10ea70cd0ebdc5f43757e621ecd6343a45fbcce4447d1fe1b1e0f8164ae95",
  enrollmentAuthority:
    "T1-G4 Conservador/Base/Otimista grade-level captação projections and capacity, 2028-2037.",
} as const;

export const GOVERNED_V10_CAPACITY_WORKBOOK = {
  path: "/Users/lucianapolonen/Downloads/Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  t1g4CapacityEvidence:
    "Receita - Cen. 1 (4)!DN23:DW23 is a 2027-2036 V10 series; DN23=300 is under the 2027 header and is not used as T1-G4 2028 capacity in V10-E1.",
  t1g6CapacityEvidence:
    "V10 contains 746-seat later-year capacity evidence; V10-E1 keeps captação-workbook capacity at 740 pending explicit 740/746 reconciliation.",
} as const;

export const GOVERNED_DIRECT_YEARS = [
  2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037,
] as const satisfies readonly OpeningPackageDirectWorkbookYear[];

export const GOVERNED_CAPTACAO_SCENARIO_IDS = [
  "conservador",
  "base",
  "otimista",
] as const satisfies readonly OccupancyScenarioId[];

export const GOVERNED_CAPTACAO_SCENARIO_LABELS: Readonly<Record<OccupancyScenarioId, string>> = {
  conservador: "Conservador",
  base: "Base",
  otimista: "Otimista",
};

const DIRECT_SOURCE_METADATA = {
  sourceStatus: "finance_validated",
  mappingStatus: "ready_for_normalization",
  isCarryForwardYear: false,
  carryForwardSource: "not_selected",
  carryForwardApprovalStatus: "requires_business_rule_approval",
  blockingReason: "none",
} as const;

const DIRECT_CAPACITY_METADATA = {
  sourceStatus: "finance_validated",
  mappingStatus: "ready_for_normalization",
  isCarryForwardYear: false,
  carryForwardSource: "not_selected",
  blockingReason: "none",
  physicalCapacityCap: 740,
} as const;

const GRADE_LABELS = [
  ["Toddlers 1", "T1"],
  ["Toddlers 2", "T2"],
  ["Pre-K3", "PK3"],
  ["Pre-K4", "PK4"],
  ["Kindergarten", "Kindergarten"],
  ["Grade 1", "G1"],
  ["Grade 2", "G2"],
  ["Grade 3", "G3"],
  ["Grade 4", "G4"],
  ["Grade 5", "G5"],
  ["Grade 6", "G6"],
  ["Grade 7", "G7"],
  ["Grade 8", "G8"],
  ["Grade 9", "G9"],
  ["Grade 10", "G10"],
  ["Grade 11", "G11"],
  ["Grade 12", "G12"],
] as const satisfies readonly (readonly [SourceGradeLabel, OpeningPackageGradeId])[];

type GovernedCapacityGradeId = (typeof GRADE_LABELS)[number][1];

const STUDENTS_PER_CLASS_BY_GRADE: Readonly<Record<GovernedCapacityGradeId, number>> = {
  T1: 14,
  T2: 14,
  PK3: 18,
  PK4: 18,
  Kindergarten: 20,
  G1: 22,
  G2: 22,
  G3: 22,
  G4: 24,
  G5: 24,
  G6: 25,
  G7: 25,
  G8: 25,
  G9: 25,
  G10: 25,
  G11: 25,
  G12: 25,
};

const GRADE_CAPACITY_BY_GRADE: Readonly<Record<GovernedCapacityGradeId, number>> = {
  T1: 28,
  T2: 28,
  PK3: 36,
  PK4: 36,
  Kindergarten: 40,
  G1: 44,
  G2: 44,
  G3: 44,
  G4: 48,
  G5: 48,
  G6: 50,
  G7: 50,
  G8: 50,
  G9: 50,
  G10: 50,
  G11: 50,
  G12: 50,
};

export const GOVERNED_STUDENTS_PER_CLASS: readonly StudentsPerClassRecord[] =
  GRADE_LABELS.map(([sourceGradeLabel, normalizedGradeId]) => ({
    sourceGradeLabel,
    normalizedGradeId,
    studentsPerClass: STUDENTS_PER_CLASS_BY_GRADE[normalizedGradeId],
    sourceStatus: "finance_validated",
    mappingStatus: "ready_for_normalization",
    notes:
      "V10 workbook capacity evidence, max students per classroom from revenue/capacity scenario sections.",
  }));

const T1_G4_CAPACITY_SERIES = [
  348, 396, 446, 496, 546, 596, 646, 696, 740, 740,
] as const;

const T1_G6_CAPACITY_SERIES = [
  446, 496, 546, 596, 646, 696, 740, 740, 740, 740,
] as const;

const CAPACITY_SERIES_BY_PACKAGE = {
  t1_g4: T1_G4_CAPACITY_SERIES,
  t1_g6: T1_G6_CAPACITY_SERIES,
} as const satisfies Partial<Record<OpeningPackageId, readonly number[]>>;

export const GOVERNED_AVAILABLE_CAPACITY_BY_YEAR: readonly AvailableCapacityByYearRecord[] =
  Object.entries(CAPACITY_SERIES_BY_PACKAGE).flatMap(([packageId, series]) =>
    GOVERNED_DIRECT_YEARS.map((year, index) => ({
      packageId: packageId as OpeningPackageId,
      year,
      availableCapacity: series[index],
      ...DIRECT_CAPACITY_METADATA,
      notes:
        packageId === "t1_g4"
          ? "G4 captação workbook row 33: available capacity by year; 2028 capacity is 348."
          : "G6 captação workbook row 33: available capacity by year; maximum physical capacity is 740.",
    })),
  );

function activeGradeCapacityRecords(packageId: "t1_g4" | "t1_g6"): CapacityByYearAndGradeRecord[] {
  const series = CAPACITY_SERIES_BY_PACKAGE[packageId];
  const records: CapacityByYearAndGradeRecord[] = [];
  for (const [sourceGradeLabel, normalizedGradeId] of GRADE_LABELS) {
    for (const [index, year] of GOVERNED_DIRECT_YEARS.entries()) {
      const cumulativeCapacity = GRADE_LABELS.slice(0, GRADE_LABELS.findIndex(([, id]) => id === normalizedGradeId) + 1)
        .reduce((sum, [, gradeId]) => sum + GRADE_CAPACITY_BY_GRADE[gradeId], 0);
      const active = cumulativeCapacity <= series[index];
      records.push({
        packageId,
        year,
        sourceGradeLabel,
        normalizedGradeId,
        gradeCapacity: active ? GRADE_CAPACITY_BY_GRADE[normalizedGradeId] : null,
        studentsPerClass: active ? STUDENTS_PER_CLASS_BY_GRADE[normalizedGradeId] : null,
        sections: active ? 2 : null,
        ...DIRECT_CAPACITY_METADATA,
        notes: active
          ? "Grade capacity from direct package-specific captação workbook capacity section."
          : "Grade not active in the direct package-specific captação workbook capacity section for this year.",
      });
    }
  }
  return records;
}

export const GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS: readonly CapacityByYearAndGradeRecord[] = [
  ...activeGradeCapacityRecords("t1_g4"),
  ...activeGradeCapacityRecords("t1_g6"),
];

const G4_ENROLLMENT_BY_SCENARIO = {
  conservador: [
    [14, 16, 19, 22, 24, 26, 28, 28, 28, 28],
    [14, 16, 19, 22, 24, 26, 28, 28, 28, 28],
    [26, 28, 31, 34, 36, 36, 36, 36, 36, 36],
    [30, 32, 35, 36, 36, 36, 36, 36, 36, 36],
    [34, 36, 39, 40, 40, 40, 40, 40, 40, 40],
    [38, 40, 43, 44, 44, 44, 44, 44, 44, 44],
    [32, 37, 39, 42, 44, 44, 44, 44, 44, 44],
    [28, 31, 36, 38, 41, 43, 44, 44, 44, 44],
    [22, 27, 30, 35, 37, 40, 42, 45, 47, 48],
    [null, 23, 26, 29, 34, 36, 39, 41, 44, 46],
    [null, null, 23, 26, 28, 33, 35, 37, 40, 42],
    [null, null, null, 23, 25, 27, 32, 34, 36, 39],
    [null, null, null, null, 24, 26, 28, 31, 33, 35],
    [null, null, null, null, null, 24, 26, 28, 30, 32],
    [null, null, null, null, null, null, 24, 26, 27, 29],
    [null, null, null, null, null, null, null, 24, 26, 27],
    [null, null, null, null, null, null, null, null, 24, 26],
  ],
  base: [
    [16, 19, 22, 25, 28, 28, 28, 28, 28, 28],
    [16, 19, 22, 25, 28, 28, 28, 28, 28, 28],
    [28, 31, 34, 36, 36, 36, 36, 36, 36, 36],
    [32, 35, 36, 36, 36, 36, 36, 36, 36, 36],
    [36, 39, 40, 40, 40, 40, 40, 40, 40, 40],
    [40, 43, 44, 44, 44, 44, 44, 44, 44, 44],
    [36, 39, 42, 44, 44, 44, 44, 44, 44, 44],
    [32, 35, 38, 41, 44, 44, 44, 44, 44, 44],
    [22, 31, 34, 37, 40, 43, 46, 48, 48, 48],
    [null, 23, 30, 33, 36, 39, 42, 45, 48, 48],
    [null, null, 23, 29, 32, 35, 38, 41, 44, 47],
    [null, null, null, 24, 28, 31, 34, 37, 40, 42],
    [null, null, null, null, 24, 27, 30, 33, 36, 38],
    [null, null, null, null, null, 25, 27, 30, 32, 35],
    [null, null, null, null, null, null, 25, 27, 29, 31],
    [null, null, null, null, null, null, null, 25, 27, 29],
    [null, null, null, null, null, null, null, null, 26, 28],
  ],
  otimista: [
    [22, 26, 28, 28, 28, 28, 28, 28, 28, 28],
    [22, 26, 28, 28, 28, 28, 28, 28, 28, 28],
    [32, 36, 36, 36, 36, 36, 36, 36, 36, 36],
    [36, 36, 36, 36, 36, 36, 36, 36, 36, 36],
    [40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    [44, 44, 44, 44, 44, 44, 44, 44, 44, 44],
    [40, 44, 44, 44, 44, 44, 44, 44, 44, 44],
    [36, 40, 44, 44, 44, 44, 44, 44, 44, 44],
    [28, 35, 39, 43, 47, 48, 48, 48, 48, 48],
    [null, 29, 34, 38, 42, 46, 48, 48, 48, 48],
    [null, null, 30, 33, 37, 41, 44, 47, 50, 50],
    [null, null, null, 30, 33, 36, 39, 43, 46, 49],
    [null, null, null, null, 31, 34, 37, 40, 43, 46],
    [null, null, null, null, null, 32, 35, 38, 41, 44],
    [null, null, null, null, null, null, 32, 34, 37, 39],
    [null, null, null, null, null, null, null, 32, 34, 37],
    [null, null, null, null, null, null, null, null, 32, 35],
  ],
} as const satisfies Record<OccupancyScenarioId, readonly (readonly (number | null)[])[]>;

const G6_ENROLLMENT_BY_SCENARIO = {
  conservador: [
    [14, 16, 19, 22, 24, 26, 28, 28, 28, 28],
    [14, 16, 19, 22, 24, 26, 28, 28, 28, 28],
    [22, 24, 27, 30, 32, 34, 36, 36, 36, 36],
    [26, 28, 31, 34, 36, 36, 36, 36, 36, 36],
    [28, 30, 33, 36, 38, 40, 40, 40, 40, 40],
    [32, 34, 37, 40, 42, 44, 44, 44, 44, 44],
    [26, 31, 34, 36, 39, 41, 44, 44, 44, 44],
    [24, 26, 30, 33, 35, 38, 40, 43, 44, 44],
    [20, 23, 26, 29, 32, 34, 37, 39, 42, 44],
    [16, 19, 23, 25, 28, 31, 33, 36, 38, 41],
    [16, 18, 20, 22, 24, 27, 30, 32, 35, 37],
    [null, 17, 19, 21, 23, 25, 27, 29, 31, 34],
    [null, null, 17, 19, 21, 23, 25, 27, 29, 31],
    [null, null, null, 18, 20, 22, 24, 26, 28, 30],
    [null, null, null, null, 18, 20, 21, 23, 25, 27],
    [null, null, null, null, null, 18, 20, 22, 23, 25],
    [null, null, null, null, null, null, 18, 20, 22, 24],
  ],
  base: [
    [16, 19, 22, 25, 28, 28, 28, 28, 28, 28],
    [16, 19, 22, 25, 28, 28, 28, 28, 28, 28],
    [24, 27, 30, 33, 36, 36, 36, 36, 36, 36],
    [28, 31, 34, 36, 36, 36, 36, 36, 36, 36],
    [30, 33, 36, 39, 40, 40, 40, 40, 40, 40],
    [34, 37, 40, 43, 44, 44, 44, 44, 44, 44],
    [28, 33, 36, 39, 42, 44, 44, 44, 44, 44],
    [26, 29, 32, 35, 38, 41, 44, 44, 44, 44],
    [22, 25, 28, 31, 34, 37, 40, 43, 46, 48],
    [18, 21, 24, 27, 30, 33, 36, 39, 42, 45],
    [16, 18, 21, 24, 27, 30, 32, 35, 38, 41],
    [null, 17, 19, 22, 24, 26, 29, 31, 34, 37],
    [null, null, 17, 20, 22, 25, 27, 29, 32, 34],
    [null, null, null, 18, 20, 23, 25, 28, 30, 32],
    [null, null, null, null, 19, 21, 23, 25, 27, 29],
    [null, null, null, null, null, 19, 21, 23, 25, 27],
    [null, null, null, null, null, null, 19, 21, 23, 25],
  ],
  otimista: [
    [20, 24, 28, 28, 28, 28, 28, 28, 28, 28],
    [20, 24, 28, 28, 28, 28, 28, 28, 28, 28],
    [28, 32, 36, 36, 36, 36, 36, 36, 36, 36],
    [32, 36, 36, 36, 36, 36, 36, 36, 36, 36],
    [36, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    [40, 44, 44, 44, 44, 44, 44, 44, 44, 44],
    [32, 39, 43, 44, 44, 44, 44, 44, 44, 44],
    [28, 32, 38, 42, 44, 44, 44, 44, 44, 44],
    [24, 28, 32, 37, 41, 45, 48, 48, 48, 48],
    [20, 24, 28, 32, 36, 40, 44, 48, 48, 48],
    [20, 23, 26, 29, 32, 35, 39, 43, 47, 50],
    [null, 21, 24, 27, 30, 33, 36, 39, 42, 45],
    [null, null, 22, 25, 28, 31, 34, 37, 40, 43],
    [null, null, null, 23, 26, 29, 32, 35, 38, 41],
    [null, null, null, null, 23, 26, 28, 31, 34, 36],
    [null, null, null, null, null, 24, 26, 28, 31, 33],
    [null, null, null, null, null, null, 24, 27, 29, 31],
  ],
} as const satisfies Record<OccupancyScenarioId, readonly (readonly (number | null)[])[]>;

const ENROLLMENT_BY_PACKAGE_AND_SCENARIO = {
  t1_g4: G4_ENROLLMENT_BY_SCENARIO,
  t1_g6: G6_ENROLLMENT_BY_SCENARIO,
} as const satisfies Partial<
  Record<OpeningPackageId, Record<OccupancyScenarioId, readonly (readonly (number | null)[])[]>>
>;

function buildEnrollmentRecords(
  packageId: "t1_g4" | "t1_g6",
  scenarioMap: Record<OccupancyScenarioId, readonly (readonly (number | null)[])[]>,
): EnrollmentByYearAndGradeRecord[] {
  return Object.entries(scenarioMap).flatMap(([scenarioId, gradeRows]) =>
    gradeRows.flatMap((values, gradeIndex) => {
      const [sourceGradeLabel, normalizedGradeId] = GRADE_LABELS[gradeIndex];
      return values.map((enrollment, yearIndex) => ({
        packageId,
        scenarioId: scenarioId as OccupancyScenarioId,
        year: GOVERNED_DIRECT_YEARS[yearIndex],
        sourceGradeLabel,
        normalizedGradeId,
        enrollment,
        ...DIRECT_SOURCE_METADATA,
        notes:
          scenarioId === "base"
            ? `${packageId === "t1_g4" ? "G4" : "G6"} captação workbook sheet 4. INTERMEDIÁRIO; governed as Base by 24 July 2026 product-owner decision.`
            : `${packageId === "t1_g4" ? "G4" : "G6"} captação workbook active scenario ${GOVERNED_CAPTACAO_SCENARIO_LABELS[scenarioId as OccupancyScenarioId]}.`,
      }));
    }),
  );
}

export const GOVERNED_T1_G4_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS: readonly EnrollmentByYearAndGradeRecord[] =
  buildEnrollmentRecords("t1_g4", G4_ENROLLMENT_BY_SCENARIO);

export const GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS: readonly EnrollmentByYearAndGradeRecord[] =
  buildEnrollmentRecords("t1_g6", G6_ENROLLMENT_BY_SCENARIO);

export const GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS: readonly EnrollmentByYearAndGradeRecord[] = [
  ...GOVERNED_T1_G4_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  ...GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
];

function buildTotalEnrollmentValidation(packageId: "t1_g4" | "t1_g6"): TotalEnrollmentValidationRecord[] {
  return GOVERNED_CAPTACAO_SCENARIO_IDS.flatMap((scenarioId) =>
    GOVERNED_DIRECT_YEARS.map((year) => {
      const totalEnrollment = GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS
        .filter((record) => record.packageId === packageId && record.scenarioId === scenarioId && record.year === year)
        .reduce((sum, record) => sum + (record.enrollment ?? 0), 0);
      return {
        packageId,
        scenarioId,
        year,
        totalEnrollment,
        ...DIRECT_SOURCE_METADATA,
        notes:
          scenarioId === "base"
            ? "Annual total equals former Intermediário workbook projection."
            : `Annual total equals active ${packageId === "t1_g4" ? "G4" : "G6"} captação workbook projection.`,
      };
    }),
  );
}

export const GOVERNED_T1_G4_TOTAL_ENROLLMENT_VALIDATION: readonly TotalEnrollmentValidationRecord[] =
  buildTotalEnrollmentValidation("t1_g4");

export const GOVERNED_T1_G6_TOTAL_ENROLLMENT_VALIDATION: readonly TotalEnrollmentValidationRecord[] =
  buildTotalEnrollmentValidation("t1_g6");

export const GOVERNED_TOTAL_ENROLLMENT_VALIDATION: readonly TotalEnrollmentValidationRecord[] = [
  ...GOVERNED_T1_G4_TOTAL_ENROLLMENT_VALIDATION,
  ...GOVERNED_T1_G6_TOTAL_ENROLLMENT_VALIDATION,
];

export function hasGovernedEnrollment(
  packageId: OpeningPackageId,
  scenarioId: OccupancyScenarioId,
): boolean {
  return Boolean(ENROLLMENT_BY_PACKAGE_AND_SCENARIO[packageId]?.[scenarioId]);
}

export function hasGovernedCapacity(packageId: OpeningPackageId): boolean {
  return packageId === "t1_g4" || packageId === "t1_g6";
}

export function getGovernedAvailableCapacity(
  packageId: OpeningPackageId,
  year: OpeningPackageDirectWorkbookYear,
): number | null {
  return GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.find(
    (record) => record.packageId === packageId && record.year === year,
  )?.availableCapacity ?? null;
}

export function getGovernedOccupancy(
  packageId: OpeningPackageId,
  scenarioId: OccupancyScenarioId,
  year: OpeningPackageDirectWorkbookYear,
): number | null {
  if (!hasGovernedEnrollment(packageId, scenarioId)) return null;
  const capacity = getGovernedAvailableCapacity(packageId, year);
  if (capacity === null) return null;
  const enrollment = GOVERNED_TOTAL_ENROLLMENT_VALIDATION.find(
    (record) => record.packageId === packageId && record.scenarioId === scenarioId && record.year === year,
  )?.totalEnrollment ?? null;
  return enrollment === null ? null : enrollment / capacity;
}
