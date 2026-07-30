# V10-RC2.5 Gate 3 / Tranche B — Grade Staffing Table scope decision

> **Superseded in part (2026-07-30, Gate 3/Tranche C):** the "Master/Associate
> only" Educator tier restriction described below was reversed by explicit
> product-owner instruction. All five `EDUCATOR_LEVELS` tiers (Associate,
> Specialist, Master, Inspirational, Distinguished) are now governed and
> selectable — each carries complete, Finance-provided compensation figures
> in `src/constants/teaching.ts`; the earlier restriction was an
> adapter-layer costSourceId taxonomy gap, not missing data. Every other
> scope decision on this page (Grade 6 division-level-only, MS/HS
> division-level aggregation, Assistant fixed single tier) is UNCHANGED and
> still governs. See `EDUCATOR_TIER_COST_TABLE` in `payrollAdapter.ts` for
> the current five-tier cost table.

## Decision

The shared Grade Staffing Table (`src/components/common/GradeStaffingTable.tsx`,
rendered identically from `ExecutiveOrgDesignTab.tsx` and
`PayrollProjectionTab.tsx`) renders:

- One row per Early Years / Lower School grade, each with its own Educator
  tier selector (Master/Associate — the two source-backed tiers established
  in Tranche A).
- One row for Grade 6, `division_level_only` (no per-grade educator count,
  no tier selector) — unchanged from the disposition established in
  RC2.3 Gate 5 and RC2.4 Gate 1 evidence-matrix item 4.
- Middle School and High School as division-level aggregate cards (not
  individual grade rows), each with ONE Educator tier control that fans out
  to every grade in that division's governed fixed-FTE table
  (`MS_FTE_BY_GRADE` / `HS_FTE_BY_GRADE` in `payrollAdapter.ts`).
- Assistant as a fixed, read-only badge (no selector) — exactly one governed
  Assistant compensation tier exists (confirmed by the RC2.5 Gate 1 trace).

## Why Middle School / High School are NOT broken into per-grade rows

`buildOrgDesignHcTable()` deliberately aggregates Middle School and High
School into one division-wide team row rather than one row per grade. This
is not an oversight — it is the outcome of two prior, deliberately-argued
phases:

- RC2.3 Gate 5 (`phase-v10-rc2-3-gate9-turma-and-staffing-source-discrepancies.md`
  and related Gate 5 disposition docs): Grade 6 was added as its own row
  specifically because governed grade-level enrollment/section data exists
  for it, while explicitly declining to extend the same treatment to G7+.
- RC2.4 Gate 1 evidence-matrix item 4: confirmed the underlying
  `payrollAdapter.ts` records ARE per-grade internally (fixed FTE per grade,
  not per-section), but the display/aggregation layer collapses them into
  one division row, and that collapse was preserved rather than reversed.
- F06 (blocker register, `phase-v10-rc2-2-gate1-blocker-register.json`):
  three non-identical MS/HS staffing sources exist in this repository,
  unreconciled. The EY/LS rule (educators = sections) must not be
  extrapolated to MS/HS. Rendering individual MS/HS grade rows with
  per-grade headcount would assert a level of grade-level governance for
  those figures that does not exist — the actual governed artifact is a
  division-level fixed-FTE envelope, not a reconciled grade breakdown.

RC2.5's own directive is explicit on this point: "preserve the canonical
division and incremental activation semantics established through RC2.3,
RC2.4 and RC2.4A... do not translate MS/HS staffing into an unsupported
one-educator-per-section formula." Inventing per-grade MS/HS rows now would
be a third, unrequested architectural reversal on an axis three prior
phases already settled — not a Tranche B requirement.

## Why the Educator tier control is division-level for MS/HS, not per-grade

`payrollAdapter.ts`'s tier resolution (`resolveEducatorTier`) and the shared
selection state (`useEducatorTierSelection.ts`) are keyed per grade — the
same granularity as EY/LS — so a future phase could expose per-grade MS/HS
tier selection without a data-model change. Tranche B does not expose that
per-grade control in the UI (only a division-level control that fans out to
every grade in the division), because the UI would otherwise imply a
per-grade MS/HS staffing narrative this phase deliberately does not adopt
(see above). The underlying storage is per-grade; the UI affordance is
division-level. This is a UI scope boundary, not a data-model limitation.

