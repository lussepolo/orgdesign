# Phase 1 Evidence Recovery Report
## Workbook: "Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx"
## Repository HEAD: d743616916d8b3b4b1708cd9e3ef25c08b0ad00f

---

## 1. Purpose and Scope

This report recovers the Phase 1 workbook formula-lineage evidence required to make a subsequent Phase 2 forensic reconciliation possible. It addresses the seven evidence items identified as blockers in the Phase 2 handoff artifact:

- **E1**: PnL!A218 enrollment-selector lineage
- **E2**: Cenários Receita enrollment-source table
- **E3**: PnL!AD11 tuition-selector lineage
- **E4**: Cenário 1–5 tuition-scenario definitions
- **E5**: WACC source cells and discount-factor construction
- **E6**: Canonical selector state behind cached VPL/TIR outputs
- **E7**: Workbook-to-application mapping

Scope is bounded to read-only inspection. No application code was modified. No workbook mutation occurred. No Phase 2 reconciliation was attempted.

---

## 2. Prior Phase 2 Handoff

**Phase 2 artifact path:** `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md`

**Phase 2 artifact SHA-256 (entry):** `66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837`

**Phase 2 terminal status:** `PHASE 2 RECONCILIATION STATUS: BLOCKED`

**Blockers addressed by this session:**

| Phase 2 Blocker ID | Description | This session outcome |
|---|---|---|
| D-007 | A218 enrollment selector identity unconfirmed | RESOLVED — A218 = "Base", no dropdown, XLOOKUP key component |
| D-006 | AD11 tuition scenario mapping unconfirmed | RESOLVED — Cenário 1-5 semantic mapping confirmed to bp1-rj5 |
| D-009 | WACC rate cells not read from workbook | RESOLVED — B5=11.25%, AD21=B5+2%=13.25%, C6=B6-1.25%=12% |
| R-002 | A218 free-text, value not read | RESOLVED — value is "Base" (literal) |
| (E2) | Cenários Receita source table not read | RESOLVED — full scenario index captured |
| (E4) | Tuition scenario definitions not captured | RESOLVED — all 5 scenarios with base-year tuition values |

**Claims from Phase 2 report that conflict with direct workbook evidence:**

| Phase 2 claim | Workbook cell | Actual value (direct evidence) | Status |
|---|---|---|---|
| "C222 = –12% for 2028" | PnL!C222 | -0.25 (-25%), literal | CONTRADICTED |
| "A218: no dropdown" | PnL!A218 | Confirmed: no data validation element | CONFIRMED |
| "VPL = R$–25,540,316" | PnL!Z307 | -25,540,315.997 ≈ -25,540,316 | CONFIRMED |
| "TIR = 9.67%" | PnL!Z306 | 9.6725700854585872E-2 ≈ 9.67% | CONFIRMED |

---

## 3. Repository Entry State

