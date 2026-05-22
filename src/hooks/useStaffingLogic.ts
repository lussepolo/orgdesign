import { useMemo } from "react";
import {
  GRADE_CONFIG,
  EDUCATOR_LEVELS,
  LEARNING_ASSISTANT_DETAIL,
  LEARNING_MONITOR_DETAIL,
  ANNUAL_ADJUSTMENT,
} from "../constants";
import { LEADERSHIP_CONFIG, BACKOFFICE_CONFIG, SPECIALISTS_CONFIG } from "../constants/leadership";
import { Baby, Users, Database, GraduationCap } from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type MarginMode = "FULLY_LOADED" | "WITHOUT_BENEFITS";

// ─────────────────────────────────────────────
// ANNUALIZATION HELPERS
//
// SOURCE OF TRUTH (matches spreadsheet):
//   Custo Ano  = Custo Mês × 13         → salary burden (gross + encargos)
//   Benefícios Ano = Benefícios Mês × 12
//   Custo Total Ano = Custo Ano + Benefícios Ano
//
// WITHOUT_BENEFITS mode excludes the benefits component.
// Revenue always × 12.
// ─────────────────────────────────────────────

const getAnnualTeachingCost = (
  level: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number },
  mode: MarginMode,
): number => {
  const annualSalaryBurden = (level.grossMonthly + level.laborChargesMonthly) * 13;
  const annualBenefits = mode === "WITHOUT_BENEFITS" ? 0 : level.benefitsMonthly * 12;
  return annualSalaryBurden + annualBenefits;
};

const getMonthlyTeachingCost = (
  level: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number; totalCost: number },
  mode: MarginMode,
): number => {
  if (mode === "WITHOUT_BENEFITS") return level.grossMonthly + level.laborChargesMonthly;
  return level.totalCost;
};

const getAnnualSupportCost = (
  detail: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number },
  mode: MarginMode,
): number => {
  const annualSalaryBurden = (detail.grossMonthly + detail.laborChargesMonthly) * 13;
  const annualBenefits = mode === "WITHOUT_BENEFITS" ? 0 : detail.benefitsMonthly * 12;
  return annualSalaryBurden + annualBenefits;
};

const getMonthlySupportCost = (
  detail: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number },
  mode: MarginMode,
): number => {
  if (mode === "WITHOUT_BENEFITS") return detail.grossMonthly + detail.laborChargesMonthly;
  return detail.grossMonthly + detail.laborChargesMonthly + detail.benefitsMonthly;
};

const getAnnualRoleCost = (
  role: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number },
  headcount: number,
  year: number,
  activeFrom: number,
  mode: MarginMode,
): number => {
  if (year < activeFrom) return 0;
  const annualSalaryBurden = (role.grossMonthly + role.laborChargesMonthly) * 13;
  const annualBenefits = mode === "WITHOUT_BENEFITS" ? 0 : role.benefitsMonthly * 12;
  const baseAnnual = annualSalaryBurden + annualBenefits;
  const growthFactor = Math.pow(ANNUAL_ADJUSTMENT, year - 2028 + 1);
  return baseAnnual * growthFactor * headcount;
};

const getMonthlyRoleCost = (
  role: { grossMonthly: number; laborChargesMonthly: number; benefitsMonthly: number },
  headcount: number,
  year: number,
  activeFrom: number,
  mode: MarginMode,
): number => {
  if (year < activeFrom) return 0;
  const monthlyBase =
    mode === "WITHOUT_BENEFITS"
      ? role.grossMonthly + role.laborChargesMonthly
      : role.grossMonthly + role.laborChargesMonthly + role.benefitsMonthly;
  const growthFactor = Math.pow(ANNUAL_ADJUSTMENT, year - 2028 + 1);
  return monthlyBase * growthFactor * headcount;
};

const getTeachingLeadFteForGrade = (
  grade: { id: string; division: string },
  sections: number,
): number => {
  if (grade.division === "Middle School") {
    if (grade.id === "g6") return 3;
    if (grade.id === "g7") return 4;
    if (grade.id === "g8") return 3;
  }

  if (grade.division === "High School") {
    if (grade.id === "g9") return 4;
    if (grade.id === "g10") return 0;
    if (grade.id === "g11") return 3;
    if (grade.id === "g12") return 3;
  }

  return sections;
};

