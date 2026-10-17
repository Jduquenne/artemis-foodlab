import { Scale } from "lucide-react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { emptyQuota } from "../../../../core/logic/menuGenerator/quotaLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useHabitNames } from "../../../../shared/hooks/useHabitNames";
import { QuotaEditor } from "./QuotaEditor";
import { QuotaRow } from "./QuotaRow";
import { RuleListPanel } from "./RuleListPanel";

export interface QuotasSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const QuotasSettingsPanel = ({ settings, disabled, onPatch }: QuotasSettingsPanelProps) => {
  const names = useHabitNames(settings.foodLists);

  return (
    <RuleListPanel
      icon={Scale}
      title="Quotas par semaine"
      description="Par bloc de 7 jours depuis le début de la période, repas déjà prévus compris. Un dernier bloc incomplet réduit « au moins » au prorata."
      emptyText="Aucun quota. Ex : « Poisson au moins 2 », « Viande rouge au plus 1 », « Poulet entre 1 et 2 »."
      items={settings.quotas}
      createItem={() => emptyQuota(crypto.randomUUID())}
      editorTitle={(_, isNew) => (isNew ? "Nouveau quota" : "Modifier le quota")}
      disabled={disabled}
      onSave={(quota) => onPatch({ quotas: upsertById(settings.quotas, quota) })}
      renderRow={(quota, actions) => (
        <QuotaRow
          key={quota.id}
          quota={quota}
          names={names}
          disabled={actions.disabled}
          onToggle={(enabled) => onPatch({ quotas: setEnabledById(settings.quotas, quota.id, enabled) })}
          onEdit={actions.onEdit}
          onDelete={() => onPatch({ quotas: removeById(settings.quotas, quota.id) })}
        />
      )}
      renderEditor={(quota, actions) => (
        <QuotaEditor key={quota.id} initial={quota} lists={settings.foodLists} disabled={disabled} onSave={actions.onSave} onCancel={actions.onCancel} />
      )}
    />
  );
};
