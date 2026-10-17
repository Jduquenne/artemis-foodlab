import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { NutritionSettingsPanel } from "./NutritionSettingsPanel";
import { VarietySettingsPanel } from "./VarietySettingsPanel";

export interface AdvancedSettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const AdvancedSettingsPanel = (props: AdvancedSettingsPanelProps) => (
  <div className="flex flex-col gap-3">
    <VarietySettingsPanel {...props} />
    <NutritionSettingsPanel {...props} />
  </div>
);
