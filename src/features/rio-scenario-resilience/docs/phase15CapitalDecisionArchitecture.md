# Phase 15 Capital Decision Architecture

Status: governance/architecture document. Phase 15A + Phase 15A.1 + Phase 15A.2
(workbook audit) + Phase 15A.3 (workbook-informed update) consolidated.
No Phase 15 calculations, UI, or exports are implemented by this document.

**Phase 15A.3 update (2026-06-11):** Phase 15A.2 audited the Finance workbook
"Concept Rio - 20 anos - Org BU - Apresentação vBU v8 (2).xlsx" (read-only, not
edited). The workbook already contains a full capital-decision methodology
(FCO bridge, CAPEX, DCF, VPL, TIR, payback, WACC, perpetuity, tax/NOL — see
§8A). This changes the framing of §7/§9/§15 below from "methodology does not
exist" to "methodology exists in the workbook; Finance must confirm which
treatment applies to the simulator's confirmed CAPEX option amounts."
**Luciana has confirmed the simulator CAPEX option amounts are R$90M and
R$100M** — this is unchanged and is not reopened by the workbook audit. Other
CAPEX figures found in the workbook (R$100.7M, R$65.3M/54.3M/44.3M) are
non-canonical for option-amount purposes (see §8A.2).

## 1. Purpose

Phase 15 adds a **capital-decision layer** on top of the Phase 14B operating
layer (DRE / EBITDA). This document defines the boundary between the two
layers so that Phase 15B+ implementation does not blur or re-derive Phase 14
operating logic.

Explicit rules carried forward from Phase 15A / 15A.1:

- DRE EBITDA (as computed by `dreEngine.ts` / `calculateDre()`) remains an
  **operating output**. It is not redefined, recalculated, or renamed by
  Phase 15.
- CAPEX does **not** enter EBITDA. The DRE line-item map (`dreLineItemMap.ts`,
  `capex` row, section `pnl_to_cash`) explicitly excludes CAPEX from the
  EBITDA formula.
- CAPEX appears **after** EBITDA, as a cash-flow outflow (negative
  `capexCashFlowSignedBRL`), in the future cash-flow bridge.
- The "EBITDA-positive year" shown in Phase 14B UI
  (`DreSummaryCards.tsx`, `DreScenarioContextBanner.tsx`,
  `DreEbitdaChart.tsx`) is an **operating** milestone only. It is **not**
  investment payback, discounted payback, or investment recovery.
- No Phase 14 DRE/EBITDA output may be labeled, displayed, or exported as an
  "investment output" (payback, DCF, NPV, Tier, etc.). That labeling is
  reserved for Phase 15 capital-decision-layer outputs only, once approved.

## 2. Current committed baseline

| Phase | Commit | Message |
|---|---|---|
| 14B | `30e5570` | Complete Phase 14B DRE simulator UI and export QA |
| 14C | `5ceb392` | Quarantine orphaned Rio scaffold from TypeScript checks |
| 14D | `b836a66` | Document Phase 14D audit and cleanup decisions |
| 14E | `c06003b` | Mark baseline OPEX as missing validated input |

Phase 14B checkpoint summary:

- Browser export: **PASS**.
- Programmatic XLSX parse: **PASS**.
- Manual spreadsheet-application opening: **waived** for the Phase 14B
  checkpoint.
- Phase 15 implementation: **not started**. All Phase 15 model/component
  files currently in the working tree are untracked candidates (see §10),
  not part of the committed baseline above.

## 3. Architecture boundary

### Operating layer (Phase 14, committed)

- Enrollment (Receita engine grain records, opening-package occupancy data)
- Tuition / Receita (`receitaEngine.ts`, `RECEITA_PROJECTION_YEARS`)
- FOPAG / payroll (`fopagEngine.ts`, `payrollAdapter.ts`)
- DRE cost lines (`dreLineItemMap.ts`, `DRE_ANNUAL_ASSUMPTION_SOURCE_DATA`,
  `dreEngine.ts`)
- EBITDA (`DreYearResult.ebitda`)
- EBITDA margin (`DreYearResult.percentual_ebitda`)
- Contribution margin (`DreYearResult.margem_de_contribuicao`)

