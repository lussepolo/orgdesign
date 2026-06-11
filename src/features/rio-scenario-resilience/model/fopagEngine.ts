import { buildPayrollAdapterInput } from "./payrollAdapter";
import { resolveGrowthFactor, roundCurrency } from "../../../lib/payroll/core";
import { ANNUAL_ADJUSTMENT } from "../../../constants";
import { SIMULATOR_PROJECTION_YEARS } from "./simulatorProjectionHorizonContract";
import type {
  FopagByRoleSourceTypeEntry,
  FopagCalculatedRecord,
  FopagEngineDiagnostic,
  FopagEngineDiagnosticType,
  FopagEngineInput,
  FopagEngineOutput,
  FopagYearTotals,
} from "./fopagEngineContract";
import type { PayrollAdapterDiagnosticType } from "./payrollAdapterContract";

// Approved v1 base year for payroll growth formula (Phase 8E, Luciana 2026-06-03).
// resolveGrowthFactor(year, GROWTH_BASE_YEAR, ANNUAL_ADJUSTMENT) = Math.pow(1.06, year - 2028 + 1).
// 2028 → 1.06; 2029 → 1.1236. Formula continues through 2047 (Phase 11B).
const GROWTH_BASE_YEAR = 2028 as const;

// Full 20-year simulator horizon: 2028–2047.
// 2028–2037: direct workbook years. 2038–2047: mature-state carry-forward.
const PROJECTION_YEARS = SIMULATOR_PROJECTION_YEARS;

// Adapter diagnostic types that block calculationReady=true in this engine.
const BLOCKING_ADAPTER_DIAGNOSTIC_TYPES = new Set<PayrollAdapterDiagnosticType>([
  "missing_cost_source",
  "missing_headcount_source",
  "missing_allocation_model",
  "unsupported_org_design_option",
]);

