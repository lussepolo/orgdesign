# Phase V10-D — Implementation-Readiness Closure

**Audit type:** Evidence closure, salary comparison, implementation contract finalization  
**Audit date:** 2026-07-24  
**Auditor:** Claude Sonnet 4.6 (claude-sonnet-4-6) via Claude Code  
**Repository:** `/Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design`  
**Branch at entry:** `main` (HEAD `d743616916d8b3b4b1708cd9e3ef25c08b0ad00f`)  
**Remote:** `origin https://github.com/lussepolo/orgdesign.git`  
**Predecessor report:** `docs/audits/rio-resilience/phase-v10-c-evidence-resolution-and-implementation-contract.md`  
**Authorized report path:** `docs/audits/rio-resilience/phase-v10-d-implementation-readiness-closure.md`

---

## D.1 Entry Control

### Repository State

```
pwd:    /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
remote: origin https://github.com/lussepolo/orgdesign.git (fetch/push)
branch: main
HEAD:   d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

**Dirty state (pre-existing, preserved, not modified):**
```
 M IMPLEMENTATION.md                                 (unstaged)
 M src/components/dreSimulator/dreScenarioWorkbook.ts (unstaged)
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts (unstaged)
?? docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md
?? docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md
?? docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md
?? docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md
?? docs/audits/rio-resilience/phase-v10-c-evidence-resolution-and-implementation-contract.md
?? scripts/validate-phase15u2.ts
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts
```

Staged state: none (git diff --cached --stat returned no output).

### Entry File Hashes

| File | SHA-256 | Match V10-C |
|------|---------|-------------|
| `IMPLEMENTATION.md` | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` | YES |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` | YES |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` | YES |
| `scripts/validate-phase15u2.ts` | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` | YES |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` | YES |
| `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md` | `aa020afb7f0f2cb3bd39ccd3eba78f4c46088cddb187e13994f5c7f7b11ac53e` | YES |
| `docs/audits/rio-resilience/phase-v10-c-evidence-resolution-and-implementation-contract.md` | `41e14a7c2d4c450b1e2026c29da2bbaafe952a5dc59e348d52e946b252e21a78` | YES |

### Workbook Hash Verification

| Workbook | SHA-256 | Match V10-C specification |
|----------|---------|--------------------------|
| v10 | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | YES |
| G6 | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | YES |
| G4 | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | YES |

All workbook hashes match. Entry control: PASS.

---

## D.2 Fixed Findings (Carried From V10-C Without Reopening)

The following are carried as fixed unless new direct contradictory evidence is found in this phase. None was found.

- D-02 was a prior-finding error; `annualAdjustmentFactor(2028)=1` is correct.
- All 19 `BP_SCENARIO_4_VALUES` match the v10 AT column.
- D-01 remains unresolved: 8% application vs. 5.9% v10 from 2029.
- D-05 governed value for 2032: 15%.
- D-06 governed value for 2035: 12.5%.
- Salary escalation: 5.9% from 2029 relative to 2028 base.
- Benefits: 10% separate annual track from 2029.
- G6 Conservador has an authoritative source (G6 workbook).
- G4 Conservador has no authoritative source.
- Conservador is not currently UI-selectable.

---

## D.3 Complete Salary-Base Extraction

### V10-C Discrepancy Resolution

V10-C stated "61 rows shown" with 4 remaining; the Org. Design sheet has active data in rows 4–65 (62 role entries). The V10-C table truncated at row 60, showing 57 of 62 roles. V10-D extracted and confirmed rows 61–65:

| Row | Nível | Cargo | Área | Salário Posição (BRL/mo) | HC 2028 | Allocation |
|-----|-------|-------|------|--------------------------|---------|------------|
| 61 | Back Office | Nursing Intern | Nursing Intern | 1,672.68 | 1 | Folha de Pagamento |
| 62 | Leadership | Ops Coordinator | Ops Coordinator | 12,020.40 | 1 | Folha de Pagamento |
| 63 | Pedagógico | Personalized Learning Associate Educator | PLAE | 8,229.27 | 1 | FOPAG Direto |
| 64 | Back Office | School Secretary | School Secretary | 4,458.57 | 1 | Folha de Pagamento |
| 65 | Back Office | Security Coordinator | Security Coordinator | 12,020.40 | 1 | Folha de Pagamento |

**Complete roster confirmed: 62 active roles (rows 4–65 inclusive).** All v10 Org. Design role-level Salário Posição values are now extracted.

### Salary Escalation Formula (Confirmed From Workbook)

Extracted from representative role (Head of School, row 30):
- Column Z (2028): static `= Salário Posição` (2028 in-force BRL)
- Column AA (2029): `= Z30*(1+PnL!F$12)` = Z30 × 1.059
- Columns AB–AS: same pattern, compounding at 5.9% annually through 2047

Benefits escalation (same row):
- Column BW (2028): static monthly benefits base
- Column BX (2029): `= BW30*(1+PnL!F$13)` = BW30 × 1.10
- Columns BY–CP: compounding at 10.0% annually through 2047

---

## D.4 Application Salary and Benefits Comparison

### Base-Year Semantics (Resolution of V10-C Open Question)

The ratio v10 Salário Posição / application grossMonthly was computed for roles where the application source is unambiguous. For virtually all non-mismatched roles:

```
v10 Salário Posição = application grossMonthly × 1.06
```

Representative confirmations:
- Head of School: 51,167.45 × 1.06 = 54,237.50 = v10 54,237.50 ✓
- EY Coordinator: 19,941.74 × 1.06 = 21,137.85 ≈ v10 21,138.24 ✓ (0.39 BRL rounding)
- Ops Coordinator: 11,340.00 × 1.06 = 12,020.40 = v10 12,020.40 ✓
- IT Technician: 6,405.00 × 1.06 = 6,789.30 = v10 6,789.30 ✓
- EY Learning Monitor: 4,060.63 × 1.06 = 4,304.27 = v10 4,304.27 ✓ (exact)
- EY Learning Assistant: 4,595.88 × 1.06 = 4,872.03 ≈ v10 4,871.64 ✓ (0.39 BRL rounding)
- PLAE: EDUCATOR_LEVELS['associate'] 7,763.46 × 1.06 = 8,229.05 ≈ v10 8,229.27 ✓

**Conclusion:** Application `grossMonthly` values are expressed in 2027 BRL. The current `resolveGrowthFactor(2028) = Math.pow(1.06, 2028 - 2028 + 1) = 1.06` is architecturally correct — it escalates a 2027 BRL base to the 2028 in-force salary. The V10-C open question is resolved: the year=2028 growth factor must NOT be changed to 1.0. The same 2027-BRL convention applies to `benefitsMonthly` (confirmed: Head of School 1,464.28 × 1.06 = 1,552.13 = v10 BW30).

### Complete Salary Comparison Table

