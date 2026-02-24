import { useState, useMemo } from 'react';
import { Printer, ShoppingCart } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { addDays } from 'date-fns';
import { IngredientCategory } from '../../core/domain/types';
import { getNextWeekShoppingList, ConsolidatedIngredient } from '../../core/utils/shoppingLogic';
import { getMonday, getWeekRange, getWeekNumber } from '../../shared/utils/weekUtils';
import { markScrolling } from '../../shared/utils/scrollGuard';
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

export const ShoppingModule = () => {
    const [checked, setChecked] = useState<Set<string>>(new Set());

    const nextMonday = useMemo(() => addDays(getMonday(new Date()), 7), []);
    const nextWeekNumber = useMemo(() => getWeekNumber(nextMonday), [nextMonday]);
    const nextWeekRange = useMemo(() => getWeekRange(nextMonday), [nextMonday]);

    const ingredients = useLiveQuery(() => getNextWeekShoppingList(), []);

    const toggleItem = (key: string) => {
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
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

    const uncheckedCount = ingredients
        ? ingredients.filter(i => !checked.has(i.key)).length
        : 0;

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Liste de courses</h1>
                    <p className="text-slate-500 text-sm">
                        Semaine {nextWeekNumber} — {nextWeekRange}
                    </p>
                    {ingredients && (
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
                {!ingredients ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        Chargement...
                    </div>
                ) : ingredients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                        <ShoppingCart className="w-12 h-12 opacity-30" />
                        <p className="font-medium">Aucun repas prévu la semaine prochaine</p>
                        <p className="text-sm">Planifie tes repas pour générer la liste</p>
                    </div>
                ) : (
                    <div className="columns-1 tablet:columns-2 lg:columns-3 gap-4 pb-4">
                        {groupedItems.map(group => (
                            <div key={group.label} className="break-inside-avoid mb-4">
                                <CategoryCard
                                    label={group.label}
                                    items={group.list}
                                    checked={checked}
                                    onToggle={toggleItem}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
