export type FoodOrigin = "meat" | "fish" | "deli" | "none";

export const FOOD_ORIGINS: readonly FoodOrigin[] = ["none", "meat", "deli", "fish"];

export const FOOD_ORIGIN_LABELS: Record<FoodOrigin, string> = {
  none: "Aucune (végétal, autre)",
  meat: "Viande",
  deli: "Charcuterie",
  fish: "Poisson",
};
