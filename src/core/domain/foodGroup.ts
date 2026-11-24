export interface FoodGroup {
  id: string;
  name: string;
}

export interface FoodGroupDefault {
  foodGroupId: string;
  foodId: string | null;
}

export interface FoodChoice {
  recipeIngredientId: string;
  profileId: string;
  foodId: string | null;
  quantity: number | null;
}

export type FoodSelection = { kind: "default" } | { kind: "none" } | { kind: "food"; foodId: string };

export type FoodChoiceSource = "meal" | "profile" | "recipe";

export interface ResolvedFood {
  foodId: string | null;
  source: FoodChoiceSource;
  quantityPerPortion: number | null;
}
