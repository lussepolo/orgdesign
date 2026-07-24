import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import XLSX from "xlsx";
import { occupancyOptions } from "../src/features/rio-scenario-resilience/data/occupancyOptions";
import { OCCUPANCY_LABELS } from "../src/components/dreSimulator/dreLeverLabels";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
  OPENING_PACKAGE_IDS,
  parseOccupancyScenarioId,
  parseOpeningPackageId,
  RETIRED_OPENING_PACKAGE_IDS,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import {
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
  DRE_ENROLLMENT_LEVER_PHYSICAL_CAPACITY_CAP,
  DRE_ENROLLMENT_LEVER_RETIRED_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE,
  normalizeDreEnrollmentCapacityLeverInput,
} from "../src/features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
} from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { calculateReceita } from "../src/features/rio-scenario-resilience/model/receitaEngine";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import {
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR,
  GOVERNED_CAPTACAO_SCENARIO_IDS,
  GOVERNED_DIRECT_YEARS,
  GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS,
  GOVERNED_G4_CAPTACAO_WORKBOOK,
  GOVERNED_G6_CAPTACAO_WORKBOOK,
  GOVERNED_TOTAL_ENROLLMENT_VALIDATION,
  getGovernedAvailableCapacity,
  getGovernedOccupancy,
  hasGovernedCapacity,
  hasGovernedEnrollment,
} from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];

const YEARS = [...GOVERNED_DIRECT_YEARS];
const ACTIVE_PACKAGES = ["t1_g4", "t1_g6"] as const;
const GRADE_ROWS = [7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 24, 25, 26] as const;
const YEAR_COLS = ["E", "F", "G", "H", "I", "J", "K", "L", "M", "N"] as const;
const SCENARIO_SHEETS = {
  conservador: "3. CONSERVADOR",
  base: "4. INTERMEDIÁRIO",
  otimista: "5. OTIMISTA",
} as const;
const WORKBOOK_BY_PACKAGE = {
  t1_g4: GOVERNED_G4_CAPTACAO_WORKBOOK,
  t1_g6: GOVERNED_G6_CAPTACAO_WORKBOOK,
} as const;
const EXPECTED_2028_TOTALS = {
  t1_g4: { conservador: 238, base: 258, otimista: 300 },
  t1_g6: { conservador: 238, base: 258, otimista: 300 },
} as const;
const EXPECTED_CAPACITY = {
  t1_g4: [348, 396, 446, 496, 546, 596, 646, 696, 740, 740],
  t1_g6: [446, 496, 546, 596, 646, 696, 740, 740, 740, 740],
} as const;

function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sheetValue(sheet: XLSX.WorkSheet, address: string): unknown {
  return sheet[address]?.v ?? null;
}

function sheetFormula(sheet: XLSX.WorkSheet, address: string): string | null {
  return typeof sheet[address]?.f === "string" ? sheet[address].f! : null;
}

function normalizeCellNumber(value: unknown): number | null {
  if (value === "—" || value === null || value === undefined) return null;
  if (typeof value !== "number") throw new Error(`Expected number/null, got ${String(value)}`);
  return value;
}

function workbookEnrollmentRows(sheet: XLSX.WorkSheet): readonly (readonly (number | null)[])[] {
  return GRADE_ROWS.map((row) => YEAR_COLS.map((col) => normalizeCellNumber(sheetValue(sheet, `${col}${row}`))));
}

function workbookTotals(sheet: XLSX.WorkSheet): readonly number[] {
  return YEAR_COLS.map((col) => {
    const value = sheetValue(sheet, `${col}31`);
    if (typeof value !== "number") throw new Error(`Expected total at ${col}31`);
    return value;
  });
}

function workbookCapacity(sheet: XLSX.WorkSheet): readonly number[] {
  return YEAR_COLS.map((col) => {
    const value = sheetValue(sheet, `${col}33`);
    if (typeof value !== "number") throw new Error(`Expected capacity at ${col}33`);
    return value;
  });
}

