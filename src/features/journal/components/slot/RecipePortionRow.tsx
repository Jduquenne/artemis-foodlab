import { useState } from "react";
import { ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { RecipeKind } from "../../../../core/domain/types";
import { RECIPE_BASE_GRAMS, RECIPE_MACROS, calculateOverriddenRecipeMacros } from "../../../../shared/utils/macroUtils";
import { defaultIngredientOverridesForPortions, isOverridableIngredient } from "../../../../core/logic/journal/journalOverrideLogic";
import { useJournalStore } from "../../../../shared/store/useJournalStore";
import { useActiveJournalOverrides } from "../../../../shared/hooks/useActiveJournalOverrides";
import { useProfileStore } from "../../../../shared/store/useProfileStore";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { typedFoodDb } from "../../../../core/typed-db/typedFoodDb";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { withPending } from "../../../../shared/utils/withPending";
import { IngredientOverrideRow } from "./IngredientOverrideRow";

export interface RecipePortionRowProps {
  recipeId: string;
  planningSlotItemId?: string;
}

export const RecipePortionRow = ({ recipeId, planningSlotItemId }: RecipePortionRowProps) => {
  const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
  const { setPortionOverride, setGramOverride, setIngredientOverride, resetIngredientOverride } = useJournalStore();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const [expanded, setExpanded] = useState(false);
  const key = planningSlotItemId ?? "";
  const pending = usePendingKey(`journal-override:${key}`);
  const recipe = typedRecipesDb[recipeId];
  const name = recipe?.name ?? recipeId;
  const isIngredient = recipe?.kind === RecipeKind.INGREDIENT;
  const baseGrams = RECIPE_BASE_GRAMS[recipeId] ?? 0;
  const useGrams = isIngredient && baseGrams > 0;
  const itemIngredientOverrides = ingredientOverrides[key];
  const hasIngredientOverrides = !!itemIngredientOverrides && Object.keys(itemIngredientOverrides).length > 0;

  if (useGrams) {
    const defaultGrams = Math.round(baseGrams);
    const grams = gramOverrides[key] ?? defaultGrams;
    const kcal = (RECIPE_MACROS[recipeId]?.kcal ?? 0) * (grams / baseGrams);

    return (
      <div className="flex flex-col py-0.5 gap-0.5">
        <span className="text-sm text-slate-700 font-semibold leading-tight w-full">{name}</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <input
              key={`${activeProfileId}:${key}`}
              type="number"
              min={1}
              defaultValue={grams}
              aria-label={`Quantité en grammes — ${name}`}
              disabled={!planningSlotItemId}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0 && planningSlotItemId) setGramOverride(planningSlotItemId, recipeId, v);
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
  const kcal = hasIngredientOverrides && recipe
    ? calculateOverriddenRecipeMacros(recipe, itemIngredientOverrides, typedRecipesDb, typedFoodDb).kcal
    : (RECIPE_MACROS[recipeId]?.kcal ?? 0) * portions;
  const overridableIngredients = recipe?.ingredients.filter(isOverridableIngredient) ?? [];
  const canExpand = !!planningSlotItemId && overridableIngredients.length > 0;
  const scaledDefaults = recipe ? defaultIngredientOverridesForPortions(recipe, portions) : {};

  return (
    <div className="flex flex-col py-0.5 gap-0.5">
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-sm text-slate-700 font-semibold leading-tight truncate">
          {name}
        </span>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? `Replier — ${name}` : `Modifier les ingrédients — ${name}`}
            aria-expanded={expanded}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-200 text-slate-400 hover:bg-orange-100 hover:text-orange-500 transition-colors shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => planningSlotItemId && withPending(`journal-override:${key}`, () => setPortionOverride(planningSlotItemId, recipeId, Math.max(1, portions - 1)))}
            disabled={!planningSlotItemId || pending}
            aria-label={`Réduire les portions — ${name}`}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-40"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`text-[11px] font-bold w-5 text-center leading-none ${portions > 1 ? "text-orange-500" : "text-slate-400"} ${pending ? "animate-pulse" : ""}`}>
            {portions}×
          </span>
          <button
            onClick={() => planningSlotItemId && withPending(`journal-override:${key}`, () => setPortionOverride(planningSlotItemId, recipeId, Math.min(10, portions + 1)))}
            disabled={!planningSlotItemId || pending}
            aria-label={`Augmenter les portions — ${name}`}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-40"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums font-medium">
          {Math.round(kcal)} kcal
        </span>
      </div>

      {expanded && recipe && planningSlotItemId && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {overridableIngredients.map((ingredient) => (
            <IngredientOverrideRow
              key={ingredient.id}
              ingredient={ingredient}
              defaultQuantity={scaledDefaults[ingredient.id] ?? 0}
              overrideQuantity={itemIngredientOverrides?.[ingredient.id]}
              onChange={(value) => setIngredientOverride(planningSlotItemId, recipeId, ingredient.id, value)}
              onReset={() => resetIngredientOverride(planningSlotItemId, recipeId, ingredient.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
