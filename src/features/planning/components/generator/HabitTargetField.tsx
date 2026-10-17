import { FoodList, HabitProtein, HabitTarget } from "../../../../core/domain/menuGenerator";
import { isRecipeCategory } from "../../../../core/domain/recipePredicates";
import { HABIT_PROTEIN_LABELS } from "../../../../core/logic/menuGenerator/habitLogic";
import { useCategoriesSnapshot, useFoodGroupsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { ChoicePills } from "./ChoicePills";
import { FoodChipsField } from "./FoodChipsField";
import { KeywordsField } from "./KeywordsField";
import { RecipeSearchInput } from "./RecipeSearchInput";

export interface HabitTargetFieldProps {
  target: HabitTarget;
  lists: readonly FoodList[];
  disabled: boolean;
  onChange: (target: HabitTarget) => void;
}

const PROTEIN_OPTIONS = (Object.keys(HABIT_PROTEIN_LABELS) as HabitProtein[]).map((id) => ({ id, label: HABIT_PROTEIN_LABELS[id] }));

const SELECT_CLASS =
  "w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

export const HabitTargetField = ({ target, lists, disabled, onChange }: HabitTargetFieldProps) => {
  const categories = useCategoriesSnapshot();
  const groups = useFoodGroupsSnapshot();
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
          <FoodChipsField
            foodIds={target.foodIds}
            separator="ou"
            placeholder={target.foodIds.length > 0 ? "Ajouter un autre aliment…" : "Ex : saumon, cabillaud…"}
            disabled={disabled}
            onChange={(foodIds) => onChange({ kind: "food", foodIds })}
          />
          <p className="text-[11px] text-slate-400">Le repas contient au moins un aliment de la liste, peu importe lequel.</p>
        </div>
      );
    case "family":
      return (
        <div className="flex flex-col gap-1.5">
          <select value={target.groupId} disabled={disabled} onChange={(e) => onChange({ kind: "family", groupId: e.target.value })} className={SELECT_CLASS}>
            <option value="" disabled>Choisir une famille du catalogue</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Familles du catalogue (Dashboard › Familles). Le repas contient au moins un aliment de la famille.</p>
        </div>
      );
    case "list":
      return (
        <div className="flex flex-col gap-1.5">
          <select value={target.listId} disabled={disabled || lists.length === 0} onChange={(e) => onChange({ kind: "list", listId: e.target.value })} className={SELECT_CLASS}>
            <option value="" disabled>{lists.length === 0 ? "Aucune liste" : "Choisir une liste"}</option>
            {lists.map((list) => (
              <option key={list.id} value={list.id}>{list.name}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Listes créées dans l'onglet « Aliments et recettes ». Le repas contient au moins un aliment de la liste.</p>
        </div>
      );
    case "name":
      return <KeywordsField keywords={target.keywords} disabled={disabled} onChange={(keywords) => onChange({ kind: "name", keywords })} />;
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
