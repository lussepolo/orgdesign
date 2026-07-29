# V10-RC2.2 Gate 6 — Eight (nine-script) pre-existing failure disposition

Reproduces and dispositions every pre-existing validator failure surfaced and left undispositioned in V10-RC2.1: three crashing scripts (`validate:phase15f`, `validate:phase15i2c`, `validate:phase15j`) and six failing-but-running scripts (`validate:phase15i2-packet`, `validate:phase15j3`, `validate:phase15l`, `validate:phase15l2`, `validate:phase15m`, `validate:phase15o`).

## Part 1 — The three crashing scripts: fixed at root cause

All three crashed on the same class of bug: a hardcoded or iterated `openingPackageId: "t1_g3"` (occupancy `"base"`, formerly `"intermediario"`), rejected at the engine level (`assertSupportedDreEnrollmentCapacityLeverInput`) since commit `3f4da5c` (V10-E1 governed package migration, 2026-07-24). Fixing the crash exposed real pre-existing failures underneath in two of the three; those are also fixed below, each with cited evidence — none required inventing a new value.

### validate:phase15f (was: crash on t1_g3/base)

**Command:** `npx tsx scripts/validate-phase15f.ts`

- **Root cause of crash:** `phase15cInvestmentMetricsEngineValidation.ts`'s `VALIDATION_INPUT_BASE` hardcoded `openingPackageId: "t1_g3"`, feeding Surface 4's boundary/scope checks (no-mutation, 21-period count, exclusions, IRR-unavailable-still-has-NPV, invalid-WACC-blocks-terminal) — all structural, none package-value-dependent. **Fix:** swapped to `"t1_g4"`.
- **Second crash (same script, deeper call path):** `phase15fUiIntegrationValidation.ts`'s `checkLeverOptionsCalculate` iterated `openingGrades.map(o => o.id)` — the full 4-package catalog (`t1_g3, t1_g4, t1_g5, t1_g6`), 2 of which are retired. **This traced to a real, live production bug**, not just a test fixture: `ScenarioConfigurationPanel.tsx` (the actual Capital Decision UI, `src/features/rio-scenario-resilience/components/CapitalDecision/`) mapped the same full, unfiltered `openingGrades` catalog into the "Opening Grades" lever dropdown. **A user selecting "T1 to G3" or "T1 to G5" in the live app would crash `calculateInvestmentInterpretation`.** **Fix:** `ScenarioConfigurationPanel.tsx` now filters `openingGrades` to `ACTIVE_OPENING_PACKAGE_IDS` before building dropdown options; the validator mirrors the same filter.
- **After the crash fix, DRE surface showed 18/20 (2 pre-existing fails), unrelated to package retirement:**
  - `annual_assumption_passthrough_correct`: expected pure flat passthrough for `receita_com_eventos` from a stale static source table; the line became `formula_layer`-derived (V10-F2.2 / D-R7, 2026-07-27) before this session started. **Root cause:** the 22-line V10-F2.2 "row-11-dependent" formula migration was never reflected in this check's exclusion list. **Fix:** added the 21 formula-derived line IDs (matching `scripts/validate-v10-f2.ts`'s already-independently-validated `ROW_11_DEPENDENT_DRE_LINE_IDS`, 76/76) to the exclusion set; the check now covers exactly the 6 lines still genuinely flat-passthrough (`aluguel_iptu, corporativo_bu, rateio_corporativo, pcld, descontos_comerciais, despesas_com_sinistro`).
  - `outras_receitas_uses_base_per_learner_ratio`: same root cause — the check's expected-value formula predated the V10-F2.2 base-conversion (×1.05) + escalation-factor formula. **Fix:** updated to `base2028 × resolveReajusteDespesasGrowthFactor(2028) × alunos`, matching `dreEngine.ts`'s live formula and `validate:v10-f2`.
  - **Regression test:** `npx tsx scripts/validate-phase15f.ts` — DRE section now 20/20.
