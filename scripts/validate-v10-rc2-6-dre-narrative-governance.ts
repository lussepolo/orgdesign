import { execSync } from "child_process";
import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import {
  DRE_ACTIVE_COMBINATION_COUNT,
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  DRE_ACTIVE_LEVER_COUNTS,
  DRE_HISTORICAL_GOVERNANCE_ITEMS,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";
import {
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
} from "../src/features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
} from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { buildBoardReadableExplanation } from "../src/components/dreSimulator/DreBoardReadableExport";

let passCount = 0;
let failCount = 0;

function check(label: string, pass: boolean, note?: string) {
  if (pass) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    if (note) console.log(`      ${note}`);
  }
}

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function gitDiffNameOnly(): readonly string[] {
  const out = execSync("git diff --name-only", { encoding: "utf8" }).trim();
  return out.length === 0 ? [] : out.split("\n");
}

function gitDiffForPath(path: string): string {
  return execSync(`git diff -- ${path}`, { encoding: "utf8" });
}

const displayFiles = [
  "src/components/dreSimulator/DreScenarioContextBanner.tsx",
  "src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx",
  "src/components/dreSimulator/DreScopeBoundaryPanel.tsx",
  "src/components/dreSimulator/DreGovernanceSummaryPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/i18n/pt-BR.ts",
  "src/i18n/en-US.ts",
];

const displayText = displayFiles.map(read).join("\n");
const workspaceRegistryText = read("src/config/workspaceRegistry.ts");
const ptLocaleText = read("src/i18n/pt-BR.ts");
const enLocaleText = read("src/i18n/en-US.ts");
const activeKeys = DRE_ACTIVE_GOVERNANCE_ITEMS.map((item) => item.key);
const activeInternalIds = new Set(DRE_ACTIVE_GOVERNANCE_ITEMS.flatMap((item) => item.internalIds));
const historicalInternalIds = new Set(DRE_HISTORICAL_GOVERNANCE_ITEMS.flatMap((item) => item.internalIds));

console.log("\nSection A — Runtime active lever model");

const runtimeCombinationCount =
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS.length *
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.length *
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.length *
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.length;

check("active_opening_package_count_is_2", DRE_ACTIVE_LEVER_COUNTS.openingPackages === 2);
check("active_captacao_scenario_count_is_3", DRE_ACTIVE_LEVER_COUNTS.captacaoScenarios === 3);
check("active_tuition_scenario_count_is_5", DRE_ACTIVE_LEVER_COUNTS.tuitionScenarios === 5);
check("active_org_design_count_is_3", DRE_ACTIVE_LEVER_COUNTS.orgDesignOptions === 3);
check(
  "active_combination_count_matches_cartesian_product",
  DRE_ACTIVE_COMBINATION_COUNT === runtimeCombinationCount && DRE_ACTIVE_COMBINATION_COUNT === 90,
  `${DRE_ACTIVE_COMBINATION_COUNT} vs ${runtimeCombinationCount}`,
);

console.log("\nSection B — Active governance model");

check("active_items_count_is_model_derived_7", DRE_ACTIVE_GOVERNANCE_ITEMS.length === 7);
check("active_items_exclude_f05", !activeInternalIds.has("F05") && !activeKeys.includes("enrollment_baseline_parity"));
check(
  "active_items_exclude_f01_formula_gap",
  !activeKeys.includes("outras_receitas_reajuste") && !activeKeys.includes("outras_receitas_reajuste_formula_gap"),
);
check("historical_items_include_f01", historicalInternalIds.has("F01"));
check("historical_items_include_f05", historicalInternalIds.has("F05"));

const corporateItem = DRE_ACTIVE_GOVERNANCE_ITEMS.find((item) => item.key === "corporate_allocation_unavailable");
check(
  "corporate_allocation_is_unavailable_capability_not_engine_blocker",
  corporateItem?.classifications.includes("capability_unavailable") === true &&
    corporateItem.blocksEngineCalculation === false &&
    corporateItem.boardRatificationStatus === "not_required",
);

console.log("\nSection C — Display-source stale wording guards");

