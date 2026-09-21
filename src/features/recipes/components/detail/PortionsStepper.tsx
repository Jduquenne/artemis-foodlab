import { Minus, Plus, Users } from "lucide-react";

export interface PortionsStepperProps {
  value: number;
  onChange: (value: number) => void;
}

export const PortionsStepper = ({ value, onChange }: PortionsStepperProps) => (
  <div className="flex items-center gap-0.5 pl-1.5 pr-1 py-1 rounded-xl bg-slate-100 dark:bg-slate-200 shrink-0">
    <Users className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
    <button
      type="button"
      aria-label="Réduire le nombre de parts"
      onClick={() => onChange(Math.max(1, value - 1))}
      disabled={value <= 1}
      className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <span className="w-5 text-center text-sm font-black text-slate-700 tabular-nums">{value}</span>
    <button
      type="button"
      aria-label="Augmenter le nombre de parts"
      onClick={() => onChange(value + 1)}
      className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-100 transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
);
