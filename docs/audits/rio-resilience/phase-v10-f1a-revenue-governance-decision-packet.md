# Phase V10-F1A — Revenue Governance Decision Packet

**Purpose:** Evidence-packaging and decision-support only. No application code, validator,
or documentation (other than this packet and its companion JSON register) was modified.
No financial assumption was selected on Finance's behalf.

**Repository identity at packet creation:**

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD | `048bb3dbacd65de9c9962e8fca913f08c451eb71` |
| origin/main | `048bb3dbacd65de9c9962e8fca913f08c451eb71` (0 ahead / 0 behind) |
| Pre-existing dirty work | 19 modified + 8 untracked files, unrelated to revenue, preserved unchanged |

**Reference scenario used for all illustrative figures below:** `t1_g4 / base / bp1_division_differentiated`
(2028 total enrollment = 258, matching the governed G4 Base fixture). All gross/net figures are
computed by directly invoking the unmodified `calculateReceita()` engine — they are not
hand-estimated.

---

## R1. Governing financial workbook/version inventory

| Workbook | Filename | Path | SHA-256 | Size | Modified | Read method |
|---|---|---|---|---|---|---|
| v9 (PnL) | `Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx` | `/Users/lucianapolonen/Downloads/` | `d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4` | n/a recorded | audited 2026-07-21/22 | direct OOXML/XML cell read, no recalculation |
| v10 (PnL) | `Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx` | `/Users/lucianapolonen/Downloads/` | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | 6,643,715 B | 2026-07-24 11:30 | direct OOXML/XML cell read, no recalculation |
| G4 occupancy | `Modelo_Ocupacao_Concept_2028_v5_T1_G4_258.xlsx` | `/Users/lucianapolonen/Downloads/` | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | 34,075 B | 2026-07-02 11:41 | direct read |
| G6 occupancy | `Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx` | `/Users/lucianapolonen/Downloads/` | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | 41,259 B | 2026-07-24 09:39 | direct read |

**Note on filename evidence:** the G4 occupancy workbook's own filename contains the literal
string `_258`, i.e. it was Finance-named specifically around the 258 enrollment figure. This is
evidence, not a decision — see R8.

**Relevant sheet/rows and time horizon:**

| Workbook | Sheet | Rows used in this packet | Horizon | Formula or hardcoded? |
|---|---|---|---|---|
| v9 | `PnL` | Row 7 (Reajuste Mensalidade), Row 9 (Reajuste Despesas), Row 10 (Dissídio), Row 222 (% Desconto Médio), Row 13 (Descontos Método, back-derived), Row 221 (Número de Alunos), Row 225 (Receitas com Ensino Regular) | 2028–2047 (C:V) | Row 7, 10, 222: hardcoded per-column constants. Row 9: formula `=IPCA+1%` at C9, subsequent columns not independently re-read. Row 13: back-derived ratio, not a direct extracted per-year series. |
| v10 | `PnL` | Row 5 (IGP-M), 6 (IPCA), 7 (SELIC), 8 (WACC), 9 (Reajuste Serviços), 10 (Reajuste Material), 11 (Reajuste Despesas), 12 (Dissídio), 13 (Benefícios), 14 (Deduções), Row 224 (% Desconto Médio), Row 227/230 (Bolsa de Estudos formula) | 2028–2037 (E:N) | Row 9 E=formula `E6+2%`, F:N=hardcoded 0.059. Row 224 hardcoded per column. |
| Application (live) | `discountScheduleSourceData.ts`, `dreRevenueDriverSourceData.ts`, `receitaEngine.ts`, `tuitionSourceData.ts` | n/a (TypeScript source) | 2028–2047 | mixed — see R2–R6 |

**Relationship to application runtime:** neither v9 nor v10 is wired into the application at
build or run time. Both are external, manually-audited evidence files. The application's live
values were extracted from an **earlier, unidentified workbook revision** (Phase 12J/12K,
2026-06-08/09), predating both v9 and v10.

**Evidence of approval or source authority:** none of the three (application 8% tuition rate,
v9, v10) carries a Finance signature or ratification record found in this repository. v9 and
v10 are the most direct workbook evidence (raw XML cell reads, hash-verified, no
recalculation), but neither has a documented approval/sign-off event.

**Conflicts between v9 and v10:**

