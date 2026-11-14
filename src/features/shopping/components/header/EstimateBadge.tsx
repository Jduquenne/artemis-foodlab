import { formatEuro } from '../../../../core/logic/price/priceLogic';

export interface EstimateBadgeProps {
    total: number;
    missingCount: number;
    onOpen: () => void;
}

export const EstimateBadge = ({ total, missingCount, onOpen }: EstimateBadgeProps) => {
    const partial = missingCount > 0;
    const label = partial
        ? `Estimation ${formatEuro(total)}, incomplète : ${missingCount} article${missingCount > 1 ? 's' : ''} sans prix`
        : `Estimation ${formatEuro(total)}`;

    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label={label}
            title={label}
            className={`ml-2 inline-flex items-center gap-1 align-middle px-2 py-0.5 rounded-full text-[13px] font-extrabold tabular-nums transition-colors ${partial
                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100'
                : 'bg-muted text-slate-900 hover:bg-strong'
                }`}
        >
            ≈ {formatEuro(total)}
            {partial && <span className="grid place-items-center w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[10px] leading-none">!</span>}
        </button>
    );
};
