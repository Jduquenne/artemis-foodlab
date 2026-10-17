export interface SegmentedControlProps<T extends string> {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const SegmentedControl = <T extends string>({ options, value, onChange, disabled = false, ariaLabel }: SegmentedControlProps<T>) => (
  <div role="radiogroup" aria-label={ariaLabel} className="inline-flex max-w-full flex-wrap gap-0.5 rounded-xl bg-muted p-0.5">
    {options.map((option) => {
      const active = option.id === value;
      return (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={active}
          disabled={disabled}
          onClick={() => onChange(option.id)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
            active ? "bg-surface text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
