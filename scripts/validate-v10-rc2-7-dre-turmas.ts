import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateDreTurmaDriver } from "../src/features/rio-scenario-resilience/model/dreTurmaDriver";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import { GOVERNED_DIRECT_YEARS } from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";

let failures = 0;

function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}${detail ? ` - ${detail}` : ""}`);
}

const scenarioInput = {
  openingPackageId: "t1_g6" as const,
  occupancyScenarioId: "conservador" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience",
};

// Concept Rio - 20 anos - Org BU - Apresentacao v10.xlsx, sheet PnL:
// AF1 = Conservador; E222:N222 references E107:N107; row 107 = SUM(rows 88:106).
const expectedPnLRow222ConservadorT1G6 = new Map(
  [
    [2028, 19],
    [2029, 20],
    [2030, 22],
    [2031, 24],
    [2032, 25],
    [2033, 27],
    [2034, 29],
    [2035, 31],
    [2036, 31],
    [2037, 32],
  ] as const,
);

const turmaOutput = calculateDreTurmaDriver({
  openingPackageId: scenarioInput.openingPackageId,
  occupancyScenarioId: scenarioInput.occupancyScenarioId,
});
const turmaByYear = new Map(turmaOutput.yearTotals.map((record) => [record.year, record.numeroDeTurmas]));
const dreOutput = calculateDre(scenarioInput);

check("turma_driver_has_no_diagnostics", turmaOutput.diagnostics.length === 0, `${turmaOutput.diagnostics.length}`);

for (const year of GOVERNED_DIRECT_YEARS) {
  const expected = expectedPnLRow222ConservadorT1G6.get(year);
  const actual = turmaByYear.get(year);
  check(
    `pnl_row_222_t1_g6_conservador_${year}`,
    actual === expected,
    `expected ${expected}, got ${actual}`,
  );
}

for (const year of RECEITA_PROJECTION_YEARS) {
  const driverValue = turmaByYear.get(year);
  const dreValue = dreOutput.byYear[year].numero_de_turmas;
  check(
    `dre_numero_de_turmas_matches_driver_${year}`,
    dreValue === driverValue,
    `expected ${driverValue}, got ${dreValue}`,
  );
  check(
    `dre_numero_de_turmas_is_numeric_${year}`,
    typeof dreValue === "number" && Number.isFinite(dreValue),
    `got ${String(dreValue)}`,
  );
}

for (const gradeId of ["t1", "t2"]) {
  const record = turmaOutput.records.find(
    (item) => item.year === 2028 && item.gradeId === gradeId && item.activeGrade,
  );
  check(
    `dual_track_${gradeId}_2028_contributes_two_turmas`,
    record?.sectionCount === 2 && record.formulaBasis === "dual_track_toddler_constant",
    `got ${record?.sectionCount} via ${record?.formulaBasis}`,
  );
}

if (failures > 0) {
  console.error(`validate-v10-rc2-7-dre-turmas: ${failures} failure(s)`);
  process.exit(1);
}

console.log("validate-v10-rc2-7-dre-turmas: all checks passed");
