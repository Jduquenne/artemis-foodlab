import { ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface OptionsRadioRowProps {
    icon: ReactNode;
    label: string;
    hint: string;
    checked: boolean;
    onSelect: () => void;
}

export const OptionsRadioRow = ({ icon, label, hint, checked, onSelect }: OptionsRadioRowProps) => (
    <button
        type="button"
        role="menuitemradio"
        aria-checked={checked}
        onClick={onSelect}
        className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left hover:bg-subtle transition-colors"
    >
        <span className={`grid place-items-center shrink-0 w-8 h-8 rounded-lg ${checked ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-subtle text-slate-500'}`}>
            {icon}
        </span>
        <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm font-semibold text-slate-900 truncate">{label}</span>
            <span className="text-xs text-slate-400 truncate">{hint}</span>
        </span>
        <span className={`grid place-items-center shrink-0 w-5 h-5 rounded-full border-2 ${checked ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 text-transparent'}`}>
            <Check className="w-3 h-3" strokeWidth={3.5} />
        </span>
    </button>
);
