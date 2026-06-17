// Phase 15I.2 — Finance Confirmation Packet Validator
//
// 25 checks covering: file existence, F01–F06 presence, null approval fields,
// governance state invariants, enrollment value documentation (228 and 246,
// neither declared authoritative), payroll/capacity state, and no forbidden wording.
//
// Run via: npm run validate:phase15i2-packet
//
// Import restriction: only dreGovernanceReadiness (zero-dependency, tracked).
// Artifact files are read via cwd-relative paths — safe in clean-index exports.

import * as fs from "fs";
import * as path from "path";
import { DRE_GOVERNANCE_READINESS } from "../src/features/rio-scenario-resilience/model/dreGovernanceReadiness.ts";

// ── Types ─────────────────────────────────────────────────────────────────────

type CheckId =
  | "packet_file_exists"
  | "register_file_exists"
  | "agenda_file_exists"
  | "packet_contains_f01"
  | "packet_contains_f02"
  | "packet_contains_f03"
  | "packet_contains_f04"
  | "packet_contains_f05"
  | "packet_contains_f06"
  | "register_is_valid_json"
  | "register_has_six_items"
  | "all_items_decision_status_open"
  | "all_items_no_approval_recorded"
  | "register_enrollment_not_declared_authoritative"
  | "governance_engineering_ready"
  | "governance_finance_pending"
  | "governance_board_not_ratified"
  | "governance_open_items_count_six"
  | "packet_mentions_228"
  | "packet_mentions_246"
  | "governance_payroll_implemented"
  | "governance_alignment_reconciliation_required"
  | "packet_no_forbidden_wording"
  | "packet_contains_calculation_can_begin"
  | "register_finance_closure_false";

