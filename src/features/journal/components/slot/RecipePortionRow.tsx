import { Minus, Plus } from "lucide-react";
import { RecipeKind } from "../../../../core/domain/types";
import { RECIPE_BASE_GRAMS, RECIPE_MACROS } from "../../../../core/utils/macroUtils";
import { useJournalStore } from "../../../../shared/store/useJournalStore";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";

export interface RecipePortionRowProps {
  recipeId: string;
  slotId: string;
}

export const RecipePortionRow = ({ recipeId, slotId }: RecipePortionRowProps) => {
  const { portionOverrides, setPortionOverride, gramOverrides, setGramOverride } = useJournalStore();
  const key = `${slotId}-${recipeId}`;
  const recipe = typedRecipesDb[recipeId];
  const name = recipe?.name ?? recipeId;
  const isIngredient = recipe?.kind === RecipeKind.INGREDIENT;
  const baseGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
  const useGrams = isIngredient && baseGrams > 0;

  if (useGrams) {
    const defaultGrams = Math.round(baseGrams);
    const grams = gramOverrides[key] ?? defaultGrams;
    const kcal = (RECIPE_MACROS[recipeId]?.kcal ?? 0) * (grams / baseGrams);

    return (
      <div className="flex flex-col py-0.5 gap-0.5">
        <span className="text-xs text-slate-700 font-medium leading-tight w-full">{name}</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              key={key}
              type="number"
              min={1}
              defaultValue={grams}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) setGramOverride(key, v);
              }}
              className="w-12 text-[11px] font-bold text-center bg-slate-50 dark:bg-slate-200 rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-orange-400 text-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[11px] text-slate-400">g</span>
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums font-medium">
            {Math.round(kcal)} kcal
          </span>
        </div>
      </div>
    );
  }

  const portions = portionOverrides[key] ?? 1;
  const kcal = (RECIPE_MACROS[recipeId]?.kcal ?? 0) * portions;

  return (
    <div className="flex flex-col py-0.5 gap-0.5">
      <span className="text-xs text-slate-700 font-medium leading-tight w-full">
        {name}
      </span>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPortionOverride(key, Math.max(1, portions - 1))}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-orange-500 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`text-[11px] font-bold w-5 text-center leading-none ${portions > 1 ? "text-orange-500" : "text-slate-300"}`}>
            {portions}×
          </span>
          <button
            onClick={() => setPortionOverride(key, Math.min(10, portions + 1))}
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
