import { useState } from 'react';
import { ConsolidatedIngredient } from '../../../../core/domain/shopping';
import { formatShoppingQuantity } from '../../../../core/logic/shopping/shoppingRowLabel';
import { pluralizeUnit } from '../../../../core/logic/unit/unitFormatLogic';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { DecimalInput } from '../../../../shared/components/ui/DecimalInput';
import { ShoppingSheet } from './ShoppingSheet';

export interface StockEntrySheetProps {
    item: ConsolidatedIngredient;
    needed: number;
    stock: number;
    onSave: (value: number) => Promise<boolean>;
    onClose: () => void;
}

export const StockEntrySheet = ({ item, needed, stock, onSave, onClose }: StockEntrySheetProps) => {
    const [draft, setDraft] = useState<number | null>(stock > 0 ? stock : null);
    const pending = usePendingKey(`shopping-stock:${item.key}`);
    const left = Math.max(0, needed - (draft ?? 0));

    const save = (value: number) => {
        if (pending) return;
        onSave(value).then((saved) => { if (saved) onClose(); }, () => undefined);
    };

    return (
        <ShoppingSheet
            title={item.name}
            subtitle={<>Il en faut <b className="text-slate-900">{formatShoppingQuantity(needed, item.unit)}</b> pour la période. Combien en as-tu ?</>}
            onClose={onClose}
        >
            <div className="flex items-center gap-3">
                <DecimalInput
                    value={draft}
                    onValueChange={setDraft}
                    onKeyDown={(e) => { if (e.key === 'Enter') save(draft ?? 0); }}
                    placeholder="0"
                    aria-label={`Quantité que j'ai — ${item.name}`}
                    autoFocus
                    className="flex-1 min-w-0 text-3xl font-bold text-center tabular-nums bg-subtle border-2 border-slate-200 focus:border-orange-500 focus:outline-none rounded-2xl px-3 py-3 text-slate-900"
                />
                <span className="text-base font-semibold text-slate-500 min-w-10">{pluralizeUnit(item.unit, 2)}</span>
            </div>
            <p className="text-sm text-center text-slate-500">
                {left === 0 ? 'Rien à acheter' : <>Il restera <b className="text-slate-900">{formatShoppingQuantity(left, item.unit)}</b> à acheter</>}
            </p>
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => save(needed)}
                    className="py-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 font-bold disabled:opacity-50"
                >
                    J'ai tout
                </button>
                <button
                    type="button"
                    disabled={pending}
                    onClick={() => save(0)}
                    className="py-3 rounded-2xl border border-slate-200 bg-surface text-slate-700 font-bold disabled:opacity-50"
                >
                    Je n'en ai pas
                </button>
            </div>
            <button
                type="button"
                disabled={pending}
                onClick={() => save(draft ?? 0)}
                className={`py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-60 ${pending ? 'animate-pulse' : ''}`}
            >
                Valider
            </button>
        </ShoppingSheet>
    );
};
