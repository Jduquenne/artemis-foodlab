import { AdvancedMode, AdvancedSettings, GENERATED_SLOTS, GENERATED_SLOT_LABELS, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { hasDayLimits } from "../../../../core/logic/menuGenerator/dayNutritionLogic";
import { ADVANCED_LIMITS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { ChoicePills } from "./ChoicePills";
import { DayNutritionField } from "./DayNutritionField";
import { NumberStepper } from "./NumberStepper";
import { SettingsSection } from "./SettingsSection";

export interface AdvancedSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

const MODE_OPTIONS: readonly { id: AdvancedMode; label: string }[] = [
  { id: "off", label: "Ignorer" },
  { id: "preferred", label: "De préférence" },
  { id: "strict", label: "Strict" },
];

export const AdvancedSettingsPanel = ({ settings, disabled, onPatch }: AdvancedSettingsPanelProps) => {
  const { advanced } = settings;
  const patch = (update: Partial<AdvancedSettings>) => onPatch({ advanced: { ...advanced, ...update } });
  const dayLimitsActive = hasDayLimits(advanced.dayNutrition);

  return (
    <div className="flex flex-col gap-4">
      <SettingsSection title="Répétition des recettes" hint="Strict : aucune recette planifiée dans ce délai n'est proposée.">
        <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === advanced.repeatMode} onToggle={(repeatMode) => patch({ repeatMode })} disabled={disabled} />
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Pas avant</span>
          <NumberStepper
            value={advanced.repeatWeeks}
            {...ADVANCED_LIMITS.repeatWeeks}
            unit="sem."
            disabled={disabled || advanced.repeatMode === "off"}
            onChange={(repeatWeeks) => patch({ repeatWeeks })}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Même catégorie deux repas de suite" hint="Strict : jamais deux plats de la même catégorie à la suite.">
        <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === advanced.categoryInRow} onToggle={(categoryInRow) => patch({ categoryInRow })} disabled={disabled} />
      </SettingsSection>

      <SettingsSection title="Même féculent à la suite" hint="Féculents = aliments de la catégorie « Féculents » (pâtes, riz, pommes de terre…), bases comprises.">
        <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === advanced.starchInRow} onToggle={(starchInRow) => patch({ starchInRow })} disabled={disabled} />
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Au plus</span>
          <NumberStepper
            value={advanced.starchMax}
            {...ADVANCED_LIMITS.starchMax}
            unit="repas"
            disabled={disabled || advanced.starchInRow === "off"}
            onChange={(starchMax) => patch({ starchMax })}
          />
          <span>de suite</span>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Nutrition de la journée (déjeuner + dîner)"
        hint="Valeurs d'une portion, desserts non comptés. Laisser vide = pas de limite. Si un des repas du jour n'est pas généré (pas de repas, extérieur), seuls les maximums comptent. En strict, les recettes sans valeurs nutritionnelles ne sont pas proposées."
      >
        <DayNutritionField limits={advanced.dayNutrition} disabled={disabled} onChange={(dayNutrition) => patch({ dayNutrition })} />
      </SettingsSection>

      <SettingsSection
        title="Calories par repas"
        hint={dayLimitsActive
          ? "Remplacé par la nutrition de la journée tant qu'une limite y est renseignée."
          : "Cible d'un repas = objectif du profil actif × part du repas. Strict : hors tolérance, la recette n'est pas proposée."}
      >
        <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === advanced.kcalMode} onToggle={(kcalMode) => patch({ kcalMode })} disabled={disabled || dayLimitsActive} />
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
          <span>Tolérance ±</span>
          <NumberStepper
            value={advanced.kcalTolerance}
            {...ADVANCED_LIMITS.kcalTolerance}
            unit="%"
            disabled={disabled || dayLimitsActive || advanced.kcalMode === "off"}
            onChange={(kcalTolerance) => patch({ kcalTolerance })}
          />
          {GENERATED_SLOTS.map((slot) => (
            <div key={slot} className="contents">
              <span>Part du {GENERATED_SLOT_LABELS[slot].toLowerCase()}</span>
              <NumberStepper
                value={advanced.kcalShares[slot]}
                {...ADVANCED_LIMITS.kcalShare}
                unit="%"
                disabled={disabled || dayLimitsActive || advanced.kcalMode === "off"}
                onChange={(share) => patch({ kcalShares: { ...advanced.kcalShares, [slot]: share } })}
              />
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
};
