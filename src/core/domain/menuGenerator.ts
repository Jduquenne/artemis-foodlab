import { MealType } from "./recipe";

export type GeneratedSlotType = MealType.LUNCH | MealType.DINNER;

export const GENERATED_SLOTS: readonly GeneratedSlotType[] = [MealType.LUNCH, MealType.DINNER];

export const GENERATED_SLOT_LABELS: Record<GeneratedSlotType, string> = {
  [MealType.LUNCH]: "Déjeuner",
  [MealType.DINNER]: "Dîner",
};

export const MIN_GENERATION_DAYS = 7;

export const MAX_GENERATION_DAYS = 14;

export const QUOTA_BLOCK_DAYS = 7;

export type DietFilter = "all" | "pescatarian" | "vegetarian";

export type SeasonMode = "off" | "preferred" | "strict";

export type PreferredFoodMode = "bonus" | "atLeastOnce";

export interface PreferredFood {
  foodId: string;
  mode: PreferredFoodMode;
}

export type HabitProtein = "fish" | "meat" | "redMeat" | "whiteMeat" | "deli" | "vegetarian";

export type HabitTarget =
  | { kind: "protein"; protein: HabitProtein }
  | { kind: "category"; categoryId: string }
  | { kind: "food"; foodId: string }
  | { kind: "recipe"; recipeCode: string }
  | { kind: "noMeal" };

export type HabitStrength = "mandatory" | "preferred" | "avoid" | "forbidden";

export interface HabitRule {
  id: string;
  enabled: boolean;
  days: string[];
  slots: GeneratedSlotType[];
  target: HabitTarget;
  strength: HabitStrength;
}

export type QuotaComparator = "atLeast" | "atMost";

export type QuotaStrictness = "strict" | "preferred";

export type QuotaTarget = Exclude<HabitTarget, { kind: "noMeal" }>;

export interface WeeklyQuota {
  id: string;
  enabled: boolean;
  target: QuotaTarget;
  comparator: QuotaComparator;
  count: number;
  strictness: QuotaStrictness;
}

export type AdvancedMode = "off" | "preferred" | "strict";

export interface AdvancedSettings {
  repeatWeeks: number;
  repeatMode: AdvancedMode;
  categoryInRow: AdvancedMode;
  kcalMode: AdvancedMode;
  kcalTolerance: number;
  kcalShares: Record<GeneratedSlotType, number>;
}

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  repeatWeeks: 3,
  repeatMode: "preferred",
  categoryInRow: "preferred",
  kcalMode: "preferred",
  kcalTolerance: 15,
  kcalShares: { [MealType.LUNCH]: 35, [MealType.DINNER]: 30 },
};

export interface MenuGeneratorSettings {
  startDate: string;
  endDate: string;
  slots: GeneratedSlotType[];
  diet: DietFilter;
  excludedFoodIds: string[];
  preferredFoods: PreferredFood[];
  season: SeasonMode;
  useFreezer: boolean;
  habits: HabitRule[];
  quotas: WeeklyQuota[];
  favoriteRecipeCodes: string[];
  bannedRecipeCodes: string[];
  advanced: AdvancedSettings;
}

export type SavedGeneratorSettings = Omit<MenuGeneratorSettings, "startDate" | "endDate"> & {
  periodDays: number;
};

export interface PeriodDay {
  date: string;
  year: number;
  week: number;
  day: string;
  month: number;
}

export interface RecipeDietProfile {
  hasMeat: boolean;
  hasFish: boolean;
  hasRedMeat: boolean;
  hasWhiteMeat: boolean;
  hasDeli: boolean;
}

export type MealReasonKind =
  | "season"
  | "offSeason"
  | "freezer"
  | "preferred"
  | "habit"
  | "quota"
  | "favorite"
  | "history"
  | "recent"
  | "kcal"
  | "repeat"
  | "empty"
  | "kept";

export interface MealReason {
  kind: MealReasonKind;
  label: string;
}

export interface GeneratedMeal {
  key: string;
  day: PeriodDay;
  slot: GeneratedSlotType;
  recipeCode: string | null;
  kept: boolean;
  locked: boolean;
  noMeal: boolean;
  reasons: MealReason[];
}

export interface MenuGenerationResult {
  meals: GeneratedMeal[];
  warnings: string[];
}
