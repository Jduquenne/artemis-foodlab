import { Check, Settings } from 'lucide-react';
import { PriceStore } from '../../../../core/domain/price';
import { Sheet } from '../../../../shared/components/ui/Sheet';

export interface PriceSettingsSheetProps {
    stores: PriceStore[];
    activeStoreId: string | null;
    onSelectStore: (id: string) => void;
    askPriceOnCheck: boolean | null;
    onAskPriceOnCheckChange: (value: boolean) => void;
    onManageStores: (() => void) | null;
    onClose: () => void;
}

export const PriceSettingsSheet = ({ stores, activeStoreId, onSelectStore, askPriceOnCheck, onAskPriceOnCheckChange, onManageStores, onClose }: PriceSettingsSheetProps) => (
    <Sheet dismissable title="Magasin des prix" subtitle="Les prix estimés viennent de ce magasin." onClose={onClose}>
        <div className="flex flex-col gap-1.5">
            {stores.map((store) => (
                <button
                    key={store.id}
                    type="button"
                    onClick={() => onSelectStore(store.id)}
                    aria-pressed={store.id === activeStoreId}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${store.id === activeStoreId ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-200 bg-surface hover:border-orange-300'}`}
                >
                    <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-800 truncate">{store.name}</span>
                        {store.city && <span className="block text-xs text-slate-400 truncate">{store.city}</span>}
                    </span>
                    {store.id === activeStoreId && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                </button>
            ))}
            {stores.length === 0 && <p className="text-sm text-slate-400 italic">Aucun magasin pour l'instant.</p>}
        </div>
        {askPriceOnCheck !== null && (
            <label className="flex items-center justify-between gap-3 px-1 py-1 cursor-pointer">
                <span className="text-sm font-semibold text-slate-700">Saisir le prix en cochant</span>
                <input
                    type="checkbox"
                    checked={askPriceOnCheck}
                    onChange={(e) => onAskPriceOnCheckChange(e.target.checked)}
                    className="w-5 h-5 accent-orange-500"
                />
            </label>
        )}
        {onManageStores && (
            <button type="button" onClick={onManageStores} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-sm font-bold text-slate-600 hover:text-orange-600">
                <Settings className="w-4 h-4" />
                Gérer les magasins
            </button>
        )}
    </Sheet>
);
