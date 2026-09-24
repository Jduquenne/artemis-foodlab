import { DEFAULT_PROFILE_COLOR, MAX_PROFILES, PROFILE_COLORS } from "../../domain/profileConfig";
import { Profile } from "../../domain/types";

export function sortProfilesByPosition(profiles: Profile[]): Profile[] {
  return [...profiles].sort((a, b) => a.position - b.position);
}

export function resolveActiveProfileId(profiles: Profile[], storedId: string | null): string | null {
  if (storedId && profiles.some((p) => p.id === storedId)) return storedId;
  return profiles[0]?.id ?? null;
}

export function canAddProfile(profiles: Profile[]): boolean {
  return profiles.length < MAX_PROFILES;
}

export function getProfileColorHex(colorId: string): string {
  const match = PROFILE_COLORS.find((c) => c.id === colorId);
  return match ? match.hex : PROFILE_COLORS.find((c) => c.id === DEFAULT_PROFILE_COLOR)!.hex;
}

export function suggestProfileColor(profiles: Profile[]): string {
  const used = new Set(profiles.map((p) => p.color));
  return PROFILE_COLORS.find((c) => !used.has(c.id))?.id ?? DEFAULT_PROFILE_COLOR;
}

export function replaceProfileInList(profiles: Profile[], updated: Profile): Profile[] {
  return sortProfilesByPosition(profiles.map((p) => (p.id === updated.id ? updated : p)));
}
