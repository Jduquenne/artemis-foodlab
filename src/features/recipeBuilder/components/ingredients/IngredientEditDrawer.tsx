import { useState } from "react";
import { X } from "lucide-react";
import { PREPARATION_OPTIONS } from "../../../../core/domain/preparationOptions";
import { Unit, IngredientCategory, SELECTABLE_UNITS } from "../../../../core/domain/ingredient";
import { IngredientFoodSearch } from "./IngredientFoodSearch";
import { BaseRecipeSearch } from "./BaseRecipeSearch";
import { DraftIngredient } from "../../../../core/domain/recipeBuilderTypes";
import { applyFoodPick } from "../../../../core/logic/recipeBuilder/recipeBuilderMapper";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { IngredientTypeToggle } from "./IngredientTypeToggle";

export interface IngredientEditDrawerProps {
  ingredient: DraftIngredient;
  onChange: (updated: DraftIngredient) => void;
  onClose: () => void;
}

const FIELD_CLASS =
  "w-full px-3 py-2.5 bg-white dark:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const LABEL_CLASS = "block text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1";

export const IngredientEditDrawer = ({ ingredient, onChange, onClose }: IngredientEditDrawerProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const update = (patch: Partial<DraftIngredient>) => onChange({ ...ingredient, ...patch });

  const close = () => {
    setIsExiting(true);
    setTimeout(onClose, 280);
  };

  const isBase = ingredient.ingredientType === "base";
  const canClose = isBase ? !!ingredient.baseId || !ingredient.name.trim() : !!ingredient.foodId || !ingredient.name.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:hidden">
      <div className={`w-full bg-white dark:bg-slate-100 rounded-t-2xl shadow-2xl flex flex-col max-h-[85dvh] ${isExiting ? "modal-exit" : "modal-enter"}`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <p className="text-sm font-black text-slate-800 truncate max-w-[75%]">
            {ingredient.name || <span className="text-slate-400 font-normal italic">Nouvel ingrédient</span>}
          </p>
          <button
            type="button"
            onClick={close}
            disabled={!canClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div>
            <label className={LABEL_CLASS}>Type</label>
            <IngredientTypeToggle ingredient={ingredient} onChange={onChange} wide />
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
                linked={!!ingredient.foodId}
                onChange={(name, foodId, category, unit) => onChange(applyFoodPick(ingredient, name, foodId, category, unit))}
              />
            )}
            {!isBase && ingredient.name.trim().length > 0 && !ingredient.foodId && (
              <p className="text-xs text-orange-500 mt-1">Sélectionne un aliment dans la liste pour le lier à la base</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>{isBase ? "Portions" : "Quantité"}</label>
            <DecimalInput
              value={ingredient.quantity}
              onValueChange={(quantity) => update({ quantity })}
              placeholder={isBase ? "Nombre de portions…" : "Quantité…"}
              className={FIELD_CLASS}
            />
          </div>

          {!isBase && (
            <>
              <div>
                <label className={LABEL_CLASS}>Unité</label>
                <select
                  value={ingredient.unit ?? Unit.NONE}
                  onChange={e => update({ unit: e.target.value as Unit })}
                  className={FIELD_CLASS}
                >
                  <option value={Unit.NONE}>—</option>
                  {SELECTABLE_UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Préparation</label>
                <select
                  value={ingredient.preparation ?? ""}
                  onChange={e => update({ preparation: e.target.value })}
                  className={FIELD_CLASS}
                >
                  <option value="">—</option>
                  {PREPARATION_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_CLASS}>Catégorie</label>
                <select
                  value={ingredient.category ?? IngredientCategory.UNKNOWN}
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
            disabled={!canClose}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black rounded-xl transition-colors"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
