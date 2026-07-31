import { readFileSync } from "fs";
import {
  PRIMARY_WORKSPACE_ORDER,
  getSupportingWorkspacesByGroup,
  getWorkspace,
} from "../src/config/workspaceRegistry";
import { PT_BR } from "../src/i18n/pt-BR";
import { EN_US } from "../src/i18n/en-US";

let failures = 0;

function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}${detail ? ` - ${detail}` : ""}`);
}

const expectedPrimary = [
  "cover",
  "dre-scenario-simulator",
  "contribution-margin",
  "payroll",
  "capital-decision",
] as const;

check(
  "primary_workflow_order_is_controller_path",
  JSON.stringify(PRIMARY_WORKSPACE_ORDER) === JSON.stringify(expectedPrimary),
  `got ${JSON.stringify(PRIMARY_WORKSPACE_ORDER)}`,
);

for (const id of expectedPrimary) {
  const workspace = getWorkspace(id);
  check(`${id}_is_primary_visible`, workspace.visibleInPrimaryNavigation === true);
  check(`${id}_is_not_supporting`, workspace.visibleInSupportingNavigation === false);
}

const expectedAcademic = [
  "offer-scenarios",
  "executive-org-design",
  "early-years",
  "lower-school",
  "ms",
  "hs",
  "load",
];
const academicIds = getSupportingWorkspacesByGroup("academic").map((workspace) => workspace.id);
check(
  "academic_architecture_is_supporting_group",
  JSON.stringify(academicIds) === JSON.stringify(expectedAcademic),
  `got ${JSON.stringify(academicIds)}`,
);
check(
  "people_group_contains_hr",
  JSON.stringify(getSupportingWorkspacesByGroup("people").map((workspace) => workspace.id)) === JSON.stringify(["hr"]),
);
check(
  "analysis_group_contains_viability",
  JSON.stringify(getSupportingWorkspacesByGroup("analysis").map((workspace) => workspace.id)) === JSON.stringify(["viability"]),
);

check("pt_dashboard_simulator_label", PT_BR.wsContributionMarginShortLabel === "Dashboard Simulator");
check("en_dashboard_simulator_label", EN_US.wsContributionMarginShortLabel === "Dashboard Simulator");
check("pt_overview_dashboard_title", PT_BR.wsContributionMarginTitle === "Overview Dashboard");
check("en_overview_dashboard_title", EN_US.wsContributionMarginTitle === "Overview Dashboard");

const appSource = readFileSync("src/App.tsx", "utf8");
const passwordGateSource = readFileSync("src/PasswordGate.tsx", "utf8");
check("app_shell_has_persistent_dre_scenario_bar", appSource.includes("navScenarioBarLabel"));
check("app_shell_exposes_financial_architecture_menu", appSource.includes("navFinancialArchitectureLabel"));
check("app_shell_exposes_experience_architecture_menu", appSource.includes("navExperienceArchitectureLabel"));
check("scenario_context_is_financial_only", appSource.includes("{isFinancialWorkspace && ("));
check("financial_workspaces_use_scoped_gate", appSource.includes('<PasswordGate scope="financial">'));
check("password_gate_has_financial_scope", passwordGateSource.includes('financial: "concept_rio_financial_auth"'));
check("app_shell_uses_worksheet_sync_metadata", appSource.includes("DRE_WORKSHEET_SYNC_METADATA"));
check("app_shell_has_single_navigation_handler", appSource.includes("const navigateToTab = React.useCallback"));
check("navigation_handler_closes_navigation_menu", appSource.includes("setNavigationMenu(null);"));
check("navigation_handler_resets_scroll_position", appSource.includes("window.scrollTo({ top: 0"));
check("capital_imports_active_dre_scenario_by_default", appSource.includes("importDreScenarioToCapital(dreSelections);"));
check("mobile_scenario_bar_has_compact_summary", appSource.includes("activeScenarioSummary"));
check("workspace_routes_are_lazy_loaded", appSource.includes("React.lazy(() => import("));
check("workspace_routes_are_wrapped_in_suspense", appSource.includes("<React.Suspense fallback={<WorkspaceLoadingFallback />}>"));
check("app_shell_does_not_static_import_motion", !appSource.includes("from \"motion/react\""));
const primaryNavClass = appSource.match(
  /aria-label=\{t\("navPrimaryAriaLabel"\)\}\s+className="([^"]+)"/,
)?.[1];
check("primary_nav_class_was_found", Boolean(primaryNavClass));
check("primary_nav_no_flex_wrap_class", Boolean(primaryNavClass) && !primaryNavClass.includes("flex-wrap"));
check("primary_nav_scrolls_instead_of_wrapping", Boolean(primaryNavClass) && primaryNavClass.includes("overflow-x-auto"));

if (failures > 0) {
  console.error(`navigation-flow validation failed with ${failures} failure(s)`);
  process.exitCode = 1;
} else {
  console.log("navigation-flow validation passed");
}
