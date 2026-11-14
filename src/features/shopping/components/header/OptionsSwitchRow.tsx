import { ReactNode } from 'react';

export interface OptionsSwitchRowProps {
    icon: ReactNode;
    label: string;
    hint: string;
    checked: boolean;
    onToggle: () => void;
}

export const OptionsSwitchRow = ({ icon, label, hint, checked, onToggle }: OptionsSwitchRowProps) => (
    <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={checked}
        onClick={onToggle}
        className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left hover:bg-subtle transition-colors"
    >
        <span className={`grid place-items-center shrink-0 w-8 h-8 rounded-lg ${checked ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600' : 'bg-subtle text-slate-500'}`}>
            {icon}
        </span>
        <span className="flex-1 min-w-0 flex flex-col">
            <span className="text-sm font-semibold text-slate-900 truncate">{label}</span>
            <span className="text-xs text-slate-400 truncate">{hint}</span>
        </span>
        <span className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${checked ? 'bg-orange-500' : 'bg-strong'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </span>
    </button>
);
