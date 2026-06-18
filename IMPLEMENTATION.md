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

## Phase 15A.2 / 15A.3 — Workbook audit and architecture update (committed as `1008925`)

- **Phase 15A.2** audited the Finance workbook `Concept Rio - 20 anos - Org
  BU - Apresentação vBU v8 (2).xlsx` (read-only, not edited) and found that it
  already implements a complete capital-decision methodology (FCO bridge,
  CAPEX phasing + Sustain, tax/NOL, WACC, perpetuity, DCF/VPL/TIR, payback).
- **Phase 15A.3** updated
  `src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md`
  with these findings (§8A) and reframed the Phase 15B blocker from "no
  methodology exists" to "Finance must confirm which workbook
  methodology/treatment applies to the simulator's confirmed R$90M/R$100M
  CAPEX options" (§9, §15).
- Both committed as `1008925` ("Update Phase 15A architecture with workbook
  audit findings").
- **Phase 15A.2/15A.3 workbook audit complete.**

## Phase 15A.4-FINANCE-METHODOLOGY-RATIFICATION

The remaining Finance methodology questions from
`phase15CapitalDecisionArchitecture.md` §15 (groups A–G, 21 questions) have
been answered by Luciana and recorded as ratified Phase 15 methodology in
that document's new §16 (Ratified Finance methodology) and §17 (Phase 15B
implementation boundary).

### Ratified decisions (summary; full detail in `phase15CapitalDecisionArchitecture.md` §16)

1. **Workbook source authority** — the Concept Rio 20 anos workbook is the
   methodological source for Phase 15. Only **visible** sheets are used for
   methodology, calculations, assumptions, WACC, indicators, and scenario
   outputs; **all hidden sheets are excluded**. WACC and other financial
   indicators come from the **drivers section at the top of the visible
   `PnL` sheet**. The visible live `PnL` viability block (rows 273–308 +
   perpetuity block) is the canonical methodology source unless a later
   explicit Finance decision supersedes it.
2. **CAPEX options** — remain **R$90M and R$100M only**, not reopened.
   Workbook figures (R$100.7M, R$65.3M, R$54.3M, R$44.3M, or other legacy
   scenario totals) do not become simulator CAPEX options.
3. **CAPEX treatment** — for both R$90M and R$100M: apply the live `PnL`
   CAPEX phasing methodology (70/20/10, scaled to the option amount) and
   include Sustain CAPEX as % of ROL. The separate `CAPEX` sheet is
   reference-only, not a source of option amounts or schedules. No
   recurring/post-opening CAPEX beyond Sustain unless a later approved
   schedule is provided. CAPEX remains excluded from EBITDA, a negative
   cash-flow outflow, applied after FCO.
4. **Operating cash-flow bridge** — the simulator uses the workbook's **full
   FCO bridge** (EBITDA → Depreciação/Amortização → EBIT → Receita/Despesa
   Financeira → EBT → IR/CSLL (34% + NOL/"Recuperação de Prejuízos") → Lucro
   Líquido → depreciação + despesa financeira add-backs → FCO → CAPEX → cash
   flow after CAPEX), **not** an EBITDA-only proxy. The financial-result step
   is preserved even though it currently evaluates to 0 in the live model.
5. **Working capital** — explicitly **out of scope**. Model scope ends at
   FCO, plus CAPEX, and cash flow after CAPEX. This scope is **aligned with
   the company CFO**.
6. **WACC and discount drivers** — from the visible `PnL` drivers section:
   **13.25%** for 2027/pre-ops, **12%** for 2028 onward. The 14.53% WACC
   found in hidden/orphaned sheets is **not used**. Phase 15B must source
   these values from a single canonical driver source, not hardcode them
   independently in multiple places.
7. **Perpetuity / terminal value** — perpetuity growth rate **3.5%**,
   perpetuity WACC = WACC of the final projection year (12%), using the
   workbook's Gordon Growth terminal-value formula, included in both VPL and
   TIR. No alternative perpetuity method.
8. **Payback** — required metric is **discounted payback**, based on
   discounted cash flow after CAPEX (FCO + CAPEX). "20+" means discounted
   payback is not achieved within the 20-year projection horizon — not an
   error, and not interpreted as payback in year 20. UI/export wording must
   explain this (e.g. "Payback not achieved within the 20-year projection
   horizon"), while preserving "20+" as a compact workbook-compatible value.
   No separate simple-payback metric unless Luciana later requests one.
9. **Investment decision rule** — no Tier taxonomy is created. Governing
   reference: **TIR must exceed WACC**. Scenario comparison uses the
   TIR-WACC spread (higher positive spread = stronger) and discounted
   payback (lower = preferable). VPL remains a reported output with no
   invented threshold.

### Phase 15B gate status

- **Phase 15B is no longer blocked by missing Finance methodology
  confirmation.**
- **Phase 15B may begin after this documentation update
  (`phase15CapitalDecisionArchitecture.md` §16/§17 and this section) is
  reviewed and committed.**
- Phase 15B implements the ratified workbook methodology for the R$90M/R$100M
  CAPEX options: canonical capital-decision source contracts; R$90M/R$100M
  CAPEX schedules using live `PnL` phasing; Sustain CAPEX; FCO bridge; cash
  flow after CAPEX; source provenance and validation against workbook
  formulas.
- Phase 15B does **not** yet implement: final UI integration, board
  interpretation UI, XLSX export expansion, or any Tier taxonomy. Those
  remain in later phases (15C–15G) per the sequencing in
  `phase15CapitalDecisionArchitecture.md` §12.

### Gate review

- Phase 15A.2 workbook audit: **complete**.
- Phase 15A.3 workbook findings: **committed as `1008925`**.
- Phase 15A.4 Finance methodology ratification: **documented in this section
  and in `phase15CapitalDecisionArchitecture.md` §16/§17, not yet
  committed**.
- Phase 15B: **eligible to begin only after Phase 15A.4 documentation
  approval and commit.**
- No Phase 15 app implementation has been started (no cash-flow, CAPEX,
  DCF, VPL, TIR, payback, or Tier calculations; no UI changes; no `App.tsx`
  wiring).
- The source workbook was not edited.
- `HighSchoolTab.tsx` remains separate, non-Rio work (see Phase 14E history
  above) and was not touched by this update.

## Phase 15B-FCO-CAPEX-BRIDGE-IMPLEMENTATION

Implements the capital-decision calculation bridge for `pre_ops`
(sourceYear 2027) plus the committed 2028-2047 operating horizon, for both
ratified CAPEX options (`capex_90m_brl` = R$90M, `capex_100m_brl` = R$100M):

```
EBITDA -> D&A -> EBIT -> financial result -> EBT -> tax/NOL -> net income
-> add-backs -> FCO -> CAPEX -> cash flow after CAPEX
```

per `phase15CapitalDecisionArchitecture.md` §16/§17, Resolutions 1-3
(2026-06-12 correction to the Phase 15B.1 gate recommendation).

### Files created (all under `src/features/rio-scenario-resilience/model/`)

- `capitalDecisionEngineContract.ts` — result shape: `CapitalDecisionResult`,
  `CapitalDecisionPeriodResult` (21 periods: `pre_ops` + 2028-2047),
  `CapitalDecisionSourceProvenance` (incl. `nolMethodLabel:
  "workbook_parity_nol_method"`), `CapitalDecisionValidationStatus`,
  `CapitalDecisionExplicitExclusions`, `CapitalDecisionEngineInput`. Also
  defines the pure bridge-core types `CapitalDecisionBridgeCoreInput` /
  `CapitalDecisionBridgeCoreOutput`. Also defines the readiness/parity status
  types corrected in Phase 15B.2 below
  (`CapitalDecisionCalculationReadinessStatus`,
  `CapitalDecisionBridgeFormulaParityStatus`,
  `CapitalDecisionIntegratedBaselineParityStatus`).
- `capexScheduleEngineContract.ts` / `capexScheduleEngine.ts` — Expansion
  CAPEX phasing (70% `pre_ops` / 20% 2030 / 10% 2031, scaled to the selected
  option total) and Sustain CAPEX (`SustainPct(year) x ROL(year)`,
  2%/2.5%/3%/3.5%/4% in successive 4-year bands 2028-2047), per the live
  `PnL!292/293` formulas. Reuses `CAPEX_KNOWN_OPTION_AMOUNTS` from
  `capexEngineValidationContract.ts` (90,000,000 / 100,000,000) — no new
  workbook selector, per Resolution 3.
- `ppeDepreciationEngineContract.ts` / `ppeDepreciationEngine.ts` — ports the
  visible `PPE` sheet methodology: existing/pre-ops base
  (`pre_ops expansion CAPEX / 15`, 2028-2042, zero residual) plus, for each
  year's total CAPEX 2028-2047, a new 10-year vintage with half-year
  convention (1/20 in the vintage year, 1/10 for the next 9 years, 1/20 in
  year+10). D&A is recalculated dynamically from each option's own CAPEX
  schedule (not a fixed table), satisfying Resolution 1.
- `nolTaxEngineContract.ts` / `nolTaxEngine.ts` — exact port of the visible
  `Recuperação de Prejuízos` recurrence (`workbook_parity_nol_method`): 34%
  direct tax on positive EBT, negative EBT accumulates as NOL, 30% annual
  compensation limit (taxable base reduced to 70% when NOL is available),
  all-or-nothing exhaustion in the transition year (no pro-ration). Header
  comment documents this is workbook-formula parity, not an independent
  interpretation of Brazilian tax law, per the Tax/NOL caution.
- `preOpsOperatingResultSourceDataContract.ts` /
  `preOpsOperatingResultSourceData.ts` — fixed `pre_ops` (sourceYear 2027)
  operating literals per Resolution 2: EBITDA = -17,667,521.16 BRL, D&A = 0,
  financial result = 0, provenance to `PnL!273`/Pre-Ops sheet, not
  scenario-derived.
- `capitalDecisionEngine.ts` — orchestrator `calculateCapitalDecisionBridge()`
  (calls `calculateDre()` once, read-only, for 2028-2047 EBITDA/ROL; uses the
  fixed pre-ops literals for `pre_ops`; wires CAPEX schedule, PPE
  depreciation, and NOL/tax into the full bridge) plus the pure
  `computeCapitalDecisionBridgeCore()` (same bridge, EBITDA/ROL supplied by
  the caller — used by the validation module, see below).
- `capitalDecisionR100mParitySourceData.ts` — R$100M workbook-cached fixture
  (read-only `data_only` extraction, no `.save()`) for all 21 periods:
  `PnL!236` (ROL), `PnL!273` (EBITDA), `PnL!291/292/293` (CAPEX
  total/expansion/sustain), `PnL!275` (D&A), `PnL!278-282` (EBT/tax/NOL
  recovery/tax total/net income), `PnL!290/295/296` (FCO / FCO+CAPEX /
  cumulative), `'Recuperação de Prejuízos'!5` (accumulated NOL).
- `capitalDecisionEngineValidationContract.ts` /
  `capitalDecisionEngineValidation.ts` — 25-check validation report (see
  below).

### Files edited

- `IMPLEMENTATION.md` (this section).

No other files were edited. `App.tsx` and `HighSchoolTab.tsx` were not
touched. No UI, DCF/VPL/NPV/TIR/perpetuity/discounted payback/Tier
calculations were added (Phase 15C/15D, out of scope).

### Candidate files reused / not duplicated

- `CapexOptionId` (`capexOptionSourceContract.ts`) and
  `CAPEX_KNOWN_OPTION_AMOUNTS` (`capexEngineValidationContract.ts`) are
  reused as-is. `capexEngineValidationContract.ts` (Phase 10C.1, 76 lines:
  `CapexEngineValidationRow`/`CapexEngineValidationMatrixOutput` types plus
  `CAPEX_KNOWN_OPTION_AMOUNTS`/`CAPEX_KNOWN_PRE_OPS_POSITIVE`/reference
  constants) is a direct compile-time dependency of `capexScheduleEngine.ts`
  and is included in the Phase 15B commit manifest for that reason (Phase
  15B.2 manifest reconciliation, below) — it was not previously committed by
  any earlier phase.
- `capexEngine.ts` / `capexScheduleSourceData.ts` (Phase 10C.1, pre-ops
  36.37M/40.41M phasing) are superseded by the new
  `capexScheduleEngine.ts` for Phase 15B purposes and were left untouched
  (no naming collisions; not deleted, since removal was not requested).

### Source-provenance handling

- 2028-2047 EBITDA and ROL: read-only output of `calculateDre()` (committed
  operating engine; not recalculated).
- `pre_ops` EBITDA: fixed literal from the visible PnL/Pre-Ops sheets
  (Resolution 2), not scenario-derived.
- CAPEX schedule, PPE depreciation, NOL/tax recurrence: ported from the
  visible `PnL`/`PPE`/`Recuperação de Prejuízos` sheets per Resolution 1 and
  the Tax/NOL caution; labeled `workbook_parity_nol_method`.
- Financial result (`PnL!277`, Cap1-Cap8) is currently 0 for all periods, per
  the live workbook.
- Hidden workbook sheets were not used.

### Workbook-baseline parity note (resolved by Phase 15B.2 below)

While implementing the validation, `calculateDre()`'s 2028-2047
`receita_operacional_liquida` / `ebitda` for the canonical validation
scenario (`t1_g3` / `intermediario` / `bp1_division_differentiated` /
`balanced_experience`) were found not to numerically match the workbook's
cached `PnL!236`/`PnL!273` values (e.g. 2028 EBITDA: engine = -6,957,011.04
vs. workbook = -4,233,821.32). **Phase 15B.2 traced this to a scenario
mismatch, not a formula defect**: the workbook baseline has 246 learners in
2028 (`PnL!221`) while the canonical simulator fixture has 228 — an
enrollment/scenario-input difference upstream of every revenue and EBITDA
formula. There is **no active Phase 13 formula blocker** established by this
comparison (see Phase 15B.2 §7/§8 for the full trace and classification).

**Consequence for Phase 15B**: the bridge FORMULAS (CAPEX schedule, PPE
depreciation, NOL/tax recurrence, FCO, cash flow after CAPEX) are validated
directly against the workbook's cached `PnL!291-296` bridge by feeding them
the workbook's own cached `PnL!236`/`PnL!273` EBITDA/ROL
(`computeCapitalDecisionBridgeCore()` in `capitalDecisionEngine.ts`,
exercised by `capitalDecisionEngineValidation.ts`'s `r100m_*`/`r90m_*`
checks) — **all 25/25 checks pass**, tolerance 0.01 BRL.

The **integrated** production output of `calculateCapitalDecisionBridge()`
(which feeds the bridge with `calculateDre()`'s current 2028-2047 EBITDA/ROL,
as required — "Do not mutate or recalculate upstream Receita, FOPAG, or
EBITDA") does not numerically match the workbook's cached `PnL!291-296`
bridge for 2028-2047 for the canonical (non-baseline) validation scenario.
For example, 2047 cumulative cash flow after CAPEX:

| | Workbook-cached (R$100M) | Production / calculateDre-fed (R$100M) | Production / calculateDre-fed (R$90M) |
|---|---|---|---|
| 2047 cumulative FCO after CAPEX | 256,332,471.98 | 512,619,141.92 | 515,608,615.43 |

This divergence is expected: different scenario inputs (228 vs. 246 learners
in 2028, and the resulting trajectories) produce different EBITDA/ROL, and
therefore a different FCO/CAPEX bridge — not a Phase 15B bridge-formula
defect (the bridge formulas themselves are workbook-exact, per the 25/25
isolated-input validation) and not a Receita/FOPAG/DRE formula defect (Phase
15B.2 §7/§8). `calculateCapitalDecisionBridge()`'s
`integratedBaselineParityStatus`/`integratedBaselineParityNote` (Phase 15B.2)
report this distinction per-call from live values.

### `calculationReadiness` (corrected by Phase 15B.2 below)

`calculateCapitalDecisionBridge()`'s `calculationReadiness` no longer derives
from `inputReadinessRegistry.ts`'s repo-wide `CALCULATION_CAN_BEGIN` flag
(which tracks unrelated payroll/OPEX/CAPEX/governance layers). It is now
`"structurally_calculated"` whenever `calculateDre()` returns finite
2028-2047 ROL/EBITDA for the requested scenario — true for the canonical
validation scenario today — and `"missing_upstream_inputs"` only if those
values are genuinely absent/non-finite. `r100mWorkbookParityChecked: true` is
retained as-is: it accurately describes that the bridge *formulas* (not the
integrated, `calculateDre()`-fed output) have been checked against
workbook-cached values. See Phase 15B.2 for the full corrected status model
(`bridgeFormulaParityStatus`, `integratedBaselineParityStatus`).

### Reproducible validation entry points (post-review fix)

`capitalDecisionEngineValidation.ts` now exports two eagerly-evaluated
constants, following this directory's existing convention (e.g.
`DRE_EBITDA_BACKTEST_VALIDATION_REPORT`):

- `CAPITAL_DECISION_ENGINE_VALIDATION_REPORT = runCapitalDecisionEngineValidation()`
  — the 25/25 report below.
- `CAPITAL_DECISION_ORCHESTRATOR_RESULTS = getValidationOrchestratorResults()`
  — `{ r100m, r90m }`, the full `calculateCapitalDecisionBridge()` results for
  the canonical validation scenario (both CAPEX options). This is the
  documented vehicle for the "256.3M workbook vs. 512.6M/515.6M production"
  comparison in "Known gap" above — re-derivable by importing this module,
  with no ad-hoc scratch scripts required. **Superseded by Phase 15B.2
  (below)**: each result now carries `calculationReadiness:
  "structurally_calculated"` (not `"blocked"`) and the new
  `bridgeFormulaParityStatus` / `integratedBaselineParityStatus` /
  `integratedBaselineParityNote` fields.

### Validation results (`runCapitalDecisionEngineValidation()`)

All 25/25 checks pass, `toleranceBRL = 0.01`:

- **R$100M workbook-formula parity** (bridge core fed with workbook-cached
  `PnL!236`/`PnL!273`): pre-ops expansion CAPEX = -70,000,000; pre-ops EBITDA
  = -17,667,521.16; pre-ops FCO after CAPEX = -87,667,521.16; 2032 direct tax
  = -1,074,718.77; 2038 NOL recovery = 2,571,910.52; 2039 all-or-nothing NOL
  exhaustion (recovery = 0, accumulated NOL = 0, no pro-ration); 2047
  cumulative FCO after CAPEX = 256,332,471.98; D&A parity for all 20
  years 2028-2047; CAPEX expansion parity for all 21 periods; Sustain CAPEX
  parity for all 20 years; FCO parity for all 21 periods; cash flow after
  CAPEX parity for all 21 periods.
- **R$90M structural validation** (same workbook-cached operating inputs,
  `capexOptionId` varied only): pre-ops expansion CAPEX = -63,000,000; 2030
  expansion = -18,000,000; 2031 expansion = -9,000,000; total expansion =
  -90,000,000; Sustain CAPEX identical to R$100M for all years; D&A differs
  from R$100M (recomputed from the smaller CAPEX vintages); 2032 direct tax
  differs from R$100M (recomputed from the R$90M EBT path); no R$100M cached
  values leak into the R$90M result.
- **Boundary / scope** (production orchestrator,
  `calculateCapitalDecisionBridge()`): EBITDA identical between R$90M and
  R$100M for all 21 periods (CAPEX never changes EBITDA); both results
  contain exactly 21 periods; `explicitExclusions` declares working capital,
  financing cash flows, DCF, NPV, TIR, perpetuity, discounted payback, and
  Tier/investment interpretation as `"excluded"`; two calls with identical
  input produce identical output (deterministic).

### Build / lint / diff-check

- `npm run build`: succeeds (2807 modules, no errors; pre-existing chunk-size
  warning only).
- `npm run lint` (`tsc --noEmit`): no errors.
- `git diff --check`: no whitespace errors.
- `git status --short --untracked-files=all`: only the new Phase 15B files
  plus the pre-existing untracked Rio feature surface and the pre-existing
  modified `HighSchoolTab.tsx` (not touched by this phase).

### Phase 15B boundary / remaining work

- Phase 15B delivers the calculation bridge through
  `fcoAfterCapexBRL` / `fcoAfterCapexCumulativeBRL` (`PnL!295/296`) for both
  CAPEX options and all 21 periods, with source provenance and validation.
- Out of scope (Phase 15C/15D, per §17.2 and `explicitExclusions`): UI/
  `App.tsx` integration, working capital, financing cash flows, DCF, VPL,
  NPV, TIR, perpetuity, discounted payback, Tier/investment interpretation.
- Remaining risk (re-classified by Phase 15B.2 below): the integrated
  `calculateCapitalDecisionBridge()` output does not match the workbook's
  `PnL!291-296` cache for 2028-2047. This is **not** the pre-existing Phase 13
  `calculateDre()`/`PnL!236/273` "gap" as previously framed — Phase 15B.2
  traced it to a scenario/enrollment-input mismatch (classification A). See
  the Phase 15B.2 section for the corrected gate recommendation and the
  required follow-up (a workbook-baseline scenario fixture) before Phase 15C
  consumes integrated 2028-2047 numbers for DCF/VPL/TIR.

---

## Phase 15B.2-INTEGRATED-SOURCE-PARITY-AND-READINESS-CORRECTION

Corrects the Phase 15B gate recommendation and the stale-readiness wiring
identified above. **No staging, committing, or pushing was performed** — all
changes described here are uncommitted working-tree edits, same as the rest
of Phase 15B.

**Corrected gate recommendation**: Phase 15B's prior framing — "Phase 15B
complete; integrated output blocked by a pre-existing Phase 13 gap" — is
replaced with: **Phase 15B bridge core validated; production integration
requires a workbook-baseline scenario fixture before the integrated
(`calculateDre()`-fed) output can be claimed to match the workbook.** The
bridge core itself (CAPEX schedule, PPE depreciation, NOL/tax recurrence, FCO,
cash flow after CAPEX) remains independently workbook-validated (25/25,
tolerance 0.01 BRL) and is not in question.

### 1. Files inspected

- `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts`
  (`CALCULATION_CAN_BEGIN`, `INPUT_READINESS_REGISTRY`, 48 records).
- `src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts` and
  `capitalDecisionEngineContract.ts` (Phase 15B orchestrator + contract).
- `src/features/rio-scenario-resilience/model/capitalDecisionEngineValidation.ts`
  (25-check validation; no assertion on `calculationReadiness`'s value, only
  comments).
- `src/features/rio-scenario-resilience/model/capitalDecisionR100mParitySourceData.ts`
  (`R100M_ROL_BRL`, `R100M_EBITDA_BRL`, sourced from "...vBU v8 (2).xlsx",
  `PnL!236`/`PnL!273`).
- `src/features/rio-scenario-resilience/model/pnlFormulaParitySourceData.ts`
  (Phase 13D, sourced from "...vCR v7 (2).xlsx", `PnL!220/221` numero_de_turmas
  / numero_de_alunos, and `PnL!273` EBITDA).
- `src/features/rio-scenario-resilience/model/dreEbitdaBacktest.ts` and
  `dreEbitdaBacktestValidation.ts` / `dreEbitdaBacktestValidationContract.ts`
  (Phase 13B, `overallStatus: "partial_blocked"`, `diagnostic_unconfirmed_scenario`).
- `src/features/rio-scenario-resilience/docs/phase15CapitalDecisionArchitecture.md`
  §11 (stale-readiness audit) and §16/§17 (ratified methodology / scope).
- Live numeric trace: `calculateDre()` run for the canonical validation
  scenario (`t1_g3` / `intermediario` / `bp1_division_differentiated` /
  `balanced_experience`), 2028-2032, comparing `numero_de_alunos`,
  `receitas_com_ensino_regular`, `outras_receitas`,
  `receita_operacional_liquida`, and `ebitda` against the workbook-cached
  source files above.

### 2. Stale-readiness dependency found

`capitalDecisionEngine.ts` imported `CALCULATION_CAN_BEGIN` from
`inputReadinessRegistry.ts` and used it as
`calculationReadiness: CALCULATION_CAN_BEGIN ? "ready" : "blocked"`.
`CALCULATION_CAN_BEGIN` is a single repo-wide boolean that stays `false`
because of unrelated upstream layers (`payroll_fopag_output`, `opex_output`,
`capex_output`, `ebitda_output` registry entries marked
`blocked`/`structural_only`/`not_required_yet`) — §11 of
`phase15CapitalDecisionArchitecture.md` already documents this registry as
stale relative to the committed Phase 13A/14B/15B engines and explicitly
defers its correction to "a later readiness-documentation cleanup phase"
(this phase). Using it as the Phase 15B integrated-result gate conflated two
unrelated things: (a) whether *this bridge* could be computed for the
requested scenario (it always could — `computeCapitalDecisionBridgeCore` is
pure and total over its inputs), and (b) the readiness of unrelated
payroll/OPEX/CAPEX/governance model layers.

### 3. Readiness correction made

- Removed `import { CALCULATION_CAN_BEGIN } from "./inputReadinessRegistry"`
  from `capitalDecisionEngine.ts`. `inputReadinessRegistry.ts` itself was
  **not** modified — `CALCULATION_CAN_BEGIN` remains `false` and continues to
  gate the unrelated Phase 12/13 design-only layers and their validation
  suites (`dreEbitdaEngineReadinessValidation.ts`,
  `dreEbitdaBacktestValidation.ts`, etc.), all of which still assert
  `CALCULATION_CAN_BEGIN === false` and still pass.
- `capitalDecisionEngineContract.ts`: replaced
  `CapitalDecisionCalculationReadinessStatus = "ready" | "blocked"` with
  `"structurally_calculated" | "missing_upstream_inputs"`, and added:
  - `calculationReadinessReason: string`
  - `bridgeFormulaParityStatus: "formula_validated"` (fixed property of
    `computeCapitalDecisionBridgeCore`, independent of scenario)
  - `integratedBaselineParityStatus: "workbook_baseline_parity_validated" |
    "workbook_baseline_parity_not_established"`
  - `integratedBaselineParityNote: string`
- `capitalDecisionEngine.ts`: `calculationReadiness` is now computed locally
  from the actual `rolByYear`/`ebitdaByYear` values returned by
  `calculateDre()` — `"structurally_calculated"` if every 2028-2047
  `SIMULATOR_PROJECTION_YEARS` entry is a finite number, else
  `"missing_upstream_inputs"`. `integratedBaselineParityStatus` is computed by
  comparing this scenario's 2028 ROL/EBITDA against the workbook-cached
  `R100M_ROL_BRL[2028]`/`R100M_EBITDA_BRL[2028]` fixture within
  `toleranceBRL = 0.01`. Both fields are live computations, not hardcoded
  labels.

### 4. Workbook baseline scenario identified

The workbook-cached fixture used for Phase 15B parity
(`capitalDecisionR100mParitySourceData.ts`, "...vBU v8 (2).xlsx", `PnL!236`/
`PnL!273`, R$100M CAPEX instance, AC21 = -100,000,000) shares its `PnL!273`
2028 EBITDA value (-4,233,821.32) exactly with `pnlFormulaParitySourceData.ts`
("...vCR v7 (2).xlsx", `PnL!273`, sourceRow 273) — i.e. the v7 and v8 workbook
extracts agree on this row, so v7's `PnL!220`/`PnL!221` (numero_de_turmas /
numero_de_alunos) can be treated as describing the same underlying `PnL`
instance as the v8 R$100M fixture for 2028. From `pnlFormulaParitySourceData.ts`:

