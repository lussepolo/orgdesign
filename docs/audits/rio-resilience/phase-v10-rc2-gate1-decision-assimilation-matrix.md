# V10-RC2 Gate 1 — Decision Assimilation Matrix

**Date:** 2026-07-29. **Entry state verified:** branch `main`, HEAD `6d95dde`,
origin/main `1cab331`, ahead 17/behind 0, worktree clean, `b64a0c4`/`9c90cb6`/
`e29f56a`/`3dba3c9` confirmed ancestors of HEAD, pre-existing stash
(`stash@{0}`, "WIP rio-scenario-resilience supporting data") present and
untouched throughout this phase.

**Method:** direct read of
`docs/audits/rio-resilience/phase-v10-f1a-revenue-governance-decision-register.json`,
`docs/audits/rio-resilience/phase-v10-f1a-revenue-governance-decision-packet.md`,
`docs/finance/dre-finance-confirmation-register.json`, `IMPLEMENTATION.md`
(Phase V10-P1 §4058–4285, V10-F1B §3950, V10-F2/F2.2 §4285–4780, V10-RC1B/RC1B.1
§5097–5212), read-only inspection of `stash@{0}`'s untracked tree
(`1e17502278f6120f62916739ca1b41db90c54e2d`), and direct verification against
the actual source files (`fopagEngine.ts`, `payrollGrowth.ts`, `payrollAdapter.ts`,
`dreLineItemMap.ts`, `dreRevenueDriverSourceData.ts`, `openingPackageOccupancySourceData.ts`,
`payrollRoleCostSourceData.ts`). Per the phase directive, a `pending` or
`calculationReady: false` marker was never treated as proof of non-response
without checking whether a later, more specific approval superseded it.

## Matrix

