import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import {
  setPreferredFoodMode,
  toggleExcludedFood,
  togglePreferredFood,
} from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { ExcludedFoodsField } from "./ExcludedFoodsField";
import { PreferredFoodsField } from "./PreferredFoodsField";
import { SettingsSection } from "./SettingsSection";

export interface FoodsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const FoodsSettingsPanel = ({ settings, disabled, onPatch }: FoodsSettingsPanelProps) => (
  <div className="flex flex-col gap-4">
    <SettingsSection
      title="Aliments à utiliser"
      hint="Restes, produits à finir. « Bonus » : favorisé. « Au moins 1× » : utilisé au moins une fois sur la période."
    >
      <PreferredFoodsField
        foods={settings.preferredFoods}
        disabled={disabled}
        onToggle={(foodId) => onPatch(togglePreferredFood(settings, foodId))}
        onModeChange={(foodId, mode) => onPatch({ preferredFoods: setPreferredFoodMode(settings.preferredFoods, foodId, mode) })}
      />
    </SettingsSection>

    <SettingsSection title="Aliments à éviter" hint="Aucune recette proposée ne les contient.">
      <ExcludedFoodsField
        foodIds={settings.excludedFoodIds}
        disabled={disabled}
        onToggle={(foodId) => onPatch(toggleExcludedFood(settings, foodId))}
      />
    </SettingsSection>
  </div>
);