| Parameter | v9 | v10 | Consistent? |
|---|---|---|---|
| IPCA | 3.64% (2028, from `PnL!C4`) | 4.0% (2028) / 3.9% (2029+, from `PnL!C6`) | **No — different macro forecast vintage** |
| Reajuste Despesas | 4.64% (2028, `C9`=IPCA+1%) | 5.0% (2028) / 4.9% (2029+, row 11, `E11`=IPCA+1%) | Formula identical (IPCA+1%); input IPCA differs |
| Dissídio (salary) | 5.64% flat, all 20 years (row 10) | 6.0% (2028) / 5.9% (2029+, row 12) | Formula pattern differs: v9 flat; v10 has distinct 2028 vs 2029+ |
| Tuition-adjacent escalation | Row 7 "**Reajuste Mensalidade**" = 5.64% flat, all years | Row 9 "**Reajuste Serviços**" = 6.0% (2028) / 5.9% (2029+) | **Row numbers and row LABELS both differ — see flag below** |
| % Desconto Médio | Row 222: 25/20/20/18/**15**/15/15/12.5/12.5/12.5 (2028–2037) | Row 224: 25/20/20/18/**15**/15/15/12.5/12.5/12.5 (2028–2037) | **Identical schedule, independently confirmed in both workbooks** (row number shifted +2, consistent with 2 rows inserted upstream) |

**Row-label flag (does not resolve, only documents):** v9's row 7 is explicitly labeled
"Reajuste Mensalidade" (tuition/monthly-fee adjustment) at 5.64%. v10's row 9 is labeled
"Reajuste Serviços" (services adjustment) at 5.9%, and v10-era audits used this same row to
index `Ticket Serviço`/upselling escalation — the same row label ("Reajuste Serviços") that,
in an earlier (pre-v9) workbook revision, sat at row 7 and fed the application's
`ticket_medio_upselling` driver. **It has not been confirmed that v10 Row 9 "Reajuste Serviços"
governs the same economic line as v9 Row 7 "Reajuste Mensalidade."** They may be the same
concept under a renamed/renumbered row, or two genuinely distinct escalation indices. Finance
must confirm row correspondence before either value is treated as tuition escalation.

