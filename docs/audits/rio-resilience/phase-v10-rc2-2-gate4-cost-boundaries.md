# V10-RC2.2 Gate 4 — Cost Boundaries

Six cost concepts, kept structurally distinct. For each: exact formula, source location, and evidence. Then the D-R5/D-R6/F03/CORPORATE-ALLOCATION scoping (blocked outputs vs. not-blocked outputs), reusing the V10-RC2.2 Gate 1 blocker register rather than restating it.

## 1. Base salary payroll

- **Formula:** `grossMonthlyAfterGrowth × 13 × headcountOrFte`, where `grossMonthlyAfterGrowth = salaryMonthlyForYear(toSalaryBase2028(rec.grossMonthly), year)`.
- **Growth track:** independent salary escalation, 5.9%/yr from 2029 (`resolveSalaryGrowthFactor`), base year 2028. Per `src/lib/payroll/payrollGrowth.ts`.
- **Source:** `fopagEngine.ts:172,177,186-188` (per-record `grossMonthly`/`grossMonthlyAfterGrowth`/`grossLaborAnnualBeforeGrowth`/`grossLaborAnnualAfterGrowth` fields on `FopagCalculatedRecord`).
- **Exposure:** NOT separately summed in `FopagYearTotals` — combined with encargos (below) into `grossLaborAnnualAfterGrowth` before being bucketed into `fopagDireto`/`folhaDireta`. Available at record level (`FopagCalculatedRecord.grossMonthly`), not as an isolated year-total field.

## 2. Encargos (payroll taxes / social charges)

- **Formula:** `laborChargesMonthlyAfterGrowth = laborChargesMonthlyForSalary(grossMonthlyAfterGrowth)` = `grossMonthlyAfterGrowth × 48.5%` (per `fopagEngine.ts:327` comment and `payrollGrowth.ts` implementation), annualized as `laborChargesMonthlyAfterGrowth × 13 × headcountOrFte`.
- **Source:** `fopagEngine.ts:178-180` (per-record `laborChargesMonthly`/`laborChargesMonthlyAfterGrowth` fields).
- **Exposure:** same as base salary — combined into `grossLaborAnnualAfterGrowth` (line 192-196: `(grossMonthlyAfterGrowth + laborChargesMonthlyAfterGrowth) × 13 × headcountOrFte`), not isolated as its own year-total field. Available at record level (`FopagCalculatedRecord.laborChargesMonthly`), not as an isolated year-total field.
- **Why base salary and encargos are combined pre-bucketing, not merged conceptually:** they share one growth-dependent variable (`grossMonthlyAfterGrowth`) and one allocation model (`FOPAG_DIRETO`/`FOLHA_DIRETA`); combining them before bucketing avoids a duplicate escalation/bucketing pass. They remain two distinct, separately-computed record fields (`grossMonthly`, `laborChargesMonthly`) — this document treats them as distinct concepts per the directive even though the engine's year-total output does not carry a separate `encargos` field.

## 3. Benefits

- **Formula:** `benefitsMonthlyAfterGrowth × 12 × headcountOrFte`, where `benefitsMonthlyAfterGrowth = benefitsMonthlyForYear(toBenefitsBase2028(rec.benefitsMonthly), year)`.
- **Growth track:** independent benefits escalation, 10%/yr from 2029, base year 2028 — a separate canonical track from salary (V10-P1, superseding the prior single-factor 6%/yr convention for both).
- **Source:** `fopagEngine.ts:173,175,181-184,189-190,197-199`.
- **Exposure:** `FopagYearTotals.benefits` — a genuinely separate, summed year-total field, never combined with `fopagDireto`/`folhaDireta` until `totalPayroll` is explicitly formed.

## 4. Direct campus payroll

