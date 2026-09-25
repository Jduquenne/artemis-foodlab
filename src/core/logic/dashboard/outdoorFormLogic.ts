import { Category, OutdoorEntry } from "../../domain/recipe";
import { OutdoorActivityInput } from "../../domain/catalogueInput";
import { buildRecipeDbId } from "../recipeBuilder/recipeCodeLogic";
import { RecapEntry, diffEntry } from "./recapLogic";
import { nextSequentialCode, validateNewCode } from "../../../shared/utils/codeUtils";

export interface OutdoorFormDraft {
  name: string;
  categoryId: string;
}

const DEFAULT_CATEGORY_ID = "outdoor";

export function emptyOutdoorDraft(): OutdoorFormDraft {
  return { name: "", categoryId: DEFAULT_CATEGORY_ID };
}

export function outdoorToDraft(entry: OutdoorEntry): OutdoorFormDraft {
  return { name: entry.name, categoryId: entry.categoryId };
}

export function suggestOutdoorCode(entries: OutdoorEntry[]): string {
  return nextSequentialCode(buildRecipeDbId(DEFAULT_CATEGORY_ID, ""), entries.map((entry) => entry.code));
}

export function validateOutdoorForm(draft: OutdoorFormDraft, categories: Category[]): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Le nom est requis.");
  if (!categories.some((c) => c.id === draft.categoryId)) errors.push("Catégorie inconnue.");
  return errors;
}

export function validateNewOutdoorCode(code: string, entries: OutdoorEntry[]): string | null {
  return validateNewCode(code, entries.map((entry) => entry.code), "od-001");
}

export function outdoorFormToBody(code: string, draft: OutdoorFormDraft): OutdoorActivityInput {
  return { code: code.trim(), name: draft.name.trim(), categoryId: draft.categoryId };
}

function categoryLabel(categories: Category[], id: string): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

export function buildOutdoorRecap(
  original: OutdoorEntry | null,
  code: string,
  draft: OutdoorFormDraft,
  categories: Category[],
): RecapEntry[] {
  if (original === null) {
    return [
      { label: "Identifiant", value: code.trim() },
      { label: "Nom", value: draft.name.trim() },
      { label: "Catégorie", value: categoryLabel(categories, draft.categoryId) },
    ];
  }
  const changes: RecapEntry[] = [];
  const add = (entry: RecapEntry | null) => { if (entry) changes.push(entry); };
  add(diffEntry("Nom", original.name.trim(), draft.name.trim()));
  add(diffEntry("Catégorie", categoryLabel(categories, original.categoryId), categoryLabel(categories, draft.categoryId)));
  return changes;
}
