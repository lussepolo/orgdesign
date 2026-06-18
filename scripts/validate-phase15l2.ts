// Phase 15L.2 — Academic Staffing Content Cleanup Validation (27 checks).
//
// Verifies that all S3/S4 findings from the Phase 15K audit are resolved:
//
//   Section A — F-5.5-01: Early Years T2 capacity fix (EarlyYearsTab.tsx)
//     1. T2 max:30 removed (was incorrect — 14 cap × 2 sections = 28, not 30)
//     2. T2 max:28 present
//     3. T1 max:28 preserved (regression guard)
//
//   Section B — F-5.6-01: Lower School G4/G5 capacity fix (LowerSchoolTab.tsx)
//     4. G4 max:44 entry removed (was incorrect — 24 cap × 2 sections = 48)
//     5. G4 max:48 present
//     6. G5 max:48 present
//     7. G1-G3 max:44 still present (regression guard)
//
//   Section C — F-5.4-03: Cluster taxonomy alignment (HiringProfileCardsTab.tsx)
//     8. "Signature Cluster" tile label removed
//     9. "Bilingual Cluster" tile label removed
//    10. "Global Studies & Project Design" tile label present
//    11. "Language Acquisition & Global Perspectives" tile label present
//
//   Section D — F-5.4-03: grade6ClusterModel alignment (OfferScenariosTab.tsx)
//    12. "Global Studies / Project Design" (with slash) absent from grade6ClusterModel
//    13. "Global Studies & Project Design" (with ampersand) present
//
//   Section E — F-5.4-02: Partial-coverage disclosure (HiringProfileCardsTab.tsx)
//    14. Disclosure phrase "not a complete hiring authorization list" present
//    15. Disclosure mentions "leadership, operations, support"
//
//   Section F — G-03: After School naming (leadership.ts + executiveOrgDesignModel.ts)
//    16. "After School Educator" absent from leadership.ts
//    17. "After School Coordinator" present in leadership.ts
//    18. id key "after_school" still present (key must not change)
//    19. "After School Coordinator" present in executiveOrgDesignModel.ts
//
//   Section G — G-04: Inspirationeer/Librarian naming
//    20. Standalone "Inspirationeer" role name absent from leadership.ts
//    21. "Inspirationeer / Librarian" present in leadership.ts
//    22. id key "library" still present in leadership.ts (key must not change)
//    23. Standalone label "Librarian" absent from executiveOrgDesignModel.ts
//    24. "Inspirationeer / Librarian" present in executiveOrgDesignModel.ts
//
//   Section H — Calculation keys preserved (teaching.ts)
//    25. "Signature" key preserved in HS_SUBJECT_DISTRIBUTION
//    26. "Bilingual" key preserved in HS_SUBJECT_DISTRIBUTION
//
//   Section I — Governance invariants
//    27. FINANCE_SOURCE_CLOSURE_COMPLETE and BOARD_RATIFICATION_READY remain false
//
// Run with: npm run validate:phase15l2

import { readFileSync } from "fs";
import {
  FINANCE_SOURCE_CLOSURE_COMPLETE,
  BOARD_RATIFICATION_READY,
} from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness";

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

let passCount = 0;
let failCount = 0;

function checkTrue(label: string, val: boolean, note?: string) {
  if (val) {
    passCount++;
    console.log(`  ✓ ${label}`);
  } else {
    failCount++;
    console.log(`  ✗ ${label}`);
    if (note) console.log(`      note: ${note}`);
  }
}

function checkFalse(label: string, val: boolean, note?: string) {
  checkTrue(label, !val, note);
}

const EY_TAB = readFile("src/components/sections/EarlyYearsTab.tsx");
const LS_TAB = readFile("src/components/sections/LowerSchoolTab.tsx");
const HIRING_TAB = readFile("src/components/sections/HiringProfileCardsTab.tsx");
const OFFER_TAB = readFile("src/components/sections/OfferScenariosTab.tsx");
const LEADERSHIP = readFile("src/constants/leadership.ts");
const EXEC_ORG_MODEL = readFile(
  "src/features/rio-scenario-resilience/model/executiveOrgDesignModel.ts",
);
const TEACHING = readFile("src/constants/teaching.ts");

// ── Section A — F-5.5-01: Early Years T2 capacity ────────────────────────────
console.log("\nSection A — F-5.5-01: Early Years T2 Capacity (EarlyYearsTab.tsx)");