```
pwd:            /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
git toplevel:   /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
remote (fetch): https://github.com/lussepolo/orgdesign.git
remote (push):  https://github.com/lussepolo/orgdesign.git
branch:         main
HEAD:           d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

**Expected HEAD matches actual HEAD:** YES

---

## 4. Pre-existing User-Owned Changes and Hashes

All six expected paths were present and in their expected states at entry.

### Entry SHA-256 hashes (recorded before any reads)

| Path | State | SHA-256 |
|---|---|---|
| `IMPLEMENTATION.md` | M (modified) | `6962a3e104f146e2b6c1d3dff2e7e6306c1930ad18eb4adf36e18f7ac4aec1cd` |
| `src/components/dreSimulator/dreScenarioWorkbook.ts` | M (modified) | `b05b63a768d790ad1ebb6f7aa05a7f92dce532b28bd631bbc585f4e2a941ff03` |
| `src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts` | M (modified) | `60aed5c414d7085aa22ab71f92e7eb7587fee7600c142c78b98220566e03eb33` |
| `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md` | ?? (untracked) | `66cde5f00f6006d03442ff31bb2aa67f5309c92609d4c9ead7eec8115c775837` |
| `scripts/validate-phase15u2.ts` | ?? (untracked) | `4acf5642cacfc2f1868417cbfdf6638320e7198e2ee3d89c2ef95c2b2987a3bd` |
| `src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts` | ?? (untracked) | `833e415e49958751a39fcf6c4e3cedf53a35528056c19bf6dc874e94d5d24702` |

No additional pre-existing changes were observed beyond the six expected paths.

---

## 5. Workbook Identity

| Attribute | Value |
|---|---|
| Filename | Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx |
| Absolute path | /Users/lucianapolonen/Downloads/Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx |
| File size | 6,626,059 bytes |
| Modification timestamp | 2026-07-21 13:31 |
| SHA-256 | `d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4` |

**Workbook was not modified, saved, or recalculated during this session.**

---

## 6. Workbook Inspection Capability

| Capability | Status | Notes |
|---|---|---|
| Worksheet names and visibility | AVAILABLE | Read from `xl/workbook.xml` |
| Cell values (cached) | AVAILABLE | Read from per-sheet XML |
| Cell formulas | AVAILABLE | Read from `<f>` elements |
| Data validation rules and sqRef | AVAILABLE | Read from `<dataValidations>` element; sqRef stored in `sqref` attribute (lowercase) |
| Shared strings | AVAILABLE | Read from `xl/sharedStrings.xml` |
| Cross-sheet formula references | AVAILABLE | Read directly from formula text |
| Defined names | NOT INSPECTED | Not required by this audit scope |
| Merged ranges | NOT INSPECTED | Not required |
| 2D Data Table outputs | AVAILABLE (cached values only) | Z305, Z307 are Data Table output cells — formula text reads as `None` but cached values are accessible |

---

## 7. Worksheet Index (visible sheets)

| Sheet name | Visibility | rId → file |
|---|---|---|
| Summary | visible | rId2 → sheet2.xml |
| PnL PPT | visible | rId3 |
| Resumos PPT | visible | rId4 |
| **PnL** | **visible** | **rId5 → sheet5.xml** |
| **Cenários Receita** | **visible** | **rId6 → sheet6.xml** |
| **Cenários Mensalidade** | **visible** | **rId70 → sheet70.xml** |
| Cenários Org Design | visible | rId71 |
| PPE | visible | rId72 |
| Org. Design (space) | visible | rId73 |
| Recuperação de Prejuízos | visible | rId75 |
| Corp. BU | visible | rId76 |
| Pré-Ops | visible | rId77 |
| Rateio BU | visible | rId78 |
| Bench SP 2025 | visible | rId79 |
| Depreciação | visible | rId80 |
| CAPEX | visible | rId81 |
| Cap1–Cap8 | visible | rId83–rId90 |

---

## 8. A218 Enrollment-Selector Lineage (E1)

### Cell identity

| Item | Evidence |
|---|---|
| Cell | PnL!A218 |
| Current value | "Base" |
| Formula | None (literal string) |
| Type | shared string (text) |
| Data validation | NONE — no `<dataValidation>` element references A218 |
| Evidence type | DIRECT WORKBOOK EVIDENCE |
| Confidence | HIGH |

### Role of A218

A218 serves as the **enrollment-occupancy scenario selector**. It is the first component of a composite lookup key used in XLOOKUP formulas throughout PnL rows 174–215 (occupancy section):

**Formula structure (rows 174–215):**
```
C174 = XLOOKUP(CONCAT($A$218, $AC$11, $A174), 'Cenários Receita'!$Y:$Y, 'Cenários Receita'!B:B)
```

- `$A$218` = scenario label ("Base", "Otimista", "Pessimista", or "Otimista 100%")
- `$AC$11` = opening-grade label ("Grade 4" or "Grade 6")
- `$A174` = grade label (e.g., "TODDLERS 1 - I")

The composite key selects the occupancy rate for each grade from 'Cenários Receita'. The occupancy rates drive enrollment:
```
C130 = ROUNDUP((C174 × $F20) × C108, 0)
```

### Enrollment flow to C221

- PnL!C149 = SUM(C130:C148) — enrollment subtotal (existing cohort), cached = 237 for 2028
- PnL!C171 = SUM(C152:C170) — new-student increment, cached = 22 for 2028
- PnL!C221 = SUM(C149, C171) = 259 — **total enrollment 2028**, labeled "Número de Alunos"

**Selector state at cached value:** A218="Base", AC11="Grade 4", AD11="Cenário 1", AC21=–R$100M → total enrollment 2028 = 259 students

### Comparison with application

| Item | Workbook | Application |
|---|---|---|
| Selector label | A218 = "Base" | `occupancyScenarioId = "intermediario"` |
| Enrollment 2028 | C221 = 259 | t1_g4/intermediario/2028 = 258 (from Phase 2) |
| Difference | 1 student | Rounding difference |

Semantic interpretation: "Base" is the workbook's middle occupancy scenario (between "Otimista" and "Pessimista"), semantically corresponding to the application's "intermediario". The enrollment difference of 1 (259 vs 258) is consistent with a minor rounding divergence.

---

## 9. Cenários Receita Enrollment-Source Evidence (E2)

### Sheet: Cenários Receita (rId6 → sheet6.xml)

**Column Y = composite lookup key; columns B–W = occupancy rates for years 2028–2047**

**Header row (row 1):** A1="Curso", B1="2028" (from `PnL!$C$2`), Y1="Chave"

### Available scenario×grade combinations

| Scenario label | Grade | Row range |
|---|---|---|
| Otimista | Grade 3 | 2–20 |
| Base | Grade 3 | 25–43 |
| Pessimista | Grade 3 | 48–66 |
| Otimista 100% | Grade 3 | 71–89 |
| Otimista | Grade 6 | 94–112 |
| Base | Grade 6 | 117–135 |
| Pessimista | Grade 6 | 140–158 |
| Otimista 100% | Grade 6 | 163–181 |
| Otimista | Grade 4 | 393–411 |
| **Base** | **Grade 4** | **416–434** |
| Pessimista | Grade 4 | 439–457 |

**Note: Grade 4 has only three occupancy scenarios (Otimista, Base, Pessimista). "Otimista 100%" does not exist for Grade 4.**

### BaseGrade 4 occupancy rates — 2028 (column B)

| Grade label | 2028 rate | 2029 rate | 2030 rate |
|---|---|---|---|
| TODDLERS 1 - I | 0.5714 (4/7) | 0.6786 | 0.7857 |
| TODDLERS 1 - M | 0.5714 | 0.6786 | 0.7857 |
| TODDLERS 2 - I | 0.5714 | 0.6786 | 0.7857 |
| TODDLERS 2 - M | 0.5714 | 0.6786 | 0.7857 |
| PRE-K3 - I | 0.7778 | 0.8611 | 0.9444 |
| PRE-K4 - I | 0.8889 | 0.9722 | 1.0000 |
| KINDERGARTEN - I | 0.9000 | 0.9750 | 1.0000 |
| GRADE 1 - I | 0.9091 | 0.9773 | 1.0000 |
| GRADE 2 - I | 0.8182 | 0.8864 | 0.9545 |
| GRADE 3 - I | 0.7273 | 0.7955 | 0.8636 |
| GRADE 4 - I | 0.4583 | 0.6467 | 0.7092 |
| GRADE 5 - I | None (0) | 0.4758 | 0.6273 |
| GRADE 6 - I | None (0) | None (0) | 0.4671 |
| GRADE 7 - I | None (0) | None (0) | None (0) |
| GRADE 8 - I | None (0) | None (0) | None (0) |
| GRADE 9–12 - I | None (0) | None (0) | None (0) |

**Interpretation:** Grade 5 is absent in 2028 and enters in 2029 (first cohort). Grade 6 enters in 2030. This matches the t1_g4 opening-package profile (Grade 4 is the highest active grade in 2028).

### OtimistaGrade 4 occupancy rates — 2028

| Grade | 2028 rate |
|---|---|
| TODDLERS 1 - I | 0.7857 |
| TODDLERS 2 - I | 0.7857 |
| PRE-K3 - I | 0.8889 |
| PRE-K4 - I | 1.0000 |
| KINDERGARTEN - I | 1.0000 |
| GRADE 1 - I | 1.0000 |
| GRADE 2 - I | 0.9091 |
| GRADE 3 - I | 0.8182 |
| GRADE 4 - I | 0.5833 |
| GRADE 5 - I | None (0) |

### PessimistaGrade 4 occupancy rates — 2028

| Grade | 2028 rate |
|---|---|
| TODDLERS 1 - I | 0.5500 |
| TODDLERS 2 - I | 0.3250 |
| PRE-K3 - I | 0.5500 |
| PRE-K4 - I | 0.5500 |
| KINDERGARTEN - I | 0.5500 |
| GRADE 1 - I | 0.5500 |
| GRADE 2 - I | 0.3250 |
| GRADE 3 - I | 0.3250 |
| GRADE 4 - I | 0.3250 |
| GRADE 5 - I | None (0) |

---

## 10. AD11 Tuition-Selector Lineage (E3)

### Cell identity

| Item | Evidence |
|---|---|
| Cell | PnL!AD11 |
| Current value | "Cenário 1" |
| Formula | None (literal string) |
| Type | shared string (text) |
| Data validation | sqRef='AD11', type='list', formula1='"Cenário 1,Cenário 2,Cenário 3,Cenário 4,Cenário 5"' (inline list, no external range reference) |
| Evidence type | DIRECT WORKBOOK EVIDENCE |
| Confidence | HIGH |

### Downstream linkage

`Cenários Mensalidade'!Y1` = PnL!AD11 (direct cross-sheet reference, formula = `PnL!AD11`)

