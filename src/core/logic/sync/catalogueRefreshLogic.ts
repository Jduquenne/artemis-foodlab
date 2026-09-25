import { CatalogueScope } from "../../catalogue/catalogueEvents";

export type CatalogueSignatures = Partial<Record<CatalogueScope, string>>;

export function shouldRefreshCatalogue(now: number, lastSyncAt: number, minIntervalMs: number): boolean {
  return now - lastSyncAt >= minIntervalMs;
}

export function changedScopes(previous: CatalogueSignatures, next: Record<CatalogueScope, string>): CatalogueScope[] {
  const scopes = Object.keys(next) as CatalogueScope[];
  return scopes.filter((scope) => previous[scope] !== next[scope]);
}
