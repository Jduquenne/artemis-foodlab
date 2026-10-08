import { useState } from "react";
import { CopyState, MealSlot, SlotType } from "../../core/domain/planning";
import { buildCopiedSlot, copyTargetKey, parseCopyTargetKey } from "../../core/logic/planning/planningCopyLogic";
import { saveSlot } from "../../core/services/planningService";
import { usePlannableSnapshot } from "./useCatalogueSnapshot";

export function usePlanningCopy(planningData: MealSlot[], year: number, week: number) {
  const plannable = usePlannableSnapshot();
  const [copyState, setCopyState] = useState<CopyState | null>(null);
  const [copyTargets, setCopyTargets] = useState<Set<string>>(new Set());
  const [isCopying, setIsCopying] = useState(false);

  const start = (recipeId: string, slotType: SlotType, sourceDay: string, isDessert: boolean) => {
    const sourceSlot = planningData.find((p) => p.day === sourceDay && p.slot === slotType);
    setCopyState({
      recipeId,
      slotType,
      sourceDay,
      isDessert,
      recipeName: plannable[recipeId]?.name ?? "",
      sourcePersons: sourceSlot?.recipePersons?.[recipeId],
    });
    setCopyTargets(new Set());
  };

  const toggleTarget = (day: string, slotType: SlotType) => {
    const key = copyTargetKey(day, slotType);
    setCopyTargets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyToTargets = async (copy: CopyState) => {
    for (const key of copyTargets) {
      const target = parseCopyTargetKey(key);
      if (!target) continue;
      const existing = planningData.find((p) => p.day === target.day && p.slot === target.slot);
      const next = buildCopiedSlot(existing, { year, week, ...target }, copy);
      if (next) await saveSlot(next);
    }
  };

  const cancel = () => {
    setCopyState(null);
    setCopyTargets(new Set());
  };

  const confirm = async () => {
    if (!copyState || isCopying) return;
    setIsCopying(true);
    const ok = await copyToTargets(copyState).then(() => true).catch(() => false);
    setIsCopying(false);
    if (ok) cancel();
  };

  return { copyState, copyTargets, isCopying, start, toggleTarget, confirm, cancel };
}
