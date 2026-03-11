import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { SearchBar } from '../../../../shared/components/ui/SearchBar';
import { useSearchDesserts } from '../../../../shared/hooks/useSearch';

interface DessertPickerProps {
    existingIds: string[];
    onSelect: (recipeId: string) => void;
    onClose: () => void;
}

export const DessertPicker = ({ existingIds, onSelect, onClose }: DessertPickerProps) => {
    const [query, setQuery] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    const results = useSearchDesserts(query);

    const handleClose = () => { setIsClosing(true); setTimeout(onClose, 300); };

    return (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className={`bg-white dark:bg-slate-100 w-full max-w-2xl h-[70vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? 'modal-exit sm:modal-center-exit' : 'modal-enter sm:modal-center-enter'}`}>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Ajouter un dessert</h2>
                        <p className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs tracking-widest">max 3</p>
                    </div>
                    <button aria-label="Fermer" onClick={handleClose} className="p-2 hover:bg-white/60 dark:hover:bg-slate-200/40 rounded-full transition-all">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-4 bg-white dark:bg-slate-100 shrink-0">
                    <SearchBar value={query} onChange={setQuery} onClear={() => setQuery('')} />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {results.length > 0 ? (
                        results.map((recipe) => {
                            const alreadyAdded = existingIds.includes(recipe.recipeId);
                            return (
                                <button
                                    key={recipe.recipeId}
                                    disabled={alreadyAdded}
                                    onClick={() => onSelect(recipe.recipeId)}
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
                            {query.length < 1 ? 'Tapez le nom d\'un dessert...' : 'Aucun dessert trouvé.'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
