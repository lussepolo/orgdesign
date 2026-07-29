import type { TranslationKey } from "../i18n/localeContract";
import type { TabId } from "../App";

// V10-X2T: single source of truth for workspace identity, navigation,
// headings, context banners, previous/next order, grouping, and
// model-authority status. Do not hardcode a second copy of this
// information anywhere else — every consumer (nav, headings, banners,
// AboutModal, prev/next, the validator) reads this registry.

export type WorkspaceStatus =
  | "canonical"
  | "simulation"
  | "reference"
  | "diagnostic"
  | "directional"
  | "illustrative"
  | "pending_integration"
  // V10-X2T completion gate: two additional evidence-status families used at
  // section level (see WorkspaceEvidenceSection) — governed_data reads with
  // the same confident treatment as canonical but is worded distinctly
  // ("governed data" vs "canonical model") because it marks a data record
  // sourced directly from a runtime contract, not a whole computed model.
  | "governed_data"
  | "pending_validation";

// V10-X2T completion gate: fine-grained, section-level evidence status. A
// workspace may contain several kinds of evidence at once (e.g. Oferta e
// Ocupação mixes governed enrollment records with narrative architecture
// text) — this lets each section carry its own status and label without
// forcing one badge to describe the whole workspace, while the workspace's
// top-level `status` (if set) still governs the primary banner treatment.
export interface WorkspaceEvidenceSection {
  id: string;
  status: WorkspaceStatus;
  labelKey: TranslationKey;
  descriptionKey?: TranslationKey;
}

export type WorkspaceGroup = "home" | "primary" | "academic" | "people" | "analysis";

export interface WorkspaceSubviewDefinition {
  id: string;
  labelKey: TranslationKey;
  titleKey: TranslationKey;
  purposeKey: TranslationKey;
  decisionKey: TranslationKey;
  inputsKey: TranslationKey;
  impactKey: TranslationKey;
  resultKey: TranslationKey;
  status: WorkspaceStatus;
  noticeKey?: TranslationKey;
}

export interface WorkspaceDefinition {
  id: TabId;
  group: WorkspaceGroup;
  order: number;
  shortLabelKey: TranslationKey;
  titleKey: TranslationKey;
  purposeKey?: TranslationKey;
  decisionKey?: TranslationKey;
  inputsKey?: TranslationKey;
  impactKey?: TranslationKey;
  resultKey?: TranslationKey;
  /** Set when the workspace's model-authority status is uniform across it. Omit when subviews carry distinct statuses. */
  status?: WorkspaceStatus;
  /** Additional required visible notice beyond the status banner (e.g. simulation/canonical boundary, illustrative-data disclosure). Rendered with caution styling. */
  noticeKey?: TranslationKey;
  /** Neutral informational note (e.g. DRE executive reading order) — framing guidance, not a caution. Rendered without warning styling. */
  infoNoteKey?: TranslationKey;
  /** Fine-grained, section-level evidence statuses shown alongside the primary status badge. */
  evidenceSections?: WorkspaceEvidenceSection[];
  /** Where governed conclusions ultimately live, per spec's "Canonical destination" field. */
  canonicalDestination?: TabId;
  /** Supporting-workspace "return to" quick link, per spec section 10. */
  returnPathTo?: TabId;
  subviews?: WorkspaceSubviewDefinition[];
  visibleInPrimaryNavigation: boolean;
  visibleInSupportingNavigation: boolean;
}

