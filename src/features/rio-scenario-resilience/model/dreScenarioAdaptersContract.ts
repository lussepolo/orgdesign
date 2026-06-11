// DRE scenario-adapter implementation contract types — Phase 12N (2026-06-09).
//
// Narrow type definitions for the two implemented scenario-sensitive DRE adapter
// functions and the Outras Receitas base-year per-learner source record.
// Distinct from dreScenarioAdapterContract.ts (singular, Phase 12M design-documentation
// types) — this file governs the implementation artifact (dreScenarioAdapters.ts).
//
// No DRE engine. No EBITDA engine.

export type DreAdapterValueSourceStatus = "extracted_from_pnl_spreadsheet";

export interface DreOutrasReceitasSourceCells {
  readonly benchmarkAnnualOutrasReceitas: "Y233";
  readonly benchmarkLearners: "Y221";
}

export interface DreOutrasReceitasSourceValues {
  readonly Y233: number;
  readonly Y221: number;
  readonly basePerLearnerRatio: number;
}

export interface DreOutrasReceitasBasePerLearnerSource {
  readonly sourceSheet: "PnL";
  readonly dreLineId: "outras_receitas";
  readonly sourceCells: DreOutrasReceitasSourceCells;
  readonly sourceValues: DreOutrasReceitasSourceValues;
  readonly formulaPattern: string;
  readonly valueSourceStatus: DreAdapterValueSourceStatus;
}

export interface DreScenarioAdaptersImplementationRecord {
  readonly phase: string;
  readonly implementedAt: string;
  readonly outrasReceitasSource: DreOutrasReceitasBasePerLearnerSource;
  readonly nonUseGuards: readonly string[];
  readonly note: string;
}
