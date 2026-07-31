// Phase 15J.3 — Executive Simulator Interpretation & Board Decision Framing.
//
// Provides a board-facing interpretation layer for the DRE Scenario Simulator.
// Explains what the simulator is ready to support, what remains pending, and
// how to read trade-offs across the five scenario axes.
//
// Governance constraints preserved:
//   - FINANCE_SOURCE_CLOSURE_COMPLETE remains false
//   - BOARD_RATIFICATION_READY remains false
//   - No formula, source value, or calculation change
//   - No winner, recommendation, approved, or ratified language

import { Telescope, Scale, HelpCircle, ClipboardList, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "../common/Card";
import {
  DRE_ACTIVE_COMBINATION_COUNT,
  DRE_ACTIVE_GOVERNANCE_ITEMS,
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
} from "../../features/rio-scenario-resilience/model/dreGovernanceReadiness";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

// ── How to read this simulator ───────────────────────────────────────────────

const LEVER_EXPLANATIONS: Array<{ axisKey: TranslationKey; effectKey: TranslationKey }> = [
  { axisKey: "dreExecInterpLeverAxisOpeningPackage", effectKey: "dreExecInterpLeverEffectOpeningPackage" },
  { axisKey: "dreExecInterpLeverAxisCaptacao", effectKey: "dreExecInterpLeverEffectCaptacao" },
  { axisKey: "dreExecInterpLeverAxisTuition", effectKey: "dreExecInterpLeverEffectTuition" },
  { axisKey: "dreExecInterpLeverAxisOrgDesign", effectKey: "dreExecInterpLeverEffectOrgDesign" },
  { axisKey: "dreExecInterpLeverAxisCapex", effectKey: "dreExecInterpLeverEffectCapex" },
];

// ── Trade-off framing ─────────────────────────────────────────────────────────

const TRADE_OFF_LENSES: Array<{ lensKey: TranslationKey; descriptionKey: TranslationKey }> = [
  { lensKey: "dreExecInterpLensGrowthAmbition", descriptionKey: "dreExecInterpDescGrowthAmbition" },
  { lensKey: "dreExecInterpLensRevenueSensitivity", descriptionKey: "dreExecInterpDescRevenueSensitivity" },
  { lensKey: "dreExecInterpLensOperatingComplexity", descriptionKey: "dreExecInterpDescOperatingComplexity" },
  { lensKey: "dreExecInterpLensCapitalExposure", descriptionKey: "dreExecInterpDescCapitalExposure" },
  { lensKey: "dreExecInterpLensGovernanceReadiness", descriptionKey: "dreExecInterpDescGovernanceReadiness" },
];

// ── Board decision questions ──────────────────────────────────────────────────

const DECISION_QUESTIONS: Array<{ lensKey: TranslationKey; questionKey: TranslationKey }> = [
  { lensKey: "dreExecInterpQLensOpeningPackage", questionKey: "dreExecInterpQOpeningPackage" },
  { lensKey: "dreExecInterpQLensCaptacao", questionKey: "dreExecInterpQCaptacao" },
  { lensKey: "dreExecInterpQLensTuitionArchitecture", questionKey: "dreExecInterpQTuitionArchitecture" },
  { lensKey: "dreExecInterpQLensOrgDesign", questionKey: "dreExecInterpQOrgDesign" },
  { lensKey: "dreExecInterpQLensCapex", questionKey: "dreExecInterpQCapex" },
];

const BOARD_LIMITATION_KEYS: Record<string, TranslationKey> = {
  desconto_metodo_reverification: "dreGovItemBoardDescontoMetodo",
  tuition_source_provenance_by_option: "dreGovItemBoardTuitionProvenance",
  tuition_finance_signoff: "dreGovItemBoardTuitionApproval",
  discount_schedule_finance_signoff: "dreGovItemBoardDiscountApproval",
  ms_hs_grade_level_staffing_boundary: "dreGovItemBoardMsHsBoundary",
  ms_hs_staffing_source_reconciliation: "dreGovItemBoardMsHsReconciliation",
  corporate_allocation_unavailable: "dreGovItemBoardCorporateAllocation",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DreExecutiveInterpretationPanel() {
  const { t } = useLocale();
  const openItems = DRE_ACTIVE_GOVERNANCE_ITEMS;

  return (
    <Card
      title={t("dreExecInterpTitle")}
      subtitle={t("dreExecInterpSubtitle")}
      icon={Telescope}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      {/* ── Status header ──────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">
              {t("dreExecInterpSimAvailableLabel")}
            </div>
            <div className="text-[11px] text-emerald-800">
              {t("dreExecInterpSimAvailableBody").replace("{n}", String(DRE_ACTIVE_COMBINATION_COUNT))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              {t("dreExecInterpFinanceClosurePendingLabel")}
            </div>
            <div className="text-[11px] text-amber-800">
              {t("dreExecInterpFinanceClosurePendingBody").replace("{n}", String(openItems.length))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              {t("dreExecInterpBoardPendingLabel")}
            </div>
            <div className="text-[11px] text-slate-600">
              {t("dreExecInterpBoardPendingBody")}
            </div>
          </div>
        </div>
      </div>

      {/* ── How to read this simulator ─────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            {t("dreExecInterpHowToReadTitle")}
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {LEVER_EXPLANATIONS.map((item) => (
            <div
              key={item.axisKey}
              className="rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cockpit-teal">
                {t(item.axisKey)}
              </div>
              <p className="text-xs leading-relaxed text-cockpit-slate">{t(item.effectKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trade-off framing panel ────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            {t("dreExecInterpTradeOffTitle")}
          </h4>
        </div>
        <div className="space-y-2">
          {TRADE_OFF_LENSES.map((item) => (
            <div
              key={item.lensKey}
              className="flex gap-3 rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="w-40 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cockpit-indigo">
                  {t(item.lensKey)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-cockpit-slate">{t(item.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Board decision questions ───────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            {t("dreExecInterpDecisionQuestionsTitle")}
          </h4>
        </div>
        <div className="space-y-2">
          {DECISION_QUESTIONS.map((item) => (
            <div
              key={item.lensKey}
              className="flex gap-3 rounded-xl border border-cockpit-border-soft bg-cockpit-panel px-4 py-3"
            >
              <div className="w-32 shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                  {t(item.lensKey)}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-cockpit-ink">{t(item.questionKey)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-cockpit-meta">
          {t("dreExecInterpDecisionQuestionsFooter")}
        </p>
      </section>

      {/* ── Material limitations panel ─────────────────────────────────────── */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-cockpit-meta" />
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">
            {t("dreExecInterpMaterialLimitationsTitle")}
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
              {t("dreExecInterpFinanceSourceClosureLabel")}
            </div>
            <p className="text-xs text-amber-800">
              {FINANCE_SOURCE_CLOSURE_COMPLETE
                ? t("dreExecInterpComplete")
                : t("dreExecInterpFinancePendingBody")}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              {t("dreExecInterpBoardRatificationLabel")}
            </div>
            <p className="text-xs text-slate-600">
              {BOARD_RATIFICATION_READY
                ? t("dreExecInterpReady")
                : t("dreExecInterpBoardPendingBody2")}
            </p>
          </div>
        </div>

        <div className="mt-2 space-y-1.5">
          {openItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
            >
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              <span className="text-xs text-slate-600">
                {t(BOARD_LIMITATION_KEYS[item.key] ?? "dreGovItemBoardFallback")}
              </span>
              <span className="ml-auto text-[10px] text-amber-600 font-medium shrink-0">
                {t("dreExecInterpNonBlocking")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Boundary note ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-cockpit-border-soft bg-cockpit-subtle px-4 py-3">
        <p className="text-xs leading-relaxed text-cockpit-slate">
          <span className="font-semibold text-cockpit-ink">{t("dreExecInterpBoundaryNoteLabel")} </span>
          {t("dreExecInterpBoundaryNoteBody")}
        </p>
      </div>
    </Card>
  );
}
