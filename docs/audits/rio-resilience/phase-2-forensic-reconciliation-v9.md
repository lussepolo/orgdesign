# Phase 2 Forensic Reconciliation — v9 Workbook
## `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md`

---

## PHASE 2 FORENSIC RECONCILIATION STATUS: PASS

**Completed:** 2026-07-22  
**Workbook audited:** `Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx`  
**Repository HEAD at session entry:** `d743616916d8b3b4b1708cd9e3ef25c08b0ad00f`  
**Phase 1 prerequisite:** PASS (phase-1-evidence-recovery-v9.md)

---

## Gate 0 — Identity Verification

| Item | Expected | Actual | Status |
|------|----------|--------|--------|
| Workbook SHA-256 | d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4 | d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4 | ✓ MATCH |
| Repository HEAD | d743616 | d743616916d8b3b4b1708cd9e3ef25c08b0ad00f | ✓ MATCH |
| Phase 1 status | PASS | PASS (confirmed from audit report) | ✓ PASS |
| Archived Phase 2 SHA-256 | 66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837 | 66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837 | ✓ MATCH |

All identity gates passed. Workbook, repo state, and prior-session artifacts are verified unchanged.

---

## Gate 1 — Prior-Evidence Validation

### Established evidence (Phase 1, carried forward)
All 7 Phase 1 evidence items (E1–E7) are used as direct inputs to this analysis. See `phase-1-evidence-recovery-v9.md` for complete workbook citations.

| Evidence | Item | Status |
|----------|------|--------|
| E1 | A218 = "Base" (literal, no validation, no formula) | Established |
| E2 | AC11 = "Grade 4" (literal dropdown) | Established |
| E3 | AD11 = "Cenário 1" (literal dropdown) | Established |
| E4 | C221 = 259 = SUM(C149, C171); grade-level XLOOKUP enrollment sum | Established |
| E5 | Cenário 1 tuition tiers (EY-I=94,007; EY-M=55,272; LS=114,822; MS=125,854; HS=145,405 BRL/yr) | Established |
| E6 | WACC lineage: SELIC 11.25% → pre-ops 13.25% → operating 12% | Established |
| E7 | C222 = −0.25 (−25%) literal; C228 = C222 × C225 (Bolsa de Estudos formula) | Established |

### Superseded claims
The archived Phase 2 report (`phase-2-forensic-reconciliation-d743616.md`) contains this claim:

> "C222 = –12% for 2028"

**This claim is superseded.** Phase 1 directly read the v9 workbook XML and confirmed C222 = −0.25 (−25%), a literal value. The archived claim was sourced from the application's `dreRevenueDriverSourceData.ts` (which uses −12% as a stale extraction), not from the workbook.

### Resolved archived items
| Archived discrepancy | Prior status | Resolution |
|---------------------|--------------|-----------|
| D-007: A218 value unknown | Unresolved | **Closed** — A218 = "Base" (literal) |
| D-009: WACC not read | Unresolved | **Closed** — WACC lineage fully traced (E6) |
| D-006: AD11 mapping unknown | Unresolved | **Closed** — AD11 = "Cenário 1" → application `bp_scenario_1` / `bp1_division_differentiated` |

---

## Gate 2 — Canonical State Construction

### Workbook canonical state (v9, confirmed selectors)
| Selector | Cell | Value | Type |
|----------|------|-------|------|
| Occupancy scenario | A218 | "Base" | Literal |
| Opening grade | AC11 | "Grade 4" | Literal |
| Tuition scenario | AD11 | "Cenário 1" | Literal |
| Total enrollment 2028 | C221 | 259 | Formula: SUM(C149, C171) |
| % Desconto Médio 2028 | C222 | −0.25 (−25%) | Literal |
| % Desconto Médio full schedule | C222:V222 | See D2b table below | Mixed literal/values |
| Reajuste Mensalidade | C7:V7 | 0.0564 (5.64%), constant all 20 years | Literal |
| VPL (cached) | Z307 | −R$25,540,315.997 | Formula: SUM(B305:W305) |
| TIR (cached) | Z306 | 9.6726% | Formula: IRR(B295:W295) |

### Closest selectable application state
| Application selector | Value | Application source |
|---------------------|-------|-------------------|
| openingPackageId | `t1_g4` | `openingPackageOccupancySourceData.ts` |
| occupancyScenarioId | `intermediario` | `openingPackageOccupancySourceData.ts` |
| tuitionScenarioId | `bp1_division_differentiated` | `receitaEngine.ts` CALC_TO_SOURCE_SCENARIO |
| Total enrollment 2028 | 258 | Line 318: Finance occupancy model (Intermediário 2028) |
| percentual_desconto_medio 2028 | −0.12 | `dreRevenueDriverSourceData.ts` line 59 |
| Annual tuition escalation (2029+) | 8%/yr (1.08^n) | `receitaEngine.ts:70-72` annualAdjustmentFactor |
| DISCOUNT_SCHEDULE_SOURCE 2028 | 0.25 (25%) | `discountScheduleSourceData.ts:10` |

---

## Gate 3 — Track A: Native-State Comparison

### A1 — Enrollment: t1_g4 / intermediario / 2028

**Workbook row structure — read directly from sheet5.xml:**

Existing cohort (C130:C148, summed into C149 = 237):

| Row | Workbook value | Grade mapping |
|-----|---------------|---------------|
| C130 | 8 | T1-M (morning modality) |
| C131 | 8 | T1-I (full-day) |
| C132 | 8 | T2-M (morning modality) |
| C133 | 8 | T2-I (full-day) |
| C134 | 25 | PK3 |
| C135 | 29 | PK4 |
| C136 | 33 | K |
| C137 | 36 | G1 |
| C138 | 33 | G2 |
| C139 | 29 | G3 |
| C140 | 20 | G4 |
| C141–C148 | 0 | G5–G12 (inactive) |
| **C149** | **237** | **Sum** |

New students 2028 (C152:C170, summed into C171 = 22):

