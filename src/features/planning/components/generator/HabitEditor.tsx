import { useState } from "react";
import { FoodList, GENERATED_SLOTS, GENERATED_SLOT_LABELS, HabitRule, HabitScope, HabitStrength } from "../../../../core/domain/menuGenerator";
import { toggleGeneratedSlot } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import {
  HABIT_SCOPE_LABELS,
  HABIT_STRENGTH_LABELS,
  HABIT_TARGET_KIND_LABELS,
  HabitTargetKind,
  defaultHabitTarget,
  validateHabit,
} from "../../../../core/logic/menuGenerator/habitLogic";
import { ChoicePills } from "./ChoicePills";
import { DaysField } from "./DaysField";
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

const SLOT_OPTIONS = GENERATED_SLOTS.map((slot) => ({ id: slot, label: GENERATED_SLOT_LABELS[slot] }));
const KIND_OPTIONS = (Object.keys(HABIT_TARGET_KIND_LABELS) as HabitTargetKind[]).map((id) => ({ id, label: HABIT_TARGET_KIND_LABELS[id] }));
const STRENGTH_OPTIONS = (Object.keys(HABIT_STRENGTH_LABELS) as HabitStrength[]).map((id) => ({ id, label: HABIT_STRENGTH_LABELS[id] }));
const SCOPE_OPTIONS = (Object.keys(HABIT_SCOPE_LABELS) as HabitScope[]).map((id) => ({ id, label: HABIT_SCOPE_LABELS[id] }));

export const HabitEditor = ({ initial, lists, disabled, onSave, onCancel }: HabitEditorProps) => {
  const [draft, setDraft] = useState<HabitRule>(initial);
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
        <DaysField days={draft.days} disabled={disabled} onChange={(days) => patch({ days })} />
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
