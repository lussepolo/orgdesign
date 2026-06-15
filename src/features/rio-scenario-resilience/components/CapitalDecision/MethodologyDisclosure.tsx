// Phase 15F — methodology and assumptions disclosure.
//
// Collapsed by default (native <details>, keyboard-accessible). Surfaces
// WACC source, the strict TIR > WACC rule, the discounted-payback horizon,
// Service Contracts / MS-HS Progression treatment, explicit exclusions, and
// source provenance -- all read verbatim from the committed Phase 15E
// result. No new methodology is introduced here.

import type { InvestmentInterpretationResult } from "../../model/investmentInterpretationEngineContract";
import { formatPercentZeroDecimal } from "./capitalDecisionViewModel";

export interface MethodologyDisclosureProps {
  readonly result: InvestmentInterpretationResult;
}

const EXCLUSION_LABELS: Record<string, string> = {
  receitaRecalculation: "Receita recalculation",
  fopagRecalculation: "FOPAG recalculation",
  ebitdaRecalculation: "EBITDA recalculation",
  fcoRecalculation: "FCO recalculation",
  capexRecalculation: "CAPEX recalculation",
  dcfRecalculation: "DCF recalculation",
  npvRecalculation: "VPL recalculation",
  irrRecalculation: "TIR recalculation",
  discountedPaybackRecalculation: "Discounted payback recalculation",
  tierTaxonomy: "Tier taxonomy",
  weightedScore: "Weighted/composite score",
  totalRanking: "Total ranking",
  overallWinner: "Overall winner / preferred scenario",
  boardRecommendation: "Board recommendation",
  uiInterpretation: "UI-generated interpretation",
};

export function MethodologyDisclosure({ result }: MethodologyDisclosureProps) {
  const { sourceProvenance, explicitExclusions, decisionLevers } = result;
  const waccPercent = formatPercentZeroDecimal(result.investmentReferenceWaccRate);

  const exclusionEntries = Object.entries(explicitExclusions).filter(
    ([key, value]) => value === "excluded" && key in EXCLUSION_LABELS,
  );

  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
      <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">
        Methodology and assumptions
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Reference WACC
          </h4>
          <p className="mt-1">
            {waccPercent} ({sourceProvenance.investmentReferenceWaccSource}).
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Investment reference rule
          </h4>
          <p className="mt-1">
            Strict TIR &gt; WACC: a scenario meets the investment reference only when
            TIR is greater than the reference WACC. TIR equal to WACC does not meet
            the reference.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Discounted payback horizon
          </h4>
          <p className="mt-1">
            Evaluated over the 20 operating periods (2028-2047). Payback not
            recovered within this horizon is reported as "20+", never as a
            numeric year.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Service Contracts
          </h4>
          <p className="mt-1">
            {decisionLevers.serviceContracts === "fixed_approved_dre_assumption"
              ? "Service Contracts use the fixed approved DRE assumptions for this version."
              : decisionLevers.serviceContracts}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            MS/HS Progression Model
          </h4>
          <p className="mt-1">
            {decisionLevers.msHsProgressionModel === "future_upstream_integration_not_wired"
              ? "The MS/HS Progression Model is not yet connected to the financial simulation."
              : decisionLevers.msHsProgressionModel}
          </p>
        </div>

        {exclusionEntries.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Explicit exclusions
            </h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {exclusionEntries.map(([key]) => (
                <li key={key}>{EXCLUSION_LABELS[key]}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Source provenance
          </h4>
          <ul className="mt-1 space-y-1">
            <li>Phase 15C commit: {sourceProvenance.phase15cCommit}</li>
            <li>Phase 15D commit: {sourceProvenance.phase15dCommit}</li>
            <li>Methodology document: {sourceProvenance.ratifiedMethodologyDoc}</li>
            {sourceProvenance.ratifiedSections.length > 0 && (
              <li>Ratified sections: {sourceProvenance.ratifiedSections.join(", ")}</li>
            )}
          </ul>
          {sourceProvenance.notes.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-500">
              {sourceProvenance.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </details>
  );
}

export default MethodologyDisclosure;
