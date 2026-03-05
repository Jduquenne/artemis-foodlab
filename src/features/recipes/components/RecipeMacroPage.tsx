import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, RotateCcw } from 'lucide-react';
import { Food, RecipeDetails, Unit } from '../../../core/domain/types';
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

const UNIT_WEIGHT_UNITS: string[] = [Unit.PIECE, Unit.PORTION, Unit.TRANCHE, Unit.FEUILLE, Unit.SACHET];

export const RecipeMacroPage = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [isLeaving, setIsLeaving] = useState(false);

    const data = recipesDb as unknown as Record<string, RecipeDetails>;
    const foods = foodDb as unknown as Record<string, Food>;
    const recipe = recipeId ? data[recipeId] : undefined;

    const [quantities, setQuantities] = useState<Record<string, number>>(() => {
        if (!recipe) return {};
        return Object.fromEntries(recipe.ingredients.map(ing => [ing.id, ing.quantity ?? 0]));
    });

    const [unitWeights, setUnitWeights] = useState<Record<string, number>>(() => {
        if (!recipe) return {};
        const map: Record<string, number> = {};
        for (const ing of recipe.ingredients) {
            if (ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit)) {
                const w = foods[ing.foodId]?.unitWeight;
                if (w != null) map[ing.foodId] = w;
            }
        }
        return map;
    });

    const [expandedBases, setExpandedBases] = useState<Set<string>>(new Set());

    const patchedFoods = useMemo(() => {
        const result = { ...foods };
        for (const [foodId, weight] of Object.entries(unitWeights)) {
            if (result[foodId]) result[foodId] = { ...result[foodId], unitWeight: weight };
        }
        return result;
    }, [foods, unitWeights]);

    const patchedRecipe = useMemo<RecipeDetails | null>(() => {
        if (!recipe) return null;
        return {
            ...recipe,
            ingredients: recipe.ingredients.map(ing => ({
                ...ing,
                quantity: quantities[ing.id] ?? ing.quantity,
            })),
        };
    }, [recipe, quantities]);

    const macros = useMemo(() => {
        if (!patchedRecipe) return null;
        try { return calculateRecipeMacros(patchedRecipe, data, patchedFoods); }
        catch { return null; }
    }, [patchedRecipe, data, patchedFoods]);

    if (!recipe) return null;

    const photoUrl = recipe.assets?.photo?.url;

    const handleBack = () => {
        setIsLeaving(true);
        setTimeout(() => navigate(-1), 280);
    };

    const handleQuantityChange = (id: string, value: string) => {
        const num = parseFloat(value);
        setQuantities(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
    };

    const resetQuantity = (id: string, original: number) => {
        setQuantities(prev => ({ ...prev, [id]: original }));
    };

    const handleUnitWeightChange = (foodId: string, value: string) => {
        const num = parseFloat(value);
        setUnitWeights(prev => ({ ...prev, [foodId]: isNaN(num) ? 0 : num }));
    };

    const resetUnitWeight = (foodId: string) => {
        const original = foods[foodId]?.unitWeight;
        if (original != null) setUnitWeights(prev => ({ ...prev, [foodId]: original }));
        else setUnitWeights(prev => { const next = { ...prev }; delete next[foodId]; return next; });
    };

    const toggleBase = (id: string) => {
        setExpandedBases(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className={`fixed inset-0 z-50 bg-slate-50 flex flex-col ${isLeaving ? 'modal-center-exit' : 'modal-center-enter'}`}>

            <div className="shrink-0 p-4 md:p-6 pb-3">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        aria-label="Retour"
                        onClick={handleBack}
                        className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {photoUrl ? (
                        <img
                            src={photoUrl}
                            alt={recipe.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-xl bg-slate-200 shrink-0" />
                    )}

                    <h1 className="text-base sm:text-xl font-black text-slate-900 leading-snug min-w-0">
                        {recipe.name}
                    </h1>
                </div>

                {macros && (
                    <div className="flex gap-2 overflow-x-auto pb-0.5">
                        {MACRO_LABELS.map(({ key, label, unit }) => (
                            <div key={key} className="flex flex-col items-center bg-slate-100 rounded-xl px-3 py-1.5 min-w-15">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
                                <span className="text-sm font-bold text-slate-800 leading-none">
                                    {Math.round(macros[key])}{unit}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-200 shrink-0" />

            <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-3">
                <div className="flex flex-col divide-y divide-slate-100">
                    {recipe.ingredients.map((ing) => {
                        const hasData = !!(ing.foodId || ing.baseId);
                        const isBase = !!ing.baseId;
                        const originalQty = ing.quantity ?? 0;
                        const currentQty = quantities[ing.id] ?? 0;
                        const isQtyModified = hasData && currentQty !== originalQty;
                        const isExpanded = expandedBases.has(ing.id);
                        const unitLabel = ing.unit || null;

                        const showUnitWeight = !!(ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit));
                        const originalUnitWeight = ing.foodId ? (foods[ing.foodId]?.unitWeight ?? null) : null;
                        const currentUnitWeight = ing.foodId ? (unitWeights[ing.foodId] ?? null) : null;
                        const isUnitWeightModified = showUnitWeight && originalUnitWeight !== currentUnitWeight;

                        const baseRecipe = isBase ? data[ing.baseId!] : null;
                        const baseScaleFactor = baseRecipe
                            ? currentQty / Math.max(baseRecipe.defaultPortions, 1)
                            : 0;

                        return (
                            <div key={ing.id}>
                                <div className={`flex items-start gap-2 py-2.5 ${!hasData ? 'opacity-40' : ''}`}>
                                    {isBase ? (
                                        <button
                                            onClick={() => toggleBase(ing.id)}
                                            className="mt-0.5 p-0.5 rounded text-slate-400 hover:text-orange-500 transition-colors shrink-0"
                                        >
                                            <ChevronDown
                                                size={15}
                                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    ) : (
                                        <div className="w-4 shrink-0" />
                                    )}

                                    <span className="flex-1 min-w-0 text-sm text-slate-700 truncate pt-0.5">
                                        {ing.name}
                                        {ing.preparation && (
                                            <span className="text-slate-400 text-xs ml-1">({ing.preparation})</span>
                                        )}
                                    </span>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className="flex items-center gap-1.5">
                                            {isQtyModified && (
                                                <button
                                                    onClick={() => resetQuantity(ing.id, originalQty)}
                                                    className="p-0.5 text-slate-400 hover:text-orange-500 transition-colors"
                                                    aria-label="Remettre valeur par défaut"
                                                >
                                                    <RotateCcw size={11} />
                                                </button>
                                            )}
                                            <input
                                                type="number"
                                                min="0"
                                                step="any"
                                                disabled={!hasData}
                                                value={currentQty}
                                                onChange={(e) => handleQuantityChange(ing.id, e.target.value)}
                                                className={`w-20 text-right text-sm font-medium bg-white dark:bg-slate-100 border rounded-lg px-2 py-1 focus:outline-none disabled:cursor-not-allowed transition-colors ${isQtyModified ? 'border-orange-400 text-orange-600' : 'border-slate-200 text-slate-800 focus:border-orange-400'}`}
                                            />
                                            <span className="text-xs text-slate-400 w-10">
                                                {unitLabel || '—'}
                                            </span>
                                        </div>

                                        {isQtyModified && (
                                            <span className="text-[10px] text-slate-400 tabular-nums pr-13">
                                                défaut : {originalQty}{unitLabel ? ` ${unitLabel}` : ''}
                                            </span>
                                        )}

                                        {showUnitWeight && (
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {isUnitWeightModified && (
                                                    <button
                                                        onClick={() => resetUnitWeight(ing.foodId!)}
                                                        className="p-0.5 text-slate-400 hover:text-orange-500 transition-colors"
                                                        aria-label="Remettre poids unitaire par défaut"
                                                    >
                                                        <RotateCcw size={11} />
                                                    </button>
                                                )}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={currentUnitWeight ?? ''}
                                                    onChange={(e) => handleUnitWeightChange(ing.foodId!, e.target.value)}
                                                    placeholder="—"
                                                    className={`w-20 text-right text-xs bg-white dark:bg-slate-100 border rounded-lg px-2 py-1 focus:outline-none transition-colors ${isUnitWeightModified ? 'border-orange-400 text-orange-500' : 'border-slate-200 text-slate-500 focus:border-orange-400'}`}
                                                />
                                                <span className="text-[10px] text-slate-400 w-10">
                                                    g/{ing.unit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isBase && isExpanded && baseRecipe && (
                                    <div className="ml-6 mb-2 pl-3 border-l-2 border-orange-200 flex flex-col gap-0.5">
                                        {baseRecipe.ingredients.map((baseIng, bi) => {
                                            const scaledQty = baseIng.quantity != null
                                                ? Math.round(baseIng.quantity * baseScaleFactor * 10) / 10
                                                : null;
                                            return (
                                                <div key={bi} className="flex items-center gap-2 py-1">
                                                    <span className="flex-1 min-w-0 text-xs text-slate-500 truncate">
                                                        {baseIng.name}
                                                        {baseIng.preparation && (
                                                            <span className="text-slate-400 ml-1">({baseIng.preparation})</span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-slate-500 tabular-nums shrink-0">
                                                        {scaledQty ?? '—'}
                                                    </span>
                                                    <span className="text-xs text-slate-400 w-10 shrink-0">
                                                        {baseIng.unit || '—'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};
