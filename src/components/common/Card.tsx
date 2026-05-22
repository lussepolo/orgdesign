import React from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card = ({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  actions,
  style,
}: CardProps) => (
  <div
    className={cn(
      "bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden",
      className,
    )}
    style={style}
  >
    {title && (
      <div className="px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 text-slate-400" />}
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold leading-snug text-slate-900 break-words">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-snug break-words">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

export default Card;
