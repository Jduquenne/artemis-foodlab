import { Food } from "../../domain/ingredient";

export function searchFoods(query: string, foods: Food[]): Food[] {
  const q = query.toLowerCase();
  const startsWith = foods.filter((f) => f.name.toLowerCase().startsWith(q));
  const contains = foods.filter(
    (f) => !f.name.toLowerCase().startsWith(q) && f.name.toLowerCase().includes(q),
  );
  return [...startsWith, ...contains].slice(0, 8);
}

export function searchBases(
  query: string,
  bases: { id: string; name: string }[],
): { id: string; name: string }[] {
  if (!query) return bases.slice(0, 8);
  const q = query.toLowerCase();
  const startsWith = bases.filter((r) => r.name.toLowerCase().startsWith(q));
  const contains = bases.filter(
    (r) => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q),
  );
  return [...startsWith, ...contains].slice(0, 8);
}
