// V10-RC2.3 Gate 4/4A — Payroll grade-detail rows for Turmas e Folha.
//
// Extracted from PayrollProjectionTab.tsx so the same row-building logic is
// importable by validators (single source, no duplicated logic between the
// component and its regression tests).
//
// EY/LS rows join TWO already-governed sources at the grade level:
//   - buildOrgDesignHcTable() — educator/assistant/monitor headcount per
//     grade (unchanged from V10-RC2.2; same engine Org Design uses).
//   - calculateSectionCountsForScenario() — the actual section-derivation
//     engine (enrollment, sectionCount) that PRODUCES the headcount above
//     (proven byte-for-byte via validate:v10-rc2-2-gate3's "section count
//     === teaching-lead headcount" check). Reusing it here (rather than a
//     second independent lookup) guarantees Alunos/Turmas/Alunos-por-turma
//     are always consistent with the educator counts shown alongside them.
//
// Grade 6 (t1_g6 only) is appended from the governed grade-level
// capacity/enrollment source data (governedCaptacaoCapacitySourceData.ts)
// — the same source DreLeverPanel already cites for T1-G6 capacity notes.
// Grade 6 NEVER goes through the EY/LS section-count/educator formula:
// sectionCountEngine.ts explicitly scopes itself to EY/LS only, and
// buildOrgDesignHcTable's own Middle School rows collapse into a single
// division-wide "Middle School Teaching Team" aggregate with no per-grade
// breakdown (see Gate 2 defect proof + Gate 5 disposition, docs/audits/
// rio-resilience/phase-v10-rc2-3-*.md) — so Grade 6's educator/assistant/
// monitor counts are represented as unknown-at-grade-level (null), never
// zero, never derived.
import {
  buildOrgDesignHcTable,
  gradeDisplayName,
  type OrgDesignHcTableRow,
} from "./orgDesignHcTableAdapter";
import { calculateSectionCountsForScenario, deriveSectionCountFromEnrollment } from "./sectionCountEngine";
import {
  GOVERNED_STUDENTS_PER_CLASS,
  GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
} from "./governedCaptacaoCapacitySourceData";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageDirectWorkbookYear,
} from "./openingPackageOccupancySourceDataContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "./dreWorkingScenarioContract";

export type PayrollGradeDetailEducatorAttribution = "grade_level_governed" | "division_level_only";

export interface PayrollGradeDetailRow {
  gradeId: string;
  gradeLabel: string;
  division: "Early Years" | "Lower School" | "Middle School";
  educatorAttribution: PayrollGradeDetailEducatorAttribution;
  // null only when educatorAttribution === "division_level_only" (unknown at
  // grade level) — never a fabricated/derived zero.
  educators: number | null;
  assistants: number | null;
  monitors: number | null;
  // false for Lower School (no monitor role exists in the governed model —
  // "—" must render, not "0") and for Grade 6 (unknown). True for Early
  // Years, where monitors is a real, always-populated governed value.
  monitorApplicable: boolean;
  totalHeadcount: number | null;
  // Governed section/enrollment values, sourced per-grade for EVERY rendered
  // row (Gate 4A) — EY/LS via calculateSectionCountsForScenario() (the same
  // engine that produces the educator counts above), Grade 6 via the
  // governed T1-G6 grade-level source data.
  sections: number | null;
  enrollment: number | null;
  // Display-only ratio: Math.round(enrollment / sections). Computed once
  // here so the UI and validators share one rounding rule instead of two.
  alunosPorTurma: number | null;
}

function computeAlunosPorTurma(enrollment: number | null, sections: number | null): number | null {
  if (enrollment === null || sections === null || sections <= 0) return null;
  return Math.round(enrollment / sections);
}

const DISPLAY_NAME_TO_SHORT_GRADE_ID: Record<string, string> = {
  "Toddlers 1": "t1",
  "Toddlers 2": "t2",
  "Pre-K3": "pk3",
  "Pre-K4": "pk4",
  Kindergarten: "kindergarten",
  "Grade 1": "g1",
  "Grade 2": "g2",
  "Grade 3": "g3",
  "Grade 4": "g4",
  "Grade 5": "g5",
};

interface EyLsBaseRow {
  gradeId: string;
  gradeLabel: string;
  division: "Early Years" | "Lower School";
  educators: number;
  assistants: number;
  monitors: number;
  totalHeadcount: number;
}

