// Phase 15G.2 — Persistent in-memory session workspace for the Capital
// Decision integrated mode.
//
// State lives in React (useState) above the AnimatePresence boundary in
// App.tsx, surviving all tab switches for the session lifetime.
//
// The stateRef pattern ensures synchronous controller actions always read
// the latest committed state without stale-closure issues: each action reads
// stateRef.current, computes the next state via a pure transition, writes
// stateRef.current = nextState, then calls setState(nextState) to trigger a
// re-render, and returns the result immediately.

import { useCallback, useRef, useState } from "react";
import { calculateInvestmentInterpretation } from "../model/investmentInterpretationEngine";
import type { CapexOptionId } from "../model/capexOptionSourceContract";
import type { DreScenarioSimulatorSelections } from "../../../hooks/useDreScenarioSimulator";
import {
  INITIAL_WORKSPACE_STATE,
  transitionImportFromDre,
  transitionDuplicateForCapexVariant,
  transitionRemoveScenario,
  transitionUpdateCapexOption,
  transitionSetActiveScenario,
  type BuildResultFn,
  type CapitalDecisionWorkspaceController,
  type CapitalDecisionWorkspaceState,
  type DuplicateForCapexVariantResult,
  type ImportFromDreResult,
} from "../state/capitalDecisionWorkspace";

const buildResult: BuildResultFn = (input) => calculateInvestmentInterpretation(input);

export function useCapitalDecisionWorkspace(): CapitalDecisionWorkspaceController {
  const [state, setState] = useState<CapitalDecisionWorkspaceState>(INITIAL_WORKSPACE_STATE);
  const stateRef = useRef<CapitalDecisionWorkspaceState>(state);

  function commit(next: CapitalDecisionWorkspaceState): void {
    stateRef.current = next;
    setState(next);
  }

  const importFromDre = useCallback(
    (selections: DreScenarioSimulatorSelections): ImportFromDreResult => {
      const { nextState, result } = transitionImportFromDre(
        stateRef.current,
        selections,
        buildResult,
      );
      commit(nextState);
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const duplicateForCapexVariant = useCallback(
    (scenarioId: string, capexOptionId: CapexOptionId): DuplicateForCapexVariantResult => {
      const { nextState, result } = transitionDuplicateForCapexVariant(
        stateRef.current,
        scenarioId,
        capexOptionId,
        buildResult,
      );
      commit(nextState);
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const removeScenario = useCallback((scenarioId: string): void => {
    commit(transitionRemoveScenario(stateRef.current, scenarioId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveScenario = useCallback((scenarioId: string): void => {
    commit(transitionSetActiveScenario(stateRef.current, scenarioId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCapexOption = useCallback(
    (scenarioId: string, capexOptionId: CapexOptionId): void => {
      commit(transitionUpdateCapexOption(stateRef.current, scenarioId, capexOptionId, buildResult));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return { state, importFromDre, duplicateForCapexVariant, removeScenario, setActiveScenario, updateCapexOption };
}
