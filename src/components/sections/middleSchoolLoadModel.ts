export type MiddleSchoolGrade = "g6" | "g7" | "g8";
export type SectionCount = 0 | 1 | 2;
export type CoreDomainId = "mathematics" | "naturalSciences" | "portuguese" | "socialSciences" | "englishLanguageArts";
export type ProgramFunctionId =
  | "passionProjects"
  | "babsonEpic"
  | "pathways"
  | "advisory"
  | "electives"
  | "globalExpressionLeadership";

export type MiddleSchoolSectionsByGrade = Record<MiddleSchoolGrade, SectionCount>;
export type CoreDomainSlotsPerSection = Record<CoreDomainId, number>;
export type ProgramSlotsPerSection = Record<ProgramFunctionId, number>;

export const SECTION_COUNT_OPTIONS: SectionCount[] = [0, 1, 2];
export const LOAD_THRESHOLD_OPTIONS = [20, 22, 24, 26, 28, 30];
export const BLOCK_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const DEFAULT_MS_SECTIONS_BY_GRADE: MiddleSchoolSectionsByGrade = {
  g6: 2,
  g7: 0,
  g8: 0,
};
export const DEFAULT_MIN_VIABLE_LOAD = 24;
export const DEFAULT_MAX_TEACHING_LOAD = 28;

export const MS_GRADE_LABELS: Record<MiddleSchoolGrade, string> = {
  g6: "Grade 6",
  g7: "Grade 7",
  g8: "Grade 8",
};

export const CORE_DOMAIN_ASSUMPTIONS: Array<{
  id: CoreDomainId;
  label: string;
  defaultSlotsPerSection: number;
  complementaryFunctions: string[];
  grade8ComplementaryFunctions?: string[];
}> = [
  {
    id: "mathematics",
    label: "Mathematics",
    defaultSlotsPerSection: 6,
    complementaryFunctions: ["STEAM elective", "market sizing", "financial modeling", "data analysis", "impact measurement"],
    grade8ComplementaryFunctions: ["Babson EPIC metrics"],
  },
  {
    id: "naturalSciences",
    label: "Natural Sciences",
    defaultSlotsPerSection: 4,
    complementaryFunctions: ["scientific inquiry", "evidence quality", "experimentation", "prototyping", "sustainability, health, or environmental projects", "lab / investigation preparation"],
  },
  {
    id: "portuguese",
    label: "Portuguese",
    defaultSlotsPerSection: 6,
    complementaryFunctions: ["stakeholder interview scripts", "argumentation practice", "public communication in Portuguese"],
    grade8ComplementaryFunctions: ["Babson EPIC writing"],
  },
  {
    id: "socialSciences",
    label: "Social Sciences",
    defaultSlotsPerSection: 4,
    complementaryFunctions: ["SDG/context research", "stakeholder mapping", "MUN", "civic inquiry", "Pathways", "ethical impact analysis"],
    grade8ComplementaryFunctions: ["Babson EPIC social impact framing"],
  },
  {
    id: "englishLanguageArts",
    label: "English Language Arts",
    defaultSlotsPerSection: 6,
    complementaryFunctions: ["research communication", "presentation support", "mentor communication"],
    grade8ComplementaryFunctions: ["Babson EPIC pitch coaching"],
  },
];

export const PROGRAM_FUNCTION_ASSUMPTIONS: Array<{
  id: ProgramFunctionId;
  label: string;
  defaultSlotsPerSection: number;
  activeGrades: MiddleSchoolGrade[];
  ownerDomains: string;
  notes: string;
}> = [
  {
    id: "passionProjects",
    label: "Project Mentorship / Passion Projects",
    defaultSlotsPerSection: 2,
    activeGrades: ["g6", "g7"],
    ownerDomains: "English Language Arts, Global Studies, domain mentors",
    notes: "Active only in Grades 6-7; Project Mentorship remains a coordinated function.",
  },
  {
    id: "babsonEpic",
    label: "Babson EPIC",
    defaultSlotsPerSection: 2,
    activeGrades: ["g8"],
    ownerDomains: "Mathematics, Portuguese, English Language Arts, Social Sciences",
    notes: "Grade 8 program anchor / credential function; replaces Passion Projects in Grade 8.",
  },
  {
    id: "pathways",
    label: "Pathways",
    defaultSlotsPerSection: 1,
    activeGrades: ["g6", "g7", "g8"],
    ownerDomains: "Portuguese, Social Sciences, advisory",
    notes: "Supports readiness conversations and transition planning.",
  },
  {
    id: "advisory",
    label: "Advisory",
    defaultSlotsPerSection: 1,
    activeGrades: ["g6", "g7", "g8"],
    ownerDomains: "Cluster educators, Social Sciences, division team",
    notes: "Belonging, learner agency, and student-support contact.",
  },
  {
    id: "electives",
    label: "Electives / Creative Hub",
    defaultSlotsPerSection: 4,
    activeGrades: ["g6", "g7", "g8"],
    ownerDomains: "Domain-aligned specialists or MS educators",
    notes: "Domain-aligned electives and Creative Hub programming; schedule validation required.",
  },
  {
    id: "globalExpressionLeadership",
    label: "Global Expression & Leadership",
    defaultSlotsPerSection: 2,
    activeGrades: ["g6", "g7", "g8"],
    ownerDomains: "English Language Arts, Global Studies, Social Sciences",
    notes: "Supports public communication, leadership routines, and external-facing evidence.",
  },
];

