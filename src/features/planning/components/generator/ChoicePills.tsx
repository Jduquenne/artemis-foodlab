import { Check } from "lucide-react";

export interface ChoicePillsProps<T extends string> {
  options: readonly { id: T; label: string }[];
  isActive: (id: T) => boolean;
  onToggle: (id: T) => void;
  disabled?: boolean;
}

export const ChoicePills = <T extends string>({ options, isActive, onToggle, disabled = false }: ChoicePillsProps<T>) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => {
      const active = isActive(option.id);
      return (
        <button
          key={option.id}
          type="button"
          aria-pressed={active}
          disabled={disabled}
          onClick={() => onToggle(option.id)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
            active
              ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300"
              : "bg-surface border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600"
          }`}
        >
          {active && <Check size={11} />}
          {option.label}
        </button>
      );
    })}
  </div>
);
