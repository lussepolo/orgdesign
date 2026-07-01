import type { TuitionScenarioId } from "../model/revenueInputs";

export interface TuitionBandDetail {
  bandLabel: string;
  monthlyTuitionBRL: number;
  annualGrossContractValueBRL: number;
}

export interface TuitionArchitectureOption {
  id: TuitionScenarioId;
  label: string;
  boardLabel?: string;
  logic: string;
  bands: string[];
  bandDetails?: TuitionBandDetail[];
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
  {
    id: "rj4",
    label: "Cenário 4 · Division-Differentiated with LS/MS/HS Premium Steps",
    boardLabel: "Cenário 4",
    logic: "EY m modality, EY full-day, Lower School, Middle School, High School — each with explicit price steps.",
    bands: ["EY-m", "EY", "LS", "MS", "HS"],
    bandDetails: [
      { bandLabel: "EY – Manhã Modality (T1-m / T2-m)", monthlyTuitionBRL: 5149, annualGrossContractValueBRL: 61788 },
      { bandLabel: "EY – Full Day (T1/T2/Pre-K3/Pre-K4/KG)", monthlyTuitionBRL: 8803, annualGrossContractValueBRL: 105636 },
      { bandLabel: "Lower School (Grades 1–5)", monthlyTuitionBRL: 10610, annualGrossContractValueBRL: 127320 },
      { bandLabel: "Middle School (Grades 6–8)", monthlyTuitionBRL: 11568, annualGrossContractValueBRL: 138816 },
      { bandLabel: "High School (Grades 9–12)", monthlyTuitionBRL: 13265, annualGrossContractValueBRL: 159180 },
    ],
  },
  {
    id: "rj5",
    label: "Cenário 5 · Division-Differentiated Highest Premium Ladder",
    boardLabel: "Cenário 5",
    logic: "EY m modality, EY full-day, Lower School, Middle School, High School — highest price points across all divisions.",
    bands: ["EY-m", "EY", "LS", "MS", "HS"],
    bandDetails: [
      { bandLabel: "EY – Manhã Modality (T1-m / T2-m)", monthlyTuitionBRL: 5407, annualGrossContractValueBRL: 64884 },
      { bandLabel: "EY – Full Day (T1/T2/Pre-K3/Pre-K4/KG)", monthlyTuitionBRL: 9243, annualGrossContractValueBRL: 110916 },
      { bandLabel: "Lower School (Grades 1–5)", monthlyTuitionBRL: 11140, annualGrossContractValueBRL: 133680 },
      { bandLabel: "Middle School (Grades 6–8)", monthlyTuitionBRL: 12146, annualGrossContractValueBRL: 145752 },
      { bandLabel: "High School (Grades 9–12)", monthlyTuitionBRL: 13928, annualGrossContractValueBRL: 167136 },
    ],
  },
];

export const tuitionArchitectureNote =
  "Tuition values, discount assumptions, and annual adjustment assumptions are not yet validated in this feature folder.";
