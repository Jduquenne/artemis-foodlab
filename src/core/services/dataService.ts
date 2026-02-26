import { db } from "./db";

export const exportData = async () => {
  try {
    const planning = await db.planning.toArray();
    const household = await db.household.toArray();

    const rawChecked = localStorage.getItem("cipe_shopping_checked");
    const rawStocks = localStorage.getItem("cipe_shopping_stocks");
    const rawDays = localStorage.getItem("cipe_shopping_days");

    const data = {
      timestamp: new Date().toISOString(),
      version: 2,
      planning,
      household,
      shoppingChecked: rawChecked ? JSON.parse(rawChecked) : null,
      shoppingStocks: rawStocks ? JSON.parse(rawStocks) : null,
      shoppingDays: rawDays ? JSON.parse(rawDays) : null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

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

    if (!data.planning) {
      throw new Error("Format de fichier invalide");
    }

    await db.transaction("rw", db.planning, db.household, async () => {
      await db.planning.bulkPut(data.planning);
      if (data.household?.length) {
        await db.household.bulkPut(data.household);
      }
    });

    if (data.shoppingChecked) {
      localStorage.setItem(
        "cipe_shopping_checked",
        JSON.stringify(data.shoppingChecked),
      );
    }
    if (data.shoppingStocks) {
      localStorage.setItem(
        "cipe_shopping_stocks",
        JSON.stringify(data.shoppingStocks),
      );
    }
    if (data.shoppingDays) {
      localStorage.setItem(
        "cipe_shopping_days",
        JSON.stringify(data.shoppingDays),
      );
    }

    alert("Import réussi ! Rechargez la page.");
    window.location.reload();
  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    alert("Impossible de lire ce fichier de sauvegarde.");
  }
};
