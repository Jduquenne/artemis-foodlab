import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../core/services/db';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();

    const recipeData = useLiveQuery(
        () => db.recipes.where({ recipeId: recipeId, type: 'recipes' }).first(),
        [recipeId]
    );

    if (!recipeData) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-slate-500 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col p-4 md:p-6">

            <div className="flex items-center gap-3 shrink-0 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-black text-slate-900 truncate">
                    {recipeData.name}
                </h1>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center">
                <img
                    src={recipeData.url}
                    alt={recipeData.name}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-sm"
                />
            </div>

        </div>
    );
};
