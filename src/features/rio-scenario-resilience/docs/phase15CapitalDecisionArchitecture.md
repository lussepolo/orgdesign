# Phase 15 Capital Decision Architecture

Status: governance/architecture document. Phase 15A + Phase 15A.1 consolidated.
No Phase 15 calculations, UI, or exports are implemented by this document.

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

## 9. Missing approvals before Phase 15B

**Before any cash-flow bridge implementation:**

- CAPEX annual schedule distribution (not just total CAPEX)
- Operating cash-flow definition
- Confirmation of whether EBITDA may be used as the operating-cash-flow proxy

**Before DCF / NPV / VPL:**

- Discount rate
- DCF timing convention (e.g. mid-year vs. year-end discounting)

**Before payback / discounted payback:**

- Payback formula
- Discounted payback formula
- Investment recovery definition

**Before Tier:**

- Board threshold rules
- Scenario-tier governance logic

**If in scope for Phase 15:**

- Recurring / post-opening CAPEX assumptions
- Tax assumptions
- Working-capital assumptions
- Depreciation treatment

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

## 15. Finance questions

1. Are the annual CAPEX schedule distributions approved, or only the total
   90M/100M BRL options?
2. Should EBITDA be used as the operating-cash-flow proxy for Phase 15?
3. If not, what adjustments are required (tax, working capital,
   depreciation/amortization, other)?
4. What discount rate should be used for DCF / NPV / VPL?
5. Should tax, working capital, depreciation, or recurring/post-opening CAPEX
   be included in scope?
6. What payback and discounted-payback formulas should be used?
7. What board thresholds define Tier?

**Implementation note:** this is a documentation phase only. No simulator
features, cash-flow calculations, CAPEX bridge calculations, DCF, NPV/VPL,
payback, discounted payback, investment recovery, Tier, or UI cards are
implemented by this document.