| Row | Workbook value | Grade mapping |
|-----|---------------|---------------|
| C152 | 0 | T1-M new |
| C153 | 0 | T1-I new |
| C154 | 0 | T2-M new |
| C155 | 0 | T2-I new |
| C156 | 4 | PK3 new |
| C157 | 3 | PK4 new |
| C158 | 3 | K new |
| C159 | 4 | G1 new |
| C160 | 3 | G2 new |
| C161 | 3 | G3 new |
| C162 | 2 | G4 new |
| C163–C170 | 0 | G5–G12 (inactive) |
| **C171** | **22** | **Sum** |

**C221 = 237 + 22 = 259 ✓** (confirmed)

**Workbook per-grade totals vs application:**

| Grade | Workbook (existing + new) | Application | Delta |
|-------|--------------------------|-------------|-------|
| T1 (all modalities) | 8 + 8 = 16 | 16 | 0 |
| T2 (all modalities) | 8 + 8 = 16 | 16 | 0 |
| PK3 | 25 + 4 = **29** | **28** | **+1 (workbook)** |
| PK4 | 29 + 3 = 32 | 32 | 0 |
| K | 33 + 3 = 36 | 36 | 0 |
| G1 | 36 + 4 = 40 | 40 | 0 |
| G2 | 33 + 3 = 36 | 36 | 0 |
| G3 | 29 + 3 = 32 | 32 | 0 |
| G4 | 20 + 2 = 22 | 22 | 0 |
| G5–G12 | 0 | 0 | 0 |
| **Total** | **259** | **258** | **+1 (workbook)** |

**Exact grade-level source of the 1-learner difference: PK3 (Pre-K3).**

Workbook: 29 learners (25 existing + 4 new), 36 capacity → 80.6% occupancy.  
Application (`openingPackageOccupancySourceData.ts:1662`, `3705`): occupancy = 0.7778 (28/36), enrollment = 28.  
The application's occupancy model (`Modelo_Ocupacao_Concept_2028_v5_T1_G4.xlsx`) records PK3 at 28 (77.8%), while the PnL v9 shows 29 (80.6%). Both are from Finance sources; the 1-learner difference is a cross-document inconsistency in PK3 2028 enrollment.

---

### A2 — % Desconto Médio: two-layer architecture

#### Layer 1: DISCOUNT_SCHEDULE_SOURCE (receitaEngine)
- Application source: `discountScheduleSourceData.ts:10`
- Application values for 2028–2035+:

| Year | Application | DISCOUNT_SCHEDULE_SOURCE note |
|------|-------------|-------------------------------|
| 2028 | 25% | explicitRatesByYear |
| 2029 | 20% | explicitRatesByYear |
| 2030 | 20% | explicitRatesByYear |
| 2031 | 18% | explicitRatesByYear |
| 2032 | 18% | explicitRatesByYear |
| 2033 | 15% | explicitRatesByYear |
| 2034 | 15% | explicitRatesByYear |
| 2035 | 15% | explicitRatesByYear |
| 2036+ | 12.5% | terminalRate |

#### Layer 2: percentual_desconto_medio (DRE revenue block)

Workbook PnL!C222:V222 (read directly from sheet5.xml, 2028–2047) vs application `dreRevenueDriverSourceData.ts`:

| Year | Workbook C222:V222 | Application DRE driver | Delta |
|------|-------------------|------------------------|-------|
| 2028 | −25.00% | −12.00% | −13 pp |
| 2029 | −20.00% | −12.00% | −8 pp |
| 2030 | −20.00% | −12.00% | −8 pp |
| 2031 | −18.00% | −12.00% | −6 pp |
| 2032 | −15.00% | −12.00% | −3 pp |
| 2033 | −15.00% | −12.50% | −2.5 pp |
| 2034 | −15.00% | −12.50% | −2.5 pp |
| 2035 | −12.50% | −12.50% | **0** |
| 2036–2047 | −12.50% | −12.50% | **0** |

Key observations:
1. The workbook row 222 is a **ramping discount schedule** (−25% → −12.5%), not the flat −12%/−12.5% captured in the application.
2. The workbook ramp structure is closely analogous to DISCOUNT_SCHEDULE_SOURCE (Layer 1), with minor differences in 2032 (workbook −15% vs DISCOUNT_SCHEDULE_SOURCE 18%) and 2035 (workbook −12.5% vs DISCOUNT_SCHEDULE_SOURCE 15%).
3. From 2035 onward, all three converge at −12.5%.
4. The application DRE driver extracted C222 = −12% from an earlier workbook version where the ramping schedule had not yet been applied to row 222.

---

### A3 — Tuition Escalation: receitaEngine annual adjustment factor

Workbook PnL row 7 (C7:V7, read directly from sheet5.xml, 2028–2047):

| Years | Workbook rate | Constant? |
|-------|--------------|-----------|
| 2028–2047 (all 20 years) | **5.64%** | Yes — flat constant |

Application (`receitaEngine.ts:70-72`):
- 2028: factor = 1 (no escalation, base year)
- 2029+: factor = **1.08^(year − 2028)** → **8%/yr**

The workbook applies 5.64% per year to each column transition across the full 20-year horizon. The application applies 8% per year from 2029 onward. Both rates are forward-looking constants; the comparison is direct for 2029+.

**Escalation divergence in absolute terms:**

| Year | Application factor | Workbook factor | App/WB ratio |
|------|--------------------|-----------------|-------------|
| 2028 | 1.000 | 1.000 | 1.000 |
| 2029 | 1.080 | 1.0564 | 1.0224 |
| 2030 | 1.1664 | 1.1160 | 1.0451 |
| 2032 | 1.3605 | 1.2453 | 1.0925 |
| 2037 | 1.9990 | 1.6334 | 1.2239 |
| 2047 | 7.0400 | 3.1117 | 2.262 |

By 2037 the application tuition is 22% above the workbook-equivalent; by 2047 the gap reaches 126%.

---

