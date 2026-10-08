import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CreateUserInput } from "../../../../core/domain/user";
import {
  EMPTY_USER_FORM,
  UserFormDraft,
  buildUserCreateRecap,
  generatePassword,
  userFormToInput,
  validateUserForm,
} from "../../../../core/logic/dashboard/userFormLogic";
import { RoleToggle } from "./RoleToggle";
import { ConfirmActionModal } from "../../../../shared/components/ui/ConfirmActionModal";
import { FormModalShell } from "../common/FormModalShell";
import { FormField } from "../common/FormField";
import { FORM_INPUT_CLASS as INPUT_CLASS } from "../../../../shared/components/ui/formStyles";

export interface UserFormModalProps {
  onClose: () => void;
  onSubmit: (input: CreateUserInput) => Promise<boolean>;
}

export const UserFormModal = ({ onClose, onSubmit }: UserFormModalProps) => {
  const [draft, setDraft] = useState<UserFormDraft>(EMPTY_USER_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);

  const patch = (update: Partial<UserFormDraft>) => setDraft((prev) => ({ ...prev, ...update }));

  const review = () => {
    const found = validateUserForm(draft);
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);
    setConfirming(true);
  };

  const confirmed = async () => {
    const ok = await onSubmit(userFormToInput(draft));
    if (ok) onClose();
    return ok;
  };

  return (
    <FormModalShell
      title="Nouveau compte"
      errors={errors}
      onClose={onClose}
      onContinue={review}
      confirmation={confirming && (
        <ConfirmActionModal
          title="Confirmer la création du compte"
          intro="Un nouveau compte va être créé avec ces informations :"
          recap={buildUserCreateRecap(draft)}
          consequence={
            draft.role === "admin"
              ? "Ce compte aura les droits administrateur : accès au dashboard, modification du catalogue et gestion des autres comptes."
              : undefined
          }
          confirmLabel="Créer le compte"
          onConfirm={confirmed}
          onCancel={() => setConfirming(false)}
        />
      )}
    >
      <FormField label="Adresse e-mail">
        <input
          type="email"
          autoComplete="off"
          value={draft.email}
          onChange={(e) => patch({ email: e.target.value })}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Nom affiché (optionnel)">
        <input
          autoComplete="off"
          value={draft.displayName}
          onChange={(e) => patch({ displayName: e.target.value })}
          className={INPUT_CLASS}
        />
      </FormField>

      <FormField label="Mot de passe (au moins 12 caractères)" hint="À communiquer à la personne pour sa première connexion.">
        <div className="flex gap-2">
          <input
            type="text"
            autoComplete="off"
            value={draft.password}
            onChange={(e) => patch({ password: e.target.value })}
            className={`${INPUT_CLASS} flex-1 min-w-0 font-mono`}
          />
          <button
            type="button"
            onClick={() => patch({ password: generatePassword() })}
            className="shrink-0 flex items-center gap-1.5 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-colors"
          >
            <RefreshCw size={13} />
            Générer
          </button>
        </div>
      </FormField>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold text-slate-500">Rôle</span>
        <RoleToggle value={draft.role} onChange={(role) => patch({ role })} />
      </div>
    </FormModalShell>
  );
};
