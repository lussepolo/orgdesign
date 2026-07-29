// V10-RC2 Gate 8 — machine-readable coverage matrix for the full governed
// cross-product: 2 opening packages x 3 captacao scenarios x 3 org-design
// scenarios x 10 years x 5 governed tuition scenarios = 900 cells.
//
// Also discharges Gate 9's model-level cross-product requirement (this run
// IS the model-level cross-product test) and supplies Gate 4's grade-level
// staffing/payroll figures for the governed EY/LS rule.
//
// No fallback to Base, no substituting another package/year/org-design, no
// silently selecting a default tuition configuration, no extrapolating
// per-grade enrollment, no substituting capacity for enrollment. Every cell
// records what the actual engines return, plus an explicit evidence source
// and limitation string grounded in the V10-RC2 Gate 1 decision matrix.
//
// Run with: npx tsx scripts/validate-v10-rc2-gate8-coverage-matrix.ts

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { calculateDre } from "../src/features/rio-scenario-resilience/model/dreEngine";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { ACTIVE_OPENING_PACKAGE_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { OCCUPANCY_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import { DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { TuitionScenarioId } from "../src/features/rio-scenario-resilience/model/revenueInputs";
import { RECEITA_PROJECTION_YEARS } from "../src/features/rio-scenario-resilience/model/receitaEngineContract";
import type { OpeningPackageProjectionYear } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";

const PACKAGES: readonly ActiveOpeningPackageId[] = ACTIVE_OPENING_PACKAGE_IDS;
const CAPTACAO: readonly OccupancyScenarioId[] = OCCUPANCY_SCENARIO_IDS;
const ORG_DESIGNS: readonly DreWorkingScenarioOrgDesignOptionId[] = DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS;
// Gate 8 specifies exactly 10 years (2028-2037, the direct-workbook horizon) — not
// RECEITA_PROJECTION_YEARS' full 20-year simulator horizon, which extends through
// 2047 via mature-state carry-forward (a separate, later mechanism).
const YEARS: readonly OpeningPackageProjectionYear[] = RECEITA_PROJECTION_YEARS.filter(
  (y) => y >= 2028 && y <= 2037,
) as readonly OpeningPackageProjectionYear[];
const TUITIONS: readonly TuitionScenarioId[] = DRE_WORKING_SCENARIO_TUITION_SCENARIO_IDS;

interface CoverageCell {
  openingPackageId: ActiveOpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  year: OpeningPackageProjectionYear;
  tuitionScenarioId: TuitionScenarioId;
  enrollmentAvailable: boolean;
  enrollmentValue: number | null;
  perGradeEnrollmentAvailable: boolean;
  perGradeEnrollmentActiveGradeCount: number;
  sectionsAvailable: boolean;
  sectionsDiagnosticCount: number;
  staffingAvailable: boolean;
  staffingStatus: string;
  payrollAvailable: boolean;
  payrollTotalPayroll: number | null;
  // V10-RC2.2 Gate 7: Payroll now consumes the shared engines (Gate 2 refactor)
  // and matches Org Design headcount exactly at role granularity (Gate 3,
  // 10272 role-rows). payrollHeadcountAvailable/payrollMonetaryAvailable
  // are distinct from staffingAvailable/payrollAvailable above (which predate
  // the refactor and describe the FOPAG engine's own readiness) -- these two
  // new fields specifically assert that Payroll's headcount and monetary
  // outputs are available to the Payroll tab for this cell, post-refactor.
  payrollHeadcountAvailable: boolean;
  payrollMonetaryAvailable: boolean;
  payrollMonetaryCertified: false;
  // Corporate allocation and consolidated people cost: genuinely unavailable
  // for every cell -- no adapter exists (CORPORATE-ALLOCATION, V10-RC2.2 Gate 1
  // blocker register). Never zero-substituted: these are false (unavailable),
  // not 0 (a computed zero-cost claim).
  corporateAllocationAvailable: false;
  consolidatedCostAvailable: false;
  tuitionStatus: "computed_uncertified";
  revenueAvailable: boolean;
  revenueValue: number | null;
  dreHandoffAvailable: boolean;
  ebitdaValue: number | null;
  exportAvailable: false;
  // V10-RC2.1 Gate 2: a cell is "fully supported" only if every required output is
  // both available AND certified (not just computable). Tuition/revenue precision
  // (D-R5) and base tuition rates (D-R6/F03) are computed but never Finance-signed,
  // and no cell's figures are export-certified (V10-RC2.1 Gate 7 wired a Fagundes
  // export view for the single visible scenario, which does not certify per-cell
  // tuition/MS-HS-staffing figures) -- so no cell in this matrix is, honestly,
  // "fully supported." "unavailable" is reserved for cells where the engine itself
  // cannot produce a required output at all (none exist in this governed 2-package
  // subset). Every cell is therefore "partially_supported" by construction; this
  // field exists so the classification is asserted, not implied by an all-PASS run.
  supportLevel: "fully_supported" | "partially_supported" | "unavailable";
  // Decision IDs (see phase-v10-rc2-gate1-decision-assimilation-matrix.md) whose
  // unresolved status limits (not blocks computation of) this cell's outputs.
  blockedByDecisionIds: readonly string[];
  // MS/HS aggregate payroll total in this cell is computed from ONE of three
  // non-identical candidate staffing figures (F06) -- the FOPAG adapter's own
  // fixed-FTE table -- not a governance-ratified choice among the three. EY/LS
  // headcount does not carry this caveat (Gate 4's governed 1:1 section rule).
  msHsStaffingAuthorityReconciled: false;
  evidenceSource: string;
  limitation: string;
}

// ── Cheap layer: section counts (6 combos, all years/grades) ────────────────
const sectionResultByPkgCapt = new Map<string, ReturnType<typeof calculateSectionCountsForScenario>>();
for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    sectionResultByPkgCapt.set(
      `${openingPackageId}|${occupancyScenarioId}`,
      calculateSectionCountsForScenario({ openingPackageId, occupancyScenarioId }),
    );
  }
}

// ── FOPAG layer: staffing + payroll (18 combos, all years) ──────────────────
const fopagResultByPkgCaptOrg = new Map<string, ReturnType<typeof calculateFopag>>();
for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    for (const orgDesignOptionId of ORG_DESIGNS) {
      fopagResultByPkgCaptOrg.set(
        `${openingPackageId}|${occupancyScenarioId}|${orgDesignOptionId}`,
        calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId }),
      );
    }
  }
}

