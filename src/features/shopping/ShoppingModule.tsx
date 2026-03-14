import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, CalendarDays } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { IngredientCategory, RecipeKind, ShoppingDay } from '../../core/domain/types';
import { getShoppingListForDays, getBasesForDays, ConsolidatedIngredient, IngredientSource } from '../../core/utils/shoppingLogic';
import { typedRecipesDb } from '../../core/typed-db/typedRecipesDb';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { distributeToColumns } from '../../shared/utils/columnUtils';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { useColCount } from '../../shared/hooks/useColCount';
import { ShoppingCategoryCard } from './components/ingredients/ShoppingCategoryCard';
import { RecipeShoppingCard, RecipeCardIngredient, RecipeBaseGroup } from './components/meals/RecipeShoppingCard';
import { SourcesModal } from './components/SourcesModal';

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

    const colCount = Math.min(useColCount(), 3);
    const [viewMode, setViewMode] = useState<'meals' | 'ingredients'>('ingredients');
    const [ingredientFilter, setIngredientFilter] = useState<'all' | 'missing'>('all');
    const [activeSources, setActiveSources] = useState<{ key: string; sources: IngredientSource[] } | null>(null);

    const [checked, setChecked] = useState<Set<string>>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('cipe_shopping_checked') ?? 'null');
            if (s?.periodKey === getPeriodKey(useMenuStore.getState().shoppingDays)) {
                return new Set<string>(s.keys);
            }
        } catch { /* localStorage indisponible */ }
        return new Set<string>();
    });

    const [stocks, setStocksState] = useState<Record<string, number>>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('cipe_shopping_stocks') ?? 'null');
            if (s?.periodKey === getPeriodKey(useMenuStore.getState().shoppingDays)) {
                return s.data ?? {};
            }
        } catch { /* localStorage indisponible */ }
        return {};
    });

    const [sourceChecked, setSourceCheckedState] = useState<Set<string>>(() => {
        try {
            const s = JSON.parse(localStorage.getItem('cipe_shopping_source_checked') ?? 'null');
            if (s?.periodKey === getPeriodKey(useMenuStore.getState().shoppingDays)) {
                return new Set<string>(s.keys);
            }
        } catch { /* localStorage indisponible */ }
        return new Set<string>();
    });


    useEffect(() => {
        localStorage.setItem('cipe_shopping_checked', JSON.stringify({ periodKey, keys: [...checked] }));
    }, [periodKey, checked]);

    useEffect(() => {
        localStorage.setItem('cipe_shopping_stocks', JSON.stringify({ periodKey, data: stocks }));
    }, [periodKey, stocks]);

    useEffect(() => {
        localStorage.setItem('cipe_shopping_source_checked', JSON.stringify({ periodKey, keys: [...sourceChecked] }));
    }, [periodKey, sourceChecked]);

    const ingredients = useLiveQuery(
        () => getShoppingListForDays(shoppingDays),
        [shoppingDays]
    );

    const basesRaw = useLiveQuery(
        () => getBasesForDays(shoppingDays),
        [shoppingDays]
    );
    const bases = useMemo(() => basesRaw ?? [], [basesRaw]);

    const recipeCards = useMemo(() => {
        if (!ingredients) return [];
        type RecipeAcc = {
            recipeId: string;
            recipeName: string;
            directIngs: Map<string, RecipeCardIngredient>;
            baseGroups: Map<string, { baseId: string; baseName: string; ings: Map<string, RecipeCardIngredient> }>;
        };
        const recipeMap = new Map<string, RecipeAcc>();
        for (const ing of ingredients) {
            for (const source of ing.sources) {
                if (!recipeMap.has(source.recipeId)) {
                    recipeMap.set(source.recipeId, {
                        recipeId: source.recipeId,
                        recipeName: source.recipeName,
                        directIngs: new Map(),
                        baseGroups: new Map(),
                    });
                }
                const recipe = recipeMap.get(source.recipeId)!;
                if (source.fromBaseId) {
                    const baseName = bases.find(b => b.baseId === source.fromBaseId)?.name ?? source.fromBaseId;
                    if (!recipe.baseGroups.has(source.fromBaseId)) {
                        recipe.baseGroups.set(source.fromBaseId, { baseId: source.fromBaseId, baseName, ings: new Map() });
                    }
                    const baseGroup = recipe.baseGroups.get(source.fromBaseId)!;
                    if (!baseGroup.ings.has(ing.key)) {
                        baseGroup.ings.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
                    } else {
                        const ex = baseGroup.ings.get(ing.key)!;
                        ex.quantity += source.quantity;
                        ex.sources.push(source);
                    }
                } else {
                    if (!recipe.directIngs.has(ing.key)) {
                        recipe.directIngs.set(ing.key, { ingredientKey: ing.key, name: ing.name, quantity: source.quantity, unit: ing.unit, sources: [source] });
                    } else {
                        const ex = recipe.directIngs.get(ing.key)!;
                        ex.quantity += source.quantity;
                        ex.sources.push(source);
                    }
                }
            }
        }
        return Array.from(recipeMap.values())
            .filter(r => typedRecipesDb[r.recipeId]?.kind !== RecipeKind.INGREDIENT)
            .map(r => ({
                recipeId: r.recipeId,
                recipeName: r.recipeName,
                directIngredients: Array.from(r.directIngs.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')),
                baseGroups: Array.from(r.baseGroups.values())
                    .map(b => ({ baseId: b.baseId, baseName: b.baseName, ingredients: Array.from(b.ings.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr')) } as RecipeBaseGroup))
                    .sort((a, b) => a.baseName.localeCompare(b.baseName, 'fr')),
            }))
            .sort((a, b) => a.recipeName.localeCompare(b.recipeName, 'fr'));
    }, [ingredients, bases]);

    const toggleItem = (key: string) => {
        setChecked(prev => {
            const next = new Set(prev);
            if (next.has(key)) { next.delete(key); } else { next.add(key); }
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

    const toggleSourceCheck = (ingredientKey: string, sources: IngredientSource[], checked: boolean) => {
        setSourceCheckedState(prev => {
            const next = new Set(prev);
            for (const source of sources) {
                const k = `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
                if (checked) { next.add(k); } else { next.delete(k); }
            }
            return next;
        });
    };

    const toggleSourceBatch = (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, checked: boolean) => {
        setSourceCheckedState(prev => {
            const next = new Set(prev);
            for (const { ingredientKey, sources } of batch) {
                for (const source of sources) {
                    const k = `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
                    if (checked) { next.add(k); } else { next.delete(k); }
                }
            }
            return next;
        });
    };

    const groupedItems = useMemo(() => {
        if (!ingredients) return [];
        const getEffective = (i: ConsolidatedIngredient) => {
            const srcQty = i.sources
                .filter(s => sourceChecked.has(`${i.key}::${s.recipeId}::${s.day}::${s.slot}`))
                .reduce((sum, s) => sum + s.quantity, 0);
            return Math.max(0, i.totalQuantity - srcQty);
        };
        const isNeeded = (i: ConsolidatedIngredient) => {
            if (checked.has(i.key)) return false;
            if (i.totalQuantity === 0) return true;
            return Math.max(0, getEffective(i) - (stocks[i.key] ?? 0)) > 0;
        };
        const filterItem = (i: ConsolidatedIngredient) => ingredientFilter === 'all' || isNeeded(i);
        const groups: { label: string; list: ConsolidatedIngredient[] }[] = CATEGORY_ORDER
            .map(cat => ({ label: cat as string, list: ingredients.filter(i => i.category === cat && filterItem(i)) }))
            .filter(g => g.list.length > 0);
        const uncategorized = ingredients.filter(i => (!i.category || !CATEGORY_ORDER.includes(i.category)) && filterItem(i));
        if (uncategorized.length > 0) groups.push({ label: 'Autres', list: uncategorized });
        return groups;
    }, [ingredients, ingredientFilter, checked, stocks, sourceChecked]);

    const uncheckedCount = useMemo(() => {
        if (!ingredients) return 0;
        return ingredients.filter(i => {
            if (checked.has(i.key)) return false;
            if (i.totalQuantity === 0) return true;
            const srcQty = i.sources
                .filter(s => sourceChecked.has(`${i.key}::${s.recipeId}::${s.day}::${s.slot}`))
                .reduce((sum, s) => sum + s.quantity, 0);
            const effective = Math.max(0, i.totalQuantity - srcQty);
            return Math.max(0, effective - (stocks[i.key] ?? 0)) > 0;
        }).length;
    }, [ingredients, checked, stocks, sourceChecked]);

    const ingredientColumns = useMemo(
        () => distributeToColumns(groupedItems, g => g.list.length, colCount),
        [groupedItems, colCount]
    );

    const mealColumns = useMemo(
        () => distributeToColumns(recipeCards, c => c.directIngredients.length + c.baseGroups.reduce((s, b) => s + b.ingredients.length, 0), colCount),
        [recipeCards, colCount]
    );

    const daysLabel = useMemo(() => {
        if (shoppingDays.length === 0) return null;
        const n = shoppingDays.length;
        return `${n} jour${n > 1 ? 's' : ''} sélectionné${n > 1 ? 's' : ''}`;
    }, [shoppingDays]);

    return (
        <>
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-start shrink-0">
                <div>
                    <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Liste de courses</h1>
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
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex rounded-xl overflow-hidden border border-slate-200">
                        <button
                            onClick={() => setViewMode('meals')}
                            className={`px-3 py-2 text-sm font-bold transition-colors ${
                                viewMode === 'meals'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white dark:bg-slate-100 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-200'
                            }`}
                        >
                            Repas
                        </button>
                        <button
                            onClick={() => setViewMode('ingredients')}
                            className={`px-3 py-2 text-sm font-bold transition-colors border-l border-slate-200 ${
                                viewMode === 'ingredients'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white dark:bg-slate-100 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-200'
                            }`}
                        >
                            Ingrédients
                        </button>
                    </div>
                    {viewMode === 'ingredients' && (
                        <div className="flex rounded-xl overflow-hidden border border-slate-200">
                            <button
                                onClick={() => setIngredientFilter('all')}
                                className={`px-3 py-2 text-sm font-bold transition-colors ${
                                    ingredientFilter === 'all'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white dark:bg-slate-100 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-200'
                                }`}
                            >
                                Complète
                            </button>
                            <button
                                onClick={() => setIngredientFilter('missing')}
                                className={`px-3 py-2 text-sm font-bold transition-colors border-l border-slate-200 ${
                                    ingredientFilter === 'missing'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white dark:bg-slate-100 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-200'
                                }`}
                            >
                                Manquants
                            </button>
                        </div>
                    )}
                </div>
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
                ) : viewMode === 'meals' ? (
                    <div className="grid gap-4 pb-4 items-start" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                        {mealColumns.map((col, ci) => (
                            <div key={ci} className="flex flex-col gap-4">
                                {col.map((card, i) => (
                                    <div key={card.recipeId} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                                        <RecipeShoppingCard
                                            recipeId={card.recipeId}
                                            recipeName={card.recipeName}
                                            directIngredients={card.directIngredients}
                                            baseGroups={card.baseGroups}
                                            sourceChecked={sourceChecked}
                                            onToggleSource={toggleSourceCheck}
                                            onToggleBatch={toggleSourceBatch}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : groupedItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                        <ShoppingCart className="w-12 h-12 opacity-30" />
                        <p className="font-medium text-slate-500">Tout est couvert !</p>
                        <p className="text-sm">Rien à acheter — tout est en stock ou coché</p>
                    </div>
                ) : (
                    <div className="grid gap-4 pb-4 items-start" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                        {ingredientColumns.map((col, ci) => (
                            <div key={ci} className="flex flex-col gap-4">
                                {col.map((group, i) => (
                                    <div key={group.label} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                                        <ShoppingCategoryCard
                                            label={group.label}
                                            items={group.list}
                                            checked={checked}
                                            stocks={stocks}
                                            sourceChecked={sourceChecked}
                                            onToggle={toggleItem}
                                            onSetStock={setStock}
                                            onShowSources={(key, sources) => setActiveSources({ key, sources })}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {activeSources && (
            <SourcesModal
                ingredientKey={activeSources.key}
                sources={activeSources.sources}
                sourceChecked={sourceChecked}
                onToggleSource={toggleSourceCheck}
                onClose={() => setActiveSources(null)}
            />
        )}
        </>
    );
};