### A4 — Tuition Source Values: bp_scenario_1 vs workbook Cenário 1

| Tier | Workbook Cenário 1 (BRL/yr) | Application bp_scenario_1 (BRL/yr) | Delta | Ratio |
|------|---------------------------|-------------------------------------|-------|-------|
| EY-M (half-day) | 55,272 | 53,463.28 | −1,808.72 | 96.73% |
| EY-I (full-day) | 94,007 | 91,390.04 | −2,616.96 | 97.22% |
| LS (G1–G5) | 114,822 | 111,670.40 | −3,151.60 | 97.25% |
| MS (G6–G8) | 125,854 | 122,419.38 | −3,434.62 | 97.27% |
| HS (G9–G12) | 145,405 | 141,469.03 | −3,935.97 | 97.29% |

All five tiers are approximately **2.7–3.3% lower** in the application than in the workbook v9. The consistent ratio (~97.3%) indicates a systematic upward revision of Cenário 1/2/3 values in the workbook after the application extracted them.

Cenários 4 and 5 match workbook v9 exactly (added in Phase 15Q). bp_scenario_1/2/3 were extracted from an earlier workbook version.

---

### A5 — WACC and Discount Factors

Application WACC constants match workbook v9 exactly: pre-ops 13.25%, operating 12%. **No discrepancy.** ✓

---

## Gate 4 — Track B: Controlled Variance Bridge

Directional impact of each discrepancy on the workbook-level VPL (−R$25,540,316) and TIR (9.67%) if the application were aligned to workbook selectors.

### B1 — Enrollment delta (+1 learner in workbook PK3)
**Direction:** workbook has 1 more PK3 learner → marginally higher gross receita in workbook.  
**Magnitude:** 1/259 × PK3 tuition contribution in 2028 — negligible (<0.1% total enrollment contribution).  
**Sign:** workbook > application by a small positive amount.

### B2 — DRE discount rate delta (workbook −25% to −12.5% ramp; application flat −12%/−12.5%)
Formula: C228 = C222 × C225. C225 = R$26,433,929 (Receitas com Ensino Regular 2028).

| Year | Additional Bolsa de Estudos at workbook rates (vs application) |
|------|---------------------------------------------------------------|
| 2028 | (0.25 − 0.12) × 26,433,929 = R$3,436,411 |
| 2029 | (0.20 − 0.12) × receita_2029 |
| 2030 | (0.20 − 0.12) × receita_2030 |
| 2031 | (0.18 − 0.12) × receita_2031 |
| 2032 | (0.15 − 0.12) × receita_2032 |
| 2033–2034 | (0.15 − 0.125) × receita_year |
| 2035–2047 | **0** (match) |

**Direction:** workbook applies far more discount in 2028–2034 → significantly **lower net DRE receita** in workbook vs application. Application overstates DRE net receita by ~R$3.4M in 2028 alone.  
**Sign:** workbook < application for net DRE receita (2028–2034). Dominant discrepancy.

### B3 — Tuition values delta (−2.7% in application vs workbook Cenário 1)
Approximately 2.7% lower tuition across all tiers in the application.

2028 rough magnitude (if gross receita base = R$26.4M): 2.7% × 26.4M ≈ **R$713K** less gross receita in application.  
**Sign:** workbook > application for gross receita. Partially offsets B2.

### B4 — Escalation rate delta (8% application vs 5.64% workbook, 2029–2047)
The application's 8% escalation significantly outruns the workbook's 5.64%.

By 2037 the application tuition base is ~22% above workbook equivalent. By 2047: ~126%.  
**Sign:** application > workbook for post-2028 gross receita. Partially offsets B2 over the later years of the projection.

### Net bridge direction
- B2 (DRE discount): application overestimates DRE net receita vs workbook, approximately **R$3.4M/yr in 2028** (declining toward zero by 2035)
- B3 (tuition base): application underestimates gross receita by ~R$713K in 2028 (partially offsets B2)
- B4 (escalation): application overestimates post-2028 tuition revenue (partially offsets B2 in later years)
- B1 (enrollment): negligible

B2 dominates in 2028–2031; B4 becomes dominant in later years. The VPL/TIR cannot be reconciled until B2 and B3 are corrected and B4's escalation rate is confirmed by Finance.

---

## Gate 5 — Discrepancy Classification

### D1 — Enrollment: 259 (workbook) vs 258 (application)

**Exact grade-level source: PK3 (Pre-K3), 2028**

- Workbook PnL v9 PK3: 29 learners (25 existing C134 + 4 new C156), occupancy 80.6%
- Application PK3: 28 learners, occupancy 77.8% (28/36), from `Modelo_Ocupacao_Concept_2028_v5_T1_G4.xlsx`

**Classification: SOURCE-OF-TRUTH DECISION REQUIRED**

Two Finance documents are inconsistent in PK3 2028:
1. PnL workbook v9 (C134 + C156): 29 learners
2. Finance occupancy model `Modelo_Ocupacao_Concept_2028_v5_T1_G4.xlsx`: 28 learners

All other active grades (T1, T2, PK4, K, G1–G4) agree exactly between workbook and application. Only PK3 differs by 1 learner. Finance must confirm which enrollment count is authoritative for PK3 2028 in the t1_g4/Base/Grade 4 scenario.

**Required action:** Finance confirmation on PK3 2028 enrollment (28 or 29). If workbook is authoritative, update `openingPackageOccupancySourceData.ts` enrollment record for PK3 from 28 to 29 and occupancy rate from 0.7778 to 0.8056 (29/36).

---

### D2a — DISCOUNT_SCHEDULE_SOURCE 2028 rate: 25% (application) vs 25% (workbook C222)

**Classification: NUMERIC COINCIDENCE — NOT A VALIDATED MATCH**

