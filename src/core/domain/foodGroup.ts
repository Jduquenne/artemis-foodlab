export interface FoodGroup {
  id: string;
  name: string;
}

export interface FoodGroupDefault {
  foodGroupId: string;
  foodId: string;
}

export interface FoodChoice {
  recipeIngredientId: string;
  profileId: string;
  foodId: string;
  quantity?: number | null;
}

export type FoodChoiceSource = "meal" | "profile" | "recipe";

export interface ResolvedFood {
  foodId: string;
  source: FoodChoiceSource;
  quantityPerPortion: number | null;
}
