// GradeStaffingTable.tsx
// ─────────────────────────────────────────────────────────────────────────────
// V10-RC2.5 Gate 3/Tranche B — the ONE governed grade-level staffing table,
// rendered identically from both ExecutiveOrgDesignTab.tsx and
// PayrollProjectionTab.tsx. Both call this component with the same shared
// scenario props and the same `educatorTierSelection` controller instance
// (lifted to App.tsx in Tranche A) — there is no separate calculation or
// tier-selection state per tab; a change made from either tab is the same
// state read by the other.
//
// Scope decision (recorded here, not a defect — see
// docs/audits/rio-resilience/phase-v10-rc2-5-gate3-tranche-b-scope.md):
// Early Years and Lower School render one row per grade, each with its own
// Educator tier selector — all five governed EDUCATOR_LEVELS tiers
// (Associate, Specialist, Master, Inspirational, Distinguished; Gate 3/
// Tranche C expanded this from the original Master/Associate-only scope by
// explicit product-owner instruction — all five carry complete, Finance-
// provided compensation figures). Grade 6
// stays division_level_only, matching the disposition established in
// RC2.3 Gate 5 / RC2.4 Gate 1 evidence-matrix item 4 — it is NOT reinterpreted
// here. Middle School and High School are NOT broken into individual grade
// rows: buildOrgDesignHcTable() deliberately aggregates them into one
// division-wide team, and three prior phases (RC2.3, RC2.4, RC2.4A)
// deliberately preserved that aggregation rather than inventing an
// unsupported one-educator-per-section formula for them. The Educator tier
// for MS and HS is therefore selected at the DIVISION level — one control
// per division — and fans out to every grade in that division's governed
// fixed-FTE table (MS_FTE_BY_GRADE / HS_FTE_BY_GRADE in payrollAdapter.ts),
// so the underlying per-grade tier storage (shared with EY/LS) still applies
// uniformly across the division. Assistant has exactly one governed
// compensation tier (confirmed by Gate 1 trace) and is never rendered as a
// selector — shown as a fixed, read-only badge.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { Card } from "./Card";
import { buildOrgDesignHcTable } from "../../features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import {
  buildPayrollGradeDetailRows,
  type PayrollGradeDetailRow,
} from "../../features/rio-scenario-resilience/model/payrollGradeDetailAdapter";
import { MS_FTE_BY_GRADE, HS_FTE_BY_GRADE } from "../../features/rio-scenario-resilience/model/payrollAdapter";
import { EDUCATOR_TIER_IDS, type EducatorTierId } from "../../features/rio-scenario-resilience/model/payrollAdapterContract";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
  OpeningPackageDirectWorkbookYear,
} from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { UseEducatorTierSelectionResult, EducatorTierSelectionKey } from "../../hooks/useEducatorTierSelection";
import type { TranslationKey } from "../../i18n/localeContract";

const MS_GRADE_IDS = Object.keys(MS_FTE_BY_GRADE);
const HS_GRADE_IDS = Object.keys(HS_FTE_BY_GRADE);

const DIVISION_LABEL_KEYS: Record<"Early Years" | "Lower School" | "Middle School", "payrollDivEarlyYears" | "payrollDivLowerSchool" | "payrollDivMiddleSchool"> = {
  "Early Years": "payrollDivEarlyYears",
  "Lower School": "payrollDivLowerSchool",
  "Middle School": "payrollDivMiddleSchool",
};

const TIER_LABEL_KEYS: Record<
  EducatorTierId,
  "payrollTierMasterLabel" | "payrollTierAssociateLabel" | "payrollTierSpecialistLabel" | "payrollTierInspirationalLabel" | "payrollTierDistinguishedLabel"
> = {
  master: "payrollTierMasterLabel",
  associate: "payrollTierAssociateLabel",
  specialist: "payrollTierSpecialistLabel",
  inspirational: "payrollTierInspirationalLabel",
  distinguished: "payrollTierDistinguishedLabel",
};

export interface GradeStaffingTableProps {
  readonly openingPackageId: ActiveOpeningPackageId;
  readonly occupancyScenarioId: OccupancyScenarioId;
  readonly orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  readonly year: OpeningPackageDirectWorkbookYear;
  readonly educatorTierSelection: UseEducatorTierSelectionResult;
  // Which direction's sync note to show — the two tabs point at each other.
  readonly syncNoteKey: "payrollGradeStaffingSyncNoteFromOrgDesign" | "payrollGradeStaffingSyncNoteFromPayroll";
}

