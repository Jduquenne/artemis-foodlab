import { db } from "./db";
import manifest from "../domain/assets-manifest.json"; // Import du JSON généré

export const seedDatabase = async () => {
  const itemCount = await db.recipes.count();
  if (itemCount > 0) return;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const entriesToInsert = manifest
    .map((item) => {
      const { categoryFolder, typeFolder, fileName } = item;

      // REGEX ASSOUPLIE :
      // ^([A-Z]{2,4})  -> Préfixe de 2 à 6 lettres (ex: CH, VR, FISH)
      // _(\d{1,4})     -> 1 à 3 chiffres (ex: 1, 01, 100)
      // _(.*)$         -> Le reste du nom
      const match = fileName.match(/^([A-Z]{2,10})_(\d{1,3}(?:BIS)?)_(.*)$/i);

      if (match) {
        const [_, prefix, idNum, rest] = match;

        // On normalise l'ID pour qu'il soit toujours sur 2 chiffres (ex: CH_1 devient ch-01)
        const paddedId = idNum.padStart(3, "0");
        const normalizedRecipeId = `${prefix.toLowerCase()}-${paddedId}`;
        const type = typeFolder.toLowerCase();

        const cleanName = rest
          .split(".")[0]
          .replace(/(_Photo|_Ingredients|_Recipes)$/i, "")
          .replace(/_/g, " ");

        return {
          id: `${normalizedRecipeId}-${type}`,
          recipeId: normalizedRecipeId,
          name: cleanName,
          type: type,
          url: `${base}/${categoryFolder}/${typeFolder}/${fileName}`,
          categoryId: categoryFolder,
          ingredients: [],
        };
      } else {
        // DEBUG : Si un fichier du manifest n'est pas importé, on saura pourquoi
        console.warn(
          `❌ Fichier ignoré par le Seeder (Regex non matchée) : ${fileName}`,
        );
        return null;
      }
    })
    .filter(Boolean);

  if (entriesToInsert.length > 0) {
    await db.recipes.bulkAdd(entriesToInsert as any);
    console.log(`📦 BDD peuplée : ${entriesToInsert.length} entrées.`);
  }
};
