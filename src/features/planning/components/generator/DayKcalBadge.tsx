import { NUTRIENT_KEYS } from "../../../../core/domain/menuGenerator";
import { NUTRIENT_LABELS } from "../../../../core/logic/menuGenerator/dayNutritionLogic";
import { DayKcalSummary } from "../../../../core/logic/menuGenerator/menuPreviewLogic";

export interface DayKcalBadgeProps {
  summary: DayKcalSummary;
}

export const DayKcalBadge = ({ summary }: DayKcalBadgeProps) => {
  const { kcal, target, onTarget, nutrition } = summary;

  if (nutrition) {
    return (
      <span className="inline-flex flex-wrap justify-center gap-x-1.5 text-[11px] font-semibold leading-tight">
        {NUTRIENT_KEYS.map((key) => (
          <span key={key} className={nutrition.out.includes(key) ? "text-orange-500" : "text-green-600"}>
            {Math.round(nutrition.total[key])}
            <span className="font-normal text-slate-400"> {key === "kcal" ? "kcal" : NUTRIENT_LABELS[key].short}</span>
          </span>
        ))}
      </span>
    );
  }

  const tone = onTarget === null ? "text-slate-500" : onTarget ? "text-green-600" : "text-orange-500";
  return (
    <span className="text-[11px] font-semibold leading-tight">
      <span className={tone}>{kcal !== null ? `${kcal} kcal` : "—"}</span>
      {target !== null && <span className="text-slate-400"> / {target}</span>}
    </span>
  );
};
