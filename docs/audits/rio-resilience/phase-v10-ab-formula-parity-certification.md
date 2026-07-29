# Phase V10-A/B — Source Freeze and Formula & Output Parity Certification

**Audit type:** Forensic, read-only parity certification  
**Audit date:** 2026-07-24  
**Auditor:** Claude Sonnet 4.6 (claude-sonnet-4-6) via Claude Code  
**Repository:** `/Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design`  
**Branch at entry:** `main` (HEAD d743616)  
**Authorized report path:** `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md`

---

## 7.1 Report Preamble

### Governing Authority

The v10 workbook is the sole authoritative financial model for all formula and output parity claims in this audit. No prior version, memo, or in-application comment overrides v10 unless an explicit Finance message with a later date is presented and traceable.

### Governing Workbooks (SHA-256, read-only, never modified)

| Workbook | Path | SHA-256 | Size | Modified |
|----------|------|---------|------|----------|
| v10 financial model | `/Users/lucianapolonen/Downloads/Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx` | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | 6,643,715 B | 2026-07-24 11:30 |
| G6 occupancy | `/Users/lucianapolonen/Downloads/Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx` | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | 41,259 B | 2026-07-24 09:39 |
| G4 occupancy | `/Users/lucianapolonen/Downloads/Modelo_Ocupacao_Concept_2028_v5_T1_G4_258.xlsx` | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | 34,075 B | 2026-07-02 11:41 |

**G4 workbook governance gap:** G4 contains only three occupancy scenarios — `Pessimista`, `Intermediário`, `Otimista`. There is no `Conservador` scenario in G4. Any application path combining opening package `t1_g4` with occupancy scenario `conservador` has no authoritative source in the provided workbooks.

### Protected Repository Files — Entry-State Hashes

All hashes were recorded at audit entry and re-verified at audit exit. All files are unchanged.

| File | SHA-256 (entry = exit) |
|------|----------------------|
| `IMPLEMENTATION.md` | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` |
| `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md` | `42a0b142eb8fd4a0a122a02a6e6dca56be1263b107723d57e5417c1692ab5a2c` |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md` | `66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837` |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md` | `dc374fd4abf20b06fa71805f40a8d3133e8cf4598a659c291fd51678e049deef` |
| `scripts/validate-phase15u2.ts` | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` |

### Entry Git State (snapshot, not modified by this audit)

```
M  IMPLEMENTATION.md                                                    (staged)
 M src/components/dreSimulator/dreScenarioWorkbook.ts                   (unstaged)
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts (unstaged)
?? docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md
?? docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md
?? docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md
?? scripts/validate-phase15u2.ts
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts
```

---

## 7.2 Gate Execution Log

### GATE 0 — Identity and Preservation

**Status: PASS**

All three workbooks hashed and recorded before any inspection. Entry git state captured. Protected file list established. Authorized report path confirmed absent at entry — creation permitted. No repository mutations performed.

### GATE 1 — Source Freeze and Structural Inventory

**Status: PASS with governance gap**

**v10 workbook structure:**
- 157 sheets total: 4 visible, 153 hidden
- Visible: `PnL PPT`, `Resumos PPT`, `PnL`, `Cenários Receita`, `Cenários Mensalidade`, `Cenários Org Design ` (trailing space), `PPE`, `Org. Design ` (trailing space), `Corporativo BU`, `Rateio BU`, `Recuperação de Prejuízos`, `Pré-Ops`, `Bench SP 2025`, `Cap1–Cap8`
- Hidden with formula authority: `Folha de Pagamento` (payroll benchmark, rId35), `Org. Design` (no space, rId68), `CAPEX` (rId82), `Depreciação`, `Listas`
- **Duplicate-name risk identified:** `'Resumo'` (id=114) vs `'Resumo '` (id=154, trailing space); `'Org. Design'` (id=64) vs `'Org. Design '` (id=112, trailing space). PnL formula references use `'Org. Design '` (with trailing space) for SUMIFS salary lookups. Any formula editor autocomplete that resolves to the no-space variant would silently reference a different sheet.

**G6 workbook structure:** 6 visible sheets — `1. Memória de Cálculo`, `2. PESSIMISTA`, `3. CONSERVADOR`, `4. INTERMEDIÁRIO`, `5. OTIMISTA`, `6. Comparativo`. All data cells are static values. No formulas in enrollment/capacity/occupancy data cells.

**G4 workbook structure:** 5 visible sheets — `1. Memória de Cálculo`, `2. Intermediário`, `3. Pessimista`, `4. Otimista`, `5. Comparativo`. All data cells are static values. **No Conservador scenario.**

