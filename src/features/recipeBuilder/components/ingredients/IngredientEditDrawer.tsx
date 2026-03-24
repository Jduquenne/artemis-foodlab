import { useState } from "react";
import { X } from "lucide-react";
import { Unit, IngredientCategory, Preparation } from "../../../../core/domain/types";
import { IngredientFoodSearch } from "./IngredientFoodSearch";
import { BaseRecipeSearch } from "./BaseRecipeSearch";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";

export interface IngredientEditDrawerProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  onClose: () => void;
}

const UNITS = Object.values(Unit).filter(u => u !== Unit.NONE);

const FIELD_CLASS =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const LABEL_CLASS = "block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1";

export const IngredientEditDrawer = ({ ingredient, onChange, onClose }: IngredientEditDrawerProps) => {
  const [isExiting, setIsExiting] = useState(false);

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

  const close = () => {
    setIsExiting(true);
    setTimeout(onClose, 280);
  };

  const isBase = ingredient.ingredientType === "base";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:hidden"
      onClick={close}
    >
      <div
        className={`w-full bg-white dark:bg-slate-100 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] ${isExiting ? "modal-exit" : "modal-enter"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <p className="text-sm font-black text-slate-800 truncate max-w-[75%]">
            {ingredient.name || <span className="text-slate-400 font-normal italic">Nouvel ingrédient</span>}
          </p>
          <button
            type="button"
            onClick={close}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div>
            <label className={LABEL_CLASS}>Type</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              <button
                type="button"
                onClick={() => switchType("food")}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors ${
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
                className={`flex-1 py-2.5 text-xs font-bold transition-colors border-l border-slate-200 ${
                  isBase
                    ? "bg-orange-500 text-white"
                    : "bg-white dark:bg-slate-100 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200"
                }`}
              >
                Base
              </button>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>{isBase ? "Recette de base" : "Aliment"}</label>
            {isBase ? (
              <BaseRecipeSearch
                value={ingredient.name}
                onChange={(name, baseId) => update({ name, baseId })}
              />
            ) : (
              <IngredientFoodSearch
                value={ingredient.name}
                onChange={(name, foodId, category, unit) =>
                  update({ name, foodId, category: category ?? ingredient.category, unit: (unit as Unit) ?? ingredient.unit })
                }
              />
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>{isBase ? "Portions" : "Quantité"}</label>
            <input
              type="number"
              min={0}
              step="any"
              value={ingredient.quantity ?? ""}
              onChange={e => update({ quantity: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder={isBase ? "Nombre de portions…" : "Quantité…"}
              className={FIELD_CLASS}
            />
          </div>

          {!isBase && (
            <>
              <div>
                <label className={LABEL_CLASS}>Unité</label>
                <select
                  value={ingredient.unit}
                  onChange={e => update({ unit: e.target.value as Unit })}
                  className={FIELD_CLASS}
                >
                  <option value={Unit.NONE}>—</option>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Préparation</label>
                <select
                  value={ingredient.preparation}
                  onChange={e => update({ preparation: e.target.value as Preparation | "" })}
                  className={FIELD_CLASS}
                >
                  <option value="">—</option>
                  {Object.values(Preparation).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Catégorie</label>
                <select
                  value={ingredient.category}
                  onChange={e => update({ category: e.target.value as IngredientCategory })}
                  className={FIELD_CLASS}
                >
                  {Object.values(IngredientCategory).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 px-4 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={close}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl transition-colors"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
