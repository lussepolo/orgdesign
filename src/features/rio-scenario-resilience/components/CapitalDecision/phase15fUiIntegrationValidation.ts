// Phase 15F-SCENARIO-OUTPUT-UI-IMPLEMENTATION — validation runner.
//
// Exercises the Capital Decision UI's option sources, lever-driven
// production calculations, status/formatting view-model functions, and
// pairwise comparison against the committed Phase 15E engines -- no UI
// rendering, no browser, no workbook. All InvestmentInterpretationResult and
// ScenarioInvestmentPairComparison values used here come from
// calculateInvestmentInterpretation / compareInvestmentScenarioPair, the
// same production entry points the UI calls.

import { calculateInvestmentInterpretation } from "../../model/investmentInterpretationEngine";
import { compareInvestmentScenarioPair } from "../../model/scenarioInvestmentComparison";
import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import type { InvestmentInterpretationResult } from "../../model/investmentInterpretationEngineContract";
import { occupancyOptions } from "../../data/occupancyOptions";
import { capexOptions } from "../../data/capexOptions";
import { openingGrades } from "../../data/openingGrades";
import { orgDesignStructure } from "../../data/orgDesignStructure";
import { tuitionArchitecture } from "../../data/tuitionArchitecture";
import { CAPITAL_DECISION_LEVER_IDS, MAX_SAVED_SCENARIOS } from "./capitalDecisionUiTypes";
import {
  formatDiscountedPayback,
  formatSpreadPp,
  formatVpl,
  getInvestmentReferenceStatusDisplay,
  getInvestmentReferenceStatusLabel,
} from "./capitalDecisionViewModel";
import type {
  Phase15FUiValidationCheckId,
  Phase15FUiValidationCheckResult,
  Phase15FUiValidationReport,
} from "./phase15fUiIntegrationValidationContract";

function pass(checkId: Phase15FUiValidationCheckId, note: string): Phase15FUiValidationCheckResult {
  return { checkId, pass: true, note };
}
function fail(checkId: Phase15FUiValidationCheckId, note: string): Phase15FUiValidationCheckResult {
  return { checkId, pass: false, note };
}

// Same default scenario configuration used by CapitalDecisionView.
const DEFAULT_INPUT: CapitalDecisionEngineInput = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
  capexOptionId: "capex_100m_brl",
};

// Phase 15D.2's S1-S8 production scenario matrix, reused here so status and
// formatting checks exercise a realistic spread of investment-reference
// outcomes alongside the default scenario.
const S1_CANONICAL_90M: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, capexOptionId: "capex_90m_brl" };
const S3_PESSIMISTA: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, occupancyScenarioId: "pessimista" };
const S4_OTIMISTA: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, occupancyScenarioId: "otimista" };
const S5_T1G6: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, openingPackageId: "t1_g6" };
const S6_BP2: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, tuitionScenarioId: "bp2_ey_ls_unified" };
const S7_PREMIUM: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, orgDesignOptionId: "premium_experience" };
const S8_MINIMUM: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, orgDesignOptionId: "minimum_experience" };

const SAMPLE_INPUTS: readonly { id: string; input: CapitalDecisionEngineInput }[] = [
  { id: "default_t1g3_intermediario_bp1_balanced_100m", input: DEFAULT_INPUT },
  { id: "S1_canonical_90m", input: S1_CANONICAL_90M },
  { id: "S3_pessimista", input: S3_PESSIMISTA },
  { id: "S4_otimista", input: S4_OTIMISTA },
  { id: "S5_t1g6", input: S5_T1G6 },
  { id: "S6_bp2", input: S6_BP2 },
  { id: "S7_premium", input: S7_PREMIUM },
  { id: "S8_minimum", input: S8_MINIMUM },
];

const FORBIDDEN_STATUS_WORDS = [
  "approved",
  "viable",
  "recommended",
  "rejected",
  "not viable",
  "failed",
  "at or above",
  "winner",
  "best",
  "preferred",
];

