import { Macronutrients, MACRO_DISPLAYS } from '../../../../core/domain/nutrition';

export interface MacroColumnProps {
  macros: Macronutrients;
}

const SHORT_MACRO_DISPLAYS = MACRO_DISPLAYS.map(({ key, shortLabel, unit }) => ({ key, label: shortLabel, unit }));

export const MacroColumn = ({ macros }: MacroColumnProps) => (
  <div className="flex flex-col gap-2">
    {SHORT_MACRO_DISPLAYS.map(({ key, label, unit }) => (
      <div key={key} className="w-24 h-24 rounded-full bg-white dark:bg-slate-200 shadow-md flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-1">{label}</span>
        <span className="text-xl font-black text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
