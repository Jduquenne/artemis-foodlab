import { useState } from "react";
import { SlidersHorizontal, CalendarRange } from "lucide-react";
import { Macronutrients, MealSlot } from "../../../core/domain/types";
import { useJournalStore } from "../../../shared/store/useJournalStore";
import { MacroTargetsModal } from "./modal/MacroTargetsModal";
import { WeekAverageModal } from "./modal/WeekAverageModal";

export interface MacroSummaryProps {
  macros: Macronutrients;
  weekSlots: MealSlot[];
}

const ITEMS: { key: keyof Omit<Macronutrients, "kcal">; label: string }[] = [
  { key: "proteins", label: "Protéines" },
  { key: "lipids", label: "Lipides" },
  { key: "carbohydrates", label: "Glucides" },
  { key: "fibers", label: "Fibres" },
];

export const MacroSummary = ({ macros, weekSlots }: MacroSummaryProps) => {
  const { kcalTarget, macroTargets } = useJournalStore();
  const [showModal, setShowModal] = useState(false);
  const [showAverage, setShowAverage] = useState(false);

  const kcalPct = Math.min(100, Math.round((macros.kcal / kcalTarget) * 100));
  const kcalRemaining = Math.max(0, kcalTarget - macros.kcal);
  const isKcalOver = macros.kcal > kcalTarget;

  return (
    <>
      <div className="bg-white dark:bg-slate-100 rounded-2xl px-4 py-3 tablet:px-6 tablet:py-5 flex flex-col gap-3 tablet:gap-5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tablet:text-xs font-black uppercase tracking-widest text-slate-500">
            Macronutriments
          </span>
          <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAverage(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <CalendarRange className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
            <span className="text-[10px] tablet:text-xs font-semibold">Moyenne</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
            <span className="text-[10px] tablet:text-xs font-semibold">Objectifs</span>
          </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 tablet:gap-2.5">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl tablet:text-5xl font-black leading-none ${isKcalOver ? "text-orange-600" : "text-slate-900"}`}>
                {Math.round(macros.kcal)}
              </span>
              <span className="text-sm tablet:text-lg text-slate-500 leading-none">kcal</span>
            </div>
            <span className="text-xs tablet:text-base text-slate-500">
              {isKcalOver
                ? `+${Math.round(macros.kcal - kcalTarget)} au-dessus`
                : `${Math.round(kcalRemaining)} restantes · obj. ${kcalTarget}`}
            </span>
          </div>
          <div className="h-2 tablet:h-3.5 bg-slate-100 dark:bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full w-full rounded-full bg-orange-500 origin-left transition-transform duration-700"
              style={{ transform: `scaleX(${kcalPct / 100})` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] tablet:text-xs text-slate-500">0</span>
            <span className="text-[10px] tablet:text-xs font-bold text-orange-500">{kcalPct}%</span>
            <span className="text-[10px] tablet:text-xs text-slate-500">{kcalTarget}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 tablet:gap-3">
          {ITEMS.map(({ key, label }) => {
            const value = macros[key];
            const target = macroTargets[key];
            const pct = Math.min(100, Math.round((value / target) * 100));
            const isOver = value > target;

            return (
              <div key={key} className="bg-slate-50 dark:bg-slate-200 rounded-xl px-2 py-2 tablet:px-4 tablet:py-4 flex flex-col gap-1 tablet:gap-2">
                <span className="text-[9px] sm:text-[10px] tablet:text-xs font-semibold uppercase tracking-wide text-slate-500 leading-none">
                  {label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-sm tablet:text-2xl font-black leading-none ${isOver ? "text-orange-500" : "text-slate-800"}`}>
                    {Math.round(value)}
                  </span>
                  <span className="text-[9px] tablet:text-sm text-slate-500 leading-none">/{target}g</span>
                </div>
                <div className="h-1 tablet:h-2 bg-slate-200 dark:bg-slate-300 rounded-full overflow-hidden">
                  <div
                    className="h-full w-full rounded-full bg-orange-400 origin-left transition-transform duration-500"
                    style={{ transform: `scaleX(${pct / 100})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && <MacroTargetsModal onClose={() => setShowModal(false)} />}
      {showAverage && <WeekAverageModal weekSlots={weekSlots} onClose={() => setShowAverage(false)} />}
    </>
  );
};