check("no_obsolete_108_display_wording", !/108 combina|All 108|108 combinations/i.test(displayText));
check(
  "no_blanket_v8_source_truth_statement",
  !/v8 PnL\/DRE workbook is the source of truth|A planilha v8 PnL\/DRE é a fonte da verdade|Fonte v8 PnL\/DRE|v8 PnL\/DRE source/.test(displayText),
);
check(
  "dre_workspace_not_canonical_source_truth",
  /id:\s*"dre-scenario-simulator"[\s\S]*?status:\s*"simulation"/.test(workspaceRegistryText),
);
check(
  "dre_workspace_impact_no_single_source_truth",
  !/wsDreImpact:\s*["'][^"']*(Single source of truth|Fonte única de verdade)/.test(enLocaleText + "\n" + ptLocaleText),
);
check("no_active_228_vs_246_warning", !/228 vs 246|Mapeamento de cenário 228/.test(displayText));
check("board_export_imports_active_model", read("src/components/dreSimulator/DreBoardReadableExport.tsx").includes("DRE_ACTIVE_GOVERNANCE_ITEMS"));
check(
  "board_export_has_no_hardcoded_f01_f06_list",
  !/\["F01",\s*"F03",\s*"F04",\s*"F05",\s*"F06"\]/.test(read("src/components/dreSimulator/DreBoardReadableExport.tsx")),
);

console.log("\nSection D — Board-readable export locale and caveats");

const scenario = {
  openingPackageId: "t1_g6" as const,
  occupancyScenarioId: "base" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience" as const,
};
const output = calculateDre(scenario);
const ptExport = buildBoardReadableExplanation(scenario, output, "pt-BR");
const enExport = buildBoardReadableExplanation(scenario, output, "en-US");

check("pt_export_uses_pt_heading", ptExport.includes("RESUMO DO CENÁRIO"));
check("en_export_uses_en_heading", enExport.includes("SCENARIO SUMMARY"));
check("pt_export_has_active_limitation_count", ptExport.includes(`(${DRE_ACTIVE_GOVERNANCE_ITEMS.length})`));
check("en_export_has_active_limitation_count", enExport.includes(`(${DRE_ACTIVE_GOVERNANCE_ITEMS.length})`));
check("board_export_excludes_internal_f_ids", !/\bF0[1-6]\b|D-R5|D-R6|CORPORATE-ALLOCATION/.test(ptExport + "\n" + enExport));
check("board_export_excludes_retired_t1g3_warning", !/228|246|t1_g3/.test(ptExport + "\n" + enExport));

console.log("\nSection E — Prohibited calculation-file diff guard");

const changedFiles = gitDiffNameOnly();
const dreEnginePath = "src/features/rio-scenario-resilience/model/dreEngine.ts";
const dreEngineDiff = changedFiles.includes(dreEnginePath) ? gitDiffForPath(dreEnginePath) : "";
const dreEngineAddedLines = dreEngineDiff
  .split("\n")
  .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
  .map((line) => line.slice(1));
const dreEngineRemovedLines = dreEngineDiff
  .split("\n")
  .filter((line) => line.startsWith("-") && !line.startsWith("---"))
  .map((line) => line.slice(1));
const allowedDreEngineAddedLines = new Set([
  'import { calculateDreTurmaDriver } from "./dreTurmaDriver";',
  "",
  "  const turmaOutput = calculateDreTurmaDriver({",
  "    openingPackageId: input.openingPackageId,",
  "    occupancyScenarioId: input.occupancyScenarioId,",
  "  });",
  "  const turmasByYear = new Map(",
  "    turmaOutput.yearTotals.map((record) => [record.year, record.numeroDeTurmas]),",
  "  );",
  "      numero_de_turmas: turmasByYear.get(year) ?? 0,",
]);
const dreEngineChangeIsOnlyTurmaDriver =
  !changedFiles.includes(dreEnginePath) ||
  (dreEngineRemovedLines.length === 1 &&
    dreEngineRemovedLines[0] === "      numero_de_turmas: null," &&
    dreEngineAddedLines.every((line) => allowedDreEngineAddedLines.has(line)));
const prohibitedPrefixes = [
  "src/features/rio-scenario-resilience/model/fopagEngine.ts",
  "src/features/rio-scenario-resilience/model/receitaEngine.ts",
  "src/features/rio-scenario-resilience/model/payrollAdapter.ts",
  "src/features/rio-scenario-resilience/model/tuitionSourceData.ts",
  "src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts",
  "src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData.ts",
  "src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData.ts",
  "src/features/rio-scenario-resilience/model/orgDesignPayrollActivation.ts",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts",
];
const prohibitedChanged = changedFiles.filter((file) => prohibitedPrefixes.includes(file));
check(
  "no_prohibited_financial_or_runtime_source_files_changed",
  prohibitedChanged.length === 0 && dreEngineChangeIsOnlyTurmaDriver,
  [...prohibitedChanged, ...(dreEngineChangeIsOnlyTurmaDriver ? [] : [dreEnginePath])].join(", "),
);
check("canonical_numeric_smoke_outputs_are_finite", Number.isFinite(output.byYear[2028].ebitda) && Number.isFinite(output.byYear[2037].ebitda));

const total = passCount + failCount;
console.log(`\n${failCount === 0 ? "✓" : "✗"} V10-RC2.6 DRE narrative governance: ${passCount}/${total} pass, ${failCount} fail`);

if (failCount > 0) {
  process.exitCode = 1;
}
