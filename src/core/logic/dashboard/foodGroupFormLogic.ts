import { FoodGroup } from "../../domain/foodGroup";
import { Food } from "../../domain/ingredient";
import { FoodGroupInput } from "../../domain/catalogueInput";
import { RecapEntry, diffEntry } from "./recapLogic";

const FOOD_GROUP_ID_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function suggestFoodGroupId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateNewFoodGroupId(id: string, groups: readonly FoodGroup[]): string | null {
  const trimmed = id.trim();
  if (!trimmed) return "L'identifiant est requis.";
  if (!FOOD_GROUP_ID_FORMAT.test(trimmed)) return "L'identifiant doit être au format « fromages » (minuscules, chiffres, tirets).";
  if (groups.some((group) => group.id === trimmed)) return "Cet identifiant est déjà utilisé.";
  return null;
}

export function validateFoodGroupName(name: string): string[] {
  return name.trim() ? [] : ["Le nom est requis."];
}

export function foodGroupFormToBody(id: string, name: string): FoodGroupInput {
  return { id: id.trim(), name: name.trim() };
}

export function buildFoodGroupRecap(original: FoodGroup | null, id: string, name: string): RecapEntry[] {
  if (original === null) {
    return [
      { label: "Identifiant", value: id.trim() },
      { label: "Nom", value: name.trim() },
    ];
  }
  const change = diffEntry("Nom", original.name.trim(), name.trim());
  return change ? [change] : [];
}

export function foodsOfGroup(foods: readonly Food[], groupId: string): Food[] {
  return foods.filter((food) => food.groupId === groupId);
}

export function foodGroupLabel(groups: readonly FoodGroup[], groupId: string | null | undefined): string {
  if (!groupId) return "—";
  return groups.find((group) => group.id === groupId)?.name ?? groupId;
}
