# V10-RC2.2 Gate 7 — Coverage matrix regeneration with Payroll/corporate-allocation fields

Extends the existing 900-cell coverage matrix (`scripts/validate-v10-rc2-gate8-coverage-matrix.ts`, `docs/audits/rio-resilience/phase-v10-rc2-gate8-coverage-matrix.json`) with four new per-cell fields reflecting this phase's Payroll shared-engine refactor and its cost-boundary findings. No new generator; same 900-cell cross-product (2 opening packages x 3 captação x 3 org-design x 10 years x 5 tuition scenarios).

## New per-cell fields

- `payrollHeadcountAvailable` — Payroll's headcount output for this cell, post-Gate-2-refactor (distinct from the pre-existing `staffingAvailable`, which describes the FOPAG engine's own readiness).
- `payrollMonetaryAvailable` — Payroll's monetary (cost) output for this cell.
- `payrollMonetaryCertified` — always `false`: available but never Finance-certified, same status class as `tuitionStatus: computed_uncertified`.
- `corporateAllocationAvailable` — always `false`: no adapter exists (blocker `CORPORATE-ALLOCATION`, V10-RC2.2 Gate 1 register).
- `consolidatedCostAvailable` — always `false`: causally depends on corporate allocation.
- `blockedByDecisionIds` now includes `"CORPORATE-ALLOCATION"` for every cell.

## Named counts (regenerated, all 900 cells)

| Count | Value |
|---|---|
| `payrollHeadcountAvailable` | 900 |
| `payrollHeadcountUnavailable` | 0 |
| `payrollMonetaryAvailable` | 900 |
| `payrollMonetaryUnavailable` | 0 |
| `payrollMonetaryCertified` | 0 |
| `payrollMonetaryUncertified` | 900 |
| `corporateAllocationAvailable` | 0 |
| `corporateAllocationUnavailable` | 900 |
| `consolidatedCostAvailable` | 0 |
| `consolidatedCostUnavailable` | 900 |
| `payrollHeadcountAvailable_and_corporateAllocationUnavailable` | 900 (proves direct payroll is never suppressed by the corporate-allocation gap) |
| `payrollMonetaryAvailable_and_consolidatedCostUnavailable` | 900 |
| `blockedByCorporateAllocationDecisionId` | 900 |
| `blockedByDecisionIdCounts["CORPORATE-ALLOCATION"]` | 900 |

All pre-existing counts (`enrollmentAvailable`, `perGradeEnrollmentAvailable`, `sectionsAvailable`, `staffingAvailable`, `payrollAvailable`, `revenueAvailable`, `dreHandoffAvailable`, `exportAvailable`, `supportLevelCounts`, `blockedByDecisionIdCounts["D-R5"/"D-R6"/"F03"/"F05"/"F06"]`, `crossTabs`) are unchanged: 900/900 for every previously-governed dimension, 0/900 `fully_supported`, 0/900 `exportAvailable` — the Payroll refactor did not change any of these, and this regeneration re-confirms that rather than assuming it.

## Validation

`npm run validate:v10-rc2-gate8` — 16/16 generator-invariant assertions pass (10 pre-existing + 6 new: `payrollHeadcountAvailable`, `payrollMonetaryAvailable`, `payrollMonetaryCertified=false`, `corporateAllocationAvailable=false`, `consolidatedCostAvailable=false`, and the direct-payroll-never-suppressed cross-tab). JSON regenerated at `docs/audits/rio-resilience/phase-v10-rc2-gate8-coverage-matrix.json`.
