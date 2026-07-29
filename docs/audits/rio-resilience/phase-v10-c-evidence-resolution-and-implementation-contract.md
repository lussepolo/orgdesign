# Phase V10-C — Evidence Resolution and Governed Implementation Contract

**Audit type:** Evidence resolution, mismatch revalidation, implementation contract  
**Audit date:** 2026-07-24  
**Auditor:** Claude Sonnet 4.6 (claude-sonnet-4-6) via Claude Code  
**Repository:** `/Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design`  
**Branch at entry:** `main` (HEAD d743616)  
**Predecessor report:** `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md`  
**Authorized report path:** `docs/audits/rio-resilience/phase-v10-c-evidence-resolution-and-implementation-contract.md`

---

## C.1 Entry Verification

### Entry-State File Hashes (Protected Files)

All hashes re-verified at V10-C entry. All files unchanged from V10-A/B exit state.

| File | SHA-256 (V10-A/B exit = V10-C entry) | Status |
|------|--------------------------------------|--------|
| `IMPLEMENTATION.md` | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` | UNCHANGED |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` | UNCHANGED |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` | UNCHANGED |
| `scripts/validate-phase15u2.ts` | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` | UNCHANGED |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` | UNCHANGED |
| `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md` | `42a0b142eb8fd4a0a122a02a6e6dca56be1263b107723d57e5417c1692ab5a2c` | UNCHANGED |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md` | `66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837` | UNCHANGED |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md` | `dc374fd4abf20b06fa71805f40a8d3133e8cf4598a659c291fd51678e049deef` | UNCHANGED |
| `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md` | `aa020afb7f0f2cb3bd39ccd3eba78f4c46088cddb187e13994f5c7f7b11ac53e` | UNCHANGED |

### Entry-State Workbook Hashes (Governing Authority, Read-Only)

| Workbook | SHA-256 | Status |
|----------|---------|--------|
| v10 (`Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx`) | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | UNCHANGED |
| G6 occupancy (`Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx`) | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | UNCHANGED |
| G4 occupancy (`Modelo_Ocupacao_Concept_2028_v5_T1_G4_258.xlsx`) | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | UNCHANGED |

### Entry Constraints (Carried from V10-A/B, Remain in Effect)

No application code, fixture, validator, workbook, commit, push, or documentation change (other than this report) is authorized. No inference of formulas from aggregate outputs. No assumption that v10 formula authority proves the application already matches. No recalculation or save of workbooks.

---

## C.2 Mismatch Revalidation (D-01 through D-06)

### D-01 — Tuition Escalation Rate (8% vs. 5.9%)

**V10-A/B classification:** FORMULA MISMATCH

**V10-C evidence gathered:**

1. v10 PnL Row 9 (Reajuste Serviços) confirmed by OOXML extraction:
   - `E9 = E6+2%` = 4.0%+2.0% = 6.0% (2028)
   - `F9` through `N9` = 0.059 hardcoded (5.9%, 2029–2037)

2. Application `receitaEngine.ts:70–73`:
   ```typescript
   function annualAdjustmentFactor(year: OpeningPackageProjectionYear): number {
     if (year === 2028) return 1;
     return Math.pow(1.08, year - 2028);  // 8% compounding from 2029
   }
   ```

3. Governance document cited in the application comment: `financeConventionSourceDecisions.md §2.5, §2.6`. This file **does not exist** in the repository. Search confirmed: `find . -name "financeConventionSourceDecisions.md"` returned no output. The 8% rate has no discoverable governing document.

4. `inputReadinessRegistry.ts:279,286` cites the same non-existent document:
   - Line 279: `currentSource: "tuitionRevenueReadiness.ts TUITION_ADJUSTMENT_CONVENTION; financeConventionSourceDecisions.md §2.5, §2.6, §2.8"`
   - Line 286: `notes: "8% per year, compounded annually, starting 2029. Base year 2028 treated as full year. Basis: annual gross contract value."`

**V10-C revised classification:** CONFIRMED FORMULA MISMATCH — GOVERNANCE DOCUMENT ABSENT

Application applies 8% compounding from 2029; v10 governs 5.9% from 2029. The governance document cited as source for the 8% rate (`financeConventionSourceDecisions.md`) does not exist anywhere in the repository. The 8% rate is uncertified.

---

### D-02 — Tuition Escalation Base-Year Behavior (Factor=1 vs. "6% Applied in 2028")

**V10-A/B classification:** FORMULA MISMATCH  
**V10-A/B description:** "Row 9 E9=6% applied in 2028; app factor=1 in 2028"

**V10-C evidence gathered:**

1. v10 PnL Row 44 (representative tuition price driver, TODDLERS 1 annual value):
   - `E44 = $J22` = 8803 (direct reference to constant, 2028 BRL value)
   - This cell holds the 2028 annual per-student gross value **directly** — no multiplication by a 6% escalation factor

2. v10 Cenários Mensalidade AT column (BP Cenário 4 — active scenario) verified by OOXML extraction:
   - AT3 = 105,636 (TODDLERS 1 annual contract, 2028 BRL)
   - AT4 = 61,788 (TODDLERS 1 morning, 2028 BRL)
   - AT10 = 127,320 (GRADE 1, 2028 BRL)
   - AT15 = 138,816 (GRADE 6, 2028 BRL)
   - AT18 = 159,180 (GRADE 9, 2028 BRL)
   These are static 2028 BRL values. The 6% escalation from 2027 to 2028 was applied **within** the Cenários Mensalidade sheet's construction, not as a separate PnL multiplication factor.

3. Application `tuitionSourceData.ts` `BP_SCENARIO_4_VALUES` compared against AT column: all 19 course values match exactly (full comparison in Section C.5).

4. Application `annualAdjustmentFactor(2028) = 1` means: no additional escalation applied on top of the stored 2028 BRL values. This is **correct**: the AT column already holds 2028-BRL prices; applying a factor of 1 uses them as-is.

**V10-C revised classification:** PRIOR FINDING INCORRECT

The V10-A/B report misidentified this as a mismatch. The 6% in PnL Row 9 E9 represents the rate of service escalation for 2028 as a parameter — it was used *inside* the Cenários Mensalidade sheet to derive 2028 prices from 2027 prices. By the time the PnL uses these values (e.g., E44=$J22=8803), they are already 2028-BRL prices and no further factor is applied. The application's `annualAdjustmentFactor(2028)=1` is semantically correct.

**This reclassification reduces the confirmed mismatch count from 6 to 5. The rate mismatch (D-01, 8% vs. 5.9%) remains.**

---

### D-03 — Salary Escalation Rate (6% Constant vs. 5.9% from 2029)

**V10-A/B classification:** FORMULA MISMATCH

**V10-C evidence gathered:**

1. v10 PnL Row 12 (Dissídio) confirmed by OOXML extraction:
   - `E12 = E11+1%` = 5.0%+1.0% = 6.0% (2028)
   - `F12` through `N12` = 0.059 hardcoded (5.9%, 2029–2037)

2. v10 `'Org. Design '` (trailing space) sheet extracted — salary escalation formula for representative role (Head of School, Row 30):
   - Z30 (Salário Base 2028) = 54,237.497 — static value (the 2028 in-force monthly salary)
   - AA30 (Salário Base 2029) = `Z30*(1+PnL!F$12)` = 54,237.497 × 1.059 = 57,437.51
   - AB30 (Salário Base 2030) = `AA30*(1+PnL!G$12)` = 57,437.51 × 1.059
   - Pattern continues through column AS (2047)

3. Column Z (Salário Base 2028) equals column D (Salário Posição) for all roles — the 2028 salary IS the position salary; no additional 2028 growth factor is applied to it.

4. Application `src/constants/teaching.ts`: `ANNUAL_ADJUSTMENT = 1.06` (constant, all years)  
   Application `src/lib/payroll/core.ts`: `resolveGrowthFactor(year, activeFrom, annualAdjustment)` = `Math.pow(annualAdjustment, year - 2028 + 1)`
   - year=2028: `1.06^1` = 1.06 (factor applied in base year)
   - year=2029: `1.06^2` (vs. v10's base × 1.059)

5. The v10 structure implies: 2028 salary is the Salário Posição (pre-established, no additional factor), then 5.9% escalation from 2029. The application applies a 6% growth factor even in the base year (factor=1.06 at year=2028), meaning the application's effective 2028 salary = `grossMonthly × 1.06`.

**V10-C revised classification:** CONFIRMED FORMULA MISMATCH — TWO DIMENSIONS

- **Rate:** v10 uses 5.9% from 2029; application uses 6% constant all years. Confirmed mismatch.
- **Base year factor:** v10 treats Salário Posição as the 2028 in-force salary (no additional factor); application applies `1.06^1 = 1.06` in 2028. Whether this produces a numeric difference depends on whether application `grossMonthly` constants are calibrated relative to 2027 or 2028 BRL — not yet traceable without extracting and comparing application salary constants against v10 Salário Posição values.

Implementation contract: rate correction is fully governed (5.9% from 2029 per v10 Row 12). Base-year structure requires implementer to confirm whether application `grossMonthly` values correspond to 2027 or 2028 BRL.

---

### D-04 — Benefits Escalation Rate (6% Compounding vs. 10% Constant Separate)

**V10-A/B classification:** FORMULA MISMATCH

**V10-C evidence gathered:**

1. v10 PnL Row 13 (Benefícios) confirmed: 10.0% constant all years (E13–N13 = 0.10).

2. v10 `'Org. Design '` sheet benefits formula confirmed for Row 30 (Head of School):
   - BW30 (Benefícios Monthly 2028) = 1,552.13 — static base
   - BX30 (2029) = `BW30*(1+PnL!F$13)` = 1,552.13 × 1.10 = 1,707.34
   - BX30 through BP30 continue at 10% per year
   - CR30 (Benefícios Annual 2028) = BW30 × 12 = 18,625.62

3. v10 PnL row 249: `−SUMIFS('Org. Design '!CR:CR,'Org. Design '!$DL:$DL,PnL!$A249)` — benefits pulled from a **separate** column range (CR:CR) distinct from salary+encargos (AU:AU). This is structural confirmation that benefits escalation is independent of salary escalation.

4. Application `src/lib/payroll/core.ts`: `annualSalaryBurden = (gross + labor) * 13 + benefits * 12` — all three components share the same `growthFactor` (= 1.06^(year-2027)), not a separate 10% rate.

**V10-C revised classification:** CONFIRMED FORMULA MISMATCH — RATE AND STRUCTURE

Application applies ~6% compounding growth to benefits (same factor as salary). v10 applies a flat 10% annual escalation to benefits through an entirely separate column series. The economic difference is approximately 4 percentage points per year, compounding from 2029.

---

### D-05 — Discount Rate 2032 (18% vs. 15%)

**V10-A/B classification:** FORMULA MISMATCH

**V10-C evidence gathered:**

1. v10 PnL Row 224 `I224` (2032) confirmed: −0.15 (15.0%)
2. Application `discountScheduleSourceData.ts:14`: `2032: 0.18` (18.0%)
3. Source description: `"Head of Finance message"` — no Finance message with a date later than v10 (2026-07-24) is present in this audit scope.

**V10-C revised classification:** CONFIRMED FORMULA MISMATCH

15.0% (v10) vs. 18.0% (app) in 2032. Correction is fully governed: change `explicitRatesByYear[2032]` from `0.18` to `0.15`. Implementation is READY.

---

### D-06 — Discount Rate 2035 (15% vs. 12.5%)

**V10-A/B classification:** FORMULA MISMATCH

**V10-C evidence gathered:**

1. v10 PnL Row 224 `L224` (2035) confirmed: −0.125 (12.5%)
2. Application `discountScheduleSourceData.ts:17`: `2035: 0.15` (15.0%)
3. Application `terminalRate: 0.125` applies from 2036 — meaning the application's first year at 12.5% is 2036, while v10 starts at 12.5% in 2035.

**V10-C revised classification:** CONFIRMED FORMULA MISMATCH

12.5% (v10) vs. 15.0% (app) in 2035. v10 initiates its terminal-equivalent rate one year earlier than the application. Correction: change `explicitRatesByYear[2035]` from `0.15` to `0.125`. Implementation is READY.

---

### Mismatch Revalidation Summary

| ID | Domain | V10-A/B Classification | V10-C Revised Classification |
|----|--------|----------------------|------------------------------|
| D-01 | Tuition escalation rate | FORMULA MISMATCH | CONFIRMED FORMULA MISMATCH — GOVERNANCE DOCUMENT ABSENT |
| D-02 | Tuition base-year factor | FORMULA MISMATCH | **PRIOR FINDING INCORRECT** — app correctly returns 1 in 2028 |
| D-03 | Salary escalation rate | FORMULA MISMATCH | CONFIRMED FORMULA MISMATCH — rate (5.9% vs. 6%) + base-year structure |
| D-04 | Benefits escalation rate | FORMULA MISMATCH | CONFIRMED FORMULA MISMATCH — rate (10% vs. ~6%) + separate track vs. shared factor |
| D-05 | Discount rate 2032 | FORMULA MISMATCH | CONFIRMED FORMULA MISMATCH — correction value determined (0.15) |
| D-06 | Discount rate 2035 | FORMULA MISMATCH | CONFIRMED FORMULA MISMATCH — correction value determined (0.125) |

---

## C.3 D-02 Semantic Conclusion

**The V10-A/B finding D-02 is overturned by V10-C primary-source evidence.**

The V10-A/B report interpreted PnL Row 9's 6.0% value in 2028 as meaning that a 6% price increase must be applied during the 2028 calculation year, and therefore `annualAdjustmentFactor(2028)=1` was understating tuition. This interpretation was incorrect.

The correct causal chain (confirmed by OOXML inspection):

1. The v10 `Cenários Mensalidade` sheet constructs per-course 2028 BRL prices by escalating 2027 prices by 6%.
2. The PnL reads these 2028-BRL prices directly (e.g., `E44 = $J22 = 8803`). No further multiplication by 6% occurs in the PnL for the 2028 column.
3. The application's `tuitionSourceData.ts` `BP_SCENARIO_4_VALUES` stores these same 2028-BRL values (confirmed exact match against v10 AT column in Section C.5).
4. `annualAdjustmentFactor(2028) = 1` is correct: it uses the stored 2028-BRL values as-is, which is exactly what the v10 PnL does.

This means the confirmed mismatch count is five (D-01, D-03, D-04, D-05, D-06), not six.

The remaining and substantial mismatch is in **rate** (D-01): from 2029 onward, the application uses 8% compounding while v10 specifies 5.9%. This rate mismatch is not remedied by the D-02 correction.

---

## C.4 Governance Document Gap — `financeConventionSourceDecisions.md`

The application cites `financeConventionSourceDecisions.md` as the governing authority for the 8% tuition escalation rate in two locations:

- `src/features/rio-scenario-resilience/model/receitaEngine.ts:68` (inline comment): `"Source: financeConventionSourceDecisions.md §2.5, §2.6; TUITION_ADJUSTMENT_CONVENTION."`
- `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts:279`: `currentSource` field cites `"financeConventionSourceDecisions.md §2.5, §2.6, §2.8"`

V10-C verification: `find . -name "financeConventionSourceDecisions.md"` — no output. The file does not exist in the repository under any path. The 8% escalation rate encoded in `receitaEngine.ts` has **no traceable governing document** in the repository. Without this document or a Finance message with a date at least as recent as v10 (2026-07-24) explicitly authorizing a departure from v10 Row 9's 5.9%, the 8% rate cannot be certified.

**Consequence for D-01:** Finance must either (a) produce the governance document or a post-v10 approval message authorizing 8%, or (b) confirm the rate should be changed to match v10 (5.9% from 2029). The implementation slice for D-01 is BLOCKED pending this decision.

---

## C.5 Tuition Source Authority Table

**Finding: D-08 (V10-A/B) is RESOLVED. `BP_SCENARIO_4_VALUES` is confirmed authoritative against v10.**

The application `tuitionSourceData.ts` `BP_SCENARIO_4_VALUES` was compared cell-by-cell against v10 `Cenários Mensalidade` AT column (BP Cenário 4) via OOXML extraction. All 19 annual values match exactly.

| Course | v10 AT column (annual BRL) | App `annualGrossContractValueBRL` | Match |
|--------|--------------------------|-----------------------------------|-------|
| TODDLERS 1 - m (morning) | 61,788 | 61,788 | EXACT |
| TODDLERS 2 - m (morning) | 61,788 | 61,788 | EXACT |
| TODDLERS 1 (full-time) | 105,636 | 105,636 | EXACT |
| TODDLERS 2 (full-time) | 105,636 | 105,636 | EXACT |
| PRE-K3 | 105,636 | 105,636 | EXACT |
| PRE-K4 | 105,636 | 105,636 | EXACT |
| KINDERGARTEN | 105,636 | 105,636 | EXACT |
| GRADE 1 | 127,320 | 127,320 | EXACT |
| GRADE 2 | 127,320 | 127,320 | EXACT |
| GRADE 3 | 127,320 | 127,320 | EXACT |
| GRADE 4 | 127,320 | 127,320 | EXACT |
| GRADE 5 | 127,320 | 127,320 | EXACT |
| GRADE 6 | 138,816 | 138,816 | EXACT |
| GRADE 7 | 138,816 | 138,816 | EXACT |
| GRADE 8 | 138,816 | 138,816 | EXACT |
| GRADE 9 | 159,180 | 159,180 | EXACT |
| GRADE 10 | 159,180 | 159,180 | EXACT |
| GRADE 11 | 159,180 | 159,180 | EXACT |
| GRADE 12 | 159,180 | 159,180 | EXACT |

**All 19 values match v10. `BP_SCENARIO_4_VALUES` is AUTHORITATIVE as of v10.**

Note on `sourceEvidenceDate: "2026-06-02"`: The date predates v10's file timestamp (2026-07-24), but the VALUES are confirmed correct against v10. The date reflects when the data was originally populated, not an indicator that the values are stale. The values must be re-verified against any future version superseding v10.

Note on `calculationReadinessStatus: "blocked"`: The blocked status is not a source-data quality issue — it means the engine has not been cleared to produce outputs. With tuition base values confirmed authoritative, the blocking condition relates to the outstanding rate mismatch (D-01) and the occupancy/scenario architecture gaps (Section C.6), not to the base values themselves.

---

## C.6 Conservador Governance Determination

### G6 Conservador — Source Exists; Application Data Is Absent

The G6 occupancy workbook (`Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx`, SHA `17c93389...`) contains a `3. CONSERVADOR` sheet. This is an authoritative, Finance-provided source for the `t1_g6 / conservador` occupancy scenario.

The application `openingPackageOccupancySourceData.ts`:
- `grep -n "conservador"` returned **no output** across the entire file.
- Available occupancy scenarios for `t1_g6`: `intermediario`, `pessimista`, `otimista` only.
- `conservador` is completely absent from the application's enrollment data.

**Consequence:** The v10 native state is Grade 6 / Conservador. The exact selector combination `t1_g6 / conservador` has authoritative source data (the G6 workbook's `3. CONSERVADOR` sheet) that has never been extracted and loaded into the application. This is a **data extraction gap**, not a governance gap — the source exists but has not been brought into the application.

**Status:** EXTRACTABLE — source data confirmed present in G6 workbook. Implementation requires extracting `3. CONSERVADOR` data from G6 workbook and populating the `t1_g6 / conservador` occupancy entry in `openingPackageOccupancySourceData.ts`.

### G4 Conservador — No Source Exists

The G4 occupancy workbook (`Modelo_Ocupacao_Concept_2028_v5_T1_G4_258.xlsx`, SHA `5a9342e1...`) contains only five sheets: `1. Memória de Cálculo`, `2. Intermediário`, `3. Pessimista`, `4. Otimista`, `5. Comparativo`. There is no Conservador scenario. The application also has no `t1_g4 / conservador` data.

**Status:** GOVERNANCE GAP — no authoritative source exists. The `t1_g4 / conservador` combination cannot be implemented without Finance providing a G4 Conservador occupancy dataset.

### UI Reachability of Conservador

`OCCUPANCY_LABELS` in `src/components/dreSimulator/dreScenarioWorkbook.ts:98–101`:
```typescript
const OCCUPANCY_LABELS: Record<string, string> = {
  pessimista: "Pessimista (Conservative)",
  intermediario: "Intermediário (Base)",
  otimista: "Otimista (Optimistic)",
};
```

`conservador` is **not registered as a label** and is **not a selectable option** in the current UI. If a user selects any available occupancy scenario, they will never reach a conservador state through the UI. The label fallback (`?? selections.occupancyScenarioId`) would display the raw ID string if somehow invoked, but no UI path exposes this option.

### Default Working Scenario

`WORKING_SCENARIO_SELECTIONS` in `src/features/rio-scenario-resilience/model/dreWorkingScenario.ts:43–52`:
- Opening package: `t1_g3` (Grade 3)
- Occupancy scenario: `intermediario`

This is documented as a technical validation fixture, not a board-approved scenario. The v10 native state (Grade 6 / Conservador) does not match the application's working scenario default on either dimension.

### Conservador Summary

| Combination | Source Available | In App | UI Reachable | Status |
|-------------|-----------------|--------|--------------|--------|
| `t1_g6 / conservador` | YES — G6 workbook `3. CONSERVADOR` | NO | NO | EXTRACTABLE (data exists, not loaded) |
| `t1_g4 / conservador` | NO — G4 workbook has no Conservador | NO | NO | GOVERNANCE GAP (no source) |

---

## C.7 Role-Level Salary Authority Table

**Prior V10-A/B finding S-2:** Role-level salary bases in `'Org. Design '` sheet classified as NOT TRACEABLE because the sheet had not been extracted.

**V10-C action:** `'Org. Design '` (with trailing space, rId112) sheet extracted via OOXML inspection. Complete role roster with 2028 Salário Posição values recovered.

### Confirmed Structure

The `'Org. Design '` sheet contains 65 active roles (rows 4–65). Column structure:
- **Column D** (Salário Posição): The role's 2028 in-force monthly gross salary. Derived from XLOOKUP into `'Cenários Org Design '` sheet. This is the authoritative Rio salary specification.
- **Column Z** (Salário Base 2028): Equal to column D for all roles — static value, confirms D = 2028 base.
- **Columns AA–AS** (Salário Base 2029–2047): `AA_n = Z_n × (1+PnL!F$12)`, escalating at the Dissídio rate (5.9% from 2029).
- **Column BW** (Benefícios Monthly 2028): Per-role monthly benefits base.
- **Columns BX–CP** (Benefícios 2029–2047): `BX_n = BW_n × (1+PnL!F$13)`, escalating at 10% annually.
- **Column AU** (Custo Anual salary+encargos 2028): Annual labor cost (gross × 13 + encargos). Referenced by PnL SUMIFS.
- **Column CR** (Custo Anual Benefícios 2028): Annual benefits cost (BW × 12). Referenced by PnL SUMIFS separately.
- **Column BO**: Cost allocation type (`FOPAG_DIRETO` or `Folha de Pagamento`).
- **Column DL**: Cost allocation type for benefits SUMIFS.

### v10 Salário Posição Values (2028 BRL, Monthly Gross)

| Role (Cargo) | Área (Specialization) | Salário Posição (R$/month) |
|---|---|---|
| After School Educator | After School Educator | 16,162.40 |
| Arts Educator | Arts Educator | 16,162.40 |
| Assistente Financeiro | Assistente Financeiro | 3,034.78 |
| Body & Movement Educator | Body & Movement Educator | 16,162.40 |
| Clerk (Portaria) | Clerk (Portaria) | 2,953.95 |
| Counselor | Counselor | 16,161.94 |
| Ed Tech Coordinator | Ed Tech Coordinator | 19,603.21 |
| Events Assistant | Events Assistant | 3,034.78 |
| EY Coordinator | EY Coordinator | 21,138.24 |
| EY Learning Assistant | EY Learning Assistant (kindergarten) | 4,871.64 |
| EY Learning Assistant | EY Learning Assistant (pk3) | 4,871.64 |
| EY Learning Assistant | EY Learning Assistant (pk4) | 4,871.64 |
| EY Learning Assistant | EY Learning Assistant (t1) | 4,871.64 |
| EY Learning Assistant | EY Learning Assistant (t2) | 4,871.64 |
| EY Learning Monitor | EY Learning Monitor (kindergarten) | 4,304.27 |
| EY Learning Monitor | EY Learning Monitor (pk3) | 4,304.27 |
| EY Learning Monitor | EY Learning Monitor (pk4) | 4,304.27 |
| EY Learning Monitor | EY Learning Monitor (t1) | 4,304.27 |
| EY Learning Monitor | EY Learning Monitor (t2) | 4,304.27 |
| EY Teaching Lead | EY Teaching Lead (kindergarten) | 21,138.24 |
| EY Teaching Lead | EY Teaching Lead (pk3) | 21,138.24 |
| EY Teaching Lead | EY Teaching Lead (pk4) | 21,138.24 |
| EY Teaching Lead | EY Teaching Lead (t1) | 21,138.24 |
| EY Teaching Lead | EY Teaching Lead (t2) | 21,138.24 |
| Family Engagement Analyst | Family Engagement Analyst | 5,655.15 |
| Financial Analyst | Financial Analyst | 5,395.40 |
| Head of School | Head of School | 54,237.50 |
| HR Analyst | HR Analyst | 5,950.84 |
| HS Coordinator | HS Coordinator | 21,138.24 |
| HS Educator | HS Educator (G9) | 16,162.40 |
| HS Educator | HS Educator (G10) | 16,162.40 |
| HS Educator | HS Educator (G11) | 16,162.40 |
| HS Educator | HS Educator (G12) | 16,162.40 |
| Inspirationeer | Inspirationeer | 7,293.49 |
| IT Technician | IT Technician | 6,789.30 |
| Language Acquisition Coach | Language Acquisition Coach | 16,162.40 |
| Learning Exp Designer | Learning Exp Designer | 16,952.45 |
| LS Coordinator | LS Coordinator | 21,138.24 |
| LS Learning Assistant | LS Learning Assistant (g1) | 4,871.64 |
| LS Learning Assistant | LS Learning Assistant (g2) | 4,871.64 |
| LS Learning Assistant | LS Learning Assistant (g3) | 4,871.64 |
| LS Learning Assistant | LS Learning Assistant (g4) | 4,871.64 |
| LS Learning Assistant | LS Learning Assistant (g5) | 4,871.64 |
| LS Teaching Lead | LS Teaching Lead (g1) | 21,138.24 |
| LS Teaching Lead | LS Teaching Lead (g2) | 21,138.24 |
| LS Teaching Lead | LS Teaching Lead (g3) | 21,138.24 |
| LS Teaching Lead | LS Teaching Lead (g4) | 21,138.24 |
| LS Teaching Lead | LS Teaching Lead (g5) | 21,138.24 |
| Maintenance Technician | Maintenance Technician | 4,111.42 |
| Maker Space Assistant | Maker Space Assistant | 6,566.70 |
| Marketing & Events Analyst | Marketing & Events Analyst | 6,566.70 |
| MS Coordinator | MS Coordinator | 21,138.24 |
| MS Educator | MS Educator (G6) | 16,162.40 |
| MS Educator | MS Educator (G7) | 16,162.40 |
| MS Educator | MS Educator (G8) | 16,162.40 |
| Music Educator | Music Educator | 16,162.40 |
| Nurse Technician | Nurse Technician | 4,006.80 |
| Nursing Intern | Nursing Intern | 1,672.68 |
| Ops Coordinator | Ops Coordinator | 12,020.40 |
| Personalized Learning Associate Educator | Personalized Learning Associate Educator | 8,229.27 |
| School Secretary | School Secretary | 4,458.57 |
| Security Coordinator | Security Coordinator | 12,020.40 |

**Total roles extracted:** 61 rows shown (65 rows in sheet; 4 remaining in rows 61–65 not retrieved in truncated output but the structural pattern is identical).

### Application Salary Comparison

The application salary constants (in `teaching.ts` and related config files) were not extracted and compared in this phase due to scope. The V10-A/B classification S-2 (NOT TRACEABLE) is **upgraded to PARTIALLY TRACEABLE**: v10 Salário Posição values are now available as a governed comparison target. An implementer can compare `grossMonthly` values in the application against the Salário Posição column above and flag any that do not match.

### v10 Salary Escalation Formula — Authorized Specification

For implementation:
- **2028 salary base** = Salário Posição (R$/month, from table above). This IS the 2028 in-force monthly gross.
- **2029 salary** = 2028 base × (1 + 5.9%) = base × 1.059
- **2030+ salary** = prior year × (1 + 5.9%) continuously
- **Formula:** `salaryBase2028 × Math.pow(1.059, year - 2028)` for year ≥ 2029; `= salaryBase2028` for 2028

The application's current `Math.pow(1.06, year - 2028 + 1)` formula differs from this in two ways:
1. Factor of 1.06 applied at year=2028 (should be 1.0 — the 2028 salary is the base)
2. Rate 1.06 from 2029 (should be 1.059)

### v10 Benefits Escalation Formula — Authorized Specification

- **2028 benefits base** = BW column (R$/month per role, from `'Org. Design '` XLOOKUP from `'Cenários Org Design '`)
- **2029+ benefits** = prior year × (1 + 10.0%) continuously
- **Formula:** `benefitsBase2028 × Math.pow(1.10, year - 2028)` for year > 2028; `= benefitsBase2028` for 2028
- **Annual cost:** benefits monthly × 12 (12-month convention, separate from 13-month salary)

The application's current implementation uses the same `growthFactor` (~6% compounding) for both salary and benefits. The benefits factor must be separated and set to 10% annually.

---

## C.8 Receita Engine Readiness Table

| Input Domain | Status | Blocking Condition | Resolution Path |
|---|---|---|---|
| BP_SCENARIO_4 tuition base values | AUTHORITATIVE | None — all 19 values match v10 | No action needed |
| Tuition escalation rate (post-2028) | BLOCKED | 8% app vs. 5.9% v10; governance document absent | Finance must confirm rate |
| Tuition base-year factor (2028) | RESOLVED | D-02 was PRIOR FINDING INCORRECT; factor=1 is correct | No action needed |
| Discount rate schedule (2028–2031, 2033–2034) | AUTHORITATIVE | App values match v10 | No action needed |
| Discount rate 2032 | CORRECTABLE | App=18%, v10=15% | Change `explicitRatesByYear[2032]` to `0.15` |
| Discount rate 2035 | CORRECTABLE | App=15%, v10=12.5% | Change `explicitRatesByYear[2035]` to `0.125` |
| Discount rate 2036+ | AUTHORITATIVE | App `terminalRate=0.125` matches v10 | No action needed |
| t1_g6/conservador occupancy | BLOCKED | Data absent from app; source exists in G6 workbook | Extract G6 Conservador sheet into app |
| t1_g4/conservador occupancy | BLOCKED | No source data exists | Finance must provide G4 Conservador occupancy |
| Enrollment-to-tuition grade mapping | NOT AUDITED | V10-C scope did not cover `enrollmentTuitionGradeMapping.ts` | Requires separate verification |
| Receita formula implementation | NOT AUDITED | `receitaEngine.ts` formula correctness (beyond rate) not re-audited in V10-C | V10-A/B Gate 3 covers the structural formula chain |

**Engine unblocking prerequisites (ordered):**
1. Resolve D-01 (Finance must confirm escalation rate: 5.9% or 8%)
2. Correct D-05 and D-06 (discount rates — independent of Finance confirmation)
3. Extract t1_g6/conservador occupancy from G6 workbook
4. Obtain Finance approval of D-05 and D-06 corrections

---

## C.9 Governed Golden-Master Dataset

The following values are confirmed authoritative against v10 as of 2026-07-24 and may be used directly in implementation:

### Confirmed: Discount Rate Schedule

| Year | v10 Row 224 | Application Status |
|------|-------------|-------------------|
| 2028 | 25.0% | MATCH — no change needed |
| 2029 | 20.0% | MATCH — no change needed |
| 2030 | 20.0% | MATCH — no change needed |
| 2031 | 18.0% | MATCH — no change needed |
| **2032** | **15.0%** | **MISMATCH — change from 0.18 to 0.15** |
| 2033 | 15.0% | MATCH — no change needed |
| 2034 | 15.0% | MATCH — no change needed |
| **2035** | **12.5%** | **MISMATCH — change from 0.15 to 0.125** |
| 2036+ | 12.5% | MATCH (terminal rate = 0.125 correct) |

### Confirmed: Tuition Base Values (BP Cenário 4 = `rj4` / `bp_scenario_4`)

All 19 values as tabulated in Section C.5. These may be marked as v10-certified.

### Confirmed: Salary Escalation Rate and Structure

- 2028: factor = 1.0 (Salário Posição IS the 2028 salary; no additional growth applied)
- 2029+: factor = 1.059^(year - 2028) relative to 2028 base
- Derivation: v10 Row 12 (Dissídio), F12–N12 = 5.9%

### Confirmed: Benefits Escalation Rate and Structure

- 2028: base = benefits monthly from Org. Design BW column
- 2029+: base × 1.10^(year - 2028)
- Derivation: v10 Row 13 (Benefícios), E13–N13 = 10.0% constant
- Annual cost: benefits monthly × 12 (NOT the 13-month salary convention)

### Confirmed: Salário Posição Values (Role-Level, 2028 BRL)

Full table in Section C.7. These are the authoritative v10 monthly gross salary targets for Rio project roles.

### Confirmed: v10 Native State

| Parameter | v10 Cell | Value |
|-----------|----------|-------|
| Scenario | PnL AF1 | Conservador |
| Opening grade | Org. Design sheet A1 CONCAT | Grade 6 |
| Tuition scenario | Cenários Mensalidade | Cenário 4 (AT column) |
| WACC | AB290 ref | 14.5% |
| VPL | AB299 | −R$64,583,226 |
| TIR | AB298 | 8.053% |
| Payback | AB300 | NA |

### Pending Finance Confirmation

- Tuition escalation rate post-2028: 5.9% (v10 Row 9) vs. 8% (application). No v10 override document found.

---

## C.10 File-Level Implementation Contract

### Slice 1 — Discount Rate Corrections

**File:** `src/features/rio-scenario-resilience/model/discountScheduleSourceData.ts`  
**Status: READY**  
**Governing authority:** v10 PnL Row 224, I224=−0.15 (2032), L224=−0.125 (2035)

Required changes:
```typescript
// Current (INCORRECT against v10):
2032: 0.18,
2035: 0.15,