| Dimension | Workbook value (2028) |
|---|---|
| `numero_de_turmas` (PnL!220) | 20 |
| `numero_de_alunos` (PnL!221) | 246 |
| `receitas_com_ensino_regular` (PnL!225, via dreEbitdaBacktest.ts) | 24,977,416.48 |
| `outras_receitas` (PnL!233) | 662,035.36 |
| ROL (PnL!236) | 22,851,714.10 |
| EBITDA (PnL!273) | -4,233,821.32 |

No committed source file documents this instance's opening-package/occupancy/
tuition/org-design/CAPEX-option *scenario selections* directly (only the
resulting row values) — both `pnlFormulaParitySourceData.ts` and
`capitalDecisionR100mParitySourceData.ts` are explicitly "spreadsheet baseline
trace" extractions, not scenario-lever mappings.

### 5. Simulator comparison scenario identified

The Phase 15B "Known gap" comparison (and `dreEbitdaBacktest.ts` Phase 13B)
both use the same `calculateDre()` input — the canonical
`technical_validation_fixture`:

```
openingPackageId: "t1_g3"
occupancyScenarioId: "intermediario"
tuitionScenarioId: "bp1_division_differentiated"
orgDesignOptionId: "balanced_experience"
```

This scenario is explicitly documented (Phase 13F/13G) as a technical
validation fixture, **not board-ratified**, and **not claimed** to reproduce
the workbook's learner trajectory.

### 6. Input-by-input parity matrix (2028)

| Input dimension | Workbook baseline (vCR v7/vBU v8, PnL row) | `calculateDre()` input/output (canonical fixture) | Match? | Evidence |
|---|---|---|---|---|
| Opening package / occupancy / tuition / org-design scenario | Not documented in any committed source as a lever mapping (only resulting row values extracted) | `t1_g3 / intermediario / bp1_division_differentiated / balanced_experience` | **Unconfirmed** | `pnlFormulaParitySourceData.ts`, `capitalDecisionR100mParitySourceData.ts` both lack lever-mapping provenance |
| `numero_de_turmas` (PnL!220) | 20 | not produced by `calculateDre()` (`null`) | N/A | `dreEngine.ts` output has no turmas field |
| `numero_de_alunos` (PnL!221) | 246 | 228 | **No** | live trace below |
| `receitas_com_ensino_regular` (PnL!225) | 24,977,416.48 | 22,298,697.68 | No | live trace |
| `outras_receitas` (PnL!233) | 662,035.36 | 586,385.46 | No | live trace |
| ROL / `receita_operacional_liquida` (PnL!236) | 22,851,714.10 | 20,548,544.28 | No | live trace |
| EBITDA (PnL!273) | -4,233,821.32 | -6,957,011.04 | No | live trace; matches IMPLEMENTATION.md "Known gap" figures exactly |

### 7. First causal divergence

Tracing in the required order (enrollment → gross tuition → discounts → net
tuition revenue → other revenue → ROL → FOPAG → variable costs → fixed costs
→ sales expenses → EBITDA), the **first** divergence is at the top of the
chain, 2028:

- **`numero_de_alunos`**: workbook PnL!221 = 246; `calculateDre()` output =
  228. Delta = -18 students (-7.3%), first year of divergence = 2028 (the
  first projection year — no earlier year exists to check).
- This single-row divergence is **upstream of every revenue and EBITDA
  formula** in the DRE: `receitas_com_ensino_regular`, `outras_receitas`, ROL,
  FOPAG, fixed costs, sales expenses, and EBITDA are all computed from
  `numero_de_alunos` (directly or via per-learner ratios), so all downstream
  deltas (receitas -10.7%, outras_receitas -11.4%, ROL -10.1%, EBITDA
  +64.3pp/-2,723,189.73) are consistent with — and explained by — this single
  upstream enrollment difference, not by independent formula errors at each
  subtotal.
