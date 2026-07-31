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

import {
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
} from "./dreEnrollmentCapacityLeverContract";
import {
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
} from "./dreWorkingScenarioContract";

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

export type DreGovernanceItemClassification =
  | "calculation_readiness"
  | "source_provenance"
  | "formula_fidelity"
  | "finance_approval"
  | "board_ratification"
  | "scenario_source_coverage"
  | "reconciliation"
  | "scope_exclusion"
  | "capability_unavailable"
  | "historical_retired";

export type DreGovernanceDisplayStatus =
  | "active_governance_item"
  | "finance_approval_pending"
  | "reconciliation_required"
  | "scope_exclusion"
  | "capability_unavailable"
  | "resolved_historical"
  | "retired_historical";

export interface DreFinanceSourceOpenItem {
  readonly key: string;
  readonly internalIds: readonly string[];
  readonly label: string;
  readonly boardSummary: string;
  readonly status: DreFinanceSourceReadinessStatus;
  readonly displayStatus: DreGovernanceDisplayStatus;
  readonly classifications: readonly DreGovernanceItemClassification[];
  readonly currentEngineBehavior: string;
  readonly sourceProvenance: string;
  readonly financeApprovalStatus: "not_required" | "pending" | "not_recorded" | "confirmed";
  readonly boardRatificationStatus: "not_required" | "blocks_ratification" | "historical_only";
  readonly requiredOwner:
    | "Finance"
    | "Finance + Board"
    | "Finance + Academic"
    | "Product Owner"
    | "Engineering"
    | "Board";
  /** Engine calculation continues regardless of this item's open status. */
  readonly blocksEngineCalculation: false;
  /** True only for active items that must be resolved before board ratification is valid. */
  readonly blocksBoardRatification: boolean;
  readonly calculationContinues: true;
  readonly active: boolean;
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
  readonly activeItems: readonly DreFinanceSourceOpenItem[];
  readonly historicalItems: readonly DreFinanceSourceOpenItem[];
}

// ── Active governed DRE lever coverage ────────────────────────────────────────

export const DRE_ACTIVE_LEVER_COUNTS = {
  openingPackages: DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS.length,
  captacaoScenarios: DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.length,
  tuitionScenarios: DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.length,
  orgDesignOptions: DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.length,
} as const;

export const DRE_ACTIVE_COMBINATION_COUNT =
  DRE_ACTIVE_LEVER_COUNTS.openingPackages *
  DRE_ACTIVE_LEVER_COUNTS.captacaoScenarios *
  DRE_ACTIVE_LEVER_COUNTS.tuitionScenarios *
  DRE_ACTIVE_LEVER_COUNTS.orgDesignOptions;

// ── Current active governance display items ───────────────────────────────────
//
// These items are decision disclosures, not calculation blockers. The DRE/FOPAG
// runtime still calculates every active supported combination.