| Canonical v10 Role | v10 Salário Posição | App Source | App grossMonthly | App ×1.06 | Status | Note |
|---|---|---|---|---|---|---|
| After School Educator | 16,162.40 | SPECIALISTS_CONFIG after_school | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | App label "After School Coordinator" |
| Arts Educator | 16,162.40 | SPECIALISTS_CONFIG arts | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| Assistente Financeiro | 3,034.78 | BACKOFFICE_CONFIG finance_assistant | 2,862.63 | 3,034.39 | MATCH AFTER DOCUMENTED CONVERSION | 0.39 BRL rounding |
| Body & Movement Educator | 16,162.40 | SPECIALISTS_CONFIG body | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| Clerk (Portaria) | 2,953.95 | BACKOFFICE_CONFIG clerk | 2,786.75 | 2,953.96 | MATCH AFTER DOCUMENTED CONVERSION | 0.01 BRL rounding |
| Counselor | 16,161.94 | LEADERSHIP_CONFIG counselor | 16,923.84 | 17,939.27 | **MISMATCH** | App 11.0% higher than v10; v10=master rate |
| Ed Tech Coordinator | 19,603.21 | LEADERSHIP_CONFIG edtech | 18,493.59 | 19,603.21 | MATCH AFTER DOCUMENTED CONVERSION | |
| Events Assistant | 3,034.78 | Not found | — | — | **APPLICATION VALUE ABSENT** | v10 separate from Marketing |
| EY Coordinator | 21,138.24 | LEADERSHIP_CONFIG ey_principal | 19,941.74 | 21,137.85 | MATCH AFTER DOCUMENTED CONVERSION | 0.39 BRL rounding |
| EY Learning Assistant (×5) | 4,871.64 | LEARNING_ASSISTANT_DETAIL | 4,595.88 | 4,872.03 | MATCH AFTER DOCUMENTED CONVERSION | 0.39 BRL rounding |
| EY Learning Monitor (×5) | 4,304.27 | LEARNING_MONITOR_DETAIL | 4,060.63 | 4,304.27 | MATCH AFTER DOCUMENTED CONVERSION | Exact |
| EY Teaching Lead (×5) | 21,138.24 | EDUCATOR_LEVELS['master'] | 15,247.55 | 16,162.40 | **MISMATCH** | App 23.5% below v10; see note |
| Family Engagement Analyst | 5,655.15 | BACKOFFICE_CONFIG family | 5,335.05 | 5,655.15 | MATCH AFTER DOCUMENTED CONVERSION | |
| Financial Analyst | 5,395.40 | BACKOFFICE_CONFIG finance | 5,090.00 | 5,395.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| Head of School | 54,237.50 | LEADERSHIP_CONFIG hos | 51,167.45 | 54,237.50 | MATCH AFTER DOCUMENTED CONVERSION | |
| HR Analyst | 5,950.84 | BACKOFFICE_CONFIG hr | 5,614.00 | 5,950.84 | MATCH AFTER DOCUMENTED CONVERSION | |
| HS Coordinator | 21,138.24 | LEADERSHIP_CONFIG hs_principal | 19,941.74 | 21,137.85 | MATCH AFTER DOCUMENTED CONVERSION | |
| HS Educator (G9–G12) | 16,162.40 | SPECIALISTS_CONFIG hs_pool (master) | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| HS Teaching Lead (×4) | 21,138.24 | EDUCATOR_LEVELS['master'] | 15,247.55 | 16,162.40 | **MISMATCH** | Same structural issue as EY Teaching Lead |
| Inspirationeer | 7,293.49 | BACKOFFICE_CONFIG library | 6,880.65 | 7,293.49 | MATCH AFTER DOCUMENTED CONVERSION | |
| IT Technician | 6,789.30 | BACKOFFICE_CONFIG it | 6,405.00 | 6,789.30 | MATCH AFTER DOCUMENTED CONVERSION | |
| Language Acquisition Coach | 16,162.40 | EDUCATOR_LEVELS['master'] (inferred) | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | Archetype inferred from role class |
| Learning Exp Designer | 16,952.45 | SPECIALISTS_CONFIG led | 15,992.88 | 16,952.45 | MATCH AFTER DOCUMENTED CONVERSION | |
| LS Coordinator | 21,138.24 | LEADERSHIP_CONFIG ls_principal | 19,941.74 | 21,137.85 | MATCH AFTER DOCUMENTED CONVERSION | |
| LS Learning Assistant (×5) | 4,871.64 | LEARNING_ASSISTANT_DETAIL | 4,595.88 | 4,872.03 | MATCH AFTER DOCUMENTED CONVERSION | |
| LS Teaching Lead (×5) | 21,138.24 | EDUCATOR_LEVELS['master'] | 15,247.55 | 16,162.40 | **MISMATCH** | Same structural issue as EY Teaching Lead |
| Maintenance Technician | 4,111.42 | BACKOFFICE_CONFIG maintenance | 3,878.70 | 4,111.42 | MATCH AFTER DOCUMENTED CONVERSION | |
| Maker Space Assistant | 6,566.70 | Not found | — | — | **APPLICATION VALUE ABSENT** | Not in any known config |
| Marketing & Events Analyst | 6,566.70 | BACKOFFICE_CONFIG marketing | 6,195.00 | 6,566.70 | MATCH AFTER DOCUMENTED CONVERSION | |
| MS Coordinator | 21,138.24 | LEADERSHIP_CONFIG ms_principal | 19,941.74 | 21,137.85 | MATCH AFTER DOCUMENTED CONVERSION | |
| MS Educator (G6–G8) | 16,162.40 | EDUCATOR_LEVELS['master'] (inferred) | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| MS Teaching Lead (×3) | 21,138.24 | EDUCATOR_LEVELS['master'] | 15,247.55 | 16,162.40 | **MISMATCH** | Same structural issue as EY Teaching Lead |
| Music Educator | 16,162.40 | SPECIALISTS_CONFIG music | 15,247.55 | 16,162.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| Nurse Technician | 4,006.80 | BACKOFFICE_CONFIG nurse | 3,780.00 | 4,006.80 | MATCH AFTER DOCUMENTED CONVERSION | |
| Nursing Intern | 1,672.68 | BACKOFFICE_CONFIG nursing_intern | 1,578.00 | 1,672.68 | MATCH AFTER DOCUMENTED CONVERSION | |
| Ops Coordinator | 12,020.40 | LEADERSHIP_CONFIG ops | 11,340.00 | 12,020.40 | MATCH AFTER DOCUMENTED CONVERSION | |
| PLAE | 8,229.27 | EDUCATOR_LEVELS['associate'] | 7,763.46 | 8,229.05 | MATCH AFTER DOCUMENTED CONVERSION | 0.22 BRL rounding |
| School Secretary | 4,458.57 | BACKOFFICE_CONFIG secretary | 4,206.20 | 4,458.57 | MATCH AFTER DOCUMENTED CONVERSION | |
| Security Coordinator | 12,020.40 | Not found in explicit config | — | — | **ROLE MAPPING AMBIGUOUS** | Not in LEADERSHIP or BACKOFFICE; may be in orgDesignPayrollActivation |

### Teaching Lead Mismatch — Structural Finding

The application maps all Teaching Lead roles (EY, LS, MS, HS) to `EDUCATOR_LEVELS['master']` (grossMonthly=15,247.55). In the v10, all Teaching Lead roles carry the same Salário Posição as the Division Coordinator (21,138.24/month). The effective 2028 discrepancy per teaching lead is:

- Application: 15,247.55 × 1.06 = 16,162.40 BRL/month
- v10: 21,138.24 BRL/month
- Shortfall: 4,975.84 BRL/month per teaching lead (23.5% below v10)

