import { ChefHat, Trash2 } from "lucide-react";
import { BatchFreezerItem } from "../../../../core/domain/types";
import { updateBatchPortions } from "../../../../core/services/freezerService";

export interface BatchFreezerItemRowProps {
    item: BatchFreezerItem;
    categoryId: string;
    onDelete: () => void;
    formattedDate: string;
}

export const BatchFreezerItemRow = ({ item, categoryId, onDelete, formattedDate }: BatchFreezerItemRowProps) => {
    const isEmpty = item.portions === 0;

    const handleDecrement = () => {
        if (isEmpty) return;
        updateBatchPortions(categoryId, item.id, item.portions - 1);
    };

    const handleIncrement = () => {
        updateBatchPortions(categoryId, item.id, item.portions + 1);
    };

    return (
        <div className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-100 rounded-2xl transition-opacity ${isEmpty ? 'opacity-60' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isEmpty ? 'bg-slate-100 dark:bg-slate-200' : 'bg-orange-100'}`}>
                <ChefHat className={`w-4 h-4 ${isEmpty ? 'text-slate-400' : 'text-orange-500'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                    {isEmpty ? 'Épuisé' : `${item.portions} portion${item.portions > 1 ? 's' : ''}`}
                    <span className="mx-1 text-slate-300">·</span>
                    {formattedDate}
                </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    aria-label="Consommer une portion"
                    onClick={handleDecrement}
                    disabled={isEmpty}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-200 text-slate-600 font-bold text-base flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    −
                </button>
                <span className={`text-sm font-black w-5 text-center ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
                    {item.portions}
                </span>
                <button
                    aria-label="Ajouter une portion"
                    onClick={handleIncrement}
                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-200 text-slate-600 font-bold text-base flex items-center justify-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
                >
                    +
                </button>
            </div>

            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isEmpty ? 'bg-slate-100 dark:bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
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
};
