import { PlaceFilter } from '../../../core/logic/shopping/shoppingPlaceLogic';

export interface PlaceFilterControlProps {
    value: PlaceFilter;
    placeName: string;
    onChange: (value: PlaceFilter) => void;
}

const buttonClass = (selected: boolean) =>
    `px-3.5 py-1.5 rounded-xl text-sm font-bold text-center truncate transition-all ${
        selected ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`;

export const PlaceFilterControl = ({ value, placeName, onChange }: PlaceFilterControlProps) => {
    const options: { id: PlaceFilter; label: string }[] = [
        { id: 'all', label: 'Tout' },
        { id: 'place', label: placeName },
        { id: 'elsewhere', label: 'Ailleurs' },
    ];
    return (
        <div role="radiogroup" aria-label="Lieu d'achat" className="grid grid-cols-3 gap-0.5 sm:flex">
            {options.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={value === option.id}
                    onClick={() => onChange(option.id)}
                    className={buttonClass(value === option.id)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};
