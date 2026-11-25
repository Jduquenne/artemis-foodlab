import { AccompanimentChoice } from "../../domain/accompaniment";
import { BaseVersionChoice, SelectableBaseVersion } from "../../domain/baseVersion";
import { FoodChoice } from "../../domain/foodGroup";
import { MealSlot, PlanningItemEntry, SlotType } from "../../domain/planning";
import { getCodeById, getIdByCode } from "../../catalogue/recipeIdMap";
import { ParsedSlot, buildSlotId } from "./planningSlotIdLogic";
import { DragMoveMode, DragMoveRequest } from "./planningDragLogic";
import { SlotDiff } from "./slotDiffLogic";
import { ApiFreezerItem } from "../freezer/freezerApiMapper";

export type ApiBaseVersionChoice =
  | { baseId: string; version: SelectableBaseVersion }
  | { baseId: string; version: "frozen"; freezerItemId: string; quantity: number };

export interface ApiPlanningSlotItem {
  id: string;
  itemId: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
  position: number;
  foodChoices?: FoodChoice[];
  accompanimentChoices?: AccompanimentChoice[];
  baseVersionChoices?: ApiBaseVersionChoice[];
}

export interface ApiSlotItemsBatchResponse {
  items: ApiPlanningSlotItem[];
  freezerBatches?: ApiFreezerItem[];
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

export interface ApiBulkItemEntry {
  year: number;
  week: number;
  day: string;
  slot: SlotType;
  itemId: string;
  isDessert?: boolean;
}

export interface ApiBulkItemsPayload {
  entries: ApiBulkItemEntry[];
  onConflict: "skip" | "fail";
}

export interface ApiBulkItemsResponse {
  slots: ApiPlanningSlot[];
  skipped: { year: number; week: number; day: string; slot: string; itemId?: string; isDessert?: boolean; reason?: string }[];
}

export interface SlotItemFields {
  recipeIds: string[];
  dessertIds?: string[];
  recipePersons?: Record<string, number>;
  recipeQuantities?: Record<string, number>;
  foodChoices?: Record<string, FoodChoice[]>;
  accompanimentChoices?: Record<string, AccompanimentChoice[]>;
  baseVersionChoices?: Record<string, BaseVersionChoice[]>;
  itemApiIds: Record<string, string>;
}

export function mapApiBaseVersionChoices(choices: readonly ApiBaseVersionChoice[]): BaseVersionChoice[] {
  return choices.map((choice): BaseVersionChoice => {
    const baseCode = getCodeById(choice.baseId) ?? choice.baseId;
    return choice.version === "frozen"
      ? { baseCode, version: "frozen", freezerItemId: choice.freezerItemId, quantity: choice.quantity }
      : { baseCode, version: choice.version };
  });
}

export function toApiBaseVersionChoices(choices: readonly BaseVersionChoice[]): ApiBaseVersionChoice[] {
  return choices.flatMap((choice): ApiBaseVersionChoice[] => {
    const baseId = getIdByCode(choice.baseCode);
    if (!baseId) return [];
    return choice.version === "frozen"
      ? [{ baseId, version: "frozen", freezerItemId: choice.freezerItemId, quantity: choice.quantity }]
      : [{ baseId, version: choice.version }];
  });
}

export function mapApiItemsToSlotFields(items: ApiPlanningSlotItem[]): SlotItemFields {
  const recipeIds: string[] = [];
  const dessertIds: string[] = [];
  const recipePersons: Record<string, number> = {};
  const recipeQuantities: Record<string, number> = {};
  const foodChoices: Record<string, FoodChoice[]> = {};
  const accompanimentChoices: Record<string, AccompanimentChoice[]> = {};
  const baseVersionChoices: Record<string, BaseVersionChoice[]> = {};
  const itemApiIds: Record<string, string> = {};

  const sorted = [...items].sort((a, b) => a.position - b.position);
  for (const item of sorted) {
    const code = getCodeById(item.itemId) ?? item.itemId;
    itemApiIds[code] = item.id;
    if (item.isDessert) dessertIds.push(code);
    else recipeIds.push(code);
    if (item.personsOverride !== null) recipePersons[code] = item.personsOverride;
    if (item.gramsOverride !== null) recipeQuantities[code] = item.gramsOverride;
    if (item.foodChoices && item.foodChoices.length > 0) foodChoices[code] = item.foodChoices;
    if (item.accompanimentChoices && item.accompanimentChoices.length > 0) accompanimentChoices[code] = item.accompanimentChoices;
    if (item.baseVersionChoices && item.baseVersionChoices.length > 0) baseVersionChoices[code] = mapApiBaseVersionChoices(item.baseVersionChoices);
  }

  return {
    recipeIds,
    dessertIds: dessertIds.length > 0 ? dessertIds : undefined,
    recipePersons: Object.keys(recipePersons).length > 0 ? recipePersons : undefined,
    recipeQuantities: Object.keys(recipeQuantities).length > 0 ? recipeQuantities : undefined,
    foodChoices: Object.keys(foodChoices).length > 0 ? foodChoices : undefined,
    accompanimentChoices: Object.keys(accompanimentChoices).length > 0 ? accompanimentChoices : undefined,
    baseVersionChoices: Object.keys(baseVersionChoices).length > 0 ? baseVersionChoices : undefined,
    itemApiIds,
  };
}

export function mapApiSlotToMealSlot(api: ApiPlanningSlot): MealSlot {
  return {
    id: buildSlotId(api.year, api.week, api.day, api.slot as SlotType),
    apiId: api.id,
    day: api.day,
    slot: api.slot as SlotType,
    year: api.year,
    week: api.week,
    persons: api.persons ?? undefined,
    ...mapApiItemsToSlotFields(api.items),
  };
}

export interface SlotItemAddPayload {
  itemId: string;
  isDessert: boolean;
  personsOverride: number | null;
  gramsOverride: number | null;
  foodChoices?: FoodChoice[];
  accompanimentChoices?: AccompanimentChoice[];
  baseVersionChoices?: ApiBaseVersionChoice[];
}

export interface SlotItemUpdatePayload {
  id: string;
  personsOverride: number | null;
  gramsOverride: number | null;
  foodChoices?: FoodChoice[];
  accompanimentChoices?: AccompanimentChoice[];
  baseVersionChoices?: ApiBaseVersionChoice[];
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
    const baseVersionChoices = toApiBaseVersionChoices(item.baseVersionChoices);
    add.push({
      itemId,
      isDessert: item.isDessert,
      personsOverride: item.personsOverride,
      gramsOverride: item.gramsOverride,
      ...(item.foodChoices.length > 0 ? { foodChoices: item.foodChoices } : {}),
      ...(item.accompanimentChoices.length > 0 ? { accompanimentChoices: item.accompanimentChoices } : {}),
      ...(baseVersionChoices.length > 0 ? { baseVersionChoices } : {}),
    });
  }
  const update = diff.itemsToUpdate.map((u) => ({
    id: u.itemApiId,
    personsOverride: u.personsOverride,
    gramsOverride: u.gramsOverride,
    ...(u.foodChoices ? { foodChoices: u.foodChoices } : {}),
    ...(u.accompanimentChoices ? { accompanimentChoices: u.accompanimentChoices } : {}),
    ...(u.baseVersionChoices ? { baseVersionChoices: toApiBaseVersionChoices(u.baseVersionChoices) } : {}),
  }));
  const remove = diff.itemsToRemoveApiIds;