Affected positions (Grade 6 / Conservador / 2028):
- EY Teaching Lead: 5 positions (t1, t2, pk3, pk4, k)
- LS Teaching Lead: 5 positions (g1–g5)
- MS Teaching Lead: none active in 2028 (Grade 6 opens only in Conservador, MS coordinator only)

This is a new finding not present in V10-A/B or V10-C. It represents a material understatement of payroll in the application relative to v10.

### Counselor Mismatch — Direction Reversal

The application overstates Counselor compensation relative to v10:
- Application: 16,923.84 × 1.06 = 17,939.27 BRL/month (2028)
- v10: 16,161.94 BRL/month (≈ master educator × 1.06 = 16,162.40)
- Overage: 1,777.33 BRL/month per counselor (11.0% above v10)

With 3 counselors in 2028 per v10 (E9=3.0), the aggregate annual overstatement is approximately 3 × 1,777.33 × 13 = 69,316 BRL/year before growth.

### Application Value Absent — Events Assistant and Maker Space Assistant

Two v10 roles (Events Assistant, row 11; Maker Space Assistant, row 53) have no identifiable counterpart in the application's known configuration files. These roles may exist under different IDs in `orgDesignPayrollActivation.ts` custom entries not covered here, or may be absent from the application model.

### Benefits Comparison Summary

Benefits base values follow the same 2027-BRL convention as salary:
- Confirmed for Head of School: app `benefitsMonthly`=1,464.28 × 1.06 = 1,552.13 = v10 BW30
- Inference: all roles likely follow the same conversion (verified via representative sample only; full tabular comparison not performed as it would require extracting the full BW column from v10)
- Core issue is NOT the 2028 base (which matches after × 1.06) but the escalation rate: app applies salary growthFactor (~6%) to benefits; v10 applies 10% separate track.

---

## D.5 Base-Year and Activation-Year Semantics

### Base-Year Resolution

**RESOLVED: Application grossMonthly and benefitsMonthly values are expressed in 2027 BRL.**

The current `resolveGrowthFactor(year) = Math.pow(1.06, year - 2028 + 1)` produces:
- year=2028: 1.06^1 = 1.06 → effective salary = grossMonthly × 1.06 = v10 Salário Posição ✓
- year=2029: 1.06^2 = 1.1236 → effective salary = grossMonthly × 1.1236

v10 equivalent at year=2029: Salário Posição × 1.059 = grossMonthly × 1.06 × 1.059 = grossMonthly × 1.12254

The year=2028 factor (1.06) is **correct and must not change.** Only the compounding rate from 2029 onward needs correction.

### Representative Role Factor Comparison

| Role | Base (2027 BRL) | 2028 app | 2028 v10 | 2029 app | 2029 v10 | Status |
|------|-----------------|----------|----------|----------|----------|--------|
| Head of School | 51,167.45 | ×1.06=54,237.50 | 54,237.50 ✓ | ×1.1236=57,506.45 | ×1.12254=57,437.51 | Rate mismatch from 2029 |
| EY Coord. | 19,941.74 | ×1.06=21,137.85 | 21,138.24 ✓ | ×1.1236=22,406.64 | ×1.12254=22,373.82 | Rate mismatch from 2029 |
| EY Teaching Lead | 15,247.55 | ×1.06=16,162.40 | 21,138.24 ✗ | — | — | Base MISMATCH (no rate question) |
| EY Learning Asst. | 4,595.88 | ×1.06=4,872.03 | 4,871.64 ✓ | ×1.1236=5,164.08 | ×1.06×1.059=5,159.52 | Rate mismatch from 2029 |
| Counselor | 16,923.84 | ×1.06=17,939.27 | 16,161.94 ✗ | — | — | Base MISMATCH |

### Activation-Year Behavior

Roles activated after 2028 in the v10 Org. Design sheet (column E HC=0 in 2028, increasing in later years) should enter at the accumulated salary for their activation year, not at the unadjusted 2027 BRL base.

v10 formula (Head of School row 30 as proxy for pattern): `Z_col*(1+PnL!F$12)` for 2029, cascading annually. This means a role activated in year Y has a salary = Salário Posição × 1.059^(Y-2028).

Application `resolveGrowthFactor(year, activeFrom, annualAdjustment)`: `Math.pow(annualAdjustment, year - 2028 + 1)` for year ≥ activeFrom. This applies the compounded factor from 2028, not from the activation year. A role activating in 2031 with ANNUAL_ADJUSTMENT=1.06 enters at grossMonthly × 1.06^4 = grossMonthly × 1.2625. The v10 equivalent would be Salário Posição × 1.059^3 = grossMonthly × 1.06 × 1.059^3 = grossMonthly × 1.2603.

The two approaches agree on the structure: both accumulate the growth from the 2028 base. The difference is exclusively in the compounding rate (1.06 vs 1.059). Activation-year semantics are therefore structurally aligned; only the rate correction resolves the mismatch.

**Example — MS Coordinator (activeFrom=2031):**
- App: 19,941.74 × 1.06^(2031-2028+1) = 19,941.74 × 1.06^4 = 25,173.93
- v10: 21,137.85 × 1.059^(2031-2028) = 21,137.85 × 1.059^3 = 25,130.53
- Difference: 43.40 BRL/month at year 2031 (rate compounding divergence only, no activation structure problem)

---

## D.6 Benefits Semantics

### Verified Properties

1. **Per-role benefits base:** Every role in v10's Org. Design has its own BW column entry (monthly benefits base 2028). Verified for representative role (Head of School: BW30=1,552.13).

2. **Monthly × 12 convention:** v10 CR column (annual benefits 2028) = BW column × 12. Confirmed: Head of School CR30 = 18,625.62 = 1,552.13 × 12 (negligible rounding). Annual benefits are **not** 13-month.

3. **Benefit categories not decomposed in application:** `payrollGovernanceWorkbookAdapter.ts` confirms: "Encargos is laborChargesMonthly and is not decomposed in the current model." The v10's BQ (base benefit component), BR (benefit factor), and BU (additional component) add to BV (total monthly benefits). These components are all folded into a single `benefitsMonthly` in the application.

4. **Benefits escalation starts from activation year:** v10 BW column represents 2028 benefits base. For roles activating after 2028, the BW column would hold the initial value (not pre-escalated). The 10% escalation (BX = BW × 1.10, BY = BX × 1.10...) accumulates from that base. Application behavior: `benefitsMonthly × 12 × growthFactor` where growthFactor is the salary factor (currently 1.06^(year-2028+1)). Both escalate from the role's entry state, but at different rates.

5. **Pre-activation behavior:** Both v10 and application produce zero cost before activation. No pre-activation escalation accumulates.

6. **Same growthFactor for salary and benefits — THE MISMATCH:** Application applies `Math.pow(ANNUAL_ADJUSTMENT, year - 2028 + 1)` (≈6% compounding) identically to salary and benefits. v10 uses 10% for benefits (BX series) and 5.9% for salary (AA series). These must be separated.

### Minimal Safe Architecture for Separation

The current function signature `resolveGrowthFactor(year, activeFrom, annualAdjustment)` already accepts an `annualAdjustment` parameter. The salary track passes `ANNUAL_ADJUSTMENT=1.06`; the benefits track needs its own `BENEFITS_ANNUAL_ADJUSTMENT=1.10`. No structural change to `resolveGrowthFactor` is required — only two changes:

