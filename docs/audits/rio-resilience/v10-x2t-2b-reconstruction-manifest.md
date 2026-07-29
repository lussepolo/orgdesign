# V10-X2T.2B Manifest — staged patch `ea1556d7…` (72 files, 7804+/1764-)

Every file manually read (full diff or full-diff + targeted grep sweep for
cross-category tokens: `intermediario`, `workspaceRegistry`, `appMetadata`,
`payrollGovernanceWorkbookAdapter`, `OccupancyScenarioId`, `conservador`).
Category H is empty — every file/hunk below has a determinate category.

Legend: A=locale infra, B=payroll/viability terminology, C=completed-surface
localization, D=workspace/navigation architecture, E=validators/QA/fixtures,
F=adapter/DRE integration (quarantined, NOT part of this branch), G=docs,
H=unresolved (empty).

## A — Locale infrastructure (Candidate 1)
- src/i18n/LocaleProvider.tsx (new) — pure A
- src/i18n/en-US.ts (new) — pure A, translation catalog only
- src/i18n/pt-BR.ts (new) — pure A, translation catalog only
- src/i18n/formatters.ts (new) — pure A, presentation-only Intl wrappers
- src/i18n/localeContract.ts (new) — pure A
- src/i18n/useLocale.ts (new) — pure A
- src/main.tsx — pure A (wraps `<PasswordGate>` in `<LocaleProvider>`; no other change)

## B — Payroll/viability terminology migration (Candidate 2)
Whole-file, pure B (identifier rename `intermediario`→`base` only):
- src/lib/payroll/domain.ts
- src/lib/viability/types.ts
- src/lib/viability/baseline.ts
- src/lib/viability/sensitivity.ts (includes matching dropdown-option label
  rename "Intermediário"→"Base" — this is the terminology label itself, not
  translation wiring; no `t()`/useLocale involved)
- src/hooks/useViabilitySimulator.ts