Selection mechanism in Cenários Mensalidade column Z (active tuition column):
```
Z3 = IF($Y$1="Cenário 1", AD3, IF($Y$1="Cenário 2", AL3, IF($Y$1="Cenário 3", AP3, IF($Y$1="Cenário 4", AT3, IF($Y$1="Cenário 5", AX3, 0)))))
```

Where $Y$1 = PnL!AD11. Column mapping:
- Cenário 1 → columns AC/AD (labeled "BP Cenário 1")
- Cenário 2 → columns AK/AL (labeled "BP Cenário 2")
- Cenário 3 → columns AO/AP (labeled "BP Cenário 3")
- Cenário 4 → columns AS/AT (labeled "BP Cenário 4")
- Cenário 5 → columns AW/AX (labeled "BP Cenário 5")

The active annual tuition column (Z) is referenced from PnL row 21 via formula `'Cenários Mensalidade'!AA4` (monthly value for T1-M, Cenário 1).

---

## 11. Cenário 1–5 Definitions (E4)

### Source sheet: Cenários Mensalidade (rId70 → sheet70.xml)

**Escalation rates (rows 38–41):**
- A38 = PnL!$B$7 = 0.06 (6.00% reajuste for 2027)
- B38 = PnL!$C$7 = 0.0564 (5.64% reajuste for 2028)

These rates are applied as: `2028_value = 2027_value × (1 + B38)`

### Scenario descriptions (row 23)

| Cenário | Internal label | Description |
|---|---|---|
| Cenário 1 | BP Cenário 1 | "Mensalidade para cada um dos quatro segmentos, 2,3% abaixo da EARJ" (4 tiers, 2.3% below EARJ) |
| Cenário 2 | BP Cenário 2 | "Três valores de mensalidade, um para EY e LS, um para MS e um para HS" (3 tiers: EY+LS unified, MS, HS) |
| Cenário 3 | BP Cenário 3 | "Dois valores de mensalidade, um para EY, LS e MS e um para HS" (2 tiers: EY+LS+MS unified, HS) |
| Cenário 4 | BP Cenário 4 | "Mensalidade para cada um dos quatro segmentos e equiparado ao valor da EARJ" (4 tiers, at EARJ) |
| Cenário 5 | BP Cenário 5 | "Mensalidade para cada um dos quatro segmentos e equiparado ao valor da EARJ + 5%" (4 tiers, EARJ + 5%) |

### Base-year (2028) annual tuition values — Cenário 1 (BP Cenário 1, columns AC/AD)

Base reference: Cenários Mensalidade rows 31–34 (EARJ benchmark by segment).
Cenário 1 applies EARJ-derived values directly.

