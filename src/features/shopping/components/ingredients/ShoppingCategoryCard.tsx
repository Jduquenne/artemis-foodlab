import { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { StockUpdate, aisleInStockUpdates } from '../../../../core/logic/shopping/shoppingQuickStockLogic';
import { useAnyPendingKey } from '../../../../shared/hooks/useAnyPendingKey';
import { ConsolidatedIngredient, ShoppingMode } from '../../../../core/domain/shopping';
import { isCoveredAtHome } from '../../../../core/logic/shopping/shoppingChecks';
import { sortCheckedLast } from '../../../../core/logic/shopping/shoppingGrouping';
import { ShoppingItemRow } from './ShoppingItemRow';

export interface ShoppingCategoryCardProps {
    label: string;
    items: ConsolidatedIngredient[];
    mode: ShoppingMode;
    coveredCount: number;
    checked: Set<string>;
    stocks: Record<string, number>;
    sourceChecked: Set<string>;
    onToggle: (key: string) => void;
    onOpenStock: (key: string) => void;
    onQuickStock: (key: string) => void;
    onStockAll: (updates: StockUpdate[]) => void;
    onOpenDetail: (key: string) => void;
}

export const ShoppingCategoryCard = ({
    label,
    items,
    mode,
    coveredCount,
    checked,
    stocks,
    sourceChecked,
    onToggle,
    onOpenStock,
    onQuickStock,
    onStockAll,
    onOpenDetail,
}: ShoppingCategoryCardProps) => {
    const shown = mode === 'store' ? sortCheckedLast(items, checked) : items;
    const checkedCount = items.filter((i) => checked.has(i.key)).length;
    const inStock = items.filter((i) => isCoveredAtHome(i, stocks, sourceChecked)).length;
    const counter = mode === 'store'
        ? `${checkedCount}/${items.length}`
        : inStock > 0 ? `${inStock}/${items.length} en stock` : null;
    const done = mode === 'store' && items.length > 0 && checkedCount === items.length;
    const [unfolded, setUnfolded] = useState(false);
    const [wasDone, setWasDone] = useState(done);
    if (wasDone !== done) {
        setWasDone(done);
        setUnfolded(false);
    }
    const folded = done && !unfolded;
    const stockUpdates = mode === 'home' ? aisleInStockUpdates(items, stocks, sourceChecked) : [];
    const stocking = useAnyPendingKey(stockUpdates.map((u) => `shopping-stock:${u.key}`));

    return (
        <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {done ? (
                <button
                    type="button"
                    onClick={() => setUnfolded((u) => !u)}
                    aria-expanded={!folded}
                    className={`w-full flex items-center justify-between gap-2 px-3 text-left ${folded ? 'py-2.5' : 'pt-2.5 pb-1'}`}
                >
                    <h2 className="flex items-center gap-1.5 text-emerald-600 font-black uppercase tracking-widest text-xs">
                        <Check className="w-3.5 h-3.5" />
                        {label}
                    </h2>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium tabular-nums">
                        {counter}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${folded ? '' : 'rotate-180'}`} />
                    </span>
                </button>
            ) : (
                <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1">
                    <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">{label}</h2>
                    <span className="flex items-baseline gap-2">
                        {counter && <span className="text-xs text-slate-400 font-medium tabular-nums">{counter}</span>}
                        {stockUpdates.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onStockAll(stockUpdates)}
                                disabled={stocking}
                                className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 disabled:opacity-50"
                            >
                                {stocking && <Loader2 className="w-3 h-3 animate-spin" />}
                                Tout en stock
                            </button>
                        )}
                    </span>
                </div>
            )}
            {!folded && shown.map((item) => (
                <ShoppingItemRow
                    key={item.key}
                    item={item}
                    mode={mode}
                    isChecked={checked.has(item.key)}
                    stock={stocks[item.key] ?? 0}
                    sourceChecked={sourceChecked}
                    onToggle={onToggle}
                    onOpenStock={onOpenStock}
                    onQuickStock={onQuickStock}
                    onOpenDetail={onOpenDetail}
                />
            ))}
            {!folded && mode === 'store' && coveredCount > 0 && (
                <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-200">
                    {coveredCount} déjà à la maison
                </p>
            )}
        </div>
    );
};
