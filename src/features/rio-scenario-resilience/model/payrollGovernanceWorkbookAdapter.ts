import { ORG_DESIGN_PAYROLL_ACTIVATION } from "./orgDesignPayrollActivation";
import {
  getBoardDisplayLabel,
  getDivisionArea,
  getRoleGroupOrHub,
  getSourceTypeLabel,
} from "./orgDesignHcTableAdapter";
import type { FopagCalculatedRecord, FopagEngineOutput } from "./fopagEngineContract";

export interface PayrollGovernanceInput {
  openingPackageId: string;
  occupancyScenarioId: string;
  minimum: { fopagOutput: FopagEngineOutput };
  balanced: { fopagOutput: FopagEngineOutput };
  premium: { fopagOutput: FopagEngineOutput };
}

// ── Private helpers ──────────────────────────────────────────────────────────

function getCompensationArchetypeSummary(rec: FopagCalculatedRecord): string {
  const activation = ORG_DESIGN_PAYROLL_ACTIVATION.records.find(
    (r) => r.sourceRoleId === rec.roleId,
  );
  if (activation) {
    const cs = activation.costSource;
    const dashIdx = cs.indexOf(" — ");
    const beforeDash = dashIdx > 0 ? cs.substring(0, dashIdx) : cs;
    const lastSpaceIdx = beforeDash.lastIndexOf(" ");
    if (lastSpaceIdx > 0) return beforeDash.substring(lastSpaceIdx + 1);
    return beforeDash.length <= 80 ? beforeDash : beforeDash.substring(0, 80);
  }
  switch (rec.roleSourceType) {
    case "baseline_leadership":
      return "LEADERSHIP_CONFIG";
    case "baseline_backoffice":
      return "BACKOFFICE_CONFIG";
    case "baseline_specialist":
      return "SPECIALISTS_CONFIG";
    case "ey_teaching_lead":
    case "ls_teaching_lead":
    case "ms_teaching_lead":
    case "hs_teaching_lead":
      return "EDUCATOR_LEVELS['master'] (Master Educator)";
    case "ey_learning_assistant":
    case "ls_learning_assistant":
      return "LEARNING_ASSISTANT_DETAIL";
    case "ey_learning_monitor":
      return "LEARNING_MONITOR_DETAIL";
    default:
      return rec.roleSourceType;
  }
}

function getActivationYearSource(roleId: string): string {
  const activation = ORG_DESIGN_PAYROLL_ACTIVATION.records.find(
    (r) => r.sourceRoleId === roleId,
  );
  return activation?.activationYearSource ?? "—";
}

function getAppearsIn(
  roleId: string,
  minimum: { fopagOutput: FopagEngineOutput },
  balanced: { fopagOutput: FopagEngineOutput },
  premium: { fopagOutput: FopagEngineOutput },
): string {
  const parts: string[] = [];
  if (minimum.fopagOutput.records.some((r) => r.roleId === roleId && !r.isAuditRow)) {
    parts.push("Minimum");
  }
  if (balanced.fopagOutput.records.some((r) => r.roleId === roleId && !r.isAuditRow)) {
    parts.push("Balanced");
  }
  if (premium.fopagOutput.records.some((r) => r.roleId === roleId && !r.isAuditRow)) {
    parts.push("Premium");
  }
  return parts.length > 0 ? parts.join("; ") : "—";
}

function getReconciliationTarget(allocationModel: string): string {
  if (allocationModel === "FOPAG_DIRETO") return "fopag_direto_clt_pj (DRE direct cost)";
  if (allocationModel === "FOLHA_DIRETA") return "folha_de_pagamento (DRE fixed cost)";
  return "unavailable";
}

function findRepresentativeRecord(
  roleId: string,
  minimum: { fopagOutput: FopagEngineOutput },
  balanced: { fopagOutput: FopagEngineOutput },
  premium: { fopagOutput: FopagEngineOutput },
): FopagCalculatedRecord | undefined {
  // Prefer balanced (correctly labels LED Hub roles as Hub members)
  const fromBal = balanced.fopagOutput.records.find(
    (r) => r.roleId === roleId && !r.isAuditRow,
  );
  if (fromBal) return fromBal;
  const fromPrem = premium.fopagOutput.records.find(
    (r) => r.roleId === roleId && !r.isAuditRow,
  );
  if (fromPrem) return fromPrem;
  const fromMin = minimum.fopagOutput.records.find(
    (r) => r.roleId === roleId && !r.isAuditRow,
  );
  if (fromMin) return fromMin;
  return (
    balanced.fopagOutput.records.find((r) => r.roleId === roleId) ??
    minimum.fopagOutput.records.find((r) => r.roleId === roleId)
  );
}

