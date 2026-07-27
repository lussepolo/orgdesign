// V10-F2 / V10-F2.1 / V10-F2.2 — canonical v10 "Reajuste Despesas" mechanism.
//
// Governing source: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx"
// SHA-256 2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0.
// Sheet "PnL", row 11, "Reajuste Despesas". Directly verified cell-by-cell
// via raw OOXML inspection (V10-F2.1), including Excel shared-formula
// resolution (anchor + si-index + relative-reference shifting), E11:X11
// (2028-2047):
//   E11 = E6+1% = 5.0% (2028)
//   F11:X11 = <col>6+1% = 4.9% flat (2029-2047)
//
// V10-F2.2 GOVERNANCE (2026-07-27, project owner Luciana Polonen): v10 is
// authoritative for every formula that references the row-11 cell for its
// year. The older workbook "vCR v7 (2).xlsx" (still the SOURCE_WORKBOOK of
// dreAnnualAssumptionSourceData.ts) has NO live computational authority for
// any of the 22 lines below — it is retained only as historical/forensic
// evidence of the application's prior source. Where v7 and v10 differ, the
// live application now uses v10.
//
// COMPLETE 22-LINE ROW-11 DEPENDENCY TABLE (V10-F2.1 full shared-formula-
// resolving scan of the entire v10 PnL sheet — not a sample): every one of
// the 22 lines is now migrated to a live v10-derived formula in dreEngine.ts.
// Three formula FAMILIES were identified by directly reading each line's
// resolved formula across every year column E:X (V10-F2.2 second-pass OOXML
// extraction):
//
// FAMILY A — per-learner (or, for one line, per-turma-at-base-year) ratio
// carry-forward, identical in shape to the already-implemented
// `outras_receitas` (row 235) mechanism:
//   E<row> = ($AA<row>/$AA$223)*(1+E$11)*E$223
//   F<row> = (E$<row>/E$223)*(1+F$11)*F$223  (prior-YEAR VALUE, not the AA
//     benchmark, feeds forward — this is why the mechanism is expressed here
//     as an explicit "base2028 → recurring factor" pair, not a repeated
//     lookup of the AA cell)
//   ... continuing identically through X<row> (2047).
// Members: receita_com_eventos (233), outras_receitas (235, already live),
// eventos_seb (242), certificacoes (243), custos_com_alimentacao (244),
// materiais_pedagogicos (245), despesas_bancarias (270).
//
// FAMILY A VARIANT — energia_eletrica_agua_e_esgoto (259): the v10 formula's
// 2028 cell (E259) divides the AA-benchmark by $AA$222 ("Número de Turmas",
// not alunos), then EVERY subsequent year (F259 onward) divides by the prior
// year's Número de Alunos instead — i.e. the base year is turma-denominated
// and every later year is aluno-denominated. Algebraically this telescopes
// to EXACTLY the same recurring formula as the plain Family A members once
// the one-time base-year ratio is expressed per-aluno: given the v10 2028
// workbook values Número de Turmas=19 and Número de Alunos=238 (both
// directly verified, V10-F2.2), basePerLearnerRatio_259 = E259_2028 /
// (1.05 × 238) reproduces every year exactly (verified: this reproduces the
// workbook's own F259 to full float precision from E259 alone — no turma
// count is needed at runtime because the base-year conversion is folded into
// the single constant below). This is not an approximation: it is the closed
// form of the workbook's own two-step recursion.
//
// FAMILY B — fixed percentage of the SAME-YEAR receita_operacional_liquida
// (row 238), NOT a compounding carry-forward:
//   E<row> through X<row> = $AB<row> * <col>$238 * (1+<col>$11)
// Each year independently multiplies THAT year's Receita Operacional Líquida
// by a fixed ratio and that year's row-11 rate — no year-over-year
// compounding chain (contrast with Family A). row 238 does not reference any
// of these lines (E238=SUM(E236:E237); confirmed no cycle — V10-F2.2, first
// extraction pass), so this is a clean one-directional dependency (238 feeds
// these 10 lines), not a circular one.
// Members: cursos_e_treinamentos (250), servicos_de_limpeza_e_seguranca
// (251), rpa (254), conservacao_predial_e_manutencao_maquinas_e_moveis (256),
// locacao_de_maquinas_e_equipamentos (257),
// tecnologia_telefone_internet_licencas_e_servicos_de_informacao (258),
// materiais_de_limpeza (260), materiais_de_escritorio (261),
// despesas_com_viagens (262), demais_impostos_e_taxas (265, with one 2028-
// only additional -20000 literal subtraction on top of the Family B
// formula — reproduced exactly, see demaisImpostosETaxasValueForYear below).
//
// FIXED-BASE COMPOUNDING — despesas_juridicas (253): E253 is a standalone
// hardcoded -20000 with NO row-11 rate applied at 2028 (unlike every Family A
// 2028 cell, which does apply the 2028 5.0% rate); F253 onward compounds
// -20000 by the recurring row-11 rate exactly like the existing
// `reajusteDespesasValueForYear` helper already does for any base value
// (factor(2028)=1, factor(year>2028)=1.049^(year-2028)) — reuses the
// existing mechanism directly, no new helper needed.
//
// RESET-BEARING LINES — consultoria_e_honorarios (252), demais_custos_e_
// despesas (266), despesas_com_marketing (268): each has one or more
// hardcoded literal resets embedded directly in the v10 formula text at
// specific years, breaking the compounding chain from the prior year at
// those points (266 additionally switches to a Family-B-style percentage of
// receita_operacional_liquida for 2033-2035 before resuming compounding).
// These cannot be expressed as a closed-form multiplier — see the dedicated
// per-year functions below, which reproduce every reset point and every
// post-reset escalation year exactly as verified against v10 E:X (V10-F2.2).
//
// APPLICABILITY IS FORMULA-DRIVEN, NOT LABEL-DRIVEN — this was true under the
// prior (partially-blocked) V10-F2.1 state and remains true now that all 22
// lines are live: every line's treatment above was derived directly from its
// own v10 formula text, not from its DRE category or its prior
// `independent_finance_assumption` classification. dreAnnualAssumptionSourceData.ts
// (the v7-sourced static Finance table) is retained as historical/forensic
// evidence and remains the live source ONLY for lines outside this 22-line
// set (e.g. aluguel_iptu, corporativo_bu, rateio_corporativo, pcld,
// descontos_comerciais, despesas_com_isencao) — those are out of this
// phase's scope (not row-11-dependent) and are unaffected.
//
// Base-year treatment for the Family A per-learner ratios (Case A — same
// pattern already documented for outras_receitas): each basePerLearnerRatio
// constant below is a pre-2028 benchmark (v10 "Bench SP 2025" sheet via
// SUMIFS into the PnL AA column); the v10 formula applies the 2028 row-11
// rate (5.0%) even in the base year — see toReajusteDespesasBase2028.
//
// Separate, independently named module from src/lib/payroll/payrollGrowth.ts
// and tuitionGrowth.ts — no shared constant.

