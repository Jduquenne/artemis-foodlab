import { useRef, useState } from "react";
import { ChefHat, MoreVertical, Trash2 } from "lucide-react";
import { BatchFreezerItem } from "../../../../core/domain/types";
import { updateBatchPortions } from "../../../../core/services/freezerService";
import { FloatingMenu } from "../../../../shared/components/ui/FloatingMenu";

export interface BatchFreezerItemRowProps {
    item: BatchFreezerItem;
    categoryId: string;
    onDelete: () => void;
    formattedDate: string;
}

export const BatchFreezerItemRow = ({ item, categoryId, onDelete, formattedDate }: BatchFreezerItemRowProps) => {
    const isEmpty = item.portions === 0;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const desktopMenuButtonRef = useRef<HTMLButtonElement>(null);

    const handleDecrement = () => {
        if (isEmpty) return;
        updateBatchPortions(categoryId, item.id, item.portions - 1);
    };

    const handleIncrement = () => {
        updateBatchPortions(categoryId, item.id, item.portions + 1);
    };

    const icon = (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isEmpty ? 'bg-slate-100 dark:bg-slate-200' : 'bg-orange-100'}`}>
            <ChefHat className={`w-3.5 h-3.5 ${isEmpty ? 'text-slate-400' : 'text-orange-500'}`} />
        </div>
    );

    const caption = (
        <p className="text-xs text-slate-400 truncate">
            {isEmpty ? 'Épuisé' : `${item.portions} portion${item.portions > 1 ? 's' : ''}`}
            <span className="mx-1 text-slate-300">·</span>
            {formattedDate}
        </p>
    );

    const counter = (
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
    );

    const batchBadge = (
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isEmpty ? 'bg-slate-100 dark:bg-slate-200 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
            BATCH
        </span>
    );

    const deleteMenuItem = (
        <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
            <Trash2 className="w-4 h-4 shrink-0" />
            Supprimer ce batch
        </button>
    );

    return (
        <div className={`px-3 py-2.5 bg-white dark:bg-slate-100 rounded-2xl transition-opacity ${isEmpty ? 'opacity-60' : ''}`}>
            <div className="md:hidden">
                <div className="flex items-center gap-2">
                    {icon}
                    <p className="flex-1 min-w-0 text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
                    {batchBadge}
                    <button
                        ref={mobileMenuButtonRef}
                        aria-label="Options"
                        onClick={() => setMobileMenuOpen(o => !o)}
                        className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
                    >
                        <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <FloatingMenu open={mobileMenuOpen} anchorRef={mobileMenuButtonRef} onClose={() => setMobileMenuOpen(false)}>
                        {deleteMenuItem}
                    </FloatingMenu>
                </div>
                <div className="mt-1.5 pl-9 flex items-center justify-between gap-2">
                    {caption}
                    {counter}
                </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
                {icon}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.recipeName}</p>
                    <div className="mt-0.5">{caption}</div>
                </div>
                {counter}
                {batchBadge}
                <button
                    ref={desktopMenuButtonRef}
                    aria-label="Options"
                    onClick={() => setDesktopMenuOpen(o => !o)}
                    className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
                >
                    <MoreVertical className="w-3.5 h-3.5" />
                </button>
                <FloatingMenu open={desktopMenuOpen} anchorRef={desktopMenuButtonRef} onClose={() => setDesktopMenuOpen(false)}>
                    {deleteMenuItem}
                </FloatingMenu>
            </div>
        </div>
    );
};
