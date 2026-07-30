// V10-RC2.4 Gate 3 — PRE-FIX DEFECT PROOF.
//
// Proves, with primary-source workbook evidence, that the pre-fix
// `active ? 2 : null` committed-sections floor in
// governedCaptacaoCapacitySourceData.ts forces sectionCount to 2 for every
// active grade, contradicting the v10 workbook's actual per-grade turma
// ramp — and that this defect propagates into EY/LS teaching-lead headcount
// (and therefore FOPAG).
//
// Evidence source: `Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx`
// (SHA-256 2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0),
// sheet `PnL`, rows 88-106 (`Turmas` block) — literal Excel formulas
// `ROUNDUP(enrollment/studentsPerClass, 0)`, capped at the Rio ceiling of 2.
// Full evidence matrix and 150-cell numeric verification:
// docs/audits/rio-resilience/phase-v10-rc2-4-gate1-2-evidence-matrix-and-source-authority.md
//
// This script MUST fail before the Gate 4 fix and pass after it. Do not
// "fix" it to pass pre-fix — that would defeat its purpose as the
// before/after evidence pair for this gate.
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { buildOrgDesignHcTable } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";

let failures = 0;
function check(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

// ── Claim A: workbook-true section counts for a representative ramp sample ──
// (PnL!E98:J98 Grade 4, PnL!E99:J99 Grade 5, PnL!E100:J100 Grade 6 — T1-G6/Conservador)
const WORKBOOK_TRUE_SECTIONS: { gradeId: string; year: number; expected: number }[] = [
  { gradeId: "g4", year: 2028, expected: 1 }, // PnL!E98=1
  { gradeId: "g4", year: 2029, expected: 1 }, // PnL!F98=1
  { gradeId: "g4", year: 2030, expected: 2 }, // PnL!G98=2
  { gradeId: "g5", year: 2028, expected: 1 }, // PnL!E99=1
  { gradeId: "g5", year: 2030, expected: 1 }, // PnL!G99=1
  { gradeId: "g5", year: 2031, expected: 2 }, // PnL!H99=2
  { gradeId: "g6", year: 2028, expected: 1 }, // PnL!E100=1
  { gradeId: "g6", year: 2032, expected: 1 }, // PnL!I100=1
  { gradeId: "g6", year: 2033, expected: 2 }, // PnL!J100=2
];

const sectionOutput = calculateSectionCountsForScenario({
  openingPackageId: "t1_g6",
  occupancyScenarioId: "conservador",
});

for (const { gradeId, year, expected } of WORKBOOK_TRUE_SECTIONS) {
  // g6 is Middle School — sectionCountEngine scopes itself to EY/LS only, so
  // g6 never appears in its output. This is expected and handled separately
  // by Gate 4/5 (Grade 6 sections are display-only, sourced independently in
  // payrollGradeDetailAdapter.ts). Only assert EY/LS grades (g4, g5) here.
  if (gradeId === "g6") continue;
  const record = sectionOutput.records.find((r) => r.gradeId === gradeId && r.year === year);
  check(
    `t1_g6/conservador/${gradeId}/${year}: sectionCount === ${expected} (workbook-true, PnL Turmas block)`,
    record?.sectionCount === expected,
    `got sectionCount=${record?.sectionCount}, rawSections=${record?.rawSections}, formulaBasis=${record?.formulaBasis}`,
  );
}

// ── Claim B: defect propagates into EY/LS teaching-lead headcount (and therefore FOPAG) ──
// V10-RC2.2 Gate 3 established sectionCount === teaching-lead headcount, byte-for-byte,
// for this exact engine. If sectionCount is wrong, headcount is wrong too.
const hc2028 = buildOrgDesignHcTable({
  openingPackageId: "t1_g6",
  occupancyScenarioId: "conservador",
  orgDesignOptionId: "balanced_experience",
  year: 2028,
});
const g4TeachingLeadRows = hc2028.rows.filter(
  (r) => r.divisionArea === "Lower School" && r.roleGroupOrHub === "LS Grade 4 Team" && r.role.endsWith("Reference Educator"),
);
const g4TeachingLeadHeadcount = g4TeachingLeadRows.reduce((sum, r) => sum + r.headcountOrFte, 0);
check(
  "t1_g6/conservador/Grade 4/2028: LS Reference Educator headcount === 1 (workbook-true sections=1, not the forced floor of 2)",
  g4TeachingLeadHeadcount === 1,
  `got headcount=${g4TeachingLeadHeadcount} (rows: ${JSON.stringify(g4TeachingLeadRows)})`,
);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED — post-fix state confirmed: sectionCount and teaching-lead headcount match the workbook's true turma ramp.`
    : `\n${failures} CHECK(S) FAILED — pre-fix defect confirmed: committed-sections floor of 2 contradicts the workbook's actual ramp and propagates into EY/LS headcount.`,
);
process.exit(failures === 0 ? 0 : 1);
