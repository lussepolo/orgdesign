# V10-RC2.2 Gate 5 — Fagundes export completion (11 outputs, not just the index)

Per the phase directive: "The Fagundes Export Index alone does not satisfy this gate." This gate adds three new, dedicated sheets — materially implementing the three of the 11 requested outputs that were previously only *mapped* to sheets built for a different purpose (or marked fully unavailable), and updates the Index to reflect the new mapping.

## What changed

- **Grade-Level Staffing Summary** (new sheet): per-division-area headcount totals, one column per governed year, sourced from `buildOrgDesignHcTable()` — the identical shared call `PayrollProjectionTab.tsx` and `ExecutiveOrgDesignTab.tsx` both use (V10-RC2.2 Gate 3 parity-by-construction). Previously mapped to "FOPAG Headcount Plan" (a three-tier payroll comparison sheet, not a grade-level staffing view).
- **Grade-Level Staffing Detail** (new sheet): one row per role per year, same shared source, with a "Grade-Level Basis" column disclosing whether each row is governed section-count-derived (EY/LS) or the F06 unreconciled MS/HS fixed-FTE estimate — never silently presented as equivalent. Previously mapped to "FOPAG Role Audit" (a different payroll-tier-comparison view keyed by `roleId`, not by grade).
- **Direct Payroll & Corp Alloc** (new sheet): direct campus payroll (`FOPAG_DIRETO`/`FOLHA_DIRETA`/`Benefícios`, from `vm.fopagOutput.yearTotals`) computed and shown unconditionally per year; Corporate Allocation and Consolidated People Cost columns explicitly labeled `UNAVAILABLE` citing the `CORPORATE-ALLOCATION` blocker (V10-RC2.2 Gate 1 register) — never blank, never zero-substituted, direct payroll never suppressed because of it. Previously this output was marked fully `unavailable` in the Index with no dedicated sheet at all.
- **Fagundes Export Index** updated: the three rows above now point at the new dedicated sheets; the third row's availability changed from `unavailable` to a new `partially_available` state (direct payroll available, corporate allocation genuinely unavailable) — added to the `FagundesIndexRow` type.
- Workbook sheet count: 25 → 28.

## Final classification of all 11 Fagundes-requested outputs

| # | Fagundes sheet | Classification | Maps to |
|---|---|---|---|
| 1 | Scenario Control | materially implemented (satisfied by existing) | Scenario Inputs |
| 2 | Grade-Level Staffing Summary | **materially implemented (new this gate)** | Grade-Level Staffing Summary |
| 3 | Grade-Level Staffing Detail | **materially implemented (new this gate)** | Grade-Level Staffing Detail |
| 4 | Non-Teaching Headcount | materially implemented (satisfied by existing) | Org Design Roles |
| 5 | Staffing and Tier Assumptions | materially implemented (satisfied by existing) | Payroll Assumptions |
| 6 | Payroll Detail | materially implemented (satisfied by existing) | Payroll Detail - Minimum/Balanced/Premium |
| 7 | Direct Payroll and Corporate Allocation | **partially implemented (new this gate)** — direct payroll available, corporate allocation genuinely unavailable | Direct Payroll & Corp Alloc |
| 8 | Tuition and Revenue Assumptions | materially implemented, computed_uncertified (D-R6/F03) | Tuition Revenue |
| 9 | Scenario Comparison | materially implemented (satisfied by existing) | Scenario Sensitivity Matrix; Org Design Sensitivity |
| 10 | FOPAG_DIRETO Payroll Bridge | materially implemented (satisfied by existing) | DRE Payroll Bridge |
| 11 | Source and Formula Lineage | materially implemented (satisfied by existing) | Formula Audit; Raw Engine Output |

All 11 outputs are now either materially implemented or explicitly, evidentially partial — none remain silently mapped to a sheet built for an unrelated purpose, and none show blank/zero where a genuine blocker exists.

## Validation

`scripts/validate-v10-rc2-1-gate7-fagundes-export.ts` extended: 24/24 checks pass, including new structural assertions that the three new sheets exist, contain the expected headers, and correctly disclose the F06 MS/HS basis and the CORPORATE-ALLOCATION unavailability (not blank, not zero).

Downstream sheet-count assumptions checked: `validate-v10-x1-payroll-export-matrix.ts` asserts a different, unrelated 7-sheet export (unaffected); `validate-phase15r1.ts` asserts `>= 19` sheets (a floor, unaffected). `validate-phase15r1.ts` itself has 5 pre-existing failures (2047 payroll-total fixture drift and `DreScenarioSimulatorTab.tsx` copy checks) — confirmed byte-identical before and after this gate's changes via `git stash`; not caused by this phase, not in this phase's scope (it is not registered in `package.json` and was not among the eight/nine scripts named in Gate 6).
