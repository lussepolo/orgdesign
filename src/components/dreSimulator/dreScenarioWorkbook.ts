// Phase 14B (2026-06-10): Audit-grade XLSX export for the currently selected
// DRE Scenario Simulator result.
//
// Deterministic-calculation rule: this module performs NO independent
// calculation. Every value originates from the unified scenario result
// (dreOutput / fopagOutput / payrollReconciliation / orgDesignSensitivity)
// produced by useDreScenarioSimulator(). Formula-derived DRE rows are
// re-expressed as in-workbook Excel formulas (referencing same-sheet or
// cross-sheet cells) using the same arithmetic as dreEngine.ts, with the
// engine-computed value written as the cached cell value.
//
// Out of scope (per Phase 14B instructions): cash-flow, CAPEX bridge, DCF,
// NPV/VPL, payback, discounted payback, break-even investment recovery, Tier.
// Workbook learner counts are not used — all enrollment figures come from
// dreOutput.byYear[year].numero_de_alunos.

import * as XLSX from "xlsx";
import { calculateDre } from "../../features/rio-scenario-resilience/model/dreEngine";
import { calculateFopag } from "../../features/rio-scenario-resilience/model/fopagEngine";
import { DRE_LINE_ITEM_MAP } from "../../features/rio-scenario-resilience/model/dreLineItemMap";
import { DRE_REVENUE_DRIVER_SOURCE_DATA } from "../../features/rio-scenario-resilience/model/dreRevenueDriverSourceData";
import { DRE_COST_DRIVER_SOURCE_DATA } from "../../features/rio-scenario-resilience/model/dreCostDriverSourceData";
import { DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER } from "../../features/rio-scenario-resilience/model/dreScenarioAdapters";
import { RECEITA_PROJECTION_YEARS } from "../../features/rio-scenario-resilience/model/receitaEngineContract";
import { ORG_DESIGN_PAYROLL_ACTIVATION } from "../../features/rio-scenario-resilience/model/orgDesignPayrollActivation";
import { WORKING_SCENARIO_RATIFICATION_STATUS } from "../../features/rio-scenario-resilience/model/dreWorkingScenario";
import { EXECUTIVE_ORG_SCENARIOS } from "../../features/rio-scenario-resilience/model/executiveOrgDesignModel";
import type {
  DreEngineOutput,
  DreYearResult,
} from "../../features/rio-scenario-resilience/model/dreEngineContract";
import type { FopagEngineOutput } from "../../features/rio-scenario-resilience/model/fopagEngineContract";
import type { DreLineItemRecord } from "../../features/rio-scenario-resilience/model/dreLineItemMapContract";
import type { OpeningPackageProjectionYear } from "../../features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "../../features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type {
  DreScenarioSimulatorSelections,
  OrgDesignSensitivityRow,
  PayrollReconciliationResult,
} from "../../hooks/useDreScenarioSimulator";

export interface OrgDesignPayrollVariant {
  dreOutput: DreEngineOutput;
  fopagOutput: FopagEngineOutput;
}

export interface ThreeVersionPayroll {
  minimum: OrgDesignPayrollVariant;
  balanced: OrgDesignPayrollVariant;
  premium: OrgDesignPayrollVariant;
}

// Phase 15R.1: compute three org design payroll variants, reusing the already-computed
// dreOutput/fopagOutput for the currently selected option to avoid redundant calculation.
export function computeOrgDesignPayrollVariants(
  selections: DreScenarioSimulatorSelections,
  existingDreOutput: DreEngineOutput,
  existingFopagOutput: FopagEngineOutput,
): ThreeVersionPayroll {
  function variantFor(orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId): OrgDesignPayrollVariant {
    if (orgDesignOptionId === selections.orgDesignOptionId) {
      return { dreOutput: existingDreOutput, fopagOutput: existingFopagOutput };
    }
    return {
      dreOutput: calculateDre({ ...selections, orgDesignOptionId }),
      fopagOutput: calculateFopag({
        openingPackageId: selections.openingPackageId,
        occupancyScenarioId: selections.occupancyScenarioId,
        orgDesignOptionId,
      }),
    };
  }
  return {
    minimum: variantFor("minimum_experience"),
    balanced: variantFor("balanced_experience"),
    premium: variantFor("premium_experience"),
  };
}

export interface DreScenarioWorkbookViewModel {
  selections: DreScenarioSimulatorSelections;
  defaultSelections: DreScenarioSimulatorSelections;
  dreOutput: DreEngineOutput;
  fopagOutput: FopagEngineOutput;
  payrollReconciliation: PayrollReconciliationResult;
  orgDesignSensitivity: readonly OrgDesignSensitivityRow[];
  exportedAt: Date;
  threeVersionPayroll: ThreeVersionPayroll;
}

const YEARS = RECEITA_PROJECTION_YEARS;

// Kept in sync with DreLeverPanel.tsx / OrgDesignPanel.tsx / OrgDesignSensitivityPanel.tsx.
const OCCUPANCY_LABELS: Record<string, string> = {
  pessimista: "Pessimista (Conservative)",
  intermediario: "Intermediário (Base)",
  otimista: "Otimista (Optimistic)",
};

const TUITION_LABELS: Record<string, string> = {
  bp1_division_differentiated: "BP1 — Division Differentiated",
  bp2_ey_ls_unified: "BP2 — EY/LS Unified",
  bp3_ey_to_ms_unified: "BP3 — EY to MS Unified",
};

const ORG_DESIGN_OPTION_LABELS: Record<string, string> = {
  minimum_experience: "Minimum Experience",
  balanced_experience: "Balanced Experience",
  premium_experience: "Premium Experience",
};

// Confirmed Phase 13G org-design addendum mapping (orgDesignScenarioOptionById,
// executiveOrgDesignModel.ts).
const EXECUTIVE_ORG_SCENARIO_BY_ORG_DESIGN_OPTION: Record<
  DreWorkingScenarioOrgDesignOptionId,
  "minimum" | "balanced" | "premium"
> = {
  minimum_experience: "minimum",
  balanced_experience: "balanced",
  premium_experience: "premium",
};

function executiveScenarioLabel(optionId: DreWorkingScenarioOrgDesignOptionId): string {
  const id = EXECUTIVE_ORG_SCENARIO_BY_ORG_DESIGN_OPTION[optionId];
  const scenario = EXECUTIVE_ORG_SCENARIOS.find((s) => s.id === id);
  return scenario ? `${scenario.label} (${scenario.posture})` : id;
}

// ── DreYearResult field order (53 fields, matches dreEngineContract.ts) ──────
const DRE_FIELDS_ORDER: (keyof DreYearResult)[] = [
  "numero_de_alunos",
  "numero_de_turmas",
  "ticket_servico",
  "receitas_com_ensino_regular",
  "receitas_com_upselling",
  "receita_de_ensino_bruta",
  "bolsa_de_estudos",
  "receita_de_ensino_liquida",
  "descontos_metodo_de_assinatura",
  "receita_com_eventos",
  "receita_com_material_didatico",
  "outras_receitas",
  "receita_operacional_antes_das_deducoes",
  "deducoes",
  "receita_operacional_liquida",
  "custo_de_material_digital",
  "custo_da_mercadoria_vendida",
  "fopag_direto_clt_pj",
  "eventos_seb",
  "certificacoes",
  "custos_com_alimentacao",
  "materiais_pedagogicos",
  "total_custo_direto",
  "margem_de_contribuicao",
  "folha_de_pagamento",
  "beneficios",
  "total_folha_de_pagamento",
  "cursos_e_treinamentos",
  "servicos_de_limpeza_e_seguranca",
  "consultoria_e_honorarios",
  "despesas_juridicas",
  "rpa",
  "aluguel_iptu",
  "conservacao_predial_e_manutencao_maquinas_e_moveis",
  "locacao_de_maquinas_e_equipamentos",
  "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
  "energia_eletrica_agua_e_esgoto",
  "materiais_de_limpeza",
  "materiais_de_escritorio",
  "despesas_com_viagens",
  "corporativo_bu",
  "rateio_corporativo",
  "demais_impostos_e_taxas",
  "demais_custos_e_despesas",
  "total_custos_e_despesas_fixas",
  "despesas_com_marketing",
  "pcld",
  "despesas_bancarias",
  "descontos_comerciais",
  "despesas_com_sinistro",
  "total_despesas_com_vendas",
  "ebitda",
  "percentual_ebitda",
];

const COST_LINE_FIELDS: (keyof DreYearResult)[] = [
  "fopag_direto_clt_pj",
  "folha_de_pagamento",
  "beneficios",
  "custo_de_material_digital",
  "custo_da_mercadoria_vendida",
  "eventos_seb",
  "certificacoes",
  "custos_com_alimentacao",
  "materiais_pedagogicos",
  "total_custo_direto",
  "cursos_e_treinamentos",
  "servicos_de_limpeza_e_seguranca",
  "consultoria_e_honorarios",
  "despesas_juridicas",
  "rpa",
  "aluguel_iptu",
  "conservacao_predial_e_manutencao_maquinas_e_moveis",
  "locacao_de_maquinas_e_equipamentos",
  "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
  "energia_eletrica_agua_e_esgoto",
  "materiais_de_limpeza",
  "materiais_de_escritorio",
  "despesas_com_viagens",
  "corporativo_bu",
  "rateio_corporativo",
  "demais_impostos_e_taxas",
  "demais_custos_e_despesas",
  "total_custos_e_despesas_fixas",
  "despesas_com_marketing",
  "pcld",
  "despesas_bancarias",
  "descontos_comerciais",
  "despesas_com_sinistro",
  "total_despesas_com_vendas",
];

// ── Driver / source-assumption rows (Phase 12K/12L/12N static source data) ──
interface DriverRow {
  id: string;
  label: string;
  values: Record<number, number>;
  source: string;
}

