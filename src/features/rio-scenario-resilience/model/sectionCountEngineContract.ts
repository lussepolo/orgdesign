import type {
  OccupancyScenarioId,
  OpeningPackageId,
} from "./openingPackageOccupancySourceDataContract";
import type { DivisionId } from "./revenueInputs";

export type SectionCountRecordStatus = "ok";

export type SectionCountDiagnosticStatus =
  | "diagnostic_missing_enrollment"
  | "diagnostic_missing_studentsPerClass";

export interface SectionCountEngineInput {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
}

export interface SectionCountRecord {
  status: SectionCountRecordStatus;
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  year: number;
  gradeId: string;
  division: DivisionId;
  activeGrade: boolean;
  enrollment: number;
  studentsPerClass: number;
  rawSections: number;
  sectionCount: number;
  maxSectionsPerGrade: 2;
  sectionOverflow: boolean;
  formulaBasis: string;
  capacityConstraintSource: string;
  sourceNotes: string;
}

export interface SectionCountDiagnostic {
  status: SectionCountDiagnosticStatus;
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  year: number;
  gradeId: string;
  reason: string;
}

export interface SectionCountEngineOutput {
  openingPackageId: OpeningPackageId;
  occupancyScenarioId: OccupancyScenarioId;
  records: SectionCountRecord[];
  diagnostics: SectionCountDiagnostic[];
}
