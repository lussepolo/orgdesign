import type { CapitalDecisionWorkspaceController } from "./components/CapitalDecision/capitalDecisionUiTypes";
import { CapitalDecisionView } from "./components/CapitalDecision";

// Phase 15F: the feature-local Rio Capital Decision UI is now the active
// view for this preview entry point. The earlier scaffold panels
// (ScenarioFlowMap, ScenarioFunnel, ScenarioOutputsPanel,
// RoleCostLibraryNotice, and the standalone DecisionLeversPanel preview) are
// not rendered here, but their component files remain in
// ./components and are not deleted.
//
// Phase 15G.2: accepts discriminated mode prop.
//   mode="standalone"  → full Phase 15F local state (used by qa:phase15f).
//   mode="integrated"  → driven by workspace controller from App.tsx.

export type RioScenarioResiliencePreviewProps =
  | { readonly mode: "standalone" }
  | {
      readonly mode: "integrated";
      readonly workspace: CapitalDecisionWorkspaceController;
      readonly onNavigateToDre: () => void;
    };

export function RioScenarioResiliencePreview(props: RioScenarioResiliencePreviewProps) {
  if (props.mode === "integrated") {
    return (
      <CapitalDecisionView
        mode="integrated"
        workspace={props.workspace}
        onNavigateToDre={props.onNavigateToDre}
      />
    );
  }
  return <CapitalDecisionView mode="standalone" />;
}

export default RioScenarioResiliencePreview;