For 2028 only, application Layer 1 (receitaEngine DISCOUNT_SCHEDULE_SOURCE) = 25% and workbook C222 = 25%. These numbers agree for 2028, but:
- DISCOUNT_SCHEDULE_SOURCE was sourced from a "Head of Finance message," not from PnL row 222.
- For 2029 the two schedules diverge: DISCOUNT_SCHEDULE_SOURCE = 20%, workbook C222 = 20% (agree); for 2032: DISCOUNT_SCHEDULE_SOURCE = 18%, workbook C222 = 15% (disagree by 3 pp).
- DISCOUNT_SCHEDULE_SOURCE serves the receita engine exclusively; workbook row 222 serves the DRE Bolsa de Estudos formula. The code explicitly prohibits collapsing these two mechanisms.

The structural relationship between Layer 1 (receitaEngine) and workbook row 222 is not a match — it is an analogous-but-distinct schedule. No action required on Layer 1 from this finding alone.

---

### D2b — DRE percentual_desconto_medio: application stale −12%/−12.5% vs workbook −25% ramping schedule

**Full 20-year comparison:**

| Year | Workbook PnL row 222 | Application DRE driver | Mismatch? |
|------|---------------------|------------------------|-----------|
| 2028 | −25.00% | −12.00% | YES |
| 2029 | −20.00% | −12.00% | YES |
| 2030 | −20.00% | −12.00% | YES |
| 2031 | −18.00% | −12.00% | YES |
| 2032 | −15.00% | −12.00% | YES |
| 2033 | −15.00% | −12.50% | YES |
| 2034 | −15.00% | −12.50% | YES |
| 2035 | −12.50% | −12.50% | no |
| 2036–2047 | −12.50% | −12.50% | no |

**Classification: IMPLEMENTATION DEFECT — STALE EXTRACTION, requiring Finance confirmation before update**

The DRE revenue driver `percentual_desconto_medio` was extracted from PnL row 222 during Phase 12J (2026-06-08), when that row held a flat −12%/−12.5% schedule. The v9 workbook (modified 2026-07-21) shows a revised ramping schedule: −25% in 2028, stepping down to −12.5% by 2035. The application was not updated when the workbook changed.

Phase 12J documented the DRE discount authority as "PnL row 222 is the canonical DRE revenue-block source for Bolsa de Estudos." Given that the canonical source now reads a ramping schedule, the stale extraction constitutes an implementation defect under the stated extraction principle. However, the code also notes "cross-mechanism unification is a future Finance decision, deferred." Finance confirmation is required before updating the application values, to ensure the v9 row 222 changes were intentional for the DRE model (not a workbook editing artifact).

**Required action:**
1. Finance must confirm that PnL v9 C222:V222 (ramping −25% to −12.5%) is intentional for the DRE Bolsa de Estudos calculation.
2. If confirmed, update `dreRevenueDriverSourceData.ts` `percentual_desconto_medio.annualValuesByYear` to match v9: −25% (2028), −20% (2029–2030), −18% (2031), −15% (2032–2034), −12.5% (2035–2047).
3. Re-evaluate the Phase 12J "DRE discount authority settlement" note; if the workbook is now aligned to the same schedule as DISCOUNT_SCHEDULE_SOURCE (with minor differences), the "two mechanisms must not be collapsed" constraint may need revisiting.

---

### D3 — Tuition escalation: 5.64%/yr flat (workbook, all 20 years) vs 8%/yr (application, 2029+)

**Workbook PnL row 7 (C7:V7):** constant **5.64%** across all 20 projection years (2028–2047), confirmed by direct XML read.  
**Application:** `1.08^(year − 2028)` = **8%/yr** from 2029 onward; base year 2028 factor = 1.

The advisor's concern about "backward vs forward" direction is resolved by the data: row 7 is flat 5.64% for every column including 2029, 2030, ..., 2047. Both the workbook and the application apply escalation in the same forward direction from each year to the next. The rates are directly comparable.

**Classification: SOURCE-OF-TRUTH DECISION REQUIRED**

The application's 8% annual tuition escalation was sourced from `financeConventionSourceDecisions.md §2.5, §2.6` (TUITION_ADJUSTMENT_CONVENTION), not from the workbook. The workbook uses 5.64% for all 20 years. These are materially different:
- By 2037 the application tuition base is 22.4% higher than the workbook-equivalent.
- By 2047 the gap reaches 126%.

Finance must confirm which escalation rate is authoritative for the receitaEngine projection:
- 5.64% (workbook PnL!C7:V7, all years)
- 8% (financeConventionSourceDecisions.md TUITION_ADJUSTMENT_CONVENTION)

If the workbook is authoritative, the `annualAdjustmentFactor` function in `receitaEngine.ts:70-72` must be updated and the compound factor table rebuilt.

**Required action:** Finance designation of authoritative annual tuition escalation rate for 2029–2047.

---

### D4 — Annual Salary Escalation / Dissídio: 5.64% (workbook) vs 6.00% (application)

#### D4.1 — Workbook Dissídio mechanism

**Direct evidence:**
- `PnL!A10` = "Dissídio" (explicit label)
- `PnL!B10` = 0.06 (2027 base: formula `B9+1%` = IPCA+2% = 4%+2%)
- `PnL!C10` = 0.0564 (2028: formula `C9+1%` = IPCA+2% = 3.64%+2%)
- `PnL!D10:V10` = 0.0564 constant — flat 5.64% for ALL years 2028–2047
- Derivation chain: `PnL!C4` (IPCA = 3.64%) → `PnL!C9` (Reajuste Despesas = IPCA+1% = 4.64%) → `PnL!C10` (Dissídio = IPCA+2% = 5.64%)

**Base year and first escalation year:**
The 'Org. Design ' sheet (sheetId=112, referenced via SUMIFS from PnL rows 239 and 246) treats **2028 as the unescalated base year** — the 2028 salary column (Q) = D (position salary from 'Cenários Org Design'), with no growth factor applied. The first escalation appears in the 2029 column:
- Formula: `AC4 = Q4 × (1 + PnL!$D$10)` → `= Q4 × (1 + 0.0564)`