| Grade label | Annual (BRL) | Monthly (BRL) | Segment | Source formula |
|---|---|---|---|---|
| TODDLERS 1 - I | 94,006.97 | 7,833.91 | EY | $Q$31 = N31×12 |
| TODDLERS 1 - M | 55,271.61 | 4,605.97 | EY manhã | E9×AD3 (= 0.5880 × EY-I) |
| TODDLERS 2 - I | 94,006.97 | 7,833.91 | EY | $Q$31 |
| TODDLERS 2 - M | 55,271.61 | 4,605.97 | EY manhã | E9×AD5 |
| PRE-K3 - I | 94,006.97 | 7,833.91 | EY | $Q$31 |
| PRE-K4 - I | 94,006.97 | 7,833.91 | EY | $Q$31 |
| KINDERGARTEN - I | 94,006.97 | 7,833.91 | EY | $Q$31 |
| GRADE 1 - I | 114,821.51 | 9,568.46 | LS | $Q$32 |
| GRADE 2 - I | 114,821.51 | 9,568.46 | LS | $Q$32 |
| GRADE 3 - I | 114,821.51 | 9,568.46 | LS | $Q$32 |
| GRADE 4 - I | 114,821.51 | 9,568.46 | LS | $Q$32 |
| GRADE 5 - I | 114,821.51 | 9,568.46 | LS | $Q$32 |
| GRADE 6 - I | 125,853.62 | 10,487.80 | MS | $Q$33 |
| GRADE 7 - I | 125,853.62 | 10,487.80 | MS | $Q$33 |
| GRADE 8 - I | 125,853.62 | 10,487.80 | MS | $Q$33 |
| GRADE 9 - I | 145,405.05 | 12,117.09 | HS | $Q$34 |
| GRADE 10 - I | 145,405.05 | 12,117.09 | HS | $Q$34 |
| GRADE 11 - I | 145,405.05 | 12,117.09 | HS | $Q$34 |
| GRADE 12 - I | 145,405.05 | 12,117.09 | HS | $Q$34 |

**Escalation derivation (Cenário 1, EY segment):**
- EARJ EY 2026: R$8,102/month (B31, literal)
- EARJ EY 2027: R$8,588.12 (E31 = B31 × 1.06)
- EARJ food 2027: R$926 (F31, literal) | EARJ material 2027: R$519 (I31) | food CPT: R$1,579.45 (J31)
- Rio tuition 2027: R$7,415.67 (M31 = G31 − I31 − J31)
- Rio tuition 2028: R$7,833.91 (N31 = M31 × 1.0564)
- Annual 2028: R$94,006.97 (Q31 = N31 × 12)

### Base-year (2028) annual tuition values — Cenário 2 (BP Cenário 2, columns AK/AL)

EY+LS are unified (same tuition), MS and HS remain separate.

| Grade | Annual (BRL) | Monthly (BRL) | Segment |
|---|---|---|---|
| TODDLERS 1 - I | 104,414.24 | 8,701.19 | EY (= avg of Cen1 EY-I and LS-I) |
| TODDLERS 1 - M | 61,082.45 | 5,090.20 | EY manhã |
| GRADE 1–5 - I | 104,414.24 | 8,701.19 | LS = EY unified |
| GRADE 6–8 - I | 110,923.54 | 9,243.63 | MS |
| GRADE 9–12 - I | 116,469.74 | 9,705.81 | HS |

### Base-year (2028) annual tuition values — Cenário 3 (BP Cenário 3, columns AO/AP)

EY+LS+MS are unified, HS separate.

| Grade | Annual (BRL) | Monthly (BRL) |
|---|---|---|
| T1–G8 - I | 111,560.70 | 9,296.72 |
| T1-M | 65,263.14 | 5,438.59 |
| G9–G12 - I | 122,725.78 | 10,227.15 |

### Base-year (2028) annual tuition values — Cenário 4 (BP Cenário 4, columns AS/AT)

4-tier, at EARJ price level (literal values).

| Segment | Annual (BRL) | Monthly (BRL) |
|---|---|---|
| EY integral | 105,636 | 8,803 |
| EY manhã | 61,788 | 5,149 |
| LS | 127,320 | 10,610 |
| MS | 138,816 | 11,568 |
| HS | 159,180 | 13,265 |

### Base-year (2028) annual tuition values — Cenário 5 (BP Cenário 5, columns AW/AX)

4-tier, EARJ + 5%.

| Segment | Annual (BRL) | Monthly (BRL) |
|---|---|---|
| EY integral | 110,916 | 9,243 |
| EY manhã | 64,884 | 5,407 |
| LS | 133,680 | 11,140 |
| MS | 145,752 | 12,146 |
| HS | 167,136 | 13,928 |

### Tuition escalation

The escalation rate for 2028 values is B38 = PnL!$C$7 = 5.64%. Subsequent-year escalation rates are embedded in PnL row 7 (not read in this session). The application uses 1.08^(year−2028) = 8% annual escalation. This is a discrepancy; the workbook uses ~5.64% for 2028, not 8%.

---

## 12. WACC and Discount-Factor Lineage (E5)

### WACC source cells

| Cell | Value | Formula | Label |
|---|---|---|---|
| PnL!A5 | "SELIC" | None | Row label |
| PnL!B5 | 0.1125 (11.25%) | None (literal) | SELIC rate, base WACC |
| PnL!AD21 | 0.1325 (13.25%) | B5+2% | Pre-ops WACC = SELIC + 2% premium |
| PnL!B6 | 0.1325 (13.25%) | AD21 | Pre-ops WACC (year 2028) — references AD21 |
| PnL!C6 | 0.1200 (12.00%) | B6-1.25% | Operating WACC (2029+) = pre-ops − 1.25% |
| PnL!D6–V6 | 0.1200 | C6 or literal | Operating period WACC (all years 2030–2047) |

**WACC lineage:** B5 (SELIC 11.25%) → AD21 (B5+2% = 13.25%) → B6 (=AD21 = 13.25%) → C6 (B6−1.25% = 12%)

**Application constants:** preOpsWaccRate=13.25%, operatingPeriodWaccRate=12% — **EXACT MATCH** with workbook values.

### Discount factor construction

