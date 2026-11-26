import { ShoppingView } from '../../../../core/domain/shopping';

export interface ShoppingViewToggleProps {
    view: ShoppingView;
    onChange: (view: ShoppingView) => void;
}

const VIEWS: { id: ShoppingView; label: string }[] = [
    { id: 'all', label: 'Tout' },
    { id: 'toBuy', label: 'À acheter' },
];

export const ShoppingViewToggle = ({ view, onChange }: ShoppingViewToggleProps) => (
    <div role="radiogroup" aria-label="Lignes affichées" className="flex gap-1 p-1 rounded-xl bg-muted lg:w-56">
        {VIEWS.map(({ id, label }) => (
            <button
                key={id}
                type="button"
                role="radio"
                aria-checked={view === id}
                onClick={() => onChange(id)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${view === id ? 'bg-surface text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                {label}
            </button>
        ))}
    </div>
);
