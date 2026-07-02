import { calculateFopag } from "./fopagEngine";
import type { FopagCalculatedRecord } from "./fopagEngineContract";

export interface OrgDesignHcTableRow {
  divisionArea: string;
  roleGroupOrHub: string;
  role: string;
  headcountOrFte: number;
  year: number;
  openingScenario: string;
  orgDesignVersion: string;
  sourceTypeLogic: string;
  notes: string;
}

export interface OrgDesignHcTableResult {
  rows: OrgDesignHcTableRow[];
  calculationReady: boolean;
  engineStatus: string;
}

const GRADE_DISPLAY_NAMES: Record<string, string> = {
  t1: "Toddlers 1",
  t2: "Toddlers 2",
  pk3: "Pre-K3",
  pk4: "Pre-K4",
  kindergarten: "Kindergarten",
  g1: "Grade 1",
  g2: "Grade 2",
  g3: "Grade 3",
  g4: "Grade 4",
  g5: "Grade 5",
  g6: "Grade 6",
};

// Roles that belong under the Learning Experience Design Hub umbrella in Balanced and Premium
const LED_HUB_ROLE_IDS = new Set(["led", "language_acquisition_coach", "personalized_learning_associate_educator"]);

// Board-facing display order within the Learning Experience Design Hub
const LED_HUB_ROLE_ORDER: Record<string, number> = {
  led: 0,
  language_acquisition_coach: 1,
  personalized_learning_associate_educator: 2,
};

const DIVISION_ORDER: Record<string, number> = {
  Leadership: 0,
  Operations: 1,
  "Learning Ecosystem": 2,
  "Learning Experience Design Hub": 3,
  "Early Years": 4,
  "Lower School": 5,
  "Middle School": 6,
  "High School": 7,
};

function gradeDisplayName(gradeId: string): string {
  return GRADE_DISPLAY_NAMES[gradeId] ?? gradeId;
}

function getBoardDisplayLabel(rec: FopagCalculatedRecord): string {
  if (rec.roleId === "secretary") return "Registrar";
  if (rec.roleId === "language_acquisition_coach") return "Language Acquisition and Performance Coach";
  if (rec.roleId === "led") return "Learning Experience Designer";

  const eyTl = rec.roleId.match(/^ey_teaching_lead_(.+)$/);
  if (eyTl) return `${gradeDisplayName(eyTl[1])} Reference Educator`;

  const eyLa = rec.roleId.match(/^ey_learning_assistant_(.+)$/);
  if (eyLa) return `${gradeDisplayName(eyLa[1])} Assistant`;

  const eyLm = rec.roleId.match(/^ey_learning_monitor_(.+)$/);
  if (eyLm) return `${gradeDisplayName(eyLm[1])} Monitor`;

  const lsTl = rec.roleId.match(/^ls_teaching_lead_(.+)$/);
  if (lsTl) return `${gradeDisplayName(lsTl[1])} Reference Educator`;

  const lsLa = rec.roleId.match(/^ls_learning_assistant_(.+)$/);
  if (lsLa) return `${gradeDisplayName(lsLa[1])} Assistant`;

  const msTl = rec.roleId.match(/^ms_teaching_lead_(.+)$/);
  if (msTl) return `${gradeDisplayName(msTl[1])} Reference Educator`;

  const hsTl = rec.roleId.match(/^hs_teaching_lead_(.+)$/);
  if (hsTl) return `${gradeDisplayName(hsTl[1])} Reference Educator`;

  return rec.roleName;
}

function getDivisionArea(rec: FopagCalculatedRecord, isHubActive: boolean): string {
  const { roleSourceType, roleId } = rec;

  if (roleSourceType === "baseline_leadership") return "Leadership";
  if (roleSourceType === "baseline_backoffice") return "Operations";
  if (roleSourceType === "baseline_specialist") {
    if (isHubActive && roleId === "led") return "Learning Experience Design Hub";
    return "Learning Ecosystem";
  }
  if (
    roleSourceType === "ey_teaching_lead" ||
    roleSourceType === "ey_learning_assistant" ||
    roleSourceType === "ey_learning_monitor"
  ) {
    return "Early Years";
  }
  if (roleSourceType === "ls_teaching_lead" || roleSourceType === "ls_learning_assistant") {
    return "Lower School";
  }
  if (roleSourceType === "ms_teaching_lead") return "Middle School";
  if (roleSourceType === "hs_teaching_lead") return "High School";
  if (roleSourceType === "extension_new_role") {
    if (isHubActive && LED_HUB_ROLE_IDS.has(roleId)) return "Learning Experience Design Hub";
    if (roleId === "events_assistant" || roleId === "security_coordinator") return "Operations";
    return "Learning Ecosystem";
  }
  return "Learning Ecosystem";
}

