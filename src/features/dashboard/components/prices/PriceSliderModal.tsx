import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { roundTo } from '../../../../core/utils/numberUtils';
import { PRICE_PER_KG_DECIMALS } from '../../../../core/logic/price/priceLogic';
import {
    PRICE_QUEUE_SCOPES,
    PriceQueueFilters,
    buildPriceQueue,
    ingredientRecipesByFood,
    priceQueueCategories,
} from '../../../../core/logic/price/priceQueueLogic';
import { useFoodPrices } from '../../../../shared/hooks/useFoodPrices';
import { useFoodsSnapshot, useRecipesSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';
import { usePriceStore } from '../../../../shared/store/usePriceStore';
import { withPending } from '../../../../shared/utils/withPending';
import { PillTabs } from '../common/PillTabs';
import { PriceSliderCard } from './PriceSliderCard';

const INITIAL_FILTERS: PriceQueueFilters = { scope: 'missing', category: null, query: '' };

export interface PriceSliderModalProps {
    storeId: string | null;
    onClose: () => void;
}

export const PriceSliderModal = ({ storeId, onClose }: PriceSliderModalProps) => {
    const foods = useFoodsSnapshot();
    const recipes = useRecipesSnapshot();
    const { store, priceByFood } = useFoodPrices(storeId);
    const [photos] = useState(() => ingredientRecipesByFood(recipes));
    const [now] = useState(() => new Date());
    const [categories] = useState(() => priceQueueCategories(Object.values(foods)));
    const [filters, setFilters] = useState<PriceQueueFilters>(INITIAL_FILTERS);
    const [queue, setQueue] = useState(() => buildPriceQueue(Object.values(foods), priceByFood, INITIAL_FILTERS, now));
    const [index, setIndex] = useState(0);
    const [savedCount, setSavedCount] = useState(0);
    const [focusPrice, setFocusPrice] = useState(true);

    const changeFilters = (patch: Partial<PriceQueueFilters>) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        setQueue(buildPriceQueue(Object.values(foods), priceByFood, next, now));
        setIndex(0);
        setFocusPrice(false);
    };

    const move = (delta: number) => {
        setIndex((i) => i + delta);
        setFocusPrice(true);
    };

    const narrowed = filters.category !== null || filters.query.trim() !== '';

    const foodId = queue[index];
    const food = foodId ? foods[foodId] : undefined;
    const progress = queue.length > 0 ? Math.min(index, queue.length) / queue.length : 0;

    const save = (pricePerKg: number) => {
        if (!food || !store) return;
        withPending(`price-record:${food.id}`, () =>
            usePriceStore.getState().recordPrice({ foodId: food.id, storeId: store.id, pricePerKg: roundTo(pricePerKg, PRICE_PER_KG_DECIMALS) }),
        ).then((saved) => {
            if (!saved) return;
            setSavedCount((c) => c + 1);
            move(1);
        }, () => undefined);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Renseigner les prix"
                className="bg-surface-raised w-full sm:max-w-md h-[100dvh] sm:h-[min(44rem,92dvh)] sm:rounded-3xl shadow-2xl flex flex-col gap-3 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-5 modal-enter sm:modal-center-enter"
            >
                <div className="shrink-0 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-black text-slate-900 leading-tight">Renseigner les prix</h2>
                        <p className="text-xs text-slate-500 truncate">{store ? `${store.name}, ${store.city}` : 'Aucun magasin des prix'}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="p-1.5 -mr-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-strong transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {!store ? (
                    <p className="flex-1 grid place-items-center text-center text-sm text-slate-500">
                        Crée d'abord un magasin dans Courses › Options › Gérer les magasins.
                    </p>
                ) : (
                    <>
                        <div className="shrink-0 flex items-center justify-between gap-3">
                            <PillTabs tabs={PRICE_QUEUE_SCOPES} value={filters.scope} onChange={(scope) => changeFilters({ scope })} compact />
                            <span className="text-sm font-bold text-slate-500 tabular-nums">
                                {Math.min(index + 1, queue.length)} / {queue.length}
                            </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                            <label className="relative flex-1 min-w-0">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="search"
                                    value={filters.query}
                                    onChange={(e) => changeFilters({ query: e.target.value })}
                                    placeholder="Aller à un aliment"
                                    aria-label="Aller à un aliment"
                                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-surface text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                                />
                            </label>
                            <select
                                value={filters.category ?? ''}
                                onChange={(e) => changeFilters({ category: e.target.value || null })}
                                aria-label="Catégorie"
                                className="min-w-0 w-36 shrink rounded-lg border border-slate-200 bg-surface px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-orange-400"
                            >
                                <option value="">Toutes catégories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        <div className="shrink-0 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full w-full bg-orange-500 origin-left transition-transform"
                                style={{ transform: `scaleX(${progress})` }}
                            />
                        </div>
                        {!food ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                                <p className="text-xl font-black text-slate-900">
                                    {queue.length > 0 ? 'Terminé' : narrowed ? 'Aucun aliment ne correspond' : 'Rien à renseigner'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {savedCount} prix enregistré{savedCount > 1 ? 's' : ''} pendant cette session.
                                </p>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <PriceSliderCard
                                key={food.id}
                                food={food}
                                photoRecipe={photos.get(food.id)}
                                price={priceByFood.get(food.id)}
                                autoFocus={focusPrice}
                                onSave={save}
                                onSkip={() => move(1)}
                                onPrevious={index > 0 ? () => move(-1) : null}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
