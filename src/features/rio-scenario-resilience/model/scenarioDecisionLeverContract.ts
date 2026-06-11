import type {
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import type { TuitionScenarioId } from "./revenueInputs";
import type { CapexOptionId } from "./capexOptionSourceContract";

export type ScenarioDecisionLeverId =
  | "opening_grades"
  | "occupancy_enrollment"
  | "org_design_structure"
  | "ms_hs_progression_model"
  | "tuition"
  | "service_contracts"
  | "capex";

export type ScenarioDecisionLeverSelectionStatus =
  | "not_selected"
  | "source_evidence_available_selection_required"
  | "needs_mapping"
  | "blocked";

export interface ScenarioDecisionLeverSelection<
  TLeverId extends ScenarioDecisionLeverId,
  TOptionId extends string,
> {
  leverId: TLeverId;
  selectedOptionId: TOptionId | null;
  selectionStatus: ScenarioDecisionLeverSelectionStatus;
  notes?: string;
}

export interface ScenarioDecisionLeverSelections {
  openingGrades: ScenarioDecisionLeverSelection<
    "opening_grades",
    OpeningPackageId
  >;
  occupancyEnrollment: ScenarioDecisionLeverSelection<
    "occupancy_enrollment",
    OccupancyScenarioId
  >;
  orgDesignStructure: ScenarioDecisionLeverSelection<
    "org_design_structure",
    string
  >;
  msHsProgressionModel: ScenarioDecisionLeverSelection<
    "ms_hs_progression_model",
    string
  >;
  tuition: ScenarioDecisionLeverSelection<"tuition", TuitionScenarioId>;
  serviceContracts: ScenarioDecisionLeverSelection<
    "service_contracts",
    string
  >;
  // Phase 10C.1 (2026-06-07): CAPEX is a board decision lever with two options.
  capex: ScenarioDecisionLeverSelection<"capex", CapexOptionId>;
}

export const EMPTY_SCENARIO_DECISION_LEVER_SELECTIONS: ScenarioDecisionLeverSelections =
  {
    openingGrades: {
      leverId: "opening_grades",
      selectedOptionId: null,
      selectionStatus: "source_evidence_available_selection_required",
    },
    occupancyEnrollment: {
      leverId: "occupancy_enrollment",
      selectedOptionId: null,
      selectionStatus: "source_evidence_available_selection_required",
    },
    orgDesignStructure: {
      leverId: "org_design_structure",
      selectedOptionId: null,
      selectionStatus: "needs_mapping",
    },
    msHsProgressionModel: {
      leverId: "ms_hs_progression_model",
      selectedOptionId: null,
      selectionStatus: "needs_mapping",
      notes:
        "Authoritative top-level lever. App-tab semantics remain deferred until Phase 4.",
    },
    tuition: {
      leverId: "tuition",
      selectedOptionId: null,
      selectionStatus: "needs_mapping",
    },
    serviceContracts: {
      leverId: "service_contracts",
      selectedOptionId: null,
      selectionStatus: "needs_mapping",
    },
    // Phase 10C.1 (2026-06-07): CAPEX options are available (capex_90m_brl, capex_100m_brl).
    capex: {
      leverId: "capex",
      selectedOptionId: null,
      selectionStatus: "source_evidence_available_selection_required",
    },
  };