**Decision required:** Finance must select one governing workbook (v9, v10, or a newer
revision not yet reviewed) or provide an explicit precedence rule (e.g., "most recent workbook
governs unless a specific row is superseded by written Finance confirmation").

> **Update — Phase V10-F1B (2026-07-27, project owner):** an explicit, scoped precedence rule
> was approved: **v10 (SHA `2e3230ad...`) governs `percentual_desconto_medio` (PnL Row 224),
> payroll salary escalation, and benefits escalation ONLY.** This is a project-owner
> implementation decision, not a Finance signature, and does not extend to tuition escalation
> (D-R2), base tuition (D-R6), `reajuste_despesas` (D-R7), enrollment (D-R8), or any other
> assumption. See D-R1 in the Decision Form below.

---

## R2. Tuition escalation

| Alternative | Base year | First escalated year | Annual rate | Compounding | Source cell/formula |
|---|---|---|---|---|---|
| Application runtime (active) | 2028 (factor=1) | 2029 | 8.00% | Yes, `1.08^(year-2028)` | `receitaEngine.ts:71-74`; cites `financeConventionSourceDecisions.md §2.5/§2.6` — **file does not exist in repository** (confirmed via `find`) |
| Workbook v9 | 2028 | 2029 | 5.64% | Yes, flat constant all 20 years (2028–2047) | `PnL!C7:V7` ("Reajuste Mensalidade"), direct XML read |
| Workbook v10 | 2028 | 2029 | 5.90% (6.0% is the 2028 value only, formula `E9=E6+2%`) | Yes, hardcoded flat 2029–2037 | `PnL!F9:N9` ("Reajuste Serviços"), direct XML read |
| No fourth schedule found | — | — | — | — | — |

**Tuition index (compounding factor), 2028–2037:**

| Year | App (8%) | v9 (5.64%) | v10 (5.9%) |
|---|---|---|---|
| 2028 | 1.0000 | 1.0000 | 1.0000 |
| 2029 | 1.0800 | 1.0564 | 1.0590 |
| 2030 | 1.1664 | 1.1160 | 1.1215 |
| 2031 | 1.2597 | 1.1789 | 1.1876 |
| 2032 | 1.3605 | 1.2454 | 1.2577 |
| 2033 | 1.4693 | 1.3157 | 1.3319 |
| 2034 | 1.5869 | 1.3899 | 1.4105 |
| 2035 | 1.7138 | 1.4682 | 1.4937 |
| 2036 | 1.8509 | 1.5511 | 1.5819 |
| 2037 | 1.9990 | 1.6385 | 1.6752 |

**Projected gross tuition revenue, `t1_g4/base/bp1`, by alternative (BRL, actual enrollment/base
tuition, escalation swapped via `actualGross(y) × (1+r)^(y-2028) / 1.08^(y-2028)`):**

| Year | App 8% (current) | v9 5.64% | v10 5.9% | v9 vs App | v10 vs App |
|---|---:|---:|---:|---:|---:|
| 2028 | 25,608,249 | 25,608,249 | 25,608,249 | 0 | 0 |
| 2029 | 33,959,310 | 33,217,236 | 33,298,990 | −742,074 | −660,320 |
| 2030 | 43,214,372 | 41,346,379 | 41,550,151 | −1,867,993 | −1,664,220 |
| 2031 | 53,622,985 | 50,183,956 | 50,555,406 | −3,439,029 | −3,067,579 |
| 2032 | 65,034,431 | 59,533,566 | 60,121,827 | −5,500,865 | −4,912,605 |
| 2033 | 78,037,147 | 69,875,442 | 70,739,569 | −8,161,705 | −7,297,578 |
| 2034 | 93,153,064 | 81,587,752 | 82,800,007 | −11,565,312 | −10,353,057 |
| 2035 | 110,724,066 | 94,858,114 | 96,504,476 | −15,865,952 | −14,219,590 |
| 2036 | 130,620,559 | 109,458,284 | 111,632,121 | −21,162,275 | −18,988,438 |
| 2037 | 145,328,397 | 119,122,066 | 121,786,830 | −26,206,331 | −23,541,568 |
| **Cumulative 2029–2037** | **734,692,332** | **639,182,795** | **648,989,377** | **−95,509,537** | **−85,702,955** |

**Reading:** the application's 8% assumption produces cumulative gross tuition revenue
R$85.7M–95.5M higher than either workbook-evidenced alternative over 2029–2037 for this single
opening package/scenario. Not a recommendation of newest-file precedence — v9 is older than
v10 and is included on equal footing.

---

## R3. Average tuition discount / `percentual_desconto_medio`

| Schedule | Economic definition | Source | Runtime status | Historical / current / unresolved |
|---|---|---|---|---|
| Current DRE runtime | "Bolsa de Estudos" driver, applied uniformly to all learners as % of gross regular tuition | `dreRevenueDriverSourceData.ts` `percentual_desconto_medio`; extracted Phase 12J (2026-06-08) from an unidentified earlier workbook | **Active — feeds live `bolsa_de_estudos` calculation in `dreEngine.ts`** | Confirmed **stale**: re-derived from v9 row 222 in Phase 2 forensic audit and found to diverge in 7 of 10 years (2028–2034) |
| Workbook v9 (`PnL!C222:V222`) | Same DRE "% Desconto Médio" line, direct 2026-07-21 read | v9 workbook, direct XML | Not applied — evidence only | source-backed candidate |
| Workbook v10 (`PnL!E224:N224`) | Same DRE "% Desconto Médio" line, direct 2026-07-24 read | v10 workbook, direct XML | Not applied — evidence only | source-backed candidate — **independently confirms v9's ramping schedule with identical values** (row shifted +2) |
| Receita audit-layer (`DISCOUNT_SCHEDULE_SOURCE`) | "Average effective discount rate" for the Receita-engine-only path | `discountScheduleSourceData.ts`; sourced from a "Head of Finance message" (verbal, undated document) | **Active but explicitly `audit_only`** — computes `netReceitaAfterDiscount`, never read by `dreEngine.ts` (structural guard in `dreScenarioAdapters.ts`) | current (for its own isolated path only) |
| Historical Finance-packet schedule | Snapshot of Layer-1/DRE state as of Phase 15I.2C (2026-06-18), `docs/finance/dre-finance-confirmation-packet.md` F04 | Same verbal Head-of-Finance source, captured one revision earlier | **Superseded** — Layer 1 was later corrected (Phase 15Q) to the schedule shown above; this table no longer matches any live source | historical/superseded |

**Year-by-year values (2028–2037):**

| Year | Current DRE runtime | Workbook v9 (row 222) | Workbook v10 (row 224) | Receita audit-layer | Historical Finance-packet |
|---|---|---|---|---|---|
| 2028 | 12.0% | 25.0% | 25.0% | 25.0% | 20.0% |
| 2029 | 12.0% | 20.0% | 20.0% | 20.0% | 20.0% |
| 2030 | 12.0% | 20.0% | 20.0% | 20.0% | 20.0% |
| 2031 | 12.0% | 18.0% | 18.0% | 18.0% | 17.0% |
| 2032 | 12.0% | 15.0% | 15.0% | 18.0% | 15.0% |
| 2033 | 12.5% | 15.0% | 15.0% | 15.0% | 15.0% |
| 2034 | 12.5% | 15.0% | 15.0% | 15.0% | 12.5% |
| 2035 | 12.5% | 12.5% | 12.5% | 15.0% | 12.5% |
| 2036 | 12.5% | 12.5% | 12.5% | 12.5% | 12.5% |
| 2037 | 12.5% | 12.5% | 12.5% | 12.5% | 12.5% |

**v9 vs v10 agreement:** identical in every year shown — the strongest cross-corroborated
evidence found in this packet. **v9/v10 vs current DRE runtime disagreement:** every year
2028–2034 (2035–2037 happen to converge at 12.5%).

**Numerical revenue impact (net-of-discount only, isolating this one deduction, `t1_g4/base/bp1`,
8% escalation held constant, BRL):**

| Year | Gross (8% esc.) | Deduction @ current (12%/12.5%) | Deduction @ v9/v10 ramp | Δ deduction (v9/v10 − current) |
|---|---:|---:|---:|---:|
| 2028 | 25,608,249 | 3,072,990 | 6,402,062 | +3,329,072 |
| 2029 | 33,959,310 | 4,075,117 | 6,791,862 | +2,716,745 |
| 2030 | 43,214,372 | 5,185,725 | 8,642,874 | +3,457,149 |
| 2031 | 53,622,985 | 6,434,758 | 9,652,137 | +3,217,379 |
| 2032 | 65,034,431 | 7,804,132 | 9,755,165 | +1,951,033 |
| 2033 | 78,037,147 | 9,754,643 | 11,705,572 | +1,950,929 |
| 2034 | 93,153,064 | 11,644,133 | 13,972,960 | +2,328,827 |
| 2035 | 110,724,066 | 13,840,508 | 13,840,508 | 0 |
| 2036 | 130,620,559 | 16,327,570 | 16,327,570 | 0 |
| 2037 | 145,328,397 | 18,166,050 | 18,166,050 | 0 |

If v9/v10's schedule is confirmed authoritative, net revenue (this scenario, this deduction
only) would be **lower** than currently modeled by ~R$1.95M–3.46M/year through 2034.

