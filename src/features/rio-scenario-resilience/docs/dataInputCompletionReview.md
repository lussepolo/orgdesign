# Rio Scenario Resilience Data Input Completion Review

This document reviews the data inputs required before Scenario Resilience
calculations can begin. It is documentation only. It does not implement
formulas, adapters, calculation functions, UI wiring, or assumptions.

## 1) Review Scope

The review uses the Scenario Resilience data definitions:

- `src/features/rio-scenario-resilience/data/openingGrades.ts`
- `src/features/rio-scenario-resilience/data/orgDesignStructure.ts`
- `src/features/rio-scenario-resilience/data/tuitionArchitecture.ts`
- `src/features/rio-scenario-resilience/data/dataStatus.ts`
- `src/features/rio-scenario-resilience/data/sourceOfTruthMap.ts`

It also uses the normalized model contracts:

- `src/features/rio-scenario-resilience/model/revenueInputs.ts`
- `src/features/rio-scenario-resilience/model/payrollAdapterContract.ts`
- `src/features/rio-scenario-resilience/model/opexCapexAdapterContract.ts`
- `src/features/rio-scenario-resilience/model/scenarioCalculationBoundaryContract.ts`

The following existing app sources were inspected as references only:

- `src/constants/leadership.ts`
- `src/constants/teaching.ts`
- `src/lib/payroll/core.ts`
- `src/lib/payroll/domain.ts`
- `src/lib/viability/baseline.ts`
- `src/lib/viability/types.ts`

Existing app values and formulas are not automatically Scenario Resilience
inputs. They require deliberate mapping or validation before use.

## 2) Status Vocabulary

- **Confirmed**: the structure is explicit enough to support a later mapping or
  calculation contract.
- **Structural only**: options or schemas exist, but financial or schedule
  values are not complete.
- **Needs mapping**: an existing app source exists, but it cannot be used
  directly as simulator truth.
- **Blocked**: a required value, rule, formula, or interpretation layer is
  missing and downstream output must remain unavailable.

Confirmed structure does not mean calculation-ready data.

## 3) Confirmed Inputs

### Opening Grade Options

`data/openingGrades.ts` defines four confirmed opening packages:

- `t1_g3`
- `t1_g4`
- `t1_g5`
- `t1_g6`

Each package explicitly carries:

- construction year `2027`
- opening year `2028`
- included grades
- whether Middle School is activated in year one

These options are confirmed decision-lever structures. A future mapping layer
is still required to translate a selected option into normalized active grades,
sections, and enrollment schedules.

### Grade-To-Division Mapping

`model/revenueInputs.ts` defines the normalized `GradeId` union and
`GRADE_DIVISION_MAP`. Every normalized grade from `t1` through `g12`, including
`kindergarten`, is assigned to `ey`, `ls`, `ms`, or `hs`.

This mapping is confirmed for the simulator model. A future adapter must still
normalize legacy app grade keys such as `k` and the split toddler rows used by
the existing payroll domain.

### Tuition Architecture Options

`data/tuitionArchitecture.ts` defines three confirmed pricing structures:

- `bp1_division_differentiated`
- `bp2_ey_ls_unified`
- `bp3_ey_to_ms_unified`

The band architecture is confirmed. Actual tuition values, discount
assumptions, and annual tuition adjustment assumptions are not confirmed.

### Org-Design Structure Options

`data/orgDesignStructure.ts` defines three requested structural option shells:

- `minimum_experience`
- `balanced_experience`
- `premium_experience`

Each option identifies the baseline role set, but role activation remains
blocked because the Scenario Offer tab currently stores role semantics as
narrative UI strings. Compensation aliases are recorded separately as
display-role-to-compensation-role references and do not introduce new salary
values. `financialStatus` remains `blocked_until_role_costs_validated`.

### Output IDs And Blocked Semantics

`model/scenarioCalculationBoundaryContract.ts` confirms the output vocabulary:

- `receita`
- `fopagFolhaDireta`
- `fopagReceitaRatio`
- `opex`
- `capex`
- `ebitda`
- `ebitdaMargin`
- `freeCashFlow`
- `cumulativeCashFlow`
- `discountedCashFlow`
- `vplNpv`
- `simplePayback`
- `discountedPayback`
- `scenarioTier`
- `sensitivityResilienceSignals`

The same contract confirms that unavailable outputs use blocked statuses and
`null`. `null` means unavailable or blocked, not zero.

## 4) Structurally Defined But Missing Values

The schemas exist for the following inputs, but values are not complete:

