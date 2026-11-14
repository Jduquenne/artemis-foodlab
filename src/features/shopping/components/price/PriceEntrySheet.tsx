import { ReactNode, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Food } from '../../../../core/domain/ingredient';
import { FoodPrice } from '../../../../core/domain/price';
import {
    PriceEntryField,
    PriceEntryValues,
    completePriceEntry,
    formatEuro,
    isLiquidUnit,
    priceEntryPayload,
    quantityInGrams,
    touchPriceEntryField,
} from '../../../../core/logic/price/priceLogic';
import { pluralizeUnit } from '../../../../core/logic/unit/unitFormatLogic';
import { formatBagDate } from '../../../../core/utils/dateUtils';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { usePriceStore } from '../../../../shared/store/usePriceStore';
import { withPending } from '../../../../shared/utils/withPending';
import { ShoppingSheet } from '../sheets/ShoppingSheet';
import { PriceEntryRow } from './PriceEntryRow';

export interface PriceEntrySheetProps {
    name: string;
    unit: string;
    foodId: string;
    food: Food | undefined;
    storeId: string;
    storeName: string;
    currentPrice: FoodPrice | undefined;
    initialQuantity: number;
    inCart?: boolean;
    footer?: ReactNode;
    onClose: () => void;
}

const INITIAL_TOUCHED: PriceEntryField[] = ['quantity', 'perKg'];

export const PriceEntrySheet = ({
    name,
    unit,
    foodId,
    food,
    storeId,
    storeName,
    currentPrice,
    initialQuantity,
    inCart = false,
    footer,
    onClose,
}: PriceEntrySheetProps) => {
    const gramsPerUnit = quantityInGrams(1, unit, food);
    const liquid = isLiquidUnit(unit);
    const perUnitLabel = liquid ? '€/l' : '€/kg';
    const pendingKey = `price-record:${foodId}`;
    const pending = usePendingKey(pendingKey);
    const [touched, setTouched] = useState<PriceEntryField[]>(INITIAL_TOUCHED);
    const [entry, setEntry] = useState(() => {
        const initial: PriceEntryValues = {
            quantity: initialQuantity > 0 ? initialQuantity : null,
            paid: null,
            perKg: currentPrice?.pricePerKg ?? null,
        };
        return gramsPerUnit === null ? { values: initial, computed: null } : completePriceEntry(initial, INITIAL_TOUCHED, gramsPerUnit);
    });
    const payload = priceEntryPayload(entry.values, gramsPerUnit);

    const change = (field: PriceEntryField) => (value: number | null) => {
        const nextTouched = touchPriceEntryField(touched, field);
        const values = { ...entry.values, [field]: value };
        setTouched(nextTouched);
        setEntry(gramsPerUnit === null ? { values, computed: null } : completePriceEntry(values, nextTouched, gramsPerUnit));
    };

    const save = () => {
        if (!payload || pending) return;
        withPending(pendingKey, () => usePriceStore.getState().recordPrice({ foodId, storeId, ...payload }))
            .then((saved) => { if (saved) onClose(); }, () => undefined);
    };

    const subtitle = currentPrice
        ? <>Dernier prix : <b className="text-slate-900">{formatEuro(currentPrice.pricePerKg)}/{liquid ? 'l' : 'kg'}</b> le {formatBagDate(currentPrice.recordedAt)} · {storeName}</>
        : <>Aucun prix enregistré · {storeName}</>;

    return (
        <ShoppingSheet title={name} subtitle={subtitle} onClose={onClose}>
            {inCart && (
                <p className="-mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Dans le caddie
                </p>
            )}
            <div className="flex flex-col gap-2">
                {gramsPerUnit !== null && (
                    <>
                        <PriceEntryRow
                            label={liquid ? 'Volume' : gramsPerUnit === 1 || unit === 'kg' ? 'Poids' : 'Quantité'}
                            suffix={pluralizeUnit(unit, 2)}
                            value={entry.values.quantity}
                            computed={entry.computed === 'quantity'}
                            onChange={change('quantity')}
                        />
                        <PriceEntryRow
                            label="Prix payé"
                            suffix="€"
                            value={entry.values.paid}
                            computed={entry.computed === 'paid'}
                            autoFocus
                            onChange={change('paid')}
                        />
                    </>
                )}
                <PriceEntryRow
                    label={liquid ? 'Prix au litre' : 'Prix au kilo'}
                    suffix={perUnitLabel}
                    value={entry.values.perKg}
                    computed={entry.computed === 'perKg'}
                    autoFocus={gramsPerUnit === null}
                    onChange={change('perKg')}
                />
            </div>
            <p className="-mt-1 text-xs text-slate-400">
                {gramsPerUnit === null
                    ? 'Pas de poids à la pièce pour cet aliment : seul le prix au kilo est possible.'
                    : 'Deux cases remplies, la troisième se calcule.'}
            </p>
            <button
                type="button"
                onClick={save}
                disabled={!payload || pending}
                className={`py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 ${pending ? 'animate-pulse' : ''}`}
            >
                Enregistrer le prix
            </button>
            <button type="button" onClick={onClose} className="py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                {inCart ? 'Passer, sans prix' : 'Annuler'}
            </button>
            {footer}
        </ShoppingSheet>
    );
};
