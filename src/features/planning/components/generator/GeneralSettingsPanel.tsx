import { Snowflake } from "lucide-react";
import { GENERATED_SLOTS, GENERATED_SLOT_LABELS, MAX_GENERATION_DAYS, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import {
  DIET_OPTIONS,
  SEASON_OPTIONS,
  toggleGeneratedSlot,
} from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { periodLength } from "../../../../core/logic/menuGenerator/periodLogic";
import { ChoicePills } from "./ChoicePills";
import { SettingsSection } from "./SettingsSection";

export interface GeneralSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

const DATE_INPUT_CLASS =
  "w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 scheme-light dark:scheme-dark focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

const SLOT_OPTIONS = GENERATED_SLOTS.map((slot) => ({ id: slot, label: GENERATED_SLOT_LABELS[slot] }));

export const GeneralSettingsPanel = ({ settings, disabled, onPatch }: GeneralSettingsPanelProps) => {
  const length = periodLength(settings.startDate, settings.endDate);

  return (
    <div className="flex flex-col gap-4">
      <SettingsSection
        title="Période"
        hint={`${length !== null && length > 0 ? `${length} jour${length > 1 ? "s" : ""}` : "—"} · ${MAX_GENERATION_DAYS} jours maximum · les repas déjà prévus sont gardés`}
      >
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={settings.startDate} disabled={disabled} onChange={(e) => onPatch({ startDate: e.target.value })} aria-label="Début" className={DATE_INPUT_CLASS} />
          <input type="date" value={settings.endDate} disabled={disabled} onChange={(e) => onPatch({ endDate: e.target.value })} aria-label="Fin" className={DATE_INPUT_CLASS} />
        </div>
      </SettingsSection>

      <SettingsSection title="Repas">
        <ChoicePills
          options={SLOT_OPTIONS}
          isActive={(slot) => settings.slots.includes(slot)}
          onToggle={(slot) => onPatch({ slots: toggleGeneratedSlot(settings.slots, slot) })}
          disabled={disabled}
        />
      </SettingsSection>

      <SettingsSection title="Régime">
        <ChoicePills options={DIET_OPTIONS} isActive={(id) => settings.diet === id} onToggle={(diet) => onPatch({ diet })} disabled={disabled} />
      </SettingsSection>

      <SettingsSection title="Saison">
        <ChoicePills options={SEASON_OPTIONS} isActive={(id) => settings.season === id} onToggle={(season) => onPatch({ season })} disabled={disabled} />
      </SettingsSection>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.useFreezer}
          disabled={disabled}
          onChange={(e) => onPatch({ useFreezer: e.target.checked })}
          className="accent-orange-500"
        />
        <Snowflake size={14} className="text-cyan-500" />
        <span className="text-sm text-slate-700">Utiliser les plats du congélateur</span>
      </label>
    </div>
  );
};
