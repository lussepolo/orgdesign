# Rio Scenario Resilience Feature Instructions

This feature folder is a future simulator foundation, not a completed simulator.

## Required reading

Read [`docs/projectCharter.md`](docs/projectCharter.md) before doing
substantial work in this feature folder (model, components, or docs) or in
the DRE Scenario Simulator (`src/components/sections/DreScenarioSimulatorTab.tsx`,
`src/components/dreSimulator/`, `src/hooks/useDreScenarioSimulator.ts`). It
defines the project's purpose, scope, naming rules, source-of-truth rules,
and the mandatory phase-gate protocol.

## Phase-gate protocol

- Every phase report for this feature folder or the DRE Scenario Simulator
  must end with a section titled exactly "Questions for Luciana before
  proceeding:" (see `docs/projectCharter.md` section 16 for the required
  questions).
- Do not present the next phase as automatic. A next phase may be
  recommended, but must not begin without Luciana's confirmation.
- Keep DRE/operating outputs (DRE layer) clearly distinguished from
  capital-decision metrics (Phase 15 layer: cash-flow, CAPEX, DCF, NPV/VPL,
  payback, discounted payback, investment recovery, Tier). DRE-only outputs
  must not be called "investment outputs," and an EBITDA-positive year must
  not be called "investment break-even."
- Read [`IMPLEMENTATION.md`](../../../IMPLEMENTATION.md) (repo root) before
  starting substantial work on the DRE Scenario Simulator or capital
  decision layer, and update it with status/blockers/next gate before
  asking Luciana to proceed to a new phase.
- Do not proceed to Phase 15A until Phase 14 UI visual approval and the
  Phase 14B-QA browser/manual XLSX-open approval are explicitly cleared or
  waived by Luciana (see `IMPLEMENTATION.md`).
- Do not ask Luciana to approve UI quality without screenshots, a live
  preview, or a locally reviewable route (e.g. `npm run dev`).

## Rules

- Components in this folder must not hard-code financial formulas.
- Components must not duplicate salary, payroll, revenue, OPEX, or CAPEX logic that already exists elsewhere in the app.
- Existing app sources must be reused before new logic is created.
- Decision levers are structural inputs only.
- Computed outputs belong to a later calculation layer.
- Missing data must be represented explicitly as missing, not inferred.
- Org Design Structure may be displayed structurally, but must not affect FOPAG, EBITDA, VPL, payback, or margin until role-cost assumptions are validated.
- Tuition scenarios represent pricing architecture, not low/base/high pricing.
- Opening year is 2028. Construction year is 2027.
- Do not use 2026 pre-operations or 2027 opening assumptions.

