import React from "react";
import { Baby, Heart, Languages, Users } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { useLocale } from "../../i18n/useLocale";
import { EARLY_YEARS_DATA } from "../../features/academic/model/academicStaffingModel";

const Card = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  actions,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: any;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div className={cn("bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)} style={style}>
    {title && (
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />}
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

const Badge = ({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info" | "purple" | "danger";
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border", variants[variant])}>
      {children}
    </span>
  );
};

const EarlyYearsTab = () => {
  const { t } = useLocale();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title={t("earlyYearsFrameworkTitle")} icon={Baby}>
          <div className="space-y-6">
            <p className="text-sm text-slate-500 leading-relaxed">
              {t("earlyYearsFrameworkIntro")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-900">{t("earlyYearsSocialEmotionalTitle")}</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t("earlyYearsSocialEmotionalBody")}</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-blue-500" />
                  <h4 className="text-xs font-bold text-slate-900">{t("earlyYearsBilingualImmersionTitle")}</h4>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">{t("earlyYearsBilingualImmersionBody")}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t("earlyYearsNarrativeTitle")}
              </p>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-700">
                {t("earlyYearsNarrativeBody")}
              </p>
            </div>
          </div>
        </Card>
        <Card title={t("earlyYearsClassroomPackageTitle")} icon={Users}>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t("earlyYearsReferenceEducatorLabel")}</span>
              <Badge variant="purple">{t("earlyYearsOneLeadBadge")}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t("earlyYearsLearningAssistantLabel")}</span>
              <Badge variant="info">{t("earlyYearsOneAssistantBadge")}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t("earlyYearsLearningMonitorLabel")}</span>
              <Badge variant="success">{t("earlyYearsOneMonitorBadge")}</Badge>
            </div>
            <p className="text-[10px] text-slate-400 italic">{t("earlyYearsModelNote")}</p>
            <p className="text-[10px] text-amber-700 leading-relaxed border-t border-slate-100 pt-3 mt-3">{t("earlyYearsPlanningPremiseNote")}</p>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {EARLY_YEARS_DATA.map((item, idx) => (
          <motion.div key={item.gradeKey} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
            <Card className="h-full border-t-4 border-rose-400">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t(item.ageKey)}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{t(item.gradeKey)}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t("earlyYearsTotalLearnersLabel")}</div>
                  <div className="text-xs font-bold text-rose-600">{item.max} {t("earlyYearsLearnersUnit")}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t("earlyYearsLearnersPerSectionLabel")}</div>
                  <div className="text-xs font-bold text-slate-600">{item.max / 2} {t("earlyYearsLearnersUnit")}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t("earlyYearsRatioLabel")}</div>
                  <div className="text-xs font-bold text-slate-600">{item.ratio}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EarlyYearsTab;
