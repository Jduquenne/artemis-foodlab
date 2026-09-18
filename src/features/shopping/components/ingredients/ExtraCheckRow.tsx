import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { ConsolidatedIngredient } from '../../../../core/logic/shopping/shoppingLogic';
import { pluralizeUnit, formatQty } from '../../../../shared/utils/unitUtils';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';

export interface ExtraCheckRowProps {
    item: ConsolidatedIngredient;
    isChecked: boolean;
    onToggle: (key: string) => void;
    onEditExtra: (extraId: string) => void;
    onDeleteExtra: (extraId: string) => void;
}

export const ExtraCheckRow = ({ item, isChecked, onToggle, onEditExtra, onDeleteExtra }: ExtraCheckRowProps) => {
    const togglePending = usePendingKey(`shopping-check:${item.key}`);
    const deletePending = usePendingKey(`shopping-extra-delete:${item.extraId ?? ''}`);

    return (
        <div
            onClick={() => !togglePending && onToggle(item.key)}
            className={`flex items-center justify-between gap-1.5 px-1.5 py-1 rounded-lg transition-all cursor-pointer select-none
                ${isChecked ? 'opacity-40 bg-slate-50 dark:bg-slate-200/40' : 'hover:bg-slate-50 dark:hover:bg-slate-200/40'}`}
        >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <CheckToggleIcon checked={isChecked} pending={togglePending} />
                <span className={`text-xs font-medium text-slate-800 truncate ${isChecked ? 'line-through' : ''}`}>
                    {item.name}
                    {item.totalQuantity > 0 && (
                        <span className="font-normal text-slate-400 ml-1">
                            {formatQty(item.totalQuantity)} {pluralizeUnit(item.unit, item.totalQuantity)}
                        </span>
                    )}
                </span>
                <span className="shrink-0 text-[10px] font-bold text-orange-400 uppercase">ajouté</span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                    onClick={() => item.extraId && onEditExtra(item.extraId)}
                    aria-label={`Modifier ${item.name}`}
                    className="p-1 rounded text-slate-300 hover:text-orange-500 transition-colors"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={() => !deletePending && item.extraId && onDeleteExtra(item.extraId)}
                    aria-label={`Retirer ${item.name}`}
                    disabled={deletePending}
                    className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                    {deletePending ? <Loader2 size={13} className="animate-spin text-orange-400" /> : <Trash2 size={13} />}
                </button>
            </div>
        </div>
    );
};
