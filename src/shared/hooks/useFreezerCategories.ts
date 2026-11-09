import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { FreezerCategory } from "../../core/domain/freezer";
import { getCategories } from "../../core/services/freezerService";

export function useFreezerCategories(): FreezerCategory[] {
  const categories = useLiveQuery(() => getCategories(), []);
  return useMemo(() => categories ?? [], [categories]);
}
