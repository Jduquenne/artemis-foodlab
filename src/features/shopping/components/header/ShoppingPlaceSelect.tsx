import { useRef, useState } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import { PlaceFilter } from '../../../../core/logic/shopping/shoppingPlaceLogic';
import { FloatingMenu } from '../../../../shared/components/ui/FloatingMenu';

export interface ShoppingPlaceSelectProps {
    placeName: string;
    value: PlaceFilter;
    onChange: (value: PlaceFilter) => void;
}

const placeLabel = (value: PlaceFilter, placeName: string) =>
    value === 'place' ? placeName : value === 'elsewhere' ? 'Ailleurs' : 'Partout';

export const ShoppingPlaceSelect = ({ placeName, value, onChange }: ShoppingPlaceSelectProps) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);
    const options: PlaceFilter[] = ['all', 'place', 'elsewhere'];

    return (
        <>
            <button
                ref={anchorRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Où j'achète"
                className={`shrink-0 flex items-center gap-1.5 h-10 px-3 rounded-xl border shadow-sm text-sm font-bold transition-colors lg:h-9 lg:text-[13px] ${value === 'all' ? 'border-slate-200 bg-surface text-slate-500 hover:text-slate-800' : 'border-orange-300 bg-orange-50 dark:bg-orange-900/30 text-orange-600'}`}
            >
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline truncate max-w-32">{placeLabel(value, placeName)}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>
            <FloatingMenu open={open} anchorRef={anchorRef} onClose={() => setOpen(false)} className="p-1.5">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        role="menuitemradio"
                        aria-checked={value === option}
                        onClick={() => { setOpen(false); onChange(option); }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 hover:bg-subtle"
                    >
                        {placeLabel(option, placeName)}
                        {value === option && <Check className="w-4 h-4 text-orange-500" />}
                    </button>
                ))}
            </FloatingMenu>
        </>
    );
};
