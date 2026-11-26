import { LucideIcon } from 'lucide-react';

export interface ShoppingSegmentedOption<T extends string> {
    id: T;
    label: string;
    icon?: LucideIcon;
}

export interface ShoppingSegmentedProps<T extends string> {
    options: readonly ShoppingSegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
    compactLabels?: boolean;
    grow?: boolean;
}

export const ShoppingSegmented = <T extends string>({ options, value, onChange, ariaLabel, compactLabels = false, grow = false }: ShoppingSegmentedProps<T>) => (
    <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={`flex items-stretch gap-0.5 h-10 p-1 rounded-xl border border-slate-200 bg-surface shadow-sm lg:h-9 ${grow ? 'flex-1 sm:flex-none' : 'shrink-0'}`}
    >
        {options.map(({ id, label, icon: Icon }) => {
            const selected = value === id;
            return (
                <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={label}
                    title={label}
                    onClick={() => onChange(id)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors lg:text-[13px] ${grow ? 'flex-1 sm:flex-none' : ''} ${selected ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    {Icon && <Icon className="w-4 h-4 shrink-0" />}
                    <span className={compactLabels && Icon ? 'hidden sm:inline' : ''}>{label}</span>
                </button>
            );
        })}
    </div>
);
