import { Macronutrients, MACRO_DISPLAYS } from '../../../../core/domain/nutrition';

export interface MacroCirclesProps {
  macros: Macronutrients;
  compact?: boolean;
}

export const MacroCircles = ({ macros, compact = false }: MacroCirclesProps) => (
  <div className={compact ? 'flex gap-2 justify-center' : 'flex flex-col gap-2'}>
    {MACRO_DISPLAYS.map(({ key, shortLabel, unit }) => (
      <div
        key={key}
        className={`${compact ? 'w-14 h-14 shrink-0' : 'w-24 h-24'} rounded-full bg-white dark:bg-slate-200 shadow-md flex flex-col items-center justify-center`}
      >
        <span className={`${compact ? 'text-[8px] mb-0.5' : 'text-[10px] mb-1'} font-semibold text-slate-400 uppercase tracking-wide leading-none`}>{shortLabel}</span>
        <span className={`${compact ? 'text-sm' : 'text-xl'} font-black text-slate-800 leading-none`}>
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