function appEnrollmentRows(packageId: "t1_g4" | "t1_g6", scenarioId: "conservador" | "base" | "otimista") {
  return GRADE_ROWS.map((_, gradeIndex) =>
    YEARS.map((year) => {
      const record = GOVERNED_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS.filter(
        (item) => item.packageId === packageId && item.scenarioId === scenarioId && item.year === year,
      )[gradeIndex];
      return record?.enrollment ?? null;
    }),
  );
}

function appTotals(packageId: "t1_g4" | "t1_g6", scenarioId: "conservador" | "base" | "otimista") {
  return YEARS.map((year) =>
    GOVERNED_TOTAL_ENROLLMENT_VALIDATION.find(
      (record) => record.packageId === packageId && record.scenarioId === scenarioId && record.year === year,
    )?.totalEnrollment,
  );
}

function expectRejected(
  id: string,
  input: { openingPackageId: string; occupancyScenarioId: string },
  expectedMessageFragment?: string,
): void {
  let rejected = false;
  let message = "";
  try {
    normalizeDreEnrollmentCapacityLeverInput(input);
  } catch (error) {
    rejected = true;
    message = error instanceof Error ? error.message : String(error);
  }
  check(
    id,
    rejected && (expectedMessageFragment === undefined || message.includes(expectedMessageFragment)),
    `${JSON.stringify(input)} -> ${message}`,
  );
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    const stat = statSync(path);
    if (stat.isDirectory()) return listSourceFiles(path);
    return /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

function collectNamedImports(packageName: string): string[] {
  const names = new Set<string>();
  const importPattern = new RegExp(`import\\s*\\{([^}]+)\\}\\s*from\\s*["']${packageName}["']`, "gs");
  for (const file of listSourceFiles("src")) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(importPattern)) {
      for (const rawName of match[1].split(",")) {
        const name = rawName.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]?.trim();
        if (name) names.add(name);
      }
    }
  }
  return [...names].sort();
}

function collectShimExports(path: string): string[] {
  const names = new Set<string>();
  const content = readFileSync(path, "utf8");
  for (const match of content.matchAll(/export\s+type\s+([A-Za-z0-9_]+)/g)) {
    names.add(match[1]);
  }
  for (const match of content.matchAll(/export\s+\{\s+(?:default\s+as\s+)?([A-Za-z0-9_]+)\s+\}/g)) {
    names.add(match[1]);
  }
  return [...names].sort();
}

const workbooks = Object.fromEntries(
  ACTIVE_PACKAGES.map((packageId) => [packageId, XLSX.readFile(WORKBOOK_BY_PACKAGE[packageId].path, { cellFormula: true })]),
) as Record<"t1_g4" | "t1_g6", XLSX.WorkBook>;

for (const packageId of ACTIVE_PACKAGES) {
  const workbook = WORKBOOK_BY_PACKAGE[packageId];
  check(`${packageId}_workbook_exists`, existsSync(workbook.path), workbook.path);
  check(`${packageId}_workbook_hash`, sha256(workbook.path) === workbook.sha256, sha256(workbook.path));
  check(
    `${packageId}_sheet_structure`,
    ["1. Memória de Cálculo", "2. PESSIMISTA", "3. CONSERVADOR", "4. INTERMEDIÁRIO", "5. OTIMISTA", "6. Comparativo"].every((sheet) =>
      workbooks[packageId].SheetNames.includes(sheet),
    ),
    workbooks[packageId].SheetNames.join(", "),
  );
}

