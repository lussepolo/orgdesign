// Phase 15B-FCO-CAPEX-BRIDGE — capital decision engine (orchestrator).
//
// Computes the full FCO/CAPEX bridge for the `pre_ops` period (sourceYear
// 2027) plus the committed 2028-2047 operating horizon, for the selected
// CAPEX option (R$90M or R$100M):
//   EBITDA -> D&A -> EBIT -> financial result -> EBT -> tax/NOL -> net income
//   -> add-backs -> FCO -> CAPEX -> cash flow after CAPEX
//
// Does NOT mutate or recalculate upstream Receita, FOPAG, or EBITDA:
// calculateDre() is called once and its byYear.ebitda /
// byYear.receita_operacional_liquida values are read-only inputs.
//
// IMPORTANT (Phase 15B.2 source-parity finding, see IMPLEMENTATION.md):
// calculateDre()'s 2028-2047 ebitda/receita_operacional_liquida outputs for
// the canonical validation scenario (t1_g3 / intermediario /
// bp1_division_differentiated / balanced_experience) do not numerically
// match the workbook's cached PnL!236/273 values
// (capitalDecisionR100mParitySourceData.ts: R100M_ROL_BRL/R100M_EBITDA_BRL).
// Phase 15B.2 traced the first divergence to 2028 numero_de_alunos (engine
// 228 vs. workbook PnL!221 246) -- an enrollment/scenario-input mismatch
// upstream of any revenue or EBITDA formula, i.e. a SCENARIO MISMATCH
// (Phase 15B.2 classification A), not a bridge-formula defect and not the
// "Phase 13 partial_blocked" finding (dreEbitdaBacktest.ts already labels
// that finding "Not an engine error" / "diagnostic_unconfirmed_scenario").
// Consequently the *integrated* output of calculateCapitalDecisionBridge()
// below does not numerically match the workbook's cached PnL!291-296 bridge
// values for 2028-2047 for this scenario, even though the bridge FORMULAS
// themselves (CAPEX schedule, PPE depreciation, NOL/tax recurrence -- see
// computeCapitalDecisionBridgeCore() and capitalDecisionEngineValidation.ts)
// are independently validated against those workbook-cached values when fed
// the workbook's own EBITDA/ROL. See integratedBaselineParityStatus /
// integratedBaselineParityNote on the result for a scenario-specific,
// non-hardcoded report of this distinction.
//
// Phase 15B boundary (phase15CapitalDecisionArchitecture.md S17.2): no UI,
// no DCF/VPL/TIR/perpetuity/discounted payback, no Tier/investment
// interpretation, no working capital, no financing cash flows.

import { calculateDre } from "./dreEngine";
import { calculateCapexSchedule } from "./capexScheduleEngine";
import { calculatePpeDepreciation } from "./ppeDepreciationEngine";
import { calculateNolTax } from "./nolTaxEngine";
import { PRE_OPS_OPERATING_RESULT_SOURCE } from "./preOpsOperatingResultSourceData";
import { R100M_ROL_BRL, R100M_EBITDA_BRL } from "./capitalDecisionR100mParitySourceData";
import {
  PRE_OPS_PERIOD_KEY,
  SIMULATOR_PROJECTION_YEARS,
  type SimulatorProjectionYear,
} from "./simulatorProjectionHorizonContract";
import type {
  CapitalDecisionBridgeCoreInput,
  CapitalDecisionBridgeCoreOutput,
  CapitalDecisionEngineInput,
  CapitalDecisionPeriodKey,
  CapitalDecisionPeriodResult,
  CapitalDecisionResult,
  CapitalDecisionCalculationReadinessStatus,
  CapitalDecisionIntegratedBaselineParityStatus,
} from "./capitalDecisionEngineContract";

const SOURCE_WORKBOOK_FILE = "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx";
const RATIFIED_METHODOLOGY_DOC =
  "src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md";
const VALIDATION_TOLERANCE_BRL = 0.01;

// Phase 15B.2: year used to check whether the calling scenario's
// calculateDre()-derived ROL/EBITDA match the workbook-cached baseline
// fixture (capitalDecisionR100mParitySourceData.ts). 2028 is the first
// projection year and the year cited in the Phase 15B.2 divergence trace.
const WORKBOOK_BASELINE_PARITY_CHECK_YEAR: SimulatorProjectionYear = 2028;

