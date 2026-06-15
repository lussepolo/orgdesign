import { CapitalDecisionView } from "./components/CapitalDecision";

// Phase 15F: the feature-local Rio Capital Decision UI is now the active
// view for this preview entry point. The earlier scaffold panels
// (ScenarioFlowMap, ScenarioFunnel, ScenarioOutputsPanel,
// RoleCostLibraryNotice, and the standalone DecisionLeversPanel preview) are
// not rendered here, but their component files remain in
// ./components and are not deleted.
export function RioScenarioResiliencePreview() {
  return <CapitalDecisionView />;
}

export default RioScenarioResiliencePreview;