- **After the crash fix, three further sections showed failures — investigated, one class fixed, one class disclosed as out-of-boundary:**
  - **Fixed:** `phase15dDecisionLeverPropagationValidation.ts` and `phase15eInvestmentInterpretationValidation.ts` each defined an "Opening Grades lever" comparison scenario (`S5`) as `{...S2_CANONICAL_100M, openingPackageId: "t1_g6"}` — but `S2`'s own base package had *already* been migrated to `t1_g6` (presumably during the same t1_g3 retirement pass), collapsing S5 into a byte-identical duplicate of S2. **Fix:** `S5` now uses `t1_g4` (the other active package), genuinely exercising the lever. Both `lever_opening_grades_t1g4_propagates` (Phase 15D.2) and `matrix_independent_interpretation_per_scenario` (Phase 15E) now pass; Phase 15E is 40/40.
  - **Disclosed, not fixed (out of Payroll-refactor boundary):** 5 remaining Phase 15D.2 checks (`lever_capex_90m_vs_100m_propagates`, `lever_occupancy_pessimista_propagates`, `lever_occupancy_otimista_propagates`, `lever_org_design_minimum_propagates`, `lever_org_design_premium_vs_minimum_isolated_pair`) and 1 Phase 15F check (`status_meets_reference_text_uses_exceeds_wacc_language`) all fail because, under the canonical `t1_g6` base scenario, `discountedPaybackForCapitalDecision`'s `compactValue` returns `"NA"` (or null) for multiple compared scenarios instead of discriminating between them, and no sampled scenario in Phase 15F's 8-scenario matrix reaches `investmentReferenceStatus="meets_reference"`. **Root cause hypothesis, not verified:** `t1_g6`'s larger opening cohort and CAPEX exposure may genuinely take longer than the 20-year horizon to reach discounted payback under `base` occupancy — if true, "NA" is correct behavior and these six checks' assumptions (written under the smaller, retired `t1_g3` base) are simply obsolete. Confirming or refuting this requires Capital Decision / discounted-payback domain review (whether `t1_g6`'s economics are being computed correctly, and what the six checks' expectations should be updated to) — this is Capital Decision engine work, unrelated to Payroll's shared-engine consumption, and is not invented or silently passed here. **Recommendation:** a dedicated Phase 15D.3/15F.1-style follow-up, owned by whoever owns Capital Decision economics.
- **Final state:** `npx tsx scripts/validate-phase15f.ts` → DRE 20/20, Phase 15B 25/25, Phase 15C 28/28, Phase 15D 36/36, Phase 15D.2 10/15 (5 disclosed above), Phase 15E 40/40, Phase 15F 20/21 (1 disclosed above). Aggregate 179/185.

### validate:phase15i2c (was: crash on t1_g3/base)

**Command:** `npx tsx scripts/validate-phase15i2c.ts`

- **Root cause of crash:** `CANONICAL` fixture hardcoded `openingPackageId: "t1_g3"`. **Fix:** swapped to `"t1_g4"`; updated the one package-specific hardcoded value, Check 26 (`228` → `258` learners, 2028).
- **After the crash fix, Section B ("F01 Branch B") showed 3 fails** — same V10-F2.2/D-R7 supersession as `phase15f`'s DRE fails above: this section tested the pre-V10-F2.2 "no reajuste factor" reading of `outras_receitas`. **Fix:** updated Section B's formula and note-text assertions to the current, superseding, independently-validated (`validate:v10-f2`, 76/76) formula; retitled the section accordingly.
- **Final state:** `npx tsx scripts/validate-phase15i2c.ts` → **26/26, 0 fail.**

### validate:phase15j (was: crash on t1_g3/base)

**Command:** `npx tsx scripts/validate-phase15j.ts`

- **Root cause of crash:** `CANONICAL_DRE` fixture hardcoded `openingPackageId: "t1_g3"`, and Section E's "108 scenarios" sweep iterated `DRE_ENROLLMENT_LEVER_OPENING_PACKAGE_IDS` (all 4 packages, including the 2 retired ones) instead of `DRE_ENROLLMENT_LEVER_ACTIVE_OPENING_PACKAGE_IDS` (2 active). **Fix:** swapped the canonical fixture to `t1_g4` (Check 8's hardcoded alunos value updated 228 → 258); Section E now iterates only active packages. The original "108" count (4 packages × 3 occupancy × 3 tuition × 3 org-design) was itself stale independent of the retirement — the tuition catalog has since grown to 5 scenarios. New, live-computed total: 2 active packages × 3 occupancy × 5 tuition × 3 org-design = **90**.
- **Final state:** `npx tsx scripts/validate-phase15j.ts` → **21/21, 0 fail.**

## Part 2 — The six non-crashing scripts: reproduced, unchanged by this phase, out of boundary

