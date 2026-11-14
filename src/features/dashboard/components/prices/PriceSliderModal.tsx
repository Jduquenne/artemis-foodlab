import { useState } from 'react';
import { X } from 'lucide-react';
import { roundTo } from '../../../../core/utils/numberUtils';
import { PRICE_PER_KG_DECIMALS } from '../../../../core/logic/price/priceLogic';
import { PRICE_QUEUE_SCOPES, PriceQueueScope, buildPriceQueue, ingredientRecipesByFood } from '../../../../core/logic/price/priceQueueLogic';
import { useFoodPrices } from '../../../../shared/hooks/useFoodPrices';
import { useFoodsSnapshot, useRecipesSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';
import { usePriceStore } from '../../../../shared/store/usePriceStore';
import { withPending } from '../../../../shared/utils/withPending';
import { PillTabs } from '../common/PillTabs';
import { PriceSliderCard } from './PriceSliderCard';

export interface PriceSliderModalProps {
    onClose: () => void;
}

export const PriceSliderModal = ({ onClose }: PriceSliderModalProps) => {
    const foods = useFoodsSnapshot();
    const recipes = useRecipesSnapshot();
    const { store, priceByFood } = useFoodPrices();
    const [photos] = useState(() => ingredientRecipesByFood(recipes));
    const [scope, setScope] = useState<PriceQueueScope>('missing');
    const [queue, setQueue] = useState(() => buildPriceQueue(Object.values(foods), priceByFood, 'missing'));
    const [index, setIndex] = useState(0);
    const [savedCount, setSavedCount] = useState(0);

    const changeScope = (next: PriceQueueScope) => {
        setScope(next);
        setQueue(buildPriceQueue(Object.values(foods), priceByFood, next));
        setIndex(0);
    };

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
            setIndex((i) => i + 1);
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
                            <PillTabs tabs={PRICE_QUEUE_SCOPES} value={scope} onChange={changeScope} compact />
                            <span className="text-sm font-bold text-slate-500 tabular-nums">
                                {Math.min(index + 1, queue.length)} / {queue.length}
                            </span>
                        </div>
                        <div className="shrink-0 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full w-full bg-orange-500 origin-left transition-transform"
                                style={{ transform: `scaleX(${progress})` }}
                            />
                        </div>
                        {!food ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                                <p className="text-xl font-black text-slate-900">{queue.length === 0 ? 'Rien à renseigner' : 'Terminé'}</p>
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
                                onSave={save}
                                onSkip={() => setIndex((i) => i + 1)}
                                onPrevious={index > 0 ? () => setIndex((i) => i - 1) : null}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
