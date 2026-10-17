import { HabitRule } from "../../../../core/domain/menuGenerator";
import {
  HABIT_STRENGTH_LABELS,
  HabitNames,
  formatHabitDays,
  habitExceptLabel,
  habitSlotsLabel,
  habitTargetLabel,
  isOneMealHabit,
} from "../../../../core/logic/menuGenerator/habitLogic";
import { RuleCard } from "./RuleCard";
import { StrengthBadge } from "./StrengthBadge";
import { TargetKindIcon } from "./TargetKindIcon";

export interface HabitRowProps {
  rule: HabitRule;
  names: HabitNames;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitRow = ({ rule, names, disabled, onToggle, onEdit, onDelete }: HabitRowProps) => (
  <RuleCard
    icon={<TargetKindIcon kind={rule.target.kind} />}
    title={`${habitTargetLabel(rule.target, names)}${habitExceptLabel(rule, names)}`}
    subtitle={`${formatHabitDays(rule.days)} · ${habitSlotsLabel(rule.slots).toLowerCase()}${isOneMealHabit(rule) ? " · un seul des repas" : ""}`}
    badge={rule.target.kind !== "noMeal" ? <StrengthBadge tone={rule.strength} label={HABIT_STRENGTH_LABELS[rule.strength]} /> : undefined}
    enabled={rule.enabled}
    disabled={disabled}
    onToggle={onToggle}
    onEdit={onEdit}
    onDelete={onDelete}
  />
);
