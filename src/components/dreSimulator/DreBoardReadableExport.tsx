// Phase 15J — Board-readable scenario explanation.
//
// Generates a copy/export text block per scenario with the provisional-source
// caveat explicitly stated. Does not call this scenario "approved", "ratified",
// or "final". Simulation is available; Finance-source and board ratification
// remain pending.

import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { Card } from "../common/Card";
import { useLocale } from "../../i18n/useLocale";
import { PT_BR } from "../../i18n/pt-BR";
import { EN_US } from "../../i18n/en-US";
import type { Locale, TranslationKey } from "../../i18n/localeContract";
import {
  OCCUPANCY_LABELS,
  TUITION_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  formatOpeningPackageLabel,
} from "./dreLeverLabels";
import {
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  DRE_ACTIVE_COMBINATION_COUNT,
} from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";

interface DreBoardReadableExportProps {
  readonly selections: DreScenarioSimulatorSelections;
  readonly dreOutput: DreEngineOutput;
}

const CATALOGS: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": PT_BR,
  "en-US": EN_US,
};

const BOARD_LIMITATION_KEYS: Record<string, TranslationKey> = {
  desconto_metodo_reverification: "dreGovItemBoardDescontoMetodo",
  tuition_source_provenance_by_option: "dreGovItemBoardTuitionProvenance",
  tuition_finance_signoff: "dreGovItemBoardTuitionApproval",
  discount_schedule_finance_signoff: "dreGovItemBoardDiscountApproval",
  ms_hs_grade_level_staffing_boundary: "dreGovItemBoardMsHsBoundary",
  ms_hs_staffing_source_reconciliation: "dreGovItemBoardMsHsReconciliation",
  corporate_allocation_unavailable: "dreGovItemBoardCorporateAllocation",
};

function translate(locale: Locale, key: TranslationKey): string {
  return CATALOGS[locale][key];
}

export function buildBoardReadableExplanation(
  selections: DreScenarioSimulatorSelections,
  dreOutput: DreEngineOutput,
  locale: Locale = "en-US",
): string {
  const tx = (key: TranslationKey) => translate(locale, key);
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find(
    (y) => dreOutput.byYear[y].ebitda > 0,
  );
  const yr2028 = dreOutput.byYear[2028];
  const yr2032 = dreOutput.byYear[2032];
  const yr2037 = dreOutput.byYear[2037];
  const activeItemCount = DRE_ACTIVE_GOVERNANCE_ITEMS.length;

  const formatBRLText = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? "−" : "";
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)}K`;
    return `${sign}R$ ${abs.toFixed(0)}`;
  };

  return [
    tx("dreBoardExportTextHeading"),
    "─────────────────────────────────────────────────────────",
    "",
    tx("dreBoardExportTextInputs"),
    `  ${tx("dreBoardExportTextOpeningPackage")}: ${formatOpeningPackageLabel(selections.openingPackageId)} (${selections.openingPackageId})`,
    `  ${tx("dreBoardExportTextOccupancy")}: ${OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId}`,
    `  ${tx("dreBoardExportTextTuitionScenario")}: ${TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId}`,
    `  ${tx("dreBoardExportTextOrgDesign")}: ${ORG_DESIGN_OPTION_LABELS[selections.orgDesignOptionId] ?? selections.orgDesignOptionId}`,
    "",
    tx("dreBoardExportTextOutputs"),
    `  ${tx("dreBoardExportTextLearners2028")}: ${yr2028.numero_de_alunos}`,
    `  ${tx("dreBoardExportTextFirstEbitdaPositiveYear")}: ${ebitdaPositiveYear ?? tx("dreBoardExportTextNotWithinHorizon")}`,
    `  ${tx("dreBoardExportTextEbitda2028")}: ${formatBRLText(yr2028.ebitda)}`,
    `  ${tx("dreBoardExportTextEbitda2032")}: ${formatBRLText(yr2032.ebitda)}`,
    `  ${tx("dreBoardExportTextEbitda2037")}: ${formatBRLText(yr2037.ebitda)}`,
    "",
    tx("dreBoardExportTextGovernance"),
    `  ${tx("dreBoardExportTextCanCalculate")}: ${tx("dreBoardExportTextYes")}`,
    `  ${tx("dreBoardExportTextCanSimulate")}: ${tx("dreBoardExportTextYes")}`,
    `  ${tx("dreBoardExportTextCanCompare")}: ${tx("dreBoardExportTextYes")} (${DRE_ACTIVE_COMBINATION_COUNT})`,
    `  ${tx("dreBoardExportTextFinanceSourceConfirmed")}: ${tx("dreBoardExportTextNotYet")}`,
    `  ${tx("dreBoardExportTextBoardRatified")}: ${tx("dreBoardExportTextNotYet")}`,
    "",
    tx("dreBoardExportTextNoticeHeading"),
    "─────────────────────────────────────────────────────────",
    tx("dreBoardExportTextCalculatedNotice"),
    tx("dreBoardExportTextNotCertifiedNotice"),
    tx("dreBoardExportTextEbitdaBoundaryNotice"),
    "",
    tx("dreBoardExportTextMaterialLimitations").replace("{n}", String(activeItemCount)),
    ...DRE_ACTIVE_GOVERNANCE_ITEMS.map((item) =>
      `  - ${tx(BOARD_LIMITATION_KEYS[item.key] ?? "dreGovItemBoardFallback")}`,
    ),
    "",
    tx("dreBoardExportTextUseLimitNotice"),
    "",
    `${tx("dreBoardExportTextWarningCount")}: ${activeItemCount}`,
    `${tx("dreBoardExportTextGenerated")}: ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");
}

export default function DreBoardReadableExport({
  selections,
  dreOutput,
}: DreBoardReadableExportProps) {
  const { t, locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const text = buildBoardReadableExplanation(selections, dreOutput, locale);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card
      title={t("dreBoardExportTitle")}
      subtitle={t("dreBoardExportSubtitle")}
      icon={FileText}
    >
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        {t("dreBoardExportIntro")}
      </p>
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap font-mono">
          {text}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              {t("dreBoardExportCopiedLabel")}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              {t("dreBoardExportCopyLabel")}
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
