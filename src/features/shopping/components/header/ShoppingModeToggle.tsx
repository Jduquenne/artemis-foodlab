import { House, ShoppingCart } from 'lucide-react';
import { ShoppingMode } from '../../../../core/domain/shopping';

export interface ShoppingModeToggleProps {
    mode: ShoppingMode;
    onChange: (mode: ShoppingMode) => void;
}

const MODES: { id: ShoppingMode; label: string; hint: string; icon: typeof House }[] = [
    { id: 'home', label: 'À la maison', hint: 'Inventaire', icon: House },
    { id: 'store', label: 'En magasin', hint: 'Caddie', icon: ShoppingCart },
];

export const ShoppingModeToggle = ({ mode, onChange }: ShoppingModeToggleProps) => (
    <div role="radiogroup" aria-label="Mode de la liste" className="grid grid-cols-2 gap-2 lg:w-80 lg:gap-1.5">
        {MODES.map(({ id, label, hint, icon: Icon }) => {
            const selected = mode === id;
            return (
                <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(id)}
                    className={`flex items-center gap-2.5 min-w-0 px-2.5 py-2 rounded-2xl border-2 text-left transition-colors lg:gap-2 lg:px-2 lg:py-1 lg:rounded-xl lg:border ${selected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 bg-surface hover:border-slate-400'
                        }`}
                >
                    <span className={`grid place-items-center shrink-0 w-9 h-9 rounded-xl lg:w-7 lg:h-7 lg:rounded-lg ${selected ? 'bg-orange-500 text-white' : 'bg-muted text-slate-500'}`}>
                        <Icon className="w-5 h-5 lg:w-4 lg:h-4" />
                    </span>
                    <span className="flex flex-col min-w-0">
                        <span className="text-[15px] font-extrabold text-slate-900 whitespace-nowrap lg:text-sm">{label}</span>
                        <span className={`text-xs truncate lg:hidden ${selected ? 'text-orange-600' : 'text-slate-400'}`}>{hint}</span>
                    </span>
                </button>
            );
        })}
    </div>
);
