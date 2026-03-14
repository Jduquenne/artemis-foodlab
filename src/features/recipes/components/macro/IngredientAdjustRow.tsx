import { ChevronDown, RotateCcw } from 'lucide-react';
import { Ingredient, Unit } from '../../../../core/domain/types';
import { typedRecipesDb } from '../../../../core/typed-db/typedRecipesDb';
import { typedFoodDb } from '../../../../core/typed-db/typedFoodDb';

export interface IngredientAdjustRowProps {
  ingredient: Ingredient;
  currentQty: number;
  currentUnitWeight: number | null;
  isExpanded: boolean;
  onQuantityChange: (value: string) => void;
  onResetQuantity: () => void;
  onUnitWeightChange: (value: string) => void;
  onResetUnitWeight: () => void;
  onToggleExpand: () => void;
}

const UNIT_WEIGHT_UNITS: string[] = [Unit.PIECE, Unit.PORTION, Unit.TRANCHE, Unit.FEUILLE, Unit.SACHET];

export const IngredientAdjustRow = ({
  ingredient: ing,
  currentQty,
  currentUnitWeight,
  isExpanded,
  onQuantityChange,
  onResetQuantity,
  onUnitWeightChange,
  onResetUnitWeight,
  onToggleExpand,
}: IngredientAdjustRowProps) => {
  const hasData = !!(ing.foodId || ing.baseId);
  const isBase = !!ing.baseId;
  const originalQty = ing.quantity ?? 0;
  const isQtyModified = hasData && currentQty !== originalQty;
  const unitLabel = ing.unit || null;

  const showUnitWeight = !!(ing.foodId && UNIT_WEIGHT_UNITS.includes(ing.unit));
  const originalUnitWeight = ing.foodId ? (typedFoodDb[ing.foodId]?.unitWeight ?? null) : null;
  const isUnitWeightModified = showUnitWeight && originalUnitWeight !== currentUnitWeight;

  const baseRecipe = isBase && ing.baseId ? typedRecipesDb[ing.baseId] : null;
  const baseScaleFactor = baseRecipe ? currentQty / Math.max(baseRecipe.defaultPortions, 1) : 0;

  return (
    <div>
      <div className={`flex items-start gap-2 py-2.5 ${!hasData ? 'opacity-40' : ''}`}>
        {isBase ? (
          <button
            onClick={onToggleExpand}
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
                onClick={onResetQuantity}
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
              onChange={(e) => onQuantityChange(e.target.value)}
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
                  onClick={onResetUnitWeight}
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
                onChange={(e) => onUnitWeightChange(e.target.value)}
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
};