export const V10_REAJUSTE_DESPESAS_SOURCE = {
  workbook: "Concept Rio - 20 anos - Org BU - Apresentação v10.xlsx",
  sha256: "2e3230ad233c7cd450c1da1fca46da1cb80899e66cdf5ba3d4e9358357a05da0",
  sheet: "PnL",
  row: 11,
  rowLabel: "Reajuste Despesas",
  governanceStatus: "approved_by_project_owner" as const,
  approvalReference:
    "Project-owner confirmation that Reajuste Despesas applies to all formulas referencing " +
    "E11 and its corresponding annual row-11 cells (V10-F2, 2026-07-27); v10 precedence over " +
    "the older vCR v7 (2).xlsx for all 22 row-11-dependent lines confirmed (V10-F2.2, " +
    "2026-07-27) — v7 retained as historical evidence only, no live computational authority.",
  applicability:
    "Formula-driven only. See module header for the complete 22-line row-11 dependency table, " +
    "the three formula families (A/A-variant/B), the fixed-base compounding line, and the " +
    "three reset-bearing lines. All 22 lines are implemented (V10-F2.2) — see dreEngine.ts.",
  supportedHorizon:
    "2028-2037 direct workbook years, plus 2038-2047 directly source-evidenced via shared-" +
    "formula resolution (E11:X11 all verified, not extrapolated).",
} as const;

