import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import XLSX from "xlsx";
import { occupancyOptions } from "../src/features/rio-scenario-resilience/data/occupancyOptions";
import { OCCUPANCY_LABELS } from "../src/components/dreSimulator/dreLeverLabels";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
  parseOccupancyScenarioId,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import {
  DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS,
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
  normalizeDreEnrollmentCapacityLeverInput,
} from "../src/features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import { calculateReceita } from "../src/features/rio-scenario-resilience/model/receitaEngine";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import {
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR,
  GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_CAPTACAO_SCENARIO_IDS,
  GOVERNED_DIRECT_YEARS,
  GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_FULL_CAMPUS_CAPACITY,
  GOVERNED_G4_CAPTACAO_WORKBOOK,
  GOVERNED_G6_CAPTACAO_WORKBOOK,
  GOVERNED_STUDENTS_PER_CLASS,
  GOVERNED_TOTAL_ENROLLMENT_VALIDATION,
  getGovernedAvailableCapacity,
  getGovernedOccupancy,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import { buildDreScenarioWorkbook } from "../src/components/dreSimulator/dreScenarioWorkbook";
import { useDreScenarioSimulator } from "../src/hooks/useDreScenarioSimulator";
import type {
  OpeningPackageDirectWorkbookYear,
  OccupancyScenarioId,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";

type ActivePackageId = "t1_g4" | "t1_g6";
type Check = { id: string; pass: boolean; detail: string };

const checks: Check[] = [];
const WORKBOOK_DIR = process.env.RIO_V10_E2_WORKBOOK_DIR ?? join(homedir(), "Downloads");
const ACTIVE_PACKAGES = ["t1_g4", "t1_g6"] as const satisfies readonly ActivePackageId[];
const SCENARIO_SHEETS: Record<OccupancyScenarioId, string> = {
  conservador: "3. CONSERVADOR",
  base: "4. INTERMEDIÁRIO",
  otimista: "5. OTIMISTA",
};
const WORKBOOKS = {
  t1_g4: GOVERNED_G4_CAPTACAO_WORKBOOK,
  t1_g6: GOVERNED_G6_CAPTACAO_WORKBOOK,
} as const;
const YEAR_COLS = ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"] as const;
const GRADE_ROWS = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26] as const;
const EXPECTED_2028_TOTALS = {
  t1_g4: { conservador: 238, base: 258, otimista: 300 },
  t1_g6: { conservador: 238, base: 258, otimista: 300 },
} as const;
const EXPECTED_CAPACITY = {
  t1_g4: [348, 396, 446, 496, 546, 596, 646, 696, 746, 746],
  t1_g6: [446, 496, 546, 596, 646, 696, 746, 746, 746, 746],
} as const;

function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function cellValue(sheet: XLSX.WorkSheet, address: string): unknown {
  return sheet[address]?.v ?? null;
}

function cellFormula(sheet: XLSX.WorkSheet, address: string): string | null {
  return typeof sheet[address]?.f === "string" ? sheet[address].f! : null;
}

function cellNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "—") return null;
  if (typeof value !== "number") throw new Error(`Expected numeric workbook value, got ${String(value)}`);
  return value;
}

function workbookGradeValues(sheet: XLSX.WorkSheet, yearIndex: number): readonly (number | null)[] {
  return GRADE_ROWS.map((row) => cellNumberOrNull(cellValue(sheet, `${YEAR_COLS[yearIndex]}${row}`)));
}

function workbookTotal(sheet: XLSX.WorkSheet, yearIndex: number): number {
  const value = cellValue(sheet, `${YEAR_COLS[yearIndex]}31`);
  if (typeof value !== "number") throw new Error(`Expected workbook total in ${YEAR_COLS[yearIndex]}31`);
  return value;
}

function workbookCapacity(sheet: XLSX.WorkSheet, yearIndex: number): number {
  const value = cellValue(sheet, `${YEAR_COLS[yearIndex]}33`);
  if (typeof value !== "number") throw new Error(`Expected workbook capacity in ${YEAR_COLS[yearIndex]}33`);
  return value;
}

function appGradeValues(
  packageId: ActivePackageId,
  scenarioId: OccupancyScenarioId,
  year: OpeningPackageDirectWorkbookYear,
): readonly (number | null)[] {
  return GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS
    .filter((record) => record.packageId === packageId && record.scenarioId === scenarioId && record.year === year)
    .map((record) => record.enrollment);
}

