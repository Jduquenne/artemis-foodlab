import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, CalendarDays, Clipboard, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { FreezerBag } from '../../core/domain/types';
import {
    getShoppingListForDays,
    getBasesForDays,
    buildShoppingClipboardText,
    IngredientSource,
    RecipeCard,
    buildRecipeCards,
    groupIngredients,
    filterGroupedIngredients,
    computeUncheckedCount,
    assignIngredientColumns,
} from '../../core/logic/shopping/shoppingLogic';
import { getRecords as getHouseholdRecords } from '../../core/services/householdService';
import { syncWeekFromApi } from '../../core/services/planningService';
import {
    fetchItemChecks,
    fetchSourceChecks,
    upsertItemCheck,
    upsertSourceCheck,
} from '../../core/services/shoppingPeriodService';
import { ApiItemCheck, ApiSourceCheck } from '../../core/logic/shopping/shoppingApiMapper';
import { getCodeById, getIdByCode } from '../../core/typed-db/recipeIdMap';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { distributeToColumns } from '../../shared/utils/columnUtils';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useColCount } from '../../shared/hooks/useColCount';
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { computeFreezerBagSelection } from '../../core/logic/freezer/freezerLogic';
import { ShoppingCategoryCard } from './components/ingredients/ShoppingCategoryCard';
import { RecipeShoppingCard } from './components/meals/RecipeShoppingCard';
import { SourcesModal } from './components/SourcesModal';
import { HouseholdShoppingCard } from './components/HouseholdShoppingCard';
import { typedHouseholdDb } from '../../core/typed-db/typedHouseholdDb';

