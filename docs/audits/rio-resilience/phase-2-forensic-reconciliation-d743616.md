# Phase 2 Forensic Reconciliation Report
## Rio Scenario Resilience Application vs. Workbook "Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx"

> **Archival note:** This report records the repository state observed during the read-only audit at HEAD `d743616916d8b3b4b1708cd9e3ef25c08b0ad00f`. The subsequent creation of this Markdown artifact is an authorized documentation-only mutation and does not change the audit's recorded entry/exit evidence.

---

## Section 1 — Executive Conclusion

The Phase 2 forensic reconciliation **cannot be completed to PASS standard** under the evidence available at this revision.

**Primary blocking condition:** Phase 1 produced workbook formula-lineage evidence for only 6 of the 39 required calculations. For 33 calculations, no workbook cell reference, formula, or precedent chain was captured; those cells are therefore NOT TRACEABLE from available Phase 1 evidence alone.

**Secondary blocking condition:** The workbooks are not the same version across the audit chain. Phase 1 audited "v9.xlsx". The application's annual OPEX assumption source data (`dreAnnualAssumptionSourceData.ts`) was extracted from "vCR v7 (2).xlsx". The capital bridge parity fixture (`capitalDecisionR100mParitySourceData.ts`) was extracted from "vBU v8 (2).xlsx". The governance source of truth declared in Phase 14B.4 is "vBU v8 (1).xlsx". No cross-version formula reconciliation has been confirmed between v7, v8, and v9. A spot check in Phase 14B.4 found two service-contract rows identical in v7 and v8 for 2028–2029 only; this is not a full reconciliation.

**Known formula-structure matches (evidence sufficient for STRUCTURAL ANALOGY classification):** EBITDA three-component sum; DCF cumulative-product discount factor; IRR Newton-Raphson convention; PPE depreciation method; NOL/tax rate and annual compensation limit.

**Known numerical divergence (not classifiable as PASS without aligned scenario):** The canonical validation scenario (t1_g3 / intermediario / bp1 / balanced_experience / R$100M) produces 228 learners in the application engine vs. the workbook's 246. The source of both values is unproven at workbook level because A218 has no dropdown and Phase 1 did not read the 'Cenários Receita' source table.

**Exit status:** PHASE 2 RECONCILIATION STATUS: BLOCKED

---

## Section 2 — Repository and Entry-State Evidence

### Entry state (recorded before any reads)

```
pwd:              /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
git toplevel:     /Users/lucianapolonen/Desktop/Projectionriocampus/rio-strategic-org-design
remote (fetch):   https://github.com/lussepolo/orgdesign.git
remote (push):    https://github.com/lussepolo/orgdesign.git
branch:           main
HEAD:             d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
last commit:      d743616 Correct Phase 15S.2 Scenario B 2028 workbook values
```

**Working tree (NOT CLEAN):**

```
 M src/components/dreSimulator/dreScenarioWorkbook.ts         (user-modified: +50 lines)
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts  (user-modified: +8/-4)
?? scripts/validate-phase15u2.ts                               (user-untracked)
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts  (user-untracked)
```

All four files are user-owned changes that pre-existed this audit session. None were read, modified, or touched during this session.

### Known commits verified

- `4eb0a59`: present (confirmed via prior session git verification)
- `828d171`: present (confirmed via prior session git verification)

### Exit state (recorded after all reads, before writing this report)

```
 M src/components/dreSimulator/dreScenarioWorkbook.ts
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts
?? scripts/validate-phase15u2.ts
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts
HEAD: d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

Entry and exit state are **identical**. No mutation occurred during the audit session itself.

---

## Section 3 — Product-Identity Confirmation

### Known commits

- `4eb0a59`: present
- `828d171`: present

### Feature path confirmed

`src/features/rio-scenario-resilience/` exists and is populated with all operative models.

### Source workbook versions found in application code

| Reference | File | Workbook name | Used for |
|---|---|---|---|
| Phase 12D extraction | `dreAnnualAssumptionSourceData.ts:80` | "Concept Rio - 20 anos - Org BU - Apresentação vCR v7 (2).xlsx" | 620 annual OPEX values |
| Phase 14B.4 governance SoT | `dreLineItemMap.ts:22` | "Concept Rio - 20 anos - Org BU - Apresentação vBU v8 (1).xlsx" | DRE row classification |
| Capital bridge parity | `capitalDecisionEngine.ts:61` | "Concept Rio - 20 anos - Org BU - Apresentacao vBU v8 (2).xlsx" | Bridge parity fixture |
| Phase 1 audit (this engagement) | N/A | "Concept Rio - 20 anos - Org BU - Apresentação v9.xlsx" | VPL/TIR cached values, EBITDA formula |

Cross-version consistency is unconfirmed across all four versions. Proceeding on the basis that EBITDA and revenue formulas in v9 are structurally identical to v8 — this is an assumption, not Phase 1 evidence.

---

## Section 4 — Operative Execution-Path Map

From UI to output:

```
App.tsx:47        import DreScenarioSimulatorTab
App.tsx:48        import { RioScenarioResiliencePreview }
App.tsx:297       <DreScenarioSimulatorTab
                    selections={DreScenarioSimulatorSelections}
                    onSendToCapitalDecision={capitalDecisionWorkspace.importFromDre}
                    onNavigateToCapitalDecision={...}
                  />

DreScenarioSimulatorTab.tsx:33–40
                  const { dreOutput, fopagOutput, payrollReconciliation, orgDesignSensitivity }
                    = useDreScenarioSimulator({ selections, onSelectionsChange })

useDreScenarioSimulator → calculateDre(DreEngineInput):
  ├── calculateReceita({ openingPackageId, occupancyScenarioId, tuitionScenarioId })
  │     ← COMBINED_ENROLLMENT_RECORDS (openingPackageOccupancySourceData.ts)
  │     ← TUITION_SOURCE_RECORDS (tuitionSourceData.ts)
  │     ← DISCOUNT_SCHEDULE_SOURCE (discountScheduleSourceData.ts)
  │     ← ENROLLMENT_TUITION_GRADE_MAPPING (enrollmentTuitionGradeMapping.ts)
  └── calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId })
        ← buildPayrollAdapterInput() → payrollAdapter.ts → orgDesignPayrollActivation.ts

DRE output (byYear) → DreAnnualTable, DreSummaryCards, DreEbitdaChart

onSendToCapitalDecision(selections):
  → calculateCapitalDecisionBridge(CapitalDecisionEngineInput):
      ├── calculateDre() [called again with same inputs]
      ├── calculateCapexSchedule({ capexOptionId, rolByYear })
      ├── calculatePpeDepreciation({ preOpsExpansionCapexPositiveBRL, totalCapexPositiveByYear })
      ├── calculateNolTax({ ebtByPeriod })
      └── (Phase 15C) calculateDiscountedCashFlow({ periods, preOpsWaccRate, operatingPeriodWaccRate })
            + calculateIrr({ cashFlows })
