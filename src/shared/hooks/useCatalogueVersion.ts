import { useSyncExternalStore } from "react";
import { CatalogueScope, getCatalogueVersion, subscribeCatalogue } from "../../core/typed-db/catalogueEvents";

export function useCatalogueVersion(...scopes: CatalogueScope[]): number {
  return useSyncExternalStore(subscribeCatalogue, () => getCatalogueVersion(scopes));
}