| Decision ID | Topic | Recorded response | Evidence location | Current repository status | Contradiction | Required repository update | Calculation impact |
|---|---|---|---|---|---|---|---|
| D-R1 | Governing workbook precedence | `explicit_precedence_rule`: v10 governs `percentual_desconto_medio`, payroll salary escalation, payroll benefits escalation, tuition escalation, and Reajuste Despesas for the 22 row-11-dependent lines only — not a blanket workbook selection | `phase-v10-f1a-revenue-governance-decision-register.json:33-36`, `approvalStatus: "approved_by_project_owner"` | **Encoded consistently.** `fopagEngine.ts:29-36` (V10-P1), `payrollGrowth.ts`, `dreLineItemMap.ts`/`reajusteDespesasGrowth.ts` (V10-F2.2), `dreRevenueDriverSourceData.ts` (D-R3) all implement the scoped v10 precedence exactly as approved. | None found. | None. | Governs D-R2/D-R3/D-R7 below and payroll escalation (Gate 5). |
| D-R2 | Tuition escalation rate | `wb_v10_59pct`: 6.0% (2028, not applied — stored tuition already 2028-basis) / 5.9% (2029+) | `...register.json:64-66`, approved 2026-07-27 | **Encoded consistently.** `receitaEngine.ts` sources escalation from `tuitionGrowth.ts`; app's prior 8% convention retired. | `financeConventionSourceDecisions.md` §2.6 (recovered from stash, see companion doc) still literally says "8%, confirmed" — historical only, correctly superseded, no repository file currently asserts 8% is live. | None (already corrected; recovered doc explicitly flags §2.6 superseded). | Tuition revenue only; base rates unaffected (see D-R6). |
| D-R3 | `percentual_desconto_medio` schedule | `workbook_v10_row224`: 25/20/20/18/15/15/15/12.5/12.5/12.5 (2028–2037) | `...register.json:106-108`, approved 2026-07-27 | **Encoded consistently.** `dreRevenueDriverSourceData.ts` live; stale 12%/12.5% flat schedule retired. | **`docs/finance/dre-finance-confirmation-register.json` item F04 (line 69)** still describes `currentEngineBehavior` as "20% (2028-2030), 17% (2031), 15% (2032-2033), 12.5% terminal" — this is neither the pre-D-R3 stale schedule nor the current D-R3 schedule; it is the intermediate "historical Finance-packet" schedule from Phase 15I.2C, now doubly superseded. | **Gate 2 fix:** correct F04's `currentEngineBehavior` to name the live `workbook_v10_row224` schedule and add a `supersededBy: "D-R3"` pointer. F04's actual *ask* (Finance-signed provenance document, not the schedule itself) remains genuinely open — do not close F04. | Discount deduction, all years; already live. |
| D-R4 | `DISCOUNT_SCHEDULE_SOURCE` disposition | `B_retain_audit_only`, now single-sourced from the same canonical v10 row 224 values | `...register.json:134-136` | **Encoded consistently.** `discountScheduleSourceData.ts` reads the canonical source; `dreScenarioAdapters.ts` still structurally excludes `netReceitaAfterDiscount` from the DRE handoff, as approved. | None found. | None. | None (audit-only, unread by DRE, as approved). |
| D-R5 | `desconto_metodo` re-verification | Unresolved — `selectedOption: null` | `...register.json:154-156` | **Genuinely unresolved.** Runtime value 2.8243% (`dreRevenueDriverSourceData.ts`) is unchanged, unverified against v10. | None (correctly still marked `pending` everywhere it appears). | None — no invented value. Gate 6/8 must report this driver as `uncertified`, not `unavailable` (it runs, but is not confirmed against the governing workbook). | ~2.8% of gross tuition in every scenario; unquantified precision risk only. |
| D-R6 | Base tuition source authority | Unresolved — `selectedOption: null` | `...register.json:174-176` | **Genuinely unresolved.** `tuitionSourceData.ts` remains `screenshot_transcription_based`, `needsFinanceReview: true`. | None (correctly still marked `pending`). Recovered stash conventions (§2.1/2.7/2.8/2.9, companion doc) constrain *how* tuition is used but do not supply signed base rates. | None — no invented value. | Base tuition rates for all scenarios; systemic ~2.7–3.3% uncertainty vs. workbook v9 on 3 of 5 tuition scenarios. |
| D-R7 | `reajuste_despesas` annual series | `apply_v10_2028_2029plus`, fully implemented for all 22 row-11-dependent lines | `...register.json:200-202`, `approvalStatus: "approved_by_project_owner_fully_implemented"` | **Encoded consistently.** `reajusteDespesasGrowth.ts`, `dreLineItemMap.ts`, `dreEngine.ts` — validated by `scripts/validate-v10-f2.ts` (76/76). | **`docs/finance/dre-finance-confirmation-register.json` item F01 (line 31)** still describes `currentEngineBehavior` as "reajuste term omitted" and `status: "provisional_source"` / `decisionStatus: "open"` — this is the pre-D-R7 state; D-R7 supersedes it entirely for the `outras_receitas` line F01 names. | **Gate 2 fix:** correct F01's `currentEngineBehavior` to state the line is now `formula_derived`/live per D-R7, add `supersededBy: "D-R7"`. F01's *ask* (index name + signed source reference) is a provenance question distinct from the now-resolved formula/value question — keep F01 open for provenance, but not for "reajuste term omitted" (that specific gap is closed). | All 22 lines feed `receita_operacional_liquida` → EBITDA → DCF/payback. |
| D-R8 | G4 Base 2028 PK3 enrollment | `application_258` (28 PK3, 258 total) | `...register.json:222-224` | **Encoded consistently.** `openingPackageOccupancySourceData.ts` live; v9's 259/PK3=29 correctly superseded. | None found. | None. | 2028 enrollment for `t1_g4/base`, all downstream revenue/staffing. |
| F01 | `outras_receitas` reajuste index name + signed source | `status: "open"`, provenance ask only | `dre-finance-confirmation-register.json:26-43` | **Contradictory repository record** (see D-R7 row — same underlying line, formula/value question closed by D-R7, provenance question still open). | See D-R7. | See D-R7. | None beyond D-R7. |
| F02 | `descontos_metodo_de_assinatura` formula base | `resolved` | `...register.json:127-141` | **Encoded consistently.** Register already correctly marks this resolved; matches `dreEngine.ts` (base = `receitas_com_ensino_regular`). | None. | None. | None (already correct). |
| F03 | Tuition base rate provenance | `status: "open"` | `...register.json:44-62` | **Genuinely unresolved** — identical underlying question to D-R6, correctly still open in both records. | None (consistent). | None. | See D-R6. |
| F04 | Discount schedule provenance sign-off | `status: "open"` | `...register.json:63-81` | **Contradictory repository record** (see D-R3 row: schedule/value decided, provenance ask still genuinely open). | See D-R3. | See D-R3. | None beyond D-R3. |
| F05 | 2028 enrollment baseline: engine (228, `t1_g3`/intermediario→base) vs. PnL workbook baseline (~246, Phase 13B) | `status: "open"`, `authoritative2028Enrollment: null` | `...register.json:83-103` | **Genuinely unresolved.** Distinct question from D-R8 (which is `t1_g4`, 258 vs 259 — a different opening package entirely). The `intermediario`→`base` terminology sweep (`e29f56a`) is confirmed comment/fixture-only, zero numeric impact (commit message + diff inspection) — it does not touch this question. | None (correctly still open; the terminology rename does not resolve it and must not be read as if it did). | None — no invented mapping, no averaging of 228 and 246. | `t1_g3` scenario enrollment only; does not propagate to `t1_g4`/`t1_g6` packages used elsewhere in this phase's browser-QA matrix. |
| F06 | Instructional-capacity (MS 9 / HS 11, Phase 15H.2, `secondaryEducatorCapacityModel.ts`) vs. FOPAG payroll (`fopagEngine.ts`) assumption sync | `status: "open"`, `reconciliationStatus: "pending_dedicated_future_phase"` | `...register.json:104-125` | **Genuinely unresolved**, confirmed still open — no later phase reconciled these two models. The recovered stash document `payrollStaffingRuleSourceTrace.md` (Phase 8B, 2026-06-03) records an even earlier, different MS approved-v1 count (g6=3/g7=4/g8=3 = 10 total) that itself was never reconciled with either the 9-educator Phase 15H.2 model or the payroll adapter's own MS/HS fixed-FTE table — three non-identical MS/HS staffing figures exist in the repository's history, none formally reconciled. | None beyond the register's own accurate "open" status; this strengthens rather than changes the classification. | None — Gate 4's per-division table must show MS/HS staffing with its actual source and name this three-way reconciliation gap explicitly, not silently pick one. | MS/HS instructional headcount vs. payroll headcount may diverge; does not block EY/LS (Gate 4's governed rule) or FOPAG's own internal `calculationReady`. |

## Stale-flag contradiction (not a decision-register item, but load-bearing)

**`payrollAdapter.ts:160-164`** (Phase 13H, 2026-06-09) explicitly documents
that the per-record `calculationReady`/`fopagCalculationReady`/`adapterImplemented`
fields on `PayrollAdapterBuildOutput` (and the per-record `calculationReady`
in `payrollRoleCostSourceData.ts`, e.g. line 12/82/115) are **legacy,
superseded** by `FopagEngineOutput.calculationReady`, computed dynamically
per scenario in `fopagEngine.ts` (`hasBlockingDiagnostic` over adapter
diagnostics — `fopagEngine.ts:42-152`). `scripts/validate-v10-p1.ts:249`
asserts `fopagOutput.calculationReady === true` and this passes (58/58,
confirmed by rerun this phase).

`IMPLEMENTATION.md:5200-5202` (Phase V10-RC1B, 2026-07-29 — the most recent
committed narrative) cites the legacy static flag
(`payrollRoleCostSourceData.ts:12`, `calculationReady: false`) as the live
reason "grade-level staffing completeness remains blocked." This is the
stale-flag pattern the phase directive named explicitly ("do not treat an
old ... `calculationReady: false` flag as proof"). **Classification:
contradictory repository record.**

The underlying *substance* of RC1B's finding is correct and separately
evidenced — `ExecutiveOrgDesignTab.tsx` hardcodes captação to `"base"` and
`PayrollProjectionTab.tsx` has no `openingPackageId`/org-design state, so the
UI genuinely does not expose grade-level staffing across scenario dimensions
today. But the *reason* it doesn't is a UI-wiring gap (Gate 3), not a missing
payroll calculation approval — payroll (base salary, salary escalation,
benefits escalation, encargos) is fully governed and implemented (V10-P1/
V10-P1.1, `IMPLEMENTATION.md:4058-4285`).

**Gate 2 fix:** replace the `payrollRoleCostSourceData.ts:12` citation in
IMPLEMENTATION.md's RC1B section with a corrected statement naming the actual
current blocker (cross-tab scenario-state wiring, resolved by Gate 3 of this
phase) and note that the FOPAG calculation itself is `calculationReady: true`
for governed scenario combinations as of Phase 13H/V10-P1.

## Classification summary

- **approved_and_executable / encoded_consistently:** D-R1, D-R2, D-R3, D-R4,
  D-R7, D-R8, F02, plus (newly confirmed this phase) the Early Years
  1-section = 1 teaching lead + 1 learning assistant + 1 learning monitor
  staffing rule (`payrollAdapter.ts:344-349`, "approved v1, Phase 8H.1,
  Luciana 2026-06-03") and the full payroll salary/benefits/encargos
  escalation mechanism (V10-P1/V10-P1.1).
- **contradictory_repository_records (Gate 2 must correct):** F01 (vs. D-R7),
  F04 (vs. D-R3), and the `payrollRoleCostSourceData.ts:12` stale-flag
  citation in IMPLEMENTATION.md's RC1B section.
- **genuinely_unresolved (report as unavailable/uncertified, do not invent):**
  D-R5, D-R6/F03, F05, F06.
- **insufficient_evidence:** none identified beyond the above — every
  outstanding item has a named, specific missing artifact (signed workbook
  row, signed tuition table, scenario-mapping confirmation, or a
  reconciliation phase), not a total absence of evidence.

## What this changes for Gates 3–9

Gate 5 (Payroll/FOPAG) is **not** blocked on missing salary/dissídio/benefits/
encargos governance — that evidence exists and is implemented. The remaining
Gate 5 work is wiring (shared scenario contract, Gate 3) and the F06
reconciliation gap (report as a named limitation, not silently resolved).
Gate 4's Early Years rule has recorded governance and must not be extended to
MS/HS, which have their own separate, partially-reconciled staffing evidence
(F06). Gate 6 is blocked only on D-R5/D-R6/F03's specific values — the
surrounding tuition *mechanism* (escalation, discount timing, Receita v1
scope) is governed and should be wired in full.