function find2028OrFirstActiveRecord(
  roleId: string,
  variants: { fopagOutput: FopagEngineOutput }[],
): FopagCalculatedRecord | undefined {
  for (const { fopagOutput } of variants) {
    const rec = fopagOutput.records.find(
      (r) => r.roleId === roleId && r.year === 2028 && !r.isAuditRow,
    );
    if (rec) return rec;
  }
  for (const { fopagOutput } of variants) {
    const rec = fopagOutput.records.find((r) => r.roleId === roleId && !r.isAuditRow);
    if (rec) return rec;
  }
  return undefined;
}

const CALC_TRACE =
  "Model basis: (grossMonthly + laborChargesMonthly) × 13 × HC × salaryGrowthFactor + " +
  "benefitsMonthly × 12 × HC × benefitsGrowthFactor, as implemented in fopagEngine.ts " +
  "(Phase V10-P1: salary and benefits escalate on independent factors). " +
  "Encargos is laborChargesMonthly and is not decomposed in the current model.";

// ── Public builders ──────────────────────────────────────────────────────────

export function buildPayrollAssumptionRows(
  input: PayrollGovernanceInput,
): (string | number | boolean)[][] {
  const { openingPackageId, minimum, balanced, premium } = input;

  const allRoleIds = new Set<string>();
  for (const { fopagOutput } of [minimum, balanced, premium]) {
    for (const rec of fopagOutput.records) allRoleIds.add(rec.roleId);
  }

  const noteRow1: (string | number | boolean)[] = [
    "Payroll assumption values are exported from the model-backed compensation source used by FOPAG. " +
      "Encargos is exported from the existing app/FOPAG model and already includes applicable Brazilian payroll " +
      "charges such as FGTS and INSS where included by the model. The workbook does not recalculate or duplicate " +
      "these charges. Payroll calculation authority remains the app model.",
  ];
  const noteRow2: (string | number | boolean)[] = [
    "Values shown are model-backed assumptions. Scenario/year payroll totals are in FOPAG, Payroll Projection, " +
      "and DRE Payroll Bridge sheets. No FGTS or INSS columns are created — Encargos is the single " +
      "model-exposed labor-charge component.",
  ];
  const header: (string | number | boolean)[] = [
    "Role",
    "Role ID",
    "Division / Area",
    "Role Group / Hub",
    "Appears In",
    "Compensation Archetype",
    "Allocation",
    "Base Salary / Gross Monthly",
    "Encargos / Labor Charges Monthly",
    "Benefits Monthly",
    "Gross Labor Annual After Growth (2028)",
    "Benefits Annual After Growth (2028)",
    "Model-Calculated Annual Cost (2028)",
    "Calculation Source",
    "Calculation Trace / Formula Basis",
    "Reconciliation Target",
    "Notes",
  ];

  const rows: (string | number | boolean)[][] = [noteRow1, noteRow2, header];

  for (const roleId of [...allRoleIds].sort()) {
    const rep = findRepresentativeRecord(roleId, minimum, balanced, premium);
    if (!rep) continue;

    const isHubActive = rep.orgDesignOptionId !== "minimum_experience";
    const divisionArea = getDivisionArea(rep, isHubActive);
    const roleGroupOrHub = getRoleGroupOrHub(rep, divisionArea);
    const displayLabel = getBoardDisplayLabel(rep);
    const appearsIn = getAppearsIn(roleId, minimum, balanced, premium);
    const archetype = getCompensationArchetypeSummary(rep);
    const reconciliationTarget = getReconciliationTarget(rep.allocationModel);

    const rec2028 = find2028OrFirstActiveRecord(roleId, [balanced, premium, minimum]);
    const grossLaborAnnual = rec2028?.grossLaborAnnualAfterGrowth ?? 0;
    const benefitsAnnual = rec2028?.benefitsAnnualAfterGrowth ?? 0;
    const modelAnnualCost = grossLaborAnnual + benefitsAnnual;
    const calcSourceYear = rec2028?.year ?? 2028;
    const calcSource =
      `fopagEngine.ts calculateFopag() — ${openingPackageId} / ` +
      `${rec2028?.orgDesignOptionId ?? rep.orgDesignOptionId} / year=${calcSourceYear}`;

    rows.push([
      displayLabel,
      roleId,
      divisionArea,
      roleGroupOrHub,
      appearsIn,
      archetype,
      rep.allocationModel,
      rep.grossMonthly,
      rep.laborChargesMonthly,
      rep.benefitsMonthly,
      grossLaborAnnual,
      benefitsAnnual,
      modelAnnualCost,
      calcSource,
      CALC_TRACE,
      reconciliationTarget,
      rep.sourceNotes ?? "",
    ]);
  }

  return rows;
}

