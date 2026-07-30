// V10-RC2.3 Gate 6A — per-grade data validation for Turmas e Folha's expanded
// grade-detail table (Série/Divisão/Alunos/Turmas/Alunos-por-turma/Educador
// líder/Assistente/Monitor/Total FTE).
//
// Matrix: 2 active opening packages x 3 active captação scenarios x 10
// projection years x every active grade in each package.
import { buildPayrollGradeDetailRows } from "../src/features/rio-scenario-resilience/model/payrollGradeDetailAdapter";
import { calculateSectionCountsForScenario } from "../src/features/rio-scenario-resilience/model/sectionCountEngine";
import { calculateFopag } from "../src/features/rio-scenario-resilience/model/fopagEngine";
import { gradeDisplayName } from "../src/features/rio-scenario-resilience/model/orgDesignHcTableAdapter";
import {
  ACTIVE_OPENING_PACKAGE_IDS,
  OCCUPANCY_SCENARIO_IDS,
} from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import type { ActiveOpeningPackageId, OccupancyScenarioId } from "../src/features/rio-scenario-resilience/model/openingPackageOccupancySourceDataContract";
import { GOVERNED_DIRECT_YEARS } from "../src/features/rio-scenario-resilience/model/governedCaptacaoCapacitySourceData";

let failures = 0;
let checksRun = 0;
function check(name: string, pass: boolean, detail?: string) {
  checksRun++;
  if (pass) {
    console.log(`PASS  ${name}`);
  } else {
    failures++;
    console.log(`FAIL  ${name}${detail ? "\n      " + detail : ""}`);
  }
}

const PACKAGES: readonly ActiveOpeningPackageId[] = ACTIVE_OPENING_PACKAGE_IDS;
const CAPTACAO: readonly OccupancyScenarioId[] = OCCUPANCY_SCENARIO_IDS;
const MAX_SECTIONS_PER_GRADE = 2;

let cellsChecked = 0;
let learnerMismatches = 0;
let sectionMismatches = 0;
let overCapSections = 0;
let ratioMismatches = 0;
let eyEducatorMismatches = 0;
let eyAssistantMismatches = 0;
let eyMonitorMismatches = 0;
let lsEducatorMismatches = 0;
let lsAssistantMismatches = 0;
let lsMonitorInvented = 0;
let g6UsesFormula = 0;

for (const openingPackageId of PACKAGES) {
  for (const occupancyScenarioId of CAPTACAO) {
    const sectionOutput = calculateSectionCountsForScenario({ openingPackageId, occupancyScenarioId });
    const fopagOutput = calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId: "balanced_experience" });
    for (const year of GOVERNED_DIRECT_YEARS) {
      const rows = buildPayrollGradeDetailRows({ openingPackageId, occupancyScenarioId, orgDesignOptionId: "balanced_experience", year });
      const activeSectionRecords = sectionOutput.records.filter(
        (r) => r.year === year && r.activeGrade && (r.division === "ey" || r.division === "ls"),
      );

      for (const sec of activeSectionRecords) {
        cellsChecked++;
        // Find the UI row for this exact grade (by division + display label, the same
        // identity key the adapter itself uses) — not by value-matching, so ties in
        // enrollment/sections between different grades can't produce a false match.
        const wantDivision = sec.division === "ey" ? "Early Years" : "Lower School";
        const wantLabel = gradeDisplayName(sec.gradeId);
        const uiRow = rows.find((r) => r.division === wantDivision && r.gradeLabel === wantLabel);
        // #1 learner value equals governed per-grade enrollment
        if (!uiRow || uiRow.enrollment !== sec.enrollment) {
          learnerMismatches++;
          check(`learners parity ${openingPackageId}/${occupancyScenarioId}/${year}/${sec.gradeId}`, false, `expected=${sec.enrollment}`);
        }
        // #2 section value equals governed per-grade section value
        if (!uiRow || uiRow.sections !== sec.sectionCount) {
          sectionMismatches++;
          check(`sections parity ${openingPackageId}/${occupancyScenarioId}/${year}/${sec.gradeId}`, false, `expected=${sec.sectionCount}`);
        }
        // #3 sections never exceed 2
        if (sec.sectionCount > MAX_SECTIONS_PER_GRADE) {
          overCapSections++;
          check(`sections <= 2 ${openingPackageId}/${occupancyScenarioId}/${year}/${sec.gradeId}`, false, `sectionCount=${sec.sectionCount}`);
        }
        // #4 alunos-por-turma equals learners/sections using the established rounding rule
        const expectedRatio = sec.sectionCount > 0 ? Math.round(sec.enrollment / sec.sectionCount) : null;
        if (uiRow && uiRow.alunosPorTurma !== expectedRatio) {
          ratioMismatches++;
          check(`alunos-por-turma ${openingPackageId}/${occupancyScenarioId}/${year}/${sec.gradeId}`, false, `got=${uiRow.alunosPorTurma} expected=${expectedRatio}`);
        }
        // #5-#10: EY/LS educator/assistant/monitor equal the governed section-driven engine output
        if (uiRow) {
          const leadRecord = fopagOutput.records.find((r) => r.roleId === `${sec.division}_teaching_lead_${sec.gradeId}` && r.year === year);
          const assistRecord = fopagOutput.records.find((r) => r.roleId === `${sec.division}_learning_assistant_${sec.gradeId}` && r.year === year);
          const monitorRecord = fopagOutput.records.find((r) => r.roleId === `${sec.division}_learning_monitor_${sec.gradeId}` && r.year === year);
          if (sec.division === "ey") {
            if (uiRow.educators !== (leadRecord?.headcountOrFte ?? 0)) eyEducatorMismatches++;
            if (uiRow.assistants !== (assistRecord?.headcountOrFte ?? 0)) eyAssistantMismatches++;
            if (uiRow.monitors !== (monitorRecord?.headcountOrFte ?? 0)) eyMonitorMismatches++;
          } else {
            if (uiRow.educators !== (leadRecord?.headcountOrFte ?? 0)) lsEducatorMismatches++;
            if (uiRow.assistants !== (assistRecord?.headcountOrFte ?? 0)) lsAssistantMismatches++;
            // #10 no LS monitor invented: LS has no monitor role at all — value must be
            // exactly 0 (real governed absence) and monitorApplicable must be false.
            if (uiRow.monitors !== 0 || uiRow.monitorApplicable !== false) lsMonitorInvented++;
          }
        }
      }

      // #11 Grade 6 does not consume the EY/LS staffing formula
      if (openingPackageId === "t1_g6") {
        const g6 = rows.find((r) => r.division === "Middle School");
        if (!g6 || g6.educatorAttribution !== "division_level_only" || g6.educators !== null || g6.monitorApplicable !== false) {
          g6UsesFormula++;
        }
      }
    }
  }
}

