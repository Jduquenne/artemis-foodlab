import { useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { CreateUserInput } from "../../../../core/services/usersService";
import { UserRole } from "../../../../core/services/authService";
import {
  EMPTY_USER_FORM,
  UserFormDraft,
  buildUserCreateRecap,
  generatePassword,
  userFormToInput,
  validateUserForm,
} from "../../../../core/logic/dashboard/userFormLogic";
import { RoleToggle } from "./RoleToggle";
import { ConfirmActionModal } from "../data/ConfirmActionModal";

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
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-slate-900">Nouveau compte</h2>
          <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Adresse e-mail</span>
            <input
              type="email"
              autoComplete="off"
              value={draft.email}
              onChange={(e) => patch({ email: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white dark:bg-slate-100 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Mot de passe (au moins 12 caractères)</span>
            <div className="flex gap-2">
              <input
                type="text"
                autoComplete="off"
                value={draft.password}
                onChange={(e) => patch({ password: e.target.value })}
                className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-100 px-3 py-2 text-sm font-mono text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => patch({ password: generatePassword() })}
                className="shrink-0 flex items-center gap-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-colors"
              >
                <RefreshCw size={13} />
                Générer
              </button>
            </div>
            <span className="text-[11px] text-slate-400">À communiquer à la personne pour sa première connexion.</span>
          </label>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-500">Rôle</span>
            <RoleToggle value={(draft.role || "guest") as UserRole} onChange={(role) => patch({ role })} />
          </div>

          {errors.length > 0 && (
            <ul className="flex flex-col gap-1">
              {errors.map((error) => (
                <li key={error} className="text-xs text-red-500">{error}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-2">
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
    </div>
  );
};
