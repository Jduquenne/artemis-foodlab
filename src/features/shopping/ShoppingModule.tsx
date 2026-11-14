import { useState, useMemo, useEffect } from 'react';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { ConsolidatedIngredient, RecipeCard, ShoppingLayout } from '../../core/domain/shopping';
import { ApiShoppingExtra, extrasToIngredients } from '../../core/logic/shopping/shoppingApiMapper';
import { computeUncheckedCount, effectiveQuantity, remainingToBuy } from '../../core/logic/shopping/shoppingChecks';
import { FoodPrice } from '../../core/domain/price';
import { updateMe } from '../../core/services/authService';
import { buildShoppingClipboardText } from '../../core/logic/shopping/shoppingClipboard';
import { PlaceFilter, filterIngredientsByPlace, placeFilterTitle } from '../../core/logic/shopping/shoppingPlaceLogic';
import {
    groupIngredients,
    filterGroupedIngredients,
    countCoveredByGroup,
} from '../../core/logic/shopping/shoppingGrouping';
import { buildRecipeCards } from '../../core/logic/shopping/shoppingRecipeCards';
import { getShoppingListForDays, getBasesForDays } from '../../core/services/shoppingListService';
import { getRecords as getHouseholdRecords } from '../../core/services/householdService';
import { syncWeekFromApi } from '../../core/services/planningService';
import { ExtraInput } from '../../core/services/shoppingPeriodService';
import { markScrolling } from '../../shared/utils/scrollGuard';
import { useMenuStore } from '../../shared/store/useMenuStore';
import { useAuthStore } from '../../shared/store/useAuthStore';
import { resolveShoppingAisles } from '../../core/logic/shopping/shoppingCategoryOrderLogic';
import { useCustomShoppingCategoryStore } from '../../shared/store/useCustomShoppingCategoryStore';
import { CategoryOrderModal } from './components/order/CategoryOrderModal';
import { ColBreakpoint, useColCount } from '../../shared/hooks/useColCount';
import { useFreezerStock } from '../../shared/hooks/useFreezerStock';
import { useShoppingPeriodChecks } from '../../shared/hooks/useShoppingPeriodChecks';
import { ShoppingAislesView } from './components/ingredients/ShoppingAislesView';
import { ShoppingMealsView } from './components/meals/ShoppingMealsView';
import { ShoppingItemSheet } from './components/sheets/ShoppingItemSheet';
import { StockEntrySheet } from './components/sheets/StockEntrySheet';
import { PricePerKgModal } from './components/PricePerKgModal';
import { ShoppingEmptyState } from './components/ShoppingEmptyState';
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
import { shoppingFilterPills } from '../../core/logic/shopping/shoppingFilterPills';
import { formatBagDate } from '../../core/utils/dateUtils';
import { useFoodPrices } from '../../shared/hooks/useFoodPrices';
import { useIsAdmin } from '../../shared/hooks/useIsAdmin';
import { useIsDemo } from '../../shared/hooks/useIsDemo';
import { usePriceStore } from '../../shared/store/usePriceStore';
import { withPending } from '../../shared/utils/withPending';
import { ConfirmActionModal } from '../../shared/components/ui/ConfirmActionModal';
import { PriceSection } from './components/price/PriceSection';
import { PriceEntrySheet } from './components/price/PriceEntrySheet';
import { PriceStoresSheet } from './components/price/PriceStoresSheet';

