import { OutdoorEntry } from "../../domain/types";
import { getCategoryById } from "../../domain/categories";
import { OutdoorActivityInput } from "../../services/catalogueWriteService";
import { buildRecipeDbId } from "../recipeBuilder/recipeBuilderLogic";
import { RecapEntry, diffEntry } from "./recap";

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
  const prefix = buildRecipeDbId(DEFAULT_CATEGORY_ID, "");
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;
  for (const entry of entries) {
    const match = entry.code.match(pattern);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

export function validateOutdoorForm(draft: OutdoorFormDraft): string[] {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Le nom est requis.");
  if (!getCategoryById(draft.categoryId)) errors.push("Catégorie inconnue.");
  return errors;
}

export function validateNewOutdoorCode(code: string, entries: OutdoorEntry[]): string | null {
  const trimmed = code.trim();
  if (!trimmed) return "L'identifiant est requis.";
  if (!/^[a-z]+-\d+$/.test(trimmed)) return "L'identifiant doit être au format « od-001 ».";
  if (entries.some((entry) => entry.code === trimmed)) return "Cet identifiant est déjà utilisé.";
  return null;
}

export function outdoorFormToBody(code: string, draft: OutdoorFormDraft): OutdoorActivityInput {
  return { code: code.trim(), name: draft.name.trim(), categoryId: draft.categoryId };
}

function categoryLabel(id: string): string {
  return getCategoryById(id)?.name ?? id;
}

export function buildOutdoorRecap(
  original: OutdoorEntry | null,
  code: string,
  draft: OutdoorFormDraft,
): RecapEntry[] {
  if (original === null) {
    return [
      { label: "Identifiant", value: code.trim() },
      { label: "Nom", value: draft.name.trim() },
      { label: "Catégorie", value: categoryLabel(draft.categoryId) },
    ];
  }
  const changes: RecapEntry[] = [];
  const add = (entry: RecapEntry | null) => { if (entry) changes.push(entry); };
  add(diffEntry("Nom", original.name.trim(), draft.name.trim()));
  add(diffEntry("Catégorie", categoryLabel(original.categoryId), categoryLabel(draft.categoryId)));
  return changes;
}
