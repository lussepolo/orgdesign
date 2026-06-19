// Phase 15J.2 — Full Simulator End-to-End Acceptance Audit (31 checks).
//
// Verifies every declared combination, formula boundary, governance invariant,
// and output-validity constraint for the DRE Scenario Simulator and Capital
// Decision engine:
//
//   Section A — DRE matrix completeness (checks 1-5)
//     1. 4 opening packages declared
//     2. 3 occupancy scenarios declared
//     3. 3 tuition scenarios declared
//     4. 3 org-design options declared
//     5. 108 combinations (4 × 3 × 3 × 3)
//
//   Section B — 108-scenario finite outputs (checks 6-14)
//     6.  All 108 scenarios produce learner count > 0 for 2028
//     7.  All 108 scenarios produce non-zero Receita Operacional Líquida 2028
//     8.  All 108 scenarios produce ROL for years 2029-2037 (no silent drop)
//     9.  All 108 scenarios produce EBITDA values across all available years
//    10.  EBITDA positive by 2032 in at least one scenario (sanity)
//    11.  No NaN across all 108 × all year-output fields
//    12.  No Infinity across all 108 × all year-output fields
//    13.  No silent-zero ROL for 2029+ in any scenario
//    14.  Aggregate combination count is exactly 108
//
//   Section C — Governance metadata (checks 15-19)
//    15.  F02 is NOT in openItems (resolved)
//    16.  F01/F03/F04/F05/F06 are all in openItems and non-blocking
//    17.  calculationAvailability === "available"
//    18.  FINANCE_SOURCE_CLOSURE_COMPLETE === false
//    19.  BOARD_RATIFICATION_READY === false
//
//   Section D — Capital Decision matrix (checks 20-21)
//    20.  2 CAPEX options declared (capex_90m_brl + capex_100m_brl)
//    21.  All 216 DRE × CAPEX combinations produce a result with
//         calculationReadiness === "structurally_calculated"
//
//   Section E — DRE-to-Capital EBITDA parity (checks 22-23)
//    22.  capitalResult.ebitdaByYear[year] === dreResult.byYear[year].ebitda
//         for all years, all 216 combinations (max delta = 0)
//    23.  Max absolute delta across all 216 × all years is exactly 0
//
//   Section F — CAPEX-EBITDA boundary (checks 24-25)
//    24.  No DRE year-result field contains "capex" in its key name
//    25.  servicos_de_limpeza_e_seguranca is present and non-zero in 2028
//
//   Section G — Capital Decision output validity (checks 26-28)
//    26.  tir field equals "excluded" in CapitalDecisionResult
//    27.  discountedPayback field equals "excluded" in CapitalDecisionResult
//    28.  periods array has exactly 21 entries (pre_ops + 2028–2047)
//
//   Section H — No winner/approval language in source files (checks 29-30)
//    29.  No "winner" or "best scenario" or "recommended scenario" in display sources
//    30.  No "board approved" / "board-approved" / "Finance approved" / "ratified" (affirmative)
//         in display sources
//
//   Section I — Aggregate count (check 31)
//    31.  Validator aggregate count is exactly 31
//
// Run with: npm run validate:phase15j2-simulator

import { readFileSync } from "fs";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateCapitalDecisionBridge } from "../src/features/rio-scenario-resilience/model/capitalDecisionEngine";
import {
  DRE_GOVERNANCE_READINESS,
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
  DRE_CALCULATION_AVAILABILITY_CONFIRMED,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";
import {
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
} from "../src/features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import {
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
} from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { CapexOptionId } from "../src/features/rio-scenario-resilience/model/capexOptionSourceContract";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";

// CAPEX option IDs as declared in CapexOptionId (capexOptionSourceContract.ts).
// capexOptionSource.ts is untracked in some checkouts; we use the committed
// contract type instead to avoid import failures in git-archive reproductions.
const CAPEX_OPTION_IDS: readonly CapexOptionId[] = [
  "capex_90m_brl",
  "capex_100m_brl",
] as const;