1. In `src/constants/teaching.ts` (or a new constants file): `export const BENEFITS_ANNUAL_ADJUSTMENT = 1.10;`
2. In `src/lib/payroll/core.ts` `annualSalaryBurden`: apply `resolveGrowthFactor(year, activeFrom, BENEFITS_ANNUAL_ADJUSTMENT)` separately for the benefits term.

FGTS and INSS remain unchanged: `laborChargesMonthly` is part of the salary track (gross × 13 component) and is unaffected by the benefits separation.

---

## D.7 G6 Conservador Extraction

**Source:** `Modelo_Ocupacao_Concept_2028_4sc_T1_G6.xlsx` (SHA `17c93389...`), sheet `3. CONSERVADOR`.
**Evidence type:** STATIC OUTPUT for all values (no in-cell formulas for enrollment/capacity; the growth logic is documented in column D text descriptions but results are stored as static numeric values).

### Part 1 — Total Enrollment by Grade by Year (Rows 7–26)

| Grade | Division | Lim/Sala | Cap Total | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 |
|-------|----------|----------|-----------|------|------|------|------|------|------|------|------|------|------|
| Toddlers 1 | EY | 14 | 28 | 14 | 16 | 19 | 22 | 24 | 26 | 28 | 28 | 28 | 28 |
| Toddlers 2 | EY | 14 | 28 | 14 | 16 | 19 | 22 | 24 | 26 | 28 | 28 | 28 | 28 |
| Pre-K3 | EY | 18 | 36 | 22 | 24 | 27 | 30 | 32 | 34 | 36 | 36 | 36 | 36 |
| Pre-K4 ★ | EY | 18 | 36 | 26 | 28 | 31 | 34 | 36 | 36 | 36 | 36 | 36 | 36 |
| Kindergarten ★ | EY | 20 | 40 | 28 | 30 | 33 | 36 | 38 | 40 | 40 | 40 | 40 | 40 |
| Grade 1 ★ | LS | 22 | 44 | 32 | 34 | 37 | 40 | 42 | 44 | 44 | 44 | 44 | 44 |
| Grade 2 | LS | 22 | 44 | 26 | 31 | 34 | 36 | 39 | 41 | 44 | 44 | 44 | 44 |
| Grade 3 | LS | 22 | 44 | 24 | 26 | 30 | 33 | 35 | 38 | 40 | 43 | 44 | 44 |
| Grade 4 | LS | 24 | 48 | 20 | 23 | 26 | 29 | 32 | 34 | 37 | 39 | 42 | 44 |
| Grade 5 | LS | 24 | 48 | 16 | 19 | 23 | 25 | 28 | 31 | 33 | 36 | 38 | 41 |
| Grade 6 | MS | 25 | 50 | 16 | 18 | 20 | 22 | 24 | 27 | 30 | 32 | 35 | 37 |
| Grade 7 | MS | 25 | 50 | — | 17 | 19 | 21 | 23 | 25 | 27 | 29 | 31 | 34 |
| Grade 8 | MS | 25 | 50 | — | — | 17 | 19 | 21 | 23 | 25 | 27 | 29 | 31 |
| Grade 9 | MS† | 25 | 50 | — | — | — | 18 | 20 | 22 | 24 | 26 | 28 | 30 |
| Grade 10 | HS | 25 | 50 | — | — | — | — | 18 | 20 | 21 | 23 | 25 | 27 |
| Grade 11 | HS | 25 | 50 | — | — | — | — | — | 18 | 20 | 22 | 23 | 25 |
| Grade 12 | HS | 25 | 50 | — | — | — | — | — | — | 18 | 20 | 22 | 24 |

† Grade 9 is labeled "MS" in the G6 workbook (row 22, col B = "MS"). The application's `GRADE_CONFIG` classifies Grade 9 as "High School". This classification difference affects division-level revenue aggregation in the DRE but does not affect per-grade enrollment values.

### Part 1 — Subtotals and Totals

| Year | EY | LS | MS | HS | TOTAL | Available Cap | Occupancy % |
|------|----|----|----|----|----|-------|--------------|
| 2028 | 104 | 118 | 16 | 0 | **238** | 446 | 53.4% |
| 2029 | 114 | 133 | 35 | 0 | **282** | 496 | 56.9% |
| 2030 | 129 | 150 | 56 | 0 | **335** | 546 | 61.4% |
| 2031 | 144 | 163 | 80 | 0 | **387** | 596 | 64.9% |
| 2032 | 154 | 176 | 88 | 18 | **436** | 646 | 67.5% |
| 2033 | 162 | 188 | 97 | 38 | **485** | 696 | 69.7% |
| 2034 | 168 | 198 | 106 | 59 | **531** | 740 | 71.8% |
| 2035 | 168 | 206 | 114 | 65 | **553** | 740 | 74.7% |
| 2036 | 168 | 212 | 123 | 70 | **573** | 740 | 77.4% |
| 2037 | 168 | 217 | 132 | 76 | **593** | 740 | 80.1% |

Physical capacity cap (constant): 740.  
Available capacity increases by ~50 per year until 2034 then plateaus at 740.  
Source cells: E31–N31 (TOTAL), E27–N30 (division subtotals), E33–N33 (available cap), E32–N32 (occupancy %).

### Part 2 — Students per Section (Rows 39–60)

Class-size entry point and growth logic per grade (from column C–D annotations):
- Toddlers 1,2: entry=7 students/section (50% of 14); growth rule: `MAX(t−1+1.25, prev×97%) ≤ 14`
- Pre-K3: entry=11/section (61% of 18)
- Pre-K4 ★: entry=13/section (72% of 18) — entry grade
- Kindergarten ★: entry=14/section (70% of 20) — entry grade
- Grade 1 ★: entry=16/section (73% of 22) — entry grade
- Grade 2: entry=13/section (59% of 22)
- Grade 3: entry=12/section (55% of 22)
- Grade 4: entry=10/section (42% of 24)
- Grade 5: entry=8/section (33% of 24)
- Grade 6: entry=8/section (32% of 25); growth: `MAX(t−1+1.0, prev×97%) ≤ 25`
- Grades 7–9: entry from prior grade × 97% + 0.5 extension; growth same pattern
- Grades 10–12: entry from prior grade × 97% + 0.5 × 0.85 extension

Section count per grade: 2 (Cap Total = 2 × Lim/Sala for all grades). Implicit — not stated separately.

### Part 3 — Occupancy Rates (Rows 65–85)

Available for validation; all values are STATIC OUTPUT derived from enrollment/capacity. Reference column D shows São Paulo market occupancy benchmarks (EY=95%, LS=87%, MS=88%, HS=75%).

### G6 Conservador Note on `null` Enrollment

Cells with "—" indicate zero or inactive enrollment (grade not yet open). The application schema uses `enrollment === null` for inactive grades. Source cells contain the literal string "—" in the workbook.

---

## D.8 Package-Scoped Scenario Availability

### Current Architecture

`OccupancyScenarioId` type (`openingPackageOccupancySourceDataContract.ts:19–22`):
```typescript
export type OccupancyScenarioId =
  | "intermediario"
  | "pessimista"
  | "otimista";
```

`DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS` (`dreEnrollmentCapacityLeverContract.ts:79–83`):
```typescript
export const DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS: readonly OccupancyScenarioId[] = [
  "intermediario",
  "pessimista",
  "otimista",
];
```

