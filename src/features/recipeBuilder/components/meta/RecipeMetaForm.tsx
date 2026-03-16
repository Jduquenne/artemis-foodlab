import { RecipeKind } from "../../../../core/domain/types";
import { CATEGORIES } from "../../../../core/domain/categories";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { CATEGORY_PREFIX, buildRecipeId } from "../../../../core/utils/recipeBuilderUtils";

export interface RecipeMetaFormProps {
  state: RecipeBuilderState;
  onChange: (patch: Partial<RecipeBuilderState>) => void;
}

const KIND_LABELS: Record<RecipeKind, string> = {
  [RecipeKind.DISH]: "Plat",
  [RecipeKind.INGREDIENT]: "Ingrédient",
  [RecipeKind.BASE]: "Base",
};


export const RecipeMetaForm = ({ state, onChange }: RecipeMetaFormProps) => {

  const prefix = CATEGORY_PREFIX[state.categoryId] ?? state.categoryId.toUpperCase();
  const computedId = buildRecipeId(state.categoryId, state.recipeNumber);

  const labelClass = "block text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wide mb-1";
  const inputClass = "w-full px-3 py-1.5 sm:py-2.5 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4">
      <div>
        <label className={labelClass}>Nom</label>
        <input
          type="text"
          value={state.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Nom de la recette…"
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 min-w-0">
          <label className={labelClass}>Catégorie</label>
          <select
            value={state.categoryId}
            onChange={e => onChange({ categoryId: e.target.value })}
            className={inputClass}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="shrink-0">
          <label className={labelClass}>N°</label>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold text-slate-400">{prefix}_</span>
            <input
              type="number"
              min={1}
              value={state.recipeNumber}
              onChange={e => onChange({ recipeNumber: e.target.value })}
              placeholder="16"
              className="w-14 sm:w-16 px-2 py-1.5 sm:py-2.5 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 text-center"
            />
          </div>
        </div>
      </div>
      {state.recipeNumber && (
        <div className="flex items-center gap-2 -mt-1">
          <span className="text-xs text-slate-400">ID généré :</span>
          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-mono font-bold rounded-lg">
            {computedId}
          </span>
        </div>
      )}

      <div>
        <label className={labelClass}>Type</label>
        <div className="flex gap-2">
          {Object.values(RecipeKind).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => onChange({ kind: k })}
              className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-colors ${
                state.kind === k
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-300"
              }`}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className={labelClass}>Portions</label>
          <input
            type="number"
            min={1}
            value={state.defaultPortions}
            onChange={e => onChange({ defaultPortions: Math.max(1, Number(e.target.value)) })}
            className={`${inputClass} text-center text-xs sm:text-sm`}
          />
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <label className={labelClass}>Dessert</label>
          <button
            type="button"
            onClick={() => onChange({ isDessert: !state.isDessert })}
            className={`w-full py-1.5 sm:py-2.5 rounded-xl text-xs font-bold transition-colors ${
              state.isDessert
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-300"
            }`}
          >
            {state.isDessert ? "Activé" : "Désactivé"}
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <label className={labelClass}>Batch cooking</label>
          <button
            type="button"
            onClick={() => onChange({ batchCooking: !state.batchCooking })}
            className={`w-full py-1.5 sm:py-2.5 rounded-xl text-xs font-bold transition-colors ${
              state.batchCooking
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-300"
            }`}
          >
            {state.batchCooking ? "Activé" : "Désactivé"}
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Repas</label>
        <div className="flex gap-2">
          {(["meal", "side"] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ mealTypes: v })}
              className={`flex-1 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-colors ${
                state.mealTypes === v
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 dark:bg-slate-200 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-300"
              }`}
            >
              {v === "meal" ? "Repas" : "À côté"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
