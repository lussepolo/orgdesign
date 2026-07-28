import type { Locale } from "./localeContract";

// V10-X2T: presentation-only locale-aware formatting. These helpers format
// already-computed numbers for display — they must never be used inside a
// calculation path, and must never change the underlying numeric value.
// Currency stays BRL in both locales; only digit grouping/decimal symbol
// and currency-symbol placement change with locale.

export function formatCurrencyBRL(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number, locale: Locale, fractionDigits = 0): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, locale: Locale, fractionDigits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(value: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}