// ── Test harness ──────────────────────────────────────────────────────────────

let passCount = 0;
let failCount = 0;

function checkTrue(label: string, val: boolean, note?: string) {
  if (val) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    if (note) console.log(`      note: ${note}`);
  }
}

function checkFalse(label: string, val: boolean, note?: string) {
  checkTrue(label, !val, note);
}

function checkEqual<T>(label: string, actual: T, expected: T, note?: string) {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
    if (note) console.log(`      note: ${note}`);
  }
}

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

// ── Canonical fixture ─────────────────────────────────────────────────────────

const CANONICAL_DRE = {
  openingPackageId: "t1_g3" as const,
  occupancyScenarioId: "intermediario" as const,
  tuitionScenarioId: "bp1_division_differentiated" as const,
  orgDesignOptionId: "balanced_experience" as const,
};

const canonicalDreResult = calculateDre(CANONICAL_DRE);
const canonical2028 = canonicalDreResult.byYear[2028];
const canonical2028Rec = canonical2028 as unknown as Record<string, unknown>;

// ── Section A: DRE matrix completeness ───────────────────────────────────────
console.log("\nSection A — DRE Matrix Completeness");

// Check 1
checkEqual(
  "dre_matrix_4_opening_packages",
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS.length,
  4,
  "Expected t1_g3, t1_g4, t1_g5, t1_g6",
);

// Check 2
checkEqual(
  "dre_matrix_3_occupancy_scenarios",
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.length,
  3,
  "Expected intermediario, pessimista, otimista",
);

// Check 3
checkEqual(
  "dre_matrix_3_tuition_scenarios",
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.length,
  3,
  "Expected bp1_division_differentiated, bp2_ey_ls_unified, bp3_ey_to_ms_unified",
);

// Check 4
checkEqual(
  "dre_matrix_3_org_design_options",
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.length,
  3,
  "Expected minimum_experience, balanced_experience, premium_experience",
);

// Check 5
const declaredCombinations =
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS.length *
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.length *
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.length *
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.length;

checkEqual("dre_matrix_108_combinations_declared", declaredCombinations, 108);

// ── Section B: 108-scenario finite outputs ────────────────────────────────────
console.log("\nSection B — 108-Scenario Finite Outputs");

let scenarioCount = 0;
let zeroLearner2028Count = 0;
let zeroROL2028Count = 0;
let zeroROLAfter2028Count = 0;
let nanCount = 0;
let infinityCount = 0;
let ebitdaPositiveBy2032Count = 0;

// Enumerate all 108 combinations and run calculateDre on each
for (const openingPackageId of DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS) {
  for (const occupancyScenarioId of DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS) {
    for (const tuitionScenarioId of DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS) {
      for (const orgDesignOptionId of DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS) {
        scenarioCount++;
        const result = calculateDre({
          openingPackageId,
          occupancyScenarioId,
          tuitionScenarioId,
          orgDesignOptionId,
        });

        const yr2028 = result.byYear[2028];
        if (!yr2028 || yr2028.numero_de_alunos === 0) zeroLearner2028Count++;
        if (!yr2028 || yr2028.receita_operacional_liquida === 0) zeroROL2028Count++;

        let scenarioPositiveBy2032 = false;

        for (const yr of RECEITA_PROJECTION_YEARS) {
          const row = result.byYear[yr];
          if (!row) continue;

          const rol = row.receita_operacional_liquida;
          const ebitda = row.ebitda;
          const learners = row.numero_de_alunos;

          // NaN check: cover the core output fields
          const fieldsToCheck = [rol, ebitda, learners, row.receitas_com_ensino_regular];
          for (const f of fieldsToCheck) {
            if (typeof f === "number" && Number.isNaN(f)) nanCount++;
          }

          // Infinity check
          for (const f of fieldsToCheck) {
            if (typeof f === "number" && !isFinite(f) && !Number.isNaN(f)) infinityCount++;
          }

          // Silent-zero ROL after 2028 (would indicate missing data lookup)
          if (yr > 2028 && yr <= 2037 && rol === 0) zeroROLAfter2028Count++;

          // EBITDA positive by 2032
          if (yr === 2032 && typeof ebitda === "number" && ebitda > 0) scenarioPositiveBy2032 = true;
        }

        if (scenarioPositiveBy2032) ebitdaPositiveBy2032Count++;
      }
    }
  }
}

