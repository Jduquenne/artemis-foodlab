import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { switchIngredientType } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";

export interface IngredientTypeToggleProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  wide?: boolean;
}

const OPTIONS: { type: DraftIngredient["ingredientType"]; label: string }[] = [
  { type: "food", label: "Aliment" },
  { type: "base", label: "Base" },
];

export const IngredientTypeToggle = ({ ingredient, onChange, wide = false }: IngredientTypeToggleProps) => (
  <div className={`flex rounded-xl overflow-hidden border border-slate-200 ${wide ? "" : "shrink-0"}`}>
    {OPTIONS.map((option, index) => (
      <button
        key={option.type}
        type="button"
        onClick={() => onChange(switchIngredientType(ingredient, option.type))}
        className={`${wide ? "flex-1 py-2.5" : "px-2 py-1.5"} text-xs font-bold transition-colors ${index > 0 ? "border-l border-slate-200" : ""} ${
          ingredient.ingredientType === option.type
            ? "bg-orange-500 text-white"
            : "bg-surface text-slate-500 hover:bg-subtle"
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);