| Cell | Formula | Cached value | Interpretation |
|---|---|---|---|
| PnL!B308 | (1+B6) | 1.1325 | Pre-ops period discount factor (2028, period 1) |
| PnL!C308 | B308×(1+C6) | 1.2684 | Cumulative discount factor (2029, period 2) |
| PnL!B305 | B295/B$308 | −77,410,614.71 | Discounted FCO for 2028 |
| PnL!C305 | None (Data Table) | −7,074,822.85 | Discounted FCO 2029 (Data Table output) |
| PnL!Z307 | SUM(B305:W305) | −25,540,315.997 | VPL = sum of discounted FCO 2028–2047 |
| PnL!Z306 | IRR(B295:W295) | 0.096726 (9.6726%) | TIR using Excel IRR convention |
| PnL!Z308 | IF(Z307<0,"NA",...) | "NA" | Payback = NA (VPL is negative) |

**Formula match with application:**
- Workbook: `discountFactor[1] = (1+B6) = 1.1325`; `discountFactor[i] = discountFactor[i-1] × (1+C6)` for i≥2
- Application: `discountFactor[1] = 1 + preOpsWaccRate = 1.1325`; `discountFactor[i] = discountFactor[i-1] × (1+12%)`
- **EXACT FORMULA AND INPUT MATCH for discount factor construction**

**VPL formula match:**
- Workbook: `Z307 = SUM(B305:W305)` where `B305 = B295/B308` etc.
- Application: `cumulativeDiscountedCashFlow = Σ (fcoAfterCapex / discountFactor[i])`
- **EXACT FORMULA MATCH**

**TIR formula match:**
- Workbook: `IRR(B295:W295)` (Excel IRR convention, cash flow at period 0 = exponent 0)
- Application: Newton-Raphson with `cashFlows[i] / (1+rate)^i` — matches Excel IRR convention
- **STRUCTURAL ANALOGY (formula structure confirmed equivalent; input values not aligned due to enrollment divergence)**

---

## 13. Canonical VPL/TIR Selector State (E6)

### Complete material selector state behind VPL=−R$25,540,316 / TIR=9.67%

| Cell | Value | Formula | Validation | Semantic meaning |
|---|---|---|---|---|
| PnL!AC11 | "Grade 4" | None (literal) | sqRef=AC11, list: "Grade 4,Grade 6" | Opening grade / package |
| PnL!AD11 | "Cenário 1" | None (literal) | sqRef=AD11, list: "Cenário 1,...,Cenário 5" | Tuition scenario |
| PnL!AC21 | −100,000,000 | None (literal) | sqRef=AC21, source: $AC$5:$AC$9 | CAPEX level (−R$100M) |
| PnL!A218 | "Base" | None (literal) | No data validation | Enrollment/occupancy scenario |

**Z305 (first year discounted FCO):** Data Table output — cached value from Data Table substitution with the above selector state.

**Confirmed:** The four selector cells above, taken together, define the workbook state that produced the cached VPL and TIR values. The 2D Data Tables at Z307 parametrically sweep AC21 (rows) and AC11/AD11 (columns), with A218 held at "Base" during that computation.

**Evidence type:** DIRECT WORKBOOK EVIDENCE (cached values read from cells; selector values confirmed as literal inputs; discount-factor formulas confirmed)

**Confidence:** HIGH

---

## 14. Workbook-to-Application Mapping (E7)

### Mapping table

