// Phase V10-X2T — Workspace architecture, purpose governance, and bilingual
// localization validator.
//
// Verifies: exact primary/supporting workspace set and order; the workspace
// registry is the single source for navigation/heading/banner metadata;
// pt-BR default with en-US preserved; visible language selector and
// persistence; exact translation-key parity (also enforced at compile time
// by en-US.ts's Record<TranslationKey,string> annotation); no accidental
// mixed-language primary labels; Cover routes to Oferta e Ocupação; Export
// Matrix is no longer an independent primary workspace and its component is
// reused, not duplicated; the Payroll revenue-uncertified/MS-HS-unreconciled
// notice (V10-RC2.2 — retired the prior simulation/canonical boundary notice
// once Payroll was refactored onto the shared governed engines);
// model-authority classification for every workspace; legacy StaffingTab is
// unmounted; HS illustrative-data disclosure; version-label coherence; and —
// via git blob-hash comparison against the V10-X2T entry-state snapshot —
// that no financial/staffing/enrollment formula file or governed export
// filename/sheet-name file was modified by this phase.

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

import { PT_BR } from "../src/i18n/pt-BR";
import { EN_US } from "../src/i18n/en-US";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_STORAGE_KEY } from "../src/i18n/localeContract";
import {
  WORKSPACE_REGISTRY,
  PRIMARY_WORKSPACE_ORDER,
  SUPPORTING_GROUPS,
  getWorkspace,
  getSupportingWorkspacesByGroup,
} from "../src/config/workspaceRegistry";
import { APP_VERSION_LABEL } from "../src/config/appMetadata";
import type { TabId } from "../src/App";
import { OCCUPANCY_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import {
  buildRoleYearDetails,
  buildPayrollExportDetailedWorkbook,
} from "../src/features/rio-scenario-resilience/model/payrollExportWorkbookBuilder";
import { buildPayrollExportScenarioResult } from "../src/features/rio-scenario-resilience/model/payrollExportScenarioAdapter";
import { PAYROLL_EXPORT_MATRIX } from "../src/features/rio-scenario-resilience/model/payrollExportMatrixContract";
import { buildOrgDesignExportWorkbook } from "../src/features/rio-scenario-resilience/model/orgDesignExportWorkbookBuilder";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import * as XLSX from "xlsx";

type Check = { id: string; pass: boolean; detail: string };
const checks: Check[] = [];
function check(id: string, pass: boolean, detail: string): void {
  checks.push({ id, pass, detail });
}

const ROOT = process.cwd();
const src = (path: string) => readFileSync(join(ROOT, path), "utf8");

// ── Section A: primary/supporting workspace set and order ──────────────────

// V10-X2T.3A-R1: this list previously ended at "capital-decision" and put
// early-years/lower-school/ms/hs in EXPECTED_SUPPORTING_BY_GROUP.academic
// below — i.e. it asserted the reachability regression (four division
// pages demoted from primary to a collapsed secondary nav by Candidate 4,
// 25f1976, with no cited governance approval for that demotion) as the
// correct, passing state. IMPLEMENTATION.md's last explicitly-approved
// navigation state (Phase 15N, 2026-06-18) lists these four as flat
// top-level primary items; R1 restores that and updates this oracle to
// match the corrected architecture, not the regressed one.
const EXPECTED_PRIMARY_ORDER = [
  "cover",
  "offer-scenarios",
  "executive-org-design",
  "payroll",
  "dre-scenario-simulator",
  "capital-decision",
  "early-years",
  "lower-school",
  "ms",
  "hs",
];
check(
  "primary_workspace_order_exact",
  JSON.stringify(PRIMARY_WORKSPACE_ORDER) === JSON.stringify(EXPECTED_PRIMARY_ORDER),
  `actual=${JSON.stringify(PRIMARY_WORKSPACE_ORDER)}`,
);

const EXPECTED_SUPPORTING_GROUPS = ["academic", "people", "analysis"];
check(
  "supporting_groups_exact",
  JSON.stringify(SUPPORTING_GROUPS) === JSON.stringify(EXPECTED_SUPPORTING_GROUPS),
  `actual=${JSON.stringify(SUPPORTING_GROUPS)}`,
);

// V10-X2T.3A-R1: the four division pages moved to EXPECTED_PRIMARY_ORDER
// above; only "load" remains a supporting-only academic-group destination.
const EXPECTED_SUPPORTING_BY_GROUP: Record<string, string[]> = {
  academic: ["load"],
  people: ["hr"],
  analysis: ["viability"],
};
for (const group of EXPECTED_SUPPORTING_GROUPS) {
  const actual = getSupportingWorkspacesByGroup(group as "academic" | "people" | "analysis").map((w) => w.id);
  check(
    `supporting_workspace_set_${group}`,
    JSON.stringify(actual) === JSON.stringify(EXPECTED_SUPPORTING_BY_GROUP[group]),
    `actual=${JSON.stringify(actual)}`,
  );
}

const allRegisteredIds: string[] = WORKSPACE_REGISTRY.map((w) => w.id);
check(
  "registry_has_no_staffing_entry",
  !allRegisteredIds.includes("staffing"),
  `ids=${JSON.stringify(allRegisteredIds)}`,
);
check(
  "registry_has_no_payroll_export_matrix_entry",
  !allRegisteredIds.includes("payroll-export-matrix"),
  "payroll-export-matrix folded into payroll subview B",
);

// ── Section B: registry as single source of truth ──────────────────────────

const appSrc = src("src/App.tsx");
check(
  "app_has_no_second_hardcoded_tab_order_array",
  !/APP_TAB_ORDER/.test(appSrc),
  "APP_TAB_ORDER (pre-X2T hardcoded array) must not reappear",
);
check(
  "app_nav_reads_from_registry",
  /PRIMARY_WORKSPACE_ORDER\.map/.test(appSrc) && /getSupportingWorkspacesByGroup/.test(appSrc),
  "primary and supporting nav must be generated from the registry",
);
check(
  "app_headings_read_from_registry",
  /t\(activeWorkspace\.titleKey\)/.test(appSrc),
  "page heading must render workspace.titleKey via t()",
);

const aboutModalSrc = src("src/components/sections/AboutModal.tsx");
check(
  "about_modal_reads_from_registry",
  /WORKSPACE_REGISTRY/.test(aboutModalSrc) && !/const tabs = \[/.test(aboutModalSrc),
  "AboutModal must reuse WORKSPACE_REGISTRY purpose text, not a second hardcoded tabs[] array",
);

// ── Section C: locale defaults, availability, selector, persistence ────────

check("default_locale_is_pt_br", DEFAULT_LOCALE === "pt-BR", `actual=${DEFAULT_LOCALE}`);
check("en_us_supported", SUPPORTED_LOCALES.includes("en-US"), `supported=${JSON.stringify(SUPPORTED_LOCALES)}`);

const appHasLanguageSelector = /LanguageSelector/.test(appSrc) && /languageOptionPt/.test(appSrc) && /languageOptionEn/.test(appSrc);
check("visible_language_selector_exists", appHasLanguageSelector, "PT | EN selector must be rendered in the header");

const localeProviderSrc = src("src/i18n/LocaleProvider.tsx");
check(
  "locale_preference_persists_to_localstorage",
  localeProviderSrc.includes("localStorage.setItem") && localeProviderSrc.includes("LOCALE_STORAGE_KEY"),
  "setLocale must persist to the documented localStorage key",
);
check(
  "locale_storage_key_is_documented_and_distinct",
  LOCALE_STORAGE_KEY === "rio-org-design.locale.v1",
  `key=${LOCALE_STORAGE_KEY}`,
);
check(
  "document_lang_is_synced",
  localeProviderSrc.includes("document.documentElement.lang"),
  "LocaleProvider must set document.documentElement.lang on locale change",
);

// ── Section D: translation-key parity (fails closed) ────────────────────────

const ptKeys = Object.keys(PT_BR).sort();
const enKeys = Object.keys(EN_US).sort();
check(
  "catalog_key_parity_exact",
  JSON.stringify(ptKeys) === JSON.stringify(enKeys),
  `pt_only=${JSON.stringify(ptKeys.filter((k) => !enKeys.includes(k)))} en_only=${JSON.stringify(enKeys.filter((k) => !ptKeys.includes(k)))}`,
);
check(
  "no_empty_translation_values",
  Object.values(PT_BR).every((v) => v.trim().length > 0) && Object.values(EN_US).every((v) => v.trim().length > 0),
  "no catalog value may be an empty string",
);
check(
  "missing_key_fails_closed",
  localeProviderSrc.includes("throw new Error") && localeProviderSrc.includes("missing translation key"),
  "t() must throw, not silently fall back, on a missing key",
);

// ── Section E: no accidental mixed-language primary labels ─────────────────

const LEGACY_ENGLISH_PRIMARY_LABELS = [
  "Payroll Projection",
  "Viability Simulator",
  "DRE Scenario Simulator",
  "Executive Org Design",
];
const ptPrimaryLabelValues = EXPECTED_PRIMARY_ORDER.flatMap((id) => {
  const w = getWorkspace(id as TabId);
  return [PT_BR[w.shortLabelKey], PT_BR[w.titleKey]];
});
check(
  "pt_primary_labels_free_of_legacy_english",
  !ptPrimaryLabelValues.some((v) => LEGACY_ENGLISH_PRIMARY_LABELS.some((legacy) => v.includes(legacy))),
  `values=${JSON.stringify(ptPrimaryLabelValues)}`,
);

const PORTUGUESE_ONLY_MARKERS = ["Oferta", "Ocupação", "Desenho Organizacional", "Decisão de Capital", "Folha de Pagamento"];
const enPrimaryLabelValues = EXPECTED_PRIMARY_ORDER.flatMap((id) => {
  const w = getWorkspace(id as TabId);
  return [EN_US[w.shortLabelKey], EN_US[w.titleKey]];
});
check(
  "en_primary_labels_free_of_portuguese",
  !enPrimaryLabelValues.some((v) => PORTUGUESE_ONLY_MARKERS.some((marker) => v.includes(marker))),
  `values=${JSON.stringify(enPrimaryLabelValues)}`,
);

// ── Section F: Cover routing ─────────────────────────────────────────────

check(
  "cover_routes_to_offer_occupancy",
  /onStart=\{\(\) => setActiveTab\("offer-scenarios"\)\}/.test(appSrc),
  "Cover primary action must call setActiveTab(\"offer-scenarios\")",
);
check(
  "cover_does_not_route_to_payroll",
  !/onStart=\{\(\) => setActiveTab\("payroll"\)\}/.test(appSrc),
  "Cover must not route directly to Payroll",
);

// ── Section G: Export Matrix relocation and component reuse ────────────────

const typeTabIdLine = appSrc.split("\n").find((l) => l.includes("export type TabId")) ?? "";
check(
  "export_matrix_not_independent_primary_workspace",
  !typeTabIdLine.includes("payroll-export-matrix") && !EXPECTED_PRIMARY_ORDER.includes("payroll-export-matrix"),
  "TabId union and primary order must not contain payroll-export-matrix",
);

const sectionsPayrollSrc = src("src/components/sections/SectionsAndPayrollWorkspace.tsx");
check(
  "payroll_projection_tab_reused_not_duplicated",
  /import PayrollProjectionTab from "\.\/PayrollProjectionTab"/.test(sectionsPayrollSrc),
  "SectionsAndPayrollWorkspace must import, not duplicate, PayrollProjectionTab",
);
check(
  "payroll_export_matrix_tab_reused_not_duplicated",
  /import PayrollExportMatrixTab from "\.\/PayrollExportMatrixTab"/.test(sectionsPayrollSrc),
  "SectionsAndPayrollWorkspace must import, not duplicate, PayrollExportMatrixTab",
);
check(
  "app_does_not_import_payroll_tabs_directly",
  !appSrc.includes('from "./components/sections/PayrollProjectionTab"') &&
    !appSrc.includes('from "./components/sections/PayrollExportMatrixTab"'),
  "App.tsx must route through SectionsAndPayrollWorkspace, not import the leaf tabs directly",
);

// ── Section H: Payroll revenue-uncertified / MS-HS-unreconciled notice ──────

// V10-RC2.2: PayrollProjectionTab was refactored to consume calculateFopag()/
// calculateDre()/buildOrgDesignHcTable() directly (the same engines Org
// Design/DRE already treat as governed) — the prior "simulation, does not
// modify canonical FOPAG/DRE" boundary no longer describes reality and was
// retired by explicit phase authorization. The notice now pins the two
// limitations that ARE still genuinely true: revenue is computed but not
// Finance-certified (D-R6/F03), and MS/HS headcount is an unreconciled
// engine aggregate, not a governed grade-level breakdown (F06).
const REQUIRED_PT_NOTICE =
  "Receita e cobertura são computadas, não certificadas pelo Financeiro (D-R6/F03). Efetivo docente EY/LS é governado; o efetivo do Fundamental II/Médio é uma estimativa agregada do motor, não um detalhamento por série reconciliado.";
const REQUIRED_EN_NOTICE =
  "Revenue and coverage are computed, not Finance-certified (D-R6/F03). EY/LS instructional headcount is governed; Middle/High School headcount is an engine aggregate estimate, not a reconciled grade-level breakdown.";
check(
  "payroll_subview_a_notice_pt_matches_spec",
  PT_BR.wsPayrollSubviewANotice === REQUIRED_PT_NOTICE,
  PT_BR.wsPayrollSubviewANotice,
);
check(
  "payroll_subview_a_notice_en_matches_spec",
  EN_US.wsPayrollSubviewANotice === REQUIRED_EN_NOTICE,
  EN_US.wsPayrollSubviewANotice,
);

// ── Section I: model-authority classification ───────────────────────────────

check("dre_classified_canonical", getWorkspace("dre-scenario-simulator" as TabId).status === "canonical", "");
check("capital_decision_classified_canonical", getWorkspace("capital-decision" as TabId).status === "canonical", "");
check("org_design_classified_canonical", getWorkspace("executive-org-design" as TabId).status === "canonical", "");
check("viability_classified_directional", getWorkspace("viability" as TabId).status === "directional", "");
for (const id of ["early-years", "lower-school", "ms", "hs", "hr", "offer-scenarios"]) {
  check(`${id}_classified_reference`, getWorkspace(id as TabId).status === "reference", `status=${getWorkspace(id as TabId).status}`);
}
check("load_classified_diagnostic", getWorkspace("load" as TabId).status === "diagnostic", "");
// V10-RC2.2: subview A reclassified from "simulation" to "governed_data" —
// PayrollProjectionTab now reads calculateFopag()/calculateDre()/
// buildOrgDesignHcTable() directly at runtime rather than an independent
// local model, so "simulation, not yet canonical" no longer describes it.
check(
  "payroll_subviews_classified_governed_data_and_canonical",
  getWorkspace("payroll" as TabId).subviews?.[0]?.status === "governed_data" &&
    getWorkspace("payroll" as TabId).subviews?.[1]?.status === "canonical",
  JSON.stringify(getWorkspace("payroll" as TabId).subviews?.map((s) => s.status)),
);

// ── Section J: HS illustrative-data disclosure ──────────────────────────────

check(
  "hs_illustrative_notice_wired",
  getWorkspace("hs" as TabId).noticeKey === "wsHighSchoolIllustrativeNotice",
  `noticeKey=${getWorkspace("hs" as TabId).noticeKey}`,
);
check(
  "hs_illustrative_notice_non_empty_both_locales",
  PT_BR.wsHighSchoolIllustrativeNotice.length > 0 && EN_US.wsHighSchoolIllustrativeNotice.length > 0,
  "",
);

// ── Section K: legacy StaffingTab disposition ───────────────────────────────

check("app_does_not_import_staffing_tab", !appSrc.includes('from "./components/sections/StaffingTab"'), "");
check("app_has_no_staffing_render_branch", !/activeTab === "staffing"/.test(appSrc), "");
check(
  "staffing_tab_source_file_retained",
  existsSync(join(ROOT, "src/components/sections/StaffingTab.tsx")),
  "file must be retained on disk per section 12 (no deletion without a separate approving phase)",
);

// ── Section L: version-metadata coherence ───────────────────────────────────

check("app_version_label_defined_once", APP_VERSION_LABEL === "v3.0", `actual=${APP_VERSION_LABEL}`);
check(
  "no_stale_conflicting_version_string_in_app",
  !appSrc.includes("2.5 Stable Release"),
  "stale Cover version string must be removed",
);
const aboutSrcHasStaleVersion = aboutModalSrc.includes("2.5 Stable Release") || /v3\.0(?!["`])/.test(aboutModalSrc.replace(/APP_VERSION_LABEL/g, ""));
check("no_stale_conflicting_version_string_in_about_modal", !aboutSrcHasStaleVersion, "");

// ── Section M: future Dashboard documented, not implemented ─────────────────

check(
  "dashboard_not_falsely_implemented",
  !allRegisteredIds.some((id) => /dashboard|painel-executivo/i.test(String(id))),
  "no workspace registry entry may claim the future Executive Dashboard",
);
let implementationDocHasDashboardSection = false;
try {
  const implDoc = src("IMPLEMENTATION.md");
  implementationDocHasDashboardSection = /Painel Executivo|Executive Dashboard/.test(implDoc) && /V10-X2T/.test(implDoc);
} catch {
  implementationDocHasDashboardSection = false;
}
check(
  "future_dashboard_documented_in_implementation_md",
  implementationDocHasDashboardSection,
  "IMPLEMENTATION.md must document the future Dashboard placement under a V10-X2T section",
);

// ── Section N: git blob-hash proof of zero drift in formula/enrollment/export files ──
//
// V10-X2T.2B: ViabilitySimulatorTab.tsx and ViabilityInputsRail.tsx are
// intentionally removed from this frozen-blob list (their Candidate 3
// localization hunks necessarily change their blob hash; see
// docs/audits/rio-resilience/v10-x2t-2b-reconstruction-manifest.md for the
// hunk-level classification that separated their one-line Candidate 2
// terminology hunk from their Candidate 3 localization hunks).
//
// The files still on this list — domain.ts, the lib/viability/* files, and
// useViabilitySimulator.ts — carry the `intermediario`→`base` identifier
// rename as Candidate 2 content in THIS branch (the PayrollScenario /
// ViabilityEnrollmentScenario terminology migration), independently
// ratified. This is a distinct decision from, and does not follow from or
// derive from, the separate Enrollment/OccupancyScenarioId enum's unrelated
// `intermediario`-normalizes-to-`base` legacy-input handling at its own
// governed parser boundary (see Q12/Q13 below, which cover that enum
// separately). The two migrations happen to both land on the label "base";
// neither was inferred from the other, and this comment should not be read
// as implying that it was. The no-drift check below still passes for these
// files because it accepts either the pre-Candidate-2 dirty blob (primary-
// tree case) OR the Candidate-2-committed blob (this reconstruction
// branch's case) — either state proves no OTHER, uncommitted drift
// occurred beyond the ratified Candidate 2 rename.
const ENTRY_STATE_PROTECTED_FILES = [
  "scripts/validate-phase15t.ts",
  "scripts/validate-phase15t1.ts",
  "scripts/validate-phase15t2.ts",
  "src/components/dreSimulator/dreScenarioWorkbook.ts",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngineContract.ts",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadinessValidation.ts",
  "src/features/rio-scenario-resilience/model/dreWorkingScenarioContract.ts",
  "src/hooks/useViabilitySimulator.ts",
  "src/lib/payroll/domain.ts",
  "src/lib/viability/baseline.ts",
  "src/lib/viability/sensitivity.ts",
  "src/lib/viability/types.ts",
  "tests/phase15f/phase15f.run.ts",
];

// Baseline hashes captured at V10-X2T entry state, before any X2T edit.
const ENTRY_STATE_HASHES: Record<string, string> = {
  "scripts/validate-phase15t.ts": "1cdaba0b61679dd7665d549a82bdb86ce6a34357",
  "scripts/validate-phase15t1.ts": "d1f8e962b8a508798c353637aa64254b0c9cc0dd",
  "scripts/validate-phase15t2.ts": "4807ff39a19a927c68f1af7bfc9afa4262385168",
  "src/components/dreSimulator/dreScenarioWorkbook.ts": "fc8cdee05080eac1e2048100d4560786ac7c876c",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts": "78b6db0c4fdac78f1c4ee20f52c37c26d4743b02",
  "src/features/rio-scenario-resilience/model/capitalDecisionEngineContract.ts": "76f725f6016649eefa2a9dbb88f06f06d717acda",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts": "a80c65128e9a9288069a7d0e56ced690a9fdb64a",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadinessValidation.ts": "dcce4cae5380d8487f80ef605e148c388d52118c",
  "src/features/rio-scenario-resilience/model/dreWorkingScenarioContract.ts": "c77924826e810af9c5fe4b6b3a505f19de6c0029",
  "src/hooks/useViabilitySimulator.ts": "54999408ab381865a78b6e8f370c2a0be065ff5c",
  "src/lib/payroll/domain.ts": "53ca5cc6f22388fda0c9d3c7fd20338608a7ee61",
  "src/lib/viability/baseline.ts": "ac62dd604e4b19d3465fb20f010286f7ee801c7e",
  "src/lib/viability/sensitivity.ts": "9f5ff6e7f9b14cf65866b7d54383e6d36872c6a8",
  "src/lib/viability/types.ts": "147120e4959042349017d6cd4e89574c9451d45c",
  "tests/phase15f/phase15f.run.ts": "0e5cbcaf88f41c662f84fe01e5d3161e353779be",
};

function gitHashObject(path: string): string {
  return execSync(`git hash-object "${path}"`, { cwd: ROOT }).toString().trim();
}

// A file passes "no drift" if it matches the exact dirty blob captured at
// V10-X2T entry state (primary-tree case) OR the clean committed blob at
// HEAD (isolated-worktree case, where the primary tree's unrelated
// uncommitted work was never — and must never be — part of this patch).
// Either state proves X2T did not further modify the file.
for (const path of ENTRY_STATE_PROTECTED_FILES) {
  const expectedDirty = ENTRY_STATE_HASHES[path];
  const actual = gitHashObject(path);
  let expectedClean = "";
  try {
    expectedClean = execSync(`git rev-parse HEAD:${path}`, { cwd: ROOT }).toString().trim();
  } catch {
    expectedClean = "";
  }
  const pass = actual === expectedDirty || (expectedClean !== "" && actual === expectedClean);
  check(
    `no_drift__${path}`,
    pass,
    pass
      ? actual === expectedDirty
        ? "unchanged since V10-X2T entry state (dirty blob)"
        : "unchanged since V10-X2T entry state (matches clean HEAD blob — isolated worktree)"
      : `expected_dirty=${expectedDirty} expected_clean=${expectedClean} actual=${actual}`,
  );
}

// Governed V10-X1 export-package files must be byte-identical to the
// committed baseline (filenames and sheet names are frozen this phase).
//
// GOVERNANCE EXCEPTION (product-owner decision, 2026-07-30, V10-RC2.5 ONLY):
// this byte-identity freeze is retired for exactly these three files:
//   - payrollExportWorkbookBuilder.ts
//   - payrollExportSummaryWorkbookBuilder.ts
//   - payrollExportManifest.ts
// The sole authorized change is buildRoleYearDetails()'s parameter shape
// (from the fixed-matrix PayrollExportScenarioResult wrapper to
// `readonly FopagCalculatedRecord[]` directly) plus the mechanical one-line
// call-site updates in these three files that follow from it. No other
// modification to these files is authorized by this exception, and no
// broader export modification (any other governed export file, any other
// phase) is authorized by it either. Byte-identity is replaced, not merely
// removed, by the permanent semantic/runtime invariants in Section R below
// — per the product owner's explicit instruction not to weaken protection.
// The remaining three files below stay fully byte-frozen with no exception.
const V10_X1_COMMIT = "1cab3312b50e52005ab5d22c109646e94650da4e";
const GOVERNED_EXPORT_FILES = [
  "src/features/rio-scenario-resilience/model/payrollExportMatrixContract.ts",
  "src/features/rio-scenario-resilience/model/payrollExportZip.ts",
  "src/features/rio-scenario-resilience/model/payrollExportScenarioAdapter.ts",
];
// Retired from byte-identity by the V10-RC2.5 exception above — covered
// instead by Section R's permanent semantic invariants.
const RC2_5_EXCEPTION_FILES = [
  "src/features/rio-scenario-resilience/model/payrollExportWorkbookBuilder.ts",
  "src/features/rio-scenario-resilience/model/payrollExportSummaryWorkbookBuilder.ts",
  "src/features/rio-scenario-resilience/model/payrollExportManifest.ts",
];
for (const path of GOVERNED_EXPORT_FILES) {
  const committedHash = execSync(`git rev-parse ${V10_X1_COMMIT}:${path}`, { cwd: ROOT }).toString().trim();
  const workingHash = gitHashObject(path);
  check(
    `governed_export_file_unchanged__${path}`,
    committedHash === workingHash,
    workingHash === committedHash ? "matches V10-X1 committed blob" : `committed=${committedHash} working=${workingHash}`,
  );
}

// Enrollment/capacity source data must be untouched.
const enrollmentSourcePath = "src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract.ts";
if (existsSync(join(ROOT, enrollmentSourcePath))) {
  const committedHash = execSync(`git rev-parse HEAD:${enrollmentSourcePath}`, { cwd: ROOT }).toString().trim();
  const workingHash = gitHashObject(enrollmentSourcePath);
  check(
    "enrollment_capacity_source_unchanged",
    committedHash === workingHash,
    workingHash === committedHash ? "matches HEAD blob" : `HEAD=${committedHash} working=${workingHash}`,
  );
}

// ── Section P: PayrollProjectionTab.tsx shared-engine refactor (V10-RC2.2) ──
//
// V10-RC2.2 explicitly authorized refactoring PayrollProjectionTab.tsx's
// calculation core and export handler — the prior byte-identity checks
// against the V10-X2T entry-state blob are retired (they would trivially
// and permanently fail against an authorized rewrite, telling a reader
// nothing). Replaced with behavior/structural checks proving the refactor
// actually happened as directed: shared-scenario props received, the
// governed engines consumed, the retired disconnected local axis removed,
// and the governed export builder used instead of the standalone one.
const PAYROLL_TAB_PATH = "src/components/sections/PayrollProjectionTab.tsx";
const payrollTabSrc = src(PAYROLL_TAB_PATH);

check(
  "payroll_tab_receives_shared_scenario_props",
  /openingPackageId:\s*ActiveOpeningPackageId/.test(payrollTabSrc) &&
    /occupancyScenarioId:\s*OccupancyScenarioId/.test(payrollTabSrc) &&
    /tuitionScenarioId:\s*TuitionScenarioId/.test(payrollTabSrc),
  "PayrollProjectionTabProps must declare openingPackageId/occupancyScenarioId/tuitionScenarioId",
);
check(
  "payroll_tab_consumes_governed_engines",
  payrollTabSrc.includes('from "../../features/rio-scenario-resilience/model/fopagEngine"') &&
    payrollTabSrc.includes('from "../../features/rio-scenario-resilience/model/dreEngine"') &&
    payrollTabSrc.includes("buildOrgDesignHcTable"),
  "must import calculateFopag/calculateDre/buildOrgDesignHcTable — the same engines Org Design and DRE already use",
);
check(
  "payroll_tab_retired_disconnected_local_axis",
  // Checks actual import/declaration/call sites, not prose — the file's own
  // header comment documents what was retired and legitimately names these
  // identifiers in passing.
  !payrollTabSrc.includes('from "../../lib/payroll') &&
    !/useState<PayrollScenario>|useState<TuitionScenario>/.test(payrollTabSrc) &&
    !payrollTabSrc.includes("buildPayrollProjection(") &&
    !payrollTabSrc.includes("buildScenarioComparison(") &&
    !payrollTabSrc.includes("buildScenarioMatrix(") &&
    !payrollTabSrc.includes("getLeadFteForGrade("),
  "the retired local captação/tuition/turmas axis and hardcoded MS/HS FTE table must not be reintroduced or kept as a fallback (checked by import path and call sites, not prose)",
);
check(
  "payroll_tab_export_uses_governed_workbook",
  payrollTabSrc.includes("buildDreScenarioWorkbook") && !payrollTabSrc.includes("downloadTenYearProjectionXlsx"),
  "export must use the same buildDreScenarioWorkbook() DreExportButton/the Fagundes Export Index use, not the standalone lib/payroll/exportXlsx.ts pathway",
);
check(
  "payroll_tab_no_formatbrl_left_in_calc_scope",
  !payrollTabSrc.includes("formatBRL("),
  "formatBRL(...) must be fully replaced by formatCurrencyBRL(..., locale) — no mixed usage",
);

// Behavioral re-proof: the underlying lib/payroll functions PayrollProjectionTab
// calls must be byte-unchanged from V10-X2T entry state (independent of the
// component's own string-only edit). src/lib/payroll/domain.ts is already
// covered by Section N's dirty-blob no_drift check — checked here only for
// the two lib/payroll files not already in ENTRY_STATE_PROTECTED_FILES.
const PAYROLL_LIB_FILES = [
  "src/lib/payroll/core.ts",
  "src/lib/payroll/presenters.ts",
];
for (const path of PAYROLL_LIB_FILES) {
  if (!existsSync(join(ROOT, path))) continue;
  const committedHash = execSync(`git rev-parse HEAD:${path}`, { cwd: ROOT }).toString().trim();
  const workingHash = gitHashObject(path);
  check(
    `payroll_lib_unchanged__${path}`,
    committedHash === workingHash,
    workingHash === committedHash ? "matches HEAD blob" : `HEAD=${committedHash} working=${workingHash}`,
  );
}

// ── Section O: locale switch does not touch scenario/engine state (structural) ──

check(
  "locale_provider_structurally_independent_of_dre_capital_state",
  !localeProviderSrc.includes("useDreScenarioSimulator") &&
    !localeProviderSrc.includes("useCapitalDecisionWorkspace") &&
    !localeProviderSrc.includes("DreScenarioSimulatorSelections"),
  "LocaleProvider must not import or reference DRE/Capital Decision state",
);

// ── Section Q: V10-X2T Completion Gate — spec §12 assertions ───────────────
//
// These assertions are additive to (never a replacement for) Sections A–P.
// Per the completion-gate spec: "Do not weaken existing checks."

// Q1. Every reachable workspace (primary + supporting) is registered with a
// non-empty pt-BR AND en-US value for its shortLabelKey and titleKey.
const reachableWorkspaces = WORKSPACE_REGISTRY.filter(
  (w) => w.visibleInPrimaryNavigation || w.visibleInSupportingNavigation,
);
const workspacesMissingBilingualContent = reachableWorkspaces.filter(
  (w) =>
    !PT_BR[w.shortLabelKey]?.trim() ||
    !EN_US[w.shortLabelKey]?.trim() ||
    !PT_BR[w.titleKey]?.trim() ||
    !EN_US[w.titleKey]?.trim(),
);
check(
  "q1_all_reachable_workspaces_have_bilingual_content",
  workspacesMissingBilingualContent.length === 0,
  workspacesMissingBilingualContent.length === 0
    ? `${reachableWorkspaces.length} reachable workspaces all have non-empty pt-BR + en-US labels`
    : `missing: ${JSON.stringify(workspacesMissingBilingualContent.map((w) => w.id))}`,
);

// Q2. Translation-key parity (compile-time enforced by en-US.ts's
// Record<TranslationKey,string> annotation) — re-asserted at runtime.
check("q2_translation_key_parity_runtime", ptKeys.length === enKeys.length && ptKeys.every((k, i) => k === enKeys[i]), `pt=${ptKeys.length} en=${enKeys.length}`);

// Q3. Zero missing-key silent fallback (t() fails closed) — re-asserted.
check("q3_missing_key_fails_closed_runtime", localeProviderSrc.includes("throw new Error"), "t() must throw on unknown key");

// Q4. Zero legacy mixed-language primary nav — re-asserted against current registry.
check(
  "q4_zero_legacy_mixed_language_primary_nav",
  !ptPrimaryLabelValues.some((v) => LEGACY_ENGLISH_PRIMARY_LABELS.some((legacy) => v.includes(legacy))),
  "primary nav pt-BR labels free of legacy hardcoded English",
);

// Q5. Zero visible unresolved (F-category) strings across the REACHABLE
// application graph, via the mechanical TS-AST visible-string inventory
// used for this phase's content audit. V10-X2T.2: the inventory now
// separates reachable (live, imported from main.tsx) from unreachable
// (legacy/unmounted, e.g. StaffingTab.tsx) files — only the reachable count
// gates this check. This is intentionally strict: PASS requires 0
// remaining reachable candidate literals outside translated/i18n-flagged
// files.
let q5Detail = "inventory script unavailable";
let q5Pass = false;
let q5bDetail = "inventory script unavailable";
let q5bPass = false;
try {
  const inventoryScript = join(ROOT, "scripts", "validate-v10-x2t-visible-string-inventory.ts");
  if (existsSync(inventoryScript)) {
    const out = execSync(`npx tsx "${inventoryScript}"`, { cwd: ROOT }).toString();
    const reachableMatch = out.match(/REACHABLE candidate visible-string literals found: (\d+)/);
    const unreachableMatch = out.match(/UNREACHABLE \(legacy\/unmounted\) candidate visible-string literals found: (\d+)/);
    const reachableTotal = reachableMatch ? Number(reachableMatch[1]) : -1;
    const unreachableTotal = unreachableMatch ? Number(unreachableMatch[1]) : -1;
    q5Pass = reachableTotal === 0;
    q5Detail = `reachable_candidate_strings=${reachableTotal}`;
    q5bPass = unreachableTotal >= 0;
    q5bDetail = `unreachable_legacy_candidate_strings=${unreachableTotal} (reported only, does not gate PASS)`;
  } else {
    q5Detail = "no committed inventory script at this path — visible-string audit was run ad hoc this phase, not wired into CI";
  }
} catch (err) {
  q5Detail = `inventory script error: ${err}`;
}
check("q5_zero_unresolved_visible_strings_app_wide", q5Pass, q5Detail);
check("q5b_unreachable_legacy_strings_reported_separately", q5bPass, q5bDetail);

// Q6. Section-level evidence statuses exist for Offer/MS/HS with the exact
// required label-key vocabulary from the completion-gate spec.
const offerWs = getWorkspace("offer-scenarios" as TabId);
const msWs = getWorkspace("ms" as TabId);
const hsWs = getWorkspace("hs" as TabId);
check(
  "q6a_offer_evidence_sections_present",
  (offerWs.evidenceSections?.length ?? 0) === 3,
  `count=${offerWs.evidenceSections?.length ?? 0}`,
);
check(
  "q6b_ms_evidence_sections_present",
  (msWs.evidenceSections?.length ?? 0) === 3,
  `count=${msWs.evidenceSections?.length ?? 0}`,
);
check(
  "q6c_hs_evidence_sections_present",
  (hsWs.evidenceSections?.length ?? 0) === 4,
  `count=${hsWs.evidenceSections?.length ?? 0}`,
);

// Q7. Payroll locked constants unchanged — re-asserted via the same entry-state
// blob comparison used by Section N (belt-and-suspenders with Section P).
check(
  "q7_payroll_grade_config_source_unchanged",
  checks.some((c) => c.id === "no_drift__src/lib/payroll/domain.ts" && c.pass),
  "src/lib/payroll/domain.ts (PAYROLL_GRADE_CONFIG source) must be covered by Section N no_drift",
);

// Q8. DRE/FOPAG/Capital engine files unchanged — re-asserted.
const ENGINE_FILES_REQUIRING_NO_DRIFT = [
  "src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts",
  "src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts",
  "src/features/rio-scenario-resilience/model/dreWorkingScenarioContract.ts",
];
check(
  "q8_dre_fopag_capital_engine_files_unchanged",
  ENGINE_FILES_REQUIRING_NO_DRIFT.every((p) => checks.some((c) => c.id === `no_drift__${p}` && c.pass)),
  "capitalDecisionEngine / dreGovernanceReadiness / dreWorkingScenarioContract must be covered by Section N no_drift",
);

// Q9. Enrollment/capacity source unchanged — re-asserted.
check(
  "q9_enrollment_capacity_source_unchanged_runtime",
  checks.some((c) => c.id === "enrollment_capacity_source_unchanged" && c.pass),
  "openingPackageOccupancySourceDataContract.ts must match HEAD blob",
);

// Q10. Raw numeric engine results are locale-invariant — proven statically:
// no model/engine or payroll-lib file may import useLocale or reference the
// Locale type. Locale-aware formatting belongs strictly in presentation code.
const MODEL_DIRS = [
  join(ROOT, "src/features/rio-scenario-resilience/model"),
  join(ROOT, "src/lib/payroll"),
];
function listFilesRecursive(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return listFilesRecursive(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
}
const modelFilesReferencingLocale = MODEL_DIRS.flatMap(listFilesRecursive).filter((f) => {
  const contents = readFileSync(f, "utf8");
  return /useLocale|from ["']\.\.?\/.*i18n/.test(contents);
});
check(
  "q10_raw_numeric_results_locale_invariant",
  modelFilesReferencingLocale.length === 0,
  modelFilesReferencingLocale.length === 0
    ? "no model/engine or lib/payroll file imports useLocale or i18n modules"
    : `locale-referencing model files: ${JSON.stringify(modelFilesReferencingLocale.map((f) => f.replace(ROOT + "/", "")))}`,
);

// Q11. Governed workbook filenames/sheet names unchanged — re-asserted.
// V10-RC2.5: this aggregate now requires BOTH the 3 remaining byte-frozen
// files AND (in place of the 3 retired byte checks) every Section R
// permanent semantic/runtime invariant to pass — evaluated after Section R
// below so the referenced check IDs already exist in `checks`. Kept under
// the original "q11" id for continuity with prior-phase reports; the
// underlying content of what it aggregates has changed by explicit
// product-owner authorization (see Section R's governance note).
function q11GovernedExportFilesUnchangedRuntime(): void {
  check(
    "q11_governed_export_files_unchanged_runtime",
    GOVERNED_EXPORT_FILES.every((p) => checks.some((c) => c.id === `governed_export_file_unchanged__${p}` && c.pass)) &&
      ["r1_build_role_year_details_single_implementation",
       "r2_production_call_sites_use_shared_implementation",
       "r3_role_year_annual_components_reconcile_to_total",
       "r4_payroll_export_matrix_tab_unchanged",
       "r5_fixed_matrix_adapter_no_tier_reference",
       "r6_fixed_matrix_sheets_no_educator_tier_column",
       "r8_overlapping_payroll_orgdesign_records_reconcile",
       "r9_exception_files_diff_bounded_to_authorized_refactor",
      ].every((id) => checks.some((c) => c.id === id && c.pass)),
    "3 remaining governed export files byte-identical AND every Section R permanent invariant (replacing the retired byte checks on the 3 V10-RC2.5 exception files) passes",
  );
}

// Q12. Active occupancy scenario IDs unchanged (conservador/base/otimista only).
check(
  "q12_active_occupancy_scenario_ids_unchanged",
  JSON.stringify(OCCUPANCY_SCENARIO_IDS) === JSON.stringify(["conservador", "base", "otimista"]),
  `actual=${JSON.stringify(OCCUPANCY_SCENARIO_IDS)}`,
);

// Q13. No retired "pessimista" OCCUPANCY id used in the new/updated X2T
// browser QA fixtures. (PayrollScenario's own "pessimista" enrollment
// scenario is a distinct, still-active concept and is exempt.)
const dreCapitalHandoffPath = "tests/phase15g2/dre-capital-handoff.run.ts";
let q13Pass = false;
let q13Detail = "fixture not found";
if (existsSync(join(ROOT, dreCapitalHandoffPath))) {
  const fixtureSrc = src(dreCapitalHandoffPath);
  const occupancySelectsPessimista = /selectOption\(\s*"pessimista"\s*\)/.test(fixtureSrc);
  q13Pass = !occupancySelectsPessimista;
  q13Detail = q13Pass
    ? "no selectOption(\"pessimista\") call remains in the DRE↔Capital occupancy-lever fixture"
    : "retired occupancy id \"pessimista\" still selected in browser QA fixture";
}
check("q13_no_retired_pessimista_occupancy_in_x2t_browser_qa", q13Pass, q13Detail);

// Q14. Governed screenshots must be written outside the repository (never
// under ROOT), so they can never be accidentally staged.
const SCREENSHOT_DIR = join(homedir(), "Downloads", "Rio_V10_X2T_Visual_Review");
check(
  "q14_screenshot_output_directory_outside_repo",
  !SCREENSHOT_DIR.startsWith(ROOT),
  `screenshot_dir=${SCREENSHOT_DIR} root=${ROOT}`,
);

// Q15. No screenshot or other binary asset is staged in this phase's candidate.
const stagedFiles = execSync("git diff --cached --name-only", { cwd: ROOT }).toString().trim().split("\n").filter(Boolean);
const BINARY_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".zip", ".xlsx", ".pdf"];
const stagedBinaries = stagedFiles.filter((f) => BINARY_EXTENSIONS.some((ext) => f.toLowerCase().endsWith(ext)));
check(
  "q15_no_binary_staged",
  stagedBinaries.length === 0,
  stagedBinaries.length === 0 ? `${stagedFiles.length} files staged, 0 binaries` : `staged binaries: ${JSON.stringify(stagedBinaries)}`,
);

// Q16. Payroll revenue-uncertified/MS-HS-unreconciled notice still wired
// in both locales — re-asserted (belt-and-suspenders with Section H).
check(
  "q16_payroll_revenue_uncertified_mshs_unreconciled_notice_both_locales",
  PT_BR.wsPayrollSubviewANotice === REQUIRED_PT_NOTICE && EN_US.wsPayrollSubviewANotice === REQUIRED_EN_NOTICE,
  "notice text must match spec exactly in both locales",
);

// Q17. LocaleProvider persistence key documented and distinct from the
// pre-existing About-modal localStorage flag.
check(
  "q17_locale_storage_key_distinct_from_about_modal_flag",
  (LOCALE_STORAGE_KEY as string) !== "hasSeenAbout_v3.0" && LOCALE_STORAGE_KEY === "rio-org-design.locale.v1",
  `key=${LOCALE_STORAGE_KEY}`,
);

// Q18. Existing check count must not shrink relative to this phase's own
// prior run (monotonic growth — "do not weaken existing checks").
const PRIOR_PHASE_CHECK_COUNT_FLOOR = 83;
check(
  "q18_check_suite_did_not_shrink",
  checks.length >= PRIOR_PHASE_CHECK_COUNT_FLOOR,
  `current=${checks.length} floor=${PRIOR_PHASE_CHECK_COUNT_FLOOR}`,
);

// Q19. PayrollProjectionTab.tsx shared-engine refactor — re-asserted
// (belt-and-suspenders with Section P, in case Section P's checks are ever
// reordered relative to this section). V10-RC2.2: this no longer pins
// byte-identity (the refactor was explicitly authorized) — it pins that the
// refactor's four defining properties all hold simultaneously.
check(
  "q19_payroll_tab_shared_engine_refactor_runtime",
  checks.some((c) => c.id === "payroll_tab_receives_shared_scenario_props" && c.pass) &&
    checks.some((c) => c.id === "payroll_tab_consumes_governed_engines" && c.pass) &&
    checks.some((c) => c.id === "payroll_tab_retired_disconnected_local_axis" && c.pass) &&
    checks.some((c) => c.id === "payroll_tab_export_uses_governed_workbook" && c.pass),
  "PayrollProjectionTab.tsx must receive shared scenario props, consume the governed engines, have retired its disconnected local axis, and export via the governed workbook",
);

// Q20. No StaffingTab reintroduction and no premature Dashboard/Senior
// Learning Assistant implementation this phase (explicit spec prohibitions).
check(
  "q20_no_prohibited_scope_expansion",
  !allRegisteredIds.includes("staffing") &&
    !allRegisteredIds.some((id) => /dashboard|painel-executivo|learning-assistant|senior-learning/i.test(String(id))),
  "registry must not contain staffing, Dashboard, or Senior Learning Assistant entries this phase",
);

// ── Section R: V10-RC2.5 — permanent semantic/runtime invariants replacing
// the retired byte-identity freeze on the 3 exception files (see the
// governance note at GOVERNED_EXPORT_FILES above). These check ONLY the
// exact authorized change (buildRoleYearDetails' parameter shape) and its
// direct consequences — general export correctness (12-scenario matrix,
// sheet names/counts, ZIP/manifest, DRE bridge, escalation-rate invariance)
// is already covered end-to-end by validate:v10-x1
// (scripts/validate-v10-x1-payroll-export-matrix.ts), which passes
// unchanged under this refactor and is not re-derived here.
const R_EPS = 0.01; // same reconciliation precision policy as
// scripts/validate-v10-x1-payroll-export-matrix.ts's EPS and
// scripts/validate-v10-rc2-5-gate7-shared-tier-workflow.ts's
// RECONCILIATION_TOLERANCE.

// R1. buildRoleYearDetails has exactly one implementation in the codebase
// (no duplicate role/year payroll calculation was introduced alongside it).
const buildRoleYearDetailsDefGrep = (() => {
  try {
    return execSync(`grep -rn "export function buildRoleYearDetails" src`, { cwd: ROOT }).toString().trim();
  } catch {
    return "";
  }
})();
const buildRoleYearDetailsDefLines = buildRoleYearDetailsDefGrep === "" ? [] : buildRoleYearDetailsDefGrep.split("\n");
check(
  "r1_build_role_year_details_single_implementation",
  buildRoleYearDetailsDefLines.length === 1 &&
    buildRoleYearDetailsDefLines[0].includes("src/features/rio-scenario-resilience/model/payrollExportWorkbookBuilder.ts"),
  `definitions=${JSON.stringify(buildRoleYearDetailsDefLines)}`,
);

// R2. Every production call site imports the single shared implementation
// (rather than reimplementing the role/year escalation logic locally).
const BUILD_ROLE_YEAR_DETAILS_PRODUCTION_CALL_SITES = [
  "src/features/rio-scenario-resilience/model/payrollExportSummaryWorkbookBuilder.ts",
  "src/features/rio-scenario-resilience/model/payrollExportManifest.ts",
  "src/features/rio-scenario-resilience/model/orgDesignExportWorkbookBuilder.ts",
];
const IMPORT_SHARED_BUILD_ROLE_YEAR_DETAILS_RE =
  /import\s*\{[^}]*\bbuildRoleYearDetails\b[^}]*\}\s*from\s*["']\.\/payrollExportWorkbookBuilder["']/;
const callSitesMissingSharedImport = BUILD_ROLE_YEAR_DETAILS_PRODUCTION_CALL_SITES.filter(
  (p) => !IMPORT_SHARED_BUILD_ROLE_YEAR_DETAILS_RE.test(src(p)),
);
const payrollExportWorkbookBuilderSrc = src("src/features/rio-scenario-resilience/model/payrollExportWorkbookBuilder.ts");
check(
  "r2_production_call_sites_use_shared_implementation",
  callSitesMissingSharedImport.length === 0 &&
    /export function buildRoleYearDetails\(/.test(payrollExportWorkbookBuilderSrc),
  callSitesMissingSharedImport.length === 0
    ? "all production call sites import buildRoleYearDetails from ./payrollExportWorkbookBuilder"
    : `missing shared import: ${JSON.stringify(callSitesMissingSharedImport)}`,
);

// R3. Runtime: RoleYearDetail's annualSalary + annualEncargos + annualBenefits
// reconciles to totalAnnualRolePayroll under the existing precision policy,
// for a real scenario's FopagCalculatedRecords built through the actual
// engine (not fabricated data). Also confirms (via the same built workbook)
// that no "Educator Tier" column exists in the frozen Payroll Detail header
// row — a runtime/workbook assertion, not a source-text check alone.
const R_SAMPLE_MATRIX_RECORD = PAYROLL_EXPORT_MATRIX[0]!;
const rSampleScenarioResult = buildPayrollExportScenarioResult(R_SAMPLE_MATRIX_RECORD);
const rSampleDetails = buildRoleYearDetails(rSampleScenarioResult.fopagOutput.records);
const componentReconciliationMismatches = rSampleDetails.filter(
  (d) => Math.abs(d.annualSalary + d.annualEncargos + d.annualBenefits - d.totalAnnualRolePayroll) > R_EPS,
);
check(
  "r3_role_year_annual_components_reconcile_to_total",
  rSampleDetails.length > 0 && componentReconciliationMismatches.length === 0,
  componentReconciliationMismatches.length === 0
    ? `n=${rSampleDetails.length} rows, all reconcile within ${R_EPS}`
    : `mismatches: ${JSON.stringify(componentReconciliationMismatches.slice(0, 3).map((d) => `${d.roleId}/${d.year}`))}`,
);

const R_META = {
  applicationCommitHash: "v10-x2t-validator",
  generationTimestampIso: new Date().toISOString(),
  exportGeneratorVersion: "v10-x2t-validator",
  validationStatus: "validating",
};
const rSampleWorkbook = buildPayrollExportDetailedWorkbook(rSampleScenarioResult, R_META);
const rPayrollDetailSheet = rSampleWorkbook.Sheets["Payroll Detail"];
const rPayrollDetailHeaderRow: unknown[] = rPayrollDetailSheet
  ? ((XLSX.utils.sheet_to_json(rPayrollDetailSheet, { header: 1 }) as unknown[][])[1] ?? [])
  : [];
check(
  "r6_fixed_matrix_sheets_no_educator_tier_column",
  !rPayrollDetailHeaderRow.some((cell) => String(cell) === "Educator Tier"),
  `Payroll Detail header row: ${JSON.stringify(rPayrollDetailHeaderRow)}`,
);

// R4. PayrollExportMatrixTab.tsx remains unchanged (permanent no-drift check
// — not previously covered by any existing ENTRY_STATE_PROTECTED_FILES or
// GOVERNED_EXPORT_FILES entry).
const PAYROLL_EXPORT_MATRIX_TAB_PATH = "src/components/sections/PayrollExportMatrixTab.tsx";
let payrollExportMatrixTabHeadHash = "";
try {
  payrollExportMatrixTabHeadHash = execSync(`git rev-parse HEAD:${PAYROLL_EXPORT_MATRIX_TAB_PATH}`, { cwd: ROOT }).toString().trim();
} catch {
  payrollExportMatrixTabHeadHash = "";
}
const payrollExportMatrixTabWorkingHash = gitHashObject(PAYROLL_EXPORT_MATRIX_TAB_PATH);
check(
  "r4_payroll_export_matrix_tab_unchanged",
  payrollExportMatrixTabHeadHash !== "" && payrollExportMatrixTabHeadHash === payrollExportMatrixTabWorkingHash,
  payrollExportMatrixTabHeadHash === payrollExportMatrixTabWorkingHash
    ? "matches HEAD blob"
    : `HEAD=${payrollExportMatrixTabHeadHash} working=${payrollExportMatrixTabWorkingHash}`,
);

// R5. The fixed-matrix export path (payrollExportScenarioAdapter.ts, still
// fully byte-frozen) never references educatorTierByGrade at all — the
// fixed-matrix export is structurally incapable of reflecting a live
// Educator-tier selection, independent of anything else in this phase.
const payrollExportScenarioAdapterSrc = src("src/features/rio-scenario-resilience/model/payrollExportScenarioAdapter.ts");
check(
  "r5_fixed_matrix_adapter_no_tier_reference",
  !payrollExportScenarioAdapterSrc.includes("educatorTierByGrade"),
  "payrollExportScenarioAdapter.ts (byte-frozen) contains no educatorTierByGrade reference",
);

// R8. Overlapping Payroll (fixed-matrix) and Org Design export records
// reconcile: build FopagCalculatedRecords through the fixed-matrix adapter
// path and, independently, through the exact call path the new Org Design
// export uses (calculateFopag with an equivalent scenario + no tier
// overrides, so every grade resolves to the same governed "master" default)
// — the resulting RoleYearDetail rows must match role-for-role, year-for-year.
const orgDesignEquivalentFopagOutput = calculateFopag({
  openingPackageId: R_SAMPLE_MATRIX_RECORD.openingPackageId,
  occupancyScenarioId: R_SAMPLE_MATRIX_RECORD.occupancyScenarioId,
  orgDesignOptionId: R_SAMPLE_MATRIX_RECORD.orgDesignOptionId,
  educatorTierByGrade: {},
});
const orgDesignEquivalentDetails = buildRoleYearDetails(orgDesignEquivalentFopagOutput.records);
const detailKey = (d: { roleId: string; year: number }) => `${d.roleId}__${d.year}`;
const fixedMatrixDetailsByKey = new Map(rSampleDetails.map((d) => [detailKey(d), d]));
const orgDesignDetailsByKey = new Map(orgDesignEquivalentDetails.map((d) => [detailKey(d), d]));
let r8Ok = fixedMatrixDetailsByKey.size > 0 && fixedMatrixDetailsByKey.size === orgDesignDetailsByKey.size;
let r8Detail = `n=${fixedMatrixDetailsByKey.size}`;
if (r8Ok) {
  outer: for (const [key, fixed] of fixedMatrixDetailsByKey) {
    const orgDesign = orgDesignDetailsByKey.get(key);
    if (!orgDesign) {
      r8Ok = false;
      r8Detail = `key missing from Org Design output: ${key}`;
      break;
    }
    const fieldsToCompare: (keyof typeof fixed)[] = [
      "annualSalary",
      "annualEncargos",
      "annualBenefits",
      "totalAnnualRolePayroll",
      "activeHc",
    ];
    for (const field of fieldsToCompare) {
      if (Math.abs(Number(fixed[field]) - Number(orgDesign[field])) > R_EPS) {
        r8Ok = false;
        r8Detail = `${key}.${String(field)}: fixed-matrix=${fixed[field]} orgDesign=${orgDesign[field]}`;
        break outer;
      }
    }
  }
}
check("r8_overlapping_payroll_orgdesign_records_reconcile", r8Ok, r8Detail);

// R9. The V10-RC2.5 exception (3 files) has a diff, against the frozen
// V10-X1 committed baseline, bounded to exactly the authorized
// buildRoleYearDetails parameter-shape refactor and its direct call-site
// consequences — replacing byte-identity with a precise "bounded diff"
// invariant rather than merely removing protection. Any future change to
// these 3 files beyond this exact authorized diff will fail this check.
const EXCEPTION_FILE_ALLOWED_DIFF_LINES: Record<string, readonly string[]> = {
  "src/features/rio-scenario-resilience/model/payrollExportManifest.ts": [
    "-    const details = buildRoleYearDetails(sr);",
    "+    const details = buildRoleYearDetails(sr.fopagOutput.records);",
  ],
  "src/features/rio-scenario-resilience/model/payrollExportSummaryWorkbookBuilder.ts": [
    "-    const details = buildRoleYearDetails(scenarioResult);",
    "+    const details = buildRoleYearDetails(scenarioResult.fopagOutput.records);",
  ],
  "src/features/rio-scenario-resilience/model/payrollExportWorkbookBuilder.ts": [
    "+// V10-RC2.5 Gate 3/Tranche C: takes FOPAG records directly (not the fixed-",
    "+// matrix PayrollExportScenarioResult wrapper) — the only field this function",
    "+// ever used from that wrapper was fopagOutput.records, so this also lets the",
    "+// live Org Design export (orgDesignExportWorkbookBuilder.ts, no",
    "+// PayrollExportMatrixRecord involved) reuse the identical role/year",
    "+// escalation logic rather than re-deriving it.",
    "-  scenarioResult: PayrollExportScenarioResult,",
    "+  fopagRecords: readonly FopagCalculatedRecord[],",
    "-  const sorted = [...fillMissingYearRecords(scenarioResult.fopagOutput.records)].sort(",
    "+  const sorted = [...fillMissingYearRecords(fopagRecords)].sort(",
    "-  const details = buildRoleYearDetails(scenarioResult);",
    "+  const details = buildRoleYearDetails(scenarioResult.fopagOutput.records);",
  ],
};
let r9Ok = true;
let r9Detail = "ok";
for (const path of RC2_5_EXCEPTION_FILES) {
  const diffOut = execSync(`git diff ${V10_X1_COMMIT} -- ${path}`, { cwd: ROOT }).toString();
  const changedLines = diffOut
    .split("\n")
    .filter((l) => (l.startsWith("+") || l.startsWith("-")) && !l.startsWith("+++") && !l.startsWith("---"));
  const allowed = EXCEPTION_FILE_ALLOWED_DIFF_LINES[path] ?? [];
  const disallowed = changedLines.filter((l) => !allowed.includes(l));
  if (disallowed.length > 0) {
    r9Ok = false;
    r9Detail = `${path}: unauthorized diff line(s) beyond the buildRoleYearDetails refactor: ${JSON.stringify(disallowed)}`;
    break;
  }
}
check("r9_exception_files_diff_bounded_to_authorized_refactor", r9Ok, r9Detail);

q11GovernedExportFilesUnchangedRuntime();

// ── Output ───────────────────────────────────────────────────────────────

const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;
console.log(JSON.stringify({ passCount, failCount, checks }, null, 2));
console.log(
  failCount === 0
    ? `\n✓ Phase V10-X2T workspace architecture / i18n validation: ${passCount}/${checks.length} pass, 0 fail`
    : `\n✗ Phase V10-X2T workspace architecture / i18n validation: ${passCount}/${checks.length} pass, ${failCount} fail`,
);
if (failCount > 0) process.exit(1);