| Input | Current structure | Missing values or validation |
|---|---|---|
| Enrollment by year and grade | `EnrollmentByYearAndGrade` | Normalized enrollment schedule for every required year and grade |
| Tuition by scenario and grade | `TuitionByScenarioAndGrade` | Validated tuition values for each architecture and grade |
| Discount assumptions | `DiscountAssumptions` | Global, division, or grade discount values and validation status |
| Annual tuition adjustment assumptions | `AnnualTuitionAdjustmentAssumptions` | Global or annual adjustment values and validation status |
| Total enrollment by year | `TotalEnrollmentByYear` | Normalized annual totals derived only after an approved enrollment input exists |
| Validated OPEX inputs | `ValidatedOpexInputs` | Item records with validated category, behavior, activation, escalation, and cost or driver |
| Validated service-contract inputs | `ValidatedServiceContractInputs` | Selected option mapping and validated item economics |
| Validated CAPEX schedule inputs | `ValidatedCapexScheduleInputs` | Item amount, schedule, recurrence, contingency, and source ownership |
| Discount rate for VPL | `OpexCapexAdapterInput.discountRateForVpl` | Validated pass-through rate for the later cash-flow layer |
| Validated role-cost map | `ValidatedRoleCostMap` | Approved mappings for existing roles and every org-design extension role |

`data/dataStatus.ts` reinforces the gaps: occupancy is pending structured
import, tuition values are pending, service contracts are missing, CAPEX is
missing, and the role-cost library still requires mapping.

## 5) Needs Mapping

### Existing Payroll Role-Cost Data

`src/constants/leadership.ts` contains existing leadership, backoffice, and
specialist role records with salary, charges, benefits, allocation model,
activation year, and headcount progression.

`src/lib/payroll/core.ts` contains the reusable payroll role shape and
calculation utilities. These sources should be mapped into
`ValidatedRoleCostMap`; they must not be copied into a second payroll model.

### Teaching Compensation Data

`src/constants/teaching.ts` contains educator levels plus learning-assistant and
learning-monitor compensation components. These are existing app sources, not
automatically validated simulator inputs. The future payroll adapter must map
only approved compensation records.

### Staffing Rules

`src/constants/teaching.ts`, `src/lib/payroll/domain.ts`, and the source-of-truth
map identify existing grade activation, section, student, teaching-lead,
support-staff, and high-school staffing patterns.

These rules require normalization before use. In particular, legacy grade keys,
occupancy paths, fixed schedules, headcount rules, and FTE conversion rules
must be mapped explicitly. Display-layer staffing ratios must not become model
truth without validation.

### Existing OPEX Structures

`src/lib/viability/baseline.ts` contains fixed and variable OPEX assembly
patterns. The structure may inform later mapping, but the current base values
and cost-scenario factors must not become simulator truth.

### Existing CAPEX Structures

`src/lib/viability/baseline.ts` and `src/lib/viability/types.ts` contain
single-total, structured, recurring, and category-based CAPEX patterns. These
patterns may be reused after assumptions are separated. Existing defaults are
not validated Scenario Resilience CAPEX packages.

### Existing VPL / NPV And Simple Payback Utilities

`src/lib/viability/baseline.ts` contains current VPL / NPV aggregation and
simple-payback utilities. They are extraction candidates only if they accept
normalized inputs and no longer depend on legacy baseline assumptions.

The current app does not confirm a discounted-payback utility.

## 6) Explicitly Blocked Inputs

The following inputs and outputs must remain blocked until validated:

- New org-design roles without approved salary, charges, benefits, activation
  year, allocation category, and FTE or headcount rule.
- Service-contract options without validated category, annual cost or cost
  driver, cost behavior, activation year, escalation rule, and baseline-versus-
  lever classification.
- CAPEX options without validated option mapping, category, amount, schedule,
  recurring classification, contingency rule where applicable, and source
  ownership.
- Occupancy until a normalized structured input and enrollment schedule mapping
  exist.
- Tuition selection until actual tuition values, discounts, and annual
  adjustments are validated.
- Discounted payback until a formula and ownership boundary are explicitly
  defined.
- Scenario tier until evaluation rules exist.
- Sensitivity / resilience signals until real interpretation rules and
  calculation inputs replace directional placeholders.

## 7) Calculation Readiness Matrix

