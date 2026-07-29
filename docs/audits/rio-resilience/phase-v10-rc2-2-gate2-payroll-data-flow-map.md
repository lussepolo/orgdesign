# V10-RC2.2 Gate 2 — Payroll data flow map (before refactor)

Written before any mutation to `PayrollProjectionTab.tsx`, per the phase directive.
Source: direct inspection of `PayrollProjectionTab.tsx` (1447 lines, full file read),
`src/lib/payroll/{domain,core,index}.ts`, `payrollAdapter.ts`, `dreScenarioWorkbook.ts`,
`orgDesignHcTableAdapter.ts`.

## Stage-by-stage map

| Stage | Current source of truth | Input contract | Output contract | Consumer | Local default? | Duplicated state/calc? | Silent fallback? | Availability handling |
|---|---|---|---|---|---|---|---|---|
| Shared scenario state | **None reaches this file.** `dreSelections` (App.tsx) is never passed as a prop. | — | — | — | Yes — see below | — | — | — |
| Opening package | `lib/payroll` has no opening-package concept at all — `PAYROLL_GRADE_CONFIG`/`STUDENTS_SCHEDULE` are package-agnostic (implicitly one fixed campus layout) | none | none | — | Implicit single default (no selector exists) | Duplicated vs. `openingPackageOccupancySourceDataContract` | Silent — no package axis exists to select | N/A |
| Captação (enrollment) scenario | Local `[scenario, setScenario] = useState<PayrollScenario>("otimista")` (line 85, **inside the q19-pinned calc-core range**) | user click | `PayrollScenario` = `"otimista"\|"base"\|"pessimista"` | `turmasMatrix`, `projection`, `allScenariosData`, `matrixData`, `gradeDetail` | **Yes — independent local default `"otimista"`**, unrelated to shared `occupancyScenarioId` (`"conservador"\|"base"\|"otimista"`) | **Yes** — `TURMAS_SCHEDULE`/`STUDENTS_SCHEDULE` (`lib/payroll/domain.ts`) duplicate `governedCaptacaoCapacitySourceData.ts`'s enrollment data under a different, non-governed 3-value axis | N/A (own axis, not falling back to shared state — worse: never receives it) | No availability concept — always "available" against fabricated local data |
| Org-design scenario | **No selector exists in this file at all.** | — | — | — | Implicit — file has no concept of Minimum/Balanced/Premium | — | — | — |
| Year | Local `[selectedYear, setSelectedYear] = useState(2028)` | user click | `number` | detail views | Local default `2028` (harmless — 2028 is also the shared default) | No | No | No |
| Tuition configuration | Local `[tuitionScenario, setTuitionScenario] = useState<TuitionScenario>("cen1")` (line 86, pinned range) | user click | `"cen1"\|"cen2"\|"cen3"` | `getAnnualRevenue`/`TUITION_ANNUAL` (revenue/margin/coverage columns only) | **Yes — independent local default `"cen1"`**, no relation to shared `tuitionScenarioId` (`bp1_division_differentiated` etc.) | **Yes** — `TUITION_ANNUAL` + flat `TUITION_GROWTH_RATE` is a second, non-governed revenue formula, fully disconnected from `calculateDre()`'s discount-schedule/growth-factor governed revenue engine | N/A | Always "available" against fabricated local data — never marked uncertified |
| Educator/assistant tier selection | Local `[gradeTiers, setGradeTiers] = useState<Record<string,string>>(defaultPayrollTiers)` (line 112, **outside** pinned range) — per-grade Specialist/Associate/Master picker | user click | `Record<gradeId, tierId>` | `getGradeLevel`, `gradeDetail` cost calc | **Yes — local default table** (`defaultPayrollTiers`) | **Yes** — the shared engine (`payrollAdapter.ts`) hardcodes EY/LS teaching leads at **Master Educator, fixed, not configurable** (Phase 8H.1 approved-v1 rule) — this selector edits a value the governed engine does not treat as a variable at all | N/A | N/A |
| Locale | `useLocale()` — shared, correctly wired already | — | `t()`/`locale` | all display strings, `formatCurrencyBRL` | No | No | No | N/A |
| Section calculation | Local `computeTurmasPerYear(grade, scenario)` → `TURMAS_SCHEDULE[scenario][gradeId]` (line 118-121, pinned range) | `PayrollScenario` | `(number\|null)[]` per grade | `turmasMatrix`, `gradeDetail` | Inherits local scenario default | **Yes** — duplicates `calculateSectionCountsForScenario()` under the local axis | N/A | Always available |
| Grade-level (instructional) staffing | Local `getLeadFteForGrade()` (lines 59-74, **outside pinned range**) — MS/HS uses a **hardcoded FTE table** (g6=3, g7=4, g8=3, g9=4, g10=0, g11=3, g12=3); EY/LS uses `turmas` directly (1:1 with sections) | grade, turmas | FTE count | `gradeDetail.leadsCount` | Hardcoded MS/HS table = an **independent, non-governed default** | **Yes, and this is F06's problem**: this hardcoded MS/HS table is exactly one of the three non-identical, unreconciled MS/HS staffing sources F06 already names (V10-RC2 Gate 1) | N/A | Always available — silently presents an unreconciled MS/HS figure as fact |
| Organizational-role (non-instructional) headcount | **Not modeled in this file at all.** No leadership/backoffice/specialists breakdown exists here (that's `orgDesignHcTableAdapter.ts`, consumed only by Org Design/DRE workbook). | — | — | — | N/A — entirely absent | N/A | N/A | N/A |
| Salary/benefits/encargos calculation | `lib/payroll/core.ts` `annualSalaryBurden()` — **structurally similar to but a separate implementation from** `fopagEngine.ts`'s `grossLaborAnnualAfterGrowth`/`benefitsAnnualAfterGrowth` (both apply salary/benefits growth, but via `payrollGrowth.ts` in one case and `lib/payroll/core.ts`'s own escalation constants in the other) | role cost record | annualized BRL | `gradeDetail`, `yearlyData` | No | **Yes** — two independent implementations of the same governed V10-P1 escalation logic | N/A | Always available |
| Direct campus payroll | `yearlyData[i].fopagDiretoAnnual`/`folhaDiretaAnnual` — local `buildPayrollProjection()` output | local scenario/tuition/tiers | BRL | KPI strip, tables | Inherits local defaults | Yes (see above) | N/A | Always available |
| Corporate allocation | **Does not exist in this file, or anywhere in the codebase** (confirmed V10-RC2 Gate 5, reconfirmed V10-RC2.1 Gate 5) | — | — | — | N/A | N/A | N/A | Correctly absent — no adapter invented |
| Consolidated people cost | **Does not exist** — `grandTotal` in this file sums FOPAG_DIRETO+benefits+FOLHA_DIRETA (direct-campus only), mislabeled implicitly as "Total Anual" without a corporate-allocation caveat | — | direct-only BRL | KPI strip | N/A | N/A | N/A | Not distinguished from a true consolidated cost — a labeling gap, not a calculation gap |
| Workbook export | `handleDownloadProjectionTable()` → `downloadTenYearProjectionXlsx()` (`lib/payroll/exportXlsx.ts`), entirely separate from `dreScenarioWorkbook.ts`/`buildDreScenarioWorkbook()` | local `scenario`/`tuitionScenario`/`marginMode`/`projection` | `.xlsx` file | user download | Inherits local defaults | **Yes** — a third, independent export pathway (distinct from both the `q11`-pinned Payroll-export files and `dreScenarioWorkbook.ts`) | N/A | Exports whatever the disconnected local state currently holds |

