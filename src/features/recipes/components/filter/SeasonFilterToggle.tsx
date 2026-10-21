import { Leaf } from 'lucide-react';
import { MONTH_LABELS } from '../../../../core/logic/season/seasonLogic';

export interface SeasonFilterToggleProps {
  checked: boolean;
  month: number;
  count: number;
  onChange: (checked: boolean) => void;
}

export const SeasonFilterToggle = ({ checked, month, count, onChange }: SeasonFilterToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={[
      'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-colors',
      checked
        ? 'bg-orange-500 border-orange-400 text-white shadow-sm'
        : 'bg-surface border-slate-200 text-slate-600 hover:bg-muted',
    ].join(' ')}
  >
    <Leaf className={`w-4 h-4 shrink-0 ${checked ? 'text-white' : 'text-emerald-500'}`} />
    <span className="flex-1 min-w-0">
      <span className="block text-sm font-bold">De saison en {MONTH_LABELS[month - 1]}</span>
      <span className={`block text-[11px] font-semibold ${checked ? 'text-orange-100' : 'text-slate-400'}`}>
        Plats du midi et du soir avec au moins un produit de saison, aucun hors saison.
      </span>
    </span>
    <span className={`text-xs font-bold tabular-nums shrink-0 ${checked ? 'text-orange-100' : 'text-slate-400'}`}>
      {count}
    </span>
  </button>
);
