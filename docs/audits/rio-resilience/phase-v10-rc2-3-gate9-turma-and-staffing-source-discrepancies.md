# V10-RC2.3 Gate 9 — Turma-count and staffing-formula source discrepancies (documented, not fixed this phase)

**Status:** RESOLVED IN PART — see "V10-RC2.4 dispositions" below, added
2026-07-30. This document's original content (§1-§3) is preserved unmodified as
the historical record of what was discovered during V10-RC2.3; it should be read
together with the dispositions section, not in place of it.

**Original status (V10-RC2.3):** Open governance gap. Discovered during V10-RC2.3
(Turmas e Folha scenario control and Grade 6 coverage correction) browser QA.
Explicit user decision (2026-07-30): document only; fix in a dedicated future
phase. No governed source data, engine formula, or role constant was modified as a
result of this finding.

## V10-RC2.4 dispositions (2026-07-30)

Full evidence: `docs/audits/rio-resilience/
phase-v10-rc2-4-gate1-2-evidence-matrix-and-source-authority.md`; implementation
record: `IMPLEMENTATION.md`, "Phase V10-RC2.4."

| # | Issue (from §1/§2 below) | Disposition | Detail |
|---|---|---|---|
| 1 | Turma count forced to 2 for every active grade (`active ? 2 : null`) | **CORRECTED** | Replaced with the workbook-verified formula `min(ROUNDUP(enrollment/studentsPerClass,0), 2)`, proven against 150+ direct workbook comparisons plus live browser/export confirmation. T1/T2 confirmed correct-as-implemented (structural dual-track exception, not a defect). |
| 1a | Per-scenario Turmas source "not yet found" | **CORRECTED — supersedes the original finding** | No separate per-scenario table exists or is needed: the formula is scenario-agnostic by construction and applies to each scenario's own already-governed enrollment. This resolves §1's "not yet independently verified" note; it does not remain open. |
| 2a | Counselor activation year (3rd counselor: 2028+2, 2032+3rd) | **DEFERRED — source-governance gap** | Current code produces 2031, not 2032; neither value has a located workbook citation. Not changed. |
| 2b | Middle School educator per-grade attribution (g6/g7/g8) | **CORRECTED, by direct product-owner authorization, not by the originally-described canonical-model flip** | The user directly corrected the *live* FOPAG-wired table (`payrollAdapter.ts` `MS_FTE_BY_GRADE`) in-session: `g8: 3 → 2` (was already `g6:3, g7:4`, unchanged), sum 9 = 8 core + 1 flexible. The separate, still-`payrollWiringApproved: false` canonical 8+1 model in `msHsStaffingReadiness.ts` was **not** flipped — this section's original speculation that the user's statement "may need to flip" that model's disposition did not occur and should not be read as resolved; it remains `not_wired`. |
| 2b-HS | (Not originally itemized separately — surfaced during RC2.4 Gate 6 reconciliation) High School educator per-grade attribution (g9/g10/g11/g12) | **CORRECTED, by direct product-owner authorization** | `HS_FTE_BY_GRADE`: `g10: 0 → 0` (unchanged), `g11: 3 → 4` (was briefly corrected to `g10: 2` mid-session, then reconciled by the user against the validated 10-core+1-flexible envelope: `g9:4,g10:0,g11:4,g12:3`, sum 11). |
| 2c | Specialist educators (Arts, Music, Body & Movement) FTE/threshold | **DEFERRED — rejected, contradictory evidence** | Three mutually inconsistent numbers remain unreconciled: current code (fixed 1→2 FTE at 2031), user's verbal statement (1 FTE 2028, scale at 20 turmas — which, per the now-corrected turma count, occurs in 2029, not 2031), and the workbook's `Org. Design` sheet rows 19-21 (0.5 FTE @ 8 turmas). Not changed. |

## Original content (V10-RC2.3, preserved unmodified below)

## 1. Confirmed: committed-sections-always-2 contradicts the source workbook

`src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData.ts`
(`activeGradeCapacityRecords()`, established V10_E1_GOVERNANCE_DATE = 2026-07-24,
prior to this phase) sets `sections: active ? 2 : null` for every grade, every year,
both packages — i.e. a grade goes from 0 to 2 committed sections the instant it
opens, with no ramp. `sectionCountEngine.ts`'s `committedSectionsLookup` then forces
`sectionCount = min(max(rawSections, committedSections), 2)`, which evaluates to
exactly 2 whenever a grade is active, regardless of enrollment or captação scenario.
This is the actual, verified reason section counts (and therefore EY/LS teaching-lead
headcount, and FOPAG payroll) were found to be completely insensitive to captação
scenario in this phase's Gate 6/7A testing (`validate:v10-rc2-3-gate6a` #1–#3 pass
against this data; the underlying data itself is now in question).