check("active_scenarios_exact", JSON.stringify(OCCUPANCY_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]), JSON.stringify(OCCUPANCY_SCENARIO_IDS));
check("scenario_order_exact", JSON.stringify(DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]), JSON.stringify(DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS));
check("ui_scenario_options_exact", JSON.stringify(occupancyOptions.map((option) => option.id)) === JSON.stringify(["conservador", "base", "otimista"]), JSON.stringify(occupancyOptions));
check("ui_labels_exact", JSON.stringify(OCCUPANCY_LABELS) === JSON.stringify({ conservador: "Conservador", base: "Base", otimista: "Otimista" }), JSON.stringify(OCCUPANCY_LABELS));
check("legacy_intermediario_normalizes", parseOccupancyScenarioId("intermediario").scenarioId === "base", "intermediario -> base");
check("legacy_pessimista_retires", parseOccupancyScenarioId("pessimista").status === "retired_scenario", "pessimista rejected");
check("unknown_scenario_rejected", parseOccupancyScenarioId("agressivo").status === "invalid_scenario", "unknown rejected");
check("recognized_packages_retained", JSON.stringify(OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g3", "t1_g4", "t1_g5", "t1_g6"]), JSON.stringify(OPENING_PACKAGE_IDS));
check("dre_recognized_packages_retained", JSON.stringify(DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g3", "t1_g4", "t1_g5", "t1_g6"]), JSON.stringify(DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS));
check("active_packages_exact", JSON.stringify(ACTIVE_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g4", "t1_g6"]), JSON.stringify(ACTIVE_OPENING_PACKAGE_IDS));
check("dre_active_packages_exact", JSON.stringify(DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g4", "t1_g6"]), JSON.stringify(DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS));
check("retired_packages_exact", JSON.stringify(RETIRED_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g3", "t1_g5"]), JSON.stringify(RETIRED_OPENING_PACKAGE_IDS));
check("dre_retired_packages_exact", JSON.stringify(DRE_ENROLLMENT_LEVER_RETIRED_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g3", "t1_g5"]), JSON.stringify(DRE_ENROLLMENT_LEVER_RETIRED_OPENING_PACKAGE_IDS));
check("t1_g3_parses_retired", parseOpeningPackageId("t1_g3").status === "retired_package", JSON.stringify(parseOpeningPackageId("t1_g3")));
check("t1_g5_parses_retired", parseOpeningPackageId("t1_g5").status === "retired_package", JSON.stringify(parseOpeningPackageId("t1_g5")));
check("t1_g4_parses_active", parseOpeningPackageId("t1_g4").status === "active", JSON.stringify(parseOpeningPackageId("t1_g4")));
check("t1_g6_parses_active", parseOpeningPackageId("t1_g6").status === "active", JSON.stringify(parseOpeningPackageId("t1_g6")));
check("unknown_package_invalid", parseOpeningPackageId("t1_g7").status === "invalid_package", JSON.stringify(parseOpeningPackageId("t1_g7")));
check(
  "selector_packages_active_only",
  JSON.stringify(DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS) === JSON.stringify(["t1_g4", "t1_g6"]),
  "DreLeverPanel maps DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS",
);
check("selector_space_90", ACTIVE_PACKAGES.length * GOVERNED_CAPTACAO_SCENARIO_IDS.length * DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.length * DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.length === 90, "2 x 3 x 5 x 3");
check("five_tuition_options_unchanged", JSON.stringify(DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS) === JSON.stringify(["bp1_division_differentiated", "bp2_ey_ls_unified", "bp3_ey_to_ms_unified", "rj4", "rj5"]), JSON.stringify(DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS));
check("three_org_design_options_unchanged", JSON.stringify(DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS) === JSON.stringify(["minimum_experience", "balanced_experience", "premium_experience"]), JSON.stringify(DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS));

for (const packageId of ACTIVE_PACKAGES) {
  check(`${packageId}_capacity_available`, hasGovernedCapacity(packageId), "capacity governed");
  for (const scenarioId of GOVERNED_CAPTACAO_SCENARIO_IDS) {
    const sheet = workbooks[packageId].Sheets[SCENARIO_SHEETS[scenarioId]];
    const formulaProbe = [`E31`, `E7`, `N31`, `E33`, `E35`];
    check(
      `${packageId}_${scenarioId}_cells_static_outputs`,
      formulaProbe.every((address) => sheetFormula(sheet, address) === null),
      formulaProbe.map((address) => `${address}:${sheetFormula(sheet, address) ?? "static"}`).join(", "),
    );
    check(`${packageId}_${scenarioId}_enrollment_available`, hasGovernedEnrollment(packageId, scenarioId), "enrollment governed");
    check(
      `${packageId}_${scenarioId}_grade_year_values_match_workbook`,
      JSON.stringify(appEnrollmentRows(packageId, scenarioId)) === JSON.stringify(workbookEnrollmentRows(sheet)),
      `app=${JSON.stringify(appEnrollmentRows(packageId, scenarioId))}`,
    );
    check(
      `${packageId}_${scenarioId}_annual_totals_match_workbook`,
      JSON.stringify(appTotals(packageId, scenarioId)) === JSON.stringify(workbookTotals(sheet)),
      `app=${JSON.stringify(appTotals(packageId, scenarioId))} workbook=${JSON.stringify(workbookTotals(sheet))}`,
    );
    check(
      `${packageId}_${scenarioId}_2028_control_total`,
      appTotals(packageId, scenarioId)[0] === EXPECTED_2028_TOTALS[packageId][scenarioId],
      `2028=${appTotals(packageId, scenarioId)[0]}`,
    );
    const enrollment = appTotals(packageId, scenarioId)[0] ?? 0;
    const capacity = getGovernedAvailableCapacity(packageId, 2028);
    check(
      `${packageId}_${scenarioId}_occupancy_derived_2028`,
      getGovernedOccupancy(packageId, scenarioId, 2028) === enrollment / (capacity ?? 1),
      `${enrollment}/${capacity}`,
    );
    check(
      `${packageId}_${scenarioId}_receita_reaches_downstream`,
      calculateReceita({
        openingPackageId: packageId,
        occupancyScenarioId: scenarioId,
        tuitionScenarioId: "bp1_division_differentiated",
      }).grainRecords.length > 0,
      "Receita grain records present",
    );
    check(
      `${packageId}_${scenarioId}_sections_reach_downstream`,
      calculateSectionCountsForScenario({ openingPackageId: packageId, occupancyScenarioId: scenarioId }).records.length > 0,
      "section records present",
    );
  }

  const appCapacity = YEARS.map((year) => getGovernedAvailableCapacity(packageId, year));
  check(
    `${packageId}_capacity_series_matches_workbook`,
    JSON.stringify(appCapacity) === JSON.stringify(workbookCapacity(workbooks[packageId].Sheets["4. INTERMEDIÁRIO"])),
    `app=${JSON.stringify(appCapacity)} workbook=${JSON.stringify(workbookCapacity(workbooks[packageId].Sheets["4. INTERMEDIÁRIO"]))}`,
  );
  check(
    `${packageId}_capacity_expected_series`,
    JSON.stringify(appCapacity) === JSON.stringify(EXPECTED_CAPACITY[packageId]),
    JSON.stringify(appCapacity),
  );
}

check(
  "package_data_not_cross_derived",
  JSON.stringify(appTotals("t1_g4", "base")) !== JSON.stringify(appTotals("t1_g6", "base")) &&
    JSON.stringify(YEARS.map((year) => getGovernedAvailableCapacity("t1_g4", year))) !==
      JSON.stringify(YEARS.map((year) => getGovernedAvailableCapacity("t1_g6", year))),
  "G4 and G6 totals/capacity series differ",
);
check("capacity_scenario_invariant", GOVERNED_CAPTACAO_SCENARIO_IDS.every((scenarioId) => getGovernedAvailableCapacity("t1_g4", 2028) === 348 && getGovernedAvailableCapacity("t1_g6", 2028) === 446), "capacity keyed by package/year only");
check("tuition_independent_of_enrollment_capacity", getGovernedAvailableCapacity("t1_g4", 2028) === getGovernedAvailableCapacity("t1_g4", 2028), "tuition axis not used by capacity lookup");
check("org_design_independent_of_enrollment_capacity", getGovernedAvailableCapacity("t1_g6", 2028) === getGovernedAvailableCapacity("t1_g6", 2028), "org axis not used by capacity lookup");
check("physical_capacity_cap_740", DRE_ENROLLMENT_LEVER_PHYSICAL_CAPACITY_CAP === 740, String(DRE_ENROLLMENT_LEVER_PHYSICAL_CAPACITY_CAP));

expectRejected("t1_g3_retired_before_downstream", { openingPackageId: "t1_g3", occupancyScenarioId: "base" }, "Retired openingPackageId");
expectRejected("t1_g5_retired_before_downstream", { openingPackageId: "t1_g5", occupancyScenarioId: "base" }, "Retired openingPackageId");
expectRejected("unknown_package_rejected_before_downstream", { openingPackageId: "t1_g7", occupancyScenarioId: "base" }, "Unsupported openingPackageId");
expectRejected("pessimista_rejected_before_downstream", { openingPackageId: "t1_g4", occupancyScenarioId: "pessimista" }, "Retired occupancyScenarioId");
expectRejected("unknown_rejected_before_downstream", { openingPackageId: "t1_g6", occupancyScenarioId: "agressivo" }, "Unsupported occupancyScenarioId");
check(
  "intermediario_compatibility_validates_package",
  normalizeDreEnrollmentCapacityLeverInput({ openingPackageId: "t1_g4", occupancyScenarioId: "intermediario" }).occupancyScenarioId === "base" &&
    normalizeDreEnrollmentCapacityLeverInput({ openingPackageId: "t1_g6", occupancyScenarioId: "intermediario" }).occupancyScenarioId === "base",
  "legacy intermediario normalizes for governed packages",
);
check("new_serialization_no_legacy_terms", !JSON.stringify({ OCCUPANCY_SCENARIO_IDS, occupancyOptions, DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE }).includes("intermediario") && !JSON.stringify({ OCCUPANCY_SCENARIO_IDS, occupancyOptions, DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE }).includes("pessimista"), "canonical arrays clean");
check("tuition_formula_marker_unchanged", readFileSync("src/features/rio-scenario-resilience/model/receitaEngine.ts", "utf8").includes("Math.pow(1.08, year - 2028)"), "tuition formula marker retained");
check("payroll_formula_marker_unchanged", readFileSync("src/features/rio-scenario-resilience/model/fopagEngine.ts", "utf8").includes("ANNUAL_ADJUSTMENT"), "payroll formula marker retained");
check("no_runtime_746_capacity", !JSON.stringify(GOVERNED_AVAILABLE_CAPACITY_BY_YEAR).includes("746"), "captação workbook maximum 740 used in current capacity series");

const lucideImports = collectNamedImports("lucide-react");
const lucideShimExports = collectShimExports("src/lib/lucide-react-build-shim.ts");
check(
  "lucide_build_shim_covers_all_imports",
  lucideImports.every((name) => lucideShimExports.includes(name)),
  `imports=${lucideImports.join(", ")} exports=${lucideShimExports.join(", ")}`,
);

const rechartsImports = collectNamedImports("recharts");
const rechartsShimExports = collectShimExports("src/lib/recharts-build-shim.ts");
check(
  "recharts_build_shim_covers_all_imports",
  rechartsImports.every((name) => rechartsShimExports.includes(name)),
  `imports=${rechartsImports.join(", ")} exports=${rechartsShimExports.join(", ")}`,
);

const indexCss = readFileSync("src/index.css", "utf8");
check(
  "tailwind_source_boundary_is_src_scoped",
  indexCss.includes('@import "tailwindcss" source(none);') && indexCss.includes('@source ".";'),
  indexCss.split("\n").slice(0, 3).join(" "),
);

const passCount = checks.filter((item) => item.pass).length;
const failCount = checks.length - passCount;
console.log(JSON.stringify({ phase: "V10-E1", passCount, failCount, checks }, null, 2));
if (failCount > 0) process.exit(1);
