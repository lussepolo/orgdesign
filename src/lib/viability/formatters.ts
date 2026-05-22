import type { ViabilityKpi, ViabilityMetric } from "./types";
import { formatBRL } from "../utils";

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(1)}%`;
}

export function formatYears(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(1)} yrs`;
}

export function formatMultiple(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${value.toFixed(2)}x`;
}

export function formatCalendarYear(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  return `${Math.round(value)}`;
}

export function formatMetricValue(metric: ViabilityMetric, value: number): string {
  if (metric === "VPL") return formatBRL(value);
  if (metric === "TIR") return formatPercent(value);
  return formatYears(value);
}

export function formatKpiValue(kpi: ViabilityKpi): string {
  if (!Number.isFinite(kpi.value)) return "n/a";
  if (kpi.format === "currency") return formatBRL(kpi.value);
  if (kpi.format === "percent") return formatPercent(kpi.value);
  if (kpi.format === "years") return formatYears(kpi.value);
  if (kpi.format === "year") return formatCalendarYear(kpi.value);
  return formatMultiple(kpi.value);
}