export const createDefaultDomainSlotsPerSection = (): CoreDomainSlotsPerSection => (
  Object.fromEntries(CORE_DOMAIN_ASSUMPTIONS.map((domain) => [domain.id, domain.defaultSlotsPerSection])) as CoreDomainSlotsPerSection
);

export const createDefaultProgramSlotsPerSection = (): ProgramSlotsPerSection => (
  Object.fromEntries(PROGRAM_FUNCTION_ASSUMPTIONS.map((program) => [program.id, program.defaultSlotsPerSection])) as ProgramSlotsPerSection
);

export const getActiveGrades = (sectionsByGrade: MiddleSchoolSectionsByGrade) => (
  (Object.entries(sectionsByGrade) as Array<[MiddleSchoolGrade, SectionCount]>)
    .filter(([, sectionCount]) => sectionCount > 0)
    .map(([grade]) => grade)
);

export const getTotalMiddleSchoolSections = (
  activeGrades: MiddleSchoolGrade[],
  sectionsByGrade: MiddleSchoolSectionsByGrade,
) => activeGrades.reduce((total, grade) => total + sectionsByGrade[grade], 0);

export const getValidationWarnings = ({
  sectionsByGrade,
  totalMiddleSchoolSections,
  minViableLoad,
  maxTeachingLoad,
}: {
  sectionsByGrade: MiddleSchoolSectionsByGrade;
  totalMiddleSchoolSections: number;
  minViableLoad: number;
  maxTeachingLoad: number;
}) => {
  const warnings: string[] = [];

  if (sectionsByGrade.g7 > 0 && sectionsByGrade.g6 === 0) {
    warnings.push("Grade 7 cannot be active if Grade 6 has 0 sections.");
  }
  if (sectionsByGrade.g8 > 0 && (sectionsByGrade.g6 === 0 || sectionsByGrade.g7 === 0)) {
    warnings.push("Grade 8 cannot be active unless both Grade 6 and Grade 7 are active.");
  }
  if (Object.values(sectionsByGrade).some((sectionCount) => sectionCount > 2)) {
    warnings.push("Rio model is capped at 2 sections per grade.");
  }
  if (maxTeachingLoad < minViableLoad) {
    warnings.push("Maximum teaching load is lower than the minimum viable load.");
  }
  if (totalMiddleSchoolSections === 0) {
    warnings.push("No Middle School grades active.");
  }

  return warnings;
};

export const getActiveStage = (
  sectionsByGrade: MiddleSchoolSectionsByGrade,
  totalMiddleSchoolSections: number,
) => {
  if (totalMiddleSchoolSections === 0) return "No active Middle School model";
  if (sectionsByGrade.g8 > 0 && sectionsByGrade.g6 > 0 && sectionsByGrade.g7 > 0) return "Core-subject specialist model";
  if (sectionsByGrade.g7 > 0 && sectionsByGrade.g6 > 0) return "Hybrid specialization";
  if (sectionsByGrade.g6 > 0 && sectionsByGrade.g7 === 0 && sectionsByGrade.g8 === 0) return "Cluster launch";
  return "Invalid Rio progression";
};

export const getValidationStatus = (validationWarnings: string[]) => (
  validationWarnings.length ? "Review needed" : "Valid Rio model"
);

