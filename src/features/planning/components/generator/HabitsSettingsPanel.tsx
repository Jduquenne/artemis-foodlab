import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { HabitRule, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { emptyHabit } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useCategoriesSnapshot, useFoodsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { HabitEditor } from "./HabitEditor";
import { HabitRow } from "./HabitRow";

export interface HabitsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const HabitsSettingsPanel = ({ settings, disabled, onPatch }: HabitsSettingsPanelProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const categories = useCategoriesSnapshot();
  const names = useMemo(
    () => ({ catalogue: { recipes, foods }, categoryNames: Object.fromEntries(categories.map((category) => [category.id, category.name])) }),
    [recipes, foods, categories],
  );
  const [editing, setEditing] = useState<HabitRule | null>(null);

  const save = (rule: HabitRule) => {
    onPatch({ habits: upsertById(settings.habits, rule) });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400">Tes règles par jour et par repas. « Obligatoire » et « Interdit » ne sont jamais contournés.</p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(emptyHabit(crypto.randomUUID()))}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>

      {editing && !settings.habits.some((rule) => rule.id === editing.id) && (
        <HabitEditor key={editing.id} initial={editing} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {settings.habits.map((rule) =>
        editing?.id === rule.id ? (
          <HabitEditor key={rule.id} initial={rule} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <HabitRow
            key={rule.id}
            rule={rule}
            names={names}
            disabled={disabled || editing !== null}
            onToggle={(enabled) => onPatch({ habits: setEnabledById(settings.habits, rule.id, enabled) })}
            onEdit={() => setEditing(rule)}
            onDelete={() => onPatch({ habits: removeById(settings.habits, rule.id) })}
          />
        ),
      )}

      {settings.habits.length === 0 && !editing && (
        <p className="text-xs text-slate-400 text-center py-4">Aucune habitude pour l'instant.</p>
      )}
    </div>
  );
};
