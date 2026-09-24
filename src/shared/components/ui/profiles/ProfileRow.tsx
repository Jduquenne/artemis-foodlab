import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { PROFILE_NAME_MAX_LENGTH } from "../../../../core/domain/profileConfig";
import { Profile } from "../../../../core/domain/types";
import { useProfileStore } from "../../../store/useProfileStore";
import { usePendingKey } from "../../../hooks/usePendingKey";
import { withPending } from "../../../utils/withPending";
import { ProfileDot } from "./ProfileDot";
import { ProfileColorPicker } from "./ProfileColorPicker";

export interface ProfileRowProps {
  profile: Profile;
  canDelete: boolean;
}

export const ProfileRow = ({ profile, canDelete }: ProfileRowProps) => {
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);
  const key = `profile:${profile.id}`;
  const pending = usePendingKey(key);
  const [draft, setDraft] = useState(profile.name);
  const [lastName, setLastName] = useState(profile.name);
  const [colorOpen, setColorOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (profile.name !== lastName) {
    setLastName(profile.name);
    setDraft(profile.name);
  }

  const commitName = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === profile.name) {
      setDraft(profile.name);
      return;
    }
    try {
      await withPending(key, () => updateProfile(profile.id, { name: trimmed }));
    } catch {
      setDraft(profile.name);
    }
  };

  const changeColor = async (colorId: string) => {
    if (colorId === profile.color) return;
    await withPending(key, () => updateProfile(profile.id, { color: colorId })).catch(() => undefined);
  };

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    try {
      await withPending(key, () => deleteProfile(profile.id));
    } catch {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setColorOpen((o) => !o)}
          aria-label="Changer la couleur"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
        >
          <ProfileDot color={profile.color} className="w-4 h-4" />
        </button>
        <input
          value={draft}
          maxLength={PROFILE_NAME_MAX_LENGTH}
          disabled={pending}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
          className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-400 disabled:opacity-60"
        />
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            aria-label="Supprimer le profil"
            className={`shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              confirmingDelete
                ? "bg-red-500 text-white hover:bg-red-600"
                : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            }`}
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {confirmingDelete && !pending && "Confirmer"}
          </button>
        )}
      </div>
      {colorOpen && (
        <div className="pl-9">
          <ProfileColorPicker value={profile.color} onChange={changeColor} disabled={pending} />
        </div>
      )}
      {confirmingDelete && (
        <p className="pl-9 text-[11px] text-red-500">
          Supprime aussi les ajustements du journal de ce profil.
        </p>
      )}
    </div>
  );
};
