# V10-RC2.4A — High School educator allocation reconciliation

**Phase:** V10-RC2.4A — correction to a mischaracterized RC2.4 disposition. Does
not reopen RC2.4's turma/section correction, which is preserved unmodified (see
`phase-v10-rc2-4-gate1-2-evidence-matrix-and-source-authority.md` and
`IMPLEMENTATION.md`, "Phase V10-RC2.4").

## Why this phase exists

RC2.4 (commit `c268857`) recorded the following as a single, self-reconciled,
in-session product-owner correction:

> HS `{g9:4, g10:0, g11:3, g12:3}` (was `{g9:4, g10:0, g11:3, g12:3}`, briefly
> `{g9:4, g10:2, g11:3, g12:3}` mid-session before the final reconciliation), sum
> 11 = 10 core + 1 flexible.

The product owner's direct correction on 2026-07-30 was **Grade 8 = 2 FTE,
Grade 10 = 2 FTE**. RC2.4's committed code instead shipped `g10:0, g11:4` — moving
the Grade 10 FTE to Grade 11 to preserve the pre-existing 11-FTE total. That
reassignment was not approved. This phase corrects the record and the code.

## Gate 1 — RC2.4 staffing diff (as committed in `c268857`)

`payrollAdapter.ts`: `MS_FTE_BY_GRADE` `{g6:3,g7:4,g8:3}` → `{g6:3,g7:4,g8:2}`
(uncontested — matches the product-owner statement and the canonical
`MIDDLE_SCHOOL_CANONICAL_FULL_MODEL.fullModelTotalEducators=9`).
`HS_FTE_BY_GRADE` `{g9:4,g10:0,g11:3,g12:3}` → `{g9:4,g10:0,g11:4,g12:3}` — g10
stayed 0 (not the stated 2); g11 was bumped 3→4 to keep the sum at 11. Claimed
reason: "corrected by Luciana 2026-07-30, V10-RC2.4 Gate 6." Claimed provenance:
in-session self-reconciliation. Actual evidence located for the reassignment: none
beyond RC2.4's own prose (no separate transcript, workbook citation, or canonical
model supports `g11=4`). Explicitly approved by the product owner: **no** — per
this phase's directive, "That substitution was not approved."

`orgDesignPayrollActivation.ts`: three descriptive citations updated to match the
same `g10:0/g11:4` values, same unproven reassignment.

No other file in the RC2.4 diff (`msHsStaffingReadiness.ts`, canonical MS/HS
models, FOPAG/DRE/export adapters, staffing validators) was touched by RC2.4 —
confirmed via `git show c268857 --name-only` and per-file `git show` diffs
(all zero-line diffs for those files).

## Gate 2/3 — canonical model trace and meaning of the per-grade values

Two independent, pre-existing (not created for this dispute) canonical sources
were traced:

1. **`secondaryEducatorCapacityModel.ts`** (`SECONDARY_EDUCATOR_CAPACITY_MODEL`):
   a subject-**domain** model (Portuguese, Mathematics, English, Natural
   Sciences, Social Sciences — 2 educators each = 10 core) + 1 flexible
   programme educator = 11, computed once for the whole HS division at full
   maturity (4 grades × 2 sections). This model has no per-grade axis at all —
   it cannot be decomposed into "grade 9's educators" vs "grade 10's educators."
   `payrollWired: false` throughout; explicitly "does not wire payroll totals."