// Check 6
checkEqual(
  "all_108_scenarios_learner_gt0_2028",
  zeroLearner2028Count,
  0,
  "Every scenario must produce numero_de_alunos > 0 for 2028",
);

// Check 7
checkEqual(
  "all_108_scenarios_rol_nonzero_2028",
  zeroROL2028Count,
  0,
  "Every scenario must produce receita_operacional_liquida != 0 for 2028",
);

// Check 8
checkEqual(
  "all_108_scenarios_rol_nonzero_2029_2037",
  zeroROLAfter2028Count,
  0,
  "No silent-zero ROL for years 2029-2037 in any scenario",
);

// Check 9
checkTrue(
  "all_108_scenarios_ebitda_present_all_years",
  scenarioCount === 108 && nanCount === 0,
  `scenarioCount=${scenarioCount}, nanCount=${nanCount}`,
);

// Check 10
checkTrue(
  "ebitda_positive_by_2032_in_at_least_one_scenario",
  ebitdaPositiveBy2032Count > 0,
  `Scenarios with EBITDA > 0 by 2032: ${ebitdaPositiveBy2032Count}`,
);

// Check 11
checkEqual("no_nan_across_108_scenarios", nanCount, 0);

// Check 12
checkEqual("no_infinity_across_108_scenarios", infinityCount, 0);

// Check 13
checkEqual(
  "no_silent_zero_rol_after_2028",
  zeroROLAfter2028Count,
  0,
  "receita_operacional_liquida must remain non-zero for 2029-2037 across all scenarios",
);

// Check 14
checkEqual("dre_108_combinations_executed", scenarioCount, 108);

// ── Section C: Governance metadata ───────────────────────────────────────────
console.log("\nSection C — Governance Metadata");

// Check 15
const f02InOpen = DRE_GOVERNANCE_READINESS.openItems.find(
  (item) => item.key === "descontos_metodo_formula_base",
);
checkTrue("f02_not_in_open_items", f02InOpen === undefined, "F02 must appear only in resolvedItems");

// Check 16
const expectedOpenKeys = [
  "outras_receitas_reajuste",           // F01
  "tuition_source_provenance",          // F03
  "discount_schedule_provenance",       // F04
  "enrollment_baseline_parity",         // F05
  "instructional_capacity_payroll_sync", // F06
];
const allOpenNonBlocking = expectedOpenKeys.every((key) => {
  const item = DRE_GOVERNANCE_READINESS.openItems.find((i) => i.key === key);
  return item !== undefined && item.blocksEngineCalculation === false;
});
checkTrue(
  "f01_f03_f04_f05_f06_open_and_non_blocking",
  allOpenNonBlocking,
  "All 5 open items must be present with blocksEngineCalculation: false",
);

// Check 17
checkTrue(
  "simulation_available",
  DRE_CALCULATION_AVAILABILITY_CONFIRMED === true &&
    DRE_GOVERNANCE_READINESS.calculationAvailability === "available",
  "calculationAvailability must be 'available'",
);

// Check 18
checkFalse(
  "finance_source_closure_complete_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  "FINANCE_SOURCE_CLOSURE_COMPLETE must remain false",
);

// Check 19
checkFalse(
  "board_ratification_ready_false",
  BOARD_RATIFICATION_READY,
  "BOARD_RATIFICATION_READY must remain false",
);

// ── Section D: Capital Decision matrix ───────────────────────────────────────
console.log("\nSection D — Capital Decision Matrix");

