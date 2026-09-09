import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Food, IngredientCategory, Macronutrients, Unit } from "../../../../core/domain/types";
import { FoodInput } from "../../../../core/services/catalogueWriteService";
import {
  FoodFormDraft,
  emptyFoodDraft,
  foodFormToBody,
  foodToDraft,
  suggestFoodId,
  validateFoodForm,
  validateNewFoodId,
} from "../../../../core/logic/dashboard/foodFormLogic";

export interface FoodFormModalProps {
  food: Food | null;
  foods: Food[];
  onClose: () => void;
  onSubmit: (body: FoodInput) => Promise<boolean>;
}

const MACRO_FIELDS: { key: keyof Macronutrients; label: string }[] = [
  { key: "kcal", label: "Kcal" },
  { key: "proteins", label: "Protéines" },
  { key: "lipids", label: "Lipides" },
  { key: "carbohydrates", label: "Glucides" },
  { key: "fibers", label: "Fibres" },
];

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

export const FoodFormModal = ({ food, foods, onClose, onSubmit }: FoodFormModalProps) => {
  const isCreate = food === null;
  const [draft, setDraft] = useState<FoodFormDraft>(() => (food ? foodToDraft(food) : emptyFoodDraft()));
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const suggestedId = useMemo(
    () => (isCreate ? suggestFoodId(draft.category, foods) : ""),
    [isCreate, draft.category, foods],
  );
  const effectiveId = isCreate ? (idTouched ? id : suggestedId) : food.id;

  const patch = (update: Partial<FoodFormDraft>) => setDraft((prev) => ({ ...prev, ...update }));
  const patchMacro = (key: keyof Macronutrients, value: string) =>
    setDraft((prev) => ({ ...prev, macros: { ...prev.macros, [key]: value } }));

  const submit = async () => {
    const found = validateFoodForm(draft);
    if (isCreate) {
      const idError = validateNewFoodId(effectiveId, foods);
      if (idError) found.unshift(idError);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    const ok = await onSubmit(foodFormToBody(effectiveId.trim(), draft));
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isCreate ? "Nouvel aliment" : "Modifier l'aliment"}
            </h2>
            {!isCreate && <p className="text-xs text-slate-400">{food.id}</p>}
          </div>
          <button aria-label="Fermer" onClick={onClose} disabled={submitting} className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-40">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {isCreate && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Identifiant</span>
              <input
                value={effectiveId}
                onChange={(e) => {
                  setIdTouched(true);
                  setId(e.target.value);
                }}
                placeholder="fv-014"
                className={`${INPUT_CLASS} font-mono`}
              />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Nom</span>
            <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} className={INPUT_CLASS} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Catégorie</span>
              <select
                value={draft.category}
                onChange={(e) => patch({ category: e.target.value as IngredientCategory })}
                className={INPUT_CLASS}
              >
                {Object.values(IngredientCategory).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Unité</span>
              <select
                value={draft.unit}
                onChange={(e) => patch({ unit: e.target.value })}
                className={INPUT_CLASS}
              >
                {Object.values(Unit).map((unit) => (
                  <option key={unit} value={unit}>{unit === "" ? "—" : unit}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Poids unitaire (g)</span>
              <input
                inputMode="decimal"
                value={draft.unitWeight}
                onChange={(e) => patch({ unitWeight: e.target.value })}
                className={INPUT_CLASS}
              />
            </label>

            <label className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                checked={draft.isFreezable}
                onChange={(e) => patch({ isFreezable: e.target.checked })}
                className="accent-orange-500"
              />
              <span className="text-sm text-slate-700">Congelable</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500">Valeurs pour 100 g / 100 ml</span>
            <div className="grid grid-cols-5 gap-2">
              {MACRO_FIELDS.map((field) => (
                <label key={field.key} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400 text-center">{field.label}</span>
                  <input
                    inputMode="decimal"
                    value={draft.macros[field.key]}
                    onChange={(e) => patchMacro(field.key, e.target.value)}
                    className={`${INPUT_CLASS} text-center px-1`}
                  />
                </label>
              ))}
            </div>
          </div>

          {errors.length > 0 && (
            <ul className="flex flex-col gap-1">
              {errors.map((error) => (
                <li key={error} className="text-xs text-red-500">{error}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
          >
            {submitting ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};