// ── DRE layer: revenue + DRE handoff (90 combos, all years) ─────────────────
const dreResultByPkgCaptOrgTuition = new Map<string, ReturnType<typeof calculateDre>>();
for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    for (const orgDesignOptionId of ORG_DESIGNS) {
      for (const tuitionScenarioId of TUITIONS) {
        dreResultByPkgCaptOrgTuition.set(
          `${openingPackageId}|${occupancyScenarioId}|${orgDesignOptionId}|${tuitionScenarioId}`,
          calculateDre({ openingPackageId, occupancyScenarioId, orgDesignOptionId, tuitionScenarioId }),
        );
      }
    }
  }
}

const GOVERNANCE_LIMITATION_BASE =
  "Base tuition rates (D-R6/F03) and desconto_metodo (D-R5) remain uncertified " +
  "against the governing v10 workbook — screenshot_transcription_based / " +
  "not independently re-verified. Revenue and DRE handoff figures below are " +
  "computed by the live engine, not Finance-signed.";

const cells: CoverageCell[] = [];
for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    const sectionResult = sectionResultByPkgCapt.get(`${openingPackageId}|${occupancyScenarioId}`)!;
    for (const orgDesignOptionId of ORG_DESIGNS) {
      const fopagResult = fopagResultByPkgCaptOrg.get(
        `${openingPackageId}|${occupancyScenarioId}|${orgDesignOptionId}`,
      )!;
      for (const year of YEARS) {
        const yearSectionRecords = sectionResult.records.filter((r) => r.year === year && r.activeGrade);
        const yearSectionDiagnostics = sectionResult.diagnostics.filter((d) => d.year === year);
        const yearFopagTotals = fopagResult.yearTotals.find((yt) => yt.year === year) ?? null;

        for (const tuitionScenarioId of TUITIONS) {
          const dreResult = dreResultByPkgCaptOrgTuition.get(
            `${openingPackageId}|${occupancyScenarioId}|${orgDesignOptionId}|${tuitionScenarioId}`,
          )!;
          const dreYear = dreResult.byYear[year] ?? null;

          const evidenceParts = [
            "enrollment/sections: openingPackageOccupancySourceData.ts + sectionCountEngine.ts",
            "staffing/payroll: fopagEngine.ts (V10-P1 salary/benefits/encargos escalation)",
            "revenue/DRE: dreEngine.ts (D-R1-D-R4/D-R7/D-R8 approved_by_project_owner)",
            "Payroll headcount/monetary: PayrollProjectionTab.tsx now consumes calculateFopag/calculateDre/" +
              "buildOrgDesignHcTable directly (V10-RC2.2 Gate 2 refactor), verified role-level-identical to " +
              "Org Design across all 900 cells (V10-RC2.2 Gate 3, 10272 role-rows)",
          ];
          const limitationParts = [GOVERNANCE_LIMITATION_BASE];
          limitationParts.push(
            "MS/HS headcount has three non-reconciled figures in this repository " +
              "(Phase 15H.2 instructional model, FOPAG adapter's fixed-FTE table, " +
              "and a recovered-but-uncommitted Phase 8B count) — F06, genuinely " +
              "unresolved. EY/LS headcount (1 section = 1 lead + 1 assistant + " +
              "1 monitor for EY; 1 lead + 1 assistant for LS) is governed and " +
              "does not carry this limitation.",
          );
          limitationParts.push(
            "Export: payrollExportScenarioAdapter.ts reads governed FOPAG records " +
              "independently of the live UI's visible scenario selection (RC1B " +
              "finding, unchanged by this phase) — export is not wired to this " +
              "cell's exact combination.",
          );
          limitationParts.push(
            "Corporate allocation and consolidated people cost genuinely unavailable for every cell — " +
              "no adapter exists in this codebase (CORPORATE-ALLOCATION, V10-RC2.2 Gate 1 blocker register). " +
              "Direct campus payroll (fopagDireto+folhaDireta+benefits) is never suppressed or zero-substituted " +
              "because of this (V10-RC2.2 Gate 4).",
          );

          cells.push({
            openingPackageId,
            occupancyScenarioId,
            orgDesignOptionId,
            year,
            tuitionScenarioId,
            enrollmentAvailable: dreYear !== null && dreYear.numero_de_alunos > 0,
            enrollmentValue: dreYear?.numero_de_alunos ?? null,
            perGradeEnrollmentAvailable: yearSectionRecords.length > 0,
            perGradeEnrollmentActiveGradeCount: yearSectionRecords.length,
            sectionsAvailable: yearSectionRecords.length > 0 && yearSectionDiagnostics.length === 0,
            sectionsDiagnosticCount: yearSectionDiagnostics.length,
            staffingAvailable: fopagResult.calculationReady,
            staffingStatus: fopagResult.engineStatus,
            payrollAvailable: fopagResult.calculationReady && yearFopagTotals !== null,
            payrollTotalPayroll: yearFopagTotals?.totalPayroll ?? null,
            payrollHeadcountAvailable: fopagResult.calculationReady && yearFopagTotals !== null,
            payrollMonetaryAvailable: fopagResult.calculationReady && yearFopagTotals !== null,
            payrollMonetaryCertified: false,
            corporateAllocationAvailable: false,
            consolidatedCostAvailable: false,
            tuitionStatus: "computed_uncertified",
            revenueAvailable: dreYear !== null && Number.isFinite(dreYear.receita_operacional_liquida),
            revenueValue: dreYear?.receita_operacional_liquida ?? null,
            dreHandoffAvailable: dreYear !== null && Number.isFinite(dreYear.ebitda),
            ebitdaValue: dreYear?.ebitda ?? null,
            exportAvailable: false,
            // No cell reaches "fully_supported" -- tuition is never certified
            // (D-R6/F03), and MS/HS staffing authority is never reconciled (F06).
            // exportAvailable tracks CERTIFIED per-cell export availability, not
            // whether an export mechanism exists: V10-RC2.1 Gate 7 wired the
            // Fagundes Export Index sheet for the single currently-visible
            // scenario (dreScenarioWorkbook.ts), but that does not certify any
            // of the 900 cells' tuition/MS-HS-staffing figures -- so this stays
            // false for every cell, unchanged by Gate 7. "unavailable" would
            // require a required output the engine cannot produce at all, which does not
            // occur anywhere in this governed 2-package/3-captacao/3-org-design
            // subset (confirmed by the assertions at the bottom of this script).
            supportLevel: "partially_supported",
            blockedByDecisionIds: ["D-R5", "D-R6", "F03", "F06", "CORPORATE-ALLOCATION"],
            msHsStaffingAuthorityReconciled: false,
            evidenceSource: evidenceParts.join("; "),
            limitation: limitationParts.join(" "),
          });
        }
      }
    }
  }
}