// ─────────────────────────────────────────────
// HOOK
//
// activeCaliber is keyed by GRADE ID (e.g. "g1", "pk3", "t1").
// Falls back to division name key, then "specialist" for backward compat.
// ─────────────────────────────────────────────

export function useStaffingLogic(
  selectedYear: number,
  activeCaliber: Record<string, string>,
  enrollment: Record<string, string>,
  sectionsPerGrade: number,
  divisionTuition: Record<string, string>,
  showIdealPath: boolean = false,
  visibleLayers: string[] = ["A", "B", "C", "D"],
  marginMode: MarginMode = "FULLY_LOADED",
) {
  const activeGrades = useMemo(
    () => GRADE_CONFIG.filter((g) => g.openYear <= selectedYear),
    [selectedYear],
  );

  const defaultEnrollmentByDivision = useMemo(() => {
    const result: Record<string, number> = {
      "Early Years": 0, "Lower School": 0, "Middle School": 0, "High School": 0,
    };
    activeGrades.forEach((grade) => { result[grade.division] += grade.cap * sectionsPerGrade; });
    return result;
  }, [activeGrades, sectionsPerGrade]);

  const stats = useMemo(() => {
    const divisions = ["Early Years", "Lower School", "Middle School", "High School"].map((divName) => {
      const divGrades = activeGrades.filter((g) => g.division === divName);
      const divEnrollment =
        enrollment[divName] === "" || enrollment[divName] === undefined
          ? defaultEnrollmentByDivision[divName]
          : parseInt(enrollment[divName]) || 0;

      const avgPerGrade = divGrades.length > 0 ? divEnrollment / divGrades.length : 0;

      const gradeStats = divGrades.map((grade) => {
        const sectionsNeeded = sectionsPerGrade;
        const occupancy = (avgPerGrade / (sectionsNeeded * grade.cap)) * 100;
        let currentTuition = parseFloat(divisionTuition[divName]) || 0;
        if (grade.id === "t1" || grade.id === "t2") currentTuition = 5000;
        return { ...grade, enrollment: avgPerGrade, sections: sectionsNeeded, occupancy, tuition: currentTuition };
      });

      const divSections = gradeStats.reduce((acc, g) => acc + g.sections, 0);
      const divMaxCap = gradeStats.reduce((acc, g) => acc + g.sections * g.cap, 0);
      const divOccupancy = divMaxCap > 0 ? (divEnrollment / divMaxCap) * 100 : 0;

      // Division-level recommendation (aggregate enrollment signal)
      let recLevelId = "specialist";
      if (divEnrollment >= 80) recLevelId = "master";
      else if (divName === "Early Years" && divEnrollment < 40) recLevelId = "associate";
      const recLevel = EDUCATOR_LEVELS.find((l) => l.id === recLevelId)!;

      const growthFactor = Math.pow(ANNUAL_ADJUSTMENT, selectedYear - 2028 + 1);

      // ── GRADE-LEVEL tier resolution
      let monthlyCost = 0;
      let annualCost = 0;
      let fte = 0;

      const gradeTierAssignments = gradeStats.map((grade) => {
        // Shared-staffing grades count students for enrollment, with no incremental educator cost.
        if ((grade as any).sharedStaffing) {
          return {
            gradeId: grade.id, gradeName: grade.name,
            levelId: "shared", levelName: "HS Pool (shared)",
            sections: grade.sections, fte: 0, monthlyCost: 0, annualCost: 0,
          };
        }

        const gradeFte = getTeachingLeadFteForGrade(grade, grade.sections);
        fte += gradeFte;

        let gradeLevelId: string;
        if (showIdealPath) {
          if (grade.division === "Early Years" && grade.enrollment < 40) gradeLevelId = "associate";
          else if (grade.enrollment >= 80) gradeLevelId = "master";
          else gradeLevelId = "specialist";
        } else {
          // Per-grade key → division key → default
          gradeLevelId = activeCaliber[grade.id] ?? activeCaliber[divName] ?? "specialist";
        }

        const gradeLevel = EDUCATOR_LEVELS.find((l) => l.id === gradeLevelId) ?? EDUCATOR_LEVELS[1];

        const mainMonthlyPerFte = getMonthlyTeachingCost(gradeLevel, marginMode);
        const mainAnnualPerFte = getAnnualTeachingCost(gradeLevel, marginMode);

        let gradeSupportMonthly = 0;
        let gradeSupportAnnual = 0;

        if (grade.division === "Early Years") {
          gradeSupportMonthly =
            grade.sections *
            (getMonthlySupportCost(LEARNING_ASSISTANT_DETAIL, marginMode) +
              getMonthlySupportCost(LEARNING_MONITOR_DETAIL, marginMode));
          gradeSupportAnnual =
            grade.sections *
            (getAnnualSupportCost(LEARNING_ASSISTANT_DETAIL, marginMode) +
              getAnnualSupportCost(LEARNING_MONITOR_DETAIL, marginMode));
        }

        if (grade.division === "Lower School") {
          gradeSupportMonthly = grade.sections * getMonthlySupportCost(LEARNING_ASSISTANT_DETAIL, marginMode);
          gradeSupportAnnual = grade.sections * getAnnualSupportCost(LEARNING_ASSISTANT_DETAIL, marginMode);
        }

        const thisGradeMonthly = (gradeFte * mainMonthlyPerFte + gradeSupportMonthly) * growthFactor;
        const thisGradeAnnual = (gradeFte * mainAnnualPerFte + gradeSupportAnnual) * growthFactor;
        monthlyCost += thisGradeMonthly;
        annualCost += thisGradeAnnual;

        return {
          gradeId: grade.id,
          gradeName: grade.name,
          levelId: gradeLevelId,
          levelName: gradeLevel.name,
          sections: grade.sections,
          fte: gradeFte,
          monthlyCost: thisGradeMonthly,
          annualCost: thisGradeAnnual,
        };
      });

      // Dominant tier for backward-compat display
      const counts: Record<string, number> = {};
      gradeTierAssignments.forEach((g) => { counts[g.levelId] = (counts[g.levelId] || 0) + 1; });
      const dominantLevelId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "specialist";
      const selectedLevel = EDUCATOR_LEVELS.find((l) => l.id === dominantLevelId) ?? EDUCATOR_LEVELS[1];

      const divRevenue = gradeStats.reduce((acc, g) => acc + g.enrollment * g.tuition, 0);

      return {
        name: divName,
        learners: Math.round(divEnrollment),
        sections: divSections,
        occupancy: Math.round(divOccupancy),
        recLevel,
        selectedLevel,
        gradeTierAssignments,
        fte: Math.round(fte * 100) / 100,
        isInstructionalLoad: divName === "Middle School" || divName === "High School",
        isEarlyYears: divName === "Early Years",
        cost: monthlyCost,
        annualCost,
        revenue: divRevenue,
        tuition: parseFloat(divisionTuition[divName]) || 0,
        icon: divName === "Early Years" ? Baby : divName === "Lower School" ? Users : divName === "Middle School" ? Database : GraduationCap,
        color: divName === "Early Years" ? "text-rose-600" : divName === "Lower School" ? "text-emerald-600" : divName === "Middle School" ? "text-blue-600" : "text-purple-600",
        bg: divName === "Early Years" ? "bg-rose-50" : divName === "Lower School" ? "bg-emerald-50" : divName === "Middle School" ? "bg-blue-50" : "bg-purple-50",
        maxCap: divMaxCap,
      };
    });

    const totalEnrollment = divisions.reduce((acc, d) => acc + d.learners, 0);
    const totalStaffingMonthly = divisions.reduce((acc, d) => acc + d.cost, 0);
    const totalStaffingAnnual = divisions.reduce((acc, d) => acc + d.annualCost, 0);
    const totalRevenueMonthly = divisions.reduce((acc, d) => acc + d.revenue, 0);
    const totalRevenueAnnual = totalRevenueMonthly * 12;
    const totalFTE = divisions.reduce((acc, d) => acc + d.fte, 0);

    const totalLeadershipMonthly = LEADERSHIP_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getMonthlyRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);
    const totalBackofficeMonthly = BACKOFFICE_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getMonthlyRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);
    const totalSpecialistsMonthly = SPECIALISTS_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getMonthlyRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);

    const totalLeadershipAnnual = LEADERSHIP_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);
    const totalBackofficeAnnual = BACKOFFICE_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);
    const totalSpecialistsAnnual = SPECIALISTS_CONFIG.filter((r) => r.activeFrom <= selectedYear)
      .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode), 0);

    const visibleTeachingMonthly = visibleLayers.includes("A") ? totalStaffingMonthly : 0;
    const visibleLeadershipMonthly = visibleLayers.includes("B") ? totalLeadershipMonthly : 0;
    const visibleBackofficeMonthly = visibleLayers.includes("C") ? totalBackofficeMonthly : 0;
    const visibleSpecialistsMonthly = visibleLayers.includes("D") ? totalSpecialistsMonthly : 0;

    const visibleTeachingAnnual = visibleLayers.includes("A") ? totalStaffingAnnual : 0;
    const visibleLeadershipAnnual = visibleLayers.includes("B") ? totalLeadershipAnnual : 0;
    const visibleBackofficeAnnual = visibleLayers.includes("C") ? totalBackofficeAnnual : 0;
    const visibleSpecialistsAnnual = visibleLayers.includes("D") ? totalSpecialistsAnnual : 0;

    const staffingMargin = totalRevenueMonthly - visibleTeachingMonthly;
    const staffingEfficiency = totalRevenueMonthly > 0 ? (visibleTeachingMonthly / totalRevenueMonthly) * 100 : 0;
    const campusContributionMargin = staffingMargin - visibleLeadershipMonthly;
    const specialistsMargin = campusContributionMargin - visibleSpecialistsMonthly;
    const operatingMargin = specialistsMargin - visibleBackofficeMonthly;
    const operatingAnnualMargin =
      totalRevenueAnnual - (visibleTeachingAnnual + visibleLeadershipAnnual + visibleBackofficeAnnual + visibleSpecialistsAnnual);

    const allocationMonthly = [...LEADERSHIP_CONFIG, ...BACKOFFICE_CONFIG, ...SPECIALISTS_CONFIG]
      .filter((r) => r.activeFrom <= selectedYear)
      .reduce(
        (acc, r) => {
          const value = getMonthlyRoleCost(r, r.headcount[selectedYear] || 0, selectedYear, r.activeFrom, marginMode);
          if (r.allocationModel === "FOPAG_DIRETO") acc.fopag += value;
          else acc.folhaDireta += value;
          return acc;
        },
        { fopag: 0, folhaDireta: 0 },
      );
    allocationMonthly.fopag += totalStaffingMonthly;

    const totalCapacity = divisions.reduce((acc, d) => acc + d.maxCap, 0);
    const occupancy = totalCapacity > 0 ? (totalEnrollment / totalCapacity) * 100 : 0;

    return {
      divisions,
      totalEnrollment,
      totalStaffingMonthly,
      totalStaffingAnnual,
      totalRevenueMonthly,
      totalRevenueAnnual,
      totalFTE,
      staffingMargin,
      staffingEfficiency,
      totalLeadershipMonthly,
      totalLeadershipAnnual,
      totalBackofficeMonthly,
      totalBackofficeAnnual,
      totalSpecialistsMonthly,
      totalSpecialistsAnnual,
      campusContributionMargin,
      specialistsMargin,
      operatingMargin,
      operatingAnnualMargin,
      allocationMonthly,
      occupancy,
      overallOccupancy: occupancy,
    };
  }, [activeGrades, defaultEnrollmentByDivision, enrollment, divisionTuition, activeCaliber, selectedYear, sectionsPerGrade, showIdealPath, visibleLayers, marginMode]);

  // ── 10-YEAR PROJECTION (grade-level tier resolution)
  const projectionData = useMemo(() => {
    const years = [2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037];

    return years.map((year) => {
      const activeGradesAtYear = GRADE_CONFIG.filter((g) => g.openYear <= year);
      const growthFactor = Math.pow(ANNUAL_ADJUSTMENT, year - 2028 + 1);

      let totalFte = 0;
      let totalStaffingMonthly = 0;
      let totalStaffingAnnual = 0;
      let totalRevenueMonthly = 0;
      let totalSections = 0;
      let totalEnrollment = 0;

      ["Early Years", "Lower School", "Middle School", "High School"].forEach((divName) => {
        const divGrades = activeGradesAtYear.filter((g) => g.division === divName);
        if (divGrades.length === 0) return;

        divGrades.forEach((grade) => {
          const gradeEnrollment = grade.cap * sectionsPerGrade;
          totalEnrollment += gradeEnrollment;
          totalSections += sectionsPerGrade;

          // Shared-staffing grades count students/sections, with no incremental educator cost.
          if ((grade as any).sharedStaffing) return;

          const gradeFte = getTeachingLeadFteForGrade(grade, sectionsPerGrade);
          totalFte += gradeFte;

          let levelId: string;
          if (showIdealPath) {
            if (grade.division === "Early Years" && gradeEnrollment < 40) levelId = "associate";
            else if (gradeEnrollment >= 80) levelId = "master";
            else levelId = "specialist";
          } else {
            levelId = activeCaliber[grade.id] ?? activeCaliber[divName] ?? "specialist";
          }

          const level = EDUCATOR_LEVELS.find((l) => l.id === levelId) ?? EDUCATOR_LEVELS[1];
          const monthlyPerFte = getMonthlyTeachingCost(level, marginMode);
          const annualPerFte = getAnnualTeachingCost(level, marginMode);

          let supportMonthly = 0;
          let supportAnnual = 0;

          if (grade.division === "Early Years") {
            supportMonthly = sectionsPerGrade * (getMonthlySupportCost(LEARNING_ASSISTANT_DETAIL, marginMode) + getMonthlySupportCost(LEARNING_MONITOR_DETAIL, marginMode));
            supportAnnual = sectionsPerGrade * (getAnnualSupportCost(LEARNING_ASSISTANT_DETAIL, marginMode) + getAnnualSupportCost(LEARNING_MONITOR_DETAIL, marginMode));
          }
          if (grade.division === "Lower School") {
            supportMonthly = sectionsPerGrade * getMonthlySupportCost(LEARNING_ASSISTANT_DETAIL, marginMode);
            supportAnnual = sectionsPerGrade * getAnnualSupportCost(LEARNING_ASSISTANT_DETAIL, marginMode);
          }

          totalStaffingMonthly += (gradeFte * monthlyPerFte + supportMonthly) * growthFactor;
          totalStaffingAnnual += (gradeFte * annualPerFte + supportAnnual) * growthFactor;

          const divTuition = parseFloat(divisionTuition[divName]) || 0;
          const gradeTuition = (grade.id === "t1" || grade.id === "t2") ? 5000 : divTuition;
          totalRevenueMonthly += gradeEnrollment * gradeTuition;
        });
      });

      const totalLeadershipAnnual = LEADERSHIP_CONFIG.filter((r) => r.activeFrom <= year)
        .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[year] || 0, year, r.activeFrom, marginMode), 0);
      const totalBackofficeAnnual = BACKOFFICE_CONFIG.filter((r) => r.activeFrom <= year)
        .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[year] || 0, year, r.activeFrom, marginMode), 0);
      const totalSpecialistsAnnual = SPECIALISTS_CONFIG.filter((r) => r.activeFrom <= year)
        .reduce((sum, r) => sum + getAnnualRoleCost(r, r.headcount[year] || 0, year, r.activeFrom, marginMode), 0);

      const totalOperatingAnnual =
        (visibleLayers.includes("A") ? totalStaffingAnnual : 0) +
        (visibleLayers.includes("B") ? totalLeadershipAnnual : 0) +
        (visibleLayers.includes("C") ? totalBackofficeAnnual : 0) +
        (visibleLayers.includes("D") ? totalSpecialistsAnnual : 0);

      const gradesLabel = activeGradesAtYear.length > 0
        ? `${activeGradesAtYear[0].id.toUpperCase()} – ${activeGradesAtYear[activeGradesAtYear.length - 1].id.toUpperCase()}`
        : "N/A";

      return {
        year,
        grades: gradesLabel,
        enrollment: Math.round(totalEnrollment),
        totalStaffing: totalStaffingAnnual,
        totalLeadership: totalLeadershipAnnual,
        totalBackoffice: totalBackofficeAnnual,
        totalSpecialists: totalSpecialistsAnnual,
        totalRevenue: totalRevenueMonthly * 12,
        margin: totalRevenueMonthly * 12 - totalOperatingAnnual,
        efficiency: totalRevenueMonthly > 0 ? (totalStaffingMonthly / totalRevenueMonthly) * 100 : 0,
        fteCount: Math.round(totalFte),
        sections: totalSections,
      };
    });
  }, [sectionsPerGrade, divisionTuition, activeCaliber, showIdealPath, visibleLayers, marginMode]);

  return { activeGrades, defaultEnrollmentByDivision, stats, projectionData };
}