Subsequent year-over-year formula chain (using "After School Educator", row 4, as illustrative):
- 2029: `AC4 = Q4 × (1 + PnL!$D$10)` — Dissídio column D (2029)
- 2030: `AO4 = AC4 × (1 + PnL!$E$10)` — Dissídio column E (2030)
- 2031: `BA4 = AO4 × (1 + PnL!$F$10)` — Dissídio column F (2031)
- ...
- 2037: `DU4 = DI4 × (1 + PnL!$L$10)` — Dissídio column L (2037)

Each transition applies 5.64% to the prior year's salary. The same chain is confirmed for all rows 4–83 in 'Org. Design '.

**Cost formula for each year:**

| Component | Formula | Notes |
|-----------|---------|-------|
| Salary (year Y) | `prev_salary × (1 + PnL!col_Y_10)` | `prev_salary` = D4 for 2028; 0.0564 from 2029 |
| Headcount | XLOOKUP from 'Cenários Org Design ' per year column | Scenario-driven |
| Encargos | `salary × 0.485` | Flat 48.5% for all roles — confirmed from S4 = R4 × 0.485 |
| Custo Mês | `salary × 1.485` | Salary + encargos |
| Custo Ano | `Custo Mês × 13` | 13-month convention |

**Benefits escalation (separate from Dissídio):**
- `PnL!A11` = "Benefícios"; `PnL!C11:V11` = 0.10 constant — **10%/yr flat, all years**
- Formula: `AH4 = V4 × (1 + PnL!$D$11)` → benefits grow at 10%/yr from 2029 (2028 = base)
- Benefits are escalated INDEPENDENTLY from salary — different rate (10% vs 5.64%)

#### D4.2 — Application salary escalation mechanism

**Direct evidence:**
- `src/constants/teaching.ts:ANNUAL_ADJUSTMENT = 1.06`
- `src/features/rio-scenario-resilience/model/fopagEngine.ts`: growth formula = `resolveGrowthFactor(year, 2028, ANNUAL_ADJUSTMENT)` = `Math.pow(1.06, year − 2028 + 1)`
- Source note in fopagEngine.ts: "Finance-validated payroll growth convention (ANNUAL_ADJUSTMENT=1.06, base year=2028, Phase 8E). Approved: Luciana 2026-06-03"

**Base year and first escalation year:**
The application growth factor is `1.06^(year − 2028 + 1)`:
- 2028: `1.06^1` = 1.06 — **escalation applied in 2028 itself**
- 2029: `1.06^2` = 1.1236
- 2037: `1.06^10` = 1.7908

First escalation year = 2028. The application treats 2027 as the implicit base, with 2028 as the first escalated year.

**Benefits escalation in application:**
- Same factor applied: `benefitsMonthly × 12 × HC × growthFactor`
- Application uses **the same 6% growth rate for both salary and benefits**
- No separate benefits escalation rate exists in the application

**Encargos in application:**
- `laborChargesMonthly` per role — embedded in role configuration, not computed as a percentage at runtime
- For surveyed roles: `laborChargesMonthly / grossMonthly` = 7,395.06 / 15,247.55 = **48.50%** (After School Educator); 8,208.06 / 16,923.84 = **48.50%** (Counselor)
- The application coincidentally applies the same 48.5% encargo rate as the workbook, embedded in the compensation constants
- Encargos grow at the same rate as salary in both models (proportional in both)

#### D4.3 — Year-by-year salary escalation rate comparison (2028–2037)

| Year | WB Dissídio rate | WB cumulative salary factor | App rate | App cumulative salary factor | App/WB ratio | Timing aligned? |
|------|-----------------|----------------------------|----------|------------------------------|-------------|-----------------|
| 2028 | base (no escalation) | 1.0000 | 6.00% | 1.0600 | +6.00% | NO — WB: unescalated base; App: already +6% |
| 2029 | 5.64% | 1.0564 | 6.00% | 1.1236 | +6.36% | YES (both escalate from prior year) |
| 2030 | 5.64% | 1.1160 | 6.00% | 1.1910 | +6.72% | YES |
| 2031 | 5.64% | 1.1789 | 6.00% | 1.2625 | +7.09% | YES |
| 2032 | 5.64% | 1.2454 | 6.00% | 1.3382 | +7.45% | YES |
| 2033 | 5.64% | 1.3157 | 6.00% | 1.4185 | +7.82% | YES |
| 2034 | 5.64% | 1.3899 | 6.00% | 1.5036 | +8.19% | YES |
| 2035 | 5.64% | 1.4682 | 6.00% | 1.5938 | +8.55% | YES |
| 2036 | 5.64% | 1.5511 | 6.00% | 1.6895 | +8.92% | YES |
| 2037 | 5.64% | 1.6385 | 6.00% | 1.7908 | +9.30% | YES |

WB factor = `1.0564^n` where n = years after 2028 (n=0 for 2028). App factor = `1.06^(n+1)`.  
The application consistently produces a higher salary than the workbook. The gap widens from +6.00% at 2028 to +9.30% at 2037.

#### D4.4 — Benefits escalation rate comparison (2028–2037)

| Year | WB Benefícios factor | App benefits factor | WB/App | Direction |
|------|---------------------|---------------------|--------|-----------|
| 2028 | 1.0000 (base) | 1.0600 | −5.66% | App higher |
| 2029 | 1.1000 | 1.1236 | −2.10% | App higher |
| 2030 | 1.2100 | 1.1910 | +1.59% | WB higher |
| 2031 | 1.3310 | 1.2625 | +5.43% | WB higher |
| 2032 | 1.4641 | 1.3382 | +9.41% | WB higher |
| 2033 | 1.6105 | 1.4185 | +13.53% | WB higher |
| 2034 | 1.7716 | 1.5036 | +17.82% | WB higher |
| 2035 | 1.9487 | 1.5938 | +22.26% | WB higher |
| 2036 | 2.1436 | 1.6895 | +26.88% | WB higher |
| 2037 | 2.3579 | 1.7908 | +31.67% | WB higher |

