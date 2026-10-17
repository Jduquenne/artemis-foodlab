import { Minus, Plus } from "lucide-react";

export interface NumberStepperProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  disabled: boolean;
  onChange: (value: number) => void;
}

const STEP_CLASS = "p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-muted disabled:opacity-30";

export const NumberStepper = ({ value, min, max, step, unit, disabled, onChange }: NumberStepperProps) => (
  <div className="flex items-center gap-1.5">
    <button type="button" aria-label="Moins" disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - step))} className={STEP_CLASS}>
      <Minus size={12} />
    </button>
    <span className="min-w-10 text-center text-sm font-black text-slate-800">
      {value}
      {unit && <span className="ml-0.5 text-[11px] font-semibold text-slate-500">{unit}</span>}
    </span>
    <button type="button" aria-label="Plus" disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + step))} className={STEP_CLASS}>
      <Plus size={12} />
    </button>
  </div>
);
