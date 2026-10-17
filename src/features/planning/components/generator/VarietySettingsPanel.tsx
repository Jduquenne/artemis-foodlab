import { History, Shuffle, Wheat } from "lucide-react";
import { AdvancedSettings, MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { ADVANCED_LIMITS, ADVANCED_MODE_OPTIONS } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { NumberStepper } from "./NumberStepper";
import { SegmentedControl } from "./SegmentedControl";
import { SettingsCard } from "./SettingsCard";

export interface VarietySettingsPanelProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onPatch: (update: Partial<MenuGeneratorSettings>) => void;
}

export const VarietySettingsPanel = ({ settings, disabled, onPatch }: VarietySettingsPanelProps) => {
  const { advanced } = settings;
  const patch = (update: Partial<AdvancedSettings>) => onPatch({ advanced: { ...advanced, ...update } });

  return (
    <div className="flex flex-col gap-3">
      <SettingsCard icon={History} title="Répétition des recettes" description="Strict : aucune recette planifiée dans ce délai n'est proposée.">
        <SegmentedControl options={ADVANCED_MODE_OPTIONS} value={advanced.repeatMode} onChange={(repeatMode) => patch({ repeatMode })} disabled={disabled} ariaLabel="Répétition" />
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
      </SettingsCard>

      <SettingsCard icon={Shuffle} title="Même catégorie deux repas de suite" description="Strict : jamais deux plats de la même catégorie à la suite.">
        <SegmentedControl options={ADVANCED_MODE_OPTIONS} value={advanced.categoryInRow} onChange={(categoryInRow) => patch({ categoryInRow })} disabled={disabled} ariaLabel="Même catégorie" />
      </SettingsCard>

      <SettingsCard icon={Wheat} title="Même féculent à la suite" description="Pâtes, riz, pommes de terre… (aliments de la catégorie « Féculents », bases comprises).">
        <SegmentedControl options={ADVANCED_MODE_OPTIONS} value={advanced.starchInRow} onChange={(starchInRow) => patch({ starchInRow })} disabled={disabled} ariaLabel="Même féculent" />
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
      </SettingsCard>
    </div>
  );
};