**Decision required:** Finance must identify which schedule governs the live DRE.

> **Update — Phase V10-F1B (2026-07-27, project owner):** `workbook_v10_row224` (25/20/20/18/
> 15/15/15/12.5/12.5/12.5) was selected and implemented as canonical for the live DRE
> `percentual_desconto_medio` driver, replacing the stale 12%/12.5% flat schedule. This is a
> **project-owner implementation decision, explicitly not Finance-signed or Finance-approved.**
> See D-R3 in the Decision Form below.

---

## R4. Receita Layer 1 (`DISCOUNT_SCHEDULE_SOURCE`) disposition

Facts, not a recommendation:

- **It is not currently consumed by the live DRE.** `dreScenarioAdapters.ts` reads only
  `grossReceitaBeforeDiscount`; `netReceitaAfterDiscount` is structurally guarded out
  (comment: "must NOT use netReceitaAfterDiscount (audit_only per Phase 12H)").
- **It does not currently create a computational double discount.** No file — application code
  or UI — reads `netReceitaAfterDiscount` except an existing validator
  (`dreEngineValidation.ts`) that explicitly asserts ROL ≠ `netReceitaAfterDiscount` as a
  "structural non-equivalence" check (by design, Phase 12H). No UI component was found that
  displays it (verified by repo-wide search).
- **It may conceptually duplicate `percentual_desconto_medio`.** Both are described internally
  as an "average effective discount." Layer 1's 2028 value (25%) is numerically identical to
  workbook v9/v10 row 222/224's 2028 value, and the two schedules are close but not identical
  in 2032 (Layer 1 = 18%, workbook = 15%) and 2035 (Layer 1 = 15%, workbook = 12.5%).
- **No implementation decision (A/B/C/D) is made in this packet.** Options A (retire), B (retain
  as audit-only, status quo), C (make canonical for DRE), D (reclassify as a distinct mechanism)
  are all evidentially open — see decision form, item D4.