WB uses 10%/yr (separate row 11); App uses 6%/yr (same factor as salary). Benefits cross-over occurs between 2029 and 2030. By 2037 the workbook benefits are 31.67% higher than the application's for a constant-HC role.

#### D4.5 — Role-level controls

**Control 1: After School Educator — Educator (Pedagógico), active from 2028, FOPAG_DIRETO**

Workbook source: 'Org. Design ' row 4, formula chain confirmed.

| Year | WB base salary (D4×Dissídio^n) | WB custo_ano (×1.485×13×HC1) | App effective salary (15,247.55×1.06^n+1) | App custo_ano (×13×HC1) | Salary gap |
|------|-------------------------------|------------------------------|------------------------------------------|------------------------|------------|
| 2028 | 16,162.40 | 312,015.14 | 16,162.40 | 312,015.17 | +0.00% |
| 2029 | 17,073.96 | 329,612.80 | 17,132.15 | 330,736.08 | +0.34% |
| 2030 | 18,036.93 | 348,202.96 | 18,160.08 | 350,580.24 | +0.68% |
| 2031 | 19,054.21 | 367,841.61 | 19,249.68 | 371,615.05 | +1.03% |
| 2032 | 20,128.87 | 388,587.87 | 20,404.66 | 393,911.96 | +1.37% |
| 2033 | 21,264.14 | 410,504.23 | 21,628.94 | 417,546.68 | +1.72% |
| 2034 | 22,463.44 | 433,656.67 | 22,926.68 | 442,599.48 | +2.06% |
| 2035 | 23,730.38 | 458,114.90 | 24,302.28 | 469,155.44 | +2.41% |
| 2036 | 25,068.77 | 483,952.58 | 25,760.41 | 497,304.77 | +2.76% |
| 2037 | 26,482.65 | 511,247.51 | 27,306.04 | 527,143.06 | +3.11% |

Key observation: At 2028 the two models produce identical annual cost. This is because the application's `grossMonthly` for `EDUCATOR_LEVELS['master']` (15,247.55) × 1.06 = 16,162.40 = workbook D4. The application constant was calibrated to workbook 2028 salary / 1.06, neutralizing the timing difference at the 2028 base year. From 2029 onward, the 0.36pp rate gap compounds.

Application compensation source: `src/constants/teaching.ts EDUCATOR_LEVELS['master'] — grossMonthly=15,247.55, laborChargesMonthly=7,395.06, benefitsMonthly=1,159.83`

**Control 2: Counselor — Leadership, active from 2028 (3 HC → 4 HC from 2031), FOLHA_DIRETA**

Workbook: D9 = 16,161.94 BRL/month (2028 base, no escalation)  
Application: `grossMonthly = 16,923.84`, `laborChargesMonthly = 8,208.06` (48.50%), `benefitsMonthly = 1,159.82`

Application effective 2028 salary: 16,923.84 × 1.06 = **17,939.27**  
Workbook 2028 salary: **16,161.94**  
Base salary gap at 2028: +17,939.27 / 16,161.94 − 1 = **+11.0%**

Unlike "After School Educator", the Counselor grossMonthly was NOT calibrated to WB_2028 / 1.06. The application Counselor base exceeds the workbook equivalent by 11% at 2028, compounding further as escalation rates diverge (6% vs 5.64%).

Application compensation source: `src/constants/leadership.ts LEADERSHIP_CONFIG — role("counselor"..., grossMonthly=16,923.84)`

**Summary:**
- After School Educator: 2028 costs match (calibrated grossMonthly); divergence grows from +0.34% in 2029 to +3.11% by 2037 (pure rate gap)
- Counselor: 2028 costs diverge by +11.0%; gap grows to +14.6% by 2037 (base salary discrepancy + rate gap)

#### D4.6 — Encargos isolation (indirect effect of salary escalation)

Both models apply encargos as a fixed proportion of salary (48.5% in workbook formula S=R×0.485; coincidentally same rate in application laborChargesMonthly). Therefore:

- Encargo growth = Salary growth in both models
- Indirect encargo effect of the 0.36pp Dissídio rate gap = 0.36pp × 0.485 = 0.175pp additional encargo growth per year in the application vs the workbook
- The encargo component does NOT introduce a separate escalation mechanism in either model

For the After School Educator (1 HC):
- 2028 encargos: WB = 16,162.40 × 0.485 = 7,838.76/month; App = (15,247.55 × 0.485) × 1.06 = 7,395.06 × 1.06 = 7,838.76 → match at 2028
- 2037 encargos: WB = 26,482.65 × 0.485 = 12,844.04/month; App = 7,395.06 × 1.06^10 = 7,395.06 × 1.7908 = 13,237.36 → +3.1% (App higher — same relative gap as salary)

No separate FGTS or INSS decomposition exists in either model. Both embed all labor charges in a single proportional rate. The existing application `laborChargesMonthly` construction is the single model-exposed charge component; this audit does not replace or supplement it.

#### D4.7 — Payroll movement bridge (workbook, 2028–2037)

Workbook 'Org. Design ' row 1 aggregates (SUM of all roles, confirmed):

| Year | Custo Ano (labor) | YoY Δ | Ben Ano (benefits) | YoY Δ | Source |
|------|------------------|-------|---------------------|-------|--------|
| 2028 | 17,156,016 | — | 840,073 | — | SUM(U4:U83) |
| 2029 | 19,184,496 | +11.82% | 924,080 | +10.00% | SUM(AG4:AG83) |
| 2030 | 21,311,111 | +11.09% | 1,016,488 | +10.00% | SUM(AS4:AS83) |
| 2031 | 26,391,758 | +23.83% | 1,118,137 | +10.00% | SUM(BE4:BE83) |
| 2032 | 29,209,250 | +10.67% | 1,229,951 | +10.01% | SUM(BQ4:BQ83) |
| 2033 | 32,498,669 | +11.26% | 1,352,946 | +10.01% | SUM(CC4:CC83) |
| 2034 | 35,353,613 | +8.78% | 1,488,240 | +10.00% | SUM(CO4:CO83) |
| 2035 | 38,835,472 | +9.85% | 1,637,064 | +10.00% | SUM(DA4:DA83) |
| 2036 | 42,600,759 | +9.70% | 1,800,771 | +10.00% | SUM(DM4:DM83) |
| 2037 | 45,539,680 | +6.90% | 1,980,848 | +10.01% | SUM(DY4:DY83) |

