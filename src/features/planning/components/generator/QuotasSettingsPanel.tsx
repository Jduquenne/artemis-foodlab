import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { MenuGeneratorSettings, WeeklyQuota } from "../../../../core/domain/menuGenerator";
import { emptyQuota } from "../../../../core/logic/menuGenerator/quotaLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useCategoriesSnapshot, useFoodsSnapshot, useRecipesSnapshot } from "../../../../shared/hooks/useCatalogueSnapshot";
import { QuotaEditor } from "./QuotaEditor";
import { QuotaRow } from "./QuotaRow";

export interface QuotasSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const QuotasSettingsPanel = ({ settings, disabled, onPatch }: QuotasSettingsPanelProps) => {
  const recipes = useRecipesSnapshot();
  const foods = useFoodsSnapshot();
  const categories = useCategoriesSnapshot();
  const names = useMemo(
    () => ({ catalogue: { recipes, foods }, categoryNames: Object.fromEntries(categories.map((category) => [category.id, category.name])) }),
    [recipes, foods, categories],
  );
  const [editing, setEditing] = useState<WeeklyQuota | null>(null);

  const save = (quota: WeeklyQuota) => {
    onPatch({ quotas: upsertById(settings.quotas, quota) });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400">
          « Par semaine » = par bloc de 7 jours à partir du début de la période, repas déjà prévus compris. Si le dernier bloc est incomplet (période de 8 à 13 jours), « au moins » y est réduit au prorata.
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(emptyQuota(crypto.randomUUID()))}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>

      {editing && !settings.quotas.some((quota) => quota.id === editing.id) && (
        <QuotaEditor key={editing.id} initial={editing} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {settings.quotas.map((quota) =>
        editing?.id === quota.id ? (
          <QuotaEditor key={quota.id} initial={quota} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <QuotaRow
            key={quota.id}
            quota={quota}
            names={names}
            disabled={disabled || editing !== null}
            onToggle={(enabled) => onPatch({ quotas: setEnabledById(settings.quotas, quota.id, enabled) })}
            onEdit={() => setEditing(quota)}
            onDelete={() => onPatch({ quotas: removeById(settings.quotas, quota.id) })}
          />
        ),
      )}

      {settings.quotas.length === 0 && !editing && (
        <p className="text-xs text-slate-400 text-center py-4">Aucun quota pour l'instant.</p>
      )}
    </div>
  );
};
