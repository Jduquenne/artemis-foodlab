import { Food, IngredientCategory } from "../../domain/ingredient";
import { hasSeason } from "../season/seasonLogic";

export type FoodSeasonFilter = "all" | "seasonal" | "produceAllYear";

export const FOOD_SEASON_FILTERS: { id: FoodSeasonFilter; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "seasonal", label: "De saison" },
  { id: "produceAllYear", label: "F&L toute l'année" },
];

export function filterFoodsBySeason(foods: Food[], filter: FoodSeasonFilter): Food[] {
  if (filter === "seasonal") return foods.filter((food) => hasSeason(food.months));
  if (filter === "produceAllYear") {
    return foods.filter((food) => food.category === IngredientCategory.FRUIT_VEGETABLE && !hasSeason(food.months));
  }
  return foods;
}
