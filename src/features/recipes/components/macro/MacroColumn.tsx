import { Macronutrients } from '../../../../core/domain/types';

export interface MacroColumnProps {
  macros: Macronutrients;
}

const MACRO_LABELS = [
  { key: 'kcal' as const, label: 'Kcal', unit: '' },
  { key: 'proteins' as const, label: 'Prot.', unit: 'g' },
  { key: 'lipids' as const, label: 'Lip.', unit: 'g' },
  { key: 'carbohydrates' as const, label: 'Gluc.', unit: 'g' },
  { key: 'fibers' as const, label: 'Fib.', unit: 'g' },
];

export const MacroColumn = ({ macros }: MacroColumnProps) => (
  <div className="flex flex-col gap-2">
    {MACRO_LABELS.map(({ key, label, unit }) => (
      <div key={key} className="w-24 h-24 rounded-full bg-white dark:bg-slate-200 shadow-md flex flex-col items-center justify-center">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-1">{label}</span>
        <span className="text-xl font-black text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
