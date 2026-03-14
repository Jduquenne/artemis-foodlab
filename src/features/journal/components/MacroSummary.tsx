import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Macronutrients } from "../../../core/domain/types";
import { useJournalStore } from "../../../shared/store/useJournalStore";
import { MacroTargetsModal } from "./modal/MacroTargetsModal";

export interface MacroSummaryProps {
  macros: Macronutrients;
}

const ITEMS: { key: keyof Omit<Macronutrients, "kcal">; label: string }[] = [
  { key: "proteins", label: "Protéines" },
  { key: "lipids", label: "Lipides" },
  { key: "carbohydrates", label: "Glucides" },
  { key: "fibers", label: "Fibres" },
];

export const MacroSummary = ({ macros }: MacroSummaryProps) => {
  const { kcalTarget, macroTargets } = useJournalStore();
  const [showModal, setShowModal] = useState(false);

  const kcalPct = Math.min(100, Math.round((macros.kcal / kcalTarget) * 100));
  const kcalRemaining = Math.max(0, kcalTarget - macros.kcal);
  const isKcalOver = macros.kcal > kcalTarget;

  return (
    <>
      <div className="bg-white dark:bg-slate-100 rounded-2xl px-4 py-3 flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Macronutriments
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold">Objectifs</span>
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black leading-none ${isKcalOver ? "text-orange-600" : "text-slate-900"}`}>
                {Math.round(macros.kcal)}
              </span>
              <span className="text-sm text-slate-400 leading-none">kcal</span>
            </div>
            <span className="text-xs text-slate-400">
              {isKcalOver
                ? `+${Math.round(macros.kcal - kcalTarget)} au-dessus`
                : `${Math.round(kcalRemaining)} restantes · obj. ${kcalTarget}`}
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-700"
              style={{ width: `${kcalPct}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] text-slate-300">0</span>
            <span className="text-[10px] font-bold text-orange-500">{kcalPct}%</span>
            <span className="text-[10px] text-slate-300">{kcalTarget}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ITEMS.map(({ key, label }) => {
            const value = macros[key];
            const target = macroTargets[key];
            const pct = Math.min(100, Math.round((value / target) * 100));
            const isOver = value > target;

            return (
              <div key={key} className="bg-slate-50 dark:bg-slate-200 rounded-xl px-2 py-2 flex flex-col gap-1">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-400 leading-none">
                  {label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-sm font-black leading-none ${isOver ? "text-orange-500" : "text-slate-800"}`}>
                    {Math.round(value)}
                  </span>
                  <span className="text-[9px] text-slate-300 leading-none">/{target}g</span>
                </div>
                <div className="h-1 bg-slate-200 dark:bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && <MacroTargetsModal onClose={() => setShowModal(false)} />}
    </>
  );
};