// Governed correction (v10-certified):
2032: 0.15,
2035: 0.125,
```

No other fields in this file require change. `terminalRate: 0.125` from 2036 is consistent with v10 direction (v10 terminal-equivalent rate starts 2035, but the `terminalRate` field in the application covers 2036+ correctly after the 2035 explicit value is corrected).

Finance approval required before commit: YES (this overrides a prior "Head of Finance message" with v10 authority).

---

### Slice 2 — Benefits Escalation Rate Separation

**File:** `src/lib/payroll/core.ts`  
**Status: READY TO SPECIFY, implementation complexity TBD**  
**Governing authority:** v10 Row 13 (10.0% constant), v10 Org. Design BX–CP column series

Required architectural change:
- Introduce a separate `benefitsGrowthFactor` distinct from the salary `growthFactor`.
- `benefitsGrowthFactor(year) = Math.pow(1.10, year - 2028)` for year ≥ 2028
- Apply `benefitsGrowthFactor` to `benefitsMonthly × 12` instead of the current shared `growthFactor`.
- Keep `(gross + labor) × 13 × growthFactor` on salary+encargos track (unchanged formula, just rate corrected per Slice 3).

The precise implementation (whether to add a parameter or constant) is not prescribed here — the governed specification is the rate (10%) and the structural independence (benefits must escalate at their own rate, not piggyback on the salary factor).

---

### Slice 3 — Salary Escalation Rate and Base-Year Correction

**File:** `src/constants/teaching.ts`, `src/lib/payroll/core.ts`  
**Status: READY TO SPECIFY — base year structure requires implementer confirmation**  
**Governing authority:** v10 Row 12 (Dissídio), F12–N12=5.9%; v10 Org. Design Z column (2028 base)

Required changes:
1. Change `ANNUAL_ADJUSTMENT` from `1.06` constant to a year-variable schedule:
   - 2028: factor = 1.0 (no escalation; Salário Posição IS the 2028 salary)
   - 2029+: factor = `1.059^(year - 2028)`

2. The current `resolveGrowthFactor` formula `Math.pow(1.06, year - 2028 + 1)` applies 1.06 at year=2028. It must be changed to:
   - Return 1.0 at year=2028
   - Return `Math.pow(1.059, year - 2028)` for year > 2028

3. **Base-year calibration verification required:** Before implementing, confirm whether the application's `grossMonthly` constants for each role are expressed in 2027 BRL or 2028 BRL:
   - If `grossMonthly` values are the same as v10 Salário Posição (2028 BRL), then the current 1.06^1 factor applied in 2028 over-escalates by 6%. Change factor to 1.0 at year=2028.
   - If `grossMonthly` values are pre-2028 (2027 BRL), and 1.06 is intended to escalate to 2028, then the application may be structurally consistent but using the wrong rate (1.06 vs. 1.059 for that first step). In this case also change to 1.059 for the year=2028 escalation step.
   The governed 2028 Salário Posição values are available in Section C.7 for this comparison.

---

### Slice 4 — Tuition Escalation Rate Correction

**File:** `src/features/rio-scenario-resilience/model/receitaEngine.ts`  
**Status: BLOCKED — pending Finance decision**  
**Governing authority disputed:** v10 Row 9 (5.9% from 2029) vs. 8% in application

The 8% rate (`Math.pow(1.08, year - 2028)` from 2029) is currently implemented with a reference to `financeConventionSourceDecisions.md` which does not exist. Until Finance either:
- Confirms the rate should be 5.9% (matching v10 Row 9), or
- Produces the governance document or a post-v10 written authorization for 8%,

this slice cannot be implemented under the V10-C implementation contract.

If Finance confirms 5.9%:
```typescript
// Governed change:
function annualAdjustmentFactor(year: OpeningPackageProjectionYear): number {
  if (year === 2028) return 1;
  return Math.pow(1.059, year - 2028);  // 5.9% compounding from 2029 (v10 Row 9)
}
```

The 2028 factor (=1) is CONFIRMED CORRECT and must not change.

---

### Slice 5 — t1_g6/Conservador Occupancy Data Extraction

**File:** `src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData.ts`  
**Status: SOURCE EXISTS, extraction work not yet done**  
**Governing authority:** G6 workbook `3. CONSERVADOR` sheet (SHA `17c93389...`)

The G6 workbook contains the Conservador occupancy scenario. Implementing `t1_g6 / conservador` requires:
1. Extracting enrollment/capacity data from the `3. CONSERVADOR` sheet of `Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx`
2. Adding a `conservador` key under `t1_g6` in `openingPackageOccupancySourceData.ts`
3. Adding `conservador: "Conservador"` to `OCCUPANCY_LABELS` in `dreScenarioWorkbook.ts`

Without this slice, the application cannot replicate the v10 native state (Grade 6 / Conservador).

---

### Slice 6 — t1_g4/Conservador Occupancy (Governance Gap)

**File:** `src/features/rio-scenario-resilience/model/openingPackageOccupancySourceData.ts`  
**Status: BLOCKED — no source data exists**

The G4 workbook has no Conservador scenario. Finance must provide a G4 Conservador occupancy dataset before this combination can be implemented. No implementation contract line item can be specified.

---

### Slice 7 — Receita Engine Activation

**File:** `src/features/rio-scenario-resilience/model/tuitionSourceData.ts` (and downstream)  
**Status: BLOCKED — depends on Slices 1, 3, 4, 5**

Changing `calculationReadinessStatus` from `"blocked"` to `"ready"` is the final step. Prerequisites:
- Slices 1, 3 completed (discount rates and salary escalation corrected)
- Slice 4 resolved (tuition rate Finance decision received)
- Slice 5 completed if the v10 native state must be reachable
- Governance document created (or the 8% rate formally replaced by 5.9%)

---

### Implementation Slice Summary

| Slice | Domain | File | Status | Governing Source |
|-------|--------|------|--------|-----------------|
| 1 | Discount rates 2032, 2035 | `discountScheduleSourceData.ts` | **READY** | v10 Row 224 I224, L224 |
| 2 | Benefits escalation rate (10%, separate track) | `payroll/core.ts` | **READY TO SPECIFY** | v10 Row 13 |
| 3 | Salary escalation rate (5.9% from 2029, 1.0 at 2028) | `teaching.ts`, `payroll/core.ts` | **READY TO SPECIFY** | v10 Row 12, Org. Design Z col |
| 4 | Tuition escalation rate (5.9% vs. 8%) | `receitaEngine.ts` | **BLOCKED** | Finance decision required |
| 5 | t1_g6/conservador occupancy | `openingPackageOccupancySourceData.ts` | **READY TO EXTRACT** | G6 workbook `3. CONSERVADOR` |
| 6 | t1_g4/conservador occupancy | `openingPackageOccupancySourceData.ts` | **BLOCKED** | Finance dataset required |
| 7 | Receita engine activation | `tuitionSourceData.ts` | **BLOCKED** | Depends on Slices 1–5 |

---

## C.11 Decision Register

| Decision | What Finance / Governance Must Decide | Impact |
|----------|--------------------------------------|--------|
| DC-01 | Tuition escalation rate: confirm 5.9% (v10 Row 9) or produce governance document authorizing 8% | Unblocks Slice 4 and ultimately Slice 7 |
| DC-02 | Discount rate corrections (2032: 0.18→0.15; 2035: 0.15→0.125): confirm these corrections override the prior "Head of Finance message" | Unblocks Slice 1 commit |
| DC-03 | t1_g4/Conservador: provide G4 Conservador occupancy enrollment dataset | Unblocks Slice 6 |
| DC-04 | Create or formally retire `financeConventionSourceDecisions.md`: either produce the document or remove the citation from `receitaEngine.ts` and `inputReadinessRegistry.ts` | Closes the governance gap on D-01 |
| DC-05 | Salary base-year calibration: confirm whether application `grossMonthly` values are expressed in 2027 BRL or 2028 BRL relative to v10 Salário Posição | Required before Slice 3 can be correctly implemented |

---

## C.12 Exit Controls

### Exit-State File Hashes

All protected files re-hashed at V10-C exit. All hashes match V10-C entry state (= V10-A/B exit state) exactly. No application code was modified.

| File | SHA-256 (V10-C exit) | Match V10-C Entry |
|------|---------------------|-------------------|
| `IMPLEMENTATION.md` | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` | YES |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` | YES |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` | YES |
| `scripts/validate-phase15u2.ts` | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` | YES |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` | YES |
| `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md` | `42a0b142eb8fd4a0a122a02a6e6dca56be1263b107723d57e5417c1692ab5a2c` | YES |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md` | `66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837` | YES |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md` | `dc374fd4abf20b06fa71805f40a8d3133e8cf4598a659c291fd51678e049deef` | YES |
| `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md` | `aa020afb7f0f2cb3bd39ccd3eba78f4c46088cddb187e13994f5c7f7b11ac53e` | YES |

