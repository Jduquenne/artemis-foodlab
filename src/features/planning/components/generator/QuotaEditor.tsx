import { useState } from "react";
import { QuotaComparator, QuotaStrictness, WeeklyQuota } from "../../../../core/domain/menuGenerator";
import { HABIT_TARGET_KIND_LABELS, HabitTargetKind, defaultHabitTarget } from "../../../../core/logic/menuGenerator/habitLogic";
import {
  MAX_QUOTA_COUNT,
  QUOTA_COMPARATOR_LABELS,
  QUOTA_STRICTNESS_LABELS,
  validateQuota,
} from "../../../../core/logic/menuGenerator/quotaLogic";
import { ChoicePills } from "./ChoicePills";
import { HabitTargetField } from "./HabitTargetField";
import { NumberStepper } from "./NumberStepper";
import { SettingsSection } from "./SettingsSection";

export interface QuotaEditorProps {
  initial: WeeklyQuota;
  disabled: boolean;
  onSave: (quota: WeeklyQuota) => void;
  onCancel: () => void;
}

const KIND_OPTIONS = (Object.keys(HABIT_TARGET_KIND_LABELS) as HabitTargetKind[])
  .filter((id) => id !== "noMeal")
  .map((id) => ({ id, label: HABIT_TARGET_KIND_LABELS[id] }));
const COMPARATOR_OPTIONS = (Object.keys(QUOTA_COMPARATOR_LABELS) as QuotaComparator[]).map((id) => ({ id, label: QUOTA_COMPARATOR_LABELS[id] }));
const STRICTNESS_OPTIONS = (Object.keys(QUOTA_STRICTNESS_LABELS) as QuotaStrictness[]).map((id) => ({ id, label: QUOTA_STRICTNESS_LABELS[id] }));

export const QuotaEditor = ({ initial, disabled, onSave, onCancel }: QuotaEditorProps) => {
  const [draft, setDraft] = useState<WeeklyQuota>(initial);
  const [error, setError] = useState<string | null>(null);
  const patch = (update: Partial<WeeklyQuota>) => setDraft((current) => ({ ...current, ...update }));

  const save = () => {
    const problem = validateQuota(draft);
    setError(problem);
    if (!problem) onSave(draft);
  };

  const changeKind = (kind: HabitTargetKind) => {
    if (kind === draft.target.kind) return;
    const target = defaultHabitTarget(kind);
    if (target.kind !== "noMeal") patch({ target });
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-orange-200 dark:border-orange-900 p-3">
      <SettingsSection title="Quoi">
        <ChoicePills options={KIND_OPTIONS} isActive={(kind) => kind === draft.target.kind} onToggle={changeKind} disabled={disabled} />
        <HabitTargetField
          target={draft.target}
          disabled={disabled}
          onChange={(target) => {
            if (target.kind !== "noMeal") patch({ target });
          }}
        />
      </SettingsSection>

      <SettingsSection title="Combien par semaine">
        <div className="flex flex-wrap items-center gap-2">
          <ChoicePills options={COMPARATOR_OPTIONS} isActive={(id) => id === draft.comparator} onToggle={(comparator) => patch({ comparator })} disabled={disabled} />
          <NumberStepper value={draft.count} min={0} max={MAX_QUOTA_COUNT} step={1} disabled={disabled} onChange={(count) => patch({ count })} />
        </div>
      </SettingsSection>

      <SettingsSection title="Force">
        <ChoicePills options={STRICTNESS_OPTIONS} isActive={(id) => id === draft.strictness} onToggle={(strictness) => patch({ strictness })} disabled={disabled} />
      </SettingsSection>

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