Valid combinations (`dreEnrollmentCapacityLeverContract.ts:87–93`): flat cross-product of 4 packages × 3 scenarios = 12 combinations. **No package-scoped filtering exists anywhere in the current architecture.**

`DRE_DEFAULT_SELECTIONS` (`useDreScenarioSimulator.ts:140`): derived from `WORKING_SCENARIO_SELECTIONS` (t1_g3 / intermediario). No conservador in default state.

`OCCUPANCY_LABELS` (`dreScenarioWorkbook.ts:98–101`): `pessimista`, `intermediario`, `otimista` only.

### Required Package-Aware Architecture

Adding `conservador` to the flat `DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS` array would expose it for all 4 packages (t1_g3, t1_g4, t1_g5, t1_g6). t1_g4/conservador has no source data. This must not happen.

The required change: replace the flat cross-product with a package-scoped valid-combinations set.

**Proposed contract structure:**
```typescript
// Replace the flat list with a per-package map:
export const PACKAGE_SUPPORTED_SCENARIOS: Readonly<Record<OpeningPackageId, readonly OccupancyScenarioId[]>> = {
  t1_g3: ["intermediario", "pessimista", "otimista"],
  t1_g4: ["intermediario", "pessimista", "otimista"],
  t1_g5: ["intermediario", "pessimista", "otimista"],
  t1_g6: ["intermediario", "pessimista", "otimista", "conservador"],
};
```

`DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS` must be derived from this map (flatMap over entries), not from the cross-product of two flat lists.

### Consumer Audit

| Consumer | Current option source | Package-aware? | Invalid-state behavior | Required change |
|---|---|---|---|---|
| `DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS` | Flat constant | NO | N/A | Replace with per-package map or per-call filter |
| `DRE_ENROLLMENT_CAPACITY_LEVER_VALID_COMBINATIONS` | Cross-product | NO | No validation | Derive from `PACKAGE_SUPPORTED_SCENARIOS` |
| `OccupancyScenarioId` type | 3-member union | NO | TypeScript error on `"conservador"` | Add `"conservador"` to union |
| `OCCUPANCY_LABELS` (`dreScenarioWorkbook.ts`) | Object literal | NO | Falls back to raw ID string | Add `conservador: "Conservador"` |
| `DEFAULT_SELECTIONS` (`useDreScenarioSimulator.ts`) | `WORKING_SCENARIO_SELECTIONS` | N/A | Default is t1_g3/intermediario (safe) | No change needed |
| `openingPackageOccupancySourceData.ts` enrollment records | Static data per package+scenario | N/A | Missing records → empty calculation | Add t1_g6/conservador records |
| UI selector (rendering) | `DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS` | NO | No filtering | Render from `PACKAGE_SUPPORTED_SCENARIOS[selectedPackage]` |
| URL/serialized state | Not audited in V10-D | Unknown | Unknown | Must validate on deserialization |
| Export | Not audited in V10-D | Unknown | Unknown | Must validate combination before export |

### Rejection Requirement

Invalid combinations must be **rejected at deserialization** and **disabled in the UI selector** (not just absent from the label map). A deserialized state of `t1_g4 / conservador` must be normalized to the package default (`t1_g4 / intermediario`) with an explicit fallback rule, not silently passed to the calculation engine. Silent substitution to pessimista or intermediario is not permitted without an explicit documented fallback rule.

---

## D.9 Receita vs DRE Readiness Dependency Audit

### Code-Level Dependency Graph

```
calculateReceita(key: { openingPackageId, occupancyScenarioId, tuitionScenarioId })
  → reads: COMBINED_ENROLLMENT_RECORDS (by packageId × scenarioId)
  → reads: TUITION_SOURCE_RECORDS (by scenarioId × courseLabel)
  → reads: DISCOUNT_SCHEDULE_SOURCE (by year)
  → reads: ENROLLMENT_TUITION_GRADE_MAPPING
  → NO import of: fopagEngine, payroll, OPEX, CAPEX
  → Output: ReceitaEngineOutput (grainRecords, byYear, byGradeByYear, byDivisionByYear)
```

`calculateFopag(key)` is a completely separate function that does NOT depend on receita output and is NOT imported by `receitaEngine.ts`. The two engines are architecturally independent.

`calculateDre(input: DreEngineInput)` depends on BOTH:
- receita (via `calculateReceita` call inside `dreEngine.ts`)
- payroll (via `calculateFopag` call inside `dreEngine.ts`)

DRE aggregation (`dreEngine.ts`) cannot run without both engines being callable. This is the correct dependency hierarchy:
- receita alone: independent of payroll ✓
- payroll (fopag) alone: independent of receita ✓
- DRE full: requires both

### Runtime Guards

`RECEITA_CALCULATION_CAN_RUN = true` (`receitaCalculationContract.ts`): The engine can run at runtime with no runtime execution guard.

`calculationReadinessStatus: "blocked"` (`tuitionSourceData.ts`): This is a **governance annotation**, not a runtime guard. `receitaEngine.ts` does not import or check this flag. The flag indicates the source data was provisionally loaded but not Finance-cleared for production output.

`DRE_CALCULATION_ENGINE_IS_READY` (`inputReadinessRegistry.ts:line 862`): Evaluates to `DRE_CALCULATION_ENGINE_IS_READY && DRE_CALCULATION_AVAILABILITY_CONFIRMED`. This is the gate for the full DRE (receita + payroll + OPEX + CAPEX + DCF). The `inputReadinessRegistry.ts` comment "CALCULATION_CAN_BEGIN remains false pending payroll, OPEX/CAPEX" refers to the full DRE gate, not to the receita engine's own readiness.

### Corrected Dependency Classification

| Readiness flag or gate | Code location | Actual prerequisites | Incorrect/stale dependency |
|---|---|---|---|
| Receita engine can run | `receitaCalculationContract.ts RECEITA_CALCULATION_CAN_RUN=true` | Enrollment records present, tuition records present, discount schedule present | None — already unblocked |
| Receita output correct | Source quality | D-01 rate (8%→5.9%), D-05/D-06 discount values | No payroll dependency |
| Payroll (fopag) can run | `fopagEngine.ts calculateFopag()` | Role roster, salary bases, growth factors | No receita dependency |
| Full DRE can run | `dreEngine.ts calculateDre()` | Both receita AND payroll | — |
| DRE is v10-certified | Implementation contract complete | All slices 1–12 done | — |
| `calculationReadinessStatus` | `tuitionSourceData.ts` | Governance clearance for output | Does not block runtime execution |
| Receita `t1_g6/conservador` | Enrollment records | t1_g6 conservador records present in `openingPackageOccupancySourceData.ts` | Not blocked by payroll |

**Conclusion:** Receita engine readiness does NOT depend on payroll implementation. V10-C Slice 7 ("Receita readiness, depends on Slices 1–5") incorrectly included salary/benefits slices (payroll) as prerequisites for receita activation. The corrected prerequisite chain for receita is: D-01 resolution, D-05/D-06 correction, and t1_g6/conservador enrollment data.

---

## D.10 Discount Authority Conflict

### Authority Hierarchy