export const DRE_ACTIVE_GOVERNANCE_ITEMS: readonly DreFinanceSourceOpenItem[] = [
  {
    key: "desconto_metodo_reverification",
    internalIds: ["D-R5"],
    label: "Desconto Metodo — re-verification of back-derived deduction",
    boardSummary: "Discount-method precision remains subject to Finance re-verification.",
    status: "pending_finance_confirmation",
    displayStatus: "active_governance_item",
    classifications: ["formula_fidelity", "source_provenance", "finance_approval"],
    currentEngineBehavior:
      "Receita/DRE calculations continue. The desconto_metodo driver is back-derived and remains computed-uncertified until Finance re-verifies the row against the governing workbook.",
    sourceProvenance:
      "docs/audits/rio-resilience/phase-v10-rc2-2-gate1-blocker-register.json D-R5; dreRevenueDriverSourceData.ts driverId desconto_metodo.",
    financeApprovalStatus: "pending",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "tuition_source_provenance_by_option",
    internalIds: ["D-R6", "F03"],
    label: "Tuition source provenance by tuition option",
    boardSummary: "Tuition source provenance is mixed across options and remains uncertified for planning approval.",
    status: "provisional_source",
    displayStatus: "active_governance_item",
    classifications: ["source_provenance", "scenario_source_coverage"],
    currentEngineBehavior:
      "All active tuition options calculate. BP1-BP3 are screenshot-transcribed; RJ4/RJ5 are product-owner sourced from BP v8(2) equivalent to v8(3).",
    sourceProvenance:
      "tuitionSourceData.ts sourceEvidenceOrigin=screenshot_transcription_based for BP1-BP3; Phase 15Q comments record RJ4/RJ5 as BP v8(2) equivalent to v8(3) per product owner.",
    financeApprovalStatus: "pending",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "tuition_finance_signoff",
    internalIds: ["F03"],
    label: "Tuition Finance approval / signed workbook",
    boardSummary: "Finance approval or signed workbook for tuition values is not yet recorded.",
    status: "pending_finance_confirmation",
    displayStatus: "finance_approval_pending",
    classifications: ["finance_approval", "board_ratification"],
    currentEngineBehavior:
      "Tuition values are used by the Receita engine as computed inputs; absence of Finance sign-off does not suppress calculation.",
    sourceProvenance:
      "docs/finance/dre-finance-confirmation-register.json F03; blocker register D-R6/F03.",
    financeApprovalStatus: "not_recorded",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "discount_schedule_finance_signoff",
    internalIds: ["F04"],
    label: "Average discount schedule Finance approval",
    status: "provisional_source",
    boardSummary: "Average discount schedule has v10 workbook evidence, but Finance sign-off is not yet recorded.",
    displayStatus: "finance_approval_pending",
    classifications: ["source_provenance", "finance_approval"],
    currentEngineBehavior:
      "The average discount schedule is governed by v10 PnL row 224, with explicit 2028-2035 rates and a 12.5% terminal rate from 2036 onward.",
    sourceProvenance:
      "discountScheduleSourceData.ts and v10AverageDiscountSourceData.ts; Phase V10-F1B project-owner decision, not Finance-signed.",
    financeApprovalStatus: "not_recorded",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "ms_hs_grade_level_staffing_boundary",
    internalIds: ["F06"],
    label: "MS/HS grade-level staffing unavailable",
    boardSummary: "MS/HS staffing is available as an aggregate engine estimate, not as ratified per-grade staffing.",
    status: "reconciliation_required",
    displayStatus: "capability_unavailable",
    classifications: ["capability_unavailable", "reconciliation", "scenario_source_coverage"],
    currentEngineBehavior:
      "FOPAG computes MS/HS payroll from the current fixed-FTE table; the UI must not represent that table as governed per-grade staffing.",
    sourceProvenance:
      "blocker register F06; payrollAdapter.ts MS_FTE_BY_GRADE and HS_FTE_BY_GRADE; PayrollProjectionTab displays MS/HS as division-level only.",
    financeApprovalStatus: "pending",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance + Academic",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "ms_hs_staffing_source_reconciliation",
    internalIds: ["F06"],
    label: "MS/HS staffing source reconciliation",
    status: "reconciliation_required",
    boardSummary: "Finance and Academic still need to reconcile non-identical MS/HS staffing source records.",
    displayStatus: "active_governance_item",
    classifications: ["reconciliation", "source_provenance", "finance_approval"],
    currentEngineBehavior:
      "Shared FOPAG and DRE payroll parity are implemented. HS Option B is encoded as g9=4, g10=2, g11=3, g12=2, sum=11; remaining limitation is source reconciliation, not FOPAG implementation.",
    sourceProvenance:
      "payrollAdapter.ts; docs/audits/rio-resilience/phase-v10-rc2-2-gate1-blocker-register.json F06; IMPLEMENTATION.md RC2.4A Option B record.",
    financeApprovalStatus: "pending",
    boardRatificationStatus: "blocks_ratification",
    requiredOwner: "Finance + Academic",
    blocksEngineCalculation: false,
    blocksBoardRatification: true,
    calculationContinues: true,
    active: true,
  },
  {
    key: "corporate_allocation_unavailable",
    internalIds: ["CORPORATE-ALLOCATION"],
    label: "Payroll-side corporate allocation unavailable",
    boardSummary: "Payroll-side corporate allocation and consolidated people cost are unavailable; direct campus payroll is not suppressed.",
    status: "reconciliation_required",
    displayStatus: "capability_unavailable",
    classifications: ["capability_unavailable", "scope_exclusion"],
    currentEngineBehavior:
      "DRE contains Finance-provided corporate fixed-cost lines where present, but no adapter allocates corporate/shared people cost onto payroll. Direct campus payroll remains available.",
    sourceProvenance:
      "blocker register CORPORATE-ALLOCATION; dreLineItemMap.ts corporate fixed cost lines are not a payroll allocation adapter.",
    financeApprovalStatus: "not_required",
    boardRatificationStatus: "not_required",
    requiredOwner: "Engineering",
    blocksEngineCalculation: false,
    blocksBoardRatification: false,
    calculationContinues: true,
    active: true,
  },
];

