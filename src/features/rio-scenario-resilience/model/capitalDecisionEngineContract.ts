// Phase 15B-FCO-CAPEX-BRIDGE — capital decision engine contract.
//
// Defines the result shape for the capital-decision calculation bridge:
//   EBITDA -> D&A -> EBIT -> financial result -> EBT -> tax/NOL -> net income
//   -> add-backs -> FCO -> CAPEX -> cash flow after CAPEX
// for the `pre_ops` period (sourceYear 2027) plus the committed 2028-2047
// operating horizon, for either the R$90M or R$100M CAPEX option.
//
// Ratified source hierarchy (highest first):
//   1. src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md (S16/S17)
//   2. dreEngine.ts (EBITDA, ROL for 2028-2047 -- not recalculated here)
//   3. Visible workbook sheets: PnL, PPE, Recuperacao de Prejuizos, Pre-Ops, Cap1-Cap8
//
// Phase 15B boundary (S17.2): no UI, no DCF/VPL/TIR/perpetuity/discounted payback,
// no Tier/investment interpretation, no working capital, no financing cash flows.

import type { CapexOptionId } from "./capexOptionSourceContract";
import type { DreEngineInput } from "./dreEngineContract";
import {
  PRE_OPS_PERIOD_KEY,
  type SimulatorProjectionYear,
} from "./simulatorProjectionHorizonContract";

export type CapitalDecisionPeriodKey =
  | typeof PRE_OPS_PERIOD_KEY
  | SimulatorProjectionYear;

// Phase 15B.2 (2026-06-12): replaces the prior "ready" | "blocked" status,
// which was tied to the repo-wide CALCULATION_CAN_BEGIN flag
// (inputReadinessRegistry.ts). That flag tracks the readiness of unrelated
// upstream model layers (payroll/OPEX/CAPEX/governance) and is not a
// technical precondition for this bridge: see
// phase15CapitalDecisionArchitecture.md S11. This status now reflects only
// whether calculateDre() returned the finite ROL/EBITDA values this bridge
// actually needs for the requested scenario.
//
// "structurally_calculated": calculateDre() returned finite
// receita_operacional_liquida/ebitda for all 2028-2047
// SIMULATOR_PROJECTION_YEARS for the requested scenario, so the FCO/CAPEX
// bridge was computed deterministically. This does NOT imply the result
// numerically matches the workbook baseline -- see
// integratedBaselineParityStatus for that distinction.
//
// "missing_upstream_inputs": calculateDre() did not return finite
// receita_operacional_liquida/ebitda for one or more required years for the
// requested scenario, so the bridge could not be computed for those periods.
export type CapitalDecisionCalculationReadinessStatus =
  | "structurally_calculated"
  | "missing_upstream_inputs";

// Whether the bridge FORMULAS (CAPEX schedule, PPE depreciation, NOL/tax
// recurrence, FCO, cash flow after CAPEX -- computeCapitalDecisionBridgeCore)
// have been validated against the workbook's cached PnL!291-296 bridge when
// fed the workbook's own cached PnL!236/273 EBITDA/ROL
// (capitalDecisionEngineValidation.ts r100m_*/r90m_* checks, 25/25, tolerance
// 0.01 BRL). This is a property of the bridge formulas themselves and does
// not depend on the calling scenario.
export type CapitalDecisionBridgeFormulaParityStatus = "formula_validated";

// Whether THIS scenario's calculateDre()-derived ROL/EBITDA for the
// workbook-baseline parity check year numerically match the workbook-cached
// baseline fixture (capitalDecisionR100mParitySourceData.ts: R100M_ROL_BRL /
// R100M_EBITDA_BRL, sourced from PnL!236/273).
//
// "workbook_baseline_parity_validated": this scenario's ROL/EBITDA match the
// workbook-cached baseline fixture within toleranceBRL.
//
// "workbook_baseline_parity_not_established": this scenario's ROL/EBITDA do
// not match the workbook-cached baseline fixture. Per Phase 15B.2, this is
// expected for the current canonical validation scenario (t1_g3 /
// intermediario / bp1_division_differentiated / balanced_experience): its
// 2028 numero_de_alunos (228) differs from the workbook's PnL!221 (246),
// i.e. a scenario/enrollment-input mismatch upstream of any revenue or
// EBITDA formula -- not a bridge-formula defect. See
// integratedBaselineParityNote for scenario-specific detail.
export type CapitalDecisionIntegratedBaselineParityStatus =
  | "workbook_baseline_parity_validated"
  | "workbook_baseline_parity_not_established";

export interface CapitalDecisionSourceProvenance {
  readonly workbookFile: string;
  readonly visibleWorkbookSheets: readonly string[];
  readonly ratifiedMethodologyDoc: string;
  readonly ratifiedSections: readonly string[];
  // Label per Resolution: do not present the NOL/tax recurrence as an
  // independent interpretation of Brazilian tax law -- it is an exact
  // port of the visible workbook's "Recuperacao de Prejuizos" formulas.
  readonly nolMethodLabel: "workbook_parity_nol_method";
  readonly notes: readonly string[];
}

export interface CapitalDecisionValidationStatus {
  // Whether the implementation has been checked against the R$100M
  // workbook-cached values (all 21 periods, see capitalDecisionEngineValidation.ts).
  readonly r100mWorkbookParityChecked: boolean;
  // Whether the R$90M structural invariants (no cached baseline exists)
  // have been checked (see capitalDecisionEngineValidation.ts).
  readonly r90mStructuralChecksChecked: boolean;
  readonly toleranceBRL: number;
}