function EducatorTierSelect({
  value,
  onChange,
}: {
  readonly value: EducatorTierId;
  readonly onChange: (tierId: EducatorTierId) => void;
}) {
  const { t } = useLocale();
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as EducatorTierId)}
      className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-bold text-slate-700"
    >
      {EDUCATOR_TIER_IDS.map((tierId) => (
        <option key={tierId} value={tierId}>
          {t(TIER_LABEL_KEYS[tierId])}
        </option>
      ))}
    </select>
  );
}

function DivisionTierPresetGroup({
  divisionLabelKey,
  gradeIds,
  openingPackageId,
  occupancyScenarioId,
  orgDesignOptionId,
  educatorTierSelection,
}: {
  readonly divisionLabelKey: TranslationKey;
  readonly gradeIds: readonly string[];
  readonly openingPackageId: string;
  readonly occupancyScenarioId: string;
  readonly orgDesignOptionId: string;
  readonly educatorTierSelection: UseEducatorTierSelectionResult;
}) {
  const { t } = useLocale();
  const keys: EducatorTierSelectionKey[] = gradeIds.map((gradeId) => ({
    openingPackageId,
    occupancyScenarioId,
    orgDesignOptionId,
    gradeId,
  }));
  const currentTier = educatorTierSelection.getEducatorTier(keys[0]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[9px] font-black uppercase tracking-widest text-amber-700">{t(divisionLabelKey)}</span>
      {EDUCATOR_TIER_IDS.map((tierId) => (
        <button
          key={tierId}
          type="button"
          onClick={() => educatorTierSelection.setEducatorTiersForGrades(keys, tierId)}
          className={cn(
            "rounded-lg border px-2 py-1 text-[9px] font-bold transition-colors",
            currentTier === tierId
              ? "border-transparent bg-amber-600 text-white shadow-sm"
              : "border-amber-200 bg-white text-amber-700 hover:border-amber-400",
          )}
        >
          {t("payrollAllToLabel").replace("{tier}", t(TIER_LABEL_KEYS[tierId]))}
        </button>
      ))}
    </div>
  );
}

