import { db } from "./databaseService";
import { FreezerBag, FreezerCategory, FreezerItem } from "../domain/types";

const uid = () => crypto.randomUUID();
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

export const createCategory = async (name: string): Promise<void> => {
  const count = await db.freezerCategories.count();
  await db.freezerCategories.add({ id: uid(), name, position: count, items: [] });
};

export const updateCategoryName = (id: string, name: string) =>
  db.freezerCategories.update(id, { name });

export const deleteCategory = (id: string) => db.freezerCategories.delete(id);

export const addItemToCategory = async (
  categoryId: string,
  item: Omit<FreezerItem, "id" | "addedDate">
): Promise<void> => {
  const newItem = { ...item, id: uid(), addedDate: today() } as FreezerItem;
  return withCategory(categoryId, cat => ({ items: [...cat.items, newItem] }));
};

export const removeItemFromCategory = (categoryId: string, itemId: string) =>
  withCategory(categoryId, cat => ({
    items: cat.items.filter(i => i.id !== itemId),
  }));

export const addBagToFoodItem = async (
  categoryId: string,
  itemId: string,
  bag: Omit<FreezerBag, "id" | "addedDate">
): Promise<void> => {
  const newBag: FreezerBag = { ...bag, id: uid(), addedDate: today() };
  return withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "food"
        ? { ...item, bags: [...item.bags, newBag] }
        : item
    ),
  }));
};

export const removeBagFromFoodItem = (categoryId: string, itemId: string, bagId: string) =>
  withCategory(categoryId, cat => ({
    items: cat.items.map(i =>
      i.id === itemId && i.type === "food"
        ? { ...i, bags: i.bags.filter(b => b.id !== bagId) }
        : i
    ),
  }));

export const updateBagInFoodItem = (
  categoryId: string,
  itemId: string,
  bagId: string,
  updates: Partial<Omit<FreezerBag, "id">>
) =>
  withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "food"
        ? { ...item, bags: item.bags.map(b => b.id === bagId ? { ...b, ...updates } : b) }
        : item
    ),
  }));

export const updateBatchPortions = (
  categoryId: string,
  itemId: string,
  portions: number
) =>
  withCategory(categoryId, cat => ({
    items: cat.items.map(item =>
      item.id === itemId && item.type === "batch"
        ? { ...item, portions }
        : item
    ),
  }));

export const updateItemInCategory = (
  categoryId: string,
  itemId: string,
  updates: Partial<FreezerItem>
) =>
  withCategory(categoryId, cat => ({
    items: cat.items.map(i => (i.id === itemId ? { ...i, ...updates } as FreezerItem : i)),
  }));
