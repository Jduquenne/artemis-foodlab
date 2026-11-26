import { useState } from "react";
import { Check } from "lucide-react";
import { getProfileColorHex } from "../../../core/logic/profile/profileLogic";
import { useProfileStore } from "../../store/useProfileStore";
import { ProfileDot } from "../ui/profiles/ProfileDot";

export const ProfileQuickSwitch = () => {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const [open, setOpen] = useState(false);
  const active = profiles.find((profile) => profile.id === activeProfileId);
  if (profiles.length < 2 || !active) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={`Profil actif : ${active.name}`}
        aria-label={`Profil actif : ${active.name}, changer de profil`}
        aria-expanded={open}
        className="w-9 h-9 tablet:w-11 tablet:h-11 rounded-full grid place-items-center text-sm font-black text-white shadow-sm ring-2 ring-surface hover:scale-105 transition-transform"
        style={{ backgroundColor: getProfileColorHex(active.color) }}
      >
        {active.name.trim().charAt(0).toUpperCase() || "?"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-0 left-full ml-3 z-50 bg-surface border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-48">
            <p className="px-4 pt-3 pb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Profil actif</p>
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => { setActiveProfile(profile.id); setOpen(false); }}
                aria-pressed={profile.id === activeProfileId}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-subtle transition-colors"
              >
                <ProfileDot color={profile.color} />
                <span className={`flex-1 min-w-0 truncate text-left ${profile.id === activeProfileId ? "font-black" : ""}`}>{profile.name}</span>
                {profile.id === activeProfileId && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
