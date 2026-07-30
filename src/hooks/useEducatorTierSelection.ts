// V10-RC2.5 Gate 2/Tranche A — shared Educator tier-selection state.
//
// One feature-level contract consumed by both the Org Design and Payroll
// workspaces, instantiated once in AppShell (App.tsx) — the same
// "lift state above the tab-switch unmount boundary" pattern already used
// for dreSelections and useCapitalDecisionWorkspace. Not a React Context,
// not a separate store: a single useState here, returned as a small
// controller object and passed down as props, same as the rest of the app.
//
// Selection identity is (openingPackageId, occupancyScenarioId,
// orgDesignOptionId, gradeId) — never keyed by tab, projection year, or
// translated display label. Switching any of those four dimensions looks up
// a different slice of the map by construction, so a selection made under
// one scenario configuration is never presented as active under another —
// there is no separate "current" pointer to go stale.
//
// Absence of an explicit selection for a given key resolves to "master",
// the same governed default payrollAdapter.ts itself falls back to when no
// selection is supplied at all. This is a documented default, not a
// silently-invented "first available tier" pick — see
// payrollAdapterContract.ts EducatorTierId / resolveEducatorTier().
//
// Assistant has no selectable tier (see Gate 5/Gate 1 trace: exactly one
// governed Assistant compensation record exists in source data) and is
// intentionally not represented here at all.

import { useCallback, useState } from "react";
import {
  DEFAULT_EDUCATOR_TIER_ID,
  EDUCATOR_TIER_IDS,
  type EducatorTierId,
} from "../features/rio-scenario-resilience/model/payrollAdapterContract";

// V10-RC2.5 Gate 3/Tranche B: re-exported under this hook's established
// names so existing callers/imports keep working — the underlying list now
// lives once in payrollAdapterContract.ts (single source shared with
// payrollAdapter.ts's own tier resolution), not duplicated here.
export const VALID_EDUCATOR_TIER_IDS = EDUCATOR_TIER_IDS;

export function isValidEducatorTierId(value: string): value is EducatorTierId {
  return (VALID_EDUCATOR_TIER_IDS as readonly string[]).includes(value);
}

export interface EducatorTierSelectionKey {
  readonly openingPackageId: string;
  readonly occupancyScenarioId: string;
  readonly orgDesignOptionId: string;
  readonly gradeId: string;
}

function toSelectionMapKey(key: EducatorTierSelectionKey): string {
  return `${key.openingPackageId}:${key.occupancyScenarioId}:${key.orgDesignOptionId}:${key.gradeId.toLowerCase()}`;
}

export const EDUCATOR_TIER_GOVERNED_DEFAULT: EducatorTierId = DEFAULT_EDUCATOR_TIER_ID;

export interface UseEducatorTierSelectionResult {
  // Resolved tier for one (scenario, grade) key — always a valid
  // EducatorTierId; "master" if nothing has been explicitly selected yet.
  getEducatorTier: (key: EducatorTierSelectionKey) => EducatorTierId;
  // true only if a selection was explicitly made for this exact key
  // (distinguishes "explicitly master" from "defaulted to master" for UI
  // display purposes, without changing the resolved value either way).
  hasExplicitEducatorTierSelection: (key: EducatorTierSelectionKey) => boolean;
  // Rejects invalid tier IDs at the boundary — an invalid id is a no-op,
  // never silently stored or silently promoted to a selection.
  setEducatorTier: (key: EducatorTierSelectionKey, tierId: string) => void;
  // V10-RC2.5 Gate 3/Tranche B: applies one tier to several grade keys in a
  // single state update (e.g. a Middle School "All → Master" preset button
  // fanning out to every grade in that division's governed fixed-FTE table).
  // Same invalid-id rejection as setEducatorTier, checked once up front.
  setEducatorTiersForGrades: (keys: readonly EducatorTierSelectionKey[], tierId: string) => void;
  // V10-RC2.5 Gate 3/Tranche B: clears EVERY explicit selection for one
  // (package, captação, org-design) scenario, regardless of which grade or
  // which projection year was active when each selection was made — the
  // correct semantics for a "Reset Defaults" control. A caller-supplied
  // grade-id list (e.g. derived from the currently-displayed year's active
  // grades) would miss selections made under a different year's active-grade
  // set, silently leaving them in place after a user believes they cleared
  // everything. This scans the same scenario-prefix
  // getEducatorTierByGradeForScenario() already uses, so it cannot miss a
  // key that function would have surfaced.
  clearEducatorTierSelectionsForScenario: (
    openingPackageId: string,
    occupancyScenarioId: string,
    orgDesignOptionId: string,
  ) => void;
  // Slice of the selection map for one (package, captação, org-design)
  // scenario, keyed by lowercase gradeId only — the exact shape
  // buildPayrollAdapterInput()'s educatorTierByGrade parameter expects.
  getEducatorTierByGradeForScenario: (
    openingPackageId: string,
    occupancyScenarioId: string,
    orgDesignOptionId: string,
  ) => Partial<Record<string, EducatorTierId>>;
}

export function useEducatorTierSelection(): UseEducatorTierSelectionResult {
  const [selections, setSelections] = useState<Record<string, EducatorTierId>>({});

  const getEducatorTier = useCallback(
    (key: EducatorTierSelectionKey): EducatorTierId =>
      selections[toSelectionMapKey(key)] ?? EDUCATOR_TIER_GOVERNED_DEFAULT,
    [selections],
  );

  const hasExplicitEducatorTierSelection = useCallback(
    (key: EducatorTierSelectionKey): boolean => toSelectionMapKey(key) in selections,
    [selections],
  );

  const setEducatorTier = useCallback((key: EducatorTierSelectionKey, tierId: string) => {
    if (!isValidEducatorTierId(tierId)) return;
    setSelections((prev) => ({ ...prev, [toSelectionMapKey(key)]: tierId }));
  }, []);

  const setEducatorTiersForGrades = useCallback((keys: readonly EducatorTierSelectionKey[], tierId: string) => {
    if (!isValidEducatorTierId(tierId)) return;
    setSelections((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        next[toSelectionMapKey(key)] = tierId;
      }
      return next;
    });
  }, []);

  const clearEducatorTierSelectionsForScenario = useCallback(
    (openingPackageId: string, occupancyScenarioId: string, orgDesignOptionId: string) => {
      const prefix = `${openingPackageId}:${occupancyScenarioId}:${orgDesignOptionId}:`;
      setSelections((prev) => {
        const next = { ...prev };
        for (const mapKey of Object.keys(prev)) {
          if (mapKey.startsWith(prefix)) delete next[mapKey];
        }
        return next;
      });
    },
    [],
  );

  const getEducatorTierByGradeForScenario = useCallback(
    (openingPackageId: string, occupancyScenarioId: string, orgDesignOptionId: string) => {
      const prefix = `${openingPackageId}:${occupancyScenarioId}:${orgDesignOptionId}:`;
      const result: Partial<Record<string, EducatorTierId>> = {};
      for (const [mapKey, tierId] of Object.entries(selections)) {
        if (mapKey.startsWith(prefix)) {
          result[mapKey.slice(prefix.length)] = tierId;
        }
      }
      return result;
    },
    [selections],
  );

  return {
    getEducatorTier,
    hasExplicitEducatorTierSelection,
    setEducatorTier,
    setEducatorTiersForGrades,
    clearEducatorTierSelectionsForScenario,
    getEducatorTierByGradeForScenario,
  };
}
