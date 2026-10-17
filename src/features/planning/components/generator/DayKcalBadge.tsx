import { DayKcalSummary } from "../../../../core/logic/menuGenerator/menuPreviewLogic";

export interface DayKcalBadgeProps {
  summary: DayKcalSummary;
}

export const DayKcalBadge = ({ summary }: DayKcalBadgeProps) => {
  const { kcal, target, onTarget } = summary;
  const tone = onTarget === null ? "text-slate-500" : onTarget ? "text-green-600" : "text-orange-500";

  return (
    <span className="text-[11px] font-semibold leading-tight">
      <span className={tone}>{kcal !== null ? `${kcal} kcal` : "—"}</span>
      {target !== null && <span className="text-slate-400"> / {target}</span>}
    </span>
  );
};
