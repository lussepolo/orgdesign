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
import type { CapexOptionId } from "../../model/capexOptionSourceContract";
import type { CapitalDecisionEngineInput } from "../../model/capitalDecisionEngineContract";
import {
  MAX_SAVED_SCENARIOS,
  type CapitalDecisionLeverId,
  type CapitalDecisionLeverOption,
  type SavedScenario,
  type IntegratedCapitalDecisionScenario,
  type DuplicateForCapexVariantResult,
} from "./capitalDecisionUiTypes";
import { useLocale } from "../../../../i18n/useLocale";
import { formatNumber } from "../../../../i18n/formatters";
import type { TranslationKey } from "../../../../i18n/localeContract";

interface LeverFieldConfig {
  readonly id: CapitalDecisionLeverId;
  readonly labelKey: TranslationKey;
  readonly inputKey: keyof CapitalDecisionEngineInput;
  readonly options: readonly CapitalDecisionLeverOption[];
}

const LEVER_FIELDS: readonly LeverFieldConfig[] = [
  {
    id: "openingGrades",
    labelKey: "capitalConfigPanelLeverOpeningGrades",
    inputKey: "openingPackageId",
    options: openingGrades.map((option) => ({ id: option.id, label: option.label })),
  },
  {
    id: "occupancy",
    labelKey: "capitalConfigPanelLeverOccupancy",
    inputKey: "occupancyScenarioId",
    options: occupancyOptions,
  },
  {
    id: "orgDesignStructure",
    labelKey: "capitalConfigPanelLeverOrgDesignStructure",
    inputKey: "orgDesignOptionId",
    options: orgDesignStructure.map((option) => ({
      id: option.id,
      label: option.label,
      description: option.description,
    })),
  },
  {
    id: "tuition",
    labelKey: "capitalConfigPanelLeverTuition",
    inputKey: "tuitionScenarioId",
    options: tuitionArchitecture.map((option) => ({ id: option.id, label: option.label })),
  },
  {
    id: "capex",
    labelKey: "capitalConfigPanelLeverCapex",
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

function TuitionBandDetail({ scenarioId }: { scenarioId: string }) {
  const { t, locale } = useLocale();
  const option = tuitionArchitecture.find((o) => o.id === scenarioId);
  if (!option?.bandDetails) return null;
  return (
    <details className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
      <summary className="cursor-pointer font-semibold text-slate-600">
        {t("capitalConfigPanelTuitionBandsSummary")}
      </summary>
      <table className="mt-2 w-full">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="pb-1 pr-2 font-medium">{t("capitalConfigPanelColBand")}</th>
            <th className="pb-1 pr-2 font-medium text-right">{t("capitalConfigPanelColMonthly")}</th>
            <th className="pb-1 font-medium text-right">{t("capitalConfigPanelColAnnualGross")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {option.bandDetails.map((band) => (
            <tr key={band.bandLabel}>
              <td className="py-1 pr-2 text-slate-700">{band.bandLabel}</td>
              <td className="py-1 pr-2 text-right text-slate-600">
                {formatNumber(band.monthlyTuitionBRL, locale, 0)}
              </td>
              <td className="py-1 text-right text-slate-600">
                {formatNumber(band.annualGrossContractValueBRL, locale, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
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
  const { t } = useLocale();
  const atMax = scenarios.length >= MAX_SAVED_SCENARIOS;

  return (
    <section className="space-y-4" aria-labelledby="scenario-configuration-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("capitalConfigPanelSectionLabel")}
          </p>
          <h2 id="scenario-configuration-heading" className="text-lg font-semibold text-slate-900">
            {t("capitalConfigPanelDecisionLeversTitle")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onAddScenario}
          disabled={atMax}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-disabled={atMax}
        >
          {t("capitalConfigPanelAddScenario")}
        </button>
      </div>

      {atMax && (
        <p className="text-xs text-slate-500" role="note">
          {t("capitalConfigPanelMaxReached").replace("{max}", String(MAX_SAVED_SCENARIOS))}
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
                  {isDuplicate && <Badge variant="warning">{t("capitalConfigPanelDuplicateBadge")}</Badge>}
                  {isSelected && <Badge variant="success">{t("capitalConfigPanelSelectedBadge")}</Badge>}
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`scenario-name-${scenario.id}`}
                    className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {t("capitalConfigPanelScenarioNameLabel")}
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
                    {t("capitalConfigPanelDecisionLeversTitle")}
                  </legend>
                  {LEVER_FIELDS.map((field) => {
                    const selectId = `lever-${field.id}-${scenario.id}`;
                    return (
                      <div key={field.id}>
                        <label
                          htmlFor={selectId}
                          className="block text-sm font-medium text-slate-700"
                        >
                          {t(field.labelKey)}
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

                <TuitionBandDetail scenarioId={scenario.input.tuitionScenarioId} />

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => onSelectScenario(scenario.id)}
                    disabled={isSelected}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("capitalConfigPanelViewResult")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateScenario(scenario.id)}
                    disabled={atMax}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("capitalConfigPanelDuplicate")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveScenario(scenario.id)}
                    disabled={scenarios.length <= 1}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("capitalConfigPanelRemove")}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title={t("capitalConfigPanelFixedContextTitle")} subtitle={t("capitalConfigPanelFixedContextSubtitle")}>
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          <li>
            <span className="font-semibold text-slate-700">{t("capitalConfigPanelServiceContractsLabel")}</span>
            {t("capitalConfigPanelServiceContractsBody")}
          </li>
          <li>
            <span className="font-semibold text-slate-700">{t("capitalConfigPanelMsHsLabel")}</span>
            {t("capitalConfigPanelMsHsBody")}
          </li>
        </ul>
      </Card>
    </section>
  );
}

export default ScenarioConfigurationPanel;

// ── Integrated mode configuration panel (Phase 15G.2) ────────────────────────
//
// In integrated mode the 4 DRE-owned fields are read-only labels. Only the
// CAPEX lever is editable. Scenario provenance (dre_import / capex_variant) is
// shown as a badge. A "CAPEX variant" button creates a variant with the
// alternative CAPEX option.

// Maps a lever inputKey to a translation key for read-only display.
const DRE_FIELD_LABEL_KEYS: Record<string, TranslationKey> = {
  openingGrades: "capitalConfigPanelLeverOpeningGrades",
  occupancy: "capitalConfigPanelLeverOccupancy",
  orgDesignStructure: "capitalConfigPanelLeverOrgDesignStructure",
  tuition: "capitalConfigPanelLeverTuition",
};

// Resolve a data-value ID to its display label.
function resolveLabel(inputKey: keyof CapitalDecisionEngineInput, value: string): string {
  switch (inputKey) {
    case "openingPackageId":
      return openingGrades.find((o) => o.id === value)?.label ?? value;
    case "occupancyScenarioId":
      return occupancyOptions.find((o) => o.id === value)?.label ?? value;
    case "orgDesignOptionId":
      return orgDesignStructure.find((o) => o.id === value)?.label ?? value;
    case "tuitionScenarioId":
      return tuitionArchitecture.find((o) => o.id === value)?.label ?? value;
    case "capexOptionId":
      return capexOptions.find((o) => o.id === value)?.label ?? value;
    default:
      return value;
  }
}

const INTEGRATED_DRE_FIELDS: ReadonlyArray<{
  leverId: string;
  labelKey: TranslationKey;
  inputKey: keyof CapitalDecisionEngineInput;
}> = [
  { leverId: "openingGrades", labelKey: DRE_FIELD_LABEL_KEYS["openingGrades"], inputKey: "openingPackageId" },
  { leverId: "occupancy", labelKey: DRE_FIELD_LABEL_KEYS["occupancy"], inputKey: "occupancyScenarioId" },
  { leverId: "orgDesignStructure", labelKey: DRE_FIELD_LABEL_KEYS["orgDesignStructure"], inputKey: "orgDesignOptionId" },
  { leverId: "tuition", labelKey: DRE_FIELD_LABEL_KEYS["tuition"], inputKey: "tuitionScenarioId" },
];

export interface IntegratedScenarioConfigurationPanelProps {
  readonly scenarios: readonly IntegratedCapitalDecisionScenario[];
  readonly activeScenarioId: string | null;
  readonly onSelectScenario: (id: string) => void;
  readonly onUpdateCapex: (scenarioId: string, capexOptionId: CapexOptionId) => void;
  readonly onDuplicateForCapexVariant: (scenarioId: string, capexOptionId: CapexOptionId) => DuplicateForCapexVariantResult;
  readonly onRemoveScenario: (scenarioId: string) => void;
  readonly onNavigateToDre: () => void;
}

export function IntegratedScenarioConfigurationPanel({
  scenarios,
  activeScenarioId,
  onSelectScenario,
  onUpdateCapex,
  onDuplicateForCapexVariant,
  onRemoveScenario,
  onNavigateToDre,
}: IntegratedScenarioConfigurationPanelProps) {
  const { t } = useLocale();
  const atMax = scenarios.length >= MAX_SAVED_SCENARIOS;

  return (
    <section className="space-y-4" aria-labelledby="integrated-scenario-config-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("capitalConfigPanelIntegratedSectionLabel")}
          </p>
          <h2 id="integrated-scenario-config-heading" className="text-lg font-semibold text-slate-900">
            {t("capitalConfigPanelDreImportedTitle")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNavigateToDre}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          {t("capitalConfigPanelGoToDreSimulator")}
        </button>
      </div>

      {atMax && (
        <p className="text-xs text-slate-500" role="note">
          {t("capitalConfigPanelMaxReached").replace("{max}", String(MAX_SAVED_SCENARIOS))}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {scenarios.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;
          const kindLabel =
            scenario.scenarioKind === "dre_import"
              ? t("capitalConfigPanelKindDreImport")
              : t("capitalConfigPanelKindCapexVariant");
          const kindVariant = scenario.scenarioKind === "dre_import" ? "info" : "purple" as const;

          // Determine the alternate CAPEX option for variant creation.
          const altCapex = capexOptions.find((o) => o.id !== scenario.input.capexOptionId);

          return (
            <Card
              key={scenario.id}
              className={isActive ? "ring-2 ring-blue-200" : undefined}
              title={scenario.name}
              subtitle={scenario.id}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={kindVariant}>{kindLabel}</Badge>
                  {isActive && <Badge variant="success">{t("capitalConfigPanelActiveBadge")}</Badge>}
                </div>
              }
            >
              <div className="space-y-4">
                {/* DRE fields — read-only */}
                <fieldset className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("capitalConfigPanelDreFieldsReadonlyLegend")}
                  </legend>
                  {INTEGRATED_DRE_FIELDS.map((field) => (
                    <div key={field.leverId} className="flex items-center gap-2">
                      <span className="min-w-[120px] text-xs font-medium text-slate-500">
                        {t(field.labelKey)}
                      </span>
                      <span className="rounded border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                        {resolveLabel(field.inputKey, scenario.input[field.inputKey] as string)}
                      </span>
                    </div>
                  ))}
                </fieldset>

                {/* CAPEX — editable */}
                <div>
                  <label
                    htmlFor={`capex-${scenario.id}`}
                    className="block text-sm font-medium text-slate-700"
                  >
                    {t("capitalConfigPanelLeverCapex")}
                  </label>
                  <select
                    id={`capex-${scenario.id}`}
                    value={scenario.input.capexOptionId}
                    onChange={(e) =>
                      onUpdateCapex(scenario.id, e.target.value as CapexOptionId)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-400 focus:outline focus:outline-2 focus:outline-blue-200"
                  >
                    {capexOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectScenario(scenario.id)}
                    disabled={isActive}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("capitalConfigPanelViewResult")}
                  </button>
                  {altCapex && (
                    <button
                      type="button"
                      disabled={atMax}
                      onClick={() => onDuplicateForCapexVariant(scenario.id, altCapex.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {t("capitalConfigPanelCapexVariantButton").replace("{label}", altCapex.label)}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveScenario(scenario.id)}
                    disabled={scenarios.length <= 1}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("capitalConfigPanelRemove")}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title={t("capitalConfigPanelFixedContextTitle")} subtitle={t("capitalConfigPanelFixedContextSubtitle")}>
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          <li>
            <span className="font-semibold text-slate-700">{t("capitalConfigPanelServiceContractsLabel")}</span>
            {t("capitalConfigPanelServiceContractsBody")}
          </li>
          <li>
            <span className="font-semibold text-slate-700">{t("capitalConfigPanelMsHsLabel")}</span>
            {t("capitalConfigPanelMsHsBody")}
          </li>
        </ul>
      </Card>
    </section>
  );
}
