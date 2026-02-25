import { useState, useMemo, useEffect } from 'react';
import { Printer, ShoppingCart, CalendarDays } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { IngredientCategory, ShoppingDay } from '../../core/domain/types';
import { getShoppingListForDays, ConsolidatedIngredient } from '../../core/utils/shoppingLogic';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { CategoryCard } from './components/CategoryCard';

const CATEGORY_ORDER: IngredientCategory[] = [
    IngredientCategory.FRUIT_VEGETABLE,
    IngredientCategory.MEAT,
    IngredientCategory.FISH,
    IngredientCategory.DELI,
    IngredientCategory.DAIRY,
    IngredientCategory.FARM,
    IngredientCategory.BAKERY,
    IngredientCategory.STARCH,
    IngredientCategory.CANNED,
    IngredientCategory.SWEET_GROCERY,
    IngredientCategory.DRIED_FRUIT,
    IngredientCategory.SPICE_CONDIMENT,
    IngredientCategory.FROZEN,
    IngredientCategory.RECIPE,
    IngredientCategory.INTERNET,
    IngredientCategory.NON_PURCHASE,
    IngredientCategory.UNKNOWN,
];

function getPeriodKey(days: ShoppingDay[]): string {
    return [...days].map(d => `${d.year}-${d.week}-${d.day}`).sort().join('|');
}

export const ShoppingModule = () => {
    const navigate = useNavigate();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);
    const periodKey = useMemo(() => getPeriodKey(shoppingDays), [shoppingDays]);

    const [checked, setChecked] = useState<Set<string>>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('cipe_shopping_checked') ?? 'null');
            if (s?.periodKey === getPeriodKey(useMenuStore.getState().shoppingDays)) {
                return new Set<string>(s.keys);
            }
        } catch {}
        return new Set<string>();
    });

    const [stocks, setStocksState] = useState<Record<string, number>>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('cipe_shopping_stocks') ?? 'null');
            if (s?.periodKey === getPeriodKey(useMenuStore.getState().shoppingDays)) {
                return s.data ?? {};
            }
        } catch {}
        return {};
    });

    useEffect(() => {
        localStorage.setItem('cipe_shopping_checked', JSON.stringify({ periodKey, keys: [...checked] }));
    }, [periodKey, checked]);

    useEffect(() => {
        localStorage.setItem('cipe_shopping_stocks', JSON.stringify({ periodKey, data: stocks }));
    }, [periodKey, stocks]);

    const ingredients = useLiveQuery(
        () => getShoppingListForDays(shoppingDays),
        [shoppingDays]
    );

    const toggleItem = (key: string) => {
        setChecked(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const setStock = (key: string, value: number) => {
        setStocksState(prev => {
            const next = { ...prev };
            if (value <= 0) delete next[key];
            else next[key] = value;
            return next;
        });
    };

    const groupedItems = useMemo(() => {
        if (!ingredients) return [];
        const groups: { label: string; list: ConsolidatedIngredient[] }[] = CATEGORY_ORDER
            .map(cat => ({ label: cat as string, list: ingredients.filter(i => i.category === cat) }))
            .filter(g => g.list.length > 0);
        const uncategorized = ingredients.filter(i => !i.category || !CATEGORY_ORDER.includes(i.category));
        if (uncategorized.length > 0) groups.push({ label: 'Autres', list: uncategorized });
        return groups;
    }, [ingredients]);

    const uncheckedCount = useMemo(() => {
        if (!ingredients) return 0;
        return ingredients.filter(i => {
            if (checked.has(i.key)) return false;
            if (i.totalQuantity === 0) return true;
            return Math.max(0, i.totalQuantity - (stocks[i.key] ?? 0)) > 0;
        }).length;
    }, [ingredients, checked, stocks]);

    const daysLabel = useMemo(() => {
        if (shoppingDays.length === 0) return null;
        const n = shoppingDays.length;
        return `${n} jour${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}`;
    }, [shoppingDays]);

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Liste de courses</h1>
                    {daysLabel ? (
                        <p className="text-slate-500 text-sm">{daysLabel}</p>
                    ) : (
                        <p className="text-slate-400 text-sm italic">Aucune période sélectionnée</p>
                    )}
                    {ingredients && shoppingDays.length > 0 && (
                        <p className="text-sm font-medium text-orange-600 mt-0.5">
                            {uncheckedCount} article{uncheckedCount !== 1 ? 's' : ''} restant{uncheckedCount !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-white dark:bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors shrink-0"
                >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Imprimer</span>
                </button>
            </div>

            <div
                className="flex-1 min-h-0 overflow-y-auto pr-1"
                onScroll={markScrolling}
            >
                {shoppingDays.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                        <CalendarDays className="w-12 h-12 opacity-30" />
                        <div className="text-center">
                            <p className="font-medium text-slate-500">Aucune période de courses sélectionnée</p>
                            <p className="text-sm mt-1">Va dans le planning pour choisir tes jours</p>
                        </div>
                        <button
                            onClick={() => navigate('/planning')}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Aller au planning
                        </button>
                    </div>
                ) : !ingredients ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        Chargement...
                    </div>
                ) : ingredients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                        <ShoppingCart className="w-12 h-12 opacity-30" />
                        <p className="font-medium">Aucun repas planifié sur cette période</p>
                        <p className="text-sm">Planifie des repas pour générer la liste</p>
                    </div>
                ) : (
                    <div className="columns-1 tablet:columns-2 lg:columns-3 gap-4 pb-4">
                        {groupedItems.map(group => (
                            <div key={group.label} className="break-inside-avoid mb-4">
                                <CategoryCard
                                    label={group.label}
                                    items={group.list}
                                    checked={checked}
                                    stocks={stocks}
                                    onToggle={toggleItem}
                                    onSetStock={setStock}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
