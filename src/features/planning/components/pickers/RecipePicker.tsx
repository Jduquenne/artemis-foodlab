import { useState, useMemo } from 'react';
import { SearchBar } from '../../../../shared/components/ui/SearchBar';
import { SearchRecipeResult, useSearchMeals } from '../../../../shared/hooks/useSearch';
import { Check, X, TreePine } from 'lucide-react';
import { typedOutdoorDb } from '../../../../core/typed-db/typedOutdoorDb';

export interface RecipePickerProps {
    onSelect: (recipe: SearchRecipeResult) => void;
    onClose: () => void;
    slotName: string;
    existingRecipeIds?: string[];
}

export const RecipePicker = ({ onSelect, onClose, slotName, existingRecipeIds = [] }: RecipePickerProps) => {
    const [query, setQuery] = useState('');
    const [pendingSelection, setPendingSelection] = useState<SearchRecipeResult | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const results = useSearchMeals(query);

    const outdoorResults = useMemo(() => {
        const q = query.toLowerCase();
        return Object.values(typedOutdoorDb).filter(e => !q || e.name.toLowerCase().includes(q));
    }, [query]);

    const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

    return (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className={`bg-white dark:bg-slate-100 w-full max-w-2xl h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>
                {pendingSelection && (
                    <div className="absolute inset-0 z-110 bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-6 animate-scale-pop">
                            <div className="space-y-2">
                                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Confirmer l'ajout</p>
                                <h3 className="text-xl font-black text-slate-900">
                                    Ajouter "{pendingSelection.name}" au {slotName} ?
                                </h3>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPendingSelection(null)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-300 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-400 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => onSelect(pendingSelection)}
                                    className="flex-1 py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200/50 hover:bg-orange-600 transition-colors"
                                >
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Ajouter un repas</h2>
                        <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">{slotName}</p>
                    </div>
                    <button aria-label="Fermer" onClick={handleClose} className="p-2 hover:bg-white/60 dark:hover:bg-slate-200/40 rounded-full transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-slate-100">
                    <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {results.length > 0 ? (
                        results.map((recipe) => {
                            const alreadyAdded = existingRecipeIds.includes(recipe.recipeId);
                            return (
                                <button
                                    key={recipe.recipeId}
                                    disabled={alreadyAdded}
                                    onClick={() => onSelect(recipe)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group text-left ${
                                        alreadyAdded
                                            ? 'opacity-40 cursor-not-allowed border-slate-200'
                                            : 'border-slate-200 hover:border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/20'
                                    }`}
                                >
                                    <img src={recipe.photoUrl} loading="lazy" decoding="async" className="w-16 h-16 rounded-xl object-cover shadow-sm" alt={recipe.name} />
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800">{recipe.name}</p>
                                        <p className="text-xs text-slate-400 uppercase font-bold">{recipe.recipeId}</p>
                                    </div>
                                    {alreadyAdded ? (
                                        <div className="bg-slate-200 dark:bg-slate-300 text-slate-500 p-2 rounded-full">
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
                                    const alreadyAdded = existingRecipeIds.includes(entry.id);
                                    const result: SearchRecipeResult = {
                                        id: entry.id,
                                        recipeId: entry.id,
                                        name: entry.name,
                                        photoUrl: entry.assets?.photo?.url ?? '',
                                        ingredientsUrl: '',
                                        matchedIngredients: [],
                                    };
                                    return (
                                        <button
                                            key={entry.id}
                                            disabled={alreadyAdded}
                                            onClick={() => onSelect(result)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group text-left ${
                                                alreadyAdded
                                                    ? 'opacity-40 cursor-not-allowed border-slate-200'
                                                    : 'border-slate-200 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                                            }`}
                                        >
                                            {entry.assets?.photo?.url ? (
                                                <img src={entry.assets.photo.url} loading="lazy" decoding="async" className="w-16 h-16 rounded-xl object-cover shadow-sm" alt={entry.name} />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                                    <TreePine size={24} className="text-rose-400" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-black text-slate-800">{entry.name}</p>
                                                <p className="text-xs text-rose-400 uppercase font-bold">Extérieur</p>
                                            </div>
                                            {alreadyAdded ? (
                                                <div className="bg-slate-200 dark:bg-slate-300 text-slate-500 p-2 rounded-full">
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
