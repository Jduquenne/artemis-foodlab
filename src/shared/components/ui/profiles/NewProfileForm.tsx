import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { PROFILE_NAME_MAX_LENGTH } from "../../../../core/domain/profileConfig";
import { Profile } from "../../../../core/domain/types";
import { suggestProfileColor } from "../../../../core/logic/profile/profileLogic";
import { useProfileStore } from "../../../store/useProfileStore";
import { ProfileColorPicker } from "./ProfileColorPicker";

export interface NewProfileFormProps {
  profiles: Profile[];
}

export const NewProfileForm = ({ profiles }: NewProfileFormProps) => {
  const createProfile = useProfileStore((s) => s.createProfile);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveColor = color ?? suggestProfileColor(profiles);
  const trimmed = name.trim();

  const handleSubmit = async () => {
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await createProfile({ name: trimmed, color: effectiveColor });
      setName("");
      setColor(null);
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <input
          value={name}
          maxLength={PROFILE_NAME_MAX_LENGTH}
          placeholder="Nouveau profil"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white dark:bg-slate-100 px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-orange-400"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!trimmed || submitting}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Ajouter
        </button>
      </div>
      <ProfileColorPicker value={effectiveColor} onChange={setColor} disabled={submitting} />
    </div>
  );
};
