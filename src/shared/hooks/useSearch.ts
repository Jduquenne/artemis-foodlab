import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../core/services/db";

export interface SearchRecipeResult {
  id: string;
  recipeId: string;
  name: string;
  photoUrl: string;
  ingredientsUrl: string;
  recipeUrl?: string;
}

export const useSearch = (query: string | null) => {
  return (
    useLiveQuery(async () => {
      if (query === null) return [];

      const lowerQuery = query.toLowerCase().trim();

      const photos = lowerQuery
        ? await db.recipes
            .filter((recipe) => {
              if (recipe.type !== "photo") return false;
              const matchesName = recipe.name.toLowerCase().includes(lowerQuery);
              const parts = recipe.recipeId.toLowerCase().split("-");
              const numPart = parts[1];
              const matchesId =
                numPart === lowerQuery ||
                (numPart && parseInt(numPart).toString() === lowerQuery) ||
                recipe.recipeId.toLowerCase() === lowerQuery;
              return matchesName || matchesId;
            })
            .toArray()
        : await db.recipes.where("type").equals("photo").toArray();

      const consolidatedResults: SearchRecipeResult[] = await Promise.all(
        photos.map(async (photo) => {
          const [ingEntry, recipeEntry] = await Promise.all([
            db.recipes.where({ recipeId: photo.recipeId, type: "ingredients" }).first(),
            db.recipes.where({ recipeId: photo.recipeId, type: "recipes" }).first(),
          ]);
          return {
            id: photo.recipeId,
            recipeId: photo.recipeId,
            name: photo.name,
            photoUrl: photo.url,
            ingredientsUrl: ingEntry?.url || "",
            recipeUrl: recipeEntry?.url || "",
          };
        }),
      );

      return consolidatedResults;
    }, [query]) || []
  );
};
