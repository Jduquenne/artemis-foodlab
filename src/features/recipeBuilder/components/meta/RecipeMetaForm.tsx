import { MealType, RecipeKind } from "../../../../core/domain/types";
import { CATEGORIES } from "../../../../core/domain/categories";
import { RecipeBuilderState } from "../../../../core/domain/recipeBuilderTypes";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import {
  CATEGORY_PREFIX,
  MEAL_TYPE_LABELS,
  RECIPE_KIND_LABELS,
  buildRecipeDbId,
  buildRecipeId,
  suggestNextRecipeNumber,
} from "../../../../core/logic/recipeBuilder/recipeBuilderLogic";

export interface RecipeMetaFormProps {
  state: RecipeBuilderState;
  onChange: (patch: Partial<RecipeBuilderState>) => void;
}

const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1";
const inputClass =
  "w-full px-3 py-2 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const chipClass = (active: boolean) =>
  `flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
    active
      ? "bg-orange-500 text-white border-orange-500"
      : "bg-white dark:bg-slate-100 text-slate-500 border-slate-200 hover:border-orange-300"
  }`;

export const RecipeMetaForm = ({ state, onChange }: RecipeMetaFormProps) => {
  const prefix = CATEGORY_PREFIX[state.categoryId] ?? state.categoryId.toUpperCase();
  const computedId = buildRecipeId(state.categoryId, state.recipeNumber);
  const isBase = state.kind === RecipeKind.BASE;
  const isExisting = Boolean(typedRecipesDb[buildRecipeDbId(state.categoryId, state.recipeNumber)]?.apiId);

  const changeCategory = (categoryId: string) => {
    onChange({
      categoryId,
      recipeNumber: isExisting ? state.recipeNumber : suggestNextRecipeNumber(categoryId),
    });
  };

  const toggleMealType = (type: MealType) => {
    const next = state.mealTypes.includes(type)
      ? state.mealTypes.filter((t) => t !== type)
      : [...state.mealTypes, type];
    onChange({ mealTypes: next });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className={labelClass}>Nom</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Nom de la recette…"
            className={inputClass}
          />
        </div>
        <div className="w-16 shrink-0">
          <label className={labelClass}>Portions</label>
          <input
            type="number"
            min={1}
            value={state.defaultPortions}
            onChange={(e) => onChange({ defaultPortions: Math.max(1, Number(e.target.value)) })}
            className={`${inputClass} text-center px-1`}
          />
        </div>
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          <label className={labelClass}>Catégorie</label>
          <select value={state.categoryId} onChange={(e) => changeCategory(e.target.value)} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="shrink-0">
          <label className={labelClass}>N°</label>
          <div className="flex items-center gap-1.5 px-2 border border-slate-200 rounded-xl bg-white dark:bg-slate-100 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400">
            <span className="text-xs font-mono font-bold text-slate-400">{prefix}_</span>
            <input
              type="number"
              min={1}
              value={state.recipeNumber}
              onChange={(e) => onChange({ recipeNumber: e.target.value })}
              placeholder="16"
              className="w-12 py-2 bg-transparent text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-none text-center"
            />
          </div>
        </div>
      </div>
      {state.recipeNumber && (
        <div className="flex items-center gap-2 -mt-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">ID</span>
          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-mono font-bold rounded-lg">
            {computedId}
          </span>
          {isExisting && <span className="text-[10px] text-slate-400">recette existante</span>}
        </div>
      )}

      <div>
        <label className={labelClass}>Type</label>
        <div className="flex gap-1.5">
          {Object.values(RecipeKind).map((k) => (
            <button key={k} type="button" onClick={() => onChange({ kind: k })} className={chipClass(state.kind === k)}>
              {RECIPE_KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Options</label>
        <div className="flex gap-1.5">
          {!isBase && (
            <button
              type="button"
              onClick={() => onChange({ isDessert: !state.isDessert })}
              className={chipClass(state.isDessert)}
            >
              Dessert
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange({ batchCooking: !state.batchCooking })}
            className={chipClass(state.batchCooking)}
          >
            Batch
          </button>
          <button
            type="button"
            onClick={() => onChange({ fromBook: !state.fromBook })}
            className={chipClass(state.fromBook)}
          >
            Livre
          </button>
        </div>
      </div>

      {!isBase && (
        <div>
          <label className={labelClass}>Types de repas</label>
          <div className="flex gap-1.5">
            {Object.values(MealType).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleMealType(type)}
                className={chipClass(state.mealTypes.includes(type))}
              >
                {MEAL_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.fromBook && (
        <div>
          <label className={labelClass}>Page du livre</label>
          <input
            type="number"
            min={1}
            value={state.bookPage ?? ""}
            onChange={(e) =>
              onChange({ bookPage: e.target.value === "" ? null : Math.max(1, Number(e.target.value)) })
            }
            placeholder="ex. 42"
            className={inputClass}
          />
        </div>
      )}

      {!state.fromBook && (
        <div>
          <label className={labelClass}>Instructions</label>
          <textarea
            value={(state.instructions ?? []).join("\n")}
            onChange={(e) => onChange({ instructions: e.target.value === "" ? [] : e.target.value.split("\n") })}
            placeholder={"Étape 1\nÉtape 2\n..."}
            rows={4}
            className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
          />
        </div>
      )}
    </div>
  );
};