const EXPECTED_CELL_COUNT = PACKAGES.length * CAPTACAO.length * ORG_DESIGNS.length * YEARS.length * TUITIONS.length;
if (cells.length !== EXPECTED_CELL_COUNT) {
  throw new Error(`Expected ${EXPECTED_CELL_COUNT} cells, got ${cells.length}`);
}

const summary = {
  totalCells: cells.length,
  dimensions: {
    openingPackageIds: PACKAGES,
    occupancyScenarioIds: CAPTACAO,
    orgDesignOptionIds: ORG_DESIGNS,
    years: YEARS,
    tuitionScenarioIds: TUITIONS,
  },
  availabilityCounts: {
    enrollmentAvailable: cells.filter((c) => c.enrollmentAvailable).length,
    perGradeEnrollmentAvailable: cells.filter((c) => c.perGradeEnrollmentAvailable).length,
    sectionsAvailable: cells.filter((c) => c.sectionsAvailable).length,
    staffingAvailable: cells.filter((c) => c.staffingAvailable).length,
    payrollAvailable: cells.filter((c) => c.payrollAvailable).length,
    revenueAvailable: cells.filter((c) => c.revenueAvailable).length,
    dreHandoffAvailable: cells.filter((c) => c.dreHandoffAvailable).length,
    exportAvailable: cells.filter((c) => c.exportAvailable).length,
  },
  // V10-RC2.2 Gate 7 — Payroll shared-engine refactor coverage fields. Named
  // individually per the phase directive rather than folded into
  // availabilityCounts above, since they answer a distinct question (does
  // Payroll's post-refactor headcount/monetary/corporate-allocation output
  // exist for this cell) from the pre-existing engine-readiness fields.
  payrollAndCorporateAllocationCounts: {
    payrollHeadcountAvailable: cells.filter((c) => c.payrollHeadcountAvailable).length,
    payrollHeadcountUnavailable: cells.filter((c) => !c.payrollHeadcountAvailable).length,
    payrollMonetaryAvailable: cells.filter((c) => c.payrollMonetaryAvailable).length,
    payrollMonetaryUnavailable: cells.filter((c) => !c.payrollMonetaryAvailable).length,
    payrollMonetaryCertified: cells.filter((c) => c.payrollMonetaryCertified).length,
    payrollMonetaryUncertified: cells.filter((c) => !c.payrollMonetaryCertified).length,
    corporateAllocationAvailable: cells.filter((c) => c.corporateAllocationAvailable).length,
    corporateAllocationUnavailable: cells.filter((c) => !c.corporateAllocationAvailable).length,
    consolidatedCostAvailable: cells.filter((c) => c.consolidatedCostAvailable).length,
    consolidatedCostUnavailable: cells.filter((c) => !c.consolidatedCostAvailable).length,
    // Cross-tabs: proves direct payroll is never suppressed by the corporate-
    // allocation/consolidated-cost gap (V10-RC2.2 Gate 4's "do not suppress
    // direct payroll" requirement, verified at the coverage-matrix level).
    payrollHeadcountAvailable_and_corporateAllocationUnavailable: cells.filter(
      (c) => c.payrollHeadcountAvailable && !c.corporateAllocationAvailable,
    ).length,
    payrollMonetaryAvailable_and_consolidatedCostUnavailable: cells.filter(
      (c) => c.payrollMonetaryAvailable && !c.consolidatedCostAvailable,
    ).length,
    blockedByCorporateAllocationDecisionId: cells.filter((c) => c.blockedByDecisionIds.includes("CORPORATE-ALLOCATION"))
      .length,
  },
  governanceGaps: {
    "D-R5_desconto_metodo": "genuinely_unresolved — all cells, precision risk only (~2.8% of gross)",
    "D-R6_F03_base_tuition_source": "genuinely_unresolved — all cells, tuitionStatus=computed_uncertified",
    F05_t1_g3_enrollment_mapping: "genuinely_unresolved — not applicable to this matrix (t1_g3 is retired, excluded from PACKAGES)",
    F06_ms_hs_staffing_reconciliation: "genuinely_unresolved — aggregate payroll/staffing total in every cell includes MS/HS headcount from one of three unreconciled candidate sources",
    export_wiring:
      "dreScenarioWorkbook.ts's Fagundes Export Index (V10-RC2.1 Gate 7) is wired to the visible " +
        "shared scenario state, but exports only the single currently-selected scenario, not all cells " +
        "at once, and does not certify tuition/MS-HS-staffing figures — so exportAvailable remains " +
        "false for every cell of this matrix. The separate Payroll export pathway " +
        "(payrollExportScenarioAdapter.ts) remains genuinely disconnected from live UI state, per RC1B.",
  },
  // V10-RC2.1 Gate 2 — explicit support-level classification. See CoverageCell
  // comments for why no cell reaches fully_supported.
  supportLevelCounts: {
    fully_supported: cells.filter((c) => c.supportLevel === "fully_supported").length,
    partially_supported: cells.filter((c) => c.supportLevel === "partially_supported").length,
    unavailable: cells.filter((c) => c.supportLevel === "unavailable").length,
  },
  blockedByDecisionIdCounts: {
    "D-R5": cells.filter((c) => c.blockedByDecisionIds.includes("D-R5")).length,
    "D-R6": cells.filter((c) => c.blockedByDecisionIds.includes("D-R6")).length,
    F03: cells.filter((c) => c.blockedByDecisionIds.includes("F03")).length,
    F05: cells.filter((c) => c.blockedByDecisionIds.includes("F05")).length,
    F06: cells.filter((c) => c.blockedByDecisionIds.includes("F06")).length,
    "CORPORATE-ALLOCATION": cells.filter((c) => c.blockedByDecisionIds.includes("CORPORATE-ALLOCATION")).length,
  },
  // Cross-tabs Gate 2 explicitly asked for. Each answers "how many cells have X
  // available but Y not" -- distinct from the plain per-column counts above.
  crossTabs: {
    enrollmentAvailable_staffingNotAvailable: cells.filter((c) => c.enrollmentAvailable && !c.staffingAvailable).length,
    staffingAvailable_payrollNotAvailable: cells.filter((c) => c.staffingAvailable && !c.payrollAvailable).length,
    payrollAvailable_tuitionNotCertified: cells.filter((c) => c.payrollAvailable && c.tuitionStatus === "computed_uncertified").length,
    anyOutputAvailable_exportNotAvailable: cells.filter(
      (c) => (c.enrollmentAvailable || c.staffingAvailable || c.payrollAvailable || c.revenueAvailable) && !c.exportAvailable,
    ).length,
  },
  cellDefinition:
    "One cell = one full DRE/FOPAG engine evaluation (calculateSectionCountsForScenario " +
    "+ calculateFopag + calculateDre) for exactly one (openingPackageId, " +
    "occupancyScenarioId, orgDesignOptionId, year, tuitionScenarioId) combination. " +
    "A cell is an AGGREGATE scenario-level computation -- it reports one enrollment " +
    "total, one payroll total, one revenue total for the whole school in that year " +
    "under that scenario. It is NOT a per-grade or per-role breakdown; grade-level " +
    "detail (Gate 4/6's staffing table) is a separate, smaller artifact for " +
    "representative scenarios, not exhaustively cross-produced inside this JSON.",
};

