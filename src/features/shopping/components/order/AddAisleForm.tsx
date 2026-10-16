import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { MAX_CUSTOM_SHOPPING_CATEGORIES } from '../../../../core/domain/shopping';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { useCustomShoppingCategoryStore } from '../../../../shared/store/useCustomShoppingCategoryStore';
import { withPending } from '../../../../shared/utils/withPending';

export interface AddAisleFormProps {
    disabled: boolean;
    onCreated: (id: string) => void;
}

const PENDING_KEY = 'shopping-aisle-create';

export const AddAisleForm = ({ disabled, onCreated }: AddAisleFormProps) => {
    const count = useCustomShoppingCategoryStore((s) => s.categories.length);
    const createCategory = useCustomShoppingCategoryStore((s) => s.createCategory);
    const pending = usePendingKey(PENDING_KEY);
    const [label, setLabel] = useState('');
    const atMax = count >= MAX_CUSTOM_SHOPPING_CATEGORIES;
    const blocked = disabled || pending || atMax;

    const submit = async () => {
        const trimmed = label.trim();
        if (!trimmed || blocked) return;
        const created = await withPending(PENDING_KEY, () => createCategory(trimmed)).catch(() => undefined);
        if (!created) return;
        setLabel('');
        onCreated(created.id);
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex gap-2">
                <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                    maxLength={50}
                    disabled={blocked}
                    placeholder="Nouveau rayon (ex. Animalerie)"
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200 bg-surface text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={submit}
                    disabled={blocked || !label.trim()}
                    aria-label="Ajouter le rayon"
                    className="shrink-0 px-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                    {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
            </div>
            {atMax && (
                <span className="text-[11px] text-slate-400">Limite de {MAX_CUSTOM_SHOPPING_CATEGORIES} rayons personnalisés atteinte.</span>
            )}
        </div>
    );
};
