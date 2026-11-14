import { Loader2, Trash2 } from 'lucide-react';
import { Food } from '../../../../core/domain/ingredient';
import { FoodPrice, PriceStore } from '../../../../core/domain/price';
import { costOfQuantity, costPerPiece, formatEuro, isLiquidUnit } from '../../../../core/logic/price/priceLogic';
import { formatShoppingQuantity } from '../../../../core/logic/shopping/shoppingRowLabel';
import { formatBagDate } from '../../../../core/utils/dateUtils';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface PriceSectionProps {
    quantity: number;
    unit: string;
    food: Food | undefined;
    price: FoodPrice | undefined;
    store: PriceStore | null;
    canEdit: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export const PriceSection = ({ quantity, unit, food, price, store, canEdit, onEdit, onDelete }: PriceSectionProps) => {
    const deletePending = usePendingKey(`price-delete:${price?.id ?? ''}`);

    if (!store) {
        return (
            <section className="flex flex-col gap-1">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Prix</h3>
                <p className="text-sm text-slate-500">
                    Aucun magasin des prix.{canEdit && ' Crée-en un dans Options › Gérer les magasins.'}
                </p>
            </section>
        );
    }

    const cost = price ? costOfQuantity(quantity, unit, food, price.pricePerKg) : null;
    const piece = price ? costPerPiece(unit, food, price.pricePerKg) : null;

    return (
        <section className="flex flex-col gap-1">
            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Prix · {store.name}, {store.city}</h3>
            <div className="flex flex-col gap-1 rounded-2xl bg-subtle px-3.5 py-3">
                {price ? (
                    <>
                        <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                            {formatEuro(price.pricePerKg)}
                            <span className="text-sm font-semibold text-slate-500"> / {isLiquidUnit(unit) ? 'litre' : 'kilo'}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                            {cost !== null
                                ? `≈ ${formatEuro(cost)} pour ${formatShoppingQuantity(quantity, unit)}`
                                : 'Pas de poids à la pièce : impossible d’estimer'}
                            {piece !== null && ` · ${formatEuro(piece)} ${unit === 'pièce' ? 'la pièce' : `par ${unit}`}`}
                        </p>
                        <p className="text-xs text-slate-400">Mis à jour le {formatBagDate(price.recordedAt)}</p>
                    </>
                ) : (
                    <>
                        <p className="text-base font-bold text-amber-600">Pas encore de prix</p>
                        <p className="text-sm text-slate-500">L'estimation de la liste ne compte pas cet article.</p>
                    </>
                )}
                {canEdit && (
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-surface text-sm font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
                        >
                            {price ? 'Mettre à jour le prix' : 'Ajouter un prix'}
                        </button>
                        {price && (
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={deletePending}
                                aria-label="Supprimer ce prix"
                                title="Supprimer ce prix (corriger une erreur)"
                                className="px-3 rounded-xl border border-slate-200 bg-surface text-red-600 hover:border-red-300 transition-colors disabled:opacity-60"
                            >
                                {deletePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
