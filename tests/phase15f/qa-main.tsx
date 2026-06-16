import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RioScenarioResiliencePreview } from "../../src/features/rio-scenario-resilience/RioScenarioResiliencePreview";
import "../../src/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: 24 }}>
      <RioScenarioResiliencePreview mode="standalone" />
    </div>
  </StrictMode>,
);
