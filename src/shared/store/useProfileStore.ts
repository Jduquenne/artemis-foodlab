import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Profile } from "../../core/domain/profile";
import {
  CreateProfileInput,
  UpdateProfileInput,
  createProfileApi,
  deleteProfileApi,
  deleteProfileFoodGroupDefaultApi,
  setProfileFoodGroupDefaultApi,
  updateProfileApi,
} from "../../core/services/profileService";
import { withoutFoodGroupDefault } from "../../core/logic/foodGroup/foodChoiceLogic";
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
    }),
    {
      name: "cipe_active_profile",
      partialize: (state) => ({ activeProfileId: state.activeProfileId }),
    },
  ),
);
