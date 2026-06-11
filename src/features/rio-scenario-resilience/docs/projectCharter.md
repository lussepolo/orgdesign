# Rio Scenario Resilience — Project Charter & Phase-Gate Protocol

This document is **required reading** before any substantial work in
`src/features/rio-scenario-resilience/` (model, components, docs, or the DRE
Scenario Simulator surfaced at `src/components/sections/DreScenarioSimulatorTab.tsx`).
It exists because recent phase reports stopped ending with explicit questions
for Luciana, which let implementation advance from one phase to the next
without human ratification of assumptions, scope, sequencing, or priority.
This charter and its phase-gate protocol are the fix.

## 1. Project name

**Rio Scenario Resilience — DRE Scenario Simulator** (one project, two layers:
the DRE operating layer, currently implemented through Phase 14B/14B.1, and
the future capital-decision layer, Phase 15+).

## 2. Product purpose

The simulator generates **DRE (Demonstração do Resultado do Exercício)
scenarios from combinations of decision levers** — opening grades, occupancy,
tuition architecture, and org design structure — using the existing,
validated calculation engines (`dreEngine.ts`, `fopagEngine.ts`,
`receitaEngine.ts`, etc.). It exists to let leadership compare the operating
(P&L/EBITDA) consequences of different structural choices without
re-deriving formulas, and, in a later phase, to extend that comparison into
capital-decision (investment feasibility) terms.

## 3. Intended users

- Luciana and other Rio leadership/finance reviewers, evaluating scenario
  trade-offs and approving phase results.
- Engineering (Claude Code), implementing and auditing the simulator under
  this charter's governance boundaries.
- Future board-facing reviewers of XLSX export artifacts (Phase 14B+),
  once those artifacts pass QA.

## 4. Current scope (as of Phase 14B.1)

- DRE Scenario Simulator UI (`DreScenarioSimulatorTab.tsx`): four
  decision-lever selections (`openingPackageId`, `occupancyScenarioId`,
  `tuitionScenarioId`, `orgDesignOptionId`), summary cards, annual table,
  EBITDA chart, org design panel, org design sensitivity panel.
- Deterministic orchestration (`useDreScenarioSimulator.ts`, Phase 14A.1):
  `calculateDre()` is the single source of truth; FOPAG/DRE payroll
  reconciliation (`payrollReconciliation`, tolerance `1e-6`).
- Org Design Sensitivity: 2047 EBITDA/payroll comparison across the three
  org-design options (Minimum / Balanced / Premium Experience), holding
  opening/occupancy/tuition fixed.
- XLSX export (`dreScenarioWorkbook.ts`, `DreExportButton.tsx`, Phase 14B):
  13-tab audit workbook of the current DRE scenario. Implemented;
  **interactive browser/export QA (Phase 14B-QA) is still pending** per
  `IMPLEMENTATION.md`.

## 5. Out-of-scope items by layer

### DRE operating layer (current)
- Full 108-combination (opening × occupancy × tuition × org-design) export
  matrix — deferred to Phase 14C or later, not automatic.
- Any new decision levers beyond the four already wired.

### Capital-decision layer (future, Phase 15+) — not yet started
- Cash-flow bridge
- CAPEX bridge
- DCF
- NPV / VPL
- Payback
- Discounted payback
- Investment break-even / break-even investment recovery
- Tier rules and scoring

None of the capital-decision items above may be implemented before **Phase
15A: capital decision metrics source audit and architecture** is completed
and ratified.

## 6. Decision-lever architecture

Decision levers are structural inputs only (per
`src/features/rio-scenario-resilience/AGENTS.md`). The four levers wired into
the DRE Scenario Simulator are:

| Lever | Type | Source |
|---|---|---|
| Opening package (grades) | `OpeningPackageId` | `openingPackageOccupancySourceDataContract.ts` |
| Occupancy scenario | `OccupancyScenarioId` | `openingPackageOccupancySourceDataContract.ts` |
| Tuition scenario | `TuitionScenarioId` | `revenueInputs.ts` |
| Org design option | `DreWorkingScenarioOrgDesignOptionId` | `dreWorkingScenarioContract.ts` (`minimum_experience` / `balanced_experience` / `premium_experience`) |

The broader `ScenarioDecisionLeverId` catalog
(`scenarioDecisionLeverContract.ts`) also includes
`ms_hs_progression_model`, `service_contracts`, and `capex` — these are
tracked in `inputReadinessRegistry.ts` but are **not yet wired** into the DRE
Scenario Simulator's four-lever selection state.

## 7. DRE operating layer

The DRE layer (`dreEngine.ts`, fed by `fopagEngine.ts` and
`receitaEngine.ts`) is an **operating scenario simulator**: it produces
P&L line items (revenue, cost lines, payroll/FOPAG, EBITDA, % EBITDA) for
each projection year 2028–2047, for a given lever combination.
`CALCULATION_CAN_BEGIN` in `inputReadinessRegistry.ts` remains `false` —
this layer is a technical-validation fixture (Phase 13F
`WORKING_SCENARIO_SELECTIONS`, `WORKING_SCENARIO_RATIFICATION_STATUS:
"technical_validation_fixture"`), not a board-ratified plan.

## 8. Future capital-decision layer

