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
//
// Phase 15G.2: accepts discriminated mode prop.
//   mode="standalone"  → full Phase 15F local state (preserved exactly).
//   mode="integrated"  → driven by CapitalDecisionWorkspaceController from
//                        App.tsx; DRE fields are read-only; CAPEX is editable.

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { Badge, Card } from "../../../../components/common";
import { calculateInvestmentInterpretation } from "../../model/investmentInterpretationEngine";
import { DRE_GOVERNANCE_READINESS } from "../../model/dreGovernanceReadiness";
import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import type { CapexOptionId } from "../../model/capexOptionSourceContract";
import {
  MAX_SAVED_SCENARIOS,
  type CapitalDecisionLeverId,
  type SavedScenario,
  type CapitalDecisionWorkspaceController,
} from "./capitalDecisionUiTypes";
import { ScenarioConfigurationPanel, IntegratedScenarioConfigurationPanel } from "./ScenarioConfigurationPanel";
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

// ── Inherited DRE governance disclosure (compact, non-blocking) ───────────────

function CapitalDecisionGovernanceDisclosure() {
  const gov = DRE_GOVERNANCE_READINESS;
  const engineLabel = gov.engineeringReadiness === "engineering_ready" ? "validated" : "not ready";
  const financeLabel =
    gov.financeSourceReadiness === "confirmed" ? "confirmed" : "pending";
  const boardLabel =
    gov.boardRatificationReadiness === "board_ratified" ? "ratified" : "not ratified";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
      <p className="mb-1 font-semibold uppercase tracking-wide text-slate-500">
        DRE Governance Status (inherited)
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-1">
        <span>Technical engine: <span className="font-medium text-slate-700">{engineLabel}</span></span>
        <span>Finance-source confirmation: <span className="font-medium text-amber-700">{financeLabel}</span></span>
        <span>Working scenario ratification: <span className="font-medium text-slate-700">{boardLabel}</span></span>
      </div>
      <p className="mt-1.5 text-slate-500">
        CAPEX and investment metrics calculate regardless of Finance-source confirmation or board ratification status.
      </p>
    </div>
  );
}

// ── Discriminated props ───────────────────────────────────────────────────────

export type CapitalDecisionViewProps =
  | { readonly mode: "standalone" }
  | {
      readonly mode: "integrated";
      readonly workspace: CapitalDecisionWorkspaceController;
      readonly onNavigateToDre: () => void;
    };

// ── Standalone mode (Phase 15F, preserved exactly) ───────────────────────────

function StandaloneCapitalDecisionView() {
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
        actions={<Badge variant="info">Phase 15 · Capital Decision</Badge>}
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

      <CapitalDecisionGovernanceDisclosure />

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

// ── Integrated mode (Phase 15G.2) ─────────────────────────────────────────────

function IntegratedCapitalDecisionView({
  workspace,
  onNavigateToDre,
}: {
  workspace: CapitalDecisionWorkspaceController;
  onNavigateToDre: () => void;
}) {
  const { state, setActiveScenario, updateCapexOption, duplicateForCapexVariant, removeScenario } =
    workspace;
  const [scenarioAId, setScenarioAId] = useState<string | null>(null);
  const [scenarioBId, setScenarioBId] = useState<string | null>(null);

  const activeScenario =
    state.scenarios.find((s) => s.id === state.activeScenarioId) ??
    state.scenarios[0] ??
    null;

  if (state.scenarios.length === 0) {
    return (
      <div className="space-y-8">
        <Card
          title="Decisão de Capital"
          subtitle="Integrated mode — DRE handoff"
          icon={Activity}
          actions={<Badge variant="info">Phase 15 · Capital Decision</Badge>}
        >
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            No scenarios yet. Go to the DRE Scenario Simulator, configure the four DRE levers,
            and click "Send to Capital Decision" to create your first integrated scenario.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={onNavigateToDre}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              ← Go to DRE Scenario Simulator
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card
        title="Decisão de Capital"
        subtitle="Integrated mode — DRE handoff"
        icon={Activity}
        actions={<Badge variant="info">Phase 15 · Capital Decision</Badge>}
      >
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Scenarios imported from the DRE Simulator. The four DRE fields are fixed per scenario
          and can only be changed in the DRE Simulator. CAPEX is the one freely editable lever
          here. Each configuration is evaluated by the Phase 15E investment-interpretation engine.
        </p>
      </Card>

      <CapitalDecisionGovernanceDisclosure />

      <IntegratedScenarioConfigurationPanel
        scenarios={state.scenarios}
        activeScenarioId={activeScenario?.id ?? null}
        onSelectScenario={setActiveScenario}
        onUpdateCapex={(id, capexOptionId) => updateCapexOption(id, capexOptionId as CapexOptionId)}
        onDuplicateForCapexVariant={(id, capexOptionId) =>
          duplicateForCapexVariant(id, capexOptionId as CapexOptionId)
        }
        onRemoveScenario={removeScenario}
        onNavigateToDre={onNavigateToDre}
      />

      {activeScenario && (
        <section className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Scenario Result
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{activeScenario.name}</h2>
          </div>
          <ScenarioResultPanel scenario={activeScenario} />
        </section>
      )}

      <ScenarioComparisonPanel
        scenarios={state.scenarios}
        scenarioAId={scenarioAId}
        scenarioBId={scenarioBId}
        onSelectA={setScenarioAId}
        onSelectB={setScenarioBId}
      />
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function CapitalDecisionView(props: CapitalDecisionViewProps) {
  if (props.mode === "integrated") {
    return (
      <IntegratedCapitalDecisionView
        workspace={props.workspace}
        onNavigateToDre={props.onNavigateToDre}
      />
    );
  }
  return <StandaloneCapitalDecisionView />;
}

export default CapitalDecisionView;
