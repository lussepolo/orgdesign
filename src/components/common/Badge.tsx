import React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "warning" | "success" | "info" | "purple" | "danger";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600 border-slate-200",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
};

export const Badge = ({ children, variant = "info" }: BadgeProps) => (
  <span
    className={cn(
      "px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border",
      variants[variant],
    )}
  >
    {children}
  </span>
);

export default Badge;