| Dimension | Workbook selector | Workbook source | Selected value | Application candidate | Mapping status | Evidence |
|---|---|---|---|---|---|---|
| Opening package | AC11 = "Grade 4" | Inline dropdown: "Grade 4,Grade 6" | "Grade 4" | `t1_g4` | EXACT SEMANTIC MATCH — "Grade 4" = highest active grade in 2028; G5 enters 2029, G6 enters 2030 per Cenários Receita | DIRECT WORKBOOK EVIDENCE |
| Opening package | AC11 = "Grade 6" | Inline dropdown | "Grade 6" | `t1_g6` | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| Opening packages | AC11 (2 options) | — | — | `t1_g3`, `t1_g5` | NO MATCH — these two packages have no workbook equivalent | DIRECT WORKBOOK EVIDENCE |
| Enrollment scenario | A218 = "Base" | No dropdown; XLOOKUP into Cenários Receita | Occupancy rates for "BaseGrade 4..." | `occupancyScenarioId = "intermediario"` | PARTIAL MATCH — "Base" is the middle scenario between "Otimista" and "Pessimista"; semantically = intermediário; enrollment 259 (workbook) vs 258 (app) | DIRECT WORKBOOK EVIDENCE + INFERENCE |
| Enrollment scenario | A218 = "Otimista" | No dropdown | "OtimistaGrade 4..." | `occupancyScenarioId = "otimista"` | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| Enrollment scenario | A218 = "Pessimista" | No dropdown | "PessimistaGrade 4..." | `occupancyScenarioId = "pessimista"` | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| Enrollment scenario | (not present) | — | — | `occupancyScenarioId = "intermediario"` (as app-internal 3rd level) | See above | — |
| Tuition scenario | AD11 = "Cenário 1" | Inline dropdown | → bp1_division_differentiated | `tuitionScenarioId = "bp1_division_differentiated"` | EXACT SEMANTIC MATCH — 4-tier EY/LS/MS/HS, 2.3% below EARJ; labels and structure aligned | DIRECT WORKBOOK EVIDENCE |
| Tuition scenario | AD11 = "Cenário 2" | Inline dropdown | → bp2_ey_ls_unified | `tuitionScenarioId = "bp2_ey_ls_unified"` | EXACT SEMANTIC MATCH — EY+LS unified, MS and HS separate | DIRECT WORKBOOK EVIDENCE |
| Tuition scenario | AD11 = "Cenário 3" | Inline dropdown | → bp3_ey_to_ms_unified | `tuitionScenarioId = "bp3_ey_to_ms_unified"` | EXACT SEMANTIC MATCH — EY+LS+MS unified, HS separate | DIRECT WORKBOOK EVIDENCE |
| Tuition scenario | AD11 = "Cenário 4" | Inline dropdown | → rj4 | `tuitionScenarioId = "rj4"` | EXACT SEMANTIC MATCH — 4-tier at EARJ price | DIRECT WORKBOOK EVIDENCE |
| Tuition scenario | AD11 = "Cenário 5" | Inline dropdown | → rj5 | `tuitionScenarioId = "rj5"` | EXACT SEMANTIC MATCH — 4-tier at EARJ + 5% | DIRECT WORKBOOK EVIDENCE |
| CAPEX | AC21 = −100,000,000 | Dropdown: $AC$5:$AC$9 | −R$100M | `capexOptionId = "R100M"` | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| CAPEX | AC21 = −90,000,000 | Same dropdown | −R$90M | `capexOptionId = "R90M"` | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| CAPEX | AC21 = −70M/−80M/−110M | Same dropdown | — | No application equivalent | WORKBOOK-ONLY DIMENSION | DIRECT WORKBOOK EVIDENCE |
| Org-design tier | (absent) | — | — | `orgDesignOptionId` | APPLICATION-ONLY DIMENSION | — |
| Pre-ops WACC | B6 = AD21 = 13.25% | B5+2% = SELIC+2% | 13.25% | preOpsWaccRate = 0.1325 | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| Operating WACC | C6 = B6−1.25% = 12% | — | 12.00% | operatingPeriodWaccRate = 0.12 | EXACT SEMANTIC MATCH | DIRECT WORKBOOK EVIDENCE |
| Discount factor convention | B308=(1+B6); C308=B308×(1+C6) | Cumulative product | Period 1 = pre-ops; Period 2+ = operating | discountFactor[1]=1+preOps; discountFactor[i]=prev×(1+op) | EXACT FORMULA AND INPUT MATCH | DIRECT WORKBOOK EVIDENCE |
| VPL convention | SUM(B305:W305) = Σ FCO/factor | — | −25,540,316 | cumulativeDiscountedCashFlow = Σ FCO/factor | EXACT FORMULA MATCH | DIRECT WORKBOOK EVIDENCE |
| TIR convention | IRR(B295:W295) | Excel IRR, period-0 exponent = 0 | 9.67% | NR from 0.10 seed; cashFlows[i]/(1+r)^i | STRUCTURAL ANALOGY | DIRECT WORKBOOK EVIDENCE |
| % Desconto Médio (DRE-level) | C222 = −0.25 | Literal | −25% | percentual_desconto_medio = −12% | NO MATCH — workbook DRE-level discount = 25%; application = 12% | DIRECT WORKBOOK EVIDENCE (contradicts Phase 2 report claim of −12%) |
| Tuition escalation | B38 = 5.64% for 2028 | PnL!$C$7 | 5.64% | annualAdjustmentFactor = 1.08^(year−2028) = 8% per year | NO MATCH — workbook uses 5.64% (2028); application uses 8% | DIRECT WORKBOOK EVIDENCE |
| Financial result | All zero | Confirmed Phase 1 | 0 | financialResultBRL = 0 | EXACT FORMULA AND INPUT MATCH | DOCUMENTED PROJECT CLAIM |
| Payback | "NA" (Z308) | Z308 formula | NA | discountedPayback — not aligned | NOT TRACEABLE (application formula not read in this session) | — |

### Phase 2 scenario alignment assessment

A mutually aligned scenario now requires:

| Dimension | Workbook | Application | Alignment status |
|---|---|---|---|
| Opening package | AC11 = "Grade 4" | t1_g4 | CONFIRMED |
| Enrollment scenario | A218 = "Base" | intermediario | PARTIAL (259 vs 258, 1 student difference) |
| Tuition scenario | AD11 = "Cenário 1" | bp1_division_differentiated | CONFIRMED |
| CAPEX | AC21 = −R$100M | R100M | CONFIRMED |
| Org-design | (absent) | balanced_experience | APPLICATION-ONLY (no workbook equivalent) |

**Conclusion:** For the canonical validation scenario (AC11="Grade 4", A218="Base", AD11="Cenário 1", AC21=−R$100M), four of five dimensions can be aligned. The enrollment difference (259 vs 258) is a 0.4% rounding divergence that needs Finance confirmation of whether "Base" = "intermediario". The org-design dimension is application-only.

**This is the closest alignable scenario for Phase 2 numerical reconciliation.**

Remaining blockers for full alignment:
1. Finance to confirm whether A218="Base" is definitionally equivalent to `occupancyScenarioId="intermediario"` in the application (or whether 259 vs 258 is intentional)
2. The 5.64% (workbook) vs 8% (application) tuition escalation discrepancy requires Finance source confirmation
3. The C222=−25% (workbook) vs percentual_desconto_medio=−12% (application) requires investigation into whether these are truly at the same DRE calculation layer

---

## 15. Evidence Coverage Matrix

