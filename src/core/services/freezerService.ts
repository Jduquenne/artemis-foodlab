import { db } from "./db";
import { FreezerBag, FreezerCategory, FreezerItem } from "../domain/types";

const uid = () => crypto.randomUUID();
const today = () => new Date().toISOString().slice(0, 10);

export const getCategories = () => db.freezerCategories.orderBy("position").toArray();

export const createCategory = async (name: string): Promise<void> => {
  const count = await db.freezerCategories.count();
  await db.freezerCategories.add({ id: uid(), name, position: count, items: [] });
};

export const updateCategoryName = (id: string, name: string) =>
  db.freezerCategories.update(id, { name });

export const deleteCategory = (id: string) => db.freezerCategories.delete(id);

export const moveCategory = async (id: string, direction: "up" | "down"): Promise<void> => {
  const categories = await db.freezerCategories.orderBy("position").toArray();
  const idx = categories.findIndex(c => c.id === id);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= categories.length) return;
  await db.transaction("rw", db.freezerCategories, async () => {
    await db.freezerCategories.update(categories[idx].id, { position: swapIdx });
    await db.freezerCategories.update(categories[swapIdx].id, { position: idx });
  });
};

export const addItemToCategory = async (
  categoryId: string,
  item: Omit<FreezerItem, "id" | "addedDate">
): Promise<void> => {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  const newItem = { ...item, id: uid(), addedDate: today() } as FreezerItem;
  await db.freezerCategories.update(categoryId, { items: [...category.items, newItem] });
};

export const removeItemFromCategory = async (categoryId: string, itemId: string): Promise<void> => {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  await db.freezerCategories.update(categoryId, {
    items: category.items.filter(i => i.id !== itemId),
  });
};

export const addBagToFoodItem = async (
  categoryId: string,
  itemId: string,
  bag: Omit<FreezerBag, "id" | "addedDate">
): Promise<void> => {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  const newBag: FreezerBag = { ...bag, id: uid(), addedDate: today() };
  await db.freezerCategories.update(categoryId, {
    items: category.items.map(item =>
      item.id === itemId && item.type === "food"
        ? { ...item, bags: [...item.bags, newBag] }
        : item
    ),
  });
};

export const removeBagFromFoodItem = async (
  categoryId: string,
  itemId: string,
  bagId: string
): Promise<void> => {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  const item = category.items.find(i => i.id === itemId);
  if (!item || item.type !== "food") return;
  const remainingBags = item.bags.filter(b => b.id !== bagId);
  if (remainingBags.length === 0) {
    await db.freezerCategories.update(categoryId, {
      items: category.items.filter(i => i.id !== itemId),
    });
  } else {
    await db.freezerCategories.update(categoryId, {
      items: category.items.map(i =>
        i.id === itemId && i.type === "food" ? { ...i, bags: remainingBags } : i
      ),
    });
  }
};

export const updateItemInCategory = async (
  categoryId: string,
  itemId: string,
  updates: Partial<FreezerCategory["items"][number]>
): Promise<void> => {
  const category = await db.freezerCategories.get(categoryId);
  if (!category) return;
  await db.freezerCategories.update(categoryId, {
    items: category.items.map(i => (i.id === itemId ? { ...i, ...updates } as FreezerItem : i)),
  });
};
