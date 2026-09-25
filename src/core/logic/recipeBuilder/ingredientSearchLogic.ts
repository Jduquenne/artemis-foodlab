import { Food } from "../../domain/ingredient";
import { normalizeQuery, rankByQuery } from "../../../shared/utils/textUtils";

const MAX_SUGGESTIONS = 8;

export function searchFoods(query: string, foods: Food[]): Food[] {
  return rankByQuery(foods, normalizeQuery(query), (food) => food.name).slice(0, MAX_SUGGESTIONS);
}

export function searchBases(
  query: string,
  bases: { id: string; name: string }[],
): { id: string; name: string }[] {
  if (!query) return bases.slice(0, MAX_SUGGESTIONS);
  return rankByQuery(bases, normalizeQuery(query), (base) => base.name).slice(0, MAX_SUGGESTIONS);
}
