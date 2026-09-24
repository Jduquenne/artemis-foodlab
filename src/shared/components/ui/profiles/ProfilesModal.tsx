import { useState } from "react";
import { X } from "lucide-react";
import { MAX_PROFILES } from "../../../../core/domain/profileConfig";
import { canAddProfile } from "../../../../core/logic/profile/profileLogic";
import { useProfileStore } from "../../../store/useProfileStore";
import { ProfileRow } from "./ProfileRow";
import { NewProfileForm } from "./NewProfileForm";

export interface ProfilesModalProps {
  onClose: () => void;
}

export const ProfilesModal = ({ onClose }: ProfilesModalProps) => {
  const profiles = useProfileStore((s) => s.profiles);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => { setIsClosing(true); setTimeout(onClose, 220); };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className={`w-full max-w-sm bg-white dark:bg-slate-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden ${
          isClosing ? "modal-center-exit" : "modal-center-enter"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-black text-orange-600 uppercase tracking-widest">Profils du foyer</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {profiles.length}/{MAX_PROFILES} · objectifs et journal propres à chaque personne
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {profiles.map((profile) => (
            <ProfileRow key={profile.id} profile={profile} canDelete={profiles.length > 1} />
          ))}
          {canAddProfile(profiles) ? (
            <NewProfileForm profiles={profiles} />
          ) : (
            <p className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              Maximum de {MAX_PROFILES} profils atteint.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
