export type Locale = "pt-BR" | "en-US";

export const DEFAULT_LOCALE: Locale = "pt-BR";
export const SUPPORTED_LOCALES: readonly Locale[] = ["pt-BR", "en-US"];

// V10-X2T: single documented localStorage key for the persisted interface
// language preference. Distinct from 'hasSeenAbout_v3.0' (About-modal
// first-view flag) — do not conflate the two.
export const LOCALE_STORAGE_KEY = "rio-org-design.locale.v1";

export type { TranslationKey } from "./pt-BR";
