import { ChefHat, Trash2 } from "lucide-react";
import { BatchFreezerItem } from "../../../../core/domain/types";

export interface BatchFreezerItemRowProps {
  item: BatchFreezerItem;
  onDelete: () => void;
  formattedDate: string;
}

export const BatchFreezerItemRow = ({ item, onDelete, formattedDate }: BatchFreezerItemRowProps) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-100 rounded-2xl">
    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
      <ChefHat className="w-4 h-4 text-orange-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {item.portions} repas · {formattedDate}
      </p>
    </div>
    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
      BATCH
    </span>
    <button
      aria-label="Supprimer"
      onClick={onDelete}
      className="shrink-0 p-2.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);