function appTotal(
  packageId: ActivePackageId,
  scenarioId: OccupancyScenarioId,
  year: OpeningPackageDirectWorkbookYear,
): number {
  const total = GOVERNED_TOTAL_ENROLLMENT_VALIDATION.find(
    (record) => record.packageId === packageId && record.scenarioId === scenarioId && record.year === year,
  )?.totalEnrollment;
  if (total === undefined) throw new Error(`Missing app total for ${packageId}/${scenarioId}/${year}`);
  return total;
}

function expectRejected(id: string, input: { openingPackageId: string; occupancyScenarioId: string }, expected: string): void {
  let message = "";
  try {
    normalizeDreEnrollmentCapacityLeverInput(input);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  check(id, message.includes(expected), `${JSON.stringify(input)} -> ${message}`);
}

const workbookByPackage = Object.fromEntries(
  ACTIVE_PACKAGES.map((packageId) => {
    const path = join(WORKBOOK_DIR, WORKBOOKS[packageId].workbookName);
    return [packageId, { path, workbook: XLSX.readFile(path, { cellFormula: true }) }];
  }),
) as Record<ActivePackageId, { path: string; workbook: XLSX.WorkBook }>;

check(
  "active_packages_are_g4_g6",
  JSON.stringify(ACTIVE_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g4", "t1_g6"]) &&
    JSON.stringify(DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g4", "t1_g6"]),
  `${JSON.stringify(ACTIVE_OPENING_PACKAGE_IDS)} / ${JSON.stringify(DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS)}`,
);
check(
  "active_scenarios_are_conservador_base_otimista",
  JSON.stringify(OCCUPANCY_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]) &&
    JSON.stringify(DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]) &&
    JSON.stringify(GOVERNED_CAPTACAO_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]),
  `${JSON.stringify(OCCUPANCY_SCENARIO_IDS)} / ${JSON.stringify(DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS)}`,
);
check("ui_options_are_active_scenarios_only", JSON.stringify(occupancyOptions.map((option) => option.id)) === JSON.stringify(["conservador", "base", "otimista"]), JSON.stringify(occupancyOptions));
check("ui_labels_are_current", JSON.stringify(OCCUPANCY_LABELS) === JSON.stringify({ conservador: "Conservador", base: "Base", otimista: "Otimista" }), JSON.stringify(OCCUPANCY_LABELS));
check("legacy_intermediario_normalizes_to_base", parseOccupancyScenarioId("intermediario").status === "normalized_legacy" && parseOccupancyScenarioId("intermediario").scenarioId === "base", JSON.stringify(parseOccupancyScenarioId("intermediario")));
check("pessimista_is_retired_for_enrollment", parseOccupancyScenarioId("pessimista").status === "retired_scenario", JSON.stringify(parseOccupancyScenarioId("pessimista")));
check("unknown_enrollment_scenario_is_invalid", parseOccupancyScenarioId("full-seat").status === "invalid_scenario" && parseOccupancyScenarioId("agressivo").status === "invalid_scenario", "full-seat/agressivo rejected");
check("valid_combinations_are_2_by_3", DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS.length === 6, JSON.stringify(DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS));
const g12StudentsPerClass = GOVERNED_STUDENTS_PER_CLASS.find((record) => record.normalizedGradeId === "G12")?.studentsPerClass;
check("grade_12_per_room_limit_25", g12StudentsPerClass === 25, String(g12StudentsPerClass));
check(
  "grade_12_total_capacity_50",
  GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.some(
    (record) => record.normalizedGradeId === "G12" && record.gradeCapacity === 50,
  ),
  "G12 active gradeCapacity=50 exists",
);
check("full_grade_capacity_sum_746", GOVERNED_FULL_CAMPUS_CAPACITY === 746, String(GOVERNED_FULL_CAMPUS_CAPACITY));

