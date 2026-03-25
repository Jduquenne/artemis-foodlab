import { Pencil, Trash2 } from "lucide-react";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";

export interface IngredientMobileCardProps {
  ingredient: DraftIngredient;
  onEdit: () => void;
  onRemove: () => void;
}

export const IngredientMobileCard = ({ ingredient, onEdit, onRemove }: IngredientMobileCardProps) => {
  const isBase = ingredient.ingredientType === "base";
  const qtyLabel =
    ingredient.quantity != null
      ? `${ingredient.quantity}${ingredient.unit ? " " + ingredient.unit : ""}`
      : null;

  return (
    <div className="flex items-center gap-2 py-2.5 sm:hidden">
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
          isBase
            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
            : "bg-slate-100 dark:bg-slate-200 text-slate-500"
        }`}
      >
        {isBase ? "Base" : "Alim."}
      </span>

      <span className="flex-1 min-w-0 text-sm font-medium text-slate-700 truncate">
        {ingredient.name || <em className="text-slate-400 font-normal not-italic">Sans nom</em>}
      </span>
      {!isBase && ingredient.name.trim().length > 0 && !ingredient.foodId && (
        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded shrink-0">Non lié</span>
      )}

      {qtyLabel && (
        <span className="text-xs text-slate-400 shrink-0 tabular-nums">{qtyLabel}</span>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors shrink-0"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