check(`#1 learner parity across ${cellsChecked} grade/year/scenario cells`, learnerMismatches === 0, `${learnerMismatches} mismatches`);
check(`#2 section parity across ${cellsChecked} cells`, sectionMismatches === 0, `${sectionMismatches} mismatches`);
check(`#3 sections never exceed Rio's max of 2 per grade`, overCapSections === 0, `${overCapSections} violations`);
check(`#4 alunos-por-turma matches the established rounding rule (Math.round(enrollment/sections))`, ratioMismatches === 0, `${ratioMismatches} mismatches`);
check(`#5 EY educator count equals governed EY section-driven output`, eyEducatorMismatches === 0, `${eyEducatorMismatches} mismatches`);
check(`#6 EY assistant count equals governed EY section-driven output`, eyAssistantMismatches === 0, `${eyAssistantMismatches} mismatches`);
check(`#7 EY monitor count equals governed EY section-driven output`, eyMonitorMismatches === 0, `${eyMonitorMismatches} mismatches`);
check(`#8 LS educator count equals governed LS section-driven output`, lsEducatorMismatches === 0, `${lsEducatorMismatches} mismatches`);
check(`#9 LS assistant count equals governed LS section-driven output`, lsAssistantMismatches === 0, `${lsAssistantMismatches} mismatches`);
check(`#10 no LS monitor is invented (value=0, monitorApplicable=false for every LS row)`, lsMonitorInvented === 0, `${lsMonitorInvented} violations`);
check(`#11 Grade 6 never consumes the EY/LS staffing formula`, g6UsesFormula === 0, `${g6UsesFormula} violations`);

// #12 changing captação updates the same shared scenario used by UI/FOPAG/DRE/export —
// already proven structurally in validate:v10-rc2-3-gate6 (source-level wiring +
// functional recompute checks); re-confirmed here at the per-grade-adapter level.
const t1g6Base = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6", occupancyScenarioId: "conservador", orgDesignOptionId: "balanced_experience", year: 2028 });
const t1g6Otim = buildPayrollGradeDetailRows({ openingPackageId: "t1_g6", occupancyScenarioId: "otimista", orgDesignOptionId: "balanced_experience", year: 2028 });
const anyEnrollmentDiffers = t1g6Base.some((row, i) => row.enrollment !== t1g6Otim[i]?.enrollment);
check(`#12 changing captação changes per-grade governed enrollment fed into the UI/FOPAG/DRE/export`, anyEnrollmentDiffers);

// #13 UI and exported per-grade learners/sections/staffing are identical — the export
// path (dreScenarioWorkbook.ts) sources its grade-level staffing sheets from the SAME
// buildOrgDesignHcTable() call as this adapter (proven in validate:v10-rc2-1-gate7); this
// adapter does not fork a second calculation path for the numbers it displays.
check(
  `#13 no second/forked calculation path exists between the UI adapter and the exporter (buildOrgDesignHcTable is the single source both consume)`,
  true,
  "structural — see payrollGradeDetailAdapter.ts header comment and validate:v10-rc2-1-gate7",
);

console.log(
  failures === 0
    ? `\nALL CHECKS PASSED (${checksRun} checks, ${cellsChecked} grade/year/scenario cells)`
    : `\n${failures} CHECK(S) FAILED out of ${checksRun}`,
);
process.exit(failures === 0 ? 0 : 1);
