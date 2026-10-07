import { useMemo } from "react";
import { NUTRIENT_DEFINITIONS } from "../../../../core/domain/nutrition";
import { MealSlot, SlotType } from "../../../../core/domain/planning";
import { getAllRecipeIds, hasDesserts } from "../../../../core/domain/recipePredicates";
import { computeSlotMacros, ZERO } from "../../../../shared/utils/macroUtils";
import { useMacroCatalogue } from "../../../../shared/hooks/useMacroCatalogue";
import { useActiveJournalOverrides } from "../../../../shared/hooks/useActiveJournalOverrides";
import { SLOT_LABELS } from "../../../../shared/utils/slotLabels";
import { markScrolling } from "../../../../shared/utils/scrollGuard";
import { RecipePortionRow } from "./RecipePortionRow";

export interface MealSlotCardProps {
  slotType: SlotType;
  slot?: MealSlot;
}

export const MealSlotCard = ({ slotType, slot }: MealSlotCardProps) => {
  const { portionOverrides, gramOverrides, ingredientOverrides } = useActiveJournalOverrides();
  const catalogue = useMacroCatalogue();

  const allIds = slot ? getAllRecipeIds(slot) : [];
  const totalMacros = useMemo(
    () => (slot ? computeSlotMacros(catalogue, slot, portionOverrides, gramOverrides, ingredientOverrides) : { ...ZERO }),
    [catalogue, slot, portionOverrides, gramOverrides, ingredientOverrides],
  );

  const hasContent = allIds.length > 0;

  return (
    <div className="bg-surface rounded-2xl p-3 flex flex-col gap-1.5 h-full min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
          {SLOT_LABELS[slotType]}
        </span>
        {hasContent && (
          <span className="text-xs font-bold text-orange-500">
            {Math.round(totalMacros.kcal)} kcal
          </span>
        )}
      </div>

      {hasContent && (
        <div className="flex gap-1 shrink-0">
          {NUTRIENT_DEFINITIONS.map(({ key, shortLabel }) => (
            <div key={key} className="flex-1 bg-subtle rounded-lg px-1.5 py-1 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400 leading-none">{shortLabel}</span>
              <span className="text-[10px] font-bold text-slate-600 leading-none tabular-nums">{Math.round(totalMacros[key])}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto" onScroll={markScrolling}>
        {hasContent ? (
          <div className="flex flex-col">
            {slot?.recipeIds.map((id) => (
              <RecipePortionRow key={id} recipeId={id} planningSlotItemId={slot.itemApiIds?.[id]} />
            ))}

            {slot && hasDesserts(slot) && (
              <>
                <div className="my-1 border-t border-dashed border-slate-100" />
                {(slot.dessertIds ?? []).map((id) => (
                  <RecipePortionRow key={id} recipeId={id} planningSlotItemId={slot.itemApiIds?.[id]} />
                ))}
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Non planifié</p>
        )}
      </div>
    </div>
  );
};
