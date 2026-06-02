import { Macronutrients } from '../../../../core/domain/types';

export interface MacroRowProps {
  macros: Macronutrients;
}

const MACRO_LABELS = [
  { key: 'kcal' as const, label: 'Kcal', unit: '' },
  { key: 'proteins' as const, label: 'Prot.', unit: 'g' },
  { key: 'lipids' as const, label: 'Lip.', unit: 'g' },
  { key: 'carbohydrates' as const, label: 'Gluc.', unit: 'g' },
  { key: 'fibers' as const, label: 'Fib.', unit: 'g' },
];

export const MacroRow = ({ macros }: MacroRowProps) => (
  <div className="flex gap-2 justify-center">
    {MACRO_LABELS.map(({ key, label, unit }) => (
      <div key={key} className="w-14 h-14 rounded-full bg-white dark:bg-slate-200 shadow-md flex flex-col items-center justify-center shrink-0">
        <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">{label}</span>
        <span className="text-sm font-black text-slate-800 leading-none">
          {Math.round(macros[key])}{unit}
        </span>
      </div>
    ))}
  </div>
);
