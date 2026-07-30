import type { OrgDesignPayrollActivationDesign } from "./orgDesignPayrollActivationContract";

const ALL: readonly ["minimum_experience", "balanced_experience", "premium_experience"] =
  ["minimum_experience", "balanced_experience", "premium_experience"] as const;
const BALANCED_PREMIUM: readonly ["balanced_experience", "premium_experience"] =
  ["balanced_experience", "premium_experience"] as const;
const PREMIUM_ONLY: readonly ["premium_experience"] =
  ["premium_experience"] as const;
const EXCLUDED: readonly [] = [] as const;

const LEADERSHIP_COST_SOURCE =
  "src/constants/leadership.ts LEADERSHIP_CONFIG — Finance-validated grossMonthly, laborChargesMonthly, benefitsMonthly, allocationModel";
const BACKOFFICE_COST_SOURCE =
  "src/constants/leadership.ts BACKOFFICE_CONFIG — Finance-validated grossMonthly, laborChargesMonthly, benefitsMonthly, allocationModel";
const SPECIALISTS_COST_SOURCE =
  "src/constants/leadership.ts SPECIALISTS_CONFIG — Finance-validated grossMonthly, laborChargesMonthly, benefitsMonthly, allocationModel";
const LEADERSHIP_HC_SOURCE =
  "src/constants/leadership.ts LEADERSHIP_CONFIG headcount[year] progression";
const BACKOFFICE_HC_SOURCE =
  "src/constants/leadership.ts BACKOFFICE_CONFIG headcount[year] progression";
const SPECIALISTS_HC_SOURCE =
  "src/constants/leadership.ts SPECIALISTS_CONFIG headcount[year] progression";
const LEADERSHIP_ALLOC_SOURCE = "LEADERSHIP_CONFIG.allocationModel — all FOLHA_DIRETA";
const BACKOFFICE_ALLOC_SOURCE = "BACKOFFICE_CONFIG.allocationModel — all FOLHA_DIRETA";

