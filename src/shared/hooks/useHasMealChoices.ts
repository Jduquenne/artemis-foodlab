import { useMemo } from "react";
import { BaseVersionChoice } from "../../core/domain/baseVersion";
import { accompanimentsFor } from "../../core/logic/accompaniment/accompanimentLogic";
import { hasFrozenChoice } from "../../core/logic/baseVersion/baseVersionLogic";
import { useAccompanimentStore } from "../store/useAccompanimentStore";
import { useGroupIngredients } from "./useGroupIngredients";
import { useIndustrialBases } from "./useIndustrialBases";

export function useHasAccompaniment(recipeId: string | undefined): boolean {
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  return useMemo(() => (recipeId ? accompanimentsFor(recipeId, accompaniments).length > 0 : false), [recipeId, accompaniments]);
}

export function useHasMealChoices(recipeId: string | undefined, baseVersionChoices?: readonly BaseVersionChoice[]): boolean {
  const hasAccompaniment = useHasAccompaniment(recipeId);
  const hasIndustrialBase = useIndustrialBases(recipeId).length > 0;
  return useGroupIngredients(recipeId).length > 0 || hasAccompaniment || hasIndustrialBase || hasFrozenChoice(baseVersionChoices);
}
