import {
  GENERATED_SLOTS,
  GENERATED_SLOT_LABELS,
  FoodList,
  GeneratedSlotType,
  HabitProtein,
  HabitRule,
  HabitStrength,
  HabitTarget,
  MealReason,
  RecipeDietProfile,
} from "../../domain/menuGenerator";
import { DAYS } from "../../domain/planningConfig";
import { RecipeDetails } from "../../domain/recipe";
import { foldText, normalizeQuery, rankByQuery } from "../../utils/textUtils";
import { MenuCatalogue, isGeneratableDish } from "./candidateLogic";

export const HABIT_SCORE = 3;

export const HABIT_PROTEIN_LABELS: Record<HabitProtein, string> = {
  fish: "Poisson",
  meat: "Viande (toute)",
  redMeat: "Viande rouge",
  whiteMeat: "Viande blanche",
  deli: "Charcuterie",
  vegetarian: "Végétarien",
};

export const HABIT_STRENGTH_LABELS: Record<HabitStrength, string> = {
  mandatory: "Obligatoire",
  preferred: "De préférence",
  avoid: "À éviter",
  forbidden: "Interdit",
};

export interface HabitMatcher {
  dietOf: (code: string) => RecipeDietProfile;
  foodsOf: (code: string) => ReadonlySet<string>;
  foodGroupOf: (foodId: string) => string | null;
  listFoods: (listId: string) => readonly string[];
}

export interface HabitNames {
  catalogue: MenuCatalogue;
  categoryNames: Record<string, string>;
  groupNames: Record<string, string>;
  lists: readonly FoodList[];
}

export const HABIT_SCOPE_LABELS: Record<HabitRule["scope"], string> = {
  eachMeal: "Chaque repas coché",
  oneMeal: "Un seul des repas du jour",
};

export interface SlotHabits {
  noMeal: HabitRule | null;
  mandatory: HabitRule[];
  forbidden: HabitRule[];
  preferred: HabitRule[];
  avoid: HabitRule[];
}

function matchesProtein(diet: RecipeDietProfile, protein: HabitProtein): boolean {
  switch (protein) {
    case "fish":
      return diet.hasFish;
    case "meat":
      return diet.hasMeat;
    case "redMeat":
      return diet.hasRedMeat;
    case "whiteMeat":
      return diet.hasWhiteMeat;
    case "deli":
      return diet.hasDeli;
    case "vegetarian":
      return !diet.hasMeat && !diet.hasFish;
  }
}

export function matchesHabitTarget(recipe: RecipeDetails, target: HabitTarget, matcher: HabitMatcher): boolean {
  switch (target.kind) {
    case "protein":
      return matchesProtein(matcher.dietOf(recipe.code), target.protein);
    case "category":
      return recipe.categoryId === target.categoryId;
    case "food":
      return target.foodIds.some((foodId) => matcher.foodsOf(recipe.code).has(foodId));
    case "family":
      return [...matcher.foodsOf(recipe.code)].some((foodId) => matcher.foodGroupOf(foodId) === target.groupId);
    case "list":
      return matcher.listFoods(target.listId).some((foodId) => matcher.foodsOf(recipe.code).has(foodId));
    case "name": {
      const name = foldText(recipe.name);
      return target.keywords.some((keyword) => foldText(keyword) !== "" && name.includes(foldText(keyword)));
    }
    case "recipe":
      return recipe.code === target.recipeCode;
    case "noMeal":
      return false;
  }
}

export function matchesHabitRule(recipe: RecipeDetails, rule: HabitRule, matcher: HabitMatcher): boolean {
  if (!matchesHabitTarget(recipe, rule.target, matcher)) return false;
  const foods = matcher.foodsOf(recipe.code);
  return !rule.exceptFoodIds.some((foodId) => foods.has(foodId));
}

export function isOneMealHabit(rule: HabitRule): boolean {
  return rule.scope === "oneMeal" && rule.slots.length > 1 && (rule.strength === "mandatory" || rule.strength === "preferred");
}

