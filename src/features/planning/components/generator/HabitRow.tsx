import { Pencil, Trash2 } from "lucide-react";
import { HabitRule } from "../../../../core/domain/menuGenerator";
import {
  HABIT_STRENGTH_LABELS,
  HabitNames,
  formatHabitDays,
  habitSlotsLabel,
  habitTargetLabel,
} from "../../../../core/logic/menuGenerator/habitLogic";

export interface HabitRowProps {
  rule: HabitRule;
  names: HabitNames;
  disabled: boolean;
  onToggle: (enabled: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitRow = ({ rule, names, disabled, onToggle, onEdit, onDelete }: HabitRowProps) => (
  <div className={`flex items-start gap-2 rounded-xl border border-slate-200 px-2.5 py-2 ${rule.enabled ? "" : "opacity-50"}`}>
    <input
      type="checkbox"
      checked={rule.enabled}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
      aria-label={rule.enabled ? "Désactiver l'habitude" : "Activer l'habitude"}
      className="mt-0.5 accent-orange-500"
    />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-800">
        {habitTargetLabel(rule.target, names)}
        {rule.target.kind !== "noMeal" && <span className="ml-1.5 font-semibold text-orange-600">{HABIT_STRENGTH_LABELS[rule.strength]}</span>}
      </p>
      <p className="text-[11px] text-slate-500 first-letter:uppercase">
        {formatHabitDays(rule.days)} · {habitSlotsLabel(rule.slots).toLowerCase()}
      </p>
    </div>
    <button type="button" onClick={onEdit} disabled={disabled} aria-label="Modifier l'habitude" className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted disabled:opacity-50">
      <Pencil size={13} />
    </button>
    <button type="button" onClick={onDelete} disabled={disabled} aria-label="Supprimer l'habitude" className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-50">
      <Trash2 size={13} />
    </button>
  </div>
);
