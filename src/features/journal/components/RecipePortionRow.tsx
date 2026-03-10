import { Minus, Plus } from "lucide-react";
import { RecipeDetails } from "../../../core/domain/types";
import { RECIPE_MACROS } from "../../../core/utils/macroUtils";
import { useJournalStore } from "../../../shared/store/useJournalStore";
import recipesDb from "../../../core/data/recipes-db.json";

const data = recipesDb as unknown as Record<string, RecipeDetails>;

export interface RecipePortionRowProps {
  recipeId: string;
  slotId: string;
}

export const RecipePortionRow = ({ recipeId, slotId }: RecipePortionRowProps) => {
  const { portionOverrides, setPortionOverride } = useJournalStore();
  const key = `${slotId}-${recipeId}`;
  const portions = portionOverrides[key] ?? 1;
  const name = data[recipeId]?.name ?? recipeId;
  const kcal = (RECIPE_MACROS[recipeId]?.kcal ?? 0) * portions;

  const decrement = () => setPortionOverride(key, Math.max(1, portions - 1));
  const increment = () => setPortionOverride(key, Math.min(10, portions + 1));

  return (
    <div className="flex items-center gap-1 py-0.5">
      <span className="flex-1 min-w-0 text-xs text-slate-700 font-medium truncate leading-tight">
        {name}
      </span>
      <div className="flex items-center shrink-0">
        <button
          onClick={decrement}
          className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-colors"
        >
          <Minus className="w-2.5 h-2.5" />
        </button>
        <span className={`text-[10px] font-bold w-5 text-center leading-none ${portions > 1 ? "text-orange-500" : "text-slate-300"}`}>
          {portions}×
        </span>
        <button
          onClick={increment}
          className="w-4 h-4 flex items-center justify-center text-slate-300 hover:text-orange-500 transition-colors"
        >
          <Plus className="w-2.5 h-2.5" />
        </button>
      </div>
      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums min-w-[40px] text-right">
        {Math.round(kcal)} kcal
      </span>
    </div>
  );
};
