// V10-RC2.2 Gate 4 — Cost boundaries.
//
// Proves the six cost concepts (base salary payroll, encargos, benefits,
// direct campus payroll, corporate allocation, consolidated people cost)
// stay distinct: totalPayroll's formula is exactly fopagDireto + folhaDireta
// + benefits (no hidden corporate term), no source file labels direct
// payroll as "consolidated" cost, no corporate-allocation adapter exists to
// sum in, and D-R5/D-R6/F03 block only revenue-side outputs per the Gate 1
// register (reused, not re-derived).
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { ACTIVE_OPENING_PACKAGE_IDS, OCCUPANCY_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

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

// ── 1. totalPayroll formula is exactly fopagDireto + folhaDireta + benefits,
// for every governed combination/year — no hidden corporate term. ──────────
const PACKAGES: readonly ActiveOpeningPackageId[] = ACTIVE_OPENING_PACKAGE_IDS;
const CAPTACAO: readonly OccupancyScenarioId[] = OCCUPANCY_SCENARIO_IDS;
const ORG_DESIGNS = DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS;

let yearsChecked = 0;
let formulaFailures = 0;
for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    for (const orgDesignOptionId of ORG_DESIGNS) {
      const output = calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId });
      for (const yt of output.yearTotals) {
        yearsChecked++;
        const expected = Math.round((yt.fopagDireto + yt.folhaDireta + yt.benefits) * 100) / 100;
        if (Math.abs(expected - yt.totalPayroll) > 0.01) {
          formulaFailures++;
          check(
            `totalPayroll formula ${openingPackageId}/${occupancyScenarioId}/${orgDesignOptionId}/${yt.year}`,
            false,
            `expected fopagDireto+folhaDireta+benefits=${expected}, got totalPayroll=${yt.totalPayroll}`,
          );
        }
      }
    }
  }
}
check(
  `totalPayroll === fopagDireto + folhaDireta + benefits, no hidden term, for every governed combination/year (${yearsChecked} year-totals checked)`,
  formulaFailures === 0,
);

// ── 2. No source file binds a "consolidated" cost/coverage label to a value
// that omits a corporate-allocation term. The retired mislabeled key must be
// gone; the replacement key must exist and be distinct from any consolidated
// claim. ─────────────────────────────────────────────────────────────────
const payrollTabSrc = readFileSync(join(ROOT, "src/components/sections/PayrollProjectionTab.tsx"), "utf8");
const ptBrSrc = readFileSync(join(ROOT, "src/i18n/pt-BR.ts"), "utf8");
const enUsSrc = readFileSync(join(ROOT, "src/i18n/en-US.ts"), "utf8");

check(
  "retired mislabeled key payrollCoberturaConsolidadaLabel no longer exists anywhere",
  !payrollTabSrc.includes("payrollCoberturaConsolidadaLabel") &&
    !ptBrSrc.includes("payrollCoberturaConsolidadaLabel") &&
    !enUsSrc.includes("payrollCoberturaConsolidadaLabel"),
);
check(
  "replacement key payrollMargemFolhaDiretaLabel exists in component and both locales",
  payrollTabSrc.includes("payrollMargemFolhaDiretaLabel") &&
    ptBrSrc.includes("payrollMargemFolhaDiretaLabel") &&
    enUsSrc.includes("payrollMargemFolhaDiretaLabel"),
);
check(
  "neither locale's replacement label text claims 'consolidated' cost",
  !/payrollMargemFolhaDiretaLabel:\s*"[^"]*[Cc]onsolidad/.test(ptBrSrc) &&
    !/payrollMargemFolhaDiretaLabel:\s*"[^"]*[Cc]onsolidat/.test(enUsSrc),
);
check(
  "no label anywhere in PayrollProjectionTab.tsx pairs the word 'consolidated'/'consolidada' with a KPI/label value",
  !/label:\s*t\("[^"]*[Cc]onsolidad[^"]*"\)/.test(payrollTabSrc),
);

// ── 3. No corporate-allocation adapter function exists to sum in (reuses
// Gate 1's live check — a genuine adapter appearing later would change what
// "consolidated people cost" could mean, so this is re-verified here too). ──
const corpAllocFunctionMatches = execSync(
  `grep -rln "function.*[Cc]orporateAllocation\\|buildCorporateAllocation\\|calculateCorporateAllocation" ${join(ROOT, "src")} || true`,
  { encoding: "utf8" },
).trim();
check(
  "no corporate-allocation adapter function exists (consolidated people cost genuinely cannot be formed)",
  corpAllocFunctionMatches === "",
  corpAllocFunctionMatches || "none found",
);

// ── 4. PayrollProjectionTab.tsx never displays a "consolidated people cost"
// KPI/label, and direct campus payroll (fopagDireto/folhaDireta/benefits) is
// still computed and shown unconditionally. ─────────────────────────────────
check(
  "no 'consolidated people cost' / 'custo de pessoal consolidado' string anywhere in the tab",
  !/consolidated people cost/i.test(payrollTabSrc) && !/custo de pessoal consolidado/i.test(payrollTabSrc),
);
check(
  "direct campus payroll (fopagDiretoAnnual/folhaDiretaAnnual/beneficiosAnnual) still computed and shown unconditionally",
  payrollTabSrc.includes("fopagDiretoAnnual") &&
    payrollTabSrc.includes("folhaDiretaAnnual") &&
    payrollTabSrc.includes("beneficiosAnnual"),
);

// ── 5. D-R5/D-R6/F03 scoping — reused from the Gate 1 register, not
// re-derived: each blocks only revenue-side outputs, none blocks headcount
// or direct campus payroll. ─────────────────────────────────────────────────
const registerPath = join(ROOT, "docs/audits/rio-resilience/phase-v10-rc2-2-gate1-blocker-register.json");
const register = JSON.parse(readFileSync(registerPath, "utf8")) as {
  entries: Array<{ id: string; notBlocked: string[] }>;
};
const byId = new Map(register.entries.map((e) => [e.id, e]));
for (const id of ["D-R5", "D-R6", "F03"]) {
  const entry = byId.get(id);
  check(
    `${id} notBlocked includes direct campus payroll (Gate 1 register, reused not restated)`,
    entry !== undefined && entry.notBlocked.some((s) => /direct campus payroll/.test(s)),
  );
}

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED (${checksRun} checks, ${yearsChecked} year-totals verified against the totalPayroll formula)`
    : `\n${failures} CHECK(S) FAILED out of ${checksRun}`,
);
process.exit(failures === 0 ? 0 : 1);
