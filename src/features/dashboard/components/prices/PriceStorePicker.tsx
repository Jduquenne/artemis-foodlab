import { Store } from 'lucide-react';
import { PriceStore } from '../../../../core/domain/price';

export interface PriceStorePickerProps {
    stores: PriceStore[];
    value: PriceStore;
    onChange: (storeId: string) => void;
}

export const PriceStorePicker = ({ stores, value, onChange }: PriceStorePickerProps) => {
    if (stores.length < 2) return null;
    return (
        <label className="flex items-center gap-1.5 min-w-0 shrink px-2 py-1 rounded-lg border border-slate-200 bg-surface text-xs text-slate-600 focus-within:border-orange-400">
            <Store size={14} className="shrink-0 text-slate-400" />
            <select
                value={value.id}
                onChange={(e) => onChange(e.target.value)}
                aria-label="Magasin des prix"
                className="min-w-0 bg-transparent font-bold text-slate-700 focus:outline-none"
            >
                {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name}, {store.city}
                    </option>
                ))}
            </select>
        </label>
    );
};