function extractEyLsBaseRows(hcRows: OrgDesignHcTableRow[]): EyLsBaseRow[] {
  const byGrade = new Map<string, EyLsBaseRow>();
  for (const row of hcRows) {
    if (row.divisionArea !== "Early Years" && row.divisionArea !== "Lower School") continue;
    // roleGroupOrHub is "EY {Grade} Team" / "LS {Grade} Team" — group key is the grade label.
    const key = `${row.divisionArea}|${row.roleGroupOrHub}`;
    const existing = byGrade.get(key) ?? {
      gradeId: row.roleGroupOrHub,
      gradeLabel: row.roleGroupOrHub.replace(/^(EY|LS)\s/, "").replace(/\sTeam$/, ""),
      division: row.divisionArea as "Early Years" | "Lower School",
      educators: 0,
      assistants: 0,
      monitors: 0,
      totalHeadcount: 0,
    };
    if (row.role.endsWith("Reference Educator")) existing.educators += row.headcountOrFte;
    else if (row.role.endsWith("Assistant")) existing.assistants += row.headcountOrFte;
    else if (row.role.endsWith("Monitor")) existing.monitors += row.headcountOrFte;
    existing.totalHeadcount += row.headcountOrFte;
    byGrade.set(key, existing);
  }
  return [...byGrade.values()];
}

function buildEyLsGradeRows(
  hcRows: OrgDesignHcTableRow[],
  openingPackageId: ActiveOpeningPackageId,
  occupancyScenarioId: OccupancyScenarioId,
  year: OpeningPackageDirectWorkbookYear,
): PayrollGradeDetailRow[] {
  const baseRows = extractEyLsBaseRows(hcRows);
  const sectionOutput = calculateSectionCountsForScenario({ openingPackageId, occupancyScenarioId });
  const sectionByGradeYear = new Map(
    sectionOutput.records
      .filter((r) => r.year === year)
      .map((r) => [`${r.gradeId}:${r.year}`, r] as const),
  );

  return baseRows.map((row) => {
    const shortGradeId = DISPLAY_NAME_TO_SHORT_GRADE_ID[row.gradeLabel] ?? row.gradeLabel.toLowerCase();
    const sectionRecord = sectionByGradeYear.get(`${shortGradeId}:${year}`);
    const enrollment = sectionRecord?.enrollment ?? null;
    const sections = sectionRecord?.sectionCount ?? null;
    return {
      gradeId: row.gradeId,
      gradeLabel: row.gradeLabel,
      division: row.division,
      educatorAttribution: "grade_level_governed",
      educators: row.educators,
      assistants: row.assistants,
      monitors: row.monitors,
      monitorApplicable: row.division === "Early Years",
      totalHeadcount: row.totalHeadcount,
      sections,
      enrollment,
      alunosPorTurma: computeAlunosPorTurma(enrollment, sections),
    };
  });
}

// Grade 6 is active from 2028 under t1_g6 (ACTIVE_GRADE_COUNT_BY_PACKAGE_AND_YEAR
// in governedCaptacaoCapacitySourceData.ts starts at 11 active grades, T1..G6).
// This function never derives learners from capacity, and never derives
// grade-level capacity from the annual GOVERNED_AVAILABLE_CAPACITY_BY_YEAR total —
// enrollment comes directly from the grade-level governed records, and (as of
// V10-RC2.4 Gate 4) sections are derived from that same scenario-specific
// enrollment via the workbook-verified deriveSectionCountFromEnrollment()
// formula — the same formula sectionCountEngine.ts uses for EY/LS — rather
// than a stale, scenario-independent capacity-record lookup. This is what
// makes Grade 6's displayed turma count vary by captação scenario.
function buildGrade6Row(
  occupancyScenarioId: OccupancyScenarioId,
  year: OpeningPackageDirectWorkbookYear,
): PayrollGradeDetailRow {
  const enrollmentRecord = GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.find(
    (r) => r.normalizedGradeId === "G6" && r.scenarioId === occupancyScenarioId && r.year === year,
  );
  const studentsPerClass = GOVERNED_STUDENTS_PER_CLASS.find(
    (r) => r.normalizedGradeId === "G6",
  )?.studentsPerClass ?? null;
  const enrollment = enrollmentRecord?.enrollment ?? null;
  const sections =
    enrollment !== null && studentsPerClass !== null
      ? deriveSectionCountFromEnrollment(enrollment, studentsPerClass)
      : null;
  return {
    gradeId: "MS Grade 6",
    gradeLabel: gradeDisplayName("g6"),
    division: "Middle School",
    educatorAttribution: "division_level_only",
    educators: null,
    assistants: null,
    monitors: null,
    monitorApplicable: false,
    totalHeadcount: null,
    sections,
    enrollment,
    alunosPorTurma: computeAlunosPorTurma(enrollment, sections),
  };
}

export interface PayrollGradeDetailInput {
  openingPackageId: ActiveOpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  year: OpeningPackageDirectWorkbookYear;
}

export function buildPayrollGradeDetailRows(input: PayrollGradeDetailInput): PayrollGradeDetailRow[] {
  const hcTableResult = buildOrgDesignHcTable(input);
  const rows = buildEyLsGradeRows(hcTableResult.rows, input.openingPackageId, input.occupancyScenarioId, input.year);
  if (input.openingPackageId === "t1_g6") {
    rows.push(buildGrade6Row(input.occupancyScenarioId, input.year));
  }
  return rows;
}
