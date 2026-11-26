import { PackageMinus } from "lucide-react";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { toggleRemoved } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";
import { canBeRemoved, isRemovedDraft } from "../../../../core/logic/recipeBuilder/recipeBuilderState";

export interface IngredientRemovedToggleProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  wide?: boolean;
}

export const IngredientRemovedToggle = ({ ingredient, onChange, wide = false }: IngredientRemovedToggleProps) => {
  const active = isRemovedDraft(ingredient);
  if (!active && !canBeRemoved(ingredient)) return wide ? null : <span className="w-8 shrink-0" />;

  const label = active ? "Retiré pendant la préparation" : "Marquer comme retiré pendant la préparation";

  return (
    <button
      type="button"
      onClick={() => onChange(toggleRemoved(ingredient))}
      title={active ? `${label} : soustrait des macros, absent des courses` : label}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-colors ${
        wide ? "w-full px-3 py-2.5" : "w-8 h-8 shrink-0"
      } ${
        active
          ? "bg-orange-500 border-orange-500 text-white"
          : "bg-surface border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-300"
      }`}
    >
      <PackageMinus className="w-3.5 h-3.5 shrink-0" />
      {wide && <span>{label}</span>}
    </button>
  );
};
