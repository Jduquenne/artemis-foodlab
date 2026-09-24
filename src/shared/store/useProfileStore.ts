import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile } from "../../core/domain/types";
import {
  CreateProfileInput,
  UpdateProfileInput,
  createProfileApi,
  deleteProfileApi,
  updateProfileApi,
} from "../../core/services/profileService";
import {
  replaceProfileInList,
  resolveActiveProfileId,
  sortProfilesByPosition,
} from "../../core/logic/profile/profileLogic";

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  replaceProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (id: string) => void;
  createProfile: (input: CreateProfileInput) => Promise<Profile>;
  updateProfile: (id: string, input: UpdateProfileInput) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      replaceProfiles: (profiles) => {
        const sorted = sortProfilesByPosition(profiles);
        set({ profiles: sorted, activeProfileId: resolveActiveProfileId(sorted, get().activeProfileId) });
      },
      setActiveProfile: (id) => {
        if (get().profiles.some((p) => p.id === id)) set({ activeProfileId: id });
      },
      createProfile: async (input) => {
        const created = await createProfileApi(input);
        set({ profiles: sortProfilesByPosition([...get().profiles, created]), activeProfileId: created.id });
        return created;
      },
      updateProfile: async (id, input) => {
        const updated = await updateProfileApi(id, input);
        set({ profiles: replaceProfileInList(get().profiles, updated) });
      },
      deleteProfile: async (id) => {
        await deleteProfileApi(id);
        const remaining = get().profiles.filter((p) => p.id !== id);
        set({ profiles: remaining, activeProfileId: resolveActiveProfileId(remaining, get().activeProfileId) });
      },
    }),
    {
      name: "cipe_active_profile",
      partialize: (state) => ({ activeProfileId: state.activeProfileId }),
    },
  ),
);
