import { Pencil, Snowflake, Trash2 } from "lucide-react";
import { Food } from "../../../../core/domain/types";

export interface FoodRowProps {
  food: Food;
  onEdit: (food: Food) => void;
  onAskDelete: (food: Food) => void;
}

export const FoodRow = ({ food, onEdit, onAskDelete }: FoodRowProps) => (
  <div className="flex items-center gap-3 px-4 py-2.5">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-800 truncate flex items-center gap-1.5">
        {food.name}
        {food.isFreezable && <Snowflake size={12} className="text-cyan-500 shrink-0" />}
      </p>
      <p className="text-xs text-slate-400 truncate">{food.category}</p>
    </div>
    <span className="shrink-0 text-xs tabular-nums text-slate-500 w-16 text-right">
      {food.macros.kcal} kcal
    </span>
    <button
      type="button"
      aria-label={`Modifier ${food.name}`}
      onClick={() => onEdit(food)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
    >
      <Pencil size={15} />
    </button>
    <button
      type="button"
      aria-label={`Supprimer ${food.name}`}
      onClick={() => onAskDelete(food)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
    >
      <Trash2 size={15} />
    </button>
  </div>
);