export function slotHabits(habits: readonly HabitRule[], dayName: string, slot: GeneratedSlotType, extra: readonly HabitRule[] = []): SlotHabits {
  const rules = [
    ...habits.filter((rule) => rule.enabled && !isOneMealHabit(rule) && rule.days.includes(dayName) && rule.slots.includes(slot)),
    ...extra,
  ];
  const real = rules.filter((rule) => rule.target.kind !== "noMeal");
  return {
    noMeal: rules.find((rule) => rule.target.kind === "noMeal") ?? null,
    mandatory: real.filter((rule) => rule.strength === "mandatory"),
    forbidden: real.filter((rule) => rule.strength === "forbidden"),
    preferred: real.filter((rule) => rule.strength === "preferred"),
    avoid: real.filter((rule) => rule.strength === "avoid"),
  };
}

export function respectsStrictHabits(recipe: RecipeDetails, habits: SlotHabits, matcher: HabitMatcher): boolean {
  return habits.mandatory.every((rule) => matchesHabitRule(recipe, rule, matcher))
    && habits.forbidden.every((rule) => !matchesHabitRule(recipe, rule, matcher));
}

function dayIndexes(days: readonly string[]): number[] {
  return DAYS.map((_, index) => index).filter((index) => days.includes(DAYS[index]));
}

export function formatHabitDays(days: readonly string[]): string {
  const indexes = dayIndexes(days);
  const ranges: [number, number][] = [];
  for (const index of indexes) {
    const last = ranges[ranges.length - 1];
    if (last && last[1] === index - 1) last[1] = index;
    else ranges.push([index, index]);
  }
  const name = (index: number) => DAYS[index].toLowerCase();
  return ranges
    .map(([start, end]) => (start === end ? name(start) : end === start + 1 ? `${name(start)}, ${name(end)}` : `${name(start)} → ${name(end)}`))
    .join(", ");
}

export function habitTargetLabel(target: HabitTarget, names: HabitNames): string {
  switch (target.kind) {
    case "protein":
      return HABIT_PROTEIN_LABELS[target.protein];
    case "category":
      return names.categoryNames[target.categoryId] ?? target.categoryId;
    case "food":
      return target.foodIds.map((foodId) => names.catalogue.foods[foodId]?.name ?? foodId).join(" ou ");
    case "family":
      return `Famille ${names.groupNames[target.groupId] ?? target.groupId}`;
    case "list":
      return `Liste ${names.lists.find((list) => list.id === target.listId)?.name ?? "supprimée"}`;
    case "name":
      return `Nom contient ${target.keywords.map((keyword) => `« ${keyword} »`).join(" ou ")}`;
    case "recipe":
      return names.catalogue.recipes[target.recipeCode]?.name ?? target.recipeCode;
    case "noMeal":
      return "Pas de repas";
  }
}

export function habitExceptLabel(rule: HabitRule, names: HabitNames): string {
  if (rule.exceptFoodIds.length === 0) return "";
  return ` sauf ${rule.exceptFoodIds.map((foodId) => names.catalogue.foods[foodId]?.name ?? foodId).join(", ")}`;
}

export function habitLabel(rule: HabitRule, names: HabitNames): string {
  const strength = rule.target.kind === "noMeal" ? "" : ` (${HABIT_STRENGTH_LABELS[rule.strength].toLowerCase()})`;
  const scope = isOneMealHabit(rule) ? ", un des repas" : "";
  return `${habitTargetLabel(rule.target, names)}${habitExceptLabel(rule, names)} · ${formatHabitDays(rule.days)}${scope}${strength}`;
}

export function habitScore(
  recipe: RecipeDetails,
  habits: SlotHabits,
  matcher: HabitMatcher,
  names: HabitNames,
): { score: number; reasons: MealReason[] } {
  let score = 0;
  const reasons: MealReason[] = [];
  for (const rule of habits.mandatory) reasons.push({ kind: "habit", label: `Habitude : ${habitLabel(rule, names)}` });
  for (const rule of habits.preferred) {
    if (!matchesHabitRule(recipe, rule, matcher)) continue;
    score += HABIT_SCORE;
    reasons.push({ kind: "habit", label: `Habitude : ${habitLabel(rule, names)}` });
  }
  for (const rule of habits.avoid) {
    if (!matchesHabitRule(recipe, rule, matcher)) continue;
    score -= HABIT_SCORE;
    reasons.push({ kind: "habit", label: `Malgré l'habitude : ${habitLabel(rule, names)}` });
  }
  return { score, reasons };
}

export type HabitTargetKind = HabitTarget["kind"];

