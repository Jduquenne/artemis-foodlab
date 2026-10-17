import { useState } from "react";
import { FoodList, GENERATED_SLOTS, GENERATED_SLOT_LABELS, HabitRule, HabitScope, HabitStrength } from "../../../../core/domain/menuGenerator";
import { DAYS } from "../../../../core/domain/planningConfig";
import { toggleGeneratedSlot } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import {
  HABIT_SCOPE_LABELS,
  HABIT_STRENGTH_LABELS,
  HABIT_TARGET_KIND_LABELS,
  HabitTargetKind,
  defaultHabitTarget,
  habitDayRange,
  toggleHabitDay,
  validateHabit,
} from "../../../../core/logic/menuGenerator/habitLogic";
import { ChoicePills } from "./ChoicePills";
import { FoodChipsField } from "./FoodChipsField";
import { HabitTargetField } from "./HabitTargetField";
import { SettingsSection } from "./SettingsSection";

export interface HabitEditorProps {
  initial: HabitRule;
  lists: readonly FoodList[];
  disabled: boolean;
  onSave: (rule: HabitRule) => void;
  onCancel: () => void;
}

const DAY_OPTIONS = DAYS.map((day) => ({ id: day, label: day.slice(0, 3) }));
const SLOT_OPTIONS = GENERATED_SLOTS.map((slot) => ({ id: slot, label: GENERATED_SLOT_LABELS[slot] }));
const KIND_OPTIONS = (Object.keys(HABIT_TARGET_KIND_LABELS) as HabitTargetKind[]).map((id) => ({ id, label: HABIT_TARGET_KIND_LABELS[id] }));
const STRENGTH_OPTIONS = (Object.keys(HABIT_STRENGTH_LABELS) as HabitStrength[]).map((id) => ({ id, label: HABIT_STRENGTH_LABELS[id] }));
const SCOPE_OPTIONS = (Object.keys(HABIT_SCOPE_LABELS) as HabitScope[]).map((id) => ({ id, label: HABIT_SCOPE_LABELS[id] }));

const SELECT_CLASS =
  "flex-1 min-w-0 px-2 py-1.5 bg-surface border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-orange-400 disabled:opacity-50";

export const HabitEditor = ({ initial, lists, disabled, onSave, onCancel }: HabitEditorProps) => {
  const [draft, setDraft] = useState<HabitRule>(initial);
  const [rangeFrom, setRangeFrom] = useState<string>(DAYS[0]);
  const [rangeTo, setRangeTo] = useState<string>(DAYS[3]);
  const [error, setError] = useState<string | null>(null);
  const patch = (update: Partial<HabitRule>) => setDraft((current) => ({ ...current, ...update }));

  const save = () => {
    const problem = validateHabit(draft);
    setError(problem);
    if (!problem) onSave(draft);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-200 dark:border-orange-900 p-3">
      <SettingsSection title="Jours">
        <ChoicePills options={DAY_OPTIONS} isActive={(day) => draft.days.includes(day)} onToggle={(day) => patch({ days: toggleHabitDay(draft.days, day) })} disabled={disabled} />
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Du</span>
          <select value={rangeFrom} disabled={disabled} onChange={(e) => setRangeFrom(e.target.value)} className={SELECT_CLASS} aria-label="Premier jour">
            {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
          </select>
          <span>au</span>
          <select value={rangeTo} disabled={disabled} onChange={(e) => setRangeTo(e.target.value)} className={SELECT_CLASS} aria-label="Dernier jour">
            {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
          </select>
          <button
            type="button"
            disabled={disabled}
            onClick={() => patch({ days: habitDayRange(rangeFrom, rangeTo) })}
            className="px-2 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-600 hover:bg-muted disabled:opacity-50"
          >
            Appliquer
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Repas">
        <ChoicePills options={SLOT_OPTIONS} isActive={(slot) => draft.slots.includes(slot)} onToggle={(slot) => patch({ slots: toggleGeneratedSlot(draft.slots, slot) })} disabled={disabled} />
      </SettingsSection>

      <SettingsSection title="Quoi">
        <ChoicePills
          options={KIND_OPTIONS}
          isActive={(kind) => kind === draft.target.kind}
          onToggle={(kind) => patch({ target: kind === draft.target.kind ? draft.target : defaultHabitTarget(kind) })}
          disabled={disabled}
        />
        <HabitTargetField target={draft.target} lists={lists} disabled={disabled} onChange={(target) => patch({ target })} />
      </SettingsSection>

      {draft.target.kind !== "noMeal" && draft.target.kind !== "recipe" && (
        <SettingsSection title="Sauf si la recette contient" hint="Ex : « Viande » sauf Jambon. Laisser vide si aucune exception.">
          <FoodChipsField
            foodIds={draft.exceptFoodIds}
            separator="ou"
            placeholder="Ex : jambon…"
            disabled={disabled}
            onChange={(exceptFoodIds) => patch({ exceptFoodIds })}
          />
        </SettingsSection>
      )}

      {draft.target.kind !== "noMeal" && (
        <SettingsSection title="Force">
          <ChoicePills options={STRENGTH_OPTIONS} isActive={(id) => id === draft.strength} onToggle={(strength) => patch({ strength })} disabled={disabled} />
        </SettingsSection>
      )}

      {draft.target.kind !== "noMeal" && draft.slots.length > 1 && (draft.strength === "mandatory" || draft.strength === "preferred") && (
        <SettingsSection title="S'applique à" hint="« Un seul des repas du jour » : le déjeuner ou le dîner, tiré au hasard, suffit.">
          <ChoicePills options={SCOPE_OPTIONS} isActive={(id) => id === draft.scope} onToggle={(scope) => patch({ scope })} disabled={disabled} />
        </SettingsSection>
      )}

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={disabled} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-muted disabled:opacity-50">
          Annuler
        </button>
        <button type="button" onClick={save} disabled={disabled} className="px-3 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50">
          Enregistrer
        </button>
      </div>
    </div>
  );
};