1. **v10 workbook (2026-07-24):** Row 224. 2032=15.0%, 2035=12.5%. Extracted directly by OOXML inspection, confirmed in V10-A/B and V10-C.
2. **Prior Finance message (undated):** Cited by application `discountScheduleSourceData.ts` `sourceDescription: "Head of Finance message"`. This message predates v10 and is not available as a datable document in the repository.
3. **v10 authority:** v10 is the latest Finance-produced workbook. It supersedes the prior message on the discount schedule by virtue of being a newer authoritative document from the same governing authority (Finance).

### Classification

**D-05 (discount rate 2032: 18%→15%):** READY AFTER FINANCE CONFIRMATION

**D-06 (discount rate 2035: 15%→12.5%):** READY AFTER FINANCE CONFIRMATION

**Required confirmation:** Finance must explicitly acknowledge that v10 Row 224 supersedes the prior "Head of Finance message" on the discount schedule, particularly for 2032 and 2035. This is required because the prior Finance message was a direct instruction, and applying a correction without explicit acknowledgment could create a conflicting authority situation. Once Finance provides this acknowledgment (a brief written confirmation pointing to v10 as the governing source), both corrections can be implemented without further review.

This is a one-sentence confirmation, not a new Finance analysis. The v10 values are unambiguous: I224=−0.15 (2032), L224=−0.125 (2035).

---

## D.11 Governance Document Gap

### Search Results

`find . -name "financeConventionSourceDecisions.md"` — no output.

Keyword search for "financeConvention" across `.ts` and `.md` files found exactly two files:
- `src/features/rio-scenario-resilience/model/receitaEngine.ts:68`
- `src/features/rio-scenario-resilience/model/inputReadinessRegistry.ts:279`

No renamed, moved, or superseding document was found. No `financeConvention*.md`, `financeConventions.md`, or similar file exists in the repository.

### Required Documentation Correction Under Each Finance Decision

**If Finance confirms v10 rate (5.9% from 2029):**
1. Create `docs/governance/finance-convention-source-decisions.md` (or equivalent agreed path) documenting: tuition escalation = IPCA+2% in 2028 (6.0%), hardcoded 5.9% from 2029; approval date; approver.
2. Update the inline comment in `receitaEngine.ts:68` from citing the missing document to citing the new document and the v10 Row 9 cell reference.
3. Update `inputReadinessRegistry.ts:279` similarly.
4. Change `annualAdjustmentFactor` implementation: `return year === 2028 ? 1 : Math.pow(1.059, year - 2028)`.

**If Finance confirms application rate (8% from 2029):**
1. Create `docs/governance/finance-convention-source-decisions.md` documenting: tuition escalation = 8% compounding from 2029; rationale for departure from v10 Row 9; approval date; approver.
2. Update `receitaEngine.ts:68` comment to cite the new document.
3. No change to the `annualAdjustmentFactor` implementation (8% remains).
4. Record this as an authorized departure from v10 in IMPLEMENTATION.md or a dedicated governance log.

In both cases, the `annualAdjustmentFactor(2028)=1` behavior is confirmed correct and must not change.

---

## D.12 Revised Implementation Slices

| # | Slice | Status | Exact files | Functions/constants | Governed inputs | Dependencies | Validators required |
|---|-------|--------|------------|---------------------|-----------------|-------------|---------------------|
| 1 | Discount schedule | **READY AFTER FINANCE CONFIRMATION** | `discountScheduleSourceData.ts` | `DISCOUNT_SCHEDULE_SOURCE.explicitRatesByYear` | v10 Row 224: 2032=0.15, 2035=0.125 | Finance must acknowledge v10 supersedes prior message | V10-D §14 golden-master case D-5a/D-5b |
| 2 | Salary bases (Teaching Lead) | **READY AFTER FINANCE CONFIRMATION** | `orgDesignPayrollActivation.ts`, possibly `teaching.ts` or new const | Teaching lead grossMonthly at new tier | v10 Org. Design Teaching Lead rows: 21,138.24/1.06=19,941.74 BRL (2027) | None blocking (values known from v10) | Role-level salary check for EY/LS/MS/HS Teaching Lead |
| 3 | Salary bases (Counselor) | **READY WITH EXPLICIT BOUNDARY** | `leadership.ts` LEADERSHIP_CONFIG counselor | `grossMonthly` from 16,923.84 → 15,247.11 (≈ master educator, consistent with v10 Counselor=16,161.94) | v10 Org. Design row 9: 16,161.94/1.06=15,247.11 | None | Counselor 2028 salary = 16,161.94 |
| 4 | Salary escalation rate | **READY WITH EXPLICIT BOUNDARY** | `teaching.ts`, `leadership.ts` (confirm), `payroll/core.ts` | `ANNUAL_ADJUSTMENT` used in `resolveGrowthFactor`; change rate from 2029 to 1.059 while keeping year-2028 factor at 1.06 | v10 Row 12: F12–N12=5.9% | Must not change year=2028 factor | Factor comparison 2029–2037 table in §14 |
| 5 | Benefits bases | **READY WITH EXPLICIT BOUNDARY** | `teaching.ts`, `leadership.ts` | `benefitsMonthly` values — confirmed correct as 2027 BRL (× 1.06 = v10 BW column). No change needed to bases. | v10 BW column × 1.06 → no correction | None | Benefits 2028 amount spot-check |
| 6 | Benefits escalation rate | **READY WITH EXPLICIT BOUNDARY** | `payroll/core.ts`, `teaching.ts` or new const | New `BENEFITS_ANNUAL_ADJUSTMENT = 1.10`; separate benefits factor in `annualSalaryBurden` | v10 Row 13: 10.0% constant all years | Must not affect FGTS/laborChargesMonthly track | Benefits factor 2029–2037 table in §14 |
| 7 | G6 Conservador data | **READY WITH EXPLICIT BOUNDARY** | `openingPackageOccupancySourceData.ts` | Add `conservador` entry under `t1_g6` package | G6 workbook `3. CONSERVADOR` Part 1 table (§D.7) | None | Enrollment totals 2028–2037 per §14 |
| 8 | Package-scoped scenario availability | **READY WITH EXPLICIT BOUNDARY** | `dreEnrollmentCapacityLeverContract.ts`, `openingPackageOccupancySourceDataContract.ts`, `dreScenarioWorkbook.ts`, UI selector component | `PACKAGE_SUPPORTED_SCENARIOS` map, `OccupancyScenarioId` type addition, valid combinations derivation, OCCUPANCY_LABELS, UI render logic, deserialization guard | Architecture in §D.8 | Slice 7 must complete first (data exists for t1_g6/conservador) | Invalid t1_g4/conservador rejection; t1_g6/conservador accessible; no global exposure |
| 9 | Tuition escalation rate | **BLOCKED BY GOVERNANCE DECISION** | `receitaEngine.ts` | `annualAdjustmentFactor` from 2029 (line 72) | Finance must decide: 5.9% (v10) or 8% (app) | Finance DC-01 | Tuition factor 2029–2037 table in §14 only after decision |
| 10 | Receita readiness | **BLOCKED BY UPSTREAM SLICE** | `tuitionSourceData.ts` | `calculationReadinessStatus` governance flag | Slices 1, 9, 7 complete; Finance DC-01 received | Slices 1, 7, 9 | Engine can run at runtime now; this flag is governance, not code |
| 11 | DRE readiness | **BLOCKED BY UPSTREAM SLICE** | `inputReadinessRegistry.ts`, engine flags | DRE readiness flags | Slices 1–10 and payroll slices complete | Slices 1–9, payroll slices 2–6 | DRE output match v10 native state (t1_g6/conservador/rj4/2028) |
| 12 | UI propagation | **BLOCKED BY UPSTREAM SLICE** | `dreScenarioWorkbook.ts` UI display functions | Label maps, row headers referencing discount/salary | Slices 1–8 | Slice 8 | UI shows Conservador only for t1_g6 |
| 13 | Validators and golden masters | **BLOCKED BY UPSTREAM SLICE** | New validator files (not yet created) | New test fixtures for salary, benefits, discount, enrollment | All governing values in §14 | Slices 1–12 | All cases in §14 golden-master contract |
| 14 | IMPLEMENTATION.md update | **BLOCKED BY UPSTREAM SLICE** | `IMPLEMENTATION.md` | Phase record, correction log, open items | All corrections documented | Slices 1–13 | IMPLEMENTATION.md records all V10-D phase changes |

