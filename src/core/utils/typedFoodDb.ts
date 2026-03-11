import foodDbRaw from "../data/food-db.json";
import { Food } from "../domain/types";

export const typedFoodDb = foodDbRaw as unknown as Record<string, Food>;
