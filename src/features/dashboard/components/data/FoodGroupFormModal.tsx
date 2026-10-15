import { useState } from "react";
import { FoodGroup } from "../../../../core/domain/foodGroup";
import { FoodGroupInput } from "../../../../core/domain/catalogueInput";
import { Food } from "../../../../core/domain/ingredient";
import {
  buildFoodGroupRecap,
  foodGroupFormToBody,
  suggestFoodGroupId,
  validateFoodGroupName,
  validateNewFoodGroupId,
} from "../../../../core/logic/dashboard/foodGroupFormLogic";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FormModalShell } from "../common/FormModalShell";
import { FormField } from "../common/FormField";
import { FORM_INPUT_CLASS as INPUT_CLASS } from "../../../../shared/components/ui/formStyles";

export interface FoodGroupFormModalProps {
  group: FoodGroup | null;
  groups: FoodGroup[];
  members: Food[];
  onClose: () => void;
  onSubmit: (body: FoodGroupInput) => Promise<boolean>;
}

export const FoodGroupFormModal = ({ group, groups, members, onClose, onSubmit }: FoodGroupFormModalProps) => {
  const isCreate = group === null;
  const [name, setName] = useState(group?.name ?? "");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const effectiveId = isCreate ? (idTouched ? id : suggestFoodGroupId(name)) : group.id;
  const idError = isCreate && idTouched ? validateNewFoodGroupId(effectiveId, groups) : null;

  const review = () => {
    const found = validateFoodGroupName(name);
    if (isCreate) {
      const idError = validateNewFoodGroupId(effectiveId, groups);
      if (idError) found.unshift(idError);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    if (!isCreate && buildFoodGroupRecap(group, effectiveId, name).length === 0) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }
    setErrors([]);
    setConfirming(true);
  };

  const confirmed = async () => {
    const ok = await onSubmit(foodGroupFormToBody(effectiveId, name));
    if (ok) onClose();
    return ok;
  };

  return (
    <FormModalShell
      title={isCreate ? "Nouvelle famille" : "Modifier la famille"}
      subtitle={isCreate ? undefined : group.id}
      errors={errors}
      onClose={onClose}
      onContinue={review}
      confirmation={confirming && (
        <ConfirmActionModal
          title={isCreate ? "Confirmer l'ajout de la famille" : "Confirmer la modification"}
          intro={isCreate ? undefined : "Modifications à appliquer :"}
          recap={buildFoodGroupRecap(group, effectiveId, name)}
          confirmLabel={isCreate ? "Ajouter" : "Enregistrer"}
          onConfirm={confirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    >
      <FormField label="Nom">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fromages" className={INPUT_CLASS} />
      </FormField>

      {isCreate && (
        <FormField label="Identifiant" error={idError} hint="Ne pourra plus être modifié.">
          <input
            value={effectiveId}
            onChange={(e) => {
              setIdTouched(true);
              setId(e.target.value);
            }}
            placeholder="fromages"
            className={`${INPUT_CLASS} font-mono ${idError ? "border-red-400" : ""}`}
          />
        </FormField>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">Aliments de la famille · {members.length}</span>
        <p className="text-sm text-slate-700">
          {members.length > 0 ? members.map((food) => food.name).join(", ") : "Aucun aliment pour le moment."}
        </p>
        <span className="text-[11px] text-slate-400">
          Pour ajouter ou retirer un aliment, modifiez-le dans « Aliments » (champ « Famille »).
        </span>
      </div>
    </FormModalShell>
  );
};
