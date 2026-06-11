# Implementation Status — DRE Scenario Simulator & Capital Decision Metrics

> This file did not exist before Phase 14B.1 (2026-06-10). It is created here as
> the canonical implementation-sequence record for the DRE Scenario Simulator
> (`src/components/sections/DreScenarioSimulatorTab.tsx` and
> `src/components/dreSimulator/`) and the capital decision / investment
> feasibility layer that follows it.
>
> `src/features/rio-scenario-resilience/docs/implementationPlan.md` is a
> separate, earlier planning document that uses a different (Phase 1–14)
> numbering scheme and is superseded for this area. It has not been edited or
> renumbered as part of this file's creation.

## Required reading

Before starting any future Rio Scenario Simulator phase, read
[`src/features/rio-scenario-resilience/docs/projectCharter.md`](src/features/rio-scenario-resilience/docs/projectCharter.md).
It defines the project's purpose, scope, naming rules, source-of-truth
rules, and the mandatory phase-gate protocol (every phase report must end
with a "Questions for Luciana before proceeding" section, and no phase may
be presented as automatically next).

## Process rule for every future phase (binding)

Every future phase touching the DRE Scenario Simulator or the capital
decision layer must:

1. Inspect this file (`IMPLEMENTATION.md`) before starting substantial work.
2. Confirm the current phase and the expected next gate from the "Status"
   and "Corrected roadmap" sections below before proceeding.
3. If the phase changes the project's status, update this file (the
   relevant "Status" entry, and "Corrected roadmap" if the sequence
   changes) **before** writing the final report.
4. Never present a next phase as automatic — a next phase may be
   recommended, but it requires Luciana's confirmation via the phase-gate
   questions in `projectCharter.md` section 16.
5. End every phase report with a section titled exactly
   "Questions for Luciana before proceeding:".
6. Use the following status vocabulary precisely, and do not conflate them:
   - **implemented** — code/content exists and matches the spec.
   - **programmatically validated** — lint/build/scripted checks passed.
   - **visually approved** — Luciana has seen a screenshot, live preview, or
     local run and confirmed the UI is acceptable.
   - **manually approved** — Luciana has reviewed a non-UI artifact (e.g. an
     opened XLSX export) by hand and confirmed it.
   - **blocked** — work cannot proceed due to a missing dependency,
     decision, or environment limitation.
   - **waived by Luciana** — Luciana has explicitly agreed to skip a
     normally-required step.

## Naming rule (binding for all phases below)

- **DRE layer** = operating scenario simulator (enrollment, tuition revenue,
  cost lines, payroll/FOPAG, EBITDA). This is what Phases 14A–14B/14B.1
  implement.
- **Phase 15 layer** = capital decision / investment feasibility metrics
  (cash-flow bridge, CAPEX bridge, DCF, NPV/VPL, payback, discounted payback,
  investment recovery, Tier rules).
- DRE-only outputs must not be called "investment outputs."
- The first DRE EBITDA-positive year (`ebitdaPositiveYear` /
  "EBITDA-Positive Year (DRE EBITDA > 0)") must not be called "investment
  break-even" — that is a Phase 15 capital-decision concept and has not been
  computed.

## Status

- **Phase 14A — DRE Scenario Simulator UI scaffold**: complete.
  Decision-lever state and model-integration hook
  (`useDreScenarioSimulator.ts`), summary cards, annual table, EBITDA chart,
  org design panel, org design sensitivity panel.
- **Phase 14A.1 — Deterministic orchestration correction**: complete.
  `calculateDre()` is the single source of truth (it calls `calculateFopag()`
  internally); a second `calculateFopag()` call is retained only for the
  Org Design panel's raw FOPAG trace, and is reconciled against the DRE
  payroll rows via `reconcilePayroll()` (`payrollReconciliation`,
  tolerance `1e-6`). UI components consume `dreOutput`/`fopagOutput` from the
  hook only.