export const buildBalancedDistribution = (totalSlots: number, maxTeachingLoad: number) => {
  if (totalSlots === 0) return [];
  const educatorCount = Math.ceil(totalSlots / Math.max(1, maxTeachingLoad));
  const baseLoad = Math.floor(totalSlots / educatorCount);
  const remainder = totalSlots % educatorCount;

  return Array.from({ length: educatorCount }, (_, index) => baseLoad + (index < remainder ? 1 : 0));
};

export const formatSlotList = (loads: number[]) => (loads.length ? loads.join(" + ") : "Not active");

export const deriveEducatorLoadRows = ({
  activeGrades,
  sectionsByGrade,
  domainSlotsPerSection,
  minViableLoad,
  maxTeachingLoad,
}: {
  activeGrades: MiddleSchoolGrade[];
  sectionsByGrade: MiddleSchoolSectionsByGrade;
  domainSlotsPerSection: CoreDomainSlotsPerSection;
  minViableLoad: number;
  maxTeachingLoad: number;
}) => CORE_DOMAIN_ASSUMPTIONS.map((domain) => {
  const complementaryFunctions = activeGrades.includes("g8")
    ? [...domain.complementaryFunctions, ...(domain.grade8ComplementaryFunctions ?? [])]
    : domain.complementaryFunctions;
  const weeklyCoreSlots = activeGrades.reduce(
    (total, grade) => total + (sectionsByGrade[grade] * domainSlotsPerSection[domain.id]),
    0,
  );
  const distribution = buildBalancedDistribution(weeklyCoreSlots, maxTeachingLoad);
  const remainingToMin = distribution.map((load) => Math.max(0, minViableLoad - load));
  const remainingBeforeMax = distribution.map((load) => Math.max(0, maxTeachingLoad - load));
  const hasOverload = distribution.some((load) => load > maxTeachingLoad);
  const needsComplementaryLoad = distribution.some((load) => load < minViableLoad);
  const status = weeklyCoreSlots === 0
    ? "Not active"
    : hasOverload
      ? "Requires redistribution"
      : needsComplementaryLoad
        ? "Needs complementary load"
        : "Viable full load";

  return {
    domain: domain.label,
    weeklyCoreSlots,
    educatorsNeeded: distribution.length,
    distribution,
    complementaryLoadNeed: weeklyCoreSlots === 0 ? "Not active" : remainingToMin.every((slots) => slots === 0) ? `0 to reach ${minViableLoad}` : `${formatSlotList(remainingToMin)} slots to reach ${minViableLoad}`,
    remainingCapacity: weeklyCoreSlots === 0 ? "Not active" : `${formatSlotList(remainingBeforeMax)} slots before ${maxTeachingLoad}`,
    complementaryFunctions: complementaryFunctions.join(", "),
    status,
  };
});

export const deriveProgramFunctionRows = (
  sectionsByGrade: MiddleSchoolSectionsByGrade,
  programSlotsPerSection: ProgramSlotsPerSection,
) => PROGRAM_FUNCTION_ASSUMPTIONS.flatMap((program) => {
  const activeProgramGrades = program.activeGrades.filter((grade) => sectionsByGrade[grade] > 0);
  if (!activeProgramGrades.length) return [];

  const weeklySlots = activeProgramGrades.reduce(
    (total, grade) => total + (sectionsByGrade[grade] * programSlotsPerSection[program.id]),
    0,
  );

  return [{
    functionName: program.label,
    activeGrades: activeProgramGrades.map((grade) => MS_GRADE_LABELS[grade]).join(", "),
    weeklySlots,
    ownerDomains: program.ownerDomains,
    notes: program.notes,
  }];
});

export const deriveGrade6ClusterInsight = ({
  sectionsByGrade,
  domainSlotsPerSection,
  minViableLoad,
}: {
  sectionsByGrade: MiddleSchoolSectionsByGrade;
  domainSlotsPerSection: CoreDomainSlotsPerSection;
  minViableLoad: number;
}) => {
  const grade6Sections = sectionsByGrade.g6;
  const mathematicsSlots = grade6Sections * domainSlotsPerSection.mathematics;
  const naturalSciencesSlots = grade6Sections * domainSlotsPerSection.naturalSciences;
  const combinedSlots = mathematicsSlots + naturalSciencesSlots;
  const gapToMinimumLoad = Math.max(0, minViableLoad - combinedSlots);

  return {
    mathematicsSlots,
    naturalSciencesSlots,
    combinedSlots,
    gapToMinimumLoad,
    active: grade6Sections > 0 && sectionsByGrade.g7 === 0 && sectionsByGrade.g8 === 0,
  };
};
