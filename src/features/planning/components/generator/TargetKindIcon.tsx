import { BookOpen, Boxes, Carrot, Drumstick, ListChecks, Tags, Type, UtensilsCrossed } from "lucide-react";
import { HabitTargetKind } from "../../../../core/logic/menuGenerator/habitLogic";

export interface TargetKindIconProps {
  kind: HabitTargetKind;
  size?: number;
}

const ICONS = {
  protein: Drumstick,
  category: Tags,
  food: Carrot,
  family: Boxes,
  list: ListChecks,
  name: Type,
  recipe: BookOpen,
  noMeal: UtensilsCrossed,
} as const;

export const TargetKindIcon = ({ kind, size = 14 }: TargetKindIconProps) => {
  const Icon = ICONS[kind];
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-slate-500">
      <Icon size={size} />
    </span>
  );
};
