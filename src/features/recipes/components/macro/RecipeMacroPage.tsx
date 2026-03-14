import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RecipeDetails, Unit } from '../../../../core/domain/types';
import { typedRecipesDb } from '../../../../core/typed-db/typedRecipesDb';
import { typedFoodDb } from '../../../../core/typed-db/typedFoodDb';
import { calculateRecipeMacros } from '../../../../core/utils/macroUtils';
import { MacroBar } from './MacroBar';
import { IngredientAdjustRow } from './IngredientAdjustRow';

const UNIT_WEIGHT_UNITS: string[] = [Unit.PIECE, Unit.PORTION, Unit.TRANCHE, Unit.FEUILLE, Unit.SACHET];

export const RecipeMacroPage = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  const recipe = recipeId ? typedRecipesDb[recipeId] : undefined;

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    if (!recipe) return {};
    return Object.fromEntries(recipe.ingredients.map(ing => [ing.id, ing.quantity ?? 0]));
  });

  const [unitWeights, setUnitWeights] = useState<Record<string, number>>(() => {
    if (!recipe) return {};
    const map: Record<string, number> = {};
    for (const ing of recipe.ingredients) {
      if (ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit)) {
        const w = typedFoodDb[ing.foodId]?.unitWeight;
        if (w != null) map[ing.foodId] = w;
      }
    }
    return map;
  });

  const [expandedBases, setExpandedBases] = useState<Set<string>>(new Set());

  const patchedFoods = useMemo(() => {
    const result = { ...typedFoodDb };
    for (const [foodId, weight] of Object.entries(unitWeights)) {
      if (result[foodId]) result[foodId] = { ...result[foodId], unitWeight: weight };
    }
    return result;
  }, [unitWeights]);

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
    try { return calculateRecipeMacros(patchedRecipe, typedRecipesDb, patchedFoods); }
    catch { return null; }
  }, [patchedRecipe, patchedFoods]);

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

  const handleUnitWeightChange = (foodId: string, value: string) => {
    const num = parseFloat(value);
    setUnitWeights(prev => ({ ...prev, [foodId]: isNaN(num) ? 0 : num }));
  };

  const resetUnitWeight = (foodId: string) => {
    const original = typedFoodDb[foodId]?.unitWeight;
    if (original != null) {
      setUnitWeights(prev => ({ ...prev, [foodId]: original }));
    } else {
      setUnitWeights(prev => { const next = { ...prev }; delete next[foodId]; return next; });
    }
  };

  const toggleBase = (id: string) => {
    setExpandedBases(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
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

        {macros && <MacroBar macros={macros} />}
      </div>

      <div className="border-t border-slate-200 shrink-0" />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 py-3">
        <div className="flex flex-col divide-y divide-slate-100">
          {recipe.ingredients.map((ing) => (
            <IngredientAdjustRow
              key={ing.id}
              ingredient={ing}
              currentQty={quantities[ing.id] ?? 0}
              currentUnitWeight={ing.foodId ? (unitWeights[ing.foodId] ?? null) : null}
              isExpanded={expandedBases.has(ing.id)}
              onQuantityChange={(value) => handleQuantityChange(ing.id, value)}
              onResetQuantity={() => setQuantities(prev => ({ ...prev, [ing.id]: ing.quantity ?? 0 }))}
              onUnitWeightChange={(value) => ing.foodId && handleUnitWeightChange(ing.foodId, value)}
              onResetUnitWeight={() => ing.foodId && resetUnitWeight(ing.foodId)}
              onToggleExpand={() => toggleBase(ing.id)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
