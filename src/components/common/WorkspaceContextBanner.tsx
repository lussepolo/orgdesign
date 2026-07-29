import React from "react";
import { ShieldCheck, FlaskConical, BookOpen, Gauge, Compass, ImageOff, PlugZap, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import type { TranslationKey } from "../../i18n/localeContract";
import { getWorkspace, type WorkspaceStatus, type WorkspaceSubviewDefinition } from "../../config/workspaceRegistry";
import type { TabId } from "../../App";

interface StatusTreatment {
  icon: React.ElementType;
  labelKey: TranslationKey;
  descKey: TranslationKey;
  className: string;
}

// Restrained status styling: canonical models get a clear, confident
// treatment; simulation/reference/diagnostic/directional get an
// informative treatment; illustrative/pending-integration get a clear
// caution treatment. No danger/error styling for ordinary reference
// content, per V10-X2T section 11.
const STATUS_TREATMENTS: Record<WorkspaceStatus, StatusTreatment> = {
  canonical: {
    icon: ShieldCheck,
    labelKey: "statusCanonicalLabel",
    descKey: "statusCanonicalDesc",
    className: "border-cockpit-positive-border bg-cockpit-positive-fill text-cockpit-positive",
  },
  simulation: {
    icon: FlaskConical,
    labelKey: "statusSimulationLabel",
    descKey: "statusSimulationDesc",
    className: "border-cockpit-indigo-border bg-cockpit-indigo-fill text-cockpit-indigo",
  },
  reference: {
    icon: BookOpen,
    labelKey: "statusReferenceLabel",
    descKey: "statusReferenceDesc",
    className: "border-cockpit-indigo-border bg-cockpit-indigo-fill text-cockpit-indigo",
  },
  diagnostic: {
    icon: Gauge,
    labelKey: "statusDiagnosticLabel",
    descKey: "statusDiagnosticDesc",
    className: "border-cockpit-indigo-border bg-cockpit-indigo-fill text-cockpit-indigo",
  },
  directional: {
    icon: Compass,
    labelKey: "statusDirectionalLabel",
    descKey: "statusDirectionalDesc",
    className: "border-cockpit-indigo-border bg-cockpit-indigo-fill text-cockpit-indigo",
  },
  illustrative: {
    icon: ImageOff,
    labelKey: "statusIllustrativeLabel",
    descKey: "statusIllustrativeDesc",
    className: "border-cockpit-amber-border bg-cockpit-amber-fill text-cockpit-amber",
  },
  pending_integration: {
    icon: PlugZap,
    labelKey: "statusPendingIntegrationLabel",
    descKey: "statusPendingIntegrationDesc",
    className: "border-cockpit-amber-border bg-cockpit-amber-fill text-cockpit-amber",
  },
  governed_data: {
    icon: ShieldCheck,
    labelKey: "statusGovernedDataLabel",
    descKey: "statusGovernedDataDesc",
    className: "border-cockpit-positive-border bg-cockpit-positive-fill text-cockpit-positive",
  },
  pending_validation: {
    icon: PlugZap,
    labelKey: "statusPendingValidationLabel",
    descKey: "statusPendingValidationDesc",
    className: "border-cockpit-amber-border bg-cockpit-amber-fill text-cockpit-amber",
  },
};

interface WorkspaceContextBannerProps {
  workspaceId: TabId;
  /** For workspaces with subviews (e.g. Turmas e Folha), which subview is active. */
  activeSubviewId?: string;
  onNavigate?: (id: TabId) => void;
}

export default function WorkspaceContextBanner({ workspaceId, activeSubviewId, onNavigate }: WorkspaceContextBannerProps) {
  const { t } = useLocale();
  const workspace = getWorkspace(workspaceId);

  const subview: WorkspaceSubviewDefinition | undefined = workspace.subviews?.find(
    (s) => s.id === activeSubviewId,
  ) ?? workspace.subviews?.[0];

  const status = subview?.status ?? workspace.status;
  const purposeKey = subview?.purposeKey ?? workspace.purposeKey;
  const decisionKey = subview?.decisionKey ?? workspace.decisionKey;
  const inputsKey = subview?.inputsKey ?? workspace.inputsKey;
  const impactKey = subview?.impactKey ?? workspace.impactKey;
  const resultKey = subview?.resultKey ?? workspace.resultKey;
  const noticeKey = subview?.noticeKey ?? workspace.noticeKey;
  const infoNoteKey = !subview ? workspace.infoNoteKey : undefined;

  if (!status || !purposeKey || !decisionKey || !inputsKey || !impactKey || !resultKey) {
    return null;
  }

  const treatment = STATUS_TREATMENTS[status];
  const StatusIcon = treatment.icon;
  const destination = workspace.canonicalDestination;

  const fields: Array<{ labelKey: TranslationKey; valueKey: TranslationKey }> = [
    { labelKey: "bannerPurposeLabel", valueKey: purposeKey },
    { labelKey: "bannerDecisionLabel", valueKey: decisionKey },
    { labelKey: "bannerInputsLabel", valueKey: inputsKey },
    { labelKey: "bannerImpactLabel", valueKey: impactKey },
    { labelKey: "bannerResultLabel", valueKey: resultKey },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-cockpit-border bg-cockpit-card p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
            treatment.className,
          )}
        >
          <StatusIcon className="h-3 w-3" />
          {t(treatment.labelKey)}
        </span>
        {destination ? (
          <button
            type="button"
            onClick={() => onNavigate?.(destination)}
            className="text-[10px] font-bold uppercase tracking-widest text-cockpit-meta underline decoration-dotted underline-offset-2 hover:text-cockpit-indigo"
          >
            {t("bannerDestinationLabel")}: {t(getWorkspace(destination).titleKey)}
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-cockpit-meta">{t(treatment.descKey)}</p>

      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((field) => (
          <div key={field.labelKey}>
            <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-cockpit-meta">{t(field.labelKey)}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-cockpit-slate">{t(field.valueKey)}</dd>
          </div>
        ))}
      </dl>

      {noticeKey ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-cockpit-amber-border bg-cockpit-amber-fill px-3 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cockpit-amber" />
          <p className="text-[11px] leading-relaxed text-cockpit-amber">{t(noticeKey)}</p>
        </div>
      ) : null}

      {infoNoteKey ? (
        <p className="mt-3 text-[11px] leading-relaxed text-cockpit-meta">{t(infoNoteKey)}</p>
      ) : null}

      {!subview && workspace.evidenceSections && workspace.evidenceSections.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-cockpit-border-soft pt-3">
          {workspace.evidenceSections.map((section) => {
            const sectionTreatment = STATUS_TREATMENTS[section.status];
            const SectionIcon = sectionTreatment.icon;
            return (
              <span
                key={section.id}
                title={section.descriptionKey ? t(section.descriptionKey) : undefined}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                  sectionTreatment.className,
                )}
              >
                <SectionIcon className="h-2.5 w-2.5" />
                {t(section.labelKey)}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
