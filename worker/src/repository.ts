import { canonicalizeRecipeId, displayRecipeId } from "./mapping/categoryPrefix";
import { assignFoodIds, buildFoodRowValues, parseRawFoodRow, RawFoodRow } from "./mapping/foods";
import { assignHouseholdIds, parseRawHouseholdRow, RawHouseholdRow } from "./mapping/household";
import { parseInstructionRow } from "./mapping/instructions";
import { normalizeName } from "./mapping/nameNormalize";
import { parsePhotoRow, RawPhotoRow } from "./mapping/photos";
import {
  buildRecipeRowValues,
  FoodIndexEntry,
  parseRawRecipeRow,
  RawRecipeRow,
  RecipeNameIndexEntry,
  resolveIngredient,
} from "./mapping/recipes";
import { buildRowFromRecord, field, toSheetRows } from "./mapping/sheetRecords";
import { appendRow, deleteRow, readAllRows, updateRow } from "./sheetsClient";
import { Env, Food, HouseholdItem, InstructionEntry, RecipeDetails, RecipeKind } from "./types";

function parseRecipeTab(rows: string[][]): RawRecipeRow[] {
  return toSheetRows(rows)
    .map(parseRawRecipeRow)
    .filter((row): row is RawRecipeRow => row !== null);
}

async function loadFoodsWithRowNumbers(env: Env): Promise<{ rowNumber: number; food: Food }[]> {
  const rows = await readAllRows(env, env.ALIMENTS_SHEET_NAME);
  const paired = toSheetRows(rows)
    .map((sheetRow) => ({ rowNumber: sheetRow.rowNumber, raw: parseRawFoodRow(sheetRow) }))
    .filter((p): p is { rowNumber: number; raw: RawFoodRow } => p.raw !== null);
  const foods = assignFoodIds(paired.map((p) => p.raw));
  return paired.map((p, i) => ({ rowNumber: p.rowNumber, food: foods[i]! }));
}

export async function listFoods(env: Env): Promise<Record<string, Food>> {
  const paired = await loadFoodsWithRowNumbers(env);
  return Object.fromEntries(paired.map((p) => [p.food.id, p.food]));
}

export async function saveFood(env: Env, food: Food): Promise<void> {
  const [rows, paired] = await Promise.all([
    readAllRows(env, env.ALIMENTS_SHEET_NAME),
    loadFoodsWithRowNumbers(env),
  ]);
  const header = rows[0] ?? [];
  const existing = paired.find((p) => p.food.id === food.id);
  const row = buildRowFromRecord(header, buildFoodRowValues(food));

  if (existing) {
    await updateRow(env, env.ALIMENTS_SHEET_NAME, existing.rowNumber, row);
  } else {
    await appendRow(env, env.ALIMENTS_SHEET_NAME, row);
  }
}

export async function deleteFood(env: Env, id: string): Promise<boolean> {
  const paired = await loadFoodsWithRowNumbers(env);
  const existing = paired.find((p) => p.food.id === id);
  if (!existing) return false;
  await deleteRow(env, env.ALIMENTS_SHEET_NAME, existing.rowNumber);
  return true;
}

async function loadHouseholdWithRowNumbers(env: Env): Promise<{ rowNumber: number; item: HouseholdItem }[]> {
  const rows = await readAllRows(env, env.HOUSEHOLD_SHEET_NAME);
  const paired = toSheetRows(rows)
    .map((sheetRow) => ({ rowNumber: sheetRow.rowNumber, raw: parseRawHouseholdRow(sheetRow) }))
    .filter((p): p is { rowNumber: number; raw: RawHouseholdRow } => p.raw !== null);
  const items = assignHouseholdIds(paired.map((p) => p.raw));
  return paired.map((p, i) => ({ rowNumber: p.rowNumber, item: items[i]! }));
}

export async function listHousehold(env: Env): Promise<Record<string, HouseholdItem>> {
  const paired = await loadHouseholdWithRowNumbers(env);
  return Object.fromEntries(paired.map((p) => [p.item.id, p.item]));
}

export async function listInstructions(env: Env): Promise<Record<string, InstructionEntry>> {
  const rows = await readAllRows(env, env.INSTRUCTIONS_SHEET_NAME);
  const entries = toSheetRows(rows)
    .map(parseInstructionRow)
    .filter((e): e is InstructionEntry => e !== null);
  return Object.fromEntries(entries.map((e) => [e.id, e]));
}

