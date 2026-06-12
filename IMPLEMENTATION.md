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