## The discriminating finding

`calculateFopag()` already produces **all instructional (EY/LS) and all non-instructional
(leadership/backoffice/specialists) headcount and cost** this tab needs, for the real
shared scenario — confirmed directly in V10-RC2.1 Gate 6 (1791 rows, `roleId` patterns
`ey_teaching_lead_*`/`ey_learning_assistant_*`/`ey_learning_monitor_*`/`ls_*` verified
against `payrollAdapter.ts` source, cross-validated numerically against this file's own
prior EY T1 figures). `calculateDre()` already produces governed (if uncertified) revenue
for any shared `tuitionScenarioId`. Nothing this tab needs is missing from the shared
engines **except**:

1. **MS/HS grade-level instructional headcount** — the shared engines do not provide a
   governed per-grade MS/HS breakdown (F06, genuinely unresolved). This file's own
   `getLeadFteForGrade()` MS/HS table is one of F06's three conflicting sources, not a
   fourth authority to prefer.
2. **Per-grade variable educator tier** — the shared engine fixes EY/LS tier at Master
   Educator; MS/HS/leadership/backoffice/specialist costs are role-level, not
   tier-selectable. `gradeTiers` edits a variable the governed model does not expose.
3. **Corporate allocation / consolidated people cost** — no adapter exists anywhere in
   this codebase (confirmed twice already).

