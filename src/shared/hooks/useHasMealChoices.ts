import { useMemo } from "react";
import { accompanimentsFor } from "../../core/logic/accompaniment/accompanimentLogic";
import { useAccompanimentStore } from "../store/useAccompanimentStore";
import { useGroupIngredients } from "./useGroupIngredients";

export function useHasAccompaniment(recipeId: string | undefined): boolean {
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  return useMemo(() => (recipeId ? accompanimentsFor(recipeId, accompaniments).length > 0 : false), [recipeId, accompaniments]);
}

export function useHasMealChoices(recipeId: string | undefined): boolean {
  const hasAccompaniment = useHasAccompaniment(recipeId);
  return useGroupIngredients(recipeId).length > 0 || hasAccompaniment;
}
