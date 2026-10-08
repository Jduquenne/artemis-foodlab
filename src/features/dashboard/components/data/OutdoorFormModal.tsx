import { useMemo, useState } from "react";
import { OutdoorEntry } from "../../../../core/domain/recipe";
import { useCategoriesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { OutdoorActivityInput } from "../../../../core/domain/catalogueInput";
import {
  OutdoorFormDraft,
  buildOutdoorRecap,
  emptyOutdoorDraft,
  outdoorFormToBody,
  outdoorToDraft,
  suggestOutdoorCode,
  validateNewOutdoorCode,
  validateOutdoorForm,
} from "../../../../core/logic/dashboard/outdoorFormLogic";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FormModalShell } from "../common/FormModalShell";
import { FormField } from "../common/FormField";
import { FORM_INPUT_CLASS as INPUT_CLASS } from "../common/formStyles";

export interface OutdoorFormModalProps {
  activity: OutdoorEntry | null;
  activities: OutdoorEntry[];
  onClose: () => void;
  onSubmit: (body: OutdoorActivityInput) => Promise<boolean>;
}

export const OutdoorFormModal = ({ activity, activities, onClose, onSubmit }: OutdoorFormModalProps) => {
  const isCreate = activity === null;
  const categories = useCategoriesSnapshot();
  const [draft, setDraft] = useState<OutdoorFormDraft>(() =>
    activity ? outdoorToDraft(activity) : emptyOutdoorDraft(),
  );
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const suggestedCode = useMemo(
    () => (isCreate ? suggestOutdoorCode(activities) : ""),
    [isCreate, activities],
  );
  const effectiveCode = isCreate ? (codeTouched ? code : suggestedCode) : activity.code;
  const codeError = isCreate && codeTouched ? validateNewOutdoorCode(effectiveCode, activities) : null;

  const patch = (update: Partial<OutdoorFormDraft>) => setDraft((prev) => ({ ...prev, ...update }));

  const review = () => {
    const found = validateOutdoorForm(draft, categories);
    if (isCreate) {
      const codeError = validateNewOutdoorCode(effectiveCode, activities);
      if (codeError) found.unshift(codeError);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    if (!isCreate && buildOutdoorRecap(activity, effectiveCode, draft, categories).length === 0) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }
    setErrors([]);
    setConfirming(true);
  };

  const confirmed = async () => {
    const ok = await onSubmit(outdoorFormToBody(effectiveCode, draft));
    if (ok) onClose();
    return ok;
  };

  return (
    <FormModalShell
      title={isCreate ? "Nouvelle activité" : "Modifier l'activité"}
      subtitle={isCreate ? undefined : activity.code}
      errors={errors}
      onClose={onClose}
      onContinue={review}
      confirmation={confirming && (
        <ConfirmActionModal
          title={isCreate ? "Confirmer l'ajout de l'activité" : "Confirmer la modification"}
          intro={isCreate ? undefined : "Modifications à appliquer :"}
          recap={buildOutdoorRecap(activity, effectiveCode, draft, categories)}
          confirmLabel={isCreate ? "Ajouter" : "Enregistrer"}
          onConfirm={confirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    >
      {isCreate && (
        <FormField label="Identifiant" error={codeError}>
          <input
            value={effectiveCode}
            onChange={(e) => {
              setCodeTouched(true);
              setCode(e.target.value);
            }}
            placeholder="od-001"
            className={`${INPUT_CLASS} font-mono ${codeError ? "border-red-400" : ""}`}
          />
        </FormField>
      )}

      <FormField label="Nom">
        <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} className={INPUT_CLASS} />
      </FormField>

      <FormField label="Catégorie">
        <select
          value={draft.categoryId}
          onChange={(e) => patch({ categoryId: e.target.value })}
          className={INPUT_CLASS}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </FormField>
    </FormModalShell>
  );
};
