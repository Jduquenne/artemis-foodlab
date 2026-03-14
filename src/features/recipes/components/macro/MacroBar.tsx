import { Macronutrients } from '../../../../core/domain/types';

export interface MacroBarProps {
  macros: Macronutrients;
}

const MACRO_LABELS = [
  { key: 'kcal' as const, label: 'Kcal', unit: '' },
  { key: 'proteins' as const, label: 'Protéines', unit: 'g' },
  { key: 'lipids' as const, label: 'Lipides', unit: 'g' },
  { key: 'carbohydrates' as const, label: 'Glucides', unit: 'g' },
  { key: 'fibers' as const, label: 'Fibres', unit: 'g' },
];

export const MacroBar = ({ macros }: MacroBarProps) => (
  <div className="flex gap-2 overflow-x-auto pb-0.5">
    {MACRO_LABELS.map(({ key, label, unit }) => (
      <div key={key} className="flex flex-col items-center bg-slate-100 dark:bg-slate-200 rounded-xl px-3 py-1.5 min-w-[60px]">
        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
        <span className="text-sm font-bold text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