**G4 internal discrepancy noted:** Row 31 (computed TOTAL ALUNOS) diverges from Row 32 (Referência fornecida) from 2029 onward. Governance question unresolved — neither figure has been designated authoritative in writing. Recorded, not resolved.

### GATE 2 — Scenario and State Register

**Status: PASS**

**v10 native state (extracted from live workbook cells, not inferred from display):**

| Parameter | v10 Cell | Value |
|-----------|----------|-------|
| Selector cell | `AF1` (PnL) | `Conservador` |
| Opening grade | `Cenários Org Design ` sheet | Grade 6 (from CAPEX phasing context) |
| Tuition scenario | `Cenários Mensalidade` | Cenário 4 (via IF-chain selector) |
| CAPEX total | `D293` (PnL) → `D3` (CAPEX) | −R$70,000,000 (2027) |
| CAPEX phasing | `D287`=0.70, `G287`=0.30 | 70% in 2027, 30% in 2030 |
| WACC | `AB290` (PnL) → `Y8` ref | 14.5% (constant all years) |
| g (terminal growth) | `AB291` | 3.5% |
| VPL | `AB299` | −R$64,583,226 |
| TIR | `AB298` | 8.053% (`IRR(B297:Y297)`) |
| Payback | `AB300` | NA (`IF(AB299<0,"NA",...)`) |

**v10 full parameter schedule (PnL rows 1–19, columns E=2028 through N=2037):**

| Row | Parameter | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 |
|-----|-----------|------|------|------|------|------|------|------|------|------|------|
| 5 | IGP-M | 4.0% | 3.5% | 3.5% | 3.5% | 3.5% | 3.5% | 3.5% | 3.5% | 3.5% | 3.5% |
| 6 | IPCA | 4.0% | 3.9% | 3.9% | 3.9% | 3.9% | 3.9% | 3.9% | 3.9% | 3.9% | 3.9% |
| 7 | SELIC | 11.5% | 10.75% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% |
| 8 | WACC | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% | 14.5% |
| 9 | Reajuste Serviços | **6.0%** | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% |
| 10 | Reajuste Material | **6.0%** | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% |
| 11 | Reajuste Despesas | 5.0% | 4.9% | 4.9% | 4.9% | 4.9% | 4.9% | 4.9% | 4.9% | 4.9% | 4.9% |
| 12 | Dissídio (salary) | **6.0%** | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% | 5.9% |
| 13 | Benefícios | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% | 10.0% |
| 14 | Deduções | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% | 5.817% |

**Note on Row 9 formula:** `E9 = E6+2% = 4%+2% = 6.0%` — tuition (service reajuste) in 2028 is IPCA+2%; from 2029 it is hardcoded to 5.9%.

**Note on Row 12 formula:** `E12 = E11+1% = 5%+1% = 6.0%` — Dissídio in 2028 is Reajuste Despesas+1%; from 2029 it is hardcoded to 5.9%.

**v10 average effective discount schedule (PnL Row 224, % Desconto Médio):**

| Year | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 |
|------|------|------|------|------|------|------|------|------|------|------|
| v10 value | 25.0% | 20.0% | 20.0% | 18.0% | **15.0%** | 15.0% | 15.0% | **12.5%** | 12.5% | 12.5% |

**Note on discount application:** v10 formula `E230 = E224 * E227` — discount is applied to `Receitas com Ensino Regular` (row 227) only, not to upselling, events, or material revenue.

### GATE 3 — Workbook Formula Lineage

**Status: PASS**

All principal calculation chains extracted by OOXML inspection (xl/worksheets/sheetN.xml, xl/sharedStrings.xml). Cells extracted from raw XML without workbook recalculation. Values and formulas recorded independently.

**Tuition revenue formula chain (PnL rows 196–231):**
- Gross tuition by grade: `((Ecourse_grade × E_learners_fulltime) + (Ecourse_grade × E_learners_interim)) × 12`
- Illustrative: `E200 = ((E134*E46)+(E156*E46))*12`
- Ticket Serviço (E226) escalates as: `E225*(1+F10)` = prior year × (1 + Reajuste Serviços)
- Ticket Material escalates identically: `E225*(1+F10)`
- Bolsa de Estudos (E230): `E224 * E227` = discount rate × teaching gross revenue
- Receita Operacional Líquida (E238): teaching + upselling + events + material − discounts − deductions

