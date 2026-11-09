import { Loader2, MapPin } from 'lucide-react';
import { usePendingKey } from '../../../../shared/hooks/usePendingKey';

export interface PlaceFlagButtonProps {
    itemKey: string;
    placeName: string;
    flagged: boolean;
    onToggle: (key: string) => void;
}

export const PlaceFlagButton = ({ itemKey, placeName, flagged, onToggle }: PlaceFlagButtonProps) => {
    const pending = usePendingKey(`shopping-place:${itemKey}`);
    const label = flagged ? `Ne plus acheter à ${placeName}` : `À acheter à ${placeName}`;

    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={flagged}
            disabled={pending}
            onClick={(e) => { e.stopPropagation(); onToggle(itemKey); }}
            className={flagged
                ? 'shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] font-bold disabled:opacity-60'
                : 'shrink-0 p-0.5 rounded text-slate-300 hover:text-orange-500 transition-colors disabled:opacity-60'}
        >
            {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
            {flagged && <span className="max-w-24 truncate">{placeName}</span>}
        </button>
    );
};