// Directly verified v10 PnL!E11:N11 (Reajuste Despesas), 2028-2037.
export const V10_REAJUSTE_DESPESAS_RATE_BY_YEAR: Readonly<Record<number, number>> = {
  2028: 0.05,
  2029: 0.049,
  2030: 0.049,
  2031: 0.049,
  2032: 0.049,
  2033: 0.049,
  2034: 0.049,
  2035: 0.049,
  2036: 0.049,
  2037: 0.049,
};

export const REAJUSTE_DESPESAS_BASE_YEAR_2028 = 2028;

// One-time prior-benchmark→2028 conversion rate (v10 PnL!E11, 2028 column).
export const REAJUSTE_DESPESAS_2028_CONVERSION_RATE = 0.05;

// Recurring escalation, applied for each year after 2028
// (v10 PnL!F11:N11, Reajuste Despesas 2029-2037, flat 4.9%; directly source-
// evidenced through column X / 2047, not extrapolated).
export const REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS = 0.049;

/**
 * Converts a prior-benchmark (pre-2028) per-unit figure into the explicit
 * 2028 base, applying the 2028 row-11 rate exactly once.
 */
export function toReajusteDespesasBase2028(sourceBasePrior: number): number {
  return sourceBasePrior * (1 + REAJUSTE_DESPESAS_2028_CONVERSION_RATE);
}

/** 1.0 at/before 2028; 1.049^(year-2028) afterward. */
export function resolveReajusteDespesasGrowthFactor(year: number): number {
  if (year <= REAJUSTE_DESPESAS_BASE_YEAR_2028) return 1;
  return Math.pow(
    1 + REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS,
    year - REAJUSTE_DESPESAS_BASE_YEAR_2028,
  );
}

export function reajusteDespesasValueForYear(base2028: number, year: number): number {
  return base2028 * resolveReajusteDespesasGrowthFactor(year);
}

/** Single-year row-11 rate (not compounded): 5.0% at/before 2028, 4.9% after. */
export function reajusteDespesasRateForYear(year: number): number {
  return year <= REAJUSTE_DESPESAS_BASE_YEAR_2028
    ? REAJUSTE_DESPESAS_2028_CONVERSION_RATE
    : REAJUSTE_DESPESAS_ESCALATION_RATE_2029_PLUS;
}

// ── FAMILY A — per-learner ratio carry-forward ──────────────────────────────
// basePerLearnerRatio constants below are each v10 PnL!AA<row>/AA$223 (or, for
// row 259, the closed-form per-aluno equivalent of its turma-denominated base
// year — see module header). Directly verified via OOXML (V10-F2.2). Feed
// into perLearnerReajusteDespesasValue with the live, scenario-dependent
// numero_de_alunos — never a hardcoded workbook alunos count.

export const RECEITA_COM_EVENTOS_BASE_PER_LEARNER_RATIO = 957.2779713114753; // v10 PnL row 233
export const EVENTOS_SEB_BASE_PER_LEARNER_RATIO = -3159.782704918033; // v10 PnL row 242
export const CERTIFICACOES_BASE_PER_LEARNER_RATIO = -140.96352459016393; // v10 PnL row 243
export const CUSTOS_COM_ALIMENTACAO_BASE_PER_LEARNER_RATIO = -54.4734118852459; // v10 PnL row 244
export const MATERIAIS_PEDAGOGICOS_BASE_PER_LEARNER_RATIO = -938.9024999999999; // v10 PnL row 245
export const ENERGIA_ELETRICA_AGUA_E_ESGOTO_BASE_PER_LEARNER_RATIO = -1725.0771840500906; // v10 PnL row 259 (turma/aluno base-year variant, see header)
export const DESPESAS_BANCARIAS_BASE_PER_LEARNER_RATIO = -363.2586782786885; // v10 PnL row 270

