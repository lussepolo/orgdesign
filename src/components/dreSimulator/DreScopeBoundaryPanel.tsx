import { Layers, ShieldCheck, TrendingUp, BookOpen } from "lucide-react";
import { Card } from "../common/Card";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";

const DRE_OPERATING_ITEM_KEYS: TranslationKey[] = [
  "dreScopeBoundaryOpItem1",
  "dreScopeBoundaryOpItem2",
  "dreScopeBoundaryOpItem3",
  "dreScopeBoundaryOpItem4",
  "dreScopeBoundaryOpItem5",
  "dreScopeBoundaryOpItem6",
  "dreScopeBoundaryOpItem7",
  "dreScopeBoundaryOpItem8",
];

const CAPITAL_INVESTMENT_ITEM_KEYS: TranslationKey[] = [
  "dreScopeBoundaryCapItem1",
  "dreScopeBoundaryCapItem2",
  "dreScopeBoundaryCapItem3",
  "dreScopeBoundaryCapItem4",
  "dreScopeBoundaryCapItem5",
];

const SOURCE_GOVERNANCE_ITEM_KEYS: TranslationKey[] = [
  "dreScopeBoundarySrcItem1",
  "dreScopeBoundarySrcItem2",
  "dreScopeBoundarySrcItem3",
  "dreScopeBoundarySrcItem4",
];

export default function DreScopeBoundaryPanel() {
  const { t } = useLocale();
  return (
    <Card
      title={t("dreScopeBoundaryTitle")}
      icon={Layers}
      className="border-cockpit-border bg-cockpit-card shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
    >
      <p className="mb-4 text-sm leading-relaxed text-cockpit-meta">
        {t("dreScopeBoundaryIntro")}
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border-l-4 border-cockpit-positive-border bg-cockpit-teal-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-teal">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("dreScopeBoundaryOperatingLayerHeader")}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            {t("dreScopeBoundaryOperatingLayerBody")}
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {DRE_OPERATING_ITEM_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-amber-border bg-cockpit-amber-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-amber">
            <TrendingUp className="h-3.5 w-3.5" />
            {t("dreScopeBoundaryCapitalLayerHeader")}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            {t("dreScopeBoundaryCapitalLayerBody")}
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-cockpit-slate">
            {CAPITAL_INVESTMENT_ITEM_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border-l-4 border-cockpit-indigo-border bg-cockpit-indigo-fill p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cockpit-indigo">
            <BookOpen className="h-3.5 w-3.5" />
            {t("dreScopeBoundarySourceGovernanceHeader")}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-cockpit-meta">
            {t("dreScopeBoundarySourceGovernanceBody")}
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-cockpit-slate">
            {SOURCE_GOVERNANCE_ITEM_KEYS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