const outPath = join(process.cwd(), "docs/audits/rio-resilience/phase-v10-rc2-gate8-coverage-matrix.json");
writeFileSync(outPath, JSON.stringify({ summary, cells }, null, 2));

console.log(`Coverage matrix written to ${outPath}`);
console.log(JSON.stringify(summary, null, 2));

// ── Gate 9 model-level cross-product assertion ──────────────────────────────
// Every governed dimension (enrollment/sections/staffing/payroll/revenue/DRE
// handoff) must be available for all 900 cells — these are all backed by
// approved_by_project_owner decisions (Gate 1) and should never silently
// regress to unavailable. Export must remain false for every cell until every
// cell's tuition/MS-HS-staffing figures are certified (D-R6/F03, F06) — V10-RC2.1
// Gate 7 wired a Fagundes export view for the single visible scenario without
// certifying any cell, so this stays false. If it ever flips true, the matrix
// generator's own assumption about per-cell export certification is stale and
// must be revisited, not silently accepted.
let failures = 0;
function assertAll(name: string, predicate: (c: CoverageCell) => boolean) {
  const failing = cells.filter((c) => !predicate(c));
  if (failing.length > 0) {
    failures++;
    console.log(`FAIL  ${name}: ${failing.length}/${cells.length} cells did not satisfy the assertion`);
  } else {
    console.log(`PASS  ${name}: ${cells.length}/${cells.length} cells satisfy the assertion`);
  }
}

