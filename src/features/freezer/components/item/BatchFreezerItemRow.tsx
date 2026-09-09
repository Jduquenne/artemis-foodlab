import { useRef, useState } from "react";
import { ChefHat, MoreVertical, Trash2, AlertTriangle } from "lucide-react";
import { BatchFreezerItem } from "../../../../core/domain/types";
import { updateBatchPortions } from "../../../../core/services/freezerService";
import { freezerItemAge } from "../../../../core/logic/freezer/freezerLogic";
import { FloatingMenu } from "../../../../shared/components/ui/FloatingMenu";

export interface BatchFreezerItemRowProps {
    item: BatchFreezerItem;
    categoryId: string;
    onDelete: () => void;
}

export const BatchFreezerItemRow = ({ item, categoryId, onDelete }: BatchFreezerItemRowProps) => {
    const isEmpty = item.portions === 0;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const age = freezerItemAge(item.addedDate);

    const handleDecrement = () => {
        if (isEmpty) return;
        updateBatchPortions(categoryId, item.id, item.portions - 1);
    };

    const handleIncrement = () => {
        updateBatchPortions(categoryId, item.id, item.portions + 1);
    };

    return (
        <div className={`px-3 py-2.5 bg-white dark:bg-slate-100 border border-slate-200 rounded-2xl transition ${isEmpty ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isEmpty ? 'bg-slate-100 dark:bg-slate-200' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                    <ChefHat className={`w-4 h-4 ${isEmpty ? 'text-slate-400' : 'text-orange-500'}`} />
                </div>
                <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isEmpty ? 'bg-slate-100 dark:bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                    BATCH
                </span>
                <button
                    ref={menuButtonRef}
                    aria-label="Options"
                    onClick={() => setMenuOpen(o => !o)}
                    className="shrink-0 p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
                <FloatingMenu open={menuOpen} anchorRef={menuButtonRef} onClose={() => setMenuOpen(false)}>
                    <button
                        onClick={onDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        Supprimer ce batch
                    </button>
                </FloatingMenu>
            </div>

            <div className="mt-2 pl-[2.75rem] flex items-center justify-between gap-2">
                <p className={`flex items-center gap-1 text-[11px] truncate ${age.stale && !isEmpty ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                    {age.stale && !isEmpty && <AlertTriangle className="w-3 h-3 shrink-0" />}
                    <span>{isEmpty ? 'Épuisé' : `${item.portions} portion${item.portions > 1 ? 's' : ''}`}</span>
                    <span className="text-slate-300">·</span>
                    <span>{age.label}</span>
                </p>
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
            </div>
        </div>
    );
};
