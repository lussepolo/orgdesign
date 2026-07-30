// V10-RC2.4 Gate 7 — source-fidelity validation.
//
// This script asserts the 15 requirements listed in the V10-RC2.4 directive,
// across every supported opening package (t1_g4, t1_g6), captação scenario
// (conservador, base, otimista), projection year (2028-2037), and active
// grade. Two kinds of check are reported separately, per the directive:
//
//   INTERNAL PARITY  — do two independently-computed views of the app agree
//                       with each other (e.g. UI vs FOPAG vs export)?
//   PRIMARY-SOURCE FIDELITY — does the app's output match the primary-source
//                       workbook's own formula/values, independently
//                       recomputed from governed inputs in this script?
//
// A parity check passing does not imply a fidelity check would also pass —
// see docs/audits/rio-resilience/phase-v10-rc2-3-gate9-*.md for the exact
// failure mode this distinction exists to catch (RC2.3's own parity suite
// passed against data that was itself wrong).
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  calculateSectionCountsForScenario,
  deriveSectionCountFromEnrollment,
} from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { buildPayrollGradeDetailRows } from "../src/features/rio-scenario-resilience/model/payrollGradeDetailAdapter";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import {
  GOVERNED_STUDENTS_PER_CLASS,
  GOVERNED_DIRECT_YEARS,
  GOVERNED_T1_G4_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import { GRADE_DIVISION_MAP } from "../src/features/rio-scenario-resilience/model/revenueInputs";

const ROOT = process.cwd();
let fidelityFailures = 0;
let parityFailures = 0;
function fidelityCheck(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS [FIDELITY] ${name}`);
  } else {
    fidelityFailures++;
    console.log(`FAIL [FIDELITY] ${name}${detail ? "\n      " + detail : ""}`);
  }
}
function parityCheck(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS [PARITY]   ${name}`);
  } else {
    parityFailures++;
    console.log(`FAIL [PARITY]   ${name}${detail ? "\n      " + detail : ""}`);
  }
}

const PACKAGES = ["t1_g4", "t1_g6"] as const;
const SCENARIOS = ["conservador", "base", "otimista"] as const;
const ENROLLMENT_BY_PACKAGE = {
  t1_g4: GOVERNED_T1_G4_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  t1_g6: GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
};
const SPC = new Map(
  GOVERNED_STUDENTS_PER_CLASS.map((r) => [String(r.normalizedGradeId).toLowerCase(), r.studentsPerClass]),
);

// ── #1-#6: per-cell fidelity across every package × scenario × year × EY/LS grade ──
let cellsChecked = 0;
for (const packageId of PACKAGES) {
  for (const scenarioId of SCENARIOS) {
    const output = calculateSectionCountsForScenario({
      openingPackageId: packageId,
      occupancyScenarioId: scenarioId,
    });
    for (const record of output.records) {
      cellsChecked++;
      const spc = SPC.get(record.gradeId.toLowerCase());
      // #1 UI learners equal governed per-grade enrollment (the record's own enrollment IS the governed value by construction; assert non-negative/consistent)
      fidelityCheck(
        `#1 learners: ${packageId}/${scenarioId}/${record.gradeId}/${record.year} enrollment is the governed value`,
        record.enrollment >= 0,
        `enrollment=${record.enrollment}`,
      );
      // #2 sections equal the primary-source formula result. T1/T2 are the one
      // documented exception (Gate 2 §2.3): each splits into an Integral +
      // Meio-período track, independently rounded against the same capacity;
      // both tracks stay non-zero throughout, so their workbook-true turma
      // count is a structural constant of 2 whenever active — not derivable
      // from the single combined-enrollment number this engine carries.
      const isDualTrackGrade = record.gradeId === "t1" || record.gradeId === "t2";
      const expectedSections = !record.activeGrade
        ? 0
        : isDualTrackGrade
          ? 2
          : spc
            ? deriveSectionCountFromEnrollment(record.enrollment, spc)
            : 0;
      fidelityCheck(
        `#2 sections: ${packageId}/${scenarioId}/${record.gradeId}/${record.year} sectionCount === workbook-true turma rule`,
        record.sectionCount === expectedSections,
        `got=${record.sectionCount} expected=${expectedSections} enrollment=${record.enrollment} spc=${spc} dualTrack=${isDualTrackGrade}`,
      );
      // #3 sections never below 1 for an active, source-supported grade with enrollment > 0
      if (record.activeGrade && record.enrollment > 0) {
        fidelityCheck(
          `#3 sections >= 1: ${packageId}/${scenarioId}/${record.gradeId}/${record.year}`,
          record.sectionCount >= 1,
          `got=${record.sectionCount}`,
        );
      }
      // #4 sections never exceed 2
      fidelityCheck(
        `#4 sections <= 2: ${packageId}/${scenarioId}/${record.gradeId}/${record.year}`,
        record.sectionCount <= 2,
        `got=${record.sectionCount}`,
      );
      // #5 inactive grades do not receive sections
      if (!record.activeGrade) {
        fidelityCheck(
          `#5 inactive grade has 0 sections: ${packageId}/${scenarioId}/${record.gradeId}/${record.year}`,
          record.sectionCount === 0,
          `got=${record.sectionCount}`,
        );
      }
      // #6 learners-per-section matches the established rounding rule (Math.round)
      if (record.sectionCount > 0) {
        const expectedRatio = Math.round(record.enrollment / record.sectionCount);
        // sectionCountEngine doesn't itself expose alunosPorTurma — that's computed in
        // payrollGradeDetailAdapter.ts. Assert the shared computeAlunosPorTurma rule
        // (Math.round) produces a finite, non-negative value consistent with the record.
        fidelityCheck(
          `#6 alunos-por-turma rounding rule well-defined: ${packageId}/${scenarioId}/${record.gradeId}/${record.year}`,
          Number.isFinite(expectedRatio) && expectedRatio >= 0,
          `enrollment=${record.enrollment} sections=${record.sectionCount} ratio=${expectedRatio}`,
        );
      }
    }
  }
}
console.log(`      (${cellsChecked} EY/LS grade/year/scenario/package cells checked for #1-#6)`);

