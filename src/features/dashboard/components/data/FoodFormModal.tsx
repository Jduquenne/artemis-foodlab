import { useMemo, useState } from "react";
import { Food, IngredientCategory, Unit } from "../../../../core/domain/ingredient";
import { Macronutrients, NUTRIENT_DEFINITIONS } from "../../../../core/domain/nutrition";
import { FoodInput } from "../../../../core/domain/catalogueInput";
import {
  FoodFormDraft,
  buildFoodRecap,
  emptyFoodDraft,
  foodFormToBody,
  foodToDraft,
  parseEditableMacros,
  suggestFoodId,
  validateFoodForm,
  validateNewFoodId,
} from "../../../../core/logic/dashboard/foodFormLogic";
import { atwaterKcal } from "../../../../core/logic/nutrition/atwaterLogic";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FormModalShell } from "../common/FormModalShell";
import { FormField } from "../common/FormField";
import { FORM_INPUT_CLASS as INPUT_CLASS } from "../../../../shared/components/ui/formStyles";

export interface FoodFormModalProps {
  food: Food | null;
  foods: Food[];
  onClose: () => void;
  onSubmit: (body: FoodInput) => Promise<boolean>;
}


export const FoodFormModal = ({ food, foods, onClose, onSubmit }: FoodFormModalProps) => {
  const isCreate = food === null;
  const [draft, setDraft] = useState<FoodFormDraft>(() => (food ? foodToDraft(food) : emptyFoodDraft()));
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const suggestedId = useMemo(
    () => (isCreate ? suggestFoodId(draft.category, foods) : ""),
    [isCreate, draft.category, foods],
  );
  const effectiveId = isCreate ? (idTouched ? id : suggestedId) : food.id;
  const idError = isCreate && idTouched ? validateNewFoodId(effectiveId, foods) : null;

  const patch = (update: Partial<FoodFormDraft>) => setDraft((prev) => ({ ...prev, ...update }));
  const patchMacro = (key: keyof Macronutrients, value: string) =>
    setDraft((prev) => ({ ...prev, macros: { ...prev.macros, [key]: value } }));

  const computedKcal = useMemo(
    () =>
      atwaterKcal(parseEditableMacros(draft.macros)),
    [draft.macros],
  );

  const review = () => {
    const found = validateFoodForm(draft);
    if (isCreate) {
      const idError = validateNewFoodId(effectiveId, foods);
      if (idError) found.unshift(idError);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    if (!isCreate && buildFoodRecap(food, effectiveId, draft).length === 0) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }
    setErrors([]);
    setConfirming(true);
  };

  const confirmed = async () => {
    const ok = await onSubmit(foodFormToBody(effectiveId.trim(), draft));
    if (ok) onClose();
    return ok;
  };

  return (
    <FormModalShell
      title={isCreate ? "Nouvel aliment" : "Modifier l'aliment"}
      subtitle={isCreate ? undefined : food.id}
      errors={errors}
      onClose={onClose}
      onContinue={review}
      confirmation={confirming && (
        <ConfirmActionModal
          title={isCreate ? "Confirmer l'ajout de l'aliment" : "Confirmer la modification"}
          intro={isCreate ? undefined : "Modifications à appliquer :"}
          recap={buildFoodRecap(food, effectiveId, draft)}
          confirmLabel={isCreate ? "Ajouter" : "Enregistrer"}
          onConfirm={confirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    >
      {isCreate && (
        <FormField label="Identifiant" error={idError}>
          <input
            value={effectiveId}
            onChange={(e) => {
              setIdTouched(true);
              setId(e.target.value);
            }}
            placeholder="fv-014"
            className={`${INPUT_CLASS} font-mono ${idError ? "border-red-400" : ""}`}
          />
        </FormField>
      )}

      <FormField label="Nom">
        <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} className={INPUT_CLASS} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="Catégorie">
          <select
            value={draft.category}
            onChange={(e) => {
              patch({ category: e.target.value as IngredientCategory });
              setIdTouched(false);
            }}
            className={INPUT_CLASS}
          >
            {Object.values(IngredientCategory).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Unité">
          <select
            value={draft.unit}
            onChange={(e) => patch({ unit: e.target.value })}
            className={INPUT_CLASS}
          >
            {Object.values(Unit).map((unit) => (
              <option key={unit} value={unit}>{unit === "" ? "—" : unit}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Poids unitaire (g)">
          <input
            inputMode="decimal"
            value={draft.unitWeight}
            onChange={(e) => patch({ unitWeight: e.target.value })}
            className={INPUT_CLASS}
          />
        </FormField>

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
          {NUTRIENT_DEFINITIONS.map((field) => (
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
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 text-center">Kcal</span>
            <div className="rounded-lg border border-slate-200 bg-muted px-1 py-1.5 text-sm font-bold text-slate-500 text-center tabular-nums">
              {computedKcal}
            </div>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">
          Kcal calculées automatiquement (4·protéines + 9·lipides + 4·glucides + 2·fibres).
        </span>
      </div>
    </FormModalShell>
  );
};