// Phase 13H (2026-06-09): activationStatus, fopagCalculationReady (above), and the per-record
// calculationReady fields below are retained as the Phase 8G (2026-06-03) design-snapshot
// values and are pinned to these literals by OrgDesignPayrollActivationContract.ts. They are
// SUPERSEDED by the Phase 8H/8I/11B implementation: payrollAdapter.ts buildPayrollAdapterInput()
// and fopagEngine.ts calculateFopag() are implemented and consume these records as data. The
// current FOPAG readiness signal is FopagEngineOutput.calculationReady (computed dynamically
// per scenario in fopagEngine.ts) and inputReadinessRegistry.ts entry "payroll_fopag_output"
// (status: confirmed). Do not read activationStatus/fopagCalculationReady/calculationReady on
// this object as current implementation status — see remainingBlockers and sourceNotes below
// for the Phase 13H-corrected narrative.
export const ORG_DESIGN_PAYROLL_ACTIVATION: OrgDesignPayrollActivationDesign = {
  activationStatus: "designed_not_implemented",
  fopagCalculationReady: false,
  approvedAt: "2026-06-03",
  // baselineRoleCount corrected 26→25, 2026-07-30 (direct product-owner
  // cleanup): hs_pool deleted entirely (was excluded_from_v1 dead config,
  // now removed rather than merely excluded) — no other baseline role was
  // added or removed. after_school's move from Specialists to Leadership
  // (same day) does not change this total, only its family classification.
  baselineRoleCount: 25,
  extensionRoleCount: 13,
  baselineActivationRule:
    "All 25 baseline non-teaching roles are active in all three org design options " +
    "(no excluded baseline role remains — hs_pool, formerly excluded_from_v1, was deleted " +
    "2026-07-30 rather than merely excluded). " +
    "Source: orgDesignStructure.ts baselineRoleSet='current_positions_in_system' (all three options identical) " +
    "and orgDesignLogic.md scenario activation comparison table (baseline roles marked Active across all columns). " +
    "HS staffing is covered by the per-grade FTE ramp in " +
    "PAYROLL_STAFFING_RULE_SOURCE_V1 (g9=4, g10=3, g11=2, g12=2, sum=11 — cumulative 4→7→9→11 " +
    "as grades open; direct product-owner correction, 2026-07-30, superseding the prior " +
    "g10=2/g11=3 split from V10-RC2.4A; matches the validated 10 core + 1 flexible = 11 HS " +
    "envelope). Using both simultaneously would double-count HS cost.",
  records: [
    // ── LEADERSHIP BASELINE (Layer B) ───────────────────────────────────────
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "hos",
      payrollRoleId: "hos",
      roleName: "Head of School",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Campus-wide executive. Active 2028, HC=1 flat.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "ey_principal",
      payrollRoleId: "ey_principal",
      roleName: "EY Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Also referenced as early_years_principal in orgDesignScenarioExtensions (label alias). " +
        "Uses existing role record — no duplication.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "ls_principal",
      payrollRoleId: "ls_principal",
      roleName: "LS Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Also referenced as lower_school_principal in orgDesignScenarioExtensions (label alias). " +
        "Uses existing role record — no duplication.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "ms_principal",
      payrollRoleId: "ms_principal",
      roleName: "MS Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2031, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2031",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Activates when MS opens. HC=1 from 2031.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "hs_principal",
      payrollRoleId: "hs_principal",
      roleName: "HS Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2034, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2034",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Activates when HS opens. HC=1 from 2034.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "counselor",
      payrollRoleId: "counselor",
      roleName: "Counselor",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 2], [2032, 3], [2033, 4]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      // Headcount ramp corrected to {2028: 2, 2032: 3, 2033: 4}: direct,
      // live, in-session product-owner correction (Luciana, 2026-07-30),
      // superseding the {2028: 2, 2032: 3} value from the same day's prior
      // correction. Not derived from "MS opens" (MS activates 2031, not
      // 2032/2033) -- a direct headcount-value/year decision, not re-sourced
      // logic. The fourth Counselor's specific division/title attribution is
      // not established by any source in this repository; carried only as
      // governed aggregate headcount — see IMPLEMENTATION.md for the
      // unresolved-governance-question note.
      sourceNotes: "HC 2 from 2028, ramps to 3 at 2032, ramps to 4 at 2033 (direct product-owner correction, 2026-07-30). Covers EY/LS/MS counseling per ramp; the fourth Counselor's specific divisional assignment is an unresolved governance question, not inferred here.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "edtech",
      payrollRoleId: "edtech",
      roleName: "Ed Tech Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "IT Technician and Maker Space Assistant functionally report here per orgDesignLogic.md.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "ops",
      payrollRoleId: "ops",
      roleName: "Ops Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Operations lead. HC=1 from 2028.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "after_school",
      payrollRoleId: "after_school",
      roleName: "After School Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${LEADERSHIP_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: "LEADERSHIP_CONFIG.allocationModel = FOPAG_DIRETO (unchanged from prior Specialists classification)",
      activationYearSource: "LEADERSHIP_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Direct product-owner correction, 2026-07-30 (two-part): (1) roleName corrected " +
        "from the stale \"After School Educator\" to \"After School Coordinator\"; (2) moved " +
        "from Specialists (Layer D) to Leadership (Layer B) — After School Coordinator is in " +
        "the Leadership role family, not Specialists. allocationModel (FOPAG_DIRETO) is " +
        "unchanged. The after_school_coordinator extension role below is a distinct " +
        "org-design classification concept (see its own record) and is unaffected by either " +
        "correction.",
    },
    // ── BACKOFFICE BASELINE (Layer C) ────────────────────────────────────────
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "clerk",
      payrollRoleId: "clerk",
      roleName: "Clerk (Portaria)",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 4]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "security_clerks extension role is a label alias for this role. " +
        "Do NOT add extra clerk HC in Balanced or Premium (orgDesignLogic.md).",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "family",
      payrollRoleId: "family",
      roleName: "Family Engagement Analyst",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "library",
      payrollRoleId: "library",
      roleName: "Inspirationeer",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "librarian extension role is a label alias for this role. " +
        "Display label is Librarian; payroll role is Inspirationeer.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "it",
      payrollRoleId: "it",
      roleName: "IT Technician",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1], [2032, 2]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "HC 1 from 2028, ramps to 2 at 2032.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "maintenance",
      payrollRoleId: "maintenance",
      roleName: "Maintenance Technician",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 2], [2036, 3]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "HC 2 from 2028, ramps to 3 at 2036.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "marketing",
      payrollRoleId: "marketing",
      roleName: "Marketing & Events Analyst",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "nurse",
      payrollRoleId: "nurse",
      roleName: "Nurse Technician",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1], [2035, 2]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "HC 1 from 2028, ramps to 2 at 2035.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "nursing_intern",
      payrollRoleId: "nursing_intern",
      roleName: "Nursing Intern",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "finance",
      payrollRoleId: "finance",
      roleName: "Financial Analyst",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 2]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "HC=2 from 2028 (flat).",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "finance_assistant",
      payrollRoleId: "finance_assistant",
      roleName: "Assistente Financeiro",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2031, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2031",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Activates 2031. HC=1 from 2031.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "hr",
      payrollRoleId: "hr",
      roleName: "HR Analyst",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "secretary",
      payrollRoleId: "secretary",
      roleName: "School Secretary",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${BACKOFFICE_HC_SOURCE} — hc([[2028, 1]])`,
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "BACKOFFICE_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "",
    },
    // ── SPECIALISTS BASELINE (Layer D) ───────────────────────────────────────
    // after_school moved to the Leadership section above, 2026-07-30 —
    // direct product-owner correction (role family, not just label).
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "arts",
      payrollRoleId: "arts",
      roleName: "Arts Educator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${SPECIALISTS_HC_SOURCE} — hc([[2028, 1], [2031, 2]])`,
      costSource: SPECIALISTS_COST_SOURCE,
      allocationModelSource: "SPECIALISTS_CONFIG.allocationModel = FOPAG_DIRETO",
      activationYearSource: "SPECIALISTS_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Shared specialist. HC 1 → 2 at 2031.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "body",
      payrollRoleId: "body",
      roleName: "Body & Movement Educator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${SPECIALISTS_HC_SOURCE} — hc([[2028, 1], [2031, 2]])`,
      costSource: SPECIALISTS_COST_SOURCE,
      allocationModelSource: "SPECIALISTS_CONFIG.allocationModel = FOPAG_DIRETO",
      activationYearSource: "SPECIALISTS_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Shared specialist. HC 1 → 2 at 2031.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "music",
      payrollRoleId: "music",
      roleName: "Music Educator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${SPECIALISTS_HC_SOURCE} — hc([[2028, 1], [2031, 2]])`,
      costSource: SPECIALISTS_COST_SOURCE,
      allocationModelSource: "SPECIALISTS_CONFIG.allocationModel = FOPAG_DIRETO",
      activationYearSource: "SPECIALISTS_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes: "Shared specialist. HC 1 → 2 at 2031.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "baseline_role",
      sourceRoleId: "led",
      payrollRoleId: "led",
      roleName: "Learning Exp Designer",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: `${SPECIALISTS_HC_SOURCE} — hc([[2028, 1], [2031, 2], [2034, 3], [2037, 4]])`,
      costSource: SPECIALISTS_COST_SOURCE,
      allocationModelSource: "SPECIALISTS_CONFIG.allocationModel = FOLHA_DIRETA",
      activationYearSource: "SPECIALISTS_CONFIG.activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Salary R$15,992.88 (~5% above Master Educator). HC ramps 1→2→3→4 over 2028–2037. " +
        "Do not alias to Master Educator unless source confirms no existing role record.",
    },
    // hs_pool deleted, 2026-07-30 (direct product-owner cleanup): this
    // record was already excluded_from_v1 (Phase 8C) — HS staffing is
    // covered by the per-grade FTE ramp (g9=4, g10=3, g11=2, g12=2, sum=11,
    // cumulative 4→7→9→11) in PAYROLL_STAFFING_RULE_SOURCE_V1. Removed as
    // dead config now that the exclusion has been confirmed permanent — see
    // leadership.ts SPECIALISTS_CONFIG for the corresponding source deletion.
    // ── EXTENSION ROLES: uses_existing_payroll_logic ─────────────────────────
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_existing_payroll_logic",
      sourceRoleId: "security_clerks",
      payrollRoleId: "clerk",
      roleName: "Security / Clerks",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: "Reuses clerk BACKOFFICE_CONFIG headcount — hc([[2028, 4]]). Do NOT add extra HC in Balanced or Premium.",
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "Inherits from clerk — activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Label alias for existing clerk role. Uses existing headcount and cost without modification. " +
        "Security Coordinator (Balanced/Premium) governs security/clerks but does not create extra HC.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_existing_payroll_logic",
      sourceRoleId: "librarian",
      payrollRoleId: "library",
      roleName: "Librarian",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: "Reuses library BACKOFFICE_CONFIG headcount — hc([[2028, 1]])",
      costSource: BACKOFFICE_COST_SOURCE,
      allocationModelSource: BACKOFFICE_ALLOC_SOURCE,
      activationYearSource: "Inherits from library — activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Label alias for existing Inspirationeer / library role. Do not create a new Librarian payroll role.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_existing_payroll_logic",
      sourceRoleId: "early_years_principal",
      payrollRoleId: "ey_principal",
      roleName: "Early Years Principal",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: "Reuses ey_principal LEADERSHIP_CONFIG headcount — hc([[2028, 1]])",
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "Inherits from ey_principal — activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Label alias for EY Coordinator. Display label is Early Years Principal. " +
        "Do not create a new Principal payroll role.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_existing_payroll_logic",
      sourceRoleId: "lower_school_principal",
      payrollRoleId: "ls_principal",
      roleName: "Lower School Principal",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: "Reuses ls_principal LEADERSHIP_CONFIG headcount — hc([[2028, 1]])",
      costSource: LEADERSHIP_COST_SOURCE,
      allocationModelSource: LEADERSHIP_ALLOC_SOURCE,
      activationYearSource: "Inherits from ls_principal — activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Label alias for LS Coordinator. Display label is Lower School Principal. " +
        "Do not create a new Principal payroll role.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_existing_payroll_logic",
      sourceRoleId: "after_school_coordinator",
      payrollRoleId: "after_school",
      roleName: "After School Coordinator",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource: "Reuses after_school SPECIALISTS_CONFIG headcount — hc([[2028, 1]])",
      costSource: SPECIALISTS_COST_SOURCE,
      allocationModelSource: "SPECIALISTS_CONFIG.allocationModel = FOPAG_DIRETO",
      activationYearSource: "Inherits from after_school — activeFrom = 2028",
      mappingStatus: "source_resolved_maps_existing_role",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Classification override for org-design storytelling. " +
        "Salary, headcount, and payroll formula are unchanged from after_school baseline role.",
    },
    // ── EXTENSION ROLES: uses_educator_archetype ─────────────────────────────
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "events_assistant",
      payrollRoleId: "events_assistant",
      roleName: "Events Assistant",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "This is a committed source-contract value, not a Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts LEARNING_MONITOR_DETAIL — grossMonthly=4060.63, " +
        "laborChargesMonthly=1969.41, benefitsMonthly=994.92",
      allocationModelSource:
        "Finance-confirmed: FOLHA_DIRETA (Luciana, 2026-06-03). " +
        "Overrides LEARNING_MONITOR_DETAIL source-derived FOPAG_DIRETO (teaching.ts:161).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "All cost fields confirmed from LEARNING_MONITOR_DETAIL. allocationModel corrected to FOLHA_DIRETA by Finance (Phase 8G.1). " +
        "No existing payrollRoleId in LEADERSHIP/BACKOFFICE/SPECIALISTS — requires a new role record " +
        "in the payroll adapter. HC=1 from 2028 is a source-contract assumption, not Finance-validated payroll schedule.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "maker_space_assistant",
      payrollRoleId: "maker_space_assistant",
      roleName: "Maker Space Assistant",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "Source-contract value, not Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['associate'] — grossMonthly=7763.46, " +
        "laborChargesMonthly=3765.28, benefitsMonthly=1128.10",
      allocationModelSource:
        "Finance-confirmed: FOPAG_DIRETO (Luciana, 2026-06-03).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Gross/labor/benefits confirmed from EDUCATOR_LEVELS associate archetype. " +
        "allocationModel confirmed as FOPAG_DIRETO by Finance (Phase 8G.1). " +
        "Requires new adapter record — no existing payrollRoleId to reuse.",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "language_acquisition_coach",
      payrollRoleId: "language_acquisition_coach",
      roleName: "Language Acquisition Coach",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "Source-contract value, not Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15247.55, " +
        "laborChargesMonthly=7395.06, benefitsMonthly=1159.83",
      allocationModelSource:
        "Finance-confirmed: FOLHA_DIRETA (Luciana, 2026-06-03).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Gross/labor/benefits confirmed from EDUCATOR_LEVELS master archetype. " +
        "allocationModel confirmed as FOLHA_DIRETA by Finance (Phase 8G.1). " +
        "Requires new adapter record — no existing payrollRoleId to reuse.",
    },
    {
      orgDesignOptionScope: "balanced_and_premium",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "personalized_learning_associate_educator",
      payrollRoleId: "personalized_learning_associate_educator",
      roleName: "Personalized Learning Associate Educator",
      activeIn: BALANCED_PREMIUM,
      roleInclusionStatus: "active_balanced_and_premium",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "Source-contract value, not Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['associate'] — grossMonthly=7763.46, " +
        "laborChargesMonthly=3765.28, benefitsMonthly=1128.10",
      allocationModelSource:
        "Finance-confirmed: FOPAG_DIRETO (Luciana, 2026-06-03).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Not active in Minimum Experience. " +
        "Gross/labor/benefits confirmed from EDUCATOR_LEVELS associate archetype. " +
        "allocationModel confirmed as FOPAG_DIRETO by Finance (Phase 8G.1). " +
        "Requires new adapter record — no existing payrollRoleId to reuse.",
    },
    {
      orgDesignOptionScope: "balanced_and_premium",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "security_coordinator",
      payrollRoleId: "security_coordinator",
      roleName: "Security Coordinator",
      activeIn: BALANCED_PREMIUM,
      roleInclusionStatus: "active_balanced_and_premium",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "Source-contract value, not Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15247.55, " +
        "laborChargesMonthly=7395.06, benefitsMonthly=1159.83",
      allocationModelSource:
        "Finance-confirmed: FOLHA_DIRETA (Luciana, 2026-06-03).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Not active in Minimum Experience. Governance supervisory role over security/clerks (no extra clerk HC). " +
        "Master Educator compensation archetype confirmed. " +
        "allocationModel confirmed as FOLHA_DIRETA by Finance (Phase 8G.1). " +
        "Requires new adapter record — no existing payrollRoleId to reuse.",
    },
    {
      orgDesignOptionScope: "premium_only",
      roleSourceType: "extension_uses_educator_archetype",
      sourceRoleId: "curriculum_and_assessment_designer",
      payrollRoleId: "curriculum_and_assessment_designer",
      roleName: "Curriculum and Assessment Designer",
      activeIn: PREMIUM_ONLY,
      roleInclusionStatus: "active_premium_only",
      headcountSource:
        "orgDesignScenarioExtensions.ts headcount=1, activationYear=2028, headcountSource='fixed'. " +
        "Source-contract value, not Finance-validated payroll schedule.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15247.55, " +
        "laborChargesMonthly=7395.06, benefitsMonthly=1159.83",
      allocationModelSource:
        "Finance-confirmed: FOLHA_DIRETA (Luciana, 2026-06-03).",
      activationYearSource: "orgDesignScenarioExtensions.ts activationYear = 2028",
      mappingStatus: "source_resolved_needs_new_record",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Active in Premium only. Reports to Head of School. Leadership classification (Finance-confirmed, Phase 8G.1). " +
        "Master Educator compensation archetype confirmed. " +
        "allocationModel confirmed as FOLHA_DIRETA by Finance (Phase 8G.1). " +
        "Requires new adapter record — no existing payrollRoleId to reuse.",
    },
    // ── EXTENSION ROLES: uses_existing_tab_logic ─────────────────────────────
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_tab_logic",
      sourceRoleId: "middle_school_educators",
      payrollRoleId: null,
      roleName: "Middle School Educators",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource:
        "PAYROLL_STAFFING_RULE_SOURCE_V1 per-grade FTE counts: g6=3, g7=4, g8=2 " +
        "(approved_v1_assumption + inferred_from_existing_payroll_code, Phase 8C; g8 corrected " +
        "from 3 by Luciana 2026-07-30, V10-RC2.4 Gate 6). " +
        "MiddleSchoolTab provides instructional rationale only — not FTE authorization.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15247.55, " +
        "laborChargesMonthly=7395.06, benefitsMonthly=1159.83 (Master Educator, approved v1 Phase 8C)",
      allocationModelSource:
        "payrollFopagMappingDesign.ts FOPAG_DIRETO outputTerm: " +
        "'teaching leads (MS g6/g7/g8, HS g9/g11/g12)' — FOPAG_DIRETO confirmed",
      activationYearSource:
        "OPENING_PACKAGE_MIDDLE_SCHOOL_ACTIVATION_RECORDS: t1_g6=2028, t1_g5=2029, t1_g4=2030, t1_g3=2031 " +
        "(package-specific, Finance-validated)",
      mappingStatus: "tab_logic_v1_ftes_resolved",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "FTE counts, compensation tier (Master Educator), and allocationModel (FOPAG_DIRETO) are all resolved " +
        "at design level. Phase 13H: payroll adapter wiring IS implemented — see payrollAdapter.ts " +
        "section 4 (MS/HS educators — fixed FTE per grade), which uses MS_FTE_BY_GRADE and " +
        "MASTER_EDUCATOR cost. " +
        "Do not use TURMAS_SCHEDULE from domain.ts (legacy_preview_only).",
    },
    {
      orgDesignOptionScope: "all_options",
      roleSourceType: "extension_uses_tab_logic",
      sourceRoleId: "high_school_educators",
      payrollRoleId: null,
      roleName: "High School Educators",
      activeIn: ALL,
      roleInclusionStatus: "active_all_options",
      headcountSource:
        "PAYROLL_STAFFING_RULE_SOURCE_V1 per-grade FTE ramp: g9=4, g10=3, g11=2, g12=2, sum=11 " +
        "(cumulative 4→7→9→11 as g9/g10/g11/g12 open in sequence). " +
        "g9/g12 are unchanged throughout. g10 and g11 are a direct, live product-owner correction " +
        "supplied 2026-07-30, superseding the g10=2/g11=3 split from V10-RC2.4A (same day, " +
        "earlier in the session) — same total (11), only g10 and g11 swapped. Neither value is " +
        "HighSchoolTab-sourced: HighSchoolTab.tsx's canonical ramp has g10=0/g11=3/g12=3 " +
        "(comparison-only, not payroll-wired, intentionally left unchanged) — this is a resolved, " +
        "direct product-owner reallocation, not a canonical-model derivation — see " +
        "docs/audits/rio-resilience/phase-v10-rc2-4a-hs-educator-allocation-reconciliation.md for " +
        "the V10-RC2.4A history this correction supersedes. " +
        "Sum=11 matches the validated 10 core + 1 flexible = 11 HS envelope. " +
        "hs_pool no longer exists (deleted from SPECIALISTS_CONFIG, 2026-07-30, " +
        "not merely excluded) — do NOT double-count with this ramp.",
      costSource:
        "src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15247.55, " +
        "laborChargesMonthly=7395.06, benefitsMonthly=1159.83 (Master Educator, approved v1 Phase 8C)",
      allocationModelSource:
        "payrollFopagMappingDesign.ts FOPAG_DIRETO outputTerm: " +
        "'teaching leads (HS g9/g10/g11/g12)' — FOPAG_DIRETO confirmed. g10=3 FTE and g11=2 FTE " +
        "(swapped from g10=2/g11=3), direct product-owner correction, 2026-07-30 (see " +
        "headcountSource above).",
      activationYearSource:
        "Per-grade activation: g9=2034, g10=2035, g11=2036, g12=2037 (from GRADE_CONFIG openYear in " +
        "teaching.ts) — V10-RC2.4A note: GRADE_CONFIG is a single, package-agnostic reference table. " +
        "The active/inactive status payrollAdapter.ts actually applies per grade/year/package (via " +
        "COMBINED_ACTIVE_GRADE_RECORDS, Finance-validated) differs and is package-specific — e.g. for " +
        "t1_g6 g9-g12 activate one year apart starting 2031, not from GRADE_CONFIG's fixed 2034-2037. " +
        "This citation is accurate to GRADE_CONFIG but is not the schedule production payroll uses; " +
        "not corrected here (pre-existing, outside this phase's g8/g10/g11 scope).",
      mappingStatus: "tab_logic_v1_ftes_resolved",
      needsReview: false,
      calculationReady: false,
      sourceNotes:
        "Compensation tier (Master Educator), allocationModel (FOPAG_DIRETO), and FTE counts are " +
        "resolved. g10=3/g11=2 are a direct product-owner correction, 2026-07-30, superseding the " +
        "g10=2/g11=3 split from V10-RC2.4A earlier the same session — same total (11), only g10 " +
        "and g11 swapped. See docs/audits/rio-resilience/" +
        "phase-v10-rc2-4a-hs-educator-allocation-reconciliation.md for the superseded governance " +
        "record. " +
        "Phase 13H: payroll adapter wiring IS implemented — see payrollAdapter.ts " +
        "section 4 (MS/HS educators — fixed FTE per grade), which uses HS_FTE_BY_GRADE and " +
        "MASTER_EDUCATOR cost; its unreconciled_grade_envelope diagnostic is a dormant safety net " +
        "for this table's sum, not currently active. " +
        "hs_pool (formerly 4→8 HC from 2034) no longer exists — deleted from " +
        "SPECIALISTS_CONFIG, 2026-07-30, not merely excluded.",
    },
  ] as const,
  remainingBlockers: [
    "RESOLVED (Phase 8H/8H.1, 2026-06-03): payroll adapter records for the 6 new extension roles " +
      "(events_assistant, maker_space_assistant, language_acquisition_coach, " +
      "personalized_learning_associate_educator, security_coordinator, curriculum_and_assessment_designer) " +
      "are implemented in payrollAdapter.ts EXTENSION_ROLE_COST, with cost/allocationModel matching " +
      "the Phase 8G.1 values recorded above.",
    "RESOLVED (Phase 8H, 2026-06-03): the payroll adapter exists and consumes this mapping — " +
      "payrollAdapter.ts buildPayrollAdapterInput() filters these records by " +
      "activeIn.includes(orgDesignOptionId) and assembles per-role/per-year payroll input records. " +
      "EMPTY_PAYROLL_ADAPTER_INPUT (payrollAdapterContract.ts) is an unused placeholder constant from an " +
      "earlier (pre-Phase 8H) contract shape and does not reflect the current adapter.",
    "RESOLVED (Phase 8I/11B, 2026-06-03/2026-06-07): FOPAG calculation is implemented — " +
      "fopagEngine.ts calculateFopag() consumes buildPayrollAdapterInput() output and computes " +
      "FOPAG_DIRETO/FOLHA_DIRETA/BENEFITS/TOTAL_PAYROLL for 2028-2047 across all 3 org-design options " +
      "(FOPAG_ENGINE_VALIDATION_REPORT, fopagEngineValidation.ts). " +
      "No remaining blockers specific to org-design payroll activation. " +
      "CALCULATION_CAN_BEGIN remains false for unrelated reasons (full board model — Receita, OPEX/CAPEX, " +
      "EBITDA, governance layers — not yet complete; see inputReadinessRegistry.ts).",
  ],
  sourceNotes:
    "Phase 8G Org Design → Payroll Activation Mapping (2026-06-03). " +
    "Phase 8G.1 allocationModel + payrollRoleId patch (2026-06-03): " +
    "6 extension roles confirmed — events_assistant (FOLHA_DIRETA), maker_space_assistant (FOPAG_DIRETO), " +
    "language_acquisition_coach (FOLHA_DIRETA), personalized_learning_associate_educator (FOPAG_DIRETO), " +
    "security_coordinator (FOLHA_DIRETA), curriculum_and_assessment_designer (FOLHA_DIRETA, leadership). " +
    "payrollRoleId assigned using extension role id for all 6 new roles. " +
    "25 baseline non-teaching roles + 13 extension roles = 38 total records " +
    "(corrected 2026-07-30: was 26+13=39 before hs_pool was deleted as dead " +
    "config — see baselineRoleCount above for the same correction). " +
    "Phase 13H (2026-06-09): the per-record calculationReady=false and top-level " +
    "activationStatus=designed_not_implemented/fopagCalculationReady=false fields above are retained " +
    "as the Phase 8G design-snapshot values (pinned by the contract's literal types) and are SUPERSEDED " +
    "by the Phase 8H/8I/11B implementation — payrollAdapter.ts and fopagEngine.ts are implemented and " +
    "consume these records; FOPAG calculation IS implemented (see remainingBlockers above). " +
    "CALCULATION_CAN_BEGIN remains false for unrelated full-board-model reasons (inputReadinessRegistry.ts). " +
    "Org Design options: minimum_experience, balanced_experience, premium_experience. " +
    "Baseline activation rule: all 25 non-excluded roles active in all 3 options " +
    "(source: orgDesignStructure.ts baselineRoleSet + orgDesignLogic.md activation table). " +
    "hs_pool: excluded_from_v1 — HS covered by per-grade FTE ramp (no double-count). " +
    "Receita engine: unchanged. Section-count engine: unchanged.",
} satisfies OrgDesignPayrollActivationDesign;