**CAPEX formula chain (PnL rows 287–298, CAPEX sheet):**
- D287=0.7 (70% in 2027), G287=`IF(I287>0,0,30%)` (30% in 2030 if no Grade 7+ CAPEX)
- Row 294 (Expansão): `D294 = D287 * $AE$21` — grade-selector-dependent total
- CAPEX sheet row 3: Inicial investment of −R$70M in D3 (2027), then sustain capex ongoing
- Row 295 (Sustain CAPEX): `E295 = −E296 × E238` where E296=2% of ROL in 2028

**VPL/TIR formula chain:**
- TIR: `AB298 = IRR(B297:Y297)` — 20-year free cash flow array (2025–2044)
- VPL: `AB299 = SUM(B300:Y300)*C4` — sum of annual DCF × multiplier
- DCF year: `B300 = B297/B303` — free cash flow / discount factor
- Discount factor: `B303 = (1+B8)` = 1.145 in 2025, compounding at 14.5% WACC
- Payback: `AB300 = IF(AB299<0,"NA",IF((SUM(B302:X302)+1)>=20,"20+",(SUM(B302:X302)+1)))`

**Folha de Pagamento sheet (payroll benchmark):** This sheet (`_xlfn.UNIQUE($AM$1:$AM$269)` dynamic array in A2) is a Bench SP 2025 salary benchmark reference. It contains 50 roles with average monthly salaries derived from a São Paulo market benchmark. It is NOT the salary specification for the Rio project. The v10 PnL pulls Rio payroll from `'Org. Design '` (trailing space) sheet via SUMIFS:
- `E241 = −SUMIFS('Org. Design '!AU:AU,'Org. Design '!$BO:$BO,PnL!$A241) − 50%*E$228` (FOPAG Direto)
- `E248 = −SUMIFS('Org. Design '!AU:AU,'Org. Design '!$BO:$BO,PnL!$A248)` (Folha de Pagamento)
- `E249 = −SUMIFS('Org. Design '!CR:CR,'Org. Design '!$DL:$DL,PnL!$A249)` (Benefícios — separate SUMIFS range)

**Critical observation: Benefits in v10 use a separate column range** (`CR:CR`, `CS:CS`, etc.) from salary (`AU:AU`, `AV:AV`, etc.), not a uniform escalation formula applied to salary. This is consistent with the separate 10% escalation parameter in Row 13.

### GATE 4 — Application Formula Lineage

**Status: PASS**

**Tuition escalation** (`receitaEngine.ts:annualAdjustmentFactor`):
```typescript
function annualAdjustmentFactor(year: OpeningPackageProjectionYear): number {
  if (year === 2028) return 1;          // factor=1 in base year, no escalation
  return Math.pow(1.08, year - 2028);  // 8% compounding from 2029
}
```
Source cited in comment: `financeConventionSourceDecisions.md §2.5, §2.6; TUITION_ADJUSTMENT_CONVENTION`. That source document predates v10 and is not overridden by any later Finance message present in this audit.