const SHOPPING_COLUMNS: readonly ColBreakpoint[] = [
    { minWidth: 1024, cols: 3 },
    { minWidth: 768, cols: 2 },
];

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
    const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('all');
    const [showPriceCalc, setShowPriceCalc] = useState(false);
    const [showCategoryOrder, setShowCategoryOrder] = useState(false);
    const [detailKey, setDetailKey] = useState<string | null>(null);
    const [priceEntryKey, setPriceEntryKey] = useState<string | null>(null);
    const [priceToDelete, setPriceToDelete] = useState<FoodPrice | null>(null);
    const [showPriceStores, setShowPriceStores] = useState(false);
    const foodPrices = useFoodPrices();
    const setUser = useAuthStore((s) => s.setUser);
    const isAdmin = useIsAdmin();
    const isDemo = useIsDemo();
    const canEditPrices = isAdmin && !isDemo;
    const [stockKey, setStockKey] = useState<string | null>(null);
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
        checkableKeys,
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

    const detailItem = detailKey ? displayIngredients?.find((i) => i.key === detailKey) ?? null : null;
    const priceItem = priceEntryKey ? displayIngredients?.find((i) => i.key === priceEntryKey) ?? null : null;
    const stockItem = stockKey ? displayIngredients?.find((i) => i.key === stockKey) ?? null : null;
    const detailBags = useMemo(
        () => (detailItem?.foodId ? foodBags.get(detailItem.foodId)?.filter((b) => b.unit === detailItem.unit) ?? [] : []),
        [detailItem, foodBags],
    );

    const handleToggleFreezerBag = (bagId: string) => {
        if (detailItem) toggleFreezerBag(detailItem.key, bagId, detailBags);
    };

    const plannedRecipes = useMemo(
        () => recipeCards.map(c => ({ code: c.recipeId, name: c.recipeName })),
        [recipeCards]
    );

    const submitExtra = (body: ExtraInput) => saveExtra(extraModal.extra?.id ?? null, body);

    const handleEditExtra = (extraId: string) => {
        setDetailKey(null);
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
        () => placeIngredients ? filterGroupedIngredients(placeIngredients, categoryOrder, mode, stocks, sourceChecked) : [],
        [placeIngredients, categoryOrder, mode, stocks, sourceChecked]
    );

    const shownHouseholdItems = useMemo(
        () => (effectivePlaceFilter === 'place' ? [] : householdItems),
        [householdItems, effectivePlaceFilter]
    );

    const coveredByGroup = useMemo(
        () => countCoveredByGroup(allGroupedItems, stocks, sourceChecked),
        [allGroupedItems, stocks, sourceChecked]
    );

    const uncheckedCount = useMemo(
        () => computeUncheckedCount(placeIngredients ?? [], checked, stocks, sourceChecked, shownHouseholdItems),
        [placeIngredients, checked, stocks, sourceChecked, shownHouseholdItems]
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

    const quantityToPrice = (item: ConsolidatedIngredient) =>
        remainingToBuy(item, stocks, sourceChecked) || effectiveQuantity(item, sourceChecked);

    const selectPriceStore = (id: string) => {
        withPending('price-store-select', async () => setUser(await updateMe({ priceStoreId: id }))).catch(() => undefined);
    };

    const confirmDeletePrice = (price: FoodPrice) =>
        withPending(`price-delete:${price.id}`, () => usePriceStore.getState().deletePrice(price)).then(
            () => {
                setPriceToDelete(null);
                return true;
            },
            () => false,
        );

    const hasList = !!ingredients && shoppingDays.length > 0;
    const filterPills: ActiveFilterPill[] = shoppingFilterPills(effectivePlaceFilter, placeName, layout).map((pill) => ({
        key: pill.kind,
        label: pill.label,
        clearLabel: pill.clearLabel,
        onClear: pill.kind === 'place' ? () => setPlaceFilter('all') : () => setLayout('aisles'),
    }));

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
                            priceStores: foodPrices.stores,
                            activePriceStoreId: foodPrices.store?.id ?? null,
                            onPriceStoreChange: selectPriceStore,
                            onManagePriceStores: canEditPrices ? () => setShowPriceStores(true) : null,
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
                        <ShoppingEmptyState
                            title="Aucune période de courses sélectionnée"
                            hint="Va dans le planning pour choisir tes jours"
                            icon={<CalendarDays className="w-12 h-12 opacity-30" />}
                            action={
                                <button
                                    onClick={() => navigate('/planning')}
                                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
                                >
                                    <CalendarDays className="w-4 h-4" />
                                    Aller au planning
                                </button>
                            }
                        />
                    ) : !ingredients ? (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            Chargement...
                        </div>
                    ) : layout === 'meals' ? (
                        <ShoppingMealsView
                            cards={recipeCards}
                            colCount={colCount}
                            sourceChecked={sourceChecked}
                            checkableKeys={checkableKeys}
                            placeName={placeName}
                            atPlace={atPlace}
                            onToggleAllAtPlace={setAtPlaceForKeys}
                            onToggleSource={toggleSourceCheck}
                            onToggleBatch={toggleSourceBatch}
                            onOpenDetail={setDetailKey}
                        />
                    ) : (displayIngredients?.length ?? 0) === 0 && shownHouseholdItems.length === 0 ? (
                        <ShoppingEmptyState title="Aucun repas planifié sur cette période" hint="Planifie des repas ou ajoute un article" />
                    ) : effectivePlaceFilter !== 'all' && (placeIngredients?.length ?? 0) === 0 && shownHouseholdItems.length === 0 ? (
                        <ShoppingEmptyState
                            title={effectivePlaceFilter === 'place' ? `Rien n'est marqué à acheter à ${placeName}` : 'Rien à acheter ailleurs'}
                            hint={effectivePlaceFilter === 'place' ? "Ouvre le détail d'un article pour le marquer" : 'Tout est marqué comme à acheter sur place'}
                        />
                    ) : groupedItems.length === 0 && shownHouseholdItems.length === 0 ? (
                        <ShoppingEmptyState title="Tout est couvert !" hint="Rien à acheter : tout est déjà à la maison" />
                    ) : (
                        <ShoppingAislesView
                            allGroups={allGroupedItems}
                            groups={groupedItems}
                            colCount={colCount}
                            mode={mode}
                            coveredByGroup={coveredByGroup}
                            checked={checked}
                            stocks={stocks}
                            sourceChecked={sourceChecked}
                            placeName={placeName}
                            atPlace={atPlace}
                            foodBags={foodBags}
                            householdItems={shownHouseholdItems}
                            onToggle={toggleItem}
                            onOpenStock={setStockKey}
                            onOpenDetail={setDetailKey}
                            onManageHousehold={() => setShowHousehold(true)}
                        />
                    )}
                </div>
            </div>

            {detailItem && (
                <ShoppingItemSheet
                    item={detailItem}
                    stock={stocks[detailItem.key] ?? 0}
                    sourceChecked={sourceChecked}
                    placeName={placeName}
                    atPlace={atPlace.has(detailItem.key)}
                    freezerBags={detailBags}
                    selectedBagIds={freezerSelection[detailItem.key] ?? []}
                    priceSection={detailItem.foodId ? (
                        <PriceSection
                            quantity={quantityToPrice(detailItem)}
                            unit={detailItem.unit}
                            food={foods[detailItem.foodId]}
                            price={foodPrices.priceByFood.get(detailItem.foodId)}
                            store={foodPrices.store}
                            canEdit={canEditPrices}
                            onEdit={() => setPriceEntryKey(detailItem.key)}
                            onDelete={() => setPriceToDelete(foodPrices.priceByFood.get(detailItem.foodId ?? '') ?? null)}
                        />
                    ) : null}
                    onToggleAtPlace={toggleAtPlace}
                    onToggleSource={toggleSourceCheck}
                    onToggleBag={handleToggleFreezerBag}
                    onEditExtra={handleEditExtra}
                    onDeleteExtra={removeExtra}
                    onClose={() => setDetailKey(null)}
                />
            )}

            {priceItem?.foodId && foodPrices.store && (
                <PriceEntrySheet
                    key={priceItem.key}
                    name={priceItem.name}
                    unit={priceItem.unit}
                    foodId={priceItem.foodId}
                    food={foods[priceItem.foodId]}
                    storeId={foodPrices.store.id}
                    storeName={`${foodPrices.store.name}, ${foodPrices.store.city}`}
                    currentPrice={foodPrices.priceByFood.get(priceItem.foodId)}
                    initialQuantity={quantityToPrice(priceItem)}
                    onClose={() => setPriceEntryKey(null)}
                />
            )}

            {priceToDelete && (
                <ConfirmActionModal
                    title="Supprimer ce prix ?"
                    intro={`Le prix du ${formatBagDate(priceToDelete.recordedAt)} sera retiré de l'historique. Le prix précédent, s'il existe, redeviendra le prix actuel.`}
                    confirmLabel="Supprimer"
                    danger
                    onConfirm={() => confirmDeletePrice(priceToDelete)}
                    onCancel={() => setPriceToDelete(null)}
                />
            )}

            {showPriceStores && <PriceStoresSheet onClose={() => setShowPriceStores(false)} />}

            {stockItem && (
                <StockEntrySheet
                    key={stockItem.key}
                    item={stockItem}
                    needed={effectiveQuantity(stockItem, sourceChecked)}
                    stock={stocks[stockItem.key] ?? 0}
                    onSave={(value) => setStock(stockItem.key, value)}
                    onClose={() => setStockKey(null)}
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
