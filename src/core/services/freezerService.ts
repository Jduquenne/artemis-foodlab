import { db } from "./databaseService";
import { apiFetch, apiFetchJson } from "./apiClient";
import { getIdByCode } from "../typed-db/recipeIdMap";
import {
  ApiFreezerBag,
  ApiFreezerCategory,
  ApiFreezerItem,
  mapApiBag,
  mapApiFreezerCategory,
} from "../logic/freezer/freezerApiMapper";
import { BatchFreezerItem, FoodFreezerItem, FreezerBag, FreezerCategory } from "../domain/types";

const today = () => new Date().toISOString().slice(0, 10);

async function withCategory(
  categoryId: string,
  fn: (cat: FreezerCategory) => Partial<FreezerCategory>
): Promise<void> {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  await db.freezerCategories.update(categoryId, fn(category));
}

export const getCategories = async (): Promise<FreezerCategory[]> => {
  const categories = await db.freezerCategories.toArray();
  return categories.sort((a, b) => a.name.localeCompare(b.name, "fr"));
};

export async function syncFreezerFromApi(): Promise<void> {
  try {
    const categories = await apiFetchJson<ApiFreezerCategory[]>("/freezer-categories");
    const mapped = categories.map(mapApiFreezerCategory);
    await db.transaction("rw", db.freezerCategories, async () => {
      await db.freezerCategories.clear();
      await db.freezerCategories.bulkPut(mapped);
    });
  } catch {
    /* réseau indisponible ou API injoignable, on garde le cache existant */
  }
}

export const createCategory = async (name: string): Promise<void> => {
  const created = await apiFetchJson<ApiFreezerCategory>("/freezer-categories", {
    method: "POST",
    body: { name },
  });
  await db.freezerCategories.add(mapApiFreezerCategory(created));
};

export const updateCategoryName = async (id: string, name: string): Promise<void> => {
  await apiFetchJson(`/freezer-categories/${id}`, { method: "PUT", body: { name } });
  await db.freezerCategories.update(id, { name });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiFetch(`/freezer-categories/${id}`, { method: "DELETE" });
  await db.freezerCategories.delete(id);
};

export const addItemToCategory = async (
  categoryId: string,
  item: Omit<FoodFreezerItem, "id"> | Omit<BatchFreezerItem, "id" | "addedDate">,
): Promise<void> => {
  if (item.type === "food") {
    const created = await apiFetchJson<ApiFreezerItem>("/freezer-items", {
      method: "POST",
      body: { type: "food", categoryId, name: item.name, foodId: item.foodId ?? null },
    });
    const bags: FreezerBag[] = [];
    for (const bag of item.bags) {
      const createdBag = await apiFetchJson<ApiFreezerBag>("/freezer-bags", {
        method: "POST",
        body: {
          foodItemId: created.id,
          quantity: bag.quantity,
          unit: bag.unit,
          preparation: bag.preparation ?? null,
          addedDate: bag.addedDate,
        },
      });
      bags.push(mapApiBag(createdBag));
    }
    const newItem: FoodFreezerItem = { id: created.id, type: "food", name: item.name, foodId: item.foodId, bags };
    await withCategory(categoryId, cat => ({ items: [...cat.items, newItem] }));
  } else {
    const addedDate = today();
    const recipeId = getIdByCode(item.recipeId) ?? item.recipeId;
    const created = await apiFetchJson<ApiFreezerItem>("/freezer-items", {
      method: "POST",
      body: { type: "batch", categoryId, recipeId, recipeName: item.recipeName, portions: item.portions, addedDate },
    });
    const newItem: BatchFreezerItem = { id: created.id, type: "batch", recipeId: item.recipeId, recipeName: item.recipeName, portions: item.portions, addedDate };
    await withCategory(categoryId, cat => ({ items: [...cat.items, newItem] }));
  }
};

export const removeItemFromCategory = async (categoryId: string, itemId: string): Promise<void> => {
  await apiFetch(`/freezer-items/${itemId}`, { method: "DELETE" });
  await withCategory(categoryId, cat => ({
    items: cat.items.filter(i => i.id !== itemId),
  }));
};

export const addBagToFoodItem = async (
  categoryId: string,
  itemId: string,
  bag: Omit<FreezerBag, "id" | "addedDate">
): Promise<void> => {
  const addedDate = today();
  const created = await apiFetchJson<ApiFreezerBag>("/freezer-bags", {
    method: "POST",
    body: { foodItemId: itemId, quantity: bag.quantity, unit: bag.unit, preparation: bag.preparation ?? null, addedDate },
  });
  const newBag = mapApiBag(created);
  await withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "food"
        ? { ...item, bags: [...item.bags, newBag] }
        : item
    ),
  }));
};

export const removeBagFromFoodItem = async (categoryId: string, itemId: string, bagId: string): Promise<void> => {
  await apiFetch(`/freezer-bags/${bagId}`, { method: "DELETE" });
  await withCategory(categoryId, cat => ({
    items: cat.items.map(i =>
      i.id === itemId && i.type === "food"
        ? { ...i, bags: i.bags.filter(b => b.id !== bagId) }
        : i
    ),
  }));
};

export const updateBagInFoodItem = async (
  categoryId: string,
  itemId: string,
  bagId: string,
  updates: Partial<Omit<FreezerBag, "id">>
): Promise<void> => {
  const { quantity, unit, preparation, addedDate } = updates;
  await apiFetchJson(`/freezer-bags/${bagId}`, {
    method: "PUT",
    body: {
      ...(quantity !== undefined && { quantity }),
      ...(unit !== undefined && { unit }),
      ...(preparation !== undefined && { preparation: preparation ?? null }),
      ...(addedDate !== undefined && { addedDate }),
    },
  });
  const persistedUpdates = {
    ...(quantity !== undefined && { quantity }),
    ...(unit !== undefined && { unit }),
    ...(preparation !== undefined && { preparation }),
    ...(addedDate !== undefined && { addedDate }),
  };
  await withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "food"
        ? { ...item, bags: item.bags.map(b => b.id === bagId ? { ...b, ...persistedUpdates } : b) }
        : item
    ),
  }));
};

export const updateBatchPortions = async (
  categoryId: string,
  itemId: string,
  portions: number
): Promise<void> => {
  await apiFetchJson(`/freezer-items/${itemId}`, { method: "PUT", body: { portions } });
  await withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "batch"
        ? { ...item, portions }
        : item
    ),
  }));
};
