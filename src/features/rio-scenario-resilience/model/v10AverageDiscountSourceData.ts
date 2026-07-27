// V10-F1B (2026-07-27): canonical average tuition discount ("% Desconto Médio") schedule.
//
// Governance: project-owner decision (Luciana Polonen), NOT a Finance signature.
// Scope of this precedence rule is limited to percentual_desconto_medio, payroll salary
// escalation, and benefits escalation — see docs/audits/rio-resilience/
// phase-v10-f1a-revenue-governance-decision-packet.md (D-R1, D-R3).
//
// Source: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx", sheet "PnL", Row 224
// ("% Desconto Médio"), SHA-256 2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0.
// Values confirmed by direct OOXML/XML cell read (no workbook recalculation), and
// independently cross-validated against workbook v9 PnL!C222:V222 (identical schedule,
// row shifted +2) — see docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md
// section D2b and phase-v10-ab-formula-parity-certification.md.
//
// This is the single source of truth for the average-discount rate. Both the live DRE
// driver (dreRevenueDriverSourceData.ts, percentual_desconto_medio) and the audit-only
// Receita engine schedule (discountScheduleSourceData.ts, DISCOUNT_SCHEDULE_SOURCE) read
// from this module. Neither maintains an independently-typed duplicate rate table.
//
// desconto_metodo ("Descontos Método de Assinatura") is a separate, unrelated deduction
// and is NOT part of this schedule — see R5 in the decision packet (unresolved).

import type { ProjectionYear } from "./revenueInputs";
import { PROJECTION_YEARS } from "./revenueInputs";

export const V10_AVERAGE_DISCOUNT_SOURCE = {
  workbook: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  sheet: "PnL",
  row: 224,
  rowLabel: "% Desconto Médio",
  approvalStatus: "approved_by_project_owner",
  approvalReference: "Phase V10-F1B, project owner (Luciana Polonen), 2026-07-27",
  notFinanceSigned: true,
} as const;

// Explicit rates cover 2028–2035 (v10 PnL!E224:L224). 2036 onward is a confirmed terminal
// rate (v10 PnL!M224:N224 = 12.5%, unchanged through the remainder of the 20-year model
// horizon — no explicit v10 evidence exists past 2037; 2038–2047 carry the terminal rate
// forward as mature-state continuation, consistent with existing GOVERNED_DIRECT_YEARS
// carry-forward conventions elsewhere in this codebase).
const EXPLICIT_RATES_BY_YEAR: Partial<Record<ProjectionYear, number>> = {
  2028: 0.25,
  2029: 0.2,
  2030: 0.2,
  2031: 0.18,
  2032: 0.15,
  2033: 0.15,
  2034: 0.15,
  2035: 0.125,
};

const TERMINAL_RATE = 0.125;
const TERMINAL_RATE_START_YEAR: ProjectionYear = 2036;

// Positive rate, e.g. 0.25 for 25%. Sign is applied at each calculation boundary
// (dreEngine.ts and receitaEngine.ts each apply their own established sign convention).
export function v10AverageDiscountRate(year: ProjectionYear): number {
  return EXPLICIT_RATES_BY_YEAR[year] ?? TERMINAL_RATE;
}

export const V10_AVERAGE_DISCOUNT_SCHEDULE: Readonly<Record<ProjectionYear, number>> =
  Object.fromEntries(
    PROJECTION_YEARS.map((year) => [year, v10AverageDiscountRate(year)]),
  ) as Record<ProjectionYear, number>;

export { TERMINAL_RATE as V10_AVERAGE_DISCOUNT_TERMINAL_RATE };
export { TERMINAL_RATE_START_YEAR as V10_AVERAGE_DISCOUNT_TERMINAL_RATE_START_YEAR };