// Pure bridge core (see capitalDecisionEngineContract.ts for the rationale
// behind this extraction). Does not call calculateDre() -- EBITDA/ROL for
// 2028-2047 are supplied by the caller. Pre-ops EBITDA is always the fixed
// PRE_OPS_OPERATING_RESULT_SOURCE literal, independent of the caller's
// inputs.
export function computeCapitalDecisionBridgeCore(
  input: CapitalDecisionBridgeCoreInput,
): CapitalDecisionBridgeCoreOutput {
  const { rolByYear, ebitdaByYear } = input;

  const capexSchedule = calculateCapexSchedule({
    capexOptionId: input.capexOptionId,
    rolByYear,
  });
  const capexByPeriod = new Map(capexSchedule.periods.map((p) => [p.periodKey, p]));

  const preOpsExpansionCapexPositiveBRL =
    capexByPeriod.get(PRE_OPS_PERIOD_KEY)!.capexExpansionPositiveBRL;
  const totalCapexPositiveByYear: Record<number, number> = {};
  for (const year of SIMULATOR_PROJECTION_YEARS) {
    totalCapexPositiveByYear[year] = capexByPeriod.get(year)!.capexTotalPositiveBRL;
  }

  const depreciation = calculatePpeDepreciation({
    preOpsExpansionCapexPositiveBRL,
    totalCapexPositiveByYear,
  });

  const periodKeys: CapitalDecisionPeriodKey[] = [PRE_OPS_PERIOD_KEY, ...SIMULATOR_PROJECTION_YEARS];

  const operatingByPeriod = periodKeys.map((periodKey) => {
    const ebitdaBRL =
      periodKey === PRE_OPS_PERIOD_KEY
        ? PRE_OPS_OPERATING_RESULT_SOURCE.ebitdaBRL
        : ebitdaByYear[periodKey];
    const depreciationAmortizationBRL =
      depreciation.depreciationAmortizationSignedByPeriod[periodKey];
    // PnL!277 (Cap1-Cap8) is currently zero for all periods (S16.3 item 4).
    const financialResultBRL = 0;
    const ebitBRL = ebitdaBRL + depreciationAmortizationBRL;
    const ebtBRL = ebitBRL + financialResultBRL;
    return { periodKey, ebitdaBRL, depreciationAmortizationBRL, financialResultBRL, ebitBRL, ebtBRL };
  });

  const nol = calculateNolTax({
    ebtByPeriod: operatingByPeriod.map(({ periodKey, ebtBRL }) => ({ periodKey, ebtBRL })),
  });
  const nolByPeriod = new Map(nol.periods.map((p) => [p.periodKey, p]));

  let fcoAfterCapexCumulativeBRL = 0;
  const periods: CapitalDecisionPeriodResult[] = operatingByPeriod.map(
    ({ periodKey, ebitdaBRL, depreciationAmortizationBRL, financialResultBRL, ebitBRL, ebtBRL }) => {
      const nolResult = nolByPeriod.get(periodKey)!;
      const netIncomeBRL = ebtBRL + nolResult.taxTotalBRL;
      const depreciationAddBackBRL = -depreciationAmortizationBRL;
      const financialResultAddBackBRL = -financialResultBRL;
      const fcoBRL = netIncomeBRL + depreciationAddBackBRL + financialResultAddBackBRL;

      const capex = capexByPeriod.get(periodKey)!;
      const fcoAfterCapexBRL = fcoBRL + capex.capexTotalSignedBRL;
      fcoAfterCapexCumulativeBRL += fcoAfterCapexBRL;

      return {
        periodKey,
        sourceYear:
          periodKey === PRE_OPS_PERIOD_KEY ? PRE_OPS_OPERATING_RESULT_SOURCE.sourceYear : periodKey,
        ebitdaBRL,
        depreciationAmortizationBRL,
        ebitBRL,
        financialResultBRL,
        ebtBRL,
        taxDirectBRL: nolResult.taxDirectBRL,
        nolRecoveryBRL: nolResult.nolRecoveryBRL,
        taxTotalBRL: nolResult.taxTotalBRL,
        netIncomeBRL,
        depreciationAddBackBRL,
        financialResultAddBackBRL,
        fcoBRL,
        capexExpansionBRL: capex.capexExpansionSignedBRL,
        capexSustainBRL: capex.capexSustainSignedBRL,
        capexTotalBRL: capex.capexTotalSignedBRL,
        fcoAfterCapexBRL,
        fcoAfterCapexCumulativeBRL,
        accumulatedNolBRL: nolResult.accumulatedNolBRL,
      };
    },
  );

  const capexInvestmentPositiveBRL =
    capexSchedule.totalExpansionPositiveBRL + capexSchedule.totalSustainPositiveBRL;

  return { periods, capexInvestmentPositiveBRL };
}