const ORG_DESIGN_LABELS: Record<string, string> = {
  minimum_experience: "Minimum Experience",
  balanced_experience: "Balanced Experience",
  premium_experience: "Premium Experience",
};

export function buildRoleScenarioActivationRows(
  input: PayrollGovernanceInput,
): (string | number | boolean)[][] {
  const { openingPackageId, minimum, balanced, premium } = input;

  const noteRow: (string | number | boolean)[] = [
    "Role Scenario Activation Matrix — all model-backed payroll roles across Minimum, Balanced, and Premium " +
      "org design scenarios. Long format: one row per role × year × scenario. Includes teaching and non-teaching roles. " +
      "Uses selected opening scenario from DRE export context. No tuition values. No receita calculations.",
  ];
  const header: (string | number | boolean)[] = [
    "Org Design Scenario",
    "Opening Scenario",
    "Year",
    "Division / Area",
    "Role Group / Hub",
    "Role",
    "Role ID",
    "HC / FTE",
    "Compensation Archetype",
    "Allocation",
    "Appears In",
    "Activation Year Source",
    "First Active Year",
    "Is Audit Row",
    "Source Type / Logic",
    "Calculation Source",
    "Reconciliation Target",
    "Notes",
  ];

  const rows: (string | number | boolean)[][] = [noteRow, header];

  const VARIANTS = [
    { id: "minimum_experience", fopagOutput: minimum.fopagOutput },
    { id: "balanced_experience", fopagOutput: balanced.fopagOutput },
    { id: "premium_experience", fopagOutput: premium.fopagOutput },
  ] as const;

  // Precompute first active year per scenario:roleId
  const firstActiveYear = new Map<string, number>();
  for (const { id, fopagOutput } of VARIANTS) {
    const roleIds = new Set(fopagOutput.records.map((r) => r.roleId));
    for (const roleId of roleIds) {
      const active = fopagOutput.records.filter((r) => r.roleId === roleId && !r.isAuditRow);
      if (active.length > 0) {
        firstActiveYear.set(`${id}:${roleId}`, Math.min(...active.map((r) => r.year)));
      }
    }
  }

  // Precompute appearsIn per roleId (same across all scenarios)
  const allRoleIds = new Set<string>();
  for (const { fopagOutput } of VARIANTS) {
    for (const rec of fopagOutput.records) allRoleIds.add(rec.roleId);
  }
  const appearsInCache = new Map<string, string>();
  for (const roleId of allRoleIds) {
    appearsInCache.set(roleId, getAppearsIn(roleId, minimum, balanced, premium));
  }

  for (const { id, fopagOutput } of VARIANTS) {
    const scenarioLabel = ORG_DESIGN_LABELS[id] ?? id;
    const isHubActive = id !== "minimum_experience";

    const sorted = [...fopagOutput.records].sort(
      (a, b) => a.year - b.year || a.roleId.localeCompare(b.roleId),
    );

    for (const rec of sorted) {
      const divisionArea = getDivisionArea(rec, isHubActive);
      const roleGroupOrHub = getRoleGroupOrHub(rec, divisionArea);
      const displayLabel = getBoardDisplayLabel(rec);
      const appearsIn = appearsInCache.get(rec.roleId) ?? "—";
      const archetype = getCompensationArchetypeSummary(rec);
      const reconciliationTarget = getReconciliationTarget(rec.allocationModel);
      const activationYearSource = getActivationYearSource(rec.roleId);
      const fay = firstActiveYear.get(`${id}:${rec.roleId}`) ?? "never";
      const calcSource =
        `fopagEngine.ts calculateFopag() — ${openingPackageId} / ${id} / year=${rec.year}`;

      rows.push([
        scenarioLabel,
        openingPackageId,
        rec.year,
        divisionArea,
        roleGroupOrHub,
        displayLabel,
        rec.roleId,
        rec.headcountOrFte,
        archetype,
        rec.allocationModel,
        appearsIn,
        activationYearSource,
        fay,
        rec.isAuditRow,
        getSourceTypeLabel(rec.roleSourceType),
        calcSource,
        reconciliationTarget,
        rec.sourceNotes ?? "",
      ]);
    }
  }

  return rows;
}