### Capital-decision layer (Phase 15, not yet implemented)

- CAPEX exposure
- Cash flow after CAPEX
- Accumulated cash flow
- DCF (annual)
- DCF (accumulated)
- NPV / VPL
- Simple payback
- Discounted payback
- Investment recovery
- Tier / board-governance interpretation

The operating layer is **read by** the capital-decision layer (e.g., EBITDA
by year as a candidate cash-flow input), but the capital-decision layer must
not write back into, or alter, operating-layer calculations.

## 4. Output taxonomy

The approved conceptual taxonomy splits scenario outputs into three groups:

- **OperatingOutputResults** — Phase 14 operating-layer outputs (Receita,
  FOPAG, DRE cost lines, EBITDA, EBITDA margin, contribution margin).
- **InvestmentOutputResults** — Phase 15 capital-decision outputs (CAPEX
  exposure, cash flow after CAPEX, accumulated cash flow, DCF, accumulated
  DCF, NPV/VPL, payback, discounted payback, investment recovery).
- **InterpretationOutputResults** — board-facing interpretation/governance
  outputs (Tier, threshold evaluations).

`scenarioCalculationBoundaryContract.ts` (untracked, see §10) is a useful
**conceptual basis** for this taxonomy — specifically the output-ID structure
and the three-way split above. However, per Phase 15A.1, its
readiness/blocking values (e.g., marking Receita, FOPAG, or DRE EBITDA as
`blocked_not_implemented`) are **stale and must not be adopted as-is**. The
committed Phase 14B layer already implements and ships Receita, FOPAG, and
DRE EBITDA outputs.

## 5. Service Contracts verification (Phase 15A.1, accepted)

- Service Contracts are represented in the committed `dreLineItemMap.ts` as a
  governance/category tag (`serviceContractsCategory: true`,
  `costLineCategory: "service_contract"`) on exactly the eight approved DRE
  fixed-cost rows.
- The committed `dreEngine.ts` sources all eight rows' annual values through
  `DRE_ANNUAL_ASSUMPTION_SOURCE_DATA` (`assumption()`), i.e. as ordinary DRE
  fixed-cost / `independent_finance_assumption` rows.
- `serviceContractsEngine.ts` is **not imported** into `dreEngine.ts`. Service
  Contracts are not a separate calculation layer in the committed code.
- **No current arithmetic double-counting risk.**
- Two rows still require a Finance/DRE row-mapping documentation pass before
  Phase 15B:
  - Tecnologia / Telefone / Internet / Licenças e Serviços de Informação
  - Energia Elétrica / Água e Esgoto

This is a **documentation/reconciliation task**, not an arithmetic blocker for
current DRE outputs.

## 6. Projection horizon verification (Phase 15A.1, accepted)

| Layer | Horizon |
|---|---|
| Receita (`receitaEngine.ts`, `RECEITA_PROJECTION_YEARS`) | 2028–2047 |
| FOPAG (`fopagEngine.ts`, `payrollAdapter.ts`) | 2028–2047 |
| DRE (`dreEngine.ts`, `DreEngineOutput.byYear`) | 2028–2047 |
| UI / XLSX export (`DreAnnualTable.tsx`, `DreEbitdaChart.tsx`, `dreScenarioWorkbook.ts`) | 2028–2047 |

- 2028–2037 are Finance-validated direct workbook years.
- 2038–2047 are **calculated** using mature-state carry-forward inputs
  (`matureStateCarryForwardSourceData.ts`, Phase 11B,
  `derivationMethod: "mature_state_carry_forward_from_2037"`,
  `isCarryForwardYear: false` — i.e. usable values, not blank placeholders).

The operating layer is structurally compatible with a 2047 CAPEX bridge, but
the **mature-state carry-forward rule must remain explicit** in any Phase 15
documentation that relies on 2038–2047 operating values (Receita, FOPAG,
EBITDA).

## 7. Operating cash-flow definition

- `DreEngineOutput.byYear[year].ebitda` exists for every year 2028–2047 and is
  the **only clean committed candidate** for an operating-cash-flow proxy.
