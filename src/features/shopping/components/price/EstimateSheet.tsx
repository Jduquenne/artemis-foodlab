import { PriceStore } from '../../../../core/domain/price';
import { CostEstimate, formatEuro } from '../../../../core/logic/price/priceLogic';
import { ShoppingSheet } from '../sheets/ShoppingSheet';

export interface EstimateSheetProps {
    estimate: CostEstimate;
    store: PriceStore;
    onClose: () => void;
}

export const EstimateSheet = ({ estimate, store, onClose }: EstimateSheetProps) => {
    const partial = estimate.missing.length > 0;

    return (
        <ShoppingSheet
            title="Estimation"
            subtitle={`Prix de ${store.name}, ${store.city}, pour ce qui reste à acheter. Montant indicatif.`}
            onClose={onClose}
        >
            <p className={`text-4xl font-extrabold tabular-nums ${partial ? 'text-amber-600' : 'text-slate-900'}`}>
                ≈ {formatEuro(estimate.total)}
            </p>
            {partial ? (
                <section className="flex flex-col gap-1">
                    <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                        Sans prix, non comptés ({estimate.missing.length})
                    </h3>
                    <p className="text-sm text-slate-600">{estimate.missing.map((line) => line.name).join(', ')}</p>
                    <p className="text-xs text-slate-400">Le montant reste en orange tant qu'il manque au moins un prix.</p>
                </section>
            ) : (
                <p className="text-sm text-slate-500">Tous les articles ont un prix.</p>
            )}
        </ShoppingSheet>
    );
};
