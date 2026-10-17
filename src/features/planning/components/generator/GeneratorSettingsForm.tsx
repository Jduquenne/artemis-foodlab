import { useState } from "react";
import { MenuGeneratorSettings } from "../../../../core/domain/menuGenerator";
import { AdvancedSettingsPanel } from "./AdvancedSettingsPanel";
import { ChoicePills } from "./ChoicePills";
import { FoodsSettingsPanel } from "./FoodsSettingsPanel";
import { GeneralSettingsPanel } from "./GeneralSettingsPanel";
import { HabitsSettingsPanel } from "./HabitsSettingsPanel";
import { QuotasSettingsPanel } from "./QuotasSettingsPanel";

export interface GeneratorSettingsFormProps {
  settings: MenuGeneratorSettings;
  disabled: boolean;
  onChange: (settings: MenuGeneratorSettings) => void;
}

type SettingsTab = "general" | "habits" | "quotas" | "foods" | "advanced";

const TABS: readonly { id: SettingsTab; label: string }[] = [
  { id: "general", label: "Période et repas" },
  { id: "habits", label: "Habitudes" },
  { id: "quotas", label: "Quotas" },
  { id: "foods", label: "Aliments et recettes" },
  { id: "advanced", label: "Avancé" },
];

export const GeneratorSettingsForm = ({ settings, disabled, onChange }: GeneratorSettingsFormProps) => {
  const [tab, setTab] = useState<SettingsTab>("general");
  const onPatch = (update: Partial<MenuGeneratorSettings>) => onChange({ ...settings, ...update });
  const panelProps = { settings, disabled, onPatch };

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      <ChoicePills options={TABS} isActive={(id) => id === tab} onToggle={setTab} />
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {tab === "general" && <GeneralSettingsPanel {...panelProps} />}
        {tab === "habits" && <HabitsSettingsPanel {...panelProps} />}
        {tab === "quotas" && <QuotasSettingsPanel {...panelProps} />}
        {tab === "foods" && <FoodsSettingsPanel {...panelProps} />}
        {tab === "advanced" && <AdvancedSettingsPanel {...panelProps} />}
      </div>
    </div>
  );
};