export interface CapitalDecisionExplicitExclusions {
  readonly workingCapital: "excluded";
  readonly financingCashFlows: "excluded";
  readonly dcf: "excluded";
  readonly npv: "excluded";
  readonly tir: "excluded";
  readonly perpetuity: "excluded";
  readonly discountedPayback: "excluded";
  readonly tierInvestmentInterpretation: "excluded";
  readonly notes: string;
}

export interface CapitalDecisionPeriodResult {
  readonly periodKey: CapitalDecisionPeriodKey;
  // 2027 for pre_ops; otherwise equal to periodKey.
  readonly sourceYear: number;

  readonly ebitdaBRL: number;
  // <= 0 (PnL!275 sign convention). 0 for pre_ops.
  readonly depreciationAmortizationBRL: number;
  readonly ebitBRL: number;
  // Currently 0 for all periods (visible Cap1-Cap8 SUMIFS, PnL!277).
  readonly financialResultBRL: number;
  readonly ebtBRL: number;

  // <= 0. PnL!279 / "Recuperacao de Prejuizos" "Imposto Original".
  readonly taxDirectBRL: number;
  // >= 0. PnL!280 / "Recuperacao de Prejuizos" row 14 "Reducao".
  readonly nolRecoveryBRL: number;
  // taxDirectBRL + nolRecoveryBRL. PnL!281.
  readonly taxTotalBRL: number;

  // ebtBRL + taxTotalBRL. PnL!282.
  readonly netIncomeBRL: number;

  // >= 0, === -depreciationAmortizationBRL.
  readonly depreciationAddBackBRL: number;
  // === -financialResultBRL (currently 0).
  readonly financialResultAddBackBRL: number;

  // netIncomeBRL + depreciationAddBackBRL + financialResultAddBackBRL. PnL!290.
  readonly fcoBRL: number;

  // <= 0.
  readonly capexExpansionBRL: number;
  // <= 0.
  readonly capexSustainBRL: number;
  // capexExpansionBRL + capexSustainBRL.
  readonly capexTotalBRL: number;

  // fcoBRL + capexTotalBRL. PnL!295.
  readonly fcoAfterCapexBRL: number;
  // Running sum of fcoAfterCapexBRL from pre_ops through this period. PnL!296.
  readonly fcoAfterCapexCumulativeBRL: number;

  // <= 0. Diagnostic: accumulated NOL balance after this period
  // ("Recuperacao de Prejuizos" row 5).
  readonly accumulatedNolBRL: number;
}

export interface CapitalDecisionResult {
  readonly capexOptionId: CapexOptionId;
  // Total positive CAPEX exposure for the selected option across all 21
  // periods (sum of expansion + sustain amounts, positive).
  readonly capexInvestmentPositiveBRL: number;
  // Exactly 21 entries: pre_ops followed by 2028..2047.
  readonly periods: readonly CapitalDecisionPeriodResult[];
  readonly sourceProvenance: CapitalDecisionSourceProvenance;
  // Whether the bridge was structurally computable for this scenario (see
  // CapitalDecisionCalculationReadinessStatus). Replaces the prior
  // CALCULATION_CAN_BEGIN-derived "ready" | "blocked" status (Phase 15B.2).
  readonly calculationReadiness: CapitalDecisionCalculationReadinessStatus;
  readonly calculationReadinessReason: string;
  // Bridge-formula parity: a fixed property of computeCapitalDecisionBridgeCore,
  // independent of the calling scenario.
  readonly bridgeFormulaParityStatus: CapitalDecisionBridgeFormulaParityStatus;
  // Integrated workbook-baseline parity: scenario-dependent. See
  // CapitalDecisionIntegratedBaselineParityStatus.
  readonly integratedBaselineParityStatus: CapitalDecisionIntegratedBaselineParityStatus;
  readonly integratedBaselineParityNote: string;
  readonly validationStatus: CapitalDecisionValidationStatus;
  readonly explicitExclusions: CapitalDecisionExplicitExclusions;
}

export interface CapitalDecisionEngineInput extends DreEngineInput {
  readonly capexOptionId: CapexOptionId;
}

// Pure bridge core: EBITDA/ROL in, full 21-period bridge out. Used by
// calculateCapitalDecisionBridge() (fed by calculateDre()'s read-only
// 2028-2047 output) and, independently, by
// capitalDecisionEngineValidation.ts (fed by the workbook's own cached
// PnL!236/273 values) to validate the bridge formulas (CAPEX schedule,
// PPE depreciation, NOL/tax recurrence) against workbook-cached bridge
// outputs without depending on whether calculateDre()'s 2028-2047
// EBITDA/ROL currently reproduces the workbook PnL!236/273 values for a
// given scenario (Phase 15B.2: a scenario/enrollment-input mismatch for the
// canonical validation scenario, not a bridge-formula defect -- see
// integratedBaselineParityStatus).
export interface CapitalDecisionBridgeCoreInput {
  readonly capexOptionId: CapexOptionId;
  readonly rolByYear: Readonly<Record<SimulatorProjectionYear, number>>;
  readonly ebitdaByYear: Readonly<Record<SimulatorProjectionYear, number>>;
}

export interface CapitalDecisionBridgeCoreOutput {
  // Exactly 21 entries: pre_ops followed by 2028..2047.
  readonly periods: readonly CapitalDecisionPeriodResult[];
  readonly capexInvestmentPositiveBRL: number;
}