| Output | Required inputs | Current readiness | Blocking reason | Next required artifact |
|---|---|---|---|---|
| Receita | Opening-grade selection, occupancy, enrollment by year and grade, tuition values, discounts, annual tuition adjustments | Blocked | Revenue inputs are incomplete and simulator-owned Receita is not implemented | Complete normalized revenue input map, then create Receita calculation design |
| FOPAG / Folha Direta | Org-design selection, active grades, sections, enrollment context, validated role-cost map, staffing model inputs | Blocked: mapping pending | Payroll adapter is not implemented and org-design role costs are not validated | Complete role-cost and staffing map, then implement payroll adapter mapping |
| FOPAG / Receita | Available Receita and available FOPAG / Folha Direta | Blocked | Both upstream outputs are unavailable | Complete Receita and payroll adapter mapping first |
| OPEX | Validated baseline OPEX items and validated service-contract inputs | Blocked: mapping pending | OPEX values and service-contract economics are not validated | Complete OPEX and service-contract input map, then implement OPEX adapter mapping |
| CAPEX | Selected CAPEX option and validated CAPEX schedule inputs | Blocked: mapping pending | CAPEX package values, schedules, recurrence, and ownership are missing | Complete CAPEX schedule input map, then implement CAPEX adapter mapping |
| EBITDA | Available Receita, payroll, and OPEX | Blocked: not defined | Upstream outputs are unavailable and the EBITDA convention is not confirmed | Complete upstream mappings, then create EBITDA design |
| EBITDA margin | Available EBITDA and Receita | Blocked: not defined | EBITDA and Receita are unavailable | Define EBITDA first, then define margin boundary |
| Free cash flow | Available Receita, payroll, OPEX, CAPEX, and confirmed cash-flow convention | Blocked: not defined | Required operating and investment outputs are unavailable | Create cash-flow design after upstream mappings |
| Cumulative cash flow | Available free cash flow by year | Blocked: not defined | Free cash flow is unavailable | Define cash-flow assembly after upstream mappings |
| Discounted cash flow | Available free cash flow and validated discount rate for VPL | Blocked: not defined | Cash flow and validated pass-through discount rate are unavailable | Complete discount-rate input and later cash-flow design |
| VPL / NPV | Available discounted cash flow | Blocked: mapping pending | Normalized cash flow does not exist; existing utility still requires extraction or mapping | Extract or map generic VPL / NPV utility after cash-flow design |
| Simple payback | Available cumulative cash flow | Blocked: mapping pending | Normalized cash flow does not exist; existing utility still requires extraction or mapping | Extract or map generic simple-payback utility after cash-flow design |
| Discounted payback | Confirmed formula and discounted cash flow | Blocked: not defined | No confirmed discounted-payback utility or formula exists | Confirm requirement and define formula ownership before implementation |
| Scenario tier | Available financial outputs and evaluation rules | Blocked: not defined | No tiering rules or scoring framework exist | Create interpretation-rule design only after calculations exist |
| Sensitivity / resilience signals | Available calculation engine, variable definitions, and interpretation rules | Blocked: not defined | Current viability sensitivity values are directional placeholders, not simulator recomputations | Define interpretation layer after the calculation boundary is implemented |

## 8) Recommended Next Build Sequence

Calculations should not begin until their required inputs are validated.

1. Complete the data input map for revenue, payroll, OPEX, service contracts,
   CAPEX, occupancy, and discount-rate inputs.
2. Create a typed input-readiness registry if the existing readiness contracts
   are not sufficient for input-level auditing.
3. Create the Receita calculation design.
4. Create the Receita calculation contract.
5. Implement Receita only after validated enrollment, tuition, discount, and
   annual-adjustment inputs exist.
6. Implement payroll adapter mapping only after role-cost and staffing mappings
   are validated.
7. Implement OPEX/CAPEX adapter mapping only after OPEX, service-contract, and
   CAPEX inputs are validated.
8. Create EBITDA and cash-flow design only after Receita, payroll, OPEX, and
   CAPEX outputs are available.
9. Map generic VPL / NPV and simple-payback utilities only after normalized
   cash-flow inputs exist.
10. Define discounted payback, scenario tier, and sensitivity / resilience
    interpretation only if their requirements and rules are explicitly
    confirmed.

## 9) Risks

- Calculating Receita from legacy app assumptions would override
  simulator-owned revenue inputs.
- Silently using zero for missing values would make blocked scenarios appear
  complete.
- Using tuition architecture without actual tuition values would create an
  unsupported revenue result.
- Using occupancy without an enrollment schedule would create unsupported
  student counts.
- Treating role labels as role-cost validation would allow unsupported payroll
  impacts.
- Treating CAPEX defaults as validated CAPEX would import legacy viability
  assumptions as simulator truth.
- Treating OPEX defaults as validated OPEX would import legacy viability
  assumptions as simulator truth.
- Implementing scenario tier before evaluation rules exist would turn a future
  interpretation layer into an arbitrary output.

## 10) Conclusion

The Scenario Resilience model contracts are sufficiently defined to continue
data completion work, but calculations must not begin yet. The immediate work
is to validate and map the missing inputs listed above while preserving the
blocked-output semantics already established by the model contracts.