for (const packageId of ACTIVE_PACKAGES) {
  const source = WORKBOOKS[packageId];
  const parsed = workbookByPackage[packageId];
  check(`${packageId}_workbook_exists`, existsSync(parsed.path), parsed.path);
  check(`${packageId}_workbook_hash_matches`, sha256(parsed.path) === source.sha256, sha256(parsed.path));
  check(
    `${packageId}_workbook_sheet_structure`,
    ["1. Memória de Cálculo", "2. PESSIMISTA", "3. CONSERVADOR", "4. INTERMEDIÁRIO", "5. OTIMISTA", "6. Comparativo"].every((sheet) =>
      parsed.workbook.SheetNames.includes(sheet),
    ),
    parsed.workbook.SheetNames.join(", "),
  );

  const capacitySeries = GOVERNED_DIRECT_YEARS.map((year) => getGovernedAvailableCapacity(packageId, year));
  check(`${packageId}_capacity_series_expected`, JSON.stringify(capacitySeries) === JSON.stringify(EXPECTED_CAPACITY[packageId]), JSON.stringify(capacitySeries));
  check(
    `${packageId}_capacity_grade_reconciles_each_year`,
    GOVERNED_DIRECT_YEARS.every((year) => {
      const gradeCapacity = GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS
        .filter((record) => record.packageId === packageId && record.year === year)
        .reduce((sum, record) => sum + (record.gradeCapacity ?? 0), 0);
      return gradeCapacity === getGovernedAvailableCapacity(packageId, year);
    }),
    "grade capacities sum to annual capacity",
  );
  // V10-RC2.4 Gate 8: `sections === 2` for active G12 encoded the pre-fix
  // "active ? 2 : null" defect (see docs/audits/rio-resilience/
  // phase-v10-rc2-4-gate1-2-evidence-matrix-and-source-authority.md). G12
  // is not a dual-track grade (Gate 2 §2.3), so it no longer receives a
  // fixed/committed sections value — `null` is now correct: G12's turma
  // count is not derived anywhere (G7-G12 are fixed-FTE MS/HS staffing,
  // not section-driven — Gate 1 evidence matrix #4), so `null` correctly
  // means "not computed," not "unavailable data." This is an expectation
  // correction from stronger source evidence, not a weakened check —
  // gradeCapacity/studentsPerClass (which ARE still committed, workbook-
  // sourced constants) are unchanged.
  check(
    `${packageId}_grade12_activation_expected`,
    GOVERNED_DIRECT_YEARS.every((year) => {
      const record = GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.find(
        (item) => item.packageId === packageId && item.year === year && item.normalizedGradeId === "G12",
      );
      const shouldBeActive = packageId === "t1_g4" ? year >= 2036 : year >= 2034;
      return shouldBeActive
        ? record?.gradeCapacity === 50 && record.studentsPerClass === 25 && record.sections === null
        : record?.gradeCapacity === null && record.studentsPerClass === null && record.sections === null;
    }),
    packageId === "t1_g4" ? "G12 active from 2036" : "G12 active from 2034",
  );
  check(
    `${packageId}_terminal_capacity_is_746`,
    capacitySeries
      .slice(packageId === "t1_g4" ? 8 : 6)
      .every((capacity) => capacity === 746),
    JSON.stringify(capacitySeries),
  );
  check(
    `${packageId}_no_740_after_grade12_activation`,
    !capacitySeries
      .slice(packageId === "t1_g4" ? 8 : 6)
      .includes(740),
    JSON.stringify(capacitySeries),
  );
  check(
    `${packageId}_no_696_sum_after_grade12_activation`,
    GOVERNED_DIRECT_YEARS.slice(packageId === "t1_g4" ? 8 : 6).every((year) => {
      const gradeCapacity = GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS
        .filter((record) => record.packageId === packageId && record.year === year)
        .reduce((sum, record) => sum + (record.gradeCapacity ?? 0), 0);
      return gradeCapacity !== 696;
    }),
    "terminal active grade-capacity sum is no longer 696",
  );

  for (const scenarioId of GOVERNED_CAPTACAO_SCENARIO_IDS) {
    const sheet = parsed.workbook.Sheets[SCENARIO_SHEETS[scenarioId]];
    check(
      `${packageId}_${scenarioId}_scenario_sheet_present`,
      Boolean(sheet),
      SCENARIO_SHEETS[scenarioId],
    );
    check(
      `${packageId}_${scenarioId}_relevant_cells_are_static_outputs`,
      ["E7", "N26", "E31", "N31", "E33", "N33"].every((address) => cellFormula(sheet, address) === null),
      "checked E7,N26,E31,N31,E33,N33",
    );
    check(
      `${packageId}_${scenarioId}_2028_control_total`,
      appTotal(packageId, scenarioId, 2028) === EXPECTED_2028_TOTALS[packageId][scenarioId],
      String(appTotal(packageId, scenarioId, 2028)),
    );

    for (const [yearIndex, year] of GOVERNED_DIRECT_YEARS.entries()) {
      const appValues = appGradeValues(packageId, scenarioId, year);
      const workbookValues = workbookGradeValues(sheet, yearIndex);
      const total = appTotal(packageId, scenarioId, year);
      const perGradeSum = appValues.reduce((sum, value) => sum + (value ?? 0), 0);
      const capacity = getGovernedAvailableCapacity(packageId, year);
      const occupancy = getGovernedOccupancy(packageId, scenarioId, year);
      check(
        `${packageId}_${scenarioId}_${year}_grade_values_match_workbook`,
        JSON.stringify(appValues) === JSON.stringify(workbookValues),
        JSON.stringify(appValues),
      );
      check(
        `${packageId}_${scenarioId}_${year}_total_matches_workbook_and_grades`,
        total === workbookTotal(sheet, yearIndex) && total === perGradeSum,
        `total=${total}; workbook=${workbookTotal(sheet, yearIndex)}; grades=${perGradeSum}`,
      );
      check(
        `${packageId}_${scenarioId}_${year}_capacity_matches_approved_contract`,
        capacity === EXPECTED_CAPACITY[packageId][yearIndex],
        `app=${capacity}; approved=${EXPECTED_CAPACITY[packageId][yearIndex]}; workbookRow33=${workbookCapacity(sheet, yearIndex)}`,
      );
      check(
        `${packageId}_${scenarioId}_${year}_occupancy_is_derived`,
        capacity !== null && occupancy === total / capacity,
        `${total}/${capacity}=${occupancy}`,
      );
    }

    const receita = calculateReceita({
      openingPackageId: packageId,
      occupancyScenarioId: scenarioId,
      tuitionScenarioId: "bp1_division_differentiated",
    });
    const sections = calculateSectionCountsForScenario({ openingPackageId: packageId, occupancyScenarioId: scenarioId });
    check(`${packageId}_${scenarioId}_receita_handoff_uses_canonical_id`, receita.grainRecords.every((record) => record.occupancyScenarioId === scenarioId), `${receita.grainRecords.length} grain records`);
    check(`${packageId}_${scenarioId}_sections_handoff_uses_canonical_id`, sections.records.every((record) => record.occupancyScenarioId === scenarioId) && sections.diagnostics.length === 0, `${sections.records.length} section records; diagnostics=${sections.diagnostics.length}`);
  }
}

