import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AsyncImage } from '../../../shared/components/ui/AsyncImage';
import { CheckToggleIcon } from '../../../shared/components/ui/CheckToggleIcon';
import { usePlannableSnapshot } from '../../../shared/hooks/useCatalogueSnapshot';
import { MAX_DESSERTS_PER_SLOT } from '../../../core/domain/planningConfig';

export interface DessertChoiceModalProps {
    dessertIds: string[];
    pending: boolean;
    onConfirm: (keptIds: string[]) => void;
    onCancel: () => void;
}

export const DessertChoiceModal = ({ dessertIds, pending, onConfirm, onCancel }: DessertChoiceModalProps) => {
    const plannable = usePlannableSnapshot();
    const [kept, setKept] = useState<string[]>([]);
    const atMax = kept.length >= MAX_DESSERTS_PER_SLOT;

    const toggle = (id: string) =>
        setKept(prev => prev.includes(id) ? prev.filter(k => k !== id) : prev.length >= MAX_DESSERTS_PER_SLOT ? prev : [...prev, id]);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col max-h-[90dvh]">
                <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1.5">Choisir les desserts</p>
                <p className="text-sm text-slate-600 mb-4">
                    Le créneau d'arrivée accepte {MAX_DESSERTS_PER_SLOT} desserts au maximum. Coche ceux à garder, les autres seront retirés.
                </p>
                <ul className="flex flex-col gap-1.5 overflow-y-auto min-h-0 mb-4">
                    {dessertIds.map(id => {
                        const recipe = plannable[id];
                        const checked = kept.includes(id);
                        const blocked = !checked && atMax;
                        return (
                            <li key={id}>
                                <button
                                    type="button"
                                    onClick={() => toggle(id)}
                                    disabled={pending || blocked}
                                    className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-colors disabled:opacity-40 ${checked ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30' : 'border-slate-200 hover:bg-muted'}`}
                                >
                                    <AsyncImage asset={recipe?.assets?.mealPhoto} alt={recipe?.name ?? id} wrapperClassName="w-10 h-10 rounded-lg shrink-0" className="object-cover" />
                                    <span className="flex-1 min-w-0 truncate text-sm font-bold text-slate-800">{recipe?.name ?? id}</span>
                                    <CheckToggleIcon checked={checked} className="w-5 h-5" checkedClassName="text-orange-500" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => onConfirm(kept)}
                        disabled={pending || kept.length === 0}
                        className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Déplacer avec {kept.length} / {MAX_DESSERTS_PER_SLOT} dessert{kept.length > 1 ? 's' : ''}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={pending}
                        className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                    >
                        Annuler le déplacement
                    </button>
                </div>
            </div>
        </div>
    );
};
