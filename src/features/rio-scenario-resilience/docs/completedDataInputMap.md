# Rio Scenario Resilience Completed Data Input Map

This document is the input-level audit for the Rio Scenario Resilience
Simulator. It identifies the source, status, ownership boundary, dependency,
and next action for every input required before calculations can begin.

It is documentation only. It does not implement formulas, adapters,
calculation functions, TypeScript contracts, UI wiring, or financial
assumptions.

## 1) Reviewed Sources

This map consolidates the current Scenario Resilience documentation:

- `src/features/rio-scenario-resilience/docs/dataInputCompletionReview.md`
- `src/features/rio-scenario-resilience/docs/sourceOfTruthMap.md`
- `src/features/rio-scenario-resilience/docs/financeCalculationDesign.md`
- `src/features/rio-scenario-resilience/docs/payrollAdapterDesign.md`
- `src/features/rio-scenario-resilience/docs/opexCapexAdapterDesign.md`
- `src/features/rio-scenario-resilience/docs/scenarioCalculationBoundaryDesign.md`

It also uses the feature data definitions and model contracts:

- `src/features/rio-scenario-resilience/data/openingGrades.ts`
- `src/features/rio-scenario-resilience/data/orgDesignStructure.ts`
- `src/features/rio-scenario-resilience/data/tuitionArchitecture.ts`
- `src/features/rio-scenario-resilience/data/dataStatus.ts`
- `src/features/rio-scenario-resilience/data/sourceOfTruthMap.ts`
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

Values and formulas from existing app sources are not automatically simulator
truth. They require deliberate validation or mapping before use.

## 2) Input Status Vocabulary

- `confirmed`: the input is usable as model structure. This does not
  automatically mean the input is calculation-ready.
- `structural_only`: the option, schema, or contract exists, but its required
  values or downstream mapping are incomplete.
- `missing_value`: the required value has not been supplied or validated.
- `needs_mapping`: a candidate source exists, but a normalized simulator
  mapping has not been approved.
- `blocked`: the input or output must remain unavailable because a required
  dependency, validation, definition, or implementation is missing.
- `not_required_yet`: the item belongs to a later layer and should not be
  implemented before upstream inputs and outputs are available.

Missing values must never silently default to financial zero. `null` means
unavailable or blocked, not zero.

## 3) Master Input Map

### A. Revenue Family

| Input family | Input | Current status | Current source | Can be used for calculation now? | Blocking reason | Required next action | Future artifact or file |
|---|---|---|---|---|---|---|---|
| Revenue | Selected opening grades option | `confirmed` | `data/openingGrades.ts`; `RevenueInputBundle.selectedOpeningGradesOptionId` | Yes, as lever structure only | A selected option still needs normalized schedule mapping | Bind a selected opening package to active-grade, section, and enrollment schedules | Typed Input Readiness Registry; future revenue input mapping |
| Revenue | Construction year | `confirmed` | `data/openingGrades.ts` | Yes, as structural metadata only | No construction-year calculation is currently required | Preserve `2027` as confirmed opening-package metadata | Typed Input Readiness Registry |
| Revenue | Opening year | `confirmed` | `data/openingGrades.ts`; `ProjectionYear` begins at `2028` | Yes, as model-horizon metadata only | No blocker for structural use | Preserve `2028` as the confirmed operating opening year | Typed Input Readiness Registry |
| Revenue | Grade-to-division mapping | `confirmed` | `model/revenueInputs.ts` `GRADE_DIVISION_MAP` | Yes, as normalized structure | Legacy grade keys still require normalization before app-source mapping | Use the normalized grade IDs in future simulator-owned inputs | Typed Input Readiness Registry |
| Revenue | Active grades by year | `needs_mapping` | `ActiveGradesByYear`; opening packages; reference-only legacy grade schedules | No | The selected opening package has not been mapped into a normalized annual grade schedule | Define and validate lever-to-schedule mapping | Future revenue and staffing input mapping |
| Revenue | Enrollment by year and grade | `missing_value` | `EnrollmentByYearAndGrade`; reference-only legacy schedules in `src/lib/payroll/domain.ts` | No | No approved normalized enrollment schedule exists | Validate simulator-owned enrollment records for the full horizon | Future normalized enrollment input artifact |
| Revenue | Total enrollment by year | `blocked` | `TotalEnrollmentByYear` | No | Annual totals depend on validated enrollment by year and grade | Derive totals only after normalized enrollment inputs are approved | Future normalized enrollment input artifact |
| Revenue | Selected tuition scenario | `confirmed` | `data/tuitionArchitecture.ts`; `TuitionScenarioId` | Yes, as pricing architecture only | Selection does not provide monetary tuition values | Bind a selected architecture only after tuition records exist | Typed Input Readiness Registry; future tuition input artifact |
| Revenue | Tuition by scenario and grade | `missing_value` | `TuitionByScenarioAndGrade`; `data/tuitionArchitecture.ts` note | No | Architecture exists, but validated tuition values do not | Obtain and validate annual gross contract values by scenario and grade | Future tuition input artifact |
| Revenue | Discount assumptions | `missing_value` | `DiscountAssumptions` | No | No validated global, division, or grade discount values exist | Obtain and validate discount inputs without defaults | Future revenue assumptions artifact |
| Revenue | Annual tuition adjustment assumptions | `missing_value` | `AnnualTuitionAdjustmentAssumptions` | No | No validated global or annual adjustment values exist | Obtain and validate annual adjustment inputs without defaults | Future revenue assumptions artifact |
| Revenue | Occupancy input | `needs_mapping` | `data/dataStatus.ts`; `data/sourceOfTruthMap.ts`; reference-only occupancy paths in `src/lib/payroll/domain.ts` | No | Occupancy exists in legacy paths but is not a normalized standalone simulator input | Define the occupancy input boundary and its relationship to enrollment schedules | Future occupancy input mapping |

