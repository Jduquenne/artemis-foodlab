import { HabitProtein, HabitTarget } from "../../../../core/domain/menuGenerator";
import { isRecipeCategory } from "../../../../core/domain/recipePredicates";
import { HABIT_PROTEIN_LABELS } from "../../../../core/logic/menuGenerator/habitLogic";
import { useCategoriesSnapshot, useFoodsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ChoicePills } from "./ChoicePills";
import { FoodSearchInput } from "./FoodSearchInput";
import { RecipeSearchInput } from "./RecipeSearchInput";

export interface HabitTargetFieldProps {
  target: HabitTarget;
  disabled: boolean;
  onChange: (target: HabitTarget) => void;
}

const PROTEIN_OPTIONS = (Object.keys(HABIT_PROTEIN_LABELS) as HabitProtein[]).map((id) => ({ id, label: HABIT_PROTEIN_LABELS[id] }));

const SELECT_CLASS =
  "w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

export const HabitTargetField = ({ target, disabled, onChange }: HabitTargetFieldProps) => {
  const categories = useCategoriesSnapshot();
  const foods = useFoodsSnapshot();
  const recipes = useRecipesSnapshot();

  switch (target.kind) {
    case "protein":
      return (
        <ChoicePills
          options={PROTEIN_OPTIONS}
          isActive={(id) => id === target.protein}
          onToggle={(protein) => onChange({ kind: "protein", protein })}
          disabled={disabled}
        />
      );
    case "category":
      return (
        <select
          value={target.categoryId}
          disabled={disabled}
          onChange={(e) => onChange({ kind: "category", categoryId: e.target.value })}
          className={SELECT_CLASS}
        >
          <option value="" disabled>Choisir une catégorie</option>
          {categories.filter(isRecipeCategory).map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      );
    case "food":
      return (
        <div className="flex flex-col gap-1.5">
          {target.foodId && <span className="text-xs font-semibold text-slate-700">{foods[target.foodId]?.name ?? target.foodId}</span>}
          <FoodSearchInput
            hiddenIds={target.foodId ? [target.foodId] : []}
            disabled={disabled}
            placeholder={target.foodId ? "Changer d'aliment…" : "Ex : pâtes, saumon…"}
            onPick={(foodId) => onChange({ kind: "food", foodId })}
          />
        </div>
      );
    case "recipe":
      return (
        <div className="flex flex-col gap-1.5">
          {target.recipeCode && <span className="text-xs font-semibold text-slate-700">{recipes[target.recipeCode]?.name ?? target.recipeCode}</span>}
          <RecipeSearchInput disabled={disabled} onPick={(recipeCode) => onChange({ kind: "recipe", recipeCode })} />
        </div>
      );
    case "noMeal":
      return <p className="text-[11px] text-slate-400">Le créneau n'est pas généré (cantine, restaurant…).</p>;
  }
};
