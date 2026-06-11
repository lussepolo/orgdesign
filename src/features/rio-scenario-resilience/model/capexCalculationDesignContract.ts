// CAPEX calculation design types.
// Phase 10A (2026-06-04): calculation readiness audit artifact.
// Types only. No source data. No calculation logic. No UI.
// No EBITDA, OPEX totals, NPV, payback, Tier in this file.

export type CapexCalculationStatus =
  // Required assumptions are missing; design cannot be finalized until blockers are resolved.
  | "blocked"
  // All required assumptions are source-supported; design finalized; awaiting implementation approval.
  | "designed_not_implemented"
  // Engine implemented, validation passes, confirmed.
  | "implemented";

export type CapexEbitdaTreatment =
  // CAPEX is not an operating expense. It is excluded from EBITDA.
  // freeCashFlow = operatingResult - capexAnnual (after EBITDA/operatingResult).
  // Consistent with baseline.ts:307-311.
  "excluded_from_ebitda";

export interface CapexCalculationDesignContract {
  // Overall calculation status for Phase 10A.
  calculationStatus: CapexCalculationStatus;
  // Count of validated CAPEX source line records. Zero until Finance provides values.
  sourceRecordCount: number;
  // true only when all required assumptions are source-supported and implementation is approved.
  calculationReady: boolean;
  // true only when Luciana has explicitly approved the implementation approach.
  implementationApproved: boolean;
  // What source evidence exists for CAPEX values (amounts, categories, schedule).
  sourceValueFinding: string;
  // What the source says about payment timing (pre-opening, 2028, spread, recurring).
  timingFinding: string;
  // What the source says about opening package applicability.
  packageApplicabilityFinding: string;
  // What the source says about occupancy and org design scenario applicability.
  scenarioApplicabilityFinding: string;
  // How CAPEX values should be signed (positive outflow, negative cash-flow entry, or unknown).
  signConventionFinding: string;
  // CAPEX does not enter EBITDA. freeCashFlow = operatingResult - capex.
  ebitdaTreatment: CapexEbitdaTreatment;
  // How CAPEX flows into downstream cash-flow, payback, NPV outputs.
  cashFlowTreatment: string;
  // Exact conditions that must be met before calculationReady=true.
  blockedUntil: string[];
  // Provenance, phase, and source notes.
  sourceNotes: string;
}
