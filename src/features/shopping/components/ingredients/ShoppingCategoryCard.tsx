import { ConsolidatedIngredient, ShoppingMode } from '../../../../core/domain/shopping';
import { FreezerBag } from '../../../../core/domain/freezer';
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
    placeName: string | null;
    atPlace: Set<string>;
    foodBags?: Map<string, FreezerBag[]>;
    onToggle: (key: string) => void;
    onOpenStock: (key: string) => void;
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
    placeName,
    atPlace,
    foodBags,
    onToggle,
    onOpenStock,
    onOpenDetail,
}: ShoppingCategoryCardProps) => {
    const shown = mode === 'store' ? sortCheckedLast(items, checked) : items;
    const checkedCount = items.filter((i) => checked.has(i.key)).length;
    const inStock = items.filter((i) => isCoveredAtHome(i, stocks, sourceChecked)).length;
    const counter = mode === 'store'
        ? `${checkedCount}/${items.length}`
        : inStock > 0 ? `${inStock}/${items.length} en stock` : null;

    return (
        <div className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5 pb-1">
                <h2 className="text-orange-600 font-black uppercase tracking-widest text-xs">{label}</h2>
                {counter && <span className="text-xs text-slate-400 font-medium tabular-nums">{counter}</span>}
            </div>
            {shown.map((item) => (
                <ShoppingItemRow
                    key={item.key}
                    item={item}
                    mode={mode}
                    isChecked={checked.has(item.key)}
                    stock={stocks[item.key] ?? 0}
                    sourceChecked={sourceChecked}
                    placeName={placeName}
                    atPlace={atPlace.has(item.key)}
                    inFreezer={!!item.foodId && (foodBags?.get(item.foodId)?.length ?? 0) > 0}
                    onToggle={onToggle}
                    onOpenStock={onOpenStock}
                    onOpenDetail={onOpenDetail}
                />
            ))}
            {mode === 'store' && coveredCount > 0 && (
                <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-200">
                    {coveredCount} déjà à la maison
                </p>
            )}
        </div>
    );
};