```

UI-to-engine path confirmed from source files. All engines traced to explicit import chains. No placeholder or stub in the production path.

---

## Section 5 — Engine-Status Inventory

| Engine file | Status | Function | Invoked in production path |
|---|---|---|---|
| `dreEngine.ts` | OPERATIVE | `calculateDre()` — formulaVariant3 EBITDA | YES — `useDreScenarioSimulator` |
| `receitaEngine.ts` | OPERATIVE | `calculateReceita()` — tuition revenue | YES — called inside `calculateDre()` |
| `fopagEngine.ts` | OPERATIVE | `calculateFopag()` — payroll by allocation model | YES — called inside `calculateDre()` |
| `capitalDecisionEngine.ts` | OPERATIVE | `calculateCapitalDecisionBridge()` — FCO bridge | YES — on "Send to Capital Decision" |
| `capexScheduleEngine.ts` | OPERATIVE | `calculateCapexSchedule()` — CAPEX by year | YES — inside capital bridge |
| `ppeDepreciationEngine.ts` | OPERATIVE | `calculatePpeDepreciation()` — D&A | YES — inside capital bridge |
| `nolTaxEngine.ts` | OPERATIVE | `calculateNolTax()` — 34% IRPJ/CSLL + NOL | YES — inside capital bridge |
| `discountedCashFlowEngine.ts` | OPERATIVE | `calculateDiscountedCashFlow()` — VPL | YES — Phase 15C, wired |
| `irrEngine.ts` | OPERATIVE | `calculateIrr()` — TIR | YES — Phase 15C, wired |
| Legacy engines in `/Downloads/Projectionriocampus` | WRONG REPO | `baseline.ts`, `sensitivity.ts` | Not in scope — withdrawn |

---

## Section 6 — Opening-Package and Activation Reconciliation

### Terminology distinctions (verified from source)

| Concept | Source file / line | Evidence |
|---|---|---|
| Package selection | `DreLeverPanel` → `DreScenarioSimulatorSelections.openingGrades.selectedOptionId` | UI lever |
| Campus operating year | 2028 for all four packages | `OPENING_PACKAGE_DIRECT_WORKBOOK_YEAR` starts 2028 |
| Grades active in t1_g4 in 2028 | T1, T2, PK3, PK4, Kindergarten, G1, G2, G3, G4 | `openingPackageOccupancySourceData.ts:598–606` |
| Grades inactive in t1_g4 in 2028 | G5, G6, G7, G8, G9, G10, G11, G12 | Same file, lines 607–614 |
| MS activation (first G6 active) | t1_g6=2028; t1_g5=2029; t1_g4=2030; t1_g3=2031 | `openingPackageOccupancySourceData.ts:221–224` (`OPENING_PACKAGE_MIDDLE_SCHOOL_ACTIVATION`) |
| `orgDesignPayrollActivation.ts:780` scope | Educator role activation for MS grades (G6+) | String: "OPENING_PACKAGE_MIDDLE_SCHOOL_ACTIVATION_RECORDS" — applies only to MS educator payroll wiring |

**Correction of prior interpretation:** `orgDesignPayrollActivation.ts:780` does not describe the package opening year. It records when MS educator headcount activates for payroll purposes. The t1_g4 package opens in 2028 with Grade 4 as the highest grade. Grade 6 educators enter t1_g4 payroll in 2030. The previous audit report's statement "t1_g4=2030 activates" was incorrect in describing the package; 2030 is the MS educator activation year only.

### t1_g4 verified profile for 2028 (from `openingPackageOccupancySourceData.ts`)

| Item | Value | Source line |
|---|---|---|
| Package opens | 2028 | Direct workbook year starts 2028 |
| Grades active | T1, T2, PK3, PK4, Kindergarten, G1, G2, G3, G4 (9 grades) | Lines 598–606 |
| Grade 4 active status | `"active"` | Line 606 |
| Grade 4 capacity | 48 (2 rooms × 24 students) | `OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS:1118–1128` |
| Grade 4 sections | 2 | Line 1125 |
| Grade 4 enrollment intermediario | 22 | Line 3766 |
| Grade 4 enrollment pessimista | 20 | Line 3936 |
| Grade 4 enrollment otimista | 28 | Line 4106 |
| Grade 4 occupancy rate intermediario | 0.4583 (22/48) | Line 1723 |
| Total enrollment t1_g4 intermediario 2028 | 258 | Line 318 |
| Total enrollment t1_g4 pessimista 2028 | 190 | Line 328 |
| Total enrollment t1_g4 otimista 2028 | 264 | Line 338 |
| Available campus capacity 2028 | 348 | Line 246 |
| Campus occupancy intermediario 2028 | 74.1% (258/348) | Comment, line 318 |

**Claims from the audit protocol tested:**

- "t1_g4 opens through Grade 4 in 2028": **CONFIRMED** (G4 active, G5 inactive)
- "Total target enrollment 258": **CONFIRMED** for intermediario scenario
- "Total capacity 348": **CONFIRMED** (`availableCapacity: 348`)
- "Grade 4 has two sections": **CONFIRMED** (`sections: 2`)
- "Grade 4 has two educators": **NOT TRACEABLE** from application source without executing payroll adapter for this specific scenario-year-grade combination
- "Grade 4 has two assistants": **NOT TRACEABLE** — same reason

### Opening package summary

| Package | Grades active 2028 | MS entry (G6) first active | Total enrollment intermediario 2028 |
|---|---|---|---|
| `t1_g6` | T1–G6 (10 grades) | 2028 | Not read in this session |
| `t1_g5` | T1–G5 (approx.) | 2029 | Not read in this session |
| `t1_g4` | T1–G4 (9 grades) | 2030 | 258 (verified) |
| `t1_g3` | T1–G3 (approx.) | 2031 | Not read in this session |

### Workbook comparison

| Selector | Workbook | Application | Status |
|---|---|---|---|
| Opening grade | AC11 dropdown: "Grade 4" / "Grade 6" | `openingPackageId`: "t1_g4" / "t1_g6" | STRUCTURAL ANALOGY — 2 workbook options map to 2 of 4 application packages; t1_g3 and t1_g5 have no workbook equivalent |
| Grade 4 in 2028 | Workbook: AC11="Grade 4" (implies campus opens at Grade 4). No formula for which grades are active read in Phase 1. | App: t1_g4, Grade 4 active with 2 sections | NOT TRACEABLE (workbook internal grade schedule not captured in Phase 1) |

---

## Section 7 — Scenario-Selector Reconciliation

| Dimension | Workbook (Phase 1) | Application | Semantic comparison |
|---|---|---|---|
| Opening grade / package | AC11: "Grade 4" / "Grade 6" (2 options) | `openingPackageId`: t1_g3 / t1_g4 / t1_g5 / t1_g6 (4 options) | PARTIAL EQUIVALENT — "Grade 4" ≡ t1_g4 (highest active grade in 2028); "Grade 6" ≡ t1_g6; t1_g3/t1_g5 have no workbook equivalent |
| Enrollment scenario | A218: free-text cell (no dropdown); R-002 risk | `occupancyScenarioId`: intermediario / pessimista / otimista | NOT TRACEABLE — workbook A218 value in the scenario captured in Phase 1 not confirmed. No formula chain connecting A218 to specific enrollment figures was read in Phase 1. |
| Tuition scenario | AD11 dropdown: Cenário 1-5 (5 options) | `tuitionScenarioId`: bp1_division_differentiated / bp2_ey_ls_unified / bp3_ey_to_ms_unified / rj4 / rj5 (5 options, Phase 15Q) | PARTIAL EQUIVALENT on count (both = 5); semantic mapping between Cenário 1-5 and bp1-rj5 NOT ESTABLISHED in available evidence |
| Org design | Not present in workbook | `orgDesignOptionId`: minimum_experience / balanced_experience / premium_experience | APPLICATION-ONLY DIMENSION |
| CAPEX option | AC21 dropdown: –70M / –80M / –90M / –100M / –110M (5 levels) | `capexOptionId`: R$90M / R$100M (2 options) | PARTIAL EQUIVALENT — R$90M and R$100M correspond to 2 of 5 workbook levels; –70M, –80M, –110M have no application equivalent |

**Scenario alignment for numerical parity:** A mutually aligned scenario requires all five dimensions to match. The enrollment selector (A218 in workbook, occupancy enum in app) cannot be confirmed equivalent without Phase 1 reading the 'Cenários Receita' enrollment source. The tuition scenario mapping (Cenário 1 ≡ bp1?) cannot be confirmed without reading the AD11 source. **NO MUTUALLY ALIGNED SCENARIO CAN BE CONFIRMED FROM AVAILABLE EVIDENCE.** The first blocking selector is the enrollment dimension (A218 free-text vs. occupancy enum).

---

## Section 8 — Formula-Lineage Methodology

The following grading standards are applied:

- **EXACT FORMULA AND INPUT MATCH**: workbook formula read in Phase 1; application expression read in Phase 2; both normalized to identical mathematical form with confirmed equivalent inputs.
- **FORMULA MATCH / INPUT MISMATCH**: formula structure identical; inputs differ (different rates, different enrollment source, different version).
- **STRUCTURAL ANALOGY ONLY**: both use the same general accounting structure; specific line content, rates, or inputs not confirmed equivalent.
- **OUTPUT MATCH**: workbook and application agree on a specific numerical output without formula confirmation.
- **NOT TRACEABLE**: Phase 1 did not read the relevant workbook formula.
- **APPLICATION-ONLY DIMENSION**: feature exists in application, not present in workbook.
- **WORKBOOK-ONLY DIMENSION**: workbook has a selector or feature not present in application.
- **BLOCKED**: cannot be classified without additional workbook reads.

Application comments containing "workbook_parity" are not accepted as independent workbook evidence. Every match claimed rests on either (a) Phase 1 formula reads, or (b) explicit workbook-cell citations in the application source data that themselves constitute workbook evidence.

---

## Section 9 — Central Formula-Reconciliation Table

| # | Calculation | Workbook formula / location (Phase 1) | Application formula / location | Formula status | Input status | Output status | First causal divergence | Financial consequence |
|---|---|---|---|---|---|---|---|---|
| 1 | Enrollment | NOT READ — A218 free-text, no formula chain captured | `COMBINED_ENROLLMENT_RECORDS` filtered by (packageId, scenarioId, year, grade) — `openingPackageOccupancySourceData.ts` | NOT TRACEABLE | NOT TRACEABLE | Workbook PnL!221 ≈ 246 (unnamed canonical scenario); app: t1_g4/intermediario/2028 = 258 | A218 selector identity vs. occupancy enum unknown | All downstream revenue and cost |
| 2 | Capacity | NOT READ | `OPENING_PACKAGE_CAPACITY_BY_YEAR_AND_GRADE_RECORDS`: t1_g4/G4/2028 = 48 (2 sections × 24); campus total 348 | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Physical bound on enrollment |
| 3 | Occupancy | NOT READ | enrollment / capacity per record; t1_g4/intermediario/2028/G4 = 22/48 = 45.8% | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Revenue and DRE driver |
| 4 | Gross annual tuition | NOT READ — Cenários Mensalidade sheet not read in Phase 1 | `baseAnnualGrossContractValueBRL` from `TUITION_SOURCE_RECORDS` via `ENROLLMENT_TUITION_GRADE_MAPPING`; T1/T2: 50/50 blend of full-time + manhã; `receitaEngine.ts:92–113` | NOT TRACEABLE | NOT TRACEABLE | N/A | Tuition scenario mapping (Cenário N ≡ bp? unknown) | All revenue |
| 5 | Tuition escalation | NOT READ | `annualAdjustmentFactor = 1.08^(year-2028)`; `receitaEngine.ts:70–73` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Revenue ramp-up |
| 6a | Receita-level discount (average effective discount) | NOT READ | `DISCOUNT_SCHEDULE_SOURCE`: 2028=25%, 2029–30=20%, 2031–32=18%, 2033–35=15%, 2036+=12.5%; `discountScheduleSourceData.ts:9–19` | NOT TRACEABLE | NOT TRACEABLE | N/A | 2028 rate: 25% (app) vs. unknown in workbook | Net tuition revenue |
| 6b | DRE-level discount (Bolsa de Estudos / % Desconto Médio) | PnL!C228 = C222 × C225. C222 = PnL row 222 (driver row, direct input) | `bolsa_de_estudos = receitas_com_ensino_regular × percentual_desconto_medio`; `dreEngine.ts:116`; driver: 2028=–12%, 2033+=–12.5%; `dreRevenueDriverSourceData.ts:58–79` | STRUCTURAL ANALOGY ONLY — workbook formula C228=C222×C225 confirmed. Rate C222=–12% for 2028 confirmed by application source. | FORMULA MATCH / INPUT MISMATCH — workbook C222 = –12%; DISCOUNT_SCHEDULE_SOURCE 2028 = 25%. These apply to different calculation layers and must not be collapsed. | N/A (two separate mechanisms) | Distinct application layers for two workbook-visible discount rows | Bolsa de Estudos amount |
| 7 | Subscription-method discount (Descontos Método de Assinatura) | PnL!C230 = −C$13 × C225 (confirmed from workbook cell evidence in `dreRevenueDriverSourceData.ts:81`) | `descontos_metodo_de_assinatura = -desconto_metodo_rate × receitas_com_ensino_regular`; `dreEngine.ts:122` | EXACT FORMULA AND INPUT MATCH — C230 = −C$13 × C225 ≡ −desconto_metodo × receitas. Rate back-derived as Z13 = −Y230/Y225. Formula closure confirmed (`dreEngine.ts:329–332`). | FORMULA MATCH / INPUT MISMATCH — rate confirmed in application source; not independently read from Phase 1 workbook cell. | N/A | Rate value not read in Phase 1 | Subscription discount line |
| 8 | Upselling revenue | NOT READ | `receitas_com_upselling = adesao_upselling × numero_de_alunos × ticket_medio_upselling`; `dreEngine.ts:109–110` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Supplementary revenue |
| 9 | Material revenue | NOT READ | `receita_com_material_didatico = numero_de_alunos × ticket_material × 12`; `dreEngine.ts:127` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Material revenue line |
| 10 | Other revenue (Outras Receitas) | PnL!C233 = ($Y233/$Y$221)×(1+C$9)×C$221 (formula observed in Phase 1). C$9 = `reajuste_despesas`. | `outras_receitas = outrasReceitasRatio × numero_de_alunos`; `dreEngine.ts:130`. **`reajuste_despesas` term (1+C$9) is NOT applied** — pending Finance source; `dreEngine.ts:322–327` | FORMULA MATCH / INPUT MISMATCH — workbook applies growth reajuste factor (1+C$9); application omits it. | FORMULA MATCH / INPUT MISMATCH | MISMATCH — application systematically understates Outras Receitas vs. workbook in years where C$9 ≠ 0 | `reajuste_despesas` not available in application source | Otras Receitas understated in all non-zero reajuste years |
| 11 | Gross operating revenue (Receita Operacional antes das Deduções) | NOT READ | `receita_operacional_antes_das_deducoes = receita_de_ensino_liquida + descontos_metodo + receita_eventos + receita_material + outras_receitas`; `dreEngine.ts:132–137` | NOT TRACEABLE | NOT TRACEABLE | N/A | Compounds items 6–10 | All below lines |
| 12 | PIS/COFINS deductions | NOT READ | `deducoes = -percentual_deducoes × receita_operacional_antes_das_deducoes`; rate = 0.0582 (back-derived); `dreEngine.ts:140`; `dreRevenueDriverSourceData.ts:109` | NOT TRACEABLE | NOT TRACEABLE | N/A | Rate source not confirmed | ROL |
| 13 | ROL / Net operating revenue | PnL!C236 referenced in `capitalDecisionR100mParitySourceData.ts`; workbook cached value for canonical scenario 2028: R$22,851,714.10 | `receita_operacional_liquida = receita_operacional_antes_das_deducoes + deducoes`; `dreEngine.ts:142` | STRUCTURAL ANALOGY ONLY — formula structure matches. Workbook formula for C236 not captured in Phase 1. | FORMULA MATCH / INPUT MISMATCH — app uses upstream enrollment 228 learners; workbook 246. | OUTPUT MISMATCH for canonical scenario — app ≠ workbook (Phase 15B.2 finding) | Enrollment divergence upstream | Foundation of EBITDA |
| 14 | Role-level headcount activation | NOT READ (Org. Design sheet not captured) | `orgDesignPayrollActivation.ts` role records; `payrollAdapter.ts buildPayrollAdapterInput()` wires headcount per role × year × org-design option | NOT TRACEABLE | NOT TRACEABLE | N/A | — | All payroll amounts |
| 15 | Salary basis (gross monthly) | NOT READ | Per-role `grossMonthly` in `payrollAdapter.ts` records from role configuration | NOT TRACEABLE | NOT TRACEABLE | N/A | — | All payroll amounts |
| 16 | Direct payroll (FOPAG_DIRETO) | NOT READ (PnL rows 239/248 not captured) | `fopagDireto = SUM(grossLaborAnnualAfterGrowth for FOPAG_DIRETO records)`; `fopagEngine.ts:222–224`. Annualization: `(grossMonthly + laborChargesMonthly) × 13 × hc × 1.06^(year-2028+1)` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Contribution margin |
| 17 | Benefits (Benefícios) | NOT READ | `benefits = SUM(benefitsAnnualAfterGrowth for all active records)` = `benefitsMonthly × 12 × hc × growth`; `fopagEngine.ts:227` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Fixed cost |
| 18 | Encargos | EMBEDDED — `laborChargesMonthly` in per-role records; not a separately computed line | EMBEDDED in `laborChargesMonthly` per role; no independent encargos calculation; `fopagEngine.ts:157–159` | NOT TRACEABLE (not a standalone calculation) | NOT TRACEABLE | N/A | — | Inside payroll total |
| 19 | FGTS | EMBEDDED — inside laborChargesMonthly | EMBEDDED; no standalone FGTS engine | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Inside payroll total |
| 20 | INSS | EMBEDDED — inside laborChargesMonthly | EMBEDDED; no standalone INSS engine | NOT TRACEABLE | NOT TRACEABLE | N/A | — | Inside payroll total |
| 21 | Total FOPAG | NOT READ | `totalPayroll = fopagDireto + folhaDireta + benefits`; `fopagEngine.ts:251` | NOT TRACEABLE | NOT TRACEABLE | N/A | — | EBITDA components |
| 22 | Service contracts (8 lines) | NOT READ — lines not captured in Phase 1 | 8 lines in `total_custos_e_despesas_fixas`: servicos_de_limpeza_e_seguranca, consultoria_e_honorarios, conservacao_predial_e_manutencao_maquinas_e_moveis, locacao_de_maquinas_e_equipamentos, tecnologia_telefone_internet_licencas_e_servicos_de_informacao, energia_eletrica_agua_e_esgoto, materiais_de_limpeza, materiais_de_escritorio; `dreEngine.ts:188–204`; source values from `dreAnnualAssumptionSourceData.ts` (v7 workbook extraction) | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH — values from v7; Phase 1 workbook is v9; cross-version not confirmed | N/A | Source version mismatch (v7 vs. v9) | EBITDA fixed cost section |
| 23 | Fixed OPEX (non-service-contract lines, 9 lines) | NOT READ | `cursos_e_treinamentos`, `despesas_juridicas`, `rpa`, `aluguel_iptu`, `despesas_com_viagens`, `corporativo_bu`, `rateio_corporativo`, `demais_impostos_e_taxas`, `demais_custos_e_despesas`; same v7 source | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH (v7 vs. v9) | N/A | Source version mismatch | EBITDA fixed cost |
| 24 | Sales expenses (5 lines) | NOT READ | `despesas_com_marketing`, `pcld`, `despesas_bancarias`, `descontos_comerciais`, `despesas_com_sinistro` (canonical label corrected to Despesas com Isenção per `DRE_ANNUAL_ASSUMPTION_LABEL_CORRECTIONS`); `dreEngine.ts:237–249` | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH (v7 vs. v9); label correction: "Sinistro" → "Isenção" | N/A | Source version; label difference | EBITDA sales expense section |
| 25 | Contribution margin | PnL!C245 implicit (Phase 1 identified SUM at C273 = C245+C265+C271) | `margem_de_contribuicao = receita_operacional_liquida + custo_da_mercadoria_vendida + total_custo_direto`; `dreEngine.ts:175–176` | STRUCTURAL ANALOGY ONLY | FORMULA MATCH / INPUT MISMATCH (enrollment upstream) | OUTPUT MISMATCH (canonical scenario) | Enrollment divergence | Propagates to EBITDA |
| 26 | Depreciation and amortization | PnL!C275 referenced. Workbook formula not captured. Cached value for R100M 2028 = –R$4,689,518.38 (from `dreAnnualAssumptionSourceData.ts`) | `calculatePpeDepreciation()`: existing base / 15yr SL (2028–2042) + annual CAPEX vintages / 10yr half-year convention; `ppeDepreciationEngine.ts` | NOT TRACEABLE (workbook formula not read) | FORMULA MATCH / INPUT MISMATCH — R100M 2028 output: –R$4,689,518.38 (app, from source data); same value in `dreAnnualAssumptionSourceData.ts`. Internal consistency check, not independent workbook read. | OUTPUT MATCH — R$4,689,518.38; this is circular (same extraction) | — | D&A line |
| 27 | EBITDA | PnL!C273 = SUM(C245,C265,C271) — formula captured in Phase 1 | `ebitda = margem_de_contribuicao + total_custos_e_despesas_fixas + total_despesas_com_vendas`; `dreEngine.ts:254–255` | STRUCTURAL ANALOGY ONLY — formula structure SUM(MC, FCF, SDV) is identical. Individual line content, rates, payroll amounts not confirmed equivalent. | FORMULA MATCH / INPUT MISMATCH — same three-component structure; inputs differ at enrollment, payroll, and discount layers | OUTPUT MISMATCH for canonical scenario (Phase 15B.2) | Enrollment divergence propagates through all inputs | VPL, TIR, Payback |
| 28 | EBITDA margin | NOT READ | `percentual_ebitda = ebitda / receita_operacional_liquida`; `dreEngine.ts:259` | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH | N/A | — | KPI |
| 29 | EBIT | NOT READ | `ebitBRL = ebitdaBRL + depreciationAmortizationBRL`; `capitalDecisionEngine.ts:111` | STRUCTURAL ANALOGY ONLY | FORMULA MATCH / INPUT MISMATCH | N/A | — | EBT |
| 30 | Financial result | Cap1–Cap8 all zero (Phase 1 R-001 risk) | `financialResultBRL = 0` for all periods; `capitalDecisionEngine.ts:109–110` | EXACT FORMULA AND INPUT MATCH | EXACT FORMULA AND INPUT MATCH | OUTPUT MATCH | — | EBT = EBIT |
| 31 | Tax and NOL | NOT READ — "Recuperacao de Prejuizos" sheet not read in Phase 1 | `calculateNolTax()`: TAX_RATE=34%, NOL_TAXABLE_BASE_FRACTION=0.7 (30% annual compensation limit), all-or-nothing exhaustion; `nolTaxEngine.ts`; `nolMethodLabel: "workbook_parity_nol_method"` | NOT TRACEABLE — workbook formulas not read; application claims workbook parity | FORMULA MATCH / INPUT MISMATCH (upstream EBT diverges) | N/A | EBT divergence propagates | Net income |
| 32 | Operating cash flow (FCO) | NOT READ (PnL!290 not captured) | `fcoBRL = netIncomeBRL + depreciationAddBackBRL + financialResultAddBackBRL`; `capitalDecisionEngine.ts:128` | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH | N/A | — | FCO after CAPEX |
| 33 | CAPEX | AC21: –70M / –80M / –90M / –100M / –110M (5 workbook levels) | `calculateCapexSchedule()`: R$90M / R$100M only (2 options); expansion + sustain components; `capexScheduleEngine.ts` | NOT TRACEABLE (workbook CAPEX schedule formula not captured) | WORKBOOK-ONLY DIMENSION for –70M/–80M/–110M; R$90M/R$100M: partial equivalent | N/A | Scope mismatch | FCO after CAPEX |
| 34 | Free cash flow (FCO after CAPEX) | NOT READ (PnL!295/296 not captured in Phase 1; cached fixture in application from v8.2) | `fcoAfterCapexBRL = fcoBRL + capex.capexTotalSignedBRL`; cumulative tracked; `capitalDecisionEngine.ts:131–132` | NOT TRACEABLE | FORMULA MATCH / INPUT MISMATCH (v8.2 fixture vs. Phase 1 v9) | N/A | Version mismatch | VPL, TIR |
| 35 | WACC / Discount factors | PnL row 308 formula not captured in Phase 1 | `discountFactor[1] = 1 + preOpsWaccRate (13.25%); discountFactor[i] = discountFactor[i-1] × (1 + 12%)`; `discountedCashFlowEngine.ts:69–72` | NOT TRACEABLE (formula not captured; rates unconfirmed against workbook) | NOT TRACEABLE | N/A | WACC rate not read from workbook | VPL |
| 36 | VPL / NPV | PnL!Z307: 2D Data Table output, cached R$–25,540,316 (Phase 1) | `cumulativeDiscountedCashFlowBRL = Σ fcoAfterCapexBRL / discountFactor[i]`; `discountedCashFlowEngine.ts:74–79` | NOT TRACEABLE — workbook formula at Z307 is a 2D Data Table output; scalar VPL formula cell not captured | NOT TRACEABLE | OUTPUT MISMATCH — application produces a different value (no aligned scenario; enrollment diverges; WACC rates not confirmed) | Multiple upstream divergences | Investment decision |
| 37 | TIR / IRR | `IRR(B295:W295)` (Phase 1); cached 9.67% | `calculateIrr()`: Newton-Raphson from 0.10 seed + bisection fallback; exponent convention: `cashFlows[i] / (1+rate)^i`; `irrEngine.ts:27–30` | STRUCTURAL ANALOGY ONLY — both use Excel IRR() convention (`cashFlows[0]` at exponent 0). Method documented to match Excel IRR(). | FORMULA MATCH / INPUT MISMATCH (input cash flows diverge) | NOT APPLICABLE (no aligned scenario) | FCO divergence upstream | Investment decision |
| 38 | Payback | Cached: NA (Phase 1) | `discountedPaybackEngine.ts` — not read in this session; Phase 15C scope | NOT TRACEABLE | NOT TRACEABLE | NOT APPLICABLE | — | Investment decision |
| 39 | Sensitivity / scenario comparison | 3 Excel 2D Data Tables at PnL!Z307: row input = AC21 (CAPEX), column inputs = AC11 / AD11; Phase 1 confirmed Data Table structure | `ScenarioComparisonPanel` / `OrgDesignSensitivityPanel` — live engine calls for up to 4 user-selected scenario combinations; `DreScenarioSimulatorTab.tsx:114–121` | STRUCTURAL ANALOGY ONLY — both compare results across scenario combinations. Workbook: 2D Data Table parametric sweep. Application: up to 4 user-selected full-model runs. Methodologically distinct. | FORMULA MATCH / INPUT MISMATCH — application uses live engine; workbook uses table substitution | N/A (different axes, different method) | Methodological difference | Scenario output comparability |

---

## Section 10 — Revenue Reconciliation

### Discount conflict resolved

There are **two structurally separate discount mechanisms** in the application corresponding to two separate workbook rows:

**Layer 1 — Receita engine discount (DISCOUNT_SCHEDULE_SOURCE):**

- Location: `receitaEngine.ts:79–84`; `discountScheduleSourceData.ts:9–19`
- Applies: after annual tuition adjustment, before Receita is passed to DRE
- 2028 rate: **25%**; ramp: 25% → 20% → 18% → 15% → 12.5% (from 2036)
- Represents: average effective discount rate on gross annual tuition contracts
- Source: Head of Finance message (`discountScheduleSourceData.ts:30`)
- Phase 1 workbook evidence for this layer: NONE CAPTURED

**Layer 2 — DRE engine discount (percentual_desconto_medio, Bolsa de Estudos):**

- Location: `dreRevenueDriverSourceData.ts:51–99`; `dreEngine.ts:116`
- Applies: to `receitas_com_ensino_regular` (net receita from Layer 1) in the DRE block
- 2028 rate: **–12%**; ramp: –12% (2028–2032) → –12.5% (2033+)
- Source extracted from: PnL row 222 (direct input cell)
- Phase 1 workbook evidence: PnL!C228 = C222 × C225 pattern confirmed; C222 = –12% for 2028

These two discounts operate in sequence and must not be collapsed. The source note in the application explicitly flags this: `"DISCOUNT_SCHEDULE_SOURCE ... is a structurally analogous but DIFFERENT schedule; must not be collapsed into this PnL driver."` (`dreRevenueDriverSourceData.ts:86–91`)

**Protocol claim tested:** "Intended schedule may be 20% for 2028–2030; 17% for 2031; 15% for 2032–2033; 12.5% from 2034 onward."
- This schedule matches neither `DISCOUNT_SCHEDULE_SOURCE` (25% in 2028, not 20%) nor `percentual_desconto_medio` (–12% in 2028, not –17%).
- This claim is UNVERIFIED — no Finance source confirmation found in application code.

### `reajuste_despesas` confirmed missing

The workbook formula for Outras Receitas at PnL!C233 = ($Y233/$Y$221)×(1+C$9)×C$221. The term (1+C$9) where C$9 = `reajuste_despesas` growth rate is present in the workbook. The application uses only `outrasReceitasRatio × numero_de_alunos` (no reajuste term). The engine note at `dreEngine.ts:323–327` confirms: "the (1+C$9) reajuste term is omitted pending Finance source confirmation." This is a **systematic understatement** of Outras Receitas in every year where the growth factor exceeds 1.

---

## Section 11 — Payroll, Benefits, Encargos, FGTS, and INSS Reconciliation

### Application payroll structure

| Component | Application treatment | DRE destination |
|---|---|---|
| `grossMonthly` (CLT/PJ gross salary) | Per-role source record | Part of `grossLaborAnnualBeforeGrowth` |
| `laborChargesMonthly` | Per-role source record; **embeds encargos + FGTS + INSS as a composite monthly charge** | Same annualization as gross |
| Annualization formula | `(grossMonthly + laborChargesMonthly) × 13 × headcountOrFte` (13-month convention) | — |
| Growth factor | `resolveGrowthFactor(year, 2028, 1.06) = 1.06^(year-2028+1)`; 2028 → ×1.06; `fopagEngine.ts:150–155` | — |
| `grossLaborAnnualAfterGrowth` | If `allocationModel = FOPAG_DIRETO`: → `fopagDireto` (direct cost) | `fopag_direto_clt_pj` in DRE direct costs |
| `grossLaborAnnualAfterGrowth` | If `allocationModel = FOLHA_DIRETA`: → `folhaDireta` (fixed cost) | `folha_de_pagamento` in DRE fixed costs |
| `benefitsAnnualAfterGrowth` | `benefitsMonthly × 12 × hc × growth`; pooled for all active records | `beneficios` in DRE fixed costs |
| `total_folha_de_pagamento` | `fopag_direto + folha_de_pagamento`; **memo KPI only, excluded from EBITDA** | Excluded from `total_custos_e_despesas_fixas` |

### Encargos, FGTS, INSS

These are NOT calculated independently in any engine. They are absorbed into `laborChargesMonthly` per role. Their individual values are NOT traceable from the application without reading per-role records in `payrollAdapter.ts` and `orgDesignPayrollActivation.ts` for a specific scenario.

### Workbook evidence

Phase 1 did not capture the Org. Design sheet formulas. The workbook SUMIFS structure from Org. Design → PnL rows 239/246/247 was referenced but not read. Classification: **NOT TRACEABLE** for role-level payroll items 14–21.

---

## Section 12 — OPEX and Service-Contract Reconciliation

### Eight service-contract DRE lines (all in `total_custos_e_despesas_fixas`)

| dreLineId | Display label | 2028 value (v7 extraction) | observedCostBehavior | serviceContractsMappingStatus |
|---|---|---|---|---|
| `servicos_de_limpeza_e_seguranca` | Serviços de Limpeza e Segurança | –R$1,081,913.28 | revenue_formula_driven | not_mapped_independent_finance_assumption |
| `consultoria_e_honorarios` | Consultoria e Honorários | –R$31,392.00 | fixed_escalation_driven | not_mapped_independent_finance_assumption |
| `conservacao_predial_e_manutencao_maquinas_e_moveis` | Conservação Predial e Manutenção Máquinas e Móveis | –R$458,614.09 | revenue_formula_driven | not_mapped_independent_finance_assumption |
| `locacao_de_maquinas_e_equipamentos` | Locação de Máquinas e Equipamentos | –R$69,259.02 | revenue_formula_driven | not_mapped_independent_finance_assumption |
| `tecnologia_telefone_internet_licencas_e_servicos_de_informacao` | Tecnologia, Telefone, Internet, Licenças e Serviços de Informação | –R$138,166.68 | revenue_formula_driven | pending_row_level_reconciliation |
| `energia_eletrica_agua_e_esgoto` | Energia Elétrica, Água e Esgoto | –R$452,230.25 | learner_or_class_formula_driven | not_mapped_independent_finance_assumption |
| `materiais_de_limpeza` | Materiais de Limpeza | –R$109,575.30 | revenue_formula_driven | not_mapped_independent_finance_assumption |
| `materiais_de_escritorio` | Materiais de Escritório | –R$54,095.25 | revenue_formula_driven | not_mapped_independent_finance_assumption |

**Double-count guard confirmed:** All 8 records confirm `serviceContractsMappingStatus: not_mapped_independent_finance_assumption` (or pending for tecnologia). These values are NOT additionally subtracted through a Service Contracts engine. They enter EBITDA once, as normal fixed-cost assumption lines.

**Workbook formulas for service-contract lines:** NOT READ in Phase 1. The observed behaviors are from application code examining v8 PnL formulas, not from Phase 1.

**Label discrepancy:** `dreAnnualAssumptionSourceData.ts` source record IDs differ from `dreEngine.ts` variable names for 5 records. The engine handles this via `dreLineItemMapDreLineId` join key (`dreEngine.ts:55–64`).

**Version mismatch:** Source data extracted from v7. Phase 14B.4 spot-check found two rows identical in v7 and v8 for 2028/2029. Full 31-row reconciliation against v8 or v9 not done.

### Non-service-contract fixed cost lines (2028 values, v7 source)

| dreLineId | 2028 value |
|---|---|
| `cursos_e_treinamentos` | –R$364,461.50 |
| `despesas_juridicas` | –R$20,000.00 |
| `rpa` | –R$15,484.44 |
| `aluguel_iptu` | –R$4,315,008.67 |
| `despesas_com_viagens` | –R$186,312.25 |
| `corporativo_bu` | R$0 |
| `rateio_corporativo` | R$0 |
| `demais_impostos_e_taxas` | –R$41,458.71 |
| `demais_custos_e_despesas` | –R$313,920.00 |

All nine are classified `independent_finance_assumption`, `independent_of_board_decision_levers`. Workbook formulas: NOT TRACEABLE from Phase 1.

---

## Section 13 — EBITDA-Definition and EBITDA-Margin Reconciliation

### Formula structure

| Item | Workbook (Phase 1) | Application (`dreEngine.ts:254–255`) |
|---|---|---|
| Formula | `PnL!C273 = SUM(C245, C265, C271)` | `ebitda = margem_de_contribuicao + total_custos_e_despesas_fixas + total_despesas_com_vendas` |
| C245 / margem_de_contribuicao | Component 1 | Component 1 |
| C265 / total_custos_e_despesas_fixas | Component 2 | Component 2 |
| C271 / total_despesas_com_vendas | Component 3 | Component 3 |

**Formula structure:** STRUCTURAL ANALOGY ONLY. The three-component sum is identical. The specific lines inside each component are not confirmed equivalent from Phase 1 reads.

**Revenue basis:** STRUCTURAL ANALOGY ONLY — formula structure matches; workbook formula for C236 not captured.

**Payroll scope:** NOT TRACEABLE — Org. Design sheet formulas not read in Phase 1.

**OPEX scope:** NOT TRACEABLE — 17 assumption line formulas not captured.

**Service-contract scope:** STRUCTURAL ANALOGY ONLY — same 8 lines, no double-count.

**Sales-expense scope:** NOT TRACEABLE — PnL row 271 aggregate formula not captured.

**Escalation:** FORMULA MATCH / INPUT MISMATCH — `reajuste_despesas` absent in application; workbook applies it to at least Outras Receitas (C233).

**Sign conventions:** Annual assumption values stored negative in application; FOPAG positive, negated once at usage (`dreEngine.ts:1–11`). Workbook sign convention not independently read.

**Numerical output:**

- Workbook canonical scenario 2028: R$–4,233,821.32 (v8 fixture, `R100M_EBITDA_BRL[2028]`)
- Application: NOT equal for canonical scenario (Phase 15B.2; enrollment divergence upstream)

**EBITDA classification:** STRUCTURAL ANALOGY ONLY for formula structure; NOT TRACEABLE for line-level inputs; OUTPUT MISMATCH for canonical scenario.

---

## Section 14 — Below-EBITDA and Investment-Metric Reconciliation

| Item | Workbook formula | Application formula / location | Status |
|---|---|---|---|
| D&A | PnL!C275 — formula not read | `calculatePpeDepreciation()`: pre-ops base / 15yr SL + annual CAPEX vintages / 10yr half-year convention | NOT TRACEABLE (workbook formula not read) |
| EBIT | PnL!C276 — not read | `ebitBRL = ebitdaBRL + depreciationAmortizationBRL`; `capitalDecisionEngine.ts:111` | STRUCTURAL ANALOGY ONLY |
| Financial result | Cap1–Cap8 all zero (Phase 1, R-001) | `financialResultBRL = 0`; `capitalDecisionEngine.ts:109–110` | EXACT FORMULA AND INPUT MATCH |
| EBT | Not read | `ebtBRL = ebitBRL + financialResultBRL`; `capitalDecisionEngine.ts:112` | STRUCTURAL ANALOGY ONLY |
| Tax / IRPJ+CSLL | Not read (rate: 34% inferred) | `TAX_RATE = 0.34`; `nolTaxEngine.ts:39` | STRUCTURAL ANALOGY ONLY (rate not independently confirmed from Phase 1) |
| NOL method | "Recuperacao de Prejuizos" sheet — not read | `calculateNolTax()`: 70% taxable base (30% compensation limit), all-or-nothing exhaustion; `nolMethodLabel: "workbook_parity_nol_method"` | NOT TRACEABLE (workbook formulas not captured) |
| Net income | Not read | `netIncomeBRL = ebtBRL + taxTotalBRL`; `capitalDecisionEngine.ts:125` | STRUCTURAL ANALOGY ONLY |
| FCO | PnL!290 not read | `fcoBRL = netIncomeBRL + depreciationAddBackBRL + financialResultAddBackBRL`; `capitalDecisionEngine.ts:128` | NOT TRACEABLE |
| CAPEX | AC21 dropdown range (5 levels) | `calculateCapexSchedule()`: R$90M or R$100M; expansion + sustain | NOT TRACEABLE (workbook schedule formula not read) |
| FCO after CAPEX | PnL!295/296 not read; v8 fixture available | `fcoAfterCapexBRL = fcoBRL + capexTotalSignedBRL`; `capitalDecisionEngine.ts:131` | NOT TRACEABLE (Phase 1) |
| WACC (pre-ops) | Not read | 13.25%; `discountedCashFlowEngine.ts:9` | NOT TRACEABLE |
| WACC (operating) | Not read | 12%; `discountedCashFlowEngine.ts:10` | NOT TRACEABLE |
| Discount factor | PnL row 308 not read | `discountFactor[1] = 1 + 13.25%; discountFactor[i] = prev × (1 + 12%)`; `discountedCashFlowEngine.ts:69–72` | STRUCTURAL ANALOGY ONLY (workbook formula not captured) |
| VPL | PnL!Z307: 2D Data Table; cached R$–25,540,316 (Phase 1) | `Σ fcoAfterCapexBRL / discountFactor[i]`; `discountedCashFlowEngine.ts:74` | NOT TRACEABLE (scalar formula not captured) |
| TIR / IRR | `IRR(B295:W295)` (Phase 1); cached 9.67% | NR from 0.10 seed + bisection; `cashFlows[i] / (1+rate)^i`; `irrEngine.ts:27` | STRUCTURAL ANALOGY ONLY |
| Payback | Cached NA | `discountedPaybackEngine.ts` — not read | NOT TRACEABLE |
| Pre-ops EBITDA | "Pre-Ops" sheet — not read | Fixed literal: –R$17,667,521.16; `preOpsOperatingResultSourceData.ts` | NOT TRACEABLE |

---

## Section 15 — Sensitivity and Scenario-Comparison Reconciliation

### Workbook sensitivity (Phase 1 evidence)

- 3 Excel 2D Data Tables at PnL!Z307
- Row input cell: AC21 (CAPEX, –70M to –110M, 5 levels)
- Column input 1: AC11 (opening grade, 2 levels: Grade 4 / Grade 6)
- Column input 2: AD11 (tuition cenário, 5 options)
- Output: VPL cached at Z307 for each (AC21 × AC11 × AD11) combination
- Method: Excel parametric substitution (table substitution, not separate model runs)

### Application scenario comparison (Phase 2 evidence)

- `OrgDesignSensitivityPanel` (`DreScenarioSimulatorTab.tsx:121`): displays `orgDesignSensitivity` rows — EBITDA comparison across org-design options for the current opening package and occupancy scenario
- `ScenarioComparisonPanel` (via Capital Decision workspace): up to 4 user-selected full-model runs
- Method: live full-model computation per combination, not table substitution

### Classification

STRUCTURAL ANALOGY ONLY for the concept of scenario-based output comparison. The workbook 2D Data Tables sweep (CAPEX × grade × tuition) cannot be reproduced by the application's maximum-4-scenario interface without user interaction. The application has no programmatic CAPEX sensitivity sweep; the workbook does. The application org-design sensitivity has no workbook equivalent.

---

## Section 16 — Numerical Output Reconciliation

### Alignment attempt

The protocol requires at least one mutually aligned scenario to attempt numerical parity. The blocking conditions are:

1. **Enrollment alignment:** Workbook A218 free-text cell value for the scenario embedded in PnL!Z307's cached R$–25,540,316 is unknown from Phase 1. No mapping between A218 text values and the occupancy enum was captured.

2. **Tuition scenario alignment:** Workbook AD11 "Cenário 1" corresponds to unknown application tuition ID. No mapping confirmed in available evidence.

3. **CAPEX alignment:** Workbook AC21 = –R$100M corresponds to application capexOptionId = "R100M". This is the only confirmed alignment.

4. **Opening package alignment:** Workbook AC11 = "Grade 4" corresponds to application `t1_g4` (highest active grade in 2028 is Grade 4). Plausible but not confirmed from workbook internals.

5. **Org-design alignment:** No workbook equivalent. Application canonical validation uses `balanced_experience`.

**Conclusion:** NO MUTUALLY ALIGNED SCENARIO CAN BE CONFIRMED. The first blocking selector is the enrollment dimension: A218 vs. occupancy enum mapping is not established.

### Known numerical values

| Item | Workbook value | Source | Application comparator | Note |
|---|---|---|---|---|
| VPL (unspecified scenario) | R$–25,540,316 | Phase 1, PnL!Z307 cached | N/A (no aligned scenario) | — |
| TIR (unspecified scenario) | 9.67% | Phase 1 cached | N/A | — |
| Payback | NA | Phase 1 cached | N/A | — |
| ROL 2028 (v8 fixture, canonical) | R$22,851,714.10 | `capitalDecisionR100mParitySourceData.ts` (v8.2) | Not comparable (version mismatch with Phase 1 v9) | — |
| EBITDA 2028 (v8 fixture, canonical) | R$–4,233,821.32 | Same | Same note | — |
| D&A 2028 (v7 source) | –R$4,689,518.38 | `dreAnnualAssumptionSourceData.ts` (v7) | Same value — internal consistency only | — |

### Phase 15B.2 engine-vs-fixture divergence

Application engine produces 228 learners for `t1_g3 / intermediario` in 2028 vs. workbook-fixture `R100M_ROL_BRL` (which encoded 246 learners in the baseline scenario). This is a scenario/input mismatch; the canonical validation scenario in the fixture uses an enrollment input not directly available from the current application `COMBINED_ENROLLMENT_RECORDS` path. It is NOT a formula defect — bridge formulas validated 25/25 in `capitalDecisionEngineValidation.ts` when fed the fixture values directly.

---

## Section 17 — Discrepancy, Source-of-Truth, and Next-Phase Register

| ID | Description | Workbook evidence | Application evidence | Causal layer | Affected years | Financial consequence | Source-of-truth status | Required decision |
|---|---|---|---|---|---|---|---|---|
| D-001 | Enrollment input divergence: engine vs. workbook fixture (canonical scenario) | PnL!221 = 246 (from v8.2 fixture) | `COMBINED_ENROLLMENT_RECORDS`: t1_g3/intermediario/2028 = 228 (Phase 13E) | Enrollment input — upstream of all revenue and cost | 2028 (first divergence; propagates all years) | All ROL, EBITDA, VPL, TIR | Unresolved — Finance must define which scenario selection state in the workbook maps to `t1_g3 / intermediario` in the application | Finance to provide workbook-scenario mapping |
| D-002 | Receita-level discount: app 25%, workbook baseline unknown | Not read in Phase 1 | DISCOUNT_SCHEDULE_SOURCE: 2028=25% (`discountScheduleSourceData.ts:10`) | Revenue discount rate | 2028–2047 | Net tuition revenue (receita) | Unresolved — Head of Finance provided the schedule; no workbook cell confirmed | Finance to confirm receita discount schedule or provide workbook cell |
| D-003 | `reajuste_despesas` growth factor omitted in application | PnL!C233 = ($Y233/$Y$221)×(1+C$9)×C$221 (observed) | Not applied — `dreEngine.ts:322–327` | Revenue (Outras Receitas) escalation | 2029–2047 (all years with non-zero C$9) | Outras Receitas understated vs. workbook | Unresolved — Finance source for `reajuste_despesas` annual values not yet provided | Finance to provide annual C$9 values |
| D-004 | Workbook version mismatch across audit chain | Phase 1: v9; OPEX source: v7; capital bridge fixture: v8.2; governance SoT: v8.1 | Multiple source files at different versions | Source provenance | All years | All OPEX values potentially stale if v9 differs from v7/v8 | Unresolved — only 2-row v7/v8 spot check completed | Finance to confirm v9 annual values match v8; or re-extract from v9 |
| D-005 | CAPEX scope mismatch | AC21: 5 options (–70M to –110M) | capexOptionId: R$90M / R$100M only (2 options) | Capital decision dimension | Pre-ops + all years | FCO and VPL for –70M / –80M / –110M not computable in application | Application scope decision | Product to decide whether remaining 3 CAPEX levels should be added |
| D-006 | Tuition scenario semantic mapping unconfirmed | AD11: Cenário 1-5 (identity not captured) | bp1 / bp2 / bp3 / rj4 / rj5 | Scenario selection | All years | All scenario-specific revenue | Unresolved | Phase 1 must be re-run to read tuition scenario definitions |
| D-007 | Enrollment selector (A218) identity unconfirmed | A218 = free-text (R-002 risk; value not read in Phase 1) | occupancyScenarioId enum (3 options) | Scenario selection | All years | All revenue and cost | Unresolved | Phase 1 must be re-run; Finance to define mapping |
| D-008 | Benefits/encargos/FGTS/INSS not independently calculated | Not read from workbook | Embedded in `laborChargesMonthly` per role; not decomposed | Payroll component detail | All years | Cannot verify individual encargos, FGTS, INSS amounts | Application design decision — composite monthly charge | Payroll governance to confirm if decomposition is required |
| D-009 | WACC rates not confirmed from Phase 1 | PnL row 308 not read | preOpsWacc=13.25%, operatingWacc=12% (from engine constants) | DCF discount rate | 2027–2047 | VPL and TIR | Unresolved | Phase 1 to read WACC source cells in workbook |
| D-010 | Label correction: "Despesas com Sinistro" → "Despesas com Isenção" | Phase 1 label not captured | `DRE_ANNUAL_ASSUMPTION_LABEL_CORRECTIONS:92–110` — corrected per Finance workbook v7 | DRE line label | All years | Sales expenses line mislabeled in prior documentation | Resolved in application (v7 label used); confirm against v9 | Phase 1 to verify v9 label |

---

## Section 18 — Exit-Control Evidence and Final Status

### Exit state (run after all reads, before writing this document)

```
git status --short --untracked-files=all:
 M src/components/dreSimulator/dreScenarioWorkbook.ts
 M src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter.ts
