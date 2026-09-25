export type CatalogueScope = "recipes" | "foods" | "categories" | "outdoor" | "household";

const versions: Record<CatalogueScope, number> = {
  recipes: 0,
  foods: 0,
  categories: 0,
  outdoor: 0,
  household: 0,
};

const listeners = new Set<() => void>();

export function subscribeCatalogue(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCatalogueVersion(scopes: readonly CatalogueScope[]): number {
  return scopes.reduce((sum, scope) => sum + versions[scope], 0);
}

export function notifyCatalogueChange(...scopes: CatalogueScope[]): void {
  for (const scope of new Set(scopes)) versions[scope] += 1;
  for (const listener of [...listeners]) listener();
}