### B. Payroll Family

| Input family | Input | Current status | Current source | Can be used for calculation now? | Blocking reason | Required next action | Future artifact or file |
|---|---|---|---|---|---|---|---|
| Payroll | Selected org-design option | `structural_only` | `data/orgDesignStructure.ts`; `PayrollAdapterInput.selectedOrgDesignOptionId` | No | Requested options are blocked shells because Scenario Offer role activation data is narrative-only | Create machine-readable Scenario Offer role activation records before binding options to role mappings | Future Scenario Offer role activation mapping table |
| Payroll | Baseline role set | `needs_mapping` | `data/orgDesignStructure.ts` `baselineRoleSet`; reference-only `src/constants/leadership.ts` and `src/constants/teaching.ts` | No | Existing role records have not been normalized into simulator-compatible validated records | Map approved existing roles into `ValidatedRoleCostMap` | Future payroll role-cost and staffing mapping table |
| Payroll | Org-design extension roles | `blocked` | `data/orgDesignStructure.ts` `additionalRoleIds`; `orgDesignCompensationAliases` | No | Display-role aliases exist, but option activation, FTE/headcount rule, activation year, and allocation category are not mapped | Map Scenario Offer role activations to display roles, then validate every staffing field before financial use | Future Scenario Offer role activation mapping table |
| Payroll | Validated role-cost map | `needs_mapping` | `ValidatedRoleCostMap`; reference-only payroll role sources | No | No approved normalized role-cost map exists | Create and validate the role-level mapping table | Future payroll role-cost and staffing mapping table |
| Payroll | Teaching compensation data | `needs_mapping` | Reference-only `src/constants/teaching.ts`; `PayrollRoleSource` | No | Existing educator and support compensation data are not automatically simulator truth | Map only approved teaching compensation records | Future payroll role-cost and staffing mapping table |
| Payroll | Staffing rules | `needs_mapping` | `StaffingModelInputs`; reference-only `src/constants/teaching.ts` and `src/lib/payroll/domain.ts` | No | Existing staffing economics, grade keys, schedules, and ratios require normalization | Define validated staffing rule mappings and preserve source ownership | Future payroll role-cost and staffing mapping table |
| Payroll | Sections by year and grade | `missing_value` | `SectionsByYearAndGrade`; reference-only legacy section schedules | No | No approved normalized section schedule exists | Validate annual section records after opening-grade and occupancy mapping | Future staffing input artifact |
| Payroll | FTE/headcount rules | `needs_mapping` | `PayrollRoleValidationStatus`; reference-only headcount progression and teaching economics | No | Headcount and FTE cannot be treated as interchangeable without approved conversion rules | Record an approved FTE or headcount rule for every mapped role | Future payroll role-cost and staffing mapping table |
| Payroll | Payroll allocation category | `needs_mapping` | `PayrollAllocationCategory`; reference-only existing allocation fields | No | Each mapped role must be validated as `FOPAG_DIRETO`, `FOLHA_DIRETA`, or explicitly unmapped | Map and validate allocation category per role | Future payroll role-cost and staffing mapping table |
| Payroll | Payroll adapter output | `blocked` | `PayrollAdapterOutput`; `EMPTY_PAYROLL_ADAPTER_OUTPUT` | No | Adapter implementation is intentionally absent and required inputs are incomplete | Implement mapping only after role-cost and staffing inputs pass validation | Future payroll adapter implementation |

