import React from "react";
import { cn } from "../../lib/utils";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ElementType;
}

export const TabButton = ({ active, onClick, label, icon: Icon }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0",
      active
        ? "bg-slate-900 text-white shadow-md"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    )}
  >
    <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", active ? "text-white" : "text-slate-400")} />
    {label}
  </button>
);

export default TabButton;