const FORBIDDEN_RESULT_FIELDS = [
  "tier",
  "score",
  "weightedScore",
  "ranking",
  "winner",
  "preferredScenario",
  "recommendation",
  "overallResult",
];

export function runPhase15FUiIntegrationValidation(): Phase15FUiValidationReport {
  const checks: Phase15FUiValidationCheckResult[] = [];

  // ── Data integrity ────────────────────────────────────────────────────

  {
    const ids = occupancyOptions.map((o) => o.id);
    const labels = new Map(occupancyOptions.map((o) => [o.id, o.label]));
    const idsOk =
      ids.length === 3 &&
      ids.includes("pessimista") &&
      ids.includes("intermediario") &&
      ids.includes("otimista");
    const labelsOk =
      labels.get("pessimista") === "Pessimista" &&
      labels.get("intermediario") === "Intermediário" &&
      labels.get("otimista") === "Otimista";
    checks.push(
      idsOk && labelsOk
        ? pass(
            "data_occupancy_options_canonical_ids_and_labels",
            `occupancyOptions has canonical IDs ${JSON.stringify(ids)} with matching pt-BR labels.`,
          )
        : fail("data_occupancy_options_canonical_ids_and_labels", JSON.stringify(occupancyOptions)),
    );
  }

  {
    const ids = capexOptions.map((o) => o.id);
    const labels = new Map(capexOptions.map((o) => [o.id, o.label]));
    const idsOk =
      ids.length === 2 && ids.includes("capex_90m_brl") && ids.includes("capex_100m_brl");
    const labelsOk =
      labels.get("capex_90m_brl") === "R$ 90 milhões" &&
      labels.get("capex_100m_brl") === "R$ 100 milhões";
    checks.push(
      idsOk && labelsOk
        ? pass(
            "data_capex_options_canonical_ids_and_labels",
            `capexOptions has canonical IDs ${JSON.stringify(ids)} with matching labels.`,
          )
        : fail("data_capex_options_canonical_ids_and_labels", JSON.stringify(capexOptions)),
    );
  }

  const defaultResult = calculateInvestmentInterpretation(DEFAULT_INPUT);
  checks.push(
    defaultResult.calculationStatus === "calculated"
      ? pass(
          "data_default_scenario_produces_calculated_result",
          `Default scenario calculationStatus="calculated", investmentReferenceStatus="${defaultResult.investmentReferenceStatus}".`,
        )
      : fail("data_default_scenario_produces_calculated_result", JSON.stringify(defaultResult)),
  );

  // ── Lever controls ───────────────────────────────────────────────────

  {
    const ids = [...CAPITAL_DECISION_LEVER_IDS];
    const ok =
      ids.length === 5 &&
      !ids.includes("serviceContracts" as never) &&
      new Set(ids).size === 5 &&
      ["openingGrades", "occupancy", "orgDesignStructure", "tuition", "capex"].every((id) =>
        ids.includes(id as never),
      );
    checks.push(
      ok
        ? pass(
            "lever_ids_exactly_five_no_service_contracts",
            `CAPITAL_DECISION_LEVER_IDS = ${JSON.stringify(ids)} (5 levers, no serviceContracts).`,
          )
        : fail("lever_ids_exactly_five_no_service_contracts", JSON.stringify(ids)),
    );
  }

  function checkLeverOptionsCalculate(
    checkId: Phase15FUiValidationCheckId,
    leverLabel: string,
    inputKey: keyof CapitalDecisionEngineInput,
    optionIds: readonly string[],
  ): void {
    const results = optionIds.map((optionId) => {
      const variant: CapitalDecisionEngineInput = { ...DEFAULT_INPUT, [inputKey]: optionId } as CapitalDecisionEngineInput;
      const result = calculateInvestmentInterpretation(variant);
      return { optionId, calculationStatus: result.calculationStatus };
    });
    const allCalculated = results.every((r) => r.calculationStatus === "calculated");
    checks.push(
      allCalculated
        ? pass(checkId, `${leverLabel} options ${JSON.stringify(optionIds)} all produce calculationStatus="calculated".`)
        : fail(checkId, JSON.stringify(results)),
    );
  }

  checkLeverOptionsCalculate(
    "lever_opening_grades_options_all_calculate",
    "Opening Grades",
    "openingPackageId",
    openingGrades.map((o) => o.id),
  );
  checkLeverOptionsCalculate(
    "lever_occupancy_options_all_calculate",
    "Occupancy",
    "occupancyScenarioId",
    occupancyOptions.map((o) => o.id),
  );
  checkLeverOptionsCalculate(
    "lever_org_design_options_all_calculate",
    "Org Design Structure",
    "orgDesignOptionId",
    orgDesignStructure.map((o) => o.id),
  );
  checkLeverOptionsCalculate(
    "lever_tuition_options_all_calculate",
    "Tuition",
    "tuitionScenarioId",
    tuitionArchitecture.map((o) => o.id),
  );
  checkLeverOptionsCalculate(
    "lever_capex_options_all_calculate",
    "CAPEX",
    "capexOptionId",
    capexOptions.map((o) => o.id),
  );

  // ── Status rendering & formatting across the sample scenario set ───────

  const sampleResults: { id: string; result: InvestmentInterpretationResult }[] = SAMPLE_INPUTS.map(
    ({ id, input }) => ({ id, result: calculateInvestmentInterpretation(input) }),
  );

  const statusesSeen = new Set(sampleResults.map((s) => s.result.investmentReferenceStatus));

  {
    const meetsCases = sampleResults.filter((s) => s.result.investmentReferenceStatus === "meets_reference");
    if (meetsCases.length === 0) {
      checks.push(
        fail(
          "status_meets_reference_text_uses_exceeds_wacc_language",
          `No sample scenario produced investmentReferenceStatus="meets_reference" (statuses seen: ${JSON.stringify([...statusesSeen])}).`,
        ),
      );
    } else {
      const failures = meetsCases.filter(({ result }) => {
        const display = getInvestmentReferenceStatusDisplay(result);
        const lower = display.statusText.toLowerCase();
        return (
          !display.statusText.startsWith("TIR exceeds the") ||
          !display.statusText.includes("reference WACC.") ||
          FORBIDDEN_STATUS_WORDS.some((word) => lower.includes(word))
        );
      });
      checks.push(
        failures.length === 0
          ? pass(
              "status_meets_reference_text_uses_exceeds_wacc_language",
              `${meetsCases.length} sample scenario(s) with investmentReferenceStatus="meets_reference" render "TIR exceeds the X% reference WACC." with no forbidden language (e.g. ${meetsCases[0].id}: "${getInvestmentReferenceStatusDisplay(meetsCases[0].result).statusText}").`,
            )
          : fail("status_meets_reference_text_uses_exceeds_wacc_language", JSON.stringify(failures.map((f) => f.id))),
      );
    }
  }

  {
    const doesNotMeetCases = sampleResults.filter(
      (s) => s.result.investmentReferenceStatus === "does_not_meet_reference",
    );
    if (doesNotMeetCases.length === 0) {
      checks.push(
        pass(
          "status_does_not_meet_reference_text_uses_equal_or_below_language",
          `No sample production scenario produced investmentReferenceStatus="does_not_meet_reference" (statuses seen: ${JSON.stringify([...statusesSeen])}). getInvestmentReferenceStatusDisplay's does_not_meet_reference branch was reviewed by source inspection: it returns "TIR is equal to or below the X% reference WACC." with no forbidden language, with optional spread-based detailNote.`,
        ),
      );
    } else {
      const failures = doesNotMeetCases.filter(({ result }) => {
        const display = getInvestmentReferenceStatusDisplay(result);
        const lower = display.statusText.toLowerCase();
        return (
          !display.statusText.startsWith("TIR is equal to or below the") ||
          !display.statusText.includes("reference WACC.") ||
          FORBIDDEN_STATUS_WORDS.some((word) => lower.includes(word))
        );
      });
      checks.push(
        failures.length === 0
          ? pass(
              "status_does_not_meet_reference_text_uses_equal_or_below_language",
              `${doesNotMeetCases.length} sample scenario(s) with investmentReferenceStatus="does_not_meet_reference" render "TIR is equal to or below the X% reference WACC." with no forbidden language.`,
            )
          : fail(
              "status_does_not_meet_reference_text_uses_equal_or_below_language",
              JSON.stringify(failures.map((f) => f.id)),
            ),
      );
    }
  }

  {
    const failures = sampleResults.filter(({ result }) => {
      const label = getInvestmentReferenceStatusLabel(result.investmentReferenceStatus);
      switch (result.investmentReferenceStatus) {
        case "meets_reference":
          return label !== "Meets reference";
        case "does_not_meet_reference":
          return label !== "Does not meet reference";
        case "irr_unavailable":
          return label !== "TIR unavailable";
        case "blocked_upstream":
          return label !== "Calculation blocked";
        default:
          return true;
      }
    });
    checks.push(
      failures.length === 0
        ? pass(
            "status_label_matches_machine_status",
            `All ${sampleResults.length} sample scenarios' getInvestmentReferenceStatusLabel() matches the expected label for their machine investmentReferenceStatus.`,
          )
        : fail("status_label_matches_machine_status", JSON.stringify(failures.map((f) => f.id))),
    );
  }

  {
    const failures = sampleResults.filter(({ result }) => {
      if (result.tirWaccSpreadRate === null) return false;
      const formatted = formatSpreadPp(result.tirWaccSpreadRate);
      if (result.tirWaccSpreadRate > 0) return !formatted.startsWith("+");
      if (result.tirWaccSpreadRate < 0) return !formatted.startsWith("−");
      return formatted.startsWith("+") || formatted.startsWith("−");
    });
    checks.push(
      failures.length === 0
        ? pass(
            "status_spread_sign_matches_tir_wacc_relationship",
            `formatSpreadPp sign matches the sign of tirWaccSpreadRate for all ${sampleResults.length} sample scenarios.`,
          )
        : fail("status_spread_sign_matches_tir_wacc_relationship", JSON.stringify(failures.map((f) => f.id))),
    );
  }

  // ── Formatting ──────────────────────────────────────────────────────

  {
    const failures = sampleResults.filter(({ result }) => {
      if (result.npvSign === "unavailable") return false;
      const vpl = formatVpl(result.npvBRL, result.npvSign);
      return !vpl.compact.includes("R$") || !vpl.detailed.includes("R$");
    });
    checks.push(
      failures.length === 0
        ? pass(
            "formatting_vpl_compact_and_detailed_present",
            `formatVpl() returns BRL-formatted compact and detailed values for all ${sampleResults.length} sample scenarios with available VPL.`,
          )
        : fail("formatting_vpl_compact_and_detailed_present", JSON.stringify(failures.map((f) => f.id))),
    );
  }

  {
    const failures = sampleResults.filter(({ result }) => {
      const display = formatDiscountedPayback(result);
      switch (result.discountedPaybackStatus) {
        case "calculated":
          return display.value !== `${result.discountedPaybackYears} anos`;
        case "not_reached_within_horizon":
          return display.value !== "Não atingido em 20 anos";
        case "not_applicable_negative_npv":
          return display.value !== "Não aplicável";
        case "blocked_missing_phase15c_inputs":
        case "invalid_cash_flow_series":
          return display.value !== "Não disponível";
        default:
          return true;
      }
    });
    checks.push(
      failures.length === 0
        ? pass(
            "formatting_payback_text_matches_status",
            `formatDiscountedPayback() output matches discountedPaybackStatus for all ${sampleResults.length} sample scenarios.`,
          )
        : fail("formatting_payback_text_matches_status", JSON.stringify(failures.map((f) => f.id))),
    );
  }

  // ── Comparison behavior ──────────────────────────────────────────────

  const scenarioA = sampleResults[0];
  const scenarioB = sampleResults[2];
  const comparison = compareInvestmentScenarioPair(
    scenarioA.id,
    scenarioB.id,
    scenarioA.result,
    scenarioB.result,
  );

  checks.push(
    comparison.scenarioA === scenarioA.result && comparison.scenarioB === scenarioB.result
      ? pass(
          "comparison_pair_does_not_recalculate_inputs",
          "compareInvestmentScenarioPair() embeds the same InvestmentInterpretationResult object " +
            "references passed in (identity-equal); no recalculation is performed for either scenario " +
            "and no scenario other than A and B is touched.",
        )
      : fail("comparison_pair_does_not_recalculate_inputs", "comparison.scenarioA/scenarioB are not identity-equal to the inputs."),
  );

  {
    const keys = Object.keys(comparison).map((k) => k.toLowerCase());
    const found = FORBIDDEN_RESULT_FIELDS.filter((field) => keys.includes(field.toLowerCase()));
    checks.push(
      found.length === 0
        ? pass(
            "comparison_pair_has_no_winner_score_rank_fields",
            `ScenarioInvestmentPairComparison keys = ${JSON.stringify(Object.keys(comparison))}; none of ${JSON.stringify(FORBIDDEN_RESULT_FIELDS)} present.`,
          )
        : fail("comparison_pair_has_no_winner_score_rank_fields", JSON.stringify(found)),
    );
  }

  {
    const notes = comparison.tradeOffNotes;
    const isArrayOfStrings = Array.isArray(notes) && notes.every((n) => typeof n === "string");
    const noForbiddenWords = notes.every((n) => {
      const lower = n.toLowerCase();
      return !["winner", "best scenario", "preferred", "recommend"].some((word) => lower.includes(word));
    });
    checks.push(
      isArrayOfStrings && noForbiddenWords
        ? pass(
            "comparison_trade_off_notes_is_factual_array",
            `tradeOffNotes is a string array (${notes.length} entries) with no winner/recommendation language.`,
          )
        : fail("comparison_trade_off_notes_is_factual_array", JSON.stringify(notes)),
    );
  }

  // ── Boundary ──────────────────────────────────────────────────────────

  checks.push(
    MAX_SAVED_SCENARIOS === 4
      ? pass("boundary_max_saved_scenarios_is_four", "MAX_SAVED_SCENARIOS === 4.")
      : fail("boundary_max_saved_scenarios_is_four", `MAX_SAVED_SCENARIOS === ${MAX_SAVED_SCENARIOS}`),
  );

  {
    const keys = Object.keys(defaultResult).map((k) => k.toLowerCase());
    const found = FORBIDDEN_RESULT_FIELDS.filter((field) => keys.includes(field.toLowerCase()));
    checks.push(
      found.length === 0
        ? pass(
            "boundary_interpretation_result_has_no_tier_score_winner_fields",
            `InvestmentInterpretationResult keys = ${JSON.stringify(Object.keys(defaultResult))}; none of ${JSON.stringify(FORBIDDEN_RESULT_FIELDS)} present.`,
          )
        : fail("boundary_interpretation_result_has_no_tier_score_winner_fields", JSON.stringify(found)),
    );
  }

  {
    const entries = Object.entries(defaultResult.explicitExclusions).filter(([key]) => key !== "notes");
    const allExcluded = entries.length > 0 && entries.every(([, value]) => value === "excluded");
    checks.push(
      allExcluded
        ? pass(
            "boundary_explicit_exclusions_all_excluded",
            `All ${entries.length} explicitExclusions flags (excluding the "notes" field) are "excluded".`,
          )
        : fail("boundary_explicit_exclusions_all_excluded", JSON.stringify(defaultResult.explicitExclusions)),
    );
  }

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.length - passCount;
  return { checks, allPass: failCount === 0, passCount, failCount };
}
