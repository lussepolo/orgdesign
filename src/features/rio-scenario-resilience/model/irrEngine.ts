// Phase 15C-DCF-VPL-TIR-PERPETUITY — IRR engine.
//
// Pure, deterministic Newton-Raphson solver with a bracket-search +
// bisection fallback, matching Excel's IRR() default behavior (initial
// guess 0.10) for the cash-flow convention cashFlows[i] has exponent i
// (cashFlows[0] = exponent 0, i.e. PnL!IRR(B295:W295) treats B295 as
// "today").

import type { IrrEngineInput, IrrResult, IrrStatus } from "./irrEngineContract";

const INITIAL_GUESS = 0.1;
const MAX_NEWTON_ITERATIONS = 100;
const RATE_DELTA_TOLERANCE = 1e-10;
const NPV_RESIDUAL_TOLERANCE_BRL = 0.01;
// Rate domain must remain > -1 (1 + rate > 0). Stay strictly inside the
// domain to avoid division by zero / negative bases raised to fractional
// exponents (not applicable here since exponents are integers, but a
// non-positive base still makes (1+rate)^i sign-flip unpredictably for
// large i).
const MIN_RATE = -1 + 1e-9;
const MAX_BRACKET_RATE = 10; // 1000% -- generous upper bound for the search grid.
const BRACKET_STEPS = 2000;
const MAX_BISECTION_ITERATIONS = 200;

function npvAtRate(cashFlows: readonly number[], rate: number): number {
  let total = 0;
  for (let i = 0; i < cashFlows.length; i += 1) {
    total += cashFlows[i] / Math.pow(1 + rate, i);
  }
  return total;
}

