// Phase 15B-FCO-CAPEX-BRIDGE — NOL / tax engine.
//
// `workbook_parity_nol_method`: exact port of the visible "Recuperacao de
// Prejuizos" sheet's chronological, stateful recurrence
// (phase15CapitalDecisionArchitecture.md S16.3, Tax/NOL caution resolution,
// 2026-06-12). This is NOT presented as an independent interpretation of
// Brazilian tax law -- it reproduces the workbook's formulas, including its
// all-or-nothing NOL exhaustion behavior in the transition year (no
// pro-ration), as observed at the 2038-to-2039 discontinuity in the R$100M
// workbook baseline.
//
// Per period X (chronological), given EBT_X and AccumNOL_{X-1} (0 before the
// first period):
//   NewLoss_X        = MIN(EBT_X, 0)
//   BaseOriginal_X   = MAX(EBT_X, 0)
//   BaseReduzida_X   = BaseOriginal_X * (1 - NOL_TAXABLE_BASE_REDUCTION_PCT)
//   Used_X           = BaseOriginal_X - BaseReduzida_X   (= 30% of positive EBT)
//   AccumNOL_X       = (AccumNOL_{X-1} + NewLoss_X + Used_X) >= 0
//                        ? 0
//                        : AccumNOL_{X-1} + NewLoss_X + Used_X
//   ImpostoOriginal_X = BaseOriginal_X <= 0 ? 0 : -BaseOriginal_X * TAX_RATE
//   ImpostoRecalc_X   = BaseReduzida_X <= 0 ? 0 : -BaseReduzida_X * TAX_RATE
//   Reducao_X         = (ImpostoRecalc_X - ImpostoOriginal_X) > -AccumNOL_X
//                          ? 0
//                          : ImpostoRecalc_X - ImpostoOriginal_X
//
// Verified against R$100M workbook cached values:
//   2032 (G): ImpostoOriginal=-1,074,718.77, Reducao=322,415.63 (cached match)
//   2038->2039 (M->N): AccumNOL M=-6,639,042.87 -> N=0 (clamped, all-or-nothing);
//                       N280 (Reducao) = 0 (no pro-ration).

import type {
  NolTaxEngineInput,
  NolTaxEngineOutput,
  NolTaxPeriodResult,
} from "./nolTaxEngineContract";

// 34% IRPJ/CSLL, per the visible workbook and S16.3.
const TAX_RATE = 0.34;
// Workbook "Recuperacao de Prejuizos": taxable base is reduced to 70% when
// an accumulated loss is available to be compensated (30% annual
// compensation limit).
const NOL_TAXABLE_BASE_FRACTION = 0.7;

export function calculateNolTax(input: NolTaxEngineInput): NolTaxEngineOutput {
  let accumulatedNol = 0;

  const periods: NolTaxPeriodResult[] = input.ebtByPeriod.map(({ periodKey, ebtBRL }) => {
    const newLoss = Math.min(ebtBRL, 0);
    const baseOriginal = Math.max(ebtBRL, 0);
    const baseReduzida = baseOriginal * NOL_TAXABLE_BASE_FRACTION;
    const used = baseOriginal - baseReduzida;

    const candidateAccumulatedNol = accumulatedNol + newLoss + used;
    accumulatedNol = candidateAccumulatedNol >= 0 ? 0 : candidateAccumulatedNol;

    const impostoOriginal = baseOriginal <= 0 ? 0 : -baseOriginal * TAX_RATE;
    const impostoRecalc = baseReduzida <= 0 ? 0 : -baseReduzida * TAX_RATE;

    const potentialReducao = impostoRecalc - impostoOriginal;
    const reducao = potentialReducao > -accumulatedNol ? 0 : potentialReducao;

    return {
      periodKey,
      taxDirectBRL: impostoOriginal,
      nolRecoveryBRL: reducao,
      taxTotalBRL: impostoOriginal + reducao,
      accumulatedNolBRL: accumulatedNol,
    };
  });

  return { periods };
}
