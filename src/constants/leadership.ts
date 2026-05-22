import { ANNUAL_ADJUSTMENT } from "./index";

export type AllocationModel = "FOPAG_DIRETO" | "FOLHA_DIRETA";

export interface LeadershipRole {
  id: string;
  role: string;
  costs: Record<number, number>;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  allocationModel: AllocationModel;
  activeFrom: number;
  headcount: Record<number, number>;
  layer: "B";
}

export interface BackofficeRole {
  id: string;
  role: string;
  costs: Record<number, number>;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  allocationModel: AllocationModel;
  activeFrom: number;
  headcount: Record<number, number>;
  layer: "C";
}

export interface SpecialistRole {
  id: string;
  role: string;
  costs: Record<number, number>;
  grossMonthly: number;
  laborChargesMonthly: number;
  benefitsMonthly: number;
  allocationModel: AllocationModel;
  activeFrom: number;
  headcount: Record<number, number>;
  layer: "D";
  regime?: string;
}

const START_YEAR = 2028;
const END_YEAR = 2047;
const YEARS = Array.from(
  { length: END_YEAR - START_YEAR + 1 },
  (_, index) => START_YEAR + index,
);

const hc = (progression: [number, number][]): Record<number, number> => {
  const result: Record<number, number> = {};
  for (const year of YEARS) {
    const match = progression.filter(([y]) => y <= year).pop();
    result[year] = match ? match[1] : 0;
  }
  return result;
};

const projectMonthly = (
  grossMonthly: number,
  laborChargesMonthly: number,
  benefitsMonthly: number,
  startYear = 2028,
) => {
  return Object.fromEntries(
    YEARS.map((year) => {
      if (year < startYear) return [year, 0];
      const growthFactor = Math.pow(ANNUAL_ADJUSTMENT, year - START_YEAR + 1);
      const monthlyLoaded = (grossMonthly + laborChargesMonthly + benefitsMonthly) * growthFactor;
      return [year, Math.round(monthlyLoaded)];
    }),
  );
};

type RoleOptions = {
  regime?: string;
};

const role = <T extends "B" | "C" | "D">(
  id: string,
  roleName: string,
  grossMonthly: number,
  laborChargesMonthly: number,
  benefitsMonthly: number,
  allocationModel: AllocationModel,
  activeFrom: number,
  headcount: Record<number, number>,
  layer: T,
  optionsOrRegime?: string | RoleOptions,
) => {
  const options: RoleOptions =
    typeof optionsOrRegime === "string" ? { regime: optionsOrRegime } : optionsOrRegime ?? {};

  return {
    id,
    role: roleName,
    grossMonthly,
    laborChargesMonthly,
    benefitsMonthly,
    allocationModel,
    costs: projectMonthly(
      grossMonthly,
      laborChargesMonthly,
      benefitsMonthly,
      activeFrom,
    ),
    activeFrom,
    headcount,
    layer,
    ...(options.regime ? { regime: options.regime } : {}),
  };
};

export const LEADERSHIP_CONFIG: LeadershipRole[] = [
  role("hos", "Head of School", 51167.45, 24816.21, 1464.28, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "B"),
  role("ey_principal", "EY Coordinator", 19941.74, 9671.74, 1331.93, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "B"),
  role("ls_principal", "LS Coordinator", 19941.74, 9671.74, 1331.93, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "B"),
  role("ms_principal", "MS Coordinator", 19941.74, 9671.74, 1331.93, "FOLHA_DIRETA", 2031, hc([[2031, 1]]), "B"),
  role("hs_principal", "HS Coordinator", 19941.74, 9671.74, 1331.93, "FOLHA_DIRETA", 2034, hc([[2034, 1]]), "B"),
  role("counselor", "Counselor", 16923.84, 8208.06, 1159.82, "FOLHA_DIRETA", 2028, hc([[2028, 3], [2031, 4]]), "B"),
  role("edtech", "Ed Tech Coordinator", 18493.59, 8969.39, 1173.58, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "B"),
  role("ops", "Ops Coordinator", 11340.0, 5499.9, 1143.26, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "B"),
];

