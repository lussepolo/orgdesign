// Phase 15F — Scenario configuration panel (page section A).
//
// Renders the five functional, production-wired levers (Opening Grades,
// Occupancy, Org Design Structure, Tuition, CAPEX) for each saved scenario,
// plus fixed/future context notes for Service Contracts and the MS/HS
// Progression Model. Provides scenario name, duplicate, add, and remove
// controls (maximum MAX_SAVED_SCENARIOS).

import { Badge, Card } from "../../../../components/common";
import { openingGrades } from "../../data/openingGrades";
import { occupancyOptions } from "../../data/occupancyOptions";
import { orgDesignStructure } from "../../data/orgDesignStructure";
import { tuitionArchitecture } from "../../data/tuitionArchitecture";
import { capexOptions } from "../../data/capexOptions";
import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import {
  MAX_SAVED_SCENARIOS,
  type CapitalDecisionLeverId,
  type CapitalDecisionLeverOption,
  type SavedScenario,
} from "./capitalDecisionUiTypes";

interface LeverFieldConfig {
  readonly id: CapitalDecisionLeverId;
  readonly label: string;
  readonly inputKey: keyof CapitalDecisionEngineInput;
  readonly options: readonly CapitalDecisionLeverOption[];
}

const LEVER_FIELDS: readonly LeverFieldConfig[] = [
  {
    id: "openingGrades",
    label: "Opening Grades",
    inputKey: "openingPackageId",
    options: openingGrades.map((option) => ({ id: option.id, label: option.label })),
  },
  {
    id: "occupancy",
    label: "Occupancy",
    inputKey: "occupancyScenarioId",
    options: occupancyOptions,
  },
  {
    id: "orgDesignStructure",
    label: "Org Design Structure",
    inputKey: "orgDesignOptionId",
    options: orgDesignStructure.map((option) => ({
      id: option.id,
      label: option.label,
      description: option.description,
    })),
  },
  {
    id: "tuition",
    label: "Tuition",
    inputKey: "tuitionScenarioId",
    options: tuitionArchitecture.map((option) => ({ id: option.id, label: option.label })),
  },
  {
    id: "capex",
    label: "CAPEX",
    inputKey: "capexOptionId",
    options: capexOptions,
  },
];

export interface ScenarioConfigurationPanelProps {
  readonly scenarios: readonly SavedScenario[];
  readonly selectedScenarioId: string;
  readonly duplicateConfigScenarioIds: ReadonlySet<string>;
  readonly onSelectScenario: (id: string) => void;
  readonly onUpdateLever: (id: string, leverId: CapitalDecisionLeverId, value: string) => void;
  readonly onRenameScenario: (id: string, name: string) => void;
  readonly onAddScenario: () => void;
  readonly onDuplicateScenario: (id: string) => void;
  readonly onRemoveScenario: (id: string) => void;
}

export function ScenarioConfigurationPanel({
  scenarios,
  selectedScenarioId,
  duplicateConfigScenarioIds,
  onSelectScenario,
  onUpdateLever,
  onRenameScenario,
  onAddScenario,
  onDuplicateScenario,
  onRemoveScenario,
}: ScenarioConfigurationPanelProps) {
  const atMax = scenarios.length >= MAX_SAVED_SCENARIOS;

  return (
    <section className="space-y-4" aria-labelledby="scenario-configuration-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Scenario Configuration
          </p>
          <h2 id="scenario-configuration-heading" className="text-lg font-semibold text-slate-900">
            Decision levers
          </h2>
        </div>
        <button
          type="button"
          onClick={onAddScenario}
          disabled={atMax}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-disabled={atMax}
        >
          Add scenario
        </button>
      </div>

      {atMax && (
        <p className="text-xs text-slate-500" role="note">
          Maximum of {MAX_SAVED_SCENARIOS} saved scenarios reached.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId;
          const isDuplicate = duplicateConfigScenarioIds.has(scenario.id);

          return (
            <Card
              key={scenario.id}
              className={isSelected ? "ring-2 ring-blue-200" : undefined}
              title={scenario.name}
              subtitle={scenario.id}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {isDuplicate && <Badge variant="warning">Identical configuration</Badge>}
                  {isSelected && <Badge variant="success">Selected for result</Badge>}
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`scenario-name-${scenario.id}`}
                    className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Scenario name
                  </label>
                  <input
                    id={`scenario-name-${scenario.id}`}
                    type="text"
                    value={scenario.name}
                    onChange={(event) => onRenameScenario(scenario.id, event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline focus:outline-2 focus:outline-blue-200"
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Decision levers
                  </legend>
                  {LEVER_FIELDS.map((field) => {
                    const selectId = `lever-${field.id}-${scenario.id}`;
                    return (
                      <div key={field.id}>
                        <label
                          htmlFor={selectId}
                          className="block text-sm font-medium text-slate-700"
                        >
                          {field.label}
                        </label>
                        <select
                          id={selectId}
                          value={scenario.input[field.inputKey] as string}
                          onChange={(event) =>
                            onUpdateLever(scenario.id, field.id, event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline focus:outline-2 focus:outline-blue-200"
                        >
                          {field.options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </fieldset>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectScenario(scenario.id)}
                    disabled={isSelected}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View result
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateScenario(scenario.id)}
                    disabled={atMax}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveScenario(scenario.id)}
                    disabled={scenarios.length <= 1}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Fixed and future context" subtitle="Not selectable in this version">
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          <li>
            <span className="font-semibold text-slate-700">Service Contracts: </span>
            Service Contracts use the fixed approved DRE assumptions for this version.
          </li>
          <li>
            <span className="font-semibold text-slate-700">MS/HS Progression Model: </span>
            The MS/HS Progression Model is not yet connected to the financial simulation.
          </li>
        </ul>
      </Card>
    </section>
  );
}

export default ScenarioConfigurationPanel;
