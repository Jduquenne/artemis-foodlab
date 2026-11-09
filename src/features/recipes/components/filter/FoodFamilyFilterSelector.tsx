import { FoodGroup } from '../../../../core/domain/foodGroup';

export interface FoodFamilyFilterSelectorProps {
    families: readonly FoodGroup[];
    counts: ReadonlyMap<string, number>;
    value: string | null;
    onChange: (foodGroupId: string | null) => void;
}

export const FoodFamilyFilterSelector = ({ families, counts, value, onChange }: FoodFamilyFilterSelectorProps) => (
    <div role="radiogroup" aria-label="Famille d'aliments" className="flex flex-wrap gap-2">
        {families.map((family) => {
            const selected = value === family.id;
            return (
                <button
                    key={family.id}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(selected ? null : family.id)}
                    className={[
                        'flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-sm font-bold transition-colors',
                        selected
                            ? 'bg-orange-500 border-orange-400 text-white shadow-sm'
                            : 'bg-surface border-slate-200 text-slate-600 hover:bg-muted',
                    ].join(' ')}
                >
                    <span>{family.name}</span>
                    <span className={`text-[11px] font-semibold tabular-nums ${selected ? 'text-orange-100' : 'text-slate-400'}`}>
                        {counts.get(family.id) ?? 0}
                    </span>
                </button>
            );
        })}
    </div>
);
