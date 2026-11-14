import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, CalendarDays, ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { FreezerBag } from '../../core/domain/freezer';
import { ConsolidatedIngredient, IngredientSource, RecipeCard, ShoppingLayout } from '../../core/domain/shopping';
import { ApiShoppingExtra, extrasToIngredients } from '../../core/logic/shopping/shoppingApiMapper';
import { computeUncheckedCount } from '../../core/logic/shopping/shoppingChecks';
import { buildShoppingClipboardText } from '../../core/logic/shopping/shoppingClipboard';
import { PlaceFilter, filterIngredientsByPlace, placeFilterTitle } from '../../core/logic/shopping/shoppingPlaceLogic';
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
import { distributeToColumns } from '../../core/utils/columnUtils';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { resolveShoppingAisles } from '../../core/logic/shopping/shoppingCategoryOrderLogic';
import { useCustomShoppingCategoryStore } from '../../shared/store/useCustomShoppingCategoryStore';
import { CategoryOrderModal } from './components/order/CategoryOrderModal';
import { ColBreakpoint, useColCount } from '../../shared/hooks/useColCount';

const SHOPPING_COLUMNS: readonly ColBreakpoint[] = [
    { minWidth: 1024, cols: 3 },
    { minWidth: 768, cols: 2 },
];
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { useShoppingPeriodChecks } from '../../shared/hooks/useShoppingPeriodChecks';
import { ShoppingCategoryCard } from './components/ingredients/ShoppingCategoryCard';
import { RecipeShoppingCard } from './components/meals/RecipeShoppingCard';
import { SourcesModal } from './components/SourcesModal';
import { PricePerKgModal } from './components/PricePerKgModal';
import { HouseholdShoppingCard } from './components/HouseholdShoppingCard';
import { HouseholdPanel } from './components/household/HouseholdPanel';
import { AddExtraModal } from './components/AddExtraModal';
import { ShoppingHeader } from './components/header/ShoppingHeader';
import { ActiveFilterPill } from './components/header/ActiveFilterPills';
import { useShoppingModeStore } from '../../shared/store/useShoppingModeStore';
import { useNotificationStore } from '../../shared/store/useNotificationStore';
import { useRefreshStore } from '../../shared/store/useRefreshStore';
import { useFoodsSnapshot, useHouseholdSnapshot, useRecipeMetricsSnapshot, useRecipesSnapshot } from '../../shared/hooks/useCatalogueSnapshot';
import { useProfileStore } from '../../shared/store/useProfileStore';
import { useAccompanimentStore } from '../../shared/store/useAccompanimentStore';
import { sumBy } from '../../core/utils/collectionUtils';

const NO_INGREDIENTS: ConsolidatedIngredient[] = [];

