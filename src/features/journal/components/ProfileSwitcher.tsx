import { useState } from "react";
import { Users } from "lucide-react";
import { useProfileStore } from "../../../shared/store/useProfileStore";
import { ProfileDot } from "../../../shared/components/ui/profiles/ProfileDot";
import { ProfilesModal } from "../../../shared/components/ui/profiles/ProfilesModal";

export const ProfileSwitcher = () => {
  const profiles = useProfileStore((s) => s.profiles);
  const activeProfileId = useProfileStore((s) => s.activeProfileId);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
        {profiles.map((profile) => {
          const active = profile.id === activeProfileId;
          return (
            <button
              key={profile.id}
              onClick={() => setActiveProfile(profile.id)}
              aria-pressed={active}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg shrink-0 transition-colors ${
                active
                  ? "bg-slate-100 dark:bg-slate-200 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-200/60"
              }`}
            >
              <ProfileDot color={profile.color} />
              <span className={`text-[10px] tablet:text-xs max-w-24 truncate ${active ? "font-black" : "font-semibold"}`}>
                {profile.name}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setShowModal(true)}
          aria-label="Gérer les profils"
          className="p-1.5 rounded-lg shrink-0 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
        >
          <Users className="w-3.5 h-3.5 tablet:w-4 tablet:h-4" />
        </button>
      </div>

      {showModal && <ProfilesModal onClose={() => setShowModal(false)} />}
    </>
  );
};
