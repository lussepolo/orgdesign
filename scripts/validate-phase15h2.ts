import { runSecondaryEducatorCapacityValidation } from "../src/features/rio-scenario-resilience/model/secondaryEducatorCapacityValidation.ts";

const EXPECTED = 30;
const report = runSecondaryEducatorCapacityValidation();

for (const result of report.checks) {
  const icon = result.pass ? "✓" : "✗";
  console.log(`${icon} ${result.checkId}: ${result.actual} (expected ${result.expected})`);
  if (!result.pass) {
    console.log(`  ${result.note}`);
  }
}

const totalChecks = report.passCount + report.failCount;
const allGreen = report.allPass && report.passCount === EXPECTED;
const icon = allGreen ? "✓" : "✗";

console.log(`\n${icon} Phase 15H.2 secondary educator capacity: ${report.passCount}/${EXPECTED} pass, ${report.failCount} fail, ${totalChecks} total`);

if (!allGreen) {
  process.exitCode = 1;
}
