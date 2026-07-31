import {
  COMBINED_ACTIVE_GRADE_RECORDS,
  COMBINED_ENROLLMENT_RECORDS,
} from "./matureStateCarryForwardSourceData";
import { GOVERNED_STUDENTS_PER_CLASS } from "./governedCaptacaoCapacitySourceData";
import { assertSupportedDreEnrollmentCapacityLeverInput } from "./dreEnrollmentCapacityLeverContract";
import type {
  OpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageGradeId,
  OpeningPackageProjectionYear,
} from "./openingPackageOccupancySourceDataContract";
import { RECEITA_PROJECTION_YEARS } from "./receitaEngineContract";
import { deriveSectionCountFromEnrollment } from "./sectionCountEngine";
import { GRADE_DIVISION_MAP, type DivisionId, type GradeId } from "./revenueInputs";

const DUAL_TRACK_TODDLER_GRADE_IDS = new Set<OpeningPackageGradeId>(["T1", "T2"]);

export type DreTurmaFormulaBasis =
  | "inactive_grade"
  | "dual_track_toddler_constant"
  | "ceil_enrollment_div_studentsPerClass_capped_at_2"
  | "zero_enrollment"
  | "missing_enrollment"
  | "missing_studentsPerClass";

export interface DreTurmaDriverRecord {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly year: OpeningPackageProjectionYear;
  readonly sourceGradeId: OpeningPackageGradeId;
  readonly gradeId: GradeId;
  readonly division: DivisionId;
  readonly activeGrade: boolean;
  readonly enrollment: number | null;
  readonly studentsPerClass: number | null;
  readonly sectionCount: number;
  readonly formulaBasis: DreTurmaFormulaBasis;
}

export interface DreTurmaDriverYearTotal {
  readonly year: OpeningPackageProjectionYear;
  readonly numeroDeTurmas: number;
}

export interface DreTurmaDriverDiagnostic {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly year: OpeningPackageProjectionYear;
  readonly gradeId: string;
  readonly reason: string;
}

export interface DreTurmaDriverOutput {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly records: readonly DreTurmaDriverRecord[];
  readonly yearTotals: readonly DreTurmaDriverYearTotal[];
  readonly diagnostics: readonly DreTurmaDriverDiagnostic[];
}

function toGradeId(gradeId: OpeningPackageGradeId): GradeId {
  const normalized = String(gradeId).toLowerCase();
  if (normalized === "kindergarten") return "kindergarten";
  return normalized as GradeId;
}

export function calculateDreTurmaDriver(input: {
  readonly openingPackageId: OpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
}): DreTurmaDriverOutput {
  const { openingPackageId, occupancyScenarioId } = input;
  assertSupportedDreEnrollmentCapacityLeverInput({ openingPackageId, occupancyScenarioId });

  const studentsPerClassByGrade = new Map<OpeningPackageGradeId, number>();
  for (const record of GOVERNED_STUDENTS_PER_CLASS) {
    studentsPerClassByGrade.set(record.normalizedGradeId, record.studentsPerClass);
  }

  const enrollmentByYearAndGrade = new Map<string, number | null>();
  for (const record of COMBINED_ENROLLMENT_RECORDS) {
    if (record.packageId !== openingPackageId) continue;
    if (record.scenarioId !== occupancyScenarioId) continue;
    enrollmentByYearAndGrade.set(`${record.year}:${record.normalizedGradeId}`, record.enrollment);
  }

  const records: DreTurmaDriverRecord[] = [];
  const diagnostics: DreTurmaDriverDiagnostic[] = [];

  for (const activeRecord of COMBINED_ACTIVE_GRADE_RECORDS) {
    if (activeRecord.packageId !== openingPackageId) continue;
    if (!RECEITA_PROJECTION_YEARS.includes(activeRecord.year)) continue;

    const sourceGradeId = activeRecord.normalizedGradeId;
    const gradeId = toGradeId(sourceGradeId);
    const division = GRADE_DIVISION_MAP[gradeId];
    const activeGrade = activeRecord.activeStatus === "active";
    const enrollment = enrollmentByYearAndGrade.get(`${activeRecord.year}:${sourceGradeId}`) ?? null;
    const studentsPerClass = studentsPerClassByGrade.get(sourceGradeId) ?? null;

    let sectionCount = 0;
    let formulaBasis: DreTurmaFormulaBasis = "inactive_grade";

    if (!activeGrade) {
      formulaBasis = "inactive_grade";
    } else if (DUAL_TRACK_TODDLER_GRADE_IDS.has(sourceGradeId)) {
      sectionCount = 2;
      formulaBasis = "dual_track_toddler_constant";
    } else if (enrollment === null) {
      formulaBasis = "missing_enrollment";
      diagnostics.push({
        openingPackageId,
        occupancyScenarioId,
        year: activeRecord.year,
        gradeId,
        reason: `Active grade ${gradeId} year ${activeRecord.year}: enrollment is null; cannot compute DRE turmas.`,
      });
    } else if (enrollment <= 0) {
      formulaBasis = "zero_enrollment";
    } else if (studentsPerClass === null) {
      formulaBasis = "missing_studentsPerClass";
      diagnostics.push({
        openingPackageId,
        occupancyScenarioId,
        year: activeRecord.year,
        gradeId,
        reason: `No studentsPerClass record for grade ${gradeId}; cannot compute DRE turmas.`,
      });
    } else {
      sectionCount = deriveSectionCountFromEnrollment(enrollment, studentsPerClass);
      formulaBasis = "ceil_enrollment_div_studentsPerClass_capped_at_2";
    }

    records.push({
      openingPackageId,
      occupancyScenarioId,
      year: activeRecord.year,
      sourceGradeId,
      gradeId,
      division,
      activeGrade,
      enrollment: activeGrade ? enrollment : 0,
      studentsPerClass,
      sectionCount,
      formulaBasis,
    });
  }

  const yearTotals = RECEITA_PROJECTION_YEARS.map((year) => ({
    year,
    numeroDeTurmas: records
      .filter((record) => record.year === year)
      .reduce((sum, record) => sum + record.sectionCount, 0),
  }));

  return {
    openingPackageId,
    occupancyScenarioId,
    records,
    yearTotals,
    diagnostics,
  };
}