2. **`msHsStaffingReadiness.ts`** (`HIGH_SCHOOL_CANONICAL_FULL_MODEL`,
   `governanceStatus: "user_validated_simulator_modeling_rule"`, pre-existing,
   not created this phase):
   ```
   rampIncrementFteByGrade:  { g9: 4, g10: 0, g11: 3, g12: 3 }
   cumulativeFteByGrade:     { g9: 4, g10: 4, g11: 7, g12: 10 }
   fullModelCoreEducators: 10, fullModelFlexibleProgrammeEducators: 1,
   fullModelTotalEducators: 11
   ```
   This is unambiguously **interpretation B (Gate 3)**: incremental FTE added
   when each grade opens, accumulating to a running total. `HighSchoolTab.tsx`
   (the actual tab/model source this canonical file cites as its authority)
   independently and repeatedly confirms the same semantics in its own UI text:
   *"Grade 10 extends the Grade 9 launch package — not a separate FTE step
   without validation,"* *"No separate Grade 10 FTE step beyond the launch
   package, pending validation,"* *"Grade 11 is the next provisional expansion
   point... bringing the current HS teaching-capacity assumption to 7 FTE,"*
   *"Grade 12 completes the current cumulative planning ramp at 10 FTE."* These
   four statements are structurally embedded in the tab's own descriptive data
   (`src/components/sections/HighSchoolTab.tsx`), not authored for this dispute.

   `payrollAdapter.ts`'s `MS_FTE_BY_GRADE`/`HS_FTE_BY_GRADE` loop (section 4)
   applies each grade's FTE constant for every year that grade is `active`, and
   sums across all currently-active grades for that year's division cost. Because
   each grade's FTE never changes once active, this is arithmetically identical
   to the canonical model's incremental-cumulative ramp — both produce the same
   division total at full maturity. The two models agree exactly on semantics
   (interpretation B) and, pre-RC2.4, agreed exactly on values too
   (`g9:4,g10:0,g11:3,g12:3`, sum 11).

   Neither canonical source decomposes "core" vs. "flexible" per grade — the
   flexible educator is a separate, always-1, payroll-unwired addition layered
   on top of the 4-grade core sum, not embedded in any single grade's number.

**Conclusion on Gate 3**: the per-grade values are incremental-activation FTE
(interpretation B), proven by the pre-existing canonical model's own field names
(`rampIncrementFteByGrade`/`cumulativeFteByGrade`) and independently corroborated
by `HighSchoolTab.tsx`'s own descriptive text. This is not an assumption made to
close the gate — it is the documented design of the one canonical source that
addresses grade-level HS staffing at all.

### Gate 3 — the required activation calculation (printed, per directive)

Per the directive: *"If the values are incremental activation amounts, print
the activation calculation across 2028–2037."* Computed directly from
`buildPayrollAdapterInput()`'s own active-grade lookup
(`COMBINED_ACTIVE_GRADE_RECORDS`, Finance-validated, package-specific) — not
from `msHsStaffingReadiness.ts`'s illustrative reference table, which uses a
single fixed schedule (g9=2034,g10=2035,g11=2036,g12=2037) that does not match
either package's actual production activation:

| Package | g9 active from | g10 active from | g11 active from | g12 active from |
|---|---|---|---|---|
| t1_g4 | 2033 | 2034 | 2035 | 2036 |
| t1_g6 | 2031 | 2032 | 2033 | 2034 |

Both packages activate HS grades one year apart, in order — confirming the
canonical model's *timing* semantics (staggered, incremental activation), even
though the specific calendar years differ from `msHsStaffingReadiness.ts`'s
illustrative 2034-2037 reference (which is a generic example, not a
per-package citation). This corrects an earlier over-broad claim made during
this phase's own investigation, before the activation table above was printed:
the payroll loop's arithmetic is identical to the canonical
incremental-cumulative ramp **only in the sense that both stagger grade-by-
grade**; the specific years, and therefore each year's actual active-grade
sum, are package-specific and do not literally reproduce
`cumulativeFteByGrade`'s `4→4→7→10` sequence in either package's real
calendar. The 12-vs-11 discrepancy itself is a **value** conflict (g10=2 vs.
canonical g10=0), not a **timing** artifact — it exists identically whether or
not the calendar years match.

**Diagnostic-coverage correction, discovered from this table**: printing the
per-package activation years surfaced a real gap in this phase's first
`unreconciled_grade_envelope` diagnostic draft, which fired only in years all
four HS grades were simultaneously active. Grade 10's disputed 2 FTE is
actually costed starting the year *g10 itself* activates — 2 years before g12
opens. Under the original gate, t1_g4's 2034-2035 and t1_g6's 2032-2033 would
have carried the disputed cost with **no diagnostic at all**. The diagnostic
condition was corrected to key off g10's own activity (not full-division
maturity), and the message now reports each year's actual active-grade sum
(e.g. 6 in the first activation year: g9=4+g10=2) rather than always citing
the full-maturity 12, since the full sum is not yet in effect in partial-
maturity years. Re-verified: `hs_educator_g10`'s nonzero-active years now
match the diagnostic's firing years exactly, for both packages, with zero gap.

