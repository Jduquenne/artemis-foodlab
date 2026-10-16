import { Snowflake } from "lucide-react";
import { GENERATED_SLOTS, MAX_GENERATION_DAYS, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import {
  DIET_OPTIONS,
  GENERATED_SLOT_LABELS,
  SEASON_OPTIONS,
  toggleExcludedFood,
  toggleGeneratedSlot,
} from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { periodLength } from "../../../../core/logic/menuGenerator/periodLogic";
import { ChoicePills } from "./ChoicePills";
import { ExcludedFoodsField } from "./ExcludedFoodsField";

export interface GeneratorSettingsFormProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onChange: (settings: MenuGeneratorSettings) => void;
}

const DATE_INPUT_CLASS =
  "w-full px-3 py-2 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 scheme-light dark:scheme-dark focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50";

const SLOT_OPTIONS = GENERATED_SLOTS.map((slot) => ({ id: slot, label: GENERATED_SLOT_LABELS[slot] }));

export const GeneratorSettingsForm = ({ settings, disabled, onChange }: GeneratorSettingsFormProps) => {
  const patch = (update: Partial<MenuGeneratorSettings>) => onChange({ ...settings, ...update });
  const length = periodLength(settings.startDate, settings.endDate);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-500">Période</span>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={settings.startDate} disabled={disabled} onChange={(e) => patch({ startDate: e.target.value })} aria-label="Début" className={DATE_INPUT_CLASS} />
          <input type="date" value={settings.endDate} disabled={disabled} onChange={(e) => patch({ endDate: e.target.value })} aria-label="Fin" className={DATE_INPUT_CLASS} />
        </div>
        <span className="text-[11px] text-slate-400">
          {length !== null && length > 0 ? `${length} jour${length > 1 ? "s" : ""}` : "—"} · {MAX_GENERATION_DAYS} jours maximum · les repas déjà prévus sont gardés
        </span>
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-500">Repas</span>
        <ChoicePills
          options={SLOT_OPTIONS}
          isActive={(slot) => settings.slots.includes(slot)}
          onToggle={(slot) => patch({ slots: toggleGeneratedSlot(settings.slots, slot) })}
          disabled={disabled}
        />
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-500">Régime</span>
        <ChoicePills options={DIET_OPTIONS} isActive={(id) => settings.diet === id} onToggle={(diet) => patch({ diet })} disabled={disabled} />
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-500">Saison</span>
        <ChoicePills options={SEASON_OPTIONS} isActive={(id) => settings.season === id} onToggle={(season) => patch({ season })} disabled={disabled} />
      </section>

      <section className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-slate-500">Aliments à éviter</span>
        <ExcludedFoodsField
          foodIds={settings.excludedFoodIds}
          disabled={disabled}
          onToggle={(foodId) => patch({ excludedFoodIds: toggleExcludedFood(settings.excludedFoodIds, foodId) })}
        />
      </section>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.freezerFirst}
          disabled={disabled}
          onChange={(e) => patch({ freezerFirst: e.target.checked })}
          className="accent-orange-500"
        />
        <Snowflake size={14} className="text-cyan-500" />
        <span className="text-sm text-slate-700">Utiliser d'abord les plats du congélateur</span>
      </label>
    </div>
  );
};
