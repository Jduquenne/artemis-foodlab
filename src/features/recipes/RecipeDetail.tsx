import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RecipeDetails } from '../../core/domain/types';
import recipesDb from '../../core/domain/recipes-db.json';

export const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const recipe = recipeId ? data[recipeId] : undefined;
    const recipeUrl = recipe?.assets?.recipes?.url;

    if (!recipe || !recipeUrl) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col p-4 md:p-6">

            <div className="flex items-center gap-3 shrink-0 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-black text-slate-900 truncate">
                    {recipe.name}
                </h1>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center">
                <img
                    src={recipeUrl}
                    alt={recipe.name}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-sm"
                />
            </div>

        </div>
    );
};