- **Phase 14B — XLSX export**: implemented.
  `dreScenarioWorkbook.ts` (13-tab workbook builder), `DreExportButton.tsx`,
  wired into `DreScenarioSimulatorTab.tsx`. Export is blocked if
  `payrollReconciliation.isReconciled` is `false`.
- **Phase 14B.1 — Implementation sequence correction & XLSX export QA gate**:
  complete. Governance correction (this file) plus export QA performed via a
  temporary script exercising the real export pipeline against the Phase 13F
  default fixture (`t1_g3 / intermediario / bp1_division_differentiated /
  balanced_experience`). Two label/column-only clarifications were made to
  `dreScenarioWorkbook.ts`:
  - "Org Design Roles" tab: added a note row explaining that its 39 data rows
    = 26 `baseline_role` + 13 extension/incremental records from
    `ORG_DESIGN_PAYROLL_ACTIVATION.records` (one row per source role; no
    scenario/year/payroll-record expansion).
  - "Scenario Sensitivity Matrix" tab: added a "Selected (current scenario)"
    column, reworded the scope note to state explicitly that this is a
    *partial* (org-design-only) sensitivity matrix and that the full
    108-combination matrix is deferred, and removed the
    "investment break-even" phrase from the EBITDA-positive-year column
    header.
- **Phase 14B-QA — Browser and XLSX export QA**: **partially complete**.
  Programmatic/script-based export and build validation passed (status:
  `programmatically_validated`). Interactive browser QA (clicking the export
  button in a running app, opening the resulting XLSX in Excel/Sheets/Numbers)
  has **not** been performed in this agent environment and remains pending.
  Programmatic validation does not constitute visual or manual UI approval.
- **Phase 14B-UI / Phase 14B-UI-IMPLEMENTATION — Executive DRE Scenario
  Cockpit (UI/IA)**: **implemented**, lint (`tsc --noEmit`) and
  `npm run build` passed. **Not visually approved** — no screenshot or
  live-preview evidence has been produced in this agent environment.
  - Files changed: `src/App.tsx` (tab subtitle only),
    `src/components/sections/DreScenarioSimulatorTab.tsx` (section ordering,
    export placement), `src/components/dreSimulator/DreScenarioContextBanner.tsx`
    (new), `src/components/dreSimulator/DreScopeBoundaryPanel.tsx` (new),
    `src/components/dreSimulator/dreLeverLabels.ts` (new, shared label maps),
    `DreLeverPanel.tsx`, `DreSummaryCards.tsx`, `DreEbitdaChart.tsx`,
    `DreAnnualTable.tsx`, `OrgDesignPanel.tsx`,
    `OrgDesignSensitivityPanel.tsx`, `DreExportButton.tsx` (added a
    presentational `compact` prop only).
  - Scope of change was strictly limited to: layout hierarchy, labels,
    explanatory text, trust/status badges, section ordering, and export
    placement (including a new compact secondary export entry point).
  - **No formulas, calculation engines, source values, scenario IDs, or the
    raw Excel workbook were changed.** `useDreScenarioSimulator.ts` and all
    `dreEngine*`/`fopagEngine*`/`dreLineItemMap*`/model/contract files were
    not touched. The one new derived display value (EBITDA-Positive Year on
    the summary cards) reuses the existing
    `RECEITA_PROJECTION_YEARS.find(y => byYear[y].ebitda > 0)` display
    pattern already used by the EBITDA chart and org-design sensitivity rows
    — it is not a new calculation.
  - CAPEX and all Phase 15 capital-decision metrics (cash-flow, CAPEX bridge,
    DCF, NPV/VPL, payback, discounted payback, investment recovery, Tier)
    remain excluded from active UI outputs; they appear only as named
    exclusions in the new scope/trust panel and export helper text, using
    non-"break-even"/non-"payback" language for the EBITDA-positive year.
  - Phase 14B-QA's programmatic export/build validation (above) passed
    earlier and remains valid, but it validates calculation/export integrity,
    not UI visual quality — it does **not** substitute for visual UI
    approval.

## Phase 14B-UI is implemented but visually unapproved

