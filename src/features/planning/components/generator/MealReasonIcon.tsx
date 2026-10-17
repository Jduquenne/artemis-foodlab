import { AlertTriangle, Ban, CalendarCheck, CalendarClock, Flame, History, Leaf, Recycle, Repeat, Scale, Snowflake, Sparkles } from "lucide-react";
import { MealReasonKind } from "../../../../core/domain/menuGenerator";

export interface MealReasonIconProps {
  kind: MealReasonKind;
  size?: number;
}

export const MealReasonIcon = ({ kind, size = 12 }: MealReasonIconProps) => {
  switch (kind) {
    case "season":
      return <Leaf size={size} className="shrink-0 text-green-600" />;
    case "offSeason":
      return <AlertTriangle size={size} className="shrink-0 text-amber-500" />;
    case "freezer":
      return <Snowflake size={size} className="shrink-0 text-sky-500" />;
    case "preferred":
      return <Recycle size={size} className="shrink-0 text-green-600" />;
    case "habit":
      return <CalendarClock size={size} className="shrink-0 text-violet-500" />;
    case "quota":
      return <Scale size={size} className="shrink-0 text-violet-500" />;
    case "recent":
      return <History size={size} className="shrink-0 text-amber-500" />;
    case "repeat":
      return <Repeat size={size} className="shrink-0 text-amber-500" />;
    case "kcal":
      return <Flame size={size} className="shrink-0 text-orange-500" />;
    case "history":
      return <Sparkles size={size} className="shrink-0 text-slate-400" />;
    case "empty":
      return <Ban size={size} className="shrink-0 text-red-400" />;
    case "kept":
      return <CalendarCheck size={size} className="shrink-0 text-slate-400" />;
  }
};