Reproduced each; pass/fail counts are byte-identical to their V10-RC2.1-disclosed state — **none of the six were affected by the Payroll shared-engine refactor** (they exercise `EarlyYearsTab.tsx`, `LowerSchoolTab.tsx`, `HiringProfileCardsTab.tsx`, `DreExecutiveInterpretationPanel`, `AboutModal`, and the finance packet register — none of which this phase touched). All six require domain-content judgment (exact staffing caps per grade, hiring-cluster taxonomy, DRE governance/executive-interpretation panel content) unrelated to Payroll consuming the shared engines, and are disclosed rather than fixed to avoid turning this phase into a broad content-audit loop.

| Script | Command | Result | Root cause (evidence) |
|---|---|---|---|
| `validate:phase15i2-packet` | `npx tsx scripts/validate-phase15i2-packet.ts` | 24/25 | `all_items_no_approval_recorded` expects **no** finance-packet item to have a recorded approval; at least one now does (plausibly F02, resolved under V10-F2.2 before this session). Requires finance-register domain confirmation of whether the check's "no approvals yet" premise is still the intended invariant post-F02-resolution. |
| `validate:phase15j3` | `npx tsx scripts/validate-phase15j3.ts` | 7/20 | 13 fails, all against `DreExecutiveInterpretationPanel` content (status header language, 5 lever-axis explanations, 5 trade-off lenses, 5 board decision questions, boundary note). The panel's actual current content does not contain this text. Requires confirming whether this panel was intentionally redesigned/simplified after Phase 15J.3 was authored, or whether content regressed. |
| `validate:phase15l` | `npx tsx scripts/validate-phase15l.ts` | 15/18 | 3 fails: `internal_planning_target_replacement_present`, `internal_planning_reference_in_header`, `strategic_planning_eyebrow_present` — expects specific header/eyebrow copy not present in the current staffing-board UI. Content-copy question, not Payroll-refactor-caused (unrelated component). |
| `validate:phase15l2` | `npx tsx scripts/validate-phase15l2.ts` | 17/27 | 10 fails: expected per-grade headcount caps (EY T2 max 28, LS G4/G5 max 48, LS G1-G3 max 44) and hiring-cluster copy ("Global Studies & Project Design", "Language Acquisition", partial-coverage disclosure text) not present in `EarlyYearsTab.tsx` / `LowerSchoolTab.tsx` / `HiringProfileCardsTab.tsx`. Requires Academic/HR content confirmation of current intended caps and cluster taxonomy. |
| `validate:phase15m` | `npx tsx scripts/validate-phase15m.ts` | 13/20 | 7 fails, all against the same `DreExecutiveInterpretationPanel`/governance-summary content family as `phase15j3` ("DRE Operating Layer", "Capital / Investment Layer", "Source Governance" headings and their required content). Same disposition as `phase15j3` — likely the same underlying panel redesign question. |
| `validate:phase15o` | `npx tsx scripts/validate-phase15o.ts` | 14/23 | 9 fails: `AboutModal` nav-item coverage, `DreExecutiveInterpretationPanel`/`DreGovernanceSummaryPanel` existence and content (`data-testid`, "Governance Status" heading, "Simulation available"/"Finance-source closure pending"/"Board ratification pending" compact-summary text), governance details layer field coverage. Same panel-family question as `phase15j3`/`phase15m` plus an `AboutModal` nav-coverage question. |

**Disposition for all six:** not fixed this phase. Root cause captured with exact command, failing check IDs, and evidence above (per this gate's required fields). None blocks any currently-supported Payroll, DRE, or Org Design output — they concern UI-copy/content-completeness in components this phase did not touch. Recommended: a dedicated content/panel-redesign-reconciliation phase, distinct from Payroll's shared-engine integration.

## Summary

| Script | Before this gate | After this gate |
|---|---|---|
| `validate:phase15f` | crash | 179/185 (5 disclosed, out-of-boundary) |
| `validate:phase15i2c` | crash | **26/26** |
| `validate:phase15j` | crash | **21/21** |
| `validate:phase15i2-packet` | 24/25 | 24/25 (unchanged, disclosed) |
| `validate:phase15j3` | 7/20 | 7/20 (unchanged, disclosed) |
| `validate:phase15l` | 15/18 | 15/18 (unchanged, disclosed) |
| `validate:phase15l2` | 17/27 | 17/27 (unchanged, disclosed) |
| `validate:phase15m` | 13/20 | 13/20 (unchanged, disclosed) |
| `validate:phase15o` | 14/23 | 14/23 (unchanged, disclosed) |

No value was invented; every fix cited a live formula, an already-independently-validated script, or a governance decision on record. The three crashes are gone. All remaining red is disclosed with exact evidence, not silently passed or masked.
