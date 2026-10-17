import { CalendarClock } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { emptyHabit } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useHabitNames } from "../../../../shared/hooks/useHabitNames";
import { HabitEditor } from "./HabitEditor";
import { HabitRow } from "./HabitRow";
import { RuleListPanel } from "./RuleListPanel";

export interface HabitsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const HabitsSettingsPanel = ({ settings, disabled, onPatch }: HabitsSettingsPanelProps) => {
  const names = useHabitNames(settings.foodLists);

  return (
    <RuleListPanel
      icon={CalendarClock}
      title="Habitudes"
      description="Tes règles par jour et par repas. « Obligatoire » et « Interdit » ne sont jamais contournés."
      emptyText="Aucune habitude. Ex : « Poisson le vendredi, un des repas » ou « Pas de repas du lundi au jeudi midi »."
      items={settings.habits}
      createItem={() => emptyHabit(crypto.randomUUID())}
      editorTitle={(_, isNew) => (isNew ? "Nouvelle habitude" : "Modifier l'habitude")}
      disabled={disabled}
      onSave={(rule) => onPatch({ habits: upsertById(settings.habits, rule) })}
      renderRow={(rule, actions) => (
        <HabitRow
          key={rule.id}
          rule={rule}
          names={names}
          disabled={actions.disabled}
          onToggle={(enabled) => onPatch({ habits: setEnabledById(settings.habits, rule.id, enabled) })}
          onEdit={actions.onEdit}
          onDelete={() => onPatch({ habits: removeById(settings.habits, rule.id) })}
        />
      )}
      renderEditor={(rule, actions) => (
        <HabitEditor key={rule.id} initial={rule} lists={settings.foodLists} disabled={disabled} onSave={actions.onSave} onCancel={actions.onCancel} />
      )}
    />
  );
};