### C. OPEX/CAPEX Family

| Input family | Input | Current status | Current source | Can be used for calculation now? | Blocking reason | Required next action | Future artifact or file |
|---|---|---|---|---|---|---|---|
| OPEX/CAPEX | Selected service-contract option | `missing_value` | `OpexCapexAdapterInput.selectedServiceContractsOptionId`; `data/dataStatus.ts` | No | No service-contract source of truth or validated option set exists | Define the lever structure only when approved service-contract data are available | Future service-contract input artifact |
| OPEX/CAPEX | Validated service-contract inputs | `missing_value` | `ValidatedServiceContractInputs` | No | No approved item records exist with category, cost or driver, behavior, activation, escalation, and type | Obtain and validate service-contract records | Future service-contract input artifact |
| OPEX/CAPEX | Validated baseline OPEX inputs | `missing_value` | `ValidatedOpexInputs`; reference-only `src/lib/viability/baseline.ts` | No | Legacy OPEX defaults are reference material, not simulator truth | Obtain validated OPEX records and classify source ownership | Future OPEX input artifact |
| OPEX/CAPEX | Selected CAPEX option | `missing_value` | `OpexCapexAdapterInput.selectedCapexOptionId`; `data/dataStatus.ts` | No | No approved lever-level CAPEX package exists | Define CAPEX options only after approved investment inputs are available | Future CAPEX input artifact |
| OPEX/CAPEX | Validated CAPEX schedule inputs | `missing_value` | `ValidatedCapexScheduleInputs`; reference-only viability CAPEX structures | No | No approved item amount, schedule, recurrence, contingency, and ownership records exist | Obtain and validate CAPEX schedule items | Future CAPEX input artifact |
| OPEX/CAPEX | Recurring CAPEX classification | `needs_mapping` | `CapexItemType`; `CapexValidationStatus`; reference-only viability structures | No | Existing recurring patterns are not normalized simulator records | Validate one-time versus recurring classification per CAPEX item | Future CAPEX input artifact |
| OPEX/CAPEX | CAPEX source ownership | `needs_mapping` | `FinancialSourceOwnership`; reference-only viability structures | No | Each reused or simulator-owned CAPEX item must be identified explicitly | Record ownership for every validated CAPEX item | Future CAPEX input artifact |
| OPEX/CAPEX | Discount rate for VPL | `missing_value` | `OpexCapexAdapterInput.discountRateForVpl` | No | No validated pass-through discount rate exists | Obtain and validate the pass-through input; do not calculate VPL in the adapter | Future cash-flow assumptions artifact |
| OPEX/CAPEX | OPEX/CAPEX adapter output | `blocked` | `OpexCapexAdapterOutput`; `EMPTY_OPEX_CAPEX_ADAPTER_OUTPUT` | No | Adapter implementation is intentionally absent and source inputs remain incomplete | Implement mapping only after service-contract, OPEX, and CAPEX records are validated | Future OPEX/CAPEX adapter implementation |

### D. Scenario Boundary Family