- EBITDA is **not automatically cash flow**.
- Finance must confirm whether EBITDA is acceptable as the
  operating-cash-flow proxy for Phase 15.
- If not, Finance must define the required adjustments — e.g. tax, working
  capital, depreciation/amortization, or other below-EBITDA items
  (`ebit`, `depreciacao_amortizacao`, `receita_despesa_financeira`,
  `ir_csll`, `recuperacao_de_prejuizos` — all currently
  `requires_finance_source_confirmation` / `not_implemented` in
  `dreLineItemMap.ts`).
- **Phase 15A.2 update:** the Finance workbook already implements a full
  below-EBITDA bridge for all of these items (see §8A.1, §8A.3). The question
  is no longer whether these adjustments *can* be defined, but whether
  Finance wants the simulator to use the workbook's existing bridge
  (EBIT → tax/NOL → Lucro Líquido → FCO) or a simplified EBITDA-only proxy
  (§15.C).

## 8. CAPEX source architecture

- CAPEX totals of 90M / 100M BRL are treated as **Finance-confirmed**, based
  on reviewed Phase 15A evidence.
- The **annual CAPEX schedule distribution** still requires confirmation
  unless Finance has explicitly approved the distribution methodology — total
  approval is not the same as annual-schedule approval.
- CAPEX cash-flow values must be represented as **negative outflows**
  (consistent with `capexEngine.ts`'s `annualScheduleSignedBRL` /
  `projectionYearCapexCashFlowSignedBRL` sign convention, per Phase 15A.1).
- CAPEX must remain **excluded from EBITDA** (§1, §3).

## 8A. Workbook capital-decision audit findings (Phase 15A.2)

Source workbook audited (read-only, not modified):
`/Users/lucianapolonen/Downloads/Concept Rio - 20 anos - Org BU - Apresentação
vBU v8 (2).xlsx`. Sheets inspected in depth: `PnL` (live model), `CAPEX`,
`Resumo Cenários CAPEX`, `Otimista - PnL - CAPEX 72mm` (sample orphaned
scenario tab), `Recuperação de Prejuízos`, plus a workbook-wide search of
`sharedStrings` for VPL/TIR/WACC/payback/perpetuidade/capital de giro/tier.

### 8A.1 Methodology already present in the workbook

The live `PnL` sheet already implements a complete EBITDA-to-viability bridge.
None of the following are absent — they exist as working formulas in the
live `PnL` sheet (rows 273–308, plus the perpetuity block Y277–Z283 and the
"Viabilidade Financeira" summary Z288–Z290):

- **EBITDA** (row 273) — formula `=SUM(Margem de Contribuição, Total Custos e
  Despesas Fixas, Total Despesas com Vendas)`, which **matches the formula
  already implemented in `dreEngine.ts`** (`formulaVariant3`).
- **Depreciação/Amortização** (row 275) — sourced from a separate `PPE`
  fixed-asset sheet.
- **EBIT** (row 276) = EBITDA + Depreciação/Amortização.
- **EBT** (row 278) = EBIT + Receita/Despesa Financeira.
- **IR/CSLL at 34%** (row 279) = `IF(EBT<0, 0, -EBT*34%)` on positive EBT.
- **Tax-loss carryforward / Recuperação de Prejuízos** (row 280, plus the
  dedicated `Recuperação de Prejuízos` sheet) — implements the standard
  Brazilian NOL rule (taxable base reduced to 70% of profit when prior losses
  exist).
- **FCO (Fluxo de Caixa Operacional)** (row 290) = Lucro Líquido +
  Depreciação add-back + Despesa Financeira add-back.
- **CAPEX** (row 291) = "Expansão" (phased initial buildout) + "Sustain"
  (recurring, % of ROL).
- **Cash flow after CAPEX** (row 295) = FCO + CAPEX.
- **Accumulated cash flow** (row 296) = running cumulative sum of row 295.
- **Fator de Desconto** (row 308) — cumulative compounding `(1+WACC_t)`
  product across years.
