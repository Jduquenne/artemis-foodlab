import { MealSlot, SlotType } from "../../domain/planning";
import { getCodeById, getIdByCode } from "../../typed-db/recipeIdMap";

export interface ApiPlanningSlotItem {
  id: string;
  itemId: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
  position: number;
}

export interface ApiPlanningSlot {
  id: string;
  year: number;
  week: number;
  day: string;
  slot: string;
  persons: number | null;
  items: ApiPlanningSlotItem[];
}

export interface SlotItemFields {
  recipeIds: string[];
  dessertIds?: string[];
  recipePersons?: Record<string, number>;
  recipeQuantities?: Record<string, number>;
  itemApiIds: Record<string, string>;
}

export function mapApiItemsToSlotFields(items: ApiPlanningSlotItem[]): SlotItemFields {
  const recipeIds: string[] = [];
  const dessertIds: string[] = [];
  const recipePersons: Record<string, number> = {};
  const recipeQuantities: Record<string, number> = {};
  const itemApiIds: Record<string, string> = {};

  const sorted = [...items].sort((a, b) => a.position - b.position);
  for (const item of sorted) {
    const code = getCodeById(item.itemId) ?? item.itemId;
    itemApiIds[code] = item.id;
    if (item.isDessert) dessertIds.push(code);
    else recipeIds.push(code);
    if (item.personsOverride != null) recipePersons[code] = item.personsOverride;
    if (item.gramsOverride != null) recipeQuantities[code] = item.gramsOverride;
  }

  return {
    recipeIds,
    dessertIds: dessertIds.length > 0 ? dessertIds : undefined,
    recipePersons: Object.keys(recipePersons).length > 0 ? recipePersons : undefined,
    recipeQuantities: Object.keys(recipeQuantities).length > 0 ? recipeQuantities : undefined,
    itemApiIds,
  };
}

export function mapApiSlotToMealSlot(api: ApiPlanningSlot): MealSlot {
  return {
    id: `${api.year}-W${api.week}-${api.day}-${api.slot}`,
    apiId: api.id,
    day: api.day,
    slot: api.slot as SlotType,
    year: api.year,
    week: api.week,
    persons: api.persons ?? undefined,
    ...mapApiItemsToSlotFields(api.items),
  };
}

export interface ItemToAdd {
  code: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
}

export interface ItemToUpdate {
  itemApiId: string;
  personsOverride: number | null;
  gramsOverride: number | null;
}

export interface SlotDiff {
  personsChanged: boolean;
  itemsToAdd: ItemToAdd[];
  itemsToRemoveApiIds: string[];
  itemsToUpdate: ItemToUpdate[];
  carryOverItemApiIds: Record<string, string>;
}

export function diffSlotItems(previous: MealSlot | undefined, next: MealSlot): SlotDiff {
  const nextCombined = [...next.recipeIds, ...(next.dessertIds ?? [])];
  const nextDessertSet = new Set(next.dessertIds ?? []);
  const previousCombined = previous ? [...previous.recipeIds, ...(previous.dessertIds ?? [])] : [];
  const previousSet = new Set(previousCombined);
  const nextSet = new Set(nextCombined);

  const itemsToAdd: ItemToAdd[] = [];
  const carryOverItemApiIds: Record<string, string> = {};
  const itemsToUpdate: ItemToUpdate[] = [];

  for (const code of nextCombined) {
    const personsOverride = next.recipePersons?.[code] ?? null;
    const gramsOverride = next.recipeQuantities?.[code] ?? null;
    if (!previousSet.has(code)) {
      itemsToAdd.push({ code, isDessert: nextDessertSet.has(code), personsOverride, gramsOverride });
      continue;
    }
    const itemApiId = previous?.itemApiIds?.[code];
    if (itemApiId) carryOverItemApiIds[code] = itemApiId;
    const prevPersons = previous?.recipePersons?.[code] ?? null;
    const prevGrams = previous?.recipeQuantities?.[code] ?? null;
    if (itemApiId && (prevPersons !== personsOverride || prevGrams !== gramsOverride)) {
      itemsToUpdate.push({ itemApiId, personsOverride, gramsOverride });
    }
  }

  const itemsToRemoveApiIds: string[] = [];
  for (const code of previousCombined) {
    if (!nextSet.has(code)) {
      const itemApiId = previous?.itemApiIds?.[code];
      if (itemApiId) itemsToRemoveApiIds.push(itemApiId);
    }
  }

  return {
    personsChanged: !previous || (previous.persons ?? null) !== (next.persons ?? null),
    itemsToAdd,
    itemsToRemoveApiIds,
    itemsToUpdate,
    carryOverItemApiIds,
  };
}

export interface SlotItemAddPayload {
  itemId: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
}

export interface SlotItemUpdatePayload {
  id: string;
  personsOverride: number | null;
  gramsOverride: number | null;
}

export interface SlotItemsBatchPayload {
  add?: SlotItemAddPayload[];
  remove?: string[];
  update?: SlotItemUpdatePayload[];
}

export function buildSlotItemsBatchPayload(diff: SlotDiff): SlotItemsBatchPayload | null {
  const add: SlotItemAddPayload[] = [];
  for (const item of diff.itemsToAdd) {
    const itemId = getIdByCode(item.code);
    if (!itemId) continue;
    add.push({ itemId, isDessert: item.isDessert, personsOverride: item.personsOverride, gramsOverride: item.gramsOverride });
  }
  const update = diff.itemsToUpdate.map(u => ({ id: u.itemApiId, personsOverride: u.personsOverride, gramsOverride: u.gramsOverride }));
  const remove = diff.itemsToRemoveApiIds;

  if (add.length === 0 && remove.length === 0 && update.length === 0) return null;

  return {
    ...(add.length > 0 ? { add } : {}),
    ...(remove.length > 0 ? { remove } : {}),
    ...(update.length > 0 ? { update } : {}),
  };
}