export function calculateFopag(input: FopagEngineInput): FopagEngineOutput {
  const { openingPackageId, occupancyScenarioId, orgDesignOptionId } = input;

  // ── Step 1: Get adapter output ──────────────────────────────────────────────
  // Do not bypass the adapter. All staffing records come from buildPayrollAdapterInput().
  const adapterOutput = buildPayrollAdapterInput({
    openingPackageId,
    occupancyScenarioId,
    orgDesignOptionId,
  });

  const engineDiagnostics: FopagEngineDiagnostic[] = [];
  let hasBlockingDiagnostic = false;

  // ── Step 2: Check adapter-level status ──────────────────────────────────────
  if (adapterOutput.adapterStatus !== "assembled") {
    hasBlockingDiagnostic = true;
    const dType: FopagEngineDiagnosticType =
      adapterOutput.adapterStatus === "failed_unsupported_option"
        ? "adapter_failed_unsupported_option"
        : "adapter_partial_missing_cost";
    engineDiagnostics.push({
      diagnosticType: dType,
      isBlocking: true,
      roleId: "adapter_status",
      roleName: "Adapter Status",
      message:
        `Adapter returned adapterStatus="${adapterOutput.adapterStatus}". ` +
        `Calculation cannot reach calculationReady=true with this adapter state.`,
    });
  }

  // ── Step 3: Propagate adapter diagnostics, classify blocking vs non-blocking ─
  for (const d of adapterOutput.diagnostics) {
    const isBlocking = BLOCKING_ADAPTER_DIAGNOSTIC_TYPES.has(d.diagnosticType);
    if (isBlocking) hasBlockingDiagnostic = true;
    engineDiagnostics.push({
      diagnosticType: d.diagnosticType,
      isBlocking,
      roleId: d.roleId,
      roleName: d.roleName,
      year: d.year,
      message: d.message,
    });
  }

  // ── Step 4: Scan records for null cost / headcount / allocationModel ─────────
  // These conditions are blocking: we cannot bucket or annualize a record with
  // missing values. Each is captured as a blocking diagnostic; the record is then
  // skipped in the calculation pass below.
  for (const rec of adapterOutput.records) {
    if (
      rec.grossMonthly === null ||
      rec.laborChargesMonthly === null ||
      rec.benefitsMonthly === null
    ) {
      hasBlockingDiagnostic = true;
      engineDiagnostics.push({
        diagnosticType: "null_cost_in_record",
        isBlocking: true,
        roleId: rec.roleId,
        roleName: rec.roleName,
        year: rec.year,
        message:
          `Record "${rec.roleId}" (year=${rec.year}) has one or more null monthly cost components. ` +
          `Cannot annualize. This record is excluded from calculated output.`,
      });
    } else if (rec.headcountOrFte === null) {
      hasBlockingDiagnostic = true;
      engineDiagnostics.push({
        diagnosticType: "null_headcount_in_record",
        isBlocking: true,
        roleId: rec.roleId,
        roleName: rec.roleName,
        year: rec.year,
        message:
          `Record "${rec.roleId}" (year=${rec.year}) has null headcountOrFte. ` +
          `Cannot annualize. This record is excluded from calculated output.`,
      });
    } else if (rec.allocationModel === null) {
      hasBlockingDiagnostic = true;
      engineDiagnostics.push({
        diagnosticType: "null_allocationModel_in_record",
        isBlocking: true,
        roleId: rec.roleId,
        roleName: rec.roleName,
        year: rec.year,
        message:
          `Record "${rec.roleId}" (year=${rec.year}) has null allocationModel. ` +
          `Cannot bucket into FOPAG_DIRETO or FOLHA_DIRETA. ` +
          `This record is excluded from calculated output.`,
      });
    }
  }

  // ── Step 5: Compute calculated records ──────────────────────────────────────
  // calculationReady is now deterministic: no further blocking conditions can arise.
  const calculationReady = !hasBlockingDiagnostic;
  const calculatedRecords: FopagCalculatedRecord[] = [];

  for (const rec of adapterOutput.records) {
    // Skip records with any null cost/headcount/allocationModel — captured above.
    if (
      rec.grossMonthly === null ||
      rec.laborChargesMonthly === null ||
      rec.benefitsMonthly === null ||
      rec.headcountOrFte === null ||
      rec.allocationModel === null
    ) {
      continue;
    }

    // isAuditRow: included for completeness but not added to allocation totals.
    const isAuditRow = !rec.active || rec.headcountOrFte === 0;

    // Growth factor: resolveGrowthFactor(year, 2028, 1.06).
    // activeFrom=2028 ensures the guard year < activeFrom never suppresses a projection year.
    // Inactivity is already expressed by headcountOrFte=0 (isAuditRow=true).
    const payrollGrowthFactor = resolveGrowthFactor(
      rec.year,
      GROWTH_BASE_YEAR,
      ANNUAL_ADJUSTMENT,
    );

    const grossLaborAnnualBeforeGrowth = roundCurrency(
      (rec.grossMonthly + rec.laborChargesMonthly) * 13 * rec.headcountOrFte,
    );
    const benefitsAnnualBeforeGrowth = roundCurrency(
      rec.benefitsMonthly * 12 * rec.headcountOrFte,
    );
    const grossLaborAnnualAfterGrowth = roundCurrency(
      grossLaborAnnualBeforeGrowth * payrollGrowthFactor,
    );
    const benefitsAnnualAfterGrowth = roundCurrency(
      benefitsAnnualBeforeGrowth * payrollGrowthFactor,
    );
    const totalAnnualPayrollAfterGrowth = roundCurrency(
      grossLaborAnnualAfterGrowth + benefitsAnnualAfterGrowth,
    );

    calculatedRecords.push({
      openingPackageId,
      occupancyScenarioId,
      orgDesignOptionId,
      year: rec.year,
      roleId: rec.roleId,
      payrollRoleId: rec.payrollRoleId,
      roleName: rec.roleName,
      roleSourceType: rec.roleSourceType,
      allocationModel: rec.allocationModel,
      headcountOrFte: rec.headcountOrFte,
      grossMonthly: rec.grossMonthly,
      laborChargesMonthly: rec.laborChargesMonthly,
      benefitsMonthly: rec.benefitsMonthly,
      payrollGrowthFactor,
      grossLaborAnnualBeforeGrowth,
      benefitsAnnualBeforeGrowth,
      grossLaborAnnualAfterGrowth,
      benefitsAnnualAfterGrowth,
      totalAnnualPayrollAfterGrowth,
      isAuditRow,
      diagnostics: rec.diagnostics,
      sourceNotes: rec.sourceNotes,
    });
  }

  // ── Step 6: Year totals ──────────────────────────────────────────────────────
  // FOPAG_DIRETO = sum grossLaborAnnualAfterGrowth for FOPAG_DIRETO active records.
  // FOLHA_DIRETA = sum grossLaborAnnualAfterGrowth for FOLHA_DIRETA active records.
  // BENEFITS = sum benefitsAnnualAfterGrowth for all active records.
  // TOTAL_PAYROLL = FOPAG_DIRETO + FOLHA_DIRETA + BENEFITS.
  // Audit rows (headcountOrFte=0 / inactive) are counted but not added to totals.
  // hs_pool and alias roles are not present in calculatedRecords — the adapter
  // already excludes hs_pool (excluded_from_v1) and emits no cost record for aliases.

  const yearTotals: FopagYearTotals[] = PROJECTION_YEARS.map((year) => {
    const yearRecords = calculatedRecords.filter((r) => r.year === year);
    const activeRecords = yearRecords.filter((r) => !r.isAuditRow);

    let fopagDireto = 0;
    let folhaDireta = 0;
    let benefits = 0;

    const bySourceTypeMap = new Map<string, FopagByRoleSourceTypeEntry>();

    for (const r of activeRecords) {
      const grossLabor = r.grossLaborAnnualAfterGrowth;
      const ben = r.benefitsAnnualAfterGrowth;

      if (r.allocationModel === "FOPAG_DIRETO") {
        fopagDireto = roundCurrency(fopagDireto + grossLabor);
      } else {
        folhaDireta = roundCurrency(folhaDireta + grossLabor);
      }
      benefits = roundCurrency(benefits + ben);

      const existing = bySourceTypeMap.get(r.roleSourceType);
      if (existing) {
        if (r.allocationModel === "FOPAG_DIRETO") {
          existing.fopagDireto = roundCurrency(existing.fopagDireto + grossLabor);
        } else {
          existing.folhaDireta = roundCurrency(existing.folhaDireta + grossLabor);
        }
        existing.benefits = roundCurrency(existing.benefits + ben);
        existing.totalPayroll = roundCurrency(
          existing.fopagDireto + existing.folhaDireta + existing.benefits,
        );
      } else {
        bySourceTypeMap.set(r.roleSourceType, {
          roleSourceType: r.roleSourceType,
          fopagDireto: r.allocationModel === "FOPAG_DIRETO" ? grossLabor : 0,
          folhaDireta: r.allocationModel === "FOLHA_DIRETA" ? grossLabor : 0,
          benefits: ben,
          totalPayroll: r.totalAnnualPayrollAfterGrowth,
        });
      }
    }

    const totalPayroll = roundCurrency(fopagDireto + folhaDireta + benefits);

    return {
      year,
      fopagDireto,
      folhaDireta,
      benefits,
      totalPayroll,
      recordCount: activeRecords.length,
      auditRowCount: yearRecords.length - activeRecords.length,
      byRoleSourceType: Array.from(bySourceTypeMap.values()),
    };
  });

  // ── Step 7: Final summary ────────────────────────────────────────────────────
  const blockingDiagnosticCount = engineDiagnostics.filter((d) => d.isBlocking).length;
  const nonBlockingDiagnosticCount = engineDiagnostics.filter((d) => !d.isBlocking).length;

  const engineStatus: FopagEngineOutput["engineStatus"] = calculationReady
    ? "calculation_ready"
    : adapterOutput.adapterStatus === "failed_unsupported_option"
      ? "failed_adapter_error"
      : "partial_blocking_diagnostic";

  return {
    openingPackageId,
    occupancyScenarioId,
    orgDesignOptionId,
    engineStatus,
    calculationReady,
    adapterStatus: adapterOutput.adapterStatus,
    records: calculatedRecords,
    yearTotals,
    diagnostics: engineDiagnostics,
    blockingDiagnosticCount,
    nonBlockingDiagnosticCount,
    implementationNote:
      "Phase 8I FOPAG calculation engine (2026-06-03). " +
      "Phase 11B (2026-06-07): extended to full simulator horizon 2028–2047. " +
      "Computes FOPAG_DIRETO, FOLHA_DIRETA, BENEFITS, and TOTAL_PAYROLL annual totals by year. " +
      "Growth formula: resolveGrowthFactor(year, 2028, ANNUAL_ADJUSTMENT=1.06) from src/lib/payroll/core.ts — " +
      "yields Math.pow(1.06, year - 2028 + 1): 2028→1.06, 2029→1.1236, 2047→...; continues through 2047. " +
      "Annualization: (grossMonthly + laborChargesMonthly) × 13 × hc before growth; benefitsMonthly × 12 × hc before growth. " +
      "FOPAG_DIRETO = sum grossLaborAnnualAfterGrowth for FOPAG_DIRETO records. " +
      "FOLHA_DIRETA = sum grossLaborAnnualAfterGrowth for FOLHA_DIRETA records. " +
      "BENEFITS = sum benefitsAnnualAfterGrowth for all active records. " +
      "TOTAL_PAYROLL = FOPAG_DIRETO + FOLHA_DIRETA + BENEFITS. " +
      "hs_pool excluded_from_v1 (not present in adapter records — adapter excludes it). " +
      "Alias roles not double-counted (adapter emits alias_no_additional_cost, no cost record produced). " +
      "sectionOverflow diagnostics propagated as non-blocking. " +
      "FOPAG/Receita ratio: NOT calculated. EBITDA, CAPEX, OPEX, Service Contracts, NPV, payback, Tier: NOT implemented. " +
      "CALCULATION_CAN_BEGIN remains false (full board model not complete).",
    sourceNotes:
      "Phase 8I FOPAG engine implementation (2026-06-03). Approved: Luciana 2026-06-03. " +
      "Phase 11B (2026-06-07): 2038–2047 powered by mature-state carry-forward from 2037 baseline. " +
      "Consumes payrollAdapter.ts buildPayrollAdapterInput() output — do not bypass adapter. " +
      "Finance-validated payroll growth convention (ANNUAL_ADJUSTMENT=1.06, base year=2028, Phase 8E). " +
      "calculationReady is scenario-specific: true when adapter returns 'assembled' and no blocking diagnostics exist. " +
      "CALCULATION_CAN_BEGIN remains false pending complete board model (Receita, OPEX/CAPEX, EBITDA, governance layers).",
  };
}
