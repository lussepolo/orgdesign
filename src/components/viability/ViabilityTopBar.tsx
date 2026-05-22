import { BarChart3, SlidersHorizontal, Target } from "lucide-react";
import type { ViabilityScreen } from "../../lib/viability/types";
import { cn } from "../../lib/utils";

const SCREENS: Array<{ value: ViabilityScreen; label: string; icon: typeof BarChart3 }> = [
  { value: "baseline", label: "Baseline", icon: BarChart3 },
  { value: "sensitivity", label: "Sensitivity", icon: SlidersHorizontal },
  { value: "thresholds", label: "Thresholds", icon: Target },
];

interface ViabilityTopBarProps {
  activeScreen: ViabilityScreen;
  onScreenChange: (screen: ViabilityScreen) => void;
}

export default function ViabilityTopBar({
  activeScreen,
  onScreenChange,
}: ViabilityTopBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-start">
        <div className="max-w-3xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Viability Simulator
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Board workspace for baseline economics, sensitivity review, and viability thresholds
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Review the current case, compare selected assumption changes, and identify the conditions
            required to support the investment case.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:grid-cols-3 lg:min-w-[420px]">
          {SCREENS.map((screen) => {
            const Icon = screen.icon;
            return (
              <button
                key={screen.value}
                onClick={() => onScreenChange(screen.value)}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                  activeScreen === screen.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400",
                )}
              >
                <Icon className="h-4 w-4" />
                {screen.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
