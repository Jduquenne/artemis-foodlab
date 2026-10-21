import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Accompaniment } from "../../core/domain/accompaniment";
import { Profile } from "../../core/domain/profile";
import {
  CreateProfileInput,
  UpdateProfileInput,
  createProfileApi,
  deleteProfileApi,
  deleteProfileAccompanimentDefaultApi,
  deleteProfileFoodGroupDefaultApi,
  setProfileAccompanimentDefaultApi,
  setProfileFoodGroupDefaultApi,
  updateProfileApi,
} from "../../core/services/profileService";
import { withoutFoodGroupDefault } from "../../core/logic/foodGroup/foodChoiceLogic";
import { pruneAccompanimentDefaults } from "../../core/logic/accompaniment/accompanimentLogic";
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
  setFoodGroupDefault: (profileId: string, groupId: string, foodId: string | null) => Promise<void>;
  setAccompanimentDefault: (profileId: string, accompanimentId: string, optionId: string | null) => Promise<void>;
  clearAccompanimentDefault: (profileId: string, accompanimentId: string) => Promise<void>;
  pruneAccompanimentDefaults: (accompaniments: readonly Accompaniment[]) => void;
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
      setFoodGroupDefault: async (profileId, groupId, foodId) => {
        if (foodId) {
          const updated = await setProfileFoodGroupDefaultApi(profileId, groupId, foodId);
          set({ profiles: replaceProfileInList(get().profiles, updated) });
          return;
        }
        await deleteProfileFoodGroupDefaultApi(profileId, groupId);
        set({ profiles: get().profiles.map((p) => (p.id === profileId ? withoutFoodGroupDefault(p, groupId) : p)) });
      },
      setAccompanimentDefault: async (profileId, accompanimentId, optionId) => {
        const updated = await setProfileAccompanimentDefaultApi(profileId, accompanimentId, optionId);
        set({ profiles: replaceProfileInList(get().profiles, updated) });
      },
      clearAccompanimentDefault: async (profileId, accompanimentId) => {
        await deleteProfileAccompanimentDefaultApi(profileId, accompanimentId);
        set({
          profiles: get().profiles.map((p) => (p.id === profileId
            ? { ...p, accompanimentDefaults: p.accompanimentDefaults.filter((d) => d.accompanimentId !== accompanimentId) }
            : p)),
        });
      },
      pruneAccompanimentDefaults: (accompaniments) => {
        set({
          profiles: get().profiles.map((p) => {
            const accompanimentDefaults = pruneAccompanimentDefaults(p.accompanimentDefaults, accompaniments);
            return accompanimentDefaults === p.accompanimentDefaults ? p : { ...p, accompanimentDefaults };
          }),
        });
      },
    }),
    {
      name: "cipe_active_profile",
      partialize: (state) => ({ activeProfileId: state.activeProfileId }),
    },
  ),
);