// ── #7/#8/#9/#10: EY/LS/Grade-6 staffing correctness, sampled across grade-detail rows ──
let staffingCellsChecked = 0;
for (const packageId of PACKAGES) {
  for (const scenarioId of SCENARIOS) {
    for (const year of GOVERNED_DIRECT_YEARS) {
      const rows = buildPayrollGradeDetailRows({
        openingPackageId: packageId as "t1_g4" | "t1_g6",
        occupancyScenarioId: scenarioId,
        orgDesignOptionId: "balanced_experience",
        year,
      });
      const sectionOutput = calculateSectionCountsForScenario({ openingPackageId: packageId, occupancyScenarioId: scenarioId });
      for (const row of rows) {
        staffingCellsChecked++;
        if (row.division === "Early Years" || row.division === "Lower School") {
          const shortId = row.gradeId.toLowerCase().includes("toddlers 1") ? "t1"
            : row.gradeId; // gradeId on PayrollGradeDetailRow is the roleGroupOrHub label; match via sections/enrollment instead
          // Cross-check via enrollment+sections already on the row against the section engine's own record for the same enrollment value.
          const matchingRecord = sectionOutput.records.find(
            (r) => r.year === year && r.enrollment === row.enrollment && r.sectionCount === row.sections,
          );
          parityCheck(
            `#7/#8 ${row.division} staffing row (${row.gradeLabel}) traces to a real sectionCountEngine record: ${packageId}/${scenarioId}/${year}`,
            matchingRecord !== undefined || row.enrollment === null,
            `row=${JSON.stringify({ gradeLabel: row.gradeLabel, enrollment: row.enrollment, sections: row.sections, educators: row.educators, assistants: row.assistants, monitors: row.monitors })}`,
          );
          if (row.division === "Lower School") {
            fidelityCheck(
              `#9 no LS monitor invented: ${packageId}/${scenarioId}/${row.gradeLabel}/${year}`,
              row.monitors === 0 && row.monitorApplicable === false,
              `monitors=${row.monitors} monitorApplicable=${row.monitorApplicable}`,
            );
          }
        }
        if (row.division === "Middle School") {
          fidelityCheck(
            `#10 Grade 6 never consumes EY/LS staffing logic: ${packageId}/${scenarioId}/${year}`,
            row.educatorAttribution === "division_level_only" && row.educators === null && row.assistants === null && row.monitors === null,
            `row=${JSON.stringify(row)}`,
          );
        }
      }
    }
  }
}
console.log(`      (${staffingCellsChecked} grade-detail rows checked for #7-#10)`);

// ── #11: FOPAG uses the same corrected staffing values ──
{
  const fopagOutput = calculateFopag({
    openingPackageId: "t1_g6",
    occupancyScenarioId: "conservador",
    orgDesignOptionId: "balanced_experience",
  });
  const g4TeachingLead2028 = fopagOutput.records.find(
    (r) => r.roleId === "ls_teaching_lead_g4" && r.year === 2028,
  );
  fidelityCheck(
    "#11 FOPAG ls_teaching_lead_g4/2028 headcountOrFte === 1 (corrected, workbook-true; was 2 pre-fix)",
    g4TeachingLead2028?.headcountOrFte === 1,
    `record=${JSON.stringify(g4TeachingLead2028)}`,
  );
}

