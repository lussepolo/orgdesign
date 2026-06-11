import { Sliders } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  type DreScenarioSimulatorSelections,
} from "../../hooks/useDreScenarioSimulator";
import { OCCUPANCY_LABELS, TUITION_LABELS, ORG_DESIGN_OPTION_LABELS, formatOpeningPackageLabel } from "./dreLeverLabels";

interface DreLeverPanelProps {
  selections: DreScenarioSimulatorSelections;
  onChange: (patch: Partial<DreScenarioSimulatorSelections>) => void;
}

const FIELD_LABEL_CLASS = "mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta";
const SELECT_CLASS =
  "w-full rounded-xl border border-cockpit-border bg-cockpit-panel px-3 py-2 text-sm font-medium text-cockpit-ink outline-none transition focus:border-cockpit-teal-muted";

export default function DreLeverPanel({ selections, onChange }: DreLeverPanelProps) {
  return (
    <Card
      title="Scenario levers"
      icon={Sliders}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        Select the operating assumptions that generate enrollment, Receita, FOPAG, DRE rows, and EBITDA.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <div className={FIELD_LABEL_CLASS}>Opening Package</div>
          <select
            value={selections.openingPackageId}
            onChange={(event) =>
              onChange({ openingPackageId: event.target.value as DreScenarioSimulatorSelections["openingPackageId"] })
            }
            className={SELECT_CLASS}
          >
            {DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS.map((id) => (
              <option key={id} value={id}>
                {formatOpeningPackageLabel(id)} ({id})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className={FIELD_LABEL_CLASS}>Occupancy Scenario</div>
          <select
            value={selections.occupancyScenarioId}
            onChange={(event) =>
              onChange({
                occupancyScenarioId: event.target.value as DreScenarioSimulatorSelections["occupancyScenarioId"],
              })
            }
            className={SELECT_CLASS}
          >
            {DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS.map((id) => (
              <option key={id} value={id}>
                {OCCUPANCY_LABELS[id] ?? id}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className={FIELD_LABEL_CLASS}>Tuition Scenario</div>
          <select
            value={selections.tuitionScenarioId}
            onChange={(event) =>
              onChange({
                tuitionScenarioId: event.target.value as DreScenarioSimulatorSelections["tuitionScenarioId"],
              })
            }
            className={SELECT_CLASS}
          >
            {DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS.map((id) => (
              <option key={id} value={id}>
                {TUITION_LABELS[id] ?? id}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className={FIELD_LABEL_CLASS}>Org Design Option</div>
          <select
            value={selections.orgDesignOptionId}
            onChange={(event) =>
              onChange({
                orgDesignOptionId: event.target.value as DreScenarioSimulatorSelections["orgDesignOptionId"],
              })
            }
            className={SELECT_CLASS}
          >
            {DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS.map((id) => (
              <option key={id} value={id}>
                {ORG_DESIGN_OPTION_LABELS[id] ?? id}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}
