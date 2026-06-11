// CAPEX option-source schema types.
// Phase 10B (2026-06-07): CAPEX v1 option totals confirmed by Luciana.
// Annual schedule not yet provided — calculation remains blocked.
// No engine. No annual values invented. No EBITDA. No depreciation.

import type { OpeningPackageId } from "./openingPackageOccupancySourceDataContract";
import type { OccupancyScenarioId } from "./openingPackageOccupancySourceDataContract";
import type { OrgDesignStructureOptionId } from "../data/orgDesignStructure";
import type { CapexEbitdaTreatment } from "./capexCalculationDesignContract";

export type CapexOptionId = "capex_90m_brl" | "capex_100m_brl";

export type CapexAnnualScheduleStatus =
  // Annual schedule not yet provided by Finance.
  | "pending"
  // Some years provided but sum does not yet validate against totalCapexPositiveBRL.
  | "partial"
  // All years provided; sum(annualScheduleByYear values) === totalCapexPositiveBRL confirmed.
  | "complete"
  // Schedule derived by proportional scaling from Head-of-Finance reference pattern.
  // Source validated: sum === totalCapexPositiveBRL. Perpetuidade excluded.
  // Full schedule in capexScheduleSourceData.ts CAPEX_SCHEDULE_SOURCE_DATA.
  | "complete_scaled_from_reference_pattern";

export type CapexCashFlowTreatment = "negative_outflow_after_ebitda";

export interface CapexOptionSourceRecord {
  // Unique identifier for this CAPEX option.
  capexOptionId: CapexOptionId;
  // Human-readable label.
  label: string;
  // Total investment amount — positive BRL. This is the exposure boundary.
  // Signed cash-flow: capexCashFlowSignedBRL_y = -capexInvestmentPositiveBRL_y (per year).
  totalCapexPositiveBRL: number;
  // Currency of all values in this record.
  currency: "BRL";
  // Status of the annual payment schedule.
  annualScheduleStatus: CapexAnnualScheduleStatus;
  // Year-by-year positive investment amounts.
  // Must sum to totalCapexPositiveBRL when annualScheduleStatus === "complete".
  // Keyed by calendar year (number, not ProjectionYear) because the CAPEX timing
  // boundary is unconfirmed — pre-2028 years and post-2037 MS/HS years are possible.
  // null until Finance provides the annual distribution.
  annualScheduleByYear: Record<number, number> | null;
  // Calculation is blocked until annualScheduleByYear is populated and sum-validated.
  scheduleRequiredBeforeCalculation: true;
  // Opening packages this CAPEX option applies to.
  appliesToOpeningPackages: readonly OpeningPackageId[];
  // Occupancy scenarios this CAPEX option applies to.
  appliesToOccupancyScenarios: readonly OccupancyScenarioId[];
  // Org design options this CAPEX option applies to.
  appliesToOrgDesignOptions: readonly OrgDesignStructureOptionId[];
  // CAPEX is a capital investment, not an operating cost. Excluded from EBITDA.
  ebitdaTreatment: CapexEbitdaTreatment;
  // CAPEX appears as a negative outflow in the cash-flow bridge after the operating result.
  cashFlowTreatment: CapexCashFlowTreatment;
  // Provenance and source notes.
  sourceNotes: string;
}

// Downstream cash-flow bridge formula architecture.
// Documented for structural reference only. None of these formulas are implemented.
// Source: screenshot provided by Luciana (Phase 10B).
// IMPORTANT: numeric values in the screenshot are NOT Rio CAPEX source values.
export interface CapexCashFlowBridgeFormulaArchitecture {
  // Sign convention (confirmed Phase 10B):
  //   capexInvestmentPositiveBRL_y  = positive annual amount from annualScheduleByYear[y]
  //   capexCashFlowSignedBRL_y      = -capexInvestmentPositiveBRL_y
  signConventionFormula: string;
  // CAPEX exposure — sum of all annual positive investment amounts:
  //   capexExposureBRL = sum(capexInvestmentPositiveBRL_y, for all years)
  exposureFormula: string;
  // Cash-flow bridge (CAPEX outflow after EBITDA):
  //   cashFlowAfterCapex_y = operatingCashFlow_y + capexCashFlowSignedBRL_y
  //   (equivalent: cashFlowAfterCapex_y = operatingCashFlow_y - capexInvestmentPositiveBRL_y)
  cashFlowBridgeFormula: string;
  // Cumulative cash-flow bridge:
  //   cumulativeCashFlowAfterCapex_y = cumulativeCashFlowAfterCapex_(y-1) + cashFlowAfterCapex_y
  cumulativeCashFlowFormula: string;
  // DCF bridge (future NPV / discounted-payback use):
  //   dcfAnnual_y       = cashFlowAfterCapex_y / (1 + discountRate) ^ discountPeriod_y
  //   dcfAccumulated_y  = dcfAccumulated_(y-1) + dcfAnnual_y
  dcfBridgeFormula: string;
  // Conditions that must be met before any bridge formula is implemented.
  implementationGate: string;
}

// Future optional depreciation / PP&E roll-forward architecture.
// Documented for structural reference only. Not implemented in Phase 10B.
// Source: screenshot provided by Luciana. Numeric values are NOT Rio source values.
export interface CapexDepreciationArchitectureNote {
  // Existing PP&E depreciation (if applicable):
  //   existingPpeDepreciation_y = existingPpeNetValue / usefulLifeYears
  existingPpeFormula: string;
  // New CAPEX depreciation:
  //   annualDepreciationFromCapex_y = capexInvestmentPositiveBRL_y / capexUsefulLifeYears
  newCapexDepreciationFormula: string;
  // Partial first-year convention (visible in screenshot, not confirmed for Rio):
  //   firstYearDepreciation_y = annualDepreciationFromCapex_y / 2
  partialYearConventionNote: string;
  // Net PP&E roll-forward:
  //   netPpeEnd_y      = netPpeStart_y + capexInvestmentPositiveBRL_y - depreciation_y
  //   netPpeStart_(y+1) = netPpeEnd_y
  ppRollForwardFormula: string;
  // Conditions that must be met before this module is implemented.
  implementationGate: string;
}
