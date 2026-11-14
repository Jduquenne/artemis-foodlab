import { X } from 'lucide-react';

export interface ActiveFilterPill {
    key: string;
    label: string;
    clearLabel: string;
    onClear: () => void;
}

export interface ActiveFilterPillsProps {
    pills: ActiveFilterPill[];
}

export const ActiveFilterPills = ({ pills }: ActiveFilterPillsProps) => (
    <div className="flex flex-wrap gap-1.5">
        {pills.map((pill) => (
            <button
                key={pill.key}
                type="button"
                onClick={pill.onClear}
                aria-label={pill.clearLabel}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 text-xs font-bold hover:bg-orange-200 transition-colors"
            >
                {pill.label}
                <X className="w-3.5 h-3.5" />
            </button>
        ))}
    </div>
);