checkFalse(
  "ey_t2_max_30_removed",
  EY_TAB.includes('grade: "Toddlers 2"') && EY_TAB.includes("max: 30"),
  "EarlyYearsTab.tsx must not pair 'Toddlers 2' with max:30 (14 cap × 2 sections = 28)",
);

checkTrue(
  "ey_t2_max_28_present",
  EY_TAB.includes('"Toddlers 2"') && EY_TAB.includes("max: 28"),
  "EarlyYearsTab.tsx must contain Toddlers 2 with max:28",
);

checkTrue(
  "ey_t1_max_28_preserved",
  EY_TAB.includes('"Toddlers 1"') && EY_TAB.includes("max: 28"),
  "Toddlers 1 max:28 must remain unchanged (regression guard)",
);

// ── Section B — F-5.6-01: Lower School G4/G5 capacity ────────────────────────
console.log("\nSection B — F-5.6-01: Lower School G4/G5 Capacity (LowerSchoolTab.tsx)");

checkFalse(
  "ls_g4_max_44_removed",
  LS_TAB.includes('"Grade 4"') &&
    LS_TAB.includes('"Project-based Learning"') &&
    LS_TAB.includes("max: 44") &&
    !LS_TAB.includes("max: 48"),
  "LowerSchoolTab.tsx must not have Grade 4 at max:44 (24 cap × 2 sections = 48)",
);

checkTrue(
  "ls_g4_max_48_present",
  LS_TAB.includes(
    'grade: "Grade 4", focus: "Project-based Learning", model: "Lead + Assistant", ratio: "1:11", max: 48',
  ),
  "LowerSchoolTab.tsx must contain Grade 4 with max:48",
);

checkTrue(
  "ls_g5_max_48_present",
  LS_TAB.includes(
    'grade: "Grade 5", focus: "Transition & Leadership", model: "Lead + Assistant", ratio: "1:11", max: 48',
  ),
  "LowerSchoolTab.tsx must contain Grade 5 with max:48",
);

checkTrue(
  "ls_g1_g3_max_44_preserved",
  LS_TAB.includes('"Grade 1"') && LS_TAB.includes('"Grade 3"') && LS_TAB.includes("max: 44"),
  "Grade 1-3 max:44 must remain unchanged (regression guard)",
);

// ── Section C — F-5.4-03: Cluster taxonomy (HiringProfileCardsTab.tsx) ───────
console.log("\nSection C — F-5.4-03: Cluster Taxonomy (HiringProfileCardsTab.tsx)");

checkFalse(
  "hiring_no_signature_cluster_tile",
  HIRING_TAB.includes('"Signature Cluster"'),
  "HiringProfileCardsTab.tsx must not contain '\"Signature Cluster\"' as a tile label",
);

checkFalse(
  "hiring_no_bilingual_cluster_tile",
  HIRING_TAB.includes('"Bilingual Cluster"'),
  "HiringProfileCardsTab.tsx must not contain '\"Bilingual Cluster\"' as a tile label",
);

checkTrue(
  "hiring_global_studies_cluster_present",
  HIRING_TAB.includes('"Global Studies & Project Design"'),
  "HiringProfileCardsTab.tsx must contain '\"Global Studies & Project Design\"'",
);

checkTrue(
  "hiring_language_acquisition_cluster_present",
  HIRING_TAB.includes('"Language Acquisition & Global Perspectives"'),
  "HiringProfileCardsTab.tsx must contain '\"Language Acquisition & Global Perspectives\"'",
);

// ── Section D — F-5.4-03: grade6ClusterModel alignment (OfferScenariosTab.tsx)
console.log("\nSection D — F-5.4-03: grade6ClusterModel Alignment (OfferScenariosTab.tsx)");

checkFalse(
  "offer_no_global_studies_slash_project_design",
  OFFER_TAB.includes('"Global Studies / Project Design:'),
  "OfferScenariosTab.tsx grade6ClusterModel must not use slash form 'Global Studies / Project Design'",
);

checkTrue(
  "offer_global_studies_ampersand_present",
  OFFER_TAB.includes('"Global Studies & Project Design:'),
  "OfferScenariosTab.tsx grade6ClusterModel must use ampersand form 'Global Studies & Project Design'",
);

// ── Section E — F-5.4-02: Partial-coverage disclosure ────────────────────────
console.log("\nSection E — F-5.4-02: Partial-Coverage Disclosure (HiringProfileCardsTab.tsx)");

