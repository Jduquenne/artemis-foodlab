import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BatchUnit } from '../../../../core/domain/freezer';
import { RecipeDetails } from '../../../../core/domain/recipe';
import { BATCH_UNITS, BATCH_UNIT_LABELS, formatBatchQuantity, isValidBatchQuantity } from '../../../../core/logic/freezer/batchQuantityLogic';
import { addItemToCategory } from '../../../../core/services/freezerService';
import { Sheet } from '../../../../shared/components/ui/Sheet';
import { DecimalInput } from '../../../../shared/components/ui/DecimalInput';
import { useFreezerCategories } from '../../../../shared/hooks/useFreezerCategories';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';
import { withPending } from '../../../../shared/utils/withPending';
import { useNotificationStore } from '../../../../shared/store/useNotificationStore';

export interface FreezeBatchSheetProps {
    recipe: RecipeDetails;
    portions: number;
    onClose: () => void;
}

const FIELD = 'w-full px-3 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400';

export const FreezeBatchSheet = ({ recipe, portions, onClose }: FreezeBatchSheetProps) => {
    const navigate = useNavigate();
    const categories = useFreezerCategories();
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [unit, setUnit] = useState<BatchUnit>('portion');
    const [quantity, setQuantity] = useState<number | null>(portions);
    const pendingKey = `freezer-batch-add:${recipe.code}`;
    const pending = usePendingKey(pendingKey);
    const effectiveCategoryId = categoryId ?? categories[0]?.id ?? null;
    const valid = effectiveCategoryId !== null && quantity !== null && isValidBatchQuantity(unit, quantity);

    const save = () => {
        if (!valid || effectiveCategoryId === null || quantity === null) return;
        const categoryName = categories.find((c) => c.id === effectiveCategoryId)?.name ?? '';
        withPending(pendingKey, () => addItemToCategory(effectiveCategoryId, { type: 'batch', recipeId: recipe.code, recipeName: recipe.name, unit, quantity }))
            .then(() => {
                useNotificationStore.getState().push({ message: `${formatBatchQuantity(unit, quantity)} de « ${recipe.name} » ajouté${quantity > 1 ? 's' : ''} au congélateur (${categoryName}).`, variant: 'info', duration: 4000 });
                onClose();
            }, () => undefined);
    };

    return (
        <Sheet title="Mettre au congélateur" subtitle={`Combien de « ${recipe.name} » mets-tu au congélateur ?`} onClose={onClose}>
            {categories.length === 0 ? (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-slate-500">Crée d'abord une catégorie dans le congélateur.</p>
                    <button type="button" onClick={() => navigate('/freezer')} className="py-3 rounded-2xl bg-orange-500 text-white font-bold">Ouvrir le congélateur</button>
                </div>
            ) : (
                <>
                    <label className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-500">Catégorie</span>
                        <select value={effectiveCategoryId ?? ''} onChange={(e) => setCategoryId(e.target.value)} className={FIELD}>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </select>
                    </label>
                    <div className="flex gap-2">
                        {BATCH_UNITS.map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setUnit(option)}
                                aria-pressed={unit === option}
                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${unit === option ? 'bg-orange-500 text-white' : 'bg-muted text-slate-500'}`}
                            >
                                {BATCH_UNIT_LABELS[option]}
                            </button>
                        ))}
                    </div>
                    <DecimalInput
                        value={quantity}
                        onValueChange={setQuantity}
                        integer={unit === 'portion'}
                        placeholder={unit === 'portion' ? 'Portions' : 'Grammes'}
                        aria-label="Quantité mise au congélateur"
                        className={FIELD}
                    />
                    <button
                        type="button"
                        disabled={!valid || pending}
                        onClick={save}
                        className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-bold disabled:opacity-50"
                    >
                        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Ajouter au congélateur
                    </button>
                </>
            )}
        </Sheet>
    );
};