interface Check {
  checkId: CheckId;
  pass: boolean;
  expected: string;
  actual: string;
  note: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolvePath(relative: string): string {
  return path.join(process.cwd(), relative);
}

function fileExists(relative: string): boolean {
  try {
    fs.accessSync(resolvePath(relative), fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function readText(relative: string): string {
  return fs.readFileSync(resolvePath(relative), "utf-8");
}

function readJson(relative: string): unknown {
  return JSON.parse(readText(relative));
}

function makeCheck(
  checkId: CheckId,
  actual: unknown,
  expected: unknown,
  note: string,
): Check {
  const actualStr = typeof actual === "string" ? actual : JSON.stringify(actual);
  const expectedStr = typeof expected === "string" ? expected : JSON.stringify(expected);
  return {
    checkId,
    pass: Object.is(actual, expected),
    expected: expectedStr,
    actual: actualStr,
    note,
  };
}

// ── Artifact paths ─────────────────────────────────────────────────────────────

const PACKET_PATH = "docs/finance/dre-finance-confirmation-packet.md";
const REGISTER_PATH = "docs/finance/dre-finance-confirmation-register.json";
const AGENDA_PATH = "docs/finance/dre-finance-confirmation-agenda.md";

// ── Build checks ──────────────────────────────────────────────────────────────

const checks: Check[] = [];

// Phase A — Artifact existence (3)

const packetExists = fileExists(PACKET_PATH);
const registerExists = fileExists(REGISTER_PATH);
const agendaExists = fileExists(AGENDA_PATH);

checks.push(makeCheck(
  "packet_file_exists",
  packetExists,
  true,
  `${PACKET_PATH} must exist.`,
));

checks.push(makeCheck(
  "register_file_exists",
  registerExists,
  true,
  `${REGISTER_PATH} must exist.`,
));

checks.push(makeCheck(
  "agenda_file_exists",
  agendaExists,
  true,
  `${AGENDA_PATH} must exist.`,
));

// Phase B — F01–F06 presence in packet (6)
// Read packet text only when the file exists to avoid throwing on absence.

const packetText = packetExists ? readText(PACKET_PATH) : "";

checks.push(makeCheck(
  "packet_contains_f01",
  packetText.includes("F01"),
  true,
  "Packet must document Finance open item F01 (Outras Receitas reajuste).",
));

checks.push(makeCheck(
  "packet_contains_f02",
  packetText.includes("F02"),
  true,
  "Packet must document Finance open item F02 (Descontos Método formula base).",
));

checks.push(makeCheck(
  "packet_contains_f03",
  packetText.includes("F03"),
  true,
  "Packet must document Finance open item F03 (tuition source provenance).",
));

checks.push(makeCheck(
  "packet_contains_f04",
  packetText.includes("F04"),
  true,
  "Packet must document Finance open item F04 (discount schedule provenance).",
));

checks.push(makeCheck(
  "packet_contains_f05",
  packetText.includes("F05"),
  true,
  "Packet must document Finance open item F05 (enrollment baseline parity).",
));

checks.push(makeCheck(
  "packet_contains_f06",
  packetText.includes("F06"),
  true,
  "Packet must document Finance open item F06 (instructional capacity / FOPAG sync).",
));

// Phase C — Decision register structure (4)
// Parse register only when the file exists.

type RegisterItem = {
  decisionStatus: string;
  approvedFormula: unknown;
  approvedValue: unknown;
  approvedSourceReference: unknown;
  decisionDate: unknown;
  owner: unknown;
};

type RegisterJson = {
  openItems: RegisterItem[];
  governanceState: {
    FINANCE_SOURCE_CLOSURE_COMPLETE: boolean;
  };
  enrollmentDocumentation: {
    authoritative2028Enrollment: unknown;
  };
};

let register: RegisterJson | null = null;
let registerParseOk = false;
if (registerExists) {
  try {
    register = readJson(REGISTER_PATH) as RegisterJson;
    registerParseOk =
      register !== null &&
      typeof register === "object" &&
      Array.isArray((register as RegisterJson).openItems);
  } catch {
    registerParseOk = false;
  }
}

checks.push(makeCheck(
  "register_is_valid_json",
  registerParseOk,
  true,
  `${REGISTER_PATH} must be valid JSON with an openItems array.`,
));

const itemCount = register !== null ? register.openItems.length : -1;
checks.push(makeCheck(
  "register_has_six_items",
  itemCount,
  6,
  "Register must contain exactly 6 open Finance items.",
));

const allStatusOpen =
  register !== null && register.openItems.every((item) => item.decisionStatus === "open");
checks.push(makeCheck(
  "all_items_decision_status_open",
  allStatusOpen,
  true,
  "All register items must have decisionStatus === 'open'; Finance confirmation has not occurred.",
));

const allNoApprovalRecorded =
  register !== null &&
  register.openItems.every(
    (item) =>
      item.approvedFormula === null &&
      item.approvedValue === null &&
      item.approvedSourceReference === null &&
      item.decisionDate === null &&
      item.owner === null,
  );
checks.push(makeCheck(
  "all_items_no_approval_recorded",
  allNoApprovalRecorded,
  true,
  "All five approval fields (approvedFormula, approvedValue, approvedSourceReference, decisionDate, owner) must be null — no Finance item is confirmed and no decision is assigned.",
));

const enrollmentNotAuthoritative =
  register !== null
    ? register.enrollmentDocumentation.authoritative2028Enrollment === null
    : false;
checks.push(makeCheck(
  "register_enrollment_not_declared_authoritative",
  enrollmentNotAuthoritative,
  true,
  "register.enrollmentDocumentation.authoritative2028Enrollment must be null — neither 228 nor 246 has been declared authoritative by Finance or Board.",
));

// Phase D — Governance state invariants (4)
// Imported from dreGovernanceReadiness.ts (zero-dependency, tracked).

const gov = DRE_GOVERNANCE_READINESS;

checks.push(makeCheck(
  "governance_engineering_ready",
  gov.engineeringReadiness,
  "engineering_ready",
  "DRE_GOVERNANCE_READINESS.engineeringReadiness must be 'engineering_ready' — engine is implemented.",
));

checks.push(makeCheck(
  "governance_finance_pending",
  gov.financeSourceReadiness,
  "pending_finance_confirmation",
  "DRE_GOVERNANCE_READINESS.financeSourceReadiness must be 'pending_finance_confirmation' — Finance has not confirmed.",
));

checks.push(makeCheck(
  "governance_board_not_ratified",
  gov.boardRatificationReadiness,
  "not_ratified",
  "DRE_GOVERNANCE_READINESS.boardRatificationReadiness must be 'not_ratified' — board has not ratified.",
));

checks.push(makeCheck(
  "governance_open_items_count_six",
  gov.openItems.length,
  6,
  "DRE_GOVERNANCE_READINESS.openItems must contain exactly 6 Finance-source open items.",
));

// Phase E — Enrollment documentation (2)
// Both 228 (engine) and 246 (PnL workbook) must be present in the packet.

checks.push(makeCheck(
  "packet_mentions_228",
  packetText.includes("228"),
  true,
  "Packet must document engine canonical enrollment of 228 learners in 2028.",
));

checks.push(makeCheck(
  "packet_mentions_246",
  packetText.includes("246"),
  true,
  "Packet must document PnL workbook baseline of ~246 learners in 2028.",
));

// Phase F — Payroll / capacity state (2)

checks.push(makeCheck(
  "governance_payroll_implemented",
  gov.payrollFopagModelStatus,
  "implemented",
  "payrollFopagModelStatus must be 'implemented' — FOPAG model is in place.",
));

checks.push(makeCheck(
  "governance_alignment_reconciliation_required",
  gov.payrollCapacityAlignmentStatus,
  "reconciliation_required",
  "payrollCapacityAlignmentStatus must be 'reconciliation_required' — synchronization is pending.",
));

// Phase G — Wording checks (3)

// Check packet does NOT contain the removed blocking reason string.
const noForbiddenWording = !packetText.includes("missing_payroll_fopag_synchronization");
checks.push(makeCheck(
  "packet_no_forbidden_wording",
  noForbiddenWording,
  true,
  "Packet must not contain 'missing_payroll_fopag_synchronization' — that blocking reason was removed in Phase 15I.1; payroll models are both implemented.",
));

// Check packet declares engine calculates today (governance section presence).
const hasCalculationDeclaration = packetText.includes("CALCULATION_CAN_BEGIN");
checks.push(makeCheck(
  "packet_contains_calculation_can_begin",
  hasCalculationDeclaration,
  true,
  "Packet must declare CALCULATION_CAN_BEGIN governance state — engine calculates today.",
));

// Phase H — Register governance block (1)

const registerFinanceClosed =
  register !== null ? register.governanceState.FINANCE_SOURCE_CLOSURE_COMPLETE : null;
checks.push(makeCheck(
  "register_finance_closure_false",
  registerFinanceClosed,
  false,
  "Register governanceState.FINANCE_SOURCE_CLOSURE_COMPLETE must be false — Finance-source confirmation gate is not cleared.",
));

// ── Count guard ───────────────────────────────────────────────────────────────

const EXPECTED_CHECK_COUNT = 25;
if (checks.length !== EXPECTED_CHECK_COUNT) {
  throw new Error(
    `validate-phase15i2-packet: expected ${EXPECTED_CHECK_COUNT} checks, got ${checks.length}`,
  );
}

// ── Output ────────────────────────────────────────────────────────────────────

for (const result of checks) {
  const icon = result.pass ? "✓" : "✗";
  console.log(
    `${icon} ${result.checkId}: ${result.actual} (expected ${result.expected})`,
  );
  if (!result.pass) {
    console.log(`  ${result.note}`);
  }
}

const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;
const allGreen = failCount === 0 && passCount === EXPECTED_CHECK_COUNT;
const summaryIcon = allGreen ? "✓" : "✗";

console.log(
  `\n${summaryIcon} Phase 15I.2 packet validation: ${passCount}/${EXPECTED_CHECK_COUNT} pass, ${failCount} fail, ${checks.length} total`,
);

if (!allGreen) {
  process.exitCode = 1;
}
