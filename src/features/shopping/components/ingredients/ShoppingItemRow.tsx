import { ChevronRight, Loader2, Snowflake } from 'lucide-react';
import { ConsolidatedIngredient, ShoppingMode } from '../../../../core/domain/shopping';
import { countRecipes } from '../../../../core/logic/shopping/shoppingChecks';
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
    placeName: string | null;
    atPlace: boolean;
    inFreezer: boolean;
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
    placeName,
    atPlace,
    inFreezer,
    onToggle,
    onOpenStock,
    onOpenDetail,
}: ShoppingItemRowProps) => {
    const pending = useAnyPendingKey([`shopping-check:${item.key}`, `shopping-stock:${item.key}`]);
    const recipes = countRecipes(item);
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
                <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className={`text-[15px] font-semibold text-slate-900 truncate lg:text-sm ${isChecked ? 'line-through' : ''}`}>
                        {item.name}
                        {item.preparation && <span className="font-normal text-slate-400"> · {item.preparation}</span>}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        {item.isExtra
                            ? <span className="text-[11px] font-bold px-1.5 rounded-md bg-muted text-slate-500">ajouté</span>
                            : recipes > 0 && <span className="truncate">{recipes === 1 ? item.sources[0].recipeName : `${recipes} recettes`}</span>}
                        {item.toSpecify && <span className="text-[11px] font-bold px-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-600">à préciser</span>}
                        {inFreezer && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 rounded-md bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600">
                                <Snowflake className="w-2.5 h-2.5" />congélo
                            </span>
                        )}
                        {placeName && atPlace && <span className="text-[11px] font-bold px-1.5 rounded-md bg-orange-100 dark:bg-orange-900/40 text-orange-600">{placeName}</span>}
                    </span>
                </span>
                {quantity.main && (
                    <span className="shrink-0 flex flex-col items-end tabular-nums">
                        <span className={`text-[15px] font-bold lg:text-sm ${quantity.positive ? 'text-green-600' : 'text-slate-900'}`}>{quantity.main}</span>
                        {quantity.sub && <span className="text-[11px] text-slate-400">{quantity.sub}</span>}
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
