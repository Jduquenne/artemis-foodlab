import { useState } from "react";
import { Plus } from "lucide-react";
import { COOKING_METHOD_LABELS, CookingMethod, FoodCooking, FoodCookingInput } from "../../../../core/domain/cooking";
import { Food } from "../../../../core/domain/ingredient";
import {
  CookingDraft,
  availableCookingMethods,
  buildCookingRecap,
  cookingToDraft,
  emptyCookingDraft,
  sortCookingDrafts,
  validateCookingDrafts,
} from "../../../../core/logic/cooking/cookingFormLogic";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FormModalShell } from "../../../../shared/components/ui/form/FormModalShell";
import { useFoodCookingStore } from "../../../../shared/store/useFoodCookingStore";
import { withPending } from "../../../../shared/utils/withPending";
import { CookingDraftCard } from "./CookingDraftCard";

export interface FoodCookingModalProps {
  food: Food;
  cookings: FoodCooking[];
  onClose: () => void;
}

export const FoodCookingModal = ({ food, cookings, onClose }: FoodCookingModalProps) => {
  const saveFoodCookings = useFoodCookingStore((s) => s.saveFoodCookings);
  const [drafts, setDrafts] = useState<CookingDraft[]>(() => sortCookingDrafts(cookings.map(cookingToDraft)));
  const [errors, setErrors] = useState<string[]>([]);
  const [invalidMethod, setInvalidMethod] = useState<CookingMethod | null>(null);
  const [pendingInputs, setPendingInputs] = useState<FoodCookingInput[] | null>(null);

  const patchDraft = (method: CookingMethod, patch: Partial<CookingDraft>) =>
    setDrafts((current) => current.map((draft) => (draft.method === method ? { ...draft, ...patch } : draft)));
  const addMethod = (method: CookingMethod) => setDrafts((current) => sortCookingDrafts([...current, emptyCookingDraft(method)]));
  const removeMethod = (method: CookingMethod) => setDrafts((current) => current.filter((draft) => draft.method !== method));

  const review = () => {
    const result = validateCookingDrafts(drafts);
    if ("error" in result) {
      setErrors([result.error]);
      setInvalidMethod(result.method ?? null);
      return;
    }
    setInvalidMethod(null);
    if (buildCookingRecap(cookings, result.inputs).length === 0) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }
    setErrors([]);
    setPendingInputs(result.inputs);
  };

  const confirmed = async () => {
    if (!pendingInputs) return false;
    const ok = (await withPending(`food-cookings:${food.id}`, () => saveFoodCookings(food.id, pendingInputs).then(() => true))
      .catch(() => false)) ?? false;
    if (ok) onClose();
    return ok;
  };

  const available = availableCookingMethods(drafts);

  return (
    <FormModalShell
      title="Cuisson"
      subtitle={food.name}
      errors={errors}
      onClose={onClose}
      onContinue={review}
      confirmation={pendingInputs && (
        <ConfirmActionModal
          title="Confirmer les fiches de cuisson"
          intro={`${food.name} · modifications à appliquer :`}
          recap={buildCookingRecap(cookings, pendingInputs)}
          consequence={pendingInputs.length === 0 ? "Toutes les fiches de cuisson de cet aliment seront supprimées." : undefined}
          confirmLabel="Enregistrer"
          danger={pendingInputs.length === 0}
          onConfirm={confirmed}
          onCancel={() => setPendingInputs(null)}
        />
      )}
    >
      {drafts.length === 0 && (
        <p className="text-sm text-slate-500">Aucune fiche de cuisson. Ajoutez un mode ci-dessous.</p>
      )}

      {drafts.map((draft) => (
        <CookingDraftCard
          key={draft.method}
          draft={draft}
          invalid={invalidMethod === draft.method}
          onChange={(patch) => patchDraft(draft.method, patch)}
          onRemove={() => removeMethod(draft.method)}
        />
      ))}

      {available.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500">Ajouter un mode</span>
          <div className="flex flex-wrap gap-2">
            {available.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => addMethod(method)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                <Plus size={13} />
                {COOKING_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>
      )}
    </FormModalShell>
  );
};