| Input family | Input | Current status | Current source | Can be used for calculation now? | Blocking reason | Required next action | Future artifact or file |
|---|---|---|---|---|---|---|---|
| Scenario boundary | Receita output | `blocked` | `ScenarioOutputResult` `receita` | No | Enrollment, tuition values, discounts, annual adjustments, and occupancy mapping are incomplete | Complete revenue inputs, then create Receita calculation design and contract | Future Receita calculation design |
| Scenario boundary | FOPAG / Folha Direta output | `blocked` | `ScenarioOutputResult` `fopagFolhaDireta`; `PayrollAdapterOutput` | No | Payroll mapping and role-cost validation have not passed | Complete payroll role-cost and staffing mapping before adapter implementation | Future payroll adapter implementation |
| Scenario boundary | FOPAG / Receita output | `blocked` | `ScenarioOutputResult` `fopagReceitaRatio` | No | Receita and payroll outputs do not exist | Complete both upstream layers first | Future operating output design |
| Scenario boundary | OPEX output | `blocked` | `ScenarioOutputResult` `opex`; `OpexCapexAdapterOutput` | No | Validated OPEX and service-contract inputs do not exist | Complete validated OPEX inputs before adapter implementation | Future OPEX/CAPEX adapter implementation |
| Scenario boundary | CAPEX output | `blocked` | `ScenarioOutputResult` `capex`; `OpexCapexAdapterOutput` | No | Validated CAPEX option and schedule inputs do not exist | Complete validated CAPEX records before adapter implementation | Future OPEX/CAPEX adapter implementation |
| Scenario boundary | EBITDA output | `not_required_yet` | `ScenarioOutputResult` `ebitda`; boundary design | No | Receita, payroll, and OPEX outputs do not exist; convention is not confirmed | Define EBITDA only after upstream operating outputs are available | Future EBITDA design |
| Scenario boundary | EBITDA margin output | `not_required_yet` | `ScenarioOutputResult` `ebitdaMargin`; boundary design | No | EBITDA and Receita do not exist | Define the margin boundary after EBITDA is confirmed | Future EBITDA design |
| Scenario boundary | Cash-flow outputs | `not_required_yet` | `freeCashFlow`, `cumulativeCashFlow`, and `discountedCashFlow` output IDs | No | Receita, payroll, OPEX, CAPEX, and discount-rate inputs are unavailable | Define cash-flow assembly only after upstream outputs exist | Future cash-flow design |
| Scenario boundary | VPL / NPV output | `not_required_yet` | `ScenarioOutputResult` `vplNpv`; reference-only viability utility | No | Normalized discounted cash flow does not exist | Extract or map a generic utility only after cash-flow design | Future VPL / NPV utility mapping |
| Scenario boundary | Simple payback output | `not_required_yet` | `ScenarioOutputResult` `simplePayback`; reference-only viability utility | No | Normalized cumulative cash flow does not exist | Extract or map a generic utility only after cash-flow design | Future simple-payback utility mapping |
| Scenario boundary | Discounted payback output | `blocked` | `ScenarioOutputResult` `discountedPayback`; boundary design | No | No confirmed discounted-payback formula or ownership boundary exists | Confirm requirement and define ownership before implementation | Future discounted-payback design, if required |
| Scenario boundary | Scenario tier output | `blocked` | `ScenarioOutputResult` `scenarioTier`; boundary design | No | Evaluation rules do not exist | Define interpretation rules only after financial outputs exist | Future scenario-tier interpretation design |
| Scenario boundary | Sensitivity / resilience outputs | `blocked` | `ScenarioOutputResult` `sensitivityResilienceSignals`; reference-only viability view models | No | Real recomputation and interpretation rules do not exist | Define a resilience-analysis layer only after the calculation boundary works | Future resilience interpretation design |

## 4) Calculation Readiness By Family

### A. Revenue Readiness

Receita calculation cannot begin. Opening-grade packages, the normalized grade
map, the projection horizon, and tuition architecture options are structurally
available. The required calculation values are not.

Before Receita work begins, the simulator needs validated:

- enrollment by year and grade
- tuition by scenario and grade
- discount assumptions
- annual tuition adjustment assumptions
- occupancy input and its approved enrollment mapping

Legacy enrollment and tuition paths may inform mapping review, but they must
not become simulator-owned Receita inputs automatically.