export const HABIT_TARGET_KIND_LABELS: Record<HabitTargetKind, string> = {
  protein: "Protéine",
  category: "Catégorie",
  food: "Aliment",
  family: "Famille",
  list: "Liste",
  name: "Nom de recette",
  recipe: "Recette",
  noMeal: "Pas de repas",
};

const MAX_RECIPE_SUGGESTIONS = 8;

export function emptyHabit(id: string): HabitRule {
  return {
    id,
    enabled: true,
    days: [],
    slots: [...GENERATED_SLOTS],
    scope: "eachMeal",
    target: { kind: "protein", protein: "fish" },
    exceptFoodIds: [],
    strength: "mandatory",
  };
}

export function defaultHabitTarget(kind: HabitTargetKind): HabitTarget {
  switch (kind) {
    case "protein":
      return { kind, protein: "fish" };
    case "category":
      return { kind, categoryId: "" };
    case "food":
      return { kind, foodIds: [] };
    case "family":
      return { kind, groupId: "" };
    case "list":
      return { kind, listId: "" };
    case "name":
      return { kind, keywords: [] };
    case "recipe":
      return { kind, recipeCode: "" };
    case "noMeal":
      return { kind };
  }
}

export function toggleHabitDay(days: readonly string[], day: string): string[] {
  const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
  return DAYS.filter((d) => next.includes(d));
}

export function habitDayRange(from: string, to: string): string[] {
  const start = (DAYS as readonly string[]).indexOf(from);
  const end = (DAYS as readonly string[]).indexOf(to);
  if (start < 0 || end < 0) return [];
  const length = ((end - start + DAYS.length) % DAYS.length) + 1;
  const range = Array.from({ length }, (_, offset) => DAYS[(start + offset) % DAYS.length]);
  return DAYS.filter((day) => range.includes(day));
}

export function validateHabitTarget(target: HabitTarget): string | null {
  if (target.kind === "category" && !target.categoryId) return "Choisis une catégorie.";
  if (target.kind === "food" && target.foodIds.length === 0) return "Choisis au moins un aliment.";
  if (target.kind === "family" && !target.groupId) return "Choisis une famille.";
  if (target.kind === "list" && !target.listId) return "Choisis une liste.";
  if (target.kind === "name" && target.keywords.length === 0) return "Ajoute au moins un mot.";
  if (target.kind === "recipe" && !target.recipeCode) return "Choisis une recette.";
  return null;
}

export function validateHabit(rule: HabitRule): string | null {
  if (rule.days.length === 0) return "Choisis au moins un jour.";
  if (rule.slots.length === 0) return "Choisis au moins un repas.";
  return validateHabitTarget(rule.target);
}

export function habitSlotsLabel(slots: readonly GeneratedSlotType[]): string {
  return GENERATED_SLOTS.filter((slot) => slots.includes(slot)).map((slot) => GENERATED_SLOT_LABELS[slot]).join(" + ");
}

export function searchHabitRecipes(query: string, recipes: Record<string, RecipeDetails>): RecipeDetails[] {
  const dishes = Object.values(recipes).filter((recipe) => GENERATED_SLOTS.some((slot) => isGeneratableDish(recipe, slot)));
  return rankByQuery(dishes, normalizeQuery(query), (recipe) => recipe.name).slice(0, MAX_RECIPE_SUGGESTIONS);
}

export function emptyFoodList(id: string): FoodList {
  return { id, name: "", foodIds: [] };
}

export function validateFoodList(list: FoodList, lists: readonly FoodList[]): string | null {
  const name = list.name.trim();
  if (!name) return "Donne un nom à la liste.";
  if (lists.some((other) => other.id !== list.id && other.name.trim().toLowerCase() === name.toLowerCase())) return "Une liste porte déjà ce nom.";
  if (list.foodIds.length === 0) return "Ajoute au moins un aliment.";
  return null;
}

function targetUsesList(target: HabitTarget, listId: string): boolean {
  return target.kind === "list" && target.listId === listId;
}

export function foodListUsage(listId: string, habits: readonly HabitRule[], quotas: readonly { target: HabitTarget }[]): number {
  return habits.filter((rule) => targetUsesList(rule.target, listId)).length
    + quotas.filter((quota) => targetUsesList(quota.target, listId)).length;
}
