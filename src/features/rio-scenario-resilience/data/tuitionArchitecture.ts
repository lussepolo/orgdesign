export interface TuitionArchitectureOption {
  id: "bp1_division_differentiated" | "bp2_ey_ls_unified" | "bp3_ey_to_ms_unified";
  label: string;
  logic: string;
  bands: string[];
}

export const tuitionArchitecture: TuitionArchitectureOption[] = [
  {
    id: "bp1_division_differentiated",
    label: "BP1 · Division-Differentiated Tuition",
    logic: "Different tuition by division.",
    bands: ["EY", "LS", "MS", "HS"],
  },
  {
    id: "bp2_ey_ls_unified",
    label: "BP2 · EY/LS Unified, MS and HS Differentiated",
    logic: "Same tuition for EY/LS, different tuition for MS, different tuition for HS.",
    bands: ["EY_LS", "MS", "HS"],
  },
  {
    id: "bp3_ey_to_ms_unified",
    label: "BP3 · EY to MS Unified, HS Differentiated",
    logic: "Same tuition from EY to MS, different tuition for HS.",
    bands: ["EY_LS_MS", "HS"],
  },
] as const;

export const tuitionArchitectureNote =
  "Tuition values, discount assumptions, and annual adjustment assumptions are not yet validated in this feature folder.";

