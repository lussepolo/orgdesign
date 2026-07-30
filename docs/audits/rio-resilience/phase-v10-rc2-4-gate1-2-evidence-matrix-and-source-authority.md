# V10-RC2.4 Gate 1/2 — Evidence matrix and turma source authority

**Phase:** V10-RC2.4 — Governed turma ramp-up and staffing source reconciliation.
**Purpose:** Resolve the Gate 9 discrepancy register
(`phase-v10-rc2-3-gate9-turma-and-staffing-source-discrepancies.md`) with primary-source
evidence, per this phase's directive. This document is the Gate 1 evidence matrix and
Gate 2 source-authority record; Gate 3+ (defect proof, implementation, regression) are
recorded in `IMPLEMENTATION.md`.

## Gate 1 — Evidence matrix

| # | Issue | Current app behavior | Current code location | Claimed workbook behavior | Exact evidence | Affected packages | Affected scenarios | Affected years | Affected grades/roles | Downstream consumers | Correction status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Turma (section) count forced to 2 for every active grade | `sections: active ? 2 : null`, no ramp | `governedCaptacaoCapacitySourceData.ts:184-206` (`activeGradeCapacityRecords`); consumed by `sectionCountEngine.ts:47-55,151-154` (`committedSectionsLookup` floor) | Sections ramp 1→2 as enrollment fills a grade, per `ROUNDUP(enrollment/studentsPerClass,0)` | `Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx` (SHA `2e3230ad...`), sheet `PnL`, rows 88-106 (`Turmas` block), literal Excel formulas `=ROUNDUP(SUM(enrollment_antigos,enrollment_novos)/$G{row},0)`; denominators `$G22:$G40` verified byte-for-byte against `GOVERNED_STUDENTS_PER_CLASS` | t1_g4, t1_g6 (formula is package-agnostic) | conservador (direct formula evidence), base/otimista (formula applies to their own already-governed enrollment — see Gate 2 §3) | 2028-2037 | PK3, PK4, K, G1-G12 (single-track grades) | `sectionCountEngine.ts` (EY/LS educator/assistant/monitor headcount → FOPAG), `payrollGradeDetailAdapter.ts` (Grade 6 display) | **Corrected** — Gate 3/4 |
| 2 | Toddlers 1/Toddlers 2 always show 2 sections | `active ? 2 : null` (same code path as #1) | same as #1 | **Confirmed correct as implemented**: T1/T2 each split into Integral (`-I`) + Meio-período (`-M`) tracks, each independently rounded against the same 14-capacity denominator; both tracks non-zero throughout 2028-2037 in the one directly-evidenced scenario (Conservador) | Same workbook, sheet `PnL`, rows 88-91 (Turmas) cross-checked against rows 132-172 (Alunos Antigos/Novos, `-I`/`-M` sub-rows); `TODDLERS 1 - I`/`-M` combined enrollment never below 7 in any of the 10 years | t1_g4, t1_g6 | conservador (direct); base/otimista (inferred by monotonicity — conservador is the enrollment floor scenario, so if its I/M subgroups never hit 0, higher-enrollment scenarios don't either) | 2028-2037 | T1, T2 | Same as #1 | **Confirmed correct as implemented — no change** |
| 3 | Grade 6 sections shown are not scenario-differentiated | `capacityRecord?.sections` read directly from the (scenario-independent) capacity record | `payrollGradeDetailAdapter.ts:170-176` (`buildGrade6Row`) | Same `ROUNDUP` formula as #1, applied to Grade 6's own governed, scenario-specific enrollment (`GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS`) | Same workbook, row 100 (`GRADE 6 - I`), formula `=ROUNDUP(SUM(E144,E166)/$G34,0)`; numerically verified (see Gate 2 §2) | t1_g6 | conservador (direct), base/otimista (formula-derived) | 2028-2037 | G6 | `payrollGradeDetailAdapter.ts` display only — MS/HS staffing is **not** section-driven (see #4) | **Corrected** — Gate 3/4 |
| 4 | (Scope clarification, not a defect) Does the turma defect affect MS/HS payroll? | N/A | `orgDesignHcTableAdapter.ts`, `payrollAdapter.ts:493-497` | N/A | Grep-verified: `orgDesignHcTableAdapter.ts` and `fopagEngine.ts` contain zero references to `sectionCountEngine`/`GOVERNED_CAPACITY_BY_YEAR_AND_GRADE_RECORDS`; MS/HS teaching-lead FTE is a **fixed per-grade table** (`MS_FTE_BY_GRADE`/`HS_FTE_BY_GRADE` in `payrollAdapter.ts`), independent of section counts | t1_g4, t1_g6 | all | all | G6-G12 | FOPAG (via the fixed-FTE table, not sections) | **Confirmed: turma correction has zero FOPAG impact for G6+; impact is EY/LS-only (T1-G5) plus Grade 6 display** |
| 5 | Counselor activation year | EY-counselor fixed 1, LS-counselor fixed 1 (=2 total from 2028), MS-counselor = incremental `headcount[year]-headcount[2028]` on `src/constants/leadership.ts:122` `hc([[2028,3],[2031,4]])`, so 3rd counselor appears **2031** | `executiveOrgDesignModel.ts:210-215,599-607`; `src/constants/leadership.ts:122` | User (verbatim, 2026-07-30): "2028 begins with 2 counselors, then a third counselor begins in 2032" | **None found.** `src/constants/leadership.ts` has no source-citation comments for the counselor row; no workbook cell was located for this claim in this session's investigation budget | t1_g4, t1_g6 (role is package-independent) | n/a | 2028, 2031/2032 | Counselor (EY/LS/MS) | Legacy Executive Org Design headcount | **Deferred — source-governance gap.** Neither the current 2031 value nor the user's stated 2032 value has a located workbook citation; Non-Negotiable Rule 1 (no invented activation years) blocks a change either way. |
| 6 | MS educator per-grade FTE (g6/g7/g8) | Was `{g6:3, g7:4, g8:3}` | `payrollAdapter.ts:133` (`MS_FTE_BY_GRADE`) — this is the **live, FOPAG-wired** table (distinct from the separate, explicitly `payrollWiringApproved:false` canonical 8+1 model in `msHsStaffingReadiness.ts`) | User (verbatim, 2026-07-30): "3 active when grade 6 begins, +4 when grade 7 begins, +2 when grade 8 begins" (3+4+2=9); **directly reaffirmed live during this phase (2026-07-30): "it is actually 2 FTE for grade 8, not 3."** | Direct, explicit, live product-owner correction (Luciana) during this session, addressed to the exact `MS_FTE_BY_GRADE` table shown to her | t1_g4, t1_g6 | all | 2031-2033+ (grade-activation dependent) | G6, G7, G8 | FOPAG MS teaching-lead cost | **Corrected**: `g8: 3 → 2`. `g6`/`g7` unchanged (already 3/4, matching the user's statement). Applied directly to `payrollAdapter.ts` and all descriptive citations in `orgDesignPayrollActivation.ts`. The separate, still-`not_wired` canonical 8+1 model in `msHsStaffingReadiness.ts` was **not** touched — flipping its `payrollWiringApproved` flag was not authorized in this correction. |
| 7 | HS educator per-grade FTE (g10/g11) | Was `{g9:4, g10:0, g11:3, g12:3}` — g10 previously "active but FTE=0, shared-pool coverage, no incremental cost" | `payrollAdapter.ts:134` (`HS_FTE_BY_GRADE`) | User (verbatim, live, 2026-07-30, two-part correction): first "then 2 for grade 10" (`g10: 0→2`), then immediately reconciled against the validated HS envelope (10 core + 1 flexible = 11): "MS...sum to 9. The validated MS envelope is 8 core + 1 flexible = 9. HS...sum to 12. The validated HS envelope is...11. so let's have 4 educators beginning in grade 11 and remove 2 from grade 10" | Direct, explicit, live product-owner correction (Luciana) during this session, self-reconciled against the pre-existing validated envelope total | t1_g4, t1_g6 | all | 2034+ | G10, G11 | FOPAG HS teaching-lead cost | **Corrected (final)**: `g10: 0` (unchanged from original — the interim `g10: 2` was superseded within the same session), `g11: 3 → 4`. New HS set `{g9:4, g10:0, g11:4, g12:3}` sums to 11, matching the validated 10-core+1-flexible envelope exactly. G10 remains shared-pool coverage with no incremental cost; G11 now carries the incremental 4-FTE step. MS set `{g6:3, g7:4, g8:2}` (sum 9, matching 8 core + 1 flexible) was confirmed correct as-is and not changed further. |
| 8 | Specialist educators (Arts, Music, Body & Movement) FTE/activation | Fixed `1 FTE @ 2028 → 2 FTE @ 2031` for all three roles | `src/constants/leadership.ts:145-147` (`hc([[2028,1],[2031,2]])`) | User (verbatim, 2026-07-30): "1 FTE 2028, we increase the number when we have 20 groups activated" — **contradicted by** workbook `Org. Design` sheet rows 19-21: `0.5 FTE @ 8 Turmas` | Two mutually inconsistent claims already on record (Gate 9 doc §2); this session additionally found the *current code's* own trigger (fixed year 2031) matches **neither** — and per the corrected Gate 4 turma count, T1_G6/Conservador reaches 20 total turmas in **2029**, not 2031 (workbook `PnL!row107`: `F107=20` for 2029) | t1_g4, t1_g6 | all | 2028-2033 | Arts, Music, Body & Movement | FOPAG specialist cost | **Deferred — rejected, contradictory evidence.** Three different numbers (code: fixed-2031; user: turma-count-triggered at 20; workbook Org.Design: 0.5 FTE @ 8 turmas) cannot be reconciled without product-owner clarification. No change made. |

## Gate 2 — Source authority for turma counts

### 2.1 Formula, not a lookup table

The v10 workbook's `PnL` sheet, `Turmas` block (rows 87-107), contains **live Excel
formulas**, not hardcoded per-scenario values:

```
E88 (TODDLERS 1 - I, 2028) = ROUNDUP(SUM(E132,E154)/$G22,0)
E98 (GRADE 4 - I, 2028)    = ROUNDUP(SUM(E142,E164)/$G32,0)
E100 (GRADE 6 - I, 2028)   = ROUNDUP(SUM(E144,E166)/$G34,0)
```

`E132`/`E142`/`E144`/... = "Alunos Antigos" (retained enrollment) row; `E154`/`E164`/`E166`/...
= "Alunos Novos" (new enrollment) row; their sum is each grade's total enrollment for that
year. `$G{row}` = a fixed per-grade capacity-per-class denominator (row 22-40).

### 2.2 Denominators verified against the app's already-governed constant

`$G22:$G40` (T1 through G12) reads `14,14,14,14,18,18,20,22,22,22,24,24,25,25,25,25,25,25,25`
— an exact match, grade-for-grade, to `STUDENTS_PER_CLASS_BY_GRADE` in
`governedCaptacaoCapacitySourceData.ts` (already governed under `V10_E1_GOVERNANCE_DATE`,
prior to this phase; not re-derived here).

### 2.3 Formula verified end-to-end against the app's own governed enrollment

Enrollment feeding the formula (`Alunos Antigos + Alunos Novos`, row 173 total = 238 for
2028) matches `GOVERNED_T1_G6_ENROLLMENT_BY_YEAR_AND_GRADE_RECORDS`'s conservador/2028 total
exactly (already established in the Gate 9 doc). A deterministic script computed
`min(ceil(enrollment/studentsPerClass), 2)` using the app's own governed
`G6_ENROLLMENT_BY_SCENARIO.conservador` values and compared against the workbook's row
88-106 output for every single-track grade (PK3-G12) and all 10 years (2028-2037):

**150/150 checks passed, 0 mismatches** (including correctly producing 0 sections for
grade/year combinations the app's own governed enrollment marks inactive/`null`).

T1/T2 (dual-track Integral/Meio-período) were separately verified: both tracks' combined
enrollment never drops to 0 across 2028-2037, so their workbook-true turma count is a
constant 2 whenever the grade is active — the pre-existing `active ? 2 : null` behavior is
**correct** for T1/T2 specifically, not a defect (see evidence matrix #2).

### 2.4 Generalization to Base/Otimista and to t1_g4 (no scenario-specific workbook lookup needed)

The formula itself contains no scenario- or package-specific term — its only inputs are
(a) each grade's own already-governed enrollment for that package+scenario+year (sourced
separately, at `V10_E1_GOVERNANCE_DATE`, from the dedicated `Modelo_Ocupacao_Concept_
2028_4sc_T1_G4.xlsx` / `..._T1_G6.xlsx` captação workbooks — hashes verified against
`GOVERNED_G4_CAPTACAO_WORKBOOK`/`GOVERNED_G6_CAPTACAO_WORKBOOK` in
`governedCaptacaoCapacitySourceData.ts`), and (b) the per-grade `studentsPerClass`
constant, which is package- and scenario-independent. Applying the same, already-proven
formula to Base/Otimista's and t1_g4's own governed enrollment is not "manufacturing
scenario sensitivity" (prohibited by the directive) — it is applying one proven,
source-derived computation to already-trusted inputs. No separate per-scenario Turmas
table exists in the workbook (the Gate 9 doc's prior-session search for one is
superseded by this finding: none is needed).

### 2.5 Coverage disposition (2 packages × 3 scenarios × 10 years × active grades)

| Grade group | Package/scenario/year coverage | Basis |
|---|---|---|
| PK3-G12 (single-track) | Full — all combinations | Source-backed **formula** (Gate 2 Option B), directly evidenced in the workbook, numerically verified for the one directly-inspected scenario, generalizes to all others per §2.4 |
| T1, T2 (dual-track) | Full — all combinations | Constant 2 sections whenever active; directly evidenced for Conservador, inferred by monotonicity for Base/Otimista (§2.3) |

No supported combination lacks evidence; Gate 2's stop condition does **not** fire.

## Gate 6 disposition summary (see evidence matrix rows 5-8 for full detail)

- **MS educator g8, HS educator g10**: corrected, direct live product-owner authorization,
  2026-07-30.
- **Counselor activation year**: deferred, no located source for either value.
- **Specialist FTE/threshold**: deferred, contradictory evidence, not reconciled.
