import { Macronutrients, MealSlot, RecipeKind, SlotType } from "../../../../core/domain/types";
import { getAllRecipeIds, hasDesserts } from "../../../../core/domain/recipePredicates";
import { RECIPE_BASE_GRAMS, RECIPE_MACROS, ZERO } from "../../../../core/utils/macroUtils";
import { useJournalStore } from "../../../../shared/store/useJournalStore";
import { typedRecipesDb } from "../../../../core/typed-db/typedRecipesDb";
import { SLOT_LABELS } from "../../../../shared/utils/slotLabels";
import { RecipePortionRow } from "./RecipePortionRow";

export interface MealSlotCardProps {
  slotType: SlotType;
  slot?: MealSlot;
}

const MACRO_ITEMS: { key: keyof Omit<Macronutrients, "kcal">; label: string }[] = [
  { key: "proteins", label: "Prot" },
  { key: "lipids", label: "Lip" },
  { key: "carbohydrates", label: "Glu" },
  { key: "fibers", label: "Fib" },
];

export const MealSlotCard = ({ slotType, slot }: MealSlotCardProps) => {
  const { portionOverrides, gramOverrides } = useJournalStore();

  const allIds = slot ? getAllRecipeIds(slot) : [];
  const totalMacros = allIds.reduce((sum, id) => {
    const key = `${slot!.id}-${id}`;
    const recipe = typedRecipesDb[id];
    const baseGrams = RECIPE_BASE_GRAMS[id] ?? 0;
    const m = RECIPE_MACROS[id];
    if (!m) return sum;
    let factor: number;
    if (recipe?.kind === RecipeKind.INGREDIENT && baseGrams > 0) {
      const grams = gramOverrides[key] ?? Math.round(baseGrams);
      factor = grams / baseGrams;
    } else {
      factor = portionOverrides[key] ?? 1;
    }
    return {
      kcal: sum.kcal + m.kcal * factor,
      proteins: sum.proteins + m.proteins * factor,
      lipids: sum.lipids + m.lipids * factor,
      carbohydrates: sum.carbohydrates + m.carbohydrates * factor,
      fibers: sum.fibers + m.fibers * factor,
    };
  }, { ...ZERO });

  const hasContent = allIds.length > 0;

  return (
    <div className="bg-white dark:bg-slate-100 rounded-2xl p-3 flex flex-col gap-1.5 min-h-0">
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
          {MACRO_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex-1 bg-slate-50 dark:bg-slate-200 rounded-lg px-1.5 py-1 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400 leading-none">{label}</span>
              <span className="text-[10px] font-bold text-slate-600 leading-none tabular-nums">{Math.round(totalMacros[key])}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {hasContent ? (
          <div className="flex flex-col">
            {slot?.recipeIds.map((id) => (
              <RecipePortionRow key={id} recipeId={id} slotId={slot.id} />
            ))}

            {slot && hasDesserts(slot) && (
              <>
                <div className="my-1 border-t border-dashed border-slate-100" />
                {(slot.dessertIds ?? []).map((id) => (
                  <RecipePortionRow key={id} recipeId={id} slotId={slot.id} />
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