checkTrue(
  "hiring_disclosure_not_complete_hiring_list",
  HIRING_TAB.includes("not a complete hiring authorization list"),
  "HiringProfileCardsTab.tsx must contain disclosure 'not a complete hiring authorization list'",
);

checkTrue(
  "hiring_disclosure_mentions_leadership_operations_support",
  HIRING_TAB.includes("leadership, operations, support"),
  "HiringProfileCardsTab.tsx disclosure must mention 'leadership, operations, support'",
);

// ── Section F — G-03: After School naming ────────────────────────────────────
console.log("\nSection F — G-03: After School Naming");

checkFalse(
  "leadership_no_after_school_educator",
  LEADERSHIP.includes('"After School Educator"'),
  "leadership.ts must not contain '\"After School Educator\"' (renamed to Coordinator)",
);

checkTrue(
  "leadership_after_school_coordinator_present",
  LEADERSHIP.includes('"After School Coordinator"'),
  "leadership.ts must contain '\"After School Coordinator\"'",
);

checkTrue(
  "leadership_after_school_id_preserved",
  LEADERSHIP.includes('"after_school"'),
  "leadership.ts must preserve id key '\"after_school\"' (used by getExistingRoleHeadcount)",
);

checkTrue(
  "exec_org_after_school_coordinator_present",
  EXEC_ORG_MODEL.includes('"After School Coordinator"'),
  "executiveOrgDesignModel.ts must contain '\"After School Coordinator\"' label",
);

// ── Section G — G-04: Inspirationeer/Librarian naming ───────────────────────
console.log("\nSection G — G-04: Inspirationeer/Librarian Naming");

checkFalse(
  "leadership_no_standalone_inspirationeer_name",
  LEADERSHIP.includes('role("library", "Inspirationeer",'),
  "leadership.ts must not contain standalone 'Inspirationeer' role name for library id",
);

checkTrue(
  "leadership_inspirationeer_librarian_present",
  LEADERSHIP.includes('"Inspirationeer / Librarian"'),
  "leadership.ts must contain '\"Inspirationeer / Librarian\"'",
);

checkTrue(
  "leadership_library_id_preserved",
  LEADERSHIP.includes('"library"'),
  "leadership.ts must preserve id key '\"library\"' (used by getExistingRoleHeadcount)",
);

checkFalse(
  "exec_org_no_standalone_librarian_label",
  EXEC_ORG_MODEL.includes('label: "Librarian"'),
  "executiveOrgDesignModel.ts must not contain standalone label '\"Librarian\"'",
);

checkTrue(
  "exec_org_inspirationeer_librarian_label_present",
  EXEC_ORG_MODEL.includes('"Inspirationeer / Librarian"'),
  "executiveOrgDesignModel.ts must contain '\"Inspirationeer / Librarian\"' label",
);

// ── Section H — Calculation keys preserved ────────────────────────────────────
console.log("\nSection H — Calculation Keys Preserved (teaching.ts)");

checkTrue(
  "teaching_hs_subject_distribution_signature_key_preserved",
  TEACHING.includes('subject: "Signature"'),
  "teaching.ts HS_SUBJECT_DISTRIBUTION must preserve 'Signature' calculation key",
);

checkTrue(
  "teaching_hs_subject_distribution_bilingual_key_preserved",
  TEACHING.includes('subject: "Bilingual"'),
  "teaching.ts HS_SUBJECT_DISTRIBUTION must preserve 'Bilingual' calculation key",
);

// ── Section I — Governance invariants ────────────────────────────────────────
console.log("\nSection I — Governance Invariants");

checkTrue(
  "governance_flags_remain_false",
  FINANCE_SOURCE_CLOSURE_COMPLETE === false && BOARD_RATIFICATION_READY === false,
  `FINANCE_SOURCE_CLOSURE_COMPLETE=${FINANCE_SOURCE_CLOSURE_COMPLETE}, BOARD_RATIFICATION_READY=${BOARD_RATIFICATION_READY}`,
);

// ── Summary ───────────────────────────────────────────────────────────────────

const EXPECTED_TOTAL = 27;
const totalRun = passCount + failCount;
const finalIcon = failCount === 0 ? "✓" : "✗";

console.log(
  `\n${finalIcon} Phase 15L.2 academic-staffing content validation: ${passCount}/${totalRun} pass, ${failCount} fail`,
);

if (totalRun !== EXPECTED_TOTAL) {
  console.log(`  WARNING: expected ${EXPECTED_TOTAL} checks, ran ${totalRun}`);
}

if (failCount > 0) {
  process.exitCode = 1;
}
