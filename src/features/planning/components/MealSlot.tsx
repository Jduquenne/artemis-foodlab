import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../core/services/db';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

interface MealSlotProps {
    label: string;
    icon: string;
    recipeId?: string;
    onClick: () => void;       // Action pour ajouter/modifier
    onDelete?: () => void;     // Action pour supprimer
}

export const MealSlot = ({ label, icon, recipeId, onClick, onDelete }: MealSlotProps) => {
    const recipe = useLiveQuery(
        async () => {
            if (!recipeId) return undefined; // On remplace null par undefined
            return await db.recipes.where({ recipeId, type: 'photo' }).first();
        },
        [recipeId]
    );

    return (
        <div className="relative w-full h-full group">
            <button
                onClick={onClick}
                className={`relative w-full h-full rounded-xl border-2 transition-all flex flex-col overflow-hidden bg-white
          ${recipe
                        ? 'border-slate-100 shadow-sm'
                        : 'border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
                    }`}
            >
                {recipe ? (
                    <div className="flex flex-col h-full w-full">
                        <div className="flex-1 min-h-0 w-full p-1 bg-slate-50">
                            <img src={recipe.url} className="w-full h-full object-contain" alt={recipe.name} />
                        </div>
                        <div className="h-6 bg-white border-t border-slate-50 flex items-center px-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase truncate">
                                {recipe.name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1 h-full w-full opacity-40">
                        <span className="text-lg">{icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
                        <Plus size={12} className="absolute bottom-1 right-1" />
                    </div>
                )}
            </button>

            {/* BOUTONS D'ACTION (Apparaissent si une recette existe) */}
            {recipe && (
                <>
                    {/* Bas gauche : Modifier (ouvre le picker) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onClick(); }}
                        className="absolute bottom-7 left-1 p-1.5 bg-white/90 text-blue-600 rounded-lg shadow-md border border-slate-100 hover:bg-blue-50 transition-colors z-20"
                        title="Modifier le plat"
                    >
                        <RefreshCw size={14} />
                    </button>

                    {/* Bas droite : Supprimer */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="absolute bottom-7 right-1 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-md border border-slate-100 hover:bg-red-50 transition-colors z-20"
                        title="Supprimer le plat"
                    >
                        <Trash2 size={14} />
                    </button>
                </>
            )}
        </div>
    );
};