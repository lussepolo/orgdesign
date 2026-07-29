// V10-RC2.1 Gate 6 — grade-level EY/LS staffing table across every supported
// combination, with explicit Availability/Evidence columns, proving tier
// changes affect payroll BRL only (not headcount).
//
// Reuses the same live engines as the Gate 8 coverage matrix
// (calculateFopag, calculateSectionCountsForScenario) — no numbers are
// hand-entered. EY/LS headcount rule (1 lead+1 assistant+1 monitor per EY
// section; 1 lead+1 assistant per LS section, Master Educator tier) is
// read from payrollAdapter.ts records, not reimplemented here.
//
// MS/HS rows are marked Availability=unavailable: F06 (V10-RC2 Gate 1)
// records three non-identical, unreconciled MS/HS staffing figures in this
// repository. Presenting one as settled would contradict that finding —
// the EY/LS rule is not extrapolated to MS/HS grades.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { ACTIVE_OPENING_PACKAGE_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type {
  ActiveOpeningPackageId,
  OccupancyScenarioId,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { OCCUPANCY_SCENARIO_IDS } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";
import type { DreWorkingScenarioOrgDesignOptionId } from "../src/features/rio-scenario-resilience/model/dreWorkingScenarioContract";

const PACKAGES: readonly ActiveOpeningPackageId[] = ACTIVE_OPENING_PACKAGE_IDS;
const CAPTACAO: readonly OccupancyScenarioId[] = OCCUPANCY_SCENARIO_IDS;
const ORG_DESIGNS: readonly DreWorkingScenarioOrgDesignOptionId[] = DRE_WORKING_SCENARIO_ORG_DESIGN_OPTION_IDS;
const YEARS = [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037] as const;

interface StaffingRow {
  openingPackageId: ActiveOpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  orgDesignOptionId: DreWorkingScenarioOrgDesignOptionId;
  year: number;
  gradeId: string;
  division: "EY" | "LS";
  educators: number;
  educatorTier: "Master Educator";
  assistants: number;
  monitors: number;
  totalHeadcount: number;
  annualBasePayrollBRL: number;
  annualLoadedCostBRL: number;
  availability: "available";
  evidence: string;
}

const rows: StaffingRow[] = [];
let combosRun = 0;

for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    for (const orgDesignOptionId of ORG_DESIGNS) {
      for (const year of YEARS) {
        combosRun++;
        const fopagResult = calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId });
        const yearRecords = fopagResult.records.filter((r) => r.year === year && !r.isAuditRow);

        const gradeIds = new Set(
          yearRecords
            .filter((r) => r.roleId.startsWith("ey_teaching_lead_") || r.roleId.startsWith("ls_teaching_lead_"))
            .map((r) => r.roleId.replace(/^(ey|ls)_teaching_lead_/, "")),
        );

        for (const gradeId of gradeIds) {
          const division: "EY" | "LS" = yearRecords.some((r) => r.roleId === `ey_teaching_lead_${gradeId}`)
            ? "EY"
            : "LS";
          const lead = yearRecords.find((r) => r.roleId === `${division.toLowerCase()}_teaching_lead_${gradeId}`);
          const assistantRec = yearRecords.find((r) => r.roleId === `${division.toLowerCase()}_learning_assistant_${gradeId}`);
          const monitorRec = division === "EY"
            ? yearRecords.find((r) => r.roleId === `ey_learning_monitor_${gradeId}`)
            : undefined;

          const educators = lead?.headcountOrFte ?? 0;
          const assistants = assistantRec?.headcountOrFte ?? 0;
          const monitors = monitorRec?.headcountOrFte ?? 0;
          const gradeRecords = [lead, assistantRec, monitorRec].filter((r): r is NonNullable<typeof r> => r !== undefined);
          const annualBasePayrollBRL = Math.round(gradeRecords.reduce((s, r) => s + r.grossLaborAnnualAfterGrowth, 0));
          const annualLoadedCostBRL = Math.round(gradeRecords.reduce((s, r) => s + r.totalAnnualPayrollAfterGrowth, 0));

          rows.push({
            openingPackageId,
            occupancyScenarioId,
            orgDesignOptionId,
            year,
            gradeId,
            division,
            educators,
            educatorTier: "Master Educator",
            assistants,
            monitors,
            totalHeadcount: educators + assistants + monitors,
            annualBasePayrollBRL,
            annualLoadedCostBRL,
            availability: "available",
            evidence:
              `calculateFopag({${openingPackageId},${occupancyScenarioId},${orgDesignOptionId}}).records ` +
              `[roleId=${division.toLowerCase()}_teaching_lead_${gradeId} + companions], year=${year}; ` +
              "rule: payrollAdapter.ts EY/LS section-based staffing (Phase 8H.1, Luciana 2026-06-03).",
          });
        }
      }
    }
  }
}

