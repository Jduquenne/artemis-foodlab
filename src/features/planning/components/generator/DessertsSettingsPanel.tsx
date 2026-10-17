import { CakeSlice } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { dessertPickLabel, emptyDessertRule } from "../../../../core/logic/menuGenerator/dessertLogic";
import { formatHabitDays, habitSlotsLabel } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useHabitNames } from "../../../../shared/hooks/useHabitNames";
import { DessertRuleEditor } from "./DessertRuleEditor";
import { RuleCard } from "./RuleCard";
import { RuleListPanel } from "./RuleListPanel";

export interface DessertsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const DessertsSettingsPanel = ({ settings, disabled, onPatch }: DessertsSettingsPanelProps) => {
  const names = useHabitNames(settings.foodLists);
  const rules = settings.dessertRules;

  return (
    <RuleListPanel
      icon={CakeSlice}
      title="Desserts"
      description="Ajoutés aux repas générés et aux repas déjà prévus qui n'en ont aucun. Si plusieurs règles visent un même repas, la première s'applique."
      emptyText="Aucune règle. Ex : « Fruit de saison + chocolat 85 % au déjeuner », « Skyr + chocolat 74 % au dîner »."
      items={rules}
      createItem={() => emptyDessertRule(crypto.randomUUID())}
      editorTitle={(_, isNew) => (isNew ? "Nouvelle règle de desserts" : "Modifier la règle")}
      disabled={disabled}
      onSave={(rule) => onPatch({ dessertRules: upsertById(rules, rule) })}
      renderRow={(rule, actions) => (
        <RuleCard
          key={rule.id}
          icon={(
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500 dark:bg-pink-900/20">
              <CakeSlice size={14} />
            </span>
          )}
          title={rule.items.map((item) => dessertPickLabel(item, names)).join(" + ")}
          subtitle={`${formatHabitDays(rule.days)} · ${habitSlotsLabel(rule.slots).toLowerCase()}`}
          enabled={rule.enabled}
          disabled={actions.disabled}
          onToggle={(enabled) => onPatch({ dessertRules: setEnabledById(rules, rule.id, enabled) })}
          onEdit={actions.onEdit}
          onDelete={() => onPatch({ dessertRules: removeById(rules, rule.id) })}
        />
      )}
      renderEditor={(rule, actions) => (
        <DessertRuleEditor key={rule.id} initial={rule} lists={settings.foodLists} disabled={disabled} onSave={actions.onSave} onCancel={actions.onCancel} />
      )}
    />
  );
};