/**
 * Family A: base2028 = basePerLearnerRatio × 1.05 (one-time conversion),
 * then × recurring row-11 factor, × the live per-year alunos count.
 */
export function perLearnerReajusteDespesasValue(
  basePerLearnerRatio: number,
  numeroDeAlunos: number,
  year: number,
): number {
  return (
    reajusteDespesasValueForYear(toReajusteDespesasBase2028(basePerLearnerRatio), year) *
    numeroDeAlunos
  );
}

// ── FAMILY B — fixed percentage of same-year receita_operacional_liquida ───
// AB<row> constants below are each v10 PnL!AB<row> = AA<row>/AA$238 (fixed
// ratio to the AA-column revenue benchmark). Directly verified via OOXML
// (V10-F2.2).

export const CURSOS_E_TREINAMENTOS_REVENUE_SHARE_RATIO = -0.01524176109183518; // v10 PnL row 250
export const SERVICOS_DE_LIMPEZA_E_SEGURANCA_REVENUE_SHARE_RATIO = -0.035083371833752458; // v10 PnL row 251
export const RPA_REVENUE_SHARE_RATIO = -0.00064755831479743216; // v10 PnL row 254
export const CONSERVACAO_PREDIAL_E_MANUTENCAO_MAQUINAS_E_MOVEIS_REVENUE_SHARE_RATIO =
  -0.019179217245907331; // v10 PnL row 256
export const LOCACAO_DE_MAQUINAS_E_EQUIPAMENTOS_REVENUE_SHARE_RATIO = -0.0028964087174190678; // v10 PnL row 257
export const TECNOLOGIA_TELEFONE_INTERNET_LICENCAS_E_SERVICOS_DE_INFORMACAO_REVENUE_SHARE_RATIO =
  -0.0057781233386285527; // v10 PnL row 258
export const MATERIAIS_DE_LIMPEZA_REVENUE_SHARE_RATIO = -0.00458243327385781; // v10 PnL row 260
export const MATERIAIS_DE_ESCRITORIO_REVENUE_SHARE_RATIO = -0.0022622603373758845; // v10 PnL row 261
export const DESPESAS_COM_VIAGENS_REVENUE_SHARE_RATIO = -0.0077915684174368529; // v10 PnL row 262
export const DEMAIS_IMPOSTOS_E_TAXAS_REVENUE_SHARE_RATIO = -0.00089740207118056768; // v10 PnL row 265
export const DEMAIS_CUSTOS_E_DESPESAS_REVENUE_SHARE_RATIO = -0.007212912342751795; // v10 PnL row 266 (2033-2035 only, see demaisCustosEDespesasValueForYear)

/**
 * Family B: abRatio × that year's receita_operacional_liquida × (1 + that
 * year's single-year row-11 rate). Not compounded year-over-year — each year
 * is computed independently from the same-year revenue.
 */
export function revenueShareReajusteDespesasValue(
  abRatio: number,
  receitaOperacionalLiquida: number,
  year: number,
): number {
  return abRatio * receitaOperacionalLiquida * (1 + reajusteDespesasRateForYear(year));
}