- **DCF anual** (row 305) = (cash flow after CAPEX) / (cumulative discount
  factor).
- **DCF acumulado** (row 306) — running cumulative sum of row 305.
- **WACC** (row 6) — see §8A.4.
- **Perpetuity / terminal value** (Y277–Z283, row 287 column W) — Gordon
  Growth terminal value, included in the DCF/VPL/TIR calculation.
- **VPL** (`Z289`) = `SUM(B305:W305)` (sum of DCF anual including
  perpetuity).
- **TIR** (`Z288`) = `IRR(B295:W295)` (including perpetuity as a final cash
  flow).
- **Payback** (`Z290`) — see §8A.5.

**This methodology is not absent — it exists and is functioning in the live
`PnL` sheet.** The open question for Phase 15B is not "does this methodology
exist," but **which parts of it (phasing, WACC, FCO bridge, tax/NOL, payback
formula, perpetuity assumptions) Finance wants applied to the simulator's
confirmed R$90M and R$100M CAPEX options.**

### 8A.2 CAPEX findings — option amounts vs. workbook reference figures

**Confirmed (Luciana, Phase 15A.3): the simulator's CAPEX option amounts are
R$90M and R$100M.** This is the governing constraint and is not reopened by
the workbook audit below.

The workbook contains several CAPEX figures/schedules. These are useful as
**methodology and treatment references only** — none of them substitutes for,
or competes with, the confirmed R$90M/R$100M option amounts unless Finance
explicitly revalidates them:

- **Live `PnL` sheet**: total CAPEX = R$100M (`AC21 = -100,000,000`, negative
  = outflow), phased **70% / 20% / 10%** across 2027 (pre-ops), 2030, and
  2031 ("Faseamento Capex", row 285), plus a recurring **"Sustain" CAPEX** =
  % of ROL, escalating 2% (2028–2031) → 2.5% (2032–2035) → 3% (2036–2039) →
  3.5% (2040–2043) → 4% (2044–2047).
- **`CAPEX` sheet**: a separate annual line-item schedule for 2027–2047
  (≈R$70M in 2027, then ≈R$1.5M–R$2.2M/yr escalating ~4.6%/yr), totaling
  ≈R$100.7M — a different annual distribution from the live `PnL` sheet's
  phasing, despite a similar total.
- **`Resumo Cenários CAPEX` / orphaned scenario tabs** ("Otimista/Pessimista -
  PnL - CAPEX 72mm/61mm/51mm"): scenario CAPEX totals of **R$65.3M / R$54.3M /
  R$44.3M**. These tabs contain `#REF!`/`#VALUE!` errors from row ~82 onward
  and use a different WACC (14.53%) than the live `PnL` sheet — they are
  candidates for "stale/superseded," pending Finance confirmation (§15.A).

**Interpretation:** the R$100.7M, R$65.3M, R$54.3M, and R$44.3M figures are
**non-canonical for option-amount purposes**. The live `PnL` sheet's R$100M
total and its 70/20/10 phasing + Sustain-CAPEX mechanism are the most direct
methodology reference for the confirmed R$100M option, but Finance must still
confirm whether/how that phasing and the Sustain mechanism should be applied
to **both** the R$90M and R$100M simulator options (§15.B).

### 8A.3 FCO / operating cash-flow bridge

The live `PnL` sheet's FCO bridge (EBITDA → Depreciação → EBIT → Receita/
Despesa Financeira → EBT → IR/CSLL (34% + NOL) → Lucro Líquido → +
Depreciação/Despesa Financeira add-backs → FCO) is fully implemented and
working. This directly informs §7's open question ("is EBITDA an acceptable
operating-cash-flow proxy, or are tax/depreciation/NOL adjustments
required?") — the workbook's answer is that **a full below-EBITDA bridge,
including 34% tax with NOL carryforward and depreciation add-back, is already
modeled**, as an alternative to a simplified EBITDA-only proxy. Finance must
confirm which approach the simulator should use (§15.C).

Currently, financing (Captações/Cap1–Cap8, Receita/Despesa Financeira,
Liquidação de Principal) evaluates to **0** throughout the live model — no
debt financing is active.

