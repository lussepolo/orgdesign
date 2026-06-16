// Phase 15I.1 — DRE Governance-State and Finance-Source Closure Preparation.
// Phase 15I.1 Closure Correction — Readiness Semantics and Payroll State.
//
// Three independent governance states for the DRE Scenario Simulator:
//   1. Engineering readiness   — is the calculation engine implemented? (yes)
//   2. Finance-source readiness — are all Finance-owned inputs confirmed? (no)
//   3. Board-ratification readiness — has the board ratified a scenario? (no)
//
// Additionally: calculation availability, instructional-capacity model status,
// payroll/FOPAG model status, and payroll/capacity alignment status.
//
// These states are orthogonal and must not be collapsed to a single Boolean.
// The engine calculates deterministically regardless of governance state.

// ── Type definitions ──────────────────────────────────────────────────────────

export type DreEngineReadinessStatus = "engineering_ready" | "not_ready";

export type DreCalculationAvailabilityStatus = "available" | "unavailable";

export type DreFinanceSourceReadinessStatus =
  | "confirmed"
  | "pending_finance_confirmation"
  | "provisional_source"
  | "reconciliation_required";

export type DreBoardRatificationStatus = "not_ratified" | "board_ratified";

export type DreInstructionalCapacityStatus = "established" | "not_established";

export type DrePayrollFopagModelStatus = "implemented" | "not_implemented";

export type DrePayrollCapacityAlignmentStatus =
  | "aligned"
  | "reconciliation_required";

export interface DreFinanceSourceOpenItem {
  readonly key: string;
  readonly label: string;
  readonly status: DreFinanceSourceReadinessStatus;
  readonly currentEngineBehavior: string;
  readonly sourceProvenance: string;
  readonly requiredOwner: "Finance" | "Finance + Board" | "Board";
  /** Engine calculation continues regardless of this item's open status. */
  readonly blocksEngineCalculation: false;
  /** This item must be resolved before board ratification is valid. */
  readonly blocksBoardRatification: true;
  readonly calculationContinues: true;
}

export interface DreGovernanceReadinessState {
  readonly engineeringReadiness: DreEngineReadinessStatus;
  readonly calculationAvailability: DreCalculationAvailabilityStatus;
  readonly financeSourceReadiness: DreFinanceSourceReadinessStatus;
  readonly boardRatificationReadiness: DreBoardRatificationStatus;
  readonly instructionalCapacityStatus: DreInstructionalCapacityStatus;
  readonly payrollFopagModelStatus: DrePayrollFopagModelStatus;
  readonly payrollCapacityAlignmentStatus: DrePayrollCapacityAlignmentStatus;
  readonly openItems: readonly DreFinanceSourceOpenItem[];
}

// ── Open Finance-source items ─────────────────────────────────────────────────
//
// All six items share blocksEngineCalculation:false / blocksBoardRatification:true.
// The engine discloses each via notes in the Raw Engine Output (dreScenarioWorkbook.ts)
// and via the outrasReceitasReajusteNote / descontosMetodoFormulaNote fields.