## Tranche C addendum — export scope

**The fixed-matrix Payroll export (`payrollExportWorkbookBuilder.ts`,
`payrollExportScenarioAdapter.ts`, `PayrollExportMatrixTab.tsx`) is
out of scope for Tranche C and was left unmodified.** That surface has no
props and builds every one of its 12 workbooks from
`PAYROLL_EXPORT_MATRIX` — each record pins its own
openingPackageId/occupancyScenarioId/orgDesignOptionId independent of any
live UI state. It cannot see the live Educator tier selection because it is
not a live-state surface at all; it is a fixed, governed-scenario
certification export. Adding an "Educator Tier" column there that always
reads "Master" would misrepresent an unmade selection as a real one. If a
future phase wants tier-selectable fixed-matrix exports, that is a new
governance decision (which tier per matrix record, and why), not a
mechanical extension of Tranche C.

**What Tranche C DID extend**, because these are genuinely live-state
surfaces reading the shared `educatorTierSelection`:
- `dreScenarioWorkbook.ts` (used by `PayrollProjectionTab.tsx`'s download
  button — the "live Payroll export"): `computeOrgDesignPayrollVariants()`
  now accepts and threads `educatorTierByGrade` to all three org-design
  variants (previously only the currently-selected variant reflected a live
  tier choice; the other two silently defaulted to Master). "Educator Tier"
  columns were added to the `Payroll Detail - {Minimum,Balanced,Premium}`
  and `FOPAG Headcount Plan` sheets, sourced from
  `FopagCalculatedRecord.educatorTierId` (new field, Tranche C — a plain
  pass-through from `PayrollAdapterRecord.educatorTierId`, added in
  `fopagEngineContract.ts`/`fopagEngine.ts`).
- A brand-new Org Design export
  (`orgDesignExportWorkbookBuilder.ts`, triggered from
  `ExecutiveOrgDesignTab.tsx`'s header) — none existed before this phase.
  Six sheets: Scenario Configuration, Grade Staffing (grade-level rows +
  MS/HS division-aggregate rows, tier IDs/names, fixed Assistant
  classification), Role Payroll Detail, FOPAG Payroll Projection,
  FOPAG-DRE Reconciliation, Diagnostics. Formula cells
  (`{t,v,f}` pattern, `SUMIF`/cross-sheet references) follow the exact
  convention `payrollExportWorkbookBuilder.ts` already established; no
  compensation logic is reimplemented — every number comes from
  `calculateFopag()`/`calculateDre()`. `buildRoleYearDetails()` (in
  `payrollExportWorkbookBuilder.ts`) was refactored to accept
  `readonly FopagCalculatedRecord[]` directly instead of the fixed-matrix
  `PayrollExportScenarioResult` wrapper — it never used any other field of
  that wrapper — so the new Org Design export reuses the identical
  salary/encargos/benefits escalation logic rather than re-deriving it. All
  three pre-existing call sites (`payrollExportWorkbookBuilder.ts` itself,
  `payrollExportSummaryWorkbookBuilder.ts`, `payrollExportManifest.ts`, and
  the matrix validator script) were updated to pass `.fopagOutput.records`;
  full 34-script validator sweep confirmed byte-identical results after the
  refactor.

The new Org Design export's Grade Staffing sheet follows the SAME
division-level-for-MS/HS scope boundary as the Tranche B UI (see above) —
it does not invent per-grade MS/HS rows either.

## Effect on the 35-assertion validator (Tranche D)

Assertions phrased as "renders one row for every active governed grade"
must be read against this scope boundary: EY/LS/Grade 6 render one row per
grade; Middle School and High School render one row per DIVISION (each
representing every grade in that division's governed fixed-FTE table).
Tranche D's validator and Final Report must classify this as
**scope-limited: MS/HS governed at division level, per RC2.3 Gate 5 / RC2.4
Gate 1 evidence-matrix item 4** — not as a defect, and not by inventing rows
to satisfy the literal wording.