  if (add.length === 0 && remove.length === 0 && update.length === 0) return null;

  return {
    ...(add.length > 0 ? { add } : {}),
    ...(remove.length > 0 ? { remove } : {}),
    ...(update.length > 0 ? { update } : {}),
  };
}

export function buildBulkItemsPayload(entries: readonly PlanningItemEntry[]): ApiBulkItemsPayload | null {
  const apiEntries = entries.flatMap(({ year, week, day, slot, code, isDessert }) => {
    const itemId = getIdByCode(code);
    return itemId ? [{ year, week, day, slot, itemId, ...(isDessert ? { isDessert: true } : {}) }] : [];
  });
  return apiEntries.length > 0 ? { entries: apiEntries, onConflict: "skip" } : null;
}

export interface ApiSlotKey {
  year: number;
  week: number;
  day: string;
  slot: SlotType;
}

export interface ApiMoveSlotsPayload {
  from: ApiSlotKey;
  to: ApiSlotKey;
  mode: DragMoveMode;
  moveDesserts: boolean;
  keptDessertIds?: string[];
}

export interface ApiMoveSlotsResponse {
  slots: ApiPlanningSlot[];
  freezerBatches: ApiFreezerItem[];
}

function slotKey({ year, week, day, slot }: ParsedSlot): ApiSlotKey {
  return { year, week, day, slot };
}

export function buildMoveSlotsPayload(request: DragMoveRequest): ApiMoveSlotsPayload {
  const keepsDesserts = request.mode === "move" && request.moveDesserts && request.keptDessertIds !== null;
  const keptDessertIds = keepsDesserts ? (request.keptDessertIds ?? []).flatMap((code) => getIdByCode(code) ?? []) : [];
  return {
    from: slotKey(request.from),
    to: slotKey(request.to),
    mode: request.mode,
    moveDesserts: request.moveDesserts,
    ...(keptDessertIds.length > 0 ? { keptDessertIds } : {}),
  };
}