function getRoleGroupOrHub(rec: FopagCalculatedRecord, divisionArea: string): string {
  if (divisionArea === "Learning Experience Design Hub") return "Learning Experience Design Hub";

  const eyMatch = rec.roleId.match(/^ey_(?:teaching_lead|learning_assistant|learning_monitor)_(.+)$/);
  if (eyMatch) return `EY ${gradeDisplayName(eyMatch[1])} Team`;

  const lsMatch = rec.roleId.match(/^ls_(?:teaching_lead|learning_assistant)_(.+)$/);
  if (lsMatch) return `LS ${gradeDisplayName(lsMatch[1])} Team`;

  if (rec.roleSourceType === "ms_teaching_lead") return "Middle School Teaching Team";
  if (rec.roleSourceType === "hs_teaching_lead") return "High School Teaching Team";

  return divisionArea;
}

function getSourceTypeLabel(roleSourceType: string): string {
  const labels: Record<string, string> = {
    baseline_leadership: "Baseline – Leadership",
    baseline_backoffice: "Baseline – Back-Office",
    baseline_specialist: "Baseline – Specialist",
    extension_new_role: "Org Design Extension",
    ey_teaching_lead: "EY Section-Based – Teaching Lead",
    ey_learning_assistant: "EY Section-Based – Learning Assistant",
    ey_learning_monitor: "EY Section-Based – Learning Monitor",
    ls_teaching_lead: "LS Section-Based – Teaching Lead",
    ls_learning_assistant: "LS Section-Based – Learning Assistant",
    ms_teaching_lead: "MS Fixed FTE – Teaching Lead",
    hs_teaching_lead: "HS Fixed FTE – Teaching Lead",
  };
  return labels[roleSourceType] ?? roleSourceType;
}

function sortRows(rows: OrgDesignHcTableRow[], records: FopagCalculatedRecord[]): OrgDesignHcTableRow[] {
  // Build roleId lookup for hub-order within LED Hub
  const roleIdByDisplayLabel = new Map<string, string>();
  for (const rec of records) {
    roleIdByDisplayLabel.set(getBoardDisplayLabel(rec), rec.roleId);
  }

  return [...rows].sort((a, b) => {
    const dA = DIVISION_ORDER[a.divisionArea] ?? 99;
    const dB = DIVISION_ORDER[b.divisionArea] ?? 99;
    if (dA !== dB) return dA - dB;

    // Within Learning Experience Design Hub: use canonical order
    if (a.divisionArea === "Learning Experience Design Hub" && b.divisionArea === "Learning Experience Design Hub") {
      const idA = roleIdByDisplayLabel.get(a.role) ?? "";
      const idB = roleIdByDisplayLabel.get(b.role) ?? "";
      const orderA = LED_HUB_ROLE_ORDER[idA] ?? 99;
      const orderB = LED_HUB_ROLE_ORDER[idB] ?? 99;
      if (orderA !== orderB) return orderA - orderB;
    }

    if (a.roleGroupOrHub !== b.roleGroupOrHub) return a.roleGroupOrHub.localeCompare(b.roleGroupOrHub);
    return a.role.localeCompare(b.role);
  });
}

export function buildOrgDesignHcTable(input: {
  openingPackageId: string;
  occupancyScenarioId: string;
  orgDesignOptionId: string;
  year: number;
}): OrgDesignHcTableResult {
  const { openingPackageId, occupancyScenarioId, orgDesignOptionId, year } = input;
  const isHubActive = orgDesignOptionId !== "minimum_experience";

  const output = calculateFopag({ openingPackageId, occupancyScenarioId, orgDesignOptionId });
  const activeYearRecords = output.records.filter((r) => r.year === year && !r.isAuditRow);

  const rows: OrgDesignHcTableRow[] = activeYearRecords.map((rec) => {
    const divisionArea = getDivisionArea(rec, isHubActive);
    return {
      divisionArea,
      roleGroupOrHub: getRoleGroupOrHub(rec, divisionArea),
      role: getBoardDisplayLabel(rec),
      headcountOrFte: rec.headcountOrFte as number,
      year: rec.year,
      openingScenario: openingPackageId,
      orgDesignVersion: orgDesignOptionId,
      sourceTypeLogic: getSourceTypeLabel(rec.roleSourceType),
      notes: rec.sourceNotes ?? "",
    };
  });

  return {
    rows: sortRows(rows, activeYearRecords),
    calculationReady: output.calculationReady,
    engineStatus: output.engineStatus,
  };
}