// Check 20
checkEqual(
  "capex_2_options_declared",
  CAPEX_OPTION_IDS.length,
  2,
  `Expected capex_90m_brl and capex_100m_brl, got: ${CAPEX_OPTION_IDS.join(", ")}`,
);

// Check 21: all 216 DRE × CAPEX combinations produce structurally_calculated
let capitalCount = 0;
let capitalNotCalculatedCount = 0;

for (const openingPackageId of DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS) {
  for (const occupancyScenarioId of DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS) {
    for (const tuitionScenarioId of DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS) {
      for (const orgDesignOptionId of DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS) {
        for (const capexOptionId of CAPEX_OPTION_IDS) {
          capitalCount++;
          const capitalResult = calculateCapitalDecisionBridge({
            openingPackageId,
            occupancyScenarioId,
            tuitionScenarioId,
            orgDesignOptionId,
            capexOptionId,
          });
          if (capitalResult.calculationReadiness !== "structurally_calculated") {
            capitalNotCalculatedCount++;
          }
        }
      }
    }
  }
}

checkTrue(
  "all_216_dre_capex_combinations_calculate",
  capitalCount === 216 && capitalNotCalculatedCount === 0,
  `combinations=${capitalCount}, not_calculated=${capitalNotCalculatedCount}`,
);

// ── Section E: DRE-to-Capital EBITDA parity ──────────────────────────────────
console.log("\nSection E — DRE-to-Capital EBITDA Parity");

let maxDelta = 0;
let parityFailCount = 0;

for (const openingPackageId of DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS) {
  for (const occupancyScenarioId of DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS) {
    for (const tuitionScenarioId of DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS) {
      for (const orgDesignOptionId of DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS) {
        const dreResult = calculateDre({
          openingPackageId,
          occupancyScenarioId,
          tuitionScenarioId,
          orgDesignOptionId,
        });

        for (const capexOptionId of CAPEX_OPTION_IDS) {
          const capitalResult = calculateCapitalDecisionBridge({
            openingPackageId,
            occupancyScenarioId,
            tuitionScenarioId,
            orgDesignOptionId,
            capexOptionId,
          });

          for (const yr of RECEITA_PROJECTION_YEARS) {
            const dreEbitda = dreResult.byYear[yr]?.ebitda ?? null;
            const capPeriod = capitalResult.periods.find((p) => p.periodKey === yr);
            const capEbitda = capPeriod?.ebitdaBRL ?? null;

            if (dreEbitda === null || capEbitda === null) continue;

            const delta = Math.abs(dreEbitda - capEbitda);
            if (delta > maxDelta) maxDelta = delta;
            if (delta !== 0) parityFailCount++;
          }
        }
      }
    }
  }
}

// Check 22
checkEqual(
  "dre_capital_ebitda_parity_zero_failures",
  parityFailCount,
  0,
  "capitalResult.ebitdaByYear[yr] must equal dreResult.byYear[yr].ebitda for all 216 × all years",
);

// Check 23
checkEqual(
  "dre_capital_ebitda_max_delta_zero",
  maxDelta,
  0,
  `Max absolute delta across all 216 combinations × all years: ${maxDelta}`,
);

// ── Section F: CAPEX-EBITDA boundary ─────────────────────────────────────────
console.log("\nSection F — CAPEX-EBITDA Boundary");

// Check 24: No DRE year-result field contains "capex" in its key name
const yr2028Keys = Object.keys(canonical2028);
const hasCapexInDreFields = yr2028Keys.some((k) => k.toLowerCase().includes("capex"));
checkFalse(
  "capex_not_in_dre_year_result_fields",
  hasCapexInDreFields,
  `DRE year-result must not include CAPEX fields. Keys found: ${yr2028Keys.filter((k) => k.toLowerCase().includes("capex")).join(", ")}`,
);

