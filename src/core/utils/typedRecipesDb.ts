import recipesDbRaw from "../data/recipes-db.json";
import { RecipeDetails } from "../domain/types";

export const typedRecipesDb = recipesDbRaw as unknown as Record<string, RecipeDetails>;