export const BACKOFFICE_CONFIG: BackofficeRole[] = [
  role("clerk", "Clerk (Portaria)", 2786.75, 1351.57, 839.17, "FOLHA_DIRETA", 2028, hc([[2028, 4]]), "C"),
  role("family", "Family Engagement Analyst", 5335.05, 2587.5, 849.97, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
  role("library", "Inspirationeer", 6880.65, 3337.12, 506.52, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
  role("it", "IT Technician", 6405.0, 3106.43, 504.51, "FOLHA_DIRETA", 2028, hc([[2028, 1], [2032, 2]]), "C"),
  role("maintenance", "Maintenance Technician", 3878.7, 1881.17, 843.80, "FOLHA_DIRETA", 2028, hc([[2028, 2], [2036, 3]]), "C"),
  role("marketing", "Marketing & Events Analyst", 6195.0, 3004.58, 503.62, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
  role("nurse", "Nurse Technician", 3780.0, 1833.3, 843.38, "FOLHA_DIRETA", 2028, hc([[2028, 1], [2035, 2]]), "C"),
  role("nursing_intern", "Nursing Intern", 1578.0, 765.33, 834.04, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
  role("finance", "Financial Analyst", 5090.0, 2468.65, 848.93, "FOLHA_DIRETA", 2028, hc([[2028, 2]]), "C"),
  role("finance_assistant", "Assistente Financeiro", 2862.6265, 1388.37, 704.9656, "FOLHA_DIRETA", 2031, hc([[2031, 1]]), "C"),
  role("hr", "HR Analyst", 5614.0, 2722.79, 501.15, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
  role("secretary", "School Secretary", 4206.2, 2040.01, 845.19, "FOLHA_DIRETA", 2028, hc([[2028, 1]]), "C"),
];

export const SPECIALISTS_CONFIG: SpecialistRole[] = [
  // ── SHARED SPECIALISTS (campus-wide, active from 2028) ───────────────
  role("after_school", "After School Educator",    15247.55, 7395.06, 1159.83, "FOPAG_DIRETO", 2028, hc([[2028, 1]]),          "D", "shared specialist"),
  role("arts",         "Arts Educator",             15247.55, 7395.06, 1159.83, "FOPAG_DIRETO", 2028, hc([[2028, 1], [2031, 2]]), "D", "shared specialist"),
  role("body",         "Body & Movement Educator",  15247.55, 7395.06, 1159.83, "FOPAG_DIRETO", 2028, hc([[2028, 1], [2031, 2]]), "D", "shared specialist"),
  role("music",        "Music Educator",            15247.55, 7395.06, 1159.83, "FOPAG_DIRETO", 2028, hc([[2028, 1], [2031, 2]]), "D", "shared specialist"),
  // ── LEARNING EXPERIENCE DESIGNER ─────────────────────────────────────
  // Classified as specialist (counted in Especialistas group).
  // Salary R$15,992.88 follows spreadsheet — ~5% above Master Educator rate.
  role("led",          "Learning Exp Designer",     15992.88, 7756.55, 1162.98, "FOLHA_DIRETA", 2028, hc([[2028, 1], [2031, 2], [2034, 3], [2037, 4]]), "D", "shared specialist"),
  // ── HIGH SCHOOL EDUCATOR POOL ─────────────────────────────────────────
  // 4 Master Educators hired when Grade 9 opens (2034).
  // 4 more hired when Grade 11 opens (2036) → pool of 8.
  // These 8 cover all HS grades (9–12). No per-grade allocation.
  // Grade 10 (opens 2035) and Grade 12 (opens 2037) have zero incremental cost.
  role("hs_pool",      "HS Educator Pool",          15247.55, 7395.06, 1159.83, "FOLHA_DIRETA", 2034, hc([[2034, 4], [2036, 8]]), "D", "hs pool"),
];