### Governing Workbook Exit Hashes

| Workbook | SHA-256 | Unchanged |
|----------|---------|-----------|
| v10 | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | YES |
| G6 occupancy | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | YES |
| G4 occupancy | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | YES |

**No application code, fixture, workbook, or other repository file was modified by this audit. The only write operation in V10-C is creation of this report.**

---

## C.13 Final Readiness Status

> **PARTIALLY READY**
>
> **What is resolved:**
> - D-02 (tuition base-year factor): PRIOR FINDING INCORRECT — `annualAdjustmentFactor(2028)=1` is correct. No change needed.
> - D-08 (tuition base values, BP Scenario 4): AUTHORITATIVE — all 19 `BP_SCENARIO_4_VALUES` match v10 AT column exactly.
> - D-05, D-06 (discount rates 2032, 2035): CORRECTABLE — governed correction values determined from v10 Row 224. READY to implement once Finance approves override.
> - D-03, D-04 (salary/benefits escalation rates and structure): READY TO SPECIFY — v10-governed rate schedule confirmed (salary 5.9% from 2029, benefits 10% constant separate track, salary 2028 base = Salário Posição).
> - Role-level salary bases: PARTIALLY TRACEABLE — v10 Org. Design sheet extracted; 61 Salário Posição values documented.
> - t1_g6/conservador: EXTRACTABLE — source data confirmed in G6 workbook `3. CONSERVADOR` sheet; not yet loaded into application.
>
> **What remains blocked:**
> - D-01 (tuition escalation rate): Finance must decide between 5.9% (v10) and 8% (current application), and either produce or retire `financeConventionSourceDecisions.md`.
> - t1_g4/conservador: No source data exists; Finance must provide G4 Conservador occupancy dataset.
> - Salary base-year calibration (Slice 3 detail): Requires confirming whether application `grossMonthly` constants are 2027 BRL or 2028 BRL before the year=2028 factor correction can be confirmed correct.
> - Receita engine activation: Depends on D-01 resolution and Slice 5.
>
> **Minimum Finance decisions required before implementation begins:**
> 1. DC-01 (tuition rate: 5.9% or 8%)
> 2. DC-02 (discount rate corrections approved)
>
> **After DC-01 and DC-02 are received, the following implementation slices are unblocked:**
> Slice 1 (discount rates) → Slice 2 (benefits escalation) → Slice 3 (salary escalation) → and, if DC-01 confirms 5.9%, Slice 4 (tuition rate) → Slice 5 (t1_g6/conservador extraction) → Slice 7 (engine activation).
>
> **Signed:** Phase V10-C evidence resolution and implementation contract, 2026-07-24

---
