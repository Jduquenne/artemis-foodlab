import { useState } from "react";
import { Plus } from "lucide-react";
import { DessertRule, FoodList, GENERATED_SLOTS, GENERATED_SLOT_LABELS } from "../../../../core/domain/menuGenerator";
import { MAX_DESSERTS_PER_RULE, validateDessertRule } from "../../../../core/logic/menuGenerator/dessertLogic";
import { toggleGeneratedSlot } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { ChoicePills } from "./ChoicePills";
import { DaysField } from "./DaysField";
import { DessertPickField } from "./DessertPickField";
import { SettingsSection } from "./SettingsSection";

export interface DessertRuleEditorProps {
  initial: DessertRule;
  lists: readonly FoodList[];
  disabled: boolean;
  onSave: (rule: DessertRule) => void;
  onCancel: () => void;
}

const SLOT_OPTIONS = GENERATED_SLOTS.map((slot) => ({ id: slot, label: GENERATED_SLOT_LABELS[slot] }));

export const DessertRuleEditor = ({ initial, lists, disabled, onSave, onCancel }: DessertRuleEditorProps) => {
  const [draft, setDraft] = useState<DessertRule>(initial);
  const [error, setError] = useState<string | null>(null);
  const patch = (update: Partial<DessertRule>) => setDraft((current) => ({ ...current, ...update }));

  const save = () => {
    const problem = validateDessertRule(draft);
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
      <SettingsSection title="Desserts" hint={`1 à ${MAX_DESSERTS_PER_RULE} desserts par repas. Non comptés dans la nutrition.`}>
        {draft.items.map((item, index) => (
          <DessertPickField
            key={index}
            item={item}
            index={index}
            lists={lists}
            disabled={disabled}
            onChange={(next) => patch({ items: draft.items.map((current, position) => (position === index ? next : current)) })}
            onRemove={() => patch({ items: draft.items.filter((_, position) => position !== index) })}
          />
        ))}
        {draft.items.length < MAX_DESSERTS_PER_RULE && (
          <button
            type="button"
            onClick={() => patch({ items: [...draft.items, { kind: "recipe", recipeCode: "" }] })}
            disabled={disabled}
            className="self-start flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-muted disabled:opacity-50"
          >
            <Plus size={13} /> Ajouter un dessert
          </button>
        )}
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