### 8A.4 WACC / discount rate findings

- Live `PnL` sheet: **WACC = 12% for 2028–2047**, with a one-off **13.25%**
  for the pre-ops/2027 column (`B6 = B5+2%`).
- Perpetuity WACC = 12% (same as the 2047 steady-state value).
- Perpetuity growth rate `g` = **3.5%** (hardcoded, `Z279`).
- The orphaned "Otimista/Pessimista - PnL - CAPEX 72mm/61mm/51mm" scenario
  tabs use **WACC = 14.53%** and contain formula errors — inconsistent with
  the live `PnL` sheet.

Finance must confirm which WACC (12%, 13.25%, 14.53%, or another value) and
which DCF timing convention (year-end vs. mid-year vs. the workbook's current
cumulative-compounding convention) is canonical for Phase 15 (§15.D).

### 8A.5 Payback findings

- The workbook has **one** "Payback" metric (`Z290`), not separate simple and
  discounted payback metrics.
- It is built on row 307, which derives from **discounted** cumulative cash
  flow (row 306, DCF acumulado) — i.e., it is effectively a **discounted
  payback**, labeled simply "Payback."
- Formula: `IF(VPL<0,"NA", IF(SUM(B307:V307)+1>=20,"20+", SUM(B307:V307)+1))`.
- In the live model, this currently evaluates to **"20+"** (payback not
  reached within the 20-year horizon) **despite a positive VPL** (≈R$20.3M),
  because the positive VPL is driven by the discounted perpetuity/terminal
  value rather than within-horizon cash flows.

Finance must confirm whether this formula and its "20+"/"NA" treatment are
accepted as-is, whether a separate simple (undiscounted) payback is also
required, and how "recuperação do investimento" should be defined for the
simulator (§15.E).

### 8A.6 Tax / NOL findings

The workbook applies a flat **34%** combined IRPJ/CSLL rate to positive EBT,
with full Brazilian NOL carryforward modeling (`Recuperação de Prejuízos`
sheet — 70% taxable-base cap when prior losses exist; the loss balance is
fully exhausted by 2039 in the live model). Finance must confirm whether this
treatment should be carried into the simulator (§15.F).

### 8A.7 Working capital / Tier findings

- **Working capital ("Capital de Giro")**: not found anywhere in the
  workbook (zero matches across all sheets and shared strings).
- **Tier / board threshold logic**: not found in the workbook. The only
  string matches for "Tier"-like terms were unrelated person names — there is
  no existing Tier/threshold governance concept to inherit.

Finance/Board must confirm whether working capital is intentionally out of
scope, and Tier rules must be defined fresh if Phase 15E proceeds (§15.F,
§15.G).

## 9. Missing approvals before Phase 15B

**Phase 15A.2/15A.3 reframe:** the blocker below is **not** "no
capital-decision methodology exists." The Finance workbook already contains
a working CAPEX phasing/Sustain mechanism, FCO bridge, tax/NOL treatment,
WACC, DCF/VPL/TIR, perpetuity, and payback formula (§8A). **The blocker is
that Finance must confirm which of these methodologies, phasing approaches,
WACC values, FCO bridge designs, and payback treatments should be applied to
the simulator's confirmed R$90M and R$100M CAPEX options** — not whether such
methodologies exist at all.

**Before any cash-flow bridge implementation:**

- Which CAPEX phasing/treatment (live `PnL` 70/20/10 + Sustain, `CAPEX` sheet
  schedule, or another) applies to the R$90M and R$100M options
- Whether the workbook's FCO bridge (EBIT → tax/NOL → Lucro Líquido → FCO) or
  a simplified EBITDA-only proxy is used as the operating-cash-flow basis

**Before DCF / NPV / VPL:**

- Which WACC (12%, 13.25%, 14.53%, or other) and DCF timing convention is
  canonical
- Whether perpetuity/terminal value (12% WACC, 3.5% growth) is included in
  VPL and TIR

**Before payback / discounted payback:**

- Whether the workbook's existing (discounted) payback formula and "20+"/
  "NA" treatment are reused, and whether a separate simple payback is also
  required
