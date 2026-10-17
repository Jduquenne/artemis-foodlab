import { GENERATED_SLOT_LABELS, GeneratedMeal } from "../../../../core/domain/menuGenerator";
import { formatSourceDayFull } from "../../../../core/utils/dateUtils";
import { MealReasonIcon } from "./MealReasonIcon";

export interface GeneratedMealDetailProps {
  meal: GeneratedMeal | null;
  recipeName: string | null;
}

export const GeneratedMealDetail = ({ meal, recipeName }: GeneratedMealDetailProps) => {
  if (!meal || meal.kept) {
    return <p className="text-[11px] text-slate-400">Touche un repas pour voir pourquoi il est proposé.</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-bold text-orange-600">
        {formatSourceDayFull(meal.day.date)} · {GENERATED_SLOT_LABELS[meal.slot]}
      </p>
      <p className="text-sm font-semibold text-slate-800">{recipeName ?? "Aucune recette"}</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {meal.reasons.map((reason) => (
          <li key={`${reason.kind}-${reason.label}`} className="flex items-center gap-1 text-[11px] text-slate-500">
            <MealReasonIcon kind={reason.kind} />
            {reason.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
