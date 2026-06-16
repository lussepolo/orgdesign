// Phase 15G.2 — Pure state types and transitions for the Capital Decision
// integrated workspace.
//
// No React. No side effects. All functions are pure. The controller interface
// is implemented by useCapitalDecisionWorkspace.ts.
//
// Duplicate detection uses 4 DRE fields only (NOT capexOptionId).
// Duplicate check happens BEFORE capacity check.
// nextScenarioOrdinal is monotonic — never resets.

import type { CapexOptionId } from "../model/capexOptionSourceContract";
import type { CapitalDecisionEngineInput } from "../model/capitalDecisionEngineContract";
import type { InvestmentInterpretationResult } from "../model/investmentInterpretationEngineContract";
import type { DreScenarioSimulatorSelections } from "../../../hooks/useDreScenarioSimulator";
import { MAX_SAVED_SCENARIOS, type SavedScenario } from "../components/CapitalDecision/capitalDecisionUiTypes";

export const DEFAULT_CAPEX_OPTION_ID = "capex_100m_brl" as const satisfies CapexOptionId;
export const MAX_INTEGRATED_SCENARIOS = MAX_SAVED_SCENARIOS;

export type IntegratedScenarioKind = "dre_import" | "capex_variant";

// Extends SavedScenario with provenance fields. Structurally assignable to
// SavedScenario — no casts needed when passing to ScenarioComparisonPanel /
// ScenarioResultPanel which accept SavedScenario.
export interface IntegratedCapitalDecisionScenario extends SavedScenario {
  readonly origin: "dre";
  readonly scenarioKind: IntegratedScenarioKind;
  readonly variantOfScenarioId: string | null;
}

export interface CapitalDecisionWorkspaceState {
  readonly scenarios: readonly IntegratedCapitalDecisionScenario[];
  readonly activeScenarioId: string | null;
  readonly nextScenarioOrdinal: number;
}

export const INITIAL_WORKSPACE_STATE: CapitalDecisionWorkspaceState = {
  scenarios: [],
  activeScenarioId: null,
  nextScenarioOrdinal: 1,
};

export type ImportFromDreResult =
  | { readonly status: "added"; readonly scenarioId: string }
  | { readonly status: "already_present"; readonly scenarioId: string }
  | { readonly status: "limit_reached" };

export type DuplicateForCapexVariantResult =
  | { readonly status: "added"; readonly scenarioId: string }
  | { readonly status: "limit_reached" }
  | { readonly status: "source_not_found" };

export interface WorkspaceTransition<T> {
  readonly nextState: CapitalDecisionWorkspaceState;
  readonly result: T;
}