- Investment recovery ("recuperação do investimento") definition

**Before Tier:**

- Board threshold rules (none exist in the workbook — must be defined fresh)
- Scenario-tier governance logic

**If in scope for Phase 15:**

- Recurring / post-opening CAPEX assumptions (the workbook's "Sustain" %ROL
  mechanism is a candidate, see §8A.2)
- Tax assumptions (the workbook's 34% + NOL treatment is a candidate, see
  §8A.6)
- Working-capital assumptions (not modeled in the workbook, see §8A.7)
- Depreciation treatment (the workbook's `PPE`-sourced depreciation is a
  candidate, see §8A.1, §8A.3)

## 10. Candidate files disposition

All files below are currently **untracked** (Phase 15 candidates), per
`git status --short --untracked-files=all`. They are reference-only and
non-authoritative until reconciled into committed Phase 15 contracts.

**Use as basis:**

- `governanceThresholdContract.ts`
- `scenarioCalculationBoundaryDesign.md`
- `opexCapexAdapterDesign.md`

**Use but correct before implementation:**

- `scenarioCalculationBoundaryContract.ts`
- `capexCalculationReadinessAudit.md`
- `financeCalculationDesign.md`
- `capexEngine.ts`
- `capexScheduleSourceData.ts`

**Reference / superseded only:**

- `boardResilienceCalculationArchitectureContract.ts`
- `boardCalculationReadinessContract.ts`
- `calculationReadiness.ts`
- `contracts.ts`
- `financialOutputContract.ts`

Do not delete these yet. They remain reference material until Phase 15
implementation contracts are finalized.

## 11. Stale committed comments / readiness records

The following committed files contain stale readiness/horizon information,
identified in Phase 15A.1, and must **not** be treated as authoritative for
Phase 15 planning:

- `simulatorProjectionHorizonContract.ts` — header comment (Phase 11A) marks
  Receita and FOPAG as "BLOCKED ... stops at 2037." This is stale: Phase 11B
  (committed, same date) extended both to 2028–2047 via the approved
  mature-state carry-forward rule (§6), and this is what Phase 14B actually
  computes and displays.
- `inputReadinessRegistry.ts` — HEAD content is stale and **quarantined**. It
  records `receita_output` as "Direct workbook years 2028–2037 only," and
  marks `payroll_fopag_output` as `blocked` and `ebitda_output` /
  `ebitda_margin_output` as `not_required_yet` / `canUseForCalculation: false`
  — contradicting the committed, working Phase 13A `dreEngine.ts` and Phase
  14B UI, which compute and display EBITDA for 2028–2047 today. The draft at
  `/tmp/inputReadinessRegistry_phase14e_draft.patch` is reference-only and
  requires verification — it is **not** treated as authoritative here.
