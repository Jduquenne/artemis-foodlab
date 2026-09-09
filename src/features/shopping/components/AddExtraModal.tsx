import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { Food, IngredientCategory, Unit } from "../../../core/domain/types";
import { typedFoodDb } from "../../../core/typed-db/typedFoodDb";
import { getIngredientCategoryFromSlug, getIngredientCategoryId } from "../../../core/typed-db/ingredientCategoryMap";
import { getCodeById, getIdByCode } from "../../../core/typed-db/recipeIdMap";
import { searchFoods } from "../../../core/logic/recipeBuilder/recipeBuilderLogic";
import { ApiShoppingExtra } from "../../../core/logic/shopping/shoppingApiMapper";
import { ExtraInput } from "../../../core/services/shoppingPeriodService";

export interface AddExtraModalProps {
  extra: ApiShoppingExtra | null;
  plannedRecipes: { code: string; name: string }[];
  onClose: () => void;
  onSubmit: (body: ExtraInput) => Promise<boolean>;
}

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const foodList = () => Object.values(typedFoodDb);

export const AddExtraModal = ({ extra, plannedRecipes, onClose, onSubmit }: AddExtraModalProps) => {
  const isEdit = extra !== null;
  const [name, setName] = useState(extra?.name ?? "");
  const [quantity, setQuantity] = useState(extra?.quantity != null ? String(extra.quantity) : "");
  const [unit, setUnit] = useState<string>(extra?.unit ?? "");
  const [category, setCategory] = useState<IngredientCategory | "">(
    extra?.categoryId ? getIngredientCategoryFromSlug(extra.categoryId) ?? "" : "",
  );
  const [foodId, setFoodId] = useState<string | null>(extra?.foodId ?? null);
  const [recipeCode, setRecipeCode] = useState<string>(
    extra?.recipeId ? getCodeById(extra.recipeId) ?? "" : "",
  );
  const [foodQuery, setFoodQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const suggestions = useMemo(
    () => (foodQuery.trim().length >= 2 ? searchFoods(foodQuery.trim(), foodList()) : []),
    [foodQuery],
  );

  const pickFood = (food: Food) => {
    setFoodId(food.id);
    setName(food.name);
    if (food.unit) setUnit(food.unit);
    setCategory(food.category);
    setFoodQuery("");
  };

  const clearFood = () => setFoodId(null);

  const submit = async () => {
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    const qty = quantity.trim() ? Number(quantity) : null;
    if (qty !== null && (!Number.isFinite(qty) || qty <= 0)) {
      setError("La quantité doit être un nombre supérieur à 0.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const body: ExtraInput = {
      name: name.trim(),
      quantity: qty,
      unit: unit.trim() || null,
      categoryId: category ? getIngredientCategoryId(category) ?? null : null,
      foodId,
      recipeId: recipeCode ? getIdByCode(recipeCode) ?? null : null,
    };
    const ok = await onSubmit(body);
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-slate-900">{isEdit ? "Modifier l'article" : "Ajouter un article"}</h2>
          <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {!isEdit && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Depuis le catalogue (optionnel)</span>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={foodQuery}
                  onChange={(e) => setFoodQuery(e.target.value)}
                  placeholder="Rechercher un aliment"
                  className={`${INPUT_CLASS} w-full pl-8`}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white dark:bg-slate-100 shadow-lg overflow-hidden">
                    {suggestions.map((food) => (
                      <li key={food.id}>
                        <button
                          type="button"
                          onClick={() => pickFood(food)}
                          className="w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-200"
                        >
                          {food.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Nom</span>
            <div className="flex items-center gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className={`${INPUT_CLASS} flex-1`} />
              {foodId && (
                <button
                  type="button"
                  onClick={clearFood}
                  className="shrink-0 text-xs font-bold text-slate-400 hover:text-orange-500"
                >
                  détacher
                </button>
              )}
            </div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Quantité</span>
              <input
                inputMode="decimal"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Unité</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className={INPUT_CLASS}>
                {Object.values(Unit).map((u) => (
                  <option key={u} value={u}>{u === "" ? "—" : u}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Rayon</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IngredientCategory | "")}
              className={INPUT_CLASS}
            >
              <option value="">— Autre —</option>
              {Object.values(IngredientCategory).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {plannedRecipes.length > 0 && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Lié à une recette (optionnel)</span>
              <select
                value={recipeCode}
                onChange={(e) => setRecipeCode(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">— Aucune —</option>
                {plannedRecipes.map((r) => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
            </label>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="p-5 pt-0 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {submitting ? "Enregistrement…" : isEdit ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
};
