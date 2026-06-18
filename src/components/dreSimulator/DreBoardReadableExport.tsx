// Phase 15J — Board-readable scenario explanation.
//
// Generates a copy/export text block per scenario with the provisional-source
// caveat explicitly stated. Does not call this scenario "approved", "ratified",
// or "final". Simulation is available; Finance-source and board ratification
// remain pending.

import { useState } from "react";
import { Copy, Check, FileText } from "lucide-react";
import { Card } from "../common/Card";
import { formatBRL } from "../../lib/utils";
import {
  OCCUPANCY_LABELS,
  TUITION_LABELS,
  ORG_DESIGN_OPTION_LABELS,
  formatOpeningPackageLabel,
} from "./dreLeverLabels";
import { DRE_GOVERNANCE_READINESS } from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";
import type { DreScenarioSimulatorSelections } from "../../hooks/useDreScenarioSimulator";
import type { DreEngineOutput } from "../../features/rio-scenario-resilience/model/dreEngineContract";

interface DreBoardReadableExportProps {
  readonly selections: DreScenarioSimulatorSelections;
  readonly dreOutput: DreEngineOutput;
}

export function buildBoardReadableExplanation(
  selections: DreScenarioSimulatorSelections,
  dreOutput: DreEngineOutput,
): string {
  const ebitdaPositiveYear = RECEITA_PROJECTION_YEARS.find(
    (y) => dreOutput.byYear[y].ebitda > 0,
  );
  const yr2028 = dreOutput.byYear[2028];
  const yr2032 = dreOutput.byYear[2032];
  const yr2037 = dreOutput.byYear[2037];
  const openItemCount = DRE_GOVERNANCE_READINESS.openItems.length;
  const openItemCodes = ["F01", "F03", "F04", "F05", "F06"].join(", ");

  const formatBRLText = (v: number) => {
    const abs = Math.abs(v);
    const sign = v < 0 ? "−" : "";
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)}K`;
    return `${sign}R$ ${abs.toFixed(0)}`;
  };

  return [
    "SCENARIO SUMMARY — FOR REVIEW PURPOSES",
    "─────────────────────────────────────────────────────────",
    "",
    "SCENARIO INPUTS",
    `  Opening package: ${formatOpeningPackageLabel(selections.openingPackageId)} (${selections.openingPackageId})`,
    `  Occupancy: ${OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId}`,
    `  Tuition scenario: ${TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId}`,
    `  Org design: ${ORG_DESIGN_OPTION_LABELS[selections.orgDesignOptionId] ?? selections.orgDesignOptionId}`,
    "",
    "SCENARIO OUTPUTS (DRE Operating Layer)",
    `  Learners 2028: ${yr2028.numero_de_alunos}`,
    `  First EBITDA-positive year: ${ebitdaPositiveYear ?? "Not within horizon"}`,
    `  EBITDA 2028: ${formatBRLText(yr2028.ebitda)}`,
    `  EBITDA 2032: ${formatBRLText(yr2032.ebitda)}`,
    `  EBITDA 2037: ${formatBRLText(yr2037.ebitda)}`,
    "",
    "GOVERNANCE STATUS",
    "  Can calculate: yes",
    "  Can simulate: yes",
    "  Can compare scenarios: yes",
    "  Finance-source confirmed: not yet",
    "  Board-ratified: not yet",
    "",
    "IMPORTANT — PROVISIONAL STATUS NOTICE",
    "─────────────────────────────────────────────────────────",
    "This scenario is technically calculated and internally consistent.",
    "It is NOT Finance-source confirmed and NOT board-ratified.",
    "",
    `The remaining ${openItemCount} open items (${openItemCodes}) are assumption provenance`,
    "and reconciliation items, not calculation blockers. Simulation runs",
    "regardless of their status.",
    "",
    "Do not interpret this scenario as approved, final, or ratified.",
    "Use for comparison and trade-off analysis only.",
    "",
    `Source-status warning count: ${openItemCount} open items`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
  ].join("\n");
}

export default function DreBoardReadableExport({
  selections,
  dreOutput,
}: DreBoardReadableExportProps) {
  const [copied, setCopied] = useState(false);
  const text = buildBoardReadableExplanation(selections, dreOutput);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Card
      title="Board-readable scenario explanation"
      subtitle="Provisional — not Finance-source confirmed, not board-ratified"
      icon={FileText}
    >
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        This text block describes the current scenario with its provisional-source status explicitly
        stated. It is suitable for review, comparison, and trade-off discussion — not a
        board-ratified recommendation.
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
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