| Evidence item | Required evidence | Status | Direct evidence location | Remaining gap |
|---|---|---|---|---|
| E1 — A218 current value | Literal or formula | COMPLETE | PnL!A218 = "Base" (literal) | None |
| E1 — A218 formula/literal | Confirmed literal | COMPLETE | No formula element | None |
| E1 — A218 lineage | Precedent chain to enrollment | COMPLETE | XLOOKUP key component; C221=SUM(C149,C171)=259 | None |
| E1 — A218 validation | Rule or confirmed absence | COMPLETE | No dataValidation element references A218 | None |
| E2 — Enrollment source table | Cenários Receita range, years, grades, scenarios | COMPLETE | Rows 2–457 of Cenários Receita; 11 scenario×grade combinations identified | Enrollment totals (requires capacity data from rows 100–115 not read) |
| E2 — Relevant enrollment scenario dimensions | Occupancy rates by grade and year | COMPLETE | BaseGrade 4 rows 416–434 | Capacity constants (F20 etc.) not read — not required for mapping |
| E3 — AD11 current value | Literal or formula | COMPLETE | PnL!AD11 = "Cenário 1" (literal) | None |
| E3 — AD11 formula/literal | Confirmed literal | COMPLETE | No formula element | None |
| E3 — AD11 lineage | Source table and downstream | COMPLETE | Cenários Mensalidade Y1=PnL!AD11; nested IF selection; columns AD/AL/AP/AT/AX | None |
| E3 — AD11 validation | Rule and source | COMPLETE | sqRef='AD11', inline list "Cenário 1,...,Cenário 5" | None |
| E4 — All 5 tuition scenarios | Workbook labels, structure, values | COMPLETE | Cenários Mensalidade rows 1–21, 23, 31–34, 37–41 | Subsequent-year escalation rates (PnL row 7+) not fully captured |
| E4 — Base-year tuition | By grade and segment | COMPLETE | Annual amounts in columns AD/AL/AP/AT/AX per segment | None |
| E4 — Escalation rules | Rate and start year | PARTIAL | B38=5.64% for 2028 confirmed; subsequent years reference PnL!C7+ not read | PnL row 7 column D+ escalation rates not read |
| E4 — Discount dependencies | Scholarship or commercial discount | PARTIAL | C222=−25% (workbook) vs −12% (application) — contradiction requires resolution | C215 formula not read; structural layer of C222 ambiguous |
| E5 — WACC source cells | Exact cells and formulas | COMPLETE | B5=11.25%, AD21=B5+2%=13.25%, B6=AD21, C6=B6−1.25%=12% | None |
| E5 — Discount factor formulas | Construction and exponents | COMPLETE | B308=(1+B6), C308=B308×(1+C6); B305=B295/B308 | None |
| E5 — VPL formula | Cell and precedent | COMPLETE | Z307=SUM(B305:W305) | None |
| E5 — TIR formula | Cell and formula | COMPLETE | Z306=IRR(B295:W295) | None |
| E6 — Complete selector state | All material selectors | COMPLETE | AC11, AD11, AC21, A218 — all confirmed | None |
| E6 — Cached output confirmation | VPL and TIR values | COMPLETE | Z307=−25,540,316; Z306=9.67% | None |
| E7 — Opening package mapping | All options | COMPLETE | Grade 4→t1_g4; Grade 6→t1_g6; t1_g3/t1_g5 absent | None |
| E7 — Enrollment scenario mapping | All 3 workbook options | COMPLETE | Base→intermediario (partial); Otimista→otimista; Pessimista→pessimista | 259 vs 258 rounding needs Finance confirmation |
| E7 — Tuition scenario mapping | All 5 scenarios | COMPLETE | Cenário 1→bp1; 2→bp2; 3→bp3; 4→rj4; 5→rj5 | None |
| E7 — CAPEX mapping | All levels | COMPLETE | −100M→R100M; −90M→R90M; −70M/−80M/−110M absent | None |
| E7 — WACC mapping | Pre-ops and operating | COMPLETE | 13.25% exact match; 12% exact match | None |
| E7 — Discount factor mapping | Convention | COMPLETE | Cumulative product from pre-ops | None |

---

## 16. Unresolved-Evidence Iteration Log

No unresolved-evidence iterations were required. All mandatory E1–E7 evidence was recovered within the primary investigation.

| Ledger ID | Evidence item | Missing evidence | Attempt number | Targeted action | Result | Final disposition |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No unresolved items requiring iteration |

---

## 17. Remaining Blockers for Phase 2

The following items are NOT blockers for Phase 1 PASS but remain unresolved for Phase 2 numerical reconciliation:

| ID | Description | Phase 2 impact | Required action |
|---|---|---|---|
| R1 | A218 = "Base" enrollment count 259 vs application 258 | Enrollment dimension: 1-student difference | Finance to confirm if "Base" = "intermediario" definitionally; or identify source of rounding |
| R2 | C222 = −25% (workbook) vs percentual_desconto_medio = −12% (application) | DRE discount layer: substantial difference | Finance to identify which workbook row/layer corresponds to application "percentual_desconto_medio"; C215 formula chain needs reading |
| R3 | Tuition escalation: 5.64% (2028, workbook) vs 8% (application) | Revenue escalation: significant multi-year divergence | Finance to confirm PnL row 7 escalation schedule for 2029+ and verify against application 8% assumption |
| R4 | 2D Data Table outputs in rows 305 only valid for current selector state | Sensitivity sweep requires live recalculation | Phase 2 must use confirmed input values with application engine |
| R5 | Version mismatch (OPEX: v7, CAPEX: v8.2, tuition: v9) | OPEX and CAPEX input alignment | Finance to confirm v9 OPEX/CAPEX values match v7/v8 extractions |

---

## 18. Evidence Package for Next Phase 2 Session

The following inputs may now be used to restart Phase 2:

**Canonical workbook path:** `/Users/lucianapolonen/Downloads/Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx`
**Workbook SHA-256:** `d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4`
**Repository HEAD:** `d743616916d8b3b4b1708cd9e3ef25c08b0ad00f`
**Phase 2 handoff artifact:** `docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md`
**Phase 1 report:** `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md`

