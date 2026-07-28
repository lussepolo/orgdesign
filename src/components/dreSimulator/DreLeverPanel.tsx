import { Sliders } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS,
  DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS,
  DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS,
  type DreScenarioSimulatorSelections,
} from "../../hooks/useDreScenarioSimulator";
import { OCCUPANCY_LABELS, TUITION_LABELS, ORG_DESIGN_OPTION_LABELS, formatOpeningPackageLabel } from "./dreLeverLabels";
import { DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE } from "../../features/rio-scenario-resilience/model/dreEnrollmentCapacityLeverContract";
import {
  GOVERNED_AVAILABLE_CAPACITY_BY_YEAR,
  getGovernedAvailableCapacity,
  hasGovernedCapacity,
} from "../../features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

interface DreLeverPanelProps {
  selections: DreScenarioSimulatorSelections;
  onChange: (patch: Partial<DreScenarioSimulatorSelections>) => void;
}

const FIELD_LABEL_CLASS = "mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta";
const SELECT_CLASS =
  "w-full rounded-xl border border-cockpit-border bg-cockpit-panel px-3 py-2 text-sm font-medium text-cockpit-ink outline-none transition focus:border-cockpit-teal-muted";

function packageOptionLabel(
  id: DreScenarioSimulatorSelections["openingPackageId"],
  t: (key: TranslationKey) => string,
): string {
  const supportedScenarios = DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE[id];
  if (supportedScenarios.length > 0) return `${formatOpeningPackageLabel(id)} (${id})`;
  if (hasGovernedCapacity(id)) return `${formatOpeningPackageLabel(id)} (${id}) ${t("dreLeverPanelCapacityOnlySuffix")}`;
  return `${formatOpeningPackageLabel(id)} (${id}) ${t("dreLeverPanelUnavailableSuffix")}`;
}

export default function DreLeverPanel({ selections, onChange }: DreLeverPanelProps) {
  const { t } = useLocale();
  const activePackageSelected = (DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS as readonly string[]).includes(
    selections.openingPackageId,
  );
  const currentPackageSupported =
    DRE_ENROLLMENT_LEVER_SUPPORTED_SCENARIOS_BY_PACKAGE[selections.openingPackageId].includes(
      selections.occupancyScenarioId,
    );
  const t1g4Capacity = getGovernedAvailableCapacity("t1_g4", 2028);
  const t1g6Capacity = GOVERNED_AVAILABLE_CAPACITY_BY_YEAR
    .filter((record) => record.packageId === "t1_g6")
    .map((record) => record.availableCapacity);

  return (
    <Card
      title={t("dreLeverPanelTitle")}
      icon={Sliders}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        {t("dreLeverPanelIntro")}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <div className={FIELD_LABEL_CLASS}>{t("dreLeverPanelOpeningPackageLabel")}</div>
          <select
            value={activePackageSelected ? selections.openingPackageId : ""}
            onChange={(event) =>
              onChange({ openingPackageId: event.target.value as DreScenarioSimulatorSelections["openingPackageId"] })
            }
            className={SELECT_CLASS}
          >
            {!activePackageSelected && (
              <option value="" disabled>
                {t("dreLeverPanelRetiredPackageOption")}
              </option>
            )}
            {DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS.map((id) => (
              <option key={id} value={id}>
                {packageOptionLabel(id, t)}
              </option>
            ))}
          </select>
          {!currentPackageSupported && (
            <p className="mt-2 text-xs font-semibold text-amber-700">
              {t("dreLeverPanelRetiredPackageWarning")}
            </p>
          )}
        </label>

        <label className="block">
          <div className={FIELD_LABEL_CLASS}>{t("dreLeverPanelCaptacaoLabel")}</div>
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
          <div className={FIELD_LABEL_CLASS}>{t("dreLeverPanelTuitionLabel")}</div>
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
          <div className={FIELD_LABEL_CLASS}>{t("dreLeverPanelOrgDesignLabel")}</div>
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
      <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-cockpit-meta sm:grid-cols-2">
        <p>
          {t("dreLeverPanelT1G4Note").replace("{cap}", String(t1g4Capacity))}
        </p>
        <p>
          {t("dreLeverPanelT1G6Note")
            .replace("{from}", String(t1g6Capacity[0]))
            .replace("{to}", String(t1g6Capacity[t1g6Capacity.length - 1]))}
        </p>
      </div>
    </Card>
  );
}