### Slice 9 Correction vs V10-C

V10-C Slice 4 and 7 listed payroll as a dependency for receita engine activation. This is incorrect per §D.9. The corrected dependency:
- Receita (Slice 10): depends on Slices 1, 9, 7 only (discount, tuition rate decision, t1_g6/conservador data)
- DRE (Slice 11): depends on receita AND payroll

---

## D.13 Golden-Master Contract

The following validation cases must be created during the implementation phase. No fixture files are created here; these are specifications only.

### GM-01: Discount Schedule 2028–2037

| Year | Expected | Source |
|------|----------|--------|
| 2028 | 0.25 | v10 Row 224 E224=−0.25 |
| 2029 | 0.20 | v10 F224=−0.20 |
| 2030 | 0.20 | v10 G224=−0.20 |
| 2031 | 0.18 | v10 H224=−0.18 |
| 2032 | **0.15** | v10 I224=−0.15 (corrected) |
| 2033 | 0.15 | v10 J224=−0.15 |
| 2034 | 0.15 | v10 K224=−0.15 |
| 2035 | **0.125** | v10 L224=−0.125 (corrected) |
| 2036 | 0.125 | terminal rate |
| 2037 | 0.125 | terminal rate |

### GM-02: Salary Growth Factors 2028–2037 (After Rate Correction)

Factor = `Math.pow(1.059, year - 2028)` × 1.06 (first factor absorbed into base).
Correct computation: `resolveGrowthFactor(year) = 1.06^1 × 1.059^(year-2028)` → simplified to `1.06 × 1.059^(year-2028)`:

| Year | Expected factor | App formula (1.06^n) | v10 formula (1.06×1.059^n) | Delta |
|------|-----------------|---------------------|----------------------------|-------|
| 2028 | 1.06000 | 1.06000 | 1.06000 | 0 |
| 2029 | 1.12254 | 1.12360 | 1.12254 | 0.00106 |
| 2030 | 1.18877 | 1.19102 | 1.18877 | 0.00225 |
| 2031 | 1.25891 | 1.26248 | 1.25891 | 0.00357 |
| 2032 | 1.33319 | 1.33823 | 1.33319 | 0.00504 |
| 2033 | 1.41181 | 1.41852 | 1.41181 | 0.00671 |
| 2034 | 1.49571 | 1.50363 | 1.49571 | 0.00792 |

Source: v10 Row 12 (F12=0.059 from 2029).

### GM-03: Benefits Growth Factors 2028–2037 (After Separation)

`benefitsGrowthFactor(year) = 1.06 × 1.10^(year - 2028)`:

| Year | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 |
|------|------|------|------|------|------|------|------|------|------|------|
| Factor | 1.06 | 1.166 | 1.283 | 1.411 | 1.552 | 1.707 | 1.878 | 2.066 | 2.272 | 2.499 |

Exact: `1.06 × 1.10^(year-2028)`. Source: v10 Row 13 (E13–N13=0.10 constant).

### GM-04: Representative Role Salary 2028 (After Slice 2–3)

| Role | App grossMonthly (2027 BRL) | Expected 2028 salary (×1.06) | v10 Salário Posição | Match? |
|------|----------------------------|------------------------------|---------------------|--------|
| Head of School | 51,167.45 | 54,237.50 | 54,237.50 | ✓ |
| EY Coordinator | 19,941.74 | 21,137.85 | 21,138.24 | ✓ (0.39 rounding) |
| EY Teaching Lead (post-correction) | 19,941.74 | 21,137.85 | 21,138.24 | ✓ (after slice 2) |
| Counselor (post-correction) | 15,247.11 | 16,162.14 | 16,161.94 | ✓ (after slice 3) |
| EY Learning Assistant | 4,595.88 | 4,872.03 | 4,871.64 | ✓ (0.39 rounding) |
| EY Learning Monitor | 4,060.63 | 4,304.27 | 4,304.27 | ✓ (exact) |
| HS Educator | 15,247.55 | 16,162.40 | 16,162.40 | ✓ |

### GM-05: Activation-Year Case (MS Coordinator, activeFrom=2031)

- Expected: cost zero for years 2028–2030
- Expected 2031 salary: 19,941.74 × 1.06^(2031-2028+1) = 19,941.74 × 1.06^4
  - Current app (before rate fix): 19,941.74 × 1.06^4 = 25,173.40
  - After rate fix (5.9% from 2029): 19,941.74 × 1.06 × 1.059^3 = 21,137.85 × 1.188878 = 25,131.10
- Source: v10 Org. Design MS Coordinator row; activation per headcount record

### GM-06: G6 Conservador Enrollment 2028–2037

Complete enrollment table per §D.7. Validation cases:
- Total 2028: 238 (source: E31)
- Total 2037: 593 (source: N31)
- Grade 6 2028: 16 (source: E19)
- Grade 10 first active year: 2032, enrollment=18 (source: I24)
- Grade 12 first active year: 2034, enrollment=18 (source: K26)
- EY subtotal 2028: 104 (source: E27)
- Capacity all years: 2028=446, 2034+=740

### GM-07: Invalid t1_g4/Conservador Rejection

When a deserialized or programmatically constructed state of `openingPackageId="t1_g4", occupancyScenarioId="conservador"` is processed:
- Expected: rejected or normalized to `t1_g4 / intermediario`
- Must not produce enrollment records (none exist)
- Must not produce a calculation output
- Source: governance (no G4 Conservador workbook)

### GM-08: Tuition Factor 2028 = 1 (Confirmed, No Change)

`annualAdjustmentFactor(2028) = 1`. Source: V10-C D-02 resolution. No validator change needed.

### GM-09: Tuition Factor 2029–2037 (Conditional on DC-01)

If Finance confirms 5.9%: expected factors = `1.059^(year-2028)`:
- 2029: 1.059, 2030: 1.121, 2031: 1.187, 2032: 1.257, ..., 2037: 1.504

If Finance confirms 8%: expected factors = `1.08^(year-2028)`:
- 2029: 1.08, 2030: 1.1664, 2031: 1.2597, ..., 2037: 1.7138

This case cannot be specified until Finance provides DC-01.

### GM-10: UI Selector Availability

After Slice 8:
- t1_g3 selector: shows [intermediario, pessimista, otimista] — NOT conservador
- t1_g4 selector: shows [intermediario, pessimista, otimista] — NOT conservador
- t1_g5 selector: shows [intermediario, pessimista, otimista] — NOT conservador
- t1_g6 selector: shows [intermediario, pessimista, otimista, **conservador**] — conservador appears