function npvDerivativeAtRate(cashFlows: readonly number[], rate: number): number {
  let total = 0;
  for (let i = 1; i < cashFlows.length; i += 1) {
    total += (-i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
  }
  return total;
}

function countSignChanges(cashFlows: readonly number[]): number {
  const nonZero = cashFlows.filter((cf) => cf !== 0);
  let changes = 0;
  for (let i = 1; i < nonZero.length; i += 1) {
    if ((nonZero[i] > 0) !== (nonZero[i - 1] > 0)) {
      changes += 1;
    }
  }
  return changes;
}

function allSameSign(cashFlows: readonly number[]): boolean {
  const nonZero = cashFlows.filter((cf) => cf !== 0);
  if (nonZero.length === 0) {
    return true;
  }
  const allPositive = nonZero.every((cf) => cf > 0);
  const allNegative = nonZero.every((cf) => cf < 0);
  return allPositive || allNegative;
}

// Newton-Raphson from the standard 0.10 seed. Returns null if it does not
// converge within MAX_NEWTON_ITERATIONS or leaves the valid rate domain.
function newtonRaphson(
  cashFlows: readonly number[],
): { rate: number; iterations: number; residual: number } | null {
  let rate = INITIAL_GUESS;
  for (let iteration = 1; iteration <= MAX_NEWTON_ITERATIONS; iteration += 1) {
    const npv = npvAtRate(cashFlows, rate);
    if (Math.abs(npv) <= NPV_RESIDUAL_TOLERANCE_BRL) {
      return { rate, iterations: iteration, residual: npv };
    }

    const derivative = npvDerivativeAtRate(cashFlows, rate);
    if (derivative === 0 || !Number.isFinite(derivative)) {
      return null;
    }

    const nextRate = rate - npv / derivative;
    if (!Number.isFinite(nextRate) || nextRate <= MIN_RATE) {
      return null;
    }

    if (Math.abs(nextRate - rate) <= RATE_DELTA_TOLERANCE) {
      const residual = npvAtRate(cashFlows, nextRate);
      return { rate: nextRate, iterations: iteration, residual };
    }

    rate = nextRate;
  }
  return null;
}

// Deterministic bracket scan over (MIN_RATE, MAX_BRACKET_RATE], followed by
// bisection on the first bracket containing a sign change.
function bracketAndBisect(
  cashFlows: readonly number[],
): { rate: number; iterations: number; residual: number } | null {
  const step = (MAX_BRACKET_RATE - MIN_RATE) / BRACKET_STEPS;
  let previousRate = MIN_RATE;
  let previousNpv = npvAtRate(cashFlows, previousRate);

  for (let i = 1; i <= BRACKET_STEPS; i += 1) {
    const currentRate = MIN_RATE + i * step;
    const currentNpv = npvAtRate(cashFlows, currentRate);

    if (previousNpv === 0) {
      return { rate: previousRate, iterations: i, residual: previousNpv };
    }
    if (currentNpv === 0) {
      return { rate: currentRate, iterations: i, residual: currentNpv };
    }

    if ((previousNpv > 0) !== (currentNpv > 0)) {
      let low = previousRate;
      let high = currentRate;
      let lowNpv = previousNpv;
      let highNpv = currentNpv;

      for (let b = 1; b <= MAX_BISECTION_ITERATIONS; b += 1) {
        const mid = (low + high) / 2;
        const midNpv = npvAtRate(cashFlows, mid);

        if (Math.abs(midNpv) <= NPV_RESIDUAL_TOLERANCE_BRL || (high - low) / 2 <= RATE_DELTA_TOLERANCE) {
          return { rate: mid, iterations: i + b, residual: midNpv };
        }

        if ((lowNpv > 0) !== (midNpv > 0)) {
          high = mid;
          highNpv = midNpv;
        } else {
          low = mid;
          lowNpv = midNpv;
        }
      }
      // Bisection exhausted its iteration budget without meeting tolerance.
      const mid = (low + high) / 2;
      return { rate: mid, iterations: BRACKET_STEPS + MAX_BISECTION_ITERATIONS, residual: npvAtRate(cashFlows, mid) };
    }

    previousRate = currentRate;
    previousNpv = currentNpv;
  }

  return null;
}

export function calculateIrr(input: IrrEngineInput): IrrResult {
  const { cashFlows } = input;

  for (const cf of cashFlows) {
    if (!Number.isFinite(cf)) {
      throw new Error(`calculateIrr: cash-flow series contains a non-finite value (${cf}).`);
    }
  }

  if (cashFlows.length < 2) {
    throw new Error(`calculateIrr: cash-flow series must contain at least 2 entries, received ${cashFlows.length}.`);
  }

  const multipleRootsPossible = countSignChanges(cashFlows) > 1;

  if (allSameSign(cashFlows)) {
    return {
      irrRate: null,
      status: "no_sign_change",
      statusReason:
        "All cash flows (including the terminal value) have the same sign (or are zero); " +
        "no internal rate of return exists for this series.",
      multipleRootsPossible: false,
      iterations: 0,
      finalResidualBRL: null,
    };
  }

  const newtonResult = newtonRaphson(cashFlows);
  if (newtonResult) {
    return makeResult("calculated", "Newton-Raphson converged from the standard 0.10 seed.", newtonResult, multipleRootsPossible);
  }

  const fallbackResult = bracketAndBisect(cashFlows);
  if (fallbackResult) {
    return makeResult(
      "calculated",
      "Newton-Raphson did not converge from the standard 0.10 seed; resolved via deterministic bracket search + bisection.",
      fallbackResult,
      multipleRootsPossible,
    );
  }

  return {
    irrRate: null,
    status: "did_not_converge",
    statusReason:
      "Neither Newton-Raphson (seed 0.10) nor the deterministic bracket search + bisection " +
      `over (${MIN_RATE}, ${MAX_BRACKET_RATE}] found a root within tolerance.`,
    multipleRootsPossible,
    iterations: MAX_NEWTON_ITERATIONS,
    finalResidualBRL: null,
  };
}

function makeResult(
  status: IrrStatus,
  statusReason: string,
  solved: { rate: number; iterations: number; residual: number },
  multipleRootsPossible: boolean,
): IrrResult {
  return {
    irrRate: solved.rate,
    status,
    statusReason,
    multipleRootsPossible,
    iterations: solved.iterations,
    finalResidualBRL: solved.residual,
  };
}
