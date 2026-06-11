import {
  COMBINED_ACTIVE_GRADE_RECORDS,
  COMBINED_ENROLLMENT_RECORDS,
} from "./matureStateCarryForwardSourceData";
import {
  OPENING_PACKAGE_STUDENTS_PER_CLASS,
} from "./openingPackageOccupancySourceData";
import type {
  SectionCountDiagnostic,
  SectionCountEngineInput,
  SectionCountEngineOutput,
  SectionCountRecord,
} from "./sectionCountEngineContract";
import { GRADE_DIVISION_MAP } from "./revenueInputs";

const MAX_SECTIONS = 2 as const;

export function calculateSectionCountsForScenario(
  input: SectionCountEngineInput,
): SectionCountEngineOutput {
  const { openingPackageId, occupancyScenarioId } = input;

  const records: SectionCountRecord[] = [];
  const diagnostics: SectionCountDiagnostic[] = [];

  // Build active-grade lookup: "year:normalizedGradeId" → activeStatus
  const activeGradeLookup = new Map<
    string,
    "active" | "inactive" | "not_applicable"
  >();
  for (const r of COMBINED_ACTIVE_GRADE_RECORDS) {
    if (r.packageId !== openingPackageId || r.isCarryForwardYear) continue;
    activeGradeLookup.set(`${r.year}:${r.normalizedGradeId}`, r.activeStatus);
  }

  // Build studentsPerClass lookup: lowercase gradeId → studentsPerClass
  const spcLookup = new Map<string, number>();
  for (const r of OPENING_PACKAGE_STUDENTS_PER_CLASS) {
    spcLookup.set(String(r.normalizedGradeId).toLowerCase(), r.studentsPerClass);
  }

  for (const r of COMBINED_ENROLLMENT_RECORDS) {
    if (r.packageId !== openingPackageId) continue;
    if (r.scenarioId !== occupancyScenarioId) continue;
    if (r.isCarryForwardYear) continue;

    const gradeId = String(r.normalizedGradeId).toLowerCase();
    const division = GRADE_DIVISION_MAP[gradeId as keyof typeof GRADE_DIVISION_MAP];

    // Engine applies to EY/LS only; skip MS/HS without emitting diagnostics
    if (!division || (division !== "ey" && division !== "ls")) continue;

    const activeStatus = activeGradeLookup.get(
      `${r.year}:${r.normalizedGradeId}`,
    );
    const activeGrade = activeStatus === "active";
    const spc = spcLookup.get(gradeId);

    // Inactive grade: 0 sections; enrollment check is not required
    if (!activeGrade) {
      records.push({
        status: "ok",
        openingPackageId,
        occupancyScenarioId,
        year: r.year,
        gradeId,
        division,
        activeGrade: false,
        enrollment: 0,
        studentsPerClass: spc ?? 0,
        rawSections: 0,
        sectionCount: 0,
        maxSectionsPerGrade: MAX_SECTIONS,
        sectionOverflow: false,
        formulaBasis: "inactive_grade",
        capacityConstraintSource: "OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS",
        sourceNotes:
          "Grade inactive per OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS; sectionCount = 0.",
      });
      continue;
    }

    // Active grade with null enrollment: emit diagnostic — do not silently compute
    if (r.enrollment === null) {
      diagnostics.push({
        status: "diagnostic_missing_enrollment",
        openingPackageId,
        occupancyScenarioId,
        year: r.year,
        gradeId,
        reason:
          `Active grade ${gradeId} year ${r.year}: enrollment is null; cannot compute sections.`,
      });
      continue;
    }

    // Active grade with zero enrollment: 0 sections
    if (r.enrollment <= 0) {
      records.push({
        status: "ok",
        openingPackageId,
        occupancyScenarioId,
        year: r.year,
        gradeId,
        division,
        activeGrade: true,
        enrollment: 0,
        studentsPerClass: spc ?? 0,
        rawSections: 0,
        sectionCount: 0,
        maxSectionsPerGrade: MAX_SECTIONS,
        sectionOverflow: false,
        formulaBasis: "zero_enrollment",
        capacityConstraintSource:
          "OPENING_PACKAGE_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS",
        sourceNotes: "Enrollment is zero; sectionCount = 0.",
      });
      continue;
    }

    // studentsPerClass missing for a section-based grade: emit diagnostic
    if (spc === undefined) {
      diagnostics.push({
        status: "diagnostic_missing_studentsPerClass",
        openingPackageId,
        occupancyScenarioId,
        year: r.year,
        gradeId,
        reason:
          `No studentsPerClass record for grade ${gradeId}; cannot compute sections.`,
      });
      continue;
    }

    const rawSections = Math.ceil(r.enrollment / spc);
    const sectionCount = Math.min(rawSections, MAX_SECTIONS);
    const sectionOverflow = rawSections > MAX_SECTIONS;

    records.push({
      status: "ok",
      openingPackageId,
      occupancyScenarioId,
      year: r.year,
      gradeId,
      division,
      activeGrade: true,
      enrollment: r.enrollment,
      studentsPerClass: spc,
      rawSections,
      sectionCount,
      maxSectionsPerGrade: MAX_SECTIONS,
      sectionOverflow,
      formulaBasis: "ceil_enrollment_div_studentsPerClass_capped_at_2",
      capacityConstraintSource:
        "OPENING_PACKAGE_STUDENTS_PER_CLASS; maxSectionsPerGrade = 2 (workbook cap)",
      sourceNotes:
        `rawSections = ceil(${r.enrollment}/${spc}) = ${rawSections}; ` +
        `sectionCount = min(${rawSections}, 2) = ${sectionCount}; ` +
        (sectionOverflow ? "OVERFLOW: rawSections > 2." : "no overflow."),
    });
  }

  return { openingPackageId, occupancyScenarioId, records, diagnostics };
}
