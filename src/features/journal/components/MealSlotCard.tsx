import { MealSlot } from "../../../core/domain/types";
import { RECIPE_MACROS } from "../../../core/utils/macroUtils";
import { useJournalStore } from "../../../shared/store/useJournalStore";
import { RecipePortionRow } from "./RecipePortionRow";

export interface MealSlotCardProps {
  slotType: string;
  slot?: MealSlot;
}

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Petit-déj",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

export const MealSlotCard = ({ slotType, slot }: MealSlotCardProps) => {
  const { portionOverrides } = useJournalStore();

  const allIds = slot ? [...slot.recipeIds, ...(slot.dessertIds ?? [])] : [];
  const totalKcal = allIds.reduce((sum, id) => {
    const portions = portionOverrides[`${slot!.id}-${id}`] ?? 1;
    return sum + (RECIPE_MACROS[id]?.kcal ?? 0) * portions;
  }, 0);

  const hasContent = allIds.length > 0;

  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl p-3 flex flex-col gap-1.5 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
          {SLOT_LABELS[slotType]}
        </span>
        {hasContent && (
          <span className="text-xs font-bold text-orange-500">
            {Math.round(totalKcal)} kcal
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {hasContent ? (
          <div className="flex flex-col">
            {slot?.recipeIds.map((id) => (
              <RecipePortionRow key={id} recipeId={id} slotId={slot.id} />
            ))}

            {(slot?.dessertIds?.length ?? 0) > 0 && (
              <>
                <div className="my-1 border-t border-dashed border-slate-100" />
                {slot!.dessertIds!.map((id) => (
                  <RecipePortionRow key={id} recipeId={id} slotId={slot!.id} />
                ))}
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-300 italic">Non planifié</p>
        )}
      </div>
    </div>
  );
};