> **Update — Phase V10-F1B (2026-07-27, project owner):** Option **B (retain as audit-only)**
> was selected, with a refinement: `DISCOUNT_SCHEDULE_SOURCE` no longer maintains an
> independent rate schedule — it now reads the same canonical v10 Row 224 source as the DRE,
> removing the prior conceptual-duplication risk while remaining structurally excluded from the
> live DRE handoff (`netReceitaAfterDiscount` is still not consumed by `dreEngine.ts`).

---

## R5. `desconto_metodo` re-verification

| Item | Finding |
|---|---|
| Exact sheet/cell (v9) | `PnL!C13` (and inferred `C13:V13` — only `Z13`/`C13` ratio independently confirmed) |
| Formula or hardcoded | **Back-derived**, not a direct per-year extraction: `Z13 = -Y230/Y225` (historical ratio of Descontos Método ÷ Receitas com Ensino Regular), then applied flat: `C230 = -C$13 × C225` |
| Value currently in application | 2.8243% (`0.028242752948432766`), flat across all 20 years (2028–2047), in `dreRevenueDriverSourceData.ts` |
| Applicable years | Application applies it flat to all 20 years; the source is a **single back-derived historical ratio**, not a directly-read annual series |
| v9 direct re-verification | **Not performed** — the Phase 2 forensic reconciliation (`phase-2-forensic-reconciliation-v9.md`) re-verified row 222 (Bolsa de Estudos) directly against v9 XML but did **not** re-read row 13 (`C13:V13`) directly; only the pre-existing back-derivation is on record |
| v10 verification | **Not performed at all** — none of the four v10 audit documents (A/B, C, D, or the certification report) mention "Descontos Método," "assinatura," row 13, or an equivalent row in v10's numbering |
| Represents payment-method discount? | Consistent with the DRE line label "Descontos Método de Assinatura" (payment/subscription-method discount) — a distinct economic concept from Bolsa de Estudos, per the confirmed PnL formula structure (`C230 = -C13 × C225`, independent of `C222`/`C224`) |
| Applied independently against gross tuition? | **Yes, as currently coded** — both `bolsa_de_estudos` and `descontos_metodo_de_assinatura` are computed off the same base (`receitas_com_ensino_regular` / gross), not sequentially, matching the PnL formula exactly |
| Remains valid in v9/v10? | **Unconfirmed.** No direct-read evidence exists in either governing workbook. The current 2.8243% runtime value should not be treated as authoritative until a direct row-13-equivalent read is performed in whichever workbook Finance designates as governing (R1). |

**Decision required:** a direct XML/OOXML re-read of the "Descontos Método" row in the
Finance-designated governing workbook (R1) before this value can be certified.

---

## R6. Base tuition source

Current tuition base records (`tuitionSourceData.ts`, `TUITION_SOURCE_RECORDS`) are
**`sourceEvidenceOrigin: "screenshot_transcription_based"`**, dated 2026-06-02, sourced from
`tuitionScenarioStructuredTranscription.py` — **not** a signed Finance spreadsheet. Confirmed
`needsFinanceReview: true` on every record inspected. Cross-check against v9 workbook Cenário 1
(from prior forensic audit) shows all five tiers ~2.7–3.3% lower in the application than the
current workbook (EY-M/EY-I/LS/MS/HS), a systematic gap consistent with the application
extracting an earlier, since-revised workbook version.

**Finance must provide or approve, for each tuition scenario in use (`bp_scenario_1`–`5`):**

| Field | Current state |
|---|---|
| Authoritative tuition table | Not yet provided as signed XLSX |
| Grades/divisions covered | EY (T1/T2/PK3/PK4), LS (K–G5), MS (G6–G8), HS (G9–G12) — per `enrollmentTuitionGradeMapping.ts` |
| Scenarios covered | `bp_scenario_1`–`3` from screenshot transcription (2026-06-02); `bp_scenario_4`/`5` added Phase 15Q from workbook v9 directly (higher confidence) |
| Currency and periodicity | BRL, annual gross contract value + monthly tuition, both recorded per record |
| Effective year | 2028 (base year; escalation applied per R2) |
| Monthly or annual | Both fields present (`annualGrossContractValueBRL`, `monthlyTuitionBRL`) — Finance to confirm which is primary/authoritative |
| Enrollment or material fees included | Not documented either way in the current records — open question |
| Source workbook and approval owner | Not documented — `needsFinanceReview: true` on all records |

