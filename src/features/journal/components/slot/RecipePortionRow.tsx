import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { RecipeKind } from "../../../../core/domain/recipe";
import { computeItemMacros } from "../../../../core/logic/nutrition/macroLogic";
import { useMacroCatalogue } from "../../../../shared/hooks/useMacroCatalogue";
import { defaultIngredientOverridesForPortions, isOverridableIngredient } from "../../../../core/logic/journal/journalOverrideLogic";
import { useJournalStore } from "../../../../shared/store/useJournalStore";
import { useActiveJournalOverrides } from "../../../../shared/hooks/useActiveJournalOverrides";
import { usePendingKey } from "../../../../shared/hooks/usePendingKey";
import { withPending } from "../../../../shared/utils/withPending";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { IngredientOverrideRow } from "./IngredientOverrideRow";
import { FoodChoice } from "../../../../core/domain/foodGroup";
import { AccompanimentChoice } from "../../../../core/domain/accompaniment";
import { BaseVersionChoice } from "../../../../core/domain/baseVersion";
import { personalizeRecipe } from "../../../../core/logic/foodGroup/foodChoiceLogic";
import { useActiveProfile } from "../../../../shared/hooks/useActiveProfile";
import { accompanimentDetailsFor } from "../../../../core/logic/accompaniment/accompanimentLogic";
import { portionsPerPersonOf } from "../../../../core/logic/recipe/portionsPerPersonLogic";
import { cookedGramsFromPortions, cookedWeightPerPortion, portionsFromCookedGrams } from "../../../../core/logic/recipe/cookedWeightLogic";
import { stepJournalPortions } from "../../../../core/logic/journal/portionStepLogic";
import { formatQty, pluralizeUnit } from "../../../../core/logic/unit/unitFormatLogic";

export interface RecipePortionRowProps {
  recipeId: string;
  planningSlotItemId?: string;
  mealChoices?: FoodChoice[];
  accompanimentChoices?: AccompanimentChoice[];
  baseVersionChoices?: BaseVersionChoice[];
}

