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
    <div className="flex flex-col py-0.5 gap-0.5">
      <span className="text-xs text-slate-700 font-medium leading-tight w-full">
        {name}
      </span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={decrement}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-orange-500 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`text-[11px] font-bold w-5 text-center leading-none ${portions > 1 ? "text-orange-500" : "text-slate-300"}`}>
            {portions}×
          </span>
          <button
            onClick={increment}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-orange-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums font-medium">
          {Math.round(kcal)} kcal
        </span>
      </div>
    </div>
  );
};