export const ShoppingModule = () => {
    const navigate = useNavigate();
    const shoppingDays = useMenuStore((s) => s.shoppingDays);
    const currentPeriodId = useMenuStore((s) => s.currentPeriodId);
    const authStatus = useAuthStore((s) => s.status);
    const savedCategoryOrder = useAuthStore((s) => s.user?.shoppingCategoryOrder);
    const placeName = useAuthStore((s) => s.user?.shoppingPlaceName ?? null);
    const customCategories = useCustomShoppingCategoryStore((s) => s.categories);
    const categoryOrder = useMemo(
        () => resolveShoppingAisles(savedCategoryOrder, customCategories),
        [savedCategoryOrder, customCategories]
    );
    const recipes = useRecipesSnapshot();
    const { baseGrams } = useRecipeMetricsSnapshot();
    const foods = useFoodsSnapshot();
    const profiles = useProfileStore(s => s.profiles);
    const accompaniments = useAccompanimentStore(s => s.accompaniments);
    const householdDb = useHouseholdSnapshot();
    const allHouseholdItems = useMemo(() => Object.values(householdDb), [householdDb]);
    const refreshTick = useRefreshStore((s) => s.tick);

    const colCount = useColCount(SHOPPING_COLUMNS);
    const { foodBags } = useFreezerStock();
    const [layout, setLayout] = useState<ShoppingLayout>('aisles');
    const [showHousehold, setShowHousehold] = useState(false);
    const mode = useShoppingModeStore((s) => s.mode);
    const setMode = useShoppingModeStore((s) => s.setMode);
    const ingredientFilter = mode === 'store' ? 'missing' : 'all';
    const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('all');
    const [showPriceCalc, setShowPriceCalc] = useState(false);
    const [showCategoryOrder, setShowCategoryOrder] = useState(false);
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
        () => getShoppingListForDays(shoppingDays, { recipes, baseGrams, foods, profiles, accompaniments }),
        [shoppingDays, recipes, baseGrams, foods, profiles, accompaniments]
    );

    const basesRaw = useLiveQuery(
        () => getBasesForDays(shoppingDays, { recipes, baseGrams, foods, profiles, accompaniments }),
        [shoppingDays, recipes, baseGrams, foods, profiles, accompaniments]
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
        atPlace,
        toggleItem,
        toggleAtPlace,
        setAtPlaceForKeys,
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

    const effectivePlaceFilter: PlaceFilter = placeName ? placeFilter : 'all';

    const placeIngredients = useMemo(
        () => displayIngredients ? filterIngredientsByPlace(displayIngredients, atPlace, effectivePlaceFilter) : undefined,
        [displayIngredients, atPlace, effectivePlaceFilter]
    );

    const allGroupedItems = useMemo(
        () => placeIngredients ? groupIngredients(placeIngredients, categoryOrder) : [],
        [placeIngredients, categoryOrder]
    );

    const groupedItems = useMemo(
        () => placeIngredients ? filterGroupedIngredients(placeIngredients, categoryOrder, ingredientFilter, checked, stocks, sourceChecked) : [],
        [placeIngredients, categoryOrder, ingredientFilter, checked, stocks, sourceChecked]
    );

    const shownHouseholdItems = useMemo(
        () => (effectivePlaceFilter === 'place' ? [] : householdItems),
        [householdItems, effectivePlaceFilter]
    );

    const visibleHouseholdItems = useMemo(() => {
        if (ingredientFilter === 'all') return shownHouseholdItems;
        return shownHouseholdItems.filter(i => !checked.has(`household::${i.id}`));
    }, [shownHouseholdItems, ingredientFilter, checked]);

    const uncheckedCount = useMemo(
        () => computeUncheckedCount(placeIngredients ?? [], checked, stocks, sourceChecked, shownHouseholdItems),
        [placeIngredients, checked, stocks, sourceChecked, shownHouseholdItems]
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
        const uncheckedHousehold = shownHouseholdItems.filter(i => !checked.has(`household::${i.id}`));
        const text = buildShoppingClipboardText(allGroupedItems, checked, stocks, sourceChecked, uncheckedHousehold, placeFilterTitle(effectivePlaceFilter, placeName));
        const written = await navigator.clipboard.writeText(text).then(() => true, () => false);
        useNotificationStore.getState().push({
            message: written ? 'Liste copiée' : 'Copie refusée par le navigateur',
            variant: written ? 'info' : 'error',
            duration: 2500,
        });
    };

    const hasList = !!ingredients && shoppingDays.length > 0;
    const filterPills: ActiveFilterPill[] = [
        ...(effectivePlaceFilter !== 'all' && placeName
            ? [{
                key: 'place',
                label: effectivePlaceFilter === 'place' ? `Seulement ${placeName}` : `Hors ${placeName}`,
                clearLabel: 'Retirer le filtre de lieu',
                onClear: () => setPlaceFilter('all'),
            }]
            : []),
        ...(layout === 'meals'
            ? [{ key: 'layout', label: 'Par repas', clearLabel: "Revenir à l'affichage par rayon", onClear: () => setLayout('aisles') }]
            : []),
    ];

    return (
        <>
            <div className="h-full flex flex-col gap-3 overflow-hidden">
                {showHousehold ? (
                    <div className="shrink-0 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowHousehold(false)}
                            aria-label="Revenir à la liste de courses"
                            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl sm:text-2xl tablet:text-3xl font-black text-slate-900">Articles du quotidien</h1>
                    </div>
                ) : (
                    <ShoppingHeader
                        daysLabel={daysLabel}
                        remainingCount={hasList ? uncheckedCount : null}
                        mode={mode}
                        onModeChange={setMode}
                        onAddExtra={currentPeriodId ? () => setExtraModal({ open: true, extra: null }) : null}
                        pills={filterPills}
                        options={{
                            placeName,
                            placeFilter: effectivePlaceFilter,
                            onPlaceFilterChange: setPlaceFilter,
                            layout,
                            onLayoutChange: setLayout,
                            hasActiveFilter: filterPills.length > 0,
                            onOpenHousehold: () => setShowHousehold(true),
                            onOpenAisleOrder: () => setShowCategoryOrder(true),
                            onOpenPriceCalc: () => setShowPriceCalc(true),
                            onCopy: hasList ? () => { handleCopy().catch(() => undefined); } : null,
                            onChangeDays: () => navigate('/planning'),
                        }}
                    />
                )}

                <div
                    className="flex-1 min-h-0 overflow-y-auto pr-1"
                    onScroll={markScrolling}
                >
                    {showHousehold ? (
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
                    ) : layout === 'meals' ? (
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
                                                    recipeName={card.recipeName}
                                                    directIngredients={card.directIngredients}
                                                    baseGroups={card.baseGroups}
                                                    sourceChecked={sourceChecked}
                                                    placeName={placeName}
                                                    atPlace={atPlace}
                                                    onToggleAllAtPlace={setAtPlaceForKeys}
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
                    ) : effectivePlaceFilter !== 'all' && (placeIngredients?.length ?? 0) === 0 && shownHouseholdItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                            <ShoppingCart className="w-12 h-12 opacity-30" />
                            <p className="font-medium text-slate-500">
                                {effectivePlaceFilter === 'place' ? `Rien n'est marqué à acheter à ${placeName}` : 'Rien à acheter ailleurs'}
                            </p>
                            <p className="text-sm">
                                {effectivePlaceFilter === 'place' ? 'Marque des lignes avec le repère de la liste' : 'Tout est marqué comme à acheter sur place'}
                            </p>
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
                                                <div key={group.key} className="animate-fade-in-up" style={{ animationDelay: `${(ci + i) * 60}ms` }}>
                                                    <ShoppingCategoryCard
                                                        label={group.label}
                                                        items={group.list}
                                                        checked={checked}
                                                        stocks={stocks}
                                                        sourceChecked={sourceChecked}
                                                        placeName={placeName}
                                                        atPlace={atPlace}
                                                        onToggle={toggleItem}
                                                        onToggleAtPlace={toggleAtPlace}
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

            {showCategoryOrder && (
                <CategoryOrderModal initialOrder={categoryOrder} onClose={() => setShowCategoryOrder(false)} />
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