expectRejected("retired_pessimista_rejected_before_downstream", { openingPackageId: "t1_g4", occupancyScenarioId: "pessimista" }, "Retired occupancyScenarioId");
expectRejected("unknown_value_rejected_before_downstream", { openingPackageId: "t1_g6", occupancyScenarioId: "agressivo" }, "Unsupported occupancyScenarioId");
expectRejected("full_seat_rejected_before_downstream", { openingPackageId: "t1_g6", occupancyScenarioId: "full-seat" }, "Unsupported occupancyScenarioId");
expectRejected("g4_is_not_a_scenario_identifier", { openingPackageId: "t1_g6", occupancyScenarioId: "t1_g4" }, "Unsupported occupancyScenarioId");
check("legacy_input_not_reserialized", normalizeDreEnrollmentCapacityLeverInput({ openingPackageId: "t1_g4", occupancyScenarioId: "intermediario" }).occupancyScenarioId === "base", "intermediario -> base");
check(
  "state_hook_exports_active_axes_separately",
  readFileSync("src/hooks/useDreScenarioSimulator.ts", "utf8").includes("openingPackageId: OpeningPackageId;") &&
    readFileSync("src/hooks/useDreScenarioSimulator.ts", "utf8").includes("occupancyScenarioId: OccupancyScenarioId;"),
  "opening package and enrollment scenario are separate state fields",
);
check(
  "workbook_export_emits_canonical_scenario_id",
  readFileSync("src/components/dreSimulator/dreScenarioWorkbook.ts", "utf8").includes("selections.occupancyScenarioId") &&
    !readFileSync("src/components/dreSimulator/dreScenarioWorkbook.ts", "utf8").includes("intermediario:") &&
    !readFileSync("src/components/dreSimulator/dreScenarioWorkbook.ts", "utf8").includes("pessimista:"),
  "export source serializes selections.occupancyScenarioId with canonical labels",
);
check(
  "workbook_export_builder_available",
  typeof buildDreScenarioWorkbook === "function" && typeof useDreScenarioSimulator === "function",
  "export builder and simulator hook import without payroll/viability validation",
);
check(
  "no_grade12_capacity_44_fallback",
  GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.every(
    (record) => record.normalizedGradeId !== "G12" || record.gradeCapacity !== 44,
  ),
  "G12 never resolves to 44",
);
check(
  "no_active_capacity_740",
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.every((record) => record.availableCapacity !== 740),
  JSON.stringify(GOVERNED_AVAILABLE_CAPACITY_BY_YEAR.map((record) => record.availableCapacity)),
);

const passCount = checks.filter((item) => item.pass).length;
const failCount = checks.length - passCount;
console.log(JSON.stringify({ phase: "V10-E2", passCount, failCount, checks }, null, 2));
if (failCount > 0) process.exit(1);
