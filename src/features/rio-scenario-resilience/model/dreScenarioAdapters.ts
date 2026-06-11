// DRE scenario-sensitive adapter implementations — Phase 12N (2026-06-09).
//
// Two adapter functions wiring the Receita engine outputs to DRE revenue lines:
//
//   adaptReceitasComEnsinoRegular:
//     ReceitaEngineOutput.byYear[year].grossReceitaBeforeDiscount
//     → dreRevenue['receitas_com_ensino_regular'][year]
//     Guards: must NOT use netReceitaAfterDiscount (audit_only per Phase 12H);
//             must NOT hardcode PnL row 225 annual values.
//
//   adaptNumeroDeAlunos:
//     sum of contractedLearners across active grades (>0) per year
//     from ReceitaEngineOutput.grainRecords
//     → dreRevenue['numero_de_alunos'][year]
//     Guard: must NOT hardcode PnL row 221 annual values.
//
// DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER:
//   Closes the Phase 12M limitation: base-year per-learner ratio (Y233/Y221)
//   extracted from PnL spreadsheet source-of-truth.
//   basePerLearnerRatio = 2510141.28 / 976 = 2571.8660655737704
//   Formula context: C233 = ($Y233/$Y$221)*(1+C$9)*C$221
//
// No DRE engine. No EBITDA engine. CALCULATION_CAN_BEGIN remains false.

import type { ReceitaEngineOutput } from "./receitaEngineContract";
import type { OpeningPackageProjectionYear } from "./openingPackageOccupancySourceDataContract";
import type {
  DreOutrasReceitasBasePerLearnerSource,
  DreScenarioAdaptersImplementationRecord,
} from "./dreScenarioAdaptersContract";

export function adaptReceitasComEnsinoRegular(
  output: ReceitaEngineOutput,
  year: OpeningPackageProjectionYear,
): number {
  return output.byYear[year]?.grossReceitaBeforeDiscount ?? 0;
}

export function adaptNumeroDeAlunos(
  output: ReceitaEngineOutput,
  year: OpeningPackageProjectionYear,
): number {
  return output.grainRecords
    .filter((r) => r.year === year && r.contractedLearners > 0)
    .reduce((sum, r) => sum + r.contractedLearners, 0);
}

export const DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER: DreOutrasReceitasBasePerLearnerSource = {
  sourceSheet: "PnL",
  dreLineId: "outras_receitas",
  sourceCells: {
    benchmarkAnnualOutrasReceitas: "Y233",
    benchmarkLearners: "Y221",
  },
  sourceValues: {
    Y233: 2510141.28,
    Y221: 976,
    basePerLearnerRatio: 2571.8660655737704,
  },
  formulaPattern:
    "C233 = ($Y233/$Y$221)*(1+C$9)*C$221; subsequent years use prior-year value per learner " +
    "× (1 + Reajuste Despesas) × current-year Número de Alunos.",
  valueSourceStatus: "extracted_from_pnl_spreadsheet",
} satisfies DreOutrasReceitasBasePerLearnerSource;

export const DRE_SCENARIO_ADAPTERS_IMPLEMENTATION: DreScenarioAdaptersImplementationRecord = {
  phase: "12N",
  implementedAt: "2026-06-09",
  outrasReceitasSource: DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER,
  nonUseGuards: [
    "adaptReceitasComEnsinoRegular accesses output.byYear[year].grossReceitaBeforeDiscount only; " +
      "netReceitaAfterDiscount is not accessed",
    "adaptReceitasComEnsinoRegular returns engine output value; no PnL row 225 values are hardcoded",
    "adaptNumeroDeAlunos sums contractedLearners from grainRecords; no PnL row 221 values are hardcoded",
  ],
  note:
    "Phase 12N (2026-06-09): two scenario-sensitive DRE adapter functions implemented. " +
    "adaptReceitasComEnsinoRegular: ReceitaEngineOutput.byYear[year].grossReceitaBeforeDiscount → " +
    "dreRevenue['receitas_com_ensino_regular'][year]. " +
    "adaptNumeroDeAlunos: sum contractedLearners (>0) from grainRecords per year → " +
    "dreRevenue['numero_de_alunos'][year]. " +
    "DRE_OUTRAS_RECEITAS_BASE_PER_LEARNER: base-year per-learner ratio 2571.8660655737704 " +
    "(Y233=2510141.28 / Y221=976), extracted from PnL spreadsheet source-of-truth " +
    "(source/outras_receitas_base_per_learner_extraction.json). " +
    "No DRE engine. No EBITDA engine. CALCULATION_CAN_BEGIN remains false.",
} satisfies DreScenarioAdaptersImplementationRecord;