export const ShoppingModule = () => {
    const navigate = useNavigate();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);
    const currentPeriodId = useMenuStore((s) => s.currentPeriodId);
    const authStatus = useAuthStore((s) => s.status);
    const allHouseholdItems = useMemo(() => Object.values(typedHouseholdDb), []);

    const colCount = Math.min(useColCount(), 3);
    const { foodBags } = useFreezerStock();
    const [viewMode, setViewMode] = useState<'meals' | 'ingredients'>('ingredients');
    const [ingredientFilter, setIngredientFilter] = useState<'all' | 'missing'>('all');
    const [copied, setCopied] = useState(false);
    const [activeSources, setActiveSources] = useState<{ key: string; sources: IngredientSource[]; freezerBags: FreezerBag[] } | null>(null);

    const [itemChecksRaw, setItemChecksRaw] = useState<ApiItemCheck[]>([]);
    const [sourceChecksRaw, setSourceChecksRaw] = useState<ApiSourceCheck[]>([]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!currentPeriodId) {
                if (active) {
                    setItemChecksRaw([]);
                    setSourceChecksRaw([]);
                }
                return;
            }
            const [ic, sc] = await Promise.all([fetchItemChecks(currentPeriodId), fetchSourceChecks(currentPeriodId)]);
            if (active) {
                setItemChecksRaw(ic);
                setSourceChecksRaw(sc);
            }
        };
        load();
        return () => { active = false; };
    }, [currentPeriodId]);

    useEffect(() => {
        if (authStatus !== 'authenticated') return;
        const weekKeys = new Set(shoppingDays.map(d => `${d.year}-${d.week}`));
        for (const key of weekKeys) {
            const [year, week] = key.split('-').map(Number);
            syncWeekFromApi(year, week);
        }
    }, [authStatus, shoppingDays]);

    const patchItemCheck = (updated: ApiItemCheck) => {
        setItemChecksRaw(prev => {
            const idx = prev.findIndex(ic => ic.id === updated.id);
            if (idx === -1) return [...prev, updated];
            const next = [...prev];
            next[idx] = updated;
            return next;
        });
    };

    const patchSourceCheck = (updated: ApiSourceCheck) => {
        setSourceChecksRaw(prev => {
            const idx = prev.findIndex(sc => sc.id === updated.id);
            if (idx === -1) return [...prev, updated];
            const next = [...prev];
            next[idx] = updated;
            return next;
        });
    };

    const ingredients = useLiveQuery(
        () => getShoppingListForDays(shoppingDays),
        [shoppingDays]
    );

    const basesRaw = useLiveQuery(
        () => getBasesForDays(shoppingDays),
        [shoppingDays]
    );
    const bases = useMemo(() => basesRaw ?? [], [basesRaw]);

    const householdRecords = useLiveQuery(() => getHouseholdRecords(), []);
    const householdItems = useMemo(() => {
        if (!householdRecords) return [];
        const checkedIds = new Set(householdRecords.map(r => r.id));
        return allHouseholdItems.filter(i => checkedIds.has(i.id));
    }, [householdRecords, allHouseholdItems]);

    const recipeCards = useMemo<RecipeCard[]>(
        () => ingredients ? buildRecipeCards(ingredients, bases) : [],
        [ingredients, bases]
    );

    const keyToFoodId = useMemo(() => {
        const map = new Map<string, string>();
        for (const ing of ingredients ?? []) {
            if (ing.foodId) map.set(ing.key, ing.foodId);
        }
        return map;
    }, [ingredients]);

    const foodIdToKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const [key, foodId] of keyToFoodId) map.set(foodId, key);
        return map;
    }, [keyToFoodId]);

    const itemCheckByFoodId = useMemo(() => {
        const map = new Map<string, ApiItemCheck>();
        for (const ic of itemChecksRaw) if (ic.foodId) map.set(ic.foodId, ic);
        return map;
    }, [itemChecksRaw]);

    const itemCheckByHouseholdId = useMemo(() => {
        const map = new Map<string, ApiItemCheck>();
        for (const ic of itemChecksRaw) if (ic.householdItemId) map.set(ic.householdItemId, ic);
        return map;
    }, [itemChecksRaw]);

    const sourceCheckIdByKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const sc of sourceChecksRaw) {
            const key = foodIdToKey.get(sc.foodId);
            if (!key) continue;
            const code = getCodeById(sc.recipeId) ?? sc.recipeId;
            map.set(`${key}::${code}::${sc.day}::${sc.slot}`, sc.id);
        }
        return map;
    }, [sourceChecksRaw, foodIdToKey]);

    const checked = useMemo(() => {
        const set = new Set<string>();
        for (const [key, foodId] of keyToFoodId) {
            if (itemCheckByFoodId.get(foodId)?.isChecked) set.add(key);
        }
        for (const item of allHouseholdItems) {
            if (itemCheckByHouseholdId.get(item.id)?.isChecked) set.add(`household::${item.id}`);
        }
        return set;
    }, [keyToFoodId, itemCheckByFoodId, itemCheckByHouseholdId, allHouseholdItems]);

    const stocks = useMemo(() => {
        const rec: Record<string, number> = {};
        for (const [key, foodId] of keyToFoodId) {
            const ic = itemCheckByFoodId.get(foodId);
            if (ic && ic.stock > 0) rec[key] = ic.stock;
        }
        return rec;
    }, [keyToFoodId, itemCheckByFoodId]);

    const freezerSelection = useMemo(() => {
        const rec: Record<string, string[]> = {};
        for (const [key, foodId] of keyToFoodId) {
            const ic = itemCheckByFoodId.get(foodId);
            if (ic && ic.freezerBagIds.length > 0) rec[key] = ic.freezerBagIds;
        }
        return rec;
    }, [keyToFoodId, itemCheckByFoodId]);

    const sourceChecked = useMemo(() => {
        const set = new Set<string>();
        for (const sc of sourceChecksRaw) {
            if (!sc.isChecked) continue;
            const key = foodIdToKey.get(sc.foodId);
            if (!key) continue;
            const code = getCodeById(sc.recipeId) ?? sc.recipeId;
            set.add(`${key}::${code}::${sc.day}::${sc.slot}`);
        }
        return set;
    }, [sourceChecksRaw, foodIdToKey]);

    const toggleItem = async (key: string) => {
        if (!currentPeriodId) return;
        if (key.startsWith('household::')) {
            const householdItemId = key.slice('household::'.length);
            const existing = itemCheckByHouseholdId.get(householdItemId);
            const updated = await upsertItemCheck(currentPeriodId, existing?.id, { householdItemId }, { isChecked: !existing?.isChecked });
            patchItemCheck(updated);
        } else {
            const foodId = keyToFoodId.get(key);
            if (!foodId) return;
            const existing = itemCheckByFoodId.get(foodId);
            const updated = await upsertItemCheck(currentPeriodId, existing?.id, { foodId }, { isChecked: !existing?.isChecked });
            patchItemCheck(updated);
        }
    };

    const setStock = async (key: string, value: number) => {
        if (!currentPeriodId) return;
        const foodId = keyToFoodId.get(key);
        if (!foodId) return;
        const existing = itemCheckByFoodId.get(foodId);
        const updated = await upsertItemCheck(currentPeriodId, existing?.id, { foodId }, { stockOverride: value > 0 ? value : null });
        patchItemCheck(updated);
    };

    const toggleSourceCheck = async (ingredientKey: string, sources: IngredientSource[], isChecked: boolean) => {
        if (!currentPeriodId) return;
        const foodId = keyToFoodId.get(ingredientKey);
        if (!foodId) return;
        for (const source of sources) {
            const recipeId = getIdByCode(source.recipeId) ?? source.recipeId;
            const localKey = `${ingredientKey}::${source.recipeId}::${source.day}::${source.slot}`;
            const existingId = sourceCheckIdByKey.get(localKey);
            const updated = await upsertSourceCheck(currentPeriodId, existingId, { foodId, recipeId, day: source.day, slot: source.slot }, isChecked);
            patchSourceCheck(updated);
        }
    };

    const toggleSourceBatch = async (batch: Array<{ ingredientKey: string; sources: IngredientSource[] }>, isChecked: boolean) => {
        for (const { ingredientKey, sources } of batch) {
            await toggleSourceCheck(ingredientKey, sources, isChecked);
        }
    };

    const toggleFreezerBag = async (bagId: string) => {
        if (!activeSources || !currentPeriodId) return;
        const { key: ingredientKey, freezerBags } = activeSources;
        const current = freezerSelection[ingredientKey] ?? [];
        const { next } = computeFreezerBagSelection(current, bagId, freezerBags);
        const foodId = keyToFoodId.get(ingredientKey);
        if (!foodId) return;
        const existing = itemCheckByFoodId.get(foodId);
        const updated = await upsertItemCheck(currentPeriodId, existing?.id, { foodId }, { freezerBagIds: next });
        patchItemCheck(updated);
    };

    const allGroupedItems = useMemo(
        () => ingredients ? groupIngredients(ingredients) : [],
        [ingredients]
    );

    const groupedItems = useMemo(
        () => ingredients ? filterGroupedIngredients(ingredients, ingredientFilter, checked, stocks, sourceChecked) : [],
        [ingredients, ingredientFilter, checked, stocks, sourceChecked]
    );

    const visibleHouseholdItems = useMemo(() => {
        if (ingredientFilter === 'all') return householdItems;
        return householdItems.filter(i => !checked.has(`household::${i.id}`));
    }, [householdItems, ingredientFilter, checked]);

    const uncheckedCount = useMemo(
        () => computeUncheckedCount(ingredients ?? [], checked, stocks, sourceChecked, householdItems),
        [ingredients, checked, stocks, sourceChecked, householdItems]
    );

    const ingredientColumns = useMemo(
        () => assignIngredientColumns(allGroupedItems, groupedItems, colCount),
        [allGroupedItems, groupedItems, colCount]
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

    const handleCopy = async () => {
        const uncheckedHousehold = householdItems.filter(i => !checked.has(`household::${i.id}`));
        const text = buildShoppingClipboardText(allGroupedItems, checked, stocks, sourceChecked, uncheckedHousehold);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="h-full flex flex-col gap-3 overflow-hidden">
                <div className="shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Liste de courses</h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                {daysLabel ?? <span className="italic text-slate-400">Aucune période sélectionnée</span>}
                                {ingredients && shoppingDays.length > 0 && (
                                    <span className="text-orange-600 font-medium before:content-['·'] before:mx-1.5">
                                        {uncheckedCount} restant{uncheckedCount !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </p>
                        </div>
                        {ingredients && shoppingDays.length > 0 && (
                            <button
                                onClick={handleCopy}
                                title={copied ? 'Copié !' : 'Copier la liste'}
                                className={`shrink-0 p-2 rounded-xl border transition-colors ${copied
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 text-green-600'
                                        : 'bg-white dark:bg-slate-100 border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-300'
                                    }`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-3 bg-slate-100 dark:bg-slate-200/60 rounded-2xl p-1">
                        <div className="flex gap-0.5">
                            <button
                                onClick={() => setViewMode('meals')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'meals'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Repas
                            </button>
                            <button
                                onClick={() => setViewMode('ingredients')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'ingredients'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Ingrédients
                            </button>
                        </div>
                        <div className={`flex gap-0.5 transition-opacity duration-200 ${viewMode === 'ingredients' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <button
                                onClick={() => setIngredientFilter('all')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${ingredientFilter === 'all'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Complète
                            </button>
                            <button
                                onClick={() => setIngredientFilter('missing')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all ${ingredientFilter === 'missing'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Manquants
                            </button>
                        </div>
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
                    ) : viewMode === 'meals' ? (
                        ingredients.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                                <ShoppingCart className="w-12 h-12 opacity-30" />
                                <p className="font-medium">Aucun repas planifié sur cette période</p>
                                <p className="text-sm">Planifie des repas pour générer la liste</p>
                            </div>
                        ) :
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
                    ) : ingredients.length === 0 && visibleHouseholdItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                            <ShoppingCart className="w-12 h-12 opacity-30" />
                            <p className="font-medium">Aucun repas planifié sur cette période</p>
                            <p className="text-sm">Planifie des repas pour générer la liste</p>
                        </div>
                    ) : groupedItems.length === 0 && visibleHouseholdItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                            <ShoppingCart className="w-12 h-12 opacity-30" />
                            <p className="font-medium text-slate-500">Tout est couvert !</p>
                            <p className="text-sm">Rien à acheter — tout est en stock ou coché</p>
                        </div>
                    ) : (
                        <>
                            {groupedItems.length > 0 && (
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
                                                        onShowSources={(key, sources, bags) => setActiveSources({ key, sources, freezerBags: bags })}
                                                        foodBags={foodBags}
                                                    />
                                                </div>
                                            ))}
                                            {ci === ingredientColumns.length - 1 && visibleHouseholdItems.length > 0 && (
                                                <HouseholdShoppingCard
                                                    items={visibleHouseholdItems}
                                                    checked={checked}
                                                    onToggle={toggleItem}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {groupedItems.length === 0 && visibleHouseholdItems.length > 0 && (
                                <div className="pb-4">
                                    <HouseholdShoppingCard
                                        items={visibleHouseholdItems}
                                        checked={checked}
                                        onToggle={toggleItem}
                                    />
                                </div>
                            )}
                        </>
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
                    freezerBags={activeSources.freezerBags}
                    selectedBagIds={freezerSelection[activeSources.key] ?? []}
                    onToggleBag={toggleFreezerBag}
                />
            )}
        </>
    );
};