Phase 15 (15A–15G) will add an investment-feasibility layer **on top of**
the DRE operating layer's outputs: cash-flow bridge, CAPEX bridge, DCF,
NPV/VPL, payback, discounted payback, investment recovery, and Tier rules,
followed by UI integration (15F) and an extended XLSX export (15G). Phase
15A (source audit and architecture) must precede any of 15B–15G.

## 9. Naming rules (binding)

- **DRE layer** = operating scenario simulator. Its outputs are P&L /
  operating results.
- **Phase 15 layer** = capital decision / investment feasibility metrics.
- DRE-only outputs **must not** be called "investment outputs."
- The first year a scenario's DRE EBITDA is positive (`ebitdaPositiveYear`
  / "EBITDA-Positive Year (DRE EBITDA > 0)") **must not** be called
  "investment break-even" — that is a distinct Phase 15 capital-decision
  concept (break-even investment recovery) and has not been computed.
- Tuition scenarios represent pricing **architecture**, not low/base/high
  pricing tiers (per feature `AGENTS.md`).

## 10. Source-of-truth rules

- Existing app sources must be reused before new logic is created
  (`sourceOfTruthMap.md`); no duplication of payroll, revenue, OPEX, CAPEX,
  or staffing formulas.
- Receita is **not** a fixed existing-app output — it is generated by the
  simulator from the selected lever combination
  (`dreEnrollmentCapacityLeverContract.ts`).
- Org design role/cost/benefit assumptions trace to
  `src/constants/leadership.ts` (`LEADERSHIP_CONFIG`, `BACKOFFICE_CONFIG`,
  `SPECIALISTS_CONFIG`) via `orgDesignPayrollActivation.ts`.
- Missing data must be represented explicitly as missing, not inferred.

## 11. Workbook learner-count rule

The DRE Scenario Simulator and its XLSX export **must not use the Finance
PnL workbook's learner-count trajectory** (`PNL_FORMULA_PARITY_SOURCE_DATA`
row 221 `numero_de_alunos`, ~257 learners in 2028) **as a scenario target or
calibration target**. Learner counts consumed by the DRE engine and shown in
any export are produced exclusively by `openingPackageId × occupancyScenarioId`
via `COMBINED_ENROLLMENT_RECORDS`, and exported values must be read directly
from `dreOutput.byYear[year].numero_de_alunos` (engine output), never
independently computed or sourced from the Finance workbook.

## 12. Org design rule

Org Design Structure must map to the **Executive Org Design** role/position
structures (`executiveOrgDesignModel.ts`, `orgDesignLogic.md`) and to
payroll/FOPAG via `orgDesignPayrollActivation.ts`. Org Design Structure may be
displayed structurally, but must not affect FOPAG, EBITDA, VPL, payback, or
margin until role-cost assumptions are validated (per feature `AGENTS.md`) —
in the current implementation, role-cost assumptions for the three org-design
options (`ORG_DESIGN_PAYROLL_ACTIVATION.records`, 39 records: 26
`baseline_role` + 13 extension/incremental) **are** validated and wired into
`calculateFopag()`/`calculateDre()`, so this gate is satisfied for the four
levers currently implemented.

## 13. Payroll/FOPAG rule

`calculateDre()` calls `calculateFopag()` internally and is the single
source of truth for DRE payroll rows (`fopag_direto_clt_pj`,
`folha_de_pagamento`, `beneficios`). Any standalone `calculateFopag()` call
(e.g. for the Org Design panel's raw FOPAG trace) is a **reconciled trace,
not a parallel source of truth** — it must be checked against the DRE
payroll rows via `payrollReconciliation` (tolerance `1e-6`), and any
reconciliation failure must block dependent UI/export rather than show
conflicting values.

## 14. XLSX export rule

The XLSX export (`dreScenarioWorkbook.ts`) is an **audit artifact**, not
merely a visual export: formula-derived DRE rows must be real Excel formulas
(see "Formula Audit" tab), engine-derived rows must be exported as values
(not fake formulas), FOPAG/DRE reconciliation must be shown and must read
`OK` for export to proceed, and the workbook must not introduce any
capital-decision terms (cash-flow, CAPEX, DCF, NPV/VPL, payback, discounted
payback, investment break-even, Tier) ahead of Phase 15. Export must be
blocked if `payrollReconciliation.isReconciled` is `false`
(`DreExportButton.tsx`).

## 15. Phase sequencing rule

Phases proceed in the order recorded in `IMPLEMENTATION.md`'s "Corrected
roadmap" (14B-QA → 14B-UI-VISUAL → 15A → 15B → ... → 15G), with Phase 14C (full
108-combination export) deferred unless explicitly prioritized by Luciana.
**No phase may be presented as automatically next.** Claude Code may
recommend a next phase but must obtain Luciana's confirmation — via the
mandatory phase-gate questions below — before beginning it.

## 16. Mandatory phase-gate protocol

Every future phase report for this feature folder (and the DRE Scenario
Simulator) must end with a section titled exactly:

```
Questions for Luciana before proceeding:
```

That section must include, at minimum:

1. Do you approve this phase result as complete?
2. Did any assumption, label, formula, data source, or scope boundary look
   wrong?
3. Should the next recommended phase proceed, or should a different
   priority come first?
4. Are there any business/Finance/board decisions that must be ratified
   before engineering continues?
5. Should this work remain unstaged, or should a separate commit plan be
   prepared?

Claude Code must wait for Luciana's response to these questions before
starting the next phase — recommending a next phase is allowed; beginning
it without confirmation is not.
