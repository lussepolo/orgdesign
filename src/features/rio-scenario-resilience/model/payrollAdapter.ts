import { PAYROLL_ROLE_COST_SOURCE_DATA } from "./payrollRoleCostSourceData";
import { ORG_DESIGN_PAYROLL_ACTIVATION } from "./orgDesignPayrollActivation";
import { calculateSectionCountsForScenario } from "./sectionCountEngine";
import { COMBINED_ACTIVE_GRADE_RECORDS } from "./matureStateCarryForwardSourceData";
import { SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type {
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import { GRADE_DIVISION_MAP } from "./revenueInputs";
import type {
  PayrollAdapterBuildInput,
  PayrollAdapterBuildOutput,
  PayrollAdapterCostSourceId,
  PayrollAdapterDiagnostic,
  PayrollAdapterRecord,
  PayrollAdapterRecordSourceType,
} from "./payrollAdapterContract";

// Full 20-year simulator horizon: 2028–2047.
// Phase 11B: extended from 2028–2037 to include mature-state years 2038–2047.
const PROJECTION_YEARS = SIMULATOR_PROJECTION_YEARS;
type ProjectionYear = (typeof PROJECTION_YEARS)[number];

const VALID_ORG_DESIGN_OPTIONS = [
  "minimum_experience",
  "balanced_experience",
  "premium_experience",
] as const;

// Cost values sourced from src/constants/teaching.ts — Finance-validated (Luciana 2026-06-03).
// Do not change without Finance confirmation.
const MASTER_EDUCATOR = {
  grossMonthly: 15247.55,
  laborChargesMonthly: 7395.06,
  benefitsMonthly: 1159.83,
  allocationModel: "FOPAG_DIRETO" as const,
  costSourceId: "educator_level_master" as PayrollAdapterCostSourceId,
  costSourceNote:
    "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — approved v1 MS/HS teaching tier (Phase 8C, Luciana 2026-06-03).",
};

const LEARNING_ASSISTANT = {
  grossMonthly: 4595.88,
  laborChargesMonthly: 2229.0,
  benefitsMonthly: 997.19,
  allocationModel: "FOPAG_DIRETO" as const,
  costSourceId: "learning_assistant_detail" as PayrollAdapterCostSourceId,
  costSourceNote:
    "src/constants/teaching.ts LEARNING_ASSISTANT_DETAIL — Finance-validated (Luciana 2026-06-03).",
};

const LEARNING_MONITOR = {
  grossMonthly: 4060.63,
  laborChargesMonthly: 1969.41,
  benefitsMonthly: 994.92,
  allocationModel: "FOPAG_DIRETO" as const,
  costSourceId: "learning_monitor_detail" as PayrollAdapterCostSourceId,
  costSourceNote:
    "src/constants/teaching.ts LEARNING_MONITOR_DETAIL — Finance-validated (Luciana 2026-06-03). EY-only support role.",
};

// Cost lookup for extension roles that use educator archetypes.
// allocationModel confirmed for all 6 roles (Phase 8G.1, Luciana 2026-06-03).
const EXTENSION_ROLE_COST: Record<
  string,
  {
    grossMonthly: number;
    laborChargesMonthly: number;
    benefitsMonthly: number;
    allocationModel: "FOPAG_DIRETO" | "FOLHA_DIRETA";
    costSourceId: PayrollAdapterCostSourceId;
    costSourceNote: string;
  }
> = {
  events_assistant: {
    grossMonthly: 4060.63,
    laborChargesMonthly: 1969.41,
    benefitsMonthly: 994.92,
    allocationModel: "FOLHA_DIRETA",
    costSourceId: "learning_monitor_detail",
    costSourceNote:
      "src/constants/teaching.ts LEARNING_MONITOR_DETAIL — Finance-validated. allocationModel FOLHA_DIRETA confirmed Phase 8G.1.",
  },
  maker_space_assistant: {
    grossMonthly: 7763.46,
    laborChargesMonthly: 3765.28,
    benefitsMonthly: 1128.1,
    allocationModel: "FOPAG_DIRETO",
    costSourceId: "educator_level_associate",
    costSourceNote:
      "src/constants/teaching.ts EDUCATOR_LEVELS['associate'] — Finance-validated. allocationModel FOPAG_DIRETO confirmed Phase 8G.1.",
  },
  language_acquisition_coach: {
    grossMonthly: 15247.55,
    laborChargesMonthly: 7395.06,
    benefitsMonthly: 1159.83,
    allocationModel: "FOLHA_DIRETA",
    costSourceId: "educator_level_master",
    costSourceNote:
      "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — Finance-validated. allocationModel FOLHA_DIRETA confirmed Phase 8G.1.",
  },
  personalized_learning_associate_educator: {
    grossMonthly: 7763.46,
    laborChargesMonthly: 3765.28,
    benefitsMonthly: 1128.1,
    allocationModel: "FOPAG_DIRETO",
    costSourceId: "educator_level_associate",
    costSourceNote:
      "src/constants/teaching.ts EDUCATOR_LEVELS['associate'] — Finance-validated. allocationModel FOPAG_DIRETO confirmed Phase 8G.1.",
  },
  security_coordinator: {
    grossMonthly: 15247.55,
    laborChargesMonthly: 7395.06,
    benefitsMonthly: 1159.83,
    allocationModel: "FOLHA_DIRETA",
    costSourceId: "educator_level_master",
    costSourceNote:
      "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — Finance-validated. allocationModel FOLHA_DIRETA confirmed Phase 8G.1.",
  },
  curriculum_and_assessment_designer: {
    grossMonthly: 15247.55,
    laborChargesMonthly: 7395.06,
    benefitsMonthly: 1159.83,
    allocationModel: "FOLHA_DIRETA",
    costSourceId: "educator_level_master",
    costSourceNote:
      "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — Finance-validated. allocationModel FOLHA_DIRETA confirmed Phase 8G.1.",
  },
};

// Approved v1 fixed FTE counts (Phase 8C, Luciana 2026-06-03).
const MS_FTE_BY_GRADE: Record<string, number> = { g6: 3, g7: 4, g8: 3 };
const HS_FTE_BY_GRADE: Record<string, number> = { g9: 4, g10: 0, g11: 3, g12: 3 };

// Step function: resolves headcount for a given year from a progression array.
function resolveHeadcount(
  progression: [number, number][] | null,
  year: number,
  activeFrom: number | null,
): number {
  if (!progression || progression.length === 0) return 0;
  if (activeFrom !== null && year < activeFrom) return 0;
  const match = progression.filter(([y]) => y <= year).pop();
  return match ? match[1] : 0;
}

function baselineRoleSourceType(family: string): PayrollAdapterRecordSourceType {
  if (family === "Leadership") return "baseline_leadership";
  if (family === "Backoffice") return "baseline_backoffice";
  return "baseline_specialist";
}

function baselineCostSourceId(family: string): PayrollAdapterCostSourceId {
  if (family === "Leadership") return "leadership_config";
  if (family === "Backoffice") return "backoffice_config";
  return "specialist_config";
}

// Phase 13H (2026-06-09): the calculationReady/fopagCalculationReady/adapterImplemented fields
// on PayrollAdapterBuildOutput (and calculationReady on each PayrollAdapterRecord) are legacy
// adapter metadata pinned to fixed literal values by payrollAdapterContract.ts. They are not
// consumed by fopagEngine.ts or any other caller. The actual FOPAG readiness signal is
// FopagEngineOutput.calculationReady, computed dynamically per scenario by
// fopagEngine.calculateFopag() from adapterStatus and diagnostics. Do not treat the literals
// below as indicating that FOPAG is unimplemented.
export function buildPayrollAdapterInput(
  input: PayrollAdapterBuildInput,
): PayrollAdapterBuildOutput {
  const { openingPackageId, occupancyScenarioId, orgDesignOptionId } = input;
  const records: PayrollAdapterRecord[] = [];
  const diagnostics: PayrollAdapterDiagnostic[] = [];

  if (
    !VALID_ORG_DESIGN_OPTIONS.includes(
      orgDesignOptionId as (typeof VALID_ORG_DESIGN_OPTIONS)[number],
    )
  ) {
    diagnostics.push({
      diagnosticType: "unsupported_org_design_option",
      roleId: "N/A",
      roleName: "N/A",
      message: `Unsupported orgDesignOptionId: "${orgDesignOptionId}". Valid options: ${VALID_ORG_DESIGN_OPTIONS.join(", ")}.`,
    });
    return {
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
      adapterStatus: "failed_unsupported_option",
      records: [],
      diagnostics,
      calculationReady: false,
      adapterImplemented: true,
      fopagCalculationReady: false,
      sourceNotes: "Adapter failed: unsupported orgDesignOptionId.",
    };
  }

  // ── 1. Baseline non-teaching roles ──────────────────────────────────────────
  // Source: PAYROLL_ROLE_COST_SOURCE_DATA records for Leadership, Backoffice, Specialists.
  // Excludes TeachingTier and TeachingSupport (handled in sections 3–4).
  // hs_pool is excluded_from_v1 — HS covered by per-grade FTE ramp (section 4).
  const BASELINE_FAMILIES = new Set(["Leadership", "Backoffice", "Specialists"]);

  for (const rec of PAYROLL_ROLE_COST_SOURCE_DATA.records) {
    if (!BASELINE_FAMILIES.has(rec.roleFamily)) continue;

    if (rec.normalizedRoleId === "hs_pool") {
      diagnostics.push({
        diagnosticType: "excluded_role",
        roleId: "hs_pool",
        roleName: "HS Educator Pool",
        message:
          "hs_pool is excluded_from_v1. HS staffing is covered by the per-grade FTE ramp " +
          "(g9=4, g10=0, g11=3, g12=3). Using both simultaneously would double-count HS cost.",
      });
      continue;
    }

    const roleSourceType = baselineRoleSourceType(rec.roleFamily);
    const costSourceId = baselineCostSourceId(rec.roleFamily);

    for (const year of PROJECTION_YEARS) {
      const hc = resolveHeadcount(rec.headcountProgression, year, rec.yearApplicability);
      const active = hc > 0;

      records.push({
        openingPackageId,
        occupancyScenarioId,
        orgDesignOptionId,
        year,
        roleId: rec.normalizedRoleId,
        payrollRoleId: rec.normalizedRoleId,
        roleName: rec.sourceRoleLabel,
        roleSourceType,
        allocationModel: rec.allocationCategory,
        headcountOrFte: hc,
        headcountSourceType: "headcount_progression",
        headcountSourceNote:
          `${rec.sourceSheetOrTab} activeFrom=${rec.yearApplicability ?? "n/a"}; ` +
          `progression: ${JSON.stringify(rec.headcountProgression)}`,
        costSourceId,
        costSourceNote: `${rec.sourceFile} ${rec.sourceSheetOrTab} — Finance-validated (Luciana 2026-06-03).`,
        grossMonthly: rec.rawGrossMonthlyBRL,
        laborChargesMonthly: rec.rawLaborChargesMonthlyBRL,
        benefitsMonthly: rec.rawBenefitsMonthlyBRL,
        active,
        calculationReady: false,
        diagnostics: [],
        sourceNotes: rec.sourceNotes,
      });
    }
  }

  // ── 2. Org Design extension roles ───────────────────────────────────────────
  // Alias roles (extension_uses_existing_payroll_logic): cost is already captured in
  // section 1 under their payrollRoleId baseline record. No additional cost records.
  // New extension roles (extension_uses_educator_archetype): per-year records with
  // confirmed cost from EXTENSION_ROLE_COST. HC=1 from activationYear=2028 (source-contract).
  // Tab-logic roles (extension_uses_tab_logic): handled in sections 3–4; skipped here.

  for (const activation of ORG_DESIGN_PAYROLL_ACTIVATION.records) {
    if (activation.roleSourceType === "baseline_role") continue;
    if (activation.roleSourceType === "extension_uses_tab_logic") continue;

    if (activation.roleSourceType === "extension_uses_existing_payroll_logic") {
      diagnostics.push({
        diagnosticType: "alias_no_additional_cost",
        roleId: activation.sourceRoleId,
        roleName: activation.roleName,
        message:
          `"${activation.roleName}" (${activation.sourceRoleId}) is a label alias for ` +
          `existing baseline role "${activation.payrollRoleId}". Cost and headcount are ` +
          `already captured in section 1 under payrollRoleId="${activation.payrollRoleId}". ` +
          `No additional cost records generated.`,
      });
      continue;
    }

    if (activation.roleSourceType === "extension_uses_educator_archetype") {
      const isActiveInOption = (
        activation.activeIn as readonly string[]
      ).includes(orgDesignOptionId);

      if (!isActiveInOption) {
        diagnostics.push({
          diagnosticType: "extension_not_active_in_option",
          roleId: activation.sourceRoleId,
          roleName: activation.roleName,
          message:
            `"${activation.roleName}" is not active in org design option "${orgDesignOptionId}". ` +
            `Active options: [${(activation.activeIn as readonly string[]).join(", ")}].`,
        });
        continue;
      }

      const cost = EXTENSION_ROLE_COST[activation.sourceRoleId];

      if (!cost) {
        diagnostics.push({
          diagnosticType: "missing_cost_source",
          roleId: activation.sourceRoleId,
          roleName: activation.roleName,
          message:
            `No cost mapping found for extension role "${activation.sourceRoleId}". ` +
            `Source blocker: record cannot be calculation-ready.`,
        });
        continue;
      }

      for (const year of PROJECTION_YEARS) {
        // HC=1 from activationYear=2028 (source-contract; not Finance-validated payroll schedule).
        const active = year >= 2028;

        records.push({
          openingPackageId,
          occupancyScenarioId,
          orgDesignOptionId,
          year,
          roleId: activation.sourceRoleId,
          payrollRoleId: activation.payrollRoleId,
          roleName: activation.roleName,
          roleSourceType: "extension_new_role",
          allocationModel: cost.allocationModel,
          headcountOrFte: active ? 1 : 0,
          headcountSourceType: "extension_schedule_fixed",
          headcountSourceNote:
            "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, " +
            "headcountSource='fixed'. Source-contract value — not Finance-validated payroll schedule.",
          costSourceId: cost.costSourceId,
          costSourceNote: cost.costSourceNote,
          grossMonthly: cost.grossMonthly,
          laborChargesMonthly: cost.laborChargesMonthly,
          benefitsMonthly: cost.benefitsMonthly,
          active,
          calculationReady: false,
          diagnostics: [],
          sourceNotes: activation.sourceNotes,
        });
      }
    }
  }

  // ── 3. EY/LS section-based teaching and support staffing ────────────────────
  // Uses sectionCountEngine output. sectionCount is used (not rawSections).
  // EY: 1 teaching lead + 1 learning assistant + 1 learning monitor per section.
  // LS: 1 teaching lead + 1 learning assistant per section.
  // EY/LS teaching lead compensation tier: Master Educator (approved v1, Phase 8H.1, Luciana 2026-06-03).
  // Support roles (learning assistant, learning monitor) costs are Finance-validated.

  const sectionOutput = calculateSectionCountsForScenario({
    openingPackageId: openingPackageId as OpeningPackageId,
    occupancyScenarioId: occupancyScenarioId as OccupancyScenarioId,
  });

  // Surface section count engine diagnostics (missing enrollment or studentsPerClass).
  for (const d of sectionOutput.diagnostics) {
    diagnostics.push({
      diagnosticType: "missing_headcount_source",
      roleId: `ey_ls_section_${d.gradeId}`,
      roleName: `EY/LS Section (${d.gradeId})`,
      year: d.year,
      message: `Section count engine: ${d.reason}`,
    });
  }

  for (const sec of sectionOutput.records) {
    if (sec.division !== "ey" && sec.division !== "ls") continue;

    if (sec.sectionOverflow) {
      diagnostics.push({
        diagnosticType: "section_overflow",
        roleId: `${sec.division}_section_${sec.gradeId}`,
        roleName: `${sec.division.toUpperCase()} Section (${sec.gradeId})`,
        year: sec.year,
        message:
          `Section overflow: grade=${sec.gradeId} year=${sec.year} ` +
          `rawSections=${sec.rawSections} sectionCount=${sec.sectionCount} (capped at 2). ` +
          `Overflow must not be silently discarded.`,
      });
    }

    if (!sec.activeGrade || sec.sectionCount === 0) continue;

    const divLabel = sec.division === "ey" ? "EY" : "LS";

    // Teaching lead — Master Educator tier (approved v1, Phase 8H.1, Luciana 2026-06-03).
    records.push({
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
      year: sec.year,
      roleId: `${sec.division}_teaching_lead_${sec.gradeId}`,
      payrollRoleId: null,
      roleName: `${divLabel} Teaching Lead (${sec.gradeId})`,
      roleSourceType: sec.division === "ey" ? "ey_teaching_lead" : "ls_teaching_lead",
      allocationModel: "FOPAG_DIRETO",
      headcountOrFte: sec.sectionCount,
      headcountSourceType: "per_section",
      headcountSourceNote:
        `sectionCountEngine: sectionCount=${sec.sectionCount} (rawSections=${sec.rawSections}, ` +
        `capped at 2). 1 teaching lead per section. Enrollment=${sec.enrollment}, ` +
        `studentsPerClass=${sec.studentsPerClass}.`,
      costSourceId: MASTER_EDUCATOR.costSourceId,
      costSourceNote:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — approved v1 EY/LS teaching lead tier " +
        "(Phase 8H.1, Luciana 2026-06-03). EY teaching leads: Master Educator. LS teaching leads: Master Educator. " +
        "Confirmed independently of MS/HS tier assumption (Phase 8C). Do not infer from MS/HS records.",
      grossMonthly: MASTER_EDUCATOR.grossMonthly,
      laborChargesMonthly: MASTER_EDUCATOR.laborChargesMonthly,
      benefitsMonthly: MASTER_EDUCATOR.benefitsMonthly,
      active: true,
      calculationReady: false,
      diagnostics: [],
      sourceNotes:
        "EY/LS per-section teaching lead. Approved v1 staffing rule (Phase 8C). " +
        "sectionCountEngine (Phase 8E). Master Educator tier approved v1 (Phase 8H.1, Luciana 2026-06-03). FOPAG_DIRETO.",
    });

    // Learning assistant (EY and LS)
    records.push({
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
      year: sec.year,
      roleId: `${sec.division}_learning_assistant_${sec.gradeId}`,
      payrollRoleId: null,
      roleName: `${divLabel} Learning Assistant (${sec.gradeId})`,
      roleSourceType:
        sec.division === "ey" ? "ey_learning_assistant" : "ls_learning_assistant",
      allocationModel: LEARNING_ASSISTANT.allocationModel,
      headcountOrFte: sec.sectionCount,
      headcountSourceType: "per_section",
      headcountSourceNote:
        `sectionCountEngine: sectionCount=${sec.sectionCount}. 1 learning assistant per section.`,
      costSourceId: LEARNING_ASSISTANT.costSourceId,
      costSourceNote: LEARNING_ASSISTANT.costSourceNote,
      grossMonthly: LEARNING_ASSISTANT.grossMonthly,
      laborChargesMonthly: LEARNING_ASSISTANT.laborChargesMonthly,
      benefitsMonthly: LEARNING_ASSISTANT.benefitsMonthly,
      active: true,
      calculationReady: false,
      diagnostics: [],
      sourceNotes: `${divLabel} per-section learning assistant. 1 per turma. FOPAG_DIRETO.`,
    });

    // Learning monitor (EY only — not applied to LS/MS/HS)
    if (sec.division === "ey") {
      records.push({
        openingPackageId,
        occupancyScenarioId,
        orgDesignOptionId,
        year: sec.year,
        roleId: `ey_learning_monitor_${sec.gradeId}`,
        payrollRoleId: null,
        roleName: `EY Learning Monitor (${sec.gradeId})`,
        roleSourceType: "ey_learning_monitor",
        allocationModel: LEARNING_MONITOR.allocationModel,
        headcountOrFte: sec.sectionCount,
        headcountSourceType: "per_section",
        headcountSourceNote:
          `sectionCountEngine: sectionCount=${sec.sectionCount}. 1 learning monitor per section. EY-only.`,
        costSourceId: LEARNING_MONITOR.costSourceId,
        costSourceNote: LEARNING_MONITOR.costSourceNote,
        grossMonthly: LEARNING_MONITOR.grossMonthly,
        laborChargesMonthly: LEARNING_MONITOR.laborChargesMonthly,
        benefitsMonthly: LEARNING_MONITOR.benefitsMonthly,
        active: true,
        calculationReady: false,
        diagnostics: [],
        sourceNotes:
          "EY per-section learning monitor. 1 per turma. EY-only (not LS/MS/HS). FOPAG_DIRETO.",
      });
    }
  }

  // ── 4. MS/HS educators — fixed FTE per grade ────────────────────────────────
  // MS: g6=3, g7=4, g8=3. HS: g9=4, g10=0, g11=3, g12=3 (approved v1, Phase 8C).
  // Compensation: Master Educator (approved v1, Phase 8C).
  // Allocation: FOPAG_DIRETO.
  // Grade activation from OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS (Finance-validated).
  // hs_pool excluded — per-grade ramp is the selected v1 HS model (no double-count).

  const msHsActiveByYearGrade = new Map<string, boolean>();
  for (const r of COMBINED_ACTIVE_GRADE_RECORDS) {
    if (r.packageId !== openingPackageId || r.isCarryForwardYear) continue;
    const gid = String(r.normalizedGradeId).toLowerCase();
    const div = GRADE_DIVISION_MAP[gid as keyof typeof GRADE_DIVISION_MAP];
    if (div !== "ms" && div !== "hs") continue;
    msHsActiveByYearGrade.set(`${r.year}:${gid}`, r.activeStatus === "active");
  }

  const msHsGrades: [string, Record<string, number>, "ms_teaching_lead" | "hs_teaching_lead"][] =
    [
      ["ms", MS_FTE_BY_GRADE, "ms_teaching_lead"],
      ["hs", HS_FTE_BY_GRADE, "hs_teaching_lead"],
    ];

  for (const [div, fteMap, roleSourceType] of msHsGrades) {
    for (const [gradeId, fte] of Object.entries(fteMap)) {
      for (const year of PROJECTION_YEARS) {
        const active = msHsActiveByYearGrade.get(`${year}:${gradeId}`) ?? false;
        const recordDiagnostics: string[] = [];

        if (active && fte === 0) {
          recordDiagnostics.push(
            `Grade ${gradeId} is active but FTE=0: shared pool coverage; no incremental educator cost.`,
          );
          diagnostics.push({
            diagnosticType: "zero_fte_grade",
            roleId: `${div}_educator_${gradeId}`,
            roleName: `${div.toUpperCase()} Educator (${gradeId.toUpperCase()})`,
            year,
            message:
              `Grade ${gradeId} is active in year ${year} but FTE=0. ` +
              `Shared pool coverage; no incremental cost for this grade.`,
          });
        }

        records.push({
          openingPackageId,
          occupancyScenarioId,
          orgDesignOptionId,
          year,
          roleId: `${div}_educator_${gradeId}`,
          payrollRoleId: null,
          roleName: `${div.toUpperCase()} Educator (${gradeId.toUpperCase()})`,
          roleSourceType,
          allocationModel: MASTER_EDUCATOR.allocationModel,
          headcountOrFte: active ? fte : 0,
          headcountSourceType: "fixed_fte_per_grade",
          headcountSourceNote:
            `PAYROLL_STAFFING_RULE_SOURCE_V1 ${div}-${gradeId}-teaching-lead: ` +
            `fixed FTE=${fte} (approved v1, Phase 8C, Luciana 2026-06-03). ` +
            `Grade activation: OPENING_PACKAGE_ACTIVE_GRADE_BY_YEAR_RECORDS package=${openingPackageId}.`,
          costSourceId: MASTER_EDUCATOR.costSourceId,
          costSourceNote: MASTER_EDUCATOR.costSourceNote,
          grossMonthly: MASTER_EDUCATOR.grossMonthly,
          laborChargesMonthly: MASTER_EDUCATOR.laborChargesMonthly,
          benefitsMonthly: MASTER_EDUCATOR.benefitsMonthly,
          active,
          calculationReady: false,
          diagnostics: recordDiagnostics,
          sourceNotes:
            `${div.toUpperCase()} per-grade fixed FTE staffing. Master Educator tier ` +
            `(approved v1, Phase 8C). FOPAG_DIRETO. hs_pool excluded_from_v1.`,
        });
      }
    }
  }

  // ── 5. Payroll growth ───────────────────────────────────────────────────────
  // Growth convention preserved: ANNUAL_ADJUSTMENT=1.06, baseYear=2028,
  // formula Math.pow(1.06, year - 2028 + 1) confirmed as approved v1 (Phase 8E).
  // The adapter records raw monthly cost components.
  // Growth factors are applied at the FOPAG calculation layer (not here).
  // No annual totals are computed in this adapter.

  const hasMissingCost = records.some(
    (r) =>
      r.grossMonthly === null ||
      r.laborChargesMonthly === null ||
      r.benefitsMonthly === null,
  );
  const adapterStatus = hasMissingCost ? "partial_missing_cost" : "assembled";

  return {
    openingPackageId,
    occupancyScenarioId,
    orgDesignOptionId,
    adapterStatus,
    records,
    diagnostics,
    calculationReady: false,
    adapterImplemented: true,
    fopagCalculationReady: false,
    sourceNotes:
      "Phase 8H Payroll Adapter (2026-06-03). " +
      "Assembles normalized payroll input records by role × year for the selected scenario combination. " +
      "Does NOT compute FOPAG_DIRETO annual total, FOLHA_DIRETA annual total, BENEFITS annual total, " +
      "TOTAL_PAYROLL, or FOPAG/Receita ratios. " +
      "Baseline non-teaching roles: 25 roles from LEADERSHIP_CONFIG/BACKOFFICE_CONFIG/SPECIALISTS_CONFIG " +
      "(hs_pool excluded_from_v1). " +
      "Extension alias roles: 5 label aliases resolved to existing baseline records (no additional cost). " +
      "Extension new roles: 6 roles with confirmed allocationModel and cost (Phase 8G.1). " +
      "EY/LS section staffing: sectionCountEngine (Phase 8E); teaching lead tier: Master Educator (approved v1, Phase 8H.1). " +
      "MS/HS fixed FTE: approved v1 counts, Master Educator tier (Phase 8C). " +
      "Payroll growth: raw monthly cost; growth factors applied at FOPAG calculation layer. " +
      "Phase 13H (2026-06-09): FOPAG calculation IS implemented (fopagEngine.ts calculateFopag(), " +
      "Phase 8I/11B) — the prior 'explicit FOPAG implementation approval' blocker is resolved. " +
      "CALCULATION_CAN_BEGIN remains false for unrelated full-board-model reasons " +
      "(see inputReadinessRegistry.ts).",
  };
}
