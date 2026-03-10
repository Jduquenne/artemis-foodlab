import { Flame, Dumbbell } from "lucide-react";
import { MealSlot, Macronutrients } from "../../../core/domain/types";
import { RECIPE_MACROS } from "../../../core/utils/macroUtils";

export interface NutrientHighlightsProps {
  slots: MealSlot[];
}

const SLOT_LABELS: Record<string, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};

const ZERO: Macronutrients = { kcal: 0, proteins: 0, lipids: 0, carbohydrates: 0, fibers: 0 };

function getSlotMacros(slot: MealSlot): Macronutrients {
  return [...slot.recipeIds, ...(slot.dessertIds ?? [])].reduce((sum, id) => {
    const m = RECIPE_MACROS[id];
    if (!m) return sum;
    return {
      kcal: sum.kcal + m.kcal,
      proteins: sum.proteins + m.proteins,
      lipids: sum.lipids + m.lipids,
      carbohydrates: sum.carbohydrates + m.carbohydrates,
      fibers: sum.fibers + m.fibers,
    };
  }, { ...ZERO });
}

export const NutrientHighlights = ({ slots }: NutrientHighlightsProps) => {
  const filledSlots = slots.filter((s) => s.recipeIds.length > 0);
  if (filledSlots.length === 0) return null;

  const slotMacros = filledSlots.map((s) => ({ slot: s, macros: getSlotMacros(s) }));
  const mostKcal = slotMacros.reduce((a, b) => (b.macros.kcal > a.macros.kcal ? b : a));
  const mostProtein = slotMacros.reduce((a, b) => (b.macros.proteins > a.macros.proteins ? b : a));

  return (
    <div className="grid grid-cols-2 gap-2 shrink-0">
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl px-3 py-2 flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] text-orange-600 font-semibold leading-none mb-0.5">
            Plus calorique
          </p>
          <p className="text-xs font-bold text-slate-800 truncate leading-tight">
            {SLOT_LABELS[mostKcal.slot.slot]}
          </p>
          <p className="text-[10px] text-slate-400">{Math.round(mostKcal.macros.kcal)} kcal</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
        <Dumbbell className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] text-slate-500 font-semibold leading-none mb-0.5">
            Riche en protéines
          </p>
          <p className="text-xs font-bold text-slate-800 truncate leading-tight">
            {SLOT_LABELS[mostProtein.slot.slot]}
          </p>
          <p className="text-[10px] text-slate-400">{Math.round(mostProtein.macros.proteins)}g prot.</p>
        </div>
      </div>
    </div>
  );
};
