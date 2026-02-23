import { useState } from 'react';
import { SearchBar } from '../../../shared/components/SearchBar';
import { SearchRecipeResult, useSearch } from '../../../shared/hooks/useSearch';
import { Check, X } from 'lucide-react';

interface RecipePickerProps {
    onSelect: (recipe: SearchRecipeResult) => void;
    onClose: () => void;
    slotName: string;
    existingRecipeIds?: string[];
}

export const RecipePicker = ({ onSelect, onClose, slotName, existingRecipeIds = [] }: RecipePickerProps) => {
    const [query, setQuery] = useState('');
    const [pendingSelection, setPendingSelection] = useState<SearchRecipeResult | null>(null);
    const results = useSearch(query) as SearchRecipeResult[];

    return (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-100 w-full max-w-2xl h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                {pendingSelection && (
                    <div className="absolute inset-0 z-110 bg-black/50 backdrop-blur-md flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-6 scale-up-center">
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

                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Ajouter un repas</h2>
                        <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">{slotName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/60 dark:hover:bg-slate-200/40 rounded-full transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 bg-white dark:bg-slate-100">
                    <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
                </div>

                {/* Results List */}
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
                                    <img src={recipe.photoUrl} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="" />
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
                </div>
            </div>
        </div>
    );
};
