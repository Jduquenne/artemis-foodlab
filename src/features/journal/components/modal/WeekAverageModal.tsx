import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { DAYS } from "../../../../core/domain/planningConfig";
import { MealSlot } from "../../../../core/domain/planning";
import { useActiveJournalOverrides } from "../../../../shared/hooks/useActiveJournalOverrides";
import { useMacroCatalogue } from "../../../../shared/hooks/useMacroCatalogue";
import { useActiveTargets } from "../../../../shared/hooks/useActiveProfile";
import {
  DEFAULT_AVERAGE_DAYS,
  computeWeekAverage,
  toggleDay,
} from "../../../../core/logic/journal/weekAverageLogic";

export interface WeekAverageModalProps {
  weekSlots: MealSlot[];
  onClose: () => void;
}

const ROWS = [
  { key: "kcal" as const, label: "Calories", unit: "kcal" },
  { key: "proteins" as const, label: "Protéines", unit: "g" },
  { key: "lipids" as const, label: "Lipides", unit: "g" },
  { key: "carbohydrates" as const, label: "Glucides", unit: "g" },
  { key: "fibers" as const, label: "Fibres", unit: "g" },
];

export const WeekAverageModal = ({ weekSlots, onClose }: WeekAverageModalProps) => {
  const { kcalTarget, macroTargets } = useActiveTargets();
  const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
  const catalogue = useMacroCatalogue();
  const [isClosing, setIsClosing] = useState(false);
  const [days, setDays] = useState<string[]>([...DEFAULT_AVERAGE_DAYS]);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  const { average, countedDays } = useMemo(
    () => computeWeekAverage(catalogue, weekSlots, days, portionOverrides, gramOverrides, ingredientOverrides),
    [catalogue, weekSlots, days, portionOverrides, gramOverrides, ingredientOverrides]
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full max-w-sm bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? "modal-center-exit" : "modal-center-enter"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
            Moyenne de la semaine
          </p>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((day) => {
              const active = days.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => setDays((prev) => toggleDay(prev, day))}
                  aria-pressed={active}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? "bg-orange-500 text-white"
                      : "bg-slate-50 dark:bg-slate-200 text-slate-500 hover:text-orange-500"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {countedDays === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Aucun repas planifié sur les jours sélectionnés.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {ROWS.map(({ key, label, unit }) => {
                const target = key === "kcal" ? kcalTarget : macroTargets[key];
                const value = average[key];
                const pct = Math.min(100, Math.round((value / target) * 100));
                const isOver = value > target;
                return (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-sm font-black ${isOver ? "text-orange-500" : "text-slate-800"}`}>
                          {Math.round(value)}
                        </span>
                        <span className="text-[10px] text-slate-500">/{target} {unit}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-300 rounded-full overflow-hidden">
                      <div
                        className="h-full w-full rounded-full bg-orange-400 origin-left transition-transform duration-500"
                        style={{ transform: `scaleX(${pct / 100})` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-500 text-right">
                Moyenne par jour sur {countedDays} jour{countedDays > 1 ? "s" : ""} renseigné{countedDays > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
