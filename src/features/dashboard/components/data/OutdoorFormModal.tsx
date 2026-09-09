import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { OutdoorEntry } from "../../../../core/domain/types";
import { CATEGORIES } from "../../../../core/domain/categories";
import { OutdoorActivityInput } from "../../../../core/services/catalogueWriteService";
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
import { ConfirmActionModal } from "./ConfirmActionModal";

export interface OutdoorFormModalProps {
  activity: OutdoorEntry | null;
  activities: OutdoorEntry[];
  onClose: () => void;
  onSubmit: (body: OutdoorActivityInput) => Promise<boolean>;
}

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

export const OutdoorFormModal = ({ activity, activities, onClose, onSubmit }: OutdoorFormModalProps) => {
  const isCreate = activity === null;
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

  const patch = (update: Partial<OutdoorFormDraft>) => setDraft((prev) => ({ ...prev, ...update }));

  const review = () => {
    const found = validateOutdoorForm(draft);
    if (isCreate) {
      const codeError = validateNewOutdoorCode(effectiveCode, activities);
      if (codeError) found.unshift(codeError);
    }
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    if (!isCreate && buildOutdoorRecap(activity, effectiveCode, draft).length === 0) {
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
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {isCreate ? "Nouvelle activité" : "Modifier l'activité"}
            </h2>
            {!isCreate && <p className="text-xs text-slate-400">{activity.code}</p>}
          </div>
          <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          {isCreate && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Identifiant</span>
              <input
                value={effectiveCode}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCode(e.target.value);
                }}
                placeholder="od-001"
                className={`${INPUT_CLASS} font-mono`}
              />
            </label>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Nom</span>
            <input value={draft.name} onChange={(e) => patch({ name: e.target.value })} className={INPUT_CLASS} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Catégorie</span>
            <select
              value={draft.categoryId}
              onChange={(e) => patch({ categoryId: e.target.value })}
              className={INPUT_CLASS}
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>

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
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={review}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmActionModal
          title={isCreate ? "Confirmer l'ajout de l'activité" : "Confirmer la modification"}
          intro={isCreate ? undefined : "Modifications à appliquer :"}
          recap={buildOutdoorRecap(activity, effectiveCode, draft)}
          confirmLabel={isCreate ? "Ajouter" : "Enregistrer"}
          onConfirm={confirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};
