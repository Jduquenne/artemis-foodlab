import { DEFAULT_PROFILE_TARGETS } from "../../core/domain/profileConfig";
import { Profile } from "../../core/domain/types";
import { useProfileStore } from "../store/useProfileStore";

export function useActiveProfile(): Profile | null {
  return useProfileStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null);
}

export function useActiveTargets(): Pick<Profile, "kcalTarget" | "macroTargets"> {
  return useActiveProfile() ?? DEFAULT_PROFILE_TARGETS;
}
