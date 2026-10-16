import { GeneratedMeal } from "../../../../core/domain/menuGenerator";
import { GENERATED_SLOT_LABELS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { groupMealsByDay } from "../../../../core/logic/menuGenerator/menuPreviewLogic";
import { formatSourceDayFull } from "../../../../core/utils/dateUtils";
import { useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface GeneratorPreviewProps {
  meals: GeneratedMeal[];
}

export const GeneratorPreview = ({ meals }: GeneratorPreviewProps) => {
  const recipes = useRecipesSnapshot();

  return (
    <div className="flex flex-col gap-3">
      {groupMealsByDay(meals).map(({ date, meals: dayMeals }) => (
        <section key={date} className="flex flex-col gap-1.5">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wide">{formatSourceDayFull(date)}</p>
          {dayMeals.map((meal) => (
            <div key={meal.key} className={`flex flex-col gap-0.5 px-3 py-2 rounded-xl border ${meal.kept ? "border-dashed border-slate-200 opacity-60" : "border-slate-200"}`}>
              <div className="flex items-baseline gap-2">
                <span className="w-16 shrink-0 text-[11px] font-bold text-orange-600">{GENERATED_SLOT_LABELS[meal.slot]}</span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">
                  {meal.kept ? "Déjà prévu" : meal.recipeCode ? (recipes[meal.recipeCode]?.name ?? meal.recipeCode) : "—"}
                </span>
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
