import { Trash2 } from "lucide-react";
import { PREPARATION_OPTIONS } from "../../../../core/domain/preparationOptions";
import { Unit, IngredientCategory, SELECTABLE_UNITS } from "../../../../core/domain/ingredient";
import { IngredientFoodSearch } from "./IngredientFoodSearch";
import { BaseRecipeSearch } from "./BaseRecipeSearch";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { applyFoodPick } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { IngredientTypeToggle } from "./IngredientTypeToggle";

export interface IngredientBuilderRowProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  onRemove: () => void;
}

export const IngredientBuilderRow = ({ ingredient, onChange, onRemove }: IngredientBuilderRowProps) => {
  const update = (patch: Partial<DraftIngredient>) => onChange({ ...ingredient, ...patch });

  const isBase = ingredient.ingredientType === "base";

  return (
    <div className="flex items-center gap-2 py-1.5 w-full">
      <IngredientTypeToggle ingredient={ingredient} onChange={onChange} />

      {isBase ? (
        <>
          <BaseRecipeSearch
            value={ingredient.name}
            onChange={(name, baseId) => update({ name, baseId })}
          />
          <DecimalInput
            value={ingredient.quantity}
            onValueChange={(quantity) => update({ quantity })}
            placeholder="Portions"
            className="w-20 px-2 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-center"
          />
          <span className="text-xs text-slate-400 shrink-0">portion</span>
        </>
      ) : (
        <>
          <IngredientFoodSearch
            value={ingredient.name}
            linked={!!ingredient.foodId}
            onChange={(name, foodId, category, unit) => onChange(applyFoodPick(ingredient, name, foodId, category, unit))}
          />
          <DecimalInput
            value={ingredient.quantity}
            onValueChange={(quantity) => update({ quantity })}
            placeholder="Qté"
            className="w-14 px-2 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-center"
          />
          <select
            value={ingredient.unit ?? Unit.NONE}
            onChange={e => update({ unit: e.target.value as Unit })}
            className="w-20 px-1 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          >
            <option value={Unit.NONE}>—</option>
            {SELECTABLE_UNITS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={ingredient.preparation ?? ""}
            onChange={e => update({ preparation: e.target.value })}
            className="w-32 px-1 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          >
            <option value="">—</option>
            {PREPARATION_OPTIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={ingredient.category ?? IngredientCategory.UNKNOWN}
            onChange={e => update({ category: e.target.value as IngredientCategory })}
            className="w-28 px-1 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          >
            {Object.values(IngredientCategory).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};