async function loadPhotos(env: Env): Promise<Map<string, RawPhotoRow>> {
  const rows = await readAllRows(env, env.PHOTOS_SHEET_NAME);
  const entries = toSheetRows(rows)
    .map(parsePhotoRow)
    .filter((p): p is RawPhotoRow => p !== null);
  return new Map(entries.map((p) => [p.id, p]));
}

export async function listPhotos(env: Env): Promise<Record<string, RawPhotoRow>> {
  return Object.fromEntries(await loadPhotos(env));
}

export async function listRecipes(env: Env): Promise<Record<string, RecipeDetails>> {
  const [recettesRows, basesRows, ingredientsRows, foods, instructions, photos] = await Promise.all([
    readAllRows(env, env.RECETTES_SHEET_NAME),
    readAllRows(env, env.BASES_SHEET_NAME),
    readAllRows(env, env.INGREDIENTS_SHEET_NAME),
    listFoods(env),
    listInstructions(env),
    loadPhotos(env),
  ]);

  const allRawRecipes = [
    ...parseRecipeTab(recettesRows),
    ...parseRecipeTab(basesRows),
    ...parseRecipeTab(ingredientsRows),
  ];

  const foodIndex = new Map<string, FoodIndexEntry>();
  for (const food of Object.values(foods)) {
    foodIndex.set(normalizeName(food.name), { id: food.id, category: food.category });
  }

  const canonicalIds = new Map<RawRecipeRow, { id: string; categoryId: string }>(
    allRawRecipes.map((raw) => [raw, canonicalizeRecipeId(raw.id)]),
  );

  const recipeNameIndex = new Map<string, RecipeNameIndexEntry>();
  for (const raw of allRawRecipes) {
    recipeNameIndex.set(normalizeName(raw.name), { id: canonicalIds.get(raw)!.id });
  }

  const result: Record<string, RecipeDetails> = {};
  for (const raw of allRawRecipes) {
    const { id, categoryId } = canonicalIds.get(raw)!;
    const ingredients = raw.rawIngredients.map((ref, i) =>
      resolveIngredient(ref, String(i + 1).padStart(3, "0"), foodIndex, recipeNameIndex),
    );
    const instruction = instructions[raw.id];
    const photo = photos.get(raw.id);

    result[id] = {
      id,
      name: raw.name,
      categoryId,
      mealTypes: raw.mealTypes,
      kind: raw.kind,
      defaultPortions: raw.defaultPortions,
      ingredients,
      assets: {
        ...(photo?.mealImage ? { mealPhoto: { url: photo.mealImage } } : {}),
        ...(photo?.bookPhoto ? { bookPhoto: { url: photo.bookPhoto } } : {}),
      },
      batchCooking: raw.batchCooking,
      isDessert: raw.isDessert,
      bookPage: instruction?.bookPage,
    };
  }

  return result;
}

function sheetNameForKind(env: Env, kind: RecipeKind): string {
  switch (kind) {
    case RecipeKind.BASE:
      return env.BASES_SHEET_NAME;
    case RecipeKind.INGREDIENT:
      return env.INGREDIENTS_SHEET_NAME;
    default:
      return env.RECETTES_SHEET_NAME;
  }
}

async function findRecipeRowNumber(env: Env, sheetName: string, id: string): Promise<number | null> {
  const rows = await readAllRows(env, sheetName);
  const found = toSheetRows(rows).find((r) => field(r.record, "id") === id);
  return found ? found.rowNumber : null;
}

export async function saveRecipe(env: Env, recipe: RecipeDetails): Promise<void> {
  const sheetName = sheetNameForKind(env, recipe.kind);
  const rows = await readAllRows(env, sheetName);
  const header = rows[0] ?? [];
  const displayId = displayRecipeId(recipe.id);
  const existingRowNumber = toSheetRows(rows).find((r) => field(r.record, "id") === displayId)?.rowNumber;
  const row = buildRowFromRecord(header, buildRecipeRowValues({ ...recipe, id: displayId }));

  if (existingRowNumber) {
    await updateRow(env, sheetName, existingRowNumber, row);
  } else {
    await appendRow(env, sheetName, row);
  }
}

export async function deleteRecipe(env: Env, id: string): Promise<boolean> {
  const displayId = displayRecipeId(id);
  for (const sheetName of [env.RECETTES_SHEET_NAME, env.BASES_SHEET_NAME, env.INGREDIENTS_SHEET_NAME]) {
    const rowNumber = await findRecipeRowNumber(env, sheetName, displayId);
    if (rowNumber) {
      await deleteRow(env, sheetName, rowNumber);
      return true;
    }
  }
  return false;
}