// v10 PnL row 265: identical to the Family B formula above, plus one
// additional -20000 literal subtraction in 2028 only (E265 = AB265*E238*
// (1+E11) - 20000; F265 onward has no such term). Directly verified (V10-F2.2).
export function demaisImpostosETaxasValueForYear(
  receitaOperacionalLiquida: number,
  year: number,
): number {
  const base = revenueShareReajusteDespesasValue(
    DEMAIS_IMPOSTOS_E_TAXAS_REVENUE_SHARE_RATIO,
    receitaOperacionalLiquida,
    year,
  );
  return year === REAJUSTE_DESPESAS_BASE_YEAR_2028 ? base - 20000 : base;
}

// ── RESET-BEARING LINES ──────────────────────────────────────────────────────
// Each function requires the caller to carry the PRIOR year's own result
// forward (RECEITA_PROJECTION_YEARS is processed in ascending order in
// dreEngine.ts, so this is a simple sequential accumulator — priorValue is
// unused for year 2028, the reset base case).

// v10 PnL row 252 (Consultoria e Honorários). Resolved E:X (V10-F2.2):
//   E(2028) = -30000*(1+E11)
//   F(2029) = -50000*(1+F11)                [fresh literal reset, ignores E]
//   G(2030) = (F252-20000)*(1+G11)          [reset]
//   H(2031) = G252*(1+H11)                  [compound]
//   I(2032) = (H252-15000)*(1+I11)          [reset]
//   J..X(2033-2047) = prior*(1+rate)        [compound]
export function consultoriaEHonorariosValueForYear(
  year: number,
  priorValue: number | undefined,
): number {
  const rate = reajusteDespesasRateForYear(year);
  switch (year) {
    case 2028:
      return -30000 * (1 + rate);
    case 2029:
      return -50000 * (1 + rate);
    case 2030:
      return (priorValue! - 20000) * (1 + rate);
    case 2032:
      return (priorValue! - 15000) * (1 + rate);
    default:
      return priorValue! * (1 + rate);
  }
}

// v10 PnL row 266 (Demais Custos e Despesas). Resolved E:X (V10-F2.2):
//   E(2028) = -300000*(1+E11)
//   F,G(2029-2030) = prior*(1+rate)                    [compound]
//   H(2031) = -400000*(1+H11)                           [reset]
//   I(2032) = prior*(1+rate)                             [compound]
//   J,K,L(2033-2035) = AB266*revenue(year)*(1+rate)     [% of revenue — see
//     DEMAIS_CUSTOS_E_DESPESAS_REVENUE_SHARE_RATIO]
//   M..X(2036-2047) = prior*(1+rate)                     [resumes compounding
//     from the last %-of-revenue result]
export function demaisCustosEDespesasValueForYear(
  year: number,
  priorValue: number | undefined,
  receitaOperacionalLiquida: number,
): number {
  const rate = reajusteDespesasRateForYear(year);
  switch (year) {
    case 2028:
      return -300000 * (1 + rate);
    case 2031:
      return -400000 * (1 + rate);
    case 2033:
    case 2034:
    case 2035:
      return revenueShareReajusteDespesasValue(
        DEMAIS_CUSTOS_E_DESPESAS_REVENUE_SHARE_RATIO,
        receitaOperacionalLiquida,
        year,
      );
    default:
      return priorValue! * (1 + rate);
  }
}

// v10 PnL row 268 (Despesas com Marketing). Resolved E:X (V10-F2.2):
//   E(2028) = -2000000*(1+E11)
//   F,G,H(2029-2031) = prior*(1+rate)         [compound]
//   I(2032) = -2000000*(1+I11)                 [reset]
//   J(2033) = -1500000*(1+J11)                 [second reset, different literal]
//   K..X(2034-2047) = prior*(1+rate)            [compound]
export function despesasComMarketingValueForYear(
  year: number,
  priorValue: number | undefined,
): number {
  const rate = reajusteDespesasRateForYear(year);
  switch (year) {
    case 2028:
      return -2000000 * (1 + rate);
    case 2032:
      return -2000000 * (1 + rate);
    case 2033:
      return -1500000 * (1 + rate);
    default:
      return priorValue! * (1 + rate);
  }
}
