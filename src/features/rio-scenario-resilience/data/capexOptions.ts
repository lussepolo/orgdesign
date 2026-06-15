// Phase 15F — UI-facing CAPEX lever option source.
//
// IDs are the canonical CapexOptionId values confirmed in capexOptionSource.ts
// (Phase 10B). Labels are the board-facing total-investment labels for this
// UI, distinct from the internal source labels ("CAPEX opção 90M BRL" /
// "CAPEX opção 100M BRL").
//
// This file contains only IDs and display labels. It does not duplicate
// totalCapexPositiveBRL, annual schedules, phasing, or depreciation logic —
// those remain calculation-engine responsibilities in capexOptionSource.ts.

import type { CapexOptionId } from "../model/capexOptionSourceContract";

export interface CapexUiOption {
  readonly id: CapexOptionId;
  readonly label: string;
}

export const capexOptions: readonly CapexUiOption[] = [
  { id: "capex_90m_brl", label: "R$ 90 milhões" },
  { id: "capex_100m_brl", label: "R$ 100 milhões" },
] as const;