export const DRE_HISTORICAL_GOVERNANCE_ITEMS: readonly DreFinanceSourceOpenItem[] = [
  {
    key: "outras_receitas_reajuste_formula_gap",
    internalIds: ["F01", "D-R7"],
    label: "Outras Receitas reajuste formula gap",
    boardSummary: "Historical formula gap resolved; v10 row-11 adjustment is implemented.",
    status: "confirmed",
    displayStatus: "resolved_historical",
    classifications: ["formula_fidelity", "historical_retired"],
    currentEngineBehavior:
      "Outras Receitas applies the v10 Reajuste Despesas growth factor in calculateDre(). This is no longer an active formula gap.",
    sourceProvenance:
      "dreEngine.ts resolveReajusteDespesasGrowthFactor(year); reajusteDespesasGrowth.ts v10 PnL row 11; Phase V10-F2.2/D-R7.",
    financeApprovalStatus: "not_required",
    boardRatificationStatus: "historical_only",
    requiredOwner: "Product Owner",
    blocksEngineCalculation: false,
    blocksBoardRatification: false,
    calculationContinues: true,
    active: false,
  },
  {
    key: "enrollment_baseline_parity_retired",
    internalIds: ["F05"],
    label: "Retired t1_g3 enrollment baseline parity",
    boardSummary: "Historical t1_g3/base 228 vs workbook baseline issue; absent from active DRE caveats.",
    status: "reconciliation_required",
    displayStatus: "retired_historical",
    classifications: ["historical_retired", "scenario_source_coverage"],
    currentEngineBehavior:
      "Active DRE coverage uses t1_g4 and t1_g6 only. t1_g3/base is rejected by calculateDre() and blocks zero active coverage cells.",
    sourceProvenance:
      "blocker register F05 retired_decision; dreGovernanceReadinessValidation canonical fixture 2028 enrollment 258.",
    financeApprovalStatus: "not_required",
    boardRatificationStatus: "historical_only",
    requiredOwner: "Finance + Board",
    blocksEngineCalculation: false,
    blocksBoardRatification: false,
    calculationContinues: true,
    active: false,
  },
  {
    key: "descontos_metodo_formula_base_resolved",
    internalIds: ["F02"],
    label: "Descontos Metodo formula-base relationship",
    boardSummary: "Resolved engineering item; engine uses receitas_com_ensino_regular as formula base.",
    status: "confirmed",
    displayStatus: "resolved_historical",
    classifications: ["formula_fidelity", "historical_retired"],
    currentEngineBehavior:
      "Engine uses receitas_com_ensino_regular as the base for Descontos Metodo de Assinatura.",
    sourceProvenance:
      "Phase 15I.2C; dreEngine output notes and existing formula validators.",
    financeApprovalStatus: "not_required",
    boardRatificationStatus: "historical_only",
    requiredOwner: "Engineering",
    blocksEngineCalculation: false,
    blocksBoardRatification: false,
    calculationContinues: true,
    active: false,
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
  openItems: DRE_ACTIVE_GOVERNANCE_ITEMS,
  activeItems: DRE_ACTIVE_GOVERNANCE_ITEMS,
  historicalItems: DRE_HISTORICAL_GOVERNANCE_ITEMS,
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