export interface CapitalDecisionWorkspaceController {
  readonly state: CapitalDecisionWorkspaceState;
  importFromDre(selections: DreScenarioSimulatorSelections): ImportFromDreResult;
  duplicateForCapexVariant(scenarioId: string, capexOptionId: CapexOptionId): DuplicateForCapexVariantResult;
  removeScenario(scenarioId: string): void;
  setActiveScenario(scenarioId: string): void;
  updateCapexOption(scenarioId: string, capexOptionId: CapexOptionId): void;
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

export function generateScenarioId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ws-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function dreInputMatchesScenario(
  selections: DreScenarioSimulatorSelections,
  scenario: IntegratedCapitalDecisionScenario,
): boolean {
  return (
    scenario.input.openingPackageId === selections.openingPackageId &&
    scenario.input.occupancyScenarioId === selections.occupancyScenarioId &&
    scenario.input.tuitionScenarioId === selections.tuitionScenarioId &&
    scenario.input.orgDesignOptionId === selections.orgDesignOptionId
  );
}

export function findExistingDreImportMatch(
  state: CapitalDecisionWorkspaceState,
  selections: DreScenarioSimulatorSelections,
): IntegratedCapitalDecisionScenario | null {
  return (
    state.scenarios.find(
      (s) => s.scenarioKind === "dre_import" && dreInputMatchesScenario(selections, s),
    ) ?? null
  );
}

// buildResult is injected so transitions are testable without the engine.
export type BuildResultFn = (input: CapitalDecisionEngineInput) => InvestmentInterpretationResult;

// ── Pure state transitions ────────────────────────────────────────────────────

export function transitionImportFromDre(
  state: CapitalDecisionWorkspaceState,
  selections: DreScenarioSimulatorSelections,
  buildResult: BuildResultFn,
): WorkspaceTransition<ImportFromDreResult> {
  // Duplicate check BEFORE capacity check.
  const existing = findExistingDreImportMatch(state, selections);
  if (existing !== null) {
    return {
      nextState: { ...state, activeScenarioId: existing.id },
      result: { status: "already_present", scenarioId: existing.id },
    };
  }
  if (state.scenarios.length >= MAX_INTEGRATED_SCENARIOS) {
    return { nextState: state, result: { status: "limit_reached" } };
  }
  const id = generateScenarioId();
  const name = `Scenario ${state.nextScenarioOrdinal}`;
  const input: CapitalDecisionEngineInput = {
    openingPackageId: selections.openingPackageId,
    occupancyScenarioId: selections.occupancyScenarioId,
    tuitionScenarioId: selections.tuitionScenarioId,
    orgDesignOptionId: selections.orgDesignOptionId,
    capexOptionId: DEFAULT_CAPEX_OPTION_ID,
  };
  const scenario: IntegratedCapitalDecisionScenario = {
    id,
    name,
    input,
    result: buildResult(input),
    origin: "dre",
    scenarioKind: "dre_import",
    variantOfScenarioId: null,
  };
  return {
    nextState: {
      scenarios: [...state.scenarios, scenario],
      activeScenarioId: id,
      nextScenarioOrdinal: state.nextScenarioOrdinal + 1,
    },
    result: { status: "added", scenarioId: id },
  };
}

export function transitionDuplicateForCapexVariant(
  state: CapitalDecisionWorkspaceState,
  sourceScenarioId: string,
  capexOptionId: CapexOptionId,
  buildResult: BuildResultFn,
): WorkspaceTransition<DuplicateForCapexVariantResult> {
  const source = state.scenarios.find((s) => s.id === sourceScenarioId);
  if (source === undefined) {
    return { nextState: state, result: { status: "source_not_found" } };
  }
  if (state.scenarios.length >= MAX_INTEGRATED_SCENARIOS) {
    return { nextState: state, result: { status: "limit_reached" } };
  }
  const existingVariantCount = state.scenarios.filter(
    (s) => s.variantOfScenarioId === sourceScenarioId,
  ).length;
  const suffix =
    existingVariantCount === 0
      ? "— CAPEX variant"
      : `— CAPEX variant ${existingVariantCount + 1}`;
  const id = generateScenarioId();
  const name = `${source.name} ${suffix}`;
  const input: CapitalDecisionEngineInput = { ...source.input, capexOptionId };
  const scenario: IntegratedCapitalDecisionScenario = {
    id,
    name,
    input,
    result: buildResult(input),
    origin: "dre",
    scenarioKind: "capex_variant",
    variantOfScenarioId: sourceScenarioId,
  };
  return {
    nextState: {
      ...state,
      scenarios: [...state.scenarios, scenario],
      activeScenarioId: id,
      nextScenarioOrdinal: state.nextScenarioOrdinal + 1,
    },
    result: { status: "added", scenarioId: id },
  };
}

export function transitionRemoveScenario(
  state: CapitalDecisionWorkspaceState,
  scenarioId: string,
): CapitalDecisionWorkspaceState {
  if (state.scenarios.length <= 1) return state;
  const next = state.scenarios.filter((s) => s.id !== scenarioId);
  const nextActiveId =
    state.activeScenarioId === scenarioId ? (next[0]?.id ?? null) : state.activeScenarioId;
  return { ...state, scenarios: next, activeScenarioId: nextActiveId };
}

export function transitionUpdateCapexOption(
  state: CapitalDecisionWorkspaceState,
  scenarioId: string,
  capexOptionId: CapexOptionId,
  buildResult: BuildResultFn,
): CapitalDecisionWorkspaceState {
  const next = state.scenarios.map((s) => {
    if (s.id !== scenarioId) return s;
    const nextInput: CapitalDecisionEngineInput = { ...s.input, capexOptionId };
    return { ...s, input: nextInput, result: buildResult(nextInput) };
  });
  return { ...state, scenarios: next };
}

export function transitionSetActiveScenario(
  state: CapitalDecisionWorkspaceState,
  scenarioId: string,
): CapitalDecisionWorkspaceState {
  return { ...state, activeScenarioId: scenarioId };
}
