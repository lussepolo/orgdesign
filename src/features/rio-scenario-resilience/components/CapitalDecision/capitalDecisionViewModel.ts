// Phase 15F — view-model / formatting adapter for the Capital Decision UI.
//
// All number/text formatting for InvestmentInterpretationResult lives here.
// Nothing in this module recalculates, rounds for calculation purposes, or
// mutates any engine value -- it only derives display strings from the
// verbatim Phase 15E result. "Compact" and "detailed" are display transforms
// only; the underlying numeric value is unchanged.

import type {
  InvestmentInterpretationResult,
  InvestmentReferenceStatus,
  NpvSign,
} from "../../model/investmentInterpretationEngineContract";

const BRL_COMPACT = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const BRL_DETAILED = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const PERCENT_ONE_DECIMAL = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const PERCENT_ZERO_DECIMAL = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const UNAVAILABLE_TEXT = "—";
export const NOT_AVAILABLE_LONG_TEXT = "Não disponível";

// ---------------------------------------------------------------------------
// VPL (BRL)
// ---------------------------------------------------------------------------

export interface VplDisplay {
  readonly compact: string;
  readonly detailed: string;
  readonly ariaLabel: string;
}

export function formatVpl(npvBRL: number | null, npvSign: NpvSign): VplDisplay {
  if (npvBRL === null || npvSign === "unavailable") {
    return {
      compact: UNAVAILABLE_TEXT,
      detailed: NOT_AVAILABLE_LONG_TEXT,
      ariaLabel: "VPL não disponível",
    };
  }
  return {
    compact: BRL_COMPACT.format(npvBRL),
    detailed: BRL_DETAILED.format(npvBRL),
    ariaLabel: `VPL ${BRL_DETAILED.format(npvBRL)}`,
  };
}

// ---------------------------------------------------------------------------
// TIR / WACC percentages and spread
// ---------------------------------------------------------------------------

export function formatPercentOneDecimal(rate: number | null): string {
  if (rate === null) return UNAVAILABLE_TEXT;
  return PERCENT_ONE_DECIMAL.format(rate);
}

export function formatPercentZeroDecimal(rate: number): string {
  return PERCENT_ZERO_DECIMAL.format(rate);
}

// Spread in percentage points, with an explicit sign, e.g. "+2,2 p.p." or
// "−1,8 p.p.".
export function formatSpreadPp(spreadRate: number | null): string {
  if (spreadRate === null) return UNAVAILABLE_TEXT;
  const pp = spreadRate * 100;
  const rounded = Math.round(pp * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "−" : "";
  const abs = Math.abs(rounded).toFixed(1).replace(".", ",");
  return `${sign}${abs} p.p.`;
}

// ---------------------------------------------------------------------------
// Discounted payback
// ---------------------------------------------------------------------------

export interface DiscountedPaybackDisplay {
  readonly value: string;
  readonly detail: string | null;
}

export function formatDiscountedPayback(
  result: InvestmentInterpretationResult,
): DiscountedPaybackDisplay {
  switch (result.discountedPaybackStatus) {
    case "calculated":
      return {
        value: `${result.discountedPaybackYears} anos`,
        detail: null,
      };
    case "not_reached_within_horizon":
      return {
        value: "Não atingido em 20 anos",
        detail:
          "O payback descontado não é atingido no horizonte operacional de 20 anos.",
      };
    case "not_applicable_negative_npv":
      return {
        value: "Não aplicável",
        detail: "O payback descontado não se aplica porque o VPL é negativo.",
      };
    case "blocked_missing_phase15c_inputs":
    case "invalid_cash_flow_series":
    default:
      // Technical null. Never displayed as "NA", "20+", or "0".
      return {
        value: NOT_AVAILABLE_LONG_TEXT,
        detail: null,
      };
  }
}

// ---------------------------------------------------------------------------
// Investment-reference status language (strict TIR-vs-WACC)
// ---------------------------------------------------------------------------

export interface InvestmentReferenceStatusDisplay {
  readonly statusText: string;
  readonly detailNote: string | null;
}

export function getInvestmentReferenceStatusDisplay(
  result: InvestmentInterpretationResult,
): InvestmentReferenceStatusDisplay {
  const waccPercent = formatPercentZeroDecimal(result.investmentReferenceWaccRate);

  switch (result.investmentReferenceStatus) {
    case "meets_reference":
      return {
        statusText: `TIR exceeds the ${waccPercent} reference WACC.`,
        detailNote: null,
      };
    case "does_not_meet_reference": {
      const base = `TIR is equal to or below the ${waccPercent} reference WACC.`;
      const spread = result.tirWaccSpreadRate;
      if (spread === 0) {
        return { statusText: base, detailNote: "TIR is equal to the reference WACC." };
      }
      if (spread !== null && spread < 0) {
        return { statusText: base, detailNote: "TIR is below the reference WACC." };
      }
      return { statusText: base, detailNote: null };
    }
    case "irr_unavailable":
      return {
        statusText: "TIR could not be calculated for this scenario.",
        detailNote: result.irrStatusReason || null,
      };
    case "blocked_upstream":
      return {
        statusText: result.calculationStatusReason,
        detailNote: null,
      };
    default:
      return { statusText: UNAVAILABLE_TEXT, detailNote: null };
  }
}

export function getInvestmentReferenceStatusLabel(
  status: InvestmentReferenceStatus,
): string {
  switch (status) {
    case "meets_reference":
      return "Meets reference";
    case "does_not_meet_reference":
      return "Does not meet reference";
    case "irr_unavailable":
      return "TIR unavailable";
    case "blocked_upstream":
      return "Calculation blocked";
  }
}

// ---------------------------------------------------------------------------
// VPL sign language
// ---------------------------------------------------------------------------

export function getNpvSignText(npvSign: NpvSign): string {
  switch (npvSign) {
    case "positive":
      return "VPL is positive.";
    case "zero":
      return "VPL is at breakeven (zero).";
    case "negative":
      return "VPL is negative.";
    case "unavailable":
      return "VPL is not available for this scenario.";
  }
}

// ---------------------------------------------------------------------------
// Calculation-readiness language
// ---------------------------------------------------------------------------

export function isBlockedUpstream(result: InvestmentInterpretationResult): boolean {
  return result.investmentReferenceStatus === "blocked_upstream";
}

export function getCalculationReadinessText(
  result: InvestmentInterpretationResult,
): string {
  if (result.calculationStatus === "calculated") {
    return "This scenario is calculated.";
  }
  return result.calculationStatusReason;
}