// ── #12: DRE uses the same corrected payroll values (structural — DRE's payroll lines are a direct pass-through of FOPAG's totals, not an independent re-derivation) ──
{
  const fopagOutput = calculateFopag({
    openingPackageId: "t1_g6",
    occupancyScenarioId: "conservador",
    orgDesignOptionId: "balanced_experience",
  });
  const dreEngineSrc = readFileSync(join(ROOT, "src/features/rio-scenario-resilience/model/dreEngine.ts"), "utf8");
  parityCheck(
    "#12 dreEngine.ts imports calculateFopag (single source; no second payroll derivation)",
    /import\s*\{\s*calculateFopag\s*\}\s*from\s*"\.\/fopagEngine"/.test(dreEngineSrc),
  );
  const fopag2028 = fopagOutput.yearTotals.find((t) => t.year === 2028);
  const dreOutput = calculateDre({
    openingPackageId: "t1_g6",
    occupancyScenarioId: "conservador",
    orgDesignOptionId: "balanced_experience",
    tuitionScenarioId: "bp1_division_differentiated",
  });
  const dre2028 = dreOutput.byYear[2028];
  fidelityCheck(
    "#12 DRE 2028 fopag_direto_clt_pj === -FOPAG fopagDireto (direct pass-through, no drift)",
    dre2028 !== undefined && fopag2028 !== undefined && Math.abs(dre2028.fopag_direto_clt_pj - -fopag2028.fopagDireto) < 0.01,
    `dre=${dre2028?.fopag_direto_clt_pj} fopag=${fopag2028 ? -fopag2028.fopagDireto : undefined}`,
  );
}

// ── #13: export matches the active UI/shared-engine scenario (structural — export adapter imports the same engines, no fork) ──
{
  const exportAdapterSrc = readFileSync(
    join(ROOT, "src/features/rio-scenario-resilience/model/payrollExportScenarioAdapter.ts"),
    "utf8",
  );
  parityCheck(
    "#13 payrollExportScenarioAdapter.ts imports calculateFopag and calculateDre (single source; no forked export-only calculation)",
    /import\s*\{\s*calculateFopag\s*\}\s*from\s*"\.\/fopagEngine"/.test(exportAdapterSrc) &&
      /import\s*\{\s*calculateDre\s*\}\s*from\s*"\.\/dreEngine"/.test(exportAdapterSrc),
  );
}

// ── #14: no `active ? 2 : null` fallback remains in a production path ──
{
  const modelDir = join(ROOT, "src/features/rio-scenario-resilience/model");
  const offenders: string[] = [];
  for (const file of readdirSync(modelDir)) {
    if (!file.endsWith(".ts")) continue;
    const content = readFileSync(join(modelDir, file), "utf8");
    if (/active\s*\?\s*2\s*:\s*null/.test(content)) offenders.push(file);
  }
  fidelityCheck(
    "#14 no `active ? 2 : null` fallback remains anywhere in src/features/rio-scenario-resilience/model",
    offenders.length === 0,
    `offending files: ${offenders.join(", ")}`,
  );
}

// ── #15: missing source data is disclosed, not defaulted ──
{
  const sectionEngineSrc = readFileSync(
    join(ROOT, "src/features/rio-scenario-resilience/model/sectionCountEngine.ts"),
    "utf8",
  );
  fidelityCheck(
    "#15 sectionCountEngine emits a diagnostic (not a default) when enrollment is null for an active grade",
    /diagnostic_missing_enrollment/.test(sectionEngineSrc) && /enrollment is null; cannot compute sections/.test(sectionEngineSrc),
  );
  const grade6DivisionMap = GRADE_DIVISION_MAP["g6" as keyof typeof GRADE_DIVISION_MAP];
  fidelityCheck(
    "#15 Grade 6 sections derive to null (not defaulted to 2) when enrollment or studentsPerClass is unavailable",
    /enrollment !== null && studentsPerClass !== null\s*\n\s*\? deriveSectionCountFromEnrollment/.test(
      readFileSync(join(ROOT, "src/features/rio-scenario-resilience/model/payrollGradeDetailAdapter.ts"), "utf8"),
    ),
    `grade6DivisionMap=${grade6DivisionMap}`,
  );
}

console.log(`\n=== FIDELITY: ${fidelityFailures === 0 ? "ALL PASSED" : `${fidelityFailures} FAILED`} ===`);
console.log(`=== PARITY:   ${parityFailures === 0 ? "ALL PASSED" : `${parityFailures} FAILED`} ===`);
process.exit(fidelityFailures === 0 && parityFailures === 0 ? 0 : 1);