export const RecipePortionRow = ({ recipeId, planningSlotItemId, mealChoices, accompanimentChoices, baseVersionChoices }: RecipePortionRowProps) => {
  const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
  const { setPortionOverride, setGramOverride, setIngredientOverride, resetIngredientOverride } = useJournalStore();
  const [expanded, setExpanded] = useState(false);
  const [gramsDraft, setGramsDraft] = useState<number | null>(null);
  const key = planningSlotItemId ?? "";
  const pending = usePendingKey(`journal-override:${key}`);
  const catalogue = useMacroCatalogue();
  const activeProfile = useActiveProfile();
  const personalization = useMemo(
    () => (activeProfile
      ? { profile: activeProfile, mealChoices: mealChoices ?? [], accompanimentChoices: accompanimentChoices ?? [] }
      : undefined),
    [activeProfile, mealChoices, accompanimentChoices],
  );
  const catalogueRecipe = catalogue.recipes[recipeId];
  const recipe = useMemo(
    () => (catalogueRecipe && personalization ? personalizeRecipe(catalogueRecipe, personalization, catalogue.foods) : catalogueRecipe),
    [catalogueRecipe, personalization, catalogue.foods],
  );
  const name = recipe?.name ?? recipeId;
  const accompanimentDishPortions = portionOverrides[key] ?? 1;
  const accompanimentDetails = useMemo(
    () => (personalization
      ? accompanimentDetailsFor(recipeId, personalization, accompanimentChoices ?? [], catalogue.accompaniments ?? [], catalogue.recipes, catalogue.foods, accompanimentDishPortions)
      : []),
    [personalization, recipeId, accompanimentChoices, catalogue, accompanimentDishPortions],
  );
  const isIngredient = recipe?.kind === RecipeKind.INGREDIENT;
  const baseGrams = catalogue.baseGrams[recipeId] ?? 0;
  const useGrams = isIngredient && baseGrams > 0;
  const itemIngredientOverrides = ingredientOverrides[key];
  const kcal = computeItemMacros(catalogue, recipeId, key, portionOverrides, gramOverrides, ingredientOverrides, personalization, baseVersionChoices).kcal;

  if (useGrams) {
    const defaultGrams = Math.round(baseGrams);
    const grams = gramOverrides[key] ?? defaultGrams;
    const commitGrams = () => {
      if (planningSlotItemId && gramsDraft !== null && gramsDraft > 0 && gramsDraft !== grams) {
        setGramOverride(planningSlotItemId, recipeId, recipe, gramsDraft).catch(() => undefined);
      }
      setGramsDraft(null);
    };

    return (
      <div className="flex flex-col py-0.5 gap-0.5">
        <span className="text-sm text-slate-700 font-semibold leading-tight w-full">{name}</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DecimalInput
              value={gramsDraft ?? grams}
              aria-label={`Quantité en grammes — ${name}`}
              disabled={!planningSlotItemId}
              onValueChange={setGramsDraft}
              onBlur={commitGrams}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              className="w-12 text-[11px] font-bold text-center bg-subtle rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-orange-400 text-orange-500"
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

  const reference = portionsPerPersonOf(catalogueRecipe);
  const cookedPerPortion = cookedWeightPerPortion(catalogueRecipe);
  const gramsEaten = gramOverrides[key];
  const cookedPortions = gramsEaten === undefined ? null : portionsFromCookedGrams(catalogueRecipe, gramsEaten);
  const portions = portionOverrides[key] ?? cookedPortions ?? reference;
  const shownGrams = gramsEaten ?? Math.round(cookedGramsFromPortions(catalogueRecipe, portions) ?? 0);
  const commitCookedGrams = () => {
    if (planningSlotItemId && gramsDraft !== null && gramsDraft > 0 && gramsDraft !== shownGrams) {
      const value = gramsDraft;
      withPending(`journal-override:${key}`, () => setGramOverride(planningSlotItemId, recipeId, recipe, value)).catch(() => undefined);
    }
    setGramsDraft(null);
  };
  const overridableIngredients = recipe?.ingredients.filter(isOverridableIngredient) ?? [];
  const canExpand = !!planningSlotItemId && overridableIngredients.length > 0;
  const scaledDefaults = recipe ? defaultIngredientOverridesForPortions(recipe, portions) : {};

  return (
    <div className="flex flex-col py-0.5 gap-0.5">
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="min-w-0 flex flex-col">
          <span className="text-sm text-slate-700 font-semibold leading-tight truncate">{name}</span>
        </span>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? `Replier — ${name}` : `Modifier les ingrédients — ${name}`}
            aria-expanded={expanded}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-slate-400 hover:bg-orange-100 hover:text-orange-500 transition-colors shrink-0"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {accompanimentDetails.map((detail) => (
        <div key={detail.id} className="flex flex-col pl-3">
          <span className="text-[11px] text-slate-400 leading-tight font-semibold">+ {detail.label}</span>
          {detail.lines.map((line) => (
            <span key={line.id} className="flex justify-between gap-1.5 pl-2 text-[10px] text-slate-400 leading-tight">
              <span className="truncate">{line.name}</span>
              {line.quantity !== null && (
                <span className="shrink-0 tabular-nums">{formatQty(line.quantity)} {pluralizeUnit(line.unit, line.quantity)}</span>
              )}
            </span>
          ))}
        </div>
      ))}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => planningSlotItemId && withPending(`journal-override:${key}`, () => setPortionOverride(planningSlotItemId, recipe, stepJournalPortions(portions, -1, reference) ?? portions)).catch(() => undefined)}
            disabled={!planningSlotItemId || pending || stepJournalPortions(portions, -1, reference) === null}
            aria-label={`Réduire les portions — ${name}`}
            className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-40"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className={`text-[11px] font-bold min-w-5 text-center leading-none ${portions !== reference ? "text-orange-500" : "text-slate-400"} ${pending ? "animate-pulse" : ""}`}>
            {formatQty(portions)}×
          </span>
          <button
            onClick={() => planningSlotItemId && withPending(`journal-override:${key}`, () => setPortionOverride(planningSlotItemId, recipe, stepJournalPortions(portions, 1, reference) ?? portions)).catch(() => undefined)}
            disabled={!planningSlotItemId || pending || stepJournalPortions(portions, 1, reference) === null}
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

      {cookedPerPortion !== null && (
        <div className="flex items-center gap-1">
          <DecimalInput
            value={gramsDraft ?? shownGrams}
            aria-label={`Poids mangé en grammes — ${name}`}
            disabled={!planningSlotItemId || pending}
            onValueChange={setGramsDraft}
            onBlur={commitCookedGrams}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            className={`w-12 text-[11px] font-bold text-center bg-subtle rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-orange-400 ${gramsEaten !== undefined ? "text-orange-500" : "text-slate-400"}`}
          />
          <span className="text-[11px] text-slate-400">g cuits</span>
        </div>
      )}

      {expanded && recipe && planningSlotItemId && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {overridableIngredients.map((ingredient) => (
            <IngredientOverrideRow
              key={ingredient.id}
              ingredient={ingredient}
              defaultQuantity={scaledDefaults[ingredient.id] ?? 0}
              overrideQuantity={itemIngredientOverrides?.[ingredient.id]}
              onChange={(value) => setIngredientOverride(planningSlotItemId, recipe, ingredient.id, value).catch(() => undefined)}
              onReset={() => resetIngredientOverride(planningSlotItemId, recipe, ingredient.id).catch(() => undefined)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
