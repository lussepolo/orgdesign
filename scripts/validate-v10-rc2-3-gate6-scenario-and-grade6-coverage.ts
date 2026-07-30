// V10-RC2.3 Gate 6 — reactive parity validators for:
//   (a) Turmas e Folha's newly-editable shared scenario controls
//       (opening package / captação / tuition), and
//   (b) Grade 6 coverage restoration under t1_g6.
//
// This does not re-implement Gate 3 (180-combination Org-Design/Payroll HC
// parity) — that is still validate:v10-rc2-2-gate3 and is re-run unchanged
// as part of this phase's regression sweep (see IMPLEMENTATION.md).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildPayrollGradeDetailRows } from "../src/features/rio-scenario-resilience/model/payrollGradeDetailAdapter";
import {
  GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_DIRECT_YEARS,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
  RETIRED_OPENING_PACKAGE_IDS,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";

const ROOT = process.cwd();
let failures = 0;
let checksRun = 0;
function check(name: string, pass: boolean, detail?: string) {
  checksRun++;
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

const payrollSrc = readFileSync(join(ROOT, "src/components/sections/PayrollProjectionTab.tsx"), "utf8");
const workspaceSrc = readFileSync(join(ROOT, "src/components/sections/SectionsAndPayrollWorkspace.tsx"), "utf8");
const appSrc = readFileSync(join(ROOT, "src/App.tsx"), "utf8");

// ── Scenario controls: end-to-end wiring, source-level ──────────────────────
check(
  "PayrollProjectionTab.tsx declares onOpeningPackageIdChange/onOccupancyScenarioIdChange/onTuitionScenarioIdChange props",
  /onOpeningPackageIdChange: \(id: ActiveOpeningPackageId\) => void/.test(payrollSrc) &&
    /onOccupancyScenarioIdChange: \(id: OccupancyScenarioId\) => void/.test(payrollSrc) &&
    /onTuitionScenarioIdChange: \(id: TuitionScenarioId\) => void/.test(payrollSrc),
);
check(
  "PayrollProjectionTab.tsx renders <select> controls wired to those change handlers (not read-only divs)",
  /onChange=\{\(event\) => onOpeningPackageIdChange/.test(payrollSrc) &&
    /onChange=\{\(event\) => onOccupancyScenarioIdChange/.test(payrollSrc) &&
    /onChange=\{\(event\) => onTuitionScenarioIdChange/.test(payrollSrc),
);
check(
  "PayrollProjectionTab.tsx opening-package selector iterates ACTIVE_OPENING_PACKAGE_IDS only (no hardcoded retired ids)",
  /ACTIVE_OPENING_PACKAGE_IDS\.map\(\(id\) => \(/.test(payrollSrc) &&
    !/t1_g3/.test(payrollSrc) &&
    !/t1_g5/.test(payrollSrc),
);
check(
  "PayrollProjectionTab.tsx captação selector iterates OCCUPANCY_SCENARIO_IDS only (no hardcoded pessimista/intermediario as a selectable option)",
  /OCCUPANCY_SCENARIO_IDS\.map\(\(id\) => \(/.test(payrollSrc) &&
    !/"pessimista"/.test(payrollSrc),
);
check(
  "SectionsAndPayrollWorkspace.tsx forwards all three change handlers to PayrollProjectionTab",
  /onOpeningPackageIdChange=\{onOpeningPackageIdChange\}/.test(workspaceSrc) &&
    /onOccupancyScenarioIdChange=\{onOccupancyScenarioIdChange\}/.test(workspaceSrc) &&
    /onTuitionScenarioIdChange=\{onTuitionScenarioIdChange\}/.test(workspaceSrc),
);
check(
  "App.tsx wires Turmas e Folha's change handlers to the SAME dreSelections setter ExecutiveOrgDesignTab uses (no second shared-state store)",
  /onOpeningPackageIdChange=\{handleOrgDesignOpeningPackageIdChange\}/.test(appSrc) &&
    /onOccupancyScenarioIdChange=\{handleOrgDesignOccupancyScenarioIdChange\}/.test(appSrc) &&
    /handleTuitionScenarioIdChange = \(id: TuitionScenarioId\) =>\s*\n\s*setDreSelections/.test(appSrc),
);
check(
  "the false 'not chosen on this page' copy has been removed from payrollHowToUseIntro",
  !/n(ã|a)o s(ã|a)o escolhidos nesta p(á|a)gina/i.test(readFileSync(join(ROOT, "src/i18n/pt-BR.ts"), "utf8")) &&
    !/not chosen on this page/i.test(readFileSync(join(ROOT, "src/i18n/en-US.ts"), "utf8")),
);
check(
  "no retired opening package id is offered by the active-package contract itself (defense in depth)",
  RETIRED_OPENING_PACKAGE_IDS.every((id) => !(ACTIVE_OPENING_PACKAGE_IDS as readonly string[]).includes(id)),
);

// ── Functional: changing captação/package/year actually changes governed outputs ──
// Note: captação does NOT change FOPAG/payroll for either package — every
// active grade's committed sections are fixed at 2
// (GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS), which overrides the raw
// ceil(enrollment/studentsPerClass) derivation in sectionCountEngine.ts
// (sectionCount = min(max(rawSections, committedSections), 2) = 2 whenever
// active, regardless of scenario). Captação changes enrollment/revenue, which
// IS what the Payroll page's KPI strip and grade table's Grade 6 learner
// count respond to — asserted against DRE below, not FOPAG.
const dreConservador = calculateDre({ openingPackageId: "t1_g6", occupancyScenarioId: "conservador", orgDesignOptionId: "balanced_experience", tuitionScenarioId: "bp1_division_differentiated" });
const dreOtimista = calculateDre({ openingPackageId: "t1_g6", occupancyScenarioId: "otimista", orgDesignOptionId: "balanced_experience", tuitionScenarioId: "bp1_division_differentiated" });
check(
  "changing captação (conservador -> otimista) changes governed enrollment/revenue output for t1_g6",
  dreConservador.byYear[2028].numero_de_alunos !== dreOtimista.byYear[2028].numero_de_alunos &&
    dreConservador.byYear[2028].receita_operacional_liquida !== dreOtimista.byYear[2028].receita_operacional_liquida,
);
const g6RowsConservador = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6", occupancyScenarioId: "conservador", orgDesignOptionId: "balanced_experience", year: 2028 });
const g6RowsOtimista = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6", occupancyScenarioId: "otimista", orgDesignOptionId: "balanced_experience", year: 2028 });
check(
  "changing captação (conservador -> otimista) changes Grade 6's governed learner count in the grade table",
  g6RowsConservador.find((r) => r.division === "Middle School")?.enrollment !==
    g6RowsOtimista.find((r) => r.division === "Middle School")?.enrollment,
);
const fopagG4 = calculateFopag({ openingPackageId: "t1_g4", occupancyScenarioId: "base", orgDesignOptionId: "balanced_experience" });
const fopagG6 = calculateFopag({ openingPackageId: "t1_g6", occupancyScenarioId: "base", orgDesignOptionId: "balanced_experience" });
check(
  "changing opening package (t1_g4 -> t1_g6) changes the shared FOPAG output",
  JSON.stringify(fopagG4.yearTotals) !== JSON.stringify(fopagG6.yearTotals),
);
const dreMin = calculateDre({ openingPackageId: "t1_g6", occupancyScenarioId: "base", orgDesignOptionId: "minimum_experience", tuitionScenarioId: "bp1_division_differentiated" });
const drePremium = calculateDre({ openingPackageId: "t1_g6", occupancyScenarioId: "base", orgDesignOptionId: "premium_experience", tuitionScenarioId: "bp1_division_differentiated" });
check(
  "changing Org Design (Minimum -> Premium) changes governed role/cost outputs (DRE payroll fields)",
  dreMin.byYear[2028].folha_de_pagamento !== drePremium.byYear[2028].folha_de_pagamento ||
    dreMin.byYear[2028].fopag_direto_clt_pj !== drePremium.byYear[2028].fopag_direto_clt_pj,
);
check(
  "changing year (2028 -> 2029) changes governed enrollment/section/cost outputs",
  fopagG6.yearTotals[0].totalPayroll !== fopagG6.yearTotals[1].totalPayroll,
);

// ── No local payroll calculation path exists ────────────────────────────────
check(
  "PayrollProjectionTab.tsx does not re-derive sections via ceil(enrollment/studentsPerClass) (EY/LS formula must not appear locally)",
  !/Math\.ceil\(/.test(payrollSrc),
);
check(
  "PayrollProjectionTab.tsx has no local TURMAS_SCHEDULE/STUDENTS_SCHEDULE/PayrollScenario retired-axis declarations (comment mentions of the retired V10-RC2.2 axis are fine)",
  !/const TURMAS_SCHEDULE|const STUDENTS_SCHEDULE|^type PayrollScenario\b/m.test(payrollSrc),
);

// ── Grade 6 coverage: opening range per package ─────────────────────────────
for (const year of GOVERNED_DIRECT_YEARS) {
  const g4Rows = buildPayrollGradeDetailRows({ openingPackageId: "t1_g4", occupancyScenarioId: "base", orgDesignOptionId: "balanced_experience", year });
  check(
    `t1_g4/${year}: grade table excludes Grade 6 and any Middle School row`,
    !g4Rows.some((r) => r.division === "Middle School"),
  );
}
for (const year of GOVERNED_DIRECT_YEARS) {
  const g6Rows = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6", occupancyScenarioId: "base", orgDesignOptionId: "balanced_experience", year });
  const msRows = g6Rows.filter((r) => r.division === "Middle School");
  check(
    `t1_g6/${year}: grade table includes exactly one Grade 6 (Middle School) row`,
    msRows.length === 1 && msRows[0].gradeLabel === "Grade 6",
  );
}

// ── Grade 6: enrollment/sections equal the governed source, for every active
// captação scenario and year; educators always null (never zero, never a
// fabricated EY/LS-style figure). ───────────────────────────────────────────
let g6CellsChecked = 0;
for (const occupancyScenarioId of OCCUPANCY_SCENARIO_IDS as readonly OccupancyScenarioId[]) {
  for (const year of GOVERNED_DIRECT_YEARS) {
    g6CellsChecked++;
    const rows = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6" as ActiveOpeningPackageId, occupancyScenarioId, orgDesignOptionId: "balanced_experience", year });
    const g6 = rows.find((r) => r.division === "Middle School");
    const expectedEnrollment = GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.find(
      (r) => r.normalizedGradeId === "G6" && r.scenarioId === occupancyScenarioId && r.year === year,
    )?.enrollment ?? null;
    const expectedSections = GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.find(
      (r) => r.packageId === "t1_g6" && r.normalizedGradeId === "G6" && r.year === year,
    )?.sections ?? null;
    if (g6?.enrollment !== expectedEnrollment || g6?.sections !== expectedSections || g6?.educators !== null) {
      check(
        `Grade 6 governed parity ${occupancyScenarioId}/${year}`,
        false,
        `got enrollment=${g6?.enrollment} sections=${g6?.sections} educators=${g6?.educators}; expected enrollment=${expectedEnrollment} sections=${expectedSections} educators=null`,
      );
    }
  }
}
console.log(`      (${g6CellsChecked} Grade 6 scenario/year cells checked for enrollment/sections/educators-null parity)`);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED (${checksRun} checks, ${g6CellsChecked} Grade 6 scenario/year cells)`
    : `\n${failures} CHECK(S) FAILED out of ${checksRun}`,
);
process.exit(failures === 0 ? 0 : 1);