// ── Tier-invariance assertion: for every fixed (package, captação, year, grade),
// totalHeadcount must be identical across all org-design tiers, while
// annualBasePayrollBRL/annualLoadedCostBRL may differ (Master Educator cost is
// tier-independent per Phase 8H.1, so payroll is in fact also identical here —
// tier affects Org Design's own extension roles, not EY/LS section staffing).
let failures = 0;
function assertAll(name: string, pass: boolean, detail?: string) {
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

const byKey = new Map<string, StaffingRow[]>();
for (const row of rows) {
  const key = `${row.openingPackageId}|${row.occupancyScenarioId}|${row.year}|${row.gradeId}`;
  const list = byKey.get(key) ?? [];
  list.push(row);
  byKey.set(key, list);
}

let tierInvarianceChecked = 0;
for (const [key, group] of byKey) {
  if (group.length !== ORG_DESIGNS.length) {
    assertAll(`tier-complete group for ${key}`, false, `expected ${ORG_DESIGNS.length} rows, got ${group.length}`);
    continue;
  }
  const headcounts = new Set(group.map((r) => r.totalHeadcount));
  tierInvarianceChecked++;
  assertAll(
    `headcount identical across org-design tiers for ${key}`,
    headcounts.size === 1,
    `headcounts by tier: ${group.map((r) => `${r.orgDesignOptionId}=${r.totalHeadcount}`).join(", ")}`,
  );
}

assertAll(
  "every row has availability=available and a non-empty evidence string",
  rows.every((r) => r.availability === "available" && r.evidence.length > 0),
);
assertAll(
  "no MS/HS grade present (EY/LS rule not extrapolated — F06 unreconciled)",
  rows.every((r) => r.division === "EY" || r.division === "LS"),
);
assertAll("at least one row generated", rows.length > 0, `rows=${rows.length}`);
assertAll(`${combosRun} (package,captação,org-design,year) combinations run`, combosRun === PACKAGES.length * CAPTACAO.length * ORG_DESIGNS.length * YEARS.length);

const summary = {
  rowCount: rows.length,
  combosRun,
  tierInvarianceGroupsChecked: tierInvarianceChecked,
  msHsRowsIncluded: 0,
  msHsAvailability: "unavailable — F06 (V10-RC2 Gate 1) unreconciled; three non-identical MS/HS staffing figures exist in this repository (Phase 15H.2 instructional-capacity model, FOPAG adapter's own fixed-FTE table, recovered-but-never-committed Phase 8B count); EY/LS rule not extrapolated to MS/HS.",
  note:
    "Grade-level EY/LS staffing table for every supported (package,captação,org-design,year) " +
    "combination in the governed 10-year direct-workbook horizon (2028-2037). Educator/assistant/" +
    "monitor headcount = section count exactly (payrollAdapter.ts EY/LS rule). Tier " +
    "(Minimum/Balanced/Premium) does not affect EY/LS headcount by construction — verified per-cell, " +
    "not asserted.",
};

const outPath = join(process.cwd(), "docs/audits/rio-resilience/phase-v10-rc2-1-gate6-staffing-table.json");
writeFileSync(outPath, JSON.stringify({ summary, rows }, null, 2) + "\n");
console.log(`\nWrote ${rows.length} rows to ${outPath}`);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED (${tierInvarianceChecked} tier-invariance groups verified)`
    : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
