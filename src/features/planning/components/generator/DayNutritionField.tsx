import { DayNutritionLimits, NUTRIENT_KEYS, NutrientKey, NutrientRange } from "../../../../core/domain/menuGenerator";
import { NUTRIENT_LABELS } from "../../../../core/logic/menuGenerator/dayNutritionLogic";
import { validateNutrientRange } from "../../../../core/logic/menuGenerator/generatorSettingsLogic";
import { DecimalInput } from "../../../../shared/components/ui/DecimalInput";
import { ChoicePills } from "./ChoicePills";

export interface DayNutritionFieldProps {
  limits: DayNutritionLimits;
  disabled: boolean;
  onChange: (limits: DayNutritionLimits) => void;
}

const MODE_OPTIONS: readonly { id: DayNutritionLimits["mode"]; label: string }[] = [
  { id: "preferred", label: "De préférence" },
  { id: "strict", label: "Strict" },
];

const INPUT_CLASS =
  "w-20 px-2 py-1.5 bg-surface border border-slate-200 rounded-lg text-xs text-slate-800 text-right placeholder-slate-300 focus:outline-none focus:border-orange-400 disabled:opacity-50";

export const DayNutritionField = ({ limits, disabled, onChange }: DayNutritionFieldProps) => {
  const setRange = (key: NutrientKey, range: NutrientRange) => onChange({ ...limits, ranges: { ...limits.ranges, [key]: range } });

  return (
    <div className="flex flex-col gap-2">
      <ChoicePills options={MODE_OPTIONS} isActive={(id) => id === limits.mode} onToggle={(mode) => onChange({ ...limits, mode })} disabled={disabled} />
      <div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-start gap-x-2 gap-y-1.5 text-xs text-slate-600">
        <span />
        <span className="text-[11px] font-bold text-slate-400">min</span>
        <span className="text-[11px] font-bold text-slate-400">max</span>
        <span />
        {NUTRIENT_KEYS.map((key) => {
          const range = limits.ranges[key];
          const error = validateNutrientRange(range);
          return (
            <div key={key} className="contents">
              <span className="font-semibold">{NUTRIENT_LABELS[key].label}</span>
              <DecimalInput
                value={range.min}
                onValueChange={(min) => setRange(key, { ...range, min })}
                disabled={disabled}
                placeholder="—"
                aria-label={`${NUTRIENT_LABELS[key].label} minimum`}
                className={INPUT_CLASS}
              />
              <DecimalInput
                value={range.max}
                onValueChange={(max) => setRange(key, { ...range, max })}
                disabled={disabled}
                placeholder="—"
                aria-label={`${NUTRIENT_LABELS[key].label} maximum`}
                className={INPUT_CLASS}
              />
              <span className={error ? "text-red-500 font-semibold" : "text-slate-400"}>{error ?? NUTRIENT_LABELS[key].unit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
