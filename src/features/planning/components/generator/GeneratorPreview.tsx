import { Lock, LockOpen, RefreshCw } from "lucide-react";
import { GeneratedMeal } from "../../../../core/domain/menuGenerator";
import { GENERATED_SLOT_LABELS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { groupMealsByDay } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { formatSourceDayFull } from "../../../../core/utils/dateUtils";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface GeneratorPreviewProps {
  meals: GeneratedMeal[];
  onToggleLock: (key: string) => void;
  onRegenerate: (key: string) => void;
}

export const GeneratorPreview = ({ meals, onToggleLock, onRegenerate }: GeneratorPreviewProps) => {
  const recipes = useRecipesSnapshot();

  return (
    <div className="flex flex-col gap-3">
      {groupMealsByDay(meals).map(({ date, meals: dayMeals }) => (
        <section key={date} className="flex flex-col gap-1.5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">{formatSourceDayFull(date)}</p>
          {dayMeals.map((meal) => (
            <div
              key={meal.key}
              className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border ${
                meal.kept ? "border-dashed border-slate-200 opacity-60" : meal.locked ? "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-[11px] font-bold text-orange-600">{GENERATED_SLOT_LABELS[meal.slot]}</span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">
                  {meal.kept ? "Déjà prévu" : meal.recipeCode ? (recipes[meal.recipeCode]?.name ?? meal.recipeCode) : "—"}
                </span>
                {!meal.kept && (
                  <div className="flex shrink-0 items-center gap-0.5">
                    {meal.recipeCode && (
                      <button
                        type="button"
                        onClick={() => onToggleLock(meal.key)}
                        aria-pressed={meal.locked}
                        aria-label={meal.locked ? "Déverrouiller ce repas" : "Garder ce repas"}
                        title={meal.locked ? "Déverrouiller" : "Garder ce repas"}
                        className={`p-1.5 rounded-lg transition-colors ${meal.locked ? "text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30" : "text-slate-400 hover:text-orange-600 hover:bg-muted"}`}
                      >
                        {meal.locked ? <Lock size={14} /> : <LockOpen size={14} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRegenerate(meal.key)}
                      disabled={meal.locked}
                      aria-label="Proposer une autre recette"
                      title="Proposer une autre recette"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </div>
              {!meal.kept && meal.reasons.length > 0 && (
                <p className="pl-18 text-[11px] text-slate-400 leading-snug">{meal.reasons.join(" · ")}</p>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};
