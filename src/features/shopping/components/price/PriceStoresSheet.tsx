import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { PriceStoreInput } from '../../../../core/domain/price';
import { usePriceStore } from '../../../../shared/store/usePriceStore';
import { withPending } from '../../../../shared/utils/withPending';
import { ShoppingSheet } from '../sheets/ShoppingSheet';
import { PriceStoreForm } from './PriceStoreForm';

export interface PriceStoresSheetProps {
    onClose: () => void;
}

const run = (key: string, task: () => Promise<unknown>) =>
    withPending(key, task).then((result) => result !== undefined, () => false);

export const PriceStoresSheet = ({ onClose }: PriceStoresSheetProps) => {
    const stores = usePriceStore((s) => s.stores);
    const [editingId, setEditingId] = useState<string | null>(null);

    const create = (input: PriceStoreInput) => run('price-store-create', () => usePriceStore.getState().createStore(input));
    const update = (id: string) => (input: PriceStoreInput) =>
        run(`price-store-update:${id}`, () => usePriceStore.getState().updateStore(id, input)).then((saved) => {
            if (saved) setEditingId(null);
            return saved;
        });

    return (
        <ShoppingSheet title="Magasins des prix" subtitle="Les prix sont partagés par toute l'application, rattachés à un magasin." onClose={onClose}>
            {stores.length > 0 && (
                <ul className="flex flex-col divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                    {stores.map((store) => (
                        <li key={store.id} className="px-3 py-2.5">
                            {editingId === store.id ? (
                                <PriceStoreForm
                                    initial={{ name: store.name, city: store.city }}
                                    pendingKey={`price-store-update:${store.id}`}
                                    submitLabel="Enregistrer"
                                    onSubmit={update(store.id)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="min-w-0">
                                        <span className="block text-[15px] font-semibold text-slate-900 truncate">{store.name}</span>
                                        <span className="block text-xs text-slate-400 truncate">{store.city}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(store.id)}
                                        aria-label={`Renommer ${store.name}`}
                                        className="p-2 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <section className="flex flex-col gap-2">
                <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Ajouter un magasin</h3>
                <PriceStoreForm pendingKey="price-store-create" submitLabel="Ajouter" onSubmit={create} />
            </section>
        </ShoppingSheet>
    );
};