Every other local computation in this file (`PayrollScenario` captação axis,
`TuitionScenario` revenue axis, local turmas/section calc, local salary/benefits/encargos
annualization, the standalone export) is a **duplicate of an already-governed shared
calculation**, not a genuinely missing capability. The refactor replaces the duplicate
with the shared source; it does not build anything new.

## Independent Payroll scenario defaults identified (to be removed)

1. `useState<PayrollScenario>("otimista")` — local captação axis.
2. `useState<TuitionScenario>("cen1")` — local revenue axis.
3. `useState<Record<string,string>>(defaultPayrollTiers)` — local educator-tier axis, edits a value the governed engine does not treat as variable.

## Duplicated headcount/calculation paths identified (to be removed)

1. `computeTurmasPerYear`/`TURMAS_SCHEDULE` — duplicates `calculateSectionCountsForScenario()`.
2. `getLeadFteForGrade()` MS/HS table — one of F06's three unreconciled sources; not promoted, retired from this view (replaced by an explicit F06-unavailable state for MS/HS grade-level rows).
3. `getAnnualRevenue`/`TUITION_ANNUAL`/`TUITION_GROWTH_RATE` — a second, non-governed revenue engine, fully disconnected from `calculateDre()`.
4. `buildPayrollProjection`/`buildScenarioComparison`/`buildScenarioMatrix` (`lib/payroll/domain.ts`) — the local aggregation layer over all of the above; retired from this file once the shared-engine view replaces it. **`lib/payroll` itself is not deleted** — `src/lib/viability/baseline.ts` still imports `PayrollScenario` for the separate, out-of-scope Viability Simulator; only this file's use of it is retired.
5. `downloadTenYearProjectionXlsx()` (`lib/payroll/exportXlsx.ts`) — a third export pathway; retired in favor of the existing `buildDreScenarioWorkbook()` (same one `DreExportButton.tsx`/the Fagundes Export Index already use).

## What replaces each

- Captação/org-design/opening-package/tuition selection → props from `dreSelections`
  (App.tsx), same pattern as V10-RC2 Gate 3's `ExecutiveOrgDesignTab` wiring.
- Instructional (EY/LS) headcount and cost → `calculateFopag(sharedInput).records`
  filtered by `roleId` pattern, identical to the V10-RC2.1 Gate 6 staffing-table script.
- Non-instructional headcount and cost → `calculateFopag(sharedInput).records`
  (leadership/backoffice/specialists), via the same records array, or
  `orgDesignHcTableAdapter.ts`'s `buildOrgDesignHcTable()`.
- MS/HS grade-level rows → explicitly `unavailable`, blocker `F06`, no hardcoded FTE
  table retained or displayed as fact.
- Revenue/margin/coverage → `calculateDre(sharedInput).byYear[year]`, `computed_uncertified`
  (same status as every other revenue figure in the app — not a new disclosure burden).
- Export → `buildDreScenarioWorkbook()` (existing, formula-preserving, already receives
  `vm.selections`).
- The "Compare" (3-scenario) and "Matrix" (9-cell) views, both built around the retired
  local axes, are repurposed to the shared axes they should have had: Compare →
  Minimum/Balanced/Premium org-design tiers via the already-existing
  `computeOrgDesignPayrollVariants()` (used by `dreScenarioWorkbook.ts`, not new code);
  Matrix → captação × org-design (3×3) via direct `calculateFopag`/`calculateDre` calls
  at the selected year, the same pattern the Gate 8 coverage-matrix generator already
  uses — not a new engine, just the existing engines called in a loop.
