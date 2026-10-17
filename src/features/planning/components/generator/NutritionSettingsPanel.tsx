import { Activity, Flame } from "lucide-react";
import { AdvancedSettings, GENERATED_SLOTS, GENERATED_SLOT_LABELS, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { hasDayLimits } from "../../../../core/logic/menuGenerator/dayNutritionLogic";
import { ADVANCED_LIMITS, ADVANCED_MODE_OPTIONS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { DayNutritionField } from "./DayNutritionField";
import { NumberStepper } from "./NumberStepper";
import { SegmentedControl } from "./SegmentedControl";
import { SettingsCard } from "./SettingsCard";

export interface NutritionSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const NutritionSettingsPanel = ({ settings, disabled, onPatch }: NutritionSettingsPanelProps) => {
  const { advanced } = settings;
  const patch = (update: Partial<AdvancedSettings>) => onPatch({ advanced: { ...advanced, ...update } });
  const dayLimitsActive = hasDayLimits(advanced.dayNutrition);
  const kcalDisabled = disabled || dayLimitsActive;

  return (
    <div className="flex flex-col gap-3">
      <SettingsCard
        icon={Activity}
        title="Nutrition de la journée"
        description="Déjeuner + dîner, valeurs d'une portion, desserts non comptés. Vide = pas de limite. Un jour avec un seul repas généré ne vérifie que les maximums."
      >
        <DayNutritionField limits={advanced.dayNutrition} disabled={disabled} onChange={(dayNutrition) => patch({ dayNutrition })} />
      </SettingsCard>

      <SettingsCard
        icon={Flame}
        title="Calories par repas"
        description={dayLimitsActive
          ? "Remplacé par la nutrition de la journée tant qu'une limite y est renseignée."
          : "Cible d'un repas = objectif du profil actif × part du repas."}
      >
        <SegmentedControl options={ADVANCED_MODE_OPTIONS} value={advanced.kcalMode} onChange={(kcalMode) => patch({ kcalMode })} disabled={kcalDisabled} ariaLabel="Calories par repas" />
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
          <span>Tolérance ±</span>
          <NumberStepper
            value={advanced.kcalTolerance}
            {...ADVANCED_LIMITS.kcalTolerance}
            unit="%"
            disabled={kcalDisabled || advanced.kcalMode === "off"}
            onChange={(kcalTolerance) => patch({ kcalTolerance })}
          />
          {GENERATED_SLOTS.map((slot) => (
            <div key={slot} className="contents">
              <span>Part du {GENERATED_SLOT_LABELS[slot].toLowerCase()}</span>
              <NumberStepper
                value={advanced.kcalShares[slot]}
                {...ADVANCED_LIMITS.kcalShare}
                unit="%"
                disabled={kcalDisabled || advanced.kcalMode === "off"}
                onChange={(share) => patch({ kcalShares: { ...advanced.kcalShares, [slot]: share } })}
              />
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};