- `dreEngine.ts` — its header comment ("CALCULATION_CAN_BEGIN remains false
  (inputReadinessRegistry.ts)") inherits the stale gating flag from
  `inputReadinessRegistry.ts` above.

These should be corrected in a later readiness-documentation cleanup phase,
not inside Phase 15A implementation.

## 12. Recommended Phase 15 sequencing

- **Phase 15A** — architecture/source audit and formal document (this
  document).
- **Phase 15A.1** — committed-code verification of Service Contracts and
  operating horizon.
- **Phase 15B** — CAPEX source contract finalization and cash-flow bridge
  design.
- **Phase 15C** — discount-rate ratification and DCF / NPV / VPL formulas.
- **Phase 15D** — payback / discounted payback / investment recovery
  formulas.
- **Phase 15E** — governance thresholds and Tier rules.
- **Phase 15F** — UI integration.
- **Phase 15G** — XLSX export expansion.

## 13. Proposed future contract outline (draft only — not implemented)

Proposed file: `capitalDecisionLayerContract.ts`

Proposed function signatures (types/shape only, no implementation):

- `calculateCashFlowBridge(...)`
- `calculateDcfAndNpv(...)`
- `calculatePaybackMetrics(...)`
- `evaluateScenarioTier(...)`

Proposed result object fields (draft naming, subject to Finance/Phase 15B
confirmation):

- `capexInvestmentPositiveBRL`
- `capexCashFlowSignedBRL`
- `cashFlowAfterCapex`
- `cumulativeCashFlowAfterCapex`
- `dcfAnnual`
- `dcfAccumulated`
- `capexExposureBRL`
- `npv`
- `simplePaybackYears`
- `discountedPaybackYears`
- `scenarioTier`

None of the above are implemented. This section exists to give Phase 15B a
naming starting point, not to commit to field names or formulas.

## 14. Explicit non-goals (of this document and current phase)

- No Phase 15 calculations are implemented yet.
- No Phase 15 UI is implemented yet.
- No Phase 15 workbook export is implemented yet.
- No CAPEX values may enter EBITDA.
- No DRE-only metric (e.g. "EBITDA-positive year") may be labeled as payback
  or investment recovery.

## 15. Finance questions (Phase 15A.3, workbook-informed)

The simulator's CAPEX option amounts (R$90M and R$100M) are already
confirmed and are **not** part of these questions. These questions ask which
existing workbook methodology/treatment should be applied to those two
confirmed amounts — not whether the underlying formulas exist (they do, see
§8A).

### A. Canonical workbook methodology

1. Which workbook block should be used as the methodology reference for
   Phase 15: the live `PnL` sheet, the `CAPEX` sheet, `Resumo Cenários
   CAPEX`, or another tab?
2. Are the orphaned "Otimista/Pessimista - PnL - CAPEX 72mm/61mm/51mm"
   scenario sheets stale/superseded, given their formula errors and
   inconsistent WACC (14.53%)?

### B. CAPEX treatment for the R$90M/R$100M simulator options

3. Should the live `PnL` sheet's phasing logic (70% / 20% / 10% across
   2027/2030/2031) be applied to the R$90M and R$100M options?
4. Should the live `PnL` sheet's "Sustain" CAPEX mechanism (% of ROL,
   escalating 2%→4%) be included?
5. Should the `CAPEX` sheet's separate annual schedule be ignored, adapted,
   or used only as a phasing reference?
6. Should any recurring/post-opening CAPEX be included beyond the Sustain
   mechanism?

### C. FCO / operating cash flow

7. Should the workbook's FCO bridge (EBITDA → Depreciação → EBIT → Receita/
   Despesa Financeira → EBT → IR/CSLL → Lucro Líquido → FCO) be ported
   as-is?
8. Should EBITDA be used only as a simplified proxy, or should the
   workbook's EBIT/tax/NOL/depreciation bridge be used?
9. Should the simulator include depreciation/amortization add-back,
   financial-expense add-back, tax, and NOL logic?

### D. WACC / DCF / VPL / TIR

10. Should Phase 15 use 12%, 13.25%, 14.53%, or another WACC?
11. Should perpetuity use 12% WACC and 3.5% growth, as in the live `PnL`
    sheet?
12. Should terminal value / perpetuity be included in VPL and TIR?
13. Should the DCF timing convention be year-end, mid-year, or the
    workbook's current cumulative-compounding convention?

### E. Payback

14. Should the workbook's existing payback formula (based on discounted
    cumulative cash flow) be reused?
15. Is the current "20+" output (despite a positive VPL) accepted as-is?
16. Does Finance want both a simple payback and a discounted payback, or
    only one payback metric?
17. How should "recuperação do investimento" be defined for the simulator?

### F. Tax and working capital

18. Should the 34% tax rate and NOL carryforward treatment (as modeled in
    `Recuperação de Prejuízos`) be used?
19. Is working capital intentionally out of scope (it is not modeled in the
    workbook)?

### G. Tier / board interpretation

20. Should Tier rules be created fresh, since no workbook threshold logic was
    found?
21. Which thresholds should classify a scenario as more resilient,
    acceptable with caveats, or not recommended?

**Implementation note:** this is a documentation phase only. No simulator
features, cash-flow calculations, CAPEX bridge calculations, DCF, NPV/VPL,
payback, discounted payback, investment recovery, Tier, or UI cards are
implemented by this document.
