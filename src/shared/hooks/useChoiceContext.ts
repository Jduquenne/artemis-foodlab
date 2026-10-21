import { useMemo } from "react";
import { ChoiceContext } from "../../core/logic/accompaniment/accompanimentLogic";
import { useAccompanimentStore } from "../store/useAccompanimentStore";
import { useProfileStore } from "../store/useProfileStore";

export function useChoiceContext(): ChoiceContext {
  const accompaniments = useAccompanimentStore((s) => s.accompaniments);
  const profiles = useProfileStore((s) => s.profiles);
  return useMemo(() => ({ accompaniments, profiles }), [accompaniments, profiles]);
}
