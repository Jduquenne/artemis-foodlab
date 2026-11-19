import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Food } from '../../../../core/domain/ingredient';
import { FoodPrice, PriceStore } from '../../../../core/domain/price';
import { PRICE_PER_KG_DECIMALS, formatEuro } from '../../../../core/logic/price/priceLogic';
import { isLiquidFood } from '../../../../core/logic/price/priceQueueLogic';
import { roundTo } from '../../../../core/utils/numberUtils';
import { formatBagDate } from '../../../../core/utils/dateUtils';
import { useFoodPriceHistory } from '../../../../shared/hooks/useFoodPriceHistory';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { usePriceStore } from '../../../../shared/store/usePriceStore';
import { withPending } from '../../../../shared/utils/withPending';
import { DecimalInput } from '../../../../shared/components/ui/DecimalInput';
import { Sheet } from '../../../../shared/components/ui/Sheet';
import { ConfirmActionModal } from '../../../../shared/components/ui/ConfirmActionModal';

export interface FoodPriceSheetProps {
    food: Food;
    store: PriceStore;
    price: FoodPrice | undefined;
    onClose: () => void;
}

export const FoodPriceSheet = ({ food, store, price, onClose }: FoodPriceSheetProps) => {
    const [value, setValue] = useState<number | null>(price?.pricePerKg ?? null);
    const [toDelete, setToDelete] = useState<FoodPrice | null>(null);
    const [deletedCount, setDeletedCount] = useState(0);
    const pending = usePendingKey(`price-record:${food.id}`);
    const history = useFoodPriceHistory(food.id, store.id, `${price?.id ?? ''}:${deletedCount}`);
    const liquid = isLiquidFood(food);
    const perUnit = liquid ? 'l' : 'kg';
    const canSave = !pending && value !== null && value > 0 && value !== price?.pricePerKg;

    const save = () => {
        if (!canSave || value === null) return;
        withPending(`price-record:${food.id}`, () =>
            usePriceStore.getState().recordPrice({ foodId: food.id, storeId: store.id, pricePerKg: roundTo(value, PRICE_PER_KG_DECIMALS) }),
        ).then((saved) => { if (saved) onClose(); }, () => undefined);
    };

    const confirmDelete = (entry: FoodPrice) =>
        withPending(`price-delete:${entry.id}`, () => usePriceStore.getState().deletePrice(entry)).then(
            () => {
                setToDelete(null);
                setDeletedCount((c) => c + 1);
                return true;
            },
            () => false,
        );

    return (
        <>
            <Sheet title={food.name} subtitle={`${store.name}, ${store.city}`} onClose={onClose}>
                <p className={`text-sm ${price ? 'text-slate-600' : 'text-amber-600 font-semibold'}`}>
                    {price
                        ? `Prix actuel : ${formatEuro(price.pricePerKg)}/${perUnit} · ${formatBagDate(price.recordedAt)}`
                        : 'Pas encore de prix'}
                </p>
                <label className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-semibold text-slate-900">{liquid ? 'Prix au litre' : 'Prix au kilo'}</span>
                    <span className="flex items-center w-40 rounded-xl border-2 border-slate-200 bg-subtle focus-within:border-orange-500 overflow-hidden">
                        <DecimalInput
                            value={value}
                            onValueChange={setValue}
                            onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                            placeholder="0,00"
                            autoFocus
                            aria-label={liquid ? 'Prix au litre' : 'Prix au kilo'}
                            className="flex-1 min-w-0 bg-transparent text-right text-xl font-bold tabular-nums py-2 pl-2.5 pr-1.5 outline-none text-slate-900"
                        />
                        <span className="pr-2.5 text-sm text-slate-400">€/{perUnit}</span>
                    </span>
                </label>
                <button
                    type="button"
                    onClick={save}
                    disabled={!canSave}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50"
                >
                    {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer le prix
                </button>
                <section className="flex flex-col gap-1">
                    <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Historique</h3>
                    {history.error ? (
                        <p className="text-sm text-slate-500">Historique indisponible.</p>
                    ) : !history.entries ? (
                        <p className="text-sm text-slate-400">Chargement…</p>
                    ) : history.entries.length === 0 ? (
                        <p className="text-sm text-slate-400">Aucun prix enregistré pour ce magasin.</p>
                    ) : (
                        <ul className={`flex flex-col ${history.loading ? 'opacity-60' : ''}`}>
                            {history.entries.map((entry) => (
                                <li key={entry.id} className="flex items-center gap-3 py-1.5 border-t border-slate-200 first:border-t-0">
                                    <span className="flex-1 min-w-0 text-sm text-slate-600 tabular-nums">{formatBagDate(entry.recordedAt)}</span>
                                    <span className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">{formatEuro(entry.pricePerKg)}/{perUnit}</span>
                                    <button
                                        type="button"
                                        onClick={() => setToDelete(entry)}
                                        aria-label={`Supprimer le prix du ${formatBagDate(entry.recordedAt)}`}
                                        className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-subtle-tint transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </Sheet>
            {toDelete && (
                <ConfirmActionModal
                    title="Supprimer ce prix ?"
                    intro={`Le prix du ${formatBagDate(toDelete.recordedAt)} sera retiré de l'historique. Le prix précédent, s'il existe, redeviendra le prix actuel.`}
                    confirmLabel="Supprimer"
                    danger
                    onConfirm={() => confirmDelete(toDelete)}
                    onCancel={() => setToDelete(null)}
                />
            )}
        </>
    );
};
