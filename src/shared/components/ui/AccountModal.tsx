import { useState } from "react";
import { X, LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword, logout, updateMe } from "../../../core/services/authService";
import { useAuthStore } from "../../store/useAuthStore";
import { PASSWORD_MIN_LENGTH } from "../../../core/services/usersService";

export interface AccountModalProps {
  onClose: () => void;
}

const INPUT_CLASS =
  "rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400";

const messageOf = (err: unknown): string =>
  err instanceof Error && err.message ? err.message : "Une erreur est survenue.";

export const AccountModal = ({ onClose }: AccountModalProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  const [email, setEmail] = useState(user?.email ?? "");
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);

  if (!user) return null;

  const profileDirty =
    email.trim() !== user.email || displayName.trim() !== (user.displayName ?? "");

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSaved(false);
    const body: { email?: string; displayName?: string | null } = {};
    if (email.trim() !== user.email) body.email = email.trim();
    if (displayName.trim() !== (user.displayName ?? "")) body.displayName = displayName.trim() || null;
    setProfileSaving(true);
    try {
      setUser(await updateMe(body, { suppressGlobalError: true }));
      setProfileSaved(true);
    } catch (err) {
      setProfileError(messageOf(err));
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async () => {
    setPasswordError(null);
    setPasswordDone(false);
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(`Le nouveau mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caractères.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La confirmation ne correspond pas.");
      return;
    }
    setPasswordSaving(true);
    try {
      setUser(await changePassword(currentPassword, newPassword));
      setPasswordDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(messageOf(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  const doLogout = async () => {
    try {
      await logout();
    } catch {
      // même si l'appel réseau échoue, on déconnecte localement
    }
    setUser(null);
    setStatus("unauthenticated");
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900">Compte</h2>
            <span className="text-[11px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-200 text-slate-500">
              {user.role === "admin" ? "Administrateur" : "Invité"}
            </span>
          </div>
          <button aria-label="Fermer" onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          <section className="flex flex-col gap-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Profil</span>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Adresse e-mail</span>
              <input type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT_CLASS} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500">Nom affiché</span>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Optionnel" className={INPUT_CLASS} />
            </label>
            {profileError && <p className="text-xs text-red-500">{profileError}</p>}
            {profileSaved && <p className="text-xs text-emerald-600">Profil enregistré.</p>}
            <button
              type="button"
              onClick={saveProfile}
              disabled={!profileDirty || profileSaving}
              className="self-start py-1.5 px-3 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
            >
              {profileSaving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </section>

          <section className="flex flex-col gap-3 border-t border-slate-100 pt-5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wide">Mot de passe</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
              className={INPUT_CLASS}
            />
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`Nouveau mot de passe (${PASSWORD_MIN_LENGTH} car. min)`}
              className={INPUT_CLASS}
            />
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le nouveau mot de passe"
              className={INPUT_CLASS}
            />
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            {passwordDone && (
              <p className="text-xs text-emerald-600">
                Mot de passe changé. Tes autres appareils ont été déconnectés.
              </p>
            )}
            <button
              type="button"
              onClick={savePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || passwordSaving}
              className="self-start py-1.5 px-3 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors disabled:opacity-40"
            >
              {passwordSaving ? "Modification…" : "Changer le mot de passe"}
            </button>
          </section>

          <section className="flex flex-col gap-2 border-t border-slate-100 pt-5">
            {user.role === "admin" && (
              <button
                type="button"
                onClick={() => { navigate("/dashboard"); onClose(); }}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
              >
                <ShieldCheck size={16} />
                Gérer les comptes
              </button>
            )}
            <button
              type="button"
              onClick={doLogout}
              className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