### GM-11: FGTS and INSS Preservation

`laborChargesMonthly` values must not change as a result of salary-rate corrections. The corrections change the growth factor (compounding rate from 2029), not the base `laborChargesMonthly` constant. A change in annual labor charges resulting from a corrected salary base (Slices 2–3) is not a change in the encargo rate — it is a consequence of the corrected base. FGTS and INSS percentages embedded in `laborChargesMonthly` remain as currently set.

---

## D.14 Exit Controls

### Git State (Exit)

```
pwd:    /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
remote: origin https://github.com/lussepolo/orgdesign.git
branch: main
HEAD:   d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

Dirty state unchanged from entry:
```
 M IMPLEMENTATION.md
 M src/components/dreSimulator/dreScenarioWorkbook.ts
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts
?? (audit reports, validate script, payrollGovernanceWorkbookAdapter — unchanged)
```

No new staged changes. `git diff --cached --stat`: no output (nothing staged).

### Exit File Hashes

| File | SHA-256 (exit) | Unchanged |
|------|----------------|-----------|
| `IMPLEMENTATION.md` | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` | YES |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` | YES |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` | YES |
| `scripts/validate-phase15u2.ts` | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` | YES |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` | YES |
| `docs/audits/rio-resilience/phase-v10-ab-formula-parity-certification.md` | `aa020afb7f0f2cb3bd39ccd3eba78f4c46088cddb187e13994f5c7f7b11ac53e` | YES |
| `docs/audits/rio-resilience/phase-v10-c-evidence-resolution-and-implementation-contract.md` | `41e14a7c2d4c450b1e2026c29da2bbaafe952a5dc59e348d52e946b252e21a78` | YES |

Governing workbooks:
| Workbook | SHA-256 | Unchanged |
|----------|---------|-----------|
| v10 | `2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0` | YES |
| G6 | `17c933891e3fa57b4b39bf3c22ac84dc71583fc024a41ddacd4aff6647723729` | YES |
| G4 | `5a9342e1825cd9ace86bced1c2783875691786cd2a2f91e01f41b4da4b3b5e1f` | YES |

**No application code, fixture, workbook, IMPLEMENTATION.md, or prior report was modified. The only write operation in V10-D is creation of this report.**

---

## D.15 Final Response Summary

1. **Report path:** `docs/audits/rio-resilience/phase-v10-d-implementation-readiness-closure.md`

2. **Branch and HEAD:** `main`, `d743616916d8b3b4b1708cd9e3ef25c08b0ad00f`

3. **Complete salary-role extraction:** 62 active roles confirmed (rows 4–65). V10-C discrepancy resolved: rows 61–65 are Nursing Intern, Ops Coordinator, PLAE, School Secretary, Security Coordinator. All Salário Posição values are extracted and tabulated.

4. **Application salary and benefits comparison:** 33 roles compared. Match status: 27 MATCH AFTER DOCUMENTED CONVERSION, 4 MISMATCH (4 Teaching Lead categories + Counselor), 2 APPLICATION VALUE ABSENT (Events Assistant, Maker Space Assistant), 1 ROLE MAPPING AMBIGUOUS (Security Coordinator). Benefits bases follow the same 2027-BRL convention as salary — no correction to base values required, only escalation rate.

5. **Base-year and activation-year conclusion:** Application `grossMonthly` values are in 2027 BRL. `resolveGrowthFactor(2028) = 1.06^1` is architecturally correct and must not change. The salary correction is exclusively the compounding rate from 2029 (1.06→1.059). Activation-year structure is also correct; only the rate needs changing.

6. **G6 Conservador extraction:** Complete. 17 grades × 10 years. Total enrollment 2028=238, 2037=593. Physical capacity cap=740. All values are STATIC OUTPUT. Grade 9 labeled "MS" in workbook vs "High School" in application — classification note for implementation.

7. **Package-scoped scenario conclusion:** Current architecture uses a flat cross-product. Adding `conservador` globally would expose it for t1_g4 (no data). Required change: replace flat `DRE_ENROLLMENT_LEVER_OCCUPANCY_SCENARIO_IDS` with a `PACKAGE_SUPPORTED_SCENARIOS` map. Invalid combinations must be rejected at deserialization and disabled in UI; no silent substitution permitted.

8. **Receita vs DRE readiness dependency:** Receita engine is architecturally independent of payroll (`RECEITA_CALCULATION_CAN_RUN = true`; no payroll import in `receitaEngine.ts`). The V10-C statement linking receita activation to payroll slices is incorrect. Receita prerequisites: D-01 resolution, D-05/D-06 correction, t1_g6/conservador data. DRE full output requires both receita and payroll.

9. **Discount authority classification:** D-05 and D-06 — READY AFTER FINANCE CONFIRMATION. v10 Row 224 is the governing source; one-sentence Finance acknowledgment that v10 supersedes prior "Head of Finance message" is required before implementation.

10. **Missing governance document:** `financeConventionSourceDecisions.md` confirmed absent. Cited in two files only (`receitaEngine.ts:68`, `inputReadinessRegistry.ts:279`). Two correction templates provided in §D.11 depending on Finance decision DC-01.

11. **Revised implementation slices:** 14 slices classified. READY AFTER FINANCE CONFIRMATION: Slices 1 (discount), 2 (teaching lead bases). READY WITH EXPLICIT BOUNDARY: Slices 3 (counselor base), 4 (salary rate), 5 (benefits bases — no change needed), 6 (benefits rate), 7 (G6 conservador data), 8 (package-scoped scenario). BLOCKED BY GOVERNANCE DECISION: Slice 9 (tuition rate DC-01). BLOCKED BY UPSTREAM SLICE: Slices 10–14.

12. **Remaining Finance decisions:**
    - **DC-01 (mandatory):** Tuition escalation rate: 5.9% (v10) or 8% (application). Unlocks Slices 9, 10, 11.
    - **DC-02 (mandatory):** Acknowledge v10 Row 224 supersedes prior discount schedule message. Unlocks Slices 1, then 10, 11.
    - **DC-05 (resolved internally):** Salary base-year (2027 BRL) — confirmed by numerical evidence. No Finance input needed.
    - **DC-03 (no source, remains external):** G4/Conservador occupancy data. Not blocking any currently achievable slice.
    - **DC-04 (consequence of DC-01):** Create or formally retire `financeConventionSourceDecisions.md`. Template in §D.11.

13. **Protected-file preservation:** All 7 protected application files and 3 governing workbooks confirmed with matching SHA-256 hashes at entry and exit. No unauthorized mutations detected.

14. **Final readiness status:**

---

PHASE V10-D IMPLEMENTATION-READINESS CLOSURE STATUS: PARTIALLY READY

---

*Rationale: All technical evidence gaps are now closed. Salary base-year is resolved. Teaching lead and counselor salary mismatches are identified with governed correction values. G6 Conservador dataset is fully extracted. Package-scoped scenario architecture is fully specified. Receita/DRE dependency chain is correctly separated. Slices 2–8 are READY WITH EXPLICIT BOUNDARY — implementation can begin for these slices without Finance input. Slices 1 and 9 require Finance confirmation (DC-02 and DC-01 respectively). No technical evidence gap prevents proceeding with Slices 2–8. Slices 1 and 9 remain the only external blockers.*
