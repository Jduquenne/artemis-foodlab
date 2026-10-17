import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DessertRule, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { dessertPickLabel, emptyDessertRule } from "../../../../core/logic/menuGenerator/dessertLogic";
import { formatHabitDays, habitSlotsLabel } from "../../../../core/logic/menuGenerator/habitLogic";
import { removeById, setEnabledById, upsertById } from "../../../../core/utils/collectionUtils";
import { useHabitNames } from "../../../../shared/hooks/useHabitNames";
import { DessertRuleEditor } from "./DessertRuleEditor";

export interface DessertsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const DessertsSettingsPanel = ({ settings, disabled, onPatch }: DessertsSettingsPanelProps) => {
  const names = useHabitNames(settings.foodLists);
  const [editing, setEditing] = useState<DessertRule | null>(null);
  const rules = settings.dessertRules;

  const save = (rule: DessertRule) => {
    onPatch({ dessertRules: upsertById(rules, rule) });
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400">
          Desserts ajoutés aux repas générés et aux repas déjà prévus qui n'en ont aucun. Si plusieurs règles visent le même repas, la première s'applique.
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(emptyDessertRule(crypto.randomUUID()))}
            disabled={disabled}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>

      {editing && !rules.some((rule) => rule.id === editing.id) && (
        <DessertRuleEditor key={editing.id} initial={editing} lists={settings.foodLists} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
      )}

      {rules.map((rule) =>
        editing?.id === rule.id ? (
          <DessertRuleEditor key={rule.id} initial={rule} lists={settings.foodLists} disabled={disabled} onSave={save} onCancel={() => setEditing(null)} />
        ) : (
          <div key={rule.id} className={`flex items-start gap-2 rounded-xl border border-slate-200 px-2.5 py-2 ${rule.enabled ? "" : "opacity-50"}`}>
            <input
              type="checkbox"
              checked={rule.enabled}
              disabled={disabled || editing !== null}
              onChange={(e) => onPatch({ dessertRules: setEnabledById(rules, rule.id, e.target.checked) })}
              aria-label={rule.enabled ? "Désactiver la règle" : "Activer la règle"}
              className="mt-0.5 accent-orange-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800">{rule.items.map((item) => dessertPickLabel(item, names)).join(" + ")}</p>
              <p className="text-[11px] text-slate-500 first-letter:uppercase">
                {formatHabitDays(rule.days)} · {habitSlotsLabel(rule.slots).toLowerCase()}
              </p>
            </div>
            <button type="button" onClick={() => setEditing(rule)} disabled={disabled || editing !== null} aria-label="Modifier la règle" className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-muted disabled:opacity-50">
              <Pencil size={13} />
            </button>
            <button type="button" onClick={() => onPatch({ dessertRules: removeById(rules, rule.id) })} disabled={disabled || editing !== null} aria-label="Supprimer la règle" className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-muted disabled:opacity-50">
              <Trash2 size={13} />
            </button>
          </div>
        ),
      )}

      {rules.length === 0 && !editing && <p className="text-xs text-slate-400 text-center py-4">Aucune règle de dessert pour l'instant.</p>}
    </div>
  );
};