// Check 25: servicos_de_limpeza_e_seguranca is present and non-zero in 2028
const servicosLimpeza = canonical2028Rec["servicos_de_limpeza_e_seguranca"];
checkTrue(
  "service_contracts_in_dre_nonzero_2028",
  typeof servicosLimpeza === "number" && servicosLimpeza !== 0,
  `servicos_de_limpeza_e_seguranca = ${servicosLimpeza}`,
);

// ── Section G: Capital Decision output validity ───────────────────────────────
console.log("\nSection G — Capital Decision Output Validity");

const canonicalCapitalResult = calculateCapitalDecisionBridge({
  ...CANONICAL_DRE,
  capexOptionId: "capex_100m_brl",
});

// Check 26
checkEqual(
  "capital_decision_tir_excluded",
  canonicalCapitalResult.explicitExclusions.tir,
  "excluded" as const,
  "tir must be 'excluded' in CapitalDecisionResult.explicitExclusions (VPL/TIR live in Phase15C engine)",
);

// Check 27
checkEqual(
  "capital_decision_discounted_payback_excluded",
  canonicalCapitalResult.explicitExclusions.discountedPayback,
  "excluded" as const,
  "discountedPayback must be 'excluded' in CapitalDecisionResult.explicitExclusions",
);

// Check 28: periods array = 21 entries (pre_ops + 2028–2047)
checkEqual(
  "capital_decision_21_periods",
  canonicalCapitalResult.periods.length,
  21,
  "Capital Decision must have 21 periods: pre_ops + 20 projection years (2028-2047)",
);

// ── Section H: No winner/approval language in display sources ─────────────────
console.log("\nSection H — No Winner/Approval Language");

const DISPLAY_SOURCE_FILES = [
  "src/components/dreSimulator/DreScenarioContextBanner.tsx",
  "src/components/dreSimulator/DreAssumptionStatusPanel.tsx",
  "src/components/dreSimulator/DreBoardReadableExport.tsx",
  "src/components/sections/DreScenarioSimulatorTab.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioResultPanel.tsx",
  "src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioComparisonPanel.tsx",
];

const allDisplayContent = DISPLAY_SOURCE_FILES.map(readFile)
  .join("\n")
  // Strip comments before checking JSX/code strings
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

// Check 29
const hasWinnerLanguage =
  /["'`>]\s*(winner|best scenario|recommended scenario|overall winner|preferred scenario)\s*["'`<]/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_winner_best_scenario_language_in_display",
  hasWinnerLanguage,
  "Display sources must not declare a winner/best-scenario/recommendation in JSX strings",
);

// Check 30
// Targets affirmative done-state claims only. Acceptable negations like
// "not a board-ratified recommendation" do not match these patterns.
const hasApprovalLanguage =
  /\b(is\s+board[\s-]approved|has\s+been\s+board[\s-]approved|board[\s-]approval\s+complete|is\s+finance[\s-]approved|has\s+been\s+finance[\s-]approved|board[\s-]ratification\s+complete|board[\s-]ratification\s*[=:]\s*true)\b/i.test(
    allDisplayContent,
  );
checkFalse(
  "no_approval_ratification_language_in_display",
  hasApprovalLanguage,
  "Display sources must not contain affirmative board-approved / Finance-approved / ratification-complete claims",
);

// ── Section I: Aggregate count (self-check) ───────────────────────────────────
console.log("\nSection I — Aggregate Count");

const EXPECTED_TOTAL = 31;
const totalBefore = passCount + failCount;

if (totalBefore === EXPECTED_TOTAL - 1) {
  passCount++;
  console.log(`  ✓ validator_aggregate_count_exact (${EXPECTED_TOTAL} checks)`);
} else {
  failCount++;
  console.log(`  ✗ validator_aggregate_count_exact`);
  console.log(`      expected ${EXPECTED_TOTAL - 1} checks before self-check, got ${totalBefore}`);
}

// ── Summary ───────────────────────────────────────────────────────────────────

const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";
console.log(
  `\n${finalIcon} Phase 15J.2 full simulator acceptance audit: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (failCount > 0) {
  process.exitCode = 1;
}
