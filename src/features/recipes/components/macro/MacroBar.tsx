import { Macronutrients, MACRO_DISPLAYS } from '../../../../core/domain/nutrition';

export interface MacroBarProps {
  macros: Macronutrients;
}


export const MacroBar = ({ macros }: MacroBarProps) => (
  <div className="flex gap-2 overflow-x-auto pb-0.5">
    {MACRO_DISPLAYS.map(({ key, label, unit }) => (
      <div key={key} className="flex flex-col items-center bg-slate-100 dark:bg-slate-200 rounded-xl px-3 py-1.5 min-w-[60px]">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
        <span className="text-sm font-bold text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
