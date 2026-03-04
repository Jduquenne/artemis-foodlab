import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Food, RecipeDetails } from '../../../core/domain/types';
import recipesDb from '../../../core/data/recipes-db.json';
import foodDb from '../../../core/data/food-db.json';
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
    const [isLeaving, setIsLeaving] = useState(false);

    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const foods = foodDb as unknown as Record<string, Food>;
    const recipe = recipeId ? data[recipeId] : undefined;
    const recipeUrl = recipe?.assets?.instructionsPhoto?.url;

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
