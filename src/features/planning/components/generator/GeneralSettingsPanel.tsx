import { CalendarRange, Leaf, Salad, Snowflake, UtensilsCrossed } from "lucide-react";
import { GENERATED_SLOTS, GENERATED_SLOT_LABELS, MAX_GENERATION_DAYS, MIN_GENERATION_DAYS, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { DIET_OPTIONS, SEASON_OPTIONS, toggleGeneratedSlot } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { periodLength } from "../../../../core/logic/menuGenerator/periodLogic";
import { ChoicePills } from "./ChoicePills";
import { SegmentedControl } from "./SegmentedControl";
import { SettingsCard } from "./SettingsCard";
import { Switch } from "./Switch";

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
    <div className="flex flex-col gap-3">
      <SettingsCard
        icon={CalendarRange}
        title="Période"
        description={`${length !== null && length > 0 ? `${length} jour${length > 1 ? "s" : ""}` : "—"} · de ${MIN_GENERATION_DAYS} à ${MAX_GENERATION_DAYS} jours · les repas déjà prévus sont gardés`}
      >
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
            Du
            <input type="date" value={settings.startDate} disabled={disabled} onChange={(e) => onPatch({ startDate: e.target.value })} className={DATE_INPUT_CLASS} />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-semibold text-slate-500">
            Au
            <input type="date" value={settings.endDate} disabled={disabled} onChange={(e) => onPatch({ endDate: e.target.value })} className={DATE_INPUT_CLASS} />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard icon={UtensilsCrossed} title="Repas à générer" description="Les créneaux déjà remplis restent tels quels.">
        <ChoicePills
          options={SLOT_OPTIONS}
          isActive={(slot) => settings.slots.includes(slot)}
          onToggle={(slot) => onPatch({ slots: toggleGeneratedSlot(settings.slots, slot) })}
          disabled={disabled}
        />
      </SettingsCard>

      <SettingsCard icon={Salad} title="Régime" description="S'applique à tous les repas générés.">
        <SegmentedControl options={DIET_OPTIONS} value={settings.diet} onChange={(diet) => onPatch({ diet })} disabled={disabled} ariaLabel="Régime" />
      </SettingsCard>

      <SettingsCard icon={Leaf} title="Saison" description="Les aliments congelés ou surgelés ne comptent jamais comme hors saison.">
        <SegmentedControl options={SEASON_OPTIONS} value={settings.season} onChange={(season) => onPatch({ season })} disabled={disabled} ariaLabel="Saison" />
      </SettingsCard>

      <SettingsCard
        icon={Snowflake}
        title="Plats du congélateur"
        description="Les plats en portions sont placés au hasard sur la période."
        action={<Switch checked={settings.useFreezer} onChange={(useFreezer) => onPatch({ useFreezer })} disabled={disabled} label="Utiliser les plats du congélateur" />}
      />
    </div>
  );
};
