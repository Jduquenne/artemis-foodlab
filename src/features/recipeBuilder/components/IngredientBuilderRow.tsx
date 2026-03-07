import { Trash2 } from "lucide-react";
import { Unit, IngredientCategory } from "../../../core/domain/types";
import { IngredientFoodSearch } from "./IngredientFoodSearch";
import { BaseRecipeSearch } from "./BaseRecipeSearch";
import { DraftIngredient } from "../types";

interface IngredientBuilderRowProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  onRemove: () => void;
}

const UNITS = Object.values(Unit).filter(u => u !== Unit.NONE);

export const IngredientBuilderRow = ({ ingredient, onChange, onRemove }: IngredientBuilderRowProps) => {
  const update = (patch: Partial<DraftIngredient>) => onChange({ ...ingredient, ...patch });

  const switchType = (type: "food" | "base") => {
    onChange({
      ...ingredient,
      ingredientType: type,
      name: "",
      foodId: undefined,
      baseId: undefined,
      quantity: null,
      unit: type === "base" ? Unit.PORTION : Unit.NONE,
      preparation: "",
      category: type === "base" ? IngredientCategory.RECIPE : IngredientCategory.FRUIT_VEGETABLE,
    });
  };

  const isBase = ingredient.ingredientType === "base";

  return (
    <div className="flex items-center gap-2 py-1.5">
      <div className="flex rounded-xl overflow-hidden border border-slate-200 shrink-0">
        <button
          type="button"
          onClick={() => switchType("food")}
          className={`px-2 py-1.5 text-xs font-bold transition-colors ${
            !isBase
              ? "bg-orange-500 text-white"
              : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
          }`}
        >
          Aliment
        </button>
        <button
          type="button"
          onClick={() => switchType("base")}
          className={`px-2 py-1.5 text-xs font-bold transition-colors border-l border-slate-200 ${
            isBase
              ? "bg-orange-500 text-white"
              : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
          }`}
        >
          Base
        </button>
      </div>

      {isBase ? (
        <>
          <BaseRecipeSearch
            value={ingredient.name}
            onChange={(name, baseId) => update({ name, baseId })}
          />
          <input
            type="number"
            min={0}
            step="any"
            value={ingredient.quantity ?? ""}
            onChange={e => update({ quantity: e.target.value === "" ? null : Number(e.target.value) })}
            placeholder="Portions"
            className="w-20 px-2 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-center"
          />
          <span className="text-xs text-slate-400 shrink-0">portion</span>
        </>
      ) : (
        <>
          <IngredientFoodSearch
            value={ingredient.name}
            onChange={(name, foodId, category, unit) =>
              update({ name, foodId, category: category ?? ingredient.category, unit: (unit as Unit) ?? ingredient.unit })
            }
          />
          <input
            type="number"
            min={0}
            step="any"
            value={ingredient.quantity ?? ""}
            onChange={e => update({ quantity: e.target.value === "" ? null : Number(e.target.value) })}
            placeholder="Qté"
            className="w-14 px-2 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-center"
          />
          <select
            value={ingredient.unit}
            onChange={e => update({ unit: e.target.value as Unit })}
            className="w-20 px-1 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          >
            <option value={Unit.NONE}>—</option>
            {UNITS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input
            type="text"
            value={ingredient.preparation}
            onChange={e => update({ preparation: e.target.value })}
            placeholder="Préparation…"
            className="flex-1 min-w-0 px-2 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          />
          <select
            value={ingredient.category}
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