export const WORKSPACE_REGISTRY: WorkspaceDefinition[] = [
  {
    id: "cover",
    group: "home",
    order: 0,
    shortLabelKey: "wsCoverShortLabel",
    titleKey: "wsCoverTitle",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "offer-scenarios",
    group: "primary",
    order: 1,
    shortLabelKey: "wsOfferShortLabel",
    titleKey: "wsOfferTitle",
    purposeKey: "wsOfferPurpose",
    decisionKey: "wsOfferDecision",
    inputsKey: "wsOfferInputs",
    impactKey: "wsOfferImpact",
    resultKey: "wsOfferResult",
    status: "reference",
    canonicalDestination: "dre-scenario-simulator",
    evidenceSections: [
      {
        id: "enrollment-capacity-records",
        status: "governed_data",
        labelKey: "evidenceGovernedDataLabel",
      },
      {
        id: "narrative-academic-architecture",
        status: "reference",
        labelKey: "evidenceArchitectureReferenceLabel",
      },
      {
        id: "non-runtime-sourced-values",
        status: "pending_integration",
        labelKey: "statusPendingIntegrationLabel",
      },
    ],
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "executive-org-design",
    group: "primary",
    order: 2,
    shortLabelKey: "wsOrgDesignShortLabel",
    titleKey: "wsOrgDesignTitle",
    purposeKey: "wsOrgDesignPurpose",
    decisionKey: "wsOrgDesignDecision",
    inputsKey: "wsOrgDesignInputs",
    impactKey: "wsOrgDesignImpact",
    resultKey: "wsOrgDesignResult",
    status: "canonical",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "payroll",
    group: "primary",
    order: 3,
    shortLabelKey: "wsPayrollShortLabel",
    titleKey: "wsPayrollTitle",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
    subviews: [
      {
        id: "sections-staffing-simulation",
        labelKey: "wsPayrollSubviewALabel",
        titleKey: "wsPayrollSubviewATitle",
        purposeKey: "wsPayrollSubviewAPurpose",
        decisionKey: "wsPayrollSubviewADecision",
        inputsKey: "wsPayrollSubviewAInputs",
        impactKey: "wsPayrollSubviewAImpact",
        resultKey: "wsPayrollSubviewAResult",
        status: "simulation",
        noticeKey: "wsPayrollSubviewANotice",
      },
      {
        id: "governed-payroll-exports",
        labelKey: "wsPayrollSubviewBLabel",
        titleKey: "wsPayrollSubviewBTitle",
        purposeKey: "wsPayrollSubviewBPurpose",
        decisionKey: "wsPayrollSubviewBDecision",
        inputsKey: "wsPayrollSubviewBInputs",
        impactKey: "wsPayrollSubviewBImpact",
        resultKey: "wsPayrollSubviewBResult",
        status: "canonical",
      },
    ],
  },
  {
    id: "dre-scenario-simulator",
    group: "primary",
    order: 4,
    shortLabelKey: "wsDreShortLabel",
    titleKey: "wsDreTitle",
    purposeKey: "wsDrePurpose",
    decisionKey: "wsDreDecision",
    inputsKey: "wsDreInputs",
    impactKey: "wsDreImpact",
    resultKey: "wsDreResult",
    status: "canonical",
    infoNoteKey: "wsDreReadingOrderNote",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "capital-decision",
    group: "primary",
    order: 5,
    shortLabelKey: "wsCapitalShortLabel",
    titleKey: "wsCapitalTitle",
    purposeKey: "wsCapitalPurpose",
    decisionKey: "wsCapitalDecision",
    inputsKey: "wsCapitalInputs",
    impactKey: "wsCapitalImpact",
    resultKey: "wsCapitalResult",
    status: "canonical",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },

  // ── Academic Architecture: four governed division pages ───────────────
  // V10-X2T.3A-R1: restored to primary navigation. Phase 15N's last
  // explicitly-approved navigation state (documented in IMPLEMENTATION.md,
  // 2026-06-18) listed these four as flat, top-level primary navigation
  // items. Candidate 4 (25f1976) moved them behind a collapsed-by-default
  // "More Sections" accordion with no cited approval for that demotion —
  // a reachability regression, not an authorized simplification. `load`
  // below is unaffected; it was never part of the four division pages and
  // is not implicated by this restoration.
  {
    id: "early-years",
    group: "academic",
    order: 6,
    shortLabelKey: "wsEarlyYearsShortLabel",
    titleKey: "wsEarlyYearsTitle",
    purposeKey: "wsEarlyYearsPurpose",
    decisionKey: "wsEarlyYearsDecision",
    inputsKey: "wsEarlyYearsInputs",
    impactKey: "wsEarlyYearsImpact",
    resultKey: "wsEarlyYearsResult",
    status: "reference",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "lower-school",
    group: "academic",
    order: 7,
    shortLabelKey: "wsLowerSchoolShortLabel",
    titleKey: "wsLowerSchoolTitle",
    purposeKey: "wsLowerSchoolPurpose",
    decisionKey: "wsLowerSchoolDecision",
    inputsKey: "wsLowerSchoolInputs",
    impactKey: "wsLowerSchoolImpact",
    resultKey: "wsLowerSchoolResult",
    status: "reference",
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "ms",
    group: "academic",
    order: 8,
    shortLabelKey: "wsMiddleSchoolShortLabel",
    titleKey: "wsMiddleSchoolTitle",
    purposeKey: "wsMiddleSchoolPurpose",
    decisionKey: "wsMiddleSchoolDecision",
    inputsKey: "wsMiddleSchoolInputs",
    impactKey: "wsMiddleSchoolImpact",
    resultKey: "wsMiddleSchoolResult",
    status: "reference",
    evidenceSections: [
      {
        id: "workspace-purpose",
        status: "reference",
        labelKey: "evidenceAcademicReferenceLabel",
      },
      {
        id: "block-load-calculations",
        status: "diagnostic",
        labelKey: "evidenceCapacityDiagnosticLabel",
      },
      {
        id: "nine-educator-governed-results",
        status: "governed_data",
        labelKey: "evidenceGovernedDataLabel",
      },
    ],
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "hs",
    group: "academic",
    order: 9,
    shortLabelKey: "wsHighSchoolShortLabel",
    titleKey: "wsHighSchoolTitle",
    purposeKey: "wsHighSchoolPurpose",
    decisionKey: "wsHighSchoolDecision",
    inputsKey: "wsHighSchoolInputs",
    impactKey: "wsHighSchoolImpact",
    resultKey: "wsHighSchoolResult",
    status: "reference",
    noticeKey: "wsHighSchoolIllustrativeNotice",
    evidenceSections: [
      {
        id: "workspace-purpose",
        status: "reference",
        labelKey: "evidenceAcademicReferenceLabel",
      },
      {
        id: "block-load-calculations",
        status: "diagnostic",
        labelKey: "evidenceCapacityDiagnosticLabel",
      },
      {
        id: "mock-illustrative-schedules",
        status: "illustrative",
        labelKey: "statusIllustrativeLabel",
      },
      {
        id: "unvalidated-timetable-assumptions",
        status: "pending_validation",
        labelKey: "evidencePendingValidationLabel",
      },
    ],
    visibleInPrimaryNavigation: true,
    visibleInSupportingNavigation: false,
  },
  {
    id: "load",
    group: "academic",
    order: 10,
    shortLabelKey: "wsLoadShortLabel",
    titleKey: "wsLoadTitle",
    purposeKey: "wsLoadPurpose",
    decisionKey: "wsLoadDecision",
    inputsKey: "wsLoadInputs",
    impactKey: "wsLoadImpact",
    resultKey: "wsLoadResult",
    status: "diagnostic",
    returnPathTo: "payroll",
    visibleInPrimaryNavigation: false,
    visibleInSupportingNavigation: true,
  },

  // ── Supporting: People ───────────────────────────────────────────────
  {
    id: "hr",
    group: "people",
    order: 11,
    shortLabelKey: "wsHiringShortLabel",
    titleKey: "wsHiringTitle",
    purposeKey: "wsHiringPurpose",
    decisionKey: "wsHiringDecision",
    inputsKey: "wsHiringInputs",
    impactKey: "wsHiringImpact",
    resultKey: "wsHiringResult",
    status: "reference",
    returnPathTo: "executive-org-design",
    visibleInPrimaryNavigation: false,
    visibleInSupportingNavigation: true,
  },

  // ── Supporting: Analysis ─────────────────────────────────────────────
  {
    id: "viability",
    group: "analysis",
    order: 12,
    shortLabelKey: "wsViabilityShortLabel",
    titleKey: "wsViabilityTitle",
    purposeKey: "wsViabilityPurpose",
    decisionKey: "wsViabilityDecision",
    inputsKey: "wsViabilityInputs",
    impactKey: "wsViabilityImpact",
    resultKey: "wsViabilityResult",
    status: "directional",
    noticeKey: "wsViabilityNotice",
    canonicalDestination: "dre-scenario-simulator",
    returnPathTo: "dre-scenario-simulator",
    visibleInPrimaryNavigation: false,
    visibleInSupportingNavigation: true,
  },
];

export const PRIMARY_WORKSPACE_ORDER: TabId[] = WORKSPACE_REGISTRY.filter(
  (w) => w.visibleInPrimaryNavigation,
)
  .sort((a, b) => a.order - b.order)
  .map((w) => w.id);

export const SUPPORTING_GROUPS: WorkspaceGroup[] = ["academic", "people", "analysis"];

export function getWorkspace(id: TabId): WorkspaceDefinition {
  const workspace = WORKSPACE_REGISTRY.find((w) => w.id === id);
  if (!workspace) {
    throw new Error(`V10-X2T: no workspace registered for TabId "${id}"`);
  }
  return workspace;
}

export function getSupportingWorkspacesByGroup(group: WorkspaceGroup): WorkspaceDefinition[] {
  return WORKSPACE_REGISTRY.filter((w) => w.group === group && w.visibleInSupportingNavigation).sort(
    (a, b) => a.order - b.order,
  );
}

// Legacy, unmounted since V10-X2T: StaffingTab.tsx is retained on disk for
// later technical-debt disposition but has no live route, no nav entry, and
// is not a member of this registry. Do not re-add "staffing" here without a
// separate phase explicitly re-approving it.
