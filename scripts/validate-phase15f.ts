import { runDreEngineValidation } from "../src/features/rio-scenario-resilience/model/dreEngineValidation.ts";
import { runCapitalDecisionEngineValidation } from "../src/features/rio-scenario-resilience/model/capitalDecisionEngineValidation.ts";
import { runPhase15CInvestmentMetricsValidation } from "../src/features/rio-scenario-resilience/model/phase15cInvestmentMetricsEngineValidation.ts";
import { runDiscountedPaybackEngineValidation } from "../src/features/rio-scenario-resilience/model/discountedPaybackEngineValidation.ts";
import { runPhase15DLeverPropagationValidation } from "../src/features/rio-scenario-resilience/model/phase15dDecisionLeverPropagationValidation.ts";
import { runPhase15EInvestmentInterpretationValidation } from "../src/features/rio-scenario-resilience/model/phase15eInvestmentInterpretationValidation.ts";
import { runPhase15FUiIntegrationValidation } from "../src/features/rio-scenario-resilience/components/CapitalDecision/phase15fUiIntegrationValidation.ts";

const phases: Array<[string, { passCount: number; failCount: number; allPass: boolean }]> = [
  ["DRE", runDreEngineValidation()],
  ["Phase 15B", runCapitalDecisionEngineValidation()],
  ["Phase 15C", runPhase15CInvestmentMetricsValidation()],
  ["Phase 15D", runDiscountedPaybackEngineValidation()],
  ["Phase 15D.2", runPhase15DLeverPropagationValidation()],
  ["Phase 15E", runPhase15EInvestmentInterpretationValidation()],
  ["Phase 15F", runPhase15FUiIntegrationValidation()],
];

const EXPECTED = [20, 25, 28, 36, 15, 40, 21];
const EXPECTED_TOTAL = 185;

let totalPass = 0;
let totalFail = 0;
let allGreen = true;

for (let i = 0; i < phases.length; i++) {
  const [label, r] = phases[i];
  const expected = EXPECTED[i];
  const icon = r.allPass && r.passCount === expected ? "✓" : "✗";
  console.log(`${icon} ${label}: ${r.passCount}/${expected} pass, ${r.failCount} fail`);
  totalPass += r.passCount;
  totalFail += r.failCount;
  if (!r.allPass || r.passCount !== expected) allGreen = false;
}

const totalChecks = totalPass + totalFail;
const aggregateOk = allGreen && totalPass === EXPECTED_TOTAL && totalFail === 0;
const aggregateIcon = aggregateOk ? "✓" : "✗";
console.log("");
console.log(`${aggregateIcon} Aggregate: ${totalPass}/${EXPECTED_TOTAL} (${totalFail} fail, ${totalChecks} total)`);

if (!aggregateOk) process.exit(1);
