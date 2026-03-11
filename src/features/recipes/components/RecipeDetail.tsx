import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';
import { Food } from '../../../core/domain/types';
import { typedRecipesDb } from '../../../core/utils/typedRecipesDb';
import { typedFoodDb } from '../../../core/utils/typedFoodDb';
import { calculateRecipeMacros } from '../../../core/utils/macroUtils';

const MACRO_LABELS = [
    { key: 'kcal' as const, label: 'Kcal', unit: '' },
    { key: 'proteins' as const, label: 'Protéines', unit: 'g' },
    { key: 'lipids' as const, label: 'Lipides', unit: 'g' },
    { key: 'carbohydrates' as const, label: 'Glucides', unit: 'g' },
    { key: 'fibers' as const, label: 'Fibres', unit: 'g' },
];

export const RecipeDetail = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLeaving, setIsLeaving] = useState(false);

    const data = typedRecipesDb;
    const foods: Record<string, Food> = typedFoodDb;
    const recipe = recipeId ? data[recipeId] : undefined;
    const recipeUrl = recipe?.assets?.instructionsPhoto?.url;
    const categoryId = searchParams.get('category');

    const categoryRecipeIds = useMemo(() => {
        if (!categoryId) return [];
        return Object.entries(data)
            .filter(([, r]) => r.categoryId === categoryId && r.assets?.instructionsPhoto)
            .map(([id]) => id);
    }, [categoryId, data]);

    const currentIndex = categoryRecipeIds.indexOf(recipeId ?? '');
    const prevId = currentIndex > 0 ? categoryRecipeIds[currentIndex - 1] : null;
    const nextId = currentIndex !== -1 && currentIndex < categoryRecipeIds.length - 1 ? categoryRecipeIds[currentIndex + 1] : null;

    const macros = useMemo(() => {
        if (!recipe) return null;
        try {
            return calculateRecipeMacros(recipe, data, foods);
        } catch {
            return null;
        }
    }, [recipe, data, foods]);

    if (!recipe || !recipeUrl) return null;

    const handleBack = () => {
        setIsLeaving(true);
        setTimeout(() => navigate(-1), 280);
    };

    const navigateTo = (id: string) => {
        navigate(`/recipes/detail/${id}?category=${categoryId}`, { replace: true });
    };

    return (
        <div className={`fixed inset-0 z-50 bg-slate-50 flex flex-col p-4 md:p-6 ${isLeaving ? 'modal-center-exit' : 'modal-center-enter'}`}>

            <div className="flex items-center gap-3 shrink-0 mb-3">
                <button
                    aria-label="Retour"
                    onClick={handleBack}
                    className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base sm:text-xl tablet:text-2xl font-black text-slate-900 leading-snug">
                    {recipe.name}
                </h1>
                <button
                    aria-label="Calculateur nutritionnel"
                    onClick={() => navigate(`/recipes/detail/${recipeId}/macros`)}
                    className="ml-auto p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                >
                    <Calculator className="w-5 h-5" />
                </button>
            </div>

            {macros && (
                <div className="shrink-0 mb-3 flex gap-2 overflow-x-auto pb-0.5">
                    {MACRO_LABELS.map(({ key, label, unit }) => (
                        <div key={key} className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-1.5 min-w-[60px]">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
                            <span className="text-sm font-bold text-slate-800 leading-none">
                                {Math.round(macros[key])}{unit}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex-1 min-h-0 flex items-center justify-center gap-2">
                {categoryId && (
                    <button
                        aria-label="Recette précédente"
                        onClick={() => prevId && navigateTo(prevId)}
                        disabled={!prevId}
                        className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <img
                    src={recipeUrl}
                    alt={recipe.name}
                    className="flex-1 min-w-0 max-h-full object-contain rounded-2xl shadow-sm"
                />
                {categoryId && (
                    <button
                        aria-label="Recette suivante"
                        onClick={() => nextId && navigateTo(nextId)}
                        disabled={!nextId}
                        className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-20 disabled:pointer-events-none"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>

        </div>
    );
};