---

## R7. `reajuste_despesas`

**Known workbook formula** (`dreScenarioAdapters.ts` comment, confirmed against PnL structure):

```
outras_receitas = (Y233 / Y221) × (1 + C9) × C221
                  \_______________/   \___/   \___/
                  base per-learner   reajuste  learner
                  ratio (2,571.87)   despesas  count
```

`reajuste_despesas` is currently **NOT applied** in the live engine
(`dreEngine.ts:130`) — the multiplier `(1+C9)` term is omitted; the code and F01 finance-packet
item both self-document this omission explicitly.

**Confirmed 2028 evidence, per workbook (conflicting across versions — see R1):**

| Workbook | Row | Formula | 2028 value |
|---|---|---|---|
| v9 | `PnL!C9` ("Reajuste Despesas") | `=IPCA+1%` = 3.64%+1% | **4.64%** |
| v10 | `PnL!E11` ("Reajuste Despesas") | `=IPCA+1%` = 4.0%+1% | **5.0%** (4.9% from 2029, per row 11 series) |

The two workbooks agree on the **formula** (IPCA+1pp) but disagree on the **IPCA input**
(3.64% vs 4.0%), which is itself an unresolved macro-assumption vintage question (see R1).

**Finance must provide:**

| Item | Status |
|---|---|
| Approved index definition | Formula-confirmed (IPCA+1pp) in both v9 and v10; the underlying IPCA forecast itself is unconfirmed/versioned |
| Annual values for the model horizon (2028–2047) | Not available as a direct per-year extraction in any committed source file (confirmed absent in both v9 and v10 audit sessions beyond the 2028 point value) |
| First application year | Not confirmed — only the 2028 point value is evidenced |
| Applies to other revenue only? | Per the confirmed workbook formula, yes — feeds `outras_receitas` (row 233) only, in the evidence gathered to date |
| Expense lines using the same index | **Not investigated in this packet** — this phase is scoped to revenue only; the Dissídio (salary, row 10/12) and Reajuste Serviços/Material (row 7 or 9/10) rows are visibly *separate* indices in both workbooks, not the same as Reajuste Despesas, so no assumption is made that OPEX shares this factor |
| Compounded? | Not established — only a single point value (2028) is evidenced per workbook; no compounding pattern confirmed |

No extrapolation to OPEX has been made, per instruction.

---

## R8. G4 Base 258 versus 259

> **Resolved — Phase V10-F1B.1 (2026-07-27, project owner):** the project owner has explicitly
> governed `t1_g4 / base / 2028` total enrollment = **258**, PK3 = **28**, PK3 capacity = 36,
> PK3 occupancy = 28/36 = 77.8%. Workbook v9's value (259, PK3=29) is **superseded evidence** —
> documented below for the record, but not an active implementation alternative. This is a
> **project-owner decision, not Finance-signed or Finance-approved.** See D-R8 in the Decision
> Form below.

| Source | Value | Note |
|---|---|---|
| Application / captação source (`openingPackageOccupancySourceData.ts`) — **governed, active** | **258** (total 2028, `t1_g4/base`) | PK3 = 28 (77.8% occupancy = 28/36) |
| Financial workbook v9 (`PnL!C221 = SUM(C149,C171)`) — **superseded, not applied** | 259 | PK3 = 29 (80.6% occupancy = 29/36; 25 existing + 4 new) |
| Sole identified grade-level difference | **PK3 (Pre-K3)** | All other active grades (T1, T2, PK4, K, G1–G4) agree exactly |

**Corrected materiality statement:** one learner is 1/258 = **0.39%** of total 2028 enrollment
for this package/scenario (not "negligible" without an approved materiality threshold — no such
threshold is documented in this repository).

**Historical discrepancy analysis only — not an active implementation alternative.** Annual
gross/net revenue difference that *would have* resulted from the superseded 1-learner PK3 gap
(base value R$91,390.04/yr, `bp_scenario_1`, escalated per each R2 alternative; net shown under
the **current DRE runtime discount** for reference only — not a recommendation). Retained for
the record; 258/28 is the governed, active value:

| Year | Gross Δ @ 8% (app) | Gross Δ @ 5.64% (v9) | Gross Δ @ 5.9% (v10) | Net Δ @ 8% (current DRE disc.) |
|---|---:|---:|---:|---:|
| 2028 | 91,390 | 91,390 | 91,390 | 77,842 |
| 2029 | 98,701 | 96,544 | 96,782 | 84,070 |
| 2030 | 106,597 | 101,990 | 102,492 | 90,795 |
| 2031 | 115,125 | 107,742 | 108,539 | 98,059 |
| 2032 | 124,335 | 113,818 | 114,943 | 105,903 |
| 2033 | 134,282 | 120,238 | 121,725 | 113,704 |
| 2034 | 145,025 | 127,019 | 128,906 | 122,801 |
| 2035 | 156,626 | 134,183 | 136,512 | 132,625 |
| 2036 | 169,157 | 141,751 | 144,566 | 143,235 |
| 2037 | 182,689 | 149,746 | 153,096 | 154,693 |
| **Cumulative 2028–2037** | **1,323,927** | **1,084,421** | **1,098,951** | **1,123,727** |

**Methodology caveat:** only the 2028 figure (28 vs 29) is directly evidenced by workbook
comparison. The 2029–2037 rows above hold the +1-learner gap constant and apply only the
tuition-escalation factor (no re-derivation of PK3's actual multi-year enrollment ramp for a
hypothetical 259-learner track) — presented as an illustrative extrapolation, not a workbook
projection. Enrollment was not modified anywhere in this exercise.

---

## Required Financial Impact Tables (Section 4 cross-reference)

- **Table A (tuition escalation alternatives):** see R2 gross-revenue table above.
- **Table B (discount alternatives, applied to the current 8% escalation gross, `t1_g4/base/bp1`):**

| Year | Gross (8%) | Net @ current DRE (12/12.5%) | Net @ workbook v9/v10 ramp | Net @ Receita audit-layer | Net @ historical Finance-packet |
|---|---:|---:|---:|---:|---:|
| 2028 | 25,608,249 | 22,535,259 | 19,206,187 | 19,206,187 | 20,486,599 |
| 2029 | 33,959,310 | 29,884,193 | 27,167,448 | 27,167,448 | 27,167,448 |
| 2030 | 43,214,372 | 38,028,647 | 34,571,497 | 34,571,497 | 34,571,497 |
| 2031 | 53,622,985 | 47,188,227 | 43,970,848 | 43,970,848 | 44,507,077 |
| 2032 | 65,034,431 | 57,230,300 | 55,279,267 | 53,328,234 | 55,279,267 |
| 2033 | 78,037,147 | 68,282,504 | 66,331,575 | 66,331,575 | 66,331,575 |
| 2034 | 93,153,064 | 81,508,931 | 79,180,105 | 79,180,105 | 81,508,931 |
| 2035 | 110,724,066 | 96,883,558 | 96,883,558 | 94,115,456 | 96,883,558 |
| 2036 | 130,620,559 | 114,292,989 | 114,292,989 | 114,292,989 | 114,292,989 |
| 2037 | 145,328,397 | 127,162,348 | 127,162,348 | 127,162,348 | 127,162,348 |

(`desconto_metodo`, 2.8243% flat, is excluded from the "Net" columns above — it is shown
separately in Table C below, per instruction to keep it visible as a distinct deduction.)

- **Table C (combined scenario matrix).** Formula used throughout: `net = gross − (gross ×
  bolsa_rate) − (gross × desconto_metodo)` — additive off the **same gross base**, matching
  the confirmed PnL formula (`C230=-C13×C225`, `C228=C222×C225`, both independent of each
  other), **not** the sequential `1-(1-d1)(1-d2)` form, because neither deduction is applied to
  the other's output in the live formula:

| Scenario | 2028 gross | 2028 bolsa | 2028 método | 2028 net | 2037 gross | 2037 net |
|---|---:|---:|---:|---:|---:|---:|
| 1. 8% + current-runtime DRE discount | 25,608,249 | 3,072,990 | 723,247 | 21,812,012 | 145,328,397 | 123,057,874 |
| 2. 5.64% (v9) + workbook v9 discount | 25,608,249 | 6,402,062 | 723,247 | 18,482,939 | 119,122,066 | 100,867,473 |
| 3. 5.9% (v10) + workbook v9 discount | 25,608,249 | 6,402,062 | 723,247 | 18,482,939 | 121,786,830 | 103,123,881 |
| 4. 5.9% (v10) + current-runtime DRE discount | 25,608,249 | 3,072,990 | 723,247 | 21,812,012 | 121,786,830 | 103,123,881 |