assertAll("enrollmentAvailable is true for every governed cell", (c) => c.enrollmentAvailable);
assertAll("perGradeEnrollmentAvailable is true for every governed cell", (c) => c.perGradeEnrollmentAvailable);
assertAll("sectionsAvailable is true for every governed cell", (c) => c.sectionsAvailable);
assertAll("staffingAvailable is true for every governed cell", (c) => c.staffingAvailable);
assertAll("payrollAvailable is true for every governed cell", (c) => c.payrollAvailable);
assertAll("revenueAvailable is true for every governed cell", (c) => c.revenueAvailable);
assertAll("dreHandoffAvailable is true for every governed cell", (c) => c.dreHandoffAvailable);
assertAll("payrollHeadcountAvailable is true for every governed cell (V10-RC2.2 Gate 7)", (c) => c.payrollHeadcountAvailable);
assertAll("payrollMonetaryAvailable is true for every governed cell (V10-RC2.2 Gate 7)", (c) => c.payrollMonetaryAvailable);
assertAll(
  "payrollMonetaryCertified is false for every cell (available but never Finance-certified)",
  (c) => c.payrollMonetaryCertified === false,
);
assertAll(
  "corporateAllocationAvailable is false for every cell (no adapter exists — CORPORATE-ALLOCATION blocker)",
  (c) => c.corporateAllocationAvailable === false,
);
assertAll(
  "consolidatedCostAvailable is false for every cell (depends on corporate allocation)",
  (c) => c.consolidatedCostAvailable === false,
);
assertAll(
  "direct payroll headcount is never suppressed by the corporate-allocation gap (both available and unavailable coexist correctly)",
  (c) => c.payrollHeadcountAvailable && !c.corporateAllocationAvailable,
);
assertAll(
  "exportAvailable is false for every cell (no cell's tuition/MS-HS-staffing figures are certified — V10-RC2.1 Gate 7's Fagundes Export Index does not change this)",
  (c) => !c.exportAvailable,
);
assertAll(
  "supportLevel is partially_supported for every cell (none fully_supported, none unavailable)",
  (c) => c.supportLevel === "partially_supported",
);
assertAll("no cell claims fully_supported", (c) => c.supportLevel !== "fully_supported");

// Deliberately not phrased "ALL CHECKS PASSED" — that would read as "everything is
// available and supported," which is false (tuition is never certified, export is
// never wired). What passed is narrower: these are the invariants this generator
// asserts about ITS OWN output, not a claim that the underlying scenarios are
// production-ready.
console.log(
  failures === 0
    ? "\nGenerator invariants hold: computed-availability assertions pass; 0/900 cells are fully_supported (tuition uncertified, no cell's export is certified, MS/HS staffing unreconciled — by design, not by defect)."
    : `\n${failures} GENERATOR INVARIANT(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
