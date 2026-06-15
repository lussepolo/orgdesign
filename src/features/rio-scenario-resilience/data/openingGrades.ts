export interface OpeningGradeOption {
  id: "t1_g3" | "t1_g4" | "t1_g5" | "t1_g6";
  label: string;
  constructionYear: 2027;
  openingYear: 2028;
  grades: string[];
  activatesMiddleSchoolInYear1: boolean;
}

export const openingGrades: OpeningGradeOption[] = [
  {
    id: "t1_g3",
    label: "T1 to G3",
    constructionYear: 2027,
    openingYear: 2028,
    grades: ["T1", "T2", "PK3", "PK4", "Kindergarten", "G1", "G2", "G3"],
    activatesMiddleSchoolInYear1: false,
  },
  {
    id: "t1_g4",
    label: "T1 to G4",
    constructionYear: 2027,
    openingYear: 2028,
    grades: ["T1", "T2", "PK3", "PK4", "Kindergarten", "G1", "G2", "G3", "G4"],
    activatesMiddleSchoolInYear1: false,
  },
  {
    id: "t1_g5",
    label: "T1 to G5",
    constructionYear: 2027,
    openingYear: 2028,
    grades: ["T1", "T2", "PK3", "PK4", "Kindergarten", "G1", "G2", "G3", "G4", "G5"],
    activatesMiddleSchoolInYear1: false,
  },
  {
    id: "t1_g6",
    label: "T1 to G6",
    constructionYear: 2027,
    openingYear: 2028,
    grades: ["T1", "T2", "PK3", "PK4", "Kindergarten", "G1", "G2", "G3", "G4", "G5", "G6"],
    activatesMiddleSchoolInYear1: true,
  },
] as const;

