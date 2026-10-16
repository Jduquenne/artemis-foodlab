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
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors disabled:opacity-50 ${
            active
              ? "bg-orange-500 border-orange-500 text-white"
              : "bg-surface border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600"
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
