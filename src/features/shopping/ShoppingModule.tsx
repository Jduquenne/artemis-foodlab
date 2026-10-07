import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, CalendarDays, Clipboard, Check, Scale, Plus } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { FreezerBag } from '../../core/domain/freezer';
import { ConsolidatedIngredient, IngredientSource, RecipeCard } from '../../core/domain/shopping';
import { ApiShoppingExtra, extrasToIngredients } from '../../core/logic/shopping/shoppingApiMapper';
import { computeUncheckedCount } from '../../core/logic/shopping/shoppingChecks';
import { buildShoppingClipboardText } from '../../core/logic/shopping/shoppingClipboard';
import {
    groupIngredients,
    filterGroupedIngredients,
    assignIngredientColumns,
} from '../../core/logic/shopping/shoppingGrouping';
import { buildRecipeCards } from '../../core/logic/shopping/shoppingRecipeCards';
import { getShoppingListForDays, getBasesForDays } from '../../core/services/shoppingListService';
import { getRecords as getHouseholdRecords } from '../../core/services/householdService';
import { syncWeekFromApi } from '../../core/services/planningService';
import { ExtraInput } from '../../core/services/shoppingPeriodService';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { distributeToColumns } from '../../shared/utils/columnUtils';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { useColCount } from '../../shared/hooks/useColCount';
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { useShoppingPeriodChecks } from '../../shared/hooks/useShoppingPeriodChecks';
import { ShoppingCategoryCard } from './components/ingredients/ShoppingCategoryCard';
import { RecipeShoppingCard } from './components/meals/RecipeShoppingCard';
import { SourcesModal } from './components/SourcesModal';
import { PricePerKgModal } from './components/PricePerKgModal';
import { HouseholdShoppingCard } from './components/HouseholdShoppingCard';
import { HouseholdPanel } from '../household/components/HouseholdPanel';
import { AddExtraModal } from './components/AddExtraModal';
import { useRefreshStore } from '../../shared/store/useRefreshStore';
import { useHouseholdSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { sumBy } from '../../shared/utils/collectionUtils';

const NO_INGREDIENTS: ConsolidatedIngredient[] = [];

export const ShoppingModule = () => {
    const navigate = useNavigate();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);
    const currentPeriodId = useMenuStore((s) => s.currentPeriodId);
    const authStatus = useAuthStore((s) => s.status);
    const recipes = useRecipesSnapshot();
    const { baseGrams } = useRecipeMetricsSnapshot();
    const householdDb = useHouseholdSnapshot();
    const allHouseholdItems = useMemo(() => Object.values(householdDb), [householdDb]);
    const refreshTick = useRefreshStore((s) => s.tick);

    const colCount = Math.min(useColCount(), 3);
    const { foodBags } = useFreezerStock();
    const [viewMode, setViewMode] = useState<'meals' | 'ingredients' | 'household'>('ingredients');
    const [ingredientFilter, setIngredientFilter] = useState<'all' | 'missing'>('all');
    const [copied, setCopied] = useState(false);
    const [showPriceCalc, setShowPriceCalc] = useState(false);
    const [activeSources, setActiveSources] = useState<{ key: string; sources: IngredientSource[]; freezerBags: FreezerBag[] } | null>(null);
    const [extraModal, setExtraModal] = useState<{ open: boolean; extra: ApiShoppingExtra | null }>({ open: false, extra: null });

    useEffect(() => {
        if (authStatus !== 'authenticated') return;
        const weekKeys = new Set(shoppingDays.map(d => `${d.year}-${d.week}`));
        for (const key of weekKeys) {
            const [year, week] = key.split('-').map(Number);
            syncWeekFromApi(year, week);
        }
    }, [authStatus, shoppingDays, refreshTick]);

    const ingredients = useLiveQuery(
        () => getShoppingListForDays(shoppingDays, { recipes, baseGrams }),
        [shoppingDays, recipes, baseGrams]
    );

    const basesRaw = useLiveQuery(
        () => getBasesForDays(shoppingDays, { recipes, baseGrams }),
        [shoppingDays, recipes, baseGrams]
    );
    const bases = useMemo(() => basesRaw ?? [], [basesRaw]);

    const householdRecords = useLiveQuery(() => getHouseholdRecords(), []);
    const householdItems = useMemo(() => {
        if (!householdRecords) return [];
        const checkedIds = new Set(householdRecords.map(r => r.id));
        return allHouseholdItems.filter(i => checkedIds.has(i.id));
    }, [householdRecords, allHouseholdItems]);

    const recipeCards = useMemo<RecipeCard[]>(
        () => ingredients ? buildRecipeCards(ingredients, bases, recipes) : [],
        [ingredients, bases, recipes]
    );

    const {
        extras,
        checked,
        stocks,
        sourceChecked,
        freezerSelection,
        toggleItem,
        setStock,
        toggleSourceCheck,
        toggleSourceBatch,
        toggleFreezerBag,
        saveExtra,
        removeExtra,
    } = useShoppingPeriodChecks(currentPeriodId, ingredients ?? NO_INGREDIENTS, allHouseholdItems);

    const extraIngredients = useMemo(() => extrasToIngredients(extras), [extras]);
    const displayIngredients = useMemo(
        () => (ingredients ? [...ingredients, ...extraIngredients] : undefined),
        [ingredients, extraIngredients],
    );

    const handleToggleFreezerBag = (bagId: string) => {
        if (activeSources) toggleFreezerBag(activeSources.key, bagId, activeSources.freezerBags);
    };

    const plannedRecipes = useMemo(
        () => recipeCards.map(c => ({ code: c.recipeId, name: c.recipeName })),
        [recipeCards]
    );

    const submitExtra = (body: ExtraInput) => saveExtra(extraModal.extra?.id ?? null, body);

    const handleEditExtra = (extraId: string) => {
        setExtraModal({ open: true, extra: extras.find(e => e.id === extraId) ?? null });
    };

    const allGroupedItems = useMemo(
        () => displayIngredients ? groupIngredients(displayIngredients) : [],
        [displayIngredients]
    );

    const groupedItems = useMemo(
        () => displayIngredients ? filterGroupedIngredients(displayIngredients, ingredientFilter, checked, stocks, sourceChecked) : [],
        [displayIngredients, ingredientFilter, checked, stocks, sourceChecked]
    );

    const visibleHouseholdItems = useMemo(() => {
        if (ingredientFilter === 'all') return householdItems;
        return householdItems.filter(i => !checked.has(`household::${i.id}`));
    }, [householdItems, ingredientFilter, checked]);

    const uncheckedCount = useMemo(
        () => computeUncheckedCount(displayIngredients ?? [], checked, stocks, sourceChecked, householdItems),
        [displayIngredients, checked, stocks, sourceChecked, householdItems]
    );

    const ingredientColumns = useMemo(
        () => assignIngredientColumns(allGroupedItems, groupedItems, colCount),
        [allGroupedItems, groupedItems, colCount]
    );

    const mealColumns = useMemo(
        () => distributeToColumns(recipeCards, c => c.directIngredients.length + sumBy(c.baseGroups, b => b.ingredients.length), colCount),
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
        const written = await navigator.clipboard.writeText(text).then(() => true, () => false);
        if (!written) return;
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
                        <div className="flex gap-2 shrink-0">
                            {currentPeriodId && (
                                <button
                                    onClick={() => setExtraModal({ open: true, extra: null })}
                                    title="Ajouter un article"
                                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Article</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowPriceCalc(true)}
                                title="Prix au kilo"
                                className="shrink-0 p-2 rounded-xl border bg-white dark:bg-slate-100 border-slate-200 text-slate-400 hover:text-orange-600 hover:border-orange-300 transition-colors"
                            >
                                <Scale className="w-4 h-4" />
                            </button>
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
                    </div>

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mt-3 bg-slate-100 dark:bg-slate-200/60 rounded-2xl p-1">
                        <div className="grid grid-cols-3 gap-0.5 sm:flex">
                            <button
                                onClick={() => setViewMode('meals')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold text-center transition-all ${viewMode === 'meals'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Repas
                            </button>
                            <button
                                onClick={() => setViewMode('ingredients')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold text-center transition-all ${viewMode === 'ingredients'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Ingrédients
                            </button>
                            <button
                                onClick={() => setViewMode('household')}
                                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold text-center transition-all ${viewMode === 'household'
                                        ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Articles
                            </button>
                        </div>
                        {viewMode === 'ingredients' && (
                            <div className="grid grid-cols-2 gap-0.5 sm:flex">
                                <button
                                    onClick={() => setIngredientFilter('all')}
                                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold text-center transition-all ${ingredientFilter === 'all'
                                            ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Complète
                                </button>
                                <button
                                    onClick={() => setIngredientFilter('missing')}
                                    className={`px-3.5 py-1.5 rounded-xl text-sm font-bold text-center transition-all ${ingredientFilter === 'missing'
                                            ? 'bg-white dark:bg-slate-100 text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
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
                    {viewMode === 'household' ? (
                        <HouseholdPanel colCount={colCount} />
                    ) : shoppingDays.length === 0 ? (
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
                    ) : (displayIngredients?.length ?? 0) === 0 && visibleHouseholdItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                            <ShoppingCart className="w-12 h-12 opacity-30" />
                            <p className="font-medium">Aucun repas planifié sur cette période</p>
                            <p className="text-sm">Planifie des repas ou ajoute un article</p>
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
                                                        onEditExtra={handleEditExtra}
                                                        onDeleteExtra={removeExtra}
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
                    onToggleBag={handleToggleFreezerBag}
                />
            )}

            {showPriceCalc && (
                <PricePerKgModal onClose={() => setShowPriceCalc(false)} />
            )}

            {extraModal.open && (
                <AddExtraModal
                    extra={extraModal.extra}
                    plannedRecipes={plannedRecipes}
                    onClose={() => setExtraModal({ open: false, extra: null })}
                    onSubmit={submitExtra}
                />
            )}
        </>
    );
};