function revenueDriverValues(driverId: string): Record<number, number> {
  const record = DRE_REVENUE_DRIVER_SOURCE_DATA.records.find((r) => r.driverId === driverId);
  return (record?.annualValuesByYear as Record<number, number> | undefined) ?? {};
}

function constantAcrossYears(value: number): Record<number, number> {
  const out: Record<number, number> = {};
  for (const year of YEARS) out[year] = value;
  return out;
}

const DRIVER_ROWS: DriverRow[] = [
  {
    id: "percentual_desconto_medio",
    label: "% Desconto Médio (driver)",
    values: revenueDriverValues("percentual_desconto_medio"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (PnL row 222, Phase 12K)",
  },
  {
    id: "desconto_metodo",
    label: "Desconto Método (driver)",
    values: revenueDriverValues("desconto_metodo"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (Phase 12K)",
  },
  {
    id: "percentual_deducoes",
    label: "% Deduções (driver)",
    values: revenueDriverValues("percentual_deducoes"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (Phase 12K)",
  },
  {
    id: "adesao_upselling",
    label: "Adesão Upselling (driver)",
    values: revenueDriverValues("adesao_upselling"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (Phase 12K)",
  },
  {
    id: "ticket_medio_upselling",
    label: "Ticket Médio Upselling (driver)",
    values: revenueDriverValues("ticket_medio_upselling"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (Phase 12K)",
  },
  {
    id: "ticket_material",
    label: "Ticket Material (driver)",
    values: revenueDriverValues("ticket_material"),
    source: "DRE_REVENUE_DRIVER_SOURCE_DATA (Phase 12K)",
  },
  {
    id: "custo_material_digital_fator",
    label: "Custo Material Digital Fator (driver)",
    values: constantAcrossYears(DRE_COST_DRIVER_SOURCE_DATA.records[0].annualValuesByYear[2028]),
    source: "DRE_COST_DRIVER_SOURCE_DATA (PnL row 15, Phase 12L, constant)",
  },
  {
    id: "outras_receitas_base_per_learner_ratio",
    label: "Outras Receitas Base/Aluno (driver)",
    values: constantAcrossYears(DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER.sourceValues.basePerLearnerRatio),
    source: "DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER (PnL Y233/Y221, Phase 12N, constant)",
  },
];

// ── Formula-derived rows: Excel formulas mirroring dreEngine.ts arithmetic ──
type FormulaBuilder = (rowMap: Record<string, number>, col: number) => string;

function ref(rowMap: Record<string, number>, id: string, col: number): string {
  const row = rowMap[id];
  return XLSX.utils.encode_cell({ r: row - 1, c: col });
}

const FORMULA_ROWS: Record<string, FormulaBuilder> = {
  ticket_servico: (m, c) =>
    `IF(${ref(m, "numero_de_alunos", c)}=0,"",${ref(m, "receitas_com_ensino_regular", c)}/${ref(m, "numero_de_alunos", c)}/12)`,
  receitas_com_upselling: (m, c) =>
    `${ref(m, "adesao_upselling", c)}*${ref(m, "numero_de_alunos", c)}*${ref(m, "ticket_medio_upselling", c)}`,
  receita_de_ensino_bruta: (m, c) =>
    `${ref(m, "receitas_com_ensino_regular", c)}+${ref(m, "receitas_com_upselling", c)}`,
  bolsa_de_estudos: (m, c) =>
    `${ref(m, "receitas_com_ensino_regular", c)}*${ref(m, "percentual_desconto_medio", c)}`,
  receita_de_ensino_liquida: (m, c) =>
    `${ref(m, "receita_de_ensino_bruta", c)}+${ref(m, "bolsa_de_estudos", c)}`,
  descontos_metodo_de_assinatura: (m, c) =>
    `-${ref(m, "desconto_metodo", c)}*${ref(m, "receita_de_ensino_liquida", c)}`,
  receita_com_material_didatico: (m, c) =>
    `${ref(m, "numero_de_alunos", c)}*${ref(m, "ticket_material", c)}*12`,
  outras_receitas: (m, c) =>
    `${ref(m, "outras_receitas_base_per_learner_ratio", c)}*${ref(m, "numero_de_alunos", c)}`,
  receita_operacional_antes_das_deducoes: (m, c) =>
    [
      "receita_de_ensino_liquida",
      "descontos_metodo_de_assinatura",
      "receita_com_eventos",
      "receita_com_material_didatico",
      "outras_receitas",
    ]
      .map((id) => ref(m, id, c))
      .join("+"),
  deducoes: (m, c) =>
    `-${ref(m, "percentual_deducoes", c)}*${ref(m, "receita_operacional_antes_das_deducoes", c)}`,
  receita_operacional_liquida: (m, c) =>
    `${ref(m, "receita_operacional_antes_das_deducoes", c)}+${ref(m, "deducoes", c)}`,
  custo_de_material_digital: (m, c) =>
    `-${ref(m, "custo_material_digital_fator", c)}*${ref(m, "receita_com_material_didatico", c)}`,
  custo_da_mercadoria_vendida: (m, c) => `${ref(m, "custo_de_material_digital", c)}`,
  total_custo_direto: (m, c) =>
    ["fopag_direto_clt_pj", "eventos_seb", "certificacoes", "custos_com_alimentacao", "materiais_pedagogicos"]
      .map((id) => ref(m, id, c))
      .join("+"),
  margem_de_contribuicao: (m, c) =>
    ["receita_operacional_liquida", "custo_da_mercadoria_vendida", "total_custo_direto"]
      .map((id) => ref(m, id, c))
      .join("+"),
  total_folha_de_pagamento: (m, c) =>
    `${ref(m, "fopag_direto_clt_pj", c)}+${ref(m, "folha_de_pagamento", c)}`,
  total_custos_e_despesas_fixas: (m, c) =>
    [
      "folha_de_pagamento",
      "beneficios",
      "cursos_e_treinamentos",
      "servicos_de_limpeza_e_seguranca",
      "consultoria_e_honorarios",
      "despesas_juridicas",
      "rpa",
      "aluguel_iptu",
      "conservacao_predial_e_manutencao_maquinas_e_moveis",
      "locacao_de_maquinas_e_equipamentos",
      "tecnologia_telefone_internet_licencas_e_servicos_de_informacao",
      "energia_eletrica_agua_e_esgoto",
      "materiais_de_limpeza",
      "materiais_de_escritorio",
      "despesas_com_viagens",
      "corporativo_bu",
      "rateio_corporativo",
      "demais_impostos_e_taxas",
      "demais_custos_e_despesas",
    ]
      .map((id) => ref(m, id, c))
      .join("+"),
  total_despesas_com_vendas: (m, c) =>
    ["despesas_com_marketing", "pcld", "despesas_bancarias", "descontos_comerciais", "despesas_com_sinistro"]
      .map((id) => ref(m, id, c))
      .join("+"),
  ebitda: (m, c) =>
    ["margem_de_contribuicao", "total_custos_e_despesas_fixas", "total_despesas_com_vendas"]
      .map((id) => ref(m, id, c))
      .join("+"),
  percentual_ebitda: (m, c) =>
    `IF(${ref(m, "receita_operacional_liquida", c)}=0,"",${ref(m, "ebitda", c)}/${ref(m, "receita_operacional_liquida", c)})`,
};

function classifyRowType(fieldId: string, lineMeta: DreLineItemRecord | undefined): string {
  if (FORMULA_ROWS[fieldId]) return "formula-derived";
  if (fieldId === "percentual_ebitda") return "percentage";
  if (lineMeta?.subtotalRole === "subtotal_or_total") return "subtotal";
  if (lineMeta?.subtotalRole === "memo_only") return "diagnostic";
  return "engine-derived";
}

function cellValue(value: number | string | null): number | string {
  if (value === null) return "";
  return value;
}

const DRE_DETAIL_BASE_COLS = 5; // A: Line ID, B: Display Label, C: Section, D: Row Type, E: Formula/Source
function yearCol(yearIndex: number): number {
  return DRE_DETAIL_BASE_COLS + yearIndex;
}

// ── Role classification from roleSourceType (Phase 15R.3) ────────────────────
function classifyFopagRole(roleSourceType: string): string {
  if (
    roleSourceType === "ey_teaching_lead" ||
    roleSourceType === "ls_teaching_lead" ||
    roleSourceType === "ms_teaching_lead" ||
    roleSourceType === "hs_teaching_lead"
  ) return "Teaching";
  if (roleSourceType === "ey_learning_assistant" || roleSourceType === "ls_learning_assistant") return "Teaching-Support (Assistant)";
  if (roleSourceType === "ey_learning_monitor") return "Teaching-Support (Monitor)";
  if (roleSourceType === "baseline_leadership") return "Leadership";
  if (roleSourceType === "baseline_backoffice") return "Backoffice";
  if (roleSourceType === "baseline_specialist") return "Specialist";
  if (roleSourceType === "extension_new_role" || roleSourceType === "extension_alias") return "Extension";
  return "source-unclassified";
}

// ── Sheet 1: README ──────────────────────────────────────────────────────────
function buildReadmeSheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const rows: (string | number)[][] = [
    ["Rio Strategic Org Design — DRE Scenario Export"],
    ["Export timestamp", vm.exportedAt.toISOString()],
    ["Selected scenario", scenarioKey(vm.selections)],
    ["Projection years", `${YEARS[0]}–${YEARS[YEARS.length - 1]} (${YEARS.length} years)`],
    [],
    ["Important: workbook learner counts are not used."],
    [
      "All enrollment figures (numero_de_alunos) and all DRE/payroll values in this " +
        "workbook are taken directly from dreOutput.byYear, the unified scenario result " +
        "produced by calculateDre() via useDreScenarioSimulator(). No values are " +
        "recalculated independently in this export.",
    ],
    [],
    ["Excluded from this workbook (Phase 14B scope):"],
    ["- Cash-flow"],
    ["- CAPEX bridge"],
    ["- DCF"],
    ["- NPV / VPL"],
    ["- Payback"],
    ["- Discounted payback"],
    ["- Break-even investment recovery"],
    ["- Tier"],
    [],
    ["Scenario ratification status", WORKING_SCENARIO_RATIFICATION_STATUS],
    [],
    ["Tabs in this workbook:"],
    ["1. README"],
    ["2. Scenario Inputs"],
    ["3. DRE Summary"],
    ["4. DRE Detail"],
    ["5. DRE Cost Lines"],
    ["6. Enrollment"],
    ["7. Tuition Revenue"],
    ["8. Org Design Roles"],
    ["9. Payroll FOPAG"],
    ["10. Org Design Sensitivity"],
    ["11. Scenario Sensitivity Matrix"],
    ["12. Formula Audit"],
    ["13. Raw Engine Output"],
    ["14. Payroll Comparison"],
    ["15. Payroll Detail - Minimum"],
    ["16. Payroll Detail - Balanced"],
    ["17. Payroll Detail - Premium"],
    ["18. Payroll Delta Analysis"],
    ["19. DRE Payroll Bridge"],
    ["20. FOPAG Headcount Plan"],
    ["21. FOPAG Role Audit"],
    ["22. FOPAG Payroll Projection"],
    [],
    ["Three-version payroll export (Phase 15R.1):"],
    ["The main DRE sheets (1–13) reflect the selected scenario."],
    ["The payroll comparison holds opening package, occupancy, tuition, CAPEX, and other levers constant."],
    ["Only org design option changes across Minimum, Balanced, and Premium versions."],
    ["Payroll is generated from the app model (calculateDre / calculateFopag), not manually typed into Excel."],
    ["DRE cost rows (fopag_direto_clt_pj, folha_de_pagamento, beneficios) use negative sign convention."],
    ["Payroll trace sheets (14–19) show payroll costs as positive values."],
    ["Payroll detail is role-level (from fopagOutput.records, one row per roleId × year)."],
    ["Headcount (HC) = sum of headcountOrFte for active (non-audit) records."],
    ["fopagEngine payroll is tuition-independent: Phase 15Q tuition/discount changes cannot affect payroll totals."],
    ["Division/Area is not available in fopagOutput.records and is omitted from Payroll Detail sheets."],
    [],
    ["Full FOPAG / Folha Direta support tabs (Phase 15R.3):"],
    [
      "The DRE workbook includes full FOPAG / Folha Direta support tabs. These tabs cover all model-backed " +
        "payroll-driving roles, including teaching, leadership, backoffice, specialists, assistants, monitors, " +
        "counselors, principals, and org-design extension roles. They are not limited to non-teaching headcount.",
    ],
    [
      "External service contracts are not included in FOPAG/Folha Direta. They remain separate DRE fixed assumptions.",
    ],
    [
      "These tabs are generated from the app model (calculateDre / calculateFopag). " +
        "They are not copied from the BP workbook and they are not manually typed Excel formulas.",
    ],
    [
      "Payroll sheets use positive cost values. DRE rows may preserve the DRE negative cost sign convention. " +
        "The DRE Payroll Bridge reconciles these conventions.",
    ],
    ["FOPAG Headcount Plan — consolidated headcount/FTE for all roles across all three org design versions."],
    ["FOPAG Role Audit — role inclusion and source completeness audit across all three org design versions."],
    ["FOPAG Payroll Projection — consolidated full payroll projection across all three org design versions."],
  ];
  return XLSX.utils.aoa_to_sheet(rows);
}

function scenarioKey(selections: DreScenarioSimulatorSelections): string {
  return `${selections.openingPackageId} / ${selections.occupancyScenarioId} / ${selections.tuitionScenarioId} / ${selections.orgDesignOptionId}`;
}

// ── Sheet 2: Scenario Inputs ─────────────────────────────────────────────────
function buildScenarioInputsSheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const { selections } = vm;
  const executiveScenarioId = EXECUTIVE_ORG_SCENARIO_BY_ORG_DESIGN_OPTION[selections.orgDesignOptionId];
  const executiveScenario = EXECUTIVE_ORG_SCENARIOS.find((s) => s.id === executiveScenarioId);

  const rows: (string | number)[][] = [
    ["Field", "Value", "Display Label"],
    ["openingPackageId", selections.openingPackageId, selections.openingPackageId],
    [
      "occupancyScenarioId",
      selections.occupancyScenarioId,
      OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId,
    ],
    [
      "tuitionScenarioId",
      selections.tuitionScenarioId,
      TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId,
    ],
    [
      "orgDesignOptionId",
      selections.orgDesignOptionId,
      ORG_DESIGN_OPTION_LABELS[selections.orgDesignOptionId] ?? selections.orgDesignOptionId,
    ],
    [],
    ["Mapped Executive Org Design scenario", executiveScenario?.label ?? executiveScenarioId],
    ["Executive Org Design posture/model", executiveScenario?.posture ?? "—"],
    [],
    [
      "Note",
      "This scenario is user-selected within the DRE Scenario Simulator. It is not " +
        "canonical or board-approved. The default selections shown in the simulator " +
        "(t1_g3 / intermediário / BP1 / Balanced Experience) are the Phase 13F working " +
        "scenario — a technical validation fixture, not a recommendation.",
    ],
    [],
    ["Default (Phase 13F working scenario) selections for reference:"],
    ["openingPackageId (default)", vm.defaultSelections.openingPackageId],
    ["occupancyScenarioId (default)", vm.defaultSelections.occupancyScenarioId],
    ["tuitionScenarioId (default)", vm.defaultSelections.tuitionScenarioId],
    ["orgDesignOptionId (default)", vm.defaultSelections.orgDesignOptionId],
  ];
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 4: DRE Detail (built first so other sheets can reference it) ──────
function buildDreDetailSheet(dreOutput: DreEngineOutput): { sheet: XLSX.WorkSheet; rowMap: Record<string, number> } {
  const header = ["Line ID", "Display Label", "Section", "Row Type", "Formula / Source", ...YEARS.map(String)];
  const rows: (string | number)[][] = [header];
  const rowMap: Record<string, number> = {};
  let currentRow = 2; // 1-indexed; row 1 is the header

  for (const driver of DRIVER_ROWS) {
    rowMap[driver.id] = currentRow;
    rows.push([
      driver.id,
      driver.label,
      "drivers_assumptions",
      "engine-derived",
      driver.source,
      ...YEARS.map((y) => driver.values[y] ?? 0),
    ]);
    currentRow++;
  }

  for (const fieldId of DRE_FIELDS_ORDER) {
    rowMap[fieldId] = currentRow;
    const lineMeta = DRE_LINE_ITEM_MAP.find((l) => l.dreLineId === fieldId);
    const rowType = classifyRowType(fieldId, lineMeta);
    const formulaText = FORMULA_ROWS[fieldId]
      ? "in-workbook Excel formula (see Formula Audit tab)"
      : (lineMeta?.formula ?? "engine value (calculateDre)");
    rows.push([
      fieldId,
      lineMeta?.displayLabelPt ?? fieldId,
      lineMeta?.section ?? "unknown",
      rowType,
      formulaText,
      ...YEARS.map((y) => cellValue(dreOutput.byYear[y][fieldId] as number | null)),
    ]);
    currentRow++;
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  for (const fieldId of Object.keys(FORMULA_ROWS)) {
    const rowNum = rowMap[fieldId];
    YEARS.forEach((_year, yearIndex) => {
      const c = yearCol(yearIndex);
      const cellRef = XLSX.utils.encode_cell({ r: rowNum - 1, c });
      const cell = sheet[cellRef];
      if (cell) {
        cell.f = FORMULA_ROWS[fieldId](rowMap, c);
      }
    });
  }

  return { sheet, rowMap };
}

// ── Sheet 3: DRE Summary (cross-sheet references into DRE Detail) ───────────
const DRE_SUMMARY_FIELDS: { id: keyof DreYearResult; label: string }[] = [
  { id: "numero_de_alunos", label: "Número de Alunos" },
  { id: "receitas_com_ensino_regular", label: "Receitas com Ensino Regular" },
  { id: "receita_operacional_liquida", label: "Receita Operacional Líquida" },
  { id: "margem_de_contribuicao", label: "Margem de Contribuição" },
  { id: "ebitda", label: "EBITDA" },
  { id: "percentual_ebitda", label: "% EBITDA" },
];

function buildCrossSheetReferenceSheet(
  fields: { id: keyof DreYearResult; label: string }[],
  dreOutput: DreEngineOutput,
  rowMap: Record<string, number>,
): XLSX.WorkSheet {
  const header = ["Metric", ...YEARS.map(String)];
  const rows: (string | number)[][] = [header];
  for (const field of fields) {
    rows.push([field.label, ...YEARS.map(() => 0)]);
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);

  fields.forEach((field, idx) => {
    const rowNum = idx + 2;
    YEARS.forEach((year, yearIndex) => {
      const c = yearCol(yearIndex) - DRE_DETAIL_BASE_COLS + 1; // column 1 onward in this sheet
      const cellRef = XLSX.utils.encode_cell({ r: rowNum - 1, c });
      const detailRow = rowMap[field.id];
      const detailCol = yearCol(yearIndex);
      const detailRef = `'DRE Detail'!${XLSX.utils.encode_cell({ r: detailRow - 1, c: detailCol })}`;
      const value = dreOutput.byYear[year][field.id] as number | null;
      sheet[cellRef] = { t: "n", v: value ?? 0, f: detailRef };
    });
  });

  return sheet;
}

// ── Sheet 6: Enrollment ───────────────────────────────────────────────────────
function buildEnrollmentSheet(
  vm: DreScenarioWorkbookViewModel,
  rowMap: Record<string, number>,
): XLSX.WorkSheet {
  const { selections, dreOutput } = vm;
  const rows: (string | number)[][] = [
    ["Opening package (openingPackageId)", selections.openingPackageId],
    [
      "Occupancy scenario (occupancyScenarioId)",
      OCCUPANCY_LABELS[selections.occupancyScenarioId] ?? selections.occupancyScenarioId,
    ],
    [],
    [
      "Note",
      "Grade-level enrollment (gradeId-level grainRecords) is internal to " +
        "calculateReceita()/calculateDre() and is not exposed on DreEngineOutput. Per the " +
        "Phase 14A.1 deterministic-calculation rule, it is reported here as unavailable " +
        "rather than recomputed via a separate calculateReceita() call.",
    ],
    [],
    ["Workbook learner counts are not used — figures below reference dreOutput.byYear[year].numero_de_alunos."],
    [],
    ["Year", "Número de Alunos (numero_de_alunos)"],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const headerRowIndex = rows.length - 1; // 0-based row of the "Year" header
  YEARS.forEach((year, idx) => {
    const r = headerRowIndex + 1 + idx;
    sheet[XLSX.utils.encode_cell({ r, c: 0 })] = { t: "n", v: year };
    const detailRow = rowMap["numero_de_alunos"];
    const detailCol = yearCol(idx);
    const detailRef = `'DRE Detail'!${XLSX.utils.encode_cell({ r: detailRow - 1, c: detailCol })}`;
    sheet[XLSX.utils.encode_cell({ r, c: 1 })] = {
      t: "n",
      v: dreOutput.byYear[year].numero_de_alunos,
      f: detailRef,
    };
  });
  const ref = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: headerRowIndex + YEARS.length, c: 1 } });
  sheet["!ref"] = ref;
  return sheet;
}

// ── Sheet 7: Tuition Revenue ─────────────────────────────────────────────────
function buildTuitionRevenueSheet(
  vm: DreScenarioWorkbookViewModel,
  rowMap: Record<string, number>,
): XLSX.WorkSheet {
  const { selections } = vm;
  const rows: (string | number)[][] = [
    ["tuitionScenarioId", selections.tuitionScenarioId],
    ["Display label", TUITION_LABELS[selections.tuitionScenarioId] ?? selections.tuitionScenarioId],
    [],
    [
      "Source tuition values mapping",
      "TUITION_SOURCE_DATA.scenarioIdMappingNote (tuitionSourceData.ts) states that the " +
        "intake scenario IDs (bp_scenario_1/2/3) do not yet map to the calculation-layer " +
        "TuitionScenarioId values (bp1_division_differentiated / bp2_ey_ls_unified / " +
        "bp3_ey_to_ms_unified) used here. No mapped source-tuition table is reported to " +
        "avoid fabricating a mapping that has not been finance-approved.",
    ],
    [],
    [
      "Discount / reajuste assumptions used by calculateDre() for this scenario " +
        "(see DRE Detail tab driver rows; values are the same regardless of tuitionScenarioId — " +
        "they are not scenario-differentiated drivers in the current model):",
    ],
    [],
    ["Driver", ...YEARS.map(String)],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const headerRowIndex = rows.length - 1;

  const driverIds = ["percentual_desconto_medio", "desconto_metodo"];
  driverIds.forEach((driverId, di) => {
    const r = headerRowIndex + 1 + di;
    const driver = DRIVER_ROWS.find((d) => d.id === driverId)!;
    sheet[XLSX.utils.encode_cell({ r, c: 0 })] = { t: "s", v: driver.label };
    YEARS.forEach((year, yearIndex) => {
      const c = 1 + yearIndex;
      const detailRow = rowMap[driverId];
      const detailCol = yearCol(yearIndex);
      const detailRef = `'DRE Detail'!${XLSX.utils.encode_cell({ r: detailRow - 1, c: detailCol })}`;
      sheet[XLSX.utils.encode_cell({ r, c })] = { t: "n", v: driver.values[year] ?? 0, f: detailRef };
    });
  });

  // Revenue outputs by year
  const revenueRowsStart = headerRowIndex + 1 + driverIds.length + 2;
  const revenueFields: { id: keyof DreYearResult; label: string }[] = [
    { id: "receitas_com_ensino_regular", label: "Receitas com Ensino Regular" },
    { id: "receita_de_ensino_bruta", label: "Receita de Ensino Bruta" },
    { id: "bolsa_de_estudos", label: "Bolsa de Estudos" },
    { id: "receita_de_ensino_liquida", label: "Receita de Ensino Líquida" },
    { id: "descontos_metodo_de_assinatura", label: "Descontos Método de Assinatura" },
    { id: "ticket_servico", label: "Ticket Serviço" },
  ];
  sheet[XLSX.utils.encode_cell({ r: revenueRowsStart - 1, c: 0 })] = { t: "s", v: "Revenue outputs by year" };
  sheet[XLSX.utils.encode_cell({ r: revenueRowsStart, c: 0 })] = { t: "s", v: "Metric" };
  YEARS.forEach((year, yearIndex) => {
    sheet[XLSX.utils.encode_cell({ r: revenueRowsStart, c: 1 + yearIndex })] = { t: "s", v: String(year) };
  });
  revenueFields.forEach((field, fi) => {
    const r = revenueRowsStart + 1 + fi;
    sheet[XLSX.utils.encode_cell({ r, c: 0 })] = { t: "s", v: field.label };
    YEARS.forEach((year, yearIndex) => {
      const c = 1 + yearIndex;
      const detailRow = rowMap[field.id];
      const detailCol = yearCol(yearIndex);
      const detailRef = `'DRE Detail'!${XLSX.utils.encode_cell({ r: detailRow - 1, c: detailCol })}`;
      const value = vm.dreOutput.byYear[year][field.id] as number | null;
      sheet[XLSX.utils.encode_cell({ r, c })] = { t: "n", v: value ?? 0, f: detailRef };
    });
  });

  const lastRow = revenueRowsStart + revenueFields.length;
  sheet["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: YEARS.length } });
  return sheet;
}

// ── Sheet 8: Org Design Roles ────────────────────────────────────────────────
function buildOrgDesignRolesSheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const { fopagOutput, selections } = vm;

  const fopagByRoleId = new Map<string, Map<number, (typeof fopagOutput.records)[number]>>();
  const fopagByPayrollRoleId = new Map<string, Map<number, (typeof fopagOutput.records)[number]>>();
  for (const record of fopagOutput.records) {
    if (!fopagByRoleId.has(record.roleId)) fopagByRoleId.set(record.roleId, new Map());
    fopagByRoleId.get(record.roleId)!.set(record.year, record);
    if (record.payrollRoleId) {
      if (!fopagByPayrollRoleId.has(record.payrollRoleId)) {
        fopagByPayrollRoleId.set(record.payrollRoleId, new Map());
      }
      fopagByPayrollRoleId.get(record.payrollRoleId)!.set(record.year, record);
    }
  }

  const META_HEADERS = [
    "Source Role ID",
    "Payroll Role ID",
    "Role Name",
    "Role Source Type (category)",
    "Active in Minimum Experience",
    "Active in Balanced Experience",
    "Active in Premium Experience",
    "Active in Selected Scenario",
    "Mapped Executive Org Design Scenario(s)",
    "Role Inclusion Status",
    "Activation Year Source",
    "Headcount Source",
    "Cost Source",
    "Allocation Model Source",
    "Mapping Status",
    "Needs Review",
    "Source Notes",
  ];

  const metricBlocks = [
    { label: "Headcount/FTE", key: "headcountOrFte" as const },
    { label: "Annual Salary+Labor Charges (After Growth)", key: "grossLaborAnnualAfterGrowth" as const },
    { label: "Annual Benefits (After Growth)", key: "benefitsAnnualAfterGrowth" as const },
    { label: "Annual Total Payroll Cost (After Growth)", key: "totalAnnualPayrollAfterGrowth" as const },
  ];

  const header: string[] = [...META_HEADERS];
  for (const block of metricBlocks) {
    for (const year of YEARS) header.push(`${block.label} ${year}`);
  }

  const totalRoleRows = ORG_DESIGN_PAYROLL_ACTIVATION.records.length;
  const baselineRoleRows = ORG_DESIGN_PAYROLL_ACTIVATION.records.filter(
    (r) => r.roleSourceType === "baseline_role",
  ).length;
  const extensionRoleRows = totalRoleRows - baselineRoleRows;

  const rows: (string | number | boolean)[][] = [
    [
      `Note: ${totalRoleRows} rows = ${baselineRoleRows} baseline_role + ${extensionRoleRows} extension/incremental ` +
        `records from ORG_DESIGN_PAYROLL_ACTIVATION.records. One row per source role considered for this org ` +
        `design — not scenario-, year-, or payroll-record-expanded.`,
    ],
    header,
  ];

  for (const activation of ORG_DESIGN_PAYROLL_ACTIVATION.records) {
    const matchByRole = fopagByRoleId.get(activation.sourceRoleId);
    const matchByPayrollRole = activation.payrollRoleId
      ? fopagByPayrollRoleId.get(activation.payrollRoleId)
      : undefined;
    const fopagByYear = matchByRole ?? matchByPayrollRole;

    const mappedExecutive = (["minimum_experience", "balanced_experience", "premium_experience"] as const)
      .filter((opt) => activation.activeIn.includes(opt))
      .map((opt) => executiveScenarioLabel(opt))
      .join("; ");

    const row: (string | number | boolean)[] = [
      activation.sourceRoleId,
      activation.payrollRoleId ?? "—",
      activation.roleName,
      activation.roleSourceType,
      activation.activeIn.includes("minimum_experience"),
      activation.activeIn.includes("balanced_experience"),
      activation.activeIn.includes("premium_experience"),
      activation.activeIn.includes(selections.orgDesignOptionId),
      mappedExecutive || "—",
      activation.roleInclusionStatus,
      activation.activationYearSource,
      activation.headcountSource,
      activation.costSource,
      activation.allocationModelSource,
      activation.mappingStatus,
      activation.needsReview,
      activation.sourceNotes,
    ];

    for (const block of metricBlocks) {
      for (const year of YEARS) {
        const fopagRecord = fopagByYear?.get(year);
        row.push(fopagRecord ? fopagRecord[block.key] : "n/a (no FOPAG row matched for this scenario)");
      }
    }

    rows.push(row);
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 9: Payroll FOPAG ────────────────────────────────────────────────────
function buildPayrollFopagSheet(
  vm: DreScenarioWorkbookViewModel,
  rowMap: Record<string, number>,
): XLSX.WorkSheet {
  const { fopagOutput, payrollReconciliation } = vm;
  const rows: (string | number | boolean)[][] = [];

  rows.push(["FOPAG / Payroll Trace by Year and Role Source Type"]);
  rows.push([
    "Year",
    "Role Source Type",
    "FOPAG Direto",
    "Folha Direta",
    "Benefits",
    "Total Payroll",
    "Record Count",
    "Audit Row Count",
  ]);
  const totalRowByYear: Record<number, number> = {};
  for (const yt of fopagOutput.yearTotals) {
    for (const entry of yt.byRoleSourceType) {
      rows.push([yt.year, entry.roleSourceType, entry.fopagDireto, entry.folhaDireta, entry.benefits, entry.totalPayroll, "", ""]);
    }
    totalRowByYear[yt.year] = rows.length + 1; // 1-indexed row number of the TOTAL row, after push below
    rows.push([yt.year, "TOTAL", yt.fopagDireto, yt.folhaDireta, yt.benefits, yt.totalPayroll, yt.recordCount, yt.auditRowCount]);
  }

  rows.push([]);
  rows.push(["Diagnostics"]);
  rows.push(["Year", "Diagnostic Type", "Is Blocking", "Role ID", "Role Name", "Message"]);
  for (const diag of fopagOutput.diagnostics) {
    rows.push([diag.year ?? "", diag.diagnosticType, diag.isBlocking, diag.roleId, diag.roleName, diag.message]);
  }

  rows.push([]);
  rows.push(["Reconciliation: FOPAG trace vs. DRE payroll rows (Phase 14A.1)"]);
  rows.push(["isReconciled", payrollReconciliation.isReconciled]);
  rows.push(["Mismatch count", payrollReconciliation.mismatches.length]);
  if (payrollReconciliation.mismatches.length > 0) {
    rows.push(["Year", "Field", "DRE Value", "FOPAG Value"]);
    for (const mismatch of payrollReconciliation.mismatches) {
      rows.push([mismatch.year, mismatch.field, mismatch.dreValue, mismatch.fopagValue]);
    }
  }
  rows.push([]);
  rows.push(["Reconciliation formulas (per year)"]);
  const reconHeaderRow = rows.length;
  rows.push([
    "Year",
    "DRE fopag_direto_clt_pj",
    "Expected (-FOPAG fopagDireto)",
    "Status",
    "DRE folha_de_pagamento",
    "Expected (-FOPAG folhaDireta)",
    "Status",
    "DRE beneficios",
    "Expected (-FOPAG benefits)",
    "Status",
  ]);

  const sheet = XLSX.utils.aoa_to_sheet(rows);

  const RECON_FIELDS: { dreId: string; fopagKey: "fopagDireto" | "folhaDireta" | "benefits"; offset: number }[] = [
    { dreId: "fopag_direto_clt_pj", fopagKey: "fopagDireto", offset: 0 },
    { dreId: "folha_de_pagamento", fopagKey: "folhaDireta", offset: 3 },
    { dreId: "beneficios", fopagKey: "benefits", offset: 6 },
  ];
  const FOPAG_TOTAL_VALUE_COL: Record<"fopagDireto" | "folhaDireta" | "benefits", number> = {
    fopagDireto: 2,
    folhaDireta: 3,
    benefits: 4,
  };

  YEARS.forEach((year, idx) => {
    const r = reconHeaderRow + 1 + idx;
    sheet[XLSX.utils.encode_cell({ r, c: 0 })] = { t: "n", v: year };
    const totalRowNum = totalRowByYear[year];
    for (const field of RECON_FIELDS) {
      const yearIndex = YEARS.indexOf(year);
      const detailRow = rowMap[field.dreId];
      const detailCol = yearCol(yearIndex);
      const dreRef = `'DRE Detail'!${XLSX.utils.encode_cell({ r: detailRow - 1, c: detailCol })}`;
      const fopagCol = FOPAG_TOTAL_VALUE_COL[field.fopagKey];
      const fopagRef = XLSX.utils.encode_cell({ r: totalRowNum - 1, c: fopagCol });

      const dreCellRef = XLSX.utils.encode_cell({ r, c: 1 + field.offset });
      const expectedCellRef = XLSX.utils.encode_cell({ r, c: 2 + field.offset });
      const statusCellRef = XLSX.utils.encode_cell({ r, c: 3 + field.offset });

      const dreValue = vm.dreOutput.byYear[year][field.dreId as keyof DreYearResult] as number;
      const fopagYt = fopagOutput.yearTotals.find((yt) => yt.year === year);
      const expectedValue = -((fopagYt?.[field.fopagKey] as number | undefined) ?? 0);

      sheet[dreCellRef] = { t: "n", v: dreValue, f: dreRef };
      sheet[expectedCellRef] = { t: "n", v: expectedValue, f: `-${fopagRef}` };
      sheet[statusCellRef] = {
        t: "s",
        v: Math.abs(dreValue - expectedValue) < 1e-6 ? "OK" : "MISMATCH",
        f: `IF(ABS(${dreCellRef}-${expectedCellRef})<0.000001,"OK","MISMATCH")`,
      };
    }
  });

  const lastRow = reconHeaderRow + YEARS.length;
  const existingRef = sheet["!ref"] ? XLSX.utils.decode_range(sheet["!ref"]) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
  sheet["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: Math.max(lastRow, existingRef.e.r), c: Math.max(9, existingRef.e.c) },
  });

  return sheet;
}

// ── Sheet 10: Org Design Sensitivity ─────────────────────────────────────────
function buildOrgDesignSensitivitySheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const { orgDesignSensitivity } = vm;
  const header = [
    "Org Design Option",
    "Selected",
    `EBITDA (${YEARS[YEARS.length - 1]})`,
    `% EBITDA (${YEARS[YEARS.length - 1]})`,
    `Payroll/FOPAG Total (${YEARS[YEARS.length - 1]})`,
    `Delta vs Selected (EBITDA ${YEARS[YEARS.length - 1]})`,
  ];
  const rows: (string | number | boolean)[][] = [header];
  const selectedIdx = orgDesignSensitivity.findIndex((r) => r.isSelected);
  for (const row of orgDesignSensitivity) {
    rows.push([
      ORG_DESIGN_OPTION_LABELS[row.orgDesignOptionId] ?? row.orgDesignOptionId,
      row.isSelected,
      row.ebitda2047,
      row.percentualEbitda2047 ?? "",
      row.payrollTotal2047,
      0,
    ]);
  }
  rows.push([]);
  rows.push(["Note: Year-by-year payroll comparison across Minimum, Balanced, and Premium is available in:"]);
  rows.push(["  • Payroll Comparison — year-by-year totals for all three org design versions"]);
  rows.push(["  • Payroll Detail - Minimum — role-level detail for minimum_experience"]);
  rows.push(["  • Payroll Detail - Balanced — role-level detail for balanced_experience"]);
  rows.push(["  • Payroll Detail - Premium — role-level detail for premium_experience"]);
  rows.push(["  • Payroll Delta Analysis — delta comparisons (Balanced-Minimum, Premium-Balanced, Premium-Minimum)"]);
  rows.push(["  • DRE Payroll Bridge — DRE reconciliation for all three org design versions"]);
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  if (selectedIdx >= 0) {
    const selectedRowNum = selectedIdx + 2;
    orgDesignSensitivity.forEach((_row, idx) => {
      const r = idx + 1;
      const cellRef = XLSX.utils.encode_cell({ r, c: 5 });
      const ebitdaCellRef = XLSX.utils.encode_cell({ r, c: 2 });
      const selectedEbitdaRef = XLSX.utils.encode_cell({ r: selectedRowNum - 1, c: 2 });
      const value = orgDesignSensitivity[idx].ebitda2047 - orgDesignSensitivity[selectedIdx].ebitda2047;
      sheet[cellRef] = { t: "n", v: value, f: `${ebitdaCellRef}-${selectedEbitdaRef}` };
    });
  }
  return sheet;
}

// ── Sheet 11: Scenario Sensitivity Matrix ────────────────────────────────────
function buildScenarioSensitivityMatrixSheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const { selections, orgDesignSensitivity } = vm;
  const lastYear = YEARS[YEARS.length - 1];
  const rows: (string | number | boolean)[][] = [
    [
      "Scope note",
      "This is a partial sensitivity matrix: it varies only the org-design option, holding " +
        "opening package, occupancy scenario, and tuition scenario fixed at the currently " +
        "selected values (org-design options do not change numero_de_alunos or " +
        "receita_operacional_liquida — only payroll/EBITDA). It is not the full " +
        "108-combination (opening x occupancy x tuition x org-design) matrix; that is " +
        "deferred to Phase 14C or later.",
    ],
    [],
    [
      "openingPackageId",
      "occupancyScenarioId",
      "tuitionScenarioId",
      "orgDesignOptionId",
      "Selected (current scenario)",
      `${lastYear} Learners`,
      `${lastYear} Receita Operacional Líquida`,
      `${lastYear} EBITDA`,
      `${lastYear} % EBITDA`,
      "EBITDA-Positive Year (DRE EBITDA > 0)",
    ],
  ];
  for (const row of orgDesignSensitivity) {
    rows.push([
      selections.openingPackageId,
      selections.occupancyScenarioId,
      selections.tuitionScenarioId,
      row.orgDesignOptionId,
      row.isSelected,
      row.numeroDeAlunos2047,
      row.receitaOperacionalLiquida2047,
      row.ebitda2047,
      row.percentualEbitda2047 ?? "",
      row.ebitdaPositiveYear ?? "none in projection horizon",
    ]);
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 12: Formula Audit ───────────────────────────────────────────────────
function buildFormulaAuditSheet(
  vm: DreScenarioWorkbookViewModel,
  rowMap: Record<string, number>,
): XLSX.WorkSheet {
  const rows: (string | number | boolean)[][] = [];
  rows.push(["Formula-derived DRE rows (in-workbook Excel formulas, see DRE Detail tab)"]);
  rows.push(["Line ID", "Display Label", "DRE Detail Row", "Excel Formula (column F = 2028)"]);
  for (const fieldId of Object.keys(FORMULA_ROWS)) {
    const lineMeta = DRE_LINE_ITEM_MAP.find((l) => l.dreLineId === fieldId);
    rows.push([
      fieldId,
      lineMeta?.displayLabelPt ?? fieldId,
      rowMap[fieldId],
      "=" + FORMULA_ROWS[fieldId](rowMap, yearCol(0)),
    ]);
  }

  rows.push([]);
  rows.push(["Engine-derived rows (exported as values, not formulas)"]);
  rows.push(["Line ID", "Display Label", "DRE Detail Row", "Source"]);
  for (const driver of DRIVER_ROWS) {
    rows.push([driver.id, driver.label, rowMap[driver.id], driver.source]);
  }
  for (const fieldId of DRE_FIELDS_ORDER) {
    if (FORMULA_ROWS[fieldId]) continue;
    const lineMeta = DRE_LINE_ITEM_MAP.find((l) => l.dreLineId === fieldId);
    rows.push([
      fieldId,
      lineMeta?.displayLabelPt ?? fieldId,
      rowMap[fieldId],
      lineMeta?.sourceType ?? "calculateDre() engine output",
    ]);
  }

  rows.push([]);
  rows.push(["FOPAG / DRE payroll reconciliation (Phase 14A.1)"]);
  rows.push(["isReconciled", vm.payrollReconciliation.isReconciled]);
  rows.push(["Mismatch count", vm.payrollReconciliation.mismatches.length]);
  rows.push([
    "Note",
    "Reconciliation verifies fopag_direto_clt_pj = -fopagOutput.yearTotals.fopagDireto, " +
      "folha_de_pagamento = -fopagOutput.yearTotals.folhaDireta, and beneficios = " +
      "-fopagOutput.yearTotals.benefits for every projection year. See Payroll FOPAG tab " +
      "for the per-year reconciliation formulas.",
  ]);

  rows.push([]);
  rows.push([
    "Note",
    "Formula parity between this DRE engine and the Finance PnL spreadsheet was " +
      "confirmed upstream (Phase 13D dreFormulaParity / dreEbitdaBacktest). This workbook " +
      "is generated from the simulator's calculateDre() output for the currently " +
      "selected scenario and re-expresses formula-derived rows as in-workbook Excel " +
      "formulas for audit purposes; it does not re-run that upstream parity check.",
  ]);

  rows.push([]);
  rows.push(["Three-version payroll comparison sources (Phase 15R.1)"]);
  rows.push(["Sheet", "Data Source", "Calculation Method"]);
  rows.push([
    "Payroll Comparison",
    "fopagOutput.yearTotals for minimum_experience, balanced_experience, premium_experience",
    "calculateFopag() called for each org design option; selected option reuses existing fopagOutput",
  ]);
  rows.push([
    "Payroll Detail - Minimum",
    "fopagOutput.records filtered to minimum_experience",
    "Role-level: allocationModel determines FOPAG Direto vs Folha Direta column split",
  ]);
  rows.push([
    "Payroll Detail - Balanced",
    "fopagOutput.records filtered to balanced_experience",
    "Role-level: allocationModel determines FOPAG Direto vs Folha Direta column split",
  ]);
  rows.push([
    "Payroll Detail - Premium",
    "fopagOutput.records filtered to premium_experience",
    "Role-level: allocationModel determines FOPAG Direto vs Folha Direta column split",
  ]);
  rows.push([
    "Payroll Delta Analysis",
    "fopagOutput.yearTotals for all three variants",
    "Arithmetic delta (B.totalPayroll - A.totalPayroll) by year, comparison, and dimension",
  ]);
  rows.push([
    "DRE Payroll Bridge",
    "dreOutput.byYear and fopagOutput.yearTotals for all three variants",
    "Variance = dreValue + fopagValue (DRE sign convention: negative; payroll trace: positive). OK when |variance| < 1e-6",
  ]);
  rows.push([]);
  rows.push([
    "Payroll note",
    "fopagEngine payroll is tuition-independent. Only orgDesignOptionId varies across the three runs. " +
      "openingPackageId, occupancyScenarioId, and tuitionScenarioId are held constant at the selected values.",
  ]);

  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 13: Raw Engine Output ───────────────────────────────────────────────
function buildRawEngineOutputSheet(vm: DreScenarioWorkbookViewModel): XLSX.WorkSheet {
  const { selections, dreOutput, fopagOutput, orgDesignSensitivity } = vm;
  const rows: (string | number | boolean)[][] = [];

  rows.push(["Selected DreEngineInput"]);
  rows.push(["openingPackageId", selections.openingPackageId]);
  rows.push(["occupancyScenarioId", selections.occupancyScenarioId]);
  rows.push(["tuitionScenarioId", selections.tuitionScenarioId]);
  rows.push(["orgDesignOptionId", selections.orgDesignOptionId]);
  rows.push([]);

  rows.push(["DreEngineOutput notes"]);
  rows.push(["outrasReceitasReajusteNote", dreOutput.outrasReceitasReajusteNote]);
  rows.push(["descontosMetodoFormulaNote", dreOutput.descontosMetodoFormulaNote]);
  rows.push([]);

  rows.push(["DreEngineOutput.byYear — flattened (see DRE Detail tab for full audit view)"]);
  rows.push(["Year", ...DRE_FIELDS_ORDER]);
  for (const year of YEARS) {
    const yearResult = dreOutput.byYear[year];
    rows.push([year, ...DRE_FIELDS_ORDER.map((id) => cellValue(yearResult[id] as number | null))]);
  }
  rows.push([]);

  rows.push(["FOPAG trace yearTotals"]);
  rows.push(["Year", "FOPAG Direto", "Folha Direta", "Benefits", "Total Payroll", "Record Count", "Audit Row Count"]);
  for (const yt of fopagOutput.yearTotals) {
    rows.push([yt.year, yt.fopagDireto, yt.folhaDireta, yt.benefits, yt.totalPayroll, yt.recordCount, yt.auditRowCount]);
  }
  rows.push([]);

  rows.push(["Org Design Sensitivity outputs used in this workbook"]);
  rows.push([
    "orgDesignOptionId",
    "isSelected",
    `numeroDeAlunos${YEARS[YEARS.length - 1]}`,
    `receitaOperacionalLiquida${YEARS[YEARS.length - 1]}`,
    `ebitda${YEARS[YEARS.length - 1]}`,
    `percentualEbitda${YEARS[YEARS.length - 1]}`,
    `payrollTotal${YEARS[YEARS.length - 1]}`,
    "ebitdaPositiveYear",
  ]);
  for (const row of orgDesignSensitivity) {
    rows.push([
      row.orgDesignOptionId,
      row.isSelected,
      row.numeroDeAlunos2047,
      row.receitaOperacionalLiquida2047,
      row.ebitda2047,
      row.percentualEbitda2047 ?? "",
      row.payrollTotal2047,
      row.ebitdaPositiveYear ?? "none in projection horizon",
    ]);
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Phase 15R.1: Three-version payroll sheets ─────────────────────────────────

function totalHcForYear(fopagOut: FopagEngineOutput, year: number): number {
  return fopagOut.records
    .filter((r) => r.year === year && !r.isAuditRow)
    .reduce((sum, r) => sum + r.headcountOrFte, 0);
}

// ── Sheet 14: Payroll Comparison ─────────────────────────────────────────────
function buildPayrollComparisonSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const header = [
    "Year",
    "Minimum FOPAG Direto",
    "Minimum Folha Direta",
    "Minimum Benefits",
    "Minimum Total Payroll",
    "Minimum HC",
    "Balanced FOPAG Direto",
    "Balanced Folha Direta",
    "Balanced Benefits",
    "Balanced Total Payroll",
    "Balanced HC",
    "Premium FOPAG Direto",
    "Premium Folha Direta",
    "Premium Benefits",
    "Premium Total Payroll",
    "Premium HC",
    "Balanced minus Minimum Total Payroll",
    "Premium minus Balanced Total Payroll",
    "Premium minus Minimum Total Payroll",
    "Balanced minus Minimum HC",
    "Premium minus Balanced HC",
    "Premium minus Minimum HC",
  ];
  const rows: (string | number)[][] = [header];
  const minYtMap = new Map(tv.minimum.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
  const balYtMap = new Map(tv.balanced.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
  const premYtMap = new Map(tv.premium.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));

  for (const year of YEARS) {
    const min = minYtMap.get(year)!;
    const bal = balYtMap.get(year)!;
    const prem = premYtMap.get(year)!;
    const minHc = totalHcForYear(tv.minimum.fopagOutput, year);
    const balHc = totalHcForYear(tv.balanced.fopagOutput, year);
    const premHc = totalHcForYear(tv.premium.fopagOutput, year);
    rows.push([
      year,
      min.fopagDireto, min.folhaDireta, min.benefits, min.totalPayroll, minHc,
      bal.fopagDireto, bal.folhaDireta, bal.benefits, bal.totalPayroll, balHc,
      prem.fopagDireto, prem.folhaDireta, prem.benefits, prem.totalPayroll, premHc,
      bal.totalPayroll - min.totalPayroll,
      prem.totalPayroll - bal.totalPayroll,
      prem.totalPayroll - min.totalPayroll,
      balHc - minHc,
      premHc - balHc,
      premHc - minHc,
    ]);
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheets 15-17: Payroll Detail (role-level) ────────────────────────────────
function buildPayrollDetailSheet(fopagOut: FopagEngineOutput, optionLabel: string): XLSX.WorkSheet {
  const header = [
    "Year",
    "Role ID",
    "Payroll Role ID",
    "Role Name",
    "Role Source Type",
    "Allocation Model",
    "Headcount/FTE",
    "FOPAG Direto",
    "Folha Direta",
    "Benefits",
    "Total Payroll",
    "Is Audit Row",
    "Source Notes",
  ];
  const noteRow = [`Payroll Detail — ${optionLabel} (role-level, source: fopagOutput.records)`];
  const rows: (string | number | boolean)[][] = [noteRow, header];

  const sorted = [...fopagOut.records].sort(
    (a, b) => a.year - b.year || a.roleId.localeCompare(b.roleId),
  );
  for (const rec of sorted) {
    const isAudit = rec.isAuditRow;
    const fopagDireto = !isAudit && rec.allocationModel === "FOPAG_DIRETO" ? rec.grossLaborAnnualAfterGrowth : 0;
    const folhaDireta = !isAudit && rec.allocationModel === "FOLHA_DIRETA" ? rec.grossLaborAnnualAfterGrowth : 0;
    const benefits = isAudit ? 0 : rec.benefitsAnnualAfterGrowth;
    const total = isAudit ? 0 : rec.totalAnnualPayrollAfterGrowth;
    rows.push([
      rec.year,
      rec.roleId,
      rec.payrollRoleId ?? "—",
      rec.roleName,
      rec.roleSourceType,
      rec.allocationModel,
      rec.headcountOrFte,
      fopagDireto,
      folhaDireta,
      benefits,
      total,
      isAudit,
      rec.sourceNotes,
    ]);
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 18: Payroll Delta Analysis ─────────────────────────────────────────
function buildPayrollDeltaAnalysisSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const header = [
    "Year",
    "Comparison",
    "Payroll Dimension",
    "A Value",
    "B Value",
    "Delta (B minus A)",
  ];
  const rows: (string | number)[][] = [header];
  type YtKey = "fopagDireto" | "folhaDireta" | "benefits" | "totalPayroll";
  const TOP_LEVEL_DIMS: { label: string; key: YtKey }[] = [
    { label: "FOPAG Direto", key: "fopagDireto" },
    { label: "Folha Direta", key: "folhaDireta" },
    { label: "Benefits", key: "benefits" },
    { label: "Total Payroll", key: "totalPayroll" },
  ];
  const COMPARISONS = [
    { label: "Balanced minus Minimum", aMap: new Map(tv.minimum.fopagOutput.yearTotals.map((yt) => [yt.year, yt])), bMap: new Map(tv.balanced.fopagOutput.yearTotals.map((yt) => [yt.year, yt])) },
    { label: "Premium minus Balanced", aMap: new Map(tv.balanced.fopagOutput.yearTotals.map((yt) => [yt.year, yt])), bMap: new Map(tv.premium.fopagOutput.yearTotals.map((yt) => [yt.year, yt])) },
    { label: "Premium minus Minimum", aMap: new Map(tv.minimum.fopagOutput.yearTotals.map((yt) => [yt.year, yt])), bMap: new Map(tv.premium.fopagOutput.yearTotals.map((yt) => [yt.year, yt])) },
  ];

  for (const year of YEARS) {
    for (const comp of COMPARISONS) {
      const ytA = comp.aMap.get(year)!;
      const ytB = comp.bMap.get(year)!;
      for (const dim of TOP_LEVEL_DIMS) {
        rows.push([year, comp.label, dim.label, ytA[dim.key], ytB[dim.key], ytB[dim.key] - ytA[dim.key]]);
      }
      const sourceTypes = new Set([
        ...ytA.byRoleSourceType.map((e) => e.roleSourceType),
        ...ytB.byRoleSourceType.map((e) => e.roleSourceType),
      ]);
      for (const sourceType of Array.from(sourceTypes).sort()) {
        const entryA = ytA.byRoleSourceType.find((e) => e.roleSourceType === sourceType);
        const entryB = ytB.byRoleSourceType.find((e) => e.roleSourceType === sourceType);
        const tpA = entryA?.totalPayroll ?? 0;
        const tpB = entryB?.totalPayroll ?? 0;
        rows.push([year, comp.label, `Total Payroll — ${sourceType}`, tpA, tpB, tpB - tpA]);
      }
    }
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 19: DRE Payroll Bridge ──────────────────────────────────────────────
function buildDrePayrollBridgeSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const TOLERANCE = 1e-6;
  const header = [
    "Year",
    "Org Design Option ID",
    "Org Design Option Label",
    "DRE fopag_direto_clt_pj",
    "Payroll model FOPAG Direto",
    "FOPAG Variance",
    "FOPAG Status",
    "DRE folha_de_pagamento",
    "Payroll model Folha Direta",
    "Folha Variance",
    "Folha Status",
    "DRE beneficios",
    "Payroll model Benefits",
    "Benefits Variance",
    "Benefits Status",
  ];
  const rows: (string | number)[][] = [header];
  const VARIANTS: { id: DreWorkingScenarioOrgDesignOptionId; label: string; v: OrgDesignPayrollVariant }[] = [
    { id: "minimum_experience", label: "Minimum Experience", v: tv.minimum },
    { id: "balanced_experience", label: "Balanced Experience", v: tv.balanced },
    { id: "premium_experience", label: "Premium Experience", v: tv.premium },
  ];
  for (const { id, label, v } of VARIANTS) {
    const ytMap = new Map(v.fopagOutput.yearTotals.map((yt) => [yt.year, yt]));
    for (const year of YEARS) {
      const dreRow = v.dreOutput.byYear[year];
      const yt = ytMap.get(year)!;
      // DRE sign convention: dreValue is negative; payroll model value is positive.
      // Variance = dreValue + modelValue; reconciled rows yield 0.
      const fopagVar = dreRow.fopag_direto_clt_pj + yt.fopagDireto;
      const folhaVar = dreRow.folha_de_pagamento + yt.folhaDireta;
      const beneVar = dreRow.beneficios + yt.benefits;
      rows.push([
        year, id, label,
        dreRow.fopag_direto_clt_pj, yt.fopagDireto, fopagVar, Math.abs(fopagVar) < TOLERANCE ? "OK" : "MISMATCH",
        dreRow.folha_de_pagamento, yt.folhaDireta, folhaVar, Math.abs(folhaVar) < TOLERANCE ? "OK" : "MISMATCH",
        dreRow.beneficios, yt.benefits, beneVar, Math.abs(beneVar) < TOLERANCE ? "OK" : "MISMATCH",
      ]);
    }
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Phase 15R.3: FOPAG full-scope tabs ───────────────────────────────────────

// ── Sheet 20: FOPAG Headcount Plan ───────────────────────────────────────────
function buildFopagHeadcountPlanSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const header = [
    "Org Design Option ID",
    "Org Design Option Label",
    "Year",
    "Role ID",
    "Role Name",
    "Role Source Type",
    "Classification",
    "Headcount / FTE",
    "Allocation Model",
    "Payroll Inclusion Status",
    "Source Notes",
  ];
  const noteRow = [
    "FOPAG Headcount Plan — all model-backed payroll-driving roles across all three org design versions. " +
      "Includes teaching and non-teaching roles. Division/Area is not available in fopagOutput.records.",
  ];
  const rows: (string | number)[][] = [noteRow, header];

  const VARIANTS: { id: string; label: string; fopagOut: FopagEngineOutput }[] = [
    { id: "minimum_experience", label: "Minimum Experience", fopagOut: tv.minimum.fopagOutput },
    { id: "balanced_experience", label: "Balanced Experience", fopagOut: tv.balanced.fopagOutput },
    { id: "premium_experience", label: "Premium Experience", fopagOut: tv.premium.fopagOutput },
  ];

  for (const { id, label, fopagOut } of VARIANTS) {
    const sorted = [...fopagOut.records].sort(
      (a, b) => a.year - b.year || a.roleId.localeCompare(b.roleId),
    );
    for (const rec of sorted) {
      rows.push([
        id,
        label,
        rec.year,
        rec.roleId,
        rec.roleName,
        rec.roleSourceType,
        classifyFopagRole(rec.roleSourceType),
        rec.headcountOrFte,
        rec.allocationModel,
        rec.isAuditRow ? "audit-row-excluded" : "included",
        rec.sourceNotes,
      ]);
    }
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 21: FOPAG Role Audit ────────────────────────────────────────────────
function buildFopagRoleAuditSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const header = [
    "Role ID",
    "Role Name",
    "Org Design Option ID",
    "Org Design Option Label",
    "Role Source Type",
    "Classification",
    "Included in Payroll",
    "Included in FOPAG Direto",
    "Included in Folha Direta",
    "First Active Year",
    "Years Active",
    "Headcount Available",
    "Payroll Available",
    "Missing Data Flags",
    "Source Notes",
  ];
  const noteRow = [
    "FOPAG Role Audit — role inclusion and source completeness across all three org design versions. " +
      "All roles present in payroll/FOPAG outputs are included; scope is not limited to non-teaching roles. " +
      "Missing data fields are marked unavailable rather than fabricated.",
  ];
  const rows: (string | number | boolean)[][] = [noteRow, header];

  const VARIANTS: { id: string; label: string; fopagOut: FopagEngineOutput }[] = [
    { id: "minimum_experience", label: "Minimum Experience", fopagOut: tv.minimum.fopagOutput },
    { id: "balanced_experience", label: "Balanced Experience", fopagOut: tv.balanced.fopagOutput },
    { id: "premium_experience", label: "Premium Experience", fopagOut: tv.premium.fopagOutput },
  ];

  for (const { id, label, fopagOut } of VARIANTS) {
    // Group records by roleId within this variant
    const roleMap = new Map<string, typeof fopagOut.records[number][]>();
    for (const rec of fopagOut.records) {
      if (!roleMap.has(rec.roleId)) roleMap.set(rec.roleId, []);
      roleMap.get(rec.roleId)!.push(rec);
    }

    const roleIds = [...roleMap.keys()].sort();
    for (const roleId of roleIds) {
      const recs = roleMap.get(roleId)!;
      const first = recs[0]!;
      const activeRecs = recs.filter((r) => !r.isAuditRow);
      const firstActiveYear = activeRecs.length > 0 ? Math.min(...activeRecs.map((r) => r.year)) : "none";
      const yearsActive = activeRecs.length > 0 ? [...new Set(activeRecs.map((r) => r.year))].length : 0;
      const inFopagDireto = activeRecs.some((r) => r.allocationModel === "FOPAG_DIRETO");
      const inFolhaDireta = activeRecs.some((r) => r.allocationModel === "FOLHA_DIRETA");
      const headcountAvailable = recs.every((r) => typeof r.headcountOrFte === "number");
      const payrollAvailable = activeRecs.every(
        (r) => typeof r.grossLaborAnnualAfterGrowth === "number" && typeof r.benefitsAnnualAfterGrowth === "number",
      );

      const missingFlags: string[] = [];
      if (activeRecs.length === 0) missingFlags.push("no-active-years");
      if (!headcountAvailable) missingFlags.push("headcount-unavailable");
      if (!payrollAvailable) missingFlags.push("payroll-cost-unavailable");
      if (!inFopagDireto && !inFolhaDireta) missingFlags.push("allocation-model-unresolved");

      rows.push([
        roleId,
        first.roleName,
        id,
        label,
        first.roleSourceType,
        classifyFopagRole(first.roleSourceType),
        activeRecs.length > 0,
        inFopagDireto,
        inFolhaDireta,
        firstActiveYear,
        yearsActive,
        headcountAvailable,
        payrollAvailable,
        missingFlags.length > 0 ? missingFlags.join("; ") : "none",
        first.sourceNotes,
      ]);
    }
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Sheet 22: FOPAG Payroll Projection ────────────────────────────────────────
function buildFopagPayrollProjectionSheet(tv: ThreeVersionPayroll): XLSX.WorkSheet {
  const header = [
    "Org Design Option ID",
    "Org Design Option Label",
    "Year",
    "Role ID",
    "Role Name",
    "Role Source Type",
    "Classification",
    "Headcount / FTE",
    "FOPAG Direto",
    "Folha Direta",
    "Benefits",
    "Total Payroll",
    "Is Audit Row",
    "DRE Mapping",
    "Source Notes",
  ];
  const noteRow = [
    "FOPAG Payroll Projection — full payroll projection by role, year, and org design version. " +
      "Payroll values are positive cost values. Teaching and non-teaching roles included. " +
      "External service contracts, CAPEX, tuition, and non-payroll fixed costs are not included. " +
      "Audit rows are retained and marked; they contribute 0 to payroll columns. " +
      "Total Payroll = FOPAG Direto + Folha Direta + Benefits by construction.",
  ];
  const rows: (string | number | boolean)[][] = [noteRow, header];

  const VARIANTS: { id: string; label: string; fopagOut: FopagEngineOutput }[] = [
    { id: "minimum_experience", label: "Minimum Experience", fopagOut: tv.minimum.fopagOutput },
    { id: "balanced_experience", label: "Balanced Experience", fopagOut: tv.balanced.fopagOutput },
    { id: "premium_experience", label: "Premium Experience", fopagOut: tv.premium.fopagOutput },
  ];

  for (const { id, label, fopagOut } of VARIANTS) {
    const sorted = [...fopagOut.records].sort(
      (a, b) => a.year - b.year || a.roleId.localeCompare(b.roleId),
    );
    for (const rec of sorted) {
      const isAudit = rec.isAuditRow;
      const fopagDireto = !isAudit && rec.allocationModel === "FOPAG_DIRETO" ? rec.grossLaborAnnualAfterGrowth : 0;
      const folhaDireta = !isAudit && rec.allocationModel === "FOLHA_DIRETA" ? rec.grossLaborAnnualAfterGrowth : 0;
      const benefits = isAudit ? 0 : rec.benefitsAnnualAfterGrowth;
      const totalPayroll = fopagDireto + folhaDireta + benefits;
      const dreMapping =
        rec.allocationModel === "FOPAG_DIRETO"
          ? "fopag_direto_clt_pj (DRE direct cost)"
          : rec.allocationModel === "FOLHA_DIRETA"
          ? "folha_de_pagamento (DRE fixed cost)"
          : "unavailable";
      rows.push([
        id,
        label,
        rec.year,
        rec.roleId,
        rec.roleName,
        rec.roleSourceType,
        classifyFopagRole(rec.roleSourceType),
        rec.headcountOrFte,
        fopagDireto,
        folhaDireta,
        benefits,
        totalPayroll,
        isAudit,
        dreMapping,
        rec.sourceNotes,
      ]);
    }
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

// ── Main entry point ──────────────────────────────────────────────────────────
export function buildDreScenarioWorkbook(vm: DreScenarioWorkbookViewModel): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const { sheet: dreDetailSheet, rowMap } = buildDreDetailSheet(vm.dreOutput);

  XLSX.utils.book_append_sheet(wb, buildReadmeSheet(vm), "README");
  XLSX.utils.book_append_sheet(wb, buildScenarioInputsSheet(vm), "Scenario Inputs");
  XLSX.utils.book_append_sheet(
    wb,
    buildCrossSheetReferenceSheet(DRE_SUMMARY_FIELDS, vm.dreOutput, rowMap),
    "DRE Summary",
  );
  XLSX.utils.book_append_sheet(wb, dreDetailSheet, "DRE Detail");
  XLSX.utils.book_append_sheet(
    wb,
    buildCrossSheetReferenceSheet(
      COST_LINE_FIELDS.map((id) => ({
        id,
        label: DRE_LINE_ITEM_MAP.find((l) => l.dreLineId === id)?.displayLabelPt ?? id,
      })),
      vm.dreOutput,
      rowMap,
    ),
    "DRE Cost Lines",
  );
  XLSX.utils.book_append_sheet(wb, buildEnrollmentSheet(vm, rowMap), "Enrollment");
  XLSX.utils.book_append_sheet(wb, buildTuitionRevenueSheet(vm, rowMap), "Tuition Revenue");
  XLSX.utils.book_append_sheet(wb, buildOrgDesignRolesSheet(vm), "Org Design Roles");
  XLSX.utils.book_append_sheet(wb, buildPayrollFopagSheet(vm, rowMap), "Payroll FOPAG");
  XLSX.utils.book_append_sheet(wb, buildOrgDesignSensitivitySheet(vm), "Org Design Sensitivity");
  XLSX.utils.book_append_sheet(wb, buildScenarioSensitivityMatrixSheet(vm), "Scenario Sensitivity Matrix");
  XLSX.utils.book_append_sheet(wb, buildFormulaAuditSheet(vm, rowMap), "Formula Audit");
  XLSX.utils.book_append_sheet(wb, buildRawEngineOutputSheet(vm), "Raw Engine Output");

  // Phase 15R.1: three-version payroll sheets
  const tv = vm.threeVersionPayroll;
  XLSX.utils.book_append_sheet(wb, buildPayrollComparisonSheet(tv), "Payroll Comparison");
  XLSX.utils.book_append_sheet(wb, buildPayrollDetailSheet(tv.minimum.fopagOutput, "Minimum Experience"), "Payroll Detail - Minimum");
  XLSX.utils.book_append_sheet(wb, buildPayrollDetailSheet(tv.balanced.fopagOutput, "Balanced Experience"), "Payroll Detail - Balanced");
  XLSX.utils.book_append_sheet(wb, buildPayrollDetailSheet(tv.premium.fopagOutput, "Premium Experience"), "Payroll Detail - Premium");
  XLSX.utils.book_append_sheet(wb, buildPayrollDeltaAnalysisSheet(tv), "Payroll Delta Analysis");
  XLSX.utils.book_append_sheet(wb, buildDrePayrollBridgeSheet(tv), "DRE Payroll Bridge");

  // Phase 15R.3: full FOPAG / Folha Direta support tabs
  XLSX.utils.book_append_sheet(wb, buildFopagHeadcountPlanSheet(tv), "FOPAG Headcount Plan");
  XLSX.utils.book_append_sheet(wb, buildFopagRoleAuditSheet(tv), "FOPAG Role Audit");
  XLSX.utils.book_append_sheet(wb, buildFopagPayrollProjectionSheet(tv), "FOPAG Payroll Projection");

  return wb;
}

export function buildDreScenarioExportFilename(
  selections: DreScenarioSimulatorSelections,
  exportedAt: Date,
): string {
  const timestamp = exportedAt.toISOString().replace(/[:.]/g, "-");
  return [
    "rio-dre-scenario",
    selections.openingPackageId,
    selections.occupancyScenarioId,
    selections.tuitionScenarioId,
    selections.orgDesignOptionId,
    timestamp,
  ].join("_") + ".xlsx";
}