### B. Payroll Readiness

Payroll adapter implementation cannot begin yet. Existing payroll utilities
and candidate role-cost sources are available as references, but a validated
role-cost and staffing mapping table does not exist.

Before implementation, the mapping must cover:

- baseline roles
- org-design extension roles
- teaching compensation records
- active grades and sections
- staffing rules
- FTE or headcount rules
- activation years
- allocation categories

The adapter must later reuse approved payroll utilities without duplicating
their formulas.

### C. OPEX/CAPEX Readiness

OPEX/CAPEX adapter implementation cannot begin yet. The existing viability
layer provides structural references, but its default values must not become
simulator truth.

Before implementation, validated records must exist for:

- service-contract options and items
- baseline OPEX items
- CAPEX options and schedules
- recurring versus one-time CAPEX classification
- CAPEX source ownership
- discount rate for VPL as a pass-through input

### D. Scenario Output Readiness

EBITDA, cash flow, VPL / NPV, simple payback, discounted payback, scenario tier,
and sensitivity / resilience outputs cannot begin. Their required upstream
calculated outputs do not exist.

Discounted payback must remain blocked until explicitly defined. Scenario tier
and sensitivity / resilience signals must remain blocked until real evaluation
rules exist.

## 5) Input Traceability Requirements

A future typed input-readiness registry should record:

| Field | Purpose |
|---|---|
| `inputId` | Stable identifier for the audited input |
| `inputFamily` | Revenue, payroll, OPEX/CAPEX, or scenario-boundary ownership |
| `label` | Human-readable input name |
| `status` | One status from the vocabulary in this document |
| `currentSource` | Current contract, data definition, or reference-only app source |
| `sourceOwnership` | Simulator-owned, mapped existing source, reference-only, or unmapped |
| `canUseForCalculation` | Explicit calculation-readiness boolean |
| `blockingReason` | Reason the input remains unavailable when not calculation-ready |
| `requiredNextAction` | Concrete action required to advance readiness |
| `dependsOn` | Upstream input IDs required before use |
| `futureArtifactOrFile` | Expected design, mapping table, registry, contract, or implementation artifact |

The registry should preserve the distinction between structural readiness and
calculation readiness. It should not infer availability from a non-null label
or silently replace missing values with zero.

## 6) Typed Input-Readiness Registry Recommendation

The existing readiness contracts are useful but fragmented:

- `RevenueInputReadiness` tracks revenue assumptions.
- `PayrollAdapterInputReadiness` tracks payroll-adapter inputs.
- `OpexCapexAdapterInputReadiness` tracks OPEX/CAPEX-adapter inputs.
- `ScenarioCalculationDependencyStatus` tracks boundary-level dependency
  readiness.

These contracts do not provide one auditable input-level inventory with source
ownership, dependencies, blockers, and next actions. A typed input-readiness
registry is needed before calculation work begins.

The registry should coordinate existing readiness contracts rather than
duplicate or replace their domain-specific states.

## 7) Recommended Next Artifact

The recommended next artifact is:

**Typed Input Readiness Registry**

The next artifact is not Receita formulas. Receita design and contract work
should follow only after the registry makes the missing revenue inputs and
their validation path explicit.

## 8) Risks

- Building Receita before validated enrollment exists would produce an
  unsupported revenue result.
- Building Receita from tuition architecture without tuition values would
  mistake pricing structure for financial input.
- Treating occupancy as enrollment without mapping would create unsupported
  student schedules.
- Treating existing payroll role labels as validated role costs would allow
  unsupported payroll impacts.
- Treating existing OPEX/CAPEX defaults as simulator truth would import legacy
  assumptions into a new decision model.
- Creating duplicated readiness logic across contracts would produce
  conflicting blocked and available states.
- Starting EBITDA before Receita, payroll, and OPEX exist would bypass required
  upstream dependencies.
- Using blocked or `null` defaults as financial zeros would hide missing data
  and make incomplete scenarios appear calculable.

## 9) Conclusion

The simulator has a usable structural foundation, but calculation work must
remain blocked. The next step is a typed input-readiness registry that makes
the input-level audit machine-readable without introducing formulas,
financial assumptions, or adapter implementations.
