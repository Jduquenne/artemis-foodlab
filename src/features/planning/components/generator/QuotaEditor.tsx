import { useState } from "react";
import { FoodList, QuotaStrictness, WeeklyQuota } from "../../../../core/domain/menuGenerator";
import { HABIT_TARGET_KIND_LABELS, HabitTargetKind, defaultHabitTarget } from "../../../../core/logic/menuGenerator/habitLogic";
import {
  MAX_QUOTA_COUNT,
  QUOTA_MODE_LABELS,
  QUOTA_STRICTNESS_LABELS,
  QuotaMode,
  quotaMode,
  supportsDistinctFoods,
  validateQuota,
  withQuotaMode,
} from "../../../../core/logic/menuGenerator/quotaLogic";
import { ChoicePills } from "./ChoicePills";
import { HabitTargetField } from "./HabitTargetField";
import { NumberStepper } from "./NumberStepper";
import { SettingsSection } from "./SettingsSection";

export interface QuotaEditorProps {
  initial: WeeklyQuota;
  lists: readonly FoodList[];
  disabled: boolean;
  onSave: (quota: WeeklyQuota) => void;
  onCancel: () => void;
}

const KIND_OPTIONS = (Object.keys(HABIT_TARGET_KIND_LABELS) as HabitTargetKind[])
  .filter((id) => id !== "noMeal")
  .map((id) => ({ id, label: HABIT_TARGET_KIND_LABELS[id] }));
const MODE_OPTIONS = (Object.keys(QUOTA_MODE_LABELS) as QuotaMode[]).map((id) => ({ id, label: QUOTA_MODE_LABELS[id] }));
const STRICTNESS_OPTIONS = (Object.keys(QUOTA_STRICTNESS_LABELS) as QuotaStrictness[]).map((id) => ({ id, label: QUOTA_STRICTNESS_LABELS[id] }));

export const QuotaEditor = ({ initial, lists, disabled, onSave, onCancel }: QuotaEditorProps) => {
  const [draft, setDraft] = useState<WeeklyQuota>(initial);
  const [error, setError] = useState<string | null>(null);
  const patch = (update: Partial<WeeklyQuota>) => setDraft((current) => ({ ...current, ...update }));
  const mode = quotaMode(draft);

  const save = () => {
    const problem = validateQuota(draft);
    setError(problem);
    if (!problem) onSave({ ...draft, distinctFoods: draft.distinctFoods && supportsDistinctFoods(draft.target) });
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
          lists={lists}
          disabled={disabled}
          onChange={(target) => {
            if (target.kind !== "noMeal") patch({ target });
          }}
        />
      </SettingsSection>

      <SettingsSection title="Combien par semaine">
        <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === mode} onToggle={(next) => setDraft((current) => withQuotaMode(current, next))} disabled={disabled} />
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {draft.min !== null && (
            <>
              {mode === "between" && <span>de</span>}
              <NumberStepper value={draft.min} min={0} max={MAX_QUOTA_COUNT} step={1} disabled={disabled} onChange={(min) => patch({ min })} />
            </>
          )}
          {draft.max !== null && (
            <>
              {mode === "between" && <span>à</span>}
              <NumberStepper value={draft.max} min={0} max={MAX_QUOTA_COUNT} step={1} disabled={disabled} onChange={(max) => patch({ max })} />
            </>
          )}
          <span>repas</span>
        </div>
      </SettingsSection>

      <SettingsSection title="Options">
        {supportsDistinctFoods(draft.target) && (
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input type="checkbox" checked={draft.distinctFoods} disabled={disabled} onChange={(e) => patch({ distinctFoods: e.target.checked })} className="accent-orange-500" />
            Pas deux fois le même aliment (ex : lentilles puis pois chiches)
          </label>
        )}
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={draft.noConsecutive} disabled={disabled} onChange={(e) => patch({ noConsecutive: e.target.checked })} className="accent-orange-500" />
          Pas deux repas de suite
        </label>
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