- **Formula:** `totalPayroll = fopagDireto + folhaDireta + benefits` (fully-loaded) or `fopagDireto + folhaDireta` (without-benefits margin mode — `PayrollProjectionTab.tsx`'s `marginMode === "WITHOUT_BENEFITS"`).
- **Source:** `fopagEngine.ts:283,290` (`FopagYearTotals.totalPayroll`); consumed unchanged by `PayrollProjectionTab.tsx`'s `grandTotal = withBenefits ? yt.totalPayroll : yt.fopagDireto + yt.folhaDireta`.
- **Scope:** covers 100% of governed instructional and non-instructional campus headcount (EY/LS grade-level + MS/HS aggregate + baseline leadership/backoffice/specialist roles). Excludes any corporate/shared-services overhead — there is no corporate headcount or cost in this figure by construction (the payroll adapter only emits campus-role records).

## 5. Corporate allocation

- **Status: unavailable.** No adapter exists in this codebase that allocates corporate/shared-services people cost onto direct campus payroll (confirmed V10-RC2 Gate 5, V10-RC2.1 Gate 5, reconfirmed this phase's Gate 1 register, entry `CORPORATE-ALLOCATION`).
- **Not to be conflated with:** two DRE-level fixed P&L expense lines tagged `costLineCategory: "corporate_allocation"` (`corporativo_bu`, `rateio_corporativo` in `dreLineItemMap.ts`, populated with real Finance annual figures in `dreAnnualAssumptionSourceData.ts`). These are `directScenarioDriver: false`, `scenarioSensitivity: independent_of_board_decision_levers` — Finance-provided fixed costs feeding `calculateDre()`'s EBITDA line directly, not a function of headcount, and not a payroll-side consolidation adapter. Their existence does not satisfy this concept.
- **Blocking evidence:** Gate 1 register entry `CORPORATE-ALLOCATION`, category `engineering_integration_gap`.
- **UI treatment:** not shown as a KPI or table column in `PayrollProjectionTab.tsx` — omitted, not zero-substituted (`substitutedZero: false` in the register).

## 6. Consolidated people cost

- **Formula (when available):** direct campus payroll + corporate allocation. **Currently unavailable**, because it causally depends on (5), which is unavailable.
- **Enforcement:** no code path in this repository sums direct campus payroll into any output labeled "consolidated" — verified by `scripts/validate-v10-rc2-2-gate4-cost-boundaries.ts` (see below).
- **UI mislabeling found and corrected this gate:** `PayrollProjectionTab.tsx`'s margin KPI was labeled `payrollCoberturaConsolidadaLabel` ("Cobertura Consolidada" / "Consolidated Coverage") while displaying `marginAnnual = totalRevenueAnnual - grandTotal`, i.e. revenue minus **direct campus payroll only** (no corporate allocation term). The word "Consolidada" implied the margin already accounted for consolidated (direct + corporate) cost, which it does not — this is exactly the mislabeling this gate forbids ("do not describe direct campus payroll as consolidated cost"). Renamed to `payrollMargemFolhaDiretaLabel` ("Margem sobre Folha Direta" / "Margin over Direct Payroll") in both locales and the component. No consolidated-cost KPI is shown anywhere in the tab; none should be, since corporate allocation remains unavailable.

## D-R5 / D-R6 / F03 scoping (reusing Gate 1 register, not restated in full)

All three block only **revenue-side certification/precision outputs** (Descontos Método precision for D-R5; base tuition rate Finance-signature and board ratification for D-R6/F03). None blocks:
- enrollment, sections, instructional or non-instructional headcount (any of the six cost concepts' headcount inputs)
- direct campus payroll (concept 4) — computed and shown unconditionally, `computed_uncertified` where revenue is involved, never suppressed
- benefits, encargos, or base salary payroll (concepts 1-3) — pure cost-side, unaffected by revenue-source governance

Per Gate 1 register: `notBlocked` fields for D-R5/D-R6/F03 each explicitly list "direct campus payroll" and headcount. No disposition changes this — Gate 4 confirms by re-reading the same register rather than re-deriving it.

## Validation

`scripts/validate-v10-rc2-2-gate4-cost-boundaries.ts` asserts:
1. `FopagYearTotals.totalPayroll === fopagDireto + folhaDireta + benefits` for every governed combination/year (structural formula check, live).
2. No source file in `src/` contains a "consolidated" cost/coverage label bound to a value that omits a corporate-allocation term (regex scan for the retired key name + confirmation the new key exists and is bound to `marginAnnual`, which is documented as direct-payroll margin, not consolidated cost).
3. No corporate-allocation adapter function exists (reuses Gate 1's check) and no output anywhere sums `fopagDireto`/`folhaDireta`/`totalPayroll` with any corporate-allocation term (none exists to sum).
4. `PayrollProjectionTab.tsx` never displays a "consolidated people cost" KPI/label anywhere.