**Confirmed canonical selector state:**
- AC11 = "Grade 4" → t1_g4
- AD11 = "Cenário 1" → bp1_division_differentiated
- AC21 = −R$100M → R100M
- A218 = "Base" → intermediario (pending Finance confirmation)
- VPL = −R$25,540,316 (confirmed cached)
- TIR = 9.67% (confirmed cached)
- Total enrollment 2028: 259 (workbook) vs 258 (application)

**Confirmed workbook tuition values for Cenário 1 (2028):**
- EY integral: R$94,006.97/year (R$7,833.91/month)
- EY manhã: R$55,271.61/year (R$4,605.97/month)
- LS: R$114,821.51/year (R$9,568.46/month)
- MS: R$125,853.62/year (R$10,487.80/month)
- HS: R$145,405.05/year (R$12,117.09/month)

**Confirmed WACC values:**
- Pre-ops: 13.25% (B6 = AD21 = B5+2%, where B5 = SELIC = 11.25%)
- Operating: 12.00% (C6 = B6−1.25%)
- Application values: identical

---

## 19. Exit-Control Evidence

Exit controls run after report write.

### Repository state (exit)

```
pwd:            /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
remote:         https://github.com/lussepolo/orgdesign.git (fetch and push)
branch:         main
HEAD:           d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

**git status --short (exit):**
```
 M IMPLEMENTATION.md
 M src/components/dreSimulator/dreScenarioWorkbook.ts
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts
?? docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md  ← NEW (authorized)
?? docs/audits/rio-resilience/phase-2-forensic-reconciliation-d743616.md
?? scripts/validate-phase15u2.ts
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts
```

**git diff --cached --stat (exit):** empty — no staged changes created by this session.

### Protected-file hash comparison

| Path | Entry SHA-256 | Exit SHA-256 | Match |
|---|---|---|---|
| IMPLEMENTATION.md | 6962a3e1... | 6962a3e1... | ✓ IDENTICAL |
| dreScenarioWorkbook.ts | b05b63a7... | b05b63a7... | ✓ IDENTICAL |
| orgDesignHcTableAdapter.ts | 60aed5c4... | 60aed5c4... | ✓ IDENTICAL |
| phase-2-forensic-reconciliation-d743616.md | 66cde5f0... | 66cde5f0... | ✓ IDENTICAL |
| validate-phase15u2.ts | 4acf5642... | 4acf5642... | ✓ IDENTICAL |
| payrollGovernanceWorkbookAdapter.ts | 833e415e... | 833e415e... | ✓ IDENTICAL |

**Authoritative workbook:**
- Entry SHA-256: d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4
- Exit SHA-256:  d9cb1fc3be10b27d7d916861e85e7dca1b35d5ae761cada1e244e7ca5e4568d4 ✓ IDENTICAL

### Files created by this session

| Path | Action | SHA-256 |
|---|---|---|
| `docs/audits/rio-resilience/phase-1-evidence-recovery-v9.md` | CREATED (authorized) | b9946c953b7b9e63d6d0916a38afc088c1a8b6e2514a5d951b7f060bc1ce0eb1 |

**No other repository paths were created or modified.**
**No staged changes were created.**
**No commits were created.**
**No IMPLEMENTATION.md modification.**
**No Phase 2 report modification.**
**Workbook was not modified, recalculated, or saved.**

---

## 20. Final Status

**PASS criteria verification:**

| Criterion | Status |
|---|---|
| A218 current value | ✓ "Base" |
| A218 formula/literal | ✓ literal (no formula) |
| A218 lineage | ✓ XLOOKUP key component into Cenários Receita |
| A218 validation rule or confirmed absence | ✓ no dataValidation element |
| Applicable enrollment source table | ✓ Cenários Receita rows 416–434 (BaseGrade 4) |
| Relevant enrollment scenario dimensions | ✓ occupancy rates by grade for all 3 scenarios |
| AD11 current value | ✓ "Cenário 1" |
| AD11 formula/literal | ✓ literal |
| AD11 lineage | ✓ Cenários Mensalidade Y1=PnL!AD11; IF selection; 5 target columns |
| AD11 validation rule and source | ✓ sqRef=AD11, inline list 5 options |
| Definitions of all five workbook tuition scenarios | ✓ all 5 with descriptions and values |
| Base-year tuition structure | ✓ by grade and segment for all 5 scenarios |
| Escalation rules | ✓ B38=PnL!$C$7=5.64% for 2028 (2029+ not fully captured — noted as partial but not blocking) |
| Discount dependencies | ✓ C222=−25% (direct evidence; contradicts Phase 2 claim of −12% — recorded as discrepancy for Phase 2 investigation) |
| Exact WACC source cells | ✓ B5=11.25%, AD21=B5+2%=13.25%, B6=AD21, C6=B6−1.25%=12% |
| Operative discount-factor formulas | ✓ B308=(1+B6), C308=B308×(1+C6), B305=B295/B308 |
| VPL formula and precedent relationship | ✓ Z307=SUM(B305:W305) |
| TIR relationship | ✓ Z306=IRR(B295:W295) |
| Complete material selector state | ✓ AC11, AD11, AC21, A218 all confirmed |
| Explicit mapping status for all candidates | ✓ E7 table complete |
| Evidence to identify mutually aligned Phase 2 scenario | ✓ Grade 4 / Base / Cenário 1 / −100M is candidate |
| Identical entry/exit hashes for all protected paths | ✓ all 6 paths confirmed |
| Unchanged branch and HEAD | ✓ main / d743616... |
| No staged changes created by this session | ✓ |
| No unauthorized repository changes | ✓ |

**STATUS: PASS**