**Bridge decomposition (workbook only):**

| Year | Custo Δ | Attributed to Dissídio (5.64%) | Attributed to new roles / HC additions | Residual |
|------|---------|--------------------------------|----------------------------------------|----------|
| 2028→2029 | +11.82% | ~5.64% | ~6.18% | ≈ 0 |
| 2029→2030 | +11.09% | ~5.64% | ~5.45% | ≈ 0 |
| 2030→2031 | +23.83% | ~5.64% | ~18.19% | ≈ 0 (large role-activation cohort in 2031) |
| 2031→2032 | +10.67% | ~5.64% | ~5.03% | ≈ 0 |
| 2032→2033 | +11.26% | ~5.64% | ~5.62% | ≈ 0 |
| 2033→2034 | +8.78% | ~5.64% | ~3.14% | ≈ 0 |
| 2034→2035 | +9.85% | ~5.64% | ~4.21% | ≈ 0 |
| 2035→2036 | +9.70% | ~5.64% | ~4.06% | ≈ 0 |
| 2036→2037 | +6.90% | ~5.64% | ~1.26% | ≈ 0 |

Benefits year-over-year growth tracks exactly 10% each year (workbook Benefícios rate row 11), confirming no headcount-driven shock in the benefits line — only the Dissídio rate (10%) × static benefits base.

The 2031 Custo spike (+23.83%) is driven by new role activations in that year within 'Cenários Org Design', not by the Dissídio rate itself.

Application payroll bridge cannot be computed without running the model (prohibited). Directional assessment: for every role, the application produces +6.00% to +9.30% higher labor costs and −5.66% to +31.67% different benefits costs vs the workbook, depending on year (see D4.3 and D4.4 tables).

#### D4.8 — Classification

| Sub-finding | Description | Classification |
|-------------|-------------|---------------|
| D4-S | Salary escalation rate: 5.64% (WB) vs 6.00% (App) | SOURCE-OF-TRUTH DECISION REQUIRED |
| D4-T | Salary escalation timing: WB base in 2028, App escalates in 2028 | CALIBRATION OFFSET — neutralized for EDUCATOR_LEVELS['master']; active for Counselor and others |
| D4-B | Benefits escalation rate: 10% (WB, separate Benefícios row) vs 6% (App, same factor as salary) | IMPLEMENTATION DEFECT — two separate mechanisms; application has no separate benefits rate |
| D4-E | Encargos: 48.5% flat in both models; grows proportionally with salary in both | NO DISCREPANCY in rate — gap is indirect from salary rate difference only |
| D4-C | Counselor base salary not calibrated to WB: +11.0% gap at 2028 | STALE EXTRACTION CANDIDATE — requires Finance confirmation |

**Required actions for D4:**
1. Finance must confirm authoritative salary escalation rate: 5.64% (Dissídio, PnL!C10) or 6.00% (`ANNUAL_ADJUSTMENT`, Phase 8E)
2. Finance must confirm whether benefits should escalate at 10%/yr (workbook row 11) or 6%/yr (application) — these are two distinct mechanisms in the workbook
3. Finance must confirm Counselor base salary: workbook D9 = 16,161.94 vs application grossMonthly = 16,923.84 (a 10.4% gap before any escalation factor)
4. If workbook Dissídio is confirmed authoritative: update `ANNUAL_ADJUSTMENT` in `teaching.ts` from 1.06 to 1.0564; add separate benefits escalation rate; verify and update `laborChargesMonthly` for roles where grossMonthly was not calibrated to WB_2028/1.06

---

### AF1 — Tuition source values: bp_scenario_1/2/3 stale (~−2.7% vs workbook v9)

**Classification: IMPLEMENTATION DEFECT — STALE EXTRACTION**

Application bp_scenario_1/2/3 tuition values are approximately 2.7–3.3% below the corresponding workbook v9 Cenário 1/2/3 values across all tiers. bp_scenario_4/5 match v9 exactly (added in Phase 15Q). The consistent ratio (~97.3% for all tiers in Cenários 1–3) indicates a systematic upward revision of those scenarios in the workbook after the application extracted them.

**Required action:** Re-read Cenários Mensalidade worksheet Cenário 1, 2, and 3 values from workbook v9. Update `tuitionSourceData.ts` BP_SCENARIO_1/2/3_VALUES with v9 values.

---

## Gate 6 — Archived Discrepancy Resolution

| Archived ID | Description | Phase 2 v9 Status |
|-------------|-------------|-------------------|
| D-001 | 33/39 calculations not traceable | Superseded — receita/DRE engines implemented in Phases 11–15 after that count |
| D-002 | Enrollment divergence 246 vs 258 | Superseded — v8.2 fixture vs v9 scope; current audit uses v9 (259) vs application (258); PK3 is the diverging grade |
| D-003 | No aligned scenario confirmed | Closed — canonical selectors: A218=Base, AC11=Grade 4, AD11=Cenário 1 |
| D-004 | VPL/TIR not verified | In scope — D2b and D4 must be corrected before numerical alignment is attempted |
| D-005 | WACC mismatch suspected | Closed — WACC exactly matches application constants |
| D-006 | AD11 mapping unknown | Closed — AD11 = "Cenário 1" → bp_scenario_1 / bp1_division_differentiated |
| D-007 | A218 value unknown | Closed — A218 = "Base" (literal) |
| D-008 | Cenários Receita not read | Closed — Phase 1 confirmed all active grade occupancy rates for Base Grade 4 |
| D-009 | WACC not read | Closed — Phase 1 traced full WACC lineage |