- This corroborates the Phase 13B `dreEbitdaBacktest.ts` trajectory finding
  (engine and PnL `receitas_com_ensino_regular` growth multiples diverge and
  cross mid-horizon — "no single occupancy/package variant can match both the
  opening level AND the trajectory slope of the PnL baseline simultaneously").

### 8. Divergence classification: **A — Scenario mismatch**

The first divergence (`numero_de_alunos`, 246 vs. 228) occurs **before** any
DRE/EBITDA formula is evaluated — it is a difference in the
enrollment/occupancy **input**, not in a Receita/FOPAG/DRE **formula**. This
rules out **C (formula defect)**: inputs do not match, so no formula-level
conclusion can be drawn from the EBITDA delta. It also rules out **B
(source-data mismatch)**, since there is no committed evidence the canonical
fixture's `numero_de_alunos` is *intended* to equal 246 and is merely sourced
incorrectly — no scenario-lever mapping to the workbook instance exists at
all. **D (intentional simulator divergence)** would require positive evidence
that the simulator's `t1_g3/intermediario` enrollment path is a deliberate,
documented alternative to the workbook baseline; instead, Phase 13F/13G
describe this fixture as an *unconfirmed, non-ratified* technical-validation
scenario — an admitted gap, not a designed difference.

**Classification: A — Scenario mismatch.** Correction path: identify or
construct a `calculateDre()`-compatible scenario input (opening
package/occupancy/tuition/org-design selections) whose `numero_de_alunos`
trajectory reproduces PnL!221 (246 in 2028, etc.), use it as a dedicated
"workbook-baseline scenario fixture" for integrated parity checks, and do not
modify `dreEngine.ts`/`receitaEngine.ts`/`fopagEngine.ts` formulas to force
the *current* canonical fixture to match — its enrollment assumptions are
simply a different scenario.

### 9. Files changed

- `src/features/rio-scenario-resilience/model/capitalDecisionEngineContract.ts`
  — new readiness/parity status types and result fields (§3 above).
- `src/features/rio-scenario-resilience/model/capitalDecisionEngine.ts` —
  removed `CALCULATION_CAN_BEGIN` import/usage; added local
  `calculationReadiness`/`calculationReadinessReason`/
  `bridgeFormulaParityStatus`/`integratedBaselineParityStatus`/
  `integratedBaselineParityNote` computation; updated header comment and
  `sourceProvenance.notes` to remove the "KNOWN GAP ... CALCULATION_CAN_BEGIN"
  framing and replace it with the scenario-mismatch finding.
- `IMPLEMENTATION.md` — this section, plus corrections to the Phase 15B
  section's now-stale `calculationReadiness: "blocked"` / "Known gap" /
  "remaining risk" references.
- `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts` —
  **not modified** (left as-is per §2/§3).
- No staging, committing, deleting, reverting, or pushing performed.

### 10. Phase 15B bridge-core validation result

`CAPITAL_DECISION_ENGINE_VALIDATION_REPORT`: **25/25 pass**, `toleranceBRL =
0.01` — unchanged by this phase. `computeCapitalDecisionBridgeCore()`, fed the
workbook's own cached `PnL!236`/`PnL!273` (R$100M and R$90M), reproduces
`PnL!291-296` exactly. This remains the bridge-core validation and is
independent of the scenario-mismatch finding above.

### 11. Integrated workbook-baseline parity result

**Not established** for the canonical validation scenario.
`calculateCapitalDecisionBridge()`'s `integratedBaselineParityStatus =
"workbook_baseline_parity_not_established"` for both CAPEX options, with
`integratedBaselineParityNote` reporting the live 2028 ROL/EBITDA deltas
(-2,303,169.82 / -2,723,189.73) and pointing to the §8 classification
(scenario mismatch, not a bridge defect). `calculationReadiness =
"structurally_calculated"` for both options — the bridge **is** computed
deterministically from this scenario's own EBITDA/ROL; it is simply not a
workbook-baseline-parity result.

### 12. Build / lint / diff-check result

- `npm run build`: succeeds (2807 modules transformed, no errors; pre-existing
  >500kB chunk-size warning only, unrelated to this change).
- `npm run lint` (`tsc --noEmit`): no errors.
- `git diff --check`: no whitespace errors.
- Re-ran `CAPITAL_DECISION_ENGINE_VALIDATION_REPORT` (25/25 pass),
  `DRE_EBITDA_BACKTEST_VALIDATION_REPORT.allPass` (true), and
  `DRE_ENGINE_VALIDATION_REPORT.allPass` (true) after the edit — all green.

### 13. Remaining risks

- The workbook-baseline scenario fixture required by §8's correction path
  does not yet exist. Until it does, **no** `calculateDre()` scenario's
  integrated bridge output can be claimed to match `PnL!291-296` for
  2028-2047, including the canonical validation fixture's R$100M/R$90M
  results (2047 cumulative FCO after CAPEX: 512.6M / 515.6M production vs.
  256.3M workbook-cached — gap now attributed to enrollment-input mismatch,
  not a bridge-formula or DRE-formula defect, but still unresolved).
- `pnlFormulaParitySourceData.ts` (v7) and `capitalDecisionR100mParitySourceData.ts`
  (v8) agree on `PnL!273` (2028 EBITDA) but neither file documents the
  scenario-lever selections that produced `numero_de_alunos = 246` — without
  that mapping, a workbook-baseline fixture cannot be constructed from
  committed sources alone; it requires a new Finance-confirmed scenario input
  (Phase 13F/13G-style ratification).
- `outras_receitas` carries an additional, separately-documented
  `reajuste_despesas` formula gap (`outrasReceitasReajusteNote`,
  `dreEbitdaBacktest.ts` row 233 note) that will remain even after enrollment
  is corrected.

### 14. Git status

`git status --short --untracked-files=all`: `IMPLEMENTATION.md` modified
(this section + Phase 15B corrections); `HighSchoolTab.tsx` modified
(pre-existing, not touched by Phase 15B or 15B.2); 14 Phase 15B model files
untracked (`capitalDecisionEngine.ts`, `capitalDecisionEngineContract.ts`,
`capitalDecisionEngineValidation.ts`, `capitalDecisionEngineValidationContract.ts`,
`capitalDecisionR100mParitySourceData.ts`, `capexScheduleEngine.ts`,
`capexScheduleEngineContract.ts`, `ppeDepreciationEngine.ts`,
`ppeDepreciationEngineContract.ts`, `nolTaxEngine.ts`, `nolTaxEngineContract.ts`,
`preOpsOperatingResultSourceData.ts`, `preOpsOperatingResultSourceDataContract.ts`,
plus `capexEngineValidationContract.ts` -- a Phase 10C.1 file that is a
required compile-time dependency of `capexScheduleEngine.ts` and was never
previously committed); plus the pre-existing untracked Rio feature surface
(components/docs/data files predating Phase 15B). Nothing staged, committed,
deleted, reverted, or pushed.

(Note: an earlier draft of this section referred to "the five Phase 15B
model files" -- that count covered only the `capitalDecision*` files and
missed the CAPEX/PPE/NOL/pre-ops engine files reused from the
implementation report. See "Phase 15B-FINAL-QA-AND-COMMIT" below for the
reconciled manifest.)

### 15. Gate recommendation (superseded by Phase 15B-FINAL-QA-AND-COMMIT below)

This subsection records the recommendation as drafted during Phase 15B.2
review. It was reviewed and overridden (see "Phase 15B-FINAL-QA-AND-COMMIT"
below): the workbook-baseline-parity confirmation described here remains a
useful follow-up but is not a precondition for committing Phase 15B.

Original framing: **needs targeted upstream correction** (not "ready to
commit", not "blocked by genuinely missing source data"):

- The Phase 15B bridge core (CAPEX schedule, PPE depreciation, NOL/tax,
  FCO, cash flow after CAPEX) is validated and correct (25/25,
  workbook-exact).
- The integrated orchestrator (`calculateCapitalDecisionBridge()`) is
  structurally sound and deterministic for any scenario whose `calculateDre()`
  output has finite 2028-2047 ROL/EBITDA (`calculationReadiness:
  "structurally_calculated"`).
- It does **not** yet produce workbook-baseline-matching numbers, because the
  canonical validation scenario's enrollment input (`numero_de_alunos`) does
  not match the workbook baseline (§7/§8) — a scenario-input gap, not a
  formula defect in Receita/FOPAG/DRE/bridge code.
- **Before Phase 15B can be accepted as workbook-baseline-parity-validated**,
  Finance/board must confirm a scenario input (opening package, occupancy,
  tuition, org-design selections) whose `numero_de_alunos` trajectory matches
  `PnL!221`, and that scenario must be run through
  `calculateCapitalDecisionBridge()` to re-check
  `integratedBaselineParityStatus`. Until then, the bridge can be used for
  **non-baseline scenario analysis** (where `calculationReadiness:
  "structurally_calculated"` already holds today), but its output should not
  be presented as matching the workbook's `PnL!291-296`.

---

## Phase 15B-FINAL-QA-AND-COMMIT

**Gate decision (accepted, 2026-06-12)**: §15's "needs targeted upstream
correction" framing applied to *workbook-baseline-parity validation*, which
remains a separate, non-blocking follow-up. It does not block **committing**
Phase 15B itself, because:

- the bridge core already has workbook parity (25/25, tolerance 0.01 BRL);
- the production orchestrator intentionally consumes simulator scenario
  outputs, and different scenario assumptions are expected to produce
  different results;
- no claim of integrated workbook-baseline parity is made for the canonical
  (mismatched) scenario — `integratedBaselineParityStatus:
  "workbook_baseline_parity_not_established"` reports this explicitly and
  correctly;
- a dedicated workbook-baseline regression fixture (matching `PnL!221` = 246
  learners in 2028) may be added later if useful, but is not a Phase 15B
  blocker.

**Phase 15B is committed.** Phase 15C is eligible to begin and may use Phase
15B's scenario outputs (`fcoAfterCapexBRL`/`fcoAfterCapexCumulativeBRL`) for
non-baseline scenario analysis. Phase 15C must independently validate any
DCF/VPL/TIR/perpetuity/discounted-payback formulas it introduces against the
workbook methodology (`phase15CapitalDecisionArchitecture.md` §16) — Phase
15B's 25/25 bridge-core validation does not extend to those Phase 15C/15D
calculations.

---

## Phase 15C-DCF-VPL-TIR-PERPETUITY

**Boundary**: Phase 15C consumes Phase 15B's committed `CapitalDecisionResult`
(`fcoAfterCapexBRL` for all 21 periods, `netIncomeBRL` for 2047) as a
read-only input and adds discounted cash flow (DCF), Gordon Growth terminal
value/perpetuity, VPL (NPV), and TIR (IRR). It does **not** recalculate
Receita, FOPAG, EBITDA, D&A, tax/NOL, FCO, or CAPEX, and does not call
`dreEngine`, `receitaEngine`, `fopagEngine`, `capexScheduleEngine`,
`ppeDepreciationEngine`, or `nolTaxEngine`. No UI, no `App.tsx`/workbook/
`HighSchoolTab.tsx` changes, no hidden sheets.

### Files created (13)

1. `capitalDecisionDriverSourceContract.ts` / `capitalDecisionDriverSourceData.ts`
   -- single canonical source for `preOpsWaccRate` (0.1325, PnL!B6),
   `operatingPeriodWaccRate` (0.12, PnL!C6:V6, also the perpetuity WACC,
   PnL!Z278 = V6), and `perpetuityGrowthRate` (0.035, PnL!Z279). Per
   `phase15CapitalDecisionArchitecture.md` S16.5 D10, these are not
   hardcoded independently anywhere else -- `discountedCashFlowEngine.ts`,
   `terminalValueEngine.ts`, and `phase15cInvestmentMetricsEngine.ts` receive
   them only via this source.
2. `discountedCashFlowEngineContract.ts` / `discountedCashFlowEngine.ts` --
   21-period DCF (PnL!B305:V306 / B308:V308 equivalent).
3. `terminalValueEngineContract.ts` / `terminalValueEngine.ts` -- Gordon
   Growth terminal value (PnL!Z280:Z283).
4. `irrEngineContract.ts` / `irrEngine.ts` -- Newton-Raphson + bracket/
   bisection-fallback IRR solver (PnL!Z288 = `IRR(B295:W295)` equivalent).
5. `phase15cInvestmentMetricsEngineContract.ts` / `phase15cInvestmentMetricsEngine.ts`
   -- orchestrator: pure core (`computePhase15CInvestmentMetricsCore`) +
   production entry point (`calculatePhase15CInvestmentMetrics`).
6. `phase15cR100mParitySourceData.ts` -- R$100M workbook-cached parity
   fixture (WACC rates, discount factors, discounted cash flows, cumulative
   discounted cash flows for all 21 periods; 2047 terminal net income;
   terminal value; terminal value PV; VPL; TIR).
7. `phase15cInvestmentMetricsEngineValidationContract.ts` /
   `phase15cInvestmentMetricsEngineValidation.ts` -- 28 checks across R$100M
   parity, R$90M structural, IRR solver, and boundary surfaces (all pass).

### DCF period-index convention (1-based, PnL!B286:V286)

```
discountFactor[1] = 1 + wacc[1]                          (pre_ops, periodIndex 1, WACC 13.25%)
discountFactor[i] = discountFactor[i-1] * (1 + wacc[i])  (i = 2..21; 2028=index 2 .. 2047=index 21, WACC 12%)
discountedCashFlowBRL          = fcoAfterCapexBRL / discountFactor
cumulativeDiscountedCashFlowBRL = previousCumulative + discountedCashFlowBRL
```

This is a **recursive cumulative product**, not a closed-form
`(1+wacc)^periodIndex` exponent, because the pre_ops period uses a different
rate (13.25%) than 2028-2047 (12%).

### TIR period-index convention (0-based exponents, distinct from DCF)

`calculateIrr()` is fed a 22-entry series:

```
[fcoAfterCapexBRL(pre_ops), fcoAfterCapexBRL(2028), ..., fcoAfterCapexBRL(2047), terminalValueAt2047BRL]
```

with `cashFlows[i]` at **exponent i** (`pre_ops` = exponent 0 ... `2047` =
exponent 20, terminal value = exponent 21), matching Excel's
`IRR(B295:W295)`. TIR uses **undiscounted** `fcoAfterCapexBRL` -- it does NOT
consume the DCF engine's `discountedCashFlowBRL` series. The DCF engine's
`periodIndex` (1-based, 1=pre_ops..21=2047) and the IRR series' exponents
(0-based, 0=pre_ops..20=2047, 21=terminal value) are deliberately different
conventions and must not be conflated.

### Terminal-value net-income source and cancellation identity

The terminal cash-flow numerator (PnL!Z280 = PnL!V290 - PnL!V288) equals
**2047 net income** (`CapitalDecisionPeriodResult.netIncomeBRL` for
`periodKey === 2047`, i.e. PnL!V282), **not** `fcoAfterCapexBRL[2047]`
(PnL!V295). The perpetual depreciation add-back (PnL!W288) and the assumed
perpetual Sustain CAPEX (PnL!W291 = -W288) cancel exactly, so PnL!W295
("perpetuity cash flow after CAPEX") reduces algebraically to PnL!Z281 (net
income perpetuity). `terminalValueEngine.ts` therefore takes `netIncomeBRL`
as its numerator input and does not separately model a terminal Sustain CAPEX
or terminal depreciation adjustment:

```
terminalValueAt2047BRL          = terminalNetIncomeBRL * (1 + perpetuityGrowthRate) / (perpetuityWaccRate - perpetuityGrowthRate)
terminalValuePresentValueBRL    = terminalValueAt2047BRL / finalYearDiscountFactor   (PnL!V308 == PnL!W308; no extra terminal discounting)
```

### VPL (PnL!Z289) -- one canonical field

```
npvBRL = sum(periods[i].discountedCashFlowBRL for i = 1..21) + terminalValue.terminalValuePresentValueBRL
```

There is no separate "with/without terminal value" field.

### IRR solver

Newton-Raphson from the standard seed `0.10`, with `npvAtRate(rate) =
sum(cashFlows[i] / (1+rate)^i)` (cashFlows[0] at exponent 0). Convergence:
rate-delta tolerance `1e-10`, NPV residual tolerance `0.01 BRL` (NOT `1e-7`),
max 100 Newton iterations. If Newton fails (non-finite derivative, or the
next iterate would leave the valid rate domain `rate > -1`), falls back to a
deterministic 2000-step bracket scan over `(-1+1e-9, 10]` followed by
bisection (max 200 iterations). `multipleRootsPossible` is set whenever the
cash-flow series has more than one sign change, independent of whether a root
was found. Status: `"calculated"` (root found by either method),
`"no_sign_change"` (all cash flows same sign -- no real root), or
`"did_not_converge"` (neither method found a root within tolerance, e.g. an
implied rate far outside `(-1, 10]`). `0` is never returned as a substitute
for an unavailable rate.

### Dual status axes (IRR unavailability does not block VPL)

`Phase15CCalculationStatus` (`"calculated"` |
`"blocked_missing_phase15b_inputs"` | `"blocked_invalid_wacc_growth"`) and
`IrrStatus` (`"calculated"` | `"no_sign_change"` | `"did_not_converge"`) are
independent. A series with no sign change (e.g. all cash flows positive)
yields `calculationStatus: "calculated"`, a valid `npvBRL`, and a valid
terminal value, while `irrRate: null` / `irrStatus: "no_sign_change"`
explains why IRR specifically is unavailable. `blocked_missing_phase15b_inputs`
fires only when Phase 15B's `calculationReadiness !== "structurally_calculated"`.
`blocked_invalid_wacc_growth` fires when `perpetuityWaccRate <= perpetuityGrowthRate`
(or either is non-finite) -- in both blocked cases, terminal value, VPL, and
IRR are all unavailable (`null`).

### R$100M workbook-parity results (10/10)

`phase15cInvestmentMetricsEngineValidation.ts`, fed `computeCapitalDecisionBridgeCore()`
with the workbook's cached `PnL!236/273` (same inputs as Phase 15B's
`r100m_*` checks), reproduces all five workbook anchors exactly within
tolerance:

| Anchor | Workbook (PnL cell) | Computed |
| --- | --- | --- |
| Cumulative discounted cash flow, 2047 (V306) | -18,153,646.635 | -18,153,646.635 |
| Terminal value at 2047 (Z281) | 420,628,018.055 | 420,628,018.055 |
| Terminal value PV (Z283) | 38,503,440.118 | 38,503,440.118 |
| VPL (Z289) | 20,349,793.483 | 20,349,793.483 |
| TIR (Z288) | 0.132612905776 | 0.132612905776 |

Plus: period indices 1..21, WACC rates (tol 1e-6), discount factors (tol
1e-6), and discounted/cumulative-discounted cash flows for all 21 periods
(tol 0.01 BRL) -- all pass.

### R$90M structural results (4/4)

Same canonical WACC/growth source as R$100M; R$90M `fcoAfterCapexBRL` (from
`computeCapitalDecisionBridgeCore({capexOptionId: "capex_90m_brl"})`) produces
discounted cash flows differing from R$100M's in 14/21 periods; R$90M
terminal value uses R$90M's own 2047 net income; R$90M VPL
(27,719,396.96) differs from the R$100M cached VPL (no cached-output
leakage); repeated calls are deterministic.

### Solver-validation results (9/9)

Standard single-root series (`[-1000,300,300,300,300,300]` -> IRR
15.238236...%, Newton, 4 iterations); all-positive and all-negative series ->
`no_sign_change`; classic dual-root series `[-100,230,-132]` (roots at 10%
and 20%) -> `multipleRootsPossible: true`, deterministic seed-0.10 root
(10%); bisection fallback (`[1000,-1]`, root near -99.9%, Newton's first step
leaves the rate domain); non-convergence (`[-1, 1e30]`, implied rate far
outside `(-1, 10]` -> `did_not_converge`); near-(-1) domain
(`[10000,-1]`, root ≈ -99.99%); deterministic repeated calls.

### Boundary-validation results (5/5)

Input `CapitalDecisionResult` not mutated; result contains exactly 21
explicit periods plus 1 separate `terminalValue` object;
`explicitExclusions` declares working capital / financing cash flows / simple
payback / discounted payback / Tier-investment interpretation / UI
interpretation as excluded; an all-positive synthetic `fcoAfterCapexBRL`
series yields `irrStatus: "no_sign_change"` while `calculationStatus:
"calculated"` and `npvBRL` remains a valid number; an invalid driver
(`perpetuityGrowthRate=0.5 > perpetuityWaccRate=0.12`) yields
`calculationStatus: "blocked_invalid_wacc_growth"`, a blocked `terminalValue`,
and `npvBRL: null`.

### Scenario-parity semantics

`integratedBaselineParityStatus` / `integratedBaselineParityNote` are passed
through unchanged from the input `CapitalDecisionResult` -- Phase 15C does
not re-derive or alter Phase 15B's scenario-parity finding (see "Phase
15B-FINAL-QA-AND-COMMIT" above). `phase15CFormulaParityStatus:
"formula_validated"` is a fixed property of the Phase 15C formulas
themselves (DCF/terminal-value/IRR), independent of the calling scenario,
analogous to Phase 15B's `bridgeFormulaParityStatus`.

### Phase 15D / 15E boundaries

Phase 15C's `Phase15CExplicitExclusions` explicitly excludes: working
capital, financing cash flows, simple payback, discounted payback,
Tier/investment interpretation, and UI interpretation. **Phase 15D** is
expected to own simple/discounted payback (using the DCF periods'
`discountedCashFlowBRL`/`cumulativeDiscountedCashFlowBRL` produced here).
**Phase 15E** is expected to own Tier/investment and UI interpretation of
the VPL/TIR/payback outputs. Neither is implemented in Phase 15C.

### Residual numerical risk (IRR solver)

The solver matches the workbook fixture and required synthetic cases, but
Excel IRR parity for arbitrary multi-root or pathological cash-flow series is
not guaranteed beyond the deterministic root-selection policy. This is a
documented residual risk, not a blocker to Phase 15C.

### Validation / build status

`npm run lint` (`tsc --noEmit`): clean. `npm run build`: succeeds (2807
modules). `phase15cInvestmentMetricsEngineValidation.ts`: 28/28 pass.
`capitalDecisionEngineValidation.ts` (Phase 15B): 25/25 pass (unchanged).
`dreEngineValidation.ts`: 20/20 pass (unchanged). 13 new files created, 0
existing files modified other than this document.

## Phase 15D-DISCOUNTED-PAYBACK

**Boundary**: Phase 15D consumes Phase 15C's committed `Phase15CResult`
(commit `94f2ebb`) -- specifically
`periods[*].cumulativeDiscountedCashFlowBRL` and `npvBRL` -- as a read-only
input and adds a single output: discounted payback (the workbook's `PnL!Z290`
"Payback" outcome), expressed as a machine-readable status, an integer
operating-year count (1-20) or `null`, a compact value (`"1"`..`"20"`,
`"20+"`, `"NA"`, or `null`), and a plain-text explanatory sentence. It does
**not** recalculate discount factors, annual/cumulative discounted cash flow,
terminal value, VPL, TIR, or any Phase 15B figure, and does not call
`dreEngine` / `receitaEngine` / `fopagEngine` / `capexScheduleEngine` /
`ppeDepreciationEngine` / `nolTaxEngine` / `capitalDecisionEngine` directly.
No UI, no `App.tsx`/workbook/`HighSchoolTab.tsx` changes.

### Files created (5)

1. `discountedPaybackEngineContract.ts` -- `DiscountedPaybackStatus`,
   `DiscountedPaybackResult`, `Phase15DSourceProvenance`,
   `Phase15DExplicitExclusions`, `DiscountedPaybackEngineInput`.
2. `discountedPaybackEngine.ts` -- pure core (`calculateDiscountedPayback`) +
   production entry point (`calculateDiscountedPaybackForCapitalDecision`,
   which calls `calculatePhase15CInvestmentMetrics()`).
3. `phase15dR100mParitySourceData.ts` -- R$100M workbook-parity fixture (PnL
   row 307 payback-helper values and the workbook `Z290` output for this
   scenario).
4. `discountedPaybackEngineValidationContract.ts` /
   `discountedPaybackEngineValidation.ts` -- 36 checks across R$100M parity,
   R$90M structural, synthetic calculated/edge-case, technical-failure, and
   boundary surfaces (all pass).

### Visible workbook provenance

`PnL` sheet: row 305 (`DCF - Anual`, annual discounted cash flow), row 306
(`DCF - Acumulado`, cumulative discounted cash flow -- the sole input to the
recovery search), row 307 (Payback helper: `B307=0` literal, `C307:V307 =
IF(col306>0,0,1)`), and the workbook output cell:

```
Z290 = IF(Z289<0, "NA", IF((SUM(B307:V307)+1)>=20, "20+", SUM(B307:V307)+1))
```

`Z289` is VPL (Phase 15C `npvBRL`, includes the terminal value PV).

### Inputs consumed and excluded

- **Consumed**: `Phase15CResult.periods[1..20].cumulativeDiscountedCashFlowBRL`
  (PnL row 306, the 20 operating periods 2028-2047), `Phase15CResult.npvBRL`
  (PnL!Z289), `calculationStatus`, `capexOptionId`, and the
  scenario-parity/provenance pass-through fields
  (`integratedBaselineParityStatus`, `integratedBaselineParityNote`).
- **`pre_ops` (`periods[0]`)** anchors the series but is excluded from both
  the recovery search and the displayed operating-year count -- the
  displayed range is exactly 2028-2047 (operating years 1-20).
- **Terminal value** (`Phase15CResult.terminalValue`, PnL column W) is
  excluded from recovery timing entirely. It affects only `npvBRL`, which
  gates the `"NA"` check (§B below).
- **No fractional/interpolated payback**: the visible workbook's row 307 is a
  binary 0/1 indicator per period, so `discountedPaybackYears` is always an
  integer 1-20 or `null`. Fractional payback, unrecovered-balance
  interpolation, and recovery-period cash-flow interpolation are not
  implemented (`Phase15DExplicitExclusions.fractionalPayback: "excluded"`).

### Calculation precedence

- **§A Technical readiness**: if Phase 15C `calculationStatus !==
  "calculated"`, `npvBRL === null`, the period series is malformed (wrong
  length/order, duplicate/missing period keys), or any
  `cumulativeDiscountedCashFlowBRL`/`npvBRL` is non-finite ->
  `status="blocked_missing_phase15c_inputs"` or
  `status="invalid_cash_flow_series"`, `discountedPaybackYears=null`,
  `compactValue=null`. Never reported as `"NA"` or `"20+"`.
- **§B Negative VPL** (strict `< 0`): `npvBRL < 0` ->
  `status="not_applicable_negative_npv"`, `compactValue="NA"`,
  `discountedPaybackYears=null`. `npvBRL === 0` is **not** `"NA"`.
- **§C Recovery search**: iterate the 20 operating periods 2028-2047
  (`periods[1..20]`) in order; recovery = first period where
  `cumulativeDiscountedCashFlowBRL > 0` (strict). 2028 -> `"1"`, ...,
  2047 -> `"20"`.
- **§D Not reached**: if `npvBRL >= 0` and no operating period has
  `cumulativeDiscountedCashFlowBRL > 0` ->
  `status="not_reached_within_horizon"`, `compactValue="20+"`,
  `discountedPaybackYears=null`. This is the ratified meaning of `"20+"`:
  payback is not achieved within the explicit 2028-2047 horizon. It is not an
  error and does not mean payback occurs in year 20.

### Workbook `>=20` edge-case discrepancy and simulator correction

The Phase 15D.1 audit identified that the workbook's `Z290` formula uses
`>=20`, which **conflates two distinct cases**: "no recovery within the
explicit 2028-2047 horizon" (raw count = 21, mathematically the only `"20+"`
case) and "recovery first occurs in the final operating year, 2047" (raw
count = 20, and `20>=20` is also true). Both produce `"20+"` in the raw
workbook formula.

This conflation **conflicts with the ratified business methodology**:
`"20+"` means discounted payback is **not** achieved within the projection
horizon; it does **not** mean payback occurs in year 20; and recovery in 2047
**is** recovery within the 2028-2047 horizon.

**The simulator implements the ratified business meaning, not the workbook's
`>=20` edge case**: recovery first occurring in 2047 returns `compactValue =
"20"` (numeric), not `"20+"`. This is a documented, deliberate deviation from
the literal workbook formula -- see
`discountedPaybackEngineContract.ts` / `discountedPaybackEngine.ts` header
comments and `Phase15DSourceProvenance.notes`, and the
`phase15d_synthetic_recovery_2047_returns_20_not_20plus` validation check.

The R$100M workbook-baseline parity is unaffected: that scenario does not
recover by 2047 (`V306 = -18,153,646.635 < 0`), so it returns `"20+"` under
**both** the raw workbook formula and the corrected ratified rule.

### R$100M workbook-parity results (6/6)

`discountedPaybackEngineValidation.ts`, fed `computeCapitalDecisionBridgeCore()`
with the workbook's cached `PnL!236/273` (same inputs as Phase 15B's
`r100m_*` and Phase 15C's `phase15c_r100m_*` checks):

| Check | Result |
| --- | --- |
| `status` | `"not_reached_within_horizon"` |
| `compactValue` | `"20+"` |
| `discountedPaybackYears` | `null` |
| `npvBRL` | 20,349,793.483 (>= 0, matches `PHASE15C_R100M_NPV_BRL`) |
| Cumulative DCF at 2047 (V306) | -18,153,646.635 (< 0) |
| PnL row 307 helper values | match `IF(col306>0,0,1)` for all 21 periods |

### R$90M structural results (4/4)

Same canonical WACC/growth source and workbook-cached ROL/EBITDA inputs,
`capexOptionId="capex_90m_brl"`: independently derives
`status="not_reached_within_horizon"`, `compactValue="20+"` from its own
`Phase15CResult` (`npvBRL = 27,719,396.96`, which differs from the R$100M
cached `npvBRL` -- no cached-output leakage); repeated calls are
deterministic; `integratedBaselineParityStatus`/`integratedBaselineParityNote`
are passed through unchanged. R$90M is not required to differ from R$100M in
its final `compactValue` -- both legitimately resolve to `"20+"` here, and the
check validates independent derivation rather than label inequality.

### Synthetic calculated / edge-case validation (12/12)

Recovery at 2028 (`"1"`); recovery at an intermediate year, 2037 (`"10"`);
recovery first occurring at 2047 -> `"20"` (the corrected-rule check, not
`"20+"`); no recovery 2028-2047 with `npvBRL >= 0` -> `"20+"`; a
`cumulativeDiscountedCashFlowBRL === 0` period is not recovered (strict `>
0`), recovery deferred to the next period; `cumulativeDiscountedCashFlowBRL
=== 0` at 2047 with no prior recovery remains `"20+"`; `npvBRL < 0` ->
`"NA"` even when the explicit series would otherwise recover; `npvBRL === 0`
with recovery -> numeric (not `"NA"`); `npvBRL === 0` without recovery ->
`"20+"` (not `"NA"`); positive `npvBRL` without recovery -> `"20+"`; a
positive `pre_ops` cumulative DCF does not affect the recovery search; no
result returns `discountedPaybackYears === 0`.

### Technical-failure validation (10/10)

Phase 15C `calculationStatus !== "calculated"` ->
`"blocked_missing_phase15c_inputs"`; `calculationStatus === "calculated"` but
`npvBRL === null` -> `"blocked_missing_phase15c_inputs"`; 20-period (not
21-period) series, missing `pre_ops`, missing/duplicated 2047, non-finite
`npvBRL`, and non-finite `cumulativeDiscountedCashFlowBRL` all ->
`"invalid_cash_flow_series"` (`compactValue=null` in every case, never
`"NA"`/`"20+"`); input `Phase15CResult` not mutated; deterministic repeated
calls.

### Boundary validation (4/4)

`discountedPaybackEngine.ts` imports `calculatePhase15CInvestmentMetrics`
only (no `discountedCashFlowEngine`/`terminalValueEngine` imports) and reads
`periods[*].cumulativeDiscountedCashFlowBRL`/`npvBRL` as-is;
`DiscountedPaybackResult` does not include `irrRate`/`irrStatus` and the
engine never reads `Phase15CResult.irrRate`/`irrStatus`; the recovery search
iterates `periods[1..20]` only and never reads `Phase15CResult.terminalValue`;
`Phase15DExplicitExclusions` declares simple payback, fractional payback,
working capital, financing cash flows, Tier/investment-recommendation
interpretation, UI interpretation, and export integration as excluded.

### Phase 15E / 15F boundaries

`Phase15DExplicitExclusions` explicitly excludes: simple payback, fractional
payback, working capital, financing cash flows, Tier/investment-recommendation
interpretation, UI interpretation, and export integration. **Phase 15E** is
expected to own TIR-versus-WACC interpretation, Tier classification, and
board/investment recommendation, using the VPL/TIR/discounted-payback outputs
produced by Phase 15C/15D. **Phase 15F** is expected to own UI presentation of
these outputs (including any export integration). Neither is implemented in
Phase 15D.

### Validation / build status

`npm run lint` (`tsc --noEmit`): clean. `npm run build`: succeeds (2807
modules). `discountedPaybackEngineValidation.ts`: 36/36 pass.
`phase15cInvestmentMetricsEngineValidation.ts` (Phase 15C): 28/28 pass
(unchanged). `capitalDecisionEngineValidation.ts` (Phase 15B): 25/25 pass
(unchanged). `dreEngineValidation.ts`: 20/20 pass (unchanged). 5 new files
created, 1 existing file (`IMPLEMENTATION.md`, this section) updated.

## Phase 15D.2-DECISION-LEVER-PROPAGATION-VALIDATION

**Objective.** Prove that Phase 15D's production entry point
(`calculateDiscountedPaybackForCapitalDecision`) returns outputs that are
dynamically derived from the simulator's selected decision levers, via the
chain `decision-lever input -> calculateDre -> calculateCapitalDecisionBridge
-> calculatePhase15CInvestmentMetrics -> calculateDiscountedPaybackForCapitalDecision`
-- not from the R$100M workbook fixture, cached parity values, a fixed
canonical scenario, or fallback constants. No formula redesign, no simple
payback, no Tier/board interpretation, no UI, and no edits to `App.tsx`,
the workbook, or `HighSchoolTab.tsx` were made.

### Step 1-2: Production input contract and decision-lever support matrix

The entire chain shares one input type:
`CapitalDecisionEngineInput extends DreEngineInput { capexOptionId: CapexOptionId }`,
where `DreEngineInput` (`dreEngineContract.ts`) is:

```ts
interface DreEngineInput {
  readonly openingPackageId: OpeningPackageId;     // "t1_g3" | "t1_g4" | "t1_g5" | "t1_g6"
  readonly occupancyScenarioId: OccupancyScenarioId; // "intermediario" | "pessimista" | "otimista"
  readonly tuitionScenarioId: TuitionScenarioId;   // "bp1_division_differentiated" | "bp2_ey_ls_unified" | "bp3_ey_to_ms_unified"
  readonly orgDesignOptionId: string;              // "minimum_experience" | "balanced_experience" | "premium_experience"
}
```

`calculateDre()` (`dreEngine.ts`) calls `calculateReceita({openingPackageId,
occupancyScenarioId, tuitionScenarioId})` and `calculateFopag({openingPackageId,
occupancyScenarioId, orgDesignOptionId})`. `calculateCapitalDecisionBridge()`
calls `calculateDre(input)`, extracts `receita_operacional_liquida` and
`ebitda` per year (2028-2047) as `rolByYear`/`ebitdaByYear`, and feeds them
(plus `input.capexOptionId`) to `computeCapitalDecisionBridgeCore`.
`calculatePhase15CInvestmentMetrics()` calls `calculateCapitalDecisionBridge(input)`.
`calculateDiscountedPaybackForCapitalDecision()` calls
`calculatePhase15CInvestmentMetrics(input)` then `calculateDiscountedPayback`.

| Decision lever | Input field / type | Upstream adapter / engine | Affects which financial lines? | Reaches Phase 15D? |
| --- | --- | --- | --- | --- |
| Opening Grades | `openingPackageId: OpeningPackageId` (`t1_g3 \| t1_g4 \| t1_g5 \| t1_g6`) on `DreEngineInput` | `receitaEngine.calculateReceita` and `fopagEngine.calculateFopag` (both called by `calculateDre`) | `numero_de_alunos`, `ticket_servico`, full revenue block through `receita_operacional_liquida`, FOPAG-driven fixed-cost lines -> `ebitda` | **Yes** (confirmed: S5 vs S2 below) |
| Occupancy | `occupancyScenarioId: OccupancyScenarioId` (`intermediario \| pessimista \| otimista`) on `DreEngineInput` | `receitaEngine.calculateReceita` and `fopagEngine.calculateFopag` | `numero_de_alunos`, revenue block, FOPAG fixed-cost lines -> `ebitda` | **Yes** (confirmed: S3, S4 vs S2) |
| Org Design Structure | `orgDesignOptionId: string` (`minimum_experience \| balanced_experience \| premium_experience`, validated by `payrollAdapter.VALID_ORG_DESIGN_OPTIONS`) on `DreEngineInput` | `fopagEngine.calculateFopag` -> `payrollAdapter.buildPayrollAdapterInput` | `folha_de_pagamento`, `beneficios`, `total_custos_e_despesas_fixas` -> `ebitda` (revenue block / `receita_operacional_liquida` unaffected) | **Yes** (confirmed: S7, S8 vs S2) |
| MS/HS Progression Model | `ScenarioDecisionLeverSelections.msHsProgressionModel` (`scenarioDecisionLeverContract.ts`) -- `selectedOptionId: string \| null`, `selectionStatus: "needs_mapping"`. **Not** a field of `DreEngineInput` / `CapitalDecisionEngineInput`. | None in the production chain. `msHsStaffingReadinessContract.ts` / `msHsStaffingReadiness.ts` exist as a staffing-readiness audit only and are not consumed by `calculateDre`, `calculateFopag`, or `calculateReceita`. | None | **No** |
| Tuition | `tuitionScenarioId: TuitionScenarioId` (`bp1_division_differentiated \| bp2_ey_ls_unified \| bp3_ey_to_ms_unified`) on `DreEngineInput` | `receitaEngine.calculateReceita` | Revenue block (tuition/ticket rows) through `receita_operacional_liquida` -> `ebitda` | **Yes** (confirmed: S6 vs S2) |
| Service Contracts | `ScenarioDecisionLeverSelections.serviceContracts` (`selectedOptionId: string \| null`, `selectionStatus: "needs_mapping"`). **Not** a field of `DreEngineInput` / `CapitalDecisionEngineInput`. `serviceContractsEngineContract.ts` documents that Service Contracts values are "invariant across all scenario dimensions in v1" (confirmed by Luciana 2026-06-04) and are folded into `DRE_ANNUAL_ASSUMPTION_SOURCE_DATA` (`dreAnnualAssumptionSourceData.ts`) as fixed annual cost rows. | `dreAnnualAssumptionSourceData.ts` fixed-cost rows -> `calculateDre`'s `total_custos_e_despesas_fixas` | Fixed-cost lines (identical value in every scenario) -> `ebitda` | Present in every scenario's EBITDA as an invariant constant, but **not a selectable lever** -- cannot be varied through the production scenario input |
| CAPEX option | `capexOptionId: CapexOptionId` (`capex_90m_brl \| capex_100m_brl`) on `CapitalDecisionEngineInput` | `capitalDecisionEngine.computeCapitalDecisionBridgeCore` | `capexInvestmentPositiveBRL`, `fcoAfterCapexBRL`, `discountedCashFlowBRL`, `cumulativeDiscountedCashFlowBRL`, terminal value, `npvBRL`, `irrRate` | **Yes** (confirmed: S1 vs S2) |

Of the 7 levers named in the directive, **5 are wired into the production
input** (Opening Grades, Occupancy, Org Design Structure, Tuition, CAPEX
option) and all 5 demonstrably reach Phase 15D (see Step 4). **2 are not
wired** (MS/HS Progression Model, Service Contracts) -- see Step 7.

### Step 3: Scenario matrix (8 scenarios, valid production IDs only)

All scenarios use only IDs already accepted by `CapitalDecisionEngineInput`
(no invented scenario IDs). The canonical scenario
(`t1_g3` / `intermediario` / `bp1_division_differentiated` /
`balanced_experience`) is the same combination used as `VALIDATION_INPUT_BASE`
in `phase15cInvestmentMetricsEngineValidation.ts` (Phase 13F working
scenario).

| # | Label | openingPackageId | occupancyScenarioId | tuitionScenarioId | orgDesignOptionId | capexOptionId |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Canonical + R$90M | t1_g3 | intermediario | bp1_division_differentiated | balanced_experience | capex_90m_brl |
| S2 | Canonical + R$100M | t1_g3 | intermediario | bp1_division_differentiated | balanced_experience | capex_100m_brl |
| S3 | Lower occupancy | t1_g3 | pessimista | bp1_division_differentiated | balanced_experience | capex_100m_brl |
| S4 | Higher occupancy | t1_g3 | otimista | bp1_division_differentiated | balanced_experience | capex_100m_brl |
| S5 | Different opening package | t1_g6 | intermediario | bp1_division_differentiated | balanced_experience | capex_100m_brl |
| S6 | Different tuition scenario | t1_g3 | intermediario | bp2_ey_ls_unified | balanced_experience | capex_100m_brl |
| S7 | Different Org Design (premium) | t1_g3 | intermediario | bp1_division_differentiated | premium_experience | capex_100m_brl |
| S8 | Different Org Design (minimum) | t1_g3 | intermediario | bp1_division_differentiated | minimum_experience | capex_100m_brl |

Service Contracts comparison: **not produced**. As established in Step 1-2,
Service Contracts are not currently selectable through
`CapitalDecisionEngineInput` (`ScenarioDecisionLeverSelections.serviceContracts`
remains `selectionStatus: "needs_mapping"`, `selectedOptionId: null`). This is
reported as an integration gap (Step 7), not fabricated.

### Step 4: Single-lever isolation (paired-scenario comparisons)

All values below are actual outputs of
`calculateDiscountedPaybackForCapitalDecision()` (and, for ROL/EBITDA/learner
counts, of `calculateDre()`) for the listed inputs -- no fixtures.

**Pair A -- CAPEX (S1 vs S2).** Lever changed: `capexOptionId`
(`capex_90m_brl` -> `capex_100m_brl`); all other inputs identical (canonical).
DRE outputs (ROL/EBITDA by year, 2028 `numero_de_alunos`=228) are unchanged,
as expected (CAPEX does not feed `calculateDre`). Downstream
`capexInvestmentPositiveBRL`, `fcoAfterCapexBRL`, discounted cash flows,
`npvBRL`, cumulative DCF, and `irrRate` all change.
- S1: npvBRL=106,856,536.54; irrRate=0.17062; cumulativeDCF[2047]=12,946,724.60; payback status=`calculated`, compactValue=`"19"`, recoveryYear=2046.
- S2: npvBRL=100,550,051.64; irrRate=0.16538; cumulativeDCF[2047]=6,640,239.70; payback status=`calculated`, compactValue=`"20"`, recoveryYear=2047.

**Pair B -- Occupancy, lower (S2 vs S3).** Lever changed:
`occupancyScenarioId` (`intermediario` -> `pessimista`). 2028
`numero_de_alunos`: 228 -> 190. ROL/EBITDA lower in every year (e.g. 2028 ROL
20,548,544.28 -> 17,252,196.90; 2028 EBITDA -6,957,011.04 -> -9,123,683.87).
- S3: npvBRL=30,817,266.48; irrRate=0.13241; cumulativeDCF[2047]=-40,884,367.88; payback status=`not_reached_within_horizon`, compactValue=`"20+"`, recoveryYear=null.

**Pair C -- Occupancy, higher (S2 vs S4).** Lever changed:
`occupancyScenarioId` (`intermediario` -> `otimista`). 2028
`numero_de_alunos`: 228 -> 264. ROL/EBITDA higher in every year (e.g. 2028 ROL
20,548,544.28 -> 23,742,339.51; 2028 EBITDA -6,957,011.04 -> -3,830,646.96).
- S4: npvBRL=152,625,870.39; irrRate=0.18843; cumulativeDCF[2047]=41,661,092.29; payback status=`calculated`, compactValue=`"16"`, recoveryYear=2043.

**Pair D -- Opening Grades (S2 vs S5).** Lever changed: `openingPackageId`
(`t1_g3` -> `t1_g6`). 2028 `numero_de_alunos` unchanged (228), but ROL/EBITDA
differ in every year (e.g. 2028 ROL 20,548,544.28 -> 21,255,480.44; 2028
EBITDA -6,957,011.04 -> -6,076,132.99; 2047 ROL 280,737,239.78 ->
260,754,390.72).
- S5: npvBRL=68,369,728.80; irrRate=0.15222; cumulativeDCF[2047]=-11,378,763.55; payback status=`not_reached_within_horizon`, compactValue=`"20+"`, recoveryYear=null.

**Pair E -- Tuition (S2 vs S6).** Lever changed: `tuitionScenarioId`
(`bp1_division_differentiated` -> `bp2_ey_ls_unified`). 2028
`numero_de_alunos` unchanged (228); ROL/EBITDA differ in every year (e.g.
2028 ROL 20,548,544.28 -> 20,690,321.65; 2028 EBITDA -6,957,011.04 ->
-6,815,233.67).
- S6: npvBRL=59,350,472.45; irrRate=0.14785; cumulativeDCF[2047]=-18,102,053.02; payback status=`not_reached_within_horizon`, compactValue=`"20+"`, recoveryYear=null.

**Pair F -- Org Design, premium (S2 vs S7).** Lever changed:
`orgDesignOptionId` (`balanced_experience` -> `premium_experience`). 2028
`numero_de_alunos` unchanged (228); **ROL identical in every year** (revenue
block does not depend on org design), but EBITDA is lower in every year
(2028 EBITDA -6,957,011.04 -> -7,283,779.25; 2037 48,332,573.06 ->
47,780,505.05; 2047 134,825,698.26 -> 133,837,028.55).
- S7: npvBRL=97,153,219.51; irrRate=0.16367; cumulativeDCF[2047]=3,970,714.83; payback status=`calculated`, compactValue=`"20"`, recoveryYear=2047.

This pair illustrates the directive's expected case: **S2 and S7 both return
compactValue=`"20"`** (same label), but `npvBRL` (100,550,051.64 vs
97,153,219.51) and cumulative DCF at 2047 (6,640,239.70 vs 3,970,714.83) are
materially different -- proving propagation without a change in the compact
label.

**Pair G -- Org Design, minimum (S2 vs S8).** Lever changed:
`orgDesignOptionId` (`balanced_experience` -> `minimum_experience`). ROL
identical to S2 in every year; EBITDA higher in every year (2028 EBITDA
-6,957,011.04 -> -6,457,027.36; 2047 134,825,698.26 -> 136,338,448.60).
- S8: npvBRL=104,512,493.75; irrRate=0.16742; cumulativeDCF[2047]=9,489,838.66; payback status=`calculated`, compactValue=`"19"`, recoveryYear=2046.

**Pair H -- Org Design isolated (S7 vs S8, premium vs minimum, all other
levers held at canonical + capex_100m_brl).** ROL identical for both. EBITDA
materially different at every year (premium < minimum). npvBRL: 97,153,219.51
(S7) vs 104,512,493.75 (S8); cumulativeDCF[2047]: 3,970,714.83 vs
9,489,838.66; compactValue: `"20"` vs `"19"`. This isolates the Org Design
lever's effect independent of any other lever change.

### Step 5: Scenario payback output table

All values are actual outputs of the production wrapper
`calculateDiscountedPaybackForCapitalDecision()` / `calculatePhase15CInvestmentMetrics()`
/ `calculateDre()` for each scenario's own input -- not parity-fixture values.

| Scenario | Opening package | Occupancy | Tuition | Org design | Service Contracts | CAPEX | VPL (npvBRL) | 2047 cumulative DCF | Payback status | Compact value | Recovery year |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | t1_g3 | intermediario | bp1_division_differentiated | balanced_experience | (fixed, not selectable) | capex_90m_brl | 106,856,536.54 | 12,946,724.60 | calculated | "19" | 2046 |
| S2 | t1_g3 | intermediario | bp1_division_differentiated | balanced_experience | (fixed, not selectable) | capex_100m_brl | 100,550,051.64 | 6,640,239.70 | calculated | "20" | 2047 |
| S3 | t1_g3 | pessimista | bp1_division_differentiated | balanced_experience | (fixed, not selectable) | capex_100m_brl | 30,817,266.48 | -40,884,367.88 | not_reached_within_horizon | "20+" | null |
| S4 | t1_g3 | otimista | bp1_division_differentiated | balanced_experience | (fixed, not selectable) | capex_100m_brl | 152,625,870.39 | 41,661,092.29 | calculated | "16" | 2043 |
| S5 | t1_g6 | intermediario | bp1_division_differentiated | balanced_experience | (fixed, not selectable) | capex_100m_brl | 68,369,728.80 | -11,378,763.55 | not_reached_within_horizon | "20+" | null |
| S6 | t1_g3 | intermediario | bp2_ey_ls_unified | balanced_experience | (fixed, not selectable) | capex_100m_brl | 59,350,472.45 | -18,102,053.02 | not_reached_within_horizon | "20+" | null |
| S7 | t1_g3 | intermediario | bp1_division_differentiated | premium_experience | (fixed, not selectable) | capex_100m_brl | 97,153,219.51 | 3,970,714.83 | calculated | "20" | 2047 |
| S8 | t1_g3 | intermediario | bp1_division_differentiated | minimum_experience | (fixed, not selectable) | capex_100m_brl | 104,512,493.75 | 9,489,838.66 | calculated | "19" | 2046 |

For comparison only, the R$100M **workbook-parity fixture** (`phase15dR100mParitySourceData.ts`,
built from cached workbook `PnL!ROL`/`PnL!EBITDA`, not from `calculateDre`)
produces npvBRL=20,349,793.48, cumulativeDCF[2047]=-18,153,646.64, status=
`not_reached_within_horizon`, compactValue=`"20+"`. None of S1-S8's
production-derived values equal this fixture (Step 6).

### Step 6: Validation results

- **Dynamic derivation**: every one of S1-S8 runs through
  `calculateDiscountedPaybackForCapitalDecision()` (the full production
  chain). `|S1.npvBRL - fixtureNpv| > 1` and `|S2.npvBRL - fixtureNpv| > 1`
  (checks `dynamic_canonical_90m_differs_from_r100m_fixture`,
  `dynamic_canonical_100m_differs_from_r100m_fixture`) -- the production
  wrapper never returns the R$100M fixture. Changing only `capexOptionId`
  (S1 -> S2) recomputes `npvBRL`, cumulative DCF, and the compact payback
  value (check `lever_capex_90m_vs_100m_propagates`). `integratedBaselineParityStatus`
  is computed per-scenario and passed through `calculateCapitalDecisionBridge
  -> calculatePhase15CInvestmentMetrics -> calculateDiscountedPaybackForCapitalDecision`
  unchanged (check `scenario_parity_status_reflects_own_scenario`).
- **Lever propagation**: for each of the 5 wired levers (Opening Grades,
  Occupancy x2, Tuition, Org Design x3, CAPEX), at least one paired-scenario
  comparison shows a changed `npvBRL` and/or cumulative DCF reaching Phase
  15C, independently re-evaluated by Phase 15D (checks
  `lever_capex_90m_vs_100m_propagates`, `lever_occupancy_pessimista_propagates`,
  `lever_occupancy_otimista_propagates`, `lever_opening_grades_t1g6_propagates`,
  `lever_tuition_bp2_propagates`,
  `lever_org_design_premium_propagates_same_label_different_vpl`,
  `lever_org_design_minimum_propagates`,
  `lever_org_design_premium_vs_minimum_isolated_pair`). Per the directive, the
  Org Design lever (S2 vs S7) demonstrates that not every lever change need
  alter the compact label -- both return `"20"` with materially different
  `npvBRL`/cumulative DCF.
- **No leakage**: S1 (R$90M) and S2 (R$100M) -- same DRE scenario -- produce
  different `npvBRL` (checks `no_leakage_90m_vs_100m_npv_differs`) and each
  result's `capexOptionId` reflects its own input (check
  `no_leakage_capex_option_id_passthrough`). Repeated identical-input calls
  (S2 called twice) are deep-equal but not reference-identical -- deterministic,
  no shared mutable cache (check `deterministic_repeated_calls`). No
  production scenario (S1-S8) equals the R$100M fixture's `npvBRL` or
  `compactValue` by coincidence.
- **Technical-failure convention**: `compactValue: null` for technical
  failures (`blocked_missing_phase15c_inputs`, `invalid_cash_flow_series`)
  remains intact -- delegated to and confirmed by
  `DISCOUNTED_PAYBACK_ENGINE_VALIDATION_REPORT.allPass=true` (36/36, including
  the 10/10 technical-failure surface) (check
  `technical_failure_compact_value_null_preserved`). Not regressed to `""`,
  `"NA"`, or `"20+"`.

All 15 checks above are implemented in
`phase15dDecisionLeverPropagationValidation.ts` /
`phase15dDecisionLeverPropagationValidationContract.ts` and pass
(`PHASE15D_LEVER_PROPAGATION_VALIDATION_REPORT.allPass=true`, 15/15).

### Step 7: Unsupported / inactive levers

- **MS/HS Progression Model** -- classification: **contract exists but is not
  wired**. `ScenarioDecisionLeverSelections.msHsProgressionModel`
  (`scenarioDecisionLeverContract.ts`) defines the lever with
  `selectionStatus: "needs_mapping"` and `selectedOptionId: string | null`,
  but no concrete option-id type exists and `DreEngineInput` /
  `CapitalDecisionEngineInput` have no corresponding field. The related
  `msHsStaffingReadinessContract.ts` / `msHsStaffingReadiness.ts` are a
  staffing-readiness audit, not a calculation input. Smallest upstream
  correction: define a concrete `MsHsProgressionModelOptionId` type, decide
  which `calculateReceita`/`calculateFopag` inputs it should adjust, and add a
  field to `DreEngineInput`. This is a Phase 13/14-layer (DRE/receita/fopag
  contract) decision and reopens enrollment/staffing methodology -- out of
  scope for Phase 15D.2 and **not implemented**.
- **Service Contracts** -- classification: **intentionally fixed assumption**.
  `serviceContractsEngineContract.ts` states Service Contracts values are
  "invariant across all scenario dimensions in v1" (confirmed by Luciana
  2026-06-04) and are folded into `DRE_ANNUAL_ASSUMPTION_SOURCE_DATA` as fixed
  annual cost rows feeding `total_custos_e_despesas_fixas` in every scenario.
  `ScenarioDecisionLeverSelections.serviceContracts` also remains
  `selectionStatus: "needs_mapping"`, `selectedOptionId: null`. Because this
  is an explicit, dated v1 business-methodology decision (not a missing
  wire), no upstream correction is proposed; reopening it would reopen
  ratified methodology, which is out of scope.

### Lever classification (final, gate-confirmed)

Following Step 7, the final lever classification for the Phase 15D gate is:

- **Currently variable and production-wired** (all five scenario-tested in
  Step 3-6 above): Opening Grades, Occupancy, Org Design Structure, Tuition,
  CAPEX option.
- **Fixed approved model assumption**: Service Contracts. Service Contracts
  are represented as ordinary DRE cost-line rows within
  `DRE_ANNUAL_ASSUMPTION_SOURCE_DATA` -- they are **not** a separate
  simulator layer or a post-EBITDA engine. The approved workbook values are
  wired as fixed assumptions for the current version; no alternative Service
  Contracts option set has been approved, so no selector is required for the
  current Phase 15D gate. Service Contracts are **not double-counted** (see
  `dreServiceContractsReconciliation.ts` overlap reconciliation). That
  Service Contracts values are invariant across the tested scenarios (S1-S8)
  is the correct, approved behavior for this version and does **not** block
  Phase 15D.
- **Future upstream integration item**: MS/HS Progression Model (per Step 7
  classification: contract exists but is not wired into `DreEngineInput`).
  Not implemented in Phase 15D or Phase 15D.2.

Phase 15D.2 proved dynamic propagation across all five currently variable,
production-wired levers (Step 4-6).

### Step 8: Corrections applied

**None.** No accidental fixture use, dropped scenario inputs, cross-scenario
caching, overwritten parity metadata, or regressed `compactValue: null`
behavior was found in the Phase 15D production chain
(`calculateDiscountedPaybackForCapitalDecision`,
`calculatePhase15CInvestmentMetrics`, `calculateCapitalDecisionBridge`,
`calculateDre`). The discounted-payback formula, `"NA"`/`"20+"`/`"20"` rules,
recovery-search logic, and exclusions are unchanged from Phase 15D.

One **out-of-scope observation** was made during exploration (not part of the
required scenario matrix, and not corrected): passing a deliberately invalid
`orgDesignOptionId` (e.g. `"not_a_real_option"`, not used in any of S1-S8)
causes `payrollAdapter.buildPayrollAdapterInput` to return
`adapterStatus: "failed_unsupported_option"`, `calculationReady: false`, but
`calculateDre`'s `DreEngineOutput` carries no calculation-readiness field, and
neither `calculateCapitalDecisionBridge` nor `calculatePhase15CInvestmentMetrics`
detect this and set `calculationStatus` to a non-`"calculated"` value;
`calculateDiscountedPaybackForCapitalDecision` therefore returns
`status: "calculated"` with a numeric `compactValue` instead of a blocked
result with `compactValue: null`. This would only be reachable via an
invalid/invented `orgDesignOptionId`, which Step 3 explicitly prohibits, so it
does not affect S1-S8 or the validated 15/15 + 36/36 results above. If this
is to be corrected, the owner is `calculateDre`/`calculateCapitalDecisionBridge`
(Phase 13A/13E layer, `dreEngine.ts` / `capitalDecisionEngine.ts`) --
propagating `fopagOutput.calculationReady`/diagnostics into `DreEngineOutput`
and from there into `Phase15CResult.calculationStatus`. **Not fixed here**:
it is upstream of Phase 15D and reopens DRE/FOPAG-engine readiness semantics.

### Files created (2)

- `src/features/rio-scenario-resilience/model/phase15dDecisionLeverPropagationValidationContract.ts`
- `src/features/rio-scenario-resilience/model/phase15dDecisionLeverPropagationValidation.ts`

### Validation / build status (Phase 15D.2)

`npm run lint` (`tsc --noEmit`): clean. `npm run build`: succeeds (2807
modules, unchanged). `discountedPaybackEngineValidation.ts` (Phase 15D):
36/36 pass (unchanged). `phase15dDecisionLeverPropagationValidation.ts`
(Phase 15D.2, new): 15/15 pass.
`phase15cInvestmentMetricsEngineValidation.ts` (Phase 15C): 28/28 pass
(unchanged). `capitalDecisionEngineValidation.ts` (Phase 15B): 25/25 pass
(unchanged). `dreEngineValidation.ts`: 20/20 pass (unchanged). 2 new files
created, 1 existing file (`IMPLEMENTATION.md`, this section) updated. No
other files modified.

## Phase 15E-INVESTMENT-INTERPRETATION-AND-SCENARIO-COMPARISON

**Boundary**: Phase 15E consumes Phase 15C's committed `Phase15CResult`
(commit `94f2ebb`) and Phase 15D's committed `DiscountedPaybackResult`
(commit `0fbd188`) as read-only inputs and adds two outputs: (1) a per-scenario
**investment interpretation** of those results against the ratified TIR>WACC
reference, and (2) a **dimension-by-dimension comparison** between scenarios'
interpretations. It does **not** recalculate Receita, FOPAG, EBITDA, FCO,
CAPEX, DCF, VPL, TIR, or discounted payback -- every numeric figure in
`InvestmentInterpretationResult` is read directly from `Phase15CResult` /
`DiscountedPaybackResult`. No UI, no `App.tsx`/workbook/`HighSchoolTab.tsx`
changes.

### Files created (6)

1. `investmentInterpretationEngineContract.ts` -- `InvestmentReferenceStatus`,
   `NpvSign`, `Phase15EInterpretationSourceProvenance`,
   `Phase15EExplicitExclusions`, `ScenarioDecisionLeverTraceability`,
   `InvestmentInterpretationResult`, `InvestmentInterpretationEngineInput`.
2. `investmentInterpretationEngine.ts` -- pure core
   (`interpretInvestmentResult`) + production entry point
   (`calculateInvestmentInterpretation`, which calls
   `calculatePhase15CInvestmentMetrics()` exactly once and derives the
   `DiscountedPaybackResult` from that same `Phase15CResult` via
   `calculateDiscountedPayback({ phase15CResult })`).
3. `scenarioInvestmentComparisonContract.ts` -- `DimensionComparisonOutcome`,
   `ScenarioInvestmentInterpretationRecord`, `ScenarioInvestmentPairComparison`
   (+ its `explicitExclusions`), `ScenarioInvestmentComparisonResult`
   (+ its `explicitExclusions`).
4. `scenarioInvestmentComparison.ts` -- pure pairwise/scenario-set comparison
   (`compareInvestmentScenarioPair`, `compareInvestmentScenarios`) + production
   wrapper (`calculateScenarioInvestmentComparison`).
5. `phase15eInvestmentInterpretationValidationContract.ts` /
   `phase15eInvestmentInterpretationValidation.ts` -- 40 checks across
   interpretation-status, dimension-comparison, trade-off-detection,
   production scenario-matrix (S1-S8), and boundary surfaces (all pass).

### Governing investment reference

```ts
irrRate > investmentReferenceWaccRate
```

`investmentReferenceWaccRate` is
`CAPITAL_DECISION_DRIVER_SOURCE.operatingPeriodWaccRate` (currently `0.12`),
the canonical 2028+/final-projection-year/perpetuity WACC ratified in §16.5 of
`phase15CapitalDecisionArchitecture.md` (not `preOpsWaccRate`, not an average
across periods, and not a scenario-specific or hidden-workbook value). The
reference is evaluated **strictly**: `irrRate === investmentReferenceWaccRate`
does **not** meet the reference (`investmentReferenceStatus =
"does_not_meet_reference"`, `meetsInvestmentReference = false`,
`tirWaccSpreadRate = 0`).

### Interpretation precedence

- **§A Blocked upstream**: if Phase 15C `calculationStatus !== "calculated"`,
  or Phase 15D `status` is a technical-failure status
  (`"blocked_missing_phase15c_inputs"` | `"invalid_cash_flow_series"`) --
  `investmentReferenceStatus = "blocked_upstream"`,
  `meetsInvestmentReference = null`, `tirWaccSpreadRate = null`, and
  `npvSign = "unavailable"` when `npvBRL === null`. The technical reason
  (`calculationStatusReason`) is preserved verbatim; no investment result is
  inferred.
- **§B IRR unavailable**: if Phase 15C is `"calculated"` but
  `irrStatus` is `"no_sign_change"` or `"did_not_converge"`, or
  `irrRate === null` -- `investmentReferenceStatus = "irr_unavailable"`,
  `meetsInvestmentReference = null`, `tirWaccSpreadRate = null`. VPL and
  discounted payback remain reported.
- **§C IRR calculated**: `tirWaccSpreadRate = irrRate -
  investmentReferenceWaccRate`; `meetsInvestmentReference = irrRate >
  investmentReferenceWaccRate` (strict). Positive spread ->
  `"meets_reference"`; zero or negative spread -> `"does_not_meet_reference"`.
- **§D Multiple-root warning**: when `irrMultipleRootsPossible === true`, the
  calculated `investmentReferenceStatus` is retained as-is and an
  `interpretationNotes` entry warns that the reported `irrRate` may not be the
  unique root. No reconciliation against `npvBRL` and no recommendation are
  produced.

### VPL sign model

`npvSign` is a four-valued, factual sign independent of
`InvestmentReferenceStatus`: `"positive"` (`npvBRL > 0`), `"zero"`
(`npvBRL === 0`), `"negative"` (`npvBRL < 0`), `"unavailable"`
(`npvBRL === null`, i.e. blocked upstream). `npvBRL` itself is always reported
alongside `npvSign` (or `null` when unavailable); there is no `npvIsNegative`
boolean and no VPL pass/fail threshold.

### Discounted-payback pass-through

`discountedPaybackStatus`, `discountedPaybackYears`, and
`discountedPaybackCompactValue` are copied verbatim from Phase 15D's
`DiscountedPaybackResult` (`"1"`..`"20"`, `"20+"`, `"NA"`, or `null`). Phase
15E performs no recovery-search or discount-factor logic of its own.

### Decision-lever traceability

`ScenarioDecisionLeverTraceability` preserves the exact production input's
five currently-variable, production-wired levers verbatim:
`openingPackageId`, `occupancyScenarioId`, `tuitionScenarioId`,
`orgDesignOptionId`, `capexOptionId` (canonical IDs, no invented user-facing
labels). It also carries two fixed traceability notes, not selectable Phase
15E inputs:

- `serviceContracts: "fixed_approved_dre_assumption"` -- Service Contracts
  remain a fixed approved DRE-cost-line assumption, invariant across
  scenarios (per Phase 15D.2's lever classification).
- `msHsProgressionModel: "future_upstream_integration_not_wired"` -- the
  MS/HS Progression Model remains a future upstream integration item, not
  currently wired into any production input (per Phase 15D.2's lever
  classification).

### Scenario comparison: dimensions, not a ranking

`scenarioInvestmentComparison.ts` compares two
`InvestmentInterpretationResult`s across **four independent dimensions** --
`investmentReferenceComparison`, `tirWaccSpreadComparison`,
`discountedPaybackComparison`, `npvComparison` -- each yielding a
`DimensionComparisonOutcome` (`"scenario_a_stronger"` |
`"scenario_b_stronger"` | `"equal"` | `"not_comparable"`). No unapproved
priority is established between payback, TIR-WACC spread, and VPL; the four
dimensions are reported side by side and never combined.

- **Investment reference**: `meets_reference` is stronger than
  `does_not_meet_reference`; identical statuses are `"equal"`;
  `irr_unavailable` is `"not_comparable"` against either calculated status
  (never ranked above or below `does_not_meet_reference`); `blocked_upstream`
  is `"not_comparable"`.
- **TIR-WACC spread**: comparable only when both spreads are finite; higher
  spread is stronger; equal within `1e-9` is `"equal"`; a `null` spread (IRR
  unavailable or blocked) is `"not_comparable"`.
- **Discounted payback**: numeric vs numeric -- lower is stronger; numeric vs
  `"20+"` -- numeric is stronger; `"20+"` vs `"20+"` -- `"equal"`; `"NA"`
  (negative-VPL, a distinct economic/status condition, not a duration) vs
  anything -- `"not_comparable"`; `null` (technical failure) vs anything --
  `"not_comparable"`.
- **VPL**: comparable only when both `npvBRL` values are finite; higher VPL is
  stronger; equal within R$1 is `"equal"`; `null` is `"not_comparable"`. This
  is a factual comparison -- VPL carries no independent pass/fail threshold.

### Trade-off detection

`tradeOffsPresent = true` when the comparable, non-equal dimensions do not all
favor the same scenario (e.g. scenario A has the shorter discounted payback
while scenario B has the higher VPL or TIR-WACC spread). `tradeOffNotes` are
plain factual sentences (e.g. *"Scenario A has the shorter discounted payback,
while Scenario B has the higher VPL."*); when the payback dimension is
`"equal"`, an explicit note records the shared compact outcome. No trade-off
is ever converted into a recommendation.

### Scenario-set comparison and explicit exclusions

`compareInvestmentScenarios` / `calculateScenarioInvestmentComparison` produce
all `C(n,2)` pairwise comparisons in input order, plus
`notComparableScenarioIds` (scenarios with `investmentReferenceStatus ===
"blocked_upstream"`). Input scenario order is preserved throughout.

`InvestmentInterpretationResult.explicitExclusions`,
`ScenarioInvestmentComparisonResult.explicitExclusions`, and each
`ScenarioInvestmentPairComparison.explicitExclusions` all declare
`tierTaxonomy`, `weightedScore`, `totalRanking`, `overallWinner`, and
`boardRecommendation` as `"excluded"` (plus, on the interpretation result,
`receitaRecalculation` / `fopagRecalculation` / `ebitdaRecalculation` /
`fcoRecalculation` / `capexRecalculation` / `dcfRecalculation` /
`npvRecalculation` / `irrRecalculation` / `discountedPaybackRecalculation` /
`uiInterpretation`, all `"excluded"`). Phase 15E defines **no Tier taxonomy,
no traffic-light classification, no weighted/composite score, no
total/lexicographic ranking, no "overall winner"/"preferred scenario" field,
no sorted best-to-worst list, and no approve/reject/invest recommendation**.
Neither type has a `rank`, `score`, `winnerScenarioId`, or
`preferredScenario` field.

### Production scenario matrix (S1-S8, reused from Phase 15D.2)

All eight production scenarios meet the investment reference
(`investmentReferenceStatus = "meets_reference"`), with independently-derived
spreads, VPLs, and discounted-payback outcomes:

| Scenario | irrRate | tirWaccSpreadRate | npvBRL | discountedPaybackCompactValue |
| --- | --- | --- | --- | --- |
| S1_canonical_90m | 0.17062 | 0.05062 | R$106.86M | 19 |
| S2_canonical_100m | 0.16538 | 0.04538 | R$100.55M | 20 |
| S3_pessimista_100m | 0.13241 | 0.01241 | R$30.82M | 20+ |
| S4_otimista_100m | 0.18843 | 0.06843 | R$152.63M | 16 |
| S5_t1g6_100m | 0.15222 | 0.03222 | R$68.37M | 20+ |
| S6_bp2_100m | 0.14785 | 0.02785 | R$59.35M | 20+ |
| S7_premium_100m | 0.16367 | 0.04367 | R$97.15M | 20 |
| S8_minimum_100m | 0.16742 | 0.04742 | R$104.51M | 19 |

S7 (premium) and S2 (balanced) share `discountedPaybackCompactValue="20"` but
differ in `npvBRL` and `tirWaccSpreadRate` -- the org-design trade-off remains
visible despite the identical payback label, and is reported, not collapsed.
For S1-S8, no pairwise comparison yields `tradeOffsPresent=true`: every
comparable, non-equal dimension consistently favors the same scenario in each
pair (e.g. S1 > S2 on spread, VPL, and payback alike) -- a factual outcome of
this particular scenario set, not an assumption built into the comparison
logic.

### Phase 15F boundary

**Phase 15F** is expected to own UI presentation of the
`InvestmentInterpretationResult` / `ScenarioInvestmentComparisonResult`
produced by Phase 15E (e.g. surfacing `investmentReferenceStatus`,
`tirWaccSpreadRate`, `npvBRL`/`npvSign`, `discountedPaybackCompactValue`, and
`tradeOffNotes` per scenario/pair). Phase 15E implements no UI, no Tier/score
widgets, and no `App.tsx` changes.

### Validation / build status (Phase 15E)

`npm run lint` (`tsc --noEmit`): clean. `npm run build`: succeeds.
`phase15eInvestmentInterpretationValidation.ts` (Phase 15E, new): 40/40 pass.
`phase15dDecisionLeverPropagationValidation.ts` (Phase 15D.2): 15/15 pass
(unchanged). `discountedPaybackEngineValidation.ts` (Phase 15D): 36/36 pass
(unchanged). `phase15cInvestmentMetricsEngineValidation.ts` (Phase 15C):
28/28 pass (unchanged). `capitalDecisionEngineValidation.ts` (Phase 15B):
25/25 pass (unchanged). `dreEngineValidation.ts`: 20/20 pass (unchanged). 6
new files created, 1 existing file (`IMPLEMENTATION.md`, this section)
updated. No other files modified.

## Phase 15F-SCENARIO-OUTPUT-UI-IMPLEMENTATION — Capital Decision UI

Feature-local "Capital Decision" view (`components/CapitalDecision/`) for
the Rio Scenario Resilience preview, exposing the five currently variable,
production-wired decision levers (Opening Grades, Occupancy, Org Design
Structure, Tuition, CAPEX). Each saved scenario configuration maps to exactly
one `calculateInvestmentInterpretation()` call (Phase 15E); only the scenario
whose lever changed is recalculated. Pairwise comparison (section C) reuses
already-computed results via `compareInvestmentScenarioPair()` -- no
additional recalculation.

### UI option sources (new, no invented values)

- `data/occupancyOptions.ts`: canonical IDs `pessimista` / `intermediario` /
  `otimista` with pt-BR labels "Pessimista" / "Intermediário" / "Otimista".
- `data/capexOptions.ts`: canonical IDs `capex_90m_brl` / `capex_100m_brl`
  with UI labels "R$ 90 milhões" / "R$ 100 milhões" (distinct from the
  calculation-source labels in `capexOptionSource.ts`, which remains
  unchanged).

### Decision-lever state correction

`DecisionLeverId` (in `components/DecisionLevers/leverTypes.ts`) is now
exactly `openingGrades | occupancy | orgDesignStructure | tuition | capex`
-- `serviceContracts` removed, since Service Contracts is a fixed approved
DRE assumption, not a selectable lever. `DecisionLeversPanel.tsx` renders
`ServiceContractsLever` as non-interactive informational content (component
file retained, not deleted). The new Capital Decision UI's own Service
Contracts / MS-HS Progression notes are rendered as explanatory context in
`ScenarioConfigurationPanel.tsx`, not via `ServiceContractsLever`.

### Status language (strict TIR-vs-WACC)

`capitalDecisionViewModel.ts`'s `getInvestmentReferenceStatusDisplay()`
implements the ratified language verbatim: "TIR exceeds the X% reference
WACC." for `meets_reference`; "TIR is equal to or below the X% reference
WACC." (with an optional equal-to-WACC vs below-WACC detail note from the
actual spread, same machine status) for `does_not_meet_reference`; "TIR
could not be calculated for this scenario." plus `irrStatusReason` for
`irr_unavailable`; and the exact `calculationStatusReason` for
`blocked_upstream`, with no investment conclusions shown while blocked.

### Page structure

`CapitalDecisionView.tsx` orchestrates: (A) `ScenarioConfigurationPanel`
(up to 4 saved scenarios, name/duplicate/add/remove, 5 lever selectors +
fixed/future context); (B) `ScenarioResultPanel` for the selected scenario
(calculation readiness -> TIR vs WACC -> TIR -> WACC -> spread -> VPL ->
discounted payback -> interpretation notes -> methodology disclosure, no
simple payback); (C) `ScenarioComparisonPanel` (A/B selection among saved
scenarios, factual dimension-by-dimension comparison and trade-off notes, no
overall winner/score/rank). `RioScenarioResiliencePreview.tsx` now renders
`CapitalDecisionView` directly; the earlier scaffold panels (`ScenarioFlowMap`,
`ScenarioFunnel`, `ScenarioOutputsPanel`, `RoleCostLibraryNotice`, standalone
`DecisionLeversPanel`) are no longer rendered there but remain in
`components/` (not deleted). `App.tsx` is unchanged.

### Phase 15E barrel exports

`model/index.ts` now also exports `investmentInterpretationEngineContract`,
`investmentInterpretationEngine`, `scenarioInvestmentComparisonContract`, and
`scenarioInvestmentComparison` -- the four modules the UI calls. No
validation modules were added to the barrel (no prior Phase 15B-15E module
was exported there either, so there is no convention to extend).

### Phase 15F validation (new)

`model/phase15fUiIntegrationValidation.ts` / `...ValidationContract.ts`:
21/21 checks pass, covering option-source canonical IDs/labels, the 5-lever
set (no `serviceContracts`), every lever option producing a `calculated`
result, status-text/label/spread-sign correctness, VPL/payback formatting,
pairwise-comparison non-recalculation and absence of winner/score/rank
fields, `MAX_SAVED_SCENARIOS === 4`, and explicit-exclusions boundary.

### Validation / build status (Phase 15F)

`npm run lint` (`tsc --noEmit`): clean. `npm run build`: succeeds.
`phase15fUiIntegrationValidation.ts` (new): 21/21 pass.
`phase15eInvestmentInterpretationValidation.ts`: 40/40 pass (unchanged).
`phase15dDecisionLeverPropagationValidation.ts`: 15/15 pass (unchanged).
`discountedPaybackEngineValidation.ts`: 36/36 pass (unchanged).
`phase15cInvestmentMetricsEngineValidation.ts`: 28/28 pass (unchanged).
`capitalDecisionEngineValidation.ts`: 25/25 pass (unchanged).
`dreEngineValidation.ts`: 20/20 pass (unchanged). `git diff --check`: clean.

## Phase 15F.4-DRE-VALIDATION-AND-PERMANENT-BROWSER-QA-CLOSURE

### Commit A: DRE validation repository closure

The Phase 15F commit (53ebbf7) referenced `dreEngineValidation.ts` (20/20
pass) in the validation status section but the file and its 3 transitive
dependencies were untracked and therefore not reproducible from a clean
checkout. This commit closes that gap.

**Four previously-untracked model files committed:**
- `model/dreEngineValidation.ts` — entry point; `runDreEngineValidation()`
  returns 20-check `DreEngineValidationReport`
- `model/dreEngineValidationContract.ts` — types only, no local imports
- `model/scenarioCalculationBoundaryContract.ts` — type contracts for
  calculation boundary; imports `revenueInputs` (committed) and
  `payrollAdapterContract` (committed)
- `model/opexCapexAdapterContract.ts` — imports only `revenueInputs`
  (committed)

All other imports of `dreEngineValidation.ts` were already committed:
`dreEngine`, `receitaEngine`, `receitaEngineContract`, `fopagEngine`,
`dreRevenueDriverSourceData`, `dreAnnualAssumptionSourceData`,
`dreScenarioAdapters`, and `inputReadinessRegistry`. The dependency chain is
now bounded and fully committed.

**Aggregate validator added:** `scripts/validate-phase15f.ts`
Runs all 7 phase validators in order via `npm run validate:phase15f`
(`tsx scripts/validate-phase15f.ts`). Expected output: 185/185.

Phase order and counts:
- DRE: 20/20 (`runDreEngineValidation`)
- Phase 15B: 25/25 (`runCapitalDecisionEngineValidation`)
- Phase 15C: 28/28 (`runPhase15CInvestmentMetricsValidation`)
- Phase 15D: 36/36 (`runDiscountedPaybackEngineValidation`)
- Phase 15D.2: 15/15 (`runPhase15DLeverPropagationValidation`)
- Phase 15E: 40/40 (`runPhase15EInvestmentInterpretationValidation`)
- Phase 15F: 21/21 (`runPhase15FUiIntegrationValidation`)

`npm run lint` (`tsc --noEmit`): clean after committing the 4 files.
`npm run validate:phase15f`: **185/185** (0 fail).

### Commit B: Permanent Phase 15F browser QA

Converts the Phase 15F.2 one-shot QA harness into permanent, deterministic,
repository-committed browser-QA infrastructure.

**Files added:**
- `playwright.config.ts` — Playwright config; `webServer` auto-starts Vite
  on port 4175 (`vite preview --port 4175`)
- `tests/phase15f/phase15f.spec.ts` — 56-assertion spec using the
  `playwright` library (chromium); covers default-load, lever selection,
  scenario save/remove, scenario comparison, strict-language invariants,
  forbidden-term sweep, ARIA structure
- `.gitignore` — adds `test-results/` and `playwright-report/`

**Script:** `npm run qa:phase15f` (`tsx tests/phase15f/phase15f.run.ts`)
runs the spec against a Vite preview server on port 4175.

`npm run qa:phase15f`: **58 pass / 0 fail**.

## Phase 15G.2 — DRE-owned Capital Decision workflow (integrated)

### Summary

Phase 15G.1 (read-only audit, no code changes) concluded that DRE owns
scenario creation and that Capital Decision needs an explicit DRE-to-Capital-
Decision handoff. Phase 15G.2 implements that handoff as a full production
integration committed in one atomic change.

### Architecture decisions

- **DRE state lifted above AnimatePresence** (`useState` for
  `dreSelections` in `App.tsx`) so lever selections survive tab navigation.
- **Persistent workspace hook** (`useCapitalDecisionWorkspace`) holds Capital
  Decision session state above the AnimatePresence boundary for the same
  reason. No localStorage, sessionStorage, URL state, Redux, or Zustand.
- **No transient handoff event.** `importFromDre()` is synchronous, returns
  `ImportFromDreResult`, and state persists for the session lifetime.
- **Pure state layer** (`state/capitalDecisionWorkspace.ts`): all
  transitions are pure functions accepting a `BuildResultFn` parameter —
  testable without React or a browser.
- **`stateRef` atomic pattern**: controller actions read `stateRef.current`,
  compute the next state via a pure transition, write
  `stateRef.current = nextState`, call `setState(nextState)`, and return the
  result synchronously.
- **Duplicate detection uses 4 DRE fields only** (not CAPEX). Duplicate
  check happens BEFORE capacity check.
- **`nextScenarioOrdinal` is monotonic** — never resets.
- **Dual-mode `CapitalDecisionView`**: standalone (`mode="standalone"`)
  preserves Phase 15F exactly (local state, all 5 levers editable). Integrated
  (`mode="integrated"`) uses the workspace controller; DRE fields are
  read-only labels; only CAPEX is editable.
- **`IntegratedCapitalDecisionScenario` extends `SavedScenario`** structurally —
  assignable to `SavedScenario` without casts, so
  `ScenarioComparisonPanel` / `ScenarioResultPanel` need no changes.
- **Phase 15F QA preserved**: `tests/phase15f/qa-main.tsx` updated to
  `mode="standalone"`, 58/0 continues to pass.

### Files created

- `src/features/rio-scenario-resilience/state/capitalDecisionWorkspace.ts`
  — pure state types, transitions, controller interface. No React.
- `src/features/rio-scenario-resilience/hooks/useCapitalDecisionWorkspace.ts`
  — React hook implementing `CapitalDecisionWorkspaceController` with the
  `stateRef` atomic pattern.
- `scripts/validate-phase15g2.ts` — 25 pure checks.
- `tests/phase15g2/qa-entry.html` — browser QA entry point (port 4176).
- `tests/phase15g2/qa-main.tsx` — renders full `<App />` for QA.
- `tests/phase15g2/dre-capital-handoff.run.ts` — Playwright browser QA:
  DRE send, integrated view, read-only DRE fields, CAPEX edit, duplicate
  detection, DRE state persistence, 19 checks.

### Files modified

- `src/hooks/useDreScenarioSimulator.ts` — made controlled; exports
  `DRE_DEFAULT_SELECTIONS`.
- `src/components/sections/DreScenarioSimulatorTab.tsx` — accepts controlled
  props + `onSendToCapitalDecision` + `onNavigateToCapitalDecision`; adds
  "Send to Capital Decision" button.
- `src/features/rio-scenario-resilience/components/CapitalDecision/capitalDecisionUiTypes.ts`
  — adds re-exports from `state/capitalDecisionWorkspace.ts`.
- `src/features/rio-scenario-resilience/components/CapitalDecision/ScenarioConfigurationPanel.tsx`
  — adds `IntegratedScenarioConfigurationPanel` for integrated mode.
- `src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx`
  — dual mode (`standalone` / `integrated`); badge updated to "Phase 15 ·
  Capital Decision".
- `src/features/rio-scenario-resilience/RioScenarioResiliencePreview.tsx`
  — accepts discriminated `mode` prop.
- `tests/phase15f/qa-main.tsx` — `mode="standalone"` added.
- `src/App.tsx` — lifts DRE state, adds `useCapitalDecisionWorkspace`,
  adds `"capital-decision"` tab, wires handoff callback.
- `package.json` — adds `validate:phase15g2` and `qa:phase15g2` scripts.

### Validation gates (all passed)

- `npm run lint` (`tsc --noEmit`): **exit 0** (clean).
- `npm run build` (`vite build`): **exit 0** (2843 modules transformed).
- `npm run validate:phase15f`: **185/185** (0 fail) — no regressions.
- `npm run validate:phase15g2`: **25/25** pass, 0 fail — all pure state
  checks pass; monotonic-ordinal invariant (check 25) included.
- `npm run qa:phase15f`: **58 pass / 0 fail** — Phase 15F standalone mode
  unaffected.
- `npm run qa:phase15g2`: see browser QA section below.

### CAPEX exclusion invariants (unchanged)

- CAPEX was not added to `DreEngineInput`, the DRE engine, the DRE selector
  panel, or the DRE result model.
- No financial engines, contracts, or formulas were touched.
- `HighSchoolTab.tsx` was not staged.

## Phase 15H.1 — Secondary educator capacity architecture audit

### Audit purpose

Phase 15H.1 is a documentation-only, repository-wide audit of the current
Middle School and High School educator-capacity architecture against the
locked mature secondary planning model: 9 educators serving Middle School,
11 educators serving High School, and 20 educators in the combined mature
secondary pool.

This phase does not implement educator-capacity, staffing, timetable, UI,
data, payroll, or calculation changes. Production logic was not changed.

### Architecture-discovery scope

The audit reconstructed current runtime behavior before comparing it with
the locked model. The discovery scope included MS/HS tab components, load and
schedule models, Executive Org Design integration, source-of-truth/readiness
registries, payroll/headcount adapters, shared-specialist roles, validators,
documentation, and relevant Git history.

### Files inspected

Primary inspected files:
- `src/components/sections/MiddleSchoolTab.tsx`
- `src/components/sections/middleSchoolLoadModel.ts`
- `src/components/sections/HighSchoolTab.tsx`
- `src/components/sections/highSchoolScheduleModel.ts`
- `src/components/sections/ExecutiveOrgDesignTab.tsx`
- `src/features/rio-scenario-resilience/model/msHsStaffingReadiness.ts`
- `src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts`
- `src/features/rio-scenario-resilience/model/payrollAdapter.ts`
- `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts`
- `src/features/rio-scenario-resilience/data/sourceOfTruthMap.ts`
- `src/features/rio-scenario-resilience/data/orgDesignScenarioExtensions.ts`
- `src/constants/teaching.ts`
- `src/constants/leadership.ts`
- `src/lib/payroll/domain.ts`
- `src/hooks/useStaffingLogic.ts`
- `src/components/sections/AGENTS.md`
- `src/features/rio-scenario-resilience/docs/payrollStaffingRuleSourceTrace.md`
- `src/features/rio-scenario-resilience/docs/msHsProgressionModelSourceSemantics.md`
- `src/features/rio-scenario-resilience/docs/orgDesignLogic.md`
- `README.md`
- this `IMPLEMENTATION.md`

Audit report:
- `docs/secondary-educator-capacity-audit.md`

### Canonical locked model assessed

- Middle School: 8 core educators + 1 flexible programme educator = 9.
- High School: 10 core educators + 1 flexible programme educator = 11.
- Combined mature secondary pool: 18 core educators + 2 flexible educators
  = 20.
- Scheduled learner-facing load range: 26-28 blocks per educator per week,
  with a 27-block planning midpoint.

### Verified current architecture

- Middle School currently has executable core-slot logic that derives the
  mature 8-core-educator model at Grades 6-8, 2 sections per grade. It does
  not currently add the locked flexible programme educator or calculate the
  9-educator programme-capacity margin.
- Middle School programme rows calculate weekly programme slots, but do not
  assign owners, validate educator-delivery demand, or prove that programme
  functions fit within residual educator capacity.
- High School currently exposes a 10-FTE/core-educator ramp and course-offer
  scaffolding. It does not calculate the locked 11-educator HS model, the
  216-core-block mature demand, the 104 raw programme blocks, or the 23
  required efficiency block equivalents at the 27-block midpoint.
- Executive Org Design consumes MS/HS core educator readiness counts only:
  8 MS core educators and 10 HS core educators. It does not currently consume
  the locked 9/11/20 total serving-division model.
- Shared specialists and counselors exist elsewhere in the org design. Body &
  Movement, Creative Hub, AP Research support, Innovation Diploma support,
  language/elective educators, and counselor-owned Pathways/college support
  require explicit double-counting boundaries before the 20-educator model is
  implementation-ready.

### Major gaps

- No executable flexible programme educator model for MS or HS.
- No combined 20-educator secondary pool model.
- No consistent 26-28 load-policy contract with 27 as planning midpoint.
- No role-level residual-capacity ledger for MS programme absorption.
- No HS raw-vs-delivery ledger proving the 23-block efficiency requirement
  at the 27-block midpoint.
- No AP replacement/course-choice allocator preventing double counting.
- No timetable validator for double blocks, educator conflicts, simultaneous
  electives/AP demand, Advisory/project synchronization, room/lab constraints,
  daily load, or shared-role conflicts.
- Payroll/headcount logic still contains duplicated hardcoded MS/HS values
  that differ from tab-derived readiness semantics.

### Validation status

Phase 15H.1 added documentation only. It did not add new validators and did
not change existing runtime validators. The repository's normal validation
commands were run after the documentation update and are recorded in the
audit report and final response for this phase.

### Unresolved blockers

- Board approval must remain conditional until a master timetable validates
  the 20-educator envelope.
- The HS model must prove legitimate programme-delivery efficiencies rather
  than hiding the raw `320 - 297 = 23` block-equivalent difference at the
  27-block midpoint.
- Shared specialists and counselors must be counted once and assigned clear
  programme boundaries.
- Flexible programme educator activation years are not evidenced and must not
  be inferred.
- Current Executive Org Design and payroll consumers must be reconciled before
  educator counts become financial-model authority.

### Phase status

Phase 15H.1 read-only audit: **complete**.

Educator-capacity implementation: **not started**.

Timetable validation implementation: **not started**.

Board readiness: **conditional only; not complete**.

### Next recommended implementation phase

The next phase should implement a secondary schedule-envelope and load-policy
contract before changing UI-facing educator counts. That phase should define
raw learner section-blocks, educator-delivery blocks, the 26-28 load range,
the 27-block midpoint, and formula validators for the locked MS and HS mature
models. Only after that contract is validated should the app implement MS
9-educator capacity, HS 11-educator capacity, programme ownership, shared-role
boundaries, Executive Org Design integration, and payroll reconciliation.

## Phase 15H.2 — Secondary educator capacity model implementation

### Objective

Implement the canonical secondary educator-capacity model identified by the
Phase 15H.1 audit:

- 9 educators serving mature Middle School: 8 core + 1 flexible.
- 11 educators serving mature High School: 10 core + 1 flexible.
- 20 educators in the mature combined secondary instructional planning pool:
  18 core + 2 flexible.
- 26-28 scheduled learner-facing blocks as the mature load range, with 27 as
  the planning midpoint.

This phase is implementation work, not a second audit. It remains inside the
instructional-capacity planning boundary and does not wire payroll totals.

### Canonical model implemented

Created a pure TypeScript model:

- `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityModel.ts`

The model owns:

- shared timetable envelope: 5 days, 8 learner blocks/day, 40 learner blocks
  per section/week, 45 minutes/block, 2 sections per active grade;
- mature load policy: 26 minimum, 27 midpoint, 28 maximum;
- MS raw demand: `6 * 40 = 240`;
- MS core demand: `36 + 36 + 36 + 24 + 24 = 156`;
- MS programme demand: `240 - 156 = 84`;
- MS educator count: `8 core + 1 flexible = 9`;
- MS programme capacity at 27: `9 * 27 - 156 = 87`;
- MS midpoint margin: `87 - 84 = 3`;
- HS raw demand: `8 * 40 = 320`;
- HS core demand: `40 + 40 + 40 + 48 + 48 = 216`;
- HS raw programme demand: `320 - 216 = 104`;
- HS educator count: `10 core + 1 flexible = 11`;
- HS programme capacity at 27: `11 * 27 - 216 = 81`;
- HS required midpoint efficiency: `104 - 81 = 23`;
- combined raw learner demand: `240 + 320 = 560`;
- combined pool: `18 core + 2 flexible = 20`;
- board readiness status: `conditional`;
- timetable validation status: not validated.

### Files changed

Created:

- `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityModel.ts`
- `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityValidation.ts`
- `scripts/validate-phase15h2.ts`
- `tests/phase15h2/qa-entry.html`
- `tests/phase15h2/qa-main.tsx`
- `tests/phase15h2/secondary-capacity.run.ts`

Modified:

- `package.json` — added `validate:phase15h2` and `qa:phase15h2` scripts
- `src/features/rio-scenario-resilience/model/msHsStaffingReadinessContract.ts`
- `src/features/rio-scenario-resilience/model/msHsStaffingReadiness.ts`
- `src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts`
- `src/components/sections/MiddleSchoolTab.tsx` — canonical model display, `grid-cols-1` mobile fix
- `src/components/sections/HighSchoolTab.tsx` — canonical model display, `grid-cols-1` mobile fix
- `src/components/sections/highSchoolScheduleModel.ts`
- `IMPLEMENTATION.md`

### UI changes

Middle School:

- Added canonical mature MS planning envelope:
  `8 core + 1 flexible = 9`.
- Shows raw learner blocks `240`, core blocks `156`, programme blocks `84`,
  average load `26.67`, midpoint programme capacity `87`, and midpoint margin
  `3`.
- Shows role-level 27-block programme capacity by domain:
  Mathematics 18, ELA 18, Lingua Portuguesa 18, Natural Sciences 3, Social
  Sciences 3, Flexible Programme Educator 27.
- Keeps the Grade 6 launch cluster architecture distinct from the mature model.
- Relabels the 24-block threshold as a historical / launch-specific threshold,
  not the mature secondary load policy.
- Shows programme ownership/readiness entries from the canonical model.

High School:

- Added canonical mature HS planning envelope:
  `10 core + 1 flexible = 11`.
- Shows raw section-blocks `320`, core blocks `216`, raw programme blocks
  `104`, midpoint programme capacity `81`, and required midpoint efficiency
  `23`.
- Shows role-level 27-block programme capacity by domain:
  Lingua Portuguesa 14, Mathematics 14, English 14, Natural Sciences 6,
  Social Sciences 6, Flexible Programme Educator 27.
- Replaced the mature provisional core-load display with the canonical
  27-block-per-section core pattern.
- Corrected Grade 11-12 project language so Innovation Diploma Project is the
  active project progression, not Passion Projects.
- Shows programme ownership/readiness entries and AP replacement
  classifications from the canonical model.
- Keeps the HS model explicitly conditional and does not label it feasible.

Executive Org Design:

- Future-division nodes now show:
  - Middle School: `8 core + 1 flexible = 9`;
  - High School: `10 core + 1 flexible = 11`;
  - Combined: `18 core + 2 flexible = 20`.
- Added governance note that the 20-educator model is a mature
  instructional-capacity planning envelope, not payroll authorization.
- Shared specialist governance shows Body & Movement, Arts, Music,
  counselors, flexible programme educators, and legacy HS pool boundaries.

### Validators and browser QA created

Created pure deterministic validation coverage:

- `src/features/rio-scenario-resilience/model/secondaryEducatorCapacityValidation.ts`
- `scripts/validate-phase15h2.ts`
- package script: `npm run validate:phase15h2`

The validator contains 30 checks covering MS, HS, combined model, shared-role
double-counting, Passion Project / Innovation Diploma progression, and AP
replacement non-duplication.

Created permanent Playwright browser QA:

- `tests/phase15h2/qa-entry.html` — Vite-served HTML harness
- `tests/phase15h2/qa-main.tsx` — React entry point rendering the full App
- `tests/phase15h2/secondary-capacity.run.ts` — 46-assertion Playwright suite
- package script: `npm run qa:phase15h2`

The browser QA covers desktop (1440×1000), tablet (1024×900), and mobile
(390×844) viewports. Assertions target canonical arithmetic values, conditional
status labels, instructional-capacity / payroll-boundary notes, Innovation
Diploma Project wording, Language Acquisition Coach node, board condition, and
horizontal-overflow safety across all three viewports.

### Validation status

All Phase 15H.2 gates pass:

| Gate | Result |
|------|--------|
| `npm run validate:phase15h2` | 30/30 pass, 0 fail |
| `npm run qa:phase15h2` | 46/46 pass, 0 fail |
| Prior phase 15G regressions (`validate:phase15g2`) | 25/25 pass |
| Prior phase 15F regressions (`validate:phase15f`) | 185/185 pass |
| Prior browser QA (`qa:phase15g2`) | 19/19 pass |
| Prior browser QA (`qa:phase15f`) | 58/58 pass |
| `npm run lint` (`tsc --noEmit`) | clean |
| `npm run build` | clean (existing large-chunk warning only) |
| `git diff --check` | exit 0 |

Phase 15H.2 is closed. Timetable sufficiency remains conditional because the
phase intentionally does not build a master-timetable solver or assign the
required High School delivery efficiencies.

### Remaining timetable boundary

This phase does not build a complete master-timetable solver. It exposes:

- MS 3-block midpoint programme margin;
- HS 23-block midpoint efficiency requirement;
- programme ownership readiness;
- shared-role double-counting governance;
- timetable validation readiness as not validated.

It does not invent timetable efficiencies, manufacture programme owners, infer
operational combined-section delivery, or claim final feasibility.

### Board-readiness status

The core model is implemented and the 20-person planning envelope is
represented. Board readiness remains conditional. The UI must continue to state
that final sufficiency depends on programme ownership, shared-role
reconciliation, educator qualification mapping, AP/elective demand, and
master-timetable validation.

### Next phase

Build grade-level mock schedules and educator-concurrency validation. That
phase should test double blocks, synchronized Advisory/project blocks,
AP/elective concurrency, lab/room constraints, shared MS/HS role conflicts, and
whether the HS 23-block midpoint efficiency requirement is operationally
legitimate.

---

## Phase 15H.3 — PAUSED / DEFERRED

### Status

Phase 15H.3 has not started.

The next planned MS/HS phase, master-timetable feasibility validation, is
intentionally paused while implementation priority shifts to finalizing the DRE
Scenario Simulator and its board-facing decision workflow.

Phase 15H.2 remains complete and closed. The pause does not change the
validated mature instructional-capacity planning envelope:

- Middle School: 8 core + 1 flexible = 9 educators
- High School: 10 core + 1 flexible = 11 educators
- Combined secondary pool: 18 core + 2 flexible = 20 educators
- Scheduled load policy: 26–28 blocks
- Board readiness: conditional

### Deferred scope

The following work remains deferred and must not be treated as completed:

- grade-level master timetable construction;
- educator-level schedule construction;
- concurrency and double-booking validation;
- subject-qualification mapping;
- validation of double-block rules;
- final programme-ownership allocation;
- AP and elective demand confirmation;
- proof of the 23 High School block-equivalent delivery efficiencies;
- individual educator load validation against the 26–28 range;
- flexible programme-educator activation timing;
- payroll-adapter and FOPAG reconciliation.

### Re-entry condition

Phase 15H.3 should resume only after the DRE Scenario Simulator, scenario
handoff, and board-facing DRE decision workflow are finalized and closed.

When resumed, the phase must attempt to prove or disprove the operational
feasibility of the 9/11/20 planning envelope. It must not assume timetable
feasibility in advance.

### Active implementation priority

The active implementation priority is now:

DRE Scenario Simulator finalization

This includes completing the operational-scenario workflow, calculation
integrity, board-facing interpretation, application integration, regression
validation, browser QA, and clean-index reproducibility.

## Phase 15I.0 — DRE Simulator Governance Audit (read-only)

### Status

**Completed.** Outcome: Class B.

Phase 15I.0 was a read-only audit of the DRE Scenario Simulator's governance
state prior to Finance-source closure and board ratification. No files were
modified.

### Audit outcome (Class B)

All engineering gates passed. The following governance and Finance-source
blockers were identified and carried forward to Phase 15I.1:

1. `CALCULATION_CAN_BEGIN = false` semantically stale (engine calculates; gate reflects governance, not implementation).
2. `payroll_adapter_output` registry entry stale (said "missing_adapter_implementation"; Phase 15H.2 established the instructional-capacity model; FOPAG sync remains pending).
3. "CAPEX excluded until Phase 15" badge in `DreScenarioContextBanner.tsx` stale (CAPEX is now in Capital Decision).
4. No explicit three-state governance structure (engineering / Finance / board).
5. Six unresolved Finance-source open items not consolidated into a single queryable registry.

---

## Phase 15I.1 — DRE Governance-State and Finance-Source Closure Preparation
## Phase 15I.1 Closure Correction — Readiness Semantics, Capital Handoff Disclosure, and Browser QA

### Status

**Implemented and corrected.** Commit: `"Clarify DRE governance and Finance readiness"` (2026-06-16), amended by Phase 15I.1 Closure Correction.

### Objective

Prepare the DRE Scenario Simulator for formal Finance-source closure and board
ratification by:

- establishing an explicit three-state governance architecture;
- exposing all unresolved Finance assumptions in a consolidated, queryable registry;
- creating a permanent 24-check validator and a browser QA suite;
- updating the DRE Scenario Context Banner with the three-state disclosure.

**Closure Correction (Phase 15I.1 Closure):** Two semantic defects were corrected:
1. `"missing_payroll_fopag_synchronization"` was an incorrect classification — both models are implemented; the correct blocking reason is `"reconciliation_required"`.
2. `CALCULATION_CAN_BEGIN` was incorrectly derived from Finance/board confirmation gates. It now derives from engineering readiness + calculation availability, evaluating to `true`. Finance and board status are independent gates (`FINANCE_SOURCE_CLOSURE_COMPLETE = false`, `BOARD_RATIFICATION_READY = false`).

### Files created

| File | Purpose |
|------|---------|
| `src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts` | Three-state governance state + six Finance-source open items + payroll model state |
| `src/features/rio-scenario-resilience/model/dreGovernanceReadinessValidation.ts` | 24-check validator (updated for closure correction) |
| `scripts/validate-phase15i1.ts` | `npm run validate:phase15i1` entry point |
| `tests/phase15i1/qa-entry.html` | Playwright QA harness HTML |
| `tests/phase15i1/qa-main.tsx` | React root for QA harness |
| `tests/phase15i1/dre-governance-readiness.run.ts` | Playwright QA runner (22/22 pass) |

### Files modified

| File | Change |
|------|--------|
| `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts` | Remove `"missing_payroll_fopag_synchronization"` from `InputBlockingReason`; add `"reconciliation_required"`; update `payroll_adapter_output.blockingReason`; derive `CALCULATION_CAN_BEGIN` from engineering readiness (= `true`) |
| `src/features/rio-scenario-resilience/model/dreEngineValidation.ts` | Check 20: `CALCULATION_CAN_BEGIN === false` → `FINANCE_SOURCE_CLOSURE_COMPLETE === false` |
| `src/features/rio-scenario-resilience/model/dreEngineValidationContract.ts` | Rename check ID to `"finance_source_closure_incomplete"` |
| `src/features/rio-scenario-resilience/components/CapitalDecision/CapitalDecisionView.tsx` | Add compact inherited DRE governance disclosure (engine validated / Finance pending / not ratified) |
| `src/components/dreSimulator/DreScenarioContextBanner.tsx` | Replace stale "CAPEX excluded until Phase 15" badge with "CAPEX in Capital Decision"; add three-state governance disclosure panel |
| `src/hooks/useDreScenarioSimulator.ts` | Update stale `CALCULATION_CAN_BEGIN remains false` comment |
| `package.json` | Add `validate:phase15i1` and `qa:phase15i1` scripts |

**Untracked validators corrected (all had `CALCULATION_CAN_BEGIN === false` checks):** `dreScenarioAdaptersValidation.ts`, `dreEbitdaEngineReadinessValidation.ts`, `dreEnrollmentCapacityLeverValidation.ts`, `dreFormulaParityValidation.ts`, `dreEbitdaBacktestValidation.ts`, `dreRevenueBlockReconciliationValidation.ts`, `dreRevenueDriverSourceValidation.ts`, `dreScenarioAdapterDesignValidation.ts`, `dreWorkingScenarioValidation.ts`, and their contract files. All migrated to `FINANCE_SOURCE_CLOSURE_COMPLETE === false`.

### Governance architecture

```
DRE_GOVERNANCE_READINESS.engineeringReadiness      → "engineering_ready"
DRE_GOVERNANCE_READINESS.calculationAvailability   → "available"
DRE_GOVERNANCE_READINESS.financeSourceReadiness    → "pending_finance_confirmation"
DRE_GOVERNANCE_READINESS.boardRatificationReadiness → "not_ratified"
DRE_GOVERNANCE_READINESS.instructionalCapacityStatus → "established"
DRE_GOVERNANCE_READINESS.payrollFopagModelStatus    → "implemented"
DRE_GOVERNANCE_READINESS.payrollCapacityAlignmentStatus → "reconciliation_required"
```

`CALCULATION_CAN_BEGIN = true` (engineering ready + calculation available).
`FINANCE_SOURCE_CLOSURE_COMPLETE = false` (Finance sources not yet confirmed).
`BOARD_RATIFICATION_READY = false` (board has not ratified a scenario).

### Six Finance-source open items

| Key | Status |
|-----|--------|
| `outras_receitas_reajuste` | `pending_finance_confirmation` |
| `descontos_metodo_formula_base` | `pending_finance_confirmation` |
| `tuition_source_provenance` | `provisional_source` |
| `discount_schedule_provenance` | `provisional_source` |
| `enrollment_baseline_parity` | `reconciliation_required` |
| `instructional_capacity_payroll_sync` | `reconciliation_required` |

All six items have `blocksEngineCalculation: false`, `blocksBoardRatification: true`, `calculationContinues: true`.

### Phase 15I.1 gates (closure correction)

| Gate | Result |
|------|--------|
| `npm run lint` | ✓ clean |
| `npm run validate:phase15i1` | ✓ 24/24 |
| `npm run validate:phase15h2` | ✓ 30/30 |
| `npm run validate:phase15g2` | ✓ 25/25 |
| `npm run validate:phase15f` | ✓ 185/185 |
| `npm run qa:phase15i1` | ✓ 22/22 |
| `npm run qa:phase15h2` | ✓ 46/46 |
| `npm run qa:phase15g2` | ✓ 19/19 |
| `npm run qa:phase15f` | ✓ 58/58 |
| `npm run build` | ✓ clean |
| `git diff --check` | ✓ clean |
| Staged-index gate | ✓ all validators + browser QA pass in exported tree |
| Canonical fixture 2028 enrollment | 228 learners ✓ |
| Canonical fixture first EBITDA-positive year | 2032 ✓ |

### What did NOT change

- No DRE engine formulas, Capital Decision formulas, or Viability formulas were changed.
- No tuition values, discount percentages, or enrollment values were changed.
- No FOPAG or payroll adapter calculations were changed.
- `WORKING_SCENARIO_RATIFICATION_STATUS` remains `"technical_validation_fixture"`.
- The 228-vs-246 enrollment parity question is not resolved; it is registered as an open Finance item.
- Phase 15H.3 remains deferred.

### Locked invariants (unchanged)

- Canonical fixture (t1_g3 / intermediario / bp1_division_differentiated / balanced_experience): 228 learners 2028, first EBITDA-positive 2032.
- Secondary instructional-capacity model: MS 9 educators, HS 11 educators, combined 20 (Phase 15H.2).
- `CALCULATION_CAN_BEGIN = true` (engine ready + availability confirmed). Finance-source confirmation and board ratification remain pending and independent.

---

## Phase 15I.2 — DRE Finance Confirmation Packet Preparation

### Status

**Implemented.** Commit: `"Prepare DRE Finance confirmation packet"` (2026-06-17).

### Objective

Prepare a structured Finance confirmation packet that presents the six open Finance-source
items (F01–F06) to the Finance team for formal review, enabling Finance-source closure and
subsequent board ratification.

Key governance constraints enforced:
- No DRE formula was changed.
- No source value was changed.
- No Finance item was marked confirmed.
- Board-ratification status was not changed.
- Capital Decision calculations were not modified.

### Files created

| File | Purpose |
|------|---------|
| `docs/finance/dre-finance-confirmation-packet.md` | Primary Finance confirmation packet in Brazilian Portuguese — 13 sections covering F01–F06 with decisions required, current engine behavior, source provenance, and approval fields |
| `docs/finance/dre-finance-confirmation-register.json` | Structured decision register — all 6 items with `decisionStatus: "open"`, all approval fields `null`, governance state snapshot |
| `docs/finance/dre-finance-confirmation-agenda.md` | 60-minute Finance confirmation session agenda covering F01–F06 with expected outcomes per item |
| `scripts/validate-phase15i2-packet.ts` | 25-check validator: file existence, F01–F06 presence, null approval fields, governance state invariants, enrollment documentation (228 and 246), payroll/capacity state, no forbidden wording |

### Files modified

| File | Change |
|------|--------|
| `package.json` | Add `validate:phase15i2-packet` script |
| `IMPLEMENTATION.md` | Add Phase 15I.2 history entry |

### Six Finance-source open items — documented state

| ID  | Key | Status | Engine behavior |
|-----|-----|--------|----------------|
| F01 | `outras_receitas_reajuste` | `pending_finance_confirmation` | Reajuste term omitted; `outrasReceitasRatio × numero_de_alunos` only |
| F02 | `descontos_metodo_formula_base` | `pending_finance_confirmation` | Assumed: `−desconto_metodo_rate × receita_de_ensino_liquida` |
| F03 | `tuition_source_provenance` | `provisional_source` | Screenshot-transcription-based; BP1 2028: EY R$91,390 / LS R$111,670 / MS R$122,419 / HS R$141,469 |
| F04 | `discount_schedule_provenance` | `provisional_source` | 20% (2028–2030), 17% (2031), 15% (2032–2033), 12.5% (2034+) |
| F05 | `enrollment_baseline_parity` | `reconciliation_required` | Engine: 228 (t1_g3/intermediario) / PnL workbook: ~246; neither declared authoritative |
| F06 | `instructional_capacity_payroll_sync` | `reconciliation_required` | Both models implemented; assumptions not yet formally reconciled |

### Enrollment parity documentation

| Source | Learners 2028 | Configuration |
|--------|---------------|--------------|
| Engine (canonical fixture) | 228 | t1_g3 / intermediario / bp1_division_differentiated / balanced_experience |
| PnL workbook (Phase 13B) | ~246 | Original workbook baseline (not mapped to engine scenario) |

Neither value is declared authoritative. Finance + Board must confirm the authoritative baseline and equivalent-scenario mapping.

### Phase 15I.2 gates

| Gate | Result |
|------|--------|
| `npm run validate:phase15i2-packet` | ✓ 25/25 |
| `npm run validate:phase15i1` | ✓ 24/24 |
| `npm run validate:phase15h2` | ✓ 30/30 |
| `npm run validate:phase15g2` | ✓ 25/25 |
| `npm run validate:phase15f` | ✓ 185/185 |
| `npm run lint` | ✓ clean |
| `npm run build` | ✓ clean |
| `git diff --check` | ✓ clean |
| 108 scenarios: 0 failures, 0 NaN, 0 Infinity | ✓ (established; no engine code changed) |
| Max EBITDA parity delta | 0 (established; no engine code changed) |
| Canonical fixture 2028 enrollment | 228 learners ✓ |
| Canonical fixture first EBITDA-positive year | 2032 ✓ |

### What did NOT change

- No DRE engine formulas, Capital Decision formulas, or Viability formulas were changed.
- No tuition values, discount percentages, or enrollment values were changed.
- No FOPAG or payroll adapter calculations were changed.
- `WORKING_SCENARIO_RATIFICATION_STATUS` remains `"technical_validation_fixture"`.
- `FINANCE_SOURCE_CLOSURE_COMPLETE` remains `false`.
- `BOARD_RATIFICATION_READY` remains `false`.
- `CALCULATION_CAN_BEGIN` remains `true`.
- The 228-vs-246 enrollment parity question is not resolved; it is registered as F05.
- Phase 15H.3 remains deferred.

### Locked invariants (unchanged)

- Canonical fixture (t1_g3 / intermediario / bp1_division_differentiated / balanced_experience): 228 learners 2028, first EBITDA-positive 2032.
- Secondary instructional-capacity model: MS 9 educators, HS 11 educators, combined 20 (Phase 15H.2).
- `CALCULATION_CAN_BEGIN = true` (engine ready + availability confirmed). Finance-source confirmation and board ratification remain pending and independent.

---

## Phase 15I.2C — DRE Workbook Formula Parity and Finance Registry Correction (2026-06-18)

### Summary

Corrected the DRE engine formula for Descontos Método de Assinatura (F02) and corrected the Finance registry to accurately distinguish formula defects, provenance gaps, and scenario reconciliation items.

### F02 — Engine Formula Correction

PnL workbook formula: `C230 = −C$13 × C225` where C225 = `receitas_com_ensino_regular`. Engine previously used `receita_de_ensino_liquida` as base — incorrect.

**Correction:** `descontos_metodo_de_assinatura = −desconto_metodo_rate × receitas_com_ensino_regular`

Source: `dreRevenueDriverSourceData.ts` Phase 12I/12K extraction, formula `Z13 = −Y230/Y225`.

**Impact on canonical fixture 2028:** descontos_metodo_de_assinatura: −565,739 → −629,776 (delta −64,037). EBITDA delta −60,312. All deltas fully explained by base correction. `outras_receitas` unchanged (delta 0).

### F01 — Branch B Determination (no engine change)

Formula mechanics confirmed: `C233 = ($Y233/$Y$221)*(1+C$9)*C$221`. Row-9 (reajuste_despesas) values not directly extracted in any committed source file. Stop condition 3 applies. Engine unchanged. Registry: F01 → `provisional_source`.

### Finance Registry Changes

| Item | Before | After |
|------|--------|-------|
| F01 | `pending_finance_confirmation` | `provisional_source` |
| F02 | `pending_finance_confirmation` | `resolved_engineering` (moved to resolvedItems) |
| F06 | `requiredOwner: Finance` | `requiredOwner: Finance + Academic` |
| Open item count | 6 | 5 |

### Phase 15I.2C gates

| Gate | Result |
|------|--------|
| `npx tsx scripts/validate-phase15i2c.ts` | ✓ 26/26 |
| `npx tsx scripts/validate-phase15i2-packet.ts` | ✓ 25/25 |
| `npx tsx scripts/validate-phase15i1.ts` | ✓ 24/24 |
| `npx tsx scripts/validate-phase15h2.ts` | ✓ 30/30 |
| `npx tsx scripts/validate-phase15f.ts` | ✓ 185/185 |
| `npm run build` | ✓ clean |

### Locked invariants (unchanged)

- Canonical fixture: 228 learners 2028, EBITDA positive by 2032.
- `CALCULATION_CAN_BEGIN = true`.
- `FINANCE_SOURCE_CLOSURE_COMPLETE = false`. `BOARD_RATIFICATION_READY = false`.
- 5 Finance open items (F01, F03, F04, F05, F06) block board ratification; engine calculates regardless.
- No tuition values, discount percentages, payroll, CAPEX, WACC, or DCF methodology changed.

---

## Phase 15J — Simulation-First Productization (2026-06-18)

### Summary

Reframed the Rio DRE and Capital Decision app as a simulation-first tool. Finance-source confirmation and board ratification are displayed as governance metadata, not as blockers. Simulation runs regardless of both governance states.

### What changed

**DRE Scenario Context Banner (`DreScenarioContextBanner.tsx`)**
- "Simulation Available" (green pill) is now the primary state signal.
- "Source confirmation pending" (amber) and "Board ratification pending" (slate) are shown as secondary metadata alongside simulation availability.
- The amber "DRE Governance Readiness" title replaced with three explicit state badges.
- Footer copy updated: "Simulation runs regardless of Finance-source confirmation or board ratification status."

**Assumption Status Panel (`DreAssumptionStatusPanel.tsx`) — new**
- Displays F01/F03/F04/F05/F06 as pending assumption metadata.
- F02 displayed only as `resolved_engineering`.
- Explicitly notes: "does not block simulation."
- Shows `blocksEngineCalculation: false` semantics for all open items.

**Board-Readable Export (`DreBoardReadableExport.tsx`) — new**
- Per-scenario text block including: inputs, key outputs (learners 2028, first EBITDA-positive year, EBITDA 2028/2032/2037), and mandatory provisional-source caveat.
- Caveat text: "This scenario is technically calculated and internally consistent. It is NOT Finance-source confirmed and NOT board-ratified."
- Copy-to-clipboard button.

**DRE Scenario Simulator Tab (`DreScenarioSimulatorTab.tsx`)**
- Added `DreAssumptionStatusPanel` and `DreBoardReadableExport` after the annual table.

**Scenario Comparison Panel (`ScenarioComparisonPanel.tsx`)**
- Extended with "Scenario output overview" table including: Scenario name, Opening package, Occupancy, Tuition scenario, Org design option, Learners 2028, First EBITDA-positive year, EBITDA 2028, EBITDA 2032, EBITDA 2037, Cumulative EBITDA (2028–2047), VPL/NPV, TIR, Discounted payback, Source-status warning count.
- DRE fields computed via `calculateDre(input)` per scenario.
- Source-status warning count: constant 5 (global open items, same for all scenarios).
- No winner row, no ranking, no recommendation.
- Section heading uses neutral language: "Scenario output comparison."
- Pairwise dimension table retitled "Sensitivity" (not "Winner").

### Simulation is available

```
Can calculate:              yes
Can simulate:               yes
Can compare scenarios:      yes
Finance-source confirmed:   not yet
Board-ratified:             not yet
```

Finance-source gaps are shown as assumption-status labels (F01, F03, F04, F05, F06), not as blockers.

### F02 status

F02 (`descontos_metodo_formula_base`) remains `resolved_engineering`. It is displayed as resolved, not as an open item. The open item count is 5.

### F01/F03/F04/F05/F06 display

All five items are displayed as assumption metadata only. Each has `blocksEngineCalculation: false` and `calculationContinues: true`. None block simulation.

### Phase 15J gates

| Gate | Result |
|------|--------|
| `npm run validate:phase15j` | ✓ 21/21 |
| `npm run qa:phase15j` | ✓ 12/12 |
| `npm run validate:phase15i2c` | ✓ 26/26 |
| `npm run validate:phase15i2-packet` | ✓ 25/25 |
| `npm run validate:phase15i1` | ✓ 24/24 |
| `npm run validate:phase15h2` | ✓ 30/30 |
| `npm run validate:phase15g2` | ✓ 25/25 |
| `npm run validate:phase15f` | ✓ 185/185 |
| `npm run lint` | ✓ clean |
| `npm run build` | ✓ clean |
| `git diff --check` | ✓ clean |
| 108 scenarios: 0 NaN, 0 Infinity | ✓ |
| DRE-to-Capital EBITDA parity delta | 0 (no engine change) |

### What did NOT change

- No DRE engine formulas changed.
- No Capital Decision engine formulas changed.
- No tuition, discount, or enrollment values changed.
- `FINANCE_SOURCE_CLOSURE_COMPLETE` remains `false`.
- `BOARD_RATIFICATION_READY` remains `false`.
- `CALCULATION_CAN_BEGIN` remains `true`.
- F02 remains `resolved_engineering`.
- F01/F03/F04/F05/F06 remain open with `blocksEngineCalculation: false`.
- 108 scenarios remain finite.
- DRE-to-Capital EBITDA parity: zero delta.

### Locked invariants (unchanged)

- Canonical fixture: 228 learners 2028, EBITDA positive by 2032.
- `CALCULATION_CAN_BEGIN = true`.
- `FINANCE_SOURCE_CLOSURE_COMPLETE = false`. `BOARD_RATIFICATION_READY = false`.
- 5 Finance open items (F01, F03, F04, F05, F06) — block board ratification only; engine calculates regardless.
- CAPEX excluded from DRE EBITDA; in Capital Decision only.
- Service Contracts included once in DRE as cost lines.

---

## Phase 15L — Staffing Consistency and Board-Language Repair (2026-06-18)

### Summary

Resolved all S1 and S2 findings from the Phase 15K Academic Staffing and Org Design Consistency Audit. The S1 finding was a staffing arithmetic defect that displayed "Middle School: 10.00 FTE" instead of the canonical 9 educators. Six S2 findings removed premature board-approval framing from the UI.

**Audit classification before this phase:** C (one S1 + multiple S2 = not ready for board use).

### Locked staffing model (authoritative, unchanged by this phase)

| Segment | Core | Flexible | Total |
|---------|------|----------|-------|
| Middle School | 8 | 1 | 9 |
| High School | 10 | 1 | 11 |
| Combined secondary | 18 | 2 | 20 |

Load range: 26–28 blocks. Planning midpoint: 27 blocks.

### Findings resolved

| ID | Severity | File | Change |
|----|----------|------|--------|
| F-5.9-01 | S1 | `LoadTab.tsx` | `msFte = 9`, `hsFte = 11`; removed `HS_FULL_RAMP_FTE = 10` constant |
| F-5.9-02 | S2 | `LoadTab.tsx` | Replaced "PASS: Current…parity with São Paulo standards." → non-certifying internal planning target text |
| F-5.4-01 | S2 | `App.tsx` | Global eyebrow: "Board Review" → "Planning Model" |
| F-5.4-01 | S2 | `App.tsx` | Header subtitle: "São Paulo Parity Scaling v2.5" → "Internal planning reference" |
| F-5.3-01 | S2 | `executiveOrgDesignModel.ts` | Rail item: label "Board condition" → "Planning status"; value "Conditional approval language" → "Planning model — not board-ratified headcount authorization." |
| F-5.8-01 | S2 | `HighSchoolTab.tsx` | Badge: "Conditional approval" → "Timetable validation pending" |
| F-5.8-02 | S2 | `HighSchoolTab.tsx` | `HS_STAFFING_VALIDATION_NOTE`: removed "8-HC HS Educator Pool" internal diagnostic; replaced with canonical 10+1=11 educator model description |
| F-5.9-03 | S2 | `ViabilitySimulatorTab.tsx` | "current approved model" → "current planning model" |

### What did NOT change

- No DRE engine formulas changed.
- No Capital Decision engine formulas changed.
- No tuition, discount, CAPEX, Service Contracts, VPL, TIR, or DRE source data changed.
- `FINANCE_SOURCE_CLOSURE_COMPLETE` remains `false`.
- `BOARD_RATIFICATION_READY` remains `false`.
- F-category items not addressed (S3/S4 findings deferred to Phase 15L.2).
- F02 remains `resolved_engineering`.

### Phase 15L gates

| Gate | Result |
|------|--------|
| `npm run validate:phase15l` | ✓ 18/18 |
| `npm run qa:phase15l` | ✓ 16/16 |
| `npm run validate:phase15j` | ✓ 21/21 |
| `npm run qa:phase15j` | ✓ 12/12 |
| `npm run validate:phase15i2c` | ✓ 26/26 |
| `npm run validate:phase15i2-packet` | ✓ 25/25 |
| `npm run validate:phase15i1` | ✓ 24/24 |
| `npm run validate:phase15f` | ✓ 185/185 |
| `npm run lint` | ✓ clean |
| `npm run build` | ✓ clean |
| `git diff --check` | ✓ clean |

### Phase 15L.1 wording refinement (same commit, 2026-06-18)

Global eyebrow label refined: "Planning Model" → "Strategic Planning". Rationale: "Strategic Planning" works correctly above all 13 non-cover tabs including DRE Scenario Simulator and Decisão de Capital; "Planning Model" read as model-specific on finance surfaces. Phase 15H.2 browser QA updated to reflect the Phase 15L badge replacement ("Conditional approval" → "Timetable validation pending"); three stale checks renamed and updated accordingly.

---

## Phase 15L.2 — Academic Staffing Content Cleanup (2026-06-18)

Resolves S3/S4 content-coherence findings from the Phase 15K Academic Staffing and Org Design Consistency Audit. No finance formulas, DRE source data, Capital Decision formulas, payroll/FOPAG formulas, or governance readiness flags were modified.

### Findings resolved

| ID | Finding | Fix |
|----|---------|-----|
| F-5.5-01 | EarlyYearsTab T2 max displayed as 30 (was 30, should be 28 = 14 cap × 2 sections) | `EarlyYearsTab.tsx`: `max: 30` → `max: 28` for Toddlers 2 |
| F-5.6-01 | LowerSchoolTab G4/G5 max displayed as 44 (should be 48 = 24 cap × 2 sections) | `LowerSchoolTab.tsx`: `max: 44` → `max: 48` for Grade 4 and Grade 5 |
| F-5.4-03 | Cluster naming divergence: HiringProfileCardsTab used "Signature Cluster" / "Bilingual Cluster" while OfferScenariosTab used "Global Studies / Project Design" | `HiringProfileCardsTab.tsx`: renamed to "Global Studies & Project Design" and "Language Acquisition & Global Perspectives"; `OfferScenariosTab.tsx` grade6ClusterModel string updated to ampersand form |
| F-5.4-02 | `ROLE_SCORECARDS` partial-coverage disclosure missing in HiringProfileCardsTab | Added disclosure banner: "These cards describe selected instructional cluster profiles…not a complete hiring authorization list…" |
| G-03 | After School naming inconsistency: `leadership.ts` used "After School Educator"; `executiveOrgDesignModel.ts` already used "After School Coordinator" | `leadership.ts` SPECIALISTS_CONFIG: renamed to "After School Coordinator" |
| G-04 | Inspirationeer/Librarian cross-reference gap: `leadership.ts` used "Inspirationeer"; `executiveOrgDesignModel.ts` used "Librarian" | `leadership.ts` BACKOFFICE_CONFIG: "Inspirationeer" → "Inspirationeer / Librarian"; `executiveOrgDesignModel.ts` line 693: "Librarian" → "Inspirationeer / Librarian" |

### Files changed

| File | Change |
|------|--------|
| `src/components/sections/EarlyYearsTab.tsx` | T2 max 30 → 28 |
| `src/components/sections/LowerSchoolTab.tsx` | G4 and G5 max 44 → 48 |
| `src/components/sections/HiringProfileCardsTab.tsx` | Cluster tile renames + disclosure paragraph |
| `src/components/sections/OfferScenariosTab.tsx` | grade6ClusterModel string: slash → ampersand |
| `src/constants/leadership.ts` | After School Educator → Coordinator; Inspirationeer → Inspirationeer / Librarian |
| `src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts` | Librarian → Inspirationeer / Librarian (line 693) |
| `scripts/validate-phase15l2.ts` | New: 27-check static validator |
| `tests/phase15l2/academic-staffing-content.run.ts` | New: 25-check browser QA |
| `package.json` | Added validate:phase15l2 and qa:phase15l2 scripts |

### Constraints preserved

- `HS_SUBJECT_DISTRIBUTION` calculation keys "Signature" and "Bilingual" in `teaching.ts` unchanged.
- Role id keys `"after_school"` and `"library"` in `leadership.ts` unchanged (referenced by `getExistingRoleHeadcount()`).
- `FINANCE_SOURCE_CLOSURE_COMPLETE = false`, `BOARD_RATIFICATION_READY = false` unchanged.
- No DRE formulas, Capital Decision formulas, payroll/FOPAG formulas, or Finance source data modified.

### Phase 15L.2 gates

| Gate | Result |
|------|--------|
| `npm run validate:phase15l2` | ✓ 27/27 |
| `npm run qa:phase15l2` | ✓ 25/25 |
| `npm run validate:phase15l` | ✓ 18/18 |
| `npm run qa:phase15l` | ✓ 16/16 |
| `npm run validate:phase15j` | ✓ 21/21 |
| `npm run validate:phase15h2` | ✓ 30/30 |
| `npm run lint` | ✓ clean |
| `npm run build` | ✓ clean |
| `git diff --check` | ✓ clean |
