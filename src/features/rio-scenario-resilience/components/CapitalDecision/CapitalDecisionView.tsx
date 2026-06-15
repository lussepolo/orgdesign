// Phase 15F — Capital Decision view.
//
// Top-level feature-local view for the Rio Capital Decision UI. Holds
// feature-local React state for up to MAX_SAVED_SCENARIOS saved scenario
// configurations. Each scenario configuration produces exactly one
// InvestmentInterpretationResult via calculateInvestmentInterpretation;
// only the scenario whose lever input changed is recalculated. Pairwise
// comparison (section C) reuses already-computed results via
// compareInvestmentScenarioPair -- no scenario is recalculated for
// comparison purposes.
//
// No Tier, score, ranking, overall winner, or recommendation is produced or
// displayed anywhere in this view.

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { Badge, Card } from "../../../../components/common";
import { calculateInvestmentInterpretation } from "../../model/investmentInterpretationEngine";
import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import {
  MAX_SAVED_SCENARIOS,
  type CapitalDecisionLeverId,
  type SavedScenario,
} from "./capitalDecisionUiTypes";
import { ScenarioConfigurationPanel } from "./ScenarioConfigurationPanel";
import { ScenarioResultPanel } from "./ScenarioResultPanel";
import { ScenarioComparisonPanel } from "./ScenarioComparisonPanel";

// Canonical default configuration (production scenario input, not a cached
// workbook fixture). The UI calls calculateInvestmentInterpretation on this
// input on first load so the view shows a calculated result rather than a
// blocked empty state.
const DEFAULT_INPUT: CapitalDecisionEngineInput = {
  openingPackageId: "t1_g3",
  occupancyScenarioId: "intermediario",
  tuitionScenarioId: "bp1_division_differentiated",
  orgDesignOptionId: "balanced_experience",
  capexOptionId: "capex_100m_brl",
};

const LEVER_TO_INPUT_KEY: Record<CapitalDecisionLeverId, keyof CapitalDecisionEngineInput> = {
  openingGrades: "openingPackageId",
  occupancy: "occupancyScenarioId",
  orgDesignStructure: "orgDesignOptionId",
  tuition: "tuitionScenarioId",
  capex: "capexOptionId",
};

function createScenarioId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `scenario-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

function createScenario(name: string, input: CapitalDecisionEngineInput): SavedScenario {
  return {
    id: createScenarioId(),
    name,
    input,
    result: calculateInvestmentInterpretation(input),
  };
}

function configKey(input: CapitalDecisionEngineInput): string {
  return [
    input.openingPackageId,
    input.occupancyScenarioId,
    input.tuitionScenarioId,
    input.orgDesignOptionId,
    input.capexOptionId,
  ].join("|");
}

export function CapitalDecisionView() {
  const [scenarios, setScenarios] = useState<SavedScenario[]>(() => [
    createScenario("Scenario 1", DEFAULT_INPUT),
  ]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    () => scenarios[0].id,
  );
  const [scenarioAId, setScenarioAId] = useState<string | null>(null);
  const [scenarioBId, setScenarioBId] = useState<string | null>(null);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];

  const duplicateConfigScenarioIds = useMemo(() => {
    const keyCounts = new Map<string, number>();
    for (const scenario of scenarios) {
      const key = configKey(scenario.input);
      keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
    }
    const duplicateIds = new Set<string>();
    for (const scenario of scenarios) {
      const key = configKey(scenario.input);
      if ((keyCounts.get(key) ?? 0) > 1) {
        duplicateIds.add(scenario.id);
      }
    }
    return duplicateIds;
  }, [scenarios]);

  function handleUpdateLever(id: string, leverId: CapitalDecisionLeverId, value: string) {
    setScenarios((current) =>
      current.map((scenario) => {
        if (scenario.id !== id) return scenario;
        const inputKey = LEVER_TO_INPUT_KEY[leverId];
        const nextInput: CapitalDecisionEngineInput = {
          ...scenario.input,
          [inputKey]: value,
        } as CapitalDecisionEngineInput;
        return {
          ...scenario,
          input: nextInput,
          result: calculateInvestmentInterpretation(nextInput),
        };
      }),
    );
  }

  function handleRenameScenario(id: string, name: string) {
    setScenarios((current) =>
      current.map((scenario) => (scenario.id === id ? { ...scenario, name } : scenario)),
    );
  }

  function handleAddScenario() {
    setScenarios((current) => {
      if (current.length >= MAX_SAVED_SCENARIOS) return current;
      const next = createScenario(`Scenario ${current.length + 1}`, DEFAULT_INPUT);
      return [...current, next];
    });
  }

  function handleDuplicateScenario(id: string) {
    setScenarios((current) => {
      if (current.length >= MAX_SAVED_SCENARIOS) return current;
      const source = current.find((scenario) => scenario.id === id);
      if (!source) return current;
      const next = createScenario(`${source.name} (copy)`, source.input);
      return [...current, next];
    });
  }

  function handleRemoveScenario(id: string) {
    setScenarios((current) => {
      if (current.length <= 1) return current;
      const next = current.filter((scenario) => scenario.id !== id);
      if (selectedScenarioId === id) {
        setSelectedScenarioId(next[0].id);
      }
      if (scenarioAId === id) setScenarioAId(null);
      if (scenarioBId === id) setScenarioBId(null);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <Card
        title="Capital Decision"
        subtitle="Rio Scenario Resilience Simulator"
        icon={Activity}
        actions={<Badge variant="info">Feature-local · not mounted in App</Badge>}
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Configure up to {MAX_SAVED_SCENARIOS} scenarios using the five currently variable
          decision levers (Opening Grades, Occupancy, Org Design Structure, Tuition, CAPEX).
          Each configuration is evaluated by the committed Phase 15E investment-interpretation
          engine. Results show calculation readiness, the investment reference (TIR versus the
          reference WACC), VPL, and discounted payback -- factual figures only, without a Tier,
          score, ranking, or recommendation.
        </p>
      </Card>

      <ScenarioConfigurationPanel
        scenarios={scenarios}
        selectedScenarioId={selectedScenario.id}
        duplicateConfigScenarioIds={duplicateConfigScenarioIds}
        onSelectScenario={setSelectedScenarioId}
        onUpdateLever={handleUpdateLever}
        onRenameScenario={handleRenameScenario}
        onAddScenario={handleAddScenario}
        onDuplicateScenario={handleDuplicateScenario}
        onRemoveScenario={handleRemoveScenario}
      />

      <section className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Scenario Result
          </p>
          <h2 className="text-lg font-semibold text-slate-900">{selectedScenario.name}</h2>
        </div>
        <ScenarioResultPanel scenario={selectedScenario} />
      </section>

      <ScenarioComparisonPanel
        scenarios={scenarios}
        scenarioAId={scenarioAId}
        scenarioBId={scenarioBId}
        onSelectA={setScenarioAId}
        onSelectB={setScenarioBId}
      />
    </div>
  );
}

export default CapitalDecisionView;
