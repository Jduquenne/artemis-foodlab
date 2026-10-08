import { useState, useMemo, useDeferredValue } from 'react';
import { SearchBar } from '../../../../shared/components/ui/SearchBar';
import { MAX_PICKER_RESULTS, SearchRecipeResult, useSearchMeals } from '../../../../shared/hooks/useSearch';
import { Check, Loader2, X, TreePine } from 'lucide-react';
import { searchOutdoorRecipes } from '../../../../core/logic/recipe/recipeListLogic';
import { AsyncImage } from '../../../../shared/components/ui/AsyncImage';
import { useOutdoorSnapshot, useRecipesSnapshot } from '../../../../shared/hooks/useCatalogueSnapshot';

export interface RecipePickerProps {
    onSelect: (recipe: SearchRecipeResult) => Promise<void>;
    onClose: () => void;
    slotName: string;
    existingRecipeIds?: string[];
}

export const RecipePicker = ({ onSelect, onClose, slotName, existingRecipeIds = [] }: RecipePickerProps) => {
    const recipesDb = useRecipesSnapshot();
    const outdoorDb = useOutdoorSnapshot();
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [isClosing, setIsClosing] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const results = useSearchMeals(deferredQuery);

    const outdoorResults = useMemo(() => searchOutdoorRecipes(outdoorDb, deferredQuery, MAX_PICKER_RESULTS), [outdoorDb, deferredQuery]);

    const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

    const pick = async (recipe: SearchRecipeResult) => {
        if (savingId) return;
        setSavingId(recipe.recipeId);
        try {
            await onSelect(recipe);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className={`bg-surface w-full max-w-2xl h-[80dvh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Ajouter un repas</h2>
                        <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">{slotName}</p>
                    </div>
                    <button aria-label="Fermer" onClick={handleClose} className="p-2 hover:bg-surface-raised/60 rounded-full transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-4 bg-surface">
                    <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {results.length > 0 ? (
                        results.map((recipe) => {
                            const alreadyAdded = existingRecipeIds.includes(recipe.recipeId);
                            const isSaving = savingId === recipe.recipeId;
                            return (
                                <button
                                    key={recipe.recipeId}
                                    disabled={alreadyAdded || !!savingId}
                                    onClick={() => pick(recipe)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group text-left ${
                                        alreadyAdded || (savingId && !isSaving)
                                            ? 'opacity-40 cursor-not-allowed border-slate-200'
                                            : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20'
                                    }`}
                                >
                                    <AsyncImage asset={recipesDb[recipe.recipeId]?.assets?.mealPhoto} alt={recipe.name} wrapperClassName="w-16 h-16 rounded-xl shadow-sm shrink-0" className="object-cover" />
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">{recipe.name}</p>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{recipe.recipeId}</p>
                                    </div>
                                    {isSaving ? (
                                        <div className="bg-orange-500 text-white p-2 rounded-full">
                                            <Loader2 size={20} className="animate-spin" />
                                        </div>
                                    ) : alreadyAdded ? (
                                        <div className="bg-strong text-slate-500 p-2 rounded-full">
                                            <Check size={20} />
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 bg-orange-500 text-white p-2 rounded-full transition-opacity">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-center text-slate-400 mt-10 italic">
                            {query.length < 1 ? "Tapez le nom ou le numéro d'un plat..." : "Aucun plat trouvé."}
                        </p>
                    )}

                    {outdoorResults.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 pb-2 flex items-center gap-1.5">
                                <TreePine size={12} />
                                Extérieur
                            </p>
                            <div className="space-y-2">
                                {outdoorResults.map((entry) => {
                                    const alreadyAdded = existingRecipeIds.includes(entry.code);
                                    const isSaving = savingId === entry.code;
                                    const result: SearchRecipeResult = {
                                        id: entry.code,
                                        recipeId: entry.code,
                                        name: entry.name,
                                        matchedIngredients: [],
                                    };
                                    return (
                                        <button
                                            key={entry.code}
                                            disabled={alreadyAdded || !!savingId}
                                            onClick={() => pick(result)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group text-left ${
                                                alreadyAdded || (savingId && !isSaving)
                                                    ? 'opacity-40 cursor-not-allowed border-slate-200'
                                                    : 'border-slate-200 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                                            }`}
                                        >
                                            {entry.assets?.mealPhoto ? (
                                                <AsyncImage asset={entry.assets.mealPhoto} alt={entry.name} wrapperClassName="w-16 h-16 rounded-xl shadow-sm shrink-0" className="object-cover" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                                    <TreePine size={24} className="text-rose-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-black text-slate-800">{entry.name}</p>
                                                <p className="text-xs text-rose-400 uppercase font-bold">Extérieur</p>
                                            </div>
                                            {isSaving ? (
                                                <div className="bg-rose-500 text-white p-2 rounded-full">
                                                    <Loader2 size={20} className="animate-spin" />
                                                </div>
                                            ) : alreadyAdded ? (
                                                <div className="bg-strong text-slate-500 p-2 rounded-full">
                                                    <Check size={20} />
                                                </div>
                                            ) : (
                                                <div className="opacity-0 group-hover:opacity-100 bg-rose-500 text-white p-2 rounded-full transition-opacity">
                                                    <Check size={20} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
