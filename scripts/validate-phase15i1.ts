import { runDreGovernanceReadinessValidation } from "../src/features/rio-scenario-resilience/model/dreGovernanceReadinessValidation.ts";

const EXPECTED = 24;
const report = runDreGovernanceReadinessValidation();

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

console.log(`\n${icon} Phase 15I.1 DRE governance readiness: ${report.passCount}/${EXPECTED} pass, ${report.failCount} fail, ${totalChecks} total`);

if (!allGreen) {
  process.exitCode = 1;
}
