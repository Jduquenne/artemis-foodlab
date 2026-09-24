import { Profile } from "./types";

export const MAX_PROFILES = 3;
export const DEFAULT_PROFILE_COLOR = "slate";
export const PROFILE_NAME_MAX_LENGTH = 50;

export const PROFILE_COLORS = [
  { id: "slate", hex: "#64748b" },
  { id: "orange", hex: "#f97316" },
  { id: "rose", hex: "#f43f5e" },
  { id: "emerald", hex: "#10b981" },
  { id: "sky", hex: "#0ea5e9" },
  { id: "violet", hex: "#8b5cf6" },
  { id: "amber", hex: "#f59e0b" },
  { id: "teal", hex: "#14b8a6" },
] as const;

export const DEFAULT_PROFILE_TARGETS: Pick<Profile, "kcalTarget" | "macroTargets"> = {
  kcalTarget: 2000,
  macroTargets: { proteins: 150, lipids: 65, carbohydrates: 250, fibers: 30 },
};
