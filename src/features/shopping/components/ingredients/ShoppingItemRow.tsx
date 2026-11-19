import { ChevronRight, Loader2 } from 'lucide-react';
import { ConsolidatedIngredient, ShoppingMode } from '../../../../core/domain/shopping';
import { homeStockState, shoppingRowQuantity } from '../../../../core/logic/shopping/shoppingRowLabel';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { CheckToggleIcon } from '../../../../shared/components/ui/CheckToggleIcon';
import { HomeStockMarker } from './HomeStockMarker';

export interface ShoppingItemRowProps {
    item: ConsolidatedIngredient;
    mode: ShoppingMode;
    isChecked: boolean;
    stock: number;
    sourceChecked: Set<string>;
    onToggle: (key: string) => void;
    onOpenStock: (key: string) => void;
    onOpenDetail: (key: string) => void;
}

export const ShoppingItemRow = ({
    item,
    mode,
    isChecked,
    stock,
    sourceChecked,
    onToggle,
    onOpenStock,
    onOpenDetail,
}: ShoppingItemRowProps) => {
    const pending = useAnyPendingKey([`shopping-check:${item.key}`, `shopping-stock:${item.key}`]);
    const usesStock = mode === 'home' && item.totalQuantity > 0 && !item.isExtra;
    const quantity = shoppingRowQuantity(item, mode, stock, sourceChecked);

    const handlePrimary = () => {
        if (pending) return;
        if (usesStock) onOpenStock(item.key);
        else onToggle(item.key);
    };

    const marker = pending
        ? <Loader2 className="w-5 h-5 animate-spin text-orange-400 shrink-0" />
        : usesStock
            ? <HomeStockMarker state={homeStockState(item, stock, sourceChecked)} />
            : <CheckToggleIcon checked={isChecked} className="w-5 h-5" checkedClassName="text-orange-500" />;

    return (
        <div className={`flex items-stretch border-t border-slate-200 first:border-t-0 ${isChecked ? 'opacity-50' : ''}`}>
            <button
                type="button"
                onClick={handlePrimary}
                aria-pressed={usesStock ? undefined : isChecked}
                className="flex-1 min-w-0 flex items-center gap-3 pl-3 pr-1.5 py-2 min-h-13 text-left hover:bg-subtle-tint transition-colors lg:min-h-10 lg:py-1.5"
            >
                {marker}
                <span className={`flex-1 min-w-0 text-[15px] font-semibold text-slate-900 truncate lg:text-sm ${isChecked ? 'line-through' : ''}`}>
                    {item.name}
                </span>
                {quantity.main && (
                    <span className={`shrink-0 text-[15px] font-bold tabular-nums lg:text-sm ${quantity.positive ? 'text-green-600' : 'text-slate-900'}`}>
                        {quantity.main}
                    </span>
                )}
            </button>
            <button
                type="button"
                onClick={() => onOpenDetail(item.key)}
                aria-label={`Détail — ${item.name}`}
                className="w-10 shrink-0 grid place-items-center text-slate-400 hover:text-orange-500 hover:bg-subtle-tint transition-colors"
            >
                <ChevronRight className="w-4.5 h-4.5" />
            </button>
        </div>
    );
};
