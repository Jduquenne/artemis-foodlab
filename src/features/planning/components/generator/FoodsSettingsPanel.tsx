import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { toggleExcludedFood } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { ExcludedFoodsField } from "./ExcludedFoodsField";
import { SettingsSection } from "./SettingsSection";

export interface FoodsSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const FoodsSettingsPanel = ({ settings, disabled, onPatch }: FoodsSettingsPanelProps) => (
  <div className="flex flex-col gap-4">
    <SettingsSection title="Aliments à éviter" hint="Aucune recette proposée ne les contient.">
      <ExcludedFoodsField
        foodIds={settings.excludedFoodIds}
        disabled={disabled}
        onToggle={(foodId) => onPatch({ excludedFoodIds: toggleExcludedFood(settings.excludedFoodIds, foodId) })}
      />
    </SettingsSection>
  </div>
);
