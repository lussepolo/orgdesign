import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, GitBranch } from "lucide-react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { formatBRL } from "../../lib/utils";
import { ORG_DESIGN_PAYROLL_ACTIVATION } from "../../features/rio-scenario-resilience/model/orgDesignPayrollActivation";
import { EXECUTIVE_ORG_SCENARIOS } from "../../features/rio-scenario-resilience/model/executiveOrgDesignModel";
import type { FopagEngineOutput } from "../../features/rio-scenario-resilience/model/fopagEngineContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { OrgDesignSensitivityRow, PayrollReconciliationResult } from "../../hooks/useDreScenarioSimulator";
import { ORG_DESIGN_OPTION_LABELS } from "./dreLeverLabels";

// Phase 14A.1: fopagOutput here is a reconciled trace of the FOPAG totals
// already folded into dreOutput.byYear by calculateDre()'s internal
// calculateFopag() call (see useDreScenarioSimulator.ts header comment).
// It is displayed only when payrollReconciliation.isReconciled is true.
interface OrgDesignPanelProps {
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  fopagOutput: FopagEngineOutput;
  payrollReconciliation: PayrollReconciliationResult;
  orgDesignSensitivity: readonly OrgDesignSensitivityRow[];
  year: OpeningPackageProjectionYear;
}

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${(value * 100).toFixed(1)}%`;

// Confirmed Phase 13G org-design addendum mapping (orgDesignScenarioOptionById,
// executiveOrgDesignModel.ts): minimum_experience → "minimum",
// balanced_experience → "balanced", premium_experience → "premium".
const EXECUTIVE_ORG_SCENARIO_BY_ORG_DESIGN_OPTION: Record<
  DreWorkingScenarioOrgDesignOptionId,
  "minimum" | "balanced" | "premium"
> = {
  minimum_experience: "minimum",
  balanced_experience: "balanced",
  premium_experience: "premium",
};

// Phase 14B-UI-VISUAL-FIXES: reframed as "Org Design Operating Model" with an
// executive explanation up front and the role-by-role breakdown moved into a
// collapsed secondary block. EBITDA impact context is read from the
// already-computed orgDesignSensitivity rows (2047, holding opening/
// occupancy/tuition fixed) — no new calculations.
export default function OrgDesignPanel({
  orgDesignOptionId,
  fopagOutput,
  payrollReconciliation,
  orgDesignSensitivity,
  year,
}: OrgDesignPanelProps) {
  const [rolesExpanded, setRolesExpanded] = useState(false);
  const [selectedStructureExpanded, setSelectedStructureExpanded] = useState(false);

  const executiveScenarioId = EXECUTIVE_ORG_SCENARIO_BY_ORG_DESIGN_OPTION[orgDesignOptionId];
  const executiveScenario = EXECUTIVE_ORG_SCENARIOS.find((option) => option.id === executiveScenarioId);

  // Phase 14B-UI-ORG-DESIGN-ROLE-PROGRESSION-BUSINESS-CORRECTION: UI-only
  // business grouping, ratified by Luciana, replacing the prior mechanical
  // `roleSourceType`/`activeIn` derivation. "Active in all three org-design
  // options" is not sufficient to call a role a "Minimum addition" — several
  // `extension_*` records reuse an existing baseline payroll role
  // (`payrollRoleId` already present in the baseline_role set) and represent
  // leadership/support structure already accounted for, not new positions:
  // - security_clerks (payrollRoleId "clerk", baseline "Clerk (Portaria)")
  // - librarian (payrollRoleId "library", baseline "Inspirationeer")
  // - early_years_principal (payrollRoleId "ey_principal", baseline "EY Coordinator")
  // - lower_school_principal (payrollRoleId "ls_principal", baseline "LS Coordinator")
  // - after_school_coordinator (payrollRoleId "after_school", baseline "After School Educator")
  // Per Luciana's correction, the only true Minimum Experience additions are
  // Events Assistant, Maker Space Assistant, and Language Acquisition Coach.
  // Middle School Educators / High School Educators are progression-dependent
  // (tied to opening/grade-span assumptions), not immediate Minimum
  // additions, even though `activeIn` includes minimum_experience. No
  // records are reclassified or modified in the source data.
  const allRecords = ORG_DESIGN_PAYROLL_ACTIVATION.records;

  const ALREADY_ACCOUNTED_FOR_SOURCE_ROLE_IDS = new Set([
    "security_clerks",
    "librarian",
    "early_years_principal",
    "lower_school_principal",
    "after_school_coordinator",
  ]);
  const MINIMUM_ADDED_SOURCE_ROLE_IDS = new Set([
    "events_assistant",
    "maker_space_assistant",
    "language_acquisition_coach",
  ]);
  const BALANCED_ADDED_SOURCE_ROLE_IDS = new Set([
    "personalized_learning_associate_educator",
    "security_coordinator",
  ]);
  const PREMIUM_ADDED_SOURCE_ROLE_IDS = new Set(["curriculum_and_assessment_designer"]);
  const PROGRESSION_DEPENDENT_SOURCE_ROLE_IDS = new Set([
    "middle_school_educators",
    "high_school_educators",
  ]);

  const alreadyAccountedForRoles = allRecords.filter(
    (record) =>
      record.roleInclusionStatus !== "excluded_from_v1" &&
      (record.roleSourceType === "baseline_role" ||
        ALREADY_ACCOUNTED_FOR_SOURCE_ROLE_IDS.has(record.sourceRoleId)),
  );
  const minimumAddedRoles = allRecords.filter((record) => MINIMUM_ADDED_SOURCE_ROLE_IDS.has(record.sourceRoleId));
  const balancedAddedRoles = allRecords.filter((record) => BALANCED_ADDED_SOURCE_ROLE_IDS.has(record.sourceRoleId));
  const premiumAddedRoles = allRecords.filter((record) => PREMIUM_ADDED_SOURCE_ROLE_IDS.has(record.sourceRoleId));
  const progressionDependentRoles = allRecords.filter((record) =>
    PROGRESSION_DEPENDENT_SOURCE_ROLE_IDS.has(record.sourceRoleId),
  );
  const selectedStructureRoles = allRecords.filter((record) => record.activeIn.includes(orgDesignOptionId));

  const yearTotals = fopagOutput.yearTotals.find((yt) => yt.year === year);
  const sensitivityRow = orgDesignSensitivity.find((row) => row.orgDesignOptionId === orgDesignOptionId);

  return (
    <Card
      title="Org Design Operating Model"
      icon={GitBranch}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        Shows how the selected org-design option maps to role structure and FOPAG impact. This is a
        scenario input, not a recommendation.
      </p>

      <div className="mb-4 rounded-2xl border border-cockpit-indigo-border bg-cockpit-indigo-fill p-4 text-sm leading-relaxed text-cockpit-slate">
        The selected org model is{" "}
        <span className="font-semibold text-cockpit-ink">{ORG_DESIGN_OPTION_LABELS[orgDesignOptionId]}</span>
        {executiveScenario && (
          <>
            , operating under the{" "}
            <span className="font-semibold text-cockpit-ink">{executiveScenario.posture}</span> posture
          </>
        )}
        . FOPAG total payroll for {year} is{" "}
        <span className="font-semibold text-cockpit-ink">
          {payrollReconciliation.isReconciled && yearTotals ? formatBRL(yearTotals.totalPayroll) : "—"}
        </span>
        . This reflects the current lever selection, not a recommendation.
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            Selected Org Design
          </div>
          <div className="mt-2 text-sm font-bold text-cockpit-ink">
            {ORG_DESIGN_OPTION_LABELS[orgDesignOptionId]}
          </div>
        </div>
        <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            Operating Model / Posture
          </div>
          <div className="mt-2 text-sm font-bold text-cockpit-ink">
            {executiveScenario?.posture ?? "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            FOPAG Total Payroll ({year})
          </div>
          <div className="mt-2 text-sm font-bold text-cockpit-ink">
            {payrollReconciliation.isReconciled && yearTotals ? formatBRL(yearTotals.totalPayroll) : "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-cockpit-positive-border bg-cockpit-teal-fill p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            EBITDA Impact (2047)
          </div>
          <div className="mt-2 text-sm font-bold text-cockpit-teal">
            {sensitivityRow ? formatBRL(sensitivityRow.ebitda2047) : "—"}
          </div>
          <div className="mt-0.5 text-xs text-cockpit-meta">
            {sensitivityRow ? `${formatPercent(sensitivityRow.percentualEbitda2047)} EBITDA margin` : ""}
          </div>
        </div>
      </div>

      {payrollReconciliation.isReconciled ? (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
              FOPAG Direto ({year})
            </div>
            <div className="mt-2 text-sm font-bold text-cockpit-ink">
              {yearTotals ? formatBRL(yearTotals.fopagDireto) : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
              Folha Direta ({year})
            </div>
            <div className="mt-2 text-sm font-bold text-cockpit-ink">
              {yearTotals ? formatBRL(yearTotals.folhaDireta) : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
              Benefícios ({year})
            </div>
            <div className="mt-2 text-sm font-bold text-cockpit-ink">
              {yearTotals ? formatBRL(yearTotals.benefits) : "—"}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-cockpit-risk-border bg-cockpit-risk-fill p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-cockpit-risk" />
          <div>
            <div className="text-sm font-bold text-cockpit-risk">
              FOPAG/payroll trace could not be reconciled with the DRE payroll rows
            </div>
            <p className="mt-1 text-sm text-cockpit-slate">
              {payrollReconciliation.mismatches.length} mismatch(es) detected between the
              standalone FOPAG trace and the FOPAG-derived rows inside the DRE result for
              this scenario. Payroll/FOPAG values are withheld until this is resolved.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 rounded-2xl border border-cockpit-border-soft bg-cockpit-panel p-4">
        <button
          type="button"
          onClick={() => setRolesExpanded((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-meta">
            Org Design role progression
            <Badge variant="default">Costing support</Badge>
          </span>
          {rolesExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-cockpit-meta" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-cockpit-meta" />
          )}
        </button>
        {rolesExpanded && (
          <div className="mt-3">
            <p className="text-xs leading-relaxed text-cockpit-meta">
              Shows which positions are already accounted for and which positions are introduced as
              the org-design model moves into Minimum, Balanced, and Premium. This is a costing and
              structure view, not a hiring authorization.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                    Already accounted for / baseline structure
                  </div>
                  <Badge variant="default">{alreadyAccountedForRoles.length}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                  Roles or equivalent leadership/support structures already represented in the
                  baseline model. These should not be read as new additions.
                </p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-cockpit-slate">
                  {alreadyAccountedForRoles.map((record) => (
                    <li key={record.sourceRoleId}>{record.roleName}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-cockpit-indigo-border bg-cockpit-indigo-fill p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                    Added in Minimum Experience
                  </div>
                  <Badge variant="default">{minimumAddedRoles.length}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                  Positions introduced in the Minimum Experience model.
                </p>
                {minimumAddedRoles.length === 0 ? (
                  <p className="mt-2 text-xs text-cockpit-slate">
                    No Minimum additions identified in the current source data.
                  </p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-cockpit-slate">
                    {minimumAddedRoles.map((record) => (
                      <li key={record.sourceRoleId}>{record.roleName}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-cockpit-positive-border bg-cockpit-teal-fill p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                    Added in Balanced Experience
                  </div>
                  <Badge variant="default">{balancedAddedRoles.length}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                  Positions introduced when moving from Minimum Experience to Balanced Experience.
                </p>
                {balancedAddedRoles.length === 0 ? (
                  <p className="mt-2 text-xs text-cockpit-slate">
                    No Balanced additions identified in the current source data.
                  </p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-cockpit-slate">
                    {balancedAddedRoles.map((record) => (
                      <li key={record.sourceRoleId}>{record.roleName}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-cockpit-amber-border bg-cockpit-amber-fill p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                    Added in Premium Experience
                  </div>
                  <Badge variant="default">{premiumAddedRoles.length}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                  Positions introduced when moving from Balanced Experience to Premium Experience.
                </p>
                {premiumAddedRoles.length === 0 ? (
                  <p className="mt-2 text-xs text-cockpit-slate">
                    No Premium-only additions identified in the current source data.
                  </p>
                ) : (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-cockpit-slate">
                    {premiumAddedRoles.map((record) => (
                      <li key={record.sourceRoleId}>{record.roleName}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                    Progression-dependent roles
                  </div>
                  <Badge variant="default">{progressionDependentRoles.length}</Badge>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                  Roles tied to grade-span opening/progression assumptions, not immediate Minimum
                  Experience additions.
                </p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-cockpit-slate">
                  {progressionDependentRoles.map((record) => (
                    <li key={record.sourceRoleId}>{record.roleName}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-cockpit-border-soft bg-cockpit-subtle p-3">
              <button
                type="button"
                onClick={() => setSelectedStructureExpanded((current) => !current)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cockpit-meta">
                  Role structure represented in selected option
                  <Badge variant="default">{selectedStructureRoles.length}</Badge>
                </span>
                {selectedStructureExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0 text-cockpit-meta" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-cockpit-meta" />
                )}
              </button>
              <p className="mt-1 text-[11px] leading-relaxed text-cockpit-meta">
                Shows the role set used for structure and costing under the current org-design lever.
                This is not a list of newly added roles.
              </p>
              {selectedStructureExpanded && (
                <ul className="mt-2 grid max-h-48 grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto text-xs text-cockpit-slate sm:grid-cols-2 lg:grid-cols-3">
                  {selectedStructureRoles.map((record) => (
                    <li key={record.sourceRoleId}>{record.roleName}</li>
                  ))}
                </ul>
              )}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-cockpit-meta">
              Role progression is derived from the org-design payroll activation source. It is a
              scenario-structure and costing view, not a hiring authorization.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