const OPEN_ITEMS: readonly DreFinanceSourceOpenItem[] = [
  {
    key: "outras_receitas_reajuste",
    label: "Outras Receitas — annual adjustment (reajuste_despesas) term",
    status: "pending_finance_confirmation",
    currentEngineBehavior:
      "Adjustment term omitted; Outras Receitas computed as basePerLearnerRatio × numero_de_alunos without an annual reajuste factor. Engine output discloses this via outrasReceitasReajusteNote.",
    sourceProvenance:
      "annualValuesStatus: not_available_pending_finance_source (dreScenarioAdapters.ts)",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
  {
    key: "descontos_metodo_formula_base",
    label: "Descontos Método de Assinatura — formula base relationship",
    status: "pending_finance_confirmation",
    currentEngineBehavior:
      "Assumed relationship: descontos_metodo_de_assinatura = −desconto_metodo × receita_de_ensino_liquida. Engine output discloses this via descontosMetodoFormulaNote.",
    sourceProvenance:
      "sourceType: pending_finance_source_confirmation (dreLineItemMap.ts)",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
  {
    key: "tuition_source_provenance",
    label: "Tuition base rates — source provenance",
    status: "provisional_source",
    currentEngineBehavior:
      "Transcribed tuition values used for all tuition calculations. BP1 2028: EY R$91,390 / LS R$111,670 / MS R$122,419 / HS R$141,469.",
    sourceProvenance:
      "screenshot_transcription_based (tuitionSourceData.ts, 2026-06-02); not a Finance-signed xlsx workbook",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
  {
    key: "discount_schedule_provenance",
    label: "Discount schedule — formal sign-off",
    status: "provisional_source",
    currentEngineBehavior:
      "Documented schedule used: 20% (2028–2030), 17% (2031), 15% (2032–2033), 12.5% terminal (2034+).",
    sourceProvenance:
      "Verbal/documented source: Head of Finance (discountScheduleSourceData.ts); not a Finance-signed workbook",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
  {
    key: "enrollment_baseline_parity",
    label: "2028 enrollment baseline — engine vs PnL workbook reconciliation",
    status: "reconciliation_required",
    currentEngineBehavior:
      "Canonical engine produces 228 learners in 2028 (t1_g3 / intermediario). PnL workbook baseline: approximately 246 learners. The difference reflects a different scenario configuration; the engine is self-consistent. Workbook baseline parity is not yet established.",
    sourceProvenance:
      "Engine: openingPackageOccupancySourceData.ts (t1_g3 / intermediario); Workbook: PNL_FORMULA_PARITY_SOURCE_DATA (~246 learners, Phase 13B)",
    requiredOwner: "Finance + Board",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
  {
    key: "instructional_capacity_payroll_sync",
    label: "Instructional-capacity / FOPAG payroll synchronization",
    status: "reconciliation_required",
    currentEngineBehavior:
      "Phase 15H.2 established the instructional-capacity planning model: MS 9 educators, HS 11 educators, combined 20. The FOPAG payroll adapter uses separate current assumptions. Synchronization of the payroll/FOPAG adapter with the 9/11/20 instructional envelope is a dedicated future reconciliation phase (Phase 15H.3, currently deferred).",
    sourceProvenance:
      "Instructional model: secondaryEducatorCapacityModel.ts (Phase 15H.2); Payroll: fopagEngine.ts + orgDesignPayrollActivation.ts",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
  },
];

// ── Governance readiness state ────────────────────────────────────────────────

export const DRE_GOVERNANCE_READINESS: DreGovernanceReadinessState = {
  engineeringReadiness: "engineering_ready",
  calculationAvailability: "available",
  financeSourceReadiness: "pending_finance_confirmation",
  boardRatificationReadiness: "not_ratified",
  instructionalCapacityStatus: "established",
  payrollFopagModelStatus: "implemented",
  payrollCapacityAlignmentStatus: "reconciliation_required",
  openItems: OPEN_ITEMS,
};

// ── Derived Boolean helpers ───────────────────────────────────────────────────
//
// These are the authoritative sources for gate conditions. Do not duplicate them
// in downstream files; import from here.

/** True when the DRE calculation engine is implemented and running. */
export const DRE_CALCULATION_ENGINE_IS_READY =
  DRE_GOVERNANCE_READINESS.engineeringReadiness === "engineering_ready";

/** True when calculation is technically available (engine ready + availability confirmed). */
export const DRE_CALCULATION_AVAILABILITY_CONFIRMED =
  DRE_GOVERNANCE_READINESS.calculationAvailability === "available";

/** True only when Finance has formally confirmed all open source items. */
export const DRE_FINANCE_SOURCES_CONFIRMED =
  DRE_GOVERNANCE_READINESS.financeSourceReadiness === "confirmed";

/** True only when the board has formally ratified a scenario. */
export const DRE_BOARD_RATIFIED =
  DRE_GOVERNANCE_READINESS.boardRatificationReadiness === "board_ratified";

/**
 * False while Finance-source confirmation has not been received.
 * This is the governance gate for Finance closure — independent of whether
 * the engine can calculate (CALCULATION_CAN_BEGIN may be true while this is false).
 */
export const FINANCE_SOURCE_CLOSURE_COMPLETE = DRE_FINANCE_SOURCES_CONFIRMED;

/**
 * False while the board has not ratified a working scenario.
 * Independent of engineering readiness and Finance-source closure.
 */
export const BOARD_RATIFICATION_READY = DRE_BOARD_RATIFIED;