**Salary escalation** (`src/lib/payroll/core.ts:resolveGrowthFactor`):
```typescript
const COMPENSATION_SCALE_BASE_YEAR = 2028;
function resolveGrowthFactor(year, activeFrom, annualAdjustment) {
  if (year < activeFrom) return 0;
  return Math.pow(annualAdjustment, year - COMPENSATION_SCALE_BASE_YEAR + 1);
}
```
With `ANNUAL_ADJUSTMENT = 1.06` (`src/constants/teaching.ts`):
- year=2028: 1.06^1 = 1.06 (6% applied in 2028)
- year=2029: 1.06^2 = 1.1236 (cumulative 12.36% vs v10's 1.06×1.059=1.12254 at 12.254%)
- year=2037: 1.06^10 (vs v10's 1.06 × 1.059^9)

**Annual salary burden formula** (`src/lib/payroll/core.ts`):
```
annualSalaryBurden = (gross + labor) * 13 + benefits * 12
```
All three components share the same `growthFactor` (the 6% compounded factor above). Benefits are escalated by the same salary growth factor, not by a separate rate.

**Application discount schedule** (`discountScheduleSourceData.ts`):
```typescript
explicitRatesByYear: {
  2028: 0.25, 2029: 0.20, 2030: 0.20, 2031: 0.18,
  2032: 0.18,  // ← 18%
  2033: 0.15, 2034: 0.15,
  2035: 0.15,  // ← 15%
},
terminalRate: 0.125,          // applies from 2036
terminalRateStartYear: 2036,
applicationOrder: "after_annual_tuition_adjustment"
```
Source: `sourceDescription: "Head of Finance message"` — this is a prior-conversation Finance message that predates the v10 workbook (v10 dated 2026-07-24, audit date 2026-07-24).

**Tuition source data** (`tuitionSourceData.ts`):
- `sourceEvidenceDate: "2026-06-02"` — source predates v10
- `calculationReadinessStatus: "blocked"` — engine does not produce tuition revenue outputs in current state
- Tuition scenario `rj4` maps to `bp_scenario_4` — the v10 Cenário 4 equivalent

### GATE 5 — Formula-Contract Matrix

**Status: 5 FORMULA MISMATCHES IDENTIFIED, 2 GOVERNANCE GAPS, 4 NON-COMPARABLE**

| Domain | v10 Authority | Application Implementation | Classification | Evidence |
|--------|--------------|---------------------------|----------------|----------|
| Tuition (service) escalation factor | Row 9: 6.0% in 2028, 5.9% from 2029 | `Math.pow(1.08, year-2028)`: 0% in 2028, 8% compounding from 2029 | **FORMULA MISMATCH** | PnL E9=`E6+2%`, F9–N9=0.059; app `receitaEngine.ts:72` |
| Tuition base-year behavior | Row 9: 6% applied in 2028 (escalation applies) | Factor=1 in 2028 (no escalation in base year) | **FORMULA MISMATCH** | PnL E9=0.06 is applied; app returns 1.0 for 2028 |
| Salary escalation (Dissídio) | Row 12: 6.0% in 2028, 5.9% from 2029 | `ANNUAL_ADJUSTMENT=1.06` constant all years | **FORMULA MISMATCH** | PnL E12=`E11+1%`, F12–N12=0.059; app `teaching.ts:ANNUAL_ADJUSTMENT` |
| Benefits escalation rate | Row 13: 10.0% all years (separate from salary) | Same `growthFactor` as salary (~6% compounding) | **FORMULA MISMATCH** | PnL E13–N13=0.10; app `core.ts`: `benefits * 12 * growthFactor` same factor |
| Discount rate 2032 | Row 224: 15.0% | `explicitRatesByYear[2032] = 0.18` → 18% | **FORMULA MISMATCH** | PnL I224=−0.15; app `discountScheduleSourceData.ts:14` |
| Discount rate 2035 | Row 224: 12.5% | `explicitRatesByYear[2035] = 0.15` → 15% | **FORMULA MISMATCH** | PnL L224=−0.125; app `discountScheduleSourceData.ts:17` |
| Discount rates 2028–2031, 2033–2034 | Row 224: 25%, 20%, 20%, 18%, 15%, 15% | Same values in app | **EXACT MATCH** | PnL E224–K224 vs app constants |
| Terminal discount rate 2036+ | Row 224: 12.5% from 2035 onward | `terminalRate: 0.125` from 2036 | **NUMERICALLY EQUIVALENT ONLY** | v10 starts 12.5% at 2035; app terminal applies from 2036. App 2035=15% mismatches. |
| Discount application scope | Row 230: `E224*E227` — applied to teaching gross only | Per grain: applied to `contractedLearners × adjustedValue` | **SEMANTICALLY EQUIVALENT** | Both limit discount to teaching revenue stream |
| CAPEX phasing 70%/30% | D287=0.70, G287=`IF(I287>0,0,30%)` | 70% at opening year, 30% at opening+3 | **SEMANTICALLY EQUIVALENT** | Same economic split, app encodes same trigger |
| Annual salary burden (13×/12×) | `'Org. Design '` SUMIFS (column-level data) | `(gross+labor)×13 + benefits×12` per HC | **SEMANTICALLY EQUIVALENT** | 13-month salary / 12-month benefits convention consistent |
| Payroll salary bases (role-level) | v10 `'Org. Design '` sheet AU:AU, CX:CX cols | App `teaching.ts` grossMonthly constants | **NOT TRACEABLE** | `'Org. Design '` sheet not extracted at role level; Folha sheet is SP benchmark, not Rio spec |
| Tuition base values by scenario/grade | v10 `Cenários Mensalidade` IF-chain selector | `TUITION_SOURCE_RECORDS` sourced 2026-06-02 | **NOT TRACEABLE** | Source predates v10; `calculationReadinessStatus: "blocked"` |
| G4 Conservador occupancy | Not present in G4 workbook | App may reference `t1_g4 / conservador` | **GOVERNANCE GAP** | G4 workbook has no Conservador scenario |
| VPL (NPV) | `AB299 = SUM(B300:Y300)*C4` = −R$64,583,226 | Not implemented in application scope | **NOT COMPARABLE** | Investment decision metric, outside app calculation scope |
| TIR (IRR) | `AB298 = IRR(B297:Y297)` = 8.053% | Not implemented in application scope | **NOT COMPARABLE** | Same |
| Payback period | `AB300 = IF(AB299<0,"NA",...)` = NA | Not implemented in application scope | **NOT COMPARABLE** | Same |
| EBITDA calculation | `SUM(Margem,CustosFixos,VendasDesp)` | Not implemented in application scope | **NOT COMPARABLE** | Same |

### GATE 6 — Native-State Comparison

**Status: BLOCKED**

The application's tuition revenue engine (`receitaEngine.ts`) has `calculationReadinessStatus: "blocked"` per `tuitionSourceData.ts`. The engine does not produce tuition revenue outputs in its current deployment state. A native-state comparison (identical selector inputs → same annual totals) cannot be performed because the application does not emit comparable outputs.

Additionally, even if the engine were unblocked, formula mismatches in tuition escalation (8% vs 5.9%), discount rates (2032: 18% vs 15%; 2035: 15% vs 12.5%), and benefits escalation (~6% vs 10%) would produce outputs that diverge from v10 in every projection year from 2029 onward.

### GATE 7 — Controlled Output Parity Cases

**Status: BLOCKED**

Controlled parity cases would require:
1. A fixed selector state (e.g., t1_g6 / conservador / rj4)
2. Application outputs computable for each year 2028–2037
3. v10 row-level values extractable for the same state

Precondition (2) fails: application is blocked. Even unblocked, formula mismatches in tuition escalation and discount rates guarantee divergence. No controlled parity case can be certified.

**Illustrative divergence quantification (estimate only, not a parity test):**

For Grade 6 / Conservador / Scenario 4, year 2032:
- v10 discount rate: 15.0%
- App discount rate: 18.0%
- Delta: −3.0 percentage points on gross teaching revenue
- At E2032 teaching gross ≈ R$66M (interpolated from row 227 trajectory), delta ≈ +R$2M net revenue overclaim in app vs v10

For tuition escalation by 2032 (year 4):
- v10: accumulated factor ≈ 1.06 × 1.059^3 ≈ 1.262
- App: accumulated factor ≈ 1.08^4 ≈ 1.360
- Delta: app overestimates tuition ticket by ~7.8% vs v10 in 2032

These are directional estimates to characterize magnitude, not certified outputs.

### GATE 8 — Payroll Movement Controls

**Status: PARTIAL — escalation mismatches confirmed, base salaries not traceable**

**Annualization formula:** Confirmed match to Brazilian convention. Application `core.ts`:
```
annualSalaryBurden = (gross + labor) * 13 + benefits * 12
```
This is semantically equivalent to the 13th-salary convention. The v10 `'Org. Design '` sheet populates FOPAG via SUMIFS from columns AU:AU (2028 salary+encargos) and CR:CR (2028 benefits) — separate column series, consistent with separate annualization tracks.

**Salary escalation:** Confirmed mismatch. App applies 6% constant (`ANNUAL_ADJUSTMENT=1.06`); v10 applies 6.0% in 2028 and 5.9% from 2029. Cumulative divergence from 2029 onward.

**Benefits escalation:** Confirmed mismatch. App applies the salary `growthFactor` (~6% compounding) to benefits. v10 has a separate Benefícios parameter (Row 13) of 10% constant, applied via a separate column range in `'Org. Design '`. The economic effect: app understates benefits growth by approximately 4 percentage points per year from the base.

**Encargos (labor charges):** App `payrollGovernanceWorkbookAdapter.ts` confirms: "Encargos is laborChargesMonthly and is not decomposed in the current model." The v10 PnL combines salary+encargos into a single SUMIFS from the `'Org. Design '` sheet. Parity on this specific component is NOT TRACEABLE without extracting the `'Org. Design '` sheet at the role level.

**Role-level salary bases:** The v10 `Folha de Pagamento` sheet is a São Paulo benchmark reference (`Bench SP 2025`), not the Rio project's salary specification. The application's `teaching.ts` constants (e.g., Associate Educator grossMonthly=7,763.46, Inspirational Educator=17,768.85) cannot be certified as matching or not matching v10 because no extractable row-level salary specification for Rio was found in the v10 workbook that could serve as a direct comparator. Classification: NOT TRACEABLE.

### GATE 9 — V9 Disposition

**Status: PASS**

Prior audit reports filed as untracked files:
- `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md` (hash: `42a0b1...`)
- `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md` (hash: `66cde5...`)
- `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md` (hash: `dc374f...`)

These V9-era reports are superseded in the domains where v10 now provides a different authoritative figure. Specifically:
- Any V9 escalation rate findings are superseded by v10 Row 9 (5.9% from 2029, not 8%)
- Any V9 discount schedule findings are superseded by v10 Row 224 (2032=15%, 2035=12.5%)
- V9 CAPEX and occupancy findings remain consistent with v10

### GATE 10 — Internal Challenge

**Status: PASS (challenges considered and dismissed)**

**Challenge 1:** Could the 8% tuition escalation in `receitaEngine.ts` be a post-v10 Finance authorization that supersedes v10?  
**Response:** The file comment cites `financeConventionSourceDecisions.md §2.5, §2.6`. That document is referenced but not produced in this audit. Without a dated Finance message explicitly authorizing 8% as a replacement for v10 Row 9, the 8% rate cannot be certified as v10-equivalent. The null hypothesis (v10 governs) stands.

**Challenge 2:** Could the 2032=18% and 2035=15% discount rates be a post-v10 Finance correction?  
**Response:** The source description is "Head of Finance message." No dated message overriding v10 Row 224 is present in this audit scope. v10 Row 224 shows 2032=15% and 2035=12.5% unambiguously.

**Challenge 3:** Is the `calculationReadinessStatus: "blocked"` state temporary, meaning formula parity cannot be tested but may still be correct?  
**Response:** Blocked status is not a defense against formula parity failures. The formula parameters embedded in the source code (8% escalation, 18% discount in 2032, 15% discount in 2035) are present in the active code regardless of the blocked state. Formula mismatch exists in the code, not in the output execution.

**Challenge 4:** Could the benefits escalation through the salary factor be equivalent if the base salary constants already incorporate benefit loading?  
**Response:** No. The v10 model applies a 10% flat benefits escalation annually through a separate column (`CR:CR`) in `'Org. Design '`. The app applies the same salary-growth factor (6% compounding) to a monthly benefit constant. These are structurally different: v10 grows benefits 10% per year, app grows benefits 6% per year (in 2028), diverging compound annually.

**Challenge 5:** Is the G4/Conservador governance gap a blocker, or just a missing source?  
**Response:** It is a missing source, not an application-code fault. If no application path constructs `t1_g4 / conservador`, it is a non-issue. If such a path exists in the app's opening-package registry, it must be flagged as producing outputs without authoritative occupancy inputs.

### GATE 11 — Bounded Closure Loop

**Status: BLOCKED — 5 open formula mismatches, 1 governance gap, 2 source-data gaps**

Open items as of this gate:

| ID | Domain | Mismatch | Severity |
|----|--------|---------|---------|
| M-1 | Tuition escalation rate | App: 8% from 2029; v10: 5.9% from 2029 | HIGH |
| M-2 | Tuition base-year behavior | App: factor=1 in 2028 (no escalation); v10: 6% applied in 2028 | HIGH |
| M-3 | Salary escalation rate | App: constant 6%; v10: 6% in 2028, 5.9% from 2029 | MEDIUM |
| M-4 | Benefits escalation rate | App: ~6% (same as salary); v10: 10% separate | HIGH |
| M-5 | Discount rate 2032 | App: 18%; v10: 15% | HIGH |
| M-6 | Discount rate 2035 | App: 15%; v10: 12.5% | MEDIUM |
| G-1 | G4 Conservador scenario | Not present in G4 workbook; governance gap | MEDIUM |
| S-1 | Tuition base values | Source predates v10; `calculationReadinessStatus: "blocked"` | HIGH |
| S-2 | Role-level salary bases | `'Org. Design '` sheet not extracted; NOT TRACEABLE | MEDIUM |

Closure requires: Finance to confirm whether 8% escalation and prior discount rates are authorized departures from v10, or to produce a corrected app update aligned to v10. Closure cannot be achieved by this audit alone.

### GATE 12 — Exit Controls

**Status: PASS**

All protected files re-hashed at exit. All hashes match entry state exactly (see Section 7.1 table).

No repository mutations were performed. The only new file created by this audit is this report at the single authorized path: `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md`.

The v10, G6, and G4 workbook files were not opened, saved, or modified — inspection was performed via Python `zipfile`/`xml.etree.ElementTree` directly on the OOXML archive without any write operations.

---

## 7.3 Formula-Contract Matrix

See Gate 5 table above. Summary classification counts:

| Classification | Count |
|----------------|-------|
| FORMULA MISMATCH | 6 |
| EXACT MATCH | 1 |
| SEMANTICALLY EQUIVALENT | 3 |
| NUMERICALLY EQUIVALENT ONLY | 1 |
| NOT TRACEABLE | 2 |
| NOT COMPARABLE (out of scope) | 4 |
| GOVERNANCE GAP | 1 |

---

## 7.4 Output-Parity Matrix

No output-parity cases could be executed. The application's receita calculation engine is in `blocked` state and does not produce tuition revenue outputs. All output-parity entries are BLOCKED.

| Selector State | Gate 7 Result | Reason |
|----------------|--------------|--------|
| t1_g6 / conservador / rj4 / 2028 | BLOCKED | Engine blocked |
| t1_g6 / conservador / rj4 / 2032 | BLOCKED | Engine blocked + formula mismatch M-5 |
| t1_g6 / conservador / rj4 / 2037 | BLOCKED | Engine blocked + multiple mismatches |
| Any other state | BLOCKED | Same |

---

## 7.5 Discrepancy Register

| ID | Type | Domain | v10 Source Cell/Value | Application Source / Value | Delta |
|----|------|--------|----------------------|---------------------------|-------|
| D-01 | Formula | Tuition escalation — rate | Row 9: 5.9% from 2029 | `1.08^(year-2028)` = 8% from 2029 | −2.1 pp per year from 2029 |
| D-02 | Formula | Tuition escalation — base year | Row 9 E9=6% applied in 2028 | `annualAdjustmentFactor` returns 1 (no escalation) in 2028 | App understates tuition in 2028 vs v10 definition |
| D-03 | Formula | Salary escalation | Row 12: 5.9% from 2029 | `ANNUAL_ADJUSTMENT=1.06` constant | −0.1 pp per year from 2029, compounding |
| D-04 | Formula | Benefits escalation | Row 13: 10.0% all years | Same `growthFactor` as salary (~6%) | −4 pp per year benefits growth |
| D-05 | Constant | Discount rate 2032 | Row 224 I224: 15.0% | `explicitRatesByYear[2032]=0.18` = 18.0% | App applies 3 pp excess discount in 2032 |
| D-06 | Constant | Discount rate 2035 | Row 224 L224: 12.5% | `explicitRatesByYear[2035]=0.15` = 15.0% | App applies 2.5 pp excess discount in 2035 |
| D-07 | Governance | G4 Conservador scenario | Not present in G4 workbook | App may define t1_g4/conservador path | No authoritative occupancy data for this combination |
| D-08 | Source | Tuition base values | v10 Cenários Mensalidade (2026-07-24) | `TUITION_SOURCE_RECORDS` (sourceEvidenceDate: 2026-06-02) | Source predates v10; values not verified |

---

## 7.6 V9 Disposition Log

| V9 Finding | V10 Status |
|-----------|-----------|
| Tuition escalation rate disputed | CONFIRMED MISMATCH at D-01/D-02 against v10 |
| Discount rate schedule: 2032=18% suspected | CONFIRMED MISMATCH at D-05 (v10 shows 15%) |
| Discount rate schedule: 2035 not previously checked | NEW FINDING at D-06 (v10 shows 12.5%, app has 15%) |
| CAPEX 70%/30% phasing | CONFIRMED consistent with v10 D287/G287 |
| Benefits as separate escalation | CONFIRMED in v10 Row 13 (10% separate from Dissídio) |
| G4/G6 occupancy static values | CONFIRMED — no formulas in enrollment cells |

---

## 7.7 Change Register

**No changes were made to any repository file by this audit.**

Entry state and exit state are identical for all files. The only write operation performed was creation of this report at the single authorized path.

| File | Entry Hash | Exit Hash | Changed |
|------|-----------|-----------|---------|
| `IMPLEMENTATION.md` | `6962a3e1...` | `6962a3e1...` | NO |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a7...` | `b05b63a7...` | NO |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c4...` | `60aed5c4...` | NO |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e...` | `833e415e...` | NO |
| `scripts/validate-phase15u2.ts` | `4acf5642...` | `4acf5642...` | NO |
| All V9 audit reports | (see hashes above) | Unchanged | NO |
| v10 workbook | `2e3230ad...` | (not re-hashed) | READ-ONLY |
| G6 workbook | `17c93389...` | (not re-hashed) | READ-ONLY |
| G4 workbook | `5a9342e1...` | (not re-hashed) | READ-ONLY |

---

## 7.8 Implementation-Readiness Verdict

**NOT READY FOR V10-CERTIFIED PRODUCTION OUTPUT**

The application cannot be certified as implementing the v10 financial model. The following corrections are required before a re-audit:

**Required corrections (blocking):**

1. **Tuition escalation rate** (`receitaEngine.ts`): Change to IPCA+2% in 2028 (=6.0%), then 5.9% compounding from 2029. The current 8% rate has no traceable v10 authority.

2. **Tuition base-year behavior** (`receitaEngine.ts`): If v10 Row 9 applies 6.0% in 2028 as a year-over-year adjustment, the base year for tuition comparison must be 2027 BRL values. The current `annualAdjustmentFactor(2028)=1` is appropriate only if the source tuition values are already in 2028 BRL without any applied escalation. This must be confirmed against the v10 `Cenários Mensalidade` base period.

3. **Discount rate 2032** (`discountScheduleSourceData.ts`): Change `explicitRatesByYear[2032]` from `0.18` to `0.15`.

4. **Discount rate 2035** (`discountScheduleSourceData.ts`): Change `explicitRatesByYear[2035]` from `0.15` to `0.125` (consistent with v10 terminal rate which begins at 2035 in the workbook, not 2036 as currently modeled).

5. **Benefits escalation** (`src/lib/payroll/core.ts`): Benefits must use a 10% annual escalation rate, not the salary `growthFactor`. This requires a separate `benefitsGrowthFactor` parameter distinct from the salary/encargos growth factor.

6. **Salary escalation rate** (`src/constants/teaching.ts`): Change `ANNUAL_ADJUSTMENT` to be year-variable: 6.0% in 2028, 5.9% from 2029. This requires modifying `growthFactor` resolution to accept a year-variable adjustment schedule.

7. **Tuition source data** (`tuitionSourceData.ts`): Update source values to match v10 `Cenários Mensalidade` and set `calculationReadinessStatus` to `ready`.

**Required investigation (governance):**

8. **G4 Conservador path**: Confirm whether the application's opening package registry includes `t1_g4 / conservador`. If so, that combination must be flagged as having no authoritative occupancy source.

9. **Role-level salary bases**: Extract `'Org. Design '` sheet salary columns (AU:AU etc.) to verify that application `teaching.ts` constants match v10's Rio-specific salary table.

---

## 7.9 Formula Parity Attestation (ATTESTATION A)

> **ATTESTATION A — FORMULA PARITY**
>
> This attestation covers whether the application implements the same computational rules as the v10 authoritative workbook.
>
> **VERDICT: BLOCKED — FORMULA PARITY NOT ACHIEVED**
>
> Six formula contracts (D-01 through D-06) are mismatched between the v10 workbook and the application source code. These mismatches are present in the current application code regardless of whether the calculation engine is in a blocked or active state.
>
> The application cannot be attested as implementing the v10 formula model. A corrective update is required before re-audit.
>
> **Signed:** Phase V10-A/B forensic read-only audit, 2026-07-24

---

## 7.10 Output Parity Attestation (ATTESTATION B)

> **ATTESTATION B — OUTPUT PARITY**
>
> This attestation covers whether identical selector states produce the same annual outputs in the application as in the v10 workbook.
>
> **VERDICT: BLOCKED — OUTPUT PARITY NOT TESTABLE AND NOT ACHIEVABLE**
>
> The application's receita calculation engine is in `blocked` state (`calculationReadinessStatus: "blocked"`, `tuitionSourceData.ts`). No application tuition revenue outputs can be produced for comparison.
>
> Beyond the blocked state: formula mismatches identified in ATTESTATION A guarantee output divergence in every projection year from 2029 onward. Output parity is not achievable without first resolving the formula mismatches.
>
> **Signed:** Phase V10-A/B forensic read-only audit, 2026-07-24

---

## 7.11 Overall Verdict

**BLOCKED**

This audit finds that the application does not implement the v10 governing workbook's computational rules. Six formula mismatches (D-01 through D-06), two source-data gaps (D-07, D-08), and one governance gap prevent formula parity certification. Output parity cannot be tested or certified. The application is not ready for v10-certified production outputs.

**Required action before re-audit:** Implement all corrections listed in Section 7.8. Re-run Phase V10-A/B with updated application source code.

---

*Audit closed: 2026-07-24. Report finalized at authorized path only. No other repository files created or modified.*
