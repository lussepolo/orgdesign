import { useEffect, useRef } from "react";
import { GraduationCap, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { WORKSPACE_REGISTRY } from "../../config/workspaceRegistry";
import { APP_VERSION_LABEL } from "../../config/appMetadata";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAB_COLORS: Record<string, string> = {
  cover: "bg-slate-100 text-slate-700",
  "offer-scenarios": "bg-teal-100 text-teal-700",
  "executive-org-design": "bg-indigo-100 text-indigo-700",
  hr: "bg-blue-100 text-blue-700",
  "early-years": "bg-rose-100 text-rose-700",
  "lower-school": "bg-emerald-100 text-emerald-700",
  ms: "bg-violet-100 text-violet-700",
  hs: "bg-purple-100 text-purple-700",
  load: "bg-amber-100 text-amber-700",
  payroll: "bg-orange-100 text-orange-700",
  viability: "bg-lime-100 text-lime-700",
  "dre-scenario-simulator": "bg-sky-100 text-sky-700",
  "contribution-margin": "bg-cyan-100 text-cyan-700",
  "capital-decision": "bg-red-100 text-red-700",
};

// V10-X2T: AboutModal reads its per-workspace descriptions from
// WORKSPACE_REGISTRY (purposeKey) instead of maintaining a second,
// driftable copy — the registry is the single source of truth for
// workspace-level copy across nav, headings, banners, and this modal.
export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLocale();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const describedWorkspaces = WORKSPACE_REGISTRY.filter((w) => w.purposeKey).sort((a, b) => a.order - b.order);

  const stats = [
    { labelKey: "aboutModalStatCostLogicLabel", valueKey: "aboutModalStatCostLogicValue" },
    { labelKey: "aboutModalStatTuitionGrowthLabel", valueKey: "aboutModalStatTuitionGrowthValue" },
    { labelKey: "aboutModalStatTurmasSourceLabel", valueKey: "aboutModalStatTurmasSourceValue" },
    { labelKey: "aboutModalStatCoverageScopeLabel", valueKey: "aboutModalStatCoverageScopeValue" },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-modal-title"
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 id="about-modal-title" className="text-xl font-black text-slate-900 tracking-tight">{t("aboutModalTitle")}</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {t("aboutModalSubtitle")}
                  </p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={t("aboutModalCloseLabel")}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-6">
              <p className="text-xs text-slate-600 leading-relaxed">{t("aboutModalIntro")}</p>
            </div>

            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                {t("aboutModalTabsHeading")}
              </p>
              <div className="space-y-2">
                {describedWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", TAB_COLORS[workspace.id] ?? "bg-slate-300")} />
                    <div>
                      <div className="text-[11px] font-black text-slate-800">{t(workspace.titleKey)}</div>
                      <div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                        {workspace.purposeKey ? t(workspace.purposeKey) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {stats.map((item) => (
                <div key={item.labelKey} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{t(item.labelKey)}</div>
                  <div className="text-[11px] font-bold text-slate-800 mt-0.5">{t(item.valueKey)}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 italic">{t("aboutModalFooterNote")}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">{APP_VERSION_LABEL}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AboutModal;
