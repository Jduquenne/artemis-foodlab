import { Shuffle } from "lucide-react";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { toggleFoodChoice } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";
import { foodGroupLabel } from "../../../../core/logic/dashboard/foodGroupFormLogic";
import { useFoodGroupsSnapshot, useFoodsSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";

export interface IngredientChoiceToggleProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  wide?: boolean;
}

export const IngredientChoiceToggle = ({ ingredient, onChange, wide = false }: IngredientChoiceToggleProps) => {
  const foods = useFoodsSnapshot();
  const groups = useFoodGroupsSnapshot();
  const food = ingredient.foodId ? foods[ingredient.foodId] : undefined;
  const groupId = ingredient.foodGroupId ?? food?.groupId;

  if (ingredient.ingredientType !== "food" || !groupId) {
    return wide ? null : <span className="w-8 shrink-0" />;
  }

  const active = Boolean(ingredient.foodGroupId);
  const groupName = foodGroupLabel(groups, groupId);
  const title = active
    ? `Au choix dans « ${groupName} » — ${food?.name ?? "aliment"} par défaut`
    : `Rendre au choix dans « ${groupName} »`;

  return (
    <button
      type="button"
      onClick={() => onChange(toggleFoodChoice(ingredient, food))}
      title={title}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors ${
        wide ? "w-full px-3 py-2.5" : "w-8 h-8 shrink-0"
      } ${
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-surface border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-300"
      }`}
    >
      <Shuffle className="w-3.5 h-3.5 shrink-0" />
      {wide && <span>{active ? `Au choix dans « ${groupName} »` : `Rendre au choix dans « ${groupName} »`}</span>}
    </button>
  );
};
