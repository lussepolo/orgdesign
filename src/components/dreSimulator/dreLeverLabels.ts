// Phase 14B-UI: shared display-label maps for DRE scenario lever values.
// Labels only — no calculation logic, no new data.

export const OCCUPANCY_LABELS: Record<string, string> = {
  pessimista: "Pessimista (Conservative)",
  intermediario: "Intermediário (Base)",
  otimista: "Otimista (Optimistic)",
};

export const TUITION_LABELS: Record<string, string> = {
  bp1_division_differentiated: "BP1 — Division Differentiated",
  bp2_ey_ls_unified: "BP2 — EY/LS Unified",
  bp3_ey_to_ms_unified: "BP3 — EY to MS Unified",
  rj4: "Cenário 4 — Division-Differentiated Premium Steps",
  rj5: "Cenário 5 — Division-Differentiated Highest Premium",
};

export const ORG_DESIGN_OPTION_LABELS: Record<string, string> = {
  minimum_experience: "Minimum Experience",
  balanced_experience: "Balanced Experience",
  premium_experience: "Premium Experience",
};

// Phase 14B-UI-VISUAL-FIXES: human-readable opening-package label, e.g.
// "t1_g4" -> "T1–G4 Opening Package". Display-only string formatting; the
// raw id (e.g. "t1_g4") is still shown alongside as a secondary code.
export const formatOpeningPackageLabel = (openingPackageId: string): string => {
  const match = /^t(\d+)_g(\d+)$/.exec(openingPackageId);
  if (!match) return openingPackageId;
  const [, tier, grade] = match;
  return `T${tier}–G${grade} Opening Package`;
};
