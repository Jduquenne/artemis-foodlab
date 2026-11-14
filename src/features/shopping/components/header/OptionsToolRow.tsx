import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface OptionsToolRowProps {
    icon: ReactNode;
    label: string;
    hint: string;
    onSelect: () => void;
}

export const OptionsToolRow = ({ icon, label, hint, onSelect }: OptionsToolRowProps) => (
    <button
        type="button"
        role="menuitem"
        onClick={onSelect}
        className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left hover:bg-subtle transition-colors"
    >
        <span className="grid place-items-center shrink-0 w-8 h-8 rounded-lg bg-subtle text-slate-500">
            {icon}
        </span>
        <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm font-semibold text-slate-900 truncate">{label}</span>
            <span className="text-xs text-slate-400 truncate">{hint}</span>
        </span>
        <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
    </button>
);