Full 2028–2037 rows for all four scenarios are reproducible from the formulas above; 2028 and
2037 are shown as bounds. Scenario 1 (all-current) and Scenario 4 (v10 escalation, current
discount) coincide in 2028 by construction (2028 = base year, no escalation applied yet).

- **Table D (258 vs 259):** see R8 table above.

---

## Decision Form

| Decision ID | Question | Available options | Evidence | Financial impact | Recommended evidence standard | Decision owner | Selected option | Approval date | Approval reference |
|---|---|---|---|---|---|---|---|---|---|
| D-R1 | Which workbook governs? | v9 / v10 / newer revision / explicit precedence rule | R1 | Cascades into D-R2–D-R7 | Signed/ratified workbook or written precedence memo | Finance | explicit_precedence_rule: v10 governs percentual_desconto_medio, payroll salary escalation, and benefits escalation ONLY — not a blanket workbook selection | 2026-07-27 | Phase V10-F1B, project owner (Luciana Polonen) |
| D-R2 | Tuition escalation rate | 8% (app, uncertified) / 5.64% (v9) / 5.9% (v10) | R2 | Up to R$95.5M cumulative gross, 2029–2037, this scenario alone | Signed workbook cell or dated Finance memo superseding it | Finance | | | |
| D-R3 | `percentual_desconto_medio` schedule | current 12%/12.5% (stale) / v9-v10 ramp (25%→12.5%) / Receita audit-layer / historical Finance-packet (superseded) | R3 | Up to R$3.46M/yr, 2028–2034, this scenario alone | Direct workbook cell read + Finance confirmation the ramp is intentional | Finance | workbook_v10_row224 (25/20/20/18/15/15/15/12.5/12.5/12.5) — implemented; NOT Finance-signed | 2026-07-27 | Phase V10-F1B, project owner (Luciana Polonen) — project-owner implementation decision pending Finance ratification |
| D-R4 | Disposition of `DISCOUNT_SCHEDULE_SOURCE` (Receita Layer 1) | A. Retire / B. Retain audit-only / C. Make canonical for DRE / D. Reclassify as distinct mechanism | R4 | No current computational impact (audit-only, unread) | Finance + technical-architecture joint decision | Finance + Technical Architect | B. Retain audit-only, now single-sourced from the same canonical v10 schedule (no independent value authority) | 2026-07-27 | Phase V10-F1B, project owner (Luciana Polonen) |
| D-R5 | `desconto_metodo` validity | Re-verify in governing workbook / retain current 2.8243% pending re-verification | R5 | Unquantified — no independent workbook row re-read exists yet | Direct XML/OOXML row read in the Finance-designated governing workbook | Finance | | | |
| D-R6 | Base tuition source | Approve current screenshot-transcribed table / provide signed XLSX replacement | R6 | Systemic ~2.7–3.3% gap vs. v9 on 3 of 5 scenarios | Signed Finance spreadsheet, dated | Finance | | | |
| D-R7 | `reajuste_despesas` annual series | Apply v9-derived 4.64% (2028 only, no series) / apply v10-derived 5.0%/4.9% (2028/2029+, no series) / provide full signed annual series | R7 | Not quantified — no annual series exists to model against | Signed annual index table, 2028–2047, with named index source | Finance | | | |
| D-R8 | G4 Base 2028 PK3 enrollment | 28 (application/captação) / 29 (financial workbook v9, superseded) | R8 | Historical only — R$91,390 (2028) to R$1.32M cumulative (2028–2037, illustrative) gross, not an active alternative | Finance confirmation of which Finance-provided document is authoritative for PK3 2028 | Project Owner | application_258 (28 PK3, 258 total) | 2026-07-27 | Project-owner decision confirming G4 Base 2028 enrollment of 258 and PK3 enrollment of 28 |

`Selected option`, `Approval date`, and `Approval reference` are intentionally left blank.

---

## Validation

- Every quantitative claim above cites a file, cell/row, or formula.
- No source is called "authoritative" — all are labeled by evidence class (application
  runtime / workbook direct-read / back-derived / verbal / superseded) without a selection
  being made.
- The 258-vs-259 percentage is corrected to 0.39% (1/258), with an explicit statement that no
  approved materiality threshold exists to justify "negligible."
- No application code, validator, or `IMPLEMENTATION.md` entry was modified.
- No assumption was silently selected — the Decision Form's `Selected option` column is blank
  throughout.
- `git diff --check` confirmed clean before and after packet creation (no repository file
  other than this packet and its companion JSON was touched).
