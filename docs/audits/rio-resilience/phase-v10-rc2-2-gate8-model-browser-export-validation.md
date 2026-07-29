# V10-RC2.2 Gate 8 — Model, browser, and export validation; full regression sweep

## Model-level validation (exact commands, exact results)

Full validator sweep, run after Gate 7's coverage-matrix regeneration:

| Command | Result |
|---|---|
| `npx tsc --noEmit` | clean, 0 errors |
| `npm run validate:phase15f` | 179/185 (6 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15g2` | 25/25 |
| `npm run validate:phase15h2` | 30/30 |
| `npm run validate:phase15i1` | 24/24 |
| `npm run validate:phase15i2-packet` | 24/25 (1 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15i2c` | 26/26 |
| `npm run validate:phase15j` | 21/21 |
| `npm run validate:phase15j2-simulator` | 31/31 |
| `npm run validate:phase15j3` | 7/20 (13 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15l` | 15/18 (3 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15l2` | 17/27 (10 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15m` | 13/20 (7 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15n` | 11/11 |
| `npm run validate:phase15o` | 14/23 (9 disclosed, out-of-boundary — see Gate 6 doc) |
| `npm run validate:phase15u2` | 81/81 |
| `npm run validate:v10-e1` | pass |
| `npm run validate:v10-e2` | pass |
| `npm run validate:v10-f1b` | pass |
| `npm run validate:v10-f2` | 76/76 |
| `npm run validate:v10-p1` | 58/58 |
| `npm run validate:v10-rc2-1-gate6` | ALL CHECKS PASSED (597 tier-invariance groups) |
| `npm run validate:v10-rc2-1-gate7` | 24/24 |
| `npm run validate:v10-rc2-2-gate1` | ALL CHECKS PASSED (7 entries, 6 categories) |
| `npm run validate:v10-rc2-2-gate3` | ALL CHECKS PASSED (6 checks, 180 combinations, 10272 role-rows) |
| `npm run validate:v10-rc2-2-gate4` | ALL CHECKS PASSED (11 checks, 360 year-totals) |
| `npm run validate:v10-rc2-gate2` | ALL CHECKS PASSED |
| `npm run validate:v10-rc2-gate8` | 16/16 generator invariants hold (900/900 cells) |
| `npm run validate:v10-x1` | 39/39 |
| `npm run validate:v10-x2t` | 104/105 (1 pre-existing dispositioned exception, `missing_key_fails_closed`, unrelated to this phase) |

**During this sweep, two false-positive regressions were caught and fixed** (committed as `f331697`, see Gate 8's first commit): a Gate 5 sheet-builder function name accidentally contained the literal substring "CorporateAllocation", tripping Gate 1/Gate 4's live adapter-absence check; a Gate 6 fixture comment used the literal retired string "intermediario", tripping the rc2-gate2 terminology check. Both fixed; all three validators pass again.

**Git-level checks:**
- `git diff --check` — clean
- `git diff --cached --check` — clean (nothing staged outstanding)
- `git status --short` — clean working tree
- HEAD, ahead/behind, and push state confirmed in the Gate 9 RETURN.

## Browser-level validation

Dev server (`npm run dev`, port 3001) started; Chrome automation used with the documented `sessionStorage`/`localStorage` auth-bypass pattern. Verified live in-browser:

### The six named model combinations (Payroll tab, real rendered KPI values, no crash)

| Combination | Estimated Students | Annual Revenue | Margin over Direct Payroll |
|---|---|---|---|
| T1-G4 × Conservador × Minimum × 2028 | 238 | R$18,804,897.77 | — |
| T1-G4 × Base × Balanced × 2032 | 460 | R$53,037,671.81 | R$23,629,094.82 |
| T1-G4 × Otimista × Premium × 2037 | 696 | R$118,934,467.14 | R$70,877,008.08 |
| T1-G6 × Conservador × Minimum × 2028 | 238 | R$19,114,810.88 | R$1,055,402.20 |
| T1-G6 × Base × Balanced × 2031 | 417 | R$44,261,291.46 | R$15,164,334.63 |
| T1-G6 × Otimista × Premium × 2037 | 675 | R$114,756,930.55 | R$66,699,471.49 |

Each combination was set by changing the shared scenario (Opening Scenario / Captação Scenario) on the Organizational Design tab, then navigating to the Payroll tab and confirming the "SHARED SCENARIO" panel reflected the new opening package/captação inherited state, then setting the local Org Design tier and detail year. All values are real, distinct, non-crashing computed figures — no blank fields, no `NaN`, no silent fallback.

### Tier invariance (visually confirmed)

For a fixed opening/captação/year (T1-G6 × Conservador × 2028), Estimated Students (238) and Annual Revenue (R$19,114,810.88) were identical across Lean/Balanced/Premium; only payroll cost columns (FOPAG Direto, Benefícios, Folha Direta, Margin) changed — confirming tier changes affect compensation, not headcount/sections, matching the already-validated 597/597 tier-invariance result (`validate:v10-rc2-1-gate6`).

### Locale switch (PT ⇄ EN)

Switched to PT while on the Payroll tab (T1-G6 × Otimista × Premium × 2037, 675 students): all labels translated correctly, including the Gate 4 rename — the margin KPI correctly read "MARGEM SOBRE FOLHA DIRETA" (not any form of "Consolidada"). Table header, section titles, and scenario descriptor ("OTIMISTA · PREMIUM · TOTALMENTE CARREGADO") all translated with no raw i18n keys exposed. Switched back to EN: state (tier, year, scenario) fully preserved across the locale change.

### Back-navigation

Navigated Sections and Payroll → Cover → Sections and Payroll: tier (Premium), year (2037), and all KPI values were fully preserved across the round trip — no reset to default, no crash.

### F06 MS/HS disclosure (visually confirmed)

The "Sections and Staffing Projection" subview renders a "MIDDLE SCHOOL / HIGH SCHOOL — GRADE-LEVEL DETAIL UNAVAILABLE" notice citing F06 by name ("three non-identical MS/HS staffing sources exist in this repository... unreconciled") with the live aggregate estimate shown as a disclosed, labeled number ("Engine aggregate estimate (unreconciled): 3" for T1-G6/Balanced/2028) — never presented as governed grade-level truth.

### Representative export

Triggered "Download .xlsx" for T1-G6 × Otimista × Premium × 2037 from the live Payroll tab. Console monitored during the click: zero errors or exceptions (only standard Vite/React dev messages). This exercises the exact `buildDreScenarioWorkbook()` path extended in Gate 5 (28 sheets, including the three new ones), for a scenario combination distinct from the ones used in the standalone Gate 5/Gate 7 validator fixtures.

### Capital Decision retired-package fix

Confirmed via `validate:v10-rc2-2-gate1`'s live check that `ScenarioConfigurationPanel.tsx` no longer offers `t1_g3`/`t1_g5` as selectable Opening Grades options (structural source check, since the live panel's lever configuration only rendered once a saved scenario exists — not exercised via direct click in this browser session, but the underlying filter and its regression test are both green).

## Summary

All in-scope V10-RC2/V10-RC2.1/V10-RC2.2 validators pass. All out-of-boundary pre-existing failures are disclosed with exact evidence in the Gate 6 document, unchanged by this phase. Git state is clean, nothing pushed, nothing deployed. Browser verification confirms the Payroll shared-engine refactor works correctly across all six required model/captação/tier/year combinations, survives locale switching and back-navigation, and the export path is exception-free for a representative scenario outside the standalone test fixtures.