export function calculateCapitalDecisionBridge(
  input: CapitalDecisionEngineInput,
): CapitalDecisionResult {
  const dre = calculateDre(input);

  const rolByYear = {} as Record<SimulatorProjectionYear, number>;
  const ebitdaByYear = {} as Record<SimulatorProjectionYear, number>;
  for (const year of SIMULATOR_PROJECTION_YEARS) {
    const yearResult = dre.byYear[year];
    rolByYear[year] = yearResult.receita_operacional_liquida;
    ebitdaByYear[year] = yearResult.ebitda;
  }

  // Phase 15B.2: replace the prior CALCULATION_CAN_BEGIN-derived gate with a
  // local readiness check on the actual values this bridge needs --
  // calculateDre() must have returned finite ROL/EBITDA for every
  // 2028-2047 SIMULATOR_PROJECTION_YEARS. This is independent of the
  // repo-wide upstream-readiness registry (inputReadinessRegistry.ts),
  // which tracks unrelated payroll/OPEX/CAPEX/governance layers (see
  // phase15CapitalDecisionArchitecture.md S11).
  const scenarioInputsComplete = SIMULATOR_PROJECTION_YEARS.every(
    (year) => Number.isFinite(rolByYear[year]) && Number.isFinite(ebitdaByYear[year]),
  );
  const calculationReadiness: CapitalDecisionCalculationReadinessStatus = scenarioInputsComplete
    ? "structurally_calculated"
    : "missing_upstream_inputs";
  const calculationReadinessReason = scenarioInputsComplete
    ? "calculateDre() returned finite receita_operacional_liquida and ebitda for all " +
      "2028-2047 SIMULATOR_PROJECTION_YEARS for the requested scenario; the FCO/CAPEX " +
      "bridge (computeCapitalDecisionBridgeCore) was computed deterministically from " +
      "these values. This does not imply the result numerically matches the workbook " +
      "baseline -- see integratedBaselineParityStatus/integratedBaselineParityNote."
    : "calculateDre() did not return finite receita_operacional_liquida/ebitda for one " +
      "or more 2028-2047 SIMULATOR_PROJECTION_YEARS for the requested scenario; the " +
      "bridge could not be computed for the affected periods.";

  // Phase 15B.2: scenario-dependent check of whether THIS scenario's
  // calculateDre() output matches the workbook-cached baseline fixture
  // (capitalDecisionR100mParitySourceData.ts: R100M_ROL_BRL/R100M_EBITDA_BRL,
  // PnL!236/273). Computed from live values, not a hardcoded label.
  const baselineYear = WORKBOOK_BASELINE_PARITY_CHECK_YEAR;
  const rolDelta = rolByYear[baselineYear] - R100M_ROL_BRL[baselineYear];
  const ebitdaDelta = ebitdaByYear[baselineYear] - R100M_EBITDA_BRL[baselineYear];
  const matchesWorkbookBaseline =
    Math.abs(rolDelta) <= VALIDATION_TOLERANCE_BRL && Math.abs(ebitdaDelta) <= VALIDATION_TOLERANCE_BRL;
  const integratedBaselineParityStatus: CapitalDecisionIntegratedBaselineParityStatus =
    matchesWorkbookBaseline ? "workbook_baseline_parity_validated" : "workbook_baseline_parity_not_established";
  const integratedBaselineParityNote = matchesWorkbookBaseline
    ? `This scenario's calculateDre() output for ${baselineYear} (ROL=${rolByYear[baselineYear]}, ` +
      `EBITDA=${ebitdaByYear[baselineYear]}) matches the workbook-cached baseline fixture ` +
      `(capitalDecisionR100mParitySourceData.ts, PnL!236/273) within ${VALIDATION_TOLERANCE_BRL} BRL.`
    : `This scenario's calculateDre() output for ${baselineYear} (ROL=${rolByYear[baselineYear]}, ` +
      `EBITDA=${ebitdaByYear[baselineYear]}) does not match the workbook-cached baseline fixture ` +
      `(ROL=${R100M_ROL_BRL[baselineYear]}, EBITDA=${R100M_EBITDA_BRL[baselineYear]}; ` +
      `capitalDecisionR100mParitySourceData.ts, PnL!236/273; deltas: ROL=${rolDelta}, ` +
      `EBITDA=${ebitdaDelta}). Phase 15B.2 traced the first divergence for the canonical ` +
      `validation scenario to ${baselineYear} numero_de_alunos (engine 228 vs. workbook PnL!221 ` +
      `246) -- a scenario/enrollment-input mismatch upstream of any revenue or EBITDA formula, ` +
      `not a bridge-formula defect. The bridge formulas themselves (computeCapitalDecisionBridgeCore) ` +
      `remain validated against the workbook-cached PnL!291-296 bridge when fed the workbook's own ` +
      `PnL!236/273 EBITDA/ROL (capitalDecisionEngineValidation.ts, 25/25 checks, tolerance ` +
      `${VALIDATION_TOLERANCE_BRL} BRL). This result is structurally calculated for this scenario's ` +
      `own assumptions (see calculationReadiness) but is not a workbook-baseline-parity result.`;

  const { periods, capexInvestmentPositiveBRL } = computeCapitalDecisionBridgeCore({
    capexOptionId: input.capexOptionId,
    rolByYear,
    ebitdaByYear,
  });

  return {
    capexOptionId: input.capexOptionId,
    capexInvestmentPositiveBRL,
    periods,
    sourceProvenance: {
      workbookFile: SOURCE_WORKBOOK_FILE,
      visibleWorkbookSheets: [
        "PnL",
        "PPE",
        "Recuperacao de Prejuizos",
        "Pre-Ops",
        "Cap1",
        "Cap2",
        "Cap3",
        "Cap4",
        "Cap5",
        "Cap6",
        "Cap7",
        "Cap8",
      ],
      ratifiedMethodologyDoc: RATIFIED_METHODOLOGY_DOC,
      ratifiedSections: ["S16", "S17"],
      nolMethodLabel: "workbook_parity_nol_method",
      notes: [
        "EBITDA and ROL for 2028-2047 are read-only outputs of calculateDre() " +
          "(committed operating engine, not recalculated here).",
        "Pre-ops EBITDA (-17,667,521.16 BRL, sourceYear 2027) is a fixed literal " +
          "from the visible PnL/Pre-Ops sheets, not scenario-derived.",
        "Financial result (PnL!277, Cap1-Cap8) is currently zero for all periods.",
        integratedBaselineParityNote,
      ],
    },
    calculationReadiness,
    calculationReadinessReason,
    bridgeFormulaParityStatus: "formula_validated",
    integratedBaselineParityStatus,
    integratedBaselineParityNote,
    validationStatus: {
      r100mWorkbookParityChecked: true,
      r90mStructuralChecksChecked: true,
      toleranceBRL: VALIDATION_TOLERANCE_BRL,
    },
    explicitExclusions: {
      workingCapital: "excluded",
      financingCashFlows: "excluded",
      dcf: "excluded",
      npv: "excluded",
      tir: "excluded",
      perpetuity: "excluded",
      discountedPayback: "excluded",
      tierInvestmentInterpretation: "excluded",
      notes:
        "Phase 15B scope ends at fcoAfterCapexBRL / fcoAfterCapexCumulativeBRL " +
        "(PnL rows 295/296). Working capital, financing cash flows, " +
        "DCF/VPL/TIR/discounted payback/perpetuity, and Tier/investment " +
        "interpretation are Phase 15C/15D and are not computed here.",
    },
  };
}