export default function GradeStaffingTable({
  openingPackageId,
  occupancyScenarioId,
  orgDesignOptionId,
  year,
  educatorTierSelection,
  syncNoteKey,
}: GradeStaffingTableProps) {
  const { t } = useLocale();

  const gradeDetail: PayrollGradeDetailRow[] = useMemo(
    () => buildPayrollGradeDetailRows({ openingPackageId, occupancyScenarioId, orgDesignOptionId, year }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, year],
  );

  const hcTableResult = useMemo(
    () => buildOrgDesignHcTable({ openingPackageId, occupancyScenarioId, orgDesignOptionId, year }),
    [openingPackageId, occupancyScenarioId, orgDesignOptionId, year],
  );

  const msAggregateHeadcount = hcTableResult.rows
    .filter((r) => r.divisionArea === "Middle School")
    .reduce((sum, r) => sum + r.headcountOrFte, 0);
  const hsAggregateHeadcount = hcTableResult.rows
    .filter((r) => r.divisionArea === "High School")
    .reduce((sum, r) => sum + r.headcountOrFte, 0);

  // Clears every explicit selection for this scenario (all grades, all
  // years the user may have touched) — not just the grades visible in the
  // currently-displayed year's gradeDetail, which would miss selections
  // made under a different year's active-grade set. See
  // useEducatorTierSelection.ts's clearEducatorTierSelectionsForScenario.
  const handleResetDefaults = () => {
    educatorTierSelection.clearEducatorTierSelectionsForScenario(
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
    );
  };

  return (
    <Card
      title={t("payrollGradeBreakdownTitle").replace("{year}", String(year))}
      icon={GraduationCap}
      subtitle={t(syncNoteKey)}
    >
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollGradeHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">{t("payrollDivisionHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollAlunosHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollTurmasHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollAlunosPorTurmaHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollEducadorLiderHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollTierHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollAssistenteHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollMonitorHeader")}</th>
              <th className="px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 text-center">{t("payrollTotalFteHeader")}</th>
            </tr>
          </thead>
          <tbody>
            {gradeDetail.map((row, index) => {
              const isDivisionLevelOnly = row.educatorAttribution === "division_level_only";
              const tierKey: EducatorTierSelectionKey = {
                openingPackageId,
                occupancyScenarioId,
                orgDesignOptionId,
                gradeId: row.shortGradeId,
              };
              return (
                <tr
                  key={row.gradeId}
                  className={cn(
                    "border-b border-slate-100",
                    isDivisionLevelOnly ? "bg-blue-50/50" : index % 2 === 0 ? "bg-white" : "bg-slate-50/50",
                  )}
                >
                  <td className="px-3 py-3"><div className="text-sm font-bold text-slate-900">{row.gradeLabel}</div></td>
                  <td className="px-3 py-3 text-[11px] text-slate-500">{t(DIVISION_LABEL_KEYS[row.division])}</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.enrollment ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.sections ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-xs text-slate-600">{row.alunosPorTurma ?? "—"}</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">
                    {isDivisionLevelOnly ? (
                      <span
                        title={t("payrollGrade6EducatorFullNote")}
                        className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700"
                      >
                        {t("payrollGrade6EducatorBadgeLabel")}
                      </span>
                    ) : (
                      row.educators
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {isDivisionLevelOnly ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : (
                      <EducatorTierSelect
                        value={educatorTierSelection.getEducatorTier(tierKey)}
                        onChange={(tierId) => educatorTierSelection.setEducatorTier(tierKey, tierId)}
                      />
                    )}
                  </td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{isDivisionLevelOnly ? "—" : row.assistants}</td>
                  <td className="px-3 py-3 text-center text-xs font-bold text-slate-700">{row.monitorApplicable ? row.monitors : "—"}</td>
                  <td className="px-3 py-3 text-center text-xs font-black text-slate-900">
                    {isDivisionLevelOnly ? "—" : row.totalHeadcount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[10px] text-slate-400" title={t("payrollAssistantFixedTierNote")}>
        {t("payrollAssistantFixedTierBadgeLabel")} — {t("payrollAssistantFixedTierNote")}
      </p>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">{t("payrollMsHsUnavailableLabel")}</div>
        <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">{t("payrollMsHsUnavailableNote")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white border border-amber-100 px-3 py-2">
            <div className="text-[9px] font-bold uppercase text-amber-600">{t("payrollDivMiddleSchool")}</div>
            <div className="text-sm font-black text-slate-900">{msAggregateHeadcount}</div>
            <div className="text-[9px] text-amber-600">{t("payrollMsHsAggregateEstimateLabel")}</div>
          </div>
          <div className="rounded-lg bg-white border border-amber-100 px-3 py-2">
            <div className="text-[9px] font-bold uppercase text-amber-600">{t("payrollDivHighSchool")}</div>
            <div className="text-sm font-black text-slate-900">{hsAggregateHeadcount}</div>
            <div className="text-[9px] text-amber-600">{t("payrollMsHsAggregateEstimateLabel")}</div>
          </div>
        </div>

        <div className="mt-3 border-t border-amber-200 pt-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">{t("payrollEducatorTierByGradeLabel")}</div>
          <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">{t("payrollTierSelectorsNote")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <DivisionTierPresetGroup
              divisionLabelKey="payrollDivMiddleSchool"
              gradeIds={MS_GRADE_IDS}
              openingPackageId={openingPackageId}
              occupancyScenarioId={occupancyScenarioId}
              orgDesignOptionId={orgDesignOptionId}
              educatorTierSelection={educatorTierSelection}
            />
            <DivisionTierPresetGroup
              divisionLabelKey="payrollDivHighSchool"
              gradeIds={HS_GRADE_IDS}
              openingPackageId={openingPackageId}
              occupancyScenarioId={occupancyScenarioId}
              orgDesignOptionId={orgDesignOptionId}
              educatorTierSelection={educatorTierSelection}
            />
            <button
              type="button"
              onClick={handleResetDefaults}
              className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[9px] font-bold text-amber-700 hover:border-amber-500"
            >
              {t("payrollResetDefaultsLabel")}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