**Primary-source evidence** (`~/Downloads/Concept Rio - 20 anos - Org BU -
Apresentação v10.xlsx`, the same workbook `GOVERNED_V10_CAPACITY_WORKBOOK` already
cites, sha256 `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0`),
sheet `PnL` (a Conservador / T1→G6 scenario — total 2028 enrollment 238 matches this
app's `t1_g6`/`conservador`/2028 exactly), rows 86–106 (`Turmas` block):

| Grade | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 |
|---|---|---|---|---|---|---|
| Grade 4 | 1 | 1 | 2 | 2 | 2 | 2 |
| Grade 5 | 1 | 1 | 1 | 2 | 2 | 2 |
| Grade 6 | 1 | 1 | 1 | 1 | 1 | 2 |

The source shows sections ramping 1→2 as enrollment fills a newly-opened grade, not
jumping straight to 2. This means the app currently **overstates** turma count (and
therefore EY/LS educator headcount and FOPAG cost) for every newly-opened grade in
its early years, for both `t1_g4` and `t1_g6`.

**Not yet independently verified in this session:** whether/how this ramp differs
across Base and Otimista captação scenarios specifically. The user stated (verbatim,
2026-07-30) "we have different groups/turmas depending on the scenario being
conservador, base or otimista" and pointed to the same workbook; the `PnL` sheet
inspected only contains a single (Conservador) block. Sheets `PnL - Cen. Gd. 6` /
`PnL - Cen. Gd. 3` were checked and contain only an aggregate `Número de Turmas` row
(no per-grade breakdown) and appear to be a different scenario axis ("Gd. 3"/"Gd. 6"
capacity ceilings, not captação). The per-grade, per-captação-scenario turma source
was not located within this session's investigation budget — a future phase must
locate it (likely among the ~150 sheets not yet inspected: `PnL - Cen. 1/2/3` family,
`Cenários Receita`, `Receita - Cen. *` sheets) before re-deriving
`GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS`.

## 2. User-supplied staffing corrections (verbatim, 2026-07-30, not yet independently sourced in this session)

The user supplied the following corrections during this phase's QA, intended for a
future phase to source, verify against the workbook, and wire into the governed
engines:

- **Counselor activation year:** "counselor must be corrected for activation year,
  2028 begins with 2 counselors, then a third counselor begins in 2032."
- **Middle School educator per-grade attribution:** "MS educators: only active 3 when
  grade 6 begins, then more 4 educators when grade 7 begins, and 2 educators when
  grade 8 begins." — **Note:** 3 + 4 + 2 = 9, which matches
  `msHsStaffingReadinessContract.ts`'s already-existing
  `MsHsStaffingReadinessSummary.middleSchoolFullModelTotalEducators: 9`
  (`middleSchoolFullModelCoreEducators: 8` + `middleSchoolFullModelFlexibleEducators:
  1`) — a canonical model that already exists in this repository but is explicitly
  marked `payrollWiringApproved: false` / `payrollWiringDecision: "not_wired"`. The
  user's statement reads as authorizing exactly this canonical model's per-grade
  attribution (3 at G6-only, +4 at G7, +2 at G8) — i.e. Gate 5's "does the model
  provide a source-backed Grade-6-specific value" disposition (`division_level_only`)
  may need to flip to `grade_level_governed` once this is wired, sourced, and
  validated against the workbook by a dedicated phase. Not done this session —
  `payrollGradeDetailAdapter.ts`'s Grade 6 row still correctly reports `educators:
  null` per the model as it exists today (unwired).
- **Specialist educators (Arts, Music, Body & Movement):** "1 FTE 2028, we increase
  the number when we have 20 groups activated." Cross-reference: `Org. Design` sheet
  in the same workbook, rows 19–21, shows these three specialist roles at `Qtd Staff
  RJ: 0.5` against `Turmas: 8` — a different FTE/threshold pairing than the user's
  statement, not yet reconciled.

## 3. Scope and next steps

None of the above changes anything this phase implemented: Turmas e Folha's new
scenario controls, Grade 6 coverage, and educator-attribution disclosure all
correctly surface whatever the *currently governed* sources say — this document
records that those governed sources themselves appear to need correction, sourced
from the workbook, in a dedicated future phase. That phase should:

1. Locate the per-grade, per-captação-scenario Turmas source (not yet found — see
   §1) and re-derive `GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS.sections` for both
   packages, all three captação scenarios, all ten years, from it.
2. Re-run `sectionCountEngine.ts`'s formula against the corrected committed-sections
   data and re-verify EY/LS headcount parity (`validate:v10-rc2-2-gate3`) still
   holds.
3. Source, verify, and wire the counselor/MS-educator/specialist corrections above
   into `fopagEngine.ts` / the relevant role source data, with their own governance
   record and evidence trail (mirroring `msHsStaffingReadinessContract.ts`'s existing
   pattern) — and only then reconsider Gate 5's `division_level_only` disposition for
   Grade 6.
4. Because this changes FOPAG headcount broadly (every EY/LS grade in its opening
   years, not just Grade 6), expect DRE payroll/margin figures to move; this needs
   its own full regression sweep, not a patch on top of V10-RC2.3.