## Gate 4 — preserving the product-owner correction

Per this phase's directive, the values are:
- `MS_FTE_BY_GRADE`: `{g6:3, g7:4, g8:2}` — unchanged from RC2.4 (uncontested).
- `HS_FTE_BY_GRADE`: `{g9:4, g10:2, g11:3, g12:3}` — g10 restored to the direct
  product-owner value (2, not RC2.4's 0); g11 restored to its pre-RC2.4 value (3,
  not RC2.4's fabricated 4); g9/g12 unchanged.

Provenance recorded in code exactly as directed: *"Product-owner correction
supplied 2026-07-30; canonical MS/HS model reconciliation pending."* Grade 10 is
**not** claimed to be HighSchoolTab-sourced — the opposite is true and is stated
explicitly in the code comments: HighSchoolTab's own canonical ramp has `g10=0`,
directly conflicting with the live `g10=2` correction.

## Gate 5 — the 12-vs-11 discrepancy, evaluated

| # | Possibility | Supporting evidence | Contradicting evidence | Reconciles 12 vs 11? | Changes payroll? | Still needs approval? |
|---|---|---|---|---|---|---|
| 1 | Grade numbers are not additive | None — canonical model explicitly sums increments to a cumulative total | Canonical model's own `rampIncrementFteByGrade`→`cumulativeFteByGrade` structure is additive by design | No | — | — |
| 2 | One educator shared across grades | None found in `payrollAdapter.ts` or canonical models | No shared-attribution logic exists in the per-grade loop | No | — | Yes, if invented |
| 3 | Flexible educator embedded in a grade value | None — canonical model keeps the flexible seat structurally separate (`fullModelFlexibleProgrammeEducators` is additive on top of the 4-grade core sum, not inside it) | `payrollAdapter.ts` has no separate flexible-educator role at all — the per-grade sum is the entire modeled HS educator cost, so this possibility would make the true total 12 core + 1 flexible = 13, worse, not better | No | Would increase, not resolve | Yes |
| 4 | Incremental activation, not simultaneous | Canonical model's own field semantics; `HighSchoolTab.tsx` text; production's own per-package activation table (Gate 3) confirms grades activate one year apart in both packages, matching the canonical *timing* | Neither package's actual calendar years match the canonical model's specific 2034-2037 reference (that reference is illustrative, not per-package-sourced) | Confirms the correct interpretation but does not close the numeric gap — the confirmed interpretation's own canonical values (g10=0) are what conflict with the live correction (g10=2), independent of which calendar years are used | Yes — this finding drove a real fix: the disclosure diagnostic originally fired only at full division maturity, missing the 2 years per package where g10's disputed FTE is costed before g11/g12 open (corrected, see Gate 3) | — |
| 5 | 11-FTE envelope incomplete/different operating state | None found | Both canonical sources describe the "mature," fully-open-grade state — the same state the disputed 12-sum applies to | No | — | — |
| 6 | Live value conflicts with canonical schedule model | `HighSchoolTab.tsx` explicit "no separate Grade 10 FTE step" text; canonical `g10:0` | The live correction is a direct, explicit 2026-07-30 statement, not a misreading | **This is the actual cause** | Yes (+1 FTE net) | Yes — this is exactly the open blocker |
| 7 | Payroll adapter uses an invalid allocation abstraction | The adapter treats a flat per-grade table as if it already nets core+flexible, with no structural decomposition | No corroborating evidence this abstraction is itself wrong, only that it is coarse | Does not resolve; a different abstraction risk, not this discrepancy's cause | — | — |
| 8 | Another source-backed explanation | None located within this session's investigation budget | — | — | — | — |

Selected cause: **#6** — the direct, live 2026-07-30 product-owner correction
(`g10=2`) conflicts with the pre-existing, "user-validated," structurally-embedded
canonical HS tab ramp (`g10=0`). This is a genuine conflict between two
legitimately-sourced values, not an arithmetic or interpretive error. It is not
selected because it makes the arithmetic green — it is the only possibility with
direct, located, contradicting evidence on both sides.

## Gate 6 — disposition: UNRECONCILED

No canonical evidence proves how `g10=2` coexists with the 11-FTE envelope
without changing an already-approved value (RECONCILED does not apply). The
per-grade values are proven additive/incremental, not a different concept
entirely (SEMANTIC MISCLASSIFICATION does not apply).

Actions taken, per the directive's UNRECONCILED requirements:
- `g8=2` (MS) and `g10=2` (HS) preserved in `payrollAdapter.ts` as explicit
  product-owner decisions — not reverted, not zeroed.
- The 12-vs-11 discrepancy is retained, not forced to 11 by changing g9/g11/g12.
- No residual/shared/flexible allocation was fabricated to explain away the gap.
- `orgDesignPayrollActivation.ts`'s three HS citations now state the sum is
  UNRECONCILED and flip `needsReview: true` on the HS educator record (was
  `false`).
- A new diagnostic type, `unreconciled_grade_envelope`, is emitted by
  `payrollAdapter.ts` for every year Grade 10 is active (not only once the full
  HS division reaches full maturity — see Gate 3's diagnostic-coverage
  correction), disclosing that year's actual active-grade sum, the disputed
  g10=2 FTE, the full-maturity sum, the validated envelope, and the source of
  the conflict — the cost is **not netted out**; the disputed FTE flows through
  payroll as-is, with the diagnostic as a visible disclosure for every year it
  affects cost, with no gap.
- `msHsStaffingReadiness.ts` and `secondaryEducatorCapacityModel.ts` (the
  governed 11-FTE envelope) were **not** touched.
- **UI-surfacing check (Gate 6.B requirement, verified not assumed)**: grepped
  `src/components/` for `needsReview`, `mappingStatus`, `.diagnostics`, and
  `unreconciled_grade_envelope`. One consumer exists:
  `dreScenarioWorkbook.ts` (the DRE Scenario Workbook **export** pathway) reads
  `activation.mappingStatus`/`activation.needsReview` into a sheet row, and
  iterates `fopagOutput.diagnostics` — confirmed via `fopagEngine.ts` (lines
  ~88-93) that it forwards every `payrollAdapter` diagnostic, including the new
  type, into `fopagOutput.diagnostics` with `isBlocking: false` (not in
  `BLOCKING_ADAPTER_DIAGNOSTIC_TYPES`) — into a dedicated "Diagnostics" table
  on the exported workbook's Payroll FOPAG sheet. **The live in-app
  `PayrollProjectionTab.tsx` UI does not render adapter or FOPAG diagnostics at
  all** (grepped for `diagnostics`, `needsReview`, `approved`, `validated` —
  no matches); it also does not use language claiming HS staffing is
  "reconciled" or "validated" next to the HS figures, so it does not
  affirmatively misrepresent the allocation as resolved, but it does not
  affirmatively disclose the conflict either. This is a **partial** fulfillment
  of Gate 6.B's UI requirement: the export path discloses; the live UI is
  silent (neither claims reconciliation nor flags the conflict). Building a
  live-UI banner was not done in this pass to keep the diff minimal and
  evidence-scoped — flagged here explicitly rather than left unstated, pending
  direction on whether a live-UI disclosure is required before RC2.5.

## Gate 7 — downstream impact (t1_g6/conservador/balanced_experience, canonical scenario)

- `HS_FTE_BY_GRADE`: g9=4, g10=2, g11=3, g12=3.
- HS grade-attributable total at full HS maturity: **12** (was 11 under RC2.4's
  committed, unapproved values; was 11 under the pre-RC2.4/canonical baseline).
- HS core aggregate (canonical, unwired): 10. HS flexible aggregate (canonical,
  unwired): 1. HS total aggregate (canonical): 11 — **unchanged, not touched**.
- MS aggregate: 9 (g6=3,g7=4,g8=2) — unchanged from RC2.4, uncontested.
- Grade-attributable total vs. envelope: **12 vs. 11 at full maturity, a 1-FTE
  unreconciled excess**, disclosed via `unreconciled_grade_envelope` diagnostic
  for every year g10 is active (t1_g6: 2032-2047, 16 years; t1_g4: 2034-2047,
  14 years) — including the partial-maturity years before g11/g12 open, where
  the message reports that year's actual active-grade sum (e.g. 6, not 12) so
  the disclosure is never overstated.
- Org Design / Payroll parity (`validate:v10-rc2-2-gate3`): still 1:1 —
  10,362 role-rows (up from 10,272; g10 now carries real headcount rows instead
  of implicit zero-FTE rows), 372 role-activation-years (up from 366). Parity
  itself is unaffected — both sides still agree with each other; this is
  **internal parity**, not proof the new value is correct (the directive's
  distinction between parity and fidelity applies here exactly as it did to the
  turma correction).
- FOPAG: HS teaching-lead cost for g10 rises from 0 to 2 FTE at Master Educator
  compensation, active every year g10 is active. Confirmed via direct
  `buildPayrollAdapterInput()` invocation: `hs_educator_g10` records show
  `headcountOrFte: 2`, `active: true` for 2034-2037 (and onward through the
  20-year window).
- DRE: pass-through of FOPAG's higher total; no independent DRE-layer change.
- Export (both pathways): both import `calculateFopag`/`calculateDre` directly
  (unchanged from RC2.4's Gate 7 #12/#13 findings) — the corrected value flows
  through without a forked calculation. `validate:v10-x1`'s export size grew by
  5,526 bytes (more headcount rows), still 39/39 pass.
- Regenerated data artifacts: `docs/audits/rio-resilience/phase-v10-rc2-gate8-
  coverage-matrix.json` — `payrollTotalPayroll` rises and `ebitdaValue` falls by
  an identical amount in every cell where HS is active, confirming the added
  cost flows consistently through FOPAG→DRE→coverage matrix with no drift.
  `docs/audits/rio-resilience/phase-v10-rc2-1-gate6-staffing-table.json` is
  **unchanged** — that table is EY/LS-only by design (F06 unreconciled,
  pre-existing), so it was never affected by MS/HS FTE values in the first
  place, RC2.4 or RC2.4A.

Source fidelity vs. semantic validity vs. internal parity vs. financial
reconciliation, kept separate as directed:
- **Source fidelity**: g8=2 is fidelity-clean (matches canonical + product
  owner). g10=2 is fidelity-clean *to the live product-owner statement* but
  fidelity-**conflicting** with the canonical HS tab model. Both are true
  simultaneously; that is the blocker.
- **Semantic validity**: confirmed additive/incremental (Gate 3); not a
  misclassification.
- **Internal parity**: intact — every downstream consumer (Org Design, Payroll,
  FOPAG, DRE, export) repeats the same `g10=2` value consistently. This is
  necessary but not sufficient evidence of correctness (per the directive's own
  warning against reporting parity as if it were fidelity).
- **Financial reconciliation**: not resolved — the 1-FTE gap between 12 and 11
  is a real, disclosed cost difference (≈ one incremental Master Educator FTE's
  annual cost), not zeroed or absorbed.

## Gate 8 — documentation corrected

The following RC2.4 statements are corrected (all in `IMPLEMENTATION.md`'s Phase
V10-RC2.4A entry, appended below the untouched RC2.4 record):
- "Grade 10 remains 0 by direct product-owner correction" → false; Grade 10 = 2
  is the direct product-owner correction; RC2.4's `g10=0` was an incorrect,
  unapproved retention.
- "Grade 11 changed to 4 by direct product-owner correction" → false; Grade 11
  is restored to 3 (its pre-RC2.4, canonical-matching value); the 3→4 change was
  never approved.
- "the HS allocation is fully reconciled" → false; UNRECONCILED, 12 vs. 11.
- "Gate 6 is resolved" → RC2.4's Gate 6 MS disposition (g8=2) stands; its HS
  disposition is superseded by this phase and is now UNRECONCILED.
- "the complete staffing model is release-ready" → not accurate for HS; MS
  staffing and the turma/section correction remain release-ready and are
  preserved unmodified.

RC2.4's turma evidence, its 150-cell primary-source check, its 1,200+627-cell
Gate 7 fidelity/parity totals, and its documentation-accuracy corrections (the
`phase15f/i2c/j`/`phase15o` reclassification) are **preserved unchanged** — this
phase does not reopen or restate them; see `IMPLEMENTATION.md`, "Phase
V10-RC2.4," for that record.

## Gate 9 — validation

Full sweep re-run three times in this phase: (1) after the initial `g10:0→2`/
`g11:4→3` value correction, (2) after the diagnostic-coverage fix and
`activationYearSource` caveat (Gate 3), (3) as a final confirmation. All three
runs of the 34/34 `validate:*` scripts produced an identical pass/fail pattern
to the post-RC2.4 baseline (`diff` of exit-code summaries across all three: no
differences). Content-level differences confirmed as expected, correct
consequences of the value correction:
- `validate:v10-rc2-2-gate3`: still ALL CHECKS PASSED; role-row count rises
  10,272→10,362 and role-activation-years 366→372 (g10 now generates real
  headcount rows instead of implicit zero-FTE ones) — parity itself unaffected.
- `validate:v10-x1`: still 39/39 pass; export size grows by 5,526 bytes.
- `validate:v10-rc2-1-gate6`: byte-identical (EY/LS-only table, unaffected).
- `phase15l/l2/m/o` (staffing-related pre-existing partial-pass scripts):
  byte-identical logs before/after this phase's changes — none of them read
  the actual FTE numeric values.
- Direct `buildPayrollAdapterInput()` invocation (not a checked-in validator,
  ad hoc verification per Gate 3/6): confirmed the diagnostic-coverage fix
  closes the gap for both packages — `hs_educator_g10`'s nonzero-active years
  match `unreconciled_grade_envelope` diagnostic years exactly (t1_g4: 14/14,
  t1_g6: 16/16, zero missing in either).
- `tsc --noEmit`, `npm run lint`, `npm run build`, `git diff --check`: clean.
- No validator was weakened or had its expectation changed to accommodate this
  correction — the change is a data-value correction plus a new disclosure
  diagnostic, not a test-expectation edit.

## Remaining governance blockers

1. **HS Grade 10 / 12-vs-11 envelope conflict (this phase's finding)**: the live
   product-owner correction (g10=2) conflicts with the canonical HS tab model
   (g10=0). Someone with authority over both sources must either (a) confirm
   g10=2 supersedes the canonical tab ramp and separately approve raising the
   governed 11-FTE envelope to 12, or (b) confirm the canonical tab ramp is
   correct and that the 2026-07-30 statement was misrecorded. Not resolved here.
2. Counselor activation year — unsourced (RC2.4 Gate 6, unchanged).
3. Specialist FTE/activation threshold — unsourced, contradictory (RC2.4 Gate 6,
   unchanged).
4. D-R5, D-R6/F03, F06, corporate allocation/consolidated cost — unchanged from
   RC2.3/RC2.4's disposition.
5. **Live-UI disclosure gap (this phase's finding, Gate 6.B)**: the
   `unreconciled_grade_envelope` diagnostic reaches the DRE Scenario Workbook
   export but not the live `PayrollProjectionTab.tsx` UI, which renders no
   diagnostics at all today. Not a regression (no diagnostic was ever surfaced
   there), but the conflict is invisible to a user working in the live tab
   rather than the export. Not fixed in this pass — flagged for explicit
   direction.
6. **`activationYearSource` citation staleness (found during this phase's Gate
   3 investigation, pre-existing, outside the g8/g10/g11 scope)**: the HS
   educator record's `activationYearSource` cites `GRADE_CONFIG` (teaching.ts,
   a single package-agnostic table, g9=2034/g10=2035/g11=2036/g12=2037), but
   `payrollAdapter.ts` actually determines active/inactive status per grade
   from `COMBINED_ACTIVE_GRADE_RECORDS` (package-specific, Finance-validated),
   which activates on a different, package-specific schedule (see Gate 3's
   table). A caveat was added to the citation; the underlying mismatch was not
   corrected (not in scope for this phase's disputed values).

## Resolution (2026-07-30, addendum — product-owner governance decision)

This document's Gate 5/6/7 sections above (UNRECONCILED, 12-vs-11) are
preserved unmodified as the historical record of the investigation. They are
superseded by the decision recorded here, which resolves the blocker.

Per this phase's own directive, no further production changes were made until
the product owner explicitly selected one of two offered dispositions:

- **Option A**: raise the governed mature-state HS envelope to 12 FTE (would
  have required classifying the additional educator's function — not invented,
  per the directive).
- **Option B**: preserve the existing 11-FTE HS envelope, keep G10=2 as
  supplied, and reduce exactly one of G9/G11/G12 by 1 FTE (the specific grade
  not chosen by this codebase, per the directive).

**Product owner selected Option B**, then, on a follow-up question offering
G9→3, G11→2, or G12→2 as the specific reduction, **selected G12→2**.

**Final governed HS ramp**: `{g9:4, g10:2, g11:3, g12:2}`, sum 11 — matching
the validated 10 core + 1 flexible = 11 HS envelope exactly. G9=4 and G11=3
are unchanged throughout this phase (never disputed). G10=2 and G12=2 are
both direct, explicit product-owner decisions dated 2026-07-30, recorded as
such in code — neither is claimed to be canonical-model- or HighSchoolTab-
sourced (`HighSchoolTab.tsx`'s own ramp remains g10=0/g12=3, unchanged,
comparison-only).

### Implementation

- `payrollAdapter.ts`: `HS_FTE_BY_GRADE` → `{g9:4, g10:2, g11:3, g12:2}`. The
  `unreconciled_grade_envelope` diagnostic mechanism (added earlier in this
  phase) is retained as a dormant safety net — it only fires again if a future
  edit breaks the sum=11 invariant — and its message was generalized (no
  longer hardcoded to describe today's specific g10/2026-07-30 narrative,
  since that narrative may not apply to whatever future edit trips it).
  Confirmed via direct `buildPayrollAdapterInput()` invocation: 0 diagnostics
  fire for either package; `g10`/`g12` headcountOrFte are 2/2 as expected.
- `orgDesignPayrollActivation.ts`: all three HS citations updated to the
  resolved `g9=4,g10=2,g11=3,g12=2,sum=11` values and resolved provenance.
  `needsReview` flipped back to `false` on the HS educator record (was `true`
  during the unreconciled window).
- `msHsStaffingReadiness.ts`/`secondaryEducatorCapacityModel.ts` (the
  canonical reference models): **not touched** — their own illustrative ramp
  values (g10=0, g12=3) remain as pre-existing, explicitly comparison-only
  figures, unchanged, consistent with how this codebase has always treated
  the live payroll table as the actual governed source and the canonical
  models as non-payroll-wired reference.

### Validation (re-run after the resolution)

Full 34/34 `validate:*` sweep: identical pass/fail pattern to every prior run
in this phase (exit-code diff: none). `validate:v10-rc2-2-gate3`: still ALL
CHECKS PASSED, role-row count unchanged (g10 and g12 both already carried
nonzero-FTE rows; only the FTE value moved from g12 to g10, not the row
count). `validate:v10-x1`: still 39/39 pass, export size shrinks slightly
(-252 bytes, consistent with numeric-string-length changes, not a structural
change). `docs/audits/rio-resilience/phase-v10-rc2-gate8-coverage-matrix.json`
regenerated: `payrollTotalPayroll`/`ebitdaValue` shift again (net effect:
total HS FTE at full maturity is unchanged from the original RC2.4 baseline,
11, but the reallocated FTE now activates earlier — with G10, not G12 — so
cumulative cost across the full 20-year window differs from both the original
RC2.4 baseline and the intermediate 12-FTE state). `docs/audits/rio-
resilience/phase-v10-rc2-1-gate6-staffing-table.json`: unchanged (EY/LS-only,
never affected by HS values). `tsc --noEmit`, `npm run build`, `git diff
--check`: clean.

### Updated status

- HS Grade 10 correction: **PASS** (product-owner value, preserved).
- HS 12-vs-11 reconciliation: **PASS** (resolved by explicit product-owner
  disposition selection — Option B, G12 reduction — not by codebase inference).
- `needsReview`: `false`.
- Diagnostic: dormant (retained as a safety net, not currently firing).

This resolution does not touch the remaining blockers unrelated to HS G10/G12:
counselor activation year, specialist FTE/threshold, D-R5/D-R6/F03/F06/
corporate allocation, the live-UI disclosure gap (item 5 above — still
applicable in principle, though the diagnostic it would surface is now
dormant), and the `activationYearSource` citation staleness (item 6 above).
