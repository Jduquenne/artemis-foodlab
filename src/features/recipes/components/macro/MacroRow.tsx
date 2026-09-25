import { Macronutrients, MACRO_DISPLAYS } from '../../../../core/domain/nutrition';

export interface MacroRowProps {
  macros: Macronutrients;
}

const SHORT_MACRO_DISPLAYS = MACRO_DISPLAYS.map(({ key, shortLabel, unit }) => ({ key, label: shortLabel, unit }));

export const MacroRow = ({ macros }: MacroRowProps) => (
  <div className="flex gap-2 justify-center">
    {SHORT_MACRO_DISPLAYS.map(({ key, label, unit }) => (
      <div key={key} className="w-14 h-14 rounded-full bg-white dark:bg-slate-200 shadow-md flex flex-col items-center justify-center shrink-0">
        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
        <span className="text-sm font-black text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