Mixed at line level — verified by constructing an intermediate file (HEAD +
only the `intermediario`→`base` literal-token substitution, case-sensitive,
lowercase-only so capitalized display word "Intermediário" is untouched) and
diffing it against both HEAD (confirms only identifier lines differ) and the
final staged blob (confirms zero leftover `intermediario` tokens — remaining
delta is 100% C content):
- src/components/viability/ViabilityInputsRail.tsx — 1 line: `value="intermediario"` → `value="base"` (label text `Intermediário` stays literal in this candidate; C rewires it to `t("scenarioBase")`)
- src/components/sections/ViabilitySimulatorTab.tsx — 1 line: `state.enrollmentScenario === "intermediario"` → `=== "base"`
- src/components/sections/PayrollProjectionTab.tsx — 7 lines: `scenarioLabels`/`scenarioColors` record key, 4× array literal `["otimista","intermediario","pessimista"]`, 1× ternary comparison. (`scenarioLabels`' VALUE type/content change, from raw Portuguese strings to translation-key literals, is C, layered on top in the same file.)

Verified constructed-intermediate diffs saved at:
`scratchpad/candidate2-construct/*.candidate2`

## C — Completed-surface localization (Candidate 3)
Verified via full read (PasswordGate.tsx, ThresholdNarrativePanel.tsx,
ViabilityKpiRow.tsx, HiringProfileCardsTab.tsx, ScenarioComparisonPanel.tsx
import list, DreExecutiveInterpretationPanel.tsx import list) plus a
whole-corpus grep sweep confirming none of these touch `workspaceRegistry`,
`appMetadata`, `payrollGovernanceWorkbookAdapter`, or a scenario-identifier
literal:
- src/PasswordGate.tsx
- src/components/dreSimulator/DreAnnualTable.tsx
- src/components/dreSimulator/DreBoardReadableExport.tsx
- src/components/dreSimulator/DreEbitdaChart.tsx
- src/components/dreSimulator/DreExecutiveInterpretationPanel.tsx
- src/components/dreSimulator/DreExportButton.tsx
- src/components/dreSimulator/DreGovernanceSummaryPanel.tsx
- src/components/dreSimulator/DreLeverPanel.tsx
- src/components/dreSimulator/DreScenarioContextBanner.tsx
- src/components/dreSimulator/DreScopeBoundaryPanel.tsx
- src/components/dreSimulator/DreSummaryCards.tsx
- src/components/dreSimulator/OrgDesignPanel.tsx
- src/components/dreSimulator/OrgDesignSensitivityPanel.tsx
- src/components/sections/DreScenarioSimulatorTab.tsx
- src/components/sections/EarlyYearsTab.tsx
- src/components/sections/ExecutiveOrgDesignTab.tsx
- src/components/sections/HiringProfileCardsTab.tsx (looks "mixed" by line count only — full read confirms it is 100% localization: a hardcoded array of cluster/role objects converted to translation-key lookups; no B/D content)
- src/components/sections/LoadTab.tsx
- src/components/sections/LowerSchoolTab.tsx
- src/components/sections/PayrollExportMatrixTab.tsx
- src/components/viability/SensitivityControlBar.tsx
- src/components/viability/SensitivityInterpretationStrip.tsx
- src/components/viability/SensitivityMatrixGrid.tsx
- src/components/viability/ThresholdChart.tsx
- src/components/viability/ThresholdControlPanel.tsx
- src/components/viability/ThresholdNarrativePanel.tsx
- src/components/viability/ThresholdResultCards.tsx
- src/components/viability/ViabilityAnnualProjectionTable.tsx
- src/components/viability/ViabilityKpiRow.tsx
- src/components/viability/ViabilityProjectionChart.tsx
- src/components/viability/ViabilityTopBar.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/FinancialMetricCard.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/InterpretationNotes.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/InvestmentReferencePanel.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/MethodologyDisclosure.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioComparisonPanel.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioConfigurationPanel.tsx
- src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioResultPanel.tsx

Note (from staged IMPLEMENTATION.md prose, not yet independently verified):
CapitalDecisionView.tsx allegedly hardcodes `title="Capital Decision"` on one
render branch and `title="Decisão de Capital"` on two others, independent of
locale — a pre-existing mixed-language defect. Flagged for Candidate 3 QA,
not fixed by this manifest.

## D — Workspace/navigation architecture (Candidate 4)
Verified by full read of App.tsx (606 lines) and AboutModal.tsx (192 lines):
both are genuinely whole-file D, not line-splittable. App.tsx's nav is
rewritten from a hardcoded per-tab `TabButton` list to a `WORKSPACE_REGISTRY`-
driven loop; every `t()` call inside that loop resolves a key sourced from
`workspace.shortLabelKey`/`titleKey`, i.e. the localization is a *consequence*
of consuming the new registry, not a standalone C change applied to
unchanged structure. Same for AboutModal.tsx: its per-workspace list is now
`WORKSPACE_REGISTRY.filter(...)` instead of a hardcoded array — cannot be
localized independently of the registry existing first.
- src/App.tsx (whole file, D)
- src/components/sections/AboutModal.tsx (whole file, D)
- src/config/appMetadata.ts (new, D)
- src/config/workspaceRegistry.ts (new, D)
- src/components/common/WorkspaceContextBanner.tsx (new, D)
- src/components/sections/SectionsAndPayrollWorkspace.tsx (new, D)
- src/lib/lucide-react-build-shim.ts (adds FlaskConical/Gauge/ImageOff/PlugZap icon re-exports consumed only by the new D components — D)

## E — Validators, QA, fixtures (Candidate 5)
- scripts/validate-v10-x2t-visible-string-inventory.ts (new)
- scripts/validate-v10-x2t-workspace-architecture-i18n.ts (new — contains
  `ENTRY_STATE_HASHES` keyed to the POST-Candidate-2 blob hashes, e.g.
  `domain.ts: 53ca5cc…` which is the staged (not HEAD) blob — confirms this
  validator is designed to run only after Candidate 2 lands. Needs the
  circularity fix described below before it can be trusted.)
- tests/phase15g2/x2t-accessibility-audit.run.ts (new)
- tests/phase15g2/x2t-bilingual-crawl-and-screenshots.run.ts (new)
- tests/phase15g2/x2t-state-invariance.run.ts (new — depends on Candidates 1–4 all being present; cannot be used to validate Candidate 2 in isolation, see Candidate 2 validation note below)
- tests/phase15g2/dre-capital-handoff.run.ts (modified — mostly Portuguese-locator updates dependent on Candidates 1+3; ALSO contains one unrelated line, `occSel.selectOption("pessimista")` → `"otimista"` and the matching assertion rename, which is a governance-correctness fix for the pre-existing OccupancyScenarioId enum — `pessimista` was never a valid Occupancy id — bundled into the same file/hunk, not separable without fragmenting a small test file. Flagged, not moved to its own category.)
- tests/phase15g2/qa-main.tsx (modified — same LocaleProvider-wrap pattern as main.tsx, but depends on BOTH Candidate 1 (LocaleProvider exists) and Candidate 4 (App no longer self-wraps) — sequence after both, not with Candidate 1)
- package.json (adds 4 npm script entries for the above — pure E, no dependency changes)

## F — Adapter/DRE integration (QUARANTINE — excluded from this branch)
- src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts (new)
- src/components/dreSimulator/dreScenarioWorkbook.ts — verified 100% F: all
  50 added lines (0 deleted) are new sheet-23/24 wiring that imports and
  calls the adapter; zero localization or workspace content present.

## G — Documentation (split by candidate, adapter section stays quarantined)
- IMPLEMENTATION.md — **not yet split**. Contains a prior draft's narrative
  claiming a "104/105 pass" validator result and an "isolated worktree"
  reproduction that, per this session's own git evidence (reflog, branch
  list, worktree list checked before any action), never existed prior to
  this session creating `v10-x2t-2b-reconstruction`. It also describes the
  `domain.ts` `intermediario`→`base` rename as "pre-existing... out of this
  gate's bounded scope to fix" — this is the exact circular framing the
  phase brief warns against; `domain.ts`'s rename is Candidate 2 content in
  THIS branch, authored by the ratified terminology decision, not an
  unrelated dirty file. None of the 104/105, 12/12, 13/13 check counts in
  this doc have been independently reproduced by this session. Do not carry
  them into any PASS claim until Candidate 5's validators actually run.

## Category H — empty.

## Governance cross-check performed
- Grepped all 72 diffs for `OccupancyScenarioId`/`conservador`: only hit in
  IMPLEMENTATION.md, the new i18n-architecture validator, and
  x2t-state-invariance.run.ts (all documentation/validation references, not
  a source-of-truth change) — confirms this branch does NOT touch the
  Enrollment/OccupancyScenarioId enum (conservador/base/otimista), only the
  separately-ratified PayrollScenario/ViabilityEnrollmentScenario rename
  (otimista/base/pessimista). The two migrations are independent, per the
  phase brief; nothing here infers one from the other.
