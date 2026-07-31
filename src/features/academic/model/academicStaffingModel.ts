import type { TranslationKey } from "../../../i18n/localeContract";

export type AcademicCapacityEntry = {
  gradeKey: TranslationKey;
  ageKey?: TranslationKey;
  ratio: string;
  max: number;
};

// Shared academic reference data. UI sections and validators consume the same
// contract so capacity checks cannot drift from what the tabs render.
export const EARLY_YEARS_DATA: readonly AcademicCapacityEntry[] = [
  { gradeKey: "earlyYearsGradeToddlers1", ageKey: "earlyYearsAgeToddlers1", ratio: "1:4.7", max: 28 },
  { gradeKey: "earlyYearsGradeToddlers2", ageKey: "earlyYearsAgeToddlers2", ratio: "1:5", max: 28 },
  { gradeKey: "earlyYearsGradePreK3", ageKey: "earlyYearsAgePreK3", ratio: "1:6", max: 36 },
  { gradeKey: "earlyYearsGradePreK4", ageKey: "earlyYearsAgePreK4", ratio: "1:6", max: 36 },
  { gradeKey: "earlyYearsGradeKinder", ageKey: "earlyYearsAgeKinder", ratio: "1:6.7", max: 40 },
];

export const LOWER_SCHOOL_DATA: readonly AcademicCapacityEntry[] = [
  { gradeKey: "lowerSchoolGrade1", ratio: "1:11", max: 44 },
  { gradeKey: "lowerSchoolGrade2", ratio: "1:11", max: 44 },
  { gradeKey: "lowerSchoolGrade3", ratio: "1:11", max: 44 },
  { gradeKey: "lowerSchoolGrade4", ratio: "1:11", max: 48 },
  { gradeKey: "lowerSchoolGrade5", ratio: "1:11", max: 48 },
];
