import {
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
import { MenuCatalogue } from "./candidateLogic";

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
}

export interface HabitNames {
  catalogue: MenuCatalogue;
  categoryNames: Record<string, string>;
}

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
      return matcher.foodsOf(recipe.code).has(target.foodId);
    case "recipe":
      return recipe.code === target.recipeCode;
    case "noMeal":
      return false;
  }
}

export function slotHabits(habits: readonly HabitRule[], dayName: string, slot: GeneratedSlotType): SlotHabits {
  const rules = habits.filter((rule) => rule.enabled && rule.days.includes(dayName) && rule.slots.includes(slot));
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
  return habits.mandatory.every((rule) => matchesHabitTarget(recipe, rule.target, matcher))
    && habits.forbidden.every((rule) => !matchesHabitTarget(recipe, rule.target, matcher));
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
      return names.catalogue.foods[target.foodId]?.name ?? target.foodId;
    case "recipe":
      return names.catalogue.recipes[target.recipeCode]?.name ?? target.recipeCode;
    case "noMeal":
      return "Pas de repas";
  }
}

export function habitLabel(rule: HabitRule, names: HabitNames): string {
  const strength = rule.target.kind === "noMeal" ? "" : ` (${HABIT_STRENGTH_LABELS[rule.strength].toLowerCase()})`;
  return `${habitTargetLabel(rule.target, names)} · ${formatHabitDays(rule.days)}${strength}`;
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
    if (!matchesHabitTarget(recipe, rule.target, matcher)) continue;
    score += HABIT_SCORE;
    reasons.push({ kind: "habit", label: `Habitude : ${habitLabel(rule, names)}` });
  }
  for (const rule of habits.avoid) {
    if (!matchesHabitTarget(recipe, rule.target, matcher)) continue;
    score -= HABIT_SCORE;
    reasons.push({ kind: "habit", label: `Malgré l'habitude : ${habitLabel(rule, names)}` });
  }
  return { score, reasons };
}
