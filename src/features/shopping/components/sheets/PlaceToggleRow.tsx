import { Loader2 } from 'lucide-react';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface PlaceToggleRowProps {
    itemKey: string;
    placeName: string;
    flagged: boolean;
    onToggle: (key: string) => void;
}

export const PlaceToggleRow = ({ itemKey, placeName, flagged, onToggle }: PlaceToggleRowProps) => {
    const pending = usePendingKey(`shopping-place:${itemKey}`);

    return (
        <button
            type="button"
            role="switch"
            aria-checked={flagged}
            disabled={pending}
            onClick={() => onToggle(itemKey)}
            className="flex items-center justify-between gap-3 w-full px-3.5 py-3 rounded-2xl bg-subtle text-left text-[15px] font-semibold text-slate-900 disabled:opacity-60"
        >
            À acheter à {placeName}
            {pending ? (
                <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
            ) : (
                <span className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${flagged ? 'bg-orange-500' : 'bg-strong'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${flagged ? 'translate-x-4' : ''}`} />
                </span>
            )}
        </button>
    );
};