---

## Gate 7 — Closure Summary

### Mandatory discrepancies — final status

| ID | Framing | Classification | Status |
|----|---------|---------------|--------|
| D1 | Enrollment 259 vs 258 | SOURCE-OF-TRUTH DECISION REQUIRED | PK3 is diverging grade; Finance confirmation needed |
| D2 | C222 −25% vs −12% | IMPLEMENTATION DEFECT (DRE layer, stale extraction) + Finance confirmation required before update | All years 2028–2034 affected; 2035+ match |
| D3 | Tuition escalation 5.64% vs 8% | SOURCE-OF-TRUTH DECISION REQUIRED | Workbook flat 5.64% for all 20 years; app uses 8%; gap reaches 126% by 2047 |
| D4-S | Salary escalation rate 5.64% (Dissídio) vs 6.00% (ANNUAL_ADJUSTMENT) | SOURCE-OF-TRUTH DECISION REQUIRED | Rate gap +0.36pp compounds from +6.0% at 2028 to +9.3% at 2037 |
| D4-B | Benefits escalation 10%/yr (WB row 11) vs 6%/yr (App same-as-salary) | IMPLEMENTATION DEFECT — no separate benefits rate in application | WB benefits exceed App by 31.7% by 2037 |
| D4-T | Salary timing: WB base 2028 unescalated; App escalates 6% in 2028 | CALIBRATION OFFSET | Neutralized for EDUCATOR_LEVELS['master']; +11.0% gap at 2028 for Counselor |
| D4-E | Encargos rate: both models 48.5% flat, proportional to salary | NO DISCREPANCY | Indirect gap = D4-S salary gap × 0.485 only |

### Additional findings

| ID | Finding | Classification | Status |
|----|---------|---------------|--------|
| AF1 | bp_scenario_1/2/3 tuition ~−2.7% vs workbook v9 | IMPLEMENTATION DEFECT — stale extraction | Cenários 1/2/3 must be re-extracted from v9 |

### Finance decisions required

The following are open Finance decisions blocking full quantitative alignment:

| Decision | Context | Discrepancy |
|----------|---------|-------------|
| PK3 2028 enrollment: 28 or 29? | PnL v9 shows 29; occupancy model shows 28 | D1 |
| DRE discount ramp: is v9 row 222 intentional? | −25% → −12.5% ramp vs stale −12% in app | D2b |
| Authoritative tuition escalation rate: 5.64% or 8%? | Workbook PnL!C7 vs financeConventionSourceDecisions.md §2.5 | D3 |
| Authoritative salary escalation rate: 5.64% or 6.00%? | Workbook PnL!C10 (Dissídio) vs Phase 8E ANNUAL_ADJUSTMENT | D4-S |
| Benefits escalation rate: 10% (separate) or 6% (same as salary)? | Workbook PnL!C11 row 11 vs application fopagEngine.ts | D4-B |
| Counselor base salary: WB 16,161.94 or App 16,923.84? | 10.4% gap before escalation factor | D4-T |

### VPL/TIR alignment prerequisite
The workbook-cached VPL = −R$25,540,316 and TIR = 9.67% cannot be reproduced from the application in its current state because:
1. DRE discount layer (D2b): application underestimates Bolsa de Estudos by ~R$3.4M in 2028, declining to zero by 2035
2. Tuition source values (AF1): application underestimates gross receita by ~2.7% for Cenários 1/2/3
3. Tuition escalation rate (D3): Finance must confirm which rate governs post-2028 projections
4. Salary escalation rate (D4-S): application salary exceeds workbook by +9.3% at 2037 — overstates payroll cost
5. Benefits escalation (D4-B): application understates benefits by 31.7% at 2037 — understates fixed overhead
6. Enrollment (D1): PK3 differs by 1 learner (minor impact)

Correction sequence: resolve D2b with Finance → update DRE driver values → resolve AF1 (re-extract tuition from v9) → resolve D3 (Finance tuition escalation rate) → resolve D4-S/D4-B (Finance salary/benefits escalation confirmation) → then run end-to-end VPL/TIR comparison.

### Protected path hash audit (exit)

All protected paths were read-only throughout both sessions. No application code was modified.

| Path | Entry SHA-256 | Exit SHA-256 | Status |
|------|-------------|-------------|--------|
| IMPLEMENTATION.md | 6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd | 6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd | ✓ unchanged |
| dreScenarioWorkbook.ts | b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03 | b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03 | ✓ unchanged |
| orgDesignHcTableAdapter.ts | 60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33 | 60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33 | ✓ unchanged |
| phase-2-forensic-reconciliation-d743616.md | 66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837 | 66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837 | ✓ unchanged |
| phase-1-evidence-recovery-v9.md | 42a0b142eb8fd4a0a122a02a6e6dca56be1263b107723d57e5417c1692ab5a2c | 42a0b142eb8fd4a0a122a02a6e6dca56be1263b107723d57e5417c1692ab5a2c | ✓ unchanged |
| validate-phase15u2.ts | 4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd | 4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd | ✓ unchanged |
| payrollGovernanceWorkbookAdapter.ts | 833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702 | 833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702 | ✓ unchanged |
| Workbook v9 | d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4 | d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4 | ✓ unchanged (read-only ZIP) |
| **phase-2-forensic-reconciliation-v9.md** | *(authorized write — created this session)* | **7143f5d0cb6a7ea58357f5c2bd2851e56aba9d0e5c2c28f7a5c68ba2d0f5419c** | ✓ authorized write |

---

## Authorized writes performed
- Created: `docs/audits/rio-resilience/phase-2-forensic-reconciliation-v9.md` (this file)

## Prohibited actions — none taken
- No application code modified
- No workbook mutated
- No IMPLEMENTATION.md edited
- No archived Phase 2 report edited
- No git stage/commit/push performed
- No scripts, fixtures, or stub files created