Phase 14B-UI-IMPLEMENTATION changed the DRE Scenario Simulator's layout,
labels, trust/status badges, section order, and export placement, and passed
lint/build. **It has not been visually reviewed** — no screenshots or live
preview have been produced or shown to Luciana. UI/IA implementation is
considered complete enough for visual review, but:

- Visual approval remains pending because no screenshots or live preview were
  produced in the agent environment.
- Luciana cannot be asked to approve UI quality without visible evidence
  (screenshots, a live preview, or a locally reviewable route such as
  `npm run dev` + the "DRE Scenario Simulator" tab).
- **Phase 14B-QA is not marked fully complete** (browser/manual XLSX-open QA
  is still outstanding, independent of the UI visual question).
- **Phase 15A is not cleared.** Phase 15A may not begin until Phase 14 UI
  visual approval and the remaining Phase 14B-QA browser/manual steps are
  explicitly cleared or waived by Luciana.

**The next required gate is Phase 14B-UI-VISUAL** (visual evidence pack /
live preview review), not Phase 15A.

## Org Design role-progression semantics corrected (UI/display only) — SUPERSEDED

> **Superseded by "Org Design role-progression business semantics — final
> correction" below.** The "Added in Minimum Experience" grouping described
> in this section (10 roles, derived mechanically from `roleSourceType !==
> "baseline_role" && activeIn === ALL`) was itself found to be wrong on
> business grounds and was replaced by Luciana's ratified business grouping.
> This section is retained for history only.

Phases 14B-UI-ORG-DESIGN-SEMANTICS-FIX, 14B-UI-ORG-DESIGN-ROLE-PROGRESSION,
and 14B-UI-ORG-DESIGN-MINIMUM-ADDITIONS-FIX corrected how the "Org Design
role progression" section of `OrgDesignPanel.tsx` groups and labels the 39
records in `ORG_DESIGN_PAYROLL_ACTIVATION.records`. This was a **UI/display
grouping correction only** — no source data, `activeIn` values,
`roleSourceType` values, payroll/FOPAG logic, DRE logic, formulas, scenario
IDs, or Excel files were changed.

The corrected role grouping (39 records total):

- **Baseline / core structure** — 25 roles (`roleSourceType ===
  "baseline_role"`, active in all three org-design options).
- **Added in Minimum Experience** — 10 roles (non-baseline roles active in
  all three org-design options, i.e. introduced at Minimum and carried
  forward into Balanced and Premium). This group includes **Maker Space
  Assistant**, **Events Assistant**, and **Language Acquisition Coach** —
  these three were previously mislabeled as "core structure across options"
  and are now correctly classified as "Added in Minimum Experience."
- **Added in Balanced Experience** — 2 roles (active in Balanced and Premium,
  not Minimum).
- **Added in Premium Experience** — 1 role (active in Premium only).
- **Excluded/inactive in current v1** — 1 role (`hs_pool`, `activeIn` empty,
  `roleInclusionStatus: "excluded_from_v1"`).

The "Role structure represented in selected option" block remains, shown
separately below the 4-column grouping grid and **collapsed by default**
(per Luciana's visual review, this detail is useful audit/supporting
information but should not dominate the section).

Luciana reviewed this correction locally and confirmed (2026-06-10):
the new grouping, the "Baseline / core structure" and "Added in Minimum
Experience" labels, and the reclassification of the three named roles are
correct and acceptable. **Phase 14B-UI-VISUAL remains pending** — this
correction does not constitute final visual approval of the broader DRE
Scenario Simulator UI, and **Phase 15A remains not cleared**. All changes
from these phases remain unstaged; no commit has been prepared.

## Org Design role-progression business semantics — final correction (ratified)

Phase 14B-UI-ORG-DESIGN-ROLE-PROGRESSION-BUSINESS-CORRECTION further
corrected the "Org Design role progression" section of `OrgDesignPanel.tsx`.
This is a **UI/display-semantics correction only** — no source data,
`activeIn` values, `roleSourceType` values, payroll/FOPAG logic, DRE logic,
formulas, scenario IDs, or Excel files were changed.