?? scripts/validate-phase15u2.ts
?? src/features/rio-scenario-resilience/model/payrollGovernanceWorkbookAdapter.ts

git diff --stat:
 src/components/dreSimulator/dreScenarioWorkbook.ts | 50 ++++++++++++++++++++++
 .../model/orgDesignHcTableAdapter.ts               |  8 ++--
 2 files changed, 54 insertions(+), 4 deletions(-)

git diff --cached --stat: (empty — no staged changes)

git rev-parse HEAD: d743616916d8b3b4b1708cd9e3ef25c08b0ad00f
```

**Comparison with entry state:** IDENTICAL. The same 2 modified files, same 2 untracked files, same diff statistics, same HEAD. No mutation occurred during the audit session itself.

### Final status determination

**PASS requires:** every calculation traced; formula comparison complete; ≥1 mutually aligned scenario with numerical parity; all claims evidence-supported; repository state unchanged.

**Why not PASS:**

- 33 of 39 calculations are NOT TRACEABLE (Phase 1 formula lineage not captured)
- No mutually aligned scenario confirmed (D-001, D-006, D-007 unresolved)
- Source workbook version not consistent across audit chain (D-004)

**Why not FAIL:**

- The audit requires complete evidence with a confirmed scenario where material non-equivalence is demonstrated. No such aligned scenario exists to demonstrate failure.

### Minimum conditions to advance to PASS or FAIL

1. Re-run Phase 1 to read A218 enrollment source (closes D-007)
2. Re-run Phase 1 to read AD11 dropdown source formulas and Cenários Mensalidade per-grade values (closes D-006)
3. Re-run Phase 1 to read WACC rate cells in PnL row 305/306 source area (closes D-009)
4. Finance to confirm whether v9 annual OPEX/assumption values match v7/v8 extractions (closes D-004)
5. Finance to define which (AC11, AD11, AC21, A218) combination corresponds to the canonical validation scenario (closes D-001)

---

## PHASE 2 RECONCILIATION STATUS: BLOCKED
