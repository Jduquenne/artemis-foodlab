import { db } from "./db";
import { Recipe, WeeklyMenu } from "../domain/types";

export const exportData = async () => {
  try {
    const recipes = await db.recipes.toArray();
    const menus = await db.menus.toArray();

    const data = {
      timestamp: new Date().toISOString(),
      version: 1,
      recipes,
      menus,
    };

    // Création du Blob pour le téléchargement
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    // Déclenchement du téléchargement navigateur
    const link = document.createElement("a");
    link.href = url;
    link.download = `cipe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    alert("Erreur lors de l'export des données.");
  }
};

export const importData = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.recipes || !data.menus) {
      throw new Error("Format de fichier invalide");
    }

    // Transaction atomique pour éviter les données corrompues
    await db.transaction("rw", db.recipes, db.menus, async () => {
      // Option A : On efface tout avant d'importer (Reset total)
      // await db.recipes.clear();
      // await db.menus.clear();

      // Option B (choisie) : On fusionne (BulkPut écrase si l'ID existe déjà)
      await db.recipes.bulkPut(data.recipes);
      await db.menus.bulkPut(data.menus);
    });

    alert("Import réussi ! Rechargez la page.");
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    alert("Impossible de lire ce fichier de sauvegarde.");
  }
};