**This correction overrides and supersedes** the prior mechanical rule
(non-baseline `roleSourceType` + `activeIn === ALL` ⇒ "Added in Minimum
Experience"). `activeIn` alone is **not sufficient** to determine
board-facing "added" semantics: several `activeIn === ALL` non-baseline
records reuse an existing baseline payroll role (`payrollRoleId` already
present in the baseline_role set) and represent leadership/support structure
already accounted for, not new positions. Other `activeIn === ALL`
non-baseline records are tied to grade-span opening/progression assumptions
rather than being immediate Minimum Experience additions.

The final ratified role grouping (39 records total):

- **Already accounted for / baseline structure** — 30 roles: the 25
  `roleSourceType === "baseline_role"` records, plus 5 records that reuse an
  existing baseline `payrollRoleId` and represent already-accounted-for
  leadership/support structure: **Librarian** (→ Inspirationeer payroll),
  **Security / Clerks** (→ Clerk (Portaria) payroll), **Early Years
  Principal** (→ EY Coordinator payroll), **Lower School Principal** (→ LS
  Coordinator payroll), and **After School Coordinator** (→ After School
  Educator payroll). `hs_pool` (excluded from v1) is not included in this
  count.
- **Added in Minimum Experience** — 3 roles: **Events Assistant**, **Maker
  Space Assistant**, **Language Acquisition Coach**. (These are the only
  roles previously confirmed in 14B-UI-ORG-DESIGN-MINIMUM-ADDITIONS-FIX that
  remain classified as Minimum additions; the other 7 roles formerly grouped
  under "Added in Minimum Experience" are reclassified above or below.)
- **Added in Balanced Experience** — 2 roles: **Personalized Learning
  Associate Educator**, **Security Coordinator** (unchanged from the prior
  phase).
- **Added in Premium Experience** — 1 role: **Curriculum and Assessment
  Designer** (unchanged from the prior phase).
- **Progression-dependent roles** — 2 roles: **Middle School Educators**,
  **High School Educators**. Shown in their own panel (not hidden inside the
  selected-option structure only) with the framing: tied to grade-span
  opening/progression assumptions, not immediate Minimum Experience
  additions.
- **Excluded/inactive in current v1** — 1 role (`hs_pool`, unchanged).

The "Already accounted for / baseline structure" panel remains visible (per
Luciana: visually secondary is acceptable, but it must remain visible so the
board does not read these roles as new additions). "Progression-dependent
roles" remains its own visible panel for the same reason. The "Role structure
represented in selected option" block remains separate and collapsed by
default.

Luciana reviewed and ratified this correction (2026-06-10): the grouping,
counts, and the explicit treatment of Middle School Educators / High School
Educators as progression-dependent (not Minimum additions) are correct.

**Phase 14B-UI-VISUAL remains pending** — Luciana has indicated the Org
Design section is now ready for final visual review but has not yet given
final visual approval of the local UI state. **Phase 15A remains not
cleared**. All changes from this phase remain unstaged; no commit has been
prepared.

## Phase 14B is implemented but QA-pending

Phase 14B (XLSX export) was implemented before the planned browser-based QA
gate. This is not, by itself, a code defect — Phase 14B.1's automated/script
QA passed (13 tabs present, DRE formulas valid, engine-derived rows are
values not formulas, FOPAG/DRE reconciliation rows return `OK`, no
capital-decision-metric terms introduced, workbook learner counts sourced
from `dreOutput`). However, **interactive browser QA** (clicking the export
button in a running app, opening the resulting file in Excel/Sheets) has not
yet been performed and remains a prerequisite before Phase 14B is considered
fully closed.

**Phase 14C (full 108-combination export) is NOT automatically next.**

## Corrected roadmap

- **Phase 14B-QA** — Browser and XLSX export QA (interactive, in a running
  app + opening the exported file). Partially complete — programmatic
  validation passed, interactive/manual steps pending.
- **Phase 14B-UI-VISUAL** — Visual evidence pack / live preview review of the
  Phase 14B-UI-IMPLEMENTATION cockpit, for Luciana's visual approval.
- **Phase 15A** — Capital decision metrics: source audit and architecture.
  Not cleared until Phase 14B-QA's remaining steps and Phase 14B-UI-VISUAL
  are explicitly cleared or waived by Luciana.
- **Phase 15B** — Cash-flow bridge.
- **Phase 15C** — CAPEX bridge.
- **Phase 15D** — DCF / NPV / VPL.
- **Phase 15E** — Payback, discounted payback, investment recovery, Tier
  rules.
- **Phase 15F** — UI integration for capital decision metrics.
- **Phase 15G** — XLSX export extension for DRE + capital decision metrics.

Phase 14C (full 108-combination DRE export matrix) is deferred and is only
prioritized ahead of Phase 15A if explicitly requested.

## Phase 14B-UI-VISUAL — approved (automated browser QA)

Phase 14B-UI-AUTOMATED-BROWSER-QA ran a local Playwright browser QA pass
against `npm run dev` (`http://localhost:3001/`), DRE Scenario Simulator tab,
and produced a screenshot/evidence pack (`qa-artifacts/phase14b-ui/`,
14 screenshots covering checklist sections A–N, an `index.html` evidence
index, and a `README.md` summary). Phase 14B-UI-QA-EVIDENCE-INDEX indexed this
pack for review.

Luciana reviewed the report (without needing to open the local evidence index)
and approved Phase 14B-UI-VISUAL on this basis (2026-06-10):

- **Automated browser UI QA (sections A–N): PASS.** Title, subtitle, Operating
  Read strip, scenario levers (Opening Package / Occupancy / Tuition / Org
  Design, no CAPEX selector), summary cards, EBITDA trajectory chart, Scope &
  Source Boundary (Phase 14 included / Phase 15 excluded / source governance),
  Org Design Operating Model, Org Design role progression (ratified
  30/3/2/1/2 grouping with exact role names), Org Design Sensitivity, annual
  DRE table (collapsed/expanded), and a 900×900 narrow-viewport check all
  verified.
- **Selector interaction QA: PASS**, with the note that the automated run
  changed the Org Design and Opening Package selectors together rather than
  isolating and re-verifying every selector one-by-one. The run confirmed the
  selected-scenario text, EBITDA chart, and Org Design Operating Model panel
  all updated correctly afterward, with no console errors (only a pre-existing,
  non-blocking Recharts width/height warning during headless pre-layout
  render).
- **Browser XLSX export: PASS.** Clicking "Export XLSX" in the running app
  produced a real downloaded `.xlsx` file with a filename matching the
  expected scenario/timestamp pattern.
- **Programmatic XLSX parse: PASS.** The downloaded workbook was opened with
  the project's `xlsx` package: 13 tabs present in order, README states the
  Phase 15 exclusion list, and FOPAG/DRE payroll reconciliation reports
  `isReconciled: true`. No CAPEX/cash-flow/DCF/NPV/VPL/payback/discounted
  payback/Tier terms appear as implemented outputs (only in the README's
  exclusion list).
- **Manual Excel/Numbers/LibreOffice opening: WAIVED by Luciana for this
  checkpoint** (2026-06-10). Browser export and programmatic XLSX parse both
  passed; no spreadsheet application is available in this agent environment.
  This waiver applies to this checkpoint only and does not waive manual
  opening for any future export-format changes.

The QA artifacts in `qa-artifacts/phase14b-ui/` (screenshots, downloaded
XLSX, `qa-report.json`, `index.html`, `README.md`, helper scripts, and text
dumps) were temporary review artifacts. Per Luciana's instruction
(2026-06-10), they have been **deleted** after recording this outcome and were
never staged or committed.

**Phase 15A remains not cleared** until a Phase 14B commit plan is approved by
Luciana and the Phase 14B checkpoint is committed (or otherwise explicitly
closed).

## Corrected roadmap (updated)

- **Phase 14B-QA** — complete (automated/programmatic validation passed;
  interactive browser export PASS; programmatic XLSX parse PASS; manual
  spreadsheet-app opening waived by Luciana for this checkpoint).
- **Phase 14B-UI-VISUAL** — approved by Luciana (above). Complete.
- **Phase 14B-UI-QA-CLOSEOUT-AND-COMMIT-PLAN** — complete. Phase 14B was
  committed as `30e5570` ("Complete Phase 14B DRE simulator UI and export
  QA"), 60 files.
- **Phase 15A** — not started. Blocked pending Phase 14D (below).
- **Phase 15B–15G** — unchanged, as listed above.

## Phase 14C-REPO-HYGIENE — TypeScript baseline quarantine

During Phase 14B-COMMIT-MANIFEST-CORRECTION staged-only validation,
`npm run lint` (`tsc --noEmit`) showed **6 pre-existing errors on a
HEAD-only checkout**, unrelated to the Phase 14B commit (`30e5570`).

- **Root cause**: 3 tracked scaffold files, committed in earlier phases
  (`142a05d` and `537e659`) —
  `src/features/rio-scenario-resilience/components/DecisionLevers/OrgDesignLever.tsx`,
  `src/features/rio-scenario-resilience/data/index.ts`, and
  `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts` —
  import 6 sibling modules (`leverTypes`, `dataStatus`, `openingGrades`,
  `outputStatus`, `tuitionArchitecture`,
  `scenarioCalculationBoundaryContract`) that exist only as **untracked**
  files on disk. On a clean checkout (HEAD only, no untracked files), those
  imports fail to resolve.
- **Reachability**: none of the 3 importing files are reachable from the
  committed `App.tsx` / Phase 14B DRE simulator path — they are orphaned
  tracked scaffold left over from earlier phases.
- **Fix chosen**: a temporary quarantine via `tsconfig.json` `"exclude"`,
  listing exactly the 3 orphaned tracked files above. This restores
  `tsc --noEmit` to 0 errors on a HEAD-only checkout and `npm run build`
  continues to pass. No source files, formulas, DRE/EBITDA/payroll/tuition/
  enrollment/org-design calculation logic, or Phase 14B UI/export behavior
  were changed.
- **This is not the final cleanup.** The 3 quarantined files and their 6
  missing untracked dependencies remain on disk, unresolved. **Phase
  14D-UNTRACKED-SURFACE-AUDIT remains required** to classify the orphaned
  scaffold files and their missing dependencies as delete / keep / defer /
  Phase 15 candidate, and to decide whether they should be deleted,
  committed, deferred, or reconnected.
- **Phase 15A remains not started**, blocked until Phase 14D is complete.

## Phase 14D-UNTRACKED-SURFACE-AUDIT — audit complete, safe cleanup executed

A full audit of the working tree's 3 modified tracked files and 184
untracked files was completed and reviewed by Luciana (2026-06-11).
Decisions:

- **Safe deletion (executed)**: the 3 root-level one-off Phase 12
  validation scripts — `_phase12m_validate.ts`, `_phase12n_validate.ts`,
  `_phase12n_registry_count.ts` — were untracked, not part of the build,
  and superseded by the permanent (untracked) `*Validation.ts` modules
  they exercised. Deleted from disk.
- **C2 (CAPEX/payback engine files)** — preserved as Phase 15 candidates
  (`capexEngine.ts`, `capexEngineContract.ts`, `capexEngineValidation.ts`,
  `capexEngineValidationContract.ts`, `capexCalculationDesign.ts`,
  `capexOptionSource.ts`, `capexScheduleSourceData.ts`,
  `capexScheduleSourceDataContract.ts`, `opexCapexAdapterContract.ts`).
  **Not committed.**
- **C3 (board/governance architecture contracts)** — preserved as Phase
  15A pre-reading candidates (`boardCalculationReadinessContract.ts`,
  `boardResilienceCalculationArchitectureContract.ts`,
  `calculationReadiness.ts`, `contracts.ts`, `financialOutputContract.ts`,
  `governanceThresholdContract.ts`, `scenarioCalculationBoundaryContract.ts`).
  **Not committed.** Phase 15A should review these before designing from
  scratch.
- **C5 (DecisionLevers / ScenarioFlow / ScenarioOutputs UI scaffold)** —
  preserved as a Phase 15 UI candidate, including the top-level
  `RioScenarioResiliencePreview.tsx` and `rio-scenario-resilience/index.ts`
  barrels. **Not committed, not wired up.**
- **Group B lever/data files** tied to the Phase 14C-quarantined scaffold
  (`leverTypes.ts`, `dataStatus.ts`, `openingGrades.ts`, `outputStatus.ts`,
  `tuitionArchitecture.ts`, `OrgDesignLever.tsx`, `data/index.ts`) —
  preserved as Phase 15 candidates. **Not committed, remain quarantined
  from `tsc` per Phase 14C.**
- `capexCalculationReadinessAudit.md` and `scenarioCalculationBoundaryDesign.md`
  — flagged as directly relevant Phase 15A pre-reading.
- **Raw workbooks and extraction files** under
  `src/features/rio-scenario-resilience/source/` — preserved; **no
  deletion approved**.
- **`src/components/sections/HighSchoolTab.tsx`** (modified, tracked) —
  confirmed unrelated to the Rio simulator track (separate High School
  Load Logic UI work). Must **not** be included in any Rio simulator
  commit. Not reverted, not deleted — pending separate review on its own
  track.
- **Phase 15A remains blocked** pending: (1) the governance review of
  `sourceOfTruthMap.ts` and `inputReadinessRegistry.ts` above, and (2) a
  decision on the `HighSchoolTab.tsx` track. Once both are resolved,
  Phase 15A should begin by reviewing the C3 board/governance contracts
  and the two flagged Phase 15A pre-reading docs — not from a blank slate.

## Phase 14E-GOVERNANCE-FILE-REVIEW / RESOLUTION — OPEX governance correction

- **`src/features/rio-scenario-resilience/data/sourceOfTruthMap.ts`** —
  the `opex` ("additional baseline OPEX") entry was reviewed and approved
  for commit. The correction marks `currentStatus` as
  `missing_input_data`, sets `shouldReuseExistingLogic: false`, and
  records that the viability baseline OPEX values
  (`BASE_FIXED_OPEX_2028` etc.) are a structural reference only and must
  not become Rio simulator OPEX truth without independent Finance
  validation. The correction cites only **committed** governance sources:
  `inputReadinessRegistry.ts` (HEAD — `validated_baseline_opex_inputs`
  status=`missing_value`, sourceOwnership=`unmapped`) and
  `projectCharter.md` (missing data must be represented explicitly as
  missing, not inferred). An earlier draft of this entry cited an
  untracked design doc (`docs/opexCapexAdapterDesign.md` §8) and an
  untracked contract (`opexCapexAdapterContract.ts`); those citations were
  removed before commit.
- **`src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts`**
  — the working-tree diff to this file was reviewed and judged
  **non-authoritative and unsafe to commit as-is**: the file remained part
  of the Phase 14C TypeScript quarantine (orphaned scaffold, not reachable
  from `App.tsx`, importing the untracked `scenarioCalculationBoundaryContract.ts`),
  and the diff narrated a large, unreconciled "Phase 8A–13G" history
  (including CAPEX-engine and decision-lever-catalog readiness claims that
  fall inside the Phase 15 boundary) not reflected in this ledger's
  committed phase history. The diff was preserved externally as
  `/tmp/inputReadinessRegistry_phase14e_draft.patch` and the file was
  reverted to HEAD. It remains quarantined per Phase 14C, unchanged from
  its prior committed state.
- A future, narrower, non-quarantined readiness-ledger module may be
  scoped as its own planned phase if needed.
- **Phase 15A remains blocked** until this commit (the
  `sourceOfTruthMap.ts` OPEX correction) is completed. After this commit,
  Phase 15A may begin only from committed governance sources and the
  explicit Phase 15A pre-reading list above — not from the reverted
  `inputReadinessRegistry.ts` draft.
